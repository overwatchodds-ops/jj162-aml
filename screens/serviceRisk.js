import { S, save } from '../state/index.js';
import { ratingRow, infoBtn, infoPop, toast } from '../components/index.js';

function deriveServiceRisk(matched = []) {
  const itemNums = new Set();
  matched.forEach(r => {
    (r.table6_items || []).forEach(n => itemNums.add(n));
    if (!r.table6_items && r.table6) {
      const found = r.table6.match(/Item (\d+)/g) || [];
      found.forEach(m => itemNums.add(parseInt(m.replace('Item ', ''))));
    }
  });
  if ([2, 3, 4, 5].some(n => itemNums.has(n))) return 'High';
  if ([6, 7, 8, 9].some(n => itemNums.has(n))) return 'Medium';
  return 'Low';
}

export function screen() {
  const sc = S.scope;

  if (!sc.classifierConfirmed) {
    return `<div style="max-width:680px;">
      <div style="margin-bottom:24px;"><h1 style="font-size:20px;font-weight:500;color:#0f172a;">Service Risk</h1></div>
      <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:10px;padding:14px 16px;font-size:12px;color:#92400e;">
        Complete <strong>Designated Services</strong> first — your service risk rating is derived from your confirmed Table 6 services.
        <button onclick="go('risk')" style="margin-left:8px;font-size:12px;color:#92400e;font-weight:500;background:none;border:none;cursor:pointer;text-decoration:underline;">Go there →</button>
      </div>
    </div>`;
  }

  const matched = sc.classifierMatched || [];
  const autoRating = deriveServiceRisk(matched);

  return `<div style="max-width:680px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Service Risk</h1>
      <p style="font-size:13px;color:#64748b;">The services you provide determine your firm's inherent exposure to ML/TF risk under AUSTRAC's framework.</p>
    </div>
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Your services and their risk classification</span>
        ${infoBtn('sr-tip')}
      </div>
      ${infoPop('sr-tip', `
        <strong class="text-indigo-300 block mb-2">How AUSTRAC classifies service risk</strong>
        <p>AUSTRAC groups designated services into risk tiers based on how directly they could be used to move, hide, or legitimise illicit funds:</p>
        <ul class="mt-2 space-y-1.5">
          <li>· <strong class="text-white">High — Items 2, 3, 4, 5</strong><br>Direct control or movement of client funds, business transactions, or property. These services place money directly in your hands or facilitate major asset transfers.</li>
          <li>· <strong class="text-white">Medium — Items 6, 7, 8, 9</strong><br>Creating or managing legal structures, governance roles, registered office services. These don't move funds directly but create entities that can be misused.</li>
          <li>· <strong class="text-white">Low</strong><br>No designated services with direct financial or structural exposure.</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">This rating is calculated automatically from your confirmed designated services. You can override it only if your professional judgement differs — a written justification is required for audit purposes.</p>
      `)}

      <div style="border:0.5px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
              <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Task / Service</th>
              <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;width:180px;text-transform:uppercase;letter-spacing:.06em;">Table 6 Item</th>
            </tr>
          </thead>
          <tbody>
            ${matched.map(r => `
            <tr style="border-bottom:0.5px solid #f1f5f9;">
              <td style="padding:10px 14px;font-size:12px;color:#0f172a;">${r.task}</td>
              <td style="padding:10px 14px;font-size:11px;color:#64748b;">${r.table6 || '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom:14px;">
        ${ratingRow('Service Risk Rating', autoRating, sc.serviceRatingOverride, 'serviceRatingOverride', 'serviceRatingJust', sc.serviceRatingJust)}
      </div>

      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#64748b;line-height:1.6;margin-bottom:14px;">
        <span style="font-weight:500;color:#0f172a;">Why this rating: </span>
        ${autoRating === 'High'
          ? 'One or more of your services involve direct control or movement of client funds, execution of business transactions, or property settlements — all considered high inherent ML/TF risk by AUSTRAC because they create direct opportunities for placement, layering, or integration of illicit funds.'
          : autoRating === 'Medium'
          ? 'Your services involve creating or managing legal structures, company secretarial functions, or registered office services. These do not directly control client funds but create entities and roles that can be misused to conceal beneficial ownership or facilitate illicit activity.'
          : 'Your designated services do not involve direct financial control or structural creation. Inherent service risk is low, though other risk lenses (customer and geography) may still elevate your overall rating.'}
      </div>

      <button onclick="saveServiceRisk()" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;">Save &amp; Continue to Customer Risk →</button>
    </div>
  </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.saveServiceRisk = function() {
  const matched = S.scope.classifierMatched || [];
  S.scope.serviceRating = S.scope.serviceRatingOverride || deriveServiceRisk(matched);
  save();
  toast('Service risk saved');
  go('customerrisk');
};
