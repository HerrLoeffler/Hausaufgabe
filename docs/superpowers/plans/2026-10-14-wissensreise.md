# Wissensreise Implementation Plan

> For agentic workers: Use superpowers:executing-plans inline. Nutzer genehmigt PlanPR237 mit testgetriebener Korrektur; keine neue Genehmigungsrunde.

Goal: Aus einem eigenen Test eine freigegebene kontinuierlich spielbare Lernkopie erstellen.
Architecture: Private serverseitige Quellprojektion, versionierter Draft und unveränderliche Veröffentlichung. Parametrische sichere Varianten sowie begrenzte bestehende Remyroute; Spielsession enthält niemals Quellschlüssel im Browser.
Tech Stack: bestehendes Vanilla DOM, Firebase Functions/Admin, vorhandene GradeCrew Tokens.
Spec: docs/learning/WISSENSREISE_MASTERPLAN_20261014.md plus führende Nutzerkorrektur.

Global Constraints: owner-only Quelle; aktive Prüfungen/rightsHold/deleted blockiert. Dauer0/120/180; Quellenanzahl beendet keine Runde. Keine Noten/Strafsperren/manuelle Bewertung. Keine bezahlten Providerproben oder Production. Fremde Arbeit erhalten.

Review Focus: negative Zahlen/Division; Grammatiksemantik; fremde/aktive Quellen; keyleaks; TimerResume/duplicate answers.

### Task1: geprüfter Inhaltsvertrag
Files: functions/lib/wissensreise-core.js, functions/test/wissensreise-core.test.js.
Interface: compileQuestion(q), present(item,seed), check(item,answer), nextItem(items,index), assertSource(quiz,uid).
- [ ] Tests zuerst: 2Quellen180s, sichere unknown Typen, negative Arithmetik, Matching/MC/Ordering/Lücke, Keys korrekt.
- [ ] RED ausführen; minimal implementieren; GREEN; commit.

### Task2: Private Lernkopie und begrenzte Generierung
Files: functions/lib/wissensreise-service.js, functions/lib/wissensreise-callables.js, functions/main.js, functions/test/wissensreise-service.test.js.
Interface: prepare/get/generate/cancel/publish/start/step/help/resume. Dependency generation uses existing.regenerateQuestion.run only; original source is never written.
- [ ] Auth/foreign/active, idempotence/budget/cancel/cache/timer, keyleak Tests RED→GREEN.
- [ ] Freigabe bindet Quellfingerprint/revision; Spiel RPC prüft originSource aktuell. Private server collections default-denied, keine Rulesöffnung.
- [ ] Zwischencommit+Handoff.

### Task3: Vollständiger DOMflow
Files: learning/ui.mjs, learning/play.mjs, learning/learning.css, learning.html, learning/bootstrap.mjs, app.js, tools/build-staging.mjs, tools/ui/wissensreise.test.cjs.
- [ ] UI tests zuerst; Testwahl mit bestehendem Remy-Einstieg, Formate/Dauer/Entwurf, Varianten/QC/Freigabe, Link/QR, Hilfe/Resume, Developer taskjump/reset/diagnostics/local feedbackexport.
- [ ] Tokens: surface white/background #f6f7f9/text #202b3c/primary #285ac9/soft #edf3fd/positive #267049; Systemfont; ruhige Lernkarte + bestehender Coco,44pxTouch.
- [ ] Build/Tests, unabhängiger Review durch Zentrale, korrigieren.

### Task4: Reviewbarer Kandidat
- [ ] Scoped TODO/Registry/STATE/Handoff, exact CI Workflow; normal push DraftPR auf feature/gradecrew-app-integration.
- [ ] Exakten SHA/Tests Root melden; kein Deploy ohne Rootabnahme.
