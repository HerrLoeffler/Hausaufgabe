# GradeCrew: Datenstrategie und Messdesign
Stand 01.10.2026. Auftrag GC-TELEMETRY-DESIGN. Umfangreiche Vorüberlegung, keine Aktivierung neuer Datenerhebung. Ergänzt PLAN.md; widersprüchliche Begriffe vor Implementierung klären.

## 1. Belegbarer Iststand
Geprüfte Quelle: feature/gradecrew-app-integration@74eb2ec08e81315875abfc4b1ae052d9f78797eb, app.js, functions/index.js, functions/lib/usage.js, functions/lib/diagnostics.js, firestore.rules. main@924b96e79f97523e76a48854ca7a3904b042129e enthält das deaktivierte Telemetrie-Fundament. Quellcode belegt mögliche Schreibwege, nicht Anzahl tatsächlicher Cloud-Datensätze, aktuelle Cloud-Aufbewahrung oder alle separaten Branches. Kein Zugriff auf Cloud-Logs/Dateninventar in dieser Prüfung.

| Bestand | Codepfad / Daten | Grenzen |
|---|---|---|
| Konten | users: Name, E-Mail, Rolle, Status, Einstellungen, Notenschlüssel, createdAt, lastActiveAt, App-Version; Firebase Auth | Kein vollständiger Nutzungsfunnel; lastActiveAt ist kein Beleg eines erfolgreichen Unterrichts |
| Tests | quizzes und questions: Aufgaben, Lösungen, Metadaten, Veröffentlichungs-/Rundenkontext | Unterrichtsinhalte sind operative Daten, keine allgemeine Analytics-Tabelle |
| Teilnahme | quizzes/.../attempts: Schülername, Status, Modus, Beitritts-/Startzeit, sessionRunId | Gelesener Legacy-Pfad; Secure-Branch gesondert inventarisieren |
| Abgaben | submissions: Name, Antworten, Bewertung, Punkte, Note, Attempt-/Runden-ID, Dauer, automatisch/manuell | Gelesener Legacy-Pfad enthält Clientbewertung; nicht als sicherer neuer Backendpfad ausgeben |
| KI-Verbrauch | users/.../aiUsage: Tages-/Minutenzähler; aiEvents: Tokens, Art, Modell, Promptversion und weitere Qualitäts-/Reparaturfelder | Quota zählt reservierte Aufrufe, nicht erfolgreiche Generierungen. Fehlende Tokenangaben werden teilweise zu 0; Schreiben darf fehlschlagen |
| KI-Aufträge | aiJobs: Besitzer, Status und Erstellungs-/Quellkontext; Aufgabenfeedback in feedback | Metadaten und Inhaltskontext können personenbezogen sein |
| Support | feedback: allgemeine Meldungen, Aufgabenbewertung, technische Meldungen, Rechtehinweise | Personenbezug, Freitext, Aufgaben-Snapshots und technische Daten; keine pauschal anonymen Logs |
| Technischer Kontext | gesendeter Fehlerbericht: Version, Umgebung, Browser, Sprache, Viewport, Screen, Netzwerkstatus, Referenz, Fingerprint, Stack, Breadcrumbs | technische Meldung wird über Problem melden gespeichert; Breadcrumbs allein sind begrenzter Speicher im Browser |
| Weitere Betriebsdaten | announcementViews, private Rechtehinweis-Ratenlimits; serverseitige console-Logs | Infrastruktur kann eigene Request-/Sicherheitsdaten führen; tatsächliche Einstellungen separat prüfen |
| Neues Telemetriemodul | sieben Eventverträge, begrenzter In-Memory-Puffer, Kennzahlfunktion | deaktiviert, ohne Collector, ohne Produkteinbindung, ohne dauerhaftes Analytics |

Neue DOCX ist SHA256-identisch mit vorheriger Quelle: 05d52d2e4bad56f6c72d8869bc592dcfe3cb862fbbdeb362f51e7269e8c74902. Sämtliche Beispielzahlen darin sind fiktiv.

