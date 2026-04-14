import { S, save } from '../state/index.js';

export function screen() {
  const reportHistory = S.report?.history || [];
  const storageLocation = S.report?.storageLocation || '';

  return `
    <div style="max-width:680px;">
      <div style="margin-bottom:20px;">
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">AML/CTF Compliance Report</h1>
        <p style="font-size:13px;color:#64748b;">A summary of your firm's AML/CTF compliance records — evidence you can draw on when responding to AUSTRAC's annual compliance questionnaire.</p>
      </div>

      <div style="background:#eff6ff;border:0.5px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin-bottom:14px;">
        <div style="font-size:12px;font-weight:500;color:#1e40af;margin-bottom:8px;">What is the AUSTRAC Annual Compliance Report?</div>
        <p style="font-size:11px;color:#1e40af;line-height:1.6;margin-bottom:6px;">It is an <strong>online questionnaire</strong> you complete and submit directly in AUSTRAC Online — not a PDF or written report. Think of it as a structured form with yes/no and multiple choice questions covering whether you have an AML/CTF program, did a risk assessment, trained your staff, completed customer due diligence, and reported suspicious matters.</p>
        <p style="font-size:11px;color:#1e40af;line-height:1.6;">This SimpleAML report is your <strong>evidence record</strong> — a summary of your compliance activity that you can refer to when answering AUSTRAC's questions. It is not submitted to AUSTRAC.</p>
      </div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">What this report contains</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${[
            '1. Firm profile — practice details and compliance appointments',
            '2. AML/CTF risk assessment — designated services, inherent risk ratings, risk appetite',
            '3. AML/CTF Program — documents, approval history',
            '4. AUSTRAC enrolment — enrolment confirmation',
            '5. Staff assessment & vetting — Key Personnel, fit & proper checks',
            '6. AML/CTF training register — training records for AML/CTF staff',
            '7. Client register — CDD status, entity types, new/ongoing/dormant summary',
            '8. SMR & incident register — suspicious matter reports and threshold transactions'
          ].map(item => `<div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#6366f1;flex-shrink:0;">→</span>${item}</div>`).join('')}
        </div>
      </div>

      <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:10px;padding:12px 16px;font-size:11px;color:#92400e;line-height:1.6;margin-bottom:14px;">
        <strong>SimpleAML is your AML/CTF compliance register.</strong> By generating this report you confirm that you have sighted all underlying evidence documents and stored copies in your firm's records. This report must be retained for 7 years from the date of generation as required under the AML/CTF Act 2006.
      </div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:4px;">Report storage location <span style="font-size:11px;font-weight:400;color:#94a3b8;">(optional)</span></div>
        <p style="font-size:11px;color:#94a3b8;margin-bottom:10px;">Record where you have saved the downloaded PDF — e.g. SharePoint, Google Drive, or a shared folder. This appears in your generation history below.</p>
        <input
          type="text"
          class="inp"
          placeholder="e.g. SharePoint > Compliance > AML Reports > 2026"
          value="${storageLocation}"
          oninput="reportField('storageLocation',this.value)"
        >
      </div>

      <button onclick="generateReport()" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:12px 16px;border-radius:8px;cursor:pointer;margin-bottom:8px;">
        Generate AML/CTF Compliance Report (PDF)
      </button>

      <p style="font-size:11px;color:#94a3b8;text-align:center;margin-bottom:14px;">
        This document summarises your AML/CTF records to assist with AUSTRAC's Compliance Report. It is not submitted to AUSTRAC.
      </p>

      ${reportHistory.length > 0 ? `
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Generation history</div>
        <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">A log of when this report was generated and where it was saved. You can remove any entry.</p>
        <div>
          ${reportHistory.map((h, i) => `
            <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
              <div>
                <div style="font-size:12px;font-weight:500;color:#0f172a;">${h.date}</div>
                ${h.location
                  ? `<div class="text-xs text-slate-400 mt-0.5">Stored: ${h.location}</div>`
                  : `<div class="text-xs text-slate-400 italic mt-0.5">Storage location not recorded</div>`}
              </div>
              <button onclick="deleteReportHistory(${i})" style="font-size:11px;color:#cbd5e1;background:none;border:none;cursor:pointer;flex-shrink:0;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#cbd5e1'">
                Remove
              </button>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.deleteReportHistory = function(i) {
  if (!S.report || !S.report.history) return;
  S.report.history.splice(i, 1);
  save();
  go('report');
};

window.exportData = function() {
  const data = JSON.stringify(localStorage);
  const date = new Date().toISOString().split('T')[0];
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'simpleaml-backup-' + date + '.json';
  a.click();
  URL.revokeObjectURL(url);
};

window.importData = function(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.clear();
      for (const key in data) {
        localStorage.setItem(key, data[key]);
      }
      location.reload();
    } catch (err) {
      alert('Import failed — file may be corrupted or not a valid SimpleAML backup.');
    }
  };
  reader.readAsText(file);
};

window.reportField = function(key, val) {
  if (!S.report) S.report = {};
  S.report[key] = val;
  save();
};

window.generatePDF = window.generateReport = function() {
  if (!S.report) S.report = {};

  const locEl = document.querySelector('.inp.text-xs[placeholder*="SharePoint"]');
  if (locEl) {
    S.report.storageLocation = locEl.value || '';
  }

  if (!S.report.history) S.report.history = [];
  S.report.history.unshift({
    date: new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    location: S.report.storageLocation || ''
  });

  save();

  // Use the standalone report renderer as the single source of truth
  window.open('./report.html', '_blank');
};
