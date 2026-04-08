import { S } from '../state/index.js';

export function screen() {
  return `
    <div class="py-8 space-y-8">

      <div>
        <h1 class="text-2xl font-bold text-slate-900">Account Backup</h1>
        <p class="text-sm text-slate-400 mt-1">Export and restore your SimpleAML compliance data.</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h2 class="text-sm font-bold text-slate-700">Why you should back up regularly</h2>
        <p class="text-sm text-slate-600 leading-relaxed">SimpleAML stores all data locally in your browser. If you clear your browser data, change devices, or your browser storage is corrupted, your records will be lost.</p>
        <p class="text-sm text-slate-600 leading-relaxed">To meet AUSTRAC's seven-year record-keeping obligation, export your data regularly and store it securely outside the browser — for example in SharePoint, Google Drive, or a secure network folder.</p>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          Export your backup after every significant compliance action — new client, staff change, program update, or report generation.
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-700">Export Data</h2>
        <p class="text-sm text-slate-600">Downloads a JSON file containing all your SimpleAML compliance records. Store this file securely.</p>
        <button onclick="exportData()" class="w-full border border-slate-200 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          Export SimpleAML Data (JSON)
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-700">Restore from Backup</h2>
        <p class="text-sm text-slate-600">Restores your SimpleAML data from a previously exported JSON file. This will replace all current data.</p>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
          Warning — importing a backup will overwrite all existing data in this browser. This cannot be undone.
        </div>
        <button onclick="document.getElementById('import-file').click()" class="w-full border border-slate-200 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          Import SimpleAML Backup
        </button>
        <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)">
      </div>

    </div>`;
}
