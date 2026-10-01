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


def block(lines):
    return '\n'.join(lines) + '\n'


app = APP.read_text()

answer_helpers = block([
    "  function renderPrimaryAnswer(question) {",
    "    const mode = question.answerMode || 'choice';",
    "    if (mode === 'choice') {",
    "      renderChoiceOptions(question);",
    "      return;",
    "    }",
    "",
    "    const wrapper = document.createElement('div');",
    "    wrapper.className = 'activeLearningTask primaryAnswerTask';",
    "    const input = document.createElement('input');",
    "    input.id = 'primaryAnswerInput';",
    "    input.type = 'text';",
    "    input.autocomplete = 'off';",
    "    input.spellcheck = mode !== 'number';",
    "    input.inputMode = mode === 'number' ? 'decimal' : 'text';",
    "    input.placeholder = mode === 'number' ? 'Zahl eingeben' : 'Antwort eingeben';",
    "    wrapper.append(input);",
    "",
    "    if (mode === 'number' && question.unit) {",
    "      const unit = document.createElement('small');",
    "      unit.className = 'primaryAnswerUnit';",
    "      unit.textContent = `Einheit: ${question.unit}`;",
    "      wrapper.append(unit);",
    "    }",
    "",
    "    $('questionOptions').replaceChildren(wrapper);",
    "    setTimeout(() => input.focus(), 0);",
    "  }",
    "",
    "  function evaluatePrimaryAnswer(question) {",
    "    const mode = question.answerMode || 'choice';",
    "    if (mode === 'choice') {",
    "      const picked = $('questionOptions').querySelector('input:checked');",
    "      if (!picked) return { answered: false, correct: false };",
    "      return { answered: true, correct: Number(picked.value) === question.correctIndex };",
    "    }",
    "",
    "    const input = $('primaryAnswerInput');",
    "    const raw = String(input?.value || '').trim();",
    "    if (!raw) return { answered: false, correct: false };",
    "",
    "    if (mode === 'text') {",
    "      const accepted = (question.acceptedAnswers || []).map(normalizeAnswer);",
    "      return { answered: true, correct: accepted.includes(normalizeAnswer(raw)) };",
    "    }",
    "",
    "    if (mode === 'number') {",
    "      const value = Number(raw.replace(',', '.'));",
    "      const expected = Number(question.numericAnswer);",
    "      const tolerance = Math.max(0, Number(question.tolerance) || 0);",
    "      return { answered: true, correct: Number.isFinite(value) && Number.isFinite(expected) && Math.abs(value - expected) <= tolerance + 1e-9 };",
    "    }",
    "",
    "    return { answered: false, correct: false };",
    "  }",
    ""
])
app = replace_once(app, "\n  function openQuestion(id, handler) {", "\n" + answer_helpers + "  function openQuestion(id, handler) {", 'insert answer helpers')
app = replace_once(app, "      renderChoiceOptions(question);\n    }\n\n    $('questionDialog').showModal();", "      renderPrimaryAnswer(question);\n    }\n\n    $('questionDialog').showModal();", 'render primary answer')

picked_before = block([
    "    const picked = $('questionOptions').querySelector('input:checked');",
    "    if (!picked) {",
    "      showFeedback('Wähle zuerst eine Antwort.');",
    "      return;",
    "    }",
    "",
    "    const correct = Number(picked.value) === question.correctIndex;"
])
picked_after = block([
    "    const evaluation = evaluatePrimaryAnswer(question);",
    "    if (!evaluation.answered) {",
    "      showFeedback((question.answerMode || 'choice') === 'choice' ? 'Wähle zuerst eine Antwort.' : 'Gib zuerst eine Antwort ein.');",
    "      return;",
    "    }",
    "",
    "    const correct = evaluation.correct;"
])
app = replace_once(app, picked_before, picked_after, 'evaluate primary answer')

