import {mkdtemp,cp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const destination=resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Explicit output directory required.');
const temp=await mkdtemp(join(tmpdir(),'gradecrew-wilma-stage-'));
try{
 execFileSync(process.execPath,[join(root,'tools/build-staging.mjs'),temp,'staging'],{cwd:root,stdio:'inherit'});
 const source=join(temp,'public'),output=join(destination,'public-wilma');await mkdir(destination,{recursive:true});await cp(source,output,{recursive:true});
 const base=JSON.parse(await readFile(join(source,'release.json'),'utf8'));
 if(base.project!=='gradecrew-staging-2026')throw Error('Wrong staging project.');
 let page=await readFile(join(source,'workspace.html'),'utf8');
 const banner='<aside role="note" style="padding:10px 16px;background:#fff4d6;color:#734b13;font-size:13px;text-align:center">Staging 2026 · separates Testkonto · Änderungen werden hier gespeichert. <a href="https://gradecrew.de/workspace.html?intent=login">Zu deinem Live-Konto</a></aside>';
 page=page.replace(/(<body[^>]*>)/,'$1'+banner);
 await writeFile(join(output,'index.html'),page);await writeFile(join(output,'workspace.html'),page);await rm(join(output,'release.json'));
 const hashes={};for(const name of Object.keys(base.files).sort())hashes[name]=createHash('sha256').update(await readFile(join(output,name))).digest('hex');
 await writeFile(join(output,'wilma-release.json'),JSON.stringify({task:'GC-PEDAGOGY-KB-01',project:base.project,environment:'staging',commit:base.commit,mode:'regular_callable_persistent_decisions',entryTransform:'workspace entry plus explicit staging notice',files:hashes},null,2)+'\n');
 console.log(JSON.stringify({project:base.project,commit:base.commit,files:Object.keys(hashes).length+1,output}));
}finally{await rm(temp,{recursive:true,force:true});}
