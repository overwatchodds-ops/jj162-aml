import { S } from '../state/index.js';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}
function isOverdueDate(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
function vettingStatus(st) {
  const cls = st.classification;
  if (!cls || cls === 'No AML/CTF functions') return 'assessed';
  if (cls === 'Key Personnel') {
    if (st.policeResult && st.bankruptResult && st.nsResult && st.declSigned) return 'complete';
    return 'incomplete';
  }
  if (cls === 'Standard AML/CTF Staff') {
    if (st.nsResult && st.declSigned) return 'complete';
    return 'incomplete';
  }
  return 'incomplete';
}
function cddComplete(c) {
  const inds = c.individuals || [];
  if (!inds.length) return false;
  if (!inds.every(i => i.idOutcome === 'Verified') || !inds.every(i => i.screenResult)) return false;
  if (!c.tippingAck || !c.cddBy || !c.purpose) return false;
  return true;
}
function cddOverdue(c) {
  if (!cddComplete(c)) return false;
  if (!c.nextReviewDate) return false;
  return new Date(c.nextReviewDate) < new Date();
}

export function screen() {
  const sc   = S.scope;
  const p    = S.program;
  const f    = S.firm || {};
  const appt = f.appt || {};
  const now  = new Date();
  const history = S.report?.history || [];
  const lastGenerated = history[0] || null;

  // ── COMPLIANCE ───────────────────────────────────────────────────────────
  const firmOk     = !!(f.name && f.savedDate);
  const apptOk     = !!(appt.amlco?.name && appt.amlco?.date && appt.senior?.name && appt.reporting?.name && appt.principal2?.name);
  const apptDue    = apptOk && isOverdueDate(appt.nextReview);
  const riskOk     = !!(sc.classifierConfirmed && sc.mltfConfirmed && sc.serviceRating && sc.customerRating && sc.geoRating && sc.overallRating && sc.pfRating);
  const riskDue    = riskOk && isOverdueDate(sc.riskNextReview);
  const programOk  = !!(p.approvedBy && p.approvedDate);
  const programDue = programOk && isOverdueDate(p.nextReview);
  const enrolled   = !!(S.enrolment?.enrolled || S.austracConfirmed);

  const compChecks  = [firmOk, apptOk && !apptDue, riskOk && !riskDue, programOk && !programDue, enrolled];
  const compPassed  = compChecks.filter(Boolean).length;
  const compTotal   = compChecks.length;

  // ── PERSONNEL (mirrors personnel-overview.js exactly) ────────────────────
  const active     = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const amlStaff   = active.filter(st => st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff');
  const incompVet  = amlStaff.filter(st => vettingStatus(st) === 'incomplete').length;
  const declDue    = amlStaff.filter(st => st.declNext && new Date(st.declNext) < now).length;
  const trainDue   = S.training.filter(t => t.next && new Date(t.next) < now).length;
  const personnelOk = incompVet === 0 && declDue === 0 && trainDue === 0 && amlStaff.length > 0;

  // ── CLIENTS (mirrors clients-overview.js exactly) ────────────────────────
  const clients    = S.clients || [];
  const incidents  = S.incidents || [];
  const incompCdd  = clients.filter(c => !cddComplete(c)).length;
  const overdueCdd = clients.filter(c => cddOverdue(c)).length;
  const openSmrs   = incidents.filter(i => !i.status || i.status === 'Open').length;
  const clientsOk  = incompCdd === 0 && overdueCdd === 0 && openSmrs === 0 && clients.length > 0;

  // ── OVERALL ──────────────────────────────────────────────────────────────
  const allGreen    = compPassed === compTotal && personnelOk && clientsOk;
  const overallPct  = Math.round(((compPassed / compTotal) * 0.6 + (personnelOk ? 0.2 : 0) + (clientsOk ? 0.2 : 0)) * 100);
  const scoreColour = allGreen ? '#16a34a' : overallPct >= 60 ? '#d97706' : '#dc2626';
  const heroBg      = allGreen ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : overallPct >= 60 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const heroBorder  = allGreen ? '#86efac' : overallPct >= 60 ? '#fde68a' : '#fca5a5';

  // ── DEADLINE ─────────────────────────────────────────────────────────────
  const deadline       = new Date('2026-07-01T00:00:00+10:00');
  const daysLeft       = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
  const deadlinePassed = daysLeft === 0;

  // ── STYLE HELPERS ────────────────────────────────────────────────────────
  const sectionLabel = (text) =>
    `<div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">${text}</div>`;

  const statusPill = (ok, overdue, labelNo, labelYes) => {
    if (!ok)     return `<span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">⚠ ${labelNo}</span>`;
    if (overdue) return `<span style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">↻ Overdue</span>`;
    return       `<span style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">✓ ${labelYes}</span>`;
  };

  const obligRow = (icon, title, ok, overdue, detail, screen) =>
    `<div onclick="go('${screen}')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid ${!ok ? '#fecaca' : overdue ? '#fde68a' : '#e2e8f0'};background:#fff;cursor:pointer;transition:box-shadow .15s;" onmouseover="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:18px;flex-shrink:0;">${icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;color:#0f172a;">${title}</div>
        <div style="font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${detail}</div>
      </div>
      ${statusPill(ok, overdue, 'Incomplete', 'Complete')}
    </div>`;

  const numCard = (count, label, sub, colour, urgent, screen) =>
    `<div onclick="go('${screen}')" style="background:#fff;border:1.5px solid ${urgent && count > 0 ? '#fde68a' : count === 0 ? '#bbf7d0' : '#e2e8f0'};border-radius:12px;padding:18px 14px;text-align:center;cursor:pointer;transition:box-shadow .15s;" onmouseover="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:28px;font-weight:800;color:${colour};line-height:1;margin-bottom:4px;">${count}</div>
      <div style="font-size:11px;font-weight:600;color:#0f172a;margin-bottom:2px;">${label}</div>
      <div style="font-size:10px;color:#94a3b8;">${sub}</div>
    </div>`;

  return `<div class="py-8 space-y-7">

    <!-- HEADER -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">${f.name ? f.name + ' · ' : ''}Full AML/CTF compliance status.</p>
      </div>
      <button onclick="go('report')" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;" onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
        Generate Report →
      </button>
    </div>

    <!-- HERO -->
    <div style="background:${heroBg};border:2px solid ${heroBorder};border-radius:16px;padding:24px 28px;display:flex;align-items:center;gap:28px;">
      <!-- Score ring -->
      <div style="position:relative;width:88px;height:88px;flex-shrink:0;">
        <svg viewBox="0 0 88 88" style="width:88px;height:88px;transform:rotate(-90deg);">
          <circle cx="44" cy="44" r="36" fill="none" stroke="${heroBorder}" stroke-width="9"/>
          <circle cx="44" cy="44" r="36" fill="none" stroke="${scoreColour}" stroke-width="9"
            stroke-dasharray="${(2*Math.PI*36).toFixed(1)}"
            stroke-dashoffset="${(2*Math.PI*36*(1-overallPct/100)).toFixed(1)}"
            stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <div style="font-size:20px;font-weight:800;color:${scoreColour};">${overallPct}%</div>
        </div>
      </div>
      <!-- Status -->
      <div style="flex:1;">
        <div style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:5px;">
          ${allGreen ? '✓ Your firm is fully compliant' : overallPct >= 60 ? 'Compliance in progress' : 'Action required'}
        </div>
        <div style="font-size:13px;color:#475569;margin-bottom:10px;">
          ${compPassed}/${compTotal} compliance obligations · ${personnelOk ? '✓' : '⚠'} personnel · ${clientsOk ? '✓' : '⚠'} clients
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${deadlinePassed
            ? `<span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;">⚠ Obligations in effect from 1 July 2026</span>`
            : `<span style="background:rgba(255,255,255,0.7);color:#64748b;border:1px solid #e2e8f0;font-size:11px;font-weight:600;padding:3px 12px;border-radius:20px;">${daysLeft} days to 1 July 2026</span>`}
          ${lastGenerated
            ? `<span style="background:rgba(255,255,255,0.7);color:#16a34a;border:1px solid #bbf7d0;font-size:11px;font-weight:600;padding:3px 12px;border-radius:20px;">✓ Report: ${lastGenerated.date}</span>`
            : `<span style="background:rgba(255,255,255,0.7);color:#d97706;border:1px solid #fde68a;font-size:11px;font-weight:600;padding:3px 12px;border-radius:20px;">⚠ No report yet</span>`}
        </div>
      </div>
    </div>

    <!-- ═══ COMPLIANCE ════════════════════════════════════════════════════ -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="padding:14px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;">Compliance Obligations</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${compPassed} of ${compTotal} complete</div>
        </div>
        <div style="display:flex;gap:6px;">
          ${[firmOk, apptOk && !apptDue, riskOk && !riskDue, programOk && !programDue, enrolled].map(ok =>
            `<div style="width:8px;height:8px;border-radius:50%;background:${ok ? '#16a34a' : '#e2e8f0'};"></div>`
          ).join('')}
        </div>
      </div>
      <div style="padding:12px;display:flex;flex-direction:column;gap:8px;">
        ${obligRow('🏢', 'Firm Profile',      firmOk,    false,      firmOk    ? `Saved ${fmtDate(f.savedDate)}` : 'Enter practice name and contact details',  'firm-details')}
        ${obligRow('👤', 'Appointments',      apptOk,    apptDue,    apptOk    ? `AMLCO: ${appt.amlco?.name}${apptDue ? ' · Review overdue' : appt.nextReview ? ' · Next review ' + fmtDate(appt.nextReview) : ''}` : 'Name your AMLCO, Reporting Officer and Senior Manager', 'firm-appointments')}
        ${obligRow('⚖️', 'Risk Assessment',   riskOk,    riskDue,    riskOk    ? `${sc.overallRating || '—'} overall${riskDue ? ' · Review overdue' : sc.riskNextReview ? ' · Next review ' + fmtDate(sc.riskNextReview) : ''}` : 'Complete all five risk screens', 'risk')}
        ${obligRow('📋', 'AML/CTF Program',   programOk, programDue, programOk ? `Approved by ${p.approvedBy}${programDue ? ' · Review overdue' : p.nextReview ? ' · Next review ' + fmtDate(p.nextReview) : ''}` : 'Approve and document your AML/CTF program', 'program')}
        ${obligRow('🏛️', 'AUSTRAC Enrolment', enrolled,  false,      enrolled  ? 'Confirmed — enrolled with AUSTRAC' : 'Confirm enrolment before 29 July 2026', 'enrolment')}
      </div>
    </div>

    <!-- ═══ PERSONNEL ═════════════════════════════════════════════════════ -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="padding:14px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;">Personnel</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${amlStaff.length} AML staff · vetting, declarations &amp; training</div>
        </div>
        <button onclick="go('personnel-overview')" style="font-size:11px;color:#6366f1;font-weight:600;background:none;border:none;cursor:pointer;">View all →</button>
      </div>
      <div style="padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        ${numCard(incompVet,  'Incomplete Vetting',      incompVet === 0  ? 'All complete'     : `${incompVet} staff`,   incompVet === 0  ? '#16a34a' : '#dc2626', true,  'staff')}
        ${numCard(declDue,    'Declarations Overdue',    declDue === 0    ? 'All current'      : `${declDue} overdue`,   declDue === 0    ? '#16a34a' : '#d97706', true,  'staff')}
        ${numCard(trainDue,   'Training Overdue',        trainDue === 0   ? 'All up to date'   : `${trainDue} overdue`,  trainDue === 0   ? '#16a34a' : '#d97706', true,  'training')}
      </div>
      ${amlStaff.length > 0 ? `
      <div style="border-top:1px solid #f1f5f9;">
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="text-align:left;padding:8px 14px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Name</th>
              <th style="text-align:left;padding:8px 14px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Classification</th>
              <th style="text-align:left;padding:8px 14px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Vetting</th>
              <th style="text-align:left;padding:8px 14px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Last Training</th>
            </tr>
          </thead>
          <tbody>
            ${amlStaff.map(st => {
              const vs = vettingStatus(st);
              const isKey = st.classification === 'Key Personnel';
              const lastTrain = S.training.filter(t => t.name === st.name).sort((a,b) => new Date(b.date||0)-new Date(a.date||0))[0];
              const trainOverdueFlag = lastTrain?.next && new Date(lastTrain.next) < now;
              return `<tr style="border-top:1px solid #f1f5f9;cursor:pointer;" onclick="go('staff')" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
                <td style="padding:9px 14px;font-weight:600;color:#0f172a;">${st.name}</td>
                <td style="padding:9px 14px;"><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${isKey ? '#fef3c7' : '#dbeafe'};color:${isKey ? '#92400e' : '#1e40af'};">${isKey ? 'Key Personnel' : 'Standard Staff'}</span></td>
                <td style="padding:9px 14px;">${vs === 'complete' ? '<span style="color:#16a34a;font-weight:600;">✓ Complete</span>' : '<span style="color:#dc2626;font-weight:600;">⚠ Incomplete</span>'}</td>
                <td style="padding:9px 14px;">${!lastTrain ? '<span style="color:#94a3b8;font-style:italic;">No record</span>' : trainOverdueFlag ? `<span style="color:#d97706;font-weight:600;">⚠ ${fmtDate(lastTrain.date)}</span>` : `<span style="color:#475569;">${fmtDate(lastTrain.date)}</span>`}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : ''}
    </div>

    <!-- ═══ CLIENTS ═══════════════════════════════════════════════════════ -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="padding:14px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;">Clients</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${clients.length} client${clients.length !== 1 ? 's' : ''} · CDD, screening &amp; SMRs</div>
        </div>
        <button onclick="go('clients-overview')" style="font-size:11px;color:#6366f1;font-weight:600;background:none;border:none;cursor:pointer;">View all →</button>
      </div>
      <div style="padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        ${numCard(incompCdd,  'Incomplete CDD',       incompCdd === 0  ? 'All complete'  : `${incompCdd} clients`,  incompCdd === 0  ? '#16a34a' : '#dc2626', true,  'clients')}
        ${numCard(overdueCdd, 'Screening Overdue',    overdueCdd === 0 ? 'All current'   : `${overdueCdd} clients`, overdueCdd === 0 ? '#16a34a' : '#d97706', true,  'clients')}
        ${numCard(openSmrs,   'Open SMRs',            openSmrs === 0   ? 'No open items' : `${openSmrs} open`,      openSmrs === 0   ? '#16a34a' : '#dc2626', true,  'incidents')}
      </div>
    </div>

    <!-- ═══ REPORT CTA ════════════════════════════════════════════════════ -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px 22px;display:flex;align-items:center;justify-content:space-between;gap:20px;">
      <div>
        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3px;">AML/CTF Compliance Report (PDF)</div>
        <div style="font-size:12px;color:#64748b;">
          ${lastGenerated
            ? `Last generated ${lastGenerated.date}${lastGenerated.location ? ' · Stored: ' + lastGenerated.location : ''}`
            : 'No report generated yet — required for the 7-year AUSTRAC retention obligation.'}
        </div>
      </div>
      <button onclick="go('report')" style="background:#4f46e5;color:#fff;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;" onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
        ${lastGenerated ? 'New Report →' : 'Generate →'}
      </button>
    </div>

  </div>`;
}
