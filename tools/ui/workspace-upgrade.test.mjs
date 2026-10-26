import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { secureAudioPublicationBlocked } from '../../secure-audio-publication.mjs';
import { installWorkspaceUpgrade } from '../../gradecrew-workspace-upgrade.mjs';
import { registerCatalog, registerSourcePatterns, setActiveUiLocale, translateTree, translateSource } from '../../shared/i18n/browser-runtime.mjs?v=3';
import { enGBMessages, enGBSourcePatterns } from '../../shared/i18n/messages-en-GB.mjs?v=2';
const html = fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const app = fs.readFileSync(new URL('../../app.js',import.meta.url),'utf8');
const workspaceCss = fs.readFileSync(new URL('../../gradecrew-workspace-upgrade.css',import.meta.url),'utf8');
function setup({reduced=false}={}) {
  const dom = new JSDOM(html,{url:'https://example.test'});
  dom.window.matchMedia = () => ({matches:reduced});
  const document=dom.window.document, $=id=>document.getElementById(id), calls=[];
  const state={quizzes:[{id:'ONE',title:'Mathematik '.repeat(25),subject:'Mathematik',grade:'5',questionCount:6,totalPoints:12,published:false},{id:'TWO',title:'Deutsch',subject:'Deutsch',grade:'6',questionCount:4,totalPoints:8,published:true}],aiJobs:[]};
  const context=vm.createContext({document,$,state,Intl,Number,Boolean,String,secureAudioPublicationBlocked,normalize:value=>String(value).toLowerCase(),toMillis:()=>0,activeQuizzes:()=>state.quizzes,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;'),renderFirstTestGuide:()=>{},toggleDashboardPublished:(...args)=>calls.push(['publish',...args]),openQuizDuplicateChoiceDialog:trigger=>calls.push(['duplicate-choice',trigger?.classList.contains('duplicate')]),...Object.fromEntries(['openEditor','openResults','duplicateQuiz','showPublish','shareQuizTemplate','endQuiz','reopenQuiz','deleteQuiz'].map(name=>[name,id=>calls.push([name,id])]))});
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
  assert.equal(x.$('trashBtn').querySelectorAll('img').length,1);
  assert.equal(x.$('trashBtn').querySelectorAll('svg').length,0);
  assert.match(x.$('trashBtn').querySelector('img').getAttribute('src'),/trash-bin-3d\.png$/);
  x.document.querySelector('.edit').click(); x.document.querySelector('.duplicate').click();
  x.document.querySelector('.results').click(); x.document.querySelector('.remove').click();
  assert.deepEqual(x.calls,[['openEditor','ONE'],['duplicate-choice',true],['openResults','ONE'],['deleteQuiz','ONE']]);
 }finally{x.close();}
});
test('test cards keep the same primary actions and four stat slots across statuses',()=>{
 const x=setup();try {
  const [draft,published]=x.document.querySelectorAll('#quizList .quizCard');
  for (const card of [draft,published]) {
   assert.deepEqual([...card.querySelectorAll('.primaryQuizActions button')].map(button=>button.classList.contains('primary') ? 'primary' : 'secondary'),['primary','secondary']);
   assert.deepEqual([...card.querySelectorAll('.primaryQuizActions button')].map(button=>button.textContent),['Bearbeiten','Ergebnisse']);
   assert.equal(card.querySelectorAll('.quizStats > div').length,4);
  }
  assert.equal(draft.querySelector('.studentShare'),null);
  assert.ok(published.querySelector('.quizCardQuickLinks .studentShare'));
  assert.equal(published.querySelector('.secondaryQuizActions .studentShare'),null);
  published.querySelector('.studentShare').click();
  assert.deepEqual(x.calls.at(-1),['showPublish','TWO']);
  x.state.quizzes[0].timeLimitMinutes=15;x.state.quizzes[0].startMode='teacher';
  x.state.quizzes[1].ended=true;
  vm.runInContext('renderQuizList()',x.context);x.api.refresh();
  const [timed,ended]=x.document.querySelectorAll('#quizList .quizCard');
  assert.deepEqual([...timed.querySelectorAll('.quizStats strong')].map(node=>node.textContent),['6','12','15','Lehrkraft']);
  assert.deepEqual([...ended.querySelectorAll('.quizStats strong')].map(node=>node.textContent),['4','8','–','Schüler']);
  assert.equal(ended.querySelector('.studentShare'),null);
 }finally{x.close();}
});
test('the card trash action is icon-only, named for assistive tech and keeps deletion confirmation handler',()=>{
 const x=setup();try {
  const card=x.document.querySelector('#quizList .quizCard');
  const button=card.querySelector('.quizCardHeading .quizDeleteButton');
  assert.ok(button);
  assert.equal(card.querySelector('.quizMore .quizDeleteButton'),null);
  assert.equal(card.querySelector('.quizMore').open,false);
  assert.equal(card.querySelectorAll('.quizDeleteButton').length,1);
  assert.equal(button.textContent.trim(),'');
  assert.equal(button.getAttribute('aria-label'),'Test in den Papierkorb');
  assert.equal(button.getAttribute('title'),'Test in den Papierkorb');
  assert.equal(button.querySelectorAll('svg[aria-hidden="true"] path').length,1);
  button.click();assert.deepEqual(x.calls.at(-1),['deleteQuiz','ONE']);
  registerCatalog('en-GB',enGBMessages);
  globalThis.document=x.document;globalThis.NodeFilter=x.dom.window.NodeFilter;
  setActiveUiLocale('en-GB');translateTree(x.$('dashboardView'));
  assert.equal(button.getAttribute('aria-label'),'Move test to trash');
  assert.equal(x.document.querySelector('#quizList .quizCard .quizStats div:last-child strong').textContent,'Student');
 }finally{delete globalThis.document;delete globalThis.NodeFilter;setActiveUiLocale('de-DE');x.close();}
});
test('published cards use the publication switch without a duplicate end action',()=>{
 const x=setup();try {
  const published=[...x.document.querySelectorAll('#quizList .quizCard')].find(card=>card.dataset.quizId==='TWO');
  assert.equal(published.querySelector('.quizMore .end'),null);
  const toggle=published.querySelector('.dashboardPublishToggle');
  assert.equal(toggle.checked,true);
  toggle.checked=false;toggle.dispatchEvent(new x.dom.window.Event('change'));
  assert.equal(x.calls.at(-1)[0],'publish');
 }finally{x.close();}
});
test('only a published active test exposes the direct student link; teacher live opens the existing read-only view',()=>{
 const x=setup();try {
  const [draft,published]=x.state.quizzes;
  published.startMode='teacher';published.sessionState='waiting';
  x.state.quizzes.push({id:'RUN',title:'Gemeinsamer Test',subject:'Deutsch',grade:'7',questionCount:2,published:true,startMode:'teacher',sessionState:'running'});
  x.state.quizzes.push({id:'END',title:'Beendet',subject:'Deutsch',grade:'7',questionCount:2,published:true,ended:true,startMode:'teacher'});
  x.state.quizzes.push({id:'HOLD',title:'Gesperrt',subject:'Deutsch',grade:'7',questionCount:2,published:true,rightsHold:true,startMode:'teacher'});
  vm.runInContext('renderQuizList()',x.context);x.api.refresh();
  const cards=Object.fromEntries([...x.document.querySelectorAll('#quizList .quizCard')].map(card=>[card.dataset.quizId,card]));
  for(const id of ['ONE','END','HOLD']) assert.equal(cards[id].querySelector('.studentShare'),null,id);
  for(const id of ['TWO','RUN']) {
   assert.ok(cards[id].querySelector('.quizCardQuickLinks .studentShare'),id);
   assert.ok(cards[id].querySelector('.quizCardQuickLinks .teacherLiveOpen'),id);
   cards[id].querySelector('.teacherLiveOpen').click();
   assert.deepEqual(x.calls.at(-1),['showPublish',id]);
  }
  assert.equal(cards.ONE.querySelector('.teacherLiveOpen'),null);
  assert.equal(cards.END.querySelector('.teacherLiveOpen'),null);
  assert.equal(cards.HOLD.querySelector('.teacherLiveOpen'),null);
  assert.equal(cards.HOLD.querySelector('.quizMore'),null);
  assert.ok(cards.HOLD.querySelector('.quizCardHeading .quizDeleteButton'));
  assert.equal(cards.TWO.querySelector('.teacherLiveOpen').textContent,'Durchführung öffnen');
 }finally{x.close();}
});
test('opening more actions belongs to one card and leaves its neighbor closed',()=>{
 const x=setup();try {
  const [first,second]=x.document.querySelectorAll('#quizList .quizCard');
  first.querySelector('.quizMore summary').click();
  assert.equal(first.querySelector('.quizMore').open,true);
  assert.equal(second.querySelector('.quizMore').open,false);
  const action=first.querySelector('.quizMore .duplicate');action.focus();
  action.dispatchEvent(new x.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(first.querySelector('.quizMore').open,false);
  assert.equal(x.document.activeElement,first.querySelector('.quizMore summary'));
 }finally{x.close();}
});
test('card spacing remains a fixed four-column grid on desktop and two-column grid on phones',()=>{
 assert.match(workspaceCss,/\.quizStats\s*\{[^}]*grid-template-columns:\s*repeat\(4,minmax\(0,1fr\)\)/s);
 assert.match(workspaceCss,/@media \(max-width: 650px\)[\s\S]*\.quizStats\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(workspaceCss,/\.quizStats strong\s*\{[^}]*white-space:\s*nowrap/s);
 assert.match(workspaceCss,/\.quizStats > div\s*\{[^}]*text-align:\s*center/s);
 assert.match(workspaceCss,/@media \(max-width: 650px\)[\s\S]*\.quizStats :is\(strong,span\)\s*\{[^}]*min-height:\s*0/s);
 assert.match(workspaceCss,/\.quizGrid\s*\{[^}]*align-items:\s*start/s);
 assert.match(workspaceCss,/\.primaryQuizActions\s*\{[^}]*margin-top:\s*0/s);
 assert.match(workspaceCss,/\.quizCardHeading \.quizDeleteButton\s*\{[^}]*width:\s*44px/s);
});
test('a 70–95-character test title stays complete and keeps the same action structure',()=>{
 const x=setup();try {
  const fullTitle='Nomen und Adjektive – lustige Sprachaufgaben für die ganze fünfte Klasse';
  assert.ok(fullTitle.length>=70&&fullTitle.length<=95);
  x.state.quizzes[0].title=fullTitle;
  vm.runInContext('renderQuizList()',x.context);x.api.refresh();
  const [draft,published]=x.document.querySelectorAll('#quizList .quizCard');
  assert.equal(draft.querySelector('h3').textContent,fullTitle);
  assert.deepEqual([...draft.querySelectorAll('.primaryQuizActions button')].map(button=>button.textContent),[...published.querySelectorAll('.primaryQuizActions button')].map(button=>button.textContent));
  assert.equal(draft.querySelectorAll('.quizStats > div').length,published.querySelectorAll('.quizStats > div').length);
 }finally{x.close();}
});
test('all visible card controls and metadata translate to English while authored titles stay unchanged',()=>{
 const x=setup();try {
  x.state.quizzes[0].timeLimitMinutes=15;x.state.quizzes[0].startMode='teacher';
  x.state.quizzes[1].startMode='teacher';x.state.quizzes[1].sessionState='waiting';
  vm.runInContext('renderQuizList()',x.context);x.api.refresh();
  registerCatalog('en-GB',enGBMessages);
  registerSourcePatterns('en-GB',enGBSourcePatterns);
  globalThis.document=x.document;globalThis.NodeFilter=x.dom.window.NodeFilter;
  setActiveUiLocale('en-GB');translateTree(x.$('dashboardView'));
  const [draft,published]=x.document.querySelectorAll('#quizList .quizCard');
  assert.equal(draft.querySelector('h3').textContent,x.state.quizzes[0].title);
  assert.equal(draft.querySelector('.meta').textContent,'Mathematik · Class 5 · Code ONE');
  assert.deepEqual([...draft.querySelectorAll('.primaryQuizActions button')].map(button=>button.textContent),['Edit','Results']);
  assert.deepEqual([...draft.querySelectorAll('.quizStats > div')].map(row=>row.querySelector('span').textContent),['Questions','Points','Minutes','Start']);
  assert.equal(draft.querySelector('.quizStats > div:last-child strong').textContent,'Teacher');
  assert.equal(published.querySelector('.quizStats > div:nth-child(3) span').textContent,'No limit');
  assert.equal(published.querySelector('.quizCardQuickLinks .studentShare').textContent,'Student link');
  assert.equal(published.querySelector('.quizCardQuickLinks .teacherLiveOpen').textContent,'Open live session');
  assert.equal(published.querySelector('.quizMore summary').textContent,'More actions');
  assert.equal(published.querySelector('.quizDeleteButton').getAttribute('aria-label'),'Move test to trash');
  assert.equal(published.querySelector('.quizDeleteButton').getAttribute('title'),'Move test to trash');
  assert.equal(published.querySelector('.dashboardPublishToggle').getAttribute('aria-label'),'Toggle publication');
  assert.equal(published.querySelector('.status').textContent,'Waiting to start');
 }finally{delete globalThis.document;delete globalThis.NodeFilter;setActiveUiLocale('de-DE');x.close();}
});
test('Remy action and recycling bin stay grouped in the compact desktop and mobile header',()=>{
 const x=setup();try {
  assert.equal(x.$('newQuizBtn').parentElement,x.$('trashBtn').parentElement);
  assert.ok(x.$('trashBtn').closest('.dashboardActions'));
  assert.match(workspaceCss,/\.dashboardActions\s*\{[^}]*display:\s*flex/s);
  assert.match(workspaceCss,/\.dashboardPrimaryActions\s*\{[^}]*display:\s*flex/s);
  assert.match(workspaceCss,/#dashboardView\.gcWorkspace #trashBtn\s*\{[^}]*width:\s*44px/s);
  assert.match(workspaceCss,/@media \(max-width: 650px\)[\s\S]*\.dashboardActions\s*\{[^}]*justify-self:\s*end/s);
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
test('late tutorial button keeps its handler without recreating the large crew card',async()=>{
 const x=setup();try {
  const button=x.document.createElement('button');button.id='gradecrewTourBtn';
  button.innerHTML='<span>Crew kennenlernen</span><small>Tutorial · ca. 6–7 Minuten</small>';
  let started=0;button.onclick=()=>started++;
  x.document.querySelector('.dashboardActions').prepend(button);await tick();
  assert.equal(x.document.querySelector('.gcWorkspaceCrewEntry'),null);
  button.click();assert.equal(started,1);
  button.innerHTML='<span>Crew kennenlernen</span><small>Tutorial · ca. 6–7 Minuten</small>';await tick();
  x.api.refresh();assert.equal(x.document.querySelector('.gcWorkspaceCrewEntry'),null);
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
