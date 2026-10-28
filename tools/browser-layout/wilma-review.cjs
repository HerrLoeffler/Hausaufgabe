const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),out=process.env.GC_LAYOUT_EVIDENCE||'/tmp/gc-layout-evidence';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,evidence=[];
try{for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch({headless:true});try{
for(const tasks of [20,40])for(const [width,height,touch,zoom] of [[320,740,true,1],[390,844,true,1],[768,1024,true,1],[1024,768,true,1],[1280,900,false,1],[1440,900,false,1],[1920,1080,false,1],[2560,1440,false,1],[1440,900,false,2]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/tools/browser-layout/wilma-review.html?tasks='+tasks);await page.locator('body[data-fixture-ready="true"]').waitFor();
 if(zoom!==1)await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
 const geometry=await page.evaluate(()=>{const strip=document.querySelector('.wilmaTaskTabs'),r=strip.getBoundingClientRect(),panel=document.querySelector('#wilmaAnswerReview').getBoundingClientRect();return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,panelLeft:panel.left,panelRight:panel.right,left:r.left,right:r.right,stripWidth:strip.clientWidth,stripScroll:strip.scrollWidth,overflow:getComputedStyle(strip).overflowX};});
 assert.ok(geometry.documentWidth<=width+1,JSON.stringify({tasks,width,zoom,geometry}));
 assert.ok(geometry.left>=geometry.panelLeft-1&&geometry.right<=geometry.panelRight+1,'Task strip must remain inside the centred panel, not only inside the viewport: '+JSON.stringify(geometry));
 assert.ok(geometry.stripScroll>geometry.stripWidth&&geometry.overflow==='auto','All excess task buttons must scroll locally: '+JSON.stringify(geometry));
 await page.locator('[data-question="q'+tasks+'"]').click();
 assert.equal(await page.locator('[data-question="q'+tasks+'"]').getAttribute('aria-pressed'),'true');
 const selected=await page.locator('[data-question="q'+tasks+'"]').boundingBox();const strip=await page.locator('.wilmaTaskTabs').boundingBox();assert.ok(selected.x>=strip.x-1&&selected.x+selected.width<=strip.x+strip.width+1,'Last task must actually be visible inside its strip');
 await page.locator('[data-question="q1"]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-question="q1"]').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Nächste offene Aufgabe',exact:true}).press('Enter');assert.equal(await page.locator('[data-question="q'+tasks+'"]').getAttribute('aria-pressed'),'true');
 if(touch){const hit=await page.locator('tr[data-submission="A"] [data-wilma="plus"]').boundingBox();assert.ok(hit.height>=44);}
 assert.deepEqual(errors,[]);evidence.push({engine:engineName,tasks,width,height,touch,zoom,geometry});
 if(tasks===40&&zoom===1&&[390,768,1920,2560].includes(width))await page.screenshot({path:path.join(out,'wilma-'+engineName+'-'+width+'.png'),fullPage:false});
 await context.close();
}
}finally{await browser.close();}}}finally{await new Promise(r=>server.close(r));}
fs.writeFileSync(path.join(out,'wilma-layout.json'),JSON.stringify(evidence,null,2));console.log('Wilma panel geometry/click/keyboard/touch/zoom: '+evidence.length+' scenarios passed.');})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
