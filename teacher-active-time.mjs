function safeTime(value) {
  const time = Number(value);
  if (!Number.isFinite(time) || time < 0) throw new TypeError('timestamp must be a non-negative finite number');
  return time;
}

export function createTeacherActiveTimeTracker({ now = () => Date.now(), idleAfterMs = 60_000 } = {}) {
  if (!Number.isFinite(idleAfterMs) || idleAfterMs < 1_000 || idleAfterMs > 15 * 60_000) {
    throw new TypeError('idleAfterMs must be between 1s and 15min');
  }

  let running = false;
  let startedAt = null;
  let lastTickAt = null;
  let lastActivityAt = null;
  let visible = true;
  let aiWaiting = false;
  let activeMs = 0;
  let foregroundAiWaitMs = 0;

  function advance(at = now()) {
    const current = safeTime(at);
    if (!running) return current;
    if (current < lastTickAt) throw new RangeError('timestamps must be monotonic');
    const from = lastTickAt;
    const to = current;
    if (visible && aiWaiting) {
      foregroundAiWaitMs += to - from;
    } else if (visible && !aiWaiting && lastActivityAt !== null) {
      const activeUntil = Math.min(to, lastActivityAt + idleAfterMs);
      if (activeUntil > from) activeMs += activeUntil - from;
    }
    lastTickAt = current;
    return current;
  }

  function start(at = now()) {
    const current = safeTime(at);
    if (running) return snapshot(current);
    running = true;
    startedAt = current;
    lastTickAt = current;
    lastActivityAt = current;
    activeMs = 0;
    foregroundAiWaitMs = 0;
    visible = true;
    aiWaiting = false;
    return snapshot(current);
  }

  function activity(at = now()) {
    const current = advance(at);
    if (running) lastActivityAt = current;
    return snapshot(current);
  }

  function setVisible(next, at = now()) {
    const current = advance(at);
    visible = Boolean(next);
    if (running && visible) lastActivityAt = current;
    return snapshot(current);
  }

  function setAiWaiting(next, at = now()) {
    const current = advance(at);
    aiWaiting = Boolean(next);
    if (running && !aiWaiting && visible) lastActivityAt = current;
    return snapshot(current);
  }

  function tick(at = now()) {
    const current = advance(at);
    return snapshot(current);
  }

  function snapshot(at = now()) {
    const current = safeTime(at);
    const elapsedMs = running && startedAt !== null ? Math.max(0, current - startedAt) : 0;
    const accounted = activeMs + foregroundAiWaitMs;
    return {
      running,
      activeMs: Math.round(activeMs),
      foregroundAiWaitMs: Math.round(foregroundAiWaitMs),
      elapsedMs: Math.round(elapsedMs),
      inactiveOrBackgroundMs: Math.round(Math.max(0, elapsedMs - accounted)),
      idleAfterMs,
      visible,
      aiWaiting
    };
  }

  function finish(at = now()) {
    const current = advance(at);
    const result = snapshot(current);
    running = false;
    startedAt = null;
    lastTickAt = null;
    lastActivityAt = null;
    return { ...result, running: false };
  }

  return { start, activity, setVisible, setAiWaiting, tick, snapshot, finish };
}
