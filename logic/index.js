import { S } from '../state/index.js';

// ─── COMPLIANCE SCORE ─────────────────────────────────────────────────────────
// Returns a 0–100 integer representing overall setup completion.
// Used by the sidebar progress bar and dashboard.
export function complianceScore() {
  const steps = [
    Object.keys(S.firm).length > 2,
    !!(S.scope.overallRating || S.scope.noneConfirmed),
    !!(S.program.approvedBy && S.program.approvedDate),
    !!(S.enrolment.enrolled),
    S.staff.length > 0,
    S.training.length > 0,
    (S.report?.history || []).length > 0,
  ];
  const done = steps.filter(Boolean).length;
  return Math.round((done / steps.length) * 100);
}

// ─── RISK AUTO-CALCULATION RULES ──────────────────────────────────────────────
// All functions below are pure: they take values and return a rating string
// ('High' | 'Medium' | 'Low' | null). They never read S directly.
// Screens pass the relevant S values in; logic never touches the DOM.

// Service risk from designated service IDs (scope section 1 — which DS apply)
export function autoServiceRisk(services) {
  const high = ['ds3', 'ds7', 'ds8', 'ds5'];
  const med  = ['ds1', 'ds6', 'ds4', 'ds2'];
  if (!services || !services.length) return null;
  if (services.some(s => high.includes(s))) return 'High';
  if (services.some(s => med.includes(s)))  return 'Medium';
  return 'Low';
}

// Service risk from risk-factor checkboxes (scope section 2 — service risk rating)
export function autoServiceRiskFromChecks(checks) {
  const high = ['sr-funds', 'sr-nominee', 'sr-shelf'];
  const med  = ['sr-property', 'sr-structures', 'sr-finance', 'sr-bodycorp'];
  if (!checks || !checks.length) return null;
  if (checks.some(c => high.includes(c))) return 'High';
  if (checks.some(c => med.includes(c)))  return 'Medium';
  return 'Low';
}

// Client risk from client-type checkboxes
export function autoClientRisk(checks) {
  if (!checks || !checks.length) return null;
  if (checks.includes('cr-international') || checks.includes('cr-cash')) return 'High';
  if (checks.includes('cr-trusts')) return 'Medium';
  if (checks.length > 0) return 'Low';
  return null;
}

// Geographic risk from geography checkboxes
export function autoGeoRisk(checks) {
  if (!checks || !checks.length) return null;
  if (checks.includes('gr-highrisk')) return 'High';
  if (checks.includes('gr-overseas')) return 'Medium';
  return 'Low';
}

// Residual risk: inherent risk reduced by number of controls in place
export function autoResidualRisk(inherent, controls) {
  if (!inherent) return null;
  const count = (controls || []).length;
  if (inherent === 'High')   return count >= 4 ? 'Medium' : 'High';
  if (inherent === 'Medium') return count >= 3 ? 'Low'    : 'Medium';
  return 'Low';
}

// Overall risk: highest of service, client, geographic, and PF ratings
export function autoOverallRisk(sr, cr, gr, pf) {
  const vals = [sr, cr, gr, pf].filter(Boolean);
  if (!vals.length) return null;
  if (vals.includes('High'))   return 'High';
  if (vals.includes('Medium')) return 'Medium';
  return 'Low';
}

