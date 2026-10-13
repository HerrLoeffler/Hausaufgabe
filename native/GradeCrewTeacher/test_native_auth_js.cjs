const test=require('node:test'); const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const {createNativeAuthController}=require('./Resources/gradecrew-native-auth.js');
function fixture(){
 const dom=new JSDOM(`<section id="authView"><button id="gcEntryLoginOpen"></button><button id="gcEntrySwitchRegister"></button><button id="forgotBtn"></button>
 <form id="loginForm"><input id="loginEmail" required><input id="loginPassword" type="password" required><button></button></form>
 <form id="registerForm"><input id="registerName" required><input id="registerEmail" required><input id="registerPassword" type="password" required minlength="6"><input id="registerPassword2" type="password" required minlength="6"><button></button></form>
 <form id="resetForm"><input id="resetEmail" required><button id="resetSubmit"></button><p id="resetStatus"></p></form></section><div id="toast"></div>`);
 const d=dom.window.document; let user=null;let state={state:'signedOut'};let clock=0;const calls=[];const logins=[];
 for(const [id,mode]of [['gcEntryLoginOpen','login'],['gcEntrySwitchRegister','register'],['forgotBtn','reset']])d.getElementById(id).onclick=()=>d.getElementById('authView').dataset.entryState=mode;
 const auth=createNativeAuthController({document:d,getSession:async()=>({getUser:()=>user}),readState:()=>state,
 restoredAccount:()=>{},recordLogin:uid=>logins.push(uid),now:()=>clock,tick:async()=>{clock+=100;await Promise.resolve();},timeout:500});
 const submit=(id,callback)=>d.getElementById(id).addEventListener('submit',e=>{e.preventDefault();callback();});
 return {d,auth,calls,logins,submit,setUser:email=>{user={uid:'teacher-1',email};state={state:'signedIn'};},setState:s=>state=s,toast:(text,error=false)=>{d.getElementById('toast').textContent=text;d.getElementById('toast').className='toast show '+(error?'error':'success');}};
}
test('login uses existing form, clears credentials immediately, counts only accepted login',async()=>{
 const f=fixture();f.submit('loginForm',()=>{f.calls.push([f.d.getElementById('loginEmail').value,f.d.getElementById('loginPassword').value]);f.setUser('martin@example.org');f.toast('Erfolgreich angemeldet.');});
 assert.equal((await f.auth.perform('authPrepare',{})).status,'ready');
 const result=await f.auth.perform('authLogin',{email:' martin@example.org ',password:' secret '});
 assert.equal(result.status,'signedIn');assert.deepEqual(f.calls,[['martin@example.org',' secret ']]);assert.equal(f.d.getElementById('loginPassword').value,'');assert.deepEqual(f.logins,['teacher-1']);assert.equal(JSON.stringify(result).includes('teacher-1'),false);
});
test('registration reuses shared profile handler and fills hidden confirmation without new UI field',async()=>{
 const f=fixture();f.submit('registerForm',()=>{f.calls.push([f.d.getElementById('registerName').value,f.d.getElementById('registerPassword2').value]);f.setUser('new@example.org');f.toast('Account erstellt.');});
 assert.equal((await f.auth.perform('authRegister',{name:' New ',email:'new@example.org',password:'abcdef'})).status,'signedIn');
 assert.deepEqual(f.calls,[['New','abcdef']]);assert.equal(f.d.getElementById('registerPassword2').value,'');
});
test('rejects aliases and invalid registration before shared form dispatch',async()=>{
 const f=fixture();f.submit('loginForm',()=>f.calls.push('unexpected'));
 await assert.rejects(f.auth.perform('authLogin',{email:'test',password:'abc'}),/E-Mail/);
 await assert.rejects(f.auth.perform('authRegister',{email:'a@b.de',name:' ',password:'123456'}),/Namen/);
 assert.deepEqual(f.calls,[]);
});
test('wrong password preserves provider error and never reports success or counts',async()=>{
 const f=fixture();f.submit('loginForm',()=>f.toast('E-Mail oder Passwort ist falsch.',true));
 await assert.rejects(f.auth.perform('authLogin',{email:'a@b.de',password:'bad'}),/Passwort ist falsch/);assert.deepEqual(f.logins,[]);assert.equal(f.d.getElementById('loginPassword').value,'');
});
test('raw Firebase user or stale success toast is insufficient without current form success and authorized state',async()=>{
 const f=fixture();f.toast('Erfolgreich angemeldet.');f.submit('loginForm',()=>{f.setUser('a@b.de');f.setState({state:'checking'});});
 await assert.rejects(f.auth.perform('authLogin',{email:'a@b.de',password:'abc'}),/erneut/);assert.deepEqual(f.logins,[]);
});
test('session restoration does not count as another login',async()=>{const f=fixture();f.setUser('a@b.de');await f.auth.perform('authPrepare',{});assert.deepEqual(f.logins,[]);});
test('password reset invokes existing reset state and privacy-safe status, errors remain retryable',async()=>{
 const f=fixture();f.submit('resetForm',()=>{assert.equal(f.d.getElementById('authView').dataset.entryState,'reset');f.d.getElementById('resetStatus').textContent='Falls ein Konto mit dieser E-Mail-Adresse besteht, erhältst du einen Link. Schau auch im Spam-Ordner nach.';});
 assert.equal((await f.auth.perform('authReset',{email:'a@b.de'})).status,'resetSent');
 f.submit('resetForm',()=>{f.d.getElementById('resetStatus').textContent='Der Link konnte gerade nicht angefordert werden. Prüfe deine E-Mail-Adresse und versuche es erneut.';});
 await assert.rejects(f.auth.perform('authReset',{email:'a@b.de'}),/nicht angefordert/);
});
test('missing handlers time out clearly and unsupported action cannot submit',async()=>{
 const f=fixture();f.setState(null);await assert.rejects(f.auth.perform('authPrepare',{}),/erneut/);
 await assert.rejects(f.auth.perform('authDelete',{}),/nicht verfügbar/);
});
