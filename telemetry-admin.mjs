import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
export function installTelemetryAdmin({app,host}){
 if(!host)return;
 const section=document.createElement('section');section.className='card';const title=document.createElement('h3');title.textContent='Runden- und Release-Diagnose (Staging)';
 const note=document.createElement('p');note.textContent='Eigene Tests. Clientmeldungen und serverseitig gespeicherte Abgaben werden getrennt ausgewiesen. Keine Daten bedeutet keinen Erfolgsnachweis.';
 const input=document.createElement('input');input.placeholder='Testcode';input.setAttribute('aria-label','Testcode für Rundendiagnose');
 const button=document.createElement('button');button.type='button';button.textContent='Diagnose laden';button.className='button secondary';
 const output=document.createElement('pre');output.style.whiteSpace='pre-wrap';output.setAttribute('aria-live','polite');
 section.append(title,note,input,button,output);host.append(section);
 const functions=getFunctions(app,'europe-west1');
 button.addEventListener('click',async()=>{button.disabled=true;output.textContent='Wird geladen …';try{
  const id=input.value.trim().toUpperCase();const summary=(await httpsCallable(functions,'getAssessmentTelemetrySummary')({days:7})).data;
  const round=id?(await httpsCallable(functions,'getAssessmentRunDiagnostics')({quizId:id})).data:null;
  output.textContent=JSON.stringify({receivedClientOperations:summary,serverConfirmedRound:round},null,2);
 }catch(error){output.textContent=error.code==='functions/failed-precondition'?'Die Messung ist noch nicht aktiviert.':'Diagnose nicht verfügbar. Anmeldung, Berechtigung und Backend prüfen.';}finally{button.disabled=false;}});
 return ()=>section.remove();
}
