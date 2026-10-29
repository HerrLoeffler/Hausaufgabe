import {el,add,field,details} from './operations-ui.mjs';
import {plainSummary,date} from './operations-model.mjs';
export const intakeState={saved:'Gespeichert',waiting_connection:'Anschluss fehlt',waiting_coordinator:'Wartet auf die Zentrale',routing:'Zentrale ordnet zu',waiting_user:'Deine Antwort fehlt',sending:'Wird übermittelt',running:'Fachbearbeitung läuft',unknown:'Versand abgleichen',answered:'Ergebnis liegt vor',needs_attention:'Klärung erforderlich'};
export function renderIntake(root,client,state){
 const section=el('section',undefined,'ops-intake');section.setAttribute('aria-label','Mit der Zentrale sprechen');
 add(section,el('h2','Was soll die Zentrale für dich klären?'),el('p','Ein Anliegen eingeben. Die Zentrale übernimmt die Zuordnung und führt die Antworten hier zusammen.','ops-muted'));
 const form=el('form'),input=field('Dein Anliegen','central-intake'),error=el('p',undefined,'error'),send=el('button',state?.connected?'An Zentrale senden':'Anliegen vormerken','button primary');input.input.dataset.keep='central-intake';input.input.required=true;input.input.maxLength=12000;send.type='submit';error.setAttribute('role','status');
 const draftKey='gradecrew-central-intake-v1';let draft={id:crypto.randomUUID(),text:''},storageError=false;
 try{const old=JSON.parse(localStorage.getItem(draftKey)||'null');if(old){if(typeof old.id!=='string'||typeof old.text!=='string')throw Error();draft=old;}}catch{storageError=true;error.textContent='Vorhandener Entwurf ist nicht lesbar und wurde nicht überschrieben. Text vor dem Schließen sichern.';}
 input.input.value=draft.text;
 input.input.addEventListener('input',()=>{draft.text=input.input.value;if(!storageError)try{localStorage.setItem(draftKey,JSON.stringify(draft));}catch{storageError=true;error.textContent='Entwurf konnte nicht gespeichert werden. Text vor dem Schließen sichern.';}});
 add(form,input.label,error,send);section.append(form);
 if(!state?.connected)section.append(el('p','Der Versandanschluss ist noch nicht verbunden. Dein Anliegen kann gespeichert werden; die Bearbeitung ist noch nicht gestartet.','ops-connection-note'));
 if(state?.mode==='own-specialists')section.append(el('p','Fachbearbeitung in eigenen Verläufen der Zentrale. '+state.profile,'ops-footnote'));
 if(storageError)send.disabled=true;
 form.onsubmit=async e=>{e.preventDefault();send.disabled=true;error.textContent='';try{
  await client.post('/api/intake',{id:draft.id,text:input.input.value});draft={id:crypto.randomUUID(),text:''};input.input.value='';input.input.dispatchEvent(new Event('input',{bubbles:true}));await client.refresh();
 }catch(x){error.textContent=x.message;send.disabled=false;}};
 const jobs=state?.items||[];
 for(const job of jobs){const article=el('article',undefined,'ops-intake-job');add(article,add(el('header'),el('h3',plainSummary(job.title||job.text,130)),el('span',intakeState[job.state]||'Stand prüfen','ops-status')),el('small',date(job.createdAt),'ops-muted'));
  if(job.error)article.append(el('p',job.error,'ops-connection-note'));
  if(job.specialistLabel)article.append(el('p','Fachbearbeitung: '+job.specialistLabel,'ops-domain-label'));
  if(job.question){const reply=el('form'),answer=field('Deine Antwort','intake-answer-'+job.id),note=el('p',undefined,'error'),submit=el('button','Antwort senden','button primary');answer.input.dataset.keep='intake-answer-'+job.id;answer.input.required=true;answer.input.maxLength=4000;submit.type='submit';add(reply,el('p',job.question.text,'ops-chat-text'),answer.label,note,submit);reply.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{await client.post('/api/intake/answer',{id:job.id,questionId:job.question.callId,answer:answer.input.value});answer.input.value='';answer.input.dispatchEvent(new Event('input',{bubbles:true}));await client.refresh();}catch(x){note.textContent=x.message;submit.disabled=false;}};article.append(reply);}
  if(job.result)article.append(add(el('div',undefined,'ops-chat-text'),el('p',job.result)));
  else if(job.progress)article.append(el('p',plainSummary(job.progress,450),'ops-chat-text'));
  if(job.report&&job.report!==job.result)article.append(details('Bericht und Quellen',el('p',job.report,'ops-chat-text')));
  article.append(details('Anliegen und Nachweis',el('p',job.text,'ops-chat-text'),el('p',`Kennung: ${job.id}`,'ops-footnote'),el('p',job.turnId?'Gebundener Lauf: '+job.turnId:'Noch kein gestarteter Lauf belegt.','ops-footnote')));section.append(article);
 }
 root.append(section);
}
