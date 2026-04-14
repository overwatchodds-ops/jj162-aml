import { S } from '../state/index.js';

export function screen() {
  return `
    <div style="max-width:680px;padding:32px 0;">

      <div style="margin-bottom:24px;">
        <h1 style="font-size:20px;font-weight:600;color:#0f172a;margin:0 0 4px;">Account Backup</h1>
        <p style="font-size:12px;color:#94a3b8;margin:0;">Export and restore your SimpleAML compliance data.</p>
      </div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:12px;">Why you should back up regularly</div>
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0 0 10px;">SimpleAML stores all data locally in your browser. If you clear your browser data, change devices, or your browser storage is corrupted, your records will be lost.</p>
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0 0 16px;">To meet AUSTRAC's seven-year record-keeping obligation, export your data regularly and store it securely outside the browser — for example in SharePoint, Google Drive, or a secure network folder.</p>
        <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:12px 14px;font-size:11px;color:#92400e;line-height:1.5;">
          Export your backup after every significant compliance action — new client, staff change, program update, or report generation.
        </div>
      </div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:8px;">Export Data</div>
        <p style="font-size:12px;color:#64748b;margin:0 0 14px;">Downloads a JSON file containing all your SimpleAML compliance records. Store this file securely.</p>
        <button onclick="exportData()" style="width:100%;font-size:12px;font-weight:500;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:10px;border-radius:8px;cursor:pointer;">
          Export SimpleAML Data (JSON)
        </button>
      </div>

      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:8px;">Restore from Backup</div>
        <p style="font-size:12px;color:#64748b;margin:0 0 12px;">Restores your SimpleAML data from a previously exported JSON file. This will replace all current data.</p>
        <div style="background:#fef2f2;border:0.5px solid #fecaca;border-radius:8px;padding:12px 14px;font-size:11px;color:#991b1b;line-height:1.5;margin-bottom:14px;">
          Warning — importing a backup will overwrite all existing data in this browser. This cannot be undone.
        </div>
        <button onclick="document.getElementById('import-file').click()" style="width:100%;font-size:12px;font-weight:500;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:10px;border-radius:8px;cursor:pointer;">
          Import SimpleAML Backup
        </button>
        <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)">
      </div>

    </div>`;
}
