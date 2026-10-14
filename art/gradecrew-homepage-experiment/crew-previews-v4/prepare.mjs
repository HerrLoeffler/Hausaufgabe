import {readFile,writeFile} from 'node:fs/promises';
const original=await readFile('baseline/index.html','utf8');
let head=original.slice(0,original.indexOf('</head>'));
head=head.replace(/<script\b[\s\S]*?<\/script>/g,'');
head=head.replace('<head>','<head><base href="./baseline/"><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; media-src \'self\' data:; connect-src \'none\'; object-src \'none\'; form-action \'none\'">');
const header=original.slice(original.indexOf('  <header class="topbar">'),original.indexOf('  <main id="mainContent"'));
const auth=original.slice(original.indexOf('    <section id="authView"'),original.indexOf('    <section id="dashboardView"'));
const footer=original.split('\n').find(l=>l.includes('class="appFooter rightsFooter"'));
for(const [file,mode] of [['index.html','v4'],['baseline.html','baseline']]){
 let h=head.replace(/<title>.*?<\/title>/,'<title>GradeCrew · '+(mode==='v4'?'V4 Experiment':'Unveränderte lokale Staging-Referenz')+'</title>');
 h+='</head><body id="gradecrewPage" data-experiment="'+mode+'">'+header+'<main id="mainContent" class="shell" tabindex="-1">'+auth+'</main>'+footer+'<script type="module" src="../preview-start.mjs"></script></body></html>';
 await writeFile(file,h);
}
let entry=await readFile('baseline/gradecrew-entry-flow.js','utf8');
entry=entry.replace('./generated/','./baseline/generated/').replace('./shared/','./baseline/shared/').replace('import "./gradecrew-hero-copy.mjs?v=1";','import "./baseline/gradecrew-hero-copy.mjs?v=1";').replace('./gradecrew-hero-demo.mjs?v=1','./demo-v3.mjs');
await writeFile('entry-v3.mjs',entry);
const tour=await readFile('baseline/gradecrew-tour-v7.js','utf8');
await writeFile('tutorial-fixture.mjs',tour.slice(tour.indexOf('const single ='),tour.indexOf('export function preparedResponse')));
const startup=await readFile('baseline/startup.js','utf8');
const design=startup.slice(startup.indexOf('function installGradeCrewDesignStyles()'),startup.indexOf('function installGradeCrewBrandAssets()'));
const brand=startup.slice(startup.indexOf('function installGradeCrewBrandAssets()'),startup.indexOf('installGradeCrewDesignStyles();'));
await writeFile('preview-start.mjs',[
'import {gradeCrewI18n} from "./baseline/shared/i18n/bootstrap.mjs?v=3";',
'import {GRADECREW_ASSETS} from "./baseline/generated/gradecrew-assets.js?v=1.2.0";',
'import {watchStickyHeight} from "./baseline/interface.js?v=2.3.1-gc2";',
'import {translateTree} from "./baseline/shared/i18n/browser-runtime.mjs?v=3";',
design,brand,
'installGradeCrewDesignStyles();',
'if(document.body.dataset.experiment==="v4"){const css=document.createElement("link");css.rel="stylesheet";css.href="../v3.css";document.head.appendChild(css);}',
'await Promise.all([...document.querySelectorAll("link[rel=stylesheet]")].map(link=>link.sheet?Promise.resolve():new Promise(resolve=>{link.addEventListener("load",resolve,{once:true});link.addEventListener("error",resolve,{once:true});})));',
'installGradeCrewBrandAssets();',
'const entry=document.body.dataset.experiment==="v4"?await import("./entry-v3.mjs"):await import("./baseline/gradecrew-entry-flow.js");',
'entry.installGradeCrewEntryFlow();',
'if(document.body.dataset.experiment==="v4")document.querySelector(".gcHeroArtwork").src="../assets/crew-classroom-lightblue-v4.png";',
'document.getElementById("gcEntryStart")?.addEventListener("animationend",event=>{if(event.target.id==="gcEntryStart"&&event.animationName==="gcEntryIn")window.dispatchEvent(new Event("resize"));});',
'translateTree(document.querySelector(".topbar"));',
'watchStickyHeight(document.querySelector(".topbar"),"--topbar-height");',
'document.documentElement.style.setProperty("--editor-head-height",`${Math.ceil(document.querySelector(".compactEditorHead")?.getBoundingClientRect().height||0)}px`);',
'document.querySelectorAll("form").forEach(form=>form.addEventListener("submit",event=>{event.preventDefault();form.querySelectorAll("input[type=password]").forEach(input=>input.value="");alert(gradeCrewI18n?"Lokale Vorschau: Es wird kein Konto angelegt und kein Test geöffnet.":"Local preview only.");}));',
'document.addEventListener("gradecrew:start-guest-tour",()=>{location.href="../tutorial-finale.html";});',
'document.getElementById("openRightsReport")?.addEventListener("click",()=>alert("Lokale Vorschau: keine Meldung gesendet."));'
].join('\n'));
await writeFile('package.json',JSON.stringify({type:'module',private:true,scripts:{test:'node --test *.test.mjs',dev:'python3 -m http.server 8781 --bind 127.0.0.1'}}));
console.log('Prepared original HTML/CSS shell and isolated entry wrapper.');