## 2. Grundentscheidungen
Für jede Messung zuerst: Welche Entscheidung treffen wir? Welche minimale Beobachtung benötigt sie? Wer darf sie sehen? Wie lange brauchen wir Einzelereignisse? Wann ist das Ergebnis unzuverlässig?
Keine generelle Klickaufzeichnung. Drei getrennte Zugriffsbereiche:
1. Unterrichtsdaten: zuständige Lehrkraft/autorisiertes Schulpersonal, Inhalte und Ergebnisse.
2. Diagnose: freigegebene technische Abläufe, eng begrenzte Supportfälle, Entwicklerzugriff nach Rolle.
3. Produkt-/Unternehmensstatistik: reduzierte Ereignisse und Aggregate, keine allgemeinen Schülerantworten oder Namen.
Gleicher Cloudanbieter ersetzt diese Trennung nicht. Produktanalytics liest operative Daten nur über geprüfte Projektionen. Keine universelle Schülertimeline über Schulen hinweg.
Pseudonyme IDs sind nicht automatisch anonym. Auch kleine Gruppen oder seltene Kombinationen können identifizierbar sein. Zweck, Rechtsgrundlage, Schul-/Anbieterrollen, Minderjährige, Auftragsverarbeitung und erforderliche Information/Freigabe vor Aktivierung prüfen. Dies ist keine Rechtsfreigabe.

## 3. Entscheidungen und Messbereiche
| Bereich | Konkrete Frage | Daten | Konsequenz |
|---|---|---|---|
| Unterricht | Wo scheitert Beitritt/Abgabe? | Schritte, autorisierte Runde, Fehlerphase, bestätigter Serverstatus, Dauer | betroffenen Pfad/Release reparieren |
| Lehreraufwand | Spart die Erstellung Arbeit? | aktive Zeit, Wartezeit, Eingriffe, Veröffentlichung und tatsächlicher Einsatz | Editor/Generierung vereinfachen |
| KI | Welche Version erzeugt brauchbare Aufgaben? | technische Checks, explizite Lehreraktionen, Nutzung, Kosten | Prompt/Validator/Modell verbessern |
| Aufgaben | Sind Aufgaben problematisch? | aggregierte Erstversuche, Distraktoren, Hilfen, Auslassungen, Zeit | Aufgabe fachlich prüfen |
| Spiele | Wo stockt die Reise? | Welt-/Mechanikversion, Fortschritt, Hinweise, Fehlversuche, Abbruch, Zeit | konkrete Mechanik/Anleitung verbessern |
| Produkt | Was führt zu wiederholtem Unterrichtseinsatz? | Aktivierung, erste echte Runde, Wiederverwendung, Lehrerkohorten | Onboarding und Produktpriorität |
| Betrieb | Welche Version ist zuverlässig? | Client-/Serverfehler, Latenzen, Upload/Import, Queue, Datenabdeckung | Diagnose und kontrollierte Releaseentscheidung |
| Wirtschaft | Was kostet echter Nutzen? | Backendverbrauch, Rechnungsdaten, Supportaufwand, genutzte Inhalte | Preise/Kapazität fundieren |

