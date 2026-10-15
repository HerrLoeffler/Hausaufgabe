# GradeCrew Secure Layout und Aufgabennavigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Der Nutzer hat in diesem Schritt den ausführlichen Plan beauftragt. Die nachfolgenden Produktänderungen sind hier beschrieben, nicht bereits gebaut oder nach TestFlight ausgeliefert.

**Goal:** Eine klar lesbare GradeCrew-Secure-Oberfläche mit kompakter Codeeingabe, konsistenter Aufgabenansicht und direkt anwählbaren, korrekt als bearbeitet markierten Aufgaben bereitstellen.

**Architecture:** SwiftUI behält Einstieg, sicheren Prüfungsrahmen, Countdown und Abgabe. Die lokal gebündelte WKWebView bekommt eine eigene Aufgabenführung, die dieselben Aufgaben-IDs und Antwortwerte wie der bestehende Renderer verwendet. Eine kleine lokale Darstellungsmetadaten-Erweiterung hält insbesondere fest, ob eine Sortieraufgabe bewusst bearbeitet wurde; sie verändert weder Serverantwortformat noch AAC-Freigabeentscheidung.

**Tech Stack:** Swift/SwiftUI, UIKit für Bedienhilfen und Größenmessung, WebKit, HTML/CSS/JavaScript, bestehende Swift- und Python-Tests, gepinntes jsdom, XCTest im iPad-Simulator und vorhandene GitHub-/Apple-TestFlight-Pipeline. Keine neue produktive Bibliothek.

**Spec:** [GradeCrew Secure Layout und Aufgabenführung](../specs/2026-10-15-secure-layout-design.md)

## Global Constraints

- Erste Abnahme weiterhin iPads mit iPadOS mindestens 17.0; Bundle-ID `de.gradecrew.secure`.
- Production, Hosting, Regeln, Backend und Lehrkräfte-App bleiben unverändert.
- Die vorhandenen Staging-Assessment-Callables bleiben der einzige Serververtrag.
- Kein Prüfungsinhalt vor bestätigtem AAC-Start; kein ungesperrter Vorschaufallback im ausgelieferten Prüfungsbuild.
- Eine Aufgabenaktion kann keine AAC-Freigabe auslösen. Erfolg bleibt an die native Serverquittung und Apples End-Callback gebunden.
- Vorzeitige und automatische Abgabe behalten denselben vorhandenen sicheren Pfad; Zeitablauf läuft auch bei geöffnetem Dialog weiter.
- Antworten werden nicht neu formatiert, clientseitig bewertet oder durch eine zweite Aufgabensortierung verändert.
- Grün bedeutet „bearbeitet“, niemals „richtig“. Farbe wird durch Haken, Nummer und zugänglichen Zustand ergänzt.
- Die erste Layoutversion verwendet ein einheitliches helles Erscheinungsbild im nativen und im Webteil, unabhängig von der Geräteeinstellung.
- Normale Schrift mindestens 4,5:1; wichtige grafische Grenzen und Fokus mindestens 3:1; interaktive Ziele mindestens 44 × 44 logische Einheiten.
- Formularbreite höchstens 560, Prüfungsinhalt höchstens 880; echte verfügbare Breite entscheidet, nicht Gerätename oder physische Zollzahl.
- Bestehende Crew-Bilder vollständig mit erhaltenem Seitenverhältnis; keine neue Bildproduktion und keine Pflichtanimation.
- Keine zusätzlichen Schüleraccounts, Website-Verwaltungsleisten, Coco-Chat oder Home-Ausgänge während AAC.
- Dauerhafte Darstellungsmetadaten sind optional und rückwärtskompatibel. Ein alter Versuch darf durch das Update weder verloren gehen noch eine neue Frist bekommen.
- „Lokal gesichert“ und „serverseitig abgegeben“ bleiben unterschiedliche Zustände.
- Vollständige Offline-Prüfungen, serverseitige Fristkulanz und autorisierte Lehrer-Notfreigabe sind separate Arbeitspakete.

## Review Focus

1. Dunkle Geräteeinstellung bei hellen festen Flächen: alle Texte und auch Lade-/Fehler-/deaktivierte Zustände müssen lesbar bleiben; Nachweis in Task 2 und 3.
2. Eine voreingestellte oder aus einem alten Versuch geladene Reihenfolge: kein unbeabsichtigtes Grün und kein Verlust bestehender Antworten; Nachweis in Task 4.
3. Sprung zu Aufgabe 30 während Scrollen, Tastatur oder Bildnachladen: stabile Aufgaben-ID, richtige aktuelle Nummer und unverdeckte Überschrift; Nachweis in Task 5 und 6.
4. Zeitende während Übersicht, Bestätigungsdialog oder WebView-Neustart: unveränderliche Abgabe, keine erneute Bearbeitung und keine verspätete Freigabe eines anderen Versuchs; Nachweis in Task 8.
5. Große Schrift, lange Inhalte und viele Aufgaben: erreichbare Aktionen ohne abgeschnittene Felder oder horizontales Scrollen der Gesamtseite; Nachweis in Task 6, 7 und 9.

---

Stand: 16. Oktober 2026. Der Dateiname behält das Datum des begonnenen Planungsauftrags.

## 1. Umfang und Arbeitsreihenfolge

Der Plan umfasst die Secure-Schülerapp. „Startseite“ wird hier als Code-/Namenseinstieg der Secure-App verstanden. Die allgemeine Lehrkräfte-Homepage, deren Dashboard und Editor sind bewusst kein gleichzeitiger Umbau. Falls später dieselben Farben oder Regeln auf die Website übernommen werden, geschieht das als eigenes überprüfbares Paket.

Die Arbeit läuft in neun Lieferpaketen. Jedes Paket liefert eine prüfbare Änderung und einen eigenen Commit. Ein Paket darf abgelehnt oder nachgebessert werden, ohne dass dadurch sofort die komplette Sperrlogik neu entwickelt werden muss.

| Reihenfolge | Paket | Sichtbares Ergebnis |
|---|---|---|
| 1 | Prüfbarer Layout-Unterbau | Echte Secure-Ansichten und WebKit-Aufgaben lassen sich reproduzierbar aufnehmen und messen |
| 2 | Farben und Einstieg | Keine Weiß-auf-Weiß-Probleme; Code und Name klar erkennbar |
| 3 | Rahmen und Status | Lesbarer Timer, ruhige Kopf-/Fußleisten, klare Warte- und Fehlerseiten |
| 4 | Bearbeitungszustände | Einheitliche Regeln für elf Typen, korrekte Sortieraufgaben und Wiederaufnahme |
| 5 | Aufgabenübersicht | Nummern, grüne Haken, aktuelle Aufgabe und Vor/Zurück |
| 6 | Scrollen und Eingabe | Verlässliche Sprünge trotz Tastatur, großer Schrift und Medien |
| 7 | Aufgaben und Medien | Frage und Antwort bilden eine übersichtliche Einheit |
| 8 | Abgabezustände | Verständliche Zusammenfassung, unveränderte sichere Abgabe und Freigabe |
| 9 | Gesamtprüfung und Auslieferung | Größenmatrix, Screenshots, Geräteprotokoll und neuer TestFlight-Build |

Task 1 ist eine kleine Testgrundlage, kein neuer Produktmodus. Task 2 und 3 können im selben TestFlight-Zwischenstand für eine frühe Sichtkontrolle zusammenkommen. Eine Veröffentlichung der Aufgabenleiste erfolgt erst mit Task 4 bis 6, weil eine schöne Leiste mit falschen Bearbeitungszuständen den Zweck verfehlen würde.

## 2. Geprüfte Dateien und neue Zuständigkeiten

