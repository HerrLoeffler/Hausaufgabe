let nextDialogId = 0;

export function requestStudentSubmitConfirmation(message, { doc = globalThis.document, signal, preview = false } = {}) {
  if (signal?.aborted) return Promise.resolve(false);
  const previousFocus = doc.activeElement;
  const dialog = doc.createElement('dialog');
  const title = doc.createElement('h2');
  const text = doc.createElement('p');
  const actions = doc.createElement('div');
  const cancel = doc.createElement('button');
  const approve = doc.createElement('button');

  title.id = `student-submit-confirm-title-${++nextDialogId}`;
  title.textContent = preview ? 'Vorschau auswerten' : 'Antworten abgeben';
  text.textContent = message;
  cancel.type = approve.type = 'button';
  cancel.className = 'button secondary';
  approve.className = 'button primary';
  cancel.dataset.action = 'cancel';
  approve.dataset.action = 'confirm';
  cancel.textContent = 'Abbrechen';
  approve.textContent = preview ? 'Vorschau auswerten' : 'Antworten abgeben';
  actions.className = 'shareDialogFoot';
  actions.append(cancel, approve);
  dialog.className = 'shareDialog studentSubmitConfirm';
  dialog.setAttribute('aria-labelledby', title.id);
  dialog.append(title, text, actions);
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
      signal?.removeEventListener('abort', onCancel);
      try { dialog.close?.(); } catch { /* The fallback uses the open attribute. */ }
      dialog.remove();
      if (previousFocus?.isConnected) previousFocus.focus();
      resolve(approved);
    };
    const onCancel = event => { event?.preventDefault?.(); finish(false); };
    const onApprove = () => finish(true);
    cancel.addEventListener('click', onCancel);
    approve.addEventListener('click', onApprove);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onCancel);
    signal?.addEventListener('abort', onCancel, { once: true });
    try { dialog.showModal(); } catch { dialog.setAttribute('open', ''); }
    cancel.focus();
  });
}
