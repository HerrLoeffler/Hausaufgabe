# GC-WEB-REPAIR-20261007 — Lehrkraft-Feedback statt lokalem ET-Link

Stand: 18.10.2026. Ausführender Fachagent: staging_teacher_feedback; Chat-Link unbekannt. Zuständigkeit: ausschließlich Web-Feedbackeinstieg. Zentrale koordiniert, unabhängiger Reviewer staging_teacher_feedback_review. Angefordert: bestehende Fachdelegation; tatsächliches Runtime-Modell/Aufwand/Usage unbekannt, keine Modellwechsel/Providerstarts. Bestehende Taskfamilie, Versuchs-/Budgethistorie unverändert.

## Auftrag und Ursache

Auf kanonischem Staging soll jede angemeldete Lehrkraft schnell Fehler/Ideen melden können. ET verwies fest auf `127.0.0.1:8772/__dev` auf dem Rechner des jeweiligen Kollegen und war zudem admin-only. Die eigentliche Feedbackfunktion existiert bereits: Kategorie, Nachricht, optionaler Testcode, Version/Umgebung/Browser/Seite/Zeitpunkt; Adminbereich mit Filter, Suche und Status. Manuelle `bug`-Meldungen werden nicht automatisch vom ausschließlich technischen `app_error`-BugOps-Pfad gebündelt oder repariert.

## Quelle und Abgrenzung

- Frischer main-Einstieg `8560992c072779814017ebac6e86b65e938bc951`: START_HERE, AGENTS, STATE, TODO, Registry, CHAT_CONTRACT, Skills- und Assurance-Einstiege gelesen.
- Eigener Checkout `gradecrew-teacher-feedback-20261018`, Branch `fix/staging-feedback-teacher-entry-20261018`, Basis `2e718ae44519` (vollständiger SHA per Git). Direkter Vorgänger des Baselines ist kanonischer gc40 `21c919bfa41cb7d030d93e719789d0813bdc78e7`; dazwischen ausschließlich vorhandener Konto-Lösch-Handoff.
- Frischer Fetch und Development-Status am18.10.18:37UTC über vorhandenen vollständigen Refbestand:22 Überschneidungen/18 alte kritische Branches allgemein. Kein Token für PR-Abgleich im Skript; Zentrale prüfte live60 offene PRs separat: kein gleichartiger ET-/Feedback-PR, alte app.js-Überlappung191/186 bewusst abgegrenzt. Der erste Auditversuch in isolierter Teilkopie ist wegen fehlender Refs kein gültiger Gesamtbefund; der zweite vollständige Refbestand ist maßgeblich. Handoff-fehlt-Warnungen ergeben sich aus abweichendem Checkout, nicht aus fehlenden main-Dateien. Keine fremden Branches verändert.
- Bestehende gc40-Kontolöschung erhalten. Parallele Bulk-Auswahl-UX arbeitet separat in `admin-account-actions.mjs`; hier kein Eingriff dort. Keine Functions/Rules, automatische Screenshots, neue Datenerhebung, Entwickler-Serverfreigabe oder Production.

## Umsetzung und Design

Kleiner begrenzter bestehender Flow: unten links beschrifteter nativer Button „Fehler oder Idee melden“, schmal „Feedback geben“. Vorhandene GradeCrew-Tokens (`--primary2`, `--soft`, `--line`), vorhandene Schrift, ruhiger weißer Hintergrund; mindestens44px Zielhöhe und sichtbarer Tastaturfokus. Kein neues Designsystem. `aria-haspopup=dialog`/`aria-controls=feedbackDialog`. Signed-out, Prüfungsroute und gesperrte Konten sehen den Button nicht. Lehrer und Admin sehen ihn auch lokal; separate lokale Entwicklerwerkbank wird nicht geändert.

