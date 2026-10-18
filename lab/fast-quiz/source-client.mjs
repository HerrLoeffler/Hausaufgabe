// Existing GradeCrew Firebase SDK flow, scoped to the isolated test project.
const PROJECT = 'gradecrew-staging-2026';
const SDK = 'https://www.gstatic.com/firebasejs/12.4.0/';
let clientPromise;
async function client() {
  if (!clientPromise) clientPromise = (async () => {
    const response = await fetch('/__/firebase/init.json');
    if (!response.ok) throw new Error('Die Anmeldung ist auf dieser Vorschau noch nicht eingerichtet.');
    const config = await response.json();
    if (config.projectId !== PROJECT) throw new Error('Anmeldung nur in der getrennten Testumgebung verfügbar.');
    const [apps, authSdk, storeSdk, functionsSdk] = await Promise.all(['firebase-app.js','firebase-auth.js','firebase-firestore.js','firebase-functions.js'].map(file => import(SDK + file)));
    const app = apps.getApps().find(item => item.name === 'fastquiz-sources') || apps.initializeApp(config, 'fastquiz-sources');
    const auth = authSdk.getAuth(app);
    await auth.authStateReady();
    return {auth, authSdk, storeSdk, db:storeSdk.getFirestore(app), functionsSdk, functions:functionsSdk.getFunctions(app,'europe-west1')};
  })().catch(error => {clientPromise=null;throw error;});
  return clientPromise;
}
export async function getToken() {
  const {auth} = await client();
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}
export async function signIn(email,password) {
  const {auth,authSdk} = await client();
  await authSdk.signInWithEmailAndPassword(auth,email,password);
}
export async function signOut() {
  const {auth,authSdk} = await client();
  await authSdk.signOut(auth);
}
export async function generateTest({grade,topic,onProgress}) {
  const {auth,db,storeSdk:s,functionsSdk:f,functions} = await client();
  if (!auth.currentUser) throw new Error('Bitte zuerst mit deinem Testkonto anmelden.');
  const ownerId=auth.currentUser.uid;
  const storageKey='fq-remy-pending:'+ownerId;
  const requestKey='fq-remy-request:'+ownerId;
  let jobId=sessionStorage.getItem(storageKey);
  if (!jobId) {
    let request;
    try{request=JSON.parse(sessionStorage.getItem(requestKey)||'null');}catch{}
    request=request||{subject:'Mathematik',grade:String(grade),schoolType:'Mittelschule',region:'Bayern',topic,difficulty:'mittel',count:10,points:20,allowedTypes:['number','text'],notes:'Quellentreue, variierbare Rechenaufgaben. Jede Aufgabe im Text als genau eine Rechnung mit zwei positiven ganzen Zahlen, z. B. 38 + 7 = ? oder 72 : 8 = ?. Nutze type number mit korrekter numericAnswer. Keine Sachtexte, Bruchschreibweisen, Medien oder Wissensfragen. Die Quelle wird anschließend auf geeignete Varianten geprüft.',materials:[],materialMode:'inspiration',imageMode:'none',imageQuestionCount:0,imageAnswerQuestionCount:0,clientRequestId:crypto.randomUUID()};
    // Save the request before dispatch; an unclear network outcome reuses its id.
    sessionStorage.setItem(requestKey,JSON.stringify(request));
    const result=await f.httpsCallable(functions,'startAiTestJob')(request);
    jobId=result.data?.jobId;
    if (!jobId) throw new Error('Remi hat keine Auftragsnummer zurückgegeben. Bitte in Meine Tests prüfen.');
    sessionStorage.setItem(storageKey,jobId);
  }
  onProgress?.('Remi erstellt den Test. Du kannst den Auftrag später wieder aufnehmen.');
  return new Promise((resolve,reject) => {
    let unsubscribe=()=>{};
    const timer=setTimeout(()=>{unsubscribe();reject(new Error('Der Auftrag läuft weiter. Mit „Remi-Auftrag fortsetzen“ denselben Auftrag erneut ansehen.'));},90000);
    unsubscribe=s.onSnapshot(s.query(s.collection(db,'aiJobs'),s.where('ownerId','==',ownerId)),snapshot=>{
      const record=snapshot.docs.find(doc=>doc.id===jobId);
      if(!record)return;
      const job=record.data();
      if(job.status==='ready'&&job.quizId){clearTimeout(timer);unsubscribe();sessionStorage.removeItem(storageKey);sessionStorage.removeItem(requestKey);resolve(job.quizId);}
      else if(job.status==='failed'){clearTimeout(timer);unsubscribe();sessionStorage.removeItem(storageKey);sessionStorage.removeItem(requestKey);reject(new Error('Remi konnte den Test nicht fertigstellen. Prüfe den Entwurf in Meine Tests.'));}
    },()=>{clearTimeout(timer);unsubscribe();reject(new Error('Der Auftragsstatus konnte nicht geladen werden. Der Auftrag bleibt erhalten.'));});
  });
}
