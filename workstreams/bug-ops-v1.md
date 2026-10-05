# GC-BUGOPS-01 – BugOps / Fehler-Inbox und sichere Reparaturautomatik

Stand: 2026-10-04
Verantwortlicher Chat: aktueller GradeCrew-Hauptchat
Primary Branch: `feature/bug-ops-v1`
Integrationsziel: `feature/gradecrew-app-integration`
Production: **nicht freigegeben**

## Auftrag
Fehlerberichte von Lehrkräften/Kunden so verarbeiten, dass GradeCrew bei wachsender Nutzung nicht hunderte Einzelmeldungen manuell erzeugt. Gleiche technische Fehler werden zu Incidents gebündelt, nach Auswirkung priorisiert, im Adminbereich als handlungsorientierte Inbox dargestellt und – nur bei risikoarmen, eng begrenzten Fällen – für eine Guardian-Reparatur bis maximal verifiziertes Staging vorbereitet.

## Bereits vorhandene Basis
- `app.js`: „Problem melden“, Fingerprint, Release-/Umgebungsdaten, technische Breadcrumbs, Report-ID.
- `diagnostics.mjs`: begrenzte, inhaltsfreie technische Ablaufspur.
- `admin-log-tools.mjs`: Filter, Sortierung, Fehlergruppen, sanitiserter Diagnoseexport.
- Adminbereich: Ursache, Fix-Commit und Prüfnachweis; Fehler kann ohne Untersuchung nicht als erledigt markiert werden.
- Guardian V2: begrenzte Build-/CI-/3-Review-/Integration-/Staging-Kette für ausdrücklich zugelassene Web-Dateien.

## Zielbild bei 1.000+ Nutzern
1. Einzelmeldungen bleiben als Rohbelege erhalten, werden aber über Fingerprint/Release/Aktion zu Incidents gruppiert.
2. Ein Incident führt betroffene Nutzer, Meldungen, Vorkommen, erste/letzte Sichtung, Versionen/Umgebungen und Trend zusammen.
3. Priorität ist nachvollziehbar, nicht nur KI-Meinung: Schweregrad, Production/Staging, Zahl unterschiedlicher Melder, Häufigkeit und Wiederauftreten nach Fix.
4. Martin wird **nicht pro Meldung** benachrichtigt. Sofort sichtbar/zu melden sind nur:
   - neuer P0/P1-Cluster,
   - stark wachsender Cluster,
   - Autopilot-Blocker, der eine Entscheidung braucht,
   - verifizierter Staging-Fix mit offenem Retest,
   - Regression nach einem Fix.
   Alles andere wird im BugOps-Board gebündelt.
5. Ein erfolgreicher Fix schließt keinen Incident blind. Nach relevantem Codewechsel wechselt er auf `retest_required`; alte Abnahmen gelten nicht für einen neuen SHA.
6. Production bleibt immer manuell freigegeben.

## Risikoklassen
### Grün – Autopilot bis Staging grundsätzlich zulassbar
- kleine Web-UI-/Layout-/Text-/Darstellungsregressionen,
- klar reproduzierbar,
- exakte bestehende Web-Allowlist/Dateigrenzen,
- Regressionstest möglich,
- keine Nutzer-/Prüfungs-/Rechte-/Zahlungsdaten betroffen.

### Gelb – Diagnose/Fix-PR, keine automatische Integration
- komplexere App-Logik,
- KI-Verhalten,
- Datenmigrationen,
- unklare oder releaseübergreifende Ursache.

### Rot – niemals autonom freigeben
- Auth/Rollen, Security, Firestore Rules, IAM/Secrets,
- Zahlung/Billing,
- Datenverlust/Restore,
- Prüfungs-/Bewertungslogik, Lösungsschutz, Freitextbewertung,
- native Apps,
- Datenschutz/Rechtsmeldungen,
- unklare Provider-/Dispatch-/Kostenresultate.

