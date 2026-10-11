# GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011 — Spiel Lerninsel

Stand:11.10.2026. Parent **GC-GAMES-ESCAPE-VISUAL-01**, abgeschlossene L1-Sicherung **GC-GAMES-LERNINSEL-L1** unverändert erhalten.

## Auftrag und Zuständigkeit

Martin möchte zuerst einen extrem ausführlichen überprüfbaren Plan zur hochwertigen Überarbeitung von Grafik, Bewegung, Handhabung, Klicks und Menü des ersten vollständigen Referenzabschnitts. Ausführender Dokumentationsowner: **GC · Lerninsel · Gameplay & Integration**, Chat01a12568-0502-7831-9451-a7f8d91ce950. Auftrag über ausschließlich koordinierende **GC · Lerninsel-Zentrale**,01a1183f-dad9-7640-8a82-23107c980d6e.

**Arbeitszustand: Plan und unabhängiger A/B-Planreview mit Gegenprüfung fertig zur Nutzerprüfung. Design-/Umsetzungsfreigabe offen.** Kein neuer Runtime-/Qualitätswert. Tests, Builds, Spielstarts, OS-Captures, Assets/Generierungen, Enginewechsel, Merges und Deploys dieses Auftrags: **keine**.

## Basis, Branch und Schutz

Spielbasis PR175@a5dc474295dea4abda06c5be8923de1bc0206248 am11.10.2026 erneut bestätigt, offen/draft, branch_only. Eigener sauberer exklusiver Checkout `/Users/martin/Documents/Codex/2026-10-10/gradecrew-lerninsel-integration/work/lerninsel-l1` wiederverwendet; neuer Dokumentationsbranch `docs/lerninsel-level1-plan-20261011` direkt von dieser Remote-Basis. Historische lokale L1-Refs/Dateien erhalten, ursprünglicher Source-Checkout und sources/ nicht geändert. Nur neue Dokumente unter docs/games/lerninsel/20261011-level1/ und diese Übergabe geändert. Runtime-/Asset-/Map-/Starter-/L1-/sharedET-/main-Regelfiles unberührt.

Main-Leseanker30c0e8e111ac88398d1f85ff19574e87f47df732. Development Status Run38137351207/Job114463831245: Lerninsel+19/−127 zu main, PR175; bekannte DesignPR173-/gitignore-Überschneidungen. Sie werden nicht durch diesen Dokumentationsauftrag integriert. Separater Draft **PR219** gegen `feature/lerninsel-ego-v1`; PR175 nicht ersetzt. Quellenmanifest nennt gelesene Einzeldatei-SHAs.

## Gesicherte Dokumente und Review

[Planmappe](../docs/games/lerninsel/20261011-level1/README.md), [Spielbrief](../docs/games/lerninsel/20261011-level1/spielbrief.md), [ausführlicher Plan](../docs/games/lerninsel/20261011-level1/referenzabschnitt-plan.md), [D/S-Schritt-/Direktvarianten](../docs/games/lerninsel/20261011-level1/auswahlvarianten.md), [Meilensteine](../docs/games/lerninsel/20261011-level1/meilensteine.md), [Prüfmatrix](../docs/games/lerninsel/20261011-level1/pruefmatrix.md).

Erster zusammenhängender lokaler Textcheckpoint4cab754, Präzisierung1caa38a. Remote-Entwurfscheckpoint d4ba1e7712acae29e10c60d41eaa568314d3a4bf. Beide unabhängigen Prüfer lasen denselben1caa38a-Stand und Rohquellen, nicht den anderen Erstbericht. Danach dieselben zwei gegenseitige Gegenprüfungen; kein dritter Prüfer und keine zweite volle Reviewrunde. [A](../docs/games/lerninsel/20261011-level1/PLANREVIEW-A.md), [B](../docs/games/lerninsel/20261011-level1/PLANREVIEW-B.md), [Befunde/Entscheidungen/Gegenprüfung](../docs/games/lerninsel/20261011-level1/GEGENPRUEFUNG-UND-ENTSCHEIDUNGEN.md).

Gezielt korrigiert: exaktes Plateau/Rampensynchronisation, Startterminalguard gegen Fortschrittsverlust, echter isolierter Continuation-GameMode/Slotvertrag vor allenLoads, geloggte Character-Recovery, Ganzsteinblau auch richtig/falsch, profilgebundene knappeCopy, sichtbare Schrittmitte/Rearm, Lernaufgaben100/200 versus Weltterminals10/20, redaktionelle Lesbarkeit. Alle künftigen Runtimefälle bleiben NICHTGEPRÜFT. A/B haben Plantragfähigkeit beurteilt, nicht Produkt/Kinder/Geräte freigegeben.

## Skills, Modelle und Budget

Gelesen: `/Users/martin/.codex/plugins/cache/openai-curated-remote/superpowers/6.4.2/skills/brainstorming/SKILL.md`, `writing-plans/SKILL.md`; `/Users/martin/.codex/skills/gradecrew-review-retro/SKILL.md` samt review-record. Anwendung: Zweck/Scope spiegeln, konkretes Briefing/Plan/kleine Tasks, getrennte Standards-/Specprüfung und exakte Evidenzgrenzen. Der direkte Mensch will fertigen Plan zuerst, deshalb keine vorzeitige Umsetzungs-/Freigabeschleife. Keine 3D-Rekonstruktion im Dokumentationsauftrag; img2threejs/Blender nicht ausgeführt.

Requested Planowner Sol/medium, actual laufenderRootturn unbekannt. A/B ausdrücklich als gpt-6.1-sol/medium dispatcht; tatsächliche Runtimekonfiguration von beiden als unknown gemeldet.0Modellwechsel, kein Astra. [Ledger](../docs/games/lerninsel/20261011-level1/model-review-ledger.json). Usage/Preise unbekannt; keine direkte kostenpflichtige Provider-/Bildaktion. Historische Budgets/Versuche nicht zurückgesetzt. Keine Nachrichten an andere Chats.

## Koordinationsrest und nächster Schritt

Gezielter [TODO-/Registry-Ownerpatch](../docs/games/lerninsel/20261011-level1/TODO-REGISTRY-OWNER-PATCH.md) gesichert, noch nicht auf gemeinsames main angewendet. Vorhandenen Primary-Branch nicht duplizieren; neuer Dokumentationsbranch als related zuordnen. Web-/Staging-/Productionstand unverändert.

**Genau nächster Schritt:** Martin prüft die fertige Planmappe und entscheidet D oder S/Referenzschnitt; erst ein gesonderter ausdrücklicher Folgeauftrag startet Umsetzung. Quellstand/PR/Owner vor einem späteren Start erneut abgleichen, keine Tests oder Artefakte blind wiederholen.
