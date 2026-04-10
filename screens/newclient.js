import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

// ─── RISK RATING ──────────────────────────────────────────────────────────────
function deriveRisk(d) {
  const inds = d.individuals || [];
  const hasHit = inds.some(i => i.screenResult === 'PEP' || i.screenResult === 'Sanctions');
  if (hasHit)                    return 'High';
  if (d.offshoreJurisdiction)    return 'High';
  if (d.complexStructure)        return 'High';
  if (d.pepAmongControllers)     return 'High';
  const t = d.entityType;
  if (t === 'Trust' || t === 'SMSF') {
    if (d.cashIntensiveIndustry) return 'High';
    return 'Medium';
  }
  if (t === 'Private Company' || t === 'Partnership') {
    if (d.cashIntensiveIndustry) return 'High';
    return 'Medium';
  }
  if (d.cashIntensiveIndustry)   return 'Medium';
  return 'Low';
}

// ─── ENTITY TYPE CONFIG ───────────────────────────────────────────────────────
const ENTITY_CONFIG = {
  'Individual / Sole Trader': {
    icon: '👤',
    desc: 'A natural person or sole trader acting in their own name',
    roles: [],       // no separate roles — the individual IS the entity
    whoNote: null,   // no Part C guidance needed
    partAFields: 'individual',
  },
  'Private Company': {
    icon: '🏢',
    desc: 'An Australian Pty Ltd or incorporated company',
    roles: ['Director','Beneficial Owner (≥25%)','Secretary','Authorised Representative','Other'],
    whoNote: 'Record all directors and anyone who owns or controls ≥25% of shares or voting rights. For each person, complete identity verification and sanctions/PEP screening.',
    partAFields: 'company',
  },
  'Partnership': {
    icon: '🤝',
    desc: 'A general or limited partnership',
    roles: ['Partner','Authorised Representative','Other'],
    whoNote: 'Record all partners and any person with significant control over the partnership.',
    partAFields: 'company',
  },
  'Trust': {
    icon: '📋',
    desc: 'A discretionary, unit, or other trust structure',
    roles: ['Trustee (Individual)','Trustee (Corporate)','Settlor','Appointor / Protector','Beneficiary (≥25% unit holder)','Beneficial Owner','Other'],
    whoNote: 'Record the trustee(s), settlor, appointor/protector, and any unit holders ≥25%. For corporate trustees, also record their directors.',
    partAFields: 'trust',
  },
  'SMSF': {
    icon: '🏦',
    desc: 'A self-managed superannuation fund',
    roles: ['Trustee / Member','Corporate Trustee Director','Other'],
    whoNote: 'Record all trustees and members. If there is a corporate trustee, also record its directors.',
    partAFields: 'smsf',
  },
  'Other': {
    icon: '📁',
    desc: 'Any other entity type not listed above',
    roles: ['Director','Owner','Authorised Representative','Other'],
    whoNote: 'Record all individuals who own, control, or can benefit from this entity.',
    partAFields: 'other',
  },
};

const ENTITY_TYPES = Object.keys(ENTITY_CONFIG);

