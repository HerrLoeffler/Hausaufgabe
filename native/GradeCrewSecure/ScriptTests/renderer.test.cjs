const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('../../../tools/ui/node_modules/jsdom');
const root = path.join(__dirname,'../Resources/Exam');
const fixtures = [
  {id:'s',type:'single',options:[{id:'a',text:'A'},{id:'b',text:'B'}]},
  {id:'m',type:'multi',options:[{id:'a',text:'A'},{id:'b',text:'B'}]},
  {id:'d',type:'dropdown',options:[{id:'a',text:'A'}]},
  {id:'tf',type:'truefalse'}, {id:'t',type:'text'}, {id:'n',type:'number'},
  {id:'g',type:'gapfill',segments:[{type:'text',text:'Das ist '},{type:'gap',id:'g1'}]},
  {id:'match',type:'matching',leftItems:[{id:'l',text:'Links'}],rightItems:[{id:'r',text:'Rechts'}]},
  {id:'order',type:'ordering',items:[{id:'x',text:'Eins'},{id:'y',text:'Zwei'}]},
  {id:'group',type:'grouping',items:[{id:'x',text:'Wort'}],groups:[{id:'gg',name:'Gruppe'}]},
  {id:'mark',type:'markwords',passage:'Ein kurzer Satz.'}
].map(q=>({...q,text:'Aufgabe '+q.id,points:1}));
function setup(answers={}, paper=fixtures) {
  const dom = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only',url:'https://local.invalid/'});
  const w = dom.window, messages=[];
  w.CSS = {escape:s=>String(s)};
  w.__GC_EXAM__={paper,quiz:{contentLocale:'de-DE'},answers,revision:4};
  w.webkit={messageHandlers:{gradecrewSecure:{postMessage:m=>messages.push(m)}}};
  w.eval(fs.readFileSync(path.join(root,'question-renderer.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'native-exam.js'),'utf8'));
  return {dom,w,messages};
}
test('all eleven types render and restore their answer shapes',()=>{
  const answers={s:'b',m:['a','b'],d:'a',tf:'false',t:'Antwort',n:'12.5',g:['Wort'],match:{l:'r'},order:['y','x'],group:{x:'gg'},mark:['1']};
  const {dom,w,messages}=setup(answers);
  assert.equal(w.document.querySelectorAll('.secureQuestion').length,11);
  const snapshot=w.gcFreezeAnswers();
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot.answers)),answers);
  assert.equal(messages.at(-1).type,'ready');
  assert.equal(w.document.querySelector('textarea').disabled,true);
  dom.window.close();
});
test('input is sent to native storage without a website or callable request',()=>{
  const {dom,w,messages}=setup();
  const input=w.document.querySelector('textarea'); input.value='Meine Antwort';
  input.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(messages.at(-1).type,'snapshot');
  assert.equal(messages.at(-1).answers.t,'Meine Antwort');
  assert.equal(messages.at(-1).revision,5);
  dom.window.close();
});
test('retry keeps the first final snapshot even if DOM changes later',()=>{
  const {dom,w}=setup({t:'Endgültig'});
  const first=w.gcFreezeAnswers();
  w.document.querySelector('textarea').value='Zu spät';
  const retry=w.gcFreezeAnswers();
  assert.equal(retry.answers.t,'Endgültig');
  assert.equal(retry.revision,first.revision);
  dom.window.close();
});
test('teacher text is displayed as text and cannot inject script markup',()=>{
  const {dom,w}=setup({},[{id:'xss',type:'text',text:'<img id=evil src=x onerror=alert(1)>'}]);
  assert.equal(w.document.querySelector('#evil'),null);
  assert.match(w.document.querySelector('h2').textContent, /<img/);
  assert.equal(w.document.querySelectorAll('iframe,object,embed').length,0);
  assert.equal(w.document.querySelector('a[href]'),null);
  dom.window.close();
});
