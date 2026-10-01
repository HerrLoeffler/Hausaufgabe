from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'lab' / 'escape-room' / 'app.js'
ADAPTER = ROOT / 'lab' / 'escape-room' / 'gradecrew-question-adapter.js'
ADAPTER_TEST = ROOT / 'tools' / 'games' / 'gradecrew-escape-adapter.test.cjs'
ESCAPE_TEST = ROOT / 'tools' / 'games' / 'escape-room.test.cjs'


def replace_once(text, before, after, label):
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(before, after, 1)


app = APP.read_text()

render_choice = '''  function renderChoiceOptions(question) {
    const nodes = shuffledOptions(question).map(option => {
      const label = document.createElement('label');
      label.className = 'answerOption';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answer';
      radio.value = String(option.originalIndex);
      const text = document.createElement('span');
      text.textContent = option.text;
      label.append(radio, text);
      return label;
    });
    $('questionOptions').replaceChildren(...nodes);
  }
'''

render_modes = render_choice + '''
  function renderPrimaryAnswer(question) {
    const mode = question.answerMode || 'choice';
    if (mode === 'choice') {
      renderChoiceOptions(question);
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'activeLearningTask primaryAnswerTask';
    const input = document.createElement('input');
    input.id = 'primaryAnswerInput';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = mode !== 'number';
    input.inputMode = mode === 'number' ? 'decimal' : 'text';
    input.placeholder = mode === 'number' ? 'Zahl eingeben' : 'Antwort eingeben';
    wrapper.append(input);

    if (mode === 'number' && question.unit) {
      const unit = document.createElement('small');
      unit.className = 'primaryAnswerUnit';
      unit.textContent = `Einheit: ${question.unit}`;
      wrapper.append(unit);
    }

    $('questionOptions').replaceChildren(wrapper);
    setTimeout(() => input.focus(), 0);
  }

  function evaluatePrimaryAnswer(question) {
    const mode = question.answerMode || 'choice';
    if (mode === 'choice') {
      const picked = $('questionOptions').querySelector('input:checked');
      if (!picked) return { answered: false, correct: false };
      return { answered: true, correct: Number(picked.value) === question.correctIndex };
    }

    const input = $('primaryAnswerInput');
    const raw = String(input?.value || '').trim();
    if (!raw) return { answered: false, correct: false };

    if (mode === 'text') {
      const accepted = (question.acceptedAnswers || []).map(normalizeAnswer);
      return { answered: true, correct: accepted.includes(normalizeAnswer(raw)) };
    }

    if (mode === 'number') {
      const value = Number(raw.replace(',', '.'));
      const expected = Number(question.numericAnswer);
      const tolerance = Math.max(0, Number(question.tolerance) || 0);
      return {
        answered: true,
        correct: Number.isFinite(value) && Number.isFinite(expected) && Math.abs(value - expected) <= tolerance + 1e-9
      };
    }

    return { answered: false, correct: false };
  }
'''
app = replace_once(app, render_choice, render_modes, 'insert primary answer modes')

app = replace_once(
    app,
    """      $('questionTitle').textContent = `Aufgabe ${id.slice(1)}`;\n      $('questionPrompt').textContent = question.prompt;\n      renderChoiceOptions(question);\n""",
    """      $('questionTitle').textContent = `Aufgabe ${id.slice(1)}`;\n      $('questionPrompt').textContent = question.prompt;\n      renderPrimaryAnswer(question);\n""",
    'open question renderer'
)

app = replace_once(
    app,
    """    const picked = $('questionOptions').querySelector('input:checked');\n    if (!picked) {\n      showFeedback('Wähle zuerst eine Antwort.');\n      return;\n    }\n\n    const correct = Number(picked.value) === question.correctIndex;\n""",
    """    const evaluation = evaluatePrimaryAnswer(question);\n    if (!evaluation.answered) {\n      showFeedback((question.answerMode || 'choice') === 'choice' ? 'Wähle zuerst eine Antwort.' : 'Gib zuerst eine Antwort ein.');\n      return;\n    }\n\n    const correct = evaluation.correct;\n""",
    'evaluate primary answer'
)

app = replace_once(
    app,
    """    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {\n      $('remyHelp').hidden = false;\n      showFeedback('Noch nicht richtig. Die Antworten wurden neu gemischt. Du kannst Remy jetzt auch konkret fragen, was unklar ist.', 'error');\n    } else {\n      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');\n    }\n    renderChoiceOptions(question);\n""",
    """    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {\n      $('remyHelp').hidden = false;\n      const retryText = (question.answerMode || 'choice') === 'choice'\n        ? 'Die Antworten wurden neu gemischt.'\n        : 'Versuche es nach dem Hinweis noch einmal.';\n      showFeedback(`Noch nicht richtig. ${retryText} Du kannst Remy jetzt auch konkret fragen, was unklar ist.`, 'error');\n    } else {\n      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');\n    }\n    renderPrimaryAnswer(question);\n""",
    'rerender primary answer'
)

