import { S, save } from '../state/index.js';
import { toast } from '../components/index.js';

export function screen() {
  const adding = S._trainingDraft !== undefined;
  const d = S._trainingDraft || {};
  const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';
  return `
    <div class="py-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold">AML/CTF Training Register</h1>
            <button type="button" onclick="var t=document.getElementById('training-why-tip');t.style.display=t.style.display==='block'?'none':'block'" class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold cursor-pointer flex-shrink-0 hover:bg-indigo-600">i</button>
          </div>
          <div id="training-why-tip" style="display:none" class="bg-slate-800 text-slate-200 rounded-xl p-4 text-xs leading-relaxed space-y-3 mt-2 max-w-2xl">
            <div class="font-bold text-indigo-300">Who needs AML/CTF training — and why</div>
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #334155;">
                <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Group</th>
                <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Why they need training</th>
                <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Focus of training</th>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:6px 8px;color:#fbbf24;font-weight:600;">Key Personnel</td>
                <td style="padding:6px 8px;color:#cbd5e1;">They control and are accountable for the AML program</td>
                <td style="padding:6px 8px;color:#94a3b8;">Legal obligations, risk assessment, SMR decision-making, program oversight</td>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:6px 8px;color:#93c5fd;font-weight:600;">Operational AML staff</td>
                <td style="padding:6px 8px;color:#cbd5e1;">They execute the AML procedures</td>
                <td style="padding:6px 8px;color:#94a3b8;">How to do CDD, how to screen, red flags, when to escalate</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;color:#94a3b8;font-weight:600;">Non-AML staff</td>
                <td style="padding:6px 8px;color:#64748b;">No AML role</td>
                <td style="padding:6px 8px;color:#64748b;">No formal AML training required</td>
              </tr>
            </table>
          </div>
          <p class="text-slate-400 text-sm mt-1 max-w-2xl">Record AML/CTF training for all staff performing AML/CTF functions. All records are permanent and form part of the firm's AML/CTF compliance evidence.</p>
        </div>
        <button onclick="startAddTraining()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex-shrink-0 ml-6">+ Add record</button>
      </div>

      ${adding ? `
      <div class="bg-white border-2 border-indigo-200 rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-slate-700">${S._trainingEditIdx !== undefined ? 'Edit training record — ' + (S.training[S._trainingEditIdx]?.name||'') : 'New training record'}</h2>
          ${S._trainingEditIdx !== undefined ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-500">Staff member *</label>
            <select id="tr-name" class="inp mt-1" onchange="autoFillTrainingClassification(this.value)">
              <option value="">— Select staff member —</option>
              ${S.staff.filter(st=>st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff').map(st=>`<option value="${st.name}" ${d.name===st.name?'selected':''}>${st.name}${st.role?' — '+st.role:''} (${st.classification})</option>`).join('')}
              ${d.name && !S.staff.find(st=>st.name===d.name) ? `<option value="${d.name}" selected>${d.name} (not in vetting register)</option>` : ''}
            </select>
            <p class="text-xs text-slate-400 mt-1">Only Key Personnel and Operational AML Staff are shown. Add staff records in Key Personnel Vetting first.</p>
            ${d.name && S.staff.find(st=>st.name===d.name) ? `<div class="text-xs text-indigo-500 mt-0.5">${S.staff.find(st=>st.name===d.name).classification||''}</div>` : ''}
          </div>
          <div><label class="text-xs text-slate-500">Training date *</label><input id="tr-date" type="date" class="inp mt-1" value="${d.date||''}" onchange="autoSetTrainingNext(this.value)"></div>
          <div><label class="text-xs text-slate-500">Provider / course</label><input id="tr-provider" type="text" class="inp mt-1" value="${d.provider||''}" placeholder="e.g. AUSTRAC, in-house, external RTO"></div>
          <div><label class="text-xs text-slate-500">Score / outcome</label><input id="tr-score" type="text" class="inp mt-1" value="${d.score||''}" placeholder="e.g. Pass — 92%"></div>
          <div><label class="text-xs text-slate-500">Next due <span class="text-indigo-400 font-normal">(auto-set to +1 year — override allowed)</span></label><input id="tr-next" type="date" class="inp mt-1" value="${d.next||''}"><p class="text-xs text-amber-600 mt-1">AUSTRAC expects AML/CTF training at least once every 12 months.</p></div>
        </div>
        <div><label class="text-xs text-slate-500">Notes</label><textarea id="tr-notes" class="inp mt-1" rows="2" placeholder="Training content, topics covered, or any relevant observations">${d.notes||''}</textarea></div>
        <div class="flex gap-3">
          <button onclick="cancelTraining()" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
          <button onclick="saveTraining()" class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Record</button>
        </div>
      </div>` : ''}

      ${S.training.length > 0 ? `
      <div class="bg-white border rounded-xl overflow-hidden">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="${thCls}">Staff Member</th>
              <th class="${thCls}">Status</th>
              <th class="${thCls}">Training Date</th>
              <th class="${thCls}">Provider</th>
              <th class="${thCls}">Score / Outcome</th>
              <th class="${thCls}">Next Due</th>
              <th class="${thCls}">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${S.training.map((t,i) => {
              const lastUpdated = t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : (t.date||'—');
              const history = t.history || [];
              const expanded = S._expandedTraining === i;
              const isOverdue = t.next && new Date(t.next) < new Date();
              const statusTxt = isOverdue ? 'Overdue' : t.next ? 'Current' : 'No review date';
              const statusCls = isOverdue ? 'text-red-600 font-semibold' : t.next ? 'text-green-700 font-semibold' : 'text-slate-400';
              const nextCls = isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600';
              const staffRecord = S.staff.find(st => st.name === t.name);
              const classification = staffRecord ? staffRecord.classification : null;
              return `
              <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${expanded?'bg-slate-50':''}">
                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-800">${t.name}</div>
                  ${classification ? `<div class="text-xs text-slate-400 mt-0.5">${classification}</div>` : ''}
                </td>
                <td class="px-4 py-3 text-xs ${statusCls}">${statusTxt}</td>
                <td class="px-4 py-3 text-xs text-slate-600">${t.date||'—'}</td>
                <td class="px-4 py-3 text-xs text-slate-500">${t.provider||'—'}</td>
                <td class="px-4 py-3 text-xs text-slate-600">${t.score||'—'}</td>
                <td class="px-4 py-3 text-xs ${nextCls}">${t.next ? new Date(t.next).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}${isOverdue?' — Overdue':''}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button onclick="editTraining(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mr-3">Edit</button>
                  <button onclick="toggleExpandTraining(${i})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'} More</button>
                </td>
              </tr>
              ${expanded ? `
              <tr>
                <td colspan="7" class="border-b border-slate-100">
                  <div class="bg-slate-50 px-6 py-4 space-y-3">
                    <div class="grid grid-cols-3 gap-x-8 gap-y-2 text-xs">
                      <div><span class="text-slate-400">Last updated: </span><span class="text-slate-600">${lastUpdated}</span></div>
                      ${t.notes ? `<div class="col-span-3"><span class="text-slate-400">Notes: </span><span class="text-slate-600">${t.notes}</span></div>` : ''}
                    </div>
                    ${history.length > 0 ? `
                    <div>
                      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Change history</div>
                      <div class="space-y-1">
                        ${history.map((v,vi) => `
                        <div class="flex items-center gap-4 text-xs text-slate-500 py-1 border-b border-slate-100 last:border-0">
                          <span class="font-semibold text-slate-600">Version ${history.length-vi}</span>
                          <span>${new Date(v.updatedAt||0).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}</span>
                          <span>Date: ${v.date||'—'}</span>
                          <span>Provider: ${v.provider||'—'}</span>
                          <span>Score: ${v.score||'—'}</span>
                          <span>Next due: ${v.next||'—'}</span>
                        </div>`).join('')}
                      </div>
                    </div>` : `<div class="text-xs text-slate-400 italic">No previous versions.</div>`}
                  </div>
                </td>
              </tr>` : ''}`;
            }).join('')}
          </tbody>
        </table>
      </div>` : (!adding ? `<div class="text-center py-10 text-slate-400 text-sm bg-white border rounded-xl">No training records yet — click "+ Add record" to begin</div>` : '')}
    </div>`;

// ENROLMENT
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.autoSetTrainingNext = function(val) {
  if (!val) return;
  const d = new Date(val);
  d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('tr-next');
  if (el) el.value = next;
  if (S._trainingDraft) S._trainingDraft.next = next;
};

window.startAddTraining = function() { S._trainingDraft = {}; S._trainingEditIdx = undefined; go('training'); };
window.autoFillTrainingClassification = function(name) {
  if (!S._trainingDraft) S._trainingDraft = {};
  S._trainingDraft.name = name;
  // No re-render needed — classification shown via live lookup
};
window.cancelTraining = function() { delete S._trainingDraft; delete S._trainingEditIdx; go('training'); };
window.editTraining = function(i) {
  const t = S.training[i];
  if (!t) return;
  S._trainingDraft = Object.assign({}, t);
  S._trainingEditIdx = i;
  go('training');
};
window.toggleExpandTraining = function(i) {
  S._expandedTraining = S._expandedTraining === i ? null : i;
  go('training');
};
window.saveTraining = function() {
  const name = document.getElementById('tr-name')?.value?.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const newRecord = {
    name,
    role: document.getElementById('tr-role')?.value||'',
    date: document.getElementById('tr-date')?.value||'',
    provider: document.getElementById('tr-provider')?.value||'',
    score: document.getElementById('tr-score')?.value||'',
    next: document.getElementById('tr-next')?.value||'',
    notes: document.getElementById('tr-notes')?.value||'',
    updatedAt: Date.now()
  };
  const editIdx = S._trainingEditIdx;
  if (editIdx !== undefined && S.training[editIdx]) {
    const old = Object.assign({}, S.training[editIdx]);
    const history = old.history || [];
    delete old.history;
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
