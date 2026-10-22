'use strict';
const {hash}=require('./classroom-service');
const {assessmentRunId}=require('./assessment-run-id');
const safe=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
async function readClassroomStart({get,fail,now,quizId,quiz,attemptId,data}){
 const policy=await get(`classroomQuizPolicies/${quizId}`),runId=assessmentRunId(quiz,quizId,fail);
 if(!policy?.required||policy.sessionRunId!==runId){if(data.classroomAssignment)fail('failed-precondition','Diese persönliche Zuweisung gehört nicht zur aktuellen Testrunde.');return null;}
 if(typeof data.classroomSession!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(data.classroomSession))fail('unauthenticated','Bitte mit deinem persönlichen Schülercode anmelden.');
 const session=await get(`classroomSessions/${hash(data.classroomSession)}`);
 if(!session||session.expiresAt<=now||(session.deviceMode==='shared'&&session.lastActivity+300000<=now))fail('unauthenticated','Bitte deinen persönlichen Schülercode erneut eingeben.');
 if(session.schoolId!==policy.schoolId||!safe(data.classroomAssignment))fail('permission-denied','Dieser Test ist dir nicht zugewiesen.');
 const base=`classroomSchools/${session.schoolId}`,aPath=`${base}/assignments/${data.classroomAssignment}`;
 const [p,a,participant]=await Promise.all([get(`${base}/students/${session.studentId}`),get(aPath),get(`${aPath}/participants/${session.studentId}`)]);
 if(!p||p.status!=='active'||p.accessVersion!==session.accessVersion||!a||a.quizId!==quizId||a.sessionRunId!==runId||!a.recipientIds?.includes(session.studentId))fail('permission-denied','Dieser Test ist dir nicht mehr zugewiesen.');
 const generation=participant?.generation||0;
 if(data.classroomGeneration!==generation)fail('failed-precondition','Die Lehrkraft hat einen neuen Versuch freigegeben. Bitte deine Testübersicht aktualisieren.');
 if(participant?.attemptId&&participant.attemptId!==attemptId)fail('already-exists','Für dich besteht bereits ein Versuch. Bitte auf demselben Gerät fortsetzen oder die Lehrkraft um Hilfe bitten.');
 return {studentName:`${p.firstName} ${p.lastName}`,metadata:{schoolId:session.schoolId,studentId:session.studentId,assignmentId:data.classroomAssignment,generation},path:`${aPath}/participants/${session.studentId}`,participant:{...participant,generation,attemptId},needsWrite:!participant?.attemptId};
}
async function checkClassroomAttempt({get,fail,attempt}){
 if(!attempt.classroom){
  const policy=await get(`classroomQuizPolicies/${attempt.quizId}`);
  if(policy?.required&&policy.sessionRunId===attempt.sessionRunId)fail('permission-denied','Diese Runde ist jetzt persönlich zugewiesen. Bitte mit dem persönlichen Schülerzugang anmelden.');
  return;
 }
 const b=attempt.classroom,p=await get(`classroomSchools/${b.schoolId}/assignments/${b.assignmentId}/participants/${b.studentId}`);
 if(!p||p.attemptId!==attempt.attemptId||p.generation!==b.generation)fail('failed-precondition','Die Lehrkraft hat diesen Versuch ersetzt. Deine gesicherten Antworten bleiben erhalten; bitte wende dich an die Lehrkraft.');
}
module.exports={readClassroomStart,checkClassroomAttempt};
