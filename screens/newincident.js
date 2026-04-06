import { S, save } from '../state/index.js';

export function screen() {
  if (!S._incidentDraft) S._incidentDraft = {};
  const d = S._incidentDraft;
  const isEdit = S._incidentEditIdx !== undefined;
  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—';

  // Build client dropdown
  const clientOptions = S.clients.map(c =>
    `<option value="${c.name}" ${d.clientName===c.name?'selected':''}>${c.name} — ${c.entityType||'—'}</option>`
  ).join('');

  // Get individuals from selected client
  const selectedClient = S.clients.find(c => c.clientName === d.clientName || c.name === d.clientName);
  const clientInds = selectedClient ? (selectedClient.individuals||[]) : [];

  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div class="flex items-center gap-4">
        <button onclick="go('incidents')" class="text-slate-400 hover:text-slate-600 text-sm">← Incident Register</button>
        <h1 class="text-2xl font-bold">${isEdit ? 'Edit Incident' : 'New Incident'}</h1>
        ${isEdit ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
      </div>

      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 leading-relaxed">
        <strong>Tipping-off warning</strong> — Under section 123 of the AML/CTF Act 2006, it is a criminal offence to disclose to a customer, or any person, that a Suspicious Matter Report (SMR) has been or may be submitted to AUSTRAC. Do not inform the customer that they are under review or that a report has been filed.
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Incident Details</h2>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-500">Client *</label>
            <select id="inc-client" class="inp mt-1" onchange="incidentClientChange(this.value)">
              <option value="">— Select client —</option>
              ${clientOptions}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-500">Entity type</label>
            <input id="inc-entity-type" type="text" class="inp mt-1 bg-slate-50" value="${d.entityType||''}" readonly placeholder="Auto-filled from client">
          </div>
          <div>
            <label class="text-xs text-slate-500">Date incident identified *</label>
            <input id="inc-date" type="date" class="inp mt-1" value="${d.dateIdentified||''}">
          </div>
          <div>
            <label class="text-xs text-slate-500">Status</label>
            <select id="inc-status" class="inp mt-1">
              <option ${(!d.status||d.status==='Open')?'selected':''} value="Open">Open</option>
              <option ${d.status==='Closed'?'selected':''} value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-500">Individuals involved <span class="font-normal text-slate-400">(optional — select from client's registered persons)</span></label>
          ${clientInds.length > 0 ? `
          <div class="mt-1 space-y-1 border rounded-xl p-3 bg-slate-50">
            ${clientInds.map(ind => `
            <label class="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" value="${ind.name}" ${(d.individualsArr||[]).includes(ind.name)?'checked':''} onchange="toggleIncidentIndividual('${ind.name}',this.checked)">
              <span class="text-slate-700">${ind.name||'—'}</span><span class="text-slate-400">${ind.role?'— '+ind.role:''}</span>
            </label>`).join('')}
          </div>` : `<input id="inc-individuals" type="text" class="inp mt-1" value="${d.individualsInvolved||''}" placeholder="e.g. John Smith (Director)">`}
        </div>
        <div>
          <label class="text-xs text-slate-500">Nature of suspicion *</label>
          <textarea id="inc-suspicion" class="inp mt-1" rows="3" placeholder="Describe the suspicious matter, transaction, or behaviour that triggered this incident...">${d.suspicion||''}</textarea>
        </div>
        <div><label class="text-xs text-slate-500">Notes</label>
          <textarea id="inc-notes" class="inp mt-1" rows="2" placeholder="Any additional context or observations">${d.notes||''}</textarea>
        </div>
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">AMLCO Review</h2>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-slate-500">Date reviewed by AMLCO</label>
            <input id="inc-amlco-date" type="date" class="inp mt-1" value="${d.amlcoDate||''}">
          </div>
          <div class="col-span-2"><label class="text-xs text-slate-500">AMLCO outcome / notes</label>
            <textarea id="inc-amlco-notes" class="inp mt-1" rows="2" placeholder="e.g. Reviewed 15/03/26 — escalated to AUSTRAC for further assessment">${d.amlcoNotes||''}</textarea>
          </div>
        </div>
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">AUSTRAC Reporting</h2>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-slate-500">Date reported to AUSTRAC</label>
            <input id="inc-austr-date" type="date" class="inp mt-1" value="${d.austrDate||''}">
          </div>
          <div><label class="text-xs text-slate-500">AUSTRAC reference number</label>
            <input id="inc-reference" type="text" class="inp mt-1 font-mono" value="${d.reference||''}" placeholder="AUSTRAC ref">
          </div>
        </div>
        <p class="text-xs text-slate-400">Reference number is optional — an incident may be resolved internally without an AUSTRAC submission.</p>
      </div>

      <div class="flex gap-3">
        <button onclick="go('incidents')" class="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onclick="saveIncident()" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Incident Record</button>
      </div>
    </div>`;

// COMPLIANCE REPORT
}

// Actions for newincident are in screens/incidents.js (shared incident handlers)
