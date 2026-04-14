import { S, save } from '../state/index.js';
import { toast } from '../components/index.js';

export function screen() {
  const confirmed = !!(S.enrolment.enrolled || S.austracConfirmed);

  return `
    <div style="max-width:680px;padding:32px 0;">

      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
        <div>
          <h1 style="font-size:20px;font-weight:600;color:#0f172a;margin:0 0 4px;">AUSTRAC Enrolment</h1>
          <p style="font-size:12px;color:#94a3b8;margin:0;">Enrolment is a legal requirement before operating as a reporting entity.</p>
        </div>
        ${confirmed
          ? '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;border:0.5px solid #bbf7d0;white-space:nowrap;">✓ Confirmed</span>'
          : '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fffbeb;color:#92400e;border:0.5px solid #fde68a;white-space:nowrap;">⚠ Not yet confirmed</span>'}
      </div>

      <!-- CONTEXT -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:12px;">What you need to do</div>
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0 0 10px;">
          Before operating as a reporting entity, your firm must be enrolled with AUSTRAC.
          Enrolment is completed directly at austrac.gov.au — SimpleAML cannot do this for you.
        </p>
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0 0 16px;">
          If you have not yet enrolled, complete this now before 1 July 2026.
          Once enrolled, confirm below.
        </p>
        <a href="https://www.austrac.gov.au/business/new-to-austrac/enrol-or-register"
           target="_blank" rel="noopener"
           style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;text-decoration:none;">
          Enrol at austrac.gov.au →
        </a>
      </div>

      <!-- CONFIRMATION -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:12px;">Confirmation</div>
        <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
          <input type="checkbox" id="en-enrolled" ${confirmed ? 'checked' : ''} onchange="confirmAustracEnrolment(this.checked)" style="margin-top:2px;width:14px;height:14px;flex-shrink:0;accent-color:#4f46e5;">
          <span style="font-size:12px;color:#64748b;line-height:1.6;">I confirm this firm is enrolled with AUSTRAC as a reporting entity.</span>
        </label>
        ${confirmed ? `
        <div style="font-size:11px;color:#166534;font-weight:500;margin-top:10px;">
          ✓ Enrolment confirmed — this is recorded in your compliance register.
        </div>` : ''}
      </div>

    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.confirmAustracEnrolment = function(checked) {
  S.austracConfirmed = checked;
  // Keep backward compatibility with S.enrolment.enrolled
  if (!S.enrolment) S.enrolment = {};
  S.enrolment.enrolled = checked;
  save();
  toast(checked ? 'AUSTRAC enrolment confirmed' : 'Enrolment confirmation removed');
};
