import { S, save } from '../state/index.js';
import { toast } from '../components/index.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cddStatus(c) {
  const inds = c.individuals || [];
  if (!inds.length) return 'Incomplete';
  if (inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult)) return 'Complete';
  return 'Incomplete';
}

function reviewStatus(c) {
  // Returns: 'not-set' | 'current' | 'overdue'
  if (cddStatus(c) !== 'Complete') return 'not-set'; // incomplete CDD — separate flag
  if (!c.nextReviewDate) return 'not-set';
  return new Date(c.nextReviewDate) < new Date() ? 'overdue' : 'current';
}

function isOverdue(c) {
  return reviewStatus(c) === 'overdue';
}

function openSmrs(c) {
  return S.incidents.filter(i =>
    (i.clientId && c.id && i.clientId === c.id) ||
    (i.clientName === c.name)
  ).filter(i => !i.status || i.status === 'Open');
}

export function screen() {
  const clients = S.clients || [];
  const rows = clients.map((c, i) => {
    const status = cddStatus(c);
    const overdue = isOverdue(c);
    const smrs = openSmrs(c);
    const hasOpenSmr = smrs.length > 0;
    const riskCol = c.risk === 'High' ? '#dc2626' : c.risk === 'Medium' ? '#d97706' : '#16a34a';
    const purpose = c.purpose ? (c.purpose.length > 45 ? c.purpose.slice(0, 45) + '…' : c.purpose) : '—';

    // CDD Status badge
    const statusBadge = status === 'Complete'
      ? '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Complete</span>'
      : '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">Incomplete</span>';

    // Overdue badge
    const rev = reviewStatus(c);
    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '';
    const overdueBadge = status !== 'Complete'
      ? '<span style="font-size:11px;color:#cbd5e1;">—</span>'
      : rev === 'overdue'
        ? `<span style="font-size:11px;font-weight:500;color:#d97706;">⚠ ${fmtDate(c.nextReviewDate)}</span>`
        : rev === 'current'
          ? `<span style="font-size:11px;color:#64748b;">${fmtDate(c.nextReviewDate)}</span>`
          : '<span style="font-size:11px;color:#94a3b8;font-style:italic;">Not set</span>';

    // SMR action button
    const smrBtn = hasOpenSmr
      ? `<button onclick="go('incidents')" style="font-size:11px;font-weight:500;color:#dc2626;background:none;border:none;cursor:pointer;white-space:nowrap;">⚠ ${smrs.length} SMR</button>`
      : `<button onclick="startSmrForClient(${c.id})" style="font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer;white-space:nowrap;">+ SMR</button>`;

    return `
    <tr style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onclick="editClient(${i})" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <td style="padding:10px 14px;">
        <div style="font-size:12px;font-weight:500;color:#0f172a;">${c.name}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${c.entityType || '—'}</div>
      </td>
      <td style="padding:10px 14px;font-size:11px;font-weight:500;color:${riskCol};">${c.risk || 'Low'}</td>
      <td style="padding:10px 14px;font-size:11px;color:#64748b;">${purpose}</td>
      <td style="padding:10px 14px;">${statusBadge}</td>
      <td style="padding:10px 14px;">${overdueBadge}</td>
      <td style="padding:10px 14px;text-align:right;white-space:nowrap;" onclick="event.stopPropagation()">
        ${smrBtn}
        <button onclick="editClient(${i})" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:500;margin-left:10px;">Edit</button>
      </td>
    </tr>`;
  }).join('');

  return `<div style="max-width:900px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Client Register</h1>
        <p style="font-size:13px;color:#64748b;">${clients.length} client${clients.length !== 1 ? 's' : ''} on register</p>
      </div>
      <button onclick="go('newclient')" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:16px;flex-shrink:0;">+ New client</button>
    </div>

    ${clients.length > 0 ? `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Client</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Risk</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Purpose</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">CDD status</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Next review</th>
            <th style="width:90px;"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Click any row to open the client record. Review date auto-suggested based on risk (High: 12mo, Medium: 24mo, Low: 36mo).</p>` : `

    <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">No clients yet.</div>
      <div style="font-size:11px;color:#cbd5e1;margin-bottom:16px;">Click "+ New client" to add your first client record.</div>
      <button onclick="go('newclient')" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;">+ New client</button>
    </div>`}

  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.editClient = function(i) {
  const c = S.clients[i]; if (!c) return;
  S._clientDraft = JSON.parse(JSON.stringify(c));
  // Ensure open panels state is set for editing
  S._clientDraft._openPanels = { a: true, b: false, c: false, dec: false };
  S._clientEditIdx = i;
  go('newclient');
};
