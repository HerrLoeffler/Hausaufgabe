import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash,randomUUID} from 'node:crypto';import {createRequire} from 'node:module';import {spawn} from 'node:child_process';
import {sourceFingerprint,testResult} from './fingerprint.mjs';
import {allowLocalRequest} from './policy.mjs';
const require=createRequire(import.meta.url);const {createReviewService}=require('../../functions/lib/review-mode.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');const port=Number(process.env.REVIEW_PORT||8768);const folder=path.join(root,'.review-local');await fs.mkdir(folder,{recursive:true});
const dataFile=path.join(folder,'notes.json');let docs;try{docs=new Map(JSON.parse(await fs.readFile(dataFile,'utf8')));}catch(e){if(e.code!=='ENOENT')throw e;docs=new Map();}
docs.set('users/local-admin',{role:'admin',status:'active'});docs.set('users/local-teacher',{role:'teacher',status:'active'});
let serial=Promise.resolve();const store={transaction:fn=>{const p=serial.catch(()=>{}).then(async()=>{const next=new Map(docs);const value=await fn({get:async key=>structuredClone(next.get(key)||null),set:(key,value)=>next.set(key,structuredClone(value)),list:async(collection,{owner,cursor='',limit=100}={})=>[...next].filter(([k,v])=>k.startsWith(collection+'/')&&k.split('/').length===2&&(!owner||v.authorId===owner)&&k.split('/')[1]>cursor).sort().slice(0,limit).map(([k,v])=>({...structuredClone(v),id:k.split('/')[1]}))});const temp=dataFile+'.tmp';await fs.writeFile(temp,JSON.stringify([...next]),{mode:0o600});await fs.rename(temp,dataFile);docs=next;return value;});serial=p;return p;}};
const service=createReviewService({store,projectId:'hausaufgabe-staging'});let build='',clients=new Set(),running=false;
const fingerprint=()=>sourceFingerprint(root);
build=await fingerprint();const timer=setInterval(async()=>{try{const next=await fingerprint();if(next!==build){build=next;for(const client of clients)client.write(`data: ${JSON.stringify({build})}\n\n`);}}catch{}},1200);
function json(response,status,value){response.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify(value));}
async function body(request){let value='';for await(const chunk of request){value+=chunk;if(value.length>16384)throw new Error('Request too large');}return JSON.parse(value);}
const server=http.createServer(async(request,response)=>{try{
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(request.headers.host)){json(response,403,{message:'Localhost only'});return;}
 const url=new URL(request.url,'http://127.0.0.1:'+port);
 if(request.method==='POST'){
  if(!allowLocalRequest(request.headers,port)){json(response,403,{message:'Same-origin request required'});return;}
  const payload=await body(request);
  if(url.pathname==='/__review/api'){json(response,200,await service.execute({uid:'local-admin',data:payload}));return;}
  if(url.pathname==='/__review/run'){
   if(payload.checkId!=='GC-REVIEW-AUTO'){json(response,400,{message:'Unknown check'});return;}
   if(running){json(response,409,{message:'Eine Prüfung läuft bereits.'});return;}running=true;const sourceBuild=await fingerprint(),runId=randomUUID();let output='';
   const child=spawn(process.execPath,['--experimental-vm-modules','--test','tools/ui/review-scenes.test.cjs','functions/test/review-mode.test.js','tools/ui/review-mode.test.cjs','tools/review-preview/server.test.mjs'],{cwd:root,env:{...process.env},stdio:['ignore','pipe','pipe']});
   child.stdout.on('data',x=>{output=(output+x).slice(-30000);});child.stderr.on('data',x=>{output=(output+x).slice(-30000);});const timeout=setTimeout(()=>child.kill('SIGTERM'),90000);
   const exit=await new Promise(resolve=>{child.once('error',()=>resolve(-1));child.once('close',code=>resolve(code??-1));});clearTimeout(timeout);running=false;
   const afterBuild=await fingerprint();const result={id:runId,checkId:payload.checkId,build:sourceBuild,result:testResult(exit,sourceBuild,afterBuild),method:'automated',evidence:`Lokale Regressionen · Lauf ${runId} · Exit ${exit}`,authorId:'local-admin',updatedAt:Date.now(),summary:sourceBuild!==afterBuild?'Quellstand während des Tests geändert. Bitte erneut prüfen.':output.slice(-3500)};
   await store.transaction(tx=>{tx.set(`reviewChecks/${runId}`,result);});await fs.writeFile(path.join(folder,runId+'.log'),output,{mode:0o600});json(response,200,result);return;
  }
  json(response,404,{message:'Unknown operation'});return;
 }
 if(request.method!=='GET'){json(response,405,{});return;}
 if(url.pathname==='/__review/events'){response.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});response.write(': connected\n\n');clients.add(response);request.on('close',()=>clients.delete(response));return;}
 if(url.pathname==='/release.json'){json(response,200,{commit:build,version:'local-review',project:'isolated-fixtures'});return;}
 if(url.pathname==='/firebase-config.js'){response.writeHead(200,{'Content-Type':'text/javascript'});response.end('export const firebaseConfig={projectId:"local-review"}; export const appEnvironment="local-review";');return;}
 let name=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
 if(name.includes('..')||name.split('/').some(p=>p.startsWith('.'))||name==='functions/main.js'||(name.startsWith('functions/')&&name!=='functions/lib/review-checks.json')||! /\.(html|js|mjs|css|svg|webp|png|jpg|json|wav|mp3|woff2)$/.test(name)){json(response,403,{});return;}
 const full=path.join(root,name),real=await fs.realpath(full);if(!real.startsWith(root+path.sep)||real.includes('node_modules')){json(response,403,{});return;}
 let content=await fs.readFile(real);const ext=path.extname(name),types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
 if(['.js','.mjs','.html'].includes(ext))content=content.toString().replace(/https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-[\w-]+\.js/g,'/tools/review-preview/firebase-fixture.mjs');
 if(ext==='.html')content=content.replace('</head>','<script type="module" src="/tools/review-preview/review-preview-client.mjs"></script></head>');
 response.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'"});response.end(content);
 }catch(error){json(response,error.code==='ENOENT'?404:400,{code:error.code||'invalid-argument',message:error.message});}});
server.listen(port,'127.0.0.1',()=>console.log(`Review preview: http://127.0.0.1:${port} · fixtures only · data ${dataFile}`));
function stop(){clearInterval(timer);for(const client of clients)client.end();server.close();}process.on('SIGTERM',stop);process.on('SIGINT',stop);
