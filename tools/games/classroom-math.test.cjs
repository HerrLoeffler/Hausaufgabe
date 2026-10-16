const test = require('node:test');
const assert = require('node:assert/strict');
let math;
try { math = require('../../lab/fast-quiz-functions/classroom-math.js'); } catch {}
test('paper tasks are planned: 20 => 13H/7P, 5 => 3H/2P, mental always H', () => {
  assert.ok(math, 'classroom math must exist');
  for (const [n,p] of [[20,7],[5,2],[1,0],[2,1],[10,4]]) {
    const plan = math.planKinds('paper',n,321);
    assert.equal(plan.length,n); plan.forEach((v,i)=>assert.equal(plan.slice(0,i+1).filter(x=>x==='P').length,Math.floor((35*(i+1)+50)/100))); assert.equal(plan.filter(x=>x==='P').length,p);
    assert.deepEqual(plan,math.planKinds('paper',n,321));
    assert.equal(math.planKinds('mental',n,321).every(x=>x==='H'),true);
  }
});
test('all four mental levels use bounded, explained structures with exactly four unique options', () => {
  assert.ok(math);
  for (const category of ['mental','paper']) for (const level of ['n1','n2','n3','n4']) {
    const config={category,level};
    for(let i=0;i<100;i++) {
      const q=math.generateTask(config,89,i);
      assert.deepEqual(q,math.generateTask(config,89,i));
      assert.equal(new Set(q.options).size,4); assert.equal(q.options.filter(x=>x===q.correct).length,1);
      assert.ok(q.hint.length>10); assert.ok(q.explanation.length>10);
      assert.equal(q.material, q.kind==='P'?'Stift und Papier':'Im Kopf');
      assert.equal(q.calculatorAllowed,false);
      if(category==='mental') {assert.equal(q.kind,'H'); assert.ok(q.strategy);}
    }
  }
});
test('balanced roster 24/25 and group normalized energy uses frozen denominators and shared ranks', () => {
  assert.ok(math);
  for(const [n,sizes] of [[24,[6,6,6,6]],[25,[7,6,6,6]]]) {
    const teams=math.balancedTeams(Array.from({length:n},(_,i)=>'p'+i),15);
    assert.deepEqual([0,1,2,3].map(t=>Object.values(teams).filter(v=>v===t).length),sizes);
  }
  const members=Object.fromEntries(Array.from({length:13},(_,i)=>['p'+i,{teamId:i<7?0:1,score:60}]));
  const roster=Object.fromEntries(Object.keys(members).map(id=>[id,members[id].teamId]));
  const rows=math.standings(members,roster);
  assert.equal(rows[0].rawScore,420);assert.equal(rows[1].rawScore,360);
  assert.equal(rows[0].energy,600);assert.equal(rows[1].energy,600);assert.equal(rows[0].rank,1);assert.equal(rows[1].rank,1);
  delete members.p0;
  assert.equal(math.standings(members,roster)[0].size,7);
  assert.equal(math.targetFor(1),500);assert.equal(math.targetFor(2),600);assert.equal(math.targetFor(3),600);assert.equal(math.targetFor(4),700);
});

test('five generated scored slots preserve 3H/2P and numeric answers accept German comma',()=>{ assert.ok(math);for(let seed=0;seed<100;seed++){const qs=Array.from({length:5},(_,i)=>math.generateTask({category:'paper',level:'n2',slotCount:5},seed,i));assert.equal(qs.filter(x=>x.kind==='P').length,2);}assert.equal(math.normalizeAnswer('12,50'),'12,5');assert.equal(math.normalizeAnswer(' 12.50 '),'12,5');assert.equal(math.normalizeAnswer('Infinity'),null);assert.equal(math.normalizeAnswer('1,2,3'),null);});
test('scored five-slot packs never score the same canonical math task twice',()=>{
 assert.equal(typeof math.generateScoredTask,'function');
 for(const category of ['mental','paper'])for(const level of ['n1','n2','n3','n4'])for(let seed=0;seed<100;seed++){
  const qs=Array.from({length:5},(_,i)=>math.generateScoredTask({category,level,campaignRound:1},seed,i));
  assert.equal(new Set(qs.map(q=>q.fingerprint)).size,5);
  if(category==='paper')assert.equal(qs.filter(q=>q.kind==='P').length,2);
 }
});
test('paper decimal procedure counts the places actually displayed, including integer operands',()=>{
 for(let seed=0;seed<100;seed++){
  const q=math.generateTask({category:'paper',level:'n4',slotCount:5},seed,1);
  const operands=q.prompt.replace(' = ?','').split(' × ');
  assert.equal(operands.length,2);assert.equal(operands.reduce((sum,x)=>sum+(x.split(',')[1]?.length||0),0),2);
 }
 const a=math.generateScoredTask({category:'mental',level:'n4',campaignRound:1},3,0),b=math.generateScoredTask({category:'mental',level:'n4',campaignRound:1},3,4);
 assert.notEqual(a.fingerprint,b.fingerprint);
});
