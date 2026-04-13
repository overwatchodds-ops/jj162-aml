// ─── SETUP COMPUTATION ────────────────────────────────────────────────────────
// Derives S.setup from existing state. Call after every save() or load().
// Uses existing saml_v2 state paths — no new state keys required.
// S.setupComplete = the five core foundations are done.

export function computeSetup(S) {
  const f    = S.firm    || {};
  const appt = f.appt    || {};
  const sc   = S.scope   || {};
  const p    = S.program || {};
  const e    = S.enrolment || {};

  const firm = !!(
    f.name &&
    f.abn &&
    f.type &&
    f.principal &&
    f.email
  );

  const appointments = !!(
    appt.amlco?.name &&
    appt.amlco?.date
  );

  const scope = !!(
    sc.classifierConfirmed ||
    sc.noneConfirmed
  );

  const risk = !!(
    sc.serviceRating &&
    sc.customerRating &&
    sc.geoRating &&
    sc.overallRating &&
    sc.pfRating
  );

  const program = !!(
    p.approvedBy &&
    p.approvedDate
  );

  // Enrolment tracked but not required for setupComplete
  const enrolment = !!(e.enrolled || S.austracConfirmed);

  const setupComplete = firm && appointments && scope && risk && program;

  S.setup = { firm, appointments, scope, risk, program, enrolment };
  S.setupComplete = setupComplete;

  return setupComplete;
}
