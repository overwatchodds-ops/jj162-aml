import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  const incidents = S.incidents || [];
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—';

  return `<div style="max-width:900px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">SMR &amp; Incident Register</h1>
        <p style="font-size:13px;color:#64748b;">Every suspicious matter must be assessed and recorded — whether or not it results in a report to AUSTRAC.</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:16px;">
        ${infoBtn('smr-tip')}
        <button onclick="startNewIncident()" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;white-space:nowrap;">+ New incident</button>
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

    <div style="background:#fef2f2;border:0.5px solid #fecaca;border-radius:10px;padding:12px 16px;font-size:11px;color:#991b1b;line-height:1.6;margin-bottom:16px;">
      <span style="font-weight:500;">Tipping-off warning</span> — Under section 123 of the AML/CTF Act 2006, it is a criminal offence to disclose to a customer, or any person, that a Suspicious Matter Report has been or may be submitted to AUSTRAC. Do not inform the customer that they are under review or that a report has been filed.
    </div>

    ${incidents.length > 0 ? `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;width:100px;">Date</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Client</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Nature of suspicion</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;width:110px;">AUSTRAC ref</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;width:80px;">Status</th>
            <th style="width:90px;"></th>
          </tr>
        </thead>
        <tbody>
          ${incidents.map((inc, i) => {
            const statusCol = inc.status === 'Closed' ? '#64748b' : '#d97706';
            const expanded = S._expandedIncident === i;
            return `
            <tr style="border-bottom:0.5px solid #f1f5f9;background:${expanded?'#f8fafc':'#fff'};transition:background .1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${expanded?'#f8fafc':'#fff'}'">
              <td style="padding:10px 14px;font-size:11px;color:#64748b;white-space:nowrap;">${fmtDate(inc.dateIdentified)}</td>
              <td style="padding:10px 14px;">
                <div style="font-size:12px;font-weight:500;color:#0f172a;">${inc.clientName||'—'}</div>
                <div style="font-size:11px;color:#94a3b8;">${inc.entityType||''}</div>
              </td>
              <td style="padding:10px 14px;font-size:11px;color:#64748b;max-width:260px;">${inc.suspicion ? (inc.suspicion.length > 80 ? inc.suspicion.slice(0,80)+'…' : inc.suspicion) : '—'}</td>
              <td style="padding:10px 14px;font-size:11px;font-family:monospace;color:#64748b;">${inc.reference||'—'}</td>
              <td style="padding:10px 14px;font-size:11px;font-weight:500;color:${statusCol};">${inc.status||'Open'}</td>
              <td style="padding:10px 14px;text-align:right;white-space:nowrap;">
                <button onclick="editIncident(${i})" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:500;margin-right:8px;">Edit</button>
                <button onclick="toggleExpandIncident(${i})" style="font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer;">${expanded?'▲':'▼'}</button>
              </td>
            </tr>
            ${expanded ? `
            <tr>
              <td colspan="6" style="border-bottom:0.5px solid #f1f5f9;">
                <div style="background:#f8fafc;padding:14px 20px;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 32px;">
                    <div style="font-size:11px;"><span style="color:#94a3b8;">Entity type: </span><span style="color:#64748b;">${inc.entityType||'—'}</span></div>
                    <div style="font-size:11px;"><span style="color:#94a3b8;">Individuals: </span><span style="color:#64748b;">${inc.individualsInvolved||'—'}</span></div>
                    <div style="font-size:11px;"><span style="color:#94a3b8;">AMLCO review: </span><span style="color:#64748b;">${inc.amlcoDate ? fmtDate(inc.amlcoDate) : '—'}</span></div>
                    <div style="font-size:11px;"><span style="color:#94a3b8;">AUSTRAC reported: </span><span style="color:#64748b;">${inc.austrDate ? fmtDate(inc.austrDate) : '—'}</span></div>
                    ${inc.amlcoNotes ? `<div style="grid-column:1/-1;font-size:11px;"><span style="color:#94a3b8;">AMLCO notes: </span><span style="color:#64748b;">${inc.amlcoNotes}</span></div>` : ''}
                    ${inc.notes ? `<div style="grid-column:1/-1;font-size:11px;"><span style="color:#94a3b8;">Notes: </span><span style="color:#64748b;">${inc.notes}</span></div>` : ''}
                  </div>
                </div>
              </td>
            </tr>` : ''}`;
          }).join('')}
        </tbody>
      </table>
    </div>` : `
    <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">No incidents recorded.</div>
      <div style="font-size:11px;color:#cbd5e1;">Click "+ New incident" to log a suspicious matter or compliance event.</div>
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
