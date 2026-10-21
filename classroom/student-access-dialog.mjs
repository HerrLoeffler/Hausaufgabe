import {buildPrintDocument} from './pupil-print.mjs';
export function openStudentAccess({document:doc,client,state,students,isCurrent,onClose}){
 let closed=false,busy=false,status=null,frame=null,layout='list',approval=false,error='',notice='';
 const make=(tag,text,attrs={})=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
 const dialog=make('dialog',undefined,{class:'classroomDialog accessDialog','data-access-dialog':'','data-telemetry-private':'true','aria-label':'Schülerzugänge und Drucken'});doc.body.append(dialog);
 const selection={contextId:state.contextId,studentIds:students.map(s=>s.id),expectedRevision:state.revision};
 const button=(label,fn,attrs={})=>{const b=make('button',label,{type:'button',class:'button ghost',...attrs});b.disabled=busy;b.addEventListener('click',fn);return b;};
 function destroy(){closed=true;frame?.remove();dialog.remove();onClose?.();}
 async function request(command,extra={},success=''){
  if(busy||closed||!isCurrent())return;busy=true;error='';render();
  try{const result=await client.request(command,{...selection,...extra});if(closed||!isCurrent())return;
   if(command==='print'){showPrint(result);return;}status=result;notice=success;approval=false;
  }catch(e){if(closed||!isCurrent())return;error=e.message;}
  finally{busy=false;if(!closed&&isCurrent()&&!frame)render();}
 }
 function showPrint(result){
  const data=buildPrintDocument({rows:result.rows,layout,title:students.length===1?`${students[0].firstName} ${students[0].lastName}`:'Schülerliste',loginUrl:doc.location.origin+'/?student=1'});
  busy=false;dialog.replaceChildren();const head=make('div',undefined,{class:'classroomDialogHead'});head.append(make('h2','Druckvorschau'),button('Schließen',destroy));dialog.append(head,make('p',`${data.personCount} Personen · ${data.pageCount} ${data.pageCount===1?'Seite':'Seiten'}`,{role:'status','data-access-pages':''}));
  frame=make('iframe',undefined,{title:'Druckvorschau Schülerzugänge',class:'accessPrintFrame',sandbox:'allow-same-origin allow-modals'});frame.srcdoc=data.html;dialog.append(frame);
  const print=button('Drucken',()=>{frame.contentWindow?.focus();frame.contentWindow?.print();},{class:'button primary','data-access-print':''});
  dialog.append(button('Anderes Format',()=>{frame.remove();frame=null;render();}),print);busy=false;
 }
 function render(){
  dialog.replaceChildren();const head=make('div',undefined,{class:'classroomDialogHead'});head.append(make('h2','Schülerzugänge & Drucken'),button('Schließen',()=>{if(!busy)destroy();}));dialog.append(head,make('p',`${students.length} ${students.length===1?'ausgewählte Person':'ausgewählte Personen'} · Auf diesem Mac`));
  if(error)dialog.append(make('p',error,{class:'classroomError',role:'alert'}));if(notice)dialog.append(make('p',notice,{role:'status'}));
  if(!status){dialog.append(make('p',busy?'Zugänge werden geladen …':'Zugänge konnten nicht geladen werden.'));if(!busy)dialog.append(button('Erneut laden',()=>request('statuses')));return;}
  dialog.append(make('p',`${status.counts.active} aktive Zugänge · ${status.counts.missing} fehlen · ${status.counts.blocked} gesperrt`,{'data-access-counts':''}));
  if(status.counts.missing){
   const label=make('label',undefined,{class:'classroomCheck'}),check=make('input',undefined,{type:'checkbox','data-access-approval':''});check.checked=approval;label.append(check,make('span',`${status.counts.missing} fehlende Zugänge erstellen. Bestehende Codes bleiben erhalten.`));dialog.append(label);
   const issue=button('Fehlende Zugänge erstellen',()=>request('issue',{operationId:crypto.randomUUID()},'Zugänge erstellt. Du kannst dieselben Codes jederzeit erneut drucken.'),{class:'button primary','data-access-issue':''});issue.disabled=busy||!approval;
   check.addEventListener('change',()=>{approval=check.checked;issue.disabled=busy||!approval;});dialog.append(issue);
  }
  if(students.length===1&&status.rows[0]?.version){
   const row=status.rows[0],label=make('label',undefined,{class:'classroomCheck'}),check=make('input',undefined,{type:'checkbox'});label.append(check,make('span','Bisherigen Zugang und bestehende Schülersitzungen ungültig machen.'));dialog.append(label);
   const rotate=button('Neuen Code erstellen',()=>request('rotate',{expectedVersion:row.version,operationId:crypto.randomUUID()},'Neuer Zugang erstellt. Der alte Code funktioniert nicht mehr.'),{'data-access-rotate':''}),block=button('Zugang sperren',()=>request('block',{expectedVersion:row.version,operationId:crypto.randomUUID()},'Zugang gesperrt.'));
   rotate.disabled=block.disabled=true;check.addEventListener('change',()=>{rotate.disabled=busy||!check.checked;block.disabled=busy||!check.checked||row.status==='blocked';});dialog.append(rotate,block);
  }
  const label=make('label','Druckformat'),select=make('select',undefined,{'data-access-layout':''});
  for(const[value,title]of [['list','Klassenliste mit Codes'],['names','Namensliste ohne Codes'],['cards','Mehrere Zugangskarten pro Blatt'],['single','Eine Person pro Seite']])select.append(make('option',title,{value}));select.value=layout;label.append(select);dialog.append(label);
  const preview=button('Druckvorschau öffnen',()=>request('print',{layout,includeCodes:layout!=='names'}),{class:'button primary','data-access-preview':''});preview.disabled=busy||(layout!=='names'&&(status.counts.missing>0||status.counts.blocked>0));
  select.addEventListener('change',()=>{layout=select.value;preview.disabled=busy||(layout!=='names'&&(status.counts.missing>0||status.counts.blocked>0));});dialog.append(preview,make('p','Die Auswahl umfasst alle gefilterten Personen, auch auf weiteren Listenseiten. Drucken ändert keine Codes.',{class:'hint'}));
 }
 dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});dialog.addEventListener('close',destroy);render();if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');void request('statuses');return {destroy};
}
