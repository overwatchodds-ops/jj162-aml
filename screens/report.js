import { S, save } from '../state/index.js';

export function screen() {
  const reportHistory = S.report?.history || [];
  const storageLocation = S.report?.storageLocation || '';
  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div>
        <h1 class="text-2xl font-bold">AML/CTF Compliance Report</h1>
        <p class="text-slate-400 text-sm mt-1">Generate a summary of your firm's AML/CTF compliance records to assist in completing AUSTRAC's Compliance Report when requested.</p>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
        AUSTRAC requires reporting entities to submit a Compliance Report when requested (typically annually). This report helps you prepare the required information. <strong>It is not submitted to AUSTRAC directly.</strong>
        Your live compliance status is always visible on the <button onclick="go('dashboard')" class="underline font-semibold text-indigo-600 bg-transparent border-0 cursor-pointer p-0">Dashboard</button>.
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">What this report contains</h2>
        <div class="space-y-1 text-xs text-slate-500">
          ${['1. Firm profile — practice details and compliance appointments','2. AML/CTF risk assessment — designated services, inherent risk ratings, risk appetite','3. AML/CTF Program — documents, approval history','4. AUSTRAC enrolment — controls declaration, residual risk, enrolment details','5. Staff assessment & vetting — Key Personnel, fit & proper checks','6. AML/CTF training register — training records for AML/CTF staff','7. Client register — CDD status, entity types, new/ongoing/dormant summary','8. SMR & incident register — suspicious matter reports and threshold transactions'].map(item=>`<div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0">→</span>${item}</div>`).join('')}
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
        <strong>SimpleAML is your AML/CTF compliance register.</strong> By generating this report you confirm that you have sighted all underlying evidence documents and stored copies in your firm's records. This report must be retained for 7 years from the date of generation as required under the AML/CTF Act 2006.
      </div>

      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Report storage location <span class="normal-case font-normal text-slate-400 ml-1">(optional)</span></h2>
        <p class="text-xs text-slate-400">Record where you have saved the downloaded PDF — e.g. SharePoint, Google Drive, or a shared folder. This appears in your generation history below.</p>
        <input type="text" class="inp text-xs" placeholder="e.g. SharePoint > Compliance > AML Reports > 2026" value="${storageLocation}" oninput="reportField('storageLocation',this.value)">
      </div>

      <button onclick="generateReport()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">Generate AML/CTF Compliance Report (PDF)</button>
      <p class="text-xs text-slate-400 text-center">This document summarises your AML/CTF records to assist with AUSTRAC's Compliance Report. It is not submitted to AUSTRAC.</p>

      ${reportHistory.length > 0 ? `
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Generation history</h2>
        <p class="text-xs text-slate-400">A log of when this report was generated and where it was saved. You can remove any entry.</p>
        <div class="space-y-1">
          ${reportHistory.map((h,i)=>`
            <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
              <div>
                <div class="text-xs font-semibold text-slate-700">${h.date}</div>
                ${h.location ? `<div class="text-xs text-slate-400 mt-0.5">Stored: ${h.location}</div>` : `<div class="text-xs text-slate-400 italic mt-0.5">Storage location not recorded</div>`}
              </div>
              <button onclick="deleteReportHistory(${i})" class="text-xs text-slate-300 hover:text-red-500 transition flex-shrink-0">Remove</button>
            </div>`).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.deleteReportHistory = function(i) {
  if (!S.report || !S.report.history) return;
  S.report.history.splice(i, 1);
  save();
  go('report');
};
window.exportData = function() {
  const data = JSON.stringify(localStorage);
  const date = new Date().toISOString().split('T')[0];
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'simpleaml-backup-' + date + '.json';
  a.click();
  URL.revokeObjectURL(url);
};
window.importData = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.clear();
      for (const key in data) { localStorage.setItem(key, data[key]); }
      location.reload();
    } catch(err) {
      alert('Import failed — file may be corrupted or not a valid SimpleAML backup.');
    }
  };
  reader.readAsText(file);
};
window.reportField = function(key, val) {
  if (!S.report) S.report = {};
  S.report[key] = val;
  save();
};

window.generatePDF = window.generateReport = function() {
  // Snapshot storage location from DOM in case oninput hasn't fired
  if (!S.report) S.report = {};
  const locEl = document.querySelector('.inp.text-xs[placeholder*="SharePoint"]');
  if (locEl && locEl.value) S.report.storageLocation = locEl.value;
  if (!S.report.history) S.report.history = [];
  S.report.history.unshift({
    date: new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}),
    location: S.report.storageLocation || ''
  });
  save();

  // Build report HTML from S — pure state, no DOM reading
  const f = S.firm;
  const sc = S.scope;
  const p = S.program;
  const e = S.enrolment;
  const generated = new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});

  const autoSR = autoServiceRiskFromChecks(sc.serviceChecks);
  const autoCR = autoClientRisk(sc.clientChecks);
  const autoGR = autoGeoRisk(sc.geoChecks);
  const autoOR = autoOverallRisk(
    sc.serviceRatingOverride || autoSR,
    sc.clientRatingOverride  || autoCR,
    sc.geoRatingOverride     || autoGR,
    sc.pfRating
  );
  const inherentRisk = sc.overallRatingOverride || autoOR || '—';

  const th = (cols) => `<tr>${cols.map(c=>`<th style="text-align:left;padding:6px 8px;background:#f1f5f9;border-bottom:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#475569;">${c}</th>`).join('')}</tr>`;
  const tr = (cols, shade) => `<tr style="${shade?'background:#f8fafc':'background:#fff'}">${cols.map(c=>`<td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1e293b;vertical-align:top;">${c||'—'}</td>`).join('')}</tr>`;
  const section = (num, title) => `<div style="margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid #1e293b;display:flex;align-items:baseline;gap:10px;"><span style="font-size:11px;font-weight:700;color:#6366f1;">${num}</span><span style="font-size:15px;font-weight:700;color:#0f172a;">${title}</span></div>`;
  const field = (label, value) => `<div style="display:flex;gap:8px;margin-bottom:4px;font-size:11px;"><span style="color:#64748b;min-width:160px;flex-shrink:0;">${label}</span><span style="color:#0f172a;font-weight:500;">${value||'—'}</span></div>`;
  const badge = (val) => { const c = val==='High'?'#dc2626':val==='Medium'?'#d97706':'#16a34a'; return val?`<span style="background:${c}20;color:${c};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">${val}</span>`:'—'; };
  const na = (val) => val||'Not recorded';

  // ── SECTION 1: FIRM PROFILE ──────────────────────────────────────────────
  const appt = f.appt || {};
  const apptRows = [
    ['AML/CTF Compliance Officer', appt.amlco?.name, appt.amlco?.date],
    ['Reporting Officer',          appt.reporting?.name, appt.reporting?.date],
    ['Senior Manager',             appt.senior?.name, appt.senior?.date],
    ['Principal / Managing Partner',appt.principal2?.name, appt.principal2?.date],
    ['Delegate',                   appt.delegate?.name, appt.delegate?.date],
  ].filter(r => r[1]);

  const sec1 = section('1','Firm Profile') + `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:12px;">
      ${field('Firm name', f.name)}${field('ABN', f.abn)}
      ${field('ACN', f.acn)}${field('Practice type', f.type)}
      ${field('Address', [f.address,f.suburb,f.state].filter(Boolean).join(', '))}${field('Principal contact', f.principal)}
      ${field('Email', f.email)}${field('Phone', f.phone)}
    </div>
    <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;">Compliance Appointments</div>
    <table style="width:100%;border-collapse:collapse;">
      ${th(['Role','Name','Date Appointed'])}
      ${apptRows.map((r,i)=>tr([r[0],r[1],r[2]],i%2)).join('')}
      ${!apptRows.length ? tr(['No appointments recorded','','']) : ''}
    </table>`;

  // ── SECTION 2: RISK ASSESSMENT ───────────────────────────────────────────
  const dsTicked = (sc.services||[]).map(id => DS_LIST.find(d=>d.id===id)?.name).filter(Boolean);
  const sec2 = section('2','Risk Assessment') + `
    <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;">Designated Services</div>
    ${sc.noneConfirmed
      ? `<p style="font-size:11px;color:#16a34a;font-weight:600;">Confirmed: Firm does not provide designated services — not in scope.</p>`
      : dsTicked.length
        ? `<ul style="margin:0 0 12px;padding-left:16px;">${dsTicked.map(n=>`<li style="font-size:11px;color:#1e293b;margin-bottom:2px;">${n}</li>`).join('')}</ul>`
        : `<p style="font-size:11px;color:#94a3b8;">No designated services recorded.</p>`
    }
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:12px;">
      ${field('Service risk', `${badge(sc.serviceRatingOverride||autoSR)} ${sc.serviceRatingOverride?'<span style="font-size:10px;color:#d97706;">(override)</span>':''}`)}
      ${field('Client risk', `${badge(sc.clientRatingOverride||autoCR)} ${sc.clientRatingOverride?'<span style="font-size:10px;color:#d97706;">(override)</span>':''}`)}
      ${field('Geographic risk', `${badge(sc.geoRatingOverride||autoGR)} ${sc.geoRatingOverride?'<span style="font-size:10px;color:#d97706;">(override)</span>':''}`)}
      ${field('PF risk', badge(sc.pfRating))}
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px;margin-bottom:10px;">
      ${field('Inherent risk rating', badge(inherentRisk))}
      ${sc.overallRatingOverride ? field('Override justification', sc.overallRatingJust||'No justification recorded') : ''}
    </div>
    ${sc.serviceRatingOverride ? `<p style="font-size:10px;color:#d97706;margin-bottom:4px;">Service override justification: ${sc.serviceRatingJust||'None provided'}</p>` : ''}
    ${sc.clientRatingOverride  ? `<p style="font-size:10px;color:#d97706;margin-bottom:4px;">Client override justification: ${sc.clientRatingJust||'None provided'}</p>` : ''}
    ${sc.geoRatingOverride     ? `<p style="font-size:10px;color:#d97706;margin-bottom:4px;">Geographic override justification: ${sc.geoRatingJust||'None provided'}</p>` : ''}
    ${sc.pfText ? `<div style="margin-bottom:10px;">${field('PF commentary', sc.pfText)}</div>` : ''}
    ${sc.riskAppetite ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px;margin-bottom:10px;"><div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:4px;">Risk Appetite Statement</div><p style="font-size:11px;color:#1e293b;line-height:1.6;">${sc.riskAppetite}</p></div>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;">
      ${field('Assessment date', sc.assessDate)}${field('Next review date', sc.nextReview)}
    </div>`;

  // ── SECTION 3: AML/CTF PROGRAM ──────────────────────────────────────────
  const docNames = {pola:'AML/CTF Program — Part A',polb:'AML/CTF Program — Part B',polra:'Risk Assessment Document',polcdd:'CDD Policy & Process',poltr:'Training Policy'};
  const docRows = Object.entries(docNames).map(([id,name],i) => tr([name, (p.docNotes||{})[id]||'Location not recorded'],i%2));
  const approvalHistory = p.approvalHistory||[];
  const sec3 = section('3','AML/CTF Program') + `
    <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;">Program Documents</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
      ${th(['Document','Storage Location'])}
      ${docRows.join('')}
    </table>
    <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;">Current Approval</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:10px;">
      ${field('Approved by', p.approvedBy)} ${field('Title', p.approvedTitle)}
      ${field('Approval date', p.approvedDate)} ${field('Version', p.version)}
      ${field('Next review date', p.nextReview)} ${field('Governing body notified', p.notified)}
    </div>
    ${approvalHistory.length > 0 ? `
    <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;">Approval History</div>
    <table style="width:100%;border-collapse:collapse;">
      ${th(['Date','Approved By','Version','Next Review'])}
      ${approvalHistory.map((v,i)=>tr([v.approvedDate,v.approvedBy+(v.approvedTitle?' ('+v.approvedTitle+')':''),v.version,v.nextReview],i%2)).join('')}
    </table>` : ''}`;

  // ── SECTION 4: STAFF ASSESSMENT & VETTING ──────────────────────────────
  const isActive = st => !st.status || st.status === 'Active' || st.status === 'On Leave';
  const rptKeyStaff  = S.staff.filter(st => st.classification === 'Key Personnel' && isActive(st));
  const rptStdStaff  = S.staff.filter(st => st.classification === 'Standard AML/CTF Staff' && isActive(st));
  const rptNoneStaff = S.staff.filter(st => st.classification !== 'Key Personnel' && st.classification !== 'Standard AML/CTF Staff' && isActive(st));

  // Vetting requirements table
  const vetReqTable = `
    <div style="font-size:11px;font-weight:600;color:#475569;margin:10px 0 6px;">Vetting Requirements by Role Type</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Role Category','Description','Vetting Required'])}
      ${tr(['Key Personnel','Controls or oversees the AML/CTF program','Enhanced Due Diligence (Fit &amp; Proper)'],0)}
      ${tr(['Operational AML Staff','Performs CDD, screening, monitoring or SMR support','Standard Screening'],1)}
      ${tr(['Non-AML Staff','No involvement in AML/CTF functions','No vetting required (recorded only)'],0)}
    </table>`;

  // Staff summary counts
  const summaryTable = `
    <div style="font-size:11px;font-weight:600;color:#475569;margin:10px 0 6px;">Staff Summary</div>
    <table style="width:50%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Metric','Count'])}
      ${tr(['Active staff recorded', rptKeyStaff.length + rptStdStaff.length + rptNoneStaff.length],0)}
      ${tr(['Key Personnel', rptKeyStaff.length],1)}
      ${tr(['Operational AML Staff', rptStdStaff.length],0)}
      ${tr(['Non-AML Staff (assessed)', rptNoneStaff.length],1)}
    </table>`;

  // Key Personnel table — full vetting detail
  const checkMark = (val, pass) => val ? `<span style="color:${pass?'#16a34a':'#dc2626'};font-weight:600;">✓</span>` : '<span style="color:#94a3b8;">—</span>';
  const keyTable = rptKeyStaff.length > 0 ? `
    <div style="font-size:11px;font-weight:600;color:#475569;margin:10px 0 6px;">Key Personnel — Fit &amp; Proper (Enhanced Due Diligence)</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Name','Position','Police','Bankruptcy','Screening','Declaration'])}
      ${rptKeyStaff.map((st,i) => tr([
        `<strong>${st.name}</strong>`,
        st.role||'—',
        checkMark(st.policeResult, st.policeResult==='Pass'),
        checkMark(st.bankruptResult, st.bankruptResult==='Clear'),
        checkMark(st.nsResult, st.nsResult==='Clear'),
        checkMark(st.declSigned, true)
      ], i%2)).join('')}
    </table>` : '';

  // Operational AML Staff table
  const stdTable = rptStdStaff.length > 0 ? `
    <div style="font-size:11px;font-weight:600;color:#475569;margin:10px 0 6px;">Operational AML Staff — Standard Screening</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Name','Position','AML/CTF Function','Screening','Declaration'])}
      ${rptStdStaff.map((st,i) => {
        const fns = (st.functions||[]).join(', ') || '—';
        return tr([
          `<strong>${st.name}</strong>`,
          st.role||'—',
          fns,
          st.nsResult ? `<span style="color:${st.nsResult==='Clear'?'#16a34a':'#dc2626'};font-weight:600;">${st.nsResult}</span>` : '—',
          st.declSigned ? '<span style="color:#16a34a;font-weight:600;">✓ Signed</span>' : '<span style="color:#94a3b8;">Pending</span>'
        ], i%2);
      }).join('')}
    </table>` : '';

  // Non-AML Staff table
  const noneTable = rptNoneStaff.length > 0 ? `
    <div style="font-size:11px;font-weight:600;color:#475569;margin:10px 0 6px;">Non-AML Staff — Recorded Only</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Name','Position','Assessment Outcome'])}
      ${rptNoneStaff.map((st,i) => tr([
        `<strong>${st.name}</strong>`,
        st.role||'—',
        'No AML/CTF functions — assessed and confirmed'
      ], i%2)).join('')}
    </table>` : '';

  const sec4 = section('5','Staff Assessment &amp; Vetting — Summary') + `
    <p style="font-size:11px;color:#64748b;margin-bottom:10px;line-height:1.7;">All staff have been assessed to determine their involvement in AML/CTF functions under the firm's AML/CTF Program. Vetting requirements are applied based on the staff member's AML/CTF role. The tables below reflect active staff only. Departed or inactive staff are retained in SimpleAML records but excluded from this summary.</p>
    ${vetReqTable}
    ${summaryTable}
    ${S.staff.length ? keyTable + stdTable + noneTable : '<p style="font-size:11px;color:#94a3b8;">No staff records.</p>'}
`;

  // ── SECTION 5: AML/CTF TRAINING REGISTER ────────────────────────────────
  // Active staff who should have training (Key Personnel + Standard AML/CTF Staff)
  const activeAmlStaff = S.staff.filter(st =>
    (st.classification === 'Key Personnel' || st.classification === 'Standard AML/CTF Staff') &&
    (!st.status || st.status === 'Active' || st.status === 'On Leave')
  );
  // Active training records — filter to active staff only (soft-link by name)
  const activeStaffNames = new Set(activeAmlStaff.map(st => st.name));
  const activeTraining = S.training.filter(t => !t.name || activeStaffNames.size === 0 || activeStaffNames.has(t.name));
  const now = new Date();
  const in60 = new Date(); in60.setDate(in60.getDate() + 60);
  const overdue = activeTraining.filter(t => t.next && new Date(t.next) < now);
  const dueSoon = activeTraining.filter(t => t.next && new Date(t.next) >= now && new Date(t.next) <= in60);
  const current = activeTraining.filter(t => t.next && new Date(t.next) >= now);
  const staffRequiring = Math.max(activeAmlStaff.length, activeTraining.length);

  const trainingSummaryTable = `
    <table style="width:50%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Metric','Count'])}
      ${tr(['Staff requiring training', staffRequiring], 0)}
      ${tr([`Training current`, `${current.length} / ${staffRequiring}`], 1)}
      ${tr([overdue.length > 0 ? '<span style="color:#dc2626;font-weight:600;">Training overdue</span>' : 'Training overdue', overdue.length > 0 ? `<span style="color:#dc2626;font-weight:600;">${overdue.length}</span>` : '0'], 0)}
      ${tr([`Next training due within 60 days`, dueSoon.length], 1)}
    </table>`;

  const trainRows = activeTraining.map((t,i) => {
    const isOverdue = t.next && new Date(t.next) < now;
    const staffRecord = S.staff.find(st => st.name === t.name);
    const classification = staffRecord ? staffRecord.classification : '—';
    return tr([
      `<strong>${t.name}</strong><br><span style="font-size:10px;color:#94a3b8;">${classification}</span>`,
      t.date ? new Date(t.date).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—',
      t.provider||'—',
      t.score||'—',
      `<span style="color:${isOverdue?'#dc2626':'#1e293b'};font-weight:${isOverdue?'600':'400'};">${t.next ? new Date(t.next).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}) : '—'}${isOverdue?' (Overdue)':''}</span>`
    ], i%2);
  });

  const sec5 = section('6','AML/CTF Training Register — Summary') +
    `<p style="font-size:11px;color:#64748b;margin-bottom:12px;line-height:1.7;">Training records are maintained for all staff performing AML/CTF functions in accordance with the firm's AML/CTF Program. Full training history and evidence is retained within SimpleAML.</p>` +
    trainingSummaryTable +
    (activeTraining.length > 0 ? `
    <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;">Training Records</div>
    <table style="width:100%;border-collapse:collapse;">
      ${th(['Staff Member','Training Date','Provider / Course','Score / Outcome','Next Due'])}
      ${trainRows.join('')}
    </table>` : `<p style="font-size:11px;color:#94a3b8;">No training records for active AML/CTF staff.</p>`);

  // ── SECTION 6: ENROLMENT & CONTROLS ─────────────────────────────────────
  const declaredControls = e.controls||[];
  const autoCtrls = {
    'ctrl-program':   !!(p.approvedBy&&p.approvedDate),
    'ctrl-amlco':     !!(f.appt&&f.appt.amlco&&f.appt.amlco.name),
    'ctrl-training':  S.training.length > 0,
    'ctrl-dvs':       !!(p.approvedBy),
    'ctrl-screening': !!(p.approvedBy),
    'ctrl-review':    !!(p.nextReview),
    'ctrl-ongoing':   false,
  };
  const CTRL_LABELS = {
    'ctrl-program':'AML/CTF Program approved by senior manager',
    'ctrl-amlco':'AMLCO appointed and oversight operational',
    'ctrl-training':'AML/CTF staff training policy in place',
    'ctrl-dvs':'Customer identification procedure in place',
    'ctrl-screening':'Sanctions / PEP screening procedure in place',
    'ctrl-review':'Annual program review scheduled',
    'ctrl-ongoing':'Ongoing client monitoring process in place',
  };
  const ctrlRows = Object.entries(CTRL_LABELS).map(([id,label],i) => {
    const evidenced = autoCtrls[id];
    const declared = declaredControls.includes(id) || evidenced;
    return tr([
      label,
      declared ? '<span style="color:#16a34a;font-weight:600;">✓ Declared</span>' : '<span style="color:#94a3b8;">Not declared</span>',
      evidenced ? '<span style="color:#16a34a;">Evidenced in SimpleAML</span>' : '<span style="color:#94a3b8;">Manual declaration</span>'
    ], i%2);
  });
  const declaredCount = Object.keys(CTRL_LABELS).filter(id => declaredControls.includes(id) || autoCtrls[id]).length;
  const residualRisk = declaredCount >= 6 ? 'Low' : declaredCount >= 4 ? 'Medium' : inherentRisk;

  // ── SECTION 6: SMR / INCIDENT REGISTER ─────────────────────────────────
  const totalInc    = (S.incidents||[]).length;
  const openInc     = (S.incidents||[]).filter(i => !i.status || i.status === 'Open').length;
  const closedInc   = (S.incidents||[]).filter(i => i.status === 'Closed').length;
  const austrRefs   = (S.incidents||[]).filter(i => i.reference).map(i => i.reference).join(', ') || '—';
  const sec6 = section('8','SMR / Incident Register — Summary') +
    `<p style="font-size:11px;color:#64748b;margin-bottom:12px;line-height:1.7;">All suspicious matter reports and threshold transaction reports are permanently recorded in the firm's SMR/Incident Register.</p>
    <table style="width:50%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Metric','Count / Note'])}
      ${tr(['Total incidents recorded', totalInc], 0)}
      ${tr(['Open incidents', openInc], 1)}
      ${tr(['Closed incidents', closedInc], 0)}
      ${tr(['AUSTRAC references recorded', austrRefs], 1)}
    </table>
    ${totalInc === 0 ? '<p style="font-size:11px;color:#94a3b8;font-style:italic;">No incidents recorded at the time of this report.</p>' : ''}`;

    const sec7 = section('4','AUSTRAC Enrolment & Controls Declaration') + `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-size:18px;font-weight:800;color:#1e293b;">${badge(inherentRisk)}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Inherent risk</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-size:18px;font-weight:800;color:#1e293b;">${declaredCount}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Controls declared</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-size:18px;font-weight:800;">${badge(residualRisk)}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Residual risk</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Control','Status','Evidence'])}
      ${ctrlRows.join('')}
    </table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;">
      ${field('Enrolled with AUSTRAC', e.enrolled?'Yes':'No')}
      ${field('Date enrolled', e.enrolledDate)}
      ${field('AUSTRAC reference', e.refNumber)}
      ${field('Enrolled by', e.enrolledBy)}
      ${field('AMLCO notified date', e.amlcoDate)}
    </div>`;

  // ── SECTION 7: CLIENT REGISTER ──────────────────────────────────────────
  const riskFlagLabel = { offshoreJurisdiction:'Offshore jurisdiction', complexStructure:'Complex structure', pepAmongControllers:'PEP among controllers', cashIntensiveIndustry:'Cash-intensive industry' };
  const entityDetailFields = (c) => {
    const rows = [];
    if (c.abn)             rows.push(field('ABN', c.abn));
    if (c.acn)             rows.push(field('ACN', c.acn));
    if (c.trustName)       rows.push(field('Trust name', c.trustName));
    if (c.trustType)       rows.push(field('Trust type', c.trustType));
    if (c.trusteeType)     rows.push(field('Trustee type', c.trusteeType));
    if (c.jurisdiction)    rows.push(field('Jurisdiction', c.jurisdiction));
    if (c.incDate)         rows.push(field('Incorporated', c.incDate));
    if (c.industry)        rows.push(field('Industry / sector', c.industry));
    if (c.regAddress)      rows.push(field('Registered address', c.regAddress));
    if (c.sourceFunds)     rows.push(field('Source of funds', c.sourceFunds));
    if (c.purpose)         rows.push(field('Purpose of service', c.purpose));
    return rows.join('');
  };
  const attestationLine = (c) => {
    const atts = [];
    if (c.abnChecked)      atts.push('ABN/ASIC confirmed');
    if (c.registryChecked) atts.push('Share registry sighted');
    if (c.deedSighted)     atts.push('Trust deed sighted');
    if (c.fundActive)      atts.push('ATO registration confirmed');
    return atts.length ? atts.join(' · ') : null;
  };

  const clientCards = S.clients.length === 0
    ? `<p style="font-size:11px;color:#94a3b8;padding:8px 0;">No clients on register.</p>`
    : S.clients.map((c,i) => {
        const svcName = DS_LIST.find(d=>d.id===c.service)?.name || c.service || '—';
        const inds = c.individuals || [];
        const verified = inds.filter(ind=>ind.idOutcome==='Verified').length;
        const screened = inds.filter(ind=>ind.screenResult).length;
        const hasHit   = inds.some(ind=>ind.screenResult==='PEP'||ind.screenResult==='Sanctions');
        const flags    = Object.keys(riskFlagLabel).filter(k=>c[k]);
        const attest   = attestationLine(c);
        const histCount = (c.history||[]).length;

        // individuals sub-table
        const indRows = inds.length === 0
          ? `<tr><td colspan="8" style="padding:6px 8px;font-size:11px;color:#94a3b8;">No individuals recorded.</td></tr>`
          : inds.map((ind,ii) => {
              const outColor = ind.idOutcome==='Verified' ? '#16a34a' : ind.idOutcome==='Unable to verify' ? '#dc2626' : '#94a3b8';
              const scrColor = ind.screenResult==='Clear' ? '#16a34a' : (ind.screenResult==='PEP'||ind.screenResult==='Sanctions') ? '#dc2626' : '#94a3b8';
              return `<tr style="${ii%2?'background:#f8fafc':'background:#fff'}">
                <td style="padding:5px 8px;font-size:11px;font-weight:600;color:#1e293b;border-bottom:1px solid #e2e8f0;">${ind.name||'—'}</td>
                <td style="padding:5px 8px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">${ind.role||'—'}</td>
                <td style="padding:5px 8px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">${ind.ownership||'—'}</td>
                <td style="padding:5px 8px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">${ind.idType||'—'} ${ind.idNumber||''}</td>
                <td style="padding:5px 8px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">${ind.idDate||'—'}${ind.idBy?'<br><span style="font-size:10px;">by '+ind.idBy+'</span>':''}</td>
                <td style="padding:5px 8px;font-size:11px;font-weight:600;color:${outColor};border-bottom:1px solid #e2e8f0;">${ind.idOutcome||'Not recorded'}</td>
                <td style="padding:5px 8px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">${ind.screenDate||'—'}${ind.screenProvider?'<br><span style="font-size:10px;">'+ind.screenProvider+'</span>':''}</td>
                <td style="padding:5px 8px;font-size:11px;font-weight:600;color:${scrColor};border-bottom:1px solid #e2e8f0;">${ind.screenResult||'Not screened'}${ind.screenRef?'<br><span style="font-family:monospace;font-size:10px;font-weight:400;color:#64748b;">'+ind.screenRef+'</span>':''}</td>
              </tr>`;
            }).join('');

        return `
        <div style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;overflow:hidden;page-break-inside:avoid;">
          <!-- Client header -->
          <div style="background:#f1f5f9;padding:10px 14px;display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <span style="font-size:13px;font-weight:700;color:#0f172a;">${c.name}</span>
              <span style="font-size:11px;color:#64748b;margin-left:8px;">${c.entityType||''}</span>
              ${c.ttr==='Yes'?'<span style="margin-left:6px;background:#fed7aa;color:#c2410c;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;">TTR</span>':''}
              ${c.smr==='Yes'?'<span style="margin-left:4px;background:#fecaca;color:#dc2626;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;">SMR</span>':''}
              ${hasHit?'<span style="margin-left:4px;background:#fecaca;color:#dc2626;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;">⚠ Screening Hit</span>':''}
            </div>
            <div style="text-align:right;">
              ${badge(c.risk)}${c.riskOverride?'<span style="font-size:10px;color:#d97706;margin-left:4px;">(override)</span>':''}
            </div>
          </div>
          <!-- Entity details -->
          <div style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;">
              ${field('Service provided', svcName)}
              ${field('CDD date', c.cddDate)}
              ${entityDetailFields(c)}
              ${c.riskOverride ? field('Risk override justification', c.riskJust||'No justification recorded') : ''}
              ${histCount > 0 ? field('Change history', histCount+' previous version'+(histCount!==1?'s':'')) : ''}
            </div>
            ${flags.length ? `<div style="margin-top:6px;">${flags.map(k=>`<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;margin-right:4px;">⚑ ${riskFlagLabel[k]}</span>`).join('')}</div>` : ''}
            ${attest ? `<div style="margin-top:6px;font-size:10px;color:#16a34a;">✓ ${attest}</div>` : ''}
          </div>
          <!-- Individuals -->
          <div style="padding:10px 14px;">
            <div style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">
              Individuals — ${inds.length} recorded · Verified: ${verified}/${inds.length} · Screened: ${screened}/${inds.length}
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                ${['Name','Role','Ownership %','ID Type / Number','Verified Date','ID Outcome','Screened Date','Screen Result / Ref'].map(h=>`<th style="text-align:left;padding:5px 8px;background:#f8fafc;border-bottom:1px solid #cbd5e1;font-size:10px;font-weight:600;color:#475569;">${h}</th>`).join('')}
              </tr>
              ${indRows}
            </table>
          </div>
        </div>`;
      }).join('');

  // ── SECTION 8: CLIENT REGISTER SUMMARY ─────────────────────────────────────
  const now8 = new Date();
  const yr = 365*24*60*60*1000;
  const sevenYrsAgo = new Date(now8 - 7*yr);
  const twelveMonthsAgo = new Date(now8 - yr);
  // Include clients within 7 years
  const activeClients = S.clients.filter(c => {
    const lastSvc = (c.services||[]).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastSvc > sevenYrsAgo;
  });
  const newClients = activeClients.filter(c => c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo);
  const ongoingClients = activeClients.filter(c => {
    return (c.services||[]).some(sv => sv.dateProvided && new Date(sv.dateProvided) >= twelveMonthsAgo)
      || (c.cddDate && new Date(c.cddDate) >= twelveMonthsAgo);
  });
  const dormantClients = activeClients.filter(c => {
    const lastActivity = (c.services||[]).reduce((latest, sv) => {
      const d = sv.dateProvided ? new Date(sv.dateProvided) : null;
      return d && d > latest ? d : latest;
    }, c.cddDate ? new Date(c.cddDate) : new Date(0));
    return lastActivity < twelveMonthsAgo;
  });
  const byType = (type) => activeClients.filter(c => c.entityType === type).length;
  const allInds = activeClients.flatMap(c => c.individuals||[]);
  const totalInds = allInds.length;
  const screenedInds = allInds.filter(i => i.screenResult).length;
  const cddDone = activeClients.filter(c => c.tippingAck || (c.individuals||[]).length > 0).length;

  const clientSummaryTable = `
    <table style="width:55%;border-collapse:collapse;margin-bottom:14px;">
      ${th(['Metric','Count'])}
      ${tr(['Total clients recorded (within 7 years)', activeClients.length],0)}
      ${tr(['New clients (last 12 months)', newClients.length],1)}
      ${tr(['Ongoing clients (active service last 12 months)', ongoingClients.length],0)}
      ${tr(['Dormant clients (no service last 12 months)', dormantClients.length],1)}
      ${tr(['Companies / Partnerships recorded', byType('Private Company')+byType('Partnership')],0)}
      ${tr(['Trusts recorded', byType('Trust')],1)}
      ${tr(['SMSFs recorded', byType('SMSF')],0)}
      ${tr(['Individuals / Sole Traders recorded', byType('Individual / Sole Trader')],1)}
      ${tr(['Clients with CDD completed', cddDone + ' / ' + activeClients.length],0)}
      ${tr(['Individuals screened', screenedInds + ' / ' + totalInds],1)}
    </table>
    <p style="font-size:10px;color:#94a3b8;font-style:italic;">All client details are permanently maintained in the Client Register. Clients with no service activity older than 7 years are excluded from this summary.</p>`;

  const sec8 = section('7','Client Register — Summary') +
    `<p style="font-size:11px;color:#64748b;margin-bottom:12px;line-height:1.7;">Summary of all client records held by the firm within the 7-year retention window. Full CDD records, individual verification, and screening details are maintained in SimpleAML.</p>` +
    clientSummaryTable;

  // ── ASSEMBLE & PRINT ─────────────────────────────────────────────────────
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>SimpleAML Compliance Report — ${f.name||'Unnamed Firm'}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 40px 48px 80px; max-width: 900px; margin: 0 auto; }
      @media print {
        body { padding: 20px 24px 60px; }
        .no-print { display: none !important; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
        .page-footer { display: flex !important; }
      }
      table { border-collapse: collapse; width: 100%; }
      .page-footer {
        display: none;
        position: fixed;
        bottom: 0; left: 0; right: 0;
        padding: 7px 48px;
        border-top: 1px solid #e2e8f0;
        background: #fff;
        justify-content: space-between;
        align-items: center;
      }
      .sa-logo-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px; height: 16px;
        background: #0F1F3D;
        border-radius: 3px;
        color: #fff;
        font-size: 7px;
        font-weight: 800;
        letter-spacing: -0.3px;
        flex-shrink: 0;
      }
    </style>
  </head><body>
    <!-- HEADER -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #1e293b;margin-bottom:20px;">
      <div>
        <div style="font-size:22px;font-weight:800;color:#1e293b;">AML/CTF Compliance Report</div>
        <div style="font-size:13px;color:#64748b;margin-top:2px;">${f.name||'Unnamed Firm'} ${f.abn?'· ABN '+f.abn:''}</div>
      </div>
      <div style="text-align:right;">
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-bottom:3px;">
          <span class="sa-logo-mark">SA</span>
          <span style="font-size:12px;font-weight:700;color:#0F1F3D;">SimpleAML</span>
        </div>
        <div style="font-size:10px;color:#94a3b8;">${generated}</div>
        <div style="font-size:10px;margin-top:1px;"><a href="https://simpleaml.com.au" style="color:#94a3b8;text-decoration:none;">simpleaml.com.au</a></div>
      </div>
    </div>

    <!-- CONTENTS PAGE -->
    <div style="margin-bottom:28px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
      <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">This report contains the following sections</div>
      <ul style="list-style:none;margin:0;padding:0;">
        ${[
          '1. Firm Profile — practice details and compliance appointments',
          '2. AML/CTF Risk Assessment — designated services, inherent risk ratings, risk appetite',
          '3. AML/CTF Program — documents, approval history',
          '4. AUSTRAC Enrolment — controls declaration, residual risk, enrolment details',
          '5. Staff Assessment &amp; Vetting — Key Personnel, fit &amp; proper checks',
          '6. AML/CTF Training Register — training records for AML/CTF staff',
          '7. Client Register — CDD status, entity types, new/ongoing/dormant summary',
          '8. SMR &amp; Incident Register — suspicious matter reports and threshold transactions'
        ].map(s=>`<li style="font-size:11px;color:#64748b;padding:3px 0;display:flex;gap:8px;"><span style="color:#6366f1;flex-shrink:0;">→</span>${s}</li>`).join('')}
      </ul>
    </div>

    ${sec1}${sec2}${sec3}${sec7}${sec4}${sec5}${sec8}${sec6}

    <!-- DECLARATION -->
    <div style="margin-top:32px;padding:16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;">
      <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:4px;">Compliance Declaration</div>
      <p style="font-size:11px;color:#78350f;line-height:1.6;">This report has been generated from SimpleAML, the firm's AML/CTF compliance register. By printing or saving this report, the firm confirms that: (1) all data entered is accurate and complete to the best of its knowledge; (2) underlying evidence documents have been sighted and are stored in the firm's records; and (3) this report will be retained for the mandatory 7-year period from the date of generation as required under the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.</p>
      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div><div style="font-size:10px;color:#92400e;margin-bottom:20px;">Signed:</div><div style="border-top:1px solid #92400e;padding-top:4px;font-size:10px;color:#92400e;">Signature / Senior Manager</div></div>
        <div><div style="font-size:10px;color:#92400e;margin-bottom:20px;">Date:</div><div style="border-top:1px solid #92400e;padding-top:4px;font-size:10px;color:#92400e;">Date signed</div></div>
      </div>
    </div>

    <!-- FINAL PAGE: DISCLAIMER -->
    <div style="page-break-before:always;padding:40px 36px;border:1px solid #e2e8f0;border-radius:8px;margin-top:32px;background:#fafafa;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e293b;">
        <span class="sa-logo-mark">SA</span>
        <span style="font-size:13px;font-weight:700;color:#0F1F3D;">SimpleAML</span>
      </div>

      <div style="font-size:12px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:20px;">Disclaimer — Nature of this Report</div>

      <p style="font-size:12px;color:#1e293b;line-height:1.8;margin-bottom:16px;">This AML/CTF Compliance Report has been generated by SimpleAML as a summary of the compliance records entered by the user.</p>

      <p style="font-size:12px;color:#1e293b;line-height:1.8;margin-bottom:16px;"><strong>SimpleAML is a compliance register only.</strong> It records that AML/CTF checks were performed, by whom, and when. It does not store, hold, verify, or manage the underlying evidence supporting those records — including identity documents, screening reports, police checks, or AML/CTF program documents.</p>

      <p style="font-size:12px;color:#1e293b;line-height:1.8;margin-bottom:16px;">All underlying compliance evidence is maintained separately by the reporting entity in its own systems and records.</p>

      <p style="font-size:12px;color:#1e293b;line-height:1.8;margin-bottom:16px;">This report is not submitted to AUSTRAC and does not constitute legal advice or a certification of compliance. It is an internal record intended to assist the reporting entity in demonstrating its AML/CTF controls during compliance reviews and independent evaluations.</p>

      <p style="font-size:12px;color:#1e293b;line-height:1.8;margin-bottom:32px;">Responsibility for the accuracy, completeness, and maintenance of all AML/CTF records remains solely with the reporting entity. SimpleAML and Click Seed Pty Ltd accept no liability for any loss or damage arising from reliance on this report.</p>

      <div style="border-top:1px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:10px;color:#94a3b8;">SimpleAML is developed by Click Seed Pty Ltd ABN 87 656 256 567</span>
        <span style="font-size:10px;color:#94a3b8;"><a href="https://simpleaml.com.au" style="color:#94a3b8;text-decoration:none;">simpleaml.com.au</a></span>
      </div>
    </div>

    <div class="no-print" style="margin-top:24px;text-align:center;">
      <button onclick="window.print()" style="background:#4f46e5;color:#fff;border:none;padding:10px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Print / Save as PDF</button>
      <button onclick="window.close()" style="margin-left:12px;background:#f1f5f9;color:#475569;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Close</button>
    </div>

    <!-- PRINT FOOTER — appears on every printed page -->
    <div class="page-footer">
      <span style="font-size:10px;color:#94a3b8;">${f.name||'Unnamed Firm'} · AML/CTF Compliance Register</span>
      <span style="display:flex;align-items:center;gap:4px;">
        <span class="sa-logo-mark">SA</span>
        <span style="font-size:10px;color:#94a3b8;">Generated using SimpleAML · <a href="https://simpleaml.com.au" style="color:#94a3b8;text-decoration:none;">simpleaml.com.au</a></span>
      </span>
    </div>

  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
};
