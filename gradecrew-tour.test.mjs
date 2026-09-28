import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {JSDOM} = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync(new URL('./gradecrew-tour.js', import.meta.url), 'utf8');
function fixture() {
 const dom = new JSDOM('<div id="dashboardView"><div class="dashboardActions"></div></div>', {url:'https://example.test',runScripts:'outside-only'});
 const w = dom.window;
 w.HTMLDialogElement.prototype.showModal = function() {this.open=true};
 w.HTMLDialogElement.prototype.close = function() {this.open=false;this.dispatchEvent(new w.Event('close'))};
 const timers = new Map();let id=0;
 w.setTimeout = (fn,ms) => {timers.set(++id,{fn,ms});return id};
 w.clearTimeout = id => timers.delete(id);
 w.eval(source.replace(/export \{[^}]+\};/, ''));
 const ready=(uid='teacher1',firstVisit=true)=>w.document.dispatchEvent(new w.CustomEvent('gradecrew:dashboard-ready',{detail:{uid,firstVisit}}));
 const click=action=>w.document.querySelector(`[data-tour-action="${action}"]`).click();
 const field=(selector,value)=>{const el=w.document.querySelector(selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 return {w,ready,click,field,timers,title:()=>w.document.querySelector('h2')?.textContent,dialog:()=>w.document.querySelector('dialog')};
}
test('Prepared tour advances exactly after three seconds and cancels on close',()=>{
 const f=fixture();f.ready();f.click('next');f.click('next');f.click('next');
 assert.equal(f.timers.size,1); const timer=[...f.timers.values()][0];assert.equal(timer.ms,3000);
 timer.fn();assert.match(f.title(),/Prüfe Aufgaben/);
 f.click('back');assert.equal(f.timers.size,1);f.click('close');assert.equal(f.timers.size,0);
 timer.fn();assert.equal(f.dialog().open,false);f.w.close();
});
test('Complete journey requires improvement, variant, answers and manual assessment',()=>{
 const f=fixture();f.ready();for(let i=0;i<4;i++)f.click('next');
 f.click('next');assert.equal(f.w.document.querySelector('[data-tour-action="next"]').disabled,true);
 f.click('improve');f.click('next');f.click('variant');f.click('next');f.click('next');
 f.click('next');assert.match(f.w.document.querySelector('[role="alert"]').textContent,/alle sechs/);
 ['blue','Bleistift','red','True','My schoolbag is green.','school bag'].forEach((v,i)=>f.field(`[name="answer${i}"]`,v));
 f.click('next');assert.match(f.title(),/nachprüfen/);f.click('next');assert.match(f.w.document.querySelector('[role="alert"]').textContent,/Punkte/);
 f.field('#gcManualPoints','2');f.click('next');f.click('next');assert.match(f.w.document.querySelector('.gcPracticeScore').textContent,/12 \/ 12/);
 f.click('next');f.click('next');assert.equal(f.dialog().open,false);assert.equal(f.w.localStorage.getItem('gradecrew-practice-v2:teacher1'),'done');f.w.close();
});
test('Dismissal does not restart automatically and completion is per account',()=>{
 const f=fixture();f.ready();f.click('close');f.ready();assert.equal(f.dialog().open,false);
 f.w.document.getElementById('gradecrewTourBtn').click();assert.equal(f.dialog().open,true);
 f.w.document.dispatchEvent(new f.w.Event('gradecrew:signed-out'));assert.equal(f.dialog().open,false);
 f.ready('teacher2');assert.equal(f.dialog().open,true);assert.equal(f.w.document.querySelectorAll('#gradecrewTourBtn').length,1);f.w.close();
});
test('Demo cannot invoke AI, persist a test, publish or create a body observer',()=>{
 assert.doesNotMatch(source,/MutationObserver|fetch\(|httpsCallable|importJsonBtn|publishBtn|window\.open|createQuizDocument/);
 assert.match(source,/asset: "elephant-create"/);
});
