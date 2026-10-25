import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const site='gradecrew-staging-2026',origin=`https://${site}.web.app`;
const digest=data=>createHash('sha256').update(data).digest('hex');
const [destination,sourceCommit,flag]=process.argv.slice(2);
if(!destination||!path.isAbsolute(destination)||!/^([0-9a-f]{40})$/.test(sourceCommit||''))throw new Error('Absolute output and reviewed source commit required');
const get=async p=>{const r=await fetch(origin+'/'+p,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP${r.status} ${p}`);return Buffer.from(await r.arrayBuffer());};
if(flag==='--verify-baseline'){
 const receipt=JSON.parse(await fs.readFile(path.join(destination,'baseline.json'),'utf8'));
 if(digest(await get('release.json'))!==receipt.manifestSha256)throw new Error('Test site changed during preparation; rebuild before publishing.');
 console.log('Canonical test baseline unchanged.');
 process.exit(0);
}
await fs.mkdir(destination,{recursive:true});if((await fs.readdir(destination)).length)throw new Error('Output must be empty');
const publicDir=path.join(destination,'public');await fs.mkdir(publicDir);
const baselineBytes=await get('release.json'),baseline=JSON.parse(baselineBytes);
if(baseline.project!==site||baseline.environment!=='staging'||!baseline.files||Object.keys(baseline.files).length<100)throw new Error('Unexpected canonical test manifest');
const entries=Object.entries(baseline.files);
for(let i=0;i<entries.length;i+=6)await Promise.all(entries.slice(i,i+6).map(async([name,hash])=>{
 if(!/^[a-zA-Z0-9_./-]+$/.test(name)||name.includes('..')||name.startsWith('/')||!/^[a-f0-9]{64}$/.test(hash))throw new Error('Unsafe manifest entry');
 const data=await get(name);if(digest(data)!==hash)throw new Error('Canonical asset changed: '+name);
 const target=path.join(publicDir,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data);
}));
const hashes={};
for(const name of ['index.html','app.mjs','api.mjs','model.mjs','network.mjs','delivery.mjs','diagrams.mjs','brain.mjs','workshop.mjs','styles.css']){
 const data=await fs.readFile(path.join(root,'lerngehirn',name));const target=path.join(publicDir,'lerngehirn',name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data);hashes['lerngehirn/'+name]=digest(data);
}
const feature={project:site,sourceCommit,version:'learning-brain-20261021',files:hashes,scope:'Mathe/Deutsch5-10; text paths testable; media and content-review gates explicit'};
const featureBytes=JSON.stringify(feature,null,2)+'\n';await fs.writeFile(path.join(publicDir,'lerngehirn','release.json'),featureBytes);hashes['lerngehirn/release.json']=digest(featureBytes);
const release={...baseline,files:{...baseline.files,...hashes},extensions:{...(baseline.extensions||{}),learningBrain:{sourceCommit,manifest:'lerngehirn/release.json'}}};
await fs.writeFile(path.join(publicDir,'release.json'),JSON.stringify(release,null,2)+'\n');
await fs.writeFile(path.join(destination,'baseline.json'),JSON.stringify({site,manifestSha256:digest(baselineBytes),sourceCommit,baselineCommit:baseline.commit,preservedFiles:entries.length,addedFiles:hashes},null,2)+'\n');
await fs.writeFile(path.join(destination,'firebase.json'),JSON.stringify({hosting:{site,public:'public',ignore:['**/.*'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-cache'}]}]}},null,2)+'\n');
if(digest(await get('release.json'))!==digest(baselineBytes))throw new Error('Test site changed during preparation; do not publish.');
console.log(`Prepared ${entries.length} verified existing files and ${Object.keys(hashes).length} learner files for ${site}.`);
