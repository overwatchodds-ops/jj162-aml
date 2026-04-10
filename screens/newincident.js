import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  if (!S._incidentDraft) S._incidentDraft = {};
  const d = S._incidentDraft;
  const isEdit = S._incidentEditIdx !== undefined;

  // Resolve selected client — by id first, then name fallback
  const selectedClient = S.clients.find(c =>
    (d.clientId && c.id === d.clientId) || c.name === d.clientName
  );
  const clientInds = selectedClient ? (selectedClient.individuals || []) : [];

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <button onclick="go('incidents')" class="text-slate-400 hover:text-slate-600 text-sm mt-1 flex-shrink-0">← Incident Register</button>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">${isEdit ? 'Edit Incident' : 'New Incident / SMR'}</h1>
          <p class="text-sm text-slate-400 mt-1">Record every suspicious matter — whether or not it results in a report to AUSTRAC.</p>
        </div>
      </div>
      ${infoBtn('smr-how-tip')}
    </div>

    ${infoPop('smr-how-tip', `
      <strong class="text-indigo-300 block mb-2">How to complete this record</strong>
      <p>Record the incident as soon as you identify a suspicious matter. You do not need to have made a decision about whether to report to AUSTRAC before recording it.</p>
      <ul class="mt-2 space-y-1.5">
        <li>· <strong class="text-white">Incident details</strong> — who the client is, when you identified the matter, and what triggered the suspicion.</li>
        <li>· <strong class="text-white">AMLCO review</strong> — record when the AMLCO reviewed the matter and what they decided.</li>
        <li>· <strong class="text-white">AUSTRAC reporting</strong> — if an SMR was lodged, record the date and reference number. If resolved internally, leave blank and note the outcome in AMLCO notes.</li>
      </ul>
      <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">All records are permanent. You must submit an SMR to AUSTRAC within 3 business days of forming a suspicion.</p>
    `)}

    <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 leading-relaxed">
      <strong>Tipping-off warning</strong> — Under section 123 of the AML/CTF Act 2006, it is a criminal offence to disclose to a customer, or any person, that a Suspicious Matter Report has been or may be submitted to AUSTRAC. Do not inform the customer that they are under review or that a report has been filed.
    </div>

    <!-- INCIDENT DETAILS -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <h2 class="text-sm font-bold text-slate-700">Incident details</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-slate-500">Client *</label>
          <select id="inc-client" class="inp mt-1" onchange="incidentClientChange(this.value)">
            <option value="">— Select client —</option>
            ${S.clients.map(c => `<option value="${c.name}" ${d.clientName===c.name?'selected':''}>${c.name} — ${c.entityType||'—'}</option>`).join('')}
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
        <label class="text-xs text-slate-500">Individuals involved <span class="font-normal text-slate-400">(select from client's registered persons)</span></label>
        ${clientInds.length > 0 ? `
        <div class="mt-1 space-y-1 border border-slate-200 rounded-xl p-3 bg-slate-50">
          ${clientInds.map(ind => `
          <label class="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" value="${ind.name}" ${(d.individualsArr||[]).includes(ind.name)?'checked':''} onchange="toggleIncidentIndividual('${ind.name}',this.checked)">
            <span class="text-slate-700">${ind.name||'—'}</span><span class="text-slate-400">${ind.role?' — '+ind.role:''}</span>
          </label>`).join('')}
        </div>` : `
        <input id="inc-individuals" type="text" class="inp mt-1" value="${d.individualsInvolved||''}" placeholder="e.g. John Smith (Director)">`}
      </div>

      <div>
        <label class="text-xs text-slate-500">Nature of suspicion *</label>
        <textarea id="inc-suspicion" class="inp mt-1" rows="4" placeholder="Describe the suspicious matter, transaction, or behaviour that triggered this incident. Be specific — AUSTRAC reviewers will read this description.">${d.suspicion||''}</textarea>
      </div>

      <div>
        <label class="text-xs text-slate-500">Notes</label>
        <textarea id="inc-notes" class="inp mt-1" rows="2" placeholder="Any additional context or observations">${d.notes||''}</textarea>
      </div>
    </div>

    <!-- AMLCO REVIEW -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <h2 class="text-sm font-bold text-slate-700">AMLCO review</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-slate-500">Date reviewed by AMLCO</label>
          <input id="inc-amlco-date" type="date" class="inp mt-1" value="${d.amlcoDate||''}">
        </div>
        <div class="col-span-2">
          <label class="text-xs text-slate-500">AMLCO outcome / notes</label>
          <textarea id="inc-amlco-notes" class="inp mt-1" rows="2" placeholder="e.g. Reviewed 15/03/26 — escalated to AUSTRAC for further assessment">${d.amlcoNotes||''}</textarea>
        </div>
      </div>
    </div>

    <!-- AUSTRAC REPORTING -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <h2 class="text-sm font-bold text-slate-700">AUSTRAC reporting</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-slate-500">Date reported to AUSTRAC</label>
          <input id="inc-austr-date" type="date" class="inp mt-1" value="${d.austrDate||''}">
        </div>
        <div>
          <label class="text-xs text-slate-500">AUSTRAC reference number</label>
          <input id="inc-reference" type="text" class="inp mt-1 font-mono" value="${d.reference||''}" placeholder="AUSTRAC ref — leave blank if not yet submitted">
        </div>
      </div>
      <p class="text-xs text-slate-400">Leave blank if the matter was resolved internally without an AUSTRAC submission. Record the AMLCO's decision in the notes field above.</p>
    </div>

    <div class="flex gap-3">
      <button onclick="go('incidents')" class="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
      <button onclick="saveIncident()" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Incident Record</button>
    </div>

  </div>`;
}
