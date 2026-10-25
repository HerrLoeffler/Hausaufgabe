import test from 'node:test';import assert from 'node:assert/strict';
import {readQuestionFeedback} from '../plugin/question-feedback-reader.mjs';
const response=data=>({ok:true,text:async()=>JSON.stringify({result:data})});
test('supported smiley reader is live-bound, admin-authenticated, paginated and strips private fields',async()=>{
 const requests=[];const r=await readQuestionFeedback({token:'test-token',fetchImpl:async(url,options)=>{requests.push({url,options});return response({sourceProject:'hausaufgabe-staging',environment:'production',readOnly:true,reports:[{id:'rating',testCode:'TEST1234',questionId:'q1',verdict:'bad',status:'new',sourceProject:'unknown',questionSnapshot:{type:'text',text:'Aufgabe',acceptedAnswers:['PRIVATE']},email:'PRIVATE',userId:'PRIVATE'}],nextCursor:requests.length===1?'next-page':null});}});
 assert.equal(JSON.parse(requests[0].options.body).data.action,'listQuestionFeedback');assert.equal(r.pages,2);assert.equal(r.truncated,false);assert.equal(r.reports.length,1);assert.equal(JSON.stringify(r).includes('PRIVATE'),false);assert.equal(r.sourceProject,'hausaufgabe-staging');
});
test('missing auth, wrong project, unsupported response and cycling cursor cannot masquerade as no ratings',async()=>{
 await assert.rejects(readQuestionFeedback(),/Live-Anmeldung/);
 await assert.rejects(readQuestionFeedback({token:'t',fetchImpl:async()=>response({sourceProject:'hausaufgabe-40294',environment:'production',reports:[]})}),/Umgebung/);
 await assert.rejects(readQuestionFeedback({token:'t',fetchImpl:async()=>({ok:true,text:async()=>JSON.stringify({error:{status:'INVALID_ARGUMENT'}})})}),/bereitgestellt|abgelehnt/);
 await assert.rejects(readQuestionFeedback({token:'t',fetchImpl:async()=>response({sourceProject:'hausaufgabe-staging',environment:'production',reports:[],nextCursor:'same'})}),/Cursor/);
});
