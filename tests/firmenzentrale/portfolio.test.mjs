import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const p=await import('../../docs/prototypes/firmenzentrale/portfolio.mjs').catch(()=>({}));
test('company map includes products and company functions, not only four web cases',()=>{
 assert.ok(Array.isArray(p.domains));
 for(const id of ['web','classroom','native','games','learning','design','operations','customers','strategy','governance','central'])assert.ok(p.domains.some(d=>d.id===id),id);
});
test('each source has one primary home and unmatched records remain visible',()=>{
 assert.equal(p.primaryDomain('feature/bruchpizzeria-unreal-v1'),'games');
 assert.equal(p.primaryDomain('GC-BRAIN-01'),'central');
 assert.equal(p.primaryDomain('unknown-source'),'unassigned');
});
test('source coverage is computed from acquired records and never implies full reading',()=>{
 const inventory=JSON.parse(readFileSync(new URL('../../docs/prototypes/firmenzentrale/inventory.json',import.meta.url)));
 const coverage=p.coverage(inventory);
 assert.equal(coverage.chats,inventory.chats.length);
 assert.ok(coverage.partial>0);
 assert.equal(coverage.complete,false);
});
