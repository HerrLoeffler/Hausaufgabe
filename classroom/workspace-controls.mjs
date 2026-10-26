const millis=v=>typeof v?.toMillis==='function'?v.toMillis():Number(v)||0;
export function currentAssignments(rows,quiz,accountId){
 if(!quiz||quiz.ownerId!==accountId||!quiz.published||quiz.ended||quiz.isDeleted||quiz.rightsHold)return [];
 const epoch=Math.max(millis(quiz.reopenedAt),millis(quiz.publishedAt))||millis(quiz.createdAt);
 const run=quiz.startMode==='teacher'?quiz.sessionRunId:epoch?`student_${epoch}`:null;
 return rows.filter(a=>a.quizId===quiz.id&&a.sessionRunId===run);
}
export function filterRoster(rows,query){const q=String(query||'').trim().toLocaleLowerCase('de');return rows.filter(r=>[r.firstName,r.lastName,r.className,r.year,r.title,r.subject].filter(Boolean).join(' ').toLocaleLowerCase('de').includes(q));}
export function installLiveEntry(card,onOpen){
 if(card.querySelector('[data-online-live]'))return;
 const b=card.ownerDocument.createElement('button');b.type='button';b.className='button gcLiveEntry';b.dataset.onlineLive='';b.textContent='LIVE · Durchführung';b.setAttribute('aria-label','LIVE · Durchführung und Teilnehmer öffnen');
 b.addEventListener('click',()=>{if(b.disabled)return;b.disabled=true;Promise.resolve().then(onOpen).finally(()=>{b.disabled=false;});});
 (card.querySelector('.primaryQuizActions')||card).append(b);
}
