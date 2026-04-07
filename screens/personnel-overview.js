import { S } from '../state/index.js';

export function screen() {
  const now = new Date();
  const active = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const keyPersonnel = active.filter(st => st.classification === 'Key Personnel');
  const stdStaff = active.filter(st => st.classification === 'Standard AML/CTF Staff');
  const declOverdue = active.filter(st =>
    (st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff') &&
    st.declNext && new Date(st.declNext) < now
  );
  const trainingOverdue = S.training.filter(t => t.next && new Date(t.next) < now);
  const trainingDueSoon = S.training.filter(t => {
    if (!t.next) return false;
    const d = new Date(t.next);
    return d >= now && d <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  });

  const statusBadge = (ok, warn, label) => {
    const cls = ok ? 'bg-green-100 text-green-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    const icon = ok ? '✓' : warn ? '⚠' : '✗';
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}">${icon} ${label}</span>`;
  };

  return `
    <div class="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Personnel</h1>
        <p class="text-slate-400 text-sm mt-1">Staff vetting, fit and proper assessments, and AML/CTF training records.</p>
      </div>

      <!-- STATUS CARDS -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('staff')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Staff Vetting</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Key Personnel</span><span class="font-semibold text-slate-700">${keyPersonnel.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Standard AML staff</span><span class="font-semibold text-slate-700">${stdStaff.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Total assessed</span><span class="font-semibold text-slate-700">${active.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Declarations overdue</span><span class="font-semibold ${declOverdue.length > 0 ? 'text-red-600' : 'text-slate-700'}">${declOverdue.length}</span></div>
          </div>
          <div class="mt-3">${statusBadge(
            active.length > 0 && declOverdue.length === 0,
            declOverdue.length > 0,
            active.length === 0 ? 'No staff records' : declOverdue.length > 0 ? `${declOverdue.length} overdue` : 'All current'
          )}</div>
        </div>

        <div class="bg-white border rounded-xl p-4 cursor-pointer hover:border-indigo-200 transition" onclick="go('training')">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Training Register</div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Total records</span><span class="font-semibold text-slate-700">${S.training.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Overdue</span><span class="font-semibold ${trainingOverdue.length > 0 ? 'text-red-600' : 'text-slate-700'}">${trainingOverdue.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Due within 30 days</span><span class="font-semibold ${trainingDueSoon.length > 0 ? 'text-amber-600' : 'text-slate-700'}">${trainingDueSoon.length}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Current</span><span class="font-semibold text-slate-700">${S.training.length - trainingOverdue.length} / ${S.training.length}</span></div>
          </div>
          <div class="mt-3">${statusBadge(
            S.training.length > 0 && trainingOverdue.length === 0,
            trainingDueSoon.length > 0,
            S.training.length === 0 ? 'No training records' : trainingOverdue.length > 0 ? `${trainingOverdue.length} overdue` : 'All current'
          )}</div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick actions</h2>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="startAddStaff()" class="flex items-center gap-3 p-3 border rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
            <span class="text-lg">＋</span>
            <div><div class="text-sm font-semibold text-slate-700">Add Staff Member</div><div class="text-xs text-slate-400">Record vetting and AML/CTF functions</div></div>
          </button>
          <button onclick="startAddTraining()" class="flex items-center gap-3 p-3 border rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
            <span class="text-lg">＋</span>
            <div><div class="text-sm font-semibold text-slate-700">Add Training Record</div><div class="text-xs text-slate-400">Log completed AML/CTF training</div></div>
          </button>
        </div>
      </div>
    </div>`;
}
