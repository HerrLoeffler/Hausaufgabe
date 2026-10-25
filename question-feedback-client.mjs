import {createReviewStorage} from './review-store.mjs';

// Reuses the review outbox database. A local record is never a server receipt.
export function createQuestionFeedbackClient({storage=createReviewStorage(),api,project,now=Date.now}={}){
 let uid='',epoch=0,writes=Promise.resolve();const flights=new Map();
 const allowed=['hausaufgabe-staging','gradecrew-staging-2026'].includes(project);
 const keyFor=owner=>`question-feedback-v4:${project}:${owner}`;
 const change=(key,fn)=>{const task=writes.catch(()=>{}).then(async()=>storage.update?storage.update(key,fn):storage.put(key,fn(await storage.get(key))));writes=task;return task;};
 const state=async key=>{await writes.catch(()=>{});return await storage.get(key)||{queue:[],receipts:[]};};
 async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 function flush(){
  if(!allowed||!uid)return Promise.resolve();const owner=uid,key=keyFor(owner),e=epoch;
  if(flights.has(key))return flights.get(key);
  const task=(async()=>{
   for(const record of (await state(key)).queue){
    if(e!==epoch)return;
    try{
     const result=await api(record.payload,{uid:owner});
     if(result?.confirmed!==true)throw new Error('Serverbestätigung fehlt.');
     await change(key,current=>{const s=current||{queue:[],receipts:[]};return {queue:s.queue.filter(x=>x.id!==record.id),receipts:[...s.receipts.filter(x=>x.id!==record.id),{id:record.id,serverId:result.id,at:now()}].slice(-100)};});
    }catch(error){const terminal=['invalid-argument','permission-denied','failed-precondition','already-exists'].includes(String(error?.code||'').replace(/^functions\//,''));await change(key,current=>{const s=current||{queue:[],receipts:[]};return {...s,queue:s.queue.map(x=>x.id===record.id?{...x,terminal,error:String(error?.message||'Übertragung ausstehend').slice(0,200)}:x)};});if(!terminal)break;}
   }
  })().finally(()=>flights.delete(key));flights.set(key,task);return task;
 }
 return {
  setSession(value){epoch++;uid=value||'';},
  async submit(payload){
   if(!allowed||!uid)throw new Error('Bitte in der vorgesehenen Umgebung anmelden.');
   const e=epoch,key=keyFor(uid),id='qf-'+await digest(JSON.stringify(payload));
   if(e!==epoch)return {confirmed:false,accountChanged:true};
   await change(key,current=>{const s=current||{queue:[],receipts:[]};if(s.receipts.some(x=>x.id===id)||s.queue.some(x=>x.id===id))return s;if(s.queue.length>=100)throw new Error('Feedbackausgang ist voll. Bitte zuerst ausstehende Rückmeldungen übertragen.');return {...s,queue:[...s.queue,{id,payload:{action:'recordQuestionFeedback',clientRequestId:id,...structuredClone(payload)},at:now()}]};});
   if(e!==epoch)return {confirmed:false,accountChanged:true};
   await flush();const receipt=(await state(key)).receipts.find(x=>x.id===id);
   return {confirmed:e===epoch&&Boolean(receipt),id:receipt?.serverId,pending:!receipt};
  },
  flush,
  async discard(id){if(!uid)return;const key=keyFor(uid);await change(key,current=>{const s=current||{queue:[],receipts:[]};return {...s,queue:s.queue.filter(x=>x.id!==id)};});},
  async pending(){return uid?(await state(keyFor(uid))).queue:[];}
 };
}
