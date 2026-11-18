'use strict';
const {RUN}=require('./cases.cjs');
const {GRAPH_RUN}=require('./graph-profile.cjs');
const {sharedId}=require('./auto-manifest.cjs');
const runRef=(db,id)=>db.doc('taskLearningRuns/'+id);
function authorizeRun(run,uid){
  return !!run&&!!uid&&(run.ownerId===uid||run.sharedPilot===true&&([RUN,GRAPH_RUN].includes(run.id)||sharedId(run.id))&&run.ownerId==='gc-visual255-e2e');
}
async function reserve(db,runId,stepId,amount){
  if(!Number.isSafeInteger(amount)||amount<=0)throw Error('Ungültige Kostenreservierung.');
  const run=runRef(db,runId),step=db.doc(run.path+'/providerCalls/'+stepId);
  return db.runTransaction(async tx=>{
    const prior=await tx.get(step);
    if(prior.exists)return {dispatch:false,call:prior.data()};
    const value=(await tx.get(run)).data();
    const parent=value.autoSessionId?db.doc('taskLearningAutoRuns/'+value.autoSessionId):null;
    const session=parent?(await tx.get(parent)).data():null;
    if(parent&&(!session||session.ownerId!==value.ownerId||session.status!=='running'))throw Error('Automatischer Lauf ist nicht aktiv oder gehört einem anderen Konto.');
    if(session&&session.spentMicros+session.reservedMicros+amount>session.limitMicros)throw Error('Das gemeinsame Budget ist ausgeschöpft.');
    if(value.status==='paused')throw Error('Die Serie ist pausiert.');
    if(value.spentMicros+value.reservedMicros+amount>value.limitMicros)throw Error('Das Budget ist ausgeschöpft.');
    if(parent)tx.update(parent,{reservedMicros:session.reservedMicros+amount});
    tx.update(run,{reservedMicros:value.reservedMicros+amount});
    tx.create(step,{status:'dispatching',reservedMicros:amount,startedAt:new Date().toISOString()});
    return {dispatch:true};
  });
}
async function settle(db,runId,stepId,result){
  const run=runRef(db,runId),step=db.doc(run.path+'/providerCalls/'+stepId);
  return db.runTransaction(async tx=>{
    const previous=(await tx.get(step)).data();
    if(!previous||previous.status==='completed')return;
    if(result.status!=='completed'){
      tx.update(step,{...result,status:'uncertain'});
      return;
    }
    const value=(await tx.get(run)).data();
    const parent=value.autoSessionId?db.doc('taskLearningAutoRuns/'+value.autoSessionId):null;
    const session=parent?(await tx.get(parent)).data():null;
    const spent=result.costMicros??previous.reservedMicros;
    if(!Number.isSafeInteger(spent)||spent<0)throw Error('Ungültiger Kostenbeleg.');
    if(parent)tx.update(parent,{reservedMicros:session.reservedMicros-previous.reservedMicros,spentMicros:session.spentMicros+spent});
    tx.update(run,{reservedMicros:value.reservedMicros-previous.reservedMicros,spentMicros:value.spentMicros+spent});
    tx.update(step,{...result,finishedAt:new Date().toISOString(),status:'completed'});
  });
}
module.exports={reserve,settle,authorizeRun,runRef};
