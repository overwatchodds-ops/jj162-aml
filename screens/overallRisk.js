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
    if (!r) return '<span style="font-size:11px;color:#94a3b8;font-style:italic;">Not yet assessed</span>';
    const bg = r === 'High' ? '#fef2f2' : r === 'Medium' ? '#fffbeb' : '#f0fdf4';
    const col = r === 'High' ? '#991b1b' : r === 'Medium' ? '#92400e' : '#166534';
    return `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:${bg};color:${col};">${r}</span>`;
  };

  const allComplete = sr && cr && gr && pf;

  return `<div style="max-width:680px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Overall Inherent Risk</h1>
      <p style="font-size:13px;color:#64748b;">Your overall inherent risk rating is the foundation of your AML/CTF program — it determines the level of controls your program must contain.</p>
    </div>

    <!-- RISK LENS SUMMARY -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Risk lens summary</span>
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
        <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid #f1f5f9;">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">${label}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${desc}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            ${badge(rating)}
            ${!rating ? `<button onclick="go('${screen}')" style="font-size:11px;color:#4f46e5;background:none;border:none;cursor:pointer;font-weight:500;">Complete →</button>` : `<button onclick="go('${screen}')" style="font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer;">Edit</button>`}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- PROLIFERATION FINANCING -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Proliferation Financing (PF) Risk</span>
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

      <p style="font-size:11px;color:#94a3b8;margin-bottom:12px;">Select the PF risk level that applies to your firm's client base and service scope.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
        ${['Low', 'Medium', 'High'].map(v => {
          const active = sc.pfRating === v;
          const bg  = active ? (v === 'High' ? '#fef2f2' : v === 'Medium' ? '#fffbeb' : '#f0fdf4') : '#fff';
          const col = active ? (v === 'High' ? '#991b1b' : v === 'Medium' ? '#92400e' : '#166534') : '#64748b';
          const brd = active ? (v === 'High' ? '#fecaca' : v === 'Medium' ? '#fde68a' : '#bbf7d0') : '#e2e8f0';
          return `
        <button onclick="setPfRating('${v}')"
          style="padding:10px;border-radius:8px;font-size:12px;font-weight:500;border:0.5px solid ${brd};background:${bg};color:${col};cursor:pointer;transition:background .1s;">
          ${v}
        </button>`;
        }).join('')}
      </div>

      ${sc.pfRating ? `
      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#64748b;line-height:1.6;">
        <span style="font-weight:500;color:#0f172a;">Why this rating: </span>
        ${sc.pfRating === 'Low'
          ? 'Most accounting firms are Low PF risk. Your clients are not connected to sanctioned sectors, defence manufacturing, or dual-use technology industries.'
          : sc.pfRating === 'Medium'
          ? 'Your firm may have some exposure to sectors or clients that could have indirect connections to proliferation-sensitive activities. Enhanced awareness and screening is appropriate.'
          : 'Your firm services clients in sectors with direct proliferation financing exposure. Specific PF controls and OFAC/UN sanctions screening must be documented in your AML/CTF program.'}
      </div>` : ''}
    </div>

    <!-- OVERALL RATING -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Overall Inherent Risk Rating</span>
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
      <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:12px 14px;font-size:11px;color:#92400e;margin-bottom:12px;">
        Complete all three risk lenses and set a PF rating before your overall risk can be calculated.
      </div>` : ''}

      <div style="margin-bottom:14px;">
        ${ratingRow('Overall Inherent Risk', autoOR, sc.overallRatingOverride, 'overallRatingOverride', 'overallRatingJust', sc.overallRatingJust)}
      </div>

      ${autoOR ? `
      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#64748b;line-height:1.6;margin-bottom:14px;">
        <span style="font-weight:500;color:#0f172a;">What this means: </span>
        ${autoOR === 'High'
          ? 'Your firm has high inherent ML/TF risk. Your AML/CTF program must include enhanced controls, documented risk mitigation strategies, and regular monitoring. The controls section will guide you through what is required.'
          : autoOR === 'Medium'
          ? 'Your firm has medium inherent ML/TF risk. Standard controls are required with a documented risk assessment and at least annual review of your program.'
          : 'Your firm has low inherent ML/TF risk. Standard AML/CTF program controls apply. Even at Low, a documented program and regular review are mandatory.'}
      </div>` : ''}

      ${allComplete && autoOR ? `
      <div style="border-top:0.5px solid #f1f5f9;padding-top:14px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <label style="font-size:11px;font-weight:500;color:#0f172a;" for="ra-next-review">Next review date</label>
          <span style="font-size:11px;color:#94a3b8;">AUSTRAC expects annual review</span>
        </div>
        <input id="ra-next-review" type="date" class="inp"
          value="${sc.riskNextReview || ''}"
          onchange="scopeField('riskNextReview', this.value)">
        <p style="font-size:11px;color:#94a3b8;margin-top:6px;">The risk assessment must be reviewed at least annually, or when there is a material change to your firm's services, clients, or operating environment.</p>
      </div>` : ''}

      <button onclick="saveOverallRisk()"
        style="width:100%;font-size:13px;font-weight:500;border:none;padding:11px 16px;border-radius:8px;cursor:${allComplete && autoOR ? 'pointer' : 'not-allowed'};background:${allComplete && autoOR ? '#4f46e5' : '#f1f5f9'};color:${allComplete && autoOR ? '#fff' : '#94a3b8'};">
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
  if (!sc.pfRating) { toast('Select a Proliferation Financing (PF) risk rating before saving', 'err'); return; }
  if (!autoOR) { toast('Complete all three risk lenses first', 'err'); return; }
  sc.overallRating = sc.overallRatingOverride || autoOR;
  sc.riskAssessmentDate = new Date().toISOString().split('T')[0];
  // Auto-set next review to +12 months if not already set
  if (!sc.riskNextReview) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    sc.riskNextReview = d.toISOString().split('T')[0];
  }
  save();
  toast('Risk assessment saved');
  go('program');
};
