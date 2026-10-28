const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),out=process.env.GC_LAYOUT_EVIDENCE||'/tmp/gc-layout-evidence';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,evidence=[];
try{for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch({headless:true});try{
for(const tasks of [20,40])for(const [width,height,touch,zoom] of [[320,740,true,1],[390,844,true,1],[768,1024,true,1],[1024,768,true,1],[1280,900,false,1],[390,844,false,2]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/tools/browser-layout/wilma-review.html?tasks='+tasks);await page.locator('body[data-fixture-ready="true"]').waitFor();
 if(zoom!==1)await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
 const geometry=await page.evaluate(()=>{const strip=document.querySelector('.wilmaTaskTabs'),r=strip.getBoundingClientRect();return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,left:r.left,right:r.right,stripWidth:strip.clientWidth,stripScroll:strip.scrollWidth,overflow:getComputedStyle(strip).overflowX};});
 assert.ok(geometry.documentWidth<=width+1,JSON.stringify({tasks,width,zoom,geometry}));assert.ok(geometry.right<=width+1&&geometry.left>=-1);assert.ok(geometry.stripScroll>geometry.stripWidth&&geometry.overflow==='auto');
 await page.getByRole('button',{name:new RegExp('^Aufgabe '+tasks+' ')}).click();
 assert.equal(await page.locator('[data-question="q'+tasks+'"]').getAttribute('aria-pressed'),'true');
 assert.ok(await page.locator('.wilmaOneQuestion').isVisible());
 const afterLong=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth}));assert.ok(afterLong.doc<=width+1);
 await page.locator('[data-question="q20"]').focus();await page.keyboard.press('Enter');
 await page.locator('tr[data-submission="A"] [data-wilma="whole"]').focus();await page.locator('[data-wilma="next"]').click();
 assert.equal(await page.evaluate(()=>document.activeElement.closest('tr')?.dataset.submission),'B');
 if(touch){const hit=await page.locator('tr[data-submission="A"] [data-wilma="plus"]').boundingBox();assert.ok(hit.height>=44);}
 if(tasks===40&&zoom===1)await page.screenshot({path:path.join(out,'wilma-'+engineName+'-'+width+'.png'),fullPage:false});
 assert.deepEqual(errors,[]);evidence.push({engine:engineName,tasks,width,height,touch,zoom,geometry});await context.close();
}
}finally{await browser.close();}}}finally{await new Promise(r=>server.close(r));}
fs.writeFileSync(path.join(out,'wilma-layout.json'),JSON.stringify(evidence,null,2));console.log('Wilma geometry/focus/touch/zoom: '+evidence.length+' scenarios passed.');})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
