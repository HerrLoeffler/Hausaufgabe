# Feedback learning implementation plan
> Agentic workers: use superpowers:executing-plans; native execution in this existing authorized specialist session, independent whole-branch review after tests.
**Goal:** Eigene Bewertungen wirken sofort, gemeinsame nur geprüft; tatsächlicher Einsatz wird nachvollziehbar.
**Architecture:** Fokussiertes functions/lib/feedback-learning.js bildet begrenzte strukturierte Signale, prüft Freigaben und schreibt Nutzungsbelege in vorhandene Feedbackdokumente. Bestehende Loader/Promptpfade, reviewMode und Adminfeedback verwenden diese Schnittstelle.
**Tech stack:** vorhandenes Node22/Firebase/Browser-JS, keine neue Abhängigkeit.
**Spec:** ../specs/2026-10-25-feedback-learning-design.md
## Constraints
Eine Sammlung, read-only Zentralenabruf, eigene Kontogrenze, freigegebene globale Signale ohne Rohtexte; keine erfundenen vergangenen Belege oder Trainingsbehauptung. Neue APIs admin-only, Revision und serverseitige Zeit. Zielgradecrew.de=hausaufgabe-staging, Legacy402/Analytics263 unverändert.
## Review focus
- Konto-/Fach-/Klassenwechsel: fremde/unpassende Signale dürfen nicht einfließen.
- Grün→Rot und geänderte Aufgaben: neuesten relevanten Stand verwenden; keine Belege der alten Version auf neue übertragen.
- Ungültige Kategorien/Freitext/Injektion: nur feste Kategorien/Typen/Strukturmerkmale im Prompt.
- Gleichzeitige Freigabeänderung/Generierung: Beleg nur zum unverändert verwendeten Signal und Freigaberevision.
- Modell-/DBfehler: Einsatz erst nach Modellantwort; fehlender Beleg ist kein nachgewiesener Nichteinsatz und kein behaupteter Erfolg.
## 1. Lernsignale und Prüfstatus
Files: functions/lib/feedback-learning.js; functions/test/feedback-learning.test.js; functions/lib/review-mode.js; functions/lib/question-feedback.js; firestore.secure-assessment.rules; firestore.indexes.json.
Interfaces: buildFeedbackLearning(rows,context,uid), loadFeedbackLearning(db,context,uid), learningPrompt(memory), reviewFeedbackLearning({tx,uid,data,now,toTimestamp}), learningProjection(row), recordLearningUse(db,memory,{uid,operation}). Vorhandenes feedbackMemory bleibt Aggregator für bereinigte Daten.
- [ ] Rote Tests persönliche Sofortwirkung, globale Freigabe, Kontext/Identität, Latest/Dedupe, keine Rohinhalte, revisionsgebundene Prüfung/Belege schreiben und ausführen.
- [ ] Minimale Implementierung plus vorhandene Rollen-/Projektsperren; enge Rulesfelder und notwendige Abfrageindizes ergänzen; Tests grün, committen.
## 2. Tatsächliche Verwendung in Erstellung und Überarbeitung
Files: functions/index.js; functions/main.js; functions/test/personalization.test.js; tatsächliche Handler-Fixtures.
- [ ] Rote Tests Prompts vor/nach Bewertung und Freigabe sowie Nutzerisolation an echter Modellgrenze, keine echte Provideranfrage.
- [ ] Gemeinsamen Loader/Prompt und Beleg nach Modellantwort in Test-/Varianten-/Einzel-/Gesamterstellung anbinden. Modellfehler schreibt keinen Erfolgsbeleg; DBfehler wird begrenzt gemeldet. Tests grün, committen.
## 3. Sichtbarkeit und Live-Nachweis
Files: app.js; integrations/gradecrew-central/plugin/question-feedback-reader.mjs; zugehörige vorhandene Tests; tools/rules/secure-assessment-rules.emulator.test.mjs; HDF.
- [ ] Rote Status-/Adminprüfungs-/Reader-Projektions-/Rules-Tests schreiben und ausführen.
- [ ] Bestehende Admincards um Prüfbegründung/Freigabe/Verwendungsstatus ergänzen; Zentralenprojektion erweitern; gezielte und volle Tests/CI, unabhängige Spec/Standards-Reviews.
- [ ] Unterstützten Altbestand vollständig lesen, Kollegenhinweise konkret berichten; Einzelfunktions-/Rules-/Index-/Hostingdeploy, Pluginoverlay, öffentliche174+Hashes/Belegtest sichern. Keine fremden Daten ins Repo.
