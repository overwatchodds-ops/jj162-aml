import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  const incidents = S.incidents || [];
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—';

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">SMR &amp; Incident Register</h1>
        <p class="text-sm text-slate-400 mt-1">Every suspicious matter must be assessed and recorded — whether or not it results in a report to AUSTRAC. The register is permanent evidence of your firm's monitoring activity.</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0 ml-6">
        ${infoBtn('smr-tip')}
        <button onclick="startNewIncident()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ New incident</button>
      </div>
    </div>

    ${infoPop('smr-tip', `
      <strong class="text-indigo-300 block mb-2">Suspicious Matter Reports — what you need to know</strong>
      <p>Under the AML/CTF Act, you must submit a Suspicious Matter Report (SMR) to AUSTRAC as soon as practicable — and no later than 3 business days after forming a suspicion.</p>
      <ul class="mt-2 space-y-1.5">
        <li>· <strong class="text-white">What triggers an SMR</strong> — any transaction or attempted transaction where you reasonably suspect the funds are proceeds of crime, or the transaction is connected to terrorism financing or tax evasion.</li>
        <li>· <strong class="text-white">Tipping-off offence</strong> — it is a criminal offence under section 123 of the AML/CTF Act to disclose to a customer or any other person that an SMR has been or may be submitted to AUSTRAC. Do not inform the client under any circumstances.</li>
        <li>· <strong class="text-white">Record everything</strong> — even if you decide not to submit an SMR, record the matter, your assessment, and your reasoning. AUSTRAC expects a documented decision-making trail.</li>
      </ul>
      <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">All records in this register are permanent and cannot be deleted. They form part of your AML/CTF compliance evidence.</p>
    `)}

    <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 leading-relaxed">
      <strong>Tipping-off warning</strong> — Under section 123 of the AML/CTF Act 2006, it is a criminal offence to disclose to a customer, or any person, that a Suspicious Matter Report has been or may be submitted to AUSTRAC. Do not inform the customer that they are under review or that a report has been filed.
    </div>

    ${incidents.length > 0 ? `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-28">Date</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Client</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Nature of Suspicion</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-28">AUSTRAC Ref</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 w-20">Status</th>
            <th class="px-4 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          ${incidents.map((inc, i) => {
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
                <button onclick="editIncident(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mr-2">Edit</button>
                <button onclick="toggleExpandIncident(${i})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'}</button>
              </td>
            </tr>
            ${expanded ? `
            <tr>
              <td colspan="6" class="border-b border-slate-100">
                <div class="bg-slate-50 px-6 py-4">
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
    </div>` : `
    <div class="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div class="text-slate-400 text-sm">No incidents recorded.</div>
      <div class="text-xs text-slate-400 mt-1">Click "+ New incident" to log a suspicious matter or compliance event.</div>
    </div>`}

  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.startNewIncident = function() {
  S._incidentDraft = {}; S._incidentEditIdx = undefined;
  go('newincident');
};
window.editIncident = function(i) {
  const inc = S.incidents[i]; if (!inc) return;
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
  if (client) {
    S._incidentDraft.entityType = client.entityType || '';
    S._incidentDraft.clientId = client.id || null;
  }
  go('newincident');
};

// Start an SMR pre-filled with a specific client — called from Client Register
window.startSmrForClient = function(clientId) {
  const client = S.clients.find(c => c.id === clientId);
  if (!client) return;
  S._incidentDraft = {
    clientId: client.id,
    clientName: client.name,
    entityType: client.entityType || '',
    individualsArr: [],
  };
  S._incidentEditIdx = undefined;
  go('newincident');
};
window.toggleIncidentIndividual = function(name, checked) {
  if (!S._incidentDraft) S._incidentDraft = {};
  if (!S._incidentDraft.individualsArr) S._incidentDraft.individualsArr = [];
  if (checked) { if (!S._incidentDraft.individualsArr.includes(name)) S._incidentDraft.individualsArr.push(name); }
  else { S._incidentDraft.individualsArr = S._incidentDraft.individualsArr.filter(n => n !== name); }
};
window.saveIncident = function() {
  if (!S._incidentDraft) S._incidentDraft = {};
  const clientName = document.getElementById('inc-client')?.value?.trim();
  const dateIdentified = document.getElementById('inc-date')?.value;
  const suspicion = document.getElementById('inc-suspicion')?.value?.trim();
  if (!clientName) { toast('Client is required', 'err'); return; }
  if (!dateIdentified) { toast('Date incident identified is required', 'err'); return; }
  if (!suspicion) { toast('Nature of suspicion is required', 'err'); return; }
  const amlcoDate = document.getElementById('inc-amlco-date')?.value;
  if (!amlcoDate) { toast('AMLCO review date is required', 'err'); return; }
  const amlcoNotes = document.getElementById('inc-amlco-notes')?.value?.trim();
  if (!amlcoNotes) { toast('AMLCO outcome / notes are required', 'err'); return; }
  const client = S.clients.find(c => c.name === clientName);
  const individualsArr = S._incidentDraft.individualsArr || [];
  const individualsText = individualsArr.length > 0 ? individualsArr.join(', ') : (document.getElementById('inc-individuals')?.value || '');
  const newRecord = {
    clientName,
    clientId: S._incidentDraft?.clientId || client?.id || null,
    entityType: client?.entityType || document.getElementById('inc-entity-type')?.value || '',
    dateIdentified, suspicion,
    individualsInvolved: individualsText, individualsArr,
    amlcoDate,
    amlcoNotes,
    austrDate:  document.getElementById('inc-austr-date')?.value || '',
    reference:  document.getElementById('inc-reference')?.value || '',
    status:     document.getElementById('inc-status')?.value || 'Open',
    notes:      document.getElementById('inc-notes')?.value || '',
    updatedAt:  Date.now()
  };
  const editIdx = S._incidentEditIdx;
  if (editIdx !== undefined && S.incidents[editIdx]) {
    const old = JSON.parse(JSON.stringify(S.incidents[editIdx]));
    const history = old.history || []; delete old.history;
    newRecord.history = [old, ...history];
    S.incidents[editIdx] = newRecord;
    toast('Incident record updated — previous version preserved');
  } else {
    newRecord.history = [];
    S.incidents.unshift(newRecord);
    toast('Incident record saved');
  }
  delete S._incidentDraft; delete S._incidentEditIdx;
  save(); go('incidents');
};
