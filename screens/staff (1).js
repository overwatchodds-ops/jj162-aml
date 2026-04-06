import { S, save } from '../state/index.js';
import { toast } from '../components/index.js';

export function screen() {
  const FN_KEY = [
    { id:'director', label:'Director / owner / beneficial owner', desc:'Has ownership or governance responsibility', type:'key' },
    { id:'amlco', label:'AMLCO or delegate', desc:'Holds formal responsibility for the AML/CTF program', type:'key' },
    { id:'senior', label:'Senior manager with AML/CTF authority', desc:'Approves program, risk assessments or SMR decisions', type:'key' },
    { id:'cdd', label:'Processes client CDD / KYC checks', desc:'Collects and verifies client identity information', type:'std' },
    { id:'screen', label:'Screens clients via NameScan or similar', desc:'Runs PEP, sanctions or adverse media checks', type:'std' },
    { id:'monitor', label:'Supports transaction monitoring', desc:'Reviews or flags unusual client activity', type:'std' },
    { id:'smr', label:'Assists with SMR or compliance reporting', desc:'Prepares or supports suspicious matter reports', type:'std' },
  ];

  const adding = S._staffDraft !== undefined;
  const d = S._staffDraft || {};
  const keyFns = ['director','amlco','senior'];
  const stdFns = ['cdd','screen','monitor','smr'];
  const selFns = d.functions || [];
  const hasKey = selFns.some(f => keyFns.includes(f));
  const hasStd = selFns.some(f => stdFns.includes(f));
  const hasNone = d.noneSelected;
  const classification = hasKey ? 'Key Personnel' : hasStd ? 'Standard AML/CTF Staff' : hasNone ? 'No AML/CTF functions' : null;

  return `
    <div class="p-8 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Key Personnel Vetting <span class="text-base font-normal text-slate-400">(Fit &amp; Proper)</span></h1>
          <p class="text-slate-400 text-sm mt-1 flex items-center gap-1">The firm must record all staff to demonstrate how it determined who is considered Key Personnel under its AML/CTF Program.
            <span onclick="var t=document.getElementById('staff-why-tip');t.style.display=t.style.display==='block'?'none':'block'" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#6366f1;color:#fff;font-size:9px;font-weight:700;cursor:pointer;flex-shrink:0;margin-left:2px;">i</span>
          </p>
          <div id="staff-why-tip" style="display:none;" class="bg-slate-800 text-slate-200 rounded-xl p-4 text-xs leading-relaxed mt-2 max-w-lg space-y-2">
            <div class="font-bold text-indigo-300 mb-1">Why every staff member must be considered</div>
            <p>AUSTRAC requires reporting entities to assess <strong class="text-white">every staff member</strong> to determine whether they meet the threshold for Key Personnel under the AML/CTF Act. Only Key Personnel require fit and proper checks — police, screening, bankruptcy, and annual declarations.</p>
            <p class="mt-2">Recording every person — including those assessed as not Key Personnel — closes the audit gap. It shows the firm has actively considered each individual and made a deliberate, documented determination.</p>
            <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">A register that shows only Key Personnel says <em>"we checked some people."</em> A register that shows every assessment outcome says <em>"we considered everyone."</em> Only one of those is defensible under AUSTRAC scrutiny.</p>
          </div>
        </div>
        ${!adding ? `<button onclick="startAddStaff()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ Add staff member</button>` : `<button onclick="cancelStaff()" class="border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>`}
      </div>

      ${adding ? `
      <div class="bg-white border-2 border-indigo-200 rounded-xl p-5 space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-slate-700">${S._staffEditIdx !== undefined ? 'Edit staff record — ' + (S.staff[S._staffEditIdx]?.name||'') : 'New staff member'}</h2>
          ${S._staffEditIdx !== undefined ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
        </div>

        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Step 1 — Who is this person?</div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs text-slate-500">Full name *</label><input id="st-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="Full legal name"></div>
            <div><label class="text-xs text-slate-500">Job title / position</label><input id="st-role" type="text" class="inp mt-1" value="${d.role||''}" placeholder="e.g. Senior Accountant"></div>
            <div><label class="text-xs text-slate-500">Employment status</label>
              <select id="st-status" class="inp mt-1" onchange="syncStaffDraft();go('staff')">
                <option value="Active" ${(d.status||'Active')==='Active'?'selected':''}>Active</option>
                <option value="Resigned" ${d.status==='Resigned'?'selected':''}>Resigned</option>
                <option value="Terminated" ${d.status==='Terminated'?'selected':''}>Terminated</option>
                <option value="On Leave" ${d.status==='On Leave'?'selected':''}>On Leave</option>
              </select>
            </div>
            ${d.status==='Resigned'||d.status==='Terminated' ? `
            <div><label class="text-xs text-slate-500">Date of departure</label><input id="st-departure" type="date" class="inp mt-1" value="${d.departureDate||''}"></div>` : '<div></div>'}
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Step 2 — What AML/CTF functions will they perform?</div>
          <div class="space-y-2">
            <div class="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Governance roles — Key Personnel</div>
            ${FN_KEY.filter(f=>f.type==='key').map(f=>`
              <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${selFns.includes(f.id)?'bg-amber-50 border-amber-200':''}">
                <input type="checkbox" ${selFns.includes(f.id)?'checked':''} onchange="toggleStaffFn('${f.id}',this)" class="mt-0.5">
                <div class="flex-1"><div class="text-sm font-medium">${f.label}</div><div class="text-xs text-slate-400">${f.desc}</div></div>
                <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">Key personnel</span>
              </label>`).join('')}
            <div class="text-xs text-slate-400 mt-3 mb-2 font-semibold uppercase tracking-wide">Operational roles — Standard staff</div>
            ${FN_KEY.filter(f=>f.type==='std').map(f=>`
              <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${selFns.includes(f.id)?'bg-blue-50 border-blue-200':''}">
                <input type="checkbox" ${selFns.includes(f.id)?'checked':''} onchange="toggleStaffFn('${f.id}',this)" class="mt-0.5">
                <div class="flex-1"><div class="text-sm font-medium">${f.label}</div><div class="text-xs text-slate-400">${f.desc}</div></div>
                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">Standard staff</span>
              </label>`).join('')}
            <div class="border-t mt-2 pt-2">
              <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${hasNone?'bg-slate-50 border-slate-300':''}">
                <input type="checkbox" id="st-none" ${hasNone?'checked':''} onchange="toggleStaffNone(this)" class="mt-0.5">
                <div><div class="text-sm font-medium text-slate-500">None of the above</div><div class="text-xs text-slate-400">This person performs no AML/CTF functions — assessed and confirmed not required</div></div>
              </label>
            </div>
          </div>
          ${classification ? `
          <div class="mt-3 p-3 rounded-xl text-sm font-semibold ${classification==='Key Personnel'?'bg-amber-50 border border-amber-200 text-amber-800':classification==='Standard AML/CTF Staff'?'bg-blue-50 border border-blue-200 text-blue-800':'bg-slate-50 border border-slate-200 text-slate-600'}">
            Classification: ${classification}
          </div>` : ''}
        </div>

        ${classification && classification !== 'No AML/CTF functions' ? `
        <div class="border-t pt-4 space-y-4">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Step 3 — Vetting checks</div>
          <div><label class="text-xs text-slate-500">Vetting date *</label><input id="st-date" type="date" class="inp mt-1" value="${d.date||''}"></div>

          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div class="text-xs font-bold text-blue-700 uppercase">Criminal history check</div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-xs text-slate-500">Result</label>
                <select id="st-police-result" class="inp mt-1">
                  <option value="">— Select —</option>
                  <option ${d.policeResult==='Pass'?'selected':''} value="Pass">Pass — clear</option>
                  <option ${d.policeResult==='Fail'?'selected':''} value="Fail">Fail — findings</option>
                </select>
              </div>
              <div><label class="text-xs text-slate-500">Reference number</label><input id="st-police-ref" type="text" class="inp mt-1" value="${d.policeRef||''}" placeholder="AFP-2026-XXXXX" style="font-family:monospace;font-size:12px"></div>
            </div>
            <div><label class="text-xs text-slate-500">Verified by</label><input id="st-police-by" type="text" class="inp mt-1" value="${d.policeBy||''}" placeholder="Staff member who verified"></div>
          </div>

          <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
            <div class="text-xs font-bold text-amber-700 uppercase">Bankruptcy / insolvency check</div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-xs text-slate-500">Check date</label><input id="st-bankrupt-date" type="date" class="inp mt-1" value="${d.bankruptDate||''}"></div>
              <div><label class="text-xs text-slate-500">Result</label>
                <select id="st-bankrupt-result" class="inp mt-1">
                  <option value="">— Select —</option>
                  <option ${d.bankruptResult==='Clear'?'selected':''}>Clear</option>
                  <option ${d.bankruptResult==='Finding'?'selected':''}>Finding — investigate</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
            <div class="text-xs font-bold text-green-700 uppercase">Sanctions / PEP screening</div>
            <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" class="flex items-stretch rounded-xl overflow-hidden text-sm mb-2 no-underline">
              <div class="flex-1 bg-slate-800 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-semibold">Screen this staff member via NameScan</div>
              <div class="bg-cyan-500 text-white px-4 py-2.5 text-xs font-semibold whitespace-nowrap">NameScan →</div>
            </a>
            <div class="grid grid-cols-3 gap-3">
              <div><label class="text-xs text-slate-500">Date screened</label><input id="st-ns-date" type="date" class="inp mt-1" value="${d.nsDate||''}"></div>
              <div><label class="text-xs text-slate-500">Result</label>
                <select id="st-ns-result" class="inp mt-1">
                  <option value="">— Select —</option>
                  <option ${d.nsResult==='Clear'?'selected':''}>Clear</option>
                  <option ${d.nsResult==='Hit'?'selected':''}>Hit — investigate</option>
                </select>
              </div>
              <div><label class="text-xs text-slate-500">Scan ID</label><input id="st-ns-ref" type="text" class="inp mt-1" value="${d.nsRef||''}" placeholder="NSC-YYYY-XXXXX" style="font-family:monospace;font-size:12px"></div>
            </div>
          </div>

          <div class="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
            <div class="text-xs font-bold text-green-700 uppercase">Annual declaration</div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-xs text-slate-500">Declaration date</label><input id="st-decl-date" type="date" class="inp mt-1" value="${d.declDate||''}" onchange="autoSetDeclNext(this.value)"></div>
              <div><label class="text-xs text-slate-500">Next due <span class="text-indigo-400 font-normal">(auto-set to +1 year)</span></label><input id="st-decl-next" type="date" class="inp mt-1" value="${d.declNext||''}"></div>
            </div>
            <label class="flex items-start gap-2 bg-white border border-green-200 rounded-xl p-3 cursor-pointer text-xs text-green-800">
              <input type="checkbox" id="st-decl-signed" ${d.declSigned?'checked':''} class="mt-0.5">
              I declare that I have no criminal convictions, undischarged bankruptcies or other matters affecting my suitability to perform AML/CTF functions since my last declaration.
            </label>
          </div>
        </div>` : ''}

        <div><label class="text-xs text-slate-500">Notes</label><textarea id="st-notes" class="inp mt-1" rows="2" placeholder="Any relevant findings...">${d.notes||''}</textarea></div>

        <div class="flex gap-3">
          <button onclick="cancelStaff()" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
          <button onclick="saveStaff()" class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Record</button>
        </div>
      </div>` : ''}

      ${S.staff.length > 0 ? (() => {
        const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';
        const keyStaff  = S.staff.filter(st => st.classification === 'Key Personnel');
        const stdStaff  = S.staff.filter(st => st.classification === 'Standard AML/CTF Staff');
        const noneStaff = S.staff.filter(st => st.classification !== 'Key Personnel' && st.classification !== 'Standard AML/CTF Staff');

        const makeRow = (st, i) => {
          const idx = S.staff.indexOf(st);
          const expanded = S._expandedStaff === idx;
          const history = st.history || [];
          const lastUpdated = st.updatedAt ? new Date(st.updatedAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : (st.date||'—');
          const nameCls = st.status==='Resigned'||st.status==='Terminated' ? 'text-slate-400 line-through' : 'text-slate-800';
          const statusTxt = (!st.status||st.status==='Active') ? 'Active' : st.status + (st.departureDate ? ' '+new Date(st.departureDate).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '');
          const isKey = st.classification === 'Key Personnel';
          const isStd = st.classification === 'Standard AML/CTF Staff';
          const assessmentOutcome = isKey ? 'Performs AML/CTF control or oversight functions' : isStd ? 'Performs AML/CTF control or oversight functions' : 'Does not perform AML/CTF control or oversight functions';
          const outcomeShort = isKey ? 'Key Personnel' : isStd ? 'Standard AML/CTF Staff' : 'Not Key Personnel';

          const detailRow = expanded ? `
          <tr>
            <td colspan="6" class="border-b border-slate-100">
              <div class="bg-slate-50 px-6 py-4 space-y-3">
                <div class="grid grid-cols-3 gap-x-8 gap-y-2 text-xs">
                  ${isKey || isStd ? `
                  <div><span class="text-slate-400">Police check: </span><span class="font-semibold ${st.policeResult==='Pass'?'text-green-700':st.policeResult==='Fail'?'text-red-600':'text-slate-400'}">${st.policeResult||'—'}</span>${st.policeRef?'<span class="text-slate-400 font-mono ml-1">'+st.policeRef+'</span>':''}</div>
                  <div><span class="text-slate-400">Screening: </span><span class="font-semibold ${st.nsResult==='Clear'?'text-green-700':st.nsResult==='Hit'?'text-red-600':'text-slate-400'}">${st.nsResult||'—'}</span>${st.nsRef?'<span class="text-slate-400 font-mono ml-1">'+st.nsRef+'</span>':''}</div>
                  <div><span class="text-slate-400">Bankruptcy: </span><span class="font-semibold ${st.bankruptResult==='Clear'?'text-green-700':'text-slate-400'}">${st.bankruptResult||'—'}</span></div>
                  <div><span class="text-slate-400">Declaration: </span><span class="font-semibold ${st.declSigned?'text-green-700':'text-slate-400'}">${st.declSigned?'Signed':'Pending'}</span>${st.declDate?' on '+st.declDate:''}</div>
                  <div><span class="text-slate-400">Next due: </span><span class="font-semibold ${st.declNext&&new Date(st.declNext)<new Date()?'text-red-600':'text-slate-600'}">${st.declNext||'—'}${st.declNext&&new Date(st.declNext)<new Date()?' — Overdue':''}</span></div>
                  <div><span class="text-slate-400">Vetting date: </span><span class="text-slate-600">${st.date||'—'}</span></div>` : `
                  <div class="col-span-3 text-slate-500 italic">Assessed as not performing AML/CTF functions — fit and proper checks not required.</div>`}
                  ${st.notes ? `<div class="col-span-3"><span class="text-slate-400">Notes: </span><span class="text-slate-600">${st.notes}</span></div>` : ''}
                  <div><span class="text-slate-400">Last updated: </span><span class="text-slate-600">${lastUpdated}</span></div>
                  ${history.length > 0 ? `<div><span class="text-slate-400">Versions: </span><span class="text-slate-600">${history.length} previous</span></div>` : ''}
                </div>
              </div>
            </td>
          </tr>` : '';

          return `
          <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${expanded?'bg-slate-50':''}">
            <td class="px-4 py-3 font-semibold ${nameCls}">${st.name}</td>
            <td class="px-4 py-3 text-xs text-slate-500">${st.role||'—'}</td>
            <td class="px-4 py-3 text-xs text-slate-500">${assessmentOutcome}</td>
            <td class="px-4 py-3 text-xs font-semibold ${isKey?'text-amber-700':isStd?'text-blue-700':'text-slate-400'}">${outcomeShort}</td>
            <td class="px-4 py-3 text-xs text-slate-400">${statusTxt}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button onclick="editStaff(${idx})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mr-3">Edit</button>
              <button onclick="toggleExpandStaff(${idx})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'} More</button>
            </td>
          </tr>
          ${detailRow}`;
        };

        const tableHead = `<thead><tr class="border-b border-slate-100">
          <th class="${thCls}">Name</th>
          <th class="${thCls}">Position</th>
          <th class="${thCls}">AML/CTF Function Assessment</th>
          <th class="${thCls}">Determination</th>
          <th class="${thCls}">Status</th>
          <th class="${thCls}">Actions</th>
        </tr></thead>`;

        const sectionA = keyStaff.length > 0 ? `
        <div>
          <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Section A — Key Personnel (Fit &amp; Proper / EDD Required)</div>
          <div class="bg-white border rounded-xl overflow-hidden">
            <table class="w-full text-sm border-collapse">
              ${tableHead}
              <tbody>${keyStaff.map((st,i) => makeRow(st,i)).join('')}</tbody>
            </table>
          </div>
        </div>` : '';

        const sectionB = stdStaff.length > 0 ? `
        <div>
          <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Section B — Operational AML Staff (Standard Screening)</div>
          <div class="bg-white border rounded-xl overflow-hidden">
            <table class="w-full text-sm border-collapse">
              ${tableHead}
              <tbody>${stdStaff.map((st,i) => makeRow(st,i)).join('')}</tbody>
            </table>
          </div>
        </div>` : '';

        const sectionC = noneStaff.length > 0 ? `
        <div>
          <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Section C — Non-AML Staff (Assessed — No AML/CTF Functions)</div>
          <div class="bg-white border rounded-xl overflow-hidden">
            <table class="w-full text-sm border-collapse">
              ${tableHead}
              <tbody>${noneStaff.map((st,i) => makeRow(st,i)).join('')}</tbody>
            </table>
          </div>
        </div>` : '';

        return `<div class="space-y-4">${sectionA}${sectionB}${sectionC}</div>`;
      })() : (!adding ? `<div class="text-center py-10 text-slate-400 text-sm bg-white border rounded-xl">No staff records yet — click "Add staff member" to begin</div>` : '')}
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.startAddStaff = function() { S._staffDraft = { functions:[], noneSelected: true }; S._staffEditIdx = undefined; go('staff'); };
window.cancelStaff = function() { delete S._staffDraft; delete S._staffEditIdx; go('staff'); };
window.editStaff = function(i) {
  const st = S.staff[i];
  if (!st) return;
  S._staffDraft = Object.assign({}, st);
  S._staffEditIdx = i;
  go('staff');
};
window.toggleExpandStaff = function(i) {
  S._expandedStaff = S._expandedStaff === i ? null : i;
  go('staff');
};
function syncStaffDraft() {
  if (!S._staffDraft) return;
  const name = document.getElementById('st-name')?.value;
  const role = document.getElementById('st-role')?.value;
  const date = document.getElementById('st-date')?.value;
  const status = document.getElementById('st-status')?.value;
  const departureDate = document.getElementById('st-departure')?.value;
  if (name !== undefined) S._staffDraft.name = name;
  if (role !== undefined) S._staffDraft.role = role;
  if (date !== undefined) S._staffDraft.date = date;
  if (status !== undefined) S._staffDraft.status = status;
  if (departureDate !== undefined) S._staffDraft.departureDate = departureDate;
}
window.toggleStaffFn = function(id, cb) {
  if (!S._staffDraft) return;
  syncStaffDraft();
  const fns = S._staffDraft.functions || [];
  if (cb.checked) { if (!fns.includes(id)) fns.push(id); S._staffDraft.noneSelected = false; }
  else { S._staffDraft.functions = fns.filter(f => f !== id); }
  S._staffDraft.functions = fns;
  go('staff');
};
window.toggleStaffNone = function(cb) {
  if (!S._staffDraft) return;
  syncStaffDraft();
  if (cb.checked) { S._staffDraft.functions = []; S._staffDraft.noneSelected = true; }
  else { S._staffDraft.noneSelected = false; }
  go('staff');
};
window.saveStaff = function() {
  const d = S._staffDraft || {};
  const name = document.getElementById('st-name')?.value?.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const keyFns = ['director','amlco','senior'];
  const stdFns = ['cdd','screen','monitor','smr'];
  const fns = d.functions || [];
  const hasKey = fns.some(f => keyFns.includes(f));
  const hasStd = fns.some(f => stdFns.includes(f));
  const classification = hasKey ? 'Key Personnel' : hasStd ? 'Standard AML/CTF Staff' : 'No AML/CTF functions';
  const newRecord = {
    name, role: document.getElementById('st-role')?.value||'',
    status: document.getElementById('st-status')?.value||'Active',
    departureDate: document.getElementById('st-departure')?.value||'',
    classification, functions: fns,
    date: document.getElementById('st-date')?.value||'',
    updatedAt: Date.now(),
    policeResult: document.getElementById('st-police-result')?.value||'',
    policeRef: document.getElementById('st-police-ref')?.value||'',
    policeBy: document.getElementById('st-police-by')?.value||'',
    bankruptDate: document.getElementById('st-bankrupt-date')?.value||'',
    bankruptResult: document.getElementById('st-bankrupt-result')?.value||'',
    nsDate: document.getElementById('st-ns-date')?.value||'',
    nsResult: document.getElementById('st-ns-result')?.value||'',
    nsRef: document.getElementById('st-ns-ref')?.value||'',
    declDate: document.getElementById('st-decl-date')?.value||'',
    declNext: document.getElementById('st-decl-next')?.value||'',
    declSigned: document.getElementById('st-decl-signed')?.checked||false,
    notes: document.getElementById('st-notes')?.value||''
  };
  const editIdx = S._staffEditIdx;
  if (editIdx !== undefined && S.staff[editIdx]) {
    // Preserve old version in history
    const old = Object.assign({}, S.staff[editIdx]);
    const history = old.history || [];
    delete old.history;
    newRecord.history = [old, ...history];
    S.staff[editIdx] = newRecord;
    toast('Staff record updated — previous version preserved in history');
  } else {
    newRecord.history = [];
    S.staff.unshift(newRecord);
    toast('Staff record saved');
  }
  delete S._staffDraft; delete S._staffEditIdx;
  save(); go('staff');
};
window.autoSetDeclNext = function(val) {
  if (!val) return;
  const d = new Date(val);
  d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('st-decl-next');
  if (el && !el.value) el.value = next;
  if (S._staffDraft) S._staffDraft.declNext = next;
};
