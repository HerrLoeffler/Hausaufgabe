'use strict';
const {compareFacts,solve}=require('./oracle.cjs');
function checkCandidate(plan,judge,expected){
  const errors=[];
  if(expected&&!compareFacts(expected,plan))errors.push('Die Auswahl oder Ausgangszahlen passen nicht zum festen Prüfwunsch.');
  if(!judge.matchesWish)errors.push('Der Auftrag verändert oder verliert Angaben des Wunsches.');
  if(!judge.appropriate)errors.push('Die Darstellung passt fachlich nicht.');
  if(!judge.unambiguous)errors.push('Der Auftrag ist nicht eindeutig lösbar.');
  if(judge.leaksAnswer)errors.push('Der öffentliche Auftrag verrät eine gesuchte Antwort.');
  if(!compareFacts(plan,judge))errors.push('Unabhängige Fachprüfung widerspricht der gewählten Beziehung oder den Ausgangszahlen.');
  if(['direct','inverse'].includes(plan.kind)){
    try{
      const expectedAnswer=solve(plan).result;
      const answer=String(judge.answer).trim().replace(',','.');
      if(!answer||!Number.isFinite(Number(answer))||Math.abs(Number(answer)-Number(expectedAnswer))>1e-9)errors.push('Der unabhängige Lösungsversuch widerspricht dem exakten Rechenprüfer.');
    }catch(error){errors.push(error.message);}
  }
  return {ok:errors.length===0,errors};
}
module.exports={checkCandidate};
