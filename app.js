const APP_VERSION = "2.0.1";
console.info(`Lernplattform v${APP_VERSION}`);
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const views = ["authView","dashboardView","editorView","publishView","resultsView","studentView"];
const state = {
  user: null,
  profile: null,
  quizzes: [],
  currentQuiz: null,
  questions: [],
  loadedQuestionIds: new Set(),
  currentResultsQuiz: null,
  resultQuestions: [],
  submissions: []
};

function showView(id){
  views.forEach(v => $(v).classList.toggle("hidden", v !== id));
  window.scrollTo({top:0, behavior:"smooth"});
}
function toast(message, type="success"){
  const el = $("toast");
  el.textContent = message;
  el.className = `toast show ${type}`;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> el.className = "toast", 3200);
}
function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function normalize(value){ return String(value ?? "").trim().toLowerCase(); }
function gradeFromPercent(p){
  if(p >= 91) return 1;
  if(p >= 77) return 2;
  if(p >= 57) return 3;
  if(p >= 39) return 4;
  if(p >= 25) return 5;
  return 6;
}
function toMillis(value){
  if(value?.toMillis) return value.toMillis();
  if(value?.seconds) return value.seconds * 1000;
  if(typeof value === "string") return Date.parse(value) || 0;
  return 0;
}
function fmtDate(value){
  const ms = toMillis(value);
  return ms ? new Date(ms).toLocaleString("de-DE") : "–";
}
function baseStudentUrl(code, preview=false){
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("test", code);
  if(preview) url.searchParams.set("preview", "1");
  return url.toString();
}
function randomCode(length=8){
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  crypto.getRandomValues(new Uint32Array(length)).forEach(n => out += alphabet[n % alphabet.length]);
  return out;
}
function setTeacherBar(){
  const loggedIn = Boolean(state.user) && !new URLSearchParams(location.search).has("test");
  $("userBar").classList.toggle("hidden", !loggedIn);
  $("userLabel").textContent = state.profile?.displayName || state.user?.displayName || state.user?.email || "";
}

// ---------- Auth / Landing ----------
$("loginTab").addEventListener("click",()=>{
  $("loginTab").classList.add("active"); $("registerTab").classList.remove("active");
  $("loginForm").classList.remove("hidden"); $("registerForm").classList.add("hidden");
});
$("registerTab").addEventListener("click",()=>{
  $("registerTab").classList.add("active"); $("loginTab").classList.remove("active");
  $("registerForm").classList.remove("hidden"); $("loginForm").classList.add("hidden");
});
$("loginForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  try{
    await signInWithEmailAndPassword(auth, $("loginEmail").value.trim(), $("loginPassword").value);
    toast("Erfolgreich angemeldet.");
  }catch(err){ toast(authMessage(err),"error"); }
});
$("registerForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = $("registerName").value.trim();
  const email = $("registerEmail").value.trim();
  const password = $("registerPassword").value;
  if(password !== $("registerPassword2").value){ toast("Die Passwörter stimmen nicht überein.","error"); return; }
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(cred.user,{displayName:name});
    await setDoc(doc(db,"users",cred.user.uid),{
      displayName:name,
      email,
      role:"teacher",
      createdAt:serverTimestamp()
    });
    toast("Account erstellt.");
  }catch(err){ toast(authMessage(err),"error"); }
});
$("forgotBtn").addEventListener("click", async ()=>{
  const email = $("loginEmail").value.trim() || prompt("E-Mail-Adresse für den Passwort-Reset:");
  if(!email) return;
  try{ await sendPasswordResetEmail(auth,email); toast("Reset-E-Mail wurde versendet."); }
  catch(err){ toast(authMessage(err),"error"); }
});
$("logoutBtn").addEventListener("click",()=> signOut(auth));
$("joinForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const code = $("joinCode").value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(!code){ toast("Bitte einen Testcode eingeben.","error"); return; }
  if(code.length < 4 || code.length > 16){ toast("Der Testcode ist ungültig.","error"); return; }
  const url = new URL(location.href); url.search=""; url.searchParams.set("test",code); location.href=url.toString();
});
$("brandBtn").addEventListener("click",()=>{
  const url = new URL(location.href); url.search=""; url.hash=""; location.href=url.toString();
});
function authMessage(err){
  const map = {
    "auth/invalid-credential":"E-Mail oder Passwort ist falsch.",
    "auth/email-already-in-use":"Für diese E-Mail existiert bereits ein Account.",
    "auth/weak-password":"Das Passwort ist zu schwach.",
    "auth/invalid-email":"Die E-Mail-Adresse ist ungültig.",
    "auth/too-many-requests":"Zu viele Versuche. Bitte später erneut versuchen."
  };
  return map[err?.code] || `Fehler: ${err?.message || "unbekannt"}`;
}

