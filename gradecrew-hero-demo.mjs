import { createDemoFlow } from './gradecrew-hero-demo-flow.mjs?v=1';
import { heroText as t } from './gradecrew-hero-copy.mjs?v=1';

const make = (tag, className = '', key = '') => {
  const el = document.createElement(tag);
  el.className = className;
  if (key) el.textContent = t(key);
  return el;
};

export function installHeroDemo(root) {
  if (!root || root.dataset.heroDemoReady === '1') return;
  root.dataset.heroDemoReady = '1';
  const $ = id => root.querySelector(`#${id}`);
  const dialog = $('gcHeroDialog');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let state = null;
  let flow;

  const syncLabels = () => {
    root.querySelector('.gcHeroArtwork').alt = t('sceneAlt');
    $('gcEntryCrew').setAttribute('aria-label', t('crewGroup'));
    root.querySelector('.gcHeroRoles').setAttribute('aria-label', t('yourCrew'));
    for (const name of ['coco', 'remy', 'emmi', 'wilma']) {
      root.querySelectorAll(`[data-hero-crew="${name}"]`).forEach(button => {
        button.setAttribute('aria-label', t(`${name}Action`));
      });
    }
    $('gcHeroDialogClose').setAttribute('aria-label', t('close'));
    if (state) render();
  };

  function resetFlow() {
    flow?.stop();
    flow = createDemoFlow({ reducedMotion: motion.matches, onChange(next) { state = next; render(); } });
  }

  function renderCoco(sheet, phase) {
    const portrait = document.createElement('img');
    portrait.src = './assets/gradecrew/penguin-guide.svg'; portrait.alt = ''; portrait.width = 110; portrait.height = 110;
    portrait.style.cssText = 'display:block;margin:0 auto 16px;object-fit:contain';
    sheet.append(portrait, make('h3', 'gcHeroSheetTitle', `cocoHeading${phase}`), make('p', 'gcHeroClearQuestion', `cocoBody${phase}`));
  }

  function renderRemy(sheet, phase) {
    sheet.append(make('p', 'gcHeroSheetMeta', 'demoTopic'), make('h3', 'gcHeroSheetTitle', 'demoTestTitle'));
    if (phase === 0) {
      const note = make('div', 'gcHeroVoiceNote');
      const icon = make('span', 'gcHeroVoiceBars'); icon.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 4; i++) icon.append(make('i'));
      const words = make('div');
      words.append(make('p', 'gcHeroSheetMeta', 'voiceNoteLabel'), make('p', 'gcHeroVoiceTranscript', 'voiceNoteTranscript'));
      note.append(icon, words);
      sheet.append(note, make('p', 'gcHeroSideNote', 'voiceNoteCaption'));
      return;
    }
    const question = make('div', 'gcHeroQuestionCard');
    question.append(make('p', 'gcHeroSheetMeta', 'multipleChoice'), make('p', 'gcHeroQuestionPrompt', 'multipleChoicePrompt'));
    const options = make('div', 'gcHeroChoiceGrid');
    for (let i = 1; i <= 4; i++) {
      const option = make('div', 'gcHeroChoice');
      const box = make('span', 'gcHeroChoiceBox'); box.setAttribute('aria-hidden', 'true');
      option.append(box, make('span', '', `choice${i}`)); options.append(option);
    }
    question.append(options); sheet.append(question, make('p', 'gcHeroSideNote', 'otherFormats'));
    if (phase === 2) {
      for (let i = 2; i <= 3; i++) {
        const row = make('div', 'gcHeroQuestionRow');
        const number = make('span', 'gcHeroQuestionNumber'); number.textContent = i;
        row.append(number, make('span', '', `question${i}`)); sheet.append(row);
      }
      sheet.append(make('p', 'gcHeroReady', 'ready'));
    }
  }

  function renderEmmi(sheet, phase) {
    sheet.append(make('p', 'gcHeroSheetMeta', 'draftLabel'), make('p', `gcHeroDraft ${phase ? 'marked' : ''}`, 'vagueQuestion'));
    if (phase === 1) sheet.append(make('div', 'gcHeroEditing'));
    if (phase !== 2) return;
    const improved = make('div', 'gcHeroImproved');
    improved.append(make('p', 'gcHeroSheetMeta', 'improvedLabel'), make('p', 'gcHeroClearQuestion', 'clearQuestion'));
    const example = make('div', 'gcHeroIllustrated');
    const words = make('div');
    const sentence = make('p', 'gcHeroSentence');
    for (const [key, className] of [['sentenceLead', ''], ['sentenceAdjective', 'adjective'], ['sentenceNoun', 'noun'], ['sentenceVerb', 'verb']]) {
      sentence.append(make('span', className, key));
    }
    const legend = make('div', 'gcHeroLegend');
    for (const [key, className] of [['noun', 'noun'], ['adjective', 'adjective'], ['verb', 'verb']]) legend.append(make('span', className, key));
    words.append(sentence, legend);
    const image = make('img', 'gcHeroHedgehog');
    image.src = './assets/gradecrew/cuddly-hedgehog.webp'; image.alt = t('pictureAlt');
    image.width = 160; image.height = 138;
    example.append(words, image); improved.append(example);
    const capabilities = make('div', 'gcHeroCapabilities');
    capabilities.setAttribute('aria-label', t('emmiOtherPossibilities'));
    for (let i = 1; i <= 3; i++) capabilities.append(make('span', '', `emmiCapability${i}`));
    sheet.append(improved, make('p', 'gcHeroSideNote', 'improvementReason'), capabilities);
  }

  function renderWilma(sheet, phase) {
    sheet.append(make('p', 'gcHeroSheetMeta', 'automaticReview'), make('h3', 'gcHeroSheetTitle', 'gradingQuestion'));
    const sentence = make('p', 'gcHeroGradingSentence');
    sentence.textContent = ['sentenceLead', 'sentenceAdjective', 'sentenceNoun', 'sentenceVerb'].map(t).join(' ');
    const answer = make('div', `gcHeroStudentAnswer ${phase === 2 ? 'awarded' : ''}`);
    answer.append(make('p', 'gcHeroSheetMeta', 'studentAnswer'), make('strong', '', 'sentenceNoun'));
    if (phase === 2) { const mark = make('span', 'gcHeroAnswerMark'); mark.textContent = '✓'; mark.setAttribute('aria-label', t('correct')); answer.append(mark); }
    const score = make('div', `gcHeroScore ${phase === 2 ? 'awarded' : ''}`);
    score.append(make('span', '', 'points'));
    const points = make('div', 'gcHeroPoints');
    if (phase === 2) { const old = make('span', 'gcHeroPrevious'); old.textContent = '0 →'; points.append(old); }
    const value = make('strong'); value.textContent = phase === 2 ? '1' : '0';
    points.append(value, make('small', '', 'pointMaximum')); score.append(points);
    sheet.append(sentence, answer, make('p', 'gcHeroSideNote', 'criterion'), score);
    if (phase === 1) sheet.append(make('div', 'gcHeroChecking'));
    if (phase === 2) sheet.append(make('p', 'gcHeroSideNote', 'feedback'));
  }

  function render() {
    if (!state) return;
    const { name, phase, running, paused } = state;
    dialog.dataset.crew = name;
    dialog.dataset.phase = phase;
    dialog.classList.toggle('is-paused', paused);
    $('gcHeroDialogEyebrow').textContent = t('example');
    $('gcHeroDialogTitle').textContent = t(`${name}Title`);
    $('gcHeroDemoStatus').textContent = t(`${name}Phase${phase}`);
    $('gcHeroDemoPause').textContent = t(paused ? 'resume' : 'pause');
    $('gcHeroDemoPause').hidden = name === 'coco';
    $('gcHeroDemoPause').hidden = !running;
    $('gcHeroDemoNext').textContent = t('next');
    $('gcHeroDemoNext').hidden = phase >= 2;
    $('gcHeroDemoReplay').textContent = t('replay');
    const sheet = make('div', 'gcHeroSheet');
    if (name === 'coco') renderCoco(sheet, phase);
    else if (name === 'remy') renderRemy(sheet, phase);
    else if (name === 'emmi') renderEmmi(sheet, phase);
    else renderWilma(sheet, phase);
    $('gcHeroDemoWorkspace').replaceChildren(sheet);
  }

  resetFlow();
  // The visible role buttons expose the same actions to keyboard/screen readers.
  // Artwork hit regions are pointer shortcuts, not a second focus stop per animal.
  root.querySelectorAll('.gcHeroHit').forEach(button => {
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
  });
  let pointerOpener = null;
  let lastPointerOpener = null;
  root.querySelectorAll('[data-hero-crew]').forEach(button => {
    button.addEventListener('pointerdown', () => { pointerOpener = button; });
    button.addEventListener('keydown', () => { pointerOpener = null; });
    button.addEventListener('click', () => {
      lastPointerOpener = pointerOpener === button ? button : null;
      pointerOpener = null;
      flow.start(button.dataset.heroCrew);
      dialog.showModal();
    });
  });
  $('gcHeroDialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    flow.stop(); state = null;
    const opener = lastPointerOpener;
    lastPointerOpener = null;
    if (opener) queueMicrotask(() => { if (document.activeElement === opener) opener.blur(); });
  });
  $('gcHeroDemoPause').addEventListener('click', () => flow.togglePause());
  $('gcHeroDemoNext').addEventListener('click', () => flow.nextPhase());
  $('gcHeroDemoReplay').addEventListener('click', () => flow.replay());
  motion.addEventListener('change', () => { const previous = state; resetFlow(); if (previous) flow.start(previous.name); });
  window.addEventListener('gradecrew:ui-locale-changed', syncLabels);
  new MutationObserver(syncLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  syncLabels();
}
