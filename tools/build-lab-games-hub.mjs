import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync=promisify(execFile);
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const destination=process.argv[2];
if(!destination||!path.isAbsolute(destination))throw new Error('An absolute build directory is required.');

const output=path.join(destination,'public');
await fs.mkdir(output,{recursive:true});
if((await fs.readdir(output)).length)throw new Error('Build directory must be empty.');

async function copyFile(source,target){await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(source,target);}
async function copyTree(sourceDir,targetDir){
  await fs.mkdir(targetDir,{recursive:true});
  for(const entry of await fs.readdir(sourceDir,{withFileTypes:true})){
    const source=path.join(sourceDir,entry.name),target=path.join(targetDir,entry.name);
    if(entry.isDirectory())await copyTree(source,target);else await copyFile(source,target);
  }
}
function backLink(){return `<a class="gc-games-back" href="../" aria-label="Zurück zu GradeCrew Games">← Alle Spiele</a><style>.gc-games-back{position:fixed;left:16px;bottom:16px;z-index:9999;text-decoration:none;font:700 13px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#2f62d0;background:rgba(255,255,255,.94);border:1px solid #d8e0eb;border-radius:999px;padding:11px 14px;box-shadow:0 8px 28px rgba(32,52,84,.12);backdrop-filter:blur(10px)}.gc-games-back:hover{border-color:#9eb7ee;background:#fff}@media(max-width:600px){.gc-games-back{left:10px;bottom:10px;padding:10px 12px}}</style>`;}
async function injectBackLink(targetDir){
  const indexPath=path.join(targetDir,'index.html');let html=await fs.readFile(indexPath,'utf8');
  if(!html.includes('gc-games-back'))html=html.replace(/<body([^>]*)>/i,`<body$1>${backLink()}`);
  await fs.writeFile(indexPath,html);
}
async function copyWebApp(sourceDir,targetDir){
  await fs.mkdir(targetDir,{recursive:true});
  for(const entry of await fs.readdir(sourceDir,{withFileTypes:true})){
    if(!entry.isFile()||!/\.(?:html|css|js)$/i.test(entry.name))continue;
    await copyFile(path.join(sourceDir,entry.name),path.join(targetDir,entry.name));
  }
  await injectBackLink(targetDir);
}

const hubSource=path.join(root,'lab','games-hub');
await copyFile(path.join(hubSource,'index.html'),path.join(output,'index.html'));
await copyFile(path.join(hubSource,'styles.css'),path.join(output,'styles.css'));

await copyWebApp(path.join(root,'lab','fast-quiz'),path.join(output,'fast-quiz'));
await copyWebApp(path.join(root,'lab','fehlerjagd-deutsch'),path.join(output,'fehlerjagd-deutsch'));

const vocabTmp=await fs.mkdtemp(path.join(os.tmpdir(),'gradecrew-vocab-hub.'));
try{
  await execFileAsync(process.execPath,[path.join(root,'tools','build-lab-vocab-rush.mjs'),vocabTmp],{cwd:root});
  await copyTree(path.join(vocabTmp,'public'),path.join(output,'vocab-rush'));
  await injectBackLink(path.join(output,'vocab-rush'));
}finally{await fs.rm(vocabTmp,{recursive:true,force:true});}

const hubHtml=await fs.readFile(path.join(output,'index.html'),'utf8');
for(const marker of ['GradeCrew Games','Fast Quiz','Fehlerjagd Deutsch','Vocab Rush','All-Time-Highscore','Live'])if(!hubHtml.includes(marker))throw new Error(`Hub marker missing: ${marker}`);
for(const game of ['fast-quiz','fehlerjagd-deutsch','vocab-rush']){
  const gameIndex=await fs.readFile(path.join(output,game,'index.html'),'utf8');
  if(!gameIndex.includes('← Alle Spiele'))throw new Error(`Back link missing in ${game}`);
}
const vocabIndex=await fs.readFile(path.join(output,'vocab-rush','index.html'),'utf8');
for(const marker of ['mode-consistency.js','ux-polish.js','camera-plus.js','Themen ändern'])if(!vocabIndex.includes(marker)&&marker!=='Themen ändern')throw new Error(`Vocab Rush build marker missing: ${marker}`);
const vocabUx=await fs.readFile(path.join(output,'vocab-rush','ux-polish.js'),'utf8');if(!vocabUx.includes('Themen ändern'))throw new Error('Vocab Rush compact topic picker missing.');

const hashes={};
async function hashTree(dir,prefix=''){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name),rel=path.posix.join(prefix,entry.name);
    if(entry.isDirectory())await hashTree(full,rel);else hashes[rel]=createHash('sha256').update(await fs.readFile(full)).digest('hex');
  }
}
await hashTree(output);
await fs.writeFile(path.join(output,'lab-release.json'),JSON.stringify({experiment:'gradecrew-games-hub',format:2,games:['fast-quiz','fehlerjagd-deutsch','vocab-rush'],files:hashes},null,2)+'\n');
await fs.writeFile(path.join(destination,'firebase.json'),JSON.stringify({hosting:{site:'hausaufgabe-staging',public:'public',ignore:['**/.*'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-cache'}]}]}},null,2)+'\n');
console.log('GradeCrew Games Hub verified: Fast Quiz + Fehlerjagd Deutsch + Vocab Rush.');