| Datei oder Bereich | Entscheidung |
|---|---|
| `native/GradeCrewSecure/Sources/GradeCrewSecureApp.swift` | Secure-Erscheinungsbild konsistent an der tatsächlichen App-Wurzel setzen |
| `Sources/SecureStagingRootView.swift` | Zusammensetzung der realen Ansichten beibehalten; fachliche Zustände aus dem Coordinator beziehen |
| `Sources/SecureExamCoordinator.swift` | Lokale Darstellungsmetadaten und unverbindliche Bearbeitungsanzahl übernehmen; AAC-/Quittungsentscheidung nicht an UI übertragen |
| `Sources/SecureAssessmentSession.swift` | Keine neue Freigabefunktion durch das Layout; vorhandene Apple-Lebenszykluslogik bleibt |
| `Sources/SecureExamWebView.swift` | Bestehende Hauptframe-/Dokumentprüfung beibehalten; Präsentationsdaten und Schriftmaß begrenzt übergeben |
| `Sources/SecureAttemptStore.swift` | Speicher- und Keychain-Verhalten erhalten; nur `SecureSavedWork` in testbare Foundation-Datei auslagern |
| Neu: `Sources/SecureSavedWork.swift` | Vorhandene gespeicherte Antworten plus optionale UI-Metadaten rückwärtskompatibel kodieren |
| Neu: `Sources/SecureTheme.swift` | Benannte Farb-, Abstands- und Größenrollen für native Ansichten |
| Neu: `Sources/SecureEntryView.swift` | Reines Code-/Namensformular mit Datenbindungen und Startaktion |
| Neu: `Sources/SecureExamChrome.swift` | Wiederverwendbare Kopf-/Fußleisten für den realen Prüfungsrahmen |
| Neu: `Sources/SecureStatusView.swift` | Warte-, Fehler-, Wiederaufnahme- und Abschlussdarstellung ohne eigene Freigabelogik |
| `Resources/Exam/question-renderer.js` | Antwortdarstellung erhalten; Bearbeitet-Regeln gezielt an gemeinsame neue Zustandsfunktion anbinden |
| Neu: `Resources/Exam/question-progress.js` | Reine zustandsbezogene Auswertung ohne DOM, Server und Lösungen |
| Neu: `Resources/Exam/question-navigation.js` | Aufgabenknöpfe, Auswahl, Sprünge, Scrollabgleich und Bedienhilfen |
| `Resources/Exam/native-exam.js` | Initialisierung, gemeinsame Aktualisierung und bestehende Snapshot-Brücke |
| `Resources/Exam/index.html`, `exam.css` | Navigation, Token, responsive Typografie und klare Antwortzustände |
| `Package.swift`, `generate_project.py` | Neue Dateien in die richtigen Ziele aufnehmen; Testhost nicht in die Produkt-App aufnehmen |
| Neu: `LayoutTests/` | Isolierter Secure-Testhost mit realen Komponenten, künstlichen Inhalten und Screenshot-Berichten |
| `.github/workflows/gradecrew-secure-testflight.yml` | Bestehende Tests und AAC-Prüfung um Layout-Gates ergänzen |
| `docs/secure/evidence/` | Befunde und Screenshots dem exakten neuen Build zuordnen |

Die Pfade ohne führendes Verzeichnis in dieser Tabelle liegen unter `native/GradeCrewSecure`. Der Generator nimmt derzeit Swift-Dateien aus `Sources` auf; Testhost-Dateien müssen deshalb außerhalb dieses Ordners bleiben. Ein etwaiges neues Produkt-View wird erst dann abgetrennt, wenn es tatsächlich in beiden Hosts verwendet wird. Keine zweite nachgebaute Testoberfläche.

## 3. So soll es aussehen

### 3.1 Einstieg

```text
                  [ Crew, vollständig sichtbar ]
                  [ Logo ] GradeCrew Secure

           ┌─────────────────────────────────────┐
           │ Deinen Test starten                 │
           │                                     │
           │ Testcode                            │
           │ [ Code deiner Lehrkraft           ] │
           │                                     │
           │ Name oder Kürzel                    │
           │ [ Dein Name oder vereinbartes ... ] │
           │                                     │
           │ [           Test starten          ] │
           │ Das iPad wird nach Bestätigung ...  │
           └─────────────────────────────────────┘
                   Staging · Testumgebung
```

Der Rahmen ist nicht durch einen riesigen Schatten, sondern durch den Unterschied zwischen bläulichem Hintergrund, weißer Lesefläche und sichtbaren Eingabegrenzen erkennbar. Auf einem großen iPad wird das Formular nicht beliebig breit. Bei wenig Höhe rutscht es in einen normalen vertikalen Scrollbereich. Crew und Formular bleiben auf derselben Achse; die Feldtexte bleiben links ausgerichtet.

### 3.2 Laufende Prüfung

```text
[GC] Englisch · Farben                 [ Uhr 04:18 ]
     Name/Kürzel
──────────────────────────────────────────────────
[‹] Aufgabe 3 von 15 [›]       5 bearbeitet · 10 offen
[1✓] [2✓] [3] [4✓] [5] ...            [ Übersicht ]
──────────────────────────────────────────────────
Aufgabe 3                                    2 P.

Welche Farbe hat ...?

[○ Antwort A                                    ]
[● Antwort B                                    ]
[○ Antwort C                                    ]

                 nächster Aufgabenblock
──────────────────────────────────────────────────
[✓ Auf diesem iPad gesichert]            [ Abgeben ]
```

Die doppelte Linie steht hier für Grenzen zwischen nativer Leiste, Webteil und Fußleiste, nicht für zusätzliche echte Rahmen um jeden Abschnitt. Die aktuell ausgewählte Nummer hat einen blauen Fokus-/Auswahlrahmen. Ein Haken ist nur der Bearbeitungszustand. Die Zeit steht nativ und bleibt unabhängig von Scroll- oder Animationsereignissen.

### 3.3 Aufgeklappte Übersicht und kleine Höhen

```text
Aufgabe 3 von 30               [ Übersicht schließen ]
[1✓] [2✓] [3] [4] [5✓] [6] [7] [8✓]
[9 ] [10] [11] [12] [13] [14] [15] [16]
... innerhalb der Übersicht scrollbar ...
✓ bearbeitet     ohne Haken: noch offen
─────────────────────────────────────────────────────
Aufgabe 3
Frage und Eingabe bleiben im darunterliegenden Lesebereich.
```

Die Übersicht wächst nicht über den gesamten Bildschirm. Bei eingeblendeter Tastatur oder großer Schrift wird ihr Platz reduziert. Es muss immer einen erreichbaren Weg zurück zur Aufgabe geben. Eine Zahl darf dreistellig werden; das Raster passt seine Spalten an, statt „100“ abzuschneiden.

## 4. Farb- und Lesbarkeitsabnahme

Die verbindlichen Werte stehen in der Spec. Die folgenden Kontraste wurden für die deckenden Farbpaare rechnerisch geprüft. Die neue Automatik muss dieselben Rechnungen wiederholbar ausführen und zusätzlich die tatsächlich gerenderten Farben prüfen.

| Paar | Kontrast ungefähr | Zweck |
|---|---:|---|
| `#15283F` auf Weiß | 14,92:1 | Haupttext |
| `#4B5E75` auf Weiß | 6,65:1 | Hinweise |
| Weiß auf `#1857CC` | 6,41:1 | Hauptknopf |
| `#0E6547` auf `#DCF3E8` | 6,07:1 | Bearbeitet |
| `#8A4B08` auf `#FFF1CF` | 6,06:1 | Warnungen |
| `#B42318` auf `#FEE4E2` | 5,45:1 | Fehler |
| Feldgrenze `#6B7D96` zu Eingabefläche | 3,87:1 | Sichtbare Eingabegrenze |

Die Feldgrenze ist kein normaler Lesetext. Sie wird deshalb gegen 3:1 geprüft, nicht als Ersatzfarbe für kleine Hinweise verwendet. Eine transparente oder deaktivierte Variante braucht eine eigene Prüfung. Ein Screenshot unter dunkler Geräteeinstellung muss dieselben lesbaren Farbpaare liefern; die App darf nicht versehentlich weiße Systemschrift auf die feste weiße Karte setzen.

---

## Task 1: Reproduzierbare Secure-Layoutprüfung aufbauen

**Files**

- Create: `native/GradeCrewSecure/LayoutTests/layout-policy.json`
- Create: `native/GradeCrewSecure/LayoutTests/SecureLayoutHostApp.swift`
- Create: `native/GradeCrewSecure/LayoutTests/SecureNativeLayoutTests.swift`
- Create: `native/GradeCrewSecure/LayoutTests/SecureWebLayoutTests.swift`
- Create: `native/GradeCrewSecure/LayoutTests/generate_layout_project.py`
- Create: `native/GradeCrewSecure/LayoutTests/run_layout_checks.py`
- Create: `native/GradeCrewSecure/LayoutTests/Fixtures/` mit ausschließlich künstlichen Prüfungsinhalten
- Reference: vorhandene Lehrkräfte-Layoutprüfungen unter `native/GradeCrewTeacher/LayoutTests/`, ohne diese umzubauen

**Interfaces**

- Consumes: reale Secure-Views und gebündelte `Resources/Exam`-Dateien.
- Produces: `run_layout_checks.py --output <new-directory> --suite <smoke|full> --layer <native|web|all> [--device-id <available-iPad-simulator-UDID>]`. Ohne Geräte-ID wird ein verfügbarer iPad-Simulator aus dem lokalen Inventar gewählt; kein fest angenommener Modellname.
- Produces: je Fall PNG und JSON mit `caseID`, Viewport, Erscheinungsbild, Textgröße, tatsächlicher Geometrie und `issues`; außerdem `summary.json` und eine lokale Screenshot-Galerie.
- Produces: separaten Testhost `de.gradecrew.secure.layoutchecks`, der nie archiviert oder zu TestFlight hochgeladen wird.

