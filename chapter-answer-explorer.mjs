// Presentation only: receives already-authorized, decoded teacher result data.
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().filter(key=>key!=='position').map(key=>[key,canonical(value[key])])) : value;
const rawAnswer = value => value === undefined || value === null || value === '' ? '(leer)' : typeof value === 'string' ? value : JSON.stringify(value);
export function mountChapterAnswerExplorer({root,submissions=[],currentQuestions=[],answerDisplay,correctDisplay,locale,onReview}) {
  const doc=root.ownerDocument;
  const el=(tag,text,className)=>{const node=doc.createElement(tag);if(text!==undefined)node.textContent=String(text);if(className)node.className=className;return node;};
  const groups=new Map();
  for(const submission of submissions){
    const historical=Boolean(submission.chapterSnapshot)||Array.isArray(submission.chapterQuestions);
    const questions=historical ? submission.chapterQuestions||[] : currentQuestions;
    const definitions=new Map(questions.map(q=>[q.id,q]));
    const metadata=new Map((submission.chapterSnapshot?.questions||[]).map(q=>[q.id,q]));
    const ids=new Set([...definitions.keys(),...metadata.keys(),...Object.keys(submission.answers||{}),...Object.keys(submission.grading||{})]);
    for(const id of ids){
      const question=definitions.get(id);const meta=metadata.get(id);
      const chapterId=meta?.chapterId||question?.chapterId||'';
      const chapter=submission.chapterSnapshot?.chapters?.find(ch=>ch.id===chapterId);
      const title=chapter?.title||(chapterId?'Kapitel ohne gespeicherten Titel':'Ohne Kapitel');
      const key=JSON.stringify([chapterId,title,id,question?canonical(question):null,historical]);
      if(!groups.has(key))groups.set(key,{key,id,question,historical,title,chapterKey:JSON.stringify([chapterId,title]),rows:[]});
      groups.get(key).rows.push({submission,meta});
    }
  }
  root.replaceChildren();root.classList.add('chapterAnswerExplorer');
  root.append(el('h3','Antworten nach Kapitel und Aufgabe'));
  const label=el('label','Aufgabe vergleichen ', 'chapterAnswerFilter');
  const select=el('select');select.setAttribute('aria-label','Aufgabe vergleichen');select.append(el('option','Alle Aufgaben'));select.firstChild.value='';label.append(select);root.append(label);
  const versions=new Map();for(const g of groups.values())versions.set(g.id,(versions.get(g.id)||0)+1);
  const revision=new Map();let index=0;
  for(const group of groups.values()){
    const version=(revision.get(group.id)||0)+1;revision.set(group.id,version);
    group.label=`${group.question?.text||'Originalaufgabe nicht verfügbar'}${versions.get(group.id)>1?` · Fassung ${version}`:''}`;
    group.value=String(++index);const option=el('option',`${group.title} · ${group.label}`);option.value=group.value;select.append(option);
  }
  const content=el('div',undefined,'chapterAnswerContent');root.append(content);
  function render(){
    content.replaceChildren();const chapters=new Map();
    for(const group of groups.values()){
      if(select.value&&select.value!==group.value)continue;
      if(!chapters.has(group.chapterKey)){
        const chapter=el('details',undefined,'chapterAnswerChapter');chapter.open=Boolean(select.value);chapter.append(el('summary',group.title));chapters.set(group.chapterKey,chapter);content.append(chapter);
      }
      const details=el('details',undefined,'chapterAnswerQuestion');details.open=Boolean(select.value);details.append(el('summary',`${group.label} · ${group.rows.length} Antworten`));
      if(!group.historical)details.append(el('p','Ältere Abgabe ohne gespeicherte Aufgabenfassung: Anzeige mit aktueller Aufgabenfassung.','chapterAnswerNotice'));
      if(!group.question)details.append(el('p','Originalaufgabe nicht verfügbar. Antwort wird unverändert angezeigt.','chapterAnswerNotice'));
      const q=group.question;
      if(q){
        const expected=correctDisplay?.(q,locale);if(expected)details.append(el('p',`Lösung: ${expected}`,'chapterAnswerSolution'));
        if(q.reviewMediaAssetId)details.append(el('p','Originalbilder über die Schaltfläche zur Schülerbewertung einsehen.','chapterAnswerMedia'));
        const imageAlt=q.imageAlt||q.image?.alt||q.image?.altText;
        if(imageAlt||q.imagePath||q.imageUrl||q.imageDataUrl||q.image)details.append(el('p',`Originalbild${imageAlt?`: ${imageAlt}`:': in dieser Übersicht nicht dargestellt'}`,'chapterAnswerMedia'));
        for(const [i,option] of (q.options||[]).entries())if(option.imageAlt||option.imageDataUrl||option.imageUrl||option.imagePath)details.append(el('p',`Antwortmöglichkeit ${i+1} · Originalbild: ${option.imageAlt||'ohne gespeicherte Bildbeschreibung'}`,'chapterAnswerMedia'));
      }
      const wrap=el('div',undefined,'chapterAnswerTableWrap');const table=el('table',undefined,'chapterAnswerTable');table.append(el('caption',group.label));
      const head=el('thead');const headings=el('tr');for(const text of ['Kürzel','Antwort','Punkte','Status','Bewertung']){const th=el('th',text);th.scope='col';headings.append(th);}head.append(headings);table.append(head);
      const body=el('tbody');
      for(const {submission,meta} of group.rows){
        const row=el('tr');const name=submission.studentName||submission.studentCode||'Ohne Kürzel';row.append(el('th',name));row.firstChild.scope='row';
        const answer=submission.answers?.[group.id];let display=rawAnswer(answer);
        if(q&&answerDisplay)display=answerDisplay(q,answer,locale);
        if(q?.reviewMediaAssetId&&(!String(display||'').trim()||String(display).trim()==='(leer)')&&answer!==undefined&&answer!==null&&answer!=='')display=(Array.isArray(answer)?answer:[answer]).map(v=>`Antwortmöglichkeit ${Number(v)+1}`).join(', ');
        if(q&&['single','multi','dropdown'].includes(q.type)){
          const selected=q.type==='multi'?(Array.isArray(answer)?answer:[]):[answer];
          const images=selected.filter(v=>v!==''&&v!==null&&v!==undefined).map(v=>({index:Number(v),option:q.options?.[Number(v)]})).filter(({option})=>option&&(option.imageAlt||option.imageDataUrl||option.imageUrl||option.imagePath));
          if(images.length)display=[display,...images.map(({index,option})=>`Antwortmöglichkeit ${index+1} · Originalbild: ${option.imageAlt||'ohne gespeicherte Bildbeschreibung'}`)].filter(Boolean).join(' · ');
        }
        const answerCell=el('td',display,'chapterAnswerValue');answerCell.style.whiteSpace='pre-wrap';row.append(answerCell);
        const grade=submission.grading?.[group.id];const max=grade?.maxPoints??meta?.maxPoints??q?.points;
        row.append(el('td',`${grade?.awardedPoints??'–'}/${max??'–'}`));
        row.append(el('td',!grade?'Noch nicht bewertet':grade.needsReview?'Prüfung ausstehend':'Bewertet'));
        const action=el('td');const button=el('button',`${name} prüfen`,'button');button.type='button';button.disabled=typeof onReview!=='function';button.addEventListener('click',()=>onReview?.(submission.id));action.append(button);row.append(action);body.append(row);
      }
      table.append(body);wrap.append(table);details.append(wrap);chapters.get(group.chapterKey).append(details);
    }
    if(!groups.size)content.append(el('p','Noch keine Antworten vorhanden.'));
  }
  select.addEventListener('change',render);render();
  return {destroy(){select.removeEventListener('change',render);root.replaceChildren();root.classList.remove('chapterAnswerExplorer');}};
}
