'use strict';
const { digest, fail, int, id } = require('./routing-policy');

/** Pure queue planner. Runs periodically or on a new model/version, never on every classroom request.
 * Worker must claim each operationId through the SAME durable evaluation budget before paid work.
 */
function planEvaluations(candidates, { now, period, maximumJobs, remainingMicros, remainingCalls }) {
  if (!Number.isFinite(now) || !id(period) || !int(maximumJobs, 0, 100) || !int(remainingMicros) || !int(remainingCalls)) fail('INVALID_EVALUATION_BUDGET');
  const seen = new Set();
  const eligible = candidates.filter(c => {
    if (!id(c.id) || seen.has(c.id) || !int(c.reservedMicros, 1) || !int(c.calls, 1)
      || !Number.isFinite(c.nextReviewAt) || !int(c.priority, 0, 10)) fail('INVALID_EVALUATION_CANDIDATE');
    seen.add(c.id); return c.nextReviewAt <= now;
  }).sort((a, b) => b.priority - a.priority || a.nextReviewAt - b.nextReviewAt || a.id.localeCompare(b.id));
  const jobs = []; let cost = 0, calls = 0;
  for (const c of eligible) {
    if (jobs.length >= maximumJobs) break;
    if (cost + c.reservedMicros > remainingMicros || calls + c.calls > remainingCalls) continue;
    cost += c.reservedMicros; calls += c.calls;
    jobs.push({ candidateId: c.id, operationId: `eval-${digest(`${period}:${c.id}`)}`, bucket: 'evaluation',
      reservedMicros: c.reservedMicros, calls: c.calls });
  }
  return { jobs, reservedMicros: cost, calls, deferred: eligible.length - jobs.length };
}
module.exports = { planEvaluations };
