import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoGeoRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;
  const autoGR = autoGeoRisk(sc.geoChecks);

  const factors = [
    {
      id: 'gr-local',
      name: 'All clients are Australian residents',
      why: 'Face-to-face or easily verifiable interactions. Identity documents are Australian-issued and can be verified through standard DVS checks.',
      level: 'Low',
    },
    {
      id: 'gr-remote',
      name: 'Clients onboarded or serviced remotely',
      why: 'Without face-to-face interaction, identity documents cannot be physically inspected. Remote onboarding increases the risk of impersonation and makes it harder to detect altered or fraudulent documents.',
      level: 'Medium',
    },
    {
      id: 'gr-intermediary',
      name: 'Services delivered via intermediaries or referrers',
      why: 'When another party introduces clients to your firm, you cannot directly verify how that party conducted their own due diligence. Reliance on third parties requires a formal reliance agreement under the AML/CTF Rules.',
      level: 'Medium',
    },
    {
      id: 'gr-overseas',
      name: 'Some clients located overseas',
      why: 'Cross-border clients are subject to different regulatory regimes and may be harder to verify. Foreign-sourced funds introduce additional layering risk and may require source-of-wealth documentation.',
      level: 'High',
    },
    {
      id: 'gr-highrisk',
      name: 'Clients connected to FATF high-risk jurisdictions',
      why: 'FATF (Financial Action Task Force) publishes a list of jurisdictions with weak AML/CTF controls. Clients from these countries carry elevated ML/TF and sanctions risk. AUSTRAC expects enhanced scrutiny for any business connected to these jurisdictions.',
      level: 'High',
    },
  ];

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Geography &amp; Delivery Risk</h1>
        <p class="text-sm text-slate-400 mt-1">Where your clients are and how you interact with them affects your ability to verify identity and detect suspicious behaviour.</p>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Delivery channels and client locations</h2>
        ${infoBtn('gr-tip')}
      </div>
      ${infoPop('gr-tip', `
        <strong class="text-indigo-300 block mb-2">How to assess geography and delivery risk</strong>
        <p>Tick every factor that applies to your firm's typical operating model. You are describing how you interact with clients and where they are located — not describing individual transactions.</p>
        <p class="mt-2">AUSTRAC expects firms to recognise that the same service carries different risk depending on how it is delivered. Helping a local client set up a company in person is lower risk than helping an overseas client do the same via email.</p>
        <ul class="mt-2 space-y-1.5">
          <li>· <strong class="text-white">FATF jurisdictions</strong> — the FATF list is published at <span class="text-indigo-300">fatf-gafi.org</span>. If any client has connections to a listed country, tick this item.</li>
          <li>· <strong class="text-white">Remote onboarding</strong> — this includes any client you have never met in person, including clients who signed engagement letters by email.</li>
          <li>· <strong class="text-white">Intermediaries</strong> — this includes referrals from financial planners, lawyers, or other accountants where you did not conduct the initial client assessment yourself.</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">This rating is one of three inputs to your overall inherent risk rating.</p>
      `)}

      <p class="text-xs text-slate-400">Tick all that apply to your firm's typical operating model.</p>

      <div class="space-y-2">
        ${factors.map(({ id, name, why, level }) => {
          const checked = (sc.geoChecks || []).includes(id);
          const bg = checked
            ? (level === 'High' ? 'bg-red-50 border-red-200' : level === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200')
            : 'border-slate-200';
          const badge = level === 'High' ? 'bg-red-100 text-red-700' : level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
          return `
          <label class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${bg}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${checked ? 'checked' : ''} onchange="toggleCheck('geoChecks','${id}',this)">
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="text-sm font-medium text-slate-700">${name}</div>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${badge}">${level}</span>
              </div>
              <div class="text-xs text-slate-400 mt-1 leading-relaxed">${why}</div>
            </div>
          </label>`;
        }).join('')}
      </div>

      <div class="pt-2">
        ${ratingRow('Geography / Delivery Risk Rating', autoGR, sc.geoRatingOverride, 'geoRatingOverride', 'geoRatingJust', sc.geoRatingJust)}
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
        <strong class="text-slate-600">Why this rating: </strong>
        ${autoGR === 'High'
          ? 'Your firm services overseas clients or has connections to FATF high-risk jurisdictions. These introduce cross-border verification challenges and elevated sanctions exposure that require enhanced controls.'
          : autoGR === 'Medium'
          ? 'Your firm onboards or services clients remotely or via intermediaries. Without face-to-face interaction, additional verification steps are required to mitigate identity risk.'
          : 'Your clients are local and interactions are face-to-face or otherwise easily verifiable. Geography and delivery channels do not elevate your inherent risk.'}
      </div>

      <button onclick="saveGeoRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
        Save &amp; Continue to Overall Risk →
      </button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.saveGeoRisk = function() {
  if (!S.scope.geoChecks || S.scope.geoChecks.length === 0) {
    toast('Select at least one delivery channel or client location before saving', 'err'); return;
  }
  S.scope.geoRating = S.scope.geoRatingOverride || autoGeoRisk(S.scope.geoChecks);
  save();
  toast('Geography risk saved');
  go('overallrisk');
};
