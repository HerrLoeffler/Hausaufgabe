# Interaktive Aufgaben mit Remy erstellen

Stand26.10.2026 · GC-EXTENDED-QUESTION-TYPES-01 · PR310. Reguläres Staging mit echter KI; kein Production-Release dieser Erweiterung.

## Aktuell: normale Staging-Seite mit echter KI

Seit26.10.2026 ist diese Erweiterung regulär auf **https://gradecrew-staging-2026.web.app/** verfügbar. Mit dem bestehenden Stagingkonto anmelden → Neuer Test → Test mit Remy erstellen. Die normalen Endpunkte ohne remy26-/visual255-Präfix sind aktiv. PR310 wurde als22fa3ec8 integriert; veröffentlichter Quellstand1cca66fe,205Dateien verifiziert. Zwölf KI- und sechs Prüfungsfunktionen gezielt aktualisiert;62andere Cloudfunktionen erhalten. Ein anschließend ergänzter Klassenraum-Hostingstand22703241 (212Dateien) erhält die Remy-Basis und alle18Dienste; kein Rückrollen dieser parallelen Arbeit.

Wichtig zur Namenszuordnung:hausaufgabe-staging.web.app ist inzwischen dieselbe Live-Installation wie gradecrew.de. Deshalb bleibt sie bei diesem ausdrücklich auf Tests begrenzten Auftrag unverändert. Die unabhängige reguläre Testumgebung ist gradecrew-staging-2026.

Echter neuer KI-Auftrag über die normale Staging-Oberfläche:6Aufgaben/12Punkte, EntwurfYN6HWE5T. Alle sechs Unterformate vorhanden und serverseitig gespeichert. Eine fehlende Koordinatenvorgabe wurde bei der Lehrkraftprüfung ergänzt; KI-Erstellung ersetzt weiterhin keine fachliche Prüfung. Normale Serverauswertung separat mit eigenem bestehenden TestBZFKMUEB bestätigt (12/0/6/0/12/0). Vorherige Vorschau-/Versuchshistorie bleibt unten als historischer Nachweis erhalten. Kein erneuter Generatorstart zum Wiederaufnehmen eines vorhandenen Auftrags. [Aktueller Deploynachweis](../evidence/remy-canonical-staging-20261026/deployment.json).

## Als Lehrkraft

1. Neuer Test → Test mit Remy erstellen. Fach, Klasse, Thema, Anzahl und Punkte festlegen.
2. Unter „Aufgabentypen und Wünsche“ die „Visuelle Interaktion“ erlauben. Die fünf Bereiche eingrenzen: Zeitstrahl, Koordinatensystem, Im Bild markieren & beschriften, Winkel messen, Bildfolge ordnen. Andere erlaubte Aufgabentypen können daneben weiter verwendet werden. Remy wählt passend zum Lernziel, keine automatische Pflichtquote.
3. Konkrete Wünsche nennen, z.B. „Eine Zeitachse mit vier historischen Ereignissen ohne verratene Jahreszahlen“ oder „Zwei Punkte im Koordinatensystem setzen, keine Verbindung“.
4. Den gespeicherten Entwurf prüfen. Arbeitsauftrag im normalen Fragefeld ändern. „Aufgabe anpassen“ enthält die zum Format passenden Daten und Lösungen; „Änderungen übernehmen“ validiert sie gemeinsam. Ungültige Zwischenstände bleiben korrigierbar und überschreiben nicht die gültige Fassung. Punkte wie bei anderen Aufgaben ändern.
5. In der Schüleransicht durchspielen. Erst danach veröffentlichen. Emmi und neue Varianten erhalten das bestehende interaktive Format; ein ausdrücklicher Typwechsel ist eine eigene bewusste Entscheidung.

## Wiederverwendete Grundlagen

Keine neue parallele KI-Erstellung: normales app.js → startAiTestJob → vorhandene Batch-Erstellung/Validierung/Reparatur/Qualitätsprüfung → gespeicherter Test. Das Aufgabenlabor aus PR265/296 liefert den bestehenden geschlossenen visual-Vertrag, Renderer und sichere Bewertung. Neue Ergänzungen sind der mehrteilige Ereignis-Zeitstrahl und die illustrierten Bildfolgen.

Die gespeicherten Homepage-Baupläne stammen aus docs/learning/homepage-task-blueprints.v1.json auf main. Die identische Datenreferenz liegt deploymentfähig in functions/data/interactive-task-blueprints.v1.json. functions/lib/interactive-authoring.js wählt daraus nur die angefragten Ziele und Interaktionen aus und gibt sie dem vorhandenen Generator als begrenzte Referenzdaten. functions/lib/visual-prompts.js erklärt die tatsächlich unterstützten Datenformen mit gültigen Beispielen. Kein fertiger Homepage-Test wird als neue KI-Erstellung ausgegeben.

Die Homepage-Interaktion „Winkel einstellen“ wird im normalen Aufgabenlabor als „Winkel messen“ mit ausgerichtetem, verschiebbarem Winkelmesser und privater Lösung umgesetzt. Die Zeichnung bleibt öffentlich, die digitale Lösungszahl wird vor Abgabe nicht eingeblendet. Toleranz3Grad. Beim Bearbeiten ändert sich Zeichnungswinkel mit Lösungswinkel gemeinsam.

## Format, Speicherung und Bewertung

