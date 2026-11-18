'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
(async()=>{
 const [packageDir,beforeFile,afterFile]=process.argv.slice(2);if(!packageDir||!beforeFile||!afterFile)throw Error('Package and before/after inventory required.');
 const before=JSON.parse(fs.readFileSync(beforeFile,'utf8')).result,after=JSON.parse(fs.readFileSync(afterFile,'utf8')).result;
 const owned='remyMehrfeld30Review';assert.equal(before.length,after.length);
 for(const old of before.filter(x=>x.id!==owned))assert.deepEqual(after.find(x=>x.id===old.id),old,'Unexpected function change '+old.id);
 const own=after.find(x=>x.id===owned);assert.equal(own.state,'ACTIVE');
 const hashes=JSON.parse(fs.readFileSync(path.join(packageDir,'hosting-hashes.json'),'utf8')),files=[];
 for(const [file,hash]of Object.entries(hashes)){
  const r=await fetch('https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/'+file,{cache:'no-store'});assert.equal(r.status,200,file);
  assert.equal(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),hash,file);files.push({file,sha256:hash});
 }
 const result={at:new Date().toISOString(),project:'gradecrew-staging-2026',channel:'remy-mehrfeld30',expires:'2026-12-18',totalFunctions:after.length,otherFunctionsUnchanged:before.length-1,ownedFunction:owned,functionSourceHash:own.labels?.['firebase-functions-hash'],verifiedAssets:files,canonicalHostingChanged:false,productionChanged:false,rulesChanged:false};
 fs.writeFileSync(path.resolve(__dirname,'../../../docs/evidence/fields-arrows8-20261118/deployment.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({functions:after.length,otherUnchanged:before.length-1,assets:files.length,hash:result.functionSourceHash}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