// ─── DASHBOARD DERIVED STATE ──────────────────────────────────────────────────
// Computes everything the dashboard needs to render in one pass.
// Returns a plain object — no HTML, no DOM access.
export function dashboardState() {
  const now           = new Date();
  const yr            = 365 * 24 * 60 * 60 * 1000;
  const twelveMonthsAgo = new Date(now - yr);
  const thirtyDays    = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const days          = (d) => d ? Math.ceil((new Date(d) - now) / (1000 * 60 * 60 * 24)) : null;

  // Governance
  const firmDone    = Object.keys(S.firm).length > 2;
  const riskDone    = !!(S.scope.overallRating || S.scope.noneConfirmed);
  const riskReview  = S.scope.nextReview ? days(S.scope.nextReview) : null;
  const riskOverdue = riskReview !== null && riskReview < 0;
  const riskDueSoon = riskReview !== null && riskReview >= 0 && riskReview <= 30;
  const programDone = !!(S.program.approvedBy);
  const progReview  = S.program.nextReview ? days(S.program.nextReview) : null;
  const progOverdue = progReview !== null && progReview < 0;
  const progDueSoon = progReview !== null && progReview >= 0 && progReview <= 30;
  const enrolDone   = !!(S.enrolment.enrolled);

  // Staff
  const activeStaff      = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const staffDone        = activeStaff.length > 0;
  const trainingOverdue  = S.training.filter(t => t.next && new Date(t.next) < now);
  const trainingDueSoon  = S.training.filter(t => t.next && new Date(t.next) >= now && new Date(t.next) <= thirtyDays);
  const trainingDone     = S.training.length > 0 && trainingOverdue.length === 0;
  const declOverdue      = activeStaff.filter(st =>
    (st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff') &&
    st.declNext && new Date(st.declNext) < now
  );

  // Clients
  const activeClients = S.clients.filter(c => {
    const lastSvc = (c.services || []).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc > new Date(now - 7 * yr);
  });
  const cddComplete = activeClients.filter(c => {
    const inds = c.individuals || [];
    return inds.length > 0 && inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult);
  }).length;
  const dormantClients = activeClients.filter(c => {
    const lastSvc = (c.services || []).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc < twelveMonthsAgo;
  });
  const newClients = activeClients.filter(c => c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo);
  const ongoingClients = activeClients.filter(c =>
    (c.services || []).some(sv => sv.dateProvided && new Date(sv.dateProvided) >= twelveMonthsAgo) ||
    (c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo)
  );
  const allInds      = activeClients.flatMap(c => c.individuals || []);
  const screenedInds = allInds.filter(i => i.screenResult).length;
  const clientsCddDone = activeClients.length === 0 || cddComplete === activeClients.length;

  // Incidents
  const openInc   = S.incidents.filter(i => !i.status || i.status === 'Open').length;
  const closedInc = S.incidents.filter(i => i.status === 'Closed').length;

  // Attention items
  const attention = [];
  if (!firmDone)             attention.push({ urgent: true,  text: 'Firm profile not complete', screen: 'firm' });
  if (!riskDone)             attention.push({ urgent: true,  text: 'Risk assessment not completed', screen: 'risk' });
  if (riskOverdue)           attention.push({ urgent: true,  text: `Risk assessment review overdue by ${Math.abs(riskReview)} days`, screen: 'risk' });
  if (riskDueSoon)           attention.push({ urgent: false, text: `Risk assessment review due in ${riskReview} days`, screen: 'risk' });
  if (!programDone)          attention.push({ urgent: true,  text: 'AML/CTF program not approved', screen: 'program' });
  if (progOverdue)           attention.push({ urgent: true,  text: `AML/CTF program review overdue by ${Math.abs(progReview)} days`, screen: 'program' });
  if (progDueSoon)           attention.push({ urgent: false, text: `AML/CTF program review due in ${progReview} days`, screen: 'program' });
  if (!enrolDone)            attention.push({ urgent: true,  text: 'AUSTRAC enrolment not recorded', screen: 'enrolment' });
  if (!staffDone)            attention.push({ urgent: true,  text: 'No staff vetting records', screen: 'staff' });
  if (declOverdue.length > 0)       attention.push({ urgent: true,  text: `${declOverdue.length} staff declaration${declOverdue.length > 1 ? 's' : ''} overdue`, screen: 'staff' });
  if (trainingOverdue.length > 0)   attention.push({ urgent: true,  text: `${trainingOverdue.length} training record${trainingOverdue.length > 1 ? 's' : ''} overdue`, screen: 'training' });
  if (trainingDueSoon.length > 0)   attention.push({ urgent: false, text: `${trainingDueSoon.length} training record${trainingDueSoon.length > 1 ? 's' : ''} due within 30 days`, screen: 'training' });
  if (dormantClients.length > 0)    attention.push({ urgent: false, text: `${dormantClients.length} client${dormantClients.length > 1 ? 's' : ''} dormant — no service in 12 months`, screen: 'clients' });
  if (activeClients.length > 0 && cddComplete < activeClients.length)
    attention.push({ urgent: true, text: `${activeClients.length - cddComplete} client${activeClients.length - cddComplete > 1 ? 's' : ''} with incomplete CDD`, screen: 'clients' });

  // Overall status verdict
  const hasUrgent  = attention.some(a => a.urgent);
  const hasWarning = attention.length > 0;
  const statusLabel = hasUrgent ? 'Action Needed' : hasWarning ? 'Attention Required' : 'Compliant';
  const statusBg    = hasUrgent ? 'bg-red-50 border-red-200'   : hasWarning ? 'bg-amber-50 border-amber-200'   : 'bg-green-50 border-green-200';
  const statusText  = hasUrgent ? 'text-red-700'               : hasWarning ? 'text-amber-700'                 : 'text-green-700';
  const statusDot   = hasUrgent ? 'bg-red-500'                 : hasWarning ? 'bg-amber-400'                   : 'bg-green-500';

  return {
    // Governance flags
    firmDone, riskDone, riskReview, riskOverdue, riskDueSoon,
    programDone, progReview, progOverdue, progDueSoon, enrolDone,
    // Staff
    activeStaff, staffDone, trainingOverdue, trainingDueSoon, trainingDone, declOverdue,
    // Clients
    activeClients, cddComplete, dormantClients, newClients, ongoingClients,
    allInds, screenedInds, clientsCddDone,
    // Incidents
    openInc, closedInc,
    // Attention
    attention, hasUrgent, hasWarning,
    // Status verdict
    statusLabel, statusBg, statusText, statusDot,
  };
}

// ─── CLIENT RISK RATING ───────────────────────────────────────────────────────
// Calculates individual client risk rating based on entity type, service,
// screening result, and risk flags. Used by newclient, clients, and addservice.
export function autoClientRiskRating(entityType, service, screenResult, extra) {
  extra = extra || {};
  if (screenResult === 'PEP' || screenResult === 'Sanctions') return 'High';
  if (extra.offshoreJurisdiction) return 'High';
  if (extra.complexStructure)     return 'High';
  if (extra.pepAmongControllers)  return 'High';
  if (entityType === 'Trust' || entityType === 'SMSF') {
    if (['ds3','ds7','ds8','ds5'].includes(service)) return 'High';
    if (extra.cashIntensiveIndustry) return 'High';
    return 'Medium';
  }
  if (['ds3','ds7','ds8','ds5'].includes(service)) return 'High';
  if (['ds1','ds6','ds4','ds2'].includes(service)) return 'Medium';
  if (entityType === 'Private Company' || entityType === 'Partnership') return 'Medium';
  if (extra.cashIntensiveIndustry) return 'Medium';
  return 'Low';
}
