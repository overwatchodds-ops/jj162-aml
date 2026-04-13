import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoGeoRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;
  const autoGR = autoGeoRisk(sc.geoChecks);
  const effective = sc.geoRatingOverride || autoGR;

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Geography & Delivery Risk</h1>
      <p class="text-slate-400 text-sm mt-1">
        Risk increases when clients are overseas or when services are delivered without face-to-face interaction.
      </p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">

      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Where your clients are and how you interact</h2>
        ${infoBtn('gr-tip')}
      </div>

      ${infoPop('gr-tip', `
        <strong class="text-indigo-300 block mb-2">Why geography and delivery matter</strong>
        AUSTRAC expects firms to assess the ML/TF exposure created by:
        <ul class="mt-2 space-y-1.5">
          <li>• Clients located overseas</li>
          <li>• Clients in FATF high-risk jurisdictions</li>
          <li>• Non face-to-face onboarding and service delivery</li>
        </ul>
      `)}

      <p class="text-xs text-slate-400">Tick all that apply to your firm.</p>

      <div class="space-y-2">
        ${[
          ['gr-local','All clients are Australian residents','Face-to-face or easily verifiable','Low'],
          ['gr-remote','Clients onboarded remotely / online','No physical interaction','Medium'],
          ['gr-overseas','Some clients located overseas','Cross-border exposure','High'],
          ['gr-highrisk','Clients in FATF high-risk jurisdictions','Sanctions and ML exposure','High'],
        ].map(([id,name,desc,level])=>`
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${(sc.geoChecks||[]).includes(id)?(level==='High'?'bg-red-50 border-red-200':level==='Medium'?'bg-amber-50 border-amber-200':'bg-green-50 border-green-200'):''}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${(sc.geoChecks||[]).includes(id)?'checked':''} onchange="toggleCheck('geoChecks','${id}',this)">
            <div class="flex-1">
              <div class="text-sm font-medium">${name}</div>
              <div class="text-xs text-slate-400">${desc}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${level==='High'?'bg-red-100 text-red-700':level==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${level}</span>
          </label>`).join('')}
      </div>

      <div id="rating-gr" class="pt-4">
        ${ratingRow('Geography / Delivery Risk Rating', autoGR, sc.geoRatingOverride, 'geoRatingOverride', 'geoRatingJust')}
      </div>

      <div class="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
        <strong>Why this rating:</strong><br/>
        ${
          autoGR === 'High'
          ? 'Your firm services overseas clients or clients in FATF high-risk jurisdictions.'
          : autoGR === 'Medium'
          ? 'Your firm onboards or services clients remotely without face-to-face interaction.'
          : 'Your clients are local and interactions are easily verifiable.'
        }
      </div>

      <button onclick="saveGeoRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">
        Save Geography Risk
      </button>

    </div>
  </div>`;
}

/* ───────── ACTIONS ───────── */

window.saveGeoRisk = function() {
  S.scope.geoRating = S.scope.geoRatingOverride || autoGeoRisk(S.scope.geoChecks);
  save();
  toast('Geography risk saved');
  location.href = '#/overallRisk';
};
