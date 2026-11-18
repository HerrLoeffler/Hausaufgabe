'use strict';
const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
const {login,PROJECT}=require('../../visual-pilot/access.cjs');
const {RUN,cases}=require('./cases.cjs');
const root=path.resolve(__dirname,'../../../docs/evidence/remy-training-20261118');
fs.mkdirSync(root,{recursive:true});
const save=(name,value)=>fs.writeFileSync(path.join(root,name+'.json'),JSON.stringify(value,null,2)+'\n');
async function call(data){
  const response=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await login()},
    body:JSON.stringify({data}),signal:AbortSignal.timeout(85000)});
  const body=await response.json();
  if(body.error)throw Error(body.error.status+' '+body.error.message);
  return body.result;
}
async function runCase(id){
  for(let turn=0;turn<9;turn++){
    const state=await call({action:'trainingStatus',runId:RUN}),c=state.cases.find(x=>x.id===id);
    if(c.status==='ready'){console.log(id+' ready · attempt '+c.attempt);return;}
    if(c.status==='uncertain')throw Error(id+' unbestätigt · '+c.errors.join(' '));
    if(c.status==='rejected'){
      if(c.attempt>=3){console.log(id+' bleibt als fachlich gesperrter Fall erhalten · '+c.errors.join(' '));return;}
      if(c.errors.some(x=>/model.*(not|exist|found|access)|API key|quota|budget|rate.limit/i.test(x)))throw Error(c.errors.join(' '));
      const requestId=randomUUID();
      save('next-'+id,{at:new Date().toISOString(),action:'repair',requestId,caseId:id,previous:c});
      await call({action:'trainingRepair',runId:RUN,caseId:id,requestId});
    }else{
      save('next-'+id,{at:new Date().toISOString(),action:'step',caseId:id,status:c.status,attempt:c.attempt});
      const result=await call({action:'trainingStep',runId:RUN,caseId:id});
      save('latest-'+id,{at:new Date().toISOString(),caseId:id,...result});
      console.log(id+' '+result.status+' · attempt '+result.attempt+(result.errors?.length?' · '+result.errors.join(' '):''));
    }
  }
  throw Error(id+' nicht terminal');
}
(async()=>{
  const mode=process.argv[2]||'status';
  if(mode==='init'){save('initial',await call({action:'trainingCreate',calibration:true}));}
  else if(mode==='recheck'){
    const state=await call({action:'trainingStatus',runId:RUN});
    const requested=process.argv.slice(3);
    for(const c of state.cases.filter(c=>requested.length?requested.includes(c.id):c.status==='rejected')){
      const file=path.join(root,'recheck-'+c.id+'.json');
      const receipt=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):
        {caseId:c.id,requestId:randomUUID(),reason:'Korrigierte Beschreibung der tatsächlich sichtbaren freien Pfeilfelder und numerisches Prüferantwortformat, Quelle f20da23.'};
      save('recheck-'+c.id,receipt);
      const result=await call({action:'trainingRecheck',runId:RUN,...receipt});
      console.log(c.id+' recheck '+result.revision);
    }
  }
  else if(mode==='run'){
    const ids=process.argv.slice(3);
    const chosen=ids.length?ids:cases.map(c=>c.id);
    for(let i=0;i<chosen.length;i+=2){
      const result=await Promise.allSettled(chosen.slice(i,i+2).map(runCase));
      const state=await call({action:'trainingStatus',runId:RUN});save('status',state);
      const failed=result.filter(x=>x.status==='rejected');
      if(failed.length)throw Error(failed.map(x=>x.reason.message).join('\n'));
    }
  }
  const state=await call({action:'trainingStatus',runId:RUN});save('status',state);
  console.log(JSON.stringify({counts:state.cases.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{}),spentUSD:state.spentMicros/1e6,reservedUSD:state.reservedMicros/1e6}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
