import {readFile,mkdir,writeFile} from 'node:fs/promises';
const source=await readFile(new URL('../shared/chapter-contract.js',import.meta.url),'utf8');
for(const codebase of ['functions','assessment-functions']) {
 const dir=new URL(`../${codebase}/lib/shared/`,import.meta.url);await mkdir(dir,{recursive:true});
 await writeFile(new URL('chapter-contract.js',dir),source);
}
