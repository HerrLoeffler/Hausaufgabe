'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {core,parseVisualTask}=require('../../functions/lib/visual-task');
const {dreisatzSettings}=require('../../functions/lib/visual/dreisatz-builder');
const {present,score}=require('./review.cjs');
const {sameQuestion}=require('../../functions/lib/validation');
const dest=path.resolve('./docs/evidence/remy-mehrfeld30-20261109');
const results=[],physicsQuestions=[];
for(const group of ['direkt','umgekehrt','physik','physik-uebergaenge','physik-beobachtungen','gegenprobe']){
  const file=path.join(dest,group+'-tasks.private.json');
  if(!fs.existsSync(file))continue;
  const {quizId,questions}=JSON.parse(fs.readFileSync(file));
  for(const [index,q] of questions.entries()){
    const safe=present(quizId,group,q);
    const row={group,position:index+1,type:q.type,points:q.points,version:safe.version,flags:[]};
    let solution;
    if(q.type==='visual'){
      const task=parseVisualTask(q.visualTask,{points:q.points});
      row.layout=task.spec.layout||task.format;
      solution=core.solutionResponse(task);
      assert.ok(!Object.hasOwn(safe.visual,'solution'));
      if(task.spec.layout==='dreisatz'){
        const settings=dreisatzSettings(task);
        const nums=settings.values.map(x=>Number(String(x).replace(',','.')));
        const values=[0,2,4].map(i=>group==='umgekehrt'?nums[i]*nums[i+1]:nums[i+1]/nums[i]);
        if(values.some(x=>!Number.isFinite(x)||Math.abs(x-values[0])>1e-8*Math.max(1,Math.abs(values[0]))))row.flags.push('relation');
        if(settings.modes.some(x=>x==='given')&&/vier Rechenpfeile/i.test(q.text))row.flags.push('auftrag-nennt-vorgegebene-pfeile');
        if(/0[,.]5 Punkte/i.test(q.text)&&Math.abs(task.solution.cells.length*.5-q.points)>1e-9)row.flags.push('halbpunkte');
      }else if(group==='direkt'||group==='umgekehrt')row.flags.push('kein-dreisatz');
      if(group.startsWith('physik')){
        if(task.spec.layout==='dreisatz')row.flags.push('dreisatz-in-physik');
        if(physicsQuestions.some(prior=>sameQuestion(prior,q)))row.flags.push('physik-wiederholung');
        physicsQuestions.push(q);
      }
    }else{
      assert.equal(safe.options.length,q.options.length);
      assert.ok(safe.options.every(o=>typeof o==='string'));
      solution=q.options.findIndex(o=>o.correct);
    }
    assert.equal(score(q,solution),q.points);
    assert.equal(score(q,null),0);
    results.push(row);
  }
}
fs.writeFileSync(path.join(dest,'verification.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({count:results.length,flagged:results.filter(r=>r.flags.length).length,flags:results.flatMap(r=>r.flags).reduce((counts,f)=>(counts[f]=(counts[f]||0)+1,counts),{})}));
