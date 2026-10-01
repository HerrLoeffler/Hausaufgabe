export function normalizeFreeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("de")
    .replace(/[„“”"'’`´]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value) {
  return normalizeFreeText(value).split(" ").filter(Boolean);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let left = i;
    let diagonal = i - 1;
    for (let j = 1; j <= b.length; j += 1) {
      const up = previous[j];
      const next = Math.min(
        up + 1,
        left + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = up;
      previous[j] = next;
      left = next;
    }
    previous[0] = i;
  }
  return previous[b.length];
}

function editSimilarity(a, b) {
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return Math.max(0, 1 - levenshtein(a, b) / max);
}

function tokenSimilarity(a, b) {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (!left.size && !right.size) return 1;
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach(token => { if (right.has(token)) intersection += 1; });
  const precision = intersection / left.size;
  const recall = intersection / right.size;
  return precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
}

export function freeTextSimilarity(given, reference) {
  const a = normalizeFreeText(given);
  const b = normalizeFreeText(reference);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const edit = editSimilarity(a, b);
  const token = tokenSimilarity(a, b);
  const contained = (a.length >= 5 && b.length >= 5 && (a.includes(b) || b.includes(a))) ? 0.82 : 0;
  return Math.max(contained, edit * 0.62 + token * 0.38);
}

export function classifyFreeTextAnswer({ given, acceptedAnswers = [], manualReview = false, maxPoints = 0 } = {}) {
  const references = (Array.isArray(acceptedAnswers) ? acceptedAnswers : [acceptedAnswers])
    .map(value => String(value ?? "").trim())
    .filter(Boolean);
  const answer = normalizeFreeText(given);
  const max = Math.max(0, Number(maxPoints) || 0);

  if (!references.length) {
    return {
      level: "red",
      label: "Unklar",
      reason: "Für diese Freitextaufgabe ist keine Musterlösung hinterlegt.",
      confidence: 0,
      suggestedPoints: null,
      requiresTeacherReview: true,
      matchedReference: ""
    };
  }

  if (!answer) {
    return {
      level: "red",
      label: "Keine Antwort",
      reason: "Es wurde keine Freitextantwort abgegeben.",
      confidence: 1,
      suggestedPoints: 0,
      requiresTeacherReview: false,
      matchedReference: ""
    };
  }

  const ranked = references
    .map(reference => ({ reference, score: freeTextSimilarity(answer, reference) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const exact = best.score >= 0.999999;

  if (exact) {
    return {
      level: "green",
      label: "Eindeutig",
      reason: "Die Antwort stimmt mit einer hinterlegten Musterlösung überein.",
      confidence: 1,
      suggestedPoints: max,
      requiresTeacherReview: Boolean(manualReview),
      matchedReference: best.reference
    };
  }

  if (best.score >= 0.72) {
    return {
      level: "yellow",
      label: "Prüfen",
      reason: "Die Antwort ähnelt einer Musterlösung, weicht aber in der Formulierung ab.",
      confidence: Number(best.score.toFixed(3)),
      suggestedPoints: best.score >= 0.88 ? max : null,
      requiresTeacherReview: true,
      matchedReference: best.reference
    };
  }

  return {
    level: "red",
    label: "Unklar",
    reason: "Die Antwort weicht deutlich von den hinterlegten Musterlösungen ab. Sie kann trotzdem fachlich richtig sein und sollte geprüft werden.",
    confidence: Number(best.score.toFixed(3)),
    suggestedPoints: null,
    requiresTeacherReview: true,
    matchedReference: best.reference
  };
}

export function summarizeFreeTextClassifications(classifications = []) {
  return classifications.reduce((summary, item) => {
    if (item?.level && Object.hasOwn(summary, item.level)) summary[item.level] += 1;
    return summary;
  }, { green: 0, yellow: 0, red: 0 });
}
