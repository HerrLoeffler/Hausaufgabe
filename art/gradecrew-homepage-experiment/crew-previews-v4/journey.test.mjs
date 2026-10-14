import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoFlow} from './flow-v3.mjs';
const order=['coco','remy','emmi','wilma'];
const last={coco:2,remy:3,emmi:2,wilma:2};
for(const reducedMotion of [false,true]){
 test(`the complete crew sequence is manual and readable, reducedMotion=${reducedMotion}`,()=>{
  let state;const flow=createDemoFlow({reducedMotion,onChange:s=>state=s});flow.start('coco');
  for(let i=0;i<order.length;i++){
   const name=order[i];assert.equal(state.name,name);assert.equal(state.phase,0);assert.equal(state.running,false);
   assert.equal(flow.next(),false,'must not skip unfinished reading steps');
   for(let p=1;p<=last[name];p++){assert.equal(flow.nextPhase(),true);assert.equal(state.phase,p);}
   assert.equal(flow.nextPhase(),false);assert.equal(flow.next(),i<order.length-1);
  }
  assert.equal(state.name,'wilma');assert.equal(state.phase,2);flow.stop();assert.equal(flow.next(),false);
 });
 test(`direct entry and replay keep the chosen figure, reducedMotion=${reducedMotion}`,()=>{
  let state;const flow=createDemoFlow({reducedMotion,onChange:s=>state=s});
  for(const name of order){flow.start(name);flow.nextPhase();flow.previousPhase();assert.equal(state.phase,0);flow.nextPhase();flow.replay();assert.equal(state.name,name);assert.equal(state.phase,0);assert.equal(state.running,false);}
  flow.stop();
 });
}
