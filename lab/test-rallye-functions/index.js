'use strict';
const {randomBytes,randomInt}=require('node:crypto');
const {initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {onRequest}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const core=require('./core'),policy=require('./policy');
initializeApp();const db=getFirestore();const rooms=db.collection('testRallyeRooms');
const hostActions=new Set(['listTests','preflight','createRoom','startRoom','hostState','finishRoom','deleteRoom','devReset','devJump']);
const project=process.env.GCLOUD_PROJECT||process.env.GOOGLE_CLOUD_PROJECT;
function gate(role){return{project,enabled:process.env.TEST_RALLYE_DEV_ENABLED==='true',role}}
async function hostIdentity(req){const raw=String(req.headers.authorization||'');if(!raw.startsWith('Bearer '))throw new Error('Bitte mit deinem GradeCrew-Konto anmelden.');const identity=await getAuth().verifyIdToken(raw.slice(7),true);const profile=await db.doc(`users/${identity.uid}`).get();const user=profile.data()||{};if(user.disabled===true||(user.status||'active')!=='active'||!['teacher','admin'].includes(user.role||'teacher'))throw new Error('Ein freigeschaltetes Lehrkraftkonto ist erforderlich.');return{uid:identity.uid,role:user.role||'teacher'}}
async function ownedQuiz(id,identity,tx){if(!/^[A-Za-z0-9_-]{1,120}$/.test(id||''))throw new Error('Ungültiger Test.');const ref=db.doc(`quizzes/${id}`),snap=tx?await tx.get(ref):await ref.get();policy.assertOwner(identity,snap.data());return{ref,quiz:snap.data()}}
async function questions(ref,tx){const query=ref.collection('questions').orderBy('position');const snap=tx?await tx.get(query):await query.get();return snap.docs.map(d=>({id:d.id,...d.data()}))}
async function limited(key,limit,windowMs){const ref=db.doc(`testRallyeLimits/${policy.hashToken(key)}`);await db.runTransaction(async tx=>{const s=await tx.get(ref),old=s.data()||{},now=Date.now();const count=now-(old.startAt||0)<windowMs?(old.count||0)+1:1;if(count>limit)throw new Error('Bitte kurz warten und erneut versuchen.');tx.set(ref,{startAt:count===1?now:old.startAt,count,expiresAt:Timestamp.fromMillis(now+86400000)})})}
function board(room,players,now){return{code:room.code,title:room.title,status:room.status,version:room.version,development:room.development,serverNow:now,endAt:room.endAt||null,durationSec:room.durationSec,total:room.total,players:players.map(p=>({alias:p.alias,score:p.score,cursor:p.cursor,finished:p.cursor>=room.total})).sort((a,b)=>b.score-a.score)}}
async function roomTransaction(code,fn){return db.runTransaction(async tx=>{const ref=rooms.doc(policy.cleanCode(code)),s=await tx.get(ref);if(!s.exists||s.data().expiresAt.toMillis()<=Date.now())throw new Error('Runde nicht verfügbar.');return fn(tx,ref,s.data())})}
async function dispatch(action,p,identity,req){
 if(action==='health')return{version:1,game:'test-rallye',serverNow:Date.now()};
 if(action==='listTests'){const s=await db.collection('quizzes').where('ownerId','==',identity.uid).limit(100).get();return{tests:s.docs.map(d=>({id:d.id,title:String(d.data().title||'Test'),subject:String(d.data().subject||''),grade:String(d.data().grade||'')})),developmentAllowed:policy.canDevelop(gate(identity.role))};}
 if(action==='preflight'){const{ref}=await ownedQuiz(p.quizId,identity);return core.preflight(await questions(ref));}
 if(action==='createRoom'){
  await limited(`create:${identity.uid}`,20,3600000);const{ref,quiz}=await ownedQuiz(p.quizId,identity);const check=core.preflight(await questions(ref));if(!check.ok)throw new Error(check.issues.join('\n'));
  if(p.development===true&&!policy.canDevelop(gate(identity.role)))throw new Error('Entwicklungsmodus erfordert ein berechtigtes Staging-Administratorkonto.');
  const durationSec=Number(p.durationSec);if(!Number.isInteger(durationSec)||durationSec<30||durationSec>3600)throw new Error('Dauer muss 30–3600 Sekunden betragen.');
  for(let n=0;n<5;n++){const code=String(randomInt(1000000)).padStart(6,'0');try{await rooms.doc(code).create({code,ownerId:identity.uid,quizId:p.quizId,title:String(quiz.title||'Test'),contentLocale:quiz.contentLocale||'de-DE',status:'waiting',version:1,development:p.development===true,durationSec,total:0,playerCount:0,createdAt:Timestamp.now(),expiresAt:Timestamp.fromMillis(Date.now()+86400000)});return{code}}catch(e){if(e.code!==6)throw e}}
  throw new Error('Bitte Runde erneut erstellen.');
 }
 if(action==='join'){
  await limited(`join:${req.ip}`,100,60000);policy.cleanIdentity(p.clientId);policy.assertPlayer({tokenHash:policy.hashToken(p.token)},p.token);const alias=policy.cleanAlias(p.alias);
  return roomTransaction(p.code,async(tx,ref,room)=>{const pr=ref.collection('players').doc(p.clientId),s=await tx.get(pr);if(s.exists){policy.assertPlayer(s.data(),p.token);return{joined:true,version:room.version}}if(room.status!=='waiting')throw new Error('Diese Runde wurde bereits gestartet.');if(room.playerCount>=30)throw new Error('Diese Runde ist voll.');tx.create(pr,{alias,tokenHash:policy.hashToken(p.token),cursor:0,score:0,cooldownUntil:0,receipts:{}});tx.update(ref,{playerCount:room.playerCount+1});return{joined:true,version:room.version}});
 }
 if(action==='deleteRoom'){const ref=rooms.doc(policy.cleanCode(p.code)),s=await ref.get();policy.assertOwner(identity,s.data());await db.recursiveDelete(ref);return{deleted:true};}
 return roomTransaction(p.code,async(tx,ref,room)=>{
  const now=Date.now();if(hostActions.has(action))policy.assertOwner(identity,room);
  if(action==='startRoom'){
   if(room.status!=='waiting')return{status:room.status,version:room.version};if(!room.playerCount)throw new Error('Mindestens ein Schülerkürzel muss beitreten.');
   const{ref:qr,quiz}=await ownedQuiz(room.quizId,identity,tx);const snapshot=core.snapshot(await questions(qr,tx),randomBytes(32).toString('hex'));
   snapshot.paper.forEach((paper,index)=>tx.create(ref.collection('snapshot').doc(String(index)),{paper,key:snapshot.key.find(k=>k.id===paper.id)}));
   tx.update(ref,{status:'running',total:snapshot.paper.length,fingerprint:snapshot.fingerprint,startAt:now,endAt:now+room.durationSec*1000,contentLocale:quiz.contentLocale||'de-DE'});return{status:'running',version:room.version};
  }
  const playerQuery=ref.collection('players');
  if(['hostState','finishRoom','devReset','devJump'].includes(action)){
   const s=await tx.get(playerQuery),players=s.docs.map(d=>d.data());const done=room.status==='running'&&(now>=room.endAt||players.length&&players.every(p=>p.cursor>=room.total));if(done){room={...room,status:'finished'};tx.update(ref,{status:'finished'})}
   if(action==='finishRoom'){tx.update(ref,{status:'finished'});room.status='finished'}
   if(action.startsWith('dev')){policy.assertDevelopment(room,gate(identity.role));if(!room.total)throw new Error('Erst Runde starten.');if(action==='devReset'){room={...room,version:room.version+1,status:'running',startAt:now,endAt:now+room.durationSec*1000};tx.update(ref,{version:room.version,status:room.status,startAt:now,endAt:room.endAt});s.docs.forEach(d=>tx.update(d.ref,{cursor:0,score:0,cooldownUntil:0,receipts:{},lastReceipt:null}))}else{const index=Number(p.index);if(!Number.isInteger(index)||index<0||index>=room.total)throw new Error('Ungültige Aufgabennummer.');s.docs.forEach(d=>tx.update(d.ref,{cursor:index,cooldownUntil:0,receipts:{},lastReceipt:null}));room={...room,version:room.version+1,status:'running'};tx.update(ref,{version:room.version,status:'running'});}return{version:room.version,status:room.status};}
   return board(room,players,now);
  }
  if(!['playerState','submit'].includes(action))throw new Error('Unbekannte Aktion.');policy.cleanIdentity(p.clientId);const pr=playerQuery.doc(p.clientId),s=await tx.get(pr);policy.assertPlayer(s.data(),p.token);const player=s.data();
  if(room.status==='waiting')return{status:'waiting',serverNow:now,version:room.version,score:player.score,cursor:0,total:0,alias:player.alias};
  const item=await tx.get(ref.collection('snapshot').doc(String(player.cursor)));const q=item.data();
  // Core operates on the current fixed snapshot item; cursor is translated locally.
  if(action==='submit'){
   const cached=player.receipts?.[p.requestId];if(p.version!==room.version)throw new Error('Die Spielversion ist veraltet.');if(cached)return{receipt:cached,version:room.version,serverNow:now};
   if(!q)throw new Error('Die Runde ist beendet.');const local={...player,cursor:0};const result=core.submitTransition({...room,snapshot:{paper:[q.paper],key:[q.key]}},local,p,now);result.player.cursor=player.cursor+1;tx.set(pr,result.player);return{receipt:result.receipt,version:room.version,serverNow:now};
  }
  const finished=room.status==='finished'||now>=room.endAt||player.cursor>=room.total;
  return{status:finished?'finished':'running',version:room.version,serverNow:now,endAt:room.endAt,score:player.score,cursor:player.cursor,total:room.total,cooldownUntil:player.cooldownUntil||0,lastReceipt:player.lastReceipt||null,question:!finished&&now>=player.cooldownUntil?q?.paper||null:null,contentLocale:room.contentLocale,alias:player.alias};
 });
}
exports.testRallyeApi=onRequest({region:'europe-west1',cors:true,timeoutSeconds:60,memory:'256MiB',maxInstances:5},async(req,res)=>{
 if(req.method==='GET')return res.status(200).json({ok:true,data:{game:'test-rallye',version:1}});if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST erforderlich.'});
 try{if(!req.body||JSON.stringify(req.body).length>20000)throw new Error('Anfrage zu groß.');const{action,payload={}}=req.body;if(typeof action!=='string'||!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('Ungültige Anfrage.');const identity=hostActions.has(action)?await hostIdentity(req):null;const data=await dispatch(action,payload,identity,req);return res.json({ok:true,data});}catch(e){const expected=/Berechtigung|anmelden|Lehrkraftkonto|Aufgabe|Test|Runde|Antwort|Pause|version|Version|bitte|Bitte|Dauer|Kürzel|Teilnehmer|Entwicklungs|Ungültig|Anfrage|POST|warten/.test(e.message||'');return res.status(400).json({ok:false,error:expected?e.message:'Die Anfrage konnte nicht ausgeführt werden. Bitte erneut versuchen.'});}
});
// Real periodic cleanup: expiresAt is a retention target; hourly schedule adds up to1h scheduling lag.
exports.testRallyeCleanup=onSchedule({schedule:'every 60 minutes',region:'europe-west1',timeoutSeconds:300,maxInstances:1},async()=>{for(const collection of [rooms,db.collection('testRallyeLimits')]){const expired=await collection.where('expiresAt','<=',Timestamp.now()).limit(200).get();for(const doc of expired.docs)await db.recursiveDelete(doc.ref)}});
