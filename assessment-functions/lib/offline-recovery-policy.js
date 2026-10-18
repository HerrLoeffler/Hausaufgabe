'use strict';
const MAX_RECOVERY_AGE=7*86400000;
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
// This is a late-delivery quarantine, never evidence that a client finished on time.
function offlineRecovery({requested,now,startedAt,deadlineAt,quiz,sameRun,status,reason}) {
 if(requested!==true)return null;
 if(!quiz||quiz.isDeleted===true||quiz.rightsHold===true)fail('failed-precondition','Dieser Test ist gesperrt; der lokale Stand bleibt erhalten.');
 if(status!=='running'||!Number.isFinite(startedAt)||startedAt<=0||now<startedAt)fail('failed-precondition','Kein gestarteter Versuch für die Wiederherstellung.');
 if(now-startedAt>MAX_RECOVERY_AGE)fail('deadline-exceeded','Die siebentägige Wiederherstellungsfrist ist abgelaufen. Bitte die Lehrkraft informieren; der lokale Stand bleibt erhalten.');
 if(sameRun!==true)return {review:true,reason:'changed_round'};
 if(quiz.published!==true||quiz.ended===true)return {review:true,reason:'closed_round'};
 if(Number.isFinite(deadlineAt)&&now>deadlineAt+30000)return {review:true,reason:'late_delivery'};
 if(reason==='last_saved_snapshot')return {review:true,reason:'last_saved_snapshot'};
 return {review:false,reason:null};
}
module.exports={offlineRecovery};
