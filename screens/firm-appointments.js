import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

export function screen() {
  const f = S.firm;
  const appt = f.appt || {};
  const hasAmlco = !!(appt.amlco?.name);
  const hasSenior = !!(appt.senior?.name);
  const isComplete = hasAmlco && hasSenior;
  const badge = isComplete
    ? '<span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">✓ Complete</span>'
    : '<span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-500">⚠ Incomplete</span>';

  return `
    <div class="py-8 space-y-8">

      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Appointments</h1>
          <p class="text-sm text-slate-400 mt-1">Responsible persons required by AUSTRAC for AML/CTF governance.</p>
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
            ['amlco',     'AML/CTF Compliance Officer (AMLCO)', 'Primary regulatory liaison. Must be appointed before enrolment.'],
            ['reporting', 'Reporting Officer',                  'Responsible for filing SMRs and TTRs with AUSTRAC.'],
            ['senior',    'Senior Manager',                     'Approves the AML/CTF Program.'],
            ['principal2','Principal / Managing Partner',       'Overall firm leadership accountability.'],
            ['delegate',  'Delegate (optional)',                'For larger firms where compliance tasks are formally delegated.'],
          ].map(([key, title, desc]) => `
            <div class="border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <div class="text-sm font-medium text-slate-700">${title}</div>
                <div class="text-xs text-slate-400 mt-0.5">${desc}</div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="text-xs text-slate-500">Full name</label><input id="appt-${key}-name" type="text" class="inp mt-1" value="${appt[key]?.name||''}"></div>
                <div><label class="text-xs text-slate-500">Date appointed</label><input id="appt-${key}-date" type="date" class="inp mt-1" value="${appt[key]?.date||''}"></div>
              </div>
            </div>`).join('')}
        </div>
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
  if (!S.firm) S.firm = {};
  if (!S.firm.appt) S.firm.appt = {};
  ['amlco','reporting','senior','principal2','delegate'].forEach(k => {
    S.firm.appt[k] = {
      name: document.getElementById(`appt-${k}-name`)?.value||'',
      date: document.getElementById(`appt-${k}-date`)?.value||''
    };
  });
  save(); toast('Appointments saved');
};
