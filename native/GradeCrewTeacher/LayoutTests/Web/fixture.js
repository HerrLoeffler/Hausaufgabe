/* Offline model only. UI is produced by the pinned, unmodified integration renderers. */
'use strict';
const $ = id => document.getElementById(id);
const gcParams = new URLSearchParams(location.search);
const gcScenario = Object.freeze({ screen:gcParams.get('screen')||'workspace', lang:gcParams.get('lang')||'de', role:gcParams.get('role')||'teacher', type:gcParams.get('type')||'single', variant:gcParams.get('variant')||'default' });
window.gcLayoutScenario=gcScenario; window.gcLayoutReady=false; window.gcLayoutErrors=window.gcLayoutErrors||[];
const gcTypes=['single','multi','text','dropdown','truefalse','gapfill','matching','ordering','grouping','markwords','number'];
const state={ user:{uid:'offline-layout-teacher'}, profile:{role:gcScenario.role}, questions:[], currentQuiz:{id:'LAYOUT21',published:gcScenario.variant==='readonly',ended:false,contentLocale:'de-DE'}, newManualQuiz:false, aiJobs:[], quizzes:[], settingsDraft:{defaultGradeScaleId:'standard'}, gradeScalesDraft:[{id:'standard',name:'Standard – ausführlicher Notenschlüssel für Klasse 9',thresholds:[90,75,60,45,20,0]}] };
let gcDirty=0;
const markDirty=()=>{gcDirty++;};
const tourUid=()=>state.user.uid;
const renderQualityIssue=()=>{},activeQualityIssue=()=>null;
const updateSummary=()=>{},syncQualityReport=()=>{},renderImportReviewBanner=()=>{},renderQuestionOutline=()=>{},renderFirstTestGuide=()=>{};
const focusEditorQuestion=()=>{},toggleQuestionAiPanel=()=>{},openQuestionVariantDialog=()=>{},toast=()=>{};
const secureAudioPublicationBlocked=()=>false;
const assessmentContentLabels=()=>({listeningTrueFalseInstruction:'Höre zu.'});
const generateAiAudioForQuestion=()=>{},generateAiAnswerAudioForQuestion=()=>{},generateAiSolutionAudioForQuestion=()=>{};
const correctDisplay=q=>q.acceptedAnswers?.join(', ')||String(q.numericAnswer||'42');
const changeQuestionType=(q,index,type)=>{q.type=type;renderQuestions();};
window.gcFixture={state,types:gcTypes,render:()=>renderQuestions(),dirty:()=>gcDirty};
function gcQuestion(type,index=0){
 const long=gcScenario.variant==='longtext';
 const text=long?'Lies die folgende ausführliche Aufgabenstellung aufmerksam durch. Erkläre anhand der beschriebenen Beobachtung, welche Antwort zutrifft, und prüfe alle Angaben. '.repeat(4):'Welche Aussage passt zur beschriebenen Situation?';
 return {id:'q-'+type+'-'+index,type,text:type==='gapfill'?'Die Stadt ist [Berlin|BERLIN]. '+(long?text:'Hier steht eine weitere ausführliche Aufgabenstellung.'):text,points:2,
 options:[{text:long?'Eine ausführlich beschriebene erste Antwortmöglichkeit mit weiteren Erläuterungen':'Berlin',correct:true},{text:long?'Eine zweite mögliche Antwort mit einer längeren Begründung für die Auswahl':'Hamburg',correct:false},{text:'München',correct:false}],
 acceptedAnswers:['Berlin','BERLIN'],manualReview:true,correctBoolean:true,pairs:[{left:'Berlin',right:'Deutschland'},{left:'Paris',right:'Frankreich'}],items:['Erster Schritt','Zweiter Schritt','Dritter Schritt'],
 groups:[{name:'Säugetiere',items:['Elefant','Fuchs']},{name:'Vögel',items:['Pinguin','Eule']}],passage:'Coco und Remy erstellen gemeinsam einen ausführlichen Test.',targetWords:['Coco','Remy'],numericAnswer:42,tolerance:1,unit:'m',
 ...(gcScenario.variant==='media'?{imageUrl:'assets/gradecrew/fox-improve.svg',imageAlt:'Emmi hilft beim Überarbeiten der Aufgabe',audioDataUrl:'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA==',audioScript:'Eine kurze vorbereitete Aufnahme für die Aufgabe.',solutionAudioScript:'Die richtige Lösung ist Berlin.',solutionAudioDataUrl:'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA=='}:{})};
}
function gcShowView(id){ document.querySelectorAll('main > .view').forEach(view=>view.classList.toggle('hidden',view.id!==id)); }
async function gcSettle(){
 if(document.fonts?.ready) await document.fonts.ready;
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 // Native transforms and locale observers finish before geometry is sampled.
 await new Promise(resolve=>setTimeout(resolve,80));
 await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,2000);} )));
 await new Promise(resolve=>requestAnimationFrame(resolve));
}
async function gcStart(){
 try{
  if(!gcTypes.includes(gcScenario.type)&&gcScenario.type!=='all') throw new Error('Unknown question type '+gcScenario.type);
  const locale=gcScenario.lang==='en'?'en-GB':'de-DE';
  document.documentElement.lang=locale;
  $('userBar').classList.remove('hidden'); $('userLabel').textContent=gcScenario.role==='admin'?'Administrator':'Lehrkraft';
  $('adminTopBtn').classList.toggle('hidden',gcScenario.role!=='admin');
  $('appFooter').classList.remove('hidden');
  gcMountTutorial({uid:state.user.uid,firstVisit:false,completed:true,offerHandled:true,isAdmin:gcScenario.role==='admin'});
  state.quizzes=[{id:'BEISPIEL',title:'Wortarten erkennen und im Zusammenhang anwenden – Wiederholung Klasse 9',subject:'Deutsch',grade:'9',questionCount:11,totalPoints:22,published:false,updatedAt:'2026-10-14T10:00:00Z'},{id:'PRACTICE',title:'Ein veröffentlichter Übungstest',subject:'Mathematik',grade:'8',questionCount:8,totalPoints:16,published:true,timeLimitMinutes:20,updatedAt:'2026-10-13T10:00:00Z'}];
  renderQuizList(); renderGradeScaleSettings();
  $('defaultSubject').value='Deutsch';$('defaultGrade').value='9';$('defaultDescription').value='Lies jede Aufgabe aufmerksam durch und kontrolliere deine Antworten.';
  const types=gcScenario.type==='all'?gcTypes:[gcScenario.type];state.questions=types.map(gcQuestion);
  renderQuestions();
  gcShowView({workspace:'dashboardView',settings:'settingsView',editor:'editorView'}[gcScenario.screen]||'dashboardView');
  window.gcMountCoco();
  $('backFromSettings').onclick=()=>gcShowView('dashboardView');
  // Actual locale translator installs language control and observes renderer changes.
  gcI18nRuntime.installBrowserI18n({locale,defaultLocale:locale});
  window.GradeCrewI18n.setLocale(locale,{persist:false});
  window.GradeCrewNativeWorkspace?.restoredAccount(state.user.uid);
  window.dispatchEvent(new CustomEvent('gradecrew:ui-locale-changed',{detail:{locale}}));
  await gcSettle();
  if(gcScenario.variant==='media'){
   document.querySelectorAll('#editorView details.gcNativeMediaDisclosure, #editorView details.questionAudioEdit, #editorView details.solutionAudioPanel').forEach(d=>{d.open=true;});
   await gcSettle();
  }
  window.gcLayoutReady=true;
 }catch(error){window.gcLayoutErrors.push(String(error.stack||error));window.gcLayoutReady=true;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',gcStart,{once:true});else gcStart();
