// Shared receipt boundary for Wilma in the existing results screen.
// Transport is supplied by the host; this module never calls a provider or writes grades.
export function validateWilmaReceipt(receipt,{answerIds,maxPoints}) {
 const expected=new Set(answerIds);
 const invalid=()=>{throw new Error('Wilma-Vorschläge konnten nicht vollständig zugeordnet werden. Vorhandene Punkte bleiben erhalten.');};
 if(!Array.isArray(answerIds)||!answerIds.length||expected.size!==answerIds.length||!Number.isFinite(maxPoints)||maxPoints<=0)invalid();
 if(receipt?.source!=='wilma-ai'||!Array.isArray(receipt.answers)||receipt.answers.length!==expected.size)invalid();
 const seen=new Set();
 for(const row of receipt.answers){
  if(!row||!expected.has(row.id)||seen.has(row.id)||!['clear','uncertain','ungradable'].includes(row.status)||typeof row.reason!=='string'||!row.reason.trim())invalid();
  if(row.status==='ungradable'){if(row.points!==null)invalid();}
  else if(!Number.isFinite(row.points)||row.points<0||row.points>maxPoints||row.points*2%1!==0)invalid();
  seen.add(row.id);
 }
 return receipt;
}
export function createWilmaReviewClient({request}) {
 if(typeof request!=='function')throw new Error('Wilma-Verbindung fehlt.');
 return async payload=>validateWilmaReceipt(await request(payload),payload);
}
