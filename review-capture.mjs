// Permission-gated compact annotation surface; never changes page geometry.
export function installCompactCapture({document,saveNote}) {
  const window=document.defaultView;
  const style=document.createElement('style');
  style.textContent='.gcLocalCapture{position:fixed;z-index:2147483000;inset:0;cursor:crosshair;touch-action:none}.gcLocalCaptureBox{position:absolute;border:2px solid #173f55;background:#173f5518;pointer-events:none}.gcLocalNote{border:1px solid #c9dce3;border-radius:16px;padding:20px;width:min(420px,calc(100vw - 32px));color:#173f55;background:white;box-shadow:0 12px 50px #173f5530}.gcLocalNote::backdrop{background:#173f5515}.gcLocalNote label{display:block;font:600 16px system-ui;margin-bottom:12px}.gcLocalNote textarea{width:100%;min-height:100px;border:1px solid #bacdd6;border-radius:8px;padding:10px;font:15px system-ui;resize:vertical}.gcLocalNoteActions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.gcLocalNote button{border:1px solid #bacdd6;border-radius:8px;padding:9px 14px;background:white;color:#173f55;font:600 13px system-ui}.gcLocalNote button[type=submit]{background:#173f55;color:white}';
  document.head.append(style);
  const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Bereich ausschneiden und Änderung beschreiben');button.title='Bereich markieren';button.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/><path d="M7 7h10v10H7z" stroke-dasharray="2 2"/></svg>';
  button.style.cssText='position:fixed;z-index:2147482900;width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:8px;background:#173f55;color:white;cursor:pointer;padding:6px';
  document.body.append(button);
  const position=()=>{if(!document?.body)return;const host=[...document.querySelectorAll('dialog[open]')].filter(d=>!d.classList.contains('gcLocalNote')).at(-1)||document.body;if(button.parentElement!==host)host.append(button);const brand=document.querySelector('.topbar .brand');const r=brand?.getBoundingClientRect();button.style.left=`${r?Math.min(r.right+10,window.innerWidth-48):16}px`;button.style.top=`${r?r.top+(r.height-34)/2:16}px`;};
  let overlay=null;
  function cancel(){overlay?.remove();overlay=null;button.setAttribute('aria-pressed','false');}
  function writeNote(region){
    const requestId=window.crypto.randomUUID();
    const dialog=document.createElement('dialog');dialog.className='gcLocalNote';
    const form=document.createElement('form');form.method='dialog';
    const label=document.createElement('label');label.textContent='Was möchtest du hier ändern?';
    const input=document.createElement('textarea');input.maxLength=3000;input.required=true;label.append(input);
    const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='font:13px system-ui;color:#9b2637';
    const actions=document.createElement('div');actions.className='gcLocalNoteActions';
    const back=document.createElement('button');back.type='button';back.textContent='Abbrechen';back.onclick=()=>dialog.close();
    const save=document.createElement('button');save.type='submit';save.textContent='Speichern';actions.append(back,save);form.append(label,status,actions);dialog.append(form);document.body.append(dialog);
    form.addEventListener('submit',event=>{event.preventDefault();const text=input.value.trim();if(!text)return;
      save.disabled=true;status.textContent='';
      Promise.resolve(saveNote({text,region,clientRequestId:requestId})).then(()=>dialog.close()).catch(error=>{status.textContent=error.message||'Nicht gespeichert. Bitte erneut versuchen.';}).finally(()=>{save.disabled=false;});
    });
    input.oninput=()=>input.setCustomValidity('');dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();input.focus();
  }
  button.onclick=event=>{event.stopPropagation();if(overlay){cancel();return;}button.setAttribute('aria-pressed','true');
    overlay=document.createElement('div');overlay.className='gcLocalCapture';const box=document.createElement('div');box.className='gcLocalCaptureBox';overlay.append(box);(document.querySelector('dialog[open]')||document.body).append(overlay);let start=null;
    overlay.onpointerdown=event=>{if(event.button!==0||event.isPrimary===false)return;start={x:event.clientX,y:event.clientY,id:event.pointerId};overlay.setPointerCapture?.(event.pointerId);event.preventDefault();};
    const bounds=event=>({x:Math.min(start.x,event.clientX),y:Math.min(start.y,event.clientY),width:Math.abs(event.clientX-start.x),height:Math.abs(event.clientY-start.y)});
    overlay.onpointermove=event=>{if(!start)return;const b=bounds(event);Object.assign(box.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});};
    overlay.onpointerup=event=>{if(!start||event.pointerId!==start.id)return;const b=bounds(event);const region={...b,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,scrollX:window.scrollX,scrollY:window.scrollY};cancel();if(b.width>=8&&b.height>=8)writeNote(region);};overlay.onpointercancel=cancel;
  };
  const keydown=event=>{if(event.key==='Escape')cancel();};document.addEventListener('keydown',keydown);
  window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});const observer=new window.MutationObserver(position);observer.observe(document.body,{childList:true,subtree:true});position();
  return {dispose(){observer.disconnect();cancel();document.querySelectorAll('.gcLocalNote').forEach(d=>d.remove());button.remove();style.remove();document.removeEventListener('keydown',keydown);window.removeEventListener('resize',position);window.removeEventListener('scroll',position);}};
}
