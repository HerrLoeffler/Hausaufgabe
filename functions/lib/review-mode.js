'use strict';
const {createHash}=require('node:crypto');
const catalog=require('./review-checks.json');
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const text=(v,max,required=true)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('invalid-argument','Ungültiger oder zu langer Text.');return v.trim();};
const id=v=>{const s=text(v,128);if(!/^[\w-]+$/.test(s))fail('invalid-argument','Ungültige Kennung.');return s;};
const hash=v=>createHash('sha256').update(v).digest('hex');
const optional=(v,max)=>v==null?'':text(v,max,false);
const SCENES=new Set(['','welcome','remy','editor','student','submit','results','finish']);
function createReviewService({store,projectId,now=Date.now}) {
 async function execute({uid,data={}}) {
  if(projectId!=='hausaufgabe-staging')fail('failed-precondition','Überarbeitungsmodus nur auf Staging.');
  if(!uid)fail('unauthenticated','Bitte anmelden.');id(uid);
  return store.transaction(async tx=>{
   const profile=await tx.get(`users/${uid}`),member=await tx.get(`reviewMembers/${uid}`);
   const admin=profile?.role==='admin';
   if(!profile||(profile.status&&profile.status!=='active')||(!admin&&!(profile.role==='teacher'&&member?.enabled===true)))fail('permission-denied','Keine Berechtigung für den Überarbeitungsmodus.');
   const requireAdmin=()=>{if(!admin)fail('permission-denied','Nur der Administrator darf diese Aktion ausführen.');};
   const quizAccess=async quizId=>{if(!quizId)return;const q=await tx.get(`quizzes/${id(quizId)}`);if(!q||(!admin&&q.ownerId!==uid))fail('permission-denied','Kein Zugriff auf diesen Test.');};
   const action=data.action;
   if(action==='access')return {uid,admin,catalog};
   if(action==='members'){
    requireAdmin();const rows=await tx.list('users',{cursor:data.cursor?id(data.cursor):'',limit:100});const members=[];
    for(const row of rows){if(row.role!=='teacher')continue;const grant=await tx.get(`reviewMembers/${row.id}`);members.push({id:row.id,displayName:optional(row.displayName,200),enabled:grant?.enabled===true});}
    return {members,nextCursor:rows.length===100?rows.at(-1).id:null};
   }
   if(action==='grant'){
    requireAdmin();const memberId=id(data.memberId),target=await tx.get(`users/${memberId}`);
    if(target?.role!=='teacher'||typeof data.enabled!=='boolean')fail('invalid-argument','Bitte ein Lehrkraftkonto auswählen.');
    const before=await tx.get(`reviewMembers/${memberId}`);const revision=(before?.revision||0)+1;
    tx.set(`reviewMembers/${memberId}`,{enabled:data.enabled,revision,updatedBy:uid,updatedAt:now()});
    tx.set(`reviewMembers/${memberId}/history/${revision}`,{enabled:data.enabled,actor:uid,at:now()});return {ok:true};
   }
   if(action==='list'||action==='batch'){
    if(action==='batch')requireAdmin();
    const cursor=data.cursor?id(data.cursor):'';
    const notes=await tx.list('reviewNotes',{owner:admin?null:uid,cursor,limit:100});
    const checks=action==='list'?await tx.list('reviewChecks',{owner:admin?null:uid,cursor:data.checkCursor?id(data.checkCursor):'',limit:100}):[];
    const visible=[];for(const n of notes){try{await quizAccess(n.quizId);visible.push(n);}catch(e){if(e.code!=='permission-denied')throw e;}}
    const eligible=n=>n.status!=='done'&&n.approval!=='rejected'&&(n.authorRole==='admin'||n.approvedContentRevision===n.contentRevision);
    return {notes:action==='batch'?visible.filter(eligible):visible,checks,nextCursor:notes.length===100?notes.at(-1).id:null,nextCheckCursor:checks.length===100?checks.at(-1).id:null};
   }
   if(action==='create'){
    const clientRequestId=id(data.clientRequestId),noteId=hash(`${uid}:${clientRequestId}`);
    const scene=optional(data.scene,30);if(!SCENES.has(scene))fail('invalid-argument','Unbekannte Prüfszene.');
    const content={text:text(data.text,3000),target:id(data.target),view:id(data.view),build:text(data.build,100),locale:['en','de'].includes(data.locale)?data.locale:'de',scene,quizId:data.quizId?id(data.quizId):'',questionId:data.questionId?id(data.questionId):''};
    await quizAccess(content.quizId);
    if(content.quizId&&content.questionId&&!await tx.get(`quizzes/${content.quizId}/questions/${content.questionId}`))fail('permission-denied','Aufgabe gehört nicht zu diesem Test.');
    const fingerprint=hash(JSON.stringify(content)),old=await tx.get(`reviewNotes/${noteId}`);
    if(old){if(old.createFingerprint!==fingerprint)fail('already-exists','Diese Übertragung wurde bereits mit anderem Inhalt gespeichert.');return {note:old};}
    const n={id:noteId,clientRequestId,createFingerprint:fingerprint,...content,authorId:uid,authorRole:admin?'admin':'teacher',revision:1,contentRevision:1,approval:admin?'not_required':'pending',approvedContentRevision:admin?1:0,status:'open',createdAt:now(),updatedAt:now(),previewEvidence:'',acceptanceEvidence:'',deployedBuild:''};
    tx.set(`reviewNotes/${noteId}`,n);tx.set(`reviewNotes/${noteId}/history/1`,{action,actor:uid,at:now(),revision:1});return {note:n};
   }
   if(action==='check'){
    const checkId=id(data.checkId),definition=catalog.checks.find(c=>c.id===checkId);
    if(!definition||definition.method==='automated'||(data.method&&data.method!=='manual')||!['passed','failed','blocked'].includes(data.result))fail('invalid-argument','Ungültige manuelle Prüfung.');
    const build=text(data.build,100),evidence=text(data.evidence,1500),checkKey=hash(`${uid}:${checkId}:${build}`);
    const old=await tx.get(`reviewChecks/${checkKey}`);const revision=(old?.revision||0)+1;
    const result={id:checkKey,checkId,build,evidence,result:data.result,method:'manual',authorId:uid,updatedAt:now(),revision};
    tx.set(`reviewChecks/${checkKey}`,result);tx.set(`reviewChecks/${checkKey}/history/${revision}`,result);return {check:result};
   }
   if(!['edit','approve','transition'].includes(action))fail('invalid-argument','Unbekannte Aktion.');
   const noteId=id(data.id),old=await tx.get(`reviewNotes/${noteId}`);
   if(!old||(!admin&&old.authorId!==uid))fail('permission-denied','Kein Zugriff auf diesen Hinweis.');
   await quizAccess(old.quizId);
   if(data.revision!==old.revision)fail('aborted','Der Hinweis wurde inzwischen verändert. Bitte aktualisieren; dein Text bleibt erhalten.');
   let patch={};
   if(action==='edit'){
    if(old.status==='working')fail('failed-precondition','Hinweis ist in Arbeit. Bitte einen neuen Hinweis ergänzen.');
    patch={text:text(data.text,3000),contentRevision:old.contentRevision+1,approval:old.authorRole==='admin'?'not_required':'pending',approvedContentRevision:0,status:'open',previewEvidence:'',acceptanceEvidence:'',deployedBuild:''};
   }
   if(action==='approve'){
    requireAdmin();if(typeof data.approved!=='boolean')fail('invalid-argument','Freigabe fehlt.');
    patch={approval:data.approved?'approved':'rejected',approvedContentRevision:data.approved?old.contentRevision:0};
   }
   if(action==='transition'){
    requireAdmin();if(!['open','working','review','done'].includes(data.status))fail('invalid-argument','Ungültiger Status.');
    if(data.status!=='open'&&(old.approval==='rejected'||(old.authorRole!=='admin'&&old.approvedContentRevision!==old.contentRevision)))fail('failed-precondition','Diese Fassung ist noch nicht freigegeben.');
    patch={status:data.status};
    if(data.status==='review')patch.previewEvidence=text(data.evidence,1000);
    if(data.status==='done'){if(old.status!=='review')fail('failed-precondition','Zuerst zur Prüfung bereitstellen.');patch.acceptanceEvidence=text(data.evidence,1000);}
    if(data.deployedBuild)patch.deployedBuild=text(data.deployedBuild,100);
   }
   const n={...old,...patch,revision:old.revision+1,updatedAt:now()};
   tx.set(`reviewNotes/${noteId}`,n);tx.set(`reviewNotes/${noteId}/history/${n.revision}`,{action,actor:uid,at:now(),patch,revision:n.revision});return {note:n};
  });
 }
 return {execute};
}
module.exports={createReviewService};
