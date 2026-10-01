// Input is already-authorized, server-derived aggregate session data, not student answers.
export function classroomReliability(rows) {
  const unique = new Map();
  for (const row of rows) {
    if (!row || typeof row.session_id !== 'string' || !row.session_id || !Number.isInteger(row.expected) || row.expected < 0 || !Number.isInteger(row.ready_within_60s) || row.ready_within_60s < 0 || row.ready_within_60s > row.expected) throw new TypeError('Invalid session aggregate');
    const values = { expected: row.expected, ready_within_60s: row.ready_within_60s };
    const previous = unique.get(row.session_id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(values)) throw new TypeError('Conflicting duplicate session');
    unique.set(row.session_id, values);
  }
  const eligible = [...unique.values()].filter(row => row.expected > 0);
  const successful = eligible.filter(row => row.ready_within_60s * 10 >= row.expected * 9).length;
  return { definition_version: 1, observed_sessions: unique.size, eligible_sessions: eligible.length,
    excluded_unknown_expected: unique.size - eligible.length, successful_sessions: successful,
    rate: eligible.length ? successful / eligible.length : null,
    low_sample: eligible.length < 20 };
}
