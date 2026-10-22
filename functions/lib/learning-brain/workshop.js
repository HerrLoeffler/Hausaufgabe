'use strict';
// Own, versioned learning models. No third-party simulation code or assets.
const {rational}=require('./exact');
class WorkshopError extends Error{constructor(message){super(message);this.code='invalid-argument';}}
const bad=message=>{throw new WorkshopError(message);};
const registry=Object.freeze({
 'fraction-board':Object.freeze({id:'fraction-board',version:1,label:'Anteile und Unterteilungen',capabilities:['represent-part-whole','subdivide-preserving-value'],actions:['set-parts','toggle-part','partition','reset'],evidence:['selected-part-count','total-equal-parts','value-preserved','target-denominator'],limits:{maxParts:36,maxActions:60},supports:topic=>topic?.subject==='math'&&/Br[üu]ch|Anteil|erweitern|kürzen/i.test([topic.title,topic.goal].join(' '))})
});
function toolsFor(topic){return Object.values(registry).filter(t=>t.supports(topic)).map(({supports,...t})=>t);}
function validateConfig(c,topic,task){
 if(!c||c.tool==='none')return null;
 const adapter=registry[c.tool];
 if(!adapter||c.version!==adapter.version||!adapter.supports(topic)||!['answer','support'].includes(c.role)||!['represent','equivalent'].includes(c.goal))bad('Dieses Werkzeug passt noch nicht zur Aufgabe.');
 if(![c.numerator,c.denominator,c.targetDenominator].every(Number.isInteger)||c.numerator<0||c.numerator>c.denominator||c.denominator<1||c.denominator>12||typeof c.instruction!=='string'||!c.instruction.trim()||c.instruction.length>240)bad('Die Werkstatt-Vorgabe ist ungültig.');
 if(c.goal==='equivalent'&&(c.targetDenominator<=c.denominator||c.targetDenominator>36||c.targetDenominator%c.denominator))bad('Die Zielunterteilung passt nicht.');
 if(c.goal==='represent'&&c.targetDenominator!==0)bad('Für das Darstellen ist kein Zielnenner nötig.');
 if(task.input==='workshop'&&c.role!=='answer'||task.input!=='workshop'&&c.role==='answer')bad('Werkzeug und Antwortfeld passen nicht zusammen.');
 if(c.role==='answer'){
  const goal=c.goal==='equivalent'?[BigInt(c.numerator*c.targetDenominator/c.denominator),BigInt(c.targetDenominator)]:[BigInt(c.numerator),BigInt(c.denominator)];
  if(!['rational','exact-fraction','number'].includes(task.answer?.kind)||!task.answer.values?.length)bad('Die Werkstatt braucht einen geprüften Zahlenschlüssel.');
  if(c.goal==='equivalent'&&task.answer.kind!=='exact-fraction')bad('Der Zielnenner muss im Zahlenschlüssel erhalten bleiben.');
  if(task.answer.values.some(v=>{const r=rational(v);return !r||(c.goal==='equivalent'?(r[0]!==goal[0]||r[1]!==goal[1]):r[0]*goal[1]!==goal[0]*r[1]);}))bad('Werkstatt und Lösungsschlüssel stimmen nicht überein.');
 }
 // Explicit projection; no model-supplied markup or secret keys survive.
 return {tool:c.tool,version:1,role:c.role,goal:c.goal,numerator:c.numerator,denominator:c.denominator,targetDenominator:c.targetDenominator,instruction:c.instruction};
}
function initial(c){
 if(c.initialState){const v=c.initialState;if(!Number.isInteger(v.parts)||v.parts<1||v.parts>36||!Array.isArray(v.selected)||v.selected.length>36||new Set(v.selected).size!==v.selected.length||v.selected.some(i=>!Number.isInteger(i)||i<0||i>=v.parts))bad('Ungültige Ausgangsdarstellung.');return {parts:v.parts,selected:[...v.selected]};}
 return {parts:c.denominator,selected:c.goal==='equivalent'?Array.from({length:c.numerator},(_,i)=>i):[]};}
function followupConfig(c,observation){
 if(c?.goal!=='equivalent'||observation?.tool!==c.tool||observation.goal!==c.goal||observation.source?.numerator!==c.numerator||observation.source?.denominator!==c.denominator)return c;
 const start={parts:observation.final.denominator,selected:observation.selection};
 const state=initial({...c,initialState:start});
 if(state.selected.length!==observation.final.numerator)bad('Ausgangsdarstellung und Beobachtung passen nicht zusammen.');
 return {...c,initialState:state};
}
function apply(state,a){
 if(!a||Object.keys(a).some(k=>!['type','value'].includes(k))||!Number.isInteger(a.value))bad('Ungültiger Werkstattschritt.');
 let {parts,selected}=state;selected=[...selected];
 switch(a.type){
 case 'set-parts':if(a.value<1||a.value>36)bad('Bitte 1 bis 36 gleich große Teile wählen.');parts=a.value;selected=selected.filter(i=>i<parts);break;
 case 'toggle-part':if(a.value<0||a.value>=parts)bad('Dieses Teil gibt es nicht.');selected=selected.includes(a.value)?selected.filter(i=>i!==a.value):[...selected,a.value];break;
 case 'partition':if(a.value<2||a.value>6||parts*a.value>36)bad('Diese Unterteilung ist zu groß.');selected=selected.flatMap(i=>Array.from({length:a.value},(_,j)=>i*a.value+j));parts*=a.value;break;
 default:bad('Unbekannte Werkstatthandlung.');
 }
 return {parts,selected:selected.sort((a,b)=>a-b)};
}
function observe(task,payload){
 const c=task.workshop;
 if(!c||!registry[c.tool]||payload?.tool!==c.tool||payload.version!==c.version||payload.taskId!==task.id||Object.keys(payload).some(k=>!['tool','version','taskId','actions'].includes(k))||!Array.isArray(payload.actions)||payload.actions.length>60)bad('Die Darstellung gehört nicht zur aktuellen Aufgabe.');
 let state=initial(c);const changes=[];
 for(const a of payload.actions){const before={numerator:state.selected.length,denominator:state.parts};state=a?.type==='reset'&&a.value===0&&Object.keys(a).every(k=>['type','value'].includes(k))?initial(c):apply(state,a);changes.push({type:a.type,value:a.value,before,after:{numerator:state.selected.length,denominator:state.parts}});}
 const final={numerator:state.selected.length,denominator:state.parts};
 const valuePreserved=final.numerator*c.denominator===c.numerator*final.denominator;
 return {tool:c.tool,version:1,role:c.role,goal:c.goal,source:{numerator:c.numerator,denominator:c.denominator},final,selection:[...state.selected],answer:`${final.numerator}/${final.denominator}`,valuePreserved,targetReached:valuePreserved&&(c.goal==='represent'||final.denominator===c.targetDenominator),actionCount:payload.actions.length,changes:changes.slice(-12)};
}
module.exports={registry,toolsFor,validateConfig,followupConfig,observe,WorkshopError};
