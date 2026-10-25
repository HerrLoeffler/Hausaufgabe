import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
test('production and separate staging package complete public information without app bootstrap',async()=>{
 for(const environment of ['production','staging']){
  const destination=await fs.mkdtemp(path.join(os.tmpdir(),'gc-legal-build-'));
  try {
   execFileSync(process.execPath,['tools/build-staging.mjs',destination,environment],{cwd:root,stdio:'pipe'});
   const publicDir=path.join(destination,'public');
   const manifest=JSON.parse(await fs.readFile(path.join(publicDir,'release.json'),'utf8'));
   for(const filename of ['datenschutz.html','impressum.html','support.html']){
    const html=await fs.readFile(path.join(publicDir,filename),'utf8');
    assert.ok(manifest.files[filename],filename+' must be covered by release manifest');
    assert.match(html,/<main/);
    assert.doesNotMatch(html,/<script\b|\[.*(?:ergänzen|bestätigen|Anschrift|Kontakt).*\]/i);
    assert.match(html,/href="datenschutz.html"/);
    assert.match(html,/href="impressum.html"/);
    assert.match(html,/href="support.html"/);
    for(const [,href] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
     if(/^(https?:|mailto:|tel:)/.test(href)||href==='/')continue;
     await fs.access(path.join(publicDir,href.split('#')[0]));
    }
   }
   const home=await fs.readFile(path.join(publicDir,'index.html'),'utf8');
   assert.match(home,/href="\/?datenschutz.html"/);
   assert.match(home,/href="\/?impressum.html"/);
   assert.match(home,/href="\/?support.html"/);
  } finally {await fs.rm(destination,{recursive:true,force:true});}
 }
});
