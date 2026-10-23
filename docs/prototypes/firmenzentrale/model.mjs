export function parseRoute(hash='') {
  try {
    const [page,section='',id='',tab='ueberblick']=hash.replace(/^#\/?/,'').split('/').map(decodeURIComponent);
    if(!['heute','eingang','arbeit','wissen','verbindungen','suche'].includes(page))return {page:'heute',section:'',id:'',tab:'ueberblick'};
    return {page,section,id,tab};
  } catch { return {page:'heute',section:'',id:'',tab:'ueberblick'}; }
}
export function searchTopics(topics,query='',area='all') {
  const q=query.trim().toLocaleLowerCase('de');
  return topics.filter(t=>(area==='all'||t.area===area||t.relatedAreas?.includes(area))&&JSON.stringify(t).toLocaleLowerCase('de').includes(q));
}
export function progress(milestones) {
  if(!milestones.length||milestones.some(m=>!Number.isFinite(m.weight)||m.weight<=0))return null;
  return 100*milestones.filter(m=>m.accepted===true).reduce((n,m)=>n+m.weight,0)/milestones.reduce((n,m)=>n+m.weight,0);
}
export function safeLink(value) {
  try {const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}
}
export function validateDraft(d) {
  if(!d||typeof d.title!=='string'||!d.title.trim()||d.title.length>160)return {ok:false,error:'Bitte einen Titel mit höchstens 160 Zeichen eingeben.'};
  if(typeof d.body!=='string'||d.body.length>12000)return {ok:false,error:'Die Notiz darf höchstens 12.000 Zeichen enthalten.'};
  if(!['strategy','product','pedagogy','tech','customers','market','finance','legal','privacy'].includes(d.area))return {ok:false,error:'Bitte einen gültigen Bereich wählen.'};
  return {ok:true};
}
const KEY='gradecrew-company-personal-drafts-v1';
export function readDrafts(storage) {
  try {
    const raw=storage.getItem(KEY);if(!raw)return {ok:true,items:[]};
    const doc=JSON.parse(raw);
    if(doc.version!==1||!Array.isArray(doc.items)||doc.items.some(d=>!validateDraft(d).ok||typeof d.id!=='string'||typeof d.updatedAt!=='string')||new Set(doc.items.map(d=>d.id)).size!==doc.items.length)throw Error('schema');
    return {ok:true,items:doc.items};
  }catch{return {ok:false,items:[],error:'Lokale Entwürfe konnten nicht gelesen werden. Der vorhandene Speicher wurde nicht verändert.'};}
}
export function writeDrafts(storage,items) {
  try {if(items.some(d=>!validateDraft(d).ok))throw Error('invalid');storage.setItem(KEY,JSON.stringify({version:1,items}));return {ok:true};}
  catch{return {ok:false,error:'Speichern auf diesem Gerät fehlgeschlagen. Bitte den Text herunterladen; er bleibt im geöffneten Formular erhalten.'};}
}
