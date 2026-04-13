import { S } from '../state/index.js';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}
function isOD(d) { return d ? new Date(d) < new Date() : false; }

function vettingOk(st) {
  if (st.classification === 'Key Personnel') return !!(st.policeResult && st.bankruptResult && st.nsResult && st.declSigned);
  if (st.classification === 'Standard AML/CTF Staff') return !!(st.nsResult && st.declSigned);
  return true;
}
function cddOk(c) {
  const inds = c.individuals || [];
  return inds.length > 0 && inds.every(i => i.idOutcome === 'Verified' && i.screenResult) && c.tippingAck && c.cddBy && c.purpose;
}
function cddOD(c) { return cddOk(c) && c.nextReviewDate && new Date(c.nextReviewDate) < new Date(); }

export function screen() {
  const sc   = S.scope   || {};
  const p    = S.program || {};
  const f    = S.firm    || {};
  const appt = f.appt    || {};
  const now  = new Date();
  const setup = S.setup  || {};
  const history = S.report?.history || [];
  const lastReport = history[0] || null;

  // ── COMPLIANCE ───────────────────────────────────────────────────────────
  const firmOk    = !!(f.name && f.savedDate);
  const apptOk    = !!(appt.amlco?.name && appt.amlco?.date);
  const apptDue   = apptOk && isOD(appt.nextReview);
  const scopeOk   = !!(sc.classifierConfirmed || sc.noneConfirmed);
  const riskOk    = !!(sc.serviceRating && sc.customerRating && sc.geoRating && sc.overallRating && sc.pfRating);
  const riskDue   = riskOk && isOD(sc.riskNextReview);
  const programOk = !!(p.approvedBy && p.approvedDate);
  const programDue= programOk && isOD(p.nextReview);
  const enrolled  = !!(S.enrolment?.enrolled || S.austracConfirmed);

  const compChecks = [firmOk, apptOk && !apptDue, scopeOk, riskOk && !riskDue, programOk && !programDue];
  const compPassed = compChecks.filter(Boolean).length;
  const compTotal  = compChecks.length;

  // ── PERSONNEL ────────────────────────────────────────────────────────────
  const active    = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const amlStaff  = active.filter(st => st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff');
  const incompVet = amlStaff.filter(st => !vettingOk(st)).length;
  const declDue   = amlStaff.filter(st => st.declNext && new Date(st.declNext) < now).length;
  const trainDue  = S.training.filter(t => t.next && new Date(t.next) < now).length;

  // ── CLIENTS ──────────────────────────────────────────────────────────────
  const clients    = S.clients   || [];
  const incidents  = S.incidents || [];
  const incompCdd  = clients.filter(c => !cddOk(c)).length;
  const overdueCdd = clients.filter(c => cddOD(c)).length;
  const openSmrs   = incidents.filter(i => !i.status || i.status === 'Open').length;

  // ── OVERALL ──────────────────────────────────────────────────────────────
  const allGreen   = compPassed === compTotal && incompVet === 0 && declDue === 0 && trainDue === 0 && incompCdd === 0 && overdueCdd === 0 && openSmrs === 0;
  const overallPct = Math.round(((compPassed / compTotal) * 0.6 + ((incompVet === 0 && declDue === 0 && trainDue === 0 && amlStaff.length > 0) ? 0.2 : 0) + ((incompCdd === 0 && overdueCdd === 0 && openSmrs === 0 && clients.length > 0) ? 0.2 : 0)) * 100);

  // ── DEADLINE ─────────────────────────────────────────────────────────────
  const deadline    = new Date('2026-07-01T00:00:00+10:00');
  const daysLeft    = Math.max(0, Math.ceil((deadline - now) / (1000*60*60*24)));
  const deadlinePast= daysLeft === 0;

  // ── EXCEPTIONS ───────────────────────────────────────────────────────────
  const exc = [];
  if (!firmOk)       exc.push({ label:'Firm Profile incomplete',           sub:'Enter practice name, ABN and contact details', screen:'firm-details',       urgency:'high' });
  if (!apptOk)       exc.push({ label:'Appointments not set',              sub:'Name your AMLCO, Reporting Officer and Senior Manager', screen:'firm-appointments', urgency:'high' });
  if (!scopeOk)      exc.push({ label:'Designated services not confirmed', sub:'Complete the designated services analysis', screen:'risk',              urgency:'high' });
  if (!riskOk)       exc.push({ label:'Risk assessment incomplete',        sub:'Complete all five risk screens', screen:'risk',              urgency:'high' });
  if (!programOk)    exc.push({ label:'AML/CTF Program not approved',      sub:'Approve and document your AML/CTF program', screen:'program',           urgency:'high' });
  if (!enrolled)     exc.push({ label:'AUSTRAC enrolment not confirmed',   sub:'Confirm enrolment before 29 July 2026', screen:'enrolment',         urgency:'high' });
  if (apptDue)       exc.push({ label:'Appointments review overdue',       sub:`Review was due ${fmtDate(appt.nextReview)}`, screen:'firm-appointments', urgency:'medium' });
  if (riskDue)       exc.push({ label:'Risk assessment review overdue',    sub:`Review was due ${fmtDate(sc.riskNextReview)}`, screen:'risk',          urgency:'medium' });
  if (programDue)    exc.push({ label:'AML/CTF Program review overdue',    sub:`Review was due ${fmtDate(p.nextReview)}`, screen:'program',           urgency:'medium' });
  if (incompVet > 0) exc.push({ label:`${incompVet} staff with incomplete vetting`, sub:'Complete before performing AML/CTF functions', screen:'staff',   urgency:'high' });
  if (declDue > 0)   exc.push({ label:`${declDue} declaration${declDue>1?'s':''} overdue`, sub:'Annual re-declaration required', screen:'staff',         urgency:'medium' });
  if (trainDue > 0)  exc.push({ label:`${trainDue} training record${trainDue>1?'s':''} overdue`, sub:'AML/CTF training past next due date', screen:'training', urgency:'medium' });
  if (incompCdd > 0) exc.push({ label:`${incompCdd} client${incompCdd>1?'s':''} with incomplete CDD`, sub:'CDD must be complete before providing designated services', screen:'clients', urgency:'high' });
  if (overdueCdd > 0)exc.push({ label:`${overdueCdd} client${overdueCdd>1?'s':''} with overdue screening`, sub:'Re-screening required based on risk rating', screen:'clients', urgency:'medium' });
  if (openSmrs > 0)  exc.push({ label:`${openSmrs} open SMR${openSmrs>1?'s':''}`, sub:'Review open matters and record AMLCO outcome', screen:'incidents', urgency:'high' });

  const highExc   = exc.filter(e => e.urgency === 'high');
  const medExc    = exc.filter(e => e.urgency === 'medium');

  // ── STYLE HELPERS ────────────────────────────────────────────────────────
  const dot = (ok, overdue) => {
    const col = !ok ? '#dc2626' : overdue ? '#f59e0b' : '#16a34a';
    return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${col};flex-shrink:0;margin-top:4px;"></span>`;
  };

  const badge = (ok, overdue, labelBad='Incomplete') => {
    if (!ok)     return `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;white-space:nowrap;">${labelBad}</span>`;
    if (overdue) return `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fffbeb;color:#92400e;white-space:nowrap;">Overdue</span>`;
    return       `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;white-space:nowrap;">Complete</span>`;
  };

  const obligRow = (label, ok, overdue, screen, detail) => `
    <div onclick="go('${screen}')" style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background .1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      ${dot(ok, overdue)}
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:#0f172a;">${label}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${detail}</div>
      </div>
      ${badge(ok, overdue)}
    </div>`;

  const statCell = (num, label, sub, colour, screen) => `
    <div onclick="go('${screen}')" style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;cursor:pointer;transition:background .1s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
      <div style="font-size:22px;font-weight:500;color:${colour};line-height:1;margin-bottom:3px;">${num}</div>
      <div style="font-size:11px;color:#0f172a;">${label}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:1px;">${sub}</div>
    </div>`;

  const excRow = (e) => `
    <div onclick="go('${e.screen}')" style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <div style="width:2px;height:30px;border-radius:2px;background:${e.urgency==='high'?'#dc2626':'#f59e0b'};flex-shrink:0;"></div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:#0f172a;">${e.label}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${e.sub}</div>
      </div>
      <div style="font-size:11px;color:#94a3b8;flex-shrink:0;">→</div>
    </div>`;

  // Ring
  const r = 28;
  const circ = +(2*Math.PI*r).toFixed(1);
  const offset = +(circ*(1-overallPct/100)).toFixed(1);
  const ringColour = allGreen ? '#16a34a' : overallPct >= 60 ? '#4f46e5' : '#f59e0b';

  return `<div style="max-width:900px;">

    <!-- PAGE HEADER -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">${f.name || 'Home'}</h1>
        <p style="font-size:13px;color:#64748b;">${deadlinePast ? 'Obligations in effect from 1 July 2026' : `${daysLeft} days to 1 July 2026 · AML/CTF compliance status`}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
        ${!S.setupComplete ? `<button onclick="go('setup')" style="font-size:12px;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:7px 14px;border-radius:8px;cursor:pointer;">Setup checklist</button>` : ''}
        <button onclick="go('reports-overview')" style="font-size:12px;color:#fff;background:#4f46e5;border:none;padding:7px 16px;border-radius:8px;cursor:pointer;font-weight:500;">Reports →</button>
      </div>
    </div>

    <!-- HERO -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:22px 24px;display:flex;align-items:center;gap:24px;margin-bottom:16px;">
      <div style="position:relative;width:64px;height:64px;flex-shrink:0;">
        <svg viewBox="0 0 64 64" style="width:64px;height:64px;transform:rotate(-90deg);">
          <circle cx="32" cy="32" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="7"/>
          <circle cx="32" cy="32" r="${r}" fill="none" stroke="${ringColour}" stroke-width="7"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:${ringColour};">${overallPct}%</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:15px;font-weight:500;color:#0f172a;margin-bottom:4px;">
          ${allGreen ? 'Fully compliant' : exc.length > 0 ? `${exc.length} item${exc.length>1?'s':''} need${exc.length===1?'s':''} attention` : 'Compliance in progress'}
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:10px;">
          ${compPassed} of ${compTotal} compliance obligations
          · ${amlStaff.length === 0 ? '<span style="color:#94a3b8;">no personnel recorded</span>' : (incompVet===0&&declDue===0&&trainDue===0) ? '<span style="color:#16a34a;">personnel current</span>' : '<span style="color:#f59e0b;">personnel needs attention</span>'}
          · ${clients.length === 0 ? '<span style="color:#94a3b8;">no clients recorded</span>' : (incompCdd===0&&overdueCdd===0&&openSmrs===0) ? '<span style="color:#16a34a;">clients current</span>' : '<span style="color:#f59e0b;">clients need attention</span>'}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${deadlinePast
            ? `<span style="font-size:11px;padding:2px 10px;border-radius:99px;background:#fef2f2;color:#991b1b;border:0.5px solid #fecaca;">Obligations in effect</span>`
            : `<span style="font-size:11px;padding:2px 10px;border-radius:99px;background:#f8fafc;color:#64748b;border:0.5px solid #e2e8f0;">${daysLeft} days to 1 July 2026</span>`}
          ${lastReport
            ? `<span style="font-size:11px;padding:2px 10px;border-radius:99px;background:#f0fdf4;color:#166534;border:0.5px solid #bbf7d0;">Report: ${lastReport.date}</span>`
            : `<span style="font-size:11px;padding:2px 10px;border-radius:99px;background:#f8fafc;color:#64748b;border:0.5px solid #e2e8f0;">No report generated yet</span>`}
        </div>
      </div>
    </div>

    <!-- TWO COLUMN -->
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-bottom:16px;">

      <!-- COMPLIANCE -->
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid #f1f5f9;">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">Compliance</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${compPassed} of ${compTotal} complete</div>
          </div>
          <button onclick="go('compliance-overview')" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;">View all</button>
        </div>
        <div style="padding:8px;">
          ${obligRow('Firm Profile',      firmOk,    false,       'firm-details',      firmOk    ? `Saved ${fmtDate(f.savedDate)}` : 'Name, ABN and contact details')}
          ${obligRow('Appointments',      apptOk,    apptDue,     'firm-appointments', apptOk    ? `AMLCO: ${appt.amlco?.name}` : 'AMLCO, Reporting Officer, Senior Manager')}
          ${obligRow('Designated services',scopeOk,  false,       'risk',              scopeOk   ? (sc.noneConfirmed ? 'Not in scope — confirmed' : 'Services confirmed') : 'Confirm scope')}
          ${obligRow('Risk assessment',   riskOk,    riskDue,     'risk',              riskOk    ? `Overall: ${sc.overallRating}${riskDue?' · Review overdue':''}` : 'Complete all five risk screens')}
          ${obligRow('AML/CTF Program',   programOk, programDue,  'program',           programOk ? `Approved by ${p.approvedBy}` : 'Approve your program')}
          ${obligRow('AUSTRAC enrolment', enrolled,  false,       'enrolment',         enrolled  ? 'Confirmed' : 'Confirm before 29 July 2026')}
        </div>
      </div>

      <!-- PERSONNEL + CLIENTS -->
      <div style="display:flex;flex-direction:column;gap:16px;">

        <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid #f1f5f9;">
            <div>
              <div style="font-size:12px;font-weight:500;color:#0f172a;">Personnel</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${amlStaff.length} AML staff</div>
            </div>
            <button onclick="go('personnel-overview')" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;">View</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:12px;">
            ${statCell(incompVet, 'Incomplete vetting', incompVet===0?'All complete':`${incompVet} staff`, incompVet===0?'#16a34a':'#dc2626', 'staff')}
            ${statCell(declDue,   'Decl. overdue',      declDue===0  ?'All current' :`${declDue} overdue`, declDue===0  ?'#16a34a':'#f59e0b', 'staff')}
            ${statCell(trainDue,  'Training overdue',   trainDue===0 ?'All current' :`${trainDue} overdue`,trainDue===0 ?'#16a34a':'#f59e0b', 'training')}
          </div>
        </div>

        <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid #f1f5f9;">
            <div>
              <div style="font-size:12px;font-weight:500;color:#0f172a;">Clients</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${clients.length} client${clients.length!==1?'s':''}</div>
            </div>
            <button onclick="go('clients-overview')" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;">View</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:12px;">
            ${statCell(incompCdd,  'Incomplete CDD',    incompCdd===0  ?'All complete':`${incompCdd} clients`,  incompCdd===0  ?'#16a34a':'#dc2626', 'clients')}
            ${statCell(overdueCdd, 'Screening overdue', overdueCdd===0 ?'All current' :`${overdueCdd} clients`, overdueCdd===0 ?'#16a34a':'#f59e0b', 'clients')}
            ${statCell(openSmrs,   'Open SMRs',         openSmrs===0   ?'No open items':`${openSmrs} open`,     openSmrs===0   ?'#16a34a':'#dc2626', 'incidents')}
          </div>
        </div>

      </div>
    </div>

    <!-- EXCEPTIONS -->
    ${exc.length > 0 ? `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid #f1f5f9;">
        <div>
          <div style="font-size:12px;font-weight:500;color:#0f172a;">Needs attention</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:1px;">${exc.length} item${exc.length>1?'s':''} require action</div>
        </div>
        ${highExc.length > 0 ? `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">${highExc.length} critical</span>` : ''}
      </div>
      ${highExc.length > 0 ? `
      <div style="padding:6px 16px 2px;font-size:10px;font-weight:500;color:#dc2626;text-transform:uppercase;letter-spacing:.06em;">Critical</div>
      ${highExc.map(excRow).join('')}` : ''}
      ${medExc.length > 0 ? `
      <div style="padding:6px 16px 2px;font-size:10px;font-weight:500;color:#f59e0b;text-transform:uppercase;letter-spacing:.06em;">Review needed</div>
      ${medExc.map(excRow).join('')}` : ''}
    </div>` : `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 24px;text-align:center;">
      <div style="font-size:14px;font-weight:500;color:#16a34a;margin-bottom:4px;">Nothing needs attention</div>
      <div style="font-size:12px;color:#64748b;">All compliance obligations, personnel and client CDD are complete and current.</div>
    </div>`}

  </div>`;
}
