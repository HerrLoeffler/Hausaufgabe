'use strict';
const VERSION='remy-demand-v1';
function planProgression(input={}) {
  if(input.generationMode==='variant')return null;
  const count=input.totalCount||input.count,offset=input.batchOffset||0;
  if(!Number.isInteger(count)||count<1||count>100)throw new RangeError('Ungültige Aufgabenanzahl für Anforderungsplan.');
  const notes=String(input.notes||'');
  const named=[...new Set([...notes.matchAll(/\b(?:Aufgabe|Frage|task|question)\s*(?:Nr\.?\s*)?(\d{1,3})\b/giu)].map(m=>Number(m[1])).filter(Number.isInteger))];
  const pinned=named.filter(n=>n>=1&&n<=count),outside=named.filter(n=>n<1||n>count);
  const contextual=/gemischt\w*\s+(?:Reihenfolge|Anordnung)|zufällig\w*\s+Reihenfolge|chronolog|zusammenhäng\w*\s+(?:Text|Hör|Hoer)|(?:Text|Hör|Hoer|Kapitel)bl[oö]ck|Abhängigkeit|aufeinander\s+auf|\bKapitel\s*\d|in dieser Reihenfolge|mixed order|chronological|shared passage/iu.test(notes);
  const difficulty=String(input.difficulty||'mittel').trim().toLowerCase();
  const easyWish=/(?:alle\s+Aufgaben|(?:ganze[rn]?|gesamte[rn]?)\s+Test|nur\s+(?:leichte|einfache)\s+Aufgaben)[^.!?;]{0,70}(?:leicht|einfach)|nur\s+(?:leichte|einfache)\s+Aufgaben/iu.test(notes) || (!pinned.length && /so\s+einfach\s+wie\s+m[oö]glich/iu.test(notes));
  const maxLevel=easyWish||/^(leicht|einfach|easy)$/.test(difficulty)?1:/^(mittel|medium)$/.test(difficulty)?2:3;
  const levels=Array.from({length:count},(_,i)=>count===1?1:1+Math.round(i*(maxLevel-1)/(count-1)));
  return {version:VERSION,context:{subject:String(input.subject||""),grade:String(input.grade||""),schoolType:String(input.schoolType||""),topic:String(input.topic||""),difficulty,difficultySource:easyWish?"teacher-notes":"form"},mode:contextual?'contextual':'progressive',maxLevel,pinned,outside,levels,
    slots:levels.slice(offset,offset+(input.count||count)).map((level,i)=>({position:offset+i+1,level,pinned:pinned.includes(offset+i+1)}))};
}
function questionDemandErrors(question,index,plan) {
  if(!plan)return [];
  const d=question?.demand,position=index+1,pinned=plan.pinned.includes(position);
  if(!d||d.position!==position||!Number.isInteger(d.level)||d.level<1||d.level>3||typeof d.rationale!=='string'||!d.rationale.trim()||d.rationale.length>400)return ['Anforderungsplan: Aufgabenposition, Stufe1–3 und kurze fachliche Begründung fehlen oder sind ungültig.'];
  if(!pinned&&d.level>plan.maxLevel)return ['Anforderungsplan: Gewähltes Gesamtniveau überschritten.'];
  if(plan.mode==='progressive'&&!pinned&&d.level!==plan.levels[index])return [`Anforderungsplan: Für diesen Aufgabenplatz ist Stufe${plan.levels[index]} statt${d.level} vorgesehen; Inhalt passend überarbeiten, nicht nur umetikettieren.`];
  return [];
}
function progressionWarnings(plan) {
  if(!plan)return [];
  return [ ...(plan.outside.length?[`Aufgabennummern ${plan.outside.join(", ")} liegen außerhalb der gewählten Aufgabenanzahl und sind nicht automatisch umsetzbar.`]:[]), ...(plan.pinned.length?[`Feste Aufgabenpositionen ${plan.pinned.join(', ')} haben Vorrang vor der allgemeinen Steigerung. Prüfe ihren fachlichen Verlauf.`]:[]), ...(plan.mode==='contextual'?['Kontextgebundene oder ausdrücklich gemischte Reihenfolge erhalten; Steigerung innerhalb passender Abschnitte prüfen.']:[]) ];
}
function progressionPrompt(input,index) {
  const plan=planProgression(input);if(!plan)return '';
  const slots=index===undefined?plan.slots:plan.slots.filter(s=>s.position===index+1);
  return `\nVerbindlicher Anforderungsplan ${VERSION}: ${JSON.stringify({mode:plan.mode,maxLevel:plan.maxLevel,slots})}\nDie Positionen sind globale Aufgabennummern, auch in Teilblöcken. Beginne niedrigschwellig, steigere nur bis zum gewählten Ziel. Stufe1: vertraute Begriffe/ein bekannter kurzer Schritt; Stufe2: verknüpfte bekannte Schritte oder Darstellungswechsel; Stufe3: begründeter Transfer/mehrschrittiges selbständiges Vorgehen, nur wenn fachlich und altersgemäß. Leicht bleibt insgesamt leicht; kein erzwungener Transfer. Beachte Fach, Klasse, Vorwissen und Arbeitsgedächtnis. Format und Punkte sind KEIN Schwierigkeitsmaß. Jede Aufgabe erhält private demand:{position,level,rationale}; rationale begründet den tatsächlichen Denkaufwand im Klassenkontext. Inhalt an Stufe anpassen, nicht bloß etikettieren. Explizite Inhalte/Positionswünsche und zusammenhängende Text-/Hör-/Kapitelblöcke bewahren, keine nachträgliche globale Umsortierung. Pinned-Plätze folgen konkretem Lehrerwunsch und dürfen vom Standardziel abweichen; contextual erlaubt unterschiedliche Stufen im vorgegebenen Zusammenhang. Bei Konflikten nicht still einen Positionswunsch entfernen. Ein Bild mit vier Gegenständen ist EIN Bild; Bilder und Antwortoptionen bleiben an ihrer Aufgabe.\n`;
}
const demandSchema={type:'object',additionalProperties:false,properties:{position:{type:'integer',minimum:1,maximum:100},level:{type:'integer',minimum:1,maximum:3},rationale:{type:'string',pattern:'\\S',maxLength:400}},required:['position','level','rationale']};
module.exports={VERSION,planProgression,questionDemandErrors,progressionWarnings,progressionPrompt,demandSchema};
