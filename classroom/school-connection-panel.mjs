function node(doc,tag,text,classes){const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(classes)n.className=classes;return n;}
function choice(doc,form,label,name,items){const wrap=node(doc,'label',label),select=node(doc,'select');select.name=name;select.required=true;for(const item of [{id:'',name:'Bitte auswählen'},...items]){const o=node(doc,'option',item.name);o.value=item.id;select.append(o);}wrap.append(select);form.append(wrap);return select;}
export function mountSchoolConnectionPanel({host,workspace,api,onSchoolChange=async()=>{},onClassesChanged=async()=>{}}){
 const doc=host.ownerDocument;host.classList.add('gcSchoolConnection');let busy=false;
 const message=node(doc,'p',undefined,'gcOnlineError');message.setAttribute('role','alert');message.hidden=true;
 const run=async(button,work)=>{if(busy)return;busy=true;button.disabled=true;message.hidden=true;try{await work();}catch(error){if(host.isConnected){message.textContent=error.message||'Bitte erneut versuchen.';message.hidden=false;}}finally{busy=false;button.disabled=false;}};
 function save(form,label,work){const b=node(doc,'button',label,'button primary');b.type='submit';form.append(b);form.onsubmit=e=>{e.preventDefault();if(form.reportValidity())void run(b,work);};return b;}
 if((workspace.schools||[]).length>1||!workspace.school&&(workspace.schools||[]).length){const form=node(doc,'form',undefined,'gcOnlineForm');const current=choice(doc,form,'Schule auswählen','currentSchool',workspace.schools);current.value=workspace.school?.id||'';save(form,'Schule öffnen',()=>onSchoolChange(current.value));host.append(form);}
 const manageable=(workspace.availableBillingSchools||[]).filter(s=>s.canManage);
 if(!workspace.school?.canonicalSchoolId&&manageable.length){
  const form=node(doc,'form',undefined,'card gcOnlineForm');form.append(node(doc,'h2','Schule verbinden'));
  const school=choice(doc,form,'Schule aus der Schulverwaltung','billingSchool',manageable);
  if(workspace.school)form.append(node(doc,'p',`Vorhandener Bestand: ${workspace.school.name}. Die Klassen, Schüler und persönlichen Zugangscodes bleiben erhalten.`));
  const label=node(doc,'label',undefined,'gcSchoolCheck'),confirm=node(doc,'input');confirm.type='checkbox';confirm.name='confirmSchoolConnection';confirm.required=true;label.append(confirm,node(doc,'span',workspace.school?'Ich möchte diesen vorhandenen Klassenbestand der ausgewählten Schule zuordnen.':'Ich möchte die Klassenverwaltung für die ausgewählte Schule einrichten.'));form.append(label);
  save(form,'Schule verbindlich zuordnen',async()=>{const result=await api.teacher('connectSchool',{billingSchoolId:school.value,useExistingSchool:Boolean(workspace.school),confirm:confirm.checked});if(host.isConnected)await onSchoolChange(result.schoolId);});host.append(form);
 }
 for(const school of (workspace.availableBillingSchools||[]).filter(s=>!s.canManage)){host.append(node(doc,'p',`${school.name}: Die Schulverwaltung muss den gemeinsamen Klassenbestand noch verbinden.`));}
 if(workspace.school&&workspace.role==='teacher'){
  const details=node(doc,'details'),catalog=workspace.classCatalog||[],selected=catalog.filter(c=>c.selected).length;details.open=selected===0;details.append(node(doc,'summary',`Meine Klassen auswählen (${selected})`));
  const form=node(doc,'form',undefined,'gcOnlineForm'),searchLabel=node(doc,'label','Klassen suchen'),search=node(doc,'input');search.type='search';search.placeholder='Klasse oder Schuljahr';searchLabel.append(search);form.append(searchLabel);
  form.append(node(doc,'p','Wähle die Klassen, in denen du unterrichtest. Erst danach siehst du deren Schüler und kannst eigene Tests zuweisen.'));
  const list=node(doc,'div',undefined,'gcSchoolClassChoices'),checks=[];
  for(const c of catalog){const label=node(doc,'label',undefined,'gcSchoolCheck'),check=node(doc,'input');check.type='checkbox';check.value=c.id;check.checked=c.selected===true;label.append(check,node(doc,'span',`${c.name} · ${c.year}`));list.append(label);checks.push({check,label,text:`${c.name} ${c.year}`.toLocaleLowerCase('de')});}
  const empty=node(doc,'p',catalog.length?'Keine passende Klasse.':'Es wurden noch keine Klassen angelegt.');empty.hidden=catalog.length>0;list.append(empty);form.append(list);
  search.oninput=()=>{const term=search.value.trim().toLocaleLowerCase('de');for(const c of checks)c.label.hidden=!c.text.includes(term);empty.hidden=checks.some(c=>!c.label.hidden);};
  save(form,'Meine Klassen speichern',async()=>{await api.teacher('setTeacherClasses',{classIds:checks.filter(c=>c.check.checked).map(c=>c.check.value)});if(host.isConnected)await onClassesChanged();});details.append(form);host.append(details);
 }
 host.append(message);host.hidden=host.children.length===1;
}
