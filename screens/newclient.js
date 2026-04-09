import { S, DS_LIST, save } from '../state/index.js';
import { autoClientRiskRating } from '../logic/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

// ─── ROLE GUIDANCE ────────────────────────────────────────────────────────────
const ROLE_GUIDANCE = {
  'Individual / Sole Trader': { roles: ['Sole Trader','Authorised Representative'], note: 'Verify the individual\'s identity and screen for PEP/sanctions.' },
  'Private Company':  { roles: ['Director','Beneficial Owner (≥25%)','Secretary','Authorised Representative','Other'], note: 'Record all directors and anyone who owns or controls ≥25% of shares or voting rights.' },
  'Partnership':      { roles: ['Partner','Authorised Representative','Other'], note: 'Record all partners and any person with significant control.' },
  'Trust':            { roles: ['Trustee (Individual)','Trustee (Corporate)','Settlor','Appointor / Protector','Beneficiary (≥25% unit holder)','Beneficial Owner','Other'], note: 'Record the trustee(s), settlor, appointor/protector, and any unit holders ≥25%. For corporate trustees, also record their directors.' },
  'SMSF':             { roles: ['Trustee / Member','Corporate Trustee Director','Other'], note: 'Record all trustees and members. If a corporate trustee, also record its directors.' },
  'Other':            { roles: ['Director','Owner','Authorised Representative','Other'], note: 'Record all individuals who own, control, or can benefit from this entity.' },
};

