// Real layout/interaction regression against the built site, with no account writes.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const sizes=[[320,568],[375,812],[390,844],[430,932],[744,1133],[768,1024],[820,1180],[1024,768],[1180,820],[1366,1024],[1280,720],[1440,900],[740,700],[1001,700],[844,390],[1920,1080],[2560,1316],[3440,1440]];
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gc-public-layout-'));
const repo=path.resolve(__dirname,'../..');
execFileSync(process.execPath,[path.join(repo,'tools/build-staging.mjs'),dir,'staging'],{stdio:'inherit',cwd:repo});
const root=path.join(dir,'public'),out=process.env.GC_LAYOUT_EVIDENCE||path.join(dir,'evidence');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const file=p===root?path.join(root,'index.html'):p;if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
function measure(){
 const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();
 const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
 const controls=['.brand','.student-entry','.language','.login','.register'].map(box),errors=[];
 if(document.documentElement.scrollWidth>innerWidth+1)errors.push('document horizontal overflow');
 controls.forEach((a,i)=>controls.slice(i+1).forEach(b=>{if(overlap(a,b))errors.push('header control overlap')}));
 for(const s of ['.student-entry','.login','.register','.public-links a']){for(const e of document.querySelectorAll(s))if(e.getBoundingClientRect().height<43)errors.push('small touch target '+s);}
 const nav=box('#overviewGrid'),q=box('.task.featured h4'),area=document.querySelector('#testScroll'),task=document.querySelector('.task.featured');
 if(q.top<nav.bottom-1)errors.push('question clipped by navigation');
 if(area.scrollHeight>area.clientHeight+2)errors.push('nested preview scrolling');
 if(task.scrollHeight>task.clientHeight+2)errors.push('nested task scrolling');
 if(box('.public-links').top<box('.showcase').bottom-1)errors.push('footer overlaps demo');
 if(box('.language').width>110)errors.push('language control too wide');
 if(innerWidth>=1900&&(box('.stage').width<Math.min(innerWidth*.7,1900)||box('.showcase').width<650))errors.push('large desktop composition too small');
 return {errors,width:innerWidth,height:innerHeight,demo:box('.showcase'),footer:box('.public-links')};
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;const evidence=[];
try{for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch({headless:true});const page=await browser.newPage({reducedMotion:'reduce'});
 try{await page.goto(url);await page.locator('#overviewGrid button').last().waitFor();await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 for(const [width,height] of sizes){await page.setViewportSize({width,height});const m=await page.evaluate(measure);assert.deepEqual(m.errors,[],`${name} ${width}x${height}: ${m.errors}`);evidence.push({engine:name,...m});
  if([390,1024,1366,2560].includes(width))await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});
  for(const a of await page.locator('.public-links a').all()){await a.scrollIntoViewIfNeeded();assert.equal(await a.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'footer hit target blocked');}
 }
 for(const width of [320,820,1366]){await page.setViewportSize({width,height:900});for(let i=0;i<10;i++){await page.locator('#overviewGrid button').nth(i).click();assert.deepEqual((await page.evaluate(measure)).errors,[],`${name} task${i+1} width${width}`);}}
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'EN',exact:true}).click();assert.deepEqual((await page.evaluate(measure)).errors,[],'English layout');
 await page.getByRole('button',{name:'DE',exact:true}).click();await page.locator('#overviewGrid button').first().click();
 const grid=page.locator('[data-grid="coordinate"]');await grid.focus();for(const k of ['ArrowLeft','ArrowLeft','ArrowUp'])await grid.press(k);await page.locator('[data-pointpick="B"]').click();await grid.focus();for(const k of ['ArrowRight','ArrowRight','ArrowUp','ArrowUp','ArrowUp'])await grid.press(k);
 assert.equal(await grid.locator('circle').count(),2,'coordinate interaction');await page.locator('#evaluateBtn').click();assert.equal(await page.locator('#resultsPanel').isVisible(),true,'grading');await page.locator('#resultsClose').click();
 for(const [selector,target] of [['.public-links a[href="/datenschutz.html"]','/datenschutz.html'],['.public-links a[href="/impressum.html"]','/impressum.html'],['.public-links a[href="/support.html"]','/support.html']]){await page.locator(selector).click();assert.equal(new URL(page.url()).pathname,target);assert.ok((await page.locator('body').innerText()).length>100);await page.goto(url);}

 function anchors(){const root=document.querySelector('[data-gc-public-page]');return Object.fromEntries(['.site-header .brand','.hero h1','.crew-photo','.showcase'].map(s=>{const r=root.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y+scrollY,width:r.width,height:s==='.showcase'?0:r.height,font:getComputedStyle(root.querySelector(s)).font,strong:root.querySelector(s+' strong')?getComputedStyle(root.querySelector(s+' strong')).font:''}];}));}
 const reference={};for(const width of [390,1024,2560]){await page.setViewportSize({width,height:width===2560?1316:900});await page.goto(url);await page.locator('#overviewGrid button').last().waitFor();await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));reference[width]=await page.evaluate(anchors);await page.screenshot({path:path.join(out,`${name}-frame-home-${width}.png`),fullPage:true});}
 // Account UI fixture: run the real entry module and CSS without starting Firebase or accounts.
 await page.route('**/startup.js*',route=>route.fulfill({contentType:'text/javascript',body:'/* UI-only fixture; no provider calls. */'}));
 for(const width of [390,1024,2560])for(const intent of ['login','register','reset']){
  await page.setViewportSize({width,height:width===2560?1316:900});
  await page.goto(url+'/workspace.html?intent='+intent);
  assert.equal(await page.locator('#authView > [hidden]').evaluate(e=>getComputedStyle(e).visibility),'hidden','cold paint guard');
  assert.equal(await page.locator('#authView > [role=status]').isVisible(),true,'neutral loader stays available');
  await page.evaluate(async()=>{const m=await import('/gradecrew-entry-flow.js');m.installGradeCrewEntryFlow();});
  assert.equal(await page.locator('#gcEntryStart').isVisible(),false,'retired hero must never appear behind an account screen');
  const section=page.locator('#gcEntry'+intent[0].toUpperCase()+intent.slice(1));
  await section.waitFor({state:'visible'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:path.join(out,`${name}-frame-${new URL(page.url()).searchParams.get("intent")||"student"}-${width}.png`),fullPage:true});const actual=await page.evaluate(anchors);for(const [selector,expected] of Object.entries(reference[width]))for(const k of ['x','y','width','height'])assert.ok(Math.abs(actual[selector][k]-expected[k])<2,`${name} ${intent} ${width} ${selector} ${k} moved: ${actual[selector][k]} vs ${expected[k]}; ${JSON.stringify(actual[selector])} vs ${JSON.stringify(expected)}`);
  assert.equal(await section.isVisible(),true,JSON.stringify(await section.evaluate(e=>{const out=[];for(let n=e;n;n=n.parentElement)out.push({id:n.id,hidden:n.hidden,display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility,rect:n.getBoundingClientRect().toJSON()});return out;})));
  assert.equal(await section.locator('h1').evaluate(e=>getComputedStyle(e).textAlign),'center','card title alignment');
  if(intent!=='reset'){await section.locator('[data-entry-back]').click();assert.equal(new URL(page.url()).pathname,'/','back to current homepage');}
 }

 // Code-free student UI with transport-only doubles; no account or assessment request.
 const student=fs.readFileSync(path.join(repo,'secure-student.js'),'utf8').replace(/^import .*;\n/gm,'');
 await page.route('**/secure-student.js*',route=>route.fulfill({contentType:'text/javascript',body:'import {mountPublicEntryShell,setPublicEntryShellVisible} from "/shared/public-entry-shell.mjs"; const initializeApp=()=>({}),firebaseConfig={},createSecureAssessmentClient=()=>({});\n'+student}));
 for(const width of [390,1024,2560]){await page.setViewportSize({width,height:width===2560?1316:900});await page.goto(url+'/secure-student.html?lang=de');await page.locator('#secureJoin').waitFor({state:'visible'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:path.join(out,`${name}-frame-${new URL(page.url()).searchParams.get("intent")||"student"}-${width}.png`),fullPage:true});const actual=await page.evaluate(anchors);for(const [selector,expected] of Object.entries(reference[width]))for(const k of ['x','y','width','height'])assert.ok(Math.abs(actual[selector][k]-expected[k])<2,`${name} student ${width} ${selector} ${k} moved: ${actual[selector][k]} vs ${expected[k]}`);}
 }finally{await browser.close();}}
 fs.writeFileSync(path.join(out,'layout-receipt.json'),JSON.stringify(evidence,null,2));console.log(`PASS ${evidence.length} WebKit/Chromium viewport layouts, 60 task layouts, DE/EN, coordinate/grading/legal clicks, account cold-paint guards and homepage returns`);
}finally{server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
