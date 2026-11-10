'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
const {JSDOM}=createRequire(path.join(__dirname,'../ui/package.json'))('jsdom');
const {buildPitch,publicPitch,scorePitch,pitchExamples}=require('./pitch.cjs');
test('the staff places note heads on the chosen line or space and updates one tone at a time',()=>{
  const dom=new JSDOM('<main></main>');
  try{
    const {document}=dom.window,host=document.querySelector('main');
    const source=fs.readFileSync(path.join(__dirname,'pitch-view.mjs'),'utf8').replace('export function','function');
    const mount=new Function('document',source+'\nreturn mountPitch;')(document);
    for(const raw of pitchExamples){
      host.replaceChildren();
      const q=buildPitch(raw);let answer={};
      mount(host,publicPitch(q),next=>{answer=next;});
      const columns=host.querySelectorAll('.pitch-column');
      assert.equal(columns.length,raw.notes.length);
      assert.equal(host.querySelectorAll('input').length,9*raw.notes.length);
      const positions=Object.values(q.solution);
      for(const [i,position] of positions.entries()){
        const input=columns[i].querySelector('input[value="'+position+'"]');
        input.closest('label').click();
        assert.ok(input.checked);
        assert.equal(input.closest('label').classList.contains('pitch-line'),position%2===0);
      }
      assert.equal(scorePitch(q,answer),q.points);
      columns[0].querySelector('input[value="8"]').click();
      assert.equal(scorePitch(q,answer),q.points-.5);
      assert.equal(host.querySelectorAll('input:checked').length,raw.notes.length);
    }
  }finally{dom.window.close();}
});
