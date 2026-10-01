# Aufgabe: GC-I18N-01 – Internationalisierungs-Fundament

- Aktualisiert (UTC): 2026-10-01T22:30:00Z
- Verantwortlicher Chat / Auftrag: Internationalisierung; zukünftige Mehrsprachigkeit so vorbereiten, dass Web-App, Lehrer-App, Schüleransicht, KI, Spiele und Exporte konsistent erweitert werden können.
- Aufgabenbranch: `feature/i18n-foundation-plan`
- Basiscommit: `28297ff03009bdf15e1230bf0c2533b63426cc9f`
- Betroffene Dateien: zunächst nur Dokumentation/Architektur. Spätere Umsetzung wird getrennt geplant.
- Überschneidungen mit anderen Aufgaben: Web-App, Crew-Assistent/Sprache, Emmi, Spiele, Design-System, iOS-App, Security/Submission, KI-Generator, Telemetrie.

## Ziel und gewünschtes Verhalten

GradeCrew soll später weitere Sprachen und Regionen ergänzen können, ohne Texte, KI-Prompts, Bewertungslogik, Curricula oder UI mehrfach hart zu verdrahten. Die deutsche Oberfläche bleibt zunächst unverändert. Internationalisierung wird als gemeinsame Plattformfähigkeit vorbereitet, nicht als nachträgliche Übersetzung einzelner Screens.

### Vier getrennte Dimensionen

1. **UI-Sprache**: Sprache der GradeCrew-Oberfläche, Navigation, Buttons, Hilfen und Systemmeldungen.
2. **Inhaltssprache**: Sprache eines Tests, Spiels, Arbeitsblatts oder einer Aufgabe. Sie darf von der UI-Sprache abweichen.
3. **Region / Bildungssystem**: Land/Region, Schulart, Lehrplan, Klassenstufenbezeichnungen, Notensystem, Datum/Zahlen/Währung/Einheiten und rechtliche Hinweise.
4. **KI-/Bewertungssprache**: Sprache, in der Aufgaben erzeugt, Antworten interpretiert, Hinweise formuliert und Freitext bewertet werden. Sie wird aus dem jeweiligen Inhalt abgeleitet und nicht blind aus der UI-Sprache.

Beispiel: Eine Lehrkraft kann GradeCrew auf Deutsch bedienen, einen Englischtest erstellen, ihn für eine bayerische Mittelschule konfigurieren und englische Schülerantworten bewerten lassen.

## Architektur-Grundsätze

### 1. Stabile Locale-IDs statt Sprachtexten im Code

- Standardisierte BCP-47-Tags verwenden, z. B. `de-DE`, `en-GB`, `en-US`, `fr-FR`.
- Interne Einstellungen speichern Locale-/Region-Codes, nicht sichtbare Namen wie „Deutsch“.
- Fallback-Kette definieren, z. B. `de-AT -> de -> de-DE/default` nur dort, wo fachlich sinnvoll.
- Default für den bestehenden Stand bleibt `de-DE`.

### 2. Alle UI-Texte über Schlüssel

Spätere Implementierung: keine neuen fest eingebauten sichtbaren Texte wie `"Neuer Test"`, sondern stabile Schlüssel, z. B. `tests.create.title`. Übersetzungsdateien sind versionierbar und getrennt vom Anwendungscode.

Zu übersetzen sind nicht nur Buttons, sondern auch:
- Formulare, Tooltips, Onboarding/Tutorial,
- Validierungs- und Fehlermeldungen,
- Dialoge, Toasts, leere Zustände,
- E-Mails/Benachrichtigungen,
- Hilfe-/Datenschutztexte,
- Spieltexte, Crew-Dialoge und Standardantworten,
- PDF-/CSV-/Exportbeschriftungen,
- Accessibility-Texte/ARIA/Alt-Texte.

Server/API geben bevorzugt **stabile Fehlercodes + strukturierte Daten** zurück; die sichtbare Übersetzung erfolgt im Client. Keine Geschäftslogik anhand übersetzter Fehlermeldungen.

### 3. UI-Sprache und Test-Sprache nie koppeln

Ein Test erhält ein explizites Feld wie `contentLocale`. Die Benutzeroberfläche erhält unabhängig davon `uiLocale`.

