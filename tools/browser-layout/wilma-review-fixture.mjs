import {installWilmaAnswerReview} from '/wilma-answer-review.mjs';
if(!['127.0.0.1','localhost'].includes(location.hostname))throw Error('Local fictional fixture only.');
const count=new URL(location.href).searchParams.get('tasks')==='20'?20:40;
const questions=Array.from({length:count},(_,i)=>({id:'q'+(i+1),type:'text',text:'Fiktive Aufgabe '+(i+1)+': Nenne das englische Wort für Haustür.',points:1,manualReview:i===0||i===count-1,acceptedAnswers:['front door']}));
const ctx={actor:'fictional-owner:1',quiz:{id:'layout-fixture'},questions,submissions:['A','B'].map(id=>({id,status:'review',studentName:'Fiktiv '+id,answers:Object.fromEntries(questions.map(q=>[q.id,'front door'])),grading:Object.fromEntries(questions.map(q=>[q.id,{autoPoints:q.manualReview?0:1,awardedPoints:q.manualReview?0:1,maxPoints:1,needsReview:q.manualReview,correct:q.manualReview?null:true}]))}))};
const ui=installWilmaAnswerReview({document,getContext:()=>ctx,parseGaps:()=>[],answerDisplay:(_,answer)=>answer,correctDisplay:q=>q.acceptedAnswers.join(' / '),notify:text=>document.getElementById('fixtureNotice').textContent=text,isDemo:()=>true,openSubmission:()=>{},saveDecision:async()=>{throw Error('Layout fixture must not save grades.');}});
ui.refresh();ui.openForQuestion('q1');document.body.dataset.fixtureReady='true';
