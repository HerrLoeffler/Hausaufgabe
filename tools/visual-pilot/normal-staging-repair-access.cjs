'use strict';
// Reuse the existing synthetic staging account; never read or change real teacher drafts.
const {login,read,UID}=require('./access.cjs');
async function call(name,data){
 if(!['startAiTestJob','regenerateQuestion','startAssessmentAttempt','resumeAssessmentAttempt','submitAssessmentAttempt','getAssessmentReceipt'].includes(name))throw Error('Outside repair probe scope');
 if(name.includes('Assessment')){const own=JSON.parse(require('node:fs').readFileSync(require('node:path').resolve(__dirname,'../../docs/evidence/interactive-staging-repair-20261026/generation-20.json')));if(data.quizId!==own.quizId)throw Error('Assessment probe quiz scope mismatch');}
 const r=await fetch('https://europe-west1-gradecrew-staging-2026.cloudfunctions.net/'+name,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await login()},body:JSON.stringify({data}),signal:AbortSignal.timeout(550000)});
 const d=await r.json();if(!r.ok||d.error)throw Error(name+' HTTP '+r.status+' '+JSON.stringify(d.error));return d.result??d.data;
}
module.exports={call,read,UID};
