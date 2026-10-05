import {createSnapshotReader} from './connection.mjs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const port=Number(process.env.GC_CONTROL_PORT??4318);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Ungültiger lokaler Port.');
const base=`http://127.0.0.1:${port}`;
async function read(){
 const r=await fetch(base+'/api/bootstrap',{signal:AbortSignal.timeout(2000)});
 if(!r.ok)throw Error('Lokale Zentrale antwortet nicht korrekt.');
 const d=await r.json();
 if(d.service!=='gradecrew-control'||d.bridgeVersion!==1)throw Error('Eine ältere oder andere lokale App läuft. GradeCrew neu starten; keine Daten wurden verändert.');
 return d;
}
async function ensure(){
 try{return await read();}catch(e){
  // Only absence of a listener permits startup; never replace an existing service.
  if(e.cause?.code!=='ECONNREFUSED'||process.env.GC_CONTROL_NO_AUTOSTART==='1')throw e;
 }
 const child=spawn(process.execPath,[join(root,'server.mjs')],{cwd:root,detached:true,stdio:'ignore',env:process.env});
 child.unref();
 await new Promise((resolve,reject)=>{child.once('error',reject);child.once('spawn',resolve);});
 for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,100));try{return await read();}catch(e){if(e.cause?.code!=='ECONNREFUSED')throw e;}}
 throw Error('Lokale Zentrale konnte nicht starten.');
}
export const snapshot=createSnapshotReader(ensure);
export async function post(path,body){
 const s=await snapshot();
 const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json',origin:base,'x-gc-token':s.token},body:JSON.stringify(body),signal:AbortSignal.timeout(5000)});
 const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error??'Speichern fehlgeschlagen.'),{status:r.status});return d;
}
