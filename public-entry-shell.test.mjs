import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {publicEntrySource} from './tools/generate-public-entry-shell.mjs';
import {mountPublicEntryShell,setPublicEntryShellVisible,selectPublicEntryLocale} from './shared/public-entry-shell.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require('./tools/ui/node_modules/jsdom');
test('shared frame is generated from the actual approved homepage, including its copy',()=>{
 assert.equal(fs.readFileSync('generated/public-entry-shell.js','utf8'),publicEntrySource());
});
test('switching public panels reuses one frame and the same controls; leaving restores native styling',t=>{
 const dom=new JSDOM('<html lang="de"><head></head><body><main><section id="login"><input id="email" value="synthetic"></section><section id="register"></section></main></body></html>',{url:'https://gradecrew.example/workspace.html?intent=login'});t.after(()=>dom.window.close());const d=dom.window.document,host=d.querySelector('main'),login=d.getElementById('login'),reg=d.getElementById('register'),input=d.getElementById('email');
 const a=mountPublicEntryShell(d,host,[login,reg]);setPublicEntryShellVisible(d,true);const logo=a.page.querySelector('.brand'),crew=a.page.querySelector('.crew-photo');
 const b=mountPublicEntryShell(d,host,[reg,login]);assert.equal(a,b);assert.equal(b.page.querySelector('.brand'),logo);assert.equal(b.page.querySelector('.crew-photo'),crew);assert.equal(d.querySelectorAll('[data-gc-public-page]').length,1);assert.equal(d.getElementById('email'),input);assert.equal(input.value,'synthetic');assert.ok(d.body.classList.contains('gcUnifiedPublicShell'));
 setPublicEntryShellVisible(d,false);assert.equal(d.body.classList.contains('gcUnifiedPublicShell'),false);assert.ok(a.links.every(l=>l.disabled));assert.equal(a.page.hidden,true);
});

test('public language choice persists, updates explicit URL language and notifies existing forms',t=>{
 const dom=new JSDOM('<html lang="de"><body></body></html>',{url:'https://gradecrew.example/workspace.html?intent=login&lang=de&template=sample'});t.after(()=>dom.window.close());let notified='';dom.window.addEventListener('gradecrew:ui-locale-changed',e=>notified=e.detail.locale);
 selectPublicEntryLocale(dom.window.document,'en');assert.equal(dom.window.localStorage.getItem('gradecrew.uiLocale'),'en-GB');assert.equal(dom.window.document.documentElement.lang,'en-GB');assert.equal(notified,'en-GB');const url=new URL(dom.window.location.href);assert.equal(url.searchParams.get('lang'),'en');assert.equal(url.searchParams.get('template'),'sample');assert.equal(url.searchParams.get('intent'),'login');
});

test('code-free student entry suppresses native header before modules load, direct test entry stays native',t=>{
 const html=fs.readFileSync('secure-student.html','utf8');
 for(const [query,pending] of [['',true],['?test=K7M4X2PA',false]]){const dom=new JSDOM(html,{url:'https://gradecrew.example/secure-student.html'+query,runScripts:'dangerously'});t.after(()=>dom.window.close());assert.equal(dom.window.document.documentElement.dataset.gcEntryPending==='true',pending);}
});
