import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('app.js', 'utf8');
const start = source.indexOf('function questionForAi(');
const end = source.indexOf('\nconst AI_QUALITY_REASONS', start);

test('an older audio question without a loaded transcript still requests a new coherent audio script', () => {
  const context = {
    sanitizeQuestionForSave: q => ({ ...q }),
    getQuestionImageSrc: () => '',
    getQuestionAudioSrc: q => q.audioDataUrl || ''
  };
  vm.runInNewContext(source.slice(start, end), context);
  const sent = context.questionForAi({ type: 'single', text: 'Höre zu und wähle.', audioDataUrl: 'data:audio/mpeg;base64,QUJD', options: [{ text: 'A', correct: true }, { text: 'B', correct: false }] });
  assert.equal(sent.audioIntent.kind, 'ai_generated');
  assert.equal(sent.audioIntent.script, '');
  assert.equal('audioDataUrl' in sent, false);
});
