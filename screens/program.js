import { S, save } from '../state/index.js';
import { infoBtn, infoPop, toast} from '../components/index.js';

export function screen() {
  const p = S.program;
  const docs = [
    ['pola','AML/CTF Program — Part A','Risk-based program, governance, AMLCO role'],
    ['polb','AML/CTF Program — Part B','Customer identification and verification procedures'],
    ['polra','Risk Assessment document','Your firm-level ML/TF/PF risk assessment'],
    ['polcdd','CDD Policy & Process','How you conduct and record customer due diligence'],
    ['poltr','Training Policy','How and when staff are trained'],
  ];
  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div><h1 class="text-2xl font-bold">AML/CTF Program</h1><p class="text-slate-400 text-sm mt-1">Attach your program documents and record senior manager sign-off.</p></div>
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">These documents are <strong>internal records held by your firm — not submitted to AUSTRAC</strong>. They are the primary evidence reviewed in your annual compliance program review and examined by your independent evaluator every 3 years (~2029).</div>

      <div class="bg-white border rounded-xl p-5 space-y-3">
        <div class="flex items-center gap-2">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Program documents</h2>
          ${infoBtn('progdoc-tip')}
        </div>
        ${infoPop('progdoc-tip', `<strong class="text-indigo-300 block mb-2">SimpleAML is the register — not the cabinet</strong>
          <p>Your actual program documents (Word files, PDFs) must be stored somewhere your firm controls — SharePoint, OneDrive, Google Drive, a physical folder. That is your cabinet.</p>
          <p class="mt-2">SimpleAML is your <strong>register</strong> — it records that these documents exist and points to where they are stored. If AUSTRAC audits your firm, they will ask to see the actual documents. The storage location you enter here tells them — and your staff — exactly where to find them.</p>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">The storage location field is optional — but filling it in turns this register entry into a complete audit trail. A blank register says "we have these documents." A completed register says "we have these documents, and here is exactly where they are."</p>`)}
        <p class="text-xs text-slate-400">For each document, note where it is stored in your firm's filing system. SimpleAML records that it exists — your storage location tells an auditor where to find it.</p>
        ${docs.map(([id,title,desc])=>`
          <div class="border rounded-lg p-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold">${title}</div>
              <a href="https://simpleaml.com.au/templates.html" target="_blank" rel="noopener" class="text-xs text-indigo-500 hover:text-indigo-700 whitespace-nowrap ml-2">Template →</a>
            </div>
            <div class="text-xs text-slate-400 mb-2">${desc}</div>
            <div class="flex items-center gap-2">
              <span class="text-xs ${(p.docs||{})[id] ? 'text-green-600 font-semibold' : 'text-slate-400'}">
                ${(p.docs||{})[id] ? '✓ Location noted' : 'Location not noted'}
              </span>
              <input type="text" class="inp flex-1 text-xs" placeholder="Where is this stored? e.g. SharePoint > AML > Program"
                value="${(p.docNotes||{})[id]||''}"
                onchange="setProgramDoc('${id}',this.value)">
            </div>
          </div>`).join('')}
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Senior manager approval</h2>
        <p class="text-xs text-slate-400">The AML/CTF program must be formally approved by a senior manager. This record serves as evidence for AUSTRAC review purposes.</p>
        <div class="space-y-3">
          <div><label class="text-xs text-slate-500">Approved by (senior manager) *</label><input id="pg-approved-by" type="text" class="inp mt-1" value="${p.approvedBy||''}" placeholder="Full name"></div>
          <div><label class="text-xs text-slate-500">Title / position</label><input id="pg-approved-title" type="text" class="inp mt-1" value="${p.approvedTitle||''}" placeholder="e.g. Principal / Managing Partner"></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs text-slate-500">Approval date *</label><input id="pg-approved-date" type="date" class="inp mt-1" value="${p.approvedDate||''}" onchange="autoSetProgramReview(this.value)"></div>
            <div><label class="text-xs text-slate-500">Version</label><input id="pg-version" type="text" class="inp mt-1" value="${p.version||''}" placeholder="e.g. v1.0 — July 2026"></div>
          </div>
          <div>
            <label class="text-xs text-slate-500 flex items-center gap-1">
              Next review date <span class="text-indigo-400 font-normal">(auto-set to +1 year)</span>
              <span onclick="var t=document.getElementById('review-why-tip');t.style.display=t.style.display==='block'?'none':'block'" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:#6366f1;color:#fff;font-size:9px;font-weight:700;cursor:pointer;flex-shrink:0;">i</span>
            </label>
            <div id="review-why-tip" style="display:none;" class="bg-slate-800 text-slate-200 rounded-xl p-4 text-xs leading-relaxed mt-2 mb-2 space-y-2">
              <div class="font-bold text-indigo-300 mb-1">Why annual review is the accepted standard</div>
              <p>AUSTRAC requires reporting entities to regularly review and update their AML/CTF Program to ensure it remains appropriate to their risks. In practice, this means <strong class="text-white">at least annually</strong> — anything less frequent is very hard to defend in an evaluation.</p>
              <p class="mt-1">Your program must be updated when your services change, your client base changes, AUSTRAC guidance changes, your risk assessment changes, or staff roles change. Waiting two or three years would be seen as neglect of governance obligations.</p>
              <p class="mt-1">An evaluator will ask: <em>"How often do you review your AML Program?"</em> The only defensible answer is: <em>"Annually — and here is the evidence."</em></p>
              <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Annual review demonstrates active governance. It is what separates a firm that has an AML program from a firm that is actually running one.</p>
            </div>
            <input id="pg-next-review" type="date" class="inp mt-1" value="${p.nextReview||''}">
          </div>
          <div><label class="text-xs text-slate-500">Governing body notified</label>
            <select id="pg-notified" class="inp mt-1">
              <option value="Yes" ${p.notified==='Yes'?'selected':''}>Yes — board/owners notified</option>
              <option value="No" ${p.notified==='No'?'selected':''}>No — not yet notified</option>
              <option value="NA" ${p.notified==='NA'?'selected':''}>N/A — sole trader</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <label class="flex items-start gap-2 text-xs text-slate-500 cursor-pointer">
          <input type="checkbox" id="pg-confirm" ${p.confirmed?'checked':''} class="mt-0.5">
          <span>I confirm the AML/CTF program is in place and has been approved by the senior manager named above.</span>
        </label>
      </div>
      ${p.approvedBy ? `<div class="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
        <strong>Current approval:</strong> ${p.approvedBy}${p.approvedTitle?' ('+p.approvedTitle+')':''} — ${p.approvedDate||'date not set'} — ${p.version||'version not set'}
        ${p.nextReview ? `· Next review: <strong>${p.nextReview}</strong>` : ''}
      </div>` : ''}
      <button onclick="saveProgram()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">${p.approvedBy ? 'Save New Approval (previous version will be preserved)' : 'Save AML/CTF Program'}</button>

      ${(p.approvalHistory||[]).length > 0 ? `
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Approval history</h2>
        <p class="text-xs text-slate-400">All previous approvals are permanently recorded. This is your governance audit trail.</p>
        <div class="space-y-2">
          ${(p.approvalHistory||[]).map((v,i) => `
            <div class="bg-slate-50 border rounded-lg p-3 text-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-slate-700">Version ${(p.approvalHistory||[]).length - i} — ${v.approvedDate||'—'}</span>
                <span class="text-slate-400">${v.version||'—'}</span>
              </div>
              <div class="text-slate-500">Approved by: ${v.approvedBy||'—'}${v.approvedTitle?' ('+v.approvedTitle+')':''}</div>
              <div class="text-slate-400 mt-0.5">Next review was: ${v.nextReview||'—'} · Governing body notified: ${v.notified||'—'}</div>
            </div>`).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.setProgramDoc = function(id, val) {
  if (!S.program.docs) S.program.docs = {};
  if (!S.program.docNotes) S.program.docNotes = {};
  S.program.docs[id] = !!val;
  S.program.docNotes[id] = val;
  save();
};
window.autoSetRiskReview = function(val) {
  if (!val) return;
  const d = new Date(val);
  d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('risk-next-review');
  if (el && !el.value) { el.value = next; scopeField('nextReview', next); }
};
window.autoSetProgramReview = function(val) {
  if (!val) return;
  const d = new Date(val);
  d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('pg-next-review');
  if (el && !el.value) el.value = next;
};
window.saveProgram = function() {
  const approvedBy = document.getElementById('pg-approved-by')?.value||'';
  if (!approvedBy) { toast('Approved by is required', 'err'); return; }
  // Push current approval into history before overwriting
  if (S.program.approvedBy && S.program.approvedDate) {
    if (!S.program.approvalHistory) S.program.approvalHistory = [];
    S.program.approvalHistory.unshift({
      approvedBy: S.program.approvedBy,
      approvedTitle: S.program.approvedTitle||'',
      approvedDate: S.program.approvedDate,
      version: S.program.version||'',
      nextReview: S.program.nextReview||'',
      notified: S.program.notified||'',
      savedAt: Date.now()
    });
  }
  S.program.approvedBy = approvedBy;
  S.program.approvedTitle = document.getElementById('pg-approved-title')?.value||'';
  S.program.approvedDate = document.getElementById('pg-approved-date')?.value||'';
  S.program.version = document.getElementById('pg-version')?.value||'';
  S.program.nextReview = document.getElementById('pg-next-review')?.value||'';
  S.program.notified = document.getElementById('pg-notified')?.value||'';
  S.program.confirmed = document.getElementById('pg-confirm')?.checked||false;
  const isUpdate = S.program.approvalHistory && S.program.approvalHistory.length > 0;
  save();
  toast(isUpdate ? 'New approval saved — previous version preserved in history' : 'AML/CTF Program saved');
  go('program');
};
