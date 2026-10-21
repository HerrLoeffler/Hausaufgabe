# Reale KI-Durchläufe – 20.10.2026

## Aktiver Erweitern-Pilot nach dem Forschungsentwurf

Nachbesserung21.10.: Erneuter Nutzer-Screenshot mit Prüfformatfehler bei2/3×2 und1/1. Prüfprompt gekürzt und Schema vorn/hinten; genau eine automatische KI-Formatkorrektur ausschließlich bei ungültigem Urteil. Fünf neue Regressionen vor Korrektur fehlgeschlagen, danach50Python-/55JS-Fälle grün. Fachliche Ablehnung (auch ohne/null Begründung) wird niemals zur Wiederholung geschickt; wiederholt ungültiges Format bleibt begrenzt und verändert keinen Lernzustand.

Echter Browserlauf107–108 nach finalem Serverstart: Generator erzeugt tatsächlich2/3×2; synthetische1/1 abgegeben. Ohne manuellen Wiederholungsbutton erscheint echte, gesondert KI-geprüfte Regelhilfe: „Beim Erweitern bleibt die Fläche gleich, nur die Teilung wird feiner:2/3 wird mit Faktor2 zu4/6. Zähler und Nenner werden beide mal2.“ Passendes Vorher-/Nachherbild und Faktorfrage mit Antwortfeld. Keine Aussage, dass die Formatkorrektur in diesem Liveaufruf benötigt wurde (Trace deaktiviert); deren Wiederholungs-/Ablehnungszweige sind kontrolliert getestet. Screenshot im Chatoutput output/expansion/ki-formatkorrektur.jpg. Zähler vor eigenem Test106 (einschließlich Nutzerversuchen103–106), danach108/120, kein Reset;12übrig. Server ohne Diagnoseoption, getrenntes Testkonto, keine Schul-/Clouddateien geändert.

Die nachfolgenden älteren Additionsdurchläufe sind Historie. Aktive Route: `expansion.mjs`/`expansion.py`, bestehender GradeCrew-Generator plus gesonderte Emmi-Prüfung; Hilfetext und Lernfrage ebenfalls echte Emmi-Erzeugung mit zweiter Prüfung. Nur synthetische Angaben im eigenen Browser-Testtab, getrenntes Testkonto.

| Endpunkt | Echte Browserbeobachtung |
|---|---|
|94–95|Aufgabe2/5 mit2 erweitern. Absichtlich4/7 statt4/10: Hilfe betrifft ausschließlich den Nenner5×2; richtiger Zähler bleibt erhalten.|
|96|Auf Hilfefrage absichtlich7: tatsächlich kleineres, ausdrücklich benanntes Beispiel1/2 mit2 erweitern. Vier kleine Teile statt zehn, Originalaufgabe separat sichtbar.|
|97|Auf Frage nach vier Teilen absichtlich3: nun nur ein einziges altes Stück, in zwei Teile geteilt. Kurze echte KI-Erklärung, passende Darstellung und beantwortbare Frage.|
|98|Antwort2 richtig: zurück zu2/5 mit2, korrekter Zähler4 vorgegeben, Nenner erneut einzugeben. Kein unabhängiger Erfolg.|
|99|Nenner10 richtig: neue selbstständige Aufgabe1/3 mit2. Anzeige0/1 unabhängig richtig,1mitHilfe gelöst; beide Ergebnisfelder leer.|
|100–101|2/6 richtig. Einmal liefert die Gegenprüfung Fließtext statt JSON; sichtbar gestoppt, Eingabe/Zustand erhalten. Bewusster einmaliger erneuter Versuch liefert neue freigegebene Aufgabe3/5 mit3, Anzeige1/2 unabhängig richtig. Keine automatische Lesehilfe oder Wartepflicht.|
|102|3/5×3 mit9/15 richtig: neue Aufgabe2/7 aufNenner21. Faktor selbst finden und Ergebnisbruch eingeben; tatsächlich andere Anforderung. Anzeige2/3 unabhängig richtig,1mitHilfe gelöst, kein Beherrschungslabel.|

Abschlussverbrauch102/120, ursprüngliche80er-Historie erhalten:22zusätzliche Endpunkte in diesem Umsetzungsauftrag,18im lokalen Rahmen übrig. Meist zwei Backendaufrufe je Endpunkt, interne Versuche möglich; tatsächliche Token/Euro unbekannt. Diagnose-Trace nach Abschluss deaktiviert; Server bleibt lokal für den Nutzertest offen.

Frühere Fehlversuche81–93 bleiben in der Übergabe dokumentiert: Rollenpassung des Generators, Frageformat, Stück-/Nennertrennung, Skalarformat und die Trennung Originalaufgabe/kleines Beispiel wurden anhand echter Ablehnungen verbessert. Keine Prosa nachträglich als Prüffreigabe interpretiert, keine feste Ersatzaufgabe. Bereits84–85 war der selbstständige Übergang3/5×2 richtig zu2/7×3 im Browser belegt.

