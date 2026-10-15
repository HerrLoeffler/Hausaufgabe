// Local-only preview mounts the actual creation view and product styles.
// No app/Firebase/provider code or synthetic replacement cards are executed.
if (!['localhost','127.0.0.1'].includes(location.hostname)) throw new Error('Local preview only');
const [html,startup]=await Promise.all(['index.html','startup.js'].map(async path=>(await fetch(path)).text()));
const source=new DOMParser().parseFromString(html,'text/html');
const sheets=[...source.querySelectorAll('link[rel="stylesheet"]')].map(link=>link.getAttribute('href'));
const styleSource=startup.slice(startup.indexOf('const styles = ['),startup.indexOf('for (const [href'));
for(const [,href] of styleSource.matchAll(/["'](\.\/[^"']+\.css[^"']*)["']/g))sheets.push(href);
await Promise.all([...new Set(sheets)].map(href=>new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.onload=resolve;link.onerror=reject;document.head.append(link);} )));
const view=document.importNode(source.getElementById('aiView'),true);view.classList.remove('hidden');
view.querySelector('.aiOptionalAudio').open=true;
view.querySelectorAll('button,input[type="file"]').forEach(control=>control.disabled=true);
document.getElementById('audioPreviewHost').append(view);
const {gradeCrewI18n}=await import('../../shared/i18n/bootstrap.mjs');
gradeCrewI18n.setLocale(new URLSearchParams(location.search).get('locale')||'de-DE',{persist:false});
document.body.dataset.previewReady='true';
if(location.hash==='#audio')view.querySelector('.aiOptionalAudio').scrollIntoView({block:'center'});
