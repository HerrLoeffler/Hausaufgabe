import {handleLocalStudent} from './local-student-api.mjs';
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {sampleCsv} from '../../classroom/csv.mjs';
import {openLocalRoster} from './local-roster-store.mjs';
import {handleLocalRoster,createFirebaseIdentityVerifier} from './local-roster-api.mjs';
import {firebaseConfig} from '../../firebase-config.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
export function renderPreviewDocument(html,{demo=false}={}){
 const styles='<link rel="stylesheet" href="/classroom/classroom.css">';
 if(!demo)return html.replace('<head>','<head>\n<script>window.__GRADECREW_ACCOUNT_WORKSPACE__=true;</script>\n'+styles);
 const imports=Object.fromEntries(['app','auth','firestore','functions','storage'].map(name=>[`https://www.gstatic.com/firebasejs/12.4.0/firebase-${name}.js`,'/classroom/demo-sdk.mjs']));
 return html.replace('<head>','<head>\n<script>window.__GRADECREW_CLASSROOM_PREVIEW__=true;</script>\n<script type="importmap">'+JSON.stringify({imports})+'</script>\n'+styles);
}
export function createPreviewServer({rosterStore,verifyIdentity}={}){
 let localStore=rosterStore;
 const verifier=verifyIdentity||createFirebaseIdentityVerifier({apiKey:firebaseConfig.apiKey,authProjectId:firebaseConfig.projectId});
 const server=http.createServer(async(req,res)=>{
 try{
  if(!/^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host||'')){res.writeHead(403);res.end('Loopback only');return;}
  const u=new URL(req.url,'http://127.0.0.1');
  if(['/api/classroom/roster','/api/classroom/school','/api/classroom/access'].includes(u.pathname)||u.pathname.startsWith('/api/classroom/student/')){
   localStore ||= openLocalRoster(path.resolve(root,'../.gradecrew-local/classroom.sqlite'),{authProjectId:firebaseConfig.projectId});
   if(u.pathname.startsWith('/api/classroom/student/')){await handleLocalStudent(req,res,{access:localStore.access,path:u.pathname});return;}
   await handleLocalRoster(req,res,{store:localStore,verifyIdentity:verifier,school:u.pathname.endsWith('/school'),access:u.pathname.endsWith('/access')});return;
  }
  if(u.pathname.startsWith('/api/')){res.writeHead(404);res.end();return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Read-only preview');return;}
  if(u.pathname==='/release.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({version:'2.3.1-gc39-local-account',environment:'staging',localFrontend:true,commit:'local-development'}));return;}
  if(u.pathname==='/samples.csv'){const kind=u.searchParams.get('kind')||'pupils';res.writeHead(200,{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="gradecrew-synthetisch-${kind.replace(/[^a-z-]/g,'')}.csv"`,'Cache-Control':'no-store'});res.end('\uFEFF'+sampleCsv(kind));return;}
  const demo=u.pathname==='/classroom-demo.html';
  const relative=decodeURIComponent(u.pathname==='/'||demo?'/index.html':u.pathname);if(relative.split('/').some(p=>p==='..'||p.startsWith('.'))){res.writeHead(404);res.end();return;}
  const target=path.resolve(root,'.'+relative);if(!target.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
  const realTarget=await fs.realpath(target);if(!realTarget.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
  let data=await fs.readFile(realTarget);
  if(relative==='/index.html'){
   data=Buffer.from(renderPreviewDocument(data.toString(),{demo}));
  }
  const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
  // The connected page retains the normal hosting behavior (no additional CSP).
  // The explicit synthetic document remains isolated from all remote services.
  if(demo)headers['Content-Security-Policy']="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-src 'self'; base-uri 'self'; form-action 'none'";
  res.writeHead(200,headers);res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
 server.on('close',()=>{if(!rosterStore)localStore?.close();});
 return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.GC_CLASSROOM_PORT||8782);createPreviewServer().listen(port,'127.0.0.1',()=>console.log(`GradeCrew local classroom preview: http://127.0.0.1:${port}/`));}
