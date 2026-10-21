import {createTeacherActiveTimeTracker} from './teacher-active-time.mjs';
import {createOperationTelemetry} from './assessment-telemetry-transport.mjs';

// Uses the existing opt-in bounded outbox and activity clock. No DOM values,
// persistent browser IDs, URLs, quiz codes or cross-account queues.
export function createTeacherAnalytics({send, doc = globalThis.document, nav = globalThis.navigator,
  clock = () => performance.now(), wall = () => Date.now(), locks = nav?.locks,
  every = setInterval, cancel = clearInterval} = {}) {
  let uid = '', release = '', profile = null, active = false, stopLock = null, timer = null, generation = 0;
  let tracker = null, previous = null, view = 'none', waitingCount = 0;
  const outbox = createOperationTelemetry({enabled: true, release: 'teacher-v2', capacity: 100,
    clock, now: () => new Date(wall()), send: async batch => {
      const epoch = generation;
      for (const e of batch.events) {
        if (epoch !== generation) return;
        const at = Date.parse(e.at);
        if (wall() - at > 120000) continue; // Never replay offline time as live activity.
        const {at: ignored, ...data} = e;
        const result = await send({...data, at}, batch.scope.account);
        if (!result?.ok) throw new Error('telemetry pending');
      }
    }});
  function record(event, metadata = {}) {
    if (!active || !nav.onLine || doc.visibilityState !== 'visible') return;
    outbox.record({event, release, platform: globalThis.window?.GradeCrewNative ? 'teacher_ios_web' : 'web', ...metadata});
  }
  function summary() {
    if (!tracker || !previous) return;
    const next = tracker.tick();
    const elapsedMs = Math.min(30000, Math.max(0, next.elapsedMs - previous.elapsedMs));
    const activeMs = Math.min(elapsedMs, Math.max(0, next.activeMs - previous.activeMs));
    const foregroundAiWaitMs = Math.min(elapsedMs - activeMs, Math.max(0, next.foregroundAiWaitMs - previous.foregroundAiWaitMs));
    record('activity_summary', {elapsedMs, activeMs, foregroundAiWaitMs});
    previous = next;
  }
  function releaseLeader() {
    if (timer !== null) cancel(timer);
    timer = null;
    if (active) {summary();record('session_ended');}
    active = false; tracker = null; previous = null;
    stopLock?.(); stopLock = null;
  }
  async function acquire() {
    if (!release || !uid || !['dashboardView','createView','aiView','editorView','publishView','resultsView','settingsView'].includes(view) || profile?.analyticsConsent !== true || !['teacher', 'admin'].includes(profile.role) || !locks || !nav.onLine || doc.visibilityState !== 'visible' || active) return;
    const epoch = generation;
    await locks.request(`gradecrew-teacher-activity-${uid}`, {ifAvailable: true}, async lock => {
      if (!lock || epoch !== generation || active) return;
      active = true;
      tracker = createTeacherActiveTimeTracker({now: clock}); previous = tracker.start();tracker.setAiWaiting(waitingCount > 0);
      outbox.setScope({account: uid}); record('session_started');
      timer = every(summary, 30000);
      await new Promise(resolve => {stopLock = resolve;});
    }).catch(() => {});
  }
  function sync() {if (!nav.onLine || doc.visibilityState !== 'visible') releaseLeader(); else void acquire();}
  const activity = event => {if (event.isTrusted && active) tracker.activity();};
  for (const type of ['pointerdown', 'keydown', 'scroll', 'touchstart']) doc.addEventListener(type, activity, {passive: true});
  doc.addEventListener('visibilitychange', sync);
  globalThis.addEventListener?.('offline', sync);globalThis.addEventListener?.('online', sync);
  globalThis.addEventListener?.('pagehide', releaseLeader);
  // Reattempt leadership after the foreground tab exits; no heartbeat is emitted here.
  every(() => {if (!active) void acquire();}, 5000);
  return {
    setRelease(value) {release = /^[a-f0-9]{40}$/.test(value || '') ? value : '';sync();},
    setSession(nextUid, nextProfile) {generation++; releaseLeader(); waitingCount = 0;outbox.clear();uid = nextUid || '';profile = nextProfile;sync();},
    view(next) {view = next; if (!['dashboardView','createView','aiView','editorView','publishView','resultsView','settingsView'].includes(view)) releaseLeader(); else sync(); if (['dashboardView','createView','aiView','editorView','publishView','resultsView','settingsView'].includes(view)) record('view_opened', {view});},
    operation(operation, outcome = 'acknowledged', durationMs = 0) {record('operation_finished', {operation, outcome, durationMs: Math.min(3600000, Math.max(0, Math.round(durationMs)))});},
    feature(feature) {record('feature_used', {feature});},
    waiting(value) {waitingCount = Math.max(0, waitingCount + (value ? 1 : -1));if (active) tracker.setAiWaiting(waitingCount > 0);},
    health: outbox.health
  };
}