45Python-/55JS-Tests frisch grün; unabhängiger Quellreview bestätigt behobene Wiederholungs-/Busyfehler und keine weiteren wichtigen konkreten Bugs im überprüften Scope. Dies ersetzt keine fachliche Lehrkraft- oder Lernwirkungsprüfung. Zweitprüfung verwendet denselben KI-Dienst. Screenshot des tatsächlichen97er-Lernschritts liegt im lokalen Chatoutput `output/expansion/ki-rueckschritt.jpg`. Keine aktuelle Mobil-/physische Geräteabnahme behauptet.

Task GC-ADAPTIVE-PRACTICE-01, lokaler Bruchpilot auf8769, getrenntes Lehrkraft-Testkonto in gradecrew-staging-2026. Synthetische Eingaben im separaten Testtab. Kein Schulzugang, Clouddeploy oder echte Schülerakte.

| Tatsächliche Aufgabe / Eingabe | Beobachtung |
|---|---|
|3/8+1/4 →10/16|Gleichwertige richtige Antwort akzeptiert; KI fordert Anspruch2. Keine automatische Hilfe/Lesepause, nur1/1Zwischenstand.|
|1/4+1/5 →18/40|Beide Brüche müssen erweitert werden; ungekürzte Lösung akzeptiert. KI fordert Anspruch3.|
|3/4+7/10|Neue KI-Aufgabe mit zwei Erweiterungen und Ergebnis29/20>1, rechnerisch und durch separaten KI-Aufruf geprüft.|
|3/4+7/10 →10/14|Falsch. KI wählt leichtere Probe.|
|1/4+1/10 →2/14|Zweiter Fehler. KI schaltet zum Erweitern/Gleichwertigkeit zurück, statt weitere gleich schwere Addition zu geben.|
|Erster Erklärungsentwurf|Zweite KI-Prüfung blockiert: falsche Schülerantwort wurde als behauptete Lösung interpretiert. Übergabe korrigiert: studentAttempt ausdrücklich keine Musterlösung. Fehlerhistorie und Kosten erhalten.|

Zähler vor diesem Auftrag41/80, nach obigen9Endpunktaufrufen50/80. Jeder Aufgaben- bzw. Erklärungsendpunkt enthält zusätzlich zum Erzeuger einen separaten KI-Prüfaufruf. Endpunktzählung ist kein Token-/Eurobudget, interne Backendversuche können hinzukommen. Tatsächliche Token/Euro unbekannt.

Nach Korrektur: echter UI-Dialog1/4+1/8, Eingabe2/12, kurzeKI-Erklärung mit Bruchstreifen und Antwortfeld. Mikroantworten3und4falsch blockierenWeiter und gehen anKI. Zuerst blieb die konkreteFrage trotz nominellem Rückschritt gleich; auch das wurde korrigiert und separat real wiederholt. Richtige Mikroantwort2 aktiviertWeiter, kein Kompetenznachweis.

Zusätzliche echteAPI-Wiederholungen (kontrolliert aus diesem beobachtetenFall, nicht als vollständiger neuerUI-Durchlauf ausgegeben): fehlgeschlageneUnterteilung→parts0/whole; Erklärung zum Erkennen eines Anteils; kurzeAdditionserklärung ohneBild; nachunterstütztemErfolg→add0; neu erzeugtegleichnamige3/8+1/8. LetztePromptprobe63–65 bestätigtweiterhinparts0/whole und zwei zusätzlichKI-geprüfteErklärungenohneBild. Beispiel: „2 blaue und 1 orange Teile sind 3 Teile. Jeder Teil ist ein Achtel, also sind es 3/8.“ Der Abschluss fordert weiterhin nur eine unterstützte kleineFrage, keinen unabhängigen Beleg. API-Resultate lokal/private/tmp/gradecrew-final-replay-results.json, keineCredentials.

76automatisierteTests (49JS,27Python) grün. UnabhängigerCode-Review meldete vierkonkreteBild-/Navigationsfehler; allekorrigiertundnachgeprüft. KeineunabhängigeLehrkraft-/Modellfreigabe: beideKI-Pässe nutzen denselbenDienst. Bis65/80 Endpunktaufrufe erhalten, letzterUI-Smoke separatimHandoff. Keine langfristige Lernerfolgs-, Geräte-, Last- oder fachliche Lehrkraftabnahme aus diesen synthetischen Durchläufen ableiten. Anspruch0–3 ist ein begrenzter Pilot; kein unendlicher Schwierigkeitsanstieg oder universelles Didaktiksystem.

Finaler UI-Beleg69–71:3/10+1/5, Hilfe zeigt feineresTeilen von1/5zu2/10. KurzeKI-Erklärung mit zusätzlichfreigegebenerPrüfung, direktesAntwortfeld. Antwort3blockiertWeiter, Antwort2gibtWeiterfrei; kein unabhängigerBeleg. Screenshot/private/tmp/gradecrew-ki-dialog-final.png. Gesamt71/80erhalten, TesttabgeschlossenundStartsauberübergeben. Neuer390px-VersuchgriffnichtaufTesttab;keinaktuellerMobilnachweis.
