(() => {
'use strict';
const $=id=>document.getElementById(id);
const TOPICS=window.VocabRush?.TOPICS||{};
const topicLabels=new Set(Object.values(TOPICS).map(x=>x.label));
const GROUPS=[
  {key:'tenses',label:'Zeiten & Verben',ids:['irregular_verbs','simple_present','simple_past','present_progressive','present_perfect','going_to','will_future','past_progressive','tense_mix']},
  {key:'grammar',label:'Satzbau & Grammatik',ids:['word_order','question_words','pronouns','relative_clauses','modal_verbs','adjective_comparison','if_clause1','some_any_no','quantities','adverbs']},
  {key:'expression',label:'Wörter & Ausdruck',ids:['phrasal_verbs','collocations','prepositions']}
];
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
function currentGrade(){return Number(document.querySelector('input[name="grade"]:checked')?.value||9);}
function ensureTopicToolbar(){
  const grid=$('topicGrid'),section=grid?.closest('.setupSection');if(!grid||!section)return null;
  let bar=$('vrTopicToolbar');
  if(!bar){
    bar=document.createElement('div');bar.id='vrTopicToolbar';bar.className='vrTopicToolbar';
    bar.innerHTML='<span id="vrTopicSummary"></span><div><button id="vrTopicRecommended" class="textBtn" type="button">Empfehlung laden</button><button id="vrTopicClear" class="textBtn" type="button">Alles abwählen</button></div>';
    grid.before(bar);
    $('vrTopicRecommended').addEventListener('click',()=>{
      const g=currentGrade();
      document.querySelectorAll('input[name="topic"]').forEach(input=>{const meta=TOPICS[input.value];input.checked=Boolean(meta&&meta.introduced===g);});
      updateTopicCounts();
    });
    $('vrTopicClear').addEventListener('click',()=>{document.querySelectorAll('input[name="topic"]').forEach(input=>input.checked=false);updateTopicCounts();});
  }
  const small=section.querySelector('.sectionHead small');if(small)small.textContent='Nach Bereichen sortiert. Empfohlene Inhalte sind direkt geöffnet.';
  return bar;
}
function makeGroup(key,label,tiles,open=false){
  if(!tiles.length)return null;
  const details=document.createElement('details');details.className='vrTopicGroup';details.dataset.group=key;details.open=open;
  const summary=document.createElement('summary');
  summary.innerHTML='<span><b></b><small></small></span><span class="vrTopicChevron">⌄</span>';
  summary.querySelector('b').textContent=label;
  const body=document.createElement('div');body.className='vrTopicTiles';tiles.forEach(tile=>body.append(tile));
  details.append(summary,body);return details;
}
function groupTopics(){
  const grid=$('topicGrid');if(!grid)return;
  const direct=[...grid.children].filter(x=>x.classList?.contains('topicTile'));
  if(!direct.length)return;
  ensureTopicToolbar();
  const g=currentGrade(),byId=new Map(direct.map(tile=>[tile.querySelector('input[name="topic"]')?.value,tile]));
  const used=new Set(),recommended=[];
  for(const [id,tile] of byId){const meta=TOPICS[id];if(meta?.introduced===g){recommended.push(tile);used.add(id);}}
  const groups=[];
  if(recommended.length)groups.push(makeGroup('recommended',`Empfohlen für Jgst. ${g}`,recommended,true));
  for(const group of GROUPS){const tiles=[];for(const id of group.ids){if(used.has(id)||!byId.has(id))continue;tiles.push(byId.get(id));used.add(id);}if(tiles.length)groups.push(makeGroup(group.key,group.label,tiles,false));}
  const rest=[...byId].filter(([id])=>!used.has(id)).map(([,tile])=>tile);if(rest.length)groups.push(makeGroup('other','Weitere Inhalte',rest,false));
  grid.classList.add('vrGroupedTopicGrid');grid.replaceChildren(...groups.filter(Boolean));
  grid.querySelectorAll('input[name="topic"]').forEach(x=>x.addEventListener('change',updateTopicCounts));
  updateTopicCounts();
}
function updateTopicCounts(){
  const all=[...document.querySelectorAll('input[name="topic"]')],selected=all.filter(x=>x.checked).length;
  const sum=$('vrTopicSummary');if(sum)sum.textContent=`${selected} von ${all.length} Themen ausgewählt`;
  document.querySelectorAll('.vrTopicGroup').forEach(group=>{
    const inputs=[...group.querySelectorAll('input[name="topic"]')],count=inputs.filter(x=>x.checked).length,small=group.querySelector('summary small');
    if(small)small.textContent=`${count} ausgewählt · ${inputs.length} Themen`;
  });
}
function instructionFor(topic){return INSTRUCTIONS[topic]||'Wähle die passende Übersetzung.';}
function prepareTask(){
  const topic=$('taskTopic'),instruction=document.querySelector('#gameView .instruction');if(!topic||!instruction)return;
  let raw=String(topic.textContent||'').trim().replace(/^(Thema|Set)\s*·\s*/i,'');if(!raw)return;
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
  setTimeout(groupTopics,0);
  document.querySelectorAll('input[name="grade"]').forEach(x=>x.addEventListener('change',()=>setTimeout(groupTopics,0)));
  bindTaskPolish();
}
init();
})();
