// Real browser screenshot pixels, editing, IndexedDB retry and the actual synthetic server handlers.
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const {chromium, webkit} = require('playwright');
const evidence = process.env.GC_LAYOUT_EVIDENCE || '/tmp/gc-layout-evidence';
fs.mkdirSync(evidence, {recursive:true});
const root = path.resolve(__dirname, '../..');
const server = spawn(process.execPath, ['tools/ui/visual-feedback-preview.mjs'], {cwd:root, stdio:['ignore','pipe','pipe']});
async function ready() {
 await new Promise((resolve,reject) => {
  server.stdout.on('data', b => {if(String(b).includes('Synthetic visual feedback preview')) resolve();});
  server.once('exit', code => reject(Error('Preview exited '+code)));
  server.stderr.on('data', b => process.stderr.write(b));
  setTimeout(() => reject(Error('Preview timeout')),15000).unref();
 });
}
(async () => {
 try {
  await ready();
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]) {
   const browser = await engine.launch({headless:true});
   let page;
   try {
    page = await browser.newPage({viewport:name==='webkit'?{width:390,height:844}:{width:1280,height:800}});
    await page.goto('http://127.0.0.1:8781/');
    await page.locator('#sample').waitFor();
    await page.getByRole('button',{name:'Feedback geben – Bereich markieren',exact:true}).click();
    const bounds=await page.locator('#sample').boundingBox();
    const x=bounds.x+8,y=bounds.y+8;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+70,y+50,{steps:6});await page.mouse.up();
    await page.locator('.gcImageStage canvas').waitFor({state:'visible'});
    assert.equal(await page.locator('dialog select,dialog input[type=file],dialog details').count(),0);
    await page.getByLabel('Was ist dir aufgefallen?',{exact:true}).fill('Synthetic selected area: clipped control');
    // Wait for actual durable bytes, not a timer before reloading.
    let persistedDraft;
    for(let attempt=0;attempt<100;attempt++){
      persistedDraft=await page.evaluate(async()=>{const {createReviewStorage}=await import('/review-store.mjs');const d=await createReviewStorage().get('staging:preview-teacher:visual-draft');return {text:d?.text||'',bytes:d?.imageBytes?.byteLength||0};});
      if(persistedDraft.text==='Synthetic selected area: clipped control'&&persistedDraft.bytes>0)break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    assert.equal(persistedDraft.text,'Synthetic selected area: clipped control');
    assert.ok(persistedDraft.bytes>0,'image draft must be durably stored before reload');
    await page.reload();
    await page.getByLabel('Offline simulieren',{exact:true}).check();
    await page.getByRole('button',{name:'Feedback geben – Bereich markieren',exact:true}).click();
    await page.locator('.gcImageStage canvas').waitFor({state:'visible'});
    await page.getByRole('button',{name:'Feedback mit Bild senden',exact:true}).click();
    await page.getByText(/Lokal gesichert; Übertragung fehlgeschlagen/).waitFor();
    assert.equal(await page.locator('dialog[open]').count(),1);
    await page.getByRole('button',{name:'Abbrechen',exact:true}).click();
    await page.locator('dialog[open]').waitFor({state:'detached'});
    await page.getByLabel('Offline simulieren',{exact:true}).uncheck();
    await page.reload();
    await page.getByText('Onlinebestätigung des Bildhinweises erhalten.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Als Beispieladmin lesen',exact:true}).click();
    await page.getByRole('button',{name:'Screenshot anzeigen',exact:true}).last().click();
    const img = page.locator('#reports img').last();
    await img.waitFor();
    await img.evaluate(async image => {await image.decode();});
    const pixel = await img.evaluate(image => {
     const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
     c.getContext('2d').drawImage(image,0,0);
     return [...c.getContext('2d').getImageData(15,15,1,1).data];
    });
    assert.ok(pixel[0]>180&&pixel[1]<70&&pixel[2]<70,'selected red page pixels must survive automatic capture, reload, upload and authorized image read');
    await page.screenshot({path:path.join(evidence,`feedback-image-${name}.png`),fullPage:true});
    console.log(name+': page drag, automatic cropped image, comment, reload/offline retry and private Admin image PASS');
   } catch(error) {
    if(page) {await page.screenshot({path:path.join(evidence,`feedback-image-${name}-failure.png`),fullPage:true}).catch(()=>{});console.error((await page.locator('body').innerText()).slice(-4000));}
    throw error;
   } finally {await browser.close();}
  }
 } finally {server.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
