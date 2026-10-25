export const types={choice:'Wählen und markieren',measure:'Bruch und Messbecher',order:'Reihenfolge legen',match:'Paare zuordnen'};
const clone=x=>structuredClone(x);
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
const clean=x=>String(x??'').trim();
export function examples(){return {title:'Verben, Sätze und Brüche · Klasse 6',tasks:[
{id:'verbs',type:'choice',subject:'Deutsch',prompt:'Welche angebotenen Wörter sind in diesen Sätzen Verben?',context:'Der Fuchs sucht einen Eingang. Die Kinder singen. Der Baum ist grün.',options:['sucht','singen','Baum','grün'],correct:[0,1]},
{id:'water',type:'measure',subject:'Mathematik',prompt:'Fülle 3/10 des 1-Liter-Messbechers.',context:'Ein ganzer Messbecher fasst 1 Liter. Jeder Skalenabschnitt ist gleich groß.',capacity:1,unit:'L',denominator:10,numerator:3},
{id:'sentence',type:'order',subject:'Deutsch',prompt:'Lege einen vollständigen Satz. Das Verb steht an zweiter Stelle.',context:'Wähle zuerst den Satzanfang. Das Verb gehört an die zweite Stelle.',items:['Heute','öffnet','der Fuchs','das Tor.'],acceptedOrders:[[0,1,2,3]]},
{id:'pairs',type:'match',subject:'Englisch',prompt:'Ordne die englischen Wörter ihren deutschen Übersetzungen zu.',context:'Jedes Wort hat hier genau einen passenden Partner.',pairs:[['tree','Baum'],['water','Wasser'],['door','Tür']]}
]};}
export function replaceChoiceOptions(task,raw){return {...structuredClone(task),options:String(raw).split('\n'),correct:[]};}
export function compileLesson(input){
 const errors=[],warnings=[];const lesson=clone(input||{});lesson.title=clean(lesson.title);
 if(!lesson.title||lesson.title.length>100)errors.push('Gib einen Unterrichtstitel mit höchstens 100 Zeichen ein.');
 if(!Array.isArray(lesson.tasks)||!lesson.tasks.length||lesson.tasks.length>8){errors.push('Die Runde braucht 1 bis 8 Aufgaben.');return {errors,warnings,lesson:null};}
 const ids=new Set();
 lesson.tasks.forEach((t,index)=>{
  const err=message=>errors.push(`Aufgabe ${index+1}: ${message}`);
  if(!t||typeof t!=='object'){err('Aufgabe fehlt.');return;}
  t.id=clean(t.id);t.prompt=clean(t.prompt);t.context=clean(t.context);t.subject=clean(t.subject);
  if(!t.id||ids.has(t.id))err('Die Aufgabenkennung muss eindeutig sein.');ids.add(t.id);
  if(!t.prompt||t.prompt.length>800)err('Die Frage braucht 1 bis 800 Zeichen.');
  if(t.context.length>1600)err('Kürze den Kontext auf höchstens 1600 Zeichen.');
  if(!t.subject||t.subject.length>60)err('Nenne das Fach.');
  if(!Object.hasOwn(types,t.type)){err('Wähle eine der vier verfügbaren Mechaniken.');return;}
  const list=(values,name,min=2,max=8)=>{
   if(!Array.isArray(values)||values.length<min||values.length>max){err(`${name}: ${min} bis ${max} Einträge nötig.`);return false;}
   if(values.some(v=>!clean(v)||clean(v).length>100)){err(`${name}: keine leeren Einträge, höchstens 100 Zeichen je Eintrag.`);return false;}
   if(new Set(values.map(v=>clean(v).toLocaleLowerCase('de-DE'))).size!==values.length){err(`${name}: gleiche Texte sind in dieser Probe mehrdeutig.`);return false;}return true;
  };
  if(t.type==='choice'){
   t.options=Array.isArray(t.options)?t.options.map(clean):[];list(t.options,'Antworten',2,6);
   if(!Array.isArray(t.correct)||!t.correct.length||new Set(t.correct).size!==t.correct.length||t.correct.some(i=>!Number.isInteger(i)||i<0||i>=t.options.length))err('Markiere mindestens eine gültige richtige Antwort.');
   if(t.subject==='Deutsch'&&/\bverb(?:en|s)?\b/i.test(t.prompt)){
    if(!t.context)err('Verben brauchen hier einen vollständigen Satzkontext.');
    else if(t.options.some(word=>!t.context.toLocaleLowerCase('de-DE').includes(word.toLocaleLowerCase('de-DE'))))err('Alle angebotenen Wörter müssen im sichtbaren Satzkontext vorkommen.');
   }
  }
  if(t.type==='measure'){
   if(!/(?:fülle|füllmenge|mess(?:en|becher)|liter|milliliter|\bml\b|fill|measure)/i.test(t.prompt))err('Diese Frage passt nicht zur Messstation. Formuliere einen Messauftrag oder wähle eine andere Mechanik.');
   if(!Number.isFinite(t.capacity)||t.capacity<=0||t.capacity>(t.unit==='L'?10:10000))err('Die Bechergröße muss positiv sein (höchstens 10 L oder 10000 ml).');
   if(!['L','ml'].includes(t.unit))err('Wähle Liter oder Milliliter.');
   if(!Number.isInteger(t.denominator)||t.denominator<2||t.denominator>20||!Number.isInteger(t.numerator)||t.numerator<0||t.numerator>t.denominator)err('Der Bruch muss auf einer Skala mit 2 bis 20 gleichen Abschnitten liegen.');
   const fraction=t.prompt.match(/(\d+)\s*\/\s*(\d+)/);
   if(fraction&&Number(fraction[1])*t.denominator!==t.numerator*Number(fraction[2]))err('Der Bruch in der Frage widerspricht der eingestellten Zielmenge.');
   const litres=(value,unit)=>Number(String(value).replace(',','.'))*(/^(ml|milliliter)$/i.test(unit)?0.001:1);
   const wholeText=(t.prompt+' '+t.context).match(/(?<![\d/])(\d+(?:[.,]\d+)?)\s*-\s*(Liter|Milliliter)\s*-\s*Messbecher\w*|(?:fasst|sind|beträgt)\s+(\d+(?:[.,]\d+)?)\s*(Liter|Milliliter|L|ml)\b/i);
   if(wholeText&&Math.abs(litres(wholeText[1]||wholeText[3],wholeText[2]||wholeText[4])-litres(t.capacity,t.unit))>1e-9)err('Die genannte Bechergröße widerspricht dem eingestellten Ganzen.');
   for(const match of (t.context||'').matchAll(/(?:fasst|sind|beträgt)\s+(\d+(?:[.,]\d+)?)\s*(Liter|Milliliter|L|ml)\b/gi)){if(Math.abs(litres(match[1],match[2])-litres(t.capacity,t.unit))>1e-9)err('Der Kontext nennt eine andere Bechergröße als die Einstellung.');}
   const absolute=t.prompt.match(/(\d+)\s*\/\s*(\d+)\s*(Liter|Milliliter|L|ml)\b/i);
   if(absolute&&Math.abs(litres(Number(absolute[1])/Number(absolute[2]),absolute[3])-litres(t.capacity*t.numerator/t.denominator,t.unit))>1e-9)err('Der absolute Bruch in der Frage widerspricht der eingestellten Füllmenge.');
   if(!fraction)warnings.push(`Aufgabe ${index+1}: Die Frage nennt keinen Bruch. Prüfe besonders, ob die Zielmenge zur Formulierung passt.`);
   if(/\b(?:milliliter|ml)\b/i.test(t.prompt)&&t.unit==='L')warnings.push(`Aufgabe ${index+1}: Frage und Skala verwenden verschiedene Einheiten. Prüfe die gewollte Umrechnung.`);
  }
  if(t.type==='order'){
   t.items=Array.isArray(t.items)?t.items.map(clean):[];list(t.items,'Satzteile',2,8);
   if(!Array.isArray(t.acceptedOrders)||!t.acceptedOrders.length||t.acceptedOrders.length>6||t.acceptedOrders.some(a=>!Array.isArray(a)||a.length!==t.items.length||new Set(a).size!==t.items.length||a.some(i=>!Number.isInteger(i)||i<0||i>=t.items.length)))err('Jede erlaubte Reihenfolge muss alle Teile genau einmal enthalten.');
  }
  if(t.type==='match'){
   if(!Array.isArray(t.pairs)||t.pairs.length<2||t.pairs.length>6||t.pairs.some(p=>!Array.isArray(p)||p.length!==2)){err('Gib 2 bis 6 Paare im Format links | rechts ein.');return;}
   t.pairs=t.pairs.map(p=>p.map(clean));list(t.pairs.map(p=>p[0]),'Linke Begriffe',2,6);list(t.pairs.map(p=>p[1]),'Rechte Begriffe',2,6);
  }
 });
 return {errors,warnings,lesson:errors.length?null:freeze(lesson)};
}
export function checkAnswer(task,answer){
 let correct=false,canonicalAnswer=answer,feedback='';
 if(task.type==='choice'){
  const values=Array.isArray(answer)?[...new Set(answer)]:[];
  correct=values.length===task.correct.length&&values.every(i=>task.correct.includes(i));
  canonicalAnswer=values.map(i=>task.options[i]);feedback=correct?'Die gewählten Antworten passen.':'Noch nicht passend. Du kannst Wörter abwählen und erneut überlegen.';
 }
 if(task.type==='measure'){
  const value=Number(answer);correct=Number.isInteger(value)&&value===task.numerator;
  canonicalAnswer=String(Math.round((task.capacity*value/task.denominator)*1e9)/1e9);
  feedback=correct?`Die Menge passt: ${canonicalAnswer.replace('.',',')} ${task.unit}.`:'Die Menge passt noch nicht. Vergleiche den Bruch mit den gleichen Skalenabschnitten.';
 }
 if(task.type==='order'){
  correct=Array.isArray(answer)&&task.acceptedOrders.some(order=>order.length===answer.length&&order.every((v,i)=>v===answer[i]));
  canonicalAnswer=Array.isArray(answer)?answer.map(i=>task.items[i]):[];
  feedback=correct?'Diese Reihenfolge ist zugelassen.':'Noch nicht passend. Nimm einen Teil zurück und prüfe die Reihenfolge.';
 }
 if(task.type==='match'){
  correct=answer&&Object.keys(answer).length===task.pairs.length&&task.pairs.every((_,i)=>Number(answer[i])===i&&answer[i]!==''&&answer[i]!==undefined);
  canonicalAnswer=task.pairs.map(([left],i)=>({left,right:task.pairs[Number(answer?.[i])]?.[1]??''}));
  feedback=correct?'Alle Paare passen.':'Mindestens ein Paar passt noch nicht. Prüfe die Bedeutungen.';
 }
 return {correct:Boolean(correct),canonicalAnswer,feedback};
}
