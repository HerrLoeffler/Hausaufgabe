import {PUBLIC_ENTRY_HTML,PUBLIC_ENTRY_COPY} from '../generated/public-entry-shell.js';
import {setActiveUiLocale} from './i18n/browser-runtime.mjs?v=3';
const documents=new WeakMap();
const pinned=new WeakMap();
const styles=['/homepage/styles.css?v=15','/homepage/showcase-v5.css?v=16','/homepage/showcase-v6.css?v=2','/homepage/showcase-v7.css?v=student-join-20261026','/homepage/responsive-v9.css?v=20261026','/shared/public-entry-shell.css?v=20261026'];
export function selectPublicEntryLocale(doc,locale) {
 const win=doc.defaultView,next=/^en/i.test(locale)?'en-GB':'de-DE';
 if(win.GradeCrewI18n?.setLocale)win.GradeCrewI18n.setLocale(next);else setActiveUiLocale(next);
 doc.documentElement.lang=next;
 try{win.localStorage.setItem('gradecrew.uiLocale',next);}catch{}
 const url=new URL(doc.URL);url.searchParams.set('lang',next==='en-GB'?'en':'de');win.history.replaceState(win.history.state,'',url.href);
 win.dispatchEvent(new win.CustomEvent('gradecrew:ui-locale-changed',{detail:{locale:next}}));
}
export function pinPublicEntryFrame(doc,page) {
 if(!page || pinned.has(page))return;
 const win=doc.defaultView,stage=page.querySelector('.stage'),hero=page.querySelector('.hero');
 const update=()=>{if(page.hidden)return;const wide=win.innerWidth>=1500,top=wide?36:24,bottom=wide?44:(win.innerWidth<=740?28:32),header=page.querySelector('.site-header').getBoundingClientRect().height,footer=['.product-note','.public-links'].reduce((n,s)=>n+page.querySelector(s).getBoundingClientRect().height,0),height=hero.getBoundingClientRect().height;stage.style.paddingTop=Math.max(top,Math.round((win.innerHeight-header-footer-height+top-bottom)/2))+'px';};
 let frame=0;const schedule=()=>{if(!frame)frame=win.requestAnimationFrame(()=>{frame=0;update();});};
 win.addEventListener('resize',schedule);if(win.ResizeObserver){const observer=new win.ResizeObserver(schedule);for(const node of [hero,page.querySelector('.site-header'),page.querySelector('.product-note'),page.querySelector('.public-links')])observer.observe(node);}
 if(!page.querySelector('#gcUnifiedPanelHost'))page.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>selectPublicEntryLocale(doc,button.dataset.lang)));
 pinned.set(page,update);update();
}
export function mountPublicEntryShell(doc,host,panels) {
 let entry=documents.get(doc);
 if(entry){for(const panel of panels)if(panel.parentElement!==entry.slot)entry.slot.append(panel);return entry;}
 const wrap=doc.createElement('div');wrap.innerHTML=PUBLIC_ENTRY_HTML;const page=wrap.firstElementChild,slot=page.querySelector('#gcUnifiedPanelHost');
 for(const panel of panels)slot.append(panel);
 page.querySelector('.brand').href='/';
 host.append(page);
 const links=styles.map(href=>{const link=doc.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.gcPublicShellStyle='true';link.disabled=true;doc.head.append(link);return link;});
 entry={page,slot,links};documents.set(doc,entry);
 const locale=()=>{
  const lang=/^en/i.test(doc.documentElement.lang)?'en':'de',copy=PUBLIC_ENTRY_COPY[lang];
  page.querySelectorAll('[data-i18n]').forEach(node=>{const value=copy[node.dataset.i18n];if(value!==undefined)node.innerHTML=value;});
  page.querySelectorAll('[data-lang]').forEach(node=>{node.classList.toggle('is-active',node.dataset.lang===lang);node.setAttribute('aria-pressed',String(node.dataset.lang===lang));});
  page.querySelectorAll('a').forEach(a=>{const url=new URL(a.getAttribute('href'),doc.baseURI);if(lang==='en')url.searchParams.set('lang','en');else url.searchParams.delete('lang');if(a.matches('.login,.register')){const template=new URL(doc.URL).searchParams.get('template');if(template)url.searchParams.set('template',template);}a.href=url.href;});
 };
 page.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{selectPublicEntryLocale(doc,button.dataset.lang);locale();}));
 doc.defaultView.addEventListener('gradecrew:ui-locale-changed',locale);locale();
 // Paint only after the same homepage stylesheet stack has arrived.
 page.style.visibility='hidden';
 Promise.all(links.map(link=>new Promise(resolve=>{link.addEventListener('load',resolve,{once:true});link.addEventListener('error',resolve,{once:true});}))).then(()=>{pinPublicEntryFrame(doc,page);page.style.visibility='';});
 return entry;
}
export function setPublicEntryShellVisible(doc,visible) {
 const entry=documents.get(doc);if(!entry)return;
 doc.body.classList.toggle('gcUnifiedPublicShell',visible);
 entry.page.hidden=!visible;
 entry.links.forEach(link=>{link.disabled=!visible;});
}
