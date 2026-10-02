# GradeCrew Games – Lern- und KI-Leitplanken

Stand: 03.10.2026. Gilt zunächst als verbindliche Produkt- und Architekturregel für den Escape-Room-MVP und als Vorlage für spätere GradeCrew-Games.

## Kernprinzip

**Spaß motiviert. Entscheidender Spielfortschritt wird regelmäßig durch nachgewiesenes Lernen verdient.**

Ein Spiel darf Entdecken, Animationen, Items, Rätsel und reine Fun-Momente enthalten. Lernrelevante Fortschrittsstellen dürfen aber nicht dadurch lösbar sein, dass ein Schüler alle Antworten oder Symbolkombinationen stumpf durchprobiert.

## Individuelle Aufgabenvarianten pro Schüler

Wenn eine Lehrkraft Fachfragen bzw. Lernziele für ein Spiel vorgibt, sollen Schüler **nicht einfach dieselbe konkrete Aufgabe mit denselben Zahlen oder Antwortwerten** erhalten.

Verbindliche Zielrichtung:

- gleiches Lernziel, gleiche Kompetenz und vergleichbares Schwierigkeitsniveau;
- pro Schüler bzw. Spielsession deterministisch erzeugte, äquivalente Varianten;
- in Mathematik z. B. andere Zahlenwerte bei gleicher Rechenidee;
- bei geeigneten anderen Fächern alternative Beispiele, Reihenfolgen, Distraktoren oder gleichwertige Formulierungen;
- Transferaufgaben werden ebenfalls aus demselben Lernziel variiert;
- ein Seed hält die Variante innerhalb einer Session stabil und reproduzierbar;
- die Lehrkraft sieht weiterhin die zugrunde liegende Aufgabenfamilie und das Zielniveau.

Zusätzlich darf das bloße Weitergeben eines fertigen Codes oder einer fremden Lösung den eigenen Fortschritt nicht ersetzen. Relevante Gates prüfen deshalb den **eigenen gelösten Lernzustand**. Wo sinnvoll können auch Codes, Schlüsselwerte oder daraus abgeleitete Hinweise pro Session/Schüler variiert werden, ohne die Geschichte oder das Niveau zu verändern.

Damit kann die Klasse dieselbe Spielwelt gleichzeitig erleben, während Abschreiben bzw. das einfache Zurufen von Antworten deutlich weniger wirksam wird.

## Lernschleife bei Fehlern

Für Lernfragen gilt standardmäßig:

1. Erster Fehlversuch: normal erneut versuchen; kurzer Hinweis bleibt verfügbar.
2. Zweiter Fehlversuch: Antwortreihenfolge wird erneut gemischt; Remy-Hilfe wird sichtbar.
3. Dritter Versuch ohne sicheren Lernerfolg: kurze, sachliche Erklärung statt automatischer Freigabe.
4. Der Schüler muss aktiv mit der Erklärung arbeiten, z. B. einen zentralen Merksatz eingeben, Begriffe ergänzen oder einen Rechenschritt vervollständigen.
5. Danach folgt eine **neue, ähnliche Transferaufgabe zum selben Lernziel**.
6. Erst nach erfolgreicher Transferaufgabe wird der zugehörige Spielfortschritt freigeschaltet.

Auch wenn die richtige Multiple-Choice-Antwort erst nach mehreren Versuchen gefunden wird, ersetzt sie den Lerncheck nicht. Damit kann das systematische Durchprobieren aller Auswahlmöglichkeiten nicht als Lernerfolg gelten.

Die Lernintervention soll kurz und sinnvoll bleiben. Sie ist keine Strafarbeit. Ziel ist Verstehen und erneutes Anwenden, nicht möglichst viel Text.

## Anti-Raten bei Spielrätseln

Reine Escape-Rätsel dürfen Spaß machen und müssen nicht immer Fachaufgaben sein. Wo ein Rätsel aber eine zuvor gefundene Information abfragt, darf blindes Ausprobieren nicht beliebig fortgesetzt werden.

