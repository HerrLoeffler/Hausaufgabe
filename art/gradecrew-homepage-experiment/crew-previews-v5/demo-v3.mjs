import {COLOURS_TEST} from './test-data.mjs';
import { createDemoFlow, LAST_PHASE } from './flow-v3.mjs';
import { heroText as t } from './copy-v3.mjs';

const make = (tag, className = '', key = '') => {
  const el = document.createElement(tag);
  el.className = className;
  if (key) el.textContent = t(key);
  return el;
};


const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=key=>safe(t(key));
const portrait=(src,cls)=>{const img=make('img',cls);img.src=src==='remy-microphone.png'?'../assets/remy-microphone-lightblue-v4.png':src==='remy-new-test-tablet.png'?'../assets/remy-tablet-lightblue-v4.png':'./assets/gradecrew/'+src;img.alt='';return img;};
const descriptions={'rabbit-red':'A cream rabbit wearing a red scarf.','rabbit-blue':'A cream rabbit wearing a blue scarf.','rabbit-yellow':'A cream rabbit wearing a yellow scarf.',duck:'A yellow duck.',butterfly:'A blue butterfly.',frog:'A green frog.'};
function animal(name){return '<span role="img" aria-label="'+descriptions[name]+'" class="animal-img animal-'+name+'"></span>';}
function formatLabel(type){return tr(({single:'singleFormat',listening:'listeningFormat',matching:'matchingFormat',text:'textFormat',ordering:'orderingFormat','image-choice':'imageChoiceFormat'})[type]);}
function questionDetail(q,index,interactive){
 let html=q.image?'<div class="question-picture">'+animal(q.image)+'</div>':'';
 if(q.audio)html+='<audio controls preload="metadata" src="'+q.audio+'" aria-label="English listening question"></audio><p class="audio-hint">'+tr('listeningHint')+'</p>';
 if(q.options)html+='<div class="question-options">'+q.options.map((word,i)=>'<label><input type="radio" name="sample-'+index+'" value="'+i+'" '+(interactive?'':'disabled')+'><span>'+safe(word)+'</span></label>').join('')+'</div>';
 if(q.images)html+='<div class="picture-options">'+q.images.map((name,i)=>'<label><input type="radio" name="picture-'+index+'" value="'+i+'" '+(interactive?'':'disabled')+'>'+animal(name)+'<span>'+String.fromCharCode(65+i)+'</span></label>').join('')+'</div>';
 if(q.words)html+='<div class="match-demo"><div>'+q.words.map(w=>'<span>'+w+'</span>').join('')+'</div><div>'+q.patches.map(w=>'<span class="colour-patch patch-'+w+'" role="img" aria-label="'+w+' colour patch"></span>').join('')+'</div></div>';
 if(q.items)html+='<div class="order-demo">'+q.items.map(w=>'<span>'+safe(w)+'</span>').join('')+'</div>';
 if(q.type==='text')html+='<input class="sample-answer" type="text" readonly aria-label="'+tr('answerHere')+'">';
 return html;
}

