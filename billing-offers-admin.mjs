import {mountOfferTargets} from './billing-offer-targets.mjs';
const money=minor=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(minor/100);
const date=ms=>Number.isFinite(ms)?new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium',timeStyle:'short'}).format(new Date(ms)):'vom Server noch nicht bestätigt';
const states={draft:'Entwurf',syncing:'Wird mit dem Zahlungsdienst abgeglichen – noch nicht kaufbar',active:'Aktiv',ended:'Beendet · bestehende Zusagen bleiben gültig',sync_error:'Abgleich fehlgeschlagen – nicht kaufbar'};
function node(doc,tag,text,classes){const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(classes)el.className=classes;return el;}
function button(doc,parent,label,name,work){const b=node(doc,'button',label,'button secondary');b.type='button';b.dataset.action=name;b.onclick=work;parent.append(b);return b;}
const planName=code=>({'personal-monthly':'Premium monatlich','personal-yearly':'Premium jährlich','school-yearly':'Schulplatz pro Jahr'}[code]||'Vereinbarter Tarif');
function minor(text){const match=/^(\d+)(?:[.,](\d{1,2}))?$/.exec(text.trim());if(!match)throw new Error('Bitte einen Eurobetrag mit höchstens zwei Nachkommastellen eingeben.');const result=Number(match[1])*100+Number((match[2]||'').padEnd(2,'0'));if(!Number.isSafeInteger(result)||result<=0)throw new Error('Der Nachlass muss größer als 0 € sein.');return result;}

