import { S, save } from '../state/index.js';

export function screen() {
  const reportHistory = S.report?.history || [];
  const storageLocation = S.report?.storageLocation || '';
  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div>
        <h1 class="text-2xl font-bold">AML/CTF Compliance Report</h1>
        <p class="text-slate-400 text-sm mt-1">Generate a summary of your firm's AML/CTF compliance records to assist in completing AUSTRAC's Compliance Report when requested.</p>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
        AUSTRAC requires reporting entities to submit a Compliance Report when requested (typically annually). This report helps you prepare the required information. <strong>It is not submitted to AUSTRAC directly.</strong>
        Your live compliance status is always visible on the <button onclick="go('dashboard')" class="underline font-semibold text-indigo-600 bg-transparent border-0 cursor-pointer p-0">Dashboard</button>.
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">What this report contains</h2>
        <div class="space-y-1 text-xs text-slate-500">
          ${['1. Firm profile — practice details and compliance appointments','2. AML/CTF risk assessment — designated services, inherent risk ratings, risk appetite','3. AML/CTF Program — documents, approval history','4. AUSTRAC enrolment — controls declaration, residual risk, enrolment details','5. Staff assessment & vetting — Key Personnel, fit & proper checks','6. AML/CTF training register — training records for AML/CTF staff','7. Client register — CDD status, entity types, new/ongoing/dormant summary','8. SMR & incident register — suspicious matter reports and threshold transactions'].map(item=>`<div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0">→</span>${item}</div>`).join('')}
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
        <strong>SimpleAML is your AML/CTF compliance register.</strong> By generating this report you confirm that you have sighted all underlying evidence documents and stored copies in your firm's records. This report must be retained for 7 years from the date of generation as required under the AML/CTF Act 2006.
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Report storage location <span class="normal-case font-normal text-slate-400 ml-1">(optional)</span></h2>
        <p class="text-xs text-slate-400">Record where you have saved the downloaded PDF — e.g. SharePoint, Google Drive, or a shared folder. This appears in your generation history below.</p>
        <input type="text" class="inp text-xs" placeholder="e.g. SharePoint > Compliance > AML Reports > 2026" value="${storageLocation}" oninput="reportField('storageLocation',this.value)">
      </div>

      <button onclick="generateReport()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">Generate AML/CTF Compliance Report (PDF)</button>
      <p class="text-xs text-slate-400 text-center">This document summarises your AML/CTF records to assist with AUSTRAC's Compliance Report. It is not submitted to AUSTRAC.</p>

      ${reportHistory.length > 0 ? `
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Generation history</h2>
        <p class="text-xs text-slate-400">A log of when this report was generated and where it was saved. You can remove any entry.</p>
        <div class="space-y-1">
          ${reportHistory.map((h,i)=>`
            <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
              <div>
                <div class="text-xs font-semibold text-slate-700">${h.date}</div>
                ${h.location ? `<div class="text-xs text-slate-400 mt-0.5">Stored: ${h.location}</div>` : `<div class="text-xs text-slate-400 italic mt-0.5">Storage location not recorded</div>`}
              </div>
              <button onclick="deleteReportHistory(${i})" class="text-xs text-slate-300 hover:text-red-500 transition flex-shrink-0">Remove</button>
            </div>`).join('')}
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
      for (const key in data) { localStorage.setItem(key, data[key]); }
      location.reload();
    } catch(err) {
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
