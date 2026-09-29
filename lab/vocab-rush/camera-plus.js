(() => {
'use strict';
const $=id=>document.getElementById(id);

function status(text){const el=$('importStatus');if(el)el.textContent=text;}
function enqueueFile(file){
  const input=$('vrMultiInput');
  if(!input)throw new Error('Importbereich ist noch nicht bereit.');
  const dt=new DataTransfer();
  dt.items.add(file);
  input.files=dt.files;
  input.dispatchEvent(new Event('change',{bubbles:true}));
}
function waitForNewPageAndCrop(previousCount){
  const started=Date.now();
  const timer=setInterval(()=>{
    const cards=[...document.querySelectorAll('#vrPageQueue .vrPageCard')];
    if(cards.length>previousCount){
      clearInterval(timer);
      cards[cards.length-1]?.querySelector('[data-crop]')?.click();
      return;
    }
    if(Date.now()-started>3000)clearInterval(timer);
  },80);
}
function removeLegacyPhotoUi(){
  $('photoImportBtn')?.remove();
  $('photoInput')?.remove();
  const head=document.querySelector('#setEditorView .pageHead>p:not(.eyebrow)');
  if(head)head.textContent='Bild/PDF, Zwischenablage, Copy & Paste oder direkt bearbeiten. Vor dem Speichern wird alles geprüft.';
  const privacy=document.querySelector('#setEditorView .privacyNote');
  if(privacy)privacy.textContent='Bilder und PDFs dienen nur zum Erkennen der Vokabeln. Bitte keine personenbezogenen Schülerdaten hochladen.';
  document.querySelectorAll('#customSetup .sourcePicker small').forEach(el=>{
    if(el.textContent.includes('Foto/KI-Import'))el.textContent='Eigene Liste, Copy & Paste oder Bild/PDF-Import.';
  });
}
function ensureClipboardButton(){
  const actions=document.querySelector('#vrDropZone .vrDropActions');
  if(!actions||$('vrPasteImageBtn'))return;
  const btn=document.createElement('button');
  btn.id='vrPasteImageBtn';
  btn.className='secondary';
  btn.type='button';
  btn.textContent='📋 Bild aus Zwischenablage';
  btn.addEventListener('click',pasteFromClipboard);
  actions.append(btn);
  const hint=document.createElement('small');
  hint.className='vrClipboardHint';
  hint.textContent='Oder ein kopiertes Bild direkt mit Strg+V / Cmd+V einfügen.';
  actions.closest('#vrDropZone')?.append(hint);
}
async function pasteFromClipboard(){
  if(!navigator.clipboard?.read){
    status('Direktes Lesen der Zwischenablage wird von diesem Browser nicht unterstützt. Füge das kopierte Bild mit Strg+V / Cmd+V ein oder wähle die Bilddatei aus.');
    return;
  }
  try{
    const items=await navigator.clipboard.read();
    for(const item of items){
      const type=item.types.find(t=>t.startsWith('image/'));
      if(!type)continue;
      const blob=await item.getType(type);
      const ext=type.includes('png')?'png':type.includes('webp')?'webp':'jpg';
      const before=document.querySelectorAll('#vrPageQueue .vrPageCard').length;
      enqueueFile(new File([blob],`Zwischenablage-${Date.now()}.${ext}`,{type}));
      status('Bild aus der Zwischenablage hinzugefügt. Wähle jetzt bei Bedarf den Ausschnitt.');
      waitForNewPageAndCrop(before);
      return;
    }
    status('In der Zwischenablage wurde kein Bild gefunden.');
  }catch(err){
    status('Zwischenablage konnte nicht direkt gelesen werden. Nutze Strg+V / Cmd+V oder „Dateien auswählen“.');
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
  enqueueFile(new File([file],`Zwischenablage-${Date.now()}.png`,{type:file.type||'image/png'}));
  status('Bild aus der Zwischenablage hinzugefügt. Wähle jetzt bei Bedarf den Ausschnitt.');
  waitForNewPageAndCrop(before);
}
function init(){
  removeLegacyPhotoUi();
  ensureClipboardButton();
  document.addEventListener('paste',handlePaste);
  const target=$('setEditorView');
  if(target)new MutationObserver(()=>{
    removeLegacyPhotoUi();
    ensureClipboardButton();
  }).observe(target,{childList:true,subtree:true});
}
init();
})();
