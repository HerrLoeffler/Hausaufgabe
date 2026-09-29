# GradeCrew Secure Assessment V1

Stand: 29. September 2026

Branch: `feature/secure-assessment-v1`

## Ziel

Der Schülerbrowser darf für einen echten Leistungsnachweis weder Lösungsschlüssel noch vertrauenswürdige Bewertungsdaten erhalten oder selbst eine verbindliche Bewertung schreiben. Die Abgabe eines Bearbeitungsversuchs muss serverseitig genau einmal abgeschlossen werden können.

Diese Arbeit bleibt bis zur vollständigen Integration auf einem isolierten Feature-Branch. Production wird dadurch nicht verändert.

## Bedrohungsmodell

V1 schützt insbesondere gegen:

- direktes Lesen von Lösungen aus veröffentlichten Firestore-Fragedokumenten,
- manipulierte Punkte, Prozentwerte oder Noten aus dem Browser,
- wiederholte Abgaben desselben Bearbeitungsversuchs,
- Reload, Browser-Zurück, Netzwerk-Retry und parallele Tabs, die mehrfach speichern,
- Erraten einer Lösung aus internen Array-Indizes bei Single Choice, Matching, Ordering und Grouping,
- versehentliche Lösungsoffenlegung durch Lückentext-Markup oder gespeicherte Zielwörter,
- nachträgliches Ändern eines laufenden Tests, ohne dass der Versuch dies bemerkt,
- Abgabe weit nach einer serverseitigen Zeitfrist.

V1 ist **kein Lockdown-Browser**. Ein zweites Gerät, Screenshots, externe Hilfsmittel oder das Verlassen des Browsers bleiben eine organisatorische bzw. spätere SEB-/Gerätemodus-Frage.

## Datenfluss

### 1. Öffentliche Testinformation

Callable: `getAssessmentInfo`

Der Client erhält nur unkritische Metadaten wie Titel, Fach, Klasse, Punktezahl, Zeitlimit und Startmodus. Keine Fragen und keine Lösungen.

### 2. Bearbeitungsversuch starten

Callable: `startAssessmentAttempt`

Der Browser erzeugt lokal zwei zufällige Werte:

- `clientAttemptId` – bestimmt idempotent die serverseitige Attempt-ID,
- `attemptToken` – Browser-Credential für Resume/Submit.

Der Server speichert den Token niemals im Klartext. Nur dessen Hash liegt in `assessmentPrivate`.

Zusätzlich erzeugt der Server einen eigenen geheimen `paperSecret`. Dieser Wert wird niemals an den Browser gesendet. Aus ihm entstehen opaque IDs für Optionen, Zuordnungen, Sortierelemente und Gruppen. Deshalb kann ein Client aus seinem eigenen Attempt-Token nicht auf die ursprünglichen Lösung-Indizes zurückrechnen.

### 3. Student Paper

Aus den Autorendokumenten wird serverseitig ein Lösung-freier Aufgabenvertrag erzeugt.

Nicht enthalten sind unter anderem:

- `correct`,
- `correctBoolean`,
- `acceptedAnswers`,
- `numericAnswer`,
- `tolerance`,
- `targetWords`,
- `acceptedOrders`,
- Grading-Key oder Lösungsschlüssel.

Besonderheiten:

- Lückentext: `[Lösung|Alternative]` wird in Textsegmente + neutrale Gap-ID zerlegt.
- Matching: linke und rechte Seiten erhalten voneinander unabhängige opaque IDs; rechte Seite wird sicher gemischt.
- Ordering: öffentliche Reihenfolge ist garantiert nicht identisch zur gespeicherten Lösungsreihenfolge, sofern mehr als ein Element vorhanden ist.
- Grouping: Schüler sehen Kategorien und einen flachen gemischten Element-Pool, aber keine Element-Kategorie-Zuordnung.
- Markwords: Passage wird gesendet, Zielwörter nicht.

### 4. Private Assessment-Daten

Top-Level-Collection: `assessmentPrivate/{quizId}_{attemptId}`

Nur Admin SDK / Cloud Functions dürfen darauf zugreifen. Darin liegen während eines laufenden Versuchs:

- Hash des Attempt-Tokens,
- serverseitiger `paperSecret`,
- Grading-Key,
- Fingerprint der Aufgabenfassung.

Nach erfolgreicher Abgabe werden Grading-Key, Paper-Secret und Fingerprint gelöscht. Der Token-Hash bleibt vorerst für eine authentifizierte Ergebnisquittung erhalten.

### 5. Resume

Callable: `resumeAssessmentAttempt`

Der Server prüft Token, Run-ID und Status. Bei einer Lehrkraft-gesteuerten Runde wird ein wartender Attempt erst dann `running`, wenn die Lehrkraft die Runde tatsächlich gestartet hat.

Das Student Paper wird aus demselben privaten Paper-Secret rekonstruiert. Der Fingerprint muss zur ursprünglichen Aufgabenfassung passen. Wird ein Test mitten in einer laufenden Bearbeitung verändert, wird nicht stillschweigend mit einer neuen Fassung weitergearbeitet.

### 6. Abgabe

Callable: `submitAssessmentAttempt`

