// Local synthetic browser regression: a pending review must not steal task-picker focus.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),out=process.env.GC_LAYOUT_EVIDENCE||'/tmp/gc-wilma-picker-focus';fs.mkdirSync(out,{recursive:true});
const before=process.argv.includes('--before'),evidence=[],failures=[];
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':'text/html');res.end(fs.readFileSync(file));});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
try{for(const [name,engine]of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});try{
  const page=await browser.newPage({viewport:{width:390,height:600}}),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():(external.push(r.request().url()),r.abort()));
  await page.goto(origin+'/tools/browser-layout/wilma-picker.html?tasks=15&active=12&hold=1');await page.locator('body[data-fixture-ready=true]').waitFor();
  await page.locator('[data-wilma=resume]').click();assert.equal(await page.evaluate(()=>fixture.ui.isBusy()),true,'Synthetic first review remains pending');
  await page.locator('[data-wilma=task-toggle]').press('ArrowDown');await page.keyboard.press('ArrowRight');
  const result=await page.evaluate(()=>{const snapshot=()=>({tag:document.activeElement.tagName,question:document.activeElement.dataset.question,popup:document.querySelector('.wilmaTaskPicker').matches(':popover-open'),busy:fixture.ui.isBusy()});const before=snapshot();fixture.ui.refresh();return {before,after:snapshot()};});
  // Let native disclosure events run as they do during a background update.
  await page.waitForTimeout(40);result.settled=await page.evaluate(()=>{const r=document.activeElement.getBoundingClientRect(),g=document.querySelector('.wilmaTaskTabs').getBoundingClientRect();return {tag:document.activeElement.tagName,question:document.activeElement.dataset.question,popup:document.querySelector('.wilmaTaskPicker').matches(':popover-open'),visible:r.top>=g.top&&r.bottom<=g.bottom+.5};});
  evidence.push({name,...result});await page.screenshot({path:path.join(out,(before?'before-':'after-')+name+'.png')});
  try{assert.equal(result.before.question,'q13','Teacher focuses the next task while review is pending');assert.equal(result.after.question,'q13','Refreshing a pending review retains the same focused task');assert.equal(result.settled.question,'q13','Native disclosure update also retains task focus');assert.equal(result.settled.visible,true,'Retained task focus remains fully visible after native disclosure update');assert.equal(result.after.popup,true);assert.equal(result.after.busy,true);assert.equal(result.settled.popup,true);}catch(error){failures.push({name,message:error.message});}
  for(const fontChange of [false,true]){
   const scrollPage=await browser.newPage({viewport:{width:320,height:360}});await scrollPage.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
   await scrollPage.goto(origin+'/tools/browser-layout/wilma-picker.html?tasks=15&active=15');await scrollPage.locator('body[data-fixture-ready=true]').waitFor();await scrollPage.locator('[data-wilma=task-toggle]').click();await scrollPage.waitForTimeout(40);
   // A changed font metric exercises the same available-height boundary as Linux system fonts.
   await scrollPage.evaluate(change=>{if(change)document.querySelector('.wilmaTaskPicker>p').style.lineHeight='2.4';scrollBy(0,110);},fontChange);await scrollPage.waitForTimeout(40);
   const scrolled=await scrollPage.evaluate(()=>{const a=document.querySelector('[aria-current=step]').getBoundingClientRect(),g=document.querySelector('.wilmaTaskTabs').getBoundingClientRect();return {visible:a.top>=g.top&&a.bottom<=g.bottom+.5,activeTop:a.top,activeBottom:a.bottom,gridTop:g.top,gridBottom:g.bottom};});evidence.push({name,fontChange,scrolled});
   try{assert.equal(scrolled.visible,true,'15 tasks, last active, 320×360: page scroll keeps the entire chip visible, including changed font metrics');}catch(error){failures.push({name,fontChange,message:error.message});}await scrollPage.close();
  }
  await page.evaluate(()=>fixture.finishReview());await page.waitForFunction(()=>!fixture.ui.isBusy());assert.equal(await page.evaluate(()=>fixture.resumes),1);assert.equal(await page.evaluate(()=>fixture.writes),0);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 }finally{await browser.close();}
}}finally{await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,before?'before.json':'after.json'),JSON.stringify(evidence,null,2));}
assert.deepEqual(failures,[],'Pending-review task focus must survive a refresh in both browsers');console.log('Wilma pending-review picker focus: Chromium and WebKit passed; no external requests or teacher writes.');})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
