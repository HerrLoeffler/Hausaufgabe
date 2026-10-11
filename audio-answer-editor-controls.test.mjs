import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { GRADECREW_ASSETS } from './generated/gradecrew-assets.js';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('app.js', 'utf8');
const buttonCode = source.slice(source.indexOf('function makeMiniButton('), source.indexOf('\nfunction ', source.indexOf('function makeMiniButton(') + 1));
const stateCode = source.slice(source.indexOf('function answerAudioRepairState('), source.indexOf('async function reportMissingAnswerAudio('));
const repairCode = source.slice(source.indexOf('function createAnswerAudioRepairControl('), source.indexOf('function renderQuestionAudioEditor('));
const renderCode = source.slice(source.indexOf('function renderQuestionAudioEditor('), source.indexOf('async function generateAiAudioForQuestion('));

test('four answer tracks expose native Emmi disclosure, preserve clips and obey active-exam lock', () => {
  const dom = new JSDOM('<div id="editor"></div>');
  const q = {
    id: 'q1', type: 'single', text: 'Which words are nouns?',
    audioAnswerMode: 'audio-only',
    options: ['Fox', 'tree', 'runs', 'blue'].map(text => ({ text, audioDataUrl: 'data:audio/mpeg;base64,QUJD' }))
  };
  const context = {
    document: dom.window.document, GRADECREW_ASSETS,
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
  vm.runInNewContext(buttonCode + stateCode + repairCode + renderCode, context);
  context.renderQuestionAudioEditor(dom.window.document.getElementById('editor'), q);
  const rows = [...dom.window.document.querySelectorAll('.answerAudioPreview .questionAudioPreview')];
  assert.equal(rows.length, 4);
  for (const [index, row] of rows.entries()) {
    const action = row.querySelector('.answerAudioEmmiButton');
    const choices = row.querySelector('.answerAudioRepairChoices');
    assert.ok(action, `Antwort ${index + 1} hat eine Einzelaktion`);
    assert.match(action.getAttribute('aria-label'), new RegExp(`Antwort ${index + 1}`));
    assert.equal(choices.hidden, true);
    action.click();
    assert.equal(action.getAttribute('aria-expanded'), 'true');
    assert.equal(choices.hidden, false);
    assert.equal(dom.window.document.activeElement, choices.querySelector('button'));
    assert.deepEqual([...choices.querySelectorAll('button')].map(b=>b.textContent), ['Audio fehlt – erzeugen','Audio gefällt mir nicht – neu erzeugen']);
    row.querySelector('.answerAudioRepair').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    assert.equal(choices.hidden, true);
    assert.equal(dom.window.document.activeElement, action);
    assert.equal(row.querySelector('audio').getAttribute('src'), 'data:audio/mpeg;base64,QUJD');
    assert.equal(row.querySelector('audio').autoplay, false);
  }
  context.state.currentQuiz.published = true;
  context.renderQuestionAudioEditor(dom.window.document.getElementById('editor'), q);
  assert.equal([...dom.window.document.querySelectorAll('.answerAudioEmmiButton,.answerAudioRepairChoices button')].every(button=>button.disabled),true);
  dom.window.close();
});
