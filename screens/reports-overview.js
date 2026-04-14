import { S } from '../state/index.js';

export function screen() {
  const history = S.report?.history || [];
  const lastGenerated = history[0] || null;

  return `
    <div style="max-width:680px;">
      <div style="margin-bottom:24px;">
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Reports</h1>
        <p style="font-size:13px;color:#64748b;">Generate and manage your AML/CTF compliance reports.</p>
      </div>

      <!-- REPORT STATUS -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
          <div>
            <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:3px;">AML/CTF Compliance Report</div>
            <div style="font-size:11px;color:#94a3b8;">A full summary of your firm's AML/CTF compliance records across all sections.</div>
          </div>
          ${lastGenerated
            ? `<span style="font-size:10px;font-weight:500;padding:2px 10px;border-radius:99px;background:#f0fdf4;color:#166534;white-space:nowrap;margin-left:12px;">Generated</span>`
            : `<span style="font-size:10px;font-weight:500;padding:2px 10px;border-radius:99px;background:#fffbeb;color:#92400e;white-space:nowrap;margin-left:12px;">Not yet generated</span>`}
        </div>

        ${lastGenerated ? `
        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin-bottom:12px;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:3px;">Last generated</div>
          <div style="font-size:12px;font-weight:500;color:#0f172a;">${lastGenerated.date}</div>
          ${lastGenerated.location ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Stored: ${lastGenerated.location}</div>` : ''}
        </div>` : `
        <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:11px;color:#92400e;margin-bottom:12px;">
          No report has been generated yet. Generate your first report to create a compliance summary you can file and retain for the 7-year AUSTRAC requirement.
        </div>`}

        <button onclick="go('report')" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;">
          ${lastGenerated ? 'Generate New Report' : 'Generate First Report'} →
        </button>
      </div>

      <!-- REPORT HISTORY -->
      ${history.length > 0 ? `
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Generation history</div>
        <div>
          ${history.slice(0, 5).map((h, i) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid #f1f5f9;">
              <div>
                <div style="font-size:12px;font-weight:500;color:#0f172a;">${h.date}</div>
                ${h.location ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Stored: ${h.location}</div>` : `<div style="font-size:11px;color:#cbd5e1;font-style:italic;margin-top:2px;">Storage location not recorded</div>`}
              </div>
            </div>`).join('')}
          ${history.length > 5 ? `<div style="font-size:11px;color:#94a3b8;padding-top:6px;">+ ${history.length - 5} more — <button onclick="go('report')" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;text-decoration:underline;">view all</button></div>` : ''}
        </div>
      </div>` : ''}

      <!-- WHAT THE REPORT CONTAINS -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">What this report contains</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${['1. Firm profile — practice details and compliance appointments',
             '2. AML/CTF risk assessment — designated services, inherent risk ratings',
             '3. AML/CTF program — documents, approval history',
             '4. AUSTRAC enrolment — controls declaration, enrolment details',
             '5. Staff assessment & vetting — Key Personnel, fit & proper checks',
             '6. AML/CTF training register — training records',
             '7. Client register — CDD status, entity types',
             '8. SMR & incident register — suspicious matter reports'
          ].map(item => `<div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#6366f1;flex-shrink:0;">→</span>${item}</div>`).join('')}
        </div>
        <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:11px;color:#92400e;line-height:1.6;margin-top:12px;">
          This report must be retained for <strong>7 years</strong> as required under the AML/CTF Act 2006. Save the generated PDF to your firm's records immediately after generation.
        </div>
      </div>
    </div>`;
}
