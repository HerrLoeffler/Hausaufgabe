export function createLocalSchoolClient({port,fetchImpl=globalThis.fetch}){
 async function request(body){
  const uid=port.getSession()?.uid;if(!uid)throw Error('Bitte zuerst anmelden.');
  const token=await port.getAuthToken();if(port.getSession()?.uid!==uid)throw Error('account-changed');
  const response=await fetchImpl('/api/classroom/school',{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});
  const result=await response.json();if(port.getSession()?.uid!==uid)throw Error('account-changed');
  if(!response.ok){const e=Error(result.error?.message||'Die Schulverwaltung konnte nicht geladen werden.');e.code=result.error?.code;throw e;}
  if(!Number.isSafeInteger(result.revision))throw Error('Die Antwort der Schulverwaltung ist ungültig.');return result;
 }
 return {read:()=>request(),previewSetup:payload=>request({command:'previewSchoolSetup',payload}),command:(command,payload,state,operationId=crypto.randomUUID())=>request({command,payload,expectedRevision:state.revision,contextId:state.currentSchool?.id||null,operationId})};
}
