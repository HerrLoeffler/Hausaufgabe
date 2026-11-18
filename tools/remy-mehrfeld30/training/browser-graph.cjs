'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {login,PROJECT}=require('../../visual-pilot/access.cjs'),{GRAPH_RUN:RUN}=require('./graph-profile.cjs'),{fullAnswer}=require('./runner.cjs');
const root=path.resolve(__dirname,'../../../docs/evidence/fields-arrows8-20261118'),base='https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/';
(async()=>{
 const audit=JSON.parse(fs.readFileSync('/private/tmp/gc-graph-audit-private.json','utf8')),token=await login();
 async function call(data){const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({data})});const b=await r.json();if(b.error)throw Error(b.error.message);return b.result;}
 const browser=await chromium.launch({headless:true,executablePath:'/Users/martin/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{class Speech extends EventTarget{start(){window.__speech=this;}stop(){setTimeout(()=>this.dispatchEvent(new Event('end')),20);}abort(){}}window.SpeechRecognition=Speech;});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  const credentials=JSON.parse(fs.readFileSync('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/test-login.json','utf8'));
  await page.locator('#login:not([hidden])').waitFor({timeout:60000});await page.getByLabel('E-Mail',{exact:true}).fill(credentials.email);await page.getByLabel('Passwort',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:'Anmelden',exact:true}).click();
  await page.locator('#workspace:not([hidden])').waitFor({timeout:60000});await page.locator('#graphDeck').click();await page.waitForFunction(()=>document.querySelector('#jump').options.length===8);
  assert.equal(await page.locator('#archive').evaluate(el=>el.open),false);assert.equal(await page.locator('#recipeWish').isVisible(),false);assert.equal(await page.locator('#trainingWish').isVisible(),true);
  const listed=(await call({action:'list',quizId:'training:'+RUN})).tasks,scored=[];
  for(const [i,task]of listed.entries()){
   await page.locator('#jump').selectOption(String(i));await page.waitForFunction(text=>document.querySelector('#prompt').textContent===text,task.text);
   const q=audit.cases.find(c=>c.id===task.id).q,answer=fullAnswer(q);
   if(task.notice){assert.equal(await page.locator('#scoreButton').isVisible(),false);continue;}
   if(task.diagram){for(const [id,value]of Object.entries(answer)){const input=page.locator('[data-diagram-field="'+id+'"]');if(await input.evaluate(el=>el.tagName)==='SELECT')await input.selectOption(String(value));else await input.fill(String(value));}}
   else if(q.trainingPolicy){for(const [id,value]of Object.entries(answer)){const input=page.locator('[data-table="'+id+'"]');if(await input.evaluate(el=>el.tagName)==='SELECT')await input.selectOption(String(value));else await input.fill(String(value).replace('.',','));}}
   else{for(const [a,b]of answer){await page.locator('.node-legend [data-node="'+a+'"]').click();await page.locator('.node-legend [data-node="'+b+'"]').click();}}
   await page.locator('#scoreButton').click();const n=new Intl.NumberFormat('de-DE');await page.waitForFunction(expected=>document.querySelector('#score').textContent===expected,n.format(q.points)+' von '+n.format(q.points)+' Punkten');scored.push(task.id);
  }
  const layouts=[];
  for(const [width,height]of [[1280,1000],[820,1180],[360,900]]){
   await page.setViewportSize({width,height});await page.locator('#jump').selectOption('4');
   const size=await page.evaluate(()=>({body:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('#answer input,#answer select')].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))}));
   assert.ok(size.body<=width+2,'Body overflow '+width);assert.ok(size.controls.every(x=>x.left>=0&&x.right<=width+1),'Reachable fields '+width);layouts.push({width,...size});
   await page.screenshot({path:'/private/tmp/gc-graph-'+width+'.png',fullPage:true});
  }
  // Deliberately synthetic dictation events; this does not test a physical microphone or the browser speech service.
  await page.setViewportSize({width:1280,height:1000});await page.locator('#jump').selectOption('3');await page.locator('#noteMic').click();
  await page.evaluate(()=>{const event=new Event('result');event.resultIndex=0;event.results=[[{transcript:'Synthetischer UI-Test: Die Verbformen sind klar verbunden.'}]];window.__speech.dispatchEvent(event);});
  await page.locator('#good').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Rückmeldung gespeichert.');
  const after=(await call({action:'list',quizId:'training:'+RUN})).tasks;assert.equal(after[3].review.verdict,'good');assert.match(after[3].review.comment,/Synthetischer UI-Test/);assert.equal(after[3].review.version,listed[3].version);
  const nextText=await page.locator('#quickNote').inputValue();assert.doesNotMatch(nextText,/Verbformen/);
  await page.evaluate(()=>{const event=new Event('result');event.resultIndex=0;event.results=[[{transcript:'Darf nicht in die nächste Aufgabe gelangen'}]];window.__speech.dispatchEvent(event);});assert.equal(await page.locator('#quickNote').inputValue(),nextText);
  await page.locator('#quickNote').fill('Synthetischer UI-Test: Bitte die Pfeilbeschriftung prüfen.');await page.locator('#bad').click();await page.waitForFunction(()=>document.querySelector('#position').textContent==='Aufgabe 6 von 8');
  const rated=(await call({action:'list',quizId:'training:'+RUN})).tasks;assert.equal(rated[4].review.verdict,'bad');assert.match(rated[4].review.comment,/Synthetischer UI-Test/);
  // One paid free wish via the real public entry, with durable resume receipt.
  const file=path.join(root,'free-english.json'),wish='Englisch Klasse 6: Bitte drei einzelne Felder für die Simple-Past-Formen von eat, write und run. Jeweils das Ausgangsverb sichtbar mit seinem Eingabefeld verbinden. Die Lernenden tippen jeweils ein Wort.';
  let receipt=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
  if(!receipt){
   await page.locator('#mainWish').fill(wish);await page.locator('#trainingGenerate').click();
   await page.waitForFunction(()=>!!localStorage.getItem('remy-mehrfeld30:gc-visual255-e2e:training-job'));
   const job=await page.evaluate(()=>JSON.parse(localStorage.getItem('remy-mehrfeld30:gc-visual255-e2e:training-job')));assert.equal(job.family,'fields-arrows');
   receipt={at:new Date().toISOString(),wish,...job,status:'running'};fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
  }else if(receipt.status!=='ready'){
   await page.evaluate(job=>localStorage.setItem('remy-mehrfeld30:gc-visual255-e2e:training-job',JSON.stringify(job)),receipt);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#workspace:not([hidden])').waitFor({timeout:60000});await page.locator('#trainingResume').click();
  }
  if(receipt.status!=='ready'){
   await page.waitForFunction(()=>/Entwurf und unabhängige Prüfung sind gespeichert|gesperrt|unbestätigt/.test(document.querySelector('#trainingStatus').textContent),null,{timeout:240000});assert.match(await page.locator('#trainingStatus').textContent(),/Entwurf und unabhängige Prüfung sind gespeichert/);
   const quizId=await page.evaluate(()=>JSON.parse(localStorage.getItem('remy-mehrfeld30:gc-visual255-e2e:last-training'))),runId=quizId.slice(9),report=await call({action:'trainingDetails',runId,caseId:'wish'});
   assert.ok(['chain','branch'].includes(report.decision));assert.deepEqual(report.solution.map(x=>x.value).sort(),['ate','ran','wrote']);
   const actual=(await call({action:'list',quizId})).tasks[0],solution=Object.fromEntries(actual.diagram.fields.map((f,i)=>[f.id,report.solution[i].value]));
   for(const [id,value]of Object.entries(solution))await page.locator('[data-diagram-field="'+id+'"]').fill(value);
   await page.locator('#scoreButton').click();await page.waitForFunction(()=>document.querySelector('#score').textContent==='1,5 von 1,5 Punkten');
   const state=await call({action:'trainingStatus',runId});receipt={...receipt,status:'ready',quizId,runId,decision:report.decision,solution:report.solution,spentMicros:state.spentMicros,actualPublicEntry:true,fullScoreInUI:true};fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'browser-verification.json'),JSON.stringify({at:new Date().toISOString(),scored,layouts,oneVisibleAIEntry:true,archiveCollapsed:true,syntheticSpeechEvents:true,physicalMicrophoneTested:false,greenRedPersisted:true,lateSpeechIgnored:true,freeWish:receipt.runId,pageErrors:errors},null,2)+'\n');
  console.log(JSON.stringify({scored:scored.length,layouts:layouts.map(x=>x.width),syntheticSpeechEvents:true,physicalMicrophoneTested:false,freeWish:receipt.runId}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
