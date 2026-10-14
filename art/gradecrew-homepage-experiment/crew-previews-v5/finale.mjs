import {gradeCrewI18n} from './baseline/shared/i18n/bootstrap.mjs?v=3';
import {getActiveUiLocale} from './baseline/shared/i18n/browser-runtime.mjs?v=3';
import {DEMO_TEST} from './tutorial-fixture.mjs';
import {createTutorialGate} from './tutorial-gate.mjs';
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy={
 de:{back:'Zur Homepage-Vorschau',context:'Vorschau des letzten Tutorialschritts. Name und Übungstest sind synthetisch vorbereitet; es wird kein echtes Konto angelegt.',data:'Demodaten für diesen Abschluss',nameLabel:'Bereits im Tutorial eingegebener Name',authLabel:'Bereits angemeldet (Demostatus)',finishTitle:'Deine Einführung ist geschafft!',finishText:'Du hast mit der Crew einen Test erstellt, überarbeitet, selbst ausgefüllt und geprüft. Wie möchtest du weitermachen?',tutorialTest:'Dein Übungstest bleibt erhalten',questionCount:'10 Aufgaben',settings:'Zu den Einstellungen',create:'Ersten eigenen Test erstellen',joinTitle:'Der Crew beitreten',loginTitle:'Willkommen zurück in der Crew.',greeting:'Schön, dass du dabei bist, {name}.',nameNote:'Dein Name wurde aus der Einführung übernommen.',email:'E-Mail',password:'Passwort',signup:'Demo-Konto anlegen',signin:'Anmelden (Demo)',already:'Schon dabei?',new:'Neu bei GradeCrew?',switchLogin:'Anmelden',switchRegister:'Der Crew beitreten',localNote:'Nur Demowerte verwenden, z. B. mara@example.test. Kein Konto wird erstellt, kein Passwort gespeichert oder übertragen.',continue:'Danach geht es weiter: {target}.',cancel:'Zurück zum Tutorialabschluss',invite:'Coco freut sich auf dich.',proof:'Demo angemeldet als {name}. Der Übungstest und die gewählte Zielaktion sind erhalten.',targetSettings:'Deine Einstellungen',targetCreate:'Dein erster eigener Test',targetHint:'Vorschau der Weiterleitung nach dem Konto-Einstieg. Die echte Anwendung wird hier nicht geöffnet.',returnFinish:'Zurück zum Abschluss',subject:'Fach',grade:'Klasse',topic:'Thema',settingsHint:'Hier würde die bestehende Einstellungsansicht starten. Dein Übungstest bleibt für den Übergang erhalten.'},
 en:{back:'Back to the homepage preview',context:'Preview of the final tutorial step. The name and practice test are prepared sample data; no real account is created.',data:'Sample data for this final step',nameLabel:'Name already entered during the tutorial',authLabel:'Already signed in (sample status)',finishTitle:'You have completed the introduction!',finishText:'You created, revised, took and reviewed a test with the crew. What would you like to do next?',tutorialTest:'Your practice test stays with you',questionCount:'10 questions',settings:'Go to settings',create:'Create your first own test',joinTitle:'Join the crew',loginTitle:'Welcome back to the crew.',greeting:'Lovely to have you here, {name}.',nameNote:'Your name was carried over from the tutorial.',email:'Email',password:'Password',signup:'Create sample account',signin:'Sign in (sample)',already:'Already a member?',new:'New to GradeCrew?',switchLogin:'Sign in',switchRegister:'Join the crew',localNote:'Use sample values only, e.g. mara@example.test. No account is created and no password is stored or transmitted.',continue:'Continue afterwards: {target}.',cancel:'Back to the final tutorial step',invite:'Coco is happy to see you.',proof:'Sample sign-in as {name}. Your practice test and chosen destination remain in place.',targetSettings:'Your settings',targetCreate:'Your first own test',targetHint:'Preview of where you go after joining. The real app is not opened here.',returnFinish:'Back to the final step',subject:'Subject',grade:'Grade',topic:'Topic',settingsHint:'The existing settings view would open here. Your practice test is retained for the transition.'}
};
const gate=createTutorialGate({name:'Mara',draft:DEMO_TEST});
const t=(key,values={})=>{let s=copy[getActiveUiLocale().startsWith('en')?'en':'de'][key];for(const [k,v] of Object.entries(values))s=s.replaceAll('{'+k+'}',String(v));return s;};
const safe=(key,values)=>esc(t(key,values));
const dialog=$('joinCrew');
history.replaceState({view:'finish'},'',location.href);
function focusHeading(){requestAnimationFrame(()=>{const h=document.querySelector(dialog.open?'#accountTitle':'#finaleStage h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}});}
function clearPasswords(){document.querySelectorAll('input[type=password]').forEach(input=>input.value='');}
function cancelGate(){clearPasswords();gate.cancel();render();if(history.state?.view==='account')history.back();focusHeading();}
function renderAccount(s){
 clearPasswords();
 dialog.innerHTML='<button type="button" class="account-close" id="accountCancel" aria-label="'+safe('cancel')+'">×</button><div class="account-grid"><div class="account-art"><img src="assets/coco-join-crew.png" alt=""><p>'+safe('invite')+'</p></div><div class="account-copy"><h2 id="accountTitle">'+safe(s.mode==='login'?'loginTitle':'joinTitle')+'</h2><p class="account-greeting">'+safe('greeting',{name:s.name})+'</p><p class="account-name-note">'+safe('nameNote')+'</p><p class="account-continue">'+safe('continue',{target:t(s.intent)})+'</p><form id="accountForm" class="account-form" autocomplete="off"><label>'+safe('email')+'<input id="demoEmail" type="email" required pattern="[^@]+@example\\.test" placeholder="mara@example.test" autocomplete="off"></label><label>'+safe('password')+'<input id="demoPassword" type="password" required minlength="6" autocomplete="off" placeholder="Demo-Passwort"></label><button class="button primary" type="submit">'+safe(s.mode==='login'?'signin':'signup')+'</button></form><p class="account-local-note">'+safe('localNote')+'</p><p class="account-mode">'+safe(s.mode==='login'?'new':'already')+' <button id="accountMode" type="button">'+safe(s.mode==='login'?'switchRegister':'switchLogin')+'</button></p></div></div>';
 $('accountCancel').addEventListener('click',cancelGate);
 $('accountMode').addEventListener('click',()=>{clearPasswords();gate.setMode(s.mode==='login'?'register':'login');render();focusHeading();});
 $('accountForm').addEventListener('submit',event=>{
  event.preventDefault();clearPasswords();gate.simulateSignIn();$('demoAuthenticated').checked=true;
  history.replaceState({view:gate.snapshot().view},'',location.href);render();focusHeading();
 });
 if(!dialog.open)dialog.showModal();
}
function render(){
 const s=gate.snapshot();
 $('backHomepage').textContent=t('back');$('previewContext').textContent=t('context');$('demoContextTitle').textContent=t('data');$('nameLabel').textContent=t('nameLabel');$('authLabel').textContent=t('authLabel');
 if(s.view==='account'){renderAccount(s);return;}
 if(dialog.open)dialog.close();
 if(s.view==='finish'){
  $('finaleStage').innerHTML='<article class="finish-card"><div class="finish-header"><img src="baseline/assets/gradecrew/coco-footer-guide.png" alt=""><div><h1>'+safe('finishTitle')+'</h1><p>'+safe('finishText')+'</p></div></div><div class="finish-test"><strong>'+safe('tutorialTest')+'</strong><p>'+esc(s.draft.title)+' · '+safe('questionCount')+'</p><ol class="fixture-list" data-i18n-ignore="1">'+s.draft.questions.map(q=>'<li>'+esc(q.text)+'</li>').join('')+'</ol></div><div class="finish-actions"><button type="button" class="button primary" data-destination="create">'+safe('create')+'</button><button type="button" class="button secondary" data-destination="settings">'+safe('settings')+'</button></div></article>';
  document.querySelectorAll('[data-destination]').forEach(button=>button.addEventListener('click',()=>{
   gate.request(button.dataset.destination);history.pushState({view:gate.snapshot().view},'',location.href);render();focusHeading();
  }));
 }else{
  let fields=s.view==='create'?'<div class="destination-fields"><label>'+safe('subject')+'<input type="text" readonly></label><label>'+safe('grade')+'<input type="text" readonly></label><label>'+safe('topic')+'<input type="text" readonly></label></div>':'<p>'+safe('settingsHint')+'</p>';
  $('finaleStage').innerHTML='<article class="destination-card" data-destination-view="'+s.view+'"><h1>'+safe(s.view==='settings'?'targetSettings':'targetCreate')+'</h1><p>'+safe('targetHint')+'</p><div class="destination-proof">'+safe('proof',{name:s.name})+'<br>'+esc(s.draft.title)+' · '+safe('questionCount')+'</div>'+fields+'<button type="button" id="returnFinish" class="button secondary">'+safe('returnFinish')+'</button></article>';
  $('returnFinish').addEventListener('click',()=>{gate.returnToFinish();history.pushState({view:'finish'},'',location.href);render();focusHeading();});
 }
}
dialog.addEventListener('cancel',event=>{event.preventDefault();cancelGate();});
dialog.addEventListener('close',()=>{clearPasswords();if(gate.snapshot().view==='account'){gate.cancel();history.replaceState({view:'finish'},'',location.href);render();}});
window.addEventListener('popstate',event=>{clearPasswords();if(event.state?.view==='account')gate.showAccount();else if(['create','settings'].includes(event.state?.view)&&gate.snapshot().authenticated)gate.request(event.state.view);else gate.returnToFinish();render();focusHeading();});
$('demoTutorialName').addEventListener('input',event=>gate.setName(event.target.value));
$('demoAuthenticated').addEventListener('change',event=>gate.setAuthenticated(event.target.checked));
window.addEventListener('gradecrew:ui-locale-changed',render);
window.addEventListener('pagehide',clearPasswords);
render();

