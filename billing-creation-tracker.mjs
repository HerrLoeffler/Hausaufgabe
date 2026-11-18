function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>[key,canonical(value[key])]));return value;}
export function createBillingCreationTracker({storage=null,getStorage,crypto=globalThis.crypto}={}){
  const memory=new Map(),prefix='gc:billing-create:v2:';
  function target(){return getStorage?getStorage():storage;}
  function key(uid,operation){return prefix+encodeURIComponent(uid)+':'+encodeURIComponent(operation);}
  function read(id){const value=target()?.getItem(id)||memory.get(id);try{return value?JSON.parse(value):null;}catch{return null;}}
  async function begin(uid,operation,payload){
    const id=key(uid,operation),bytes=new TextEncoder().encode(JSON.stringify(canonical(payload))),digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
    const previous=read(id);if(previous?.digest===digest&&typeof previous.requestId==='string')return previous.requestId;
    const requestId=crypto.randomUUID(),value=JSON.stringify({digest,requestId});target()?.setItem(id,value);memory.set(id,value);return requestId;
  }
  function complete(uid,operation,requestId){const id=key(uid,operation);if(read(id)?.requestId===requestId){target()?.removeItem(id);memory.delete(id);}}
  return{begin,complete};
}
