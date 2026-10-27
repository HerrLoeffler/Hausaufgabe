'use strict';
const {randomUUID,createHash}=require('node:crypto');
const {observe}=require('./workshop');
const {observeHelp,projectHelpEvidence}=require('./help-evidence');
const {updateExperience,experienceFor}=require('./help-experience');
const {eligibility}=require('./planning');
const {transition,projectSkill,publicSession}=require('./core');
const {projectNetwork,chooseCompetency}=require('./network');
class LearningError extends Error{constructor(code,message){super(message);this.code=code;}}
const fail=(code,message)=>{throw new LearningError(code,message);};
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(value);
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
// Private, bounded evidence. Never included in competency logs or public responses.
function bounded(value,max=12000){
 if(value==null)return null;
 const text=typeof value==='string'?value:JSON.stringify(value);
 if(text.length>max)return {truncated:true,excerpt:text.slice(0,max)};
 return typeof value==='string'?value:JSON.parse(text);
}
function makeAttempt(uid,data,s,assessment,workshop,time){return {
 ownerUid:uid,eventId:data.eventId,sessionId:s.id,topicId:s.topic.id,at:time,expiresAt:time+30*86400000,expireAt:new Date(time+30*86400000),
 action:data.action,phase:s.phase,supportStage:s.supportStage||0,task:bounded(s.task),taskVersion:s.task?.version||s.task?.workshop?.version||1,
 answer:bounded(data.answer||'',4000),question:bounded(data.question||'',2000),workshop:bounded(workshop),assessment:bounded(assessment,4000),
 difficulty:bounded(s.task?.difficulty||s.task?.demand||{level:s.level||0},4000),tool:s.task?.workshop?.tool||null,
 };}
