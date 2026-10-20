import './shared/chapter-contract.js';
const C = globalThis.GradeCrewChapters || (await import('./shared/chapter-contract.js')).default;
export function chapterFields(quiz = {}) {
  if (quiz._chaptersRemoved || quiz.chapterSchemaVersion === null) return { chapterSchemaVersion: null, chapters: [], chapterPlan: [] };
  if (!Object.hasOwn(quiz, 'chapterSchemaVersion')) return {};
  return { chapterSchemaVersion: quiz.chapterSchemaVersion, chapters: structuredClone(quiz.chapters || []), ...(quiz.chapterPlan ? { chapterPlan: structuredClone(quiz.chapterPlan) } : {}) };
}
export function copyChapterFields(quiz, questions, makeId = () => `ch_${crypto.randomUUID()}`) {
  if (quiz.chapterSchemaVersion !== 1) return { quiz: chapterFields(quiz), questions: structuredClone(questions) };
  const ids = new Map(quiz.chapters.map(ch => [ch.id, makeId()]));
  return { quiz: { ...chapterFields(quiz), chapters: quiz.chapters.map(ch => ({ ...ch, id: ids.get(ch.id) })), ...(quiz.chapterPlan ? {chapterPlan:quiz.chapterPlan.map(p=>({...p,chapterId:ids.get(p.chapterId)}))} : {}) }, questions: questions.map(q => ({ ...structuredClone(q), chapterId: ids.get(q.chapterId) })) };
}
export function mountChapterEditor({ root, getState, onChange, confirm = message => globalThis.confirm(message) }) {
  const doc = root.ownerDocument;
  const change = (quiz, questions) => onChange({ quizPatch: quiz, questions: C.canonicalizeChapterQuestions(quiz, questions).map((q,i)=>({...q,position:i+1})) });
  const el = (tag, text, attrs = {}) => { const n = doc.createElement(tag); if (text) n.textContent = text; for (const [key,value] of Object.entries(attrs)) n.setAttribute(key,value); return n; };
  function render() {
    root.replaceChildren();
    const { quiz, questions } = getState();
    if (!quiz) return;
    const locked = quiz.published === true && quiz.ended !== true;
    const enabled = quiz.chapterSchemaVersion === 1;
    const label = el('label', 'In Kapitel gliedern', {class:'checkRow'});
    const toggle = el('input', '', {type:'checkbox','data-chapter-toggle':''}); toggle.checked = enabled; toggle.disabled = locked;
    label.prepend(toggle); root.append(label);
    toggle.addEventListener('change', () => {
      if (locked) return;
      if (!enabled) {
        const id=`ch_${crypto.randomUUID()}`;
        change({...quiz,_chaptersRemoved:false,chapterSchemaVersion:1,chapters:[{id,title:'Kapitel 1',position:1}]},questions.map(q=>({...q,chapterId:id})));
      } else if (confirm('Gliederung ausschalten? Alle Aufgaben bleiben in ihrer aktuellen Reihenfolge erhalten.')) {
        const next={...quiz,_chaptersRemoved:true}; delete next.chapterSchemaVersion; delete next.chapters; delete next.chapterPlan;
        change(next,questions.map(q=>{const next={...q};delete next.chapterId;return next;}));
      }
    });
    if (!enabled) return;
    const chapters=[...quiz.chapters].sort((a,b)=>a.position-b.position);
    root.append(el('p','Aufgaben bleiben frei erreichbar. Zeitlimit und Abgabe gelten für den gesamten Test.',{class:'hint'}));
    chapters.forEach((ch,index)=>{
      const row=el('div','',{class:'chapterEditorRow'});
      const title=el('input','',{'data-chapter-title':'','aria-label':`Titel von Kapitel ${index+1}`,maxlength:'120'});title.value=ch.title;title.disabled=locked;
      title.addEventListener('change',()=>change({...quiz,chapters:chapters.map(c=>c.id===ch.id?{...c,title:title.value}:c)},questions));row.append(title);
      row.append(el('small',`${questions.filter(q=>q.chapterId===ch.id).length} Aufgaben · ${questions.filter(q=>q.chapterId===ch.id).reduce((s,q)=>s+Number(q.points||0),0)} Punkte`));
      for(const [direction,caption,delta] of [['up','↑',-1],['down','↓',1]]) {
        const button=el('button',caption,{type:'button',[`data-chapter-${direction}`]:'','aria-label':`Kapitel ${index+1} ${delta<0?'nach oben':'nach unten'}`});button.disabled=locked||index+delta<0||index+delta>=chapters.length;
        button.addEventListener('click',()=>{const copy=[...chapters];[copy[index],copy[index+delta]]=[copy[index+delta],copy[index]];change({...quiz,chapters:copy.map((c,i)=>({...c,position:i+1}))},questions);});row.append(button);
      }
      const destination=el('select','',{'aria-label':`Aufgaben aus Kapitel ${index+1} verschieben nach`});
      for(const c of chapters.filter(c=>c.id!==ch.id)){const o=el('option',c.title||'Unbenannt',{value:c.id});destination.append(o);}destination.disabled=locked;
      const remove=el('button','Kapitel entfernen',{type:'button'});remove.disabled=locked||chapters.length===1;
      remove.addEventListener('click',()=>{if(!destination.value)return;if(!confirm('Kapitel entfernen und seine Aufgaben in das gewählte Kapitel verschieben?'))return;change({...quiz,chapters:chapters.filter(c=>c.id!==ch.id).map((c,i)=>({...c,position:i+1})),chapterPlan:quiz.chapterPlan?.filter(p=>p.chapterId!==ch.id)||[]},questions.map(q=>q.chapterId===ch.id?{...q,chapterId:destination.value,position:10000+q.position}:q));});
      row.append(destination,remove);root.append(row);
    });
    const add=el('button','+ Kapitel hinzufügen',{type:'button','data-chapter-add':'',class:'button secondary'});add.disabled=locked||chapters.length>=100;
    add.addEventListener('click',()=>change({...quiz,chapters:[...chapters,{id:`ch_${crypto.randomUUID()}`,title:`Kapitel ${chapters.length+1}`,position:chapters.length+1}]},questions));root.append(add);
  }
  return {render,destroy:()=>root.replaceChildren()};
}

export function mountQuestionChapterSelect(node, question, quiz, onChange) {
  if (quiz?.chapterSchemaVersion !== 1) return;
  const doc=node.ownerDocument;const label=doc.createElement('label');label.className='chapterQuestionSelect';label.textContent='Kapitel';const select=doc.createElement('select');select.setAttribute('aria-label','Kapitel der Aufgabe');
  for(const ch of quiz.chapters){const option=doc.createElement('option');option.value=ch.id;option.textContent=ch.title||'Unbenannt';select.append(option);}
  select.value=question.chapterId||'';select.disabled=quiz.published===true&&quiz.ended!==true;
  select.addEventListener('change',()=>onChange(select.value));label.append(select);node.querySelector('.answerEditor')?.before(label);
}
