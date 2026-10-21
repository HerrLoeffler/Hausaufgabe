import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
// Content identity includes source, fixtures, tests, translations and assets.
// Modification times are only a read cache; they are never the build identity.
const cache=new Map();
export async function sourceFingerprint(root){const hash=createHash('sha256');
 async function visit(folder){for(const entry of (await fs.readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  if(entry.name.startsWith('.')||['node_modules','docs'].includes(entry.name)||entry.isSymbolicLink())continue;
  const file=path.join(folder,entry.name);if(entry.isDirectory()){await visit(file);continue;}
  if(!/\.(mjs|cjs|js|css|html|json|svg|webp|png|jpg|wav|mp3)$/.test(file))continue;
  const stat=await fs.stat(file);let item=cache.get(file);if(!item||item.mtime!==stat.mtimeMs||item.size!==stat.size){item={mtime:stat.mtimeMs,size:stat.size,hash:createHash('sha256').update(await fs.readFile(file)).digest('hex')};cache.set(file,item);}
  hash.update(path.relative(root,file)).update(item.hash);
 }}await visit(root);return 'local-'+hash.digest('hex').slice(0,20);
}
export function testResult(exit,before,after){return before!==after?'blocked':exit===0?'passed':'failed';}
