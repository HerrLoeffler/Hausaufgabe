// Configurable two-column learning scaffold. Content, visibility and grading remain separate.
export const ARROW_MODES=Object.freeze({given:'Rechnung vorgegeben',factor:'Rechenzeichen vorgegeben',select:'Rechenzeichen auswählen',free:'Rechnung frei eingeben'});
const positions=[[1,0,1],[1,4,5],[3,0,1],[3,4,5]],valuePositions=[[0,2],[0,3],[2,2],[2,3],[4,2],[4,3]];
const display=v=>String(v).replace('.',',');
const aliases={'×':['×','·','*','mal','x'],'÷':['÷',':','/','geteilt durch'],'+':['+','plus'],'-':['-','−','minus']};
export function createDreisatz(base,{labels,values,operations,modes=['factor','factor','factor','factor'],givens=[true,true,false,false,true,false]}){
 if(labels?.length!==2||values?.length!==6||operations?.length!==4||modes?.length!==4||givens?.length!==6||givens.some(x=>typeof x!=='boolean'))throw Error('Dreisatz vollständig angeben.');
 const numbers=values.map(v=>Number(String(v).replace(',','.')));if(numbers.some(v=>!Number.isFinite(v)))throw Error('Zahlen prüfen.');
 operations.forEach(({op,value},i)=>{const from=numbers[(i<2?0:2)+i%2],to=numbers[(i<2?2:4)+i%2],n=Number(value),result=op==='×'?from*n:op==='÷'?from/n:op==='+'?from+n:from-n;if(!Number.isFinite(result)||Math.abs(result-to)>1e-8)throw Error('Rechenpfeil passt nicht zu den Zahlen.');});
 const t=structuredClone(base);const rows=Array.from({length:5},(_,r)=>Array.from({length:6},(_,c)=>({id:`r${r+1}c${c+1}`,input:false,text:''}))),cells=[];
 const put=(r,c,value,given,answerMode='numeric',control)=>{const cell=rows[r][c];cell.input=!given;cell.text=given?display(value):'';if(control)cell.control=control;if(!given)cells.push({id:cell.id,accepted:answerMode==='text'?(aliases[value]||[String(value)]):[String(value)],answerMode});};
 valuePositions.forEach(([r,c],i)=>put(r,c,values[i],givens[i]));
 positions.forEach(([r,oc,fc],i)=>{const {op,value}=operations[i],mode=modes[i];if(!Object.hasOwn(ARROW_MODES,mode)||!aliases[op]||!Number.isFinite(Number(value))||(op==='÷'&&Number(value)===0))throw Error('Ungültige Rechnung.');if(mode==='free'){put(r,fc,op+display(value),false,'operation','operation');}else{put(r,oc,op,mode!=='select','text',mode==='select'?'operator':undefined);put(r,fc,value,mode==='given');}});
 if(!cells.length)throw Error('Mindestens ein Feld muss offen bleiben.');t.spec={columns:['Rechenzeichen links','Zahl links',labels[0],labels[1],'Rechenzeichen rechts','Zahl rechts'],rows,answerMode:'text',numericForm:'decimal',layout:'dreisatz'};t.solution={cells};t.maxPoints=cells.length*.5;t.hint='Rechne in Pfeilrichtung von oben nach unten. Links und rechts können unterschiedliche Rechnungen stehen. Jedes offene Feld zählt 0,5 Punkte.';return t;
}
export function dreisatzSettings(t){
 const value=(r,c)=>t.spec.rows[r][c].input?t.solution.cells.find(x=>x.id===t.spec.rows[r][c].id).accepted[0]:t.spec.rows[r][c].text;
 const modes=[],operations=[];for(const [r,oc,fc]of positions){const o=t.spec.rows[r][oc],f=t.spec.rows[r][fc];if(f.control==='operation'){modes.push('free');const m=value(r,fc).match(/^([×÷+\-])\s*(.+)$/);if(!m)throw Error('Rechnung prüfen.');operations.push({op:m[1],value:Number(m[2].replace(',','.'))});}else{modes.push(o.input?'select':f.input?'factor':'given');operations.push({op:value(r,oc),value:Number(value(r,fc).replace(',','.'))});}}
 return {labels:[t.spec.columns[2],t.spec.columns[3]],values:valuePositions.map(([r,c])=>value(r,c)),givens:valuePositions.map(([r,c])=>!t.spec.rows[r][c].input),modes,operations};
}
export function configureDreisatz(t,changes){return createDreisatz(t,{...dreisatzSettings(t),...changes});}
