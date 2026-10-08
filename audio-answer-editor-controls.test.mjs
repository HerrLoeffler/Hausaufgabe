import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('app.js', 'utf8');
const buttonCode = source.slice(source.indexOf('function makeMiniButton('), source.indexOf('\nfunction ', source.indexOf('function makeMiniButton(') + 1));
const renderCode = source.slice(source.indexOf('function renderQuestionAudioEditor('), source.indexOf('async function generateAiAudioForQuestion('));

test('four answer tracks use compact Emmi actions with help instead of four repeated text buttons', () => {
  const dom = new JSDOM('<div id="editor"></div>');
  const q = {
    id: 'q1', type: 'single', text: 'Which words are nouns?',
    audioAnswerMode: 'audio-only',
    options: ['Fox', 'tree', 'runs', 'blue'].map(text => ({ text, audioDataUrl: 'data:audio/mpeg;base64,QUJD' }))
  };
  const context = {
    document: dom.window.document,
    state: { currentQuiz: { id: 'quiz' }, questions: [q] },
    getQuestionAudioSrc: () => '',
    getQuestionSolutionAudioSrc: () => '',
    questionHasAudioAnswerEntries: () => true,
    questionAnswerAudioReady: () => true,
    questionAnswerAudioEntries: question => question.options.map((asset, index) => ({ key: `o${index}`, sourceText: asset.text, asset })),
    audioOperations: () => new Map(),
    cancelQuestionAudioOperation: () => {},
    markDirty: () => {},
    generateAiAudioForQuestion: () => {},
    generateAiAnswerAudioForQuestion: () => {},
    generateAiSolutionAudioForQuestion: () => {},
    defaultSolutionAudioScript: () => '',
    toast: () => {},
    console
  };
  vm.runInNewContext(buttonCode + renderCode, context);
  context.renderQuestionAudioEditor(dom.window.document.getElementById('editor'), q);
  const rows = [...dom.window.document.querySelectorAll('.answerAudioPreview .questionAudioPreview')];
  assert.equal(rows.length, 4);
  for (const [index, row] of rows.entries()) {
    const action = row.querySelector('.answerAudioRetry');
    assert.ok(action, `Antwort ${index + 1} hat eine Einzelaktion`);
    assert.equal(action.textContent.trim(), '');
    assert.equal(action.querySelector('img')?.getAttribute('src'), '/assets/gradecrew/fox-improve.svg#pose-1');
    assert.match(action.getAttribute('aria-label'), new RegExp(`Antwort ${index + 1}`));
    assert.match(row.querySelector('.answerAudioHelp')?.getAttribute('title') || '', /Audiospur.*neu/);
  }
  dom.window.close();
});
