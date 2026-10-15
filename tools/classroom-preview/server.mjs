import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {sampleCsv} from '../../classroom/csv.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
export function createPreviewServer(){return http.createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Read-only preview');return;}
  if(!/^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host||'')){res.writeHead(403);res.end('Loopback only');return;}
  const u=new URL(req.url,'http://127.0.0.1');
  if(u.pathname==='/release.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({version:'2.3.1-gc39-local-classroom',environment:'local-classroom',commit:'8f8697901f8c1aea89897be855ca2872c82d0f2b'}));return;}
  if(u.pathname==='/samples.csv'){const kind=u.searchParams.get('kind')||'pupils';res.writeHead(200,{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="gradecrew-synthetisch-${kind.replace(/[^a-z-]/g,'')}.csv"`,'Cache-Control':'no-store'});res.end('\uFEFF'+sampleCsv(kind));return;}
  const relative=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname);if(relative.split('/').some(p=>p==='..'||p.startsWith('.'))){res.writeHead(404);res.end();return;}
  const target=path.resolve(root,'.'+relative);if(!target.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
  let data=await fs.readFile(target);
  if(relative==='/index.html'){
   const imports=Object.fromEntries(['app','auth','firestore','functions','storage'].map(name=>[`https://www.gstatic.com/firebasejs/12.4.0/firebase-${name}.js`,'/classroom/demo-sdk.mjs']));
   data=Buffer.from(data.toString().replace('<head>','<head>\n<script>window.__GRADECREW_CLASSROOM_PREVIEW__=true;</script>\n<script type="importmap">'+JSON.stringify({imports})+'</script>\n<link rel="stylesheet" href="/classroom/classroom.css">'));
  }
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-src 'self'; base-uri 'self'; form-action 'none'",'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.GC_CLASSROOM_PORT||8782);createPreviewServer().listen(port,'127.0.0.1',()=>console.log(`GradeCrew local classroom preview: http://127.0.0.1:${port}/`));}
