(() => {
  'use strict';

  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  const style = document.createElement('style');
  style.textContent = `
    .feedback.feedbackStructured {
      display: grid;
      gap: 6px;
      align-items: start;
    }
    .feedback.feedbackStructured > strong {
      font-size: .78rem;
      letter-spacing: .06em;
      text-transform: uppercase;
      opacity: .72;
    }
    .feedback.feedbackStructured > span {
      font-size: 1rem;
      line-height: 1.55;
      font-weight: 650;
    }
    .feedback.feedbackStructured > small {
      margin-top: 2px;
      font-size: .78rem;
      font-weight: 600;
      opacity: .6;
    }
  `;
  document.head.append(style);

  let formatting = false;

  function formatWrongFeedback() {
    if (formatting || !feedback.classList.contains('bad')) return;
    const raw = feedback.textContent.trim();
    const match = raw.match(/^Nicht ganz · (-?\d+) Punkte\.\s*(.*)$/s);
    if (!match) return;

    formatting = true;
    const explanation = match[2].trim() || 'Prüfe die Regel oder Strategie noch einmal.';
    const isPractice = document.getElementById('playerLabel')?.textContent.trim() === 'Üben';

    feedback.replaceChildren();
    feedback.classList.add('feedbackStructured');

    const label = document.createElement('strong');
    label.textContent = 'Erklärung';
    const text = document.createElement('span');
    text.textContent = explanation;
    feedback.append(label, text);

    // Im Übungsmodus zählt zuerst das Verstehen. Die Punktstrafe bleibt
    // intern im Score sichtbar, wird aber nicht in den Lernhinweis gedrängt.
    if (!isPractice) {
      const points = document.createElement('small');
      points.textContent = `${match[1]} Punkte`;
      feedback.append(points);
    }
    formatting = false;
  }

  const observer = new MutationObserver(formatWrongFeedback);
  observer.observe(feedback, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
})();
