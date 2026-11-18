import {describeAccess} from './billing-client.mjs';
import {mountSchoolPanel} from './billing-school-panel.mjs';
import {mountOfferPicker} from './billing-offer-picker.mjs';
import {mountOffersAdmin} from './billing-offers-admin.mjs';

const date = value => new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium'}).format(new Date(value));
function element(doc,tag,text,classes) {
  const el=doc.createElement(tag); if(text!==undefined)el.textContent=text; if(classes)el.className=classes;return el;
}
export function billingSectionFromLocation(address) {
  const url=new URL(address,'https://gradecrew.invalid');
  if(new URLSearchParams(url.hash.slice(1)).has('school-invite'))return 'school';
  return url.searchParams.get('account')==='invoices'?'invoices':'access';
}
export function paintBillingPanel(root,access,{loading=false,error,onRefresh,onChoose,onManage,onVerify,onVerified,user,client,uid,initialSection='access',initialInvitation=''}={}) {
  if(!root)return;
  const doc=root.ownerDocument,ticket=Symbol();root.billingPaintTicket=ticket;root.replaceChildren();root.className='card billingPanel billingAccount';
  root.append(element(doc,'span','Testumgebung · keine echten Abbuchungen','eyebrow'),element(doc,'h2','Mein Konto'));
  if(!access){if(!loading)root.billingSection=null;const status=element(doc,'p',loading?'Dein Zugang wird geprüft …':error?'Der Zugang konnte nicht geladen werden. Bitte erneut versuchen.':'Bitte anmelden.');status.setAttribute('role','status');root.append(status);if(error){const retry=element(doc,'button','Erneut prüfen','button secondary');retry.type='button';retry.onclick=()=>onRefresh?.();root.append(retry);}return;}
  const navigation=element(doc,'nav',undefined,'billingNavigation');navigation.setAttribute('aria-label','Konto und Abrechnung');
  const content=element(doc,'section',undefined,'billingAccountContent');root.append(navigation,content);
  const sections=[['access','Mein Zugang'],['invoices','Rechnungen'],['school','Meine Schule']];if(access.canManageOffers===true)sections.push(['offers','Angebote & Rabatte']);
  const action=(parent,label,name,work,primary=false)=>{const b=element(doc,'button',label,primary?'button primary':'button secondary');b.type='button';b.dataset.action=name;b.onclick=work;parent.append(b);return b;};
  function render(section){
    if(!sections.some(([key])=>key===section))section='access';root.billingSection=section;content.replaceChildren();content.dataset.view=section;
    for(const b of navigation.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.section===section));
    if(section==='school'){const host=element(doc,'div');content.append(host);if(client)void mountSchoolPanel(host,{client,uid:uid||user?.uid,initialInvitation});else host.append(element(doc,'p','Bitte den Kontostatus neu laden.'));return;}
    if(section==='offers'){const host=element(doc,'div');content.append(host);if(client)void mountOffersAdmin(host,{client,canManageOffers:access.canManageOffers===true});return;}
    if(section==='invoices'){
      content.append(element(doc,'h3','Deine persönlichen Rechnungen'));
      const invoices=access.payments?.invoices||[],money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(value/100);
      if(!invoices.length)content.append(element(doc,'p','Hier liegen noch keine persönlichen Rechnungen vor.','hint'));
      for(const invoice of invoices)content.append(element(doc,'p',`${invoice.invoiceNumber||'Testrechnung'} · ${money(invoice.total)} · ${invoice.status==='paid'?'Bezahlt':invoice.status==='void'?'Storniert':invoice.status==='uncollectible'?'Uneinbringlich':money(invoice.remaining)+' offen'}`));
      if(access.payments?.portalAvailable)action(content,'Rechnungen im Zahlungsportal öffnen','manage-invoices',()=>onManage?.());
      if(access.payments?.hasMoreInvoices)content.append(element(doc,'p','Weitere Rechnungen findest du im Zahlungsportal.','hint'));
      content.append(element(doc,'p','Schulrechnungen findest du bei deiner Schule, wenn du für die Rechnungen zuständig bist.','hint'));return;
    }
    const view=describeAccess(access),status=element(doc,'p',view.title,'billingAccessStatus');status.setAttribute('role','status');status.setAttribute('aria-live','polite');content.append(status);
    if(access.tier==='trial'){
      content.append(element(doc,'p',`${access.freeCreationsRemaining} von 5 neuen Tests übrig`));
      const until=view.trialEndsAtMs||view.validUntil;if(until)content.append(element(doc,'p','Testphase bis '+date(until),'hint'));
      const details=element(doc,'details');details.dataset.trialDetails='';details.append(element(doc,'summary','Details zur Testphase'),element(doc,'p','14 Tage und höchstens fünf neue Testdateien kostenlos. Jede Neuanlage zählt, auch Kopien und Importe. Bearbeiten verbraucht keinen weiteren Test. Löschen gibt keinen Test zurück. Kein automatisches kostenpflichtiges Abo.','hint'));content.append(details);
    }else{if(view.description)content.append(element(doc,'p',view.description));if(view.validUntil)content.append(element(doc,'p','Gültig bis '+date(view.validUntil),'hint'));}
    if(user?.emailVerified===false){const actions=element(doc,'div',undefined,'actions');action(actions,'Bestätigungslink senden','verify-email',()=>onVerify?.());action(actions,'Ich habe bestätigt','refresh-verification',()=>onVerified?.());content.append(actions);}
    const actions=element(doc,'div',undefined,'actions');content.append(actions);
    if(access.payments?.portalAvailable)action(actions,'Abo verwalten','manage-subscription',()=>onManage?.(),true);
    if(!access.payments?.hasSubscription&&!['complimentary','school'].includes(access.tier)&&(access.plans||[]).length){
      const show=action(actions,'Premium ansehen','show-plans',()=>{const existing=content.querySelector('[data-view=plans]');if(existing){existing.remove();show.setAttribute('aria-expanded','false');show.textContent='Premium ansehen';return;}show.setAttribute('aria-expanded','true');show.textContent='Tarifauswahl schließen';const host=element(doc,'section');content.append(host);mountOfferPicker(host,{access,client,onChoose});},true);show.setAttribute('aria-expanded','false');
    }
    action(actions,'Status aktualisieren','refresh-access',()=>onRefresh?.());
  }
  for(const[key,label]of sections){const button=element(doc,'button',label,'button ghost');button.type='button';button.dataset.section=key;button.onclick=()=>{if(root.billingPaintTicket===ticket)render(key);};navigation.append(button);}
  render(root.billingSection||initialSection);
}

