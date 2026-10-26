'use strict';
const {createHash}=require('node:crypto');
const builder=require('./visual/dreisatz-builder');
const {core,parseVisualTask}=require('./visual-task');
const {VERSION}=require('./task-recipes');
const finite=v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1e9;
const round=v=>Number(v.toPrecision(12));
function operation(a,b){if(a===0){if(b!==0)throw Error('Ungültiger Zwischenweg durch Null.');return {op:'×',value:1};}if(b===0)return {op:'×',value:0};return Math.abs(b/a)<1?{op:'÷',value:a/b}:{op:'×',value:b/a};}
function scaffold(problem,points,help,variant){
 const givens=[true,true,true,true,true,true],modes=['given','given','given','given'];
 const rate=problem==='percent_rate';givens[rate?4:5]=false;let fields=1;
 const target=Math.min(11,Math.max(1,Math.round(points*2)));
 if(rate){modes[2]='factor';modes[3]='factor';fields+=2;}
 const order=Array.from({length:4},(_,i)=>(i+variant)%4);
 for(const i of order){if(fields>=target)break;if(modes[i]==='given'){modes[i]=help==='independent'?'free':help==='mixed'&&fields+2<=target?'select':'factor';fields+=modes[i]==='select'?2:1;}}
 for(const i of [2,3]){if(fields>=target)break;givens[i]=false;fields++;}
 for(const i of order){if(fields>=target)break;if(['factor','free'].includes(modes[i])){modes[i]='select';fields++;}}
 return {givens,modes};
}
function materializeQuestion(raw,{index=0,contentLocale='de-DE',subject='Mathematik',grade='7',requireHalfPoints=false}={}){
 if(raw.type!=='visual'||typeof raw.visualTask!=='string')return raw;
 let draft;try{draft=JSON.parse(raw.visualTask);}catch{return raw;}
 if(draft.schemaVersion!=='dreisatz-draft-v1')return raw;
 const keys=['schemaVersion','problem','params','labels','helpLevel'];if(Object.keys(draft).some(k=>!keys.includes(k)))throw Error('Unbekannte Dreisatzdaten.');
 if(!Array.isArray(draft.labels)||draft.labels.length!==2||draft.labels.some(x=>typeof x!=='string'||!x.trim()||x.length>80)||!['guided','mixed','independent'].includes(draft.helpLevel))throw Error('Dreisatzangaben unvollständig.');
 const p=draft.params;if(!p||typeof p!=='object'||Array.isArray(p)||Object.values(p).some(v=>!finite(v)))throw Error('Dreisatzwerte prüfen.');
 const validFields={percent_value:['base','percent'],percent_base:['part','percent'],percent_rate:['base','part'],direct:['startLeft','startRight','endLeft','middleLeft'],inverse:['startLeft','startRight','endLeft','middleLeft']};
 const allowed=validFields[draft.problem];if(!allowed||Object.keys(p).some(k=>!allowed.includes(k))||allowed.filter(k=>k!=='middleLeft').some(k=>!Object.hasOwn(p,k)))throw Error('Dreisatzbeziehung fehlt.');
 let a,b,c,mid=p.middleLeft??1,unknown=draft.problem;
 if(unknown==='percent_value'){if(!(p.base>0)||p.percent<0)throw Error('Prozentangaben prüfen.');a=100;b=p.base;c=p.percent;}
 else if(unknown==='percent_base'){if(!(p.percent>0)||p.part<0)throw Error('Grundwert nicht eindeutig.');a=p.percent;b=p.part;c=100;}
 else if(unknown==='percent_rate'){if(!(p.base>0)||p.part<0)throw Error('Prozentsatz nicht eindeutig.');a=100;b=p.base;c=p.part/p.base*100;}
 else {a=p.startLeft;b=p.startRight;c=p.endLeft;}
 if(a===0||mid===0||unknown==='inverse'&&c===0)throw Error('Ungültige Null im Rechenweg.');
 const right=x=>round(unknown==='inverse'?a*b/x:b*x/a),values=[a,b,mid,right(mid),round(c),right(c)];if(values.some(v=>!finite(v)))throw Error('Dreisatzwerte außerhalb des Bereichs.');
 const operations=[operation(values[0],values[2]),operation(values[1],values[3]),operation(values[2],values[4]),operation(values[3],values[5])];
 const fields=scaffold(unknown,Number(raw.points),draft.helpLevel,index%4);
 const halfRequired=requireHalfPoints||/0[,.]5\s*(?:Punkte|Punkt|P\.)/i.test(raw.text||'');
 const open=fields.givens.filter(v=>!v).length+fields.modes.reduce((n,m)=>n+(m==='given'?0:m==='select'?2:1),0);
 if(halfRequired&&Math.abs(Number(raw.points)-open*.5)>1e-9)throw Error('Punkteauftrag passt nicht zu 0,5 Punkten je offenem Feld.');
 const english=contentLocale==='en-GB';const text=String(raw.text||'').trim().replace(/Jedes? (?:richtige |offene )?Feld (?:zählt|gibt) 0[,.]5 Punkte\.?/giu,'').trim();
 const base={...core.example('table'),id:'auto-'+createHash('sha256').update(VERSION+index+text+JSON.stringify(draft)).digest('hex').slice(0,20),prompt:text,title:text.slice(0,90),hint:'',objective:'Rechenweg einer proportionalen oder umgekehrt proportionalen Zuordnung anwenden.',rationale:'Werte und Rechenoperationen getrennt beurteilen.',sourceNote:'',subject,grade};
 const task=builder.createDreisatz(base,{labels:draft.labels,values,operations,...fields});
 task.maxPoints=Number(raw.points);const per=task.maxPoints/task.solution.cells.length;
 task.hint=english?'Calculate along each arrow.':'Rechne entlang der Pfeile.';
 task.prompt=text+' '+(english?'Complete the values and the four calculation arrows. Use the intermediate value ':'Ergänze die Werte und die vier Rechenpfeile. Verwende als Zwischenwert ')+String(mid).replace('.',english?'.':',')+'. '+(per===.5?(english?'Each field earns 0.5 points.':'Jedes richtige Feld zählt 0,5 Punkte.'):(english?'Partial credit is awarded for each correct field.':'Jedes richtige Feld erhält Teilpunkte.'));
 parseVisualTask(JSON.stringify(task),{points:task.maxPoints});
 const recipeId=unknown==='inverse'?'dreisatz-inverse':'dreisatz-direct';
 return {...raw,text:task.prompt,visualTask:JSON.stringify(task),authoringRecipe:{id:recipeId,version:VERSION}};
}
module.exports={materializeQuestion};
