'use strict';
function questionCompletion(question, answer, touchedQuestionIds = new Set()) {
  const text = value => String(value ?? '').trim().length > 0;
  const list = Array.isArray(answer) ? answer : [];
  const object = answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
  let complete = false, started = false;
  switch (question.type) {
    case 'ordering': {
      const ids = (question.items || []).map(item => String(item.id));
      const touched = touchedQuestionIds.has(question.id);
      complete = touched && ids.length > 0 && list.length === ids.length && new Set(list).size === ids.length && ids.every(id => list.includes(id));
      started = touched; break;
    }
    case 'gapfill': {
      const expected = (question.segments || []).filter(item => item.type === 'gap').length;
      complete = expected > 0 && list.length === expected && list.every(text);
      started = list.some(text); break;
    }
    case 'matching': case 'grouping': {
      const ids = (question.type === 'matching' ? question.leftItems || [] : question.items || []).map(item => item.id);
      complete = ids.length > 0 && ids.every(id => text(object[id]));
      started = Object.values(object).some(text); break;
    }
    case 'multi': complete = list.length > 0; started = complete; break;
    case 'markwords':
      complete = (question.markGroups || []).length ? Object.keys(object).length > 0 : list.length > 0;
      started = complete; break;
    case 'single': case 'truefalse': case 'dropdown': case 'text': case 'number':
      complete = text(answer); started = complete; break;
  }
  return complete ? 'complete' : started ? 'started' : 'open';
}
function summarizeQuestions(paper, answers, touchedQuestionIds = new Set()) {
  const completedQuestionIds = paper.filter(q => questionCompletion(q, answers[q.id], touchedQuestionIds) === 'complete').map(q => q.id);
  return { total: paper.length, completed: completedQuestionIds.length,
    started: paper.filter(q => questionCompletion(q, answers[q.id], touchedQuestionIds) === 'started').length,
    open: paper.length - completedQuestionIds.length, completedQuestionIds };
}
if (typeof module !== 'undefined') module.exports = {questionCompletion, summarizeQuestions};
