// Browser-only drafts/outbox; server confirmation remains a separate state.
export function createReviewStorage(indexedDB=globalThis.indexedDB) {
 let database;
 function open(){return database ||= new Promise((resolve,reject)=>{
  if(!indexedDB){reject(new Error('Lokaler Speicher nicht verfügbar.'));return;}
  const request=indexedDB.open('gradecrew-review-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('records');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });}
 async function run(mode,operation){const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('records',mode);let result;const request=operation(tx.objectStore('records'));
  request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result??null);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Speichern abgebrochen.'));
 });}
 async function update(key, change){const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('records','readwrite'),store=tx.objectStore('records');let value;const request=store.get(key);
  request.onsuccess=()=>{try{value=change(request.result??null);store.put(value,key);}catch(err){tx.abort();reject(err);}};
  tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Speichern abgebrochen.'));
 });}
 return {update,get:key=>run('readonly',s=>s.get(key)),put:(key,value)=>run('readwrite',s=>s.put(value,key)),remove:key=>run('readwrite',s=>s.delete(key))};
}
