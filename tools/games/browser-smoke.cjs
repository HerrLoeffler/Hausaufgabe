// Optional browser smoke check; requires Playwright and Chromium.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
(async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'gradecrew-browser-smoke.'));
  let browser, server;
  try {
    execFileSync(process.execPath, [path.join(root, 'tools/build-lab-games-hub.mjs'), tmp]);
    const publicDir = path.join(tmp, 'public');
    server = http.createServer(async (req, res) => {
      const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = path.resolve(publicDir, '.' + requestPath);
      if (file !== publicDir && !file.startsWith(publicDir + path.sep)) return res.writeHead(403).end();
      if (requestPath.endsWith('/')) file = path.join(file, 'index.html');
      try {
        const data = await fs.readFile(file);
        const type = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json' }[path.extname(file)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type':type }).end(data);
      } catch { res.writeHead(404).end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({
      headless:true,
      ...(process.env.GRADECREW_CHROMIUM_PATH ? { executablePath:process.env.GRADECREW_CHROMIUM_PATH, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] } : {})
    });
    const context = await browser.newContext();
    const errors = [], requests = [];
    await context.route('https://**/*', async route => {
      const url = route.request().url();
      if (url.includes('cloudfunctions.net')) {
        const headers = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Allow-Methods':'POST, OPTIONS' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({status:204,headers});
        const body = route.request().postDataJSON();
        requests.push(body);
        let data = { leaderboard:[], entries:[] };
        if (body.action === 'createRoom') data = { code:'001234', hostToken:'fixture-host', config:body.payload.config };
        if (body.action === 'roomState') data = { status:'waiting', players:[], leaderboard:[] };
        await route.fulfill({status:200, headers, contentType:'application/json', body:JSON.stringify({ok:true, data})});
      } else if (url.includes('qrcode.min.js')) {
        await route.fulfill({status:200, contentType:'text/javascript', body:'window.QRCode=Object.assign(function(){},{CorrectLevel:{M:0}});'});
      } else await route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    const visible = async id => {
      await page.locator('#'+id).waitFor({state:'visible',timeout:10000});
      assert.equal(await page.locator('#'+id).isVisible(),true,id+' should be visible');
    };
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({width, height:width===390?844:1024});
      await page.goto(base+'/', {waitUntil:'networkidle'});
      assert.equal(await page.locator('.gameCard').count(),4);
      assert.equal(await page.locator('#joinGame option[value="escape-room"]').count(),0);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.locator('[data-subject="german"]').click();
      assert.equal(await page.locator('.gameCard').count(),1);
      await page.locator('[data-subject="all"]').click();
      await page.locator('#gameSearch').fill('Runden');
      assert.equal(await page.locator('.gameCard').count(),1);
      await page.locator('#gameSearch').fill('');
      if (process.env.GRADECREW_QA_DIR) {
        await page.goto(base+'/', {waitUntil:'networkidle'});
        await fs.mkdir(process.env.GRADECREW_QA_DIR,{recursive:true});
        await page.screenshot({path:path.join(process.env.GRADECREW_QA_DIR,'hub-'+width+'-start.png'),fullPage:true});
      }
    }
    await page.setViewportSize({width:1280,height:900});
    for (const game of ['fast-quiz','fehlerjagd-deutsch','vocab-rush']) {
      for (const mode of ['practice','highscore','live']) {
        const gameView = game==='fast-quiz'?'quizView':'gameView';
        const teacherView = game==='fast-quiz'?'teacherRoomView':'teacherView';
        await page.goto(base+'/'+game+'/?mode='+mode,{waitUntil:'networkidle'});
        await visible(mode==='highscore'?'highscoreView':'setupView');
        assert.equal(await page.locator('#homeView').isVisible(),false);
        assert.equal(await page.locator('.gc-games-nav').count(),1);
        assert.equal(await page.evaluate(()=>location.search),'');
        if (mode==='highscore') assert.ok(requests.some(r=>['leaderboard','highscoreBoard'].includes(r.action)));
        if (mode==='practice') {
          await page.locator('#setupSubmit').click();
          await visible(gameView);
          const answer = page.locator(game==='fast-quiz'?'.answerButton':'.answerBtn').first();
          if (await answer.count()) await answer.click();
          await page.locator('.gc-games-home').click();
          await visible('gcLeaveDialog');
          await page.locator('#gcLeaveDialog button[value="stay"]').click();
          await visible(gameView);
          await page.locator('.gc-games-home').click();
          await page.locator('#gcLeaveDialog button[value="leave"]').click();
          await page.waitForURL(base+'/?mode=practice');
          assert.equal(await page.locator('.gameCard').count(),4);
        }
        if (mode==='live') {
          await page.locator('#setupSubmit').click();
          await visible(teacherView);
          await page.locator('.gc-games-home').click();
          await visible('gcLeaveDialog');
          assert.match(await page.locator('#gcLeaveDialog p').innerText(),/nicht beendet/);
          await page.locator('#gcLeaveDialog button[value="stay"]').click();
        }
        console.log(game+' / '+mode+' passed');
      }
      await page.goto(base+'/');
      await page.locator('#joinGame').selectOption(game);
      await page.locator('#joinCode').fill('001234');
      await page.locator('#joinForm button').click();
      await page.waitForURL(base+'/'+game+'/?join=001234');
      await visible('joinView');
      assert.equal(await page.locator('#joinCode').inputValue(),'001234');
      await page.goto(base+'/'+game+'/?join=001234&mode=live',{waitUntil:'networkidle'});
      await visible('joinView');
      assert.equal(await page.locator('#setupView').isVisible(),false);
      await page.locator('.gc-games-home').click();
      await page.waitForURL(base+'/?mode=live');
      assert.equal(await page.locator('[name="hub-mode"][value="live"]').isChecked(),true);
    }

    await page.goto(base+'/escape-room/?mode=practice',{waitUntil:'networkidle'});
    await visible('gameView');
    assert.equal(await page.locator('#homeView').isVisible(),false);
    assert.equal(await page.locator('.gc-games-nav').count(),1);
    assert.equal(await page.locator('#teacherPreviewBtn').count(),1);
    assert.equal(await page.evaluate(()=>location.search),'');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    console.log('escape-room / practice passed');

    await page.goto(base+'/');
    await page.locator('[data-game="vocab-rush"] .favoriteButton').click();
    await page.reload();
    assert.equal(await page.locator('[data-game="vocab-rush"] .favoriteButton').getAttribute('aria-pressed'),'true');
    await page.locator('#favoritesOnly').click();
    assert.equal(await page.locator('.gameCard').count(),1);
    const noJs = await browser.newContext({javaScriptEnabled:false});
    const fallback = await noJs.newPage();
    await fallback.goto(base+'/');
    assert.equal(await fallback.locator('.fallback a').count(),4);
    assert.equal(await fallback.locator('#joinForm').isVisible(),false);
    await noJs.close();
    assert.deepEqual(errors,[]);
    console.log('Browser smoke passed: desktop/tablet/mobile, nine legacy modes + Escape practice, central join, QR precedence, leave dialog and favorites. Backend and external QR library mocked.');
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve=>server.close(resolve));
    await fs.rm(tmp,{recursive:true,force:true});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