app = replace_once(
    app,
    """    const edit = document.createElement('button');\n    edit.type = 'button';\n    edit.className = 'smallButton';\n    edit.textContent = 'Bearbeiten';\n    edit.onclick = () => openTeacherEdit(question.id);\n""",
    """    const edit = document.createElement('button');\n    edit.type = 'button';\n    edit.className = 'smallButton';\n    const locallyEditable = (question.answerMode || 'choice') === 'choice' && (question.options || []).length === 4;\n    edit.textContent = locallyEditable ? 'Bearbeiten' : 'Im Testeditor bearbeiten';\n    edit.disabled = !locallyEditable;\n    edit.title = locallyEditable ? '' : 'Dieser Antworttyp bleibt im GradeCrew-Testeditor bearbeitbar.';\n    if (locallyEditable) edit.onclick = () => openTeacherEdit(question.id);\n""",
    'teacher edit safety'
)

app = replace_once(
    app,
    """    const solution = document.createElement('span');\n    solution.textContent = `Lösung: ${question.options[question.correctIndex]} · Hinweis: ${question.hint}`;\n""",
    """    const solution = document.createElement('span');\n    const mode = question.answerMode || 'choice';\n    const correctDisplay = mode === 'text'\n      ? (question.acceptedAnswers || []).join(' / ')\n      : mode === 'number'\n        ? `${question.numericAnswer}${question.unit ? ` ${question.unit}` : ''}${Number(question.tolerance) ? ` (±${question.tolerance})` : ''}`\n        : question.options[question.correctIndex];\n    solution.textContent = `Lösung: ${correctDisplay} · Hinweis: ${question.hint}`;\n""",
    'teacher solution display'
)

APP.write_text(app)

adapter = ADAPTER.read_text()
adapter = replace_once(
    adapter,
    """  const COMPATIBLE_TYPES = Object.freeze(['single', 'dropdown', 'truefalse']);\n  const PLANNED_TYPES = Object.freeze(['text', 'number']);\n""",
    """  const COMPATIBLE_TYPES = Object.freeze(['single', 'dropdown', 'truefalse', 'text', 'number']);\n  const PLANNED_TYPES = Object.freeze([]);\n""",
    'adapter compatible types'
)

