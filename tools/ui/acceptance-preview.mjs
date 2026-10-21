// Test-only: actual entry/CSS modules, no app/Firebase/provider imports.
if(!['localhost','127.0.0.1'].includes(location.hostname)) throw new Error('Local fixture only');
const read=async path=>(await fetch(path)).text();
const [html,startup]=await Promise.all(['index.html','startup.js'].map(read));
const parsed=new DOMParser().parseFromString(html,'text/html');
const sheets=[...parsed.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute('href'));
const styles=startup.slice(startup.indexOf('const styles = ['),startup.indexOf('for (const [href'));
for(const [,href] of styles.matchAll(/["'](\.\/[^"']+\.css[^"']*)["']/g))sheets.push(href);
sheets.push('gradecrew-tour.css');
[...new Set(sheets)].forEach(href=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);});
document.body.append(document.importNode(parsed.querySelector('.topbar'),true));
const main=document.createElement('main');main.id='mainContent';main.className='shell';
main.append(document.importNode(parsed.getElementById('authView'),true));document.body.append(main);
parsed.querySelectorAll('footer').forEach(footer=>document.body.append(document.importNode(footer,true)));
const {installGradeCrewEntryFlow}=await import('../../gradecrew-entry-flow.js');
await import('../../shared/i18n/bootstrap.mjs');
await import('../../gradecrew-brand.js');
installGradeCrewEntryFlow();
document.querySelectorAll('form').forEach(form=>form.addEventListener('submit',e=>e.preventDefault()));
if(new URLSearchParams(location.search).get('scene')==='coach'){
 document.getElementById('authView').classList.add('hidden');
 document.body.classList.add('gcRealTourActive');
 const coach=document.createElement('aside');coach.className='gcRealCoach gcCoachCentered';coach.innerHTML='<h2>Willkommen bei GradeCrew.</h2><p>Lokale Prüfung der tatsächlichen Tour-Styles – keine Anmeldung oder Serverdaten.</p><button class="button primary">Mit der Crew starten</button>';document.body.append(coach);
 await import('../../crew-tour-hardening.js');
 await import('../../crew-tour-responsive.js');
}
