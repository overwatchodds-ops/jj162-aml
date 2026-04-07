import { S } from '../state/index.js';

export function screen() {
  const yr = 365 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const twelveMonthsAgo = new Date(now - yr);

  const active = S.clients.filter(c => {
    const lastSvc = (c.services || []).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc > new Date(now - 7 * yr);
  });

  const cddComplete = active.filter(c => {
    const inds = c.individuals || [];
    return inds.length > 0 && inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult);
  }).length;

  const dormant = active.filter(c => {
    const lastSvc = (c.services || []).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc < twelveMonthsAgo;
  }).length;

  const newC = active.filter(c => c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo).length;
  const allInds = active.flatMap(c => c.individuals || []);
  const screened = allInds.filter(i => i.screenResult).length;
  const openInc = S.incidents.filter(i => !i.status || i.status === 'Open').length;
  const cddIncomplete = active.length - cddComplete;

  const statusBadge = (ok, warn, label) => {
    const cls = ok ? 'bg-green-100 text-green-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    const icon = ok ? '✓' : warn ? '⚠' : '✗';
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}">${icon} ${label}</span>`;
  };

  return `
    <div class="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Clients</h1>
        <p class="text-slate-400 text-sm mt-1">Customer due diligence, client register, and suspicious matter reporting.</p>
      </div>

      <!-- STATUS CARDS -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('clients')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Client Register</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Total active (≤7 yrs)</span><span class="font-semibold text-slate-700">${active.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">New (12 months)</span><span class="font-semibold text-slate-700">${newC}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Dormant</span><span class="font-semibold ${dormant > 0 ? 'text-amber-600' : 'text-slate-700'}">${dormant}</span></div>
          </div>
          <div class="mt-3">${statusBadge(active.length > 0 && cddIncomplete === 0, cddIncomplete > 0, cddIncomplete > 0 ? `${cddIncomplete} CDD incomplete` : active.length > 0 ? 'All CDD complete' : 'No clients')}</div>
        </div>

        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('clients')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">CDD Status</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">CDD complete</span><span class="font-semibold text-slate-700">${cddComplete} / ${active.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Individuals screened</span><span class="font-semibold text-slate-700">${screened} / ${allInds.length}</span></div>
          </div>
          <div class="mt-3">${statusBadge(active.length > 0 && cddComplete === active.length, cddComplete > 0 && cddComplete < active.length, cddComplete === active.length && active.length > 0 ? 'All complete' : `${cddComplete}/${active.length} complete`)}</div>
        </div>

        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('incidents')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">SMR Register</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Total recorded</span><span class="font-semibold text-slate-700">${S.incidents.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Open</span><span class="font-semibold ${openInc > 0 ? 'text-amber-600' : 'text-slate-700'}">${openInc}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Closed</span><span class="font-semibold text-slate-700">${S.incidents.filter(i => i.status === 'Closed').length}</span></div>
          </div>
          <div class="mt-3">${statusBadge(openInc === 0, false, openInc > 0 ? `${openInc} open` : 'No open incidents')}</div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick actions</h2>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="go('newclient')" class="flex items-center gap-3 p-3 border rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
            <span class="text-lg">＋</span>
            <div><div class="text-sm font-semibold text-slate-700">New Client (CDD)</div><div class="text-xs text-slate-400">Add a new client and record due diligence</div></div>
          </button>
          <button onclick="go('incidents')" class="flex items-center gap-3 p-3 border rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
            <span class="text-lg">⚠</span>
            <div><div class="text-sm font-semibold text-slate-700">New Incident / SMR</div><div class="text-xs text-slate-400">Log a suspicious matter or incident</div></div>
          </button>
        </div>
      </div>
    </div>`;
}