// ─── ENTITY PART A ────────────────────────────────────────────────────────────
function entityPartA(d) {
  const t = d.entityType || 'Individual / Sole Trader';
  const f = (label, id, val, placeholder, type) =>
    `<div><label class="text-xs text-slate-500">${label}</label><input id="${id}" type="${type||'text'}" class="inp mt-1" value="${val||''}" placeholder="${placeholder||''}"></div>`;

  if (t === 'Individual / Sole Trader') return `
    <div class="grid grid-cols-2 gap-3">
      ${f('ABN (if sole trader)','cl-abn',d.abn,'12 345 678 901')}
      ${f('Occupation / industry','cl-industry',d.industry,'e.g. Plumber, Retail')}
      ${f('Residential / business address','cl-reg-address',d.regAddress,'12 Main St, Sydney NSW')}
      ${f('Source of funds','cl-source-funds',d.sourceFunds,'e.g. Business income, salary')}
    </div>`;

  if (t === 'Private Company' || t === 'Partnership') return `
    <div class="grid grid-cols-2 gap-3">
      ${f('ABN *','cl-abn',d.abn,'12 345 678 901')}
      ${f('ACN','cl-acn',d.acn,'123 456 789')}
      ${f('Registered address','cl-reg-address',d.regAddress,'123 Collins St, Melbourne VIC')}
      ${f('Principal place of business','cl-business-address',d.businessAddress,'(if different from registered)')}
      ${f('Jurisdiction of incorporation','cl-jurisdiction',d.jurisdiction,'e.g. Australia, Hong Kong')}
      ${f('Date of incorporation','cl-inc-date',d.incDate,'','date')}
      ${f('Industry / sector','cl-industry',d.industry,'e.g. Construction, Finance, Retail')}
      ${f('Source of funds / wealth','cl-source-funds',d.sourceFunds,'e.g. Operating revenue, investment')}
    </div>
    <div class="mt-3 space-y-2">
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-offshore" ${d.offshoreJurisdiction?'checked':''} onchange="updateClientDraftCheck('offshoreJurisdiction',this.checked)"> Offshore jurisdiction or foreign ownership involved</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-complex" ${d.complexStructure?'checked':''} onchange="updateClientDraftCheck('complexStructure',this.checked)"> Complex or multi-tiered ownership structure</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-cash" ${d.cashIntensiveIndustry?'checked':''} onchange="updateClientDraftCheck('cashIntensiveIndustry',this.checked)"> Cash-intensive industry (hospitality, retail, construction)</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-pep-ctrl" ${d.pepAmongControllers?'checked':''} onchange="updateClientDraftCheck('pepAmongControllers',this.checked)"> PEP identified among owners or directors</label>
    </div>
    <div class="mt-3">
      <label class="text-xs text-slate-500">Shareholding / ownership structure notes</label>
      <textarea id="cl-structure-notes" class="inp mt-1 text-xs" rows="2" placeholder="e.g. 100% owned by John Smith. No foreign ownership.">${d.structureNotes||''}</textarea>
    </div>
    <div class="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="updateClientDraftCheck('abnChecked',this.checked)"> ABN/ASIC registration confirmed via lookup</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-registry-checked" ${d.registryChecked?'checked':''} onchange="updateClientDraftCheck('registryChecked',this.checked)"> Share registry / company constitution sighted</label>
        <div><label class="text-xs text-slate-500">Supporting document storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Acme Holdings > CDD"></div>
      </div>
    </div>`;

  if (t === 'Trust') return `
    <div class="grid grid-cols-2 gap-3">
      ${f('Trust name *','cl-trust-name',d.trustName,'e.g. Smith Family Trust')}
      ${f('ABN / TFN','cl-abn',d.abn,'12 345 678 901')}
      <div><label class="text-xs text-slate-500">Trust type *</label>
        <select id="cl-trust-type" class="inp mt-1">
          ${['Discretionary / Family','Unit Trust','Hybrid','Charitable','Testamentary','Other'].map(o=>`<option ${d.trustType===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      ${f('Jurisdiction','cl-jurisdiction',d.jurisdiction,'e.g. Australia')}
      ${f('Source of funds / wealth','cl-source-funds',d.sourceFunds,'e.g. Investment income, property')}
      ${f('Purpose of relationship','cl-trust-purpose',d.trustPurpose,'e.g. Property holding, investment management')}
    </div>
    <div class="mt-3 space-y-2">
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-offshore" ${d.offshoreJurisdiction?'checked':''} onchange="updateClientDraftCheck('offshoreJurisdiction',this.checked)"> Offshore jurisdiction or foreign controllers involved</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-complex" ${d.complexStructure?'checked':''} onchange="updateClientDraftCheck('complexStructure',this.checked)"> Complex structure (e.g. corporate trustee with offshore ownership)</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-pep-ctrl" ${d.pepAmongControllers?'checked':''} onchange="updateClientDraftCheck('pepAmongControllers',this.checked)"> PEP identified among trustees, settlor or appointor</label>
    </div>
    <div class="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-deed-sighted" ${d.deedSighted?'checked':''} onchange="updateClientDraftCheck('deedSighted',this.checked)"> Trust deed sighted and reviewed</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="updateClientDraftCheck('abnChecked',this.checked)"> ABN / TFN confirmed</label>
        <div><label class="text-xs text-slate-500">Trust deed storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith Family Trust > CDD"></div>
      </div>
    </div>`;

  if (t === 'SMSF') return `
    <div class="grid grid-cols-2 gap-3">
      ${f('Fund name *','cl-trust-name',d.trustName,'e.g. Smith Superannuation Fund')}
      ${f('ABN *','cl-abn',d.abn,'12 345 678 901')}
      <div><label class="text-xs text-slate-500">Trustee type *</label>
        <select id="cl-trustee-type" class="inp mt-1">
          ${['Individual Trustees','Corporate Trustee'].map(o=>`<option ${d.trusteeType===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      ${f('Source of contributions','cl-source-funds',d.sourceFunds,'e.g. Salary sacrifice, rollover from another fund')}
    </div>
    <div class="mt-3 space-y-2">
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-complex" ${d.complexStructure?'checked':''} onchange="updateClientDraftCheck('complexStructure',this.checked)"> Unusual or complex investment arrangements</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-offshore" ${d.offshoreJurisdiction?'checked':''} onchange="updateClientDraftCheck('offshoreJurisdiction',this.checked)"> Foreign contributions or overseas assets</label>
    </div>
    <div class="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="updateClientDraftCheck('abnChecked',this.checked)"> ATO registration confirmed (ABN lookup)</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked2" ${d.fundActive?'checked':''} onchange="updateClientDraftCheck('fundActive',this.checked)"> Fund confirmed as active and compliant</label>
        <div><label class="text-xs text-slate-500">Supporting document storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith SMSF > CDD"></div>
      </div>
    </div>`;

  return `
    <div class="grid grid-cols-2 gap-3">
      ${f('ABN / registration number','cl-abn',d.abn,'')}
      ${f('Registered address','cl-reg-address',d.regAddress,'')}
      ${f('Jurisdiction','cl-jurisdiction',d.jurisdiction,'e.g. Australia')}
      ${f('Source of funds','cl-source-funds',d.sourceFunds,'')}
    </div>
    <div class="mt-3 space-y-2">
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-offshore" ${d.offshoreJurisdiction?'checked':''} onchange="updateClientDraftCheck('offshoreJurisdiction',this.checked)"> Offshore jurisdiction involved</label>
      <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-complex" ${d.complexStructure?'checked':''} onchange="updateClientDraftCheck('complexStructure',this.checked)"> Complex structure</label>
    </div>`;
}

// ─── INDIVIDUAL HTML ──────────────────────────────────────────────────────────
function individualHTML(ind, i, roles) {
  roles = roles || ['Director','Beneficial Owner','Trustee','Partner','Sole Trader','Authorised Representative','Settlor','Appointor','Beneficiary','Member','Other'];
  return `
    <div class="border border-slate-200 rounded-xl p-4 space-y-4 mb-3" id="ind-${ind.id}">
      <div class="flex items-center justify-between">
        <div class="text-xs font-semibold text-slate-500">Person ${i+1}</div>
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

      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <h2 class="text-sm font-bold text-slate-700">Part 1 — Identity verification</h2>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-slate-500">Date of birth</label><input type="date" class="inp mt-1" value="${ind.dob||''}" onchange="updateIndividual(${ind.id},'dob',this.value)"></div>
          <div><label class="text-xs text-slate-500">Residential address</label><input type="text" class="inp mt-1" value="${ind.address||''}" placeholder="12 Main St, Sydney NSW" oninput="updateIndividual(${ind.id},'address',this.value)"></div>
          <div><label class="text-xs text-slate-500">ID type</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'idType',this.value)">
              <option value="">— Select —</option>
              ${['Passport','Driver\'s Licence','Medicare Card','Birth Certificate','Other'].map(o=>`<option ${ind.idType===o?'selected':''}>${o}</option>`).join('')}
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
          <div><label class="text-xs text-slate-500">Verified by</label>
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

      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <h2 class="text-sm font-bold text-slate-700">Part 2 — Sanctions / PEP screening</h2>
        <p class="text-xs text-slate-400">Screen this person against sanctions lists and PEP databases before providing any designated service.</p>
        <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" class="flex items-stretch rounded-xl overflow-hidden no-underline">
          <div class="flex-1 bg-slate-800 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-semibold">Screen ${ind.name||'this person'} via NameScan</div>
          <div class="bg-cyan-500 text-white px-4 py-2.5 text-xs font-semibold whitespace-nowrap">NameScan →</div>
        </a>
        <div class="grid grid-cols-2 gap-3">
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
        <div class="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold">
          ${ind.screenResult==='Sanctions' ? '⛔ Sanctions match — do not proceed. Contact AMLCO immediately.' : '⚠ PEP match — enhanced CDD required. Escalate to AMLCO before proceeding.'}
        </div>` : ''}
      </div>
    </div>`;
}

// ─── SCREEN ───────────────────────────────────────────────────────────────────
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

  return `<div class="py-8 space-y-6">

    <div class="flex items-start gap-4 flex-wrap">
      <button onclick="go('clients')" class="text-slate-400 hover:text-slate-600 text-sm mt-1 flex-shrink-0">← Client Register</button>
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900">${S._clientEditIdx !== undefined ? 'Edit Client — '+(S.clients[S._clientEditIdx]?.name||'') : 'New Client (CDD)'}</h1>
          ${S._clientEditIdx !== undefined ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
        </div>
        <p class="text-sm text-slate-400 mt-1">CDD must be completed before providing any designated service — this record is your evidence that the obligation was met.</p>
      </div>
      ${infoBtn('cdd-how-tip')}
    </div>

    ${infoPop('cdd-how-tip', `
      <strong class="text-indigo-300 block mb-2">How to complete Customer Due Diligence</strong>
      <p>CDD has four parts — complete them in order before the designated service is provided:</p>
      <ul class="mt-2 space-y-1.5">
        <li>· <strong class="text-white">Part A</strong> — Customer information: entity details, structure, source of funds, and risk flags</li>
        <li>· <strong class="text-white">Part B</strong> — ML/TF risk rating: auto-calculated from entity type, service, and risk flags. Override only if your professional judgement differs.</li>
        <li>· <strong class="text-white">Part C</strong> — Beneficial owners and controllers: every individual who owns, controls, or can benefit from the entity. Each person requires identity verification (Part 1) and sanctions/PEP screening (Part 2).</li>
        <li>· <strong class="text-white">Part D</strong> — Completion declaration: confirmed by the staff member responsible.</li>
      </ul>
      <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Transitional rules apply for existing clients before 1 July 2026 — full CDD can be completed progressively based on client risk. New clients from 1 July 2026 require full CDD before service.</p>
    `)}

    <!-- PART A -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Part A — Customer Information</h2>
        ${infoBtn('parta-tip')}
      </div>
      ${infoPop('parta-tip', `
        <strong class="text-indigo-300 block mb-2">What to record in Part A</strong>
        <p>Part A captures the identity of the entity your firm is acting for. Fields change based on entity type — select the correct type first.</p>
        <p class="mt-2">For companies and trusts, you must also identify and record risk flags: offshore ownership, complex structures, cash-intensive industries, and any PEPs among controllers. These flags feed directly into the ML/TF risk rating in Part B.</p>
      `)}
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
          <p class="text-xs text-slate-400 mt-1">Select the specific designated service from your Designated Services assessment.</p>
        </div>
      </div>
      ${entityPartA(d)}
    </div>

    <!-- PART B -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Part B — ML/TF Risk Assessment</h2>
        ${infoBtn('partb-tip')}
      </div>
      ${infoPop('partb-tip', `
        <strong class="text-indigo-300 block mb-2">How the risk rating is calculated</strong>
        <p>The risk rating is derived automatically from the entity type, designated service, risk flags ticked in Part A, and any PEP or sanctions hits from screening in Part C.</p>
        <p class="mt-2">You can override the rating if your professional judgement differs — but a written justification is required for audit purposes. AUSTRAC will scrutinise any downgrade, particularly for higher-risk entity types.</p>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">High-risk clients require enhanced CDD, more frequent review, and may require senior manager sign-off before the service is provided.</p>
      `)}
      <p class="text-xs text-slate-400">Risk rating is derived from entity type, designated service, and risk flags. Screening hits in Part C will escalate this rating automatically.</p>
      <div><label class="text-xs text-slate-500">Purpose of relationship</label>
        <input id="cl-purpose" type="text" class="inp mt-1" value="${d.purpose||''}" placeholder="e.g. Tax compliance & advisory, company formation, trust administration">
      </div>
      <div class="border border-slate-200 rounded-xl p-4 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auto-suggested rating</span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-3 py-1 rounded-full ${autoRisk==='High'?'bg-red-100 text-red-700':autoRisk==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${autoRisk}</span>
            ${!d.riskOverride ? `<button type="button" onclick="startClientRiskOverride()" class="text-xs text-indigo-500 hover:text-indigo-700 underline">Override</button>` : ''}
          </div>
        </div>
        ${d.riskOverride ? `
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-700">Override: <span class="px-2 py-0.5 rounded-full ${d.riskOverride==='High'?'bg-red-100 text-red-700':d.riskOverride==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${d.riskOverride}</span></span>
            <button type="button" onclick="clearClientRiskOverride()" class="text-xs text-slate-400 hover:text-red-500">Remove</button>
          </div>
          <textarea class="inp mt-1 text-xs" rows="2" placeholder="Justification required for audit trail..." onchange="updateClientDraft('riskJust',this.value)">${d.riskJust||''}</textarea>
        </div>` : ''}
        <p class="text-xs text-slate-400 italic">Derived from entity type, designated service, and risk flags. Screening hits will escalate this rating.</p>
      </div>
    </div>

    <!-- PART C -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-slate-700">Part C — Beneficial Owners, Controllers &amp; Representatives</h2>
          ${infoBtn('partc-tip')}
        </div>
        <button onclick="addIndividual()" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex-shrink-0 ml-4">+ Add person</button>
      </div>
      ${infoPop('partc-tip', `
        <strong class="text-indigo-300 block mb-2">Who must be recorded in Part C</strong>
        <p>AUSTRAC requires you to identify and verify every individual who owns, controls, or can benefit from the entity. The threshold is:</p>
        <ul class="mt-2 space-y-1">
          <li>· <strong class="text-white">Companies</strong> — all directors and anyone owning ≥25% of shares or voting rights</li>
          <li>· <strong class="text-white">Trusts</strong> — trustee(s), settlor, appointor/protector, and unit holders ≥25%</li>
          <li>· <strong class="text-white">Partnerships</strong> — all partners with significant control</li>
          <li>· <strong class="text-white">SMSFs</strong> — all trustees and members; directors of corporate trustees</li>
        </ul>
        <p class="mt-2">For each person, complete both Part 1 (identity verification) and Part 2 (sanctions/PEP screening) before providing the designated service.</p>
      `)}
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">${guidance.note}</div>
      <div id="individuals-list">
        ${inds.map((ind,i) => individualHTML(ind, i, guidance.roles)).join('')}
      </div>
    </div>

    <!-- PART D -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Part D — CDD Completion Declaration</h2>
        ${infoBtn('partd-tip')}
      </div>
      ${infoPop('partd-tip', `
        <strong class="text-indigo-300 block mb-2">What this declaration records</strong>
        <p>This declaration confirms that all required CDD steps have been completed before the designated service was provided. It must be signed by the staff member who performed or reviewed the CDD.</p>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Under the AML/CTF Act, failing to complete CDD before providing a designated service is a breach. This declaration, together with Parts A, B and C, forms your audit trail evidence.</p>
      `)}
      <p class="text-xs text-slate-400">This declaration confirms all required CDD steps have been completed before the designated service is provided to this customer.</p>
      <div class="bg-green-50 border border-green-200 rounded-xl p-4">
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" id="cl-tipping" ${d.tippingAck?'checked':''} class="mt-0.5 flex-shrink-0">
          <span class="text-sm text-green-800 leading-relaxed">I confirm that customer due diligence, identity verification, and sanctions/PEP screening have been completed before providing the designated service to this customer.</span>
        </label>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-slate-500">CDD completed date</label><input id="cl-cdd-date-field" type="date" class="inp mt-1" value="${d.cddDate||new Date().toISOString().split('T')[0]}"></div>
        <div><label class="text-xs text-slate-500">Completed by</label>
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
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.updateClientDraftCheck = function(key, val) {
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft[key] = val;
  const riskFlags = ['offshoreJurisdiction','complexStructure','pepAmongControllers','cashIntensiveIndustry'];
  if (riskFlags.includes(key)) go('newclient');
};
function snapshotClientDraft() {
  if (!S._clientDraft) S._clientDraft = {};
  const grab = (id) => { const el = document.getElementById(id); return el ? el.value : undefined; };
  const grabCb = (id) => { const el = document.getElementById(id); return el ? el.checked : undefined; };
  const fields = ['cl-name','cl-purpose','cl-abn','cl-acn','cl-reg-address','cl-business-address','cl-jurisdiction','cl-inc-date','cl-industry','cl-source-funds','cl-structure-notes','cl-doc-location','cl-trust-name','cl-trust-type','cl-trust-purpose','cl-trustee-type','cl-cdd-by'];
  const draftKeys = ['name','purpose','abn','acn','regAddress','businessAddress','jurisdiction','incDate','industry','sourceFunds','structureNotes','docLocation','trustName','trustType','trustPurpose','trusteeType','cddBy'];
  fields.forEach((id, i) => { const v = grab(id); if (v !== undefined) S._clientDraft[draftKeys[i]] = v; });
  const cbs = [['cl-abn-checked','abnChecked'],['cl-registry-checked','registryChecked'],['cl-deed-sighted','deedSighted'],['cl-abn-checked2','fundActive'],['cl-tipping','tippingAck']];
  cbs.forEach(([id, key]) => { const v = grabCb(id); if (v !== undefined) S._clientDraft[key] = v; });
}
window.updateClientDraft = function(key, val) {
  if (!S._clientDraft) S._clientDraft = {};
  snapshotClientDraft();
  S._clientDraft[key] = val;
  if (key === 'entityType' || key === 'service') go('newclient');
};
window.startClientRiskOverride = function() {
  const val = prompt('Override risk rating (Low / Medium / High).\n\nNote: A justification is required for audit purposes.');
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
window.saveClient = function() {
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
  const grab = (id) => document.getElementById(id)?.value||'';
  const grabCb = (id) => document.getElementById(id)?.checked||false;
  const newRecord = {
    name, entityType, service,
    purpose:              grab('cl-purpose'),
    abn:                  grab('cl-abn'),
    acn:                  grab('cl-acn'),
    regAddress:           grab('cl-reg-address'),
    businessAddress:      grab('cl-business-address'),
    jurisdiction:         grab('cl-jurisdiction'),
    incDate:              grab('cl-inc-date'),
    industry:             grab('cl-industry'),
    sourceFunds:          grab('cl-source-funds'),
    structureNotes:       grab('cl-structure-notes'),
    docLocation:          grab('cl-doc-location'),
    trustName:            grab('cl-trust-name'),
    trustType:            grab('cl-trust-type'),
    trusteeType:          grab('cl-trustee-type'),
    trustPurpose:         grab('cl-trust-purpose'),
    offshoreJurisdiction: S._clientDraft.offshoreJurisdiction||false,
    complexStructure:     S._clientDraft.complexStructure||false,
    pepAmongControllers:  S._clientDraft.pepAmongControllers||false,
    cashIntensiveIndustry:S._clientDraft.cashIntensiveIndustry||false,
    abnChecked:           grabCb('cl-abn-checked'),
    registryChecked:      grabCb('cl-registry-checked'),
    deedSighted:          grabCb('cl-deed-sighted'),
    fundActive:           grabCb('cl-abn-checked2'),
    risk:                 effectiveRisk,
    riskOverride:         S._clientDraft.riskOverride||null,
    riskJust:             S._clientDraft.riskJust||'',
    ttr:                  'No',
    smr:                  'No',
    tippingAck:           grabCb('cl-tipping'),
    cddDate:              grab('cl-cdd-date-field') || S._clientDraft.cddDate || new Date().toISOString().split('T')[0],
    cddBy:                grab('cl-cdd-by') || '',
    updatedAt:            Date.now(),
    individuals:          inds
  };
  const editIdx = S._clientEditIdx;
  if (editIdx !== undefined && S.clients[editIdx]) {
    const old = JSON.parse(JSON.stringify(S.clients[editIdx]));
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
    newRecord.services = newRecord.service ? [{ serviceName: newRecord.service, dateProvided: newRecord.cddDate, newCddRequired: false }] : [];
    S.clients.unshift(newRecord);
    toast('Client saved');
  }
  delete S._clientDraft; delete S._clientEditIdx;
  save(); go('clients');
};
