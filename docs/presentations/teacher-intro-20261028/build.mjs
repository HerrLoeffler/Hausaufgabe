import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const workspace='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4';
const out=path.join(workspace,'outputs/gradecrew-kollegium-20261028');
const skill='/Users/martin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.22136/skills/presentations';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const C={paper:'#FCF7EF',ink:'#222039',muted:'#655F71',purple:'#6528BA',light:'#EBDEFA',warm:'#F3A754',dark:'#20192C',white:'#FFFFFF'};
const font='Arial';
function text(s,t,x,y,w,h,size=30,color=C.ink,bold=false){const z=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=t;z.text.style={typeface:font,fontSize:size,color,bold};if(t==='gradecrew.de')z.text.get(t).link={uri:'https://gradecrew.de/',isExternal:true};return z;}
function rule(s,x,y,w,color=C.purple){s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:3},fill:color,line:{fill:'none',width:0}});}
function slide(n,title,sub='',dark=false){const s=p.slides.add();s.background.fill=dark?C.dark:C.paper;text(s,title,64,50,1152,75,48,dark?C.white:C.ink,true);if(sub)text(s,sub,66,137,1120,45,23,dark?'#DCCAEF':C.muted);text(s,`${n.toString().padStart(2,'0')}  /  10`,1110,660,115,25,18,dark?'#B7A5C8':C.muted);return s;}
function notes(s,t,source='index.html'){s.speakerNotes.text=t+'\n\nQuelle und Stand: 26.10.2026. '+`https://github.com/HerrLoeffler/Hausaufgabe/blob/1951f1979378b0500329a3c5dac5e6bad6fc7f3e/${source}`+'\nAbgleich: evidence/ist-stand-quellenbrief-20261026.md. Beispielabläufe sind synthetische Erläuterungen, keine Originalbildschirme. Keine Produktabnahme oder Aussage zur fachlichen Fehlerfreiheit.';}
function step(s,num,title,body,x,y,w=340){text(s,num,x,y,70,60,44,C.purple,true);text(s,title,x,y+76,w,85,31,C.ink,true);text(s,body,x,y+170,w,140,27,C.muted);}
async function asset(s,file,pos,type='image/png'){const b=await fs.readFile(path.join(out,'assets',file));s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:type,position:pos,fit:'contain',alt:file==='crew-cutout-v2.png'?'Originale GradeCrew Figuren der aktuellen Homepage':'Originales GradeCrew Zeichen'});}
async function render(n){const s=p.slides.items[n-1];const b=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(path.join(out,'preview',`slide-${String(n).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()));console.log('rendered',n);}
// Cover, two orientation slides and immediate review checkpoint.
let s=slide(1,'GradeCrew\nim Unterricht','',true);
text(s,'Tests vorbereiten,\ndurchführen und auswerten',66,265,500,110,31,'#EFE4FA');
text(s,'Kollegium · 28. Oktober 2026',66,430,470,40,24,'#DCCAEF');
text(s,'gradecrew.de',66,535,460,65,44,C.warm,true);
await asset(s,'crew-cutout-v2.png',{left:604,top:180,width:610,height:407});
await asset(s,'brand-primary-v1.svg',{left:1110,top:43,width:100,height:100},'image/svg+xml');
notes(s,'Etwa 35 Sekunden. Heute schauen wir uns einen vollständigen Unterrichtsablauf an. Als gemeinsames Beispiel dient der Wasserkreislauf in Klasse 5. Die Website ist der direkte Einstieg. Die Figuren stammen unverändert aus dem aktuellen Originalasset. Kein Investmentpitch.','workstreams/public-entry-return-live-receipt-20261026.json');
s=slide(2,'Website und Apps','Der passende Zugang für die jeweilige Rolle');
step(s,'01','Website','gradecrew.de\nDirekt ausprobieren\nAnmelden / Registrieren',66,225);
step(s,'02','GradeCrew App','Für Lehrkräfte\nTests erstellen und verwalten\nInterner Testzugang',461,225);
step(s,'03','GradeCrew Secure','Für Lernende\nTests im Prüfungsmodus\nInterner Testzugang',856,225,360);
rule(s,66,592,1145);text(s,'App-Testzugang mit Martin absprechen',66,616,950,38,25,C.purple,true);
notes(s,'Etwa 50 Sekunden. Die Website funktioniert als unmittelbarer Einstieg. Dort gibt es auch zehn interaktive Demoaufgaben, die man ohne eigenen Test erkunden kann. Diese Demo beweist keine KI-Generierung. Die Lehrkräfte-App und Secure sind intern über TestFlight belegt. Es liegt kein öffentlicher Installationslink für das Kollegium vor. Secure unterstützt iPhone und iPad ab iOS beziehungsweise iPadOS 17. Keine vollständige Schummelsicherheit zusagen.','workstreams/teacher-direct-entry-20261022.md');
s=slide(3,'Einen Test erstellen','Beispielablauf · Wasserkreislauf, Klasse 5');
text(s,'„Neuer Test“',66,230,550,65,38,C.purple,true);
text(s,'Fach, Klasse und Thema\nEigene Wünsche ergänzen\nUmfang und Schwierigkeit wählen',66,324,590,170,31);
rule(s,697,234,490);text(s,'Entwurf mit Remy',697,265,500,70,37,C.purple,true);text(s,'„Meine Tests“ öffnen\nAufgaben fachlich prüfen',697,365,500,130,31);
text(s,'Alternativ: Aufgaben manuell erstellen',66,586,1060,45,26,C.muted);
notes(s,'Etwa 55 Sekunden. Wir wählen das Fach, Klasse 5 und das Thema Wasserkreislauf. Unter Wünsche lassen sich besondere Schwerpunkte für diesen Test nennen. Aufgabenanzahl, Schwierigkeit und Gesamtpunkte bestimmen den Umfang. Nach dem Erstellen liegt der Entwurf unter Meine Tests. Remy liefert einen Entwurf, dessen Inhalt und Lösungen die Lehrkraft prüft. Alternativ ist die manuelle Erstellung möglich.');
for(let n=1;n<=3;n++)await render(n);
console.log('FIRST_THREE_READY');
// Remaining slides.
s=slide(4,'Material und Bilder','Beispielablauf · Vorhandenes Unterrichtsmaterial einbeziehen');
text(s,'Eigenes Material',66,237,540,65,38,C.purple,true);text(s,'Bis zu 10 Dateien hinzufügen\nInhalte als Grundlage wählen\nRechte und Datenschutz prüfen',66,330,565,170,31);
text(s,'Bilder an Aufgaben',710,237,510,65,38,C.purple,true);text(s,'Eigenes Bild zuordnen\nKI-Bilder optional auswählen\nPassung zur Aufgabe prüfen',710,330,510,170,31);
rule(s,66,581,1145);text(s,'Beispiel: ein vorhandener Text zum Wasserkreislauf',66,610,1140,43,26,C.muted);
notes(s,'Etwa 50 Sekunden. Material kann als Anregung dienen oder auf die Inhalte der hochgeladenen Dateien beschränken. Das Limit von zehn bezieht sich auf Materialdateien, nicht auf zehn generierte Bildaufgaben. Eigene Bilder lassen sich Aufgaben zuordnen. Die KI-Bildauswahl ist eine eigene Einstellung. Nur Material mit ausreichenden Rechten und ohne personenbezogene Daten verwenden. Keine feste Medienquote nennen, da eine neue gemeinsame Budgetregel erst beauftragt ist.');
s=slide(5,'Höraufgaben','Auswahl vor Erstellung: Hörtexte, Antwortoptionen oder beides');
text(s,'Sichtbarer Arbeitsauftrag',66,225,535,60,32,C.purple,true);text(s,'„Höre zu: Wie entsteht Regen?“',66,307,550,120,37,C.ink,true);
text(s,'Privater Hörtext',710,225,510,60,32,C.purple,true);text(s,'„Wasserdampf kühlt ab.\nEs entstehen kleine Tropfen …“',710,307,510,140,33);
rule(s,66,500,1145);text(s,'Hörtext anhören und bei Bedarf „Audio bearbeiten“',66,531,1145,48,29);text(s,'Anzahl wählen · Antwortoptionen optional vorlesen lassen',66,596,1145,48,29);
notes(s,'Etwa 60 Sekunden. Die öffentliche Frage gibt einen verständlichen Arbeitsauftrag. Der private Hörtext ist die Vorlage für die Aufnahme und wird Lernenden nicht als Text angezeigt. Der sichtbare Arbeitsauftrag muss verständlich sein, darf die erwartete Antwort aber nicht bereits nennen. Die nötigen Informationen entnehmen die Lernenden der Aufnahme. Vor der Durchführung beide Texte und das erzeugte Audio prüfen. Audio startet nicht automatisch. Vorgelesene Antworten meint Antwortoptionen, die Lernende anhören und auswählen können. Es handelt sich nicht um gesprochene Schülerantworten oder eine Sprachaufnahme.','app.js#L5030');
s=slide(6,'Prüfen und bearbeiten','Die Lehrkraft entscheidet, was in den Test kommt');
step(s,'01','Inhalt prüfen','Aufgabe und Lösung\nPunkteverteilung\nBilder und Audio',66,224);
step(s,'02','Bearbeiten','Text präzisieren\nLösungen korrigieren\nÄnderungen speichern',461,224);
step(s,'03','Schüleransicht','Neuer Tab\nDarstellung ansehen\nAufgabe selbst durchgehen',856,224,360);
text(s,'Klickwort: „Schüleransicht“',66,610,1060,45,28,C.purple,true);
notes(s,'Etwa 50 Sekunden. Beim Wasserkreislauf prüfen wir, ob Aufgaben und Lösungen fachlich passen und Punkte angemessen verteilt sind. Auch Bilder und Audio gehören dazu. Vor der Schüleransicht speichern. Die Ansicht öffnet einen neuen Tab, bei Bedarf Popups erlauben. Sie zeigt die Darstellung und ersetzt keine echte Schülerabgabe.','app.js#L3714');
s=slide(7,'Einstellungen und Teilen','Beispielablauf · Vor der Durchführung festlegen');
text(s,'Start & Zeit',66,230,540,60,38,C.purple,true);text(s,'Selbststart oder Lehrkraftstart\nBei gemeinsamem Start: Warteraum\nZeitlimit optional',66,322,570,180,31);
text(s,'Anzeige & Zugang',710,230,510,60,38,C.purple,true);text(s,'Bestätigung, Punkte oder Note wählen\nLösungsfreigabe separat festlegen\nCode, Link oder QR teilen',710,322,510,180,30);
rule(s,66,582,1145);text(s,'Klickwort: „Veröffentlichen“',66,611,1145,45,28,C.purple,true);
notes(s,'Etwa 60 Sekunden. Die Lehrkraft wählt den Startmodus. Beim Lehrkraftstart warten Lernende auf das gemeinsame Signal. Ein Zeitlimit ist optional, bei Ablauf erfolgt die automatische Abgabe. Auch die Ergebnisanzeige wird festgelegt: nur Bestätigung, Punkte, Punkte und Prozent oder zusätzlich eine Note. Die Lösungsfreigabe ist davon getrennt. Nach dem Veröffentlichen gibt es Code, Link und QR. Keine Behauptung über den erst beauftragten neuen Drei-Schritt-Dialog.','app.js#L6349');
s=slide(8,'Durchführung im Unterricht','Beispielablauf · Teilnahme ohne Schülerkonto');
step(s,'01','Zugang öffnen','Code, Link oder QR\nName oder vereinbartes Kürzel\nTest starten oder warten',66,224);
step(s,'02','Bearbeiten','Aufgaben beantworten\nAudio bewusst abspielen\nAntworten kontrollieren',461,224);
step(s,'03','Abgeben','Antworten abgeben\nSpeicherbestätigung\nabwarten',856,224,360);
text(s,'Bei gemeinsamem Start gibt die Lehrkraft den Test frei',66,611,1120,45,27,C.purple,true);
notes(s,'Etwa 55 Sekunden. Schüler brauchen für diesen Zugang kein Konto. Sie öffnen den Link oder scannen den QR und geben Code sowie Name oder vereinbartes Kürzel ein. Je Startmodus beginnt der Test selbst oder die Klasse wartet gemeinsam. Am Ende Antworten abgeben und die Speicherbestätigung abwarten. Eine ausstehende manuelle Nachprüfung kann das endgültige Ergebnis verzögern. Geräte und Netz vor dem Einsatz im eigenen Unterricht prüfen.','secure-student.js#L620');
s=slide(9,'Ergebnisse und Lösungen','Bewertung und Lösungsfreigabe sind getrennte Einstellungen');
text(s,'Ergebnisse',66,230,535,60,38,C.purple,true);text(s,'Auswertung ansehen\nManuell nachprüfen, falls nötig\nPunkte, Prozent oder Note',66,322,570,170,31);
text(s,'Lösungsfreigabe',710,230,510,60,38,C.purple,true);text(s,'Prüfung: nach Ende und Nachfrist\nÜbung: nach eigener Abgabe\nJeweils nur bei Freigabe',710,322,510,170,30);
rule(s,66,582,1145);text(s,'In der Schüleransicht: „Lösungsfreigabe prüfen“ / „Lösungen anzeigen“',66,611,1145,45,25,C.purple,true);
notes(s,'Etwa 60 Sekunden. Die Auswertung kann automatisch erfolgen oder eine manuelle Nachprüfung benötigen. Welche Kennzahlen Schüler sehen, bestimmt die Lehrkraft. Lösungen folgen einer eigenen Regel: in der Prüfung nach Testende und Nachfrist, in der Übung nach der eigenen Abgabe, sofern für diese Durchführung freigegeben. Keine pauschal sofort verfügbaren Lösungen versprechen. Bei gesperrter Ansicht zunächst Lösungsfreigabe prüfen wählen.','secure-solution-release.js');
s=slide(10,'Feedback und Hilfe','Ein kleiner eigener Test ist der nächste Schritt',true);
text(s,'„Feedback“ unten links',66,231,1120,65,38,C.warm,true);
text(s,'Stelle markieren\n„Was ist dir aufgefallen?“ beschreiben\n„Feedback senden“',66,326,1120,185,33,C.white);
rule(s,66,550,1145,'#71578D');text(s,'gradecrew.de',66,588,590,65,45,C.warm,true);text(s,'App-Testzugang: mit Martin absprechen',655,605,560,45,25,'#DCCAEF');
notes(s,'Etwa 55 Sekunden. Bei einem Fehler oder einer Idee unten links Feedback wählen, die betroffene Stelle markieren und kurz beschreiben, was aufgefallen ist. Anschließend Feedback senden. Keine Schülerdaten eintragen. Heute übermittelt dieser Weg Markierung, Kommentar und Seitenkontext, keinen echten Pixel-Screenshot. Alternativ gibt es Feedback geben im Footer. Die Smileys an Aufgaben bewerten nur die jeweilige Aufgabe. Für den nächsten Schritt auf gradecrew.de die Demo erkunden und einen kleinen eigenen Test vorbereiten. App-Testzugang mit Martin besprechen.','review-capture.mjs');
for(let n=4;n<=10;n++)await render(n);
await (await PresentationFile.exportPptx(p)).save(path.join(out,'build','candidate.pptx'));
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:workspace,candidatePath:path.join(out,'build','candidate.pptx'),finalPath:path.join(out,'files','GradeCrew_Kollegium_20261028_v3.pptx'),pythonExecutable:'/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:10,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.join(out,'build','validation-v3.json')});
console.log(JSON.stringify(result));
