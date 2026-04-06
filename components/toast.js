// Toast notification — shows a brief message at the bottom of the screen.
// type: 'err' for red, omit for dark slate.
export function toast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  t.style.background = type === 'err' ? '#dc2626' : '#1e293b';
  clearTimeout(window._toast);
  window._toast = setTimeout(() => t.style.display = 'none', 2500);
}
