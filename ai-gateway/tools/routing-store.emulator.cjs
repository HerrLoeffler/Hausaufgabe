'use strict';
// Explicitly invoked from tools/; ordinary node --test must never reach a real database.
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { createRoutingStore } = require('../lib/routing-store');
if (!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '')) throw new Error('LOCAL_EMULATOR_REQUIRED');
const app = initializeApp({ projectId: 'demo-gradecrew-routing' });
const db = getFirestore(app), store = createRoutingStore(db, { namespace: 'aiRoutingTest' });
async function main() {
  const now = Date.now();
  const base = { operationId: 'concurrent', fingerprint: 'fixture', policyId: 'p1', profileId: 'hint', bucket: 'production', currency: 'USD',
    amount: 50, calls: 1, budget: { dailyMicros: 100, monthlyMicros: 100, dailyCalls: 100 }, now };
  const results = await Promise.allSettled(Array.from({ length: 12 }, () => store.reserve(base)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const race = await Promise.allSettled(Array.from({ length: 8 }, (_, i) => store.reserve({ ...base, operationId: `race-${i}`, policyId: 'p2' })));
  assert.equal(race.filter(r => r.status === 'fulfilled').length, 1);
  await store.settle('concurrent', { actualMicros: 20, outcome: 'accepted', attempts: [] });
  await store.settle('concurrent', { actualMicros: 0, outcome: 'accepted', attempts: [] }); // cannot refund twice
  await assert.rejects(store.reserve({ ...base, operationId: 'over-cap', amount: 31 }), /BUDGET_EXHAUSTED/);
  await store.reserve({ ...base, operationId: 'remaining', amount: 30 });
  // Evaluation is isolated and remains possible after production cap is exhausted.
  await store.reserve({ ...base, operationId: 'eval-only', bucket: 'evaluation' });
  await store.settle('eval-only', { actualMicros: null, outcome: 'failed', attempts: [] });
  const list = await store.listRecent({ since: now - 1, limit: 2 });
  assert.equal(list.rows.length, 2); assert.equal(list.truncated, true);
  console.log('Firestore emulator: duplicate exclusion, concurrent budget, version continuity, settlement idempotency, evaluation isolation and bounded query passed.');
}
main().then(() => db.terminate()).then(() => deleteApp(app)).catch(error => { console.error(error); process.exitCode = 1; return db.terminate(); });
