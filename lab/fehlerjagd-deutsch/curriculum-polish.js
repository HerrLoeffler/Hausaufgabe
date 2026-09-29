(() => {
  'use strict';

  const { SKILLS } = window.FehlerjagdDeutsch || {};
  if (!SKILLS) return;

  const gradeValue = () => document.querySelector('input[name="grade"]:checked')?.value || '9';
  const gradeNumber = value => value === 'qa' ? 9 : Number(value || 9);
  const setupEyebrow = document.getElementById('setupEyebrow');
  const skillChoices = document.getElementById('skillChoices');
  const lockSeconds = document.getElementById('lockSeconds');
  const showSolution = document.getElementById('showSolution');
  const rulesHint = document.getElementById('rulesHint');
  const rulesCard = document.querySelector('.rulesCard');

  function statusFor(meta, grade) {
    if (grade === 'qa') return { text: 'PRÜFUNGSRELEVANT', kind: 'exam' };
    const g = gradeNumber(grade);
    if (meta.introducedGrade === g) return { text: `NEU IN JGST. ${g}`, kind: 'new' };
    if (meta.introducedGrade < g) return { text: 'WIEDERHOLEN & VERTIEFEN', kind: 'review' };
    return { text: `ZUSÄTZLICH · LEHRPLAN AB JGST. ${meta.introducedGrade}`, kind: 'future' };
  }

  function enhanceSkills() {
    if (!skillChoices) return;
    const grade = gradeValue();
    skillChoices.querySelectorAll('label.skillTile').forEach(label => {
      const input = label.querySelector('input[name="skill"]');
      if (!input) return;
      const meta = SKILLS[input.value];
      if (!meta) return;

      // Jahrgangsstufe steuert Empfehlungen, nicht Verbote.
      input.disabled = false;
      label.classList.remove('isDisabled');
      label.classList.remove('skillNew','skillReview','skillFuture','skillExam');
      label.querySelector('.curriculumBadge')?.remove();

      const status = statusFor(meta, grade);
      label.classList.add(`skill${status.kind[0].toUpperCase()}${status.kind.slice(1)}`);
      const badge = document.createElement('em');
      badge.className = `curriculumBadge ${status.kind}`;
      badge.textContent = status.text;
      label.querySelector('span')?.append(badge);
    });
  }

  function ensurePracticeNote() {
    if (!rulesCard) return null;
    let note = document.getElementById('practiceLearningNote');
    if (!note) {
      note = document.createElement('div');
      note.id = 'practiceLearningNote';
      note.className = 'practiceLearningNote';
      note.innerHTML = '<strong>Lernmodus</strong><span>Bei einer falschen Antwort wird die Regel erklärt. Danach bleiben mindestens 5 Sekunden zum Lesen.</span>';
      const scoreBox = rulesCard.querySelector('.scoreBox');
      rulesCard.insertBefore(note, scoreBox || null);
    }
    return note;
  }

  function applyModeRules() {
    if (!setupEyebrow || !lockSeconds || !showSolution) return;
    const practice = setupEyebrow.textContent.trim() === 'ÜBEN';
    const note = ensurePracticeNote();
    if (note) note.hidden = !practice;

    [...lockSeconds.options].forEach(option => {
      const seconds = Number(option.value);
      option.disabled = practice && seconds < 5;
    });

    if (practice && Number(lockSeconds.value) < 5) {
      lockSeconds.value = '5';
      lockSeconds.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (practice) {
      showSolution.checked = true;
      showSolution.disabled = true;
      showSolution.closest('.toggle')?.classList.add('isRequired');
      if (rulesHint) rulesHint.textContent = 'Lernmodus: Erklärungen sind nach Fehlern verpflichtend; Lesepause mindestens 5 Sekunden.';
    } else {
      showSolution.disabled = false;
      showSolution.closest('.toggle')?.classList.remove('isRequired');
      if (rulesHint) rulesHint.textContent = 'Diese Regeln gelten für alle Teilnehmenden.';
    }
  }

  document.querySelectorAll('input[name="grade"]').forEach(input => {
    input.addEventListener('change', () => setTimeout(enhanceSkills, 0));
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-open]');
    if (!trigger) return;
    if (trigger.dataset.open === 'practice' || trigger.dataset.open === 'live') {
      setTimeout(() => { enhanceSkills(); applyModeRules(); }, 0);
    }
  });

  const observer = new MutationObserver(() => {
    if (!document.getElementById('setupView')?.hidden) enhanceSkills();
  });
  if (skillChoices) observer.observe(skillChoices, { childList: true });

  enhanceSkills();
  applyModeRules();
})();
