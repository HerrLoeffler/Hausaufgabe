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

test('coach candidates clamp only across their edge and never over the actual create button',()=>{
 assert.equal(typeof module.computeCrewCoachPlacement,'function');
 const viewport={left:0,top:0,width:1280,height:720};
 const target={left:1079,right:1249,top:589.25,bottom:637.25,width:170,height:48};
 const p=module.computeCrewCoachPlacement({viewport,target,width:360,height:221.921875});
 assert.ok(p);assert.ok(p.left+360<=1268&&p.top+221.921875<=708);
 assert.ok(p.left+360<=target.left-14||p.left>=target.right+14||p.top+221.921875<=target.top-14||p.top>=target.bottom+14);
});
test('no room returns a flow requirement instead of clamping a coach over a large target',()=>{
 assert.equal(typeof module.computeCrewCoachPlacement,'function');
 const p=module.computeCrewCoachPlacement({viewport:{left:30,top:50,width:320,height:280},target:{left:42,right:338,top:62,bottom:318,width:296,height:256},width:296,height:140});
 assert.equal(p,null);
});

test('a new warning coach is placed before any animation frame can run', () => {
 const dom=new JSDOM('<body class="gcRealTourActive"><div class="gcTourTarget"></div><aside class="gcRealCoach"><button>Hinweis öffnen</button></aside></body>',{pretendToBeVisual:true});
 const w=dom.window,coach=w.document.querySelector('aside'),target=w.document.querySelector('.gcTourTarget');
 const previous=Object.fromEntries(['window','document','isCompactGuideViewport','MutationObserver'].map(k=>[k,globalThis[k]]));
 const observers=[];
 class TrackedObserver extends w.MutationObserver {constructor(callback){super(callback);observers.push(this);}}
 Object.assign(globalThis,{window:w,document:w.document,isCompactGuideViewport,MutationObserver:TrackedObserver});
 const frames=[];w.requestAnimationFrame=fn=>{frames.push(fn);return frames.length;};
 Object.defineProperties(w,{innerWidth:{value:1366},innerHeight:{value:768}});
 target.getClientRects=()=>[target.getBoundingClientRect()];
 target.getBoundingClientRect=()=>({left:21,top:180,right:185,bottom:500,width:164,height:320});
 coach.getBoundingClientRect=()=>({left:21,top:8211,right:381,bottom:8508,width:360,height:297});
 let refreshes=0;w.document.addEventListener('gradecrew:tour-anchor-refresh',()=>refreshes++);
 try {
  module.installCrewTourResponsiveLayout();
  assert.equal(coach.style.top,'','the scheduled frame has deliberately not run');
  w.document.dispatchEvent(new w.CustomEvent('gradecrew:tour-step',{detail:{stage:'second-warning'}}));
  assert.equal(coach.dataset.gcPlacement,'floating','a new real step must synchronously place its coach');
  const top=Number.parseFloat(coach.style.top),left=Number.parseFloat(coach.style.left);
  assert.ok(top>=12&&top+297<=756,'the next control cannot inherit the body-end position');
  assert.ok(left>=12&&left+360<=1354);
  assert.ok(frames.length>0,'later responsive settling remains scheduled');
  assert.equal(refreshes,0,'initial placement must not re-enter unfinished publication setup');
  module.layoutCrewCoach();
  assert.equal(refreshes,1,'ordinary layout still refreshes rerendered anchors');
 } finally {
  observers.forEach(observer=>observer.disconnect());
  dom.window.close();
  for(const [k,v] of Object.entries(previous))v===undefined?delete globalThis[k]:globalThis[k]=v;
 }
});
