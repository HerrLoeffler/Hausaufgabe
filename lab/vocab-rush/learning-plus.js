(() => {
'use strict';
const $=id=>document.getElementById(id);
const norm=v=>String(v||'').trim().toLocaleLowerCase('en-US').replace(/[’‘]/g,"'").replace(/\s+/g,' ');
let reviewTimer=null;
let reviewDeadline=0;
let activeReview=null;

function compactHome(){
  const hero=document.querySelector('#homeView .hero>p:not(.eyebrow)');
  if(hero) hero.textContent='Englisch üben – mit Lehrplan-Themen oder eigenen Vokabeln.';
  const cards=[...document.querySelectorAll('#homeView .modeCard')];
  const copy=[
    ['Üben','Lernen, wiederholen und Fehler gezielt festigen.'],
    ['All-Time-Highscore','2 Minuten. Gleiche Regeln. Beste Punktzahl.'],
    ['Live mit Lehrkraft','QR-Code teilen, gemeinsam starten, live spielen.']
  ];
  cards.forEach((card,i)=>{const p=card.querySelector('p'); if(p&&copy[i])p.textContent=copy[i][1];});
  document.querySelectorAll('#homeView .modeCard .chips').forEach(x=>x.hidden=true);
  const join=document.querySelector('#homeView .joinCard>p:not(.eyebrow)');
  if(join) join.textContent='QR-Code scannen oder Rundencode eingeben.';
}

function ensureLearningOptions(){
  const rules=$('rulesHint')?.closest('.rulesCard');
  if(!rules||$('vrLearningOptions'))return;
  const box=document.createElement('div');
  box.id='vrLearningOptions';
  box.className='vrLearningOptions';
  box.innerHTML=`<span class="vrOptionLabel">Lernoptionen</span>
    <label class="vrWriteToggle"><input id="vrWriteAfterWrong" type="checkbox"><span><b>Nach Fehler selbst schreiben</b><small>Bei eigenen Vokabeln muss das englische Wort einmal korrekt eingegeben werden.</small></span></label>
    <small class="vrLearningNote">Falsche Antworten werden im Übungsmodus immer mindestens 5 Sekunden groß zum Merken gezeigt.</small>`;
  const score=rules.querySelector('.scoreBox');
  if(score) score.before(box); else rules.append(box);
  syncLearningVisibility();
}
function syncLearningVisibility(){
  const box=$('vrLearningOptions'); if(!box)return;
  const practice=String($('setupEyebrow')?.textContent||'').trim()==='ÜBEN';
  box.hidden=!practice;
  const custom=document.querySelector('input[name="source"]:checked')?.value==='custom';
  const toggle=box.querySelector('.vrWriteToggle'); if(toggle)toggle.classList.toggle('isDisabled',!custom);
  const input=$('vrWriteAfterWrong'); if(input)input.disabled=!custom;
}

function ensureReview(){
  if($('vrMemoryOverlay'))return;
  const overlay=document.createElement('div');
  overlay.id='vrMemoryOverlay'; overlay.className='vrMemoryOverlay'; overlay.hidden=true;
  overlay.innerHTML=`<div class="vrMemoryCard" role="dialog" aria-modal="true" aria-labelledby="vrMemoryTitle">
    <p class="vrMemoryEyebrow">MERKEN</p>
    <h2 id="vrMemoryTitle">Schau dir die richtige Lösung an.</h2>
    <div class="vrMemoryPair"><strong id="vrMemorySource"></strong><span>→</span><strong id="vrMemoryTarget"></strong></div>
    <p id="vrMemoryExplanation" class="vrMemoryExplanation"></p>
    <div id="vrWriteGate" class="vrWriteGate" hidden>
      <label for="vrWriteInput">Schreib das englische Wort einmal selbst:</label>
      <input id="vrWriteInput" autocomplete="off" autocapitalize="off" spellcheck="false">
      <small id="vrWriteStatus">Noch einmal aktiv abrufen – dann geht es weiter.</small>
    </div>
    <div class="vrMemoryFoot"><span id="vrMemoryCountdown">5 Sekunden zum Merken</span><button id="vrMemoryContinue" class="primary" type="button" disabled>Weiter</button></div>
  </div>`;
  document.body.append(overlay);
  $('vrMemoryContinue').addEventListener('click',closeReview);
  $('vrWriteInput').addEventListener('input',validateWrite);
  document.addEventListener('keydown',e=>{if(!overlay.hidden&&e.key==='Enter'&&!$('vrMemoryContinue').disabled){e.preventDefault();closeReview();}});
}
function parseExplanation(text){
  let raw=String(text||'').replace(/^Merke dir:\s*/i,'').trim();
  const parts=raw.split(/\s*→\s*/);
  if(parts.length>=2)return{source:parts.shift().trim(),target:parts.join(' → ').trim(),raw};
  return{source:'Richtige Lösung',target:raw,raw};
}
function validateWrite(){
  if(!activeReview?.requiresWrite)return updateContinue();
  const ok=norm($('vrWriteInput').value)===norm(activeReview.source);
  $('vrWriteInput').classList.toggle('isCorrect',ok);
  $('vrWriteStatus').textContent=ok?'✓ Richtig geschrieben.':'Noch einmal aktiv abrufen – dann geht es weiter.';
  activeReview.written=ok; updateContinue();
}
function updateContinue(){
  if(!activeReview)return;
  const timeDone=Date.now()>=reviewDeadline;
  const writeDone=!activeReview.requiresWrite||activeReview.written;
  $('vrMemoryContinue').disabled=!(timeDone&&writeDone);
  if(timeDone){$('vrMemoryCountdown').textContent=writeDone?'Gut. Du kannst weiter.':'Schreib die Vokabel noch einmal selbst.';}
}
function openReview(){
  const feedback=$('feedback');
  if(!feedback||!feedback.classList.contains('bad'))return;
  if(String($('playerLabel')?.textContent||'').trim()!=='Üben')return;
  ensureReview();
  const parsed=parseExplanation(feedback.textContent);
  const isCustom=!!document.querySelector('#taskTopic')&&!['Irregular verbs','Simple present','Simple past','Question words','Prepositions','some / any / no','Phrasal verbs','Collocations','Present progressive','will-future','Modal verbs','Comparison of adjectives','Pronouns','Present perfect','Quantities','going-to-future','Relative clauses','Adverbs','Word order','Past progressive','If-clauses type I','Tense mix'].includes(String($('taskTopic')?.textContent||'').trim());
  const requiresWrite=Boolean($('vrWriteAfterWrong')?.checked&&isCustom&&parsed.source&&parsed.source!=='Richtige Lösung');
  activeReview={source:parsed.source,target:parsed.target,requiresWrite,written:false};
  $('vrMemorySource').textContent=parsed.source;
  $('vrMemoryTarget').textContent=parsed.target;
  $('vrMemoryExplanation').textContent=requiresWrite?'Lies die Vokabel bewusst. Danach schreibst du sie einmal selbst.':'Nimm dir kurz Zeit und präge dir die richtige Lösung ein.';
  $('vrWriteGate').hidden=!requiresWrite;
  $('vrWriteInput').value=''; $('vrWriteInput').classList.remove('isCorrect');
  $('vrWriteStatus').textContent='Noch einmal aktiv abrufen – dann geht es weiter.';
  const overlay=$('vrMemoryOverlay'); overlay.hidden=false; document.body.classList.add('vrReviewOpen');
  reviewDeadline=Date.now()+5000;
  clearInterval(reviewTimer);
  const tick=()=>{const left=Math.max(0,Math.ceil((reviewDeadline-Date.now())/1000));$('vrMemoryCountdown').textContent=left?`${left} Sekunde${left===1?'':'n'} zum Merken`:(requiresWrite?'Schreib die Vokabel noch einmal selbst.':'Gut. Du kannst weiter.');updateContinue();if(!left){clearInterval(reviewTimer);reviewTimer=null;if(!requiresWrite){setTimeout(()=>{if(activeReview)closeReview();},500);}}};
  tick(); reviewTimer=setInterval(tick,200);
  if(requiresWrite)setTimeout(()=>$('vrWriteInput')?.focus(),350);
}
function closeReview(){
  if(!activeReview)return;
  if(Date.now()<reviewDeadline)return;
  if(activeReview.requiresWrite&&!activeReview.written)return;
  clearInterval(reviewTimer); reviewTimer=null; activeReview=null;
  $('vrMemoryOverlay').hidden=true; document.body.classList.remove('vrReviewOpen');
}

function watchFeedback(){
  const feedback=$('feedback'); if(!feedback)return;
  let wasBad=false;
  new MutationObserver(()=>{const bad=feedback.classList.contains('bad')&&feedback.textContent.trim();if(bad&&!wasBad)setTimeout(openReview,0);wasBad=Boolean(bad);if(!feedback.textContent.trim())wasBad=false;}).observe(feedback,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}
function tidySetup(){
  const subtitle=$('setupSubtitle'); if(subtitle)subtitle.textContent='Inhalt wählen, Dauer festlegen, starten.';
  const rules=$('rulesHint'); if(rules&&String($('setupEyebrow')?.textContent||'').trim()==='ÜBEN')rules.textContent='Beim Üben steht Lernen vor Punkten.';
}
function observeSetup(){
  const eyebrow=$('setupEyebrow'); if(!eyebrow)return;
  new MutationObserver(()=>{syncLearningVisibility();tidySetup();}).observe(eyebrow,{childList:true,subtree:true,characterData:true});
  document.querySelectorAll('input[name="source"]').forEach(x=>x.addEventListener('change',syncLearningVisibility));
}
function init(){compactHome();ensureLearningOptions();ensureReview();watchFeedback();observeSetup();syncLearningVisibility();}
init();
})();
