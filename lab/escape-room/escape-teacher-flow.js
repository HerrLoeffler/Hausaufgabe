(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const startButton = $('startBtn');
  const legacyPreviewButton = $('teacherPreviewBtn');
  const teacherDialog = $('teacherDialog');
  const teacherStartButton = $('teacherStartBtn');
  const gameView = $('gameView');

  if (!startButton || !legacyPreviewButton || !teacherDialog || !teacherStartButton || !gameView) return;

  const directStart = startButton.onclick;
  const openTeacherPreview = legacyPreviewButton.onclick;

  startButton.textContent = 'Escape vorbereiten';
  legacyPreviewButton.hidden = true;
  legacyPreviewButton.setAttribute('aria-hidden', 'true');
  legacyPreviewButton.tabIndex = -1;

  startButton.onclick = () => {
    if (typeof openTeacherPreview === 'function') openTeacherPreview.call(legacyPreviewButton);
    window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.preparation_opened' } }));
  };

  teacherStartButton.onclick = () => {
    if (typeof directStart !== 'function') return;
    directStart.call(startButton);
    if (!gameView.hidden) {
      teacherDialog.close();
      window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.started_from_preview' } }));
    }
  };
})();
