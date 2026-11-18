'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {login,PROJECT}=require('../../visual-pilot/access.cjs'),{SESSION}=require('./auto-manifest.cjs'),{fullAnswer}=require('./runner.cjs');
const RUN=SESSION+'-final';
const root=path.resolve(__dirname,'../../../docs/evidence/autonomous-recipes-20261118'),base='https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/';
(async()=>{
 const audit=JSON.parse(fs.readFileSync('/private/tmp/gc-auto-audit-private.json','utf8')),token=await login();
 const finalCases=audit.runs.find(r=>r.phase==='final').cases;assert.ok(finalCases.length>0);
 async function call(data){const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({data})});const b=await r.json();if(b.error)throw Error(b.error.message);return b.result;}
 const browser=await chromium.launch({headless:true,executablePath:'/Users/martin/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{class Speech extends EventTarget{start(){window.__speech=this;}stop(){setTimeout(()=>this.dispatchEvent(new Event('end')),20);}abort(){}}window.SpeechRecognition=Speech;});
  await page.goto(base+'?deck='+encodeURIComponent('training:'+RUN),{waitUntil:'domcontentloaded',timeout:60000});
  const credentials=JSON.parse(fs.readFileSync('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/test-login.json','utf8'));
  await page.locator('#login:not([hidden])').waitFor({timeout:60000});await page.getByLabel('E-Mail',{exact:true}).fill(credentials.email);await page.getByLabel('Passwort',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:'Anmelden',exact:true}).click();
  await page.locator('#workspace:not([hidden])').waitFor({timeout:60000});await page.waitForFunction(count=>document.querySelector('#jump').options.length===count,finalCases.length);
  assert.equal(await page.locator('#archive').evaluate(el=>el.open),false);assert.equal(await page.locator('#recipeWish').isVisible(),false);assert.equal(await page.locator('#trainingWish').isVisible(),true);
  const listed=(await call({action:'list',quizId:'training:'+RUN})).tasks,scored=[];
  for(const [i,task]of listed.entries()){
   await page.locator('#jump').selectOption(String(i));await page.waitForFunction(text=>document.querySelector('#prompt').textContent===text,task.text);
   const q=finalCases.find(c=>c.id===task.id).q,answer=fullAnswer(q);
   if(task.notice){assert.equal(await page.locator('#scoreButton').isVisible(),false);continue;}
   if(task.diagram){for(const [id,value]of Object.entries(answer)){const input=page.locator('[data-diagram-field="'+id+'"]');if(await input.evaluate(el=>el.tagName)==='SELECT')await input.selectOption(String(value));else await input.fill(String(value));}}
   else if(q.trainingPolicy){for(const [id,value]of Object.entries(answer)){const input=page.locator('[data-table="'+id+'"]');if(await input.evaluate(el=>el.tagName)==='SELECT')await input.selectOption(String(value));else await input.fill(String(value).replace('.',','));}}
   else{for(const [a,b]of answer){await page.locator('.node-legend [data-node="'+a+'"]').click();await page.locator('.node-legend [data-node="'+b+'"]').click();}}
   await page.locator('#scoreButton').click();const n=new Intl.NumberFormat('de-DE');await page.waitForFunction(expected=>document.querySelector('#score').textContent===expected,n.format(q.points)+' von '+n.format(q.points)+' Punkten');const scope={quizId:task.quizId,id:task.id,version:task.version};
   const partial=Array.isArray(answer)?answer.slice(1):{...answer,[Object.keys(answer)[0]]:'falsch'};
   const blank=await call({action:'score',...scope,answer:null}),part=await call({action:'score',...scope,answer:partial});assert.equal(blank.points,0);assert.equal(part.points,q.points-.5);
   scored.push({id:task.id,full:q.points,blank:0,oneWrong:part.points});
  }
  const layouts=[];
  for(const [width,height]of [[1280,1000],[820,1180],[360,900]]){
   await page.setViewportSize({width,height});for(let item=0;item<listed.length;item++){await page.locator('#jump').selectOption(String(item));
   const size=await page.evaluate(()=>({body:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('#answer input,#answer select')].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))}));
   assert.ok(size.body<=width+2,'Body overflow '+width);assert.ok(size.controls.every(x=>x.left>=0&&x.right<=width+1),'Reachable fields '+width);layouts.push({width,item,...size});}
   await page.screenshot({path:'/private/tmp/gc-auto-final-'+width+'.png',fullPage:true});
  }
  const mapping=finalCases.find(c=>c.plan.kind==='mapping');assert.ok(mapping);
  const roleQ=require('./graph.cjs').buildGraph({...mapping.plan,sourceRole:'Behauptung',targetRole:'Begründung'},{id:'role-fixture'});
  const roleView=require('../review.cjs').present('fixture','fixture',roleQ).visual;
  await page.evaluate(task=>{const host=document.querySelector('#answer');host.classList.remove('flow-preview');host.replaceChildren();window.GCRenderer.mount(host,task,null,{onAnswer:()=>{}});},roleView);
  const legend=await page.locator('.node-legend').innerText();assert.match(legend,/Behauptung 1/);assert.match(legend,/Begründung A/);
  for(const [width,height]of [[1280,1000],[820,1180],[360,900]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));}
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'browser-verification.json'),JSON.stringify({at:new Date().toISOString(),scored,layouts,actualUI:true,publicKeysRedacted:true,roleLabelFixtureVerified:true,physicalTouchTested:false,pageErrors:errors},null,2)+'\n');
  console.log(JSON.stringify({scored:scored.length,layouts:layouts.map(x=>x.width),allScoresVerified:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
