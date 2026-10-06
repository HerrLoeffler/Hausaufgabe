import {wholePizza,cutPizza,evaluatePortion,area} from './pizza.mjs';
const recipes=[{target:.5,name:'Mila',label:'½ Pizza'},{target:.25,name:'Ben',label:'¼ Pizza'},{target:.75,name:'Lina',label:'¾ Pizza'},{target:.5,name:'Tom',label:'½ Pizza'}];
const order=id=>({id,...recipes[id-1],patience:id===1?null:100});
export function newShift(){return {version:1,served:0,nextId:2,orders:[order(1)],carry:null,pizza:[],selected:[],history:[],paused:false,help:false,complete:false,mistakes:0,feedback:'Willkommen! Mila möchte eine halbe Pizza. Hol dir eine Pizza aus dem Ofen.'};}
const active=s=>!s.paused&&!s.help&&!s.complete;
export function takePizza(s){return active(s)?{...s,carry:'pizza',pizza:wholePizza(),selected:[],history:[],feedback:'Frische Pizza! Bring sie zum Schneidebrett.'}:s;}
export function applyCut(s,a,b){
 if(!active(s)||s.carry!=='pizza')return s;
 const p=cutPizza(s.pizza,a,b);
 if(p===s.pizza)return {...s,feedback:'Zieh einen langen Schnitt von einem Rand zum anderen. Bis zu vier Stücke sind möglich.'};
 return {...s,pizza:p,selected:[],history:[...s.history,s.pizza].slice(-3),feedback:'Schnitt gesetzt. Sind die Stücke gleich groß? Wähle jetzt die Portion.'};
}
export function undoCut(s){if(!active(s)||!s.history.length||s.carry!=='pizza')return s;return {...s,pizza:s.history.at(-1),history:s.history.slice(0,-1),selected:[],feedback:'Letzten Schnitt zurückgenommen.'};}
export function selectSlice(s,i){
 if(!active(s)||s.carry!=='pizza'||!Number.isInteger(i)||i<0||i>=s.pizza.length)return s;
 return {...s,selected:s.selected.includes(i)?s.selected.filter(v=>v!==i):[...s.selected,i]};
}
export function platePizza(s){
 if(!active(s)||s.carry!=='pizza')return s;
 const check=evaluatePortion(s.pizza,s.selected,1);
 if(check.reason==='empty')return {...s,feedback:'Wähle zuerst die Stücke für den Teller.'};
 if(check.reason==='unequal')return {...s,feedback:'Die Teile sind noch unterschiedlich groß. Gleiche Bruchteile müssen gleich groß sein. Nimm einen Schnitt zurück oder hole eine neue Pizza.'};
 return {...s,carry:'plate',feedback:`${s.selected.length} von ${s.pizza.length} gleich großen Stücken liegen auf dem Teller. Bring ihn zum passenden Gast.`};
}
export function serve(s,id){
 const guest=s.orders.find(o=>o.id===id);
 if(!active(s)||s.carry!=='plate'||!guest)return s;
 const result=evaluatePortion(s.pizza,s.selected,guest.target);
 if(!result.ok)return {...s,mistakes:s.mistakes+1,feedback:`${guest.name} möchte ${guest.label}. Schau noch einmal auf die Portion. Du kannst am Brett neu auswählen.`};
 const orders=s.orders.filter(o=>o.id!==id);let nextId=s.nextId;
 while(orders.length<2&&nextId<=4)orders.push(order(nextId++));
 const served=s.served+1;
 return {...s,served,nextId,orders,carry:null,pizza:[],selected:[],history:[],complete:served===4,feedback:result.numerator===2&&result.denominator===4?`Danke, ${guest.name}! Zwei Viertel sind genau eine Hälfte. ²⁄₄ = ½.`:`${guest.name}: „Genau meine Portion! Vielen Dank!“`};
}
export function unplate(s){return active(s)&&s.carry==='plate'?{...s,carry:'pizza',feedback:'Du kannst die Portion jetzt ändern.'}:s;}
export function tick(s,seconds){
 if(!active(s)||!Number.isFinite(seconds)||seconds<0)return s;
 return {...s,orders:s.orders.map(o=>({...o,patience:o.patience===null?null:Math.max(0,o.patience-seconds)}))};
}
function validPizza(p){return Array.isArray(p)&&p.length<=4&&p.every(poly=>Array.isArray(poly)&&poly.length>=3&&poly.length<=110&&poly.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)&&Math.hypot(v.x,v.y)<=1.001));}
export function restore(raw){
 try{
  const s=JSON.parse(raw);
  if(!s||s.version!==1||!Number.isInteger(s.served)||s.served<0||s.served>4||!Number.isInteger(s.nextId)||s.nextId<2||s.nextId>5||!Array.isArray(s.orders)||s.orders.length>2||s.orders.length!==s.nextId-1-s.served||new Set(s.orders.map(o=>o.id)).size!==s.orders.length)throw 0;
  if(s.orders.some(o=>!Number.isInteger(o.id)||o.id<1||o.id>=s.nextId||o.target!==recipes[o.id-1].target||o.name!==recipes[o.id-1].name||o.label!==recipes[o.id-1].label||(o.id===1?o.patience!==null:!Number.isFinite(o.patience)||o.patience<0||o.patience>100)))throw 0;
  if(![null,'pizza','plate'].includes(s.carry)||!validPizza(s.pizza)||!Array.isArray(s.selected)||new Set(s.selected).size!==s.selected.length||s.selected.some(i=>!Number.isInteger(i)||i<0||i>=s.pizza.length)||!Array.isArray(s.history)||s.history.length>3||s.history.some(p=>!validPizza(p)))throw 0;
  if(s.carry===null?(s.pizza.length||s.selected.length):(!s.pizza.length||Math.abs(s.pizza.reduce((a,p)=>a+area(p),0)-area(wholePizza()[0]))>.01))throw 0;
  if(typeof s.paused!=='boolean'||typeof s.help!=='boolean'||s.complete!==(s.served===4)||!Number.isInteger(s.mistakes)||s.mistakes<0||typeof s.feedback!=='string'||s.feedback.length>500)throw 0;
  return s;
 }catch{return newShift();}
}
