const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),out=path.join(process.env.GC_LAYOUT_EVIDENCE||'/tmp/gc-wilma-saved-refresh','saved-refresh');fs.mkdirSync(out,{recursive:true});
let ready=false,reads=[];const evidence=[];
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/fixture/receipt'){
  const sid=url.searchParams.get('sid');assert.ok(['missing','available'].includes(sid));reads.push(sid);res.setHeader('Content-Type','application/json');
  if(sid==='missing'&&!ready){res.writeHead(409);res.end(JSON.stringify({reasonCode:'cache_miss',reviewState:'not_started'}));return;}
  res.end(JSON.stringify({source:'wilma-ai',cached:true,points:1,status:'uncertain',requestId:'synthetic-saved-only',reason:'Gespeicherter fiktiver Beleg; Lehrkraft entscheidet.'}));return;
 }
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':'text/html');res.end(fs.readFileSync(file));
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
try{for(const [name,engine]of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch({headless:true});try{for(const [width,height]of [[390,844],[820,600],[1280,720]]){
 ready=false;reads=[];const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),external=[],errors=[];page.on('request',r=>{if(!r.url().startsWith(origin))external.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/tools/browser-layout/wilma-saved-refresh.html');await page.locator('body[data-fixture-ready=true]').waitFor();
 const missing=page.locator('tr[data-submission=missing]'),available=page.locator('tr[data-submission=available]');
 assert.equal(await missing.locator('.wilmaRowReason').count(),0);assert.equal(await available.locator('.wilmaRowReason').count(),1);assert.deepEqual(reads,['missing','available']);
 // The saved response appears later without changing source, answers or teacher points.
 ready=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await missing.locator('.wilmaRowReason').waitFor();await page.waitForFunction(()=>!fixture.scheduler.isRunning());
 assert.match(await missing.locator('.wilmaRowReason').textContent(),/1 \/ 1 P/);assert.equal(await missing.locator('[data-wilma=resume]').count(),0);
 assert.deepEqual(reads,['missing','available','missing']);assert.equal(await page.evaluate(()=>fixture.writes),0);assert.equal(await page.evaluate(()=>fixture.ctx.submissions.every(s=>s.grading.q.awardedPoints===0&&!s.grading.q.reviewState)),true);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));assert.equal(reads.length,3,'Repeated focus does not create another lookup');assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true});evidence.push({engine:name,width,height,reads:3,providerStarts:0,gradeWrites:0,storedResultVisible:true});await context.close();

 }
 // A pending teacher edit must not be blurred or committed by a foreground read.
 ready=false;reads=[];const editContext=await browser.newContext({viewport:{width:820,height:600}}),editPage=await editContext.newPage();await editPage.goto(origin+'/tools/browser-layout/wilma-saved-refresh.html');await editPage.locator('body[data-fixture-ready=true]').waitFor();ready=true;
 const draft=editPage.locator('tr[data-submission=available] [data-wilma=points]');await draft.fill('0.5');await editPage.evaluate(()=>window.dispatchEvent(new Event('focus')));await editPage.waitForTimeout(50);
 assert.equal(await draft.inputValue(),'0.5');assert.equal(await editPage.evaluate(()=>fixture.writes),0);assert.equal(await editPage.locator('tr[data-submission=missing] .wilmaRowReason').count(),0);assert.deepEqual(reads,['missing','available']);
 evidence.push({engine:name,editingGuard:true,reads:2,providerStarts:0,gradeWrites:0,dirtyDraftPreserved:true});await editContext.close();
 }finally{await browser.close();}}}finally{
await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(evidence,null,2));}
 console.log('Saved Wilma receipt refresh: '+evidence.length+' browser scenarios; no provider, no grade writes.');
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
