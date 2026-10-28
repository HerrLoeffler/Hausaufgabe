import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('creation copy keeps detailed wishes prominent and removes redundant material/image prose',()=>{
 const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');assert.match(html,/Wichtig: Was soll der Test genau abfragen/);assert.match(html,/Nenne Inhalte, Schwerpunkte und Anforderungen/);assert.doesNotMatch(html,/Ohne Upload: Angaben verwenden|Quellfotos und eingescanntes Material/);assert.ok(html.includes('id="aiMaterialInput"'));
});
test('creation summary counts a full audio task once and shows real shared limits for N',()=>{
 const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),start=source.indexOf('function updateAiCreationSummary()'),end=source.indexOf('\nfunction updateAiImageControls',start);
 const fields=Object.fromEntries(Object.entries({aiCount:20,aiPoints:40,aiImageQuestionCount:2,aiAudioQuestionCount:2,aiAudioAnswerQuestionCount:3,aiFullAudioQuestionCount:0}).map(([k,v])=>[k,{value:String(v)}]));Object.assign(fields,{aiCreationSummary:{textContent:''},aiImageQuotaLabel:{},aiAudioQuotaLabel:{}});
 const c={$:id=>fields[id],state:{aiMaterials:[]}};vm.createContext(c);vm.runInContext(source.slice(start,end),c);c.updateAiCreationSummary();assert.match(fields.aiCreationSummary.textContent,/5 Audioaufgaben/);assert.match(fields.aiAudioQuotaLabel.textContent,/insgesamt max\. 5/);fields.aiCount.value='3';c.updateAiCreationSummary();assert.match(fields.aiImageQuotaLabel.textContent,/max\. 3/);
});
