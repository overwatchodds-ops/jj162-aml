import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';
import { autoClientRisk } from '../logic/index.js';

export function screen() {
  const sc = S.scope;
  const autoCR = autoClientRisk(sc.clientChecks);

  const clients = [
    {
      id: 'cr-individuals',
      name: 'Local individuals / PAYG employees',
      why: 'Standard identity verification applies. Face-to-face interaction is typical and source of funds is straightforward to establish.',
      level: 'Low',
    },
    {
      id: 'cr-sme',
      name: 'SMEs in common industries',
      why: 'Standard Australian businesses with ABN registration. Ownership structures are generally simple and verifiable through ASIC.',
      level: 'Low',
    },
    {
      id: 'cr-trusts',
      name: 'Trusts and companies with complex structures',
      why: 'Trusts and multi-layered company structures can obscure the true beneficial owner. AUSTRAC requires firms to identify and verify all controllers, not just the named entity.',
      level: 'Medium',
    },
    {
      id: 'cr-international',
      name: 'International clients or overseas connections',
      why: 'Cross-border clients are harder to verify and may be subject to different regulatory regimes. Foreign ownership also introduces sanctions exposure that domestic clients do not carry.',
      level: 'High',
    },
    {
      id: 'cr-cash',
      name: 'Cash-intensive industries',
      why: 'Hospitality, retail, construction and trades handle high volumes of cash, making it easier to introduce illicit funds into the financial system. AUSTRAC considers these industries inherently higher risk.',
      level: 'High',
    },
    {
      id: 'cr-pep',
      name: 'Politically exposed persons (PEPs) or their associates',
      why: 'PEPs hold or have held prominent public positions and carry elevated corruption risk. AUSTRAC requires enhanced CDD for all PEPs, regardless of jurisdiction.',
      level: 'High',
    },
  ];

  return `<div style="max-width:680px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Customer Risk</h1>
      <p style="font-size:13px;color:#64748b;">Who you act for directly affects the likelihood that your services could be misused. Some client types require enhanced due diligence regardless of the service provided.</p>
    </div>
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Your client base</span>
        ${infoBtn('cr-tip'}
      </div>
      ${infoPop('cr-tip', `
        <strong class="text-indigo-300 block mb-2">How to assess customer risk</strong>
        <p>Tick every client type your firm regularly acts for. You are assessing the composition of your client base, not individual clients — individual client risk is assessed in the Client Register.</p>
        <p class="mt-2">AUSTRAC expects your firm to understand which categories of client it serves and to apply higher scrutiny to those that carry greater ML/TF exposure. A firm that serves cash-intensive businesses must have stronger controls than one that serves only PAYG employees.</p>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Your customer risk rating is one of three inputs to your overall inherent risk rating. It does not stand alone — a High customer rating combined with Low service and geography ratings will produce a Medium overall rating.</p>
      `)}

      <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">Tick every client type your firm commonly services.</p>

      <div>
        ${clients.map(({ id, name, why, level }) => {
          const checked = (sc.clientChecks || []).includes(id);
          const borderCol = checked ? (level === 'High' ? '#fecaca' : level === 'Medium' ? '#fde68a' : '#bbf7d0') : '#e2e8f0';
          const bgCol = checked ? (level === 'High' ? '#fef2f2' : level === 'Medium' ? '#fffbeb' : '#f0fdf4') : '#fff';
          const pillBg = level === 'High' ? '#fef2f2' : level === 'Medium' ? '#fffbeb' : '#f0fdf4';
          const pillCol = level === 'High' ? '#991b1b' : level === 'Medium' ? '#92400e' : '#166534';
          return `
          <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:0.5px solid ${borderCol};border-radius:10px;cursor:pointer;background:${bgCol};margin-bottom:6px;transition:background .1s;">
            <input type="checkbox" style="margin-top:2px;flex-shrink:0;" ${checked ? 'checked' : ''} onchange="toggleCheck('clientChecks','${id}',this)">
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
        ${ratingRow('Customer Risk Rating', autoCR, sc.clientRatingOverride, 'clientRatingOverride', 'clientRatingJust', sc.clientRatingJust)}
      </div>

      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#64748b;line-height:1.6;margin-bottom:14px;">
        <span style="font-weight:500;color:#0f172a;">Why this rating: </span>
        ${autoCR === 'High'
          ? 'Your client base includes international clients, PEPs, or cash-intensive industries — all of which AUSTRAC considers to carry elevated ML/TF exposure requiring enhanced due diligence.'
          : autoCR === 'Medium'
          ? 'Your client base includes trusts or companies with complex structures, requiring beneficial ownership assessment and ongoing monitoring to identify who ultimately controls the entity.'
          : 'Your clients are primarily local individuals and standard SMEs. Standard CDD procedures apply with no elevated monitoring requirements from a customer risk perspective.'}
      </div>

      <button onclick="saveCustomerRisk()" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;">Save &amp; Continue to Geography Risk →</button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.saveCustomerRisk = function() {
  if (!S.scope.clientChecks || S.scope.clientChecks.length === 0) {
    toast('Select at least one client type before saving', 'err'); return;
  }
  S.scope.customerRating = S.scope.clientRatingOverride || autoClientRisk(S.scope.clientChecks);
  save();
  toast('Customer risk saved');
  go('georisk');
};
