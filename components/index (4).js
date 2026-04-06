// ─── COMPONENTS BARREL ────────────────────────────────────────────────────────
// Re-exports all components from their individual files.
// Screen files import from here — import paths never need to change
// when a new component is added. Just add a new file and one line below.

export { toast }       from './toast.js';
export { Sidebar }     from './sidebar.js';
export { ratingBadge } from './badges.js';
export { infoBtn, infoPop } from './infobox.js';
export { ratingRow }   from './ratingrow.js';
