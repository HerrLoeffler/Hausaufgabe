# GradeCrew: Tiefe der Layout-Überarbeitung

Stand: 28. September 2026 · Version 2.3.1-gc2 · Branch `fix/gradecrew-staging-polish`

## Belastbare Einordnung

Der Editor, die Schülernavigation und gemeinsame Bedienregeln wurden strukturell überarbeitet. Einstieg, Dashboard, KI-Erstellung und Bewertung wurden gezielt verbessert. Einstellungen, Vorlagen und Teile der Administration verwenden weiterhin ihre bisherige Grundstruktur.

Eine abgeschlossene visuelle Produktabnahme liegt noch nicht vor. Die Prüfung dieser Version umfasst Quellcode, DOM-Verhalten, CSS-Parsing und den Hosting-Build. Sie umfasst keine neuen Screenshots, keine vermessenen Browserlayouts und keinen vollständigen Durchlauf mit angemeldeten Lehrkräften. DOM-Tests simulieren keinen echten Bildschirm.

Der frühere Stand gc1 war eine Überarbeitung mittlerer Tiefe. Insbesondere verspätet geladene Layoutregeln konnten die neue Gestaltung wieder überschreiben. Diese Konflikte sind Gegenstand von gc2.

## Die zwölf Hauptansichten

Die Einordnung bezieht sich auf den kumulierten Stand gc1 + gc2. „Tief“ bedeutet eine Änderung an Struktur, Interaktion und Zuständen. „Gezielt“ bedeutet Verbesserungen ausgewählter Komponenten. Keine dieser Bezeichnungen ersetzt die noch ausstehende Sichtprüfung.

| Ansicht | Bearbeitungstiefe | Konkret umgesetzt | Noch zu prüfen oder auszubauen |
| --- | --- | --- | --- |
| Einstieg / Anmeldung | Gezielt | Gemeinsame Crew-Bildsprache, klare Trennung von Schülercode und Lehrerzugang, kurze Einführung, beschriftete Tabs mit Pfeiltasten, Home und End | Fehlerzustände bei Anmeldung, mobile Tastatur, vollständiger Tastaturdurchlauf im Browser |
| Meine Tests | Gezielt | Ruhiger Kopfbereich, gleiche Kartenhöhe innerhalb einer Rasterzeile, unten ausgerichtete Hauptaktionen, lesbare Metadaten, einheitliche Statusfilter | Lange Titel, 0/1/50 Tests, laufende und fehlgeschlagene KI-Aufträge, echte Kartenhöhe bei allen Statuskombinationen |
| Neuer Test | Gezielt | Drei erkennbare Startwege, Falke für KI-Erstellung, explizite Beschriftung des Vorlagencodes | Gleichgewicht der drei Karten bei kleinen Breiten und langen Texten |
| KI-Erstellung | Gezielt | Zwei nachvollziehbare Bereiche, optionale persönliche Vorgaben, einheitliche Eingaben und Hinweise, beschrifteter manueller JSON-Import | Upload-, Fehler-, Berechtigungs- und Fortschrittszustände vollständig im Browser prüfen; Formular ist weiterhin umfangreich |
| Editor | Tief | Kopfzeile und Einstellungen direkt im HTML, geordnete Aktionen, native Menüs, flexible Speichermeldungen, adaptive Seitenleiste, einheitliche Sprungnavigation, Fokus nach Hinzufügen/Verschieben/Löschen und Typwechsel | Alle elf Aufgabentypen, lange Aufgaben, 50 Aufgaben, fünf Bilder, hoher Zoom und Bildschirmtastatur visuell prüfen |
| Veröffentlichen / Durchführung | Gezielt | Umbruch von Code und QR-Bereich, benannter Freigabelink, gemeinsame Schaltflächen und Fokusregeln | Live-Aufsicht und Teilnehmerzustände sind funktional nicht neu gestaltet; Prüfung mit mehreren Geräten offen |
| Ergebnisse / Bewertung | Gezielt | Tastaturzugänglicher Tabellenbereich, Spaltenüberschriften, benannte Bewertungsaktionen, beschriftete Punktefelder, Fokus beim Öffnen/Schließen, Bilder bleiben sichtbar | Große Ergebnistabellen, verschiedene Bildformate, lange Antworten und mobile Bewertung visuell prüfen |
| Schüleransicht | Navigation tief; Antwortformate unverändert | Getrennte Abstände für Kopfzeile, Timer und Fortschritt, größere Navigation, aktuelle Aufgabe mit zugänglichem Status, keine erzwungene Scrollanimation bei reduzierter Bewegung | Touch- und Tastaturbedienung sämtlicher Antwortformate; insbesondere bestehende Drag-and-drop-Aufgaben benötigen eine gesonderte Prüfung |
| Einstellungen | Begrenzt | Gemeinsame Typografie, Eingaben, Schaltflächen, Fokus- und Umbruchregeln | Notenschlüssel und Standardwerte noch nicht eigenständig neu gestaltet |
| Vorlagenübernahme | Begrenzt | Gemeinsame Gestaltung und Ansichtswechsel | Lade-, Fehler-, Login-Rückkehr- und Übernahmezustände als vollständige Strecke prüfen |
| Papierkorb | Begrenzt | Gemeinsames Kartenraster, Dialog- und Fokusregeln | Wiederherstellung und endgültiges Löschen noch nicht als kompletter Ablauf visuell geprüft |
| Administration | Tabs gezielt; übrige Bereiche begrenzt | Beschriftete Tabs mit Tastaturbedienung, flexible Tabzeilen, benannte Tabellenbereiche, zentrale Statusfarben | Große Tabellen, Detailansichten, Mitteilungen, Feedback und Berechtigungen noch separat abnehmen |

