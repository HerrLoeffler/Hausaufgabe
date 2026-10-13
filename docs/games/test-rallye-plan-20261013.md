# Test-Rallye – vierte GradeCrew-Spielkachel

**Planungsentwurf zur Diskussion · GC-GAMES-TEST-RALLYE-01 · 13.10.2026**

Dieser Vorschlag beschreibt ein neues Browser-Spiel neben Mathe, Deutsch und Englisch. Er autorisiert keine Implementierung, keinen Build, Test, Merge oder Deploy. Produktentscheidungen in „Offen“ sind bewusst nicht vorweggenommen.

## Zielbild

Eine Lehrkraft wählt einen vorhandenen GradeCrew-Test oder erstellt/bearbeitet ihn mit dem bestehenden Test-Ersteller. Sie legt Fach, Klasse, Thema und Aufgabentypen fest und startet daraus eine gemeinsame Spielrunde. Schüler:innen treten mit Code/QR und einem Kürzel bei und bearbeiten die Aufgaben selbst. Die vierte Kachel heißt vorläufig **Test-Rallye**.

Die Rallye verwendet Aufgaben und Antwortverträge des Tests. Sie führt keinen zweiten Quizgenerator ein und zwingt Aufgaben nicht in Multiple Choice. Bestehende Aufgaben- und Testdaten bleiben maßgeblich.

## Aufgaben und fachliche Bewertung

Ziel sind alle vorhandenen automatisch bewertbaren Aufgabentypen, soweit die Spielansicht sie mit ihrem bestehenden Renderer und Bewertungsvertrag vollständig darstellen kann: Single Choice, Multiple Choice, Richtig/Falsch, Dropdown, Zahl, Lücke, Zuordnung, Reihenfolge, Gruppen sowie Wort- und Farbmarkierung. Bilder und Audio werden nur angeboten, wenn Aufgabenvertrag und Spielansicht dies tatsächlich unterstützen; sonst muss die Einschränkung vor dem Start sichtbar sein.

Vor Umsetzung ist der aktuelle gemeinsame Bewertungsvertrag erneut zu prüfen. Als derzeitige Grundlage ist dokumentiert: assessment-functions/lib/assessment-core.js unterstützt 11 Typen und Teilpunkte; FastQuiz meldet Scores dagegen aus dem Client. Es gibt noch keine belegte sofort nutzbare Games-API für serverseitige Spielabgaben. Für Rallye-Abgaben, Bewertung, Punktestand und Antwortsperre ist daher eine neue serverseitige Spiel-Abgabe nötig; dieser Entwurf behauptet keine vorhandene Micrograding-API. Kein KI-Jury-Aufruf pro Antwort.

Mehrteilige Aufgaben werden erst mit einem ausdrücklichen „Prüfen“-Button bewertet. Einzelne Markierungsklicks, unvollständige Eingaben oder bloßes Nachdenken sind keine falsche Abgabe. Pro Aufgabenversuch gilt zunächst eine Abgabe. Die bestehende Testbewertung mit Teilpunkten muss in Spielpunkte übersetzt werden; Teilpunkte und Sperre bei Teilfehlern sind offen.

Freitext mit technisch hinterlegten acceptedAnswers kann möglich sein. Semantischer oder manueller Bewertungsbedarf muss vor dem Rundenstart sichtbar sein; solche Aufgaben werden nicht still übersprungen oder automatisch als falsch gezählt. Eine unsichere KI-Bewertung löst keine Sperre aus. Alternative bestätigte Antworten und spätere Lehrkraftfreigabe bleiben Klärungspunkte.

## Vorgeschlagener Rundenablauf

Vorläufig wird der vorhandene Games-Rundenfluss wiederverwendet: Raum erstellen → QR/Code teilen → Schülerkürzel eingeben → gemeinsamer Start → individuelle Aufgabenbearbeitung → Rückmeldung, Punkte und kurze Antwortsperre → Live-Board → Rundenende. Die konkrete Lobby-/Board-Integration ist anhand des aktuellen Hauptstands zu bestätigen.

Alle erhalten dieselbe Aufgabenfolge; optional kann es wie im bestehenden Spiel eine gemeinsame gemischte Reihenfolge geben. Persönliche Zufallsfolgen sind nicht der Vorschlag. Nach einer falschen Antwort geht es wie im belegten FastQuiz-Ablauf zur nächsten Aufgabe. Wiederholungs- und Lernmodus können später als Option besprochen werden. Die Dauer ist wählbar; die Runde endet beim letzten Item oder mit Ablauf der Zeit. Es gibt keine automatische Aufgabenwiederholung. Die beim Start verwendete Testversion wird fixiert und bleibt während der Runde unveränderlich.

