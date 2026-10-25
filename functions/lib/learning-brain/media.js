'use strict';
const {createHash}=require('node:crypto');
const {LearningError}=require('./service');
function createLearningMedia({load,read,save,synthesize,now=Date.now}){
 return {async audio(uid,data){
  const state=await load(uid),s=state?.sessions?.[data.sessionId];
  if(!s)throw new LearningError('not-found','Bitte deinen gespeicherten Lernstand laden.');
  if(s.deadline<=now()||s.phase==='ended')throw new LearningError('failed-precondition','Die Einheit ist beendet.');
  if(s.revision!==data.revision)throw new LearningError('failed-precondition','Deine Aufgabe hat sich geändert. Bitte neu laden.');
  const t=[s.pendingNext?null:s.task,s.originalTask].find(t=>t?.id===data.taskId);
  if(t?.media?.kind!=='listen'||typeof t.media.script!=='string'||t.media.script.length<15||t.media.script.length>1400)throw new LearningError('invalid-argument','Diese Höraufgabe ist nicht verfügbar.');
  const key=createHash('sha256').update(JSON.stringify([uid,t.media.script,'marin-gpt-4o-mini-tts-v1'])).digest('hex');
  const cached=await read(key);if(cached?.expiresAt>now())return cached.asset;
  const result=await synthesize({uid,questionId:t.id,script:t.media.script});
  if(typeof result?.audioDataUrl!=='string'||!result.audioDataUrl.startsWith('data:audio/mpeg;base64,')||result.audioDataUrl.length>500000)throw new LearningError('unavailable','Der Hörtext konnte noch nicht bereitgestellt werden.');
  const asset={audioDataUrl:result.audioDataUrl,audioAiGenerated:true};
  await save(key,{asset,expiresAt:now()+86400000,expireAt:new Date(now()+86400000)});
  return asset;
 }};
}
module.exports={createLearningMedia};
