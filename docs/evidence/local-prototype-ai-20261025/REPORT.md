# Echte KI im lokalen Aufgabenlabor

Task GC-EXTENDED-QUESTION-TYPES-01, 25.10.2026. http://127.0.0.1:8784/ verwendet jetzt die vorhandene isolierte GradeCrew-Test-KI statt einer vorbereiteten Antwort auf dem Erstellknopf. Die drei Beispielmischungen bleiben ausdrücklich als Beispiele verfügbar.

## Tatsächlich geprüft

- Browser: „Mit KI neu erstellen“ → Fach Mathematik, Klasse 6, Winkel/Koordinaten/Diagramme → neun neue Aufgaben mit 24 Punkten im vorhandenen Editor.
- Echter Remote-Job 8635d516530703b22ce3d4f805bd2b406e2377a2, lokaler Request b959edaf-4f74-4334-8332-683eb7d8ab56, keine Wiederholung. Die vorhandene Backendstrecke übernimmt Generierung und Reparatur.
- Browser: Emmi vereinfacht die neun Arbeitsaufträge; Backend meldet neun Änderungen mit Modell gpt-5.6-luna. Tatsächlicher Modellstand des vorhandenen Backends, kein behaupteter Modellwechsel. Ausgabe mit neun Aufgaben/24 Punkten im Editor angekommen und gespeichert. Screenshot outputs/extended-real-ai-20261025.png.
- Beide Ergebnisse mit aktuellem Assessmentvertrag geprüft: lösungsfreies Schülerpapier und jeweilige Musterantworten 24/24 Punkte. Details ohne Schülerdaten in checks.json.
- 32 relevante lokale Tests bestanden: Schülerweg/Bestätigung, drei Beispielvarianten, HTTP-/Ursprungsschutz, private Dateien, gleichzeitiges Speichern, Notenschlüssel, KI-Request-Wiederaufnahme und manuelle Ergebnisprüfung.

## Fehler gefunden und behoben

Unabhängiger Review: Ein unterbrochener Auftrag konnte bei neuem Wunsch derselben Art das alte Ergebnis einer anderen Frage zuordnen. Jetzt bindet ein Eingabefingerabdruck die Wiederaufnahme; anderer Inhalt erfordert explizite Wiederherstellung. Regression zuerst fehlgeschlagen, danach bestanden. Fertige Überarbeitungen wurden beim Fortsetzen zunächst nur gemeldet und verbraucht; nun zeigt ein Dialog das Ergebnis, behält es beim Schließen und öffnet es erst nach ausdrücklicher Auswahl im Editor. Zwei DOM-Tests und gezielter Clienttest bestätigen dies. Keine zweite Review-Runde.

## Grenzen

Nur localhost und vorhandene visual255-Testdienste, keine Functions-/Rules-/Hosting-/Productionbereitstellung. Serveranmeldung und Tokens bleiben auf dem lokalen Server. Der Browser erhält keinen Providerkey. Vorhandene Backendquoten bleiben wirksam; höchstens ein lokaler kostenpflichtiger Auftrag gleichzeitig. Neuladen wiederholt keinen bezahlten Start automatisch. Zusätzliche Medienjobs/Uploads sind in diesem Experiment nicht freigeschaltet; bestehende rendererbasierte Grafiken funktionieren. Einzelüberarbeitung/Varianten sind an den bestehenden Endpunkt angeschlossen und lokal mit kontrollierten Antworten getestet, hier kein zusätzlicher echter Variantenaufruf. Zwei echte Provideroperationen ausgeführt; keine genaue Kostenabrechnung vorhanden. Technische Korrektheit ist keine vollständige pädagogische Abnahme der neuen Aufgaben. Kein Touch-/iPadnachweis.

Der Dienst läuft über launchctl de.gradecrew.extended-preview mit EXTENDED_AI=1, ausschließlich 127.0.0.1. Kein Neustart-/Login-Autostart eingerichtet. Einmaliges Stop/Start muss in getrennten Schritten erfolgen: sofortiges erneutes submit während remove noch verarbeitet wird kann sonst ohne laufenden Dienst enden. Verfügbarkeit nach tatsächlichem Start separat mit HTTP und Browser prüfen.
