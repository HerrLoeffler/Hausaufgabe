'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {updateExperience,experienceFor}=require('../lib/learning-brain/help-experience');
const {observeHelp}=require('../lib/learning-brain/help-evidence');
const task=id=>({id,prompt:`private prompt ${id}`,answer:'private answer',workshop:{tool:'number-line'}});
function fixture(strategyId='focus-one',topicId='fractions',sessionId='session-1',initialMemory=null){
 let memory=initialMemory,s={id:sessionId,topic:{id:topicId},phase:'practice',revision:0,task:task('original'),helpEpisodes:[]},serial=0;
 const step=(action,patch,assessment)=>{
  const before=globalThis.structuredClone(s);s={...s,...patch,revision:s.revision+1};
  s=observeHelp(before,s,{action,assessment,now:100});
  const options={action,assessment,eventId:`event-${sessionId}-${++serial}`};
  memory=updateExperience(memory,before,s,options);
  return {before,after:globalThis.structuredClone(s),options};
 };
 step('help',{phase:'help',originalTask:s.task});
 const generated=step('help-generated',{task:task('support'),assistance:{strategyId,numberLabels:false},explanation:'private explanation'});
 return {step,generated,get session(){return s;},get memory(){return memory;},summary:()=>experienceFor(memory,topicId,'number-line')};
}
test('generated uses and accepted answers are replay safe and outcomes use the previous strategy',()=>{
 const f=fixture();
 const repeated=updateExperience(f.memory,f.generated.before,f.generated.after,f.generated.options);
 assert.equal(experienceFor(repeated,'fractions','number-line').strategies[0].uses,1);
 const event=f.step('answer',{assistance:{strategyId:'contrast'}},{outcome:'incorrect'});
 const m=updateExperience(f.memory,event.before,event.after,event.options);
 assert.equal(experienceFor(m,'fractions','number-line').strategies[0].supportedErrors,1);
 assert.equal(experienceFor(m,'fractions','number-line').strategies.length,1);
});
test('helped success and original completion are separate from independent transfer',()=>{
 const f=fixture();
 f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
 let e=f.summary().strategies[0];assert.equal(e.supportedSuccesses,1);assert.equal(e.independentSuccesses,0);
 f.step('answer',{phase:'practice',task:task('fresh')},{outcome:'correct'});
 e=f.summary().strategies[0];assert.equal(e.completions,1);assert.equal(e.independentSuccesses,0);
 f.step('answer',{task:task('fresh-2')},{outcome:'correct'});
 e=f.summary().strategies[0];assert.equal(e.independentSuccesses,1);assert.equal(e.transferEpisodes,1);assert.equal(e.advice,'explore');
});
test('repeated original or support tasks do not count as independent transfer',()=>{
 for(const id of ['original','support']){
  const f=fixture();f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
  f.step('answer',{phase:'practice',task:task(id)},{outcome:'correct'});
  f.step('answer',{}, {outcome:'correct'});
  assert.equal(f.summary().strategies[0].independentSuccesses,0);
 }
});
test('probes before accepted original completion cannot establish transfer',()=>{
 const f=fixture();f.step('answer',{phase:'practice',task:task('fresh')},{outcome:'correct'});
 f.step('answer',{}, {outcome:'correct'});
 assert.equal(f.summary().strategies[0].independentSuccesses,0);
});
test('topic and tool summaries cannot contaminate one another',()=>{
 const f=fixture();assert.deepEqual(experienceFor(f.memory,'different-topic','number-line').strategies,[]);
 assert.deepEqual(experienceFor(f.memory,'fractions','different-tool').strategies,[]);
});
test('two supported errors without transfer advise changing strategy',()=>{
 const f=fixture();f.step('answer',{}, {outcome:'incorrect'});f.step('answer',{}, {outcome:'incorrect'});
 assert.equal(f.summary().strategies[0].advice,'change-strategy');
 assert.equal(f.summary().strategies[0].confidence,'insufficient');
});
test('ambiguous episodes retain supported counts but do not invent transfer attribution',()=>{
 const f=fixture();f.step('help-generated',{task:task('support-2'),assistance:{strategyId:'contrast'}});
 f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
 f.step('answer',{phase:'practice',task:task('fresh')},{outcome:'correct'});
 f.step('answer',{}, {outcome:'correct'});
 assert.ok(f.summary().strategies.every(e=>e.independentSuccesses===0));
});
test('old sessions without episodes safely record supported outcomes but no transfer',()=>{
 const before={id:'old',topic:{id:'fractions'},task:task('support'),phase:'help',assistance:{numberLabels:true}};
 let m=updateExperience(null,before,{...before,phase:'practice'},{action:'answer',eventId:'old-1',assessment:{outcome:'correct'}});
 m=updateExperience(m,{...before,phase:'practice'},before,{action:'answer',eventId:'old-2',assessment:{outcome:'correct'}});
 const e=experienceFor(m,'fractions','number-line').strategies[0];assert.equal(e.strategyId,'count-along');assert.equal(e.supportedSuccesses,1);assert.equal(e.independentSuccesses,0);
});
test('memory bounds entries, replay keys and episode links and discards raw text',()=>{
 let m={uid:'private pupil',answer:'private answer',entries:[]};
 for(let i=0;i<170;i++){
  const after={id:`session-${i}`,topic:{id:`topic-${i}`},task:task('support'),phase:'help',assistance:{strategyId:'focus-one'},helpEpisodes:[{id:`episode-${i}`}],question:'private question',modelKey:'private model'};
  m=updateExperience(m,null,after,{action:'help-generated',eventId:`event-${i}`});
 }
 assert.equal(m.entries.length,64);assert.equal(m.events.length,128);assert.equal(m.episodeLinks.length,128);
 const text=JSON.stringify([m,experienceFor(m,'topic-169','number-line')]);
 for(const raw of ['private pupil','private answer','private prompt','private question','private explanation','private model','modelKey','uid'])assert.equal(text.includes(raw),false);
});
test('insufficient episode evidence keeps advice exploratory even with multiple probes',()=>{
 const f=fixture();f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
 f.step('answer',{phase:'practice',task:task('fresh')},{outcome:'correct'});
 f.step('answer',{task:task('fresh-2')},{outcome:'correct'});f.step('answer',{}, {outcome:'correct'});
 assert.equal(f.summary().strategies[0].independentSuccesses,2);assert.equal(f.summary().strategies[0].advice,'explore');
});

