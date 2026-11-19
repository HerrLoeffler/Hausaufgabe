// Teacher-only review of existing result data. No provider calls or student writes.
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase('de-DE').replace(/\s+/g, ' ');
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const displayPoints = value => String(value).replace('.', ',');
// Review trigger only: never award or remove points by string similarity.
function oneSpellingChange(a,b){
 a=normalize(a);b=normalize(b);if(a===b||a.length>80||b.length>80||Math.abs(a.length-b.length)>1)return false;
 let i=0,j=0,edits=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++edits>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}return edits+(i<a.length||j<b.length?1:0)===1;
}
export function reviewItem(question, submission, parseGaps) {
  const grading = submission.grading?.[question.id] || {};
  const answer = submission.answers?.[question.id];
  const max = Math.max(0, number(question.points));
  const rawPoints=Object.hasOwn(grading,'awardedPoints')?grading.awardedPoints:grading.autoPoints;
  const validScore=rawPoints!==null&&rawPoints!==''&&Number.isFinite(Number(rawPoints))&&Number(rawPoints)>=0&&Number(rawPoints)<=max&&grading.maxPoints!==null&&grading.maxPoints!==''&&Number(grading.maxPoints)===max;
  const explicitlyOpen=['deferred','open','conflict','stale'].includes(grading.reviewState);
  const deferred=grading.reviewState==='deferred';
  const sourceIssue=['conflict','stale'].includes(grading.reviewState);
  const technical=grading.reviewIssue==='incomplete-transfer';
  const confirmed=validScore&&!technical&&!explicitlyOpen&&(grading.reviewState==='confirmed'||(submission.status==='graded'&&!Object.values(submission.grading||{}).some(g=>g.reviewState)&&!!submission.reviewedAt&&grading.needsReview===false));
  let parts = [];
  if (question.type === 'gapfill') {
    const gaps = parseGaps(question.text);
    parts = gaps.map((gap, i) => ({index:i, value:Array.isArray(answer) ? answer[i] : undefined, empty:!normalize(Array.isArray(answer)?answer[i]:undefined), known:Array.isArray(answer) && !!normalize(answer[i]) && gap.answers.map(normalize).includes(normalize(answer[i])), expected:gap.answers}));
  }
  const unknown = question.type === 'gapfill' && (!parts.length || parts.some(part => !part.known && !part.empty));
  const knownText=question.type==='text'&&!!normalize(answer)&&(question.acceptedAnswers||[]).map(normalize).includes(normalize(answer));
  const acceptedByRule=validScore&&!explicitlyOpen&&(question.type!=='text'||grading.needsReview===false)&&(grading.correct===true||knownText||parts.length>0&&parts.every(part=>part.known))&&Number(grading.autoPoints)===max&&Number(rawPoints)===max;
  const emptyText=question.type==='text'&&!normalize(answer);
  const emptyRule=emptyText&&validScore&&Number(rawPoints)===0;
  const semanticPending=!confirmed&&!acceptedByRule&&((question.type==='text'&&!emptyText)||unknown);
  const decided=confirmed||grading.needsReview===false||acceptedByRule||emptyRule;
  const requiresReview=technical||explicitlyOpen||!validScore||(!confirmed&&(!decided||semanticPending));
  const proposal = grading.reviewSuggestion;
  const validProposal = proposal && (Number.isFinite(proposal.points) || proposal.points===null && proposal.status==='ungradable') && (proposal.points===null || proposal.points >= 0 && proposal.points <= max && proposal.points * 2 % 1 === 0) && typeof proposal.reason === 'string';
  const spellingRisk=requiresReview&&validProposal&&proposal.source==="wilma-ai"&&proposal.points!==null&&proposal.points<max&&parts.some(part=>!part.empty&&!part.known&&part.expected.some(expected=>oneSpellingChange(part.value,expected)));
  const suggested = !technical && validProposal ? proposal.points : null;
  const awarded = Math.max(0, Math.min(max, number(grading.awardedPoints ?? grading.autoPoints)));
  return {question,submission,grading,answer,max,parts,technical,requiresReview,confirmed,deferred,sourceIssue,
    semanticPending,
    status:confirmed?'confirmed':deferred?'deferred':requiresReview?'open':'rule',awarded,
    suggested,spellingRisk,proposal:validProposal?proposal:null,needsAttention:requiresReview && (technical || sourceIssue || spellingRisk || validProposal && proposal.source==="wilma-ai" && proposal.status!=="clear"),
    // Empty gaps score zero by the existing grading rule; unknown nonempty variants remain open.
    knownPoints:parts.length ? Math.round(parts.filter(p=>p.known).length / parts.length * max * 10) / 10 : awarded};
}
export function applyAnswerDecision({question,submission,questions,parseGaps,decision,gradeFromPercent,scale}) {
  const item = reviewItem(question,submission,parseGaps);
  if (!['confirmed','deferred'].includes(decision.status)) throw new Error('Unbekannte Entscheidung.');
  if (decision.status === 'confirmed' && (item.technical || !Number.isFinite(decision.points) || decision.points < 0 || decision.points > item.max || decision.points * 2 % 1 !== 0)) throw new Error('Bitte gültige Punkte vergeben; technische Fälle vorher klären.');
  const grading = {...submission.grading};
  grading[question.id] = {...item.grading, maxPoints:item.max, needsReview:decision.status!=='confirmed',reviewState:decision.status};
  if (decision.status === 'confirmed') grading[question.id].awardedPoints=decision.points;
  const next={...submission,grading};
  // Review status derives from every answer, not only this edit. Other partial points survive.
  for (const q of questions) {
    const row=reviewItem(q,next,parseGaps);
    if (row.requiresReview) grading[q.id]={...grading[q.id],needsReview:true};
  }
  const pending=questions.some(q=>reviewItem(q,next,parseGaps).requiresReview);
  const total= Math.round(questions.reduce((sum,q)=>sum+reviewItem(q,next,parseGaps).awarded,0)*10)/10;
  const max=questions.reduce((sum,q)=>sum+number(q.points),0);
  const percent=max?Math.round(total/max*100):0;
  return {grading,totalPoints:total,maxPoints:max,percent,grade:pending?null:gradeFromPercent(percent,scale),status:pending?'review':'graded',gradeScaleSnapshot:scale};
}
export function installWilmaAnswerReview({document,getContext,parseGaps,answerDisplay,correctDisplay,saveDecision,openSubmission,notify,isDemo=()=>false,analyzeQuestion=null,beforeOpen=()=>true,getPreparation=()=>null,isPreparing=()=>false,isAutomaticPreview=()=>false,onOpen=()=>{},recoverQuestion=null,retryAnswer=null,resumeAnswer=null}) {
  const section=document.createElement('section');section.id='wilmaAnswerReview';section.className='wilmaReview card';
  document.getElementById('resultsTableWrap').before(section);
  let questionId='',filter='open',overviewOpen=false,expanded=false,undo=null,aiBusy=false,aiRequested=null,generation=0,responseCursor=null;const criteria=new Map();
  const busy=new Set(),errors=new Map(),order=new Map();
  function resetSession(){generation++;responseCursor=null;busy.clear();aiBusy=false;aiRequested=null;undo=null;questionId='';filter='open';overviewOpen=false;expanded=false;order.clear();errors.clear();criteria.clear();section.replaceChildren();section.hidden=true;}
  const itemFor=id=>{const ctx=getContext(),q=ctx.questions.find(q=>q.id===questionId);return q?ctx.submissions.map(s=>reviewItem(q,s,parseGaps)).find(r=>r.submission.id===id):null;};
  const rows=()=>{const list=getContext().submissions.map(s=>reviewItem(getContext().questions.find(q=>q.id===questionId),s,parseGaps));if(!order.has(questionId))order.set(questionId,list.slice().sort((a,b)=>Number(b.needsAttention)-Number(a.needsAttention)||Number(a.proposal?.source==='wilma-ai')-Number(b.proposal?.source==='wilma-ai')||Number(a.status==='rule')-Number(b.status==='rule')).map(r=>r.submission.id));return list.sort((a,b)=>order.get(questionId).indexOf(a.submission.id)-order.get(questionId).indexOf(b.submission.id));};
  const matches=row=>filter==='all'||row.requiresReview;
  const own=name=>section.querySelector('[data-wilma="'+name+'"]');
  function summary(){const ctx=getContext();return ctx.questions.flatMap(q=>ctx.submissions.map(s=>reviewItem(q,s,parseGaps)));}
  const preparationLabel=preparation=>({queued:'KI-Prüfung in Warteschlange',running:'KI-Prüfung läuft …',waiting:'Warte auf KI-Ergebnis',error:'KI-Prüfung fehlgeschlagen',blocked:'KI-Prüfung pausiert',proposal:'Vorschlag bereit'})[preparation?.phase]||'';
  const canRetry=(item,preparation)=>!!retryAnswer&&item?.requiresReview&&!item.proposal&&!item.confirmed&&!item.technical&&!item.sourceIssue&&preparation?.phase==='error'&&preparation.retryAllowed===true&&Number.isFinite(preparation.failedAt);
  const canResume=(item,preparation)=>!!resumeAnswer&&item?.requiresReview&&!item.proposal&&!item.confirmed&&!item.technical&&!item.sourceIssue&&preparation?.resumeAllowed===true&&!['running','waiting','queued'].includes(preparation.phase);
  function taskState(question,index){
    const ctx=getContext(),items=ctx.submissions.map(s=>reviewItem(question,s,parseGaps)),pending=items.filter(r=>r.requiresReview);
    const phases=pending.filter(r=>!r.proposal).map(r=>getPreparation(question.id,r.submission.id)?.phase);
    const state=!pending.length?'complete':items.some(r=>r.technical||r.sourceIssue)||phases.includes('error')?'error':phases.some(p=>['running','waiting','queued'].includes(p))?'running':phases.includes('blocked')?'blocked':'open';
    const detail={complete:'✓ Fertig',error:'Fehler klären',running:'KI läuft',blocked:'KI pausiert',open:''}[state];
    return {question,index,count:pending.length,state,label:question.reviewLabel||'Aufgabe '+(index+1),text:pending.length?pending.length+' offen'+(detail?' · '+detail:''):detail};
  }
  function navigationHtml(){
    const tasks=getContext().questions.map(taskState),active=tasks.find(t=>t.question.id===questionId);
    return `<details class="wilmaTaskOverview" data-wilma="task-overview" ${overviewOpen?'open':''}><summary data-wilma="task-toggle" aria-label="${escape(active.label+' · '+active.text+'. Aufgabe wählen')}"><span class="wilmaActiveTask" data-wilma="active-task" aria-live="polite"><strong>${escape(active.label)}</strong><span data-state="${active.state}">${escape(active.count?active.count+' offen':'✓ Fertig')}</span></span></summary><div class="wilmaTaskPicker" popover="manual"><p>Aufgabe wählen · ${tasks.filter(t=>t.count).length} offen / ${tasks.length}<span class="wilmaTaskScrollHint" data-wilma="task-scroll-hint" hidden>Weitere Aufgaben ↕</span></p><div class="wilmaTaskTabs" role="group" aria-label="Aufgabe wählen">${tasks.map(t=>`<button type="button" class="button ghost" data-wilma="question" data-question="${escape(t.question.id)}" data-state="${t.state}" aria-pressed="${t.question.id===questionId}" ${t.question.id===questionId?'aria-current="step"':''} aria-label="${escape(t.label+' · '+t.text)}"><span class="wilmaTaskNumber">${t.index+1}</span><small>${t.count?t.count+' offen':'✓'}</small></button>`).join('')}</div></div></details><button type="button" class="button ghost wilmaNextOpen" data-wilma="next" aria-label="Nächste offene Antwort" title="Nächste offene Antwort">→<span>Nächste offene</span></button>`;
  }
  function refreshSummary(){
    const items=summary(),pending=items.filter(r=>r.requiresReview).length,rule=items.filter(r=>r.status==='rule').length;
    const preparing=items.filter(r=>r.requiresReview&&!r.proposal&&['running','waiting','queued'].includes(getPreparation(r.question.id,r.submission.id)?.phase)).length;
    const failed=items.filter(r=>r.requiresReview&&!r.proposal&&getPreparation(r.question.id,r.submission.id)?.phase==='error').length;
    const unchecked=items.filter(r=>r.requiresReview&&r.semanticPending&&!r.proposal).length,target=own('summary');
    if(target)target.textContent=`${preparing?preparing+' KI-Prüfungen laufen · ':''}${failed?failed+' KI-Fehler · ':''}${!preparing&&unchecked?unchecked+' KI-ungeprüft · ':''}${items.some(r=>r.proposal?.source==='wilma-ai')?items.filter(r=>r.needsAttention).length+' auffällig · ':''}${pending?pending+' Antworten offen':'Keine prüfbedürftigen Antworten'} · ${rule} regelbewertet`;
    if(aiBusy&&aiRequested){const row=section.querySelector('tr[data-submission="'+CSS.escape(aiRequested)+'"] .wilmaRowStatus');if(row){const phase=getPreparation(questionId,aiRequested)?.phase;row.textContent=['queued','running','waiting'].includes(phase)?preparationLabel({phase}):'KI-Vorschlag wird geladen …';}}
    const nav=own('navigation');if(nav){const focused=document.activeElement?.closest?.('[data-wilma="navigation"]')?{action:document.activeElement.dataset.wilma,question:document.activeElement.dataset.question}:null;const scroll=nav.querySelector('.wilmaTaskTabs')?.scrollTop||0;nav.innerHTML=navigationHtml();nav.querySelector('.wilmaTaskTabs').scrollTop=scroll;positionPicker();if(focused){const target=focused.question?nav.querySelector('[data-question="'+CSS.escape(focused.question)+'"]'):nav.querySelector('[data-wilma="'+focused.action+'"]');target?.focus({preventScroll:true});}}
    const list=questionId?rows():[],open=own('answers-open'),all=own('answers-all');if(open){open.textContent='Offene';open.setAttribute('aria-label','Offene Antworten ('+list.filter(r=>r.requiresReview).length+')');open.setAttribute('aria-pressed',String(filter==='open'));}if(all){all.textContent='Alle';all.setAttribute('aria-label','Alle Antworten ('+list.length+')');all.setAttribute('aria-pressed',String(filter==='all'));}

  }
  function problemText(item,preparation){
    if(!item.requiresReview||aiBusy&&aiRequested===item.submission.id)return '';
    if(item.technical)return 'Übertragung klären; Punkte danach vergeben.';
    if(item.sourceIssue)return 'Fassung geändert; Status aktualisieren.';
    if(item.proposal)return '';
    if(preparation?.reasonCode==='session_limit')return 'Testkontingent dieser Sitzung erreicht. Gespeicherte Vorschläge kannst du weiter aktualisieren.';
    if(canResume(item,preparation)&&!canRetry(item,preparation))return 'Für diese Antwort fehlt noch der KI-Vorschlag.';
    if(preparation?.phase==='error')return canRetry(item,preparation)?'KI-Prüfung fehlgeschlagen; manuell bewerten oder erneut prüfen.':'KI-Prüfung fehlgeschlagen; bitte manuell bewerten.';
    if(preparation?.phase==='blocked')return canResume(item,preparation)?'Noch kein KI-Vorschlag; Prüfung kann fortgesetzt werden.':'KI-Prüfung pausiert; bitte manuell bewerten.';
    if(['queued','running','waiting'].includes(preparation?.phase))return '';
    return 'Bitte manuell bewerten.';
  }
  function rowHtml(item){const id=escape(item.submission.id),preparation=getPreparation(item.question.id,item.submission.id),pending=busy.has(item.submission.id)||isPreparing()||aiBusy,value=item.confirmed||item.status==='rule'?item.awarded:item.suggested;const status=item.technical?'Technisch klären':item.confirmed?'Bestätigt':item.status==='rule'?'Regelbewertet':item.deferred?'Zurückgestellt':item.sourceIssue?'Fassung prüfen':item.proposal?(item.proposal.origin==='teacher-fundus'?'Aus deinem Fundus':item.proposal.source==='wilma-ai'?'KI-Vorschlag':'Prüfhinweis'):aiBusy&&aiRequested===item.submission.id?'KI-Vorschlag wird geladen …':['queued','running','waiting'].includes(preparation?.phase)?preparationLabel(preparation):'Offen';
    return `<tr tabindex="-1" data-submission="${id}" class="wilmaAnswerRow ${item.status}"><th scope="row"><button class="linkButton wilmaName" type="button" data-wilma="whole">${escape(item.submission.studentName)}</button><span class="wilmaRowStatus">${escape(status)}</span></th><td class="wilmaAnswerCell">${item.parts.length?`<ol class="wilmaGapComparisons" aria-label="Antwort und Lösung je Lücke">${item.parts.map(p=>`<li class="wilmaGapComparison ${p.known&&!item.technical?'known':'open'}"><span class="wilmaGapNumber" aria-label="Lücke ${p.index+1}">${p.index+1}</span><div><span class="wilmaComparisonLabel">Antwort</span><strong>${escape(p.empty?(item.technical?'Nicht vollständig übertragen':'Leer'):p.value)}</strong></div><div><span class="wilmaComparisonLabel">Erwartet</span><span>${escape(p.expected.join(' oder '))}</span></div><small>${item.technical?'Übertragung klären':p.known?'✓ Stimmt überein':p.empty?'Leer · 0 P.':'Abgleich offen'}</small></li>`).join('')}</ol>`:`<p class="wilmaRowResponse">${escape(answerDisplay(item.question,item.answer,getContext().quiz.contentLocale))}</p>`}${item.spellingRisk?'<span class="wilmaCritical">Schreibweise prüfen</span>':''}${item.proposal&&!item.technical&&!item.sourceIssue?`<div class="wilmaRowReason"><strong>${item.proposal.source==='prepared-demo'?'Beispielvorschlag':item.proposal.origin==='teacher-fundus'?'Aus deinem Fundus':item.proposal.requestId?'KI-Vorschlag':'Prüfhinweis'} · ${item.suggested===null?'Kontext fehlt':displayPoints(item.suggested)+' / '+displayPoints(item.max)+' P.'}</strong><p>${escape(item.proposal.reason)}</p>${item.proposal.persistence==='volatile'?'<p class="wilmaCritical">Vorschlag nur in diesem Tab verfügbar</p>':''}</div>`:''}${problemText(item,preparation)?`<p class="wilmaProblem" data-phase="${escape(preparation?.phase||'open')}">${escape(problemText(item,preparation))}</p>`:''}${canResume(item,preparation)&&!canRetry(item,preparation)?`<div class="wilmaFirstReview"><button type="button" class="button primary" data-wilma="resume" aria-label="KI-Vorschlag erstellen für ${escape(item.submission.studentName)}" ${aiBusy||busy.size?'disabled':''}>KI-Vorschlag erstellen</button><small>Erste KI-Prüfung · nutzt dein Kontingent</small></div>`:''}</td><td class="wilmaRowDecision"><div class="wilmaRowStepper"><button type="button" class="button ghost" data-wilma="minus" aria-label="Halben Punkt abziehen: ${escape(item.submission.studentName)}" ${pending||item.technical?'disabled':''}>−</button><input data-wilma="points" aria-label="Punkte: ${escape(item.submission.studentName)}" type="number" inputmode="decimal" min="0" max="${item.max}" step="0.5" value="${value??''}" placeholder="–" ${pending||item.technical?'disabled':''}><span>/ ${item.max}</span><button type="button" class="button ghost" data-wilma="plus" aria-label="Halben Punkt hinzufügen: ${escape(item.submission.studentName)}" ${pending||item.technical?'disabled':''}>+</button></div><div class="wilmaRowActions">${item.requiresReview?`<button class="button primary" type="button" data-wilma="confirm" ${pending||item.technical||value===null?'disabled':''}>${pending?'…':'Bestätigen'}</button><button class="button ghost" type="button" data-wilma="defer" ${pending?'disabled':''}>Später</button>`:`<span class="wilmaSaved">${pending?'…':item.confirmed?'✓ Gespeichert':'✓ Regelbewertet'}</span>`}</div>${canRetry(item,preparation)?`<div class="wilmaRetry"><button type="button" class="button ghost" data-wilma="retry" ${aiBusy||busy.size||isPreparing()?'disabled':''}>KI erneut prüfen</button><small>Neue KI-Anfrage · nutzt dein Kontingent</small></div>`:''}<p class="wilmaRowError" role="alert">${escape(errors.get(item.submission.id)||'')}</p></td></tr>`;
  }
  function render(){const oldQuestion=section.dataset.activeQuestion;const drafts=[...section.querySelectorAll('tr[data-submission] [data-wilma="points"]')].filter(input=>!busy.has(input.closest('tr').dataset.submission)&&input.value!==input.getAttribute('value')).map(input=>({id:input.closest('tr').dataset.submission,value:input.value}));const questionDisclosure=section.querySelector('.wilmaQuestionDetails')?.open;const disclosure=own('task-overview');if(disclosure)overviewOpen=disclosure.open;const active=document.activeElement,focus=section.contains(active)?{action:active.dataset.wilma,question:active.dataset.question,submission:active.closest?.('tr[data-submission]')?.dataset.submission}:null;const ctx=getContext();if(!ctx.quiz||!ctx.questions.length||!ctx.submissions.length){section.replaceChildren();section.hidden=true;return;}section.hidden=false;section.dataset.expanded=String(expanded);if(!ctx.questions.some(q=>q.id===questionId))questionId=ctx.questions.find(q=>ctx.submissions.some(s=>reviewItem(q,s,parseGaps).requiresReview))?.id||ctx.questions[0].id;section.dataset.activeQuestion=questionId;const question=ctx.questions.find(q=>q.id===questionId),all=rows(),shown=all.filter(matches);
    section.innerHTML=`<header class="wilmaReviewHead">${expanded?`<div><h2>Wilma</h2></div>${recoverQuestion?`<button type="button" class="button ghost" data-wilma="recover" aria-label="Status aktualisieren" title="Status aktualisieren" ${aiBusy||busy.size?'disabled':''}>↻<span>Status aktualisieren</span></button>`:''}<button class="button ghost" type="button" data-wilma="expand" aria-label="Zur Übersicht" title="Zur Übersicht">×<span>Zur Übersicht</span></button>`:`<img src="assets/gradecrew/wilma-grading.png" alt="" width="32" height="36"><div><h2>Wilma</h2><p data-wilma="summary"></p></div><button class="button primary" type="button" data-wilma="expand">Wilma öffnen${summary().some(r=>r.requiresReview)?' ('+summary().filter(r=>r.requiresReview).length+')':''}</button>`}</header>${expanded?`<div class="wilmaListWorkspace"><div class="wilmaTaskContext"><nav class="wilmaTaskNavigation" data-wilma="navigation" aria-label="Aufgabenübersicht"></nav><details class="wilmaQuestionDetails"><summary data-wilma="question-context">Aufgabe und Lösung</summary><div class="wilmaOneQuestion"><strong>${escape(String(question.text).replace(/\[([^\]]*)\]/g,'___'))}</strong><p class="wilmaReference"><span>Lösung / Kriterien:</span> ${escape((Array.isArray(question.reviewCriteria)?question.reviewCriteria.join(' · '):question.reviewCriteria)||correctDisplay(question,ctx.quiz.contentLocale)||'Kein Bewertungsraster hinterlegt.')}</p>${analyzeQuestion&&!isAutomaticPreview()?`<button type="button" class="button secondary" data-wilma="ai" ${aiBusy?'disabled':''}>${aiBusy?'KI prüft …':'KI-Vorschläge für diese Aufgabe erstellen'}</button><details><summary>Bewertungsraster bearbeiten</summary><label class="wilmaCriteriaLabel">Bewertungsraster<textarea data-wilma="criteria" maxlength="2000" rows="2" ${aiBusy||isPreparing()?'disabled':''} placeholder="Optional: Wofür gibt es wie viele Punkte?">${escape(criteria.get(questionId)||'')}</textarea></label></details>`:''}</div></details><div class="wilmaListTools"><div class="wilmaAnswerFilters" role="group" aria-label="Antworten zeigen"><button type="button" class="button ghost" data-wilma="answers-open" aria-pressed="${filter==='open'}">Offene (${all.filter(r=>r.requiresReview).length})</button><button type="button" class="button ghost" data-wilma="answers-all" aria-pressed="${filter==='all'}">Alle (${all.length})</button></div><button type="button" class="button ghost wilmaUndo" data-wilma="undo" aria-label="Rückgängig" title="Rückgängig" ${!undo||busy.size?'disabled':''}>↶</button></div></div><table class="wilmaAnswerTable"><caption class="visuallyHidden">${escape(question.reviewLabel||'Aufgabe')}: ${shown.length} Schülerantworten, direkt bewerten</caption><thead><tr><th scope="col">Schüler</th><th scope="col">Antwort</th><th scope="col">Punkte</th></tr></thead><tbody>${shown.map(rowHtml).join('')}</tbody></table>${!shown.length?'<p class="wilmaListEmpty">Keine Antworten in dieser Auswahl. Wähle eine andere Aufgabe oder „Alle Antworten“.</p>':''}<p class="hint wilmaListFoot">${isDemo()?'Änderungen bleiben nur in diesem Browser.':'Jede Änderung gilt nur für diese Antwort. Andere offene Aufgaben bleiben offen.'} Regelbewertet bedeutet nicht von dir manuell geprüft.</p></div>`:''}`;refreshSummary();if(oldQuestion===questionId&&questionDisclosure)section.querySelector('.wilmaQuestionDetails').open=true;if(oldQuestion===questionId)for(const draft of drafts){const input=section.querySelector('tr[data-submission="'+CSS.escape(draft.id)+'"] [data-wilma="points"]');if(input)input.value=draft.value;}if(focus?.action){const root=focus.submission?section.querySelector('tr[data-submission="'+CSS.escape(focus.submission)+'"]'):section;const selector='[data-wilma="'+focus.action+'"]'+(focus.question?'[data-question="'+CSS.escape(focus.question)+'"]':'');const control=root?.querySelector(selector);if(control&&!control.disabled)control.focus({preventScroll:true});}
  }
  function updateRow(id){const row=section.querySelector('tr[data-submission="'+CSS.escape(id)+'"]');const item=itemFor(id);if(!row&&item&&matches(item)){render();return;}if(row&&item){const active=document.activeElement;const focused=active?.closest?.('tr')===row?active.dataset.wilma:null;const template=document.createElement('template');template.innerHTML='<table><tbody>'+rowHtml(item)+'</tbody></table>';const replacement=template.content.querySelector('tr');row.replaceWith(replacement);if(focused)replacement.querySelector('[data-wilma="'+focused+'"]')?.focus({preventScroll:true});}refreshSummary();const undoButton=own('undo');if(undoButton)undoButton.disabled=!undo||!!busy.size;}
  async function commit(id,decision){
    const item=itemFor(id);if(!item||busy.has(id))return;
    if(decision.status==='confirmed'&&(item.technical||!Number.isFinite(decision.points)||decision.points<0||decision.points>item.max||decision.points*2%1!==0)){errors.set(id,'Bitte gültige Punkte in 0,5-Schritten vergeben.');updateRow(id);return;}
    responseCursor={questionId,submissionId:id};const epoch=generation;busy.add(id);errors.delete(id);const prior=JSON.parse(JSON.stringify(item.submission));updateRow(id);
    try{
      await saveDecision({questionId,submissionId:id,decision,expected:item.submission});
      if(epoch!==generation)return;
      undo={prior,questionId,submissionId:id,expected:JSON.parse(JSON.stringify(getContext().submissions.find(s=>s.id===id)))};
      notify(decision.status==='confirmed'?'Punkte für '+item.submission.studentName+' gespeichert.':'Zurückgestellt; bleibt offen.');
    }catch(error){if(epoch===generation){errors.set(id,error.message||'Speichern nicht möglich.');notify('Diese Antwort wurde nicht gespeichert.','error');}}
    finally{if(epoch===generation){busy.delete(id);updateRow(id);}}
  }
  function closePicker({focus=false}={}){
    overviewOpen=false;const disclosure=own('task-overview'),popup=section.querySelector('.wilmaTaskPicker');
    if(popup?.matches?.(':popover-open'))popup.hidePopover();
    if(disclosure)disclosure.open=false;
    if(focus)own('task-toggle')?.focus({preventScroll:true});
  }
  function positionPicker({reveal=true,focus=false}={}){
    const disclosure=own('task-overview'),popup=section.querySelector('.wilmaTaskPicker');
    if(!disclosure?.open||!popup)return;
    // The top layer escapes sticky/scroll/container clipping without moving the controls.
    if(popup.showPopover&&!popup.matches(':popover-open'))popup.showPopover();
    const view=document.defaultView,viewport=view.visualViewport;
    // Older WebKit reports zoomed layout rectangles in pre-zoom coordinates.
    // Normalize to the same viewport pixels used by visualViewport and hit testing.
    const rectScale=document.documentElement.clientWidth/document.documentElement.getBoundingClientRect().width||1;
    const rect=element=>{const r=element.getBoundingClientRect();return {left:(r.left+view.scrollX)*rectScale-view.scrollX,top:(r.top+view.scrollY)*rectScale-view.scrollY,right:(r.right+view.scrollX)*rectScale-view.scrollX,bottom:(r.bottom+view.scrollY)*rectScale-view.scrollY,width:r.width*rectScale,height:r.height*rectScale};};
    const anchor=rect(own('task-toggle')),scale=rect(popup).width/popup.offsetWidth||1;
    const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||view.innerWidth,height=viewport?.height||view.innerHeight,margin=8;
    const panel=rect(section),minLeft=Math.max(left+margin,panel.left),maxRight=Math.min(left+width-margin,panel.right);
    const popupWidth=Math.min(380*scale,maxRight-minLeft);
    popup.style.width=popupWidth/scale+'px';
    popup.style.left=Math.max(minLeft,Math.min(anchor.left,maxRight-popupWidth))/scale+'px';
    const below=top+height-margin-anchor.bottom-4,above=anchor.top-top-margin-4;
    const room=Math.max(0,Math.max(below,above)),grid=popup.querySelector('.wilmaTaskTabs');
    const scrollHint=popup.querySelector('[data-wilma="task-scroll-hint"]');
    scrollHint.hidden=true;
    const fitGrid=()=>{const chrome=rect(popup).height-rect(grid).height;grid.style.maxHeight=Math.max(0,Math.min(150*scale,room-chrome))/scale+'px';};
    fitGrid();
    if(grid.scrollHeight>grid.clientHeight+1){scrollHint.hidden=false;fitGrid();}
    const popupHeight=rect(popup).height;
    popup.style.top=Math.max(top+margin,Math.min(below>=popupHeight||below>=above?anchor.bottom+4:anchor.top-4-popupHeight,top+height-margin-popupHeight))/scale+'px';
    const active=!focus&&grid.contains(document.activeElement)?document.activeElement:grid.querySelector('[aria-current="step"]');
    if(reveal&&active){const r=rect(active),g=rect(grid);if(r.top<g.top)grid.scrollTop-=Math.ceil((g.top-r.top)/scale);else if(r.bottom>g.bottom)grid.scrollTop+=Math.ceil((r.bottom-g.bottom)/scale);}
    if(focus)active?.focus({preventScroll:true});
  }
  section.addEventListener('toggle',event=>{if(event.target.dataset.wilma==='task-overview'&&event.target===own('task-overview')){overviewOpen=event.target.open;if(overviewOpen)positionPicker({reveal:true});else closePicker();}},true);
  section.addEventListener('keydown',event=>{
    if(event.target.dataset.wilma==='task-toggle'&&['ArrowDown','Enter',' '].includes(event.key)){event.preventDefault();const disclosure=own('task-overview');if(disclosure.open&&event.key!=='ArrowDown')closePicker({focus:true});else{overviewOpen=true;disclosure.open=true;positionPicker({reveal:true,focus:true});}return;}
    const popup=event.target.closest?.('.wilmaTaskPicker');if(!popup)return;
    const buttons=[...popup.querySelectorAll('[data-question]')],index=buttons.indexOf(event.target);let next;
    if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else if(event.key==='ArrowRight')next=Math.min(buttons.length-1,index+1);else if(event.key==='ArrowLeft')next=Math.max(0,index-1);
    if(next!==undefined){event.preventDefault();buttons[next]?.focus({preventScroll:true});const grid=popup.querySelector('.wilmaTaskTabs'),r=buttons[next].getBoundingClientRect(),g=grid.getBoundingClientRect(),scale=grid.getBoundingClientRect().width/grid.offsetWidth||1;if(r.top<g.top)grid.scrollTop-=Math.ceil((g.top-r.top)/scale);else if(r.bottom>g.bottom)grid.scrollTop+=Math.ceil((r.bottom-g.bottom)/scale);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&own('task-overview')?.open){event.preventDefault();closePicker({focus:true});}});
  document.addEventListener('pointerdown',event=>{if(own('task-overview')?.open&&!event.target.closest?.('.wilmaTaskOverview'))closePicker();});
  const reposition=()=>positionPicker();
  document.defaultView?.addEventListener('resize',reposition);
  document.addEventListener('scroll',event=>{if(!event.target.closest?.('.wilmaTaskPicker'))positionPicker();},true);
  document.defaultView?.visualViewport?.addEventListener('resize',reposition);
  document.defaultView?.visualViewport?.addEventListener('scroll',reposition);
  section.addEventListener('input',event=>{if(event.target.dataset.wilma==='criteria')criteria.set(questionId,event.target.value);});
  section.addEventListener('focusin',event=>{const row=event.target.closest?.('tr[data-submission]');if(row)responseCursor={questionId,submissionId:row.dataset.submission};});
  section.addEventListener('change',event=>{const target=event.target,action=target.dataset.wilma;if(action==='criteria'){criteria.set(questionId,target.value);return;}if(action==='points'){const row=target.closest('[data-submission]');if(!row)return;const value=target.value===''?NaN:Number(target.value.replace(',','.'));void commit(row.dataset.submission,{status:'confirmed',points:value});}});
  section.addEventListener('click',async event=>{const toggle=event.target.closest('[data-wilma="task-toggle"]');if(toggle){event.preventDefault();const disclosure=own('task-overview');if(disclosure.open)closePicker();else{overviewOpen=true;disclosure.open=true;positionPicker({reveal:true});}return;}const button=event.target.closest('button[data-wilma]');if(!button||button.disabled)return;const action=button.dataset.wilma,id=button.closest('[data-submission]')?.dataset.submission;
    if(action==='expand'){if(busy.size||aiBusy||!expanded&&!beforeOpen())return;expanded=!expanded;if(expanded&&!summary().some(r=>r.requiresReview))filter='all';render();if(expanded){onOpen();section.scrollIntoView({block:'start',behavior:'instant'});}return;}
    if(action==='next'){
      if(busy.size||aiBusy)return;
      const all=summary(),pending=all.filter(r=>r.requiresReview),active=pending.some(r=>!r.deferred)?pending.filter(r=>!r.deferred):pending;
      const current=responseCursor?all.findIndex(r=>r.question.id===responseCursor.questionId&&r.submission.id===responseCursor.submissionId):all.findIndex(r=>r.question.id===questionId)-1;
      const next=Array.from({length:all.length},(_,i)=>all[(Math.max(-1,current)+i+1)%all.length]).find(r=>active.includes(r));
      if(next){questionId=next.question.id;responseCursor={questionId,submissionId:next.submission.id};filter='open';render();const row=section.querySelector('tr[data-submission="'+CSS.escape(next.submission.id)+'"]');row?.scrollIntoView({block:'nearest',behavior:'instant'});(row?.querySelector('[data-wilma="points"]:not(:disabled)')||row)?.focus({preventScroll:true});}
      else notify('Keine prüfbedürftigen Antworten.');return;
    }
    if(action==='answers-open'||action==='answers-all'){if(busy.size||aiBusy)return;filter=action==='answers-all'?'all':'open';render();return;}
    if(action==='question'){if(busy.size||aiBusy)return;questionId=button.dataset.question;overviewOpen=false;const picker=own('task-overview');if(picker)picker.open=false;if(!rows().some(matches))filter=rows().some(r=>r.requiresReview)?'open':'all';render();own('task-toggle')?.focus({preventScroll:true});section.querySelector('.wilmaTaskContext')?.scrollIntoView({block:'start',behavior:'instant'});return;}
    if((action==='recover'&&recoverQuestion||action==='retry'&&retryAnswer||action==='resume'&&resumeAnswer)&&!aiBusy&&!busy.size){
      const item=id?itemFor(id):null,preparation=item?getPreparation(questionId,id):null;
      if(action==='retry'&&(!canRetry(item,preparation)||isPreparing()))return;
      if(action==='resume'&&(!canResume(item,preparation)||canRetry(item,preparation))){notify('Prüfstatus geändert. Bitte Status aktualisieren.');return;}
      const epoch=generation,payload={questionId,...(action==='retry'?{submissionId:id,expectedFailureAt:preparation.failedAt}:action==='resume'?{submissionId:id}:{})};aiRequested=id||null;aiBusy=true;render();
      try{await (action==='recover'?recoverQuestion:action==='retry'?retryAnswer:resumeAnswer)(payload);}catch(error){if(epoch===generation)notify(error.message||'Status konnte nicht aktualisiert werden.','error');}
      finally{if(epoch===generation){aiBusy=false;aiRequested=null;render();}}return;
    }
    if(action==='ai'&&analyzeQuestion&&!aiBusy&&!busy.size){const epoch=generation;aiBusy=true;expanded=true;render();try{await analyzeQuestion(questionId,criteria.get(questionId)||'');if(epoch!==generation)return;order.delete(questionId);filter='open';}catch(error){if(epoch===generation)notify(error.message||'Wilma konnte nicht prüfen.','error');}finally{if(epoch===generation){aiBusy=false;render();section.scrollIntoView({block:'start',behavior:'instant'});}}return;}
    if(action==='whole'){if(busy.size||aiBusy)return;openSubmission(id);return;}
    if(['confirm','plus','minus','defer'].includes(action)){const row=button.closest('[data-submission]'),item=itemFor(id);if(action==='defer'){await commit(id,{status:'deferred'});return;}const input=row.querySelector('[data-wilma="points"]');let points=input.value===''?NaN:Number(input.value.replace(',','.'));if(action!=='confirm')points=Math.max(0,Math.min(item.max,(Number.isFinite(points)?points:0)+(action==='plus'?.5:-.5)));await commit(id,{status:'confirmed',points});return;}
    if(action==='undo'&&undo&&!busy.size){const last=undo,epoch=generation;busy.add(last.submissionId);updateRow(last.submissionId);try{await saveDecision({submissionId:last.submissionId,restore:last.prior,expected:last.expected});if(epoch!==generation)return;undo=null;errors.delete(last.submissionId);notify('Letzte Entscheidung rückgängig gemacht.');}catch(error){if(epoch===generation)notify(error.message,'error');}finally{if(epoch===generation){busy.delete(last.submissionId);if(last.questionId!==questionId){questionId=last.questionId;filter='all';render();}else updateRow(last.submissionId);}}}

  });
  return {isExpanded:()=>expanded,isBusy:()=>aiBusy||!!busy.size||isPreparing(),collapse(){expanded=false;render();},clear:resetSession,openForQuestion(id){if(busy.size||aiBusy||!beforeOpen())return;questionId=id;expanded=true;filter=rows().some(r=>r.requiresReview)?'open':'all';render();onOpen();section.scrollIntoView({block:'start',behavior:'instant'});},refresh({resort=false}={}){if(resort)order.clear();const quizId=getContext().quiz?.id;if(section.dataset.quiz!==(quizId||'')){resetSession();section.dataset.quiz=quizId||'';}if(busy.size||aiBusy)refreshSummary();else render();},element:section};
}
