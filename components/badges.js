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
