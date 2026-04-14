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
  <div onclick="go('${screen}')" style="background:#fff;border:0.5px solid ${urgent && count > 0 ? '#fde68a' : '#e2e8f0'};border-radius:12px;padding:18px;cursor:pointer;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe'" onmouseout="this.style.borderColor='${urgent && count > 0 ? '#fde68a' : '#e2e8f0'}'">
    <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:10px;">${title}</div>
    <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px;">
      <span style="font-size:28px;font-weight:500;color:${urgent && count > 0 ? '#d97706' : count === 0 ? '#16a34a' : '#0f172a'};line-height:1;">${count}</span>
      <span style="font-size:11px;color:#94a3b8;">${count === 1 ? desc.singular : desc.plural}</span>
    </div>
    <div style="font-size:11px;color:${urgent && count > 0 ? '#d97706' : '#94a3b8'};">${count > 0 ? desc.action : desc.clear}</div>
  </div>`;

  return `<div style="max-width:860px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Personnel</h1>
      <p style="font-size:13px;color:#64748b;">Staff vetting and AML/CTF training records for all personnel performing compliance functions.</p>
    </div>

    ${allOk ? `
    <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:10px;padding:12px 16px;font-size:13px;color:#166534;margin-bottom:16px;">
      All ${amlStaff.length} AML staff have complete vetting and current declarations. Training is up to date.
    </div>` : ''}

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px;">

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
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:16px;">
      <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:12px;">Quick actions</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
        <button onclick="go('staff')" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">Key Personnel Vetting</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">View all staff vetting status and declarations</div>
          </div>
        </button>
        <button onclick="startAddStaff()" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">Add Staff Member</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Record vetting and AML/CTF functions</div>
          </div>
        </button>
        <button onclick="go('training')" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">Training Register</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">View all training records and upcoming due dates</div>
          </div>
        </button>
        <button onclick="startAddTraining()" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">Add Training Record</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Log completed AML/CTF training</div>
          </div>
        </button>
      </div>
    </div>

    ${active.length === 0 ? `
    <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;margin-bottom:16px;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">No staff records yet.</div>
      <div style="font-size:11px;color:#cbd5e1;margin-bottom:16px;">Add your first staff member to begin the vetting register.</div>
      <button onclick="startAddStaff()" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;">+ Add Staff Member</button>
    </div>` : ''}

    <!-- SNAPSHOT TABLE -->
    ${amlStaff.length > 0 ? `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:0.5px solid #f1f5f9;">
        <div style="font-size:12px;font-weight:500;color:#0f172a;">AML Staff at a glance</div>
        <span style="font-size:11px;color:#94a3b8;">${amlStaff.length} active</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Name</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Classification</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Vetting</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Next declaration</th>
            <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Last training</th>
          </tr>
        </thead>
        <tbody>
          ${amlStaff.map(st => {
            const vs = vettingStatus(st);
            const isKey = st.classification === 'Key Personnel';
            const pillBg  = isKey ? '#fef3c7' : '#dbeafe';
            const pillCol = isKey ? '#92400e' : '#1e40af';
            const vsBadge = vs === 'complete'
              ? '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Complete</span>'
              : '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">Incomplete</span>';
            const declOverdueFlag = st.declNext && new Date(st.declNext) < now;
            const declBadge = !st.declNext
              ? '<span style="font-size:11px;color:#94a3b8;font-style:italic;">Not set</span>'
              : declOverdueFlag
                ? `<span style="font-size:11px;font-weight:500;color:#d97706;">⚠ ${fmtDate(st.declNext)}</span>`
                : `<span style="font-size:11px;color:#64748b;">${fmtDate(st.declNext)}</span>`;
            const lastTraining = S.training.filter(t => t.name === st.name).sort((a,b) => new Date(b.date||0) - new Date(a.date||0))[0];
            const trainBadge = !lastTraining
              ? '<span style="font-size:11px;color:#94a3b8;font-style:italic;">No record</span>'
              : lastTraining.next && new Date(lastTraining.next) < now
                ? `<span style="font-size:11px;font-weight:500;color:#d97706;">⚠ ${fmtDate(lastTraining.date)}</span>`
                : `<span style="font-size:11px;color:#64748b;">${fmtDate(lastTraining.date)}</span>`;
            return `
            <tr style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onclick="go('staff')" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:10px 14px;font-size:12px;font-weight:500;color:#0f172a;">${st.name}</td>
              <td style="padding:10px 14px;"><span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:${pillBg};color:${pillCol};">${st.classification}</span></td>
              <td style="padding:10px 14px;">${vsBadge}</td>
              <td style="padding:10px 14px;">${declBadge}</td>
              <td style="padding:10px 14px;">${trainBadge}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : ''}

  </div>`;
}
