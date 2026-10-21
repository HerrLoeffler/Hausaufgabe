// Project adapters explicitly choose safe developer state. No automatic answer/token capture.
let adapter=null;
export function registerDevAdapter(value){if(!value||typeof value!=='object'||value.version!==1)throw Error('Entwicklungsadapter benötigt version:1.');adapter=value;return ()=>{if(adapter===value)adapter=null;};}
export const getDevAdapter=()=>adapter;
export function installDevSDK(){window.GradeCrewDev={version:1,registerAdapter:registerDevAdapter,getAdapter:getDevAdapter};queueMicrotask(()=>document.dispatchEvent(new Event("gradecrew:dev-sdk-ready")));return window.GradeCrewDev;}
export function safeAdapterContext(){const v=adapter?.captureContext?.()||{};return {view:String(v.view||document.querySelector('main section[id]:not(.hidden)')?.id||'').slice(0,100),scene:String(v.scene||'').slice(0,40),entity:String(v.entity||'').slice(0,160)};}