retry_before = block([
    "    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {",
    "      $('remyHelp').hidden = false;",
    "      showFeedback('Noch nicht richtig. Die Antworten wurden neu gemischt. Du kannst Remy jetzt auch konkret fragen, was unklar ist.', 'error');",
    "    } else {",
    "      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');",
    "    }",
    "    renderChoiceOptions(question);"
])
retry_after = block([
    "    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {",
    "      $('remyHelp').hidden = false;",
    "      const retryText = (question.answerMode || 'choice') === 'choice' ? 'Die Antworten wurden neu gemischt.' : 'Versuche es nach dem Hinweis noch einmal.';",
    "      showFeedback(`Noch nicht richtig. ${retryText} Du kannst Remy jetzt auch konkret fragen, was unklar ist.`, 'error');",
    "    } else {",
    "      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');",
    "    }",
    "    renderPrimaryAnswer(question);"
])
app = replace_once(app, retry_before, retry_after, 'rerender primary answer')

app = replace_once(
    app,
    "    edit.textContent = 'Bearbeiten';\n    edit.onclick = () => openTeacherEdit(question.id);",
    block([
        "    const locallyEditable = (question.answerMode || 'choice') === 'choice' && (question.options || []).length === 4;",
        "    edit.textContent = locallyEditable ? 'Bearbeiten' : 'Im Testeditor bearbeiten';",
        "    edit.disabled = !locallyEditable;",
        "    edit.title = locallyEditable ? '' : 'Dieser Antworttyp bleibt im GradeCrew-Testeditor bearbeitbar.';",
        "    if (locallyEditable) edit.onclick = () => openTeacherEdit(question.id);"
    ]).rstrip('\n'),
    'teacher edit safety'
)
app = replace_once(
    app,
    "    solution.textContent = `Lösung: ${question.options[question.correctIndex]} · Hinweis: ${question.hint}`;",
    block([
        "    const mode = question.answerMode || 'choice';",
        "    const correctDisplay = mode === 'text'",
        "      ? (question.acceptedAnswers || []).join(' / ')",
        "      : mode === 'number'",
        "        ? `${question.numericAnswer}${question.unit ? ` ${question.unit}` : ''}${Number(question.tolerance) ? ` (±${question.tolerance})` : ''}`",
        "        : question.options[question.correctIndex];",
        "    solution.textContent = `Lösung: ${correctDisplay} · Hinweis: ${question.hint}`;"
    ]).rstrip('\n'),
    'teacher solution display'
)
APP.write_text(app)

adapter = ADAPTER.read_text()
adapter = replace_once(adapter, "  const COMPATIBLE_TYPES = Object.freeze(['single', 'dropdown', 'truefalse']);", "  const COMPATIBLE_TYPES = Object.freeze(['single', 'dropdown', 'truefalse', 'text', 'number']);", 'compatible types')
adapter = replace_once(adapter, "  const PLANNED_TYPES = Object.freeze(['text', 'number']);", "  const PLANNED_TYPES = Object.freeze([]);", 'planned types')

start = adapter.index("    if (PLANNED_TYPES.includes(type)) {")
end_marker = "    if (!COMPATIBLE_TYPES.includes(type)) {"
end = adapter.index(end_marker, start)
adapter = adapter[:start] + adapter[end:]

answer_insert = block([
    "    if (type === 'text') {",
    "      const acceptedAnswers = Array.isArray(source.acceptedAnswers) ? source.acceptedAnswers.map(nonempty).filter(Boolean) : [];",
    "      if (source.manualReview !== false) {",
    "        errors.push(issue('manual_review_required', 'Freitext mit manueller Nachkorrektur darf den Spielfortschritt nicht automatisch freischalten.', sourceIndex));",
    "        return { errors, warnings };",
    "      }",
    "      if (!acceptedAnswers.length) {",
    "        errors.push(issue('missing_accepted_answers', 'Freitext benötigt mindestens eine akzeptierte Antwortvariante.', sourceIndex));",
    "        return { errors, warnings };",
    "      }",
    "      return { answer: { answerMode: 'text', acceptedAnswers }, errors, warnings };",
    "    }",
    "",
    "    if (type === 'number') {",
    "      const numericAnswer = Number(source.numericAnswer);",
    "      const tolerance = source.tolerance == null || source.tolerance === '' ? 0 : Number(source.tolerance);",
    "      if (!Number.isFinite(numericAnswer) || !Number.isFinite(tolerance) || tolerance < 0) {",
    "        errors.push(issue('invalid_numeric_answer', 'Zahlaufgaben benötigen eine numerische Lösung und eine Toleranz größer oder gleich 0.', sourceIndex));",
    "        return { errors, warnings };",
    "      }",
    "      return { answer: { answerMode: 'number', numericAnswer, tolerance, unit: nonempty(source.unit) }, errors, warnings };",
    "    }",
    ""
])
adapter = replace_once(adapter, "    if (type === 'single' || type === 'dropdown') {", answer_insert + "    if (type === 'single' || type === 'dropdown') {", 'insert text number adapter')
ADAPTER.write_text(adapter)

