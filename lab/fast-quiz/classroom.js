/* New classroom entry; room results are always confirmed by fastQuizApi. */
(() => {
  'use strict';
  const API_URL = 'https://europe-west1-hausaufgabe-staging.cloudfunctions.net/fastQuizApi';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const math = () => window.FastQuizClassroomMath;
  const storage = {get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
  const session = {get(key){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}},set(key,value){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}}};
  const state = {role:null, creds:null, config:{category:'mental',level:'n1',gameMode:'solo'}, room:null, task:null, taskKey:null, practice:null, practiceIndex:0, local:null, busy:false, pollBusy:false, generation:0, offset:0, board:false};
  let root, pollTimer, clockTimer;
  const $ = selector => root.querySelector(selector);
  const time = ms => {const n=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
  const categoryName = c => c==='paper'?'Stift und Block':'Kopfrechnen';
  const modeName = m => ({solo:'Allein üben',computer:'Klasse gegen Computer',teams:'Vier Teams gegeneinander'}[m]||m);
  const configText = c => `${categoryName(c.category)} · Level ${String(c.level).slice(1)} · ${modeName(c.gameMode)}`;
  const button = (action,text,kind='secondary',extra='') => `<button type="button" class="fq-${kind}" data-fq-action="${action}" ${extra}>${text}</button>`;
  const error = message => {const el=$('[data-fq-error]');if(el)el.textContent=message||'';};
  function stop(){clearInterval(pollTimer);clearInterval(clockTimer);pollTimer=clockTimer=null;state.generation++;}
  async function api(action,payload={}) {
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload}),signal:controller.signal});
      const body=await response.json().catch(()=>null);
      if(!response.ok||!body?.ok)throw new Error(body?.error?.message||'Die Runde ist gerade nicht erreichbar. Bitte erneut versuchen.');
      return body.data;
    }catch(err){if(err.name==='AbortError')throw new Error('Die Verbindung dauert zu lange. Bitte erneut versuchen.');throw err;}finally{clearTimeout(timeout);}
  }
  async function act(work){if(state.busy)return;state.busy=true;error('');root.setAttribute('aria-busy','true');root.querySelectorAll('[data-fq-action],button[type="submit"]').forEach(b=>b.disabled=true);try{await work();}catch(err){error(err.message);}finally{state.busy=false;root.removeAttribute('aria-busy');root.querySelectorAll('[data-fq-action],button[type="submit"]').forEach(b=>b.disabled=false);syncHostButtons();}}
  function content(html){root.innerHTML=html+'<p class="fq-error" data-fq-error role="alert"></p>';}
  function choice(name,value,title,description,selected){return `<label class="fq-choice"><input type="radio" name="${name}" value="${value}" ${selected?'checked':''}><span><strong>${title}</strong>${description?`<small>${description}</small>`:''}</span></label>`;}
  function home(){
    stop();state.role=null;state.creds=null;state.room=null;state.task=null;state.local=null;state.practice=null;state.board=false;root.classList.remove('fq-board-mode');
    content(`<header class="fq-heading"><h1>Mathe spielen</h1><p>Grundrechenarten üben: passende Aufgaben wählen, die Spielweise festlegen und loslegen.</p></header>
      <div class="fq-layout"><form class="fq-setup" data-fq-form="setup">
      <fieldset class="fq-step"><legend><span class="fq-step-number">1</span> Welche Aufgaben?</legend><div class="fq-category-grid">
      ${choice('fq-category','mental','Kopfrechnen','100 % Kopfrechenaufgaben. Geschickt statt schriftlich rechnen.',state.config.category==='mental')}
      ${choice('fq-category','paper','Stift und Block','65 % anspruchsvoll im Kopf, 35 % mit Stift und Papier.',state.config.category==='paper')}</div>
      <div class="fq-level-row"><span>Dein Level</span><div class="fq-levels" role="radiogroup" aria-label="Level">${[1,2,3,4].map(n=>choice('fq-level','n'+n,String(n),'',state.config.level==='n'+n)).join('')}</div></div>
      <div class="fq-example" data-fq-example></div></fieldset>
      <fieldset class="fq-step"><legend><span class="fq-step-number">2</span> Wie spielen?</legend><div class="fq-mode-grid">
      ${choice('fq-mode','solo','Allein üben','In deinem Tempo. Ohne Rangliste.',state.config.gameMode==='solo')}
      ${choice('fq-mode','computer','Klasse gegen Computer','Zusammen Energie sammeln und das Ziel erreichen.',state.config.gameMode==='computer')}
      ${choice('fq-mode','teams','Vier Teams','Gemeinsam im Team rechnen. Faire Wertung auch bei ungleichen Teamgrößen.',state.config.gameMode==='teams')}</div></fieldset>
      <fieldset class="fq-step"><legend><span class="fq-step-number">3</span> Bereit?</legend><p class="fq-summary" data-fq-summary></p><button class="fq-primary" type="submit" data-fq-start>Übung starten</button>
      <details class="fq-advanced"><summary>So läuft die Runde</summary><p data-fq-rules></p><p>Kein Taschenrechner. Bei Stift und Block liegen Papier und Stift bereit. Zusatzoptionen der bisherigen Spielmodi findest du unten.</p></details></fieldset></form>
      <aside class="fq-join"><h2>Du hast einen Code?</h2><p>Deine Lehrkraft hat alles vorbereitet. Hier trittst du der Runde bei.</p><form data-fq-form="join"><label class="fq-field">Rundencode<input name="code" class="fq-code-input" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="off" required placeholder="123456" aria-label="6-stelliger Rundencode"></label><label class="fq-field">Dein Kürzel<input name="name" maxlength="24" required autocomplete="nickname" placeholder="z. B. Alex" value="${esc(storage.get('fq-classroom-name')||'')}"></label><button class="fq-secondary" type="submit">Runde beitreten</button></form></aside></div>
      <details class="fq-legacy"><summary>Bisherige Spielmodi und Einstellungen</summary><p class="fq-note">Bisheriges Training, All-Time-Highscore und Live-Runden mit den bisherigen Regeln.</p>${button('legacy','Bisherige Spielmodi öffnen')}</details>`);
    updateSetup();
  }
  function updateSetup(){
    const category=$('[name="fq-category"]:checked')?.value||'mental',level=$('[name="fq-level"]:checked')?.value||'n1',gameMode=$('[name="fq-mode"]:checked')?.value||'solo';
    state.config={category,level,gameMode};
    $('[data-fq-example]').innerHTML=`<small>So sehen die Aufgaben aus</small><strong>${esc(math()?.examples?.[category]?.[level]||'Das Aufgabenbeispiel wird geladen.')}</strong><small>${category==='mental'?'Alle Aufgaben sind für das Rechnen im Kopf gedacht.':'H = im Kopf · P = mit Stift und Papier. 20 Aufgaben: 13 H + 7 P; kurze Runde: 3 H + 2 P.'}</small>`;
    $('[data-fq-summary]').textContent=configText(state.config);
    $('[data-fq-start]').textContent=gameMode==='solo'?'Übung starten':'Klassenrunde vorbereiten';
    $('[data-fq-rules]').textContent=gameMode==='solo'?'Du übst ohne Zeitlimit. Hinweise und Korrekturen helfen dir weiter.':gameMode==='teams'?'5 Minuten, fünf gemeinsame Wertungsfenster. Pro Person und Fenster: 20 Punkte ohne Hinweis, 10 mit Hinweis, sonst 0. Die Teamenergie berücksichtigt die feste Teamgröße.':'5 Minuten, fünf gemeinsame Wertungsfenster. Gemeinsam Energie sammeln: 20 Punkte ohne Hinweis, 10 mit Hinweis, sonst 0. Nach Erfolg entscheidet die Lehrkraft über die nächste Runde.';
  }
  function saveCredentials(){session.set('fq-classroom-active', {role:state.role,creds:state.creds});}
  async function createRoom(){
    const capabilities=await api('ping');
    if(capabilities.classroomVersion!==1||!capabilities.classroomModes?.includes(state.config.gameMode))throw new Error('Diese Klassen-Spielweise ist auf diesem Staging noch nicht bereit. Du kannst inzwischen allein üben.');
    const result=await api('classroomCreate',{config:state.config});
    state.role='host';state.creds={code:result.code,hostToken:result.hostToken};saveCredentials();state.room=null;state.task=null;state.taskKey=null;roomShell();await refresh();pollTimer=setInterval(()=>refresh(),2000);
  }
  async function joinRoom(form){
    const code=String(form.get('code')||'').trim(),name=String(form.get('name')||'').trim();
    if(!/^\d{6}$/.test(code)||!name)throw new Error('Bitte den 6-stelligen Code und dein Kürzel eingeben.');
    let joinKey=storage.get('fq-classroom-join:'+code);if(!joinKey){joinKey=crypto.randomUUID();storage.set('fq-classroom-join:'+code,joinKey);}
    const result=await api('classroomJoin',{code,name,joinKey});state.role='player';state.creds={code,playerId:result.playerId,playerToken:result.playerToken};storage.set('fq-classroom-name',name);saveCredentials();state.room=null;state.task=null;state.taskKey=null;roomShell();await refresh();pollTimer=setInterval(()=>refresh(),2000);
  }
  function roomShell(){
    content(`<header class="fq-room-header"><div><h1>${state.role==='host'?'Deine Klassenrunde':'Du bist dabei'}</h1><p data-fq-room-summary></p></div><div class="fq-actions">${state.role==='host'?button('board','Boardansicht'):''}${button('home','Zur Startseite')}</div></header><div data-fq-room-body></div>`);
    clockTimer=setInterval(updateClock,250);
  }
  function updateClock(){
    const r=state.room;if(!r)return;const now=Date.now()+state.offset;
    const countdown=$('[data-fq-countdown]');if(countdown){countdown.hidden=now>=r.startsAtMs;countdown.textContent=`Gemeinsamer Start in ${time(r.startsAtMs-now)}`;}
    root.querySelectorAll('[data-fq-clock]').forEach(e=>e.textContent=r.status==='running'?time(r.endsAtMs-now):'0:00');
    root.querySelectorAll('[data-fq-window]').forEach(e=>e.textContent=time((state.task?.slotEndsAtMs||Math.min(r.endsAtMs,(r.startsAtMs||0)+((r.slot||0)+1)*60000))-now));
  }
  async function refresh(){
    if(state.pollBusy||!state.creds)return;state.pollBusy=true;const gen=state.generation;
    try{const data=await api('classroomState',state.creds);if(gen!==state.generation)return;state.room=data;state.config=data.config||state.config;if(Number.isFinite(data.serverNowMs))state.offset=data.serverNowMs-Date.now();renderRoom();
      if(state.role==='player'&&data.status==='running'&&Date.now()+state.offset>=data.startsAtMs&&!state.busy){const task=await api('classroomTask',state.creds);if(gen!==state.generation)return;const key=`${data.roundId}:${task.slot}:${task.question?.id}`;if(key!==state.taskKey){state.task=task;state.taskKey=key;state.practice=null;renderStudentTask();}}
      const status=$('[data-fq-connection]');if(status)status.textContent='Verbunden';
    }catch(err){if(gen===state.generation)error(err.message+' Deine Runde bleibt erhalten.');}finally{state.pollBusy=false;}
  }
  function boardHTML(r){
    if(r.config?.gameMode==='teams')return `<div class="fq-board-grid">${(r.teams||[]).map(t=>`<article class="fq-team" style="--team-color:${/^#[0-9a-f]{6}$/i.test(t.color)?t.color:'#285ac9'}"><h2>${esc(t.name)}</h2><div class="fq-team-score">${esc(t.energy||0)} <small>/ 1000</small></div><progress class="fq-energy" max="1000" value="${Math.max(0,Math.min(1000,Number(t.energy)||0))}" aria-label="${esc(t.name)}: Teamenergie"></progress><p>Platz ${esc(t.rank||'–')} · ${esc(t.size||0)} Personen</p><p class="fq-note">Gesammelte Punkte: ${esc(t.rawScore||0)}</p></article>`).join('')}</div>`;
    return `<div class="fq-panel fq-coop"><h2>Gemeinsam gegen den Computer</h2><p>Runde ${esc(r.round||1)} · Ziel: ${esc(r.target||500)} Energie</p><div class="fq-team-score">${esc(r.energy||0)} <small>/ ${esc(r.target||500)}</small></div><progress class="fq-energy" max="${Number(r.target)||500}" value="${Math.max(0,Number(r.energy)||0)}" aria-label="Gemeinsame Energie"></progress><p class="fq-note">Die Energie berücksichtigt die feste Anzahl der Mitspielenden. Zielwerte: 500, 600, 600, 700. Runde 3 ergänzt einen kleinen Rechenschritt.</p></div>`;
  }
  function renderRoom(){
    const r=state.room;if(!r)return;$('[data-fq-room-summary]').textContent=configText(r.config||state.config);
    if(state.role==='player'){
      const key=`${r.status}:${r.roundId}`;const holder=$('[data-fq-room-body]');
      if(holder.dataset.key!==key){holder.dataset.key=key;
        if(r.status==='running'){holder.innerHTML=`<div class="fq-clockbar"><div><small>Rundenzeit</small><span class="fq-round-clock" data-fq-clock></span></div><div><small>Gemeinsames Wertungsfenster ${Number(r.slot)+1} von 5</small><span data-fq-window></span></div></div><p class="fq-status" data-fq-countdown></p><div data-fq-task-holder></div><p class="fq-status" data-fq-connection>Verbunden</p>`;state.taskKey=null;}
        else if(r.status==='waiting')holder.innerHTML=`<article class="fq-panel fq-waiting"><h2>Bereit zum Rechnen</h2><p data-fq-self></p><p>Die Lehrkraft startet die Runde. Du musst nichts einstellen.</p><div class="fq-material">${esc(r.config?.category==='paper'?'Stift und Papier bereitlegen · kein Taschenrechner':'Im Kopf rechnen · kein Taschenrechner')}</div><p>Rundencode: <strong>${esc(r.code)}</strong></p></article>`;
        else holder.innerHTML=`<article class="fq-panel fq-waiting"><h2>${r.status==='aborted'?'Runde abgebrochen':'Runde beendet'}</h2><p>${r.status==='aborted'?'Diese Runde hat kein Siegergebnis.':'Gut mitgerechnet. Die Lehrkraft entscheidet, wie es weitergeht.'}</p><p data-fq-self></p></article>${r.status==='finished'?boardHTML(r):''}`;
      }
      const self=$('[data-fq-self]');if(self){const team=r.config?.gameMode==='teams'?(r.teams||[]).find(t=>t.id===r.self?.teamId):null;self.textContent=[r.self?.name,team?.name,r.status==='finished'?`${r.self?.score||0} gesammelte Punkte`:''].filter(Boolean).join(' · ');}
      const windowLabel=$('[data-fq-window]')?.previousElementSibling;if(windowLabel)windowLabel.textContent=`Gemeinsames Wertungsfenster ${Number(r.slot)+1} von 5`;
      updateClock();return;
    }
    const holder=$('[data-fq-room-body]');
    // Keep focused teacher controls stable while roster/status refreshes.
    if(!holder.querySelector('[data-fq-board]'))holder.innerHTML=`<div class="fq-clockbar"><div><small data-fq-room-status></small><span class="fq-round-clock" data-fq-clock></span></div><div><small>Mitspielende</small><strong data-fq-player-count></strong></div></div><div class="fq-lobby-grid"><aside class="fq-panel"><h2>Runde beitreten</h2><p>Code eingeben oder QR-Code scannen.</p><div class="fq-room-code">${esc(state.creds.code)}</div><div class="fq-qr" data-fq-qr></div><div class="fq-actions">${button('copy','Beitrittslink kopieren')}</div></aside><section class="fq-panel"><h2>Wer ist dabei?</h2><p class="fq-note">Nur hier sieht die Lehrkraft die Kürzel. Die Boardansicht zeigt ausschließlich Teams.</p><ul class="fq-roster" data-fq-roster></ul></section></div><p class="fq-board-code">Rundencode: <strong>${esc(state.creds.code)}</strong></p><div data-fq-board></div><p data-fq-result role="status"></p><div class="fq-actions fq-host-controls">${button('start','Gemeinsam starten','primary')}${button('retry','Runde wiederholen')}${button('next','Nächste Runde','primary')}${button('stop','Runde abbrechen','danger')}</div><p class="fq-note fq-host-controls">5 × 60 Sekunden. Keine Geschwindigkeitsboni; nach dem Wertungsversuch kannst du ohne Wertung weiterüben. Die Teamgröße bleibt nach dem Start fest.</p><p class="fq-status" data-fq-connection>Verbunden</p>`;
    $('[data-fq-room-status]').textContent=({waiting:'Warten auf den gemeinsamen Start',running:`Runde ${r.round||1} läuft`,finished:'Runde beendet',aborted:'Runde abgebrochen – kein Siegergebnis'}[r.status]||r.status);
    $('[data-fq-player-count]').textContent=String(r.playerCount||0);
    $('[data-fq-board]').innerHTML=boardHTML(r);
    const roster=$('[data-fq-roster]');const members=r.members||[];
    const rosterKey=JSON.stringify(members.map(m=>[m.id,m.name,m.teamId]));
    if(roster.dataset.key!==rosterKey&&document.activeElement?.closest('[data-fq-roster]')==null){roster.dataset.key=rosterKey;roster.innerHTML=members.length?members.map(m=>`<li><span>${esc(m.name)}</span>${r.config?.gameMode==='teams'?`<select data-fq-team="${esc(m.id)}" aria-label="Team für ${esc(m.name)}" ${r.status==='running'?'disabled':''}>${(math()?.teams||r.teams||[]).map(t=>`<option value="${t.id}" ${t.id===m.teamId?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`:''}</li>`).join(''):'<li>Noch niemand dabei. Teile den Code mit der Klasse.</li>';}
    $('[data-fq-result]').textContent=r.status==='finished'?(r.config.gameMode==='computer'?(r.success?'Ziel erreicht! Ihr könnt gemeinsam in die nächste Runde gehen.':'Das Ziel wurde noch nicht erreicht. Ihr könnt die Runde wiederholen.'):'Die Platzierung ergibt sich aus der Teamenergie. Gleiche Energie bedeutet denselben Platz.') : '';
    root.querySelectorAll('[data-fq-team]').forEach(select=>select.disabled=state.busy||r.status==='running');
    const qr=$('[data-fq-qr]');if(qr&&!qr.childElementCount&&window.QRCode)new window.QRCode(qr,{text:joinURL(),width:156,height:156,correctLevel:window.QRCode.CorrectLevel.M});
    syncHostButtons();updateClock();
  }
  function syncHostButtons(){
    if(state.role!=='host'||!state.room)return;const r=state.room;
    const set=(action,visible,disabled=false)=>{const b=$(`[data-fq-action="${action}"]`);if(b){b.hidden=!visible;b.disabled=state.busy||disabled;}};
    set('start',r.status==='waiting',!r.playerCount);set('stop',r.status==='running');set('retry',['finished','aborted'].includes(r.status));set('next',r.status==='finished'&&r.config?.gameMode==='computer'&&r.success&&r.round<4);
  }
  function joinURL(){const u=new URL(location.href);u.search='';u.searchParams.set('classroom',state.creds.code);u.hash='';return u.href;}
  function taskHTML(task,practice=false){
    const q=task.question||task;return `<article class="fq-task"><div class="fq-task-meta"><span>${practice?'Freies Weiterüben · ohne Wertung':task.practice||state.room?.self?.scored===false?'Ohne Wertung bis zur nächsten Runde':state.local?'Allein üben · ohne Zeitlimit':'Wertungsaufgabe'}</span><span>${esc(configText(state.config))}</span></div><div class="fq-material" data-kind="${q.kind==='P'?'P':'H'}">${esc(q.material|| (q.kind==='P'?'Stift und Papier':'Im Kopf'))} · kein Taschenrechner</div><p class="fq-note">${esc(q.hintOrientation||'Nimm dir Zeit zum Nachdenken.')}</p>${!state.local&&!practice?'<p class="fq-note">Erste Antwort: 20 Punkte ohne Hinweis, 10 mit Hinweis, sonst 0. Korrekturen bleiben ohne neue Wertung. Das Zeitfenster ist keine Geschwindigkeitswertung.</p>':''}<div class="fq-task-question">${esc(q.prompt)}</div><form class="fq-answer-form" data-fq-form="answer"><label class="fq-field">Dein Ergebnis<input name="answer" inputmode="decimal" autocomplete="off" required aria-label="Dein Ergebnis"></label><button class="fq-primary" type="submit">Antwort prüfen</button></form><div class="fq-actions">${button('hint',!state.local&&!practice?'Hinweis · erste richtige Antwort 10 Punkte':'Hinweis')}${button('reveal',!state.local&&!practice?'Lösung ansehen · 0 Punkte':'Lösung ansehen')}</div><div class="fq-feedback" data-fq-feedback role="status" aria-live="polite"></div><div class="fq-actions" data-fq-task-actions></div></article>`;
  }
  function renderStudentTask(){
    const holder=$('[data-fq-task-holder]');if(!holder||!state.task)return;
    const task=state.task;if(!task.question){holder.innerHTML='<article class="fq-panel"><p>Die nächste Aufgabe wird vorbereitet.</p></article>';return;}
    holder.innerHTML=taskHTML(task);if(task.answerResult){feedback(task.answerResult);showPracticeAction();}updateClock();
  }
  function feedback(result){const el=$('[data-fq-feedback]');if(!el)return;el.dataset.correct=String(Boolean(result.correct));el.innerHTML=`<strong>${result.correct?'Richtig.':'Noch nicht richtig.'}${Number.isFinite(result.points)?` ${result.points} Punkte.`:''}</strong><p>${esc(result.explanation||'')}</p>`;}
  function showPracticeAction(){const el=$('[data-fq-task-actions]');if(el)el.innerHTML=state.local?button('local-next','Nächste Aufgabe','primary'):button('practice','Feedback gelesen · ohne Wertung weiterüben');}
  function seed(){return crypto.getRandomValues(new Uint32Array(1))[0];}
  function startSolo(){if(!math())throw new Error('Die Aufgaben konnten nicht geladen werden. Bitte die Seite neu laden.');stop();state.role='solo';state.local={seed:seed(),index:0,correct:0,total:0};state.room=null;content(`<header class="fq-room-header"><div><h1>In Ruhe üben</h1><p>${esc(configText(state.config))}</p></div>${button('home','Übung beenden')}</header><div data-fq-task-holder></div>`);nextLocal();}
  function nextLocal(){state.practice=null;state.task={question:math().generateTask(state.config,state.local.seed,state.local.index++)};state.task.localAttempted=false;renderStudentTask();}
  function practice(){if(!math())throw new Error('Weiterüben ist gerade nicht verfügbar.');state.practice={question:math().generateTask(state.config,seed(),state.practiceIndex++)};$('[data-fq-task-holder]').innerHTML=taskHTML(state.practice,true);}
  async function answer(value){
    if(state.practice||state.local){const task=state.practice||state.task,q=task.question;const normalize=math().normalizeAnswer;const correct=normalize?normalize(value)===normalize(q.correct):Number(String(value).replace(',','.'))===Number(String(q.correct).replace(',','.'));if(!task.localAttempted&&state.local){state.local.total++;if(correct)state.local.correct++;task.localAttempted=true;}feedback({correct,explanation:correct?q.explanation:'Versuche es noch einmal oder nutze einen Hinweis.'});if(correct)showPracticeAction();return;}
    const result=await api('classroomAnswer',{...state.creds,slot:state.task.slot,roundId:state.task.roundId,answer:value,practice:false});feedback(result);state.task.answerResult=result;showPracticeAction();
  }
  async function hint(){
    if(state.practice||state.local){$('[data-fq-feedback]').textContent=(state.practice||state.task).question.hint;return;}
    const result=await api('classroomHint',{...state.creds,slot:state.task.slot,roundId:state.task.roundId});$('[data-fq-feedback]').textContent=result.hint;
  }
  async function reveal(){
    if(state.practice||state.local){const localTask=state.practice||state.task;const q=localTask.question;localTask.localAttempted=true;$('[data-fq-feedback]').textContent=q.explanation;showPracticeAction();return;}
    const result=await api('classroomReveal',{...state.creds,slot:state.task.slot,roundId:state.task.roundId});$('[data-fq-feedback]').textContent=`Lösung: ${result.correctAnswer}. ${result.explanation||''} Keine Wertung.`;showPracticeAction();
  }
  function legacy(){stop();root.hidden=true;document.getElementById('homeView').hidden=false;let back=document.getElementById('fq-return');if(!back){back=document.createElement('button');back.id='fq-return';back.className='secondaryButton';back.type='button';back.textContent='Zur neuen Mathe-Auswahl';document.querySelector('main.shell').prepend(back);back.addEventListener('click',()=>{document.getElementById('homeBtn')?.click();document.querySelectorAll('main.shell > .view').forEach(v=>v.hidden=true);back.hidden=true;root.hidden=false;home();});}back.hidden=false;}
  function mount(){
    if(document.getElementById('classroomApp'))return;
    const params=new URLSearchParams(location.search);
    if(!params.has('classroom')&&['join','room','mode'].some(key=>params.has(key)))return;
    const main=document.querySelector('main.shell');if(!main)return;document.querySelectorAll('main.shell > .view').forEach(v=>v.hidden=true);
    root=document.createElement('section');root.id='classroomApp';root.className='fq-classroom';main.prepend(root);
    root.addEventListener('change',event=>{if(event.target.name?.startsWith('fq-'))updateSetup();if(event.target.matches('[data-fq-team]'))act(async()=>{const assignments=Object.fromEntries([...root.querySelectorAll('[data-fq-team]')].map(el=>[el.dataset.fqTeam,Number(el.value)]));await api('classroomAssign',{...state.creds,assignments});await refresh();});});
    root.addEventListener('submit',event=>{const type=event.target.dataset.fqForm;if(!type)return;event.preventDefault();const form=new FormData(event.target);act(async()=>{if(type==='setup'){updateSetup();if(state.config.gameMode==='solo')startSolo();else await createRoom();}if(type==='join')await joinRoom(form);if(type==='answer')await answer(form.get('answer'));});});
    root.addEventListener('click',event=>{const b=event.target.closest('[data-fq-action]');if(!b)return;act(async()=>{switch(b.dataset.fqAction){case'home':session.set('fq-classroom-active',null);history.replaceState({},'',location.pathname);home();break;case'legacy':legacy();break;case'board':state.board=!state.board;root.classList.toggle('fq-board-mode',state.board);b.textContent=state.board?'Lehrkraftansicht':'Boardansicht';break;case'copy':await navigator.clipboard.writeText(joinURL());b.textContent='Link kopiert';break;case'start':case'retry':case'next':await api('classroomStart',{...state.creds,expectedRoundId:state.room?.roundId,...(b.dataset.fqAction==='retry'?{retry:true}:{}),...(b.dataset.fqAction==='next'?{next:true}:{})});await refresh();break;case'stop':await api('classroomStop',state.creds);await refresh();break;case'hint':await hint();break;case'reveal':await reveal();break;case'practice':practice();break;case'local-next':nextLocal();break;}});});
    home();const code=new URL(location.href).searchParams.get('classroom');
    const saved=session.get('fq-classroom-active');
    const resumable=saved?.creds?.code&&['host','player'].includes(saved.role)&&
      (code===null||(/^\d{6}$/.test(code)&&String(saved.creds.code)===code));
    if(resumable){
      state.role=saved.role;state.creds=saved.creds;roomShell();refresh();pollTimer=setInterval(()=>refresh(),2000);
    }else if(/^\d{6}$/.test(code||'')){
      const input=$('[name="code"]');input.value=code;$('[name="name"]').focus();
    }
  }
  window.FastQuizClassroomUI={mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
