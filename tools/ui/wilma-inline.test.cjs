const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {JSDOM}=require('jsdom');
const source=f=>readFileSync(__dirname+'/../../'+f,'utf8');
const app=source('app.js');
function fn(name){const start=app.indexOf('function '+name+'(');if(start<0)return '';return app.slice(app.slice(start-6,start)==='async '?start-6:start,app.indexOf('\n}',start)+2);}
function setup(t){
 const dom=new JSDOM('<style>'+source('styles.css')+source('review-mode.css')+'</style><h1 id="resultsHeading">Test</h1><div id="resultsTableWrap"></div><div id="reviewPanel" class="card reviewPanel hidden"></div><aside data-review-panel class="reviewPanel">Seite überarbeiten</aside>',{url:'https://example.test',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 w.$=id=>w.document.getElementById(id);w.escapeHtml=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');w.round1=v=>Math.round(v*10)/10;w.fmtDate=()=>'';w.formatDuration=()=>'';w.submissionGrade=()=>'-';w.answerDisplay=(q,a)=>a||'';w.correctDisplay=()=>'';w.getQuestionImageSrc=()=>'';w.getQuizScale=()=>({thresholds:[91,77,57,39,25,0]});w.gradeFromPercent=()=>2;w.scrollBehavior=()=>'auto';w.HTMLElement.prototype.scrollIntoView=function(){};w.crewTour=null;w.guestTourRepo=null;w.wilmaAnswerReview=null;w.wilmaAutoReview=null;w.parseGaps=()=>[];
 w.eval(source('wilma-decision-state.mjs').replace(/^export /gm,'')+';Object.assign(window,{canonicalDecisionState,canonicalJson,decisionQuestionSnapshot});');
 w.eval(source('wilma-answer-review.mjs').split('export function installWilmaAnswerReview')[0].replace(/^export /gm,'')+';Object.assign(window,{reviewItem});');
 w.eval(source('teacher-review-write.mjs').replace(/^import[^\n]+\n/,'').replace(/^export /gm,''));
 w.runTransaction=async(db,fn)=>fn({get:async ref=>({exists:()=>true,data:()=>ref.includes('submissions')?w.state.submissions.find(s=>s.id===ref.at(-1)):ref.includes('questions')?w.state.resultQuestions.find(q=>q.id===ref.at(-1)):w.state.currentResultsQuiz}),update:(ref,patch)=>w.updateDoc(ref,patch)});
 w.state={currentResultsQuiz:{id:'qtest',ownerId:'owner'},user:{uid:'owner'},resultQuestions:[{id:'q1',text:'Ein Halb erklären',type:'manual',points:3}],submissions:['s1','s2'].map(id=>({id,studentName:id==='s1'?'Fiktiv A':'Fiktiv B',answers:{q1:'Eine Hälfte.'},grading:{q1:{awardedPoints:0,maxPoints:3,needsReview:true}},status:'review',totalPoints:0,maxPoints:3,percent:0}))};
 for(const n of ['confirmDiscardInlineReview','resetInlineReview','placeInlineReview','renderResultsTable','openReview','saveReview']){const s=fn(n);if(s)w.eval(s);}
 w.eval(source('teacher-grading-summary.mjs').replace(/^export /gm,''));w.eval(fn('submissionGrade'));w.gradeFromPercent=(p,s)=>s.thresholds.findIndex(t=>p>=t)+1;w.renderResultsTable();return w;
}
test('Seitenleisten-CSS trifft nur das Adminwerkzeug, nicht die Schülerkorrektur',t=>{const w=setup(t);assert.notEqual(w.getComputedStyle(w.$('reviewPanel')).position,'fixed');assert.equal(w.getComputedStyle(w.document.querySelector('[data-review-panel]')).position,'fixed');});
test('Korrektur erscheint direkt unter der gewählten Schülerzeile',t=>{const w=setup(t);w.openReview('s1');const row=w.$('reviewPanel').closest('tr');assert.ok(row,'Formular muss in Detailzeile stehen');assert.equal(row.previousElementSibling.querySelector('.reviewBtn').dataset.id,'s1');assert.equal(row.cells[0].colSpan,row.previousElementSibling.cells.length);assert.equal(w.$('reviewHeading').textContent,'Fiktiv A');assert.equal(w.document.activeElement,w.$('reviewHeading'));});
test('Schülerwechsel erhält genau ein Formular und verändert keine Bewertungen',t=>{const w=setup(t);const before=JSON.stringify(w.state.submissions);w.openReview('s1');w.openReview('s2');assert.equal(w.document.querySelectorAll('.submissionReviewRow').length,1);assert.equal(w.$('reviewPanel').closest('tr').previousElementSibling.querySelector('.reviewBtn').dataset.id,'s2');assert.equal(JSON.stringify(w.state.submissions),before);});
test('Schließen entfernt Detailzeile und gibt Fokus zurück',t=>{const w=setup(t);const b=w.document.querySelector('.reviewBtn');b.focus();w.openReview('s1');w.$('closeReview').click();assert.equal(w.document.querySelectorAll('.submissionReviewRow').length,0);assert.ok(w.$('reviewPanel').classList.contains('hidden'));assert.equal(w.document.activeElement,b);assert.equal(b.getAttribute('aria-expanded'),'false');});
test('Tabellenaktualisierung löscht das wiederverwendete Formular nicht',t=>{const w=setup(t);const p=w.$('reviewPanel');w.openReview('s1');w.renderResultsTable();assert.equal(w.$('reviewPanel'),p);assert.equal(w.document.querySelectorAll('.submissionReviewRow').length,0);assert.ok(p.classList.contains('hidden'));w.openReview('s2');assert.equal(w.$('reviewHeading').textContent,'Fiktiv B');});
test('Speichern verwendet denselben Vertrag und nur die gewählte Abgabe',async t=>{const w=setup(t);const calls=[];w.db={};w.doc=(...args)=>args;w.serverTimestamp=()=>123;w.updateDoc=async(ref,patch)=>calls.push({ref,patch});w.toast=()=>{};w.openResults=async()=>w.renderResultsTable();w.openReview('s1');w.document.querySelector('.manualPoints').value='2.5';await w.saveReview('s1');assert.equal(calls.length,1);assert.equal(calls[0].ref.at(-1),'s1');assert.equal(calls[0].patch.grading.q1.awardedPoints,2.5);assert.equal(w.state.submissions[1].grading.q1.awardedPoints,0);assert.ok(w.$('reviewPanel'));});
test('Gasttour verlassen schließt den Aufgabendialog und erhält den Formularanker', t => {
  const w = setup(t);
  w.openReview('s1');
  const original = w.$('reviewPanel');
  const { submissions: students, resultQuestions: questions } = w.state;
  for (const id of ['editorHeading', 'resultsMeta', 'editorView']) {
    const element = w.document.createElement('div');
    element.id = id;
    w.document.body.append(element);
  }
  for (const key of ['stopStudentTimer', 'clearPublishSubscriptions', 'clearStudentSubscriptions', 'showView']) w[key] = () => {};
  w.draftTimer = null;
  w.studentConfirmationPending = new Map();
  w.studentSubmissionBusy = new Set();
  w.completedStudentSubmissions = new Set();
  w.questionActionDialogs = 'dialog.questionActionDialog[open], dialog.variantRequestDialog[open], dialog.questionVariantDialog[open]';
  const dialog = w.document.createElement('dialog');
  dialog.className = 'questionActionDialog';
  dialog.open = true;
  dialog.close = () => { dialog.open = false; };
  w.document.body.append(dialog);
  w.eval([fn('closeQuestionActionDialogs'), fn('exitGuestTour')].join('\n'));
  assert.doesNotThrow(() => w.exitGuestTour());
  assert.equal(dialog.open, false);
  assert.equal(w.$('reviewPanel'), original);
  assert.ok(original.classList.contains('hidden'));
  w.state.submissions = students;
  w.state.resultQuestions = questions;
  w.state.currentResultsQuiz = { id: 'qtest' };
  w.renderResultsTable();
  w.openReview('s2');
  assert.equal(w.$('reviewHeading').textContent, 'Fiktiv B');
});

test('Ergebnisliste zeigt automatische Note trotz altem Reviewstatus sofort',t=>{const w=setup(t);const a=w.state.submissions[0];a.grading.q1={awardedPoints:3,autoPoints:3,maxPoints:3,needsReview:false,correct:true};a.totalPoints=3;a.percent=100;w.renderResultsTable();const row=w.document.querySelector('.reviewBtn').closest('tr');assert.equal(row.querySelector('[data-label=Note]').textContent,'1');assert.equal(row.querySelector('[data-label=Status]').textContent,'Bewertet');assert.equal(a.status,'review');});
test('offene Freitextpunkte erzeugen keine Note aus der vorläufigen Null',t=>{const w=setup(t);const row=w.document.querySelector('.reviewBtn').closest('tr');assert.equal(row.querySelector('[data-label=Note]').textContent,'–');assert.equal(row.querySelector('[data-label=Status]').textContent,'Prüfen');w.state.submissions[0].grade=2;w.renderResultsTable();assert.equal(w.document.querySelector('.reviewBtn').closest('tr').querySelector('[data-label=Note]').textContent,'2 (vorläufig)');});
test('unbekannte nichtleere Lücke bleibt trotz alter automatischer Null prüfbedürftig',t=>{const w=setup(t);w.state.resultQuestions=[{id:'q1',type:'gapfill',text:'Ein [Verb].',points:3}];w.parseGaps=()=>[{answers:['Verb']}];const s=w.state.submissions[0];Object.assign(s,{answers:{q1:['Zeitwort']},grading:{q1:{awardedPoints:0,autoPoints:0,maxPoints:3,needsReview:false,correct:false}},totalPoints:0,maxPoints:3,percent:0});w.renderResultsTable();const row=w.document.querySelector('.reviewBtn').closest('tr');assert.equal(row.querySelector('[data-label=Note]').textContent,'–');assert.equal(row.querySelector('[data-label=Status]').textContent,'Prüfen');});
test('Vollformular öffnet während laufender Klassenprüfung keine verlierbaren Eingaben',t=>{const w=setup(t);let notice='';w.toast=text=>notice=text;w.wilmaAnswerReview={isBusy:()=>true};w.openReview('s1');assert.ok(w.$('reviewPanel').classList.contains('hidden'));assert.match(notice,/abwarten/);});
test('Sortieren ist im normalen Ergebnisweg gebunden und schützt ungespeicherte Punkte',t=>{
 const w=setup(t);const before=JSON.stringify(w.state.submissions);w.confirmDiscardInlineReview=()=>true;
 Object.assign(w.state.submissions[0],{studentFirstName:'Zoe'});Object.assign(w.state.submissions[1],{studentFirstName:'Anna'});w.renderResultsTable();
 w.document.querySelector('[data-results-sort=firstName]').click();
 assert.equal(w.document.querySelector('.reviewBtn').dataset.id,'s2');
 w.openReview('s2');w.document.querySelector('.manualPoints').value='2';w.confirmDiscardInlineReview=()=>false;
 w.document.querySelector('[data-results-sort=firstName]').click();
 assert.equal(w.document.querySelector('[data-results-sort=firstName]').closest('th').getAttribute('aria-sort'),'ascending');assert.equal(w.document.querySelector('.manualPoints').value,'2');
 assert.equal(JSON.parse(before)[0].totalPoints,w.state.submissions[0].totalPoints);
});
test('Statistik erklärt vorläufige Punkte und getrennte Nenner im normalen Ergebnisweg',t=>{
 const w=setup(t);const s=w.state.submissions[0];Object.assign(s,{totalPoints:3,percent:100,elapsedSeconds:60,grading:{q1:{awardedPoints:3,maxPoints:3,needsReview:false,correct:true}}});w.renderResultsTable();
 assert.match(w.document.querySelector('#resultsAveragesHint').textContent,/1 fertig bewerteten Abgaben/);
 assert.match(w.document.querySelector('.resultTable tfoot').textContent,/1 offen/);
 assert.equal(w.document.querySelector('.resultTable tfoot td').textContent,'3');
 assert.match(w.document.querySelector('#resultsAveragesHint').textContent,/Dauer aus 1 abgegebenen Arbeiten/);
});


function finalRows(w){
 w.state.resultQuestions=[];
 w.state.submissions=[
  {id:'z',studentFirstName:'Zoe',studentLastName:'Adler',studentName:'Zoe Adler',elapsedSeconds:180,totalPoints:3,maxPoints:4,grade:2,submittedAtLocal:'2026-11-18T10:03:00Z'},
  {id:'a',studentFirstName:'Anna',studentLastName:'Zorn',studentName:'Anna Zorn',elapsedSeconds:60,totalPoints:1,maxPoints:4,grade:5,submittedAtLocal:'2026-11-18T10:01:00Z'},
  {id:'b',studentFirstName:'Ben',studentLastName:'Müller',studentName:'Ben Müller',elapsedSeconds:null,totalPoints:2,maxPoints:4,grade:4,submittedAtLocal:'2026-11-18T10:02:00Z'}
 ].map(s=>({...s,status:'graded',grading:{q1:{awardedPoints:s.totalPoints,maxPoints:4,needsReview:false,reviewState:'confirmed'}}}));
 w.renderResultsTable();
}
const resultOrder=w=>Array.from(w.document.querySelectorAll('.resultTable tbody .reviewBtn'),b=>b.dataset.id);
test('Übersicht bleibt Tabelle ohne Sortiermenüs und jeder Spaltenkopf schaltet beide Richtungen',t=>{
 const w=setup(t);finalRows(w);
 assert.equal(w.document.querySelectorAll('#resultsSort,#resultsSortDirection,.resultsToolbar').length,0);
 for(const [key,asc,desc]of [
  ['firstName',['a','b','z'],['z','b','a']],
  ['duration',['a','z','b'],['z','a','b']],['points',['a','b','z'],['z','b','a']],
  ['percent',['a','b','z'],['z','b','a']],['grade',['z','b','a'],['a','b','z']]
 ]){
  w.document.querySelector('[data-results-sort="'+key+'"]').click();
  assert.deepEqual(resultOrder(w),asc,key+' first click ascending');
  assert.equal(w.document.querySelector('[data-results-sort="'+key+'"]').closest('th').getAttribute('aria-sort'),'ascending');
  w.document.querySelector('[data-results-sort="'+key+'"]').click();
  assert.deepEqual(resultOrder(w),desc,key+' second click descending');
  assert.equal(w.document.querySelector('[data-results-sort="'+key+'"]').closest('th').getAttribute('aria-sort'),'descending');
 }
 assert.equal(w.document.querySelectorAll('.resultTable tbody tr').length,3);
 assert.equal(w.document.querySelector('.resultTable thead button').textContent.replace(/[↑↓↕]/g,'').trim(),'Name');
 assert.equal(w.document.querySelector('.reviewBtn[data-id=z]').closest('tr').cells[0].textContent,'Zoe Adler');
 assert.equal(w.document.querySelector('.resultTable thead tr').cells.length,8);
 assert.ok(!w.document.querySelector('.resultTable').textContent.includes('Kürzel'));
 assert.equal(w.document.querySelectorAll('.resultsAverages').length,0);
 assert.ok(w.document.querySelector('.resultTable tfoot'),'Durchschnitt bleibt eine kompakte Tabellenzeile');
});
test('Klicksortierung erhält Abgaben und verwirft ungespeicherte Punkte nur nach Bestätigung',t=>{
 const w=setup(t);const before=JSON.stringify(w.state.submissions);w.openReview('s1');
 w.document.querySelector('.manualPoints').value='2.5';w.confirm=()=>false;
 w.document.querySelector('[data-results-sort="firstName"]').click();
 assert.equal(w.document.querySelector('.manualPoints').value,'2.5');
 assert.equal(w.document.querySelector('.submissionReviewRow').previousElementSibling.querySelector('.reviewBtn').dataset.id,'s1');
 assert.equal(w.document.querySelector('[data-results-sort="firstName"]').closest('th').getAttribute('aria-sort'),'none');
 w.confirm=()=>true;w.document.querySelector('[data-results-sort="firstName"]').click();
 assert.equal(w.document.querySelectorAll('.submissionReviewRow').length,0);
 assert.equal(JSON.stringify(w.state.submissions),before);
 assert.equal(w.document.activeElement.dataset.resultsSort,'firstName');
});
