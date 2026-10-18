# Kompaktes iPad-Dashboard und Tutorialzugang — Implementation Plan

> For agentic workers: Use superpowers:executing-plans inline. User explicitly requests planning followed by implementation. No additional approval gate for this agreed bounded correction.

**Goal:** Neuer Test sitzt kompakt rechts oben; der kleine Tutorialhinweis steht in der Kopfzeile, verschwindet nach fünf echten Anmeldungen und bleibt in Einstellungen erreichbar.
**Architecture:** Bestehendes Dashboard und Originaltour beibehalten. Darstellung in vorhandener Workspace-CSS/Decorator korrigieren. Kleine Tutorial-Entry- und SignIn-Module koordinieren Kopfzeile bzw. idempotentes, auf sechs begrenztes Konto-Onboarding. Bestehender Firestore-Ownerpfad; keine Rules-, Functions- oder Productionänderung.
**Tech Stack:** Vanilla JS/ES modules, bestehendes CSS, Firebase Auth/Firestore-Transaktion, Node/JSDOM/CUA.
**Spec:** Nutzerauftrag 18.10.2026 / bestehende Task GC-BRAND-HERO-MOTION-20261013; unten stehende Kriterien sind der begrenzte Ausführungsauftrag.

## Global Constraints

- Quelle feature/gradecrew-app-integration@2e718ae44519fc22a7c64ad354b62dd26a6999ca; eigener Branch fix/tutorial-dashboard-ipad-20261018.
- Öffentliche Homepage, Experiment V7b und eigentlicher Tutorialablauf bleiben unverändert. Neuer Scope ist das angemeldete Dashboard für Staging; Production ausgeschlossen.
- Original-Crewbilder behalten; Remy maximal 40–44px hoch mit object-fit:contain, kein großer gestreckter CTA.
- Erster bis fünfter eindeutiger Login: Hinweis sichtbar; ab sechstem verborgen. Refresh, Dashboardrückkehr, fehlgeschlagene Logins zählen nicht. Alte Anmeldungen werden nicht erfunden.
- Kontoübergreifend keine Vermischung. Gesperrte/abgemeldete Konten und Gasttour zählen nicht. Keine Credentials, Tokens, Rohzeitstempel oder Loginhistorie loggen.
- Nur Anzahl bis sechs und maximal sechs opaque Session-Hashes im eigenen Profil. Metadaten aus Auth werden lokal gehasht; weder IP noch Gerätekennung oder Analytics.
- Einstellungen bieten Tutorial unabhängig vom Zähler; kein automatischer Tourstart, Admin-Sonderverhalten erhalten.
- 44px Touchziele, DE/EN, sichtbarer Fokus, kein horizontaler Überlauf.

## Review Focus

- Derselbe Auth-Login nach Reload bzw. parallelen Tabs muss idempotent bleiben.
- Zwei unterschiedliche Logins parallel dürfen keinen Zählerstand verlieren; Transaktionsretry erhält beide.
- Konto-Wechsel während eines asynchronen Lesens darf den neuen Profilzustand nicht überschreiben.
- Fehlende/alte Profildaten oder Offlinefehler dürfen die Anmeldung nicht blockieren; Hilfe bleibt auffindbar.
- Nach der sechsten Anmeldung muss Einstellungen→Tutorial weiterhin wirklich die Originaltour starten.

## Task 1 — Zähler im vorhandenen Ownerprofil

Files: create tutorial-signins.mjs, tutorial-signins.test.mjs; modify app.js; include new runtime file in tools/build-staging.mjs.
Interface: tutorialSignInPatch(profile, sessionHash) returns bounded patch or null; recordTutorialSignIn({user, db, ref, runTransaction, isCurrent, hash}) returns latest profile or null. UI consumes crewTourSignInCount only. Hash uses UID + Auth metadata lastSignInTime, never raw identity in logs. Missing session metadata skips counting.

- [x] Write and observe failing tests for first five vs sixth, repeated session, distinct concurrent sessions/retry, legacy profile, missing metadata, failed read/write, stale auth generation.
- [x] Implement pure patch and async transaction adapter. Reuse existing guest data guard for runTransaction. Call after profile/status validation in onAuthStateChanged, guard publication by generation.
- [x] Run new tests plus auth-profile and guest-isolation tests. Commit checkpoint with handoff before longer checks.

## Task 2 — Kompakte Platzierung und permanenter Einstieg

Files: create dashboard-tutorial-entry.mjs and dashboard-tutorial-entry.test.mjs; modify gradecrew-workspace-upgrade.mjs/.css, app.js, index.html, tools/build-staging.mjs, .github/workflows/ai-staging-check.yml.
Interfaces: syncDashboardTutorialEntry(document,{enabled,dashboard,count}) moves the existing original button into userBar before userLabel and controls visibility; app settingsTutorialStart handler loads dashboard then calls existing crewTour.start with UID guard.

- [x] Add failing DOM tests: compact original handler preserved, no big crew-card recreation, hint hidden after six and outside dashboard, settings handler available regardless count, account change/signout hidden.
- [x] Remove obsolete centered crew/absolute-new-button CSS block; consolidate page header grid and compact native controls, preserve cards/filter handlers. Disable only old crew-card decorator.
- [x] Add permanent settings button, DE/EN source mapping, retain original tutorial engines byte-identical. Header duration goes in tooltip/hidden secondary text, not large card.
- [x] Include runtime modules and tests in staging build/CI; bump coherent candidate version gc41. Test new behavior plus existing tutorial/workspace/i18n/guest regressions.

## Task 3 — Browser, full gate and release preparation

- [x] Use isolated local fixture with original HTML/CSS/modules and synthetic profiles. Reproduce old layout first, then compare 1366×1024,1024×1366,768×1024,390×844 plus desktop. Verify no overlap/overflow, touch sizes and original Remy aspect ratio.
- [x] Exercise first/fifth/sixth visibility and settings restart. Verify no guest/backend leakage.
- [x] Build staging artifact and confirm new modules/assets manifest. Run combined CI on immutable candidate and independent review before integration.
- [x] Fresh-check target and live overlaps; only then use existing authorized Staging release path, verify exact source/manifest. No Production. If release gate unavailable, preserve reviewable branch/PR and report precise missing gate rather than claim deployment.
- [x] Update existing task handoff/TODO and exact stage/commit/proofs. Keep original task/attempt/budget history; no paid generation.


Abschlussnachweis: PR243, Integrations-CI39158225634, Vorschau39158385658, kanonische Übernahme39158573068, unabhängige167-Dateihashprüfung erfolgreich. Reale Geräte-/Kontozählerabnahme bleibt separat offen. Keine Production-/Homepage-/Experimentänderung.
