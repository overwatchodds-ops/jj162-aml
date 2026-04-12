import { S } from '../state/index.js';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function screen() {
  const sc = S.scope;
  const p  = S.program;

  // ── FIRM PROFILE STATUS ───────────────────────────────────────────────────
  const f = S.firm || {};
  const firmComplete = !!(f.name && f.contactName && f.contactEmail);

  // ── APPOINTMENTS STATUS ──────────────────────────────────────────────────
  const appt = S.firm?.appt || {};
  const apptComplete = !!(appt.amlco?.name && appt.senior?.name);
  const apptOverdue  = apptComplete && isOverdue(appt.nextReview);
  const apptDate     = appt.savedDate || null;
  const apptNextDate = appt.nextReview || null;

  // ── RISK ASSESSMENT STATUS ────────────────────────────────────────────────
  const riskComplete = !!(
    sc.classifierConfirmed &&
    sc.mltfConfirmed &&
    sc.serviceRating &&
    sc.customerRating &&
    sc.geoRating &&
    sc.overallRating &&
    sc.pfRating
  );
  const riskOverdue   = riskComplete && isOverdue(sc.riskNextReview);
  const riskDate      = sc.riskAssessmentDate || null;
  const riskNextDate  = sc.riskNextReview || null;

  // ── AML/CTF PROGRAM STATUS ────────────────────────────────────────────────
  const programComplete = !!(p.approvedBy && p.approvedDate);
  const programOverdue  = programComplete && isOverdue(p.nextReview);
  const programDate     = p.approvedDate || null;
  const programNextDate = p.nextReview || null;

  // ── AUSTRAC ENROLMENT STATUS ──────────────────────────────────────────────
  const enrolled = !!(S.enrolment.enrolled || S.austracConfirmed);

  const allOk = firmComplete && apptComplete && !apptOverdue && riskComplete && !riskOverdue && programComplete && !programOverdue && enrolled;

  // ── STATUS ROW ────────────────────────────────────────────────────────────
  const row = (label, complete, overdue, completedDate, nextDate, screen, incompleteAction) => {
    const statusBadge = !complete
      ? '<span class="text-xs font-semibold text-red-600">⚠ Incomplete</span>'
      : overdue
        ? '<span class="text-xs font-semibold text-amber-600">⚠ Overdue</span>'
        : '<span class="text-xs font-semibold text-green-700">✓ Complete</span>';

    const reviewCell = !complete
      ? `<span class="text-xs text-slate-400">${incompleteAction}</span>`
      : !nextDate
        ? '<span class="text-xs text-slate-400 italic">No review date set</span>'
        : overdue
          ? `<span class="text-xs font-semibold text-amber-600">⚠ Was due ${fmtDate(nextDate)}</span>`
          : `<span class="text-xs text-green-700 font-semibold">✓ Due ${fmtDate(nextDate)}</span>`;

    const completedCell = completedDate
      ? `<span class="text-xs text-slate-500">${fmtDate(completedDate)}</span>`
      : '<span class="text-xs text-slate-300">—</span>';

    return `
    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer" onclick="go('${screen}')">
      <td class="px-5 py-4 font-semibold text-slate-700 text-sm">${label}</td>
      <td class="px-5 py-4">${statusBadge}</td>
      <td class="px-5 py-4">${completedCell}</td>
      <td class="px-5 py-4">${reviewCell}</td>
      <td class="px-5 py-4 text-right">
        <button onclick="event.stopPropagation();go('${screen}')" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">
          ${complete ? 'Review →' : 'Complete →'}
        </button>
      </td>
    </tr>`;
  };

  return `<div class="py-8 space-y-6">

    <div>
      <h1 class="text-2xl font-bold text-slate-900">Compliance</h1>
      <p class="text-sm text-slate-400 mt-1">Your AML/CTF compliance obligations — firm profile, appointments, risk assessment, program approval, and AUSTRAC enrolment.</p>
    </div>

    ${allOk ? `
    <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 font-medium">
      ✓ All three compliance obligations are complete and current.
    </div>` : ''}

    <!-- STATUS TABLE -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 w-48">Obligation</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 w-32">Status</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 w-36">Completed</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Next Review</th>
            <th class="px-5 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          ${row(
            'Firm Profile',
            firmComplete, false,
            f.savedDate || null, null,
            'firm-details',
            'Enter your practice name, contact details and email'
          )}
          ${row(
            'Appointments',
            apptComplete, apptOverdue,
            apptDate, apptNextDate,
            'firm-appointments',
            'Name your AMLCO, Reporting Officer and Senior Manager'
          )}
          ${row(
            'Risk Assessment',
            riskComplete, riskOverdue,
            riskDate, riskNextDate,
            'risk',
            'Complete all five risk screens'
          )}
          ${row(
            'AML/CTF Program',
            programComplete, programOverdue,
            programDate, programNextDate,
            'program',
            'Approve and document your AML/CTF program'
          )}
          <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer" onclick="go('enrolment')">
            <td class="px-5 py-4 font-semibold text-slate-700 text-sm">AUSTRAC Enrolment</td>
            <td class="px-5 py-4">
              ${enrolled
                ? '<span class="text-xs font-semibold text-green-700">✓ Confirmed</span>'
                : '<span class="text-xs font-semibold text-red-600">⚠ Not confirmed</span>'}
            </td>
            <td class="px-5 py-4"><span class="text-xs text-slate-400 italic">One-time</span></td>
            <td class="px-5 py-4"><span class="text-xs text-slate-400 italic">No annual review required</span></td>
            <td class="px-5 py-4 text-right">
              <button onclick="event.stopPropagation();go('enrolment')" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">
                ${enrolled ? 'View →' : 'Confirm →'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- RISK ASSESSMENT DETAIL (if complete) -->
    ${riskComplete ? `
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 cursor-pointer hover:border-indigo-200 transition" onclick="go('overallrisk')">
      <h2 class="text-sm font-bold text-slate-700">Risk Assessment Summary</h2>
      <div class="grid grid-cols-4 gap-4 text-xs">
        ${[
          ['Service Risk',   sc.serviceRating   || sc.serviceRatingOverride],
          ['Customer Risk',  sc.customerRating  || sc.clientRatingOverride],
          ['Geography Risk', sc.geoRating       || sc.geoRatingOverride],
          ['Overall',        sc.overallRating   || sc.overallRatingOverride],
        ].map(([label, rating]) => {
          const cls = rating === 'High' ? 'bg-red-100 text-red-700' : rating === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
          return `<div class="text-center">
            <div class="text-slate-400 mb-1">${label}</div>
            <span class="inline-block text-xs font-bold px-3 py-1 rounded-full ${cls}">${rating || '—'}</span>
          </div>`;
        }).join('')}
      </div>
      ${sc.pfRating ? `<div class="text-xs text-slate-400">PF Risk: <strong class="text-slate-600">${sc.pfRating}</strong></div>` : ''}
    </div>` : ''}

    <!-- PROGRAM DETAIL (if complete) -->
    ${programComplete ? `
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-1 cursor-pointer hover:border-indigo-200 transition" onclick="go('program')">
      <h2 class="text-sm font-bold text-slate-700">AML/CTF Program Approval</h2>
      <div class="text-xs text-slate-500">
        Approved by <strong class="text-slate-700">${p.approvedBy}</strong>${p.approvedTitle ? ` (${p.approvedTitle})` : ''}
        on ${fmtDate(p.approvedDate)}${p.version ? ` · ${p.version}` : ''}
      </div>
    </div>` : ''}

  </div>`;
}