onAuthStateChanged(auth, async (user)=>{
  state.user = user;
  state.profile = null;
  if(user){
    try{
      const p = await getDoc(doc(db,"users",user.uid));
      state.profile = p.exists() ? p.data() : {displayName:user.displayName || user.email};
    }catch{}
  }
  setTeacherBar();
  const rawStudentCode = new URLSearchParams(location.search).get("test");
  const studentCode = rawStudentCode ? rawStudentCode.toUpperCase().replace(/[^A-Z0-9]/g,"") : "";
  if(studentCode){
    if(studentCode.length < 4 || studentCode.length > 16){
      showView("studentView");
      $("studentQuizCard").innerHTML=`<h1>Test nicht verfügbar</h1><p>Der Testcode ist ungültig.</p><a class="button primary" href="${escapeHtml(location.pathname)}">Zur Startseite</a>`;
      return;
    }
    await loadStudentQuiz(studentCode); return;
  }
  if(user){ await loadDashboard(); }
  else showView("authView");
});

// ---------- Dashboard ----------
$("newQuizBtn").addEventListener("click",createQuiz);
$("emptyNewQuizBtn").addEventListener("click",createQuiz);
$("backFromEditor").addEventListener("click",loadDashboard);
$("backFromResults").addEventListener("click",loadDashboard);
async function loadDashboard(){
  if(!state.user) return;
  showView("dashboardView");
  $("quizList").innerHTML = `<div class="card">Tests werden geladen …</div>`;
  try{
    const snap = await getDocs(query(collection(db,"quizzes"),where("ownerId","==",state.user.uid)));
    state.quizzes = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>toMillis(b.updatedAt||b.createdAt)-toMillis(a.updatedAt||a.createdAt));
    renderQuizList();
  }catch(err){
    console.error(err); $("quizList").innerHTML=""; toast("Tests konnten nicht geladen werden. Prüfe die Firestore-Regeln.","error");
  }
}
function renderQuizList(){
  const list = $("quizList"); list.innerHTML="";
  $("emptyQuizState").classList.toggle("hidden", state.quizzes.length !== 0);
  if(!state.quizzes.length) return;
  state.quizzes.forEach(q=>{
    const card = document.createElement("article"); card.className="card quizCard";
    card.innerHTML = `
      <div class="quizCardTop">
        <div><h3>${escapeHtml(q.title || "Unbenannter Test")}</h3><div class="meta">${escapeHtml(q.subject || "–")} · Klasse ${escapeHtml(q.grade || "–")} · Code ${q.id}</div></div>
        <span class="status ${q.published?"published":"draft"}">${q.published?"Veröffentlicht":"Entwurf"}</span>
      </div>
      <div class="quizStats">
        <div><strong>${Number(q.questionCount||0)}</strong><span>Aufgaben</span></div>
        <div><strong>${Number(q.totalPoints||0)}</strong><span>Punkte</span></div>
      </div>
      <div class="quizActions">
        <button class="button secondary edit">Bearbeiten</button>
        <button class="button secondary results">Ergebnisse</button>
        ${q.published?`<button class="button ghost share">Teilen</button>`:""}
        <button class="button danger remove">Löschen</button>
      </div>`;
    card.querySelector(".edit").addEventListener("click",()=>openEditor(q.id));
    card.querySelector(".results").addEventListener("click",()=>openResults(q.id));
    card.querySelector(".share")?.addEventListener("click",()=>showPublish(q.id));
    card.querySelector(".remove").addEventListener("click",()=>deleteQuiz(q.id));
    list.appendChild(card);
  });
}
async function createQuiz(){
  if(!state.user){ toast("Bitte zuerst anmelden.","error"); return; }
  for(let attempt=1; attempt<=5; attempt++){
    const code = randomCode();
    if(state.quizzes.some(q=>q.id===code)) continue;
    const quiz = {
      title:"Neuer Test", subject:"", grade:"", description:"Bearbeite alle Aufgaben sorgfältig.",
      ownerId:state.user.uid, published:false, accessCode:code,
      questionCount:0,totalPoints:0,createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    };
    try{
      await setDoc(doc(db,"quizzes",code),quiz);
      await openEditor(code);
      return;
    }catch(err){
      // Bei einer extrem seltenen Code-Kollision mit einem fremden Test blockieren
      // die Firestore-Regeln das Überschreiben. Dann probieren wir einen neuen Code.
      if(err?.code === "permission-denied" && attempt < 5) continue;
      console.error(err);
      toast("Test konnte nicht erstellt werden.","error");
      return;
    }
  }
  toast("Testcode konnte nicht erzeugt werden. Bitte erneut versuchen.","error");
}
async function deleteQuiz(code){
  const q = state.quizzes.find(x=>x.id===code);
  if(!confirm(`Test „${q?.title||code}“ wirklich löschen? Aufgaben und Abgaben werden ebenfalls entfernt.`)) return;
  try{
    const qSnap = await getDocs(collection(db,"quizzes",code,"questions"));
    for(const d of qSnap.docs) await deleteDoc(d.ref);
    const sSnap = await getDocs(collection(db,"quizzes",code,"submissions"));
    for(const d of sSnap.docs) await deleteDoc(d.ref);
    await deleteDoc(doc(db,"quizzes",code));
    toast("Test gelöscht."); await loadDashboard();
  }catch(err){ console.error(err); toast("Test konnte nicht vollständig gelöscht werden.","error"); }
}

