import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.GRADECREW_PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('content-type',file.endsWith('.mjs')||file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:760,height:1000},hasTouch:true});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/visual/visual.css`);
 // Exercise adapter in an isolated DOM without authentication or remote services.
 await page.setContent('<main id="questions"></main>');
 await page.addStyleTag({path:path.join(root,'visual/visual.css')});
 for(const file of ['legacy-core.js','core.js','renderers.js'])await page.addScriptTag({path:path.join(root,'visual',file)});
 const url=`http://127.0.0.1:${server.address().port}/visual-tasks.mjs`;
 await page.evaluate(async(url)=>{window.V=await import(url);for(const format of V.VISUAL_FORMATS){const task=GC2.publicTask(GC2.example(format));const section=document.createElement('section');section.id='test-'+format;document.querySelector('main').append(section);V.mountVisualQuestion(section,{type:'visual',visualTask:JSON.stringify(task)});}},url);
 assert.equal(await page.locator('.gc-visual').count(),12);
 // Clone the production editor template and select a loaded generated visual task.
 const sourceHtml=await fs.readFile(path.join(root,'index.html'),'utf8');
 const questionTemplate=sourceHtml.match(/<template id="questionTemplate">([^]*?)<\/template>/)[1];
 const editorSelection=await page.evaluate(templateHtml=>{
   const template=document.createElement('template');template.innerHTML=templateHtml;
   const card=template.content.cloneNode(true),select=card.querySelector('.qType');
   const generated={type:'visual',visualTask:JSON.stringify(GC2.example('grid'))};
   select.value=generated.type;
   return {value:select.value,label:select.selectedOptions[0]?.textContent,visualOptions:[...select.options].filter(option=>option.value==='visual').length};
 },questionTemplate);
 assert.deepEqual(editorSelection,{value:'visual',label:'Visuelle Interaktion',visualOptions:1});

 await page.locator('#test-grid [data-cell]').nth(0).tap();
 assert.deepEqual(await page.evaluate(()=>V.collectVisualAnswer(document.querySelector('#test-grid'))),[0]);
 // Instrument controls never populate the response or expose sought angle as text.
 const instrument=page.locator('#test-angle [data-instrument]');
 const original=await instrument.getAttribute('transform');
 await instrument.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Shift+ArrowRight');
 assert.notEqual(await instrument.getAttribute('transform'),original);
 assert.equal(await page.locator('#test-angle [data-answer-number]').inputValue(),'');
 await page.locator('#test-angle [data-instrument-axis="x"]').fill('25');
 await page.locator('#test-angle [data-instrument-axis="x"]').dispatchEvent('input');
 assert.match(await instrument.getAttribute('transform'),/translate\(25 /);
 const beforeDrag=await instrument.getAttribute('transform');
 const svg=await page.locator('#test-angle svg').boundingBox();
 await page.evaluate(({x,y})=>{const tool=document.querySelector('#test-angle [data-instrument]');tool.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:x,clientY:y,pointerType:'touch'}));document.dispatchEvent(new PointerEvent('pointermove',{clientX:x+35,clientY:y+10,pointerType:'touch'}));document.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch'}));},{x:svg.x+svg.width/2,y:svg.y+svg.height/2});
 assert.notEqual(await instrument.getAttribute('transform'),beforeDrag);
 assert.equal(await page.locator('#test-angle [data-answer-number]').inputValue(),'');
 await page.locator('#test-angle [data-answer-number]').fill('70');
 assert.equal(await page.evaluate(()=>V.collectVisualAnswer(document.querySelector('#test-angle'))),'70');
 // Touch and native keyboard controls can reach coordinate/chart answers.
 await page.locator('#test-coordinate [data-coord="0"][data-axis="x"]').fill('3');
 await page.locator('#test-coordinate [data-coord="0"][data-axis="x"]').dispatchEvent('change');
 await page.locator('#test-coordinate [data-coord="0"][data-axis="y"]').fill('-2');
 await page.locator('#test-coordinate [data-coord="0"][data-axis="y"]').dispatchEvent('change');
 assert.deepEqual(await page.evaluate(()=>V.collectVisualAnswer(document.querySelector('#test-coordinate'))),[{x:3,y:-2}]);
 assert.deepEqual(errors,[]);
 console.log('Browser smoke passed: 12 public formats, touch selection, movable/rotatable protractor, keyboard controls and native answer collection.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