Alle fünf Bereiche verwenden den vorhandenen äußeren Typ visual und einen begrenzten visualTask-Datenstring. Daten sind keine ausführbaren HTML-/SVG-/JavaScript-Anweisungen. Die gewählten Unterformate stehen im Auftrag als allowedVisualFormats und in der creationContext.interactiveFormats des gespeicherten Tests. Batches/Reparatur erhalten die Auswahl, einzelne Überarbeitungen und vollständige neue Varianten bewahren das Unterformat je Position. Private Lösungen werden beim sicheren Teststart entfernt; der Server bewertet die abgegebenen Antworten gegen den eingefrorenen privaten Schlüssel.

- Zeitstrahl:2–6 Ereignisse und numerische Zeitpunkte. Echte maßstäbliche Abstände statt gleich weit verteilter Jahreszahlen. Ereigniskarten ohne verratene Jahreszahlen. Zuordnungen lassen sich entfernen und ändern, Teilpunkte pro richtiger Zuordnung. Doppelte/fremde Karten werden abgelehnt.
- Koordinatensystem:1–4 Punkte oder zwei unterschiedliche Endpunkte einer Strecke; Raster und Lösung passen zusammen. Zwei einzelne Punkte brauchen keinen künstlichen „Verbinden“-Knopf. Setzen mit Maus/Touch, Tastatur oder leeren Zahlenfeldern; Farben unterscheiden die Punkte.
- Bild markieren/beschriften:vorhandene definierte Szenen plant,sentence,receipt. Pflanzenbild wiederverwendet die freigegebene botanische Illustration. Vier feste Bereiche für Blüte,Sprossachse,Blätter,Wurzel. Ausgewählte Markierungen/Begriffe lassen sich entfernen und neu zuordnen.
- Winkel messen:lesbarer Winkelmesser und geometrisch passender Winkel, eigener Messwert, private Toleranz. Lehrkräfte können den Winkel strukturiert ändern.
- Bildfolge:genau vier illustrierte Stadien aus Schmetterling,Wasserkreislauf oder Pflanzenwachstum. Anfangsstadium im Auftrag eindeutig nennen. Karten werden passend zum gewählten Motiv gezeichnet, die Ausgangsfolge gemischt. Pfeile, Tauschen per Antippen, Ziehen; Teilpunkte je richtiger Position. Unberührt gilt nicht automatisch als beantwortet.

Die Grenzen sind absichtlich geschlossen:keine beliebige KI-Grafik mit erfundenen anklickbaren Zonen; keine beliebige Tierart oder frei erfundene Bildfolge. Weitere Motive brauchen jeweils geprüfte Darstellung, Regionen/Illustrationsnamen, private Bewertung und öffentliche Lösungsbereinigung. Fachliche Prüfung bleibt bei Lehrkräften; erfolgreiche Vertragsprüfung allein beweist nicht die Qualität jeder zukünftigen KI-Aufgabe.

## Nachgewiesener Probelauf

Ursprünglicher Codebaum3a170cdb entspricht exakt PR-Commit00dcd941; der Nachtrag cfe468f8 speichert getippte Koordinaten bereits beim input-Ereignis. Getrenntes Testprojekt gradecrew-staging-2026, eigener Prefix remy26; bestehendes visual255-Labor und gradecrew.de unverändert. Vorschau:https://gradecrew-staging-2026--remy26-mhohnhf1.web.app/workspace.html (bis02.11.2026). Die normalen Produktquellen benutzen außerhalb dieses ausdrücklichen Preview-Builds weiterhin ihre normalen Endpunkte.

Ein echter Auftrag über die normale Remy-Oberfläche erzeugte6Aufgaben/12Punkte:timeline,coordinate,hotspot,labeling,angle,sequence. Job4107be8859d80691d522c2010d262b42c6333279, eigener synthetischer TestBZFKMUEB. Kein simuliertes Ergebnis. Lehreränderung68°→60° über strukturierten Editor und Server-Speichern geprüft. Danach im Testprojekt veröffentlicht. Reversible Zuordnungen und Bildmarkierungen im Browser bedient. Nach der Koordinatenkorrektur bleiben alle6Antworten beim Neuladen erhalten; vollständige sichere Browserabgabe bestätigt12/12Punkte.

Serverprüfung:korrekt12/12,leer0/12,gemischt6/12,falsch0/12,Toleranzgrenze12/12,doppelte Karten0/12. Wiederaufnahme liefert unveränderte öffentliche Aufgaben; erneute Abgabe verändert das Ergebnis nicht. Öffentliche Aufgaben sind lösungsfrei. Nachweise unter docs/evidence/remy-interactive-20261026/. Private Versuchstoken bleiben ausschließlich im ignorierten .review-local/. Ein neues kostenpflichtiges KI-Starten ist für die Wiederaufnahme dieses Nachweises nicht nötig.

Automatische Prüfung:464Root/UI/Integrationstests,332Functions-Tests,101Assessment-Tests,Functions ESLint sowie drei erfolgreiche GitHub-Prüfungen auf00dcd941. Zwei unabhängige Reviews fanden fünf reproduzierte Fehler, deren Korrekturen durch zunächst fehlschlagende und anschließend erfolgreiche Regressionstests gesichert sind. Noch keine Aussage über Production oder umfassende pädagogische Freigabe für alle Klassen/Fächer.
