const endpoint='https://europe-west1-hausaufgabe-staging.cloudfunctions.net/reviewMode';
const fields=['id','testCode','questionId','questionPosition','questionType','verdict','reason','reasonCategory','teacherComment','action','status','appVersion','sourceRelease','sourceProject','environment','feedbackSchemaVersion','processingEvidence','reviewOutcome','createdAt'];
export async function readQuestionFeedback({token,cursor,fetchImpl=fetch,maxPages=20}={}){
 if(typeof token!=='string'||!token.trim())throw Error('Live-Anmeldung fehlt. Bitte gradecrew_live_feedback_connect verwenden.');
 if(!Number.isInteger(maxPages)||maxPages<1||maxPages>100)throw Error('Ungültige Seitengrenze.');
 const valid=v=>typeof v==='string'&&/^[\w-]{1,128}$/.test(v);
 if(cursor!==undefined&&!valid(cursor))throw Error('Ungültiger Cursor.');
 const visited=new Set(),seen=new Set(),reports=[];let next=cursor,pages=0;
 do{
  if(next){if(visited.has(next))throw Error('Wiederholter Cursor; Abruf abgebrochen.');visited.add(next);}
  const r=await fetchImpl(endpoint,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token.trim()}`},body:JSON.stringify({data:{action:'listQuestionFeedback',...(next?{cursor:next}:{})}}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Aufgabenfeedback-Lesezugriff abgelehnt. Live-Adminanmeldung und bereitgestellten Handler prüfen.');
  const raw=await r.text();if(Buffer.byteLength(raw)>4_194_304)throw Error('Aufgabenfeedbackantwort zu groß.');
  let data;try{data=JSON.parse(raw);}catch{throw Error('Ungültige Aufgabenfeedbackantwort.');}
  if(data.error)throw Error('Aufgabenfeedback-Lesezugriff abgelehnt oder Handler noch nicht bereitgestellt. Kein leerer Datenbestand nachgewiesen.');
  const result=data.result;
  if(result?.sourceProject!=='hausaufgabe-staging'||result.environment!=='production')throw Error('Aufgabenfeedback stammt nicht aus der gebundenen Live-Umgebung.');
  if(!Array.isArray(result.reports)||result.reports.length>100)throw Error('Ungültige Aufgabenfeedbackliste.');
  for(const row of result.reports){
   if(typeof row.id!=='string'||row.id.length>128||!['good','bad'].includes(row.verdict))throw Error('Ungültige Aufgabenrückmeldung.');
   if(seen.has(row.id))continue;seen.add(row.id);
   const clean=Object.fromEntries(fields.filter(k=>(typeof row[k]==='string'&&row[k].length<=1000)||typeof row[k]==='number').map(k=>[k,row[k]]));
   if(row.questionSnapshot&&typeof row.questionSnapshot.text==='string')clean.questionSnapshot={type:String(row.questionSnapshot.type||'').slice(0,30),text:row.questionSnapshot.text.slice(0,900)};
   reports.push(clean);
  }
  next=result.nextCursor??null;if(next!==null&&!valid(next))throw Error('Ungültiger Cursor der Quelle.');pages++;
 }while(next&&pages<maxPages);
 return {source:endpoint,sourceProject:'hausaufgabe-staging',environment:'production',readAt:new Date().toISOString(),readOnly:true,untrustedContent:true,reports,pages,truncated:!!next,nextCursor:next};
}