- [ ] **Step 1: Layoutfälle und fehlschlagende Mindestprüfung festlegen.** Die Basismatrix aus Abschnitt 5 als Daten hinterlegen. Zuerst den Berichtsläufer gegen fehlende PNGs, unvollständige Falllisten und Fehlerausgänge testen. Diese Tests müssen ohne funktionsfähige Ausgabe scheitern. Die fehlende Aufgabenleiste und die Kontrastlücke werden als bekannte Produktbefunde erfasst; ihre Regressionstests kommen in die jeweiligen folgenden Tasks.
- [ ] **Step 2: Bestehende reale Ansichten messbar machen.** Der Testhost ersetzt die Anwendungseintrittsstelle, nicht die Produktansichten. Er kann zunächst die unveränderte Root-/Statusdarstellung aufnehmen; die extrahierten realen Formular- und Rahmenkomponenten werden mit Task 2 und 3 registriert. Testfixtures übergeben nur Daten und Aktionen an diese Komponenten. Sie verändern nicht per Laufzeitargument einen echten Coordinator in einen ungesperrten Prüfungsmodus. Keine Startargumente wie `--skip-aac` in der ausgelieferten App.
- [ ] **Step 3: Screenshot- und Geometrieausgabe bauen.** Die gleichen nativen Komponenten in einem UIKit-Host und dieselben lokalen Ressourcen in realer WKWebView ausführen. Größe wird vor dem Messen tatsächlich gesetzt. Ein künstlicher DOM-Test ersetzt keine WebKit-Geometrieprüfung.
- [ ] **Step 4: Läufer gegen unvollständige Ergebnisse absichern.** Ausgabeordner muss neu oder leer sein. Fehlende PNGs, übersprungene Fälle, abgestürzte Hosts und Zeitüberschreitung ergeben einen Fehlerstatus. Die erwartete Fallzahl wird aus der Fallliste abgeleitet.
- [ ] **Step 5: Läufer im iPad-Simulator starten.** Erwartung: Infrastruktur sammelt die bereits registrierten Berichte zuverlässig; Berichtsläufer-Tests bestehen. Die vollständige Produktfallliste wird erst mit den Komponenten aus Task 2 und 3 aktiviert und anschließend verbindlich geprüft. Bekannte Produktbefunde bleiben offen sichtbar. Kein Testfall wird zum Grünmachen aus der Matrix entfernt.
- [ ] **Step 6: Eigenen Commit erstellen.** `test(secure): add real-view layout harness and evidence reports`.

**Abnahme:** Es gibt eine nachvollziehbare Ausgangsbildergalerie. Der Host besitzt keinen echten Testcode, keine Zugangsdaten und keinen Productionszugriff. Jeder neue Screenshot lässt sich zum Fall und Quellstand zurückverfolgen.

## Task 2: Farben, Felder und Einstieg korrigieren

**Files**

- Create: `Sources/SecureTheme.swift`, `Sources/SecureEntryView.swift`
- Modify: `Sources/GradeCrewSecureApp.swift`, `Sources/SecureStagingRootView.swift`, `Package.swift`
- Test: `LayoutTests/SecureNativeLayoutTests.swift`
- Create: `ScriptTests/test_theme_contrast.py`

**Interfaces**

- Produces: `SecureTheme` mit benannten Rollen `canvas`, `surface`, `field`, `text`, `secondaryText`, `border`, `brand`, `completeText`, `completeFill`, `warningText`, `warningFill`, `errorText`, `errorFill` und den Größen aus der Spec.
- Produces: `SecureEntryView(code: Binding<String>, name: Binding<String>, busy: Bool, message: String, onStart: () -> Void)`.
- Consumes: bestehende `preflight()`-/Startaktionen des Coordinators; keine eigene Netzlogik im Formular.

- [ ] **Step 1: Kontrast- und Zustandsprüfungen zuerst ergänzen.** Die deckenden Paare aus Abschnitt 4 müssen die vorgegebenen Schwellen erreichen. Native Aufnahmen prüfen Einstieg leer, teilweise gefüllt, startbereit, ungültiger Code, laufende Vorprüfung und Verbindungsfehler jeweils bei heller und dunkler Geräteeinstellung. Erwartung vor Umsetzung: wenigstens die explizite Farbzuordnung und Sichtprüfung fehlen.
- [ ] **Step 2: Helles Erscheinungsbild an der Secure-Wurzel konsistent setzen.** Die geprüften Text-/Flächenpaare explizit verwenden. Der vorhandene Webteil bleibt ebenfalls hell. Keine globale Änderung der Lehrkräfte-App oder der Website.
- [ ] **Step 3: Formular auf den definierten Arbeitsbogen umstellen.** Crew und Logo vollständig, Formular maximal 560, Felder mindestens 52 hoch, sichtbare Bezeichnungen und lesbare Platzhalter. Rahmen, Fehlertext und laufender Zustand sind Bestandteil derselben Gestaltung.
- [ ] **Step 4: Tastatur und große Schrift prüfen.** Beide Felder müssen in kleinen Höhen erreichbar bleiben. „Weiter“ führt vom Code zum Namen; eine Eingabe-Aktion darf die vorhandene Validierung nicht umgehen. Keine leeren echten Versuche durch Tastaturbedienung.
- [ ] **Step 5: Tests ausführen.** `python3 -m unittest discover -s native/GradeCrewSecure/ScriptTests -v` und die native Einstiegsmatrix aus Task 1. Erwartung: Kontrasttests grün, keine abgeschnittenen Felder, sichtbare Grenzen, Zentrierabweichung innerhalb 1,5 Punkten.
- [ ] **Step 6: Commit.** `fix(secure): make entry readable and align GradeCrew branding`.

**Abnahme:** Eine Person erkennt ohne Erklärung beide Felder und die Hauptaktion. Dunkle Geräteeinstellung produziert keine weiße Schrift auf weißen Flächen. Auf großen iPads wirkt das Formular begrenzt und ruhig, auf kleinen Höhen bleibt es bedienbar.

## Task 3: Prüfungsrahmen und alle Statusansichten vereinheitlichen

**Files**

- Create: `Sources/SecureExamChrome.swift`, `Sources/SecureStatusView.swift`
- Modify: `Sources/SecureStagingRootView.swift`
- Test: `LayoutTests/SecureNativeLayoutTests.swift`

**Interfaces**

- Produces: `SecureExamFrame<Content: View>(header: SecureExamHeader, footer: SecureExamFooter?, content: () -> Content)` als tatsächlicher gemeinsamer Rahmen für native Leisten und WebView. Der Layouttest setzt dieselben Komponenten mit Fixture-Daten ein.
- Produces: `SecureExamHeader(title: String, participant: String, remaining: Int?)`.
- Produces: `SecureExamFooter(storageStatus: String, warning: String?, canSubmit: Bool, onSubmit: () -> Void)`.
- Produces: `SecureStatusPresentation` mit `kind`, `title`, `message`, optionalem `actionTitle` und `busy`; rein darstellungsbezogen.
- Produces: `SecureStatusView(presentation: SecureStatusPresentation, onAction: () -> Void)`.
- Consumes: ausschließlich bestehende Coordinator-Phasen; die Phase wird nicht aus dem Aussehen oder einem Haken zurückgerechnet.

- [ ] **Step 1: Lange Inhalte und alle Phasen als Fixtures hinzufügen.** Titel mit 160 Zeichen, längeres Kürzel, 59:59, 00:59, 00:00, „Ohne Zeitlimit“, Warten, Start, Senden, Verifizieren, Wiederaufnahme, Unterbrechung, Speicherfehler und Erfolg. In der Basismatrix müssen fehlende oder verdeckte Texte auffallen.
- [ ] **Step 2: Kopfzeile mit echtem Umbruch bauen.** Beim Platzmangel wandert die Zeit in eine zweite Zeile; keine zusammengedrückte Schrift. Im breiten Modus teilt der Kopf die 880-Punkte-Achse des Aufgabenbereichs.
- [ ] **Step 3: Fußleiste in den nutzbaren Bereich einpassen.** Die WebView bekommt die tatsächliche Resthöhe. Tastatur, Safe Area und große Schrift dürfen die Aktion weder überdecken noch den Inhalt unter die Leiste schieben.
- [ ] **Step 4: Statusansichten auf die Farbrollen umstellen.** Jede Phase nennt den echten Vorgang. „Abgabe bestätigt“ und „iPad freigegeben“ bleiben zeitlich unterscheidbar. Fehler haben eine konkrete vorhandene Wiederholungsaktion; keine neue Entsperraktion.
- [ ] **Step 5: Native Prüfungen ausführen und Screenshots ansehen.** Die aktuelle Aufgabe kann auch mit Tastatur gelesen werden. Timer bleibt sichtbar; Erfolg wird nicht schon im Ladezustand dargestellt.
- [ ] **Step 6: Commit.** `refactor(secure): unify exam chrome and status presentation`.

