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

  // Match against the task name itself — covers suggestion-selected text
  const taskLower = row.task.toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')  // strip parenthetical notes
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  if (taskLower.length > 5 && inputText.includes(taskLower)) {
    score += 12; // High confidence — exact task name match
  } else {
    const taskTokens = tokenise(row.task);
    if (taskTokens.length >= 2) {
      const matched = taskTokens.filter(st =>
        inputTokens.some(it => tokensMatch(st, it))
      ).length;
      if (matched / taskTokens.length >= 0.75) {
        score += 8;
      }
    }
  }

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

// ─── NEGATION DETECTION ───────────────────────────────────────────────────────
// Phrases that, when present in the input, indicate the user is describing
// an OUT-of-scope activity even if keywords otherwise match IN rows.
// Format: { phrase, suppressItems }
// suppressItems: Table 6 item numbers to suppress matches for.
// If suppressItems is empty, suppresses ALL IN matches for that phrase.
const NEGATION_RULES = [
  // Payroll without fund movement — explicitly out of scope
  { phrase: 'without fund movement',    suppressItems: [4] },
  { phrase: 'no fund movement',         suppressItems: [4] },
  { phrase: 'no payment authority',     suppressItems: [4] },
  { phrase: 'no payments',              suppressItems: [4] },
  { phrase: 'calculations only',        suppressItems: [4] },
  { phrase: 'reporting only',           suppressItems: [2, 3, 4, 5] },
  { phrase: 'read only',                suppressItems: [3, 4] },
  { phrase: 'read-only',                suppressItems: [3, 4] },
  { phrase: 'report only',              suppressItems: [2, 3, 4, 5] },
  { phrase: 'no execution',             suppressItems: [2, 5, 6, 7] },
  { phrase: 'no implementation',        suppressItems: [2, 5, 6, 7] },
  { phrase: 'advisory only',            suppressItems: [2, 5, 6, 7] },
  { phrase: 'internal reporting',       suppressItems: [2, 3, 4, 5] },
  { phrase: 'tax reporting only',       suppressItems: [2, 3, 4, 5] },
  { phrase: 'payroll tax reporting',    suppressItems: [4] },
  { phrase: 'fbt reporting',            suppressItems: [4] },
  { phrase: 'non-court',                suppressItems: [3] },
  { phrase: 'no fund control',          suppressItems: [3, 4] },
];

function getSuppressedItems(input) {
  const suppressed = new Set();
  for (const rule of NEGATION_RULES) {
    if (input.includes(rule.phrase)) {
      rule.suppressItems.forEach(n => suppressed.add(n));
    }
  }
  return suppressed;
}

// ─── CLASSIFY ─────────────────────────────────────────────────────────────────
// Two-pass architecture:
// Pass 1 — explicit synonyms only (high confidence, threshold 6)
// Pass 2 — fallback fuzzy matching (lower confidence, threshold 8)
//          Only runs if Pass 1 finds no IN matches.
//          Pass 2 results are flagged with { fuzzy: true } for UI warning.
// Returns { matched, notDesignated, greyZone, fuzzyPass }
export function classify(inputText) {
  const input = inputText.toLowerCase();

  // Split input into lines — negation is applied per line to avoid cross-line suppression
  const lines = input.split(/[\n,;]+/).map(l => l.trim()).filter(l => l.length > 1);

  const matchedMap = new Map();   // row.id → result (dedup across lines)
  const notDesMap  = new Map();
  const greyZone   = [];
  let anyFuzzy     = false;

  // Grey zone — check full input
  for (const row of MATRIX) {
    if (row.status.includes('GREY') && mentionsValuation(input)) {
      greyZone.push(row);
    }
  }

  const explicitRows = MATRIX.filter(r => r.explicit  && !r.status.includes('GREY'));
  const fuzzyRows    = MATRIX.filter(r => !r.explicit && !r.status.includes('GREY'));

  // Process each line independently
  for (const line of lines) {
    const lineTokens = [...new Set(tokenise(line))];
    const lineSuppressed = getSuppressedItems(line);  // negation scoped to this line only

    // ── PASS 1: explicit rows ──────────────────────────────────────────────
    let lineHasIn = false;
    for (const row of explicitRows) {
      const score = scoreRow(row, line, lineTokens);
      if (score < 6) continue;
      if (row.status === 'IN') {
        const rowItems = row.table6_items || [];
        if (rowItems.length > 0 && rowItems.every(n => lineSuppressed.has(n))) {
          if (!notDesMap.has(row.id)) notDesMap.set(row.id, { ...row, score });
          continue;
        }
        if (!matchedMap.has(row.id)) matchedMap.set(row.id, { ...row, score });
        lineHasIn = true;
      } else if (row.status === 'OUT') {
        if (!notDesMap.has(row.id)) notDesMap.set(row.id, { ...row, score });
      }
    }

    // ── PASS 2: fuzzy rows — only if Pass 1 found no IN for this line ─────
    if (!lineHasIn) {
      for (const row of fuzzyRows) {
        const score = scoreRow(row, line, lineTokens);
        if (score < 8) continue;
        if (row.status === 'IN') {
          const rowItems = row.table6_items || [];
          if (rowItems.length > 0 && rowItems.every(n => lineSuppressed.has(n))) {
            if (!notDesMap.has(row.id)) notDesMap.set(row.id, { ...row, score, fuzzy: true });
            continue;
          }
          if (!matchedMap.has(row.id)) {
            matchedMap.set(row.id, { ...row, score, fuzzy: true });
            anyFuzzy = true;
          }
        } else if (row.status === 'OUT') {
          if (!notDesMap.has(row.id)) notDesMap.set(row.id, { ...row, score, fuzzy: true });
        }
      }
    }
  }

  const matched = [...matchedMap.values()].sort((a, b) => b.score - a.score);
  const notDesignated = [...notDesMap.values()].sort((a, b) => b.score - a.score);

  return { matched, notDesignated, greyZone, fuzzyPass: anyFuzzy };
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
