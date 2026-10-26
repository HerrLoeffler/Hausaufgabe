# Öffentlicher Schülerzugang — Ausführungsplan

Goal: Beide Homepage-Einstiege führen unabhängig von einer Lehreranmeldung in den bestehenden Browserbeitritt.
Architecture: Vorhandene secure-student.html um codefreien Einstieg ergänzen; vorhandene serverseitige Assessmentstrecke und Attemptcredentials unverändert verwenden. Kein app.js-/Auth-/Backend-/Ruleswechsel.
Spec: direkter Humanauftrag26.10, Zentraledelegation; Scope in workstreams/homepage-student-join-20261026.md. Vollständig spezifizierter kleiner Reparaturauftrag, Ausführung inline.

- [x] Task1: Rote DOM-/Runtimefälle für zwei Schülerlinks, codefreien sicheren Einstieg trotz vorhandener Lehrersession, normalisierte Codes und ungültige Eingaben. Minimale Links/Form ergänzen.
- [x] Task2: Kürzel nach fehlgeschlagenem Start/Reload im bestehenden Attemptdatensatz erhalten, bestehende Start-/Resume-/Lösungsgrenzen testen. Footerhinweis genau am tatsächlichen Produktzweck ausrichten.
- [x] Task3: Node22-Produkttests, reproduzierbarer Hostingbuild, echte lokale Desktop/Handy/iPad-Browserprüfung; unabhängiger enger Review und exakte CI.
- [ ] Task4: aktuellen Zielbranch erneut abgleichen; nur freigegebenen Hostingumfang veröffentlichen, Manifest/Assets/beideOrigins/alteLinks prüfen; Handoff und zentraleTODO/STATE sichern.

Review focus: Lehrerkonto bleibt unangetastet; keine Code-/Kürzelübernahme anderer Tests; fehlender/ungültiger Code löst keinen Start aus; keine Lösungen im öffentlichen Info; mobile Header-/Footerüberlagerung.
Ruling: vorhandene sichere Schülerseite ist die isolierte aktuelle Schüleransicht; keine neue Engine/kein Popup und kein Logout.

Task4: Ruling: Kein veralteter Live-Deploy nach parallelemRemyrelease; Integration/CI/Vorschau abgeschlossen, Liveabschluss an aktivenDesignowner übergeben.
