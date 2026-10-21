let dialogSequence = 0;

export function requestPracticeSolutionConfirmation({ doc = globalThis.document, release = false } = {}) {
  const previousFocus = doc.activeElement;
  const dialog = doc.createElement('dialog');
  const title = doc.createElement('h2');
  title.id = `practice-solution-confirm-${++dialogSequence}`;
  title.textContent = 'Lösungen nach Abgabe';
  const text = doc.createElement('p');
  text.textContent = 'Nach der Abgabe können Lernende die Lösungen anzeigen.';
  const actions = doc.createElement('div');
  actions.className = 'shareDialogFoot';
  const change = doc.createElement('button');
  const approve = doc.createElement('button');
  change.type = approve.type = 'button';
  change.className = 'button secondary'; approve.className = 'button primary';
  change.dataset.action = 'change'; approve.dataset.action = 'confirm';
  change.textContent = release ? 'Abbrechen' : 'Einstellung ändern';
  approve.textContent = release ? 'Lösungen freigeben' : 'So veröffentlichen';
  actions.append(change, approve);
  dialog.className = 'shareDialog practiceSolutionConfirm';
  dialog.setAttribute('aria-labelledby', title.id);
  dialog.append(title, text, actions); doc.body.append(dialog);
  return new Promise(resolve => {
    let settled = false;
    const finish = allowed => {
      if (settled) return; settled = true;
      dialog.remove();
      if (previousFocus?.isConnected) previousFocus.focus();
      resolve(allowed);
    };
    change.addEventListener('click', () => finish(false));
    approve.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    dialog.addEventListener('close', () => finish(false));
    try { dialog.showModal(); } catch { dialog.setAttribute('open', ''); }
    change.focus();
  });
}

export function createPracticePublisher({ call, confirm = requestPracticeSolutionConfirmation }) {
  const busy = new Set();
  async function perform(quiz, action, { unchanged = () => true, onChange = () => {} } = {}) {
    if (busy.has(quiz.id)) return null;
    busy.add(quiz.id);
    try {
      const prepared = action === 'publish'
        ? await call({ quizId: quiz.id, action: 'prepare' })
        : { revision: quiz.practiceSolutionRevision, needsConfirmation: true };
      if (!unchanged()) return null;
      const approved = prepared.needsConfirmation === true ? await confirm({ release: action === 'release' }) : false;
      if (prepared.needsConfirmation && !approved) { await onChange(); return null; }
      if (!unchanged()) return null;
      return await call({ quizId: quiz.id, action, expectedRevision: prepared.revision, confirmAfterSubmit: approved });
    } finally { busy.delete(quiz.id); }
  }
  return {
    publish(quiz, options) { return quiz.solutionReleaseMode === 'practice_after_submit' ? perform(quiz, 'publish', options) : Promise.resolve(undefined); },
    release(quiz, options) { return perform(quiz, 'release', options); }
  };
}
