import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('crew-tour-gc26-story-polish.js', 'utf8');

function setup(t) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { runScripts:'outside-only', pretendToBeVisual:true });
  const w = dom.window;
  t.after(() => w.close());
  w.eval(source.replace(/^export /gm, ''));
  return w;
}

async function settle(w) {
  await new Promise(resolve => w.setTimeout(resolve, 0));
  await Promise.resolve();
}

function coach(w, { title, className = '', paragraph = 'Text', handoff = false }) {
  const node = w.document.createElement('aside');
  node.className = `gcRealCoach ${className}`;
  node.innerHTML = `<div class="gcCoachIdentity"><img src="/assets/gradecrew/penguin-guide.svg"><div><span>Crew</span><h2>${title}</h2></div></div><p>${paragraph}</p>${handoff ? '<div class="gcHandoffFaces gcClayNames"><div><strong>Coco</strong></div><span>→</span><div><strong>Remy</strong></div></div>' : ''}`;
  w.document.body.append(node);
  return node;
}

test('introduction handoff gets a clear directional transfer cue', async t => {
  const w = setup(t);
  const node = coach(w, { title:'Das ist Remy!', className:'gcCoachHandoff', handoff:true });
  await settle(w);
  assert.ok(node.classList.contains('gc26HandoffStory'));
  assert.equal(node.querySelector('.gc26HandoffArrow')?.textContent, '→');
  assert.match(node.querySelector('.gcHandoffFaces small')?.textContent || '', /Übergabe/);
});

test('Remy filling the real form gets a pencil work cue', async t => {
  const w = setup(t);
  const node = coach(w, { title:'Wir bauen einen Test für Klasse 4.' });
  await settle(w);
  assert.ok(node.classList.contains('gc26RemyWorking'));
  assert.match(node.querySelector('.gcCoachIdentity img').src, /clay-remy-writing.svg$/);
});

test('Coco keeps the du joke and later shows the entered name on a heart sign', async t => {
  const w = setup(t);
  const ask = coach(w, { title:'Ach, fast vergessen!', paragraph:'Alt' });
  await settle(w);
  assert.match(ask.querySelector(':scope > p').textContent, /Ich darf doch du sagen/);

  const reveal = coach(w, { title:'Freut mich, Martin!' });
  await settle(w);
  assert.ok(reveal.classList.contains('gc26NameReveal'));
  assert.equal(reveal.querySelector('.gc26NameSign strong')?.textContent, 'Martin');
  assert.equal(reveal.querySelector('.gc26NameHeart')?.textContent, '♥');
  assert.match(reveal.querySelector('.gc26NamePortrait img').src, /clay-coco-name.svg$/);
});

test('approved Danke Remy scene is untouched', async t => {
  const w = setup(t);
  const node = coach(w, { title:'Danke, Remy!', className:'gcCoachThanks', handoff:true });
  await settle(w);
  assert.equal(node.classList.contains('gc26HandoffStory'), false);
  assert.equal(node.querySelector('.gc26PencilBadge'), null);
  assert.equal(node.querySelector('.gc26NameSign'), null);
});

 test('name placard preserves long names as text without creating markup', async t => {
  const w = setup(t);
  const name = '<img src=x onerror=alert(1)> Alexandra';
  const node = coach(w, { title: 'Freut mich, Name!' });
  node.querySelector('h2').textContent = `Freut mich, ${name}!`;
  await settle(w);
  assert.equal(node.querySelector('.gc26NameSign strong').textContent, name);
  assert.equal(node.querySelector('.gc26NameSign img'), null);
  assert.ok(node.querySelector('.gc26LongName'));
 });
