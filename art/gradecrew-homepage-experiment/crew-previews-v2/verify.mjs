import {writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const url='http://127.0.0.1:8779/';
const errors=[],external=[],failed=[];
const report={viewports:[],keyboard:false,manualReading:false,reducedMotion:false,externalRequests:[],errors:[]};
await mkdir('previews',{recursive:true});
async function setup(viewport,reducedMotion='no-preference'){
 const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failed.push(r.url()+' '+r.status());});
 await page.route('**/*',route=>{if(!route.request().url().startsWith(url)){external.push(route.request().url());return route.abort();}return route.continue();});
 await page.goto(url,{waitUntil:'networkidle'});
 return page;
}
async function noOverflow(page,label){
 const measurement=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,dialog:document.getElementById('gcHeroDialog').scrollWidth,dialogClient:document.getElementById('gcHeroDialog').clientWidth}));
 assert.ok(measurement.document<=measurement.width,label+' document overflow');
 if(await page.locator('#gcHeroDialog').isVisible())assert.ok(measurement.dialog<=measurement.dialogClient+1,label+' dialog overflow');
 return measurement;
}
async function snap(page,name){
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(550);
 await page.screenshot({path:'previews/'+name+'.png',fullPage:true});
}
for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['ipad',{width:820,height:1180}],['iphone',{width:390,height:844}]]){
 const page=await setup(viewport);
 const measure=await noOverflow(page,name);
 await snap(page,name+'-home');
 for(const crew of ['coco','remy','emmi','wilma']){
  await page.locator('.name-button[data-open="'+crew+'"]').click();
  assert.equal(await page.locator('#gcHeroDialog').getAttribute('data-phase'),'0');
  if(name==='desktop'&&crew==='remy'){
   await page.waitForTimeout(2300);
   assert.equal(await page.locator('#gcHeroDialog').getAttribute('data-phase'),'0');
   report.manualReading=true;
  }
  for(let phase=0;phase<3;phase++){
   await noOverflow(page,name+' '+crew+' '+phase);
   if(crew==='coco'||crew==='remy')await snap(page,name+'-'+crew+'-'+phase);
   if(phase<2)await page.locator('#gcHeroDemoNext').click();
  }
  assert.ok(await page.locator('#gcHeroDemoNext').isHidden());
  await page.locator('#gcHeroDemoPrev').click();
  assert.equal(await page.locator('#gcHeroDialog').getAttribute('data-phase'),'1');
  await page.locator('#gcHeroDemoReplay').click();
  assert.equal(await page.locator('#gcHeroDialog').getAttribute('data-phase'),'0');
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('#gcHeroDialog').isHidden());
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.open),crew);
 }
 await page.locator('[data-language=en]').click();
 for(const crew of ['coco','remy']){
  await page.locator('.name-button[data-open="'+crew+'"]').click();
  await page.locator('#gcHeroDemoNext').click();await page.locator('#gcHeroDemoNext').click();
  await noOverflow(page,name+' English '+crew);
  await snap(page,name+'-'+crew+'-en');
  assert.match(await page.locator('#gcHeroDialogTitle').innerText(),crew==='coco'?/Coco shows/:/Remy creates/);
  await page.keyboard.press('Escape');
 }
 await page.locator('#tutorialStart').click();
 assert.ok(await page.locator('#noticeDialog').isVisible());
 await page.locator('#noticeClose').click();
 await page.locator('#testcode').fill('K7M4X2PA');
 await page.locator('#joinForm button').click();
 assert.ok(await page.locator('#noticeDialog').isVisible());
 await page.locator('#noticeClose').click();
 await page.locator('#compareOpen').click();await snap(page,name+'-colour-comparison');await page.keyboard.press('Escape');
 report.viewports.push({name,...viewport,...measure});await page.close();
}
const keys=await setup({width:1280,height:900});
await keys.locator('.name-button[data-open=coco]').focus();await keys.keyboard.press('Space');
assert.ok(await keys.locator('#gcHeroDialog').isVisible());await keys.keyboard.press('Escape');
assert.equal(await keys.evaluate(()=>document.activeElement?.dataset.open),'coco');
await keys.keyboard.press('Enter');assert.ok(await keys.locator('#gcHeroDialog').isVisible());await keys.keyboard.press('Escape');report.keyboard=true;await keys.close();
const reduced=await setup({width:390,height:844},'reduce');await reduced.locator('.name-button[data-open=coco]').click();
assert.equal(await reduced.locator('#gcHeroDialog').getAttribute('data-phase'),'0');
assert.equal(await reduced.locator('.coco-phone').evaluate(el=>getComputedStyle(el).animationName),'none');
await reduced.locator('#gcHeroDemoNext').click();assert.equal(await reduced.locator('#gcHeroDialog').getAttribute('data-phase'),'1');
report.reducedMotion=true;await snap(reduced,'iphone-coco-reduced');await reduced.close();
report.externalRequests=external;report.errors=errors;report.failedResponses=failed;
assert.deepEqual(external,[]);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
await writeFile('previews/verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));await browser.close();
