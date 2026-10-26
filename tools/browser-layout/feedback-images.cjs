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
    await page.getByRole('button',{name:'Exportpixel prüfen',exact:true}).click();
    await page.getByText(/Pixelprüfung bestanden/).waitFor();
    // This is a genuine browser screenshot of a synthetic page, not DOM reconstruction.
    const screenshot = await page.screenshot();
    await page.getByRole('button',{name:'Feedback mit Screenshot geben',exact:true}).click();
    await page.locator('dialog[open]').waitFor({timeout:20000});
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button',{name:'Screenshot beifügen',exact:true}).click();
    await (await chooserPromise).setFiles({name:'synthetic-browser-screenshot.png',mimeType:'image/png',buffer:screenshot});
    await page.getByText('Bild beigefügt. Bitte private Inhalte vor dem Senden schwärzen.',{exact:true}).waitFor();
    await page.locator('.gcImageStage canvas').waitFor({state:'visible'});
    await page.getByText('Bildbereich per Tastatur bearbeiten',{exact:true}).click();
    for(const [label,value] of [['Links (Pixel)','0'],['Oben (Pixel)','0'],['Breite (Pixel)','300'],['Höhe (Pixel)','200']]) {
     await page.getByLabel(label,{exact:true}).fill(value);
    }
    await page.getByRole('button',{name:'Bereich anwenden',exact:true}).click();
    await page.getByText('Bereich dauerhaft geschwärzt.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Entwurf sichern und schließen',exact:true}).click();
    await page.locator('dialog[open]').waitFor({state:'detached'});
    await page.reload();
    await page.getByLabel('Offline simulieren',{exact:true}).check();
    await page.getByRole('button',{name:'Feedback mit Screenshot geben',exact:true}).click();
    await page.locator('.gcImageStage canvas').waitFor({state:'visible'});
    await page.getByLabel('Was ist dir aufgefallen?',{exact:true}).fill('Synthetic browser screenshot: clipped control');
    await page.getByRole('button',{name:'Feedback mit Bild senden',exact:true}).click();
    await page.getByText(/Lokal gesichert; Übertragung fehlgeschlagen/).waitFor();
    assert.equal(await page.locator('dialog[open]').count(),1);
    await page.getByRole('button',{name:'Entwurf sichern und schließen',exact:true}).click();
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
     return [...c.getContext('2d').getImageData(100,100,1,1).data];
    });
    assert.ok(pixel.slice(0,3).every(v=>v<15),'redaction must survive real screenshot file, reload, upload, normalization and authorized read');
    await page.screenshot({path:path.join(evidence,`feedback-image-${name}.png`),fullPage:true});
    console.log(name+': actual screenshot file, final-pixel redaction, reload/offline retry, receipt and private Admin raster PASS');
   } catch(error) {
    if(page) {await page.screenshot({path:path.join(evidence,`feedback-image-${name}-failure.png`),fullPage:true}).catch(()=>{});console.error((await page.locator('body').innerText()).slice(-4000));}
    throw error;
   } finally {await browser.close();}
  }
 } finally {server.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
