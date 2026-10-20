import {createRequire} from 'node:module';import {randomBytes,randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);const core=require('../../assessment-functions/lib/assessment-core.js');const decoder=require('../../assessment-functions/lib/teacher-answer-decoder.js');
const clone=v=>structuredClone(v);
export function createExtendedService({state={draft:null,published:null,attempts:{}},persist=async()=>{}}={}){
 const metadata=()=>({id:'EXTENDED',title:state.published.quiz.title,subject:state.published.quiz.subject,grade:state.published.quiz.grade,description:'Lokaler Prototyp · vorbereitete Beispiele · keine echte Anmeldung oder Cloudabgabe',questionCount:state.published.questions.length,totalPoints:state.published.questions.reduce((n,q)=>n+q.points,0),timeLimitMinutes:0,startMode:'student',resultMode:'points_grade',showSolutions:false,sessionRunId:state.published.revision,published:true,ended:false});
 const access=data=>{const a=state.attempts[data.attemptId];if(!a||!core.secureTokenMatches(data.attemptToken,a.tokenHash))throw Error('Lokaler Bearbeitungsversuch nicht berechtigt.');return a;};
 async function execute(action,data={}){
  if(action==='preview-grade'){
   const {visualKey}=require('../../assessment-functions/lib/visual-questions.js');
   return {grading:Object.fromEntries((data.questions||[]).map(q=>{const key={id:q.id,type:q.type,points:q.points,...visualKey(q)};const r=core.gradeQuestion(key,data.answers?.[q.id]);return [q.id,{awarded:r.awardedPoints,max:r.maxPoints,needsReview:r.needsReview,correct:r.correct}];}))};
  }
  if(action==='emmi'){
   if(!data.test||!Array.isArray(data.test.questions))throw Error('Test fehlt.');
   if(!/einfach|kürzer|klarer/i.test(data.instruction||''))throw Error('Die lokale Emmi-Simulation unterstützt nur „Einfacher formulieren“ und „Kürzer und klarer“. Kein KI-Aufruf.');
   const next=clone(data.test);const changed=[];
   next.questions.forEach((q,i)=>{if(q.type==='hotspot'){q.text=q.visual?.template==='room'?'Wähle das Fenster.':'Welcher Bereich nimmt Wasser aus dem Boden auf?';changed.push(i);}else if(q.type==='image-labeling'){q.text='Ordne jedem nummerierten Bereich den passenden Begriff zu.';changed.push(i);}});
   return {test:next,changedIndices:changed,unchangedIndices:next.questions.map((_,i)=>i).filter(i=>!changed.includes(i)),lockedCount:0,invalidCount:0,meta:{model:'prepared-local-simulation',revisionVersion:'extended-prototype-v1'},simulated:true};
  }
  if(action==='teacher')return {test:state.draft};
  if(action==='generate'){
   if((data.count!=null&&data.count!==5)||(data.points!=null&&data.points!==10))throw Error('Lokale vorbereitete Beispiele haben genau 5 Aufgaben und 10 Punkte. Bitte diese Werte einstellen.');
   const topic=String(data.topic||'Pflanze');const room=/raum|zimmer|classroom|room|möbel/i.test(topic);const history=/zeitachse|geschichte|kalter krieg/i.test(topic);
   if(!room&&!history&&!/pflanz|blüte|biolog/i.test(topic))throw Error('Für dieses Thema fehlt im lokalen Prototyp eine geprüfte Vorlage. Beispiele: Blütenpflanze, classroom/room, historische Zeitachse. Keine freie KI-Erstellung aktiv.');
   const template=room?'room':'plant';const labels=(room?['Tisch','Ball','Fenster','Tür']:['Blatt','Wurzel','Blüte','Sprossachse']).map((text,i)=>({id:['b','d','a','c'][i],text}));
   const assignments=room?{r1:'a',r2:'c',r3:'b',r4:'d'}:{r1:'a',r2:'c',r3:'b',r4:'d'};
   let questions=[
    {id:'example1',type:'hotspot',text:room?'Wähle in der Raumszene das Fenster aus.':'Wähle den Bereich aus, der Wasser und Mineralsalze aus dem Boden aufnimmt.',points:2,visual:{version:1,template},visualSolution:{selected:[room?'r1':'r4']}},
    {id:'example2',type:'image-labeling',text:room?'Ordne die deutschen Begriffe den Gegenständen der Raumszene zu.':'Beschrifte die vier nummerierten Teile der Blütenpflanze.',points:4,visual:{version:1,template,labels},visualSolution:{assignments}},
    {id:'example3',type:'numberline',text:history?'Markiere das Jahr der deutschen Wiedervereinigung auf der Zeitachse.':'Markiere drei Viertel auf dem Zahlenstrahl.',points:2,visual:{version:1,min:history?1980:0,max:history?2000:1,step:history?1:0.05},visualSolution:{value:history?1990:0.75,tolerance:0.001}},
    {id:'example4',type:'truefalse',text:room?'A window bedeutet auf Deutsch ein Fenster.':'Blütenpflanzen können über ihre Blätter Fotosynthese betreiben.',points:1,correctBoolean:true},
    {id:'example5',type:'single',text:room?'Welches Wort bezeichnet einen Ball?':'Welche Aufgabe haben Wurzeln außerdem?',points:1,options:room?[{text:'ball',correct:true},{text:'door',correct:false},{text:'table',correct:false}]:[{text:'Die Pflanze im Boden verankern',correct:true},{text:'Bestäuber anlocken',correct:false},{text:'Samen verbreiten',correct:false}]}
   ];
   if(history)questions=[
    ...[{year:1949,text:'Markiere das Gründungsjahr der Bundesrepublik Deutschland.',points:2},{year:1961,text:'Markiere das Jahr des Baus der Berliner Mauer.',points:2},{year:1990,text:'Markiere das Jahr der deutschen Wiedervereinigung.',points:4}].map((event,i)=>({id:'example'+(i+1),type:'numberline',text:event.text,points:event.points,visual:{version:1,min:1940,max:2000,step:1},visualSolution:{value:event.year,tolerance:0}})),
    {id:'example4',type:'truefalse',text:'Die Berliner Mauer wurde nach der deutschen Wiedervereinigung gebaut.',points:1,correctBoolean:false},
    {id:'example5',type:'single',text:'Welches Ereignis gehört zum Jahr 1989?',points:1,options:[{text:'Öffnung der Berliner Mauer',correct:true},{text:'Gründung der Bundesrepublik Deutschland',correct:false},{text:'Bau der Berliner Mauer',correct:false}]}
   ];
   const allowed=Array.isArray(data.allowedTypes)?data.allowedTypes:[];
   if(allowed.length&&questions.some(q=>!allowed.includes(q.type)))throw Error('Dieses vorbereitete Beispiel benötigt Bildbereiche, Grafikbeschriftung, Skala, Richtig/Falsch und Single Choice. Wähle diese Formate aus.');
   state.draft={title:history?'Deutsche Teilung und Einheit – lokale Zeitachsen':room?'Raumszene und Skala – lokales Beispiel':'Blütenpflanze und Skala – lokales Beispiel',subject:String(data.subject||'NT / Biologie'),grade:String(data.grade||'6'),description:'Vorbereitete lokale Beispielerstellung (5 Aufgaben / 10 Punkte). Keine KI-Generierung.',questions};await persist(state);return {test:clone(state.draft),simulated:true};
  }
  if(action==='save'||action==='publish'){
   if(!data.quiz||!Array.isArray(data.questions)||data.questions.length>20)throw Error('Ungültiger Beispieltest.');
   const questions=clone(data.questions);const secret=randomBytes(32).toString('base64url');const contract=core.buildAssessmentContract(questions,secret);core.assertNoSolutionLeak(contract.paper);
   state.draft={...clone(data.quiz),questions};
   if(action==='publish')state.published={quiz:clone(data.quiz),questions,secret,contract,revision:randomUUID()};
   await persist(state);return {saved:true};
  }
  if(action==='review'){
   const a=state.attempts[data.submissionId];if(!a?.receipt||a.revision!==state.published?.revision)throw Error('Keine aktuelle lokale Abgabe.');
   const keys=a.contract.gradingKey;const points=data.points;
   if(!points||Object.keys(points).length!==keys.length||keys.some(k=>!Number.isFinite(points[k.id])||points[k.id]<0||points[k.id]>k.points||points[k.id]*2!==Math.round(points[k.id]*2)))throw Error('Ungültige Korrekturpunkte.');
   a.reviewHistory=[...(a.reviewHistory||[]),{at:new Date().toISOString(),actor:'local-example-teacher',previousPoints:a.receipt.totalPoints}];
   for(const k of keys)a.result.grading[k.id]={...a.result.grading[k.id],awardedPoints:points[k.id],needsReview:false};
   a.result.totalPoints=Object.values(points).reduce((n,v)=>n+v,0);a.result.percent=Math.round(a.result.totalPoints/a.result.maxPoints*100);a.result.needsReview=false;
   a.receipt={...a.receipt,...a.result,grade:core.gradeFromPercent(a.result.percent,a.quiz.gradeScaleSnapshot?.thresholds),localBreakdown:Object.values(a.result.grading).map((g,i)=>({number:i+1,points:g.awardedPoints,max:g.maxPoints}))};await persist(state);return {saved:true};
  }
  if(action==='results'){
   const submissions=Object.values(state.attempts).filter(a=>a.receipt&&a.revision===state.published?.revision).map(a=>({id:a.id,studentName:a.studentName,answers:decoder.decodeSubmissionAnswersFromShape(decoder.buildTeacherDecoderShape(a.questions),a.answers,a.secret),...a.receipt,...a.result,status:'graded',submittedAtLocal:a.submittedAt}));return {submissions,questions:state.published?.questions||[],quiz:state.published?.quiz||null};
  }
  if(!state.published)throw Error('Zuerst den lokalen Beispieltest im Editor veröffentlichen.');
  if(action==='getAssessmentInfo')return {quiz:metadata()};
  if(action==='startAssessmentAttempt'){
   if(typeof data.studentName!=='string'||!data.studentName.trim()||data.studentName.length>120||!core.validAttemptToken(data.attemptToken))throw Error('Ungültiger Beispielstart.');
   let a=Object.values(state.attempts).find(a=>a.clientAttemptId===data.clientAttemptId&&a.revision===state.published.revision);
   if(a){if(!core.secureTokenMatches(data.attemptToken,a.tokenHash))throw Error('Starttoken stimmt nicht.');}
   else {const p=state.published;a={id:randomUUID(),clientAttemptId:data.clientAttemptId,tokenHash:core.tokenHash(data.attemptToken),revision:p.revision,studentName:data.studentName,contract:p.contract,secret:p.secret,questions:p.questions,quiz:metadata()};state.attempts[a.id]=a;await persist(state);}
   return {attemptId:a.id,studentName:a.studentName,status:a.receipt?'submitted':'running',sessionRunId:a.revision,quiz:a.quiz,...(a.receipt?{receipt:a.receipt}:{paper:a.contract.paper})};
  }
  const a=access(data);
  if(action==='submitAssessmentAttempt'){
   if(!a.receipt){a.answers=core.sanitizeAnswersForStorage(a.contract.gradingKey,data.answers);a.result=core.gradeSubmission(a.contract.gradingKey,a.answers);a.receipt={...a.result,grade:core.gradeFromPercent(a.result.percent,a.quiz.gradeScaleSnapshot?.thresholds),attemptId:a.id,resultMode:'points_grade',localPrototype:true,localBreakdown:Object.values(a.result.grading).map((g,i)=>({number:i+1,points:g.awardedPoints,max:g.maxPoints}))};a.submittedAt=new Date().toISOString();await persist(state);}
   return {receipt:a.receipt};
  }
  if(action==='resumeAssessmentAttempt'||action==='getAssessmentReceipt')return {attemptId:a.id,studentName:a.studentName,status:a.receipt?'submitted':'running',sessionRunId:a.revision,quiz:a.quiz,...(a.receipt?{receipt:a.receipt}:data.stateOnly?{}:{paper:a.contract.paper})};
  throw Error('Dieser lokale Beispielaufruf ist nicht implementiert.');
 }
 return {execute,state};
}
