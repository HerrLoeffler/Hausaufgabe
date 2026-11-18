const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./renderer-fixture.cjs');
test('numbers follow paper order and visiting never creates an answer',()=>{
 const {dom,w,messages}=setup({t:'Bleibt erhalten'});
 const buttons=[...w.document.querySelectorAll('.secureQuestionNumber')];
 assert.equal(buttons.length,11);
 const revision=messages.at(-2).revision, count=messages.length;
 buttons[4].click();
 assert.equal(buttons[4].getAttribute('aria-current'),'step');
 assert.equal(w.document.querySelector('textarea').value,'Bleibt erhalten');
 assert.equal(messages.length,count);assert.equal(messages.at(-2).revision,revision);
 assert.equal(w.document.querySelector('#secureCurrentQuestion').textContent,'Aufgabe 5 von 11');
 dom.window.close();
});
test('completion and current styling coexist and clearing restores open state',()=>{
 const {dom,w}=setup();
 const input=w.document.querySelector('textarea'),button=w.document.querySelector('.secureQuestionNumber[data-qid="t"]');
 assert.ok(button,'question selector is present');button.click();
 input.value='Antwort';input.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.ok(button.classList.contains('complete'));assert.equal(button.getAttribute('aria-current'),'step');
 assert.match(button.getAttribute('aria-label'),/bearbeitet/);
 input.value='';input.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(button.classList.contains('complete'),false);assert.match(button.getAttribute('aria-label'),/offen/);
 dom.window.close();
});
test('one and one hundred questions keep bounds overview and freeze coherent',()=>{
 for(const count of [1,15,30,100]) {
  const {dom,w}=setup({},Array.from({length:count},(_,i)=>({id:'q'+i,type:'text',text:'Frage '+i})));
  const buttons=[...w.document.querySelectorAll('.secureQuestionNumber')];assert.equal(buttons.length,count);
  assert.equal(w.document.querySelector('#securePrevious').disabled,true);
  buttons.at(-1).click();assert.equal(w.document.querySelector('#secureNext').disabled,true);
  assert.match(w.document.querySelector('#secureCurrentQuestion').textContent,new RegExp('Aufgabe '+count+' von '+count));
  const toggle=w.document.querySelector('#secureOverviewToggle');toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'true');
  w.gcFreezeAnswers();assert.equal(buttons.every(b=>b.disabled),true);
  dom.window.close();
 }
});
test('unknown targets and destroyed navigation cannot change the current task',()=>{
 const {dom,w}=setup();const node=w.document.querySelector('#secureNavigation'),first=node.__gcQuestionNavigation;
 assert.equal(first.select('foreign',{focus:true}),false);
 const second=w.createQuestionNavigation({paper:[{id:'s',type:'single'},{id:'t',type:'text'}],root:w.document.querySelector('#secureQuestions'),navRoot:node,reducedMotion:true});
 assert.equal(first.select('t',{focus:true}),false);assert.equal(second.select('t',{focus:true}),true);
 assert.equal(node.querySelectorAll('.secureQuestionNumber').length,2);
 second.freeze();assert.equal(second.select('s'),false);
 dom.window.close();
});

test('large text compacts navigation in landscape as well as narrow widths',()=>{
 const {dom,w}=setup();const nav=w.document.querySelector('#secureNavigation');
 Object.defineProperty(nav,'clientWidth',{value:1100});
 Object.defineProperty(w,'innerHeight',{value:744});
 w.document.querySelector('#secureQuestionNumbers').style.fontSize='35px';
 w.dispatchEvent(new w.Event('resize'));
 assert.equal(nav.classList.contains('compactNavigation'),true);
 dom.window.close();
});
test('current accessible number follows manually scrolled task',async()=>{
 const {dom,w}=setup();const sections=[...w.document.querySelectorAll('.secureQuestion')];
 sections.forEach((s,i)=>{s.getBoundingClientRect=()=>({top:(i-3)*200})});
 w.document.querySelector('#secureNavigation').getBoundingClientRect=()=>({bottom:0,height:0});
 w.dispatchEvent(new w.Event('scroll'));await new Promise(r=>setTimeout(r,30));
 assert.equal(w.document.querySelector('#secureCurrentQuestion').getAttribute('aria-label'),'Aufgabe 4 von 11');dom.window.close();
});
test('numbered task jumps are immediate rather than animating through many pages',()=>{
 const {dom,w}=setup({},Array.from({length:30},(_,i)=>({id:'q'+i,type:'text',text:'Aufgabe '+i})));
 let target;
 w.scrollTo=options=>{target=options};
 w.document.querySelectorAll('.secureQuestionNumber')[29].click();
 assert.equal(target.behavior,'auto');dom.window.close();
});

