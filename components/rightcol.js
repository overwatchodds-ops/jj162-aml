import { S } from '../state/index.js';

// ─── REGULATORY UPDATES ───────────────────────────────────────────────────────
// Update this list when AUSTRAC releases new guidance.
// Each entry: { date, title, body, urgent }
const REGULATORY_UPDATES = [
  {
    date: 'March 2026',
    title: 'New AUSTRAC Rules — Tranche 2 Final Regulations',
    body: 'AUSTRAC released the final AML/CTF Rules for Tranche 2 reporting entities on 31 March 2026. SimpleAML is being updated to reflect the new Proliferation Financing (PF) and Financial Year reporting requirements.',
    urgent: true,
  },
  {
    date: 'February 2026',
    title: 'AUSTRAC Starter Kit Updated',
    body: 'AUSTRAC has released an updated Accounting Program Starter Kit. If you completed your program before February 2026, review the updated kit to ensure your program remains aligned.',
    urgent: false,
  },
  {
    date: 'January 2026',
    title: 'Enrolment Deadline Reminder',
    body: 'All reporting entities must be enrolled with AUSTRAC before providing designated services from 1 July 2026. Early enrolment is recommended.',
    urgent: false,
  },
];

// ─── RIGHT COLUMN ─────────────────────────────────────────────────────────────
export function RightCol() {
  const f = S.firm;
  const firmName = f.name || 'My Firm';
  const amlco = f.appt?.amlco?.name || '—';
  const abn = f.abn || '—';

  return `
    <div class="w-64 flex-shrink-0 fixed top-0 right-0 bottom-0 flex flex-col z-40 bg-slate-50 border-l border-slate-200">

      <!-- FIRM HEADER — flush with top nav height -->
      <button onclick="go('firm')" class="h-12 flex items-center gap-2.5 px-4 border-b border-slate-200 hover:bg-slate-100 transition text-left flex-shrink-0 bg-white">
        <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span class="text-indigo-700 font-bold text-xs">${firmName.charAt(0).toUpperCase()}</span>
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-semibold text-slate-800 truncate">${firmName}</div>
          <div class="text-[10px] text-slate-400">Firm Profile →</div>
        </div>
      </button>

      <!-- SCROLLABLE CONTENT -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">

        <!-- FIRM DETAILS -->
        <div class="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
          <div class="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Firm Details</div>
          <div class="space-y-1.5">
            <div class="flex justify-between gap-2">
              <span class="text-slate-400">ABN</span>
              <span class="font-medium text-slate-700 text-right">${abn}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-slate-400">AMLCO</span>
              <span class="font-medium text-slate-700 text-right truncate max-w-[120px]">${amlco}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-slate-400">Obligations from</span>
              <span class="font-medium text-slate-700">1 Jul 2026</span>
            </div>
          </div>
        </div>

        <!-- REGULATORY UPDATES -->
        <div class="space-y-2">
          <div class="font-semibold text-slate-500 uppercase tracking-wide text-[10px] px-1">Regulatory Updates</div>
          ${REGULATORY_UPDATES.map(u => `
          <div class="bg-white border ${u.urgent ? 'border-amber-200' : 'border-slate-200'} rounded-xl p-3 space-y-1.5">
            <div class="flex items-start justify-between gap-2">
              <div class="text-[10px] text-slate-400">${u.date}</div>
              ${u.urgent ? '<span class="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">Update</span>' : ''}
            </div>
            <div class="text-xs font-semibold text-slate-700 leading-snug">${u.title}</div>
            <div class="text-[11px] text-slate-500 leading-relaxed">${u.body}</div>
          </div>`).join('')}
        </div>

      </div>
    </div>`;
}
