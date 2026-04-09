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

  const badge = (r) => {
    if (!r) return '<span class="text-xs text-slate-400 italic">Not yet assessed</span>';
    const cls = r === 'High' ? 'bg-red-100 text-red-700' : r === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
    return `<span class="text-xs font-bold px-3 py-1 rounded-full ${cls}">${r}</span>`;
  };

  const allComplete = sr && cr && gr && pf;

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Overall Inherent Risk</h1>
        <p class="text-sm text-slate-400 mt-1">Your overall inherent risk rating is the foundation of your AML/CTF program — it determines the level of controls your program must contain.</p>
      </div>
    </div>

    <!-- RISK LENS SUMMARY -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Risk lens summary</h2>
        ${infoBtn('or-summary-tip')}
      </div>
      ${infoPop('or-summary-tip', `
        <strong class="text-indigo-300 block mb-2">How the three lenses combine</strong>
        <p>AUSTRAC requires firms to assess risk across three separate dimensions:</p>
        <ul class="mt-2 space-y-1.5">
          <li>· <strong class="text-white">Service risk</strong> — how the nature of your work could be exploited</li>
          <li>· <strong class="text-white">Customer risk</strong> — how the types of clients you serve increase likelihood</li>
          <li>· <strong class="text-white">Geography / delivery risk</strong> — how location and channel affect your ability to detect suspicious behaviour</li>
        </ul>
        <p class="mt-2">The overall rating is the highest of the three lens ratings. A single High lens produces a High overall rating — the other two lenses cannot offset it. Controls in your AML/CTF program reduce residual risk, but they do not change inherent risk.</p>
      `)}

      <div class="space-y-3">
        ${[
          ['Service Risk', sr, 'servicerisk', 'How your services could be misused for ML/TF'],
          ['Customer Risk', cr, 'customerrisk', 'Who increases the likelihood of ML/TF activity'],
          ['Geography / Delivery Risk', gr, 'georisk', 'Where and how services are delivered'],
        ].map(([label, rating, screen, desc]) => `
        <div class="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
          <div>
            <div class="text-sm font-medium text-slate-700">${label}</div>
            <div class="text-xs text-slate-400 mt-0.5">${desc}</div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            ${badge(rating)}
            ${!rating ? `<button onclick="go('${screen}')" class="text-xs text-indigo-500 font-medium hover:text-indigo-700">Complete →</button>` : `<button onclick="go('${screen}')" class="text-xs text-slate-400 hover:text-slate-600">Edit</button>`}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- PROLIFERATION FINANCING -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Proliferation Financing (PF) Risk</h2>
        ${infoBtn('pf-tip')}
      </div>
      ${infoPop('pf-tip', `
        <strong class="text-indigo-300 block mb-2">What is proliferation financing?</strong>
        <p>Proliferation financing (PF) is the financing of the development, production, or acquisition of weapons capable of mass destruction — nuclear, chemical, biological, or radiological weapons.</p>
        <p class="mt-2">AUSTRAC requires all reporting entities to separately assess their PF exposure as a distinct risk category. For most accounting firms, PF risk is Low — accountants do not typically serve clients in defence, arms trading, or sanctioned sectors.</p>
        <p class="mt-2">You should select High or Medium only if your firm acts for clients in:</p>
        <ul class="mt-1 space-y-1">
          <li>· Defence manufacturing or arms-related industries</li>
          <li>· Clients with connections to sanctioned countries or entities</li>
          <li>· Dual-use technology sectors with military applications</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">PF risk is assessed separately from ML/TF risk but feeds into your overall inherent risk rating.</p>
      `)}

      <p class="text-xs text-slate-400">Select the PF risk level that applies to your firm's client base and service scope.</p>

      <div class="grid grid-cols-3 gap-3">
        ${['Low', 'Medium', 'High'].map(v => `
        <button onclick="setPfRating('${v}')"
          class="py-3 rounded-xl text-sm font-semibold border transition ${sc.pfRating === v
            ? (v === 'High' ? 'bg-red-100 border-red-300 text-red-700' : v === 'Medium' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-green-100 border-green-300 text-green-700')
            : 'border-slate-200 text-slate-500 hover:bg-slate-50'}">
          ${v}
        </button>`).join('')}
      </div>

      ${sc.pfRating ? `
      <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
        <strong class="text-slate-600">Why this rating: </strong>
        ${sc.pfRating === 'Low'
          ? 'Most accounting firms are Low PF risk. Your clients are not connected to sanctioned sectors, defence manufacturing, or dual-use technology industries.'
          : sc.pfRating === 'Medium'
          ? 'Your firm may have some exposure to sectors or clients that could have indirect connections to proliferation-sensitive activities. Enhanced awareness and screening is appropriate.'
          : 'Your firm services clients in sectors with direct proliferation financing exposure. Specific PF controls and OFAC/UN sanctions screening must be documented in your AML/CTF program.'}
      </div>` : ''}
    </div>

    <!-- OVERALL RATING -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Overall Inherent Risk Rating</h2>
        ${infoBtn('or-tip')}
      </div>
      ${infoPop('or-tip', `
        <strong class="text-indigo-300 block mb-2">What this rating means for your program</strong>
        <p>Your overall inherent risk rating directly determines the minimum requirements of your AML/CTF program:</p>
        <ul class="mt-2 space-y-1.5">
          <li>· <strong class="text-white">High</strong> — Enhanced controls required. Your program must include documented risk mitigation strategies, more frequent monitoring, and may require independent review.</li>
          <li>· <strong class="text-white">Medium</strong> — Standard controls apply with documented risk assessment and at least annual review.</li>
          <li>· <strong class="text-white">Low</strong> — Standard AML/CTF program controls. Regular review still required.</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Inherent risk reflects your firm before controls. Residual risk — after controls are applied — is assessed in the AUSTRAC Enrolment section.</p>
      `)}

      ${!allComplete ? `
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        Complete all three risk lenses and set a PF rating before your overall risk can be calculated.
      </div>` : ''}

      <div class="pt-2">
        ${ratingRow('Overall Inherent Risk', autoOR, sc.overallRatingOverride, 'overallRatingOverride', 'overallRatingJust', sc.overallRatingJust)}
      </div>

      ${autoOR ? `
      <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
        <strong class="text-slate-600">What this means: </strong>
        ${autoOR === 'High'
          ? 'Your firm has high inherent ML/TF risk. Your AML/CTF program must include enhanced controls, documented risk mitigation strategies, and regular monitoring. The controls section will guide you through what is required.'
          : autoOR === 'Medium'
          ? 'Your firm has medium inherent ML/TF risk. Standard controls are required with a documented risk assessment and at least annual review of your program.'
          : 'Your firm has low inherent ML/TF risk. Standard AML/CTF program controls apply. Even at Low, a documented program and regular review are mandatory.'}
      </div>` : ''}

      <button onclick="saveOverallRisk()"
        class="w-full py-3 rounded-xl font-semibold transition ${allComplete && autoOR
          ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'}">
        Save Risk Assessment &amp; Continue to AML/CTF Program →
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
  if (!autoOR) { toast('Complete all three risk lenses and set a PF rating first', 'err'); return; }
  sc.overallRating = sc.overallRatingOverride || autoOR;
  save();
  toast('Risk assessment saved');
  go('program');
};
