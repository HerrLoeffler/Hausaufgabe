import {createRequire} from 'node:module';
import {createHash,randomBytes} from 'node:crypto';
const require=createRequire(import.meta.url);
const core=require('../../assessment-functions/lib/assessment-core.js');
const visual=require('../../visual/core.js');
const ACTIVE=new Set(['dispatching','queued','running','uncertain']);
const text=(v,n)=>String(v??'').trim().slice(0,n);
const fingerprint=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const guidance='Nur neue visuelle Aufgaben mit type visual und gültigem visualTask. Wähle zum Fach und Lernziel passende verschiedene Formate. Alle nötigen Daten und eigene kurze Texte vollständig mitliefern. Keine realen Schülerdaten oder fremden Medien. Keine Lösung oder Fehlerstelle im Arbeitsauftrag verraten. Bei Verbindungen sinnvolle Namen wie Behauptung 1 und Begründung 1 statt Element. Für Winkel eine Toleranz von 3 Grad. Diagramme vollständig beschriften; keine vorausgefüllten Antworten. spec, solution und Aufgabenauftrag müssen fachlich übereinstimmen.';
function checkQuestions(questions,{count,points}={}){
 if(!Array.isArray(questions)||!questions.length||questions.length>12||count&&questions.length!==count)throw Error('Die KI-Aufgabenanzahl passt nicht zum Auftrag.');
 const qs=structuredClone(questions).map((q,i)=>({...q,id:q.id||'ai-question-'+(i+1),position:i+1}));
 for(const q of qs){if(q.type!=='visual')throw Error('Die KI hat einen anderen Aufgabentyp geliefert.');const t=JSON.parse(q.visualTask);if(visual.validate(t).length||t.maxPoints!==q.points)throw Error('Eine visuelle KI-Aufgabe ist ungültig.');}
 if(points&&Math.abs(qs.reduce((s,q)=>s+q.points,0)-points)>.001)throw Error('Die KI-Punktzahl passt nicht zum Auftrag.');
 const contract=core.buildAssessmentContract(qs,randomBytes(32).toString('base64url'));core.assertNoSolutionLeak(contract.paper);
 return qs;
}
function clean(kind,p={}){
 if(kind==='generate'){
  const count=Number(p.count),points=Number(p.points);
  if(!Number.isInteger(count)||count<1||count>12)throw Error('Bitte 1 bis 12 Aufgaben wählen.');
  if(!Number.isFinite(points)||points<count*.5||points>60||points*2!==Math.round(points*2))throw Error('Bitte passende Punkte in halben Schritten bis 60 wählen.');
  if(!text(p.topic,500)||!text(p.subject,120)||!text(p.grade,30))throw Error('Fach, Klasse und Thema fehlen.');
  if(p.materials?.length||p.imageQuestionCount>0||p.audioQuestionCount>0||p.solutionAudioQuestionCount>0||p.audioAnswerQuestionCount>0)throw Error('Dieser Formatversuch nutzt visuelle Aufgaben ohne zusätzliche Medienaufträge oder Uploads.');
  return {subject:text(p.subject,120),grade:text(p.grade,30),topic:text(p.topic,500),schoolType:text(p.schoolType,80)||'Mittelschule',region:text(p.region,80)||'Bayern',difficulty:text(p.difficulty,80)||'mittel',count,points,allowedTypes:['visual'],imageMode:'none',audioMode:'none',notes:text(p.notes,2400)+'\n'+guidance};
 }
 if(kind==='revise'){
  const questions=checkQuestions(p.test?.questions);
  if(text(p.instruction,2400).length<3)throw Error('Bitte einen Überarbeitungswunsch eingeben.');
  return {instruction:text(p.instruction,2400),test:{title:text(p.test.title,180),subject:text(p.test.subject,120),grade:text(p.test.grade,30),description:text(p.test.description,700),questions}};
 }
 if(kind==='question'){
  const [question]=checkQuestions([p.question]);
  if(p.targetType&&p.targetType!=='visual')throw Error('Hier werden ausschließlich die neuen visuellen Formate erprobt.');
  return {question,instruction:text(p.instruction,2000)||'Erstelle eine fachlich passende neue Variante.',variant:Boolean(p.variant),requireDifferent:Boolean(p.requireDifferent),allowedTypes:['visual'],targetType:'visual',allowImages:false,allowImageChoices:false,testContext:{subject:text(p.testContext?.subject,120),grade:text(p.testContext?.grade,30),title:text(p.testContext?.title,180)},materials:[]};
 }
 throw Error('Unbekannter KI-Auftrag.');
}
export function createAiBridge({state,persist,call,read,uid}){
 state.aiJobs??={};
 // A restarted server must never resubmit an interrupted paid direct call.
 for(const j of Object.values(state.aiJobs))if(j.status==='running'&&j.kind!=='generate'||j.status==='dispatching'){j.status='uncertain';j.message='Der letzte KI-Aufruf wurde unterbrochen. Kein automatischer Neustart; Auftrag bleibt zur Prüfung erhalten.';}
 const view=j=>({requestId:j.requestId,kind:j.kind,status:j.status,stage:j.stage||'',message:j.message||'',remoteJobId:j.remoteJobId||null,...(j.status==='ready'?{result:j.result}:{})});
 async function finishDirect(j){
  try{
   const result=await call(j.kind==='revise'?'visual255ReviseWholeTest':'visual255RegenerateQuestion',j.input);
   if(j.kind==='revise'){
    result.test.questions=checkQuestions(result.test?.questions,{count:j.input.test.questions.length,points:j.input.test.questions.reduce((s,q)=>s+q.points,0)});
    if(result.test.questions.some((q,i)=>q.points!==j.input.test.questions[i].points))throw Error('Emmi hat die Punkteverteilung verändert.');
   }else result.question=checkQuestions([result.question],{points:j.input.question.points})[0];
   j.result={...result,simulated:false};j.status='ready';j.completedAt=new Date().toISOString();
  }catch(e){j.status=/HTTP (400|401|403|429)/.test(e.message)?'failed':'uncertain';j.message=text(e.message,350);}
  await persist(state);
 }
 async function start({requestId,kind,payload}){
  if(!/^[A-Za-z0-9-]{16,100}$/.test(requestId||''))throw Error('Ungültige KI-Auftragskennung.');
  const hash=fingerprint({kind,payload});
  const existing=state.aiJobs[requestId];if(existing){if(existing.fingerprint!==hash)throw Error('Diese Auftragskennung wird bereits für andere Eingaben verwendet.');return view(existing);}
  const input=clean(kind,payload);
  if(Object.values(state.aiJobs).some(j=>ACTIVE.has(j.status)))throw Error('Ein KI-Auftrag läuft bereits oder muss noch geprüft werden. Bitte zuerst dessen Ergebnis abwarten.');
  const j={requestId,kind,input,fingerprint:hash,status:'dispatching',startedAt:new Date().toISOString()};state.aiJobs[requestId]=j;await persist(state);
  if(kind==='generate'){
   try{const result=await call('visual255StartAiTestJob',{...input,clientRequestId:'LOCAL26-'+requestId});if(!/^[a-f0-9]{40}$/.test(result.jobId||''))throw Error('KI-Start ohne gültige Jobkennung.');j.remoteJobId=result.jobId;j.status='queued';}
   catch(e){j.status=/HTTP (400|401|403|429)/.test(e.message)?'failed':'uncertain';j.message=text(e.message,350);}
   await persist(state);
  }else{j.status='running';await persist(state);void finishDirect(j).catch(()=>{j.status='uncertain';j.message='Speicherung unterbrochen; Auftrag nicht erneut starten.';});}
  return view(j);
 }
 async function status(requestId){
  const j=state.aiJobs[requestId];if(!j)throw Error('KI-Auftrag nicht gefunden.');
  if(j.kind==='generate'&&j.status==='queued'){
   const job=await read('aiJobs/'+j.remoteJobId);if(job.ownerId!==uid)throw Error('KI-Auftrag gehört nicht zum freigegebenen Testkonto.');
   j.stage=text(job.stage,100);
   if(job.status==='ready'){
    try{const quiz=await read('quizzes/'+job.quizId);if(quiz.ownerId!==uid)throw Error('KI-Test gehört nicht zum freigegebenen Testkonto.');const raw=await read('quizzes/'+job.quizId+'/questions?pageSize=100');raw.sort((a,b)=>a.position-b.position);const questions=checkQuestions(raw,j.input);j.result={test:{title:quiz.title,subject:quiz.subject,grade:quiz.grade,description:quiz.description||'',questions},meta:{remoteJobId:j.remoteJobId,remoteQuizId:job.quizId},simulated:false};j.status='ready';state.draft=structuredClone(j.result.test);}
    catch(e){j.status='failed';j.message=text(e.message,350);}
   }else if(['failed','error','cancelled','expired'].includes(job.status)){j.status='failed';j.message=text(typeof job.error==='string'?job.error:job.error?.message,350)||'Die Test-KI konnte den Auftrag nicht abschließen.';}
   await persist(state);
  }
  return view(j);
 }
 function active(){return Object.values(state.aiJobs).filter(j=>ACTIVE.has(j.status)||j.status==='ready').sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).map(view)[0]||null;}
 return {start,status,active};
}