## V1 – konkrete Implementierung
- `bug-ops.mjs`: deterministische Incident-Bildung, Priorität, Trend-/Benachrichtigungsentscheidung und Autopilot-Grenze.
- Tests für Deduplizierung, eindeutige Nutzer, P0/P1/P2/P3, Production-Eskalation, Retest und Red-Flag-Ausschlüsse.
- Adminbereich: BugOps-Zusammenfassung vor der bisherigen Feedbackliste; keine zweite Datenwahrheit.
- Feedback nicht mehr als kompletter Firestore-Bestand laden; zunächst 200 neueste + kontrolliertes Nachladen.
- Sanitisiertes Incident-Exportformat als spätere Guardian-Quelle: keine Namen, E-Mails, Schülerantworten, Testinhalte, Tokens oder rohe Uploads.
- Guardian-Brücke erst nach sicherem Transport-/Berechtigungsprofil aktivieren. Kein GitHub-Token im Browser.

## Benachrichtigungsmodell
V1 zeigt die „Decision Inbox“ im Adminbereich. Späterer Versandkanal darf darauf aufsetzen, aber dieselbe Ereignislogik verwenden:
- `immediate`: P0, neue P1 in Production, Regression nach Fix.
- `action_needed`: Autopilot blockiert / menschliche Freigabe nötig.
- `retest_ready`: Fix auf Staging verifiziert.
- `digest`: alle übrigen offenen/ruhigen Incidents, maximal zusammengefasst.

Keine automatische E-Mail/Push-Schleife pro Rohmeldung.

## Sicherheits-/Datenschutzgrenzen
- Keine Schülerantworten oder Uploadinhalte in BugOps/Guardian-Handoff.
- Freitext wird nicht ungeprüft an Coding-Modelle weitergereicht.
- Sanitisiertes technisches Exportformat ist die einzige spätere Automationsquelle.
- Deduplizierung darf Kontakte nur intern zählen; keine Liste von Nutzeridentitäten im Agent-Auftrag.
- Versuchshistorie/Kostenbudget des Guardians niemals bei erneutem Nutzerbericht zurücksetzen.

## Nachweise vor Integration
- Modul-/Regressionstests grün.
- bestehende Diagnostics-Tests grün.
- bestehende Web Combined CI grün.
- reale Admin-Preview: viele gleiche Reports erscheinen als ein Incident.
- Pagination/Nachladen funktioniert.
- kein Deploy/keine Production-Aktion allein durch diesen Kickoff.

## Offene Punkte / nächster Schritt
Produktbranch vom **frisch geprüften** Integrationshead erstellen und V1 implementieren. Danach PR gegen den Integrationsbranch, CI prüfen, erst anschließend Staging-Deploy durch die bestehende Pipeline.


## Gesicherter Implementierungsstand – 2026-10-04 23:39 CEST

- Produktbranch: `feature/bug-ops-v1`
- Ausgangs-SHA Integrationsbranch: `461da164aaf6469da999f8fe3f5f2210036a6ebf`
- aktueller Produkt-SHA: `d703abb7d7bb23ba82c7cca8e3dfd0e10aef799d`
- PR: #133 → `feature/gradecrew-app-integration`
- PR ist aktuell mergebar.
- Vollständiger `AI Staging Checks` Run `37236813704`: **grün**, inklusive `bug-ops.test.mjs`, bestehender Web-/Security-/Emulator-Regressions und Staging-Build.
- Zusätzlich Admin-Control/Staging-Build Run `37236761070` auf vorherigem Produktstand: grün.
- Release-Stufe: **ci_green**; noch nicht integriert, nicht auf Staging deployed, nicht nutzergetestet.
- Production unverändert und nicht freigegeben.

### Bewusster Integrationsblocker
Offener i18n-PR #131 verändert ebenfalls `app.js`. BugOps wird deshalb nicht blind in den Integrationsbranch gemergt. Beide Änderungen müssen auf demselben aktuellen Integrationsstand zusammengeführt und erneut durch Combined CI geprüft werden.

### Was V1 bereits liefert
- gleiche technische Meldungen → ein Incident per Fingerprint,
- eindeutige Melder + Vorkommen statt Rohmeldungsflut,
- deterministische P0–P3-Priorisierung,
- Regression-nach-Fix-Erkennung,
- Benachrichtigungsklassen `immediate`, `action_needed`, `retest_ready`, `digest`,
- konservative Red-Flag-Sperre für Auth/Security/Rules/Zahlung/Prüfung/Datenschutz usw.,
- Admin-Decision-Inbox,
- Feedback-Pagination in 200er-Seiten statt Vollbestand,
- sanitisiertes Guardian-Incident-Format ohne Identitäten, Nachrichten oder Schülerdaten.

