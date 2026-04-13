import { S, save } from '../state/index.js';

export function screen() {
  const setup = S.setup || {};
  const steps = [
    { key:'firm',         title:'Firm Profile',         desc:'Practice name, ABN, entity type and principal contact.',       screen:'firm-details',      done: setup.firm },
    { key:'appointments', title:'Appointments',          desc:'Name your AMLCO, Reporting Officer and Senior Manager.',       screen:'firm-appointments', done: setup.appointments },
    { key:'scope',        title:'Designated Services',   desc:'Confirm which AUSTRAC designated services your firm provides.', screen:'risk',             done: setup.scope },
    { key:'risk',         title:'Risk Assessment',       desc:'Complete service, customer, geography and overall risk ratings.', screen:'risk',            done: setup.risk },
    { key:'program',      title:'AML/CTF Program',       desc:'Approve and document your AML/CTF program.',                   screen:'program',           done: setup.program },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const total     = steps.length;
  const allDone   = doneCount === total;
  const pct       = Math.round((doneCount / total) * 100);
  const nextStep  = steps.find(s => !s.done);

  if (allDone && !S.setupComplete) { S.setupComplete = true; save(); }

  return `<div style="max-width:560px;margin:0 auto;padding-top:8px;">

    <!-- HEADER -->
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:4px;">Set up SimpleAML</h1>
      <p style="font-size:13px;color:#64748b;">Complete these five steps to establish your firm's AML/CTF compliance foundation. Takes about 20 minutes.</p>
    </div>

    <!-- PROGRESS -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;color:#64748b;">${doneCount} of ${total} steps complete</span>
        <span style="font-size:12px;font-weight:500;color:${allDone ? '#16a34a' : '#4f46e5'};">${pct}%</span>
      </div>
      <div style="background:#f1f5f9;border-radius:99px;height:4px;overflow:hidden;">
        <div style="background:${allDone ? '#16a34a' : '#4f46e5'};height:4px;border-radius:99px;width:${pct}%;transition:width .3s;"></div>
      </div>
    </div>

    <!-- STEPS -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:12px;">
      ${steps.map((step, i) => {
        const isNext  = !step.done && steps.slice(0, i).every(s => s.done);
        const locked  = !step.done && !isNext;
        const divider = i < steps.length - 1 ? 'border-bottom:0.5px solid #f1f5f9;' : '';

        const indicator = step.done
          ? `<div style="width:28px;height:28px;border-radius:50%;background:#f0fdf4;border:0.5px solid #bbf7d0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
               <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
             </div>`
          : isNext
          ? `<div style="width:28px;height:28px;border-radius:50%;background:#eef2ff;border:0.5px solid #c7d2fe;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
               <span style="font-size:11px;font-weight:500;color:#4f46e5;">${i+1}</span>
             </div>`
          : `<div style="width:28px;height:28px;border-radius:50%;background:#f8fafc;border:0.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
               <span style="font-size:11px;color:#cbd5e1;">${i+1}</span>
             </div>`;

        const action = step.done
          ? `<span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#f0fdf4;color:#166534;white-space:nowrap;">Done</span>`
          : isNext
          ? `<button onclick="go('${step.screen}')" style="font-size:12px;color:#fff;background:#4f46e5;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;white-space:nowrap;font-weight:500;">Start →</button>`
          : `<span style="font-size:11px;color:#cbd5e1;">—</span>`;

        return `<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;${divider}background:${isNext ? '#fafbff' : '#fff'};">
          ${indicator}
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:${locked ? '#94a3b8' : '#0f172a'};font-weight:${isNext ? '500' : '400'};">${step.title}</div>
            <div style="font-size:11px;color:${locked ? '#cbd5e1' : '#94a3b8'};margin-top:2px;">${step.desc}</div>
          </div>
          ${action}
        </div>`;
      }).join('')}
    </div>

    <!-- CTA -->
    ${allDone ? `
    <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:12px;padding:20px 24px;text-align:center;">
      <div style="font-size:14px;font-weight:500;color:#166534;margin-bottom:4px;">Setup complete</div>
      <div style="font-size:12px;color:#4ade80;margin-bottom:16px;">Your compliance foundation is in place. Next — add staff, clients and training records.</div>
      <button onclick="go('home')" style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:9px 24px;font-size:12px;font-weight:500;cursor:pointer;">Go to Home →</button>
    </div>` : nextStep ? `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
      <div>
        <div style="font-size:12px;font-weight:500;color:#0f172a;">Next: ${nextStep.title}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${nextStep.desc}</div>
      </div>
      <button onclick="go('${nextStep.screen}')" style="background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;flex-shrink:0;">Start →</button>
    </div>` : ''}

    <div style="text-align:center;margin-top:16px;">
      <button onclick="go('home')" style="background:none;border:none;font-size:12px;color:#94a3b8;cursor:pointer;text-decoration:underline;">Skip — go to Home</button>
    </div>

  </div>`;
}
