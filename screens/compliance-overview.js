import { S } from '../state/index.js';

export function screen() {
  const now = new Date();
  const days = (d) => d ? Math.ceil((new Date(d) - now) / (1000 * 60 * 60 * 24)) : null;

  const riskDone    = !!(S.scope.overallRating || S.scope.noneConfirmed);
  const programDone = !!(S.program.approvedBy);

  const riskReview  = days(S.scope.nextReview);
  const progReview  = days(S.program.nextReview);
  const riskOverdue = riskReview !== null && riskReview < 0;
  const progOverdue = progReview !== null && progReview < 0;

  const total = 2;
  const done  = [riskDone, programDone].filter(Boolean).length;

  const statusBadge = (ok, warn, label) => {
    const cls = ok ? 'bg-green-100 text-green-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    const icon = ok ? '✓' : warn ? '⚠' : '✗';
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}">${icon} ${label}</span>`;
  };

  const row = (label, isDone, isWarn, detail, screen) => `
    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition" onclick="go('${screen}')">
      <td class="px-4 py-3 text-sm text-slate-700">${label}</td>
      <td class="px-4 py-3">${statusBadge(isDone && !isWarn, isWarn, detail)}</td>
      <td class="px-4 py-3 text-right text-xs text-slate-300">→</td>
    </tr>`;

  return `
    <div class="p-8 max-w-3xl mx-auto space-y-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold">Compliance</h1>
          <p class="text-slate-400 text-sm mt-1">Your AML/CTF risk assessment and program approval.</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-black ${done === total ? 'text-green-600' : done > 0 ? 'text-amber-500' : 'text-red-500'}">${done}/${total}</div>
          <div class="text-xs text-slate-400">sections complete</div>
        </div>
      </div>

      <!-- PROGRESS BAR -->
      <div class="bg-white border rounded-xl p-4">
        <div class="flex justify-between text-xs text-slate-500 mb-2"><span>Overall completion</span><span>${Math.round((done/total)*100)}%</span></div>
        <div class="w-full bg-slate-100 h-2 rounded-full">
          <div class="h-2 rounded-full transition-all ${done === total ? 'bg-green-500' : 'bg-indigo-500'}" style="width:${Math.round((done/total)*100)}%"></div>
        </div>
      </div>

      <!-- SECTION STATUS TABLE -->
      <div class="bg-white border rounded-xl overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase tracking-wide">Section Status</div>
        <table class="w-full text-sm border-collapse">
          <tbody>
            ${row('AML/CTF Risk Assessment', riskDone && !riskOverdue, riskOverdue, 
              !riskDone ? 'Not completed' : riskOverdue ? `Review overdue ${Math.abs(riskReview)}d` : riskReview !== null && riskReview <= 30 ? `Review due in ${riskReview}d` : 'Complete', 'risk')}
            ${row('AML/CTF Program', programDone && !progOverdue, progOverdue,
              !programDone ? 'Not approved' : progOverdue ? `Review overdue ${Math.abs(progReview)}d` : progReview !== null && progReview <= 30 ? `Review due in ${progReview}d` : 'Complete', 'program')}
          </tbody>
        </table>
      </div>

      ${S.program.approvedBy ? `
      <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-700">
        <strong>Program approved</strong> by ${S.program.approvedBy}${S.program.approvedDate ? ' on ' + S.program.approvedDate : ''}${S.program.version ? ' · ' + S.program.version : ''}
        ${S.program.nextReview ? `· Next review: <strong>${S.program.nextReview}</strong>` : ''}
      </div>` : `
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Action required:</strong> Your AML/CTF program must be approved by a senior manager before 1 July 2026.
        <button onclick="go('program')" class="ml-2 underline font-semibold">Go to Program →</button>
      </div>`}
    </div>`;
}
