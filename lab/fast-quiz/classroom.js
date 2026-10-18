/* New classroom entry; room results are always confirmed by fastQuizApi. */
(() => {
  'use strict';
  const API_URL = 'https://europe-west1-gradecrew-staging-2026.cloudfunctions.net/fastQuizApi';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const math = () => window.FastQuizClassroomMath;
  const sourceClient = () => import('./source-client.mjs');
  const storage = {get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
  const session = {get(key){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}},set(key,value){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}}};
  const state = {role:null, creds:null, config:{category:'mental',level:'n1',gameMode:'solo',durationSec:300,teamCount:4,teamNames:['Team 1','Team 2','Team 3','Team 4']},sourceKind:'curriculum',sources:null,preparation:null,sourceKey:null, room:null, task:null, taskKey:null, practice:null, practiceIndex:0, local:null, busy:false, pollBusy:false, generation:0, offset:0, board:false};
  let root, pollTimer, clockTimer;
  const $ = selector => root.querySelector(selector);
  const time = ms => {const n=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
  const categoryName = c => c==='paper'?'Stift und Block':'Kopfrechnen';
  const modeName = m => ({solo:'Allein üben',computer:'Klasse gegen Computer',teams:'Teams gegeneinander'}[m]||m);
  const configText = c => `${c.sourceTitle||'Mathematik'} · ${categoryName(c.category)} · ${modeName(c.gameMode)}${c.gameMode==='solo'?'':` · ${(c.durationSec||300)%60===0?(c.durationSec||300)/60+' Min.':Math.floor((c.durationSec||300)/60)+' Min. '+(c.durationSec%60)+' Sek.'}`}`;
  const button = (action,text,kind='secondary',extra='') => `<button type="button" class="fq-${kind}" data-fq-action="${action}" ${extra}>${text}</button>`;
  const error = message => {const el=$('[data-fq-error]');if(el)el.textContent=message||'';};
  function stop(){clearInterval(pollTimer);clearInterval(clockTimer);pollTimer=clockTimer=null;state.generation++;}
  async function api(action,payload={}) {
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const token=['classroomV2Sources','classroomV2Prepare','classroomV2Create','classroomV2Solo'].includes(action)?await (await sourceClient()).getToken():null;
      const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,payload}),signal:controller.signal});
      const body=await response.json().catch(()=>null);
      if(!response.ok||!body?.ok)throw new Error(body?.error?.message||'Die Runde ist gerade nicht erreichbar. Bitte erneut versuchen.');
      return body.data;
    }catch(err){if(err.name==='AbortError')throw new Error('Die Verbindung dauert zu lange. Bitte erneut versuchen.');throw err;}finally{clearTimeout(timeout);}
  }
  async function act(work){if(state.busy)return;state.busy=true;error('');root.setAttribute('aria-busy','true');root.querySelectorAll('[data-fq-action],button[type="submit"]').forEach(b=>b.disabled=true);try{await work();}catch(err){error(err.message);}finally{state.busy=false;root.removeAttribute('aria-busy');root.querySelectorAll('[data-fq-action],button[type="submit"]').forEach(b=>b.disabled=false);syncHostButtons();if($('[data-fq-start]'))updateSetup();}}
  function content(html){root.innerHTML=html+'<p class="fq-error" data-fq-error role="alert"></p>';}
  function choice(name,value,title,description,selected){return `<label class="fq-choice"><input type="radio" name="${name}" value="${value}" ${selected?'checked':''}><span><strong>${title}</strong>${description?`<small>${description}</small>`:''}</span></label>`;}
  function home(){
    stop();state.role=null;state.creds=null;state.room=null;state.task=null;state.local=null;state.practice=null;state.board=false;root.classList.remove('fq-board-mode');
    content(`<header class="fq-heading"><h1>Mathe spielen</h1><p>Passende Matheaufgaben wählen, die Spielweise festlegen und loslegen.</p></header>
      <div class="fq-layout"><form class="fq-setup" data-fq-form="setup">
      <fieldset class="fq-step"><legend><span class="fq-step-number">1</span> Quelle wählen</legend><div class="fq-source-grid">
      ${choice('fq-source','curriculum','Lehrplan Bayern','Mittelschule, Klasse 5–10. Verfügbare Teilkompetenzen.',state.sourceKind==='curriculum')}
      ${choice('fq-source','test','Eigener GradeCrew-Test','Aufgaben aus deinem Testkonto verwenden.',state.sourceKind==='test')}
      ${choice('fq-source','remy','Neuer Test mit Remi','Einen neuen Mathematik-Test erstellen.',state.sourceKind==='remy')}</div>
      <div data-fq-source-controls></div><p class="fq-status" data-fq-source-status role="status"></p>
      <details class="fq-advanced"><summary>Testkonto anmelden</summary><p>Verwende ein Konto der getrennten Testumgebung. Dein Schulkonto wird nicht automatisch übertragen.</p><p><a href="https://gradecrew-staging-2026.web.app/" target="_blank" rel="noopener noreferrer">Noch kein Testkonto? In der Testumgebung registrieren</a>. Kehre danach hierher zurück und melde dich mit diesem Testkonto an.</p><label class="fq-field">E-Mail<input name="source-email" type="email" autocomplete="username"></label><label class="fq-field">Passwort<input name="source-password" type="password" autocomplete="current-password"></label>${button('login','Anmelden')}${button('logout','Abmelden')}</details>
      ${button('load-sources','Quellen laden')}</fieldset>
      <fieldset class="fq-step"><legend><span class="fq-step-number">2</span> Aufgaben und Klasse</legend><div data-fq-source-options></div><div class="fq-category-grid">
      ${choice('fq-category','mental','Kopfrechnen','100 % im Kopf. Geschickt statt schriftlich rechnen.',state.config.category==='mental')}
      ${choice('fq-category','paper','Stift und Block','65 % im Kopf, 35 % mit Papier. Stift und Block bereitlegen.',state.config.category==='paper')}</div>
      <div class="fq-example" data-fq-example>Quelle laden und Aufgaben prüfen, um passende Beispiele zu sehen.</div>
      ${button('prepare','Aufgaben prüfen')}
      <div data-fq-review aria-live="polite"></div></fieldset>
      <fieldset class="fq-step"><legend><span class="fq-step-number">3</span> Spielweise</legend><div class="fq-mode-grid">
      ${choice('fq-mode','solo','Allein üben','In Ruhe und ohne Zeitlimit. Ohne Rangliste.',state.config.gameMode==='solo')}
      ${choice('fq-mode','computer','Klasse gegen Computer','Gemeinsam den normierten Zielwert erreichen.',state.config.gameMode==='computer')}
      ${choice('fq-mode','teams','Teams gegeneinander','Faire Wertung berücksichtigt die Teamgröße.',state.config.gameMode==='teams')}</div>
      <details class="fq-advanced" data-fq-team-details><summary>Teams einstellen</summary><label class="fq-field">Anzahl der Teams<select name="fq-team-count">${[2,3,4].map(n=>`<option value="${n}" ${state.config.teamCount===n?'selected':''}>${n} Teams</option>`).join('')}</select></label><div data-fq-team-names></div><p>Die Lobby verteilt gleichmäßig. Du kannst die Zuordnung vor dem Start ändern. Jedes Team braucht mindestens eine Person.</p></details></fieldset>
      <fieldset class="fq-step"><legend><span class="fq-step-number">4</span> Dauer und Start</legend><div class="fq-levels" role="radiogroup" aria-label="Rundendauer">${[60,180,300,600].map(n=>choice('fq-duration',String(n),(n/60)+' Min.','',state.config.durationSec===n)).join('')}${choice('fq-duration','custom','Eigene Dauer','',![60,180,300,600].includes(state.config.durationSec))}</div>
      <label class="fq-field" data-fq-custom-duration hidden>Dauer in Sekunden (60–1200)<input name="fq-custom-seconds" type="number" min="60" max="1200" step="1" value="${state.config.durationSec||300}"></label><p class="fq-note" data-fq-duration-note></p>
      <p class="fq-summary" data-fq-summary></p><button class="fq-primary" type="submit" data-fq-start>Übung starten</button>
      <details class="fq-advanced"><summary>So läuft die Runde</summary><p data-fq-rules></p><p data-fq-value-note>Kein Taschenrechner.</p></details></fieldset></form>
      <aside class="fq-join"><h2>Du hast einen Code?</h2><p>Deine Lehrkraft hat alles vorbereitet. Hier trittst du der Runde bei.</p><form data-fq-form="join"><label class="fq-field">Rundencode<input name="code" class="fq-code-input" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="off" required placeholder="123456" aria-label="6-stelliger Rundencode"></label><label class="fq-field">Dein Kürzel<input name="name" maxlength="24" required autocomplete="nickname" placeholder="z. B. Alex" value="${esc(storage.get('fq-classroom-name')||'')}"></label><button class="fq-secondary" type="submit">Runde beitreten</button></form></aside></div>
      <details class="fq-legacy"><summary>Bisherige Spielmodi und Einstellungen</summary><p class="fq-note">Bisheriges Training, All-Time-Highscore und Live-Runden mit den bisherigen Regeln.</p>${button('legacy','Bisherige Spielmodi öffnen')}</details>`);
    updateSetup();
  }
  function updateSetup(){
    if(!$('[data-fq-start]'))return;
    const previous=state.sourceKey;
    state.config.teamNames=state.config.teamNames||['Team 1','Team 2','Team 3','Team 4'];
    state.sourceKind=$('[name="fq-source"]:checked')?.value||'curriculum';
    state.config={...state.config,category:$('[name="fq-category"]:checked')?.value||'mental',gameMode:$('[name="fq-mode"]:checked')?.value||'solo',durationSec:$('[name="fq-duration"]:checked')?.value==='custom'?Number($('[name="fq-custom-seconds"]').value):Number($('[name="fq-duration"]:checked')?.value||300),teamCount:Number($('[name="fq-team-count"]').value)};
    root.querySelectorAll('[data-fq-team-name]').forEach(el=>state.config.teamNames[Number(el.dataset.fqTeamName)]=el.value);
    const names=$('[data-fq-team-names]');if(names.childElementCount!==state.config.teamCount)names.innerHTML=Array.from({length:state.config.teamCount},(_,i)=>`<label class="fq-field">Name für Team ${i+1}<input data-fq-team-name="${i}" value="${esc(state.config.teamNames[i]||'Team '+(i+1))}" minlength="1" maxlength="30"></label>`).join('');
    $('[data-fq-team-details]').hidden=state.config.gameMode!=='teams';
    $('[data-fq-custom-duration]').hidden=$('[name="fq-duration"]:checked')?.value!=='custom';
    $('[data-fq-duration-note]').textContent=state.config.gameMode==='solo'?'Allein üben läuft ohne Zeitlimit.':'Eine gemeinsame Frist für die ganze Runde.';
    renderSourceControls();
    state.sourceKey=JSON.stringify([readSource(),state.config.category,state.config.durationSec]);
    if(previous&&previous!==state.sourceKey){state.preparation=null;state.config.sourceTitle='';$('[data-fq-review]').innerHTML='';$('[data-fq-example]').textContent='Auswahl geändert. Bitte Aufgaben erneut prüfen.';}
    $('[data-fq-summary]').textContent=configText(state.config);
    $('[data-fq-value-note]').textContent=state.config.gameMode==='solo'?'Kein Taschenrechner. Du kannst ohne Zeitdruck nachdenken und Lernhilfen nutzen.':'Kein Taschenrechner. Jede neue Aufgabe ist wertbar. Es gibt keinen Geschwindigkeitsbonus und keine Minutenfenster.';
    $('[data-fq-start]').textContent=state.config.gameMode==='solo'?'Übung starten':'Klassenrunde vorbereiten';
    $('[data-fq-start]').disabled=state.busy||!state.preparation?.available;
    $('[data-fq-rules]').textContent=state.config.gameMode==='solo'?'Du übst ohne Zeitlimit, Punkte und Rangliste. Nach jeder Aufgabe kannst du eine Lernhilfe oder die Lösung ansehen.':'Erste Antwort: 20 Punkte ohne Hinweis, 10 mit Hinweis, sonst 0. Danach kannst du korrigieren und zur nächsten wertbaren Aufgabe gehen. Teams werden bei Rundenstart festgeschrieben.';
  }
  function readSource(){
    if(state.sourceKind==='curriculum'){const entry=state.sources?.curriculum?.[Number($('[name="fq-curriculum"]')?.value||0)];return entry?{kind:'curriculum',grade:entry.grade,track:entry.track,topicId:entry.topicId}:null;}
    const quizId=$('[name="fq-test"]')?.value;return quizId?{kind:'test',quizId}:null;
  }
  function renderSourceControls(){
    const controls=$('[data-fq-source-controls]');if(controls.dataset.kind===state.sourceKind)return;controls.dataset.kind=state.sourceKind;
    controls.innerHTML=state.sourceKind==='remy'?`<label class="fq-field">Klasse<select name="fq-remy-grade">${[5,6,7,8,9,10].map(n=>`<option>${n}</option>`).join('')}</select></label><label class="fq-field">Thema<input name="fq-remy-topic" maxlength="200" placeholder="z. B. Brüche addieren"></label>${button('generate','Test mit Remi erstellen')}${button('generate','Remi-Auftrag fortsetzen')}`:'';
    renderSourceOptions();
  }
  function renderSourceOptions(){
    const options=$('[data-fq-source-options]');
    if(state.sourceKind==='curriculum'){
      const entries=state.sources?.curriculum||[],grades=[...new Set(entries.map(entry=>Number(entry.grade)))].sort((a,b)=>a-b);
      options.innerHTML=entries.length?`<div class="fq-level-row"><span>Klasse</span><div class="fq-levels" role="radiogroup" aria-label="Klassenstufe">${grades.map((grade,i)=>choice('fq-grade',String(grade),String(grade),'',i===0)).join('')}</div></div><div data-fq-track-options></div><div data-fq-topic-options></div><p class="fq-note">Es werden nur die hier aufgeführten Teilkompetenzen angeboten.</p><div data-fq-curriculum-info></div>`:'<p class="fq-note">Lade die verfügbaren Lehrplanquellen.</p>';
      renderCurriculumChoices();
    }
    else{const tests=state.sources?.tests||[];options.innerHTML=tests.length?`<label class="fq-field">Eigener Test<select name="fq-test">${tests.map(t=>`<option value="${esc(t.id)}">${esc(t.title)}${t.grade?' · Klasse '+esc(t.grade):''}</option>`).join('')}</select></label>`:'<p class="fq-note">Melde dich mit deinem Testkonto an und lade deine Tests.</p>';}
  }
  function renderCurriculumChoices(){
    if(!$('[data-fq-track-options]'))return;
    const grade=Number($('[name="fq-grade"]:checked')?.value),entries=(state.sources?.curriculum||[]).map((entry,index)=>({...entry,index})).filter(entry=>Number(entry.grade)===grade);
    const tracks=[...new Set(entries.map(entry=>entry.track))],previousTrack=$('[name="fq-track"]')?.value;
    const selectedTrack=tracks.includes(previousTrack)?previousTrack:tracks[0];
    $('[data-fq-track-options]').innerHTML=tracks.length>1?`<label class="fq-field">Zug<select name="fq-track">${tracks.map(track=>`<option value="${esc(track)}" ${track===selectedTrack?'selected':''}>${track==='m'?'M-Zug':'Regelklasse'}</option>`).join('')}</select></label>`:`<p class="fq-note">${selectedTrack==='m'?'M-Zug':'Regelklasse'} · verfügbare Teilkompetenzen für Klasse ${grade}</p><input type="hidden" name="fq-track" value="${esc(selectedTrack)}">`;
    const topics=entries.filter(entry=>entry.track===selectedTrack),previousTopic=$('[name="fq-curriculum"]')?.value;
    $('[data-fq-topic-options]').innerHTML=`<label class="fq-field">Thema<select name="fq-curriculum" ${topics.length===1?'aria-describedby="fq-single-topic"':''}>${topics.map(entry=>`<option value="${entry.index}" ${String(entry.index)===previousTopic?'selected':''}>${esc(entry.title)}</option>`).join('')}</select></label>${topics.length===1?'<p class="fq-note" id="fq-single-topic">Für diese Auswahl ist derzeit eine geprüfte Teilkompetenz verfügbar.</p>':''}`;
  }
  async function loadSources(){state.sources=await api('classroomV2Sources');state.preparation=null;$('[data-fq-source-controls]').dataset.kind='';updateSetup();$('[data-fq-source-status]').textContent=state.sources.user?'Quellen deines Testkontos geladen.':'Verfügbare Lehrplanquellen geladen.';}
  async function prepare(selected=false){
    updateSetup();const source=readSource();if(!source)throw new Error('Bitte zuerst Quellen laden und eine Quelle auswählen.');
    if(!Number.isInteger(state.config.durationSec)||state.config.durationSec<60||state.config.durationSec>1200)throw new Error('Bitte 60 bis 1200 ganze Sekunden wählen.');
    if(selected&&source.kind==='test'){source.questionIds=[...root.querySelectorAll('[data-fq-source-item]:checked')].map(el=>el.value);if(!source.questionIds.length)throw new Error('Wähle mindestens eine geeignete Originalaufgabe.');}
    const result=await api('classroomV2Prepare',{source,config:state.config});if(selected&&state.preparation?.items){const current=new Set((result.items||[]).map(item=>item.id));result.items=[...(result.items||[]),...state.preparation.items.filter(item=>!current.has(item.id)).map(item=>({...item,status:'excluded',reason:item.status==='unsupported'?item.reason:'Bewusst aus der Runde ausgeschlossen.'}))];}
    state.preparation=result;state.config.sourceTitle=result.source?.title;
    const review=$('[data-fq-review]');review.innerHTML=`<p class="fq-preparation-status">${result.available?'Aufgaben bereit.':'Diese Auswahl ist noch nicht spielbereit.'}</p><p>${esc(result.source?.title)} · ${esc(result.capacity)} verfügbare Varianten · ${esc(result.requiredCount)} Aufgaben für die Runde vorbereitet</p><p class="fq-note">${esc(result.repeatNotice||'Neue Varianten; bekannte Aufgaben kehren zur Festigung zurück.')}</p><details class="fq-advanced"><summary>So wird verglichen</summary><p class="fq-note">Referenzwert: ${esc(result.referencePoints||0)} Punkte pro Person. ${esc(result.targetBasis||'Richtwerte zur Erprobung: Kopfaufgaben etwa 25 Sekunden, Gleichungen 40 Sekunden und Papieraufgaben 60 Sekunden. Diese Werte sind noch nicht im Unterricht abgeglichen.')}</p></details>${(result.issues||[]).map(issue=>`<p class="fq-note">${esc(typeof issue==='string'?issue:issue.message||issue.reason)}</p>`).join('')}<details class="fq-advanced"><summary>Originalaufgaben und Eignung prüfen</summary>${(result.items||[]).map(item=>`<label class="fq-source-item"><input type="checkbox" data-fq-source-item value="${esc(item.id)}" ${item.status==='variable'?'checked':'disabled'}><span><strong>${esc(item.text)}</strong><small>${item.status==='variable'?'Für Varianten geeignet':esc(item.reason||'Nicht geeignet')}</small></span></label>`).join('')}${source.kind==='test'?button('prepare-selected','Nur ausgewählte Aufgaben verwenden'):''}</details>`;
    $('[data-fq-example]').innerHTML=(result.examples||[]).map(example=>`<div><small>${esc(example.kind==='P'?'Mit Stift und Papier':'Im Kopf')} · ${esc(example.material||'Kein Taschenrechner')}</small><strong>${esc(example.prompt)}</strong><details class="fq-example-solution"><summary>Lösung und Lernhilfe prüfen</summary><p>Lösung: <b>${esc(example.correct)}</b></p><p>${esc(example.hint||'')}</p><p>${esc(example.explanation||'')}</p></details></div>`).join('')||'Noch kein passendes Aufgabenbeispiel vorhanden.';
    const info=$('[data-fq-curriculum-info]');if(info&&source.kind==='curriculum'){const entry=state.sources.curriculum[Number($('[name="fq-curriculum"]').value)];const u=entry?.sourceUrl;info.innerHTML=`<p class="fq-note">${esc(Array.isArray(entry.competencies)?entry.competencies.join(' · '):entry.competencies||'')}</p>${typeof u==='string'&&u.startsWith('https://www.lehrplanplus.bayern.de/')?`<a target="_blank" rel="noopener noreferrer" href="${esc(u)}">Amtliche Lehrplanquelle ansehen</a>`:''}`;}
    updateSetup();
  }
  function saveCredentials(){session.set('fq-classroom-active', {version:2,role:state.role,creds:state.creds});}
  async function createRoom(){
    if(!state.preparation?.available)throw new Error('Bitte die Aufgaben zuerst prüfen.');
    if(state.config.gameMode==='teams'&&state.config.teamNames.slice(0,state.config.teamCount).some(n=>!n.trim()||n.trim().length>30))throw new Error('Jedes Team braucht einen Namen mit 1 bis 30 Zeichen.');
    const result=await api('classroomV2Create',{preparationId:state.preparation.preparationId,sourceRevision:state.preparation.sourceRevision,config:{...state.config,teamNames:state.config.teamNames.slice(0,state.config.teamCount).map(name=>name.trim())}});
    state.role='host';state.creds={code:result.code,hostToken:result.hostToken};saveCredentials();state.room=null;state.task=null;state.taskKey=null;roomShell();await refresh();pollTimer=setInterval(()=>refresh(),2000);
  }
  async function joinRoom(form){
    const code=String(form.get('code')||'').trim(),name=String(form.get('name')||'').trim();
    if(!/^\d{6}$/.test(code)||!name)throw new Error('Bitte den 6-stelligen Code und dein Kürzel eingeben.');
    let joinKey=storage.get('fq-classroom-join:'+code);if(!joinKey){joinKey=crypto.randomUUID();storage.set('fq-classroom-join:'+code,joinKey);}
    const result=await api('classroomV2Join',{code,name,joinKey});state.role='player';state.creds={code,playerId:result.playerId,playerToken:result.playerToken};storage.set('fq-classroom-name',name);saveCredentials();state.room=null;state.task=null;state.taskKey=null;roomShell();await refresh();pollTimer=setInterval(()=>refresh(),2000);
  }
  function roomShell(){
    content(`<header class="fq-room-header"><div><h1>${state.role==='host'?'Deine Klassenrunde':state.config.gameMode==='solo'?'In Ruhe üben':'Du bist dabei'}</h1><p data-fq-room-summary></p></div><div class="fq-actions">${state.role==='host'?button('board','Boardansicht'):''}${button('home','Zur Startseite')}</div></header><div data-fq-room-body></div>`);
    clockTimer=setInterval(updateClock,250);
  }
  function updateClock(){
    const r=state.room;if(!r)return;const now=Date.now()+state.offset;
    const countdown=$('[data-fq-countdown]');if(countdown&&r.status==='running'){countdown.hidden=now>=r.startsAtMs;countdown.textContent=`Gemeinsamer Start in ${time(r.startsAtMs-now)}`;}
    root.querySelectorAll('[data-fq-clock]').forEach(e=>e.textContent=r.config?.gameMode==='solo'?'Ohne Zeitlimit':r.status==='running'?time(r.endsAtMs-now):'0:00');
  }
  async function refresh(){
    if(state.pollBusy||!state.creds)return;state.pollBusy=true;const gen=state.generation;
    try{const data=await api('classroomV2State',state.creds);if(gen!==state.generation)return;state.room=data;state.config=data.config||state.config;if(Number.isFinite(data.serverNowMs))state.offset=data.serverNowMs-Date.now();renderRoom();
      if(state.role==='player'&&data.status==='running'&&Date.now()+state.offset>=data.startsAtMs&&!state.busy){const task=await api('classroomV2Task',state.creds);if(gen!==state.generation)return;const key=`${data.roundId}:${task.slot}:${task.question?.id}`;if(key!==state.taskKey){state.task=task;state.taskKey=key;state.practice=null;renderStudentTask();}}
      const status=$('[data-fq-connection]');if(status)status.textContent='Verbunden';
    }catch(err){if(gen===state.generation)error(err.message+' Deine Runde bleibt erhalten.');}finally{state.pollBusy=false;}
  }
  function boardHTML(r){
    if(r.config?.gameMode==='teams')return `<div class="fq-board-grid">${(r.teams||[]).map(t=>`<article class="fq-team" style="--team-color:${/^#[0-9a-f]{6}$/i.test(t.color)?t.color:'#285ac9'}"><h2>${esc(t.name)}</h2><div class="fq-team-score">${esc(t.energy||0)} <small>/ 1000</small></div><progress class="fq-energy" max="1000" value="${Math.max(0,Math.min(1000,Number(t.energy)||0))}" aria-label="${esc(t.name)}: Teamenergie"></progress><p>Platz ${esc(t.rank||'–')} · ${esc(t.size||0)} Personen</p><p class="fq-note">Gesammelte Punkte: ${esc(t.rawScore||0)} · Durchschnitt: ${esc(t.average||0)} Punkte</p><p class="fq-note">Teamgröße ${r.status==='waiting'?'aktuell':'fest'}: ${esc(t.size||0)}.</p></article>`).join('')}</div><details class="fq-advanced"><summary>So wird verglichen</summary><p class="fq-note">${esc(r.config?.targetBasis||'Richtwerte zur Erprobung; noch nicht im Unterricht abgeglichen.')}</p><p class="fq-note">Verglichen wird der durchschnittliche Beitrag pro Person. Energie = Durchschnitt ÷ ${esc(r.config.referencePoints||r.referencePoints||0)} Referenzpunkte × 1000.</p></details>`;
    return `<div class="fq-panel fq-coop"><h2>Gemeinsam gegen den Computer</h2><p>Runde ${esc(r.round||1)} · Ziel: ${esc(r.target||500)} Energie</p><div class="fq-team-score">${esc(r.energy||0)} <small>/ ${esc(r.target||500)}</small></div><progress class="fq-energy" max="${Number(r.target)||500}" value="${Math.max(0,Number(r.energy)||0)}" aria-label="Gemeinsame Energie"></progress><p class="fq-note">Die Energie berücksichtigt die feste Anzahl der Mitspielenden. Das Ziel richtet sich nach Dauer und geprüfter Aufgabenquelle.</p><details class="fq-advanced"><summary>So wird verglichen</summary><p class="fq-note">Referenz: ${esc(r.config?.referencePoints||r.referencePoints||0)} Punkte pro Person. ${esc(r.config?.targetBasis||'Richtwerte zur Erprobung; noch nicht im Unterricht abgeglichen.')}</p></details></div>`;
  }
  function renderRoom(){
    const r=state.room;if(!r)return;const heading=$('.fq-room-header h1');if(heading)heading.textContent=state.role==='host'?'Deine Klassenrunde':r.config?.gameMode==='solo'?'In Ruhe üben':'Du bist dabei';$('[data-fq-room-summary]').textContent=configText(r.config||state.config);
    if(state.role==='player'){
      const key=`${r.status}:${r.roundId}`;const holder=$('[data-fq-room-body]');
      if(holder.dataset.key!==key){holder.dataset.key=key;
        if(r.status==='running'){holder.innerHTML=`<div class="fq-clockbar"><div><small>${r.config.gameMode==='solo'?'Allein üben':'Rundenzeit'}</small><span class="fq-round-clock" data-fq-clock></span></div><div><small>${r.config.gameMode==='solo'?'In deinem Tempo':'Fortlaufende Aufgaben'}</small><span>${r.config.gameMode==='solo'?'Üben ohne Punkte und Rangliste':'Jede neue Aufgabe zählt'}</span></div></div><p class="fq-status" data-fq-countdown></p><div data-fq-task-holder></div><p class="fq-status" data-fq-connection>Verbunden</p>`;state.taskKey=null;}
        else if(r.status==='waiting')holder.innerHTML=`<article class="fq-panel fq-waiting"><h2>Bereit zum Rechnen</h2><p data-fq-self></p><p>Die Lehrkraft startet die Runde. Du musst nichts einstellen.</p><div class="fq-material">${esc(r.config?.category==='paper'?'Stift und Papier bereitlegen · kein Taschenrechner':'Im Kopf rechnen · kein Taschenrechner')}</div><p>Rundencode: <strong>${esc(r.code)}</strong></p></article>`;
        else if(!(r.status==='finished'&&state.task&&holder.querySelector('[data-fq-task-holder]')))holder.innerHTML=`<article class="fq-panel fq-waiting"><h2>${r.status==='invalid'?'Vergleich beendet':r.status==='aborted'?'Runde abgebrochen':'Runde beendet'}</h2><p>${r.status==='invalid'?esc(r.invalidReason||'Der Vergleich kann nicht gewertet werden. Bitte eine neue Runde vorbereiten.'):r.status==='aborted'?'Diese Runde hat kein Siegergebnis.':'Gut mitgerechnet. Die Lehrkraft entscheidet, wie es weitergeht.'}</p><p data-fq-self></p></article>${r.status==='finished'?boardHTML(r):''}`;
      }
      const self=$('[data-fq-self]');if(self){const team=r.config?.gameMode==='teams'?(r.teams||[]).find(t=>t.id===r.self?.teamId):null;self.textContent=[r.self?.name,team?.name,r.status==='finished'?`${r.self?.score||0} gesammelte Punkte`:''].filter(Boolean).join(' · ');}

      if(r.status==='finished'&&$('[data-fq-countdown]')){$('[data-fq-countdown]').hidden=false;$('[data-fq-countdown]').textContent='Runde beendet. Du kannst die offene Aufgabe noch ohne Punkte prüfen.';}
      updateClock();return;
    }
    const holder=$('[data-fq-room-body]');
    // Keep focused teacher controls stable while roster/status refreshes.
    if(!holder.querySelector('[data-fq-board]'))holder.innerHTML=`<div class="fq-clockbar"><div><small data-fq-room-status></small><span class="fq-round-clock" data-fq-clock></span></div><div><small>Mitspielende</small><strong data-fq-player-count></strong></div></div><div class="fq-lobby-grid"><aside class="fq-panel"><h2>Runde beitreten</h2><p>Code eingeben oder QR-Code scannen.</p><div class="fq-room-code">${esc(state.creds.code)}</div><div class="fq-qr" data-fq-qr></div><div class="fq-actions">${button('copy','Beitrittslink kopieren')}</div></aside><section class="fq-panel"><h2>Wer ist dabei?</h2><p class="fq-note">Nur hier sieht die Lehrkraft die Kürzel. Die Boardansicht zeigt ausschließlich Teams.</p><ul class="fq-roster" data-fq-roster></ul></section></div><p class="fq-board-code">Rundencode: <strong>${esc(state.creds.code)}</strong></p><details class="fq-advanced fq-host-controls" data-fq-lobby-teams><summary>Teamnamen in der Lobby ändern</summary><div class="fq-team-settings" data-fq-lobby-team-fields></div>${button('save-teams','Teamnamen speichern')}</details><div data-fq-board></div><p data-fq-result role="status"></p><div class="fq-actions fq-host-controls">${button('start','Gemeinsam starten','primary')}${button('retry','Runde wiederholen')}${button('next','Nächste Runde','primary')}${button('stop','Runde abbrechen','danger')}</div><p class="fq-note fq-host-controls">Fortlaufend wertbare Aufgaben bis zum Rundenende. Kein Geschwindigkeitsbonus. Die Teamgröße bleibt nach dem Start fest.</p><p class="fq-status" data-fq-connection>Verbunden</p>`;
    $('[data-fq-room-status]').textContent=({waiting:'Warten auf den gemeinsamen Start',running:`Runde ${r.round||1} läuft`,finished:'Runde beendet',aborted:'Runde abgebrochen – kein Siegergebnis',invalid:'Vergleich beendet – ohne Siegergebnis'}[r.status]||r.status);
    $('[data-fq-player-count]').textContent=String(r.playerCount||0);
    $('[data-fq-lobby-teams]').hidden=r.status!=='waiting'||r.config.gameMode!=='teams';
    const teamFields=$('[data-fq-lobby-team-fields]');
    if(!teamFields.childElementCount&&r.config.gameMode==='teams')teamFields.innerHTML=(r.teams||[]).map((team,i)=>`<label class="fq-field">Team ${i+1}<input data-fq-lobby-name value="${esc(team.name)}" minlength="1" maxlength="30"></label>`).join('');
    $('[data-fq-board]').innerHTML=r.status==='invalid'?`<p class="fq-error">${esc(r.invalidReason||'Der Vergleich kann nicht gewertet werden.')}</p>`:boardHTML(r);
    const roster=$('[data-fq-roster]');const members=r.members||[];
    const rosterKey=JSON.stringify(members.map(m=>[m.id,m.name,m.teamId]));
    if(roster.dataset.key!==rosterKey&&document.activeElement?.closest('[data-fq-roster]')==null){roster.dataset.key=rosterKey;roster.innerHTML=members.length?members.map(m=>`<li><span>${esc(m.name)}</span>${r.config?.gameMode==='teams'?`<select data-fq-team="${esc(m.id)}" aria-label="Team für ${esc(m.name)}" ${r.status==='running'?'disabled':''}>${(r.teams||[]).map(t=>`<option value="${t.id}" ${t.id===m.teamId?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`:''}</li>`).join(''):'<li>Noch niemand dabei. Teile den Code mit der Klasse.</li>';}
    $('[data-fq-result]').textContent=r.status==='finished'?(r.config.gameMode==='computer'?(r.success?'Ziel erreicht! Ihr könnt gemeinsam in die nächste Runde gehen.':'Das Ziel wurde noch nicht erreicht. Ihr könnt die Runde wiederholen.'):'Die Platzierung ergibt sich aus der Teamenergie. Gleiche Energie bedeutet denselben Platz.') : '';
    root.querySelectorAll('[data-fq-team]').forEach(select=>select.disabled=state.busy||r.status==='running');
    const qr=$('[data-fq-qr]');if(qr&&!qr.childElementCount&&window.QRCode)new window.QRCode(qr,{text:joinURL(),width:156,height:156,correctLevel:window.QRCode.CorrectLevel.M});
    syncHostButtons();updateClock();
  }
  function syncHostButtons(){
    if(state.role!=='host'||!state.room)return;const r=state.room;
    const set=(action,visible,disabled=false)=>{const b=$(`[data-fq-action="${action}"]`);if(b){b.hidden=!visible;b.disabled=state.busy||disabled;}};
    set('start',r.status==='waiting',!r.playerCount||(r.config?.gameMode==='teams'&&(r.teams||[]).some(t=>!t.size)));set('stop',r.status==='running');set('retry',['finished','aborted'].includes(r.status));set('next',r.status==='finished'&&r.config?.gameMode==='computer'&&r.success&&r.round<4);
  }
  function joinURL(){const u=new URL(location.href);u.search='';u.searchParams.set('classroom',state.creds.code);u.hash='';return u.href;}
  function taskHTML(task,practice=false){
    const q=task.question||task,scored=!state.local&&!practice&&state.config.gameMode!=='solo';return `<article class="fq-task"><div class="fq-task-meta"><span>${state.config.gameMode==='solo'?'Allein üben · ohne Zeitlimit':practice?'Freies Weiterüben · ohne Wertung':task.practice?'Ohne Wertung':'Wertungsaufgabe'}</span><span>${esc(configText(state.config))}</span></div><div class="fq-material" data-kind="${q.kind==='P'?'P':'H'}">${esc(q.material|| (q.kind==='P'?'Stift und Papier':'Im Kopf'))} · kein Taschenrechner</div><p class="fq-note">${esc(q.hintOrientation||'Nimm dir Zeit zum Nachdenken.')}</p>${scored?'<p class="fq-note">Erste Antwort: 20 Punkte ohne Hinweis, 10 mit Hinweis, sonst 0. Korrekturen bleiben ohne neue Wertung. Jede neue Aufgabe ist wertbar. Es gibt keinen Geschwindigkeitsbonus.</p>':''}<div class="fq-task-question">${esc(q.prompt)}</div><form class="fq-answer-form" data-fq-form="answer"><label class="fq-field">Dein Ergebnis<input name="answer" inputmode="decimal" autocomplete="off" required aria-label="Dein Ergebnis"></label><button class="fq-primary" type="submit">Antwort prüfen</button></form><div class="fq-actions">${button('hint',scored?'Hinweis · erste richtige Antwort 10 Punkte':'Hinweis')}${button('reveal',scored?'Lösung ansehen · 0 Punkte':'Lösung ansehen')}</div><div class="fq-feedback" data-fq-feedback role="status" aria-live="polite"></div><div class="fq-actions" data-fq-task-actions></div></article>`;
  }
  function renderStudentTask(){
    const holder=$('[data-fq-task-holder]');if(!holder||!state.task)return;
    const task=state.task;if(!task.question){holder.innerHTML=`<article class="fq-panel"><p>${task.finished?esc(task.message||'Runde beendet. Die Lehrkraft entscheidet, wie es weitergeht.'):'Die nächste Aufgabe wird vorbereitet.'}</p></article>`;return;}
    holder.innerHTML=taskHTML(task);if(task.answerResult){feedback(task.answerResult);showPracticeAction();}updateClock();
  }
  function feedback(result){const el=$('[data-fq-feedback]');if(!el)return;el.dataset.correct=String(Boolean(result.correct));el.innerHTML=`<strong>${result.correct?'Richtig.':'Noch nicht richtig.'}${state.config.gameMode!=='solo'&&Number.isFinite(result.points)?` ${result.points} Punkte.`:''}</strong><p>${esc(result.explanation||'')}</p>`;}
  function showPracticeAction(){const el=$('[data-fq-task-actions]');if(el)el.innerHTML=state.local?button('local-next','Nächste Aufgabe','primary'):state.room?.status==='finished'?'':button('scored-next','Nächste Aufgabe','primary');}
  async function startSourceSolo(){
    if(!state.preparation?.available)throw new Error('Bitte die Aufgaben zuerst prüfen.');
    const result=await api('classroomV2Solo',{preparationId:state.preparation.preparationId,sourceRevision:state.preparation.sourceRevision,config:{...state.config,teamNames:state.config.teamNames.slice(0,state.config.teamCount).map(name=>name.trim())}});
    stop();state.role='player';state.creds={code:result.code,playerId:result.playerId,playerToken:result.playerToken};state.local=null;state.taskKey=null;saveCredentials();roomShell();await refresh();pollTimer=setInterval(()=>refresh(),2000);
  }
  function seed(){return crypto.getRandomValues(new Uint32Array(1))[0];}
  function startSolo(){if(!math())throw new Error('Die Aufgaben konnten nicht geladen werden. Bitte die Seite neu laden.');stop();state.role='solo';state.local={seed:seed(),index:0,correct:0,total:0};state.room=null;content(`<header class="fq-room-header"><div><h1>In Ruhe üben</h1><p>${esc(configText(state.config))}</p></div>${button('home','Übung beenden')}</header><div data-fq-task-holder></div>`);nextLocal();}
  function nextLocal(){state.practice=null;state.task={question:math().generateTask(state.config,state.local.seed,state.local.index++)};state.task.localAttempted=false;renderStudentTask();}
  function practice(){if(!math())throw new Error('Weiterüben ist gerade nicht verfügbar.');state.practice={question:math().generateTask(state.config,seed(),state.practiceIndex++)};$('[data-fq-task-holder]').innerHTML=taskHTML(state.practice,true);}
  async function answer(value){
    if(state.practice||state.local){const task=state.practice||state.task,q=task.question;const normalize=math().normalizeAnswer;const correct=normalize?normalize(value)===normalize(q.correct):Number(String(value).replace(',','.'))===Number(String(q.correct).replace(',','.'));if(!task.localAttempted&&state.local){state.local.total++;if(correct)state.local.correct++;task.localAttempted=true;}feedback({correct,explanation:correct?q.explanation:'Versuche es noch einmal oder nutze einen Hinweis.'});if(correct)showPracticeAction();return;}
    const result=await api('classroomV2Answer',{...state.creds,slot:state.task.slot,roundId:state.task.roundId,answer:value,practice:false});feedback(result);state.task.answerResult=result;showPracticeAction();
  }
  async function hint(){
    if(state.practice||state.local){$('[data-fq-feedback]').textContent=(state.practice||state.task).question.hint;return;}
    const result=await api('classroomV2Hint',{...state.creds,slot:state.task.slot,roundId:state.task.roundId});$('[data-fq-feedback]').textContent=result.hint;
  }
  async function reveal(){
    if(state.practice||state.local){const localTask=state.practice||state.task;const q=localTask.question;localTask.localAttempted=true;$('[data-fq-feedback]').textContent=q.explanation;showPracticeAction();return;}
    const result=await api('classroomV2Reveal',{...state.creds,slot:state.task.slot,roundId:state.task.roundId});$('[data-fq-feedback]').textContent=`Lösung: ${result.correctAnswer}. ${result.explanation||''} Keine Wertung.`;showPracticeAction();
  }
  function legacy(){stop();root.hidden=true;document.getElementById('homeView').hidden=false;let back=document.getElementById('fq-return');if(!back){back=document.createElement('button');back.id='fq-return';back.className='secondaryButton';back.type='button';back.textContent='Zur neuen Mathe-Auswahl';document.querySelector('main.shell').prepend(back);back.addEventListener('click',()=>{document.getElementById('homeBtn')?.click();document.querySelectorAll('main.shell > .view').forEach(v=>v.hidden=true);back.hidden=true;root.hidden=false;home();});}back.hidden=false;}
  function mount(){
    if(document.getElementById('classroomApp'))return;
    const params=new URLSearchParams(location.search);
    if(!params.has('classroom')&&['join','room','mode'].some(key=>params.has(key)))return;
    const main=document.querySelector('main.shell');if(!main)return;document.querySelectorAll('main.shell > .view').forEach(v=>v.hidden=true);
    root=document.createElement('section');root.id='classroomApp';root.className='fq-classroom';main.prepend(root);
    root.addEventListener('change',event=>{if(['fq-grade','fq-track'].includes(event.target.name))renderCurriculumChoices();if(event.target.name?.startsWith('fq-'))updateSetup();if(event.target.matches('[data-fq-team-name]'))updateSetup();if(event.target.matches('[data-fq-source-item]')){if(state.preparation)state.preparation.available=false;$('[data-fq-start]').disabled=true;}if(event.target.matches('[data-fq-team]'))act(async()=>{const assignments=Object.fromEntries([...root.querySelectorAll('[data-fq-team]')].map(el=>[el.dataset.fqTeam,Number(el.value)]));await api('classroomV2Assign',{...state.creds,assignments});await refresh();});});
    root.addEventListener('submit',event=>{const type=event.target.dataset.fqForm;if(!type)return;event.preventDefault();const form=new FormData(event.target);act(async()=>{if(type==='setup'){updateSetup();if(state.config.gameMode==='solo')await startSourceSolo();else await createRoom();}if(type==='join')await joinRoom(form);if(type==='answer')await answer(form.get('answer'));});});
    root.addEventListener('click',event=>{const b=event.target.closest('[data-fq-action]');if(!b)return;act(async()=>{switch(b.dataset.fqAction){case'save-teams':{const teamNames=[...root.querySelectorAll('[data-fq-lobby-name]')].map(el=>el.value.trim());if(teamNames.some(name=>!name||name.length>30))throw new Error('Teamnamen brauchen 1 bis 30 Zeichen.');await api('classroomV2Teams',{...state.creds,teamCount:teamNames.length,teamNames});await refresh();break;}case'load-sources':await loadSources();break;case'prepare':await prepare();break;case'prepare-selected':await prepare(true);break;case'login':await (await sourceClient()).signIn($('[name="source-email"]').value,$('[name="source-password"]').value);$('[name="source-password"]').value='';await loadSources();break;case'logout':await (await sourceClient()).signOut();state.sources=null;state.preparation=null;$('[data-fq-source-controls]').dataset.kind='';updateSetup();break;case'generate':{const topic=$('[name="fq-remy-topic"]').value.trim();if(!topic)throw new Error('Bitte ein Thema für Remi eingeben.');const id=await(await sourceClient()).generateTest({grade:$('[name="fq-remy-grade"]').value,topic,onProgress:text=>{$('[data-fq-source-status]').textContent=text;}});await loadSources();$('[name="fq-test"]').value=id;updateSetup();break;}case'scored-next':state.task=await api('classroomV2Next',{...state.creds,slot:state.task.slot,roundId:state.task.roundId});state.taskKey=`${state.task.roundId}:${state.task.slot}:${state.task.question?.id}`;renderStudentTask();break;case'home':session.set('fq-classroom-active',null);history.replaceState({},'',location.pathname);home();break;case'legacy':legacy();break;case'board':state.board=!state.board;root.classList.toggle('fq-board-mode',state.board);b.textContent=state.board?'Lehrkraftansicht':'Boardansicht';break;case'copy':await navigator.clipboard.writeText(joinURL());b.textContent='Link kopiert';break;case'start':case'retry':case'next':await api('classroomV2Start',{...state.creds,expectedRoundId:state.room?.roundId,...(b.dataset.fqAction==='retry'?{retry:true}:{}),...(b.dataset.fqAction==='next'?{next:true}:{})});await refresh();break;case'stop':await api('classroomV2Stop',state.creds);await refresh();break;case'hint':await hint();break;case'reveal':await reveal();break;case'practice':practice();break;case'local-next':nextLocal();break;}});});
    home();const code=new URL(location.href).searchParams.get('classroom');
    const saved=session.get('fq-classroom-active');
    const resumable=saved?.version===2&&saved?.creds?.code&&['host','player'].includes(saved.role)&&
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
