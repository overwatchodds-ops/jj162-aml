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
  const inds = c.individuals || [];
  if (!inds.length) return 'Incomplete';
  if (inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult)) return 'Complete';
  return 'Incomplete';
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
      <div class="text-sm font-semibold text-slate-700">${label}</div>
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
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div class="px-5 py-3 bg-slate-50 border-b border-slate-200">
      <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-widest">${title}</h2>
    </div>
    <div class="px-5">
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

  // Appointments
  const apptComplete = !!(appt.amlco?.name && appt.senior?.name);
  if (!apptComplete) {
    complianceItems.push(item(
      'Appointments incomplete',
      'AMLCO and Senior Manager must be named before other compliance obligations can be met.',
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
    if (t.next && new Date(t.next) < now) {
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
      clientItems.push(item(
        `${c.name} — CDD incomplete`,
        `${c.entityType || '—'} · Identity verification or screening not finished.`,
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

  // Open SMRs
  const openSmrs = S.incidents.filter(i => !i.status || i.status === 'Open');
  openSmrs.forEach(inc => {
    clientItems.push(item(
      `${inc.clientName || 'Unknown client'} — open SMR`,
      `Identified ${fmtDate(inc.dateIdentified)} · AMLCO review ${inc.amlcoDate ? 'done' : 'pending'}.`,
      'incidents', 'Review →'
    ));
  });

  // ── RENDER ────────────────────────────────────────────────────────────────
  const totalIssues = complianceItems.length + personnelItems.length + clientItems.length;
  const allClear = totalIssues === 0;

  return `<div class="py-8 space-y-6">

    <div>
      <h1 class="text-2xl font-bold text-slate-900">Action Required</h1>
      <p class="text-sm text-slate-400 mt-1">Only items that need your attention appear here. If this screen is empty, your firm is on track.</p>
    </div>

    ${allClear ? `
    <div class="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-2">
      <div class="text-3xl">✓</div>
      <div class="text-base font-bold text-green-800">No outstanding items</div>
      <div class="text-sm text-green-700">Your firm's AML/CTF obligations are complete and current.</div>
    </div>` : `

    <div class="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
      <span class="text-sm font-semibold text-amber-800">
        ${totalIssues} item${totalIssues !== 1 ? 's' : ''} require${totalIssues === 1 ? 's' : ''} attention
      </span>
      <span class="text-xs text-amber-600">Click any item to go directly to the relevant screen</span>
    </div>

    ${section('Compliance', complianceItems)}
    ${section('Personnel', personnelItems)}
    ${section('Clients', clientItems)}
    `}

  </div>`;
}
