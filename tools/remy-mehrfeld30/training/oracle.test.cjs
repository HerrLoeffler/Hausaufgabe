'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {solve,compareFacts,checkFit}=require('./oracle.cjs');
test('a separate rational solver derives direct and inverse intermediate values and results',()=>{
  assert.deepEqual(solve({kind:'direct',a:'6',b:'9',c:'14'}).values,['6','9','1','1.5','14','21']);
  assert.deepEqual(solve({kind:'inverse',a:'3',b:'24',c:'8'}).values,['3','24','1','72','8','9']);
  assert.equal(solve({kind:'direct',a:'120',b:'100',c:'30'}).result,'25');
  assert.equal(solve({kind:'direct',a:'2,5',b:'7,5',c:'4'}).result,'12');
  assert.throws(()=>solve({kind:'direct',a:'0',b:'4',c:'2'}),/positiv/);
  assert.throws(()=>solve({kind:'direct',a:'3',b:'1',c:'1'}),/Rundung/);
});
test('factual crosscheck rejects altered givens even if the generated key is internally consistent',()=>{
  const expected={kind:'inverse',a:'3',b:'24',c:'8'};
  assert.equal(compareFacts(expected,{...expected,a:'3,0'}),true);
  assert.equal(compareFacts(expected,{...expected,b:'25'}),false);
  assert.equal(compareFacts(expected,{...expected,kind:'direct'}),false);
});
test('format eligibility rejects additive, variable, insufficient and nonnumeric relations',()=>{
  for(const reason of ['base-fee','variable-price','missing-data','contradiction','nonnumeric']){
    assert.equal(checkFit({relationship:reason}).eligible,false);
  }
  assert.equal(checkFit({relationship:'direct',constantRate:true,positive:true}).eligible,true);
  assert.equal(checkFit({relationship:'inverse',constantWork:true,equalRate:true,positive:true}).eligible,true);
  assert.equal(checkFit({relationship:'inverse',positive:true}).eligible,false);
});
test('all fifty independent arithmetic references are exact and the ten no-fit wishes remain separate',()=>{
  const {cases}=require('./cases.cjs');
  assert.equal(cases.length,60);
  assert.equal(new Set(cases.map(x=>x.id)).size,60);
  assert.equal(cases.filter(x=>x.family==='contrast').length,10);
  for(const c of cases.filter(x=>x.family!=='contrast')){
    const solved=solve(c.expected);
    assert.equal(solved.values.length,6,c.id);
    assert.equal(solved.operations.length,4,c.id);
    assert.ok(Number(solved.result)>0,c.id);
  }
});
test('varying a stated rate against time needs a fixed total, not equal old and new rates',()=>{
  assert.equal(checkFit({relationship:'inverse',constantWork:true,equalRate:false,positive:true}).eligible,true);
  assert.equal(checkFit({relationship:'inverse',equalRate:true,positive:true}).eligible,false);
  assert.equal(solve({kind:'inverse',a:'20',b:'15',c:'30'}).result,'10');
});
test('binary field calculations handle negative results and reject division by zero without floating point drift',()=>{
 const {calculateBinary}=require('./oracle.cjs');
 assert.equal(calculateBinary({op:'subtract',left:'2',right:'7'}),'-5');
 assert.equal(calculateBinary({op:'multiply',left:'-0.2',right:'3'}),'-0.6');
 assert.equal(calculateBinary({op:'divide',left:'1',right:'4'}),'0.25');
 assert.throws(()=>calculateBinary({op:'divide',left:'1',right:'0'}));
});
