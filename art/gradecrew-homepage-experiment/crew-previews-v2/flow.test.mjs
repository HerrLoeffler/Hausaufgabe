import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoFlow } from './flow.mjs';

test('an opened insight waits for the reader instead of scheduling a page change', () => {
  const scheduled=[]; const seen=[];
  const flow=createDemoFlow({schedule:fn=>scheduled.push(fn),onChange:s=>seen.push(s)});
  flow.start('remy');
  assert.equal(seen.at(-1).phase,0);
  assert.equal(scheduled.length,0,'reading must never schedule an automatic advance');
});
test('the reader can return to the previous example and replay from its beginning', () => {
  const seen=[]; const flow=createDemoFlow({onChange:s=>seen.push(s)});
  flow.start('coco'); flow.nextPhase(); flow.nextPhase();
  assert.equal(seen.at(-1).phase,2);
  assert.equal(typeof flow.previousPhase,'function','a previous-step action is required');
  flow.previousPhase(); assert.equal(seen.at(-1).phase,1);
  flow.replay(); assert.equal(seen.at(-1).phase,0);
});
test('reduced motion preserves every teaching step', () => {
  const seen=[]; const flow=createDemoFlow({reducedMotion:true,onChange:s=>seen.push(s)});
  flow.start('coco'); assert.equal(seen.at(-1).phase,0);
  flow.nextPhase(); assert.equal(seen.at(-1).phase,1);
});
test('unknown crew names cannot open an insight', () => {
  const seen=[]; const flow=createDemoFlow({onChange:s=>seen.push(s)});
  flow.start('unknown'); assert.equal(seen.length,0);
});
