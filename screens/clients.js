import { S, DS_LIST, save } from '../state/index.js';
import { autoClientRiskRating } from '../logic/index.js';
import { toast } from '../components/index.js';

export function screen() {

  const clients = S.clients || [];
  const serviceShort = (id) => {
    const n = DS_LIST.find(d=>d.id===id)?.name || id || '—';
    return n
      .replace('Assisting with creation or restructuring of a ','')
      .replace('Acting as or arranging for a person to act as a ','')
      .replace('Receiving, holding or managing client ','Client ')
      .replace('Sale or transfer of a ','');
  };
  const cddStatus = (c) => {
    const inds = c.individuals || [];
    if (!inds.length) return 'Incomplete';
    const allVerified = inds.every(i => i.idOutcome === 'Verified');
    const allScreened = inds.every(i => i.screenResult);
    if (allVerified && allScreened) return 'Complete';
    return 'Incomplete';
  };
  const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';
  const rows = clients.map((c,i) => {
    const expanded = S._expandedClient === i;
    const history = c.history || [];
    const lastUpdated = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : (c.cddDate||'—');
    const inds = c.individuals || [];
    const indCount = inds.length;
    const verified = inds.filter(ind=>ind.idOutcome==='Verified').length;
    const screened = inds.filter(ind=>ind.screenResult).length;
    const status = cddStatus(c);
    const svcShort = serviceShort(c.service);
    const fullSvcName = DS_LIST.find(d=>d.id===c.service)?.name || c.service || '—';
    const riskCls = c.risk==='High'?'text-red-600':c.risk==='Medium'?'text-amber-600':'text-green-600';
    const statusCls = status==='Complete'?'text-green-700':status==='Review Due'?'text-amber-600':'text-red-600';

    const indRows = inds.map(ind => {
      const outCls = ind.idOutcome==='Verified'?'text-green-700':ind.idOutcome==='Unable to verify'?'text-red-600':'text-slate-400';
      const scrCls = ind.screenResult==='Clear'?'text-green-700':(ind.screenResult==='PEP'||ind.screenResult==='Sanctions')?'text-red-600':'text-slate-400';
      return `<tr class="border-b border-slate-100 last:border-0">
                <td class="py-1.5 pr-4 font-medium text-slate-700">${ind.name||'—'}</td>
                <td class="py-1.5 pr-4 text-slate-500">${ind.role||'—'}</td>
                <td class="py-1.5 pr-4 font-semibold ${outCls}">${ind.idOutcome||'Not recorded'}</td>
                <td class="py-1.5 pr-4 font-semibold ${scrCls}">${ind.screenResult||'Not screened'}${ind.screenRef?' · '+ind.screenRef:''}</td>
                <td class="py-1.5 text-slate-500">${ind.idDate||'—'}${ind.idBy?' by '+ind.idBy:''}</td>
              </tr>`;
    }).join('');

    const histRows = history.map((v,vi) =>
      `<div class="flex items-center gap-4 text-xs text-slate-500 py-1 border-b border-slate-100 last:border-0">
        <span class="font-semibold text-slate-600">Version ${history.length-vi}</span>
        <span>${new Date(v.updatedAt||0).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}</span>
        <span>${v.risk||'—'} risk</span>
        <span>CDD: ${v.cddDate||'—'}</span>
        <span>${(v.individuals||[]).length} individual${(v.individuals||[]).length!==1?'s':''}</span>
      </div>`
    ).join('');

    const expandedRow = expanded ? `
    <tr>
      <td colspan="8" class="border-b border-slate-100">
        <div class="bg-slate-50 px-6 py-4 space-y-4">
          <div class="grid grid-cols-3 gap-x-8 gap-y-2 text-xs">
            <div><span class="text-slate-400">CDD date: </span><span class="text-slate-600">${c.cddDate||'—'}</span></div>
            <div><span class="text-slate-400">Services recorded: </span><span class="text-slate-600">${(c.services||[]).length||1}</span></div>
            <div><span class="text-slate-400">Versions: </span><span class="text-slate-600">${history.length > 0 ? history.length+' previous' : 'First record'}</span></div>
            ${c.purpose ? `<div class="col-span-3"><span class="text-slate-400">Purpose: </span><span class="text-slate-600">${c.purpose}</span></div>` : ''}
            ${c.riskOverride ? `<div class="col-span-3"><span class="text-slate-400">Risk override justification: </span><span class="text-slate-600">${c.riskJust||'None provided'}</span></div>` : ''}
          </div>
          ${(c.services||[]).length > 0 ? `
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Services provided</div>
            <table class="w-full text-xs border-collapse">
              <thead><tr class="border-b border-slate-200">
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Service</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Date Provided</th>
                <th class="text-left py-1.5 font-semibold text-slate-400">New CDD Required</th>
              </tr></thead>
              <tbody>
                ${(c.services||[]).map(sv => `
                <tr class="border-b border-slate-100 last:border-0">
                  <td class="py-1.5 pr-4 text-slate-700">${DS_LIST.find(d=>d.id===sv.serviceName)?.name||sv.serviceName||'—'}</td>
                  <td class="py-1.5 pr-4 text-slate-500">${sv.dateProvided||'—'}</td>
                  <td class="py-1.5 text-slate-500">${sv.newCddRequired?'Yes':'No'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}
          ${inds.length > 0 ? `
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Individuals</div>
            <table class="w-full text-xs border-collapse">
              <thead><tr class="border-b border-slate-200">
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Name</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Role</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">ID Outcome</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Screening</th>
                <th class="text-left py-1.5 font-semibold text-slate-400">Verified</th>
              </tr></thead>
              <tbody>${indRows}</tbody>
            </table>
          </div>` : ''}
          ${history.length > 0 ? `
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Change history</div>
            <div class="space-y-1">${histRows}</div>
          </div>` : ''}
        </div>
      </td>
    </tr>` : '';

    return `
    <tr class="border-b border-slate-50 hover:bg-slate-50 transition ${expanded?'bg-slate-50':''}">
      <td class="px-4 py-3 font-semibold text-slate-800">${c.name}</td>
      <td class="px-4 py-3 text-slate-500 text-xs">${c.entityType||'—'}</td>
      <td class="px-4 py-3 text-xs font-semibold ${riskCls}">${c.risk||'Low'}${c.riskOverride?' *':''}</td>
      <td class="px-4 py-3 text-slate-500 text-xs">${svcShort}</td>
      <td class="px-4 py-3 text-xs font-semibold ${statusCls}">${status}</td>
      <td class="px-4 py-3 text-xs text-slate-500">${indCount} · ${verified}/${indCount} verified · ${screened}/${indCount} screened</td>
      <td class="px-4 py-3 text-xs text-slate-500">${lastUpdated}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <button onclick="editClient(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mr-2">Edit</button>
        <button onclick="startAddService(${i})" class="text-xs text-green-600 font-semibold hover:text-green-800 mr-2">+ Service</button>
        <button onclick="toggleExpandClient(${i})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'} More</button>
      </td>
    </tr>
    ${expandedRow}`;
  }).join('');

  const emptyState = `<div class="text-center py-10 text-slate-400 text-sm bg-white border rounded-xl">No clients yet — click "New client" to add your first</div>`;
  const table = `
    <div class="bg-white border rounded-xl overflow-hidden">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="${thCls}">Client</th>
            <th class="${thCls}">Type</th>
            <th class="${thCls}">Risk</th>
            <th class="${thCls}">Designated Service</th>
            <th class="${thCls}">CDD Status</th>
            <th class="${thCls}">People</th>
            <th class="${thCls}">Last Review</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  return `
    <div class="p-8 max-w-5xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Client Register</h1>
          <p class="text-slate-400 text-sm mt-1">${clients.length} client${clients.length!==1?'s':''} on register</p>
        </div>
        <button onclick="go('newclient')" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ New client</button>
      </div>
      ${clients.length > 0 ? table : emptyState}
    </div>`;
};



// ─── Role guidance per entity type ──────────────────────────────────────────
const ROLE_GUIDANCE = {
  'Individual / Sole Trader': { roles: ['Sole Trader','Authorised Representative'], note: 'Verify the individual\u0027s identity and screen for PEP/sanctions.' },
  'Private Company':  { roles: ['Director','Beneficial Owner (≥25%)','Secretary','Authorised Representative','Other'], note: 'Record all directors and anyone who owns or controls ≥25% of shares or voting rights.' },
  'Partnership':      { roles: ['Partner','Authorised Representative','Other'], note: 'Record all partners and any person with significant control.' },
  'Trust':            { roles: ['Trustee (Individual)','Trustee (Corporate)','Settlor','Appointor / Protector','Beneficiary (≥25% unit holder)','Beneficial Owner','Other'], note: 'Record the trustee(s), settlor, appointor/protector, and any unit holders ≥25%. For corporate trustees, also record their directors.' },
  'SMSF':             { roles: ['Trustee / Member','Corporate Trustee Director','Other'], note: 'Record all trustees and members. If a corporate trustee, also record its directors.' },
  'Other':            { roles: ['Director','Owner','Authorised Representative','Other'], note: 'Record all individuals who own, control, or can benefit from this entity.' },
};

// ─── Part A: entity-specific fields ─────────────────────────────────────────
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
    <div class="mt-3 bg-slate-50 border rounded-xl p-3">
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
    <div class="mt-3 bg-slate-50 border rounded-xl p-3">
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
    <div class="mt-3 bg-slate-50 border rounded-xl p-3">
      <div class="text-xs font-semibold text-slate-600 mb-2">Verification attestation</div>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked" ${d.abnChecked?'checked':''} onchange="updateClientDraftCheck('abnChecked',this.checked)"> ATO registration confirmed (ABN lookup)</label>
        <label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" id="cl-abn-checked2" ${d.fundActive?'checked':''} onchange="updateClientDraftCheck('fundActive',this.checked)"> Fund confirmed as active and compliant</label>
        <div><label class="text-xs text-slate-500">Supporting document storage location</label><input id="cl-doc-location" type="text" class="inp mt-1 text-xs" value="${d.docLocation||''}" placeholder="e.g. SharePoint > Clients > Smith SMSF > CDD"></div>
      </div>
    </div>`;

  // Other
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
}

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
window.toggleExpandClient = function(i) {
  S._expandedClient = S._expandedClient === i ? null : i;
  go('clients');
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
