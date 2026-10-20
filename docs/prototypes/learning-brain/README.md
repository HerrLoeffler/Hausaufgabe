# Lerngehirn als klickbare Vorschau

GC-ADAPTIVE-PRACTICE-01, autorisierter wegwerfbarer Webprototyp vom 20.10.2026. Nicht in GradeCrew integriert. Keine API, echten Schülerdaten oder Cloudspeicherung. Beispielregeln demonstrieren Anpassung, keine validierte Diagnose.

## Öffnen

`preview.html` ist eine direkt im Browser öffnungsfähige, eigenständige Fassung. Keine Installation nötig. Die danebenliegenden Modulquellen sind die editierbare Grundlage. Ein einfacher lokaler Server kann `index.html` ausliefern: `python3 -m http.server 8768 --bind 127.0.0.1` im vorliegenden Verzeichnis. HTTP nur lokal, kein Hostingdeploy.

## Ausprobieren

- Start: vier Fächer und Alex im Zentrum, keine kleinen Unterzweige.
- Mathe: sieben Bereiche entsprechend der bereits belegten LehrplanPLUS-Zuordnung. Bruchzahlen ist der einzige ausgearbeitete Bereich; übrige öffnen einen ehrlichen Vorschauhinweis.
- Bruchzahlen: erste richtige Antwort 4 führt zum größeren Schritt `3/4 + 1/6`.
- `4/10` führt nach Feedback zu `1/4 + 2/4`, danach zu Erweiterungsproben. Alternativ richtige Summe `11/12` → Sachaufgabe `3/4` → reguläres Ende.
- Hilfe vor Antwort wird als unterstützt behandelt. Neue Aufgaben prüfen die nächste Anwendung. Eine frühe falsche Antwort führt zunächst zur Darstellung. Spätestens nach sieben Antworten oder mehreren erfolglosen Proben regulärer Abschluss.
- Beenden, Überspringen und Zurücksetzen möglich. „Spätere Wiederholung“ ist ausdrücklich nur ein Demo-Zeitsprung. Kein echter Zeitabstand und keine Beherrschungsquote.

## Quellen und Gestaltung

Eigene vektorbasierte Interpretation der von Martin angehängten Gehirnreferenz, kein hochgeladenes Bild kopiert. GradeCrew-Tokens aus `shared/gradecrew-design/tokens.json` am Runtimecommit4f8b792 als Referenz für Hintergrund, Text, primäre Aktion, Kontrast und Abstände gelesen. Fachfarben/Netz sind prototypische Visualisierung, keine Änderung gemeinsamer Tokens. Headerwortmarke vorläufig, kein neues freigegebenes Produktlogo. Systemschrift, keine externen Fonts/Assets. Alle Schülernamen und Ereignisse sind synthetisch.

## Prüfung

`node --test engine.test.mjs`: 10 Fälle zuerst rot, anschließend 10/10 grün. Korrigierter Integerparser: Defaultnenner war zunächst String statt Zahl, dadurch wurden Ganzzahlen abgewiesen. Testfälle decken richtigen Einstieg, fehlerhafte Addition, anfängliche Grundlagenlücke, Hilfennutzung, leere/ungültige Eingaben, doppelte Abgabe, äquivalente Brüche, reguläres Ende und Unterstützungsausgang ab. `node --check` für beide Module.

Lokale Browserprobe in Codex-IAB: Start → Mathe (sieben Themen) → Brüche → 4 → größerer Schritt → 4/10 → gleichnamige Addition → Hinweis → 3/4 → unterstützte Rückmeldung → Beenden/Zusammenfassung → Demo-Wiederholung. Start- und Übungsansicht bei390×844 visuell geprüft; Override anschließend zurückgesetzt. Keine Browserwarnungen/-fehler bei Logsprüfung. Kein physischer iPad-/Handytest, keine pädagogische Validierung, kein Produktions-/Backend-/Rulesnachweis. Menschliches Urteil steht aus.

Der lokale Vorschauserver wird für Martins Ausprobieren bewusst als eigener Prozess offen gelassen (Session72163, Port8768). Später nur diesen eigenen Prozess beenden. Bei Neustart Server aus diesem Verzeichnis starten oder `preview.html` öffnen; Browserrefresh setzt Beispieldaten zurück.
