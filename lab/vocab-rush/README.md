# GradeCrew Lab · Vocab Rush

## Ziel

Vocab Rush ist das Englisch-Spiel innerhalb von GradeCrew Games. Es verwendet dieselben drei Modi wie Fast Quiz und Fehlerjagd:

1. Üben
2. All-Time-Highscore
3. Live mit Lehrkraft

## Zwei Inhaltsquellen

### Lehrplan-Training

Eingebaute Übungen für Mittelschule Bayern, Regelklasse, Jgst. 5–9. Die Jahrgangsstufe steuert Empfehlungen und Progression; ältere Themen bleiben als Wiederholung verfügbar.

Beispiele:
- Jgst. 5: simple present, simple past, question words, prepositions, some/any/no, einfache phrasal verbs und collocations, irregular verbs.
- Jgst. 6: present progressive, will-future, Modalverben, adjective comparison, object pronouns und erweiterte Wortstellung.
- Jgst. 7: present perfect, Possessiv-/Reflexiv-/Relativpronomen, quantities, should/shouldn't.
- Jgst. 8: going-to-future, relative clauses, adverbs, (a) few/(a) little, weitere phrasal verbs/collocations.
- Jgst. 9: past progressive, if-clauses type I, may/might, tense mix sowie komplexere phrasal verbs/collocations.

Fachliche Referenz: LehrplanPLUS Mittelschule Bayern, Englisch Regelklasse 5–9.

### Meine Vokabeln

Eigene aktuelle Unterrichtsvokabeln können als Set angelegt werden:
- manuell,
- Copy & Paste,
- Foto/Screenshot mit KI-Extraktion.

Ein Set enthält Englisch als `source` und eine oder mehrere akzeptierte deutsche Bedeutungen als `targets`.

## Fotoimport

Der Browser verkleinert das Bild vor dem Upload. Das Bild wird an die separate Staging-Function `vocabRushApi` gesendet und nicht dauerhaft gespeichert. Die Function nutzt den Firebase-Secret `OPENAI_API_KEY`, sendet das Bild mit `store:false` an die OpenAI Responses API und erzwingt ein JSON-Schema für die extrahierten Vokabeln.

Vor dem Speichern erscheint immer eine bearbeitbare Prüfliste. Unsichere Einträge werden vom Modell mit `needsReview` markiert. Die Lehrkraft bleibt für die endgültige Übernahme verantwortlich.

## Lernlogik

Im Übungsmodus steht Lernen vor Punkten:
- nach Fehlern mindestens 5 Sekunden Merkzeit,
- richtige Lösung/Zuordnung wird angezeigt,
- falsch beantwortete eigene Vokabeln werden zeitnah erneut eingestreut,
- kein Zeitbonus im Standard-Übungsmodus.

Highscore verwendet feste Regeln und zunächst nur eingebaute Lehrplan-Disziplinen, damit Ergebnisse vergleichbar sind.

Live unterstützt Lehrplan-Themen und eigene Vokabelsets mit QR-Code, gemeinsamem Start und bis zu 30 Teilnehmenden.

## Datenschutz / Rechte

- API-Key niemals im Browsercode.
- Fotos nicht dauerhaft speichern.
- Keine personenbezogenen Schülerdaten fotografieren.
- Fotografierte Verlagsseiten werden nicht automatisch in einen globalen GradeCrew-Pool übernommen.
- Gespeichert wird nur die vom Nutzer geprüfte strukturierte Vokabelliste.
