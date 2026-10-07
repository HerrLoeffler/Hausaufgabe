// Served only by the loopback preview. No Firebase/provider code is loaded.
const forbidden=()=>{throw new Error('Echte Datenzugriffe sind in der lokalen Prüfumgebung gesperrt.');};
export const getApp=()=>({options:{projectId:"local-review"}}),getApps=()=>[getApp()];
export const initializeApp=()=>({options:{projectId:'local-review'}}),getAuth=()=>({currentUser:null}),getFirestore=()=>({}),getStorage=()=>({}),getFunctions=()=>({});
export const onAuthStateChanged=(_auth,callback)=>{const timer=setTimeout(()=>callback(null),0);return ()=>clearTimeout(timer);};
export const doc=(...parts)=>({id:parts.at(-1)||'local-id'}),collection=(...parts)=>({path:parts.slice(1).join('/')}),query=(...v)=>v,where=(...v)=>v,orderBy=(...v)=>v,limit=v=>v,startAfter=v=>v,collectionGroup=(...v)=>v,serverTimestamp=()=>0;
export const Timestamp={now:()=>({toMillis:()=>0}),fromMillis:n=>({toMillis:()=>n})};
export const getDoc=forbidden,getDocs=forbidden,setDoc=forbidden,addDoc=forbidden,updateDoc=forbidden,deleteDoc=forbidden,writeBatch=forbidden,getCountFromServer=forbidden,onSnapshot=forbidden;
export const createUserWithEmailAndPassword=forbidden,signInWithEmailAndPassword=forbidden,sendPasswordResetEmail=forbidden,signOut=forbidden,updateProfile=forbidden,connectAuthEmulator=forbidden,connectFirestoreEmulator=forbidden;
export const ref=(...v)=>v,uploadBytesResumable=forbidden,deleteObject=forbidden,connectFunctionsEmulator=forbidden;
export const httpsCallable=(_functions,name)=>async data=>{
 if(name!=='reviewMode')return forbidden();
 const response=await fetch('/__review/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.message),{code:result.code});return {data:result};
};
