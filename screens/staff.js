import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

// ─── VETTING STATUS HELPERS ───────────────────────────────────────────────────
function vettingStatus(st) {
  const cls = st.classification;
  if (!cls || cls === 'No AML/CTF functions') return 'assessed'; // assessed, no checks needed
  if (cls === 'Key Personnel') {
    // Requires: police check, bankruptcy check, screening, declaration signed
    if (st.policeResult && st.bankruptResult && st.nsResult && st.declSigned) return 'complete';
    return 'incomplete';
  }
  if (cls === 'Standard AML/CTF Staff') {
    // Requires: screening + declaration signed
    if (st.nsResult && st.declSigned) return 'complete';
    return 'incomplete';
  }
  return 'incomplete';
}

function declOverdue(st) {
  if (!st.declNext) return false;
  return new Date(st.declNext) < new Date();
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—';
}

export function screen() {
  const FN_KEY = [
    { id:'director', label:'Director / owner / beneficial owner', desc:'Has ownership or governance responsibility over the firm', type:'key' },
    { id:'amlco',    label:'AMLCO or delegate',                   desc:'Holds formal responsibility for the AML/CTF program',  type:'key' },
    { id:'senior',   label:'Senior manager with AML/CTF authority',desc:'Approves program, risk assessments or SMR decisions',  type:'key' },
    { id:'cdd',      label:'Processes client CDD / KYC checks',    desc:'Collects and verifies client identity information',    type:'std' },
    { id:'screen',   label:'Screens clients via NameScan or similar',desc:'Runs PEP, sanctions or adverse media checks',        type:'std' },
    { id:'monitor',  label:'Supports transaction monitoring',      desc:'Reviews or flags unusual client activity',             type:'std' },
    { id:'smr',      label:'Assists with SMR or compliance reporting',desc:'Prepares or supports suspicious matter reports',    type:'std' },
  ];

  const adding = S._staffDraft !== undefined;
  const d = S._staffDraft || {};
  const keyFns = ['director','amlco','senior'];
  const stdFns = ['cdd','screen','monitor','smr'];
  const selFns = d.functions || [];
  const hasKey  = selFns.some(f => keyFns.includes(f));
  const hasStd  = selFns.some(f => stdFns.includes(f));
  const hasNone = d.noneSelected;
  const classification = hasKey ? 'Key Personnel' : hasStd ? 'Standard AML/CTF Staff' : hasNone ? 'No AML/CTF functions' : null;

  return `<div style="max-width:760px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Key Personnel Vetting</h1>
        <p style="font-size:13px;color:#64748b;">Every person in your firm must be assessed to determine their AML/CTF role — only then can you show AUSTRAC you considered everyone.</p>
      </div>
      ${!adding
        ? `<button onclick="startAddStaff()" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:16px;flex-shrink:0;">+ Add staff member</button>`
        : `<button onclick="cancelStaff()" style="font-size:12px;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:8px 16px;border-radius:8px;cursor:pointer;white-space:nowrap;margin-left:16px;flex-shrink:0;">Cancel</button>`}
    </div>

    ${adding ? `
    <div style="background:#fff;border:1.5px solid #c7d2fe;border-radius:12px;padding:20px 22px;margin-bottom:14px;">

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;">${S._staffEditIdx !== undefined ? 'Edit staff record — ' + (S.staff[S._staffEditIdx]?.name||'') : 'New staff member'}</div>
        ${S._staffEditIdx !== undefined ? `<span style="font-size:10px;font-weight:500;color:#92400e;background:#fffbeb;border:0.5px solid #fde68a;padding:2px 10px;border-radius:99px;">Editing — previous version preserved</span>` : ''}
      </div>

      <!-- IDENTITY -->
      <div style="margin-bottom:18px;">
        <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:12px;">Identity &amp; employment</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Full name *</label><input id="st-name" type="text" class="inp" value="${d.name||''}" placeholder="Full legal name"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Job title / position</label><input id="st-role" type="text" class="inp" value="${d.role||''}" placeholder="e.g. Senior Accountant"></div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Employment status</label>
            <select id="st-status" class="inp" onchange="syncStaffDraft();go('staff')">
              <option value="Active"     ${(d.status||'Active')==='Active'    ?'selected':''}>Active</option>
              <option value="Resigned"   ${d.status==='Resigned'  ?'selected':''}>Resigned</option>
              <option value="Terminated" ${d.status==='Terminated'?'selected':''}>Terminated</option>
              <option value="On Leave"   ${d.status==='On Leave'  ?'selected':''}>On Leave</option>
            </select>
          </div>
          ${d.status==='Resigned'||d.status==='Terminated' ? `
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date of departure</label><input id="st-departure" type="date" class="inp" value="${d.departureDate||''}"></div>` : '<div></div>'}
        </div>
      </div>

      <!-- AML/CTF FUNCTIONS -->
      <div style="border-top:0.5px solid #f1f5f9;padding-top:18px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
          <span style="font-size:12px;font-weight:500;color:#0f172a;">AML/CTF functions</span>
          ${infoBtn('staff-fn-tip')}
        </div>
        ${infoPop('staff-fn-tip', `
          <strong class="text-indigo-300 block mb-2">How to classify this person</strong>
          <p>Tick every AML/CTF function this person performs. The classification is automatic:</p>
          <ul class="mt-2 space-y-1.5">
            <li>· <strong class="text-white">Key Personnel</strong> — holds any governance or oversight role (director, AMLCO, senior manager). Requires full fit and proper vetting.</li>
            <li>· <strong class="text-white">Standard AML/CTF Staff</strong> — performs operational AML tasks (CDD, screening, monitoring, SMR). Requires screening and training.</li>
            <li>· <strong class="text-white">No AML/CTF functions</strong> — no AML role. Record the assessment outcome but no vetting checks required.</li>
          </ul>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Recording everyone — including those with no AML functions — shows AUSTRAC you actively considered each person rather than only checking those you already suspected were Key Personnel.</p>
        `)}
        <p style="font-size:11px;color:#94a3b8;margin-bottom:10px;">Tick every AML/CTF function this person will perform. Classification is set automatically.</p>
        <div>
          <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Governance roles — Key Personnel</div>
          ${FN_KEY.filter(f=>f.type==='key').map(f=>`
          <label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:0.5px solid ${selFns.includes(f.id)?'#fde68a':'#e2e8f0'};border-radius:8px;cursor:pointer;background:${selFns.includes(f.id)?'#fffbeb':'#fff'};margin-bottom:5px;">
            <input type="checkbox" ${selFns.includes(f.id)?'checked':''} onchange="toggleStaffFn('${f.id}',this)" style="margin-top:2px;flex-shrink:0;">
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:500;color:#0f172a;">${f.label}</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${f.desc}</div>
            </div>
            <span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef3c7;color:#92400e;white-space:nowrap;flex-shrink:0;">Key Personnel</span>
          </label>`).join('')}

          <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin:10px 0 6px;">Operational roles — Standard staff</div>
          ${FN_KEY.filter(f=>f.type==='std').map(f=>`
          <label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:0.5px solid ${selFns.includes(f.id)?'#bfdbfe':'#e2e8f0'};border-radius:8px;cursor:pointer;background:${selFns.includes(f.id)?'#eff6ff':'#fff'};margin-bottom:5px;">
            <input type="checkbox" ${selFns.includes(f.id)?'checked':''} onchange="toggleStaffFn('${f.id}',this)" style="margin-top:2px;flex-shrink:0;">
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:500;color:#0f172a;">${f.label}</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${f.desc}</div>
            </div>
            <span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#dbeafe;color:#1e40af;white-space:nowrap;flex-shrink:0;">Standard Staff</span>
          </label>`).join('')}

          <div style="border-top:0.5px solid #f1f5f9;margin-top:8px;padding-top:8px;">
            <label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:0.5px solid ${hasNone?'#d1d5db':'#e2e8f0'};border-radius:8px;cursor:pointer;background:${hasNone?'#f8fafc':'#fff'};">
              <input type="checkbox" id="st-none" ${hasNone?'checked':''} onchange="toggleStaffNone(this)" style="margin-top:2px;flex-shrink:0;">
              <div>
                <div style="font-size:12px;color:#64748b;">None of the above</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px;">This person performs no AML/CTF functions — assessed and confirmed not required</div>
              </div>
            </label>
          </div>
        </div>

        ${classification ? `
        <div style="margin-top:10px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500;background:${classification==='Key Personnel'?'#fffbeb':classification==='Standard AML/CTF Staff'?'#eff6ff':'#f8fafc'};color:${classification==='Key Personnel'?'#92400e':classification==='Standard AML/CTF Staff'?'#1e40af':'#64748b'};border:0.5px solid ${classification==='Key Personnel'?'#fde68a':classification==='Standard AML/CTF Staff'?'#bfdbfe':'#e2e8f0'};">
          Classification: ${classification}
        </div>` : ''}
      </div>

      <!-- VETTING CHECKS -->
      ${classification && classification !== 'No AML/CTF functions' ? `
      <div style="border-top:0.5px solid #f1f5f9;padding-top:18px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
          <span style="font-size:12px;font-weight:500;color:#0f172a;">Vetting checks</span>
          ${infoBtn('staff-vet-tip')}
        </div>
        ${infoPop('staff-vet-tip', `
          <strong class="text-indigo-300 block mb-2">What vetting checks are required</strong>
          <p>AUSTRAC requires reporting entities to conduct fit and proper checks before a person performs AML/CTF functions:</p>
          <ul class="mt-2 space-y-1.5">
            <li>· <strong class="text-white">Criminal history check</strong> — via the Australian Federal Police or accredited provider. Must be current (within 3 years for Key Personnel).</li>
            <li>· <strong class="text-white">Bankruptcy / insolvency check</strong> — via AFSA (Australian Financial Security Authority). Checks for undischarged bankruptcies.</li>
            <li>· <strong class="text-white">Sanctions / PEP screening</strong> — checks the person against global sanctions lists and politically exposed persons databases.</li>
            <li>· <strong class="text-white">Annual declaration</strong> — a signed self-declaration that no disqualifying events have occurred since the last check.</li>
          </ul>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Keep evidence of each check on file. SimpleAML records the outcome and reference — the original documents must be stored separately.</p>
        `)}

        <div style="margin-bottom:12px;"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Vetting date *</label><input id="st-date" type="date" class="inp" value="${d.date||''}"></div>

        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:10px;">Criminal history check</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Result</label>
              <select id="st-police-result" class="inp">
                <option value="">— Select —</option>
                <option ${d.policeResult==='Pass'?'selected':''} value="Pass">Pass — clear</option>
                <option ${d.policeResult==='Fail'?'selected':''} value="Fail">Fail — findings</option>
              </select>
            </div>
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Reference number</label><input id="st-police-ref" type="text" class="inp" value="${d.policeRef||''}" placeholder="AFP-2026-XXXXX" style="font-family:monospace;font-size:12px"></div>
          </div>
          <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Verified by</label><input id="st-police-by" type="text" class="inp" value="${d.policeBy||''}" placeholder="Staff member who verified"></div>
        </div>

        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:10px;">Bankruptcy / insolvency check</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Check date</label><input id="st-bankrupt-date" type="date" class="inp" value="${d.bankruptDate||''}"></div>
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Result</label>
              <select id="st-bankrupt-result" class="inp">
                <option value="">— Select —</option>
                <option ${d.bankruptResult==='Clear'?'selected':''}>Clear</option>
                <option ${d.bankruptResult==='Finding'?'selected':''}>Finding — investigate</option>
              </select>
            </div>
          </div>
        </div>

        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:10px;">Sanctions / PEP screening</div>
          <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" style="display:flex;border-radius:8px;overflow:hidden;text-decoration:none;margin-bottom:10px;">
            <div style="flex:1;background:#1e293b;color:#fff;padding:9px 14px;font-size:11px;font-weight:500;">Screen this staff member via NameScan</div>
            <div style="background:#06b6d4;color:#fff;padding:9px 14px;font-size:11px;font-weight:500;white-space:nowrap;">NameScan →</div>
          </a>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Date screened</label><input id="st-ns-date" type="date" class="inp" value="${d.nsDate||''}"></div>
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Result</label>
              <select id="st-ns-result" class="inp">
                <option value="">— Select —</option>
                <option ${d.nsResult==='Clear'?'selected':''}>Clear</option>
                <option ${d.nsResult==='Hit'?'selected':''}>Hit — investigate</option>
              </select>
            </div>
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Scan ID</label><input id="st-ns-ref" type="text" class="inp" value="${d.nsRef||''}" placeholder="NSC-YYYY-XXXXX" style="font-family:monospace;font-size:12px"></div>
          </div>
        </div>

        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:10px;">Annual declaration</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Declaration date</label><input id="st-decl-date" type="date" class="inp" value="${d.declDate||''}" onchange="autoSetDeclNext(this.value)"></div>
            <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Next due <span style="color:#818cf8;font-weight:400;">(auto-set to +1 year)</span></label><input id="st-decl-next" type="date" class="inp" value="${d.declNext||''}"></div>
          </div>
          <label style="display:flex;align-items:flex-start;gap:10px;background:#fff;border:0.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;cursor:pointer;">
            <input type="checkbox" id="st-decl-signed" ${d.declSigned?'checked':''} style="margin-top:2px;flex-shrink:0;">
            <span style="font-size:11px;color:#0f172a;line-height:1.6;">I declare that I have no criminal convictions, undischarged bankruptcies or other matters affecting my suitability to perform AML/CTF functions since my last declaration.</span>
          </label>
        </div>
      </div>` : ''}

      <div><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:5px;">Notes</label><textarea id="st-notes" class="inp" rows="2" placeholder="Any relevant findings, observations or exceptions...">${d.notes||''}</textarea></div>

      <div style="display:flex;gap:10px;margin-top:4px;">
        <button onclick="cancelStaff()" style="flex:1;font-size:12px;font-weight:500;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:9px;border-radius:8px;cursor:pointer;">Cancel</button>
        <button onclick="saveStaff()" style="flex:1;font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:9px;border-radius:8px;cursor:pointer;">Save Record</button>
      </div>
    </div>` : ''}

    ${S.staff.length > 0 ? (() => {
      const keyStaff  = S.staff.filter(st => st.classification === 'Key Personnel');
      const stdStaff  = S.staff.filter(st => st.classification === 'Standard AML/CTF Staff');
      const noneStaff = S.staff.filter(st => st.classification !== 'Key Personnel' && st.classification !== 'Standard AML/CTF Staff');

      const makeRow = (st) => {
        const idx = S.staff.indexOf(st);
        const isKey = st.classification === 'Key Personnel';
        const isStd = st.classification === 'Standard AML/CTF Staff';
        const isNone = !isKey && !isStd;
        const pillBg = isKey ? '#fef3c7' : isStd ? '#dbeafe' : '#f1f5f9';
        const pillCol = isKey ? '#92400e' : isStd ? '#1e40af' : '#64748b';
        const clsLabel = isKey ? 'Key Personnel' : isStd ? 'Standard Staff' : 'No AML functions';
        const vs = vettingStatus(st);
        const vsBadge = vs === 'complete'
          ? '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;">Complete</span>'
          : vs === 'assessed'
            ? '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f8fafc;color:#64748b;">Assessed</span>'
            : '<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#fef2f2;color:#991b1b;">Incomplete</span>';
        const overdue = declOverdue(st);
        const reviewBadge = isNone
          ? '<span style="font-size:11px;color:#cbd5e1;">—</span>'
          : !st.declNext
            ? '<span style="font-size:11px;color:#94a3b8;font-style:italic;">Not set</span>'
            : overdue
              ? `<span style="font-size:11px;font-weight:500;color:#d97706;">⚠ ${fmtDate(st.declNext)}</span>`
              : `<span style="font-size:11px;color:#64748b;">${fmtDate(st.declNext)}</span>`;
        const nameStyle = st.status==='Resigned'||st.status==='Terminated' ? 'color:#94a3b8;text-decoration:line-through;' : 'color:#0f172a;';

        return `
        <tr style="border-bottom:0.5px solid #f1f5f9;cursor:pointer;transition:background .1s;" onclick="editStaff(${idx})" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
          <td style="padding:10px 14px;">
            <div style="font-size:12px;font-weight:500;${nameStyle}">${st.name}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${st.role||'—'}</div>
          </td>
          <td style="padding:10px 14px;"><span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:${pillBg};color:${pillCol};">${clsLabel}</span></td>
          <td style="padding:10px 14px;">${vsBadge}</td>
          <td style="padding:10px 14px;">${reviewBadge}</td>
          <td style="padding:10px 14px;text-align:right;" onclick="event.stopPropagation()">
            <button onclick="editStaff(${idx})" style="font-size:11px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:500;">Edit</button>
          </td>
        </tr>`;
      };

      const tableHead = `<thead><tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
        <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Name</th>
        <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Classification</th>
        <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Vetting</th>
        <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Next declaration</th>
        <th style="width:60px;"></th>
      </tr></thead>`;

      const section = (label, staff) => staff.length === 0 ? '' : `
      <div style="margin-bottom:16px;">
        <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">${label}</div>
        <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            ${tableHead}
            <tbody>${staff.map(st => makeRow(st)).join('')}</tbody>
          </table>
        </div>
      </div>`;

      return `<div>
        ${section('Key Personnel — Fit &amp; Proper checks required', keyStaff)}
        ${section('Standard AML/CTF Staff — Screening required', stdStaff)}
        ${section('Assessed — No AML/CTF functions', noneStaff)}
      </div>`;
    })() : (!adding ? `
    <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">No staff records yet.</div>
      <div style="font-size:11px;color:#cbd5e1;">Click "Add staff member" to begin your vetting register.</div>
    </div>` : '')}

  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.startAddStaff = function() { S._staffDraft = { functions:[], noneSelected: true }; S._staffEditIdx = undefined; go('staff'); };
