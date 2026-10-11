import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app = fs.readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const aiClient = fs.readFileSync(new URL('../../ai-client.js', import.meta.url), 'utf8');
function functionSource(name, nextMarker, isAsync = true) {
  const prefix = isAsync ? 'async function' : 'function';
  const start = app.indexOf(`${prefix} ${name}(`);
  const end = app.indexOf(`\n${prefix} ${nextMarker}(`, start);
  assert.ok(start >= 0 && end > start, `${name} source exists`);
  return app.slice(start, end);
}
function setup(startResult) {
  const source = { id: 'FTWU9NTW', title: 'Wortarten und Satzglieder', subject: 'Deutsch', grade: '5', questionCount: 5, rightsHold: false };
  const state = { quizzes: [source], aiJobs: [], aiStarting: false };
  const calls = [], toasts = [];
  const context = vm.createContext({
    state,
    crypto: { randomUUID: () => 'f0df4b13-0000-4000-8000-0123456789ab' },
    aiApi: { startAiTestVariantJob: async payload => { calls.push(structuredClone(payload)); return startResult(); } },
    $: id => id === 'generateAiTestBtn' ? { disabled: false } : null,
    toast: (...args) => toasts.push(args),
    aiFriendlyError: error => error?.code === 'unavailable' ? 'Der Auftrag konnte nicht bestätigt werden. Bitte versuche es erneut.' : 'Die Variante konnte nicht gestartet werden.',
    loadDashboard: async () => {},
    renderAiJobs: () => {},
    Date, Map, Set, String, Number, Boolean, Math
  });
  vm.runInContext(functionSource('startAiVariantQueueJob', 'deleteQuiz'), context);
  vm.runInContext(functionSource('duplicateQuiz', 'startAiVariantQueueJob'), context);
  return { context, state, source, calls, toasts };
}

test('Emmi variant starts one source-bound queue job only with the explicit variant acknowledgement', async () => {
  const x = setup(async () => ({ jobId: 'a'.repeat(40), generationMode: 'variant', contractVersion: 1 }));
  const result = await vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context);
  assert.equal(result, true);
  assert.equal(x.calls.length, 1);
  assert.deepEqual(Object.keys(x.calls[0]).sort(), ['clientRequestId', 'sourceQuizId']);
  assert.equal(x.calls[0].sourceQuizId, 'FTWU9NTW');
  assert.match(x.calls[0].clientRequestId, /^AI-[a-zA-Z0-9-]{1,37}$/);
  assert.equal(x.state.aiJobs.length, 1);
  assert.equal(x.state.aiJobs[0].id, 'a'.repeat(40));
  assert.equal(x.state.aiJobs[0].generationMode, 'variant');
  assert.equal(x.state.quizzes.length, 1);
  assert.equal(x.state.quizzes[0], x.source);
  assert.equal(x.state.aiStarting, false);
});

test('repeated activation while enqueue is pending cannot create a second variant job', async () => {
  let settle;
  const x = setup(() => new Promise(resolve => { settle = resolve; }));
  const first = vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context);
  const second = await vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context);
  assert.equal(second, false);
  assert.equal(x.calls.length, 1);
  settle({ jobId: 'a'.repeat(40), generationMode: 'variant', contractVersion: 1 });
  assert.equal(await first, true);
  assert.equal(x.state.aiJobs.length, 1);
});

test('uncertain enqueue keeps the same request id for a deliberate retry', async () => {
  let attempts = 0;
  const x = setup(async () => {
    attempts += 1;
    if (attempts === 1) throw Object.assign(new Error('timeout'), { code: 'unavailable' });
    return { jobId: 'a'.repeat(40), generationMode: 'variant', contractVersion: 1 };
  });
  await assert.rejects(vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context), /Auftrag konnte nicht bestätigt werden/);
  const firstId = x.calls[0].clientRequestId;
  assert.equal(await vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context), true);
  assert.equal(x.calls.length, 2);
  assert.equal(x.calls[1].clientRequestId, firstId);
  assert.equal(x.state.aiJobs.length, 1);
});

test('legacy job response without variant acknowledgement remains an error', async () => {
  const x = setup(async () => ({ jobId: 'a'.repeat(40) }));
  await assert.rejects(vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context), /Varianten-Erstellung wurde nicht bestätigt/);
  assert.equal(x.calls.length, 1);
  assert.equal(x.state.aiJobs.length, 0);
  assert.equal(x.state.quizzes.length, 1);
  assert.equal(x.state.quizzes[0], x.source);
});

test('old Functions deployment fails on the variant-only callable without fallback or queue entry', async () => {
  const x = setup(async () => { throw Object.assign(new Error('not found'), { code: 'functions/not-found' }); });
  await assert.rejects(vm.runInContext('duplicateQuiz("FTWU9NTW", "emmi-variant")', x.context), /auf diesem Server noch nicht verfügbar/);
  assert.equal(x.calls.length, 1);
  assert.deepEqual(Object.keys(x.calls[0]).sort(), ['clientRequestId', 'sourceQuizId']);
  assert.equal(x.state.aiJobs.length, 0);
  assert.equal(x.state.quizzes.length, 1);
  assert.equal(x.state.quizzes[0], x.source);
});

test('variant queue entries are identified as Emmi variants instead of similar tests', () => {
  const context = vm.createContext({});
  vm.runInContext(functionSource('aiJobTitle', 'renderAiJobs', false), context);
  assert.equal(vm.runInContext('aiJobTitle({generationMode:"variant",sourceQuizId:"FTWU9NTW"})', context), 'Emmi-Variante');
  assert.equal(vm.runInContext('aiJobTitle({sourceQuizId:"FTWU9NTW"})', context), 'Ähnlicher Test');
});

test('AI client exposes a distinct variant callable without the generic generation transform', () => {
  assert.match(aiClient, /startAiTestVariantJob:\s*call\("startAiTestVariantJob",\s*60000\)/);
});