adapter = replace_once(
    adapter,
    """    if (PLANNED_TYPES.includes(type)) {\n      errors.push(issue(\n        'answer_mode_not_ready',\n        type === 'text'\n          ? 'Freitext ist im GradeCrew-Datenvertrag vorbereitet, wird im Escape-Hauptslot aber erst freigeschaltet, wenn Eingabe und automatische Variantenprüfung vollständig getestet sind.'\n          : 'Zahlaufgaben sind im GradeCrew-Datenvertrag vorbereitet, werden im Escape-Hauptslot aber erst freigeschaltet, wenn Zahl/Toleranz/Einheit vollständig getestet sind.',\n        sourceIndex\n      ));\n      return { errors, warnings };\n    }\n\n""",
    """,
    'remove planned type blocker'
)

needle = """    if (visualDependency(source)) {\n      errors.push(issue('visual_dependency', 'Bildabhängige Aufgaben werden erst übernommen, wenn der Escape Room Bilder sicher im Lernslot anzeigen kann.', sourceIndex));\n      return { errors, warnings };\n    }\n\n"""
insert = needle + """    if (type === 'text') {\n      const acceptedAnswers = Array.isArray(source.acceptedAnswers)\n        ? source.acceptedAnswers.map(nonempty).filter(Boolean)\n        : [];\n      if (source.manualReview !== false) {\n        errors.push(issue('manual_review_required', 'Freitext mit manueller Nachkorrektur darf den Spielfortschritt nicht automatisch freischalten.', sourceIndex));\n        return { errors, warnings };\n      }\n      if (!acceptedAnswers.length) {\n        errors.push(issue('missing_accepted_answers', 'Freitext benötigt mindestens eine akzeptierte Antwortvariante.', sourceIndex));\n        return { errors, warnings };\n      }\n      return { answer: { answerMode: 'text', acceptedAnswers }, errors, warnings };\n    }\n\n    if (type === 'number') {\n      const numericAnswer = Number(source.numericAnswer);\n      const tolerance = source.tolerance == null || source.tolerance === '' ? 0 : Number(source.tolerance);\n      if (!Number.isFinite(numericAnswer) || !Number.isFinite(tolerance) || tolerance < 0) {\n        errors.push(issue('invalid_numeric_answer', 'Zahlaufgaben benötigen eine numerische Lösung und eine Toleranz größer oder gleich 0.', sourceIndex));\n        return { errors, warnings };\n      }\n      return {\n        answer: {\n          answerMode: 'number',\n          numericAnswer,\n          tolerance,\n          unit: nonempty(source.unit)\n        },\n        errors,\n        warnings\n      };\n    }\n\n"""
adapter = replace_once(adapter, needle, insert, 'adapter text and number support')
ADAPTER.write_text(adapter)

adapter_test = ADAPTER_TEST.read_text()
old_test = """test('adapter fails closed for free text, number and complex question types until their engine modes are tested', () => {\n  const { w } = loadAdapter();\n  try {\n    const support = supportsFromCanonical(w)[0];\n\n    const text = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'text', text: 'Nenne die Hauptstadt.', acceptedAnswers: ['München'], manualReview: false },\n      support, 'q1', 0\n    );\n    assert.equal(text.errors[0].code, 'answer_mode_not_ready');\n\n    const number = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'number', text: '2 + 2 = ?', numericAnswer: 4, tolerance: 0, unit: '' },\n      support, 'q1', 0\n    );\n    assert.equal(number.errors[0].code, 'answer_mode_not_ready');\n\n    const multi = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'multi', text: 'Wähle alle.', options: [{ text: 'A', correct: true }, { text: 'B', correct: true }] },\n      support, 'q1', 0\n    );\n    assert.equal(multi.errors[0].code, 'unsupported_type');\n  } finally {\n    w.close();\n  }\n});\n"""
new_test = """test('adapter supports safe free text and number answers while complex types stay fail-closed', () => {\n  const { w } = loadAdapter();\n  try {\n    const support = supportsFromCanonical(w)[0];\n\n    const text = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'text', text: 'Nenne die Hauptstadt.', acceptedAnswers: ['München', 'Muenchen'], manualReview: false },\n      support, 'q1', 0\n    );\n    assert.equal(text.errors.length, 0);\n    assert.equal(text.question.answerMode, 'text');\n    assert.deepEqual(Array.from(text.question.acceptedAnswers), ['München', 'Muenchen']);\n\n    const manualText = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'text', text: 'Begründe ausführlich.', acceptedAnswers: ['Beispiel'], manualReview: true },\n      support, 'q1', 0\n    );\n    assert.equal(manualText.errors[0].code, 'manual_review_required');\n\n    const number = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'number', text: '2 + 2 = ?', numericAnswer: 4, tolerance: 0.1, unit: 'kg' },\n      support, 'q1', 0\n    );\n    assert.equal(number.errors.length, 0);\n    assert.equal(number.question.answerMode, 'number');\n    assert.equal(number.question.numericAnswer, 4);\n    assert.equal(number.question.tolerance, 0.1);\n    assert.equal(number.question.unit, 'kg');\n\n    const multi = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(\n      { type: 'multi', text: 'Wähle alle.', options: [{ text: 'A', correct: true }, { text: 'B', correct: true }] },\n      support, 'q1', 0\n    );\n    assert.equal(multi.errors[0].code, 'unsupported_type');\n  } finally {\n    w.close();\n  }\n});\n"""
adapter_test = replace_once(adapter_test, old_test, new_test, 'adapter answer mode test')
ADAPTER_TEST.write_text(adapter_test)

escape_test = ESCAPE_TEST.read_text()
anchor = """test('local Remy knowledge answers are cached without using an external bridge', async () => {\n"""
answer_mode_tests = """test('text answer mode can unlock progress with accepted answer variants', () => {\n  const { w, d } = openEscape();\n  try {\n    const set = w.GradeCrewEscapeIntegration.getQuestionSet();\n    set[0] = {\n      ...set[0],\n      answerMode: 'text',\n      acceptedAnswers: ['München', 'Muenchen']\n    };\n    delete set[0].options;\n    delete set[0].correctIndex;\n    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);\n\n    d.getElementById('startBtn').click();\n    click(d, '[data-action=\"desk\"]');\n    const input = d.getElementById('primaryAnswerInput');\n    assert.ok(input);\n    input.value = 'muenchen';\n    submitForm(w, d);\n    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');\n  } finally {\n    w.close();\n  }\n});\n\ntest('number answer mode accepts decimal comma within tolerance', () => {\n  const { w, d } = openEscape();\n  try {\n    const set = w.GradeCrewEscapeIntegration.getQuestionSet();\n    set[0] = {\n      ...set[0],\n      answerMode: 'number',\n      numericAnswer: 4.5,\n      tolerance: 0.05,\n      unit: 'kg'\n    };\n    delete set[0].options;\n    delete set[0].correctIndex;\n    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);\n\n    d.getElementById('startBtn').click();\n    click(d, '[data-action=\"desk\"]');\n    const input = d.getElementById('primaryAnswerInput');\n    assert.ok(input);\n    assert.match(d.getElementById('questionOptions').textContent, /kg/);\n    input.value = '4,52';\n    submitForm(w, d);\n    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');\n  } finally {\n    w.close();\n  }\n});\n\n""" + anchor
escape_test = replace_once(escape_test, anchor, answer_mode_tests, 'engine answer mode tests')
ESCAPE_TEST.write_text(escape_test)

print('Escape text/number answer modes patched successfully')
