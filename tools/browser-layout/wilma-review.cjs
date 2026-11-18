const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),out=process.env.GC_LAYOUT_EVIDENCE||'/tmp/gc-layout-evidence';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,evidence=[];
try{for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch({headless:true});try{
for(const tasks of [20,40,50,100])for(const [width,height,touch,zoom] of [[320,740,true,1],[390,844,true,1],[768,1024,true,1],[1024,768,true,1],[1280,900,false,1],[1440,900,false,1],[1920,1080,false,1],[2560,1440,false,1],[1440,900,false,2]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/tools/browser-layout/wilma-review.html?tasks='+tasks);await page.locator('body[data-fixture-ready="true"]').waitFor();
 if(zoom!==1)await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
 const initial=await page.locator('[data-wilma=task-overview]').getAttribute('open');
 assert.equal(initial,null,'Task picker starts compact at every width');
 assert.match(await page.locator('[data-wilma=active-task]').textContent(),/Aufgabe 20.*2 offen/);
 if(initial===null)await page.locator('[data-wilma=task-overview]>summary').click();
 assert.equal(await page.locator('[data-question]').count(),tasks,'Completed tasks remain in the bounded chooser');
 const geometry=await page.evaluate(()=>{const grid=document.querySelector('.wilmaTaskTabs'),r=grid.getBoundingClientRect(),panel=document.querySelector('#wilmaAnswerReview').getBoundingClientRect();return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,panelLeft:panel.left,panelRight:panel.right,left:r.left,right:r.right,gridWidth:grid.clientWidth,gridScroll:grid.scrollWidth,height:r.height,scrollHeight:grid.scrollHeight,overflowX:getComputedStyle(grid).overflowX,overflowY:getComputedStyle(grid).overflowY};});
 assert.ok(geometry.documentWidth<=width+1,JSON.stringify({tasks,width,zoom,geometry}));
 assert.ok(geometry.left>=geometry.panelLeft-1&&geometry.right<=geometry.panelRight+1,'Task overview remains in panel: '+JSON.stringify(geometry));
 assert.ok(geometry.gridScroll<=geometry.gridWidth+1,'No horizontal task hunt: '+JSON.stringify(geometry));
 assert.ok(geometry.height<=180*zoom+1,'Overview height stays bounded for 100 tasks: '+JSON.stringify(geometry));
 if(tasks>=50&&width<=1440)assert.ok(geometry.scrollHeight>geometry.height/zoom,'Long lists scroll vertically: '+JSON.stringify(geometry));
 const hit=await page.locator('[data-question=q20]').boundingBox();assert.ok(hit.height>=44*zoom&&hit.width>=44*zoom,JSON.stringify({engineName,tasks,width,zoom,hit}));
 await page.locator('[data-question="q'+tasks+'"]').click();
 assert.equal(await page.locator('[data-question="q'+tasks+'"]').getAttribute('aria-current'),'step');
 assert.match(await page.locator('[data-wilma=active-task]').textContent(),new RegExp('Aufgabe '+tasks));
 await page.locator('[data-wilma=task-toggle]').click();await page.locator('[data-question=q1]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-question=q1]').getAttribute('aria-current'),'step');
 assert.equal(await page.locator('[data-wilma=answers-all]').getAttribute('aria-pressed'),'true','Completed tasks display existing answers');assert.equal(await page.locator('tr[data-submission]').count(),5);
 assert.match(await page.locator('[data-question=q1]').getAttribute('aria-label'),/✓.*Fertig/);
 const activeStyles=await page.locator('[data-question=q1]').evaluate(el=>({border:getComputedStyle(el).boxShadow,bg:getComputedStyle(el).backgroundColor}));assert.notEqual(activeStyles.border,'none','Active indicator independent of completion colour');
 await page.getByRole('button',{name:'Nächste offene Antwort',exact:true}).press('Enter');assert.equal(await page.locator('[data-question="q20"]').getAttribute('aria-current'),'step');assert.equal(await page.evaluate(()=>document.activeElement.closest('tr')?.dataset.submission),'A');await page.getByRole('button',{name:'Nächste offene Antwort',exact:true}).press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.closest('tr')?.dataset.submission),'B');
 await page.getByRole('button',{name:'Zur Übersicht',exact:true}).press('Enter');assert.equal(await page.locator('.wilmaTaskTabs').count(),0);assert.notEqual(await page.locator('#resultsTableWrap').evaluate(el=>getComputedStyle(el).display),'none');await page.getByRole('button',{name:/^Wilma öffnen/}).press('Enter');assert.equal(await page.locator('#resultsTableWrap').evaluate(el=>getComputedStyle(el).display),'none');
 if(touch){for(const action of ['task-toggle','answers-open','answers-all']){const box=await page.locator('[data-wilma='+action+']').boundingBox();assert.ok(box.height>=44,'Touch controls remain 44px');}const hit=await page.locator('tr[data-submission="A"] [data-wilma="plus"]').boundingBox();assert.ok(hit.height>=44);}
 assert.deepEqual(errors,[]);evidence.push({engine:engineName,tasks,width,height,touch,zoom,geometry});
 if(tasks===100&&zoom===1&&[390,768,1920,2560].includes(width))await page.screenshot({path:path.join(out,'wilma-'+engineName+'-'+width+'.png'),fullPage:false});
 await context.close();
}
}finally{await browser.close();}}}finally{await new Promise(r=>server.close(r));}
fs.writeFileSync(path.join(out,'wilma-layout.json'),JSON.stringify(evidence,null,2));console.log('Wilma bounded overview/filter/status/keyboard/touch/zoom: '+evidence.length+' scenarios passed.');})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
