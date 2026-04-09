import { S, save } from '../state/index.js';
import { toast, infoBtn, infoPop } from '../components/index.js';

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

  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Key Personnel Vetting</h1>
        <p class="text-sm text-slate-400 mt-1">Every person in your firm must be assessed to determine whether they meet the threshold for Key Personnel — only then can you show AUSTRAC you considered everyone.</p>
      </div>
      ${!adding
        ? `<button onclick="startAddStaff()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex-shrink-0 ml-6">+ Add staff member</button>`
        : `<button onclick="cancelStaff()" class="border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition flex-shrink-0 ml-6">Cancel</button>`}
    </div>

    ${adding ? `
    <div class="bg-white border-2 border-indigo-200 rounded-xl p-6 space-y-6">

      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-700">${S._staffEditIdx !== undefined ? 'Edit staff record — ' + (S.staff[S._staffEditIdx]?.name||'') : 'New staff member'}</h2>
        ${S._staffEditIdx !== undefined ? `<span class="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Editing — previous version will be preserved</span>` : ''}
      </div>

      <!-- IDENTITY -->
      <div class="space-y-4">
        <h2 class="text-sm font-bold text-slate-700">Identity &amp; employment</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="text-xs text-slate-500">Full name *</label><input id="st-name" type="text" class="inp mt-1" value="${d.name||''}" placeholder="Full legal name"></div>
          <div><label class="text-xs text-slate-500">Job title / position</label><input id="st-role" type="text" class="inp mt-1" value="${d.role||''}" placeholder="e.g. Senior Accountant"></div>
          <div><label class="text-xs text-slate-500">Employment status</label>
            <select id="st-status" class="inp mt-1" onchange="syncStaffDraft();go('staff')">
              <option value="Active"     ${(d.status||'Active')==='Active'    ?'selected':''}>Active</option>
              <option value="Resigned"   ${d.status==='Resigned'  ?'selected':''}>Resigned</option>
              <option value="Terminated" ${d.status==='Terminated'?'selected':''}>Terminated</option>
              <option value="On Leave"   ${d.status==='On Leave'  ?'selected':''}>On Leave</option>
            </select>
          </div>
          ${d.status==='Resigned'||d.status==='Terminated' ? `
          <div><label class="text-xs text-slate-500">Date of departure</label><input id="st-departure" type="date" class="inp mt-1" value="${d.departureDate||''}"></div>` : '<div></div>'}
        </div>
      </div>

      <!-- AML/CTF FUNCTIONS -->
      <div class="space-y-4 border-t pt-5">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-slate-700">AML/CTF functions</h2>
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
        <p class="text-xs text-slate-400">Tick every AML/CTF function this person will perform. Classification is set automatically.</p>

        <div class="space-y-2">
          <div class="text-xs font-semibold text-slate-500 px-1 pt-1">Governance roles — Key Personnel</div>
          ${FN_KEY.filter(f=>f.type==='key').map(f=>`
          <label class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${selFns.includes(f.id)?'bg-amber-50 border-amber-200':'border-slate-200'}">
            <input type="checkbox" ${selFns.includes(f.id)?'checked':''} onchange="toggleStaffFn('${f.id}',this)" class="mt-0.5 flex-shrink-0">
            <div class="flex-1">
              <div class="text-sm font-medium text-slate-700">${f.label}</div>
              <div class="text-xs text-slate-400 mt-0.5">${f.desc}</div>
            </div>
            <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0">Key Personnel</span>
          </label>`).join('')}

          <div class="text-xs font-semibold text-slate-500 px-1 pt-2">Operational roles — Standard staff</div>
          ${FN_KEY.filter(f=>f.type==='std').map(f=>`
          <label class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${selFns.includes(f.id)?'bg-blue-50 border-blue-200':'border-slate-200'}">
            <input type="checkbox" ${selFns.includes(f.id)?'checked':''} onchange="toggleStaffFn('${f.id}',this)" class="mt-0.5 flex-shrink-0">
            <div class="flex-1">
              <div class="text-sm font-medium text-slate-700">${f.label}</div>
              <div class="text-xs text-slate-400 mt-0.5">${f.desc}</div>
            </div>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0">Standard Staff</span>
          </label>`).join('')}

          <div class="border-t border-slate-100 mt-2 pt-2">
            <label class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${hasNone?'bg-slate-50 border-slate-300':'border-slate-200'}">
              <input type="checkbox" id="st-none" ${hasNone?'checked':''} onchange="toggleStaffNone(this)" class="mt-0.5 flex-shrink-0">
              <div>
                <div class="text-sm font-medium text-slate-500">None of the above</div>
                <div class="text-xs text-slate-400 mt-0.5">This person performs no AML/CTF functions — assessed and confirmed not required</div>
              </div>
            </label>
          </div>
        </div>

        ${classification ? `
        <div class="p-3 rounded-xl text-sm font-semibold border ${classification==='Key Personnel'?'bg-amber-50 border-amber-200 text-amber-800':classification==='Standard AML/CTF Staff'?'bg-blue-50 border-blue-200 text-blue-800':'bg-slate-50 border-slate-200 text-slate-600'}">
          Classification: ${classification}
        </div>` : ''}
      </div>

      <!-- VETTING CHECKS -->
      ${classification && classification !== 'No AML/CTF functions' ? `
      <div class="space-y-4 border-t pt-5">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-slate-700">Vetting checks</h2>
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

        <div><label class="text-xs text-slate-500">Vetting date *</label><input id="st-date" type="date" class="inp mt-1" value="${d.date||''}"></div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h2 class="text-sm font-bold text-slate-700">Criminal history check</h2>
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

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h2 class="text-sm font-bold text-slate-700">Bankruptcy / insolvency check</h2>
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

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h2 class="text-sm font-bold text-slate-700">Sanctions / PEP screening</h2>
          <a href="https://namescan.io/?ref=SIMPLEAML" target="_blank" rel="noopener" class="flex items-stretch rounded-xl overflow-hidden text-sm no-underline">
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

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h2 class="text-sm font-bold text-slate-700">Annual declaration</h2>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs text-slate-500">Declaration date</label><input id="st-decl-date" type="date" class="inp mt-1" value="${d.declDate||''}" onchange="autoSetDeclNext(this.value)"></div>
            <div><label class="text-xs text-slate-500">Next due <span class="text-indigo-400 font-normal">(auto-set to +1 year)</span></label><input id="st-decl-next" type="date" class="inp mt-1" value="${d.declNext||''}"></div>
          </div>
          <label class="flex items-start gap-2 bg-white border border-slate-200 rounded-xl p-3 cursor-pointer text-xs text-slate-700">
            <input type="checkbox" id="st-decl-signed" ${d.declSigned?'checked':''} class="mt-0.5 flex-shrink-0">
            I declare that I have no criminal convictions, undischarged bankruptcies or other matters affecting my suitability to perform AML/CTF functions since my last declaration.
          </label>
        </div>
      </div>` : ''}

      <div><label class="text-xs text-slate-500">Notes</label><textarea id="st-notes" class="inp mt-1" rows="2" placeholder="Any relevant findings, observations or exceptions...">${d.notes||''}</textarea></div>

      <div class="flex gap-3 pt-2">
        <button onclick="cancelStaff()" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onclick="saveStaff()" class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Save Record</button>
      </div>
    </div>` : ''}

    ${S.staff.length > 0 ? (() => {
      const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';
      const keyStaff  = S.staff.filter(st => st.classification === 'Key Personnel');
      const stdStaff  = S.staff.filter(st => st.classification === 'Standard AML/CTF Staff');
      const noneStaff = S.staff.filter(st => st.classification !== 'Key Personnel' && st.classification !== 'Standard AML/CTF Staff');

      const makeRow = (st) => {
        const idx = S.staff.indexOf(st);
        const expanded = S._expandedStaff === idx;
        const history = st.history || [];
        const lastUpdated = st.updatedAt ? new Date(st.updatedAt).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : (st.date||'—');
        const nameCls = st.status==='Resigned'||st.status==='Terminated' ? 'text-slate-400 line-through' : 'text-slate-800';
        const statusTxt = (!st.status||st.status==='Active') ? 'Active' : st.status + (st.departureDate ? ' '+new Date(st.departureDate).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '');
        const isKey = st.classification === 'Key Personnel';
        const isStd = st.classification === 'Standard AML/CTF Staff';
        const assessmentOutcome = isKey || isStd ? 'Performs AML/CTF functions' : 'Does not perform AML/CTF functions';
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
                <div><span class="text-slate-400">Next due: </span><span class="font-semibold ${st.declNext&&new Date(st.declNext)<new Date()?'text-red-600':'text-slate-600'}">${st.declNext||'—'}${st.declNext&&new Date(st.declNext)<new Date()?' ⚠ Overdue':''}</span></div>
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

      const section = (label, staff) => staff.length === 0 ? '' : `
      <div>
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1 mb-2">${label}</div>
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-sm border-collapse">
            ${tableHead}
            <tbody>${staff.map(st => makeRow(st)).join('')}</tbody>
          </table>
        </div>
      </div>`;

      return `<div class="space-y-5">
        ${section('Key Personnel — Fit &amp; Proper checks required', keyStaff)}
        ${section('Standard AML/CTF Staff — Screening required', stdStaff)}
        ${section('Assessed — No AML/CTF functions', noneStaff)}
      </div>`;
    })() : (!adding ? `
    <div class="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div class="text-slate-400 text-sm">No staff records yet.</div>
      <div class="text-xs text-slate-400 mt-1">Click "Add staff member" to begin your vetting register.</div>
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
window.toggleExpandStaff = function(i) {
  S._expandedStaff = S._expandedStaff === i ? null : i; go('staff');
};
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
  const keyFns = ['director','amlco','senior']; const stdFns = ['cdd','screen','monitor','smr'];
  const fns = d.functions || [];
  const hasKey = fns.some(f => keyFns.includes(f)); const hasStd = fns.some(f => stdFns.includes(f));
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
  if (editIdx !== undefined && S.staff[editIdx]) {
    const old = Object.assign({}, S.staff[editIdx]);
    const history = old.history || []; delete old.history;
    newRecord.history = [old, ...history];
    S.staff[editIdx] = newRecord;
    toast('Staff record updated — previous version preserved');
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
  const d = new Date(val); d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('st-decl-next');
  if (el && !el.value) el.value = next;
  if (S._staffDraft) S._staffDraft.declNext = next;
};
