import { S, save } from '../state/index.js';
import { toast } from '../components/index.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cddStatus(c) {
  const inds = c.individuals || [];
  if (!inds.length) return 'Incomplete';
  if (inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult)) return 'Complete';
  return 'Incomplete';
}

function lastScreenedDate(c) {
  const dates = (c.individuals || [])
    .map(i => i.screenDate ? new Date(i.screenDate) : null)
    .filter(Boolean);
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map(d => d.getTime())));
}

function isOverdue(c) {
  if (cddStatus(c) !== 'Complete') return false; // incomplete is its own flag
  const lastScreened = lastScreenedDate(c);
  if (!lastScreened) return true; // complete but no screen date — treat as overdue
  const now = new Date();
  const monthsAgo = (now - lastScreened) / (1000 * 60 * 60 * 24 * 30);
  if (c.risk === 'High')   return monthsAgo > 12;
  if (c.risk === 'Medium') return monthsAgo > 24;
  return monthsAgo > 36;
}

function openSmrs(c) {
  return S.incidents.filter(i =>
    (i.clientId && c.id && i.clientId === c.id) ||
    (i.clientName === c.name)
  ).filter(i => !i.status || i.status === 'Open');
}

export function screen() {
  const clients = S.clients || [];
  const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';

  const rows = clients.map((c, i) => {
    const status = cddStatus(c);
    const overdue = isOverdue(c);
    const smrs = openSmrs(c);
    const hasOpenSmr = smrs.length > 0;
    const riskCls = c.risk === 'High' ? 'text-red-600 font-semibold' : c.risk === 'Medium' ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold';
    const purpose = c.purpose ? (c.purpose.length > 45 ? c.purpose.slice(0, 45) + '…' : c.purpose) : '—';

    // CDD Status badge
    const statusBadge = status === 'Complete'
      ? '<span class="inline-flex items-center text-xs font-semibold text-green-700">✓ Complete</span>'
      : '<span class="inline-flex items-center text-xs font-semibold text-red-600">⚠ Incomplete</span>';

    // Overdue badge
    const overdueBadge = status !== 'Complete'
      ? '<span class="text-xs text-slate-300">—</span>'
      : overdue
        ? '<span class="inline-flex items-center text-xs font-semibold text-amber-600">⚠ Overdue</span>'
        : '<span class="inline-flex items-center text-xs font-semibold text-green-700">✓ Current</span>';

    // SMR action button
    const smrBtn = hasOpenSmr
      ? `<button onclick="go('incidents')" class="text-xs text-red-600 font-semibold hover:text-red-800 whitespace-nowrap">🔴 ${smrs.length} SMR</button>`
      : `<button onclick="startSmrForClient(${c.id})" class="text-xs text-slate-400 hover:text-indigo-600 font-semibold whitespace-nowrap">+ SMR</button>`;

    return `
    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer" onclick="editClient(${i})">
      <td class="px-4 py-3">
        <div class="font-semibold text-slate-800">${c.name}</div>
        <div class="text-xs text-slate-400 mt-0.5">${c.entityType || '—'}</div>
      </td>
      <td class="px-4 py-3 text-xs ${riskCls}">${c.risk || 'Low'}</td>
      <td class="px-4 py-3 text-xs text-slate-500">${purpose}</td>
      <td class="px-4 py-3">${statusBadge}</td>
      <td class="px-4 py-3">${overdueBadge}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap" onclick="event.stopPropagation()">
        ${smrBtn}
        <button onclick="editClient(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 ml-3">Edit</button>
      </td>
    </tr>`;
  }).join('');

  return `<div class="py-8 space-y-4">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Client Register</h1>
        <p class="text-sm text-slate-400 mt-1">${clients.length} client${clients.length !== 1 ? 's' : ''} on register</p>
      </div>
      <button onclick="go('newclient')" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex-shrink-0 ml-6">+ New client</button>
    </div>

    ${clients.length > 0 ? `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="${thCls}">Client</th>
            <th class="${thCls}">Risk</th>
            <th class="${thCls}">Purpose</th>
            <th class="${thCls}">CDD Status</th>
            <th class="${thCls}">Screening</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <p class="text-xs text-slate-400 px-1">Click any row to open the client record. Screening is overdue based on client risk — High: 12 months, Medium: 24 months, Low: 36 months.</p>` : `

    <div class="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div class="text-slate-400 text-sm">No clients yet.</div>
      <div class="text-xs text-slate-400 mt-1">Click "+ New client" to add your first client record.</div>
      <button onclick="go('newclient')" class="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ New client</button>
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