Der Browser sendet ausschließlich Antworten und `autoSubmitted`. Er sendet ausdrücklich **keine** vertrauenswürdigen Punkte, Noten, Prozentwerte oder Grading-Daten.

Die Function:

1. prüft Attempt + Token,
2. prüft Run und serverseitige Deadline,
3. bereinigt die Antworten auf bekannte Fragen/Datentypen,
4. bewertet anhand des privaten Grading-Keys,
5. schreibt exakt `submissions/{attemptId}`,
6. setzt den Attempt in derselben Transaktion auf `submitted`.

Existiert die Submission bereits, wird dieselbe Quittung zurückgegeben. Ein Retry erzeugt damit keine zweite Abgabe.

### 7. Bewertung

Automatische Bewertung findet serverseitig statt. Freitext mit `manualReview=true` bleibt mit 0 automatisch vergebenen Punkten als `review` markiert, bis die Lehrkraft bewertet.

Wichtige Regressionen:

- leere Zahleneingabe darf bei Lösung `0` nicht als korrekt gelten,
- leere Richtig/Falsch-Antwort darf bei Lösung `false` nicht als korrekt gelten,
- Client-induzierte Punkt-/Notenwerte werden ignoriert,
- unbekannte Antwortfelder werden nicht gespeichert.

### 8. Ergebnisrückgabe

Callable: `getAssessmentReceipt`

V1 gibt niemals automatisch Lösungen zurück. `solutionsReleased` bleibt `false`.

Je nach `resultMode` kann die Quittung Punkte/Prozent/Note enthalten. Bei manueller Nachbewertung wird der Status entsprechend angezeigt.

Eine spätere explizite Lösungsfreigabe wird als eigener Serverzustand umgesetzt, nicht als automatische Folge einer Abgabe.

## Firestore-Zielregeln nach Client-Migration

Die Regeln werden **erst nach erfolgreicher Client-Umschaltung** verschärft. Dann gilt:

- öffentliche Reads auf `quizzes/{quizId}/questions/*` -> verboten,
- öffentliche Creates/Updates auf `attempts/*` -> verboten,
- öffentliche Creates auf `submissions/*` -> verboten,
- `assessmentPrivate/*` -> für alle Clients vollständig verboten,
- `assessmentRateLimits/*` -> für alle Clients vollständig verboten,
- Lehrkraft/Admin behält die nötigen Reads für Live-Ansicht und Bewertung.

Das Schließen dieser Regeln vor der Client-Umschaltung würde den aktuellen Schülerfluss absichtlich brechen und darf deshalb nicht separat deployed werden.

## Migrationsreihenfolge

1. Secure Backend + Tests vollständig grün.
2. Browser-Client für die Callables fertigstellen.
3. Schüler-Renderer auf Lösung-freies Student-Paper umstellen.
4. Untimed, timed und teacher-controlled flows ausschließlich über serverseitige Attempts führen.
5. Server-Receipt statt Client-Bewertung anzeigen.
6. Firestore-Regeln gleichzeitig schließen.
7. Staging: Doppelabgabe, Reload, Zurück, zwei Tabs, Netzwerk-Retry, Zeitablauf und Teständerung adversarial testen.
8. Erst danach Release-Kandidat auf den normalen Staging-Branch übernehmen.
9. Production-Buildpfad neu und vollständig erstellen; altes Production-Skript bleibt fail-closed.
10. Production erst nach separatem Release-Audit.

## Release-Gates

Ein Livegang ist erst zulässig, wenn alle folgenden Punkte erfüllt sind:

- [ ] Browser lädt keine Original-Fragedokumente für Schüler.
- [ ] Browser schreibt keine Submission direkt nach Firestore.
- [ ] Browser erstellt/ändert keine Schüler-Attempts direkt in Firestore.
- [ ] Alle 11 Aufgabentypen laufen über das neue Student-Paper.
- [ ] Genau eine Submission pro Attempt auch bei parallelen Retries.
- [ ] Serverseitiges Zeitlimit getestet.
- [ ] Teacher-controlled waiting/running/new-run getestet.
- [ ] Manuelle Freitextbewertung funktioniert weiterhin.
- [ ] Lehrer-Liveansicht und Ergebnistabelle funktionieren mit `submissionId == attemptId`.
- [ ] Firestore-Regeln verhindern die alten öffentlichen Zugriffe.
- [ ] `assessmentPrivate` und Rate-Limit-Dokumente sind clientseitig nicht lesbar.
- [ ] iPhone/Safari, Chrome/Desktop und mindestens zwei parallele Browser getestet.
- [ ] Vollständige CI grün.
- [ ] Staging-Adversarial-Test protokolliert.
- [ ] Neuer Production-Deploypfad geprüft.

## Noch bewusst offen

- App Check / Abuse-Härtung für öffentliche Callables,
- explizite Lehrerfreigabe für Lösungen,
- Autosave/Offline-Wiederaufnahme über den Server,
- beaufsichtigter Browsermodus / SEB-Pilot,
- Klassen-/Schülerkonten und stärker gebundene Identitäten,
- Aufbewahrungs-/Löschfristen für `assessmentPrivate`, Rate-Limits und abgeschlossene Attempts.
