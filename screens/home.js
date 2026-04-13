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
  const sc   = S.scope   || {};
  const p    = S.program || {};
  const f    = S.firm    || {};
  const appt = f.appt    || {};
  const now  = new Date();
  const setup = S.setup  || {};
  const history = S.report?.history || [];
  const lastGenerated = history[0] || null;

  // ── COMPLIANCE ───────────────────────────────────────────────────────────
  const firmOk    = setup.firm    || !!(f.name && f.savedDate);
  const apptOk    = setup.appointments || !!(appt.amlco?.name && appt.amlco?.date);
  const apptDue   = apptOk && isOverdueDate(appt.nextReview);
  const riskOk    = setup.risk    || !!(sc.serviceRating && sc.customerRating && sc.geoRating && sc.overallRating && sc.pfRating);
  const riskDue   = riskOk && isOverdueDate(sc.riskNextReview);
  const programOk = setup.program || !!(p.approvedBy && p.approvedDate);
  const programDue= programOk && isOverdueDate(p.nextReview);
  const enrolled  = setup.enrolment || !!(S.enrolment?.enrolled || S.austracConfirmed);
  const scopeOk   = setup.scope   || !!(sc.classifierConfirmed || sc.noneConfirmed);

  // ── PERSONNEL ────────────────────────────────────────────────────────────
  const active    = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const amlStaff  = active.filter(st => st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff');
  const incompVet = amlStaff.filter(st => vettingStatus(st) === 'incomplete').length;
  const declDue   = amlStaff.filter(st => st.declNext && new Date(st.declNext) < now).length;
  const trainDue  = S.training.filter(t => t.next && new Date(t.next) < now).length;
  const personnelOk = incompVet === 0 && declDue === 0 && trainDue === 0 && amlStaff.length > 0;

  // ── CLIENTS ──────────────────────────────────────────────────────────────
  const clients   = S.clients   || [];
  const incidents = S.incidents || [];
  const incompCdd = clients.filter(c => !cddComplete(c)).length;
  const overdueCdd= clients.filter(c => cddOverdue(c)).length;
  const openSmrs  = incidents.filter(i => !i.status || i.status === 'Open').length;
  const clientsOk = incompCdd === 0 && overdueCdd === 0 && openSmrs === 0 && clients.length > 0;

  // ── OVERALL SCORE ────────────────────────────────────────────────────────
  const compChecks = [firmOk, apptOk && !apptDue, scopeOk, riskOk && !riskDue, programOk && !programDue];
  const compPassed = compChecks.filter(Boolean).length;
  const compTotal  = compChecks.length;
  const allGreen   = compPassed === compTotal && personnelOk && clientsOk;
  const overallPct = Math.round(((compPassed / compTotal) * 0.6 + (personnelOk ? 0.2 : 0) + (clientsOk ? 0.2 : 0)) * 100);
  const scoreColour= allGreen ? '#16a34a' : overallPct >= 60 ? '#d97706' : '#dc2626';
  const heroBg     = allGreen ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : overallPct >= 60 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const heroBorder = allGreen ? '#86efac' : overallPct >= 60 ? '#fde68a' : '#fca5a5';

  // ── DEADLINE ─────────────────────────────────────────────────────────────
  const deadline      = new Date('2026-07-01T00:00:00+10:00');
  const daysLeft      = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
  const deadlinePassed= daysLeft === 0;

  // ── EXCEPTIONS ───────────────────────────────────────────────────────────
  const exceptions = [];
  if (!firmOk)              exceptions.push({ label: 'Firm Profile incomplete', detail: 'Enter practice name, ABN and contact details', screen: 'firm-details', urgency: 'high' });
  if (!apptOk)              exceptions.push({ label: 'Appointments not set', detail: 'Name your AMLCO, Reporting Officer and Senior Manager', screen: 'firm-appointments', urgency: 'high' });
  if (!scopeOk)             exceptions.push({ label: 'Designated services not confirmed', detail: 'Complete the designated services analysis', screen: 'risk', urgency: 'high' });
  if (!riskOk)              exceptions.push({ label: 'Risk assessment incomplete', detail: 'Complete all five risk screens', screen: 'risk', urgency: 'high' });
  if (!programOk)           exceptions.push({ label: 'AML/CTF Program not approved', detail: 'Approve and document your AML/CTF program', screen: 'program', urgency: 'high' });
  if (!enrolled)            exceptions.push({ label: 'AUSTRAC enrolment not confirmed', detail: 'Confirm enrolment before 29 July 2026', screen: 'enrolment', urgency: 'high' });
  if (apptDue)              exceptions.push({ label: 'Appointments review overdue', detail: `Review was due ${fmtDate(appt.nextReview)}`, screen: 'firm-appointments', urgency: 'medium' });
  if (riskDue)              exceptions.push({ label: 'Risk assessment review overdue', detail: `Review was due ${fmtDate(sc.riskNextReview)}`, screen: 'risk', urgency: 'medium' });
  if (programDue)           exceptions.push({ label: 'AML/CTF Program review overdue', detail: `Review was due ${fmtDate(p.nextReview)}`, screen: 'program', urgency: 'medium' });
  if (incompVet > 0)        exceptions.push({ label: `${incompVet} staff member${incompVet > 1 ? 's' : ''} with incomplete vetting`, detail: 'Complete vetting before performing AML/CTF functions', screen: 'staff', urgency: 'high' });
  if (declDue > 0)          exceptions.push({ label: `${declDue} declaration${declDue > 1 ? 's' : ''} overdue`, detail: 'Annual re-declaration required', screen: 'staff', urgency: 'medium' });
  if (trainDue > 0)         exceptions.push({ label: `${trainDue} training record${trainDue > 1 ? 's' : ''} overdue`, detail: 'AML/CTF training past next due date', screen: 'training', urgency: 'medium' });
  if (incompCdd > 0)        exceptions.push({ label: `${incompCdd} client${incompCdd > 1 ? 's' : ''} with incomplete CDD`, detail: 'CDD must be complete before providing designated services', screen: 'clients', urgency: 'high' });
  if (overdueCdd > 0)       exceptions.push({ label: `${overdueCdd} client${overdueCdd > 1 ? 's' : ''} with overdue screening`, detail: 'Re-screening required based on risk rating', screen: 'clients', urgency: 'medium' });
  if (openSmrs > 0)         exceptions.push({ label: `${openSmrs} open SMR${openSmrs > 1 ? 's' : ''}`, detail: 'Review open matters and record AMLCO outcome', screen: 'incidents', urgency: 'high' });

  const highExceptions   = exceptions.filter(e => e.urgency === 'high');
  const mediumExceptions = exceptions.filter(e => e.urgency === 'medium');

  // ── HELPERS ──────────────────────────────────────────────────────────────
  const pill = (ok, overdue) => {
    if (!ok)     return `<span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">⚠ Incomplete</span>`;
    if (overdue) return `<span style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">↻ Overdue</span>`;
    return       `<span style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap;">✓ Complete</span>`;
  };

  const obligRow = (icon, title, ok, overdue, detail, screen) =>
    `<div onclick="go('${screen}')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid ${!ok ? '#fecaca' : overdue ? '#fde68a' : '#e2e8f0'};background:#fff;cursor:pointer;transition:box-shadow .15s;margin-bottom:6px;" onmouseover="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:18px;flex-shrink:0;">${icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;color:#0f172a;">${title}</div>
        <div style="font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${detail}</div>
      </div>
      ${pill(ok, overdue)}
    </div>`;

  const numCard = (count, label, sub, colour, screen) =>
    `<div onclick="go('${screen}')" style="background:#fff;border:1.5px solid ${count > 0 ? '#fde68a' : '#bbf7d0'};border-radius:12px;padding:16px 12px;text-align:center;cursor:pointer;transition:box-shadow .15s;" onmouseover="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'" onmouseout="this.style.boxShadow='none'">
      <div style="font-size:26px;font-weight:800;color:${colour};line-height:1;margin-bottom:4px;">${count}</div>
      <div style="font-size:11px;font-weight:600;color:#0f172a;margin-bottom:2px;">${label}</div>
      <div style="font-size:10px;color:#94a3b8;">${sub}</div>
    </div>`;

  const exceptionRow = (ex) =>
    `<div onclick="go('${ex.screen}')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-left:3px solid ${ex.urgency === 'high' ? '#dc2626' : '#d97706'};background:#fff;border-radius:0 8px 8px 0;cursor:pointer;transition:background .15s;margin-bottom:4px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;color:#0f172a;">${ex.label}</div>
        <div style="font-size:11px;color:#94a3b8;">${ex.detail}</div>
      </div>
      <div style="font-size:11px;color:#6366f1;font-weight:600;white-space:nowrap;">Fix →</div>
    </div>`;

  return `<div class="py-8 space-y-6" style="max-width:900px;">

    <!-- HEADER -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">${f.name ? f.name : 'Home'}</h1>
        <p class="text-sm text-slate-400 mt-1">AML/CTF compliance status${f.name ? ' · ' + (deadlinePassed ? 'Obligations in effect' : daysLeft + ' days to 1 July 2026') : ''}</p>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        ${!S.setupComplete ? `<button onclick="go('setup')" style="background:#f8fafc;color:#475569;border:1px solid #e2e8f0;padding:8px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;">Setup checklist →</button>` : ''}
        <button onclick="go('reports-overview')" style="background:#4f46e5;color:#fff;padding:8px 18px;border-radius:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;">Reports →</button>
      </div>
    </div>

    <!-- HERO -->
    <div style="background:${heroBg};border:2px solid ${heroBorder};border-radius:16px;padding:22px 28px;display:flex;align-items:center;gap:28px;">
      <div style="position:relative;width:80px;height:80px;flex-shrink:0;">
        <svg viewBox="0 0 80 80" style="width:80px;height:80px;transform:rotate(-90deg);">
          <circle cx="40" cy="40" r="32" fill="none" stroke="${heroBorder}" stroke-width="8"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke="${scoreColour}" stroke-width="8"
            stroke-dasharray="${(2*Math.PI*32).toFixed(1)}"
            stroke-dashoffset="${(2*Math.PI*32*(1-overallPct/100)).toFixed(1)}"
            stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <div style="font-size:18px;font-weight:800;color:${scoreColour};">${overallPct}%</div>
        </div>
      </div>
      <div style="flex:1;">
        <div style="font-size:17px;font-weight:800;color:#0f172a;margin-bottom:5px;">
          ${allGreen ? '✓ Fully compliant' : exceptions.length > 0 ? `${exceptions.length} item${exceptions.length > 1 ? 's' : ''} need${exceptions.length === 1 ? 's' : ''} attention` : 'Compliance in progress'}
        </div>
        <div style="font-size:13px;color:#475569;margin-bottom:10px;">
          ${compPassed}/${compTotal} compliance obligations · ${personnelOk ? '✓' : '⚠'} personnel · ${clientsOk ? '✓' : clients.length === 0 ? '—' : '⚠'} clients
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

    <!-- TWO COLUMN LAYOUT: Compliance + Personnel/Clients -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

      <!-- COMPLIANCE OBLIGATIONS -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:12px;font-weight:700;color:#0f172a;">Compliance</div>
          <div style="font-size:10px;color:#94a3b8;">${compPassed}/${compTotal} complete</div>
        </div>
        <div style="padding:10px;">
          ${obligRow('🏢', 'Firm Profile',      firmOk,    false,       firmOk    ? `Saved ${fmtDate(f.savedDate)}` : 'Name, ABN, contact details', 'firm-details')}
          ${obligRow('👤', 'Appointments',      apptOk,    apptDue,     apptOk    ? `AMLCO: ${appt.amlco?.name}` : 'AMLCO, Reporting Officer, Senior Manager', 'firm-appointments')}
          ${obligRow('🔍', 'Designated Services',scopeOk,  false,       scopeOk   ? (sc.noneConfirmed ? 'Not in scope — confirmed' : 'Services confirmed') : 'Confirm scope of services', 'risk')}
          ${obligRow('⚖️', 'Risk Assessment',   riskOk,    riskDue,     riskOk    ? `Overall: ${sc.overallRating}` : 'Complete all five risk screens', 'risk')}
          ${obligRow('📋', 'AML/CTF Program',   programOk, programDue,  programOk ? `Approved by ${p.approvedBy}` : 'Approve your program', 'program')}
          ${obligRow('🏛️', 'AUSTRAC Enrolment', enrolled,  false,       enrolled  ? 'Confirmed' : 'Confirm before 29 July 2026', 'enrolment')}
        </div>
      </div>

      <!-- PERSONNEL + CLIENTS -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Personnel -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:12px;font-weight:700;color:#0f172a;">Personnel</div>
            <button onclick="go('personnel-overview')" style="font-size:10px;color:#6366f1;font-weight:600;background:none;border:none;cursor:pointer;">View →</button>
          </div>
          <div style="padding:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            ${numCard(incompVet, 'Incomplete vetting', incompVet === 0 ? 'All complete' : `${incompVet} staff`, incompVet === 0 ? '#16a34a' : '#dc2626', 'staff')}
            ${numCard(declDue,   'Decl. overdue',      declDue === 0   ? 'All current'  : `${declDue} overdue`, declDue === 0   ? '#16a34a' : '#d97706', 'staff')}
            ${numCard(trainDue,  'Training overdue',   trainDue === 0  ? 'All current'  : `${trainDue} overdue`,trainDue === 0  ? '#16a34a' : '#d97706', 'training')}
          </div>
        </div>
        <!-- Clients -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:12px;font-weight:700;color:#0f172a;">Clients</div>
            <button onclick="go('clients-overview')" style="font-size:10px;color:#6366f1;font-weight:600;background:none;border:none;cursor:pointer;">View →</button>
          </div>
          <div style="padding:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            ${numCard(incompCdd,  'Incomplete CDD',    incompCdd === 0  ? 'All complete' : `${incompCdd} clients`,  incompCdd === 0  ? '#16a34a' : '#dc2626', 'clients')}
            ${numCard(overdueCdd, 'Screening overdue', overdueCdd === 0 ? 'All current'  : `${overdueCdd} clients`, overdueCdd === 0 ? '#16a34a' : '#d97706', 'clients')}
            ${numCard(openSmrs,   'Open SMRs',         openSmrs === 0   ? 'No open items': `${openSmrs} open`,      openSmrs === 0   ? '#16a34a' : '#dc2626', 'incidents')}
          </div>
        </div>
      </div>
    </div>

    <!-- EXCEPTIONS — only shown when issues exist -->
    ${exceptions.length > 0 ? `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="padding:14px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;">Needs attention</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${exceptions.length} item${exceptions.length > 1 ? 's' : ''} require action</div>
        </div>
        <span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;">${highExceptions.length} critical</span>
      </div>
      <div style="padding:12px;">
        ${highExceptions.length > 0 ? `
        <div style="font-size:9px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;">Critical</div>
        ${highExceptions.map(exceptionRow).join('')}` : ''}
        ${mediumExceptions.length > 0 ? `
        <div style="font-size:9px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:.1em;margin:10px 0 6px;">Review needed</div>
        ${mediumExceptions.map(exceptionRow).join('')}` : ''}
      </div>
    </div>` : `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px;text-align:center;">
      <div style="font-size:15px;font-weight:700;color:#16a34a;margin-bottom:4px;">✓ Nothing needs attention</div>
      <div style="font-size:13px;color:#4ade80;">All compliance obligations, personnel records and client CDD are complete and current.</div>
    </div>`}

  </div>`;
}