## 4. Einheiten und Identität
Ein Konto ist keine Sitzung; ein Test ist keine Unterrichtsrunde; ein Reload ist keine neue Teilnahme.
- teacher_account / tenant: nur operativ; Analytics-ID serverseitig zweckgebunden ableiten. Kein stabiler Schülerhash aus Namen/E-Mail.
- preparation_id: eine Vorbereitung, auch über mehrere Bearbeitungssitzungen.
- content_revision_id: unveränderlicher Fragenstand. Jede relevante Änderung neue Revision.
- teaching_session_id: ein Unterrichtseinsatz dieser Revision; Wiederverwendung erzeugt neue Runde.
- participation_id: serverseitig autorisierte Teilnahme innerhalb dieser Runde; erneute Verbindung behält Identität.
- attempt_id: prüfungsrechtlicher Bearbeitungsversuch. Nicht mit event_id oder Browser-ID verwechseln.
- event_id: eine Beobachtung; Retry behält dieselbe ID. generation_id plus provider_call_id trennt KI-Auftrag und mehrere kostenpflichtige Calls.
- trace_id: technische Anfragekette; report_id verknüpft eine bewusst gesendete Supportmeldung.
Mappingtabellen nur eng autorisiert und löschbar. Keine Klassen-/Testnamen oder Beitrittscodes im allgemeinen Ereigniscontext.
Schulwechsel/Logout löschen Clientpuffer und erneuern Kontext. Lehrernutzung in mehreren Schulen nicht irrtümlich einem Tenant zuschreiben.
Das bestehende session_id-Feld ist derzeit generisch: vor Anbindung Semantik je Event festlegen; neues Kontextschema bewusst versionieren statt alte Felder umzudeuten.

## 5. Kennzahlen mit präzisem Nenner
### Unterrichtszuverlässigkeit
Classroom Start Success: Anteil auswertbarer Runden, in denen mindestens 90 % der vor Beitrittsöffnung festgelegten erwarteten Teilnahmezahl binnen 60 s bereit sind. Server speichert join_opened_at und Nenner-Snapshot. Verspätet eröffnete Geräte nicht aus Nenner entfernen. Unbekannter Nenner separat zählen; keinen Erfolg erfinden.
QR-Scan ist ohne eigenes Signal nicht messbar. Direktlinköffnung und sichtbarer Joinbildschirm sind unterschiedliche Stufen. Offline vor Seitenladung fehlt in Clientevents; erwartete Schülerzahl zeigt Differenz, erklärt sie aber nicht.
Abgabeerfolg: bestätigte einmalige Finalisierung / autorisierte gestartete Attempts, getrennt von HTTP-Anfragen, Retries und Klicks. Laufende Attempts nicht vor Frist als Verlust zählen.
Endzustände: completed, teacher_cancelled, timed_out, blocked, incomplete_unknown. Browserclose allein beweist keinen Abbruch. Automatische Fristabgabe getrennt von manueller Abgabe, inkl. Nutzerabsicht und Serverbestätigung.
Successful Teaching Sessions erst dann zeigen, wenn Rundenausgang, geplante Teilnahme, bestätigte Abgaben und blockierende Fehler operational definiert sind. Zunächst lieber die einzelnen Raten zeigen. Kein zusammengesetzter Erfolg ohne Abdeckung.

### Lehrerzeit und Wiederverwendung
Aktive Bearbeitungszeit, KI-Wartezeit und Kalenderzeit getrennt. Vorschlag aktiver Timer: sichtbare App, letzte qualifizierte Interaktion höchstens 60 s zurück; Grenzwert versionieren. Keine Tastaturinhalte speichern. Fokusverlust pausiert; native App-Lifecycle und Web-Visibility berücksichtigen. Längeres Lesen kann so unterschätzt werden, offen anzeigen.
Median und p90 bis Veröffentlichung; zusätzlich bis erstem echten Einsatz. Vorhandene Vorlage, KI-Neuerstellung und manueller Test getrennt, ebenso erstmalige und erfahrene Lehrkräfte. Unveröffentlichte Vorbereitungen bleiben im Funnel und gelten nicht sofort als gescheitert.
Wiederverwendung: derselbe Inhaltsstamm in mindestens zwei unterschiedlichen echten Unterrichtsrunden; Kopien und Revisionen nachvollziehbar, ohne Schülerantworten zusammenzuführen.
Retention nach erster sinnvoller Aktivierung, nicht nur Registrierung; D7/D30 als definierte Zeitfenster, Zeitzone und Kohortengröße ausweisen. Schulferien, Wochenenden und Unterrichtsrhythmus berücksichtigen.

