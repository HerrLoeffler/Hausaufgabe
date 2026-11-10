import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const [dest,dep]=process.argv.slice(2);
if(!dest||!path.isAbsolute(dest)||!dep||!path.isAbsolute(dep))throw Error('Absolutes Ausgabe- und Modulverzeichnis angeben.');
await fs.mkdir(dest,{recursive:true});
if((await fs.readdir(dest)).length)throw Error('Ausgabeverzeichnis muss leer sein.');
const evidence=path.join(root,'docs/evidence/remy-mehrfeld30-20261109');
const physics=JSON.parse(await fs.readFile(path.join(evidence,'physik.json'),'utf8'));
const physicsGroups=physics.status==='failed'?['physik-uebergaenge','physik-beobachtungen']:['physik'];
const groups=['direkt','umgekehrt',...physicsGroups,'gegenprobe'];
const seed=[];
for(const group of groups){
  const file=path.join(evidence,group+'.json');
  const receipt=JSON.parse(await fs.readFile(file,'utf8'));
  if(receipt.group!==group||!(/^[a-f0-9]{40}$/.test(receipt.jobId||''))||receipt.requestId!=='gc-remy-mehrfeld30-20261109-'+group)
    throw Error('Auftragsbeleg für '+group+' fehlt.');
  // The existing Remy worker limits client request IDs to 40 characters.
  const requestId=receipt.requestId.slice(0,40);
  const expectedId=createHash('sha256').update('gc-visual255-e2e:'+requestId).digest('hex').slice(0,40);
  if(receipt.jobId!==expectedId)throw Error('Auftrags-ID passt nicht zum synthetischen Konto: '+group);
  seed.push({group:group.startsWith('physik-')?'physik':group,jobId:receipt.jobId,requestId});
}
const web=path.join(dest,'public'),backend=path.join(dest,'functions'),ui=path.join(web,'remy-labor');
await fs.mkdir(ui,{recursive:true});
await fs.mkdir(path.join(ui,'visual'));
await fs.mkdir(path.join(backend,'tools/remy-mehrfeld30'),{recursive:true});
await fs.mkdir(path.join(backend,'functions/lib/visual'),{recursive:true});
const copy=(source,target)=>fs.copyFile(path.join(root,source),target);
for(const name of ['index.html','pilot.css','pilot.mjs','recipe-view.mjs'])await copy('tools/remy-mehrfeld30/'+name,path.join(ui,name));
for(const name of ['visual.css','core.js','legacy-core.js','renderers.js'])await copy('visual/'+name,path.join(ui,'visual',name));
await copy('firebase-config.staging.js',path.join(ui,'firebase-config.js'));
for(const name of ['server.cjs','review.cjs','round-two.cjs','recipe-three.cjs','generate-three.cjs'])await copy('tools/remy-mehrfeld30/'+name,path.join(backend,'tools/remy-mehrfeld30',name));
for(const name of ['visual-task.js','structured-response.js','constants.js'])await copy('functions/lib/'+name,path.join(backend,'functions/lib',name));
for(const name of ['core.js','legacy-core.js'])await copy('functions/lib/visual/'+name,path.join(backend,'functions/lib/visual',name));
const json=(file,value)=>fs.writeFile(file,JSON.stringify(value,null,2)+'\n');
await json(path.join(backend,'tools/remy-mehrfeld30/seed.json'),seed);
await json(path.join(backend,'package.json'),{name:'gradecrew-remy-mehrfeld30',private:true,main:'tools/remy-mehrfeld30/server.cjs',engines:{node:'22'},dependencies:{'firebase-admin':'14.5.0','firebase-functions':'7.4.0','openai':'7.23.0'}});
await fs.symlink(dep,path.join(backend,'node_modules'),'dir');
await json(path.join(dest,'firebase.json'),{
  hosting:{site:'gradecrew-staging-2026',public:'public',ignore:['firebase.json','**/.*','**/node_modules/**'],
    headers:[{source:'**',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'no-store'}]}],
    redirects:[{source:'/',destination:'/remy-labor/',type:302}]},
  functions:[{source:'functions',codebase:'remy-mehrfeld30',runtime:'nodejs22',ignore:['node_modules','.git']}]
});
const files=['index.html','pilot.css','pilot.mjs','recipe-view.mjs','firebase-config.js','visual/visual.css','visual/core.js','visual/legacy-core.js','visual/renderers.js'];
await json(path.join(dest,'hosting-hashes.json'),Object.fromEntries(await Promise.all(files.map(async file=>[file,createHash('sha256').update(await fs.readFile(path.join(ui,file))).digest('hex')]))));
console.log('Preview nur für gradecrew-staging-2026 · '+seed.length+' gebundene Gruppen');
