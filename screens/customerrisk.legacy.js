import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoClientRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;
  const autoCR = autoClientRisk(sc.clientChecks);
  const effective = sc.clientRatingOverride || autoCR;

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Customer Risk Assessment</h1>
      <p class="text-slate-400 text-sm mt-1">
        This rating is based on the types of clients your firm typically acts for.
      </p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">

      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Your client base</h2>
        ${infoBtn('cr-tip')}
      </div>

      ${infoPop('cr-tip', `
        <strong class="text-indigo-300 block mb-2">How client risk is determined</strong>
        AUSTRAC considers who your clients are as a key ML/TF risk factor.
        Some client types require enhanced CDD and ongoing monitoring.
      `)}

      <p class="text-xs text-slate-400">Tick every client type your firm commonly services.</p>

      <div class="space-y-2">
        ${[
          ['cr-individuals','Local individuals / PAYG employees','Standard tax clients','Low'],
          ['cr-sme','SMEs in common industries','Standard Australian businesses','Low'],
          ['cr-trusts','Trusts and companies','Require beneficial ownership assessment','Medium'],
          ['cr-international','International clients or overseas connections','Harder to verify, higher exposure','High'],
          ['cr-cash','Cash-intensive industries','Hospitality, retail, construction, trades','High'],
        ].map(([id,name,desc,level])=>`
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${(sc.clientChecks||[]).includes(id)?(level==='High'?'bg-red-50 border-red-200':level==='Medium'?'bg-amber-50 border-amber-200':'bg-green-50 border-green-200'):''}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${(sc.clientChecks||[]).includes(id)?'checked':''} onchange="toggleCheck('clientChecks','${id}',this)">
            <div class="flex-1">
              <div class="text-sm font-medium">${name}</div>
              <div class="text-xs text-slate-400">${desc}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${level==='High'?'bg-red-100 text-red-700':level==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${level}</span>
          </label>`).join('')}
      </div>

      <div id="rating-cr" class="pt-4">
        ${ratingRow('Customer Risk Rating', autoCR, sc.clientRatingOverride, 'clientRatingOverride', 'clientRatingJust')}
      </div>

      <div class="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
        <strong>Why this rating:</strong><br/>
        ${
          autoCR === 'High'
          ? 'Your client base includes international clients or cash-intensive industries which AUSTRAC considers higher ML/TF exposure.'
          : autoCR === 'Medium'
          ? 'Your client base includes trusts or complex structures requiring beneficial ownership assessment.'
          : 'Your clients are primarily local individuals and standard SMEs with straightforward verification.'
        }
      </div>

      <button onclick="saveCustomerRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">
        Save Customer Risk
      </button>

    </div>
  </div>`;
}

/* ───────── ACTIONS ───────── */

window.saveCustomerRisk = function() {
  S.scope.customerRating = S.scope.clientRatingOverride || autoClientRisk(S.scope.clientChecks);
  save();
  toast('Customer risk saved');
  location.href = '#/geoRisk';
};
