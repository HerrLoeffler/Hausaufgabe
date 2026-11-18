import {describeAccess,describePlan} from './billing-client.mjs';
import {mountSchoolPanel} from './billing-school-panel.mjs';

const date = value => new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium'}).format(new Date(value));
function element(doc,tag,text,classes) {
  const el=doc.createElement(tag); if(text!==undefined)el.textContent=text; if(classes)el.className=classes;return el;
}
export function paintBillingPanel(root,access,{loading=false,error,onRefresh,onChoose,onManage,onVerify,onVerified,user}={}) {
  if(!root)return;
  const doc=root.ownerDocument;root.replaceChildren();root.className='card billingPanel';
  root.append(element(doc,'span','Testumgebung · keine echten Abbuchungen','eyebrow'),element(doc,'h2','Zugang und Abrechnung'));
  const status=element(doc,'p',loading?'Dein Zugang wird geprüft …':error?'Der Zugang konnte nicht geladen werden. Bitte erneut versuchen.':describeAccess(access).title);
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status);
  if(error){const button=element(doc,'button','Erneut prüfen','button secondary');button.type='button';button.onclick=()=>onRefresh?.();root.append(button);return;}
  if(!access||loading)return;
  const view=describeAccess(access);if(view.description)root.append(element(doc,'p',view.description));
  if(view.validUntil)root.append(element(doc,'p','Gültig bis '+date(view.validUntil),'hint'));
  if(access.tier==='trial')root.append(element(doc,'p','Jede neue Testdatei zählt – auch manuell erstellte Tests, Kopien und Importe. Löschen gibt keinen Test zurück.','hint'));
  if(user&&user.emailVerified===false){
    const actions=element(doc,'div',undefined,'actions');
    for(const [label,callback]of[['Bestätigungslink senden',onVerify],['Ich habe bestätigt',onVerified]]){const b=element(doc,'button',label,'button secondary');b.type='button';b.onclick=()=>callback?.();actions.append(b);}root.append(actions);
  }
  const refresh=element(doc,'button','Status aktualisieren','button ghost');refresh.type='button';refresh.onclick=()=>onRefresh?.();root.append(refresh);
  if(access.payments?.portalAvailable){const manage=element(doc,'button','Abo und Rechnungen verwalten','button secondary');manage.type='button';manage.dataset.action='manage-subscription';manage.onclick=()=>onManage?.();root.append(manage);}
  if(access.payments?.invoices?.length){
    const invoices=element(doc,'section');invoices.append(element(doc,'h3','Deine persönlichen Rechnungen'));
    for(const invoice of access.payments.invoices){const money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(value/100);invoices.append(element(doc,'p',`${invoice.invoiceNumber||'Testrechnung'} · ${money(invoice.total)} · ${invoice.status==='paid'?'Bezahlt':invoice.status==='void'?'Storniert':invoice.status==='uncollectible'?'Uneinbringlich':money(invoice.remaining)+' offen'}`));}
    if(access.payments.hasMoreInvoices)invoices.append(element(doc,'p','Weitere Rechnungen findest du in der Aboverwaltung.','hint'));root.append(invoices);
  }
  if(access.payments?.hasSubscription)return;
  if(['complimentary','school'].includes(access.tier))return;
  const fieldset=element(doc,'fieldset',undefined,'billingPlans');fieldset.append(element(doc,'legend',access.purchasingEnabled?'Persönliches Premium testen':'Persönliches Premium – Tarifvorschau'));
  const plans=Array.isArray(access.plans)?access.plans:[];
  for(const raw of plans){
    let plan;try{plan=describePlan(raw);}catch{continue;}
    const card=element(doc,'div',undefined,'billingPlan');card.append(element(doc,'h3',plan.title),element(doc,'p',plan.summary));
    const b=element(doc,'button',raw.interval==='year'?'Jahresabo wählen':'Monatsabo wählen','button primary');b.type='button';b.disabled=access.purchasingEnabled!==true;
    b.onclick=()=>onChoose?.(plan.code);card.append(b);fieldset.append(card);
  }
  if(plans.length){root.append(fieldset);root.append(element(doc,'p',access.purchasingEnabled?'Ein kostenpflichtiges Abo beginnt erst nach deiner bewussten Bestätigung.':'Die Tarifauswahl ist vorbereitet. Der Zahlungstest ist hier noch nicht aktiviert.','hint'));}
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
