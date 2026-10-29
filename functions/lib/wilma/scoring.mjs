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
