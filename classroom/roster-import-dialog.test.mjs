import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {JSDOM}=createRequire(import.meta.url)('../tools/ui/node_modules/jsdom');
import {openRosterImport} from './roster-import-dialog.mjs';
import {openLocalRoster} from '../tools/classroom-preview/local-roster-store.mjs';
const tick=()=>new Promise(r=>setTimeout(r,0));
function setup(){const dom=new JSDOM('<body><button>Zurück</button></body>',{url:'http://127.0.0.1:8782/'}),store=openLocalRoster(':memory:');let committed=null;
 const client={previewImport:async payload=>store.previewImport('a',payload),mutate:async(command,payload,expectedRevision,operationId)=>store.mutate('a',{command,payload,expectedRevision,operationId})};
 const dialog=openRosterImport({document:dom.window.document,client,state:store.read('a'),isCurrent:()=>true,onCommit:s=>{committed=s;}});
 return {dom,store,dialog,get committed(){return committed;}};
}
async function selectFile(t,text){const input=t.dom.window.document.querySelector('[data-import-file]');Object.defineProperty(input,'files',{value:[{size:Buffer.byteLength(text),arrayBuffer:async()=>new TextEncoder().encode(text).buffer}],configurable:true});input.dispatchEvent(new t.dom.window.Event('change'));await tick();}
test('CSV stays uncommitted until preview and explicit approval; summary reports new accounts/classes',async()=>{
 const t=setup(),doc=t.dom.window.document;try{
  await selectFile(t,'Vorname;Nachname;Klasse\nMila;Beispiel;8b\nAda;Übung;8b\n');
  doc.querySelector('[data-import-preview]').click();await tick();
  assert.equal(t.store.read('a').students.length,0);assert.match(doc.querySelector('[data-import-summary]').textContent,/2.*Neu/);
  assert.equal(doc.querySelector('fieldset').hidden,true,'review step focuses on changes instead of repeating file setup');
  const confirm=doc.querySelector('[data-import-confirm]');assert.equal(confirm.disabled,true);
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));assert.equal(confirm.disabled,false);
  confirm.click();await tick();assert.equal(t.committed.students.length,2);assert.equal(doc.querySelector('[data-import-dialog]'),null);
 }finally{t.dialog.destroy();t.store.close();t.dom.window.close();}
});
test('headerless pipe auto keeps first row; cancellation does not create accounts',async()=>{
 const t=setup(),doc=t.dom.window.document;try{
  await selectFile(t,'0010|0001|von Beispiel|Ada|||w|8b||\n0010|0002|Übung|Mila|||d|8b||\n');
  assert.equal(doc.querySelector('[data-import-header]').checked,false);
  doc.querySelector('[data-import-preview]').click();await tick();assert.match(doc.querySelector('[data-import-summary]').textContent,/2.*Neu/);
  doc.querySelector('[data-import-cancel]').click();assert.equal(t.store.read('a').students.length,0);assert.equal(doc.querySelector('[data-import-dialog]'),null);
 }finally{t.dialog.destroy();t.store.close();t.dom.window.close();}
});
test('manual existing person is explicitly linked and year/class move is previewed before commit',async()=>{
 const t=setup(),doc=t.dom.window.document;try{
  t.dialog.destroy();
  const initial=t.store.mutate('a',{command:'createClass',payload:{name:'8b',schoolYear:'2026/27'},expectedRevision:0,operationId:crypto.randomUUID()});
  const old=t.store.mutate('a',{command:'createStudent',payload:{firstName:'Mila',lastName:'Beispiel',classId:initial.classes[0].id},expectedRevision:1,operationId:crypto.randomUUID()});
  const nextDialog=openRosterImport({document:doc,client:{previewImport:async p=>t.store.previewImport('a',p),mutate:async(command,payload,expectedRevision,operationId)=>t.store.mutate('a',{command,payload,expectedRevision,operationId})},state:old,isCurrent:()=>true,onCommit:()=>{}});
  await selectFile(t,'Vorname;Nachname;Klasse\nMila;Beispiel;9b\n');doc.querySelector('[data-import-year]').value='2027/28';
  doc.querySelector('[data-import-preview]').click();await tick();assert.match(doc.querySelector('[data-import-summary]').textContent,/Zuordnung prüfen/);
  [...doc.querySelectorAll('button')].find(b=>b.textContent==='Eindeutige Namensvorschläge zuordnen').click();
  doc.querySelector('[data-import-preview]').click();await tick();
  const summary=doc.querySelector('[data-import-summary]').textContent;assert.match(summary,/Klassenwechsel/);assert.match(summary,/8b · 2026\/27/);assert.match(summary,/9b · 2027\/28/);
  assert.equal(t.store.read('a').students[0].classId,initial.classes[0].id,'preview cannot move pupil');
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));doc.querySelector('[data-import-confirm]').click();await tick();
  assert.equal(t.store.read('a').students[0].id,old.students[0].id);assert.equal(t.store.read('a').students.length,1);nextDialog.destroy();
 }finally{t.store.close();t.dom.window.close();}
});
test('row decisions are locked while the approved import is being committed',async()=>{
 const dom=new JSDOM('<body></body>',{url:'http://127.0.0.1:8782/'}),store=openLocalRoster(':memory:');let resolve;
 const client={previewImport:async p=>store.previewImport('a',p),mutate:()=>new Promise(r=>{resolve=r;})};
 const modal=openRosterImport({document:dom.window.document,client,state:store.read('a'),isCurrent:()=>true,onCommit:()=>{}}),t={dom};
 try{
  await selectFile(t,'Vorname;Nachname;Klasse\nAda;Beispiel;8b\n');const doc=dom.window.document;doc.querySelector('[data-import-preview]').click();await tick();
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new dom.window.Event('change'));doc.querySelector('[data-import-confirm]').click();
  assert.equal(doc.querySelector('[data-import-summary] select').disabled,true);
  resolve(store.read('a'));await tick();
 }finally{modal.destroy();store.close();dom.window.close();}
});
test('fixed existing class includes its own school year and never creates a same-name class in a different year',async()=>{
 const dom=new JSDOM('<body></body>',{url:'http://127.0.0.1:8782/'}),doc=dom.window.document,store=openLocalRoster(':memory:');
 const initial=store.mutate('a',{command:'createClass',payload:{name:'8b',schoolYear:'2025/26'},expectedRevision:0,operationId:crypto.randomUUID()});
 const modal=openRosterImport({document:doc,client:{previewImport:async p=>store.previewImport('a',p)},state:initial,isCurrent:()=>true,onCommit:()=>{}});
 try{
  await selectFile({dom},'Vorname;Nachname\nAda;Beispiel\n');doc.querySelector('[data-import-year]').value='2026/27';
  const fixed=doc.querySelector('[data-import-fixed-class]');fixed.value=initial.classes[0].id;fixed.dispatchEvent(new dom.window.Event('change'));
  doc.querySelector('[data-import-preview]').click();await tick();
  assert.equal(doc.querySelector('[data-import-year]').value,'2025/26');assert.equal(doc.querySelector('[data-import-year]').disabled,true);
  const summary=doc.querySelector('[data-import-summary]').textContent;assert.match(summary,/8b · 2025\/26/);assert.doesNotMatch(summary,/Neue Klassen:/);
 }finally{modal.destroy();store.close();dom.window.close();}
});