**Abnahme:** Form, Prüfungsrahmen und Fehlerseiten gehören sichtbar zur gleichen App. Die vorhandenen Sicherheitsphasen und Aufrufwege sind unverändert. Die View-Datei enthält keine zweite Prüfungszustandsmaschine.

## Task 4: Gemeinsame Bearbeitungsregeln und rückwärtskompatible Wiederaufnahme

**Files**

- Create: `Resources/Exam/question-progress.js`, `Sources/SecureSavedWork.swift`
- Modify: `Resources/Exam/question-renderer.js`, `native-exam.js`, `index.html`
- Modify: `Sources/SecureAttemptStore.swift`, `SecureExamCoordinator.swift`, `SecureExamWebView.swift`, `Package.swift`
- Create: `ScriptTests/progress.test.cjs`, `Tests/SecureSavedWorkTests.swift`
- Extend: `ScriptTests/renderer.test.cjs`

**Interfaces**

- Produces: `questionCompletion(question, answer, touchedQuestionIds) -> 'open' | 'started' | 'complete'` als reine JavaScript-Funktion, die keine Lösungen kennt.
- Produces: `summarizeQuestions(paper, answers, touchedQuestionIds) -> {total, completed, started, open, completedQuestionIds}`. `open` bedeutet hier alle noch nicht vollständigen Aufgaben, also einschließlich `started`; die Zähler dürfen in der Oberfläche nicht als vier addierbare unabhängige Gruppen ausgegeben werden.
- Produces: `SecureExamPresentation: Codable` mit `touchedQuestionIDs: [String]` und einer Validierung gegen die IDs des aktuellen Papers.
- Produces: bestehendes `SecureSavedWork: Codable` in eigener Foundation-Datei mit neuem optionalem `presentation: SecureExamPresentation?`. Bestehende Felder `answers`, `response`, `autoSubmitted` bleiben gleich.
- Extends: Snapshot-Brücke um `touchedQuestionIDs: [String]` und `completedQuestionIDs: [String]`. Die bestehenden Felder `type`, `revision`, `answers` bleiben erhalten.
- Extends: `snapshot(revision: Int, answers: [String: Any], presentation: SecureExamPresentation?, completedQuestionIDs: [String]?) -> Bool` im Coordinator. Neue UI-Daten sind kein Ersatz für das vorhandene gültige Antwortpaket.
- Produces: `answeredCount: Int?` als rein darstellungsbezogene veröffentlichte Coordinator-Eigenschaft. Gesamtzahl stammt aus dem nativen aktuellen Paper, nicht aus einer beliebigen Bridge-Zahl.

- [ ] **Step 1: Zustandsregeln als Regressionstests ausdrücken.** Fälle aus Abschnitt 6 vollständig hinterlegen. Vor allem: frische Sortieraufgabe offen; bewusst bestätigte unveränderte Reihenfolge vollständig; gültige Null vollständig; teilweise Lücken begonnen; nach dem Leeren wieder offen. Vor der Umsetzung muss die bisher automatische Vollständigkeit der Sortieraufgabe auffallen.
- [ ] **Step 2: Reine Auswertung aus dem Renderer herauslösen.** `answerIsComplete` wird zu einem kleinen Aufruf der gemeinsamen Funktion oder durch deren Nutzung ersetzt. Zähler und spätere Navigation greifen auf dieselbe Funktion zu. Kein zweites leicht abweichendes Regelwerk in Swift.
- [ ] **Step 3: Reihenfolge-Bestätigung ergänzen.** Nur echte Umordnung oder der neue Bestätigungsknopf markieren die Aufgabe als bewusst bearbeitet. Aufgabennavigation und bloßes Rendern tun dies nicht. Die Bestätigung ändert nicht das bestehende Antwortarray.
- [ ] **Step 4: Lokale Präsentationsdaten gesichert mitführen.** Eine Antwortänderung behält den vorhandenen sofortigen Snapshot-Pfad. Neue Metadaten werden mit dessen Revision gesichert. Das endgültige `gcFreezeAnswers()`-Ergebnis enthält ebenfalls die aktuellen UI-Metadaten; der Server erhält daraus weiterhin nur seine bisherigen Antwortfelder. Fehlen optionale UI-Daten in einem alten oder abschließenden Snapshot, werden bereits gültig gespeicherte Präsentationsdaten nicht gelöscht. Fehlende neue Felder aus einem alten Versuch sind erlaubt; fremde Aufgaben-IDs, übergroße Listen oder doppelte IDs werden nicht als gültige UI-Zusammenfassung übernommen.
- [ ] **Step 5: Wiederherstellung belegen.** Alte JSON-Fixture ohne `presentation` dekodiert vollständig. Neue Fixture behält bestätigte Reihenfolge; ein anschließender Snapshot ohne optionale Metadaten löscht diese Bestätigung nicht. Alte Antworten bleiben unverändert, auch wenn deren Sortiernummer vorsichtshalber noch offen angezeigt wird. Ein Freeze oder Retry verändert keine endgültigen Antworten.
- [ ] **Step 6: Tests ausführen.** `node --test native/GradeCrewSecure/ScriptTests/progress.test.cjs native/GradeCrewSecure/ScriptTests/renderer.test.cjs` und `swift test --package-path native/GradeCrewSecure`. Erwartung: alle Typen und Speicherformate grün; bisherige Sicherheits- und API-Tests bleiben grün.
- [ ] **Step 7: Commit.** `feat(secure): track accurate question progress across recovery`.

**Abnahme:** Die Bedeutung von Grün ist für jeden Typ festgelegt und überprüfbar. Die Serveranfrage enthält weiterhin dasselbe `answers`-Format; UI-Metadaten werden nicht als Schülerantworten oder Bewertung hochgeladen. Der Aufgabenstatus bleibt unabhängig von der lokalen Speicherbestätigung, die weiterhin die native Fußleiste zeigt.

## Task 5: Nummerierte Aufgabenführung und Übersicht einbauen

**Files**

- Create: `Resources/Exam/question-navigation.js`
- Modify: `Resources/Exam/index.html`, `native-exam.js`, `question-renderer.js`, `exam.css`
- Create: `ScriptTests/navigation.test.cjs`
- Extend: `ScriptTests/verify_renderer_webkit.swift`

**Interfaces**

- Consumes: `questionCompletion` und `summarizeQuestions` aus Task 4 sowie bereits gerenderte `section.secureQuestion[data-qid]`.
- Produces: `createQuestionNavigation({paper, root, navRoot, reducedMotion})` mit Methoden `refresh(answers, touchedQuestionIds)`, `select(questionId, {focus})`, `freeze()` und `destroy()`.
- `select` akzeptiert nur IDs aus dem aktuellen Paper. Es aktualisiert Anzeige und Leseposition; es verändert keine Antworten, keinen Timer und keinen Coordinator-Phasenzustand.
- Produces: `window.gcExamSummary()` als lesende Funktion für Tests und Darstellungsdiagnose. Sie liefert nur die Zusammenfassung aus Task 4 und keine Lösungen oder Tokens.
- Existing privileged interface: `window.gcFreezeAnswers()` bleibt die einzige vorhandene native Antwort-Finalisierung; die Aufgabenführung bekommt keine Freigabefunktion.

- [ ] **Step 1: DOM-Tests für die Bedienung zuerst schreiben.** Genau eine Nummer je aktueller Aufgaben-ID; Nummern folgen der gelieferten Reihenfolge. Ein Nummernklick verändert den Zielzustand, aber kein Antwortfeld und keine Antwortrevision. Beantworten und Leeren aktualisieren Haken und Zähler. Aktuell und vollständig funktionieren gleichzeitig.
- [ ] **Step 2: Region und kurze Bedienung ergänzen.** Beschriftete Navigation, aktuelle Aufgabe, Vor/Zurück, Nummernreihe und Übersicht gemäß Spec. Bestehende Fortschritts-IDs können wiederverwendet werden, ohne doppelte Zähler anzuzeigen.
- [ ] **Step 3: Zugängliche Zustände bauen.** Ausgewählte Nummer bekommt `aria-current="step"`; Übersichtsknopf verwendet `aria-expanded` und `aria-controls`. Vollständigkeit wird in Textbeschreibung und Haken ausgedrückt. Nicht jede Änderung erzeugt eine störende Live-Ansage.
- [ ] **Step 4: Viele Aufgaben und ungültige Ziele prüfen.** Fixtures mit 1, 15, 30 und 100 Aufgaben. Erste/letzte Nummer und Nummer 100 bleiben anwählbar. Fremde IDs, ein leerer Klickbereich und wiederholte Initialisierung erzeugen keine Navigation außerhalb des aktuellen Papers und keine doppelten Handler.
- [ ] **Step 5: Freeze und Aufräumen anbinden.** Nach Freeze nehmen Wechselaktionen keine Bearbeitung auf. `destroy()` entfernt Observer, Timer und Listener. Kein weiterlaufender Listener darf nach einer neuen Prüfung deren Nummer oder Zustand ändern.
- [ ] **Step 6: Tests ausführen.** `node --test native/GradeCrewSecure/ScriptTests/navigation.test.cjs` und realen WK-Smoke ausführen. Erwartung: korrekte Struktur und Events, kein externer Link, keine neue native Nachricht für Start/Ende, identische Antwortwerte vor und nach Navigation.
- [ ] **Step 7: Commit.** `feat(secure): add accessible question navigation and completion badges`.

