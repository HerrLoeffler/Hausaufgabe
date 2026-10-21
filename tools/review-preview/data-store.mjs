import fs from 'node:fs/promises';
export async function openReviewStore(file){
 let docs;try{docs=new Map(JSON.parse(await fs.readFile(file,'utf8')));}catch(error){if(error.code!=='ENOENT')throw error;docs=new Map();}
 docs.set('users/local-admin',{role:'admin',status:'active'});docs.set('users/local-teacher',{role:'teacher',status:'active'});
 let serial=Promise.resolve();return {transaction:fn=>{const operation=serial.catch(()=>{}).then(async()=>{
  const next=new Map(docs);let changed=false;
  const value=await fn({get:async key=>structuredClone(next.get(key)||null),set:(key,value)=>{changed=true;next.set(key,structuredClone(value));},
   list:async(collection,{owner,cursor='',limit=100}={})=>[...next].filter(([key,value])=>key.startsWith(collection+'/')&&key.split('/').length===2&&(!owner||value.authorId===owner)&&key.split('/')[1]>cursor).sort().slice(0,limit).map(([key,value])=>({...structuredClone(value),id:key.split('/')[1]}))});
  if(changed){await fs.writeFile(file+'.tmp',JSON.stringify([...next]),{mode:0o600});await fs.rename(file+'.tmp',file);docs=next;}return value;
 });serial=operation;return operation;}};
}