- Sprache des Tests wird beim Erstellen bewusst gesetzt oder aus dem Auftrag vorgeschlagen und bestätigt.
- Ein Sprachwechsel der Oberfläche darf einen existierenden Test niemals automatisch übersetzen.
- Ein Test darf nicht automatisch aufgrund des Browser-Locale umgeschrieben werden.
- Schüleroberfläche kann Systembedienung in ihrer UI-Sprache zeigen, während Aufgaben in der freigegebenen Inhaltssprache bleiben.

### 4. Prüfungsinhalte nicht still automatisch übersetzen

Bei Leistungsnachweisen verändert Übersetzung potenziell Schwierigkeit, Fachsprache und Lösungskriterien. Deshalb:
- Originaltext und Ursprungssprache erhalten.
- KI-Übersetzung nur als explizite Lehreraktion.
- Übersetzte Variante als eigene Version speichern.
- Vor Veröffentlichung Lehrkraft prüfen/freigeben lassen.
- Lösung, Rubrik, Distraktoren und Bewertungskriterien gemeinsam mit der Aufgabe übersetzen bzw. neu validieren.
- Keine bereits laufende Prüfung durch spätere Übersetzung verändern.

### 5. KI-Prompts internationalisierbar aufbauen

Prompts trennen in:
- stabile systemische Regeln,
- Region/Bildungssystem,
- Inhaltssprache,
- Fach/Klasse/Niveau,
- variable Lehrerwünsche.

Die KI muss explizit wissen, in welcher Sprache sie **Inhalt**, **Erklärung**, **Feedback** und **Metadaten** erzeugen soll. Sprachname nicht nur in Freitext einbetten, sondern strukturiert mitsenden.

API-Sparen bleibt möglich: gemeinsame stabile Prompt-Präfixe, gecachte sprachspezifische Regeln und lokaler Antwortkatalog pro Locale. Wiederkehrende Crew-Antworten werden je Sprache versioniert statt jedes Mal per KI erzeugt.

### 6. Freitextbewertung sprachbewusst

- Normalisierung darf sprachspezifisch sein (Groß-/Kleinschreibung, Akzente, Apostrophe, Unicode, Satzzeichen), aber fachliche Bedeutung nicht weg-normalisieren.
- Rechtschreibfehler und Fachfehler unterscheiden; Fach-/Sprachunterricht kann andere Regeln verlangen als Mathematik/GPG.
- Musterlösungen, Synonyme und Rubriken tragen ihre Sprache/Locale.
- KI-Bewertung nutzt Sprache der Schülerantwort und der Aufgabe; keine automatische Übersetzung als unsichtbaren Zwischenschritt ohne Nachweis.
- Unsichere Fälle wie bisher zur Lehrerprüfung markieren.

### 7. Region ist mehr als Sprache

Nicht `Deutsch = Deutschland` oder `Englisch = USA` annehmen. Separat modellieren:
- Schulart / Bildungssystem / Curriculum,
- Klassenstufenbezeichnungen,
- Notenskala und Bestehensgrenzen,
- Dezimal- und Tausendertrennzeichen,
- Datum/Uhrzeit/Zeitzone,
- Währung,
- Maßeinheiten,
- Papierformat A4/Letter,
- Adress-/Namensformate,
- rechtliche und Datenschutztexte.

Notenschlüssel bleiben Teil des Test-/Schulkontexts und dürfen durch einen UI-Sprachwechsel nicht verändert werden.

### 8. Zahlen, Datum, Plural und Grammatik über Locale-APIs

Keine manuelle String-Bastelei für `1 Aufgabe / 2 Aufgaben`, Datum oder Zahlen. Standard-Internationalisierungs-APIs verwenden (z. B. `Intl` im Web, systemeigene Formatter in nativen Apps). Damit funktionieren Pluralregeln, Dezimalzeichen, Datumsformate und relative Zeit korrekt.

### 9. Layout von Anfang an textflexibel

Übersetzungen können 30–100 % länger sein. Deshalb:
- keine zu engen festen Buttonbreiten,
- Text umbrechen lassen,
- keine Texte als Bestandteil von Bildern,
- dynamische Höhen,
- Pseudolocale-Test mit künstlich verlängerten Strings,
- mobile/iPad/Desktop gesondert prüfen.

