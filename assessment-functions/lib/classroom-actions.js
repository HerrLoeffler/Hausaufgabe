'use strict';
// Pure action transitions. Callers must authenticate the teacher/pupil/attempt
// and read/write the participant in the same transaction as these transitions.
function resumeState(action,now){return !action?'none':action.expiresAt<=now?'expired':action.acknowledgedAt?'acknowledged':action.deliveredAt?'delivered':'pending';}
function requestResume({previous,actionId,actor,generation,now}){
 if(previous?.generation===generation&&(previous.id===actionId||['pending','delivered'].includes(resumeState(previous,now))))return previous;
 return {id:actionId,actor,generation,createdAt:now,expiresAt:now+600000,deliveredAt:null,acknowledgedAt:null};
}
function receiveResume(action,{generation,now,ackId,fail}){
 if(!action||action.generation!==generation||action.expiresAt<=now){if(ackId)fail('failed-precondition','Diese Fortsetzungsbitte ist nicht mehr aktuell.');return null;}
 if(ackId&&ackId!==action.id)fail('permission-denied','Diese Fortsetzungsbitte gehört nicht zu diesem Versuch.');
 if(ackId&&!action.deliveredAt)fail('failed-precondition','Bitte den Hinweis zuerst öffnen.');
 return {...action,deliveredAt:action.deliveredAt||now,acknowledgedAt:action.acknowledgedAt||(ackId?now:null)};
}
module.exports={requestResume,receiveResume,resumeState};
async function attemptResumeAction({transaction,attempt,now,ackId,fail}){
 if(!attempt.classroom){if(ackId)fail('permission-denied','Dieser Versuch hat keine Fortsetzungsbitte.');return null;}
 const b=attempt.classroom,path=`classroomSchools/${b.schoolId}/assignments/${b.assignmentId}/participants/${b.studentId}`;
 return transaction(async tx=>{const p=await tx.get(path);if(!p||p.attemptId!==attempt.attemptId||p.generation!==b.generation)fail('failed-precondition','Dieser Versuch wurde inzwischen geändert.');const received=receiveResume(p.resumeAction,{generation:b.generation,now,ackId,fail});if(received)tx.set(path,{...p,resumeAction:received});return received;});
}
module.exports.attemptResumeAction=attemptResumeAction;
