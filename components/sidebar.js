import { S } from '../state/index.js';
import { complianceScore } from '../logic/index.js';

// Sidebar — persistent navigation rendered on every screen.
// Reads S.currentScreen to highlight the active item.
export function Sidebar() {
  const a = (s) => S.currentScreen === s ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50';
  const score = complianceScore();
  const firmName = S.firm.name || 'My Firm';
  return `
    <div class="w-60 bg-white h-screen border-r flex flex-col fixed overflow-y-auto">
      <div class="p-5 border-b">
        <div class="font-black text-slate-900 text-lg tracking-tight">SimpleAML</div>
        <div class="text-xs text-slate-400 mt-0.5">${firmName}</div>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-slate-500 mb-1"><span>Setup progress</span><span>${score}%</span></div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full"><div class="bg-indigo-500 h-1.5 rounded-full transition-all" style="width:${score}%"></div></div>
        </div>
      </div>
      <div class="px-3 py-2 bg-amber-50 border-b border-amber-100">
        <p class="text-[10px] text-amber-700 leading-relaxed">AML/CTF obligations apply from <strong>1 July 2026</strong>. Complete CDD before providing any designated service.</p>
      </div>
      <nav class="p-3 flex-1 space-y-0.5 text-sm">
        <button onclick="go('dashboard')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('dashboard')}">Dashboard</button>
        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-3 pb-1 px-3">AML/CTF Compliance Program</div>
        <button onclick="go('firm')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('firm')}">1. Firm Profile</button>
        <button onclick="go('risk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('risk')}">2. AML/CTF Risk Assessment</button>
        <button onclick="go('program')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('program')}">3. AML/CTF Program</button>
        <button onclick="go('enrolment')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('enrolment')}">4. AUSTRAC Enrolment</button>
        <button onclick="go('staff')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('staff')}">5. Key Personnel Vetting</button>
        <button onclick="go('training')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('training')}">6. Training Register</button>
        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-3 pb-1 px-3">Client Management</div>
        <button onclick="go('clients')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('clients')}">7. Client Register</button>
        <button onclick="go('newclient')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('newclient')}">↳ New Client (CDD)</button>
        <button onclick="go('incidents')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('incidents')}">8. SMR &amp; Incident Register</button>
        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-3 pb-1 px-3">Reports</div>
        <button onclick="go('report')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('report')}">AML/CTF Compliance Report</button>
        <div class="border-t border-slate-100 mt-3 pt-3">
          <button onclick="go('about')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('about')}">About &amp; Support</button>
        </div>
      </nav>
    </div>`;
}
