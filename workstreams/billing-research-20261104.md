# GC-BILLING-PLAN-01 — Gratisversion, Preise, Lizenzen und Abrechnung

- Status: **plan_only**, Recherche und Plan geliefert; kein Implementierungs-/Verkaufs-/Deployauftrag.
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


## Lieferung / Entscheidungsfront —04.11.2026

- Bericht: [docs/billing/2026-11-04-entscheidungsbericht.md](../docs/billing/2026-11-04-entscheidungsbericht.md),17Abschnitte, kurze Martinempfehlung und ausführliche eigene Bewertung;71unterschiedliche Quellenlinks vor abschließender Zählung, amtliche/Anbieterprimärquellen und feste Repo-SHAs.
- Detaillierter Folgeplan: [2026-11-04-billing.md](../docs/superpowers/plans/2026-11-04-billing.md),Dateikarte/P0–P8/Abhängigkeiten/Owner/Testbelege;39–66Personentage unter klarem V1-Scope.50konkrete künftige Abnahmefälle M01–M50 im Bericht. **Nicht ausgeführt.**
- Empfehlung bleibt Vorschlag:3erStarter ohne Zeitablauf/Kreditkarte,ein persönlicherTarif und separater Schuljahresweg,StripePSP beiDE/Schulfokus,MoR bei internationalemSchwerpunkt;12,90/129EUR nur Hypothese,Schulpreisbeispiele zeigen Margenrisiko. Kein Humanvotum erfunden.
- D1 Angebot,D2 Verkäufer/Steuer/Anbieter,D3 Web/Schule/Applepriorität bleiben offen beim Nutzer;F1/F2Recherche geliefert, tatsächliche private Ist-/Steuer-/Vertrags-/ASCdaten ausdrücklich unbekannt.
- Qualifizierte Prüfstellen: Steuerberatung für USt/Rechnung/Archiv,Rechtsberatung für Verbraucher-/digitale Dienstleistung/Schulvertrag,vorhandenerPrivacy-/Schulowner für Rollen/Transfers und Nativeowner für Apple. Keine Rechts-/Datenschutzgarantie.
- Dokumentations-PR: https://github.com/HerrLoeffler/Hausaufgabe/pull/411 (draft). RemoteTeil1Commit9c3d556b3c0fbcb38194155a37da51903b6c8699; finalen Head/Tree im PR lesen. Keine Integration/Merge ausgeführt.
- VorFinalisierung frischerFetch: main weiterhin e4109f9, eigener Remote9c3d556b. Fremde neue Tutorial-/CIbranches erkannt und unberührt; gemeinsameTODO/Registry nur additiverDeltavorschlag im eigenenPR.
- Geprüft:17Berichtsabschnitte,50eindeutige Matrix-IDs,lokaleDokumentlinks,JSON/Registryeindeutig,Aufwandssummen und Kostentabellen separat nachgerechnet;git diff --check. Keine Anwendungs-/Payment-/Geräte-/Providerproben. Abschließendes Dokumentationsreceipt unter docs/billing/2026-11-04-nachweis.json.
- Status getrennt: Dokumentationbranch_only/plan_only; CI separat am aktuellenHead prüfen. Produktcode nicht verändert; Integration/Staginghosting/Functions/Rules/Nutzertest/Production aus diesem Auftrag **keine**. GRADECREW_STATE nicht geändert, weil kein Produktreleasestufenwechsel.
- Runtime weiterunknown, angefordertSol/high; keine Unteragenten oder direkten bezahlten Modellcalls; keine neue Kostenreservierung und keine Kundenmails/Schülerdatenabfrage.

## Wiederaufnahme / genau nächster Schritt

In eigenemisoliertenCheckout billing-research-20261104; lokale und Connectorcommits können bei identischemTreeverschiedeneSHAs besitzen. Vor Fortsetzung RemotePR411 und aktuellenmain neu lesen, nicht blind erneut sichern/integrieren. Shellpush scheiterte ausschließlich an fehlenderGitanmeldung; Connector erfolgreich. Keine Secrets dafür angefordert/geändert. AutomatischePRchecks können unabhängig laufen; vor Wiederholung frischenRunstatus prüfen,keine manuelle Actions-/Paidreview-Schleife gestartet.

