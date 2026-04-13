import { S, save } from '../state/index.js';

export function screen() {
  const setup = S.setup || {};
  const f     = S.firm  || {};
  const steps = [
    {
      key:    'firm',
      icon:   '🏢',
      title:  'Firm Profile',
      desc:   'Enter your practice name, ABN, entity type and principal contact.',
      screen: 'firm-details',
      done:   setup.firm,
    },
    {
      key:    'appointments',
      icon:   '👤',
      title:  'Appointments',
      desc:   'Name your AMLCO, Reporting Officer and Senior Manager.',
      screen: 'firm-appointments',
      done:   setup.appointments,
    },
    {
      key:    'scope',
      icon:   '🔍',
      title:  'Designated Services',
      desc:   'Confirm which AUSTRAC designated services your firm provides.',
      screen: 'risk',
      done:   setup.scope,
    },
    {
      key:    'risk',
      icon:   '⚖️',
      title:  'Risk Assessment',
      desc:   'Complete service, customer, geography and overall risk ratings.',
      screen: 'risk',
      done:   setup.risk,
    },
    {
      key:    'program',
      icon:   '📋',
      title:  'AML/CTF Program',
      desc:   'Approve and record your AML/CTF program.',
      screen: 'program',
      done:   setup.program,
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const total     = steps.length;
  const allDone   = doneCount === total;
  const nextStep  = steps.find(s => !s.done);

  // If all done, mark setupComplete and offer to go home
  if (allDone && !S.setupComplete) {
    S.setupComplete = true;
    save();
  }

  return `<div class="py-8 space-y-6" style="max-width:640px;margin:0 auto;">

    <div>
      <h1 class="text-2xl font-bold text-slate-900">Set up SimpleAML</h1>
      <p class="text-sm text-slate-400 mt-1">Complete these five steps to set up your firm's AML/CTF compliance foundation. Takes about 20 minutes.</p>
    </div>

    <!-- PROGRESS -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="font-size:13px;font-weight:600;color:#0f172a;">${doneCount} of ${total} steps complete</div>
        <div style="font-size:13px;font-weight:700;color:${allDone ? '#16a34a' : '#4f46e5'};">${Math.round((doneCount/total)*100)}%</div>
      </div>
      <div style="background:#f1f5f9;border-radius:99px;height:6px;overflow:hidden;">
        <div style="background:${allDone ? '#16a34a' : '#4f46e5'};height:6px;border-radius:99px;width:${Math.round((doneCount/total)*100)}%;transition:width .3s;"></div>
      </div>
    </div>

    <!-- STEPS -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      ${steps.map((step, i) => {
        const isNext = !step.done && steps.slice(0, i).every(s => s.done);
        const locked = !step.done && !isNext;
        return `
        <div style="display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:${i < steps.length - 1 ? '1px solid #f1f5f9' : 'none'};background:${isNext ? '#fafbff' : '#fff'};">
          <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;background:${step.done ? '#f0fdf4' : isNext ? '#eef2ff' : '#f8fafc'};border:1.5px solid ${step.done ? '#bbf7d0' : isNext ? '#c7d2fe' : '#e2e8f0'};">
            ${step.done ? '<span style="color:#16a34a;font-weight:700;font-size:14px;">✓</span>' : `<span style="${locked ? 'opacity:0.4' : ''}">${step.icon}</span>`}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:${locked ? '#94a3b8' : '#0f172a'};">${step.title}</div>
            <div style="font-size:11px;color:${locked ? '#cbd5e1' : '#94a3b8'};margin-top:2px;">${step.desc}</div>
          </div>
          ${step.done
            ? `<span style="font-size:10px;font-weight:700;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 10px;border-radius:20px;white-space:nowrap;">✓ Done</span>`
            : isNext
              ? `<button onclick="go('${step.screen}')" style="background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Start →</button>`
              : `<span style="font-size:10px;color:#cbd5e1;white-space:nowrap;">Locked</span>`
          }
        </div>`;
      }).join('')}
    </div>

    <!-- CTA -->
    ${allDone ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px;text-align:center;">
      <div style="font-size:16px;font-weight:700;color:#16a34a;margin-bottom:6px;">✓ Setup complete</div>
      <div style="font-size:13px;color:#4ade80;margin-bottom:16px;">Your compliance foundation is in place. Now add your staff, clients and training records.</div>
      <button onclick="go('home')" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:10px 28px;font-size:13px;font-weight:600;cursor:pointer;">Go to Home →</button>
    </div>` : nextStep ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
      <div>
        <div style="font-size:12px;font-weight:600;color:#0f172a;">Next step: ${nextStep.title}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${nextStep.desc}</div>
      </div>
      <button onclick="go('${nextStep.screen}')" style="background:#4f46e5;color:#fff;border:none;border-radius:10px;padding:9px 20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;">Start →</button>
    </div>` : ''}

    <div style="text-align:center;">
      <button onclick="go('home')" style="background:none;border:none;font-size:12px;color:#94a3b8;cursor:pointer;text-decoration:underline;">Skip setup — go to Home</button>
    </div>

  </div>`;
}
