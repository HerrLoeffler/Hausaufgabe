import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{gradeQuestion}=require('./assessment-functions/lib/assessment-core.js');
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8'),start=source.indexOf('function evaluateAnswer('),code=source.slice(start,source.indexOf('\n}',start)+2);
const evaluate=new Function('normalize','round1','parseGaps',code+';return evaluateAnswer;')(x=>String(x??'').trim().toLowerCase(),x=>Math.round(x*2)/2,()=>[]);
for(const [label,grade] of [['browser',evaluate],['secure-server',gradeQuestion]]){
 const q={type:'text',points:1,acceptedAnswers:['front door'],manualReview:false};
 test(label+' nonempty mismatch needs semantic review',()=>{assert.equal(grade(q,'front Tür').needsReview,true);assert.equal(grade(q,'front').needsReview,true);});
 test(label+' accepted match remains deterministic',()=>{assert.equal(grade(q,'front door').needsReview,false);});
 test(label+' blank text zero does not require AI even on manual text',()=>{assert.equal(grade({...q,manualReview:true},'   ').needsReview,false);});
}
