import {SCENES,validScene} from './policy.mjs';
const key='gradecrew-review-scene-v1';let active='welcome';let ready=false;
export function openReviewScene(scene){if(!SCENES.includes(scene))throw new Error('Unbekannte Prüfszene.');active=scene;localStorage.setItem(key,JSON.stringify({version:1,scene}));document.dispatchEvent(new CustomEvent('gradecrew:review-scene',{detail:{scene}}));}
const bar=document.createElement('nav');bar.setAttribute('aria-label','Lokale Prüfszenen');bar.style.cssText='position:fixed;top:0;left:0;right:0;z-index:2147482900;background:#173f55;color:white;padding:8px 14px;display:flex;align-items:center;gap:12px;font:13px system-ui';
const title=document.createElement('strong');title.textContent='Lokale Live-Vorschau · Beispieldaten';const select=document.createElement('select');select.setAttribute('aria-label','Prüfszene');
const titles={welcome:'Startseite',remy:'Remy · Test erstellen',editor:'Emmi · Editor',student:'Schüleransicht',submit:'Abgabe-Dialog',results:'Wilma · Auswertung',finish:'Tutorial-Abschluss'};
for(const scene of SCENES){const o=document.createElement('option');o.value=scene;o.textContent=titles[scene];select.append(o);}select.onchange=()=>openReviewScene(select.value);bar.append(title,select);document.body.prepend(bar);document.body.style.paddingTop='46px';
document.addEventListener('gradecrew:review-ready',()=>{ready=true;let saved;try{saved=JSON.parse(localStorage.getItem(key));}catch{}const scene=validScene(saved);if(saved&&!scene)title.textContent+=' · alter Prüfpunkt verworfen';active=scene||'welcome';select.value=active;openReviewScene(active);});
document.addEventListener('gradecrew:review-scene',event=>{if(SCENES.includes(event.detail?.scene)){active=event.detail.scene;select.value=active;}});
const events=new EventSource('/__review/events');events.onmessage=()=>{if(ready){localStorage.setItem(key,JSON.stringify({version:1,scene:active}));location.reload();}};

// Local fixture access only: never authenticate or send credentials.
function enterLocalWorkspace(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  openReviewScene('editor');
}
document.addEventListener('click', event => {
  const button = event.target.closest?.('#gcEntryLoginOpen, #loginTab, #loginForm button[type="submit"]');
  if (button) enterLocalWorkspace(event);
}, true);
document.addEventListener('submit', event => {
  if (event.target.id === 'loginForm') enterLocalWorkspace(event);
}, true);
