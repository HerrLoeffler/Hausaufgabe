'use strict';
const {createHash}=require('node:crypto');
function fingerprint(task){return createHash('sha256').update(JSON.stringify([task?.prompt,task?.contextText,task?.answer])).digest('hex').slice(0,24);}
function transition(previous,action,assessment,now=Date.now()){
 const s=globalThis.structuredClone(previous); s.events=s.events||[];s.feedback={outcome:'',short:''};
 if(action==='finish'){s.phase='ended';return s;}
 if(action==='help'||action==='question'){
  s.originalTask=s.originalTask||s.task;s.phase='help';s.supportStage=Math.max(1,s.supportStage||0);s.level=0;return s;
 }
 if(!assessment||assessment.outcome==='unclear'){s.feedback={outcome:'unclear',short:'Das konnte ich noch nicht sicher einordnen. Bitte beschreibe deinen Schritt oder frage nach.'};return s;}
 const correct=assessment.outcome==='correct';
 if(s.phase==='practice'||s.phase==='completion'){
  s.events.push({topicId:s.topic.id,sessionId:s.id,at:now,independent:s.phase==='practice',correct,level:s.level||0,family:s.task.family||'general',fingerprint:fingerprint(s.task)});
 }
 s.feedback={outcome:correct?'correct':'incorrect',short:correct?'Richtig. Jetzt folgt eine neue Probe.':'Wir schauen uns einen kleineren Schritt an.'};
 if(correct){
  if(s.phase==='help'){s.phase='completion';s.task=s.originalTask;s.visual=null;s.feedback.short='Das klappt. Versuch jetzt deine Ausgangsaufgabe.';s.explanation='Versuche jetzt noch einmal deine Ausgangsaufgabe. Du darfst die Hilfe nutzen.';return s;}
  s.previousLevel=s.level||0;s.level=s.phase==='completion'?0:Math.min(3,(s.level||0)+1);
  s.phase='practice';s.supportStage=0;s.originalTask=null;s.explanation='';s.visual=null;return s;
 }
 s.originalTask=s.originalTask||s.task;
 s.supportStage=Math.min(3,(s.supportStage||0)+1);s.level=0;
 s.phase=previous.supportStage>=3?'teacher':'help';
 return s;
}
function projectSkill(events,now=Date.now()){
 const seen=new Set();
 const independent=events.filter(e=>e.independent&&!seen.has(e.fingerprint)&&seen.add(e.fingerprint)).slice(-10);
 const correct=independent.filter(e=>e.correct).length;
 const varied=new Set(independent.map(e=>e.family)).size>=2;
 const sessions=new Set(independent.map(e=>e.sessionId)).size>=2;
 const last=events.at(-1);
 const challenging=independent.filter(e=>e.correct&&Number(e.level)>=2).length>=2;
 const secure=independent.length>=10&&correct>=8&&varied&&sessions&&challenging&&events.filter(e=>e.independent).at(-1)?.correct===true;
 const supported=events.filter(e=>!e.independent&&e.correct).length;
 const lastPracticed=last?.at||null;
 return {status:secure?'secure':events.length?'practicing':'unseen',independent:independent.length,correct,supported,lastPracticed,nextReviewAt:secure?lastPracticed+86400000:null,reviewDue:secure&&now>=lastPracticed+86400000,retention:'open'};
}
function safeTask(task){return task?{id:task.id,prompt:task.prompt,contextText:task.contextText||'',input:task.input||'text',options:task.options||[]}:null;}
function publicSession(s,now=Date.now()){
 return {id:s.id,revision:s.revision,topic:s.topic,phase:s.phase,task:safeTask(s.task),originalTask:safeTask(s.originalTask),explanation:s.explanation||'',visual:s.visual||null,feedback:s.feedback||{outcome:'',short:''},remainingSeconds:Math.max(0,Math.ceil((s.deadline-now)/1000)),summary:s.summary||null};
}
module.exports={transition,projectSkill,publicSession,fingerprint};
