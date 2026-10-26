import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const workspace='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4';
const root=path.join(workspace,'outputs/gradecrew-kollegium-20261028');
const b=path.join(root,'revision-v5');
const source=path.join(root,'revision-v4/files/GradeCrew_Kollegium_20261028_v4_final.pptx');
const config=JSON.parse(await fs.readFile(path.join(b,'build/tutorial-config.json'),'utf8'));
const meta=JSON.parse(await fs.readFile(path.join(b,'build/safe-captures.json'),'utf8'));
const dimensions=Object.fromEntries(meta.map(x=>[path.basename(x.safeFile,'.png'),x.size]));
const C={bg:'#20192C',white:'#FFFFFF',text:'#EFE4FA',muted:'#B7A5C8',red:'#F02635'};
function text(s,name,copy,x,y,w,h,size=32,bold=true,color=C.white){const z=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=copy;z.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0};if(copy==='gradecrew.de')z.text.get(copy).link={uri:'https://gradecrew.de/',isExternal:true};return z;}
function rect(s,name,x,y,w,h,fill='none',line=C.red,lw=4){return s.shapes.add({name,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:lw}});}
async function image(s,file,pos,alt=''){const data=await fs.readFile(file);return s.images.add({blob:data,contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',alt,position:pos,fit:'contain'});}
function reset(s){s.shapes.deleteAll();for(const z of [...s.images.items])z.delete();s.background.fill=C.bg;}
function header(s,n,title){text(s,'title',title,48,35,1165,70,44);text(s,'page',String(n).padStart(2,'0')+'  /  10',1110,666,115,25,18,false,C.muted);}
const contextFrame={left:36,top:145,width:320,height:450},zoomFrame={left:400,top:260,width:840,height:330};
function placement(frame,sw,sh){const k=Math.min(frame.width/sw,frame.height/sh);return{x:frame.left+(frame.width-sw*k)/2,y:frame.top+(frame.height-sh*k)/2,w:sw*k,h:sh*k,k};}
async function tutorial(s,c,active=null){reset(s);header(s,c.number,c.title);const baseFile=path.join(b,'safe',c.base+'.png');await image(s,baseFile,contextFrame,'Echter Kontext der Website');
for(let i=0;i<c.phases.length;i++){if(active!==null&&active!==i)continue;const ph=c.phases[i],pre=`phase${i+1}-`;rect(s,pre+'context-back',28,140,338,510,C.bg,C.bg,0);await image(s,path.join(b,'safe',ph.file+'.png'),contextFrame,'Echter Websitekontext');const [sw,sh]=dimensions[ph.file];const p=placement(contextFrame,sw,sh);const [x,y,w,h]=ph.focus;rect(s,pre+'highlight',p.x+x*p.k,p.y+y*p.k,w*p.k,h*p.k);
rect(s,pre+'back',380,140,870,512,C.bg,C.bg,0);text(s,pre+'callout',`${i+1}  ${ph.label}`,400,157,840,88,32);const cropFile=path.join(b,'safe/crops',`slide-${c.number}-step-${i+1}.png`);const [cw,ch]=ph.crop.slice(2);let z=placement(zoomFrame,cw,ch);if(z.k>3.5){z={x:zoomFrame.left+(zoomFrame.width-cw*3.5)/2,y:zoomFrame.top+(zoomFrame.height-ch*3.5)/2,w:cw*3.5,h:ch*3.5,k:3.5};}await image(s,cropFile,{left:z.x,top:z.y,width:z.w,height:z.h},'Vergrößerter echter Ausschnitt');rect(s,pre+'zoom-border',z.x,z.y,z.w,z.h);
if(ph.extra)text(s,pre+'extra',ph.extra,400,598,840,64,24,false,C.text);
}
const files=[...new Set(c.phases.map(x=>x.file))];const urls=files.map(x=>x.startsWith('17-')?'https://gradecrew.de/secure-student.html':'https://hausaufgabe-staging.web.app/');
s.speakerNotes.text=c.note.replaceAll('Klasse7','Klasse 7').replaceAll('bis10Dateien','bis zu 10 Dateien')+'\n\nVortrag: pro Fokus einmal weiterklicken.\nBildquellen: '+[...new Set(urls)].join(', ')+', 26.10.2026. Schul-Live-Innensichten aus bestehender Anmeldung. Sichtbare UI-Version im Footer des Einstiegs: v2.3.1-gc45-rc1, kein daraus abgeleiteter Code-SHA. Captures: '+files.join(', ')+'.\nDie eingebetteten Bitmapdateien sind physisch um den Kontokopf beschnitten. Keine private Testliste, Namen, Codes oder Schülerleistungen eingebettet. Synthetischer SYSTEMTEST nur geöffnet, nicht geändert. Keine neue Generierung, Veröffentlichung oder Abgabe. Quellenbrief der bestehenden Task ergänzend für Abgabe/Lösungsregeln.';
}
const p=await PresentationFile.importPptx(await FileBlob.load(source));if(p.slides.items.length!==10)throw new Error('Expected10slides');
let s=p.slides.items[1];reset(s);header(s,2,'Website und Apps');
text(s,'website','gradecrew.de',48,160,390,65,42);await image(s,path.join(b,'safe/01-homepage.png'),{left:48,top:240,width:410,height:211},'Aktuelle öffentliche GradeCrew-Homepage');text(s,'website-role','Direkt im Browser starten',48,475,420,85,29,false,C.text);
await image(s,path.join(b,'assets/app-icons/gradecrew-lehrkraefte-app-icon.png'),{left:550,top:200,width:175,height:175},'Originales Icon der Lehrkräfte-App');text(s,'teacher-name','GradeCrew App',500,412,340,55,33);text(s,'teacher-role','Für Lehrkräfte\nTests erstellen und verwalten',500,479,340,120,28,false,C.text);
await image(s,path.join(b,'assets/app-icons/gradecrew-secure-app-icon.png'),{left:960,top:200,width:175,height:175},'Originales Secure-App-Icon mit Schloss');text(s,'secure-name','GradeCrew Secure',890,412,360,55,33);text(s,'secure-role','Nur für Schülerinnen\nund Schüler\nTests bearbeiten',890,479,360,135,28,false,C.text);
await image(s,path.join(root,'revision-v4/art/geraetefamilie.png'),{left:48,top:594,width:120,height:80},'Kleines Gerätebild');
s.speakerNotes.text='Website direkt unter gradecrew.de öffnen. GradeCrew App unterstützt Lehrkräfte beim Erstellen und Verwalten, GradeCrew Secure ist die Schüler-App zur Durchführung. App-Testzugang mit Martin absprechen. Keine öffentliche Storeeinladung zugesagt. Originalicons aus den lokalen iOS Asset-Catalog-Ausgaben, Herkunft und Prüfsummen in assets/app-icons/source-manifest.md. Homepageaufnahme direkt von gradecrew.de, 26.10.2026. Secure für iPhone und iPad ab Systemversion17, keine vollständige Schummelsicherheit zusagen.';
for(const c of config)await tutorial(p.slides.items[c.number-1],c);
await(await PresentationFile.exportPptx(p)).save(path.join(b,'build/artifact-candidate.pptx'));
// Static phase stills show exactly one manual-click state instead of all animation objects at once.
for(const c of config){for(let i=0;i<c.phases.length;i++){const pp=Presentation.create({slideSize:{width:1280,height:720}});const ss=pp.slides.add();await tutorial(ss,c,i);const blob=await pp.export({slide:ss,format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`slide-${String(c.number).padStart(2,'0')}-step-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));}console.log('phase-preview',c.number);}
for(const n of [1,2]){const blob=await p.export({slide:p.slides.items[n-1],format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`slide-${String(n).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));}