test('unresolved person on another page is explained beside approval and reachable without weakening the commit guard',async()=>{
 const t=setup(),doc=t.dom.window.document;try{
  t.dialog.destroy();
  const old=t.store.mutate('a',{command:'createStudent',payload:{firstName:'Ada',lastName:'Beispiel',classId:null},expectedRevision:0,operationId:crypto.randomUUID()});
  const modal=openRosterImport({document:doc,client:{previewImport:async p=>t.store.previewImport('a',p),mutate:async(command,payload,expectedRevision,operationId)=>t.store.mutate('a',{command,payload,expectedRevision,operationId})},state:old,isCurrent:()=>true,onCommit:()=>{}});
  await selectFile(t,'Vorname;Nachname;Klasse\n'+Array.from({length:60},(_,i)=>i===55?'Ada;Beispiel;9b':`Probe${i};Muster;9b`).join('\n'));
  doc.querySelector('[data-import-preview]').click();await tick();
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));
  assert.equal(doc.querySelector('[data-import-confirm]').disabled,true);
  const status=doc.querySelector('[data-import-confirm-status]');assert.ok(status,'approval area explains disabled commit');assert.match(status.textContent,/1.*offen/);
  const jump=doc.querySelector('[data-import-show-review]');assert.ok(jump&&!jump.hidden,'open decisions are reachable from approval area');jump.click();
  const select=doc.querySelector('select[aria-label="Entscheidung für Zeile 57"]');assert.ok(select,'jump reaches the page containing the unresolved record');assert.equal(doc.activeElement,select);
  select.value='link:'+old.students[0].id;select.dispatchEvent(new t.dom.window.Event('change'));
  assert.equal(doc.querySelector('[data-import-confirm]').disabled,true,'changed decision still requires a fresh preview');
  assert.match(status.textContent,/automatisch geprüft/);
  doc.querySelector('[data-import-preview]').click();await tick();approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));
  assert.equal(doc.querySelector('[data-import-confirm]').disabled,false);doc.querySelector('[data-import-confirm]').click();await tick();
  assert.equal(t.store.read('a').students.length,60);assert.equal(t.store.read('a').students.find(s=>s.firstName==='Ada').id,old.students[0].id);modal.destroy();
 }finally{t.store.close();t.dom.window.close();}
});

