import { S, save } from '../state/index.js';

export function screen() {
  const incidents = S.incidents || [];
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—';
  return `
    <div class="p-8 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">SMR &amp; Incident Register</h1>
          <p class="text-slate-400 text-sm mt-1">${incidents.length} incident${incidents.length!==1?'s':''} on register — records are permanent</p>
        </div>
        <button onclick="startNewIncident()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ New incident</button>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 leading-relaxed">
        <strong>Tipping-off warning</strong> — Under section 123 of the AML/CTF Act 2006, it is a criminal offence to disclose to a customer, or any person, that a Suspicious Matter Report (SMR) has been or may be submitted to AUSTRAC. Do not inform the customer that they are under review or that a report has been filed.
      </div>
      ${incidents.length > 0 ? `
      <div class="bg-white border rounded-xl overflow-hidden">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-28">Date</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Client</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Nature of Suspicion</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-28">AUSTRAC Ref</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-20">Status</th>
              <th class="px-4 py-3 w-36"></th>
            </tr>
          </thead>
          <tbody>
            ${incidents.map((inc,i) => {
              const statusCls = inc.status === 'Closed' ? 'text-slate-500' : 'text-amber-600 font-semibold';
              const expanded = S._expandedIncident === i;
              return `
              <tr class="border-b border-slate-50 hover:bg-slate-50 transition ${expanded?'bg-slate-50':''}">
                <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">${fmtDate(inc.dateIdentified)}</td>
                <td class="px-4 py-3 font-semibold text-slate-800">${inc.clientName||'—'}<br><span class="text-xs font-normal text-slate-400">${inc.entityType||''}</span></td>
                <td class="px-4 py-3 text-xs text-slate-600" style="max-width:260px;">${inc.suspicion ? (inc.suspicion.length > 80 ? inc.suspicion.slice(0,80)+'…' : inc.suspicion) : '—'}</td>
                <td class="px-4 py-3 text-xs font-mono text-slate-500">${inc.reference||'—'}</td>
                <td class="px-4 py-3 text-xs ${statusCls}">${inc.status||'Open'}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button onclick="editIncident(${i})" class="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition mr-2">Edit</button>
                  <button onclick="toggleExpandIncident(${i})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'}</button>
                </td>
              </tr>
              ${expanded ? `
              <tr>
                <td colspan="6" class="border-b border-slate-100">
                  <div class="bg-slate-50 px-6 py-4 space-y-2">
                    <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                      <div><span class="text-slate-400">Entity type: </span><span class="text-slate-600">${inc.entityType||'—'}</span></div>
                      <div><span class="text-slate-400">Individuals involved: </span><span class="text-slate-600">${inc.individualsInvolved||'—'}</span></div>
                      <div><span class="text-slate-400">AMLCO review date: </span><span class="text-slate-600">${inc.amlcoDate ? fmtDate(inc.amlcoDate) : '—'}</span></div>
                      <div><span class="text-slate-400">AUSTRAC reported: </span><span class="text-slate-600">${inc.austrDate ? fmtDate(inc.austrDate) : '—'}</span></div>
                      ${inc.amlcoNotes ? `<div class="col-span-2"><span class="text-slate-400">AMLCO notes: </span><span class="text-slate-600">${inc.amlcoNotes}</span></div>` : ''}
                      ${inc.notes ? `<div class="col-span-2"><span class="text-slate-400">Notes: </span><span class="text-slate-600">${inc.notes}</span></div>` : ''}
                    </div>
                  </div>
                </td>
              </tr>` : ''}`;
            }).join('')}
          </tbody>
        </table>
      </div>` : `<div class="text-center py-10 text-slate-400 text-sm bg-white border rounded-xl">No incidents recorded — click "+ New incident" to add one</div>`}
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.startNewIncident = function() {
  S._incidentDraft = {};
  S._incidentEditIdx = undefined;
  go('newincident');
};
window.editIncident = function(i) {
  const inc = S.incidents[i];
  if (!inc) return;
  S._incidentDraft = JSON.parse(JSON.stringify(inc));
  S._incidentEditIdx = i;
  go('newincident');
};
window.toggleExpandIncident = function(i) {
  S._expandedIncident = S._expandedIncident === i ? null : i;
  go('incidents');
};
window.incidentClientChange = function(name) {
  if (!S._incidentDraft) S._incidentDraft = {};
  S._incidentDraft.clientName = name;
  S._incidentDraft.individualsArr = [];
  const client = S.clients.find(c => c.name === name);
  if (client) S._incidentDraft.entityType = client.entityType || '';
  go('newincident');
};
window.toggleIncidentIndividual = function(name, checked) {
  if (!S._incidentDraft) S._incidentDraft = {};
  if (!S._incidentDraft.individualsArr) S._incidentDraft.individualsArr = [];
  if (checked) {
    if (!S._incidentDraft.individualsArr.includes(name)) S._incidentDraft.individualsArr.push(name);
  } else {
    S._incidentDraft.individualsArr = S._incidentDraft.individualsArr.filter(n => n !== name);
  }
};
window.saveIncident = function() {
  if (!S._incidentDraft) S._incidentDraft = {};
  const clientName = document.getElementById('inc-client')?.value?.trim();
  const dateIdentified = document.getElementById('inc-date')?.value;
  const suspicion = document.getElementById('inc-suspicion')?.value?.trim();
  if (!clientName) { toast('Client is required', 'err'); return; }
  if (!dateIdentified) { toast('Date identified is required', 'err'); return; }
  if (!suspicion) { toast('Nature of suspicion is required', 'err'); return; }
  const client = S.clients.find(c => c.name === clientName);
  const individualsArr = S._incidentDraft.individualsArr || [];
  // Fall back to free-text if no client individuals
  const individualsText = individualsArr.length > 0
    ? individualsArr.join(', ')
    : (document.getElementById('inc-individuals')?.value || '');
  const newRecord = {
    clientName,
    entityType: client?.entityType || document.getElementById('inc-entity-type')?.value || '',
    dateIdentified,
    suspicion,
    individualsInvolved: individualsText,
    individualsArr,
    amlcoDate: document.getElementById('inc-amlco-date')?.value || '',
    amlcoNotes: document.getElementById('inc-amlco-notes')?.value || '',
    austrDate: document.getElementById('inc-austr-date')?.value || '',
    reference: document.getElementById('inc-reference')?.value || '',
    status: document.getElementById('inc-status')?.value || 'Open',
    notes: document.getElementById('inc-notes')?.value || '',
    updatedAt: Date.now()
  };
  const editIdx = S._incidentEditIdx;
  if (editIdx !== undefined && S.incidents[editIdx]) {
    const old = JSON.parse(JSON.stringify(S.incidents[editIdx]));
    const history = old.history || [];
    delete old.history;
    newRecord.history = [old, ...history];
    S.incidents[editIdx] = newRecord;
    toast('Incident record updated — previous version preserved');
  } else {
    newRecord.history = [];
    S.incidents.unshift(newRecord);
    toast('Incident record saved');
  }
  delete S._incidentDraft;
  delete S._incidentEditIdx;
  save();
  go('incidents');
};
