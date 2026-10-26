from pathlib import Path
import shutil,json
r=Path('outputs/gradecrew-kollegium-20261028');a=r/'revision-v6';b=r/'revision-v7'
shutil.copytree(a/'safe',b/'safe',dirs_exist_ok=True);shutil.copytree(a/'assets',b/'assets',dirs_exist_ok=True)
for f in ['prepare-focus-crops.py','add-timing.py','native-appear-timing.xml','native-fade-timing.xml','native-zoom-timing.xml']:shutil.copy2(a/'build'/f,b/'build'/f)
meta=json.loads((a/'build/safe-captures.json').read_text())
for row in meta:row['safeFile']=row['safeFile'].replace('revision-v6','revision-v7')
(b/'build/safe-captures.json').write_text(json.dumps(meta,indent=2))
c=json.loads((a/'build/tutorial-config.json').read_text())
c[0]['phases'].insert(2,{'label':'Testsprache festlegen','file':'08-live-test-festlegen','focus':[42,32,517,142],'crop':[42,32,520,144]})
c[0]['phases'][3].update(label='Fach, Klasse und Schulrahmen wählen',focus=[40,184,530,160],crop=[35,182,540,164])
c[0]['phases'].append({'label':'Gesamtpunkte festlegen','file':'08-live-test-festlegen','focus':[40,513,530,94],'crop':[40,512,530,96]})
extras={
3:[
'Hier öffnest du die geführte Vorbereitung des Testentwurfs.',
'Sprich Fach, Klasse und Thema ein und übernimm die Angaben mit dem Pfeil.',
'Die Testsprache bestimmt die Sprache der Aufgaben und Lösungen.',
'Fach, Klasse, Schulart und Bundesland richten den Entwurf auf deine Lerngruppe aus.',
'Das Thema grenzt ein, welches Wissen und Können der Test abfragt.',
'Die Anzahl legt den Umfang fest und die Schwierigkeit das Anspruchsniveau.',
'Lege die Punktsumme fest, mindestens 0,5 Punkte je Aufgabe.'
],
4:[
'Bestätige, dass du das Material speichern und an den KI-Dienst übermitteln darfst.',
'Lade bis zu zehn Dateien als Grundlage für die Aufgaben hoch.',
'Die Anzahl bestimmt, wie viele Aufgaben ein KI-Bild erhalten sollen.',
'Mit „Bild hinzufügen“ ergänzt du ein eigenes Bild an dieser Aufgabe.'
],
5:[
'Wähle, wie viele Aufgaben einen Hörtext erhalten sollen.',
'Wähle, bei wie vielen Aufgaben die Antwortoptionen vorgelesen werden sollen.',
'Diktiere hier die gewünschten Inhalte, Aufgabenformen und Ausschlüsse.',
'Der Klick startet die Erstellung mit deinen gewählten Vorgaben.'
],
6:[
'Beschreibe im Emmi-Feld, was am gesamten Test geändert werden soll.',
'Der Typ bestimmt die Antwortform und die Punkte die Gewichtung der Aufgabe.',
'Die Smileys bewerten die Aufgabe und der Papierkorb entfernt sie.',
'„Überarbeiten“ ändert diese Aufgabe, „Variante hinzufügen“ ergänzt eine weitere.',
'Speichere zuerst und prüfe dann den Test im neuen Tab aus Schülersicht.'
],
7:[
'Beim Selbststart beginnt jeder selbst, beim Lehrkraftstart wartet die Klasse.',
'Aktiviere bei Bedarf eine Zeitbegrenzung und teile danach Code, Link oder QR.'
],
8:[
'Ein Testcode und ein Name oder vereinbartes Kürzel reichen zum Beitritt.',
'Bearbeite die Aufgabe hier durch Zuordnen der Wörter zu den Kategorien.',
'Wechsle mit dem Pfeil weiter und warte nach der letzten Abgabe auf die Bestätigung.'
],
9:[
'Lege fest, ob Lernende nach der Abgabe Punkte, Prozent oder eine Note sehen.',
'Gib Lösungen separat frei, bei Prüfungen erst nach Testende und Nachfrist.'
],
10:[
'Der schwebende Knopf startet die Rückmeldung zur aktuellen Seite.',
'Ziehe ein Rechteck über genau den Bereich, zu dem du etwas melden möchtest.',
'Beschreibe kurz, was nicht passt oder was du dir anders wünschst.',
'Sende die Markierung und deinen Kommentar als Rückmeldung ab.'
]}
for slide in c:
 assert len(extras[slide['number']])==len(slide['phases'])
 for ph,ex in zip(slide['phases'],extras[slide['number']]):ph['extra']=ex
c[0]['note']+=' Gesamtpunkte ist die gewünschte Punktsumme des Tests. Aktuelle UI zeigt mindestens0,5Punkte jeAufgabe. Begleitender Quellstand feature/gradecrew-app-integration: app.js aiPointsValidierung/aiPoints, functions/index.js targetPoints, functions/lib/repair-test.js balanceTestPoints. Gesamtpunkte in0,5erSchritten und mindestensAufgabenanzahl/2. Kein Versprechen einer Gleichverteilung oder didaktisch perfekten Gewichtung. Punkte im Entwurf prüfen.'
c[3]['note']+=' Einzelpunkte im Editor gewichten die jeweilige Aufgabe. Der Eingabehandler aktualisiert q.points und die Gesamtübersicht. Nach Änderungen Gesamtgewichtung prüfen und speichern. Für eine präzise Änderung den Punktwert direkt bearbeiten; ein Typwechsel betrifft das Antwortformat und kann Inhalte anpassen.'
(b/'build/tutorial-config.json').write_text(json.dumps(c,indent=2,ensure_ascii=False))
(b/'erklaersaetze-v7.md').write_text('# V7 — kurze Erklärungen je Phase\n\n'+''.join('## Folie '+str(slide['number'])+' · '+slide['title']+'\n\n'+''.join(str(i)+'. **'+ph['label']+'**: '+ph['extra']+'\n'for i,ph in enumerate(slide['phases'],1))+'\n'for slide in c))
s=(a/'build/build-v6.mjs').read_text().replace("'revision-v6'","'revision-v7'").replace('revision-v5/files/GradeCrew_Kollegium_20261028_v5_Tutorial.pptx','revision-v6/files/GradeCrew_Kollegium_20261028_v6_Tutorial.pptx').replace("if(p.slides.items.length!==10)throw new Error('Expected10slides');","if(p.slides.items.length!==12)throw new Error('Expected12slides');")
start=s.index('async function appendEnd(p)');end=s.index('await(await PresentationFile.exportPptx(p))',start)
s=s[:start]+s[end:]
(b/'build/build-v7.mjs').write_text(s)
s=(a/'build/graft-cover.py').read_text().replace('revision-v5/files/GradeCrew_Kollegium_20261028_v5_Tutorial.pptx','revision-v6/files/GradeCrew_Kollegium_20261028_v6_Tutorial.pptx').replace("visit('ppt/slides/slide1.xml')","for number in [1,2,11,12]:visit(f'ppt/slides/slide{number}.xml')")
(b/'build/graft-cover.py').write_text(s)
s=(a/'build/finalize-v6.mjs').read_text().replace('revision-v6','revision-v7').replace('v6_Tutorial','v7_Tutorial').replace('validation-v6','validation-v7');(b/'build/finalize-v7.mjs').write_text(s)
node=Path('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')
if not(b/'build/node_modules').exists():(b/'build/node_modules').symlink_to(node)
