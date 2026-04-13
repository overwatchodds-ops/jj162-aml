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

  return `<div style="max-width:680px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Geography &amp; Delivery Risk</h1>
      <p style="font-size:13px;color:#64748b;">Where your clients are and how you interact with them affects your ability to verify identity and detect suspicious behaviour.</p>
    </div>
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Delivery channels and client locations</span>
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

      <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">Tick all that apply to your firm's typical operating model.</p>

      <div>
        ${factors.map(({ id, name, why, level }) => {
          const checked = (sc.geoChecks || []).includes(id);
          const borderCol = checked ? (level === 'High' ? '#fecaca' : level === 'Medium' ? '#fde68a' : '#bbf7d0') : '#e2e8f0';
          const bgCol = checked ? (level === 'High' ? '#fef2f2' : level === 'Medium' ? '#fffbeb' : '#f0fdf4') : '#fff';
          const pillBg = level === 'High' ? '#fef2f2' : level === 'Medium' ? '#fffbeb' : '#f0fdf4';
          const pillCol = level === 'High' ? '#991b1b' : level === 'Medium' ? '#92400e' : '#166534';
          return `
          <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:0.5px solid ${borderCol};border-radius:10px;cursor:pointer;background:${bgCol};margin-bottom:6px;transition:background .1s;">
            <input type="checkbox" style="margin-top:2px;flex-shrink:0;" ${checked ? 'checked' : ''} onchange="toggleCheck('geoChecks','${id}',this)">
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;">
                <div style="font-size:12px;font-weight:500;color:#0f172a;">${name}</div>
                <span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;flex-shrink:0;background:${pillBg};color:${pillCol};">${level}</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;line-height:1.5;">${why}</div>
            </div>
          </label>`;
        }).join('')}
      </div>

      <div style="margin-bottom:14px;">
        ${ratingRow('Geography / Delivery Risk Rating', autoGR, sc.geoRatingOverride, 'geoRatingOverride', 'geoRatingJust', sc.geoRatingJust)}
      </div>

      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#64748b;line-height:1.6;margin-bottom:14px;">
        <span style="font-weight:500;color:#0f172a;">Why this rating: </span>
        ${autoGR === 'High'
          ? 'Your firm services overseas clients or has connections to FATF high-risk jurisdictions. These introduce cross-border verification challenges and elevated sanctions exposure that require enhanced controls.'
          : autoGR === 'Medium'
          ? 'Your firm onboards or services clients remotely or via intermediaries. Without face-to-face interaction, additional verification steps are required to mitigate identity risk.'
          : 'Your clients are local and interactions are face-to-face or otherwise easily verifiable. Geography and delivery channels do not elevate your inherent risk.'}
      </div>

      <button onclick="saveGeoRisk()" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;">Save &amp; Continue to Overall Risk →</button>
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