export async function mountAdminBilling(root,{client,personId,onError=()=>{}}) {
  const doc=root.ownerDocument,host=element(doc,'section',undefined,'billingAdminPerson');root.append(host);
  async function load(){
    host.replaceChildren(element(doc,'h3','Zugang und Freigaben'));
    try{
      const result=await client.request('inspectAccess',{personId});
      if(!host.isConnected)return;
      host.append(element(doc,'p',describeAccess(result.access).title));
      const grants=Array.isArray(result.grants)?result.grants:[];
      for(const grant of grants){
        const row=element(doc,'div',undefined,'billingGrantRow');row.append(element(doc,'span',`${grant.reason} · ${grant.endsAtMs?'bis '+date(grant.endsAtMs):'unbefristet'}`));
        const revoke=element(doc,'button','Freigabe beenden','button secondary');revoke.type='button';
        revoke.onclick=async()=>{const reason=globalThis.prompt('Grund für das Beenden der kostenlosen Freigabe:');if(!reason?.trim())return;revoke.disabled=true;try{await client.request('revokePremium',{grantId:grant.id,reason});await load();}catch(error){onError(error);revoke.disabled=false;}};
        row.append(revoke);host.append(row);
      }
      const form=element(doc,'form',undefined,'billingGrantForm');
      const reasonLabel=element(doc,'label','Grund der kostenlosen Freigabe'),reason=element(doc,'input');reason.required=true;reason.minLength=3;reason.maxLength=500;reasonLabel.append(reason);
      const endLabel=element(doc,'label','Gültig bis'),end=element(doc,'input');end.type='date';end.required=true;endLabel.append(end);
      const unlimitedLabel=element(doc,'label',undefined,'checkRow'),unlimited=element(doc,'input');unlimited.type='checkbox';unlimitedLabel.append(unlimited,doc.createTextNode('Ausdrücklich unbefristet freigeben'));
      unlimited.onchange=()=>{end.disabled=unlimited.checked;end.required=!unlimited.checked;};
      const grant=element(doc,'button','Premium kostenlos freigeben','button primary');grant.type='submit';
      const note=element(doc,'p','Die Freigabe erzeugt keine Rechnung oder Abbuchung. Ein vorhandenes bezahltes Abo wird dadurch nicht automatisch beendet.','hint');
      form.append(reasonLabel,endLabel,unlimitedLabel,note,grant);
      form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;grant.disabled=true;
        try{const endsAtMs=unlimited.checked?null:new Date(end.value+'T23:59:59').getTime();await client.request('grantPremium',{personId,reason:reason.value,endsAtMs,requestId:crypto.randomUUID()});await load();}
        catch(error){onError(error);grant.disabled=false;}};
      host.append(form);
    }catch(error){host.append(element(doc,'p','Für dieses Konto ist die Zugangsverwaltung noch nicht verfügbar.','hint'));onError(error);}
  }
  await load();
  if(host.isConnected){const schoolRoot=element(doc,'section');host.append(schoolRoot);await mountSchoolPanel(schoolRoot,{client,targetPersonId:personId,onError});}
}
