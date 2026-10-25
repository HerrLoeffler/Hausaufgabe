const key='gradecrew-local-ai-request-v1';
let running=false;
async function post(action,data){const r=await fetch('/__extended/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok){const e=Error(d.message||'Die Test-KI ist nicht erreichbar.');e.code=d.code;throw e;}return d;}
export async function runExtendedAi(kind,payload,{onProgress=()=>{},consume=true}={}){
 if(running)throw Error('Ein KI-Auftrag läuft bereits.');
 running=true;
 let request;
 try{
  const pending=localStorage.getItem(key);const inputHash=payload===null?null:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload))))).map(x=>x.toString(16).padStart(2,'0')).join('');request=pending?JSON.parse(pending):{requestId:crypto.randomUUID(),kind,inputHash};
  if(pending&&payload!==null&&request.inputHash!==inputHash)throw Error('Der gespeicherte KI-Auftrag gehört zu anderen Eingaben. Bitte oben ausdrücklich fortsetzen.');
  if(request.kind!==kind)throw Error('Zuerst den laufenden KI-Auftrag fortsetzen.');
  if(!pending){localStorage.setItem(key,JSON.stringify(request));try{await post('ai-start',{...request,payload});}catch(e){if(e.code==='invalid-argument')localStorage.removeItem(key);throw e;}}
  const started=Date.now();let failures=0;
  while(Date.now()-started<15*60*1000){
   let job;
   try{job=await post('ai-status',{requestId:request.requestId});failures=0;}catch(e){if(++failures>3)throw e;onProgress('Verbindung unterbrochen. Der gespeicherte Auftrag bleibt erhalten.');await new Promise(r=>setTimeout(r,2000));continue;}
   if(job.status==='ready'){if(consume)localStorage.removeItem(key);return job.result;}
   if(job.status==='failed'){localStorage.removeItem(key);throw Error(job.message||'Die KI konnte den Auftrag nicht abschließen.');}
   if(job.status==='uncertain')throw Error((job.message||'Der KI-Status muss geprüft werden.')+' Kein automatischer Neustart.');
   onProgress(kind==='generate'?'Remy erstellt und prüft neue Aufgaben …':'Die KI überarbeitet die Aufgaben …');
   await new Promise(r=>setTimeout(r,1800));
  }
  throw Error('Der Auftrag bleibt gespeichert. Mit „KI-Auftrag fortsetzen“ später erneut nachsehen.');
 }finally{running=false;}
}
export async function resumeExtendedAi(options){const value=localStorage.getItem(key);if(!value)throw Error('Kein gespeicherter KI-Auftrag vorhanden.');const request=JSON.parse(value);return {kind:request.kind,requestId:request.requestId,result:await runExtendedAi(request.kind,null,{...options,consume:false})};}

export function acknowledgeExtendedAi(requestId){const pending=JSON.parse(localStorage.getItem(key)||'null');if(pending?.requestId===requestId)localStorage.removeItem(key);}
