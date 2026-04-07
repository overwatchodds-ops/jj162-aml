// ─── VALIDATION ───────────────────────────────────────────────────────────────
// Pure validation functions. Each returns { valid: bool, errors: string[] }.
// Screens call these before saving — no DOM access, no toast calls here.
// The screen is responsible for showing errors to the user.

// ─── FIRM ─────────────────────────────────────────────────────────────────────
export function validateFirm(data) {
  const errors = [];
  if (!data.name?.trim())      errors.push('Firm name is required');
  if (!data.abn?.trim())       errors.push('ABN is required');
  if (!data.principal?.trim()) errors.push('Principal contact name is required');
  if (!data.email?.trim())     errors.push('Principal email is required');
  return { valid: errors.length === 0, errors };
}

// ─── STAFF ────────────────────────────────────────────────────────────────────
export function validateStaff(data) {
  const errors = [];
  if (!data.name?.trim()) errors.push('Name is required');
  if (data.classification === 'Key Personnel') {
    if (!data.policeResult) errors.push('Police check result is required for Key Personnel');
    if (!data.date)         errors.push('Vetting date is required for Key Personnel');
  }
  return { valid: errors.length === 0, errors };
}

// ─── TRAINING ─────────────────────────────────────────────────────────────────
export function validateTraining(data) {
  const errors = [];
  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.date)         errors.push('Training date is required');
  if (!data.provider?.trim()) errors.push('Training provider is required');
  return { valid: errors.length === 0, errors };
}

// ─── CLIENT ───────────────────────────────────────────────────────────────────
export function validateClient(data) {
  const errors = [];
  if (!data.name?.trim())       errors.push('Entity name is required');
  if (!data.entityType)         errors.push('Entity type is required');
  if (!data.service)            errors.push('Designated service is required');
  if (!data.cddDate)            errors.push('CDD date is required');
  if (!data.cddBy?.trim())      errors.push('CDD conducted by is required');

  // Individuals — at least one required
  const inds = data.individuals || [];
  if (inds.length === 0) {
    errors.push('At least one individual must be added');
  } else {
    inds.forEach((ind, i) => {
      if (!ind.name?.trim()) errors.push(`Individual ${i + 1}: name is required`);
      if (!ind.role)         errors.push(`Individual ${i + 1}: role is required`);
    });
  }
  return { valid: errors.length === 0, errors };
}

// ─── INCIDENT ─────────────────────────────────────────────────────────────────
export function validateIncident(data) {
  const errors = [];
  if (!data.clientName?.trim())    errors.push('Client is required');
  if (!data.dateIdentified)        errors.push('Date identified is required');
  if (!data.suspicion?.trim())     errors.push('Nature of suspicion is required');
  return { valid: errors.length === 0, errors };
}

// ─── PROGRAM ──────────────────────────────────────────────────────────────────
export function validateProgram(data) {
  const errors = [];
  if (!data.approvedBy?.trim())   errors.push('Approved by is required');
  if (!data.approvedDate)         errors.push('Approval date is required');
  if (!data.confirmed)            errors.push('You must confirm the program is in place');
  return { valid: errors.length === 0, errors };
}

// ─── RISK ASSESSMENT ──────────────────────────────────────────────────────────
export function validateRisk(scope) {
  const errors = [];
  if (!scope.overallRating && !scope.noneConfirmed) {
    errors.push('Risk assessment must be completed before saving');
  }
  return { valid: errors.length === 0, errors };
}
