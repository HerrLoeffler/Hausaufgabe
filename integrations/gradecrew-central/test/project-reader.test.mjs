import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectReader} from '../plugin/project-reader.mjs';

const sha='a'.repeat(40);
const branchUrl='https://api.github.com/repos/HerrLoeffler/Hausaufgabe/branches/main';
const raw=path=>`https://raw.githubusercontent.com/HerrLoeffler/Hausaufgabe/${sha}/${path}`;
const releaseUrl='https://gradecrew-staging-2026.web.app/release.json';
const callable=name=>`https://europe-west1-gradecrew-staging-2026.cloudfunctions.net/${name}`;
const ok=data=>Response.json(data);

test('project status and workstreams use the same verified main commit',async()=>{
 const seen=[];
 const responses=new Map([
  [branchUrl,ok({name:'main',commit:{sha}})],
  [raw('GRADECREW_STATE.json'),ok({observed_at:'2026-10-08',release_train:{id:'train-1',integration_branch:'feature/web',canonical_url:'https://gradecrew-staging-2026.web.app/',preview_url:'https://preview.web.app/',gates:{canonical_hosting:'success',production:'not_requested'}},production:{project:'hausaufgabe-40294',approval_required:true,deployment_verified_this_session:false,changed_by_current_release_train:false}})],
  [raw('workstreams/registry.json'),ok({workstreams:[{id:'games-structure',title:'Games',primaryBranch:'lab/games-structure',integrationTarget:'lab/vocab-rush',state:'active',handoff:'workstreams/games.md'},{id:'web-app',title:'Web',primaryBranch:'feature/web',integrationTarget:'main',state:'active'}]})],
  [raw('workstreams/games.md'),new Response('# Games handoff\nNoch offen.')]
 ]);
 const fetchImpl=async url=>{seen.push(String(url));const response=responses.get(String(url));assert(response,`unexpected URL ${url}`);return response.clone();};
 const reader=createProjectReader({fetchImpl});
 const status=await reader.status();
 assert.equal(status.mainCommit,sha);
 assert.equal(status.releaseTrain.id,'train-1');
 assert.equal(status.releaseTrain.canonicalUrl,'https://gradecrew-staging-2026.web.app/');
 assert.equal(status.releaseTrain.previewUrl,'https://preview.web.app/');
 assert.equal(status.production.approvalRequired,true);
 assert.equal(status.production.deploymentVerifiedThisSession,false);
 assert.equal(status.production.changedByCurrentReleaseTrain,false);
 assert.equal(status.workstreamCount,2);
 const list=await reader.workstreams();
 assert.deepEqual(list.workstreams.map(w=>w.id),['games-structure','web-app']);
 const handoff=await reader.handoff('games-structure');
 assert.equal(handoff.content,'# Games handoff\nNoch offen.');
 assert.equal(handoff.mainCommit,sha);
 assert(seen.every(url=>url===branchUrl||url.includes(`/${sha}/`)));
 await assert.rejects(reader.handoff('../secrets'),/Workstream/);
});

test('staging release reads only the fixed canonical staging host',async()=>{
 const seen=[];
 const reader=createProjectReader({fetchImpl:async url=>{seen.push(String(url));return ok({commit:'b'.repeat(40),version:'test',project:'gradecrew-staging-2026'});}});
 assert.deepEqual((await reader.stagingRelease()).release,{commit:'b'.repeat(40),version:'test',project:'gradecrew-staging-2026'});
 assert.deepEqual(seen,[releaseUrl]);
 const wrong=createProjectReader({fetchImpl:async()=>ok({commit:'b'.repeat(40),project:'hausaufgabe-40294'})});
 await assert.rejects(wrong.stagingRelease(),/Staging/);
});

test('project status fails closed when production approval evidence is missing',async()=>{
 const fetchImpl=async url=>{
  if(String(url)===branchUrl)return ok({commit:{sha}});
  if(String(url)===raw('workstreams/registry.json'))return ok({workstreams:[]});
  if(String(url)===raw('GRADECREW_STATE.json'))return ok({release_train:{id:'train-1',gates:{}},production:{project:'hausaufgabe-40294',deployment_verified_this_session:false,changed_by_current_release_train:false}});
  throw Error('unexpected URL');
 };
 await assert.rejects(createProjectReader({fetchImpl}).status(),/Production-Freigabe/);
});

test('private staging reads require an identity token and call only existing read actions',async()=>{
 let calls=0;
 const noToken=createProjectReader({fetchImpl:async()=>{calls++;throw Error('unexpected network');},stagingToken:()=>''});
 await assert.rejects(noToken.stagingRead('visual_feedback'),/Staging-Anmeldung/);
 assert.equal(calls,0);
 const seen=[];
 const reader=createProjectReader({stagingToken:()=> 'test-id-token',fetchImpl:async(url,init)=>{
  seen.push({url:String(url),method:init.method,authorization:init.headers.authorization,body:JSON.parse(init.body)});
  if(String(url).endsWith('/reviewMode'))return ok({result:{notes:[{id:'note-1',text:'Button verschieben',status:'open',area:'visual-feedback',view:'home',target:'button',displayName:'private',quizId:'quiz-1'}],nextCursor:null,checks:[{id:'internal'}]}});
  return ok({result:{total:4,secret:'should not be added by adapter'}});
 }});
 const notes=await reader.stagingRead('visual_feedback');
 assert.deepEqual(notes.notes,[{id:'note-1',text:'Button verschieben',status:'open',area:'visual-feedback',view:'home',target:'button'}]);
 assert.equal(notes.nextCursor,null);
 await reader.stagingRead('visual_feedback','note-100');
 const usage=await reader.stagingRead('crew_telemetry_summary');
 assert.equal(usage.summary.total,4);
 assert.deepEqual(seen.map(c=>c.url),[callable('reviewMode'),callable('reviewMode'),callable('getCrewTelemetrySummary')]);
 assert.deepEqual(seen.map(c=>c.body),[{data:{action:'list',area:'visual-feedback'}},{data:{action:'list',area:'visual-feedback',cursor:'note-100'}},{data:{days:30}}]);
 assert(seen.every(c=>c.method==='POST'&&c.authorization==='Bearer test-id-token'));
 assert(!JSON.stringify(notes).includes('test-id-token'));
 await assert.rejects(reader.stagingRead('all_users'),/Datensatz/);
 const before=seen.length;
 await assert.rejects(reader.stagingRead('toString'),/Datensatz/);
 assert.equal(seen.length,before);
 await assert.rejects(reader.stagingRead('visual_feedback','../escape'),/Cursor/);
 await assert.rejects(reader.stagingRead('bugops_summary','note-100'),/Cursor/);
});