// ─── PART A FIELDS ────────────────────────────────────────────────────────────
function partAFields(d) {
  const t = d.entityType;
  const cfg = ENTITY_CONFIG[t] || ENTITY_CONFIG['Other'];
  const f = (label, id, val, placeholder, type) =>
    `<div><label class="text-xs text-slate-500">${label}</label><input id="${id}" type="${type||'text'}" class="inp mt-1" value="${val||''}" placeholder="${placeholder||''}"></div>`;

  if (cfg.partAFields === 'individual') return `
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2"><label class="text-xs text-slate-500">Full legal name *</label><input id="cl-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="e.g. Jane Elizabeth Smith"></div>
      ${f('Date of birth','cl-dob',d.dob,'','date')}
      ${f('Residential address','cl-reg-address',d.regAddress,'12 Main St, Sydney NSW 2000')}
      ${f('ABN (if sole trader)','cl-abn',d.abn,'12 345 678 901')}
      ${f('Occupation / industry','cl-industry',d.industry,'e.g. Plumber, Accountant, Retail')}
      ${f('Source of funds','cl-source-funds',d.sourceFunds,'e.g. Business income, salary, investment')}
    </div>`;

  if (cfg.partAFields === 'company') return `
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2"><label class="text-xs text-slate-500">Entity / trading name *</label><input id="cl-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="e.g. Acme Holdings Pty Ltd"></div>
      ${f('ABN *','cl-abn',d.abn,'12 345 678 901')}
      ${f('ACN','cl-acn',d.acn,'123 456 789')}
      ${f('Registered address','cl-reg-address',d.regAddress,'123 Collins St, Melbourne VIC 3000')}
      ${f('Principal place of business','cl-business-address',d.businessAddress,'if different from registered address')}
      ${f('Jurisdiction of incorporation','cl-jurisdiction',d.jurisdiction,'e.g. Australia, Hong Kong')}
      ${f('Date of incorporation','cl-inc-date',d.incDate,'','date')}
      ${f('Industry / sector','cl-industry',d.industry,'e.g. Construction, Finance, Retail')}
      ${f('Source of funds / wealth','cl-source-funds',d.sourceFunds,'e.g. Operating revenue, investment income')}
    </div>
    <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="cdDraftCheck('abnChecked',this.checked)"> ABN / ASIC registration confirmed via lookup</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-registry-checked" ${d.registryChecked?'checked':''} onchange="cdDraftCheck('registryChecked',this.checked)"> Share registry / company constitution sighted</label>
        <div><label class="text-xs text-slate-500">Document storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Acme Holdings > CDD"></div>
      </div>
    </div>`;

  if (cfg.partAFields === 'trust') return `
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2"><label class="text-xs text-slate-500">Trust name *</label><input id="cl-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="e.g. Smith Family Trust"></div>
      ${f('ABN / TFN','cl-abn',d.abn,'12 345 678 901')}
      <div><label class="text-xs text-slate-500">Trust type *</label>
        <select id="cl-trust-type" class="inp mt-1">
          ${['Discretionary / Family','Unit Trust','Hybrid','Charitable','Testamentary','Other'].map(o=>`<option ${d.trustType===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      ${f('Jurisdiction','cl-jurisdiction',d.jurisdiction,'e.g. Australia')}
      ${f('Source of funds / wealth','cl-source-funds',d.sourceFunds,'e.g. Investment income, property')}
      ${f('Purpose of trust','cl-trust-purpose',d.trustPurpose,'e.g. Property holding, investment management')}
    </div>
    <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-deed-sighted" ${d.deedSighted?'checked':''} onchange="cdDraftCheck('deedSighted',this.checked)"> Trust deed sighted and reviewed</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="cdDraftCheck('abnChecked',this.checked)"> ABN / TFN confirmed</label>
        <div><label class="text-xs text-slate-500">Document storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith Family Trust > CDD"></div>
      </div>
    </div>`;

  if (cfg.partAFields === 'smsf') return `
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2"><label class="text-xs text-slate-500">Fund name *</label><input id="cl-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="e.g. Smith Superannuation Fund"></div>
      ${f('ABN *','cl-abn',d.abn,'12 345 678 901')}
      <div><label class="text-xs text-slate-500">Trustee type *</label>
        <select id="cl-trustee-type" class="inp mt-1">
          ${['Individual Trustees','Corporate Trustee'].map(o=>`<option ${d.trusteeType===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      ${f('Source of contributions','cl-source-funds',d.sourceFunds,'e.g. Salary sacrifice, rollover')}
    </div>
    <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="cdDraftCheck('abnChecked',this.checked)"> ATO registration confirmed (ABN lookup)</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-fund-active" ${d.fundActive?'checked':''} onchange="cdDraftCheck('fundActive',this.checked)"> Fund confirmed as active and compliant</label>
        <div><label class="text-xs text-slate-500">Document storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith SMSF > CDD"></div>
      </div>
    </div>`;

  // Other
  return `
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2"><label class="text-xs text-slate-500">Entity name *</label><input id="cl-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="Entity name"></div>
      ${f('ABN / registration number','cl-abn',d.abn,'')}
      ${f('Registered address','cl-reg-address',d.regAddress,'')}
      ${f('Jurisdiction','cl-jurisdiction',d.jurisdiction,'e.g. Australia')}
      ${f('Source of funds','cl-source-funds',d.sourceFunds,'')}
    </div>`;
}

// ─── INDIVIDUAL CARD ──────────────────────────────────────────────────────────
function individualCard(ind, i, roles, isOnlyPerson) {
  const expanded = ind._expanded !== false; // default expanded
  const verified = ind.idOutcome === 'Verified';
  const screened = !!ind.screenResult;
  const hasHit = ind.screenResult === 'PEP' || ind.screenResult === 'Sanctions';
  const summaryStatus = verified && screened
    ? `<span class="text-xs text-green-600 font-semibold">✓ Verified &amp; screened</span>`
    : `<span class="text-xs text-amber-600 font-semibold">⚠ Incomplete</span>`;

  return `
  <div class="border ${hasHit ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl overflow-hidden mb-3" id="ind-card-${ind.id}">
    <!-- CARD HEADER -->
    <div class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition" onclick="toggleIndividualCard(${ind.id})">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">${i+1}</div>
        <div>
          <div class="text-sm font-semibold text-slate-700">${ind.name || `Person ${i+1}`}</div>
          ${ind.role ? `<div class="text-xs text-slate-400">${ind.role}${ind.ownership ? ' · ' + ind.ownership : ''}</div>` : '<div class="text-xs text-slate-400">Role not set</div>'}
        </div>
      </div>
      <div class="flex items-center gap-3">
        ${summaryStatus}
        ${!isOnlyPerson ? `<button onclick="event.stopPropagation();removeIndividual(${ind.id})" class="text-xs text-red-400 hover:text-red-600 ml-2">Remove</button>` : ''}
        <span class="text-slate-300 text-xs ml-1">${expanded ? '▲' : '▼'}</span>
      </div>
    </div>

    ${expanded ? `
    <div class="border-t border-slate-100 p-4 space-y-5">

      <!-- BASIC INFO -->
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-slate-500">Full legal name *</label><input type="text" class="inp mt-1" value="${ind.name||''}" placeholder="Full legal name" oninput="updateIndividual(${ind.id},'name',this.value)"></div>
        ${roles.length > 0 ? `
        <div><label class="text-xs text-slate-500">Role / connection *</label>
          <select class="inp mt-1" onchange="updateIndividual(${ind.id},'role',this.value)">
            <option value="">— Select role —</option>
            ${roles.map(o=>`<option ${ind.role===o?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>` : '<div></div>'}
        ${roles.length > 0 ? `<div><label class="text-xs text-slate-500">Ownership / control %</label><input type="text" class="inp mt-1" value="${ind.ownership||''}" placeholder="e.g. 50%" oninput="updateIndividual(${ind.id},'ownership',this.value)"></div>` : ''}
        <div><label class="text-xs text-slate-500">Country of residence</label><input type="text" class="inp mt-1" value="${ind.country||'Australia'}" oninput="updateIndividual(${ind.id},'country',this.value)"></div>
      </div>

      <!-- IDENTITY VERIFICATION -->
      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Identity verification</h3>
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
              ${S.staff.filter(st=>(!st.status||st.status==='Active'||st.status==='On Leave')&&(st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff')).map(st=>`<option value="${st.name}" ${ind.idBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
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

      <!-- SCREENING -->
      <div class="space-y-3 border-t border-slate-100 pt-4">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sanctions / PEP screening</h3>
        <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" class="flex items-stretch rounded-xl overflow-hidden no-underline">
          <div class="flex-1 bg-slate-800 text-white px-4 py-2.5 flex items-center text-xs font-semibold">Screen ${ind.name||'this person'} via NameScan</div>
          <div class="bg-cyan-500 text-white px-4 py-2.5 text-xs font-semibold whitespace-nowrap">NameScan →</div>
        </a>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-slate-500">Provider</label><input type="text" class="inp mt-1" value="${ind.screenProvider||'NameScan'}" oninput="updateIndividual(${ind.id},'screenProvider',this.value)"></div>
          <div><label class="text-xs text-slate-500">Date screened</label><input type="date" class="inp mt-1" value="${ind.screenDate||''}" onchange="updateIndividual(${ind.id},'screenDate',this.value)"></div>
          <div><label class="text-xs text-slate-500">Result</label>
            <select class="inp mt-1" onchange="updateIndividual(${ind.id},'screenResult',this.value);cdRerenderRisk()">
              <option value="">— Select —</option>
              <option ${ind.screenResult==='Clear'?'selected':''} value="Clear">Clear — no matches</option>
              <option ${ind.screenResult==='PEP'?'selected':''} value="PEP">PEP match — escalate to AMLCO</option>
              <option ${ind.screenResult==='Sanctions'?'selected':''} value="Sanctions">Sanctions match — do not proceed</option>
              <option ${ind.screenResult==='Adverse'?'selected':''} value="Adverse">Adverse media — review required</option>
            </select>
          </div>
          <div><label class="text-xs text-slate-500">Scan / reference ID</label><input type="text" class="inp mt-1" value="${ind.screenRef||''}" placeholder="NSC-2026-XXXXX" oninput="updateIndividual(${ind.id},'screenRef',this.value)" style="font-family:monospace;font-size:12px"></div>
        </div>
        ${hasHit ? `
        <div class="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold">
          ${ind.screenResult==='Sanctions' ? '⛔ Sanctions match — do not proceed. Contact AMLCO immediately.' : '⚠ PEP match — enhanced CDD required. Escalate to AMLCO before proceeding.'}
        </div>` : ''}
      </div>
    </div>` : ''}
  </div>`;
}

// ─── ACCORDION PANEL ─────────────────────────────────────────────────────────
function panel(id, title, subtitle, isOpen, isComplete, content) {
  const headerBg = isComplete ? 'bg-green-50 border-green-200' : isOpen ? 'bg-white border-indigo-200' : 'bg-white border-slate-200';
  const statusIcon = isComplete ? '<span class="text-green-600 font-bold text-sm">✓</span>' : isOpen ? '' : '<span class="text-slate-300 text-sm">○</span>';
  return `
  <div class="border ${isOpen ? 'border-indigo-200' : isComplete ? 'border-green-200' : 'border-slate-200'} rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 cursor-pointer ${headerBg} transition" onclick="togglePanel('${id}')">
      <div class="flex items-center gap-3">
        ${statusIcon}
        <div>
          <div class="text-sm font-bold text-slate-700">${title}</div>
          ${subtitle ? `<div class="text-xs text-slate-400 mt-0.5">${subtitle}</div>` : ''}
        </div>
      </div>
      <span class="text-slate-400 text-xs">${isOpen ? '▲' : '▼'}</span>
    </div>
    ${isOpen ? `<div class="border-t border-slate-100 p-5 space-y-4">${content}</div>` : ''}
  </div>`;
}

// ─── PANEL SUMMARIES ─────────────────────────────────────────────────────────
function summaryA(d) {
  if (!d.entityType) return 'Not started';
  const name = d.name || 'No name entered';
  const abn = d.abn ? ` · ABN ${d.abn}` : '';
  return `${d.entityType} · ${name}${abn}`;
}

function summaryB(d) {
  const risk = d.riskOverride || deriveRisk(d);
  const flags = [
    d.offshoreJurisdiction && 'Offshore',
    d.complexStructure && 'Complex structure',
    d.pepAmongControllers && 'PEP among controllers',
    d.cashIntensiveIndustry && 'Cash-intensive',
  ].filter(Boolean);
  return `${risk} risk${flags.length ? ' · ' + flags.join(' · ') : ''}`;
}

function summaryC(d) {
  const inds = d.individuals || [];
  if (!inds.length) return 'No persons recorded';
  const verified = inds.filter(i => i.idOutcome === 'Verified').length;
  const screened = inds.filter(i => i.screenResult).length;
  return `${inds.length} person${inds.length!==1?'s':''} · ${verified}/${inds.length} verified · ${screened}/${inds.length} screened`;
}

function summaryD(d) {
  if (!d.tippingAck) return 'Not yet declared';
  return `✓ ${d.cddBy || 'Staff member'} · ${d.cddDate || 'Date not set'}`;
}

// ─── COMPLETENESS CHECKS ─────────────────────────────────────────────────────
function completeA(d) { return !!(d.entityType && d.name); }
function completeB(d) { return !!(d.purpose); }
function completeC(d) {
  const inds = d.individuals || [];
  return inds.length > 0 && inds.every(i => i.idOutcome === 'Verified' && i.screenResult);
}
function completeD(d) { return !!(d.tippingAck && d.cddDate && d.cddBy); }

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export function screen() {
  if (!S._clientDraft) S._clientDraft = {};
  const d = S._clientDraft;
  if (!d._openPanels) d._openPanels = { a: true, b: false, c: false, dec: false };

  const isIndividual = d.entityType === 'Individual / Sole Trader';
  const cfg = ENTITY_CONFIG[d.entityType] || null;
  const autoRisk = deriveRisk(d);
  const effectiveRisk = d.riskOverride || autoRisk;
  const riskCls = effectiveRisk === 'High' ? 'bg-red-100 text-red-700' : effectiveRisk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';

  const inds = d.individuals || [];

  // ── PANEL A CONTENT ───────────────────────────────────────────────────────
  const panelAContent = !d.entityType ? `
    <p class="text-xs text-slate-400 mb-4">Select the entity type to begin. This determines what information is required and who must be identified.</p>
    <div class="grid grid-cols-2 gap-3">
      ${ENTITY_TYPES.map(t => {
        const c = ENTITY_CONFIG[t];
        return `
        <button onclick="selectEntityType('${t}')"
          class="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition text-left">
          <span class="text-2xl flex-shrink-0">${c.icon}</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">${t}</div>
            <div class="text-xs text-slate-400 mt-0.5">${c.desc}</div>
          </div>
        </button>`;
      }).join('')}
    </div>` : partAFields(d);

  // ── PANEL B CONTENT ───────────────────────────────────────────────────────
  const panelBContent = `
    <div><label class="text-xs text-slate-500">Purpose of relationship *</label>
      <textarea id="cl-purpose" class="inp mt-1 text-sm" rows="3" placeholder="e.g. Tax compliance and advisory services for the family trust, including preparation of annual financial statements and income tax returns.">${d.purpose||''}</textarea>
      <p class="text-xs text-slate-400 mt-1">Describe in plain English what services your firm is providing and why this client engaged you.</p>
    </div>

    <div class="space-y-2">
      <div class="text-xs font-semibold text-slate-500">Risk flags</div>
      <label class="flex items-start gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-slate-50">
        <input type="checkbox" class="mt-0.5 flex-shrink-0" ${d.offshoreJurisdiction?'checked':''} onchange="cdDraftCheck('offshoreJurisdiction',this.checked)">
        <div><div class="font-medium text-slate-700">Offshore jurisdiction or foreign ownership involved</div><div class="text-slate-400">Client has connections to overseas entities, foreign-controlled structures, or non-resident controllers</div></div>
      </label>
      <label class="flex items-start gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-slate-50">
        <input type="checkbox" class="mt-0.5 flex-shrink-0" ${d.complexStructure?'checked':''} onchange="cdDraftCheck('complexStructure',this.checked)">
        <div><div class="font-medium text-slate-700">Complex or multi-tiered ownership structure</div><div class="text-slate-400">Multiple layers of companies, trusts, or other entities between the client and the ultimate beneficial owner</div></div>
      </label>
      <label class="flex items-start gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-slate-50">
        <input type="checkbox" class="mt-0.5 flex-shrink-0" ${d.cashIntensiveIndustry?'checked':''} onchange="cdDraftCheck('cashIntensiveIndustry',this.checked)">
        <div><div class="font-medium text-slate-700">Cash-intensive industry</div><div class="text-slate-400">Hospitality, retail, construction, trades — industries where large volumes of cash create ML/TF exposure</div></div>
      </label>
      <label class="flex items-start gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-slate-50">
        <input type="checkbox" class="mt-0.5 flex-shrink-0" ${d.pepAmongControllers?'checked':''} onchange="cdDraftCheck('pepAmongControllers',this.checked)">
        <div><div class="font-medium text-slate-700">PEP identified among owners, directors or trustees</div><div class="text-slate-400">A politically exposed person holds or controls a significant position in this entity</div></div>
      </label>
    </div>

    <div class="border border-slate-200 rounded-xl p-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Derived risk rating</span>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-3 py-1 rounded-full ${riskCls}" id="risk-badge">${effectiveRisk}</span>
          ${!d.riskOverride ? `<button type="button" onclick="startRiskOverride()" class="text-xs text-indigo-500 hover:text-indigo-700 underline">Override</button>` : ''}
        </div>
      </div>
      ${d.riskOverride ? `
      <div class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-amber-700">Override applied: ${d.riskOverride}</span>
          <button type="button" onclick="clearRiskOverride()" class="text-xs text-slate-400 hover:text-red-500">Remove</button>
        </div>
        <textarea class="inp text-xs" rows="2" placeholder="Justification required for audit trail..." onchange="cdDraft('riskJust',this.value)">${d.riskJust||''}</textarea>
      </div>` : `
      <p class="text-xs text-slate-400 mt-2 italic">Auto-calculated from entity type and risk flags above. Screening hits in the persons section will escalate to High automatically.</p>`}
    </div>`;

  // ── PANEL C CONTENT ───────────────────────────────────────────────────────
  const panelCLabel = isIndividual ? 'Identity Verification &amp; Screening' : 'Beneficial Owners &amp; Controllers';
  const panelCSubtitle = isIndividual
    ? summaryC(d)
    : (cfg?.whoNote ? null : summaryC(d));

  const panelCContent = `
    ${cfg?.whoNote && !isIndividual ? `<div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 mb-2">${cfg.whoNote}</div>` : ''}
    ${isIndividual ? '<p class="text-xs text-slate-400">Verify the identity of this person and screen them for sanctions and PEP status.</p>' : ''}
    <div id="individuals-list">
      ${inds.map((ind, i) => individualCard(ind, i, cfg?.roles || [], isIndividual && inds.length === 1)).join('')}
    </div>
    ${!isIndividual ? `
    <button onclick="addIndividual()" class="w-full border border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold py-3 rounded-xl hover:bg-indigo-50 transition">
      + Add person
    </button>` : ''}`;

  // ── PANEL D CONTENT ───────────────────────────────────────────────────────
  const panelDContent = `
    <p class="text-xs text-slate-400">This declaration confirms all required CDD steps have been completed before the designated service is provided.</p>
    <div class="bg-green-50 border border-green-200 rounded-xl p-4">
      <label class="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" id="cl-tipping" ${d.tippingAck?'checked':''} class="mt-0.5 flex-shrink-0" onchange="cdDraftCheck('tippingAck',this.checked)">
        <span class="text-sm text-green-800 leading-relaxed">I confirm that customer due diligence, identity verification, and sanctions/PEP screening have been completed before providing a designated service to this customer.</span>
      </label>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-xs text-slate-500">CDD completed date</label>
        <input id="cl-cdd-date" type="date" class="inp mt-1" value="${d.cddDate||new Date().toISOString().split('T')[0]}" onchange="cdDraft('cddDate',this.value);autoSetNextReview(this.value)">
      </div>
      <div>
        <label class="text-xs text-slate-500">Completed by *</label>
        <select id="cl-cdd-by" class="inp mt-1" onchange="cdDraft('cddBy',this.value)">
          <option value="">— Select staff member —</option>
          ${S.staff.filter(st=>!st.status||st.status==='Active'||st.status==='On Leave').map(st=>`<option value="${st.name}" ${d.cddBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
        </select>
      </div>
      <div class="col-span-2 border-t border-slate-100 pt-4">
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs text-slate-500">Next review date</label>
          <span class="text-xs text-slate-400">Auto-set based on risk rating — override if needed</span>
        </div>
        <input id="cl-next-review" type="date" class="inp" value="${d.nextReviewDate||''}" onchange="cdDraft('nextReviewDate',this.value)">
        <p class="text-xs text-slate-400 mt-1">
          ${effectiveRisk === 'High' ? '⚡ High risk — annual review recommended (12 months)' :
            effectiveRisk === 'Medium' ? '🔶 Medium risk — review every 24 months recommended' :
            '🟢 Low risk — review every 36 months recommended'}
        </p>
      </div>
    </div>`;

  const op = d._openPanels;

  const isEditing = S._clientEditIdx !== undefined;
  const editedClient = isEditing ? S.clients[S._clientEditIdx] : null;
  const pageTitle = isEditing ? `Edit Client` : 'New Client (CDD)';
  const pageSubtitle = isEditing
    ? `Editing record for ${editedClient?.name || ''}. Previous version will be preserved on save.`
    : 'Complete all four sections before providing a designated service to this client.';

  return `<div class="py-8 space-y-4">

    <!-- HEADER -->
    <div class="flex items-start gap-4">
      <button onclick="go('clients')" class="text-slate-400 hover:text-slate-600 text-sm mt-1 flex-shrink-0">← Client Register</button>
      <div class="flex-1">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-2xl font-bold text-slate-900">${pageTitle}</h1>
          ${isEditing ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">⚠ Editing — ${editedClient?.name || ''}</span>` : ''}
        </div>
        <p class="text-sm text-slate-400 mt-1">${pageSubtitle}</p>
      </div>
    </div>

    <!-- PERSISTENT ENTITY TYPE STRIP — always visible regardless of accordion state -->
    ${d.entityType ? `
    <div class="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div class="flex items-center gap-2.5">
        <span class="text-xl">${cfg.icon}</span>
        <div>
          <div class="text-xs text-slate-400 font-medium uppercase tracking-wide">Entity type</div>
          <div class="text-sm font-bold text-slate-800">${d.entityType}</div>
        </div>
      </div>
      ${!isEditing ? `
      <button onclick="changeEntityType()" class="text-xs text-amber-600 border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-semibold transition">
        Change ↓
      </button>` : `
      <span class="text-xs text-slate-400 italic">Entity type is locked for existing records</span>`}
    </div>` : ''}

    <!-- PANEL A: ENTITY & IDENTITY -->
    ${panel('a',
      d.entityType ? 'Entity &amp; Identity' : 'Entity &amp; Identity',
      op.a ? null : summaryA(d),
      op.a, completeA(d), panelAContent)}

    <!-- PANEL B: RISK & PURPOSE -->
    ${d.entityType ? panel('b', 'Risk &amp; Purpose', op.b ? null : summaryB(d), op.b, completeB(d), panelBContent) : ''}

    <!-- PANEL C: INDIVIDUALS -->
    ${d.entityType ? panel('c', panelCLabel, op.c ? null : summaryC(d), op.c, completeC(d), panelCContent) : ''}

    <!-- PANEL D: DECLARATION -->
    ${d.entityType ? panel('dec', 'CDD Declaration', op.dec ? null : summaryD(d), op.dec, completeD(d), panelDContent) : ''}

    <!-- SAVE -->
    ${d.entityType ? `
    <div class="flex gap-3 pt-2">
      <button onclick="go('clients')" class="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
      <button onclick="saveClient()" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Client Record</button>
    </div>` : ''}

  </div>`;
}

// ─── PANEL & ENTITY ACTIONS ───────────────────────────────────────────────────
window.togglePanel = function(id) {
  snapshotDraft();
  if (!S._clientDraft._openPanels) S._clientDraft._openPanels = {};
  S._clientDraft._openPanels[id] = !S._clientDraft._openPanels[id];
  go('newclient');
};

window.selectEntityType = function(type) {
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft.entityType = type;
  S._clientDraft._openPanels = { a: true, b: false, c: false, dec: false };
  // For individual, auto-create one person card
  if (type === 'Individual / Sole Trader') {
    if (!S._clientDraft.individuals || S._clientDraft.individuals.length === 0) {
      S._clientDraft.individuals = [{ id: Date.now(), name:'', role:'', _expanded: true }];
    }
  }
  go('newclient');
};

window.changeEntityType = function() {
  snapshotDraft();
  const d = S._clientDraft;
  // Preserve individuals with roles reset, warn user
  const preserved = (d.individuals || []).map(i => ({ ...i, role: '', ownership: '' }));
  const fields = ['name','dob','abn','acn','regAddress','businessAddress','jurisdiction','incDate','industry','sourceFunds','structureNotes','docLocation','trustName','trustType','trustPurpose','trusteeType','abnChecked','registryChecked','deedSighted','fundActive'];
  fields.forEach(k => delete d[k]);
  d.individuals = preserved;
  d.entityType = null;
  d._openPanels = { a: true, b: false, c: false, dec: false };
  go('newclient');
};

// ─── DRAFT HELPERS ────────────────────────────────────────────────────────────
window.cdDraft = function(key, val) {
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft[key] = val;
};
window.cdDraftCheck = function(key, val) {
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft[key] = val;
  const riskFlags = ['offshoreJurisdiction','complexStructure','pepAmongControllers','cashIntensiveIndustry'];
  if (riskFlags.includes(key)) go('newclient');
};
function snapshotDraft() {
  if (!S._clientDraft) S._clientDraft = {};
  const grab = id => { const el = document.getElementById(id); return el ? el.value : undefined; };
  const grabCb = id => { const el = document.getElementById(id); return el ? el.checked : undefined; };
  [['cl-name','name'],['cl-dob','dob'],['cl-abn','abn'],['cl-acn','acn'],
   ['cl-reg-address','regAddress'],['cl-business-address','businessAddress'],
   ['cl-jurisdiction','jurisdiction'],['cl-inc-date','incDate'],
   ['cl-industry','industry'],['cl-source-funds','sourceFunds'],
   ['cl-structure-notes','structureNotes'],['cl-doc-location','docLocation'],
   ['cl-trust-type','trustType'],['cl-trust-purpose','trustPurpose'],
   ['cl-trustee-type','trusteeType'],['cl-purpose','purpose'],
   ['cl-cdd-date','cddDate'],['cl-cdd-by','cddBy'],['cl-next-review','nextReviewDate']
  ].forEach(([id,k]) => { const v = grab(id); if (v !== undefined) S._clientDraft[k] = v; });
  [['cl-abn-checked','abnChecked'],['cl-registry-checked','registryChecked'],
   ['cl-deed-sighted','deedSighted'],['cl-fund-active','fundActive'],['cl-tipping','tippingAck']
  ].forEach(([id,k]) => { const v = grabCb(id); if (v !== undefined) S._clientDraft[k] = v; });
}

// ─── INDIVIDUAL ACTIONS ───────────────────────────────────────────────────────
window.toggleIndividualCard = function(id) {
  const inds = S._clientDraft?.individuals || [];
  const ind = inds.find(i => i.id === id);
  if (ind) { ind._expanded = !ind._expanded; go('newclient'); }
};
window.addIndividual = function() {
  snapshotDraft();
  if (!S._clientDraft.individuals) S._clientDraft.individuals = [];
  S._clientDraft.individuals.push({ id: Date.now(), name:'', role:'', _expanded: true });
  go('newclient');
};
window.removeIndividual = function(id) {
  snapshotDraft();
  if (!S._clientDraft?.individuals) return;
  S._clientDraft.individuals = S._clientDraft.individuals.filter(i => i.id !== id);
  go('newclient');
};
window.updateIndividual = function(id, field, val) {
  const inds = S._clientDraft?.individuals || [];
  const ind = inds.find(i => i.id === id);
  if (ind) ind[field] = val;
};
window.cdRerenderRisk = function() {
  snapshotDraft(); go('newclient');
};

// ─── RISK OVERRIDE ────────────────────────────────────────────────────────────
window.startRiskOverride = function() {
  const val = prompt('Override risk rating (Low / Medium / High).\n\nA justification is required for audit purposes.');
  if (!val) return;
  const clean = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  if (!['Low','Medium','High'].includes(clean)) { alert('Please enter Low, Medium or High'); return; }
  if (!S._clientDraft) S._clientDraft = {};
  S._clientDraft.riskOverride = clean;
  go('newclient');
};
window.clearRiskOverride = function() {
  if (S._clientDraft) { delete S._clientDraft.riskOverride; delete S._clientDraft.riskJust; }
  go('newclient');
};

// ─── AUTO-SET NEXT REVIEW ────────────────────────────────────────────────────
window.autoSetNextReview = function(cddDate) {
  if (!cddDate || !S._clientDraft) return;
  // Only auto-set if not already set by user
  const existing = document.getElementById('cl-next-review');
  if (existing && existing.value) return; // user has already set it
  const risk = S._clientDraft.riskOverride || (S._clientDraft.risk) || 'Low';
  const months = risk === 'High' ? 12 : risk === 'Medium' ? 24 : 36;
  const d = new Date(cddDate);
  d.setMonth(d.getMonth() + months);
  const next = d.toISOString().split('T')[0];
  if (existing) existing.value = next;
  S._clientDraft.nextReviewDate = next;
};

// ─── SAVE ─────────────────────────────────────────────────────────────────────
window.saveClient = function() {
  snapshotDraft();
  const d = S._clientDraft || {};
  if (!d.entityType) { toast('Entity type is required', 'err'); return; }
  if (!d.name) { toast('Entity name is required', 'err'); return; }

  // Panel A — entity-specific required fields
  if (d.entityType === 'Individual / Sole Trader') {
    if (!d.dob)         { toast('Date of birth is required', 'err'); return; }
    if (!d.regAddress)  { toast('Residential address is required', 'err'); return; }
    if (!d.industry)    { toast('Occupation / industry is required', 'err'); return; }
    if (!d.sourceFunds) { toast('Source of funds is required', 'err'); return; }
  }

  // Panel B — purpose required for all entity types
  if (!d.purpose) { toast('Purpose of relationship is required', 'err'); return; }

  const inds = d.individuals || [];

  // Panel C — at least one individual required
  if (inds.length === 0) { toast('At least one person must be recorded in the Beneficial Owners section', 'err'); return; }

  // Panel C — each individual must have a name
  for (const ind of inds) {
    if (!ind.name) { toast('All persons must have a full legal name', 'err'); return; }
    if (d.entityType !== 'Individual / Sole Trader' && !ind.role) {
      toast(`Role / connection is required for ${ind.name || 'a recorded person'}`, 'err'); return;
    }
  }

  // Panel D — declaration required
  if (!d.tippingAck) { toast('CDD declaration must be confirmed before saving', 'err'); return; }
  if (!d.cddBy)      { toast('CDD completed by (staff member) is required', 'err'); return; }
  if (!d.cddDate)    { toast('CDD completed date is required', 'err'); return; }

  // For Individual, auto-sync name from individual card if not set separately
  let entityName = d.name;
  if (d.entityType === 'Individual / Sole Trader' && !entityName && inds[0]?.name) {
    entityName = inds[0].name;
  }

  const effectiveRisk = d.riskOverride || deriveRisk(d);

  const newRecord = {
    id:                   (S._clientEditIdx !== undefined && S.clients[S._clientEditIdx]?.id)
                            ? S.clients[S._clientEditIdx].id
                            : Date.now(),
    name:                 entityName,
    entityType:           d.entityType,
    purpose:              d.purpose || '',
    abn:                  d.abn || '',
    acn:                  d.acn || '',
    dob:                  d.dob || '',
    regAddress:           d.regAddress || '',
    businessAddress:      d.businessAddress || '',
    jurisdiction:         d.jurisdiction || '',
    incDate:              d.incDate || '',
    industry:             d.industry || '',
    sourceFunds:          d.sourceFunds || '',
    structureNotes:       d.structureNotes || '',
    docLocation:          d.docLocation || '',
    trustName:            d.trustName || '',
    trustType:            d.trustType || '',
    trusteeType:          d.trusteeType || '',
    trustPurpose:         d.trustPurpose || '',
    offshoreJurisdiction: d.offshoreJurisdiction || false,
    complexStructure:     d.complexStructure || false,
    pepAmongControllers:  d.pepAmongControllers || false,
    cashIntensiveIndustry:d.cashIntensiveIndustry || false,
    abnChecked:           d.abnChecked || false,
    registryChecked:      d.registryChecked || false,
    deedSighted:          d.deedSighted || false,
    fundActive:           d.fundActive || false,
    risk:                 effectiveRisk,
    riskOverride:         d.riskOverride || null,
    riskJust:             d.riskJust || '',
    tippingAck:           d.tippingAck || false,
    cddDate:              d.cddDate || new Date().toISOString().split('T')[0],
    cddBy:                d.cddBy || '',
    nextReviewDate:       d.nextReviewDate || '',
    updatedAt:            Date.now(),
    individuals:          inds.map(i => ({ ...i, _expanded: undefined })), // strip UI state
    services:             d.services || [],
  };

  const editIdx = S._clientEditIdx;
  if (editIdx !== undefined && S.clients[editIdx]) {
    const old = JSON.parse(JSON.stringify(S.clients[editIdx]));
    const history = old.history || []; delete old.history;
    newRecord.history = [old, ...history];
    newRecord.services = old.services || [];
    S.clients[editIdx] = newRecord;
    toast('Client record updated — previous version preserved');
  } else {
    newRecord.history = [];
    S.clients.unshift(newRecord);
    toast('Client saved');
  }
  delete S._clientDraft; delete S._clientEditIdx;
  save(); go('clients');
};
