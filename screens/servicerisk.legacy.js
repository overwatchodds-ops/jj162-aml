import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';

function deriveServiceRisk(rows=[]) {
  const t6 = rows.map(r => r.table6);

  // High risk services (AUSTRAC Table 6 items linked to movement/control of funds or structures)
  if (t6.some(x => ['2','3','4','5'].includes(x))) return 'High';

  // Medium risk services (structures but no direct funds control)
  if (t6.some(x => ['6','7','8','9'].includes(x))) return 'Medium';

  // Low risk (tax/accounting only)
  return 'Low';
}

export function screen() {
  const sc = S.scope;

  if (!sc.classifierConfirmed) {
    return `<div class="p-8 text-center text-slate-500">
      Complete <strong>Designated Services Identification</strong> first.
    </div>`;
  }

  const autoRating = deriveServiceRisk(sc.classifierMatched);
  const effective = sc.serviceRatingOverride || autoRating;

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Service Risk Assessment</h1>
      <p class="text-slate-400 text-sm mt-1">
        This rating is derived automatically from the designated services your firm provides.
      </p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Your services mapped to AUSTRAC risk</h2>
        ${infoBtn('sr-tip')}
      </div>

      ${infoPop('sr-tip', `
        <strong class="text-indigo-300 block mb-2">How this rating is calculated</strong>
        AUSTRAC considers services involving control of client funds, business sales,
        or complex structures as inherently higher ML/TF risk.
        This rating is based purely on the Table 6 items you matched earlier.
      `)}

      <div class="space-y-2 text-sm text-slate-600">
        ${sc.classifierMatched.map(r => `
          <div class="flex justify-between border-b py-2">
            <span>${r.task}</span>
            <span class="text-xs text-slate-400">Table 6 — ${r.table6}</span>
          </div>
        `).join('')}
      </div>

      <div id="rating-sr" class="pt-4">
        ${ratingRow('Service Risk Rating', autoRating, sc.serviceRatingOverride, 'serviceRatingOverride', 'serviceRatingJust')}
      </div>

      <div class="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
        <strong>Why this rating:</strong><br/>
        ${
          autoRating === 'High'
          ? 'One or more of your services involve control of client funds, business transactions, or acting in a nominee/secretary capacity.'
          : autoRating === 'Medium'
          ? 'Your services involve creating or managing legal structures but do not directly control client funds.'
          : 'Your services are limited to standard tax and accounting work with minimal ML/TF exposure.'
        }
      </div>

      <button onclick="saveServiceRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">
        Save Service Risk
      </button>
    </div>
  </div>`;
}

/* ───────── ACTIONS ───────── */

window.saveServiceRisk = function() {
  if (!S.scope.serviceRatingOverride) {
    const rows = S.scope.classifierMatched || [];
    S.scope.serviceRating = deriveServiceRisk(rows);
  } else {
    S.scope.serviceRating = S.scope.serviceRatingOverride;
  }

  save();
  toast('Service risk saved');
  location.href = '#/customerRisk';
};
