(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GradeCrewChapters = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const chapterId = /^ch_[A-Za-z0-9_-]{1,64}$/;
  const half = n => Math.round(n * 2) / 2;
  function validateChapterStructure(quiz, questions, { phase = 'publish' } = {}) {
    if (quiz?.chapterSchemaVersion === null || !Object.prototype.hasOwnProperty.call(quiz || {}, 'chapterSchemaVersion')) return { enabled: false, errors: [] };
    const errors = [];
    const error = (code, details = {}) => errors.push({ code, ...details });
    if (quiz.chapterSchemaVersion !== 1) return { enabled: true, errors: [{ code: 'version' }] };
    const chapters = Array.isArray(quiz.chapters) ? quiz.chapters : [];
    if (!chapters.length || chapters.length > 100) error('chapters');
    const ids = new Set();
    for (const ch of chapters) {
      if (!chapterId.test(String(ch?.id || '')) || ids.has(ch.id)) error('chapter-id', { chapterId: ch?.id });
      ids.add(ch?.id);
      if (typeof ch?.title !== 'string' || ch.title.trim().length > 120 || (phase === 'publish' && !ch.title.trim())) error('title', { chapterId: ch?.id });
    }
    const qids = new Set();
    const counts = new Map();
    if (!Array.isArray(questions) || questions.length > 100) error('questions');
    for (const q of Array.isArray(questions) ? questions : []) {
      if (typeof q?.id !== 'string' || !q.id || q.id.length > 120 || qids.has(q.id)) error('question-id', { questionId: q?.id });
      qids.add(q?.id);
      if (!ids.has(q?.chapterId)) error('assignment', { questionId: q?.id });
      counts.set(q?.chapterId, (counts.get(q?.chapterId) || 0) + 1);
      if (!Number.isFinite(q?.points) || q.points < 0.5 || half(q.points) !== q.points) error('points', { questionId: q?.id });
    }
    if (phase === 'publish') for (const ch of chapters) if (!counts.get(ch?.id)) error('empty', { chapterId: ch?.id });
    return { enabled: true, errors };
  }
  function orderedChapters(quiz) {
    return [...(quiz.chapters || [])].sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
  }
  function canonicalizeChapterQuestions(quiz, questions) {
    if (!quiz?.chapterSchemaVersion) return [...questions];
    const order = new Map(orderedChapters(quiz).map((ch, i) => [ch.id, i]));
    return [...questions].sort((a, b) => (order.get(a.chapterId) ?? 1e6) - (order.get(b.chapterId) ?? 1e6) || (Number(a.position) || 0) - (Number(b.position) || 0));
  }
  function createChapterSnapshot(quiz, questions) {
    const check = validateChapterStructure(quiz, questions, { phase: 'publish' });
    if (!check.enabled) return null;
    if (check.errors.length) throw Object.assign(new Error('Die Kapitelstruktur ist unvollständig. Prüfe Titel und Aufgabenzuordnung.'), { chapterErrors: check.errors });
    return { version: 1,
      chapters: orderedChapters(quiz).map((ch, i) => ({ id: ch.id, title: ch.title.trim(), position: i + 1 })),
      questions: canonicalizeChapterQuestions(quiz, questions).map((q, i) => ({ id: q.id, chapterId: q.chapterId, position: i + 1, maxPoints: q.points })) };
  }
  function aggregateChapterResults(snapshot, grading = {}) {
    if (!snapshot) return [];
    return snapshot.chapters.map(ch => {
      let maxPoints = 0, awardedPoints = 0, needsReview = false;
      for (const q of snapshot.questions.filter(q => q.chapterId === ch.id)) {
        const g = grading[q.id];
        const value = g?.awardedPoints ?? g?.autoPoints ?? 0;
        maxPoints += q.maxPoints;
        awardedPoints += Math.min(q.maxPoints, Math.max(0, Number.isFinite(value) ? value : 0));
        needsReview ||= !g || g.needsReview === true;
      }
      maxPoints = half(maxPoints); awardedPoints = half(awardedPoints);
      return { chapterId: ch.id, title: ch.title, position: ch.position, awardedPoints, maxPoints, percent: maxPoints ? Math.round(awardedPoints / maxPoints * 100) : null, needsReview };
    });
  }
  return { validateChapterStructure, canonicalizeChapterQuestions, createChapterSnapshot, aggregateChapterResults };
});
