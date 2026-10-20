/** Presentation only. The existing form owns all answers, timers and submission. */
export function mountChapterStudent({root,paper,chapters,getAnswers,isComplete,goToQuestion}) {
  const doc=root.ownerDocument;const headings=[];
  if(!chapters?.length)return {renderProgress(){},destroy(){}};
  for(const chapter of chapters){
    const questions=paper.filter(q=>q.chapterId===chapter.id);const first=[...root.querySelectorAll('.secureQuestion[data-qid]')].find(n=>n.dataset.qid===questions[0]?.id);
    if(!first)continue;
    const heading=doc.createElement('h2');heading.className='secureChapterHeading';heading.dataset.chapterId=chapter.id;
    const title=doc.createElement('span');title.textContent=chapter.title;const progress=doc.createElement('small');heading.append(title,progress);first.before(heading);headings.push({heading,progress,questions});
    for(const q of questions){const section=[...root.querySelectorAll('.secureQuestion[data-qid]')].find(n=>n.dataset.qid===q.id);if(section){section.dataset.chapterId=chapter.id;section.dataset.chapterTitle=chapter.title;}}
  }
  const jump=event=>{if(event.detail?.questionId)goToQuestion?.(event.detail.questionId);};
  root.addEventListener('chapter-question-jump',jump);
  function renderProgress(){const answers=getAnswers();for(const row of headings){let complete=0;for(const q of row.questions){const done=Boolean(isComplete(q,answers[q.id]));if(done)complete++;const section=[...root.querySelectorAll('.secureQuestion[data-qid]')].find(n=>n.dataset.qid===q.id);if(section)section.dataset.answered=String(done);}row.progress.textContent=`${complete} von ${row.questions.length} bearbeitet`;}
    root.dispatchEvent(new doc.defaultView.CustomEvent('chapter-progress',{bubbles:true}));
  }
  return {renderProgress,destroy(){headings.forEach(r=>r.heading.remove());root.removeEventListener('chapter-question-jump',jump);}};
}
