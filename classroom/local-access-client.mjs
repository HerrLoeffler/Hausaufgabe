export function createLocalAccessClient({port,fetchImpl=globalThis.fetch}){
 return {async request(command,payload){
  const uid=port.getSession()?.uid;if(!uid)throw Error('Bitte zuerst anmelden.');const token=await port.getAuthToken();if(port.getSession()?.uid!==uid)throw Error('account-changed');
  const response=await fetchImpl('/api/classroom/access',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({command,payload}),cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(20000)});
  const result=await response.json();if(port.getSession()?.uid!==uid)throw Error('account-changed');if(!response.ok){const e=Error(result.error?.message||'Schülerzugänge gerade nicht erreichbar.');e.code=result.error?.code;throw e;}return result;
 }};
}
