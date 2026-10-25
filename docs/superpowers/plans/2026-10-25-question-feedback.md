# Gemeinsame Aufgabenbewertung und Entfernen

> Ausführung: superpowers:executing-plans, bestehender Task GC-WEB-REPAIR-20261007. Konkreter Nutzerauftrag25.10 ist die Spezifikation; keine weitere Produktentscheidung oder Deploymentfreigabe ableiten.

**Ziel:** ☹ / 🗑 als eine Taste; positive/negative Bewertungen dauerhaft und vor Entfernen gesichert, berechtigt im vorhandenen Adminfeedback und lesend über GradeCrew Central nachvollziehbar.
**Architektur:** Bestehende feedback-Kategorie ai_question bleibt die einzige Sammlung. reviewMode bekommt streng validiertes idempotentes Schreiben und Admin-Nur-Lese-Pagination. Vorhandener Review-IndexedDBspeicher übernimmt konten-/projektgebunden ausstehende Meldungen; Entfernen erfolgt ausschließlich nach Serverquittung, auch nach Reload kein automatisches Löschen. Gasttutorial bleibt lokal und ausdrücklich ungespeichert.
**Umfang:** app.js/index.html, fokussierter Feedbackclient, functions/lib/review-mode + Validator, bestehender Adminfilter, integrations/gradecrew-central. Keine Analytics-V1-, PostHog-, Auth-Umgehung, Live-/402-Veröffentlichung, Plugininstallation, Schülerantworten oder echte Kontomutation.
**Abwägung:** Direkte setDoc-Erweiterung würde bisherigen Statusreset/überschriebene Bewertungen behalten; zweite Sammlung wäre unzulässig. Bestehender reviewMode-Transaktionspfad erlaubt Auth, Snapshotgrenzen, Idempotenz und Lesen ohne weitere Inbox. Der gewählte Weg bleibt bis zu separatem Backenddeploy ein Kandidat.

- [ ] Tests rot: gleicher Retry bewahrt Status, unterschiedliche Bewertungsaktionen erhalten, Rollen/Projekt/Quizprüfung, Snapshotallowlist, historische Quelle unbekannt.
- [ ] Server im bestehenden feedback-Pfad; Adminlisten ohne Profile/Schülerdaten, begrenzte Seiten, Legacy402 explizit gesperrt. Historische Werte nur nach tatsächlichem autorisiertem Abruf melden.
- [ ] Client verwendet Reviewstorage; Dedupe, pending/failed/confirmed; Accountwechsel/Reload/Offline sicher; Löschen nur nach bestätigtem Feedback und bewusster Bestätigung.
- [ ] Gemeinsame Taste+kurze Gründe/Freitext/Überspringen; grün zuverlässig; bestehende Tutorial-/Published-Locks und lokaler Entwurf erhalten. Keine weiteren UIänderungen.
- [ ] Adminaufgabenfilter und read-only Connector mit derselben Liveanmeldung, expliziten Grenzen und Tests; keine Installation.
- [ ] Reale öffentliche Buildzuordnung belegen, lokale Vorschau mit synthetischen Daten, relevante Regressionen/CI und unabhängiger Review; HDF/TODO sichern. Kein Deploy.

Risiko-/Reviewfokus: verspätete Antwort bei Konto-/Testwechsel; Klickwiederholung mit bereits priorisiertem Feedback; Offlinefeedback mit sensiblen Unterrichtskontext; Leeren/Abbrechen des Löschdialogs; Snapshot-/Returnallowlist; alte positive Bewertungen mit done sind kein Reviewnachweis. SEC06/07/14/17 und PRIV01/07/08/17/20 scoped, kein Vollaudit/Rechtszertifikat. Interaktive Aufgabenformate werden nicht verändert; Katalog deshalb nicht relevant.