### KI
Direktveröffentlichungsrate: ohne inhaltliche Änderung veröffentlichte KI-Revisionen / ausgewählte auswertbare KI-Revisionen. Explizite Akzeptanz, stilles Behalten und tatsächlicher Einsatz getrennt.
Änderungsrate pro Aufgabe und pro Test; Textänderung, Lösungskorrektur, Schwierigkeit, Bildproblem als begrenzte Kategorien statt vollständigem Text-Diff in Analytics.
Generierung verworfen/regeneriert/ersetzt sind unterschiedliche Vorgänge. Mehrfachaktionen nicht mehrfach als Personen zählen. Noch ungeprüfte Aufgaben bilden einen eigenen Zustand.
Technische Validator-Passrate ist keine fachliche Qualitätsquote. Lehrerfeedback ist selektiv, nicht repräsentativ. Fachliche Stichproben mit dokumentiertem Prüfraster ergänzen.
Backend: Modell, tatsächliche Providerantwort, Prompt-/Generator-/Validatorversion, Calls, Retrygrund, Latenzen, Input/Output/Cache, bekannte oder unbekannte Verbrauchsdaten. Unbekannt ist null/status missing, niemals erfundene 0.
Kosten pro Call/Generierung/genutztem Test/Unterrichtsrunde. Preisversion, Währung, Preisdatum und nicht enthaltene Infrastruktur separat. Providerrechnung gegen eigene Erfassung abgleichen; fehlgeschlagene Calls können kostenpflichtig sein.
OpenTelemetry-Konventionen als Mapping nutzen; aktuelle GenAI-Konventionen entwickeln sich weiter. Eigener stabiler Vertrag und dokumentierte Mappingversion bleiben notwendig. Prompts/Antworten nicht standardmäßig in Traces aufnehmen.

### Aufgaben und Spiele
Erstversuchsquote, spätere Lösung, Hilfen, übersprungen/unbeantwortet getrennt; manuell zu bewerten ist nicht falsch. Distraktoren über Options-IDs des unveränderlichen Inhaltsstands, ohne Lösungstext im allgemeinen Log.
Itemanalyse zunächst lehrer-/rundenbezogen. Unternehmensstatistik erst aggregiert mit geprüftem Mindestgruppenschutz, keine Schülerprofile. Keine pauschalen Lernzuwachsbehauptungen aus Lösungsquoten.
Spielabschluss, Fortschritt, aktive Dauer, Puzzleversuche und Hilfen gemeinsam. Wiederbetreten eines Raumes nicht als neue Runde zählen. Mechanikfehler von fachlich falscher Antwort trennen.
MVP nur Start/Ende und Zustandsübergänge relevanter Rätsel, keine dauerhafte Positions-/Mausspur oder Frameevents. FPS/Speicher später unterstützungsabhängig und stichprobenartig; fehlende Browser-API nicht 0 FPS.
Feedback am Ende freiwillig, wenige Kategorien; Antwortquote und Selbstselektion sichtbar.

