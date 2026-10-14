import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { getAuth,onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import { getFirestore,collection,query,where,getDocs } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
import { getFunctions,httpsCallable } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js';
import { firebaseConfig } from '../firebase-config.js';
import { createTeacher } from './ui.mjs';
import { createPlayer,element } from './play.mjs';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),functions=getFunctions(app,'europe-west1'),root=document.querySelector('#learningRoot'),params=new URLSearchParams(location.search);
const call=async(name,data)=>(await httpsCallable(functions,name)(data)).data;
if(params.has('learn')){
 const start=()=>createPlayer(root,{call,publicationId:params.get('learn'),onExit:pause,development:params.has('dev')});
 const pause=()=>{const resume=element(document,'button','Lernsitzung fortsetzen',{class:'button primary'});resume.onclick=start;root.replaceChildren(element(document,'h1','Deine Lernpause'),element(document,'p','Deine Sitzung ist auf diesem Gerät gespeichert. In einer Zeitrunde läuft die Uhr während der Pause weiter.'),resume,element(document,'a','Zurück zu GradeCrew',{href:'./index.html',class:'button secondary'}));};start();
}
else onAuthStateChanged(auth,user=>{if(!user){root.replaceChildren(element(document,'h1','Dein Test wird zur Wissensreise'),element(document,'p','Melde dich als Lehrkraft an, um einen eigenen Test auszuwählen.'),element(document,'a','Bei GradeCrew anmelden',{href:'./index.html',class:'button primary'}));return;}createTeacher(root,{call,preferredSource:params.get('source')||'',loadTests:async()=>{const result=await getDocs(query(collection(db,'quizzes'),where('ownerId','==',user.uid)));return result.docs.map(doc=>({id:doc.id,...doc.data()})).filter(q=>!q.isDeleted&&!q.rightsHold&&(!q.published||q.ended));}});});
