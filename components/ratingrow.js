import { ratingBadge } from './badges.js';

// Rating row — displays an auto-calculated risk rating with optional override UI
export function ratingRow(label, auto, override, overrideKey, justKey, scopeVal) {
  const isOverridden = !!override && override !== auto;
  return `
    <div class="border rounded-xl p-4 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">${label}</span>
        <div class="flex items-center gap-2">
          ${auto
            ? `<span class="text-xs text-slate-400">Auto-calculated:</span> ${ratingBadge(auto)}`
            : `<span class="text-xs text-slate-400 italic">Complete selections above</span>`}
          ${auto && !isOverridden
            ? `<button type="button" onclick="startOverride('${overrideKey}','${justKey}')" class="text-xs text-indigo-500 hover:text-indigo-700 underline ml-1">Override</button>`
            : ''}
        </div>
      </div>
      ${isOverridden ? `
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-700">Override applied: ${ratingBadge(override)}</span>
            <button type="button" onclick="clearOverride('${overrideKey}','${justKey}')" class="text-xs text-slate-400 hover:text-red-500">Remove override</button>
          </div>
          <div><label class="text-xs text-amber-700">Justification (required for audit trail)</label>
            <textarea class="inp mt-1 text-xs" rows="2" placeholder="Explain why your professional judgement differs from the system calculation..." onchange="scopeField('${justKey}',this.value)">${scopeVal || ''}</textarea>
          </div>
        </div>` : ''}
      ${auto && !isOverridden
        ? `<p class="text-xs text-slate-400 italic">System-derived from your selections, aligned with AUSTRAC guidance. Override only if your professional judgement differs — a justification will be required.</p>`
        : ''}
    </div>`;
}
