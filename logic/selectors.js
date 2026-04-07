import { S } from '../state/index.js';

// ─── SELECTORS ────────────────────────────────────────────────────────────────
// Pure functions that derive computed values from S.
// Screens call these instead of reimplementing logic inline.
// All functions are pure: they read S but never write to it.

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────
const YR = 365 * 24 * 60 * 60 * 1000;

export function now() { return new Date(); }
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - now()) / (1000 * 60 * 60 * 24));
}
export function isOverdue(dateStr) {
  const d = daysUntil(dateStr);
  return d !== null && d < 0;
}
export function isDueSoon(dateStr, withinDays = 30) {
  const d = daysUntil(dateStr);
  return d !== null && d >= 0 && d <= withinDays;
}

// ─── STAFF SELECTORS ──────────────────────────────────────────────────────────
export function activeStaff() {
  return S.staff.filter(st =>
    !st.status || st.status === 'Active' || st.status === 'On Leave'
  );
}

export function keyPersonnel() {
  return activeStaff().filter(st => st.classification === 'Key Personnel');
}

export function staffWithOverdueDeclarations() {
  return activeStaff().filter(st =>
    (st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff') &&
    st.declNext && isOverdue(st.declNext)
  );
}

// ─── TRAINING SELECTORS ───────────────────────────────────────────────────────
export function trainingOverdue() {
  return S.training.filter(t => t.next && isOverdue(t.next));
}

export function trainingDueSoon() {
  return S.training.filter(t => t.next && isDueSoon(t.next));
}

export function isTrainingCurrent() {
  return S.training.length > 0 && trainingOverdue().length === 0;
}

// ─── CLIENT SELECTORS ─────────────────────────────────────────────────────────
export function activeClients() {
  const cutoff = new Date(now() - 7 * YR);
  return S.clients.filter(c => {
    const lastSvc = (c.services || []).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc > cutoff;
  });
}

export function isClientCddComplete(client) {
  const inds = client.individuals || [];
  return inds.length > 0 &&
    inds.every(i => i.idOutcome === 'Verified') &&
    inds.every(i => i.screenResult);
}

export function clientsWithIncompleteCdd() {
  return activeClients().filter(c => !isClientCddComplete(c));
}

export function dormantClients() {
  const twelveMonthsAgo = new Date(now() - YR);
  return activeClients().filter(c => {
    const lastSvc = (c.services || []).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc < twelveMonthsAgo;
  });
}

export function newClients() {
  const twelveMonthsAgo = new Date(now() - YR);
  return activeClients().filter(c =>
    c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo
  );
}

export function ongoingClients() {
  const twelveMonthsAgo = new Date(now() - YR);
  return activeClients().filter(c =>
    (c.services || []).some(sv =>
      sv.dateProvided && new Date(sv.dateProvided) >= twelveMonthsAgo
    ) || (c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo)
  );
}

export function allIndividuals() {
  return activeClients().flatMap(c => c.individuals || []);
}

export function screenedIndividuals() {
  return allIndividuals().filter(i => i.screenResult);
}

// ─── INCIDENT SELECTORS ───────────────────────────────────────────────────────
export function openIncidents() {
  return S.incidents.filter(i => !i.status || i.status === 'Open');
}

export function closedIncidents() {
  return S.incidents.filter(i => i.status === 'Closed');
}

// ─── GOVERNANCE SELECTORS ─────────────────────────────────────────────────────
export function isFirmComplete() {
  return Object.keys(S.firm).length > 2;
}

export function isRiskComplete() {
  return !!(S.scope.overallRating || S.scope.noneConfirmed);
}

export function isProgramComplete() {
  return !!(S.program.approvedBy);
}

export function isEnrolmentComplete() {
  return !!(S.enrolment.enrolled);
}

export function isRiskReviewOverdue() {
  return isOverdue(S.scope.nextReview);
}

export function isRiskReviewDueSoon() {
  return isDueSoon(S.scope.nextReview);
}

export function isProgramReviewOverdue() {
  return isOverdue(S.program.nextReview);
}

export function isProgramReviewDueSoon() {
  return isDueSoon(S.program.nextReview);
}
