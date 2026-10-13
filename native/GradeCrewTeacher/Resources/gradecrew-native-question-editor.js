/* Native presentation only: the deployed renderer retains every field, model and handler. */
(() => {
  'use strict';
  const config = __GRADECREW_CONFIG__;
  if (!window.webkit?.messageHandlers?.gradecrewNative || window.top !== window.self || location.origin !== config.origin || document.getElementById('gcNativeQuestionEditorStyle')) return;

  const expanded = new Map();
  let started = false;
  let scheduled = false;
  let currentList = null;
  const boundLists = new WeakSet();
  const english = () => document.documentElement.lang.toLowerCase().startsWith('en');
  const css = `
#editorView .questionCard[data-gc-native-question] { padding:14px; min-width:0; }
#editorView .questionCard[data-gc-native-question] .questionTop { margin-bottom:10px; padding-bottom:10px; }
#editorView .questionCard[data-gc-native-question] .questionGrid {
  display:grid; grid-template-columns:minmax(0,1fr) 84px !important; gap:10px; align-items:end;
}
#editorView .questionCard[data-gc-native-question] .questionGrid > label { min-width:0; }
#editorView .questionCard[data-gc-native-question] .questionGrid > .questionTextLabel { grid-column:1 / -1; }
#editorView .questionCard[data-gc-native-question] :is(.qType,.qPoints,.qText) { font-size:16px; }
#editorView .questionCard[data-gc-native-question] :is(.qType,.qPoints) { min-height:44px; width:100%; padding:9px 10px; }
#editorView .questionCard[data-gc-native-question] .qText { min-height:74px; line-height:1.45; }
#editorView .questionCard[data-gc-native-question] > .answerEditor { margin-top:10px; padding-top:10px; }
#editorView .questionCard[data-gc-native-question] .optionRow { grid-template-columns:26px minmax(0,1fr) 32px; gap:6px; }
#editorView .questionCard[data-gc-native-question] .optionRow > input:not([type=radio]):not([type=checkbox]) { min-height:44px; font-size:16px; min-width:0; }
#editorView .questionCard[data-gc-native-question] > .gcNativeQuestionMedia { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:8px; margin-top:12px; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure { min-width:0; border:1px solid var(--line,#dfe5ec); border-radius:10px; background:var(--card,#fff); }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure[open] { grid-column:1 / -1; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure > summary {
  display:flex; flex-wrap:wrap; align-items:center; gap:5px; min-height:44px; padding:9px 10px; box-sizing:border-box;
  color:var(--text,#20324a); font-size:13px; font-weight:650; list-style:none; cursor:pointer;
}
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure > summary::-webkit-details-marker { display:none; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure > summary::before { content:'+'; font-size:17px; color:var(--primary,#1769e0); }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure[open] > summary::before { content:'−'; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure > summary:focus-visible { outline:2px solid var(--primary,#1769e0); outline-offset:2px; border-radius:9px; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaBadge { font-size:11px; font-weight:500; color:var(--muted,#5e6b7b); }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaBadge[hidden] { display:none; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure > :is(.questionImageEditor,.questionAudioEditor) { margin:0; padding:0 10px 10px; min-width:0; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure > .questionImageEditor > .imageEditorTitle { display:none; }
#editorView .questionCard[data-gc-native-question] .gcNativeMediaDisclosure audio { max-width:100%; }
`;

  function shape(card) {
    const single = selector => {
      const nodes = card.querySelectorAll(selector);
      return nodes.length === 1 ? nodes[0] : null;
    };
    const grid = single('.questionGrid');
    const type = single('select.qType');
    const points = single('input.qPoints');
    const text = single('textarea.qText');
    const answer = single('.answerEditor');
    const image = single('.questionImageEditor');
    const audio = single('.questionAudioEditor');
    const typeLabel = type?.closest('label');
    const pointsLabel = points?.closest('label');
    const textLabel = text?.closest('.questionTextLabel');
    if (!grid || !typeLabel || !pointsLabel || !textLabel || !answer || !image || !audio || !card.dataset.id) return null;
    if (grid.parentNode !== card || answer.parentNode !== card || grid.children.length !== 3 || new Set([typeLabel, pointsLabel, textLabel]).size !== 3 || [typeLabel, pointsLabel, textLabel].some(label => label.parentNode !== grid)) return null;
    const wrapper = card.querySelector(':scope > .gcNativeQuestionMedia');
    if (wrapper) {
      if (image.parentNode?.dataset.gcNativeMedia !== 'image' || audio.parentNode?.dataset.gcNativeMedia !== 'audio' || image.parentNode.parentNode !== wrapper || audio.parentNode.parentNode !== wrapper) return null;
    } else if (image.parentNode !== card || audio.parentNode !== card) return null;
    return { grid, typeLabel, pointsLabel, textLabel, answer, image, audio, wrapper };
  }

  function remember(details, key, kind) {
    const record = expanded.get(key) || {};
    record[kind] = details.open;
    expanded.set(key, record);
  }

  function disclosure(editor, kind, key) {
    const details = document.createElement('details');
    details.className = 'gcNativeMediaDisclosure';
    details.dataset.gcNativeMedia = kind;
    const summary = document.createElement('summary');
    summary.tabIndex = 0;
    const label = document.createElement('span'); label.className = 'gcNativeMediaLabel';
    const badge = document.createElement('small'); badge.className = 'gcNativeMediaBadge';
    summary.append(label, badge); details.append(summary, editor);
    details.open = expanded.get(key)?.[kind] === true;
    details.addEventListener('toggle', () => remember(details, key, kind));
    // Prevent the native keyboard default from toggling a second time. Clicks
    // and assistive technology retain the standard summary/details behavior.
    summary.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault(); details.open = !details.open; remember(details, key, kind);
    });
    return details;
  }

  function labels(editor, kind) {
    const details = editor.parentNode;
    const label = details.querySelector(':scope > summary > .gcNativeMediaLabel');
    const badge = details.querySelector(':scope > summary > .gcNativeMediaBadge');
    const hasMedia = Boolean(editor.querySelector(kind === 'image' ? '.questionImagePreview img[src]' : 'audio[src]'));
    const hasScript = kind === 'audio' && [...editor.querySelectorAll('.questionAudioScript,.solutionAudioScript')].some(input => input.value.trim());
    const nextLabel = kind === 'image' ? hasMedia ? (english() ? 'Image' : 'Bild') : (english() ? 'Add image' : 'Bild hinzufügen') : 'Audio';
    const nextBadge = hasMedia ? (english() ? 'present' : 'vorhanden') : hasScript ? (english() ? 'script' : 'Hörtext') : '';
    if (label.textContent !== nextLabel) label.textContent = nextLabel;
    if (badge.textContent !== nextBadge) badge.textContent = nextBadge;
    badge.hidden = !nextBadge;
    // The web app may open its existing image composer through a command,
    // modal completion or add button; reveal it before it receives focus.
    if (kind === 'image' && editor.querySelector('.imageDropPanel:not(.hidden)')) details.open = true;
  }

  function adapt(card, key) {
    const parts = shape(card);
    if (!parts) return;
    const { grid, typeLabel, pointsLabel, textLabel, answer, image, audio } = parts;
    if (grid.children[0] !== typeLabel || grid.children[1] !== pointsLabel || grid.children[2] !== textLabel) grid.append(typeLabel, pointsLabel, textLabel);
    if (grid.nextElementSibling !== answer) grid.after(answer);
    let wrapper = parts.wrapper;
    if (!wrapper) {
      wrapper = document.createElement('div'); wrapper.className = 'gcNativeQuestionMedia';
      wrapper.append(disclosure(image, 'image', key), disclosure(audio, 'audio', key));
    }
    if (answer.nextElementSibling !== wrapper) answer.after(wrapper);
    card.setAttribute('data-gc-native-question', '');
    labels(image, 'image'); labels(audio, 'audio');
  }

  function reveal(event) {
    const target = event.target;
    const details = target?.closest?.('details[data-gc-native-media]');
    if (!details || !currentList?.contains(details)) return;
    if (event.type === 'focusin' && !target.closest('summary') || event.type === 'click' && target.closest('.imageAddButton')) details.open = true;
  }

  const observer = new MutationObserver(records => {
    if (records.some(record => record.target === document.documentElement || currentList?.contains(record.target) || [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && (node.id === 'questionList' || node.querySelector?.('#questionList'))))) schedule();
  });
  function observe() {
    const editor = document.getElementById('editorView');
    const main = document.getElementById('mainContent');
    if (!editor || !currentList) {
      // Document-start injection waits for the editor once; mounted work is
      // scoped to editor lifecycle and question controls rather than the body.
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      if (main) observer.observe(main, { childList: true });
      observer.observe(editor, { childList: true, subtree: true });
      observer.observe(currentList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'src'] });
    }
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  function refresh() {
    if (!started) return;
    observer.disconnect();
    try {
      currentList = document.getElementById('questionList');
      if (!currentList || !document.getElementById('editorView')?.contains(currentList)) { currentList = null; return; }
      if (!boundLists.has(currentList)) {
        boundLists.add(currentList);
        currentList.addEventListener('focusin', reveal);
        currentList.addEventListener('click', reveal, true);
        currentList.addEventListener('input', schedule);
        currentList.addEventListener('change', schedule);
      }
      const liveKeys = new Set();
      const quiz = document.getElementById('editorView').dataset.quizId || '';
      for (const card of currentList.querySelectorAll(':scope > .questionCard')) {
        const key = JSON.stringify([quiz, card.dataset.id]); liveKeys.add(key); adapt(card, key);
      }
      for (const key of expanded.keys()) if (!liveKeys.has(key)) expanded.delete(key);
    } finally { observe(); }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; refresh(); });
  }
  function start() {
    if (started || document.getElementById('gcNativeQuestionEditorStyle')) return;
    started = true;
    const style = document.createElement('style'); style.id = 'gcNativeQuestionEditorStyle'; style.textContent = css;
    (document.head || document.documentElement).append(style);
    refresh();
    window.addEventListener('gradecrew:ui-locale-changed', schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
