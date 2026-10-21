export function mountChapterCreation({root,counts,points,onPlan,getContextKey=()=>''}) {
  const doc=root.ownerDocument;let enabled=false,rows=[],busy=false,message='',revision=0,serial=0,pending=null,lastContext=null,manualEdited=false;
  const node=(tag,text,attrs={})=>{const e=doc.createElement(tag);e.textContent=text;for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
  const changed=()=>{revision++;manualEdited=true;};
  const valid=()=>rows.length>0&&rows.every(r=>r.title.trim()&&r.topic.trim()&&Number.isInteger(r.count)&&r.count>=1&&r.count<=100&&r.points>=r.count/2&&Number.isInteger(r.points*2));
  const totals=()=>{counts.readOnly=points.readOnly=enabled;if(enabled){counts.value=rows.reduce((s,r)=>s+Number(r.count||0),0);points.value=rows.reduce((s,r)=>s+Number(r.points||0),0);}counts.dispatchEvent(new doc.defaultView.Event('input'));};
  function acceptPlan(result,count,totalPoints){
    if(result?.status!=='chapterPlan'||result.chapterSchemaVersion!==1||!Array.isArray(result.chapters)||!result.chapters.length||result.chapters.length>100||!Array.isArray(result.chapterPlan)||result.chapterPlan.length!==result.chapters.length)throw Error('Remy hat keinen vollständigen Kapitelplan zurückgegeben.');
    const ids=new Set();const next=result.chapters.map(ch=>{const p=result.chapterPlan.find(p=>p.chapterId===ch.id);if(!/^ch_[A-Za-z0-9_-]{1,64}$/.test(ch.id)||ids.has(ch.id)||typeof ch.title!=='string'||!ch.title.trim()||ch.title.length>120||typeof p?.topic!=='string'||!p.topic.trim()||p.topic.length>500||!Number.isInteger(p.count)||p.count<1||!Number.isInteger(p.points*2)||p.points<p.count/2)throw Error('Der Kapitelplan ist unvollständig. Bitte erneut planen.');ids.add(ch.id);return {id:ch.id,title:ch.title.trim(),topic:p.topic.trim(),count:p.count,points:p.points};});
    if(next.reduce((s,r)=>s+r.count,0)!==count||next.reduce((s,r)=>s+r.points,0)!==totalPoints)throw Error('Kapitelplan und Gesamtvorgaben stimmen nicht überein.');return next;
  }
  function plan(){
    if(pending)return pending;
    if(typeof onPlan!=='function')return Promise.reject(Error('Automatische Kapitelplanung ist hier nicht verfügbar.'));
    const request=++serial,atRevision=revision,context=getContextKey(),count=Number(counts.value),totalPoints=Number(points.value);busy=true;message='Remy plant deine Kapitel …';render();
    const job=(async()=>{try{
      const response=await Promise.resolve().then(onPlan);
      if(request!==serial||!enabled||atRevision!==revision||context!==getContextKey())throw Error('Deine Angaben wurden während der Planung geändert. Bitte erneut planen.');
      const next=acceptPlan(response,count,totalPoints);rows=next;manualEdited=false;
      message=response.pedagogicalContext?.profileCount>0?'Passende geprüfte Lehrplanhinweise wurden berücksichtigt. Du kannst den Plan bearbeiten.':'Kein passender geprüfter Lehrplankontext gefunden. Der Plan orientiert sich an deinem Auftrag; bitte fachlich prüfen.';
      totals();lastContext=getContextKey();return response;
    }catch(error){if(request===serial)message=error.message||'Kapitelplanung fehlgeschlagen.';throw error;}finally{if(request===serial){busy=false;pending=null;render();}}})();pending=job;return job;
  }
  function render(){
    root.replaceChildren();const label=node('label','In Kapitel gliedern',{class:'checkRow'});const check=node('input','',{type:'checkbox','data-creation-chapters':''});check.checked=enabled;label.prepend(check);root.append(label);
    check.addEventListener('change',()=>{revision++;enabled=check.checked;if(enabled&&!rows.length)rows=[{id:`ch_${crypto.randomUUID()}`,title:'Kapitel 1',topic:'',count:Number(counts.value)||3,points:Number(points.value)||6}];render();totals();});
    if(!enabled)return;
    root.append(node('p','Ein Fach, mehrere Themenbereiche. Dein Text- oder Sprachauftrag gilt für den gesamten Test und alle Kapitel.',{class:'hint'}));
    if(onPlan){const action=node('button',busy?'Remy plant …':'Kapitel mit Remy planen',{type:'button',class:'button secondary','data-plan-chapters':''});action.disabled=busy;action.addEventListener('click',()=>{void plan().catch(()=>{});});root.append(action);const status=node('p',message,{role:'status','aria-live':'polite',class:'hint'});root.append(status);}
    rows.forEach((r,index)=>{const row=node('div','',{class:'chapterEditorRow'});for(const[key,caption,type]of[['title','Kapiteltitel','text'],['topic','Thema','text'],['count','Aufgaben','number'],['points','Punkte','number']]){const label=node('label',caption);const input=node('input','',{type,'aria-label':`${caption} Kapitel ${index+1}`});input.value=r[key];if(type==='number'){input.min=key==='count'?'1':'0.5';input.step=key==='count'?'1':'0.5';}else input.maxLength=key==='title'?120:500;input.addEventListener('input',()=>{changed();r[key]=type==='number'?Number(input.value):input.value;totals();});label.append(input);row.append(label);}const remove=node('button','Entfernen',{type:'button',class:'button ghost'});remove.disabled=rows.length===1;remove.addEventListener('click',()=>{changed();rows.splice(index,1);render();totals();});row.append(remove);root.append(row);});
    const add=node('button','+ Kapitel hinzufügen',{type:'button',class:'button secondary'});add.disabled=rows.length>=100;add.addEventListener('click',()=>{changed();rows.push({id:`ch_${crypto.randomUUID()}`,title:`Kapitel ${rows.length+1}`,topic:'',count:3,points:6});render();totals();});root.append(add);
  }
  function getPlan(){if(!enabled)return {};if(!valid())throw Error('Bitte Titel, Thema, Aufgabenanzahl und Punkte jedes Kapitels prüfen oder mit Remy planen.');return {chapterSchemaVersion:1,chapters:rows.map((r,i)=>({id:r.id,title:r.title.trim(),position:i+1})),chapterPlan:rows.map(r=>({chapterId:r.id,topic:r.topic.trim(),count:r.count,points:r.points,materialIds:[]}))};}
  render();
  return {reset(){serial++;revision++;pending=null;busy=false;enabled=false;rows=[];message='';lastContext=null;manualEdited=false;counts.readOnly=points.readOnly=false;render();},getPlan,async ensurePlan(){if(!enabled)return;if(pending)return pending;if(!valid()||lastContext!==null&&!manualEdited&&getContextKey()!==lastContext)await plan();return getPlan();}};
}
