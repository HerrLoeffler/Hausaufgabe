// Shared v1 contract. No transport, persistence, DOM capture or automatic activation.
const count = max => value => Number.isInteger(value) && value >= 0 && value <= max;
const oneOf = values => value => values.includes(value);
const milliseconds = count(86_400_000);
export const EVENT_RULES = Object.freeze({
  'teacher.preparation.completed': { active_ms: milliseconds, edits: count(10000), regenerated: count(10000) },
  'classroom.join.completed': { elapsed_ms: milliseconds, outcome: oneOf(['ready', 'failed', 'cancelled']), stage: oneOf(['page', 'code', 'load', 'ready']) },
  'classroom.session.ended': { outcome: oneOf(['completed', 'blocked', 'abandoned', 'unknown']), expected: count(1000), ready_within_60s: count(1000) },
  'game.session.ended': { active_ms: milliseconds, outcome: oneOf(['completed', 'abandoned', 'blocked', 'unknown']), completed_steps: count(10000), total_steps: count(10000), hints: count(10000) },
  'ai.generation.completed': { elapsed_ms: milliseconds, input_tokens: count(10000000), output_tokens: count(10000000), cached_tokens: count(10000000), retries: count(100), outcome: oneOf(['passed', 'rejected', 'failed']) },
  'ai.question.reviewed': { action: oneOf(['accepted', 'edited', 'regenerated', 'deleted']), used_in_session: oneOf([true, false]) },
  'system.error.occurred': { code: oneOf(['network', 'timeout', 'permission', 'validation', 'unexpected']), stage: oneOf(['join', 'generation', 'editor', 'submission', 'game']), severity: oneOf(['warning', 'error', 'blocking']) }
});
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
function exactKeys(value, keys) {
  if (!plain(value) || Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value, k))) throw new TypeError('Unexpected or missing telemetry fields');
}
export function validateEvent(event) {
  exactKeys(event, ['schema_version', 'event_id', 'session_id', 'timestamp', 'environment', 'release_commit', 'name', 'properties']);
  if (event.schema_version !== 1 || !uuid(event.event_id) || !uuid(event.session_id)) throw new TypeError('Invalid event identity');
  if (!['production', 'staging', 'local'].includes(event.environment) || !/^[a-f0-9]{40}$/.test(event.release_commit)) throw new TypeError('Invalid environment/release');
  if (typeof event.timestamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(event.timestamp) || !Number.isFinite(Date.parse(event.timestamp)) || new Date(event.timestamp).toISOString() !== event.timestamp) throw new TypeError('Invalid timestamp');
  const rules = Object.hasOwn(EVENT_RULES, event.name) ? EVENT_RULES[event.name] : null;
  if (!rules) throw new TypeError('Unknown event');
  exactKeys(event.properties, Object.keys(rules));
  for (const [key, check] of Object.entries(rules)) if (!check(event.properties[key])) throw new TypeError('Invalid property: ' + key);
  const p = event.properties;
  if (event.name === 'game.session.ended' && p.completed_steps > p.total_steps) throw new TypeError('Progress exceeds total');
  if (event.name === 'classroom.session.ended' && p.ready_within_60s > p.expected) throw new TypeError('Ready exceeds expected');
  if (event.name === 'ai.generation.completed' && p.cached_tokens > p.input_tokens) throw new TypeError('Cached tokens exceed input tokens');
  return structuredClone(event);
}
export function createTelemetry({ enabled = false, capacity = 100, context, now = () => new Date(), newId = () => globalThis.crypto.randomUUID() } = {}) {
  if (typeof enabled !== 'boolean' || !Number.isInteger(capacity) || capacity < 1 || capacity > 200) throw new TypeError('Invalid collector options');
  const buffer = [];
  return Object.freeze({
    record(name, properties) {
      if (!enabled) return false;
      const event = validateEvent({ schema_version: 1, event_id: newId(), session_id: context?.session_id,
        timestamp: now().toISOString(), environment: context?.environment, release_commit: context?.release_commit, name, properties });
      buffer.push(event);
      if (buffer.length > capacity) buffer.shift();
      return true;
    },
    snapshot: () => structuredClone(buffer),
    clear() { buffer.length = 0; }
  });
}
