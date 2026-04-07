import { S, DS_LIST, save } from '../state/index.js';
import { autoClientRiskRating } from '../logic/index.js';
import { toast } from '../components/index.js';

export function screen() {
  const d = S._serviceDraft || {};
  const clientIdx = S._serviceClientIdx;
  const client = clientIdx !== undefined ? S.clients[clientIdx] : null;
  if (!client) { go('clients'); return ''; }
  // Auto risk for new service
  const inds = client.individuals || [];
  const hasHit = inds.some(i => i.screenResult === 'PEP' || i.screenResult === 'Sanctions');
  const newServiceId = d.serviceName || '';
  const autoRisk = autoClientRiskRating(client.entityType, newServiceId, hasHit ? 'PEP' : null, {
    offshoreJurisdiction: client.offshoreJurisdiction,
    complexStructure: client.complexStructure,
    pepAmongControllers: client.pepAmongControllers,
    cashIntensiveIndustry: client.cashIntensiveIndustry,
  });
  const riskCls = autoRisk==='High'?'bg-red-100 text-red-700':autoRisk==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700';
  const currentRiskCls = client.risk==='High'?'bg-red-100 text-red-700':client.risk==='Medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700';
  const riskChanged = newServiceId && autoRisk !== client.risk;
  return `
    <div class="p-8 max-w-2xl space-y-6">
      <div class="flex items-center gap-4">
        <button onclick="go('clients')" class="text-slate-400 hover:text-slate-600 text-sm">← Client Register</button>
        <h1 class="text-2xl font-bold">Add Service — ${client.name}</h1>
      </div>
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
        Adding a new designated service to an existing client record. CDD has already been completed for this client. If the new service triggers a higher risk rating, you may need to update the client's CDD.
      </div>
      <div class="bg-white border rounded-xl p-5 space-y-4">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">New Designated Service</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="text-xs text-slate-500">Designated service *</label>
            <select id="svc-service" class="inp mt-1" onchange="updateServiceDraft('serviceName',this.value)">
              <option value="">— Select —</option>
              ${DS_LIST.map(ds=>`<option value="${ds.id}" ${d.serviceName===ds.id?'selected':''}>${ds.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-500">Date service provided *</label>
            <input id="svc-date" type="date" class="inp mt-1" value="${d.dateProvided||new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <label class="text-xs text-slate-500">New CDD required?</label>
            <select id="svc-newcdd" class="inp mt-1">
              <option value="false" ${!d.newCddRequired?'selected':''}>No — existing CDD sufficient</option>
              <option value="true" ${d.newCddRequired?'selected':''}>Yes — update CDD record</option>
            </select>
          </div>
        </div>
        ${newServiceId ? `
        <div class="border rounded-xl p-3 space-y-1">
          <div class="text-xs font-semibold text-slate-500">Risk impact</div>
          <div class="flex items-center gap-3 text-xs">
            <span class="text-slate-400">Current risk:</span>
            <span class="px-2 py-0.5 rounded-full font-semibold text-xs ${currentRiskCls}">${client.risk||'Low'}</span>
            <span class="text-slate-400">→ New service risk:</span>
            <span class="px-2 py-0.5 rounded-full font-semibold text-xs ${riskCls}">${autoRisk}</span>
            ${riskChanged ? `<span class="text-amber-600 font-semibold">⚠ Risk rating will change</span>` : `<span class="text-green-600">No change</span>`}
          </div>
          ${riskChanged ? `<p class="text-xs text-amber-600 mt-1">Consider setting "New CDD required" to Yes and updating the client record.</p>` : ''}
        </div>` : ''}
      </div>
      <div class="flex gap-3">
        <button onclick="go('clients')" class="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onclick="saveService()" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Add Service</button>
      </div>
    </div>`;

// SMR & INCIDENT REGISTER
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
window.startAddService = function(clientIdx) {
  S._serviceDraft = {};
  S._serviceClientIdx = clientIdx;
  go('addservice');
};
window.updateServiceDraft = function(key, val) {
  if (!S._serviceDraft) S._serviceDraft = {};
  S._serviceDraft[key] = val;
  go('addservice');
};
window.saveService = function() {
  const clientIdx = S._serviceClientIdx;
  const client = clientIdx !== undefined ? S.clients[clientIdx] : null;
  if (!client) { toast('Client not found', 'err'); return; }
  const serviceName = document.getElementById('svc-service')?.value;
  const dateProvided = document.getElementById('svc-date')?.value;
  const newCddRequired = document.getElementById('svc-newcdd')?.value === 'true';
  if (!serviceName) { toast('Service is required', 'err'); return; }
  if (!dateProvided) { toast('Date is required', 'err'); return; }
  if (!client.services) client.services = [];
  client.services.push({ serviceName, dateProvided, newCddRequired });
  client.updatedAt = Date.now();
  const inds = client.individuals || [];
  const hasHit = inds.some(i => i.screenResult === 'PEP' || i.screenResult === 'Sanctions');
  const newRisk = autoClientRiskRating(client.entityType, serviceName, hasHit ? 'PEP' : null, {
    offshoreJurisdiction: client.offshoreJurisdiction,
    complexStructure: client.complexStructure,
    pepAmongControllers: client.pepAmongControllers,
    cashIntensiveIndustry: client.cashIntensiveIndustry,
  });
  if (!client.riskOverride) client.risk = newRisk;
  delete S._serviceDraft;
  delete S._serviceClientIdx;
  save();
  toast('Service added' + (newCddRequired ? ' — remember to update CDD' : ''));
  go('clients');
};
