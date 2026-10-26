import fs from 'node:fs';
export function publicEntrySource(root = new URL('../', import.meta.url)) {
  const html=fs.readFileSync(new URL('homepage/index.html',root),'utf8');
  const app=fs.readFileSync(new URL('homepage/app.js',root),'utf8');
  const start=html.indexOf('  <div class="page"'),slot=html.indexOf('      <section class="showcase"'),endSlot=html.indexOf('    </main>',slot),end=html.indexOf('  <script type="module" src="/homepage/app.js',endSlot);
  if([start,slot,endSlot,end].some(x=>x<0))throw Error('Canonical homepage shell markers changed.');
  const shell=html.slice(start,slot)+'      <section class="showcase gcPublicSlot" aria-label="GradeCrew"><div class="gcPublicPanelFrame" id="gcUnifiedPanelHost"></div></section>\n'+html.slice(endSlot,end);
  const copy=app.match(/const copy = ([\s\S]+?);\nconst tasks =/)[1];
  return '// GENERATED from the canonical homepage; run tools/generate-public-entry-shell.mjs.\nexport const PUBLIC_ENTRY_HTML = '+JSON.stringify(shell)+';\nexport const PUBLIC_ENTRY_COPY = '+copy+';\n';
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).href===import.meta.url)fs.writeFileSync(new URL('../generated/public-entry-shell.js',import.meta.url),publicEntrySource());
