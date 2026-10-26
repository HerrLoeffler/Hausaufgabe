import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {legacyDestination} from './homepage/routing.mjs';
const require=createRequire(import.meta.url);
const {JSDOM}=require('./tools/ui/node_modules/jsdom');

test('legacy root links preserve pupil, preview and auth parameters and hash on the same origin',()=>{
 for(const query of ['?test=AB12&lang=en','?test=AB12&preview=1','?intent=login','?intent=register','?intent=reset','?template=ABCDEFGH','?firstGuide=1','?mode=resetPassword&oobCode=example']){
  assert.equal(legacyDestination('https://gradecrew.de/'+query+'#keep'),'https://gradecrew.de/workspace.html'+query+'#keep');
 }
 assert.equal(legacyDestination('https://gradecrew.de/?utm_source=school'),null);
 assert.equal(legacyDestination('https://gradecrew.de/'),null);
 assert.equal(legacyDestination('https://gradecrew.de/workspace.html?intent=login'),null);
});

test('the published homepage links to existing app and legal pages without a second host',()=>{
 const d=new JSDOM(fs.readFileSync('homepage/index.html','utf8'),{url:'https://gradecrew.de/'}).window.document;
 assert.equal(d.getElementById('loginLink').getAttribute('href'),'/workspace.html?intent=login');
 assert.equal(d.getElementById('registerLink').getAttribute('href'),'/workspace.html?intent=register');
 for(const path of ['/secure-student.html','/datenschutz.html','/impressum.html','/support.html'])assert.ok(d.querySelector(`a[href="${path}"]`));
 assert.equal(d.querySelectorAll('[data-lang]').length,2);
 assert.equal(d.querySelectorAll('.crew-names span').length,4);
});

test('both coordinate points can be placed with keyboard and keep grid focus',async t=>{
 const dom=new JSDOM(fs.readFileSync('homepage/index.html','utf8'),{url:'https://gradecrew.de/',runScripts:'outside-only',pretendToBeVisual:true});
 t.after(()=>dom.window.close());const w=dom.window;
 Object.assign(w,await import('./homepage/grading.mjs'),await import('./homepage/illustrations.js'));
 w.eval(fs.readFileSync('homepage/app.js','utf8').replace(/^import .*;\n/gm,''));
 const grid=()=>w.document.querySelector('[data-grid="coordinate"]');
 assert.equal(grid().getAttribute('tabindex'),'0');
 const press=key=>grid().dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
 grid().focus();for(const key of ['ArrowLeft','ArrowLeft','ArrowUp'])press(key);
 w.document.querySelector('[data-pointpick="B"]').click();
 for(const key of ['ArrowRight','ArrowRight','ArrowUp','ArrowUp','ArrowUp'])press(key);
 assert.equal(w.document.activeElement,grid());
 const marks=[...grid().querySelectorAll('circle')].map(e=>[e.getAttribute('cx'),e.getAttribute('cy')]);
 assert.deepEqual(marks,[['116','118'],['244','54']]);
 assert.match(w.document.getElementById('currentMeta').textContent,/Aufgabe 1/);
});

test('homepage language follows the student and account routes without changing their intent',async t=>{
 const dom=new JSDOM(fs.readFileSync('homepage/index.html','utf8'),{url:'https://gradecrew.de/',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 Object.assign(w,await import('./homepage/grading.mjs'),await import('./homepage/illustrations.js'));w.eval(fs.readFileSync('homepage/app.js','utf8').replace(/^import .*;\n/gm,''));
 w.document.querySelector('[data-lang="en"]').click();
 for(const link of w.document.querySelectorAll('#loginLink,#registerLink,.student-entry')){const u=new URL(link.href);assert.equal(u.origin,'https://gradecrew.de');assert.equal(u.searchParams.get('lang'),'en');}
 assert.equal(new URL(w.document.getElementById('loginLink').href).searchParams.get('intent'),'login');assert.equal(new URL(w.document.querySelector('.student-entry').href).pathname,'/secure-student.html');
 w.document.querySelector('[data-lang="de"]').click();assert.equal(new URL(w.document.querySelector('.student-entry').href).searchParams.has('lang'),false);
});


test('scroll gestures scroll the public document without changing the selected question',async t=>{
 const dom=new JSDOM(fs.readFileSync('homepage/index.html','utf8'),{url:'https://gradecrew.de/',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 Object.assign(w,await import('./homepage/grading.mjs'),await import('./homepage/illustrations.js'));w.eval(fs.readFileSync('homepage/app.js','utf8').replace(/^import .*;\n/gm,''));
 const area=w.document.getElementById('testScroll'),before=w.document.getElementById('currentMeta').textContent;
 const wheel=new w.WheelEvent('wheel',{deltaY:90,bubbles:true,cancelable:true});area.dispatchEvent(wheel);
 assert.equal(wheel.defaultPrevented,false);assert.equal(w.document.getElementById('currentMeta').textContent,before);
 w.document.getElementById('overviewGrid').querySelectorAll('button')[1].click();assert.notEqual(w.document.getElementById('currentMeta').textContent,before);
});
