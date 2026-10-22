'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {createAI,cleanGenerated}=require('../lib/learning-brain/ai');
const s={topic:{id:'fractions'},phase:'practice',level:0,task:{prompt:'Erweitere2/3mit2',answer:{kind:'exact-fraction',values:['4/6']},rubric:'Zähler und Nenner mal2'}};
const generated=()=>({task:{prompt:'Erweitere 2/3 mit 2.',contextText:'',input:'text',options:[],family:'anwenden',answer:{kind:'exact-fraction',values:['4/6']},rubric:'Beide Zahlen mal2'},explanation:'',visual:{kind:'none',numerator:0,denominator:0,factor:0,description:''}});
function mock(responses){let count=0;const ai=createAI({client:{responses:{create:async request=>{assert.equal(request.store,false);assert.equal(request.text.format.strict,true);count++;return {status:'completed',output_text:JSON.stringify(responses.shift()),usage:{input_tokens:1}};}}}});return {ai,count:()=>count};}
test('generated question requires a distinct affirmative AI review',async()=>{const x=mock([generated(),{approved:true,reason:'valid'}]);const r=await x.ai.next(s,{});assert.ok(r.task.id);assert.equal(x.count(),2);assert.equal(r.explanation,'');});
test('explicit negative second review fails closed, never silently replaced',async()=>{const x=mock([generated(),{approved:false,reason:'wrong answer'},generated(),{approved:false,reason:'still wrong'}]);await assert.rejects(x.ai.next(s,{}),e=>e.code==='unavailable');assert.equal(x.count(),4);});
test('fraction form demanded by task is enforced independently from AI judgment',async()=>{const x=mock([{outcome:'correct',short:'Richtig.',reason:'equivalent'}]);await assert.rejects(x.ai.assess(s,'2/3'),e=>e.code==='unavailable');assert.equal(x.count(),1);});
test('open German alternatives use rubric and an independent review',async()=>{const x=mock([{outcome:'correct',short:'Ja, das begründest du passend.',reason:'alternative supported by text'},{approved:true,reason:'valid alternative'}]);const r=await x.ai.assess({...s,task:{prompt:'Begründe',answer:{kind:'open',values:['Beispiel']},rubric:'Textbeleg, auch andere richtige Formulierungen'}},'Eine andere plausible Antwort.');assert.equal(r.outcome,'correct');assert.equal(x.count(),2);});
test('bad numeric key, invalid picture and leaked practice explanation are rejected',()=>{for(const modify of [d=>d.task.answer.values=['1/0'],d=>d.visual={kind:'fraction-strip',numerator:4,denominator:3,factor:2},d=>d.explanation='Die Antwort ist4/6']){const d=generated();modify(d);assert.throws(()=>cleanGenerated(d,s));}});
test('only a newly corrected and independently approved candidate can follow rejection',async()=>{
 const first=generated();first.task.prompt='A bad draft';const second=generated();second.task.prompt='A corrected draft';
 const x=mock([first,{approved:false,reason:'bad draft'},second,{approved:true,reason:'corrected'}]);
 const r=await x.ai.next(s,{});assert.equal(r.task.prompt,'A corrected draft');assert.equal(x.count(),4);
});

test('numeric private keys normalize only mathematical display wrappers and preserve required form',()=>{
 for(const key of ['\\frac{4}{6}','\\(\\frac{4}{6}\\)','4⁄6']){const d=generated();d.task.answer.values=[key];assert.equal(cleanGenerated(d,s).task.answer.values[0],'4/6');}
 for(const key of ['1 1/2','1½','1 ½','2⅓','4/6 = 2/3','Zähler 4 Nenner 6','4*2','\\frac{1}{0}']){const d=generated();d.task.answer.values=[key];assert.throws(()=>cleanGenerated(d,s),e=>e.critique.includes('answer.values'));}
});

test('AI assessment and independent reviewer both receive server-derived manipulation evidence',async()=>{
 const requests=[],evidence={tool:'fraction-board',final:{numerator:1,denominator:6},valuePreserved:false,changes:[{type:'set-parts',value:6}]};
 const replies=[{outcome:'incorrect',short:'Du hast nur unten die Zahl verändert.',reason:'not equal'},{approved:true,reason:'consistent'}];
 const ai=createAI({client:{responses:{create:async req=>{requests.push(JSON.parse(req.input[1].content));return {status:'completed',output_text:JSON.stringify(replies.shift())};}}}});
 await ai.assess(s,'1/6',{workshop:evidence});assert.deepEqual(requests[0].workshop,evidence);assert.deepEqual(requests[1].workshop,evidence);
});

test('new workshop task is validated against its topic and private key before review',()=>{
 const d=generated();d.task.input='workshop';d.task.workshop={tool:'fraction-board',version:1,role:'answer',goal:'equivalent',numerator:2,denominator:3,targetDenominator:6,instruction:'Unterteile.'};
 assert.equal(cleanGenerated(d,{...s,topic:{subject:'math',title:'Brüche'}}).task.workshop.tool,'fraction-board');
 assert.throws(()=>cleanGenerated(d,{...s,topic:{subject:'german',title:'Lesen'}}));
});
