# GradeCrew → Escape Room Inhaltsadapter

Stand: 02.10.2026. Quelle für den GradeCrew-Fragevertrag ist der aktuell geprüfte Integrationsbranch `feature/gradecrew-app-integration` bei Commit `74eb2ec08e81315875abfc4b1ae052d9f78797eb`.

## Zweck

Der Escape Room soll vorhandene oder KI-erzeugte GradeCrew-Aufgaben verwenden können, ohne die Spiellogik durch KI erzeugen zu lassen. Dafür trennt der Adapter zwei Ebenen:

1. **GradeCrew-Aufgabe:** eigentliche fachliche Frage und richtige Antwort aus dem bestehenden Testsystem.
2. **Escape-Lernpaket:** Lernziel, Hinweis, kurze Erklärung, aktive Remediation und neue Transferaufgabe.

Die deterministische Escape-Engine entscheidet weiterhin, wann eine Aufgabe erscheint und welches Item/Rätsel danach freigeschaltet wird.

## Tatsächlich geprüfter GradeCrew-Fragevertrag

Das aktuelle GradeCrew-Schema kennt:

- `single`
- `multi`
- `dropdown`
- `text`
- `truefalse`
- `gapfill`
- `matching`
- `ordering`
- `grouping`
- `markwords`
- `number`

Je nach Typ werden unter anderem `options`, `acceptedAnswers`, `manualReview`, `correctBoolean`, `pairs`, `items`, `acceptedOrders`, `groups`, `passage`, `targetWords`, `numericAnswer`, `tolerance` und `unit` gespeichert.

## Adapter v1 – sicher und fail-closed

Aktuell sicher unterstützt:

| GradeCrew | Escape | Status |
| --- | --- | --- |
| `single` | Auswahlfrage | unterstützt |
| `dropdown` | Auswahlfrage | unterstützt |
| `truefalse` | Richtig/Falsch | unterstützt |
| `text` | Freitext | unterstützt, wenn automatisch eindeutig prüfbar |
| `number` | Zahl | unterstützt mit Lösung/Toleranz/Einheit |
| `multi` | Mehrfachauswahl | gesperrt |
| `gapfill` | Lückentext | gesperrt |
| `matching` | Zuordnung | gesperrt |
| `ordering` | Reihenfolge | gesperrt |
| `grouping` | Gruppierung | gesperrt |
| `markwords` | Wörter markieren | gesperrt |

### Freitext

Freitext darf den Spielfortschritt nur dann automatisch freischalten, wenn:

- `manualReview === false`, und
- mindestens eine `acceptedAnswers`-Variante vorhanden ist.

Antworten werden für den Escape-Vergleich normalisiert. Freitext, der weiterhin eine fachliche Lehrerentscheidung benötigt, bleibt absichtlich gesperrt. **Hilfe oder KI darf niemals eine unsichere automatische Bewertung in einen sicheren Spielfortschritt umdeuten.**

### Zahl

Zahlaufgaben unterstützen:

- `numericAnswer`
- `tolerance >= 0`
- optionale `unit`
- Dezimalpunkt und Dezimalkomma bei der Schüler-Eingabe.

Der Adapter erfindet **keine** Distraktoren und wandelt komplexe Typen nicht künstlich in Multiple Choice um.

Bildabhängige Aufgaben werden ebenfalls abgelehnt, solange der Escape-Lernslot das Bild nicht zuverlässig mitliefert. Eine Frage darf nicht durch Weglassen ihres visuellen Kontextes fachlich verändert werden.

## Acht Aufgaben

Die Referenzwelt hat acht feste Lernslots. Der Adapter:

- übernimmt automatisch einen Test nur dann direkt, wenn er genau acht Aufgaben enthält;
- oder verlangt explizit acht unterschiedliche Positionen aus einem größeren Test;
- übernimmt niemals stillschweigend „einfach die ersten acht“, wenn mehr Aufgaben vorhanden sind.

Damit bleibt die Lehrerhoheit erhalten.

## Zusätzlich benötigtes Lernpaket

Eine normale GradeCrew-Aufgabe enthält nicht automatisch die didaktischen Escape-Hilfen. Deshalb braucht jeder der acht Slots zusätzlich:

```js
{
  learningGoal: '...',
  hint: '...',
  explanation: '...',
  remediation: {
    explanation: '...',
    activeTask: {
      instruction: '...',
      text: '...'
    },
    transfer: {
      prompt: '...',
      acceptedAnswers: ['...'],
      hint: '...',
      explanation: '...'
    }
  },
  tutorAnswers: [
    { patterns: ['...'], answer: '...' }
  ]
}
```

Dieses Paket kann später beim Erstellen eines Escape Rooms von der GradeCrew-KI erzeugt und vom Lehrer kurz geprüft werden. Es wird danach vom Escape-Preflight validiert.

## Sicherheits- und Qualitätsregeln

- `manualReview: true` darf niemals direkt als automatischer Fortschritts-Gate verwendet werden.
- Die richtige GradeCrew-Lösung bleibt die fachliche Quelle; der Adapter erfindet keine neue Lösung.
- Lernpakete müssen vollständig sein, sonst schlägt die Adaption fehl.
- Eine KI erzeugt Inhalte, aber keine neue ausführbare Escape-Logik.
- Lösungen und Lernpakete gehören bei echter Schülerauslieferung hinter den vorgesehenen Lehrer-/Server-Schutz; die Lab-Seite ist kein fertiges Berechtigungsmodell.
- Externe Remy-Hilfe wird getrennt über eine serverseitige Tutor-Brücke angeschlossen und ist kein Bestandteil des Frageadapters.
- Remy-Hilfe ersetzt niemals den Lernnachweis; nach Hilfe gelten weiterhin die normalen Antwort-/Remediation-/Transfer-Gates.

## Implementierung und Prüfung

- Browser-/Lab-Adapter: `lab/escape-room/gradecrew-question-adapter.js`
- Runtime: `lab/escape-room/app.js`
- Regressionstests: `tools/games/gradecrew-escape-adapter.test.cjs` und `tools/games/escape-room.test.cjs`
- Freitext und Zahl wurden als echte Hauptantwortmodi getestet.
- Der Adapter wird im isolierten Escape-Build mit ausgeliefert, ist aber noch nicht in die Haupt-Web-App verdrahtet.

## Nächste Erweiterungen

1. In der GradeCrew-Erstellung einen Modus **„Als Escape Room spielen“** ergänzen: acht Aufgaben auswählen/erzeugen → Lernpakete erzeugen → Lehrerprüfung → Preflight → Runde starten.
2. Lehrer-Vorschau aus dem echten Testeditor speisen und Bearbeiten/Neu generieren sauber zurück in den GradeCrew-Testentwurf führen.
3. Danach entscheiden, welche interaktiven GradeCrew-Typen als eigene Escape-Lerninteraktionen sinnvoll sind, statt sie auf Auswahlfragen zu reduzieren.
4. Bildabhängige Aufgaben erst freigeben, wenn Bild/Alt-Text/Ausschnitt zuverlässig in den Escape-Slot übernommen werden.
