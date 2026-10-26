import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const workspace='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4';
const root=path.join(workspace,'outputs/gradecrew-kollegium-20261028');
const b=path.join(root,'revision-v6');
const source=path.join(root,'revision-v5/files/GradeCrew_Kollegium_20261028_v5_Tutorial.pptx');
const config=JSON.parse(await fs.readFile(path.join(b,'build/tutorial-config.json'),'utf8'));
const meta=JSON.parse(await fs.readFile(path.join(b,'build/safe-captures.json'),'utf8'));
const dimensions=Object.fromEntries(meta.map(x=>[path.basename(x.safeFile,'.png'),x.size]));
const C={bg:'#20192C',white:'#FFFFFF',text:'#EFE4FA',muted:'#B7A5C8',red:'#F02635'};
function text(s,name,copy,x,y,w,h,size=32,bold=true,color=C.white){const z=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=copy;z.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0};if(copy==='gradecrew.de')z.text.get(copy).link={uri:'https://gradecrew.de/',isExternal:true};return z;}
function rect(s,name,x,y,w,h,fill='none',line=C.red,lw=4){return s.shapes.add({name,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:lw}});}
async function image(s,file,pos,alt=''){const data=await fs.readFile(file);return s.images.add({blob:data,contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',alt,position:pos,fit:'contain'});}
function reset(s){s.shapes.deleteAll();for(const z of [...s.images.items])z.delete();s.background.fill=C.bg;}
function header(s,n,title){text(s,'title',title,48,35,1165,70,44);text(s,'page',String(n).padStart(2,'0')+'  /  12',1110,666,115,25,18,false,C.muted);}
const contextFrame={left:36,top:145,width:320,height:450},zoomFrame={left:400,top:260,width:840,height:330};
function placement(frame,sw,sh){const k=Math.min(frame.width/sw,frame.height/sh);return{x:frame.left+(frame.width-sw*k)/2,y:frame.top+(frame.height-sh*k)/2,w:sw*k,h:sh*k,k};}
async function tutorial(s,c,active=null){reset(s);header(s,c.number,c.title);const baseFile=path.join(b,'safe',c.base+'.png');await image(s,baseFile,contextFrame,'Echter Kontext der Website');
for(let i=0;i<c.phases.length;i++){if(active!==null&&active!==i)continue;const ph=c.phases[i],pre=`phase${i+1}-`;rect(s,pre+'context-back',28,140,338,510,C.bg,C.bg,0);await image(s,path.join(b,'safe',ph.file+'.png'),contextFrame,'Echter Websitekontext');const [sw,sh]=dimensions[ph.file];const p=placement(contextFrame,sw,sh);const [x,y,w,h]=ph.focus;rect(s,pre+'highlight',p.x+x*p.k,p.y+y*p.k,w*p.k,h*p.k);
rect(s,pre+'back',380,140,870,512,C.bg,C.bg,0);text(s,pre+'callout',`${i+1}  ${ph.label}`,400,157,840,88,32);const cropFile=path.join(b,'safe/crops',`slide-${c.number}-step-${i+1}.png`);const [cw,ch]=ph.crop.slice(2);let z=placement(zoomFrame,cw,ch);if(z.k>3.5){z={x:zoomFrame.left+(zoomFrame.width-cw*3.5)/2,y:zoomFrame.top+(zoomFrame.height-ch*3.5)/2,w:cw*3.5,h:ch*3.5,k:3.5};}await image(s,cropFile,{left:z.x,top:z.y,width:z.w,height:z.h},'Vergrößerter echter Ausschnitt');
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
async function appendEnd(p){
let s=p.slides.add();reset(s);header(s,11,'GradeCrew Games');
text(s,'games-status','Prototyp',48,108,500,35,24,false,C.muted);
await image(s,path.join(b,'captures/23-games-fastquiz-prototyp-20261014.jpg'),{left:48,top:175,width:815,height:490},'Echte Fast-Quiz-Aufnahme vom 14.10.2026');
text(s,'solo','Allein üben',905,230,320,50,32);text(s,'live','Live-Runde\nmit der Klasse',905,350,320,90,32);text(s,'join','Beitritt per\nQR oder Code',905,500,320,90,29,false,C.text);
s.speakerNotes.text='Kurzer Blick auf GradeCrew Games: Fast Quiz zeigt hier echte binomische Formeln im Solo-Üben. Eine separate Live-Runde mit Lehrkraftstart, QR/Code und Livepunkten ist im synthetischen Zwei-Browser-Test belegt. Übungsspiel, kein sicherer Leistungsnachweis. Screenshot: echte Soloaufnahme vom 14.10.2026, frühere isolierte Vorschau. Die damalige URL ist seit19.10.abgelaufen und wird nicht verlinkt. Kein aktueller kanonischer Games-Livestatus behauptet. Quelle: HerrLoeffler/Hausaufgabe, workstreams/fastquiz-binomial-20261012.md, aktuelles main am26.10.gelesen; Bildquelle captures/capture-manifest-v6.json und frühere assets-games-v5/provenance.json. Kein neuer Raum oder Spielauftrag gestartet.';
s=p.slides.add();reset(s);header(s,12,'Ausblick: der persönliche Lernweg');
text(s,'planned','Geplant / Prototyp',48,108,700,38,25,false,C.muted);
// Requested editable learning network, using the existing original central illustration.
const center={x:390,y:400};
const subjects=[['Mathematik',54,222,240],['Deutsch',52,368,210],['Englisch',70,514,210],['Geschichte',520,222,240],['Geografie',554,368,205],['Natur & Technik',508,514,265]];
rect(s,'Lernnetz Mitte',389,242,2,292,'#6D5A85','#6D5A85',0);
for(const [label,x,y,w] of subjects){const left=x<300;const x1=left?x+w:390,x2=left?390:x;const yy=y+20;rect(s,'Lernverbindung '+label,Math.min(x1,x2),yy,Math.abs(x2-x1),2,'#6D5A85','#6D5A85',0);text(s,'Fach '+label,label,x,y,w,46,27,true,C.text);}
await image(s,path.join(root,'../gradecrew-investment-20261019/adaptive-learning-v10-art/central-student-illustration.png'),{left:165,top:90,width:450,height:500},'Bestehende Illustration einer lernenden Person');

text(s,'classes','Klassen und eigener Zugang',812,198,410,79,32);text(s,'class-detail','Tests zuweisen\nPersönlicher Code ohne E-Mail',812,291,410,90,25,false,C.text);
text(s,'brain','Das „Lerngehirn“',812,422,410,48,32);text(s,'brain-detail','Lernstand erkennen\nNächste passende Aufgabe\nEine Aufgabe nach der anderen',812,482,420,133,25,false,C.text);
s.speakerNotes.text='Ausblick, keine aktuelle Produktzusage. Geplant sind Klassen mit Testzuweisung und ein dauerhafter persönlicher Lernzugang ohne Schüler-E-Mail. Zielidee Lernwelt/Lerngehirn: Lernstand über Fächer hinweg berücksichtigen und die nächste passende Aufgabe samt angemessener Schwierigkeit oder Hilfe vorschlagen. Lernende konzentrieren sich auf eine Aufgabe nach der anderen. Das ist kein technisches Ein-Aufgaben-Limit. Keine bestätigte Lernwirksamkeit oder zuverlässig live arbeitende adaptive Steuerung behaupten. Quellen: docs/CLASSROOM_STUDENT_MASTERPROJECT_V1.md und workstreams/classroom-student-management-v1.md, main am26.10.2026 frisch gelesen: Planung/branch_only, keine Produktimplementierung. Lerngehirn-Zielidee ausdrücklich vom Nutzer beauftragt; bestehende konzeptionelle Darstellung aus GradeCrew-Investmentfolie v10 wiederverwendet, ohne deren Investmentinhalte. Bestehende generierte Lernendenillustration aus adaptive-learning-v10-art, unverändert und proportional. Interaktive Aufgaben haben eigene Stagingnachweise in workstreams/remy-interactive-tests-20261026.md und sind keine automatische persönliche Lernwelt. Umsetzung und fachliche Abnahme bleiben geplant.';
}

await appendEnd(p);
for(const n of [11,12]){const blob=await p.export({slide:p.slides.items[n-1],format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`slide-${n}.png`),new Uint8Array(await blob.arrayBuffer()));console.log('early-preview',n);}
await(await PresentationFile.exportPptx(p)).save(path.join(b,'build/artifact-candidate.pptx'));
// Static phase stills show exactly one manual-click state instead of all animation objects at once.
for(const c of config){for(let i=0;i<c.phases.length;i++){const pp=Presentation.create({slideSize:{width:1280,height:720}});const ss=pp.slides.add();await tutorial(ss,c,i);const blob=await pp.export({slide:ss,format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`slide-${String(c.number).padStart(2,'0')}-step-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));}console.log('phase-preview',c.number);}
for(const n of [1,2]){const blob=await p.export({slide:p.slides.items[n-1],format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`slide-${String(n).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));}

for(const n of [11,12]){const blob=await p.export({slide:p.slides.items[n-1],format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`slide-${n}.png`),new Uint8Array(await blob.arrayBuffer()));}
