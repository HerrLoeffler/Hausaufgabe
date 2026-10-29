import {readFileSync} from 'node:fs';
const system=JSON.parse(readFileSync(new URL('./system.json',import.meta.url),'utf8'));
const schema=JSON.parse(readFileSync(new URL('./schema.json',import.meta.url),'utf8'));
export function createWilmaProvider({client,model,recordUsage=async()=>{}}){
 return async(task,{uid})=>{
  const result=await client.responses.create({model,service_tier:'default',store:false,max_output_tokens:4500,input:[{role:'system',content:system},{role:'user',content:JSON.stringify(task)}],text:{format:{type:'json_schema',name:'gradecrew_wilma_review_v1',strict:true,schema}}},{timeout:120000,maxRetries:0});
  const incomplete=message=>Object.assign(Error(message),{usage:result.usage});
  if(result.status!=='completed')throw incomplete('KI-Antwort nicht vollständig.');
  const parts=(result.output||[]).flatMap(item=>item.content||[]);
  if(parts.some(part=>part.type==='refusal'))throw incomplete('Keine Bewertung.');
  let parsed;try{parsed=JSON.parse(parts.filter(part=>part.type==='output_text').map(part=>part.text).join(''));}catch{throw incomplete('Bewertungsformat unklar.');}
  await recordUsage(uid,'assistant',result.usage||{},{operation:'wilma_review',model:result.model||model}).catch(()=>{});
  return {...parsed,requestId:result.id,model:result.model||model,usage:result.usage};
 };
}
