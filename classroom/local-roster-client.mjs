// The existing teacher session remains owned by app.js. Tokens are transient and
// sent only to the same-origin local API; pupil names never go to Firebase here.
export function createLocalRosterClient({port,fetchImpl=globalThis.fetch}){
 async function request(body,{preview=false}={}){
  const uid=port.getSession()?.uid;if(!uid)throw Error('Bitte zuerst anmelden.');
  const token=await port.getAuthToken();if(port.getSession()?.uid!==uid)throw Error('account-changed');
  const response=await fetchImpl('/api/classroom/roster',{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});
  const result=await response.json();if(port.getSession()?.uid!==uid)throw Error('account-changed');
  if(!response.ok){const error=Error(result.error?.message||'Der lokale Bestand ist gerade nicht erreichbar.');error.code=result.error?.code;throw error;}
  if(!Number.isSafeInteger(result.revision)||(preview?typeof result.planHash!=='string'||!Array.isArray(result.rows)||!result.counts:!Array.isArray(result.classes)||!Array.isArray(result.students)))throw Error('Der lokale Bestand konnte nicht gelesen werden.');
  return result;
 }
 return {read:()=>request(),previewTeacherImport:payload=>request({command:'previewTeacherImport',payload},{preview:true}),previewImport:payload=>request({command:'previewStudentImport',payload},{preview:true}),mutate:(command,payload,expectedRevision,operationId)=>request({command,payload,expectedRevision,operationId})};
}
