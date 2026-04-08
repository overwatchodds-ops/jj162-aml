import { S } from '../state/index.js';
import { dashboardState } from '../logic/index.js';

export function screen() {
  const firmName = S.firm.name;

  if (!firmName) return `
    <div class="p-10 max-w-2xl">
      <h1 class="text-2xl font-bold mb-2">Welcome to SimpleAML</h1>
      <p class="text-slate-500 mb-6">AML/CTF compliance for Australian accounting firms.</p>
      <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-sm text-amber-800">
        <strong>Deadline: 1 July 2026</strong> — Your AML/CTF program must be in place before you provide designated services under the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.
      </div>
      <button onclick="go('firm')" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Set up my firm →</button>
    </div>`;

  const {
    firmDone, riskDone, riskReview, riskOverdue, riskDueSoon,
    programDone, progReview, progOverdue, progDueSoon, enrolDone,
    activeStaff, staffDone, trainingOverdue, trainingDueSoon, trainingDone, declOverdue,
    activeClients, cddComplete, dormantClients, newClients, ongoingClients,
    allInds, screenedInds, clientsCddDone,
    openInc, closedInc,
    attention, hasUrgent, hasWarning,
    statusLabel, statusBg, statusText, statusDot,
  } = dashboardState();

  const statusRow = (label, done, warn, detail, screen) => {
    const cls   = done ? 'text-green-600' : warn ? 'text-amber-600' : 'text-red-600';
    const icon  = done ? '✓' : warn ? '⚠' : '✗';
    const badge = done ? 'bg-green-100 text-green-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    return `
    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition" onclick="go('${screen}')">
      <td class="px-4 py-2.5 text-sm text-slate-700">${label}</td>
      <td class="px-4 py-2.5">
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${badge}">
          <span>${icon}</span>${detail || (done ? 'Complete' : warn ? 'Review due' : 'Incomplete')}
        </span>
      </td>
      <td class="px-4 py-2.5 text-right text-xs text-slate-300">→</td>
    </tr>`;
  };

  return `
    <div class="p-8 max-w-3xl mx-auto space-y-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold">${firmName}</h1>
          <p class="text-slate-400 text-sm mt-0.5">${S.firm.type||''} · ABN ${S.firm.abn||'—'}</p>
        </div>
        <div class="flex items-center gap-2 border rounded-xl px-4 py-2.5 ${statusBg}">
          <div class="w-2.5 h-2.5 rounded-full ${statusDot}"></div>
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">AML/CTF Status</div>
            <div class="text-base font-bold ${statusText}">${statusLabel}</div>
          </div>
        </div>
      </div>

      ${!S.program.approvedBy ? `
      <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-indigo-800 mb-0.5">New to AML/CTF?</div>
          <div class="text-xs text-indigo-700">Complete the first 3 items in the sidebar — Firm Details, Risk Assessment, and AML/CTF Program — to be ready for 1 July 2026.</div>
        </div>
        <button onclick="go('firm')" class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 transition whitespace-nowrap flex-shrink-0">Start here →</button>
      </div>` : ''}

      <div class="bg-white border rounded-xl overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">Compliance Status</div>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left text-xs font-semibold text-slate-400 px-4 py-2 uppercase tracking-wide">Area</th>
              <th class="text-left text-xs font-semibold text-slate-400 px-4 py-2 uppercase tracking-wide">Status</th>
              <th class="px-4 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            ${statusRow('Firm Profile', firmDone, false, null, 'firm')}
            ${statusRow('AML/CTF Risk Assessment', riskDone && !riskOverdue, riskDueSoon, riskOverdue ? `Overdue ${Math.abs(riskReview)}d` : riskDueSoon ? `Due in ${riskReview}d` : null, 'risk')}
            ${statusRow('AML/CTF Program', programDone && !progOverdue, progDueSoon, progOverdue ? `Review overdue` : progDueSoon ? `Review in ${progReview}d` : null, 'program')}
            ${statusRow('AUSTRAC Enrolment', enrolDone, false, null, 'enrolment')}
            ${statusRow('Key Personnel Vetting', staffDone && declOverdue.length === 0, declOverdue.length > 0, declOverdue.length > 0 ? `${declOverdue.length} declaration${declOverdue.length>1?'s':''} overdue` : null, 'staff')}
            ${statusRow('AML/CTF Training', trainingDone, trainingDueSoon.length > 0, trainingOverdue.length > 0 ? `${trainingOverdue.length} overdue` : trainingDueSoon.length > 0 ? `${trainingDueSoon.length} due soon` : null, 'training')}
            ${statusRow('Client CDD', clientsCddDone, false, activeClients.length > 0 ? cddComplete+' / '+activeClients.length+' complete' : 'No clients', 'clients')}
            ${statusRow('SMR Register', true, openInc > 0, openInc > 0 ? openInc+' open' : S.incidents.length > 0 ? S.incidents.length+' recorded' : 'No incidents', 'incidents')}
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('clients')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Clients</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Total (≤7 yrs)</span><span class="font-semibold text-slate-700">${activeClients.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">New (12 months)</span><span class="font-semibold text-slate-700">${newClients.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Ongoing</span><span class="font-semibold text-slate-700">${ongoingClients.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Dormant</span><span class="font-semibold ${dormantClients.length > 0 ? 'text-amber-600' : 'text-slate-700'}">${dormantClients.length}</span></div>
            <div class="flex justify-between border-t border-slate-50 pt-1.5 mt-1.5"><span class="text-slate-500">Individuals screened</span><span class="font-semibold text-slate-700">${screenedInds} / ${allInds.length}</span></div>
          </div>
        </div>
        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('staff')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Staff</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Key personnel</span><span class="font-semibold text-slate-700">${activeStaff.filter(st=>st.classification==='Key Personnel').length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">AML functions</span><span class="font-semibold text-slate-700">${activeStaff.filter(st=>st.classification==='Key Personnel'||st.classification==='Standard AML/CTF Staff').length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Total assessed</span><span class="font-semibold text-slate-700">${activeStaff.length}</span></div>
            <div class="flex justify-between border-t border-slate-50 pt-1.5 mt-1.5"><span class="text-slate-500">Training current</span><span class="font-semibold ${trainingOverdue.length > 0 ? 'text-red-600' : 'text-slate-700'}">${S.training.length - trainingOverdue.length} / ${S.training.length}</span></div>
          </div>
        </div>
        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('incidents')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Incidents</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Total recorded</span><span class="font-semibold text-slate-700">${S.incidents.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Open</span><span class="font-semibold ${openInc > 0 ? 'text-amber-600' : 'text-slate-700'}">${openInc}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Closed</span><span class="font-semibold text-slate-700">${closedInc}</span></div>
          </div>
        </div>
      </div>

      ${attention.length > 0 ? `
      <div class="bg-white border rounded-xl overflow-hidden">
        <div class="px-4 py-2.5 ${hasUrgent ? 'bg-red-50 border-b border-red-100' : 'bg-amber-50 border-b border-amber-100'} text-xs font-semibold ${hasUrgent ? 'text-red-600' : 'text-amber-600'} uppercase tracking-wide">
          Attention Required — ${attention.length} item${attention.length>1?'s':''}
        </div>
        <div class="divide-y divide-slate-50">
          ${attention.map(a => `
          <div class="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition" onclick="go('${a.screen}')">
            <div class="flex items-center gap-2 text-sm">
              <span class="${a.urgent ? 'text-red-500' : 'text-amber-500'} font-bold text-base leading-none">${a.urgent ? '✗' : '⚠'}</span>
              <span class="text-slate-700">${a.text}</span>
            </div>
            <span class="text-xs text-slate-300 flex-shrink-0">→</span>
          </div>`).join('')}
        </div>
      </div>` : `
      <div class="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2">
        <span>✓</span> No attention items — your AML/CTF position is current.
      </div>`}

      <div class="flex items-center justify-between px-4 py-3 bg-white border rounded-xl">
        <div>
          <div class="text-sm font-semibold text-slate-700">AML/CTF Compliance Report</div>
          <div class="text-xs text-slate-400 mt-0.5">Generate a summary of your compliance position to assist with AUSTRAC reporting.</div>
        </div>
        <button onclick="go('report')" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 whitespace-nowrap ml-4">Generate →</button>
      </div>
    </div>`;
}

// No action functions — dashboard is read-only
