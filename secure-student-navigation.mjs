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
  let sections = [];
  let index = 0;
  let frame;
  let openOnly=false;

  const measure = () => {
    doc.documentElement.style.setProperty('--secure-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    doc.documentElement.style.setProperty('--secure-navigation-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
  };
  const paint = () => {
    const title=sections[index]?.dataset.chapterTitle;
    current.textContent = `${title ? title+" · " : ""}Aufgabe ${index + 1} von ${sections.length}`;
    previous.disabled = index === 0;
    next.disabled = index === sections.length - 1;
    overview.querySelectorAll('button[data-question-index]').forEach((button, i) => {
      button.hidden=openOnly && sections[i]?.dataset.answered==='true';
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  };
  const closeOverview = () => {
    overview.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
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
    const boundary = Math.max(header.getBoundingClientRect().bottom, nav.getBoundingClientRect().bottom) + 16;
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
      button.dataset.questionIndex=String(i);
      button.textContent = String(i + 1);
      button.setAttribute('aria-label', `Aufgabe ${i + 1}`);
      button.addEventListener('click', () => go(i));
      return button;
    }));
    if(sections.some(s=>s.dataset.chapterId)) {
      let prior=null;
      for(const button of [...overview.querySelectorAll('[data-question-index]')]) {
        const section=sections[Number(button.dataset.questionIndex)];
        if(section.dataset.chapterId!==prior){const heading=doc.createElement('strong');heading.className='secureChapterOverviewTitle';heading.textContent=section.dataset.chapterTitle;button.before(heading);prior=section.dataset.chapterId;}
      }
      const filter=doc.createElement('button');filter.type='button';filter.textContent='Nur offene Aufgaben';filter.setAttribute('aria-pressed',String(openOnly));
      filter.addEventListener('click',()=>{openOnly=!openOnly;filter.setAttribute('aria-pressed',String(openOnly));paint();});overview.prepend(filter);
    }
    closeOverview();
    if (sections.length) paint();
    schedule();
  };
  const onPrevious = () => go(index - 1);
  const onNext = () => go(index + 1);
  const onToggle = () => {
    overview.hidden = !overview.hidden;
    toggle.setAttribute('aria-expanded', String(!overview.hidden));
    measure();
  };
  const onKey = event => {
    if (event.key === 'Escape' && !overview.hidden) { closeOverview(); toggle.focus(); }
  };
  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  toggle.addEventListener('click', onToggle);
  nav.addEventListener('keydown', onKey);
  questions.addEventListener('chapter-progress',schedule);
  win.addEventListener('scroll', schedule, { passive: true });
  win.addEventListener('resize', schedule, { passive: true });
  win.visualViewport?.addEventListener('resize', schedule, { passive: true });
  const resize = win.ResizeObserver ? new win.ResizeObserver(schedule) : null;
  resize?.observe(header);
  resize?.observe(nav);
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
    previous.removeEventListener('click', onPrevious); next.removeEventListener('click', onNext);
    toggle.removeEventListener('click', onToggle); nav.removeEventListener('keydown', onKey);
    win.removeEventListener('scroll', schedule); win.removeEventListener('resize', schedule);
    win.visualViewport?.removeEventListener('resize', schedule);
    questions.removeEventListener('chapter-progress',schedule);
    questions.removeEventListener('load', schedule, true);
  };
}

if (typeof document !== 'undefined') mountSecureQuestionNavigation();
