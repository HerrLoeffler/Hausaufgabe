// Only the explicit loopback preview server maps Firebase imports here.
// This module never imports Firebase, opens a network connection or persists data.
const blocked=()=>{throw Error('Remotezugriff ist im lokalen Klassen-Testmodus gesperrt.');};
let apps=[];const auth={currentUser:null};
export const initializeApp=(config,name='[DEFAULT]')=>{const app={name,options:{projectId:'demo-gradecrew-classroom'}};apps.push(app);return app;};
export const getApps=()=>apps,getApp=()=>apps[0],getAuth=()=>auth;
export const onAuthStateChanged=(_auth,callback)=>{queueMicrotask(()=>callback(null));return ()=>{};};
export const getFirestore=()=>({}),getFunctions=()=>({}),getStorage=()=>({});
export const doc=(...path)=>({path}),collection=doc,collectionGroup=doc,query=doc,where=doc,orderBy=doc,limit=doc,startAfter=doc,ref=doc;
export const serverTimestamp=()=>Date.now();
export class Timestamp{constructor(seconds){this.seconds=seconds;}toMillis(){return this.seconds*1000;}static now(){return new Timestamp(Date.now()/1000);}static fromMillis(ms){return new Timestamp(ms/1000);}}
export const getDoc=blocked,getDocs=blocked,setDoc=blocked,addDoc=blocked,updateDoc=blocked,deleteDoc=blocked,writeBatch=blocked,onSnapshot=blocked,getCountFromServer=blocked;
export const createUserWithEmailAndPassword=blocked,signInWithEmailAndPassword=blocked,sendPasswordResetEmail=blocked,signOut=blocked,updateProfile=blocked,signInWithCustomToken=blocked;
export const httpsCallable=()=>async()=>blocked();
export const uploadBytesResumable=blocked,deleteObject=blocked;
