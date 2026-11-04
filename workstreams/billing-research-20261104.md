# GC-BILLING-PLAN-01 — Gratisversion, Preise, Lizenzen und Abrechnung

- Status: **plan_only**, Recherche läuft; kein Implementierungs-/Verkaufs-/Deployauftrag.
- Verantwortlicher Fachchat: ausdrücklich von GradeCrew-Zentrale 01a10df6-736b-7a62-bd38-2724cf254c2e delegierter Billing-Recherchechat; eigener Chat-Link unbekannt.
- Branch: docs/billing-research-20261104; Basis main e4109f9fe04bed8cb05a90ba58531ac2be22e63a; Integrationsziel main ausschließlich Dokumentation.
- Scope: eigene Recherche, Entscheidungsbericht und ausführbarer Folgeplan; TODO/Registry-Deltas im eigenen PR. Produktcode, Konten, Keys, Preise, Verträge, Mails und Deploys ausgeschlossen. sources/ unverändert.
- Modell angefordert: Sol/high wegen verzahnter Architektur-, Kosten-, Apple- und Rechtsfragen; tatsächlich verwendetes Runtime-Modell/Effort unknown. Keine Unteragenten, keine bezahlten Providerproben; keine neue Budgetreservierung.

## Bestandsabgleich / Checkpoint

04.11.2026: aktuelles main START_HERE, AGENTS, STATE, TODO, Workstream-README/Registry, CHAT_CONTRACT, CHAT_RECOVERY und Skill-/Assurance-Einstiege gelesen. Isolierter Clone. Frischer Fetch und read-only development_status ausgeführt. Das Werkzeug überspringt PR-Abgleich mangels GITHUB_TOKEN; öffentliche GitHub-API ergänzt den tatsächlichen offenen PR-Bestand. Keine vorhandene Billing-/Subscription-Task/Primarybranch gefunden; verwandte Kosten-, Telemetrie-, Schul-, Native- und Wilmaaufträge bleiben deren Ownern zugeordnet. Report des Live-Audits nur Snapshot, keine Deployfreigabe. Gemeinsamer Webbranch und main haben stark unterschiedliche Historien; später kein pauschaler Merge des Produktcodes.

Öffentlicher Live-Manifestabruf zeigt hausaufgabe-staging/production/69414965; Manifest allein beweist keinen Functions-/Rules-/Geräte-/Paymentstand. Wilma-HDF beschreibt inzwischen gemeinsame 20EUR-Monatsgrenze, Stage-/Liveanteile und bestätigten Fundus; das ist weder ein Kundenpreis noch Ist-Kosten pro Lehrer. Vorige Pilotgrenzen/Versuchshistorie erhalten.

## Offene Entscheidungsfront

- F1 Fakt: bestehende Produktpfade, Provider und Ledger — Recherche läuft.
- F2 Fakt: aktuelle PSP-/Apple-/Rechtsbedingungen — offizielle Primärquellen recherchieren.
- P1 Präferenz, Martin, nach F1/F2: Gratisvariante und bezahltes Angebot — noch nicht entschieden; Bericht liefert drei Kandidaten.
- P2 Präferenz/Fakt, Martin + qualifizierte Beratung: Verkäufer-/Steuerstatus und Zahlungsanbieter — offen, keine Kontoeröffnung.

## Wiederaufnahme

Letzter gesicherter Schritt: Einstieg, Scope und Bestandsabgleich. Laufende externe Produkt-/Payment-/KIvorgänge durch diesen Auftrag: keine. Vor Wiederholung die eigenen Commits/PRs und /tmp/gc-billing-source sowie /tmp/gc-billing-development-status.* abgleichen. Fremde Jobs nicht neu starten. Nächster Schritt: Primärquellen und Codebefunde in docs/billing/2026-11-04-entscheidungsbericht.md ausarbeiten, anschließend Quellen-/Zahlen-/Vollständigkeitsprüfung und gesicherten PR erstellen.

## Zwischenstand 04.11.2026 — Bericht Teil 1

Abschnitte1–7 lokal ausgearbeitet: belegter Source-/Hostingstand, drei Gratisansätze, konkrete Starter-/Plusbeispiele, nachvollziehbare Kostensensitivität, vier Zahlungswege und Zustandsdiagramm/-tabelle. Werte ausdrücklich Vorschläge. Neue wichtige externe Befunde: Apple-EUbedingungen seit01Oct2026; TTSabschaltung06Jan2027; Stripe erzeugt strukturierte E-Rechnungen nicht automatisch. Keine APIgenerierungen/Zahlungen.
Remotecheckpoint f5f7512153c42388f4a37b5026b0c22f73209eef ist inhaltlich gleich lokalem a23ce5a, Tree4991635b. Shellpush war mangels Credentials nicht möglich; verbundener GitHub-Connector sicherte Dokumentation mit normalem Fast-forward. Kein Auth-/Secretwechsel. Nächster Schritt: Architektur, deutsche Rechnungspflichten/Apple, Adminbetrieb und genaue Umsetzung/Abnahmematrix ergänzen.
