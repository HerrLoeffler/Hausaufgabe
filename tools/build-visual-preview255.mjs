import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {PROJECT,AI_NAMES,ASSESSMENT_NAMES,previewCallable,previewAccountAllowed,PREVIEW_TEST_UID} from './visual-preview255-contract.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const allowedFn=previewAccountAllowed.toString().replaceAll('PREVIEW_TEST_UID',JSON.stringify(PREVIEW_TEST_UID));
const dest=process.argv[2];
if(!dest||!path.isAbsolute(dest))throw Error('Absolute empty output required');
await fs.mkdir(dest,{recursive:true});if((await fs.readdir(dest)).length)throw Error('Output must be empty');
execFileSync(process.execPath,['tools/build-staging.mjs',dest,'staging'],{cwd:root,stdio:'inherit'});
const web=path.join(dest,'public');
await fs.copyFile(path.join(root,'visual-preview255.mjs'),path.join(web,'visual-preview255.mjs'));
const previewConfig=await fs.readFile(path.join(web,'visual-preview255.mjs'),'utf8');
await fs.writeFile(path.join(web,'visual-preview255.mjs'),previewConfig.replace('ENABLED = false','ENABLED = true'));
let app=await fs.readFile(path.join(web,'app.js'),'utf8');
app='import { previewCallable as preview255Callable } from "./visual-preview255.mjs";\n'+app;
app=app.replace('"configurePracticeSolutionRelease")(data)', 'preview255Callable("configurePracticeSolutionRelease"))(data)');
await fs.writeFile(path.join(web,'app.js'),app);
for(const [source,codebase,names] of [['functions','visual255-ai',AI_NAMES],['assessment-functions','visual255-assessment',ASSESSMENT_NAMES]]){
 const target=path.join(dest,source);
 await fs.cp(path.join(root,source),target,{recursive:true,filter:s=>!s.split(path.sep).some(n=>['node_modules','test'].includes(n))});
 const pkg=JSON.parse(await fs.readFile(path.join(target,'package.json'),'utf8'));pkg.main='preview255-main.cjs';await fs.writeFile(path.join(target,'package.json'),JSON.stringify(pkg,null,2));
 const entry=`"use strict";\nconst {setGlobalOptions}=require('firebase-functions/v2');setGlobalOptions({maxInstances:2});\nconst original=require('./main');\n`+names.map(n=>`exports.${previewCallable(n)}=original.${n};`).join('\n')+'\n';
 await fs.writeFile(path.join(target,'preview255-main.cjs'),entry);
 await fs.symlink(path.join(root,source,'node_modules'),path.join(target,'node_modules'),'dir');
 if(source==='functions'){
  const access=path.join(target,'lib/access.js');let s=await fs.readFile(access,'utf8');const needle='const profile = snap.data() || {};';if(!s.includes(needle))throw Error('Access guard drift');s=s.replace(needle,needle+`\n  if(!(${allowedFn})(uid,profile)) throw new HttpsError("permission-denied", "Diese Erprobung benötigt ein freigegebenes Testkonto.");`);await fs.writeFile(access,s);
  const index=path.join(target,'index.js');s=await fs.readFile(index,'utf8');if(!s.includes('functions/processAiTestJob'))throw Error('Queue target drift');s=s.replace('functions/processAiTestJob','functions/visual255ProcessAiTestJob');await fs.writeFile(index,s);
 }else{
  const lifecycle=path.join(target,'lib/secure-lifecycle.js');let s=await fs.readFile(lifecycle,'utf8');const needle='const quizId = cleanQuizId(request.data?.quizId);';const check=`${needle}\n  const previewQuiz = await getFirestore().doc('quizzes/'+quizId).get();\n  const previewOwner = previewQuiz.exists ? await getFirestore().doc('users/'+previewQuiz.data().ownerId).get() : null;\n  if(!previewOwner?.exists || !(${allowedFn})(previewQuiz.data().ownerId,previewOwner.data())) throw new HttpsError('permission-denied','Kein freigegebener Test dieser Erprobung.');`;
  if(s.split(needle).length!==7)throw Error('Assessment guard drift');s=s.split(needle).join(check);await fs.writeFile(lifecycle,s);
 }
}
const config=JSON.parse(await fs.readFile(path.join(dest,'firebase.json'),'utf8'));if(config.hosting.site!==PROJECT)throw Error('Wrong project');
config.functions=[{source:'functions',codebase:'visual255-ai',runtime:'nodejs22'},{source:'assessment-functions',codebase:'visual255-assessment',runtime:'nodejs22'}];await fs.writeFile(path.join(dest,'firebase.json'),JSON.stringify(config,null,2));
const release=JSON.parse(await fs.readFile(path.join(web,'release.json'),'utf8'));release.previewTask='GC-VISUAL-PROTOTYPE-AI-02';release.endpointPrefix='visual255';
for(const name of [...Object.keys(release.files),'visual-preview255.mjs']){const data=await fs.readFile(path.join(web,name));release.files[name]=createHash('sha256').update(data).digest('hex');}
await fs.writeFile(path.join(web,'release.json'),JSON.stringify(release,null,2));
console.log('Isolated preview package verified for '+PROJECT+'; deploy only its named codebases and Hosting channel visual255.');