**Genau ein nächster autorisierbarer Schritt:** Nach Martins echten AntwortenD1–D3 das PaketP0mit tatsächlichen Kosten-/Verkäufer-/Rechnungs-/Applebelegen konkretisieren. Produktumsetzung/Echtgeld/Production benötigt neuenkonkretenAuftrag. Dokumentationsintegration beim bestehendenIntegrationsowner;Registry bleibt activefür offeneProduktentscheidung,keinImplementierungsfortschrittbehauptet.


## Neuer Folgeauftrag 08.11.2026 — kleiner Web-Sandboxdurchstich

Martin beauftragt über dieselbe Zentrale einen extrem genauen, kleinen ausführbaren Web-Testplan auf der vorhandenen Oberfläche, Vorbereitung einer isolierten Testseite nur soweit bestehende Providerkonfiguration ohne Konto-/Key-/Vertragsneuanlage reicht. Dieselbe TaskGC-BILLING-PLAN-01/PR411, kein neuer Chat/keine neue Taskfamilie. Priorität Planreview und kleinster nächster Testschritt; kein39–66PT-Bigbang als Startbedingung. StageA: ein persönlicher Webtesttarif und Stripe-Sandbox; StageB: kleiner echter Pilot separat, nicht autorisiert.

Frischer main020f6f3/START/AGENTS/STATE/TODO/Registry/CONTRACT/RECOVERY gelesen. Eigenen sauberen Dokumentationscheckout mit identischem Remote8a0e229 und aktuellem main normal gemerged; lokale0954a7c/945c268, keine fremden Produktbranches geändert. Development Status neu:29aktive/40Überlappungen; PRliste mangels Token separat über Connector/öffentlicheAPI. PR411weiterdraft,unmerged. Alter Development-Status-Check41880145096grün; Handoff41880145029rot in allgemeinen Automatisierungstests, Koordinationsschrittgrün. Nicht als Codefehler des Billingprodukts ausgegeben und nicht blind wiederholt; main enthält inzwischen deren CI-Reparatur.

Öffentliche Vollhashprüfung08Nov:Live80c845796fcb1efc324b1a266944a13bb06d7334,215/215; Stage5be513d6f8cc90520efb63ee3c0d4e878e84df2d,230/230; beideManifestevor/nachAbrufstabil. Nur153Dateiengleich,39gemeinsamePfadeabweichend,23nurLive/38nurStage. DaherStagekonfigurationweiterverwenden,aberWebrahmenausaktuellerLivekompositionaufbauen,nichtganzeStagekopieren. Beleg docs/billing/2026-11-08-web-baseline.json. Keine privaten Daten in Beleg übernommen.

Vorhandene Auth-/Dashboard-/Editor-UI lesend geprüft. Bestehende Browsersitzung erkannt,nicht als Testkonto verwendet,keine Inhalte/Accounts/Schülerdaten exportiert,keine Formulare gesendet oder Tests geändert. Öffentlicher Livecode hat direkte Registrierung,aber keine bestätigte E-Mail-Codekette; PR303/HDF beschreibt getrennten vorbereiteten OTP-/Resendpfad ohne eingerichteten Maildienst. Kein pauschales Zusammenführen dieses Authbranches.

Kein gebundener Stripeconnector,keine Stripe/Billing-Envnamen,keine Stripe-Routen/SDK im gelesenen Produktbestand; tatsächliches Anbieter-/SecretManagerinventar ungeprüft, deshalb kein angeblich fehlendes Konto behauptet. Nutzbarer Stripe-Sandbox-/Clouddeployzugriff hier nicht verifiziert. Keine Keys angefordert,keine Konto-/Secretneuanlage. Kein Fakepaid-Backend und keine Previewveröffentlichung. Aktuelle Quelldateien nur temporäre Referenz,niemals mit Produktionsconfig als Testseite serviert.

Nächster Schritt: eigenständigen engen StageA/B-Plan und konkreten Previewvertrag auf Basis dieser Quellen schreiben,Annahmen/gesperrte Konfiguration explizit,nur Dokumentations-/Vorbereitungsartefakte im selbenPR. RuntimeModell/Effort unbekannt; dieser Auftrag erfordert übergreifende Architektur-/Isolationprüfung,kein Modellwechsel behauptet. Keine Unteragenten/Providergenerierungen/Reservierungen.
