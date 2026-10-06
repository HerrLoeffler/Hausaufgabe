const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));

export function createLocalTourRepository({ now = Date.now } = {}) {
  const code = 'TOURLOCAL';
  let quiz = null;
  let questions = [];
  let submissions = [];
  let submissionSequence = 0;
  const matches = value => quiz && value === code;

  return {
    code,
    create(payload) {
      quiz = {
        ...copy(payload), id: code, ownerId: 'local-tour', tutorialVersion: 'gradecrew-live-tour-v8',
        published: false, ended: false, timeLimitMinutes: 1, startMode: 'student',
        resultMode: 'points_grade', showSolutions: true, createdAt: now()
      };
      questions = (payload.questions || []).map((question, index) => ({
        ...copy(question), id: `tutorial-${index + 1}`, position: index + 1,
        aiOrigin: { kind: 'tutorial', model: 'prepared-tutorial', promptVersion: quiz.tutorialVersion }
      }));
      delete quiz.questions;
      submissions = [];
      submissionSequence = 0;
      return code;
    },
    getQuiz(value) { return matches(value) ? copy(quiz) : null; },
    getQuestions(value) { return matches(value) ? copy(questions) : []; },
    save(value, patch, nextQuestions) {
      if (!matches(value)) throw new Error('Local tour quiz is missing');
      quiz = { ...quiz, ...copy(patch), id: code, ownerId: 'local-tour', updatedAt: now() };
      questions = copy(nextQuestions).map((question, index) => ({ ...question, position: index + 1 }));
    },
    publish(value) {
      if (!matches(value)) throw new Error('Local tour quiz is missing');
      quiz.published = true;
      quiz.ended = false;
      quiz.publishedAt = now();
    },
    submit(value, data) {
      if (!matches(value)) throw new Error('Local tour quiz is missing');
      const id = `tour-submission-${++submissionSequence}`;
      submissions.push({ ...copy(data), id, submittedAtLocal: new Date(now()).toISOString() });
      return id;
    },
    getSubmissions(value) { return matches(value) ? copy(submissions) : []; },
    grade(value, id, patch) {
      if (!matches(value)) throw new Error('Local tour quiz is missing');
      const submission = submissions.find(item => item.id === id);
      if (!submission) throw new Error('Local tour submission is missing');
      Object.assign(submission, copy(patch), { reviewedAt: now() });
    },
    clear() { quiz = null; questions = []; submissions = []; submissionSequence = 0; }
  };
}