## Konkrete Befunde und Korrekturen

1. **Widersprüchliche Kartenregeln:** Das optionale Layoutskript setzte `align-items:start` und `margin-top:0!important`. Dadurch wurde die zuvor definierte Ausrichtung wieder aufgehoben. Diese verspäteten Regeln sind entfernt; das Dashboard definiert die Ausrichtung jetzt in der statischen Arbeitsoberfläche.
2. **Nachträglicher Umbau des Editors:** Titel, Buttons und Einstellungen wurden bei DOM-Änderungen gesucht und umgehängt. Die endgültige Struktur steht jetzt direkt in `index.html`. Ein Ausfall optionaler Skripte entfernt keine Editoraktionen.
3. **Verdeckte Funktionen auf kleinen Displays:** Das alte Layout blendete die Schüleransicht bei höchstens 620 px aus. Sie bleibt jetzt erreichbar. Die mobile Aktionsleiste darf umbrechen und schneidet das Mehr-Menü nicht mit einem horizontalen Scrollcontainer ab.
4. **Feste Scrollpositionen:** Kopfzeile, Editor, Timer und Fortschritt verwendeten unterschiedliche feste Pixelwerte. Gemessene Elementhöhen bestimmen nun die Abstände. Bei schmalen oder niedrigen Fenstern wird die Zahl haftender Bereiche reduziert.
5. **Unvollständige Tabs:** Es fehlten Rollen, Auswahlzustände, Panelzuordnung und Pfeiltastenbedienung. Anmeldung und Administration verwenden jetzt dieselbe Interaktionsregel. Formulareingaben bleiben beim Tabwechsel erhalten.
6. **Unklarer Speicherstatus:** Ein grüner Badge-Hintergrund wurde auch für lokale Sicherungen verwendet. Fünf Zustände unterscheiden jetzt ungespeichert, laufende lokale Sicherung, lokale Sicherung, Server-Speicherung und Fehler. Text und Farbe tragen die Unterscheidung gemeinsam.
7. **Verlorener Fokus:** Ansichtswechsel und erneutes Rendern konnten den Fokus bei einem ausgeblendeten oder entfernten Element lassen. Zentrale Wechsel und Editoraktionen setzen einen erreichbaren Fokus. Offene Dialoge und aktive Eingaben werden dabei geschützt.
8. **Falsche aktuelle Schüleraufgabe:** Die bisherige Entfernungsmessung konnte bei langen Aufgaben zu früh zur nächsten Aufgabe wechseln und am Seitenende auf Aufgabe 1 zurückfallen. Die Navigation berücksichtigt jetzt die bereits erreichten Aufgabenanfänge.
9. **Zu aggressive Textbereinigung:** Eine Darstellungskorrektur für Wortmarkierungsaufgaben konnte Text nach einer zitierten Passage abschneiden. Sie entfernt jetzt nur eine identische Passage am Ende. Lehrertexte bleiben unverändert.
10. **Fehlende Feldnamen:** Fünf statische Eingaben hatten nur einen Platzhalter oder keine explizite Beschriftung. Diese Namen sowie Namen für alle sieben statischen Dialoge und die beiden Varianten-Dialoge sind ergänzt. Dynamisch erzeugte Punktefelder in der Bewertung sind ebenfalls zugeordnet.

