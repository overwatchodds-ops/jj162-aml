import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  const f = S.firm;
  const appt = f.appt || {};
  const requiredRoles = ['amlco','reporting','senior','principal2'];
  const isComplete = requiredRoles.every(k => appt[k]?.name && appt[k]?.date);
  const badge = isComplete
    ? '<span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">✓ Complete</span>'
    : '<span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-500">⚠ Incomplete</span>';

  return `
    <div class="py-8 space-y-8">

      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Appointments</h1>
          <p class="text-sm text-slate-400 mt-1">AUSTRAC requires your firm to appoint named individuals responsible for AML/CTF governance before other compliance obligations can be met.</p>
        </div>
        ${badge}
      </div>

      <!-- AUTO-FILL -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-slate-700">Responsible Persons</h2>
          ${infoBtn('firm-appt-tip')}
        </div>
        ${infoPop('firm-appt-tip', `<strong class="text-indigo-300 block mb-2">Why compliance appointments must be recorded</strong>
          <p>AUSTRAC requires every reporting entity to formally designate who holds each compliance role. These appointments establish <strong class="text-white">personal accountability</strong>.</p>
          <ul class="mt-2 space-y-1 pl-1">
            <li>· <strong class="text-white">AMLCO</strong> — your primary regulatory contact</li>
            <li>· <strong class="text-white">Reporting Officer</strong> — responsible for filing SMRs and TTRs</li>
            <li>· <strong class="text-white">Senior Manager</strong> — must approve the AML/CTF Program</li>
            <li>· <strong class="text-white">Principal / Managing Partner</strong> — carries ultimate firm-level accountability</li>
          </ul>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Even if one person holds every role, each must be formally recorded.</p>`)}

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-3">Sole practitioner? Enter your name once and auto-fill all roles.</p>
          <div class="flex items-center gap-2">
            <input id="sole-name" type="text" class="inp flex-1 text-sm" placeholder="Your full legal name">
            <button onclick="fillAllRoles()" class="text-xs bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition whitespace-nowrap">Auto-fill all roles →</button>
          </div>
        </div>

        <div class="space-y-3">
          ${[
            ['amlco',     'AML/CTF Compliance Officer (AMLCO)', 'Primary regulatory liaison. Must be appointed before enrolment.', true],
            ['reporting', 'Reporting Officer',                  'Responsible for filing SMRs and TTRs with AUSTRAC.', true],
            ['senior',    'Senior Manager',                     'Approves the AML/CTF Program.', true],
            ['principal2','Principal / Managing Partner',       'Overall firm leadership accountability.', true],
            ['delegate',  'Delegate (optional)',                'For larger firms where compliance tasks are formally delegated.', false],
          ].map(([key, title, desc, required]) => `
            <div class="border border-slate-200 rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-slate-700">${title}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${desc}</div>
                </div>
                ${required ? '<span class="text-xs text-red-400 font-semibold flex-shrink-0">Required</span>' : ''}
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="text-xs text-slate-500">Full name${required?' *':''}</label><input id="appt-${key}-name" type="text" class="inp mt-1" value="${appt[key]?.name||''}"></div>
                <div><label class="text-xs text-slate-500">Date appointed${required?' *':''}</label><input id="appt-${key}-date" type="date" class="inp mt-1" value="${appt[key]?.date||''}"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-bold text-slate-700">Next review date</label>
          <span class="text-xs text-slate-400">AUSTRAC expects annual review of responsible persons</span>
        </div>
        <input id="appt-next-review" type="date" class="inp" value="${f.appt?.nextReview||''}">
        <p class="text-xs text-slate-400">Auto-set to +12 months when saved. Override if an earlier review is required.</p>
      </div>

      <button onclick="saveAppointments()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Save Appointments</button>

    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.fillAllRoles = function() {
  const name = document.getElementById('sole-name')?.value?.trim();
  if (!name) { toast('Enter your name first', 'err'); return; }
  ['amlco','reporting','senior','principal2','delegate'].forEach(k => {
    const el = document.getElementById(`appt-${k}-name`);
    if (el) el.value = name;
  });
};

window.saveAppointments = function() {
  // Validate required roles — name and date both required
  const requiredRoles = [
    ['amlco',     'AML/CTF Compliance Officer'],
    ['reporting', 'Reporting Officer'],
    ['senior',    'Senior Manager'],
    ['principal2','Principal / Managing Partner'],
  ];
  for (const [key, label] of requiredRoles) {
    const name = document.getElementById(`appt-${key}-name`)?.value?.trim();
    const date = document.getElementById(`appt-${key}-date`)?.value?.trim();
    if (!name && !date) { toast(`${label}: name and date are required`, 'err'); return; }
    if (!name) { toast(`${label}: name is required`, 'err'); return; }
    if (!date) { toast(`${label}: date appointed is required`, 'err'); return; }
  }

  if (!S.firm) S.firm = {};
  if (!S.firm.appt) S.firm.appt = {};
  ['amlco','reporting','senior','principal2','delegate'].forEach(k => {
    S.firm.appt[k] = {
      name: document.getElementById(`appt-${k}-name`)?.value||'',
      date: document.getElementById(`appt-${k}-date`)?.value||''
    };
  });
  // Save review date — auto-set to +12 months if not already set
  const reviewEl = document.getElementById('appt-next-review');
  if (reviewEl?.value) {
    S.firm.appt.nextReview = reviewEl.value;
  } else {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    S.firm.appt.nextReview = d.toISOString().split('T')[0];
  }
  S.firm.appt.savedDate = new Date().toISOString().split('T')[0];
  save(); toast('Appointments saved');
};
