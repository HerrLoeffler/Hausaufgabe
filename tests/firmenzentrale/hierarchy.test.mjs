import test from 'node:test';
import assert from 'node:assert/strict';
import {nodes} from '../../docs/prototypes/firmenzentrale/network.mjs';
import {childrenFor} from '../../docs/prototypes/firmenzentrale/focus.mjs';
import {groupsFor,summarizeWork,taskBucket} from '../../docs/prototypes/firmenzentrale/hierarchy.mjs';
test('all 62 work items have exactly one named parent group across 11 areas',()=>{
 let count=0;for(const n of nodes){const groups=groupsFor(n.id),all=groups.flatMap(g=>g.children.map(c=>c.id));assert.ok(groups.length>=2);assert.equal(new Set(all).size,all.length);assert.deepEqual([...all].sort(),childrenFor(n.id).map(c=>c.id).sort());count+=all.length;for(const g of groups)assert.ok(g.title&&g.children.length);}assert.equal(count,62);
});
test('summary separates blocked, review, clarification and documented work without invented completion',()=>{
 assert.deepEqual(summarizeWork([{state:'blocker'},{state:'review'},{state:'clarify'},{state:'documented'}]),{total:4,blocked:1,review:1,clarify:1,documented:1,progress:null});
 assert.equal(taskBucket('completed'),'results');assert.equal(taskBucket('unknown'),'attention');assert.equal(taskBucket('waiting_user'),'questions');assert.equal(taskBucket('queued'),'active');assert.equal(taskBucket('failed'),'attention');
});
