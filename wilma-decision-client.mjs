import {canonicalDecisionState,decisionQuestionSnapshot} from './wilma-decision-state.mjs';
const hex=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),n=>n.toString(16).padStart(2,'0')).join('');
export function createWilmaDecisionClient({getUid,request}){
 return async({quizId,submissionId,questionId,questions,expected,decision,undoOperationId,operationId=crypto.randomUUID()})=>{
  const uid=getUid();if(!uid)throw new Error('Bitte erneut anmelden.');
  const payload={action:'decision',quizId,submissionId,questionId,operationId,expectedState:await hex(canonicalDecisionState(expected)),expectedQuestions:Object.fromEntries(await Promise.all(questions.map(async q=>[q.id,await hex(decisionQuestionSnapshot(q))])))};
  if(undoOperationId)payload.undoOperationId=undoOperationId;else payload.decision=decision;
  if(getUid()!==uid)throw new Error('Das Konto wurde gewechselt.');
  let result;
  try{result=await request(payload);}catch(error){if(String(error.code||'').startsWith('functions/'))throw error;throw new Error('Speicherausgang unklar. Bitte Ergebnisse aktualisieren, bevor du erneut bewertest.');}
  if(getUid()!==uid)throw new Error('Das Konto wurde gewechselt. Bitte Ergebnisse aktualisieren.');
  if(result.operationId!==operationId||result.submissionId!==submissionId||result.questionId!==questionId||!Number.isSafeInteger(result.revision)||result.revision<1||result.patch?.wilmaDecisionRevision!==result.revision)throw new Error('Speicherbeleg unklar. Bitte Ergebnisse aktualisieren.');
  return result;
 };
}
