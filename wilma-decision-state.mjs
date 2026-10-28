// Shared canonical state only; request sends its SHA-256, never raw answer copies.
export const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'&&Number.isFinite(v.seconds??v._seconds)&&Number.isFinite(v.nanoseconds??v._nanoseconds)?{seconds:v.seconds??v._seconds,nanoseconds:v.nanoseconds??v._nanoseconds}:v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
export const canonicalJson=v=>JSON.stringify(canonical(v));
const gradeKeys=['autoPoints','awardedPoints','maxPoints','needsReview','reviewState','reviewIssue','correct'];
export function canonicalDecisionState(s){return canonicalJson({answers:s.answers||{},grading:Object.fromEntries(Object.entries(s.grading||{}).map(([id,g])=>[id,Object.fromEntries(gradeKeys.filter(k=>g[k]!==undefined).map(k=>[k,g[k]]))])),status:s.status??null,totalPoints:s.totalPoints??null,maxPoints:s.maxPoints??null,percent:s.percent??null,grade:s.grade??null,gradeScaleSnapshot:s.gradeScaleSnapshot??null,revision:s.wilmaDecisionRevision||0,reviewedAt:s.reviewedAt??null,reviewedBy:s.reviewedBy??null});}

export function decisionQuestionSnapshot(question){const {id,...data}=question;return canonicalJson(data);}