// ---------- Editor ----------
$("addQuestionBtn").addEventListener("click",()=>{ state.questions.push(newQuestion()); renderQuestions(); markDirty(); });
$("saveQuizBtn").addEventListener("click",()=>saveCurrentQuiz(false));
$("publishBtn").addEventListener("click",publishCurrentQuiz);
$("previewBtn").addEventListener("click",async ()=>{
  if(!state.currentQuiz) return;
  if(!(await saveCurrentQuiz(false))) return;
  window.open(baseStudentUrl(state.currentQuiz.id, true),"_blank","noopener");
});
function newQuestion(type="single"){
  const id = doc(collection(db,"quizzes",state.currentQuiz?.id || "TEMP","questions")).id;
  return {id,type,text:"",points:type==="multi"?2:1,position:state.questions.length+1,options:type==="text"?[]:[{text:"",correct:true},{text:"",correct:false}],acceptedAnswers:[],manualReview:false};
}
async function openEditor(code){
  try{
    const quizSnap = await getDoc(doc(db,"quizzes",code));
    if(!quizSnap.exists()) throw new Error("Test nicht gefunden");
    const q = {id:quizSnap.id,...quizSnap.data()};
    if(q.ownerId !== state.user.uid) throw new Error("Kein Zugriff");
    state.currentQuiz = q;
    const qs = await getDocs(query(collection(db,"quizzes",code,"questions"),orderBy("position")));
    state.questions = qs.docs.map(d=>({id:d.id,...d.data()}));
    state.loadedQuestionIds = new Set(state.questions.map(x=>x.id));
    $("quizTitle").value=q.title||""; $("quizSubject").value=q.subject||""; $("quizGrade").value=q.grade||""; $("quizDescription").value=q.description||"";
    $("editorHeading").textContent=q.title||"Test bearbeiten";
    showView("editorView"); renderQuestions(); markSaved();
  }catch(err){ console.error(err); toast("Test konnte nicht geöffnet werden.","error"); }
}
["quizTitle","quizSubject","quizGrade","quizDescription"].forEach(id=>$(id).addEventListener("input",()=>{ updateSummary(); markDirty(); }));
function renderQuestions(){
  const root=$("questionList"); root.innerHTML="";
  state.questions.forEach((q,index)=>{
    q.position=index+1;
    const node=$("questionTemplate").content.firstElementChild.cloneNode(true);
    node.dataset.id=q.id; node.querySelector(".questionNumber").textContent=`Aufgabe ${index+1}`;
    const text=node.querySelector(".qText"), type=node.querySelector(".qType"), points=node.querySelector(".qPoints");
    text.value=q.text||""; type.value=q.type; points.value=q.points||1;
    text.addEventListener("input",e=>{q.text=e.target.value;markDirty();});
    type.addEventListener("change",e=>{
      q.type=e.target.value; q.points=q.type==="multi"?2:1;
      if(q.type==="text"){
        q.options=[];
      }else{
        q.options=q.options?.length?q.options:[{text:"",correct:true},{text:"",correct:false}];
        if(q.type!=="multi"){
          const firstCorrect=Math.max(0,q.options.findIndex(o=>o.correct));
          q.options.forEach((o,i)=>o.correct=i===firstCorrect);
        }
      }
      q.acceptedAnswers=q.acceptedAnswers||[]; renderQuestions(); markDirty();
    });
    points.addEventListener("input",e=>{q.points=Math.max(.5,Number(e.target.value)||1);updateSummary();markDirty();});
    node.querySelector(".moveUp").addEventListener("click",()=>moveQuestion(index,-1));
    node.querySelector(".moveDown").addEventListener("click",()=>moveQuestion(index,1));
    node.querySelector(".duplicateQuestion").addEventListener("click",()=>duplicateQuestion(index));
    node.querySelector(".deleteQuestion").addEventListener("click",()=>{ if(confirm("Aufgabe löschen?")){state.questions.splice(index,1);renderQuestions();markDirty();} });
    renderAnswerEditor(node.querySelector(".answerEditor"),q);
    root.appendChild(node);
  });
  updateSummary();
}
function moveQuestion(index,delta){ const next=index+delta;if(next<0||next>=state.questions.length)return;[state.questions[index],state.questions[next]]=[state.questions[next],state.questions[index]];renderQuestions();markDirty(); }
function duplicateQuestion(index){
  const source=state.questions[index]; const copy=structuredClone(source); copy.id=doc(collection(db,"quizzes",state.currentQuiz.id,"questions")).id; copy.text += " (Kopie)"; state.questions.splice(index+1,0,copy);renderQuestions();markDirty();
}
function renderAnswerEditor(container,q){
  container.innerHTML="";
  if(q.type === "text"){
    const label=document.createElement("label"); label.className="stack compact";
    label.innerHTML=`<span>Automatisch akzeptierte Antworten <small>(mit Komma trennen)</small></span><input type="text" value="${escapeHtml((q.acceptedAnswers||[]).join(", "))}" placeholder="z. B. spannend, interessant">`;
    label.querySelector("input").addEventListener("input",e=>{q.acceptedAnswers=e.target.value.split(",").map(s=>s.trim()).filter(Boolean);markDirty();});
    container.appendChild(label);
    const manual=document.createElement("label");manual.className="manualRow";manual.innerHTML=`<input type="checkbox" ${q.manualReview?"checked":""}> Antwort grundsätzlich manuell prüfen`;
    manual.querySelector("input").addEventListener("change",e=>{q.manualReview=e.target.checked;markDirty();});container.appendChild(manual);
    return;
  }
  const info=document.createElement("p");info.className="hint";info.textContent=q.type==="multi"?"Mehrere richtige Antworten sind möglich.":"Markiere genau eine richtige Antwort.";container.appendChild(info);
  q.options = q.options || [];
  q.options.forEach((opt,idx)=>{
    const row=document.createElement("div");row.className="optionRow";
    const correct=document.createElement("input");correct.type=q.type==="multi"?"checkbox":"radio";correct.name=`correct-${q.id}`;correct.checked=Boolean(opt.correct);
    correct.addEventListener("change",()=>{
      if(q.type!=="multi") q.options.forEach((o,i)=>o.correct=i===idx); else opt.correct=correct.checked;
      renderQuestions();markDirty();
    });
    const text=document.createElement("input");text.value=opt.text||"";text.placeholder=`Antwort ${idx+1}`;text.addEventListener("input",e=>{opt.text=e.target.value;markDirty();});
    const remove=document.createElement("button");remove.type="button";remove.className="removeOption";remove.textContent="×";remove.addEventListener("click",()=>{if(q.options.length<=2){toast("Mindestens zwei Antworten erforderlich.","error");return;}q.options.splice(idx,1);renderQuestions();markDirty();});
    row.append(correct,text,remove);container.appendChild(row);
  });
  const add=document.createElement("button");add.type="button";add.className="miniButton";add.textContent="+ Antwortmöglichkeit";add.addEventListener("click",()=>{q.options.push({text:"",correct:false});renderQuestions();markDirty();});container.appendChild(add);
}
function updateSummary(){
  $("questionCount").textContent=state.questions.length;
  $("totalPoints").textContent=state.questions.reduce((sum,q)=>sum+(Number(q.points)||0),0);
  $("publishStatus").textContent=state.currentQuiz?.published?"Veröffentlicht":"Entwurf";
}
function markDirty(){ $("saveState").textContent="Ungespeicherte Änderungen"; $("saveState").style.color="#9a6700"; }
function markSaved(){ $("saveState").textContent="✓ Gespeichert"; $("saveState").style.color="#15803d"; updateSummary(); }
function validateQuiz(){
  if(!$("quizTitle").value.trim()) return "Bitte einen Titel eingeben.";
  if(!state.questions.length) return "Bitte mindestens eine Aufgabe hinzufügen.";
  for(let i=0;i<state.questions.length;i++){
    const q=state.questions[i]; if(!q.text.trim()) return `Aufgabe ${i+1}: Fragetext fehlt.`;
    if(!(Number(q.points)>0)) return `Aufgabe ${i+1}: Punkte müssen größer als 0 sein.`;
    if(q.type==="text" && !q.manualReview && !(q.acceptedAnswers||[]).length) return `Aufgabe ${i+1}: Hinterlege mindestens eine akzeptierte Antwort oder aktiviere die manuelle Prüfung.`;
    if(q.type!=="text"){
      if((q.options||[]).some(o=>!o.text.trim())) return `Aufgabe ${i+1}: Eine Antwortmöglichkeit ist leer.`;
      if(!(q.options||[]).some(o=>o.correct)) return `Aufgabe ${i+1}: Markiere mindestens eine richtige Antwort.`;
      if(q.type!=="multi" && q.options.filter(o=>o.correct).length!==1) return `Aufgabe ${i+1}: Genau eine Antwort muss richtig sein.`;
    }
  }
  return "";
}
async function saveCurrentQuiz(showMessage=true){
  const error=validateQuiz(); if(error){toast(error,"error");return false;}
  try{
    const code=state.currentQuiz.id;
    const totalPoints=state.questions.reduce((s,q)=>s+(Number(q.points)||0),0);
    const patch={
      title:$("quizTitle").value.trim(), subject:$("quizSubject").value.trim(), grade:$("quizGrade").value.trim(), description:$("quizDescription").value.trim(),
      questionCount:state.questions.length,totalPoints,updatedAt:serverTimestamp()
    };
    await updateDoc(doc(db,"quizzes",code),patch);
    const currentIds=new Set();
    for(let i=0;i<state.questions.length;i++){
      const q=state.questions[i];q.position=i+1;currentIds.add(q.id);
      await setDoc(doc(db,"quizzes",code,"questions",q.id),{
        type:q.type,text:q.text.trim(),points:Number(q.points),position:q.position,
        options:(q.options||[]).map(o=>({text:o.text.trim(),correct:Boolean(o.correct)})),
        acceptedAnswers:(q.acceptedAnswers||[]).map(x=>x.trim()).filter(Boolean),manualReview:Boolean(q.manualReview),updatedAt:serverTimestamp()
      });
    }
    for(const oldId of state.loadedQuestionIds){ if(!currentIds.has(oldId)) await deleteDoc(doc(db,"quizzes",code,"questions",oldId)); }
    state.loadedQuestionIds=currentIds;
    state.currentQuiz={...state.currentQuiz,...patch}; $("editorHeading").textContent=patch.title; markSaved(); if(showMessage)toast("Test gespeichert.");return true;
  }catch(err){console.error(err);toast("Speichern fehlgeschlagen.","error");return false;}
}
async function publishCurrentQuiz(){
  if(!(await saveCurrentQuiz(false))) return;
  try{
    await updateDoc(doc(db,"quizzes",state.currentQuiz.id),{published:true,publishedAt:serverTimestamp(),updatedAt:serverTimestamp()});
    state.currentQuiz.published=true; updateSummary(); toast("Test veröffentlicht."); showPublish(state.currentQuiz.id);
  }catch(err){console.error(err);toast("Veröffentlichen fehlgeschlagen.","error");}
}