## 6. Geplanter Eventkatalog
Diese Namen sind Entwurf, nicht zusätzlich implementierte Schemas. Ein gemeinsames versioniertes Dictionary nennt Zweck, Owner, Quelle, Typen, Pflichtfelder, erlaubte Werte, Löschklasse, Sampling, ersten Release und Test.
| Phase | Events | autoritative Quelle / minimaler Inhalt |
|---|---|---|
| P0 Diagnose | system.error.occurred, support.issue.reported | begrenzter Fehlercode/Phase/Referenz/Version; Bericht getrennt |
| P0 Unterricht | classroom.session.opened, classroom.join.stage_reached, classroom.join.completed | Serverrunde und erwartete Zahl; Clientstufe/Dauer, serverseitige Berechtigung |
| P0 Abgabe | assessment.attempt.started, assessment.submission.requested, assessment.submission.finalized, assessment.submission.failed | Serverattempt/-finalisierung; Clientabsicht manual/deadline, kein Antwortenpayload |
| P1 Vorbereitung | teacher.preparation.started, teacher.preparation.completed, content.revision.saved, teacher.content.published, content.used_in_session | Dauer/Quelle/Änderungskategorie/Revision; Backend bestätigt Speicherung |
| P1 KI | ai.generation.started, ai.generation.completed, ai.generation.failed, ai.question.reviewed | Backendcalls/Version/Verbrauch; Lehreraktion mit autorisiertem Revisionsbezug |
| P1 Technik | system.operation.completed, system.connection.changed, system.recovery.completed | Operation import/upload/load/join/submit, Ergebnis, Dauer, Versuch |
| P2 Spiele | game.session.started, game.puzzle.started, game.puzzle.completed, game.hint.used, game.session.ended | feste IDs/Versionen/Fortschritt/Versuche; server- oder clientgeschätzt kennzeichnen |
| P2 Aufgaben | assessment.question.outcome_aggregated | serverseitige Projektion, Erstversuch/Option-ID/Hilfe/Zeit; keine Klartextantwort |
| später Wirtschaft | billing.invoice.settled, billing.refund.recorded | signiertes Backend/Rechnungsbestand, niemals Browser-Umsatz |
| später Experiment | experiment.assignment.created, experiment.exposure.confirmed | serverseitige stabile Zuweisung und tatsächliche Exposition |

Context: schema_version, event_id, client_occurred_at, server_received_at, environment, release_commit; zusätzlich passende native_version/build, web_version, feature_config_revision und quellenspezifische IDs. browser_family/major und device_class grob statt Voll-UserAgent in allgemeiner Analytics. Sprache nur wenn konkrete Qualitätsfrage; exakte Bildschirmgröße eher Diagnose. Kein beliebiges properties-Objekt.

## 7. Collector und Speicherarchitektur
Empfehlung zunächst innerhalb des vorhandenen Backends, keine zusätzliche Analyticsplattform ohne konkreten Nutzen:
- gemeinsame kleine Web-/Native-Adapter; kein doppeltes Zählen im WebView und nativen Wrapper. Eindeutiger event_owner pro Aktion.
- Collector authentifiziert Lehrkraft oder eingeschränkte serverausgestellte Teilnahmeberechtigung. Schüler benötigen dafür nicht zwingend dauerhafte Konten.
- Schema-Allowlist, Größengrenze, Rate-Limits, Autorisierung pro Tenant/Runde, serverseitige Umgebung und Empfangszeit. Browserclaims sind untrusted; Auth/AppCheck allein bestätigt kein reales Verhalten.
- serverseitig bestätigte Abgabe wird aus operativem Zustand projiziert, nicht allein anhand Clientevent. Outbox/Retry oder idempotente Reconciliation verhindert Messlücken zwischen Finalisierung und Analytics-Schreiben.
- Dedup über event_id plus authentifizierten Scope; gleiche ID mit anderem Payload als Konflikt behandeln. Operationen mit natürlichem Schlüssel gegen doppelte Aggregate schützen.
- Rohereignisse kurz, tägliche/Release-Aggregate länger; sensible Supportfälle separat. Collector-Schreibrechte und Dashboard-Leserechte getrennt.
- Aggregate nach Schema-/Definitionversion rechnen. Zähler nicht durch at-least-once Trigger doppelt erhöhen.
Firestore kann erster kontrollierter Speicher sein; Abfrage-/Index-/Schreibkosten vor Wahl anhand Volumenmodell prüfen. Nicht jedes Dashboard scannt sämtliche Einzelereignisse. Warehouse/Export erst bei begründetem Bedarf und Zugangskonzept.
Observability: Logs für definierte Fehler, Traces für Anfrageketten, Metrics für Mengen/Latenzen. Keine hochkardinalen Schüler-/Attempt-IDs als Metriklabels.

