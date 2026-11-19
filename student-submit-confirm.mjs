let nextDialogId = 0;

export function requestStudentSubmitConfirmation(message, { doc = globalThis.document, signal, preview = false, answered, open } = {}) {
  if (signal?.aborted) return Promise.resolve(false);
  const previousFocus = doc.activeElement;
  const dialog = doc.createElement('dialog');
  const title = doc.createElement('h2');
  const text = doc.createElement('p');
  const actions = doc.createElement('div');
  const cancel = doc.createElement('button');
  const approve = doc.createElement('button');

  const english = /^en(?:-|$)/i.test(doc.documentElement.lang);
  const word = english ? 'SUBMIT' : 'ABGEBEN';
  const label = doc.createElement('label');
  const input = doc.createElement('input');
  const counts = doc.createElement('div');
  const descriptionId = `student-submit-confirm-description-${nextDialogId + 1}`;
  counts.id = descriptionId;
  counts.dataset.submitCounts = '';
  counts.textContent = Number.isFinite(answered) && Number.isFinite(open)
    ? english ? `${answered} answered · ${open} open` : `${answered} beantwortet · ${open} offen`
    : '';
  if (Number(open) > 0) {
    const warning = doc.createElement('p');
    warning.dataset.submitWarning = '';
    warning.textContent = english ? 'Some tasks are still open. Submit only if you want to finish now.' : 'Es sind noch Aufgaben offen. Gib nur ab, wenn du den Test jetzt beenden möchtest.';
    counts.append(warning);
  }
  label.textContent = english ? `Type ${word} to confirm.` : `Schreibe ${word} zur Bestätigung.`;
  input.type = 'text';
  input.id = `student-submit-confirm-word-${nextDialogId + 1}`;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('autocapitalize', 'characters');
  label.htmlFor = input.id;
  const matchesWord = () => preview || input.value.normalize('NFKC').trim().toUpperCase() === word;
  const onInput = () => { approve.disabled = !matchesWord(); };
  input.addEventListener('input', onInput);
  onInput();

  title.id = `student-submit-confirm-title-${++nextDialogId}`;
  title.textContent = preview ? english ? 'Evaluate preview' : 'Vorschau auswerten' : english ? 'Submit test' : 'Test abgeben';
  text.textContent = english
    ? preview ? 'Preview only. No submission will be saved.' : 'This submission is final. You cannot change your answers afterwards.'
    : message || (preview ? 'In der Vorschau wird keine Abgabe gespeichert.' : 'Die Abgabe ist endgültig. Danach kannst du deine Antworten nicht mehr ändern.');
  cancel.type = approve.type = 'button';
  cancel.className = 'button secondary';
  approve.className = 'button primary';
  cancel.dataset.action = 'cancel';
  approve.dataset.action = 'confirm';
  cancel.textContent = english ? 'Cancel' : 'Abbrechen';
  approve.textContent = preview ? english ? 'Evaluate preview' : 'Vorschau auswerten' : english ? 'Submit final answers' : 'Verbindlich abgeben';
  actions.className = 'shareDialogFoot';
  actions.append(cancel, approve);
  dialog.className = 'shareDialog studentSubmitConfirm';
  dialog.setAttribute('aria-labelledby', title.id);
  dialog.setAttribute('aria-describedby', descriptionId);
  // This dialog owns its bilingual labels, including the word the student must type.
  dialog.setAttribute('data-i18n-ignore', '');
  dialog.append(title, counts, text);
  if (!preview) dialog.append(label, input);
  dialog.append(actions);
  doc.body.append(dialog);

  return new Promise(resolve => {
    let settled = false;
    const finish = approved => {
      if (settled) return;
      settled = true;
      cancel.removeEventListener('click', onCancel);
      approve.removeEventListener('click', onApprove);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onCancel);
      input.removeEventListener('input', onInput);
      signal?.removeEventListener('abort', onCancel);
      try { dialog.close?.(); } catch { /* The fallback uses the open attribute. */ }
      dialog.remove();
      if (previousFocus?.isConnected) previousFocus.focus();
      resolve(approved);
    };
    const onCancel = event => { event?.preventDefault?.(); finish(false); };
    const onApprove = () => { if (matchesWord()) finish(true); };
    cancel.addEventListener('click', onCancel);
    approve.addEventListener('click', onApprove);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onCancel);
    signal?.addEventListener('abort', onCancel, { once: true });
    try { dialog.showModal(); } catch { dialog.setAttribute('open', ''); }
    cancel.focus();
  });
}
