'use strict';
// Bounded semantic models; public configs contain only the visible problem data.
const {rational}=require('./exact');
const bad=message=>{const e=new Error(message);e.code='invalid-argument';throw e;};
const n=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
const text=(v,max)=>typeof v==='string'&&v.length<=max;
const title=t=>[t?.title,t?.goal,t?.area].join(' ');
const supported={
 'number-line':t=>t?.subject==='math'&&/Zahl|Br[üu]ch|Anteil|Prozent|rational|Stellen|Koordinat/i.test(title(t)),
 balance:t=>t?.subject==='math'&&/Gleichung|Gleichgewicht|Unbekannt|Umkehr|Term|Variable/i.test(title(t)),
 'text-workbench':t=>t?.subject==='german'&&/W[oö]rt|S[aä]tz|Grammatik|Rechtschreib|Sprach|Zeichen|Beleg|Lesen|Information|Textstelle/i.test(title(t))
};
const registry=Object.fromEntries(Object.entries(supported).map(([id,supports])=>[id,Object.freeze({id,version:1,label:{'number-line':'Zahlenstrahl',balance:'Gleichgewichtswaage','text-workbench':'Wörter und Sätze'}[id],capabilities:{'number-line':['locate-number-on-scale'],balance:['preserve-equation','solve-unknown'],'text-workbench':['select-text-evidence','order-sentence']}[id],actions:{'number-line':['set-value','reset'],balance:['set-value','shift-both','divide-both','reset'],'text-workbench':['toggle-token','move-left','move-right','reset']}[id],limits:{maxActions:60},supports})]));
function onGrid(c,value){
 if(!n(value,c.minimum,c.maximum))return false;
 const v=rational(value),m=rational(c.minimum),s=rational(c.step);if(!v||!m||!s)return false;
 const num=(v[0]*m[1]-m[0]*v[1])*s[1],den=v[1]*m[1]*s[0];return den>0n&&num%den===0n;
}
function range(c){if(!n(c.minimum,-10000,10000)||!n(c.maximum,-10000,10000)||c.minimum>=c.maximum||!n(c.step,0.001,10000)||(c.maximum-c.minimum)/c.step>100||!onGrid(c,c.maximum)||!onGrid(c,c.initialValue))bad('Skala, Schrittweite und Ausgangswert passen nicht zusammen.');}
function privateNumber(task,accept){if(task.answer?.kind==='open'||!task.answer?.values?.length||task.answer.values.some(v=>{const r=rational(v);return !r||!accept(r);} ))bad('Darstellung und privater Lösungsschlüssel passen nicht zusammen.');}
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
  if(c.role==='answer'&&(task.answer?.kind!=='open'||!task.answer.values?.length))bad('Die Textwerkstatt braucht fachliche Antwortkriterien.');
  rejectSelectionLeak(c,task);
  return {...common,mode:c.mode,text:c.text,tokens:c.mode==='select'?[]:[...c.tokens]};
 }
 bad('Unbekanntes Werkzeug.');
}
function initial(c){
 if(c.tool==='number-line')return {value:c.initialValue};
 if(c.tool==='balance')return {value:c.initialValue,leftCoefficient:c.leftCoefficient,leftConstant:c.leftConstant,rightCoefficient:c.rightCoefficient,rightConstant:c.rightConstant};
 return c.mode==='select'?{selected:[]}:{order:c.tokens.map((_,i)=>i)};
}
function apply(c,state,a){
 if(!a||Object.keys(a).some(k=>!['type','value'].includes(k)))bad('Ungültige Werkstatthandlung.');
 if(a.type==='reset'&&a.value===0)return initial(c);
 const s=globalThis.structuredClone(state);
 if(c.tool==='number-line'||c.tool==='balance'){
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
 if(c.role==='answer'&&(c.tool==='number-line'||c.tool==='balance'||c.mode==='order')&&!payload.actions.some(a=>a&&a.type!=='reset'))bad('Bitte zuerst eine eigene Auswahl oder Veränderung vornehmen.');
 let state=initial(c);const changes=[];
 for(const a of payload.actions){const before=globalThis.structuredClone(state);state=apply(c,state,a);changes.push({type:a.type,value:a.value,before,after:globalThis.structuredClone(state)});}
 let answer,final=state,balanced;
 if(c.tool==='number-line')answer=String(state.value);
 else if(c.tool==='balance'){final={...state,leftMass:state.leftCoefficient*state.value+state.leftConstant,rightMass:state.rightCoefficient*state.value+state.rightConstant};balanced=Math.abs(final.leftMass-final.rightMass)<1e-9;answer=String(state.value);}
 else{const tokens=c.mode==='select'?c.text.trim().split(/\s+/):c.tokens;answer=(state.selected||state.order).map(i=>tokens[i]).join(' ');}
 return {tool:c.tool,version:1,role:c.role,goal:c.goal,source:initial(c),final,answer,...balanced!==undefined?{balanced}:{},actionCount:payload.actions.length,changes:changes.slice(-12)};
}
module.exports={registry,validate,observe,onGrid};
