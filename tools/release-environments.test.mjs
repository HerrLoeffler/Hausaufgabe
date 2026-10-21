import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

for(const [environment,project] of [['staging','gradecrew-staging-2026'],['production','hausaufgabe-staging']]){
 test(`${environment} build binds manifest, Firebase config and hosting to ${project}`,async()=>{
  const dir=await mkdtemp(join(tmpdir(),'gc-env-build-'));
  try{
   execFileSync(process.execPath,['tools/build-staging.mjs',dir,environment],{stdio:'pipe'});
   const manifest=JSON.parse(await readFile(join(dir,'public/release.json')));
   const hosting=JSON.parse(await readFile(join(dir,'firebase.json')));
   const config=await readFile(join(dir,'public/firebase-config.js'),'utf8');
   assert.equal(manifest.project,project);assert.equal(manifest.environment,environment);
   assert.equal(hosting.hosting.site,project);
   assert.match(config,new RegExp(`projectId: "${project}"`));
   assert.match(config,new RegExp(`appEnvironment = "${environment}"`));
  }finally{await rm(dir,{recursive:true,force:true});}
 });
}
test('unknown environment fails before writing a release',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-env-bad-'));
 try{assert.throws(()=>execFileSync(process.execPath,['tools/build-staging.mjs',dir,'legacy'],{stdio:'pipe'}));}
 finally{await rm(dir,{recursive:true,force:true});}
});