// ---------- Teilen / QR ----------
$("backFromPublish").addEventListener("click",()=>openEditor(state.currentQuiz?.id || $("publishedCode").textContent));
$("copyCodeBtn").addEventListener("click",()=>copyText($("publishedCode").textContent,"Testcode kopiert."));
$("copyLinkBtn").addEventListener("click",()=>copyText($("publishedLink").value,"Link kopiert."));
async function copyText(text,msg){ try{await navigator.clipboard.writeText(text);toast(msg);}catch{prompt("Kopieren:",text);} }
async function showPublish(code){
  const snap=await getDoc(doc(db,"quizzes",code)); if(!snap.exists())return;
  state.currentQuiz={id:code,...snap.data()};
  const link=baseStudentUrl(code); $("publishedCode").textContent=code; $("publishedLink").value=link;
  showView("publishView");
  const qr=$("qrcode"); qr.innerHTML="";
  if(window.QRCode) new window.QRCode(qr,{text:link,width:190,height:190,correctLevel:window.QRCode.CorrectLevel.M});
  else qr.textContent="QR-Code-Bibliothek konnte nicht geladen werden.";
}

// ---------- Schüleransicht ----------
async function loadStudentQuiz(code){
  showView("studentView"); $("studentQuizCard").innerHTML=`<div id="studentLoading">Test wird geladen …</div>`;
  try{
    const quizSnap=await getDoc(doc(db,"quizzes",code));
    if(!quizSnap.exists()) throw new Error("Dieser Test existiert nicht.");
    const quiz={id:code,...quizSnap.data()};
    const preview = new URLSearchParams(location.search).get("preview") === "1";
    const ownerPreview = preview && state.user && quiz.ownerId === state.user.uid;
    if(!quiz.published && !ownerPreview) throw new Error("Dieser Test ist noch nicht veröffentlicht.");
    const qs=await getDocs(query(collection(db,"quizzes",code,"questions"),orderBy("position")));
    const questions=qs.docs.map(d=>({id:d.id,...d.data()}));
    renderStudentQuiz(quiz,questions);
  }catch(err){console.error(err);$("studentQuizCard").innerHTML=`<h1>Test nicht verfügbar</h1><p>${escapeHtml(err.message)}</p><a class="button primary" href="${escapeHtml(location.pathname)}">Zur Startseite</a>`;}
}
function renderStudentQuiz(quiz,questions){
  const root=$("studentQuizCard");
  root.innerHTML=`
    <div class="studentHead"><span class="eyebrow">${escapeHtml(quiz.subject||"Test")} · Klasse ${escapeHtml(quiz.grade||"–")}</span><h1>${escapeHtml(quiz.title)}</h1><p>${escapeHtml(quiz.description||"")}</p><div class="meta">${questions.length} Aufgaben · ${quiz.totalPoints||questions.reduce((s,q)=>s+Number(q.points||0),0)} Punkte · Code ${quiz.id}</div></div>
    <form id="studentForm"><label style="display:block;margin:18px 0;font-weight:700">Dein Name oder Kürzel<input id="studentName" type="text" required placeholder="Vorname Nachname"></label><div id="studentQuestions"></div><button id="studentSubmitBtn" class="button primary studentSubmit" type="submit">Antworten abgeben</button></form>
    <div id="studentResult" class="studentResult hidden"></div>`;
  const qRoot=$("studentQuestions");
  questions.forEach((q,i)=>{
    const section=document.createElement("section");section.className="studentQuestion";section.dataset.qid=q.id;
    section.innerHTML=`<h3>${i+1}. ${escapeHtml(q.text)} <span class="meta">(${Number(q.points)} P.)</span></h3>`;
    if(q.type==="text"){
      const inp=document.createElement("input");inp.type="text";inp.name=q.id;inp.placeholder="Antwort eingeben";section.appendChild(inp);
    }else if(q.type==="dropdown"){
      const sel=document.createElement("select");sel.name=q.id;sel.innerHTML=`<option value="">Bitte auswählen …</option>`+(q.options||[]).map((o,idx)=>`<option value="${idx}">${escapeHtml(o.text)}</option>`).join("");section.appendChild(sel);
    }else{
      (q.options||[]).forEach((o,idx)=>{
        const label=document.createElement("label");label.className="choice";
        label.innerHTML=`<input type="${q.type==="multi"?"checkbox":"radio"}" name="${q.id}" value="${idx}"><span>${escapeHtml(o.text)}</span>`;section.appendChild(label);
      });
    }
    qRoot.appendChild(section);
  });
  $("studentForm").addEventListener("submit",e=>submitStudentQuiz(e,quiz,questions));
}
function evaluateAnswer(q,given){
  const max=Number(q.points)||0;
  if(q.type==="text"){
    if(q.manualReview) return {awarded:0,max,needsReview:true,correct:null};
    const ok=(q.acceptedAnswers||[]).map(normalize).includes(normalize(given));
    return {awarded:ok?max:0,max,needsReview:false,correct:ok};
  }
  const correctIndexes=(q.options||[]).map((o,i)=>o.correct?String(i):null).filter(v=>v!==null);
  if(q.type==="multi"){
    const selected=Array.isArray(given)?given:[]; const good=selected.filter(v=>correctIndexes.includes(String(v))).length; const bad=selected.filter(v=>!correctIndexes.includes(String(v))).length;
    const ratio=Math.max(0,Math.min(1,(good-bad)/Math.max(1,correctIndexes.length))); const awarded=Math.round(ratio*max*10)/10;
    return {awarded,max,needsReview:false,correct:good===correctIndexes.length&&bad===0&&selected.length===correctIndexes.length};
  }
  const ok=correctIndexes.includes(String(given)); return {awarded:ok?max:0,max,needsReview:false,correct:ok};
}
async function submitStudentQuiz(e,quiz,questions){
  e.preventDefault();
  const name=$("studentName").value.trim(); if(!name){toast("Bitte deinen Namen eingeben.","error");return;}
  if(!confirm("Willst du den Test wirklich abgeben?")) return;
  const answers={}; const grading={}; let points=0,maxPoints=0,needsReview=false;
  for(const q of questions){
    let given;
    if(q.type==="multi") given=Array.from(document.querySelectorAll(`input[name="${CSS.escape(q.id)}"]:checked`)).map(x=>x.value);
    else if(q.type==="single") given=document.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`)?.value ?? "";
    else given=document.querySelector(`[name="${CSS.escape(q.id)}"]`)?.value ?? "";
    answers[q.id]=given;
    const result=evaluateAnswer(q,given);grading[q.id]={autoPoints:result.awarded,awardedPoints:result.awarded,maxPoints:result.max,needsReview:result.needsReview};
    points+=result.awarded;maxPoints+=result.max;needsReview ||= result.needsReview;
  }
  const percent=maxPoints?Math.round(points/maxPoints*100):0;
  try{
    $("studentSubmitBtn").disabled=true;$("studentSubmitBtn").textContent="Wird gespeichert …";
    await addDoc(collection(db,"quizzes",quiz.id,"submissions"),{
      studentName:name,answers,grading,autoPoints:Math.round(points*10)/10,totalPoints:Math.round(points*10)/10,maxPoints,percent,status:needsReview?"review":"graded",submittedAt:serverTimestamp(),submittedAtLocal:new Date().toISOString()
    });
    renderStudentResult(quiz,questions,answers,grading,points,maxPoints,percent,needsReview);toast("Abgabe erfolgreich gespeichert.");
  }catch(err){console.error(err);toast("Abgabe konnte nicht gespeichert werden.","error");$("studentSubmitBtn").disabled=false;$("studentSubmitBtn").textContent="Antworten abgeben";}
}
function answerDisplay(q,given){
  if(q.type==="text") return String(given||"(leer)");
  if(q.type==="multi") return (given||[]).map(v=>q.options?.[Number(v)]?.text).filter(Boolean).join(", ") || "(leer)";
  if(given === "" || given === null || given === undefined) return "(leer)";
  return q.options?.[Number(given)]?.text || "(leer)";
}
function correctDisplay(q){
  if(q.type==="text") return q.manualReview?"wird von der Lehrkraft geprüft":(q.acceptedAnswers||[]).join(", ");
  return (q.options||[]).filter(o=>o.correct).map(o=>o.text).join(", ");
}
function renderStudentResult(quiz,questions,answers,grading,points,maxPoints,percent,needsReview){
  $("studentForm").classList.add("hidden");const box=$("studentResult");box.classList.remove("hidden");
  box.innerHTML=`<h2>Abgabe gespeichert ✓</h2><div class="scoreBig">${Math.round(points*10)/10}/${maxPoints} Punkte</div><p>${percent}% ${needsReview?"· vorläufiges Ergebnis – mindestens eine Antwort wird noch manuell geprüft.":`· Note ${gradeFromPercent(percent)}`}</p><div id="studentResultDetails"></div>`;
  const details=$("studentResultDetails");questions.forEach((q,i)=>{
    const g=grading[q.id];const div=document.createElement("div");div.className="studentResultDetail";div.innerHTML=`<strong>${i+1}. ${escapeHtml(q.text)}</strong><div>Deine Antwort: ${escapeHtml(answerDisplay(q,answers[q.id]))}</div><div>Lösung: ${escapeHtml(correctDisplay(q))}</div><div>Punkte: ${g.awardedPoints}/${g.maxPoints}${g.needsReview?" · Prüfung ausstehend":""}</div>`;details.appendChild(div);
  });
}

// ---------- Ergebnisse / manuelle Bewertung ----------
$("refreshResultsBtn").addEventListener("click",()=>state.currentResultsQuiz&&openResults(state.currentResultsQuiz.id));
$("exportResultsBtn").addEventListener("click",exportResultsCsv);
async function openResults(code){
  try{
    const quizSnap=await getDoc(doc(db,"quizzes",code)); if(!quizSnap.exists())throw new Error("Test nicht gefunden");
    const quiz={id:code,...quizSnap.data()}; if(quiz.ownerId!==state.user.uid)throw new Error("Kein Zugriff");state.currentResultsQuiz=quiz;
    const qSnap=await getDocs(query(collection(db,"quizzes",code,"questions"),orderBy("position")));state.resultQuestions=qSnap.docs.map(d=>({id:d.id,...d.data()}));
    const sSnap=await getDocs(collection(db,"quizzes",code,"submissions"));state.submissions=sSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>toMillis(b.submittedAt||b.submittedAtLocal)-toMillis(a.submittedAt||a.submittedAtLocal));
    $("resultsHeading").textContent=quiz.title;$("resultsMeta").textContent=`${state.submissions.length} Abgaben · ${quiz.totalPoints||0} Punkte maximal`;
    showView("resultsView");renderResultsTable();$("reviewPanel").classList.add("hidden");
  }catch(err){console.error(err);toast("Ergebnisse konnten nicht geladen werden.","error");}
}
function renderResultsTable(){
  const wrap=$("resultsTableWrap");
  if(!state.submissions.length){wrap.innerHTML=`<div class="empty"><h2>Noch keine Abgaben</h2><p>Sobald Schüler den Test abgeben, erscheinen die Ergebnisse hier.</p></div>`;return;}
  let html=`<table class="resultTable"><thead><tr><th>Name</th><th>Punkte</th><th>%</th><th>Note</th><th>Status</th><th>Zeit</th><th></th></tr></thead><tbody>`;
  state.submissions.forEach(s=>{
    const grade=s.status==="review"?"–":gradeFromPercent(Number(s.percent||0));
    html+=`<tr><td><strong>${escapeHtml(s.studentName)}</strong></td><td>${escapeHtml(s.totalPoints)}/${escapeHtml(s.maxPoints)}</td><td>${escapeHtml(s.percent)}%</td><td>${grade}</td><td><span class="pill ${s.status==="review"?"review":"graded"}">${s.status==="review"?"Prüfen":"Bewertet"}</span></td><td>${escapeHtml(fmtDate(s.submittedAt||s.submittedAtLocal))}</td><td><button class="button secondary reviewBtn" data-id="${s.id}">Bewerten</button></td></tr>`;
  });html+="</tbody></table>";wrap.innerHTML=html;wrap.querySelectorAll(".reviewBtn").forEach(btn=>btn.addEventListener("click",()=>openReview(btn.dataset.id)));
}
function openReview(id){
  const s=state.submissions.find(x=>x.id===id);if(!s)return;const panel=$("reviewPanel");panel.classList.remove("hidden");
  panel.innerHTML=`<div class="reviewHeader"><div><span class="eyebrow">Manuelle Bewertung</span><h2>${escapeHtml(s.studentName)}</h2><p>${escapeHtml(fmtDate(s.submittedAt||s.submittedAtLocal))}</p></div><button id="closeReview" class="button ghost">Schließen</button></div><div id="reviewQuestions"></div><div class="reviewHeader"><strong id="reviewTotal"></strong><button id="saveReview" class="button primary">Bewertung speichern</button></div>`;
  const root=$("reviewQuestions");
  state.resultQuestions.forEach((q,i)=>{
    const g=s.grading?.[q.id]||{awardedPoints:0,maxPoints:Number(q.points)||0};const div=document.createElement("div");div.className="reviewQuestion";div.innerHTML=`<strong>${i+1}. ${escapeHtml(q.text)}</strong><div class="meta">Antwort: ${escapeHtml(answerDisplay(q,s.answers?.[q.id]))}</div><div class="meta">Lösung: ${escapeHtml(correctDisplay(q))}</div><div class="reviewPoints"><label>Punkte:</label><input class="manualPoints" data-qid="${q.id}" type="number" min="0" max="${Number(q.points)}" step="0.1" value="${Number(g.awardedPoints??g.autoPoints??0)}"><span>/ ${Number(q.points)}</span></div>`;root.appendChild(div);
  });
  const recompute=()=>{
    const pts=Array.from(panel.querySelectorAll(".manualPoints")).reduce((sum,x)=>{
      const q=state.resultQuestions.find(item=>item.id===x.dataset.qid);
      const max=Number(q?.points||0);
      return sum+Math.max(0,Math.min(max,Number(x.value)||0));
    },0);
    const max=state.resultQuestions.reduce((sum,q)=>sum+Number(q.points||0),0);
    const pc=max?Math.round(pts/max*100):0;
    $("reviewTotal").textContent=`${Math.round(pts*10)/10}/${max} Punkte · ${pc}% · Note ${gradeFromPercent(pc)}`;
  };
  panel.querySelectorAll(".manualPoints").forEach(x=>x.addEventListener("input",recompute));recompute();$("closeReview").addEventListener("click",()=>panel.classList.add("hidden"));$("saveReview").addEventListener("click",()=>saveReview(s.id));panel.scrollIntoView({behavior:"smooth",block:"start"});
}
async function saveReview(submissionId){
  const panel=$("reviewPanel");const submission=state.submissions.find(x=>x.id===submissionId);if(!submission)return;const grading={...(submission.grading||{})};let total=0;let max=0;
  panel.querySelectorAll(".manualPoints").forEach(inp=>{const q=state.resultQuestions.find(x=>x.id===inp.dataset.qid);const qMax=Number(q?.points||0);const awarded=Math.max(0,Math.min(qMax,Number(inp.value)||0));grading[inp.dataset.qid]={...(grading[inp.dataset.qid]||{}),awardedPoints:Math.round(awarded*10)/10,maxPoints:qMax,needsReview:false};total+=awarded;max+=qMax;});
  const percent=max?Math.round(total/max*100):0;
  try{await updateDoc(doc(db,"quizzes",state.currentResultsQuiz.id,"submissions",submissionId),{grading,totalPoints:Math.round(total*10)/10,maxPoints:max,percent,status:"graded",reviewedAt:serverTimestamp(),reviewedBy:state.user.uid});toast("Bewertung gespeichert.");await openResults(state.currentResultsQuiz.id);}catch(err){console.error(err);toast("Bewertung konnte nicht gespeichert werden.","error");}
}
function exportResultsCsv(){
  if(!state.currentResultsQuiz||!state.submissions.length){toast("Keine Ergebnisse zum Exportieren.","error");return;}
  const header=["Name",...state.resultQuestions.map((_,i)=>`Aufgabe ${i+1}`),"Punkte","Max","Prozent","Note","Status","Zeit"];
  const rows=[header];state.submissions.forEach(s=>{const r=[s.studentName];state.resultQuestions.forEach(q=>r.push(answerDisplay(q,s.answers?.[q.id])));r.push(s.totalPoints,s.maxPoints,s.percent,s.status==="review"?"":gradeFromPercent(Number(s.percent||0)),s.status,fmtDate(s.submittedAt||s.submittedAtLocal));rows.push(r);});
  const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n");const blob=new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${(state.currentResultsQuiz.title||"ergebnisse").replace(/[^a-z0-9äöüß_-]+/gi,"_")}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
