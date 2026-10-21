const repo='HerrLoeffler/Hausaufgabe';
const branchUrl=`https://api.github.com/repos/${repo}/branches/main`;
const rawBase=`https://raw.githubusercontent.com/${repo}/`;
const stagingReleaseUrl='https://gradecrew-staging-2026.web.app/release.json';
const stagingFunctions='https://europe-west1-gradecrew-staging-2026.cloudfunctions.net/';
const shaPattern=/^[0-9a-f]{40}$/;
const handoffPattern=/^workstreams\/[a-zA-Z0-9._-]+\.md$/;

async function responseText(response,maxBytes=1_048_576){
 if(!response.ok)throw Error(`Quelle antwortet mit HTTP ${response.status}.`);
 const reader=response.body?.getReader();
 if(!reader){const text=await response.text();if(Buffer.byteLength(text)>maxBytes)throw Error('Quelle ist zu groß.');return text;}
 const chunks=[];let bytes=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>maxBytes)throw Error('Quelle ist zu groß.');chunks.push(value);}}
 finally{reader.releaseLock();}
 return Buffer.concat(chunks,bytes).toString('utf8');
}

export function createProjectReader({fetchImpl=fetch,stagingToken=()=>''}={}){
 async function get(url,options){
  const response=await fetchImpl(url,{...options,signal:AbortSignal.timeout(8000)});
  const text=await responseText(response);
  try{return JSON.parse(text);}catch{throw Error('Quelle liefert kein gültiges JSON.');}
 }
 async function mainCommit(){
  const branch=await get(branchUrl,{headers:{accept:'application/vnd.github+json'}});
  const sha=branch?.commit?.sha;
  if(!shaPattern.test(sha??''))throw Error('GitHub-main hat keinen prüfbaren Commit.');
  return sha;
 }
 const raw=(sha,path)=>`${rawBase}${sha}/${path}`;
 async function registry(sha){
  const data=await get(raw(sha,'workstreams/registry.json'));
  if(!Array.isArray(data?.workstreams))throw Error('Workstream-Register ist ungültig.');
  return data.workstreams;
 }
 function projectWorkstream(w){return {id:w.id,title:w.title,primaryBranch:w.primaryBranch,integrationTarget:w.integrationTarget,state:w.state,...(w.handoff?{handoff:w.handoff}:{})};}
 async function status(){
  const sha=await mainCommit();
  const [state,streams]=await Promise.all([get(raw(sha,'GRADECREW_STATE.json')),registry(sha)]);
  if(!state?.release_train||!state?.production)throw Error('Projektstatus ist unvollständig.');
  const production=state.production;
  if(!['hausaufgabe-40294','hausaufgabe-staging'].includes(production.project)||production.approval_required!==true||typeof production.deployment_verified_this_session!=='boolean'||typeof production.changed_by_current_release_train!=='boolean')throw Error('Production-Freigabe und Deploy-Nachweis sind unvollständig oder ungültig.');
  const train=state.release_train;
  return {source:'GitHub main',mainCommit:sha,observedAt:state.observed_at??null,releaseTrain:{id:train.id,integrationBranch:train.integration_branch,observedIntegrationHead:train.observed_integration_head,gates:train.gates??{},canonicalUrl:train.canonical_url??null,previewUrl:train.preview_url??null,nextAction:train.next_action??null},production:{project:production.project,approvalRequired:true,deploymentVerifiedThisSession:production.deployment_verified_this_session,changedByCurrentReleaseTrain:production.changed_by_current_release_train},workstreamCount:streams.length};
 }
 async function workstreams(id){
  const sha=await mainCommit();const streams=await registry(sha);
  const selected=id?streams.filter(w=>w.id===id):streams;
  if(id&&!selected.length)throw Error('Workstream nicht gefunden.');
  return {source:'GitHub main',mainCommit:sha,workstreams:selected.map(projectWorkstream)};
 }
 async function handoff(id){
  if(typeof id!=='string'||!id||id.length>100)throw Error('Workstream-ID ist ungültig.');
  const sha=await mainCommit();const streams=await registry(sha);
  const stream=streams.find(w=>w.id===id);
  if(!stream)throw Error('Workstream nicht gefunden.');
  if(!handoffPattern.test(stream.handoff??''))throw Error('Für diesen Workstream ist keine sichere Übergabe hinterlegt.');
  const response=await fetchImpl(raw(sha,stream.handoff),{signal:AbortSignal.timeout(8000)});
  const content=await responseText(response,131_072);
  return {source:'GitHub main',mainCommit:sha,workstream:projectWorkstream(stream),content:content.slice(0,30_000),truncated:content.length>30_000};
 }
 async function stagingRelease(){
  const data=await get(stagingReleaseUrl);
  if(data?.project!=='gradecrew-staging-2026'||!shaPattern.test(data.commit??''))throw Error('Release-Nachweis gehört nicht zum geprüften Staging-Projekt.');
  return {source:stagingReleaseUrl,release:{commit:data.commit,version:data.version??null,project:data.project},fileCount:data.files&&typeof data.files==='object'?Object.keys(data.files).length:null};
 }
 async function stagingRead(dataset,cursor){
  const endpoints={
   visual_feedback:{name:'reviewMode',data:{action:'list',area:'visual-feedback'}},
   bugops_summary:{name:'getBugOpsSummary',data:{}},
   crew_telemetry_summary:{name:'getCrewTelemetrySummary',data:{days:30}}
  };
  if(!Object.hasOwn(endpoints,dataset))throw Error('Datensatz ist nicht freigegeben.');
  const endpoint=endpoints[dataset];
  if(cursor!==undefined){
   if(dataset!=='visual_feedback'||typeof cursor!=='string'||cursor.length>128||!/^[\w-]+$/.test(cursor))throw Error('Cursor ist für diesen Datensatz ungültig.');
   endpoint.data.cursor=cursor;
  }
  const token=stagingToken();
  if(typeof token!=='string'||!token.trim())throw Error('Staging-Anmeldung fehlt. Bitte zuerst gradecrew_staging_connect verwenden.');
  let data;
  try{data=await get(stagingFunctions+endpoint.name,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token.trim()}`},body:JSON.stringify({data:endpoint.data})});}
  catch(error){throw Error(`Staging-Lesezugriff fehlgeschlagen: ${error.message}`);}
  if(data?.error)throw Error('Staging hat den Lesezugriff abgelehnt. Anmeldung und Rolle prüfen.');
  if(!data||!Object.hasOwn(data,'result'))throw Error('Staging lieferte kein Callable-Ergebnis.');
  if(dataset==='visual_feedback'){
   const safe=['id','text','status','area','view','target','build','createdAt','updatedAt','region'];
   const notes=Array.isArray(data.result.notes)?data.result.notes.slice(0,100).map(note=>Object.fromEntries(safe.filter(key=>Object.hasOwn(note,key)).map(key=>[key,note[key]]))):[];
   return {source:'gradecrew-staging-2026/reviewMode',dataset,notes,nextCursor:data.result.nextCursor??null};
  }
  return {source:`gradecrew-staging-2026/${endpoint.name}`,dataset,summary:data.result};
 }
 return {status,workstreams,handoff,stagingRelease,stagingRead};
}
