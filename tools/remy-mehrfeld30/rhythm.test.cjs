'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {buildRhythm,publicRhythm,scoreRhythm,makeAudio,rhythmExamples}=require('./rhythm.cjs');
test('a rhythm is one complete bar and both note value and rest type count',()=>{
  const q=buildRhythm(rhythmExamples[0]);
  assert.equal(scoreRhythm(q,q.solution),q.points);
  assert.equal(scoreRhythm(q,{...q.solution,g0:'n2'}),0);
  assert.equal(scoreRhythm(q,{}),0);
  assert.throws(()=>buildRhythm({...rhythmExamples[0],events:['n2','r2','n2']}));
  assert.throws(()=>buildRhythm({...rhythmExamples[0],gaps:[-1]}));
});
test('hard listening hides note values and the cue schedule does not disclose durations',()=>{
  const q=buildRhythm(rhythmExamples[2]);
  const p=publicRhythm(q);
  assert.ok(p.slots.every(s=>s.symbol===undefined));
  assert.equal(p.slots.filter(s=>s.gap).length,2);
  assert.ok(!Object.hasOwn(p,'solution'));
  const a=makeAudio(q);
  assert.deepEqual(Object.keys(a).sort(),['audioBase64','cues','duration']);
  assert.ok(a.cues.every(c=>Object.keys(c).sort().join(',')==='at,id'));
});
test('WAV contains an audible tone and silence for the following pause without a backing pulse',()=>{
  const q=buildRhythm({...rhythmExamples[2],bpm:60});
  const {audioBase64,duration}=makeAudio(q);
  const wave=Buffer.from(audioBase64,'base64');
  assert.equal(wave.subarray(0,4).toString(),'RIFF');
  assert.equal(wave.readUInt32LE(24),8000);
  assert.equal(wave.readUInt32LE(40),wave.length-44);
  assert.equal(duration,8);
  const amplitude=(start,end)=>Math.max(...wave.subarray(44+8000*start,44+8000*end).map(x=>Math.abs(x-128)));
  assert.ok(amplitude(4.05,4.2)>20);
  assert.equal(amplitude(5.05,5.3),0);
});
test('neighboring rests cannot be mistaken for separately audible gaps',()=>{
  assert.throws(()=>buildRhythm({...rhythmExamples[2],events:['n2','r1','r1','n2','n2'],gaps:[1,3]}),/Pausen/);
});
test('odd WAV data length is padded without changing the sample count',()=>{
  const q=buildRhythm(rhythmExamples[2]);
  const wav=Buffer.from(makeAudio(q).audioBase64,'base64');
  const size=wav.readUInt32LE(40);
  assert.equal(size%2,1);
  assert.equal(wav.length,44+size+1);
  assert.equal(wav.readUInt32LE(4),wav.length-8);
  assert.equal(wav.at(-1),0);
});
test('the feedback-adjusted tone is softer in pitch with the same timing and expected rest',()=>{
  const q=buildRhythm({...rhythmExamples[2],bpm:60});
  const {audioBase64,cues}=makeAudio(q);
  const wave=Buffer.from(audioBase64,'base64');
  const start=44+Math.round(4.15*8000),end=start+800;
  let cycles=0;
  for(let i=start+1;i<end;i++)if(wave[i-1]<128&&wave[i]>=128)cycles++;
  assert.ok(cycles>=25&&cycles<=28, String(cycles));
  assert.deepEqual(cues,[{id:'g0',at:5},{id:'g1',at:6.5}]);
  assert.deepEqual(q.solution,{g0:'r2',g1:'n1'});
});
