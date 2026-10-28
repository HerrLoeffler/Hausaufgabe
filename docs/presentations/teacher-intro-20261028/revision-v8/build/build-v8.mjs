import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const workspace='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4',root=path.join(workspace,'outputs/gradecrew-kollegium-20261028'),b=path.join(root,'revision-v8');
const source=path.join(root,'revision-v7/files/GradeCrew_Kollegium_20261028_v7_Tutorial.pptx');
const C={bg:'#20192C',white:'#FFFFFF',text:'#EFE4FA',muted:'#B7A5C8',accent:'#CAB2EE'};
function tx(s,name,copy,x,y,w,h,size=32,bold=true,color=C.white){const z=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=copy;z.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0};if(copy==='gradecrew.de')z.text.get(copy).link={uri:'https://gradecrew.de/',isExternal:true};return z;}
function reset(s){s.shapes.deleteAll();for(const z of [...s.images.items])z.delete();s.background.fill=C.bg;}
function head(s,n,title,chapter){reset(s);tx(s,'title',title,48,32,1184,72,44);if(chapter)tx(s,'chapter',chapter,48,112,1180,33,21,false,C.muted);tx(s,'page',String(n).padStart(2,'0')+' / 12',1115,672,110,24,18,false,C.muted);}
async function img(s,file,x,y,w,h,alt=''){const data=await fs.readFile(file);return s.images.add({blob:data,contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',position:{left:x,top:y,width:w,height:h},fit:'contain',alt});}
const asset=n=>path.join(b,'assets',n+'.png');
function phrase(s,name,title,body,x,y,w=350){tx(s,name+'-heading',title,x,y,w,64,32);if(body)tx(s,name+'-body',body,x,y+78,w,Math.min(150,658-y-78),27,false,C.text);}
const plan=await fs.readFile(path.join(root,'plan-20261028/folienplan-neu-20261028.md'),'utf8');
function notes(s,n,extra=''){const m=plan.match(new RegExp('### '+n+' ·[\\s\\S]*?(?=\\n### |\\n## |$)'));const block=m?.[0]||'';const speaker=block.match(/\*\*Sprecherhinweis:\*\* ([\s\S]*?)(?=\n\n\*\*|$)/)?.[1]||block; s.speakerNotes.text=speaker+'\n\n'+extra;}
const fresh='Quelle: direkte gradecrew.de-Arbeitsbereichsaufnahme vom28.10.2026, physisch um den Kontokopf beschnitten; nur synthetische Beispieldaten. Bildwerte zeigen die bestehende Ansicht, nicht den noch zu erstellenden Fünf-Aufgaben-Test. Referenz: plan-20261028/quellenbrief-20261028.md.';
const p=await PresentationFile.importPptx(await FileBlob.load(source));if(p.slides.items.length!==12)throw Error('Expected12');let s;
s=p.slides.items[1];head(s,2,'Test erstellen – durchführen – bewerten');
phrase(s,'phase1-create','01  Erstellen','Idee und Angaben\nEntwurf prüfen\nMit Emmi verbessern',48,235,340);
phrase(s,'phase1-perform','02  Durchführen','Schüleransicht testen\nZugang und Start wählen\nTest bearbeiten',456,235,340);
phrase(s,'phase1-assess','03  Bewerten','Ergebnisse ansehen\nAntworten nachprüfen\nBewertung kontrollieren',864,235,350);
tx(s,'url','gradecrew.de',48,595,500,56,34);notes(s,2,'Website ist der direkte Einstieg; die Lehrkräfte-App unterstützt denselben Arbeitsbereich. Keine Appinstallation für die Browserübung erforderlich. Einmal weiterklicken zeigt den gesamten Arbeitsweg.');
s=p.slides.items[2];head(s,3,'Mit Remy einen Test vorbereiten','1 · ERSTELLEN');
await img(s,asset('remy-angaben'),48,167,555,475,'Aktuelle Angaben mit Inhaltswünschen');
phrase(s,'entry','Fach, Klasse und Thema','Eingeben oder diktieren\nTestsprache bewusst wählen',665,178,550);
phrase(s,'scope','Umfang und Anspruch','Aufgaben, Niveau und Punkte\nInhaltswünsche präzisieren',665,397,550);notes(s,3,fresh+' Die aktuelle kompakte Eckdatenzeile steht oberhalb der Angaben; das Wunschmikro direkt unter dem Thema. Punkte sind die Zielsumme, keine Zusage gleicher Gewichtung je Aufgabe.');
s=p.slides.items[3];head(s,4,'Material, Bilder und Audio','1 · ERSTELLEN · OPTIONAL ERGÄNZEN');
await img(s,asset('remy-optionen'),48,164,790,470,'Aktuelle getrennte Bereiche Material Bilder Audio');
phrase(s,'material','Material als Grundlage','Eigene Quelle verwenden\noder als Anregung wählen',886,176,340);
phrase(s,'audio','Bilder und Hörvarianten','Aufgabe, Antworten\noder beides hören lassen',886,399,340);notes(s,4,fresh+' Sichtbar heute10Dateien/15MB und getrennte 0–5-Mengenfelder. Für den ersten Versuch sind Material, Bilder und Audio freiwillig; Audio bezeichnet Ausgabe, keine Schüleraufnahme. Den echten Erstellenknopf am Ende der Vorbereitung erwähnen.');
s=p.slides.items[4];head(s,5,'Der Entwurf braucht deine Prüfung','1 · ERSTELLEN · LEHRKRAFTKONTROLLE');
await img(s,asset('aufgabe-pruefen'),48,175,1184,319,'Echte synthetische Aufgabe mit Typ und Punkten');
phrase(s,'check-content','Inhalt und Lösung','Fachlich richtig und eindeutig?',48,500,360);
phrase(s,'check-media','Medien und Punkte','Ansehen, anhören, gewichten',456,500,360);
phrase(s,'save','Geprüfte Fassung','Bewusst speichern',864,500,360);notes(s,5,fresh+' Eindeutig synthetischer bestehender SYSTEMTEST, nur geöffnet. Darstellungsausschnitt enthält keine echten Schülerleistungen. Fehler und unpassende Lösungen vor der Verwendung korrigieren.');
s=p.slides.items[5];head(s,6,'Mit Emmi gezielt überarbeiten','1 · ERSTELLEN');
await img(s,asset('emmi-gesamt'),48,166,1184,296,'Aktuelles Gesamt-Emmi-Feld');
tx(s,'single-label','Einzelaufgabe',48,502,360,55,32);tx(s,'single-detail','Überarbeiten oder\neine Variante ergänzen',48,560,380,78,27,false,C.text);
await img(s,asset('emmi-aufgabe'),465,495,760,135,'Echte aktuelle Aufgabenaktionen');notes(s,6,fresh+' Gesamt-Emmi ist oben, Einzelüberarbeiten/Variante an der Aufgabe. Nach jeder Änderung fachlich prüfen und speichern. Keine KI-Änderung in diesem Aufnahme-/Bauauftrag ausgeführt. Die erfasste Editoransicht hat noch getrennte Audioausklapper; keinen gemeinsamen Reiter aus der Dokumentation als sichtbar behaupten.');
s=p.slides.items[6];head(s,7,'Browser oder GradeCrew Secure?','2 · DURCHFÜHREN · DEN PASSENDEN WEG WÄHLEN');
tx(s,'browser-title','Browser',275,174,390,48,34);tx(s,'secure-title','GradeCrew Secure',770,174,440,48,34);
await img(s,path.join(root,'revision-v6/assets/app-icons/gradecrew-secure-app-icon.png'),1135,110,85,85,'Originales Secure-Icon mit Schloss');
const rows=[['Zugang','Homepage, Code,\nLink oder QR','App öffnen und\ndem Test beitreten'],['Voraussetzung','Keine Installation\nSofort im Browser','Vorher installieren\nund einrichten'],['Grenze','Andere Seiten, Hilfsmittel\nund Appwechsel möglich','Appwechsel je nach Gerät\nund Einrichtung begrenzt'],['Einsatz','Üben und\nschnell einsteigen','Stärker geschützte\nDurchführung']];
for(let i=0;i<rows.length;i++){let y=248+i*93;tx(s,'phase1-criterion-'+i,rows[i][0],48,y,200,74,25,true,C.muted);tx(s,'phase1-browser-'+i,rows[i][1],275,y,430,80,28,false,C.text);tx(s,'phase1-secure-'+i,rows[i][2],770,y,455,80,28,false,C.text);}
notes(s,7,'Historische Secure-Belege und Originalicon-Herkunft aus V6/V7; kein neuer Gerätetest. Der Browser ist kein geschlossener Prüfungsmodus. Secure begrenzt Appwechsel abhängig von Gerät, Modus und Einrichtung und garantiert keine absolute Betrugssicherheit. Kein ungeprüfter öffentlicher Einladungslink. Einmal weiterklicken blendet die Gegenüberstellung ein.');
s=p.slides.items[7];head(s,8,'Einen geprüften Test durchführen','2 · DURCHFÜHREN');
phrase(s,'preview','01  Selbst ausprobieren','Speichern und\nSchüleransicht öffnen',48,238,350);
phrase(s,'start','02  Zugang und Start','Code, Link oder QR\nStartmodus auswählen\nZeitlimit bei Bedarf',456,238,355);
phrase(s,'submit','03  Abgeben','Am Ende abgeben\nund Speicherbestätigung\nabwarten',864,238,355);
tx(s,'preview-limit','Die Schüleransicht allein erzeugt noch keine echte Ergebnisabgabe.',48,590,1170,65,27,false,C.muted);notes(s,8,'Native Ablaufgrafik, keine erfundene Bedienoberfläche. Schüleransicht dient der Prüfung von Darstellung und Bedienung; für Ergebnisse braucht es eine echte eigene Übungsabgabe. Code/Name oder vereinbartes Kürzel, ohne echte Schülerdaten in der heutigen Übung. Aktuellen Veröffentlichungsdialog im echten Arbeitsbereich verwenden. Kein Test wurde für diesen Bauauftrag veröffentlicht oder abgegeben.');
s=p.slides.items[8];head(s,9,'Mit Wilma Ergebnisse prüfen','3 · BEWERTEN');
phrase(s,'results','Ergebnisse öffnen','Den durchgeführten Test\nund seine Ergebnisse wählen',48,236,350);
phrase(s,'review','Antworten\nnachprüfen','Auffällige Antworten\nund Punkte kontrollieren',456,236,350);
phrase(s,'decision','Bewertung entscheiden','Manuell nachprüfen,\nwo die Aufgabe es braucht',864,236,355);
tx(s,'responsibility','Die Lehrkraft kontrolliert und verantwortet die Bewertung.',48,574,1170,80,32,true,C.accent);notes(s,9,'Bewusst native Ablaufdarstellung statt erfundener Wilma-UI oder privater Ergebnisliste. Ergebnisse als echte Testaktion am28.10.sichtbar. Begleitcode des dokumentierten Sourcef589dd97 enthält digitale Ergebnisansicht, Manuelle Bewertung und Bewertung speichern. Keine frische sichere synthetische Wilma-Ergebnisaufnahme verfügbar. Keine vollständige automatische KI-Korrektur und keine Papier-/Fotokorrektur zusagen. Ergebnisanzeige und Lösungsfreigabe sind getrennte Entscheidungen.');
s=p.slides.items[9];head(s,10,'Hilfe und Feedback','BEIM EIGENEN AUSPROBIEREN');
phrase(s,'help','Coco für Hilfe','Bei Fragen zum Arbeitsweg\nden Hilfeeinstieg öffnen',48,224,530);
await img(s,asset('feedback'),790,190,320,142,'Aktueller schwebender Feedbackknopf');
phrase(s,'report','Eine Stelle rückmelden','Feedback öffnen, Bereich markieren\nund kurz beschreiben',650,398,575);
notes(s,10,'Quelle des Feedbackknopfes: aktuelle Remyaufnahme vom28.10. Der aktuelle schwebende Einstieg ist sichtbar, Markierungsablauf ist aus dem bestehenden Nutzerworkflow belegt. Rechteck über der Problemstelle ziehen, Kommentar beschreiben, bei Bedarf senden; keine Schülerdaten. Hilfe und Aufgaben-Smiley sind unterschiedliche Wege. Keine Rückmeldung wurde durch den Agenten versandt.');
s=p.slides.items[10];head(s,11,'Ein kurzer Blick nach vorn');
await img(s,path.join(root,'revision-v6/captures/23-games-fastquiz-prototyp-20261014.jpg'),48,160,800,480,'Echte FastQuiz-Prototypaufnahme14.10.');
phrase(s,'games','GradeCrew Games','Kurz gemeinsam üben\nZum Beispiel als Live-Runde',900,205,325);
tx(s,'prototype','Prototyp · Aufnahme 14.10.',48,642,800,30,20,false,C.muted);
tx(s,'planned','Geplant',900,450,325,38,25,true,C.accent);tx(s,'outlook','Klassen\nPersönlicher Lernzugang\nNächste passende Aufgabe',900,501,335,140,25,false,C.text);notes(s,11,'Echte Solo-Prototypaufnahme vom14.10., altePreview seit19.10.abgelaufen, nicht verlinkt. Kein aktueller Games-Livezustand zugesagt. Geplant sind Klassen, ein persönlicher Lernzugang und ein Lerngehirn, das die nächste passende Aufgabe vorschlägt. Kein Wirksamkeitsbeleg oder zuverlässige aktuelle adaptive Livefunktion behauptet. Kurzer Ausblick auf derselben Folie, kein zweites Pitchkapitel.');
s=p.slides.items[11];head(s,12,'Erstelle deinen ersten Test selbst');
tx(s,'duration','12 Minuten · allein oder zu zweit · ohne echte Schülerdaten',48,125,1180,52,27,false,C.muted);
phrase(s,'phase1-create','Fünf kleine Aufgaben','Dein Fach und Thema\nMaterial und Audio freiwillig',48,258,350);
phrase(s,'phase1-edit','Eine Aufgabe verbessern','Inhalt, Lösung und Punkte prüfen\nBei Bedarf mit Emmi ändern',456,258,355);
phrase(s,'phase1-preview','Selbst ausprobieren','Speichern und\nSchüleransicht prüfen',864,258,355);
tx(s,'url','gradecrew.de',48,570,550,58,40);tx(s,'optional','Optional zu zweit: per QR durchführen\nund anschließend die Bewertung prüfen',650,563,580,88,25,false,C.text);notes(s,12,'Kernauftrag12Minuten: eigenenFünf-Aufgaben-Test erstellen, eineAufgabe fachlich prüfen/ändern, speichern undSchüleransicht. Optional echter eigener Übungsdurchlauf zu zweit und danachErgebnisprüfung. Keine echtenSchülerdaten. FallsErstellung länger dauert, nicht mehrfachstarten: Martins vorbereiteten synthetischen kleinenEntwurf zumPrüfen/Überarbeiten/Schüleransicht verwenden. Keine Zeitgarantie fürKI-Erstellung. Einmal weiterklicken zeigt den kompletten Arbeitsauftrag; danach stehenlassen.');
await(await PresentationFile.exportPptx(p)).save(path.join(b,'build/artifact-candidate.pptx'));
for(let i=0;i<12;i++){const z=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(b,'preview',`draft-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await z.arrayBuffer()));}console.log('draft exported and 12 renders');
