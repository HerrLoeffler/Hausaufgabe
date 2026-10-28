import {canonicalDecisionState,canonicalJson,decisionQuestionSnapshot} from './wilma-decision-state.mjs';
// Keep the existing whole-form teacher save; compare the opened source in the
// same transaction so a newer Wilma decision cannot be silently overwritten.
export async function writeWholeTeacherReview({db,doc,runTransaction,scope,patch,getActor}){
 const sameActor=()=>getActor()?.uid===scope?.uid&&getActor()?.quizId===scope?.quizId;
 if(!scope||!sameActor())throw Error('Konto oder Test wurde gewechselt.');
 const ref=doc(db,'quizzes',scope.quizId,'submissions',scope.submissionId);
 await runTransaction(db,async tx=>{
  const [submission,quiz,...questions]=await Promise.all([tx.get(ref),tx.get(doc(db,'quizzes',scope.quizId)),...scope.questions.map(q=>tx.get(doc(db,'quizzes',scope.quizId,'questions',q.id)))]);
  if(!sameActor())throw Error('Konto oder Test wurde gewechselt.');
  if(!submission.exists()||!quiz.exists()||quiz.data().ownerId!==scope.uid||quiz.data().isDeleted||quiz.data().rightsHold)throw Error('Kein Zugriff auf diese Abgabe.');
  const current=submission.data();
  if(canonicalDecisionState(current)!==scope.state||canonicalJson(quiz.data().updatedAt??null)!==scope.quizUpdatedAt||questions.some((q,i)=>!q.exists()||decisionQuestionSnapshot(q.data())!==scope.questions[i].version))throw Error('Bewertung oder Aufgabe wurde geändert. Bitte Ergebnisse aktualisieren.');
  if(Object.values(current.grading||{}).some(g=>g.reviewIssue==='incomplete-transfer'))throw Error('Technische Übertragung zuerst klären.');
  if(Object.keys(patch.grading||{}).length!==scope.questions.length||scope.questions.some(q=>!patch.grading[q.id]))throw Error('Bewertung unvollständig.');
  const grading=Object.fromEntries(Object.entries(patch.grading).map(([id,g])=>[id,{...g,needsReview:false,reviewState:'confirmed'}]));
  tx.update(ref,{...patch,grading});
 });
 if(!sameActor())throw Error('Konto wurde gewechselt. Bitte Ergebnisse aktualisieren.');
}