// Lazy expiry also covers sessions created before explicit context expiry existed.
function scrubExpiredContexts(state,time){
 for(const session of Object.values(state.sessions||{})){
  const context=session.nextContext;if(!context)continue;
  const expiresAt=Number(context.expiresAt)||(Number(session.deadline)?Number(session.deadline)+30*86400000:0);
  if(expiresAt<=time){session.nextContext={action:context.action||'resume',expiresAt,expired:true};delete session.nextFailure;}
 }
 return state;
}
function createService({store,ai,catalog,now=Date.now,quota=async()=>{}}){
 const getTopic=topicId=>(catalog.competencies||[]).find(t=>t.id===topicId)||(catalog.topics||[]).find(t=>t.id===topicId);
 const seed=uid=>({learner:{id:uid,alias:'du',grade:6,track:'R'},sessions:{},requests:{},topicEvents:{},activeSessionId:null});
 const summary=s=>({text:`${s.events.filter(e=>e.independent&&e.correct).length} Aufgaben selbstständig richtig. ${s.events.filter(e=>!e.independent&&e.correct).length} mit Hilfe gelöst. Wir knüpfen beim nächsten Mal hier an.`});
 const project=state=>{
  const time=now(),context={grade:state.learner.grade,track:state.learner.track,subject:state.learner.subject,activeSessionId:state.activeSessionId};
  const skills=Object.entries(state.topicEvents).filter(([,events])=>events.length).map(([topicId,events])=>({topicId,...projectSkill(events,time,getTopic(topicId))}));
  const contextTopics=(catalog.topics||[]).filter(t=>t.grade===context.grade&&t.track===context.track&&(!context.subject||t.subject===context.subject)&&eligibility(t).available);
  const active=state.sessions[state.activeSessionId],learningNetwork=projectNetwork(catalog,state.topicEvents,state.sessions,time,context);
  let recommendations=[];
  if(learningNetwork.nodes.length){
   const subjects=context.subject?[context.subject]:['math','german'];
   for(const subject of subjects){const next=chooseCompetency(catalog,state.topicEvents,{...context,subject},time);if(next){const evidence=projectSkill(state.topicEvents[next.id]||[],time,next);recommendations.push({topicId:next.id,title:next.title,reason:evidence.reviewDue?'Zeit für eine neue Probe ohne Hilfe.':evidence.status==='unseen'?'Starte mit einer ersten Probe. Dein Lernstand ist noch offen.':'Hier kannst du an deinen letzten Schritt anknüpfen.'});}}
  }else{
   const allowed=new Set(contextTopics.map(t=>t.id));
   recommendations=skills.filter(s=>allowed.has(s.topicId)&&(s.status==='practicing'||s.reviewDue)).map(s=>({topicId:s.topicId,title:getTopic(s.topicId)?.title||'',reason:s.reviewDue?'Zeit für eine neue Probe ohne Hilfe.':'Hier kannst du an deinen letzten Schritt anknüpfen.'}));
   if(!recommendations.length)for(const subject of context.subject?[context.subject]:['math','german']){const first=contextTopics.find(t=>t.subject===subject);if(first)recommendations.push({topicId:first.id,title:first.title,reason:'Starte mit einer ersten Probe. Dein Lernstand ist noch offen.'});}
  }
  return {learner:state.learner,skills,recommendations:recommendations.slice(0,8),learningNetwork,activeSession:active&&active.phase!=='ended'?publicSession(active,time):null,helpQuality:projectHelpEvidence(state.sessions),observationSummary:state.observationSummary||{attempts:0,lastAt:null},catalogVersion:catalog.version};
 };
 async function profile(uid,data={}){return store.transact(uid,state=>{
  state=scrubExpiredContexts(state||seed(uid),now());
  if(data.grade!==undefined){
   const grade=Number(data.grade);if(!Number.isInteger(grade)||grade<5||grade>10)fail('invalid-argument','Bitte Klasse 5 bis 10 auswählen.');
   const track=grade===10?'M':grade<7?'R':data.track;
   if(!['R','M'].includes(track))fail('invalid-argument','Bitte einen Bildungsgang auswählen.');
   state.learner={...state.learner,grade,track};
  }
  if(data.subject!==undefined){if(!['math','german'].includes(data.subject))fail('invalid-argument','Bitte Mathematik oder Deutsch auswählen.');state.learner={...state.learner,subject:data.subject};}
  return {state,result:project(state)};
 },{allTopics:true});}
 async function operation(uid,kind,data){
  if(!id(data.eventId))fail('invalid-argument','Bitte den Schritt erneut öffnen.');
  const inputHash=hash({kind,data}),ticket=randomUUID(),time=now();
  const reservation=await store.transact(uid,state=>{
   state=scrubExpiredContexts(state||seed(uid),time);state.attempts=state.attempts||{};state.attemptIndex=state.attemptIndex||[];const old=state.requests[data.eventId];
   if(old&&old.hash!==inputHash)fail('already-exists','Dieser Schritt wurde bereits anders gesendet. Bitte den gespeicherten Stand laden.');
   if(old?.status==='done')return {state,result:{cached:old.response}};
   if(state.lock&&state.lock.until>time)fail('aborted','Ein Schritt wird gerade bearbeitet. Bitte gleich erneut versuchen.');
   let session;
   if(kind==='start'){
    let topic=getTopic(data.topicId);
    if(topic&&!topic.parentTopicId&&[5,6].includes(topic.grade)&&(catalog.competencies||[]).some(t=>t.parentTopicId===topic.id)){topic=chooseCompetency(catalog,state.topicEvents,{grade:topic.grade,track:topic.track,subject:topic.subject,parentTopicId:topic.id},time);}
    if(!data.topicId&&typeof data.area==='string'&&data.area.length<=180){
     const grade=Number(data.grade),track=grade===10?'M':grade<7?'R':data.track;
     const candidates=(catalog.topics||[]).filter(t=>t.area===data.area&&t.subject===data.subject&&t.grade===grade&&t.track===track&&eligibility(t).available);
     const learning=candidates.find(t=>projectSkill(state.topicEvents[t.id]||[],time).status==='practicing');
     const hasChildren=[5,6].includes(grade)&&(catalog.competencies||[]).some(t=>t.grade===grade&&t.subject===data.subject&&t.area===data.area);
     topic=hasChildren?chooseCompetency(catalog,state.topicEvents,{grade,track,subject:data.subject,area:data.area},time):learning||candidates.find(t=>projectSkill(state.topicEvents[t.id]||[],time).status!=='secure'&&(t.prerequisites||[]).every(p=>projectSkill(state.topicEvents[p]||[],time).status==='secure'))||candidates.find(t=>projectSkill(state.topicEvents[t.id]||[],time).status!=='secure')||candidates[0];
     if(topic)state.learner={...state.learner,grade,track};
    }
    if(topic?.parentTopicId)state.learner={...state.learner,grade:topic.grade,track:topic.track,subject:topic.subject};
    if(!topic)fail('not-found','Für dieses Thema ist noch kein passender Übungsweg verfügbar.');
    if(!eligibility(topic).available)fail('failed-precondition',eligibility(topic).reason);
    const minutes=Number(data.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>60)fail('invalid-argument','Bitte 1 bis 60 Minuten wählen.');
    session={id:randomUUID(),topic,revision:0,phase:'practice',level:0,supportStage:0,deadline:time+minutes*60000,events:[],task:null,originalTask:null};
   }else{
    if(!id(data.sessionId))fail('invalid-argument','Ungültige Übung.');
    session=state.sessions[data.sessionId];if(!session)fail('not-found','Diese Übung gehört nicht zu deinem Profil.');
    if(session.revision!==data.revision)fail('aborted','Dein Stand hat sich geändert. Bitte den gespeicherten Stand laden.');
    if(session.phase==='ended')fail('failed-precondition','Diese Einheit ist beendet.');
    if(!['answer','help','question','finish','retry-next'].includes(data.action))fail('invalid-argument','Unbekannter Lernschritt.');
    if(session.pendingNext&&!['retry-next','finish'].includes(data.action))fail('failed-precondition','Deine Antwort ist gespeichert. Bitte den nächsten Lernschritt erneut laden.');
    if(data.action==='retry-next'&&!session.pendingNext)fail('failed-precondition','Der Lernschritt ist bereits bereit. Bitte den gespeicherten Stand laden.');
    if(data.action==='answer'&&session.task.input!=='workshop'&&(typeof data.answer!=='string'||!data.answer.trim()||data.answer.length>4000))fail('invalid-argument','Bitte zuerst eine kurze Antwort eingeben.');
    if(data.action==='question'&&(typeof data.question!=='string'||!data.question.trim()||data.question.length>2000))fail('invalid-argument','Bitte zuerst deine Frage eingeben.');
    if(session.phase==='teacher'&&!['finish','retry-next'].includes(data.action))fail('failed-precondition','Bitte zuerst gemeinsam mit deiner Lehrkraft auf diesen Schritt schauen.');
   }
   let workshopEvidence=null;
   if(kind!=='start'&&!['finish','retry-next'].includes(data.action)){
    if(data.workshop){try{workshopEvidence=observe(session.task,data.workshop);}catch(error){fail('invalid-argument',error.message);}}
    if(session.task.input==='workshop'&&data.action==='answer'&&!workshopEvidence)fail('invalid-argument','Bitte zuerst deine Darstellung senden.');
   }
   state.requests[data.eventId]={hash:inputHash,status:'pending'};state.lock={ticket,until:time+180000};
   return {state,result:{session,workshopEvidence}};
  },{eventId:data.eventId,allTopics:kind==='start'});
  if(reservation.cached)return reservation.cached;
  let s=reservation.session,checkpointed=false;
  const before=globalThis.structuredClone(s),workshop=reservation.workshopEvidence;
  const learnerAnswer=s.task?.input==='workshop'&&workshop?workshop.answer:data.answer;
  let assessment=null,generatedHelp=false;
  const persist=async({release=false,record=false}={})=>store.transact(uid,state=>{
   if(state?.lock?.ticket!==ticket)fail('aborted','Bitte den aktuellen Lernstand laden.');
   if(record)state.helpExperience=updateExperience(state.helpExperience,before,s,{action:data.action,assessment,now:time,eventId:data.eventId});
   if(s.pendingNext&&s.nextContext)s.nextContext.helpExperience=experienceFor(state.helpExperience,s.topic.id,null);
   if(release&&generatedHelp&&!s.pendingNext&&s.phase==='help'&&s.assistance)state.helpExperience=updateExperience(state.helpExperience,before,s,{action:'help-generated',now:time,eventId:data.eventId});
   const previous=state.sessions[s.id],added=s.events.slice(previous?.events?.length||0);
   state.topicEvents[s.topic.id]=[...(state.topicEvents[s.topic.id]||[]),...added].slice(-60);
   state.sessions[s.id]=s;state.activeSessionId=s.id;
   if(record){
    const attempt=makeAttempt(uid,data,before,assessment,workshop,time);
    state.attempts=state.attempts||{};state.attemptIndex=(state.attemptIndex||[]).filter(x=>x.expiresAt>time&&x.id!==data.eventId);
    state.attemptIndex.push({id:data.eventId,expiresAt:attempt.expiresAt});state.attemptIndex=state.attemptIndex.slice(-60);
    const retained=new Set(state.attemptIndex.map(x=>x.id));for(const key of Object.keys(state.attempts))if(!retained.has(key))delete state.attempts[key];
    state.attempts[data.eventId]=attempt;
    state.observationSummary={attempts:state.attemptIndex.length,lastAt:time,lastAction:data.action,lastTool:before.task?.workshop?.tool||null,lastSupportStage:before.supportStage||0};
   }
   const response=publicSession(s,now());state.requests[data.eventId]={hash:inputHash,status:'done',response};
   if(release)delete state.lock;
   const keys=Object.keys(state.requests);for(const k of keys.slice(0,Math.max(0,keys.length-12)))delete state.requests[k];
   const sessions=Object.keys(state.sessions);for(const k of sessions.slice(0,Math.max(0,sessions.length-6)))if(k!==s.id)delete state.sessions[k];
   return {state,result:response};
  },{topicId:s.topic.id,eventId:data.eventId,attemptId:record?data.eventId:undefined});
  try{
   const ended=kind!=='start'&&(data.action==='finish'||s.deadline<=time);
   if(ended){s.phase='ended';s.pendingNext=false;delete s.nextContext;delete s.nextFailure;delete s.nextFailure;s.summary=summary(s);s.revision+=1;return await persist({release:true});}
   await quota(uid);
   if(kind!=='start'&&data.action!=='retry-next'){
    assessment=data.action==='answer'?await ai.assess(s,learnerAnswer,{workshop}):null;
    if(data.action==='answer'&&(!assessment||!['correct','incorrect','unclear'].includes(assessment.outcome)))fail('internal','Die Antwort konnte noch nicht sicher geprüft werden. Bitte erneut versuchen.');
    if(['help','completion'].includes(s.phase)&&!s.assistance&&['help','question'].includes(data.action))s.originalTask=globalThis.structuredClone(s.task);
    s=observeHelp(before,transition(s,data.action,assessment,time),{action:data.action,assessment,now:time});if(assessment?.short)s.feedback.short=assessment.short;
   }
   const needsNext=assessment?.outcome!=='unclear'&&(kind==='start'||data.action==='retry-next'||['practice','help','teacher'].includes(s.phase));
   s.revision+=1;
   if(needsNext){
    s.pendingNext=true;
    if(data.action!=='retry-next')s.nextContext={createdAt:time,expiresAt:time+30*86400000,action:data.action||'start',question:data.question||'',answer:learnerAnswer||'',workshop};
    await persist({record:kind!=='start'&&data.action!=='retry-next'});checkpointed=true;
    try{
     const generated=await ai.next(s,s.nextContext);
     s.task=generated.task;s.explanation=generated.explanation;s.visual=generated.visual;s.assistance=generated.assistance||null;generatedHelp=Boolean(s.assistance&&s.phase==='help');s=observeHelp(before,s,{action:'help-generated',now:time});s.pendingNext=false;delete s.nextContext;delete s.nextFailure;
    }catch(error){s.nextFailure={stage:String(error?.stage||error?.details?.incompleteReason||error?.details?.reason||'generation').slice(0,100),critique:String(error?.critique||error?.message||'').slice(0,800)};return await persist({release:true});}
   }
   return await persist({release:true,record:!checkpointed&&kind!=='start'&&data.action!=='retry-next'});
  }catch(error){
   await store.transact(uid,state=>{if(state?.lock?.ticket===ticket){delete state.lock;if(!checkpointed)delete state.requests[data.eventId];}return {state,result:null};},{eventId:data.eventId});
   throw error;
  }
 }
 return {profile,start:(uid,data)=>operation(uid,'start',data),turn:(uid,data)=>operation(uid,'turn',data)};
}
function firestoreStore(db,requireAccountWrite){return {transact:(uid,fn,options={})=>db.runTransaction(async tx=>{
 await requireAccountWrite(tx,db,uid);const ref=db.doc(`users/${uid}/aiRuntime/learningBrain`),snap=await tx.get(ref);
 const state=snap.exists?snap.data():null;
 let topicEvents={};
 let requests={};
 if(options.eventId){const event=await tx.get(ref.collection('events').doc(options.eventId));if(event.exists)requests[options.eventId]=event.data();}
 if(options.allTopics){const topics=await tx.get(ref.collection('topics'));for(const doc of topics.docs)topicEvents[doc.id]=doc.data().events||[];}
 else if(options.topicId){const topic=await tx.get(ref.collection('topics').doc(options.topicId));topicEvents[options.topicId]=topic.data()?.events||[];}
 if(state){state.topicEvents=topicEvents;state.requests=requests;}
 const previousAttemptIndex=state?.attemptIndex||[];
 const {state:next,result}=fn(state);
 if(next){
  const {topicEvents:events,requests:nextRequests,attempts={},...privateState}=next;
  // Each competency has its own bounded document; the learner root never grows with all subjects.
  if(Buffer.byteLength(JSON.stringify(privateState))>750000)throw new LearningError('resource-exhausted','Bitte beende diese Einheit und starte einen neuen Lernschritt.');
  tx.set(ref,privateState);
  if(options.eventId){const eventRef=ref.collection('events').doc(options.eventId);if(nextRequests[options.eventId])tx.set(eventRef,nextRequests[options.eventId]);else tx.delete(eventRef);}
  if(options.attemptId&&attempts[options.attemptId]){
   tx.set(ref.collection('attempts').doc(options.attemptId),attempts[options.attemptId]);
   const retained=new Set((next.attemptIndex||[]).map(x=>x.id));
   for(const entry of previousAttemptIndex)if(!retained.has(entry.id))tx.delete(ref.collection('attempts').doc(entry.id));
  }
  if(options.topicId)tx.set(ref.collection('topics').doc(options.topicId),{events:events[options.topicId]||[]});
 }
 return result;
})};}
module.exports={createService,firestoreStore,LearningError};
