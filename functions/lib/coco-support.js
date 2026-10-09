'use strict';
const clean=(s,n=2000)=>String(s||'').replace(/[\u0000-\u0008]/g,'').slice(0,n);
function normalizeMemory(raw={}) {
 return {version:1,generation:Number.isInteger(raw.generation)&&raw.generation>=0?raw.generation:0,preferences:clean(raw.preferences),history:(Array.isArray(raw.history)?raw.history:[]).filter(m=>m&&['user','assistant'].includes(m.role)).slice(-40).map(m=>({role:m.role,text:clean(m.text,1400)})),lastSearch:clean(raw.lastSearch,500)};
}
function words(text) {return clean(text,4000).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').match(/[a-z0-9]+/g)||[];}
const stop=new Set('ich glaube hatte mal einen eine einem ein der die das den dem test tests quiz suche such finden finde erinnere erinnern mit und oder war drin als bild bilder ist es noch von zu fur bitte mein meine meinen meinem meiner wieder fruher glaub schauen gezeigt bildmotiv wir hatten find search my the a an with remember had once in it was image picture show please'.split(' '));
function stem(w){if(/^orang/.test(w))return 'orange';if(/^(?:drach|dragon)/.test(w))return 'dragon';return w.length>5?w.replace(/(?:ern|en|er|es|e|n)$/,''):w;}
function searchable(q){return [q.text,q.passage,q.imageAlt,q.imagePrompt,q.imageDescription,...(q.options||[]).flatMap(o=>[o.text,o.imageAlt,o.imagePrompt]),...(q.pairs||[]).flatMap(p=>[p.left,p.right])].filter(v=>typeof v==='string').join(' ');}
async function searchOwnedTests(repo,uid,query) {
 const terms=[...new Set(words(query).filter(w=>w.length>2&&!stop.has(w)).map(stem))].slice(-8);
 const quizzes=await repo.listOwned(uid);const matches=[];let unindexedImages=0,failures=0;
 if(!terms.length)return {matches,unindexedImages,failures,checked:0,truncated:quizzes.length>100};
 const checked=quizzes.filter(q=>!q.isDeleted&&!q.rightsHold).slice(0,100);
 for(let i=0;i<checked.length;i+=4)await Promise.all(checked.slice(i,i+4).map(async q=>{
  try{const questions=await repo.questions(q.id);const title=[q.title,q.subject,q.grade].join(' ');let hit=null;
   for(const item of questions){if(Number.isInteger(item.unindexedImageCount))unindexedImages+=item.unindexedImageCount;else if((item.imageUrl||item.imageSrc||item.imageDataUrl)&&(!item.imageAlt||item.imageAlt==="Abbildung zur Aufgabe")&&!item.imagePrompt&&!item.imageDescription)unindexedImages++;const text=searchable(item);const tokens=words(title+' '+text).map(stem);if(terms.every(t=>tokens.some(w=>w===t||w.startsWith(t)))){const images=Array.isArray(item.searchImages)?item.searchImages:[{src:item.imageDataUrl||item.imageUrl||item.imageSrc,description:item.imageAlt||""}];const score=img=>terms.filter(t=>words(img.description).map(stem).some(w=>w===t||w.startsWith(t))).length;const chosen=images.filter(img=>img.src).sort((a,b)=>score(b)-score(a))[0];const src=String(chosen?.src||"");hit={text:clean([chosen?.description,item.text||item.passage].filter(Boolean).join(" · "),220),imageUrl:src.length<=400000?src:""};break;}}
   if(hit||terms.every(t=>words(title).map(stem).includes(t)))matches.push({id:q.id,title:clean(q.title,200)||'Unbenannter Test',subject:clean(q.subject,80),grade:clean(q.grade,80),evidence:hit?.text||'Titel oder Fach passt.',imageUrl:hit?.imageUrl||''});
  }catch(_){failures++;}
 }));
 return {matches:matches.sort((a,b)=>a.title.localeCompare(b.title)).slice(0,12),unindexedImages,failures,checked:checked.length,truncated:quizzes.length>100};
}
async function memoryOperation(db,ref,data,stamp) {
 const op=data.operation||"read";
 if(op==="read")return normalizeMemory((await ref.get()).data());
 if(!["clear","preferences","remember"].includes(op))throw new Error("Unbekannte Gedächtnisaktion.");
 const expected=Number.isInteger(data.generation)&&data.generation>=0?data.generation:0;
 const turnId=String(data.turnId||"").slice(0,100);
 if(op==="remember"&&!/^[a-zA-Z0-9_-]{8,100}$/.test(turnId))throw new Error("Ungültiger Gesprächsschritt.");
 return db.runTransaction(async tx=>{
  const old=(await tx.get(ref)).data()||{};const current=normalizeMemory(old);
  if(op==="clear"){const cleared=normalizeMemory({generation:current.generation+1});tx.set(ref,{...cleared,turnIds:[],updatedAt:stamp()});return cleared;}
  if(expected!==current.generation)throw Object.assign(new Error("memory-reset"),{code:"memory-reset"});
  if(op==="preferences"){const preferences=normalizeMemory(data).preferences;tx.set(ref,{...old,...current,preferences,updatedAt:stamp()});return {preferences,generation:current.generation};}
  const ids=Array.isArray(old.turnIds)?old.turnIds:[];if(ids.includes(turnId))return {saved:true,generation:current.generation};
  const messages=normalizeMemory({history:data.messages}).history.slice(-2);
  tx.set(ref,{...normalizeMemory({...current,history:[...current.history,...messages]}),turnIds:[...ids,turnId].slice(-80),updatedAt:stamp()});
  return {saved:true,generation:current.generation};
 });
}
function ownedQuizRecord(snapshot){return {...snapshot.data(),id:snapshot.id};}
function quizSupportContext(id,q={}) {
 const stamp=typeof q.updatedAt?.toDate==="function"?q.updatedAt.toDate():null;
 return {id,title:clean(q.title,200),subject:clean(q.subject,80),classLevel:clean(q.grade,80),questionCount:q.questionCount!=null&&Number.isFinite(Number(q.questionCount))?Number(q.questionCount):null,published:q.published===true,ended:q.ended===true,audioQuestionCount:q.audioQuestionCount!=null&&Number.isFinite(Number(q.audioQuestionCount))?Number(q.audioQuestionCount):null,audioReady:typeof q.audioReady==="boolean"?q.audioReady:null,createdAt:typeof q.createdAt?.toDate==="function"?q.createdAt.toDate().toISOString():null,updatedAt:stamp instanceof Date&&!Number.isNaN(stamp.getTime())?stamp.toISOString():null};
}
function supportReportRows(uid,rows){
 const labels={new:"Offen",working:"In Bearbeitung",done:"Erledigt"};
 const categories={bug:"Problem",app_error:"Technischer Fehler",screenshot_error:"Screenshot-Hinweis",ai_question:"KI-Aufgabenrückmeldung"};
 return rows.filter(r=>r.userId===uid||(!r.userId&&r.authorId===uid)).slice(0,50).map(r=>({id:clean(r.id,100),category:categories[r.category]||"Rückmeldung",status:labels[r.status]||"Status unbekannt",testCode:/^[A-Z0-9]{4,40}$/.test(String(r.testCode||""))?r.testCode:"",createdAt:typeof r.createdAt?.toDate==="function"?r.createdAt.toDate().toISOString():null}));
}
module.exports={normalizeMemory,searchOwnedTests,memoryOperation,ownedQuizRecord,quizSupportContext,supportReportRows};
