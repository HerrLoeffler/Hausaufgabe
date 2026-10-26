import test from 'node:test';import assert from 'node:assert/strict';
import {prepareOnlineIndex,hostingRewrites}from'./online-build-preservation.mjs';
test('owned online workspace updates preserve the original app loader and use a single pupil module',()=>{const original='<head></head><body><script src="app.js?v=gc44"></script></body>';const first=prepareOnlineIndex(original,{version:'one'});const second=prepareOnlineIndex(first,{task:'GC-CLASSROOM-01',version:'two'});assert.equal((second.match(/online-workspace.mjs/g)||[]).length,1);assert.equal((second.match(/online-workspace.css/g)||[]).length,1);assert.ok(second.includes('app.js?v=gc44'));assert.ok(second.includes('online-workspace.mjs?v=two'));assert.throws(()=>prepareOnlineIndex(first,{task:'other',version:'two'}));});
test('hosting update preserves other rewrites and replaces only its own route once',()=>{const old=[{glob:'/api/classroom/**',function:{functionId:'classroomWeb',region:'europe-west1'}},{glob:'/other/**',destination:'/other.html'}];const r=hostingRewrites(old);assert.equal(r.length,2);assert.equal(r[0].source,'/api/classroom/**');assert.equal(r[1].source,'/other/**');assert.equal(r[1].destination,'/other.html');assert.ok(!Object.hasOwn(r[1],'glob'));});

test('classroom attaches to the teacher workspace after the homepage split and preserves both entry pages',async()=>{
 const {onlineTeacherEntry}=await import('./online-build-preservation.mjs');
 const files={'index.html':'homepageHash','workspace.html':'teacherHash'};
 assert.equal(onlineTeacherEntry(files),'workspace.html');
 assert.equal(onlineTeacherEntry({'index.html':'legacyHash'}),'index.html');
 const homepage='<head></head><body><script src="/homepage/app.js?v=25"></script></body>';
 const teacher='<head></head><body><main id="mainContent"></main><script type="module" src="startup.js?v=gc45"></script></body>';
 const output={...files,'index.html':homepage,'workspace.html':prepareOnlineIndex(teacher,{version:'restored'})};
 assert.equal(output['index.html'],homepage);
 assert.ok(output['workspace.html'].includes('startup.js?v=gc45'));
 assert.ok(output['workspace.html'].includes('classroom/online-workspace.mjs?v=restored'));
});
