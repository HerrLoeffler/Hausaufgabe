(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  function addStyles() {
    if (document.getElementById('escapeTeacherCompactStyles')) return;
    const style = document.createElement('style');
    style.id = 'escapeTeacherCompactStyles';
    style.textContent = `
      .teacherQuestion.compactGradecrewCard{padding:1rem 1.05rem;gap:.65rem;border:1px solid #dfe6f1;border-radius:18px;background:#fff;box-shadow:0 6px 18px rgba(26,45,75,.05)}
      .teacherQuestion.compactGradecrewCard .teacherQuestionTop{align-items:flex-start;gap:.75rem}
      .teacherQuestion.compactGradecrewCard .teacherQuestionTop strong{font-size:.83rem;text-transform:uppercase;letter-spacing:.055em;color:#5b6b82}
      .teacherQuestion.compactGradecrewCard>p{font-size:1.02rem;font-weight:650;line-height:1.45;margin:.1rem 0}
      .teacherCompactMeta{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
      .teacherTypeBadge{font-size:.75rem;font-weight:700;padding:.22rem .55rem;border-radius:999px;background:#edf4ff;color:#235fc7}
      .teacherSolution{font-size:.88rem;color:#2d465f;background:#f7f9fc;border-radius:10px;padding:.5rem .65rem}
      .teacherLearningDetails{border-top:1px solid #edf0f5;padding-top:.55rem}
      .teacherLearningDetails summary{cursor:pointer;font-weight:700;color:#315b91;list-style:none;padding:.2rem 0}
      .teacherLearningDetails summary::-webkit-details-marker{display:none}
      .teacherLearningDetails summary::before{content:'▸';display:inline-block;margin-right:.4rem;transition:transform .16s ease}
      .teacherLearningDetails[open] summary::before{transform:rotate(90deg)}
      .teacherLearningBody{display:grid;gap:.45rem;padding:.65rem 0 .15rem}
      .teacherLearningRow{font-size:.87rem;line-height:1.42;color:#4e5c70}
      .teacherLearningRow strong{color:#243349}
      .teacherAdvancedDetails{margin:1rem 0 .35rem;border:1px solid #dfe6f1;border-radius:14px;background:#f9fbfd;overflow:hidden}
      .teacherAdvancedDetails>summary{cursor:pointer;padding:.85rem 1rem;font-weight:750;color:#315b91;list-style:none}
      .teacherAdvancedDetails>summary::-webkit-details-marker{display:none}
      .teacherAdvancedDetails>summary::before{content:'▸';display:inline-block;margin-right:.45rem;transition:transform .16s ease}
      .teacherAdvancedDetails[open]>summary::before{transform:rotate(90deg)}
      .teacherAdvancedBody{display:grid;gap:.85rem;padding:0 1rem 1rem}
      .teacherEditCoreHint{margin:.15rem 0 .9rem;color:#607086;font-size:.9rem;line-height:1.4}

      /* Lehrer-first: Remy ist der ruhige Einstieg; Lab-/Statuskarten verschwinden aus dem Kopfbereich. */
      #teacherDialog .labWarning,#teacherDialog .teacherCompactIntro{display:none!important}
      #teacherDialog .teacherAiCard{margin:.45rem 0 .8rem!important}
      #teacherDialog .teacherAiHead{grid-template-columns:70px minmax(0,1fr) auto!important;margin-bottom:.65rem!important}
      #teacherDialog .teacherAiHead .teacherAiMicHero{align-self:center;white-space:nowrap;min-height:44px}
      #teacherDialog .teacherAiVoiceRow{margin:.15rem 0 .2rem!important}
      #teacherDialog .teacherAiVoiceRow .teacherAiMic{display:none!important}
      #teacherDialog .teacherAiVoiceStatus{font-size:.74rem}
      #teacherDialog .teacherOverview.teacherOverviewInline{margin:.65rem 0 0;padding:.65rem 0 0;border:0;border-top:1px solid #dce7f8;border-radius:0;background:transparent;box-shadow:none;display:flex;align-items:center;justify-content:space-between;gap:.75rem}
      #teacherDialog .teacherOverview.teacherOverviewInline .eyebrow,#teacherDialog .teacherOverview.teacherOverviewInline p{display:none!important}
      #teacherDialog .teacherOverview.teacherOverviewInline strong{font-size:.83rem;color:#49617f;font-weight:700}
      #teacherDialog .teacherOverview.teacherOverviewInline .secondaryButton{padding:.5rem .7rem;font-size:.78rem}
      #teacherDialog .teacherFlowIntro{margin:.2rem 0 .65rem}
      #teacherDialog .preflightStatus{margin:.35rem 0 .65rem}

      @media (max-width:700px){
        .teacherQuestion.compactGradecrewCard{padding:.85rem}
        .teacherCompactMeta{align-items:flex-start;flex-direction:column}
        .teacherSolution{width:100%;box-sizing:border-box}
        #teacherDialog .teacherAiHead{grid-template-columns:58px minmax(0,1fr)!important}
        #teacherDialog .teacherAiHead .teacherAiMicHero{grid-column:1/-1;width:100%}
        #teacherDialog .teacherOverview.teacherOverviewInline{align-items:flex-start;flex-direction:column}
      }
    `;
    document.head.append(style);
  }

  function typeLabel(question) {
    const mode = question.answerMode || 'choice';
    if (mode === 'text') return 'Freitext';
    if (mode === 'number') return 'Zahl';
    return 'Auswahl';
  }

  function correctDisplay(question) {
    const mode = question.answerMode || 'choice';
    if (mode === 'text') return (question.acceptedAnswers || []).join(' / ');
    if (mode === 'number') {
      const tolerance = Number(question.tolerance) ? ` ±${question.tolerance}` : '';
      return `${question.numericAnswer}${question.unit ? ` ${question.unit}` : ''}${tolerance}`;
    }
    return question.options?.[question.correctIndex] || '–';
  }

  function learningRow(label, text) {
    const row = document.createElement('div');
    row.className = 'teacherLearningRow';
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    row.append(strong, document.createTextNode(text || '–'));
    return row;
  }

  function compactCards() {
    const questions = window.GradeCrewEscapeIntegration?.getQuestionSet?.() || [];
    const cards = [...document.querySelectorAll('#teacherQuestions .teacherQuestion')];
    cards.forEach((card, index) => {
      const question = questions[index];
      if (!question) return;
      card.classList.add('compactGradecrewCard');

      const title = card.querySelector('.teacherQuestionTop strong');
      if (title) title.textContent = `Aufgabe ${index + 1}`;

      const directSpans = [...card.children].filter(node => node.tagName === 'SPAN');
      directSpans.forEach(node => node.remove());
      card.querySelector('.teacherCompactMeta')?.remove();
      card.querySelector('.teacherLearningDetails')?.remove();

      const meta = document.createElement('div');
      meta.className = 'teacherCompactMeta';
      const badge = document.createElement('span');
      badge.className = 'teacherTypeBadge';
      badge.textContent = typeLabel(question);
      const solution = document.createElement('span');
      solution.className = 'teacherSolution';
      solution.textContent = `✓ Lösung: ${correctDisplay(question)}`;
      meta.append(badge, solution);

      const details = document.createElement('details');
      details.className = 'teacherLearningDetails';
      const summary = document.createElement('summary');
      summary.textContent = 'Lernhilfe & Transfer anzeigen';
      const body = document.createElement('div');
      body.className = 'teacherLearningBody';
      body.append(
        learningRow('Lernziel', question.learningGoal),
        learningRow('Hinweis', question.hint),
        learningRow('Kurze Erklärung', question.explanation),
        learningRow('Nach mehreren Fehlern', question.remediation?.explanation),
        learningRow('Aktiver Lernschritt', question.remediation?.activeTask?.text),
        learningRow('Transfer', question.remediation?.transfer?.prompt)
      );
      details.append(summary, body);
      card.append(meta, details);
    });
  }

  function compactEditDialog() {
    const dialog = $('teacherEditDialog');
    const form = $('teacherEditForm');
    if (!dialog || !form || dialog.dataset.compactReady === 'true') return;
    dialog.dataset.compactReady = 'true';

    const title = $('teacherEditTitle');
    if (title) {
      const hint = document.createElement('p');
      hint.className = 'teacherEditCoreHint';
      hint.innerHTML = '<strong>Wie im GradeCrew-Editor:</strong> Passe zuerst nur Frage und Antworten an. Lernhilfe und Transfer sind bereits vorbereitet und liegen unten optional bereit.';
      title.insertAdjacentElement('afterend', hint);
    }

    const details = document.createElement('details');
    details.className = 'teacherAdvancedDetails';
    const summary = document.createElement('summary');
    summary.textContent = 'Lernhilfe & Transfer anpassen (optional)';
    const body = document.createElement('div');
    body.className = 'teacherAdvancedBody';

    const ids = [
      'editLearningGoal',
      'editHint',
      'editExplanation',
      'editRemediation',
      'editCopyText',
      'editTransferPrompt',
      'editTransferAnswers'
    ];
    const divider = form.querySelector('.editDivider');
    ids.forEach((id, index) => {
      if (index === 3 && divider) body.append(divider);
      const field = $(id);
      const label = field?.closest('label');
      if (label) body.append(label);
    });
    details.append(summary, body);

    const feedback = $('teacherEditFeedback');
    if (feedback) feedback.insertAdjacentElement('beforebegin', details);
    else form.append(details);
  }

  function simplifyTeacherHeader() {
    const dialog = $('teacherDialog');
    const card = $('teacherAiCard');
    const title = $('teacherTitle');
    if (!dialog || !card || !title || card.dataset.headerSimplified === 'true') return Boolean(card);
    card.dataset.headerSimplified = 'true';

    dialog.querySelector('.labWarning')?.remove();
    dialog.querySelector('.teacherCompactIntro')?.remove();

    title.insertAdjacentElement('afterend', card);

    const flow = dialog.querySelector('.teacherFlowIntro');
    if (flow) card.insertAdjacentElement('afterend', flow);
    const preflight = $('preflightStatus');
    if (preflight && flow) flow.insertAdjacentElement('afterend', preflight);

    const head = card.querySelector('.teacherAiHead');
    const mic = $('teacherAiRemyMic');
    if (head && mic) {
      mic.classList.add('teacherAiMicHero');
      head.append(mic);
    }

    const overview = dialog.querySelector('.teacherOverview');
    if (overview) {
      overview.classList.add('teacherOverviewInline');
      const reset = $('teacherResetBtn');
      if (reset) reset.textContent = 'Zurücksetzen';
      const fineprint = card.querySelector('.teacherAiFineprint');
      if (fineprint) fineprint.insertAdjacentElement('beforebegin', overview);
      else card.append(overview);
    }
    return true;
  }

  function watchForTeacherAiCard() {
    if (simplifyTeacherHeader()) return;
    const dialog = $('teacherDialog');
    if (!dialog) return;
    const observer = new MutationObserver(() => {
      if (simplifyTeacherHeader()) observer.disconnect();
    });
    observer.observe(dialog, { childList: true, subtree: true });
  }

  function enhance() {
    addStyles();
    compactEditDialog();
    compactCards();
    watchForTeacherAiCard();
  }

  window.addEventListener('gradecrew:escape-teacher-rendered', compactCards);
  enhance();
})();