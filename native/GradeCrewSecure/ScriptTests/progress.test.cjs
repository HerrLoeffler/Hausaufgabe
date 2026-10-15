const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'../Resources/Exam/question-progress.js');
let progress;
if(fs.existsSync(file)) progress=require(file);
else {
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(__dirname,'../Resources/Exam/question-renderer.js'),'utf8'),ctx);
 progress={questionCompletion:(q,a)=>ctx.answerIsComplete(q,a)?'complete':'open'};
}
const q=progress.questionCompletion;
test('initial ordering is open until explicitly changed or confirmed',()=>{
 const order={id:'o',type:'ordering',items:[{id:'a'},{id:'b'}]};
 assert.equal(q(order,['a','b'],new Set()),'open');
 assert.equal(q(order,['a','b'],new Set(['o'])),'complete');
 assert.equal(q(order,['a','a'],new Set(['o'])),'started');
});
test('zero and false are answers while whitespace and deselection are open',()=>{
 for(const [type,a,want] of [['number',0,'complete'],['truefalse','false','complete'],['text','  ','open'],['multi',[],'open'],['single','a','complete'],['dropdown','','open']]) assert.equal(q({id:'q',type},a,new Set()),want,type);
});
test('partial gap matching and grouping remain unfinished',()=>{
 assert.equal(q({id:'g',type:'gapfill',segments:[{type:'gap'},{type:'gap'}]},['one',''],new Set()),'started');
 assert.equal(q({id:'m',type:'matching',leftItems:[{id:'a'},{id:'b'}]},{a:'x'},new Set()),'started');
 assert.equal(q({id:'m',type:'matching',leftItems:[{id:'a'},{id:'b'}]},{a:'x',wrong:'y'},new Set()),'started');
 assert.equal(q({id:'g',type:'grouping',items:[{id:'a'}]},{a:'group'},new Set()),'complete');
 assert.equal(q({id:'w',type:'markwords',markGroups:[{name:'Nomen',color:'blue'}]},{'1':'blue'},new Set()),'complete');
});
test('summary uses one completion rule and includes partial tasks in open count',()=>{
 assert.equal(typeof progress.summarizeQuestions,'function');
 assert.deepEqual(progress.summarizeQuestions([{id:'a',type:'text'},{id:'b',type:'gapfill',segments:[{type:'gap'},{type:'gap'}]},{id:'c',type:'multi'}],{a:'yes',b:['one',''],c:[]},new Set()),{total:3,completed:1,started:1,open:2,completedQuestionIds:['a']});
});
