'use strict';
const clean=(s,n=2000)=>String(s||'').replace(/[\u0000-\u0008]/g,'').slice(0,n);
function normalizeMemory(raw={}) {
 return {version:1,preferences:clean(raw.preferences),history:(Array.isArray(raw.history)?raw.history:[]).filter(m=>m&&['user','assistant'].includes(m.role)).slice(-40).map(m=>({role:m.role,text:clean(m.text,1400)})),lastSearch:clean(raw.lastSearch,500)};
}
function words(text) {return clean(text,4000).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').match(/[a-z0-9]+/g)||[];}
const stop=new Set('ich glaube hatte mal einen eine einem ein der die das den dem test tests quiz suche such finden finde erinnere erinnern mit und oder war drin als bild bilder ist es noch von zu fur bitte mein meine wir hatten'.split(' '));
function stem(w){if(/^orang/.test(w))return 'orange';if(/^(?:drach|dragon)/.test(w))return 'dragon';return w.length>5?w.replace(/(?:ern|en|er|es|e|n)$/,''):w;}
function searchable(q){return [q.text,q.passage,q.imageAlt,q.imagePrompt,q.imageDescription,...(q.options||[]).flatMap(o=>[o.text,o.imageAlt,o.imagePrompt]),...(q.pairs||[]).flatMap(p=>[p.left,p.right])].filter(v=>typeof v==='string').join(' ');}
async function searchOwnedTests(repo,uid,query) {
 const terms=[...new Set(words(query).filter(w=>w.length>2&&!stop.has(w)).map(stem))].slice(-8);
 const quizzes=await repo.listOwned(uid);const matches=[];let unindexedImages=0,failures=0;
 if(!terms.length)return {matches,unindexedImages,failures,checked:0,truncated:quizzes.length>100};
 const checked=quizzes.filter(q=>!q.isDeleted&&!q.rightsHold).slice(0,100);
 for(let i=0;i<checked.length;i+=4)await Promise.all(checked.slice(i,i+4).map(async q=>{
  try{const questions=await repo.questions(q.id);const title=[q.title,q.subject,q.grade].join(' ');let hit=null;
   for(const item of questions){if((item.imageUrl||item.imageSrc||item.imageDataUrl)&&(!item.imageAlt||item.imageAlt==="Abbildung zur Aufgabe")&&!item.imagePrompt&&!item.imageDescription)unindexedImages++;const text=searchable(item);const tokens=words(title+' '+text).map(stem);if(terms.every(t=>tokens.some(w=>w===t||w.startsWith(t)))){hit={text:clean([item.imageAlt,item.text||item.passage].filter(Boolean).join(" · "),220),imageUrl:(item.imageDataUrl&&item.imageDataUrl.length<=400000)?item.imageDataUrl:clean(item.imageUrl||item.imageSrc,1800)};break;}}
   if(hit||terms.every(t=>words(title).map(stem).includes(t)))matches.push({id:q.id,title:clean(q.title,200)||'Unbenannter Test',subject:clean(q.subject,80),grade:clean(q.grade,80),evidence:hit?.text||'Titel oder Fach passt.',imageUrl:hit?.imageUrl||''});
  }catch(_){failures++;}
 }));
 return {matches:matches.sort((a,b)=>a.title.localeCompare(b.title)).slice(0,12),unindexedImages,failures,checked:checked.length,truncated:quizzes.length>100};
}
async function memoryOperation(db,ref,data,stamp) {
 const op=data.operation||"read";
 if(op==="read")return normalizeMemory((await ref.get()).data());
 if(op==="clear"){await ref.delete();return normalizeMemory();}
 if(op==="preferences"){const preferences=normalizeMemory(data).preferences;await ref.set({preferences,updatedAt:stamp()},{merge:true});return {preferences};}
 if(op!=="remember")throw new Error("Unbekannte Gedächtnisaktion.");
 const turnId=String(data.turnId||"").slice(0,100);
 if(!/^[a-zA-Z0-9_-]{8,100}$/.test(turnId))throw new Error("Ungültiger Gesprächsschritt.");
 const messages=normalizeMemory({history:data.messages}).history.slice(-2);
 await db.runTransaction(async tx=>{const old=(await tx.get(ref)).data()||{};const ids=Array.isArray(old.turnIds)?old.turnIds:[];if(ids.includes(turnId))return;
 tx.set(ref,{...normalizeMemory({...old,history:[...(old.history||[]),...messages]}),turnIds:[...ids,turnId].slice(-80),updatedAt:stamp()});});
 return {saved:true};
}
module.exports={normalizeMemory,searchOwnedTests,memoryOperation};
