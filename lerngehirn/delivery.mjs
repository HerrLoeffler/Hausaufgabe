const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderDelivery(task){
 if(task?.media?.kind!=='listen')return '';
 return `<section class="audio-task" aria-label="Höraufgabe"><p>Höre genau zu. Du kannst den Hörtext mehrfach abspielen.</p><button type="button" data-listen-task="${esc(task.id)}">Hörtext laden</button><div data-audio-player role="status"></div><small>Mit KI eingesprochener Übungstext.</small></section>`;
}
export function bindDelivery(root,session,call){
 const buttons=root.querySelectorAll('[data-listen-task]');for(const button of buttons){
 button.addEventListener('click',async()=>{
  button.disabled=true;button.textContent='Hörtext wird geladen …';
  const target=button.closest('.audio-task').querySelector('[data-audio-player]');
  try{
   const result=await call('learningBrainAudio',{sessionId:session.id,revision:session.revision,taskId:button.dataset.listenTask});
   if(!result?.audioDataUrl?.startsWith('data:audio/mpeg;base64,'))throw new Error('audio');
   const task=[session.task,session.originalTask].find(t=>t?.id===button.dataset.listenTask);
   const rates=task?.media?.compareTempo?[.75,1.25]:[1];
   target.replaceChildren();
   rates.forEach((rate,i)=>{const label=document.createElement('p');label.textContent=rates.length===2?'Fassung '+(i===0?'A':'B'):'Hörtext';const audio=document.createElement('audio');audio.controls=true;audio.src=result.audioDataUrl;audio.playbackRate=rate;audio.setAttribute('aria-label',label.textContent);target.append(label,audio);});button.hidden=true;
   // Loading is a deliberate click; playback remains under the child's control.
   target.querySelector('audio')?.focus();
  }catch{button.disabled=false;button.textContent='Hörtext erneut laden';target.textContent='Der Hörtext konnte noch nicht geladen werden. Versuche es erneut.';}
 });
 }
}
