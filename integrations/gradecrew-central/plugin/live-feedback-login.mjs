import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';

const projectId='hausaufgabe-staging';
const accessUrl='https://europe-west1-hausaufgabe-staging.cloudfunctions.net/reviewMode';
const firebaseSignInUrl='https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB9M7jPOlgiqltTSDjv_Rem0g8s87LEIKE';
const connectTtlMs=5*60*1000;
const maxTokenBytes=8192;

const loginPage=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GradeCrew-Live mit Codex verbinden</title><style>
body{font:16px system-ui,sans-serif;background:#f4f7fd;color:#182b47;min-height:100vh;display:grid;place-items:center;margin:0;padding:16px;box-sizing:border-box}
main{width:min(100%,420px);background:white;border:1px solid #d6e0f1;border-radius:20px;box-shadow:0 18px 50px #1737641c;padding:30px;box-sizing:border-box}
h1{font-size:1.4rem;margin:0 0 12px}p{line-height:1.5;color:#475b76}label{display:block;margin:16px 0 5px;font-weight:600}
input,button{font:inherit;box-sizing:border-box;width:100%;padding:12px;border-radius:10px}input{border:1px solid #aabbd5}button{margin-top:22px;border:0;background:#2857cf;color:white;font-weight:700;cursor:pointer}button:disabled{opacity:.6;cursor:wait}#message{min-height:1.5em}
</style><main><h1>GradeCrew-Live verbinden</h1><p>Verwende dein bestehendes Live-Konto. Dein Passwort geht direkt an Firebase; das lokale Codex-Plugin erhält nur einen kurzlebigen Lesezugang.</p><form id="login"><label for="email">E-Mail</label><input id="email" type="email" autocomplete="username" required><label for="password">Passwort</label><input id="password" type="password" autocomplete="current-password" required><button id="submit" type="submit">Mit Codex verbinden</button></form><p id="message" role="status" aria-live="polite"></p></main><script src="/login.js" defer></script></html>`;

const loginScript=`const form=document.querySelector('#login');
const message=document.querySelector('#message');
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const button=document.querySelector('#submit');button.disabled=true;message.textContent='Anmeldung läuft …';
 const email=document.querySelector('#email').value.trim();
 const passwordField=document.querySelector('#password');
 try{
  const response=await fetch(${JSON.stringify(firebaseSignInUrl)},{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:passwordField.value,returnSecureToken:true}),cache:'no-store'});
  passwordField.value='';
  if(!response.ok)throw Error('Anmeldung fehlgeschlagen. Bitte Konto und Passwort prüfen.');
  const signedIn=await response.json();
  if(typeof signedIn.idToken!=='string')throw Error('Firebase hat keinen Zugang bestätigt.');
  const nonce=location.pathname.split('/').at(-1);
  const paired=await fetch('/complete/'+encodeURIComponent(nonce),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:signedIn.idToken}),cache:'no-store'});
  if(!paired.ok)throw Error('Dieses Konto darf die privaten Live-Daten nicht lesen oder die Verbindung ist abgelaufen.');
  form.remove();message.textContent='Verbunden. Du kannst dieses Fenster schließen und in Codex fortfahren.';
 }catch(error){passwordField.value='';message.textContent=error instanceof TypeError?'Verbindung abgelaufen. Bitte in Codex erneut verbinden.':error.message;button.disabled=false;}
});`;

function tokenExpiry(token,now){
 if(typeof token!=='string'||Buffer.byteLength(token)>maxTokenBytes||!/^[-_A-Za-z0-9]+\.[-_A-Za-z0-9]+\.[-_A-Za-z0-9]+$/.test(token))return 0;
 const parts=token.split('.');if(parts.length!==3)return 0;
 try{
  const claims=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
  if(claims.aud!==projectId||claims.iss!==`https://securetoken.google.com/${projectId}`||!Number.isInteger(claims.exp))return 0;
  const expiresAt=claims.exp*1000;
  return expiresAt>now&&expiresAt<=now+60*60*1000+60_000?Math.min(expiresAt,now+60*60*1000):0;
 }catch{return 0;}
}

