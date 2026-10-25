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

test('help keeps the actual failed fraction-board subdivision visible for its next micro-step',()=>{
 const d=generated();d.task.input='workshop';d.task.workshop={tool:'fraction-board',version:1,role:'answer',goal:'equivalent',numerator:2,denominator:3,targetDenominator:6,instruction:'Markiere jetzt gleich viel.'};d.explanation='Du hast sechs Teile, aber nur zwei markiert.';
 const result=cleanGenerated(d,{...s,phase:'help',topic:{subject:'math',title:'Brüche'}},{workshop:{tool:'fraction-board',goal:'equivalent',source:{numerator:2,denominator:3},final:{numerator:2,denominator:6},selection:[0,3]}});
 assert.deepEqual(result.task.workshop.initialState,{parts:6,selected:[0,3]});
});

test('generator and reviewer receive the same explicit demand-increase contract after independent success',async()=>{
 const harder=generated();harder.task.prompt='Erweitere 2/3 auf den Nenner 9.';harder.task.answer.values=['6/9'];const requests=[],replies=[harder,{approved:true,reason:'valid'}];
 const ai=createAI({client:{responses:{create:async req=>{requests.push(JSON.parse(req.input[1].content));return {status:'completed',output_text:JSON.stringify(replies.shift())};}}}});
 await ai.next({...s,level:1,previousLevel:0},{});
 assert.equal(requests[0].requireDemandIncrease,true);assert.equal(requests[1].requireDemandIncrease,true);
});

test('a reviewed private pool task is actually reused without another generation API request',async()=>{
 const {createPool}=require('../lib/learning-brain/fundus');const {plan}=require('../lib/learning-brain/planning');const rows=[];
 const pool=createPool({store:{list:async()=>rows,put:async(_key,_id,row)=>{rows.push(row);}}});
 const state={...s,task:null,events:[],topic:{id:'B07',title:'Wertgleich erweitern',subject:'math',grade:6,track:'R'}};
 const d=generated();await pool.save(state,plan(state),d,{approved:true,reusable:true});
 const ai=createAI({pool,client:{responses:{create:async()=>{throw new Error('Unexpected provider generation');}}}});
 const r=await ai.next(state,{});assert.equal(r.task.prompt,'Erweitere 2/3 mit 2.');assert.equal(r.task.generationSource,'reviewed-pool');assert.ok(r.task.id);assert.equal(r.explanation,'');
});
test('unusable successful provider responses still record their consumed tokens before failing safely',async()=>{
 const records=[];const ai=createAI({record:async(u,op)=>records.push({u,op}),client:{responses:{create:async()=>({status:'incomplete',incomplete_details:{reason:'max_output_tokens'},usage:{input_tokens:10,output_tokens:20}})}}});
 await assert.rejects(ai.next({...s,task:null},{}));assert.equal(records.length,1);assert.equal(records[0].u.input_tokens,20);assert.equal(records[0].u.output_tokens,40);
});
test('invalid generated fields carry private path and type/length diagnostics without copying text',()=>{
 for(const [field,modify] of [['task.prompt',d=>d.task.prompt='PRIVATE-PUPIL-TEXT'.repeat(40)],['task.contextText',d=>d.task.contextText=null],['task.rubric',d=>d.task.rubric={}],['task.family',d=>d.task.family=[]],['task.options',d=>d.task.options=['PRIVATE-PUPIL-TEXT'.repeat(20)]],['explanation',d=>d.explanation='PRIVATE-PUPIL-TEXT'.repeat(30)]]){
  const d=generated();modify(d);assert.throws(()=>cleanGenerated(d,s),error=>{assert.equal(error.stage,'candidate-validation');assert.ok(error.critique.includes(field));assert.ok(/type=|length=/.test(error.critique));assert.equal(error.critique.includes('PRIVATE-PUPIL-TEXT'),false);return true;});
 }
});
test('fraction whole-answer mismatch gives private exact format rather than an isolated numerator',()=>{
 const d=generated();d.task.input='workshop';d.task.workshop={tool:'fraction-board',version:1,role:'answer',goal:'equivalent',numerator:2,denominator:3,targetDenominator:6,instruction:'Unterteile.'};d.task.answer.values=['4'];
 assert.throws(()=>cleanGenerated(d,{...s,phase:'help',topic:{subject:'math',title:'Brüche'}}),error=>error.critique.includes('4/6')&&error.critique.includes('vollständigen Bruch')&&error.critique.includes('answer.values'));
});
test('balance cannot mandate isolating x when the answer contract checks its weight only',()=>{
 const d=generated();d.task.input='workshop';d.task.prompt='Stelle x allein auf eine Seite und finde das Gewicht.';d.task.answer={kind:'number',values:['4']};d.task.workshop={tool:'balance',version:1,role:'answer',goal:'balance',leftCoefficient:2,leftConstant:2,rightCoefficient:0,rightConstant:10,minimum:0,maximum:10,step:1,initialValue:1,instruction:'Finde das Gewicht.'};
 assert.throws(()=>cleanGenerated(d,{...s,topic:{subject:'math',title:'Gleichung'}}),error=>error.critique.includes('Umformungen')&&error.critique.includes('optional'));
 d.task.prompt='Finde das Gewicht von x.';assert.equal(cleanGenerated(d,{...s,topic:{subject:'math',title:'Gleichung'}}).task.workshop.tool,'balance');
});

