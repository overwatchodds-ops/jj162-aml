import { S } from '../state/index.js';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function screen() {
  const sc   = S.scope;
  const p    = S.program;
  const f    = S.firm || {};
  const appt = f.appt || {};
  const history = S.report?.history || [];
  const lastGenerated = history[0] || null;

  // ── COMPLIANCE CHECKS ────────────────────────────────────────────────────
  const firmOk     = !!(f.name && f.savedDate);
  const apptOk     = !!(appt.amlco?.name && appt.amlco?.date && appt.senior?.name && appt.reporting?.name && appt.principal2?.name);
  const apptDue    = apptOk && isOverdue(appt.nextReview);
  const riskOk     = !!(sc.classifierConfirmed && sc.mltfConfirmed && sc.serviceRating && sc.customerRating && sc.geoRating && sc.overallRating && sc.pfRating);
  const riskDue    = riskOk && isOverdue(sc.riskNextReview);
  const programOk  = !!(p.approvedBy && p.approvedDate);
  const programDue = programOk && isOverdue(p.nextReview);
  const enrolled   = !!(S.enrolment?.enrolled || S.austracConfirmed);

  // ── PERSONNEL CHECKS ─────────────────────────────────────────────────────
  const active   = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const amlStaff = active.filter(st => st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff');
  const vettedOk = amlStaff.filter(st => {
    if (st.classification === 'Key Personnel') return !!(st.policeResult && st.bankruptResult && st.nsResult && st.declSigned);
    return !!(st.nsResult && st.declSigned);
  }).length;
  const trainingOk    = S.training.filter(t => t.date && t.provider && t.next && !isOverdue(t.next)).length;
  const trainingTotal = S.training.length;

  // ── CLIENT CHECKS ────────────────────────────────────────────────────────
  const totalClients = S.clients.length;
  const cddComplete  = S.clients.filter(c => {
    const inds = c.individuals || [];
    return inds.length > 0 && inds.every(i => i.idOutcome === 'Verified' && i.screenResult) && c.tippingAck && c.cddBy && c.purpose;
  }).length;
  const openSmrs = S.incidents.filter(i => !i.status || i.status === 'Open').length;

  // ── OVERALL SCORE ────────────────────────────────────────────────────────
  const checks = [firmOk, apptOk && !apptDue, riskOk && !riskDue, programOk && !programDue, enrolled];
  const passed  = checks.filter(Boolean).length;
  const total   = checks.length;
  const pct     = Math.round((passed / total) * 100);
  const allGreen = passed === total;
  const scoreColour = allGreen ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const heroBg = allGreen
    ? 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)'
    : pct >= 60 ? 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)'
    : 'linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%)';
  const heroBorder = allGreen ? '#86efac' : pct >= 60 ? '#fde68a' : '#fca5a5';

  // ── DAYS TO DEADLINE ─────────────────────────────────────────────────────
  const deadline     = new Date('2026-07-01T00:00:00+10:00');
  const daysLeft     = Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)));
  const deadlinePassed = daysLeft === 0;

  // ── HELPERS ──────────────────────────────────────────────────────────────
  const pill = (ok, overdue) => {
    if (!ok)     return `<span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">⚠ Incomplete</span>`;
    if (overdue) return `<span style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">↻ Overdue</span>`;
    return       `<span style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">✓ Complete</span>`;
  };

  const card = (icon, title, ok, overdue, detail, screen) => `
    <div onclick="go('${screen}')" style="background:#fff;border:1.5px solid ${!ok ? '#fecaca' : overdue ? '#fde68a' : '#bbf7d0'};border-radius:12px;padding:14px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;transition:box-shadow .15s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:20px;flex-shrink:0;">${icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:2px;">${title}</div>
        <div style="font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${detail}</div>
      </div>
      ${pill(ok, overdue)}
    </div>`;

  const stat = (value, label, sub, colour, screen) => `
    <div onclick="go('${screen}')" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 16px;cursor:pointer;text-align:center;transition:box-shadow .15s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:30px;font-weight:800;color:${colour};line-height:1;margin-bottom:5px;">${value}</div>
      <div style="font-size:12px;font-weight:600;color:#0f172a;margin-bottom:2px;">${label}</div>
      <div style="font-size:10px;color:#94a3b8;">${sub}</div>
    </div>`;

  return `<div class="py-8 space-y-6">

    <!-- HEADER -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">${f.name ? f.name + ' · ' : ''}AML/CTF compliance status at a glance.</p>
      </div>
      <button onclick="go('report')" style="background:#4f46e5;color:#fff;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;margin-left:16px;" onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
        Generate Report →
      </button>
    </div>

    <!-- HERO SCORE -->
    <div style="background:${heroBg};border:2px solid ${heroBorder};border-radius:16px;padding:28px 32px;display:flex;align-items:center;gap:32px;">
      <div style="position:relative;width:96px;height:96px;flex-shrink:0;">
        <svg viewBox="0 0 96 96" style="width:96px;height:96px;transform:rotate(-90deg);">
          <circle cx="48" cy="48" r="40" fill="none" stroke="${heroBorder}" stroke-width="10"/>
          <circle cx="48" cy="48" r="40" fill="none" stroke="${scoreColour}" stroke-width="10"
            stroke-dasharray="${(2 * Math.PI * 40).toFixed(2)}"
            stroke-dashoffset="${(2 * Math.PI * 40 * (1 - pct / 100)).toFixed(2)}"
            stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <div style="font-size:22px;font-weight:800;color:${scoreColour};line-height:1;">${pct}%</div>
        </div>
      </div>
      <div style="flex:1;">
        <div style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:6px;">
          ${allGreen ? '✓ Fully compliant' : pct >= 60 ? 'Compliance in progress' : 'Action required'}
        </div>
        <div style="font-size:14px;color:#475569;margin-bottom:12px;">
          ${passed} of ${total} obligations complete${!allGreen ? ` · ${total - passed} still need${total - passed === 1 ? 's' : ''} attention` : ''}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${deadlinePassed
            ? `<span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">⚠ Obligations now in effect from 1 July 2026</span>`
            : `<span style="background:#fff;color:#64748b;border:1px solid #e2e8f0;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">${daysLeft} days to 1 July 2026</span>`}
          ${lastGenerated
            ? `<span style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">✓ Report: ${lastGenerated.date}</span>`
            : `<span style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">⚠ No report generated yet</span>`}
        </div>
      </div>
    </div>

    <!-- OBLIGATIONS -->
    <div>
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Compliance Obligations</div>
      <div class="space-y-2">
        ${card('🏢', 'Firm Profile',      firmOk,    false,      firmOk    ? `Saved ${fmtDate(f.savedDate)}` : 'Enter practice name and contact details', 'firm-details')}
        ${card('👤', 'Appointments',      apptOk,    apptDue,    apptOk    ? `AMLCO: ${appt.amlco?.name}${apptDue ? ' · Review overdue' : appt.nextReview ? ' · Next review ' + fmtDate(appt.nextReview) : ''}` : 'Name your AMLCO, Reporting Officer and Senior Manager', 'firm-appointments')}
        ${card('⚖️', 'Risk Assessment',   riskOk,    riskDue,    riskOk    ? `Overall: ${sc.overallRating || '—'}${riskDue ? ' · Review overdue' : sc.riskNextReview ? ' · Next review ' + fmtDate(sc.riskNextReview) : ''}` : 'Complete all five risk screens', 'risk')}
        ${card('📋', 'AML/CTF Program',   programOk, programDue, programOk ? `Approved by ${p.approvedBy}${programDue ? ' · Review overdue' : p.nextReview ? ' · Next review ' + fmtDate(p.nextReview) : ''}` : 'Approve and document your program', 'program')}
        ${card('🏛️', 'AUSTRAC Enrolment', enrolled,  false,      enrolled  ? 'Confirmed — enrolled with AUSTRAC' : 'Confirm enrolment before 29 July 2026', 'enrolment')}
      </div>
    </div>

    <!-- STATS -->
    <div>
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Personnel &amp; Clients</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
        ${stat(`${vettedOk}/${amlStaff.length}`,  'Staff Vetted',     amlStaff.length === 0 ? 'No AML staff yet' : vettedOk === amlStaff.length ? 'All complete' : `${amlStaff.length - vettedOk} incomplete`,  vettedOk === amlStaff.length && amlStaff.length > 0 ? '#16a34a' : '#d97706', 'staff')}
        ${stat(`${trainingOk}/${trainingTotal}`,   'Training Current', trainingTotal === 0   ? 'No records yet'  : trainingOk === trainingTotal ? 'All up to date' : `${trainingTotal - trainingOk} overdue`,     trainingOk === trainingTotal && trainingTotal > 0 ? '#16a34a' : '#d97706', 'training')}
        ${stat(`${cddComplete}/${totalClients}`,   'CDD Complete',     totalClients === 0    ? 'No clients yet'  : cddComplete === totalClients ? 'All verified' : `${totalClients - cddComplete} incomplete`,    cddComplete === totalClients && totalClients > 0 ? '#16a34a' : totalClients === 0 ? '#94a3b8' : '#d97706', 'clients')}
        ${stat(openSmrs,                           'Open SMRs',        openSmrs === 0        ? 'No open incidents' : `${openSmrs} require${openSmrs === 1 ? 's' : ''} attention`,                                openSmrs === 0 ? '#16a34a' : '#dc2626', 'incidents')}
      </div>
    </div>

    <!-- REPORT CTA -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:22px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px;">
      <div>
        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3px;">AML/CTF Compliance Report (PDF)</div>
        <div style="font-size:12px;color:#64748b;">
          ${lastGenerated
            ? `Last generated ${lastGenerated.date}${lastGenerated.location ? ' · ' + lastGenerated.location : ''}`
            : 'No report generated yet — required for 7-year AUSTRAC retention.'}
        </div>
      </div>
      <button onclick="go('report')" style="background:#4f46e5;color:#fff;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;" onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
        ${lastGenerated ? 'New Report →' : 'Generate →'}
      </button>
    </div>

  </div>`;
}
