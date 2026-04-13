import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  const adding = S._trainingDraft !== undefined;
  const d = S._trainingDraft || {};
  const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Training Register</h1>
        <p class="text-sm text-slate-400 mt-1">AUSTRAC requires all staff performing AML/CTF functions to receive appropriate training — and for that training to be recorded and kept current.</p>
      </div>
      ${(() => {
        const amlStaff = S.staff.filter(st=>st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff');
        const allHaveRecords = amlStaff.length > 0 && amlStaff.every(st=>S.training.find(t=>t.name===st.name));
        return allHaveRecords
          ? '<span class="text-xs text-green-600 font-semibold flex-shrink-0 ml-6">✓ All AML staff have training records</span>'
          : '<button onclick="startAddTraining()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex-shrink-0 ml-6">+ Add record</button>';
      })()}
    </div>

    ${adding ? `
    <div class="bg-white border-2 border-indigo-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-slate-700">${S._trainingEditIdx !== undefined ? 'Edit training record — ' + (S.training[S._trainingEditIdx]?.name||'') : 'New training record'}</h2>
          ${infoBtn('training-how-tip')}
        </div>
        ${S._trainingEditIdx !== undefined ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
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

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-slate-500">Staff member *</label>
          <select id="tr-name" class="inp mt-1" onchange="autoFillTrainingClassification(this.value)">
            <option value="">— Select staff member —</option>
            ${S.staff.filter(st=>(st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff') && (S._trainingEditIdx !== undefined || !S.training.find(t=>t.name===st.name))).map(st=>`<option value="${st.name}" ${d.name===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''} (${st.classification})</option>`).join('')}
            ${d.name && !S.staff.find(st=>st.name===d.name) ? `<option value="${d.name}" selected>${d.name} (not in vetting register)</option>` : ''}
          </select>
          <p class="text-xs text-slate-400 mt-1">Only Key Personnel and AML Staff shown. Add staff in Key Personnel Vetting first.</p>
          ${d.name && S.staff.find(st=>st.name===d.name) ? `<div class="text-xs text-indigo-500 mt-0.5">${S.staff.find(st=>st.name===d.name).classification||''}</div>` : ''}
        </div>
        <div><label class="text-xs text-slate-500">Training date *</label><input id="tr-date" type="date" class="inp mt-1" value="${d.date||''}" onchange="autoSetTrainingNext(this.value)"></div>
        <div class="col-span-2"><label class="text-xs text-slate-500">Provider / course *</label><textarea id="tr-provider" class="inp mt-1" rows="3" placeholder="e.g. AUSTRAC online module — March 2026&#10;In-house refresher — September 2026">${d.provider||''}</textarea><p class="text-xs text-slate-400 mt-1">List all training completed — one per line if multiple.</p></div>
        <div class="col-span-2"><label class="text-xs text-slate-500">Certificate / Storage location</label><input id="tr-score" type="text" class="inp mt-1" value="${d.score||''}" placeholder="e.g. SharePoint > Staff > Training > John Doe — AUSTRAC 2026.pdf"></div>
        <div>
          <label class="text-xs text-slate-500">Next due <span class="text-indigo-400 font-normal">(auto-set to +1 year — override allowed)</span></label>
          <input id="tr-next" type="date" class="inp mt-1" value="${d.next||''}">
          <p class="text-xs text-amber-600 mt-1">AUSTRAC expects AML/CTF training at least once every 12 months.</p>
        </div>
      </div>

      <div><label class="text-xs text-slate-500">Notes</label><textarea id="tr-notes" class="inp mt-1" rows="2" placeholder="Training content, topics covered, or relevant observations">${d.notes||''}</textarea></div>

      ${S._trainingEditIdx !== undefined && (S.training[S._trainingEditIdx]?.history||[]).length > 0 ? `
      <div class="border-t border-slate-100 pt-4 space-y-3">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Previous training history</div>
        <p class="text-xs text-slate-400">All previous versions are permanently recorded as your audit trail.</p>
        <div class="space-y-2">
          ${(S.training[S._trainingEditIdx]?.history||[]).map((h, i) => `
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-slate-700">Version ${(S.training[S._trainingEditIdx]?.history||[]).length - i} — ${h.date ? new Date(h.date).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
              <span class="text-slate-400">Next due: ${h.next ? new Date(h.next).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
            </div>
            <div class="text-slate-500 whitespace-pre-line">${h.provider||'—'}</div>
            ${h.score ? `<div class="text-slate-400 mt-1">Certificate: ${h.score}</div>` : ''}
          </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="flex gap-3">
        <button onclick="cancelTraining()" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onclick="saveTraining()" class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Record</button>
      </div>
    </div>` : ''}

    ${S.training.length > 0 ? `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="${thCls}">Staff Member</th>
            <th class="${thCls}">Training Date</th>
            <th class="${thCls}">Provider</th>
            <th class="${thCls}">Certificate / Storage</th>
            <th class="${thCls}">Status</th>
            <th class="${thCls}">Next Due</th>
            <th class="${thCls}"></th>
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
              ? '<span class="text-xs font-semibold text-red-600">⚠ Incomplete</span>'
              : '<span class="text-xs font-semibold text-green-700">✓ Complete</span>';

            // Next due badge
            const nextBadge = !t.next
              ? '<span class="text-xs text-slate-400 italic">Not set</span>'
              : isOverdue
                ? `<span class="text-xs font-semibold text-amber-600">⚠ Due ${fmtDate(t.next)}</span>`
                : `<span class="text-xs font-semibold text-green-700">✓ Due ${fmtDate(t.next)}</span>`;

            return `
            <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer" onclick="editTraining(${i})">
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-800">${t.name}</div>
                ${classification ? `<div class="text-xs text-slate-400 mt-0.5">${classification}</div>` : ''}
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">${fmtDate(t.date)}</td>
              <td class="px-4 py-3 text-xs text-slate-500">${t.provider||'—'}</td>
              <td class="px-4 py-3 text-xs text-slate-600">${t.score||'—'}</td>
              <td class="px-4 py-3">${statusBadge}</td>
              <td class="px-4 py-3">${nextBadge}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap" onclick="event.stopPropagation()">
                <button onclick="editTraining(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">Edit</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : (!adding ? `
    <div class="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div class="text-slate-400 text-sm">No training records yet.</div>
      <div class="text-xs text-slate-400 mt-1">Click "+ Add record" to begin your training register.</div>
    </div>` : '')}

  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
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
