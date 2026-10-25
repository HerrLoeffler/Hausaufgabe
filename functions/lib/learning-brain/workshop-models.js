'use strict';
// Bounded semantic models; public configs contain only the visible problem data.
const {rational}=require('./exact');
const bad=message=>{const e=new Error(message);e.code='invalid-argument';throw e;};
const n=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
const text=(v,max)=>typeof v==='string'&&v.length<=max;
const title=t=>[t?.title,t?.goal,t?.area].join(' ');
const supported={
 'angle-protractor':t=>t?.subject==='math'&&/Winkel|Geodreieck|Schenkel/i.test(title(t)),
 'coordinate-plane':t=>t?.subject==='math'&&/Koordinat|Quadrant|Punkte? (?:setzen|eintragen|verorten)/i.test(title(t)),
 'number-line':t=>t?.subject==='math'&&/Zahl|Br[üu]ch|Anteil|Prozent|rational|Stellen|Koordinat/i.test(title(t)),
 balance:t=>t?.subject==='math'&&/Gleichung|Gleichgewicht|Unbekannt|Umkehr|Term|Variable/i.test(title(t)),
 'text-workbench':t=>t?.subject==='german'&&/W[oö]rt|S[aä]tz|Grammatik|Rechtschreib|Sprach|Zeichen|Beleg|Lesen|Information|Textstelle/i.test(title(t))
};
const registry=Object.fromEntries(Object.entries(supported).map(([id,supports])=>[id,Object.freeze({id,version:1,label:{'angle-protractor':'Winkelmesser','coordinate-plane':'Koordinatensystem','number-line':'Zahlenstrahl',balance:'Gleichgewichtswaage','text-workbench':'Wörter und Sätze'}[id],capabilities:{'angle-protractor':['set-ray-on-degree-scale'],'coordinate-plane':['plot-labeled-points-on-grid'],'number-line':['locate-number-on-scale'],balance:['preserve-equation','solve-unknown'],'text-workbench':['select-text-evidence','order-sentence']}[id],actions:{'angle-protractor':['set-value','reset'],'coordinate-plane':['set-point','connect-points','reset'],'number-line':['set-value','reset'],balance:['set-value','shift-both','divide-both','reset'],'text-workbench':['toggle-token','move-left','move-right','reset']}[id],limits:{maxActions:id==='coordinate-plane'?40:60},supports})]));
function onGrid(c,value){
 if(!n(value,c.minimum,c.maximum))return false;
 const v=rational(value),m=rational(c.minimum),s=rational(c.step);if(!v||!m||!s)return false;
 const num=(v[0]*m[1]-m[0]*v[1])*s[1],den=v[1]*m[1]*s[0];return den>0n&&num%den===0n;
}
function range(c){if(!n(c.minimum,-10000,10000)||!n(c.maximum,-10000,10000)||c.minimum>=c.maximum||!n(c.step,0.001,10000)||(c.maximum-c.minimum)/c.step>100||!onGrid(c,c.maximum)||!onGrid(c,c.initialValue))bad('Skala, Schrittweite und Ausgangswert passen nicht zusammen.');}
function privateNumber(task,accept){if(task.answer?.kind==='open'||!task.answer?.values?.length||task.answer.values.some(v=>{const r=rational(v);return !r||!accept(r);} ))bad('Darstellung und privater Lösungsschlüssel passen nicht zusammen.');}
const coordinateLabel=value=>typeof value==='string'&&/^[a-z][a-z0-9_]{0,11}$/i.test(value)?value.toUpperCase():null;
const pointOrder=(a,b)=>a.label<b.label?-1:a.label>b.label?1:0;
const pointAnswer=points=>[...points].sort(pointOrder).map(p=>`${p.label}:${Object.is(p.x,-0)?0:p.x}|${Object.is(p.y,-0)?0:p.y}`).join(';');
function pointOnGrid(c,p){return onGrid({minimum:c.xMin,maximum:c.xMax,step:c.step},p.x)&&onGrid({minimum:c.yMin,maximum:c.yMax,step:c.step},p.y);}
function coordinatePoints(c,points,complete=false){
 if(!Array.isArray(points)||points.length>c.labels.length)bad('Bitte nur die vorgegebenen Punkte verwenden.');
 const result=points.map(p=>{
  if(!p||typeof p!=='object'||Object.keys(p).some(k=>!['label','x','y'].includes(k)))bad('Ungültige Punktdarstellung.');
  const label=coordinateLabel(p.label);if(!label||!c.labels.includes(label)||!pointOnGrid(c,p))bad('Beschriftung und Koordinaten müssen zum angebotenen Gitter passen.');
  return {label,x:Object.is(p.x,-0)?0:p.x,y:Object.is(p.y,-0)?0:p.y};
 }).sort(pointOrder);
 if(new Set(result.map(p=>p.label)).size!==result.length||complete&&result.length!==c.labels.length)bad('Jede vorgegebene Punktbeschriftung muss genau einmal vorkommen.');
 return result;
}
const edgeKey=e=>e.from+'-'+e.to;
const edgeOrder=(a,b)=>edgeKey(a)<edgeKey(b)?-1:edgeKey(a)>edgeKey(b)?1:0;
function coordinateEdge(c,from,to){
 const labels=[coordinateLabel(from),coordinateLabel(to)].sort();
 if(labels.some(v=>!v||!c.labels.includes(v))||labels[0]===labels[1])bad('Eine Verbindung braucht zwei verschiedene vorgegebene Punkte.');
 return {from:labels[0],to:labels[1]};
}
function coordinateState(c){return {points:coordinatePoints(c,c.initialPoints),...c.goal==='plot-and-connect'?{edges:[]}: {}};}
function coordinateAnswer(c,state){return pointAnswer(state.points)+(c.goal==='plot-and-connect'?'#'+state.edges.map(edgeKey).join(','):'');}
function coordinateKey(c,value){
 if(typeof value!=='string'||!value.trim()||value.length>600)bad('Der Koordinatenschlüssel muss alle Punkte enthalten.');
 const parts=value.split('#');if(c.goal==='plot-and-connect'?parts.length!==2:parts.length!==1)bad('Der Lösungsschlüssel braucht genau den Punkt- und gegebenenfalls Kantenteil.');
 const points=parts[0].split(';').map(part=>{
  const m=part.trim().match(/^([a-z][a-z0-9_]{0,11})\s*:\s*([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))\s*\|\s*([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))$/i);
  if(!m)bad('Der Koordinatenschlüssel braucht das Format A:2|3;B:4|1.');
  return {label:m[1],x:Number(m[2].replace(',','.')),y:Number(m[3].replace(',','.'))};
 });
 const state={points:coordinatePoints(c,points,true)};
 if(c.goal==='plot-and-connect'){
  state.edges=parts[1].split(',').map(value=>{const m=value.trim().match(/^([a-z][a-z0-9_]{0,11})\s*-\s*([a-z][a-z0-9_]{0,11})$/i);if(!m)bad('Der Kantenschlüssel braucht das Format A-B,B-C.');return coordinateEdge(c,m[1],m[2]);}).sort(edgeOrder);
  if(!state.edges.length||state.edges.length>15||new Set(state.edges.map(edgeKey)).size!==state.edges.length)bad('Der Kantenschlüssel braucht eindeutige Verbindungen ohne Wiederholungen.');
 }
 return coordinateAnswer(c,state);
}
function coordinateKeys(c,task){
 const answer=task.answer;if(answer?.kind!=='open'||!Array.isArray(answer.values)||!answer.values.length||answer.values.length>12)bad('Das Koordinatenwerkzeug braucht einen vollständigen offenen Punkteschlüssel.');
 return answer.values.map(v=>coordinateKey(c,v));
}
function validateCoordinates(c,common,task){
 if(!['plot','plot-and-connect'].includes(c.goal)||!Array.isArray(c.labels)||c.labels.length<1||c.labels.length>6||!n(c.step,.001,1000))bad('Ungültige Koordinatenvorgabe.');
 const labels=c.labels.map(coordinateLabel);if(labels.some(v=>!v)||new Set(labels).size!==labels.length)bad('Punktbeschriftungen müssen kurz und eindeutig sein.');labels.sort();
 const canonical={...common,xMin:c.xMin,xMax:c.xMax,yMin:c.yMin,yMax:c.yMax,step:c.step,labels};
 for(const [minimum,maximum] of [[c.xMin,c.xMax],[c.yMin,c.yMax]]){
  const axis={minimum,maximum,step:c.step};
  if(!n(minimum,-1000,0)||!n(maximum,0,1000)||minimum>=maximum||(maximum-minimum)/c.step>20||!onGrid(axis,maximum)||!onGrid(axis,0))bad('Beide Achsen brauchen null und höchstens zwanzig genaue Gitterabstände.');
 }
 canonical.initialPoints=coordinatePoints(canonical,c.initialPoints);
 if(c.role==='answer'&&coordinateKeys(canonical,task).includes(coordinateAnswer(canonical,coordinateState(canonical))))bad('Die Ausgangspunkte dürfen keine vollständige Ziellösung vorwegnehmen.');
 return canonical;
}
function applyCoordinate(c,state,a){
 if(!a||typeof a!=='object'||Array.isArray(a))bad('Ungültige Koordinatenhandlung.');
 if(a.type==='reset'&&Object.keys(a).every(k=>k==='type'||k==='value')&&(a.value===undefined||a.value===0))return coordinateState(c);
 if(a.type==='connect-points'){
  if(c.goal!=='plot-and-connect'||Object.keys(a).some(k=>!['type','from','to'].includes(k)))bad('Diese Verbindung gehört nicht zum Auftrag.');
  const edge=coordinateEdge(c,a.from,a.to);if(!state.points.some(p=>p.label===edge.from)||!state.points.some(p=>p.label===edge.to))bad('Setze zuerst beide Punkte der Verbindung.');
  const exists=state.edges.some(e=>edgeKey(e)===edgeKey(edge));return {...state,edges:(exists?state.edges.filter(e=>edgeKey(e)!==edgeKey(edge)):[...state.edges,edge]).sort(edgeOrder)};
 }
 if(a.type!=='set-point'||Object.keys(a).some(k=>!['type','label','x','y'].includes(k)))bad('Nur vorgegebene Punkte können gesetzt werden.');
 const point=coordinatePoints(c,[{label:a.label,x:a.x,y:a.y}])[0];
 return {...state,points:[...state.points.filter(p=>p.label!==point.label),point].sort(pointOrder)};
}
// Literal source-span guard only: rubric interpretation and paraphrases still need review.
const words=value=>(typeof value==='string'?value.normalize('NFKC').toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}]+/gu):null)||[];
const phrase=value=>words(value).join(' ');
const containsPhrase=(text,span)=>` ${text} `.includes(` ${span} `);
function explicitlyNames(value,span){
 if(typeof value!=='string')return false;
 for(const match of value.matchAll(/["„“”«»'‚‘]([^"„“”«»'‚‘]+)["„“”«»'‚‘]/gu))if(phrase(match[1])===span)return true;
 // Do not confuse an incidental article/preposition with naming a one-word answer.
 if(!span.includes(' ')&&['am','an','auf','aus','bei','das','dem','den','der','des','die','ein','eine','im','in','ist','mit','und','von','zu'].includes(span))return false;
 return new RegExp(`(?:^| )(?:markiere|markier|wähle|waehle|klicke|tippe)(?: bitte)? (?:(?:das wort|die wörter|die wortgruppe|die gruppe|den ausdruck|den textteil) )?${span}(?: |$)`,'u').test(phrase(value));
}
function rejectSelectionLeak(c,task){
 if(c.role!=='answer'||c.mode!=='select')return;
 const source=phrase(c.text);
 for(const value of task.answer.values){
  const span=phrase(value);if(!span||!containsPhrase(source,span)||explicitlyNames(task.prompt,span))continue;
  // Repeating the entire original sentence as context does not itself identify its answer.
  const instruction=span===source?phrase(c.instruction):phrase(c.instruction).replace(new RegExp(`(^| )${source}(?= |$)`,'gu'),'$1');
  if(explicitlyNames(c.instruction,span)||span.includes(' ')&&containsPhrase(instruction,span))bad('Die Werkstattanweisung darf den gesuchten Textbeleg nicht vorwegnehmen.');
 }
}
function invalidText(mode,message,details={}){
 const safeMode=['select','order'].includes(mode)?mode:'invalid';
 const error=new Error(`Textwerkstatt (${safeMode}): ${message}`);error.code='invalid-argument';
 error.diagnostic={tool:'text-workbench',mode:safeMode,...details};throw error;
}
function validate(c,topic,task){
 if(!Object.hasOwn(registry,c.tool)||!registry[c.tool].supports(topic)||c.version!==1||!['answer','support'].includes(c.role)||!text(c.instruction,240)||!c.instruction.trim()||(task.input==='workshop')!==(c.role==='answer'))bad('Dieses Werkzeug passt nicht zum Lernziel und Antwortweg.');
 const common={tool:c.tool,version:1,role:c.role,goal:c.goal,instruction:c.instruction};
 if(c.tool==='coordinate-plane')return validateCoordinates(c,common,task);
 if(c.tool==='angle-protractor'){
  if(c.goal!=='set-angle'||c.minimum!==0||c.maximum!==180||!integer(c.step,1,10)||180%c.step||!onGrid(c,c.initialValue))bad('Der Winkelmesser braucht 0 bis 180 Grad und eine passende ganze Gradschrittweite.');
  if(c.role==='answer'){
   if(task.answer?.kind!=='number')bad('Der Winkelmesser braucht einen numerischen Gradschlüssel.');
   privateNumber(task,r=>onGrid(c,Number(r[0])/Number(r[1])));
   if(task.answer.values.some(v=>{const r=rational(v),i=rational(c.initialValue);return r[0]*i[1]===i[0]*r[1];}))bad('Der Ausgangsschenkel darf nicht schon den gesuchten Winkel zeigen.');
  }
  return {...common,minimum:0,maximum:180,step:c.step,initialValue:c.initialValue};
 }
 if(c.tool==='number-line'){
  if(c.goal!=='locate'||!text(c.unit,30))bad('Ungültiger Zahlenstrahl.');range(c);
  if(c.role==='answer'){privateNumber(task,r=>onGrid(c,Number(r[0])/Number(r[1])));if(task.answer.values.some(v=>{const r=rational(v),i=rational(c.initialValue);return r[0]*i[1]===i[0]*r[1];}))bad('Der Startmarker darf die gesuchte Antwort nicht vorwegnehmen.');}
  return {...common,minimum:c.minimum,maximum:c.maximum,step:c.step,initialValue:c.initialValue,unit:c.unit};
 }
 if(c.tool==='balance'){
  if(c.goal!=='balance'||![c.leftCoefficient,c.rightCoefficient].every(v=>integer(v,0,12))||![c.leftConstant,c.rightConstant].every(v=>integer(v,0,100))||c.leftCoefficient===c.rightCoefficient||c.minimum<0)bad('Die Gleichung der Waage ist ungültig.');range(c);
  const a=c.leftCoefficient-c.rightCoefficient,b=c.rightConstant-c.leftConstant;
  if(!onGrid(c,b/a))bad('Die Waagenlösung liegt nicht auf der angebotenen Skala.');
  if(c.role==='answer'){privateNumber(task,r=>r[0]*BigInt(a)===BigInt(b)*r[1]);if(a*c.initialValue===b)bad('Die Waage darf nicht mit dem gesuchten Gewicht bereits im Gleichgewicht starten.');}
  return {...common,leftCoefficient:c.leftCoefficient,leftConstant:c.leftConstant,rightCoefficient:c.rightCoefficient,rightConstant:c.rightConstant,minimum:c.minimum,maximum:c.maximum,step:c.step,initialValue:c.initialValue};
 }
 if(c.tool==='text-workbench'){
  if(c.goal!=='text'||!['select','order'].includes(c.mode))invalidText(c.mode,'goal muss text und mode muss select oder order sein.',{field:'mode'});
  if(!text(c.text,1200))invalidText(c.mode,'text muss eine Zeichenfolge mit höchstens 1200 Zeichen sein.',{field:'text'});
  if(!Array.isArray(c.tokens))invalidText(c.mode,'tokens muss ein Array sein.',{field:'tokens'});
  const tokens=c.mode==='select'?c.text.trim().split(/\s+/).filter(Boolean):c.tokens,field=c.mode==='select'?'text':'tokens';
  if(tokens.length<2||tokens.length>40)invalidText(c.mode,`${field} enthält ${tokens.length} Token; erlaubt sind 2 bis 40.`,{field,tokenCount:tokens.length});
  if(c.mode==='select'&&c.tokens.length&&(c.tokens.length!==tokens.length||c.tokens.some((token,index)=>token!==tokens[index])))invalidText(c.mode,'tokens muss leer oder mit den sichtbaren Wörtern identisch sein (gleiche Zeichen und Reihenfolge).',{field:'tokens',tokenCount:c.tokens.length,sourceTokenCount:tokens.length});
  if(c.mode==='order'&&c.tokens.some(token=>!text(token,80)||!token.trim()))invalidText(c.mode,'tokens darf nur nichtleere Wörter mit höchstens 80 Zeichen enthalten.',{field:'tokens',tokenCount:c.tokens.length});
  if(c.role==='answer'){
   const answer=task.answer,actualKind=typeof answer?.kind==='string'&&/^[a-z-]{1,40}$/u.test(answer.kind)?answer.kind:answer?.kind===undefined?'missing':'invalid';
   const values=answer?.values,valuesType=Array.isArray(values)?'array':values===undefined?'missing':values===null?'null':typeof values,valuesCount=Array.isArray(values)?values.length:null;
   if(actualKind!=='open'||!Array.isArray(values)||!values.length||values.some(value=>typeof value!=='string'||!value.trim()))invalidText(c.mode,`answer.kind=${actualKind}, answer.values Typ=${valuesType}, Anzahl=${valuesCount??'unbekannt'}; erforderlich sind answer.kind=open und answer.values mit mindestens einem konkreten ${c.mode==='select'?'auswählbaren Textbeleg':'geordneten Satz'}. rubric allein genügt nicht.`,{field:actualKind!=='open'?'answer.kind':'answer.values',actualKind,valuesType,valuesCount});
  }
  rejectSelectionLeak(c,task);
  return {...common,mode:c.mode,text:c.text,tokens:c.mode==='select'?[]:[...c.tokens]};
 }
 bad('Unbekanntes Werkzeug.');
}
function initial(c){
 if(c.tool==='coordinate-plane')return coordinateState(c);
 if(c.tool==='number-line'||c.tool==='angle-protractor')return {value:c.initialValue};
 if(c.tool==='balance')return {value:c.initialValue,leftCoefficient:c.leftCoefficient,leftConstant:c.leftConstant,rightCoefficient:c.rightCoefficient,rightConstant:c.rightConstant};
 return c.mode==='select'?{selected:[]}:{order:c.tokens.map((_,i)=>i)};
}
function apply(c,state,a){
 if(c.tool==='coordinate-plane')return applyCoordinate(c,state,a);
 if(!a||Object.keys(a).some(k=>!['type','value'].includes(k)))bad('Ungültige Werkstatthandlung.');
 if(a.type==='reset'&&a.value===0)return initial(c);
 const s=globalThis.structuredClone(state);
 if(c.tool==='number-line'||c.tool==='angle-protractor'||c.tool==='balance'){
  if(a.type==='set-value'){if(!onGrid(c,a.value))bad('Bitte einen angebotenen Skalenwert wählen.');s.value=a.value;return s;}
  if(c.tool==='balance'&&a.type==='shift-both'&&integer(a.value,-100,100)&&a.value!==0){s.leftConstant+=a.value;s.rightConstant+=a.value;if(!integer(s.leftConstant,0,100)||!integer(s.rightConstant,0,100))bad('Die Gewichte dürfen nicht negativ oder zu groß werden.');return s;}
  if(c.tool==='balance'&&a.type==='divide-both'&&integer(a.value,2,6)){for(const k of ['leftCoefficient','leftConstant','rightCoefficient','rightConstant']){if(s[k]%a.value)bad('Alle Bestandteile müssen durch denselben Faktor teilbar sein.');s[k]/=a.value;}return s;}
 }else{
  if(c.mode==='select'&&a.type==='toggle-token'&&integer(a.value,0,c.text.trim().split(/\s+/).length-1)){s.selected=s.selected.includes(a.value)?s.selected.filter(i=>i!==a.value):[...s.selected,a.value].sort((a,b)=>a-b);return s;}
  if(c.mode==='order'&&['move-left','move-right'].includes(a.type)&&integer(a.value,0,s.order.length-1)){const target=a.value+(a.type==='move-left'?-1:1);if(!integer(target,0,s.order.length-1))bad('Das Wort kann nicht weiter verschoben werden.');[s.order[a.value],s.order[target]]=[s.order[target],s.order[a.value]];return s;}
 }
 bad('Diese Handlung ist für das Werkzeug nicht möglich.');
}
function observe(task,payload){
 const c=task.workshop;
 if(c.tool==='coordinate-plane'){
  if(payload.actions.length>40)bad('Bitte höchstens vierzig Punktaktionen senden.');
  let state=initial(c);const changes=[];
  for(const a of payload.actions){const before=globalThis.structuredClone(state);state=applyCoordinate(c,state,a);changes.push({type:a.type,...a.type==='set-point'?{label:coordinateLabel(a.label),x:a.x,y:a.y}:a.type==='connect-points'?coordinateEdge(c,a.from,a.to):{},before,after:globalThis.structuredClone(state)});}
  const answer=coordinateAnswer(c,state),complete=state.points.length===c.labels.length&&(c.goal!=='plot-and-connect'||state.edges.length>0);
  const exactResult=c.role==='answer'&&complete?coordinateKeys({...c,labels:c.labels.map(coordinateLabel)},task).includes(answer):null;
  return {tool:c.tool,version:1,role:c.role,goal:c.goal,source:initial(c),final:state,answer,complete,exactResult,actionCount:payload.actions.length,changes:changes.slice(-12)};
 }
 if(c.role==='answer'&&(c.tool==='number-line'||c.tool==='angle-protractor'||c.tool==='balance'||c.mode==='order')&&!payload.actions.some(a=>a&&a.type!=='reset'))bad('Bitte zuerst eine eigene Auswahl oder Veränderung vornehmen.');
 let state=initial(c);const changes=[];
 for(const a of payload.actions){const before=globalThis.structuredClone(state);state=apply(c,state,a);changes.push({type:a.type,value:a.value,before,after:globalThis.structuredClone(state)});}
 let answer,final=state,balanced;
 if(c.tool==='number-line'||c.tool==='angle-protractor')answer=String(state.value);
 else if(c.tool==='balance'){final={...state,leftMass:state.leftCoefficient*state.value+state.leftConstant,rightMass:state.rightCoefficient*state.value+state.rightConstant};balanced=Math.abs(final.leftMass-final.rightMass)<1e-9;answer=String(state.value);}
 else{const tokens=c.mode==='select'?c.text.trim().split(/\s+/):c.tokens;answer=(state.selected||state.order).map(i=>tokens[i]).join(' ');}
 return {tool:c.tool,version:1,role:c.role,goal:c.goal,source:initial(c),final,answer,...balanced!==undefined?{balanced}:{},actionCount:payload.actions.length,changes:changes.slice(-12)};
}
module.exports={registry,validate,observe,onGrid};
