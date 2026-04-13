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
    <div style="max-width:680px;">
      <div style="margin-bottom:20px;"><h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">AML/CTF Program</h1><p style="font-size:13px;color:#64748b;">Attach your program documents and record senior manager sign-off.</p></div>
      <div style="background:#eff6ff;border:0.5px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:11px;color:#1e40af;margin-bottom:16px;">These documents are <strong>internal records held by your firm — not submitted to AUSTRAC</strong>. They are the primary evidence reviewed in your annual compliance program review and examined by your independent evaluator every 3 years (~2029).</div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
          <span style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Program documents</span>
          ${infoBtn('progdoc-tip')}
        </div>
        ${infoPop('progdoc-tip', `<strong class="text-indigo-300 block mb-2">SimpleAML is the register — not the cabinet</strong>
          <p>Your actual program documents (Word files, PDFs) must be stored somewhere your firm controls — SharePoint, OneDrive, Google Drive, a physical folder. That is your cabinet.</p>
          <p class="mt-2">SimpleAML is your <strong>register</strong> — it records that these documents exist and points to where they are stored. If AUSTRAC audits your firm, they will ask to see the actual documents. The storage location you enter here tells them — and your staff — exactly where to find them.</p>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">The storage location field is optional — but filling it in turns this register entry into a complete audit trail. A blank register says "we have these documents." A completed register says "we have these documents, and here is exactly where they are."</p>`)}
        <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">For each document, note where it is stored in your firm's filing system. SimpleAML records that it exists — your storage location tells an auditor where to find it.</p>
        ${docs.map(([id,title,desc])=>`
          <div style="border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <div style="font-size:12px;font-weight:500;color:#0f172a;">${title}</div>
              <a href="https://simpleaml.com.au/templates.html" target="_blank" rel="noopener" style="font-size:11px;color:#6366f1;white-space:nowrap;margin-left:8px;text-decoration:none;">Template →</a>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">${desc}</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:10px;font-weight:500;white-space:nowrap;color:${(p.docs||{})[id] ? '#166534' : '#94a3b8'};">
                ${(p.docs||{})[id] ? '✓ Noted' : 'Not noted'}
              </span>
              <input type="text" class="inp" style="flex:1;" placeholder="Where is this stored? e.g. SharePoint > AML > Program"
                value="${(p.docNotes||{})[id]||''}"
                onchange="setProgramDoc('${id}',this.value)">
            </div>
          </div>`).join('')}
      </div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">Senior manager approval</div>
        <p style="font-size:11px;color:#94a3b8;margin-bottom:14px;">The AML/CTF program must be formally approved by a senior manager. This record serves as evidence for AUSTRAC review purposes.</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Approved by (senior manager) *</label><input id="pg-approved-by" type="text" class="inp" value="${p.approvedBy||''}" placeholder="Full name"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Title / position</label><input id="pg-approved-title" type="text" class="inp" value="${p.approvedTitle||''}" placeholder="e.g. Principal / Managing Partner"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Approval date *</label><input id="pg-approved-date" type="date" class="inp" value="${p.approvedDate||''}" onchange="autoSetProgramReview(this.value)"></div>
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Version</label><input id="pg-version" type="text" class="inp" value="${p.version||''}" placeholder="e.g. v1.0 — July 2026"></div>
          </div>
          <div>
            <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;margin-bottom:5px;">
              Next review date <span style="color:#818cf8;">(auto-set to +1 year)</span>
              <span onclick="var t=document.getElementById('review-why-tip');t.style.display=t.style.display==='block'?'none':'block'" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:#6366f1;color:#fff;font-size:9px;font-weight:700;cursor:pointer;flex-shrink:0;">i</span>
            </label>
            <div id="review-why-tip" style="display:none;background:#1e293b;color:#cbd5e1;border-radius:10px;padding:14px 16px;font-size:11px;line-height:1.6;margin:6px 0;">
              <div style="font-weight:600;color:#a5b4fc;margin-bottom:6px;">Why annual review is the accepted standard</div>
              <p>AUSTRAC requires reporting entities to regularly review and update their AML/CTF Program to ensure it remains appropriate to their risks. In practice, this means <strong class="text-white">at least annually</strong> — anything less frequent is very hard to defend in an evaluation.</p>
              <p style="margin-top:6px;">Your program must be updated when your services change, your client base changes, AUSTRAC guidance changes, your risk assessment changes, or staff roles change. Waiting two or three years would be seen as neglect of governance obligations.</p>
              <p style="margin-top:6px;">An evaluator will ask: <em>"How often do you review your AML Program?"</em> The only defensible answer is: <em>"Annually — and here is the evidence."</em></p>
              <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Annual review demonstrates active governance. It is what separates a firm that has an AML program from a firm that is actually running one.</p>
            </div>
            <input id="pg-next-review" type="date" class="inp" value="${p.nextReview||''}">
          </div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Governing body notified</label>
            <select id="pg-notified" class="inp">
              <option value="Yes" ${p.notified==='Yes'?'selected':''}>Yes — board/owners notified</option>
              <option value="No" ${p.notified==='No'?'selected':''}>No — not yet notified</option>
              <option value="NA" ${p.notified==='NA'?'selected':''}>N/A — sole trader</option>
            </select>
          </div>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:11px;color:#64748b;cursor:pointer;">
          <input type="checkbox" id="pg-confirm" ${p.confirmed?'checked':''} style="margin-top:2px;flex-shrink:0;">
          <span>I confirm the AML/CTF program is in place and has been approved by the senior manager named above.</span>
        </label>
      </div>
      ${p.approvedBy ? `<div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:8px;padding:10px 14px;font-size:11px;color:#166534;margin-bottom:10px;">
        <strong>Current approval:</strong> ${p.approvedBy}${p.approvedTitle?' ('+p.approvedTitle+')':''} — ${p.approvedDate||'date not set'} — ${p.version||'version not set'}
        ${p.nextReview ? `· Next review: <strong>${p.nextReview}</strong>` : ''}
      </div>` : ''}
      <button onclick="saveProgram()" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;margin-bottom:8px;">${p.approvedBy ? 'Save New Approval (previous version will be preserved)' : 'Save AML/CTF Program'}</button>
      
      <button onclick="go('enrolment')" style="width:100%;font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:9px 16px;border-radius:8px;cursor:pointer;margin-bottom:6px;">Continue to AUSTRAC Enrolment →</button>
      <button onclick="go('home')" style="width:100%;font-size:12px;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:9px 16px;border-radius:8px;cursor:pointer;">Return to Home</button>

      ${(p.approvalHistory||[]).length > 0 ? `
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Approval history</div>
        <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">All previous approvals are permanently recorded. This is your governance audit trail.</p>
        <div>
          ${(p.approvalHistory||[]).map((v,i) => `
            <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:11px;font-weight:500;color:#0f172a;">Version ${(p.approvalHistory||[]).length - i} — ${v.approvedDate||'—'}</span>
                <span style="font-size:11px;color:#94a3b8;">${v.version||'—'}</span>
              </div>
              <div style="font-size:11px;color:#64748b;">Approved by: ${v.approvedBy||'—'}${v.approvedTitle?' ('+v.approvedTitle+')':''}</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Next review was: ${v.nextReview||'—'} · Governing body notified: ${v.notified||'—'}</div>
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
