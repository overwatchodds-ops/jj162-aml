import { S, save } from '../state/index.js';

export function screen() {
  return `
    <div class="py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold">About &amp; Support</h1>
        <p class="text-slate-400 text-sm mt-1">Product information and contact details</p>
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-5">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">About this product</h2>
        <div class="flex items-center gap-4">
          <div style="width:48px;height:48px;border-radius:12px;background:#4F46E5;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;">SA</div>
          <div>
            <div class="font-semibold text-slate-800">SimpleAML</div>
            <div class="text-xs text-slate-400 mt-0.5">Accountants Edition &middot; v2.0 &middot; March 2026</div>
          </div>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed">SimpleAML is an AML/CTF compliance tool for Australian accountants, built to help practices meet their Tranche 2 obligations before 1 July 2026. No account required. Data stays on your device.</p>
        <div class="border-t border-slate-100 pt-4">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Developed by</div>
          <div class="text-sm text-slate-700 font-medium">Click Seed Pty Ltd &middot; ABN 87 656 256 567</div>
        </div>
        <div class="border-t border-slate-100 pt-4">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">What&apos;s new — v2.0</div>
          <div class="space-y-1 text-xs text-slate-500">
            <div>&middot; Simplified navigation and tab structure</div>
            <div>&middot; Clearer firm setup flow</div>
            <div>&middot; Improved AUSTRAC Enrolment page</div>
            <div>&middot; Document language updated</div>
            <div>&middot; Stay-in-touch modal added</div>
          </div>
        </div>
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
          SimpleAML is provided for compliance assistance only and does not constitute legal advice. Users are responsible for their own AUSTRAC compliance. Click Seed Pty Ltd makes no warranty as to accuracy or fitness for purpose.
        </div>
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Support</h2>
        <p class="text-sm text-slate-500 leading-relaxed">For technical support, questions, or feedback about this product, please feel free to contact us.</p>
        <div class="space-y-2">
          <a href="https://simpleaml.com.au/faq.html" target="_blank" rel="noopener" class="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition no-underline">
            <span>FAQ &amp; Support</span><span class="text-slate-400 text-xs">&rarr;</span>
          </a>
          <a href="https://simpleaml.com.au/templates.html" target="_blank" rel="noopener" class="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition no-underline">
            <span>Free Templates</span><span class="text-slate-400 text-xs">&rarr;</span>
          </a>
          <a href="https://simpleaml.com.au/partners.html" target="_blank" rel="noopener" class="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition no-underline">
            <span>Partners &amp; Supporters</span><span class="text-slate-400 text-xs">&rarr;</span>
          </a>
          <a href="https://simpleaml.com.au/disclaimer.html" target="_blank" rel="noopener" class="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition no-underline">
            <span>Disclaimer &amp; Terms of Use</span><span class="text-slate-400 text-xs">&rarr;</span>
          </a>
          <a href="https://simpleaml.com.au/contact.html" target="_blank" rel="noopener" class="flex items-center justify-between px-4 py-3 bg-indigo-600 rounded-xl text-sm text-white font-semibold hover:bg-indigo-700 transition no-underline">
            <span>Contact Support</span><span class="text-indigo-300 text-xs">&rarr;</span>
          </a>
        </div>
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Backup &amp; Restore</h2>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
          SimpleAML stores data only in your browser. If you clear your browser data or change devices, your records will be lost. Export a backup regularly and store it securely.
        </div>
        <div class="flex gap-3">
          <button onclick="exportData()" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Export SimpleAML Data (JSON)</button>
          <button onclick="document.getElementById('import-file').click()" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Import SimpleAML Backup</button>
          <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)">
        </div>
      </div>
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
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
