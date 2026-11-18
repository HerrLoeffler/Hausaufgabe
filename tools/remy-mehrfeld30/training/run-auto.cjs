'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {login,PROJECT}=require('../../visual-pilot/access.cjs');
const {SESSION,phasePlan}=require('./auto-manifest.cjs');
const root=path.resolve(__dirname,'../../../docs/evidence/autonomous-recipes-20261118');fs.mkdirSync(root,{recursive:true});
const save=(name,v)=>fs.writeFileSync(path.join(root,name+'.json'),JSON.stringify(v,null,2)+'\n');
async function call(data){const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await login()},body:JSON.stringify({data}),signal:AbortSignal.timeout(85000)});const b=await r.json();if(b.error)throw Error(b.error.status+' '+b.error.message);return b.result;}
const requestId=x=>{const h=createHash('sha256').update(SESSION+':'+x).digest('hex').slice(0,32);return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');};
async function runCase(phase,id){
 const runId=phasePlan(phase).runId;
 for(let turn=0;turn<16;turn++){
  const state=await call({action:'trainingStatus',runId}),c=state.cases.find(x=>x.id===id);
  if(!c)throw Error('Fall fehlt.');
  save('pending-'+phase+'-'+id,{at:new Date().toISOString(),phase,id,status:c.status,attempt:c.attempt});
  if(c.status==='uncertain')throw Error('Unbestätigter KI-Aufruf: '+phase+'/'+id);
  if(c.status==='ready'){
   const review=await call({action:'trainingAutoAdversary',phase,caseId:id});
   if(review.stale)continue;
   if(review.passed){console.log(phase+'/'+id+' accepted · a'+c.attempt);return;}
   if(c.attempt>=3){console.log(phase+'/'+id+' adversary-blocked · a'+c.attempt);return;}
  }else if(c.status==='rejected'){
   if(c.errors.some(x=>/budget|quota|API key|model.*(not found|exist)/i.test(x)))throw Error(c.errors.join(' '));
   if(c.attempt>=3){console.log(phase+'/'+id+' blocked · a'+c.attempt);return;}
  }
  if(c.status==='ready'||c.status==='rejected')await call({action:'trainingRepair',runId,caseId:id,requestId:requestId(phase+':'+id+':'+c.attempt)});
  else await call({action:'trainingStep',runId,caseId:id});
 }
 throw Error('Nicht abgeschlossener Fall '+phase+'/'+id);
}
async function phase(name,strategyHint=''){
 await call({action:'trainingCreate',autoPhase:name,strategyHint});
 const cases=phasePlan(name).cases;
 for(let i=0;i<cases.length;i+=2){const results=await Promise.allSettled(cases.slice(i,i+2).map(c=>runCase(name,c.id)));save('status-'+name,await call({action:'trainingStatus',runId:phasePlan(name).runId}));const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;}
 save('sealed-'+name,await call({action:'trainingAutoSeal',phase:name}));
}
(async()=>{
 if(process.argv[2]==='probe'){await phase('probe');save('post-study-probe',await call({action:'trainingAutoSummary'}));console.log(JSON.stringify(await call({action:'trainingAutoSummary'})));return;}
 if(process.argv[2]==='status'){const state=await call({action:'trainingAutoSummary'});save('session',state);console.log(JSON.stringify(state));return;}
 try{const state=await call({action:'trainingAutoSummary'});if(state.status==='completed'){save('outcome',await call({action:'trainingAutoFinalize'}));save('session',state);console.log(JSON.stringify(state));return;}}catch(e){if(!e.message.startsWith('NOT_FOUND'))throw e;}
 await phase('dev0');
 for(let round=1;round<=2;round++){const strategy=await call({action:'trainingAutoOptimize',round});save('strategy-v'+round,strategy);await phase('dev'+round,strategy.generationHint);}
 const best=await call({action:'trainingAutoSelect'});save('development',best);
 await phase('test0');if(best.phase!=='dev0')await phase('test1',best.strategyHint);
 const outcome=await call({action:'trainingAutoFinalize'});save('outcome',outcome);save('session',await call({action:'trainingAutoSummary'}));console.log(JSON.stringify(outcome));
})().catch(e=>{save('controller-stop',{at:new Date().toISOString(),error:e.message,uncertainNotRetried:true});console.error(e.message);process.exitCode=1;});
