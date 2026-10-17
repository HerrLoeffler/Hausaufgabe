export function createBridge(win,timeoutMs=10000){
 let id=0,hostOrigin=null;const pending=new Map();const listeners=[];
 const receive=event=>{
  if(event.source!==win.parent)return;
  if(hostOrigin!==null&&event.origin!==hostOrigin)return;
  const m=event.data;if(m?.jsonrpc!=='2.0')return;
  if(m.id!==undefined&&pending.has(m.id)){
   const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);
   if(hostOrigin===null)hostOrigin=event.origin;
   if(m.error)p.reject(Error(m.error.message??'Host hat die Anfrage abgelehnt.'));else p.resolve(m.result);
  }else if(m.method==='ui/notifications/tool-result')listeners.forEach(f=>f(m.params));
 };
 win.addEventListener('message',receive);
 const notify=(method,params)=>win.parent.postMessage({jsonrpc:'2.0',method,params},hostOrigin&&hostOrigin!=='null'?hostOrigin:'*');
 const request=(method,params)=>new Promise((resolve,reject)=>{
  const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(Error('Keine Bestätigung vom Chat. Eingang unbekannt; nicht automatisch erneut senden.'));},timeoutMs);
  pending.set(n,{resolve,reject,timer});
  win.parent.postMessage({jsonrpc:'2.0',id:n,method,params},hostOrigin&&hostOrigin!=='null'?hostOrigin:'*');
 });
 return {request,notify,onResult:f=>listeners.push(f),close(){win.removeEventListener('message',receive);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Verbindung geschlossen.'));}pending.clear();}};
}
