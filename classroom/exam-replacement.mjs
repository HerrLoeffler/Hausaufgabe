export function mountReplacementHelp(options){
 const {host,row,round}=options,doc=host.ownerDocument,el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};host.replaceChildren();
 host.append(el('h3','Test neu starten'),el('p','Gibt einen leeren Ersatzversuch frei. Der bisherige Stand bleibt geschützt erhalten.'));
 const unavailable=row.status==='submitted'?'Bereits abgegeben – die Arbeit bleibt abgeschlossen.':round?.state==='closed'?'Diese Prüfungsrunde ist geschlossen.':!row.attemptId?'Noch nicht begonnen – der Schüler kann den Test selbst öffnen.':null;
 const action=el('button','Test neu starten');action.type='button';action.className='button primary';action.disabled=!!unavailable;host.append(action);
 if(unavailable){const state=el('p',unavailable);state.setAttribute('role','status');host.append(state);return;}
 const panel=el('section');host.append(panel);action.addEventListener('click',()=>{action.hidden=true;createReplacementForm({...options,host:panel});});
}
export function createReplacementForm({host,api,row,assignment,round,onReleased=()=>{}}){
 const doc=host.ownerDocument,el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};host.replaceChildren();
 if(row.status==='submitted'||round?.state==='closed'||!row.attemptId){host.append(el('p','Für diesen Stand ist kein technischer Ersatzversuch nötig oder freigebbar. Bereits abgegebene Arbeiten bleiben abgeschlossen.'));return;}
 const form=el('form');form.className='gcOnlineForm';form.append(el('h3',`Neuer Versuch für ${row.name}`),el('p',round?.deadlineAt?`Gemeinsame Frist: ${new Date(round.deadlineAt).toLocaleString('de-DE')}. Der Ersatzversuch verlängert diese Frist nicht.`:'Diese Runde hat kein Zeitlimit.'),el('p','Der alte Versuch kann danach nicht mehr abgegeben werden. Seine Antworten bleiben gesichert und werden nicht übernommen.'));
 const label=el('label','Begründung'),reason=el('textarea');reason.required=true;reason.maxLength=300;label.append(reason);form.append(label);
 const checkLabel=el('label','Ich möchte für diese Person ausdrücklich einen neuen Versuch freigeben.'),check=el('input');check.type='checkbox';check.required=true;checkLabel.prepend(check);form.append(checkLabel);
 const submit=el('button','Neuen Versuch bestätigen');submit.type='submit';submit.className='button primary';submit.disabled=true;form.append(submit);let pending=false,completed=false;
 const update=()=>submit.disabled=pending||completed||!check.checked||!reason.value.trim();reason.addEventListener('input',update);check.addEventListener('change',update);
 form.addEventListener('submit',async event=>{event.preventDefault();if(pending||completed||!form.reportValidity()||!reason.value.trim())return;pending=true;update();form.querySelector('[role=alert]')?.remove();try{await api.teacher('restart',{assignmentId:assignment.id,studentId:row.studentId,expectedGeneration:row.generation,reason:reason.value.trim(),confirm:true});completed=true;form.append(el('p','Neuer Versuch freigegeben. Secure zeigt die Freigabe beim nächsten Kontakt; der Schüler übernimmt sie ausdrücklich.'));await onReleased();}catch(e){const error=el('p',e.message);error.setAttribute('role','alert');form.append(error);}finally{pending=false;update();}});host.append(form);
}
