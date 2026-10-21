# GradeCrew i18n – Nicht-DOM- und Sprachabhängigkeits-Inventar

Stand: 2026-10-04. Deutsch (`de-DE`) und Englisch (`en-GB`) sind als Browser-UI-Sprachen aktiv. Dieses Inventar dokumentiert die Bereiche, die nicht durch DOM-/Attribut-Lokalisierung gelöst werden.

## Bereits aktiv / abgesichert

- Browser-UI: gemeinsamer Bootstrap vor Lehrer-App und Secure-Student-Runtime; `de-DE` und `en-GB` sind aktivierbar.
- Sprachumschaltung: persistent und reversibel; geschützte Test-/Nutzerinhalte werden nicht durch den UI-Wechsel verändert.
- Locale-Verträge: UI-, Inhalts- und Bewertungssprache sind getrennt.
- Testsprache: pro Test auswählbar; bestehende Aufgaben/Lösungen werden beim Wechsel nicht automatisch übersetzt.
- KI-Erstellung/-Überarbeitung: ausgewählte Testsprache wird explizit als Inhaltslocale übergeben.
- Normaler Test-Lifecycle: `contentLocale`, `gradingLocale` und Vertragsversion werden beim regulären Speichern mitgeführt.
- Aktive veröffentlichte Tests: die Testsprache darf clientseitig nicht still während der Durchführung geändert werden.
- Staging-Build: i18n-Module und Regressionstests sind Teil des geprüften Builds.

## Weiterhin separat zu bearbeiten

### 1. CSV-/Datei-/PDF-Exporte

Exporte entstehen außerhalb des DOM. Spaltenbezeichnungen, Metadaten und Datums-/Zahlendarstellung benötigen explizite Locale-Behandlung. Interne Statuswerte dürfen niemals anhand sichtbarer Übersetzungen geändert werden.

### 2. Sprachabhängige Qualitätsvalidatoren

`functions/lib/validation.js` enthält bewusst sprachspezifische Heuristiken. Deutsche Satzbau-/Komma-/Stopwortlogik darf nicht mechanisch ins Englische übersetzt werden. Für jede Inhaltssprache braucht die jeweilige Heuristik eine geprüfte Strategie oder eine Eskalation zur Lehrkraft.

### 3. Persistierte fachliche Inhalte

Titel, Aufgaben, Lösungen, Rubriken, Lehrerhinweise und Testbeschreibung sind Prüfungsinhalt, keine UI-Texte. Ein UI-Sprachwechsel verändert sie niemals. Eine spätere Funktion „bestehenden Test übersetzen“ darf nur als explizite Lehreraktion umgesetzt werden, mit Vorschau/Bestätigung und ohne Kopplung an den normalen UI-Sprachschalter.

### 4. Backend-Fehler und Diagnose

Maschinenlogik braucht stabile Fehlercodes. Sichtbare Meldungen werden clientseitig lokalisiert; Diagnose-/Supportdaten behalten stabile technische Felder und IDs. Geschäftslogik darf keine übersetzten Fehlermeldungen parsen.

### 5. Native Apps

Native Swift-/Android-Texte gehören nicht zur Browser-i18n. Sie benötigen systemeigene String-Kataloge. Eine hybride Shell darf die Web-UI-Locale übernehmen, muss native Texte aber separat lokalisieren und testen.

### 6. Spiele

Normale Spiel-UI kann denselben UI-Locale-Kontext verwenden. Sprachabhängige Rätsel, Wortspiele, Buchstabenanzahlen, Reime und Unterrichtsinhalte benötigen eigene validierte Varianten und dürfen nicht automatisch übersetzt werden.

### 7. Dynamische Legacy-UI

`app.js` und Erweiterungsmodule erzeugen weiterhin viele sichtbare Texte zur Laufzeit. Die zweite Sprache ist deshalb nicht mit einem einmaligen statischen Katalog fertig. Neue dynamische Lehrer-/Schüler-Flows brauchen Source-Catalog-/Pattern-Abdeckung und Regressionstests; langfristig sollten semantische Keys die Source-String-Migration ersetzen.

## Gate für weitere Sprachen

Vor einer dritten UI-Sprache müssen mindestens Browser-UI, Secure Student, Exporte, relevante Validatoren, Assessment-Locale-Lifecycle, Accessibility sowie angebotene Spiele/native Flächen in einer Capability-Matrix geprüft werden. Eine neue UI-Sprache darf weiterhin nicht automatisch zur Test- oder Bewertungssprache werden.
