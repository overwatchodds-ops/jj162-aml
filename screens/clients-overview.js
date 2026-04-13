import { S } from '../state/index.js';

// ─── HELPERS (duplicated from clients.js — kept local to avoid import chain) ──
function cddStatus(c) {
  const inds = c.individuals || [];
  if (!inds.length) return 'Incomplete';
  if (inds.every(i => i.idOutcome === 'Verified') && inds.every(i => i.screenResult)) return 'Complete';
  return 'Incomplete';
}

function isOverdue(c) {
  if (cddStatus(c) !== 'Complete') return false;
  if (!c.nextReviewDate) return false; // not set — not counted as overdue
  return new Date(c.nextReviewDate) < new Date();
}

export function screen() {
  const clients = S.clients || [];
  const incidents = S.incidents || [];

  const incomplete = clients.filter(c => cddStatus(c) !== 'Complete').length;
  const overdue    = clients.filter(c => isOverdue(c)).length;
  const openSmrs   = incidents.filter(i => !i.status || i.status === 'Open').length;

  const allOk = incomplete === 0 && overdue === 0 && openSmrs === 0;

  const card = (title, count, desc, screen, urgent) => `
  <div onclick="go('${screen}')" style="background:#fff;border:0.5px solid ${urgent && count > 0 ? '#fde68a' : '#e2e8f0'};border-radius:12px;padding:18px;cursor:pointer;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe'" onmouseout="this.style.borderColor='${urgent && count > 0 ? '#fde68a' : '#e2e8f0'}'">
    <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:10px;">${title}</div>
    <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px;">
      <span style="font-size:28px;font-weight:500;color:${urgent && count > 0 ? '#d97706' : count === 0 ? '#16a34a' : '#0f172a'};line-height:1;">${count}</span>
      <span style="font-size:11px;color:#94a3b8;">${count === 1 ? desc.singular : desc.plural}</span>
    </div>
    <div style="font-size:11px;color:${urgent && count > 0 ? '#d97706' : '#94a3b8'};">${count > 0 ? desc.action : desc.clear}</div>
  </div>`;

  return `<div style="max-width:860px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Clients</h1>
      <p style="font-size:13px;color:#64748b;">Customer due diligence, ongoing screening, and suspicious matter reporting.</p>
    </div>

    ${allOk && clients.length > 0 ? `
    <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:10px;padding:12px 16px;font-size:13px;color:#166534;margin-bottom:16px;">
      All ${clients.length} client${clients.length !== 1 ? 's' : ''} have complete and current CDD. No open SMRs.
    </div>` : ''}

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px;">

      ${card(
        'Incomplete CDD',
        incomplete,
        { singular: 'client', plural: 'clients', action: 'CDD must be completed before providing a designated service.', clear: 'All clients have complete CDD.' },
        'clients',
        true
      )}

      ${card(
        'Screening Overdue',
        overdue,
        { singular: 'client', plural: 'clients', action: 'Re-screening required based on client risk rating.', clear: 'All screening is current.' },
        'clients',
        true
      )}

      ${card(
        'Open SMRs',
        openSmrs,
        { singular: 'open incident', plural: 'open incidents', action: 'Review open matters and update AMLCO outcome.', clear: 'No open incidents.' },
        'incidents',
        true
      )}

    </div>

    <!-- QUICK ACTIONS -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:16px;">
      <div style="font-size:12px;font-weight:500;color:#0f172a;margin-bottom:12px;">Quick actions</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
        <button onclick="go('clients')" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">Client Register</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">View all clients, CDD status and screening</div>
          </div>
        </button>
        <button onclick="go('newclient')" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">New Client (CDD)</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Add a new client and complete due diligence</div>
          </div>
        </button>
        <button onclick="go('incidents')" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">SMR &amp; Incident Register</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">View and manage all suspicious matter records</div>
          </div>
        </button>
        <button onclick="startNewIncident()" style="display:flex;align-items:center;gap:10px;padding:12px;border:0.5px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;text-align:left;transition:border-color .1s;" onmouseover="this.style.borderColor='#c7d2fe';this.style.background='#fafbff'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
          <div>
            <div style="font-size:12px;font-weight:500;color:#0f172a;">New Incident / SMR</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Log a suspicious matter or compliance event</div>
          </div>
        </button>
      </div>
    </div>

    ${clients.length === 0 ? `
    <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">No clients yet.</div>
      <div style="font-size:11px;color:#cbd5e1;margin-bottom:16px;">Add your first client to begin building your CDD register.</div>
      <button onclick="go('newclient')" style="font-size:12px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;">+ New client</button>
    </div>` : ''}

  </div>`;
}
