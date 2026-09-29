(() => {
'use strict';
const SETS_KEY='gradecrew-vocabrush-sets-v1';
const $=id=>document.getElementById(id);
const runtime=window.VocabRushModeRuntime||(window.VocabRushModeRuntime={writeAfterWrong:false,mode:'practice'});
const nativeFetch=window.fetch.bind(window);
const norm=v=>String(v||'').trim().toLocaleLowerCase('de-DE').replace(/\s+/g,' ');

function readSets(){try{const x=JSON.parse(localStorage.getItem(SETS_KEY)||'[]');return Array.isArray(x)?x.filter(s=>s&&!s.virtual&&s.id!=='__gradecrew_combined_selection__'):[];}catch{return[];}}
function dedupe(items){const map=new Map();for(const raw of items||[]){const source=String(raw?.source||'').trim(),targets=[...new Set((raw?.targets||[]).map(x=>String(x).trim()).filter(Boolean))];if(!source||!targets.length)continue;const k=norm(source);if(map.has(k))map.get(k).targets=[...new Set([...map.get(k).targets,...targets])];else map.set(k,{source,targets});}return[...map.values()].slice(0,120);}
function selectedHsSets(){const ids=[...document.querySelectorAll('input[name="vrHighscoreSet"]:checked')].map(x=>x.value),sets=readSets();return sets.filter(s=>ids.includes(s.id));}
function hsSource(){return document.querySelector('input[name="vrHighscoreSource"]:checked')?.value||'curriculum';}
function hsDirection(){return $('vrHighscoreDirection')?.value||'mixed';}
function hsWrite(){return Boolean($('vrHighscoreWriteAfterWrong')?.checked);}
function hsPayload(){
  const writeAfterWrong=hsWrite();
  if(hsSource()!=='custom')return{source:'curriculum',grade:$('highscoreGrade')?.value||'9',topic:$('highscoreTopic')?.value||'',writeAfterWrong};
  const sets=selectedHsSets(),items=dedupe(sets.flatMap(s=>s.items||[]));
  const setTitle=sets.length===1?sets[0].title:sets.length<=3?sets.map(s=>s.title).join(' + '):`${sets.length} Sets · gemischt`;
  return{source:'custom',setId:sets.length===1?sets[0].id:'combined',setTitle:setTitle||'Eigene Vokabeln',direction:hsDirection(),items,writeAfterWrong};
}
function hsLabel(payload=hsPayload()){
  const suffix=payload.writeAfterWrong?' · Schreibmodus':'';
  if(payload.source==='custom')return`${payload.setTitle||'Eigene Vokabeln'} · ${payload.direction==='mixed'?'DE ↔ EN':payload.direction==='en-de'?'EN → DE':'DE → EN'}${suffix}`;
  const topic=$('highscoreTopic')?.selectedOptions?.[0]?.textContent||'Lehrplan';
  return`Jgst. ${payload.grade} · ${topic}${suffix}`;
}
function triggerBoardRefresh(){
  const err=$('highscoreError');if(err)err.textContent='';
  const topic=$('highscoreTopic');if(topic)topic.dispatchEvent(new Event('change',{bubbles:true}));
}
function renderHsSets(){
  const host=$('vrHighscoreSets');if(!host)return;
  const sets=readSets(),before=new Set([...host.querySelectorAll('input:checked')].map(x=>x.value));
  host.replaceChildren();
  if(!sets.length){host.innerHTML='<p class="empty">Noch kein eigenes Vokabelset. Lege zuerst unter „Üben“ ein Set an.</p>';return;}
  sets.forEach((set,i)=>{
    const label=document.createElement('label');label.className='vrHsSet';
    const input=document.createElement('input');input.type='checkbox';input.name='vrHighscoreSet';input.value=set.id;input.checked=before.size?before.has(set.id):i===0;
    const span=document.createElement('span'),b=document.createElement('b'),small=document.createElement('small');b.textContent=set.title;small.textContent=`${set.items?.length||0} Vokabeln`;span.append(b,small);label.append(input,span);host.append(label);
    input.addEventListener('change',triggerBoardRefresh);
  });
}
function syncHsUi(){
  const custom=hsSource()==='custom';
  if($('vrHsCurriculum'))$('vrHsCurriculum').hidden=custom;
  if($('vrHsCustom'))$('vrHsCustom').hidden=!custom;
  const board=$('boardLabel');if(board)board.textContent=hsLabel();
}
function ensureHighscoreOptions(){
  const card=document.querySelector('#highscoreView .highscoreGrid>.card');
  if(!card||$('vrHighscoreOptions'))return;
  const gradeLabel=$('highscoreGrade')?.closest('label'),topicLabel=$('highscoreTopic')?.closest('label'),nameLabel=$('highscoreName')?.closest('label');
  if(!gradeLabel||!topicLabel||!nameLabel)return;
  const block=document.createElement('div');block.id='vrHighscoreOptions';block.className='vrHighscoreOptions';
  block.innerHTML=`<div class="vrHsHead"><strong>Inhalt</strong><small>Wie bei Üben und Live: Lehrplan oder deine eigenen Vokabelsets.</small></div>
    <div class="sourcePicker compact vrHsSource"><label><input type="radio" name="vrHighscoreSource" value="curriculum" checked><span><b>Lehrplan-Training</b><small>Feste Disziplin</small></span></label><label><input type="radio" name="vrHighscoreSource" value="custom"><span><b>Meine Vokabeln</b><small>Ein oder mehrere Sets</small></span></label></div>
    <div id="vrHsCurriculum" class="vrHsFields"></div>
    <div id="vrHsCustom" class="vrHsCustom" hidden><div class="vrHsHead"><strong>Vokabelsets</strong><small>Mehrere Sets können gemeinsam gespielt werden.</small></div><div id="vrHighscoreSets" class="vrHsSets"></div><label class="field"><span>Abfragerichtung</span><select id="vrHighscoreDirection"><option value="mixed">Gemischt · DE ↔ EN</option><option value="en-de">EN → DE</option><option value="de-en">DE → EN</option></select></label></div>
    <label class="toggle vrHsWrite"><input id="vrHighscoreWriteAfterWrong" type="checkbox"><span><b>Nach Fehler richtige Lösung schreiben</b><small>Erst korrekt eintippen, dann geht es weiter. Dieser Modus hat eine eigene Bestenliste.</small></span></label>`;
  nameLabel.after(block);
  const curriculum=$('vrHsCurriculum');curriculum.append(gradeLabel,topicLabel);
  block.querySelectorAll('input[name="vrHighscoreSource"]').forEach(x=>x.addEventListener('change',()=>{syncHsUi();triggerBoardRefresh();}));
  $('vrHighscoreDirection').addEventListener('change',triggerBoardRefresh);
  $('vrHighscoreWriteAfterWrong').addEventListener('change',triggerBoardRefresh);
  renderHsSets();syncHsUi();
}
function setRuntimeFromConfig(config,mode){if(!config)return;runtime.writeAfterWrong=Boolean(config.learning?.writeAfterWrong);if(mode)runtime.mode=mode;}
function capturePracticeChoice(){
  const eyebrow=String($('setupEyebrow')?.textContent||'').trim();
  runtime.mode=eyebrow.includes('LIVE')?'liveTeacher':'practice';
  runtime.writeAfterWrong=Boolean($('vrWriteAfterWrong')?.checked);
}
function patchRequest(action,payload){
  if(action==='createRoom'){
    const writeAfterWrong=Boolean($('vrWriteAfterWrong')?.checked);
    runtime.mode='liveTeacher';runtime.writeAfterWrong=writeAfterWrong;
    payload={...payload,config:{...(payload.config||{}),learning:{...(payload.config?.learning||{}),writeAfterWrong}}};
  }
  if(action==='createHighscoreAttempt'||action==='leaderboard'){
    const extra=hsPayload();runtime.mode='highscore';runtime.writeAfterWrong=Boolean(extra.writeAfterWrong);
    payload={...payload,...extra};
    const board=$('boardLabel');if(board)board.textContent=hsLabel(extra);
  }
  return payload;
}
window.fetch=async(input,init={})=>{
  let nextInit=init,action=null;
  try{
    const url=typeof input==='string'?input:input?.url||'';
    if(url.includes('vocabRushApi')&&typeof init?.body==='string'){
      const body=JSON.parse(init.body);action=body.action;
      body.payload=patchRequest(action,body.payload||{});
      nextInit={...init,body:JSON.stringify(body)};
    }
  }catch{}
  const response=await nativeFetch(input,nextInit);
  try{
    if(action){const json=await response.clone().json();const config=json?.data?.config;if(config)setRuntimeFromConfig(config,action==='createHighscoreAttempt'?'highscore':action==='joinRoom'||action==='roomState'?'livePlayer':null);}
  }catch{}
  return response;
};
function init(){
  ensureHighscoreOptions();
  $('setupForm')?.addEventListener('submit',capturePracticeChoice,true);
  document.querySelector('[data-open="highscore"]')?.addEventListener('click',()=>setTimeout(()=>{renderHsSets();syncHsUi();triggerBoardRefresh();},0));
  window.addEventListener('storage',e=>{if(e.key===SETS_KEY)renderHsSets();});
}
init();
})();