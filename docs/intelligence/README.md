# GradeCrew: Sprache, verlässliche KI und Internationalisierung

Stand: 2026-10-02. Task **GC-INTELLIGENCE-01**. Diese Architektur verbindet vorhandene Bausteine; sie schaltet keine Modelle um und aktiviert keine zusätzlichen Sprachen.

## Was bereits existiert und was dieser Branch ergänzt

Geprüfte Ausgangspunkte: App-Integration `a61759db`, Gateway `232c0ed4`, Telemetrie `4e4f0ba9`. Vor Integration aktuelle Heads erneut vergleichen.

| Baustein | Vorhanden | Ergänzung dieses Branches | Noch offen |
| --- | --- | --- | --- |
| Crew / Stimme | Crew-Assistent, Diktat und Formular-Patches; Emmi-Testüberarbeitung | Begrenzter Patch-Vertrag mit Formularrevision und getrennten Sprachfeldern | Vertrag an vorhandenen Parser/Formularcontroller anbinden; Mikrofon-/Abbruch-/Fehlerzustände am Gerät prüfen |
| KI-Gateway | Separater Provider-Router und Anthropic-Adapter; bestehende Firebase-KI unverändert | Offline-Evidenzprüfung für Modell-/Pipelinewechsel | Echte Benchmarks, signierte Freigaben, Runtime-Verifikation und kontrolliertes Routing |
| i18n | `shared/i18n`, deutsche UI, Locale-Kontext und Nicht-DOM-Inventar | Strenger Kontextvertrag ohne stille Fallbacks; Capability-Abfrage pro Sprache/Bildungskontext | Echte Übersetzung und fachliche Freigaben pro Funktion |
| Messung | Collector-, Unterrichts- und KI-Kostenarbeit in eigenen Branches | Inhaltsfreie Berichtsfelder und gemeinsame Auswertungsregeln | Eventintegration, durchgängige Kostenattribution und Adminansichten |

Die Cloud-Run-Beispielinstanz allein belegt keinen Gateway-Code-Deploy. Dieser Branch verändert keine bestehende API, keine Firestore-Regeln, keine produktive Datenerhebung und keinen aktiven Prüfungsweg.

## Gemeinsamer Ablauf

Texteingabe, Mikrofon und später Siri liefern einen Auftrag an denselben Crew-Aktionskern. Er liest den aktuellen Formularzustand, erzeugt einen begrenzten Änderungsvorschlag und übergibt ihn an vorhandene fachliche Validierung und Berechtigungsprüfung. Der Server entscheidet über erlaubte Aktionen und zugelassene KI-Pipelines. Das Modell entscheidet weder über Rechte noch über Datenschutz, Budget oder Veröffentlichung.

Jeder KI-Auftrag erhält serverseitig eine Operation-ID, Job-Art, unveränderlichen Kontext und eine Pipelineversion. Verwandte Aufrufe tragen dieselbe Operation-ID und separate Attempt-IDs. Ein Timeout ist kein Beleg, dass der Provider nichts ausgeführt hat: Wiederholungen müssen begrenzt sein und dürfen keine doppelte Veröffentlichung, Teständerung oder Abgabe erzeugen.

### Sprach- und Fachkontext

`uiLocale`, `inputLocale`, `contentLocale`, `gradingLocale`, `educationContextId`, `curriculumVersion`, `timeZone` sind getrennt. Beispiel: deutsche Oberfläche und deutsches Diktat, britisch-englische Aufgaben/Bewertung, bayerischer Lehrplan. Ein Land ist kein Lehrplan; Schulform, Jahrgang und Fach gehören zusätzlich in den fachlichen Auftragskontext.

