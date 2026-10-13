import {createDemoFlow} from './flow.mjs';
import {heroText as t,setLanguage,getLanguage} from './copy.mjs';
const $=id=>document.getElementById(id);
const make=(tag,className='',key='')=>{const el=document.createElement(tag);el.className=className;if(key)el.textContent=t(key);return el;};
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=key=>safe(t(key));
const portrait=(src,cls)=>{const img=make('img',cls);img.src='assets/'+src;img.alt='';return img;};
const dialog=$('gcHeroDialog');
let state=null,opener=null;
const flow=createDemoFlow({onChange:next=>{state=next;render();}});
function renderCoco(sheet,phase){
 sheet.classList.add('coco-sheet');
 const art=make('div','demo-art');
 art.append(portrait('coco-help-phone.png','coco-phone'));
 const line=make('p','mascot-line','cocoSays');art.append(line);
 const app=make('div','sample-app');
 app.innerHTML='<div class="sample-app-bar"><span>GradeCrew</span><span class="sample-label">'+tr('exampleLabel')+'</span></div>'+
 '<div class="sample-toolbar"><strong>'+tr('myTests')+'</strong><span class="sample-new-test '+(phase===2?'highlight-target':'')+'">'+tr('newTest')+'</span></div>';
 if(phase===0){
  const tests=make('div','sample-test-list');
  tests.innerHTML='<div class="sample-test"><span class="sample-test-line"></span><strong>'+tr('demoTestTitle')+'</strong><small>'+tr('demoTopic')+'</small></div><div class="sample-test muted-test"><span class="sample-test-line"></span><span class="placeholder-line"></span><span class="placeholder-line short"></span></div>';
  app.append(tests);
  const help=make('button','sample-help','askCoco');help.type='button';help.append(portrait('coco-footer-guide.png','help-avatar'));help.addEventListener('click',()=>move(()=>flow.nextPhase()));app.append(help);
 }else{
  const chat=make('div','sample-chat');
  chat.innerHTML='<div class="chat-header"><img src="assets/coco-footer-guide.png" alt=""><strong>Coco</strong></div><div class="user-bubble"><small>'+tr('questionLabel')+'</small>'+tr('exampleQuestion')+'</div>';
  if(phase===2){
   const answer=make('div','coco-answer');answer.innerHTML='<strong>Coco</strong><p>'+tr('cocoAnswer')+'</p>';chat.append(answer);
  }else{
   const response=make('div','answer-preview');response.textContent=t('showAnswer');chat.append(response);
  }
  app.append(chat);
 }
 sheet.append(art,app);
}
function renderRemy(sheet,phase){
 sheet.classList.add('remy-sheet');
 const art=make('div','demo-art');
 art.append(portrait(phase===0?'remy-microphone-lightblue.png':'remy-tablet-lightblue.png','remy-large'));
 const line=make('p','mascot-line',phase===0?'remySays':'editDraft');art.append(line);
 const paper=make('div','remy-paper');
 if(phase===0){
  const note=make('div','wish-note');note.innerHTML='<span class="sample-label">'+tr('voiceNoteLabel')+'</span><blockquote>'+tr('voiceNoteTranscript')+'</blockquote>';
  const bars=make('div','speech-bars');bars.setAttribute('aria-hidden','true');for(let i=0;i<9;i++)bars.append(make('i'));note.append(bars);
  const tags=make('div','wish-tags');['subject','class','topic'].forEach(key=>tags.append(make('span','',key)));note.append(tags);paper.append(note);
 }else{
  const head=make('div','paper-header');
  const words=make('div');words.append(make('p','paper-meta','demoTopic'),make('h3','paper-title','demoTestTitle'));
  head.append(words,portrait('cuddly-hedgehog.webp','paper-hedgehog'));paper.append(head);
  if(phase===1){
   const task=make('div','question-demo');task.innerHTML='<span class="sample-label">'+tr('firstTask')+'</span><p class="sentence-context">'+tr('exampleSentence')+'</p><h4>'+tr('multipleChoicePrompt')+'</h4><p class="question-format">'+tr('multipleChoice')+'</p>';
   const choices=make('div','choice-grid');for(let i=1;i<=4;i++){const c=make('div','choice');c.innerHTML='<span class="checkbox-drawing" aria-hidden="true"></span><span>'+tr('choice'+i)+'</span>';choices.append(c);}task.append(choices);paper.append(task);
  }else{
   paper.append(make('p','sentence-context','exampleSentence'));
   const tasks=make('div','draft-tasks');
   ['multipleChoicePrompt','question2','question3'].forEach((key,i)=>{
    const task=make('div','draft-task');const number=make('span','task-number');number.textContent=i+1;
    const text=make('div');text.append(make('strong','',key));const hint=make('small');hint.textContent=t(i===0?'multipleChoice':'shortAnswer');text.append(hint);
    task.append(number,text);if(i===0){const options=make('div','draft-options');options.textContent=[1,2,3,4].map(n=>t('choice'+n)).join(' · ');text.append(options);}else text.append(make('div','answer-line'));
    tasks.append(task);
   });paper.append(tasks,make('p','draft-ready','draftReady'));
  }
 }
 sheet.append(art,paper);
}
  function renderEmmi(sheet, phase) {
    const mascot = make('img', 'gcHeroContextMascot gcHeroContextMascot--emmi');
    mascot.src = 'assets/emmi-colors.png'; mascot.alt = ''; mascot.width = 88; mascot.height = 88;
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
    image.src = 'assets/cuddly-hedgehog.webp'; image.alt = t('pictureAlt');
    image.width = 160; image.height = 138;
    example.append(words, image); improved.append(example);
    const capabilities = make('div', 'gcHeroCapabilities');
    capabilities.setAttribute('aria-label', t('emmiOtherPossibilities'));
    for (let i = 1; i <= 3; i++) capabilities.append(make('span', '', `emmiCapability${i}`));
    sheet.append(improved, make('p', 'gcHeroSideNote', 'improvementReason'), capabilities);
  }

  function renderWilma(sheet, phase) {
    const mascot = make('img', 'gcHeroContextMascot gcHeroContextMascot--wilma');
    mascot.src = 'assets/wilma-grading.png'; mascot.alt = ''; mascot.width = 88; mascot.height = 88;
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


function render(){
 if(!state)return;
 const {name,phase}=state;
 dialog.dataset.crew=name;dialog.dataset.phase=phase;
 $('gcHeroDialogEyebrow').textContent=t('example');
 $('gcHeroDialogTitle').textContent=t(name+'Title');
 $('gcHeroDemoStatus').textContent=t(name+'Phase'+phase);
 const steps=$('demoSteps');steps.replaceChildren();
 for(let i=0;i<3;i++){const li=make('li',i===phase?'current':i<phase?'done':'');li.textContent=t(name+'Step'+i);if(i===phase)li.setAttribute('aria-current','step');steps.append(li);}
 const sheet=make('div','gcHeroSheet');
 if(name==='coco')renderCoco(sheet,phase);else if(name==='remy')renderRemy(sheet,phase);else if(name==='emmi')renderEmmi(sheet,phase);else renderWilma(sheet,phase);
 $('gcHeroDemoWorkspace').replaceChildren(sheet);
 $('gcHeroDemoPrev').disabled=phase===0;
 $('gcHeroDemoNext').hidden=phase===2;
 $('gcHeroDemoNext').textContent=t(name==='coco'?(phase===0?'showQuestion':'showAnswer'):name==='remy'?(phase===0?'showQuestion':'openDraft'):'next');
 $('gcHeroDemoReplay').textContent=t('replay');
 const nextName=['remy','emmi','wilma'][state.index];
 $('gcHeroDemoNextCrew').hidden=phase!==2;
 $('gcHeroDemoNextCrew').textContent=t(nextName?nextName+'Next':'backHome');
 $('gcHeroDemoPrev').textContent=t('prev');
 $('demoNote').textContent=t(name==='wilma'?'gradingDemo':'demoBoundary');
}
function sync(){
 document.documentElement.lang=getLanguage();
 document.querySelector('.classroom').alt=t('sceneAlt');
 const alts=['sceneBeforeAlt','sceneAfterAlt','poseBeforeAlt','poseAfterAlt'];
 document.querySelectorAll('.colour-comparison img').forEach((img,i)=>img.alt=t(alts[i]));
 document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
 document.querySelectorAll('[data-open]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.open+'Action')));
 document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===getLanguage())));
 $('testcode').setAttribute('aria-label',t('testcode'));
 $('gcHeroDialogClose').setAttribute('aria-label',t('close'));
 $('compareClose').setAttribute('aria-label',t('close'));
 $('noticeClose').setAttribute('aria-label',t('close'));
 if(state)render();
}
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
 opener=button.classList.contains('hit')?document.querySelector('.name-button[data-open="'+button.dataset.open+'"]'):button;
 flow.start(button.dataset.open);dialog.showModal();document.documentElement.classList.add('dialog-open');
}));
function move(action){action();$('gcHeroDialogTitle').tabIndex=-1;$('gcHeroDialogTitle').focus({preventScroll:true});}
$('gcHeroDemoNext').addEventListener('click',()=>move(()=>flow.nextPhase()));
$('gcHeroDemoPrev').addEventListener('click',()=>move(()=>flow.previousPhase()));
$('gcHeroDemoReplay').addEventListener('click',()=>move(()=>flow.replay()));
$('gcHeroDemoNextCrew').addEventListener('click',()=>{if(state.index<3)move(()=>flow.next());else dialog.close();});
$('gcHeroDialogClose').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{flow.stop();state=null;document.documentElement.classList.remove('dialog-open');opener?.focus({preventScroll:true});});
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{setLanguage(button.dataset.language);sync();}));
function notice(tutorial=false){
 $('noticeTitle').textContent=t(tutorial?'labTitle':'experiment');
 $('noticeBody').textContent=t(tutorial?'labBody':'labActionBody');
 $('noticeTrial').textContent=tutorial?t('labTrial'):'';
 $('noticeDialog').showModal();
}
$('tutorialStart').addEventListener('click',()=>notice(true));
$('signIn').addEventListener('click',()=>notice());
$('joinForm').addEventListener('submit',event=>{event.preventDefault();notice();});
$('noticeClose').addEventListener('click',()=>$('noticeDialog').close());
$('compareOpen').addEventListener('click',()=>$('compareDialog').showModal());
$('compareClose').addEventListener('click',()=>$('compareDialog').close());
sync();
