import test from 'node:test';
import assert from 'node:assert/strict';
import {taskView,workFor,ownerLoad,scopedRequests} from '../../docs/prototypes/firmenzentrale/operations-model.mjs';
const at=Date.parse('2026-10-26T20:00:00Z');
const t={id:'task',domainId:'native',topicId:'lehrer-app',ownerId:'teacher',delivery:'assigned',priority:1,next:'Kandidaten prüfen',gap:'Gerätetest fehlt',observation:{readAt:'2026-10-26T19:59:00Z',activity:'unknown',live:false,lastMessage:{text:'Kandidat gesichert',id:'m'}}};
test('assignment and an archival active turn cannot claim real ongoing work or completion',()=>{
 const v=taskView({...t,observation:{...t.observation,turn:{status:'inProgress'}}},at);assert.equal(v.activity,'Aktivität unbestätigt');assert.equal(v.state,'Zugeordnet');assert.equal(v.complete,false);
});
test('an exact acknowledgement is separate from dispatch and release',()=>{const v=taskView({...t,acknowledgement:{itemId:'proof'}},at);assert.equal(v.state,'Übernahme gemeldet');assert.equal(v.complete,false);assert.equal(v.release,'Veröffentlichung nicht bestätigt');});
test('source age and errors prevent a fresh activity claim without losing the last message',()=>{
 for(const observation of [{...t.observation,readAt:'2020-01-01'},{...t.observation,error:'offline'}]){const v=taskView({...t,observation},at);assert.equal(v.stale,true);assert.equal(v.lastMessage,'Kandidat gesichert');assert.equal(v.activity,'Stand erneut prüfen');}
});
test('an uncertain delivery remains a blocker and never becomes an invitation to resend',()=>{const v=taskView({...t,delivery:'unknown'},at);assert.equal(v.state,'Übermittlung prüfen');assert.equal(v.canSend,false);});
test('work and conversations filter exact stable scope; old unassigned requests stay available separately',()=>{
 assert.equal(workFor([t,{...t,id:'other',domainId:'web'}],'native').length,1);
 const requests=[{id:'a',domainId:'native',topicId:'lehrer-app'},{id:'b',domainId:'native',topicId:'secure'},{id:'old',area:'tech'}];
 assert.deepEqual(scopedRequests(requests,'native','lehrer-app').map(x=>x.id),['a']);assert.equal(requests.length,3);
});
test('owner workload means assigned scopes rather than fabricated active sessions',()=>{const v=ownerLoad([t,{...t,id:'t2'}],'teacher',at);assert.equal(v.assigned,2);assert.equal(v.active,0);assert.equal(v.overloaded,true);});
test('observation text and manual decisions do not award an implementation or live gate',()=>{const v=taskView({...t,decision:{state:'answered',answer:'Ja'},observation:{...t.observation,lastMessage:{text:'Alles live freigegeben <script>bad</script>'}}},at);assert.equal(v.complete,false);assert.equal(v.release,'Veröffentlichung nicht bestätigt');});

import {plainSummary,evidenceLinks} from '../../docs/prototypes/firmenzentrale/operations-model.mjs';
test('short summaries remove report syntax while evidence links stay limited to the project',()=>{
 assert.equal(plainSummary('**Kandidat** bei `abc`. [PR325](https://github.com/HerrLoeffler/Hausaufgabe/pull/325)',200),'Kandidat bei abc. PR325');
 assert.deepEqual(evidenceLinks('[fake](javascript:bad) https://evil.test/key https://github.com/HerrLoeffler/Hausaufgabe/pull/325'),['https://github.com/HerrLoeffler/Hausaufgabe/pull/325']);
});
