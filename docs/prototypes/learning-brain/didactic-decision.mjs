import {skills,learnerState} from './tutor-model.mjs';
export function decisionContext(task,events=[],kind='answer',guided=null){const last=kind==='answer'?events.filter(e=>e.taskId===task.id).at(-1):kind==='guided_complete'?{correct:!!guided?.correct,hinted:true,answer:guided?.answer,step:guided?.step}:null;const v=String(last?.answer||'').split('/').map(Number);const componentwise=last?.correct===false&&task.a[1]!==task.b[1]&&v.length===2&&v[1]>0&&v[0]*(task.a[1]+task.b[1])===v[1]*(task.a[0]+task.b[0]);return {allowedSupportFocus:componentwise?['whole','equivalence','factor']:null,errorSignals:componentwise?['componentwise_candidate']:[],kind,subject:'Mathematik',topic:'Bruchzahlen',grade:6,task:{skill:task.skill,a:task.a,b:task.b,answer:task.answer,difficulty:task.difficulty??1},observation:last?{correct:last.correct,hinted:!!last.hinted,answer:last.answer,...(last.step?{step:last.step}:{})}:null,history:events.slice(-10).map(e=>({skill:e.skill,difficulty:e.difficulty,correct:e.correct,hinted:e.hinted,answer:e.answer})),evidence:learnerState(events).evidence[task.skill],masteryClaim:false};}
export function validateDecision(raw,context){
 if(!raw||!['challenge','probe','support','pause'].includes(raw.action)||!Object.hasOwn(skills,raw.skill)||!Number.isInteger(raw.difficulty)||raw.difficulty<0||raw.difficulty>3||!['none','whole','equivalence','factor','sum','reading'].includes(raw.focus)||typeof raw.reason!=='string'||raw.reason.trim().length<3||raw.reason.length>220)throw Error('Die KI hat noch keine eindeutige didaktische Entscheidung geliefert.');
 if(raw.reason.includes('?'))throw Error('Die KI-Empfehlung darf keine zusätzliche unbeantwortbare Frage stellen.');
 const o=context.observation,level=context.task.difficulty??1,independent=context.kind==='answer'&&o?.correct&&!o.hinted;
 if(independent&&(raw.action!=='challenge'||raw.difficulty<Math.min(3,level+1)||['add','transfer'].includes(context.task.skill)&&!['add','transfer'].includes(raw.skill)))throw Error('Nach selbstständigem Erfolg fehlt die anspruchsvollere KI-Probe.');
 if(!independent&&raw.action==='challenge')throw Error('Eine unterstützte oder falsche Antwort rechtfertigt keinen automatischen Sprung.');
 if(context.kind==='help_requested'&&raw.action!=='support')throw Error('Die angeforderte Erklärung fehlt.');
 const recent=(context.history||[]).filter(e=>e.skill===context.task.skill).slice(-2);const needsTeaching=recent.length===2&&recent.every(e=>e.correct===false)||context.kind==='guided_complete'&&o?.correct===false;if(needsTeaching&&!['support','pause'].includes(raw.action))throw Error('Wiederholte Fehler brauchen gezielte Erklärung oder gemeinsame Unterstützung.');
 const lower=raw.difficulty<level||Object.keys(skills).indexOf(raw.skill)<Object.keys(skills).indexOf(context.task.skill)||level===0;if(needsTeaching&&raw.action!=='pause'&&!lower)throw Error('Wiederholte Fehler brauchen einen einfacheren Teilschritt.');if(context.kind==='guided_complete'&&raw.action==='probe'&&!lower)throw Error('Nach Hilfe fehlt die einfachere selbstständige Probe.');
 if(raw.action==='support'&&context.allowedSupportFocus&&!context.allowedSupportFocus.includes(raw.focus))throw Error('Die KI-Hilfe überspringt die nötige Klärung der Teilgröße.');
 if(raw.action==='support'&&raw.focus==='none')throw Error('Die KI hat den Hilfefokus noch nicht angegeben.');
 return {action:raw.action,skill:raw.skill,difficulty:raw.difficulty,focus:raw.focus,reason:raw.reason.trim()};
}
export function selectSupportSteps(steps,focus){let index=0;if(focus==='factor')index=steps.findIndex(s=>s.id.startsWith('expand-'));else if(focus==='sum')index=steps.findIndex(s=>s.id==='sum');else if(focus==='equivalence')index=steps.findIndex(s=>s.id.startsWith('partition-'));return steps.slice(Math.max(0,index));}
export const demandLabels=['Grundlage mit kleinen Zahlen','Ein Bruch muss erweitert werden','Beide Brüche müssen erweitert werden','Kombinierte Anwendung über ein Ganzes'];
export async function continueTutor(decision,context,{support,probe,show}){
 if(decision?.action==='support'){await support(decision.focus);return;}
 if(decision?.action==='probe'&&(context.kind==='guided_complete'||context.kind==='answer'&&context.observation?.correct===false)){await probe();return;}
 show();
}
