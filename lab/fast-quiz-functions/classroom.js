'use strict';
const math=require('./classroom-math.js');
const {randomBytes,createHash}=require('node:crypto');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const buildHash=createHash('sha256').update(['index.js','classroom.js','classroom-math.js'].map(name=>readFileSync(path.join(__dirname,name))).reduce((a,b)=>Buffer.concat([a,b]),Buffer.alloc(0))).digest('hex');
const DURATION_MS=300000,WINDOW_MS=60000,MAX_PLAYERS=30;
function createApi({db,hashToken,newToken,fail,now=Date.now,randomSeed=()=>randomBytes(4).readUInt32BE(0)}) {
  const secretHash=token=>hashToken(String(token||''));
  function config(raw={}) {
    if(!['mental','paper'].includes(raw.category))fail('category_invalid','Bitte Kopfrechnen oder Stift und Block wählen.');
    if(!['n1','n2','n3','n4'].includes(raw.level))fail('level_invalid','Bitte ein Niveau von 1 bis 4 wählen.');
    if(!['computer','teams'].includes(raw.gameMode))fail('mode_invalid','Bitte eine Klassen-Spielweise wählen.');
    return{category:raw.category,level:raw.level,gameMode:raw.gameMode,durationSec:300,slotCount:5,maxPoints:100,windowSec:60};
  }
  const publicMember=(id,m,room)=>({id,name:m.name,teamId:m.teamId,scored:Object.hasOwn(room.roster||{},id),score:Number(m.score||0)});
  function metrics(room){const ids=Object.keys(room.roster||{});const total=ids.reduce((sum,id)=>sum+(room.members[id]?.score||0),0);const energy=ids.length?Math.round(1000*total/(ids.length*100)):0;return{energy,target:math.targetFor(room.round),success:room.status!=='aborted'&&energy>=math.targetFor(room.round)};}
  function expire(room,time){if(room.status==='running'&&time>=room.endsAtMs)room.status='finished';}
  function host(room,p){if(!p.hostToken||secretHash(p.hostToken)!==room.hostTokenHash)fail('host_forbidden','Lehrerzugriff ungültig.',403);}
  function player(room,p){const id=String(p.playerId||'');const m=Object.hasOwn(room.members,id)?room.members[id]:null;if(!m||!p.playerToken||secretHash(p.playerToken)!==m.tokenHash)fail('player_forbidden','Spielerzugriff ungültig.',403);return m;}
  function projection(room,p,time){
    const isHost=Boolean(p.hostToken)&&secretHash(p.hostToken)===room.hostTokenHash;
    if(p.hostToken&&!isHost)host(room,p);
    const self=p.playerId||p.playerToken?publicMember(p.playerId,player(room,p),room):undefined;
    const teams=math.standings(room.members,room.status==='waiting'?Object.fromEntries(Object.entries(room.members).map(([id,m])=>[id,m.teamId])):room.roster);
    return{code:room.code,config:room.config,status:room.status,round:room.round,roundId:room.roundId||null,startsAtMs:room.startsAtMs,endsAtMs:room.endsAtMs,serverNowMs:time,slot:room.startsAtMs?Math.max(0,Math.min(4,Math.floor((time-room.startsAtMs)/WINDOW_MS))):0,playerCount:Object.keys(room.members).length,...(isHost?{members:Object.entries(room.members).map(([id,m])=>publicMember(id,m,room))}:{}),...(self?{self}:{}),teams,...metrics(room)};
  }
  async function transaction(payload,fn){
    const code=String(payload.code||'');if(!/^\d{6}$/.test(code))fail('code_invalid','Bitte einen sechsstelligen Rundencode eingeben.');
    const ref=db.collection('fastQuizClassrooms').doc(code);
    return db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)fail('room_not_found','Diese Klassenrunde wurde nicht gefunden.',404);const room=snap.data();const time=now();if(room.expiresAtMs<time)fail('room_expired','Diese Klassenrunde ist abgelaufen.',410);const before=JSON.stringify(room);expire(room,time);const result=await fn(room,time);if(JSON.stringify(room)!==before)tx.set(ref,room);return result;});
  }
  function activeTask(room,p,time,mutation=false){
    const member=player(room,p);
    if(room.status!=='running')fail('room_not_running','Die Runde läuft gerade nicht.',409);
    if(time<room.startsAtMs)fail('not_started','Der gemeinsame Start steht noch bevor.',409);
    const slot=Math.floor((time-room.startsAtMs)/WINDOW_MS);
    if(slot<0||slot>=5)fail('window_closed','Dieses Zeitfenster ist beendet.',409);
    if(mutation&&(!Number.isInteger(p.slot)||p.slot<0||p.slot>=5))fail('slot_required','Bitte das aktuelle Zeitfenster verwenden.',409);
    if(mutation&&p.roundId!==room.roundId)fail('round_changed','Die Runde hat gewechselt. Bitte die aktuelle Aufgabe laden.',409);
    if(p.slot!==undefined&&(!Number.isInteger(p.slot)||p.slot!==slot))fail('window_mismatch','Dieses Zeitfenster ist nicht mehr aktiv.',409);
    const scored=Object.hasOwn(room.roster,p.playerId);const question=math.generateScoredTask({...room.config,campaignRound:room.round},room.seed,slot);
    return{member,slot,scored,question};
  }
  return async function api(action,p={}){
    if(action==='classroomCreate'){
      const cfg=config(p.config),hostToken=newToken();for(let attempt=0;attempt<30;attempt++){
        const code=String(100000+(randomSeed()%900000)),ref=db.collection('fastQuizClassrooms').doc(code);
        const made=await db.runTransaction(async tx=>{if((await tx.get(ref)).exists)return false;const time=now();tx.create(ref,{version:1,code,config:cfg,hostTokenHash:secretHash(hostToken),seed:randomSeed(),status:'waiting',round:1,members:{},roster:{},startsAtMs:null,endsAtMs:null,expiresAtMs:time+21600000});return true;});
        if(made)return{code,hostToken,config:cfg};
      }fail('code_unavailable','Gerade ist kein Rundencode frei. Bitte erneut versuchen.',503);
    }
    return transaction(p,(room,time)=>{
      switch(action){
        case'classroomJoin':{
          const joinKey=String(p.joinKey||'');if(!/^[A-Za-z0-9_-]{24,100}$/.test(joinKey))fail('join_key_invalid','Die Teilnahme konnte nicht gespeichert werden. Bitte Browser neu laden.');
          const id=secretHash(joinKey).slice(0,32);let member=room.members[id];
          if(!member){const name=String(p.name||'').trim().replace(/[<>]/g,'').slice(0,24);if(!name)fail('name_required','Bitte ein Kürzel eingeben.');if(Object.keys(room.members).length>=MAX_PLAYERS)fail('room_full','Die Runde ist mit 30 Teilnehmenden voll.',409);member={tokenHash:secretHash(joinKey),name,teamId:0,score:0,attempts:{},hints:{},joinedAtMs:time};room.members[id]=member;
            if(room.status==='waiting'){
              if(room.assignmentMode==='manual'){const counts=[0,1,2,3].map(t=>Object.entries(room.members).filter(([key,m])=>key!==id&&m.teamId===t).length);member.teamId=counts.indexOf(Math.min(...counts));}
              else{const map=math.balancedTeams(Object.keys(room.members),room.seed);for(const key of Object.keys(room.members))room.members[key].teamId=map[key];}
            }
          }
          return{code:room.code,playerId:id,playerToken:joinKey,name:member.name};
        }
        case'classroomState':return projection(room,p,time);
        case'classroomAssign':{
          host(room,p);if(!['waiting','finished','aborted'].includes(room.status))fail('round_frozen','Teams können nur vor einer Runde geändert werden.',409);
          const assignments=p.assignments;if(!assignments||typeof assignments!=='object'||Array.isArray(assignments))fail('assignment_invalid','Bitte die Teamzuordnung prüfen.');
          for(const [id,teamId] of Object.entries(assignments)){if(!Object.hasOwn(room.members,id)||!Number.isInteger(teamId)||teamId<0||teamId>3)fail('assignment_invalid','Bitte die Teamzuordnung prüfen.');}
          for(const [id,teamId]of Object.entries(assignments))room.members[id].teamId=teamId;room.assignmentMode='manual';
          return projection(room,p,time);
        }
        case'classroomStart':{
          host(room,p);
          if(room.status==='running')return projection(room,p,time);
          if(room.status!=='waiting'){
            if((p.next===true||p.retry===true)&&p.expectedRoundId!==room.roundId)fail('round_changed','Die Runde hat gewechselt. Bitte den aktuellen Stand laden.',409);
            if(p.next===true){if(room.config.gameMode!=='computer'||room.status!=='finished'||!metrics(room).success||room.round>=4)fail('next_unavailable','Das nächste Kampagnenlevel ist noch nicht freigeschaltet.',409);room.round++;}
            else if(p.retry!==true)return projection(room,p,time);
          }
          const ids=Object.keys(room.members);if(!ids.length)fail('no_players','Mindestens eine Person muss beitreten.',409);
          if(room.config.gameMode==='teams'&&[0,1,2,3].some(t=>!ids.some(id=>room.members[id].teamId===t)))fail('team_empty','Für vier Gruppen muss in jedem Team mindestens eine Person sein.',409);
          room.roster=Object.fromEntries(ids.map(id=>[id,room.members[id].teamId]));
          for(const member of Object.values(room.members)){member.score=0;member.attempts={};member.hints={};}
          room.seed=randomSeed();room.roundId=newToken();room.status='running';room.startsAtMs=time+5000;room.endsAtMs=room.startsAtMs+DURATION_MS;return projection(room,p,time);
        }
        case'classroomStop':host(room,p);if(room.status==='running'||room.status==='waiting')room.status='aborted';return projection(room,p,time);
        case'classroomTask':{
          const {member,slot,scored,question}=activeTask(room,p,time);const {correct,hint,explanation,options,fingerprint,...safe}=question;safe.id=secretHash(room.seed+fingerprint).slice(0,24);
          return{question:safe,slot,roundId:room.roundId,slotEndsAtMs:room.startsAtMs+(slot+1)*WINDOW_MS,practice:!scored,answerResult:member.attempts[slot]||null,hintUsed:Boolean(member.hints[slot])};
        }
        case'classroomHint':{
          const {member,slot,question}=activeTask(room,p,time,true);member.hints[slot]=true;return{hint:question.hint};
        }
        case'classroomAnswer':case'classroomReveal':{
          const {member,slot,scored,question}=activeTask(room,p,time,true);const first=member.attempts[slot];
          const reveal=action==='classroomReveal',answer=String(p.answer||'').slice(0,120),correct=!reveal&&math.normalizeAnswer(answer)===question.correct;
          if(!first){const points=scored&&correct?(member.hints[slot]?10:20):0;member.score+=points;member.attempts[slot]={correct,points,explanation:question.explanation};}
          const result=member.attempts[slot];return{...result,correct,retryAllowed:true,...(reveal?{correctAnswer:question.correct}:{})};
        }
        default:fail('action_unknown','Unbekannte Klassenaktion.',404);
      }
    });
  };
}
module.exports={createApi,buildHash};
