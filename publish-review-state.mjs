/** Metadata revision, retaining Firestore nanoseconds and publication lifecycle. */
export function publicationVersion(quiz) {
 const t=quiz?.updatedAt;
 return JSON.stringify([t?.seconds??t?._seconds??t?.toMillis?.()??t??null,t?.nanoseconds??t?._nanoseconds??0,quiz?.published===true,quiz?.ended===true,quiz?.rightsHold===true,quiz?.practiceSolutionRevision??null,quiz?.publicationReviewNonce??null]);
}

/** A publication save cannot partially overwrite an exam another tab just started. */
export async function saveReviewedDraft({run, ref, expectedVersion, patch, questions, removedRefs, unchanged}) {
 await run(async transaction=>{
  const snapshot=await transaction.get(ref), current=snapshot.exists()?snapshot.data():null;
  if(!current||!unchanged()||current.rightsHold||current.published&&!current.ended||expectedVersion!=null&&publicationVersion(current)!==expectedVersion)throw new Error('Der Test wurde inzwischen geändert oder veröffentlicht. Lade den aktuellen Stand neu.');
  transaction.update(ref,patch);
  for(const question of questions)transaction.set(question.ref,question.data);
  for(const oldRef of removedRefs)transaction.delete(oldRef);
 });
}

const reviewedFields = ['title','subject','grade','description','contentLocale','gradingLocale','localeContractVersion','gradeScaleId','gradeScaleSnapshot','resultMode','showSolutions','solutionReleaseMode','startMode','timeLimitMinutes','shuffleQuestions','shuffleAnswers','questionCount','totalPoints','audioReady','solutionAudioReady'];
function canonical(value) {
 if (Array.isArray(value)) return value.map(canonical);
 if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 return value;
}
export function reviewedMetadataEqual(expected, actual) {
 const pick=quiz=>Object.fromEntries(reviewedFields.map(key=>[key,quiz?.[key]]));
 return JSON.stringify(canonical(pick(expected)))===JSON.stringify(canonical(pick(actual)));
}

/** Resolve our completed ordinary save, without adopting another tab's draft. */
export async function resolveSavedPublicationVersion({expected, expectedQuestions, read, readQuestions, unchanged}) {
 const [snapshot, questions]=await Promise.all([read(),readQuestions()]), actual=snapshot.exists()?snapshot.data():null;
 const latest=await read();
 if(!actual||!unchanged()||!reviewedMetadataEqual(expected,actual)
  ||!latest.exists()||publicationVersion(latest.data())!==publicationVersion(actual)
  ||!reviewedQuestionsEqual(expectedQuestions,questions)
  ||['published','ended','rightsHold'].some(key=>Boolean(expected[key])!==Boolean(actual[key])))throw new Error('Der Test wurde inzwischen geändert. Lade ihn neu und prüfe deine lokalen Einstellungen.');
 return actual.updatedAt;
}
export function reviewedQuestionsEqual(expected, actual) {
 const normalize=items=>items.map(({id,data})=>({id,data:Object.fromEntries(Object.entries(data).filter(([key])=>key!=='updatedAt'))})).sort((a,b)=>a.id.localeCompare(b.id));
 return JSON.stringify(canonical(normalize(expected)))===JSON.stringify(canonical(normalize(actual)));
}