**Abnahme:** Die gewünschte Website-Bedienung ist sichtbar vorhanden: direkt anwählbare Nummern, grüne bearbeitete Aufgaben, aktuelle Aufgabe, Vor/Zurück und Übersicht. Alle Eingaben bleiben während Sprüngen bestehen. Der einfache DOM-Test beweist noch keine korrekte Scrollgeometrie; diese folgt ausdrücklich in Task 6.

## Task 6: Sprünge, angeheftete Leiste und Tastatur in realem WebKit absichern

**Files**

- Modify: `Resources/Exam/question-navigation.js`, `exam.css`
- Modify: `Sources/SecureExamWebView.swift`
- Extend: `LayoutTests/SecureWebLayoutTests.swift`, `SecureNativeLayoutTests.swift`

**Interfaces**

- Consumes: `select`, `refresh`, `destroy` aus Task 5.
- Produces: CSS-Variable `--secure-nav-height`, gemessen an der tatsächlich sichtbaren Navigation, und `scroll-margin-top` für Aufgaben mit 8 logischen Pixeln Abstand.
- Produces: Darstellungseingang `window.__GC_EXAM__.presentationScale` als positive endliche Zahl, aus der nativen bevorzugten Body-Schriftgröße relativ zu 17 Punkten ermittelt. Der Wert skaliert Typografie, nicht die gesamte Seite und nicht die Aufgaben-IDs.

- [ ] **Step 1: Geometrie-Regressionsfälle bauen.** Sprung von Aufgabe 1 zu 30; Sprung nach manueller Scrollbewegung; Sprung bei sichtbarer Tastatur; nachladendes großes Bild vor der Zielaufgabe; Öffnen und Schließen der Übersicht; Wechsel Hoch/Querformat. Zielüberschrift muss vollständig im sichtbaren WebView-Lesebereich liegen.
- [ ] **Step 2: Angeheftete Höhe messen.** `ResizeObserver` erfasst Veränderungen durch Schrift, Übersicht und Breite. Kein kopierter Website-Wert wie `top:144px` für den nativen Kopf. Die WebView beginnt bereits unter dem nativen Kopf.
- [ ] **Step 3: Gewählte Aufgabe während Sprüngen stabil halten.** Scrollbeobachtung kennt einen gezielten Sprung und übernimmt die automatische aktuelle Aufgabe erst nach dem Ende der Bewegung. Benutzerinteraktion darf den Sprung beenden. Timer, Listener und Observer werden bei `destroy()` entfernt.
- [ ] **Step 4: Große Schrift durchreichen.** Änderung der nativen bevorzugten Schriftgröße an dieselbe lokale Seite weitergeben, ohne Antworten oder DOM neu aufzubauen. Alle typografischen Maße der Weboberfläche wachsen über relative Einheiten. Keine Obergrenze, die eine angeforderte barrierefreie Schriftgröße heimlich zurücknimmt.
- [ ] **Step 5: Fokus und Medien prüfen.** Aufgabenüberschrift wird fokussiert, ohne eine Eingabetastatur zu erzwingen. Ein ausdrücklicher Sprung pausiert laufendes Audio und erhält dessen Position; normales Scrollen lässt es unberührt. Reduzierte Bewegung deaktiviert weiches Scrollen.
- [ ] **Step 6: Reale WebKit-Fälle ausführen.** Läufer aus Task 1 mit der Interaktionssuite starten. Erwartung: richtige Aufgabe, richtige aktuelle Nummer, keine überdeckte Frage, kein Gesamtscroll nach rechts und identische Antwortdaten. Ein Test darf nicht nur `scrollIntoView` als aufgerufen zählen.
- [ ] **Step 7: Commit.** `fix(secure): keep question jumps visible across keyboard and resizing`.

**Abnahme:** Die Navigation funktioniert auf dem tatsächlichen iPad-WebKit und bei künstlich veränderter verfügbarer Größe. Dies ist ein Layout- und Bediennachweis; die echte AAC-Sperre wird weiterhin separat auf einem Gerät getestet.

## Task 7: Antwortbereiche und Medien kompakt und vollständig gestalten

**Files**

- Modify: `Resources/Exam/question-renderer.js`, `exam.css`
- Extend: `LayoutTests/Fixtures/`, `SecureWebLayoutTests.swift`, `ScriptTests/renderer.test.cjs`

**Interfaces**

- Consumes: bestehende Antwortformen, mathematische Darstellung und Inhaltslokalisierung.
- Produces: einheitliche Frage-/Antwortgliederung und eindeutige Klassen für ausgewählt, ungewählt und Fokus. Die Klassen sind Darstellung; Antwortwerte stammen weiter aus denselben Feldern.

- [ ] **Step 1: Repräsentative Inhaltsfälle hinterlegen.** Sehr lange Frage, lange Antwortoption, Formel mit Bruch/Potenz, Lückentext mit mehreren Lücken, Paarzuordnung, lange Gruppennamen, Bildoptionen, Höraufgabe mit verborgenem Fragetext und Audioantworten. Alle Inhalte künstlich und ohne echte Schülerdaten.
- [ ] **Step 2: Frage und Antwort optisch verbinden.** Nummer/Punkte kompakt, Frage gut lesbar, dann Antwortbereich. Antwortzeilen erhalten erkennbare Auswahl und volle erreichbare Fläche. Große unbegründete Zwischenräume entfernen, aber lange Fragen nicht in feste Höhen zwingen.
- [ ] **Step 3: Medienregeln erhalten.** Notwendige Bilder bleiben bei der Frage. Listening-only bleibt listening-only. Bilder skalieren vollständig, Audio passt in die Breite. Fehler am Medium werden direkt dort angezeigt; fehlende Medien erzeugen keine eigene automatische richtige Antwort.
- [ ] **Step 4: Eingabefälle und Daten prüfen.** Formelausgabe bleibt maskiert; Lehrertext kann kein Skript einschleusen. Antworten vor und nach der CSS-/DOM-Umstellung stimmen für alle elf Typen überein.
- [ ] **Step 5: Screenshot- und DOM-Prüfung ausführen.** Kein abgeschnittener Fragetext, keine unsichtbare Auswahl, keine Verwechslung von angeklickter Option mit Bearbeitet-Haken. Layout bei 320 und bei 1366 logischen Einheiten prüfen.
- [ ] **Step 6: Commit.** `style(secure): clarify questions answers and media layouts`.

**Abnahme:** Eine Aufgabe lässt sich als Einheit lesen. Platz wird sinnvoll genutzt, ohne Inhalt zu verstecken. Medien sind nicht pauschal in einen optionalen Reiter verbannt, wenn sie für die Aufgabe gebraucht werden.

## Task 8: Abgabe, offene Aufgaben und gesperrte Zwischenzustände sauber darstellen

**Files**

- Modify: `Sources/SecureStagingRootView.swift`, `SecureStatusView.swift`, `SecureExamCoordinator.swift`
- Modify: `Resources/Exam/native-exam.js`, `question-navigation.js`
- Extend: `Tests/SecureExamPolicyTests.swift`, `ScriptTests/renderer.test.cjs`, `navigation.test.cjs`, native Status- und Interaktionstests

**Interfaces**

- Consumes: `answeredCount` aus Task 4 und Gesamtzahl aus dem aktuellen nativen Paper für die unverbindliche offene Anzahl.
- Consumes: vorhandenes `submit(auto: Bool)`, `gcFreezeAnswers()`, Quittungsprüfung und `SecureOperationGate`.
- Produces: verständliche Bestätigung mit optionaler offener Anzahl. Fehlt eine gültige aktuelle Anzahl, bleibt die neutrale Bestätigung möglich; UI-Zusammenfassung wird nicht zur neuen Voraussetzung einer Abgabe.

