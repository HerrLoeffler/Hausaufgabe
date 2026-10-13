'use strict';
// Assessment vendor is byte-identical to GradeCrew Web 8f869790.
const assessment=require('./vendor/assessment-core');
function fail(message){throw new Error(message)}
function preflight(questions){
 const issues=[],counts={};
 if(!Array.isArray(questions)||!questions.length||questions.length>80)return{ok:false,issues:['Der Test benötigt 1–80 Aufgaben.'],counts};
 const ids=new Set();
 questions.forEach((q,i)=>{const issue=m=>issues.push(`Aufgabe ${i+1}: ${m}`);counts[q.type]=(counts[q.type]||0)+1;
 if(!q.id||ids.has(q.id))issue('Aufgaben-ID fehlt oder ist doppelt.');ids.add(q.id);
 if(!assessment.SUPPORTED_TYPES.has(q.type))issue('Dieses Aufgabenformat ist nicht spielbar.');
 if(q.manualReview===true)issue('Manuelle Bewertung ist in Test-Rallye ausgeschlossen. Bitte im Editor umarbeiten.');
 if(!(Number.isFinite(Number(q.points))&&Number(q.points)>=0.5&&Number(q.points)<=100&&Number(q.points)*2===Math.round(Number(q.points)*2)))issue('Automatische Bewertung benötigt 0–100 positive Aufgabenpunkte.');
 if(JSON.stringify(q).length>850000)issue('Die Aufgabe ist mit ihren Medien zu groß. Bitte Medien im Editor verkleinern.');
 if(q.groups?.reduce((n,g)=>n+(g.items?.length||0),0)>200||assessment.parseGapAuthoringText(q.type==='gapfill'?q.text:'').length>200||q.options?.length>20||q.pairs?.length>30||q.items?.length>40||q.groups?.length>20||q.groups?.some(g=>g.items?.length>40)||q.acceptedAnswers?.length>20)issue('Zu viele Antwort-/Zuordnungselemente für den vollständigen Aufgabenvertrag. Bitte im Editor kürzen.');
 if((q.text||'').length>5000&&(q.type!=='gapfill')||(q.passage||'').length>12000||q.options?.some(o=>(o.text||'').length>1000)||q.acceptedAnswers?.some(a=>a.length>1000))issue('Text überschreitet den vollständig darstellbaren Aufgabenvertrag.');
 if(q.type==='text'&&(!Array.isArray(q.acceptedAnswers)||!q.acceptedAnswers.length||q.acceptedAnswers.some(x=>typeof x!=='string'||!x.trim())))issue('Freitext benötigt eindeutig hinterlegte automatische Antworten.');
 if(['single','multi','dropdown'].includes(q.type)&&(!Array.isArray(q.options)||q.options.length<2||!q.options.some(o=>o.correct)||q.type!=='multi'&&q.options.filter(o=>o.correct).length!==1))issue('Antwortauswahl oder eindeutiger Lösungsschlüssel fehlt.');
 if(q.type==='number'&&(!Number.isFinite(Number(q.numericAnswer))||q.numericAnswer==null||q.numericAnswer===''))issue('Eindeutige Zahlenantwort fehlt.');
 if(q.type==='truefalse'&&typeof q.correctBoolean!=='boolean')issue('Wahr/Falsch-Schlüssel fehlt.');
 if(q.type==='gapfill'&&assessment.parseGapAuthoringText(q.text).some(g=>g.answers.length>20||g.answers.some(a=>a.length>1000)))issue('Eine Lücke hat mehr als 20 Alternativantworten oder eine Antwort länger als 1000 Zeichen. Bitte im Editor kürzen.');
 if(q.type==='gapfill'&&!assessment.parseGapAuthoringText(q.text).length)issue('Auswertbare Lücken fehlen.');
 if(q.type==='matching'&&(!q.pairs?.length||q.pairs.some(p=>!String(p.left||'').trim()||!String(p.right||'').trim())))issue('Vollständige Zuordnungspaare fehlen.');
 if(q.type==='ordering'&&(!Array.isArray(q.items)||q.items.length<2||q.items.some(x=>!String(x).trim())))issue('Mindestens zwei Reihenfolgeelemente benötigt.');
 if(q.type==='grouping'&&(!q.groups?.length||q.groups.some(g=>!g.name||!g.items?.length)))issue('Gruppen oder Elemente fehlen.');
 if(q.pairs?.some(p=>(p.left||'').length>1000||(p.right||'').length>1000)||q.items?.some(x=>String(x).length>1000)||q.groups?.some(g=>(g.name||'').length>500||g.items?.some(x=>String(x).length>1000))||(q.unit||'').length>60||(q.imageDataUrl||q.imageUrl||'').length>750000||q.options?.some(o=>(o.imageDataUrl||o.imageUrl||'').length>750000))issue('Elemente überschreiten den vollständig darstellbaren Aufgabenvertrag.');
 try{const key=assessment.buildGradingKey(q,'preflight-secret');const paper=assessment.buildPublicQuestion(q,'preflight-secret');if(q.audioNeedsRegeneration===true||q.audioDataUrl&&!paper.audio)issue('Aufgaben-Audio fehlt, ist zu groß oder veraltet. Bitte im Editor reparieren.');if((key.correctWordIndexes?.length||Object.keys(key.correctWordColors||{}).length)>200)issue('Zu viele Markierwörter für eine vollständige Abgabe.');if(q.type==='markwords'&&(!q.passage||!(key.correctWordIndexes?.length||Object.keys(key.correctWordColors||{}).length)))issue('Markierwörter fehlen.');}catch(e){issue('Aufgaben-/Bild-/Audiovertrag unvollständig oder veraltet.');}
 });return{ok:!issues.length,issues,counts};
}
function snapshot(questions,secret){const check=preflight(questions);if(!check.ok)fail(check.issues.join('\n'));const c=assessment.buildAssessmentContract(structuredClone(questions),secret,{shuffleAnswers:false,shuffleQuestions:false});assessment.assertNoSolutionLeak(c.paper);return{paper:c.paper,key:c.gradingKey,fingerprint:c.sourceFingerprint};}
function validateAnswer(answer,depth=0){if(depth>2)fail('Ungültige Antwortstruktur.');if(answer==null)return;if(typeof answer==='string'){if(answer.length>8000)fail('Antwort zu lang.');return}if(typeof answer==='boolean'||typeof answer==='number')return;if(Array.isArray(answer)){if(answer.length>200)fail('Zu viele Antworten.');answer.forEach(x=>validateAnswer(x,depth+1));return}if(typeof answer==='object'){const entries=Object.entries(answer);if(entries.length>200||entries.some(([k])=>k.length>160||['__proto__','constructor','prototype'].includes(k)))fail('Ungültige Antwortstruktur.');entries.forEach(([,x])=>validateAnswer(x,depth+1));return}fail('Ungültige Antwort.');}
function submitTransition(room,player,p,now){
 if(!/^[A-Za-z0-9_-]{20,100}$/.test(p.requestId||''))fail('Ungültige Anfrage-ID.');
 if(p.version!==room.version)fail('Die Spielversion ist veraltet.');
 const cached=player.receipts?.[p.requestId];if(cached)return{player,receipt:cached};
 if(room.status!=='running'||now>=room.endAt)fail('Die Runde ist beendet.');
 if(p.version!==room.version)fail('Die Spielversion ist veraltet.');
 if(now<player.cooldownUntil)fail('Die Antwort-Pause läuft noch.');
 const q=room.snapshot.paper[player.cursor],key=room.snapshot.key.find(k=>k.id===q?.id);
 if(!q||p.questionId!==q.id||!key)fail('Diese Aufgabe wurde bereits abgegeben oder ist nicht aktuell.');validateAnswer(p.answer);
 const grade=p.skip===true?null:assessment.gradeQuestion(key,p.answer);if(grade?.needsReview)fail('Manuelle Bewertung ist ausgeschlossen.');
 const ratio=grade?Math.max(0,Math.min(1,grade.autoPoints/grade.maxPoints)):0;
 const delta=p.skip===true?0:ratio===0?-50:Math.round(ratio*100);const lock=p.skip===true||ratio===0;
 const receipt={version:room.version,requestId:p.requestId,questionId:q.id,delta,ratio,kind:p.skip===true?'skip':ratio===1?'correct':ratio>0?'partial':'wrong',score:Math.max(0,player.score+delta),cooldownUntil:lock?now+5000:0,completedAt:now};
 const next={...player,cursor:player.cursor+1,score:receipt.score,cooldownUntil:receipt.cooldownUntil,lastReceipt:receipt,receipts:{...player.receipts,[p.requestId]:receipt}};return{player:next,receipt};
}
function publicPlayerState(room,player,now){const finished=room.status==='finished'||now>=room.endAt||player.cursor>=room.snapshot.paper.length;return{status:room.status==='waiting'?'waiting':finished?'finished':'running',version:room.version,serverNow:now,endAt:room.endAt||null,score:player.score,cursor:player.cursor,total:room.snapshot.paper.length,cooldownUntil:player.cooldownUntil||0,lastReceipt:player.lastReceipt||null,question:room.status==='running'&&!finished&&now>=player.cooldownUntil?room.snapshot.paper[player.cursor]:null};}
module.exports={preflight,snapshot,validateAnswer,submitTransition,publicPlayerState};
