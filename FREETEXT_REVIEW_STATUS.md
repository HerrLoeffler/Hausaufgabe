# GradeCrew – Freitext-Prüfhilfe Handoff

Stand: 2026-10-01

## Branch und Ausgangspunkt

- Feature-Branch: `feature/freetext-review-priority`
- Basis: `fix/gradecrew-staging-release-final`
- Basis-Commit: `acbe25b4bf4a0a5d42f0e3e3fb08ae4493fd90e1`
- Letzter inhaltlich geprüfter Feature-Commit vor dieser Handoff-Aktualisierung: `259a1cdd13853f3825cce4d2548b5dcdbb1e16b2`
- Draft-PR: `#11`
- Production wurde nicht verändert.
- Staging wurde nicht deployed.

## Ziel

Freitextantworten sollen die bestehende automatische GradeCrew-Auswertung ergänzen, ohne die Lehrkraft als letzte Bewertungsinstanz zu ersetzen:

- 🟢 `Eindeutig`: normalisierte Antwort stimmt mit einer hinterlegten Musterlösung überein.
- 🟡 `Prüfen`: Antwort ist einer Musterlösung ähnlich, weicht aber ab.
- 🔴 `Unklar`: Antwort weicht deutlich ab oder es fehlt eine Musterlösung. Rot bedeutet ausdrücklich nicht automatisch „falsch“.

## Auf GitHub umgesetzt

1. `free-text-review.mjs`
   - deterministische lokale Normalisierung und Ähnlichkeitsbewertung;
   - keine Übermittlung von Schülerantworten an OpenAI;
   - Ampelklassifizierung und Zusammenfassung;
   - Punktvorschlag nur bei ausreichend eindeutigen Fällen.
2. `free-text-review.test.mjs`
   - 9 lokale Tests für Normalisierung, exakte Treffer, Tippfehler, unklare/leere Antworten, fehlende Musterlösung und Zusammenfassung.
   - Lokal ausgeführt: 9/9 bestanden.
3. `freetext-review-enhancements.js`
   - Ampelhinweise im Lehrer-Bewertungsdialog;
   - Ampel-Zusammenfassung je Abgabe in der Ergebnisliste;
   - „Unsichere zuerst“ und Wiederherstellung der Originalreihenfolge;
   - Punktvorschläge werden nicht automatisch gespeichert; die Lehrkraft übernimmt sie aktiv und speichert anschließend die Bewertung;
   - DOM-Dekoration gegen wiederholte Mutation abgesichert und Ergebniskontext stabilisiert.
4. `freetext-solution-guard.js`
   - kennzeichnet Muster-/Referenzantworten im Editor als Pflicht;
   - blockiert Speichern/Veröffentlichen aus dem Editor, wenn eine Freitextaufgabe keine Musterlösung besitzt;
   - prüft auch das direkte Veröffentlichen aus dem Dashboard und verweist bei fehlender Lösung zurück in den Editor;
   - `manualReview` ersetzt die Musterlösung nicht mehr in der UI-Logik.
5. `functions/lib/schemas.js`
   - KI-Freitext verlangt nun mindestens eine und höchstens acht nichtleere `acceptedAnswers`, auch bei `manualReview:true`.
6. `functions/test/freetext-schema.test.js`
   - Regressionstest für verpflichtende Freitext-Musterlösungen.
7. `visual-enhancements.js`
   - lädt Lösungsschutz und Prüfhilfe als isolierte optionale Module; Kern-App bleibt bei Modulfehlern lauffähig.
8. `firestore.rules`
   - Client-Schreibvorgänge für Freitextfragen werden serverseitig abgewiesen, wenn `acceptedAnswers` fehlt oder leer ist;
   - Löschen bleibt erlaubt, damit Altfragen weiterhin bereinigt werden können;
   - Cloud-Functions/Admin-SDK-Schreibvorgänge umgehen Firestore Rules weiterhin wie vorgesehen; für KI-Erstellung greift deshalb zusätzlich das strengere KI-Schema.

## Bewusst nicht verändert

- Die bestehende `evaluateAnswer()`-Logik in `app.js` wurde in diesem Feature-Branch noch nicht ersetzt.
- Bei `manualReview:true` bleibt der Kern daher zunächst beim bisherigen Verhalten: 0 automatische Punkte + Status `review`. Die neue Prüfhilfe priorisiert und schlägt Punkte vor, die Lehrkraft bestätigt/korrigiert sie.
- Keine KI-Bewertung individueller Schülerantworten; die erste Version ist deterministisch und lokal.
- Kein Production-/Staging-Deploy.

## Geprüft

- `free-text-review.test.mjs`: lokal mit Node ausgeführt, 9/9 Tests bestanden.
- PR-Diff nach Implementierung manuell geprüft; dabei wurden ein möglicher DOM-Dekorationsloop und ein Ergebniskontext-Randfall erkannt und korrigiert.
- Draft-PR #11 ist laut GitHub konfliktfrei/mergeable.

## Noch zu prüfen

1. Firestore-Regelsyntax und Verhalten mit Emulator/Staging prüfen; die Regeländerung wurde noch nicht deployed.
2. Backend-Schematest `functions/test/freetext-schema.test.js` im vollständigen Repo-Testlauf ausführen.
3. Browser-/Staging-Test mit einem Test aus kurzen Freitexten und offenen Freitexten.
4. Ergebnisliste mit mehreren Schülerabgaben: Ampelzählung und „Unsichere zuerst“ prüfen.
5. Bewertungsdialog: Punktvorschlag übernehmen, manuell korrigieren, speichern, neu öffnen.
6. Editor: Freitext ohne Musterlösung darf weder gespeichert noch veröffentlicht werden; bestehende Alt-Tests mit fehlender Lösung testen.
7. Mobile Darstellung der neuen Toolbar/Badges.
8. Prüfen, ob ältere Tests, die bereits ohne Musterlösung gespeichert sind, beim Dashboard-Publish sauber abgefangen werden.

## Nächster technischer Ausbau

Für längere offene Antworten sollte das Datenmodell später `acceptedAnswers` (kurze automatisch akzeptierte Varianten) von einer ausführlichen `referenceAnswer`/Musterlösung und optionalen Bewertungskriterien trennen. Der aktuelle Editor speichert `acceptedAnswers` kommasepariert; das ist für kurze Antworten gut, für längere Erwartungshorizonte aber noch nicht das endgültige Modell. Dieser Ausbau sollte im Kernmodell erfolgen, bevor KI-gestützte semantische Freitextbewertung eingeführt wird.

## Sicherheits-/Compliance-Hinweis

Die Ampel ist eine Prüfhilfe, keine endgültige fachliche Entscheidung. Schülerantworten werden von dieser Version nicht an externe KI-Dienste geschickt. Die bereits dokumentierte P0-Arbeit zur serverseitigen Prüfungsbewertung und zur Trennung öffentlich abrufbarer Aufgaben von privaten Lösungsschlüsseln bleibt unabhängig davon offen.
