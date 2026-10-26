export const deviceExitLabels=Object.freeze({pending:'Angefordert – wartet auf Verbindung',delivered:'Am iPad angekommen – Apple-Bestätigung ausstehend',ended:'Prüfungsmodus beendet – vom iPad bestätigt',failed:'Gerät meldet ein Problem – bitte vor Ort helfen',resume_allowed:'Fortsetzung desselben Versuchs erlaubt'});
export function mountDeviceHelp({host,row,assignment,api,onChanged=()=>{}}){
 const doc=host.ownerDocument,el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};host.replaceChildren();host.append(el('h3','Prüfungsmodus beenden'),el('p','Beendet die GradeCrew-Sperre auf diesem iPad. Antworten bleiben gesichert; es wird nichts abgegeben.'));
 const state=el('p',row.deviceExit?deviceExitLabels[row.deviceExit.state]:'');state.setAttribute('role','status');host.append(state);
 const help=el('details'),summary=el('summary','iPad reagiert nicht?');help.append(summary,el('p','Ohne Verbindung oder bei eingefrorener App kommt der Auftrag nicht an. Prüfe das WLAN; nötigenfalls Neustart nach Apple-Anleitung. App nicht löschen: Antworten können noch auf dem Gerät liegen. Andere Gerätesperren verwaltet die Schul-IT.'));
 const link=el('a','Apple: iPad neu starten, wenn es nicht reagiert');link.href='https://support.apple.com/de-de/guide/ipad/ipad9955c007/ipados';link.target='_blank';link.rel='noopener noreferrer';help.append(link);host.append(help);
 const unavailable=!row.attemptId?'Noch kein Prüfungsversuch auf einem iPad verbunden.':row.deviceCapabilities?.exitProtocol!==1?'Diese Secure-Version hat die Gerätehilfe noch nicht bestätigt. App aktualisieren und den Versuch erneut verbinden. Build 1221 unterstützt sie noch nicht.':null;
 if(unavailable){const action=el('button','Prüfungsmodus beenden');action.type='button';action.className='button primary';action.disabled=true;host.insertBefore(action,help);state.textContent=unavailable;return;}
 if(row.deviceExit&&row.deviceExit.state!=='resume_allowed'){
  if(row.deviceExit.state==='ended'){
   const allow=el('button','Fortsetzung desselben Versuchs erlauben');allow.type='button';allow.className='button primary';allow.addEventListener('click',async()=>{if(allow.disabled)return;allow.disabled=true;try{const result=await api.teacher('allowDeviceResume',{assignmentId:assignment.id,studentId:row.studentId,attemptId:row.attemptId,expectedGeneration:row.generation,actionId:row.deviceExit.actionId,confirm:true});state.textContent=deviceExitLabels[result.action.state];await onChanged();}catch(e){state.textContent=e.message;allow.disabled=false;}});host.append(allow);
  }return;
 }
 const open=el('button','Prüfungsmodus beenden');open.type='button';open.className='button primary';host.insertBefore(open,help);open.addEventListener('click',()=>{open.hidden=true;showConfirmation();});
 function showConfirmation(){
 const form=el('form');form.className='gcOnlineForm';form.append(el('p',`${row.name} · ${assignment.title||'Prüfung'}`));const label=el('label','Technischer Grund'),reason=el('textarea');reason.required=true;reason.maxLength=300;label.append(reason);form.append(label);
 const confirm=el('label'),checkbox=el('input');checkbox.type='checkbox';checkbox.required=true;confirm.append(checkbox,el('span','Für diese Person den Prüfungsmodus beenden.'));form.append(confirm);
 const submit=el('button','Beenden bestätigen');submit.type='submit';submit.className='button primary';form.append(submit);host.append(form);const actionId=doc.defaultView.crypto.randomUUID();
 form.addEventListener('submit',async event=>{event.preventDefault();if(submit.disabled||!form.reportValidity())return;submit.disabled=true;try{const result=await api.teacher('requestDeviceExit',{assignmentId:assignment.id,studentId:row.studentId,attemptId:row.attemptId,expectedGeneration:row.generation,actionId,reason:reason.value,confirm:checkbox.checked});state.textContent=deviceExitLabels[result.action.state]||'Bestätigung ausstehend';form.hidden=true;await onChanged();}catch(e){state.textContent=e.message;submit.disabled=false;}});
 }
}
