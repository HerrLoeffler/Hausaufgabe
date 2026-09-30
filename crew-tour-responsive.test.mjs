import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from './tools/ui/node_modules/jsdom/lib/api.js';

const source = fs.readFileSync('crew-tour-responsive.js','utf8').replace(/^import[^\n]+\n/, '');
const plans = fs.readFileSync('first-guide-responsive.js','utf8');
const {computeAdaptiveGuidePlan,isCompactGuideViewport} = await import(`data:text/javascript;base64,${Buffer.from(plans).toString('base64')}`);
const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('inline gc27 task/help and review coaches survive compact and keyboard layouts without forced scroll', () => {
  const dom = new JSDOM('<body class="gcRealTourActive"><aside class="gcRealCoach"></aside><section class="gcTourTarget"></section></body>');
  const w=dom.window; let scrolls=0;
  const previous = Object.fromEntries(['window','document','computeAdaptiveGuidePlan','isCompactGuideViewport'].map(k=>[k,globalThis[k]]));
  Object.assign(globalThis,{window:w,document:w.document,computeAdaptiveGuidePlan,isCompactGuideViewport});
  w.scrollBy=()=>scrolls++;
  const coach=w.document.querySelector('aside');
  try {
    for (const className of ['gcCoachContext','gc25InlineReviewCoach','gcCoachInlineStart']) {
      coach.className=`gcRealCoach gcResponsiveCoach ${className}`;
      coach.style.maxHeight='120px';coach.style.top='5px';
      for(const height of [844,320]) {
        Object.defineProperty(w,'visualViewport',{configurable:true,value:{width:390,height,offsetLeft:0,offsetTop:30}});
        module.layoutCrewCoach();
        assert.equal(coach.classList.contains('gcResponsiveCoach'),false);
        assert.equal(coach.style.maxHeight,'');
        assert.equal(coach.style.top,'');
        assert.equal(coach.dataset.gcPlacement,undefined);
      }
    }
    assert.equal(scrolls,0);
  } finally {
    for(const [k,v] of Object.entries(previous)) v===undefined?delete globalThis[k]:globalThis[k]=v;
    dom.window.close();
  }
});
