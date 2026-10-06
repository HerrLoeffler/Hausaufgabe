const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const results = [];
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      for (const lang of ['de', 'en']) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`http://127.0.0.1:8768/?lang=${lang}`);
        await page.locator('.scene').evaluate(img => img.decode());
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        const layout = await page.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}; };
          return { overflow: document.documentElement.scrollWidth > innerWidth, hero:rect('.hero'), title:rect('.welcome-copy'), roles:rect('.crew-roles'), actions:rect('.entry-actions'), join:rect('.join'), images:[...document.images].every(i=>i.complete && i.naturalWidth>0), missing:[...document.querySelectorAll('[data-copy]')].filter(el=>!window.GRADECREW_COPY[document.documentElement.lang][el.dataset.copy]).length };
        });
        assert.equal(layout.overflow, false, `${width}/${lang}: horizontal overflow`);
        assert.equal(layout.images, true);
        assert.equal(layout.missing, 0);
        assert.ok(layout.title.bottom < layout.roles.top, `${width}/${lang}: title covers crew labels`);
        assert.ok(layout.roles.bottom <= layout.actions.top, `${width}/${lang}: labels overlap buttons`);
        assert.ok(layout.actions.bottom <= layout.join.top, `${width}/${lang}: buttons overlap code form`);
        assert.ok(layout.join.bottom <= layout.hero.bottom, `${width}/${lang}: form extends beyond scene`);
        results.push(`${width}px ${lang}: translated DOM, loaded assets, no overflow or UI overlap`);
        if ([390,1440].includes(width)) await page.screenshot({ path:`evidence/${width===390?'mobile':'desktop'}-${lang}.png`, fullPage:true });
      }
    }
    await page.selectOption('#language', 'de');
    assert.equal(await page.locator('h1').innerText(), 'Hi! Ich bin Coco.\nWillkommen bei GradeCrew.');
    await page.selectOption('#language', 'en');
    assert.equal(await page.locator('#testCode').getAttribute('placeholder'), 'Enter test code');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page.locator('[data-dialog="features"]').click();
    assert.equal(await page.locator('#detailTitle').innerText(), 'From first draft to clear results.');
    await page.keyboard.press('Escape');
    await page.locator('.entry-actions [data-dialog="tutorial"]').click();
    assert.equal(await page.locator('#detailTitle').innerText(), 'Remy helps you create.');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#detail').evaluate(d=>d.open), false);
    assert.equal(await page.locator('.entry-actions [data-dialog="tutorial"]').evaluate(el=>el===document.activeElement), true);
    await page.locator('#testCode').fill('DEMO42');
    await page.locator('.code-submit').click();
    assert.equal(await page.locator('#detailTitle').innerText(), 'Test access');
    assert.match(await page.locator('#detailBody').innerText(), /not connected/);
    await page.keyboard.press('Escape');
    results.push('Locale switch + persistence, translated placeholder/dialogs, keyboard close + focus return, honest code-preview behaviour');
    // Copy is data: changing it does not require regenerating artwork or changing markup.
    await page.evaluate(()=>{window.GRADECREW_COPY.en.meetCrew='Meet your classroom crew';window.GRADECREW_COPY.en.enterCode='Enter the code from your teacher.';document.querySelector('#language').dispatchEvent(new Event('change'));});
    assert.equal(await page.locator('.entry-actions [data-dialog="tutorial"]').innerText(), 'Meet your classroom crew\n→');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth), false);
    results.push('Longer editable copy applied through catalog without image regeneration');
    assert.deepEqual(errors, []);
    fs.writeFileSync('evidence/verification.json',JSON.stringify({testedAt:new Date().toISOString(),browser:await browser.version(),results,errors,scope:'Isolated static screen; no authentication, real test joining, device or deployment verification.'},null,2));
    console.log(JSON.stringify({passed:results.length,errors},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