Nach wiederholten Fehlfolgen kann das Spiel den Versuch abbrechen und verlangen, den ursprünglichen Hinweis erneut anzusehen. Danach wird das Rätsel wieder freigegeben. Die genaue Schwelle ist Teil der deterministischen Engine und nicht frei von einer KI zu erfinden.

## Remy-Hilfe

Remy darf Schülern genau in dem Moment helfen, in dem eine Verständnislücke auftritt. Mögliche Fragen sind z. B. „Wie fange ich an?“, „Warum teile ich hier durch 100?“ oder eine frei formulierte Rückfrage.

Die Hilfe folgt diesen Regeln:

- kurz, altersgerecht und auf das konkrete Lernziel bezogen;
- möglichst die Verständnislücke erklären statt sofort die vollständige Lösung zu verraten;
- Beispiele nach Möglichkeit mit anderen Zahlen/Inhalten als der aktuellen Aufgabe;
- eine Hilfe allein schaltet niemals den Spielfortschritt frei;
- nach einer intensiveren Hilfe bleibt der Transfer-Lerncheck bestehen;
- Schüler-Rohtexte werden nicht allein für Produktlernen oder Analytics dauerhaft gespeichert.

## AI only when needed

GradeCrew nutzt KI nicht als Standardantwort auf jede Interaktion. Die Reihenfolge ist:

1. **Deterministisch:** bereits vorhandener Hinweis, Musterlösung oder vorbereitete Lernintervention.
2. **Lokale Wissensbibliothek:** bekannte Fehlvorstellungen und häufige Verständnisfragen mit geprüften Antworten.
3. **Kurzzeit-Cache:** identische bzw. normalisierte Fragen derselben Sitzung wiederverwenden.
4. **Günstige externe KI:** nur für neue oder kontextspezifische Verständnisfragen.
5. **Stärkeres Modell:** nur bei Aufgaben, bei denen ein günstiges Modell oder die vorhandene Wissensbasis nicht zuverlässig reicht.

Ein externer KI-Aufruf ist damit ein Fallback und kein Grundmechanismus des Spiels.

## GradeCrew Learning Cache – späterer Serverausbau

Ein zukünftiger serverseitiger Learning Cache soll keine ungeprüfte Sammlung vollständiger Schülergespräche werden. Wiederverwendet werden vorzugsweise abstrahierte und qualitätsgeprüfte Bausteine wie:

- Lernziel;
- Fehlvorstellung / Fehlertyp;
- kurze Erklärung;
- Beispielstrategie;
- anschließende Transferaufgabe;
- aggregierte Wirksamkeit der Erklärung.

Eine mögliche Qualitätskennzahl ist: **Wie häufig wird die anschließende Transferaufgabe nach Erklärung X erfolgreich gelöst?** So kann GradeCrew langfristig wirksamere Erklärungen bevorzugen und zugleich weniger externe API-Aufrufe benötigen.

Serverseitige Speicherung, Retention und Analytics werden erst nach dem separaten Telemetrie-/Datenschutzvertrag aktiviert.

## Lehrerhoheit

Vor einer Runde muss die Lehrkraft ohne Durchspielen sehen können, was fachlich vorkommt: Lernziel, Frage, Lösung, Hinweis, Remediation und Transferaufgabe. Inhalte sollen direkt bearbeitbar bzw. neu generierbar sein.

Die KI befüllt später nur validierte Inhalts-Slots. Sie erfindet keine beliebige ausführbare Spiellogik. Die Escape-Engine, Fortschrittsbedingungen und Lernleitplanken bleiben deterministisch.

In der realen GradeCrew-Integration dürfen Lösungsschlüssel und Lehreransichten nicht ungeschützt an Schüler ausgeliefert werden. Die aktuelle Lab-Vorschau ist nur ein UI-Prototyp und noch kein Berechtigungsmodell.
