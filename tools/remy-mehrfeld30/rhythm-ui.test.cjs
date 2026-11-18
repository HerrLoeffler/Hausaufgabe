'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
const {JSDOM}=createRequire(path.join(__dirname,'../ui/package.json'))('jsdom');
const {buildRhythm,publicRhythm,scoreRhythm,makeAudio,rhythmExamples}=require('./rhythm.cjs');
test('rhythm UI loads actual WAV, inserts note and rest symbols, and retries audio errors',async()=>{
  const dom=new JSDOM('<main></main>');
  try{
    const {document}=dom.window,host=document.querySelector('main');
    const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
    const note=new Function('document',read('recipe-view.mjs').replaceAll('export function','function')+'\nreturn note;')(document);
    const mount=new Function('document','note','cancelAnimationFrame',
      read('rhythm-view.mjs').replace(/^import .*;$/gm,'').replace('export function','function')+'\nreturn mountRhythm;')(document,note,()=>{});
    const q=buildRhythm(rhythmExamples[2]);let response,calls=0;
    const controller=mount(host,publicRhythm(q),async()=>{
      if(++calls===1)throw Error('offline');
      return makeAudio(q);
    },answer=>{response=answer;});
    await new Promise(resolve=>setImmediate(resolve));
    assert.match(host.textContent,/konnte nicht geladen/);
    host.querySelector('button').click();
    await new Promise(resolve=>setImmediate(resolve));
    const media=host.querySelector('audio');
    assert.equal(media.hidden,false);
    assert.match(media.src,/^data:audio\/wav;base64,UklGR/);
    assert.equal(host.querySelectorAll('.rhythm-staff svg').length,0);
    host.querySelector('[aria-label="Lücke 1: Viertelpause einsetzen"]').click();
    host.querySelector('[aria-label="Lücke 2: Achtelnote einsetzen"]').click();
    assert.equal(host.querySelectorAll('.rhythm-gap svg').length,2);
    assert.equal(scoreRhythm(q,response),1);
    controller.destroy();
    assert.equal(media.getAttribute('src'),null);
  }finally{dom.window.close();}
});
