import { S } from '../state/index.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}

function cddStatus(c) {
  // Must have purpose
  if (!c.purpose) return 'Incomplete';
  // Must have at least one individual
  const inds = c.individuals || [];
  if (!inds.length) return 'Incomplete';
  // Each individual must have name and role (role not required for Individual / Sole Trader)
  for (const ind of inds) {
    if (!ind.name) return 'Incomplete';
    if (c.entityType !== 'Individual / Sole Trader' && !ind.role) return 'Incomplete';
  }
  // All individuals must be verified and screened
  if (!inds.every(i => i.idOutcome === 'Verified') || !inds.every(i => i.screenResult)) return 'Incomplete';
  // Declaration must be complete
  if (!c.tippingAck || !c.cddBy || !c.cddDate) return 'Incomplete';
  // Next review date must be set
  if (!c.nextReviewDate) return 'Incomplete';
  return 'Complete';
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

function reviewOverdue(c) {
  if (cddStatus(c) !== 'Complete') return false;
  if (!c.nextReviewDate) return false;
  return new Date(c.nextReviewDate) < new Date();
}

// ─── ITEM BUILDER ─────────────────────────────────────────────────────────────
function item(label, detail, screen, actionLabel) {
  return `
  <div class="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div>
      <div style="font-size:12px;font-weight:500;color:#0f172a;">${label}</div>
      ${detail ? `<div class="text-xs text-slate-400 mt-0.5">${detail}</div>` : ''}
    </div>
    <button onclick="go('${screen}')"
      class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 whitespace-nowrap ml-6">
      ${actionLabel || 'Fix →'}
    </button>
  </div>`;
}

function section(title, items) {
  if (!items.length) return '';
  return `
  <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:12px;">
    <div style="padding:10px 16px;background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
      <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">${title}</div>
    </div>
    <div style="padding:0 16px;">
      ${items.join('')}
    </div>
  </div>`;
}

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export function screen() {
  const sc   = S.scope;
  const p    = S.program;
  const appt = S.firm?.appt || {};
  const now  = new Date();

  const complianceItems = [];
  const personnelItems  = [];
  const clientItems     = [];

  // ── COMPLIANCE EXCEPTIONS ─────────────────────────────────────────────────

  // Appointments — all four roles require name + date
  const requiredRoles = [
    ['amlco',     'AML/CTF Compliance Officer'],
    ['reporting', 'Reporting Officer'],
    ['senior',    'Senior Manager'],
    ['principal2','Principal / Managing Partner'],
  ];
  const missingAppt = requiredRoles.filter(([k]) => !appt[k]?.name || !appt[k]?.date);
  if (missingAppt.length > 0) {
    const missing = missingAppt.map(([,label]) => label).join(', ');
    complianceItems.push(item(
      'Appointments incomplete',
      `Missing name or date for: ${missing}.`,
      'firm-appointments', 'Complete →'
    ));
  } else if (isOverdue(appt.nextReview)) {
    complianceItems.push(item(
      'Appointments overdue for review',
      `Next review was due ${fmtDate(appt.nextReview)} — confirm responsible persons are still current.`,
      'firm-appointments', 'Review →'
    ));
  }

  // Risk Assessment
  const riskComplete = !!(sc.classifierConfirmed && sc.mltfConfirmed &&
    sc.serviceRating && sc.customerRating && sc.geoRating && sc.overallRating && sc.pfRating);
  if (!riskComplete) {
    complianceItems.push(item(
      'Risk Assessment incomplete',
      'All five risk screens must be completed before your AML/CTF program can be approved.',
      'risk', 'Complete →'
    ));
  } else if (isOverdue(sc.riskNextReview)) {
    complianceItems.push(item(
      'Risk Assessment overdue for review',
      `Next review was due ${fmtDate(sc.riskNextReview)} — risk assessments must be reviewed at least annually.`,
      'overallrisk', 'Review →'
    ));
  }

  // AML/CTF Program
  const programComplete = !!(p.approvedBy && p.approvedDate);
  if (!programComplete) {
    complianceItems.push(item(
      'AML/CTF Program not approved',
      'The program must be approved by a senior manager before 1 July 2026.',
      'program', 'Approve →'
    ));
  } else if (isOverdue(p.nextReview)) {
    complianceItems.push(item(
      'AML/CTF Program overdue for review',
      `Next review was due ${fmtDate(p.nextReview)} — programs must be reviewed at least annually.`,
      'program', 'Review →'
    ));
  }

  // AUSTRAC Enrolment
  const enrolled = !!(S.enrolment?.enrolled || S.austracConfirmed);
  if (!enrolled) {
    complianceItems.push(item(
      'AUSTRAC Enrolment not confirmed',
      'Your firm must be enrolled with AUSTRAC before 1 July 2026.',
      'enrolment', 'Confirm →'
    ));
  }

  // ── PERSONNEL EXCEPTIONS ──────────────────────────────────────────────────
  const active = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const amlStaff = active.filter(st =>
    st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff'
  );

  amlStaff.forEach(st => {
    if (vettingStatus(st) === 'incomplete') {
      personnelItems.push(item(
        `${st.name} — vetting incomplete`,
        `${st.classification} · Required checks are missing.`,
        'staff', 'Complete →'
      ));
    } else if (st.declNext && new Date(st.declNext) < now) {
      personnelItems.push(item(
        `${st.name} — declaration overdue`,
        `Annual declaration was due ${fmtDate(st.declNext)}.`,
        'staff', 'Update →'
      ));
    }
  });

  S.training.forEach(t => {
    if (!t.date || !t.provider) {
      personnelItems.push(item(
        `${t.name} — training record incomplete`,
        `Training date or provider / course is missing.`,
        'training', 'Complete →'
      ));
    } else if (t.next && new Date(t.next) < now) {
      personnelItems.push(item(
        `${t.name} — training overdue`,
        `AML/CTF training was due ${fmtDate(t.next)}.`,
        'training', 'Update →'
      ));
    }
  });

  // ── CLIENT EXCEPTIONS ─────────────────────────────────────────────────────
  S.clients.forEach((c, i) => {
    if (cddStatus(c) !== 'Complete') {
      // Build a specific reason for the exception
      const inds = c.individuals || [];
      const reason = !c.purpose ? 'Purpose of relationship not recorded.'
        : !inds.length ? 'No persons recorded.'
        : !inds.every(i => i.name) ? 'A recorded person is missing a name.'
        : (c.entityType !== 'Individual / Sole Trader' && !inds.every(i => i.role)) ? 'A recorded person is missing a role.'
        : !inds.every(i => i.idOutcome === 'Verified') ? 'Identity verification incomplete.'
        : !inds.every(i => i.screenResult) ? 'Sanctions / PEP screening not completed.'
        : !c.tippingAck ? 'CDD declaration not confirmed.'
        : !c.cddBy ? 'CDD completed by not recorded.'
        : !c.nextReviewDate ? 'Next review date not set.'
        : 'CDD incomplete.';
      clientItems.push(item(
        `${c.name} — CDD incomplete`,
        `${c.entityType || '—'} · ${reason}`,
        'clients', 'Complete →'
      ));
    } else if (reviewOverdue(c)) {
      clientItems.push(item(
        `${c.name} — screening overdue`,
        `Review was due ${fmtDate(c.nextReviewDate)} · ${c.risk || 'Low'} risk client.`,
        'clients', 'Review →'
      ));
    }
  });

  // SMR exceptions — incomplete records and open SMRs
  S.incidents.forEach(inc => {
    const incompleteSmr = !inc.amlcoDate || !inc.amlcoNotes;
    const isOpen = !inc.status || inc.status === 'Open';
    if (incompleteSmr) {
      clientItems.push(item(
        `${inc.clientName || 'Unknown client'} — incident record incomplete`,
        `Identified ${fmtDate(inc.dateIdentified)} · AMLCO review date or notes missing.`,
        'incidents', 'Complete →'
      ));
    } else if (isOpen) {
      clientItems.push(item(
        `${inc.clientName || 'Unknown client'} — open SMR`,
        `Identified ${fmtDate(inc.dateIdentified)} · AMLCO reviewed ${fmtDate(inc.amlcoDate)}.`,
        'incidents', 'Review →'
      ));
    }
  });

  // ── RENDER ────────────────────────────────────────────────────────────────
  const totalIssues = complianceItems.length + personnelItems.length + clientItems.length;
  const allClear = totalIssues === 0;

  return `<div style="max-width:860px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Action Required</h1>
      <p style="font-size:13px;color:#64748b;">Only items that need your attention appear here. If this screen is empty, your firm is on track.</p>
    </div>

    ${allClear ? `
    <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:12px;padding:40px;text-align:center;">
      <div style="font-size:24px;margin-bottom:8px;">✓</div>
      <div style="font-size:14px;font-weight:500;color:#166534;margin-bottom:4px;">No outstanding items</div>
      <div style="font-size:13px;color:#4ade80;">Your firm's AML/CTF obligations are complete and current.</div>
    </div>` : `

    <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <span style="font-size:13px;font-weight:500;color:#92400e;">${totalIssues} item${totalIssues !== 1 ? 's' : ''} require${totalIssues === 1 ? 's' : ''} attention</span>
      <span style="font-size:11px;color:#b45309;">Click any item to go directly to the relevant screen</span>
    </div>

    ${section('Compliance', complianceItems)}
    ${section('Personnel', personnelItems)}
    ${section('Clients', clientItems)}
    `}

  </div>`;
}
