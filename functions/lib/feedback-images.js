'use strict';
const {createHash}=require('node:crypto');
const sharp=require('sharp');
const DAY=86400000,MAX_BYTES=2*1024*1024;
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const noteKey=(uid,requestId)=>{if(typeof requestId!=='string'||!/^[\w-]{1,128}$/.test(requestId))fail('invalid-argument','Ungültige Bildkennung.');return createHash('sha256').update(uid+':'+requestId).digest('hex');};
async function normalizeImage(base64){
 if(typeof base64!=='string'||!base64.length||base64.length>Math.ceil(MAX_BYTES*4/3)+4||(base64.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)))fail('invalid-argument','Bild fehlt oder ist zu groß (maximal 2 MB).');
 const input=Buffer.from(base64,'base64');if(input.length>MAX_BYTES)fail('invalid-argument','Bild ist zu groß.');
 try{
  const decoder=sharp(input,{limitInputPixels:12000000,animated:false,failOn:'warning'});const m=await decoder.metadata();
  if(!['jpeg','png','webp'].includes(m.format)||!m.width||!m.height||m.width>4096||m.height>4096||(m.pages||1)>1)fail('invalid-argument','Bitte ein einzelnes PNG-, JPEG- oder WebP-Bild bis 4096 Pixel verwenden.');
  const {data,info}=await decoder.rotate().flatten({background:'#fff'}).jpeg({quality:90,mozjpeg:true}).toBuffer({resolveWithObject:true});
  if(data.length>MAX_BYTES)fail('invalid-argument','Bild ist nach Verarbeitung zu groß. Bitte zuschneiden.');
  return {bytes:data,width:info.width,height:info.height,size:data.length,contentType:'image/jpeg',sha256:createHash('sha256').update(data).digest('hex')};
 }catch(e){if(e.code==='invalid-argument')throw e;fail('invalid-argument','Bild konnte nicht gelesen werden. Bitte Screenshot erneut beifügen.');}
}
function createImageService({leases,objects,now=Date.now}){
 async function upload(uid,data){
  const imageId=noteKey(uid,data.clientRequestId),image=await normalizeImage(data.base64);const path=`feedback-images/${uid}/${imageId}.jpg`;
  const lease=await leases.update(imageId,old=>{
   if(old&&(old.ownerId!==uid||old.sha256!==image.sha256))fail('already-exists','Dieser Entwurf hat bereits ein anderes Bild. Bitte einen neuen Hinweis beginnen.');
   if(old&&['deleted','expired','deleting'].includes(old.state))fail('failed-precondition','Bildentwurf abgelaufen. Bitte einen neuen Hinweis beginnen.');
   return old||{imageId,ownerId:uid,path,width:image.width,height:image.height,size:image.size,contentType:image.contentType,sha256:image.sha256,state:'pending',createdAt:now(),expiresAt:now()+DAY,cleanupAt:now()+DAY};
  });
  if(lease.expiresAt<=now())fail('failed-precondition','Bildentwurf abgelaufen.');
  await objects.put(path,image.bytes,image.sha256);
  let ready;try{ready=await leases.update(imageId,old=>{if(!old||old.sha256!==image.sha256||['deleted','expired','deleting'].includes(old.state))fail('failed-precondition','Bildentwurf abgelaufen.');return {...old,state:old.state==='attached'?'attached':'ready'};});}catch(e){await objects.remove(path);throw e;}
  return {imageId:ready.imageId,width:ready.width,height:ready.height,size:ready.size,contentType:ready.contentType,expiresAt:ready.expiresAt};
 }
 async function read({imageId,ownerId}){
  const lease=await leases.get(imageId);if(!lease||lease.ownerId!==ownerId)fail('permission-denied','Kein Zugriff auf dieses Bild.');
  if(lease.state!=='attached'||lease.expiresAt<=now())fail('failed-precondition','Bild nicht verfügbar oder Aufbewahrungsfrist abgelaufen.');
  const bytes=await objects.get(lease.path);if(!bytes||bytes.length>MAX_BYTES||createHash('sha256').update(bytes).digest('hex')!==lease.sha256)fail('failed-precondition','Bild nicht verfügbar.');
  return {imageId,contentType:'image/jpeg',base64:bytes.toString('base64'),width:lease.width,height:lease.height,expiresAt:lease.expiresAt};
 }
 async function remove({imageId,ownerId},reason='deleted'){
  const current=await leases.get(imageId);if(!current||current.ownerId!==ownerId)fail('permission-denied','Kein Zugriff auf dieses Bild.');
  if(['deleted','expired'].includes(current.state))return {ok:true,removed:true};
  const lease=await leases.update(imageId,old=>{if(reason==='expired'&&old.expiresAt>now())return old;return {...old,state:'deleting',expiresAt:0};});
  if(lease.state!=='deleting')return {ok:true,removed:false};
  await objects.remove(lease.path);await leases.update(imageId,old=>({imageId:old.imageId,ownerId:old.ownerId,state:reason,expiresAt:0,cleanupAt:null}));return {ok:true,removed:true};
 }
 async function cleanup(ownerExists,includeAll=false){
  const rows=await leases.expired(now(),includeAll);let removed=0;
  for(const row of rows){if(['expired','deleted'].includes(row.state))continue;const gone=!await ownerExists(row.ownerId);if(row.expiresAt<=now()||gone){await remove({imageId:row.imageId,ownerId:row.ownerId},gone?'deleted':'expired');removed++;}}
  return {removed};
 }
 return {upload,read,remove,cleanup};
}
module.exports={normalizeImage,createImageService,noteKey,MAX_BYTES,DAY};
