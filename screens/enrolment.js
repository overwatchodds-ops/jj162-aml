import { S, save } from '../state/index.js';
import { toast } from '../components/index.js';

export function screen() {
  const confirmed = !!(S.enrolment.enrolled || S.austracConfirmed);

  return `
    <div class="py-8 space-y-8">

      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">AUSTRAC Enrolment</h1>
          <p class="text-sm text-slate-400 mt-1">Enrolment is a legal requirement before operating as a reporting entity.</p>
        </div>
        ${confirmed
          ? '<span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">✓ Confirmed</span>'
          : '<span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-500">⚠ Not yet confirmed</span>'}
      </div>

      <!-- CONTEXT -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-700">What you need to do</h2>
        <p class="text-sm text-slate-600 leading-relaxed">
          Before operating as a reporting entity, your firm must be enrolled with AUSTRAC.
          Enrolment is completed directly at austrac.gov.au — SimpleAML cannot do this for you.
        </p>
        <p class="text-sm text-slate-600 leading-relaxed">
          If you have not yet enrolled, complete this now before 1 July 2026.
          Once enrolled, confirm below.
        </p>
        <a href="https://www.austrac.gov.au/business/new-to-austrac/enrol-or-register"
           target="_blank" rel="noopener"
           class="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition no-underline">
          Enrol at austrac.gov.au →
        </a>
      </div>

      <!-- CONFIRMATION -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-700">Confirmation</h2>
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" id="en-enrolled" ${confirmed ? 'checked' : ''} onchange="confirmAustracEnrolment(this.checked)" class="mt-0.5 w-4 h-4 flex-shrink-0">
          <span class="text-sm text-slate-700 leading-relaxed">I confirm this firm is enrolled with AUSTRAC as a reporting entity.</span>
        </label>
        ${confirmed ? `
        <div class="text-xs text-green-600 font-medium">
          ✓ Enrolment confirmed — this is recorded in your compliance register.
        </div>` : ''}
      </div>

    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.confirmAustracEnrolment = function(checked) {
  S.austracConfirmed = checked;
  // Keep backward compatibility with S.enrolment.enrolled
  if (!S.enrolment) S.enrolment = {};
  S.enrolment.enrolled = checked;
  save();
  toast(checked ? 'AUSTRAC enrolment confirmed' : 'Enrolment confirmation removed');
};
