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

// Older submissions intentionally store a single name/initials label. Never infer a
// family name by splitting that label: compound names would silently sort wrong.
export function teacherResultName(submission = {}) {
  const text = value => typeof value === 'string' ? value.trim() : '';
  const firstName = text(submission.studentFirstName) || text(submission.firstName);
  const lastName = text(submission.studentLastName) || text(submission.lastName);
  const combinedName = [firstName, lastName].filter(Boolean).join(' ');
  return {
    firstName,
    lastName,
    label: text(submission.studentName) || combinedName || 'Ohne Name / Kürzel'
  };
}

export function teacherResultNumber(value) {
  const isNumericInput = typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '');
  if (!isNumericInput) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function teacherResultSubmittedAt(submission) {
  const raw = submission.submittedAt || submission.submittedAtLocal;
  if (!raw) return null;
  let milliseconds;
  if (typeof raw.toMillis === 'function') milliseconds = raw.toMillis();
  else if (typeof raw === 'object' && Number.isFinite(raw.seconds)) milliseconds = raw.seconds * 1000;
  else if (typeof raw === 'number') milliseconds = raw;
  else milliseconds = Date.parse(raw);
  return Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds : null;
}

export function teacherResultRunning(submission) {
  return ['running', 'in_progress', 'started'].includes(submission.status);
}

export function teacherResultFinal(submission, isPending = () => false) {
  return !teacherResultRunning(submission) &&
    teacherGradingSummary(submission).complete && !isPending(submission);
}

export function sortTeacherResults(submissions, key = 'submittedAt', direction = 'desc', isPending = () => false) {
  const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });
  const sign = direction === 'asc' ? 1 : -1;
  const sortValue = submission => {
    if (key === 'firstName' || key === 'lastName') {
      const name = teacherResultName(submission);
      const storedLabel = typeof submission.studentName === 'string' ? submission.studentName.trim() : '';
      return name[key] || storedLabel || null;
    }
    if (key === 'duration') {
      return teacherResultRunning(submission) ? null : teacherResultNumber(submission.elapsedSeconds);
    }
    if (key === 'points' || key === 'percent') {
      if (!teacherResultFinal(submission, isPending)) return null;
      if (key === 'points') return teacherResultNumber(submission.totalPoints);
      return Number(submission.totalPoints) / Number(submission.maxPoints) * 100;
    }
    return teacherResultSubmittedAt(submission);
  };

  // Copy and preserve original order for ties. Missing values stay last in either direction.
  const sorted = submissions.map((submission, index) => ({
    submission, index, value: sortValue(submission)
  }));
  sorted.sort((a, b) => {
    if (a.value === null && b.value === null) return a.index - b.index;
    if (a.value === null) return 1;
    if (b.value === null) return -1;
    const difference = typeof a.value === 'string'
      ? collator.compare(a.value, b.value)
      : a.value - b.value;
    return sign * difference || a.index - b.index;
  });
  return sorted.map(item => item.submission);
}

export function teacherResultsAverages(submissions, isPending = () => false) {
  const points = [], percentages = [], durations = [];
  let finalCount = 0, pendingCount = 0, runningCount = 0;
  for (const submission of submissions) {
    if (teacherResultRunning(submission)) {
      runningCount++;
      continue;
    }
    if (teacherResultFinal(submission, isPending)) {
      finalCount++;
      points.push(Number(submission.totalPoints));
      percentages.push(Number(submission.totalPoints) / Number(submission.maxPoints) * 100);
    } else {
      pendingCount++;
    }
    // Duration is independent of marking: every submitted, valid measured duration counts.
    const duration = teacherResultNumber(submission.elapsedSeconds);
    if (duration !== null) durations.push(duration);
  }
  const mean = values => ({
    value: values.length ? values.reduce((sum, number) => sum + number, 0) / values.length : null,
    count: values.length
  });
  return {
    totalCount: submissions.length, finalCount, pendingCount, runningCount,
    points: mean(points), percent: mean(percentages), duration: mean(durations)
  };
}
