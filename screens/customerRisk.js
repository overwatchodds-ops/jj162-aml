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

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Customer Risk</h1>
        <p class="text-sm text-slate-400 mt-1">Who you act for directly affects the likelihood that your services could be misused. Some client types require enhanced due diligence regardless of the service provided.</p>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Your client base</h2>
        ${infoBtn('cr-tip')}
      </div>
      ${infoPop('cr-tip', `
        <strong class="text-indigo-300 block mb-2">How to assess customer risk</strong>
        <p>Tick every client type your firm regularly acts for. You are assessing the composition of your client base, not individual clients — individual client risk is assessed in the Client Register.</p>
        <p class="mt-2">AUSTRAC expects your firm to understand which categories of client it serves and to apply higher scrutiny to those that carry greater ML/TF exposure. A firm that serves cash-intensive businesses must have stronger controls than one that serves only PAYG employees.</p>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Your customer risk rating is one of three inputs to your overall inherent risk rating. It does not stand alone — a High customer rating combined with Low service and geography ratings will produce a Medium overall rating.</p>
      `)}

      <p class="text-xs text-slate-400">Tick every client type your firm commonly services. Each item shows why that client type carries the risk level assigned.</p>

      <div class="space-y-2">
        ${clients.map(({ id, name, why, level }) => {
          const checked = (sc.clientChecks || []).includes(id);
          const bg = checked
            ? (level === 'High' ? 'bg-red-50 border-red-200' : level === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200')
            : 'border-slate-200';
          const badge = level === 'High' ? 'bg-red-100 text-red-700' : level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
          return `
          <label class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${bg}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${checked ? 'checked' : ''} onchange="toggleCheck('clientChecks','${id}',this)">
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
        ${ratingRow('Customer Risk Rating', autoCR, sc.clientRatingOverride, 'clientRatingOverride', 'clientRatingJust', sc.clientRatingJust)}
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
        <strong class="text-slate-600">Why this rating: </strong>
        ${autoCR === 'High'
          ? 'Your client base includes international clients, PEPs, or cash-intensive industries — all of which AUSTRAC considers to carry elevated ML/TF exposure requiring enhanced due diligence.'
          : autoCR === 'Medium'
          ? 'Your client base includes trusts or companies with complex structures, requiring beneficial ownership assessment and ongoing monitoring to identify who ultimately controls the entity.'
          : 'Your clients are primarily local individuals and standard SMEs. Standard CDD procedures apply with no elevated monitoring requirements from a customer risk perspective.'}
      </div>

      <button onclick="saveCustomerRisk()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
        Save &amp; Continue to Geography Risk →
      </button>
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
