import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoGeoRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;
  const autoGR = autoGeoRisk(sc.geoChecks);

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Geography &amp; Delivery Risk</h1>
      <p class="text-slate-400 text-sm mt-1">Risk increases when clients are overseas or when services are delivered without face-to-face interaction.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Where your clients are and how you interact</h2>
        ${infoBtn('gr-tip')}
      </div>
      ${infoPop('gr-tip', `<strong class="text-indigo-300 block mb-2">Why geography and delivery matter</strong>
        <p>AUSTRAC expects firms to assess the ML/TF exposure created by the location of clients and the channels through which services are delivered. Non face-to-face onboarding and overseas clients both increase the difficulty of identity verification and ongoing monitoring.</p>`)}

      <p class="text-xs text-slate-400">Tick all that apply to your firm.</p>

      <div class="space-y-2">
        ${[
          ['gr-local',    'All clients are Australian residents',          'Face-to-face or easily verifiable',                'Low'],
          ['gr-remote',   'Clients onboarded remotely or online',          'No physical interaction with clients',             'Medium'],
          ['gr-overseas', 'Some clients located overseas',                 'Cross-border exposure, harder to verify',          'High'],
          ['gr-highrisk', 'Clients in FATF high-risk jurisdictions',       'Sanctions exposure and elevated ML/TF risk',       'High'],
          ['gr-intermediary', 'Services delivered via intermediaries',     'Third party referrals introduce additional risk',  'Medium'],
        ].map(([id, name, desc, level]) => {
          const checked = (sc.geoChecks || []).includes(id);
          const bg = checked ? (level === 'High' ? 'bg-red-50 border-red-200' : level === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200') : '';
          const badge = level === 'High' ? 'bg-red-100 text-red-700' : level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
          return `
          <label class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${bg}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${checked ? 'checked' : ''} onchange="toggleCheck('geoChecks','${id}',this)">
            <div class="flex-1">
              <div class="text-sm font-medium text-slate-700">${name}</div>
              <div class="text-xs text-slate-400 mt-0.5">${desc}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${badge}">${level}</span>
          </label>`;
        }).join('')}
      </div>

      <div class="pt-2">
        ${ratingRow('Geography / Delivery Risk Rating', autoGR, sc.geoRatingOverride, 'geoRatingOverride', 'geoRatingJust', sc.geoRatingJust)}
      </div>

      <div class="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">
        <strong class="text-slate-500">Why this rating:</strong>
        ${autoGR === 'High'
          ? ' Your firm services overseas clients or clients in FATF high-risk jurisdictions — considered high ML/TF exposure.'
          : autoGR === 'Medium'
          ? ' Your firm onboards or services clients remotely or via intermediaries without face-to-face interaction.'
          : ' Your clients are local and interactions are face-to-face or easily verifiable.'}
      </div>

      <button onclick="saveGeoRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
        Save &amp; Continue to Overall Risk →
      </button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.saveGeoRisk = function() {
  S.scope.geoRating = S.scope.geoRatingOverride || autoGeoRisk(S.scope.geoChecks);
  save();
  toast('Geography risk saved');
  go('overallrisk');
};
