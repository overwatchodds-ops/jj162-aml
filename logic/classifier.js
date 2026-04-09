import { MATRIX, TABLE6_RISKS, TABLE6_LABELS } from '../state/matrix.js';

// ─── CLASSIFIER ───────────────────────────────────────────────────────────────
// Maps free-text service descriptions to AUSTRAC Table 6.
// Two-tier matching: explicit synonyms (from spreadsheet) use threshold 6,
// fallback task-word synonyms use threshold 8 to avoid over-matching.

// ─── TOKENISE ─────────────────────────────────────────────────────────────────
function tokenise(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

// ─── STEM ─────────────────────────────────────────────────────────────────────
// Strip common suffixes: "trusts"→"trust", "secretarial"→"secretari"
function stem(w) {
  for (const suffix of ['ing', 'tion', 'ies', 'ial', 'ed', 'es', 's']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
      return w.slice(0, w.length - suffix.length);
    }
  }
  return w;
}

// ─── TOKEN MATCH ──────────────────────────────────────────────────────────────
function tokensMatch(a, b) {
  const sa = stem(a);
  const sb = stem(b);
  return sa === sb ||
    (sa.length >= 4 && sb.startsWith(sa)) ||
    (sb.length >= 4 && sa.startsWith(sb));
}

// ─── SCORE ROW ────────────────────────────────────────────────────────────────
function scoreRow(row, inputText, inputTokens) {
  let score = 0;
  for (const syn of row.synonyms) {
    // Full phrase match in input text
    if (syn.length > 5 && inputText.includes(syn)) {
      score += 10;
      continue;
    }
    const synTokens = tokenise(syn);
    if (!synTokens.length) continue;

    if (synTokens.length >= 2) {
      const matched = synTokens.filter(st =>
        inputTokens.some(it => tokensMatch(st, it))
      ).length;
      if (matched / synTokens.length >= 0.66) {
        score += 6;
      }
    } else {
      // Single-word synonyms score less for fallback rows
      if (inputTokens.some(it => tokensMatch(synTokens[0], it))) {
        score += row.explicit ? 3 : 2;
      }
    }
  }
  return score;
}

// ─── GREY ZONE DETECTION ─────────────────────────────────────────────────────
function mentionsValuation(inputText) {
  return ['valuation', 'value a business', 'business valuation', 'prepare valuations']
    .some(w => inputText.includes(w));
}

// ─── CLASSIFY ─────────────────────────────────────────────────────────────────
// Returns { matched, notDesignated, greyZone }
// matched        — IN rows found
// notDesignated  — OUT rows found (reassurance list)
// greyZone       — rows needing clarification
export function classify(inputText) {
  const input = inputText.toLowerCase();
  const inputTokens = [...new Set(tokenise(inputText))];

  const matched = [];
  const notDesignated = [];
  const greyZone = [];

  for (const row of MATRIX) {
    // Grey zone handled by keyword detection only
    if (row.status.includes('GREY')) {
      if (mentionsValuation(input)) greyZone.push(row);
      continue;
    }

    // Two-tier threshold: explicit synonyms = 6, fallback task words = 8
    const THRESHOLD = row.explicit ? 6 : 8;
    const score = scoreRow(row, input, inputTokens);
    if (score < THRESHOLD) continue;

    if (row.status === 'IN') {
      matched.push({ ...row, score });
    } else if (row.status === 'OUT') {
      notDesignated.push({ ...row, score });
    }
  }

  matched.sort((a, b) => b.score - a.score);
  notDesignated.sort((a, b) => b.score - a.score);

  return { matched, notDesignated, greyZone };
}

// ─── COUNT TABLE 6 ITEMS ──────────────────────────────────────────────────────
// Returns unique Table 6 item numbers from matched rows.
// Handles combined values like "Item 6 / 7 (Managing Entities / Formation Agent)".
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
// From matched IN rows, extract unique Table 6 item numbers and return
// the corresponding risk patterns. Deduplicated — one pattern per item.
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
// answer: 'yes' | 'no'
export function resolveGreyZone(row, answer) {
  if (answer === 'yes') {
    return { ...row, status: 'IN', table6: 'Item 2 (Buying/Selling Entities)', resolved: true };
  }
  return { ...row, status: 'OUT', resolved: true };
}
