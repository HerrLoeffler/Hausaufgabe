import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('./tools/ui/node_modules/jsdom');
const source=readFileSync(new URL('./coco-account-privacy.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const {installCocoAccountPrivacy}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
 const dom=new JSDOM('<section id="settingsView"><article id="cocoAccountPrivacy"></article></section>',{url:'https://example.org'});
 let uid='A',wait=null,reloads=0; const calls=[];
 const root=dom.window.document.getElementById('cocoAccountPrivacy');
 installCocoAccountPrivacy({document:dom.window.document,getUid:()=>uid,callSupport:async payload=>{calls.push(payload);if(wait)return wait;return payload.operation==='clear'?{generation:2,preferences:'',history:[]}:{generation:1,preferences:'<img src=x onerror=alert(1)>',history:[{role:'user',text:'Privater synthetischer Hinweis'}]};},reload:()=>{reloads++;}});
 return {dom,root,calls,setUid:v=>{uid=v;dom.window.document.dispatchEvent(new dom.window.CustomEvent('gradecrew:account-changed'));},setWait:p=>{wait=p;},reloads:()=>reloads,click:async id=>{root.querySelector('#'+id).click();await tick();}};
}
test('memory is read only on explicit settings action and rendered as text',async()=>{const h=harness();assert.equal(h.calls.length,0);await h.click('cocoPrivacyRead');assert.deepEqual(h.calls,[{operation:'read',accountId:'A'}]);assert.match(h.root.textContent,/Privater synthetischer Hinweis/);assert.equal(h.root.querySelector('img'),null);assert.equal(h.root.querySelector('textarea'),null);});
test('reset requires explicit second confirmation, cancellation never mutates',async()=>{const h=harness();await h.click('cocoPrivacyRead');await h.click('cocoPrivacyReset');assert.equal(h.calls.length,1);await h.click('cocoPrivacyCancel');assert.equal(h.calls.length,1);await h.click('cocoPrivacyReset');await h.click('cocoPrivacyConfirm');assert.equal(h.calls.filter(x=>x.operation==='clear').length,1);assert.equal(h.calls[1].accountId,'A');assert.ok(!h.root.textContent.includes('Privater synthetischer Hinweis'));assert.equal(h.reloads(),0);await h.click('cocoPrivacyReload');assert.equal(h.reloads(),1);});
test('pending read cannot render into switched account, even after switch back',async()=>{const h=harness();let release;h.setWait(new Promise(resolve=>{release=resolve;}));const pending=h.click('cocoPrivacyRead');h.setUid('B');h.setUid('A');release({preferences:'OLD PRIVATE',history:[]});await pending;await tick();assert.ok(!h.root.textContent.includes('OLD PRIVATE'));});
test('account switch cancels prepared reset without calling clear',async()=>{const h=harness();await h.click('cocoPrivacyRead');await h.click('cocoPrivacyReset');h.setUid('B');await h.click('cocoPrivacyConfirm');assert.equal(h.calls.filter(x=>x.operation==='clear').length,0);assert.ok(!h.root.textContent.includes('Privater synthetischer Hinweis'));});
test('late reset result cannot change the next account or offer reload',async()=>{const h=harness();await h.click('cocoPrivacyRead');await h.click('cocoPrivacyReset');let release;h.setWait(new Promise(resolve=>{release=resolve;}));const pending=h.click('cocoPrivacyConfirm');h.setUid('B');release({generation:2});await pending;await tick();assert.equal(h.root.querySelector('#cocoPrivacyReload').hidden,true);assert.equal(h.root.querySelector('#cocoPrivacyRead').disabled,false);});
test('unknown reset outcome requires a fresh read before any retry',async()=>{const h=harness();await h.click('cocoPrivacyRead');await h.click('cocoPrivacyReset');h.setWait(Promise.reject(new Error('offline')));await h.click('cocoPrivacyConfirm');assert.match(h.root.textContent,/Privater synthetischer Hinweis/);assert.ok(!h.root.textContent.includes('wurden zurückgesetzt'));assert.equal(h.root.querySelector('#cocoPrivacyReset').disabled,true);assert.equal(h.root.querySelector('#cocoPrivacyRead').disabled,false);await h.click('cocoPrivacyConfirm');assert.equal(h.calls.filter(x=>x.operation==='clear').length,1);});
