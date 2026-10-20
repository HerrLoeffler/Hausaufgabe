# Reale KI-Durchläufe – 20.10.2026

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
