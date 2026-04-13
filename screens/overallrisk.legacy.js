import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { 
  autoServiceRiskFromChecks,
  autoClientRisk,
  autoGeoRisk,
  autoOverallRisk
} from '../logic/index.js';

export function screen() {
  const sc = S.scope;

  const sr = sc.serviceRatingOverride || autoServiceRiskFromChecks(sc.serviceChecks);
  const cr = sc.clientRatingOverride  || autoClientRisk(sc.clientChecks);
  const gr = sc.geoRatingOverride     || autoGeoRisk(sc.geoChecks);
  const pf = sc.pfRating || 'Low';

  const autoOR = autoOverallRisk(sr, cr, gr, pf);
  const effectiveOR = sc.overallRatingOverride || autoOR;

  return `<div class="py-8 space-y-6">

    <div>
      <h1 class="text-2xl font-bold">Overall Inherent Risk</h1>
      <p class="text-slate-400 text-sm mt-1">
        This is your firm’s ML/TF risk level before any controls are applied.
      </p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-6">

      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">How your inherent risk is calculated</h2>
        ${infoBtn('or-tip')}
      </div>

      ${infoPop('or-tip', `
        <strong class="text-indigo-300 block mb-2">This is the heart of your risk assessment</strong>
        AUSTRAC requires you to determine your inherent ML/TF exposure by assessing:
        <ul class="mt-2 space-y-1.5">
          <li>• The designated services you provide</li>
          <li>• The types of clients you serve</li>
          <li>• Where those clients are located</li>
          <li>• Proliferation financing exposure</li>
        </ul>
      `)}

      <!-- Breakdown -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="border rounded-lg p-3">
          <div class="text-xs text-slate-500">Service Risk</div>
          <div class="font-semibold">${sr || '—'}</div>
        </div>
        <div class="border rounded-lg p-3">
          <div class="text-xs text-slate-500">Customer Risk</div>
          <div class="font-semibold">${cr || '—'}</div>
        </div>
        <div class="border rounded-lg p-3">
          <div class="text-xs text-slate-500">Geography / Delivery Risk</div>
          <div class="font-semibold">${gr || '—'}</div>
        </div>
        <div class="border rounded-lg p-3">
          <div class="text-xs text-slate-500">PF Risk</div>
          <div class="font-semibold">${pf}</div>
        </div>
      </div>

      <!-- Overall Rating -->
      <div id="rating-or" class="pt-4">
        ${ratingRow(
          'Inherent Risk Rating',
          autoOR,
          sc.overallRatingOverride,
          'overallRatingOverride',
          'overallRatingJust'
        )}
      </div>

      <!-- Explanation -->
      <div class="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
        <strong>Why this rating:</strong><br/>
        Your inherent risk is calculated from the highest contributing risk factor above.
        Any High category will result in a High inherent risk rating.
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-2 gap-3 pt-2">
        <div>
          <label class="text-xs text-slate-500">Assessment date</label>
          <input type="date" class="inp mt-1"
            value="${sc.assessDate||''}"
            onchange="scopeField('assessDate',this.value);autoSetRiskReview(this.value)">
        </div>
        <div>
          <label class="text-xs text-slate-500">Next review date</label>
          <input id="risk-next-review" type="date" class="inp mt-1"
            value="${sc.nextReview||''}"
            onchange="scopeField('nextReview',this.value)">
        </div>
      </div>

      <button onclick="saveOverallRisk()" class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">
        Save Inherent Risk Assessment
      </button>

    </div>
  </div>`;
}

/* ───────── ACTIONS ───────── */

window.saveOverallRisk = function() {
  const sc = S.scope;

  const sr = sc.serviceRatingOverride || autoServiceRiskFromChecks(sc.serviceChecks);
  const cr = sc.clientRatingOverride  || autoClientRisk(sc.clientChecks);
  const gr = sc.geoRatingOverride     || autoGeoRisk(sc.geoChecks);
  const pf = sc.pfRating || 'Low';

  sc.overallRating =
    sc.overallRatingOverride ||
    autoOverallRisk(sr, cr, gr, pf);

  save();
  toast('Inherent risk assessment saved');
  location.href = '#/dashboard';
};
