# Emmi – Gesamten Test überarbeiten V1

Task: `GC-CREW-AI-02`

## Ziel

Emmi gehört in die Überarbeitungsoberfläche des Editors. Lehrkräfte sollen nicht nur einzelne Aufgaben mit KI ändern, sondern dem gesamten Test einen freien Überarbeitungsauftrag geben können, z. B.:

- „Formuliere alles einfacher, behalte aber die Lernziele.“
- „Mach den Test anspruchsvoller und baue mehr Transfer ein.“
- „Kürzer und klarer, weniger offensichtliche Antwortmöglichkeiten.“
- „Nutze mehr Multiple Choice und weniger Freitext.“

Die Funktion erzeugt eine neue ungespeicherte Revision im bestehenden Editor. Sie veröffentlicht oder speichert niemals automatisch.

## Branch und Review

- Branch: `feature/emmi-whole-test-revision-v1`
- Basis: `feature/crew-assistant-v1`
- Draft-PR: #13 `Emmi V1: gesamten Test im Editor überarbeiten`
- geprüfter Code-Head: `c29131428dc781ceaf0a021ec6ca058e7eb9a830`
- finaler Code-CI: `Crew Assistant Checks` Run `36933680142` ✅
- Production: unverändert
- Staging: nicht aus diesem Branch deployed
- Gerätetest: noch offen

## Produktprinzip: Tier in seiner Oberfläche

- **Coco**: Orientierung / Einstieg / Dashboard / Hilfe
- **Remy**: Test erstellen / Erstellungsoberfläche
- **Emmi**: Aufgaben und ganzen Test überarbeiten / Editor
- **Wilma**: Bewertung, Ergebnisse und Lernstandsinterpretation / Auswertung

Alle Tiere sollen langfristig denselben Crew-Assistant-Core und denselben Voice-/Action-Contract nutzen. Es werden keine vier getrennten KI-Systeme gebaut.

## Implementiert

### Editor-Oberfläche

`emmi-whole-test-revision.mjs`

- Emmi/Fuchs direkt im `editorView`
- Bereich „Gesamten Test überarbeiten“
- freies Textfeld für natürliche Lehrerwünsche
- Beispielchips: einfacher, anspruchsvoller, mehr Transfer, kürzer/klarer, Antwortoptionen verbessern
- erster Diktierknopf als Browser-Progressive-Enhancement
- Status während der Überarbeitung
- Ergebniszusammenfassung: geändert / unverändert / geschützt / verworfene unsichere Änderungen
- „Ganze Überarbeitung rückgängig“
- keine automatische Speicherung oder Veröffentlichung

### Editor-State

`app.js`

- eigener Running-State und Whole-Test-Undo-Snapshot
- genau ein gebündelter `aiApi.reviseWholeTest(...)`-Aufruf
- vor dem Einsetzen wird geprüft, ob Test, Nutzer und Aufgaben seit Start unverändert geblieben sind
- Ergebnis wird über den bestehenden Normalizer in die normalen GradeCrew-Aufgabenmodelle überführt
- bestehende Aufgaben-IDs und Reihenfolge bleiben erhalten
- bestehende Bilder werden wieder an die überarbeitete Aufgabe angehängt
- Bildantwort-Aufgaben bleiben komplett unverändert
- Änderungen bleiben zunächst nur im Editor und werden als dirty markiert

### Server

`functions/lib/whole-test-revision.js` + `functions/main.js`

- eigener Callable `reviseWholeTest`
- bestehende Teacher/Admin-Autorisierung
- zählt als Test-Level-KI-Aufruf im vorhandenen Test-Quota
- ein gebündelter Request statt eines Requests je Aufgabe
- `store:false`
- strict Structured Output
- gleiche Aufgabenanzahl und Reihenfolge
- Punktwert jeder einzelnen Aufgabe wird serverseitig auf den ursprünglichen Wert zurückgesetzt
- Aufgabentypen bleiben standardmäßig gleich; Typwechsel nur bei ausdrücklichem Lehrerwunsch
- gesperrte Aufgaben werden serverseitig auf das Original zurückgesetzt
- ungültige KI-Aufgaben werden nicht eingesetzt, sondern auf die jeweilige Originalaufgabe zurückgesetzt
- vorhandene Bilder werden nicht neu generiert
- Nutzungsmetadaten speichern nur Zähler/Modell/Operation/Längen, nicht den kompletten Test oder den Lehrerwunsch

## API-/Kostenprinzip

Die Gesamtüberarbeitung ist bewusst **ein Test-Level-Aufruf** statt 10–30 Einzelaufrufen. Dadurch werden Systemprompt, Lehrerwunsch und Testkontext nicht für jede Aufgabe erneut übertragen. Einzelne Nachkorrekturen bleiben anschließend weiterhin über die vorhandene „KI bearbeiten“-Funktion möglich.

## Validierung

Finaler Code-Stand `c29131428dc781ceaf0a021ec6ca058e7eb9a830`: GitHub Actions `Crew Assistant Checks` Run `36933680142` vollständig grün.

Geprüft wurden:

- bestehender Crew-Core
- Emmi-Browsermodul-Syntax
- statische Editor-Verkabelung
- Client-Callable-Verkabelung
- keine Auto-Save-/Auto-Publish-Aufrufe im Emmi-Panel
- Serververtrag der Crew
- Emmi Whole-Test Unit Tests
- exakte Aufgabenanzahl im Schema
- Punkteerhalt
- gesperrte Aufgaben
- Fallback bei ungültigem KI-Ergebnis
- Schutz vor stillen Aufgabentypwechseln
- Functions-Syntax und ESLint

## Noch offen

1. Staging-only Deploy nach Koordination
2. echter Desktop-/iPad-/iPhone-Test
3. echter Runtime-KI-Test mit verschiedenen Testgrößen
4. visuelle Feinabnahme des Emmi-Panels im Editor
5. später kontrolliertes Speech-to-Text statt browserabhängiger Recognition
6. später Wilma direkt in der Ergebnisansicht und Coco kontextbezogen im Dashboard

## Nicht tun

- nicht direkt nach Production deployen
- nicht automatisch speichern/veröffentlichen
- nicht ungeprüft bestehende Bilder ersetzen
- nicht rohe Tests/Lehrerwünsche als Cache oder Telemetrie speichern
- nicht pro Aufgabe einen separaten Gesamtüberarbeitungs-API-Aufruf erzeugen
