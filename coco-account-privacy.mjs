import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";

// No automatic read, export, preference inference or paid provider operation.
export function installCocoAccountPrivacy({document, getUid, callSupport, reload}) {
  const root=document.getElementById("cocoAccountPrivacy");
  if(!root || root.dataset.installed) return;
  root.dataset.installed="1";
  root.innerHTML=`<h2>Persönliche Gesprächsdaten</h2>
    <p>Coco behält für dein Konto die letzten 40 Nachrichten und ausdrücklich gespeicherte persönliche Hinweise im Hintergrund. Die Nachrichten werden bei weiteren Gesprächen durch neuere ersetzt. Eine automatische zeitliche Löschung ist derzeit nicht eingerichtet.</p>
    <p>Bei der KI-Hilfe können persönliche Hinweise und bis zu 12 letzte Nachrichten an OpenAI übermittelt werden, auch für Remy und Emmi. Diese Kontodaten werden nicht als gemeinsames Produktwissen übernommen. Bitte keine personenbezogenen Schülerdaten eingeben.</p>
    <div class="actions"><button id="cocoPrivacyRead" class="button secondary" type="button">Meine Gesprächsdaten anzeigen</button><button id="cocoPrivacyReset" class="button secondary" type="button" disabled>Gesprächsdaten zurücksetzen …</button></div>
    <p id="cocoPrivacyStatus" role="status" aria-live="polite"></p>
    <div id="cocoPrivacyData" hidden></div>
    <div id="cocoPrivacyConfirmation" hidden><p>Gespeicherte Gesprächsnachrichten und persönliche Hinweise dieses Kontos wirklich zurücksetzen? Diese Aktion lässt sich hier nicht rückgängig machen. Tests, Bilder und Rückmeldungen bleiben erhalten.</p>
    <div class="actions"><button id="cocoPrivacyCancel" class="button secondary" type="button">Abbrechen</button><button id="cocoPrivacyConfirm" class="button danger" type="button">Gesprächsdaten jetzt zurücksetzen</button></div></div>
    <button id="cocoPrivacyReload" class="button secondary" type="button" hidden>Seite neu laden</button>`;
  const $=id=>root.querySelector(`#${id}`);
  let epoch=0,loadedUid="",busy=false,resetDone=false;
  const current=(uid,token)=>Boolean(uid && uid===getUid() && token===epoch);
  function clearView(){
    epoch++; loadedUid=""; busy=false; resetDone=false;
    $("cocoPrivacyData").replaceChildren(); $("cocoPrivacyData").hidden=true;
    $("cocoPrivacyStatus").textContent=""; $("cocoPrivacyConfirmation").hidden=true;
    $("cocoPrivacyReload").hidden=true; $("cocoPrivacyRead").disabled=false;
    $("cocoPrivacyReset").disabled=true; $("cocoPrivacyConfirm").disabled=false;
  }
  document.addEventListener("gradecrew:account-changed",clearView);
  function render(data){
    const target=$("cocoPrivacyData"); target.replaceChildren();
    const heading=document.createElement("h3"); heading.textContent="Gespeicherte persönliche Hinweise";
    const preferences=document.createElement("p"); preferences.textContent=String(data.preferences||"").slice(0,2000)||"Keine persönlichen Hinweise gespeichert.";
    const historyHeading=document.createElement("h3"); historyHeading.textContent="Gespeicherte letzte Nachrichten";
    const list=document.createElement("ol");
    for(const message of (Array.isArray(data.history)?data.history:[]).slice(-40)){
      const item=document.createElement("li"); item.style.whiteSpace="pre-wrap";
      item.textContent=`${message.role==="user"?"Du":"Assistenz"}: ${String(message.text||"").slice(0,1400)}`;list.append(item);
    }
    target.append(heading,preferences,historyHeading,list);target.hidden=false;
  }
  $("cocoPrivacyRead").addEventListener("click",async()=>{
    if(busy || resetDone)return;
    clearView();const uid=getUid(),token=epoch;
    if(!uid){$("cocoPrivacyStatus").textContent="Bitte melde dich mit deinem Lehrkraftkonto an.";return;}
    busy=true;$("cocoPrivacyRead").disabled=true;$("cocoPrivacyStatus").textContent="Gesprächsdaten werden geladen …";
    try{
      const data=await callSupport({operation:"read",accountId:uid});if(!current(uid,token))return;
      render(data);loadedUid=uid;$("cocoPrivacyReset").disabled=false;
      $("cocoPrivacyStatus").textContent="Aktuell gespeicherte Gesprächsdaten deines Kontos. Dies ist keine vollständige Kontoauskunft.";
    }catch(_){if(current(uid,token))$("cocoPrivacyStatus").textContent="Gesprächsdaten konnten nicht geladen werden. Bitte versuche es erneut.";}
    finally{if(current(uid,token)){busy=false;$("cocoPrivacyRead").disabled=false;}}
  });
  $("cocoPrivacyReset").addEventListener("click",()=>{
    if(busy || resetDone || !loadedUid || loadedUid!==getUid())return;
    $("cocoPrivacyConfirmation").hidden=false;$("cocoPrivacyCancel").focus();
  });
  $("cocoPrivacyCancel").addEventListener("click",()=>{if(busy)return;$("cocoPrivacyConfirmation").hidden=true;$("cocoPrivacyReset").focus();});
  $("cocoPrivacyConfirm").addEventListener("click",async()=>{
    const uid=loadedUid,token=epoch;
    if(busy || resetDone || $("cocoPrivacyConfirmation").hidden || !current(uid,token))return;
    busy=true;$("cocoPrivacyConfirm").disabled=true;$("cocoPrivacyRead").disabled=true;$("cocoPrivacyReset").disabled=true;
    $("cocoPrivacyStatus").textContent="Gesprächsdaten werden zurückgesetzt …";
    try{
      await callSupport({operation:"clear",accountId:uid});if(!current(uid,token))return;
      resetDone=true;$("cocoPrivacyData").replaceChildren();$("cocoPrivacyData").hidden=true;$("cocoPrivacyConfirmation").hidden=true;
      $("cocoPrivacyStatus").textContent="Deine gespeicherten Gesprächsdaten wurden zurückgesetzt. Lade die Seite neu, damit auch der geöffnete Chat den neuen Stand übernimmt. Neue Gespräche werden anschließend wieder im Hintergrund gespeichert.";
      $("cocoPrivacyReload").hidden=false;$("cocoPrivacyReload").focus();
    }catch(_){if(current(uid,token)){loadedUid="";$("cocoPrivacyConfirmation").hidden=true;$("cocoPrivacyStatus").textContent="Zurücksetzen konnte nicht bestätigt werden. Lade den aktuellen Stand erneut, bevor du einen weiteren Versuch startest.";}}
    finally{if(current(uid,token)){busy=false;$("cocoPrivacyConfirm").disabled=false;$("cocoPrivacyRead").disabled=resetDone;$("cocoPrivacyReset").disabled=resetDone||!loadedUid;}}
  });
  $("cocoPrivacyReload").addEventListener("click",()=>{if(resetDone && loadedUid===getUid())reload();});
}

if(typeof document!=="undefined")installCocoAccountPrivacy({
  document,getUid:()=>{try{return getAuth(getApp()).currentUser?.uid||"";}catch(_){return "";}},
  callSupport:async data=>(await httpsCallable(getFunctions(getApp()),"cocoSupport")(data)).data,
  reload:()=>location.reload()
});
