import { S } from '../state/index.js';

export function screen() {
  const f = S.firm;
  const firmDone = Object.keys(f).length > 2 && !!(f.name && f.abn);
  

  const statusBadge = (ok, label) => {
    const cls = ok ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500';
    const icon = ok ? '✓' : '⚠';
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}">${icon} ${label}</span>`;
  };

  const row = (label, done, detail, screen) => `
    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition" onclick="go('${screen}')">
      <td class="px-4 py-3 text-sm text-slate-700">${label}</td>
      <td class="px-4 py-3">${statusBadge(done, detail)}</td>
      <td class="px-4 py-3 text-right text-xs text-slate-300">→</td>
    </tr>`;

  return `
    <div class="py-8 space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Firm</h1>
        <p class="text-sm text-slate-400 mt-1">Your practice identity and compliance appointments.</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
        <table class="w-full text-sm border-collapse">
          <tbody>
            ${row('Firm Details', firmDone, firmDone ? 'Complete' : 'Incomplete', 'firm-details')}
${row('Appointments', !!f.appt?.amlco?.name, f.appt?.amlco?.name ? 'Complete' : 'Incomplete', 'firm-appointments')}
          </tbody>
        </table>
      </div>

      ${firmDone ? `
      <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 class="text-sm font-bold text-slate-700">Firm Details</h2>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div><span class="text-slate-400">Firm name</span><div class="font-medium text-slate-700 mt-0.5">${f.name}</div></div>
          <div><span class="text-slate-400">ABN</span><div class="font-medium text-slate-700 mt-0.5">${f.abn || '—'}</div></div>
          <div><span class="text-slate-400">Practice type</span><div class="font-medium text-slate-700 mt-0.5">${f.type || '—'}</div></div>
          <div><span class="text-slate-400">Principal contact</span><div class="font-medium text-slate-700 mt-0.5">${f.principal || '—'}</div></div>
          ${f.appt?.amlco?.name ? `<div><span class="text-slate-400">AMLCO</span><div class="font-medium text-slate-700 mt-0.5">${f.appt.amlco.name}</div></div>` : ''}
        </div>
        <button onclick="go('firm')" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">Edit Firm Profile →</button>
      </div>` : `
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-500">
        Firm Details not yet completed. <button onclick="go('firm')" class="text-indigo-600 font-semibold hover:text-indigo-800">Set up your firm →</button>
      </div>`}
    </div>`;
}