### Noch offen
1. i18n-Überschneidung auflösen und BugOps gegen den dann aktuellen Integrationshead neu prüfen.
2. Nach Integration Staging-Receipt abwarten und Admin-UI real testen.
3. Kanonische serverseitige Incident-Aggregation für >1.000 Nutzer ergänzen; die aktuelle V1 gruppiert die geladenen Seiten im Adminclient.
4. Sichere serverseitige Guardian-Brücke bauen. Browser erhält niemals GitHub-/Guardian-Schreibrechte.
5. Admin-weite Entscheidungsbenachrichtigung und später optionaler Digest-Kanal auf denselben Incident-Ereignissen aufsetzen.


## Verifizierter Staging-Stand – 2026-10-05 00:06 CEST

Der frühere i18n-Integrationsblocker ist erledigt. BugOps wurde bewusst mit dem aktuellen i18n-Stand zusammengeführt und anschließend in getrennten Schritten erweitert.

### Integriert
- PR #133: Web-Decision-Inbox, P0–P3, Regressionserkennung, 200er-Feedback-Pagination.
- PR #134: serverseitige, idempotente Incident-Aggregation aus `feedback/app_error`.
- PR #136: admin-only Attention-Summary, Badge an „Administration“, höchstens ein Hinweis pro Login und kanonische Incident-Lebenszyklen.

Aktueller gemeinsamer Integrations-SHA: `bb91ce3590d773472ece60c4dd881da729bd32c1`.

### Nachweise
- Combined CI: Run `37238513381` **success** auf exakt `bb91ce3…`.
- Admin-Control/Staging-Build: Run `37238513389` **success**.
- Hosting-Preview: Run `37238585607` **success**, Manifest/Dateihashes geprüft, Receipt Artifact `11316079411`, exakt `bb91ce3…`.
- AI Functions: Run `37238585657` **success**, Receipt Artifact `11316084527`, exakt `bb91ce3…`.
- Deploylog bestätigt `aggregateBugFeedback` und `getBugOpsSummary` in `europe-west1`.
- Assessment Functions desselben Zugs ebenfalls erfolgreich; BugOps verändert deren Logik nicht.
- Firestore Rules wurden **nicht** als eigene Stufe deployed. Das ist für BugOps V1 absichtlich nicht erforderlich: `bugIncidents` bleibt clientseitig server-only; Admin-UI liest nur die sanitiserte Callable-Summary.
- Production wurde nicht verändert.

Release-Stufe: **staging_deployed**. Nutzer-/Geräteabnahme: **offen**.

### Verhalten bei großer Nutzung
- Rohmeldungen erzeugen keinen Alarmsturm.
- Gleicher technischer Fingerprint wird serverseitig zu einem Incident gebündelt.
- Eindeutige Melder werden incident-lokal gehasht gezählt; Namen/E-Mails/Freitexte/Schülerantworten landen nicht im Incident.
- Admin erhält nur für `immediate`, `action_needed` oder `retest_ready` einen Attention-Zähler.
- Pro Login höchstens ein BugOps-Hinweis statt einer Meldung je Nutzerfehler.
- Öffnen der Administration führt bei Attention direkt in die BugOps-/Feedback-Ansicht.
- Incident-Lifecycle: `open` → `fix_recorded`/`monitoring` → `retest_required`; erneutes Auftreten nach Fix wird `regressed`.

### Noch **nicht** aktiv
Die automatische Reparatur aus echten Kundenmeldungen ist noch nicht freigeschaltet. Der nächste sichere Ausbau ist:
1. read-only Investigator untersucht reproduzierbare, sanitiserte Incident-Daten;
2. ermittelt Ursache, betroffene Dateien, Regressionstest und Risikoklasse;
3. nur eindeutig grüne Web-Fälle innerhalb der Guardian-Allowlist dürfen einen begrenzten Guardian-Auftrag vorbereiten;
4. gelbe/rote Fälle bleiben menschliche Entscheidung;
5. Guardian maximal bis verifiziertes Staging; Production weiterhin ausschließlich nach Martins ausdrücklicher Freigabe.

### Nächster ausführbarer Schritt
Auf dem verifizierten Staging als Admin einen technischen Testfehler melden bzw. einen vorhandenen Staging-Incident nutzen und prüfen:
`Problem melden → Incident entsteht/steigt → Administration-Badge → BugOps-Ansicht → Lifecycle`.
Erst danach den read-only Investigator und die Guardian-Brücke implementieren.
