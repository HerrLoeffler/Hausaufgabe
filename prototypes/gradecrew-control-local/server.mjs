import http from 'node:http';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {randomUUID,randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,dirname,resolve} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
export async function createApp({stateDir=process.env.GC_CONTROL_STATE_DIR??join(root,'.local'),catalog}={}){
 catalog??=JSON.parse(await readFile(join(root,'data/catalog.json'),'utf8'));
 await mkdir(stateDir,{recursive:true,mode:0o700});
 const file=join(stateDir,'state.json');
 let state={version:1,comments:[],drafts:[],tasks:[]};
 try{state=JSON.parse(await readFile(file,'utf8'));if(state.version!==1||!['comments','drafts','tasks'].every(k=>Array.isArray(state[k])))throw Error('Unbekanntes Datenformat');}catch(e){if(e.code!=='ENOENT')throw Error('Lokale Daten konnten nicht gelesen werden. Sie wurden nicht überschrieben.',{cause:e});}
 const token=randomBytes(32).toString('hex');let writes=Promise.resolve();
 const bad=(message,status=400)=>Object.assign(Error(message),{status});
 const validText=(s,max=10000)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
 const taskExists=id=>[...catalog.tasks,...state.tasks].some(t=>t.id===id);
 const mutate=fn=>{const result=writes.then(async()=>{const next=structuredClone(state);const out=fn(next);await writeFile(file+'.tmp',JSON.stringify(next,null,2),{mode:0o600});await rename(file+'.tmp',file);state=next;return out;});writes=result.catch(()=>{});return result;};
 const assets={'/':'index.html','/index.html':'index.html','/app.mjs':'app.mjs','/shared.mjs':'shared.mjs','/style.css':'style.css'};
 return http.createServer(async(req,res)=>{
  const port=req.socket.localPort;const expected=`127.0.0.1:${port}`;
  const send=(status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
  if(req.headers.host!==expected){send(403,{error:'Nur der lokale Zugriff ist erlaubt.'});return;}
  try{
   const url=new URL(req.url,`http://${expected}`);
   if(req.method==='GET'&&url.pathname==='/api/bootstrap'){send(200,{service:'gradecrew-control',catalog,state,token});return;}
   if(req.method==='GET'&&url.pathname==='/api/export'){res.writeHead(200,{'content-type':'application/json','content-disposition':'attachment; filename="gradecrew-local-backup.json"','cache-control':'no-store'});res.end(JSON.stringify({exportedAt:new Date().toISOString(),sourceCommit:catalog.sourceCommit,state},null,2));return;}
   if(req.method==='GET'&&assets[url.pathname]){
    const name=assets[url.pathname];const ext=name.split('.').pop();
    res.writeHead(200,{'content-type':({html:'text/html',css:'text/css',mjs:'text/javascript'})[ext]+'; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(await readFile(join(root,'public',name)));return;
   }
   if(req.method!=='POST'||!['/api/comments','/api/tasks','/api/drafts','/api/drafts/update'].includes(url.pathname)){send(404,{error:'Nicht vorhanden. Der Prototyp startet keine Aufträge.'});return;}
   if(req.headers.origin!==`http://${expected}`||req.headers['x-gc-token']!==token)throw bad('Lokale Sitzung fehlt oder ist abgelaufen. Bitte neu laden.',403);
   if(!req.headers['content-type']?.startsWith('application/json'))throw bad('JSON erforderlich.');
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>32000)throw bad('Eingabe ist zu groß.',413);}
   let b;try{b=JSON.parse(raw);}catch{throw bad('Ungültige Eingabe.');}if(!b||typeof b!=='object')throw bad('Ungültige Eingabe.');
   const out=await mutate(next=>{
    if(url.pathname==='/api/drafts/update'){
     const draft=next.drafts.find(d=>d.id===b.id);
     if(!draft||!validText(b.actor,100)||!['running','completed','blocked'].includes(b.status))throw bad('Auftrag, Bearbeiter oder Status fehlt.');
     if(b.status==='running'){
      if(draft.status!=='prepared')throw bad('Auftrag wurde bereits übernommen.',409);
      if(draft.route!=='subscription'||b.model!==draft.model)throw bad('Ausführungsweg oder gewähltes Modell stimmt nicht überein.',409);
      draft.actor=b.actor;draft.startedAt=new Date().toISOString();
     }else{
      if(draft.status!=='running'||draft.actor!==b.actor)throw bad('Nur der aktuelle Bearbeiter kann das Ergebnis zuordnen.',409);
      if(!validText(b.result,20000))throw bad('Ergebnisbeschreibung fehlt.');
      draft.result=b.result;draft.finishedAt=new Date().toISOString();
     }
     draft.status=b.status;draft.updatedAt=new Date().toISOString();return {status:200,draft};
    }
    if(url.pathname==='/api/tasks'){
     if(!validText(b.title,180)||!['Audio & Sprache','Internationalisierung','Design & Crew','Games','Schülerverwaltung','App & Geräte','Qualität & Betrieb','Kernfunktionen'].includes(b.area)||!['P0','P1','P2'].includes(b.priority))throw bad('Titel, Bereich und Priorität prüfen.');
     const task={id:'GC-LOCAL-'+randomUUID().slice(0,8).toUpperCase(),title:b.title.trim(),area:b.area,priority:b.priority,stage:'branch_only',stageSource:'Lokale Idee, noch kein Code',statusText:'Lokal erfasst · noch nicht beauftragt',next:'Auftrag konkretisieren.',local:true,createdAt:new Date().toISOString()};next.tasks.push(task);return {status:201,task};
    }
    if(!taskExists(b.taskId)||!validText(b.text))throw bad('Aufgabe oder Text fehlt (maximal 10.000 Zeichen).');
    if(url.pathname==='/api/comments'){const comment={id:randomUUID(),taskId:b.taskId,text:b.text.trim(),createdAt:new Date().toISOString()};next.comments.push(comment);return {status:201,comment};}
    if(b.confirmed!==true||!['gpt-6-luna','gpt-6.1-sol','gpt-6-astra'].includes(b.model)||!['medium','high'].includes(b.effort)||!['subscription','guardian'].includes(b.route)||typeof b.requestId!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(b.requestId))throw bad('Modellwahl und Vorbereitung müssen bestätigt werden.');
    const payload={taskId:b.taskId,text:b.text.trim(),model:b.model,effort:b.effort,route:b.route};
    const existing=next.drafts.find(d=>d.requestId===b.requestId);
    if(existing){if(Object.keys(payload).some(k=>existing[k]!==payload[k]))throw bad('Diese Auftrags-ID gehört zu einem anderen Entwurf.',409);return {status:200,draft:existing};}
    const draft={...payload,requestId:b.requestId,id:randomUUID(),status:'prepared',createdAt:new Date().toISOString()};next.drafts.push(draft);return {status:201,draft};
   });send(out.status,out);
  }catch(e){send(e.status??500,{error:e.status?e.message:'Speichern fehlgeschlagen. Bitte erneut prüfen; nichts wurde als gestartet markiert.'});}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=await createApp();app.listen(Number(process.env.GC_CONTROL_PORT??4318),'127.0.0.1',()=>console.log(`GradeCrew Control: http://127.0.0.1:${app.address().port}`));
 app.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port 4318 ist bereits belegt. Prüfe die bestehende App oder setze GC_CONTROL_PORT.':e.message);process.exitCode=1;});
}
