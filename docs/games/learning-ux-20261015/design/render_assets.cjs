const fs=require('fs'),path=require('path');
const sharp=require('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{for(const dir of ['assets','mockups']){for(const f of fs.readdirSync(path.join(__dirname,dir)).filter(x=>x.endsWith('.svg'))){await sharp(path.join(__dirname,dir,f),{density:180}).resize({width:1600,height:1800,fit:'inside'}).png().toFile(path.join(__dirname,'preview',f.replace('.svg','.png')));}}})().catch(e=>{console.error(e);process.exit(1)});