## Gestaltungssystem und technische Grenzen

- Vier statische Stylesheets werden in fester Reihenfolge geladen: Basis, vorhandenes Designsystem, Marke, Arbeitsoberfläche.
- Vier optionale Module erzeugen keine eigenen Stylesheets mehr. Die entfernten Layout- und Variantenblöcke enthielten zusammen 58 `!important`-Angaben. `workspace.css` ergänzt keine solchen Angaben.
- Der globale Layout-Beobachter ist entfernt. Der Beobachter für Schülernavigation und Darstellungsbereinigung ist auf den Schülerbereich begrenzt. Die Variantenwarteschlange hat weiterhin einen eigenen ereignisgestützten Beobachter.
- Neue gemeinsame Abstände sind 4, 8, 12, 16, 24 und 32 px. Sie gelten für die neu geordneten Komponenten; alte Einzelwerte sind noch nicht überall ersetzt.
- Hilfstexte im Markenbereich und den neuen Komponenten verwenden mindestens 12 px. Neue Eingaben auf kleinen Displays verwenden 16 px. Es gibt weiterhin kleine historische Texte in anderen Komponenten.
- Hauptaktionen haben 44 px Mindesthöhe. Für die überarbeiteten Icon- und Navigationsaktionen sind auf Touch-Geräten ebenfalls 44 px vorgesehen. Eine Prüfung sämtlicher tatsächlicher Trefferflächen im Browser ist offen.
- Die vorhandenen SVG-Tiere bleiben unverändert austauschbar: Pinguin = Hilfe, Falke = Erstellen, Fuchs = Verbessern, Eule = Prüfen. Es wurden keine neuen Rasterbilder oder Animationsbibliotheken hinzugefügt.
- Die historische CSS-Basis wurde nicht vollständig ersetzt. Allein `styles.css` umfasst noch rund 79 kB mit zahlreichen gewachsenen Regeln. Die Gesamtkonsolidierung bleibt eine eigene Arbeit nach der visuellen Abnahme.

### Berechnete Kontrastpaare

Berechnet aus den angegebenen sRGB-Farben. Das prüft sechs definierte Farbpaarungen, nicht jede gerenderte Kombination, Transparenz, Grafik oder Fokusdarstellung der Anwendung.

| Verwendung | Vordergrund | Hintergrund | Verhältnis |
| --- | --- | --- | --- |
| Haupttext auf Karte | `#202b3c` | `#ffffff` | 14,26 : 1 |
| Hilfstext auf Arbeitsfläche | `#5e6b7b` | `#f6f7f9` | 5,07 : 1 |
| Primäraktion | `#ffffff` | `#285ac9` | 6,18 : 1 |
| Warnstatus | `#775110` | `#fff6e4` | 6,59 : 1 |
| Fehlerstatus | `#a6261c` | `#fff1ef` | 6,54 : 1 |
| Gespeichert | `#216440` | `#edf8f0` | 6,51 : 1 |

Eine vollständige WCAG-Konformität wird damit nicht behauptet. Maßgebliche Referenzen für die Umsetzung sind das [W3C-Tabmuster](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) und [größere Bedienflächen](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html). Die gestalterischen Referenzen sind in `GRADECREW_BRAND_SYSTEM.md` dokumentiert; eine Untersuchung von tausenden Websites hat nicht stattgefunden.

## Tatsächlich ausgeführte Prüfungen

`bash deploy-staging-hosting.sh --check`

