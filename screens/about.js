import { S } from '../state/index.js';

export function screen() {
  return `
    <div style="max-width:680px;padding:32px 0;">

      <div style="margin-bottom:24px;">
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">About SimpleAML</h1>
        <p style="font-size:12px;color:#94a3b8;margin:0;">Product information and release notes.</p>
      </div>

      <!-- IDENTITY CARD -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
          <div style="width:44px;height:44px;border-radius:10px;background:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;">SA</div>
          <div>
            <div style="font-size:13px;font-weight:500;color:#0f172a;">SimpleAML</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Accountants Edition · v2.0 · March 2026</div>
          </div>
        </div>
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0 0 10px;">SimpleAML is a free, browser-based AML/CTF compliance register for Australian accounting firms. It is designed to help practices meet their Tranche 2 obligations under the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.</p>
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0 0 14px;">No account required. All data is stored locally in your browser on your device.</p>
        <div style="border-top:0.5px solid #f1f5f9;padding-top:12px;font-size:11px;color:#94a3b8;">
          Developed by <strong style="color:#64748b;">Click Seed Pty Ltd</strong> · ABN 87 656 256 567 · <a href="https://simpleaml.com.au" target="_blank" rel="noopener" style="color:#4f46e5;text-decoration:none;">simpleaml.com.au</a>
        </div>
      </div>

      <!-- WHAT'S NEW -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:12px;">What's new — v2.0</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#4f46e5;flex-shrink:0;margin-top:1px;">→</span>Modular architecture — each section is now independently maintained</div>
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#4f46e5;flex-shrink:0;margin-top:1px;">→</span>Redesigned navigation — top nav with group-aware sidebar</div>
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#4f46e5;flex-shrink:0;margin-top:1px;">→</span>Firm split into Firm Details, Appointments, and AUSTRAC Enrolment</div>
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#4f46e5;flex-shrink:0;margin-top:1px;">→</span>AUSTRAC Enrolment simplified to a single attestation</div>
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#4f46e5;flex-shrink:0;margin-top:1px;">→</span>Compliance report rebuilt with contents page and 8 sections</div>
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;"><span style="color:#4f46e5;flex-shrink:0;margin-top:1px;">→</span>Data backup and restore moved to dedicated Account Backup screen</div>
        </div>
      </div>

      <!-- DISCLAIMER -->
      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:14px 16px;font-size:11px;color:#94a3b8;line-height:1.6;">
        SimpleAML is provided for compliance assistance only and does not constitute legal advice. Users are responsible for their own AUSTRAC compliance. Click Seed Pty Ltd makes no warranty as to accuracy or fitness for purpose.
      </div>

    </div>`;
}