Beide Feedbackeinstiege öffnen denselben bestehenden Dialog. KategorieFehler und aktueller Testcode bleiben vorbelegt. Versand/Datenmodell/Fehlerbehandlung bleiben unverändert. Keine automatisierte Reparatur versprochen. Runtimeänderungen nur `setTeacherBar`, eine Eventbindung, ein Markupelement und dessen CSS. Der bisherige Launcherregressionstest wird auf die neue Funktion umgestellt und erstmals ausdrücklich im vorhandenen CI-Schritt ausgeführt.

## Prüfung und Releasegrenzen

- Neue Tests zuerst gegen gc40:3/3 erwartungsgemäß fehlgeschlagen (fehlender Button/Bindung), danach3/3 bestanden.
- Mit gc40-Adminregressionen:13/13 bestanden, Node24.19.0 mit vorhandenen gesperrten lokalen jsdom-Testdependencies. Kein npm verfügbar; keine Installation erfolgt.
- `node --check app.js`: bestanden.
- `node tools/build-staging.mjs /private/tmp/gc-teacher-feedback-build`:165Dateien, Versiongc40, bestanden. Vor finalem Release folgt gemeinsamer gc41-Version-/Cache-Schritt, kein eigenständiges Deployment dieses gc40-Kandidaten.
- Gesamte bestehende UI-Suite mit vorgeschriebenem VM-Modulflag:142/142 bestanden. Erstlauf113 bestanden/2Modulladefehler (Firebase-Functions und ESM-jsdom fehlten im neuen Checkout); vorhandene gesperrte Dependencies über ignorierte lokale Symlinks eingebunden und frischer vollständiger Lauf bestanden. Kein Produktfix wegen dieser Umgebungsfehler.
- Synthetischer lokaler Chrome-Browser:1280×800 und390×740, reale CSS/DOM und extrahierte tatsächliche Dialoghandler. Breiter Text185.84×44px, schmaler Text136.39×44px, jeweils vollständig im Viewport; Enter öffnet modalen Dialog, Escape schließt und gibt Fokus zurück. Vier Screenshots unter `/private/tmp/gc-feedback-{desktop,mobile}{,-dialog}.png` selbst gesichtet. Kein echter Login-/Staging-/Gerätenachweis. Playwright-bundled Browser fehlte; installierter Chrome explizit verwendet, kein Download.
- Echte Versand-/Geräte-/Stagingabnahme: offen, keine echten Nutzer-/Schülerdaten oder Schreibtests verwendet.

Assurance im eigenen Diff: SEC03/18 Entwickler-/Schreibgrenze (Loopbacklink entfernt, keine neue Ausführung), PRIV12 ehrliche verständliche Meldungsaktion, PRIV14/15 Kontrast/Fokus/Keyboard und responsive Beschriftung gezielt prüfen. Owner Implementierung dieser Fachagent, unabhängige Abnahme eigener Reviewer. Kein Gesamt-Audit oder rechtliche Freigabe. PRIV04/08/19 nicht relevant im Delta: keine neue Speicherung/SDKs/Assets/Fonts; vorhandener Feedbackdatenfluss unverändert.

Git-HTTPS-Push fehlt Authentifizierung (`could not read Username`); lesender Git-Fetch funktioniert. Sicherung über vorhandenen GitHub-Git-Data-Connector wird verwendet; keine Zugangsdaten angefordert.

Stufe: `branch_only`, lokaler Code und Tests; kein CI-, Integrations-, Deploy- oder Nutzerabnahmebeleg daraus. Bestehender release_train bleibt maßgeblich. Gemeinsame main-TODO/STATE-Aktualisierung beim kombinierten geprüften Release durch zugeordneten Fachowner erforderlich; diese Produktbranch enthält die main-only-Koordinationsdateien nicht.

## Nächster Schritt

Exakten gepushten Kandidaten unabhängig prüfen; danach mit separat geprüfter Bulk-Auswahl-UX einen gemeinsamen gc41-Releasekandidaten bilden. Erst grüne exakte CI/Reviewgates, dann gezieltes Staging-Hosting und Manifest-/Nutzerprüfung. Production nicht beauftragt.
