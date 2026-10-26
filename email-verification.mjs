const texts={
 de:{title:'Bestätige deine E-Mail',intro:'Gib den sechsstelligen Code aus deiner E-Mail ein.',label:'Bestätigungscode',confirm:'E-Mail bestätigen',resend:'Neuen Code senden',out:'Mit einem anderen Konto anmelden',sent:'Der Code wurde gesendet. Er ist zehn Minuten gültig.',waiting:'Code wird gesendet …',checking:'Code wird geprüft …',done:'E-Mail bestätigt. Deine Crew ist bereit.',invalid:'Der Code stimmt nicht. Bitte prüfe deine E-Mail.',expired:'Der Code ist abgelaufen. Bitte fordere einen neuen an.',limited:'Zu viele Versuche. Bitte versuche es später erneut.',unavailable:'Die Bestätigung ist gerade nicht verfügbar. Bitte versuche es später erneut.',six:'Bitte gib den sechsstelligen Code ein.',hint:'Du kannst den Code einfügen. Schau auch im Spam-Ordner nach.',retry:n=>`Erneut senden in ${n} s`},
 en:{title:'Confirm your email',intro:'Enter the six-digit code from your email.',label:'Verification code',confirm:'Confirm email',resend:'Send a new code',out:'Sign in with another account',sent:'The code has been sent. It is valid for ten minutes.',waiting:'Sending code …',checking:'Checking code …',done:'Email confirmed. Your crew is ready.',invalid:'The code does not match. Please check your email.',expired:'The code has expired. Please request a new one.',limited:'Too many attempts. Please try again later.',unavailable:'Verification is currently unavailable. Please try again later.',six:'Please enter the six-digit code.',hint:'You can paste the code. Please check your spam folder too.',retry:n=>`Send again in ${n}s`}
};
export function installEmailVerification({document,getUser,requestCode,confirmCode,onVerified,onSignOut,now=Date.now}){
 const host=document.getElementById('emailVerificationHost');if(!host)throw Error('Email verification host missing');
 let identity=null,generation=0,busy=false,resendAt=0,status='',timer;
 const lang=()=>document.documentElement.lang.toLowerCase().startsWith('en')?'en':'de';
 const copy=()=>texts[lang()];
 host.innerHTML='<div class="emailVerification"><h1 id="verificationTitle"></h1><p id="verificationIntro"></p><strong id="verificationEmail"></strong><form id="verifyEmailForm" class="stack"><label><span id="verificationLabel"></span><input id="verificationCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" pattern="[0-9\\s]{6,12}" required></label><button id="verificationSubmit" class="button primary" type="submit"></button></form><p id="verificationStatus" role="status" aria-live="polite"></p><p id="verificationHint" class="hint"></p><button id="verificationResend" class="button secondary" type="button"></button><button id="verificationSignOut" class="linkButton" type="button"></button></div>';
 const el=id=>document.getElementById(id);
 const valid=(user,token)=>identity?.uid===user?.uid&&identity?.email===user?.email&&getUser()?.uid===user?.uid&&getUser()?.email===user?.email&&generation===token;
 function refresh(){
  const c=copy(),seconds=Math.max(0,Math.ceil((resendAt-now())/1000));
  for(const [id,key]of Object.entries({verificationTitle:'title',verificationIntro:'intro',verificationLabel:'label',verificationSubmit:'confirm',verificationHint:'hint',verificationSignOut:'out'}))el(id).textContent=c[key];
  el('verificationEmail').textContent=identity?.email||'';el('verificationStatus').textContent=c[status]||'';
  el('verificationResend').textContent=seconds?c.retry(seconds):c.resend;el('verificationResend').disabled=busy||seconds>0;el('verificationSubmit').disabled=busy;el('verificationCode').disabled=busy;
 }
 function show(user){
  if(identity?.uid!==user?.uid||identity?.email!==user?.email){generation++;identity=user?{uid:user.uid,email:user.email}:null;busy=false;resendAt=0;status='';el('verificationCode').value='';}
  refresh();
 }
 function hide(){generation++;identity=null;busy=false;resendAt=0;status='';el('verificationCode').value='';refresh();}
 const failure=error=>({'invalid-argument':'invalid','deadline-exceeded':'expired','resource-exhausted':'limited'})[error?.code?.replace(/^functions\//,'')]||'unavailable';
 async function requestFor(user=getUser()){
  const current=getUser();
  if(!user||current?.uid!==user.uid||current?.email!==user.email){if(identity?.uid===user?.uid)hide();return;}
  show(user);if(busy||resendAt>now())return;const token=generation;busy=true;status='waiting';refresh();
  try{const response=await requestCode({locale:lang(),accountUid:user.uid});if(!valid(user,token))return;resendAt=now()+Math.max(0,Number(response.retryAfterSeconds)||0)*1000;status=response.sent?'sent':'';if(response.verified){status='done';await onVerified(user);}}
  catch(error){if(valid(user,token))status=failure(error);}
  finally{if(generation===token){if(valid(user,token)){busy=false;refresh();}else hide();}}
 }
 async function submit(event){
  event.preventDefault();if(busy||!identity)return;const value=el('verificationCode').value.replace(/\s/g,'');
  if(!/^\d{6}$/.test(value)){status='six';refresh();return;}
  const user=getUser(),token=generation;if(!valid(user,token))return;busy=true;status='checking';refresh();
  try{const response=await confirmCode({code:value,accountUid:user.uid});if(!valid(user,token))return;if(response.verified){status='done';refresh();await onVerified(user);}}
  catch(error){if(valid(user,token))status=failure(error);}
  finally{if(generation===token){if(valid(user,token)){busy=false;refresh();}else hide();}}
 }
 const resend=()=>{void requestFor();},out=()=>{hide();void onSignOut();};
 el('verifyEmailForm').addEventListener('submit',submit);el('verificationResend').addEventListener('click',resend);el('verificationSignOut').addEventListener('click',out);
 const changed=event=>{if(identity?.uid!==event.detail?.uid)hide();};
 document.addEventListener('gradecrew:account-changed',changed);document.defaultView.addEventListener('gradecrew:ui-locale-changed',refresh);
 timer=document.defaultView.setInterval(refresh,1000);refresh();
 return {show,hide,refresh,requestFor,destroy(){document.defaultView.clearInterval(timer);document.removeEventListener('gradecrew:account-changed',changed);document.defaultView.removeEventListener('gradecrew:ui-locale-changed',refresh);}};
}
