'use strict';
const $ = id => document.getElementById(id);
window.gcSetPresentationScale = value => {
  if (!Number.isFinite(value) || value <= 0) return;
  document.documentElement.style.setProperty('--secure-text-scale',String(value));
};
window.gcSetPresentationScale(window.__GC_EXAM__.presentationScale || 1);
const currentQuiz = window.__GC_EXAM__.quiz || {};
const currentPaper = window.__GC_EXAM__.paper || [];
let revision = Number(window.__GC_EXAM__.revision) || 0;
let frozen = false;
const touchedQuestionIds = new Set(window.__GC_EXAM__.touchedQuestionIDs || []);
function markQuestionTouched(id) { if (!frozen && currentPaper.some(q => q.id === id)) touchedQuestionIds.add(id); }
function presentationSnapshot() {
  return {touchedQuestionIDs:[...touchedQuestionIds], completedQuestionIDs:summarizeQuestions(currentPaper,collectAnswers(),touchedQuestionIds).completedQuestionIds};
}
window.gcExamSummary = () => summarizeQuestions(currentPaper,collectAnswers(),touchedQuestionIds);
let finalSnapshot = null;
let navigation = null;
function native(type, data = {}) {
  window.webkit.messageHandlers.gradecrewSecure.postMessage({ type, ...data });
}
function saveDraft() {
  if (frozen) return;
  revision += 1;
  native('snapshot', { revision, answers: collectAnswers(), ...presentationSnapshot() });
}
window.gcFreezeAnswers = () => {
  if (finalSnapshot) return finalSnapshot;
  frozen = true;
  navigation?.freeze();
  revision += 1;
  const answers = collectAnswers();
  document.getElementById('secureQuestions').querySelectorAll('input,textarea,select,button').forEach(node => { node.disabled = true; });
  finalSnapshot = { revision, answers, ...presentationSnapshot() };
  return finalSnapshot;
};
const root = $('secureQuestions');
root.replaceChildren(...currentPaper.map(renderQuestion));
root.addEventListener('input', onAnswerChanged);
root.addEventListener('change', onAnswerChanged);
navigation = createQuestionNavigation({paper:currentPaper,root,navRoot:$('secureNavigation'),reducedMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false});
const originalRefreshProgress = refreshProgress;
refreshProgress = function() { originalRefreshProgress();navigation?.refresh(collectAnswers(),touchedQuestionIds); };
applyDraft(window.__GC_EXAM__.answers || {});
window.addEventListener('pagehide',()=>navigation?.destroy(),{once:true});
saveDraft();
native('ready');
