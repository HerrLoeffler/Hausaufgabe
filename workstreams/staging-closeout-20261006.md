# GC-STAGING-CLOSEOUT-20261006

Task IDs: GC-ARCH-AUDIT-01, GC-BRAIN-01, GC-I18N-02/03.

Main coordinates serial integration. Staging authorized; Production and paid model APIs not authorized. No budget resets.


## Staging-Abschluss 2026-10-06 – belegter Zwischenstand

- GC-I18N-02/03: PR139 in `feature/gradecrew-app-integration@90b48d854e0deca87fbf33b376c76826c1fc2d60` integriert. Combined CI37417856806, Hosting37417963944 und AI/Assessment Functions37417963972 erfolgreich. DE/EN-Geräteprüfung, Browsercache und Fortsetzen bestehender Versuche offen; keine vollständige i18n-Abnahme.
- GC-SECURITY-02: PR146 (`b1119cc3`) isoliert CI-grün; Sol bereitet Integrations-PR vor. Noch nicht im veröffentlichten Kandidaten. Weitere Security-Gates offen.
- GC-TUTORIAL-01: WebView-confirm reproduziert; Sol bereitet Seitendialog-Fix samt Timer-Test gegen90b48d8 vor. Noch nicht deployed.
- GC-IOS-01/02: Fachchat meldet0.1.9 in PR144 als CI-grünen Entwurf; letzter belegter TestFlight-Upload0.1.8 Build18. Geräteinstallation/Web-SHA offen. PR145 korrigiert historische Angaben; Entwurf noch nicht integriert.
- GC-ARCH-AUDIT-01 / GC-BRAIN-01: 50 Katalog-IDs abgeglichen: 3 begrenzt abgeschlossen, 6 spätere Erweiterungen, 11 Abnahmen, 30 Prüf-/Umsetzungspunkte. Komponenten-Aktivierungsgates nicht pauschal Pflicht für bestehenden Web-Release. Bericht/Dispatch-Ledger auf `prototype/gradecrew-control-local-v1` unter `prototypes/gradecrew-control-local/`.

Hosting receipt11391527589; AI receipt11391284298; Assessment receipt11392063036. Exact SHA checked in deploy logs; all deployment/verification jobs succeeded. No Rules deployment or device acceptance. Prior release preserved in GRADECREW_STATE.release_history.

Next: collect Web/Security once ready, check exact CI/reviews and current target before serial integration. Luna continues bounded read-only Games reconciliation. Heartbeat gradecrew-security-ergebnis-zur-ckholen collects. Central manifest records worker IDs and attempts; retain original workstream histories.


## Autorisierter Staging-Nachtrag 2026-10-06T11:58:42.949Z
Martin beauftragt Main ausdrücklich, fertige Änderungen auf Staging zu veröffentlichen; keine PR-Arbeit durch Martin nötig. PR148@717dff77 (nur Handoff-Unterschied zum CI-geprüften Code fa6b41) und PR147@1c994ecb wurden seriell übernommen. Kandidat 2d2a7766d86ecc24b10493b9c7fb7b26e70e3fea, Security-Zwischenmerge 0becb39ffe31f594767ae01dca91c723ef3c4738. Diff-Überlappung ausschließlich ai-staging-check.yml; npm-ci-/Emulator- und Dialogprüfungen sind gemeinsam erhalten. Quell-CI37431017785 und37458063527 grün, unabhängige Reviews ohne wesentliche Findings. Combined CI37459917759 und mobile Tutorial37459917770 laufen. Keine Deploy-Behauptung bis zu separaten Receipts. Design-/neue Sprachänderungen bleiben bei ihren laufenden Fachchats. Keine Rules-/Production-Freigabe.


## Verifizierte Veröffentlichung 2026-10-06T12:03:57.472Z
Kandidat 2d2a7766d86ecc24b10493b9c7fb7b26e70e3fea: Combined CI37459917759 und Mobile37459917770 erfolgreich. Hosting37460057171 (Receipt11412745738), AI Functions37460057237 (Receipt11412386188) und Assessment37460057237 (Receipt11411312190) erfolgreich; exakter SHA in Deploylogs und Verifikationsschritte geprüft. Vorgängermerge0bec wurde von den Stale-Source-Guards vor Cloudzugriff zurückgewiesen (37459948464/37459948484), nicht wiederholt. Keine Rules/Production-Änderung. URL: https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app . Physische Abnahme bleibt offen.
Katalog: 4 begrenzt abgeschlossen, 6 spätere Ideen, 13 Abnahmen, 27 weitere Prüf-/Umsetzungspunkte (50 historische IDs erhalten). GC-TUTORIAL-01 wechselt zu Geräteabnahme, Security bleibt nur Teilfortschritt. Martin fordert jetzt ausdrücklich, das Ergebnis des laufenden Chats „Analysiere Hero-Art-Directions“ (01a10e98-1e57-7b40-af70-555fdfdae2e3) abzuwarten und abzuholen. Zuständigen Chat informiert; keine parallele Gestaltung oder Integration. Native0.1.9, isolierte Games-Previews, neue Sprachplanung und Security-Gesamtfreigaben sind nicht Teil dieses Webdeploys.