adapter_test = ADAPTER_TEST.read_text()
adapter_test = adapter_test.replace("adapter fails closed for free text, number and complex question types until their engine modes are tested", "adapter supports safe free text and number while complex types stay fail-closed", 1)
adapter_test = replace_once(adapter_test, "    assert.equal(text.errors[0].code, 'answer_mode_not_ready');", block([
    "    assert.equal(text.errors.length, 0);",
    "    assert.equal(text.question.answerMode, 'text');",
    "    assert.deepEqual(Array.from(text.question.acceptedAnswers), ['München']);"
]).rstrip('\n'), 'text adapter assertion')
adapter_test = replace_once(adapter_test, "    assert.equal(number.errors[0].code, 'answer_mode_not_ready');", block([
    "    assert.equal(number.errors.length, 0);",
    "    assert.equal(number.question.answerMode, 'number');",
    "    assert.equal(number.question.numericAnswer, 4);",
    "    assert.equal(number.question.tolerance, 0);"
]).rstrip('\n'), 'number adapter assertion')
manual_case = block([
    "",
    "    const manualText = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(",
    "      { type: 'text', text: 'Begründe.', acceptedAnswers: ['Beispiel'], manualReview: true },",
    "      support, 'q1', 0",
    "    );",
    "    assert.equal(manualText.errors[0].code, 'manual_review_required');"
])
adapter_test = replace_once(adapter_test, "    const multi = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(", manual_case + "\n    const multi = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(", 'manual review guard test')
ADAPTER_TEST.write_text(adapter_test)

escape_test = ESCAPE_TEST.read_text()
anchor = "test('local Remy knowledge answers are cached without using an external bridge', async () => {"
extra_tests = block([
    "test('text answer mode can unlock progress with an accepted answer', () => {",
    "  const { w, d } = openEscape();",
    "  try {",
    "    const set = w.GradeCrewEscapeIntegration.getQuestionSet();",
    "    set[0] = { ...set[0], answerMode: 'text', acceptedAnswers: ['München', 'Muenchen'] };",
    "    delete set[0].options;",
    "    delete set[0].correctIndex;",
    "    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);",
    "    d.getElementById('startBtn').click();",
    "    click(d, '[data-action=\"desk\"]');",
    "    const input = d.getElementById('primaryAnswerInput');",
    "    assert.ok(input);",
    "    input.value = 'muenchen';",
    "    submitForm(w, d);",
    "    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');",
    "  } finally { w.close(); }",
    "});",
    "",
    "test('number answer mode accepts decimal comma within tolerance', () => {",
    "  const { w, d } = openEscape();",
    "  try {",
    "    const set = w.GradeCrewEscapeIntegration.getQuestionSet();",
    "    set[0] = { ...set[0], answerMode: 'number', numericAnswer: 4.5, tolerance: 0.05, unit: 'kg' };",
    "    delete set[0].options;",
    "    delete set[0].correctIndex;",
    "    assert.equal(w.GradeCrewEscapeIntegration.replaceQuestionSet(set).ok, true);",
    "    d.getElementById('startBtn').click();",
    "    click(d, '[data-action=\"desk\"]');",
    "    const input = d.getElementById('primaryAnswerInput');",
    "    assert.ok(input);",
    "    assert.match(d.getElementById('questionOptions').textContent, /kg/);",
    "    input.value = '4,52';",
    "    submitForm(w, d);",
    "    assert.equal(d.getElementById('progressText').textContent, '1 / 8 Fragen');",
    "  } finally { w.close(); }",
    "});",
    ""
])
escape_test = replace_once(escape_test, anchor, extra_tests + anchor, 'insert engine answer mode tests')
ESCAPE_TEST.write_text(escape_test)

print('Escape text/number answer modes patched successfully')
