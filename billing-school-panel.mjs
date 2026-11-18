import {mountSchoolJoinCodeForm,mountSchoolJoinCodeManagement} from './school-join-code-panel.mjs';
const dates = value => value ? new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium'}).format(new Date(value)) : 'noch offen';
const roles = {teacher:'Lehrkraft',school_admin:'Schulverwaltung',billing:'Rechnungsstelle ohne Lehrkraftplatz'};
function node(doc,tag,text,classes){const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(classes)el.className=classes;return el;}
function field(doc,form,label,name,type='text'){const wrap=node(doc,'label',label),input=node(doc,'input');input.name=name;input.type=type;input.required=true;wrap.append(input);form.append(wrap);return input;}
function button(doc,parent,label,action,primary=false){const el=node(doc,'button',label,primary?'button primary':'button secondary');el.type='button';el.onclick=action;parent.append(el);return el;}
function roleSelect(doc,form){const wrap=node(doc,'label','Rolle'),select=node(doc,'select');select.name='role';for(const[value,label]of Object.entries(roles)){const option=node(doc,'option',label);option.value=value;select.append(option);}wrap.append(select);form.append(wrap);return select;}
function invitationToken(value){const trimmed=value.trim();if(/^[a-f0-9]{64}\.[A-Za-z0-9_-]{43}$/.test(trimmed))return trimmed;try{return new URLSearchParams(new URL(trimmed).hash.slice(1)).get('school-invite')||'';}catch{return '';}}

