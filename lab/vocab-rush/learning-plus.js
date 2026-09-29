(() => {
'use strict';
const $=id=>document.getElementById(id);
const norm=v=>String(v||'').trim().toLocaleLowerCase('de-DE').replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const runtime=window.VocabRushModeRuntime||(window.VocabRushModeRuntime={writeAfterWrong:false,mode:'practice'});
let reviewTimer=null;
let reviewDeadline=0;
let activeReview=null;

function compactHome(){
  const hero=document.querySelector('#homeView .hero>p:not(.eyebrow)');
  if(hero)hero.textContent='Englisch üben – mit Lehrplan-Themen oder eigenen Vokabeln.';
  const cards=[...document.querySelectorAll('#homeView .modeCard')];
  const copy=[['Üben','Lernen, wiederholen und Fehler gezielt festigen.'],['All-Time-Highscore','2 Minuten. Lehrplan oder eigene Vokabeln.'],['Live mit Lehrkraft','Eigene Inhalte wählen, QR-Code teilen, gemeinsam starten.']];
  cards.forEach((card,i)=>{const p=card.querySelector('p');if(p&&copy[i])p.textContent=copy[i][1];});
  document.querySelectorAll('#homeView .modeCard .chips').forEach(x=>x.hidden=true);
  const join=document.querySelector('#homeView .joinCard>p:not(.eyebrow)');if(join)join.textContent='QR-Code scannen oder Rundencode eingeben.';
}
function ensureLearningOptions(){
  const rules=$('rulesHint')?.closest('.rulesCard');
  if(!rules||$('vrLearningOptions'))return;
  const box=document.createElement('div');box.id='vrLearningOptions';box.className='vrLearningOptions';
  box.innerHTML=`<span class="vrOptionLabel">Lernoption</span><label class="vrWriteToggle"><input id="vrWriteAfterWrong" type="checkbox"><span><b>Nach Fehler richtige Lösung schreiben</b><small>Die richtige Antwort muss einmal korrekt eingetippt werden, bevor es weitergeht.</small></span></label><small id="vrLearningNote" class="vrLearningNote"></small>`;
  const score=rules.querySelector('.scoreBox');if(score)score.before(box);else rules.append(box);syncLearningVisibility();
}
function syncLearningVisibility(){
  const box=$('vrLearningOptions');if(!box)return;box.hidden=false;
  const live=String($('setupEyebrow')?.textContent||'').includes('LIVE');
  const note=$('vrLearningNote');if(note)note.textContent=live?'Gilt in der Live-Runde für alle Teilnehmenden.':'Optional. Beim Üben wird eine falsche Lösung zusätzlich immer kurz groß gezeigt.';
}
function ensureReview(){
  if($('vrMemoryOverlay'))return;
  const overlay=document.createElement('div');overlay.id='vrMemoryOverlay';overlay.className='vrMemoryOverlay';overlay.hidden=true;
  overlay.innerHTML=`<div class="vrMemoryCard" role="dialog" aria-modal="true" aria-labelledby="vrMemoryTitle"><p class="vrMemoryEyebrow">MERKEN</p><h2 id="vrMemoryTitle">Schau dir die richtige Lösung an.</h2><div class="vrMemoryPair"><strong id="vrMemorySource"></strong><span>→</span><strong id="vrMemoryTarget"></strong></div><p id="vrMemoryExplanation" class="vrMemoryExplanation"></p><div id="vrWriteGate" class="vrWriteGate" hidden><label for="vrWriteInput">Schreib die richtige Lösung einmal selbst:</label><input id="vrWriteInput" autocomplete="off" autocapitalize="off" spellcheck="false"><small id="vrWriteStatus">Erst korrekt schreiben, dann geht es weiter.</small></div><div class="vrMemoryFoot"><span id="vrMemoryCountdown">5 Sekunden zum Merken</span><button id="vrMemoryContinue" class="primary" type="button" disabled>Weiter</button></div></div>`;
  document.body.append(overlay);
  $('vrMemoryContinue').addEventListener('click',closeReview);$('vrWriteInput').addEventListener('input',validateWrite);
  document.addEventListener('keydown',e=>{if(!overlay.hidden&&e.key==='Enter'&&!$('vrMemoryContinue').disabled){e.preventDefault();closeReview();}});
}
function correctAnswers(){return[...document.querySelectorAll('#answers .answerBtn.correct')].map(b=>String(b.dataset.value||b.querySelector('b')?.textContent||'').trim()).filter(Boolean);}
function cleanFeedback(text){return String(text||'').replace(/^Merke dir:\s*/i,'').replace(/^Nicht richtig\.\s*/i,'').replace(/\s*·\s*-?\d+\s*Punkte\.?\s*$/i,'').trim();}
function validateWrite(){
  if(!activeReview?.requiresWrite)return updateContinue();
  const value=norm($('vrWriteInput').value),ok=activeReview.accepted.some(x=>norm(x)===value);
  $('vrWriteInput').classList.toggle('isCorrect',ok);$('vrWriteStatus').textContent=ok?'✓ Richtig geschrieben.':'Erst korrekt schreiben, dann geht es weiter.';activeReview.written=ok;updateContinue();
}
function updateContinue(){
  if(!activeReview)return;const timeDone=Date.now()>=reviewDeadline,writeDone=!activeReview.requiresWrite||activeReview.written;
  $('vrMemoryContinue').disabled=!(timeDone&&writeDone);
  if(timeDone)$('vrMemoryCountdown').textContent=writeDone?'Gut. Du kannst weiter.':'Schreib die richtige Lösung noch einmal selbst.';
}
function openReview(){
  const feedback=$('feedback');if(!feedback||!feedback.classList.contains('bad'))return;
  const practice=String($('playerLabel')?.textContent||'').trim()==='Üben';
  const requiresWrite=Boolean(runtime.writeAfterWrong);
  if(!practice&&!requiresWrite)return;
  ensureReview();
  const accepted=correctAnswers();if(!accepted.length)return;
  const prompt=String($('taskPrompt')?.textContent||'Aufgabe').trim();
  const lockVisible=!$('penaltyLock')?.hidden,lockSec=lockVisible?Number($('penaltyTime')?.textContent||0):0,minSeconds=practice?5:Math.max(1,lockSec||3);
  activeReview={accepted,requiresWrite,written:false};
  $('vrMemorySource').textContent=prompt;$('vrMemoryTarget').textContent=accepted.join(' / ');
  $('vrMemoryExplanation').textContent=cleanFeedback(feedback.textContent)||'Präge dir die richtige Lösung bewusst ein.';
  $('vrWriteGate').hidden=!requiresWrite;$('vrWriteInput').value='';$('vrWriteInput').classList.remove('isCorrect');$('vrWriteStatus').textContent='Erst korrekt schreiben, dann geht es weiter.';
  const overlay=$('vrMemoryOverlay');overlay.hidden=false;document.body.classList.add('vrReviewOpen');reviewDeadline=Date.now()+minSeconds*1000;clearInterval(reviewTimer);
  const tick=()=>{if(!activeReview)return;const left=Math.max(0,Math.ceil((reviewDeadline-Date.now())/1000));$('vrMemoryCountdown').textContent=left?`${left} Sekunde${left===1?'':'n'} zum Merken`:(requiresWrite?'Schreib die richtige Lösung noch einmal selbst.':'Gut. Du kannst weiter.');updateContinue();if(!left){clearInterval(reviewTimer);reviewTimer=null;if(!requiresWrite)setTimeout(()=>{if(activeReview)closeReview();},450);}};
  tick();reviewTimer=setInterval(tick,200);if(requiresWrite)setTimeout(()=>$('vrWriteInput')?.focus(),250);
}
function closeReview(force=false){
  if(!activeReview)return;if(!force&&Date.now()<reviewDeadline)return;if(!force&&activeReview.requiresWrite&&!activeReview.written)return;
  clearInterval(reviewTimer);reviewTimer=null;activeReview=null;const overlay=$('vrMemoryOverlay');if(overlay)overlay.hidden=true;document.body.classList.remove('vrReviewOpen');
}
function watchFeedback(){
  const feedback=$('feedback');if(!feedback)return;let wasBad=false;
  new MutationObserver(()=>{const bad=feedback.classList.contains('bad')&&feedback.textContent.trim();if(bad&&!wasBad)setTimeout(openReview,0);wasBad=Boolean(bad);if(!feedback.textContent.trim())wasBad=false;}).observe(feedback,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}
function watchGameEnd(){
  const result=$('resultView'),game=$('gameView');
  const check=()=>{if(activeReview&&((result&&!result.hidden)||(game&&game.hidden)))closeReview(true);};
  if(result)new MutationObserver(check).observe(result,{attributes:true,attributeFilter:['hidden']});
  if(game)new MutationObserver(check).observe(game,{attributes:true,attributeFilter:['hidden']});
}
function tidySetup(){
  const subtitle=$('setupSubtitle');if(subtitle)subtitle.textContent='Inhalt wählen, Regeln festlegen, starten.';
  const rules=$('rulesHint');if(rules){const live=String($('setupEyebrow')?.textContent||'').includes('LIVE');rules.textContent=live?'Diese Regeln gelten für alle.':'Beim Üben steht Lernen vor Punkten.';}
}
function observeSetup(){
  const eyebrow=$('setupEyebrow');if(!eyebrow)return;
  new MutationObserver(()=>{syncLearningVisibility();tidySetup();}).observe(eyebrow,{childList:true,subtree:true,characterData:true});
}
function init(){compactHome();ensureLearningOptions();ensureReview();watchFeedback();watchGameEnd();observeSetup();syncLearningVisibility();tidySetup();}
init();
})();