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

test('server undo patch rehydrates the existing proposal without another paid preparation',async()=>{
 const {createWilmaAutoReview}=await import('./wilma-auto-review.mjs');
 const begin=source.indexOf('async function saveWilmaDecision('),saveCode=source.slice(begin,source.indexOf('\n}',begin)+2);
 const q={id:'q',type:'text',text:'English for Haustür?',points:1,acceptedAnswers:['front door']};
 const s={id:'s',status:'review',answers:{q:'front Tür'},grading:{q:{autoPoints:0,awardedPoints:0,maxPoints:1,needsReview:false}}};
 const state={user:{uid:'owner'},currentResultsQuiz:{id:'fiction',ownerId:'owner'},resultQuestions:[q],submissions:[s]};let transports=0,paid=0,pending;
 const cache=new Map(),scheduler=createWilmaAutoReview({getContext:()=>({actor:'owner:1',quiz:state.currentResultsQuiz,questions:state.resultQuestions,submissions:state.submissions}),parseGaps:()=>[],enabled:()=>true,analyzeAnswer:async({submissionId})=>{transports++;if(!cache.has(submissionId)){paid++;cache.set(submissionId,{points:.5,status:'uncertain',reason:'Synthetic partial meaning.',source:'wilma-ai'});}state.submissions.find(s=>s.id===submissionId).grading.q.reviewSuggestion=cache.get(submissionId);}});
 await scheduler.run();assert.equal(paid,1);
 const context={state,authStateGeneration:1,guestTourRepo:null,wilmaAutoReview:scheduler,wilmaSavedOperations:new Map([['owner:fiction:s',{questionId:'q',operationId:'prior'}]]),persistWilmaDecision:async()=>({operationId:'undo',patch:{grading:{q:{autoPoints:0,awardedPoints:0,maxPoints:1,needsReview:true,reviewState:'open'}},status:'review'}}),renderResultsTable:()=>pending=scheduler.run()};
 vm.runInNewContext(saveCode+';this.save=saveWilmaDecision;',context);await context.save({submissionId:'s',restore:{},expected:s});await pending;
 assert.ok(state.submissions[0].grading.q.reviewSuggestion,'authoritative point patch must not leave an already checked answer looking unexamined');assert.equal(state.submissions[0].grading.q.awardedPoints,0);assert.equal(transports,2);assert.equal(paid,1);
});
test('automatic results preparation cannot repaint a view after the teacher leaves it',async()=>{
 let finish,started,visible=true;const wait=new Promise(r=>finish=r),begun=new Promise(r=>started=r);const q={id:'q',type:'text',text:'Begründe ein Halb',points:2,reviewCriteria:['Begründung']};const s={id:'s',status:'review',answers:{q:'Zwei gleich große Teile'},grading:{q:{awardedPoints:0,maxPoints:2,needsReview:true}}};let renders=0;
 const ctx={state:{user:{uid:'owner'},currentResultsQuiz:{id:'own',ownerId:'owner'},resultQuestions:[q],submissions:[s]},authStateGeneration:1,wilmaReviewGeneration:1,guestTourRepo:null,questionSnapshot,reviewItem,parseGaps:()=>[],reviewWithWilma:async()=>{started();return wait;},wilmaAutomaticPreview:()=>visible,renderResultsTable:()=>renders++,toast:()=>{}};
 vm.runInNewContext(code+';this.run=analyzeWilmaQuestion;',ctx);const pending=ctx.run('q','',s.id,true,true);await begun;visible=false;finish({answers:[{id:'s',points:2,status:'clear',reason:'Passend'}],requestId:'fictitious'});await assert.rejects(pending,/gewechselt|geändert/);assert.equal(renders,0);assert.equal(s.grading.q.reviewSuggestion,undefined);
});
