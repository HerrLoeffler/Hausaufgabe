const test=require('node:test'),assert=require('node:assert/strict');
const {setup,fixtures,root}=require('./renderer-fixture.cjs');
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
  assert.equal(messages.at(-1).revision,6);
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
test('ordering confirmation updates progress without changing answer order',()=>{
  const {dom,w,messages}=setup();
  const before=w.gcExamSummary().completed;
  const section=w.document.querySelector('.secureQuestion[data-qid="order"]');
  const confirm=[...section.querySelectorAll('button')].find(b=>b.textContent==='Reihenfolge bestätigen');
  confirm.click();
  assert.equal(w.gcExamSummary().completed,before+1);
  assert.deepEqual(JSON.parse(JSON.stringify(messages.at(-1).answers.order)),['x','y']);
  assert.ok(messages.at(-1).touchedQuestionIDs.includes('order'));
  dom.window.close();
});
test('selected answer row is distinct and media failure never changes answers',()=>{
 const paper=[{id:'media',type:'single',text:'Welche Farbe?',image:{src:'https://example.invalid/image.png',alt:'Notwendiges Aufgabenbild'},options:[{id:'a',text:'Blau'},{id:'b',text:'Grün'}]}];
 const {dom,w}=setup({},paper);
 const section=w.document.querySelector('.secureQuestion');
 const input=section.querySelector('input');input.click();
 assert.ok(input.closest('label').classList.contains('selected'));
 section.querySelector('img').dispatchEvent(new w.Event('error'));
 const error=section.querySelector('[role=alert]');assert.ok(error);assert.match(error.textContent,/Bild.*nicht.*geladen/i);
 assert.equal(w.gcFreezeAnswers().answers.media,'a');
 dom.window.close();
});
test('listening-only instructions never expose hidden teacher question text',()=>{
 const {dom,w}=setup({},[{id:'audio',type:'single',text:'GEHEIMER FRAGETEXT',audioPresentation:'listening-only',audioInstruction:'Höre genau zu.',audio:{src:'https://example.invalid/audio.wav'},options:[{id:'a',text:'Erste Antwort'}]}]);
 assert.equal(w.document.querySelector('h2').textContent,'Höre genau zu.');
 assert.equal(w.document.body.textContent.includes('GEHEIMER FRAGETEXT'),false);
 dom.window.close();
});
test('marking then clearing words retains touched metadata without a completion mark',()=>{
 const {dom,w,messages}=setup();const word=w.document.querySelector('.secureWord');word.click();word.click();
 assert.ok(messages.at(-1).touchedQuestionIDs.includes('mark'));
 assert.equal(messages.at(-1).completedQuestionIDs.includes('mark'),false);
 dom.window.close();
});
test('legacy colored gap papers show empty neutral fields and restore only actual student answers',()=>{
 const paper=[{id:'legacy',type:'gapfill',text:'Colors',segments:[{type:'text',text:'The sky is '},{type:'gap',id:'g1',color:'blue'},{type:'text',text:' and the grass is '},{type:'gap',id:'g2',color:'green'}]}];
 for(const answers of [{},{legacy:['blue','green']}]){
  const {dom,w}=setup(answers,paper);const inputs=[...w.document.querySelectorAll('.secureGap')];assert.equal(inputs.length,2);
  assert.deepEqual(inputs.map(x=>x.value),answers.legacy||['','']);
  assert.ok(inputs.every(x=>!x.hasAttribute('placeholder')&&!/gapColor-/.test(x.className)));
  assert.deepEqual(inputs.map(x=>x.getAttribute('aria-label')),['Lücke 1','Lücke 2']);
  assert.deepEqual(JSON.parse(JSON.stringify(w.gcFreezeAnswers().answers)).legacy,answers.legacy||['','']);dom.window.close();
 }
});
