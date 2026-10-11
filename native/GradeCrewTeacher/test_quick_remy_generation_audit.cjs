const test = require('node:test');
const assert = require('node:assert/strict');
const { createGenerationAudit } = require('./Resources/gradecrew-remy-audit.js');
function fixture() {
  let uid = 'teacher-a'; let jobs = []; let questions = []; const memory = new Map();
  const audit = createGenerationAudit({ getUid: () => uid, readJobs: async () => jobs, readQuestions: async () => questions, storage: { getItem: k => memory.get(k), setItem: (k,v) => memory.set(k,v) } });
  return { audit, setUid: v => uid=v, setJobs: v => jobs=v, setQuestions: v => questions=v };
}
const expected = { subject:'Deutsch', grade:'8', topic:'Wortarten und Satzglieder', count:3, imageQuestionCount:2, audioQuestionCount:2, audioAnswerQuestionCount:0, customNotes:'Lustige Sätze' };
const readyJob = { id:'new-job', ownerId:'teacher-a', status:'ready', quizId:'QUIZ1', input:{ ...expected, notes:'Lustige Sätze' } };
const image='data:image/png;base64,AAAA'; const audio='data:audio/mpeg;base64,AAAA';
test('checks saved media, not just the planned job totals', async () => {
  const f=fixture(); const receipt=await f.audit.prepare(expected); f.audit.remember(receipt);
  f.setJobs([{ ...readyJob, imageTotal:2, imageCompleted:2 }]);
  f.setQuestions([{imageDataUrl:image,audioDataUrl:audio},{audioDataUrl:audio},{text:'Beschreibung statt Bild',aiOrigin:{mediaStatus:'omitted'}}]);
  const result=await f.audit.inspect();
  assert.equal(result.status,'needsReview');
  assert.match(result.message,/Bilder 1\/2/);
});
test('confirms only a complete saved result with the requested counts', async () => {
  const f=fixture(); f.audit.remember(await f.audit.prepare(expected)); f.setJobs([readyJob]);
  f.setQuestions([{imageDataUrl:image,audioDataUrl:audio},{imageDataUrl:image,audioDataUrl:audio},{}]);
  const result=await f.audit.inspect(); assert.equal(result.status,'checked'); assert.match(result.message,/2 Bilder/);
});
test('does not attach a new receipt to an old job with the same topic', async () => {
  const f=fixture(); f.setJobs([readyJob]); f.audit.remember(await f.audit.prepare(expected));
  assert.equal((await f.audit.inspect()).status,'pending');
});
test('an account switch cannot reveal another teacher’s receipt', async () => {
  const f=fixture(); f.audit.remember(await f.audit.prepare(expected)); f.setUid('teacher-b'); f.setJobs([readyJob]);
  assert.equal((await f.audit.inspect()).status,'none');
});
test('a lost request setting or wish is flagged even when assets exist', async () => {
  const f=fixture(); f.audit.remember(await f.audit.prepare(expected)); f.setJobs([{...readyJob,input:{...readyJob.input,audioQuestionCount:0,notes:''}}]);
  f.setQuestions([{imageDataUrl:image,audioDataUrl:audio},{imageDataUrl:image,audioDataUrl:audio},{}]);
  const result=await f.audit.inspect(); assert.equal(result.status,'needsReview'); assert.match(result.message,/Wünsche|Höraufgaben/);
});
test('opaque form sessions change when the account changes', () => {
  const f=fixture(); const old=f.audit.session(); assert.equal(f.audit.session(),old);
  f.setUid('teacher-b'); assert.notEqual(f.audit.session(),old);
});
test('incomplete answer audio is counted as missing even if job metadata says complete', async () => {
  const f=fixture(); const fields={...expected,imageQuestionCount:0,audioQuestionCount:0,audioAnswerQuestionCount:2};
  f.audit.remember(await f.audit.prepare(fields));
  f.setJobs([{...readyJob,input:{...fields,notes:'Lustige Sätze'},answerAudioCompleted:2}]);
  f.setQuestions([{audioAnswerMode:'audio-only',options:[{audioDataUrl:audio},{audioDataUrl:audio}]},{audioAnswerMode:'audio-only',options:[{audioDataUrl:audio},{}]},{}]);
  const result=await f.audit.inspect(); assert.equal(result.status,'needsReview'); assert.match(result.message,/Audioantworten 1\/2/);
});
