export function createOnlineClient({getToken,getAccountId,fetchImpl=globalThis.fetch}={}){
 async function request(command,payload,teacher){
  const account=teacher?getAccountId?.():null;
  const check=()=>{if(teacher&&getAccountId&&getAccountId()!==account){const e=Error('Das Lehrkraftkonto wurde gewechselt. Bitte erneut öffnen.');e.code='account-changed';throw e;}};
  const headers={'Content-Type':'application/json'};if(teacher){const token=await getToken?.();if(!token)throw Error('Bitte als Lehrkraft anmelden.');check();headers.Authorization=`Bearer ${token}`;}
  const response=await fetchImpl('/api/classroom/online',{method:'POST',headers,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(25000),body:JSON.stringify({command,payload:payload||{}})});
  const result=await response.json();check();if(!response.ok){const e=Error(result.error?.message||'Die Schülerverwaltung ist gerade nicht erreichbar.');e.code=result.error?.code;throw e;}return result;
 }
 return {teacher:(command,payload)=>request(command,payload,true),pupil:(command,payload)=>request(command,payload,false)};
}
