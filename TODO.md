# GradeCrew — Runtime-Unteraufträge

Zentrale Prioritäten und Releasezustände stehen auf aktuellem main.


- [ ] GC-WEB-REPAIR-20261007 / mobile Schüler-Browseransicht: Abgabe nur am Testende, sticky Aufgabennavigation, echtes GC-Logo. Isolierter Branch fix/staging-feedback-mobile-student-20261019; lokale28/28 gezielte Tests und Chromium375/390/1280 grün. Review/CI/interne Testvorschau noch offen, kein Schul-/Live-Deploy. Übergabe: workstreams/mobile-student-chrome-20261019.md.

- [ ] GC-DESIGN-05 / Homepage25Oct: Nutzer hat gradecrew.de-Veröffentlichung beauftragt. Zehnteilige freigegebene Demo wird getrennt von der bestehenden Live-App auf9497e756 paketiert; Bestandslinks bleiben erhalten. Auth303/visuelle265/300 bleiben getrennt. Entstehungsweise und KI-Grenzen unter docs/learning/HOMEPAGE_QUESTION_CREATION.md; Blueprints und Originalpläne dauerhaft sichern. Übergabe workstreams/homepage-release-20261025.md. Veröffentlichung noch offen.

- [ ] GC-SCHOOL-EXPORT-20261028 / isolierter Export einer synthetischen Einzelarbeit: bestehende Ergebnisansicht, PDF/JSON/ZIP/Manifest/Hashbeleg und serverseitiger Testpfad für Korrektur/Rücknahme lokal umgesetzt und unabhängig geprüft. Review-Fixes lokal getestet. Merge gesperrt, bis Wilmas verbindlicher Bewertungsbeleg übernommen und der direkte Alt-Schreibpfad geschlossen ist; visueller PDF-Aufgabenstand und getrennter Remote-Previewkanal offen. Datenschutzfreigabe für echte Arbeiten fehlt: konkrete Schule/Schulart, offizielle Ablage, AVV/Datenfluss, Rollen, Aufbewahrung/Löschung und ggf. DSFA klären. Automatische Wilma-Vorprüfung echter Antworten ist ein separates Provider-/Vertrags-/Schulgate (Bericht PR #366); Sieben-Anfragen-Pilotbudget unverändert. Kein Staging-/Production-Deploy. Übergabe: workstreams/gc-school-export-20261028.md.
