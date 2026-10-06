(() => {
  const catalog = window.GRADECREW_COPY;
  const $ = id => document.getElementById(id);
  const language = $('language');
  const dialog = $('detail');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeDialog = null;
  let demoState = null;
  let locale = 'de';
  const t = key => catalog[locale][key] ?? catalog.de[key] ?? key;
  const node = (tag, className, key) => {
    const el = document.createElement(tag); el.className = className;
    if (key) el.textContent = t(key);
    return el;
  };
  let flow;
  function resetFlow() {
    flow?.stop();
    flow = window.GradeCrewDemo.createDemoFlow({ reducedMotion: motion.matches, onChange(state) {
      demoState = state; activeDialog = state.name; renderDialog();
    } });
  }
  resetFlow();
  function renderDemo() {
    const { name, phase, tutorial, index, running, paused } = demoState;
    $('crewDemo').dataset.phase = phase;
    $('crewDemo').dataset.crew = name;
    $('crewDemo').classList.toggle('is-paused', paused);
    $('dialogEyebrow').textContent = tutorial ? `${t('tutorial')} · ${t('tutorialStep').replace('{step}', index + 1)}` : t('example');
    $('demoPortrait').className = `demo-portrait portrait-${name}`;
    $('demoStatus').textContent = t(`${name}Phase${phase}`);
    $('demoPause').textContent = t(paused ? 'resume' : 'pause');
    $('demoPause').hidden = !running;
    $('tutorialNext').hidden = !tutorial;
    $('tutorialNext').textContent = t(index === 2 ? 'finishTutorial' : 'next');
    [...document.querySelectorAll('.demo-progress span')].forEach((el, i) => el.classList.toggle('complete', i <= (tutorial ? index : phase)));
    const sheet = node('div', `example-sheet sheet-${name}`);
    if (name === 'remy') {
      sheet.append(node('p', 'sheet-meta', 'demoTopic'), node('h3', 'sheet-title', 'demoTestTitle'));
      if (phase === 0) {
        const note = node('div', 'voice-note');
        const icon = node('span', 'voice-note-icon'); icon.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 4; i++) icon.append(node('span', 'voice-bar'));
        const text = node('div', 'voice-note-text');
        text.append(node('p', 'sheet-meta', 'voiceNoteLabel'), node('p', 'voice-note-transcript', 'voiceNoteTranscript'));
        note.append(icon, text); sheet.append(note, node('p', 'voice-note-caption', 'voiceNoteCaption'));
      } else {
        const question = node('div', 'choice-question revealed');
        question.append(node('p', 'sheet-meta', 'multipleChoice'), node('p', 'choice-prompt', 'multipleChoicePrompt'));
        const choices = node('div', 'choice-options');
        for (let i = 1; i <= 4; i++) {
          const option = node('div', 'choice-option');
          const box = node('span', 'choice-box'); box.setAttribute('aria-hidden', 'true');
          option.append(box, node('span', '', `choice${i}`)); choices.append(option);
        }
        question.append(choices); sheet.append(question);
        const formats = node('p', 'format-note', 'otherFormats');
        sheet.append(formats);
        if (phase === 2) {
          const list = node('div', 'more-questions');
          for (let i = 2; i <= 3; i++) {
            const row = node('div', 'question-row revealed');
            const number = node('span', 'question-number'); number.textContent = i;
            row.append(number, node('span', '', `question${i}`)); list.append(row);
          }
          sheet.append(list, node('p', 'ready-stamp', 'ready'));
        }
      }
    } else if (name === 'emmi') {
      sheet.append(node('p', 'sheet-meta', 'draftLabel'), node('p', `draft-question ${phase >= 1 ? 'marked' : ''}`, 'vagueQuestion'));
      if (phase === 1) sheet.append(node('div', 'editing-lines'));
      if (phase === 2) {
        const improved = node('div', 'improved-question');
        improved.append(node('p', 'sheet-meta', 'improvedLabel'), node('p', 'clear-question', 'clearQuestion'));
        const exercise = node('div', 'illustrated-question');
        const words = node('div', 'word-exercise');
        const sentence = node('p', 'word-sentence');
        sentence.append(node('span', 'word-lead', 'sentenceLead'), node('span', 'word-adjective', 'sentenceAdjective'), node('span', 'word-noun', 'sentenceNoun'), node('span', 'word-verb', 'sentenceVerb'));
        const legend = node('div', 'word-legend');
        legend.append(node('span', 'word-noun', 'noun'), node('span', 'word-adjective', 'adjective'), node('span', 'word-verb', 'verb'));
        words.append(sentence, legend);
        const picture = node('img', 'added-picture');
        picture.src = 'assets/cuddly-hedgehog.webp'; picture.alt = t('pictureAlt'); picture.width = 160; picture.height = 138;
        exercise.append(words, picture); improved.append(exercise);
        sheet.append(improved, node('p', 'improvement-note', 'improvementReason'), node('p', 'format-note', 'emmiOtherPossibilities'));
      }
    } else {
      sheet.append(node('p', 'sheet-meta', 'automaticReview'), node('h3', 'sheet-title', 'gradingQuestion'));
      const sentence = node('p', 'grading-sentence');
      sentence.textContent = ['sentenceLead', 'sentenceAdjective', 'sentenceNoun', 'sentenceVerb'].map(t).join(' ');
      const answer = node('div', `student-answer ${phase === 2 ? 'awarded' : ''}`);
      answer.append(node('p', 'sheet-meta', 'studentAnswer'), node('strong', 'noun-answer', 'sentenceNoun'));
      if (phase === 2) { const check = node('span', 'answer-mark'); check.textContent = '✓'; check.setAttribute('aria-label', t('correct')); answer.append(check); }
      const grading = node('div', `grading-score ${phase === 2 ? 'awarded' : ''}`);
      grading.append(node('span', 'points-label', 'points'));
      const score = node('div', 'point-count');
      if (phase === 2) { const previous = node('span', 'previous-score'); previous.textContent = '0'; const arrow = node('span', 'score-arrow'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true'); score.append(previous, arrow); }
      const value = node('strong', 'score-value'); value.textContent = phase === 2 ? '1' : '0';
      score.append(value, node('span', 'score-maximum', 'pointMaximum')); grading.append(score);
      sheet.append(sentence, answer, node('p', 'criterion-note', 'criterion'), grading);
      if (phase === 1) sheet.append(node('div', 'checking-line'));
      if (phase === 2) sheet.append(node('p', 'feedback-note', 'feedback'));
    }
    $('demoWorkspace').replaceChildren(sheet);
  }
  function renderDialog() {
    const isDemo = !!demoState;
    dialog.classList.toggle('is-demo', isDemo);
    $('crewDemo').hidden = !isDemo;
    $('demoPortrait').hidden = !isDemo;
    $('detailTitle').textContent = t(`${activeDialog}Title`);
    $('detailBody').textContent = t(`${activeDialog}Body`);
    $('detailBody').hidden = isDemo;
    $('stagingLink').hidden = !['login', 'join'].includes(activeDialog);
    if (isDemo) renderDemo(); else $('dialogEyebrow').textContent = 'GradeCrew';
  }
  function setLocale(next) {
    locale = Object.hasOwn(catalog, next) ? next : 'de';
    document.documentElement.lang = locale; document.title = t('title'); language.value = locale;
    document.querySelectorAll('[data-copy]').forEach(el => el.textContent = t(el.dataset.copy));
    for (const [suffix, attr] of [['aria', 'aria-label'], ['alt', 'alt'], ['placeholder', 'placeholder']]) document.querySelectorAll(`[data-copy-${suffix}]`).forEach(el => el.setAttribute(attr, t(el.getAttribute(`data-copy-${suffix}`))));
    if (activeDialog) renderDialog();
    try { localStorage.setItem('gradecrew.hero-preview.locale', locale); } catch { /* Storage is optional. */ }
  }
  function openDialog(name) {
    flow.stop(); demoState = null;
    if (['remy', 'emmi', 'wilma', 'tutorial'].includes(name)) flow.start(name === 'tutorial' ? 'remy' : name, name === 'tutorial');
    else { activeDialog = name; renderDialog(); }
    dialog.showModal();
  }
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { flow.stop(); activeDialog = null; demoState = null; });
  $('demoPause').addEventListener('click', () => flow.togglePause());
  $('demoReplay').addEventListener('click', () => flow.replay());
  $('tutorialNext').addEventListener('click', () => { if (!flow.next()) dialog.close(); });
  motion.addEventListener('change', () => { const previous = demoState; resetFlow(); if (previous) flow.start(previous.name, previous.tutorial); });
  $('joinForm').addEventListener('submit', event => { event.preventDefault(); openDialog('join'); });
  language.addEventListener('change', () => setLocale(language.value));
  let saved; try { saved = localStorage.getItem('gradecrew.hero-preview.locale'); } catch { /* Use default. */ }
  setLocale(new URLSearchParams(location.search).get('lang') || saved || 'de');
})();
