'use strict';
const {randomUUID,createHash}=require('node:crypto');
const {transition,projectSkill,publicSession}=require('./core');
class LearningError extends Error{constructor(code,message){super(message);this.code=code;}}
const fail=(code,message)=>{throw new LearningError(code,message);};
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(value);
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function createService({store,ai,catalog,now=Date.now,quota=async()=>{}}){
 const getTopic=topicId=>catalog.topics.find(t=>t.id===topicId);
 const seed=uid=>({learner:{id:uid,alias:'du',grade:6,track:'R'},sessions:{},requests:{},topicEvents:{},activeSessionId:null});
 const summary=s=>({text:`${s.events.filter(e=>e.independent&&e.correct).length} Aufgaben selbstständig richtig. ${s.events.filter(e=>!e.independent&&e.correct).length} mit Hilfe gelöst. Wir knüpfen beim nächsten Mal hier an.`});
 const project=state=>{
  const skills=Object.entries(state.topicEvents).filter(([,events])=>events.length).map(([topicId,events])=>({topicId,...projectSkill(events,now())}));
  const contextTopics=catalog.topics.filter(t=>t.grade===state.learner.grade&&t.track===state.learner.track&&!['audio','speaking','visual'].includes(t.modality));
  const active=state.sessions[state.activeSessionId];
  const recommendations=skills.filter(s=>s.status==='practicing'||s.reviewDue).map(s=>({topicId:s.topicId,title:getTopic(s.topicId)?.title||'',reason:s.reviewDue?'Zeit für eine neue Probe ohne Hilfe.':'Hier kannst du an deinen letzten Schritt anknüpfen.'}));
  if(!recommendations.length)for(const subject of ['math','german']){const first=contextTopics.find(t=>t.subject===subject);if(first)recommendations.push({topicId:first.id,title:first.title,reason:'Starte mit einer ersten Probe. Dein Lernstand ist noch offen.'});}
  return {learner:state.learner,skills,recommendations:recommendations.slice(0,8),activeSession:active&&active.phase!=='ended'?publicSession(active,now()):null,catalogVersion:catalog.version};
 };
 async function profile(uid,data={}){return store.transact(uid,state=>{
  state=state||seed(uid);
  if(data.grade!==undefined){
   const grade=Number(data.grade);if(!Number.isInteger(grade)||grade<5||grade>10)fail('invalid-argument','Bitte Klasse 5 bis 10 auswählen.');
   const track=grade===10?'M':grade<7?'R':data.track;
   if(!['R','M'].includes(track))fail('invalid-argument','Bitte einen Bildungsgang auswählen.');
   state.learner={...state.learner,grade,track};
  }
  return {state,result:project(state)};
 },{allTopics:true});}
 async function operation(uid,kind,data){
  if(!id(data.eventId))fail('invalid-argument','Bitte den Schritt erneut öffnen.');
  const inputHash=hash({kind,data}),ticket=randomUUID(),time=now();
  const reservation=await store.transact(uid,state=>{
   state=state||seed(uid);const old=state.requests[data.eventId];
   if(old&&old.hash!==inputHash)fail('already-exists','Dieser Schritt wurde bereits anders gesendet. Bitte den gespeicherten Stand laden.');
   if(old?.status==='done')return {state,result:{cached:old.response}};
   if(state.lock&&state.lock.until>time)fail('aborted','Ein Schritt wird gerade bearbeitet. Bitte gleich erneut versuchen.');
   let session;
   if(kind==='start'){
    const topic=getTopic(data.topicId);if(!topic)fail('not-found','Lernziel nicht gefunden.');
    if(['audio','speaking','visual'].includes(topic.modality))fail('failed-precondition','Dieses Lernziel benötigt einen passenden Medienweg oder eine Arbeitsprobe. Bitte gemeinsam mit deiner Lehrkraft üben.');
    const minutes=Number(data.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>60)fail('invalid-argument','Bitte 1 bis 60 Minuten wählen.');
    session={id:randomUUID(),topic,revision:0,phase:'practice',level:0,supportStage:0,deadline:time+minutes*60000,events:[],task:null,originalTask:null};
   }else{
    if(!id(data.sessionId))fail('invalid-argument','Ungültige Übung.');
    session=state.sessions[data.sessionId];if(!session)fail('not-found','Diese Übung gehört nicht zu deinem Profil.');
    if(session.revision!==data.revision)fail('aborted','Dein Stand hat sich geändert. Bitte den gespeicherten Stand laden.');
    if(session.phase==='ended')fail('failed-precondition','Diese Einheit ist beendet.');
    if(!['answer','help','question','finish'].includes(data.action))fail('invalid-argument','Unbekannter Lernschritt.');
    if(data.action==='answer'&&(typeof data.answer!=='string'||!data.answer.trim()||data.answer.length>4000))fail('invalid-argument','Bitte zuerst eine kurze Antwort eingeben.');
    if(data.action==='question'&&(typeof data.question!=='string'||!data.question.trim()||data.question.length>2000))fail('invalid-argument','Bitte zuerst deine Frage eingeben.');
    if(session.phase==='teacher'&&data.action!=='finish')fail('failed-precondition','Bitte zuerst gemeinsam mit deiner Lehrkraft auf diesen Schritt schauen.');
   }
   state.requests[data.eventId]={hash:inputHash,status:'pending'};state.lock={ticket,until:time+180000};
   return {state,result:{session}};
  },{eventId:data.eventId});
  if(reservation.cached)return reservation.cached;
  let s=reservation.session; let unclear=false;
  try{
   const ended=kind!=='start'&&(data.action==='finish'||s.deadline<=time);
   if(!ended){
    await quota(uid);
    if(kind!=='start'){
     const assessment=data.action==='answer'?await ai.assess(s,data.answer):null;
     unclear=assessment?.outcome==='unclear';
     s=transition(s,data.action,assessment,time);
     if(assessment?.short)s.feedback.short=assessment.short;
    }
    if(!unclear&&(kind==='start'||s.phase==='practice'||s.phase==='help'||s.phase==='teacher')){
     const generated=await ai.next(s,{action:data.action||'start',question:data.question||'',answer:data.answer||''});
     s.task=generated.task;s.explanation=generated.explanation;s.visual=generated.visual;
    }
   }else{s.phase='ended';s.summary=summary(s);}
   s.revision+=1;
   const response=publicSession(s,now());
   return await store.transact(uid,state=>{
    if(state?.lock?.ticket!==ticket)fail('aborted','Bitte den aktuellen Lernstand laden.');
    // Persist compact observations only; raw learner text is never an event log.
    const previous=state.sessions[s.id];const added=s.events.slice(previous?.events?.length||0);
    const existing=state.topicEvents[s.topic.id]||[];
    state.topicEvents[s.topic.id]=[...existing,...added].slice(-60);
    state.sessions[s.id]=s;state.activeSessionId=s.id;
    state.requests[data.eventId]={hash:inputHash,status:'done',response};delete state.lock;
    const keys=Object.keys(state.requests);for(const k of keys.slice(0,Math.max(0,keys.length-12)))delete state.requests[k];
    const sessions=Object.keys(state.sessions);for(const k of sessions.slice(0,Math.max(0,sessions.length-6)))if(k!==s.id)delete state.sessions[k];
    return {state,result:response};
   },{topicId:s.topic.id,eventId:data.eventId});
  }catch(error){
   await store.transact(uid,state=>{if(state?.lock?.ticket===ticket){delete state.lock;delete state.requests[data.eventId];}return {state,result:null};},{eventId:data.eventId});
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
 const {state:next,result}=fn(state);
 if(next){
  const {topicEvents:events,requests:nextRequests,...privateState}=next;
  // Each competency has its own bounded document; the learner root never grows with all subjects.
  if(Buffer.byteLength(JSON.stringify(privateState))>750000)throw new LearningError('resource-exhausted','Bitte beende diese Einheit und starte einen neuen Lernschritt.');
  tx.set(ref,privateState);
  if(options.eventId){const eventRef=ref.collection('events').doc(options.eventId);if(nextRequests[options.eventId])tx.set(eventRef,nextRequests[options.eventId]);else tx.delete(eventRef);}
  if(options.topicId)tx.set(ref.collection('topics').doc(options.topicId),{events:events[options.topicId]||[]});
 }
 return result;
})};}
module.exports={createService,firestoreStore,LearningError};
