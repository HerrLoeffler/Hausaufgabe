import {readFile} from 'node:fs/promises';
import {buildHandoff} from './public/shared.mjs';
const base='http://127.0.0.1:4318';
const [cmd='list',id,arg,model]=process.argv.slice(2);
const response=await fetch(base+'/api/bootstrap');if(!response.ok)throw Error('Lokale App nicht erreichbar.');
const data=await response.json();if(data.service!=='gradecrew-control')throw Error('Unerwarteter Dienst.');
const actor=process.env.GC_CONTROL_ACTOR??'Codex';
const drafts=data.state.drafts;
if(cmd==='list')console.log(JSON.stringify(drafts.map(d=>({id:d.id,taskId:d.taskId,status:d.status,model:d.model,effort:d.effort,route:d.route,text:d.text,result:d.result})),null,2));
else{
 const draft=drafts.find(d=>d.id===id||d.requestId===id);if(!draft)throw Error('Auftrags-ID nicht gefunden.');
 const task=[...data.catalog.tasks,...data.state.tasks].find(t=>t.id===draft.taskId);
 if(cmd==='show')console.log(buildHandoff(task,draft));
 else if(['claim','complete','block'].includes(cmd)){
  const body=cmd==='claim'?{id:draft.id,status:'running',actor,model:arg}:{id:draft.id,status:cmd==='complete'?'completed':'blocked',actor,result:await readFile(arg,'utf8')};
  if(cmd==='claim'&&!arg)throw Error('Tatsächlich verwendetes Modell angeben. Die App kann das Modell nicht umschalten.');
  const r=await fetch(base+'/api/drafts/update',{method:'POST',headers:{'content-type':'application/json','origin':base,'x-gc-token':data.token},body:JSON.stringify(body)});const out=await r.json();if(!r.ok)throw Error(out.error);console.log(JSON.stringify(out.draft,null,2));
 }else throw Error('Befehle: list, show ID, claim ID MODELL, complete ID ERGEBNISDATEI, block ID ERGEBNISDATEI');
}