test('sidebar follows visible viewport without recreating answers and uses no top navigation offset',()=>{
 const {dom,w,messages}=setup({t:'Unverändert'});
 const nav=w.document.querySelector('#secureNavigation'),input=w.document.querySelector('textarea');
 Object.defineProperty(w,'innerWidth',{value:1280,configurable:true});
 Object.defineProperty(w,'innerHeight',{value:750,configurable:true});
 nav.getBoundingClientRect=()=>({height:400,bottom:400});
 w.dispatchEvent(new w.Event('resize'));
 assert.equal(w.document.documentElement.classList.contains('secureSidebar'),true);
 assert.equal(w.document.documentElement.style.getPropertyValue('--secure-nav-height'),'0px');
 assert.equal(messages.filter(m=>m.type==='layout').at(-1).sidebar,true);
 input.focus();Object.defineProperty(w,'innerHeight',{value:350,configurable:true});w.dispatchEvent(new w.Event('resize'));
 assert.equal(w.document.documentElement.classList.contains('secureSidebar'),false);
 assert.equal(w.document.querySelector('textarea'),input);assert.equal(input.value,'Unverändert');assert.equal(w.document.activeElement,input);
 dom.window.close();
});
test('sidebar submission requests native confirmation only and freeze disables it',()=>{
 const {dom,w,messages}=setup();const submit=w.document.querySelector('#secureSidebarSubmit');
 assert.ok(submit);assert.equal(submit.disabled,true);
 w.gcSetCanSubmit(true);submit.click();assert.equal(messages.at(-1).type,'requestSubmit');
 assert.equal(messages.some(m=>m.type==='submit'),false);
 w.gcFreezeAnswers();w.gcSetCanSubmit(true);assert.equal(submit.disabled,true);
 dom.window.close();
});
test('Escape closes compact overview and returns focus to its toggle',()=>{
 const {dom,w}=setup();Object.defineProperty(w,'innerWidth',{value:390});w.dispatchEvent(new w.Event('resize'));const toggle=w.document.querySelector('#secureOverviewToggle');toggle.click();
 w.document.querySelector('.secureQuestionNumber').focus();w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
 assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(w.document.activeElement,toggle);dom.window.close();
});
test('right overview keeps the next current row visible with one hundred tasks',()=>{
 const {dom,w}=setup({},Array.from({length:100},(_,i)=>({id:'q'+i,type:'text',text:'Frage '+i})));
 Object.defineProperty(w,'innerWidth',{value:1280});Object.defineProperty(w,'innerHeight',{value:750});w.dispatchEvent(new w.Event('resize'));
 const grid=w.document.querySelector('#secureQuestionNumbers'),button=grid.children[20];
 Object.defineProperties(grid,{offsetTop:{value:120},clientHeight:{value:180}});
 Object.defineProperties(button,{offsetTop:{value:200},offsetHeight:{value:48}});
 let scroll;grid.scrollTo=value=>{scroll=value};button.click();
 assert.equal(scroll?.top,134);assert.equal(button.getAttribute('aria-current'),'step');dom.window.close();
});

test('the overview never narrows the original task area on 1024-point iPads',()=>{
 const {dom,w}=setup();Object.defineProperty(w,'innerHeight',{value:800,configurable:true});
 for(const [width,wide] of [[1024,false],[1179,false],[1180,true],[1366,true]]) {
  Object.defineProperty(w,'innerWidth',{value:width,configurable:true});w.dispatchEvent(new w.Event('resize'));
  assert.equal(w.document.documentElement.classList.contains('secureSidebar'),wide,'width '+width);
 }
 dom.window.close();
});
