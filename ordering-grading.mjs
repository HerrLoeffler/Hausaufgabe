// Ordering answers are stored as zero-based indexes into the question's items.
export function validOrder(order, length) {
  return Array.isArray(order) && order.length === length
    && new Set(order).size === length
    && order.every(index => Number.isInteger(index) && index >= 0 && index < length);
}

export function acceptedOrderingOrders(question) {
  const length = question.items?.length || 0;
  const primary = Array.from({ length }, (_, index) => index);
  const extras = Array.isArray(question.acceptedOrders) ? question.acceptedOrders : [];
  const unique = new Map();
  for (const order of [primary, ...extras]) {
    if (validOrder(order, length)) unique.set(order.join(","), order);
  }
  return [...unique.values()];
}

export function gradeOrdering(question, given) {
  const length = question.items?.length || 0;
  const values = Array.isArray(given) ? given.map(String) : [];
  const counts = acceptedOrderingOrders(question).map(order =>
    order.reduce((count, index, position) => count + (values[position] === String(index) ? 1 : 0), 0));
  const good = Math.max(0, ...counts);
  return { good, total: length, correct: length > 0 && values.length === length && good === length };
}

export function orderingNeedsReview(question) {
  return question.manualReview === true || /\bsatz(?:es|baustein\w*|bau\w*|glieder\w*|stellung\w*)?\b|\bsätze\b|\bwörter\s+(?:zu\s+einem\s+)?satz/iu.test(String(question.text || ""));
}