export function installHeroDemo(root) {
  if (!root || root.dataset.heroDemoReady === '1') return;
  root.dataset.heroDemoReady = '1';
  const $ = id => root.querySelector(`#${id}`);
  const dialog = $('gcHeroDialog');
  dialog.classList.add('crew-unified');
  const tutorial=make('button','crew-tutorial','tutorialStart');tutorial.type='button';
  tutorial.addEventListener('click',()=>window.dispatchEvent(new Event('gradecrew:experiment-tutorial-request')));
  $('gcHeroDialogEyebrow').before(tutorial);
  const hint=make('p','crew-click-hint','clickNames');root.querySelector('.gcHeroTutorialEntry').prepend(hint);
  root.querySelectorAll('.gcHeroRoles button').forEach(button=>{const play=make('span','role-play');play.textContent='▷';play.setAttribute('aria-hidden','true');button.append(play);});
  const tourDialog=make('dialog','experiment-tour-note');
  tourDialog.innerHTML='<button type="button" class="tour-note-close" aria-label="'+tr('close')+'">×</button><h2>'+tr('tutorialNoteTitle')+'</h2><p>'+tr('tutorialNote')+'</p>';
  document.body.append(tourDialog);tourDialog.querySelector('button').addEventListener('click',()=>tourDialog.close());
  window.addEventListener('gradecrew:experiment-tutorial-request',()=>{flow?.setSuspended(true);tourDialog.showModal();});
  tourDialog.addEventListener('close',()=>flow?.setSuspended(document.hidden));

  const crewNav=make('nav','crew-steps');
  const crewNames=['coco','remy','emmi','wilma'];
  for(const name of crewNames){const button=make('button','crew-step');button.type='button';button.dataset.crewStep=name;button.textContent=name[0].toUpperCase()+name.slice(1);button.addEventListener('click',()=>move(()=>flow.start(name)));crewNav.append(button);}
  $('gcHeroDemoWorkspace').before(crewNav);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let state = null;
  let flow;
  let inspectedQuestion=null;
  const previous=make('button','v3-prev');previous.type='button';previous.textContent=t('prev');root.querySelector('.gcHeroDemoControls').prepend(previous);
  previous.addEventListener('click',()=>move(()=>flow.previousPhase()));
  const boundary=make('p','v3-demo-boundary');root.querySelector('.gcHeroDemoControls').after(boundary);
  function move(action){inspectedQuestion=null;action();dialog.scrollTop=0;$('gcHeroDialogTitle').tabIndex=-1;$('gcHeroDialogTitle').focus({preventScroll:true});}

  const syncLabels = () => {
    root.querySelector('.gcHeroArtwork').alt = t('sceneAlt');
    $('gcEntryCrew').setAttribute('aria-label', t('crewGroup'));
    root.querySelector('.gcHeroRoles').setAttribute('aria-label', t('yourCrew'));
    for (const name of ['coco', 'remy', 'emmi', 'wilma']) {
      root.querySelectorAll(`[data-hero-crew="${name}"]`).forEach(button => {
        button.setAttribute('aria-label', t(`${name}Action`));
      });
    }
    tutorial.textContent=t('tutorialStart');hint.textContent=t('clickNames');tourDialog.querySelector('h2').textContent=t('tutorialNoteTitle');tourDialog.querySelector('p').textContent=t('tutorialNote');
    $('gcHeroDialogClose').setAttribute('aria-label', t('close'));
    if (state) render();
  };

  function resetFlow() {
    flow?.stop();
    flow = createDemoFlow({ reducedMotion: motion.matches, onChange(next) { state = next; render(); } });
  }

function renderCoco(sheet,phase){
 sheet.classList.add('coco-sheet');
 const art=make('div','demo-art');art.append(portrait('coco-help-phone.png','coco-phone'));art.append(make('p','mascot-line','cocoSays'));
 const paper=make('div','crew-paper coco-welcome');
 paper.innerHTML='<small>'+tr('cocoGuideLabel')+'</small><h3>'+tr(phase===0?'cocoGreeting':'cocoAsk')+'</h3><p class="coco-message">'+tr(phase===0?'cocoWhere':'cocoAnything')+'</p><div class="coco-location"><span>'+tr('inYourApp')+'</span><div class="coco-help-marker"><img src="./assets/gradecrew/coco-footer-guide.png" alt=""><strong>'+tr('askCoco')+'</strong></div></div>';
 sheet.append(art,paper);
}

  function renderRemy(sheet,phase){
    sheet.classList.add('remy-sheet','v3-remy');
    const art=make('div','demo-art');
    art.append(portrait(phase===0?'remy-microphone.png':'remy-new-test-tablet.png','remy-large'));
    art.append(make('p','mascot-line',phase===0?'remySays':'editDraft'));
    const paper=make('div','remy-paper crew-paper');paper.dataset.i18nIgnore='1';
    if(phase===0){
      const note=make('div','wish-note');
      note.innerHTML='<small>'+tr('sampleWish')+'</small><blockquote>'+tr('wish')+'</blockquote><div class="wish-tags"><span>'+tr('testMeta')+'</span><span>'+tr('taskCount')+'</span></div>';
      paper.append(note);
    }else{
      const head=make('div','paper-header');
      head.innerHTML='<small>'+tr('testMeta')+'</small><h3>'+safe(COLOURS_TEST.title)+'</h3><p>'+tr('taskCount')+'</p>';
      paper.append(head);
      if(phase===1){
        if(inspectedQuestion!==null){
          const q=COLOURS_TEST.questions[inspectedQuestion];
          const back=make('button','overview-back','backOverview');back.type='button';back.addEventListener('click',()=>{inspectedQuestion=null;render();});paper.append(back);
          const task=make('div','question-demo');task.dataset.questionId=q.id;task.innerHTML='<small>'+tr('sampleQuestion')+' '+(inspectedQuestion+1)+' / 10</small><h4 lang="en">'+safe(q.prompt)+'</h4>'+questionDetail(q,inspectedQuestion,true);paper.append(task);
        }else{
          const list=make('div','whole-test');
          COLOURS_TEST.questions.forEach((q,i)=>{
            const detail=make('button','test-outline-task');detail.type='button';detail.dataset.questionId=q.id;
            detail.innerHTML='<span class="task-number">'+(i+1)+'</span><span><strong>'+safe(q.label)+'</strong><small>'+formatLabel(q.type)+' · '+q.points+' '+tr(q.points===1?'remyPoint':'remyPoints')+'</small></span><span class="task-arrow" aria-hidden="true">›</span>';
            detail.addEventListener('click',()=>{inspectedQuestion=i;render();});list.append(detail);
          });paper.append(list);
        }
      }else{
        const index=phase===2?0:1;
        const q=COLOURS_TEST.questions[index];
        const task=make('div','question-demo');task.dataset.questionId=q.id;
        task.innerHTML='<small>'+tr('sampleQuestion')+' '+(index+1)+' / 10</small><h4 lang="en">'+safe(q.prompt)+'</h4>'+questionDetail(q,index,true);
        paper.append(task);
      }
    }
    sheet.append(art,paper);
  }
  function renderEmmi(sheet, phase) {
    const mascot = make('img', 'gcHeroContextMascot gcHeroContextMascot--emmi');
    mascot.src = './assets/gradecrew/emmi-colors.png'; mascot.alt = ''; mascot.width = 88; mascot.height = 88;
    sheet.append(mascot);
    sheet.append(make('p', 'gcHeroSheetMeta', 'draftLabel'), make('p', `gcHeroDraft ${phase ? 'marked' : ''}`, 'vagueQuestion'));
    if (phase === 1) sheet.append(make('div', 'gcHeroEditing'));
    if (phase !== 2) return;
    const improved = make('div', 'gcHeroImproved');
    improved.append(make('p', 'gcHeroSheetMeta', 'improvedLabel'), make('p', 'gcHeroClearQuestion', 'clearQuestion'));
    const example = make('div', 'gcHeroIllustrated');
    const words = make('div');
    const sentence = make('p', 'gcHeroSentence');
    for (const [key, className] of [['sentenceLead', ''], ['sentenceAdjective', 'adjective'], ['sentenceNoun', 'noun'], ['sentenceVerb', 'verb']]) {
      sentence.append(make('span', className, key));
    }
    const legend = make('div', 'gcHeroLegend');
    for (const [key, className] of [['noun', 'noun'], ['adjective', 'adjective'], ['verb', 'verb']]) legend.append(make('span', className, key));
    words.append(sentence, legend);
    const image = make('img', 'gcHeroHedgehog');
    image.src = './assets/gradecrew/cuddly-hedgehog.webp'; image.alt = t('pictureAlt');
    image.width = 160; image.height = 138;
    example.append(words, image); improved.append(example);
    const capabilities = make('div', 'gcHeroCapabilities');
    capabilities.setAttribute('aria-label', t('emmiOtherPossibilities'));
    for (let i = 1; i <= 3; i++) capabilities.append(make('span', '', `emmiCapability${i}`));
    sheet.append(improved, make('p', 'gcHeroSideNote', 'improvementReason'), capabilities);
  }

  function renderWilma(sheet, phase) {
    const mascot = make('img', 'gcHeroContextMascot gcHeroContextMascot--wilma');
    mascot.src = './assets/gradecrew/wilma-grading.png'; mascot.alt = ''; mascot.width = 88; mascot.height = 88;
    sheet.append(mascot);
    sheet.append(make('p', 'gcHeroSheetMeta', 'automaticReview'), make('h3', 'gcHeroSheetTitle', 'gradingQuestion'));
    const sentence = make('p', 'gcHeroGradingSentence');
    sentence.textContent = ['sentenceLead', 'sentenceAdjective', 'sentenceNoun', 'sentenceVerb'].map(t).join(' ');
    const answer = make('div', `gcHeroStudentAnswer ${phase === 2 ? 'awarded' : ''}`);
    answer.append(make('p', 'gcHeroSheetMeta', 'studentAnswer'), make('strong', '', 'sentenceNoun'));
    if (phase === 2) { const mark = make('span', 'gcHeroAnswerMark'); mark.textContent = '✓'; mark.setAttribute('aria-label', t('correct')); answer.append(mark); }
    const score = make('div', `gcHeroScore ${phase === 2 ? 'awarded' : ''}`);
    score.append(make('span', '', 'points'));
    const points = make('div', 'gcHeroPoints');
    if (phase === 2) { const old = make('span', 'gcHeroPrevious'); old.textContent = '0 →'; points.append(old); }
    const value = make('strong'); value.textContent = phase === 2 ? '1' : '0';
    points.append(value, make('small', '', 'pointMaximum')); score.append(points);
    sheet.append(sentence, answer, make('p', 'gcHeroSideNote', 'criterion'), score);
    if (phase === 1) sheet.append(make('div', 'gcHeroChecking'));
    if (phase === 2) sheet.append(make('p', 'gcHeroSideNote', 'feedback'));
  }

  function render() {
    if (!state) return;
    const { name, phase, running, paused } = state;
    dialog.dataset.crew = name;
    dialog.dataset.phase = phase;
    dialog.classList.toggle('is-paused', paused);
    $('gcHeroDialogEyebrow').textContent = t('example');
    $('gcHeroDialogTitle').textContent = t(`${name}Title`);
    $('gcHeroDemoStatus').textContent = t(`${name}Phase${phase}`);
    $('gcHeroDemoPause').textContent = t(paused ? 'resume' : 'pause');
    $('gcHeroDemoPause').hidden = !running;
    $('gcHeroDemoNext').textContent = t('next');
    const isLast=phase===LAST_PHASE[name];
    $('gcHeroDemoNext').hidden=false;
    $('gcHeroDemoNext').dataset.nextCrew=isLast?(crewNames[crewNames.indexOf(name)+1]||'finish'):'';
    crewNav.setAttribute('aria-label',t('crewSteps'));
    crewNav.querySelectorAll('button').forEach(button=>{button.classList.toggle('is-current',button.dataset.crewStep===name);if(button.dataset.crewStep===name)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    previous.hidden=false;previous.disabled=phase===0;previous.textContent=t('prev');
    boundary.hidden=false;boundary.textContent=t('demoBoundary');
    dialog.dataset.autoplay=running&&!paused?'1':'0';
    $('gcHeroDemoStatus').setAttribute('aria-live','off');
    if(name==='remy')$('gcHeroDemoNext').textContent=t(['overviewNext','pictureNext','audioNext'][phase]||'next');
    if(name==='coco')$('gcHeroDemoNext').textContent=t('next');
    if(isLast)$('gcHeroDemoNext').textContent=t(({coco:'toRemy',remy:'toEmmi',emmi:'toWilma',wilma:'finishCrew'})[name]);
    $('gcHeroDemoReplay').textContent = t('replay');
    const sheet = make('div', 'gcHeroSheet');
    if (name === 'coco') renderCoco(sheet, phase);
    else if (name === 'remy') renderRemy(sheet, phase);
    else {
      const art=make('div','demo-art');art.append(portrait(name==='emmi'?'emmi-colors.png':'wilma-grading.png','crew-portrait'));art.append(make('p','mascot-line',name==='emmi'?'emmiSays':'wilmaSays'));
      const paper=make('div','crew-paper');
      if(name==='emmi')renderEmmi(paper,phase);else renderWilma(paper,phase);
      sheet.append(art,paper);
    }
    $('gcHeroDemoWorkspace').querySelectorAll('audio').forEach(a=>a.pause());
    $('gcHeroDemoWorkspace').replaceChildren(sheet);
  }

  resetFlow();
  // The visible role buttons expose the same actions to keyboard/screen readers.
  // Artwork hit regions are pointer shortcuts, not a second focus stop per animal.
  root.querySelectorAll('.gcHeroHit').forEach(button => {
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
  });
  let pointerOpener = null;
  let lastPointerOpener = null;
  root.querySelectorAll('[data-hero-crew]').forEach(button => {
    button.addEventListener('pointerdown', () => { pointerOpener = button; });
    button.addEventListener('keydown', () => { pointerOpener = null; });
    button.addEventListener('click', () => {
      lastPointerOpener = pointerOpener === button ? button : null;
      pointerOpener = null;
      inspectedQuestion=null;flow.start(button.dataset.heroCrew);
      dialog.showModal();
    });
  });
  $('gcHeroDialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    $('gcHeroDemoWorkspace').querySelectorAll('audio').forEach(a=>a.pause());
    flow.stop(); state = null;
    const opener = lastPointerOpener;
    lastPointerOpener = null;
    if (opener) queueMicrotask(() => { if (document.activeElement === opener) opener.blur(); });
  });
  $('gcHeroDemoPause').addEventListener('click', () => flow.togglePause());
  $('gcHeroDemoNext').addEventListener('click',()=>{if(!state)return;const last=state.phase===LAST_PHASE[state.name];if(last&&state.name==='wilma')dialog.close();else move(()=>last?flow.next():flow.nextPhase());});
  $('gcHeroDemoReplay').addEventListener('click',()=>move(()=>flow.replay()));
  motion.addEventListener('change', () => { const previous = state; resetFlow(); if (previous) flow.start(previous.name); });
  document.addEventListener('visibilitychange',()=>flow.setSuspended(document.hidden));
  window.addEventListener('pagehide',()=>flow.stop());
  window.addEventListener('gradecrew:ui-locale-changed', syncLabels);
  new MutationObserver(syncLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  syncLabels();
}

