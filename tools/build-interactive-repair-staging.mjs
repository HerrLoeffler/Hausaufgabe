// Preserve the exact deployed classroom/homepage release while updating this scoped runtime.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [dest,baseline]=process.argv.slice(2);
const baselineCommit='f1bee9468d1b0d891fece610f20c11511d771f61';
const overlay=['app.js','visual-tasks.mjs','visual/core.js','visual/renderers.js','visual/visual.css','dreisatz.mjs','visual-format-choice.mjs'];
const hash=data=>createHash('sha256').update(data).digest('hex');
if(!dest||!baseline||!path.isAbsolute(dest)||!path.isAbsolute(baseline))throw Error('Absolute empty destination and verified baseline required');
await fs.mkdir(dest,{recursive:true});if((await fs.readdir(dest)).length)throw Error('Destination must be empty');
const prior=JSON.parse(await fs.readFile(path.join(baseline,'release.json'),'utf8'));
if(prior.project!=='gradecrew-staging-2026'||prior.commit!==baselineCommit||Object.keys(prior.files).length!==213)throw Error('Unexpected deployed baseline');
for(const [name,expected] of Object.entries(prior.files)){
 if(name.includes('..')||path.isAbsolute(name))throw Error('Invalid asset path');
 if(hash(await fs.readFile(path.join(baseline,'public',name)))!==expected)throw Error('Baseline hash mismatch: '+name);
}
execFileSync(process.execPath,['tools/build-staging.mjs',dest,'staging'],{cwd:root,stdio:'inherit'});
const web=path.join(dest,'public');
await fs.rm(web,{recursive:true});await fs.cp(path.join(baseline,'public'),web,{recursive:true});
for(const name of overlay)await fs.copyFile(path.join(root,name),path.join(web,name));
const picker=html=>html.match(/<fieldset id="aiInteractiveFormats"[\s\S]*?<\/fieldset>/g);
const source=await fs.readFile(path.join(root,'index.html'),'utf8');
const workspace=await fs.readFile(path.join(web,'workspace.html'),'utf8');
if(picker(source)?.length!==1||picker(workspace)?.length!==1)throw Error('Interactive picker boundary drift');
await fs.writeFile(path.join(web,'workspace.html'),workspace.replace(picker(workspace)[0],picker(source)[0]));
if(!(await fs.readFile(path.join(web,'visual-preview255.mjs'),'utf8')).includes('ENABLED = false'))throw Error('Normal endpoints required');
const names=[...new Set([...Object.keys(prior.files),...overlay])].sort();const files={};
for(const name of names)files[name]=hash(await fs.readFile(path.join(web,name)));
const changed=names.filter(name=>files[name]!==prior.files[name]);
if(changed.some(name=>![...overlay,'workspace.html'].includes(name)))throw Error('Unrelated runtime changed');
const release={...prior,commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),baseHostingCommit:baselineCommit,runtimeBaseCommit:'22fa3ec8cff23003e409c23c47a78323e3fa16f7',task:'GC-EXTENDED-QUESTION-TYPES-01',changedFiles:changed,files};
await fs.writeFile(path.join(web,'release.json'),JSON.stringify(release,null,2)+'\n');
const config=JSON.parse(await fs.readFile(path.join(baseline,'firebase.json'),'utf8'));
if(config.hosting.site!=='gradecrew-staging-2026'||!config.hosting.rewrites?.some(r=>r.source==='/api/classroom/**'&&r.function?.functionId==='classroomWeb'))throw Error('Preserved classroom Hosting route required');
config.functions=[];
for(const [source,codebase] of [['functions','ai'],['assessment-functions','assessment']]){
 await fs.cp(path.join(root,source),path.join(dest,source),{recursive:true,filter:p=>!p.split(path.sep).some(n=>['node_modules','test'].includes(n))});
 await fs.symlink(path.join(root,source,'node_modules'),path.join(dest,source,'node_modules'),'dir');
 config.functions.push({source,codebase,runtime:'nodejs22'});
}
await fs.writeFile(path.join(dest,'firebase.json'),JSON.stringify(config,null,2)+'\n');
console.log(JSON.stringify({commit:release.commit,files:names.length,preserved:names.length-changed.length,changed}));
