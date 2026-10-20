import {visualPlan} from './fraction-visuals.mjs';
const f=(n,d)=>`<span class="fraction teaching-frac"><span class="numerator">${n}</span><span class="denominator">${d}</span></span>`;
const expanded=(n,d,k)=>`<span class="fraction teaching-frac"><span class="numerator">${n} <mark class="multiply-factor">× ${k}</mark></span><span class="denominator">${d} <mark class="multiply-factor">× ${k}</mark></span></span>`;
// All diagrams use the same 640-unit whole. Thick original boundaries remain
// visible while thin new subdivision boundaries are added inside them.
function picture(n,d,color='blue',original=d,offset=0){const wholes=Math.max(1,Math.ceil(n/d)),width=640,unit=width/d;return `<div class="teaching-pictures" data-subdivisions="${d}" data-original-parts="${original}">${Array.from({length:wholes},(_,w)=>`<svg class="teaching-strip" viewBox="-4 -8 648 88" role="img" aria-label="Ganzes ${w+1}: ${Math.min(d,Math.max(0,n-w*d))} von ${d} Teilen markiert"><rect x="0" y="0" width="640" height="64" rx="2" fill="#fff"/>${Array.from({length:d},(_,i)=>{const index=w*d+i;return `<rect x="${i*unit}" y="0" width="${unit}" height="64" fill="${index<n?(offset&&index>=offset?'#eea64a':color==='orange'?'#eea64a':'#3478cc'):'#fff'}"/>`;}).join('')}${Array.from({length:d-1},(_,i)=>`<line vector-effect="non-scaling-stroke" x1="${(i+1)*unit}" y1="0" x2="${(i+1)*unit}" y2="64" stroke="#52647b" stroke-width="${(i+1)%(d/original)===0?3:1}"/>`).join('')}<rect x="0" y="0" width="640" height="64" rx="2" fill="none" vector-effect="non-scaling-stroke" stroke="#344b68" stroke-width="3"/></svg>${wholes>1?`<small>Ganzes ${w+1}</small>`:''}`).join('')}</div>`;}
export function buildHelp(task){const {denominator:d,first,second,total}=visualPlan(task),[an,ad]=task.a,[bn,bd]=task.b;const steps=[];
 steps.push({id:'first',title:'Schau dir den ersten Anteil an.',text:`Ein gleich großes Ganzes hat ${ad} Teile. Davon sind ${an} blau markiert.`,html:picture(an,ad)+`<div class="teaching-formula">${f(an,ad)}</div>`});
 if(task.skill==='parts'){steps.push({id:'check',title:'Jetzt zählst du selbst.',text:'Der Nenner zählt alle gleich großen Teile. Der Zähler zählt die markierten Teile.',html:picture(an,ad),check:{question:'Wie viele Teile sind blau markiert?',answer:an,explanation:`${an} Teile sind markiert. Das Ganze hat ${ad} gleich große Teile.`}});return steps;}
 if(task.skill!=='equivalent')steps.push({id:'second',title:'Jetzt der zweite Anteil.',text:`Das Ganze bleibt gleich groß. Es hat ${bd} Teile; ${bn} davon sind orange markiert.`,html:picture(bn,bd,'orange')+`<div class="teaching-formula">${f(bn,bd)}</div>`});
 const expandStep=(side,n,oldDen,newN,color)=>[
 {id:'expand-'+side,title:'Oben und unten derselbe Faktor.',text:`Wir multiplizieren den Zähler und den Nenner jeweils mit ${d/oldDen}. Der Bruchwert bleibt dabei gleich.`,html:`<div class="teaching-formula">${f(n,oldDen)} <span>=</span> ${expanded(n,oldDen,d/oldDen)} <span>=</span> ${f(newN,d)}</div>`},
 {id:'partition-'+side,title:'Jetzt siehst du die feinere Unterteilung.',text:`Jedes bisherige Teilstück ist jetzt in ${d/oldDen} Stücke geteilt. Die farbige Fläche bleibt genau gleich groß.`,html:picture(newN,d,color,oldDen)+`<div class="teaching-formula">${f(newN,d)}</div><p class="picture-key">Dicke Linien: bisherige Teilung. Feine Linien: neue Teilstücke.</p>`}
 ];
 if(d!==ad||task.skill==='equivalent')steps.push(...expandStep('first',an,ad,first,'blue'));
 if(task.skill!=='equivalent'&&d!==bd)steps.push(...expandStep('second',bn,bd,second,'orange'));
 if(task.skill!=='equivalent'&&task.skill!=='common')steps.push({id:'sum',title:'Jetzt zählen wir zusammen.',text:`${first} blaue und ${second} orange Teile sind ${total} Teile. Ein Teil bleibt 1/${d} des Ganzen.`,html:picture(total,d,'blue',d,first)+`<div class="teaching-formula">${f(first,d)} <span>+</span> ${f(second,d)} <span>=</span> ${f(total,d)}</div>`});
 let check;
 if(task.skill==='equivalent'){const k=d/ad;check={question:`Der Nenner ${ad} wird mit ${k} multipliziert. Welchen Faktor braucht der Zähler?`,answer:k,explanation:`Beide Zahlen brauchen denselben Faktor ${k}: ${an} × ${k} und ${ad} × ${k}.`};}
 else if(task.skill==='common'){check={question:`Beide Anteile sind jetzt in wie viele Teile pro Ganzem eingeteilt?`,answer:d,explanation:`Beide Ganzen sind in ${d} gleich große Teile eingeteilt.`};}
 else check={question:`Wir behalten den Nenner ${d}. Wie viel ist ${first} + ${second}?`,answer:total,explanation:`${first} + ${second} = ${total}. Der Nenner ${d} bleibt gleich.`};
 steps.push({id:'check',title:'Ein kleiner Schritt für dich.',text:'Diese Frage gehört noch zur Erklärung. Danach kommt eine neue Aufgabe ohne Hilfe.',html:'',check});return steps;
}
export function createHelp(now=Date.now(),readingMs=10000){return {index:0,readingMs,readyAt:now+readingMs};}
export function helpWait(state,now=Date.now()){return Math.max(0,Math.ceil((state.readyAt-now)/1000));}
export function advanceHelp(state,count,now=Date.now()){return helpWait(state,now)>0||state.index>=count-1?state:{index:state.index+1,readingMs:state.readingMs??10000,readyAt:now+(state.readingMs??10000)};}
export function backHelp(state,now=Date.now()){return {index:Math.max(0,state.index-1),readingMs:state.readingMs??10000,readyAt:now+(state.readingMs??10000)};}

export function canLeaveHelp(state,count,done,now=Date.now()){return !!state&&state.index===count-1&&done&&helpWait(state,now)===0;}