- [ ] **Step 1: Sicherheitsnahe UI-Fälle zuerst prüfen.** Manuelles Abgeben bei offenen Aufgaben, alle bearbeitet, Zeitablauf mit offener Übersicht, Zeitablauf mit offenem Abgabedialog, WebView-Neustart während Abgabe und verspätete alte Antwort nach neuem Versuch. Bestehende Gate- und Freeze-Tests bleiben Teil der Abnahme.
- [ ] **Step 2: Bestätigung konsistent beschriften.** „Noch 3 Aufgaben offen. Trotzdem abgeben?“ mit „Weiterarbeiten“ und „Jetzt abgeben“. Bei unbekannter Zusammenfassung „Antworten verbindlich abgeben?“. Die Zusammenfassung ist kein Bewertungsergebnis.
- [ ] **Step 3: Automatische Abgabe ohne neue Dialogsperre erhalten.** Countdown läuft weiter. Erreicht er null, schließt ein eventuell sichtbarer normaler Abgabedialog beziehungsweise verliert seine Handlungswirkung; die bisherige automatische Abgabe läuft genau einmal an. Nicht erst auf einen Klick in der Übersicht warten.
- [ ] **Step 4: Oberfläche beim Freeze sperren.** Navigations- und Antwortaktionen nehmen nach Freeze keine neue Bearbeitung an. Der native Zustand verdeckt den Inhalt bei Unterbrechung synchron. Neue Zustandsanzeigen folgen demselben Versuch und seiner Generation.
- [ ] **Step 5: Erfolgs- und Wiederholungsseiten prüfen.** Serverannahme allein bedeutet noch nicht, dass Apple AAC bereits beendet hat. Lokale Sicherung allein bedeutet noch keine Serverabgabe. Netzwerkfehler führen zum bestehenden Wiederholungsweg, nicht zum grünen Abschluss.
- [ ] **Step 6: Gesamte bisherigen Sicherheitsprüfungen ausführen.** Swift-, Renderer-, Navigations- und WebKit-Prüfungen müssen grün sein. Zusätzlich ein kontrollierter physischer Durchlauf gemäß Abschnitt 8 nach dem neuen TestFlight-Build.
- [ ] **Step 7: Commit.** `fix(secure): align submission UI with verified exam lifecycle`.

**Abnahme:** Die neue Gestaltung ändert keinen Weg zur Freigabe und verbirgt keine offenen Abgabeprobleme. Ein UI-Haken oder ein grüner Aufgabenknopf kann weder eine Abgabe bestätigen noch das iPad entsperren.

## Task 9: Layout-Gates, Sichtprüfung und TestFlight-Abnahme abschließen

**Files**

- Modify: `native/GradeCrewSecure/verify-on-mac.sh`
- Modify: `.github/workflows/gradecrew-secure-testflight.yml`
- Extend: `LayoutTests/run_layout_checks.py`, `layout-policy.json`
- Create: `docs/secure/evidence/<release-date>-layout/status.md` und zugehörige Ergebnisübersicht
- Existing: `verify_distribution.py` und `Config/StagingInfo.plist` bleiben Auslieferungsgates

**Interfaces**

- Consumes: alle vorherigen Prüfsuiten und Berichtsschemata.
- Produces: verpflichtenden Layout-Smoke in der normalen Secure-Pipeline, vollständige Matrix vor TestFlight-Auslieferung und hochgeladene Berichte auch im Fehlerfall.
- Produces: Release-Nachweis mit Quellcommit, Build, CI-Link, App-/Profil-AAC, Uploadstatus, Apple-Verarbeitung und getrenntem Nutzer-/Geräteprotokoll.

- [ ] **Step 1: Prüfbefehle und Abhängigkeiten anbinden.** Vorhandenes gepinntes jsdom wiederverwenden. Neue DOM-Suiten explizit starten; die Python-/Swift-Prüfungen behalten. Der Layout-Testhost wird nur im Simulator ausgeführt und nie Teil der IPA.
- [ ] **Step 2: Gesamte Matrix aus Abschnitt 5 ausführen.** Keine fehlenden Screenshots, kein stiller Skip, keine alten Berichte im neuen Ergebnisordner. Eine Überschreitung blockiert den Layout-Release, bis sie behoben und nachgeprüft ist.
- [ ] **Step 3: Galerie sichtbar prüfen.** Einstieg, normale Prüfung, lange Frage, offene Übersicht, Tastatur, große Schrift, Warnung und Erfolg mindestens auf kleinem und großem iPad ansehen. Checkliste aus Abschnitt 7 abzeichnen; automatische Geometrieprüfung genügt hierfür nicht.
- [ ] **Step 4: Gegen Quellstand und Produktumfang prüfen.** Diff enthält keine Production-/Backend-/Lehrkräfte-Änderung und keinen AAC-Vorschaufallback. Antworten und Deadline-Vertrag sind unverändert. Vorhandene Upload-Sicherungen werden nicht übersprungen.
- [ ] **Step 5: Neue Version über dieselbe Secure-TestFlight-Pipeline liefern.** Vorgesehene Version ist 0.2.2, sofern diese Nummer bei Ausführung noch frei ist; sonst die nächste freie Secure-Patchversion. Buildnummer folgt weiterhin der vorhandenen Pipelineformel. AAC muss im signierten App-Paket und Profil vorhanden sein; Staging-Modus muss in der tatsächlich gebauten Info-Datei stehen.
- [ ] **Step 6: Gerätetest aus Abschnitt 8 durchführen und protokollieren.** Erst nach Apples Verarbeitung die tatsächlich installierte Version notieren. Frühe Abgabe und Zeitablauf für diesen Build wiederholen; alte Testergebnisse gelten nicht automatisch für die neue Oberfläche.
- [ ] **Step 7: Abschlusscommit und Übergabe.** `docs(secure): record layout matrix and physical pilot results`. Nur belegte Ergebnisse als bestanden markieren.

**Abnahme:** Die Version ist nicht nur gebaut, sondern anhand derselben definierten Fälle beurteilt. Für eine noch fehlende Geräteprüfung steht ausdrücklich „offen“. Fehlende Internetverbindung über die bekannte Frist hinaus wird nicht als gelöster Offline-Modus dargestellt.

---

## 5. Automatische Größen- und Zustandsmatrix

Die Maße sind logische verfügbare Inhaltsgrößen. Sie sind keine Behauptung, dass jedes Gerät in jedem AAC-Modus genau dieses Fenster anbietet. Die Matrix erzwingt robustes Layout, ohne zehn physische Geräte zu benötigen.

| Fall | Breite × Höhe | Hauptzweck |
|---|---:|---|
| iPad mini hoch | 744 × 1133 | Kleiner voller Tablet-Bereich |
| iPad normal hoch | 834 × 1194 | Hauptfall |
| iPad groß hoch | 1024 × 1366 | Breitenbegrenzung und ruhige Zentrierung |
| iPad mini quer | 1133 × 744 | Weniger Höhe, viel Breite |
| iPad normal quer | 1194 × 834 | Lange Aufgaben und Navigation |
| iPad groß quer | 1366 × 1024 | Keine überbreiten Lesetexte |
| Schmaler verfügbarer Bereich | 507 × 1024 | Umbruch der Leisten |
| Sehr schmaler Bereich | 390 × 844 | Kompaktes Formular und Navigation |
| Extrem schmaler Bereich | 320 × 1024 | Keine versteckten oder abgeschnittenen Aktionen |
| Geringe Inhaltshöhe | 834 × 380 | Tastaturnähe und kompakte Übersicht |

### Drei Prüfgruppen

**Native Zustandsgruppe:** Zehn Viewports × zwei Geräteeinstellungen (hell/dunkel) × drei Textgrößen (`large`, `xxxLarge`, `accessibility3`) × fünfzehn Szenarien. Szenarien sind Einstieg leer, Einstieg bereit, Codefehler, Vorprüfung, Prüfungsstart, Warten, Prüfung normal, Prüfung langer Titel, Netzwerkhinweis, Speicherfehler, Abgabe senden, Abgabe bestätigen, Wiederaufnahme, Unterbrechung und Erfolg. Das ergibt **900 statische Fälle**. Die vollständigen Fall-IDs werden aus diesen Achsen erzeugt; der Bericht muss alle 900 ausweisen.

**Web-Inhaltsgruppe:** Zehn Viewports × drei Schriftfaktoren × sechs Inhaltssets × zwei Übersichtszustände (geschlossen/geöffnet). Sets sind alle elf Typen gemischt, 30 kurze Aufgaben, 100 kurze Aufgaben, lange Frage/Antworten/Formeln, Bild-/Audioantworten sowie Teilausfüllung/Wiederaufnahme. Das ergibt **360 statische Fälle**. Schriftfaktoren werden aus den korrespondierenden nativen Testschriftgrößen berechnet, nicht willkürlich als echter Dynamic-Type-Nachweis bezeichnet.