`context-contract.mjs` ergänzt den toleranten bestehenden UI-Locale-Resolver um einen strengen Auftragsvertrag. Ungültige Angaben werden zurückgewiesen. Es gibt bewusst keinen zweiten Übersetzungskern. Diese erste Vertragsversion unterstützt keine Unicode-Locale-Erweiterungen wie `u-nu-arab`; Kalender/Zahlensysteme brauchen vor Freigabe eine explizite Erweiterung. Bestehende Daten nicht automatisch umdeuten.

Eine Capability-Freigabe gilt für eine bestimmte Funktion, Sprache, Bildungskontext und Curriculumversion und läuft ab. Eine übersetzte Navigation erlaubt keine französische Freitextbewertung. Die Prüfung erhält eine vertrauenswürdige Release-Matrix; Browser oder KI dürfen sie nicht selbst liefern. Es wird keine erfundene Liste bereits qualifizierter Sprachen/Modelle mitgeliefert.

Aufgaben erhalten bei Veröffentlichung einen unveränderlichen Locale-/Rubrik-/Curriculum-Snapshot. Übersetzung erzeugt eine neue überprüfte Revision. Laufende Prüfungen behalten ihre ursprüngliche Bewertungsgrundlage, auch nach Wechsel der Oberflächensprache oder des KI-Anbieters.

## Sprache: sinnvoller nächster Ausbau

1. Bestehenden Mikrofonknopf mit Aufnahme-, Verarbeitungs-, Abbruch- und Fehlerzustand prüfen. Start nur bewusst durch den Nutzer, eindeutiger Mikrofonindikator; kein Hintergrundlauschen. Texteingabe bleibt jederzeit möglich. Vorlesen und Erkennen sind getrennte Funktionen.
2. Den bestehenden Crew-Patch über `validateVoicePatch` prüfen: erlaubte Felder, begrenzte Werte, eindeutige Request-ID und aktuelle Formularrevision. Unbekannte Felder/Typen werden abgelehnt. Validierung ist noch kein Replay-Schutz: Request-ID serverseitig/idempotent bzw. im Formularcontroller deduplizieren. Fehlerhaftes Diktat niemals unmittelbar veröffentlichen.
3. Feldherkunft am Controller festhalten: explizite Nutzerkorrektur/aktuelles Diktat vor vorhandenem Formular, anschließend Klassen-/Profilvorgabe und zuletzt Default. Unausgesprochene Felder nicht löschen. Nur tatsächlich erfasste Felder patchen; Widerspruch oder Negation nicht durch Modellselbstvertrauen auflösen. Änderungen anzeigen und rückgängig machen. Validierung der gültigen Fach-/Schulform-/Regionscodes bleibt im vorhandenen Formularmodell.
4. Später native Aufnahme/STT und App Intents an denselben Aktionskern anbinden. Ein Siri-Intent darf sicher zur passenden Ansicht samt vorgeschlagenem Auftrag führen. Beliebige lange Siri-Sätze, gesperrtes Gerät, Berechtigungsdialoge und Hintergrundausführung sind separate Gerätetests; vorhandenes App-Signing beweist diese Fähigkeiten nicht.
5. Mit Akzenten, Zahlen, Dezimaltrennzeichen, Negationen, Fachwörtern, Lärm und Unterbrechungen testen. Wichtigste Metrik: korrekt übernommene Slots mit bestätigter Referenz. Wortfehlerrate, Abbruchrate und Zeit bis zur nutzbaren Vorschau ergänzen sie. Nicht bearbeitet bedeutet nicht automatisch richtig erkannt.

Browser-SpeechRecognition hat begrenzte Unterstützung und kann Audio an einen Erkennungsdienst senden. Browserdiktat deshalb nicht pauschal als lokal/offline bezeichnen. Vor Providerwechsel Datenempfänger und Betriebsmodus prüfen. Rohaudio/Transkripte standardmäßig nicht in Telemetrie, Fehlermeldungen oder Repo übernehmen; gesondertes, freiwilliges Diagnosesample braucht eigenen Zweck, Zugriff und Löschweg.

## Qualität vor Kosten: überprüfbare Modellwechsel

