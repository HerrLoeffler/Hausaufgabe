import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const legalFilenames=['datenschutz.html','impressum.html','support.html'];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function paragraph(value){return escape(value).replace(/https:\/\/[^\s;]+/g,url=>`<a href="${url}" rel="noreferrer">${url}</a>`);}
export async function buildLegalPages(root,output){
 const content=JSON.parse(await fs.readFile(path.join(root,'legal-content.de.json'),'utf8'));
 if(content.schemaVersion!==1||content.pages.length!==3)throw new Error('Unsupported legal content schema.');
 for(const page of content.pages){
  if(!legalFilenames.includes(page.filename))throw new Error('Unknown legal page.');
  const nav=content.pages.map(p=>`<a href="${p.filename}"${p.id===page.id?' aria-current="page"':''}>${escape(p.title)}</a>`).join('');
  const sections=page.sections.map((s,i)=>`<section id="abschnitt-${i+1}"><h2>${escape(s.title)}</h2>${s.paragraphs.map(p=>`<p>${paragraph(p)}</p>`).join('')}</section>`).join('\n');
  const html=`<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light"><meta name="referrer" content="no-referrer"><title>${escape(page.title)} · GradeCrew</title><link rel="stylesheet" href="legal-pages.css"></head>
<body class="legalPage"><a class="legalSkip" href="#inhalt">Zum Inhalt</a><header><a class="legalBrand" href="/" aria-label="GradeCrew Startseite"><img src="assets/gradecrew/brand-icon-v1.svg" width="48" height="48" alt=""><span>GradeCrew<small>Website &amp; Secure</small></span></a><a class="legalHome" href="/">Zur Startseite</a></header><main id="inhalt"><div class="legalIntro"><p class="legalEyebrow">GradeCrew · Informationen</p><h1>${escape(page.title)}</h1><p>${escape(page.intro)}</p><p class="legalDate">Stand: 21. Oktober 2026</p></div><nav aria-label="Rechtliches und Hilfe">${nav}</nav>${sections}</main><footer><nav aria-label="Weitere Informationen">${nav}</nav><p>GradeCrew · Martin Löffler</p></footer></body></html>\n`;
  await fs.writeFile(path.join(output,page.filename),html);
 }
 return legalFilenames;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
 const output=process.argv[2];if(!output||!path.isAbsolute(output))throw new Error('Absolute output directory required.');
 await fs.mkdir(output,{recursive:true});await buildLegalPages(root,output);
}
