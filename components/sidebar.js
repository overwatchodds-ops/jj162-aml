import { S } from '../state/index.js';

// ─── GROUP MAP ────────────────────────────────────────────────────────────────
// Maps every screen to its group. Used to derive active group from active screen.
export const SCREEN_GROUP = {
  dashboard:            'dashboard',
  about:                'dashboard',
  'account-backup':     'dashboard',
  'firm-overview':      'firm',
  firm:                 'firm',
  'firm-details':       'firm',
  'firm-appointments':  'firm',
  'compliance-overview':'compliance',
  risk:                 'compliance',
  servicerisk:          'compliance',
  customerrisk:         'compliance',
  georisk:              'compliance',
  overallrisk:          'compliance',
  program:              'compliance',
  enrolment:            'compliance',
  'personnel-overview': 'personnel',
  staff:                'personnel',
  training:             'personnel',
  'clients-overview':   'clients',
  clients:              'clients',
  newclient:            'clients',
  addservice:           'clients',
  incidents:            'clients',
  newincident:          'clients',
  'reports-overview':   'reports',
  report:               'reports',
};

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
export function TopNav() {
  const activeGroup = SCREEN_GROUP[S.currentScreen] || 'dashboard';
  const tabs = [
    { id: 'dashboard',  label: 'Dashboard',   screen: 'dashboard' },
    { id: 'firm',       label: 'Firm',        screen: 'firm-overview' },
    { id: 'compliance', label: 'Compliance',  screen: 'compliance-overview' },
    { id: 'personnel',  label: 'Personnel',   screen: 'personnel-overview' },
    { id: 'clients',    label: 'Clients',     screen: 'clients-overview' },
    { id: 'reports',    label: 'Reports',     screen: 'reports-overview' },
  ];
  return `
    <nav class="fixed z-50 bg-white border-b border-slate-200 h-12 flex items-center px-4" style="left:224px;right:256px;">
      <div class="flex-1 flex items-center justify-center gap-1">
        ${tabs.map(t => {
          const active = activeGroup === t.id;
          const cls = active
            ? 'text-indigo-700 font-semibold border-b-2 border-indigo-600'
            : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent';
          return `<button onclick="go('${t.screen}')" class="flex items-center h-12 px-3 text-sm transition ${cls} whitespace-nowrap">${t.label}</button>`;
        }).join('')}
      </div>
    </nav>`;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
export function Sidebar() {
  const activeGroup = SCREEN_GROUP[S.currentScreen] || 'dashboard';
  const cur = S.currentScreen;
  const a = (s) => cur === s
    ? 'bg-indigo-50 text-indigo-700 font-medium'
    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700';

  const sidebarItems = {
    dashboard: `
      <button onclick="go('dashboard')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('dashboard')}">Overview</button>
      <button onclick="go('about')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('about')}">About</button>
      <button onclick="go('account-backup')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('account-backup')}">Account Backup</button>
      <a href="https://simpleaml.com.au/faq.html" target="_blank" class="w-full text-left px-3 py-2 rounded-lg transition text-slate-500 hover:bg-slate-50 hover:text-slate-700 block text-sm">FAQ ↗</a>
      <a href="https://simpleaml.com.au/contact.html" target="_blank" class="w-full text-left px-3 py-2 rounded-lg transition text-slate-500 hover:bg-slate-50 hover:text-slate-700 block text-sm">Contact ↗</a>
      <a href="https://simpleaml.com.au/disclaimer.html" target="_blank" class="w-full text-left px-3 py-2 rounded-lg transition text-slate-500 hover:bg-slate-50 hover:text-slate-700 block text-sm">Disclaimer ↗</a>`,

    firm: `
      <button onclick="go('firm-details')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('firm-details')}">Firm Details</button>
      <button onclick="go('firm-appointments')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('firm-appointments')}">Appointments</button>`,

    compliance: `
      <button onclick="go('compliance-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('compliance-overview')}">Overview</button>
      <div class="font-semibold text-slate-700 text-xs mt-2 px-3">Risk Assessment</div>
      <button onclick="go('risk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('risk')}">Designated Services</button>
      <button onclick="go('servicerisk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('servicerisk')}">Service Risk</button>
      <button onclick="go('customerrisk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('customerrisk')}">Customer Risk</button>
      <button onclick="go('georisk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('georisk')}">Geography / Delivery Risk</button>
      <button onclick="go('overallrisk')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('overallrisk')}">Overall Inherent Risk</button>
      <button onclick="go('program')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('program')}">AML/CTF Program</button>
      <button onclick="go('enrolment')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('enrolment')}">AUSTRAC Enrolment</button>`,

    personnel: `
      <button onclick="go('personnel-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('personnel-overview')}">Overview</button>
      <button onclick="go('staff')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('staff')}">Key Personnel Vetting</button>
      <button onclick="go('training')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('training')}">Training Register</button>`,

    clients: `
      <button onclick="go('clients-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('clients-overview')}">Overview</button>
      <button onclick="go('clients')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('clients')}">Client Register</button>
      <button onclick="go('newclient')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('newclient')}">↳ New Client (CDD)</button>
      <button onclick="go('incidents')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('incidents')}">SMR & Incident Register</button>`,

    reports: `
      <button onclick="go('reports-overview')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('reports-overview')}">Overview</button>
      <button onclick="go('report')" class="w-full text-left px-3 py-2 rounded-lg transition ${a('report')}">Compliance Report</button>`,
  };

  return `
    <div class="w-56 bg-white border-r border-slate-200 flex flex-col fixed top-0 bottom-0 overflow-y-auto z-40">
      <div class="flex items-center gap-2 px-4 h-12 border-b border-slate-200 flex-shrink-0">
        <img src="/favicon.png" alt="SimpleAML" class="w-6 h-6 rounded-md flex-shrink-0">
        <span class="font-black text-slate-900 text-base tracking-tight">SimpleAML</span>
      </div>

      <nav class="p-2 flex-1 space-y-0.5 text-sm">
        ${sidebarItems[activeGroup] || sidebarItems.dashboard}
      </nav>
    </div>`;
}