- 23 bestehende Frontend-Regressionstests bestanden.
- 20 DOM-Regressionstests bestanden, darunter 13 neue Tests in gc2.
- Syntaxprüfung der ausgelieferten JavaScript-Module bestanden.
- Staging-Build mit 25 ausdrücklich ausgewählten Dateien bestanden; lokale Modul- und Assetverweise geprüft.
- Vier statische Stylesheets mit einem CSS-Parser eingelesen.
- Keine kostenpflichtige KI-Erstellung ausgelöst. Die bestehenden 103 Backendtests waren im vorherigen Arbeitsschritt erfolgreich; sie wurden für diese reine Oberflächenänderung nicht erneut ausgeführt.

Die DOM-Tests prüfen unter anderem Tabs, native Menüs, Fokus, lokale Sicherungsfehler, gemessene Kopfzeilenhöhe mit simuliertem ResizeObserver, Navigation bei langen Fragen, Bild und Punktefeld in der Bewertung sowie einen ruhenden DOM nach optionalen Erweiterungen. Sie prüfen keine Pixelpositionen, echte Zoomdarstellung, mobile Bildschirmtastatur oder Screenreader-Ausgabe.

## Offene visuelle Abnahme auf Staging

| Prüfung | Testumfang | Abnahmekriterium |
| --- | --- | --- |
| Größen | 320, 390, 768, 1024 und 1440 CSS-px; schmales Querformat | Kein horizontaler Seitenscroll außerhalb dafür vorgesehener Datentabellen; alle Aktionen erreichbar |
| Vergrößerung | 200 % und Reflow bei 320 CSS-px | Keine abgeschnittenen Inhalte, Menüs oder Eingaben; haftende Bereiche verdecken keine Aufgabe |
| Tastatur | Anmeldung → Test → Aufgabe → Varianten → Bewertung; Tab, Shift+Tab, Pfeile, Escape | Sichtbarer Fokus, sinnvolle Reihenfolge und Rückkehr zum auslösenden Element |
| Inhalt | 50 Aufgaben, fünf Bilder, lange Titel, lange Antworten, null Ergebnisse | Ruhige Abstände und verständliche Zustände ohne Überlagerungen |
| Geräte | Chrome/Edge, Firefox, Safari; echtes iPad oder iPhone | Keine Probleme mit Dialogen, virtueller Tastatur, Scrollen und Touch |
| Zustände | Leer, lädt, erfolgreich, fehlgeschlagen, gespeichert, lokal gesichert, gesperrt | Richtige Meldung und passende nächste Handlung; kein stiller Funktionsverlust |

Erst nach diesem Durchlauf lässt sich die sichtbare Qualität der gesamten Plattform belastbar bewerten. Neue Funktionen wie ein abgesicherter Prüfungsmodus, serverseitige Bewertung oder KI-Qualitätsverbesserungen werden durch dieses Layoutpaket nicht implementiert.

## Deployment und Fortsetzung

Version gc2 ist ein Hosting-Paket für `hausaufgabe-staging`. Produktionsprojekt, Datenregeln, Functions und Produktionshosting werden durch das Deployskript nicht verändert. Aktueller Prüfstand der öffentlichen Staging-Seite: noch `2.3.1-ai30`; `release.json` wird dort noch nicht ausgeliefert.

Hier fehlt ein authentifizierter Firebase-Zugang; Cloud Shell war aus dieser Umgebung nicht erreichbar. Es wurde deshalb kein erfolgreicher Deploy behauptet. Der folgende vollständige Befehl funktioniert unabhängig vom aktuellen Cloud-Shell-Verzeichnis und holt den gesicherten Entwicklungsbranch. Eigene lokale Änderungen werden nicht überschrieben. Falls die Anmeldung abgelaufen ist, öffnet das Skript den Firebase-Anmeldeablauf.

```bash
GRADECREW_SETUP="$(mktemp /tmp/gradecrew-staging.XXXXXX.sh)"
curl -fsSL \
  'https://raw.githubusercontent.com/HerrLoeffler/Hausaufgabe/fix/gradecrew-staging-polish/tools/cloud-shell-staging.sh' \
  -o "$GRADECREW_SETUP" &&
bash "$GRADECREW_SETUP"
```

Das Skript prüft den Stand, baut ein eigenes Hosting-Verzeichnis, deployt ausschließlich Staging-Hosting und vergleicht anschließend die ausgelieferten Dateien mit ihren Prüfsummen. Testadresse: https://hausaufgabe-staging.web.app
