export function mountChapterCreation({root,counts,points}) {
  const doc=root.ownerDocument;let enabled=false;let rows=[];
  const node=(tag,text,attrs={})=>{const e=doc.createElement(tag);e.textContent=text;for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
  const totals=()=>{counts.readOnly=points.readOnly=enabled;if(enabled){counts.value=rows.reduce((s,r)=>s+Number(r.count||0),0);points.value=rows.reduce((s,r)=>s+Number(r.points||0),0);}counts.dispatchEvent(new doc.defaultView.Event('input'));};
  function render(){
    root.replaceChildren();const label=node('label','In Kapitel gliedern',{class:'checkRow'});const check=node('input','',{type:'checkbox','data-creation-chapters':''});check.checked=enabled;label.prepend(check);root.append(label);
    check.addEventListener('change',()=>{enabled=check.checked;if(enabled&&!rows.length)rows=[{id:`ch_${crypto.randomUUID()}`,title:'Kapitel 1',topic:'',count:Number(counts.value)||3,points:Number(points.value)||6}];render();totals();});
    if(!enabled)return;
    root.append(node('p','Gesamtzahl und Gesamtpunkte ergeben sich aus deinen Kapiteln. Die weiteren Einstellungen gelten für den ganzen Test.',{class:'hint'}));
    rows.forEach((r,index)=>{const row=node('div','',{class:'chapterEditorRow'});for(const[key,caption,type]of[['title','Kapiteltitel','text'],['topic','Thema','text'],['count','Aufgaben','number'],['points','Punkte','number']]){const label=node('label',caption);const input=node('input','',{type,'aria-label':`${caption} Kapitel ${index+1}`});input.value=r[key];if(type==='number'){input.min=key==='count'?'1':'0.5';input.step=key==='count'?'1':'0.5';}else input.maxLength=key==='title'?120:500;input.addEventListener('input',()=>{r[key]=type==='number'?Number(input.value):input.value;totals();});label.append(input);row.append(label);}const remove=node('button','Entfernen',{type:'button'});remove.disabled=rows.length===1;remove.addEventListener('click',()=>{rows.splice(index,1);render();totals();});row.append(remove);root.append(row);});
    const add=node('button','+ Kapitel hinzufügen',{type:'button',class:'button secondary'});add.disabled=rows.length>=100;add.addEventListener('click',()=>{rows.push({id:`ch_${crypto.randomUUID()}`,title:`Kapitel ${rows.length+1}`,topic:'',count:3,points:6});render();totals();});root.append(add);
  }
  render();
  return {reset(){enabled=false;rows=[];counts.readOnly=points.readOnly=false;render();},getPlan(){if(!enabled)return {};if(rows.some(r=>!r.title.trim()||!r.topic.trim()||!Number.isInteger(r.count)||r.count<1||r.points<r.count/2||!Number.isInteger(r.points*2)))throw new Error('Bitte Titel, Thema, Aufgabenanzahl und Punkte jedes Kapitels prüfen.');return {chapterSchemaVersion:1,chapters:rows.map((r,i)=>({id:r.id,title:r.title.trim(),position:i+1})),chapterPlan:rows.map(r=>({chapterId:r.id,topic:r.topic.trim(),count:r.count,points:r.points,materialIds:[]}))};}};
}