test('balance rejects the actually observed hidden isolation requirement',()=>{
 const d=generated();d.task.input='workshop';d.task.prompt='Finde die Zahl x. Verändere die Waage so, dass x allein übrig bleibt.';d.task.answer={kind:'number',values:['4']};d.task.workshop={tool:'balance',version:1,role:'answer',goal:'balance',leftCoefficient:2,leftConstant:3,rightCoefficient:0,rightConstant:11,minimum:0,maximum:10,step:1,initialValue:1,instruction:'Finde das Gewicht.'};
 assert.throws(()=>cleanGenerated(d,{...s,topic:{subject:'math',title:'Gleichung'}}),e=>e.critique.includes('optional'));
});

test('help generator and reviewer share the same failed visible state, not a fabricated fresh board',async()=>{
 const observation={tool:'fraction-board',goal:'equivalent',source:{numerator:2,denominator:3},final:{numerator:2,denominator:6},selection:[0,1]};
 const d=generated();d.task.input='number';d.task.prompt='Rechne 2 mal 2.';d.task.answer={kind:'number',values:['4']};d.explanation='Oben und unten gilt derselbe Faktor.';
 const requests=[],replies=[d,{approved:true,reason:'single multiplication'}];
 const ai=createAI({client:{responses:{create:async req=>{requests.push(JSON.parse(req.input[1].content));return {status:'completed',output_text:JSON.stringify(replies.shift())};}}}});
 await ai.next({...s,phase:'help',supportStage:2},{workshop:observation});
 assert.deepEqual(requests[0].workshopObservation,observation);assert.deepEqual(requests[1].workshopObservation,observation);
});

test('independent text reviewer receives the selectable tokens actually derived by the renderer',async()=>{
 const d=generated();d.task.prompt='Welche Wortgruppe sagt, wann etwas geschieht?';d.task.input='workshop';d.task.answer={kind:'open',values:['Am Abend']};d.task.rubric='Die vollständige Zeitangabe markieren.';d.task.workshop={tool:'text-workbench',version:1,role:'answer',goal:'text',mode:'select',text:'Am Abend liest Mia ein Buch.',tokens:[],instruction:'Markiere die passende Wortgruppe.'};
 const requests=[],replies=[d,{approved:true,reason:'visible exact tokens'}];
 const ai=createAI({client:{responses:{create:async req=>{requests.push(JSON.parse(req.input[1].content));return {status:'completed',output_text:JSON.stringify(replies.shift())};}}}});
 await ai.next({...s,topic:{subject:'german',title:'Satzglieder'},task:null},{});
 assert.deepEqual(requests[1].renderedWorkshop.selectableTokens,['Am','Abend','liest','Mia','ein','Buch.']);assert.deepEqual(requests[1].candidate.task.workshop.tokens,[]);
});


test('listening has private source text while the public task exposes audio availability only',()=>{
 const d=generated();d.task.media={kind:'listen',script:'Am Morgen fährt Mia mit dem Bus zur Schule.'};
 const topic={...s.topic,delivery:'listen'};const task=cleanGenerated(d,{...s,topic}).task;
 const {publicSession}=require('../lib/learning-brain/core');
 const result=publicSession({...s,id:'audio',revision:1,deadline:Date.now()+1000,topic,task},Date.now());
 assert.deepEqual(result.task.media,{kind:'listen',available:true});assert.ok(!JSON.stringify(result.task).includes('Bus'));
 const noAudio=generated();assert.throws(()=>cleanGenerated(noAudio,{...s,topic}));
 d.task.contextText=d.task.media.script;assert.throws(()=>cleanGenerated(d,{...s,topic}));
});

