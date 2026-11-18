// Local synthetic rows, real result rendering, manual form and production CSS.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=process.env.GC_LAYOUT_EVIDENCE||'/tmp/gc-teacher-results-20261118';fs.mkdirSync(out,{recursive:true});
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fn=name=>{const start=app.indexOf('function '+name+'(');return app.slice(start,app.indexOf('\n}',start)+2);};
const links=[...index.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>m[0]).join('\n');
const results=index.slice(index.indexOf('<section id="resultsView"'),index.indexOf('<section id="templateView"')).replace('view hidden','view');
const fixture=`import * as summary from '/teacher-grading-summary.mjs';import {reviewItem} from '/wilma-answer-review.mjs';import {canonicalDecisionState,canonicalJson,decisionQuestionSnapshot} from '/wilma-decision-state.mjs';
Object.assign(window,summary,{reviewItem,canonicalDecisionState,canonicalJson,decisionQuestionSnapshot});
window.$=id=>document.getElementById(id);window.escapeHtml=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');window.round1=v=>Math.round(v*10)/10;window.parseGaps=()=>[];window.answerDisplay=(q,a)=>a||'';window.correctDisplay=()=> 'Eine lange fachliche Musterantwort '.repeat(20);window.getQuestionImageSrc=()=> 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200"><rect width="2400" height="1200" fill="lightblue"/></svg>';window.getQuizScale=()=>({thresholds:[91,77,57,39,25,0]});window.gradeFromPercent=(p,s)=>s.thresholds.findIndex(t=>p>=t)+1;window.scrollBehavior=()=>'auto';window.crewTour=null;window.guestTourRepo=null;window.wilmaAnswerReview=null;window.wilmaAutoReview=null;window.toast=()=>{};
window.state={currentResultsQuiz:{id:'fiction',title:'Fiktive Antworten',ownerId:'owner'},user:{uid:'owner'},resultQuestions:[{id:'q',text:'Eine ausführliche Aufgabenstellung '.repeat(25),type:'text',points:4,manualReview:true}],submissions:['Anna Müller','Zoe van der Meer','AB',...Array.from({length:27},(_,i)=>'Fiktiv '+String(i+1).padStart(2,'0'))].map((name,i)=>({id:'s'+i,studentName:name,...i<2?{studentFirstName:i?'Zoe':'Anna',studentLastName:i?'van der Meer':'Müller'}:{},answers:{q:'AntwortMitEinemSehrLangenWort'.repeat(50)+' Eine ausführliche Antwort. '.repeat(60)},grading:{q:{awardedPoints:i,maxPoints:4,needsReview:i!==0,reviewState:i===0?'confirmed':'open'}},status:i?'review':'graded',totalPoints:i,maxPoints:4,percent:i*25,elapsedSeconds:i===2?null:i*60,submittedAtLocal:'2026-11-18T09:30:00Z'}))};
${['toMillis','fmtDate','formatDuration','submissionGrade','confirmDiscardInlineReview','resetInlineReview','placeInlineReview','renderResultsTable','openReview'].map(fn).join('\n')}
renderResultsTable();document.body.dataset.ready='true';`;
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiktive Lehrkraftbewertung</title>${links}<header class="topbar"><strong>GradeCrew</strong></header><main class="shell">${results}</main><script type="module" src="/fixture-results.mjs"></script></html>`;
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/fixture'){res.setHeader('Content-Type','text/html');res.end(html);return;}if(pathname==='/fixture-results.mjs'){res.setHeader('Content-Type','text/javascript');res.end(fixture);return;}const file=path.resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(file));});
const geometry=()=>{const panel=document.getElementById('reviewPanel'),r=panel.getBoundingClientRect();return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,panel:{left:r.left,right:r.right,width:r.width},position:getComputedStyle(panel).position,containerWidth:document.getElementById('resultsTableWrap').clientWidth*(document.getElementById('resultsTableWrap').getBoundingClientRect().width/document.getElementById('resultsTableWrap').offsetWidth),tableMinWidth:getComputedStyle(document.querySelector('.resultTable')).minWidth};};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port,evidence=[];
try{for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch({headless:true});try{for(const [width,height] of [[390,844],[820,1180],[1180,820]])for(const zoom of [1,2]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'/fixture');await page.locator('body[data-ready=true]').waitFor();
 if(zoom!==1)await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
 assert.equal(await page.locator('.resultTable').evaluate(el=>getComputedStyle(el).display),'table');
 assert.equal(await page.locator('.resultTable thead').evaluate(el=>getComputedStyle(el).position),'static');
 assert.equal(await page.locator('.resultTable tbody>tr').count(),30);
 assert.equal(await page.locator('#resultsSort,#resultsSortDirection,.resultsToolbar').count(),0);
 assert.ok(await page.locator('.resultTable tbody>tr').first().evaluate(el=>el.getBoundingClientRect().height)<=70*zoom,'One compact row per pupil');
 await page.locator('[data-results-sort=firstName]').click();assert.equal(await page.locator('.reviewBtn').first().getAttribute('data-id'),'s2');
 await page.locator('[data-results-sort=firstName]').click();assert.equal(await page.locator('.reviewBtn').first().getAttribute('data-id'),'s1');
 await page.locator('[data-results-sort=duration]').click();assert.equal(await page.locator('.reviewBtn').first().getAttribute('data-id'),'s0');
 await page.locator('[data-results-sort=duration]').click();assert.equal(await page.locator('.reviewBtn').first().getAttribute('data-id'),'s29');
 // Return to the name column; the reading table itself remains horizontally scrollable on phones.
 await page.locator('[data-results-sort=firstName]').click();await page.locator('.resultTable tbody>tr').first().scrollIntoViewIfNeeded();

 await page.locator('.resultTable thead').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,name+'-'+width+'-zoom'+zoom+'-overview.png'),fullPage:false});
 await page.locator('.reviewBtn[data-id=s1]').click();await page.locator('#reviewHeading').waitFor();const geo=await page.evaluate(geometry);
 assert.ok(geo.documentWidth<=width+1,JSON.stringify({name,width,zoom,geo}));assert.ok(geo.panel.left>=-1&&geo.panel.right<=width+1,JSON.stringify(geo));
 if(width/zoom<=900)assert.ok(geo.panel.width>=geo.containerWidth-3,'Sheet uses its available card width: '+JSON.stringify({name,width,zoom,geo}));
 await page.locator('.manualPoints').fill('2.5');await page.locator('.manualPoints').focus();assert.equal(await page.locator('.manualPoints').evaluate(el=>getComputedStyle(el).fontSize),'16px');
 // Short viewport emulates keyboard space while preserving the actual form and input.
 await page.setViewportSize({width,height:Math.max(320,Math.round(height*.55))});await page.locator('.manualPoints').scrollIntoViewIfNeeded();assert.equal(await page.locator('.manualPoints').inputValue(),'2.5');await page.locator('#saveReview').scrollIntoViewIfNeeded();assert.ok(await page.locator('#saveReview').isVisible());
 const smallGeo=await page.evaluate(geometry);assert.ok(smallGeo.documentWidth<=width+1,JSON.stringify(smallGeo));
 await page.setViewportSize({width,height});await page.locator('#reviewHeading').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,name+'-'+width+'-zoom'+zoom+'.png'),fullPage:false});
 await page.locator('#closeReview').click();assert.equal(await page.locator('.submissionReviewRow').count(),0);assert.deepEqual(errors,[]);evidence.push({engine:name,width,height,zoom,geometry:geo,keyboardGeometry:smallGeo});await context.close();
}}finally{await browser.close();}}}finally{await new Promise(r=>server.close(r));}
fs.writeFileSync(path.join(out,'teacher-results-layout.json'),JSON.stringify(evidence,null,2));console.log('Teacher results/manual grading: '+evidence.length+' browser scenarios passed.');})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
