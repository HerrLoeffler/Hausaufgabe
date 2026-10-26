// Real browser pixels only. No DOM renderer and no remote image requests.
export const MAX_IMAGE_BYTES=2*1024*1024;
export function assertCaptureSource(track,origin,handle){const source=track?.getCaptureHandle?.();if(track?.getSettings?.().displaySurface!=='browser'||source?.origin!==origin||source?.handle!==handle)throw Error('Bitte nur diesen GradeCrew-Tab wählen. Alternativ einen Screenshot als Bild beifügen.');}
export function pixelRect(rect,width,height){if(!rect||![rect.x,rect.y,rect.width,rect.height,width,height].every(Number.isFinite))throw Error('Ungültiger Bildbereich.');const x=Math.max(0,Math.floor(rect.x)),y=Math.max(0,Math.floor(rect.y)),right=Math.min(width,Math.ceil(rect.x+rect.width)),bottom=Math.min(height,Math.ceil(rect.y+rect.height));if(right-x<2||bottom-y<2)throw Error('Bitte einen größeren Bildbereich wählen.');return {x,y,width:right-x,height:bottom-y};}
export function editPixels(canvas,rect,mode){const r=pixelRect(rect,canvas.width,canvas.height),ctx=canvas.getContext('2d');if(mode==='redact'){ctx.fillStyle='#000';ctx.fillRect(r.x,r.y,r.width,r.height);}else if(mode==='crop'){const copy=canvas.ownerDocument.createElement('canvas');copy.width=r.width;copy.height=r.height;copy.getContext('2d').drawImage(canvas,r.x,r.y,r.width,r.height,0,0,r.width,r.height);canvas.width=r.width;canvas.height=r.height;canvas.getContext('2d').drawImage(copy,0,0);}return r;}
export async function exportImage(canvas){let blob;for(const quality of [.94,.88,.8,.7]){blob=await new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('Bild konnte nicht exportiert werden.')),'image/jpeg',quality);}catch(e){reject(e);}});if(blob.size<=MAX_IMAGE_BYTES)return blob;}throw Error('Bild größer als 2 MB. Bitte weiter zuschneiden.');}
export async function canvasFromImage(document,blob){if(!blob||!['image/jpeg','image/png','image/webp'].includes(blob.type)||blob.size>8*1024*1024)throw Error('Bitte PNG, JPEG oder WebP bis 8 MB beifügen.');const win=document.defaultView,url=win.URL.createObjectURL(blob),image=new win.Image();try{image.src=url;await image.decode();if(!image.naturalWidth||image.naturalWidth*image.naturalHeight>24000000)throw Error('Bild zu groß. Bitte einen kleineren Screenshot beifügen.');const scale=Math.min(1,4096/image.naturalWidth,4096/image.naturalHeight,Math.sqrt(12000000/(image.naturalWidth*image.naturalHeight)));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.naturalWidth*scale));c.height=Math.max(1,Math.round(image.naturalHeight*scale));c.getContext('2d').fillStyle='#fff';c.getContext('2d').fillRect(0,0,c.width,c.height);c.getContext('2d').drawImage(image,0,0,c.width,c.height);return c;}finally{win.URL.revokeObjectURL(url);}}
export function installTabCapture(window){
 const media=window.navigator.mediaDevices,handle=window.crypto.randomUUID();let disposed=false;
 try{media?.setCaptureHandleConfig?.({handle,exposeOrigin:true,permittedOrigins:[window.location.origin]});}catch{}
 async function capture(){
  if(disposed||!media?.getDisplayMedia||!media?.setCaptureHandleConfig)throw Error('Dieser Browser unterstützt die sichere Tabaufnahme nicht. Bitte einen Screenshot als Bild beifügen.');
  let stream,video,timer,permissionTimer,abandoned=false;
  try{
   const permission=media.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',monitorTypeSurfaces:'exclude',surfaceSwitching:'exclude',systemAudio:'exclude'});
   permission.then(s=>{if(abandoned||disposed)s.getTracks().forEach(t=>t.stop());},()=>{});
   stream=await Promise.race([permission,new Promise((_,reject)=>{permissionTimer=window.setTimeout(()=>{abandoned=true;reject(Error('Keine Aufnahme bestätigt. Bitte den Browserdialog schließen und einen Screenshot als Bild beifügen.'));},15000);})]);window.clearTimeout(permissionTimer);
   const track=stream.getVideoTracks()[0];assertCaptureSource(track,window.location.origin,handle);if(disposed)throw Error('Aufnahme abgebrochen.');
   video=window.document.createElement('video');video.muted=true;video.srcObject=stream;await video.play();
   await Promise.race([new Promise(resolve=>video.requestVideoFrameCallback?video.requestVideoFrameCallback(resolve):window.requestAnimationFrame(()=>window.requestAnimationFrame(resolve))),new Promise((_,reject)=>{timer=window.setTimeout(()=>reject(Error('Keine Bildaufnahme verfügbar. Bitte Bild beifügen.')),5000);})]);
   assertCaptureSource(track,window.location.origin,handle);if(disposed||!video.videoWidth||!video.videoHeight)throw Error('Aufnahme abgebrochen.');
   const c=window.document.createElement('canvas'),scale=Math.min(1,4096/video.videoWidth,4096/video.videoHeight,Math.sqrt(12000000/(video.videoWidth*video.videoHeight)));c.width=Math.round(video.videoWidth*scale);c.height=Math.round(video.videoHeight*scale);c.getContext('2d').drawImage(video,0,0,c.width,c.height);
   // Reliable selectors only; names/answers still need the visible manual preview.
   for(const field of window.document.querySelectorAll('input[type=password],[data-feedback-private],[autocomplete="one-time-code"],[autocomplete="cc-number"]')){const r=field.getBoundingClientRect();if(r.width&&r.height){try{editPixels(c,{x:r.left*c.width/window.innerWidth-3,y:r.top*c.height/window.innerHeight-3,width:r.width*c.width/window.innerWidth+6,height:r.height*c.height/window.innerHeight+6},'redact');}catch{}}}
   return c;
  }finally{abandoned=true;window.clearTimeout(permissionTimer);window.clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());if(video){video.pause();video.srcObject=null;}}
 }
 return {capture,dispose(){disposed=true;}};
}
export async function blobBase64(blob){const bytes=new Uint8Array(await blob.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
// WebKit may reject Blob structured cloning in IndexedDB. Persist only the final JPEG bytes.
export async function durableImageRecord(value){const {imageBlob,...record}=value;if(imageBlob)record.imageBytes=await imageBlob.arrayBuffer();return record;}
export function restoreImageRecord(value){if(value?.imageBytes&&!value.imageBlob)return {...value,imageBlob:new Blob([value.imageBytes],{type:'image/jpeg'})};return value;}