export async function mountSchoolPanel(root,{client,uid,targetPersonId,onError=()=>{},initialInvitation=''}={}){
  const doc=root.ownerDocument,ticket=Symbol();root.schoolPanelTicket=ticket;
  const current=()=>root.isConnected&&root.schoolPanelTicket===ticket;
  root.replaceChildren();root.className='card billingPanel billingSchools';root.append(node(doc,'h2',targetPersonId?'Schulzuordnung der Lehrkraft':'Deine Schule'));
  const message=node(doc,'p',undefined,'hint');message.setAttribute('role','status');message.setAttribute('aria-live','polite');root.append(message);
  const report=error=>{if(current()){message.textContent=error.message||'Die Schulverwaltung konnte nicht geladen werden.';onError(error);}};
  async function run(button,work){button.disabled=true;try{await work();}catch(error){report(error);}finally{if(button.isConnected)button.disabled=false;}}
  try{
    const result=await client.request('listSchools');if(!current())return;
    const schools=Array.isArray(result.schools)?result.schools:[];
    if(!schools.length)root.append(node(doc,'p','Diesem Konto ist noch keine Schule zugeordnet. Mit dem Schulcode verbindest du deinen bestehenden Zugang.'));
    if(result.hasMore)root.append(node(doc,'p','Es werden die ersten 50 Schulen angezeigt. Weitere Schulen sind in dieser Testansicht noch nicht auswählbar.','hint'));
    const details=node(doc,'div');
    for(const school of schools){const b=button(doc,root,school.name,()=>run(b,()=>openSchool(school.id)));b.dataset.school=school.id;}
    root.append(details);
    async function openSchool(schoolId){
      const view=await client.request('getSchool',{schoolId});if(!current())return;
      details.replaceChildren(node(doc,'h3',view.school.name));
      const paid=view.period?.paymentStatus==='paid';
      details.append(node(doc,'p',`${view.school.usedSeats} von ${view.school.seats} Plätzen belegt · ${view.school.reservedSeats} reserviert`),node(doc,'p',`${paid?'Bezahlt':'Zahlung offen'} · Laufzeitende ${dates(view.period?.endsAtMs)} · Verlängerung nur nach Bestätigung`));
      details.append(node(doc,'p','Der Schulplatz erweitert den persönlichen Zugang. Tests bleiben ausschließlich für ihre jeweilige Lehrkraft zugänglich.','hint'));
      if(view.canBill&&Number.isInteger(view.period?.amountMinor))details.append(node(doc,'p',new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(view.period.amountMinor/100)+' je Schuljahr, einschließlich Umsatzsteuer'));
      if(view.canBill&&Number.isInteger(view.period?.remainingMinor)&&!paid)details.append(node(doc,'p',new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(view.period.remainingMinor/100)+' noch offen'));
      if(view.canBill){
        const result=node(doc,'div');details.append(result);
        const showInvoice=url=>{const target=new URL(url);if(target.protocol!=='https:'||target.hostname!=='invoice.stripe.com')throw new Error('Ungültiger Rechnungslink.');const link=node(doc,'a','Schulrechnung öffnen','button secondary');link.href=target.href;link.target='_blank';link.rel='noopener noreferrer';link.dataset.action='open-school-invoice';result.replaceChildren(link);};
        if(view.period?.invoiceUrl)showInvoice(view.period.invoiceUrl);
        else if(view.paymentsEnabled&&!paid){const invoice=button(doc,details,'Testrechnung vorbereiten',()=>run(invoice,async()=>{const value=await client.request('schoolInvoice',{schoolId,requestId:crypto.randomUUID()});if(current()){showInvoice(value.url);message.textContent='Testrechnung vorbereitet. Es wurde keine E-Mail verschickt.';}}));invoice.dataset.action='school-invoice';}
      }
      if(!view.canManage){
        if(uid&&roles[view.myRole]){const leave=button(doc,details,'Schule verlassen',()=>{if(!doc.defaultView.confirm('Die Zuordnung zu '+view.school.name+' wirklich beenden?'))return;void run(leave,async()=>{await client.request('removeSchoolMember',{schoolId,personId:uid,reason:'Selbstaustritt über Kontoeinstellungen'});await client.refresh();if(current())await mountSchoolPanel(root,{client,uid,onError});});});leave.dataset.action='leave-school';}
        return;
      }
      const codeManagement=node(doc,"section");details.append(codeManagement);mountSchoolJoinCodeManagement(codeManagement,{client,schoolId,joinCode:view.joinCode,onError});
      for(const member of view.members||[]){
        const row=node(doc,'div',undefined,'billingGrantRow');row.append(node(doc,'span',`${member.email} · ${roles[member.role]||member.role}`));
        const remove=button(doc,row,'Zuordnung beenden',()=>{const reason=doc.defaultView.prompt('Grund für das Beenden der Schulzuordnung:');if(!reason?.trim())return;void run(remove,async()=>{await client.request('removeSchoolMember',{schoolId,personId:member.personId,reason});await client.refresh();await openSchool(schoolId);});});details.append(row);
      }
      for(const invitation of view.invitations||[]){const row=node(doc,'div',undefined,'billingGrantRow');row.append(node(doc,'span',`${invitation.email} · Einladung bis ${dates(invitation.expiresAtMs)}`));const revoke=button(doc,row,'Einladung widerrufen',()=>run(revoke,async()=>{await client.request('revokeSchoolInvitation',{schoolId,invitationId:invitation.id});await openSchool(schoolId);}));details.append(row);}
      const form=node(doc,'form',undefined,'billingGrantForm');form.append(node(doc,'h4','Persönliche Einladung'));
      const email=field(doc,form,'E-Mail-Adresse der eingeladenen Person','email','email'),role=roleSelect(doc,form),send=node(doc,'button','Einladungslink erstellen','button primary');send.type='submit';form.append(send);const targeted=node(doc,"details");targeted.append(node(doc,"summary","Einzelne Person gezielt einladen"),form);details.append(targeted);
      const invitationResult=node(doc,'div');targeted.append(invitationResult);
      form.onsubmit=event=>{event.preventDefault();if(!form.reportValidity())return;void run(send,async()=>{const invite=await client.request('inviteSchoolMember',{schoolId,email:email.value,role:role.value,requestId:crypto.randomUUID()});if(!current())return;
        invitationResult.replaceChildren();if(!invite.token){invitationResult.append(node(doc,'p','Der Link wurde schon erstellt. Bitte die Einladung widerrufen und neu ausstellen.'));return;}
        const url=new URL(doc.defaultView.location.href);url.search='';url.hash=new URLSearchParams({'school-invite':invite.token}).toString();
        const wrap=node(doc,'label','Persönlicher Einladungslink'),link=node(doc,'textarea');link.readOnly=true;link.value=url.href;link.rows=3;wrap.append(link);invitationResult.append(wrap,node(doc,'p','Diesen Link ausschließlich an die eingeladene Person weitergeben. Er gilt sieben Tage. Es wurde noch keine E-Mail verschickt.','hint'));link.focus();link.select();});};
    }
    if(targetPersonId&&result.canCreate&&schools.length){
      const form=node(doc,'form',undefined,'billingGrantForm'),select=node(doc,'select');select.setAttribute('aria-label','Schule auswählen');for(const school of schools){const option=node(doc,'option',school.name);option.value=school.id;select.append(option);}form.append(node(doc,'h3','Bestehender Schule zuordnen'),select);
      const role=roleSelect(doc,form),reason=field(doc,form,'Grund der Zuordnung','assignmentReason'),save=node(doc,'button','Lehrkraft zuordnen','button primary');save.type='submit';form.append(save);root.append(form);
      form.onsubmit=event=>{event.preventDefault();if(!form.reportValidity())return;void run(save,async()=>{await client.request('assignSchoolMember',{schoolId:select.value,personId:targetPersonId,role:role.value,reason:reason.value,requestId:crypto.randomUUID()});message.textContent='Schulzuordnung gespeichert.';await openSchool(select.value);});};
    }
    if(result.canCreate){
      const form=node(doc,'form',undefined,'billingGrantForm');form.append(node(doc,'h3','Schule vorbereiten'));
      const name=field(doc,form,'Schulname','schoolName'),seats=field(doc,form,'Anzahl der Lehrkraftplätze','seats','number'),start=field(doc,form,'Vereinbartes Startdatum','startDate','date');seats.min='1';seats.max='500';seats.value='1';
      form.append(node(doc,'p','50 € pro Platz und Jahr einschließlich Umsatzsteuer. Das Anlegen erzeugt noch keine Rechnung und schaltet keinen bezahlten Zugang frei.','hint'));
      const create=node(doc,'button','Schule als Entwurf anlegen','button primary');create.type='submit';create.dataset.action='create-school';form.append(create);root.append(form);
      form.onsubmit=event=>{event.preventDefault();if(!form.reportValidity())return;void run(create,async()=>{const made=await client.request('createSchool',{name:name.value,seats:Number(seats.value),startDate:start.value,ownerId:targetPersonId||uid,requestId:crypto.randomUUID()});message.textContent='Schule vorbereitet. Rechnung und Zahlung sind noch offen.';await openSchool(made.schoolId);});};
    }
    if(!targetPersonId){
      const schoolCode=node(doc,"section");root.append(schoolCode);mountSchoolJoinCodeForm(schoolCode,{client,onError,onJoined:async()=>{if(current()){await mountSchoolPanel(root,{client,uid,onError});const notice=node(doc,"p","Die Schulzuordnung ist gespeichert.","hint");root.append(notice);}}});
      const form=node(doc,'form',undefined,'billingGrantForm');form.append(node(doc,'h3','Einladung annehmen'));
      const input=field(doc,form,'Persönlichen Einladungslink einfügen','invitation');input.value=initialInvitation;input.autocomplete='off';
      const review=node(doc,'button','Einladung prüfen','button secondary');review.type='submit';review.dataset.action='preview';form.append(review);const targeted=node(doc,"details");targeted.open=Boolean(initialInvitation);targeted.append(node(doc,"summary","Persönlichen Einladungslink verwenden"),form);root.append(targeted);const preview=node(doc,'div');targeted.append(preview);
      input.oninput=()=>preview.replaceChildren();
      form.onsubmit=event=>{event.preventDefault();const token=invitationToken(input.value);if(!token){report(new Error('Bitte einen gültigen Einladungslink einfügen.'));return;}void run(review,async()=>{
        const invitation=await client.request('previewSchoolInvitation',{token});if(!current())return;preview.replaceChildren(node(doc,'p',`${invitation.schoolName} · ${roles[invitation.role]||invitation.role} · Laufzeitende ${dates(invitation.endsAtMs)}`));
        const accept=button(doc,preview,'Dieser Schule beitreten',()=>run(accept,async()=>{await client.request('acceptSchoolInvitation',{token});await client.refresh();if(current()){message.textContent='Einladung angenommen. Dein persönliches Konto bleibt bestehen.';preview.replaceChildren();input.value='';}}),true);accept.dataset.action='accept';
      });};
    }
  }catch(error){report(error);}
}
