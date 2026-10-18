# GC-IPAD-CLOZE-20261018 — Leere, neutrale Lückentextfelder

**Verantwortlich:** GradeCrew-Fachauftrag aus „GradeCrew Zentrale“; Chat-Link unbekannt. **Modell/Aufwand:** angefordert und tatsächlich verwendet unbekannt. **Stand:** 18.10.2026, `branch_only`; kein Merge, kein Deploy, kein Gerätetest nach Änderung.

## Befund und Ziel

Ein Foto eines echten iPad-Tests zeigte vor einer Eingabe in englischen Farblücken die deutschen Platzhalter „Blau“ und „Grün“. Die Wörter stammten aus `secure-student.js`: Der sichere Schüler-Renderer las `segment.color` aus dem öffentlichen Assessment-Papier, setzte einen ausgeschriebenen Farbplatzhalter, nannte die Farbe im zugänglichen Namen und färbte den Feldhintergrund. Dies kann eine Lösung andeuten und ist bei „The sun is …“ sogar irreführend. Die Lehrkraft hatte eine Farbinformation im Lückentext hinterlegt; sie ist keine Schülerantwort.

Neue und bestehende Schüler-Papiere sollen in jeder Lücke ein **leeres, neutrales Eingabefeld** zeigen. Echte, vom Kind eingegebene Antworten aus dem lokalen Versuchs-Entwurf müssen bei Fortsetzung weiter erscheinen. Bewertung und die Wiederaufnahme bereits gestarteter Versuche dürfen nicht brechen.

## Umsetzung auf isoliertem Branch

Branch `fix/ipad-cloze-empty-placeholder-20261018`, Basis des gemeinsamen Webstands `2e718ae44519fc22a7c64ad354b62dd26a6999ca`; erste gesicherte Codeänderung `8b7f431`.

- `assessment-functions/lib/assessment-core.js`: Farbwerte bleiben in privater Aufgabenfassung und Bewertungsgrundlage, werden aber aus dem an Schüler ausgelieferten Lücken-Segment entfernt. Der bestehende `sourceFingerprint` wird für alte farbige Versuche mit der bisherigen Form berechnet; dieses Rechenobjekt wird **nicht** ausgeliefert.
- `secure-student.js`: Feld hat keinen Farbplatzhalter, keine farbige Klasse und keinen Farbnamen im zugänglichen Label. Ein älteres, noch farbiges Papier wird ebenfalls neutral dargestellt. `applyDraft` schreibt echte gespeicherte Antworten weiterhin in die Felder.
- `app.js`: Auch die Lehrkraft-Vorschau zeigt neutrale, anfangs leere Schüler-Lücken.
- Serverseitige Bewertung, Lösungsschlüssel, andere Fragetypen und Datenbanken bleiben unverändert. Bestehende `gapColors` im Editor werden nicht gelöscht. Die Farbe hat nach dieser Korrektur keinen Effekt auf Schüler-Lücken; das Editor-Bedienelement sollte bei späterer UX-Arbeit explizit neu bewertet werden.

## Nachweise und offene Gates

- Neue DOM- und Server-Regressionstests zuerst RED (alte Platzhalter, alte öffentliche Farben), dann GREEN. Eine zusätzliche RED→GREEN-Probe sichert den exakten Fingerprint einer bestehenden farbigen Frage, damit laufende Versuche nicht wegen dieser Präsentationsänderung abgewiesen werden.
- Lokal mit gebündeltem Node 24: Assessment-Funktionen 88/88 und UI 121/121 (`--experimental-vm-modules`) erfolgreich. Testdaten sind erfunden; keine realen Schülerdaten oder Live-Submissions benutzt.
- Unabhängige Prüfung von Remote-Commit `3abdef6634e2caf1f8661c7df9705208796c6a49` in [PR #242](https://github.com/HerrLoeffler/Hausaufgabe/pull/242) fand einen Wiederaufnahme-Blocker: doppelte Aufgaben-IDs mit unterschiedlichen `gapColors` und sehr lange IDs änderten den alten `sourceFingerprint`. Die Zuordnung erfolgt jetzt über die ursprünglichen Aufgabenobjekte statt über öffentliche IDs; Regressionen prüfen alte Fingerprints mit wiederholten IDs, langen IDs und `shuffleQuestions` an zuvor ermittelten Konstanten (RED→GREEN). Erneute unabhängige Prüfung des Nachfolge-Commits steht aus.
- Node-22-CI, Abgleich mit inzwischen weitergelaufenem Integrationsbranch, gemeinsamer Schul-/Testumgebungs-Release und erneuter iPad-Gerätetest **noch offen**. Die Schuladresse darf nicht durch diesen Einzelbranch überschrieben werden.
- Direkter Git-Transport zum Remote schlug wegen DNS-Auflösung fehl; Remote-Sicherung erfolgt über GitHub-GitData.

**Nächster Schritt:** Exakten Branchinhalt remote sichern, unabhängige Prüfung und Node-22-CI an diesem SHA durchführen; danach mit dem autorisierten gemeinsamen Web-Release koordinieren.
