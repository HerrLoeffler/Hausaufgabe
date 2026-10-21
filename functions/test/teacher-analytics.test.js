'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {recordTeacherEvent,retryTeacherEvents}=require('../lib/teacher-analytics');
function database(){const rows=new Map();const db={doc:path=>({id:path.split('/').at(-1),path,get:async()=>({exists:rows.has(path),data:()=>rows.get(path)}),update:async patch=>{rows.set(path,{...rows.get(path),...patch});}}),runTransaction:async fn=>fn({get:async ref=>({exists:rows.has(ref.path),data:()=>rows.get(ref.path)}),create:(ref,data)=>{assert.equal(rows.has(ref.path),false);rows.set(ref.path,data);},set:(ref,data)=>rows.set(ref.path,data)})};db.collection=name=>({where:()=>({limit:()=>({get:async()=>{const docs=[...rows].filter(([key,value])=>key.startsWith(name+'/')&&value.delivered===false).map(([path,data])=>({data:()=>data,ref:db.doc(path)}));return {docs,size:docs.length};}})})});return {db,rows};}
const env={GCLOUD_PROJECT:'gradecrew-staging-2026',GC_TEACHER_ANALYTICS_ENABLED:'true',POSTHOG_PROJECT_TOKEN:'synthetic-token'};
const profile={role:'teacher',analyticsConsent:true};
const raw={id:'00000000-0000-4000-8000-000000000001',event:'session_started',release:'a'.repeat(40),platform:'web',at:100000};
test('canonical teacher outbox retries exact event, creates no raw uid projection, and dedupes',async()=>{const {db,rows}=database();const requests=[];let succeed=false;
 const opts={db,now:100000,env,fetchImpl:async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:succeed};}};
 assert.equal((await recordTeacherEvent('private-uid',profile,raw,opts)).pending,true);
 opts.now=280001;succeed=true;assert.equal((await recordTeacherEvent('private-uid',profile,raw,opts)).ok,true);
 assert.equal(requests[0].properties.$insert_id,requests[1].properties.$insert_id);
 assert.equal(requests[0].distinct_id,requests[1].distinct_id);
 assert.equal(JSON.stringify(requests).includes('private-uid'),false);
 assert.equal(requests[0].properties.measurement_channel,'synthetic');
 assert.equal((await recordTeacherEvent('private-uid',profile,raw,opts)).duplicate,true);assert.equal(requests.length,2);
 assert.equal(rows.size,3);
 await assert.rejects(()=>recordTeacherEvent('private-uid',profile,{...raw,event:'session_ended'},opts),/Messkennung/);
});
test('opt-out, student and unknown project have no Firestore or network side effects',async()=>{for(const p of [{role:'student',analyticsConsent:true},{role:'teacher'}]){const {db,rows}=database();const r=await recordTeacherEvent('u',p,raw,{db,env,now:100000,fetchImpl:()=>{throw Error('must not send');}});assert.equal(r.disabled,true);assert.equal(rows.size,0);}});

test('bounded server retry delivers without browser and suppresses revoked purpose',async()=>{
 const {db,rows}=database();
 await recordTeacherEvent('private-uid',profile,raw,{db,now:100000,env,fetchImpl:async()=>({ok:false})});
 rows.set('users/private-uid',profile);let sends=0;
 const r=await retryTeacherEvents({db,now:400000,env,fetchImpl:async()=>{sends++;return {ok:true};}});
 assert.equal(r.delivered,1);assert.equal(sends,1);
 await recordTeacherEvent('private-uid',profile,{...raw,id:'00000000-0000-4000-8000-000000000002',at:400000},{db,now:400000,env,fetchImpl:async()=>({ok:false})});
 rows.set('users/private-uid',{role:'teacher',analyticsConsent:false});
 const suppressed=await retryTeacherEvents({db,now:500000,env,fetchImpl:async()=>{throw Error('must not send');}});
 assert.equal(suppressed.suppressed,1);
});
