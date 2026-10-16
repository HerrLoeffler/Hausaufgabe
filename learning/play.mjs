export function element(document, tag, text, attributes = {}) {
  const node = document.createElement(tag); if (text !== undefined) node.textContent = text;
  for (const [key,value] of Object.entries(attributes)) node.setAttribute(key,value); return node;
}
export function remainingSeconds(state, receivedAt, localNow = Date.now()) {
  return state.endsAt === null ? null : Math.max(0,Math.ceil((state.endsAt - state.serverNow - Math.max(0,localNow-receivedAt))/1000));
}
export function renderTask(root, task) {
  const d = root.ownerDocument; root.replaceChildren(element(d,'h2',task.text));
  const form = element(d,'div',undefined,{ class: 'learningInputs' }); root.append(form);
  const input = (label,type='text') => { const wrap = element(d,'label',label), field = element(d,'input',undefined,{ type, autocomplete: 'off' }); wrap.append(field); form.append(wrap); return field; };
  const select = (label,choices) => { const wrap = element(d,'label',label), field = element(d,'select'); field.append(element(d,'option','Bitte wählen',{ value: '' })); choices.forEach((choice,i) => field.append(element(d,'option',choice,{ value: i }))); wrap.append(field); form.append(wrap); return field; };
  if (['single','multi','dropdown'].includes(task.type)) {
    if (task.type === 'dropdown') { const field = select('Deine Antwort',task.options); return () => field.value === '' ? [] : [Number(field.value)]; }
    const fields = task.options.map((option,i) => { const field = input(option,task.type === 'multi' ? 'checkbox' : 'radio'); field.name = 'learningChoice'; field.value = String(i); return field; }); return () => fields.filter(f => f.checked).map(f => Number(f.value));
  }
  if (['matching','grouping'].includes(task.type)) { const fields = task.left.map(left => select(left,task.right)); return () => fields.map(f => f.value === '' ? -1 : Number(f.value)); }
  if (task.type === 'ordering') {
    const fields = task.items.map((_,i) => select(`${i+1}. Position`,task.items)); return () => fields.map(f => f.value === '' ? -1 : Number(f.value));
  }
  if (task.type === 'gapfill') { const fields = Array.from({ length: task.gapCount },(_,i) => input(`Lücke ${i+1}`)); return () => fields.map(f => f.value); }
  if(task.type==='markwords'){
    form.append(element(d,'p',task.tokens.map(t=>t.text).join('')));
    const words=task.tokens.filter(t=>t.index!==null);
    if(task.markGroups?.length){const fields=words.map(word=>{const field=select(`${word.text} (Wort ${word.index+1})`,task.markGroups.map(g=>g.name));field.options[0].textContent='Nicht markieren';field.addEventListener('change',()=>{field.dataset.color=task.markGroups[Number(field.value)]?.color||'';});return{field,index:word.index};});return()=>Object.fromEntries(fields.filter(x=>x.field.value!=='').map(x=>[String(x.index),task.markGroups[Number(x.field.value)].color]));}
    const fields=words.map(word=>({field:input(`${word.text} (Wort ${word.index+1})`,'checkbox'),index:word.index}));return()=>fields.filter(x=>x.field.checked).map(x=>x.index);
  }
  if (task.type === 'truefalse') { const field = select('Deine Antwort',['Wahr','Falsch']); return () => field.value === '' ? null : field.value === '0'; }
  const field = input(task.type === 'number' ? `Deine Zahl${task.unit ? ` (${task.unit})` : ''}` : 'Deine Kurzantwort'); if (task.type === 'number') field.inputMode = 'decimal'; return () => field.value;
}
export async function createPlayer(root, { call, publicationId, storage = localStorage, clock = Date.now, onExit = () => {}, development = false }) {
  const d = root.ownerDocument, storageKey = `gc-learning-${publicationId}`;
  let saved; try { saved = JSON.parse(storage.getItem(storageKey) || 'null'); } catch { saved = null; }
  let state, receivedAt, stopped = false, busy = false, readAnswer = () => '', timer, refillRequestedPool=0;
  const shell = element(d,'section',undefined,{ class: 'learningPlayer' }); root.replaceChildren(shell);
  const header = element(d,'div',undefined,{ class: 'learningPlayHeader' }), title = element(d,'h1','Wissensreise'), countdown = element(d,'p',undefined,{ role: 'timer', 'aria-label': 'Verbleibende Lernzeit' }); header.append(title,countdown);
  const notice = element(d,'p','Neue Beispiele stammen aus einem geprüften Vorrat. Danach übst du Aufgaben mit neu gemischter Ansicht.');
  const status = element(d,'p','',{ role: 'status', 'aria-live': 'polite' }),guide=element(d,'section',undefined,{class:'learningGuide','aria-label':'Dein Lernschritt'}), taskRoot = element(d,'div',undefined,{ class:'learningTask' }), actions = element(d,'div',undefined,{ class:'learningActions' });
  const button = (text,fn) => { const b = element(d,'button',text,{ type:'button', class:'button secondary' }); b.addEventListener('click',fn); actions.append(b); return b; };
  const checkButton = button('Antwort prüfen',() => act('answer',readAnswer())), nextButton = button('Nächste Aufgabe',() => act('next')), helpButton = button('Hilfe',() => act('help'));
  const newRound=button('Neue Runde',async()=>{if(busy)return;busy=true;clearInterval(timer);try{const requestId=crypto.randomUUID();storage.setItem(storageKey,JSON.stringify({requestId}));const response=await call('startLearningSession',{publicationId,requestId});saved={sessionId:response.sessionId,token:response.token};storage.setItem(storageKey,JSON.stringify(saved));refillRequestedPool=0;draw(response);checkButton.disabled=nextButton.disabled=helpButton.disabled=false;timer=setInterval(tick,500);}catch(e){status.textContent=e.message;}finally{busy=false;}});newRound.hidden=true;
  button('Pause und schließen',() => { stopped = true; clearInterval(timer); onExit(); });
  button('Feedback',() => feedback());
  shell.append(header,notice,status,guide,taskRoot,actions);
  function draw(response, preserveInput = false) {
    state = response; receivedAt = clock(); title.textContent = state.title || 'Wissensreise';
    helpButton.textContent=state.progress?.helpLevel===1?'Erklärtes Beispiel':state.progress?.helpLevel===2?'Lernlösung anzeigen':'Hilfe';
    notice.textContent=state.notice||'Geprüfter Aufgabenvorrat. Automatisch erzeugte KI-Varianten können fachliche Fehler enthalten.';
    guide.replaceChildren();if(state.mode==='guided'&&state.learning){guide.append(element(d,'h2',({anschauen:'Erklärung anschauen',mitHilfe:'Mit Unterstützung üben',selbständig:'Selbständig ausprobieren',wiederholen:'Später noch einmal üben'})[state.stage]),element(d,'p',state.learning.objective));if(state.stage==='anschauen'){guide.append(element(d,'p',state.learning.explanation));if(state.learning.workedExample)guide.append(element(d,'p',`Erklärtes Beispiel: ${state.learning.workedExample}`));}if(state.stage==='mitHilfe')guide.append(element(d,'p',state.learning.hint||'Du kannst die Hilfe für diese Aufgabe öffnen.'));guide.append(element(d,'p','Dein Lernschritt wird privat gespeichert. Daraus wird keine Note oder Kompetenzbewertung abgeleitet.'));}
    status.textContent = state.feedback?.message || (state.repetition ? 'Wiederholung: Neue Varianten sind derzeit nicht verfügbar. Du kannst mit dem geprüften Vorrat weiterlernen.' : 'In deinem Tempo. Du kannst Hilfe verwenden oder weiterspielen.');
    newRound.hidden=!state.ended;
    if (state.ended) { taskRoot.replaceChildren(element(d,'h2','Deine Lernzeit ist vorbei.'),element(d,'p','Du kannst eine neue Runde mit derselben Lernfreigabe starten.')); checkButton.disabled = nextButton.disabled = helpButton.disabled = true; clearInterval(timer); }
    else if (!preserveInput) { readAnswer = renderTask(taskRoot,state.task); taskRoot.querySelector('input,select')?.focus(); }
    tick();
    if(!state.ended&&state.autoVariants&&state.poolSize-state.index<=8&&refillRequestedPool!==state.poolSize){refillRequestedPool=state.poolSize;call('requestLearningRefill',{sessionId:saved.sessionId,token:saved.token}).catch(()=>{notice.textContent='Neue Varianten konnten gerade nicht nachgefüllt werden. Dein geprüfter Vorrat bleibt spielbar.';});}
  }
  function tick() { if (!state) return; const remaining = remainingSeconds(state,receivedAt,clock()); countdown.textContent = remaining === null ? 'Freies Lernen' : `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`; if (remaining === 0 && !state.ended && !busy && !stopped) act('resume'); }
  async function act(action, answer) {
    if (busy || stopped) return; busy = true; actions.querySelectorAll('button').forEach(b => b.disabled = true);
    try { const oldId = state.task?.id; const response = await call('stepLearningSession',{ sessionId:saved.sessionId, token:saved.token, action, taskId:oldId, ...(answer !== undefined ? { answer } : {}) }); draw(response,response.task?.id === oldId); }
    catch (error) { status.textContent = `${error.message || 'Verbindung unterbrochen.'} Deine Sitzung bleibt gespeichert. Verwende Fortsetzen nach dem Neuladen.`; }
    finally { busy = false; actions.querySelectorAll('button').forEach(b => b.disabled = false); if (state?.ended) checkButton.disabled = nextButton.disabled = helpButton.disabled = true; }
  }
  function feedback() {
    const oldFocus = d.activeElement, dialog = element(d,'dialog',undefined,{ class:'learningDialog', 'aria-label':'Feedback zur Wissensreise' });
    const note = element(d,'textarea',undefined,{ 'aria-label':'Dein Feedback', maxlength:1000 }), message = element(d,'p','Feedback wird als Datei gespeichert. Es wird nicht automatisch versendet. Bitte keine Namen oder Schülerdaten eingeben.');
    const close = element(d,'button','Abbrechen',{ class:'button secondary' }), save = element(d,'button','Feedbackdatei speichern',{ class:'button primary' });
    dialog.append(element(d,'h2','Feedback'),message,note,save,close); shell.append(dialog);
    const dismiss = () => { dialog.close(); dialog.remove(); oldFocus?.focus(); };
    close.onclick = dismiss; dialog.addEventListener('cancel',event => { event.preventDefault(); dismiss(); });
    save.onclick = () => { const file = new Blob([JSON.stringify({ component:'wissensreise', revision:state.revision, itemId:state.task?.id, index:state.index, message:note.value },null,2)],{ type:'application/json' }); const url = URL.createObjectURL(file), link = element(d,'a','',{ href:url, download:'wissensreise-feedback.json' }); link.click(); URL.revokeObjectURL(url); dismiss(); };
    dialog.showModal(); note.focus();
  }
  if (development) {
    const details = element(d,'details'), summary = element(d,'summary','Entwicklermodus'); details.append(summary);
    const diagnostics = element(d,'pre'); details.append(diagnostics); details.addEventListener('toggle',() => diagnostics.textContent = JSON.stringify({ revision:state?.revision, index:state?.index, serverNow:state?.serverNow, endsAt:state?.endsAt, poolSize:state?.poolSize },null,2)); shell.append(details);
    const target=element(d,'input',undefined,{type:'number',min:'0',value:'0','aria-label':'Aufgabenindex'}),jump=element(d,'button','Aufgabe öffnen'),reset=element(d,'button','Lernsitzung zurücksetzen');details.append(element(d,'p','Sprung und Reset nur für Staging-Administratoren und eigene Lernkopien.'),target,jump,reset);
    const dev=async(action,index)=>{try{draw(await call('developLearningSession',{sessionId:saved.sessionId,token:saved.token,action,index}));checkButton.disabled=nextButton.disabled=helpButton.disabled=false;}catch(e){status.textContent=e.message;}};jump.onclick=()=>dev('jump',Number(target.value));reset.onclick=()=>dev('reset');
  }
  try {
    if (saved?.sessionId && saved?.token) draw(await call('stepLearningSession',{ ...saved, action:'resume' }));
    else { const requestId = saved?.requestId || crypto.randomUUID(); storage.setItem(storageKey,JSON.stringify({ requestId })); const response = await call('startLearningSession',{ publicationId, requestId }); saved = { sessionId:response.sessionId, token:response.token }; storage.setItem(storageKey,JSON.stringify(saved)); draw(response); }
    timer = setInterval(tick,500);
  } catch (error) { status.textContent = error.message || 'Die Lernfreigabe konnte nicht geöffnet werden.'; }
  return { dispose() { stopped = true; clearInterval(timer); }, resume: () => act('resume') };
}