Ein Job hat einen eigenen Bewertungsmaßstab: sachlich richtige Aufgabe, korrekte Lösung, eindeutige Distraktoren, nachvollziehbare Rubrik, korrekte Sprach-Slots etc. Freitextbenotung braucht besonders konservative Kriterien und menschliche Kalibrierung. Schema-Konformität ist nicht fachliche Richtigkeit. Mehrere übereinstimmende Modelle sind keine unabhängige Wahrheitsquelle.

`quality-gate.mjs` prüft **offline** gepaarte Referenzfälle für Bestands- und Kandidatenpipeline. Scope bindet Job, Fach, Aufgabenart, Risikostufe, vier Locales, Bildungskontext, Curriculum sowie Datensatz-, Rubrik-, Prompt-, Schema-, Validator-, Pipeline- und konkrete Modellversionen. Modell-Aliasse müssen vorher zu nachvollziehbaren Versionen aufgelöst werden; die Bibliothek kann Providerbehauptungen nicht verifizieren.

Evidenz braucht getrennte Referenz- und Stichprobenprüfungen, zurückgehaltene Fälle, eine erwartete Fallzahl und genau eine Zeile pro unabhängiger Einheit. Auslassungen, Duplikate, gleiche Aufgabenfamilien, unerlaubte Textfelder und veraltete Nachweise werden abgelehnt. Ein ID-String beweist keine echte unabhängige Stichprobe: Das bleibt eine dokumentierte menschliche Prüfung. Fehlversuche/Timeouts gehören als Fehler in den Datensatz, nicht aus der Auswertung entfernt. Kosten enthalten auch diese Versuche.

Die Prüfung berechnet exakte einseitige binomiale Grenzen (Clopper–Pearson) für Erfolgsrate und neue Fehler gegenüber der Bestandspipeline. Kritische Fehler blockieren immer. Zusätzlich gelten Mindestfallzahl, Latenzbudget und gegebenenfalls belegte Kosteneinsparung pro akzeptiertem Ergebnis. Die Schwellenwerte werden **vor** Betrachtung der Kandidatenergebnisse festgelegt; dieser Branch legt keine Produktqualität von 95 % fest. Die 95-%-Erfolgsgrenze in den Unit-Tests ist ausschließlich eine synthetische Testkonfiguration.

Das Fehlerbudget `familyAlpha` wird durch die Zahl aller geplanten statistischen Gates geteilt. Bereits eine Scope-Prüfung verwendet zwei Gates. Mehrere Modelle, Sprachen oder Teilgruppen erhöhen diese Zahl. Nicht nachträglich nur den besten Versuch auswählen; neue Prompts auf Trainings-/Entwicklungsfällen optimieren und auf unangetasteten Referenzfällen prüfen. Ein globaler Durchschnitt darf schwache Teilgruppen nicht verdecken.

**99,99 % ist keine allgemeine Produkteigenschaft.** Für ein einziges binäres Kriterium benötigt selbst ein fehlerfreier Versuch mindestens 29.956 unabhängige, repräsentative Fälle, damit die einseitige 95-%-Untergrenze 99,99 % erreicht (`0.05 ** (1/n)`). Mehrere Gates brauchen mehr Fälle. Das ist eine statistische Aussage unter Voraussetzungen, keine Fehlerfreiheitsgarantie. Die Formel und allgemeine Grenzen folgen der binomialen Konfidenzintervall-Inversion; Quellen unten.

Ein positives Ergebnis heißt ausschließlich `eligible_for_review`, immer mit `runtimeAuthorized: false`. Auch eine Datei voller erfundener Erfolgsfälle könnte syntaktisch bestehen. Deshalb darf das CLI niemals direkt als Freischalt-API dienen. Für Runtime-Routing fehlen noch: vertrauenswürdiger Datensatz-/Review-Speicher, Artefakthashes/Signaturen, Releaserfreigabe und Verifikation durch den Server. Öffentliche Kundenanfragen dürfen weder Richtlinien noch Evidenz einspeisen.

