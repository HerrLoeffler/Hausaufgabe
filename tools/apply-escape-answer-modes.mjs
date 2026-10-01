import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const appPath = path.join(root, 'lab', 'escape-room', 'app.js');
let app = await fs.readFile(appPath, 'utf8');

function replaceExact(before, after, label) {
  const count = app.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  app = app.replace(before, after);
}

replaceExact(
`  function renderChoiceOptions(question) {
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
`,
`  function renderChoiceOptions(question) {
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
      const correct = Number.isFinite(value) && Number.isFinite(expected) && Math.abs(value - expected) <= tolerance + 1e-9;
      return { answered: true, correct };
    }

    return { answered: false, correct: false };
  }
`,
'render primary answer modes');

replaceExact(
`      $('questionTitle').textContent = \`Aufgabe \${id.slice(1)}\`;
      $('questionPrompt').textContent = question.prompt;
      renderChoiceOptions(question);
`,
`      $('questionTitle').textContent = \`Aufgabe \${id.slice(1)}\`;
      $('questionPrompt').textContent = question.prompt;
      renderPrimaryAnswer(question);
`,
'open question uses primary renderer');

replaceExact(
`    const picked = $('questionOptions').querySelector('input:checked');
    if (!picked) {
      showFeedback('Wähle zuerst eine Antwort.');
      return;
    }

    const correct = Number(picked.value) === question.correctIndex;
`,
`    const evaluation = evaluatePrimaryAnswer(question);
    if (!evaluation.answered) {
      showFeedback((question.answerMode || 'choice') === 'choice' ? 'Wähle zuerst eine Antwort.' : 'Gib zuerst eine Antwort ein.');
      return;
    }

    const correct = evaluation.correct;
`,
'evaluate primary answer');

replaceExact(
`    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {
      $('remyHelp').hidden = false;
      showFeedback('Noch nicht richtig. Die Antworten wurden neu gemischt. Du kannst Remy jetzt auch konkret fragen, was unklar ist.', 'error');
    } else {
      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');
    }
    renderChoiceOptions(question);
`,
`    if (attempt >= D.world.remediationPolicy.retryBeforeSupport) {
      $('remyHelp').hidden = false;
      const retryText = (question.answerMode || 'choice') === 'choice'
        ? 'Die Antworten wurden neu gemischt.'
        : 'Versuche es nach dem Hinweis noch einmal.';
      showFeedback(\`Noch nicht richtig. \${retryText} Du kannst Remy jetzt auch konkret fragen, was unklar ist.\`, 'error');
    } else {
      showFeedback('Noch nicht richtig. Lies die Aufgabe noch einmal und probiere es erneut.', 'error');
    }
    renderPrimaryAnswer(question);
`,
'rerender answer mode after wrong answer');

replaceExact(
`    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'smallButton';
    edit.textContent = 'Bearbeiten';
    edit.onclick = () => openTeacherEdit(question.id);
`,
`    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'smallButton';
    const locallyEditable = (question.answerMode || 'choice') === 'choice' && (question.options || []).length === 4;
    edit.textContent = locallyEditable ? 'Bearbeiten' : 'Im Testeditor bearbeiten';
    edit.disabled = !locallyEditable;
    edit.title = locallyEditable ? '' : 'Dieser Antworttyp bleibt im GradeCrew-Testeditor bearbeitbar.';
    if (locallyEditable) edit.onclick = () => openTeacherEdit(question.id);
`,
'teacher edit safety');

replaceExact(
`    const solution = document.createElement('span');
    solution.textContent = \`Lösung: \${question.options[question.correctIndex]} · Hinweis: \${question.hint}\`;
`,
`    const solution = document.createElement('span');
    const mode = question.answerMode || 'choice';
    const correctDisplay = mode === 'text'
      ? (question.acceptedAnswers || []).join(' / ')
      : mode === 'number'
        ? \`\${question.numericAnswer}\${question.unit ? \` \${question.unit}\` : ''}\${Number(question.tolerance) ? \` (±\${question.tolerance})\` : ''}\`
        : question.options[question.correctIndex];
    solution.textContent = \`Lösung: \${correctDisplay} · Hinweis: \${question.hint}\`;
`,
'teacher solution display');

await fs.writeFile(appPath, app);
console.log('Escape answer modes applied to app.js');
