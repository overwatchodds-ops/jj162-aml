// ─── COMPONENTS ───────────────────────────────────────────────────────────────
// Reusable UI helper functions used across multiple screens.
// These return HTML strings only — no state reads, no side effects.

// Risk rating badge — coloured pill showing High / Medium / Low
export function ratingBadge(rating) {
  if (!rating) return '<span class="text-xs text-slate-400">Not yet calculated</span>';
  const cls = rating === 'High'
    ? 'bg-red-100 text-red-700'
    : rating === 'Medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700';
  return `<span class="text-xs font-bold px-3 py-1 rounded-full ${cls}">${rating}</span>`;
}

// Info button — small indigo (i) button that toggles a tooltip by id
export function infoBtn(id) {
  return `<button type="button" onclick="var t=document.getElementById('${id}');t.style.display=t.style.display==='block'?'none':'block'" class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold cursor-pointer flex-shrink-0 hover:bg-indigo-600">i</button>`;
}

// Info popover — dark tooltip panel hidden by default, toggled by infoBtn
export function infoPop(id, content) {
  return `<div id="${id}" style="display:none" class="bg-slate-800 text-slate-200 rounded-xl p-4 text-xs leading-relaxed mt-2">${content}</div>`;
}

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
