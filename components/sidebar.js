import { S } from '../state/index.js';
import { complianceScore } from '../logic/index.js';

// ─── GROUP MAP ────────────────────────────────────────────────────────────────
// Maps every screen to its group. Used to derive active group from active screen.
export const SCREEN_GROUP = {
  dashboard:            'dashboard',
  about:                'dashboard',
  'clients-overview':   'clients',
  clients:              'clients',
  newclient:            'clients',
  addservice:           'clients',
  incidents:            'clients',
  newincident:          'clients',
  'personnel-overview': 'personnel',
  staff:                'personnel',
  training:             'personnel',
  'compliance-overview':'compliance',
  firm:                 'compliance',
  risk:                 'compliance',
  program:              'compliance',
  enrolment:            'compliance',
  'reports-overview':   'reports',
  report:               'reports',
};


// ─── TOP NAV ──────────────────────────────────────────────────────────────────
export function TopNav() {
  const activeGroup = SCREEN_GROUP[S.currentScreen] || 'dashboard';
  const tabs = [
    { id: 'dashboard',  label: 'Dashboard',          screen: 'dashboard' },
    { id: 'clients',    label: 'Clients',             screen: 'clients-overview' },
    { id: 'personnel',  label: 'Personnel',           screen: 'personnel-overview' },
    { id: 'compliance', label: 'Compliance Profile',  screen: 'compliance-overview' },
    { id: 'reports',    label: 'Reports',             screen: 'reports-overview' },
  ];
  const firmName = S.firm.name || 'My Firm';
  return `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-12 flex items-center px-4">

      <!-- LEFT: Logo -->
      <div class="flex items-center gap-2 flex-shrink-0 w-56">
        <img src="/favicon.png" alt="SimpleAML" class="w-6 h-6 rounded-md flex-shrink-0">
        <span class="font-black text-slate-900 text-base tracking-tight">SimpleAML</span>
      </div>

      <!-- CENTRE: Nav tabs -->
      <div class="flex-1 flex items-center justify-center gap-1">
        ${tabs.map(t => {
          const active = activeGroup === t.id;
          const cls = active
            ? 'text-indigo-700 font-semibold border-b-2 border-indigo-600'
            : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent';
          return `<button onclick="go('${t.screen}')" class="flex items-center h-12 px-3 text-sm transition ${cls} whitespace-nowrap">${t.label}</button>`;
        }).join('')}
      </div>

      <!-- RIGHT: Firm name -->
      <div class="flex-shrink-0 w-56 flex justify-end">
        <button onclick="go('firm')" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition text-right">
          <div>
            <div class="text-xs font-semibold text-slate-700 truncate max-w-[160px]">${firmName}</div>
            <div class="text-[10px] text-slate-400">Firm Profile</div>
          </div>
          <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span class="text-indigo-700 font-bold text-xs">${firmName.charAt(0).toUpperCase()}</span>
          </div>
        </button>
      </div>

    </nav>`;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
export function Sidebar() {
  const activeGroup = SCREEN_GROUP[S.currentScreen] || 'dashboard';
  const cur = S.currentScreen;
  const a = (s) => cur === s
    ? 'bg-indigo-50 text-indigo-700 font-semibold'
    : 'text-slate-600 hover:bg-slate-50';
  const score = complianceScore();

  const sidebarItems = {
    dashboard: `
      <button onclick="go('dashboard')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('dashboard')}">Overview</button>
      <button onclick="go('about')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('about')}">About &amp; Support</button>`,
    clients: `
      <button onclick="go('clients-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('clients-overview')}">Overview</button>
      <button onclick="go('clients')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('clients')}">Client Register</button>
      <button onclick="go('newclient')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('newclient')}">↳ New Client (CDD)</button>
      <button onclick="go('incidents')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('incidents')}">SMR &amp; Incident Register</button>`,
    personnel: `
      <button onclick="go('personnel-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('personnel-overview')}">Overview</button>
      <button onclick="go('staff')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('staff')}">Key Personnel Vetting</button>
      <button onclick="go('training')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('training')}">Training Register</button>`,
    compliance: `
      <button onclick="go('compliance-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('compliance-overview')}">Overview</button>
      <button onclick="go('firm')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('firm')}">1. Firm Profile</button>
      <button onclick="go('risk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('risk')}">2. Risk Assessment</button>
      <button onclick="go('program')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('program')}">3. AML/CTF Program</button>
      <button onclick="go('enrolment')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('enrolment')}">4. AUSTRAC Enrolment</button>`,
    reports: `
      <button onclick="go('reports-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('reports-overview')}">Overview</button>
      <button onclick="go('report')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('report')}">Compliance Report</button>`,
  };

  return `
    <div class="w-56 bg-white border-r border-slate-200 flex flex-col fixed top-12 bottom-0 overflow-y-auto z-40">
      <div class="p-4 border-b border-slate-100">
        <div class="flex justify-between text-xs text-slate-400 mb-1"><span>Setup progress</span><span>${score}%</span></div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full">
          <div class="bg-indigo-500 h-1.5 rounded-full transition-all" style="width:${score}%"></div>
        </div>
      </div>
      <div class="px-2 py-2 bg-amber-50 border-b border-amber-100">
        <p class="text-[10px] text-amber-700 leading-relaxed">Obligations from <strong>1 July 2026</strong>. Complete CDD before providing designated services.</p>
      </div>
      <nav class="p-2 flex-1 space-y-0.5 text-sm">
        ${sidebarItems[activeGroup] || sidebarItems.dashboard}
      </nav>
    </div>`;
}
