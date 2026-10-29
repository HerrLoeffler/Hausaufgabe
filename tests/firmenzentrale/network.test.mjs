import test from 'node:test';
import assert from 'node:assert/strict';
const m=await import('../../docs/prototypes/firmenzentrale/network.mjs').catch(()=>({}));
test('every network connection has direction, scope and source; no synthetic release green',()=>{
 assert.ok(m.connections?.length>10);
 for(const e of m.connections){assert.ok(m.nodes.some(n=>n.id===e.from));assert.ok(m.nodes.some(n=>n.id===e.to));assert.ok(e.reason&&e.scope&&e.source);}
 assert.equal(m.nodes.some(n=>n.status==='production'),false);
});
test('resolved classroom runtime retains the outstanding device requirement',()=>{
 const impacted=m.affectedBy('classroom');
 assert.equal(impacted.length,0);assert.ok(m.connections.some(e=>e.from==='classroom'&&e.to==='native'&&e.kind==='requires'&&/Geräte/.test(e.scope)));
 assert.ok(impacted.every(e=>e.kind==='blocker'));
 assert.equal(m.affectedBy('design').length,0);
});
test('zoom is bounded and search reaches subtopics such as ASV',()=>{
 assert.equal(m.clampZoom(50),1.8);assert.equal(m.clampZoom(-4),0.6);
 assert.ok(m.matchNodes('ASV').some(n=>n.id==='classroom'));
 assert.equal(m.matchNodes('impossible-match-993').length,0);
});
