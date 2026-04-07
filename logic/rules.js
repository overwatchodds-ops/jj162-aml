// ─── COMPLIANCE RULES ─────────────────────────────────────────────────────────
// AUSTRAC-derived rules that determine required actions based on risk and state.
// These are the rules most likely to change as AUSTRAC guidance evolves.
// Edit this file when regulatory requirements change — not the screens.

// ─── CDD RULES ────────────────────────────────────────────────────────────────

// Does this client require Enhanced Due Diligence?
export function requiresEDD(client) {
  if (!client) return false;
  const inds = client.individuals || [];
  const hasPepOrSanctions = inds.some(i =>
    i.screenResult === 'PEP' || i.screenResult === 'Sanctions'
  );
  return (
    client.risk === 'High' ||
    hasPepOrSanctions ||
    client.offshoreJurisdiction ||
    client.complexStructure ||
    client.pepAmongControllers
  );
}

// Does this client require ongoing monitoring re-screen?
export function requiresRemonitor(client) {
  if (!client) return false;
  const yr = 365 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - yr);
  const lastScreen = (client.individuals || [])
    .map(i => i.screenDate ? new Date(i.screenDate) : null)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  return !lastScreen || lastScreen < cutoff;
}

// Is a new CDD required for this client (e.g. after a new service is added)?
export function requiresNewCdd(client) {
  if (!client) return false;
  return (client.services || []).some(s => s.newCddRequired);
}

// ─── STAFF RULES ──────────────────────────────────────────────────────────────

// Is this staff member classified as Key Personnel?
export function isKeyPersonnel(staffMember) {
  return staffMember?.classification === 'Key Personnel';
}

// Does this Key Personnel member require a fresh police check?
// AUSTRAC requires police checks to be current (within 3 years is standard practice)
export function requiresFreshPoliceCheck(staffMember) {
  if (!isKeyPersonnel(staffMember)) return false;
  if (!staffMember.date) return true;
  const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
  return new Date(staffMember.date) < new Date(Date.now() - threeYears);
}

// Is this staff member's annual declaration overdue?
export function isDeclarationOverdue(staffMember) {
  if (!staffMember.declNext) return false;
  return new Date(staffMember.declNext) < new Date();
}

// ─── RISK RULES ───────────────────────────────────────────────────────────────

// Should the risk assessment be reviewed? (annual minimum)
export function isRiskReviewRequired(scope) {
  if (!scope.nextReview) return true;
  return new Date(scope.nextReview) < new Date();
}

// Should the AML/CTF program be reviewed?
export function isProgramReviewRequired(program) {
  if (!program.nextReview) return true;
  return new Date(program.nextReview) < new Date();
}

// ─── SMR RULES ────────────────────────────────────────────────────────────────

// How many hours does the firm have to report a suspicious matter?
// Terrorism financing: 24 hours. All other: 3 business days (~72 hours).
export function smrDeadlineHours(incidentType) {
  return incidentType === 'terrorism' ? 24 : 72;
}

// ─── TRAINING RULES ───────────────────────────────────────────────────────────

// Is this training record current?
export function isTrainingCurrent(record) {
  if (!record.next) return false;
  return new Date(record.next) >= new Date();
}

// Does a new staff member need to complete training before commencing CDD duties?
// AUSTRAC requires training before staff perform AML/CTF functions.
export function requiresTrainingBeforeCommencing(staffMember) {
  return (
    staffMember.classification === 'Key Personnel' ||
    staffMember.classification === 'Standard AML/CTF Staff'
  ) && !staffMember.trainingDate;
}
