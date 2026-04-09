import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoServiceRiskFromChecks } from '../logic/index.js';

// Derive service risk from matched Table 6 items
function deriveServiceRisk(matched = []) {
  const itemNums = new Set();
  matched.forEach(r => {
    (r.table6_items || []).forEach(n => itemNums.add(n));
    // Fallback: parse from table6 string
    if (!r.table6_items && r.table6) {
      const found = r.table6.match(/Item (\d+)/g) || [];
      found.forEach(m => itemNums.add(parseInt(m.replace('Item ', ''))));
    }
  });
  // Items 2,3,4,5 — direct financial/transactional exposure → High
  if ([2,3,4,5].some(n => itemNums.has(n))) return 'High';
  // Items 6,7,8,9 — structural/governance exposure → Medium
  if ([6,7,8,9].some(n => itemNums.has(n))) return 'Medium';
  return 'Low';
}

export function screen() {
  const sc = S.scope;

  if (!sc.classifierConfirmed) {
    return `<div class="py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Service Risk Assessment</h1>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
        Complete <strong>Designated Services Identification</strong> first.
        <button onclick="go('risk')" class="ml-2 underline font-semibold">Go there →</button>
      </div>
    </div>`;
  }

  const matched = sc.classifierMatched || [];
  const autoRating = deriveServiceRisk(matched);
  const effective = sc.serviceRatingOverride || autoRating;

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Service Risk Assessment</h1>
      <p class="text-slate-400 text-sm mt-1">This rating is derived automatically from the designated services your firm provides.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Your services mapped to AUSTRAC risk</h2>
        ${infoBtn('sr-tip')}
      </div>
      ${infoPop('sr-tip', `<strong class="text-indigo-300 block mb-2">How this rating is calculated</strong>
        <p>AUSTRAC considers services involving direct control of client funds, business transactions, or property as inherently higher ML/TF risk. This rating is based purely on the Table 6 items matched earlier.</p>
        <ul class="mt-2 space-y-1">
          <li>· <strong class="text-white">High</strong> — Items 2, 3, 4, 5 (funds, transactions, property)</li>
          <li>· <strong class="text-white">Medium</strong> — Items 6, 7, 8, 9 (structures, governance)</li>
          <li>· <strong class="text-white">Low</strong> — No direct funds or structural exposure</li>
        </ul>`)}

      <div class="border border-slate-200 rounded-xl overflow-hidden">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Task / Service</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3 w-48">Table 6 Item</th>
            </tr>
          </thead>
          <tbody>
            ${matched.map(r => `
            <tr class="border-b border-slate-50 last:border-0">
              <td class="px-4 py-3 text-slate-700">${r.task}</td>
              <td class="px-4 py-3 text-xs text-slate-500">${r.table6 || '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="pt-2">
        ${ratingRow('Service Risk Rating', autoRating, sc.serviceRatingOverride, 'serviceRatingOverride', 'serviceRatingJust', sc.serviceRatingJust)}
      </div>

      <div class="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">
        <strong class="text-slate-500">Why this rating:</strong>
        ${autoRating === 'High'
          ? ' One or more of your services involve direct control of client funds, business transactions, or property — all considered high ML/TF exposure by AUSTRAC.'
          : autoRating === 'Medium'
          ? ' Your services involve creating or managing legal structures but do not directly control client funds.'
          : ' Your services are limited to standard accounting and advisory work with low direct ML/TF exposure.'}
      </div>

      <button onclick="saveServiceRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
        Save &amp; Continue to Customer Risk →
      </button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.saveServiceRisk = function() {
  const matched = S.scope.classifierMatched || [];
  S.scope.serviceRating = S.scope.serviceRatingOverride || deriveServiceRisk(matched);
  save();
  toast('Service risk saved');
  go('customerrisk');
};
