import fs from 'node:fs/promises';import path from 'node:path';import{fileURLToPath}from'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),dest=process.argv[2];if(!dest||!path.isAbsolute(dest))throw new Error('Absolute build path required');const output=path.join(dest,'public');await fs.mkdir(output,{recursive:true});if((await fs.readdir(output)).length)throw new Error('Empty build required');for(const name of ['index.html','app.js','styles.css','question-renderer.mjs','clock.mjs'])await fs.copyFile(path.join(root,'lab/test-rallye',name),path.join(output,name));

await fs.writeFile(path.join(output,'lab-release.json'),JSON.stringify({experiment:'test-rallye',format:1,files:{}}));
