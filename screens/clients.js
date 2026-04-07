import { S, DS_LIST, save } from '../state/index.js';
import { autoClientRiskRating } from '../logic/index.js';
import { toast } from '../components/index.js';

export function screen() {
    'ctrl-training':  S.training.length > 0,
    'ctrl-dvs':       !!(S.program.approvedBy),
    'ctrl-screening': !!(S.program.approvedBy),
    'ctrl-review':    !!(S.program.nextReview),
    'ctrl-ongoing':   false,
  };

  const CONTROLS = [
    { id:'ctrl-program',   label:'AML/CTF Program approved by senior manager',       what:'Your written program has been formally approved by a senior manager.',    evidence: S.program.approvedBy ? 'Approved by ' + S.program.approvedBy + ' on ' + (S.program.approvedDate||'—') : null },
    { id:'ctrl-amlco',     label:'AMLCO appointed and oversight operational',        what:'A named person holds the AMLCO role and provides compliance oversight.',  evidence: (S.firm.appt&&S.firm.appt.amlco&&S.firm.appt.amlco.name) ? 'AMLCO: ' + S.firm.appt.amlco.name : null },
    { id:'ctrl-training',  label:'AML/CTF staff training policy in place',           what:'You have a training policy and conduct training at least annually.',       evidence: S.training.length > 0 ? S.training.length + ' training record(s) in Training Register' : null },
    { id:'ctrl-dvs',       label:'Customer identification procedure in place',       what:'Your program includes a documented procedure for verifying client identity before providing a designated service.', evidence: S.program.approvedBy ? 'Covered in your AML/CTF Program' : null },
    { id:'ctrl-screening', label:'Sanctions / PEP screening procedure in place',    what:'Your program includes a procedure for screening clients against sanctions lists and PEP databases.', evidence: S.program.approvedBy ? 'Covered in your AML/CTF Program' : null },
    { id:'ctrl-review',    label:'Annual program review scheduled',                  what:'You have a scheduled date to review and update your program each year.',   evidence: S.program.nextReview ? 'Next review: ' + S.program.nextReview : null },
    { id:'ctrl-ongoing',   label:'Ongoing client monitoring process in place',       what:'You have a process to reassess clients when their circumstances or risk profile changes.', evidence: null },
  ];

  const autoOR = autoOverallRisk(
    sc.serviceRatingOverride || autoServiceRiskFromChecks(sc.serviceChecks),
    sc.clientRatingOverride  || autoClientRisk(sc.clientChecks),
    sc.geoRatingOverride     || autoGeoRisk(sc.geoChecks),
    sc.pfRating
  );
  const inherentRisk = sc.overallRatingOverride || autoOR;
  const declaredControls = e.controls || [];
  const controlCount = declaredControls.length;
  const residualRisk = controlCount >= 6 ? 'Low' : controlCount >= 4 ? 'Medium' : inherentRisk;
  const residualCls = residualRisk==='High' ? 'text-red-600' : residualRisk==='Medium' ? 'text-amber-600' : 'text-green-600';

  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div>
        <h1 class="text-2xl font-bold">AUSTRAC Enrolment</h1>
        <p class="text-slate-400 text-sm mt-1">Complete your controls declaration before enrolling. This is the final step before your obligations begin.</p>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Enrol with the <strong>Australian Transaction Reports and Analysis Centre (AUSTRAC)</strong> within 28 days of first providing a designated service. <strong>Enrolment is now open.</strong>
      </div>

      <!-- PART 1: CONTROLS DECLARATION -->
      <div class="bg-white border rounded-xl p-5 space-y-5">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
          <h2 class="text-sm font-bold text-slate-700">Controls declaration</h2>
          ${infoBtn('ctrl-decl-tip')}
        </div>
        ${infoPop('ctrl-decl-tip', `<strong class="text-indigo-300 block mb-2">What this declaration means</strong>
          <p>This is not a to-do list. It is a formal declaration that these controls are <strong>already operational</strong> in your firm today.</p>
          <p class="mt-2">Ticking a control means: <em>"We already do this in real life, and we can evidence it if AUSTRAC asks."</em></p>
          <p class="mt-2">An independent evaluator can and will ask you to produce:</p>
          <ul class="mt-1 space-y-1">
            <li>✓ Your training register</li>
            <li>✓ A DVS check you performed</li>
            <li>✓ A sanctions/PEP screening result</li>
            <li>✓ Evidence of ongoing client monitoring</li>
          </ul>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Controls are what reduce your inherent risk to a residual risk. The more controls you have genuinely in place, the lower your residual risk rating.</p>`)}

        <p class="text-xs text-slate-400">Tick only the controls that are <strong>already operational</strong> in your firm. Where SimpleAML has found evidence of a control, it is pre-ticked and noted below.</p>

        <div class="space-y-3">
          ${CONTROLS.map(ctrl => {
            const autoTicked = !!ctrl.evidence;
            const manualTicked = declaredControls.includes(ctrl.id);
            const ticked = autoTicked || manualTicked;
            return `
              <div class="border rounded-xl p-4 ${ticked ? 'bg-green-50 border-green-200' : 'bg-white'}">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" class="mt-0.5 flex-shrink-0" ${ticked?'checked':''} ${autoTicked?'disabled':''} onchange="toggleEnrolControl('${ctrl.id}',this.checked)" style="accent-color:#16a34a;">
                  <div class="flex-1">
                    <div class="text-sm font-semibold ${ticked?'text-green-800':'text-slate-700'}">${ctrl.label}</div>
                    <div class="text-xs text-slate-400 mt-0.5">${ctrl.what}</div>
                    ${autoTicked ? `<div class="text-xs text-green-600 font-semibold mt-1">✓ Evidenced in SimpleAML — ${ctrl.evidence}</div>` : ''}
                    ${!autoTicked && !manualTicked ? `<div class="text-xs text-amber-600 mt-1">Not yet evidenced in SimpleAML — only tick if this control is genuinely in place</div>` : ''}
                  </div>
                </label>
              </div>`;
          }).join('')}
        </div>

        <div class="grid grid-cols-3 gap-4 pt-2">
          <div class="bg-slate-50 border rounded-xl p-4 text-center">
            <div class="text-2xl font-black text-slate-800">${inherentRisk||'—'}</div>
            <div class="text-xs text-slate-400 mt-1">Inherent risk</div>
          </div>
          <div class="bg-slate-50 border rounded-xl p-4 text-center">
            <div class="text-2xl font-black text-slate-600">${controlCount}</div>
            <div class="text-xs text-slate-400 mt-1">Controls declared</div>
          </div>
          <div class="bg-slate-50 border rounded-xl p-4 text-center">
            <div class="text-2xl font-black ${residualCls}">${residualRisk||'—'}</div>
            <div class="text-xs text-slate-400 mt-1">Residual risk</div>
          </div>
        </div>

        <div>
          <label class="text-xs text-slate-500">Additional controls or notes</label>
          <textarea class="inp mt-1 text-xs" rows="2" placeholder="Any additional controls specific to your practice..." onchange="enrolField('controlsNotes',this.value)">${e.controlsNotes||''}</textarea>
        </div>
      </div>

      <!-- PART 2: ENROL AT AUSTRAC -->
      <div class="bg-white border rounded-xl p-5 space-y-4">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
          <h2 class="text-sm font-bold text-slate-700">Enrol at AUSTRAC</h2>
          ${infoBtn('enrol-record-tip')}
        </div>
        ${infoPop('enrol-record-tip', `<strong class="text-indigo-300 block mb-2">Why you need to record your enrolment details here</strong>
          <p>Completing enrolment at austrac.gov.au is a legal obligation — but recording the details here is what makes it auditable.</p>
          <p class="mt-2">An independent evaluator or AUSTRAC auditor will ask:</p>
          <ul class="mt-1 space-y-1">
            <li>✓ <strong>When did you enrol?</strong> — the date confirms you met the deadline</li>
            <li>✓ <strong>What is your AUSTRAC reference number?</strong> — confirms the enrolment is real and can be cross-checked</li>
            <li>✓ <strong>Who enrolled on behalf of the firm?</strong> — establishes accountability</li>
            <li>✓ <strong>Was the AMLCO notified?</strong> — confirms governance was followed</li>
          </ul>
          <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Without these details on record, you can show that you enrolled — but you cannot show <em>when</em>, <em>by whom</em>, or <em>that the right people were notified</em>. SimpleAML captures this so your enrolment is part of your complete compliance audit trail.</p>`)}
        <p class="text-xs text-slate-400">Once your controls declaration is complete, proceed to enrol at austrac.gov.au. Then record your enrolment details here.</p>
        <a href="https://www.austrac.gov.au/business/new-to-austrac/enrol-or-register" target="_blank" rel="noopener"
           class="flex items-center justify-between bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm no-underline">
          <span>Proceed to enrol at austrac.gov.au</span>
          <span>→</span>
        </a>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-slate-500">Date enrolled</label><input id="en-date" type="date" class="inp mt-1" value="${e.enrolledDate||''}" onchange="enrolField('enrolledDate',this.value)"></div>
          <div><label class="text-xs text-slate-500">AUSTRAC reference number</label><input id="en-ref" type="text" class="inp mt-1" value="${e.refNumber||''}" placeholder="AUSTRAC reference" onchange="enrolField('refNumber',this.value)"></div>
          <div><label class="text-xs text-slate-500">Enrolled by</label><input id="en-by" type="text" class="inp mt-1" value="${e.enrolledBy||''}" placeholder="Staff name" onchange="enrolField('enrolledBy',this.value)"></div>
          <div><label class="text-xs text-slate-500">AMLCO notified date</label><input id="en-amlco-date" type="date" class="inp mt-1" value="${e.amlcoDate||''}" onchange="enrolField('amlcoDate',this.value)"></div>
        </div>
        <label class="flex items-start gap-2 text-xs cursor-pointer">
          <input type="checkbox" id="en-enrolled" ${e.enrolled?'checked':''} onchange="enrolField('enrolled',this.checked)" class="mt-0.5">
          <span class="text-slate-600 leading-relaxed">I confirm enrolment with AUSTRAC has been completed and that the controls declared above are operational in my firm today.</span>
        </label>
        <button onclick="saveEnrolment()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Save Enrolment Record</button>
      </div>
    </div>`;
};

// CLIENT REGISTER
Screens.clients = () => {
  const clients = S.clients || [];
  const serviceShort = (id) => {
    const n = DS_LIST.find(d=>d.id===id)?.name || id || '—';
    return n
      .replace('Assisting with creation or restructuring of a ','')
      .replace('Acting as or arranging for a person to act as a ','')
      .replace('Receiving, holding or managing client ','Client ')
      .replace('Sale or transfer of a ','');
  };
  const cddStatus = (c) => {
    const inds = c.individuals || [];
    if (!inds.length) return 'Incomplete';
    const allVerified = inds.every(i => i.idOutcome === 'Verified');
    const allScreened = inds.every(i => i.screenResult);
    if (allVerified && allScreened) return 'Complete';
    return 'Incomplete';
  };
  const thCls = 'text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3';
  const rows = clients.map((c,i) => {
    const expanded = S._expandedClient === i;
        <span>CDD: ${v.cddDate||'—'}</span>
        <span>${(v.individuals||[]).length} individual${(v.individuals||[]).length!==1?'s':''}</span>
      </div>`
    ).join('');

    const expandedRow = expanded ? `
    <tr>
      <td colspan="8" class="border-b border-slate-100">
        <div class="bg-slate-50 px-6 py-4 space-y-4">
          <div class="grid grid-cols-3 gap-x-8 gap-y-2 text-xs">
            <div><span class="text-slate-400">CDD date: </span><span class="text-slate-600">${c.cddDate||'—'}</span></div>
            <div><span class="text-slate-400">Services recorded: </span><span class="text-slate-600">${(c.services||[]).length||1}</span></div>
            <div><span class="text-slate-400">Versions: </span><span class="text-slate-600">${history.length > 0 ? history.length+' previous' : 'First record'}</span></div>
            ${c.purpose ? `<div class="col-span-3"><span class="text-slate-400">Purpose: </span><span class="text-slate-600">${c.purpose}</span></div>` : ''}
            ${c.riskOverride ? `<div class="col-span-3"><span class="text-slate-400">Risk override justification: </span><span class="text-slate-600">${c.riskJust||'None provided'}</span></div>` : ''}
          </div>
          ${(c.services||[]).length > 0 ? `
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Services provided</div>
            <table class="w-full text-xs border-collapse">
              <thead><tr class="border-b border-slate-200">
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Service</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Date Provided</th>
                <th class="text-left py-1.5 font-semibold text-slate-400">New CDD Required</th>
              </tr></thead>
              <tbody>
                ${(c.services||[]).map(sv => `
                <tr class="border-b border-slate-100 last:border-0">
                  <td class="py-1.5 pr-4 text-slate-700">${DS_LIST.find(d=>d.id===sv.serviceName)?.name||sv.serviceName||'—'}</td>
                  <td class="py-1.5 pr-4 text-slate-500">${sv.dateProvided||'—'}</td>
                  <td class="py-1.5 text-slate-500">${sv.newCddRequired?'Yes':'No'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}
          ${inds.length > 0 ? `
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Individuals</div>
            <table class="w-full text-xs border-collapse">
              <thead><tr class="border-b border-slate-200">
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Name</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Role</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">ID Outcome</th>
                <th class="text-left py-1.5 pr-4 font-semibold text-slate-400">Screening</th>
                <th class="text-left py-1.5 font-semibold text-slate-400">Verified</th>
              </tr></thead>
              <tbody>${indRows}</tbody>
            </table>
          </div>` : ''}
          ${history.length > 0 ? `
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Change history</div>
            <div class="space-y-1">${histRows}</div>
          </div>` : ''}
        </div>
      </td>
    </tr>` : '';

    return `
    <tr class="border-b border-slate-50 hover:bg-slate-50 transition ${expanded?'bg-slate-50':''}">
      <td class="px-4 py-3 font-semibold text-slate-800">${c.name}</td>
      <td class="px-4 py-3 text-slate-500 text-xs">${c.entityType||'—'}</td>
      <td class="px-4 py-3 text-xs font-semibold ${riskCls}">${c.risk||'Low'}${c.riskOverride?' *':''}</td>
      <td class="px-4 py-3 text-slate-500 text-xs">${svcShort}</td>
      <td class="px-4 py-3 text-xs font-semibold ${statusCls}">${status}</td>
      <td class="px-4 py-3 text-xs text-slate-500">${indCount} · ${verified}/${indCount} verified · ${screened}/${indCount} screened</td>
      <td class="px-4 py-3 text-xs text-slate-500">${lastUpdated}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <button onclick="editClient(${i})" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mr-2">Edit</button>
        <button onclick="startAddService(${i})" class="text-xs text-green-600 font-semibold hover:text-green-800 mr-2">+ Service</button>
        <button onclick="toggleExpandClient(${i})" class="text-xs text-slate-400 hover:text-slate-600">${expanded?'▲':'▼'} More</button>
      </td>
    </tr>
    ${expandedRow}`;
  }).join('');

  const emptyState = `<div class="text-center py-10 text-slate-400 text-sm bg-white border rounded-xl">No clients yet — click "New client" to add your first</div>`;
  const table = `
    <div class="bg-white border rounded-xl overflow-hidden">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="${thCls}">Client</th>
            <th class="${thCls}">Type</th>
            <th class="${thCls}">Risk</th>
            <th class="${thCls}">Designated Service</th>
            <th class="${thCls}">CDD Status</th>
            <th class="${thCls}">People</th>
            <th class="${thCls}">Last Review</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  return `
    <div class="p-8 max-w-5xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Client Register</h1>
          <p class="text-slate-400 text-sm mt-1">${clients.length} client${clients.length!==1?'s':''} on register</p>
        </div>
        <button onclick="go('newclient')" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ New client</button>
      </div>
      ${clients.length > 0 ? table : emptyState}
    </div>`;
};
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
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
window.autoSetTrainingNext = function(val) {
  if (!val) return;
  const d = new Date(val);
  d.setFullYear(d.getFullYear() + 1);
  const next = d.toISOString().split('T')[0];
  const el = document.getElementById('tr-next');
  if (el) el.value = next;
  if (S._trainingDraft) S._trainingDraft.next = next;
};

window.startAddTraining = function() { S._trainingDraft = {}; S._trainingEditIdx = undefined; go('training'); };
window.autoFillTrainingClassification = function(name) {
  if (!S._trainingDraft) S._trainingDraft = {};
  S._trainingDraft.name = name;
  // No re-render needed — classification shown via live lookup
};
window.cancelTraining = function() { delete S._trainingDraft; delete S._trainingEditIdx; go('training'); };
window.editTraining = function(i) {
  const t = S.training[i];
  if (!t) return;
  S._trainingDraft = Object.assign({}, t);
  S._trainingEditIdx = i;
  go('training');
};
window.toggleExpandTraining = function(i) {
  S._expandedTraining = S._expandedTraining === i ? null : i;
  go('training');
};
window.saveTraining = function() {
  const name = document.getElementById('tr-name')?.value?.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const newRecord = {
    name,
    role: document.getElementById('tr-role')?.value||'',
    date: document.getElementById('tr-date')?.value||'',
    provider: document.getElementById('tr-provider')?.value||'',
    score: document.getElementById('tr-score')?.value||'',
    next: document.getElementById('tr-next')?.value||'',
  const newRecord = {
    name,
    role: document.getElementById('tr-role')?.value||'',
    date: document.getElementById('tr-date')?.value||'',
    provider: document.getElementById('tr-provider')?.value||'',
    score: document.getElementById('tr-score')?.value||'',
    next: document.getElementById('tr-next')?.value||'',
    notes: document.getElementById('tr-notes')?.value||'',
    updatedAt: Date.now()
  };
  const editIdx = S._trainingEditIdx;
  if (editIdx !== undefined && S.training[editIdx]) {
window.saveClient = function() {
  if (!S._clientDraft) S._clientDraft = {};
  const name = document.getElementById('cl-name')?.value?.trim();
  if (!name) { toast('Entity name is required', 'err'); return; }
  const entityType = document.getElementById('cl-type')?.value||'';
  const service = document.getElementById('cl-service')?.value||'';
  const inds = S._clientDraft.individuals || [];
  const hasScreeningHit = inds.some(i => i.screenResult === 'PEP' || i.screenResult === 'Sanctions');
  const screenHitResult = hasScreeningHit ? (inds.find(i=>i.screenResult==='PEP'||i.screenResult==='Sanctions')?.screenResult) : null;
  const autoRisk = autoClientRiskRating(entityType, service, screenHitResult, {
    offshoreJurisdiction:  S._clientDraft.offshoreJurisdiction,
    complexStructure:      S._clientDraft.complexStructure,
    pepAmongControllers:   S._clientDraft.pepAmongControllers,
    cashIntensiveIndustry: S._clientDraft.cashIntensiveIndustry,
  });
  const effectiveRisk = S._clientDraft.riskOverride || autoRisk;
  // Collect all entity fields from DOM
  const grab = (id) => document.getElementById(id)?.value||'';
  const grabCb = (id) => document.getElementById(id)?.checked||false;
  const newRecord = {
    name, entityType, service,
    purpose:             grab('cl-purpose'),
    // Entity-specific fields
    abn:                 grab('cl-abn'),
    acn:                 grab('cl-acn'),
    regAddress:          grab('cl-reg-address'),
    businessAddress:     grab('cl-business-address'),
    jurisdiction:        grab('cl-jurisdiction'),
    incDate:             grab('cl-inc-date'),
    industry:            grab('cl-industry'),
    sourceFunds:         grab('cl-source-funds'),
    structureNotes:      grab('cl-structure-notes'),
    docLocation:         grab('cl-doc-location'),
    trustName:           grab('cl-trust-name'),
    trustType:           grab('cl-trust-type'),
    trusteeType:         grab('cl-trustee-type'),
    trustPurpose:        grab('cl-trust-purpose'),
    // Risk flags
    offshoreJurisdiction:  S._clientDraft.offshoreJurisdiction||false,
    complexStructure:      S._clientDraft.complexStructure||false,
    pepAmongControllers:   S._clientDraft.pepAmongControllers||false,
    cashIntensiveIndustry: S._clientDraft.cashIntensiveIndustry||false,
    // Attestation
    abnChecked:          grabCb('cl-abn-checked'),
    registryChecked:     grabCb('cl-registry-checked'),
    deedSighted:         grabCb('cl-deed-sighted'),
    fundActive:          grabCb('cl-abn-checked2'),
    // Risk
    risk:                effectiveRisk,
    riskOverride:        S._clientDraft.riskOverride||null,
    riskJust:            S._clientDraft.riskJust||'',
    // Monitoring
    ttr:                 'No',
    smr:                 'No',
    tippingAck:          grabCb('cl-tipping'),
    cddDate:             grab('cl-cdd-date-field') || S._clientDraft.cddDate || new Date().toISOString().split('T')[0],
    cddBy:               grab('cl-cdd-by') || '',
    updatedAt:           Date.now(),
    individuals:         inds
  };
  const editIdx = S._clientEditIdx;
  if (editIdx !== undefined && S.clients[editIdx]) {
    const old = JSON.parse(JSON.stringify(S.clients[editIdx]));
    // Preserve existing services array, update first entry service name if changed
    const existingServices = old.services || [];
    if (existingServices.length > 0 && newRecord.service) {
      existingServices[0].serviceName = newRecord.service;
      existingServices[0].dateProvided = existingServices[0].dateProvided || newRecord.cddDate;
    } else if (existingServices.length === 0 && newRecord.service) {
      existingServices.push({ serviceName: newRecord.service, dateProvided: newRecord.cddDate, newCddRequired: false });
    }
    newRecord.services = existingServices;
    const history = old.history || [];
    delete old.history;
    newRecord.history = [old, ...history];
    S.clients[editIdx] = newRecord;
    toast('Client record updated — previous version preserved');
  } else {
    newRecord.history = [];
    // Build initial services array from first service
    newRecord.services = newRecord.service ? [{ serviceName: newRecord.service, dateProvided: newRecord.cddDate, newCddRequired: false }] : [];
    S.clients.unshift(newRecord);
    toast('Client saved');
  }
  delete S._clientDraft; delete S._clientEditIdx;
  save(); go('clients');
};
