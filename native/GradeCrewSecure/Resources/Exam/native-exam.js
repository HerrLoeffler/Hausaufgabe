'use strict';
const $ = id => document.getElementById(id);
const currentQuiz = window.__GC_EXAM__.quiz || {};
const currentPaper = window.__GC_EXAM__.paper || [];
let revision = Number(window.__GC_EXAM__.revision) || 0;
let frozen = false;
let finalSnapshot = null;
function native(type, data = {}) {
  window.webkit.messageHandlers.gradecrewSecure.postMessage({ type, ...data });
}
function saveDraft() {
  if (frozen) return;
  revision += 1;
  native('snapshot', { revision, answers: collectAnswers() });
}
window.gcFreezeAnswers = () => {
  if (finalSnapshot) return finalSnapshot;
  frozen = true;
  revision += 1;
  const answers = collectAnswers();
  document.getElementById('secureQuestions').querySelectorAll('input,textarea,select,button').forEach(node => { node.disabled = true; });
  finalSnapshot = { revision, answers };
  return finalSnapshot;
};
const root = $('secureQuestions');
root.replaceChildren(...currentPaper.map(renderQuestion));
root.addEventListener('input', onAnswerChanged);
root.addEventListener('change', onAnswerChanged);
applyDraft(window.__GC_EXAM__.answers || {});
native('ready');
