import { S } from '../state/index.js';

export function screen() {
  const history = S.report?.history || [];
  const lastGenerated = history[0] || null;

  return `
    <div class="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Reports</h1>
        <p class="text-slate-400 text-sm mt-1">Generate and manage your AML/CTF compliance reports.</p>
      </div>

      <!-- REPORT STATUS -->
      <div class="bg-white border rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold text-slate-700">AML/CTF Compliance Report</div>
            <div class="text-xs text-slate-400 mt-0.5">A full summary of your firm's AML/CTF compliance records across all sections.</div>
          </div>
          ${lastGenerated
            ? `<span class="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">✓ Generated</span>`
            : `<span class="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full">⚠ Not yet generated</span>`}
        </div>

        ${lastGenerated ? `
        <div class="bg-slate-50 border rounded-xl p-3 text-xs">
          <div class="text-slate-500 mb-1">Last generated</div>
          <div class="font-semibold text-slate-700">${lastGenerated.date}</div>
          ${lastGenerated.location ? `<div class="text-slate-400 mt-0.5">Stored: ${lastGenerated.location}</div>` : ''}
        </div>` : `
        <div class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
          No report has been generated yet. Generate your first report to create a compliance summary you can file and retain for the 7-year AUSTRAC requirement.
        </div>`}

        <button onclick="go('report')" class="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
          ${lastGenerated ? 'Generate New Report' : 'Generate First Report'} →
        </button>
      </div>

      <!-- REPORT HISTORY -->
      ${history.length > 0 ? `
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Generation history</h2>
        <div class="space-y-1">
          ${history.slice(0, 5).map((h, i) => `
            <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <div class="text-xs font-semibold text-slate-700">${h.date}</div>
                ${h.location ? `<div class="text-xs text-slate-400 mt-0.5">Stored: ${h.location}</div>` : `<div class="text-xs text-slate-400 italic mt-0.5">Storage location not recorded</div>`}
              </div>
            </div>`).join('')}
          ${history.length > 5 ? `<div class="text-xs text-slate-400 pt-1">+ ${history.length - 5} more — <button onclick="go('report')" class="underline">view all</button></div>` : ''}
        </div>
      </div>` : ''}

      <!-- WHAT THE REPORT CONTAINS -->
      <div class="bg-white border rounded-xl p-5 space-y-3">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">What this report contains</h2>
        <div class="space-y-1 text-xs text-slate-500">
          ${['1. Firm profile — practice details and compliance appointments',
             '2. AML/CTF risk assessment — designated services, inherent risk ratings',
             '3. AML/CTF program — documents, approval history',
             '4. AUSTRAC enrolment — controls declaration, enrolment details',
             '5. Staff assessment & vetting — Key Personnel, fit & proper checks',
             '6. AML/CTF training register — training records',
             '7. Client register — CDD status, entity types',
             '8. SMR & incident register — suspicious matter reports'
          ].map(item => `<div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0">→</span>${item}</div>`).join('')}
        </div>
        <div class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
          This report must be retained for <strong>7 years</strong> as required under the AML/CTF Act 2006. Save the generated PDF to your firm's records immediately after generation.
        </div>
      </div>
    </div>`;
}
