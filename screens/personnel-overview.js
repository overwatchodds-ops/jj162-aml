import { S } from '../state/index.js';

// ─── HELPERS (local — mirrors staff.js logic) ─────────────────────────────────
function vettingStatus(st) {
  const cls = st.classification;
  if (!cls || cls === 'No AML/CTF functions') return 'assessed';
  if (cls === 'Key Personnel') {
    if (st.policeResult && st.bankruptResult && st.nsResult && st.declSigned) return 'complete';
    return 'incomplete';
  }
  if (cls === 'Standard AML/CTF Staff') {
    if (st.nsResult && st.declSigned) return 'complete';
    return 'incomplete';
  }
  return 'incomplete';
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}

export function screen() {
  const now = new Date();
  const active = S.staff.filter(st => !st.status || st.status === 'Active' || st.status === 'On Leave');
  const amlStaff = active.filter(st => st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff');

  // Three numbers
  const incomplete   = amlStaff.filter(st => vettingStatus(st) === 'incomplete').length;
  const declOverdue  = amlStaff.filter(st => st.declNext && new Date(st.declNext) < now).length;
  const trainOverdue = S.training.filter(t => t.next && new Date(t.next) < now).length;

  const allOk = incomplete === 0 && declOverdue === 0 && trainOverdue === 0 && amlStaff.length > 0;

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
      <h1 class="text-2xl font-bold text-slate-900">Personnel</h1>
      <p class="text-sm text-slate-400 mt-1">Staff vetting and AML/CTF training records for all personnel performing compliance functions.</p>
    </div>

    ${allOk ? `
    <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 font-medium">
      ✓ All ${amlStaff.length} AML staff have complete vetting and current declarations. Training is up to date.
    </div>` : ''}

    <div class="grid grid-cols-3 gap-4">

      ${card(
        'Incomplete Vetting',
        incomplete,
        { singular: 'staff member', plural: 'staff members', action: 'Vetting checks must be completed before performing AML/CTF functions.', clear: 'All vetting is complete.' },
        'staff', true
      )}

      ${card(
        'Declarations Overdue',
        declOverdue,
        { singular: 'staff member', plural: 'staff members', action: 'Annual declaration is past its due date — re-declaration required.', clear: 'All declarations are current.' },
        'staff', true
      )}

      ${card(
        'Training Overdue',
        trainOverdue,
        { singular: 'training record', plural: 'training records', action: 'AML/CTF training is past its next due date.', clear: 'All training is current.' },
        'training', true
      )}

    </div>

    <!-- QUICK ACTIONS -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <h2 class="text-sm font-bold text-slate-700">Quick actions</h2>
      <div class="grid grid-cols-2 gap-3">
        <button onclick="go('staff')" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">👤</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">Key Personnel Vetting</div>
            <div class="text-xs text-slate-400">View all staff vetting status and declarations</div>
          </div>
        </button>
        <button onclick="startAddStaff()" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">＋</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">Add Staff Member</div>
            <div class="text-xs text-slate-400">Record vetting and AML/CTF functions</div>
          </div>
        </button>
        <button onclick="go('training')" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">📚</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">Training Register</div>
            <div class="text-xs text-slate-400">View all training records and upcoming due dates</div>
          </div>
        </button>
        <button onclick="startAddTraining()" class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition text-left">
          <span class="text-lg flex-shrink-0">＋</span>
          <div>
            <div class="text-sm font-semibold text-slate-700">Add Training Record</div>
            <div class="text-xs text-slate-400">Log completed AML/CTF training</div>
          </div>
        </button>
      </div>
    </div>

    ${active.length === 0 ? `
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
      <div class="text-slate-400 text-sm">No staff records yet.</div>
      <div class="text-xs text-slate-400 mt-1">Add your first staff member to begin the vetting register.</div>
      <button onclick="startAddStaff()" class="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ Add Staff Member</button>
    </div>` : ''}

    <!-- SNAPSHOT TABLE — active AML staff only -->
    ${amlStaff.length > 0 ? `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-700">AML Staff at a glance</h2>
        <span class="text-xs text-slate-400">${amlStaff.length} active</span>
      </div>
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Name</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Classification</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Vetting</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Next Declaration</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Last Training</th>
          </tr>
        </thead>
        <tbody>
          ${amlStaff.map(st => {
            const vs = vettingStatus(st);
            const isKey = st.classification === 'Key Personnel';
            const clsBadge = isKey ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
            const vsBadge = vs === 'complete'
              ? '<span class="text-xs text-green-700 font-semibold">✓ Complete</span>'
              : '<span class="text-xs text-red-600 font-semibold">⚠ Incomplete</span>';
            const declOverdueFlag = st.declNext && new Date(st.declNext) < now;
            const declBadge = !st.declNext
              ? '<span class="text-xs text-slate-400 italic">Not set</span>'
              : declOverdueFlag
                ? `<span class="text-xs text-amber-600 font-semibold">⚠ ${fmtDate(st.declNext)}</span>`
                : `<span class="text-xs text-green-700 font-semibold">✓ ${fmtDate(st.declNext)}</span>`;
            const lastTraining = S.training.filter(t => t.name === st.name).sort((a,b) => new Date(b.date||0) - new Date(a.date||0))[0];
            const trainBadge = !lastTraining
              ? '<span class="text-xs text-slate-400 italic">No record</span>'
              : lastTraining.next && new Date(lastTraining.next) < now
                ? `<span class="text-xs text-amber-600 font-semibold">⚠ ${fmtDate(lastTraining.date)}</span>`
                : `<span class="text-xs text-slate-600">${fmtDate(lastTraining.date)}</span>`;
            return `
            <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer" onclick="go('staff')">
              <td class="px-4 py-3 font-semibold text-slate-800">${st.name}</td>
              <td class="px-4 py-3"><span class="text-xs font-semibold px-2 py-0.5 rounded-full ${clsBadge}">${st.classification}</span></td>
              <td class="px-4 py-3">${vsBadge}</td>
              <td class="px-4 py-3">${declBadge}</td>
              <td class="px-4 py-3">${trainBadge}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : ''}

  </div>`;
}
