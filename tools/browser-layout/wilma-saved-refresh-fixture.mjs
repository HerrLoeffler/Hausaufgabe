import {installWilmaAnswerReview} from '/wilma-answer-review.mjs';
import {createWilmaAutoReview,installWilmaReceiptRefresh,wilmaHasActiveInput} from '/wilma-auto-review.mjs';
if(!['127.0.0.1','localhost'].includes(location.hostname))throw Error('Fictional localhost fixture only.');
const question={id:'q',type:'text',text:'Nenne ein Tier.',points:1,acceptedAnswers:['Hund']};
const ctx={actor:'fictional-teacher',quiz:{id:'fictional-saved-receipt'},questions:[question],submissions:['missing','available'].map(id=>({id,studentName:id==='missing'?'Fiktiv A':'Fiktiv B',status:'review',answers:{q:id==='missing'?'Giraffe':'Katze'},grading:{q:{awardedPoints:0,autoPoints:0,maxPoints:1,needsReview:true}}}))};
const preparation=new Map();let ui,writes=0;
const scheduler=createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],allowFreeLookups:true,serverBudgeted:true,allowAutomaticPaid:()=>false,
 onState:s=>{preparation.set(s.submissionId,s);if(!s.savedOnly||!wilmaHasActiveInput(document))ui?.refresh();},onIdle:({savedOnly=false}={})=>{if(!savedOnly||!wilmaHasActiveInput(document))ui?.refresh();},
 analyzeAnswer:async p=>{
  if(p.allowPaid!==false)throw Error('Fixture must never start a provider');
  const response=await fetch('/fixture/receipt?sid='+encodeURIComponent(p.submissionId));const result=await response.json();
  if(!response.ok)throw Object.assign(Error('Saved result missing'),{details:result});
  ctx.submissions.find(s=>s.id===p.submissionId).grading.q.reviewSuggestion=result;
 }});
ui=installWilmaAnswerReview({document,getContext:()=>ctx,parseGaps:()=>[],answerDisplay:(_,a)=>a,correctDisplay:()=> 'Hund (Beispiel)',saveDecision:async()=>writes++,openSubmission:()=>{},notify:()=>{},getPreparation:(_,sid)=>preparation.get(sid),isPreparing:()=>scheduler.isRunning(),isAutomaticPreview:()=>true,resumeAnswer:p=>scheduler.resume(p)});
installWilmaReceiptRefresh({window,document,getContext:()=>ctx,getQuestionId:()=>ui.element.dataset.activeQuestion,isVisible:()=>ui.isExpanded(),refreshSaved:(p,options)=>scheduler.refreshSaved(p,options)});
ui.refresh();ui.openForQuestion('q');await scheduler.run();
window.fixture={ui,ctx,scheduler,get writes(){return writes;}};document.body.dataset.fixtureReady='true';
