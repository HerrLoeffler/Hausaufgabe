import {mountPublicEntryShell,setPublicEntryShellVisible} from "./shared/public-entry-shell.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { GRADECREW_ASSETS } from './generated/gradecrew-assets.js';
const require=createRequire(import.meta.url);
const {JSDOM}=require('./tools/ui/node_modules/jsdom');
const html=()=>fs.readFileSync('index.html','utf8');
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
function entry(t,intent='login'){
 const dom=new JSDOM(html(),{url:'https://gradecrew.example/workspace.html?intent='+intent,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 w.mountPublicEntryShell=mountPublicEntryShell;w.setPublicEntryShellVisible=setPublicEntryShellVisible;w.scrollTo=()=>{};w.GRADECREW_ASSETS=GRADECREW_ASSETS;w.translateTree=()=>{};w.installHeroDemo=()=>{};
 w.eval(fs.readFileSync('gradecrew-entry-flow.js','utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,''));
 const controls=['loginEmail','loginPassword','registerName','registerEmail','registerPassword','registerPassword2'];const originals=controls.map(id=>w.document.getElementById(id));w.installGradeCrewEntryFlow();return{w,d:w.document,controls,originals};
}
function handlers(t){
 const dom=new JSDOM(html(),{url:'https://gradecrew.example/',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window;w.$=id=>w.document.getElementById(id);w.bindTabs=()=>{};w.auth={};w.toast=()=>{};w.authMessage=e=>e.message||'synthetic error';
 const src=fs.readFileSync('app.js','utf8');return{w,install:()=>w.eval(src.slice(src.indexOf('// ---------- Auth / Landing ----------'),src.indexOf('$("logoutBtn").addEventListener')))};
}
function submit(w,id){w.document.getElementById(id).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
test('modern brand is scoped to auth states and keeps the actual account controls',async t=>{
 const r=entry(t);await settle();assert.ok(r.d.body.classList.contains('gcModernAuthMode'));
 r.controls.forEach((id,i)=>assert.equal(r.d.getElementById(id),r.originals[i]));
 assert.equal(r.d.querySelectorAll('.gcEntryAuthArtwork img[src="./homepage/assets/crew-cutout-v2.png"]').length,2);
 assert.equal(r.d.querySelector('.gcEntryAuthArtwork img[src*="classroom"]'),null);
 r.d.getElementById('loginEmail').value='teacher@example.test';r.d.getElementById('gcEntrySwitchRegister').click();await settle();assert.ok(r.d.body.classList.contains('gcModernAuthMode'));
 r.d.getElementById('gcEntrySwitchLogin').click();assert.equal(r.d.getElementById('loginEmail').value,'teacher@example.test');r.d.getElementById('forgotBtn').click();await settle();assert.equal(r.d.getElementById('resetEmail').value,'teacher@example.test');
 r.d.getElementById('authView').classList.add('hidden');await settle();assert.equal(r.d.body.classList.contains('gcModernAuthMode'),false);
});
test('login exposes pending and error state without duplicate provider calls or losing typed values',async t=>{
 const r=handlers(t);let reject,calls=0;r.w.signInWithEmailAndPassword=()=>{calls++;return new Promise((_,no)=>reject=no)};r.install();
 r.w.$('loginEmail').value='teacher@example.test';r.w.$('loginPassword').value='synthetic-example';submit(r.w,'loginForm');submit(r.w,'loginForm');
 assert.equal(calls,1);assert.equal(r.w.$('loginForm').getAttribute('aria-busy'),'true');assert.equal(r.w.$('loginForm').querySelector('button[type=submit]').disabled,true);
 reject({message:'synthetic invalid'});await settle();assert.equal(r.w.$('loginForm').getAttribute('aria-busy'),'false');assert.equal(r.w.$('loginForm').querySelector('button[type=submit]').disabled,false);assert.match(r.w.$('loginStatus').textContent,/synthetic invalid/);assert.equal(r.w.$('loginEmail').value,'teacher@example.test');
});
test('password mismatch stays inline and never creates an account',t=>{
 const r=handlers(t);let calls=0;r.w.createUserWithEmailAndPassword=()=>{calls++;throw Error('unexpected')};r.install();r.w.$('registerPassword').value='synthetic-one';r.w.$('registerPassword2').value='synthetic-two';submit(r.w,'registerForm');assert.equal(calls,0);assert.match(r.w.$('registerStatus').textContent,/nicht überein/);
});
test('registration recovers its controls after an existing-provider error',async t=>{
 const r=handlers(t);let reject;r.w.createUserWithEmailAndPassword=()=>new Promise((_,no)=>reject=no);r.install();r.w.$('registerPassword').value='synthetic-only';r.w.$('registerPassword2').value='synthetic-only';submit(r.w,'registerForm');assert.equal(r.w.$('registerForm').getAttribute('aria-busy'),'true');reject({message:'synthetic account unavailable'});await settle();assert.equal(r.w.$('registerForm').querySelector('button[type=submit]').disabled,false);assert.match(r.w.$('registerStatus').textContent,/synthetic account unavailable/);
});


test('account headings, account switches and legal navigation all have English UI copy', async()=>{
 const {registerCatalog,setActiveUiLocale,translateSource}=await import('./shared/i18n/browser-runtime.mjs');
 const {enGBMessages}=await import('./shared/i18n/messages-en-GB.mjs');registerCatalog('en-GB',enGBMessages);setActiveUiLocale('en-GB');
 try {for(const label of ['Willkommen zurück in der Crew.','Werde Teil der Crew.','Konto erstellen','Neu bei GradeCrew?','Datenschutz','Impressum','E-Mail oder Kurzname'])assert.notEqual(translateSource(label),label,label);}finally{setActiveUiLocale('de-DE');}
});


test('workspace account screens keep the legacy scene natively hidden and link back to the public homepage',t=>{
 const r=entry(t);const start=r.d.getElementById('gcEntryStart');
 assert.equal(start.hidden,true);
 assert.equal(r.d.getElementById('authView').dataset.entryReady,'true');
 const back=r.d.querySelector('#gcEntryLogin [data-entry-back]');assert.equal(back.tagName,'A');assert.equal(new URL(back.href).pathname,'/');
 r.d.documentElement.lang='en-GB';const event=new r.w.MouseEvent('click',{bubbles:true,cancelable:true});back.dispatchEvent(event);assert.equal(new URL(back.href).searchParams.get('lang'),'en');assert.equal(event.defaultPrevented,false);assert.equal(r.d.getElementById('authView').dataset.entryState,'login');
});
test('a plain workspace does not render the retired public hero while awaiting account state',t=>{
 const r=entry(t,'');assert.equal(r.d.getElementById('authView').dataset.entryState,'login');assert.equal(r.d.getElementById('gcEntryStart').hidden,true);
});
