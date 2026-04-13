import { S } from '../state/index.js';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}
function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function screen() {
  const sc = S.scope  || {};
  const p  = S.program || {};
  const f  = S.firm   || {};
  const appt = f.appt || {};

  // ── STATUS CHECKS ─────────────────────────────────────────────────────────
  const firmComplete    = !!(f.name && f.savedDate);
  const apptComplete    = !!(appt.amlco?.name && appt.senior?.name);
  const apptOverdue     = apptComplete && isOverdue(appt.nextReview);
  const riskComplete    = !!(sc.classifierConfirmed && sc.mltfConfirmed && sc.serviceRating && sc.customerRating && sc.geoRating && sc.overallRating && sc.pfRating);
  const riskOverdue     = riskComplete && isOverdue(sc.riskNextReview);
  const programComplete = !!(p.approvedBy && p.approvedDate);
  const programOverdue  = programComplete && isOverdue(p.nextReview);
  const enrolled        = !!(S.enrolment?.enrolled || S.austracConfirmed);
  const allOk           = firmComplete && apptComplete && !apptOverdue && riskComplete && !riskOverdue && programComplete && !programOverdue && enrolled;

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const statusBadge = (ok, overdue) => {
    if (!ok)     return `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">Incomplete</span>`;
    if (overdue) return `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fffbeb;color:#92400e;">Overdue</span>`;
    return             `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Complete</span>`;
  };

  const actionBtn = (ok, screen) =>
    `<button onclick="event.stopPropagation();go('${screen}')" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:500;">${ok ? 'Review →' : 'Complete →'}</button>`;

  const tableRow = (label, ok, overdue, completedDate, nextDate, screen, incompleteNote) => `
    <tr onclick="go('${screen}')" style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <td style="padding:12px 16px;font-size:12px;font-weight:500;color:#0f172a;">${label}</td>
      <td style="padding:12px 16px;">${statusBadge(ok, overdue)}</td>
      <td style="padding:12px 16px;font-size:11px;color:#64748b;">${completedDate ? fmtDate(completedDate) : '<span style="color:#cbd5e1;">—</span>'}</td>
      <td style="padding:12px 16px;font-size:11px;color:${overdue ? '#92400e' : ok && nextDate ? '#166534' : '#94a3b8'};">
        ${!ok ? `<span style="color:#94a3b8;">${incompleteNote}</span>` : !nextDate ? '<span style="color:#94a3b8;font-style:italic;">Not set</span>' : overdue ? `Was due ${fmtDate(nextDate)}` : fmtDate(nextDate)}
      </td>
      <td style="padding:12px 16px;text-align:right;">${actionBtn(ok, screen)}</td>
    </tr>`;

  const riskBadge = (rating) => {
    if (!rating) return `<span style="font-size:11px;color:#94a3b8;">—</span>`;
    const col = rating === 'High' ? '#991b1b' : rating === 'Medium' ? '#92400e' : '#166534';
    const bg  = rating === 'High' ? '#fef2f2' : rating === 'Medium' ? '#fffbeb' : '#f0fdf4';
    return `<span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:99px;background:${bg};color:${col};">${rating}</span>`;
  };

  return `<div style="max-width:860px;">

    <!-- HEADER -->
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Compliance</h1>
      <p style="font-size:13px;color:#64748b;">AML/CTF compliance obligations — firm profile, appointments, risk assessment, program and enrolment.</p>
    </div>

    ${allOk ? `
    <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:10px;padding:12px 16px;font-size:13px;color:#166534;margin-bottom:16px;">
      All compliance obligations are complete and current.
    </div>` : ''}

    <!-- STATUS TABLE -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
            <th style="text-align:left;padding:10px 16px;font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Obligation</th>
            <th style="text-align:left;padding:10px 16px;font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;width:110px;">Status</th>
            <th style="text-align:left;padding:10px 16px;font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;width:120px;">Completed</th>
            <th style="text-align:left;padding:10px 16px;font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Next review</th>
            <th style="width:90px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr onclick="go('firm-details')" style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
            <td style="padding:12px 16px;font-size:12px;font-weight:500;color:#0f172a;">Firm Profile</td>
            <td style="padding:12px 16px;">${statusBadge(firmComplete, false)}</td>
            <td style="padding:12px 16px;font-size:11px;color:#64748b;">${f.savedDate ? fmtDate(f.savedDate) : '<span style="color:#cbd5e1;">—</span>'}</td>
            <td style="padding:12px 16px;font-size:11px;color:#94a3b8;font-style:italic;">No review required</td>
            <td style="padding:12px 16px;text-align:right;">${actionBtn(firmComplete, 'firm-details')}</td>
          </tr>
          ${tableRow('Appointments',   apptComplete,    apptOverdue,    appt.savedDate,           appt.nextReview,     'firm-appointments', 'Name AMLCO, Reporting Officer, Senior Manager')}
          ${tableRow('Risk Assessment',riskComplete,    riskOverdue,    sc.riskAssessmentDate,    sc.riskNextReview,   'risk',              'Complete all five risk screens')}
          ${tableRow('AML/CTF Program',programComplete, programOverdue, p.approvedDate,           p.nextReview,        'program',           'Approve and document your program')}
          <tr onclick="go('enrolment')" style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
            <td style="padding:12px 16px;font-size:12px;font-weight:500;color:#0f172a;">AUSTRAC Enrolment</td>
            <td style="padding:12px 16px;">${enrolled ? `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Confirmed</span>` : `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">Not confirmed</span>`}</td>
            <td style="padding:12px 16px;font-size:11px;color:#94a3b8;font-style:italic;">One-time</td>
            <td style="padding:12px 16px;font-size:11px;color:#94a3b8;font-style:italic;">No annual review required</td>
            <td style="padding:12px 16px;text-align:right;">${actionBtn(enrolled, 'enrolment')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- RISK SUMMARY (if complete) -->
    ${riskComplete ? `
    <div onclick="go('overallrisk')" style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:16px;cursor:pointer;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe'" onmouseout="this.style.borderColor='#e2e8f0'">
      <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:14px;">Risk assessment summary</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:${sc.pfRating ? '10px' : '0'};">
        ${[
          ['Service',   sc.serviceRating  || sc.serviceRatingOverride],
          ['Customer',  sc.customerRating || sc.clientRatingOverride],
          ['Geography', sc.geoRating      || sc.geoRatingOverride],
          ['Overall',   sc.overallRating  || sc.overallRatingOverride],
        ].map(([label, rating]) => `
        <div style="text-align:center;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:6px;">${label}</div>
          ${riskBadge(rating)}
        </div>`).join('')}
      </div>
      ${sc.pfRating ? `<div style="font-size:11px;color:#94a3b8;">PF risk: <span style="color:#64748b;font-weight:500;">${sc.pfRating}</span></div>` : ''}
    </div>` : ''}

    <!-- PROGRAM DETAIL (if complete) -->
    ${programComplete ? `
    <div onclick="go('program')" style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:18px 20px;cursor:pointer;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe'" onmouseout="this.style.borderColor='#e2e8f0'">
      <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:6px;">AML/CTF Program approval</div>
      <div style="font-size:12px;color:#64748b;">
        Approved by <span style="color:#0f172a;font-weight:500;">${p.approvedBy}</span>${p.approvedTitle ? ` (${p.approvedTitle})` : ''} on ${fmtDate(p.approvedDate)}${p.version ? ` · ${p.version}` : ''}
      </div>
    </div>` : ''}

  </div>`;
}
