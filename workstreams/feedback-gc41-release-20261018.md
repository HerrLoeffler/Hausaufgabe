# GC-WEB-REPAIR-20261007 — gemeinsamer gc41-Kandidat

18.10.2026, ausführender Fachagent staging_teacher_feedback; Zentrale koordiniert. Chat-Link unbekannt. Bestehender Release-Train, Tasks, Versuche/Budgets und Nutzerabnahmegrenzen erhalten. Production nicht beauftragt.

## Exakte Komponenten

Basis: frisch bestätigter Integrationshead `2e718ae44519fc22a7c64ad354b62dd26a6999ca`, direkter Nachfolger des echten kanonischen gc40 `21c919bfa41cb7d030d93e719789d0813bdc78e7` mit ausschließlich Löschungs-Übergabedokumentation als Delta.

- Feedback: unabhängiger Spec-/Standards-PASS für `23c93359677008f1c8e538d9d3af5fca68353bcf`, Baum `c21792f352073dac389b3582e7f6302fc08ae99a` (lokale4de8d1d bytegleich). AI Staging Checks `39155418764` completed/success. Runtime nur `app.js` (Leistenvisibility/eineClickbindung), `index.html` (ET-Anker→Feedbackbutton), `gradecrew-brand.css` (beschrifteter44px-Button/breite und schmale Ansicht). Eigenes Regressionstestfile und CI-Einbindung. [Komponentenübergabe](teacher-feedback-entry-20261018.md).
- Kontenauswahl: unabhängiger Spec-/Standards-PASS für `58420e88ea7c9d23599afef63a711c4b01f52f94`, AI CI `39155357454`/Admin CI `39155357529` completed/success. Runtime nur `admin-account-actions.mjs`, vorhandene UI-Tests/Übergabe; HDF-Receipt aus Folgecommit `5af322ffce6c54931083ab3b6e07086b03969bb3` übernommen. Sicherheitsgrenze20 bleibt. Mehr als20Ausgewählte erhalten sofort Hinweis und deaktivierte Sammelaktionen; bei37Ausgewählten explizit mindestens17abwählen. Keine automatische Aufteilung/Löschung.

Die Komponenten ändern disjunkte Runtime-/Testpfade. Keine offene ET-/Feedback-Doppelimplementierung laut frischer PR-Prüfung der Zentrale; alte Privacy/Coco-PRs nicht übernommen. Shared-Dateien und Bulk-UX-Owner vor Integration abgestimmt.

## Integrationsdelta

Gemeinsame Version `2.3.1-gc41`: HTML-Meta/Footer und APP_VERSION synchron; HTML→startup→app-Modul mit neuem Versionsquery. Geänderte Brand-CSS und Kontoverwaltungsmodul mit neuen Cachekennungen. Sonstige Module/Startscreen/Assets/Backend-/Rulesverträge erhalten. Kein Runtime-Refactor und kein Produktionsschritt.

## Tatsächlich ausgeführte Prüfungen

- Node24.19.0: UI `--experimental-vm-modules --test tools/ui/*.test.cjs tools/ui/*.test.mjs`:144/144 bestanden. Bestehende gesperrte lokale Dependencies über nicht versionierte Checkout-Symlinks; keine Installation.
- Root-Web `--test *.test.mjs *.test.cjs *.test.js`:360/360 bestanden. Ein vorhandener jsdom-MutationObserver-Teardown schreibt `document is not defined` in den Log; Node meldet0Fehler. Keine Behauptung eines warnungsfreien Laufs.
- Syntax für app/startup/admin-account-actions, Diff-Whitespace und verifizierter Stagingbuild: bestanden,165Dateien/gc41.
- Exakter Git-Diff gegen gc40 in Functions, Assessment-Functions, Firestore/Storage-Regeln und Firebase-Stagingkonfiguration: leer. Kein Dienste-/Rulesdeploy erforderlich; gc40-Kontolöschungsbackend und ursprüngliche Startseite erhalten.
- Feedbackautor: echte lokale Chrome-Probe1280×800/390×740 mit synthetischer Session,44pxButton, Enter/Dialog/Escape/Fokusrückgabe; Screens persönlich gesichtet. Unabhängiger Reviewer sichtete dieselben Bilder. Keine echten Kontoinhalte/Abgaben/Löschungen oder bezahlte Providerstarts.

Kontrollen im Delta: SEC03/18 (kein externer Entwicklungslink/keine neue Ausführung), PRIV12 (klare ehrliche Aktion), PRIV14/15 (bestehendeFarbtoken,44pxZiel/Fokus/Keyboard, nativeDialoghandlung). Neues Tracking/SDK/Asset/Backend-/Berechtigungsmodell außerhalb des Deltas; kein Gesamtaudit oder rechtliche Zertifizierung.

## Releaseplan und Grenzen

Stufe dieses Kandidaten: `branch_only`; Komponenten-CI ist kein Combined-CI- oder Deploybeleg. Genau nächsten Schritt: finalen gc41-Commit/tree remote sichern, unabhängigen Delta-Review und exakte Combined-CI abwarten. Erst danach normal in `feature/gradecrew-app-integration` integrieren und explizit vorhandenes Staging-Hosting mit geprüftem SHA bereitstellen. Build/Hashmanifest nach Commit erstellen; kanonisches `release.json` und alle165SHA256-Dateihashes prüfen. Functions/Rules unverändert; keine pauschalen Neu-Deploys. Anschließend main-TODO/STATE/Registry mit echten Receipts aktualisieren.

Nutzer-/Geräteabnahme bleibt separat: Kollegen melden einen synthetischen Fehler über den Button, Administration prüft Eingang/Filter/Status. Keine manuelleBug→automatischeClustering-/Reparaturbehauptung. Reale Kontolöschung bleibt Nutzeraktion, bestehende20erGrenze und sämtliche Bestätigungsgates erhalten. Production unverändert.