test('large fully resolved import can commit from page six with one explicit approval',async()=>{
 const t=setup(),doc=t.dom.window.document;try{
  await selectFile(t,'Vorname;Nachname;Klasse\n'+Array.from({length:320},(_,i)=>`Probe${i};Muster;8b`).join('\n'));
  doc.querySelector('[data-import-preview]').click();await tick();
  for(let i=0;i<5;i++)[...doc.querySelectorAll('[data-import-summary] button')].find(b=>b.textContent==='Weiter').click();
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));
  assert.equal(doc.querySelector('[data-import-confirm]').disabled,false);doc.querySelector('[data-import-confirm]').click();await tick();
  assert.equal(t.committed.students.length,320);
 }finally{t.dialog.destroy();t.store.close();t.dom.window.close();}
});
test('clicking the open count shows both late decisions together and automatically rechecks the batch',async()=>{
 const t=setup(),doc=t.dom.window.document;try{
  t.dialog.destroy();
  let state=t.store.read('a');for(const firstName of ['Ada','Mila'])state=t.store.mutate('a',{command:'createStudent',payload:{firstName,lastName:'Beispiel',classId:null},expectedRevision:state.revision,operationId:crypto.randomUUID()});
  const modal=openRosterImport({document:doc,client:{previewImport:async p=>t.store.previewImport('a',p),mutate:async(command,payload,expectedRevision,operationId)=>t.store.mutate('a',{command,payload,expectedRevision,operationId})},state,isCurrent:()=>true,onCommit:()=>{}});
  await selectFile(t,'Vorname;Nachname;Klasse\n'+Array.from({length:110},(_,i)=>i===80?'Ada;Beispiel;8b':i===109?'Mila;Beispiel;8b':`Probe${i};Muster;8b`).join('\n'));
  doc.querySelector('[data-import-preview]').click();await tick();const open=doc.querySelector('[data-import-filter="review"]');assert.ok(open,'open count is a filter button');open.click();
  assert.equal(doc.querySelectorAll('[data-import-summary] tbody tr').length,2);
  const selects=[...doc.querySelectorAll('[data-import-summary] tbody select')];for(const [i,s]of selects.entries()){s.value='link:'+state.students[i].id;s.dispatchEvent(new t.dom.window.Event('change'));}
  await new Promise(r=>setTimeout(r,350));assert.match(doc.querySelector('[data-import-filter="review"]').textContent,/0/);
  assert.equal(doc.querySelectorAll('[data-import-summary] tbody tr').length,2,'decisions remain in context after automatic validation');
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));assert.equal(doc.querySelector('[data-import-confirm]').disabled,false);
  doc.querySelector('[data-import-confirm]').click();await tick();assert.equal(t.store.read('a').students.length,110);modal.destroy();
 }finally{t.store.close();t.dom.window.close();}
});
test('teacher import uses same approval flow and persists one teacher with two explicit teaching pairs',async()=>{
 const t=setup(),doc=t.dom.window.document;try{t.dialog.destroy();
  const modal=openRosterImport({document:doc,kind:'teachers',client:{previewTeacherImport:async p=>t.store.previewTeacherImport('a',p),mutate:async(command,payload,expectedRevision,operationId)=>t.store.mutate('a',{command,payload,expectedRevision,operationId})},state:t.store.read('a'),isCurrent:()=>true,onCommit:()=>{}});
  await selectFile(t,'Kennung;Vorname;Nachname;Kürzel;Klasse;Fach\n0001;Ada;Beispiel;AB;8b;Deutsch\n0001;Ada;Beispiel;AB;9b;Englisch');
  const source=doc.querySelector('[data-import-map="sourceId"]');source.value='0';source.dispatchEvent(new t.dom.window.Event('change'));doc.querySelector('[data-import-preview]').click();await tick();
  assert.match(doc.querySelector('[data-import-summary]').textContent,/1 Neu/);assert.match(doc.querySelector('[data-import-summary]').textContent,/8b \/ Deutsch/);assert.match(doc.querySelector('[data-import-summary]').textContent,/9b \/ Englisch/);
  const approval=doc.querySelector('[data-import-approval]');approval.checked=true;approval.dispatchEvent(new t.dom.window.Event('change'));doc.querySelector('[data-import-confirm]').click();await tick();assert.equal(t.store.read('a').teachers.length,1);assert.equal(t.store.read('a').teachers[0].assignments.length,2);modal.destroy();
 }finally{t.store.close();t.dom.window.close();}
});
test('late automatic preview cannot overwrite a newer batch of decisions or revive a closed import',async()=>{
 const t=setup(),doc=t.dom.window.document;let pending=[],calls=0;try{t.dialog.destroy();
  const initial=t.store.mutate('a',{command:'createStudent',payload:{firstName:'Ada',lastName:'Beispiel',classId:null},expectedRevision:0,operationId:crypto.randomUUID()});
  const modal=openRosterImport({document:doc,client:{previewImport:p=>{calls++;const view=t.store.previewImport('a',p);return calls===1?Promise.resolve(view):new Promise(r=>pending.push(()=>r(view)));}},state:initial,isCurrent:()=>true,onCommit:()=>{}});
  await selectFile(t,'Vorname;Nachname;Klasse\nAda;Beispiel;8b\nNeue;Person;8b');doc.querySelector('[data-import-preview]').click();await tick();
  let choice=doc.querySelector('[aria-label="Entscheidung für Zeile 2"]');choice.value='skip';choice.dispatchEvent(new t.dom.window.Event('change'));await new Promise(r=>setTimeout(r,280));assert.equal(pending.length,1);
  choice.value='create';choice.dispatchEvent(new t.dom.window.Event('change'));await new Promise(r=>setTimeout(r,280));assert.equal(pending.length,2);
  pending[1]();await tick();assert.match(doc.querySelector('[data-import-filter=create]').textContent,/2/);pending[0]();await tick();assert.match(doc.querySelector('[data-import-filter=create]').textContent,/2/);
  choice=doc.querySelector('[aria-label="Entscheidung für Zeile 2"]');choice.value='skip';choice.dispatchEvent(new t.dom.window.Event('change'));await new Promise(r=>setTimeout(r,280));modal.destroy();pending[2]();await tick();assert.equal(doc.querySelector('[data-import-dialog]'),null);
 }finally{t.store.close();t.dom.window.close();}
});
test('failed automatic check shows its reason beside approval and cannot allow an old plan to commit',async()=>{
 const t=setup(),doc=t.dom.window.document;try{t.dialog.destroy();let calls=0;
  const modal=openRosterImport({document:doc,client:{previewImport:async p=>{if(calls++)throw Error('Prüfung vorübergehend nicht erreichbar.');return t.store.previewImport('a',p);}},state:t.store.read('a'),isCurrent:()=>true,onCommit:()=>{}});
  await selectFile(t,'Vorname;Nachname;Klasse\nNeue;Person;8b');doc.querySelector('[data-import-preview]').click();await tick();const choice=doc.querySelector('[data-import-summary] select');choice.value='skip';choice.dispatchEvent(new t.dom.window.Event('change'));await new Promise(r=>setTimeout(r,300));
  assert.match(doc.querySelector('[data-import-confirm-status]').textContent,/nicht erreichbar/);assert.equal(doc.querySelector('[data-import-confirm]').disabled,true);assert.equal(doc.querySelector('[data-import-preview]').hidden,false);modal.destroy();
 }finally{t.store.close();t.dom.window.close();}
});
