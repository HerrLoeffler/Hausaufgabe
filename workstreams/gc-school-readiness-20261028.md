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
- Verifikationsstand: Dokument und Quellen manuell gegengeprüft; keine CI/Tests für diese reine Recherche. Branch-only; PR/Integration/Release noch separat nachtragen. Keine laufenden externen Requests/IDs, außer hier genannten GitHub-Dokumentationsmutationen; Budget/Versuche für bezahlte Provider unverändert (0 neue Aufrufe).

## Offen
1. Schulart, Träger, Verantwortlicher, Pilotstufe und amtliche Verwaltungsablage.
2. Aktuelle Cloud-Adminorte für Live-Storage, Cloud Logs, Backups, Supportzugriff; OpenAI-Projektregion/MAM/ZDR/Verträge; PostHog-Aktivierung/AVV.
3. Juristische Einordnung der konkreten KI-Bewertung und Schuleinführung; aktive Wilma-Branchresultate vor Umsetzung abgleichen.
4. Dokumentations-PR prüfen und integrieren; Produktarbeit braucht gesonderten konkreten Auftrag und Freigaben.

**Genau nächster Schritt:** Schul-/Trägeranforderung und technische Dienstinventarliste in einem gemeinsamen Entscheidungsblatt vervollständigen; daraus die Export-MVP-Spezifikation und das separate KI-Gate ableiten.
