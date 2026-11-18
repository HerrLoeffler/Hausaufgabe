'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {checkCandidate}=require('./checker.cjs');
const p={kind:'inverse',a:'3',b:'24',c:'8'};
const j={...p,answer:'9',matchesWish:true,appropriate:true,unambiguous:true,leaksAnswer:false};
test('an agreeing narrative judge cannot override wrong independent arithmetic or changed givens',()=>{
  assert.equal(checkCandidate(p,j,p).ok,true);
  assert.equal(checkCandidate(p,{...j,answer:'64'},p).ok,false);
  assert.equal(checkCandidate(p,{...j,leaksAnswer:true},p).ok,false);
  assert.equal(checkCandidate(p,j,{...p,b:'12'}).ok,false);
});
test('a no-fit choice needs an independent matching decision and never a fabricated arithmetic answer',()=>{
  assert.equal(checkCandidate({kind:'other'},{...j,kind:'other'},{kind:'other'}).ok,true);
  assert.equal(checkCandidate({kind:'other'},j,{kind:'other'}).ok,false);
});
