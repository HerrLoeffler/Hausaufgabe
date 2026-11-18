import {mountSchoolJoinCodeForm,mountSchoolJoinCodeManagement} from './school-join-code-panel.mjs';
const dates = value => value ? new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium'}).format(new Date(value)) : 'noch offen';
const quoteDate=value=>new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
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
    const details=node(doc,'div');let schoolViewTicket=0;
    for(const school of schools){const b=button(doc,root,school.name,()=>run(b,()=>openSchool(school.id)));b.dataset.school=school.id;}
    root.append(details);
    async function openSchool(schoolId){
      const viewTicket=++schoolViewTicket,panelCurrent=current,isSelected=()=>panelCurrent()&&viewTicket===schoolViewTicket;
      const view=await client.request('getSchool',{schoolId});if(!isSelected())return;
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
        else if(view.paymentsEnabled&&!paid&&(view.period?.invoiceId||(Number.isSafeInteger(view.period?.remainingMinor)&&Number.isSafeInteger(view.period?.amountMinor)&&view.period.remainingMinor<view.period.amountMinor))){
          details.append(node(doc,'p','Die bestehende Rechnung behält ihren vereinbarten Betrag. Neue Angebote ändern diese Rechnung nicht.','hint'));
          const requestId=crypto.randomUUID(),existing=button(doc,details,'Bestehende Schulrechnung abrufen',()=>run(existing,async()=>{const value=await client.request('schoolInvoice',{schoolId,requestId});if(isSelected()){showInvoice(value.url);message.textContent='Bestehende Schulrechnung abgerufen.';}}));existing.dataset.action='school-invoice';
        }
        else if(view.paymentsEnabled&&!paid){
          const quoteArea=node(doc,'section',undefined,'billingSchoolQuote');details.append(quoteArea);
          const codeDetails=node(doc,'details'),label=node(doc,'label','Aktionscode für die Schulrechnung (optional)'),code=node(doc,'input');code.name='schoolOfferCode';code.maxLength=100;code.autocomplete='off';label.append(code);codeDetails.append(node(doc,'summary','Aktionscode verwenden'),label);quoteArea.append(codeDetails);
          const preview=node(doc,'div');let quoteGeneration=0;
          code.oninput=()=>{quoteGeneration++;preview.replaceChildren();};
          const review=button(doc,quoteArea,'Preis für die Schulrechnung prüfen',()=>{const quoteTicket=++quoteGeneration;preview.replaceChildren();void run(review,async()=>{
            const value=await client.request('offerQuote',{planCode:'school-yearly',schoolId,...(code.value.trim()?{code:code.value.trim()}:{})});if(!isSelected()||quoteTicket!==quoteGeneration)return;
            const q=value.quote;if(value.eligible===false||value.conflict)throw new Error(typeof value.conflict==='string'?value.conflict:'Das Angebot ist für diese Schule nicht verfügbar.');
            if(!q?.id||q.planCode!=='school-yearly'||!Number.isSafeInteger(q.totalMinor)||q.totalMinor<0||!Number.isSafeInteger(q.baseAmountMinor)||!Number.isSafeInteger(q.quantity)||q.quantity<1||!Number.isSafeInteger(q.expiresAtMs)||q.expiresAtMs<=Date.now())throw new Error('Die Preisvorschau ist abgelaufen oder ungültig. Bitte erneut prüfen.');
            const money=minor=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(minor/100);
            preview.append(node(doc,'p',`${q.quantity} Plätze · regulär ${money(q.baseAmountMinor)} · zu zahlen ${money(q.totalMinor)} für die Jahresrechnung.`));
            if(q.offer){preview.append(node(doc,'p',q.offer.title),node(doc,'p',q.offer.fixedBasis==='seat'?'Fester Nachlass je Lehrkraftplatz.':'Nachlass auf die gesamte Jahresrechnung.','hint'),node(doc,'p',q.offer.duration==='forever'?'Der Nachlass gilt dauerhaft.':q.offer.duration==='months'?`Nachlass für ${q.offer.durationMonths} Monate ab Beginn, bezogen auf fällige Jahresrechnungen. Danach wieder ${money(q.baseAmountMinor)} je Jahr.`:`Nachlass für diese erste Jahresrechnung. Danach wieder ${money(q.baseAmountMinor)} je Jahr.`,'hint'));}
            preview.append(node(doc,'p','Preisvorschau gültig bis '+quoteDate(q.expiresAtMs)+'. Bestehende und teilbezahlte Rechnungen behalten ihren vereinbarten Betrag.','hint'));
            const requestId=crypto.randomUUID(),invoice=button(doc,preview,'Testrechnung vorbereiten',()=>{if(quoteTicket!==quoteGeneration||!isSelected())return;if(q.expiresAtMs<=Date.now()){preview.replaceChildren(node(doc,'p','Die Preisvorschau ist abgelaufen. Bitte erneut prüfen.'));return;}void run(invoice,async()=>{const value=await client.request('schoolInvoice',{schoolId,quoteId:q.id,requestId});if(isSelected()&&quoteTicket===quoteGeneration){showInvoice(value.url);preview.replaceChildren();message.textContent='Testrechnung vorbereitet. Es wurde keine E-Mail verschickt.';}});});invoice.dataset.action='school-invoice';
          });});review.dataset.action='quote-school-invoice';quoteArea.append(preview);
        }
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
      const join=node(doc,"details");join.open=Boolean(initialInvitation);join.append(node(doc,"summary",schools.length?"Weiterer Schule beitreten":"Schule beitreten"));root.append(join);const codeChoice=node(doc,"details");codeChoice.append(node(doc,"summary","Schulcode verwenden"));join.append(codeChoice);const schoolCode=node(doc,"section");codeChoice.append(schoolCode);mountSchoolJoinCodeForm(schoolCode,{client,onError,onJoined:async()=>{if(current()){await mountSchoolPanel(root,{client,uid,onError});const notice=node(doc,"p","Die Schulzuordnung ist gespeichert.","hint");root.append(notice);}}});
      const form=node(doc,'form',undefined,'billingGrantForm');form.append(node(doc,'h3','Einladung annehmen'));
      const input=field(doc,form,'Persönlichen Einladungslink einfügen','invitation');input.value=initialInvitation;input.autocomplete='off';
      const review=node(doc,'button','Einladung prüfen','button secondary');review.type='submit';review.dataset.action='preview';form.append(review);const targeted=node(doc,"details");targeted.open=Boolean(initialInvitation);targeted.append(node(doc,"summary","Persönlichen Einladungslink verwenden"),form);join.append(targeted);const preview=node(doc,'div');targeted.append(preview);
      let invitationGeneration=0;input.oninput=()=>{invitationGeneration++;preview.replaceChildren();};
      form.onsubmit=event=>{event.preventDefault();const token=invitationToken(input.value);if(!token){report(new Error('Bitte einen gültigen Einladungslink einfügen.'));return;}const invitationTicket=++invitationGeneration;void run(review,async()=>{
        const invitation=await client.request('previewSchoolInvitation',{token});if(!current()||invitationTicket!==invitationGeneration)return;preview.replaceChildren(node(doc,'p',`${invitation.schoolName} · ${roles[invitation.role]||invitation.role} · Laufzeitende ${dates(invitation.endsAtMs)}`));
        const accept=button(doc,preview,'Dieser Schule beitreten',()=>run(accept,async()=>{if(invitationTicket!==invitationGeneration)return;await client.request('acceptSchoolInvitation',{token});await client.refresh();if(current()){message.textContent='Einladung angenommen. Dein persönliches Konto bleibt bestehen.';preview.replaceChildren();input.value='';}}),true);accept.dataset.action='accept';
      });};
    }
  }catch(error){report(error);}
}
