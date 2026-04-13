import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  const adding = S._trainingDraft !== undefined;
  const d = S._trainingDraft || {};
  return `<div style="max-width:900px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Training Register</h1>
        <p style="font-size:13px;color:#64748b;">AUSTRAC requires all staff performing AML/CTF functions to receive appropriate training — recorded and kept current.</p>
      </div>
      ${(() => {
        const amlStaff = S.staff.filter(st=>st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff');
        const allHaveRecords = amlStaff.length > 0 && amlStaff.every(st=>S.training.find(t=>t.name===st.name));
        return allHaveRecords
          ? '<span style="font-size:11px;font-weight:500;color:#166534;background:#f0fdf4;border:0.5px solid #bbf7d0;padding:3px 10px;border-radius:99px;white-space:nowrap;margin-left:16px;flex-shrink:0;">All staff have records</span>'
          : '<button onclick="startAddTraining()" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:16px;flex-shrink:0;">+ Add record</button>';
      })()}
    </div>

    ${adding ? `
    <div style="background:#fff;border:1.5px solid #c7d2fe;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:13px;font-weight:500;color:#0f172a;">${S._trainingEditIdx !== undefined ? 'Edit training record — ' + (S.training[S._trainingEditIdx]?.name||'') : 'New training record'}</span>
          ${infoBtn('training-how-tip')}
        </div>
        ${S._trainingEditIdx !== undefined ? `<span style="font-size:10px;font-weight:500;color:#92400e;background:#fffbeb;border:0.5px solid #fde68a;padding:2px 10px;border-radius:99px;">Editing — previous version preserved</span>` : ''}
      </div>
      ${infoPop('training-how-tip', `
        <strong class="text-indigo-300 block mb-2">Who needs training and what to record</strong>
        <p>Only Key Personnel and Standard AML/CTF Staff need formal AML/CTF training. Non-AML staff do not appear in this register.</p>
        <ul class="mt-2 space-y-1.5">
          <li>· <strong class="text-white">Key Personnel</strong> — legal obligations, risk assessment, SMR decision-making, program oversight</li>
          <li>· <strong class="text-white">Standard AML staff</strong> — CDD procedures, screening, red flags, when to escalate</li>
        </ul>
        <p class="mt-2">Record the provider, date, outcome and next due date. AUSTRAC expects training at least every 12 months — the next due date is auto-set to +1 year but can be overridden.</p>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Training records are permanent evidence. Add staff in Key Personnel Vetting before adding training records.</p>
      `)}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Staff member *</label>
          <select id="tr-name" class="inp" onchange="autoFillTrainingClassification(this.value)">
            <option value="">— Select staff member —</option>
            ${S.staff.filter(st=>(st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff') && (S._trainingEditIdx !== undefined || !S.training.find(t=>t.name===st.name))).map(st=>`<option value="${st.name}" ${d.name===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''} (${st.classification})</option>`).join('')}
            ${d.name && !S.staff.find(st=>st.name===d.name) ? `<option value="${d.name}" selected>${d.name} (not in vetting register)</option>` : ''}
          </select>
          <p style="font-size:11px;color:#94a3b8;margin-top:5px;">Only Key Personnel and AML Staff shown.</p>
          ${d.name && S.staff.find(st=>st.name===d.name) ? `<div style="font-size:11px;color:#4f46e5;margin-top:3px;">${S.staff.find(st=>st.name===d.name).classification||''}</div>` : ''}
        </div>
        <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Training date *</label><input id="tr-date" type="date" class="inp" value="${d.date||''}" onchange="autoSetTrainingNext(this.value)"></div>
        <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Provider / course *</label><textarea id="tr-provider" class="inp" rows="3" placeholder="e.g. AUSTRAC online module — March 2026&#10;In-house refresher — September 2026">${d.provider||''}</textarea><p style="font-size:11px;color:#94a3b8;margin-top:5px;">One per line if multiple.</p></div>
        <div style="grid-column:1/-1;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Certificate / Storage location</label><input id="tr-score" type="text" class="inp" value="${d.score||''}" placeholder="e.g. SharePoint > Staff > Training > Chris Wong — AUSTRAC 2026.pdf"></div>
        <div>
          <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Next due <span style="color:#818cf8;font-weight:400;">(auto-set to +1 year — override allowed)</span></label>
          <input id="tr-next" type="date" class="inp" value="${d.next||''}">
          <p style="font-size:11px;color:#d97706;margin-top:5px;">AUSTRAC expects training at least every 12 months.</p>
        </div>
      </div>

      <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Notes</label><textarea id="tr-notes" class="inp" rows="2" placeholder="Training content, topics covered, or relevant observations">${d.notes||''}</textarea></div>

      ${S._trainingEditIdx !== undefined && (S.training[S._trainingEditIdx]?.history||[]).length > 0 ? `
      <div style="border-top:0.5px solid #f1f5f9;padding-top:14px;">
        <button type="button" onclick="toggleTrainingHistory()" style="display:flex;align-items:center;justify-content:space-between;width:100%;background:none;border:none;cursor:pointer;padding:0;">
          <div style="text-align:left;">
            <div style="font-size:11px;font-weight:500;color:#0f172a;">Previous training history</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${(S.training[S._trainingEditIdx]?.history||[]).length} previous version${(S.training[S._trainingEditIdx]?.history||[]).length !== 1 ? 's' : ''} — audit trail</div>
          </div>
          <span id="tr-history-chevron" style="font-size:11px;color:#94a3b8;margin-left:12px;">▾ Show</span>
        </button>
        <div id="tr-history-panel" style="display:none;margin-top:10px;">
          ${(S.training[S._trainingEditIdx]?.history||[]).map((h, i) => `
          <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:500;color:#0f172a;">Version ${(S.training[S._trainingEditIdx]?.history||[]).length - i} — ${h.date ? new Date(h.date).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
              <span style="font-size:11px;color:#94a3b8;">Next due: ${h.next ? new Date(h.next).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
            </div>
            <div style="font-size:11px;color:#64748b;white-space:pre-line;">${h.provider||'—'}</div>
            ${h.score ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Certificate: ${h.score}</div>` : ''}
          </div>`).join('')}
        </div>
      </div>` : ''}

      <div style="display:flex;gap:10px;">
        <button onclick="cancelTraining()" style="flex:1;font-size:12px;font-weight:500;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:9px;border-radius:8px;cursor:pointer;">Cancel</button>
        <button onclick="saveTraining()" style="flex:1;font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:9px;border-radius:8px;cursor:pointer;">Save Record</button>
      </div>
    </div>` : ''}

    ${S.training.length > 0 ? `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Staff member</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Training date</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Provider</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Certificate / storage</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Status</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Next due</th>
            <th style="width:50px;"></th>
          </tr>
        </thead>
        <tbody>
          ${S.training.map((t, i) => {
            const isOverdue = t.next && new Date(t.next) < new Date();
            const staffRecord = S.staff.find(st => st.name === t.name);
            const classification = staffRecord ? staffRecord.classification : null;
            const fmtDate = d => d ? new Date(d).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—';

            // Status badge — mirrors client register pattern
            const statusBadge = !t.date || !t.score
              ? '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">Incomplete</span>'
              : '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Complete</span>';
            const nextBadge = !t.next
              ? '<span style="font-size:11px;color:#94a3b8;font-style:italic;">Not set</span>'
              : isOverdue
                ? `<span style="font-size:11px;font-weight:500;color:#d97706;">⚠ ${fmtDate(t.next)}</span>`
                : `<span style="font-size:11px;color:#64748b;">${fmtDate(t.next)}</span>`;

            return `
            <tr style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onclick="editTraining(${i})" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:10px 14px;">
                <div style="font-size:12px;font-weight:500;color:#0f172a;">${t.name}</div>
                ${classification ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">${classification}</div>` : ''}
              </td>
              <td style="padding:10px 14px;font-size:11px;color:#64748b;">${fmtDate(t.date)}</td>
              <td style="padding:10px 14px;font-size:11px;color:#64748b;white-space:pre-line;">${t.provider||'—'}</td>
              <td style="padding:10px 14px;font-size:11px;color:#64748b;">${t.score||'—'}</td>
              <td style="padding:10px 14px;">${statusBadge}</td>
              <td style="padding:10px 14px;">${nextBadge}</td>
              <td style="padding:10px 14px;text-align:right;" onclick="event.stopPropagation()">
                <button onclick="editTraining(${i})" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:500;">Edit</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : (!adding ? `
    <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">No training records yet.</div>
      <div style="font-size:11px;color:#cbd5e1;">Click "+ Add record" to begin your training register.</div>
    </div>` : '')}

  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.toggleTrainingHistory = function() {
  const panel = document.getElementById('tr-history-panel');
  const chevron = document.getElementById('tr-history-chevron');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.textContent = isOpen ? '▾ Show' : '▴ Hide';
};

window.autoSetTrainingNext = function(val) {
  if (!val) return;
  const d = new Date(val); d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('tr-next');
  if (el) el.value = next;
  if (S._trainingDraft) S._trainingDraft.next = next;
};
window.startAddTraining = function() { S._trainingDraft = {}; S._trainingEditIdx = undefined; go('training'); };
window.autoFillTrainingClassification = function(name) {
  if (!S._trainingDraft) S._trainingDraft = {};
  S._trainingDraft.name = name;
};
window.cancelTraining   = function() { delete S._trainingDraft; delete S._trainingEditIdx; go('training'); };
window.editTraining = function(i) {
  const t = S.training[i]; if (!t) return;
  S._trainingDraft = Object.assign({}, t); S._trainingEditIdx = i; go('training');
};
// toggleExpandTraining removed — rows now click-through to edit
window.saveTraining = function() {
  const name = document.getElementById('tr-name')?.value?.trim();
  if (!name) { toast('Select a staff member', 'err'); return; }
  const date = document.getElementById('tr-date')?.value?.trim();
  if (!date) { toast('Training date is required', 'err'); return; }
  const provider = document.getElementById('tr-provider')?.value?.trim();
  if (!provider) { toast('Provider / course is required', 'err'); return; }
  const next = document.getElementById('tr-next')?.value?.trim();
  if (!next) { toast('Next due date is required', 'err'); return; }
  const newRecord = {
    name,
    date:     document.getElementById('tr-date')?.value||'',
    provider: document.getElementById('tr-provider')?.value||'',
    score:    document.getElementById('tr-score')?.value||'',
    next:     document.getElementById('tr-next')?.value||'',
    notes:    document.getElementById('tr-notes')?.value||'',
    updatedAt: Date.now()
  };
  const editIdx = S._trainingEditIdx;
  if (editIdx !== undefined && S.training[editIdx]) {
    const old = Object.assign({}, S.training[editIdx]);
    const history = old.history || []; delete old.history;
    newRecord.history = [old, ...history];
    S.training[editIdx] = newRecord;
    toast('Training record updated — previous version preserved');
  } else {
    newRecord.history = [];
    S.training.unshift(newRecord);
    toast('Training record saved');
  }
  delete S._trainingDraft; delete S._trainingEditIdx;
  save(); go('training');
};
