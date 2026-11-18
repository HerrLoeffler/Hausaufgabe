import test from 'node:test';
import assert from 'node:assert/strict';
import { createBillingClient, describeAccess, describePlan } from './billing-client.mjs';

const trial = { tier: 'trial', reasonCode: 'allowed', featureCodes: ['test.read','test.export','test.edit','test.create'], freeCreationsRemaining: 5, trialEndsAtMs: Date.UTC(2026,10,15), enforced: true };
test('access-boundary refresh has one timer and clears it on logout',()=>{
  const scheduled=new Map();let next=1;
  const client=createBillingClient({getUid:()=> 'teacher',call:async()=>trial,setTimer:(fn,ms)=>{const id=next++;scheduled.set(id,{fn,ms});return id;},clearTimer:id=>scheduled.delete(id),now:()=>1000});
  client.watchBoundary({nextAccessChangeAtMs:5000});assert.equal(scheduled.size,1);assert.equal([...scheduled.values()][0].ms,4250);
  client.watchBoundary({nextAccessChangeAtMs:9000});assert.equal(scheduled.size,1);assert.equal([...scheduled.values()][0].ms,8250);
  client.reset();assert.equal(scheduled.size,0);
});
test('yearly option describes an upfront annual payment, not ten monthly debits', () => {
  const year = describePlan({ code: 'personal-yearly', interval: 'year', amountMinor: 12000, currency: 'eur' });
  assert.equal(year.payNowMinor, 12000);
  assert.equal(year.monthlyEquivalentMinor, 1000);
  assert.match(year.summary, /120/);
  assert.match(year.summary, /jährlich/);
  const month = describePlan({ code: 'personal-monthly', interval: 'month', amountMinor: 1500, currency: 'eur' });
  assert.equal(month.payNowMinor, 1500);
  assert.equal(month.monthlyEquivalentMinor, 1500);
});
test('view differentiates exhausted creations from an expired trial', () => {
  const exhausted = describeAccess({ ...trial, freeCreationsRemaining: 0, reasonCode: 'quota_exhausted', featureCodes: ['test.read','test.export','test.edit'] });
  assert.equal(exhausted.canEdit, true); assert.equal(exhausted.canCreate, false);
  const expired = describeAccess({ ...trial, tier: 'free', reasonCode: 'trial_ended', featureCodes: ['test.read','test.export'] });
  assert.equal(expired.canEdit, false); assert.equal(expired.canExport, true);
});
test('a late response after account switching is discarded', async () => {
  let uid = 'first', finish;
  const client = createBillingClient({ getUid: () => uid, call: () => new Promise(resolve => { finish = resolve; }) });
  const pending = client.refresh(); uid = 'second'; client.reset(); finish(trial); await pending;
  assert.equal(client.snapshot(), null);
});
test('creation binds one request id and refreshes rights without accepting a client owner', async () => {
  const sent = [];
  const client = createBillingClient({ getUid: () => 'teacher', call: async data => { sent.push(data); return data.action === 'access' ? trial : { code: 'ONCEONLY' }; } });
  const result = await client.createQuiz({ requestId: 'same-request-id', kind: 'import', quiz: { title: 'Imported' } });
  assert.equal(result.code, 'ONCEONLY');
  const creation = sent.find(x => x.action === 'createQuiz');
  assert.equal(creation.requestId, 'same-request-id'); assert.equal(creation.personId, undefined);
  assert.equal(client.snapshot().freeCreationsRemaining, 5);
});
test('failure to read access never leaves a cached premium state active', async () => {
  let unavailable = false;
  const client = createBillingClient({ getUid: () => 'teacher', call: async () => { if (unavailable) throw new Error('offline'); return trial; } });
  await client.refresh(); unavailable = true;
  await assert.rejects(client.refresh());
  assert.equal(client.snapshot(), null);
});
test('a saved file is not reported as failed merely because the follow-up status read fails', async () => {
  const client = createBillingClient({getUid:() => 'teacher',call:async data => {
    if(data.action === 'access') throw new Error('status offline');
    return {code:'SAVEDONE'};
  }});
  assert.equal((await client.createQuiz({requestId:'persisted-once',kind:'manual',quiz:{title:'Saved'}})).code,'SAVEDONE');
  assert.equal(client.snapshot(),null);
});
test('switching account during the post-save refresh never returns the previous account file', async () => {
  let uid='first',finish;
  const client=createBillingClient({getUid:()=>uid,call:async data=>data.action==='createQuiz'?{code:'PRIVATE1'}:new Promise(resolve=>{finish=resolve;})});
  const pending=client.createQuiz({requestId:'switch-midway',kind:'manual',quiz:{title:'Private'}});
  await new Promise(resolve=>setImmediate(resolve));
  uid='second';client.reset();finish(trial);
  await assert.rejects(pending,/Konto/);
});
