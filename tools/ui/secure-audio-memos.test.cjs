const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildPublicQuestion } = require('../../assessment-functions/lib/assessment-core');
const root = path.resolve(__dirname, '../..');
const words = ['PRIVATE_HUT', 'PRIVATE_KANGAROO', 'PRIVATE_SNORE', 'PRIVATE_JUMP', 'PRIVATE_GLITTER', 'PRIVATE_BRAVE'];
const audio = index => `data:audio/mpeg;base64,QUJD${index}`;
function fixture(type, mode = 'audio-only') {
  const q = { id: type, type, text: 'Instruction', points: 6, audioAnswerMode: mode };
  let entries;
  if (type === 'grouping') {
    q.groups = [0, 1, 2].map(i => ({ name: `Category ${i}`, items: words.slice(i * 2, i * 2 + 2) }));
    entries = words.map((sourceText, i) => ({ key: `g${Math.floor(i / 2)}_i${i % 2}`, sourceText }));
  } else if (type === 'matching') {
    q.pairs = words.map((right, i) => ({ left: `Prompt ${i}`, right }));
    entries = words.map((sourceText, i) => ({ key: `p${i}`, sourceText }));
  } else if (type === 'ordering') {
    q.items = words;
    entries = words.map((sourceText, i) => ({ key: `i${i}`, sourceText }));
  } else q.options = words.slice(0, 4).map((text, i) => ({ text, correct: i === 0, audioDataUrl: audio(i) }));
  if (entries) q.audioAnswerItems = entries.map((entry, i) => ({ ...entry, audioDataUrl: audio(i) }));
  return buildPublicQuestion(q, 'fixture-secret');
}
async function render(q, locale = 'en-GB') {
  const dom = new JSDOM('<div id="secureProgressText"></div><div id="secureOpenText"></div><div id="secureProgressFill"></div>', { url: 'https://example.test/?test=fixture', runScripts: 'outside-only' });
  const w = dom.window;
  w.initializeApp = () => ({});
  w.firebaseConfig = {};
  w.createSecureAssessmentClient = () => ({});
  w.assessmentContentLabels = (await import('../../shared/i18n/assessment-locale.mjs')).assessmentContentLabels;
  w.CSS = { escape: value => value };
  const source = fs.readFileSync(path.join(root, 'secure-student.js'), 'utf8').replace(/^import .*;\n/gm, '').replace('void bootstrap();', '');
  w.eval(source + '\nwindow.harness = { mount(q, locale) { currentQuiz = {contentLocale: locale}; currentPaper = [q]; const s = renderQuestion(q, 0); document.body.append(s); return s; }, collectAnswers };');
  const section = w.harness.mount(q, locale);
  return { w, section, answers: () => JSON.parse(JSON.stringify(w.harness.collectAnswers()[q.id])), close: () => w.close() };
}
for (const type of ['grouping', 'matching', 'ordering', 'dropdown', 'single', 'multi']) {
  test(`${type}: independent public memos, privacy, no autoplay or selection on hearing`, async () => {
    const q = fixture(type); const h = await render(q);
    try {
      const players = [...h.section.querySelectorAll('audio')];
      assert.equal(players.length, ['dropdown', 'single', 'multi'].includes(type) ? 4 : 6);
      assert.equal(new Set(players.map(p => p.src)).size, players.length);
      assert.doesNotMatch(h.section.outerHTML, /PRIVATE_|sourceText|audioAnswerItems|correct/);
      const before = h.answers();
      for (const player of players) { assert.equal(player.autoplay, false); assert.equal(player.controls, true); assert.equal(player.getAttribute("controlslist"), "nodownload noplaybackrate"); assert.ok(player.getAttribute('aria-label')); player.click(); player.dispatchEvent(new h.w.Event('play')); }
      assert.deepEqual(h.answers(), before);
      if (type === 'single' || type === 'multi') {
        h.section.querySelectorAll('input')[1].click();
        assert.deepEqual(h.answers(), type === 'single' ? q.options[1].id : [q.options[1].id]);
      } else if (type === 'grouping') {
        h.section.querySelectorAll('select').forEach((s, i) => { s.value = q.groups[i % 3].id; s.dispatchEvent(new h.w.Event('change', { bubbles: true })); });
        assert.deepEqual(h.answers(), Object.fromEntries(q.items.map((item, i) => [item.id, q.groups[i % 3].id])));
      } else if (type === 'matching') {
        h.section.querySelectorAll('select').forEach((s, i) => { s.value = q.rightItems[i].id; assert.equal(s.options[i + 1].textContent, `Answer ${i + 1}`); });
        assert.deepEqual(h.answers(), Object.fromEntries(q.leftItems.map((item, i) => [item.id, q.rightItems[i].id])));
      } else if (type === 'dropdown') {
        const s = h.section.querySelector('select'); s.value = q.options[2].id;
        assert.equal(s.options[3].textContent, 'Answer 3'); assert.equal(h.answers(), q.options[2].id);
      } else if (type === 'ordering') {
        const first = h.section.querySelector('.secureOrderItem'); const src = first.querySelector('audio').src;
        assert.equal(first.querySelectorAll('button')[1].getAttribute('aria-label'), 'Answer 1 down');
        first.querySelectorAll('button')[1].click();
        assert.deepEqual(h.answers(), [q.items[1].id, q.items[0].id, ...q.items.slice(2).map(i => i.id)]);
        assert.equal(h.section.querySelectorAll('.secureOrderItem')[1].querySelector('audio').src, src);
      }
    } finally { h.close(); }
  });
  test(`${type}: text-only compatibility`, async () => {
    const h = await render(fixture(type, 'none'));
    try { assert.equal(h.section.querySelectorAll('audio').length, 0); assert.match(h.section.textContent, /PRIVATE_HUT/); } finally { h.close(); }
  });
}
test('German content uses neutral German memo labels', async () => {
  const h = await render(fixture('ordering'), 'de-DE');
  try { assert.equal(h.section.querySelector('audio').getAttribute('aria-label'), 'Antwort 1'); assert.equal(h.section.querySelector('button').getAttribute('aria-label'), 'Antwort 1 nach oben'); } finally { h.close(); }
});

for (const locale of ['de-DE', 'en-GB']) test(`${locale}: listening instructions guide students without exposing the transcript`, async () => {
  const q={id:'listen',type:'single',text:'PRIVATE_TRANSCRIPT',points:1,audioPresentation:'listening-only',image:{src:'data:image/png;base64,AAAA'},audio:{src:audio(1)},options:[]};
  const h=await render(q,locale);
  try {
    assert.match(h.section.querySelector('h2').textContent,locale==='de-DE'?/Aufnahme unter dem Bild/:/recording below the picture/);
    assert.doesNotMatch(h.section.textContent,/PRIVATE_TRANSCRIPT|KI-generierte Stimme/);
    assert.equal(h.section.querySelector('audio').controls,true);
    assert.equal(h.section.querySelector('audio').getAttribute('controlslist'),'nodownload noplaybackrate');
  } finally {h.close();}
});
