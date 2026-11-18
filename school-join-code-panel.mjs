const date = value => new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
function el(doc,tag,text,classes){const node=doc.createElement(tag);if(text!==undefined)node.textContent=text;if(classes)node.className=classes;return node;}
function action(doc,parent,text,name,work,primary=false){const b=el(doc,'button',text,primary?'button primary':'button secondary');b.type='button';b.dataset.action=name;b.onclick=work;parent.append(b);return b;}
function status(doc,parent){const node=el(doc,'p',undefined,'hint');node.setAttribute('role','status');node.setAttribute('aria-live','polite');parent.append(node);return node;}

export function mountSchoolJoinCodeForm(root,{client,onJoined=async()=>{},onError=()=>{}}){
 const doc=root.ownerDocument;root.className='billingGrantForm';
 const form=el(doc,'form',undefined,'billingGrantForm');form.append(el(doc,'h3','Deiner Schule beitreten'));
 const label=el(doc,'label','Schulcode'),input=el(doc,'input');input.name='schoolCode';input.required=true;input.maxLength=100;input.autocomplete='off';input.spellcheck=false;label.append(input);form.append(label);
 form.append(el(doc,'p','Den Code bekommst du von deiner Schulverwaltung. Du verwendest weiterhin dieses Lehrerkonto.','hint'));
 const review=el(doc,'button','Schulcode prüfen','button primary');review.type='submit';review.dataset.action='preview-school-code';form.append(review);root.append(form);
 const message=status(doc,root),preview=el(doc,'div',undefined,'billingGrantForm');root.append(preview);
 let ticket=0,busy=false;
 const current=id=>root.isConnected&&id===ticket;
 const report=error=>{message.textContent=error.message||'Bitte später erneut versuchen.';onError(error);};
 input.oninput=()=>{ticket++;preview.replaceChildren();message.textContent='';};
 form.onsubmit=event=>{event.preventDefault();if(busy||!form.reportValidity())return;const code=input.value.trim(),id=++ticket;
  busy=true;review.disabled=true;preview.replaceChildren();message.textContent='Schulcode wird geprüft …';
  void(async()=>{try{
   const value=await client.request('previewSchoolJoinCode',{code});if(!current(id))return;
   message.textContent='';preview.append(el(doc,'p',value.schoolName));
   const join=action(doc,preview,'Dieser Schule beitreten','join-school-code',()=>{
    if(busy||!current(id))return;busy=true;join.disabled=true;input.disabled=true;review.disabled=true;
    void(async()=>{try{
     const joined=await client.request('redeemSchoolJoinCode',{code});if(!current(id))return;
     // Membership is already committed. A failed account refresh must not
     // present it as a failed join and encourage another action.
     try{await client.refresh?.();}catch{ /* next normal refresh reconciles */ }
     if(!current(id))return;message.textContent=joined.alreadyMember?'Du bist dieser Schule bereits zugeordnet.':'Du bist der Schule zugeordnet. Dein persönliches Konto bleibt bestehen.';
     input.value='';preview.replaceChildren();await onJoined(joined);
    }catch(error){if(current(id))report(error);}finally{busy=false;if(join.isConnected)join.disabled=false;input.disabled=false;review.disabled=false;}})();
   },true);join.focus();
  }catch(error){if(current(id))report(error);}finally{busy=false;review.disabled=false;}})();
 };
}

export function mountSchoolJoinCodeManagement(root,{client,schoolId,joinCode,onError=()=>{}}){
 const doc=root.ownerDocument;root.className='billingGrantForm';root.append(el(doc,'h4','Schulcode fürs Kollegium'),el(doc,'p','Jede neue Lehrkraft belegt einen freien Platz. Auch die Schulverwaltung zählt mit.','hint'));
 const state=status(doc,root),buttons=el(doc,'div',undefined,'schoolCodeActions'),output=el(doc,'div');root.append(buttons,output);
 let value=joinCode,busy=false;
 const report=error=>{state.textContent=error.message||'Bitte später erneut versuchen.';onError(error);};
 const show=()=>{state.textContent=value?.status==='active'?`Aktiv bis ${date(value.expiresAtMs)}.`:value?.status==='expired'?'Der Schulcode ist abgelaufen.':'Kein aktiver Schulcode.';create.textContent=value?'Schulcode erneuern':'Schulcode erstellen';revoke.disabled=busy||value?.status!=='active';};
 const create=action(doc,buttons,'Schulcode erstellen','create-school-code',()=>{
  if(busy)return;if(value?.status==='active'&&!doc.defaultView.confirm('Den bisherigen Schulcode ersetzen? Bereits zugeordnete Lehrkräfte bleiben in der Schule.'))return;
  busy=true;create.disabled=true;revoke.disabled=true;
  void(async()=>{try{
   const made=await client.request('createSchoolJoinCode',{schoolId,requestId:crypto.randomUUID()});if(!root.isConnected)return;
   output.replaceChildren();if(!made.code){state.textContent='Dieser Code wurde bereits erstellt. Bitte einen neuen Schulcode erstellen.';return;}
   value={id:made.codeId,status:'active',expiresAtMs:made.expiresAtMs};
   const label=el(doc,'label','Schulcode zum Weitergeben'),text=el(doc,'textarea');text.name='generatedSchoolCode';text.value=made.code;text.readOnly=true;text.rows=2;text.autocomplete='off';text.spellcheck=false;label.append(text);
   output.append(label,el(doc,'p','Nur ans Kollegium weitergeben. Der Code wird nur jetzt angezeigt.','hint'));busy=false;show();text.focus();text.select();
  }catch(error){if(root.isConnected)report(error);}finally{busy=false;create.disabled=false;revoke.disabled=value?.status!=='active';}})();
 },true);
 const revoke=action(doc,buttons,'Schulcode deaktivieren','revoke-school-code',()=>{
  if(busy||value?.status!=='active'||!doc.defaultView.confirm('Den Schulcode deaktivieren? Bestehende Schulzuordnungen bleiben erhalten.'))return;
  busy=true;create.disabled=true;revoke.disabled=true;
  void(async()=>{try{
   await client.request('revokeSchoolJoinCode',{schoolId,codeId:value.id});if(!root.isConnected)return;
   value={...value,status:'revoked'};output.replaceChildren();busy=false;show();
  }catch(error){if(root.isConnected)report(error);}finally{busy=false;create.disabled=false;revoke.disabled=value?.status!=='active';}})();
 });
 show();
}
