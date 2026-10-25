'use strict';
const {createHash,randomUUID}=require('node:crypto');
const {fingerprint}=require('./core');
const VERSION='private-reviewed-pool-v2';
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function createPool({store,now=Date.now}){
 const key=(s,p)=>digest([VERSION,s.topic.id,s.topic.subject,s.topic.grade,s.topic.track,p.version,p.demand,p.level]);
 return {
  async take(s,p){if(s.phase!=='practice')return null;const k=key(s,p),skip=new Set((s.events||[]).map(e=>e.fingerprint));if(s.task)skip.add(fingerprint(s.task));
   const rows=await store.list(k);const row=rows.filter(r=>r.version===VERSION&&r.expiresAt>now()&&!skip.has(r.fingerprint)).sort((a,b)=>(a.served||0)-(b.served||0))[0];
   if(!row)return null;return {task:{...globalThis.structuredClone(row.task),id:randomUUID(),generationSource:'reviewed-pool',poolRef:{key:k,id:row.fingerprint}},explanation:'',visual:row.visual||null};
  },
  async save(s,p,candidate,review){if(s.phase!=='practice'||review?.approved!==true||review.reusable!==true||candidate.explanation?.trim())return null;
   const t=candidate.task;const task={prompt:t.prompt,contextText:t.contextText,input:t.input,options:t.options,family:t.family,workshop:t.workshop||null,media:t.media||null,diagram:t.diagram||null,answer:t.answer,rubric:t.rubric,demand:p};
   if(Buffer.byteLength(JSON.stringify(task))>15000)return null;
   const id=fingerprint(task),k=key(s,p);const existing=await store.list(k);if(existing.length>=32&&!existing.some(r=>r.fingerprint===id))return null;await store.put(k,id,{version:VERSION,fingerprint:id,task,visual:candidate.visual||null,createdAt:now(),expiresAt:now()+180*86400000,served:0,review:{approved:true,reusable:true,version:p.version}});return {key:k,id};
  }
 };
}
// Intentionally owner-private until a separate reviewed promotion path exists.
// This shares no pupil answers or task context across children. Account deletion
// already recursively removes aiRuntime, including this descendant collection.
function firestorePool(db,uid){const base=db.collection(`users/${uid}/aiRuntime/learningBrain/taskPool`);return createPool({store:{
 list:async key=>{const snap=await base.doc(key).collection('candidates').limit(32).get();return snap.docs.map(d=>d.data());},
 put:async(key,id,row)=>{await base.doc(key).collection('candidates').doc(id).set(row);}
}});}
module.exports={createPool,firestorePool,VERSION};
