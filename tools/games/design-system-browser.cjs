const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');

(async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'gradecrew-design-browser.'));
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
        const type = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8' }[path.extname(file)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type':type }).end(data);
      } catch { res.writeHead(404).end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless:true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));

    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
      await page.goto(base + '/design-system/', { waitUntil:'networkidle' });
      assert.equal(await page.locator('.gcg-mode-card').count(), 3);
      assert.equal(await page.locator('.gcg-choice').count(), 5);
      assert.equal(await page.locator('.gcg-advanced').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-gcg-version')), '0.1.0');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `horizontal overflow at ${width}px`);

      const profileChoices = page.locator('.gcg-choice').filter({ has: page.locator('input[name="profile"]') });
      const secondChoice = profileChoices.nth(1);
      const secondInput = secondChoice.locator('input[name="profile"]');
      await secondChoice.click();
      assert.equal(await secondInput.isChecked(), true);
      assert.equal(await secondChoice.getAttribute('data-selected'), 'true');
    }
    assert.deepEqual(errors, []);
    console.log('Games Design System browser smoke passed: desktop/tablet/mobile, user-clickable choices, disclosure and no horizontal overflow.');
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    await fs.rm(tmp, { recursive:true, force:true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
