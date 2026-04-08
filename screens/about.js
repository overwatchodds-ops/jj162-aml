import { S } from '../state/index.js';

export function screen() {
  return `
    <div class="py-8 space-y-8">

      <div>
        <h1 class="text-2xl font-bold text-slate-900">About SimpleAML</h1>
        <p class="text-sm text-slate-400 mt-1">Product information and release notes.</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div class="flex items-center gap-4">
          <div style="width:48px;height:48px;border-radius:12px;background:#4F46E5;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;">SA</div>
          <div>
            <div class="font-semibold text-slate-800">SimpleAML</div>
            <div class="text-xs text-slate-400 mt-0.5">Accountants Edition · v2.0 · March 2026</div>
          </div>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">SimpleAML is a free, browser-based AML/CTF compliance register for Australian accounting firms. It is designed to help practices meet their Tranche 2 obligations under the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.</p>
        <p class="text-sm text-slate-600 leading-relaxed">No account required. All data is stored locally in your browser on your device.</p>
        <div class="border-t border-slate-100 pt-4 text-xs text-slate-400">
          Developed by <strong class="text-slate-600">Click Seed Pty Ltd</strong> · ABN 87 656 256 567 · <a href="https://simpleaml.com.au" target="_blank" rel="noopener" class="text-indigo-500 hover:text-indigo-700">simpleaml.com.au</a>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <h2 class="text-sm font-bold text-slate-700">What's new — v2.0</h2>
        <div class="space-y-2 text-sm text-slate-600">
          <div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0 mt-0.5">→</span>Modular architecture — each section is now independently maintained</div>
          <div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0 mt-0.5">→</span>Redesigned navigation — top nav with group-aware sidebar</div>
          <div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0 mt-0.5">→</span>Firm split into Firm Details, Appointments, and AUSTRAC Enrolment</div>
          <div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0 mt-0.5">→</span>AUSTRAC Enrolment simplified to a single attestation</div>
          <div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0 mt-0.5">→</span>Compliance report rebuilt with contents page and 8 sections</div>
          <div class="flex items-start gap-2"><span class="text-indigo-400 flex-shrink-0 mt-0.5">→</span>Data backup and restore moved to dedicated Account Backup screen</div>
        </div>
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
        SimpleAML is provided for compliance assistance only and does not constitute legal advice. Users are responsible for their own AUSTRAC compliance. Click Seed Pty Ltd makes no warranty as to accuracy or fitness for purpose.
      </div>

    </div>`;
}
