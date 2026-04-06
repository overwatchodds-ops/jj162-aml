import { S, save } from '../state/index.js';

export function screen() {
  if (!S._clientDraft) S._clientDraft = {};
  const d = S._clientDraft;
  if (!d.individuals || d.individuals.length === 0) d.individuals = [{ id: Date.now(), name:'', role:'' }];
  const entityType = d.entityType || 'Individual / Sole Trader';
  const inds = d.individuals;
  const hasScreeningHit = inds.some(i => i.screenResult === 'PEP' || i.screenResult === 'Sanctions');
  const screenHit = hasScreeningHit ? (inds.find(i=>i.screenResult==='PEP'||i.screenResult==='Sanctions')?.screenResult) : null;
  const autoRisk = autoClientRiskRating(entityType, d.service, screenHit, {
    offshoreJurisdiction: d.offshoreJurisdiction,
    complexStructure:     d.complexStructure,
    pepAmongControllers:  d.pepAmongControllers,
    cashIntensiveIndustry:d.cashIntensiveIndustry,
  });
  const guidance = ROLE_GUIDANCE[entityType] || ROLE_GUIDANCE['Other'];

  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div class="flex items-center gap-4 flex-wrap">
        <button onclick="go('clients')" class="text-slate-400 hover:text-slate-600 text-sm">← Client Register</button>
        <h1 class="text-2xl font-bold">${S._clientEditIdx !== undefined ? 'Edit Client — '+(S.clients[S._clientEditIdx]?.name||'') : 'New Client'}</h1>
        ${S._clientEditIdx !== undefined ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
      </div>
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">CDD must be completed <strong>before</strong> providing a designated service — obligation applies from 1 July 2026.<span onclick="var t=document.getElementById('cdd-why-tip');t.style.display=t.style.display==='block'?'none':'block'" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#6366f1;color:#fff;font-size:9px;font-weight:700;cursor:pointer;flex-shrink:0;">i</span></div>
      <div id="cdd-why-tip" style="display:none;" class="bg-slate-800 text-slate-200 rounded-xl p-4 text-xs leading-relaxed space-y-3">
        <div class="font-bold text-indigo-300">⚠ Customer Due Diligence (CDD) Requirement</div>
        <div>
          <div class="font-semibold text-white mb-1">New Client Onboarding</div>
          <p>You must complete initial CDD <strong class="text-white">before</strong> providing any designated service. This includes verifying:</p>
          <ul class="mt-1 space-y-0.5 pl-3">
            <li>· Identity of the client (company, trust, or SMSF)</li>
            <li>· Beneficial owners and controlling persons</li>
            <li>· Risk factors (PEPs, sanctions, high-risk jurisdictions)</li>
            <li>· Source of funds / purpose of service</li>
          </ul>
        </div>
        <div>
          <div class="font-semibold text-white mb-1">Existing Clients (before 1 July 2026)</div>
          <p>Transitional rules apply — you may complete full Tranche 2 CDD progressively, based on client risk.</p>
        </div>
        <p class="border-t border-slate-600 pt-2 text-slate-400">This step is mandatory for all new clients from 1 July 2026. Failing to complete CDD before providing a designated service may breach AML/CTF obligations.</p>
      </div>

      <!-- PART A: CUSTOMER INFORMATION (CDD) -->
      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Part A — Customer Information (CDD)</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2"><label class="text-xs text-slate-500">Entity / trading name *</label><input id="cl-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="e.g. Acme Holdings Pty Ltd"></div>
          <div><label class="text-xs text-slate-500">Entity type</label>
            <select id="cl-type" class="inp mt-1" onchange="updateClientDraft('entityType',this.value)">
              ${['Individual / Sole Trader','Private Company','Partnership','Trust','SMSF','Other'].map(o=>`<option ${entityType===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label class="text-xs text-slate-500">Designated service provided</label>
            <select id="cl-service" class="inp mt-1" onchange="updateClientDraft('service',this.value)">
              <option value="">— Select the service your firm is providing —</option>
              ${DS_LIST.map(ds=>`<option value="${ds.id}" ${d.service===ds.id?'selected':''}>${ds.name}</option>`).join('')}
            </select>
            <p class="text-xs text-slate-400 mt-1">Select the specific designated service from your AML/CTF Risk Assessment. If unsure, refer to your designated services in step 2.</p>
          </div>
        </div>
        ${entityPartA(d)}
      </div>

      <!-- PART B: ML/TF RISK ASSESSMENT -->
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Part B — ML/TF Risk Assessment</h2>
        <p class="text-xs text-slate-400">Risk rating derived from customer type, designated service, industry, geography and screening results.</p>
        <div><label class="text-xs text-slate-500">Purpose of relationship</label>
          <input id="cl-purpose" type="text" class="inp mt-1" value="${d.purpose||''}" placeholder="e.g. Tax compliance & advisory, company formation, trust administration">
        </div>
        <div class="border rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auto-suggested rating</span>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-3 py-1 rounded-full ${autoRisk==='High'?'bg-red-100 text-red-700':autoRisk==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${autoRisk}</span>
              ${!d.riskOverride ? `<button type="button" onclick="startClientRiskOverride()" class="text-xs text-indigo-500 hover:text-indigo-700 underline">Override</button>` : ''}
            </div>
          </div>
          ${d.riskOverride ? `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-amber-700">Override: <span class="px-2 py-0.5 rounded-full ${d.riskOverride==='High'?'bg-red-100 text-red-700':d.riskOverride==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${d.riskOverride}</span></span>
                <button type="button" onclick="clearClientRiskOverride()" class="text-xs text-slate-400 hover:text-red-500">Remove</button>
              </div>
              <textarea class="inp mt-1 text-xs" rows="2" placeholder="Justification required..." onchange="updateClientDraft('riskJust',this.value)">${d.riskJust||''}</textarea>
            </div>` : ''}
          <p class="text-xs text-slate-400 italic">Derived from entity type, designated service, and risk flags. Screening hits will escalate this rating.</p>
        </div>
      </div>

      <!-- PART C: BENEFICIAL OWNERS, CONTROLLERS & REPRESENTATIVES -->
      <div class="bg-white border rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Part C — Beneficial Owners, Controllers &amp; Representatives</h2>
          <button onclick="addIndividual()" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add person</button>
        </div>
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">${guidance.note}</div>
        <div id="individuals-list">
          ${inds.map((ind,i) => individualHTML(ind, i, guidance.roles)).join('')}
        </div>
      </div>

      <!-- PART D: CDD COMPLETION DECLARATION -->
      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Part D — CDD Completion Declaration</h2>
        <p class="text-xs text-slate-400">This declaration confirms that all required CDD steps have been completed before the designated service is provided to this customer.</p>
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" id="cl-tipping" ${d.tippingAck?'checked':''} class="mt-0.5 flex-shrink-0">
            <span class="text-sm text-green-800 leading-relaxed">I confirm that customer due diligence, identity verification, and sanctions/PEP screening have been completed before providing the designated service to this customer.</span>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-slate-500">CDD completed date</label><input id="cl-cdd-date-field" type="date" class="inp mt-1" value="${d.cddDate||new Date().toISOString().split('T')[0]}"></div>
          <div><label class="text-xs text-slate-500">Completed by (staff member)</label>
            <select id="cl-cdd-by" class="inp mt-1">
              <option value="">— Select staff member —</option>
              ${S.staff.filter(st=>!st.status||st.status==='Active'||st.status==='On Leave').map(st=>`<option value="${st.name}" ${d.cddBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button onclick="go('clients')" class="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onclick="saveClient()" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Client Record</button>
      </div>
    </div>`;

function individualHTML(ind, i, roles) {
  roles = roles || ['Director','Beneficial Owner','Trustee','Partner','Sole Trader','Authorised Representative','Settlor','Appointor','Beneficiary','Member','Other'];
  return `
    <div class="border rounded-xl p-4 space-y-3 mb-3" id="ind-${ind.id}">
      <div class="flex items-center justify-between">
        <div class="text-xs font-bold text-slate-500 uppercase">Person ${i+1}</div>
        ${i > 0 ? `<button onclick="removeIndividual(${ind.id})" class="text-xs text-red-400 hover:text-red-600">Remove</button>` : ''}
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-slate-500">Legal name *</label><input type="text" class="inp mt-1" value="${ind.name||''}" placeholder="Full legal name" oninput="updateIndividual(${ind.id},'name',this.value)"></div>
        <div><label class="text-xs text-slate-500">Role / connection *</label>
          <select class="inp mt-1" onchange="updateIndividual(${ind.id},'role',this.value)">
            <option value="">— Select —</option>
            ${roles.map(o=>`<option ${ind.role===o?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>
        <div><label class="text-xs text-slate-500">Ownership / control %</label><input type="text" class="inp mt-1" value="${ind.ownership||''}" placeholder="e.g. 50%, 100%" oninput="updateIndividual(${ind.id},'ownership',this.value)"></div>
        <div><label class="text-xs text-slate-500">Country of residence</label><input type="text" class="inp mt-1" value="${ind.country||'Australia'}" oninput="updateIndividual(${ind.id},'country',this.value)"></div>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-3">
        <div class="text-xs font-bold text-blue-700">Part 1 — Identity verification</div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="text-xs text-slate-500">Date of birth</label><input type="date" class="inp mt-1" value="${ind.dob||''}" onchange="updateIndividual(${ind.id},'dob',this.value)"></div>
          <div><label class="text-xs text-slate-500">Residential address</label><input type="text" class="inp mt-1" value="${ind.address||''}" placeholder="12 Main St, Sydney NSW" oninput="updateIndividual(${ind.id},'address',this.value)"></div>
          <div><label class="text-xs text-slate-500">ID type</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idType',this.value)">
              <option value="">— Select —</option>
              ${['Passport','Driver\u0027s Licence','Medicare Card','Birth Certificate','Other'].map(o=>`<option ${ind.idType===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label class="text-xs text-slate-500">ID number</label><input type="text" class="inp mt-1" value="${ind.idNumber||''}" placeholder="PA1234567" oninput="updateIndividual(${ind.id},'idNumber',this.value)" style="font-family:monospace;font-size:12px"></div>
          <div><label class="text-xs text-slate-500">Country of issue</label><input type="text" class="inp mt-1" value="${ind.idCountry||'Australia'}" oninput="updateIndividual(${ind.id},'idCountry',this.value)"></div>
          <div><label class="text-xs text-slate-500">Verification method</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idMethod',this.value)">
              ${['Original sighted','Certified copy','Electronic verification'].map(o=>`<option ${ind.idMethod===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label class="text-xs text-slate-500">Date verified</label><input type="date" class="inp mt-1" value="${ind.idDate||''}" onchange="updateIndividual(${ind.id},'idDate',this.value)"></div>
          <div><label class="text-xs text-slate-500">Verified by (staff member)</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idBy',this.value)">
              <option value="">— Select staff member —</option>
              ${S.staff.filter(st=>!st.status||st.status==='Active'||st.status==='On Leave').map(st=>`<option value="${st.name}" ${ind.idBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
            </select>
          </div>
          <div class="col-span-2"><label class="text-xs text-slate-500">Verification outcome</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idOutcome',this.value)">
              <option value="">— Select —</option>
              <option ${ind.idOutcome==='Verified'?'selected':''} value="Verified">Verified — identity confirmed</option>
              <option ${ind.idOutcome==='Unable to verify'?'selected':''} value="Unable to verify">Unable to verify — escalate to AMLCO</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-green-50 border border-green-100 rounded-xl p-3 space-y-3">
        <div class="text-xs font-bold text-green-700 uppercase tracking-wide">Part 2 — Sanctions / PEP screening — required before providing the designated service</div>
        <p class="text-xs text-slate-500">Screen this person against sanctions lists and PEP databases before providing any service.</p>
        <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" class="flex items-stretch rounded-xl overflow-hidden no-underline">
          <div class="flex-1 bg-slate-800 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-semibold">Screen ${ind.name||'this person'} via NameScan</div>
          <div class="bg-cyan-500 text-white px-4 py-2.5 text-xs font-semibold whitespace-nowrap">NameScan →</div>
        </a>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="text-xs text-slate-500">Provider</label><input type="text" class="inp mt-1" value="${ind.screenProvider||'NameScan'}" oninput="updateIndividual(${ind.id},'screenProvider',this.value)"></div>
          <div><label class="text-xs text-slate-500">Date screened</label><input type="date" class="inp mt-1" value="${ind.screenDate||''}" onchange="updateIndividual(${ind.id},'screenDate',this.value)"></div>
          <div><label class="text-xs text-slate-500">Result</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'screenResult',this.value)">
              <option value="">— Select —</option>
              <option ${ind.screenResult==='Clear'?'selected':''} value="Clear">Clear — no matches</option>
              <option ${ind.screenResult==='PEP'?'selected':''} value="PEP">PEP match — escalate to AMLCO</option>
              <option ${ind.screenResult==='Sanctions'?'selected':''} value="Sanctions">Sanctions match — do not proceed</option>
              <option ${ind.screenResult==='Adverse'?'selected':''} value="Adverse">Adverse media — review required</option>
            </select>
          </div>
          <div><label class="text-xs text-slate-500">Scan / reference ID</label><input type="text" class="inp mt-1" value="${ind.screenRef||''}" placeholder="NSC-2026-XXXXX" oninput="updateIndividual(${ind.id},'screenRef',this.value)" style="font-family:monospace;font-size:12px"></div>
        </div>
        ${ind.screenResult==='PEP'||ind.screenResult==='Sanctions' ? `
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-semibold">
          ${ind.screenResult==='Sanctions' ? '⛔ Sanctions match — do not proceed. Contact AMLCO immediately.' : '⚠️ PEP match — enhanced CDD required. Escalate to AMLCO before proceeding.'}
        </div>` : ''}
      </div>
    </div>`;
}

// ADD SERVICE
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function individualHTML(ind, i, roles) {
  roles = roles || ['Director','Beneficial Owner','Trustee','Partner','Sole Trader','Authorised Representative','Settlor','Appointor','Beneficiary','Member','Other'];
  return `
    <div class="border rounded-xl p-4 space-y-3 mb-3" id="ind-${ind.id}">
      <div class="flex items-center justify-between">
        <div class="text-xs font-bold text-slate-500 uppercase">Person ${i+1}</div>
        ${i > 0 ? `<button onclick="removeIndividual(${ind.id})" class="text-xs text-red-400 hover:text-red-600">Remove</button>` : ''}
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-slate-500">Legal name *</label><input type="text" class="inp mt-1" value="${ind.name||''}" placeholder="Full legal name" oninput="updateIndividual(${ind.id},'name',this.value)"></div>
        <div><label class="text-xs text-slate-500">Role / connection *</label>
          <select class="inp mt-1" onchange="updateIndividual(${ind.id},'role',this.value)">
            <option value="">— Select —</option>
            ${roles.map(o=>`<option ${ind.role===o?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>
        <div><label class="text-xs text-slate-500">Ownership / control %</label><input type="text" class="inp mt-1" value="${ind.ownership||''}" placeholder="e.g. 50%, 100%" oninput="updateIndividual(${ind.id},'ownership',this.value)"></div>
        <div><label class="text-xs text-slate-500">Country of residence</label><input type="text" class="inp mt-1" value="${ind.country||'Australia'}" oninput="updateIndividual(${ind.id},'country',this.value)"></div>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-3">
        <div class="text-xs font-bold text-blue-700">Part 1 — Identity verification</div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="text-xs text-slate-500">Date of birth</label><input type="date" class="inp mt-1" value="${ind.dob||''}" onchange="updateIndividual(${ind.id},'dob',this.value)"></div>
          <div><label class="text-xs text-slate-500">Residential address</label><input type="text" class="inp mt-1" value="${ind.address||''}" placeholder="12 Main St, Sydney NSW" oninput="updateIndividual(${ind.id},'address',this.value)"></div>
          <div><label class="text-xs text-slate-500">ID type</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idType',this.value)">
              <option value="">— Select —</option>
              ${['Passport','Driver\u0027s Licence','Medicare Card','Birth Certificate','Other'].map(o=>`<option ${ind.idType===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label class="text-xs text-slate-500">ID number</label><input type="text" class="inp mt-1" value="${ind.idNumber||''}" placeholder="PA1234567" oninput="updateIndividual(${ind.id},'idNumber',this.value)" style="font-family:monospace;font-size:12px"></div>
          <div><label class="text-xs text-slate-500">Country of issue</label><input type="text" class="inp mt-1" value="${ind.idCountry||'Australia'}" oninput="updateIndividual(${ind.id},'idCountry',this.value)"></div>
          <div><label class="text-xs text-slate-500">Verification method</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idMethod',this.value)">
              ${['Original sighted','Certified copy','Electronic verification'].map(o=>`<option ${ind.idMethod===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label class="text-xs text-slate-500">Date verified</label><input type="date" class="inp mt-1" value="${ind.idDate||''}" onchange="updateIndividual(${ind.id},'idDate',this.value)"></div>
          <div><label class="text-xs text-slate-500">Verified by (staff member)</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idBy',this.value)">
              <option value="">— Select staff member —</option>
              ${S.staff.filter(st=>!st.status||st.status==='Active'||st.status==='On Leave').map(st=>`<option value="${st.name}" ${ind.idBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
            </select>
          </div>
          <div class="col-span-2"><label class="text-xs text-slate-500">Verification outcome</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idOutcome',this.value)">
              <option value="">— Select —</option>
              <option ${ind.idOutcome==='Verified'?'selected':''} value="Verified">Verified — identity confirmed</option>
              <option ${ind.idOutcome==='Unable to verify'?'selected':''} value="Unable to verify">Unable to verify — escalate to AMLCO</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-green-50 border border-green-100 rounded-xl p-3 space-y-3">
        <div class="text-xs font-bold text-green-700 uppercase tracking-wide">Part 2 — Sanctions / PEP screening — required before providing the designated service</div>
        <p class="text-xs text-slate-500">Screen this person against sanctions lists and PEP databases before providing any service.</p>
        <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" class="flex items-stretch rounded-xl overflow-hidden no-underline">
          <div class="flex-1 bg-slate-800 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-semibold">Screen ${ind.name||'this person'} via NameScan</div>
          <div class="bg-cyan-500 text-white px-4 py-2.5 text-xs font-semibold whitespace-nowrap">NameScan →</div>
        </a>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="text-xs text-slate-500">Provider</label><input type="text" class="inp mt-1" value="${ind.screenProvider||'NameScan'}" oninput="updateIndividual(${ind.id},'screenProvider',this.value)"></div>
          <div><label class="text-xs text-slate-500">Date screened</label><input type="date" class="inp mt-1" value="${ind.screenDate||''}" onchange="updateIndividual(${ind.id},'screenDate',this.value)"></div>
          <div><label class="text-xs text-slate-500">Result</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'screenResult',this.value)">
              <option value="">— Select —</option>
              <option ${ind.screenResult==='Clear'?'selected':''} value="Clear">Clear — no matches</option>
              <option ${ind.screenResult==='PEP'?'selected':''} value="PEP">PEP match — escalate to AMLCO</option>
              <option ${ind.screenResult==='Sanctions'?'selected':''} value="Sanctions">Sanctions match — do not proceed</option>
              <option ${ind.screenResult==='Adverse'?'selected':''} value="Adverse">Adverse media — review required</option>
            </select>
          </div>
          <div><label class="text-xs text-slate-500">Scan / reference ID</label><input type="text" class="inp mt-1" value="${ind.screenRef||''}" placeholder="NSC-2026-XXXXX" oninput="updateIndividual(${ind.id},'screenRef',this.value)" style="font-family:monospace;font-size:12px"></div>
        </div>
        ${ind.screenResult==='PEP'||ind.screenResult==='Sanctions' ? `
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-semibold">
          ${ind.screenResult==='Sanctions' ? '⛔ Sanctions match — do not proceed. Contact AMLCO immediately.' : '⚠️ PEP match — enhanced CDD required. Escalate to AMLCO before proceeding.'}
        </div>` : ''}
      </div>
    </div>`;
}

// ADD SERVICE

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.updateClientDraftCheck = function(key, val) {
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft[key] = val;
  // Risk flags trigger re-render to update auto rating
  const riskFlags = ['offshoreJurisdiction','complexStructure','pepAmongControllers','cashIntensiveIndustry'];
  if (riskFlags.includes(key)) go('newclient');
};
function snapshotClientDraft() {
  if (!S._clientDraft) S._clientDraft = {};
  const grab = (id) => { const el = document.getElementById(id); return el ? el.value : undefined; };
  const grabCb = (id) => { const el = document.getElementById(id); return el ? el.checked : undefined; };
  const fields = [
    'cl-name','cl-purpose','cl-abn','cl-acn','cl-reg-address','cl-business-address',
    'cl-jurisdiction','cl-inc-date','cl-industry','cl-source-funds','cl-structure-notes',
    'cl-doc-location','cl-trust-name','cl-trust-type','cl-trust-purpose','cl-trustee-type',
    'cl-cdd-by'
  ];
  const draftKeys = [
    'name','purpose','abn','acn','regAddress','businessAddress',
    'jurisdiction','incDate','industry','sourceFunds','structureNotes',
    'docLocation','trustName','trustType','trustPurpose','trusteeType',
    'cddBy'
  ];
  fields.forEach((id, i) => { const v = grab(id); if (v !== undefined) S._clientDraft[draftKeys[i]] = v; });
  const cbs = [
    ['cl-abn-checked','abnChecked'],['cl-registry-checked','registryChecked'],
    ['cl-deed-sighted','deedSighted'],['cl-abn-checked2','fundActive'],['cl-tipping','tippingAck']
  ];
  cbs.forEach(([id, key]) => { const v = grabCb(id); if (v !== undefined) S._clientDraft[key] = v; });
}
window.updateClientDraft = function(key, val) {
  if (!S._clientDraft) S._clientDraft = {};
  snapshotClientDraft();
  S._clientDraft[key] = val;
  // Re-render to update auto risk rating when entity type or service changes
  if (key === 'entityType' || key === 'service') go('newclient');
};
window.startClientRiskOverride = function() {
  const current = S._clientDraft?.riskOverride || null;
  const val = prompt('Override risk rating (Low / Medium / High).\n\nNote: An auditor will scrutinise any downgrade. A justification is required.');
  if (!val) return;
  const clean = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  if (!['Low','Medium','High'].includes(clean)) { alert('Please enter Low, Medium or High'); return; }
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft.riskOverride = clean;
  go('newclient');
};
window.clearClientRiskOverride = function() {
  if (S._clientDraft) { delete S._clientDraft.riskOverride; delete S._clientDraft.riskJust; }
  go('newclient');
};
window.addIndividual = function() {
  if (!S._clientDraft) S._clientDraft = {};
  if (!S._clientDraft.individuals) S._clientDraft.individuals = [{ id: Date.now(), name:'', role:'' }];
  S._clientDraft.individuals.push({ id: Date.now() + 1, name:'', role:'' });
  go('newclient');
};
window.removeIndividual = function(id) {
  if (!S._clientDraft?.individuals) return;
  S._clientDraft.individuals = S._clientDraft.individuals.filter(i => i.id !== id);
  go('newclient');
};
window.updateIndividual = function(id, field, val) {
  if (!S._clientDraft?.individuals) return;
  const ind = S._clientDraft.individuals.find(i => i.id === id);
  if (ind) ind[field] = val;
};
window.editClient = function(i) {
  const c = S.clients[i];
  if (!c) return;
  S._clientDraft = JSON.parse(JSON.stringify(c));
  S._clientEditIdx = i;
  go('newclient');
};
window.saveClient = window.saveClient = function() {
  if (!S._clientDraft) S._clientDraft = {};
  const name = document.getElementById('cl-name')?.value?.trim();
  if (!name) { toast('Entity name is required', 'err'); return; }
  const entityType = document.getElementById('cl-type')?.value||'';
  const service = document.getElementById('cl-service')?.value||'';
  const inds = S._clientDraft.individuals || [];
  const hasScreeningHit = inds.some(i => i.screenResult === 'PEP' || i.screenResult === 'Sanctions');
  const screenHitResult = hasScreeningHit ? (inds.find(i=>i.screenResult==='PEP'||i.screenResult==='Sanctions')?.screenResult) : null;
  const autoRisk = autoClientRiskRating(entityType, service, screenHitResult, {
    offshoreJurisdiction:  S._clientDraft.offshoreJurisdiction,
    complexStructure:      S._clientDraft.complexStructure,
    pepAmongControllers:   S._clientDraft.pepAmongControllers,
    cashIntensiveIndustry: S._clientDraft.cashIntensiveIndustry,
  });
  const effectiveRisk = S._clientDraft.riskOverride || autoRisk;
  // Collect all entity fields from DOM
  const grab = (id) => document.getElementById(id)?.value||'';
  const grabCb = (id) => document.getElementById(id)?.checked||false;
  const newRecord = {
    name, entityType, service,
    purpose:             grab('cl-purpose'),
    // Entity-specific fields
    abn:                 grab('cl-abn'),
    acn:                 grab('cl-acn'),
    regAddress:          grab('cl-reg-address'),
    businessAddress:     grab('cl-business-address'),
    jurisdiction:        grab('cl-jurisdiction'),
    incDate:             grab('cl-inc-date'),
    industry:            grab('cl-industry'),
    sourceFunds:         grab('cl-source-funds'),
    structureNotes:      grab('cl-structure-notes'),
    docLocation:         grab('cl-doc-location'),
    trustName:           grab('cl-trust-name'),
    trustType:           grab('cl-trust-type'),
    trusteeType:         grab('cl-trustee-type'),
    trustPurpose:        grab('cl-trust-purpose'),
    // Risk flags
    offshoreJurisdiction:  S._clientDraft.offshoreJurisdiction||false,
    complexStructure:      S._clientDraft.complexStructure||false,
    pepAmongControllers:   S._clientDraft.pepAmongControllers||false,
    cashIntensiveIndustry: S._clientDraft.cashIntensiveIndustry||false,
    // Attestation
    abnChecked:          grabCb('cl-abn-checked'),
    registryChecked:     grabCb('cl-registry-checked'),
    deedSighted:         grabCb('cl-deed-sighted'),
    fundActive:          grabCb('cl-abn-checked2'),
    // Risk
    risk:                effectiveRisk,
    riskOverride:        S._clientDraft.riskOverride||null,
    riskJust:            S._clientDraft.riskJust||'',
    // Monitoring
    ttr:                 'No',
    smr:                 'No',
    tippingAck:          grabCb('cl-tipping'),
    cddDate:             grab('cl-cdd-date-field') || S._clientDraft.cddDate || new Date().toISOString().split('T')[0],
    cddBy:               grab('cl-cdd-by') || '',
    updatedAt:           Date.now(),
    individuals:         inds
  };
  const editIdx = S._clientEditIdx;
  if (editIdx !== undefined && S.clients[editIdx]) {
    const old = JSON.parse(JSON.stringify(S.clients[editIdx]));
    // Preserve existing services array, update first entry service name if changed
    const existingServices = old.services || [];
    if (existingServices.length > 0 && newRecord.service) {
      existingServices[0].serviceName = newRecord.service;
      existingServices[0].dateProvided = existingServices[0].dateProvided || newRecord.cddDate;
    } else if (existingServices.length === 0 && newRecord.service) {
      existingServices.push({ serviceName: newRecord.service, dateProvided: newRecord.cddDate, newCddRequired: false });
    }
    newRecord.services = existingServices;
    const history = old.history || [];
    delete old.history;
    newRecord.history = [old, ...history];
    S.clients[editIdx] = newRecord;
    toast('Client record updated — previous version preserved');
  } else {
    newRecord.history = [];
    // Build initial services array from first service
    newRecord.services = newRecord.service ? [{ serviceName: newRecord.service, dateProvided: newRecord.cddDate, newCddRequired: false }] : [];
    S.clients.unshift(newRecord);
    toast('Client saved');
  }
  delete S._clientDraft; delete S._clientEditIdx;
  save(); go('clients');
};
