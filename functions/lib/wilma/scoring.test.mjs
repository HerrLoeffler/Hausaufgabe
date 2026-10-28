import test from 'node:test';import assert from 'node:assert/strict';import {reviewItem} from './scoring.mjs';
const q={id:'q',type:'ordering',manualReview:true,text:'Satz ordnen.',points:2};
const s={status:'review',grading:{q:{correct:true,autoPoints:2,awardedPoints:2,maxPoints:2,needsReview:true}},answers:{q:['0','1']}};
test('akzeptierte volle Regelbewertung erzeugt keine erneute Pflichtkontrolle',()=>{assert.equal(reviewItem(q,s,()=>[]).requiresReview,false);});
test('Zurückstellung und technischer Fehler bleiben vor voller Regelbewertung vorrangig',()=>{for(const extra of [{reviewState:'deferred'},{reviewIssue:'incomplete-transfer'}])assert.equal(reviewItem(q,{...s,grading:{q:{...s.grading.q,...extra}}},()=>[]).requiresReview,true);});
