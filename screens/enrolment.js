import { S, save } from '../state/index.js';
import { infoBtn, infoPop, ratingBadge, toast} from '../components/index.js';

export function screen() {
  const e = S.enrolment;
  const sc = S.scope;

  // Auto-derive which controls are evidenced by app activity
  const autoCtrls = {
    'ctrl-program':   !!(S.program.approvedBy && S.program.approvedDate),
    'ctrl-amlco':     !!(S.firm.appt && S.firm.appt.amlco && S.firm.appt.amlco.name),
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

// CLIENT REGISTER
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.enrolField = function(key, val) { S.enrolment[key] = val; save(); };
window.toggleEnrolControl = function(id, checked) {
  if (!S.enrolment.controls) S.enrolment.controls = [];
  if (checked) { if (!S.enrolment.controls.includes(id)) S.enrolment.controls.push(id); }
  else { S.enrolment.controls = S.enrolment.controls.filter(x => x !== id); }
  save(); go('enrolment');
};
window.saveEnrolment = function() { save(); toast('Enrolment record saved'); go('dashboard'); };