test('the listening transcript cannot leak through prompt, options or diagram labels',()=>{
 for(const field of ['prompt','options','diagram']){const d=generated();d.task.media={kind:'listen',script:'Am Morgen fährt Mia mit dem Bus zur Schule.'};if(field==='options')d.task.options=[d.task.media.script];else if(field==='diagram')d.task.diagram={kind:'data-list',title:d.task.media.script,unit:'',values:[1]};else d.task.prompt=d.task.media.script;assert.throws(()=>cleanGenerated(d,{...s,topic:{delivery:'listen'}}));}
});

test('a demand increase cannot be the same question with other numbers and unchanged answer support',async()=>{
 const duplicate=generated(),repaired=generated();duplicate.task.prompt='Erweitere 3/5 mit 2.';duplicate.task.answer.values=['6/10'];repaired.task.prompt='Erweitere 2/3 auf den Nenner 9.';repaired.task.answer.values=['6/9'];
 const x=mock([duplicate,repaired,{approved:true,reason:'factor now inferred',demandAligned:true,progressionMeaningful:true}]);
 const state={...s,level:1,previousLevel:0,task:{...s.task,prompt:'Erweitere 2/3 mit 2.',input:'text'}};
 const result=await x.ai.next(state,{});assert.equal(result.task.prompt,repaired.task.prompt);assert.equal(x.count(),3);
});
test('review cannot approve a candidate while marking demand alignment false',async()=>{
 const x=mock([generated(),{approved:true,reason:'overshot',demandAligned:false,progressionMeaningful:true},generated(),{approved:true,reason:'still overshot',demandAligned:false,progressionMeaningful:true}]);
 await assert.rejects(x.ai.next(s,{}),e=>e.code==='unavailable');
});

test('a word choice has an explicitly validated open answer contract for the reviewer',async()=>{
 const candidate=generated();candidate.task.input='choice';candidate.task.options=['links','rechts'];candidate.task.answer={kind:'open',values:['rechts']};
 const requests=[],replies=[candidate,{approved:true,reason:'word choice valid',demandAligned:true,progressionMeaningful:true}];
 const ai=createAI({client:{responses:{create:async request=>{requests.push(JSON.parse(request.input[1].content));return {status:'completed',output_text:JSON.stringify(replies.shift())};}}}});
 await ai.next(s,{});assert.deepEqual(requests[1].renderedResponseContract,{input:'choice',answerKind:'open',choiceKeysMatch:true});
 candidate.task.answer.values=[];assert.throws(()=>cleanGenerated(candidate,s));
});

test('an expansion probe cannot use value-only representation or accept the unexpanded form',()=>{
 const candidate=generated();candidate.task.prompt='Erweitere 2/5 mit dem Faktor 3.';candidate.task.input='workshop';candidate.task.workshop={tool:'fraction-board',version:1,role:'answer',goal:'represent',numerator:2,denominator:5,targetDenominator:0,instruction:'Erweitere den Bruch.'};candidate.task.answer={kind:'rational',values:['6/15']};
 const state={...s,topic:{subject:'math',title:'Erweitern',didacticFamily:'expand'},level:0};
 assert.throws(()=>cleanGenerated(candidate,state));
 candidate.task.workshop={...candidate.task.workshop,goal:'equivalent',targetDenominator:15};candidate.task.answer.kind='exact-fraction';
 assert.equal(cleanGenerated(candidate,state).task.workshop.targetDenominator,15);
 candidate.task.input='text';candidate.task.workshop={tool:'none',version:1};candidate.task.answer.kind='rational';assert.throws(()=>cleanGenerated(candidate,state));
});

test('a rejected answer explanation is revised once and independently reviewed again',async()=>{
 const x=mock([{outcome:'incorrect',short:'Du hast den Zähler geändert.',reason:'wrong diagnosis'}, {approved:false,reason:'Actually denominator changed'}, {outcome:'incorrect',short:'Du hast nur den Nenner geändert.',reason:'corrected diagnosis'}, {approved:true,reason:'consistent'}]);
 const result=await x.ai.assess(s,'2/6');assert.equal(result.outcome,'incorrect');assert.match(result.short,/Nenner/);assert.equal(x.count(),4);
});

test('two rejected answer judgments still fail closed without inventing an approval',async()=>{
 const grade={outcome:'incorrect',short:'Noch nicht richtig.',reason:'draft'};
 const x=mock([grade,{approved:false,reason:'wrong feedback'},grade,{approved:false,reason:'still wrong'}]);
 await assert.rejects(x.ai.assess(s,'2/6'),e=>e.code==='unavailable'&&e.stage==='answer-review');assert.equal(x.count(),4);
});
