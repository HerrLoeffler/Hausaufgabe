export * from '../review-preview/firebase-fixture.mjs';
export const httpsCallable=(_functions,name)=>async data=>{
 const allowed=['getAssessmentInfo','startAssessmentAttempt','resumeAssessmentAttempt','submitAssessmentAttempt','getAssessmentReceipt'];if(!allowed.includes(name))throw Error('Lokaler Prototyp: kein KI-/Firebasezugriff.');
 const response=await fetch('/__extended/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Object.assign(Error(result.message),{code:result.code});return {data:result};
};
