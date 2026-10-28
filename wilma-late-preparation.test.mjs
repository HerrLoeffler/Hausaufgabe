import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';import {questionSnapshot} from './wilma-review-source.mjs';import {reviewItem} from './wilma-answer-review.mjs';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8'),start=source.indexOf('async function analyzeWilmaQuestion('),code=source.slice(start,source.indexOf('\n}',start)+2);
test('late successful model receipt after same-test refresh cannot discard new form inputs',async()=>{
 let finish,started;const gate=new Promise(r=>finish=r),begun=new Promise(r=>started=r);
 const q={id:'q',type:'text',text:'English for Haustür?',points:1,acceptedAnswers:['front door']};
 const s={id:'s',answers:{q:'front Tür'},grading:{q:{autoPoints:0,awardedPoints:0,maxPoints:1,needsReview:false}}};let renders=0;
 const context={state:{user:{uid:'owner'},currentResultsQuiz:{id:'fiction',ownerId:'owner'},resultQuestions:[q],submissions:[s]},authStateGeneration:1,wilmaReviewGeneration:1,guestTourRepo:null,questionSnapshot,reviewItem,parseGaps:()=>[],reviewWithWilma:async()=>{started();return gate;},renderResultsTable:()=>renders++,toast:()=>{}};
 vm.runInNewContext(code+';this.run=analyzeWilmaQuestion;',context);const pending=context.run('q','',s.id);await begun;context.wilmaReviewGeneration++;
 finish({answers:[{id:'s',points:.5,status:'uncertain',reason:'Synthetic partial meaning.'}],requestId:'synthetic-model'});
 await assert.rejects(pending,/gewechselt|geändert/);assert.equal(renders,0);assert.equal(s.grading.q.reviewSuggestion,undefined);
});
