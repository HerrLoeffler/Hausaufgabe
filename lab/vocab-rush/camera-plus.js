(() => {
'use strict';
const $=id=>document.getElementById(id);

function status(text){const el=$('importStatus');if(el)el.textContent=text;}
function enqueueFile(file){const input=$('vrMultiInput');if(!input)throw new Error('Importbereich ist noch nicht bereit.');const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));}
function waitForNewPageAndCrop(previousCount){
  const started=Date.now();
  const timer=setInterval(()=>{
    const cards=[...document.querySelectorAll('#vrPageQueue .vrPageCard')];
    if(cards.length>previousCount){clearInterval(timer);cards[cards.length-1]?.querySelector('[data-crop]')?.click();return;}
    if(Date.now()-started>3000)clearInterval(timer);
  },80);
}
function ensureClipboardButton(){const actions=document.querySelector('#vrDropZone .vrDropActions');if(!actions||$('vrPasteImageBtn'))return;const btn=document.createElement('button');btn.id='vrPasteImageBtn';btn.className='secondary';btn.type='button';btn.textContent='📋 Bild einfügen';btn.addEventListener('click',pasteFromClipboard);actions.append(btn);const hint=document.createElement('small');hint.className='vrClipboardHint';hint.textContent='Oder Screenshot kopieren und hier Strg+V / Cmd+V drücken.';actions.closest('#vrDropZone')?.append(hint);}
async function pasteFromClipboard(){
  if(!navigator.clipboard?.read){status('Direktes Einfügen wird von diesem Browser nicht unterstützt. Kopiere den Screenshot und drücke hier Strg+V bzw. Cmd+V.');return;}
  try{
    const items=await navigator.clipboard.read();
    for(const item of items){
      const type=item.types.find(t=>t.startsWith('image/'));
      if(!type)continue;
      const blob=await item.getType(type);
      const ext=type.includes('png')?'png':type.includes('webp')?'webp':'jpg';
      const before=document.querySelectorAll('#vrPageQueue .vrPageCard').length;
      enqueueFile(new File([blob],`Zwischenablage-${Date.now()}.${ext}`,{type}));
      status('Bild aus der Zwischenablage hinzugefügt.');
      waitForNewPageAndCrop(before);
      return;
    }
    status('In der Zwischenablage wurde kein Bild gefunden.');
  }catch(err){
    status('Zwischenablage konnte nicht direkt gelesen werden. Kopiere den Screenshot und drücke hier Strg+V bzw. Cmd+V.');
  }
}
function handlePaste(e){
  const editor=$('setEditorView');
  if(!editor||editor.hidden)return;
  const items=[...(e.clipboardData?.items||[])];
  const image=items.find(i=>i.type?.startsWith('image/'));
  if(!image)return;
  const file=image.getAsFile();
  if(!file)return;
  e.preventDefault();
  const before=document.querySelectorAll('#vrPageQueue .vrPageCard').length;
  enqueueFile(new File([file],`Screenshot-${Date.now()}.png`,{type:file.type||'image/png'}));
  status('Screenshot aus der Zwischenablage hinzugefügt.');
  waitForNewPageAndCrop(before);
}
async function captureScreen(e){
  if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
  if(!navigator.mediaDevices?.getDisplayMedia){status('Dieser Browser unterstützt direkte Bildschirm-Screenshots nicht. Nutze „Dateien auswählen“ oder füge einen Screenshot mit Cmd+V / Strg+V ein.');return;}
  let stream=null;
  try{
    status('Wähle jetzt Bildschirm, Fenster oder Tab aus …');
    stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
    const video=document.createElement('video');
    video.srcObject=stream;video.muted=true;video.playsInline=true;
    await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});
    await video.play();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const canvas=document.createElement('canvas');
    canvas.width=video.videoWidth;canvas.height=video.videoHeight;
    canvas.getContext('2d').drawImage(video,0,0);
    stream.getTracks().forEach(track=>track.stop());stream=null;
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('Screenshot konnte nicht erzeugt werden.');
    const before=document.querySelectorAll('#vrPageQueue .vrPageCard').length;
    enqueueFile(new File([blob],`Bildschirm-${Date.now()}.png`,{type:'image/png'}));
    status('Screenshot hinzugefügt. Wähle jetzt den Vokabelbereich aus.');
    waitForNewPageAndCrop(before);
  }catch(err){
    stream?.getTracks().forEach(track=>track.stop());
    if(err?.name==='NotAllowedError'||err?.name==='AbortError'){status('Screenshot-Auswahl abgebrochen.');return;}
    status(`Screenshot konnte nicht erstellt werden: ${err?.message||'Unbekannter Fehler'}`);
  }
}
function wireScreenshotButton(){const btn=$('photoImportBtn');if(!btn||btn.dataset.screenCapture)return;btn.dataset.screenCapture='1';btn.textContent='🖥 Screenshot aufnehmen';btn.addEventListener('click',captureScreen,true);}
function init(){wireScreenshotButton();ensureClipboardButton();document.addEventListener('paste',handlePaste);const target=$('setEditorView');if(target)new MutationObserver(()=>{wireScreenshotButton();ensureClipboardButton();}).observe(target,{childList:true,subtree:true});}
init();
})();