## 8. Transport und Messqualität
Vorschlag Pilot: max 100 Events/128 KiB im Speicher, Batch max 20 Events/32 KiB, zeit-/zustandsbasierter Flush, begrenzter Retry mit Backoff/Jitter. Exakte Limits implementieren und testen; bestehendes Modul begrenzt nur Anzahl, nicht Bytes.
Keine dauerhafte Offlinequeue im ersten Schülerpilot. Appclose kann Events verlieren. Serverendzustände liefern Ergebnis; verlorene Clientdetails als unbekannt kennzeichnen. Später verschlüsselte kurze Queue nur mit Lösch-/Gerätewechselkonzept.
Messfehler dürfen Unterricht nie blockieren. Native Logout, Accountwechsel, Reload, Multitab, Uhrsprung, Hintergrund und Wiederverbindung testen. Monotone lokale Uhr für Dauer, Serverzeit für Ordnung; Sequenz pro Ereignisproduzent.
Eigenes Health: accepted/rejected/deduplicated/dropped/retried/late, Queuegröße, Schemakonflikte, Anteil bekannter Endzustände, Anteil mit Versions-/Nennerbezug. Erfassungsabdeckung steht neben jeder KPI.
Synthetische Tests, Tutorial, Lehrerdemo, Preview und Production strikt auswertbar trennen. environment serverseitig bestimmen; Testtraffic explizit markieren und aus Geschäftsmetriken ausschließen. Synthetische 30 Clients sind Last-/Ablauftest, keine 30 unabhängigen realen Schüler und kein Praxiserfolgsbeleg.

## 9. Adminoberfläche und Diagnoseprozess
Vorhandene Filter/Sortierung/Fingerprints weiterverwenden. Views:
1. Releasezustand: Fehlergruppen, blockierte Runden, Abgabe-/Beitrittsraten, p50/p95, Datenabdeckung.
2. Unterrichtsrunde: erwartete/bereite/gestartete/finalisierte/unbekannte Teilnehmer als Aggregate, Zeitachse, definierte Fehlerphasen.
3. KI: Modell/Promptversion, Checks, Lehreraktionen, tatsächliche Nutzung, Kostenabdeckung.
4. Spiel: Welt/Mechanikversion, Rätselstellen, Fortschritt und Hilfe gemeinsam.
5. Datenqualität: Collector, fehlende Revisionen/Abschlüsse, Schema-/Queueprobleme.
Filter: Zeitraum, Umgebung, Web-Commit, native Build, Browserklasse, Operation, Ergebnis, Fehlergruppe; nach Bedarf Generator-/Weltversion. Einzelfall-Recherche nach Referenz-ID, keine universelle personenbezogene Suche in Analytics.
Sortierung: neueste, wiederkehrend, betroffene Runden, blockierend, wieder geöffnet. Rohzahl Meldungen ist nicht Anzahl betroffener Menschen.
Fehlerlebenszyklus: neu → reproduziert → Ursache belegt → Fix-Commit → CI → Preview → Gerätetest → gelöst; Wiederauftreten im fixierten Release öffnet erneut.
An Incident anhängen: redigierter reproduzierbarer Ablauf, expected/actual, Revisions-/Releasekontext, belegte Ursache oder ausdrücklich unbekannt, Test und Regression. Keine unredigierten Daten in GitHub.
Exports per Rolle, Feldallowlist, Protokollierung und Mengenlimit. Freitext-resolution und technische Payloads auf mögliche PII prüfen; technischer Export ist nicht automatisch anonym. Adminzugriffe/Auswertungsänderungen selbst auditieren.

