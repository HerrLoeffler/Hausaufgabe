# Ausführung bis zum geprüften Staging-Stand

Der separate Execution-Controller ergänzt den read-only Development-/Release-Status. Ein Statuslabel, ein Registry-Eintrag, eine Modellantwort oder eine manuelle workflow_dispatch-SHA sind **keine** Freigabe.

## Tatsächlich angeschlossene Kette

1. Ein betreuender Repo-Agent konkretisiert einen Nutzerauftrag als `agent-queue/<id>.json`: aktueller voller Integrations-SHA, exakte Dateien, Akzeptanzkriterien und Kostenbudget. Vorlage: `automation/pilot-task.template.json`. Bestehende parallele Arbeit zuerst prüfen. Auftrag mit CI auf main sichern.
2. `Admit one Guardian task` prüft main-Auftrag, aktuellen Zielbranch, Credentials, aktivierte Variablen und fehlende frühere Versuchshistorie. Aufnahme in Policy mit Compare-and-swap, danach expliziter Guardian-Dispatch. Kein stiller Budgetreset.
3. Guardian reserviert Versuch **und** konservatives Budget dauerhaft auf `automation/guardian-state`, bevor ein Worker startet. Ein Request besitzt genau einen Workflow-Run; Reruns starten keinen weiteren bezahlten Bau-Aufruf.
4. Der neue begrenzte Worker liest ausgewählte Quelltexte und erzeugt vollständige Textänderungen in einem Responses-Aufruf. Kein Shell-/Repo-Schreib-/Cloud-Werkzeug für das Modell. Der bisherige `codex-worker.yml` bleibt ein isolierter alternativer Worker; seine älteren Artefakte erhalten keine automatische Publikationsfreigabe.
5. Ein anderer Job prüft den Datenvertrag und schreibt nur zulässige Dateien in einen eigenen Git-Tree, Commit und Draft-PR. Keine Modellbefehle, Binärdateien, Symlinks, Submodule, Credentialmuster oder Tests-Abschwächung übernehmen.
6. Eine zusätzliche Lieferprüfung bindet jeden geänderten Pfad an das physische Hosting-Paket: Projekt/Commit, Manifest-Eintrag, Datei und Hash sowie Syntax aller geänderten JS/MJS. Eine nur auf GitHub liegende, vom Builder ignorierte Datei qualifiziert nicht für Reviews oder Integration. Neue Module brauchen zuerst eine ausdrücklich geprüfte Build-Anbindung.

Die feste Combined-Prüfung läuft auf genau diesem direkten Nachfolger des freigegebenen Zielstands. Ein eigener Linux-Nutzer ohne sudo/GitHub-Schreib-/Provider-/Cloud-Credentials führt Produktcode aus und kann die außerhalb seiner Quellkopie liegende Prüflogik/Nachweise nicht überschreiben. Dependencies, Functions, Assessment, Firestore-Emulator, UI-/Crew-/Emmi-/Tutorial-Regressionen und Staging-Build werden geprüft.
7. Erst danach prüfen drei unabhängige Modellaufrufe: GPT-6 Astra für Korrektheit, Claude Sonnet 5.5 für Sicherheit/Auftragserfüllung und GPT-6 Sol für QA, Nutzerabläufe, Regressionen und Akzeptanzkriterien. Alle drei sehen Ausgangsquellen, Änderungen und genaue SHA-/Digest-Bindung. Refusal, unvollständige Ausgabe, falsches Modell, fehlende Usage, widersprüchliches Urteil oder Budgetüberschreitung blockieren.
8. Integration nur bei drei Freigaben, erfolgreicher exakter Prüfung und unverändertem Ziel-/PR-Head. Gewöhnlicher Fast-forward, niemals Force-Push oder ungeprüfter Konfliktmerge. Ein zwischenzeitlich fortgeschriebener Branch wird erhalten. Der PR wird mit dem Integrationsnachweis kommentiert/geschlossen; GitHub zeigt diese direkte Ref-Integration nicht als normalen PR-Merge.
9. Explizite `Guardian integrated checks` schließen die GitHub-Token-Lücke: Bot-Pushes lösen andere Actions nicht automatisch aus. Der Dispatch erhält nur eine Reservation-ID; Quelle wird aus dem Ledger abgeleitet. Erfolgreiche feste CI erzeugt einen gebundenen Nachweis.
10. Bestehende Hosting-/AI-Functions-Workflows akzeptieren ihren bisherigen push-basierten CI-Pfad und diesen nachgewiesenen Guardian-Pfad. Quelle, Policy und aktueller Branch werden vor Cloud-Login erneut geprüft; WIF-/Projekt-/Codebase-/Hosting-Scope bleiben auf Staging begrenzt.
11. Guardian und Release Control lesen echte, digestgeprüfte CI-/Deploy-Receipts. Hosting und Functions müssen denselben aktuellen SHA haben. Neuere Fehler oder fehlende Nachweise bleiben sichtbar. Erst dann `staging_deployed`; Geräteabnahme und Production-Freigabe werden nicht erfunden.