**Interaktionsgruppe:** Zwölf tatsächliche Bedienabläufe auf einem kleinen und einem großen iPad-Simulator, also **24 Ablaufprüfungen**: direkter Sprung, Vor/Zurück, Grenze erster/letzter Eintrag, Text leeren, Sortieren bestätigen, Übersicht mit Tastatur, Bildnachladen, Audio pausieren, reduzierte Bewegung, Freeze, Renderer-Neustart und manuelles Scrollen. Diese Fälle prüfen Verhalten und Geometrie vor/nach der Handlung; ein Screenshot allein beweist keinen gelungenen Klick. Sind die zwei Simulatorgrößen lokal nicht installiert, meldet der Läufer die fehlende Abdeckung, statt einen logischen Viewport als zweiten Hardware-Simulator auszugeben.

**Alltags-Smoke:** Zwei Viewports (normal und extrem schmal) × zwei Geräteeinstellungen × zwei Textgrößen × fünf native Szenarien (Einstieg leer/bereit, Prüfung, Fehler, Erfolg) ergeben 40 native Fälle. Zwei Viewports × zwei Schriftfaktoren × zwei Inhaltssets (elf Typen und 30 Aufgaben) × zwei Übersichtszustände ergeben 16 Webfälle. Dazu kommen die gezielten Navigations- und Freeze-Abläufe auf dem verfügbaren iPad-Simulator. Der Smoke ersetzt vor Auslieferung nicht die vollständige Matrix.

Eine konkrete Laufzeit wird erst nach dem ersten echten Lauf angegeben. Der TestFlight-Workflow erhält getrennte `layout-native`- und `layout-web`-Jobs, damit nicht alle Aufnahmen zusätzlich in das bisherige 40-Minuten-Fenster von `build-and-upload` gedrückt werden. `build-and-upload` hängt über `needs` von beiden grünen Layoutjobs ab; die Reports werden mit dem exakten Quell-SHA verknüpft. Die Interaktionsgruppe gehört zum Web-Layoutjob. Eine spätere Aufteilung in weitere Pakete richtet sich nach gemessener Laufzeit und Kosten. Ein langsamer erster Lauf rechtfertigt Optimierung, aber kein stilles Streichen schwieriger Fälle.

### Messbare Regeln pro Fall

- Gesamter Inhaltsüberlauf nach rechts maximal 1 logische Einheit. Absichtlich horizontal scrollbare Nummernreihe ist separat gekennzeichnet und geprüft.
- Crew/Logo/Formular beziehungsweise vergleichbare Hauptaktionen liegen innerhalb 1,5 Einheiten auf der vorgesehenen Achse.
- Jede tatsächlich interaktive Fläche mindestens 44 × 44; Hauptfelder und Hauptaktionen mindestens 52 hoch vor größerem Schriftbedarf.
- Beschriftungen sind nicht abgeschnitten. Ein vollständig sichtbarer Feldrahmen mit abgeschnittener Schrift besteht die Prüfung nicht.
- Fokus und Zielüberschrift liegen nach einer Aktion im verfügbaren Sichtbereich. Für Scrollziele zählt die angeheftete Leiste mit.
- Auswahl-, Warn- und Bearbeitungszustände sind in Text und Grafik unterscheidbar.
- Bildseitenverhältnis bleibt erhalten; kein Bild wird durch einen festen Ausschnitt passend gerechnet.
- Keine Behebung durch `overflow:hidden` auf der Gesamtseite, erzwungene Schriftverkleinerung oder Weglassen der Aktion.
- Fehlende Ergebnisse, Testabbruch oder eine nicht gefundene Testressource ergeben Rot.

## 6. Verbindliche Regressionstabelle für Bearbeitungszustände

| Eingabehandlung | Erwarteter Zustand | Zusätzlich nachweisen |
|---|---|---|
| Single Choice laden | Offen | Keine vorausgewählte Option erfunden |
| Eine Option wählen | Bearbeitet | Haken/Zähler ändern sich zusammen |
| Eine falsche Option wählen | Bearbeitet | Keine Bewertung oder Lösung geladen |
| Multi wählen, dann alles abwählen | Bearbeitet, danach offen | Zustand fällt korrekt zurück |
| Wahr/Falsch auf Falsch | Bearbeitet | Zeichenfolge `false` bleibt gültig |
| Zahl Null eingeben | Bearbeitet | Kein `if (!value)`-Fehler |
| Freitext nur Leerzeichen | Offen | Sichtbarer Feldinhalt ist nicht automatisch vollständig |
| Eine von drei Lücken füllen | Begonnen | Zusammenfassung zählt Aufgabe weiter als offen |
| Alle Lücken füllen | Bearbeitet | Jede tatsächlich vorhandene Lücke erfasst |
| Eine Zuordnung vergessen | Begonnen | Nicht nur irgendeinen Objektwert zählen |
| Gruppierung vollständig | Bearbeitet | Erwartete Einträge aus dem Secure-Paper, nicht aus anderer Website-Struktur |
| Sortierliste nur anzeigen | Offen | Voreingestellte Reihenfolge reicht nicht |
| Ausgangsreihenfolge bestätigen | Bearbeitet | Antwortarray bleibt unverändert |
| Reihenfolge ändern, sichern, wiederherstellen | Bearbeitet | Metadatum und Antwortrevision passen zusammen |
| Alten Versuch ohne Metadaten laden | Antworten erhalten | Keine Dekodierfehler; Sortierung konservativ offen |
| Wort markieren und wieder entfernen | Bearbeitet, danach offen | Gleiches bei farbigen Markiergruppen |
| Nur Aufgabennummer anklicken | Unverändert | Kein neues Antwort-Snapshot nur wegen Navigation |
| Nach endgültigem Freeze klicken | Unverändert | Erstes endgültiges Antwortpaket bleibt identisch |

Diese Regeln werden für `answer` und `touchedQuestionIds` überprüft. Der native UI-Zähler bekommt nur geprüfte IDs des aktuellen Papers. Er ist keine zusätzliche Bewertungsinstanz und keine Voraussetzung für serverseitige Annahme.

## 7. Menschliche Sichtprüfung

Eine fachlich grüne Testmatrix kann trotzdem eine unruhige Oberfläche liefern. Vor Auslieferung wird deshalb die Galerie mit folgenden Fragen angesehen und ein konkreter Befund pro Problem notiert:

1. Ist am Einstieg sofort sichtbar, wo Code und Name hingehören? Wirkt die Hauptaktion aktiv beziehungsweise nachvollziehbar noch gesperrt?
2. Sind Crew und Logo vollständig, scharf und auf derselben Achse? Nimmt die Crew zu viel Höhe ein?
3. Sind Aufgaben und Eingabefelder optisch voneinander unterscheidbar, ohne wie verschachtelte weiße Kästen zu verschwimmen?
4. Ist der aktuelle Ort in der Prüfung auf einen Blick erkennbar? Bleibt eine bearbeitete aktuelle Aufgabe zugleich grün und blau umrandet?
5. Brauchen Nummernübersicht oder Statusmeldungen unverhältnismäßig viel Platz gegenüber Frage und Antwort?
6. Bleiben Timer und Abgeben ruhig angeordnet, wenn ein Titel lang oder die Schrift groß ist?
7. Kann man eine Frage mit den dazugehörigen Optionen als Einheit lesen? Sind Medien dort, wo man sie zum Verstehen braucht?
8. Unterscheidet sich ein Verbindungsproblem sichtbar von einem erfolgreichen Abschluss? Ist der Hinweis konkret, ohne den Bildschirm mit technischem Text zu füllen?
9. Ist alles auch in der dunkel eingestellten Simulatorumgebung lesbar?
10. Fühlt sich die Oberfläche noch nach GradeCrew an, ohne zusätzliche Spielerei in einer Prüfung?

Unstimmigkeiten werden mit Fall-ID, Screenshot und betroffener Komponente festgehalten. Danach wird nur die betroffene Änderung mit ihren Nachbarfällen erneut geprüft; die abschließende vollständige Matrix erfolgt am endgültigen Release-Quellstand.

## 8. Physisches iPad-Protokoll für den neuen Build

Das bereits positive Nutzerfeedback wird anerkannt. Nach Änderungen an Kopf, Navigation, Fokus und Abgabedialog wird der reale Ablauf dennoch erneut geprüft, weil diese Elemente mit Tastatur, Zeitablauf und WebView-Lebenszyklus zusammenwirken.

