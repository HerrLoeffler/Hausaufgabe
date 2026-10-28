// Teacher-only projection of persisted scoring facts. No answer regrading or writes.
const score = value => value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : NaN;
export function teacherGradingSummary(submission) {
  const s = submission || {};
  const total = score(s.totalPoints), maximum = score(s.maxPoints);
  const rows = Object.values(s.grading || {});
  let pendingCount = 0, rowTotal = 0, rowMaximum = 0;
  for (const g of rows) {
    const points = score(g && Object.hasOwn(g, 'awardedPoints') ? g.awardedPoints : g?.autoPoints), max = score(g?.maxPoints);
    const valid = Number.isFinite(points) && Number.isFinite(max) && max >= 0 && points >= 0 && points <= max;
    const technical = g?.reviewIssue === 'incomplete-transfer';
    const explicitlyOpen = ['deferred', 'open', 'conflict', 'stale'].includes(g?.reviewState);
    const acceptedByRule = g?.correct === true && score(g.autoPoints) === max && points === max;
    const decided = g?.reviewState === 'confirmed' || g?.needsReview === false || acceptedByRule;
    if (!valid || technical || explicitlyOpen || !decided) pendingCount++;
    if (valid) { rowTotal += points; rowMaximum += max; }
  }
  const legacyFinal = !rows.length && s.status === 'graded' && score(s.grade) >= 1 && score(s.grade) <= 6;
  const validTotal = Number.isFinite(total) && Number.isFinite(maximum) && maximum > 0 && total >= 0 && total <= maximum;
  const consistent = legacyFinal || (rows.length > 0 && Math.abs(rowTotal - total) < .051 && Math.abs(rowMaximum - maximum) < .051);
  if (!validTotal || !consistent || (s.recoveryReviewRequired && s.status !== 'graded')) pendingCount = Math.max(1, pendingCount);
  return {complete: pendingCount === 0, pendingCount, percent: validTotal ? Math.round(total / maximum * 100) : null};
}
