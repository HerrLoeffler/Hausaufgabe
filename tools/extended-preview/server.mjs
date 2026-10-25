import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createExtendedService} from './service.mjs';import {createAiBridge} from './ai-bridge.mjs';import {createRequire} from 'node:module';import {allowLocalRequest} from '../review-preview/policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),port=Number(process.env.EXTENDED_PORT||8784);const folder=process.env.EXTENDED_STATE_DIR||path.join(root,'.review-local/extended');await fs.mkdir(folder,{recursive:true});const dataFile=path.join(folder,'synthetic-state.json');let state;try{state=JSON.parse(await fs.readFile(dataFile,'utf8'));}catch{}
let persistTail=Promise.resolve();
const persist=data=>{const snapshot=JSON.stringify(data);const operation=persistTail.then(async()=>{const tmp=dataFile+'.tmp';await fs.writeFile(tmp,snapshot,{mode:0o600});await fs.rename(tmp,dataFile);});persistTail=operation.catch(()=>{});return operation;};
state??={draft:null,published:null,attempts:{}};
let ai=null;
if(process.env.EXTENDED_AI==='1'){const require=createRequire(import.meta.url);const access=require('../visual-pilot/access.cjs');ai=createAiBridge({state,persist,call:access.call,read:access.read,uid:access.UID});}
const service=createExtendedService({state,persist,ai});
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
const csp="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-src 'self'";
const server=http.createServer(async(req,res)=>{try{
 res.setHeader('Content-Security-Policy',csp);
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return json(res,403,{message:'Loopback only'});
 const url=new URL(req.url,'http://127.0.0.1:'+port);
 if(req.method==='POST'){
  if(!allowLocalRequest(req.headers,port)||!url.pathname.startsWith('/__extended/'))return json(res,403,{message:'Same origin required'});
  let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>500000)throw Error('Beispieldaten zu groß.');}
  return json(res,200,await service.execute(url.pathname.slice('/__extended/'.length),JSON.parse(raw||'{}')));
 }
 if(req.method!=='GET')return json(res,405,{});
 if(url.pathname==='/__extended/status')return json(res,200,{aiEnabled:Boolean(ai),environment:'local-review'});
 if(url.pathname==='/release.json')return json(res,200,{commit:'local-extended-prototype',version:'gc45 + visual prototype',project:'local-review'});
 if(url.pathname==='/firebase-config.js'){res.writeHead(200,{'Content-Type':'text/javascript'});return res.end('export const firebaseConfig={projectId:"local-review"};export const appEnvironment="local-review";');}
 let name=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
 if(name.split('/').some(s=>s.startsWith('.')||s==='..')||name.startsWith('docs/')||name.startsWith('workstreams/')||name.startsWith('tools/visual-pilot/')||name.startsWith('functions/')||name.startsWith('assessment-functions/')||name.includes('node_modules')||! /\.(js|mjs|html|css|svg|png|webp|jpg|json|mp3|wav|woff2)$/.test(name)||name.startsWith('tools/extended-preview/')&&!['tools/extended-preview/client.mjs','tools/extended-preview/firebase-fixture.mjs','tools/extended-preview/ai-client.mjs','tools/extended-preview/layout-probe.html'].includes(name))return json(res,403,{});
 const real=await fs.realpath(path.join(root,name));if(!real.startsWith(root+path.sep))return json(res,403,{});
 let content=await fs.readFile(real);const ext=path.extname(name);if(['.js','.mjs','.html'].includes(ext))content=content.toString().replace(/https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-[\w-]+\.js/g,'/tools/extended-preview/firebase-fixture.mjs');
 if(ext==='.html')content=content.replace('</head>','<script type="module" src="/tools/extended-preview/client.mjs"></script></head>');
 const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
 res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);
 }catch(e){json(res,e.code==='ENOENT'?404:400,{message:e.message,code:e.code||'failed-precondition'});}});
server.listen(port,'127.0.0.1',()=>console.log(`GradeCrew extended prototype: http://127.0.0.1:${port}/ · local test environment`));
