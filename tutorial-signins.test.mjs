import test from 'node:test';
import assert from 'node:assert/strict';
import { tutorialSignInPatch, recordTutorialSignIn } from './tutorial-signins.mjs';

const session=n=>n.toString(16).padStart(64,'0');
const user=(uid='a',n=1)=>({uid,metadata:{lastSignInTime:new Date(1700000000000+n*1000).toISOString()}});
function memory(profiles={a:{displayName:'A'}}) {
 const state=structuredClone(profiles);let revision=0;
 return {state,db:{},runTransaction:async(_db,run)=>{
  for(;;){const before=revision;let write=null;const value=await run({get:async ref=>({exists:()=>Boolean(state[ref]),data:()=>structuredClone(state[ref])}),update:(ref,patch)=>{write={ref,patch};}});
   if(before!==revision)continue;
   if(write){Object.assign(state[write.ref],write.patch);revision++;}return value;
  }
 }};
}
const record=(m,u,extra={})=>recordTutorialSignIn({user:u,db:m.db,ref:u?.uid,runTransaction:m.runTransaction,isCurrent:()=>true,...extra});

test('first five logins and sixth produce a bounded account count without a raw history',()=>{
 let profile={};
 for(let i=1;i<=6;i++){
  const patch=tutorialSignInPatch(profile,session(i));profile={...profile,...patch};
  assert.equal(profile.crewTourSignInCount,i);
  assert.equal(profile.crewTourSignInSessions.length,i);
 }
 assert.equal(tutorialSignInPatch(profile,session(7)),null);
 assert.equal(profile.crewTourSignInCount,6);
});
test('refresh or duplicate auth callback does not count the same login twice',async()=>{
 const m=memory();await record(m,user());await record(m,user());
 assert.equal(m.state.a.crewTourSignInCount,1);
 assert.equal(m.state.a.crewTourSignInSessions.length,1);
 assert.doesNotMatch(JSON.stringify(m.state.a),/170000|lastSignInTime|uid/);
});
test('concurrent distinct logins survive transaction retries; duplicate tabs remain one',async()=>{
 const m=memory();await Promise.all([record(m,user('a',1)),record(m,user('a',2)),record(m,user('a',1))]);
 assert.equal(m.state.a.crewTourSignInCount,2);
 assert.equal(new Set(m.state.a.crewTourSignInSessions).size,2);
});
test('two accounts retain independent counters',async()=>{
 const m=memory({a:{},b:{}});await record(m,user('a',1));await record(m,user('b',1));await record(m,user('a',2));
 assert.equal(m.state.a.crewTourSignInCount,2);assert.equal(m.state.b.crewTourSignInCount,1);
 assert.notEqual(m.state.a.crewTourSignInSessions[0],m.state.b.crewTourSignInSessions[0]);
});
test('missing auth metadata, suspended accounts and absent profiles never create a count',async()=>{
 const m=memory({a:{status:'suspended'}});
 for(const u of [null,{uid:'a'},user('missing')])assert.equal(await record(m,u),null);
 assert.equal(await record(m,user('a')),null);
 assert.deepEqual(m.state,{a:{status:'suspended'}});
});
test('permission or offline failures leave the existing account state intact',async()=>{
 const m=memory({a:{crewTourSignInCount:5}});
 assert.equal(await record(m,user(),{runTransaction:async()=>{throw Error('offline');}}),null);
 assert.deepEqual(m.state.a,{crewTourSignInCount:5});
});
test('an account switch during hashing or transaction read does not write stale profile data',async()=>{
 const m=memory();let current=true;
 assert.equal(await record(m,user(),{isCurrent:()=>current,hash:async()=>{current=false;return session(1);}}),null);
 assert.deepEqual(m.state.a,{displayName:'A'});
 current=true;
 assert.equal(await record(m,user(),{isCurrent:()=>current,runTransaction:async(_db,run)=>run({get:async()=>{current=false;return {exists:()=>true,data:()=>({})};},update:()=>assert.fail('stale write')})}),null);
});
test('legacy profiles count only newly observed sessions and do not mutate other settings',async()=>{
 const m=memory({a:{settings:{defaultSubject:'Deutsch'},role:'teacher'}});await record(m,user());
 assert.equal(m.state.a.crewTourSignInCount,1);assert.deepEqual(m.state.a.settings,{defaultSubject:'Deutsch'});assert.equal(m.state.a.role,'teacher');
});