## Reparaturen, Kosten und Stopps

- Maximal drei Bau-/Reparaturversuche insgesamt pro genehmigtem Auftrag, auch nach SHA-Wechsel kein stiller Reset. Das ist konservativer als drei neue Versuche auf jeder Teilstufe.
- Nur tatsächlich ausgeführte fehlgeschlagene Tests oder vollständige Reviews mit konkreten Blockern lösen eine neue Bau-Runde aus. Vorherige Änderungen und begrenzte Test-/Review-Fehler werden mitgegeben. Identische erfolglose Reparaturen zahlen keine erneuten Reviews.
- Provider-/Dispatch-/Schreib-Ambiguität, fehlende Einrichtung, Dependencies-Ausfall, Kontrollcode-Wechsel oder Zielbranch-Konflikt stoppen zur Diagnose. Keine automatischen Rechteerweiterungen oder API-Retries.
- Ein qualifizierter fehlgeschlagener Deploy desselben Stands darf zwei begrenzte `rerun-failed-jobs` erhalten; Reservierung vor API-Aufruf. Keine Wiederholung unbekannter Rerun-Rückmeldungen. Dauerhafte IAM-/Deploy-Fehler bleiben nach drei Deployversuchen Blocker.
- Pro Versuch konservativ $5.50 reserviert, Auftrag maximal $16.50, UTC-Tag maximal $33.00. Input-/Output-Grenzen pro Modellaufruf; keine Tools, API-Fallbacks, Tier-Upgrades oder ungeprüften Modellwechsel. Vollständige Reservierung bleibt auch bei unklarer Abrechnung bestehen.
- GPT-6.1 Sol baut; Astra/Claude/Sol prüfen. Preise als konservative Obergrenzen auf Basis offiziell geprüfter Preislisten vom 03.10.2026; vor 03.11.2026 neu qualifizieren. Usage-Schätzung ist keine Rechnung. Zusätzliche Cloud-/Actions-Kosten sind nicht Teil des API-Budgets.
- Release-Control-Bericht zeigt Aufgabe, Versuch, Stufe, Run, Modelle, bekannte Nutzungsschätzung und Reservierungen. Keine erfundenen Einsparungen oder Qualitätsprozente.

## Zulassung V2 und Grenzen

Aktuell ausschließlich kleine ausdrücklich benannte Web-UI-Dateien auf `feature/gradecrew-app-integration`: bis acht bestehende beschreibbare Dateien plus höchstens zwölf Kontextdateien. Gesamtkontext ist begrenzt; große Module benötigen zunächst einen nachvollziehbaren kleineren Auftrag. Backend, Prüfungslogik, Firestore Rules, IAM, CI, Deployment, Secrets, native Apps und bestehende Tests dürfen vom Modell nicht verändert werden. Diese Workstreams benötigen ihre gesonderten Zulassungs-/Cutover-/Signierungsprofile, nicht eine größere pauschale Allowlist.

