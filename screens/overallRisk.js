import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoOverallRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;

  const sr = sc.serviceRating || sc.serviceRatingOverride || null;
  const cr = sc.customerRating || sc.clientRatingOverride || null;
  const gr = sc.geoRating || sc.geoRatingOverride || null;
  const pf = sc.pfRating || null;
  const autoOR = autoOverallRisk(sr, cr, gr, pf);
  const effective = sc.overallRatingOverride || autoOR;

  const badge = (r) => {
    if (!r) return '<span class="text-xs text-slate-400 italic">Not yet assessed</span>';
    const cls = r === 'High' ? 'bg-red-100 text-red-700' : r === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
    return `<span class="text-xs font-bold px-3 py-1 rounded-full ${cls}">${r}</span>`;
  };

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Overall Inherent Risk</h1>
      <p class="text-slate-400 text-sm mt-1">Your overall inherent risk rating combines all three risk lenses. This is the foundation of your AML/CTF program.</p>
    </div>

    <!-- SUMMARY OF INPUTS -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <h2 class="text-sm font-bold text-slate-700">Risk lens summary</h2>
      <div class="space-y-3">
        ${[
          ['Service Risk', sr, 'servicerisk', 'How your services could be misused'],
          ['Customer Risk', cr, 'customerrisk', 'Who increases that likelihood'],
          ['Geography / Delivery Risk', gr, 'georisk', 'Where and how services are delivered'],
        ].map(([label, rating, screen, desc]) => `
        <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
          <div>
            <div class="text-sm font-medium text-slate-700">${label}</div>
            <div class="text-xs text-slate-400">${desc}</div>
          </div>
          <div class="flex items-center gap-2">
            ${badge(rating)}
            ${!rating ? `<button onclick="go('${screen}')" class="text-xs text-indigo-500 underline">Complete →</button>` : ''}
          </div>
        </div>`).join('')}

        <!-- PF RISK -->
        <div class="pt-2">
          <div class="text-sm font-bold text-slate-700 mb-3">Proliferation Financing (PF) Risk</div>
          <p class="text-xs text-slate-400 mb-3">AUSTRAC requires firms to separately assess their exposure to proliferation financing — the financing of weapons of mass destruction.</p>
          <div class="grid grid-cols-3 gap-2">
            ${['Low','Medium','High'].map(v => `
            <button onclick="setPfRating('${v}')"
              class="py-2 rounded-xl text-sm font-semibold border transition ${sc.pfRating === v
                ? (v === 'High' ? 'bg-red-100 border-red-300 text-red-700' : v === 'Medium' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-green-100 border-green-300 text-green-700')
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'}">
              ${v}
            </button>`).join('')}
          </div>
          ${sc.pfRating ? `<p class="text-xs text-slate-400 mt-2">PF rating set to <strong>${sc.pfRating}</strong>. Most accounting firms are Low unless they service clients in sanctioned sectors.</p>` : ''}
        </div>
      </div>
    </div>

    <!-- OVERALL RATING -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Overall Inherent Risk Rating</h2>
        ${infoBtn('or-tip')}
      </div>
      ${infoPop('or-tip', `<strong class="text-indigo-300 block mb-2">How this is calculated</strong>
        <p>The overall rating is the highest of your three risk lens ratings. A single High lens produces a High overall rating — controls can reduce residual risk but do not change inherent risk.</p>`)}

      <div class="pt-2">
        ${ratingRow('Overall Inherent Risk', autoOR, sc.overallRatingOverride, 'overallRatingOverride', 'overallRatingJust', sc.overallRatingJust)}
      </div>

      ${autoOR ? `
      <div class="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">
        <strong class="text-slate-500">What this means:</strong>
        ${autoOR === 'High'
          ? ' Your firm has high inherent ML/TF risk. Your AML/CTF program must include enhanced controls, regular monitoring, and documented risk mitigation strategies.'
          : autoOR === 'Medium'
          ? ' Your firm has medium inherent ML/TF risk. Standard controls are required with documented risk assessment and regular review.'
          : ' Your firm has low inherent ML/TF risk. Standard AML/CTF program controls apply.'}
      </div>` : ''}

      <button onclick="saveOverallRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        ${!autoOR ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
        Save Risk Assessment →
      </button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.setPfRating = function(val) {
  S.scope.pfRating = val;
  save(); go('overallrisk');
};

window.saveOverallRisk = function() {
  const sc = S.scope;
  const sr = sc.serviceRating || sc.serviceRatingOverride || null;
  const cr = sc.customerRating || sc.clientRatingOverride || null;
  const gr = sc.geoRating || sc.geoRatingOverride || null;
  const autoOR = autoOverallRisk(sr, cr, gr, sc.pfRating);
  if (!autoOR) { toast('Complete all three risk sections first', 'err'); return; }
  sc.overallRating = sc.overallRatingOverride || autoOR;
  save();
  toast('Risk assessment saved');
  go('program');
};