| Protokollfeld | Einzutragen |
|---|---|
| Gerät | Tatsächliches iPad-Modell |
| Betriebssystem | Tatsächliche iPadOS-Version |
| App | Installierte Secure-Version und Buildnummer |
| Umgebung | Staging, veröffentlichter Testcode; kein echter Schülername |
| Testinhalt | Mindestens mehrere Aufgabenarten, ein Bild und eine Höraufgabe, soweit im Test vorhanden |
| Zeitlimit | Beispiel fünf Minuten; gültig ist das vom Test vorgegebene Limit |
| Frühe Abgabe | Zeitpunkt, sichtbarer Ablauf, Serverabgabe und Freigabe |
| Zeitablauf | Beobachtetes Einfrieren, automatische Abgabe, Freigabe |
| Navigation | Nummern, aktuelle Aufgabe, Grün, Vor/Zurück und große Übersicht |
| Eingabe | Bildschirmtastatur; externe Tastatur, falls verfügbar |
| Ergebnis | Bestanden, konkreter Fehler oder nicht getestet |

Ablauf:

1. Neue Version in TestFlight installieren und Buildnummer notieren. Code und vereinbartes Kürzel eingeben.
2. Vor Beginn Lesbarkeit und Tastaturbedienung prüfen. Dunkle Geräteeinstellung darf keine unsichtbare Schrift erzeugen.
3. AAC bestätigen. Nach sichtbarem Start zuerst Aufgabe 1 beantworten, zu einer späteren Aufgabe springen und zurückkehren. Antwort muss erhalten sein.
4. Eine Antwort ändern und wieder leeren. Nummer und Zähler müssen den Zustand nachvollziehbar ändern.
5. Eine Sortieraufgabe zunächst nur ansehen; noch kein Grün. Anschließend Reihenfolge bestätigen oder umordnen; danach Grün.
6. Eine Höraufgabe starten und über die Nummern zu einer anderen Aufgabe springen. Wiedergabe pausiert, Abspielposition bleibt erhalten.
7. Ersten Durchlauf frühzeitig abgeben. Offene Anzahl darf informieren, aber keine Zwangsantwort verlangen. AAC endet erst nach bestätigter Abgabe.
8. Zweiten Durchlauf mit geöffneter Übersicht oder normalem Bestätigungsdialog bis zum Zeitende laufen lassen. Ohne weiteren Klick muss eingefroren und abgegeben werden. Nach bestätigter Abgabe wird das iPad freigegeben.
9. In Staging prüfen, dass pro Versuch eine Abgabe mit den erwarteten Antworten vorliegt. Die UI-Farbe ersetzt diesen Abgleich nicht.
10. Eine kurze kontrollierte Verbindungsunterbrechung nur mit ausreichend Zeitreserve prüfen. Lokale Sicherung und spätere Abgabe getrennt protokollieren. Keine behauptete Abnahme eines langen Offline-Ausfalls.

Jeder veröffentlichte und aktuell freigegebene Staging-Test kann nach dem bestehenden Serververtrag verwendet werden. Der Fünf-Minuten-Test ist ein Testfall für die Zeitsteuerung, keine besondere Klasse von Secure-Testcodes.

## 9. Auslieferungs- und Rückfallstrategie

Die Implementierung erfolgt auf einem eigenen Arbeitsbranch beziehungsweise einem passenden isolierten Arbeitsstand nach Prüfung der vorhandenen Worktrees. Der bekannte ausgelieferte Quellstand und seine Evidenz bleiben auffindbar. Keine Änderungen an Production aufgrund eines erfolgreichen Simulatorbilds.

Vor TestFlight müssen die neue Layoutprüfung, alle bisherigen Prüfungen, das Gerätearchiv und die signierte AAC-/Profilkontrolle bestehen. Die bestehende Prüfung auf `GradeCrewSecureMode=staging-exam` bleibt verpflichtend. Die neue Version wird erst als verfügbar bezeichnet, wenn Apples Verarbeitung beziehungsweise die tatsächliche Sichtbarkeit geprüft ist; ein Upload allein belegt nur die Übertragung.

Bei einem Layoutproblem wird zuerst die konkrete betroffene Komponente zurückgenommen oder korrigiert. Die Antwortformate und der Serververtrag bleiben absichtlich gleich, damit ein reines Layoutproblem keine Datenmigration voraussetzt. Laufende Versuche werden durch ein neues Layout nicht aktiv gelöscht. Ein TestFlight-Rückwechsel ist vor Einsatz mit gespeicherten Versuchen zu prüfen; er ist keine pauschale Garantie für beliebige Versionssprünge.

Abschlussbedingungen sind getrennt zu berichten: lokal implementiert, auf GitHub vorhanden, CI bestanden, signiertes Paket geprüft, hochgeladen, bei Apple verarbeitet, auf iPad installiert und dort getestet. Für einen nicht erfolgten Schritt bleibt das Feld offen. Eine flächendeckende Schulfreigabe setzt zusätzlich die noch getrennt geplanten Ausfall- und Lehrerfreigaberegeln voraus.

## 10. Aufwand und sinnvolle Grenzen

Die Hauptarbeit liegt nicht darin, die vorhandenen Nummernknöpfe optisch zu kopieren. Sie liegt in einheitlichen Bearbeitungsregeln, Wiederherstellung, Scrollgeometrie, Tastatur, großen Schriften und der Abnahme neben der bestehenden sicheren Abgabe.

Als grobe Planung sind vier bis sieben konzentrierte Entwicklungstage einschließlich Korrekturen und zusätzlicher Geräteabnahme plausibel: etwa ein Tag für Einstieg/Farben und Testgrundlage, ein bis zwei für Zustände/Navigation, ein bis zwei für tatsächliche Größen-/Eingabefälle und ein bis zwei für Prüfung, Nacharbeit und Auslieferung. Diese Spanne ist eine Schätzung und keine gemessene Zusage. Apple-Verarbeitung und menschliche Geräteprüfung können den Kalender zusätzlich verlängern. Nach Task 1 und dem ersten vollen Matrixlauf wird die Schätzung anhand echter Befunde angepasst.

Nicht sinnvoll wäre es, gleichzeitig einen vollständigen nativen Aufgabenrenderer, eine neue Homepage, einen Dunkelmodus, neue Crew-Animationen und einen Offline-Serververtrag zu bauen. Der beschriebene Umfang liefert zuerst eine vollständige, gut lesbare Secure-Prüfungsoberfläche mit dem gewünschten Website-Verhalten. Weitere Themen bleiben getrennt sichtbar, statt mitten in diesem Layoutauftrag unbemerkt mitzuwachsen.

## 11. Nachvollziehbare Erfüllung der Nutzerwünsche

| Nutzerwunsch | Zuständige Umsetzung | Nachweis |
|---|---|---|
| Weniger Weiß auf Weiß | Task 2 und 3 | Farben, native Zustandsmatrix, dunkle Geräteeinstellung |
| Schön, klar und übersichtlich | Task 2, 3, 7 | Gemeinsame Achsen, Breiten, Hierarchie und Sichtprüfung |
| Crew erkennbar | Task 2 und 3 | Vollständige vorhandene Assets ohne Beschneidung |
| Aufgaben oben anklicken | Task 5 und 6 | Echte WK-Sprünge, richtige IDs, sichtbare Zielüberschrift |
| Aufgaben werden grün | Task 4 und 5 | Vollständigkeit je Typ, Leeren, Wiederherstellen |
| Verhalten wie Website | Task 4 bis 7 | Nummern, aktuelle Aufgabe, Vor/Zurück und Übersicht, unter Beachtung des Secure-Datenvertrags |
| Sichere Prüfung bleibt funktionierend | Task 8 und 9 | Bestehende Tests plus erneute frühe/zeitgesteuerte Geräteabgabe |
| Auf verschiedenen iPads passend | Task 1, 6 und 9 | Matrix mit Geometrie, echten Komponenten und Galerie |
| Sehr ausführlicher weiterführender Plan | Spec plus dieser Plan | Dateikarte, neun Pakete, Interfaces, Regeln, Tests und Abnahme |

## 12. Selbstprüfung dieses Plans

- Gestaltung und technische Umsetzung verwenden dieselben Farbwerte, Größen und Bearbeitet-Regeln.
- Der native Rahmen und die Webnavigation haben getrennte Zuständigkeiten; kein doppelter Sticky-Abstand.
- Alle neuen Interfaces werden beim erzeugenden Paket benannt und von Folgetasks unter demselben Namen verwendet.
- Die Migration gespeicherter Antworten ist ausdrücklich rückwärtskompatibel; neue UI-Daten sind optional.
- Es wird keine fachliche Richtigkeit aus der grünen Markierung abgeleitet.
- Die fünf wichtigsten Fehlerklassen aus Review Focus besitzen zugeordnete Prüfungen.
- Größenmatrix und Sichtprüfung ersetzen keinen AAC-Gerätetest und behaupten keine universelle Fehlerfreiheit.
- Der Plan enthält keine Produktänderung, keinen Deploymentauftrag an Production und keinen bereits erledigten neuen TestFlight-Build.
