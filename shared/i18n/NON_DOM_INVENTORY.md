# GradeCrew i18n – Nicht-DOM-Inventar vor Sprache 2

Stand: 2026-10-02. Die sichtbare Web-Oberfläche besitzt ab `feature/i18n-core-v1` eine gemeinsame Browser-i18n-Grenze. Dieses Inventar hält absichtlich die Bereiche fest, die **nicht** durch DOM-/Attribut-Lokalisierung gelöst werden und deshalb vor Aktivierung einer zweiten Sprache explizit angepasst werden müssen.

## Bereits vorbereitet, weiterhin nur Deutsch

- Browser-UI: gemeinsamer Bootstrap vor Lehrer-App und Secure-Student-Runtime; `de-DE` ist die einzige aktivierbare UI-Locale.
- System-/Startmeldungen: erster semantischer `de-DE`-Katalog.
- Locale-Verträge: UI-, Inhalts- und Bewertungssprache getrennt; Assessment-Snapshot; `Intl`-Formatter; striktes Zahlenparsing.
- Staging-Build: i18n-Module sind Teil der expliziten Build-Allowlist und werden im Build auf fehlende Referenzen geprüft.

## Vor Sprache 2 zwingend separat bearbeiten

### 1. CSV-/Datei-Exporte

`app.js` erzeugt Ergebnis-CSV und weitere Downloads außerhalb des DOM. Spaltenbezeichnungen wie Name/Aufgabe/Punkte/Prozent/Note/Status/Bearbeitungszeit sowie Ja/Nein müssen später über einen Export-Katalog laufen. Dateiformat und interne Statuswerte dürfen nicht anhand sichtbarer Übersetzungen geändert werden.

### 2. KI-Prompts und KI-Eingaben

`functions/lib/prompts.js` enthält derzeit deutsche System- und Qualitätsregeln. Das ist für den heutigen deutschen Produktstand korrekt und bleibt in Stufe 1 unverändert. Vor Sprache 2 müssen Prompt-Grundregeln, Inhaltssprache, Feedbacksprache und Bildungsregion getrennte strukturierte Parameter erhalten. Ein UI-Sprachwechsel darf niemals die Test-/Bewertungssprache implizit ändern.

### 3. Sprachabhängige Qualitätsvalidatoren

`functions/lib/validation.js` enthält bewusst deutsche Sprachlogik, unter anderem deutsche Kleinschreibung/Stopwörter, Satzbau-Erkennung, Komma-Fragen und sprachspezifische Heuristiken. Diese Regeln dürfen nicht generisch übersetzt werden. Vor Freigabe einer neuen Inhaltssprache braucht jede relevante Heuristik eine locale-/fachspezifische Strategie oder muss für diese Locale deaktiviert und zur Lehrerprüfung eskaliert werden.

### 4. Persistierte fachliche Inhalte

Titel, Aufgaben, Lösungen, Rubriken, Lehrerhinweise und Testbeschreibung sind Nutzer-/Prüfungsinhalt, keine UI-Texte. Sie werden nie automatisch durch einen UI-Sprachwechsel übersetzt. Vor Sprache 2 erhalten neue/veröffentlichte Tests explizite `contentLocale`-/`gradingLocale`-Metadaten und einen unveränderlichen Locale-/Policy-Snapshot.

### 5. Backend-Fehler und Diagnose

Maschinenlogik muss stabile Fehlercodes verwenden; sichtbare Texte werden am Client lokalisiert. Diagnose-/Support-JSON behält stabile technische Felder und IDs. Keine Geschäftslogik darf übersetzte Fehlermeldungen parsen.

### 6. Native Apps

Native Swift-Texte gehören nicht zum Web-Staging-Build. Sie erhalten separat String Catalogs/`Localizable.xcstrings` bzw. systemeigene Lokalisierung. Die hybride WebView darf die Web-UI-Locale verwenden, native Shell-Texte müssen jedoch separat geprüft werden.

### 7. Spiele

Spieltexte können später über dieselbe UI-Schicht laufen; sprachabhängige Rätsel, Wortspiele, Buchstabenanzahlen und Reime benötigen eigene validierte Varianten und dürfen nicht automatisch übersetzt werden.

## Freigabe-Gate für Sprache 2

Eine zweite UI-Locale darf erst aktiviert werden, wenn mindestens Browser-UI, Secure-Student, Exporte, KI-Promptvertrag, relevante Validatoren, Assessment-Locale-Snapshot, Accessibility, PDF/CSV und die tatsächlich angebotenen Spiele/Native-Flächen in einer Capability-Matrix geprüft sind. Bis dahin muss `SUPPORTED_BROWSER_UI_LOCALES` exakt nur `de-DE` enthalten.
