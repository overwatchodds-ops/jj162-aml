import { MATRIX } from '../state/matrix.js';

// ─── CLASSIFIER ───────────────────────────────────────────────────────────────
// Maps free-text service descriptions to AUSTRAC Table 6.
// Returns matched IN rows, OUT rows mentioned, and grey zone rows needing
// a clarifying question before they can be resolved.

// ─── TOKENISE ─────────────────────────────────────────────────────────────────
// Break input into normalised tokens for matching.
function tokenise(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

// ─── SCORE ────────────────────────────────────────────────────────────────────
// Score a single matrix row against the user input.
// Returns a match score — higher = stronger match.
// A score > 0 means at least one synonym phrase or keyword matched.
function scoreRow(row, inputText, inputTokens) {
  let score = 0;
  const input = inputText.toLowerCase();

  // Full phrase match (strongest signal)
  for (const syn of row.synonyms) {
    if (syn.length > 4 && input.includes(syn)) {
      score += 10;
    }
  }

  // Partial phrase match — check if all words in a synonym appear in input
  for (const syn of row.synonyms) {
    const synTokens = tokenise(syn);
    if (synTokens.length >= 2) {
      const allMatch = synTokens.every(st => inputTokens.includes(st));
      if (allMatch) score += 6;
    } else if (synTokens.length === 1 && inputTokens.includes(synTokens[0])) {
      score += 2;
    }
  }

  return score;
}

// ─── GREY ZONE DETECTION ─────────────────────────────────────────────────────
// Returns true if the input mentions valuation in a transaction context.
function mentionsValuation(inputText) {
  const input = inputText.toLowerCase();
  const valuationWords = ['valuation', 'valuation report', 'business valuation', 'value a business', 'prepare valuation'];
  return valuationWords.some(w => input.includes(w));
}

// ─── CLASSIFY ─────────────────────────────────────────────────────────────────
// Main entry point. Takes user input string.
// Returns { matched, notDesignated, greyZone }
// matched       — IN rows the classifier found
// notDesignated — OUT rows that were mentioned (reassurance list)
// greyZone      — rows needing clarification (grey zone)
export function classify(inputText) {
  const inputTokens = tokenise(inputText);
  const THRESHOLD = 4; // minimum score to count as a match

  const matched = [];       // IN rows
  const notDesignated = []; // OUT rows mentioned
  const greyZone = [];      // Grey zone rows

  for (const row of MATRIX) {
    const score = scoreRow(row, inputText, inputTokens);
    if (score < THRESHOLD) continue;

    if (row.status === 'IN') {
      matched.push({ ...row, score });
    } else if (row.status === 'OUT') {
      notDesignated.push({ ...row, score });
    } else if (row.status.includes('GREY')) {
      greyZone.push({ ...row, score });
    }
  }

  // Special case: if user mentions valuation but grey zone not scored,
  // still trigger the clarifying question
  if (mentionsValuation(inputText) && greyZone.length === 0) {
    const greyRow = MATRIX.find(r => r.status.includes('GREY'));
    if (greyRow) greyZone.push({ ...greyRow, score: 5 });
  }

  // Sort by score descending
  matched.sort((a, b) => b.score - a.score);
  notDesignated.sort((a, b) => b.score - a.score);

  return { matched, notDesignated, greyZone };
}

// ─── RESOLVE GREY ZONE ────────────────────────────────────────────────────────
// Called after user answers the grey zone clarifying question.
// answer: 'yes' | 'no'
// Returns the resolved row to add to matched or discard.
export function resolveGreyZone(row, answer) {
  if (answer === 'yes') {
    // Valuation is part of a transaction — it IS a designated service
    return { ...row, status: 'IN', resolved: true };
  }
  // Valuation is for tax/reporting only — OUT
  return { ...row, status: 'OUT', resolved: true };
}
