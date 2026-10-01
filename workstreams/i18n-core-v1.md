# Aufgabe: GC-I18N-02 – deutscher i18n-Refactor vor Sprache 2

- Aktualisiert (UTC): 2026-10-01T23:28:00Z
- Verantwortlicher Chat / Auftrag: Internationalisierung; Web-Code vollständig hinter eine gemeinsame i18n-Grenze stellen, weiterhin ausschließlich Deutsch, dann Gerätetest durch Nutzer, erst danach zweite Sprache.
- Arbeitsbranch: `feature/i18n-german-refactor-v1`
- Ausgangsbasis: `7063aee3815fc4f5a58e443318cf2c80839719a7` (`feature/gradecrew-app-integration`)
- PR #20: erfolgreich in den Staging-Integrationsbranch gemergt.
- Integrationscommit: `b092ef5d106eda8266eff822bade8f4795bf68f3`
- Alter PR #17: geschlossen/ersetzt; nicht verwenden.

## Rückfallebene

Vor dem Umbau wurden zwei unveränderte Git-Referenzen angelegt:

- `backup/staging-functional-pre-i18n-2026-10-02` -> `4707c45ef573bf85f81655791edf909862e4f2a6`
- `backup/app-integration-pre-i18n-2026-10-02` -> `74eb2ec08e81315875abfc4b1ae052d9f78797eb`

Zusätzlich existiert für die unmittelbar vorherige aktuelle Staging-Basis `7063aee3815fc4f5a58e443318cf2c80839719a7` ein verifizierter GitHub-Prerelease-Hosting-Snapshot `preview-snapshot-7063aee...` mit `hosting-snapshot.zip`, `SHA256SUMS` und `snapshot.json`. Dieser Snapshot sichert Hosting-Dateien, nicht Datenbank, Auth, Storage, Functions oder Rules.

## Implementiert

### Locale-/Prüfungsverträge
- `de-DE` bleibt die einzige aktivierbare UI-Locale.
- BCP-47-Normalisierung und deterministische UI-Priorität.
- UI-, Inhalts- und Bewertungssprache getrennt.
- Bildungskontext und Zeitzone separat.
- reproduzierbarer Locale-/Policy-Snapshot für Prüfungen.
- `Intl`-Formatierung und striktes Locale-Zahlenparsing.

### Browserweite UI-Grenze
- gemeinsamer Core/Browser-Runtime unter `shared/i18n/`.
- deutscher Quellkatalog `messages-de-DE.mjs`; keine zweite Locale vorhanden.
- Lehrer-App lädt i18n vor `app.js`.
- Secure-Student lädt dieselbe i18n-Grenze vor seiner Runtime.
- bestehendes Deutsch ist bei `de-DE` absichtlicher No-op.
- spätere dynamische DOM-Texte/Attribute und Browser-Dialoge können über dieselbe Grenze lokalisiert werden.
- MutationObserver wird erst bei einer Nicht-Quellsprache aktiv; aktuelles Deutsch verursacht keinen zusätzlichen DOM-Umbau.
- nicht freigegebene UI-Locale kann nicht versehentlich aktiviert werden.

### Build / Tests
- aktueller Staging-Build enthält Crew/Emmi/Tutorial-Arbeit plus die i18n-Runtime.
- Integrations-/Vertragstests verhindern Sprache 2 in dieser Stufe und prüfen Lade-Reihenfolge/Build-Inhalt.
- vollständige bestehende Staging-CI läuft auch für i18n-Branches.

## Bewusst unverändert bis Sprache 2

Siehe `shared/i18n/NON_DOM_INVENTORY.md`.

- CSV-/Datei-Exporte erhalten später einen eigenen Export-Katalog.
- deutsche KI-Systemprompts bleiben unverändert, damit KI-Verhalten jetzt nicht verändert wird.
- deutsche sprach-/fachspezifische Validatoren bleiben unverändert; neue Inhaltssprachen benötigen eigene Regeln bzw. Lehrerprüfung.
- Prüfungsinhalte werden nie automatisch durch einen UI-Sprachwechsel übersetzt.
- native Swift-Oberflächen und sprachabhängige Spiele werden separat lokalisiert/validiert.

## Nachweise

- isolierter i18n-Core: 6/6 Node-Tests grün.
- Browser-Runtime: 5/5 isolierte Tests grün.
- Feature-Branch-CI `36940230178`: vollständig erfolgreich auf `e30b4282ef4bd8271047ec7260b7c1aa06496b5c`.
- PR #20 mergebar und erfolgreich in Staging-Integration gemergt.
- Integrations-CI `36940569791`: vollständig erfolgreich auf `b092ef5d106eda8266eff822bade8f4795bf68f3`.
- Automatic staging preview `36940744209`: Build + Deploy + veröffentlichte Manifest-/Dateihash-Prüfung erfolgreich.
- verifizierter Preview-Receipt: Projekt `hausaufgabe-staging`, Channel `gradecrew-app-integration`, Commit `b092ef5d106eda8266eff822bade8f4795bf68f3`, 93 verifizierte Dateien, Gerätetest `not_performed`.
- Preview-URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`

## Status

- Auf GitHub gesichert: **ja**.
- In `feature/gradecrew-app-integration` integriert: **ja**, Commit `b092ef5…`.
- Automatisierte Tests: **grün**.
- Staging-Preview deployed und Hash-verifiziert: **ja**.
- Gerätetest / kompletter Nutzerworkflow: **offen**.
- Zweite Sprache: **nicht implementiert**.
- Production: **unverändert**.

## Nächster konkreter Schritt

Nutzer testet auf der verifizierten Preview vollständig: Login/Dashboard, Test erstellen/importieren, KI/Editor, Tutorial/Crew, Veröffentlichung, Secure-Student, Abgabe, Auswertung und Exporte. Erst wenn diese Funktionsparität bestätigt ist, beginnt Sprache 2; vorher die Non-DOM-Gates (Exporte, Promptvertrag, Validatoren, Native/Spiele je nach Umfang) abarbeiten.