### Kosten senken ohne stillen Qualitätsabbau

- Erst unnötige Aufrufe, Wiederholungen und doppelte Uploadverarbeitung vermeiden; Cache exakt nach Kontext, Sprache, Curriculum, Rubrik, Prompt und Modellversion begrenzen. Keine personenbezogenen Inhalte zwischen Lehrkräften wiederverwenden.
- Einfache deterministische Prüfungen vor einem teuren Modell ausführen. Kleine Modelle nur für nachweislich beherrschte Teilaufgaben einsetzen. Erzeugung, Lösungskontrolle und Reparatur bleiben budgetierte Schritte mit maximaler Anzahl, Deadline und klaren Abbruchbedingungen.
- Gesamtpreis pro akzeptiertem Ergebnis vergleichen: alle Modellversuche, Prüfungen, Reparaturen, menschliche Nacharbeit und Infrastruktur. Währung und versionierter Preisstand sind Pflicht; fehlender Preis/Tokenwert bleibt unbekannt, nicht null Euro. Direkte Messwerte und geschätzte menschliche Arbeitskosten separat ausweisen.
- Kosten-/Latenzverteilungen und schwierige Teilgruppen betrachten, nicht nur Mittelwerte. Qualitätsgleiche billigere Kandidaten zunächst kontrolliert auf Staging, danach begrenzt mit genehmigtem Rollout testen. Bei Drift zur letzten freigegebenen Pipeline zurückschalten; aktive Prüfungen behalten ihren Snapshot.
- Fallback darf weder Region/Datenempfänger noch Aufbewahrung, Qualitätsstufe oder Berechtigungen lockern. „Primärmodell ausgefallen“ ist keine Erlaubnis, Schülerdaten beliebig weiterzuleiten. Wenn kein qualifizierter Pfad verfügbar ist, verständlich abbrechen oder in eine Prüfschleife gehen.

## Internationalisierung: häufig übersehene Arbeit

Die deutsche UI bleibt zunächst der Referenzstand. Erst Pseudolokalisierung (lange Texte), Tastaturbedienung, Screenreader und schmale iPad-/iPhone-Ansichten prüfen, danach eine weitere bewusst freigegebene UI-Sprache.

- Übersetzungsschlüssel und pluralisierbare Nachrichten statt Satzverkettung; Status-/Fach-/Aufgabencodes stabil lassen. Deutsches Quelllabel nicht unbemerkt als internationale Daten-ID benutzen.
- CSV, PDF, E-Mail, native Swift-Texte, Prompttexte, Serverfehler und ARIA-/`lang`-/`dir`-Attribute anhand des bestehenden Nicht-DOM-Inventars migrieren.
- Zahlen, Einheiten, Datum, Kalender, Zeitzone/DST, Notenskalen und Papierformate explizit prüfen. UI-Formatierung darf Bewertungsparser nicht verändern. Arabische Ziffern/RTL und gemischtsprachige Aufgaben brauchen eigene Testfälle.
- Spiele mit Wortlisten, Wortlängen, Reimen und Buchstabenrastern benötigen kuratierte Sprachvarianten. Automatische Übersetzung allein erhält die Lösbarkeit nicht.
- Fachliche, curriculare und erforderliche rechtliche Texte separat freigeben. Sprachfreigabe ersetzt keine regionale Eignung.

## Gemeinsame Messung und Adminansicht (noch anzubinden)

Inhaltsfreie technische Events: Operation-ID, Job, Pipeline-/Prompt-/Validatorversion, Locale-Scope, Provider/aufgelöste Modellversion, Release/Umgebung, Dauer, Tokenwerte mit Verfügbarkeitsflag, Preisstand, Retry-/Fallback-/Cache-Ergebnis, kategorisierte Fehler und Review-Ergebnis. Keine Antworten, Prompts, Audioinhalte, Schülernamen oder Freitext als Telemetrie-Dimensionen.

