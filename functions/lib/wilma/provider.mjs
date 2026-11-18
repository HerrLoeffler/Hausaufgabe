import {readFileSync} from 'node:fs';
import {safeRequestId} from './failure.mjs';
const system=JSON.parse(readFileSync(new URL('./system.json',import.meta.url),'utf8'));
const schema=JSON.parse(readFileSync(new URL('./schema.json',import.meta.url),'utf8'));
export function createWilmaProvider({client,model,recordUsage=async()=>{}}){
 return async(task,{uid})=>{
  const constrained=structuredClone(schema),properties=constrained.properties.answers.items.properties;
  if(Number.isFinite(task.maximum)&&task.maximum>0&&task.maximum<=100&&task.maximum*2%1===0)properties.points.enum=[...Array.from({length:task.maximum*2+1},(_,i)=>i/2),null];
  if(Array.isArray(task.answers)&&task.answers.length)properties.id.enum=task.answers.map(a=>a.id);
  let result;
  try{result=await client.responses.create({model,service_tier:'default',store:false,max_output_tokens:4500,input:[{role:'system',content:system},{role:'user',content:JSON.stringify(task)}],text:{format:{type:'json_schema',name:'gradecrew_wilma_review_v1',strict:true,schema:constrained}}},{timeout:120000,maxRetries:0});}
  catch(error){const reasonCode=error?.name==='APIConnectionTimeoutError'?'provider_timeout':[401,403].includes(error?.status)?'provider_access':error?.status===429?'provider_capacity':'provider_unavailable';throw Object.assign(Error('KI-Verbindung konnte nicht sicher abgeschlossen werden.'),{reasonCode,requestId:safeRequestId(error?.request_id)});}
  const incomplete=(message,reasonCode)=>Object.assign(Error(message),{usage:result.usage,reasonCode,requestId:safeRequestId(result.id)});
  if(result.status!=='completed')throw incomplete('KI-Antwort nicht vollständig.','provider_incomplete');
  const parts=(result.output||[]).flatMap(item=>item.content||[]);
  if(parts.some(part=>part.type==='refusal'))throw incomplete('Keine Bewertung.','provider_refusal');
  let parsed;try{parsed=JSON.parse(parts.filter(part=>part.type==='output_text').map(part=>part.text).join(''));}catch{throw incomplete('Bewertungsformat unklar.','provider_format');}
  await recordUsage(uid,'assistant',result.usage||{},{operation:'wilma_review',model:result.model||model}).catch(()=>{});
  return {...parsed,requestId:result.id,model:result.model||model,usage:result.usage};
 };
}
