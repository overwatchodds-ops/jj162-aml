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
    `<div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">${label}</label><input id="${id}" type="${type||'text'}" class="inp" value="${val||''}" placeholder="${placeholder||''}"></div>`;

  if (cfg.partAFields === 'individual') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Full legal name *</label><input id="cl-name" type="text" class="inp" value="${d.name||''}" placeholder="e.g. Jane Elizabeth Smith"></div>
      ${f('Date of birth','cl-dob',d.dob,'','date')}
      ${f('Residential address','cl-reg-address',d.regAddress,'12 Main St, Sydney NSW 2000')}
      ${f('ABN (if sole trader)','cl-abn',d.abn,'12 345 678 901')}
      ${f('Occupation / industry','cl-industry',d.industry,'e.g. Plumber, Accountant, Retail')}
      ${f('Source of funds','cl-source-funds',d.sourceFunds,'e.g. Business income, salary, investment')}
    </div>`;

  if (cfg.partAFields === 'company') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Entity / trading name *</label><input id="cl-name" type="text" class="inp" value="${d.name||''}" placeholder="e.g. Acme Holdings Pty Ltd"></div>
      ${f('ABN *','cl-abn',d.abn,'12 345 678 901')}
      ${f('ACN','cl-acn',d.acn,'123 456 789')}
      ${f('Registered address','cl-reg-address',d.regAddress,'123 Collins St, Melbourne VIC 3000')}
      ${f('Principal place of business','cl-business-address',d.businessAddress,'if different from registered address')}
      ${f('Jurisdiction of incorporation','cl-jurisdiction',d.jurisdiction,'e.g. Australia, Hong Kong')}
      ${f('Date of incorporation','cl-inc-date',d.incDate,'','date')}
      ${f('Industry / sector','cl-industry',d.industry,'e.g. Construction, Finance, Retail')}
      ${f('Source of funds / wealth','cl-source-funds',d.sourceFunds,'e.g. Operating revenue, investment income')}
    </div>
    <div style="margin-top:14px;background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
      <div style="font-size:11px;font-weight:500;color:#0f172a;margin-bottom:8px;">Verification attestation</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="cdDraftCheck('abnChecked',this.checked)"> ABN / ASIC registration confirmed via lookup</label>
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;"><input type="checkbox" id="cl-registry-checked" ${d.registryChecked?'checked':''} onchange="cdDraftCheck('registryChecked',this.checked)"> Share registry / company constitution sighted</label>
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Document storage location</label><input id="cl-doc-location" type="text" class="inp" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Acme Holdings > CDD"></div>
      </div>
    </div>`;

  if (cfg.partAFields === 'trust') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Trust name *</label><input id="cl-name" type="text" class="inp" value="${d.name||''}" placeholder="e.g. Smith Family Trust"></div>
      ${f('ABN / TFN','cl-abn',d.abn,'12 345 678 901')}
      <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Trust type *</label>
        <select id="cl-trust-type" class="inp">
          ${['Discretionary / Family','Unit Trust','Hybrid','Charitable','Testamentary','Other'].map(o=>`<option ${d.trustType===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      ${f('Jurisdiction','cl-jurisdiction',d.jurisdiction,'e.g. Australia')}
      ${f('Source of funds / wealth','cl-source-funds',d.sourceFunds,'e.g. Investment income, property')}
      ${f('Purpose of trust','cl-trust-purpose',d.trustPurpose,'e.g. Property holding, investment management')}
    </div>
    <div style="margin-top:14px;background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
      <div style="font-size:11px;font-weight:500;color:#0f172a;margin-bottom:8px;">Verification attestation</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;"><input type="checkbox" id="cl-deed-sighted" ${d.deedSighted?'checked':''} onchange="cdDraftCheck('deedSighted',this.checked)"> Trust deed sighted and reviewed</label>
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="cdDraftCheck('abnChecked',this.checked)"> ABN / TFN confirmed</label>
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Document storage location</label><input id="cl-doc-location" type="text" class="inp" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith Family Trust > CDD"></div>
      </div>
    </div>`;

  if (cfg.partAFields === 'smsf') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Fund name *</label><input id="cl-name" type="text" class="inp" value="${d.name||''}" placeholder="e.g. Smith Superannuation Fund"></div>
      ${f('ABN *','cl-abn',d.abn,'12 345 678 901')}
      <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Trustee type *</label>
        <select id="cl-trustee-type" class="inp">
          ${['Individual Trustees','Corporate Trustee'].map(o=>`<option ${d.trusteeType===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      ${f('Source of contributions','cl-source-funds',d.sourceFunds,'e.g. Salary sacrifice, rollover')}
    </div>
    <div style="margin-top:14px;background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
      <div style="font-size:11px;font-weight:500;color:#0f172a;margin-bottom:8px;">Verification attestation</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="cdDraftCheck('abnChecked',this.checked)"> ATO registration confirmed (ABN lookup)</label>
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;"><input type="checkbox" id="cl-fund-active" ${d.fundActive?'checked':''} onchange="cdDraftCheck('fundActive',this.checked)"> Fund confirmed as active and compliant</label>
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Document storage location</label><input id="cl-doc-location" type="text" class="inp" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith SMSF > CDD"></div>
      </div>
    </div>`;

  // Other
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Entity name *</label><input id="cl-name" type="text" class="inp" value="${d.name||''}" placeholder="Entity name"></div>
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
    ? `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Verified &amp; screened</span>`
    : `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fffbeb;color:#92400e;">Incomplete</span>`;

  return `
  <div style="border:0.5px solid ${hasHit ? '#fecaca' : '#e2e8f0'};background:${hasHit ? '#fef2f2' : '#fff'};border-radius:10px;overflow:hidden;margin-bottom:8px;" id="ind-card-${ind.id}">
    <!-- CARD HEADER -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;" onclick="toggleIndividualCard(${ind.id})" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:24px;height:24px;border-radius:50%;background:#eef2ff;color:#4338ca;font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
        <div>
          <div style="font-size:12px;font-weight:500;color:#0f172a;">${ind.name || `Person ${i+1}`}</div>
          ${ind.role ? `<div style="font-size:11px;color:#94a3b8;">${ind.role}${ind.ownership ? ' · ' + ind.ownership : ''}</div>` : '<div style="font-size:11px;color:#94a3b8;">Role not set</div>'}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        ${summaryStatus}
        ${!isOnlyPerson ? `<button onclick="event.stopPropagation();removeIndividual(${ind.id})" style="font-size:11px;color:#dc2626;background:none;border:none;cursor:pointer;">Remove</button>` : ''}
        <span style="font-size:11px;color:#94a3b8;">${expanded ? '▲' : '▼'}</span>
      </div>
    </div>

    ${expanded ? `
    <div style="border-top:0.5px solid #f1f5f9;padding:14px 16px;">

      <!-- BASIC INFO -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Full legal name *</label><input type="text" class="inp" value="${ind.name||''}" placeholder="Full legal name" oninput="updateIndividual(${ind.id},'name',this.value)"></div>
        ${roles.length > 0 ? `
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Role / connection *</label>
          <select class="inp" onchange="updateIndividual(${ind.id},'role',this.value)">
            <option value="">— Select role —</option>
            ${roles.map(o=>`<option ${ind.role===o?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>` : '<div></div>'}
        ${roles.length > 0 ? `<div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Ownership / control %</label><input type="text" class="inp" value="${ind.ownership||''}" placeholder="e.g. 50%" oninput="updateIndividual(${ind.id},'ownership',this.value)"></div>` : ''}
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Country of residence</label><input type="text" class="inp" value="${ind.country||'Australia'}" oninput="updateIndividual(${ind.id},'country',this.value)"></div>
      </div>

      <!-- IDENTITY VERIFICATION -->
      <div style="margin-bottom:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Identity verification</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date of birth</label><input type="date" class="inp" value="${ind.dob||''}" onchange="updateIndividual(${ind.id},'dob',this.value)"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Residential address</label><input type="text" class="inp" value="${ind.address||''}" placeholder="12 Main St, Sydney NSW" oninput="updateIndividual(${ind.id},'address',this.value)"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">ID type</label>
            <select class="inp" onchange="updateIndividual(${ind.id},'idType',this.value)">
              <option value="">— Select —</option>
              ${['Passport','Driver\'s Licence','Medicare Card','Birth Certificate','Other'].map(o=>`<option ${ind.idType===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">ID number</label><input type="text" class="inp" value="${ind.idNumber||''}" placeholder="PA1234567" oninput="updateIndividual(${ind.id},'idNumber',this.value)" style="font-family:monospace;font-size:12px"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Country of issue</label><input type="text" class="inp" value="${ind.idCountry||'Australia'}" oninput="updateIndividual(${ind.id},'idCountry',this.value)"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Verification method</label>
            <select class="inp" onchange="updateIndividual(${ind.id},'idMethod',this.value)">
              ${['Original sighted','Certified copy','Electronic verification'].map(o=>`<option ${ind.idMethod===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date verified</label><input type="date" class="inp" value="${ind.idDate||''}" onchange="updateIndividual(${ind.id},'idDate',this.value)"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Verified by</label>
            <select class="inp" onchange="updateIndividual(${ind.id},'idBy',this.value)">
              <option value="">— Select staff member —</option>
              ${S.staff.filter(st=>(!st.status||st.status==='Active'||st.status==='On Leave')&&(st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff')).map(st=>`<option value="${st.name}" ${ind.idBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
            </select>
          </div>
          <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Verification outcome</label>
            <select class="inp" onchange="updateIndividual(${ind.id},'idOutcome',this.value)">
              <option value="">— Select —</option>
              <option ${ind.idOutcome==='Verified'?'selected':''} value="Verified">Verified — identity confirmed</option>
              <option ${ind.idOutcome==='Unable to verify'?'selected':''} value="Unable to verify">Unable to verify — escalate to AMLCO</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SCREENING -->
      <div style="border-top:0.5px solid #f1f5f9;padding-top:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Sanctions / PEP screening</div>
        <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" style="display:flex;border-radius:8px;overflow:hidden;text-decoration:none;margin-bottom:10px;">
          <div style="flex:1;background:#1e293b;color:#fff;padding:9px 14px;font-size:11px;font-weight:500;">Screen ${ind.name||'this person'} via NameScan</div>
          <div style="background:#06b6d4;color:#fff;padding:9px 14px;font-size:11px;font-weight:500;white-space:nowrap;">NameScan →</div>
        </a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Provider</label><input type="text" class="inp" value="${ind.screenProvider||'NameScan'}" oninput="updateIndividual(${ind.id},'screenProvider',this.value)"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date screened</label><input type="date" class="inp" value="${ind.screenDate||''}" onchange="updateIndividual(${ind.id},'screenDate',this.value)"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Result</label>
            <select class="inp" onchange="updateIndividual(${ind.id},'screenResult',this.value);cdRerenderRisk()">
              <option value="">— Select —</option>
              <option ${ind.screenResult==='Clear'?'selected':''} value="Clear">Clear — no matches</option>
              <option ${ind.screenResult==='PEP'?'selected':''} value="PEP">PEP match — escalate to AMLCO</option>
              <option ${ind.screenResult==='Sanctions'?'selected':''} value="Sanctions">Sanctions match — do not proceed</option>
              <option ${ind.screenResult==='Adverse'?'selected':''} value="Adverse">Adverse media — review required</option>
            </select>
          </div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Scan / reference ID</label><input type="text" class="inp" value="${ind.screenRef||''}" placeholder="NSC-2026-XXXXX" oninput="updateIndividual(${ind.id},'screenRef',this.value)" style="font-family:monospace;font-size:12px"></div>
        </div>
        ${hasHit ? `
        <div style="background:#fef2f2;border:0.5px solid #fecaca;border-radius:8px;padding:10px 12px;font-size:11px;color:#991b1b;font-weight:500;margin-top:8px;">
          ${ind.screenResult==='Sanctions' ? '⛔ Sanctions match — do not proceed. Contact AMLCO immediately.' : '⚠ PEP match — enhanced CDD required. Escalate to AMLCO before proceeding.'}
        </div>` : ''}
      </div>
    </div>` : ''}
  </div>`;
}

// ─── ACCORDION PANEL ─────────────────────────────────────────────────────────
function panel(id, title, subtitle, isOpen, isComplete, content) {
  const borderCol  = isComplete ? '#bbf7d0' : isOpen ? '#c7d2fe' : '#e2e8f0';
  const headerBg   = isComplete ? '#f0fdf4' : '#fff';
  const statusIcon = isComplete
    ? '<span style="color:#16a34a;font-weight:500;font-size:13px;">✓</span>'
    : isOpen ? '' : '<span style="color:#cbd5e1;font-size:13px;">○</span>';
  return `
  <div style="border:0.5px solid ${borderCol};border-radius:12px;overflow:hidden;margin-bottom:10px;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;background:${headerBg};" onclick="togglePanel('${id}')" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${headerBg}'">
      <div style="display:flex;align-items:center;gap:10px;">
        ${statusIcon}
        <div>
          <div style="font-size:13px;font-weight:500;color:#0f172a;">${title}</div>
          ${subtitle ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">${subtitle}</div>` : ''}
        </div>
      </div>
      <span style="font-size:11px;color:#94a3b8;">${isOpen ? '▲' : '▼'}</span>
    </div>
    ${isOpen ? `<div style="border-top:0.5px solid #f1f5f9;padding:18px 20px;">${content}</div>` : ''}
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
  const riskBg  = effectiveRisk === 'High' ? '#fef2f2' : effectiveRisk === 'Medium' ? '#fffbeb' : '#f0fdf4';
  const riskCol = effectiveRisk === 'High' ? '#991b1b' : effectiveRisk === 'Medium' ? '#92400e' : '#166534';

  const inds = d.individuals || [];

  // ── PANEL A CONTENT ───────────────────────────────────────────────────────
  const panelAContent = !d.entityType ? `
    <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">Select the entity type to begin. This determines what information is required and who must be identified.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${ENTITY_TYPES.map(t => {
        const c = ENTITY_CONFIG[t];
        return `
        <button onclick="selectEntityType('${t}')"
          class="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition text-left">
          <span style="font-size:18px;flex-shrink:0;">${c.icon}</span>
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">${t}</div>
            <div class="text-xs text-slate-400 mt-0.5">${c.desc}</div>
          </div>
        </button>`;
      }).join('')}
    </div>` : partAFields(d);

  // ── PANEL B CONTENT ───────────────────────────────────────────────────────
  const panelBContent = `
    <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Purpose of relationship *</label>
      <textarea id="cl-purpose" class="inp" rows="3" placeholder="e.g. Tax compliance and advisory services for the family trust, including preparation of annual financial statements and income tax returns.">${d.purpose||''}</textarea>
      <p style="font-size:11px;color:#94a3b8;margin-top:5px;">Describe in plain English what services your firm is providing and why this client engaged you.</p>
    </div>

    <div style="margin-bottom:14px;">
      <div style="font-size:11px;font-weight:500;color:#0f172a;margin-bottom:8px;">Risk flags</div>
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:11px;cursor:pointer;padding:8px;border-radius:6px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <input type="checkbox" style="margin-top:2px;flex-shrink:0;" ${d.offshoreJurisdiction?'checked':''} onchange="cdDraftCheck('offshoreJurisdiction',this.checked)">
        <div><div style="font-weight:500;color:#0f172a;">Offshore jurisdiction or foreign ownership involved</div><div style="color:#94a3b8;margin-top:2px;">Client has connections to overseas entities, foreign-controlled structures, or non-resident controllers</div></div>
      </label>
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:11px;cursor:pointer;padding:8px;border-radius:6px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <input type="checkbox" style="margin-top:2px;flex-shrink:0;" ${d.complexStructure?'checked':''} onchange="cdDraftCheck('complexStructure',this.checked)">
        <div><div style="font-weight:500;color:#0f172a;">Complex or multi-tiered ownership structure</div><div style="color:#94a3b8;margin-top:2px;">Multiple layers of companies, trusts, or other entities between the client and the ultimate beneficial owner</div></div>
      </label>
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:11px;cursor:pointer;padding:8px;border-radius:6px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <input type="checkbox" style="margin-top:2px;flex-shrink:0;" ${d.cashIntensiveIndustry?'checked':''} onchange="cdDraftCheck('cashIntensiveIndustry',this.checked)">
        <div><div style="font-weight:500;color:#0f172a;">Cash-intensive industry</div><div style="color:#94a3b8;margin-top:2px;">Hospitality, retail, construction, trades — industries where large volumes of cash create ML/TF exposure</div></div>
      </label>
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:11px;cursor:pointer;padding:8px;border-radius:6px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <input type="checkbox" style="margin-top:2px;flex-shrink:0;" ${d.pepAmongControllers?'checked':''} onchange="cdDraftCheck('pepAmongControllers',this.checked)">
        <div><div style="font-weight:500;color:#0f172a;">PEP identified among owners, directors or trustees</div><div style="color:#94a3b8;margin-top:2px;">A politically exposed person holds or controls a significant position in this entity</div></div>
      </label>
    </div>

    <div style="border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Derived risk rating</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:11px;font-weight:500;padding:2px 10px;border-radius:99px;background:${riskBg};color:${riskCol};" id="risk-badge">${effectiveRisk}</span>
          ${!d.riskOverride ? `<button type="button" onclick="startRiskOverride()" style="font-size:11px;color:#4f46e5;background:none;border:none;cursor:pointer;text-decoration:underline;">Override</button>` : ''}
        </div>
      </div>
      ${d.riskOverride ? `
      <div style="margin-top:10px;background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:10px 12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:500;color:#92400e;">Override applied: ${d.riskOverride}</span>
          <button type="button" onclick="clearRiskOverride()" style="font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer;">Remove</button>
        </div>
        <textarea class="inp" rows="2" placeholder="Justification required for audit trail..." onchange="cdDraft('riskJust',this.value)">${d.riskJust||''}</textarea>
      </div>` : `
      <p style="font-size:11px;color:#94a3b8;margin-top:8px;font-style:italic;">Auto-calculated from entity type and risk flags above. Screening hits in the persons section will escalate to High automatically.</p>`}
    </div>`;

  // ── PANEL C CONTENT ───────────────────────────────────────────────────────
  const panelCLabel = isIndividual ? 'Identity Verification &amp; Screening' : 'Beneficial Owners &amp; Controllers';
  const panelCSubtitle = isIndividual
    ? summaryC(d)
    : (cfg?.whoNote ? null : summaryC(d));

  const panelCContent = `
    ${cfg?.whoNote && !isIndividual ? `<div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:11px;color:#64748b;margin-bottom:10px;">${cfg.whoNote}</div>` : ''}
    ${isIndividual ? '<p style="font-size:11px;color:#94a3b8;margin-bottom:10px;">Verify the identity of this person and screen them for sanctions and PEP status.</p>' : ''}
    <div id="individuals-list">
      ${inds.map((ind, i) => individualCard(ind, i, cfg?.roles || [], isIndividual && inds.length === 1)).join('')}
    </div>
    ${!isIndividual ? `
    <button onclick="addIndividual()" style="width:100%;border:1px dashed #c7d2fe;color:#4f46e5;font-size:12px;font-weight:500;padding:10px;border-radius:8px;cursor:pointer;background:#fff;" onmouseover="this.style.background='#eef2ff'" onmouseout="this.style.background='#fff'">
      + Add person
    </button>` : ''}`;

  // ── PANEL D CONTENT ───────────────────────────────────────────────────────
  const panelDContent = `
    <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">This declaration confirms all required CDD steps have been completed before the designated service is provided.</p>
    <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:8px;padding:12px 14px;margin-bottom:14px;">
      <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
        <input type="checkbox" id="cl-tipping" ${d.tippingAck?'checked':''} style="margin-top:2px;flex-shrink:0;" onchange="cdDraftCheck('tippingAck',this.checked)">
        <span style="font-size:12px;color:#166534;line-height:1.6;">I confirm that customer due diligence, identity verification, and sanctions/PEP screening have been completed before providing a designated service to this customer.</span>
      </label>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">CDD completed date</label>
        <input id="cl-cdd-date" type="date" class="inp" value="${d.cddDate||new Date().toISOString().split('T')[0]}" onchange="cdDraft('cddDate',this.value);autoSetNextReview(this.value)">
      </div>
      <div>
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Completed by *</label>
        <select id="cl-cdd-by" class="inp" onchange="cdDraft('cddBy',this.value)">
          <option value="">— Select staff member —</option>
          ${S.staff.filter(st=>!st.status||st.status==='Active'||st.status==='On Leave').map(st=>`<option value="${st.name}" ${d.cddBy===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''}</option>`).join('')}
        </select>
      </div>
      <div style="grid-column:1/-1;border-top:0.5px solid #f1f5f9;padding-top:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Next review date</label>
          <span style="font-size:11px;color:#94a3b8;">Auto-set based on risk rating — override if needed</span>
        </div>
        <input id="cl-next-review" type="date" class="inp" value="${d.nextReviewDate||''}" onchange="cdDraft('nextReviewDate',this.value)">
        <p style="font-size:11px;color:#94a3b8;margin-top:6px;">
          ${effectiveRisk === 'High' ? 'High risk — annual review recommended (12 months)' :
            effectiveRisk === 'Medium' ? 'Medium risk — review every 24 months recommended' :
            'Low risk — review every 36 months recommended'}
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

  return `<div style="max-width:760px;">

    <!-- HEADER -->
    <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:20px;">
      <button onclick="go('clients')" style="font-size:12px;color:#94a3b8;background:none;border:none;cursor:pointer;white-space:nowrap;margin-top:3px;">← Client Register</button>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <h1 style="font-size:20px;font-weight:500;color:#0f172a;">${pageTitle}</h1>
          ${isEditing ? `<span style="font-size:10px;font-weight:500;color:#92400e;background:#fffbeb;border:0.5px solid #fde68a;padding:2px 10px;border-radius:99px;">Editing — ${editedClient?.name || ''}</span>` : ''}
        </div>
        <p style="font-size:13px;color:#64748b;margin-top:3px;">${pageSubtitle}</p>
      </div>
    </div>

    <!-- PERSISTENT ENTITY TYPE STRIP — always visible regardless of accordion state -->
    ${d.entityType ? `
    <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:0.5px solid #e2e8f0;border-radius:10px;padding:10px 16px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">${cfg.icon}</span>
        <div>
          <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Entity type</div>
          <div style="font-size:13px;font-weight:500;color:#0f172a;">${d.entityType}</div>
        </div>
      </div>
      ${!isEditing ? `
      <button onclick="changeEntityType()" style="font-size:11px;color:#92400e;border:0.5px solid #fde68a;background:#fffbeb;padding:5px 12px;border-radius:6px;font-weight:500;cursor:pointer;">Change ↓</button>` : `
      <span style="font-size:11px;color:#94a3b8;font-style:italic;">Entity type is locked for existing records</span>`}
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
    <div style="display:flex;gap:10px;">
      <button onclick="go('clients')" style="flex:1;font-size:12px;font-weight:500;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:10px;border-radius:8px;cursor:pointer;">Cancel</button>
      <button onclick="saveClient()" style="flex:1;font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:10px;border-radius:8px;cursor:pointer;">Save Client Record</button>
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
