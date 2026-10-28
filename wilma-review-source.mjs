// Only fields that affect the review; server and rendered task must agree.
const fields=['type','text','points','manualReview','reviewCriteria','acceptedAnswers','imageDataUrl','imageUrl','audioOnly','audioDataUrl','audioUrl','audioPresentation','audioAnswerMode','audioScript','audioStoragePath','media','listeningText'];
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])):value;
export function questionSnapshot(question){return JSON.stringify(sorted(Object.fromEntries(fields.filter(key=>question[key]!==undefined).map(key=>[key,question[key]]))));}
export function requiresOriginalMedia(question){return !!(question.imageDataUrl||question.imageUrl||question.audioOnly||question.audioDataUrl||question.audioUrl||question.audioScript||question.audioStoragePath||question.audioPresentation||question.audioAnswerMode||question.media);}