Später RTL-Sprachen berücksichtigen: logische Richtungen `start/end` statt `left/right`, spiegelbare Navigation/Icons, aber Inhalte wie Zahlen/Formeln nicht blind spiegeln.

### 10. Fonts und Zeichensätze

Zentrale Schriftwahl muss benötigte Unicode-Zeichen abdecken. Neue Sprache erst freigeben, wenn UI, PDF-Export und generierte Materialien deren Schriftzeichen korrekt darstellen. CJK/Arabisch/Hebräisch benötigen gesonderte visuelle Prüfung.

### 11. Spracheingabe / Remy / Crew

Für Speech-to-Text und später Text-to-Speech Locale explizit setzen. Browser-/Gerätesprache ist nur Vorschlag.
- Nutzer kann Sprache des gesprochenen Auftrags ändern.
- Remy kann deutschen Steuerbefehl verstehen und trotzdem englischen Test erzeugen.
- Crew-Persönlichkeit bleibt konsistent, aber Formulierungen werden pro Sprache lokalisiert, nicht wortwörtlich übersetzt.
- Wiederkehrende Antworten zuerst aus lokalem, geprüften Katalog; KI nur bei freier/komplexer Anfrage.

### 12. Spiele

Spielmechanik, Lernziel und Text trennen. Rätsel dürfen bei Übersetzung nicht unlösbar werden (Wortspiele, Buchstabenanzahl, Reime, Sortierregeln). Sprachabhängige Rätsel brauchen pro Locale eine eigene validierte Variante statt reine Übersetzung.

### 13. Assets und Maskottchen

- Kein sichtbarer Text fest in Bildern.
- Alt-Texte lokalisieren.
- Namen, Gesten, Symbole und Humor auf kulturelle Missverständnisse prüfen, bevor eine Region offiziell unterstützt wird.
- Gemeinsame zentrale Crew-/Asset-Bibliothek beibehalten; keine sprachabhängigen Duplikate derselben Grafik, sofern nicht nötig.

### 14. Datenmodell und Versionierung

Neue persistierte fachliche Objekte sollten, wo relevant, Felder wie Ursprungssprache/Locale und Version tragen. Übersetzungen nicht als unkontrollierte Überschreibung des Originals speichern. Migration alter Daten: bestehende Inhalte ohne Locale werden kontrolliert als `de-DE` behandelt, nicht bei jedem Lesevorgang geraten.

Telemetrie darf Locale als technische Dimension nur erfassen, wenn notwendig und datenschutzkonform; keine Schülertexte zur Sprachdiagnose protokollieren.

### 15. Import / Export / PDF / CSV

- UTF-8 konsequent.
- CSV-Trennzeichen und Excel-Kompatibilität bewusst behandeln; Datenformat intern stabil halten.
- PDF-Schriften/Umbruch je Sprache testen.
- Exporte enthalten bei Bedarf maschinenlesbare Locale-Metadaten.
- Importierte Aufgaben behalten ihre erkannte/angegebene Ursprungssprache.

### 16. URLs, öffentliche Seiten und SEO

Falls GradeCrew öffentliche Marketing-/Hilfeseiten mehrsprachig anbietet: locale-stabile URLs und `hreflang`/Canonical-Konzept festlegen. App-interne Testlinks dürfen nicht allein wegen UI-Sprache unterschiedliche IDs erhalten.

### 17. Übersetzungsworkflow

Keine unkontrollierten KI-Übersetzungen direkt nach Production.
1. Quelltext/Schlüssel ändern.
2. Fehlende Übersetzung wird automatisch erkannt.
3. KI darf einen Entwurf liefern.
4. Menschliche Prüfung für Kern-UI, Prüfungs-/Rechtstexte und schulfachliche Inhalte.
5. Automatisierte Tests auf fehlende/ungenutzte Schlüssel.
6. Sprachversion gemeinsam mit App-Version nachvollziehbar veröffentlichen.

Glossar festlegen, z. B. wie GradeCrew Begriffe wie Test, Leistungsnachweis, Aufgabe, Versuch, Abgabe, Bewertung und Freigabe in jeder Sprache bezeichnet.