Übungsspiel und formaler Testversuch samt Bewertung werden klar getrennt. Ein Übungs-Score darf nicht als formale Testnote erscheinen. Lösungsschlüssel bleiben für Schüler:innen unzugänglich; Abgabe, Bewertung, Punktestand und Sperrzeit müssen serverseitig geschützt und ein Reconnect idempotent sein. Diese Sicherheitsziele sind Akzeptanzanforderungen, kein Nachweis einer bereits vorhandenen Umsetzung.

## Punkt- und Zeitregeln als Diskussionsvorschlag

Vorschlag: vollständig richtige Aufgabe +100 Punkte; falsche Antwort −50 Punkte und fünf Sekunden Antwortsperre. Der Zeitbonus bleibt bei heterogenen Aufgaben standardmäßig aus; ob er konfigurierbar angeboten wird, ist offen. Die Sperre betrifft nur weitere Antworten, zeigt Feedback und klaren Countdown und endet automatisch. Nachdenken, Ladezeit, Verbindungsfehler oder technische Probleme lösen keine Sperre aus.

Teilpunkte und Sperrverhalten bei teilweise richtigen Mehrteilern sind offen. Lange Aufgaben brauchen angemessene Punkte und Rundendauer. Ein freiwilliger „weiß nicht“-Button kann angeboten werden; Behandlung und mögliche Strafe bleiben offen. Die Aufgabe wird erst nach expliziter Abgabe gewertet.

## Technikrichtung

Vorschlag: vorhandenes Browser-/DOM-Spiel, vorhandene Aufgabenrenderer, Games-Lobby und Board sowie ein kleiner neuer Game-Adapter. Kein zweiter Editor, kein Enginewechsel und keine 3D-Produktion. Vor technischer Umsetzung sind Renderbarkeit, neue serverseitige Spiel-Abgabe, unveränderliche Testversion und sichere Ergebniszustellung im aktuellen Code nachzuweisen.

## Erste vollständige Referenzrunde – spätere Umsetzungs-/Abnahmeidee

Eine erste vertikale Runde umfasst sechs gemischte Aufgaben aus Auswahl, Mehrfachauswahl, Zahl sowie Wort-/Farbmarkierung. Sie wird in echten Lehrer- und Schüler-Browser-Sitzungen durchgespielt. Prüfpunkte: Start und Beitritt, richtige und falsche Antwort, Sperre mit Countdown, Teilantwort, Rundenende, Live-Board, Reload und Netzunterbrechung/Wiederbeitritt. Touch- und Tastaturbedienung gehören dazu. Physischer QR-Kamera-Scan und iPad-Abnahme werden separat dokumentiert.

Ein Entwicklungsmodus soll in Development das Springen zu einer Aufgabe und einem Testzustand, Reset, Diagnose und Meldungen erlauben; danach muss normales Weiterspielen möglich sein. In einem Release gibt es diese Abkürzungen nicht.

Nach der Referenzrunde folgen weitere vorhandene automatisch bewertbare Typen. Freitext/Teilpunkte-Regeln kommen nach expliziter Produktklärung hinzu.

## Offene Produktfragen

1. Nach einer falschen Antwort bei „weiter zur nächsten Aufgabe“ bleiben oder später auch einen Wiederholungs-/Lernmodus anbieten?
2. Wie werden teilweise richtige Mehrteiler bepunktet, und löst ein Teilfehler eine Sperre aus?
3. Freitext im ersten Spiel zulassen, sofern acceptedAnswers klar sind, oder zunächst später ergänzen?

„Weiß nicht“, alternative Antworten, Bilder/Audio-Unterstützung und Zeitbonus-Konfiguration sind zusätzliche Detailentscheidungen. Die bestehende Testbewertung mit Teilpunkten muss von der Spielwertung unterscheidbar bleiben. Übung und formale Bewertung brauchen einen klaren Produktvertrag.

## Belege und Grenzen

Dokumentationsbasis dieses Entwurfs: aktueller main-Einstieg und Koordinationsregeln, Games-Registry, aktuelle FastQuiz-Übergabe und Games-/Escape-Produktionsgrundlagen; außerdem der übergebene Statushinweis zur Bewertungsbasis (assessment-core.js, 11 Typen/Teilpunkte; FastQuiz client-reported). Die Grundlagen belegen benachbarte Verträge, nicht die Existenz einer fertigen Rallye, einer fertigen serverseitigen Spiel-Abgabe, einer sicheren Prüfungsintegration oder eine technische Freigabe. Vor jeder Umsetzung sind Code, aktueller Development Status, offene PRs und Zielbranch erneut zu prüfen.

**Status:** Planungsentwurf; drei Produktfragen offen; keine Produktimplementierung freigegeben.
