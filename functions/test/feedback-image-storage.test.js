'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),sharp=require('sharp');
test('private image deletion atomically marks both persisted note and Admin mirror unavailable',async()=>{
 const rows=new Map([['users/owner',{role:'teacher',status:'active'}]]),files=new Map();let writing=false;
 const db={doc:path=>({path,get:async()=>({data:()=>rows.get(path)})}),runTransaction:async fn=>{writing=false;return fn({get:async ref=>{assert.equal(writing,false,'all relationship reads precede writes');return {exists:rows.has(ref.path),data:()=>rows.get(ref.path)};},set:(ref,value)=>{writing=true;rows.set(ref.path,value);}});}};
 const bucket={file:path=>({save:async(bytes,opts)=>files.set(path,{bytes,metadata:opts.metadata}),download:async()=>[files.get(path).bytes],getMetadata:async()=>[files.get(path).metadata],delete:async()=>files.delete(path)})};
 const m={exports:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../feedback-image-storage'),'utf8'),{module:m,exports:m.exports,require:name=>name==='firebase-admin/firestore'?{getFirestore:()=>db}:name==='firebase-admin/storage'?{getStorage:()=>({bucket:()=>bucket})}:require('../lib/feedback-images')});
 const {service}=m.exports.imageStorage(),input=(await sharp({create:{width:100,height:80,channels:3,background:'#fff'}}).png().toBuffer()).toString('base64');const image=await service.upload('owner',{clientRequestId:'one',base64:input}),id=image.imageId;
 rows.set('reviewNotes/'+id,{authorId:'owner',attachment:{...image,status:'available'}});rows.set('feedback/visual-'+id,{authorId:'owner',attachment:{...image,status:'available'}});rows.get('reviewImageLeases/'+id).state='attached';
 await service.remove({imageId:id,ownerId:'owner'});assert.equal(files.size,0);assert.equal(rows.get('reviewNotes/'+id).attachment.status,'deleted');assert.equal(rows.get('feedback/visual-'+id).attachment.status,'deleted');await assert.rejects(service.read({imageId:id,ownerId:'owner'}));
});
