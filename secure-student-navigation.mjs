import { paintAnswerCompletion } from "./shared/answer-completion.mjs";

/** Browser-only navigation; assessment answers, timers and submission stay in their existing runtime. */
export function mountSecureQuestionNavigation(doc = document, win = window) {
  const header = doc.querySelector('.secureTopbar');
  const assessment = doc.getElementById('secureAssessment');
  const questions = doc.getElementById('secureQuestions');
  const nav = doc.getElementById('secureQuestionNavigation');
  if (!header || !assessment || !questions || !nav) return () => {};
  const current = nav.querySelector('[data-secure-current]');
  const previous = nav.querySelector('[data-secure-previous]');
  const next = nav.querySelector('[data-secure-next]');
  const toggle = nav.querySelector('[data-secure-overview-toggle]');
  const overview = doc.getElementById('secureQuestionOverview');
  const layout = win.matchMedia?.('(min-width:1180px) and (min-height:600px)');
  const isSidebar = () => layout?.matches === true;
  let sections = [];
  let index = 0;
  let frame;
  let revealedIndex = -1;

  const measure = () => {
    doc.documentElement.style.setProperty('--secure-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    const timer = doc.getElementById('secureTimer');
    doc.documentElement.style.setProperty('--secure-timer-height', `${isSidebar() || !timer ? 0 : Math.ceil(timer.getBoundingClientRect().height)}px`);
    nav.dataset.layout = isSidebar() ? 'sidebar' : 'compact';
    const sidebar = nav.closest('.secureTaskSidebar');
    if (sidebar && isSidebar()) {
      const top = Math.max(sidebar.getBoundingClientRect().top, header.getBoundingClientRect().bottom + 12);
      sidebar.style.maxHeight = `${Math.max(180, win.innerHeight - top - 12)}px`;
    } else if (sidebar) sidebar.style.removeProperty('max-height');
    doc.documentElement.style.setProperty('--secure-navigation-height', `${isSidebar() ? 0 : Math.ceil(nav.getBoundingClientRect().height)}px`);
  };
  const paint = () => {
    current.textContent = `Aufgabe ${index + 1} von ${sections.length}`;
    previous.disabled = index === 0;
    next.disabled = index === sections.length - 1;
    overview.querySelectorAll('button').forEach((button, i) => {
      paintAnswerCompletion(button, i, sections[i]?.dataset.answerState === 'answered');
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const active = overview.querySelector('[aria-current]');
    if (!overview.hidden && active && revealedIndex !== index) {
      revealedIndex = index;
      const item = active.getBoundingClientRect(), box = overview.getBoundingClientRect();
      if (item.top < box.top) overview.scrollTop += item.top - box.top;
      else if (item.bottom > box.bottom) overview.scrollTop += item.bottom - box.bottom;
    }
  };
  const closeOverview = () => {
    overview.hidden = !isSidebar();
    toggle.setAttribute('aria-expanded', String(isSidebar()));
    measure();
  };
  const go = targetIndex => {
    const section = sections[targetIndex];
    if (!section) return;
    index = targetIndex;
    closeOverview();
    paint();
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
    // Instant positioning avoids a scroll animation fighting audio/input/keyboard interaction.
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  const sync = () => {
    frame = null;
    measure();
    if (!sections.length || assessment.classList.contains('hidden')) return;
    const boundary = Math.max(header.getBoundingClientRect().bottom, isSidebar() ? 0 : nav.getBoundingClientRect().bottom) + 16;
    index = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= boundary) index = i; });
    // The final question cannot always reach the sticky edge: scrolling stops at the footer.
    const documentHeight = doc.documentElement.scrollHeight;
    if (documentHeight > win.innerHeight && win.scrollY + win.innerHeight >= documentHeight - 2) index = sections.length - 1;
    paint();
  };
  const schedule = () => { if (frame == null) frame = win.requestAnimationFrame(sync); };
  const rebuild = () => {
    sections = Array.from(questions.querySelectorAll('.secureQuestion[data-qid]'));
    nav.hidden = sections.length === 0;
    index = Math.min(index, Math.max(0, sections.length - 1));
    overview.replaceChildren(...sections.map((_, i) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.textContent = String(i + 1);
      button.setAttribute('aria-label', `Aufgabe ${i + 1}`);
      button.addEventListener('click', () => go(i));
      return button;
    }));
    closeOverview();
    if (sections.length) paint();
    schedule();
  };
  const onPrevious = () => go(index - 1);
  const onNext = () => go(index + 1);
  const onToggle = () => {
    if (isSidebar()) return;
    overview.hidden = !overview.hidden;
    toggle.setAttribute('aria-expanded', String(!overview.hidden));
    measure();
    paint();
  };
  const onKey = event => {
    if (event.key === 'Escape' && !isSidebar() && !overview.hidden) { closeOverview(); toggle.focus(); }
  };
  const onLayout = () => {
    revealedIndex = -1;
    const active = doc.activeElement;
    const moveFocus = isSidebar() ? active === toggle : overview.contains(active);
    closeOverview();
    if (moveFocus) (isSidebar() ? overview.querySelector('[aria-current]') : toggle)?.focus({preventScroll:true});
    schedule();
  };
  layout?.addEventListener?.('change', onLayout);
  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  toggle.addEventListener('click', onToggle);
  nav.addEventListener('keydown', onKey);
  doc.addEventListener('gradecrew:student-progress', paint);
  win.addEventListener('scroll', schedule, { passive: true });
  win.addEventListener('resize', schedule, { passive: true });
  win.visualViewport?.addEventListener('resize', schedule, { passive: true });
  const resize = win.ResizeObserver ? new win.ResizeObserver(schedule) : null;
  resize?.observe(header);
  resize?.observe(nav);
  const timer = doc.getElementById('secureTimer');
  if (timer) resize?.observe(timer);
  // i18n/header updates and late image/audio layout changes can change the sticky offset.
  const mutation = new win.MutationObserver(rebuild);
  mutation.observe(questions, { childList: true });
  const visibility = new win.MutationObserver(schedule);
  visibility.observe(assessment, { attributes: true, attributeFilter: ['class'] });
  questions.addEventListener('load', schedule, true);
  doc.fonts?.ready.then(schedule);
  rebuild();
  return () => {
    if (frame != null) win.cancelAnimationFrame(frame);
    resize?.disconnect(); mutation.disconnect(); visibility.disconnect();
    doc.removeEventListener('gradecrew:student-progress', paint);
    previous.removeEventListener('click', onPrevious); next.removeEventListener('click', onNext);
    toggle.removeEventListener('click', onToggle); nav.removeEventListener('keydown', onKey);
    layout?.removeEventListener?.('change', onLayout);
    win.removeEventListener('scroll', schedule); win.removeEventListener('resize', schedule);
    win.visualViewport?.removeEventListener('resize', schedule);
    questions.removeEventListener('load', schedule, true);
  };
}

if (typeof document !== 'undefined') mountSecureQuestionNavigation();
