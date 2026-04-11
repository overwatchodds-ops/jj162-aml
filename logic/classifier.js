import { MATRIX, TABLE6_RISKS, TABLE6_LABELS } from '../state/matrix.js';

// ─── CLASSIFIER ───────────────────────────────────────────────────────────────
// Three-tier matching per input line:
//
// Tier 1 — exact match against task name (normalised)
// Tier 2 — exact match against explicit synonyms (hand-curated phrases)
// Tier 3 — no match → line returned as unrecognised, user prompted to fix
//
// No fuzzy matching. No negation. Each line processed independently.

// ─── NORMALISE ────────────────────────────────────────────────────────────────
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/[^a-z0-9\s&/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── TIER 1: TASK NAME MATCH ─────────────────────────────────────────────────
function matchTaskName(line) {
  const normLine = normalise(line);
  for (const row of MATRIX) {
    if (row.status.includes('GREY')) continue;
    const normTask = normalise(row.task);
    if (normLine === normTask) return row;
    if (normTask.length > 6 && normLine.includes(normTask)) return row;
  }
  return null;
}

// ─── TIER 2: EXPLICIT SYNONYM MATCH ──────────────────────────────────────────
function matchExplicitSynonym(line) {
  const normLine = normalise(line);
  for (const row of MATRIX) {
    if (row.status.includes('GREY')) continue;
    if (!row.explicit) continue;
    for (const syn of row.synonyms) {
      const normSyn = normalise(syn);
      if (normSyn.length < 3) continue;
      if (normLine.includes(normSyn)) return row;
    }
  }
  return null;
}

// ─── GREY ZONE ────────────────────────────────────────────────────────────────
function mentionsValuation(text) {
  const t = text.toLowerCase();
  return ['valuation', 'value a business', 'business valuation', 'prepare valuations']
    .some(w => t.includes(w));
}

// ─── CLASSIFY ─────────────────────────────────────────────────────────────────
// Returns { matched, notDesignated, unrecognised, greyZone }
//   matched       — IN rows (designated services found)
//   notDesignated — OUT rows (confirmed not in scope)
//   unrecognised  — lines that matched nothing (user must fix or remove)
//   greyZone      — grey zone rows (valuation context)
export function classify(inputText) {
  const lines = inputText
    .split(/[\n,;]+/)
    .map(l => l.trim())
    .filter(l => l.length > 1);

  const matchedMap   = new Map();
  const notDesMap    = new Map();
  const unrecognised = [];
  const greyZone     = [];

  if (mentionsValuation(inputText)) {
    for (const row of MATRIX) {
      if (row.status.includes('GREY')) greyZone.push(row);
    }
  }

  for (const line of lines) {
    // Tier 1
    let row = matchTaskName(line);
    // Tier 2
    if (!row) row = matchExplicitSynonym(line);
    // Tier 3 — no match
    if (!row) { unrecognised.push(line); continue; }

    if (row.status === 'IN') {
      if (!matchedMap.has(row.id)) matchedMap.set(row.id, { ...row });
    } else if (row.status === 'OUT') {
      if (!notDesMap.has(row.id)) notDesMap.set(row.id, { ...row });
    }
  }

  return {
    matched:       [...matchedMap.values()],
    notDesignated: [...notDesMap.values()],
    unrecognised,
    greyZone,
  };
}

// ─── COUNT TABLE 6 ITEMS ──────────────────────────────────────────────────────
export function countTable6Items(matched) {
  const items = new Set();
  for (const row of matched) {
    if (!row.table6) continue;
    const found = row.table6.match(/Item \d+/g) || [];
    found.forEach(m => items.add(m));
  }
  return [...items].sort((a, b) =>
    parseInt(a.replace('Item ', '')) - parseInt(b.replace('Item ', ''))
  );
}

// ─── EXTRACT RISK PATTERNS ───────────────────────────────────────────────────
export function extractRisks(matched) {
  const seen = new Set();
  const risks = [];
  for (const row of matched) {
    for (const itemNum of (row.table6_items || [])) {
      if (!seen.has(itemNum) && TABLE6_RISKS[itemNum]) {
        seen.add(itemNum);
        risks.push({
          item: itemNum,
          label: TABLE6_LABELS[itemNum],
          risk: TABLE6_RISKS[itemNum],
        });
      }
    }
  }
  return risks.sort((a, b) => a.item - b.item);
}

// ─── RESOLVE GREY ZONE ────────────────────────────────────────────────────────
export function resolveGreyZone(row, answer) {
  if (answer === 'yes') {
    return { ...row, status: 'IN', table6: 'Item 2 (Buying/Selling Entities)', resolved: true };
  }
  return { ...row, status: 'OUT', resolved: true };
}
