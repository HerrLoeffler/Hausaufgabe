import {createHash} from 'node:crypto';
import {validateWilmaReceipt} from './receipt.mjs';
import {questionSnapshot,requiresOriginalMedia} from './source.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const norm=value=>String(value??'').normalize('NFKC').trim().toLocaleLowerCase('de-DE').replace(/\s+/g,' ');
export class ReviewError extends Error{constructor(code,message){super(message);this.httpStatus=code;}}
function fail(code,message){throw new ReviewError(code,message);}
function id(value){if(typeof value!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(value))fail(400,'Ungültige Testkennung.');return value;}
export function createReviewService({projectId,loadQuiz,loadQuestion,loadSubmission,reserve,finish,provider,readCache=async()=>null}){
 if(!['gradecrew-staging-2026','hausaufgabe-staging'].includes(projectId))throw new Error('Wilma ist für dieses Cloudprojekt nicht zugelassen.');
 const memory=new Map();
 return async({uid,data})=>{
  if(!uid)fail(401,'Bitte anmelden.');
  if(!data||typeof data!=='object')fail(400,'Ungültige Anfrage.');
  const quizId=id(data.quizId),questionId=id(data.questionId),ids=data.answerIds;
  if(!Array.isArray(ids)||!ids.length||ids.length>10||new Set(ids).size!==ids.length)fail(400,'Bitte 1 bis 10 unterschiedliche Antworten wählen.');
  ids.forEach(id);
  const quiz=await loadQuiz(quizId);
  if(!quiz||quiz.ownerId!==uid)fail(403,'Nur eigene Tests sind zugelassen.');
  if(quiz.isDeleted||quiz.rightsHold)fail(403,'Dieser Test ist nicht verfügbar.');
  const q=await loadQuestion(quizId,questionId);
  if(!q||!['text','gapfill'].includes(q.type)||typeof q.text!=='string'||q.text.length>6000)fail(400,'Diese Aufgabe wird in der Vorschau nicht unterstützt.');
  const snapshot=questionSnapshot(q);
  if(typeof data.expectedQuestion!=='string'||data.expectedQuestion!==snapshot)fail(409,'Die Aufgabenfassung wurde geändert. Bitte Ergebnisse aktualisieren.');
  const maximum=Number(q.points);
  if(!Number.isFinite(maximum)||maximum<=0||maximum>100||maximum*2%1)fail(400,'Punkterahmen nicht unterstützt.');
  if(!data.expectedAnswers||typeof data.expectedAnswers!=='object')fail(400,'Antwortabgleich fehlt.');
  if(data.criteria!==undefined&&(typeof data.criteria!=='string'||data.criteria.length>2000))fail(400,'Bewertungsraster ist zu lang.');
  const rubric=data.criteria?.trim()||q.reviewCriteria||q.acceptedAnswers||[];
  const accepted=[...q.text.matchAll(/\[([^\]]+)\]/g)].map(match=>match[1].split('|'));
  const direct=[],records=[],source=[];
  for(const [index,sid] of ids.entries()){
   const sub=await loadSubmission(quizId,sid);
   if(!sub)fail(409,'Eine Abgabe ist nicht mehr verfügbar.');
   const answer=sub.answers?.[questionId]??'';
   if(JSON.stringify(answer)!==JSON.stringify(data.expectedAnswers[sid]??''))fail(409,'Antwort wurde geändert. Bitte Ergebnisse aktualisieren.');
   if(typeof answer!=='string'&&!(Array.isArray(answer)&&answer.every(value=>typeof value==='string')))fail(400,'Antwortformat nicht unterstützt.');
   if(JSON.stringify(answer).length>4000)fail(400,'Eine Antwort ist zu lang für den Pilot.');
   source.push({id:sid,answer});
   if(sub.grading?.[questionId]?.reviewIssue==='incomplete-transfer'||requiresOriginalMedia(q)){direct.push({id:sid,points:null,status:'ungradable',reason:'Originalmaterial oder Übertragung prüfen.'});continue;}
   if(q.type==='text'&&!norm(answer)){direct.push({id:sid,points:0,status:'clear',reason:'Leer abgegeben.'});continue;}
   if(q.type==='gapfill'&&accepted.length){
    const values=Array.isArray(answer)?answer:[];
    const unknown=accepted.some((options,i)=>norm(values[i])&&!options.map(norm).includes(norm(values[i])));
    if(!unknown){const points=Math.round(accepted.filter((options,i)=>norm(values[i])&&options.map(norm).includes(norm(values[i]))).length/accepted.length*maximum*10)/10;
     if(points*2%1===0){direct.push({id:sid,points,status:'clear',reason:'Bekannte Begriffe; leere Lücken zählen 0 Punkte.'});continue;}}
   }
   records.push({id:'a'+index,sourceId:sid,answer});
  }
  const task={task:q.text,maximum,rubric:q.type==='gapfill'?{criteria:rubric,acceptedGaps:accepted}:rubric,answers:records.map(({id,answer})=>({id,answer}))};
  const fingerprint=digest({version:"wilma-live-20261028-v1",uid,quizId,questionId,snapshot,task,source});
  const revision=digest({question:q,source,rubric});
  if(!records.length)return {answers:direct,revision,questionSnapshot:snapshot,source:'wilma-ai',requestId:null};
  if(memory.has(fingerprint))return {...memory.get(fingerprint),cached:true};
  const cached=await readCache(fingerprint);
  if(cached){
   validateWilmaReceipt(cached,{answerIds:ids,maxPoints:maximum});
   if(cached.questionSnapshot!==snapshot)fail(409,'Gespeicherter Vorschlag gehört zu einer anderen Aufgabenfassung.');
   return {...cached,cached:true};
  }
  await reserve(fingerprint);
  try{
   const result=await provider(task);
   const clean=validateWilmaReceipt({source:'wilma-ai',answers:result.answers},{answerIds:records.map(row=>row.id),maxPoints:maximum});
   const mapping=new Map(records.map(row=>[row.id,row.sourceId]));
   const answers=clean.answers.map(row=>({...row,id:mapping.get(row.id),reason:row.reason.slice(0,180),status:!rubric?.length&&q.type!=='gapfill'&&row.status==='clear'?'uncertain':row.status}));
   const receipt={answers:[...answers,...direct],revision,questionSnapshot:snapshot,source:'wilma-ai',requestId:result.requestId,model:result.model,cached:false};
   await finish(fingerprint,{phase:'completed',requestId:result.requestId||null,receipt});
   memory.set(fingerprint,receipt);
   return receipt;
  }catch(error){await finish(fingerprint,{phase:'unknown'}).catch(()=>{});fail(503,'Wilma konnte nicht sicher prüfen. Kein automatischer Neuversuch; vorhandene Punkte bleiben erhalten.');}
 };
}
