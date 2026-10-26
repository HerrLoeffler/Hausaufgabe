const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('secure-student.html', 'utf8');
const css = fs.readFileSync('secure-student.css', 'utf8');
const source = fs.readFileSync('secure-student-navigation.mjs', 'utf8').replace('export function', 'function').replace("if (typeof document !== 'undefined') mountSecureQuestionNavigation();", '');
function fixture() {
  const dom = new JSDOM(html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ''), { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  let headerHeight = 82, top = [200, 700, 1200];
  d.querySelector('.secureTopbar').getBoundingClientRect = () => ({ height: headerHeight, bottom: headerHeight });
  const nav = d.getElementById('secureQuestionNavigation');
  nav.getBoundingClientRect = () => ({ height: 58, bottom: headerHeight + 58 });
  const qs = d.getElementById('secureQuestions');
  qs.innerHTML = [0, 1, 2].map(i => `<section class="secureQuestion" data-qid="q${i}"><input value="answer${i}"></section>`).join('');
  [...qs.children].forEach((s, i) => { s.getBoundingClientRect = () => ({ top: top[i] }); s.scrollIntoView = () => { top = top.map((v, j) => 150 + (j - i) * 500); }; });
  d.getElementById('secureAssessment').classList.remove('hidden');
  w.eval(source + '\nwindow.cleanup = mountSecureQuestionNavigation(document, window);');
  return { w, d, nav, resize(h) { headerHeight = h; w.dispatchEvent(new w.Event('resize')); }, scroll() { top = [-850, -350, 150]; w.dispatchEvent(new w.Event('scroll')); }, flush: () => new Promise(r => w.requestAnimationFrame(r)), close() { w.cleanup(); w.close(); } };
}
test('submission is ordinary flow after every question, never sticky/fixed', () => {
  assert.match(css, /\.secureSubmit\{[^}]*position:static/);
  assert.doesNotMatch(css, /\.secureSubmit\{[^}]*(?:position:(?:sticky|fixed)|bottom:)/);
  assert.ok(html.indexOf('id="secureQuestions"') < html.indexOf('class="secureSubmit secureCard"'));
  assert.match(html, /id="secureSubmitBtn"[^>]*type="submit"/);
  assert.doesNotMatch(html, /secureSubmitBtn[^>]*disabled/);
});
test('real local GC logo is shared by loading/join/running/receipt states and included in build', () => {
  const manifest = JSON.parse(fs.readFileSync('shared/gradecrew-design/assets.json', 'utf8'));
  const logo = new JSDOM(html).window.document.querySelector('img.secureBrandMark');
  assert.equal(logo.getAttribute('src'), `./${manifest.root}/${manifest.brand.icon}`);
  assert.equal(logo.getAttribute('alt'), 'GradeCrew Logo');
  assert.ok(fs.existsSync(`${manifest.root}/${manifest.brand.icon}`));
  const build = fs.readFileSync('tools/build-staging.mjs', 'utf8');
  assert.match(build, /name\.endsWith\('\.svg'\)/);
  assert.ok(build.includes("'secure-student-navigation.mjs'"));
  assert.ok(html.indexOf('secureBrandMark') < html.indexOf('<main'));
});
test('navigation follows current question without changing answers; overview and keyboard jumps focus target', async () => {
  const f = fixture();
  try {
    await f.flush();
    assert.equal(f.nav.hidden, false);
    assert.equal(f.nav.querySelector('strong').textContent, 'Aufgabe 1 von 3');
    assert.equal(f.nav.querySelector('[data-secure-previous]').disabled, true);
    f.nav.querySelector('[data-secure-next]').click();
    assert.equal(f.d.activeElement.dataset.qid, 'q1');
    assert.equal(f.nav.querySelector('strong').textContent, 'Aufgabe 2 von 3');
    const toggle = f.nav.querySelector('[data-secure-overview-toggle]');
    toggle.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    f.d.getElementById('secureQuestionOverview').querySelectorAll('button')[2].click();
    assert.equal(f.d.activeElement.dataset.qid, 'q2');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    toggle.click();
    toggle.dispatchEvent(new f.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(f.d.activeElement, toggle);
    f.scroll(); await f.flush();
    assert.equal(f.nav.querySelector('strong').textContent, 'Aufgabe 3 von 3');
    assert.equal(f.nav.querySelector('[data-secure-next]').disabled, true);
    assert.deepEqual([...f.d.querySelectorAll('#secureQuestions input')].map(i => i.value), ['answer0', 'answer1', 'answer2']);
  } finally { f.close(); }
});
test('last question stays current when document end limits scrolling', async () => {
  const f = fixture();
  try {
    await f.flush();
    Object.defineProperty(f.d.documentElement, 'scrollHeight', { value: 2000 });
    Object.defineProperty(f.w, 'scrollY', { value: 2000 - f.w.innerHeight });
    f.w.dispatchEvent(new f.w.Event('scroll')); await f.flush();
    assert.equal(f.nav.querySelector('strong').textContent, 'Aufgabe 3 von 3');
    assert.equal(f.nav.querySelector('[data-secure-next]').disabled, true);
  } finally { f.close(); }
});
test('sticky offset follows responsive header size; nav is outside frozen form and inside running view only', async () => {
  const f = fixture();
  try {
    await f.flush();
    assert.equal(f.d.documentElement.style.getPropertyValue('--secure-header-height'), '82px');
    f.resize(123); await f.flush();
    assert.equal(f.d.documentElement.style.getPropertyValue('--secure-header-height'), '123px');
    assert.ok(f.nav.closest('#secureAssessment'));
    assert.equal(f.nav.closest('form'), null);
    f.d.getElementById('secureAssessment').classList.add('hidden');
    assert.ok(f.nav.closest('.hidden'));
    assert.match(css, /\.secureQuestionNavigation\{position:sticky;top:var\(--secure-header-height/);
    assert.match(css, /html\{scroll-padding-top:calc\(var\(--secure-header-height/);
    assert.match(css, /scroll-margin-top:12px/);
  } finally { f.close(); }
});
