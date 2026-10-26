import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from './tools/ui/node_modules/jsdom/lib/api.js';
import {installEmailVerification} from './email-verification.mjs';
function setup(t,overrides={}){
 const dom=new JSDOM('<html lang="de"><body><div id="emailVerificationHost"></div></body></html>',{url:'https://example.test'});t.after(()=>dom.window.close());
 let user={uid:'a',email:'teacher@example.invalid'},time=1000;const calls=[];
 const ui=installEmailVerification({document:dom.window.document,getUser:()=>user,now:()=>time,
 requestCode:async()=>({sent:true,retryAfterSeconds:60}),confirmCode:async data=>{calls.push(data);return {verified:true};},onVerified:async()=>calls.push('verified'),onSignOut:()=>calls.push('out'),...overrides});t.after(()=>ui.destroy());
 return {d:dom.window.document,w:dom.window,ui,calls,user,setUser:u=>{user=u;},advance:ms=>{time+=ms;}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('one input accepts a pasted code and confirms before entering the app',async t=>{
 const f=setup(t);f.ui.show(f.user);const input=f.d.getElementById('verificationCode');assert.equal(input.autocomplete,'one-time-code');
 input.value='123 456';f.d.getElementById('verifyEmailForm').dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();
 assert.deepEqual(f.calls,[{code:'123456',accountUid:'a'},'verified']);
});
test('resend cooldown, visible email and failures remain usable in English',async t=>{
 const f=setup(t,{confirmCode:async()=>{throw {code:'invalid-argument'};}});f.d.documentElement.lang='en';f.ui.show(f.user);await f.ui.requestFor(f.user);
 assert.equal(f.d.getElementById('verificationResend').disabled,true);assert.equal(f.d.getElementById('verificationEmail').textContent,f.user.email);
 f.advance(60000);f.ui.refresh();assert.equal(f.d.getElementById('verificationResend').disabled,false);
 f.d.getElementById('verificationCode').value='000000';f.d.getElementById('verifyEmailForm').dispatchEvent(new f.w.Event('submit',{cancelable:true}));await flush();assert.match(f.d.getElementById('verificationStatus').textContent,/does not match/);
 assert.equal(f.d.getElementById('verificationSubmit').disabled,false);
});
test('a late reply cannot confirm or show a previous account after switching users',async t=>{
 let finish;const pending=new Promise(resolve=>{finish=resolve;});const f=setup(t,{confirmCode:()=>pending});f.ui.show(f.user);
 f.d.getElementById('verificationCode').value='123456';f.d.getElementById('verifyEmailForm').dispatchEvent(new f.w.Event('submit',{cancelable:true}));
 f.setUser({uid:'b',email:'b@example.invalid'});f.ui.show({uid:'b',email:'b@example.invalid'});finish({verified:true});await flush();
 assert.deepEqual(f.calls,[]);assert.equal(f.d.getElementById('verificationEmail').textContent,'b@example.invalid');
});
test('a stale registration request never sends for the current different account',async t=>{
 let sends=0;const f=setup(t,{requestCode:async()=>{sends++;return {sent:true};}}),old=f.user;
 const next={uid:'b',email:'b@example.invalid'};f.setUser(next);f.ui.show(next);await f.ui.requestFor(old);
 assert.equal(sends,0);assert.equal(f.d.getElementById('verificationEmail').textContent,next.email);assert.equal(f.d.getElementById('verificationSubmit').disabled,false);
});
test('an account switch without a following screen update clears a late sending state',async t=>{
 let finish;const f=setup(t,{requestCode:()=>new Promise(resolve=>{finish=resolve;})});f.ui.show(f.user);const work=f.ui.requestFor(f.user);
 f.setUser({uid:'b',email:'b@example.invalid'});finish({sent:true});await work;assert.equal(f.d.getElementById('verificationEmail').textContent,'');assert.equal(f.d.getElementById('verificationSubmit').disabled,false);
});
