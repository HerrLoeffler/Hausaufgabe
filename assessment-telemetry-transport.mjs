// Explicit opt-in adapter. No storage, DOM capture or cross-account queue.
export function createOperationTelemetry({enabled=false,release,send,newId=()=>crypto.randomUUID(),clock=()=>performance.now(),now=()=>new Date(),capacity=100}={}){
 if(!Number.isInteger(capacity)||capacity<1||capacity>100)throw new TypeError('Invalid capacity');
 let queue=[],scope=null,inFlight=null,generation=0,dropped=0,rejected=0;
 function setScope(next){generation++;queue=[];scope=next?structuredClone(next):null;}
 async function flush(){
  if(!enabled||!scope||!queue.length)return false;
  if(inFlight)return inFlight;
  const epoch=generation,batch=queue.slice(0,20),currentScope=structuredClone(scope);
  inFlight=(async()=>{try{await send({scope:currentScope,release,events:batch});if(generation===epoch){const ids=new Set(batch.map(e=>e.id));queue=queue.filter(e=>!ids.has(e.id));}return true;}catch{rejected++;return false;}finally{inFlight=null;}})();
  return inFlight;
 }
 async function measure(action,operation,{trigger='unspecified',getScope}={}){
  if(!enabled)return operation();
  let start=0;try{start=clock();}catch{}const epoch=generation;let outcome='ok',code='none',reference='';
  try{const value=await operation();reference=value?.diagnosticReference||'';return value;}catch(error){
   outcome='failed';reference=error?.reference||'';
   const c=error?.code;code=c==='unavailable'?'network':c==='deadline-exceeded'?'timeout':c==='permission-denied'?'permission':c==='invalid-argument'?'validation':'unexpected';throw error;
  }finally{
   // Instrumentation is best effort even when clock/crypto/send fails.
   try{if(epoch===generation){const resolved=getScope?.();if(resolved&&JSON.stringify(resolved)!==JSON.stringify(scope)){generation++;queue=[];scope=structuredClone(resolved);}if(scope){const durationMs=Math.min(86400000,Math.max(0,Math.round(clock()-start)));
    queue.push({id:newId(),at:now().toISOString(),action,outcome,code,durationMs,trigger,reference:/^ASM-[A-Za-z0-9-]{1,80}$/.test(reference)?reference:''});
    if(queue.length>capacity){queue.shift();dropped++;}void flush();
   }}}catch{dropped++;}
  }
 }
 return {measure,flush,setScope,clear:()=>setScope(null),health:()=>({queued:queue.length,dropped,rejected})};
}