## 10. Datenschutz, Zugriff und Aufbewahrung
Keine heimliche personenbezogene Verhaltensbewertung von Schülern/Lehrkräften. Keine IP-/UserAgent-Fingerprints, GPS, Tastatureingaben, komplette Klickspuren oder Session Replay im MVP. Sicherheitsdaten getrennt zweckgebunden; Browser-/Cloudlogs können IP enthalten und müssen inventarisiert werden.
Rollen: Lehrkraft eigene Runde; Schuladmin nur erlaubte Schule; Support freigegebene Fälle; Entwickler technische Daten; Produktrolle Aggregate; Finanzen Rechnungen. Export-/Mappingzugriff zeitlich begrenzt und auditierbar. Notfallzugriff dokumentieren.
Vorschläge zur Prüfung, nicht beschlossen oder technisch gesetzt:
| Kategorie | vorgeschlagene Rohdatenfrist | längerfristig |
|---|---|---|
| Clientdetails / Produkt-Events | 30 Tage | geprüfte Wochen-/Monatsaggregate bis 13 Monate |
| technische Fehlerdaten | 30 Tage | offene Fälle begründet länger, regelmäßig prüfen |
| ausdrücklich freigegebene Support-Inhalte | 30 Tage nach Fallabschluss | anonymisierte Ursache/Test/Fix |
| pseudonyme KI-/Nutzungsdetails | 90 Tage | Kosten-/Qualitätsaggregate bis 13 Monate |
| Prüfung/Antworten/Auth/Billing | eigener Schul-/Vertrags-/Rechtszweck | keine pauschale Analyticsfrist |
Kleine Zellen unter z.B. 10 Personen unterdrücken ist nur Startvorschlag, keine Anonymitätsgarantie. Wiederholte Filter und Export ermöglichen sonst Differenzangriffe; kombinierte Dimensionen begrenzen.
Löschung: operative Daten, ID-Mapping, Analytics, Supportkopien, Exporte und Backup-Wiederherstellung berücksichtigen. Restore darf gelöschte Personen nicht dauerhaft wieder aktivieren. Aggregierte Daten nur behalten, wenn ihre Nichtidentifizierbarkeit tatsächlich geprüft ist.
Datenregion, Auftragsverarbeiter, Transfers, Zweck-/Rechtsgrundlage, Verantwortlichkeiten und ggf. Folgenabschätzung vor Aktivierung konkret dokumentieren.

## 11. Statistik, Alarme und Experimente
Immer Anzahl, Nenner, Zeitraum, Umgebung, Version, Definition und fehlende Daten zeigen. null statt 0 bei fehlenden Werten. p99 bei sehr wenigen Beobachtungen nicht als stabiler Trend.
Klassen/Schulen sind gruppierte Beobachtungen: 30 Schüler einer Klasse sind nicht 30 unabhängige Belege für einen Produktvergleich. Releasevergleiche können gleichzeitig durch Fach, Geräte, Ferien und neue Nutzer verzerrt sein.
Alarmvorschlag: blockierende Security-/Finalisierungsverletzungen einzeln; Ratenalarme erst bei vereinbarter Mindeststichprobe und nachhaltiger Veränderung; fehlendes Tracking ebenfalls alarmieren. Pilot mit Warnungen kalibrieren, keine automatischen Rollbacks auf unsicheren Raten.
Featureflags pro laufendem Attempt unveränderlich. Keine A/B-Experimente mit Lösungsschutz/Bewertung. UX-Versuche später auf Lehrkraft/Runde statt einzelnen gemeinsam arbeitenden Schülern zuweisen, Exposure tatsächlich erfassen. Vorab Metrik und Laufzeit, kein beliebiges Zwischenstoppen.
Spätere KI-Auswertung nur über autorisierte Aggregate; Antwort muss verwendete Filter/Zahlen/Abdeckung nennen. Korrelation und mögliche Ursache nicht als bewiesene Ursache ausgeben.

