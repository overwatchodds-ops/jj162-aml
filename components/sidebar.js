import { S } from '../state/index.js';

// ─── GROUP MAP ────────────────────────────────────────────────────────────────
export const SCREEN_GROUP = {
  dashboard:            'dashboard',
  home:                 'dashboard',
  setup:                'dashboard',
  about:                'dashboard',
  'account-backup':     'dashboard',
  'firm-details':       'compliance',
  'firm-appointments':  'compliance',
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

// ─── SHARED STYLE HELPERS ─────────────────────────────────────────────────────
const NAV_ITEM   = 'display:flex;align-items:center;width:100%;text-align:left;padding:6px 10px;border-radius:6px;font-size:12px;border:none;cursor:pointer;transition:background .1s;background:none;';
const NAV_ACTIVE = 'background:#eef2ff;color:#4338ca;font-weight:500;';
const NAV_IDLE   = 'color:#64748b;';
const NAV_HOVER  = 'onmouseover="if(!this.classList.contains(\'active\'))this.style.background=\'#f8fafc\'" onmouseout="if(!this.classList.contains(\'active\'))this.style.background=\'none\'"';

const GROUP_LABEL = (text) =>
  `<div style="padding:12px 10px 4px;font-size:10px;color:#94a3b8;font-weight:500;letter-spacing:.02em;">${text}</div>`;

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
export function TopNav() {
  const activeGroup = SCREEN_GROUP[S.currentScreen] || 'dashboard';
  const tabs = [
    { id: 'dashboard',  label: 'Home',       screen: 'home' },
    { id: 'compliance', label: 'Compliance', screen: 'compliance-overview' },
    { id: 'personnel',  label: 'Personnel',  screen: 'personnel-overview' },
    { id: 'clients',    label: 'Clients',    screen: 'clients-overview' },
    { id: 'reports',    label: 'Reports',    screen: 'reports-overview' },
  ];
  return `
    <nav style="position:fixed;left:200px;right:0;top:0;height:48px;background:#fff;border-bottom:0.5px solid #e2e8f0;display:flex;align-items:center;padding:0 24px;z-index:50;">
      <div style="display:flex;align-items:center;gap:2px;flex:1;">
        ${tabs.map(t => {
          const active = activeGroup === t.id;
          return `<button onclick="go('${t.screen}')"
            style="height:48px;padding:0 14px;font-size:12px;border:none;background:none;cursor:pointer;white-space:nowrap;border-bottom:2px solid ${active ? '#4f46e5' : 'transparent'};color:${active ? '#4f46e5' : '#64748b'};font-weight:${active ? '500' : '400'};transition:color .1s;"
            onmouseover="if(!${active})this.style.color='#0f172a'" onmouseout="if(!${active})this.style.color='${active ? '#4f46e5' : '#64748b'}'">
            ${t.label}
          </button>`;
        }).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
        <button onclick="go('firm-details')" style="font-size:12px;color:#64748b;background:#fff;border:0.5px solid #e2e8f0;padding:5px 12px;border-radius:6px;cursor:pointer;text-align:left;line-height:1.3;">
          <span style="display:block;color:#0f172a;">${S.firm?.name || 'Set up firm'}</span>
          <span style="display:block;font-size:10px;color:#6366f1;">Firm Profile</span>
        </button>
      </div>
    </nav>`;
}

// ─── FOOTER TOGGLE ────────────────────────────────────────────────────────────
window.toggleSidebarFooter = function() {
  const panel   = document.getElementById('sidebar-footer-panel');
  const chevron = document.getElementById('sidebar-footer-chevron');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.textContent = isOpen ? '›' : '‹';
};

// ─── NAV ITEM BUILDER ────────────────────────────────────────────────────────
function navItem(label, screen, cur, indent) {
  const active = cur === screen;
  const pl = indent ? '20px' : '10px';
  return `<button onclick="go('${screen}')"
    style="${NAV_ITEM}padding-left:${pl};${active ? NAV_ACTIVE : NAV_IDLE}"
    ${NAV_HOVER}>${label}</button>`;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
export function Sidebar() {
  const activeGroup = SCREEN_GROUP[S.currentScreen] || 'dashboard';
  const cur = S.currentScreen;

  const sidebarItems = {
    dashboard: `
      ${navItem('Home', 'home', cur, false)}`,

    compliance: `
      ${navItem('Overview', 'compliance-overview', cur, false)}
      ${GROUP_LABEL('Firm')}
      ${navItem('Firm Profile',          'firm-details',       cur, true)}
      ${GROUP_LABEL('Accountability')}
      ${navItem('Appointments',          'firm-appointments',  cur, true)}
      ${GROUP_LABEL('Risk Assessment')}
      ${navItem('Designated Services',   'risk',               cur, true)}
      ${navItem('Service Risk',          'servicerisk',        cur, true)}
      ${navItem('Customer Risk',         'customerrisk',       cur, true)}
      ${navItem('Geography / Delivery',  'georisk',            cur, true)}
      ${navItem('Overall Risk',          'overallrisk',        cur, true)}
      ${GROUP_LABEL('Program')}
      ${navItem('AML/CTF Program',       'program',            cur, true)}
      ${GROUP_LABEL('Enrolment')}
      ${navItem('AUSTRAC Enrolment',     'enrolment',          cur, true)}`,

    personnel: `
      ${navItem('Overview',              'personnel-overview', cur, false)}
      ${navItem('Key Personnel Vetting', 'staff',              cur, false)}
      ${navItem('Training Register',     'training',           cur, false)}`,

    clients: `
      ${navItem('Overview',              'clients-overview',   cur, false)}
      ${navItem('Client Register',       'clients',            cur, false)}
      ${navItem('SMR & Incident Register','incidents',         cur, false)}`,

    reports: `
      ${navItem('Overview',              'reports-overview',   cur, false)}
      ${navItem('Compliance Report',     'report',             cur, false)}`,
  };

  const footerOpen = cur === 'about' || cur === 'account-backup';

  return `
    <div style="width:200px;background:#fff;border-right:0.5px solid #e2e8f0;display:flex;flex-direction:column;position:fixed;top:0;bottom:0;overflow-y:auto;z-index:40;">

      <!-- LOGO -->
      <div style="height:48px;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:0.5px solid #e2e8f0;flex-shrink:0;">
        <img src="/favicon.png" alt="SimpleAML" style="width:22px;height:22px;border-radius:4px;flex-shrink:0;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;letter-spacing:-.01em;">SimpleAML</span>
      </div>

      <!-- NAV -->
      <nav style="padding:8px;flex:1;display:flex;flex-direction:column;gap:1px;">
        ${sidebarItems[activeGroup] || sidebarItems.dashboard}
      </nav>

      <!-- FOOTER -->
      <div style="border-top:0.5px solid #e2e8f0;flex-shrink:0;">
        <button onclick="toggleSidebarFooter()" id="sidebar-footer-btn"
          style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer;transition:color .1s;"
          onmouseover="this.style.color='#64748b'" onmouseout="this.style.color='#94a3b8'">
          <span>Settings &amp; info</span>
          <span id="sidebar-footer-chevron" style="font-size:14px;">${footerOpen ? '‹' : '›'}</span>
        </button>
        <div id="sidebar-footer-panel" style="display:${footerOpen ? 'block' : 'none'};padding:4px 8px 8px;">
          ${navItem('About',            'about',          cur, false)}
          ${navItem('Account Backup',   'account-backup', cur, false)}
          <a href="https://simpleaml.com.au/faq.html" target="_blank" rel="noopener"
            style="display:block;padding:6px 10px;font-size:12px;color:#64748b;text-decoration:none;border-radius:6px;"
            onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">FAQ ↗</a>
          <a href="https://simpleaml.com.au/contact.html" target="_blank" rel="noopener"
            style="display:block;padding:6px 10px;font-size:12px;color:#64748b;text-decoration:none;border-radius:6px;"
            onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">Contact ↗</a>
          <a href="https://simpleaml.com.au/disclaimer.html" target="_blank" rel="noopener"
            style="display:block;padding:6px 10px;font-size:12px;color:#64748b;text-decoration:none;border-radius:6px;"
            onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">Disclaimer ↗</a>
          <a href="https://simpleaml.com.au" target="_blank" rel="noopener"
            style="display:block;padding:6px 10px;font-size:12px;color:#94a3b8;text-decoration:none;border-radius:6px;"
            onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">← Exit to website</a>
        </div>
      </div>
    </div>`;
}
