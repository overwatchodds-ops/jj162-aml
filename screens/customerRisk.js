import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoClientRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;
  const autoCR = autoClientRisk(sc.clientChecks);

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Customer Risk Assessment</h1>
      <p class="text-slate-400 text-sm mt-1">Risk increases when your client base includes complex structures, overseas connections, or cash-intensive industries.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Your client base</h2>
        ${infoBtn('cr-tip')}
      </div>
      ${infoPop('cr-tip', `<strong class="text-indigo-300 block mb-2">How customer risk is determined</strong>
        <p>AUSTRAC considers who your clients are as a key ML/TF risk factor. Some client types are more likely to present ML/TF risk and require enhanced due diligence and ongoing monitoring.</p>`)}

      <p class="text-xs text-slate-400">Tick every client type your firm commonly services.</p>

      <div class="space-y-2">
        ${[
          ['cr-individuals','Local individuals / PAYG employees','Standard tax clients with straightforward identity verification','Low'],
          ['cr-sme','SMEs in common industries','Standard Australian businesses, low complexity','Low'],
          ['cr-trusts','Trusts and companies','Require beneficial ownership assessment and ongoing monitoring','Medium'],
          ['cr-international','International clients or overseas connections','Harder to verify, cross-border exposure','High'],
          ['cr-cash','Cash-intensive industries','Hospitality, retail, construction — higher layering risk','High'],
        ].map(([id, name, desc, level]) => {
          const checked = (sc.clientChecks || []).includes(id);
          const bg = checked ? (level === 'High' ? 'bg-red-50 border-red-200' : level === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200') : '';
          const badge = level === 'High' ? 'bg-red-100 text-red-700' : level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
          return `
          <label class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${bg}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${checked ? 'checked' : ''} onchange="toggleCheck('clientChecks','${id}',this)">
            <div class="flex-1">
              <div class="text-sm font-medium text-slate-700">${name}</div>
              <div class="text-xs text-slate-400 mt-0.5">${desc}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${badge}">${level}</span>
          </label>`;
        }).join('')}
      </div>

      <div class="pt-2">
        ${ratingRow('Customer Risk Rating', autoCR, sc.clientRatingOverride, 'clientRatingOverride', 'clientRatingJust', sc.clientRatingJust)}
      </div>

      <div class="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">
        <strong class="text-slate-500">Why this rating:</strong>
        ${autoCR === 'High'
          ? ' Your client base includes international clients or cash-intensive industries — both considered high ML/TF exposure by AUSTRAC.'
          : autoCR === 'Medium'
          ? ' Your client base includes trusts or companies requiring beneficial ownership assessment.'
          : ' Your clients are primarily local individuals and standard SMEs with straightforward verification.'}
      </div>

      <button onclick="saveCustomerRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
        Save &amp; Continue to Geography Risk →
      </button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.saveCustomerRisk = function() {
  S.scope.customerRating = S.scope.clientRatingOverride || autoClientRisk(S.scope.clientChecks);
  save();
  toast('Customer risk saved');
  go('georisk');
};
