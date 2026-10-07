/** LOCAL-ONLY inspection fixture. Never import this module from application code. */
if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('Preview is localhost-only.');
const log = message => { document.getElementById('previewLog').textContent = message; };
const read = async path => {
  const response = await fetch(new URL(path, document.baseURI));
  if (!response.ok) throw new Error(`Local fixture source unavailable: ${path}`);
  return response.text();
};
const [html, app, startup] = await Promise.all(['index.html','app.js','startup.js'].map(read));
const sourceDOM = new DOMParser().parseFromString(html,'text/html');
const sheetPaths = [...sourceDOM.querySelectorAll('link[rel="stylesheet"]')].map(link => link.getAttribute('href'));
const designSource = startup.slice(startup.indexOf('function installGradeCrewDesignStyles()'),startup.indexOf('function installGradeCrewBrandAssets()'));
for (const match of designSource.matchAll(/["'](\.\/[^"']+\.css(?:\?[^"']*)?)["']/g)) sheetPaths.push(match[1]);
sheetPaths.push('gradecrew-workspace-upgrade.css');
await Promise.all([...new Set(sheetPaths)].map(href => new Promise((resolve,reject) => {
  const url = new URL(href,document.baseURI); if (url.origin !== location.origin) return reject(new Error('External preview stylesheet blocked.'));
  const link = document.createElement('link'); link.rel='stylesheet';link.href=url.href;link.onload=resolve;link.onerror=reject;document.head.append(link);
})));
const dashboard = sourceDOM.getElementById('dashboardView');
dashboard.classList.remove('hidden');document.getElementById('previewHost').append(document.importNode(dashboard,true));
const fixedNow = Date.now();
const fixtures = [
  {id:'DEMO01',title:'Brüche verstehen und vergleichen',subject:'Mathematik',grade:'5',questionCount:12,totalPoints:24,timeLimitMinutes:30,published:false,updatedAt:fixedNow},
  {id:'DEMO02',title:'Leseverstehen: Der kleine Wald',subject:'Deutsch',grade:'6',questionCount:8,totalPoints:20,published:true,updatedAt:fixedNow-1000},
  {id:'DEMO03',title:'Ein besonders langer Testtitel: '+ 'Wörter, Satzglieder und abwechslungsreiche Aufgaben für den Unterricht '.repeat(5),subject:'Deutsch',grade:'7',questionCount:10,totalPoints:30,ended:true,updatedAt:fixedNow-2000},
  {id:'DEMO04',title:'Ein Teilentwurf zum Prüfen',subject:'Englisch',grade:'6',questionCount:3,totalPoints:6,generationStatus:'failed',updatedAt:fixedNow-3000},
];
const jobs = [
  {id:'JOB1',status:'running',topic:'Rechnen mit Brüchen',percent:42,completedCount:5,requestedCount:12,progressMessage:'Aufgaben werden erstellt. Du kannst weiterarbeiten.',createdAt:fixedNow},
  {id:'JOB2',status:'failed',quizId:'DEMO04',topic:'Lokales Fehlerbeispiel: '+ 'Ein langer ursprünglicher Auftrag bleibt vollständig lesbar. '.repeat(6),progressMessage:'Dies ist ausschließlich eine lokale Fehlerdarstellung. '+ 'Zusätzlicher Diagnosekontext zum Prüfen der aufklappbaren Volltextanzeige. '.repeat(4),errorReference:'DEMO-LOCAL-ONLY',createdAt:fixedNow},
  {id:'JOB3',status:'ready',quizId:'DEMO01',topic:'Brüche verstehen und vergleichen',createdAt:fixedNow},
];
const state = {quizzes:fixtures,aiJobs:jobs,profile:{}};
const source = (start,end) => {
  const a=app.indexOf(start),b=app.indexOf(end,a);if(a<0||b<0)throw new Error(`Current renderer boundary changed: ${start}`);return app.slice(a,b);
};
// Like the interaction tests, evaluate ONLY these actual local presentation functions.
// No app imports, startup execution, SDK, authentication or data-writing functions run.
const render = new Function('document','state','log', `
 const $=id=>document.getElementById(id);
 const normalize=value=>String(value).toLowerCase();
 const toMillis=value=>Number(value)||0;
 const activeQuizzes=()=>state.quizzes;
 const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const renderFirstTestGuide=()=>{},updateEditorPublishControls=()=>{},renderVariantProgress=()=>{};
 const shouldShowAiJob=()=>true;
 const action=(name,id)=>log('Nur Testvorschau: '+name+' · '+(id||''));
 const openEditor=id=>action('Entwurf öffnen',id),openResults=id=>action('Ergebnisse',id),duplicateQuiz=id=>action('Duplizieren',id),showPublish=id=>action('Schülerlink',id),shareQuizTemplate=id=>action('Teilen',id),endQuiz=id=>action('Beenden',id),reopenQuiz=id=>action('Erneut öffnen',id),deleteQuiz=id=>action('Löschen',id),completeAiReview=id=>action('Prüfung abgeschlossen',id);
 const toggleDashboardPublished=(quiz,input)=>{input.checked=!!quiz.published;action('Veröffentlichung unverändert',quiz.id)};
 const dismissAiJob=job=>action('Ausblenden',job.id),showReportableError=()=>action('Problem melden');
 const REPORTABLE_ERROR_CODES={aiSimilar:'demo',aiCreate:'demo'};
 ${source('function filteredQuizzes()','async function toggleDashboardPublished')}
 ${source('function renderAiJobs()','async function renderLocalDraftList()')}
 ${source('$("quizSearch").addEventListener','$("backFromEditor").addEventListener')}
 return {renderQuizList,renderAiJobs};
`)(document,state,log);
const { registerCatalog,registerSourcePatterns,setActiveUiLocale,translateTree } = await import('../../shared/i18n/browser-runtime.mjs?v=3');
const { enGBMessages,enGBSourcePatterns } = await import('../../shared/i18n/messages-en-GB.mjs?v=3');
const { enGBCrewMessages,enGBCrewSourcePatterns } = await import('../../shared/i18n/extensions-en-GB-crew.mjs?v=3');
registerCatalog('en-GB',{...enGBMessages,...enGBCrewMessages});registerSourcePatterns('en-GB',[...enGBSourcePatterns,...enGBCrewSourcePatterns]);
render.renderQuizList();render.renderAiJobs();
const { installWorkspaceUpgrade } = await import('../../gradecrew-workspace-upgrade.mjs');
const upgrade=installWorkspaceUpgrade(document);
const scenario = () => {
 const selected=document.getElementById('previewScenario').value;
 state.quizzes=selected==='empty'?[]:fixtures;state.aiJobs=selected==='mixed'?jobs:[];
 document.getElementById('quizFilter').value='all';document.getElementById('quizSearch').value=selected==='no-results'?'XYZ keine Treffer':'';
 render.renderQuizList();render.renderAiJobs();
 if(selected==='loading') {document.getElementById('quizList').innerHTML='<div class="card">Tests werden geladen …</div>';document.getElementById('emptyQuizState').classList.add('hidden');}
 upgrade.refresh();translateTree(document.getElementById('dashboardView'));
 log('Lokale Beispieldaten · keine Verbindung zu Firebase oder KI-Diensten.');
};
document.getElementById('previewScenario').addEventListener('change',scenario);
document.getElementById('previewLanguage').addEventListener('change',event=>{setActiveUiLocale(event.target.value);upgrade.refresh();});
document.getElementById('previewReplay').addEventListener('click',()=>{const image=document.querySelector('.gcWorkspaceGreeting');image.src='assets/gradecrew/coco-workspace-greeting.svg?preview='+Date.now();});
for(const id of ['newQuizBtn','emptyNewQuizBtn','trashBtn'])document.getElementById(id)?.addEventListener('click',()=>log('Nur Testvorschau: '+id));
scenario();