export async function mountOffersAdmin(root,{client,canManageOffers=false}={}){
 const doc=root.ownerDocument,ticket=Symbol();root.offersAdminTicket=ticket;root.replaceChildren();root.className='billingOffersAdmin';
 const current=()=>root.isConnected&&root.offersAdminTicket===ticket;
 if(canManageOffers!==true)return;
 root.append(node(doc,'h3','Angebote & Rabatte'),node(doc,'p','Preisaktionen verwalten. Kostenlose Premium-Freigaben bleiben eine eigene Aktion bei der jeweiligen Person.','hint'));
 const message=node(doc,'p');message.setAttribute('role','status');message.setAttribute('aria-live','polite');root.append(message);
 const recovery=node(doc,'section');root.append(recovery);const list=node(doc,'section'),formDetails=node(doc,'details');formDetails.append(node(doc,'summary','Neues Angebot als Entwurf vorbereiten'));root.append(list,formDetails);
 const form=node(doc,'form',undefined,'billingGrantForm');formDetails.append(form);
 const fields={};
 function field(label,name,type='text',required=true){const wrap=node(doc,'label',label),input=node(doc,type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.name=name;input.required=required;fields[name]=input;wrap.append(input);form.append(wrap);return input;}
 function select(label,name,options){const wrap=node(doc,'label',label),input=node(doc,'select');input.name=name;for(const[value,text]of options){const option=node(doc,'option',text);option.value=value;input.append(option);}fields[name]=input;wrap.append(input);form.append(wrap);return input;}
 field('Interner Name','name').maxLength=120;field('Kurzer Kundentext','title').maxLength=160;
 select('Tarif','planCode',[['personal-monthly','Premium monatlich · 15 €'],['personal-yearly','Premium jährlich · 120 €'],['school-yearly','Schulplatz pro Jahr · 50 €']]);
 select('Zielgruppe','audience',[['public','Öffentlich · berechtigte neue Käufe'],['accounts','Bestimmte Konten bzw. Schule'],['code','Aktionscode']]);
 const targetRoot=node(doc,'section');targetRoot.dataset.targetPurpose='offer';form.append(targetRoot);const targetPicker=mountOfferTargets(targetRoot,{client,canManageOffers:true,onChange:()=>{saveRequestId=crypto.randomUUID();}});
 field('Aktionscode','code','text',false).maxLength=100;
 select('Nachlass','discountType',[['percent','Prozent'],['fixed','Fester Eurobetrag']]);const percent=field('Nachlass in Prozent','percentOff','number');percent.min='1';percent.max='100';percent.step='1';percent.value='20';
 const amount=field('Fester Nachlass in € (EUR)','amountOffMinor','text',false);amount.inputMode='decimal';
 select('Berechnungsbasis des festen Schulrabatts','fixedBasis',[['','Bitte ausdrücklich auswählen'],['seat','Je Lehrkraftplatz'],['invoice','Auf die gesamte Jahresrechnung']]);
 form.append(node(doc,'p','Einlösefenster: Europe/Berlin. Der Endtag ist vollständig eingeschlossen. Die Rabattwirkung nach Einlösung wird separat festgelegt.','hint'));
 field('Einlösen ab','startsOn','date');field('Einlösen bis einschließlich','endsOn','date');
 select('Rabattwirkung nach Einlösung','duration',[['once','Erste Rechnung'],['months','Definierter Zeitraum in Monaten'],['forever','Ausdrücklich dauerhaft']]);
 const months=field('Anzahl Monate (datierter Zeitraum, keine Rechnungsanzahl)','durationMonths','number',false);months.min='1';months.max='36';months.step='1';
 const limit=field('Höchstens so viele Einlösungen (optional)','maxRedemptions','number',false);limit.min='1';limit.max='100000';limit.step='1';
 field('Nur vor dem ersten Kauf berechtigt','firstTimeOnly','checkbox',false);field('Grund / Freigabe der Änderung','reason','textarea').maxLength=500;
 const save=node(doc,'button','Entwurf speichern','button primary');save.type='submit';save.dataset.action='save-offer';form.append(save);
 let offers=[],previousOfferId=null,busy=false,loadGeneration=0,saveRequestId=crypto.randomUUID(),targetScope=null;
 const operationIds=new Map(),operationId=key=>{if(!operationIds.has(key))operationIds.set(key,crypto.randomUUID());return operationIds.get(key);};
 function updateFields(){
  const audience=fields.audience.value,fixed=fields.discountType.value==='fixed',school=fields.planCode.value==='school-yearly';
  const scope=audience+':'+fields.planCode.value;if(scope!==targetScope){targetScope=scope;targetPicker.setKind(school?'school':'person');targetPicker.clear();}targetRoot.hidden=audience==='public';targetPicker.setEnabled(audience!=='public');fields.code.closest('label').hidden=audience!=='code';fields.code.required=audience==='code';fields.code.disabled=audience!=='code';
  percent.closest('label').hidden=fixed;percent.disabled=fixed;percent.required=!fixed;amount.closest('label').hidden=!fixed;amount.disabled=!fixed;amount.required=fixed;
  fields.fixedBasis.closest('label').hidden=!fixed||!school;fields.fixedBasis.disabled=!fixed||!school;fields.fixedBasis.required=fixed&&school;
  months.closest('label').hidden=fields.duration.value!=='months';months.disabled=fields.duration.value!=='months';months.required=fields.duration.value==='months';
 }
 for(const name of ['audience','discountType','planCode','duration'])fields[name].onchange=updateFields;
 form.addEventListener('input',()=>{saveRequestId=crypto.randomUUID();});
 const report=error=>{if(current())message.textContent=error.message||'Die Änderung konnte nicht bestätigt werden. Bitte neu laden.';};
 async function run(b,work){if(busy||!current())return;busy=true;b.disabled=true;message.textContent='Vorgang wird geprüft …';try{await work();}catch(error){report(error);}finally{busy=false;if(b.isConnected)b.disabled=false;}}
 function received(result){if(!result?.offer?.id||!states[result.offer.status])throw new Error('Der Server hat keinen bestätigten Angebotsstatus geliefert. Bitte neu laden.');const offer=result.offer;offers=[...offers.filter(item=>item.id!==offer.id),offer];drawOffers();return offer;}
 form.onsubmit=event=>{event.preventDefault();if(busy||!form.reportValidity())return;if(fields.audience.value==='accounts'&&!targetPicker.ids().length){message.textContent='Bitte mindestens eine Person oder Schule auswählen.';return;}void run(save,async()=>{
  const offer={name:fields.name.value.trim(),title:fields.title.value.trim(),planCode:fields.planCode.value,audience:fields.audience.value,discountType:fields.discountType.value,fixedBasis:fields.planCode.value==='school-yearly'&&fields.discountType.value==='fixed'?fields.fixedBasis.value:'invoice',startsOn:fields.startsOn.value,endsOn:fields.endsOn.value,duration:fields.duration.value,firstTimeOnly:fields.firstTimeOnly.checked,reason:fields.reason.value.trim()};
  if(offer.audience==='accounts'||(offer.audience==='code'&&targetPicker.ids().length))offer.targetIds=targetPicker.ids();if(offer.audience==='code')offer.code=fields.code.value.trim();
  if(offer.discountType==='percent')offer.percentOff=Number(percent.value);else offer.amountOffMinor=minor(amount.value);
  if(offer.duration==='months')offer.durationMonths=Number(months.value);if(limit.value)offer.maxRedemptions=Number(limit.value);
  const result=await client.request('saveOffer',{offer,requestId:saveRequestId,...(previousOfferId?{previousOfferId}:{})});if(!current())return;const saved=received(result);message.textContent=saved.status==='draft'?'Entwurf gespeichert. Noch nicht veröffentlicht.':states[saved.status];previousOfferId=null;saveRequestId=crypto.randomUUID();
 });};
 function drawOffers(){
  list.replaceChildren(node(doc,'h4','Vorhandene Angebote'));if(!offers.length)list.append(node(doc,'p','Noch keine Angebote angelegt.','hint'));
  for(const offer of offers){const row=node(doc,'article',undefined,'billingOfferRow');row.append(node(doc,'h4',offer.name),node(doc,'p',offer.title),node(doc,'p',states[offer.status]||'Status noch unbestätigt','hint'),node(doc,'p',`${planName(offer.planCode)} · ${offer.audience==='public'?'Öffentlich':offer.audience==='accounts'?'Persönlich zugewiesen':'Aktionscode'} · ${offer.discountType==='percent'?offer.percentOff+' %':money(offer.amountOffMinor)+(offer.fixedBasis==='seat'?' je Platz':' je Rechnung')}`),node(doc,'p',`Einlösen ${offer.startsOn} bis ${offer.endsOn} · Europe/Berlin`,'hint'));
   if(offer.audience!=='public')row.append(node(doc,'p',offer.targetIds?.length?offer.targetIds.length+' ausgewählt · Auswahl über eine neue Version bearbeiten.':'Keine persönliche Begrenzung hinterlegt.','hint'));
   if(['draft','syncing','sync_error'].includes(offer.status)){const retry=offer.status!=='draft',publish=button(doc,row,retry?'Abgleich erneut prüfen':'Entwurf veröffentlichen',retry?'retry-offer-sync':'publish-offer',()=>{void run(publish,async()=>{const value=await client.request('publishOffer',{offerId:offer.id,requestId:operationId('publish:'+offer.id)});if(!current())return;const saved=received(value);message.textContent=saved.status==='active'?'Angebot veröffentlicht und vom Zahlungsdienst bestätigt.':states[saved.status];});});}
   if(offer.status==='active'){
    const end=button(doc,row,'Neue Einlösungen beenden','end-offer',()=>{const reason=doc.defaultView.prompt('Grund für das Beenden neuer Einlösungen (bestehende Zusagen bleiben gültig):');if(!reason?.trim())return;void run(end,async()=>{const value=await client.request('endOffer',{offerId:offer.id,reason:reason.trim(),requestId:operationId('end:'+offer.id+':'+reason.trim())});if(!current())return;const saved=received(value);message.textContent=states[saved.status];});});
    if(offer.planCode!=='school-yearly')mountExisting(row,offer);
   }
   button(doc,row,'Neue Version vorbereiten','copy-offer',()=>{if(busy)return;for(const[name,field]of Object.entries(fields)){const value=offer[name];if(name==='amountOffMinor')field.value=value===undefined?'':String(value/100);else if(field.type==='checkbox')field.checked=value===true;else if(value!==undefined)field.value=String(value);}previousOfferId=offer.id;saveRequestId=crypto.randomUUID();updateFields();targetPicker.setSelected(offer.targetIds||[]);formDetails.open=true;fields.reason.value='';fields.name.focus();message.textContent='Neue Version als eigener Entwurf. Die bisherige Version bleibt bestehen.';});list.append(row);
  }
 }
 function mountExisting(parent,offer){
  const removing=offer.id===null,details=node(doc,'details');if(removing)details.dataset.view='remove-existing-discount';details.append(node(doc,'summary',removing?'Rabatt ab nächster Abrechnung entfernen':'Auf bestehende persönliche Abos anwenden'));parent.append(details);
  const targetsRoot=node(doc,'section');targetsRoot.dataset.targetPurpose='existing';const allWrap=node(doc,'label','Alle berechtigten persönlichen Abos ausdrücklich auswählen'),all=node(doc,'input');all.name='allExisting';all.type='checkbox';allWrap.append(all);details.append(targetsRoot,allWrap,node(doc,'p','Ab der nächsten noch nicht abgerechneten Periode. Bereits bezahlte Zeiträume, Rechnungen und kostenlose Freigaben bleiben bestehen.','hint'));
  const reasonWrap=node(doc,'label','Grund der Vertragsänderung'),reason=node(doc,'textarea');reason.name='existingReason';reason.required=true;reason.minLength=3;reason.maxLength=500;reasonWrap.append(reason);details.append(reasonWrap);
  const output=node(doc,'div');let previewGeneration=0,preview=null,attempted=false;
  const invalidate=()=>{previewGeneration++;preview=null;output.replaceChildren();};const targets=mountOfferTargets(targetsRoot,{client,canManageOffers:true,onChange:invalidate});reason.onchange=invalidate;reason.oninput=invalidate;all.onchange=()=>{targets.setEnabled(!all.checked);invalidate();};
  const review=button(doc,details,'Vertragswirkung prüfen','preview-existing-offer',()=>{if(reason.value.trim().length<3){message.textContent='Bitte den Grund der Vertragsänderung angeben.';reason.focus();return;}if(!all.checked&&!targets.ids().length){message.textContent='Bitte Konten oder ausdrücklich alle berechtigten Abos auswählen.';return;}const generation=++previewGeneration,changeReason=reason.value.trim();output.replaceChildren();void run(review,async()=>{
   const result=await client.request('previewExistingOffer',{offerId:offer.id,personIds:all.checked?'all':targets.ids()});if(!current()||generation!==previewGeneration||!output.isConnected)return;
   const value=result.preview;if(!value?.id||!Number.isSafeInteger(value.count)||!Number.isSafeInteger(value.expiresAtMs)||value.expiresAtMs<=Date.now())throw new Error('Die Vertragsvorschau ist abgelaufen oder unvollständig. Bitte erneut prüfen.');preview=value;
   output.append(node(doc,'p',`${value.count} Abos betroffen · Vorschau gültig bis ${date(value.expiresAtMs)}.`));
   for(const sub of value.subscriptions||[])output.append(node(doc,'p',`${targets.labelFor(sub.personId)||'Ausgewähltes Konto'} · ${planName(sub.planCode)} · regulär ${money(sub.baseAmountMinor)}, mit Nachlass ${money(sub.totalMinor)} · ab ${date(sub.effectiveAtMs)} · Rabattende ${sub.discountEndsAtMs===null?'dauerhaft':date(sub.discountEndsAtMs)}. Danach wieder ${money(sub.baseAmountMinor)} je Abrechnungsperiode.`));
   const requestId=crypto.randomUUID(),apply=button(doc,output,removing?`${value.count} Rabatte ab nächster Abrechnung entfernen`:`${value.count} Abos mit dieser Vorschau beauftragen`,'apply-existing-offer',()=>{if(!preview||(!attempted&&preview.expiresAtMs<=Date.now())){invalidate();message.textContent='Die Vertragsvorschau ist abgelaufen. Bitte erneut prüfen.';return;}attempted=true;void run(apply,async()=>{
    const applied=await client.request('applyExistingOffer',{previewId:value.id,requestId,reason:changeReason});if(!current()||generation!==previewGeneration||!output.isConnected)return;
    if(!['scheduled','partial','pending'].includes(applied.status))throw new Error('Die Vertragsänderung ist noch nicht bestätigt. Bitte den Status neu laden.');
    const outcome=node(doc,'div');output.append(outcome);outcome.append(node(doc,'p',`${applied.completedCount} von ${applied.count} Vertragsänderungen eingeplant. ${applied.status==='partial'?'Ein Teil ist fehlgeschlagen.':applied.status==='pending'?'Weitere Ergebnisse sind noch offen.':'Die nächste bestätigte Periode bleibt maßgeblich.'}`));
    for(const item of applied.results||[])outcome.append(node(doc,'p',`${targets.labelFor(item.personId)||'Ausgewähltes Konto'}: ${item.state==='scheduled'?'eingeplant':item.state==='failed'?'fehlgeschlagen':'noch offen'}${item.effectiveAtMs?' ab '+date(item.effectiveAtMs):''}${item.error?' · '+item.error:''}`));if(applied.status==='scheduled'){preview=null;apply.remove();}else{apply.dataset.action='retry-existing-offer';apply.textContent='Offene Änderungen erneut abgleichen';}message.textContent='Vertragsänderung: '+(applied.status==='partial'?'teilweise fehlgeschlagen':applied.status==='pending'?'noch in Bearbeitung':'eingeplant');
   });});
  });});details.append(output);
 }
 mountExisting(root,{id:null});
 button(doc,root,'Angebote neu laden','reload-offers',()=>{if(!busy)void load();});
 async function load(){const generation=++loadGeneration;try{const result=await client.request('listOffers');if(!current()||generation!==loadGeneration)return;offers=Array.isArray(result.offers)?result.offers:[];drawOffers();recovery.replaceChildren();for(const pending of result.pendingApplications||[]){const row=node(doc,'article');row.append(node(doc,'p',`${pending.count} bestätigte Vertragsänderungen müssen noch abgeglichen werden.`));const retry=button(doc,row,'Offene Vertragsänderungen abgleichen','resume-existing-offer',()=>{void run(retry,async()=>{const value=await client.request('applyExistingOffer',{previewId:pending.previewId,requestId:pending.requestId,reason:pending.reason});if(!current())return;message.textContent=`${value.completedCount} von ${value.count} Änderungen eingeplant.`;await load();});});recovery.append(row);}}catch(error){report(error);}}
 updateFields();await load();
}
