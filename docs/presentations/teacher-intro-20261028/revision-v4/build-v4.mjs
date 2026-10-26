import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const workspace='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4';
const root=path.join(workspace,'outputs/gradecrew-kollegium-20261028');
const base=path.join(root,'revision-v4');
const source='/Users/martin/Downloads/GradeCrew_Kollegium_20261028_v3.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(source));
if(p.slides.items.length!==10)throw new Error('Unexpected source slide count');
const C={bg:'#20192C',text:'#EFE4FA',white:'#FFFFFF',muted:'#B7A5C8',accent:'#F3A754'};
function text(s,t,x,y,w,h,size=31,color=C.text,bold=false){const z=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=t;z.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0};if(t==='gradecrew.de')z.text.get(t).link={uri:'https://gradecrew.de/',isExternal:true};return z;}
async function image(s,file,x=48,y=191,w=665,h=443){const b=await fs.readFile(file);s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:file.endsWith('.svg')?'image/svg+xml':'image/png',alt:path.basename(file),fit:'contain',position:{left:x,top:y,width:w,height:h}});}
async function page(n,title){const s=p.slides.items[n-1];s.shapes.deleteAll();for(const im of [...s.images.items])im.delete();s.background.fill=C.bg;await image(s,path.join(root,'assets/brand-primary-v1.svg'),48,25,100,100);text(s,title,173,52,1040,78,46,C.white,true);text(s,`${String(n).padStart(2,'0')}  /  10`,1110,660,115,25,18,C.muted);return s;}
function steps(s,items){for(let i=0;i<items.length;i++){const [title,detail]=items[i];const y=235+i*127;const multi=title.includes('\n');text(s,title,770,y,450,multi?85:52,33,C.white,true);if(detail)text(s,detail,770,y+(multi?85:48),450,73,28,C.text);}}
const sourceBase='https://github.com/HerrLoeffler/Hausaufgabe/blob/1951f1979378b0500329a3c5dac5e6bad6fc7f3e/';
function notes(s,t,src){s.speakerNotes.text=t+'\n\nQuelle: '+sourceBase+src+'\nStand26.10.2026. Aktuelle öffentliche Homepage inzwischen Quellef048ed1a, Hosting-only. Illustrationen: neu erzeugte didaktische Darstellungen, keine Originalbildschirme. Material-/Medienrechte und Datenschutz im eigenen Einsatz beachten.';}
async function render(n){const b=await p.export({slide:p.slides.items[n-1],format:'png',scale:1});await fs.writeFile(path.join(base,'preview',`slide-${String(n).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()));console.log('rendered',n);}
let s=await page(2,'Website und Apps');
await image(s,path.join(base,'art/geraetefamilie.png'));
steps(s,[['Website','gradecrew.de'],['GradeCrew App','Für Lehrkräfte:\nTests erstellen und verwalten'],['GradeCrew Secure','Für Lernende:\nTests bearbeiten']]);
notes(s,'50Sekunden. Die Website ist der direkte Einstieg, inklusive interaktiver Demoaufgaben und Anmelden/Registrieren. Die Lehrkräfte-App begleitet die Testvorbereitung und Verwaltung. Secure ist die Schüler-App für die Durchführung. Appzugänge mit Martin absprechen, kein öffentlicher Installationslink zugesagt. Secure unterstützt iPhone/iPad ab Systemversion17. Keine pauschale Schummelsicherheit zusagen. Geräteillustration zeigt keine konkrete UI.','workstreams/teacher-direct-entry-20261022.md');
s=await page(3,'Einen Test erstellen');
await image(s,path.join(base,'art/wasserkreislauf-material.png'));
steps(s,[['„Neuer Test“ öffnen',''],['Fach, Klasse, Thema wählen','Wasserkreislauf · Klasse 5'],['Wünsche und Umfang\nfestlegen','Danach mit Remy erstellen']]);
notes(s,'55Sekunden. Als roter Faden dient ein kleiner Test zum Wasserkreislauf in Klasse5. NeuerTest öffnen, Fach/Klasse/Thema und Rahmen wählen. Eigene Wünsche beziehen sich auf diesen Test. Umfang und Schwierigkeit festlegen, dann den Entwurf erzeugen und später unter MeineTests öffnen. Auch manuelle Erstellung ist möglich. Das wiederkehrende Buchmotiv steht bewusst für dasselbe Unterrichtsthema.','index.html#L320');
await render(1);await render(2);await render(3);
if(process.argv.includes('--preview')){console.log('EARLY_PREVIEW_READY');process.exit(0);}
s=await page(4,'Material und Bilder');
await image(s,path.join(base,'art/wasserkreislauf-material.png'));
steps(s,[['Material hinzufügen','Bis zu 10 Dateien'],['Eigene Bilder zuordnen',''],['KI-Bilder optional auswählen','']]);
notes(s,'50Sekunden. Dasselbe Thema kann eigenes Unterrichtsmaterial als Grundlage erhalten. Bis10Materialdateien hinzufügen und wählen, ob nur deren Inhalte oder auch weitere Anregungen einfließen. ZehnDateien ist keinLimit von zehn generiertenBildaufgaben. EigeneBilder lassen sich Aufgaben zuordnen, KI-Bilder separat auswählen. Keine feste generierte Medienquote nennen. NurMaterial mitRechten und ohnePersonendaten nutzen.','index.html#L353');
s=await page(5,'Höraufgaben');
await image(s,path.join(base,'art/hoeraufgabe.png'));
steps(s,[['Audio auswählen','Hörtext, Antwortoptionen\noder beides'],['Anzahl festlegen',''],['Audio anhören und prüfen','Bei Bedarf „Audio bearbeiten“']]);
notes(s,'60Sekunden. VorErstellung Hörtexte, vorgeleseneAntwortoptionen oderbeides auswählen und Anzahl festlegen. Beispielarbeitsauftrag: Hörezu,wieentstehtRegen? DerprivateHörtext ist dieVorlagefürdieAufnahme und wirdLernendennichtalsTextangezeigt. DersichtbareArbeitsauftrag mussverständlichsein,darfdieerwarteteAntwortabernichtbereitsnennen. DienötigenInformationenentnehmendieLernendenderAufnahme. Audioanhören,fallsnötigAudiobearbeiten. VorgeleseneAntworten sindauswählbareAntwortoptionen,keineSchülerSprachaufnahme.','app.js#L5030');
s=await page(6,'Aufgaben prüfen');
await image(s,path.join(base,'art/wasserkreislauf-material.png'));
steps(s,[['Inhalt und Lösungen prüfen','Auch Punkte, Bilder und Audio'],['Änderungen speichern',''],['„Schüleransicht“ öffnen','Aufgabe selbst durchgehen']]);
notes(s,'50Sekunden. BeimselbenWasserkreislauftestAufgaben,LösungenundPunktefachlichprüfen. BilderundAudiogehörendazu. VorSchüleransichtspeichern. DieSchüleransichtöffneteinenneuenTab,beiBedarfPopupszulassen. DieVorschauersetztkeineechteSchülerabgabe. WiederkehrendesMaterialmotivzeigtbewusst,dassdieselbeUnterrichtsgrundlagejetztfachlichgeprüftwird.','app.js#L3714');
s=await page(7,'Einstellungen und Teilen');
await image(s,path.join(base,'art/geraetefamilie.png'));
steps(s,[['Start und Zeit festlegen','Selbststart oder gemeinsam'],['Ergebnisanzeige wählen','Lösungen separat freigeben'],['„Veröffentlichen“','Code, Link oder QR teilen']]);
notes(s,'60Sekunden. StartmodusundoptionalesZeitlimitfestlegen.BeigemeinsamemStartwartetdieKlasseimWarteraum,bisdieLehrkraftstartet.BeiZeitablauferfolgtautomatischeAbgabe. ErgebnisanzeigekannBestätigung,Punkte,ProzentoderNotesein. LehrkraftlegtLösungsfreigabeindenEinstellungengetrenntfest,danachveröffentlichenundCode/Link/QRteilen. GerätefamiliekehrtfürdengezieltenÜbergangvonLehrkraftzuSchülerzugangwieder. KeineneuenDreiSchrittDialogalsverfügbarbehaupten.','app.js#L6349');
s=await page(8,'Den Test durchführen');
await image(s,path.join(base,'art/lernende-am-tablet.png'));
steps(s,[['Code und Namen eingeben','Oder vereinbartes Kürzel'],['Test bearbeiten','Selbst starten oder Start abwarten'],['Antworten abgeben','Speicherbestätigung abwarten']]);
notes(s,'55Sekunden. TeilnahmeohneSchülerkonto.Code/Link/QRführtindenZugang.NamenodervereinbartesKürzeleingeben.JeStartmodusselbststartenoderaufLehrkraftwarten.Antwortenbearbeiten,Audioaktivabspielen,anschließendabgebenundSpeicherbestätigungabwarten. GeräteundNetzvorOrtprüfen. BeimanualerNachprüfungkannendgültigeBewertungspäterfolgen. DieSchülerfiguristIllustrationundzeigtkeineechtePersonoderDaten.','secure-student.js#L620');
s=await page(9,'Ergebnisse und Lösungen');
await image(s,path.join(base,'art/testergebnisse-pruefen.png'));
steps(s,[['Bewertung ansehen','Bei Bedarf manuell nachprüfen'],['Lösungen freigeben','Prüfung: nach Ende und Nachfrist\nÜbung: nach eigener Abgabe']]);
notes(s,'60Sekunden. AuswertungautomatischoderbeiBedarfmanuellnachprüfen.LehrkraftbestimmtdiePunkte/Prozent/Notenanzeige.LösungenhabeneigeneFreigabe:PrüfungnachTestendeundNachfrist,ÜbungnacheigenerAbgabe,nurwenndieDurchführungdafürfreigegebenist.DieSchülerklickwörterLösungsfreigabeprüfenundLösungenanzeigenentscheidennichtüberLehrerfreigabe. IllustrationzeigtsymbolischesPrüfen,keineechtenErgebnisse.','secure-solution-release.js');
s=await page(10,'Feedback und Hilfe');
await image(s,path.join(base,'art/feedback-hinweis.png'));
steps(s,[['„Feedback“ unten links','Stelle markieren'],['Hinweis beschreiben','„Feedback senden“'],['gradecrew.de','Eigene Aufgabe ausprobieren']]);
// Make the visible homepage label clickable.
s.shapes.items.find(x=>String(x.text)==='gradecrew.de')?.text.get('gradecrew.de');
notes(s,'55Sekunden.Feedbackuntenlinkswählen,betroffeneStellemarkieren,unterWasistdiraufgefallenbeschreibenundFeedbacksenden.KeineSchülerdateneintragen.HeutewerdenMarkierung,KommentarundSeitenkontextübermittelt,keinPixelScreenshot.DieIllustrationzeigtMarkierungalsPrinzip.AlternativeFeedbackgebenimFooter,AufgabenSmileysbewertennurjeweiligeAufgabe.ZumAbschlussWebsiteöffnenundeigenenkleinenTestvorbereiten.AppTestzugangmitMartinabsprechen.','review-capture.mjs');
const finalNotes = {
2: ['Etwa 50 Sekunden. Der direkte Einstieg ist gradecrew.de. Dort können Kolleginnen und Kollegen Demoaufgaben ausprobieren und sich anmelden oder registrieren. Die GradeCrew App unterstützt Lehrkräfte beim Erstellen und Verwalten ihrer Tests. Lernende bearbeiten Tests im Browser oder mit GradeCrew Secure. App-Testzugang mit Martin absprechen. Interne TestFlight-Auslieferung ist belegt, ein öffentlicher Installationslink nicht. Secure unterstützt iPhone und iPad ab iOS beziehungsweise iPadOS 17. Keine vollständige Schummelsicherheit versprechen.', 'workstreams/teacher-direct-entry-20261022.md'],
3: ['Etwa 55 Sekunden. Wir bleiben beim Wasserkreislauf in Klasse 5. Neuer Test öffnen und Fach, Klasse und Thema wählen. Eigene Wünsche, Aufgabenanzahl und Schwierigkeit bestimmen den Entwurf. Mit Remy erstellen und den fertigen Entwurf unter Meine Tests öffnen. Eine manuelle Erstellung ist ebenfalls möglich. Das Buchmotiv steht für unser durchgehendes Unterrichtsthema.', 'index.html#L320'],
4: ['Etwa 50 Sekunden. Für denselben Test kann eigenes Unterrichtsmaterial als Anregung oder als alleinige Inhaltsgrundlage dienen. Bis zu zehn Dateien hinzufügen. Diese Zahl bezeichnet Materialdateien und keine Zahl generierter Bildaufgaben. Eigene Bilder einer Aufgabe zuordnen oder KI-Bilder optional auswählen. Rechte und Datenschutz bestätigen, keine personenbezogenen Schülerdaten hochladen. Keine feste Medienquote nennen, da eine neue gemeinsame Budgetregel erst beauftragt ist.', 'index.html#L353'],
5: ['Etwa 60 Sekunden. Vor der Erstellung Hörtexte, vorgelesene Antwortoptionen oder beides auswählen und die Anzahl festlegen. Das Audio anschließend anhören und bei Bedarf Audio bearbeiten wählen. Der private Hörtext ist die Vorlage für die Aufnahme und wird Lernenden nicht als Text angezeigt. Der sichtbare Arbeitsauftrag muss verständlich sein, darf die erwartete Antwort aber nicht bereits nennen. Die nötigen Informationen entnehmen die Lernenden der Aufnahme. Vorgelesene Antworten sind auswählbare Antwortoptionen, keine Aufnahme gesprochener Schülerantworten.', 'app.js#L5030'],
6: ['Etwa 50 Sekunden. Im Entwurf Aufgaben, Lösungen und Punkte fachlich prüfen. Bilder und Audio gehören ebenfalls zur Prüfung. Änderungen speichern und erst danach Schüleransicht öffnen. Sie erscheint in einem neuen Tab. Bei einer Popupblockade Popups für GradeCrew erlauben. Die Vorschau ersetzt keine wirkliche Schülerabgabe. Das wiederkehrende Buchmotiv verweist bewusst auf denselben Wasserkreislauftest.', 'app.js#L3714'],
7: ['Etwa 60 Sekunden. Selbststart oder gemeinsamen Lehrkraftstart und ein optionales Zeitlimit festlegen. Beim gemeinsamen Start warten Lernende zunächst im Warteraum. Bei Zeitablauf erfolgt die automatische Abgabe. Die Ergebnisanzeige reicht von einer Bestätigung bis zu Punkten, Prozent und Note. Die Lehrkraft legt die Lösungsfreigabe getrennt davon fest. Veröffentlichen führt zu Code, Link und QR. Die Gerätefamilie zeigt nun die Übergabe des vorbereiteten Tests an die Lernenden. Ein neuer Drei-Schritt-Dialog ist erst beauftragt und wird hier nicht behauptet.', 'app.js#L6349'],
8: ['Etwa 55 Sekunden. Lernende benötigen für den öffentlichen Zugang kein Konto. Code und Name oder vereinbartes Kürzel eingeben, alternativ den geteilten Link oder QR verwenden. Je nach Startmodus selbst beginnen oder auf die Lehrkraft warten. Aufgaben bearbeiten und Antworten am Ende abgeben. Die Speicherbestätigung abwarten. Bei manueller Nachprüfung folgt das endgültige Ergebnis später. Geräte und Netz vor dem Unterricht prüfen. Die abgebildete Person ist eine Illustration und zeigt keine echten Schülerdaten.', 'secure-student.js#L620'],
9: ['Etwa 60 Sekunden. Ergebnisse ansehen und bei Bedarf manuell nachprüfen. Die Lehrkraft wählt, ob Lernende Punkte, Prozent oder eine Note sehen. Die Lösungsfreigabe ist eine eigene Einstellung. In einer Prüfung folgen Lösungen nach Testende und Nachfrist, in einer Übung nach der eigenen Abgabe, jeweils nur bei Freigabe für diese Durchführung. Lösungsfreigabe prüfen und Lösungen anzeigen sind Klickwörter in der Schüleransicht und keine Freigabeschalter für Lehrkräfte. Das Bild zeigt symbolisch die Auswertung und keine echten Leistungsdaten.', 'secure-solution-release.js'],
10: ['Etwa 55 Sekunden. Unten links Feedback öffnen, die betroffene Stelle markieren und unter Was ist dir aufgefallen? kurz beschreiben. Danach Feedback senden wählen. Keine Schülerdaten eintragen. Aktuell werden Markierung, Kommentar und Seitenkontext übertragen, kein echter Pixel-Screenshot. Alternativ Feedback geben im Footer nutzen. Die Smileys an Aufgaben bewerten nur diese konkrete Aufgabe. Zum Abschluss die Website öffnen und einen kleinen eigenen Test vorbereiten. App-Testzugang mit Martin absprechen.', 'review-capture.mjs']
};
for (const [n,[copy,src]] of Object.entries(finalNotes)) notes(p.slides.items[Number(n)-1],copy,src);
for(let n=4;n<=10;n++)await render(n);
await (await PresentationFile.exportPptx(p)).save(path.join(base,'build','artifact-candidate.pptx'));
console.log('ARTIFACT_CANDIDATE_READY');