## Empfohlene Reihenfolge einer späteren Umsetzung

1. i18n-Core + `de-DE` als einzige aktive Locale einführen, ohne sichtbare Änderung.
2. Neue sichtbare UI-Texte nur noch über Übersetzungsschlüssel zulassen.
3. Bestehende Kernoberfläche schrittweise extrahieren, beginnend mit gemeinsamen Komponenten/Design-System.
4. Locale-Felder für Test/Inhalt/KI definieren und Migration alter Daten festlegen.
5. Pseudolocale + automatisierte Schlüssel-/Layouttests.
6. Erst danach eine echte zweite Sprache, bevorzugt als Pilot auf einem kleinen, klar abgegrenzten Bereich.
7. KI, Crew, PDF/Export, Spiele und native App jeweils über dieselben Locale-Verträge anbinden.
8. Region/Curriculum erst als offiziell unterstützt markieren, wenn fachliche und rechtliche Inhalte dafür geprüft sind.

## Umfang / nicht verändern

- Diese Aufgabe führt jetzt **keine sichtbare zweite Sprache** ein.
- Keine Änderung an Production oder Staging.
- Keine automatische Übersetzung vorhandener Tests.
- Keine Änderung an Notenschlüsseln, Security-Logik, Assessment-Submission oder bestehenden deutschen Texten durch diesen Plan.
- Keine parallele zweite Design-/Crew-/KI-Architektur aufbauen; spätere i18n-Umsetzung muss vorhandene gemeinsame Systeme erweitern.

## Akzeptanzkriterien für die spätere Foundation

- `de-DE` verhält sich nach Einführung der i18n-Schicht funktional und visuell wie zuvor.
- UI- und Inhaltssprache sind getrennt modelliert.
- Test/KI/Scoring besitzen explizite Locale-Verträge.
- Keine Kernlogik hängt von übersetzten sichtbaren Strings ab.
- Fehlende Übersetzung wird im Build/Test erkannt.
- Pseudolocale deckt Überlänge und fehlende Schlüssel auf.
- Datum/Zahlen/Plural nutzen Locale-Formatter.
- Neue Prüfung kann ihre Inhaltssprache fest speichern.
- Bestehende Daten erhalten eine definierte `de-DE`-Migration.
- Keine automatische Übersetzung verändert veröffentlichte oder laufende Prüfungen.

## Zwischenstand

- Lokal geändert: nein; Connector arbeitet direkt auf eigenem GitHub-Branch.
- Auf GitHub gesichert (Commit): diese Architekturdatei auf `feature/i18n-foundation-plan`.
- Geprüft: Repo-Regeln, TODO, Workstream-Register, offene i18n/language-Branches und PRs wurden vor Anlage geprüft; keine bestehende Internationalisierungsbaustelle gefunden.
- Deployed: nein.
- Gerätetest: nein.

## Offene Probleme und Unsicherheiten

- Konkrete i18n-Library/Framework hängt vom tatsächlichen Web-/Native-Technikstand beim Implementierungsstart ab und wird erst nach Code-Inventar festgelegt.
- Erste Pilot-Sprache noch nicht festgelegt.
- Umfang der regionalen Curricula/Notensysteme pro Markt noch nicht beschlossen.
- Rechtstexte benötigen je Land gesonderte fachliche/rechtliche Prüfung; Übersetzung allein genügt nicht.

## Nächster konkreter Schritt

Vor dem nächsten größeren UI-/KI-Refactor auf dem dann aktuellen Integrationsstand inventarisieren, wo sichtbare deutsche Strings, KI-Sprachannahmen, Noten-/Formatlogik und sprachabhängige Prüfungsdaten im Code liegen. Daraus einen kleinen `i18n-core`-Implementierungsauftrag erstellen, der zunächst nur `de-DE` unterstützt und keine sichtbare Produktänderung erzeugt.

## Wiederaufnahme nach Abbruch

Plan ist auf dem eigenen Branch gesichert. Es gibt aktuell keinen i18n-Code, keinen Deploy und keine bestätigte zweite Sprache. Vor Umsetzung erneut main, offene PRs und die betroffenen Web-/Crew-/Design-/Security-Branches prüfen.