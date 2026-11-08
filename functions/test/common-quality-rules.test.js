'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
let rules={};try{rules=require('../lib/common-quality-rules');}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
const choice=(text,options)=>({type:'single',text,points:1,options:options.map(([text,correct])=>({text,correct})),mediaIntent:{kind:'none'},audioIntent:{kind:'none'}});
const errors=q=>{assert.equal(typeof rules.questionFindings,'function');return rules.questionFindings(q);};
test('visible quoted answer is rejected without mistaking candidate text or internal gap answers for a leak',()=>{
 assert.ok(errors(choice('Choose the English colour word for the colour of a tree trunk: “brown”.',[['brown',true],['blue',false]])).some(x=>x.ruleId==='visible-answer'));
 assert.deepEqual(errors({type:'gapfill',text:'Die Winkelsumme beträgt [180] Grad.'}),[]);
 assert.deepEqual(errors(choice('Which word means brown in German?',[['braun',true],['blau',false]])),[]);
 assert.deepEqual(errors(choice('Read the text: The tree is brown. Which colour is mentioned?',[['brown',true],['blue',false]])),[]);
});
test('equivalent fraction alternatives cannot produce two correct values unless representation is explicitly asked',()=>{
 const q=choice('Welcher Bruchteil ist markiert?',[['1/3',true],['2/6',false],['1/2',false]]);
 assert.ok(errors(q).some(x=>x.ruleId==='fraction-equivalence'));
 assert.deepEqual(errors({...q,text:'Lies den Bruch ohne Kürzen aus dem Bild ab.'}),[]);
 assert.deepEqual(errors(choice('Welche Zahl ist eine Primzahl?',[['2',true],['6',false]])),[]);
});
test('explicit fully reduced fraction representation remains valid',()=>{
 assert.deepEqual(errors(choice('Welcher Bruch ist vollständig gekürzt?',[['1/2',true],['2/4',false]])),[]);
 assert.deepEqual(errors(choice('Which fraction is in simplest form?',[['1/2',true],['2/4',false]])),[]);
});
test('a listening instruction needs a listening intent, while ordinary text reading does not',()=>{
 assert.ok(errors(choice('Höre den Text. Welches Wort hörst du?',[['rot',true],['blau',false]])).some(x=>x.ruleId==='media-ready'));
 const q=choice('Höre den Text. Welche Farbe wird genannt?',[['rot',true],['blau',false]]);q.audioIntent={kind:'ai_generated',script:'Die Farbe ist rot.'};assert.deepEqual(errors(q),[]);
 assert.deepEqual(errors(choice('Lies den Satz. Welche Farbe wird genannt?',[['rot',true],['blau',false]])),[]);
});
test('German lists are not mistaken for an English audio instruction',()=>{
 assert.deepEqual(errors(choice('Listen können unterschiedlich lang sein. Welche Liste enthält drei Zahlen?',[['1, 2, 3',true],['1, 2',false]])),[]);
 assert.ok(errors(choice('Listen to the recording. Which colour is mentioned?',[['red',true],['blue',false]])).some(x=>x.ruleId==='media-ready'));
});
test('permafrost definition requires the two year criterion without rejecting a mere topic mention',()=>{
 assert.ok(errors({type:'gapfill',text:'Der Boden bleibt auch im Sommer gefroren. Dieser Zustand heißt [Permafrost].'}).some(x=>x.ruleId==='science-conditions'));
 assert.deepEqual(errors({type:'gapfill',text:'Bleibt der Untergrund mindestens zwei aufeinanderfolgende Jahre bei höchstens 0 °C, heißt dieser Zustand [Permafrost].'}),[]);
 assert.deepEqual(errors({type:'gapfill',text:'Auftauender Permafrost kann die [Stabilität] beeinflussen.'}),[]);
});
test('URL example must distinguish complete address from host while unrelated domain questions stay valid',()=>{
 assert.ok(errors(choice('Wie heißt eine Webadresse, zum Beispiel www.schule.de?',[['URL',true],['USB',false]])).some(x=>x.ruleId==='web-address'));
 assert.deepEqual(errors(choice('Wie heißt eine Webadresse, zum Beispiel https://www.schule.de/seite?',[['URL',true],['USB',false]])),[]);
 assert.deepEqual(errors(choice('Wie heißt der Hostname in der Adresse?',[['www.schule.de',true],['https',false]])),[]);
});
test('shared rules reach primary generation and whole test revision, even with no personal feedback',()=>{
 assert.equal(typeof rules.rulesPrompt,'function');const guide=rules.rulesPrompt();
 const {SYSTEM}=require('../lib/prompts');const {WHOLE_TEST_REVISION_SYSTEM}=require('../lib/whole-test-revision');
 assert.ok(SYSTEM.includes(guide));assert.ok(WHOLE_TEST_REVISION_SYSTEM.includes(guide));
 for(const word of ['Permafrost','Kürzen','Vergleich','Distraktoren','Wiederholung'])assert.ok(guide.includes(word),word);
 const {validateQuestion}=require('../lib/validation');assert.ok(validateQuestion(choice('Choose the English colour word for the colour of a tree trunk: “brown”.',[['brown',true],['blue',false]])).some(x=>x.includes('visible-answer')));
});
