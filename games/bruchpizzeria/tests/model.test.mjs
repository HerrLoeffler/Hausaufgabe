import test from 'node:test';
import assert from 'node:assert/strict';
import {wholePizza,cutPizza,portion,evaluatePortion} from '../src/pizza.mjs';
import {newShift,takePizza,applyCut,selectSlice,platePizza,serve,tick,restore} from '../src/shift.mjs';
const vertical = [{x:0,y:-1.2},{x:0,y:1.2}];
const horizontal = [{x:-1.2,y:0},{x:1.2,y:0}];
const halves = () => cutPizza(wholePizza(),...vertical);
const quarters = () => cutPizza(halves(),...horizontal);
const halfPlate = s => platePizza(selectSlice(applyCut(takePizza(s),...vertical),0));
test('diameter really splits a whole into two equal areas',()=>{
 const p=halves();assert.equal(p.length,2);assert.ok(Math.abs(portion(p,[0])-.5)<.001);
});
test('two crossing diameters create four quarters and preserve the whole',()=>{
 const p=quarters();assert.equal(p.length,4);assert.ok(Math.abs(portion(p,[0,1,2,3])-1)<.001);
 assert.equal(evaluatePortion(p,[0,1],.5).ok,true);
 assert.equal(evaluatePortion(p,[0,1],.5).denominator,4);
});
test('off-centre parts are not certified as equal halves',()=>{
 const p=cutPizza(wholePizza(),{x:.4,y:-1.2},{x:.4,y:1.2});
 assert.equal(p.length,2);assert.equal(evaluatePortion(p,[0],.5).reason,'unequal');
});
test('duplicate, empty and nonexistent slice selections cannot earn progress',()=>{
 for(const ids of [[],[0,0],[9],[NaN]])assert.equal(evaluatePortion(halves(),ids,.5).ok,false);
});
test('short, nonfinite or outside strokes cannot cut pizza',()=>{
 for(const stroke of [[{x:0,y:0},{x:.1,y:0}],[{x:NaN,y:0},{x:1,y:0}],[{x:2,y:-1},{x:2,y:1}]]){
 assert.deepEqual(cutPizza(wholePizza(),...stroke),wholePizza());
 }
});
test('repeat diameter does not create phantom portions',()=>assert.equal(cutPizza(halves(),...vertical).length,2));
test('first order stays untimed and a wrong quantity is rejected',()=>{
 const s=newShift();assert.equal(tick(s,150).orders[0].patience,null);
 const p=platePizza(selectSlice(takePizza(s),0));
 assert.equal(serve(p,s.orders[0].id).served,0);
});
test('right half delivery advances once and opens two guests',()=>{
 const s=newShift();const p=halfPlate(s);const next=serve(p,s.orders[0].id);
 assert.equal(next.served,1);assert.equal(next.orders.length,2);assert.equal(next.carry,null);
 assert.equal(serve(next,s.orders[0].id).served,1);
});
test('wrong guest preserves plate and does not award learning',()=>{
 const s=serve(halfPlate(newShift()),1);const p=halfPlate(s);
 const target=s.orders.find(o=>o.target===.25);
 const after=serve(p,target.id);assert.equal(after.served,1);assert.equal(after.carry,'plate');
});
test('pause and help freeze patience but ordinary play decreases it',()=>{
 const s=serve(halfPlate(newShift()),1);const before=s.orders[0].patience;
 assert.equal(tick({...s,paused:true},20).orders[0].patience,before);
 assert.equal(tick({...s,help:true},20).orders[0].patience,before);
 assert.equal(tick(s,2).orders[0].patience,before-2);
});
test('zero patience keeps an order recoverable',()=>{
 const s=serve(halfPlate(newShift()),1);const after=tick(s,300);
 assert.equal(after.orders.length,2);assert.equal(after.orders[0].patience,0);
});
test('reload restores a cut and selection without consuming time',()=>{
 const s=selectSlice(applyCut(takePizza(newShift()),...vertical),0);
 assert.deepEqual(restore(JSON.stringify(s)),s);
});
test('corrupt, unsupported or forged progress saves reset safely',()=>{
 for(const raw of ['nope','null','{}',JSON.stringify({...newShift(),version:99}),JSON.stringify({...newShift(),served:999})]){
 assert.deepEqual(restore(raw),newShift());
 }
});
test('input state remains immutable during a successful delivery',()=>{
 const s=newShift();const snapshot=JSON.stringify(s);serve(halfPlate(s),1);
 assert.equal(JSON.stringify(s),snapshot);
});
test('four complete orders end the shift and cannot be served again',()=>{
 let s=serve(halfPlate(newShift()),1);
 for(const [id,count] of [[2,1],[3,3],[4,2]]){
  s=applyCut(applyCut(takePizza(s),...vertical),...horizontal);
  for(let i=0;i<count;i++)s=selectSlice(s,i);
  s=serve(platePizza(s),id);
 }
 assert.equal(s.served,4);assert.equal(s.complete,true);assert.equal(s.orders.length,0);
 assert.deepEqual(takePizza(s),s);assert.deepEqual(serve(s,4),s);
 assert.deepEqual(restore(JSON.stringify(s)),s);
});
test('repeating an unchanged cut preserves selection and undo history',()=>{
 const s=selectSlice(applyCut(takePizza(newShift()),...vertical),0);
 const after=applyCut(s,...vertical);
 assert.deepEqual(after.selected,[0]);assert.equal(after.history.length,1);
});
test('empty history polygons and unfinished shifts without guests reset safely',()=>{
 const cut=applyCut(takePizza(newShift()),...vertical);
 for(const s of [{...cut,history:[[]]},{...newShift(),served:1,nextId:2,orders:[]}])assert.deepEqual(restore(JSON.stringify(s)),newShift());
});
