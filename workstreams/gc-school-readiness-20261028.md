# GC-SCHOOL-READINESS-20261028 — Übergabe

Stand: 28.10.2026, Europa/Berlin. Fachchat aus GradeCrew Zentrale, Thread-ID dieses neuen Chats hier nicht verlässlich verfügbar; ursprünglicher Chatlink unbekannt. Task-ID GC-SCHOOL-READINESS-20261028. Arbeitsbranch `docs/gc-school-readiness-20261028`, Integrationsziel `main`. Keine Produkt-/Infrastrukturänderung. Production unverändert; keine Freigabe erteilt.

## Auftrag und Scope
Belegte Machbarkeit für schulische GradeCrew-Nutzung, Datenstandorte, Export/Ablage und KI-gestützte Bewertung; Vorschläge und offene Schul-/Anbieterentscheidungen. Kein echter Schülerdatenabruf, kein bezahlter Modelltest, keine Migration. Bestehende Owner GC-LAUNCH-CONTROLS-01, GC-RESTORE-01, GC-CLASSROOM-01, GC-SECURITY-02 und aktive Wilma-Arbeit nicht übernehmen.

## Gesicherter Stand
- GitHub-Zugriff bestätigt. `START_HERE.md`, `AGENTS.md`, `docs/CHAT_CONTRACT.md`, `TODO.md`, `GRADECREW_STATE.json`, Registry/Assurance/Recovery auf main gelesen. Main bei Start `0d28149286bbff3eec5a5a1a0a884e9d8d47a27a`; Integrationsbranch `5e45e9df2449ca7e4c4b735ae754452a6f304ab7`.
- Bericht: [docs/research/gc-school-readiness-20261028.md](../docs/research/gc-school-readiness-20261028.md), erster Dokumentationscommit `ffa0975dedf9a093c0da6aa49964c144fbc9d234`.
- Offizielle aktuelle Quellen: KI-VO konsolidiert 27.07.2026/Art.113 mit Anhang-III-Geltung ab 2.12.2027; KM Bayern digitale Leistungsnachweise/§§37,40 BaySchO; Firebase/Google und OpenAI regionale Produkt-/Retentiondocs. Quellen im Bericht.
- Codeprüfung ausschließlich lesend: Firestore-Assessment-Abgabe/Receipt, CSV, manuelle Updatebewertung, OpenAI-Client/Modelle, PostHog-Staginggate und vorhandener Restorebericht. Kein Deploy oder Modellaufruf.
- Lokaler `git fetch` in einer alten Doku-Arbeitskopie scheiterte wegen DNS; GitHub-Connector funktionierte. Alte Kopie nicht für aktuellen main ausgegeben. Keine Daten/Secrets in Bericht.
- Modell/Aufwand: vom Fachchat nicht separat angefordert; tatsächlich beobachteter Runtimewert `unknown`. Schwierigkeit: rechtlich/architektonische Analyse. Keine Umschaltung innerhalb aktiver Aufgabe.
- Verifikationsstand: Dokument und Quellen manuell gegengeprüft; keine CI/Tests für diese reine Recherche. Branch-only; Draft-PR #366 offen, nicht integriert, kein CI-/Release-/Deploynachweis. PR vor Abschluss auf drei Dokumente geprüft. Keine laufenden externen Requests/IDs, außer hier genannten GitHub-Dokumentationsmutationen; Budget/Versuche für bezahlte Provider unverändert (0 neue Aufrufe).

## Offen
1. Schulart, Träger, Verantwortlicher, Pilotstufe und amtliche Verwaltungsablage.
2. Aktuelle Cloud-Adminorte für Live-Storage, Cloud Logs, Backups, Supportzugriff; OpenAI-Projektregion/MAM/ZDR/Verträge; PostHog-Aktivierung/AVV.
3. Juristische Einordnung der konkreten KI-Bewertung und Schuleinführung; aktive Wilma-Branchresultate vor Umsetzung abgleichen.
4. Dokumentations-PR prüfen und integrieren; Produktarbeit braucht gesonderten konkreten Auftrag und Freigaben.

**Genau nächster Schritt:** Schul-/Trägeranforderung und technische Dienstinventarliste in einem gemeinsamen Entscheidungsblatt vervollständigen; daraus die Export-MVP-Spezifikation und das separate KI-Gate ableiten.

## Fortsetzung 28.10.2026 · EU-only/IONOS-Frage

Martin fragt nach einem Umzug auf „alle in Europa“, IONOS-Server, Entwicklungsort, ChatGPT-Europa, weiteren KIs und Paddy-Vergleich. Entscheidung noch offen; kein Auftrag zur Durchführung/Production. Lesende Prüfung: offizielle Paddy-FAQ/Datenschutzhinweise/Löschfristen, IONOS Model Hub, Firebase-Standort, OpenAI-EU-API/ChatGPT Enterprise/Edu, Claude Bedrock und Google EU-Endpunkte. Befund/Nachweise im Berichtsnachtrag. Modell/Aufwand für diesen Turn nicht separat angefordert; Runtimewert unknown. Keine bezahlten Provideraufrufe, Änderungen an Produktcode, CI, Integration, Staging oder Production.

Offen (Owner): Martin/Schule definiert striktes EU-/DE-only und Pilotstufe; Betreiber belegt aktuelle Datenflüsse, AVV, Unterauftragnehmer, Regions-/Log-/Backup-/Supportorte; Fachchat bewertet synthetischen IONOS-/Regionalmodell-Pilot nach Qualität und Aufwand; Schul-DSB/Träger entscheidet über Zulässigkeit. Genau nächster Schritt: einseitige Standort- und Datenfluss-Matrix für die bestehende Live-Architektur vervollständigen und damit den Pilotumfang festlegen.
