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
        <button onclick="editClient(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mr-3">Edit</button>
        <button onclick="toggleExpandClient(${i})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'} More</button>
      </td>
    </tr>
    ${expandedRow}`;
  }).join('');

  return `<div class="py-8 space-y-4">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Client Register</h1>
        <p class="text-sm text-slate-400 mt-1">${clients.length} client${clients.length!==1?'s':''} on register</p>
      </div>
      <button onclick="go('newclient')" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex-shrink-0 ml-6">+ New client</button>
    </div>
    ${clients.length > 0 ? `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
    </div>` : `
    <div class="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div class="text-slate-400 text-sm">No clients yet.</div>
      <div class="text-xs text-slate-400 mt-1">Click "+ New client" to add your first client record.</div>
    </div>`}
  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.toggleExpandClient = function(i) {
  S._expandedClient = S._expandedClient === i ? null : i;
  go('clients');
};
window.editClient = function(i) {
  const c = S.clients[i]; if (!c) return;
  S._clientDraft = JSON.parse(JSON.stringify(c));
  S._clientEditIdx = i;
  go('newclient');
};