Dies bestätigt technische Hosting-/AI-Functions-Synchronisation für einen unveränderten Rules-Stand. Es bestätigt **nicht** die Freigabe des gesamten Prüfungsprodukts, Games oder iOS. Deren offene Gates bleiben im bestehenden Release Board.

Ohne dedizierte Secrets, aktivierte Flags, konkreten aufgenommenen Auftrag und realen Pilotlauf ist die Kette implementiert, aber nicht als aktiv oder Ende-zu-Ende verifiziert zu melden. Anleitung: `docs/AUTOMATION_SETUP.md`.

Die zusätzliche QA verwendet den vorhandenen dedizierten OpenAI-Review-Key. Vier getrennte Aufrufe mit vier Modell-IDs; Prüfer erhalten keine Antworten der anderen Prüfer. Aus den konservativen vollständigen Kontext-/Output-Grenzen ergibt sich eine API-Obergrenze von $5.09 je Versuch; die unveränderte Reservierung von $5.50 deckt diese ab. Quelle für GPT-6 Sol: https://developers.openai.com/api/docs/models/gpt-6-sol (04.10.2026, $2/$10 je Million Input-/Output-Tokens). Account-/Modellzugriff bleibt erst im echten Pilot bestätigt.

## Quellen

- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models/gpt-6.1-sol
- https://developers.openai.com/api/docs/models/gpt-6-astra
- https://developers.openai.com/api/docs/pricing
- https://platform.claude.com/docs/en/models/overview
- https://platform.claude.com/docs/en/api/messages/create
- https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow


## Kleines Kostenprofil und vorbereiteter Pilot (04.10.2026)

`cost_profile` im Auftrag ist unveränderlich an dessen Hash gebunden. Fehlt es, bleibt der bisherige Vertrag `standard-v1` kompatibel; eine Budget-/Profiländerung ist keine automatische Reparaturfreigabe.

| Profil | Kontextgrenze Bau / je Review, einschließlich Overhead | Max. Ausgabetokens Bau / je Review | Reservierung Versuch / Auftrag |
|---|---|---|---|
| standard-v1 | 80.000 / 160.000 Bytes | 24.000 / 6.000 | 5,50 / 16,50 USD |
| small-web-v1 | 12.000 / 24.000 Bytes | 6.000 / 2.400 | 0,85 / 2,55 USD |

Die vier Modelle und alle drei unabhängigen Abschlussgates bleiben gleich. Die Bytegrenzen werden konservativ als Tokens bepreist, kein angenommener Cache-Rabatt. Aktuelle Standardpreise am 04.10.2026: GPT-6.1 Sol 2/10, Astra 10/50, GPT-6 Sol 2/10, Sonnet 5.5 2/10 USD je Million Input-/Output-Tokens. Damit beträgt die rechnerische volle Vier-Aufruf-Grenze beim kleinen Profil 0,588 USD; die Reservierung 0,85 USD deckt zusätzlich eine 10%-Verarbeitungsprämie. Beim unveränderten großen Profil ergibt sich 3,06 USD gegenüber der weiter konservativen Reservierung 5,50 USD. Dies aktualisiert frühere höhere Preisansätze/5,09-USD-Berechnungen, ohne bestehende Budgets still zu verändern. Tatsächliche Rechnungen und Cloud-/Actions-Kosten separat prüfen.

Zu großer Kontext wird vor dem Provideraufruf abgelehnt, nie still gekürzt oder auf das große Profil umgeschaltet. Unvollständige Ausgaben bleiben Blocker, keine automatische bezahlte Wiederholung. Gesamthistorie einschließlich unbekannter Kosten zählt weiter gegen Aufgaben- und Tagesbudget.

Der konkrete noch nicht aufgenommene Pilot liegt unter `agent-queue/pilot-tutorial-later-a11y-20261004.json`: nur `tutorial-choice-v1.css`, Verbesserung des Später-Buttons für Touch und Tastatur, `small-web-v1`, gepinnter Integrations-SHA. Vor Aufnahme muss dieser SHA weiterhin aktuell sein. Geräteabnahme und Production bleiben menschlich.
