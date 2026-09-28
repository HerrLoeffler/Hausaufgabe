// The coach only points at the real app. The app owns persistence, rendering and grading.
export const TOUR_VERSION = "gradecrew-live-tour-v3";
export const CREW = Object.freeze({
 guide: {name:"Coco", animal:"Pinguin",role:"Dein Guide",asset:"penguin-guide"},
 create: {name:"Remy",animal:"Elefant",role:"Erstellen",asset:"elephant-create"},
 improve: {name:"Emmi",animal:"Fuchs",role:"Überarbeiten",asset:"fox-improve"},
 grade: {name:"Wilma",animal:"Eule",role:"Bewerten",asset:"owl-grade"}
});
const single = (text, choices, answer, image) => ({type:"single",text,points:1,options:choices.map((text,i)=>({text,correct:i===answer})),...(image?{imageUrl:`/assets/gradecrew/demo-${image}.svg`,imageAlt:({backpack:"Ein blauer Schulrucksack.",pencil:"Ein roter Bleistift aus Holz.",books:"Drei Bücher nebeneinander."})[image]}:{})});
export const DEMO_TEST = Object.freeze({title:"Übung · Meine erste GradeCrew-Reise",subject:"Englisch",grade:"5",timeLimitMinutes:1,
 description:"Dein Probetest: 10 kurze Aufgaben, 1 Minute. Es geht ums Ausprobieren – nicht um eine echte Schulnote.",
 questions:[
 single("What colour is the schoolbag?",["red","blue","green"],1,"backpack"),
 single("What can you see?",["a ruler","a pencil","a chair"],1,"pencil"),
 single("How many books can you see?",["two","four","three"],2,"books"),
 single("Was heißt „Hund“ auf Englisch?",["cat","dog","bird"],1),
 {type:"truefalse",text:"„Apple“ heißt „Apfel“.",points:1,correctBoolean:true},
 {type:"dropdown",text:"Choose the English word for „Hallo“.",points:1,options:[{text:"Goodbye",correct:false},{text:"Hello",correct:true},{text:"Thanks",correct:false}]},
 {type:"gapfill",text:"Setze die englische Zahl ein: one, two, [three].",points:1},
 {type:"ordering",text:"Ordne die Zahlen von klein nach groß.",points:1,items:["one","two","three"],manualReview:false},
 single("Which animal says „meow“?",["dog","cat","duck"],1),
 {type:"text",text:"Nenne eine Farbe auf Englisch.",points:1,acceptedAnswers:["red","blue","green","yellow","orange","purple","pink","black","white","brown","grey","gray"],manualReview:true}
 ]});
