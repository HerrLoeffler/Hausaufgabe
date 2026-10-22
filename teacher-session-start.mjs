// Use Firestore's transaction retry to keep one authoritative start per published run.
export function startTeacherSessionOnce({db,reference,expectedRunId,runTransaction,serverTimestamp}){
 if(typeof expectedRunId!=='string'||!expectedRunId)throw Error('session-changed');
 return runTransaction(db,async transaction=>{
  const snapshot=await transaction.get(reference);if(!snapshot.exists())throw Error('session-closed');
  const quiz=snapshot.data();
  if(!quiz.published||quiz.ended||quiz.isDeleted||quiz.rightsHold||quiz.startMode!=='teacher')throw Error('session-closed');
  if(quiz.sessionRunId!==expectedRunId)throw Error('session-changed');
  if(quiz.sessionState==='running')return 'already-running';
  if(quiz.sessionState!=='waiting')throw Error('session-closed');
  transaction.update(reference,{sessionState:'running',sessionStartedAt:serverTimestamp(),updatedAt:serverTimestamp()});return 'started';
 });
}
