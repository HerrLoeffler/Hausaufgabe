# GC-IPAD-CLOZE-20261018 — Leere, neutrale Lückentextfelder

**Verantwortlich:** GradeCrew-Fachauftrag aus „GradeCrew Zentrale“; Chat-Link unbekannt. **Modell/Aufwand:** angefordert und tatsächlich verwendet unbekannt. **Stand:** 18.10.2026, Draft-PR #242; kein Merge, kein Deploy, kein Gerätetest nach Änderung.

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
- Unabhängige Prüfung von Remote-Commit `3abdef6634e2caf1f8661c7df9705208796c6a49` in [PR #242](https://github.com/HerrLoeffler/Hausaufgabe/pull/242) fand einen Wiederaufnahme-Blocker: doppelte Aufgaben-IDs mit unterschiedlichen `gapColors` und sehr lange IDs änderten den alten `sourceFingerprint`. Die Zuordnung erfolgt jetzt über die ursprünglichen Aufgabenobjekte statt über öffentliche IDs; Regressionen prüfen alte Fingerprints mit wiederholten IDs, langen IDs und `shuffleQuestions` an zuvor ermittelten Konstanten (RED→GREEN).
- Exakter geprüfter Code-Head `2ee39a6ff9faa1bd4e5fb2f4633a70b0997b4a61`: unabhängiger Re-Review **PASS**, alte/neue Fingerprints 6/6 identisch (normale, doppelte und >120-Zeichen-IDs, jeweils mit/ohne Shuffle), Assessment 88/88. UI-Testnachweis 121/121 stammt aus unserem lokalen Node-24-Lauf; Reviewer hatte `jsdom` lokal nicht verfügbar.
- GitHub meldet PR #242 gegen aktuellen Integrations-Target `a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d` als `mergeable: true`. Target änderte seit gemeinsamer Basis nur Pool-/Generator-Dateien; kein Dateipfad überschneidet sich mit diesem PR. Ein kombinierter Funktionstest auf dem Merge-Commit steht noch aus.
- Für Head `2ee39a6` meldeten GitHub Actions und Commit-Statusabfrage keine Checks/Workflow-Runs. Der Workflow benutzt Node 22, sein Push-Filter deckt diesen `fix/ipad-*`-Branch nicht ab. Node-22-CI bleibt offen. Gemeinsamer Schul-/Testumgebungs-Release und erneuter iPad-Gerätetest bleiben ebenfalls offen; die Schuladresse darf nicht durch diesen Einzelbranch überschrieben werden.
- Direkter Git-Transport zum Remote schlug wegen DNS-Auflösung fehl; Remote-Sicherung erfolgt über GitHub-GitData. PR-Beschreibung am 18.10.2026 an diese Nachweise angepasst.

**Nächster Schritt:** Node-22-CI und kombinierte Regressionen auf dem späteren Integrations-Commit ausführen; danach mit dem autorisierten gemeinsamen Web-Release koordinieren und auf einem iPad abnehmen.
