import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from './tools/ui/node_modules/jsdom/lib/api.js';
import {publishAuthProfileForGeneration} from './auth-profile.js';
const source=fs.readFileSync('app.js','utf8');
function fixture(t){
 const dom=new JSDOM('<div id="authView"></div>',{url:'https://example.test'});t.after(()=>dom.window.close());
 const user={uid:'pending',email:'pending@example.invalid'},calls=[];let release,callback;
 const context=vm.createContext({state:{user,profile:null},auth:{},registrationSettled:new Promise(resolve=>{release=resolve;}),questionFeedback:{setSession(){}},quickRemyBridge:{authChanged(){}},guestTourRepo:null,
 document:dom.window.document,window:dom.window,Event:dom.window.Event,console,db:{},doc:()=>({}),getDoc:async()=>{calls.push('read');return {exists:()=>true,data:()=>({role:'teacher',status:'pending_verification'})};},
 publishAuthProfileForGeneration,ensureProfileDefaults:async(_user,profile)=>profile,
 setTeacherBar:()=>calls.push('bar'),showView:view=>calls.push(view),emailVerificationController:()=>({show:u=>calls.push('verify:'+u.uid)}),onAuthStateChanged:(_auth,fn)=>{callback=fn;},
 loadDashboard:()=>assert.fail('pending account reached dashboard'),refreshTutorialSignIn:()=>assert.fail('pending account counted a login')});
 vm.runInContext(source.slice(source.indexOf('let authStateGeneration = 0;'),source.indexOf('// ---------- Dashboard ----------')),context);
 return {context,user,calls,release,run:()=>callback(user)};
}
test('auth waits for registration and then routes pending accounts only to email confirmation',async t=>{
 const f=fixture(t),work=f.run();await Promise.resolve();assert.deepEqual(f.calls,[]);f.release();await work;
 assert.deepEqual(f.calls,['read','bar','authView','verify:pending']);
});
test('an account change during registration cannot publish the previous profile',async t=>{
 const f=fixture(t),work=f.run();vm.runInContext('authStateGeneration=2',f.context);f.release();await work;assert.deepEqual(f.calls,[]);
});
test('a late tutorial hash cannot alter the new account session or count',async t=>{
 const f=fixture(t);let finish;
 f.context.getDoc=async()=>({exists:()=>true,data:()=>({role:'teacher',status:'active',crewTourSignInCount:1})});
 f.context.isSuspended=()=>false;f.context.refreshTutorialSignIn=()=>{};
 f.context.tutorialSessionHash=()=>new Promise(resolve=>{finish=resolve;});
 f.context.tutorialSignInPatch=()=>({crewTourSignInCount:7});f.context.touchLastActive=()=>{};
 const work=f.run();f.release();await new Promise(resolve=>setImmediate(resolve));
 f.context.state.user={uid:'b'};f.context.state.profile={crewTourSignInCount:6};f.context.state.tutorialSessionKey='new-account';vm.runInContext('authStateGeneration=2',f.context);
 finish('a'.repeat(64));await work;assert.equal(f.context.state.profile.crewTourSignInCount,6);assert.equal(f.context.state.tutorialSessionKey,'new-account');
});
