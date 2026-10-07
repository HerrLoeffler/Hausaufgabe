import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const app = fs.readFileSync('app.js', 'utf8');

test('returning to the public start focuses its heading rather than the invisible Remy hotspot', () => {
  const dom=new JSDOM('<section id="authView"><section id="gcEntryStart"><button class="gcHeroHit">Remy hotspot</button><h1>GradeCrew</h1><button>Remy</button></section><section id="gcEntryLogin"></section><section id="gcEntryRegister"></section></section>');
  const source=fs.readFileSync('gradecrew-entry-flow.js','utf8');
  const code=source.slice(source.indexOf('function setState('),source.indexOf('\nfunction showLogin'));
  const context={document:dom.window.document,$:id=>dom.window.document.getElementById(id),stateIds:{start:'gcEntryStart',login:'gcEntryLogin',register:'gcEntryRegister'},activeState:null,requestAnimationFrame:callback=>callback()};
  vm.runInNewContext(code+'\nsetState("start")',context);
  assert.equal(dom.window.document.activeElement.tagName,'H1');
  dom.window.close();
});

test('tour hardening preserves the fixed coach position required by measured viewport coordinates', () => {
  const dom = new JSDOM('<html><head></head><body><aside class="gcRealCoach gcCoachCentered"></aside></body></html>', {runScripts:'outside-only'});
  const observers=[];
  const Observer=dom.window.MutationObserver;
  dom.window.MutationObserver=class extends Observer { constructor(callback) { super(callback); observers.push(this); } };
  const style = dom.window.document.createElement('style');
  style.textContent = fs.readFileSync('gradecrew-tour.css','utf8');
  dom.window.document.head.append(style);
  dom.window.eval(fs.readFileSync('crew-tour-hardening.js','utf8').replace(/^export /gm,''));
  assert.equal(dom.window.getComputedStyle(dom.window.document.querySelector('.gcRealCoach')).position, 'fixed');
  observers.forEach(observer=>observer.disconnect());
  dom.window.close();
});

test('opening a new creation form clears task-specific fields but restores saved teacher defaults', async () => {
  const dom = new JSDOM(fs.readFileSync('index.html','utf8'));
  const doc=dom.window.document;
  const state={profile:{aiPreferences:'Kurze Aufgaben'},aiMaterials:[],aiJobs:[]};
  doc.getElementById('aiTopic').value='Alter Englischtest';
  doc.getElementById('aiCustomNotes').value='Alte Wünsche';
  doc.getElementById('aiImageQuestionCount').value='3';
  doc.getElementById('aiCount').value='20';
  const start=app.indexOf('async function openAiView()');
  const end=app.indexOf('\nfunction aiFriendlyError',start);
  const resetStart=app.indexOf('function resetAiFormForNewTest(');
  const helper=resetStart<0?'':app.slice(resetStart,start);
  const noop=()=>{};
  const context={document:doc,window:dom.window,CustomEvent:dom.window.CustomEvent,state,$:id=>doc.getElementById(id),getSettings:()=>({defaultSubject:'Mathematik',defaultGrade:'7'}),QUESTION_TYPES:[['single','Single Choice']],renderAiMaterials:noop,updateAiTypeCount:noop,updateAiImageControls:noop,updateAiAudioControls:noop,updateAiPointsControls:noop,showView:noop,setAiProgress:noop,renderAiJobs:noop,escapeHtml:s=>s,firstAiGuideStep:null,crewTour:null,aiApi:{status:async()=>({enabled:true})}};
  await vm.runInNewContext(helper+app.slice(start,end)+'\nopenAiView()',context);
  assert.equal(doc.getElementById('aiTopic').value,'');
  assert.equal(doc.getElementById('aiCustomNotes').value,'');
  assert.equal(doc.getElementById('aiSubject').value,'Mathematik');
  assert.equal(doc.getElementById('aiGrade').value,'7');
  assert.equal(doc.getElementById('aiImageQuestionCount').value,'0');
  assert.equal(doc.getElementById('aiCount').value,doc.getElementById('aiCount').defaultValue);
  assert.equal(doc.getElementById('aiPersonalPreferences').value,'Kurze Aufgaben');
  dom.window.close();
});
