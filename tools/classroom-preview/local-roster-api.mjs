import {RosterError} from './local-roster-store.mjs';
const errors={
 'unauthenticated':'Bitte melde dich erneut mit deinem Lehreraccount an.',
 'permission-denied':'Dieser Zugang kann die lokale Klassenverwaltung nicht verwenden.',
 'unavailable':'Die Anmeldung konnte gerade nicht geprüft werden. Bitte erneut versuchen.',
 'invalid-argument':'Bitte prüfe die Eingaben.',
 'revision-conflict':'Der Bestand wurde inzwischen geändert. Bitte neu laden und erneut prüfen.',
 'operation-conflict':'Dieser Speichervorgang wurde bereits mit anderen Angaben verwendet.',
 'already-exists':'Diese Klasse ist in diesem Schuljahr bereits vorhanden.',
 'not-found':'Der Eintrag ist nicht mehr verfügbar. Bitte den Bestand neu laden.',
 'resource-exhausted':'Die Grenze für diesen lokalen Testbestand ist erreicht.',
 'duplicate-source':'Eine Kennung kommt in mehreren Dateizeilen vor. Bitte die Datei prüfen.',
 'duplicate-target':'Mehrere Zeilen sind derselben Person zugeordnet. Bitte die Zuordnung prüfen.',
 'target-conflict':'Das Schuljahr passt nicht zur gewählten Klasse. Bitte die Zielklasse erneut wählen.',
 'source-conflict':'Die Kennung ist bereits anders zugeordnet. Bitte die Importquelle prüfen.',
 'preview-mismatch':'Die Vorschau passt nicht mehr. Bitte eine neue Vorschau erstellen.',
 'import-unresolved':'Bitte zuerst alle unklaren Zuordnungen in der Vorschau prüfen.',
 'internal':'Speichern nicht möglich. Bitte erneut versuchen.'
};
export function createFirebaseIdentityVerifier({apiKey,fetchImpl=globalThis.fetch}){
 return async token=>{
  if(typeof token!=='string'||token.length<1||token.length>16000)throw new RosterError('unauthenticated',401);
  let response,data;
  try{
   response=await fetchImpl(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),signal:AbortSignal.timeout(10000),redirect:'error'});
   if(!response.ok)throw new RosterError(response.status>=500?'unavailable':'unauthenticated',response.status>=500?503:401);
   data=await response.json();
  }catch(error){if(error instanceof RosterError)throw error;throw new RosterError('unavailable',503);}
  const user=data.users?.[0];
  if(!user?.localId||user.disabled)throw new RosterError('unauthenticated',401);
  if(!Array.isArray(user.providerUserInfo)||!user.providerUserInfo.some(p=>['password','google.com','apple.com','microsoft.com','oidc.school'].includes(p.providerId)))throw new RosterError('permission-denied',403);
  return {uid:user.localId};
 };
}
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(data));}
async function jsonBody(req){
 if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new RosterError('invalid-argument',415);
 let bytes=0;const parts=[];
 for await(const chunk of req){bytes+=chunk.length;if(bytes>4*1024*1024)throw new RosterError('invalid-argument',413);parts.push(chunk);}
 try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw new RosterError('invalid-argument',400);}
}
export async function handleLocalRoster(req,res,{store,verifyIdentity}){
 try{
  const origin=`http://${req.headers.host}`;
  if((req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site')throw new RosterError('permission-denied',403);
  if(!['GET','POST'].includes(req.method)){send(res,405,{error:{code:'invalid-argument',message:errors['invalid-argument']}});return;}
  if(req.method==='POST'&&req.headers.origin!==origin)throw new RosterError('permission-denied',403);
  const match=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'');
  if(!match)throw new RosterError('unauthenticated',401);
  const actor=await verifyIdentity(match[1]);
  if(!actor?.uid)throw new RosterError('unauthenticated',401);
  let state;
  if(req.method==='GET')state=store.read(actor.uid);
  else{
   const body=await jsonBody(req);
   if(body?.command==='previewStudentImport'){
    if(Object.keys(body).some(k=>!['command','payload'].includes(k)))throw new RosterError('invalid-argument');
    state=store.previewImport(actor.uid,body.payload);
   }else state=store.mutate(actor.uid,body);
  }
  send(res,200,state);
 }catch(error){
  const code=error.code&&errors[error.code]?error.code:error.message==='unauthenticated'?'unauthenticated':'internal';
  send(res,error.status||(code==='unauthenticated'?401:500),{error:{code,message:errors[code]}});
 }
}
