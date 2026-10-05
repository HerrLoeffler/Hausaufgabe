// Trusted local browser probe: no Firebase identity, provider key or real API.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
(async () => {
  const publicDir = path.resolve(process.argv[2]);
  const errors = [], remote = [];
  const server = http.createServer(async (req,res) => {
    const name = new URL(req.url,'http://localhost').pathname;
    const file = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/styles.css':'styles.css'}[name];
    if (!file) return res.writeHead(404).end();
    try {
      const mime = {'index.html':'text/html','app.js':'text/javascript','styles.css':'text/css'}[file];
      res.writeHead(200,{'Content-Type':mime+'; charset=utf-8',
        'Content-Security-Policy':"default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'"});
      res.end(await fs.readFile(path.join(publicDir,file)));
    } catch {res.writeHead(404).end();}
  });
  let browser;
  try {
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const origin = 'http://127.0.0.1:'+server.address().port;
    browser = await chromium.launch({headless:true,
      ...(process.env.GRADECREW_CHROMIUM_PATH?{executablePath:process.env.GRADECREW_CHROMIUM_PATH}: {})});
    const context = await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
    await context.route('**/*',route=> {
      if (new URL(route.request().url()).origin!==origin) {remote.push(route.request().url());return route.abort();}
      return route.continue();
    });
    const page = await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(origin+'/?seed=1',{waitUntil:'networkidle'});
    assert.match(await page.locator('#sceneTitle').innerText(),/Expeditionscamp/);
    const canvas = page.locator('#gameCanvas'), box = await canvas.boundingBox();
    await canvas.click({position:{x:box.width*150/960,y:box.height*150/600}});
    await page.waitForFunction(()=>!document.getElementById('interactionPrompt').hidden,{},{timeout:10000});
    await page.locator('#touchInteractBtn').click();
    await page.locator('#learningDialog').waitFor({state:'visible'});
    await page.locator('#hintBtn').click();
    assert.match(await page.locator('#learningFeedback').innerText(),/Coco-Tipp/);
    const answers = page.locator('#learningOptions label');
    const values = await answers.allTextContents();
    // Seed 1's first tank is 80l; 25% = 20l. Use a known wrong answer.
    const wrong = values.findIndex(x=>x.trim()!=='20');assert.ok(wrong>=0);
    await answers.nth(wrong).click();await page.locator('#learningForm button[type=submit]').click();
    assert.match(await page.locator('#learningFeedback').innerText(),/Noch nicht/);
    await page.locator('#learningForm button[type=submit]').click();
    assert.equal(await page.locator('#learningForm button[type=submit]').isDisabled(),true);
    await page.waitForFunction(()=>document.getElementById('learningTitle').textContent==='Lernweg · Anwenden',{},{timeout:10000});
    assert.equal(await page.locator('#learningForm button[type=submit]').isDisabled(),false);
    assert.equal(await answers.count(),4);
    assert.deepEqual(remote,[],'No non-local request is allowed');
    assert.deepEqual(errors,[],'No browser runtime errors');
    console.log('Games browser smoke passed: Camp, hint, duplicate-submit lock and transfer; human acceptance remains open.');
  } finally {if(browser)await browser.close(); await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
