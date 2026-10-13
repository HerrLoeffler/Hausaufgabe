const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
function math() {
  const context = vm.createContext({window:{}, Intl, document:{querySelector:()=>null, getElementById:()=>null}});
  for(const file of ['math-engine-v4.js','rounding-plus.js']) vm.runInContext(fs.readFileSync(path.join(root,'lab/fast-quiz',file),'utf8'),context);
  return context.window.FastQuizMath;
}
test('binomial rounds cover all three formulas with exactly one algebraically correct choice', () => {
  const engine = math().createEngine({seed:1234, operations:['binomial'], domains:['natural'], level:'n1'});
  const forms = new Set();
  const value = (expression,x) => Function('x', `return ${expression.replaceAll('²','**2').replaceAll('−','-').replaceAll('·','*').replace(/(\d)x/g,'$1*x')}`)(x);
  for(let i=0;i<90;i++) {
    const q = engine.next();
    assert.equal(q.operation,'binomial');
    forms.add(q.id.split(':')[1]);
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.equal(q.options.filter(o=>[-2,0,1,3].every(x=>value(o,x)===value(q.correct,x))).length,1);
    const prompt = q.prompt.replace(' = ?','').replace(/\)\(/g,')*(');
    for(const x of [-2,0,1,3]) assert.ok(value(prompt,x)===value(q.correct,x));
    assert.match(q.explanation,/a²/);
  }
  assert.equal(forms.size,3);
});
test('server retains binomial operation for teacher and student room config', () => {
  const src=fs.readFileSync(path.join(root,'lab/fast-quiz-functions/index.js'),'utf8');
  const context=vm.createContext({});
  vm.runInContext(src.slice(src.indexOf('const VALID_OPS'),src.indexOf('function hashToken')) + src.slice(src.indexOf('function cleanList'),src.indexOf('function officialHighscoreConfig')) + ';globalThis.cleanConfig=cleanConfig;',context);
  assert.deepEqual(Array.from(context.cleanConfig({operations:['binomial']}).operations),['binomial']);
});
test('same seed produces same binomial tasks across student clients', () => {
  const config={seed:987,operations:['binomial'],domains:['natural'],level:'n1'};
  const a=math().createEngine(config),b=math().createEngine(config);
  for(let i=0;i<20;i++) assert.equal(JSON.stringify(a.next()),JSON.stringify(b.next()));
});
