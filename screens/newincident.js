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

  return `<div style="max-width:680px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div style="display:flex;align-items:flex-start;gap:16px;">
        <button onclick="go('incidents')" style="font-size:12px;color:#94a3b8;background:none;border:none;cursor:pointer;white-space:nowrap;margin-top:3px;">← Register</button>
        <div>
          <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">${isEdit ? 'Edit Incident' : 'New Incident / SMR'}</h1>
          <p style="font-size:13px;color:#64748b;">Record every suspicious matter — whether or not it results in a report to AUSTRAC.</p>
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

    <div style="background:#fef2f2;border:0.5px solid #fecaca;border-radius:10px;padding:12px 16px;font-size:11px;color:#991b1b;line-height:1.6;margin-bottom:16px;">
      <span style="font-weight:500;">Tipping-off warning</span> — Under section 123 of the AML/CTF Act 2006, it is a criminal offence to disclose to a customer, or any person, that a Suspicious Matter Report has been or may be submitted to AUSTRAC. Do not inform the customer that they are under review or that a report has been filed.
    </div>

    <!-- INCIDENT DETAILS -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:14px;">Incident details</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Client *</label>
          <select id="inc-client" class="inp" onchange="incidentClientChange(this.value)">
            <option value="">— Select client —</option>
            ${S.clients.map(c => `<option value="${c.name}" ${d.clientName===c.name?'selected':''}>${c.name} — ${c.entityType||'—'}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Entity type</label>
          <input id="inc-entity-type" type="text" class="inp" style="background:#f8fafc;" value="${d.entityType||''}" readonly placeholder="Auto-filled from client">
        </div>
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date incident identified *</label>
          <input id="inc-date" type="date" class="inp" value="${d.dateIdentified||''}">
        </div>
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Status</label>
          <select id="inc-status" class="inp">
            <option ${(!d.status||d.status==='Open')?'selected':''} value="Open">Open</option>
            <option ${d.status==='Closed'?'selected':''} value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Individuals involved <span style="color:#cbd5e1;">(from client's registered persons)</span></label>
        ${clientInds.length > 0 ? `
        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
          ${clientInds.map(ind => `
          <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;margin-bottom:4px;">
            <input type="checkbox" value="${ind.name}" ${(d.individualsArr||[]).includes(ind.name)?'checked':''} onchange="toggleIncidentIndividual('${ind.name}',this.checked)">
            <span style="color:#0f172a;">${ind.name||'—'}</span><span style="color:#94a3b8;">${ind.role?' — '+ind.role:''}</span>
          </label>`).join('')}
        </div>` : `
        <input id="inc-individuals" type="text" class="inp" value="${d.individualsInvolved||''}" placeholder="e.g. John Smith (Director)">`}
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Nature of suspicion *</label>
        <textarea id="inc-suspicion" class="inp" rows="4" placeholder="Describe the suspicious matter, transaction, or behaviour that triggered this incident. Be specific — AUSTRAC reviewers will read this description.">${d.suspicion||''}</textarea>
      </div>
      <div>
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Notes</label>
        <textarea id="inc-notes" class="inp" rows="2" placeholder="Any additional context or observations">${d.notes||''}</textarea>
      </div>
    </div>

    <!-- AMLCO REVIEW -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:14px;">AMLCO review</div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date reviewed by AMLCO</label>
        <input id="inc-amlco-date" type="date" class="inp" value="${d.amlcoDate||''}">
      </div>
      <div>
        <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">AMLCO outcome / notes</label>
        <textarea id="inc-amlco-notes" class="inp" rows="2" placeholder="e.g. Reviewed 15/03/26 — escalated to AUSTRAC for further assessment">${d.amlcoNotes||''}</textarea>
      </div>
    </div>

    <!-- AUSTRAC REPORTING -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:14px;">AUSTRAC reporting</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date reported to AUSTRAC</label>
          <input id="inc-austr-date" type="date" class="inp" value="${d.austrDate||''}">
        </div>
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">AUSTRAC reference number</label>
          <input id="inc-reference" type="text" class="inp" style="font-family:monospace;" value="${d.reference||''}" placeholder="AUSTRAC ref — leave blank if not yet submitted">
        </div>
      </div>
      <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Leave blank if the matter was resolved internally without an AUSTRAC submission. Record the AMLCO's decision in the notes field above.</p>
    </div>

    <div style="display:flex;gap:10px;">
      <button onclick="go('incidents')" style="flex:1;font-size:12px;font-weight:500;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:10px;border-radius:8px;cursor:pointer;">Cancel</button>
      <button onclick="saveIncident()" style="flex:1;font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:10px;border-radius:8px;cursor:pointer;">Save Incident Record</button>
    </div>

  </div>`;
}
