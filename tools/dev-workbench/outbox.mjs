export function createOutbox(storage,key){
 const read=()=>{const raw=storage.getItem(key);if(!raw)return [];const items=JSON.parse(raw);if(!Array.isArray(items))throw Error('Lokale Hinweisablage ist beschädigt. Bitte exportieren, nicht löschen.');return items;};
 const write=items=>storage.setItem(key,JSON.stringify(items));
 return {read,put(payload){const items=read();if(!items.some(i=>i.clientRequestId===payload.clientRequestId))items.push(payload);write(items);},remove(requestId){write(read().filter(i=>i.clientRequestId!==requestId));}};
}
