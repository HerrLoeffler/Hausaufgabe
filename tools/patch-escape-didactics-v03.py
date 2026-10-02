from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if text.count(old) != 1:
        raise SystemExit(f'{path}: expected exactly one anchor, found {text.count(old)}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


# 1) Stronger didactic ladder: first error gives an actual hint; a later correct
# answer still needs a transfer check so blind clicking never becomes optimal.
replace_once(
    'lab/escape-room/app.js',
    """    if (correct && attempt < D.world.remediationPolicy.remediationAtAttempt) {
      showFeedback(`Richtig. ${question.explanation}`, 'success');
      finishQuestion(question.id, activeQuestion.handler);
      setTimeout(() => $('questionDialog').close(), 450);
      return;
    }

    if (correct) {
      showFeedback('Richtig gefunden. Weil vorher mehrere Versuche nötig waren, folgt noch ein kurzer Lerncheck.', 'success');
      beginRemediation(question, 'correct_after_repeated_attempts');
      return;
    }

    if (attempt >= D.world.remediationPolicy.remediationAtAttempt) {
      showFeedback('Mehrfach versucht. Jetzt klären wir kurz den Rechenweg, bevor das Spiel weitergeht.', 'error');
      beginRemediation(question, 'three_wrong_answers');
      return;
    }

    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {
      $('remyHelp').hidden = false;
      const retryText = (question.answerMode || 'choice') === 'choice' ? 'Die Antworten wurden neu gemischt.' : 'Versuche es nach dem Hinweis noch einmal.';
      showFeedback(`Noch nicht richtig. ${retryText} Du kannst Remy jetzt auch konkret fragen, was unklar ist.`, 'error');
    } else {
      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');
    }
    renderPrimaryAnswer(question);
    save();
""",
    """    if (correct && attempt === 1) {
      showFeedback(`Richtig. ${question.explanation}`, 'success');
      finishQuestion(question.id, activeQuestion.handler);
      setTimeout(() => $('questionDialog').close(), 450);
      return;
    }

    if (correct && attempt === 2) {
      renderTransfer(question);
      showFeedback('Richtig. Weil du vorher einen Fehlversuch hattest, prüfst du das Prinzip noch kurz an einer neuen Aufgabe.', 'success');
      event('transfer.required_after_error', { questionId: question.id, attempt });
      return;
    }

    if (correct) {
      showFeedback('Richtig gefunden. Weil mehrere Versuche nötig waren, klären wir den Rechenweg noch einmal und prüfen ihn danach an einer neuen Aufgabe.', 'success');
      beginRemediation(question, 'correct_after_repeated_attempts');
      return;
    }

    if (attempt >= D.world.remediationPolicy.remediationAtAttempt) {
      showFeedback('Mehrfach versucht. Jetzt klären wir den Rechenweg Schritt für Schritt, bevor das Spiel weitergeht.', 'error');
      beginRemediation(question, 'three_wrong_answers');
      return;
    }

    const retryText = (question.answerMode || 'choice') === 'choice'
      ? 'Die Antworten wurden neu gemischt.'
      : 'Versuche es mit der Denkhilfe noch einmal.';
    showFeedback(`Noch nicht richtig. Denkhilfe: ${question.hint} ${retryText}`, 'error');
    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {
      $('remyHelp').hidden = false;
      $('questionFeedback').textContent += ' Wenn dir der Schritt noch unklar ist, frag Remy ganz konkret.';
    }
    renderPrimaryAnswer(question);
    save();
"""
)

# 2) Load the compact GradeCrew-like teacher layer after the runtime has rendered.
replace_once(
    'lab/escape-room/index.html',
    '  <script src="app.js"></script>\n',
    '  <script src="app.js"></script>\n  <script src="escape-teacher-compact.js"></script>\n'
)

# 3) Include the new UI layer in isolated builds and bump only the lab release.
replace_once(
    'tools/build-lab-escape-room.mjs',
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'README.md'];",
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'README.md'];"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "for (const reference of ['styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js']) {",
    "for (const reference of ['styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js']) {"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "  version: '0.2.1',",
    "  version: '0.2.2',"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "console.log('Escape Room MVP build verified: locked-school v0.2.1.');",
    "console.log('Escape Room MVP build verified: locked-school lab v0.2.2.');"
)

# 4) Execute the compact layer in JSDOM and add a regression for the learning gate.
replace_once(
    'tools/games/escape-room.test.cjs',
    "  w.eval(fs.readFileSync(path.join(source, 'app.js'), 'utf8'));\n  return { dom, w, d: w.document };",
    "  w.eval(fs.readFileSync(path.join(source, 'app.js'), 'utf8'));\n  w.eval(fs.readFileSync(path.join(source, 'escape-teacher-compact.js'), 'utf8'));\n  return { dom, w, d: w.document };"
)
replace_once(
    'tools/games/escape-room.test.cjs',
    """test('text answer mode can unlock progress with an accepted answer', () => {
""",
    """test('one wrong answer gives a real hint and a later correct answer still requires transfer', () => {
  const { w, d } = openEscape();
  try {
    d.getElementById('startBtn').click();
    click(d, '[data-action="desk"]');
    const q1 = w.GradeCrewEscapePrototype.questions[0];
    const wrong = q1.correctIndex === 0 ? 1 : 0;

    submitAnswer(w, d, wrong);
    assert.match(d.getElementById('questionFeedback').textContent, /Denkhilfe:/);
    assert.match(d.getElementById('questionFeedback').textContent, new RegExp(q1.hint.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')));
    assert.doesNotMatch(d.getElementById('questionFeedback').textContent, /Lies die Aufgabe noch einmal/);

    submitAnswer(w, d, q1.correctIndex);
    assert.equal(d.getElementById('progressText').textContent, '0 / 8 Fragen');
    assert.ok(d.getElementById('transferInput'));

    d.getElementById('transferInput').value = q1.remediation.transfer.acceptedAnswers[0];
    submitForm(w, d);
    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');
  } finally {
    w.close();
  }
});

test('text answer mode can unlock progress with an accepted answer', () => {
"""
)
replace_once(
    'tools/games/escape-room.test.cjs',
    """    assert.match(d.getElementById('teacherContentProfile').textContent, /Prozentrechnung/);
""",
    """    assert.match(d.getElementById('teacherContentProfile').textContent, /Prozentrechnung/);
    assert.ok(d.querySelector('#teacherEditDialog .teacherAdvancedDetails'));
    assert.equal(d.querySelectorAll('#teacherQuestions .teacherLearningDetails').length, 8);
"""
)

print('Escape didactics v0.3 patch applied.')
