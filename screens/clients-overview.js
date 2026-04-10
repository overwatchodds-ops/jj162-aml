import { S } from '../state/index.js';

// ─── HELPERS (duplicated from clients.js — kept local to avoid import chain) ──
function cddStatus(c) {
  const inds = c.individuals || [];
  if (!inds.length) return 'Incomplete';
  if (inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult)) return 'Complete';
  return 'Incomplete';
}

function isOverdue(c) {
  if (cddStatus(c) !== 'Complete') return false;
  if (!c.nextReviewDate) return false; // not set — not counted as overdue
  return new Date(c.nextReviewDate) < new Date();
}

export function screen() {
  const clients = S.clients || [];
  const incidents = S.incidents || [];

  const incomplete = clients.filter(c => cddStatus(c) !== 'Complete').length;
  const overdue    = clients.filter(c => isOverdue(c)).length;
  const openSmrs   = incidents.filter(i => !i.status || i.status === 'Open').length;

  const allOk = incomplete === 0 && overdue === 0 && openSmrs === 0;

  const card = (title, count, desc, screen, urgent) => `
  <div class="bg-white border ${urgent && count > 0 ? 'border-amber-200' : 'border-slate-200'} rounded-xl p-5 space-y-3 cursor-pointer hover:border-indigo-200 transition" onclick="go('${screen}')">
    <h2 class="text-sm font-bold text-slate-700">${title}</h2>
    <div class="flex items-end gap-2">
      <span class="text-3xl font-black ${urgent && count > 0 ? 'text-amber-600' : count === 0 ? 'text-green-600' : 'text-slate-800'}">${count}</span>
      <span class="text-xs text-slate-400 mb-1">${count === 1 ? desc.singular : desc.plural}</span>
    </div>
    <div class="text-xs ${urgent && count > 0 ? 'text-amber-600' : 'text-slate-400'}">${count > 0 ? desc.action : desc.clear}</div>
  </div>`;

  return `<div class="py-8 space-y-6">

    <div>
      <h1 class="text-2xl font-bold text-slate-900">Clients</h1>
      <p class="text-sm text-slate-400 mt-1">Customer due diligence, ongoing screening, and suspicious matter reporting.</p>
    </div>

    ${allOk && clients.length > 0 ? `
    <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 font-medium">
      ✓ All ${clients.length} client${clients.length !== 1 ? 's' : ''} have complete and current CDD. No open SMRs.
    </div>` : ''}

    <div class="grid grid-cols-3 gap-4">

      ${card(
        'Incomplete CDD',
        incomplete,
        { singular: 'client', plural: 'clients', action: 'CDD must be completed before providing a designated service.', clear: 'All clients have complete CDD.' },
        'clients',
        true
      )}

      ${card(
        'Screening Overdue',
        overdue,
        { singular: 'client', plural: 'clients', action: 'Re-screening required based on client risk rating.', clear: 'All screening is current.' },
        'clients',
        true
      )}

      ${card(
        'Open SMRs',
        openSmrs,
        { singular: 'open incident', plural: 'open incidents', action: 'Review open matters and update AMLCO outcome.', clear: 'No open incidents.' },
        'incidents',
        true
      )}

    </div>

    <!-- QUICK ACTIONS -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <h2 class="text-sm font-bold text-slate-700">Quick actions</h2>
      <div class="grid grid-cols-2 gap-3">
        <button onclick="go('clients')" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">👥</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">Client Register</div>
            <div class="text-xs text-slate-400">View all clients, CDD status and screening</div>
          </div>
        </button>
        <button onclick="go('newclient')" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">＋</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">New Client (CDD)</div>
            <div class="text-xs text-slate-400">Add a new client and complete due diligence</div>
          </div>
        </button>
        <button onclick="go('incidents')" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">📋</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">SMR &amp; Incident Register</div>
            <div class="text-xs text-slate-400">View and manage all suspicious matter records</div>
          </div>
        </button>
        <button onclick="startNewIncident()" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">⚠</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">New Incident / SMR</div>
            <div class="text-xs text-slate-400">Log a suspicious matter or compliance event</div>
          </div>
        </button>
      </div>
    </div>

    ${clients.length === 0 ? `
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
      <div class="text-slate-400 text-sm">No clients yet.</div>
      <div class="text-xs text-slate-400 mt-1">Add your first client to begin building your CDD register.</div>
      <button onclick="go('newclient')" class="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ New client</button>
    </div>` : ''}

  </div>`;
}
