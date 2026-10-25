export function showRecoveredAi({kind,result,requestId},{openTest,acknowledge,document=globalThis.document}){
 const test=result.test||{title:'Wiederhergestellte KI-Aufgabe',questions:[result.question]};
 if(!test.questions?.length)throw Error('Die gespeicherte KI-Fassung enthält keine Aufgaben.');
 const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Gespeichertes KI-Ergebnis prüfen');dialog.style.cssText='max-width:720px;width:calc(100% - 32px);max-height:85vh;overflow:auto;border:1px solid #c6cfde;border-radius:16px;padding:24px';
 const heading=document.createElement('h2');heading.textContent='Dein gespeichertes KI-Ergebnis';dialog.append(heading);
 const explanation=document.createElement('p');explanation.textContent='Prüfe die Fassung. Erst mit „Im Editor öffnen“ wechselst du von deinem aktuellen Test zu diesem Ergebnis.';dialog.append(explanation);
 const title=document.createElement('h3');title.textContent=test.title||'KI-Test';dialog.append(title);
 const list=document.createElement('ol');for(const q of test.questions){const item=document.createElement('li');item.textContent=q.text+' ('+q.points+' P.)';list.append(item);}dialog.append(list);
 const status=document.createElement('p');status.setAttribute('role','status');dialog.append(status);
 const open=document.createElement('button');open.type='button';open.className='button';open.textContent='Im Editor öffnen';open.addEventListener('click',async()=>{open.disabled=true;try{await openTest(test);await acknowledge(requestId);dialog.close();dialog.remove();}catch(e){status.textContent=e.message;open.disabled=false;}});dialog.append(open);
 const close=document.createElement('button');close.type='button';close.className='button secondary';close.textContent='Später prüfen';close.addEventListener('click',()=>{dialog.close();dialog.remove();});dialog.append(close);dialog.addEventListener('cancel',()=>dialog.remove());document.body.append(dialog);dialog.showModal();return dialog;
}
