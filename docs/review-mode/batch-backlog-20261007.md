# GC-WEB-REPAIR-20261007 — Backlog und gemeinsame Deploys

Martin testet auf Staging. Berechtigte Konten erfassen mit dem Rahmensymbol neben der Marke einen Bereich und einen kurzen Hinweis. Die Seite bleibt geometrisch unverändert. Hinweise werden serverseitig im bestehenden Review-Backlog gespeichert; die accountgebundene Browser-Outbox sichert Übertragungsfehler ab. Bestehende Hinweise werden erhalten. Lokale frühere Standalone-Hinweise bleiben im ursprünglichen Browser unter gradecrew-local-region-notes-v1; sie sind nicht bereits online.

Workflow: Offen → In Arbeit → Zum Prüfen → Erledigt. Martin priorisiert oder sagt „Hinweise abarbeiten“. Der Agent liest die freigegebenen Hinweise gesammelt, prüft ihre Ursache und implementiert zusammenhängende Änderungen lokal mit passenden Tests und überprüfbaren Zwischencommits. Kein automatischer KI-Aufruf pro Kommentar. Hinweise anderer Testlehrkräfte benötigen weiterhin Admin-Freigabe; Adminhinweise sind direkt bearbeitbar.

Ohne „Deployen“ keine neuen Staging-Deploys aus kleinen Änderungen. Der Agent hält Zwischenstände in einem eigenen Aufgabenbranch zurück und merged erst nach dem ausdrücklichen Batch-Deploy-Auftrag in den automatischen Staging-Integrationsbranch. Der Auftrag in diesem Chat autorisiert den jetzigen Batch einmal. Neue Wünsche werden anschließend wieder gesammelt. Production bleibt gesondert freigabepflichtig.

Ein Deploy-Batch umfasst festgehaltene Commit-ID, Tests/Review, CI, Hosting und getrennte Backend-Receipts sowie eine Liste der enthaltenen Änderungen. Fehlerhafte Gates werden zuerst diagnostiziert; keine unkontrollierte Retry-Schleife. Nach dem Deploy prüft Martin die betroffenen Stellen. Erledigt erst nach bestätigter Abnahme.

Dieser Batch: breite Klassenraumszene ohne kleine Bildinsel; Begrüßung/Tipphinweis reduziert; Namensfelder verfolgen die Bildpositionen; Coco mit eigener dreiseitiger Einführung; kompaktes servergespeichertes Markierungswerkzeug statt Sidebar. Vorhandenes Tutorial und Anmeldung bleiben regulär. Test-Login ohne Konto ist ausschließlich lokale Fixture-Funktion.

Offen bleiben insbesondere mathematische Glyphdiagnose, DIN-A4-Druck und mehrfarbige Wortmarkierung. Die erneut links stehende Tutorial-Begrüßung ist gemeldet, Ursache noch nicht belastbar bestätigt; keine falsche Erledigt-Markierung. Desktop-/Mobil-Browserabnahme dieses neuen Designs fehlt, weil Browserzugriff durch nicht verifizierbare Admin-Policy blockiert ist.

## Eigener Bereich: Visuelle Hinweise

Neue Rahmenmeldungen werden mit area=visual-feedback erfasst. Allgemeine/technische Hinweise behalten den Bereich general; Ampelprüfungen bleiben reviewChecks. „Visuelle Hinweise abarbeiten“ bedeutet ausschließlich area=visual-feedback und Martins tatsächliche authorId, nicht den gesamten Batch. Der Server unterstützt diese Filter für list/batch inklusive bestehender Seiten-Cursor; die Abfrage liefert keine Prüfpunkte dazu. Andere Bereiche und Hinweise anderer Personen werden dabei nicht verändert. „Kümmere dich um …“ mit einem konkreten visuellen Hinweis grenzt den Auftrag weiter auf diesen Hinweis ein. Die Agentenarbeit wird nur auf diesen expliziten Auftrag hin begonnen. Kein automatisches Deployment beim Speichern.
