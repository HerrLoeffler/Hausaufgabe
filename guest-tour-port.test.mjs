import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalTourRepository } from './guest-tour-port.mjs';

test('a guest run keeps quiz, answers and grades in memory and clears them on exit', () => {
  const port = createLocalTourRepository({ now: () => 1_000 });
  const code = port.create({ title: 'English 4', questions: [
    { type: 'single', text: 'Dog?', points: 1, options: [{ text: 'dog', correct: true }] }
  ] });
  assert.equal(port.getQuiz(code).title, 'English 4');
  const questions = port.getQuestions(code);
  assert.equal(questions.length, 1);
  questions[0].text = 'Mutated outside';
  assert.equal(port.getQuestions(code)[0].text, 'Dog?');
  port.save(code, { description: 'Practice' }, [{ ...port.getQuestions(code)[0], text: 'Cat?' }]);
  port.publish(code);
  assert.equal(port.getQuiz(code).published, true);
  const submissionId = port.submit(code, { studentName: 'ML', answers: {}, grading: {}, totalPoints: 0, maxPoints: 1, status: 'review' });
  port.grade(code, submissionId, { totalPoints: 1, grade: 1, status: 'graded' });
  assert.equal(port.getSubmissions(code)[0].grade, 1);
  port.clear();
  assert.equal(port.getQuiz(code), null);
  assert.deepEqual(port.getSubmissions(code), []);
});
