import { S, save } from '../state/index.js';

// ─── UPDATE DISPATCHER ────────────────────────────────────────────────────────
// All state mutations go through update(). Screens never write to S directly.
//
// Usage:
//   update('firm.save', { name: 'Smith & Co', abn: '12 345 678 901' });
//   update('client.add', clientRecord);
//   update('client.edit', { index: 2, record: clientRecord });
//
// Benefits:
//   - One place to add logging, validation, or side effects
//   - State changes are traceable and auditable
//   - Screens become thinner — they collect data and call update()

export function update(action, payload) {
  switch (action) {

    // ─── FIRM ───────────────────────────────────────────────────────────────
    case 'firm.save':
      S.firm = payload;
      break;

    // ─── SCOPE / RISK ────────────────────────────────────────────────────────
    case 'scope.field':
      S.scope[payload.key] = payload.val;
      break;

    case 'scope.save':
      Object.assign(S.scope, payload);
      break;

    // ─── PROGRAM ─────────────────────────────────────────────────────────────
    case 'program.save':
      // Push current approval into history before overwriting
      if (S.program.approvedBy && S.program.approvedDate) {
        if (!S.program.approvalHistory) S.program.approvalHistory = [];
        S.program.approvalHistory.unshift({
          approvedBy:    S.program.approvedBy,
          approvedTitle: S.program.approvedTitle || '',
          approvedDate:  S.program.approvedDate,
          version:       S.program.version || '',
          nextReview:    S.program.nextReview || '',
          notified:      S.program.notified || '',
          savedAt:       Date.now()
        });
      }
      Object.assign(S.program, payload);
      break;

    // ─── ENROLMENT ───────────────────────────────────────────────────────────
    case 'enrolment.field':
      S.enrolment[payload.key] = payload.val;
      break;

    case 'enrolment.save':
      Object.assign(S.enrolment, payload);
      break;

    // ─── STAFF ───────────────────────────────────────────────────────────────
    case 'staff.add':
      payload.history = [];
      S.staff.unshift(payload);
      break;

    case 'staff.edit': {
      const { index, record } = payload;
      if (S.staff[index]) {
        const old = Object.assign({}, S.staff[index]);
        const history = old.history || [];
        delete old.history;
        record.history = [old, ...history];
        S.staff[index] = record;
      }
      break;
    }

    // ─── TRAINING ────────────────────────────────────────────────────────────
    case 'training.add':
      payload.history = [];
      S.training.unshift(payload);
      break;

    case 'training.edit': {
      const { index, record } = payload;
      if (S.training[index]) {
        const old = Object.assign({}, S.training[index]);
        const history = old.history || [];
        delete old.history;
        record.history = [old, ...history];
        S.training[index] = record;
      }
      break;
    }

    // ─── CLIENTS ─────────────────────────────────────────────────────────────
    case 'client.add':
      payload.history = [];
      payload.services = payload.service
        ? [{ serviceName: payload.service, dateProvided: payload.cddDate, newCddRequired: false }]
        : [];
      S.clients.unshift(payload);
      break;

    case 'client.edit': {
      const { index, record } = payload;
      if (S.clients[index]) {
        const old = JSON.parse(JSON.stringify(S.clients[index]));
        const existingServices = old.services || [];
        if (existingServices.length > 0 && record.service) {
          existingServices[0].serviceName = record.service;
          existingServices[0].dateProvided = existingServices[0].dateProvided || record.cddDate;
        } else if (existingServices.length === 0 && record.service) {
          existingServices.push({ serviceName: record.service, dateProvided: record.cddDate, newCddRequired: false });
        }
        record.services = existingServices;
        const history = old.history || [];
        delete old.history;
        record.history = [old, ...history];
        S.clients[index] = record;
      }
      break;
    }

    case 'client.addService': {
      const { index, service } = payload;
      if (S.clients[index]) {
        if (!S.clients[index].services) S.clients[index].services = [];
        S.clients[index].services.push(service);
        S.clients[index].updatedAt = Date.now();
      }
      break;
    }

    // ─── INCIDENTS ───────────────────────────────────────────────────────────
    case 'incident.add':
      payload.history = [];
      S.incidents.unshift(payload);
      break;

    case 'incident.edit': {
      const { index, record } = payload;
      if (S.incidents[index]) {
        const old = JSON.parse(JSON.stringify(S.incidents[index]));
        const history = old.history || [];
        delete old.history;
        record.history = [old, ...history];
        S.incidents[index] = record;
      }
      break;
    }

    // ─── REPORT ──────────────────────────────────────────────────────────────
    case 'report.field':
      if (!S.report) S.report = {};
      S.report[payload.key] = payload.val;
      break;

    case 'report.addHistory':
      if (!S.report) S.report = {};
      if (!S.report.history) S.report.history = [];
      S.report.history.unshift(payload);
      break;

    case 'report.deleteHistory':
      if (S.report?.history) S.report.history.splice(payload.index, 1);
      break;

    // ─── NAVIGATION STATE ────────────────────────────────────────────────────
    case 'nav.go':
      S.currentScreen = payload;
      break;

    default:
      console.warn(`update(): unknown action "${action}"`);
      return;
  }

  save();
}