window.cancelStaff  = function() { delete S._staffDraft; delete S._staffEditIdx; go('staff'); };
window.editStaff = function(i) {
  const st = S.staff[i]; if (!st) return;
  S._staffDraft = Object.assign({}, st); S._staffEditIdx = i; go('staff');
};
// toggleExpandStaff removed — rows now click-through to edit
function syncStaffDraft() {
  if (!S._staffDraft) return;
  ['st-name','st-role','st-date','st-status','st-departure'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    const key = { 'st-name':'name','st-role':'role','st-date':'date','st-status':'status','st-departure':'departureDate' }[id];
    if (key) S._staffDraft[key] = el.value;
  });
}
window.toggleStaffFn = function(id, cb) {
  if (!S._staffDraft) return; syncStaffDraft();
  const fns = S._staffDraft.functions || [];
  if (cb.checked) { if (!fns.includes(id)) fns.push(id); S._staffDraft.noneSelected = false; }
  else { S._staffDraft.functions = fns.filter(f => f !== id); }
  S._staffDraft.functions = fns; go('staff');
};
window.toggleStaffNone = function(cb) {
  if (!S._staffDraft) return; syncStaffDraft();
  if (cb.checked) { S._staffDraft.functions = []; S._staffDraft.noneSelected = true; }
  else { S._staffDraft.noneSelected = false; }
  go('staff');
};
window.saveStaff = function() {
  const d = S._staffDraft || {};
  const name = document.getElementById('st-name')?.value?.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const role = document.getElementById('st-role')?.value?.trim();
  if (!role) { toast('Job title / position is required', 'err'); return; }
  const keyFns = ['director','amlco','senior']; const stdFns = ['cdd','screen','monitor','smr'];
  const fns = d.functions || [];
  const hasKey = fns.some(f => keyFns.includes(f)); const hasStd = fns.some(f => stdFns.includes(f));
  if (!hasKey && !hasStd && !d.noneSelected) { toast('Select at least one AML/CTF function, or tick \"None of the above\"', 'err'); return; }
  const classification = hasKey ? 'Key Personnel' : hasStd ? 'Standard AML/CTF Staff' : 'No AML/CTF functions';

  const newRecord = {
    name, role: document.getElementById('st-role')?.value||'',
    status: document.getElementById('st-status')?.value||'Active',
    departureDate: document.getElementById('st-departure')?.value||'',
    classification, functions: fns, date: document.getElementById('st-date')?.value||'',
    updatedAt: Date.now(),
    policeResult: document.getElementById('st-police-result')?.value||'',
    policeRef:    document.getElementById('st-police-ref')?.value||'',
    policeBy:     document.getElementById('st-police-by')?.value||'',
    bankruptDate:   document.getElementById('st-bankrupt-date')?.value||'',
    bankruptResult: document.getElementById('st-bankrupt-result')?.value||'',
    nsDate:   document.getElementById('st-ns-date')?.value||'',
    nsResult: document.getElementById('st-ns-result')?.value||'',
    nsRef:    document.getElementById('st-ns-ref')?.value||'',
    declDate:   document.getElementById('st-decl-date')?.value||'',
    declNext:   document.getElementById('st-decl-next')?.value||'',
    declSigned: document.getElementById('st-decl-signed')?.checked||false,
    notes: document.getElementById('st-notes')?.value||''
  };
  const editIdx = S._staffEditIdx;
  // Determine if vetting is incomplete for the toast message
  let vetIncomplete = false;
  if (newRecord.classification === 'Key Personnel') {
    vetIncomplete = !newRecord.policeResult || !newRecord.bankruptResult || !newRecord.nsResult || !newRecord.declSigned;
  } else if (newRecord.classification === 'Standard AML/CTF Staff') {
    vetIncomplete = !newRecord.nsResult || !newRecord.declSigned;
  }
  if (editIdx !== undefined && S.staff[editIdx]) {
    const old = Object.assign({}, S.staff[editIdx]);
    const history = old.history || []; delete old.history;
    newRecord.history = [old, ...history];
    S.staff[editIdx] = newRecord;
    toast(vetIncomplete ? 'Record saved — vetting incomplete. Return to complete all checks.' : 'Staff record updated — previous version preserved');
  } else {
    newRecord.history = [];
    S.staff.unshift(newRecord);
    toast(vetIncomplete ? 'Record saved — vetting incomplete. Return to complete all checks.' : 'Staff record saved');
  }
  delete S._staffDraft; delete S._staffEditIdx;
  save(); go('staff');
};
window.autoSetDeclNext = function(val) {
  if (!val) return;
  const d = new Date(val); d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('st-decl-next');
  if (el && !el.value) el.value = next;
  if (S._staffDraft) S._staffDraft.declNext = next;
};
