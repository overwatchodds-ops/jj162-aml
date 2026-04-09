import { MATRIX } from '../state/matrix.js';

// ─── CLASSIFIER ───────────────────────────────────────────────────────────────
// Maps free-text service descriptions to AUSTRAC Table 6.
// Uses synonym matching with simple stemming to handle plurals and variants.

// ─── TOKENISE ─────────────────────────────────────────────────────────────────
function tokenise(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

// ─── STEM ─────────────────────────────────────────────────────────────────────
// Strip common suffixes so "trusts"→"trust", "secretarial"→"secretari"
function stem(w) {
  for (const suffix of ['ing', 'tion', 'ies', 'ial', 'ed', 'es', 's']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
      return w.slice(0, w.length - suffix.length);
    }
  }
  return w;
}

// ─── TOKEN MATCH ──────────────────────────────────────────────────────────────
// Match if stemmed forms are equal or one is a prefix of the other
function tokensMatch(a, b) {
  const sa = stem(a);
  const sb = stem(b);
  return sa === sb ||
    (sa.length >= 4 && sb.startsWith(sa)) ||
    (sb.length >= 4 && sa.startsWith(sb));
}

// ─── SCORE ROW ────────────────────────────────────────────────────────────────
// Score a single matrix row against user input.
// Only uses explicit synonyms — not task name words.
function scoreRow(synonyms, inputText, inputTokens) {
  let score = 0;
  for (const syn of synonyms) {
    // Full phrase match (strongest signal)
    if (syn.length > 5 && inputText.includes(syn)) {
      score += 10;
      continue;
    }
    const synTokens = tokenise(syn);
    if (!synTokens.length) continue;

    if (synTokens.length >= 2) {
      // Count how many synonym tokens match any input token (with stemming)
      const matched = synTokens.filter(st =>
        inputTokens.some(it => tokensMatch(st, it))
      ).length;
      // Require at least 66% of synonym tokens to match
      if (matched / synTokens.length >= 0.66) {
        score += 6;
      }
    } else {
      // Single-word synonym — only count if it matches an input token
      if (inputTokens.some(it => tokensMatch(synTokens[0], it))) {
        score += 3;
      }
    }
  }
  return score;
}

// ─── GREY ZONE DETECTION ─────────────────────────────────────────────────────
// Valuation grey zone is handled separately — triggered by keyword presence
function mentionsValuation(inputText) {
  return ['valuation', 'value a business', 'business valuation', 'prepare valuations']
    .some(w => inputText.includes(w));
}

// ─── CLASSIFY ─────────────────────────────────────────────────────────────────
// Main entry point.
// Returns { matched, notDesignated, greyZone }
export function classify(inputText) {
  const input = inputText.toLowerCase();
  const inputTokens = tokenise(inputText);
  const THRESHOLD = 6;

  const matched = [];
  const notDesignated = [];
  const greyZone = [];

  for (const row of MATRIX) {
    // Grey zone rows handled via keyword detection, not scoring
    if (row.status.includes('GREY')) {
      if (mentionsValuation(input)) {
        greyZone.push(row);
      }
      continue;
    }

    // Build synonym list — exclude synonyms that just repeat the task name
    const synonyms = (row.synonyms || []).filter(
      s => s.length > 3 && s !== row.task.toLowerCase()
    );

    const score = scoreRow(synonyms, input, inputTokens);
    if (score < THRESHOLD) continue;

    if (row.status === 'IN') {
      matched.push({ ...row, score });
    } else if (row.status === 'OUT') {
      notDesignated.push({ ...row, score });
    }
  }

  // Sort by score descending
  matched.sort((a, b) => b.score - a.score);
  notDesignated.sort((a, b) => b.score - a.score);

  return { matched, notDesignated, greyZone };
}

// ─── RESOLVE GREY ZONE ────────────────────────────────────────────────────────
// answer: 'yes' | 'no'
export function resolveGreyZone(row, answer) {
  if (answer === 'yes') {
    return { ...row, status: 'IN', table6: 'Item 2 (Buying/Selling Entities)', resolved: true };
  }
  return { ...row, status: 'OUT', resolved: true };
}
