import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { installWorkspaceUpgrade } from '../../gradecrew-workspace-upgrade.mjs';
import { setActiveUiLocale, translateTree, translateSource } from '../../shared/i18n/browser-runtime.mjs?v=3';
const html = fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const app = fs.readFileSync(new URL('../../app.js',import.meta.url),'utf8');
function setup({reduced=false}={}) {
  const dom = new JSDOM(html,{url:'https://example.test'});
  dom.window.matchMedia = () => ({matches:reduced});
  const document=dom.window.document, $=id=>document.getElementById(id), calls=[];
  const state={quizzes:[{id:'ONE',title:'Mathematik '.repeat(25),subject:'Mathematik',grade:'5',questionCount:6,totalPoints:12,published:false},{id:'TWO',title:'Deutsch',subject:'Deutsch',grade:'6',questionCount:4,totalPoints:8,published:true}],aiJobs:[]};
  const context=vm.createContext({document,$,state,Intl,Number,Boolean,String,normalize:value=>String(value).toLowerCase(),toMillis:()=>0,activeQuizzes:()=>state.quizzes,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;'),renderFirstTestGuide:()=>{},toggleDashboardPublished:(...args)=>calls.push(['publish',...args]),...Object.fromEntries(['openEditor','openResults','duplicateQuiz','showPublish','shareQuizTemplate','endQuiz','reopenQuiz','deleteQuiz'].map(name=>[name,id=>calls.push([name,id])]))});
  vm.runInContext(app.slice(app.indexOf('function filteredQuizzes()'),app.indexOf('async function toggleDashboardPublished')),context);
  vm.runInContext(app.slice(app.indexOf('$("quizSearch").addEventListener'),app.indexOf('$("backFromEditor").addEventListener')),context);
  vm.runInContext('renderQuizList()',context);
  const api=installWorkspaceUpgrade(document);
  return {dom,document,$,state,calls,context,api,close:()=>{api.disconnect();dom.window.close();}};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('moves original toolbar above jobs and tests, preserves nodes and click handlers; install is idempotent',()=>{
 const x=setup();try {
  assert.equal(installWorkspaceUpgrade(x.document),x.api);
  const nodes=[...x.$('dashboardView').children];
  assert.ok(nodes.indexOf(x.document.querySelector('.dashboardToolbar'))<nodes.indexOf(x.$('aiJobsList')));
  assert.equal(x.document.querySelectorAll('.gcWorkspaceGreeting').length,0);
  assert.equal(x.document.querySelectorAll('[data-filter="all"]').length,1);
  x.document.querySelector('.edit').click(); x.document.querySelector('.duplicate').click();
  x.document.querySelector('.results').click(); x.document.querySelector('.remove').click();
  assert.deepEqual(x.calls,[['openEditor','ONE'],['duplicateQuiz','ONE'],['openResults','ONE'],['deleteQuiz','ONE']]);
 }finally{x.close();}
});
test('all/status/search controls use real existing filtering and retain active counts after rerender',async()=>{
 const x=setup();try {
  x.document.querySelector('[data-filter="published"]').click(); await tick();
  assert.equal(x.document.querySelectorAll('.quizCard').length,1);
  assert.equal(x.document.querySelector('[data-filter="all"]').getAttribute('aria-pressed'),'false');
  x.document.querySelector('[data-filter="all"]').click(); await tick();
  assert.equal(x.document.querySelectorAll('.quizCard').length,2);
  assert.equal(x.$('publishedQuizCount').textContent,'1');
  assert.equal(x.$('draftQuizCount').textContent,'1');
  assert.equal(x.document.querySelector('[data-filter="all"]').getAttribute('aria-pressed'),'true');
  x.$('quizSearch').value='Deutsch'; x.$('quizSearch').dispatchEvent(new x.dom.window.Event('input'));await tick();
  assert.equal(x.document.querySelectorAll('.quizCard').length,1);
  x.document.querySelector('.edit').click(); assert.deepEqual(x.calls.at(-1),['openEditor','TWO']);
 }finally{x.close();}
});
test('long authored title remains exact and expandable, including markup-looking text',()=>{
 const x=setup();try {
  const title=x.document.querySelector('.quizCard h3'), full=x.document.querySelector('.gcWorkspaceDisclosure p');
  assert.equal(full.textContent,title.textContent); assert.equal(full.getAttribute('data-i18n-content'),'');
  const summary=x.document.querySelector('.gcWorkspaceDisclosure summary'); summary.click();
  assert.equal(summary.parentElement.open,true); summary.click(); assert.equal(summary.parentElement.open,false);
  x.api.refresh(); assert.equal(x.document.querySelectorAll('.quizCard .gcWorkspaceDisclosure').length,1);
 }finally{x.close();}
});
test('asynchronous job refresh preserves partial draft/report/dismiss actions and full failed message',async()=>{
 const x=setup();try {
  const card=x.document.createElement('article');card.className='card aiJobCard aiJobFailed';
  card.innerHTML='<div class="aiJobStatusIcon">!</div><div class="aiJobBody"><strong></strong><p></p><small>Referenz ABC</small></div><div class="aiJobActions"><button class="openAiJob">Teilentwurf öffnen</button><button class="reportAiJob">Problem melden</button><button class="dismissAiJob">Ausblenden</button></div>';
  const authored='<script>untrusted text</script> '.repeat(20);card.querySelector('strong').textContent=authored;card.querySelector('p').textContent=authored;
  const seen=[];for(const cls of ['openAiJob','reportAiJob','dismissAiJob'])card.querySelector('.'+cls).addEventListener('click',()=>seen.push(cls));
  x.$('aiJobsList').append(card);await tick();
  assert.equal(card.querySelectorAll('.gcWorkspaceDisclosure').length,2);
  assert.equal(card.querySelector('.gcWorkspaceDisclosure p').textContent,authored);assert.equal(card.querySelector('script'),null);
  for(const cls of ['openAiJob','reportAiJob','dismissAiJob'])card.querySelector('.'+cls).click();
  assert.deepEqual(seen,['openAiJob','reportAiJob','dismissAiJob']);assert.equal(card.querySelectorAll('button').length,3);
 }finally{x.close();}
});
test('late tutorial button keeps its handler, has four original portraits and one external duration after rerender',async()=>{
 const x=setup();try {
  const button=x.document.createElement('button');button.id='gradecrewTourBtn';
  button.innerHTML='<span>Crew kennenlernen</span><small>Tutorial · ca. 6–7 Minuten</small>';
  let started=0;button.onclick=()=>started++;
  x.document.querySelector('.dashboardActions').prepend(button);await tick();
  const entry=x.document.querySelector('.gcWorkspaceCrewEntry');
  assert.equal(entry.querySelectorAll('img').length,4);assert.equal(entry.querySelector('button'),button);
  button.click();assert.equal(started,1);assert.equal(button.querySelector('small'),null);
  button.innerHTML='<span>Crew kennenlernen</span><small>Tutorial · ca. 6–7 Minuten</small>';await tick();
  assert.equal(entry.querySelectorAll(':scope > small').length,1);assert.equal(x.document.querySelectorAll('.gcWorkspaceCrewEntry').length,1);
  button.click();assert.equal(started,2);
 }finally{x.close();}
});
test('new source labels translate while authored full text is protected',()=>{
 const x=setup();try {
  globalThis.document=x.document;globalThis.NodeFilter=x.dom.window.NodeFilter;
  setActiveUiLocale('en-GB');translateTree(x.$('dashboardView'));
  assert.equal(x.document.querySelector('.gcWorkspaceDisclosure summary').textContent,'Show full title');
  assert.equal(translateSource('Als geprüft markieren'),'Mark as reviewed');
  assert.equal(translateSource('Wartet auf deine Prüfung'),'Waiting for your review');
  assert.equal(translateSource('1 Erstellung braucht deine Aufmerksamkeit.'),'1 creation request needs your attention.');
  assert.equal(translateSource('2 Erstellungen brauchen deine Aufmerksamkeit.'),'2 creation requests need your attention.');
  assert.equal(x.document.querySelector('.gcWorkspaceDisclosure p').textContent,x.state.quizzes[0].title);
 }finally{delete globalThis.document;delete globalThis.NodeFilter;setActiveUiLocale('de-DE');x.close();}
});
test('native more-actions disclosure and publishing toggle remain wired, loading state is readable',()=>{
 const x=setup();try {
  const more=x.document.querySelector('.quizMore');more.querySelector('summary').click();assert.equal(more.open,true);
  const toggle=x.document.querySelector('.dashboardPublishToggle');toggle.dispatchEvent(new x.dom.window.Event('change'));assert.equal(x.calls.at(-1)[0],'publish');
  x.$('quizList').innerHTML='<div class="card">Tests werden geladen …</div>';x.api.refresh();
  assert.equal(x.document.querySelector('.gcWorkspaceLoading').getAttribute('role'),'status');
  assert.match(x.document.querySelector('.gcWorkspaceLoading').textContent,/geladen/);
 }finally{x.close();}
});

test('no-result reset still calls the existing filtering and focuses the search',async()=>{
 const x=setup();try {
  x.$('quizSearch').value='no such test';x.$('quizSearch').dispatchEvent(new x.dom.window.Event('input'));await tick();
  assert.equal(x.$('noFilterState').classList.contains('hidden'),false);
  x.$('clearQuizFiltersBtn').click();await tick();
  assert.equal(x.document.querySelectorAll('.quizCard').length,2);assert.equal(x.document.activeElement,x.$('quizSearch'));
 }finally{x.close();}
});
test('job titles lose only the generated prefix and keep original full detail',async()=>{
 const x=setup();try {
  const card=x.document.createElement('article');card.className='card aiJobCard';
  card.innerHTML='<div class="aiJobBody"><strong></strong><p>Erstellung läuft</p></div>';
  const original='KI-Test · '+ 'Ein authored Thema mit vollständigem Text '.repeat(5);card.querySelector('strong').textContent=original;
  x.$('aiJobsList').append(card);await tick();
  assert.equal(card.querySelector('strong').textContent,original.replace(/^KI-Test · /,''));
  assert.equal(card.querySelector('.gcWorkspaceDisclosure p').textContent,original);
  assert.equal(card.querySelector('strong').dataset.workspaceOriginalTitle,original);
 }finally{x.close();}
});
test('attention subtitle counts confirmed failed jobs and restores after removal',async()=>{
 const x=setup();try {
  const subtitle=x.document.querySelector('.pageHead > div > p'),original=subtitle.textContent;
  x.$('aiJobsList').innerHTML='<article class="aiJobCard aiJobFailed"></article><article class="aiJobCard aiJobReady"></article>';await tick();
  assert.equal(subtitle.textContent,'1 Erstellung braucht deine Aufmerksamkeit.');
  x.$('aiJobsList').insertAdjacentHTML('beforeend','<article class="aiJobCard aiJobFailed"></article>');await tick();
  assert.equal(subtitle.textContent,'2 Erstellungen brauchen deine Aufmerksamkeit.');
  x.$('aiJobsList').replaceChildren();await tick();assert.equal(subtitle.textContent,original);
 }finally{x.close();}
});
test('ready jobs keep review actions and full guidance with clearer display labels',async()=>{
 const x=setup();try {
  const card=x.document.createElement('article');card.className='aiJobCard aiJobReady';
  card.innerHTML='<div class="aiJobBody"><strong>Test · Brüche</strong><p>Entwurf erstellt. Prüfe die Aufgaben und schließe die Prüfung anschließend ab.</p><small>Prüfung offen</small></div><div class="aiJobActions"><button class="openAiJob">Entwurf prüfen</button><button class="completeAiReview">Prüfung abgeschlossen</button></div>';
  let reviewed=0;const button=card.querySelector('.completeAiReview');button.addEventListener('click',()=>reviewed++);
  x.$('aiJobsList').append(card);await tick();
  assert.equal(button.textContent,'Als geprüft markieren');assert.equal(card.querySelector('small').textContent,'Wartet auf deine Prüfung');
  assert.match(card.querySelector('.gcWorkspaceReviewNote p').textContent,/Prüfe die Aufgaben/);
  card.querySelector('.gcWorkspaceReviewNote summary').click();assert.equal(card.querySelector('.gcWorkspaceReviewNote').open,true);
  button.click();assert.equal(reviewed,1);assert.equal(card.querySelectorAll('button').length,2);
  x.api.refresh();assert.equal(card.querySelectorAll('.gcWorkspaceReviewNote').length,1);
 }finally{x.close();}
});