export function preparedResponse(q, {variant = false, mediaKind = "none"} = {}) {
 const question = variant ? single("Was heißt „Katze“ auf Englisch?",["dog","bird","cat"],2) : single("Wähle das englische Wort für „Hund“.",["cat","dog","bird"],1);
 if (variant && mediaKind !== "none") throw new Error("Für diese vorbereitete Übungsvariante bitte „Ohne Bild“ wählen.");
 return {question:{...question,mediaIntent:{kind:"none"}},meta:{model:"prepared-tutorial",promptVersion:TOUR_VERSION}};
}
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function installCrewTour(api) {
 let active=false, stage="", owner="", quizId="", sourceId="", submissionId="", root, welcome, target, timer=0, frame=0, run=0, busy=false;
 const offered=new Set();
 const $=s=>document.querySelector(s);
 const doneKey=()=>`${TOUR_VERSION}:${owner}`;
 const owned=()=>active && owner===api.uid();
 const image=(role,happy=false)=>`<img src="/assets/gradecrew/${CREW[role].asset}${happy?'-welcome':''}.svg" alt="" width="110" height="110">`;
 function clear(){clearTimeout(timer);timer=0;cancelAnimationFrame(frame);frame=0;target?.classList.remove('gcTourTarget');target=null;}
 function hide(){clear();root?.remove();root=null;document.body.classList.remove('gcCoachVisible');}
 function stop({done=false}={}) {
  ++run;active=false;busy=false;hide();welcome?.close();welcome?.remove();welcome=null;
  document.body.classList.remove('gcRealTourActive');
  if(done)try{localStorage.setItem(doneKey(),'done');}catch{}
 }
 function place(){ frame=0; }
 function schedulePlace(){if(!frame)frame=requestAnimationFrame(place);}
 function coach(role,title,text,selector,nextLabel,next){
  hide();if(!owned())return;
  root=document.createElement('aside');root.className='gcRealCoach';root.setAttribute('aria-label',`${CREW[role].name} begleitet dich`);root.setAttribute('aria-live','polite');
  root.innerHTML=`<button class="gcCoachClose" type="button" aria-label="Tour beenden">×</button><div class="gcCoachIdentity">${image(role)}<div><span>${CREW[role].name} · ${CREW[role].role}</span><h2>${title}</h2></div></div><p>${text}</p>${nextLabel?`<button type="button" class="button primary gcCoachNext">${nextLabel}</button>`:''}<small>Übung in deiner echten GradeCrew-Oberfläche</small>`;
  root.querySelector('.gcCoachClose').onclick=()=>stop();
  if(next)root.querySelector('.gcCoachNext').onclick=()=>{if(!busy)next();};
  document.body.classList.add('gcCoachVisible');document.body.append(root);
  target=typeof selector==='string'?$(selector):selector;
  if(target){
   const node=target;node.classList.add('gcTourTarget');
   queueMicrotask(()=>{
    if(!node.isConnected || target!==node || !owned())return;
    // Reveal native action menus after the current click has finished bubbling.
    for(let parent=node.parentElement;parent;parent=parent.parentElement) if(parent.tagName==='DETAILS')parent.open=true;
    node.scrollIntoView({block:'start',behavior:'auto'});
   });
  }
  schedulePlace();
 }
 function error(message,retry){coach('guide','Hier hat es noch nicht geklappt.',escape(message),null,'Erneut versuchen',retry);}
 function start(){
  if(active || !api.uid() || !api.isDashboard() || $('dialog[open]'))return;
  api.beginRun();owner=api.uid();quizId='';sourceId='';submissionId='';active=true;stage='welcome';run++;
  document.body.classList.add('gcRealTourActive');
  welcome=document.createElement('dialog');welcome.className='gcCrewWelcome';welcome.setAttribute('aria-labelledby','gcWelcomeTitle');
  welcome.innerHTML=`<button class="gcCoachClose" type="button" aria-label="Tour schließen">×</button><span class="eyebrow">Schön, dass du da bist</span><h1 id="gcWelcomeTitle">Deine Crew freut sich auf dich.</h1><div class="gcWelcomeLineup">${Object.entries(CREW).map(([role,m])=>`<div>${image(role,true)}<strong>${m.name}</strong><small>${m.animal}</small></div>`).join('')}</div><p>Einmal gemeinsam erstellen, überarbeiten, ausfüllen und bewerten.</p><button type="button" class="button primary gcWelcomeStart">Crew kennenlernen</button>`;
  document.body.append(welcome);welcome.showModal();
  welcome.querySelector('.gcCoachClose').onclick=()=>stop();welcome.addEventListener('cancel',e=>{e.preventDefault();stop();});
  welcome.querySelector('.gcWelcomeStart').onclick=()=>{welcome.close();welcome.remove();welcome=null;stage='guide';coach('guide','Hallo, ich bin Coco!','Ich bin dein Pinguin-Guide. Wir klicken gemeinsam durch GradeCrew. Unser Übungstest und deine Abgabe bleiben danach in „Meine Tests“.',null,'Los geht’s',()=>{stage='new';coach('guide','Wir starten deinen ersten Test.','Klicke auf „Neuer Test“. Ich bleibe an deiner Seite.','#newQuizBtn');});};
 }
 function form(){
  stage='form';api.prefill();
  coach('create','Hallo, ich bin Remy!','Ich bin der Elefant fürs Erstellen. Englisch, Klasse 5, zehn Aufgaben und drei Bilder sind schon eingetragen. Schau dir das Formular an. Über „Test erstellen“ übernimmst du unseren vorbereiteten Übungstest.','#aiView .aiGrid > .card','Zum Erstellen-Button',()=>coach('create','Bereit für unseren Entwurf?','Klicke jetzt den echten Erstellen-Button. In dieser Tour nutze ich vorbereitete Aufgaben.','#generateAiTestBtn'));
 }
 function draft(){
  stage='draft';sourceId=api.questionId(3);
  coach('improve','Hallo, ich bin Emmi!','Ich bin der Fuchs fürs Überarbeiten. Ich helfe dir beim Aufgabencheck, beim Verbessern und bei Varianten. Schau dir die drei Bildaufgaben an. Danach verbessern wir Aufgabe 4.','#questionList .questionCard','Aufgabe 4 verbessern',()=>{
   stage='edit';api.focusQuestion(sourceId);coach('improve','Ein Auftrag an mich.','Öffne „KI bearbeiten“ bei dieser Aufgabe. In der Tour zeige ich dir eine vorbereitete, klarere Formulierung.',`#questionList .questionCard[data-id="${CSS.escape(sourceId)}"] .aiEditQuestion`);
  });
 }
 function variant(){stage='variant';api.focusQuestion(sourceId);coach('improve','Jetzt ein anderes Beispiel.','Klicke bei derselben Aufgabe auf „Variante hinzufügen“. Wähle eine Variante ohne Bild und starte sie. Die vorhandenen drei Bildaufgaben bleiben erhalten.',`#questionList .questionCard[data-id="${CSS.escape(sourceId)}"] .aiVariantQuestion`);}
 function settings(){
  stage='settings';api.showSettings();coach('guide','Eine Minute zum Ausprobieren.','Unser Probetest hat zehn Aufgaben und eine Minute Zeit. Der Countdown startet erst in der Schüleransicht. Die Freigabe und deine Abgabe werden wirklich gespeichert.','#editorView .editorSettingsDisclosure','Test freigeben',()=>{
   const issues=api.checkDemo();if(issues)return error(issues,settings);
   stage='publish';coach('guide','Alles bereit?','Klicke auf „Veröffentlichen“. Danach wechseln wir über den echten Testzugang in deine Schülerrolle.','#publishBtn');
  });
 }
 function notify(event,data={}){
  if(!owned())return;
  if(event==='view') {
   const allowed={new:['dashboardView','createView'],choice:['createView','aiView'],form:['aiView'],creating:['aiView','editorView'],draft:['editorView'],edit:['editorView'],variant:['editorView'],remove:['editorView'],settings:['editorView'],publish:['editorView','publishView'],published:['publishView','studentView'],identity:['studentView'],answering:['studentView'],submitted:['studentView','resultsView'],results:['resultsView'],review:['resultsView'],finish:['resultsView']};
   if(allowed[stage] && !allowed[stage].includes(data.id)){stop();return;}
  }
  if(data.quizId && quizId && data.quizId!==quizId)return;
  if(event==='view' && data.id==='createView' && stage==='new'){stage='choice';coach('create','Remy übernimmt den Entwurf.','Wähle „Mit KI erstellen“.','#createAiBtn');}
  if(event==='view' && data.id==='aiView' && stage==='choice')form();
  if(event==='edit-opened' && stage==='edit'){
   const panel=$('.questionAiPanel');const input=panel?.querySelector('textarea');if(input)input.value='Formuliere den Arbeitsauftrag klarer.';
   coach('improve','So gibst du deinen Wunsch an.','Der Wunsch ist vorbereitet. Klicke auf „Änderung erstellen“ – genau so funktioniert es auch später.',panel?.querySelector('.aiApply'));
  }
  if(event==='edited' && stage==='edit')variant();
  if(event==='variants-ready' && stage==='variant')coach('improve','Die Variante ist fertig.','Übernimm die Variante über die normale Variantenanzeige. Danach entfernen wir die ursprüngliche Aufgabe, damit es bei zehn bleibt.','#variantBackgroundProgress');
  if(event==='variants-applied' && stage==='variant'){
   stage='remove';api.focusQuestion(sourceId);coach('improve','Du entscheidest, welche Aufgabe bleibt.','Die neue Variante ist übernommen. Lösche jetzt die ursprüngliche Hund-Aufgabe mit dem Papierkorb und bestätige. So bleiben genau zehn Aufgaben.',`#questionList .questionCard[data-id="${CSS.escape(sourceId)}"] .deleteQuestion`);
  }
  if(event==='question-deleted' && stage==='remove' && data.questionId===sourceId)settings();
  if(event==='published' && stage==='publish'){
   stage='published';coach('guide','Das ist der echte Zugang.','Hier stehen Testcode, Link und QR-Code. Klicke auf „Test selbst ausfüllen“. Du bleibst im selben Tab und siehst dieselbe Oberfläche wie deine Klasse.','#openPublishedStudentBtn');
  }
  if(event==='student-ready' && stage==='published'){
   stage='identity';coach('guide','Wie dürfen wir dich nennen?','Gib einen Namen oder ein Kürzel ein. Schüler können aus Datenschutzgründen ein von dir vergebenes Kürzel verwenden. Danach klickst du auf „Test starten“ – deine Minute beginnt.','.studentIdentityCard','Zum Start',()=>coach('guide','Eine Minute – viel Spaß!','Klicke auf „Test starten“. Bei 00:00 werden auch unvollständige Antworten automatisch abgegeben.','#studentStartBtn'));
  }
  if(event==='student-started' && stage==='identity'){stage='answering';hide();}
  if(event==='submitted' && ['answering','identity'].includes(stage)){
   submissionId=data.submissionId;stage='submitted';coach('guide','Deine Abgabe ist gespeichert.','Das sind deine echten Übungsergebnisse. Öffne jetzt die Lehrkraft-Auswertung; dort wartet Wilma auf dich.','#studentTeacherResultsBtn');
  }
  if(event==='results-ready' && ['submitted','review-saving'].includes(stage)){
   if(stage==='review-saving')return;
   stage='results';coach('grade','Hallo, ich bin Wilma!','Ich bin die Eule fürs Bewerten. Hier steht deine echte Abgabe. Öffne „Bewerten“ in deiner Zeile – wir schauen uns Antworten, Bilder und Punkte gemeinsam an.',`#resultsTableWrap .reviewBtn[data-id="${CSS.escape(submissionId)}"]`);
  }
  if(event==='review-opened' && stage==='results' && data.submissionId===submissionId){
   stage='review';coach('grade','Dein Urteil zählt.','Du siehst die Antwort, die Lösung und bei Bildaufgaben auch das Bild. Prüfe besonders die freie Farbangabe am Ende. Ändere bei Bedarf Punkte und klicke auf „Bewertung speichern“.','#reviewPanel','Zur letzten Antwort',()=>{api.focusReviewLast();coach('grade','Freie Antworten brauchen deinen Blick.','Ist die genannte Farbe richtig? Vergib die passenden Punkte. Speichere anschließend deine Bewertung.','#saveReview');});
  }
  if(event==='review-saved' && stage==='review' && data.submissionId===submissionId){
   stage='finish';coach('guide','Geschafft – das war dein erster Durchlauf!','Erstellt, überarbeitet, eine Minute selbst ausgefüllt und wirklich bewertet. Der Übungstest samt Ergebnissen bleibt in deiner Übersicht. Du kannst ihn später wie jeden anderen Test beenden oder löschen.','#resultsTableWrap','Tour abschließen',()=>stop({done:true}));
  }
 }
 async function create(){
  if(!owned()||stage!=='form'||busy)return;
  busy=true;const token=run;stage='creating';
  coach('create','Ich bereite deinen Test vor.','Zehn Aufgaben, drei Bilder. Der Entwurf öffnet sich nach der kurzen Prüfung automatisch.','#aiProgress');
  let delay;
  const wait=new Promise(resolve=>{delay=setTimeout(resolve,3000);});
  try{
   const created=quizId || await api.createDemo(DEMO_TEST);
   if(owned()&&token===run)quizId=created;
   await wait;
   if(!owned()||token!==run)return;
   quizId=created;
   await api.openEditor(created);
   if(!owned()||token!==run)return;
   if(!api.isEditor(created))throw new Error('Der gespeicherte Übungstest konnte nicht geöffnet werden.');
   draft();
  }catch(err){if(owned()&&token===run){stage='form';error(err.message,()=>create());}}
  finally{clearTimeout(delay);if(token===run)busy=false;}
 }
 function dashboard({uid,firstVisit}){
  if(active)return;
  if(owner && owner!==uid)stop();owner=uid;
  let button=$('#gradecrewTourBtn');
  if(!button){button=document.createElement('button');button.id='gradecrewTourBtn';button.type='button';button.className='button ghost';$('.dashboardActions')?.append(button);}
  button.textContent='Mit der Crew starten';button.onclick=start;
  if(firstVisit&&!offered.has(uid)){
   offered.add(uid);let done=false;try{done=localStorage.getItem(doneKey())==='done';}catch{}
   if(!done)start();
  }
 }
 const style=document.createElement('link');style.rel='stylesheet';style.href='./gradecrew-tour.css?v=2.3.1-gc11';document.head.append(style);
 addEventListener('resize',schedulePlace,{passive:true});addEventListener('scroll',schedulePlace,{passive:true,capture:true});
 document.addEventListener('gradecrew:account-changed',()=>stop());
 return {start,dashboard,notify,stop,create,get active(){return owned();},get creating(){return owned()&&['form','creating'].includes(stage);},ownsQuiz:id=>owned()&&quizId===id,preparedResponse};
}