export async function verifyLiveFeedbackToken(token,{fetchImpl=fetch}={}){
 let response,data;
 try{
  response=await fetchImpl(accessUrl,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify({data:{action:'access'}}),signal:AbortSignal.timeout(8000)});
  const body=await response.text();
  if(Buffer.byteLength(body)>131072)throw Error('large response');
  data=JSON.parse(body);
 }catch{throw Error('Live-Berechtigung konnte nicht geprüft werden.');}
 if(!response.ok||data?.error||typeof data?.result?.uid!=='string'||data.result.admin!==true)throw Error('Keine Berechtigung für private Live-Daten.');
 return true;
}

export function createLiveFeedbackLogin({verifyToken=verifyLiveFeedbackToken,now=Date.now}={}){
 let session=null,pending=null,server=null;
 function token(){
  if(!session||session.expiresAt<=now()){session=null;return '';}
  return session.value;
 }
 function status(){return {connected:!!token(),expiresAt:session?.expiresAt??null};}
 async function closeListener(){
  if(pending?.timer)clearTimeout(pending.timer);
  pending=null;
  const active=server;server=null;
  if(active?.listening)await new Promise(resolve=>{active.close(resolve);active.closeIdleConnections?.();});
 }
 async function disconnect(){session=null;await closeListener();return status();}
 async function connect(){
  if(token())return status();
  if(pending&&pending.expiresAt>now())return {connected:false,url:pending.url,expiresAt:pending.expiresAt};
  await closeListener();
  const nonce=randomBytes(32).toString('base64url');
  server=createServer((req,res)=>{void handle(req,res).catch(()=>reply(res,500,{error:'Verbindung fehlgeschlagen.'}));});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin=`http://127.0.0.1:${server.address().port}`;
  const expiresAt=now()+connectTtlMs;
  pending={nonce,origin,url:`${origin}/connect/${nonce}`,expiresAt,completing:false};
  pending.timer=setTimeout(()=>{void closeListener();},connectTtlMs);
  pending.timer.unref();
  return {connected:false,url:pending.url,expiresAt};
 }
 function reply(res,statusCode,body){
  if(res.headersSent)return;
  res.writeHead(statusCode,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(JSON.stringify(body));
 }
 async function handle(req,res){
  const active=pending;
  if(!active||req.headers.host!==new URL(active.origin).host){reply(res,404,{error:'Verbindung unbekannt.'});return;}
  const path=new URL(req.url,active.origin).pathname;
  if(req.method==='GET'&&path===`/connect/${active.nonce}`){
   res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self' https://identitytoolkit.googleapis.com; form-action 'none'; base-uri 'none'; frame-ancestors 'none'"});
   res.end(loginPage);return;
  }
  if(req.method==='GET'&&path==='/login.js'){
   res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
   res.end(loginScript);return;
  }
  if(req.method!=='POST'||path!==`/complete/${active.nonce}`){reply(res,404,{error:'Verbindung unbekannt.'});return;}
  if(req.headers.origin!==active.origin||req.headers['content-type']?.split(';')[0]!=='application/json'){reply(res,403,{error:'Anfrage nicht erlaubt.'});return;}
  if(active.expiresAt<=now()||active.completing){reply(res,410,{error:'Verbindung abgelaufen.'});return;}
  let body='';
  try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>maxTokenBytes+1000)throw Error('too large');}}
  catch{reply(res,413,{error:'Anfrage zu groß.'});return;}
  let idToken;
  try{idToken=JSON.parse(body)?.idToken;}catch{reply(res,400,{error:'Ungültige Anfrage.'});return;}
  const expiresAt=tokenExpiry(idToken,now());
  if(!expiresAt){reply(res,400,{error:'Kein gültiges Live-ID-Token.'});return;}
  active.completing=true;
  try{await verifyToken(idToken);}
  catch{active.completing=false;reply(res,403,{error:'Konto nicht berechtigt oder Live nicht erreichbar.'});return;}
  if(pending!==active||active.expiresAt<=now()){reply(res,410,{error:'Verbindung abgelaufen.'});return;}
  session={value:idToken,expiresAt};
  reply(res,200,{connected:true});
  res.once('finish',()=>{void closeListener();});
 }
 return {connect,disconnect,status,token};
}
