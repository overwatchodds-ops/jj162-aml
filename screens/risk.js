import { S, DS_LIST, PF_TEXT, save } from '../state/index.js';
import { complianceScore, autoServiceRiskFromChecks, autoClientRisk, autoGeoRisk, autoResidualRisk, autoOverallRisk } from '../logic/index.js';
import { ratingBadge, infoBtn, infoPop, ratingRow, toast} from '../components/index.js';

export function screen() {
  const sc = S.scope;
  const services = sc.services||[];
  const inScope = services.length > 0;
  const dsNone = !inScope && sc.noneConfirmed;
  const autoSR = autoServiceRiskFromChecks(sc.serviceChecks);
  const autoCR = autoClientRisk(sc.clientChecks);
  const autoGR = autoGeoRisk(sc.geoChecks);
  const pfR    = sc.pfRating||null;
  const autoOR = autoOverallRisk(
    sc.serviceRatingOverride || autoSR,
    sc.clientRatingOverride  || autoCR,
    sc.geoRatingOverride     || autoGR,
    pfR
  );
  const effectiveSR = sc.serviceRatingOverride || autoSR;
  const effectiveCR = sc.clientRatingOverride  || autoCR;
  const effectiveGR = sc.geoRatingOverride     || autoGR;
  const effectiveOR = sc.overallRatingOverride || autoOR;

  return `<div class="p-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Risk Assessment</h1>
      <p class="text-slate-400 text-sm mt-1">Work through each section top to bottom. Risk ratings are calculated automatically from your selections.</p>
    </div>

    <!-- SECTION 1 -->
    <div class="bg-white border rounded-xl p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
        <h2 class="text-sm font-bold text-slate-700">Designated services</h2>
        ${infoBtn('ds-tip')}
      </div>
      ${infoPop('ds-tip', `<strong class="text-indigo-300 block mb-2">Why your designated services matter</strong>
        What you tick here is the foundation of your entire compliance program. AUSTRAC uses your selections to determine:
        <ul class="mt-2 space-y-1.5">
          <li>✓ <strong>Whether you are a reporting entity</strong> — if none apply, you don't need to enrol</li>
          <li>✓ <strong>Your firm's inherent risk profile</strong> — automatically calculated below</li>
          <li>✓ <strong>What your Risk Assessment must cover</strong></li>
          <li>✓ <strong>What your AML/CTF Program must contain</strong></li>
          <li>✓ <strong>The level of CDD required for each client</strong></li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Tick every service you provide — no more, no less. Under-ticking leaves gaps in your program. Over-ticking creates obligations you don't need.</p>`)}
      <p class="text-xs text-slate-400">Tick every service your firm provides. Your risk ratings below are calculated automatically from these selections.</p>
      <div class="space-y-2">
        ${DS_LIST.map(ds=>`
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${services.includes(ds.id)?'bg-indigo-50 border-indigo-200':''}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${services.includes(ds.id)?'checked':''} onchange="toggleDs('${ds.id}',this)">
            <div><div class="text-sm font-medium">${ds.name}</div><div class="text-xs text-slate-400">${ds.desc}</div></div>
          </label>`).join('')}
        <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${dsNone?'bg-green-50 border-green-200':'bg-slate-50'}">
          <input type="checkbox" class="mt-0.5 flex-shrink-0" id="ds-none" ${dsNone?'checked':''} onchange="toggleDsNone(this)">
          <div><div class="text-sm font-medium text-slate-500">None of the above — my firm does not provide any designated services</div></div>
        </label>
      </div>
      ${dsNone ? `<div class="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700"><strong>Your firm does not appear to fall within scope.</strong> You do not need to enrol with AUSTRAC or complete an AML/CTF program. We recommend confirming this with your professional body (CPA Australia, CA ANZ or IPA).</div>` : ''}
      ${inScope ? `<div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2"><span>✓</span> Your firm provides designated services and must comply with AML/CTF obligations from 1 July 2026.</div>` : ''}
    </div>

    <!-- SECTION 2 -->
    <div class="bg-white border rounded-xl p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">2</span>
        <h2 class="text-sm font-bold text-slate-700">Service risk rating</h2>
        ${infoBtn('sr-tip')}
      </div>
      ${infoPop('sr-tip', `<strong class="text-indigo-300 block mb-2">How service risk is calculated</strong>
        Different designated services carry different levels of ML/TF risk. AUSTRAC considers:
        <ul class="mt-2 space-y-1.5">
          <li>🔴 <strong>High risk:</strong> Holding client funds, acting as nominee, shelf companies — these give criminals the most opportunity to hide illicit money</li>
          <li>🟡 <strong>Medium risk:</strong> Real estate, trust/company creation, financing — complex structures that can obscure ownership</li>
          <li>🟢 <strong>Low risk:</strong> Providing a registered office address — administrative only, limited exposure</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Your rating is calculated automatically from Section 1. You may override it — but you'll need to explain why your professional judgement differs. An auditor will scrutinise any downgrade.</p>`)}
      <p class="text-xs text-slate-400">Tick the services you actually perform that carry higher ML/TF risk. <strong>These checkboxes drive the service risk rating below</strong> — Section 1 determined scope, this section determines the risk level.</p>
      <div class="space-y-2">
        ${[
          ['sr-funds','Receiving, holding or managing client funds','Trust accounts, client money — highest ML/TF risk','High'],
          ['sr-nominee','Acting as nominee director / shareholder / trustee','Firm appears as controller on behalf of client — high risk','High'],
          ['sr-shelf','Selling or transferring a shelf company','Pre-registered companies can be used to obscure ownership','High'],
          ['sr-property','Assisting with real estate transactions','Property is a common vehicle for money laundering','Medium'],
          ['sr-structures','Creating or restructuring companies / trusts','Complex structures can obscure beneficial ownership','Medium'],
          ['sr-finance','Equity or debt financing arrangements','Capital raising and loan structuring','Medium'],
          ['sr-bodycorp','Sale or transfer of a body corporate','Transfer of control over legal arrangements','Medium'],
        ].map(([id,name,desc,level])=>`
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${(sc.serviceChecks||[]).includes(id)?(level==='High'?'bg-red-50 border-red-200':'bg-amber-50 border-amber-200'):''}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${(sc.serviceChecks||[]).includes(id)?'checked':''} onchange="toggleCheck('serviceChecks','${id}',this)">
            <div class="flex-1"><div class="text-sm font-medium">${name}</div><div class="text-xs text-slate-400">${desc}</div></div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${level==='High'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}">${level}</span>
          </label>`).join('')}
      </div>
      <div id='rating-sr'>${ratingRow('Service risk rating', autoSR, sc.serviceRatingOverride, 'serviceRatingOverride', 'serviceRatingJust')}</div>
    </div>

    <!-- SECTION 3 -->
    <div class="bg-white border rounded-xl p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">3</span>
        <h2 class="text-sm font-bold text-slate-700">Client risk profile</h2>
        ${infoBtn('cr-tip')}
      </div>
      ${infoPop('cr-tip', `<strong class="text-indigo-300 block mb-2">How client risk is calculated</strong>
        Who your clients are directly determines the level of CDD you must apply. AUSTRAC considers:
        <ul class="mt-2 space-y-1.5">
          <li>🔴 <strong>High risk:</strong> International clients or cash-intensive businesses — harder to verify, more exposure to criminal activity</li>
          <li>🟡 <strong>Medium risk:</strong> Trusts and companies — require beneficial ownership assessment and ongoing monitoring</li>
          <li>🟢 <strong>Low risk:</strong> Local individuals and standard SMEs — straightforward identity verification usually sufficient</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">This rating shapes the CDD procedures you document in your AML/CTF Program. A higher rating means more rigorous checks and more frequent reviews.</p>`)}
      <p class="text-xs text-slate-400">Tick every client type your firm typically serves.</p>
      <div class="space-y-2">
        ${[
          ['cr-individuals','Local individuals / PAYG employees','Standard tax clients','Low'],
          ['cr-sme','SMEs in common industries','Standard Australian businesses','Low'],
          ['cr-trusts','Trusts and companies','Require beneficial ownership assessment','Medium'],
          ['cr-international','International clients or overseas connections','Significantly increases ML/TF risk','High'],
          ['cr-cash','Cash-intensive industries','Hospitality, retail, construction — higher risk','High'],
        ].map(([id,name,desc,level])=>`
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${(sc.clientChecks||[]).includes(id)?(level==='High'?'bg-red-50 border-red-200':level==='Medium'?'bg-amber-50 border-amber-200':'bg-green-50 border-green-200'):''}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${(sc.clientChecks||[]).includes(id)?'checked':''} onchange="toggleCheck('clientChecks','${id}',this)">
            <div class="flex-1"><div class="text-sm font-medium">${name}</div><div class="text-xs text-slate-400">${desc}</div></div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${level==='High'?'bg-red-100 text-red-700':level==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${level}</span>
          </label>`).join('')}
      </div>
      <div id='rating-cr'>${ratingRow('Client base risk rating', autoCR, sc.clientRatingOverride, 'clientRatingOverride', 'clientRatingJust')}</div>
    </div>

    <!-- SECTION 4 -->
    <div class="bg-white border rounded-xl p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">4</span>
        <h2 class="text-sm font-bold text-slate-700">Geographic risk</h2>
        ${infoBtn('gr-tip')}
      </div>
      ${infoPop('gr-tip', `<strong class="text-indigo-300 block mb-2">Why geography matters</strong>
        Where your clients are based affects how easily you can verify their identity and the source of their funds. AUSTRAC considers:
        <ul class="mt-2 space-y-1.5">
          <li>🔴 <strong>High risk:</strong> Clients linked to FATF high-risk or sanctioned jurisdictions — mandatory enhanced CDD</li>
          <li>🟡 <strong>Medium risk:</strong> Clients with overseas connections — international flows are harder to trace</li>
          <li>🟢 <strong>Low risk:</strong> All clients Australia-based — domestic transactions are easiest to verify</li>
        </ul>
        <a href="https://www.fatf-gafi.org/en/topics/high-risk-and-other-monitored-jurisdictions.html" target="_blank" class="text-indigo-300 underline mt-2 block">Check the FATF high-risk list →</a>`)}
      <p class="text-xs text-slate-400">Where are your clients based?</p>
      <div class="space-y-2">
        ${[
          ['gr-australia','All clients Australia-based','No international exposure','Low'],
          ['gr-interstate','Some interstate clients','Still domestic — minimal additional risk','Low'],
          ['gr-overseas','Some clients with overseas connections','International flows harder to verify','Medium'],
          ['gr-highrisk','Clients linked to FATF high-risk jurisdictions','Mandatory enhanced CDD required','High'],
        ].map(([id,name,desc,level])=>`
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${(sc.geoChecks||[]).includes(id)?(level==='High'?'bg-red-50 border-red-200':level==='Medium'?'bg-amber-50 border-amber-200':'bg-blue-50 border-blue-200'):''}">
            <input type="checkbox" class="mt-0.5 flex-shrink-0" ${(sc.geoChecks||[]).includes(id)?'checked':''} onchange="toggleCheck('geoChecks','${id}',this)">
            <div class="flex-1"><div class="text-sm font-medium">${name}</div><div class="text-xs text-slate-400">${desc}</div></div>
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${level==='High'?'bg-red-100 text-red-700':level==='Medium'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}">${level}</span>
          </label>`).join('')}
      </div>
      <div id='rating-gr'>${ratingRow('Geographic risk rating', autoGR, sc.geoRatingOverride, 'geoRatingOverride', 'geoRatingJust')}</div>
    </div>

    <!-- SECTION 5 -->
    <div class="bg-white border rounded-xl p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">5</span>
        <h2 class="text-sm font-bold text-slate-700">Proliferation financing (PF) risk</h2>
        ${infoBtn('pf-tip')}
      </div>
      ${infoPop('pf-tip', `<strong class="text-indigo-300 block mb-2">What is proliferation financing?</strong>
        Proliferation financing is the funding of weapons of mass destruction — nuclear, chemical, biological or radiological weapons.
        <p class="mt-2">AUSTRAC requires <strong>all reporting entities</strong> to formally assess and document their PF exposure — even if it is zero. For most small accounting firms serving Australian SMEs, this risk is negligible.</p>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">Select Low unless you have clients with connections to defence, dual-use goods, or sanctioned jurisdictions. An auto-filled commentary will appear for your program documentation.</p>`)}
      <div>
        <label class="text-xs text-slate-500">PF risk rating</label>
        <select class="inp mt-1" onchange="setPfRating(this.value)">
          <option value="">— Select —</option>
          <option value="Low" ${sc.pfRating==='Low'?'selected':''}>Low — no known exposure to weapons proliferation or sanctioned jurisdictions</option>
          <option value="Medium" ${sc.pfRating==='Medium'?'selected':''}>Medium — some international or higher-risk client exposure</option>
          <option value="High" ${sc.pfRating==='High'?'selected':''}>High — direct exposure to high-risk jurisdictions or complex international structures</option>
        </select>
      </div>
      ${sc.pfRating ? `
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs text-slate-500">PF commentary</label>
            <span class="text-xs text-slate-400 italic">${sc.pfText && sc.pfText !== PF_TEXT[sc.pfRating] ? 'Edited' : 'Auto-filled — you may edit'}</span>
          </div>
          <textarea class="inp text-xs" rows="3" onchange="scopeField('pfText',this.value)">${sc.pfText||PF_TEXT[sc.pfRating]||''}</textarea>
        </div>` : ''}
    </div>

    <!-- SECTION 6 -->
    <div class="bg-white border rounded-xl p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">6</span>
        <h2 class="text-sm font-bold text-slate-700">Risk appetite statement</h2>
        ${infoBtn('ra-tip')}
      </div>
      ${infoPop('ra-tip', `<strong class="text-indigo-300 block mb-2">What is a risk appetite statement?</strong>
        Your risk appetite is your firm's internal policy on what clients and transactions you are willing to accept. It is the bridge between your risk assessment and your day-to-day CDD decisions.
        <ul class="mt-2 space-y-1.5">
          <li>✓ It tells your staff when to apply standard checks vs enhanced CDD</li>
          <li>✓ It tells your staff when to escalate to the AMLCO</li>
          <li>✓ It tells your staff when to decline a client entirely</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">AUSTRAC expects this to be documented so it can be applied consistently. An independent evaluator will check that your actual CDD decisions are consistent with what you write here.</p>`)}
      <p class="text-xs text-slate-400">Based on your ratings above, document what your firm will and will not accept — and what controls apply to higher-risk clients.</p>
      <textarea class="inp" rows="5" onchange="scopeField('riskAppetite',this.value)" placeholder="e.g. Our firm provides tax compliance and advisory services to Australian SMEs and individuals. We accept clients with Low to Medium ML/TF risk profiles. We apply enhanced CDD for High Risk clients or those with international connections. We will not act for clients involving high-value cash transactions, anonymous structures, or clients from FATF high-risk jurisdictions. All clients are screened against sanctions lists on onboarding.">${sc.riskAppetite||''}</textarea>
    </div>

    <!-- PHASE 1 SAVE -->
    <div class="bg-white border rounded-xl p-5 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-slate-700">Inherent risk rating</div>
          <div class="text-xs text-slate-400 mt-1">Your inherent risk — before any controls are applied.</div>
        </div>
        <div id="rating-or">${ratingRow('', autoOR, sc.overallRatingOverride, 'overallRatingOverride', 'overallRatingJust')}</div>
      </div>
      ${autoOR ? `<div class="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
        <strong>Why this rating:</strong>
        ${[
          ((sc.serviceChecks||[]).includes('sr-funds')||(sc.serviceChecks||[]).includes('sr-nominee')||(sc.serviceChecks||[]).includes('sr-shelf')) ? '· High-risk designated service selected (client funds, nominee shareholder, or shelf company)' : '',
          ((sc.clientChecks||[]).includes('cr-international')||(sc.clientChecks||[]).includes('cr-cash')) ? '· Client base includes international clients or cash-intensive businesses' : '',
          (sc.geoChecks||[]).includes('gr-highrisk') ? '· Clients in FATF high-risk jurisdictions' : '',
          (sc.geoChecks||[]).includes('gr-overseas') ? '· Clients with overseas connections' : '',
          (sc.pfRating==='High'||sc.pfRating==='Medium') ? '· Proliferation financing risk rated '+sc.pfRating : '',
          (sc.clientChecks||[]).includes('cr-trusts') ? '· Client base includes trusts or complex structures' : '',
          ((sc.serviceChecks||[]).includes('sr-property')||(sc.serviceChecks||[]).includes('sr-structures')||(sc.serviceChecks||[]).includes('sr-finance')||(sc.serviceChecks||[]).includes('sr-bodycorp')) ? '· Medium-risk designated service selected' : ''
        ].filter(Boolean).map(r=>`<span class="block mt-0.5">${r}</span>`).join('') || '<span class="block mt-0.5">· Complete your risk selections above to see the reasoning here.</span>'}
      </div>` : ''}
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-slate-500">Assessment date</label><input type="date" class="inp mt-1" value="${sc.assessDate||''}" onchange="scopeField('assessDate',this.value);autoSetRiskReview(this.value)"></div>
        <div><label class="text-xs text-slate-500">Next review date <span class="text-indigo-400 font-normal">(auto-set to +1 year)</span></label><input id="risk-next-review" type="date" class="inp mt-1" value="${sc.nextReview||''}" onchange="scopeField('nextReview',this.value)"></div>
      </div>
      <button onclick="saveRiskPhase1()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Save Risk Assessment</button>
    </div>

    <!-- SECTION 7 — PHASE 2 (locked until program built) -->
    ${(()=>{
      const programDone = !!(S.program.approvedBy);
      const staffDone   = S.staff.length > 0;
      const trainingDone = S.training.length > 0;
      const phase2Ready = programDone && staffDone && trainingDone;

      // Auto-derive controls from app data
      const autoCtrls = [];
      if (S.training.length > 0)                              autoCtrls.push('ctrl-training');
      if (S.clients.some(c => c.individuals && c.individuals.some(i => i.idType))) autoCtrls.push('ctrl-dvs');
      if (S.clients.some(c => c.individuals && c.individuals.some(i => i.screenResult))) autoCtrls.push('ctrl-screening');
      if ((S.firm.appt||{}).amlco?.name)                     autoCtrls.push('ctrl-amlco');
      if (S.program.nextReview)                               autoCtrls.push('ctrl-review');
      if (S.clients.length > 0)                               autoCtrls.push('ctrl-ongoing');

      if (!phase2Ready) return `
        <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-3">
          <div class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 text-sm font-bold">7</div>
          <div class="text-sm font-bold text-slate-500">Controls &amp; residual risk — complete after building your program</div>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">This section can only be completed honestly once your AML/CTF program is operational. Controls must be declared based on what your firm actually does — not what you plan to do.</p>
          <div class="text-xs text-slate-400 space-y-1 mt-2">
            ${!programDone ? '<div class="flex items-center justify-center gap-2"><span class="text-amber-400">○</span> Complete AML/CTF Program</div>' : '<div class="flex items-center justify-center gap-2"><span class="text-green-500">✓</span> AML/CTF Program done</div>'}
            ${!staffDone   ? '<div class="flex items-center justify-center gap-2"><span class="text-amber-400">○</span> Add staff vetting records</div>' : '<div class="flex items-center justify-center gap-2"><span class="text-green-500">✓</span> Staff vetting done</div>'}
            ${!trainingDone? '<div class="flex items-center justify-center gap-2"><span class="text-amber-400">○</span> Add training records</div>' : '<div class="flex items-center justify-center gap-2"><span class="text-green-500">✓</span> Training records done</div>'}
          </div>
        </div>`;

      const effectiveControls = sc.controls && sc.controls.length ? sc.controls : autoCtrls;
      const residualRisk = autoResidualRisk(autoOR || sc.overallRatingOverride, effectiveControls);

      return `
        <div class="bg-white border-2 border-green-200 rounded-xl p-5 space-y-5">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">7</span>
            <h2 class="text-sm font-bold text-slate-700">Controls &amp; residual risk</h2>
            ${infoBtn('ctrl-tip')}
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold ml-auto">Unlocked</span>
          </div>
          ${infoPop('ctrl-tip', `<strong class="text-indigo-300 block mb-2">Controls reduce inherent risk to residual risk</strong>
            This is the mathematical heart of your risk assessment. Each control you have implemented reduces your firm's exposure.
            <ul class="mt-2 space-y-1.5">
              <li>✓ Controls are only shown as implemented if your app records prove it</li>
              <li>✓ An independent evaluator will ask you to evidence each ticked control</li>
              <li>✓ Your residual risk rating is calculated from your inherent risk minus effective controls</li>
            </ul>
            <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">This is what an auditor reads: "The firm's residual risk is [X] because inherent risk is [Y] and the following controls are operational."</p>`)}

          <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            Controls below are auto-derived from your activity in SimpleAML. Tick any additional controls your firm has in place that are not yet reflected.
          </div>

          <div class="space-y-2">
            ${[
              ['ctrl-training','Annual AML/CTF staff training','Evidenced by your Training Register'],
              ['ctrl-dvs','DVS identity verification for all clients','Evidenced by client CDD records'],
              ['ctrl-screening','Sanctions / PEP screening on onboarding','Evidenced by NameScan records in client CDD'],
              ['ctrl-amlco','AMLCO oversight of all CDD decisions','Evidenced by your AMLCO appointment'],
              ['ctrl-review','Annual program review','Evidenced by your program next review date'],
              ['ctrl-ongoing','Ongoing client monitoring for changes in risk','Evidenced by your client register activity'],
            ].map(([id,label,evidence])=>{
              const autoTicked = autoCtrls.includes(id);
              const manualTicked = (sc.controls||[]).includes(id);
              const ticked = autoTicked || manualTicked;
              return `<div class="flex items-start gap-3 p-3 border rounded-lg ${ticked?'bg-green-50 border-green-200':''}">
                <input type="checkbox" class="mt-0.5 flex-shrink-0" ${ticked?'checked':''} ${autoTicked?'disabled':''} onchange="toggleCheck('controls','${id}',this)">
                <div class="flex-1">
                  <div class="text-sm font-medium ${ticked?'text-green-800':'text-slate-600'}">${label}</div>
                  <div class="text-xs ${autoTicked?'text-green-600':'text-slate-400'}">${autoTicked ? '✓ Auto-detected: ' : ''}${evidence}</div>
                </div>
                ${autoTicked ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Verified</span>' : ''}
              </div>`;
            }).join('')}
          </div>

          <textarea class="inp text-xs" rows="2" placeholder="Any additional controls specific to your practice..." onchange="scopeField('controlsNotes',this.value)">${sc.controlsNotes||''}</textarea>

          <div class="border rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Residual risk rating</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400">Calculated:</span>
                <span class="text-xs font-bold px-3 py-1 rounded-full ${residualRisk==='High'?'bg-red-100 text-red-700':residualRisk==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}">${residualRisk}</span>
              </div>
            </div>
            <p class="text-xs text-slate-400">Inherent risk (${autoOR||'not set'}) reduced by ${effectiveControls.length} operational control${effectiveControls.length!==1?'s':''}.</p>
          </div>

          <button onclick="saveRiskPhase2()" class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">Finalise Risk Assessment</button>
        </div>`;
    })()}
  </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.toggleDs = function(id, cb) {
  if (!S.scope.services) S.scope.services = [];
  if (cb.checked) { if (!S.scope.services.includes(id)) S.scope.services.push(id); S.scope.noneConfirmed = false; }
  else { S.scope.services = S.scope.services.filter(s => s !== id); }
  save(); renderRiskRatings();
};

window.toggleDsNone = function(cb) {
  if (cb.checked) { S.scope.services = []; S.scope.noneConfirmed = true; }
  else { S.scope.noneConfirmed = false; }
  save(); go('risk');
};

window.scopeField = function(key, val) { S.scope[key] = val; save(); };
window.toggleCheck = function(key, id, cb) {
  if (!S.scope[key]) S.scope[key] = [];
  if (cb.checked) { if (!S.scope[key].includes(id)) S.scope[key].push(id); }
  else { S.scope[key] = S.scope[key].filter(x => x !== id); }
  // Clear the corresponding override so auto-calculation shows through
  if (key === 'serviceChecks') delete S.scope.serviceRatingOverride;
  if (key === 'clientChecks')  delete S.scope.clientRatingOverride;
  if (key === 'geoChecks')     delete S.scope.geoRatingOverride;
  // Recalculate and clear overall override too so it reflects latest sub-ratings
  delete S.scope.overallRatingOverride;
  save(); renderRiskRatings();
};
window.setPfRating = function(val) { S.scope.pfRating = val; if (!S.scope.pfText) S.scope.pfText = PF_TEXT[val]||''; save(); go('risk'); };
window.startOverride = function(overrideKey, justKey) {
  const auto = overrideKey === 'serviceRatingOverride' ? autoServiceRiskFromChecks(S.scope.serviceChecks)
             : overrideKey === 'clientRatingOverride'  ? autoClientRisk(S.scope.clientChecks)
             : overrideKey === 'geoRatingOverride'     ? autoGeoRisk(S.scope.geoChecks)
             : autoOverallRisk(
                 S.scope.serviceRatingOverride || autoServiceRiskFromChecks(S.scope.serviceChecks),
                 S.scope.clientRatingOverride  || autoClientRisk(S.scope.clientChecks),
                 S.scope.geoRatingOverride     || autoGeoRisk(S.scope.geoChecks),
                 S.scope.pfRating
               );
  const val = prompt('Override rating (Low / Medium / High). Auto-calculated: ' + (auto||'N/A') + '\n\nNote: An auditor will scrutinise any downgrade. A justification is required.');
  if (!val) return;
  const clean = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  if (!['Low','Medium','High'].includes(clean)) { alert('Please enter Low, Medium or High'); return; }
  S.scope[overrideKey] = clean;
  save(); go('risk');
};
window.clearOverride = function(overrideKey, justKey) {
  delete S.scope[overrideKey]; delete S.scope[justKey]; save(); go('risk');
};
window.renderRiskRatings = function() {
  var sc = S.scope;
  var services = sc.services||[];
  var autoSR = autoServiceRiskFromChecks(sc.serviceChecks);
  var autoCR = autoClientRisk(sc.clientChecks);
  var autoGR = autoGeoRisk(sc.geoChecks);
  var autoOR = autoOverallRisk(
    sc.serviceRatingOverride || autoSR,
    sc.clientRatingOverride  || autoCR,
    sc.geoRatingOverride     || autoGR,
    sc.pfRating
  );
  var effectiveSR = sc.serviceRatingOverride || autoSR;
  var effectiveCR = sc.clientRatingOverride  || autoCR;
  var effectiveGR = sc.geoRatingOverride     || autoGR;
  var effectiveOR = sc.overallRatingOverride || autoOR;

  // Update ds-count badge
  var dsc = document.getElementById('ds-count');
  if (dsc) dsc.textContent = services.length + ' selected';

  // Update each rating row in place
  updateRatingEl('rating-sr', autoSR, sc.serviceRatingOverride);
  updateRatingEl('rating-cr', autoCR, sc.clientRatingOverride);
  updateRatingEl('rating-gr', autoGR, sc.geoRatingOverride);
  updateRatingEl('rating-or', autoOR, sc.overallRatingOverride);

  // Update checkbox highlight colours
  updateCheckHighlights();
};
function updateRatingEl(id, auto, override) {
  var el = document.getElementById(id);
  if (!el) return;
  var rating = override || auto;
  if (!rating) { el.innerHTML = '<span class="text-xs text-slate-400 italic">Complete selections above</span>'; return; }
  var cls = rating==='High' ? 'bg-red-100 text-red-700' : rating==='Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
  var html = '<span class="text-xs text-slate-400">Auto-calculated:</span> <span class="text-xs font-bold px-3 py-1 rounded-full ' + cls + '">' + rating + '</span>';
  if (override) {
    html = '<span class="text-xs font-bold px-3 py-1 rounded-full ' + cls + '">' + rating + '</span> <span class="text-xs text-amber-600">(override)</span>';
  }
  el.innerHTML = html;
}
function updateCheckHighlights() {
  // Re-colour ticked checkboxes without re-render
  // Not needed if we just update the rating rows
}
window.saveRiskPhase1 = function() {
  const calcRating = autoOverallRisk(
    S.scope.serviceRatingOverride || autoServiceRiskFromChecks(S.scope.serviceChecks),
    S.scope.clientRatingOverride  || autoClientRisk(S.scope.clientChecks),
    S.scope.geoRatingOverride     || autoGeoRisk(S.scope.geoChecks),
    S.scope.pfRating
  );
  if (!calcRating && !S.scope.noneConfirmed) { toast('Complete sections 1-6 before saving','err'); return; }
  // Persist the effective rating so complianceScore can read it
  S.scope.overallRating = S.scope.overallRatingOverride || calcRating || 'Low';
  save(); toast('Risk assessment saved'); go('dashboard');
};
window.saveRiskPhase2 = function() {
  S.scope.phase2Complete = true;
  save(); toast('Risk assessment finalised — residual risk recorded'); go('dashboard');
};
window.saveRisk = function() { saveRiskPhase1(); };
