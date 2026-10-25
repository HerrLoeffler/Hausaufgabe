(() => {
'use strict';
const $=id=>document.getElementById(id);
const TOPICS=window.VocabRush?.TOPICS||{};
const topicLabels=new Set(Object.values(TOPICS).map(x=>x.label));
const GROUPS={
  tenses:new Set(['irregular_verbs','simple_present','simple_past','present_progressive','present_perfect','going_to','will_future','past_progressive','tense_mix']),
  grammar:new Set(['word_order','question_words','pronouns','relative_clauses','modal_verbs','adjective_comparison','if_clause1','some_any_no','quantities','adverbs']),
  vocab:new Set(['phrasal_verbs','collocations','prepositions'])
};
const FILTER_LABELS={recommended:'Empfohlen',tenses:'Zeiten & Verben',grammar:'Grammatik',vocab:'Wortschatz'};
const INSTRUCTIONS={
  'Irregular verbs':'Wähle die richtige Form oder Bedeutung.',
  'Simple present':'Wähle die passende Verbform.',
  'Simple past':'Wähle die passende Verbform.',
  'Question words':'Setze das passende Fragewort ein.',
  'Prepositions':'Setze die passende Präposition ein.',
  'some / any / no':'Setze den passenden Ausdruck ein.',
  'Phrasal verbs':'Wähle die passende deutsche Bedeutung.',
  'Collocations':'Wähle die passende deutsche Bedeutung.',
  'Present progressive':'Wähle die passende Verbform.',
  'will-future':'Wähle die passende Verbform.',
  'Modal verbs':'Setze das passende Modalverb ein.',
  'Comparison of adjectives':'Wähle die passende Steigerungsform.',
  'Pronouns':'Setze das passende Pronomen ein.',
  'Present perfect':'Wähle die passende Form oder Ergänzung.',
  'Quantities':'Setze den passenden Mengenausdruck ein.',
  'going-to-future':'Wähle die passende Verbform.',
  'Relative clauses':'Setze das passende Relativpronomen ein.',
  'Adverbs':'Wähle die sprachlich passende Form.',
  'Word order':'Wähle den korrekt gebildeten Satz.',
  'Past progressive':'Wähle die passende Verbform.',
  'If-clauses type I':'Vervollständige den Satz passend.',
  'Tense mix':'Wähle die Verbform, die zum Kontext passt.'
};
let topicSection=null;
let topicDialog=null;
let topicSnapshot=null;
let activeFilter='recommended';

function currentGrade(){return Number(document.querySelector('input[name="grade"]:checked')?.value||9);}
function topicInputs(){return [...document.querySelectorAll('#topicGrid input[name="topic"]')];}
function groupFor(id){for(const [group,ids] of Object.entries(GROUPS))if(ids.has(id))return group;return 'grammar';}
function isRecommended(id){return Number(TOPICS[id]?.introduced)===currentGrade();}
function selectedTopicIds(){return topicInputs().filter(x=>x.checked).map(x=>x.value);}

function ensureTopicOverview(){
  if(!topicSection)return;
  let overview=$('vrTopicOverview');
  if(!overview){
    overview=document.createElement('div');overview.id='vrTopicOverview';overview.className='vrTopicOverview';
    overview.innerHTML='<div class="vrTopicOverviewText"><strong id="vrTopicOverviewTitle">Themen ausgewählt</strong><div id="vrSelectedTopicChips" class="vrSelectedTopicChips"></div></div><button id="vrChangeTopics" class="secondary" type="button">Themen ändern</button>';
    const head=topicSection.querySelector('.sectionHead');head?.after(overview);
    $('vrChangeTopics')?.addEventListener('click',openTopicDialog);
  }
  const small=topicSection.querySelector('.sectionHead small');
  if(small)small.textContent='Nur die gewählten Themen kommen in dieser Runde vor.';
}

function ensureTopicDialog(){
  const grid=$('topicGrid');if(!grid)return;
  if(topicDialog)return;
  topicDialog=document.createElement('dialog');topicDialog.id='vrTopicDialog';topicDialog.className='vrTopicDialog';
  topicDialog.innerHTML=`<div class="vrTopicDialogCard">
    <header class="vrTopicDialogHead"><div><span class="eyebrow">THEMENAUSWAHL</span><h2>Themen wählen</h2><p id="vrTopicDialogSubtitle"></p></div><button id="vrTopicClose" class="vrIconButton" type="button" aria-label="Schließen">×</button></header>
    <nav id="vrTopicFilters" class="vrTopicFilters" aria-label="Themenbereiche">
      <button type="button" data-topic-filter="recommended">Empfohlen</button>
      <button type="button" data-topic-filter="tenses">Zeiten</button>
      <button type="button" data-topic-filter="grammar">Grammatik</button>
      <button type="button" data-topic-filter="vocab">Wortschatz</button>
    </nav>
    <div class="vrTopicQuickActions"><button id="vrSelectRecommended" class="textBtn" type="button">Empfohlene auswählen</button><button id="vrClearTopics" class="textBtn" type="button">Auswahl leeren</button></div>
    <div id="vrTopicPickerHost" class="vrTopicPickerHost"></div>
    <footer class="vrTopicDialogFoot"><strong id="vrTopicDialogCount">0 ausgewählt</strong><div><button id="vrTopicCancel" class="secondary" type="button">Abbrechen</button><button id="vrTopicApply" class="primary" type="button">Übernehmen</button></div></footer>
  </div>`;
  document.body.append(topicDialog);
  $('vrTopicPickerHost').append(grid);
  $('vrTopicClose').addEventListener('click',cancelTopicDialog);
  $('vrTopicCancel').addEventListener('click',cancelTopicDialog);
  $('vrTopicApply').addEventListener('click',applyTopicDialog);
  $('vrSelectRecommended').addEventListener('click',()=>{topicInputs().forEach(input=>input.checked=isRecommended(input.value));updateTopicUi();});
  $('vrClearTopics').addEventListener('click',()=>{topicInputs().forEach(input=>input.checked=false);updateTopicUi();});
  $('vrTopicFilters').addEventListener('click',e=>{const b=e.target.closest('[data-topic-filter]');if(!b)return;setTopicFilter(b.dataset.topicFilter);});
  topicDialog.addEventListener('click',e=>{if(e.target===topicDialog)cancelTopicDialog();});
  topicDialog.addEventListener('cancel',e=>{e.preventDefault();cancelTopicDialog();});
}

function decorateTopicTiles(){
  const grid=$('topicGrid');if(!grid)return;
  grid.classList.add('vrTopicPickerGrid');
  for(const tile of grid.querySelectorAll('.topicTile')){
    const input=tile.querySelector('input[name="topic"]');if(!input)continue;
    tile.dataset.topicId=input.value;
    tile.dataset.topicGroup=groupFor(input.value);
    tile.dataset.recommended=isRecommended(input.value)?'1':'0';
    const em=tile.querySelector('em');if(em)em.hidden=true;
  }
  if(!grid.dataset.vrBound){grid.dataset.vrBound='1';grid.addEventListener('change',e=>{if(e.target.matches('input[name="topic"]'))updateTopicUi();});}
}

function setTopicFilter(filter){
  activeFilter=FILTER_LABELS[filter]?filter:'recommended';
  document.querySelectorAll('[data-topic-filter]').forEach(b=>b.classList.toggle('active',b.dataset.topicFilter===activeFilter));
  for(const tile of document.querySelectorAll('#topicGrid .topicTile')){
    const id=tile.dataset.topicId;
    tile.hidden=activeFilter==='recommended'?!isRecommended(id):groupFor(id)!==activeFilter;
  }
  const subtitle=$('vrTopicDialogSubtitle');
  if(subtitle)subtitle.textContent=activeFilter==='recommended'?`Empfohlen für Jahrgangsstufe ${currentGrade()}`:FILTER_LABELS[activeFilter];
}

function updateTopicUi(){
  decorateTopicTiles();
  const ids=selectedTopicIds(),title=$('vrTopicOverviewTitle'),chips=$('vrSelectedTopicChips'),count=$('vrTopicDialogCount');
  if(title)title.textContent=ids.length===1?'1 Thema ausgewählt':`${ids.length} Themen ausgewählt`;
  if(count)count.textContent=ids.length===1?'1 ausgewählt':`${ids.length} ausgewählt`;
  if(chips){
    chips.replaceChildren();
    if(!ids.length){const empty=document.createElement('span');empty.className='vrTopicEmpty';empty.textContent='Noch kein Thema ausgewählt';chips.append(empty);}
    else{
      ids.slice(0,4).forEach(id=>{const chip=document.createElement('span');chip.textContent=TOPICS[id]?.label||id;chips.append(chip);});
      if(ids.length>4){const more=document.createElement('span');more.className='vrTopicMore';more.textContent=`+${ids.length-4} weitere`;chips.append(more);}
    }
  }
  setTopicFilter(activeFilter);
}

function openTopicDialog(){
  ensureTopicDialog();decorateTopicTiles();
  topicSnapshot=new Map(topicInputs().map(x=>[x.value,x.checked]));
  activeFilter='recommended';updateTopicUi();
  if(typeof topicDialog.showModal==='function')topicDialog.showModal();else topicDialog.setAttribute('open','');
  document.body.classList.add('vrDialogOpen');
}
function closeTopicDialog(){if(!topicDialog)return;if(typeof topicDialog.close==='function'&&topicDialog.open)topicDialog.close();else topicDialog.removeAttribute('open');document.body.classList.remove('vrDialogOpen');}
function cancelTopicDialog(){if(topicSnapshot){topicInputs().forEach(x=>{if(topicSnapshot.has(x.value))x.checked=topicSnapshot.get(x.value);});}topicSnapshot=null;updateTopicUi();closeTopicDialog();}
function applyTopicDialog(){topicSnapshot=null;updateTopicUi();closeTopicDialog();}

function setupTopicPicker(){
  const grid=$('topicGrid');if(!grid)return;
  if(!topicSection)topicSection=grid.closest('.setupSection');
  ensureTopicOverview();ensureTopicDialog();decorateTopicTiles();updateTopicUi();
  if(!grid.dataset.vrObserve){grid.dataset.vrObserve='1';new MutationObserver(()=>{decorateTopicTiles();updateTopicUi();}).observe(grid,{childList:true});}
}

function instructionFor(topic){return INSTRUCTIONS[topic]||'Wähle die passende Übersetzung.';}
function prepareTask(){
  const topic=$('taskTopic'),instruction=document.querySelector('#gameView .instruction');if(!topic||!instruction)return;
  const raw=String(topic.textContent||'').trim().replace(/^(Thema|Set)\s*·\s*/i,'');if(!raw)return;
  topic.dataset.rawTopic=raw;topic.hidden=true;topic.classList.remove('vrTaskTopicBadge');
  instruction.textContent=instructionFor(raw);
}
function revealTaskTopic(){
  const topic=$('taskTopic');if(!topic)return;const raw=topic.dataset.rawTopic||String(topic.textContent||'').trim();if(!raw)return;
  const isCurriculum=topicLabels.has(raw);topic.textContent=`${isCurriculum?'Thema':'Set'} · ${raw}`;topic.hidden=false;topic.classList.add('vrTaskTopicBadge');
}
function bindTaskPolish(){
  const number=$('taskNumber'),feedback=$('feedback');
  if(number)new MutationObserver(()=>setTimeout(prepareTask,0)).observe(number,{childList:true,subtree:true,characterData:true});
  if(feedback)new MutationObserver(()=>{if(feedback.textContent.trim()&&(feedback.classList.contains('good')||feedback.classList.contains('bad')))revealTaskTopic();}).observe(feedback,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
}
function init(){
  setupTopicPicker();
  document.querySelectorAll('input[name="grade"]').forEach(x=>x.addEventListener('change',()=>setTimeout(()=>{decorateTopicTiles();activeFilter='recommended';updateTopicUi();},0)));
  document.querySelectorAll('[data-open="practice"],[data-open="live"]').forEach(x=>x.addEventListener('click',()=>setTimeout(setupTopicPicker,0)));
  bindTaskPolish();
}
init();
})();