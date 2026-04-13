import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';

function deriveServiceRisk(matched = []) {
  const itemNums = new Set();
  matched.forEach(r => {
    (r.table6_items || []).forEach(n => itemNums.add(n));
    if (!r.table6_items && r.table6) {
      const found = r.table6.match(/Item (\d+)/g) || [];
      found.forEach(m => itemNums.add(parseInt(m.replace('Item ', ''))));
    }
  });
  if ([2, 3, 4, 5].some(n => itemNums.has(n))) return 'High';
  if ([6, 7, 8, 9].some(n => itemNums.has(n))) return 'Medium';
  return 'Low';
}

export function screen() {
  const sc = S.scope;

  if (!sc.classifierConfirmed) {
    return `<div class="py-8 space-y-6">
      <h1 class="text-2xl font-bold text-slate-900">Service Risk</h1>
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
        Complete <strong>Designated Services</strong> first — your service risk rating is derived from your confirmed Table 6 services.
        <button onclick="go('risk')" class="ml-2 underline font-semibold">Go there →</button>
      </div>
    </div>`;
  }

  const matched = sc.classifierMatched || [];
  const autoRating = deriveServiceRisk(matched);

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Service Risk</h1>
        <p class="text-sm text-slate-400 mt-1">The services you provide determine your firm's inherent exposure to ML/TF risk under AUSTRAC's framework.</p>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Your services and their risk classification</h2>
        ${infoBtn('sr-tip')}
      </div>
      ${infoPop('sr-tip', `
        <strong class="text-indigo-300 block mb-2">How AUSTRAC classifies service risk</strong>
        <p>AUSTRAC groups designated services into risk tiers based on how directly they could be used to move, hide, or legitimise illicit funds:</p>
        <ul class="mt-2 space-y-1.5">
          <li>· <strong class="text-white">High — Items 2, 3, 4, 5</strong><br>Direct control or movement of client funds, business transactions, or property. These services place money directly in your hands or facilitate major asset transfers.</li>
          <li>· <strong class="text-white">Medium — Items 6, 7, 8, 9</strong><br>Creating or managing legal structures, governance roles, registered office services. These don't move funds directly but create entities that can be misused.</li>
          <li>· <strong class="text-white">Low</strong><br>No designated services with direct financial or structural exposure.</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">This rating is calculated automatically from your confirmed designated services. You can override it only if your professional judgement differs — a written justification is required for audit purposes.</p>
      `)}

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

      <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
        <strong class="text-slate-600">Why this rating: </strong>
        ${autoRating === 'High'
          ? 'One or more of your services involve direct control or movement of client funds, execution of business transactions, or property settlements — all considered high inherent ML/TF risk by AUSTRAC because they create direct opportunities for placement, layering, or integration of illicit funds.'
          : autoRating === 'Medium'
          ? 'Your services involve creating or managing legal structures, company secretarial functions, or registered office services. These do not directly control client funds but create entities and roles that can be misused to conceal beneficial ownership or facilitate illicit activity.'
          : 'Your designated services do not involve direct financial control or structural creation. Inherent service risk is low, though other risk lenses (customer and geography) may still elevate your overall rating.'}
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
