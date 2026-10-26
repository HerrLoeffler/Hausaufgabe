import test,{after} from 'node:test';import fs from 'node:fs';import {initializeTestEnvironment,assertFails} from '@firebase/rules-unit-testing';import {ref,uploadBytes,getBytes,deleteObject} from 'firebase/storage';
const env=await initializeTestEnvironment({projectId:'demo-gc-visual-feedback',storage:{host:'127.0.0.1',port:9199,rules:fs.readFileSync(new URL('../../storage.rules',import.meta.url),'utf8')}});after(()=>env.cleanup());
test('raw feedback images cannot be uploaded, read, listed or deleted directly by any browser role',async()=>{
 for(const context of [env.unauthenticatedContext(),env.authenticatedContext('owner'),env.authenticatedContext('foreign'),env.authenticatedContext('admin',{role:'admin'})]){
  const file=ref(context.storage(),'feedback-images/owner/private-note.jpg');await assertFails(uploadBytes(file,new Uint8Array([1,2,3]),{contentType:'image/jpeg'}));await assertFails(getBytes(file));await assertFails(deleteObject(file));
 }
});
