'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const {createPool}=require('../lib/learning-brain/fundus');
function repository(){const rows=new Map();return {rows,list:async key=>[...(rows.get(key)?.values()||[])],put:async(key,id,row)=>{if(!rows.has(key))rows.set(key,new Map());rows.get(key).set(id,row);}};}
const s={topic:{id:'B07',subject:'math',grade:6,track:'R'},phase:'practice',level:0,events:[]};const plan={version:'p1',demand:'one',level:0};const candidate={task:{id:'old',prompt:'Erweitere 1/3 mit 2.',contextText:'',input:'text',options:[],family:'apply',workshop:null,answer:{kind:'exact-fraction',values:['2/6']},rubric:'same factor',toolDecision:{reason:'private'}},explanation:'',visual:null};
test('only independently reviewed standalone practice candidates enter the reusable private pool',async()=>{
 const store=repository(),pool=createPool({store});assert.equal(await pool.save(s,plan,candidate,{approved:true,reusable:false}),null);assert.equal(await pool.save({...s,phase:'help'},plan,candidate,{approved:true,reusable:true}),null);
 const saved=await pool.save(s,plan,candidate,{approved:true,reusable:true});assert.ok(saved);const found=await pool.take(s,plan);assert.equal(found.task.prompt,'Erweitere 1/3 mit 2.');assert.notEqual(found.task.id,'old');assert.equal(found.task.toolDecision,undefined);assert.equal(found.task.generationSource,'reviewed-pool');
});
test('pool retrieval respects grade context, demand version, recent task fingerprints and expiry',async()=>{
 let now=100;const store=repository(),pool=createPool({store,now:()=>now});await pool.save(s,plan,candidate,{approved:true,reusable:true});
 assert.equal(await pool.take({...s,topic:{...s.topic,grade:7}},plan),null);assert.equal(await pool.take(s,{...plan,version:'p2'}),null);
 const first=await pool.take(s,plan);assert.equal(await pool.take({...s,task:first.task},plan),null);
 now+=181*86400000;assert.equal(await pool.take(s,plan),null);
});
test('a private demand bucket cannot grow without bound as the generator proposes new variants',async()=>{
 const store=repository(),pool=createPool({store});let accepted=0;
 for(let i=0;i<35;i++){const c=globalThis.structuredClone(candidate);c.task.prompt='Eigenständige Variante '+i;if(await pool.save(s,plan,c,{approved:true,reusable:true}))accepted++;}
 assert.equal(accepted,32);assert.equal([...store.rows.values()][0].size,32);
});
