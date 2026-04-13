import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

const CARD  = 'background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;';
const LABEL = 'display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;';
const GRID2 = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}

export function screen() {
  const f    = S.firm   || {};
  const appt = f.appt   || {};
  const requiredRoles  = ['amlco','reporting','senior','principal2'];
  const isComplete     = requiredRoles.every(k => appt[k]?.name && appt[k]?.date);

  const roles = [
    { key:'amlco',      title:'AML/CTF Compliance Officer (AMLCO)', desc:'Primary regulatory liaison. Must be appointed before enrolment.',    required:true },
    { key:'reporting',  title:'Reporting Officer',                   desc:'Responsible for filing SMRs and TTRs with AUSTRAC.',                required:true },
    { key:'senior',     title:'Senior Manager',                      desc:'Approves the AML/CTF Program.',                                     required:true },
    { key:'principal2', title:'Principal / Managing Partner',        desc:'Overall firm leadership accountability.',                            required:true },
    { key:'delegate',   title:'Delegate',                            desc:'For larger firms where compliance tasks are formally delegated.',    required:false },
  ];

  return `<div style="max-width:680px;">

    <!-- HEADER -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Appointments</h1>
        <p style="font-size:13px;color:#64748b;">Name the individuals responsible for AML/CTF governance before other obligations can be met.</p>
      </div>
      ${isComplete
        ? `<span style="font-size:11px;font-weight:500;padding:3px 10px;border-radius:99px;background:#f0fdf4;color:#166534;border:0.5px solid #bbf7d0;white-space:nowrap;">Complete</span>`
        : `<span style="font-size:11px;font-weight:500;padding:3px 10px;border-radius:99px;background:#f8fafc;color:#94a3b8;border:0.5px solid #e2e8f0;white-space:nowrap;">Incomplete</span>`}
    </div>

    <!-- RESPONSIBLE PERSONS -->
    <div style="${CARD}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Responsible persons</span>
        ${infoBtn('firm-appt-tip')}
      </div>
      ${infoPop('firm-appt-tip', `
        <strong class="text-indigo-300 block mb-2">Why compliance appointments must be recorded</strong>
        <p>AUSTRAC requires every reporting entity to formally designate who holds each compliance role. These appointments establish personal accountability.</p>
        <ul class="mt-2 space-y-1 pl-1">
          <li>· <strong class="text-white">AMLCO</strong> — your primary regulatory contact</li>
          <li>· <strong class="text-white">Reporting Officer</strong> — responsible for filing SMRs and TTRs</li>
          <li>· <strong class="text-white">Senior Manager</strong> — must approve the AML/CTF Program</li>
          <li>· <strong class="text-white">Principal / Managing Partner</strong> — carries ultimate firm-level accountability</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Even if one person holds every role, each must be formally recorded.</p>`)}

      <!-- SOLE PRACTITIONER AUTO-FILL -->
      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:16px;">
        <p style="font-size:11px;color:#64748b;margin-bottom:8px;">Sole practitioner? Enter your name once and auto-fill all roles.</p>
        <div style="display:flex;gap:8px;align-items:center;">
          <input id="sole-name" type="text" class="inp" style="flex:1;" placeholder="Your full legal name">
          <button onclick="fillAllRoles()" style="font-size:11px;font-weight:500;color:#fff;background:#475569;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;white-space:nowrap;">Auto-fill all →</button>
        </div>
      </div>

      <!-- ROLE ROWS -->
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${roles.map(({ key, title, desc, required }) => {
          const val = appt[key] || {};
          const filled = !!(val.name && val.date);
          return `
          <div style="border:0.5px solid ${filled ? '#e2e8f0' : required ? '#fecaca' : '#e2e8f0'};border-radius:10px;padding:14px 16px;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div>
                <div style="font-size:12px;font-weight:500;color:#0f172a;">${title}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${desc}</div>
              </div>
              ${required
                ? filled
                  ? `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;white-space:nowrap;">Done</span>`
                  : `<span style="font-size:10px;color:#dc2626;white-space:nowrap;">Required</span>`
                : `<span style="font-size:10px;color:#94a3b8;white-space:nowrap;">Optional</span>`}
            </div>
            <div style="${GRID2}">
              <div>
                <label style="${LABEL}">Full name${required?' *':''}</label>
                <input id="appt-${key}-name" type="text" class="inp" value="${val.name||''}">
              </div>
              <div>
                <label style="${LABEL}">Date appointed${required?' *':''}</label>
                <input id="appt-${key}-date" type="date" class="inp" value="${val.date||''}">
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- NEXT REVIEW -->
    <div style="${CARD}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Next review date</span>
        <span style="font-size:11px;color:#94a3b8;">AUSTRAC expects annual review</span>
      </div>
      <input id="appt-next-review" type="date" class="inp" value="${appt.nextReview||''}">
      <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Auto-set to +12 months when saved. Override if an earlier review is required.</p>
      ${appt.savedDate ? `<p style="font-size:11px;color:#94a3b8;margin-top:4px;">Last saved: ${fmtDate(appt.savedDate)}</p>` : ''}
    </div>

    <!-- SAVE -->
    <button onclick="saveAppointments()" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;margin-bottom:8px;">Save &amp; continue to Designated Services →</button>
    <button onclick="go('home')" style="width:100%;font-size:12px;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:9px 16px;border-radius:8px;cursor:pointer;">Return to Home</button>

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
  const requiredRoles = [
    ['amlco',      'AML/CTF Compliance Officer'],
    ['reporting',  'Reporting Officer'],
    ['senior',     'Senior Manager'],
    ['principal2', 'Principal / Managing Partner'],
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
      date: document.getElementById(`appt-${k}-date`)?.value||'',
    };
  });
  const reviewEl = document.getElementById('appt-next-review');
  if (reviewEl?.value) {
    S.firm.appt.nextReview = reviewEl.value;
  } else {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1);
    S.firm.appt.nextReview = d.toISOString().split('T')[0];
  }
  S.firm.appt.savedDate = new Date().toISOString().split('T')[0];
  save(); toast('Appointments saved');
  go('risk');
};