IDs nicht als Dashboardgruppen mit unbeschränkter Kardinalität benutzen. Rohereignisse nur begrenzt und berechtigt zugänglich; aggregierte Teilgruppen mit Mindestgröße ausweisen. Technische Nutzungsdaten, fachliche Referenzfälle und freiwillige Diagnosedaten getrennt halten. Bestehende Telemetrie-Inventur/Löschregeln gelten; dieser Entwurf verlängert keine Frist.

Adminansicht später mit Filtern für Release, Job, Sprache/Bildungskontext, Pipeline/Modell, Fehlerkategorie und Zeitraum. Je Zeile anzeigen: echte Referenzanzahl, Konfidenzgrenzen, kritische Fehler, Korrekturquote mit Nenner, Kostenabdeckung und kompletter Pipelinepreis. „Keine Daten“ nicht grün darstellen. Korrekturquote misst Verhalten, nicht unmittelbar Qualität. Zugang ausschließlich nach existierender Adminautorisierung.

## Reihenfolge und offene Aufgaben

| Task | Nächster überprüfbarer Schritt | Abhängigkeit |
| --- | --- | --- |
| GC-INTELLIGENCE-01 | Offline-Verträge + Tests in Gateway-PR integrieren | Review dieses Branches, keine automatische Aktivierung |
| GC-VOICE-02 | Bestehenden Crew-Formularpfad mit Vertrag, Deduplizierung, Vorschau/Undo und Gerätefällen verbinden | Aktueller Crew-Code, native Fähigkeiten separat prüfen |
| GC-AI-EVAL-02 | Kleines fachlich geprüftes Pilot-Set samt Fehlerfällen und Bewertungsrubrik erstellen; Schwellen vorab festlegen | Lehrkraftreview; nicht als 99,99-%-Beweis ausgeben |
| GC-AI-ROUTING-02 | Vertrauenswürdige Freigabeartefakte, Provider-Capability-Prüfung, Budget/Deadline und Rückfallpfad implementieren | Echte Evaluation, Gateway-Integration; menschliche Freigabe |
| GC-I18N-02 | Pseudolokalisierung + Nicht-DOM-Migration und sprachabhängige Parser-/Spieletests | Bestehender i18n-Core und Locale-Capability-Matrix |
| GC-AI-OBS-02 | Gemeinsame Operation-ID und vollständige Kosten-/Qualitätsabdeckung im Adminbereich | Telemetrie-Collector, keine neue Schatten-Datenbank |

Vor diesen Erweiterungen bleiben bestehende Release-Blocker relevant: sicherer Schülerpfad/Belastungstest, manuelle Tutorial-Abgabe in der App und konkrete Gerätetests. Ein neuer KI-Unterbau löst sie nicht automatisch.

## Ausführen und Grenzen

`node --test shared/intelligence/test/*.test.mjs`

`node tools/evaluation/check-quality.mjs policy.json evidence.json`

CLI-Exit 0 = zur menschlichen Prüfung geeignet, 1 = fachliche/statistische Sperre, 2 = ungültige Eingabe. Alle Ausgaben enthalten nur IDs/Counts/Kennzahlen/Fehlercodes. Policy-/Evidenzfelder siehe exportierte Verträge und synthetische Tests; keine echten Leistungsnachweise in Git speichern. Keine externen KI-Aufrufe und keine Modellbenchmarks in dieser CI.

Quellen: [NIST: binomiale Konfidenzintervalle](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm), [MDN: SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [Apple: App Shortcuts](https://developer.apple.com/documentation/appintents/app-shortcuts). Produktregeln und konkrete Schwellen müssen für GradeCrew festgelegt werden; die Quellen liefern keine GradeCrew-Qualitätszertifizierung.
