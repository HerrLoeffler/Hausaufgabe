import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const assets={};
for(const name of await readdir('assets')){
 const bytes=await readFile('assets/'+name);
 const mime=name.endsWith('.svg')?'image/svg+xml':name.endsWith('.webp')?'image/webp':'image/png';
 assets[name]='data:'+mime+';base64,'+bytes.toString('base64');
}
let html=await readFile('index.html','utf8');
const css=await readFile('style.css','utf8');
let demo=await readFile('demo.mjs','utf8');
demo=demo.replace(/^import .*;\n/gm,'').replace("img.src='assets/'+src","img.src=assetUrls[src]");
for(const [name,data] of Object.entries(assets)){
 html=html.replaceAll('src="assets/'+name+'"','data-asset="'+name+'"');
 demo=demo.replaceAll("'assets/"+name+"'",'assetUrls['+JSON.stringify(name)+']');
 demo=demo.replaceAll('src="assets/'+name+'"','src="\'+assetUrls['+JSON.stringify(name)+']+\'"');
}
const copy=(await readFile('copy.mjs','utf8')).replaceAll('export function','function');
const flow=(await readFile('flow.mjs','utf8')).replaceAll('export function','function');
const js='const assetUrls='+JSON.stringify(assets)+';\ndocument.querySelectorAll("img[data-asset]").forEach(el=>el.src=assetUrls[el.dataset.asset]);\n'+copy+'\nconst t=heroText;\n'+flow+'\n'+demo;
const hash=value=>createHash('sha256').update(value).digest('base64');
const csp="default-src 'none'; img-src data:; style-src 'sha256-"+hash(css)+"'; script-src 'sha256-"+hash(js)+"'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
html=html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/,'<meta http-equiv="Content-Security-Policy" content="'+csp+'">');
html=html.replace('<link rel="stylesheet" href="style.css"><script type="module" src="demo.mjs"></script>','<style>'+css+'</style>');
html=html.replace('</body>','<script type="module">'+js+'</script></body>');
await writeFile('preview.html',html);
console.log('Created offline preview.html ('+Math.round(Buffer.byteLength(html)/1024/1024*10)/10+' MB)');
