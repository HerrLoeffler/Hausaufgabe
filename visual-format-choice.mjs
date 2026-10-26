export const ACTIVE_VISUAL_FORMATS = Object.freeze(['hotspot','labeling','scale','angle','grid','connections','coordinate','table']);
const names={hotspot:'Im Bild markieren',labeling:'Bild beschriften',scale:'Skala / Zahlenstrahl',angle:'Winkel messen',grid:'Kästchenfeld',connections:'Verbindungen',coordinate:'Koordinatensystem',table:'Tabelle ergänzen'};
export function chooseVisualFormat({document:doc=globalThis.document,initialFormat='grid'}={}) {
  return new Promise(resolve=>{
    const previous=doc.activeElement;
    const dialog=doc.createElement('dialog');dialog.className='shareDialog visualFormatDialog';
    dialog.setAttribute('aria-labelledby','visualFormatTitle');dialog.setAttribute('aria-describedby','visualFormatDescription');
    dialog.innerHTML='<form><h2 id="visualFormatTitle">Aufgabe mit KI anpassen</h2><p id="visualFormatDescription">Wähle das gewünschte Format. Emmi passt den fachlichen Inhalt deiner Aufgabe an. Erst mit „Mit KI anpassen“ startest du die KI-Anfrage.</p><label>Gewünschtes Format<select name="format" required></select></label><label>Inhalt oder Wunsch <small>(optional)</small><textarea name="wish" rows="3" maxlength="1200" placeholder="z. B. 25 Prozent im Kästchenfeld darstellen"></textarea></label><p class="hint">Lernziel, Testsprache und Punkte bleiben erhalten. Bitte prüfe anschließend die neue Aufgabe und ihre Lösung.</p><div class="actions"><button type="button" class="button secondary" data-cancel>Abbrechen</button><button type="submit" class="button primary">Mit KI anpassen</button></div></form>';
    const select=dialog.querySelector('select');
    for(const format of ACTIVE_VISUAL_FORMATS){const option=doc.createElement('option');option.value=format;option.textContent=names[format];select.append(option);}
    select.value=ACTIVE_VISUAL_FORMATS.includes(initialFormat)?initialFormat:'grid';
    let done=false;
    function finish(value){if(done)return;done=true;try{if(dialog.open)dialog.close();}catch{}dialog.remove();if(previous?.isConnected)previous.focus();resolve(value);}
    dialog.querySelector('[data-cancel]').addEventListener('click',()=>finish(null));
    dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});
    dialog.addEventListener('close',()=>finish(null));
    dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();if(!ACTIVE_VISUAL_FORMATS.includes(select.value))return;finish({format:select.value,wish:dialog.querySelector('textarea').value.trim()});});
    doc.body.append(dialog);if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');select.focus();
  });
}
