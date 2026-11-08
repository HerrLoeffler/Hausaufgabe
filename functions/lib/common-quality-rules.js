'use strict';
const {createHash,randomUUID}=require('node:crypto');
const VERSION='common-quality-v1';
const RULES=Object.freeze([
 {id:'visible-answer',instruction:'Die schülerseitige Aufgabenstellung darf die gesuchte Lösung nicht als fertige Antwort verraten. Kandidaten im vorgesehenen Lese-/Hörtext, Antwortoptionen und interne [Lückenlösungen] sind allein kein Lösungsleck.'},
 {id:'media-ready',instruction:'Hör- und Bildfragen benötigen den tatsächlich zugeordneten Medienkanal. Fehlende, unpassende oder nicht abspielbare Medien niemals als vorhanden behaupten. Lösungen müssen am konkreten Medium überprüfbar sein.'},
 {id:'fraction-equivalence',instruction:'Bei Brüchen mathematisch gleichwertige Antworten zulassen, sofern keine bestimmte Darstellung ausdrücklich verlangt ist. Kürzen ist nicht falsch. Beim Ablesen ohne Kürzen diese Anforderung ausdrücklich nennen. Flächenteile müssen gleich groß und Markierungen konsistent sein.'},
 {id:'visual-reference',instruction:'Bildfragen verwenden objektiv sichtbare Merkmale. Für groß/klein einen sichtbaren Vergleich oder Maßstab vorsehen. Keine ungesicherten Bilddetails erfinden.'},
 {id:'science-conditions',instruction:'Fachliche Bedingungen nennen. Wenn Permafrost definiert wird: Untergrundtemperatur mindestens zwei aufeinanderfolgende Jahre bei höchstens 0 °C; ein gefrorener Sommer reicht nicht. Bei Farb-/Wärmevergleichen sonst gleiche Körper, Ausgangstemperatur und Bestrahlung voraussetzen; Farbe allein bestimmt nicht die Erwärmung beliebiger Materialien.'},
 {id:'web-address',instruction:'URL und Domain/Hostname sauber unterscheiden. Für eine vollständige Webadresse ein Beispiel mit Schema wie https://www.schule.de/seite verwenden. Zusatzfunktionen eines Heimrouters sind nicht zwingende Eigenschaften jedes Routers.'},
 {id:'learning-goal',instruction:'Unbeabsichtigte Wiederholung desselben Lernziels im ganzen Test vermeiden; bewusste Wiederholung und Transfer bleiben zulässig. Gleicher Aufgabentyp oder andere Fakten sind allein keine Dublette. Ein negativer Smiley überschreibt niemals eine richtige Lösung.'},
 {id:'plausible-distractors',instruction:'Distraktoren müssen zum Lernziel und Anspruch passen und nach Möglichkeit typische Fehlvorstellungen prüfen. Keine bloß absurden Alternativen als Ersatz für fachlich anspruchsvolle Prüfung.'}
]);
function rulesPrompt(){return 'Verbindliche gemeinsame Qualitätsregeln '+VERSION+':\n'+RULES.map(r=>'['+r.id+'] '+r.instruction).join('\n');}
const norm=v=>String(v||'').normalize('NFKC').trim().toLocaleLowerCase('de');
function fraction(value){
 const m=norm(value).match(/^(-?\d{1,8})\s*\/\s*(\d{1,8})$/);if(!m||Number(m[2])===0)return null;
 let a=Math.abs(Number(m[1])),b=Number(m[2]);while(b){const c=a%b;a=b;b=c;}return Number(m[1])/a+'/'+Number(m[2])/a;
}
function questionFindings(q={}, {snapshot=false}={}){
 const findings=[],text=String(q.text||''),opts=Array.isArray(q.options)?q.options:[],correct=opts.filter(o=>o.correct===true);
 const add=(ruleId,message)=>findings.push({ruleId,message});
 if(['single','dropdown','multi'].includes(q.type)){
  // Deliberately narrow: a quoted terminal answer after an explicit answer label
  // or colour-word selection is demonstrable; merely occurring in text is not.
  const answer=text.match(/(?:richtige Antwort(?: lautet| ist)?|correct answer(?: is)?|choose the English colou?r word[^:]{0,160})\s*:\s*[„“"'«]([^„“”"'»]+)[“”"'»][.!?]?\s*$/iu);
  if(answer&&correct.some(o=>norm(o.text)===norm(answer[1])))add('visible-answer','Die Aufgabenstellung nennt die gesuchte Antwort bereits ausdrücklich.');
  if(/bruch|fraction|anteil/iu.test(text)&&!/(?:ohne\s+(?:zu\s+)?kürzen|ungekürzt|gekürzt|nicht\s+kürzen|unreduced|reduced|simplest\s+form|without\s+(?:reducing|simplifying))/iu.test(text)){
   const keys=correct.map(o=>fraction(o.text)).filter(Boolean);
   if(opts.some(o=>!o.correct&&keys.includes(fraction(o.text))&&fraction(o.text)!==null))add('fraction-equivalence','Eine als falsch markierte Bruchantwort ist wertgleich zur richtigen Antwort.');
  }
  if(correct.some(o=>norm(o.text)==='url')&&/\bwww\./iu.test(text)&&! /https?:\/\//iu.test(text))add('web-address','Das URL-Beispiel muss eine vollständige Webadresse mit Schema zeigen; Hostname und URL unterscheiden.');
 }
 if(!snapshot&&/^(?:höre\b|hör\s+dir\b|listen\s+(?:to|carefully|and)\b)/iu.test(text.trim())&&q.audioIntent?.kind!=='ai_generated'&&!q.audioUrl&&!q.audio?.url)add('media-ready','Ein Hörauftrag benötigt einen zugeordneten Hörtext im Audiokanal.');
 if(q.type==='gapfill'&&/dieser Zustand heißt\s*\[Permafrost\]/iu.test(text)&&!/(?:zwei|2)\s+(?:aufeinanderfolgende[nr]?\s+)?Jahre/iu.test(text))add('science-conditions','Die Permafrostdefinition benötigt mindestens zwei aufeinanderfolgende Jahre bei höchstens 0 °C.');
 return findings;
}
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
function digest(value){return createHash('sha256').update(typeof value==='string'?value:JSON.stringify(canonical(value))).digest('hex');}
function ruleReceipt(questions,operation,{generationId=randomUUID()}={}){
 const qs=Array.isArray(questions)?questions:[questions],findings=qs.flatMap((q,index)=>questionFindings(q).map(f=>({index,ruleId:f.ruleId})));
 return {version:VERSION,ruleIds:RULES.map(r=>r.id),promptSha256:digest(rulesPrompt()),generationId,operation,questionsSha256:digest(qs),questionCount:qs.length,deterministicChecksPassed:findings.length===0,findings,semanticQuality:'not_certified'};
}
function classifyFeedback(row,{at}={}){
 const q=row.questionSnapshot||{},base={policyVersion:VERSION,processedAt:at,ruleIds:[],snapshotSha256:digest(q)};
 const human=reasonCode=>({...base,route:'human',reasonCode});
 if(row.reviewOutcome==='false_positive')return human('reviewer_disagreement');
 if(row.verdict!=='bad')return human('positive_needs_review');
 if(String(row.teacherComment||'').trim())return human('additional_comment_needs_review');
 if(!q.text||!Array.isArray(q.options)||q.options.length<2||q.options.some(o=>!o.text))return human('context_incomplete');
 if(['duplicate','image_mismatch','other','incorrect','content_wrong','answer_wrong','off_topic'].includes(row.reason))return human('context_or_subject_review');
 // Only proof of an existing structural rule can be handled without a person.
 // Nothing here approves foreign task content or creates a new rule from text.
 const coveredReasons={'visible-answer':['','answer_leak'],'fraction-equivalence':['','ambiguous','unclear']};
 const candidates=questionFindings(q,{snapshot:true}).filter(f=>coveredReasons[f.ruleId]?.includes(row.reason||''));
 if(!candidates.length)return human('no_deterministic_proof');
 return {...base,route:'automatic',reasonCode:'existing_rule_covers_finding',ruleIds:[...new Set(candidates.map(f=>f.ruleId))]};
}
module.exports={VERSION,RULES,rulesPrompt,questionFindings,ruleReceipt,classifyFeedback};
