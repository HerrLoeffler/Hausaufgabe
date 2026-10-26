'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {planProgression,progressionPrompt,questionDemandErrors,progressionWarnings}=require('../lib/demand-plan');
const input={count:6,difficulty:'anspruchsvoll',subject:'Mathematik',grade:'7',notes:''};
const q=(position,level,rationale='Ein bekannter Schritt im angegebenen Klassenkontext.')=>({demand:{position,level,rationale}});
test('default plans start accessibly and rise within selected target, never inferred from question type or points',()=>{
 assert.deepEqual(planProgression(input).levels,[1,1,2,2,3,3]);
 assert.deepEqual(planProgression({...input,difficulty:'leicht'}).levels,[1,1,1,1,1,1]);
 assert.deepEqual(planProgression({...input,difficulty:'mittel',count:3}).levels,[1,2,2]);
 assert.deepEqual(planProgression({...input,count:1}).levels,[1]);
});
test('fixed positions and connected or chronological contexts are retained without global sorting',()=>{
 const p=planProgression({...input,notes:'Aufgabe 1 anspruchsvoll; Aufgabe 3 Dreisatz so einfach wie möglich.'});
 assert.deepEqual(p.pinned,[1,3]);assert.deepEqual(questionDemandErrors(q(1,3),0,p),[]);
 assert.ok(questionDemandErrors(q(2,3),1,p).length);
 for(const notes of ['gemischte Reihenfolge','chronologische Reihenfolge','zusammenhängender Hörtext','Kapitelblöcke mit Abhängigkeiten'])assert.equal(planProgression({...input,notes}).mode,'contextual');
 assert.ok(progressionWarnings(p).length);assert.equal(planProgression({...input,generationMode:'variant'}),null);
});
test('batch plans use global task positions and never restart at level one',()=>{
 const p=planProgression({...input,count:10,totalCount:30,batchOffset:20});
 assert.equal(p.slots[0].position,21);assert.equal(p.slots.at(-1).position,30);assert.equal(p.slots.at(-1).level,3);
 assert.match(progressionPrompt({...input,count:10,totalCount:30,batchOffset:20}),/21/);
});
test('missing, reversed or unreasoned declared demand fails; all-easy ceiling stays low',()=>{
 const p=planProgression({...input,count:3});
 assert.ok(questionDemandErrors({},0,p).length);assert.ok(questionDemandErrors(q(2,3),0,p).length);
 assert.ok(questionDemandErrors(q(1,1,''),0,p).length);
 assert.ok(questionDemandErrors(q(3,3),2,planProgression({...input,count:3,difficulty:'leicht'})).length);
 assert.deepEqual(questionDemandErrors(q(3,3),2,p),[]);
});
const {questionSchemaForType,testSchemaForRequest}=require('../lib/schemas');
const {validateTest,normalizeQuestion}=require('../lib/validation');
const {validateAndRepairTest}=require('../lib/repair-test');
const number=(position,level)=>normalizeQuestion({type:'number',text:`Berechne ${position}+10.`,numericAnswer:position+10,points:1,tolerance:0,unit:'',mediaIntent:{kind:'none'},audioIntent:{kind:'none'},...q(position,level)});
test('opted-in generation and replacement schemas demand explicit private planning metadata',()=>{
 assert.ok(questionSchemaForType('single',{progression:true}).required.includes('demand'));
 assert.ok(testSchemaForRequest({count:3,allowedTypes:['number'],progression:true}).properties.questions.items.anyOf[0].required.includes('demand'));
 assert.equal(questionSchemaForType('single').required.includes('demand'),false);
});
test('final validator rejects an inverted plan without modifying keys, media or question order',()=>{
 const plan=planProgression({...input,count:3}),draft={title:'Test',questions:[number(1,3),number(2,2),number(3,1)]};const snapshot=JSON.stringify(draft);
 assert.ok(validateTest(draft,{progressionPlan:plan}).some(x=>/Anforderungsplan/.test(x)));
 assert.equal(JSON.stringify(draft),snapshot);
});
test('existing bounded repair targets the incorrect slot and keeps media and grading with the task',async()=>{
 const plan=planProgression({...input,count:3}),draft={title:'Test',questions:[number(1,1),number(2,2),number(3,1)]};let replacements=0;
 const result=await validateAndRepairTest(draft,{progressionPlan:plan,expectedCount:3,targetPoints:3,allowedTypes:['number'],allowImages:false,allowAudio:false},{generateQuestion:async({index,original,reasons})=>{assert.equal(index,2);assert.match(reasons.join(' '),/Anforderungsplan/);replacements++;return {...original,text:'Ein Preis von 20 Euro sinkt um 50 Prozent und steigt danach um 30 Prozent. Berechne den Endpreis.',demand:{...original.demand,level:3,rationale:'Zwei aufeinanderfolgende Prozentänderungen mit wechselndem Grundwert in Klasse7.'}};},regenerateTest:async()=>{throw Error('whole test repetition unnecessary')}});
 assert.equal(replacements,1);assert.deepEqual(result.errors,[]);assert.deepEqual(result.test.questions.map(x=>x.numericAnswer),[11,12,13]);assert.deepEqual(result.test.questions.map(x=>x.demand.level),[1,2,3]);
});
test('explicit whole-test easy wishes cap demand without turning a task-specific wish into a global override',()=>{
 for(const notes of ['Alle Aufgaben bitte einfach.','Nur einfache Aufgaben.','Dreisatz so einfach wie möglich.'])assert.equal(planProgression({...input,notes}).maxLevel,1);
 assert.equal(planProgression({...input,notes:'Aufgabe 3: Dreisatz so einfach wie möglich.'}).maxLevel,3);
});
test('review receives authoritative subject and class and must challenge labels against actual thinking steps',()=>{
 const {reviewPrompt,reviewSchema,normalizeReviewIssues}=require('../lib/quality');
 for(const [subject,grade,topic] of [['Mathematik','2','Einstelliger Zehnerübergang'],['Deutsch','9','Begründete Textdeutung']]){
  const plan=planProgression({...input,subject,grade,topic,count:3});const draft={subject:'ignored model subject',grade:'wrong',questions:[number(1,1)]};
  const prompt=reviewPrompt(draft,{},plan);assert.ok(prompt.includes(subject));assert.ok(prompt.includes(topic));assert.ok(prompt.includes('"grade":"'+grade+'"'));assert.match(prompt,/kein Beweis/);assert.match(prompt,/Punkte sind kein Schwierigkeitsmaß/);
 }
 assert.ok(reviewSchema.properties.issues.items.properties.reason.enum.includes('difficulty'));
 const issues=normalizeReviewIssues({issues:[{index:0,reason:'difficulty',detail:'Mehrere unbekannte Umformungen statt eines vertrauten Einstiegs.',evidence:'',suggestedAcceptedOrder:[]}]},{questions:[number(1,1)]});assert.equal(issues[0].reason,'difficulty');
});
test('saved teacher creation context retains reviewed levels without enabling question shuffle',()=>{
 const {quizForGeneratedTest}=require('../lib/ai-job');
 const draft={title:'Prozent',questions:[number(1,1),number(2,2),number(3,3)]};
 const quiz=quizForGeneratedTest(draft,{...input,count:3,points:3},{});
 assert.deepEqual(quiz.creationContext.difficultyProgression.levels,[1,2,3]);assert.equal(quiz.shuffleQuestions,false);
});
test('task numbers outside selected count are surfaced instead of silently discarded',()=>{
 const plan=planProgression({...input,count:3,notes:'Aufgabe 7 soll ein Bild enthalten.'});assert.match(progressionWarnings(plan).join(' '),/7.*außerhalb/);
});
test('numbered image/content wishes never bypass an explicit easy ceiling',()=>{
 const p=planProgression({...input,difficulty:'leicht',notes:'Alle Aufgaben bitte einfach. Aufgabe 2 soll eine Bildfrage sein.'});assert.equal(p.maxLevel,1);assert.ok(questionDemandErrors(q(2,3),1,p).some(e=>/Gesamtniveau/.test(e)));
});
test('a local easy request is available to independent review and constrains its named slot',()=>{
 const notes='Aufgabe 3: Dreisatz so einfach wie möglich.';const p=planProgression({...input,count:3,notes});
 assert.equal(p.levels[2],1);assert.ok(questionDemandErrors(q(3,3),2,p).length);
 assert.match(require('../lib/quality').reviewPrompt({questions:[number(1,1)],subject:'Mathe',grade:'7'},{},p),/Dreisatz so einfach wie möglich/);
});
test('an explicit first-task single image is budgeted in the first batch, not interpreted as four images',()=>{
 const {planTestBatches}=require('../lib/test-batches');
 const data={...input,count:25,points:25,exactImageCounts:true,imageQuestionCount:1,imageMode:'exact',notes:'Aufgabe 1: Single Choice mit einem Bild mit vier Obstsorten. Aufgabe 3: einfacher Dreisatz.'};
 const batches=planTestBatches(data);assert.equal(batches[0].imageQuestionCount,1);assert.equal(batches.reduce((n,b)=>n+b.imageQuestionCount,0),1);
 const p=planProgression(data);assert.ok(questionDemandErrors(number(1,1),0,p).some(e=>/Bild/.test(e)));
});
test('contradictory fixed task demand or unavailable requested image is explicit before any paid call',()=>{
 assert.ok(planProgression({...input,difficulty:'leicht',notes:'Aufgabe 1: anspruchsvoll.'}).conflicts.length);
 assert.ok(planProgression({...input,imageMode:'none',imageQuestionCount:0,notes:'Aufgabe 1 mit einem Bild.'}).conflicts.length);
});
