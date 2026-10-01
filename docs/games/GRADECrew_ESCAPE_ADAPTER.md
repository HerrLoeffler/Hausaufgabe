# GradeCrew → Escape Room Inhaltsadapter

Stand: 01.10.2026. Quelle für den GradeCrew-Fragevertrag ist der aktuell geprüfte Integrationsbranch `feature/gradecrew-app-integration` bei Commit `74eb2ec08e81315875abfc4b1ae052d9f78797eb`.

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

## Adapter v1 – absichtlich fail-closed

Aktuell sicher unterstützt:

| GradeCrew | Escape | Status |
| --- | --- | --- |
| `single` | Auswahlfrage | unterstützt |
| `dropdown` | Auswahlfrage | unterstützt |
| `truefalse` | Richtig/Falsch | unterstützt |
| `text` | Freitext | vorbereitet, noch gesperrt |
| `number` | Zahl | vorbereitet, noch gesperrt |
| `multi` | Mehrfachauswahl | gesperrt |
| `gapfill` | Lückentext | gesperrt |
| `matching` | Zuordnung | gesperrt |
| `ordering` | Reihenfolge | gesperrt |
| `grouping` | Gruppierung | gesperrt |
| `markwords` | Wörter markieren | gesperrt |

Freitext und Zahl sind bewusst noch nicht als „unterstützt“ markiert, obwohl das GradeCrew-Schema die nötigen Lösungen liefert. Erst wenn die Escape-Hauptfrage Eingabe, Variantenprüfung bzw. Toleranz/Einheit vollständig rendert und testet, dürfen diese Typen Fortschritt freischalten.

Der Adapter erzeugt **keine erfundenen Distraktoren**, um komplexe Typen künstlich in Multiple Choice umzuwandeln.

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

- `manualReview: true` darf später niemals direkt als automatischer Fortschritts-Gate verwendet werden.
- Die richtige GradeCrew-Lösung bleibt die fachliche Quelle; der Adapter erfindet keine neue Lösung.
- Lernpakete müssen vollständig sein, sonst schlägt die Adaption fehl.
- Eine KI erzeugt Inhalte, aber keine neue ausführbare Escape-Logik.
- Lösungen und Lernpakete gehören bei echter Schülerauslieferung hinter den vorgesehenen Lehrer-/Server-Schutz; die Lab-Seite ist kein fertiges Berechtigungsmodell.
- Externe Remy-Hilfe wird getrennt über eine serverseitige Tutor-Brücke angeschlossen und ist kein Bestandteil des Frageadapters.

## Implementierung

- Browser-/Lab-Adapter: `lab/escape-room/gradecrew-question-adapter.js`
- Regressionstest: `tools/games/gradecrew-escape-adapter.test.cjs`
- Der Adapter wird im isolierten Escape-Build mit ausgeliefert, ist aber noch nicht in die Haupt-Web-App verdrahtet.

## Nächste Erweiterungen

1. `text` mit `acceptedAnswers` und `manualReview === false` als echten Escape-Antwortmodus implementieren und testen.
2. `number` mit `numericAnswer`, `tolerance` und `unit` implementieren und testen.
3. Danach entscheiden, welche interaktiven GradeCrew-Typen als eigene Escape-Lerninteraktionen sinnvoll sind, statt sie auf Auswahlfragen zu reduzieren.
4. In der GradeCrew-Erstellung einen Modus „Als Escape Room spielen“ ergänzen: acht Aufgaben auswählen/erzeugen → Lernpakete erzeugen → Lehrerprüfung → Preflight → Runde starten.
