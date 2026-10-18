const endpoint='https://europe-west1-hausaufgabe-staging.cloudfunctions.net/reviewMode';
const safeFields=['id','text','status','approval','view','target','build','createdAt','updatedAt','region'];
export async function readTeacherFeedback({token,cursor,fetchImpl=fetch,maxPages=20}={}){
 if(typeof token!=='string'||!token.trim())throw Error('Live-Anmeldung fehlt. Bitte zuerst gradecrew_live_feedback_connect verwenden.');
 if(!Number.isInteger(maxPages)||maxPages<1||maxPages>100)throw Error('Ungültige Seitengrenze.');
 const validCursor=value=>typeof value==='string'&&/^[\w-]{1,128}$/.test(value);
 if(cursor!==undefined&&!validCursor(cursor))throw Error('Ungültiger Cursor.');
 const visited=new Set(),seen=new Set(),notes=[];let next=cursor,pages=0;
 do{
  if(next){if(visited.has(next))throw Error('Wiederholter Cursor; Abruf abgebrochen.');visited.add(next);}
  const r=await fetchImpl(endpoint,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token.trim()}`},body:JSON.stringify({data:{action:'listTeacherFeedback',...(next?{cursor:next}:{})}}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Live-Lesezugriff abgelehnt. Anmeldung und Admin-Berechtigung prüfen.');
  const text=await r.text();if(Buffer.byteLength(text)>1_048_576)throw Error('Feedbackantwort zu groß.');
  let data;try{data=JSON.parse(text);}catch{throw Error('Ungültige Feedbackantwort.');}
  if(data.error)throw Error('Live-Lesezugriff abgelehnt. Anmeldung und Admin-Berechtigung prüfen.');
  if(data.result?.environment!=='production')throw Error('Feedback stammt nicht aus der ausdrücklich gewählten Live-Umgebung.');
  if(!Array.isArray(data.result.notes)||data.result.notes.length>100)throw Error('Ungültige Feedbackliste.');
  for(const n of data.result.notes){
   if(n.authorRole!=='teacher')continue;
   if(typeof n.id!=='string'||typeof n.text!=='string'||n.text.length>3000)throw Error('Ungültiger Feedbackhinweis.');
   if(!seen.has(n.id)){seen.add(n.id);notes.push(Object.fromEntries(safeFields.filter(k=>Object.hasOwn(n,k)).map(k=>[k,n[k]])));}
  }
  next=data.result.nextCursor??null;if(next!==null&&!validCursor(next))throw Error('Ungültiger Cursor der Quelle.');pages++;
 }while(next&&pages<maxPages);
 return {source:endpoint,environment:'production',project:'hausaufgabe-staging',readAt:new Date().toISOString(),untrustedContent:true,notes,pages,truncated:!!next,nextCursor:next};
}
