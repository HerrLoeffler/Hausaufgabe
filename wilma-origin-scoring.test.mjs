import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{gradeQuestion}=require('./assessment-functions/lib/assessment-core.js');
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8'),start=source.indexOf('function evaluateAnswer('),code=source.slice(start,source.indexOf('\n}',start)+2);
const evaluate=new Function('normalize','round1','parseGaps',code+';return evaluateAnswer;')(x=>String(x??'').trim().toLowerCase(),x=>Math.round(x*2)/2,text=>[...text.matchAll(/\[([^\]]+)\]/g)].map(match=>({answers:match[1].split('|')})));
for(const [label,grade] of [['browser',evaluate],['secure-server',gradeQuestion]]){
 const q={type:'text',points:1,acceptedAnswers:['front door'],manualReview:false};
 test(label+' nonempty mismatch needs semantic review',()=>{assert.equal(grade(q,'front Tür').needsReview,true);assert.equal(grade(q,'front').needsReview,true);});
 test(label+' accepted text gives deterministic provisional points pending confirmation',()=>{assert.equal(grade(q,'front door').needsReview,true);});
 test(label+' blank text zero does not require AI even on manual text',()=>{assert.equal(grade({...q,manualReview:true},'   ').needsReview,false);});
 const gaps={type:'gapfill',points:2,text:'Das ist [Verb|Zeitwort] und [Adjektiv].',gaps:[{id:'g1',acceptedAnswers:['Verb','Zeitwort']},{id:'g2',acceptedAnswers:['Adjektiv']}]};
 test(label+' unknown nonempty gap stays open and keeps the known partial point',()=>{const result=grade(gaps,['Verb','Eigenschaft']);assert.equal(result.needsReview,true);assert.equal((result.autoPoints??result.awarded),1);assert.equal(result.correct,null);});
 test(label+' known gap plus blank is a rule result, not a technical or AI case',()=>{const result=grade(gaps,['Zeitwort','']);assert.equal(result.needsReview,false);assert.equal((result.autoPoints??result.awarded),1);});
 test(label+' completely blank gaps remain zero without review',()=>{const result=grade(gaps,['','   ']);assert.equal(result.needsReview,false);assert.equal((result.autoPoints??result.awarded),0);});
 test(label+' all accepted gaps remain full rule points',()=>{const result=grade(gaps,['Zeitwort','Adjektiv']);assert.equal(result.needsReview,false);assert.equal((result.autoPoints??result.awarded),2);});
}