## 12. Volumen und Kosten
Volumenmodell = Runden × Teilnehmer × wenige Übergangsereignisse + Lehrervorgänge + KI-Calls + Diagnosen.
Illustration, keine Nutzungsprognose: 1.000 Runden × 30 Teilnehmer × 8 Übergänge = 240.000 Events, plus übrige Quellen. Bei 1 KiB je Event etwa 240 MB reine Payload, zusätzlich Indizes/Replikation/Overhead. Batch senkt HTTP-Anfragen, nicht automatisch Dokumentwrites.
Budget: Speicherung, Indexe, Schreib-/Lesevorgänge, Functioncalls, Export, Query, Traffic, Anbieter und Support getrennt. Aktuelle Preise erst bei Infrastrukturwahl recherchieren. Mehrere Länder/Browser/Versionen als Dimensionen nicht zu unkontrolliertem Kreuzprodukt aufblasen.
Exakte Abgaben/Kosten nicht zufällig samplen; technische Traces/Performance nach stabil dokumentiertem Verfahren. Samplingrate und Inklusionswahrscheinlichkeit mitführen; keine falschen Absolutzahlen aus Stichprobe.

## 13. Reihenfolge und Abnahme
0. Cloudinventar und Secure-/Games-/Native-Schreibwege ergänzen; Istbestand/Retention prüfen. Bestehende Nutzerfehler nicht wegen Analytics aufschieben.
1. Vertrag/Collector: Zweckmatrix, Quellen, Rechte, IDs, Löschung, Limits, Zustandsmodell.
2. Einen vollständigen Join-/Abgabeablauf instrumentieren; manuelle Tutorialabgabe separat prüfen. Synthetische reproduzierbare Szenarien und echte Geräte.
3. Vorhandenen Adminbereich um Release/Runde/Abdeckung ergänzen. Nicht zuerst dekorative KPI-Karten.
4. KI-Aufrufe/Lehreraktionen/aktive Vorbereitung mit Verbrauchabgleich; fehlende Daten statt Null.
5. Escape-MVP anschließen; lokales Aufgabenaggregat, echte Lehrerpilot-Runden.
6. Erst bei stabilen Daten Kohorten, Wirtschaft, Alarme und Experimente vertiefen.

Abnahmeszenarien: erlaubte Felder accepted; Name/Antwort/URL/Prompt rejected; Fremdtenant/Fremdattempt denied; Replay dedup; Konflikt rejected; 30 Teilnehmer inkl. Doppelreload; manueller/deadline/retry/offline Submit mit exakt einmaligem Serverabschluss; fehlende Ends unknown; Logout/WebView nicht doppelt; Cloudlog-Redaktion; Queueverlust sichtbar; Kosten teilweise unbekannt; Löschung/Restore geprüft; Collector aus ohne Unterrichtsstörung.
Done erst mit Quell-/Clienttests, Stagingnachweis, echten Geräte-/Pilotfällen und dokumentierter Erfassungsabdeckung. Nicht nur fünf Schema-Tests.

## 14. Offene Entscheidungen und nächste Arbeit
Noch benötigt: tatsächliche Cloudbestände/Retention; Schulen-/Mandantenmodell und Rollen; Rundenerwartungszahl; Legacy/Secure-Abgrenzung; native Telemetrieowner; rechtliche Zwecke; Supportzugriff/Löschfristen; KI-Verbrauchvollständigkeit; verfügbarer Budgetrahmen.
Technisch nächster ausführbarer Auftrag GC-TELEMETRY-01: Collector-Spezifikation aus dieser Strategie in konkrete Schemas, Berechtigungen, Firestore-Pfade/Indexe und idempotente Projektion übersetzen, dann isolierter Staging-Pilot. Keine Productionaktivierung aus diesem Plan ableiten.

## Quellen und Pflege
- Nutzer-DOCX WICHTIG GameCrew ChatGPT, identische Fassungen vom 01.10.2026.
- Codebelege oben; genaue Quellversion erhalten.
- EU-Verordnung 2016/679, insbesondere Zweckbindung, Datenminimierung, Speicherbegrenzung, Datenschutz durch Technik: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- OpenTelemetry GenAI-Konzept, Metadaten und optionale Inhaltsaufnahme, Stand 01.10.2026: https://opentelemetry.io/blog/2026/genai-observability/
Neue Events/Definitionen in dieser Strategie, Dictionary und betroffenen Tests gemeinsam aktualisieren. Dieser Plan ist kein Nachweis bereits vorhandener Analytics.
