'use strict';
const {projectSkill}=require('./core');
const {eligibility}=require('./planning');
const META=['id','parentTopicId','title','goal','subject','grade','track','area','source','prerequisites','didacticFamily','delivery','assessmentScope','evidenceBoundary','learningPlan'];
function matches(topic,context={}){
 return ['grade','track','subject','area','parentTopicId'].every(key=>context[key]===undefined||context[key]===null||context[key]===''||topic[key]===(key==='grade'?Number(context[key]):context[key]));
}
function evidenceFor(topic,events,now){return projectSkill(events,now,topic);}
function usingHelp(events){
 const last=events.at(-1);if(last?.kind==='help-requested'||(last?.independent===false&&last?.correct===true))return true;
 const unique=new Set();const recent=events.filter(e=>e.independent&&!unique.has(e.fingerprint)&&unique.add(e.fingerprint)).slice(-2);
 return recent.length===2&&recent.every(e=>e.correct===false)&&last?.correct!==true;
}
function chooseCompetency(catalog,topicEvents={},context={},now=Date.now()){
 const competencies=catalog.competencies||[];
 const candidates=competencies.filter(t=>matches(t,context)&&eligibility(t).available);
 const rank=t=>{const e=evidenceFor(t,topicEvents[t.id]||[],now);return e.reviewDue?0:e.status==='practicing'?1:e.status==='unseen'?2:3;};
 candidates.sort((a,b)=>rank(a)-rank(b)||(evidenceFor(b,topicEvents[b.id]||[],now).lastPracticed||0)-(evidenceFor(a,topicEvents[a.id]||[],now).lastPracticed||0));
 let chosen=candidates[0];if(!chosen)return null;
 // Prerequisites are suggestions within the selected year/subject, never locks.
 const visited=new Set(),scope={grade:chosen.grade,subject:chosen.subject,track:chosen.track};
 while(chosen&&!visited.has(chosen.id)){
  visited.add(chosen.id);
  const prerequisite=(chosen.prerequisites||[]).map(id=>competencies.find(t=>t.id===id)).find(t=>t&&!visited.has(t.id)&&matches(t,scope)&&eligibility(t).available&&evidenceFor(t,topicEvents[t.id]||[],now).status!=='secure');
  if(!prerequisite)break;chosen=prerequisite;
 }
 return chosen;
}
function projectNetwork(catalog,topicEvents={},sessions={},now=Date.now(),context={}){
 const selected=(catalog.competencies||[]).filter(t=>matches(t,context));
 const next=chooseCompetency(catalog,topicEvents,context,now);
 const nodes=selected.map(topic=>{
  const events=topicEvents[topic.id]||[],evidence=evidenceFor(topic,events,now);
  const activeSessions=Object.values(sessions||{}).filter(s=>s.topic?.id===topic.id&&(!context.activeSessionId||s.id===context.activeSessionId)&&s.phase!=='ended'&&Number(s.deadline)>now);
  const help=activeSessions.some(s=>['help','completion','teacher'].includes(s.phase))||usingHelp(events);
  const state=help?'using-help':evidence.reviewDue?'review':evidence.status==='secure'?'demonstrated':events.length?'practicing':'unassessed';
  const metadata={};for(const key of META)if(topic[key]!==undefined)metadata[key]=topic[key];
  return {...metadata,evidence,state,recommended:next?.id===topic.id,active:activeSessions.length>0};
 });
 const ids=new Set(nodes.map(n=>n.id));
 const edges=nodes.flatMap(n=>(n.prerequisites||[]).filter(id=>ids.has(id)).map(id=>({from:id,to:n.id,type:'prerequisite'})));
 const counts={unassessed:0,practicing:0,'using-help':0,demonstrated:0,review:0};for(const node of nodes)counts[node.state]++;
 return {version:catalog.competencyVersion||catalog.version,nodes,edges,nextTopicId:next?.id||null,coverage:{total:nodes.length,assessed:nodes.filter(n=>n.evidence.independent>0||n.evidence.supported>0).length,states:counts}};
}
module.exports={projectNetwork,chooseCompetency};
