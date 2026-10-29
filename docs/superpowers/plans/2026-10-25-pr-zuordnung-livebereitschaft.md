# PR-Zuordnung und belastbare Live-Reife – GC-BRAIN-01

> Umsetzung durch denselben Fachwriter, Skill executing-plans; keine Subagenten gemäß Nutzerauftrag.

## Ziel und Vertrag
Alle aktuell offenen PRs erhalten eine explizite fachliche Zuordnung, Originaltask/Owner soweit belegt, Arbeitsart, Ziel, Abhängigkeiten, datierte Quellen und einen ausführbaren nächsten Schritt. Firmenzentrale zeigt klar, welche Produktpakete zur Livefreigabe vorbereitet sind und welche konkreten Nachweise fehlen. Live bleibt unverändert.

## Vorgehen
- [x] Aktuelles main START_HERE/AGENTS/STATE/TODO/Registry und Assurance lesen; gleiche Task und PR295 erhalten.
- [x] 78 offene PRs mit vollständigen Dateilisten, Headchecks, Reviewmetadaten und tatsächlichen Zielrefs lesen. PR-base.sha allein kann veraltet sein; Branchliste liefert aktuellen Zielstand.
- [x] Fachliche Familien mit Produkt-, Dokumentations-, Werkzeug- und Prototypumfang zuordnen. Konzept und Produktquelle nicht gleichsetzen. Alte Teilpatches über Nachfolger/aktuelle Belege einordnen.
- [x] Fehlende Nachweise aus Originalreceipts und aktuellen Fachmeldungen klären. Verifizierbare Lesebelege ergänzen; physische Geräte-/Fachentscheidungen offen mit konkretem Prüffall belassen.
- [x] Schema und Entscheidungslogik in pr-audit.json/pr-readiness.mjs ergänzen. Jede PR genau einmal; neue, geänderte oder nicht mehr offene PRs sichtbar behandeln. GitHubfehler und veraltete Quellen verhindern grüne Bereitschaft.
- [x] In Seiten & Releases kompakte Freigabeübersicht und filterbare PR-Zuordnung einbauen; Details erst bei Auswahl. Bestehende dunkelblaue Tokens/Hülle und Journale erhalten.
- [x] Verhaltenstests: Dokumentation wird nie Livepaket; fehlende/alte/versionsfremde Gates nie grün; neuer Head/Target/PR/Quellenfehler bleibt Prüfbedarf; fachlicher negativer Befund bleibt blockiert; Listenabdeckung vollständig.
- [x] Browserdesktop/Mobil/Navigation/Briefing prüfen, ohne Dispatch; eigene Übergabe aktualisieren, GitHub-Entwurf sichern und exakte CI abgleichen.

## Regeln der Einordnung
Bereit zur Livefreigabe verlangt ein vollständig belegtes, exakt versionsgebundenes Produktpaket: getesteter gemeinsamer Zielstand, nötige Komponenten/Testdeploys, unabhängiger Review, fachliche/Geräteabnahmen im tatsächlichen Scope und Rückfall-/Nachkontrollplan. Livefreigabe und Deployment sind nachgelagerte menschlich autorisierte Aktionen. Grüne Einzel-CI, PR-Mergeability, offene Dokumentation oder lokale Selbstnotiz ersetzen dies nicht.

Fehlende Belege werden nicht als Produktfehler behauptet. Historische Tests bleiben mit Datum/Version erhalten. Ein unbekannter Originaltask wird als unbekannt ausgewiesen, nicht erfunden. Dokumentation/Plan/Werkzeuge/native lokale Prototypen erhalten angemessene Ziele statt pauschaler Schul-Live-Gates.

## Dateien und Grenzen
Neue Projektion docs/prototypes/firmenzentrale/pr-audit.json, reine Logik pr-readiness.mjs, fokussierte View pr-view.mjs; Anbindung release-view.mjs, bestehende releases.json/company-status.mjs/focus.mjs nur für belegte Korrekturen; sources.py ergänzt aktuelle PR-Ziel-/Zeitmetadaten. Tests in tests/firmenzentrale. Rohaudit/Chattexte privat außerhalb Git. Shared TODO/STATE/Registry bleiben beim Integrationswriter; Integrationsdelta in eigener Übergabe.

Relevante Kontrollen: SEC15 sichere Textdarstellung, SEC18 vorhandene lokale Zugriffs-/Netzgrenzen; PRIV07/08 minimierte Daten, PRIV12 belegte Statusstufen, PRIV13 Bedienbarkeit. Selbstprüfung, kein unabhängiger Assurance-PASS. Requested Sol/medium wegen bereichsübergreifendem Evidenzabgleich; actual unknown, kein Modellwechsel oder externer Modellstart.


## Ergebnis und konkrete Nacharbeit
Stand25.10.2026: Während des Audits kamen PR303/304 hinzu und PR298 wurde integriert.79 aktuell offene PRs sind36aktiven Familien zugeordnet;80historische/geprüfte PRdatensätze bleiben erhalten.14Familien betreffen Produkt-/Nativekandidaten. Kein neues Paket besitzt ein vollständiges Freigabebündel. Fünf zuvor fehlende Nachweise sind geklärt: adaptive Recovery, Wissensreisevorbereitung, getrennte Mathekomponenten, Feedbackveröffentlichung und korrigierte Onboarding-CI.

Priorisierte nächste Arbeit: visuelle PR265/271/296/300 zusammen qualifizieren; Onboarding-Mailsystem/echten Codeempfang einrichten und abnehmen; adaptive StudentIdentity/Lösch- und Gerätetests schließen; Spielvorschauen erreichbar machen und die konkret noch offenen Klassen-/Gerätefälle abnehmen. Alte bytegleiche Tutorial-/Tutorpatches werden nicht als neuer Deploybedarf ausgegeben.

Abnahme dieser Umsetzung:36JS- und23Pythonprüfungen, Syntax/diffcheck; Browser1280/390 ohne Horizontalüberlauf, numerische PR-Suche exakt,14Livefamilien/79zugeordnetePRs sichtbar, Rückfragen-/Auftragsdialog nur vorbereitet und nicht versandt, Fehlerkonsole leer. Bestehende zwei abgeschlossene Aufträge mit je einem Versuch und leeres Prüfjournal erhalten. Dokumentierte Quellen bleiben datiert; neuere Heads/PR-Metadaten werden automatisch als Prüfbedarf markiert. Keine automatische fachliche Auswertung oder vollständige Neuabnahme aller nachfolgenden Codeänderungen behauptet.

GitHubabgabe erfolgt im bestehenden DraftPR295 mit erwarteter Ref und Inhaltsvergleich. Exakte finale CI am PR ist der letzte Abgabeschritt; kein Merge oder Deploy. Die aktualisierte Online-Feedbackfassung9497e756 stammt nachweislich aus einem anderen Arbeitsstrang.
