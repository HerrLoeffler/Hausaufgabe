import {describePlan} from './billing-client.mjs';
const money=minor=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:minor%100?2:0}).format(minor/100);
const date=ms=>new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium',timeStyle:'short'}).format(new Date(ms));
function node(doc,tag,text,classes){const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(classes)el.className=classes;return el;}

export function mountOfferPicker(root,{access,client,onChoose=async()=>{}}={}){
 const doc=root.ownerDocument,ticket=Symbol();root.offerPickerTicket=ticket;root.dataset.view='plans';root.className='billingOfferPicker';
 const current=()=>root.isConnected&&root.offerPickerTicket===ticket;
 const plans=(access.plans||[]).filter(raw=>{try{describePlan(raw);return true;}catch{return false;}});
 if(!plans.length){root.append(node(doc,'p','Zurzeit ist kein Tarif verfügbar.'));return;}
 let selected=plans.find(raw=>raw.interval==='month')||plans[0],generation=0,value=null,busy=false,attempted=false;
 const switcher=node(doc,'div',undefined,'billingPlanSwitch');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Abrechnung wählen');
 for(const raw of plans){const b=node(doc,'button',raw.interval==='year'?'Jährlich':'Monatlich','button secondary');b.type='button';b.dataset.plan=raw.code;b.onclick=()=>{if(busy)return;selected=raw;render();};switcher.append(b);}
 const price=node(doc,'div',undefined,'billingPlan'),message=node(doc,'p',undefined,'hint');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 const codeDetails=node(doc,'details'),codeLabel=node(doc,'label','Aktionscode'),code=node(doc,'input'),check=node(doc,'button','Code prüfen','button secondary');code.name='offerCode';code.autocomplete='off';code.maxLength=100;check.type='button';check.dataset.action='check-offer-code';codeLabel.append(code);codeDetails.append(node(doc,'summary','Ich habe einen Aktionscode'),codeLabel,check);
 const choose=node(doc,'button','Monatsabo wählen','button primary');choose.type='button';choose.dataset.action='choose-plan';
 const refresh=node(doc,'button','Preis erneut prüfen','button ghost');refresh.type='button';refresh.dataset.action='refresh-quote';
 root.append(switcher,price,codeDetails,message,choose,refresh,node(doc,'p',access.purchasingEnabled?'Ein kostenpflichtiges Abo beginnt erst nach deiner bewussten Bestätigung.':'Die Tarifauswahl ist vorbereitet. Der Zahlungstest ist hier noch nicht aktiviert.','hint'));
 function showPrice(quote){
  const annual=selected.interval==='year';price.replaceChildren(node(doc,'h3',annual?'Premium jährlich':'Premium monatlich'));
  if(quote?.offer){price.append(node(doc,'p',quote.offer.title,'billingOfferTitle'),node(doc,'p','Regulär '+money(quote.baseAmountMinor)+(annual?' pro Jahr':' pro Monat'),'billingComparePrice'),node(doc,'p',annual?money(Math.round(quote.totalMinor/12))+'/Monat':money(quote.totalMinor)+' für die erste Rechnung','billingPrice billingDiscountPrice'),node(doc,'p',money(quote.discountAmountMinor)+' Nachlass'));
   if(annual)price.append(node(doc,'p',money(quote.totalMinor)+' jährlich im Voraus'));
   const o=quote.offer;const effect=o.duration==='once'?'Der Nachlass gilt für die erste Rechnung.':o.duration==='months'?`Der Nachlass gilt für ${o.durationMonths} Monate ab Beginn; berücksichtigt werden die darin fälligen Rechnungen.`:'Der Nachlass gilt dauerhaft für diesen Tarif.';
   price.append(node(doc,'p',effect,'hint'),node(doc,'p',o.duration==='forever'?'Regulärer Vergleichspreis: '+money(quote.baseAmountMinor)+(annual?' pro Jahr.':' pro Monat.'):'Nach Rabattende: danach '+money(quote.baseAmountMinor)+(annual?' jährlich im Voraus.':' pro Monat.'),'hint'));
   if(o.endsAtMs)price.append(node(doc,'p','Einlösbar bis '+date(o.endsAtMs)+' (Europe/Berlin).','hint'));
  }else{
   price.append(node(doc,'p',annual?money(Math.round(selected.amountMinor/12))+'/Monat':money(selected.amountMinor)+'/Monat','billingPrice'));
   if(annual)price.append(node(doc,'p',money(selected.amountMinor)+' jährlich im Voraus'));
  }
  if(annual){const monthly=plans.find(raw=>raw.interval==='month');if(monthly&&monthly.amountMinor*12>selected.amountMinor){const saving=monthly.amountMinor*12-selected.amountMinor;price.append(node(doc,'p',`${money(saving)} weniger als zwölf Monatszahlungen · ${Math.round(saving/(monthly.amountMinor*12)*100)} % Jahresvorteil (Vergleich: 12 × ${money(monthly.amountMinor)}).`,'hint'));}}
  if(quote)price.append(node(doc,'p','Preisvorschau gültig bis '+date(quote.expiresAtMs)+'. Der bestätigte Checkout bindet den Preis für 35 Minuten.','hint'));
 }
 function setBusy(next){busy=next;for(const button of switcher.querySelectorAll('button'))button.disabled=next;code.disabled=next;check.disabled=next;refresh.disabled=next;}
 async function load(){
  const id=++generation;value=null;attempted=false;choose.disabled=true;message.textContent='';showPrice(null);
  if(access.purchasingEnabled!==true||!client){refresh.hidden=true;return;}
  refresh.hidden=false;message.textContent='Dein Preis wird geprüft …';
  try{
   const result=await client.request('offerQuote',{planCode:selected.code,...(code.value.trim()?{code:code.value.trim()}:{})});
   if(!current()||id!==generation)return;
   if(result.eligible===false||result.conflict)throw new Error(typeof result.conflict==='string'?result.conflict:'Dieses Angebot kann für dein Konto nicht verwendet werden.');
   const q=result.quote;
   if(!q?.id||q.planCode!==selected.code||!Number.isSafeInteger(q.baseAmountMinor)||!Number.isSafeInteger(q.totalMinor)||!Number.isSafeInteger(q.discountAmountMinor)||q.totalMinor<0||!Number.isSafeInteger(q.expiresAtMs))throw new Error('Die Preisvorschau konnte nicht geprüft werden.');
   if(q.expiresAtMs<=Date.now())throw new Error('Die Preisvorschau ist abgelaufen. Bitte den Preis erneut prüfen.');
   value=q;showPrice(q);message.textContent='Preis geprüft. Die Zahlungsbestätigung erfolgt im nächsten Schritt.';choose.disabled=false;
  }catch(error){if(current()&&id===generation){value=null;message.textContent=error.message||'Der Preis konnte nicht geprüft werden. Bitte erneut versuchen.';choose.disabled=true;}}
 }
 function render(){generation++;value=null;for(const b of switcher.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.plan===selected.code));choose.textContent=selected.interval==='year'?'Jahresabo wählen':'Monatsabo wählen';void load();}
 code.oninput=()=>{generation++;value=null;attempted=false;choose.disabled=true;message.textContent='Bitte den geänderten Code prüfen.';};
 check.onclick=()=>{if(!busy)void load();};refresh.onclick=()=>{if(!busy)void load();};
 choose.onclick=async()=>{if(busy||!value||!current())return;if(value.expiresAtMs<=Date.now()&&!attempted){value=null;choose.disabled=true;message.textContent='Die Preisvorschau ist abgelaufen. Bitte den Preis erneut prüfen.';return;}
  const id=generation;attempted=true;setBusy(true);choose.disabled=true;
  try{await onChoose(selected.code,{quoteId:value.id});}catch(error){if(current()&&id===generation)message.textContent=error.message||'Der Zahlungsvorgang konnte nicht gestartet werden.';}
  finally{if(current()&&id===generation){setBusy(false);choose.disabled=!value||(!attempted&&value.expiresAtMs<=Date.now());}}
 };
 render();
}
