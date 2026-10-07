// Local-only annotations. Does not open the review sidebar or change page geometry.
if (['localhost','127.0.0.1'].includes(location.hostname)) {
  const style=document.createElement('style');
  style.textContent='[data-review-toggle],[data-review-panel]{display:none!important}html.reviewPanelOpen body{margin-right:0!important}.gcLocalCapture{position:fixed;z-index:2147483000;inset:0;cursor:crosshair;touch-action:none}.gcLocalCaptureBox{position:absolute;border:2px solid #173f55;background:#173f5518;pointer-events:none}.gcLocalNote{border:1px solid #c9dce3;border-radius:16px;padding:20px;width:min(420px,calc(100vw - 32px));color:#173f55;background:white;box-shadow:0 12px 50px #173f5530}.gcLocalNote::backdrop{background:#173f5515}.gcLocalNote label{display:block;font:600 16px system-ui;margin-bottom:12px}.gcLocalNote textarea{width:100%;min-height:100px;border:1px solid #bacdd6;border-radius:8px;padding:10px;font:15px system-ui;resize:vertical}.gcLocalNoteActions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.gcLocalNote button{border:1px solid #bacdd6;border-radius:8px;padding:9px 14px;background:white;color:#173f55;font:600 13px system-ui}.gcLocalNote button[type=submit]{background:#173f55;color:white}';
  document.head.append(style);
  const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Bereich ausschneiden und Änderung beschreiben');button.title='Bereich markieren';button.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/><path d="M7 7h10v10H7z" stroke-dasharray="2 2"/></svg>';
  button.style.cssText='position:fixed;z-index:2147482900;width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:8px;background:#173f55;color:white;cursor:pointer;padding:6px';
  document.body.append(button);
  const position=()=>{if(!document?.body)return;const brand=document.querySelector('.topbar .brand');const r=brand?.getBoundingClientRect();button.style.left=`${r?Math.min(r.right+10,innerWidth-48):16}px`;button.style.top=`${r?r.top+(r.height-34)/2:16}px`;};
  let overlay=null;
  function cancel(){overlay?.remove();overlay=null;button.setAttribute('aria-pressed','false');}
  function writeNote(region){
    const dialog=document.createElement('dialog');dialog.className='gcLocalNote';
    const form=document.createElement('form');form.method='dialog';
    const label=document.createElement('label');label.textContent='Was möchtest du hier ändern?';
    const input=document.createElement('textarea');input.maxLength=3000;input.required=true;label.append(input);
    const actions=document.createElement('div');actions.className='gcLocalNoteActions';
    const back=document.createElement('button');back.type='button';back.textContent='Abbrechen';back.onclick=()=>dialog.close();
    const save=document.createElement('button');save.type='submit';save.textContent='Speichern';actions.append(back,save);form.append(label,actions);dialog.append(form);document.body.append(dialog);
    form.addEventListener('submit',event=>{event.preventDefault();const text=input.value.trim();if(!text)return;
      try{const key='gradecrew-local-region-notes-v1';const old=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(old))throw Error('Invalid notes');old.push({id:crypto.randomUUID(),createdAt:Date.now(),text,region,url:location.pathname+location.search,view:[...document.querySelectorAll('main section[id]')].find(x=>!x.classList.contains('hidden'))?.id||'',status:'open'});localStorage.setItem(key,JSON.stringify(old));dialog.close();}catch{input.setCustomValidity('Der Hinweis konnte nicht lokal gespeichert werden.');input.reportValidity();}
    });
    input.oninput=()=>input.setCustomValidity('');dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();input.focus();
  }
  button.onclick=event=>{event.stopPropagation();if(overlay){cancel();return;}document.querySelector('[data-review-close]')?.click();document.documentElement.classList.remove('reviewPanelOpen');button.setAttribute('aria-pressed','true');
    overlay=document.createElement('div');overlay.className='gcLocalCapture';const box=document.createElement('div');box.className='gcLocalCaptureBox';overlay.append(box);document.body.append(overlay);let start=null;
    overlay.onpointerdown=event=>{if(event.button!==0||event.isPrimary===false)return;start={x:event.clientX,y:event.clientY,id:event.pointerId};overlay.setPointerCapture?.(event.pointerId);event.preventDefault();};
    const bounds=event=>({x:Math.min(start.x,event.clientX),y:Math.min(start.y,event.clientY),width:Math.abs(event.clientX-start.x),height:Math.abs(event.clientY-start.y)});
    overlay.onpointermove=event=>{if(!start)return;const b=bounds(event);Object.assign(box.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});};
    overlay.onpointerup=event=>{if(!start||event.pointerId!==start.id)return;const b=bounds(event);const region={...b,viewportWidth:innerWidth,viewportHeight:innerHeight,scrollX,scrollY};cancel();if(b.width>=8&&b.height>=8)writeNote(region);};overlay.onpointercancel=cancel;
  };
  document.addEventListener('keydown',event=>{if(event.key==='Escape')cancel();});
  window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});new MutationObserver(position).observe(document.body,{childList:true,subtree:true});position();
}