test('private memory carries descriptive evidence across three separate sessions',()=>{
 let memory=null;
 for(let i=0;i<3;i++){
  const f=fixture('smaller-step','fractions',`cross-session-${i}`,memory);
  f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
  f.step('answer',{phase:'practice',task:task('fresh')},{outcome:'correct'});
  f.step('answer',{}, {outcome:'correct'});memory=f.memory;
 }
 const result=experienceFor(memory,'fractions','number-line');
 const e=result.strategies[0];assert.equal(e.episodes,3);assert.equal(e.independentSuccesses,3);assert.equal(e.transferEpisodes,3);assert.equal(e.advice,'consider-again');
 assert.equal(e.confidence,'limited-descriptive');assert.equal(result.causalEffect,'unproven');
});
test('missing actual-help annotation leaves strategy attribution unknown',()=>{
 const before={id:'old',topic:{id:'fractions'},task:task('support'),phase:'help'};
 const m=updateExperience(null,before,before,{action:'answer',eventId:'unknown',assessment:{outcome:'correct'}});
 assert.deepEqual(experienceFor(m,'fractions','number-line').strategies,[]);
});

test('tool-free and different-tool independent probes credit the original help tool only',()=>{
 for(const tool of [null,'balance']){
  const f=fixture();
  f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
  const fresh={id:'tool-free-probe',prompt:'new independent prompt',answer:'new independent answer',...(tool?{workshop:{tool}}:{})};
  f.step('answer',{phase:'practice',task:fresh},{outcome:'correct'});
  f.step('answer',{}, {outcome:'correct'});
  const e=f.summary().strategies[0];assert.equal(e.independentSuccesses,1);assert.equal(e.tool,'number-line');
  assert.deepEqual(experienceFor(f.memory,'fractions',tool||'none').strategies,[]);
 }
});
test('ordinary text help is grouped under none and goal-only retrieval stays exact',()=>{
 const before={id:'text-session',topic:{id:'fractions'},phase:'help',task:{id:'text-task'},assistance:{strategyId:'contrast'}};
 const m=updateExperience(null,before,before,{action:'answer',eventId:'text-event',assessment:{outcome:'incorrect'}});
 assert.equal(experienceFor(m,'fractions','none').strategies[0].supportedErrors,1);
 assert.equal(experienceFor(m,'fractions',null).strategies.length,1);
 assert.equal(experienceFor(m,'fractions').strategies.length,1);
 assert.deepEqual(experienceFor(m,'another-topic',null).strategies,[]);
 assert.equal(experienceFor(m,'fractions',null).policy.forceTool,false);
});
test('a changed goal cannot inherit a prior episodes transfer outcome',()=>{
 const f=fixture();
 f.step('answer',{phase:'completion',task:task('original')},{outcome:'correct'});
 f.step('answer',{phase:'practice',task:task('fresh'),topic:{id:'another-topic'}},{outcome:'correct'});
 f.step('answer',{}, {outcome:'correct'});
 assert.equal(f.summary().strategies[0].independentSuccesses,0);
 assert.deepEqual(experienceFor(f.memory,'another-topic',null).strategies,[]);
});
