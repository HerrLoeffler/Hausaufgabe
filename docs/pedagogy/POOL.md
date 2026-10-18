# Pädagogischer Aufgabenpool für die Testgenerierung

Task GC-PEDAGOGY-KB-01. Der Testgenerator ergänzt seine vorhandenen Vorgaben automatisch um wenige passende geprüfte Aufgabenprofile. Das ist zusätzliche pädagogische Orientierung für neue Aufgaben. Die vorhandenen Uploads, Wünsche, exakten Mengen-/Punktevorgaben, Bild- und Audioerzeugung sowie fachliche Validierung behalten Vorrang.

## Laufzeit und Schutz der bestehenden Generierung

`functions/lib/pedagogical-pool.js` liest den serverseitigen, mit den Functions ausgelieferten Katalog `functions/data/pedagogical-pool.json`. Es gibt keinen neuen Datenbankdienst, keine zusätzliche Such-API oder Modellanfrage, keine Schlüsseländerung und keinen Browserzugriff auf das lokale Archiv.

Die Auswahl verlangt bestätigte Zuordnung von Fach, Jahrgang, Schulart und Bundesland; passende Themen und Lehrerwünsche dienen der Rangfolge. Ein Profil muss `reviewStatus=verified` und `mappingStatus=confirmed` haben. Audio-Muster kommen nur bei gewählten Höraufgaben in Betracht; formatgebundene Profile verlangen einen passenden erlaubten Aufgabentyp. Maximal sechs Profile und 6.000 Zeichen zusätzlicher Kontext pro Anfrage.

Bei keinem Treffer oder ungültigem/unverfügbarem Katalog entsteht kein zusätzlicher Promptblock. Der bestehende Erstgenerierungs-Prompt ist in diesem Fall nachweislich bytegleich. „Nur mein Material“ sowie ein Ausgangstest als verbindliche Referenz schalten den externen Poolkontext aus. Derselbe gewählte Kontext begleitet Erstgenerierung, Einzelersatz und Gesamtreparatur; die bestehende unabhängige Qualitätsprüfung bleibt erhalten.

Die Antwort, der fertige Hintergrundtest und der Hintergrundauftrag speichern lediglich Version, Auswahlstatus, Anzahl und anonyme Profil-IDs unter `pedagogicalPool`. Diese Metadaten belegen die technische Kontextübergabe, nicht dass das Modell jede Anregung tatsächlich umgesetzt oder eine bessere Aufgabe erzeugt hat.

## Geprüfter Startbestand

53 eigene abstrakte Profile: 26 Deutsch, 22 Deutsch als Zweitsprache, 5 Mathematik. Mittelschule/Bayern, Jahrgang 6 oder 9. Die Sammlung ist bewusst kein vorgetäuschter Vollbestand für Grundschule, Realschule, Gymnasium oder alle Jahrgänge.

35 Hör-Aufgabengruppen aus dem tatsächlich quellenbezogen geprüften Audioblock sind aufgenommen. Drei Gruppen mit dokumentiertem Quellen-/Bewertungsproblem bleiben ausgeschlossen. Zusätzlich acht textbezogene Deutsch-Profile (Jahrgangsstufenarbeit 6), fünf textbasierte DaZ-Profile (Abschlussstufe 9) und fünf unabhängig gegen die Musterrechnung geprüfte Mathematik-Profile (Abschlussstufe 9). Schule/Jahrgang sind aus dem jeweiligen Prüfungsrahmen bestätigt; Mathematik-Korrekturheft benennt Jahrgangsstufe 9 explizit. Die Metadaten der Ausgangsdokumente dienen nur der lokalen Prüfung und werden nicht in den Katalog kopiert.

Der Katalog enthält weder Originalaufgaben noch Lösungsschlüssel, Bilder, Audio, Transkripte, Titel, Autoren, Lizenzcodes oder Ursprungsdateinamen. Jede Quelle ist nur mit Inhalts-Hash und PDF-Seitenindex referenziert. Bilder und Audio für neue Tests werden weiterhin im bisherigen Weg neu erstellt. Keine Quellenfigur, originale Zahlenlösung oder Quelle mit bekanntem sachlichem Fehler übernehmen.

## Weitere geprüfte Profile aufnehmen

Ein Eintrag verwendet: `id`, `reviewStatus`, `mappingStatus`, `subject`, `schoolType`, `region`, `grades`, `topics`, `learningGoal`, `taskPattern`, `qualityHints`, `modalities`, `source` und `supportedTypes`. IDs entsprechen `pp-` plus 16 Hexzeichen. `source` enthält ausschließlich 16-stellige Inhalts-ID und PDF-Seite. Das Lernziel, Aufgabenmuster und Qualitätsregeln sind selbst formulierte Abstraktionen; niemals ganze Aufgaben oder Antworten exportieren.

Vor Aufnahme Aufgabenstellung, Lösung und gegebenenfalls Visual-/Audiobezug tatsächlich prüfen; Schul-/Jahrgangsbeleg bestätigen. `candidate`, `provisional`, `verified_with_issue` und bekannte Fehlerquellen sind nicht freigegeben. Eine Quelle darf bei offener Bildinterpretation nur ein eigenständig geprüfter Text-/Kompetenzaspekt werden; das Bild selbst bleibt außerhalb des nutzbaren Pools.

Nach einer kontrollierten Katalogänderung Versionskennung erhöhen und Functions-Tests einschließlich `pedagogical-catalog.test.js`, Syntax und ESLint laufen lassen. Ergänzungen werden mit dem normalen Functions-Release ausgeliefert. Die große lokale Analysebasis bleibt getrennt erhalten; kein ungeprüfter Massentransfer.

## Prüfungen und Grenzen

Lokale Tests beweisen strikte Filter, Themenrelevanz, Materialgrenzen, Format-/Audio-Schutz, Datenprojektion, Budgetgrenzen, Fehlerfallback sowie echten Handler-Datenfluss in Erst-/Ersatz-/Gesamtreparatur. Gesamtsuite 248/248 unter Node22.23.3 sowie Node24.19.0; Syntax und ESLint ebenfalls grün. Die Node22-Laufzeit wurde aus dem offiziellen Archiv geladen und per veröffentlichter SHA-256 geprüft. Kein externer Modellaufruf. GitHub-CI bleibt ein gesonderter Nachweis.

Verbesserte tatsächliche Aufgabenqualität wird erst durch einen Nutzertest belegt: passende Mittelschule-6-Deutsch- und Mittelschule-9-Mathe-/DaZ-Beispiele vergleichen; außerdem Grundschule/Gymnasium und „nur mein Material“ als Kontrollfälle ohne Treffer. Produktintegration und Staging-/Production-Stufe ausdrücklich getrennt melden.
