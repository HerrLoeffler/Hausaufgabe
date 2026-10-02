(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const $ = id => document.getElementById(id);

  const questions = {
    q1: {
      title: 'Schreibtisch', prompt: '25 % von 80 sind …', options: ['15', '20', '25', '30'], correct: 1,
      hint: 'Ein Viertel von 80 entspricht 25 %.', explanation: '25 % bedeutet ein Viertel. 80 ÷ 4 = 20.',
      transfer: { prompt: 'Wie viel sind 25 % von 40?', answers: ['10'], hint: 'Teile 40 durch 4.' }, reward: 'battery'
    },
    q2: {
      title: 'Regal', prompt: 'Welche Zahl ist 30 % von 50?', options: ['10', '15', '20', '25'], correct: 1,
      hint: '10 % von 50 sind 5.', explanation: '30 % sind drei 10-%-Schritte: 3 × 5 = 15.',
      transfer: { prompt: 'Wie viel sind 30 % von 20?', answers: ['6'], hint: '10 % von 20 sind 2.' }, reward: 'clue4'
    },
    q3: {
      title: 'Computer', prompt: 'Ein Pullover kostet 60 €. Er wird um 20 % reduziert. Wie hoch ist der Rabatt?', options: ['6 €', '10 €', '12 €', '20 €'], correct: 2,
      hint: '10 % von 60 € sind 6 €.', explanation: '20 % entsprechen zweimal 10 %, also 12 €.',
      transfer: { prompt: 'Wie hoch sind 20 % Rabatt bei 40 €?', answers: ['8', '8€', '8 €', '8 euro'], hint: '10 % von 40 € sind 4 €.' }, reward: 'clue7'
    }
  };

  const state = {
    player: { x: 480, y: 505, r: 17, speed: 210 },
    target: null,
    keys: new Set(),
    items: new Set(),
    flashlightPowered: false,
    clues: new Set(),
    solved: new Set(),
    attempts: { q1: 0, q2: 0, q3: 0 },
    activeQuestion: null,
    selectedAnswer: null,
    pendingReward: null,
    near: null,
    pendingHotspot: null,
    boardSolved: false,
    doorFailures: 0,
    reviewNeeded: new Set(),
    startTime: performance.now(),
    won: false
  };

  const obstacles = [
    { x: 120, y: 345, w: 220, h: 105 }, // desk
    { x: 64, y: 88, w: 125, h: 130 }, // cabinet
    { x: 330, y: 72, w: 250, h: 72 }, // shelf
    { x: 680, y: 104, w: 145, h: 118 }, // computer table
    { x: 365, y: 255, w: 105, h: 70 }, // student desk
    { x: 505, y: 300, w: 105, h: 70 } // student desk
  ];

  const hotspots = [
    { id: 'desk', label: 'Schreibtisch untersuchen', x: 230, y: 315, radius: 68, type: 'question', q: 'q1' },
    { id: 'cabinet', label: 'Schrank öffnen', x: 205, y: 152, radius: 70, type: 'cabinet' },
    { id: 'shelf', label: 'Regal durchsuchen', x: 455, y: 170, radius: 70, type: 'question', q: 'q2' },
    { id: 'computer', label: 'Computer benutzen', x: 645, y: 167, radius: 72, type: 'question', q: 'q3' },
    { id: 'board', label: 'Tafelmuster ansehen', x: 477, y: 108, radius: 78, type: 'board' },
    { id: 'door', label: 'Türcode eingeben', x: 824, y: 430, radius: 82, type: 'door' }
  ];

  const itemInfo = {
    battery: { icon: '🔋', label: 'Batterie' },
    flashlight: { icon: '🔦', label: 'Taschenlampe' }
  };

  let last = performance.now();
  let cocoImage = new Image();
  cocoImage.src = 'shared/penguin-guide.svg#pose-1';

  function setCoco(title, text) {
    $('cocoTitle').textContent = title;
    $('cocoText').textContent = text;
  }

  function normalizeAnswer(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(',', '.');
  }

  function updateHud() {
    $('learningStat').textContent = `Lernen ${state.solved.size}/3`;
    $('clueStat').textContent = `Code ${state.clues.size}/3`;
    $('inventoryCount').textContent = `${Math.min(state.items.size, 3)}/3`;
    const inventory = $('inventory');
    inventory.innerHTML = '';
    const values = [...state.items];
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot' + (values[i] ? ' filled' : '');
      if (values[i]) {
        const info = itemInfo[values[i]] || { icon: '🧩', label: values[i] };
        slot.innerHTML = `<div><strong>${info.icon}</strong>${info.label}${values[i] === 'flashlight' && state.flashlightPowered ? '<br>✓ aktiv' : ''}</div>`;
      } else slot.textContent = 'leer';
      inventory.append(slot);
    }
    document.querySelector('[data-step="battery"]').classList.toggle('done', state.items.has('battery'));
    document.querySelector('[data-step="flashlight"]').classList.toggle('done', state.flashlightPowered);
    document.querySelector('[data-step="code"]').classList.toggle('done', state.clues.size === 3);
  }

  function rectHitCircle(rect, x, y, r) {
    const nx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const ny = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    const dx = x - nx, dy = y - ny;
    return dx * dx + dy * dy < r * r;
  }

  function canStand(x, y) {
    const p = state.player;
    if (x < 40 + p.r || x > W - 40 - p.r || y < 50 + p.r || y > H - 42 - p.r) return false;
    return !obstacles.some(o => rectHitCircle(o, x, y, p.r + 3));
  }

  function movePlayer(dx, dy, dt) {
    if (!dx && !dy) return;
    const len = Math.hypot(dx, dy) || 1;
    const step = state.player.speed * dt;
    const nx = state.player.x + dx / len * step;
    const ny = state.player.y + dy / len * step;
    if (canStand(nx, state.player.y)) state.player.x = nx;
    if (canStand(state.player.x, ny)) state.player.y = ny;
  }

  function update(dt) {
    let dx = 0, dy = 0;
    if (state.keys.has('ArrowLeft') || state.keys.has('a')) dx -= 1;
    if (state.keys.has('ArrowRight') || state.keys.has('d')) dx += 1;
    if (state.keys.has('ArrowUp') || state.keys.has('w')) dy -= 1;
    if (state.keys.has('ArrowDown') || state.keys.has('s')) dy += 1;
    if (dx || dy) {
      state.target = null;
      state.pendingHotspot = null;
      movePlayer(dx, dy, dt);
    } else if (state.target) {
      const tx = state.target.x - state.player.x;
      const ty = state.target.y - state.player.y;
      if (Math.hypot(tx, ty) < 7) {
        state.target = null;
      } else {
        movePlayer(tx, ty, dt);
      }
    }

    let nearest = null;
    let nearestD = Infinity;
    for (const h of hotspots) {
      const d = Math.hypot(state.player.x - h.x, state.player.y - h.y);
      if (d < h.radius && d < nearestD) { nearest = h; nearestD = d; }
    }
    state.near = nearest;
    renderInteraction();
    if (nearest && state.pendingHotspot === nearest.id && !state.target) {
      state.pendingHotspot = null;
      interact(nearest);
    }
  }

  function renderInteraction() {
    const prompt = $('interactionPrompt');
    const touch = $('touchInteractBtn');
    if (!state.near || state.won) {
      prompt.hidden = true;
      touch.disabled = true;
      touch.textContent = 'Interagieren';
      return;
    }
    prompt.hidden = false;
    $('interactionText').textContent = state.near.label;
    touch.disabled = false;
    touch.textContent = state.near.label;
  }

  function drawRoundedRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  function drawWorld() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#202b34'; ctx.fillRect(0, 0, W, H);
    // floor
    ctx.fillStyle = '#8a603e'; ctx.fillRect(40, 50, W - 80, H - 92);
    for (let y = 50; y < H - 42; y += 38) {
      for (let x = 40; x < W - 40; x += 92) {
        const off = ((y / 38) % 2) * 46;
        ctx.strokeStyle = 'rgba(52,31,18,.28)'; ctx.lineWidth = 2;
        ctx.strokeRect(x + off, y, 90, 37);
      }
    }
    // walls
    ctx.fillStyle = '#304354';
    ctx.fillRect(20, 20, W - 40, 32); ctx.fillRect(20, H - 42, W - 40, 22);
    ctx.fillRect(20, 20, 22, H - 40); ctx.fillRect(W - 42, 20, 22, H - 40);
    // board
    drawRoundedRect(350, 35, 260, 58, 7, '#183b34', '#b6a47b');
    ctx.fillStyle = '#e8ddc2'; ctx.font = 'bold 25px system-ui'; ctx.textAlign = 'center'; ctx.fillText('2 · 4 · 6 · ?', 480, 72);
    // cabinet
    drawRoundedRect(64, 88, 125, 130, 8, '#574330', '#8b7052');
    ctx.fillStyle = '#bd9b70'; ctx.fillRect(124, 94, 3, 118); ctx.beginPath(); ctx.arc(115, 153, 4, 0, Math.PI*2); ctx.fill();
    // shelf
    drawRoundedRect(330, 72, 250, 72, 6, '#5e432d', '#8b6748');
    for (let i=0;i<7;i++){ctx.fillStyle=['#2d6a7d','#a85345','#d4a84c','#627a51'][i%4];ctx.fillRect(347+i*30,91+(i%2)*7,18,38-(i%2)*7)}
    // teacher desk
    drawRoundedRect(120, 345, 220, 105, 8, '#6a4930', '#98704c');
    ctx.fillStyle='#e9dec9';ctx.fillRect(170,360,72,42);ctx.fillStyle='#385371';ctx.fillRect(254,362,52,34);
    // computer table
    drawRoundedRect(680, 104, 145, 118, 8, '#5d4532', '#8b6b51');
    drawRoundedRect(700, 119, 104, 68, 5, '#182532', '#6da8df');
    ctx.fillStyle = state.solved.has('q3') ? '#60d18e' : '#4b7da9'; ctx.fillRect(710,129,84,48);
    // student desks
    drawRoundedRect(365,255,105,70,7,'#755238','#9a744f');
    drawRoundedRect(505,300,105,70,7,'#755238','#9a744f');
    // door
    drawRoundedRect(858, 345, 62, 165, 5, state.won ? '#356d4d' : '#4d3528', '#9f7c59');
    ctx.fillStyle='#d6ad58';ctx.beginPath();ctx.arc(872,430,5,0,Math.PI*2);ctx.fill();
    // hotspot glows
    for (const h of hotspots) {
      const done = (h.q && state.solved.has(h.q)) || (h.id==='board' && state.boardSolved);
      if (done && !['door','cabinet'].includes(h.id)) continue;
      const pulse = .4 + Math.sin(performance.now()/420 + h.x) * .12;
      ctx.beginPath(); ctx.arc(h.x,h.y,12,0,Math.PI*2); ctx.fillStyle=`rgba(96,166,255,${pulse})`;ctx.fill();
      ctx.beginPath();ctx.arc(h.x,h.y,21,0,Math.PI*2);ctx.strokeStyle='rgba(126,183,255,.25)';ctx.lineWidth=3;ctx.stroke();
    }
    // code fragments floating HUD in-world
    ctx.textAlign='left'; ctx.font='bold 16px system-ui'; ctx.fillStyle='rgba(255,255,255,.82)';
    if(state.clues.has('4')) ctx.fillText('Codefragment: 4',58,548);
    if(state.clues.has('7')) ctx.fillText(' · 7',180,548);
    if(state.clues.has('8')) ctx.fillText(' · 8',216,548);
  }

  function drawPlayer() {
    const p = state.player;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.38)';ctx.shadowBlur=10;ctx.shadowOffsetY=6;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r+6,0,Math.PI*2);ctx.fillStyle='#e7f0ff';ctx.fill();
    ctx.shadowColor='transparent';
    if (cocoImage.complete && cocoImage.naturalWidth) {
      ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,p.r+3,0,Math.PI*2);ctx.clip();ctx.drawImage(cocoImage,p.x-p.r-5,p.y-p.r-5,(p.r+5)*2,(p.r+5)*2);ctx.restore();
    } else {
      ctx.fillStyle='#21385d';ctx.font='bold 17px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('C',p.x,p.y);
    }
    ctx.restore();
  }

  function drawLighting() {
    const g=ctx.createRadialGradient(state.player.x,state.player.y,80,state.player.x,state.player.y,state.flashlightPowered?430:300);
    g.addColorStop(0,'rgba(5,10,18,0)');g.addColorStop(.65,'rgba(5,10,18,.08)');g.addColorStop(1,state.flashlightPowered?'rgba(5,10,18,.3)':'rgba(5,10,18,.52)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    if(state.flashlightPowered){ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#fff7c7';ctx.beginPath();ctx.moveTo(state.player.x,state.player.y);ctx.lineTo(state.player.x+280,state.player.y-120);ctx.lineTo(state.player.x+280,state.player.y+120);ctx.closePath();ctx.fill();ctx.restore();}
  }

  function render() { drawWorld(); drawPlayer(); drawLighting(); }

  function loop(now) {
    const dt = Math.min(.033,(now-last)/1000); last=now;
    if (![...document.querySelectorAll('dialog')].some(d=>d.open)) update(dt);
    render(); requestAnimationFrame(loop);
  }

  function approach(h) {
    state.pendingHotspot = h.id;
    state.target = { x: h.x, y: h.y };
  }

  function reviewMark(id) {
    if (!state.reviewNeeded.has(id)) return false;
    state.reviewNeeded.delete(id);
    if (state.reviewNeeded.size) setCoco('Hinweis nochmal geprüft', `Gut. Schau noch ${state.reviewNeeded.size} Fundstelle${state.reviewNeeded.size===1?'':'n'} nach.`);
    else setCoco('Alle Hinweise geprüft', 'Jetzt kannst du den Türcode wieder versuchen.');
    return true;
  }

  function interact(h = state.near) {
    if (!h || state.won) return;
    if (h.id === 'shelf' && reviewMark('shelf') && state.solved.has('q2')) return;
    if (h.id === 'computer' && reviewMark('computer') && state.solved.has('q3')) return;
    if (h.id === 'board' && reviewMark('board') && state.boardSolved) return;
    if (h.type === 'question') return openQuestion(h.q);
    if (h.type === 'cabinet') return openCabinet();
    if (h.type === 'board') return openBoard();
    if (h.type === 'door') return openDoor();
  }

  function openCabinet() {
    if (!state.items.has('flashlight')) {
      state.items.add('flashlight');
      setCoco('Eine Taschenlampe!', state.items.has('battery') ? 'Die Batterie passt. Coco setzt sie direkt ein – jetzt ist es deutlich heller.' : 'Sie ist leer. Uns fehlt noch eine Batterie.');
    }
    if (state.items.has('battery') && state.items.has('flashlight')) state.flashlightPowered = true;
    updateHud();
  }

  function openQuestion(id) {
    if (state.solved.has(id)) {
      const msg = id==='q1'?'Hier lag die Batterie.':id==='q2'?'Hier hast du das Codefragment 4 gefunden.':'Der Computer zeigte Codefragment 7.';
      setCoco('Schon gelöst', msg); return;
    }
    const q=questions[id]; state.activeQuestion=id; state.selectedAnswer=null;
    $('questionTitle').textContent=q.title; $('questionPrompt').textContent=q.prompt;
    const wrap=$('questionOptions');wrap.innerHTML='';
    q.options.forEach((opt,i)=>{const label=document.createElement('label');label.className='answer-option';label.innerHTML=`<input type="radio" name="answer" value="${i}"><span>${opt}</span>`;label.addEventListener('click',()=>{state.selectedAnswer=i;[...wrap.children].forEach(el=>el.classList.remove('selected'));label.classList.add('selected')});wrap.append(label)});
    $('questionFeedback').className='feedback';$('questionFeedback').textContent='Wähle eine Antwort.';
    $('questionDialog').showModal();
  }

  function rewardQuestion(id) {
    const q=questions[id]; state.solved.add(id);
    if(q.reward==='battery'){
      state.items.add('battery');
      if(state.items.has('flashlight')) state.flashlightPowered=true;
      setCoco('Batterie gefunden!', state.flashlightPowered?'Perfekt – die Taschenlampe funktioniert jetzt.':'Vielleicht finden wir irgendwo eine Taschenlampe.');
    }
    if(q.reward==='clue4'){state.clues.add('4');setCoco('Codefragment 4', 'Coco merkt sich die erste Ziffer: 4.');}
    if(q.reward==='clue7'){state.clues.add('7');setCoco('Codefragment 7', 'Noch eine Ziffer: 7. Uns fehlt noch eine.');}
    updateHud();
  }

  function checkQuestion() {
    const id=state.activeQuestion,q=questions[id]; if(!q)return;
    if(state.selectedAnswer===null){$('questionFeedback').textContent='Wähle zuerst eine Antwort.';return;}
    if(state.selectedAnswer!==q.correct){
      state.attempts[id]++;
      const f=$('questionFeedback');f.className='feedback error';
      f.textContent=state.attempts[id]===1?`Noch nicht. Coco hilft: ${q.hint}`:`Das Prinzip ist noch nicht sicher. ${q.explanation} Danach probierst du eine neue Aufgabe.`;
      if(state.attempts[id]>=2){setTimeout(()=>startTransfer(id),650);}
      return;
    }
    if(state.attempts[id]>0){
      $('questionFeedback').className='feedback success';$('questionFeedback').textContent='Richtig. Weil du vorher einen Fehlversuch hattest, folgt noch eine neue Aufgabe zum selben Prinzip.';
      setTimeout(()=>startTransfer(id),550);return;
    }
    $('questionDialog').close();rewardQuestion(id);
  }

  function startTransfer(id) {
    if($('questionDialog').open)$('questionDialog').close();
    const q=questions[id];state.pendingReward=id;
    $('transferExplanation').textContent=q.explanation;
    $('transferPrompt').textContent=q.transfer.prompt;
    $('transferInput').value='';$('transferFeedback').className='feedback';$('transferFeedback').textContent='Löse die neue Aufgabe. Erst dann geht es im Raum weiter.';
    $('transferDialog').showModal();setTimeout(()=>$('transferInput').focus(),100);
  }

  function checkTransfer() {
    const id=state.pendingReward,q=questions[id];if(!q)return;
    const v=normalizeAnswer($('transferInput').value);
    if(q.transfer.answers.map(normalizeAnswer).includes(v)){
      $('transferFeedback').className='feedback success';$('transferFeedback').textContent='Richtig – jetzt ist das Prinzip nachgewiesen.';
      setTimeout(()=>{$('transferDialog').close();state.pendingReward=null;rewardQuestion(id)},450);
    } else {
      $('transferFeedback').className='feedback error';$('transferFeedback').textContent=`Noch nicht. ${q.transfer.hint}`;
    }
  }

  function openBoard() {
    if(state.boardSolved){setCoco('Tafelcode 8','Das Muster war 2 · 4 · 6 · 8.');return;}
    $('boardInput').value='';$('boardFeedback').className='feedback';$('boardFeedback').textContent='Das ist ein reines Spielrätsel – hier darfst du knobeln.';$('boardDialog').showModal();
  }

  function checkBoard(){
    if($('boardInput').value.trim()==='8'){
      state.boardSolved=true;state.clues.add('8');$('boardFeedback').className='feedback success';$('boardFeedback').textContent='Genau: immer +2. Codefragment 8 gefunden.';updateHud();setCoco('Codefragment 8','Damit hast du die dritte Ziffer.');setTimeout(()=>$('boardDialog').close(),500);
    } else {$('boardFeedback').className='feedback error';$('boardFeedback').textContent='Noch nicht. Schau auf die Abstände zwischen den Zahlen.';}
  }

  function openDoor(){
    if(state.reviewNeeded.size){setCoco('Code gesperrt',`Nach zu viel Raten musst du die ${state.reviewNeeded.size} Fundstellen noch einmal ansehen.`);return;}
    $('doorInput').value='';$('doorFeedback').className='feedback';
    $('doorHintText').textContent=state.clues.size===3?'Du hast alle drei Fragmente. Setze sie in der Reihenfolge ihrer Fundstellen zusammen.':`Du hast erst ${state.clues.size} von 3 Codefragmenten gefunden.`;
    $('doorFeedback').textContent='Drei Ziffern öffnen die Tür.';$('doorDialog').showModal();
  }

  function checkDoor(){
    const value=$('doorInput').value.trim();
    if(value==='784'&&state.clues.size===3){$('doorFeedback').className='feedback success';$('doorFeedback').textContent='Klick – das Schloss öffnet sich!';state.won=true;setTimeout(()=>{$('doorDialog').close();showVictory()},550);return;}
    state.doorFailures++;
    $('doorFeedback').className='feedback error';
    if(state.doorFailures>=2){state.reviewNeeded=new Set(['shelf','computer','board']);$('doorFeedback').textContent='Zu oft geraten. Coco sperrt das Tastenfeld: Prüfe Regal, Computer und Tafel noch einmal.';setTimeout(()=>$('doorDialog').close(),850);}
    else $('doorFeedback').textContent=state.clues.size<3?'Dir fehlen noch Hinweise im Raum.':'Der Code stimmt noch nicht. Welche Reihenfolge hatten die Fundstellen?';
  }

  function showVictory(){
    const sec=Math.round((performance.now()-state.startTime)/1000);$('victoryStats').innerHTML=`<span>🧠 ${state.solved.size}/3 Lernaufgaben</span><span>🔎 ${state.clues.size}/3 Hinweise</span><span>⏱ ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</span>`;$('victoryDialog').showModal();setCoco('Raum geschafft!','Genau so könnte sich die komplette Schule später wie ein kleines Indie-Adventure spielen.');
  }

  function reset(){location.reload();}

  function canvasPoint(event){const r=canvas.getBoundingClientRect();const touch=event.touches?.[0]||event.changedTouches?.[0]||event;return{x:(touch.clientX-r.left)*W/r.width,y:(touch.clientY-r.top)*H/r.height};}
  function chooseTarget(event){event.preventDefault();const p=canvasPoint(event);let hit=null,best=48;for(const h of hotspots){const d=Math.hypot(p.x-h.x,p.y-h.y);if(d<best){best=d;hit=h;}}if(hit)return approach(hit);if(canStand(p.x,p.y)){state.pendingHotspot=null;state.target=p;}}

  window.addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(key)){state.keys.add(key);e.preventDefault();}if((key==='e'||key==='Enter')&&state.near&&!document.querySelector('dialog[open]')){interact();e.preventDefault();}});
  window.addEventListener('keyup',e=>state.keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  canvas.addEventListener('pointerdown',chooseTarget);
  $('interactBtn').addEventListener('click',()=>interact());$('touchInteractBtn').addEventListener('click',()=>interact());
  document.querySelectorAll('.dpad button').forEach(btn=>{const map={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'},key=map[btn.dataset.dir];const down=e=>{e.preventDefault();state.keys.add(key)};const up=e=>{e.preventDefault();state.keys.delete(key)};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up)});
  $('hintBtn').addEventListener('click',()=>{const q=questions[state.activeQuestion];if(q){$('questionFeedback').className='feedback';$('questionFeedback').textContent=`Coco: ${q.hint}`;}});
  $('checkAnswerBtn').addEventListener('click',checkQuestion);$('transferCheckBtn').addEventListener('click',checkTransfer);$('boardCheckBtn').addEventListener('click',checkBoard);$('doorCheckBtn').addEventListener('click',checkDoor);$('resetBtn').addEventListener('click',reset);$('victoryRestartBtn').addEventListener('click',reset);
  ['questionDialog','transferDialog','boardDialog','doorDialog'].forEach(id=>$(id).addEventListener('close',()=>{state.selectedAnswer=null;}));

  updateHud();requestAnimationFrame(loop);
})();
