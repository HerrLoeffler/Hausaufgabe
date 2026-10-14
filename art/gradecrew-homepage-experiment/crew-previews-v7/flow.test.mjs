import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoFlow} from './flow-v3.mjs';
for (const reducedMotion of [false,true]) {
 test(`Coco/Remy keep every reading step with reducedMotion=${reducedMotion}`,()=>{
  let state;const flow=createDemoFlow({reducedMotion,schedule:()=>0,cancel:()=>{},onChange:s=>state=s});
  for(const [name,last] of [['coco',1],['remy',3]]){
   flow.start(name);assert.equal(state.phase,0);assert.equal(state.running,!reducedMotion&&state.name!=='remy'&&!(state.name==='wilma'&&state.phase===2));
   for(let phase=1;phase<=last;phase++){assert.equal(flow.nextPhase(),true);assert.equal(state.phase,phase);}
   assert.equal(flow.nextPhase(),false);flow.previousPhase();assert.equal(state.phase,last-1);flow.replay();assert.equal(state.phase,0);
  }
  flow.stop();
 });
}
