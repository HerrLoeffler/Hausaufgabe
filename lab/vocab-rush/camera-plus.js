(() => {
'use strict';
const $=id=>document.getElementById(id);
let cameraStream=null;
let capturedBlob=null;

function status(text){const el=$('importStatus');if(el)el.textContent=text;}
function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}}
function enqueueFile(file){const input=$('vrMultiInput');if(!input)throw new Error('Importbereich ist noch nicht bereit.');const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));}
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
      enqueueFile(new File([blob],`Zwischenablage-${Date.now()}.${ext}`,{type}));
      status('Bild aus der Zwischenablage hinzugefügt.');
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
  enqueueFile(new File([file],`Screenshot-${Date.now()}.png`,{type:file.type||'image/png'}));
  status('Screenshot aus der Zwischenablage hinzugefügt.');
}
function ensureCameraDialog(){
  if($('vrCameraDialog'))return;
  const d=document.createElement('dialog');d.id='vrCameraDialog';d.className='vrDialog';
  d.innerHTML=`<div class="vrDialogCard vrCameraCard"><div class="vrDialogHead"><div><p class="eyebrow">KAMERA</p><h2>Vokabelseite fotografieren</h2><p>Halte die Seite möglichst gerade und gut beleuchtet ins Bild.</p></div><button id="vrCameraClose" class="vrClose" type="button">×</button></div><div class="vrCameraStage"><video id="vrCameraVideo" autoplay playsinline></video><canvas id="vrCameraCanvas" hidden></canvas></div><p id="vrCameraError" class="error"></p><div class="vrDialogFoot vrCameraActions"><button id="vrCameraRetake" class="secondary" type="button" hidden>Neu aufnehmen</button><button id="vrCameraSnap" class="primary" type="button">Foto aufnehmen</button><button id="vrCameraUse" class="primary" type="button" hidden>Foto verwenden</button></div></div>`;
  document.body.append(d);
  $('vrCameraClose').addEventListener('click',closeCamera);
  $('vrCameraSnap').addEventListener('click',takeSnapshot);
  $('vrCameraRetake').addEventListener('click',retake);
  $('vrCameraUse').addEventListener('click',useSnapshot);
  d.addEventListener('close',stopCamera);
}
async function openCamera(e){
  if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
  ensureCameraDialog();
  const d=$('vrCameraDialog'),error=$('vrCameraError');
  error.textContent='';capturedBlob=null;
  $('vrCameraCanvas').hidden=true;$('vrCameraVideo').hidden=false;$('vrCameraSnap').hidden=false;$('vrCameraUse').hidden=true;$('vrCameraRetake').hidden=true;
  d.showModal();
  if(!navigator.mediaDevices?.getUserMedia){error.textContent='Dieser Browser kann die Kamera nicht direkt öffnen. Nutze bitte „Dateien auswählen“.';return;}
  try{
    stopCamera();
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
    $('vrCameraVideo').srcObject=cameraStream;
    await $('vrCameraVideo').play();
  }catch(err){
    error.textContent='Kamera konnte nicht geöffnet werden. Bitte Kamerazugriff erlauben oder „Dateien auswählen“ verwenden.';
  }
}
function takeSnapshot(){
  const video=$('vrCameraVideo'),canvas=$('vrCameraCanvas');
  if(!video.videoWidth||!video.videoHeight){$('vrCameraError').textContent='Kamerabild ist noch nicht bereit.';return;}
  const max=2200,scale=Math.min(1,max/Math.max(video.videoWidth,video.videoHeight));
  canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
  canvas.hidden=false;video.hidden=true;
  $('vrCameraSnap').hidden=true;$('vrCameraUse').hidden=false;$('vrCameraRetake').hidden=false;
  canvas.toBlob(blob=>{capturedBlob=blob;},'image/jpeg',.9);
}
function retake(){capturedBlob=null;$('vrCameraCanvas').hidden=true;$('vrCameraVideo').hidden=false;$('vrCameraSnap').hidden=false;$('vrCameraUse').hidden=true;$('vrCameraRetake').hidden=true;}
function useSnapshot(){
  if(!capturedBlob){$('vrCameraError').textContent='Foto wird noch vorbereitet. Bitte kurz erneut versuchen.';return;}
  enqueueFile(new File([capturedBlob],`Foto-${Date.now()}.jpg`,{type:'image/jpeg'}));
  status('Foto hinzugefügt. Du kannst weitere Seiten aufnehmen oder alle Seiten auslesen.');
  closeCamera();
}
function closeCamera(){stopCamera();const d=$('vrCameraDialog');if(d?.open)d.close();}
function wirePhotoButton(){const btn=$('photoImportBtn');if(!btn||btn.dataset.cameraPlus)return;btn.dataset.cameraPlus='1';btn.textContent='📷 Foto aufnehmen';btn.addEventListener('click',openCamera,true);}
function init(){ensureCameraDialog();wirePhotoButton();ensureClipboardButton();document.addEventListener('paste',handlePaste);const target=$('setEditorView');if(target)new MutationObserver(()=>{wirePhotoButton();ensureClipboardButton();}).observe(target,{childList:true,subtree:true});}
init();
})();
