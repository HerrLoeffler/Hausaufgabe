# Wilma: automatische Vorschläge, 20-Euro-Grenze und bestätigter Fundus

Task GC-PEDAGOGY-KB-01 · Auf Production veröffentlicht am 29.10.2026. Der automatische Start wurde direkt vom Menschen bestätigt und anhand der tatsächlichen Belege lesend nachgeprüft.

## Verhalten

Beim Öffnen eigener sichtbarer Ergebnisse bereitet Wilma Vorschläge ohne zusätzlichen KI-Start vor. Auswahl- und Zahlenaufgaben werden weiterhin nach festen Regeln bewertet. Bei Freitext kommen frische bestätigte Antworten und exakt akzeptierte Lösungen vor einem API-Aufruf. Neue nichtleere Freitexte bleiben auch bei einer passenden Musterlösung bis zur Lehrerbestätigung offen. Leere Antworten zählen nach der Regel null Punkte.

Bestätigte Punkte und historische abgeschlossene Bewertungen bleiben erhalten. Ungeprüfte KI-Vorschläge werden weder als bestätigte Bewertung gelernt noch als endgültige Note freigegeben.

## Veröffentlichung und Prüfung

Frontend: `69414965b345881a8e66e55b6b76b2dd982dec41`, Tree `a6dc1a9c95e2e86e0251086b85dcf98e8ae198da`, PR396. Hosting: `69a993a0fd01dd38`. Auf gradecrew.de und hausaufgabe-staging.web.app stimmen jeweils 215/215 Laufzeitdateien. 213 vorhandene Dateien und die Hostingkonfiguration sind erhalten. Geändert wurden vier Wilma-Dateien und das Manifest.

Der separat freigegebene Tutorialstand ec7 bleibt in beiden Dateien erhalten. Sein Hostingnachweis a30cfc wurde vorab mit dem tatsächlichen Cloudstand und eigenen Hashprüfungen abgeglichen. Das Backend bleibt auf 54f: Review00004-nuz und Submit00055-pur sind ACTIVE; 60 andere Functions, Regeln und Staging blieben erhalten. Für 694 war kein neuer Backenddeploy nötig.

Die exakte CI40959952965 ist erfolgreich: Node123749819925 und Browser123749820174. Lokal bestanden 561 Root/UI-, 464 Functions- und 94 Assessmenttests sowie die 124 Wilma-CI-Verträge. Der unabhängige Integrationsreview bestand mit 250 Tests. Ein zuvor gefundener Fehler beim Wiederöffnen historischer Freitexte wurde mit Client-, Server- und Entscheidungsservice-Regressionsfällen behoben und unabhängig nachgeprüft.

Frühere gescheiterte Tutorialprüfungen bleiben als Versuchshistorie erhalten. Es wurden keine Freigaben umgangen oder unveränderte fehlerhafte Läufe blind wiederholt.

## Echte eigene Live-Testdaten

Es wurden ausschließlich fiktive Tests verwendet; echte Schülerbewertungen blieben unverändert.

- **WILMALIVE261029, A:** Normale Abgabe, echte KI mit 2/2-Punktevorschlag bei weiterhin gespeicherten 0 Punkten und offener Prüfung. Erst die Lehrerbestätigung speicherte 2/2 und Note1 und erzeugte einen Fundusbeleg.
- **B, identische Antwort:** Das menschliche Bildschirmbild zeigte den 2/2-Vorschlag. Anschließend waren 2/2 und Note1 dauerhaft gespeichert, während der Providerzähler bei1 blieb. Die Wiederverwendung ohne weiteren API-Aufruf ist damit belegt.
- **L, leere Antwort:** Normale Abgabe mit 0/2, Note6 und ohne zusätzliche Prüfung oder API.
- **C, Teilantwort, und D, identische Antwort:** Martin bestätigt, dass die Vorschläge ohne KI-Start erscheinen. C erhielt per API1/2 und ist bestätigt mit Note4 gespeichert. D erhielt2/2 ohne API und ist bestätigt mit Note1 gespeichert. In den zwei tatsächlichen Providerbelegen kommen nur A und C vor; kein bezahlter Beleg enthält B, D oder L.
- **WILMARULE261029:** Eine neue echte Abgabe belegt die Auswahlantwort mit 1/1 und needsReview=false sowie den exakt richtigen Freitext „Verb“ mit vorläufig 1/1 und needsReview=true. Die Gesamtnote bleibt leer; der Schülerbeleg zeigt keine offenen Punkte. Kein API-Aufruf.

Eine zusätzliche reine Leseintegration des tatsächlich veröffentlichten Kerns an den fiktiven Dokumenten ergab teacher-fundus, requestId=null, Provider0 und Reservierung0. Dieser Lesecheck allein ist kein authentifizierter HTTP-Nachweis.

Beide eigenen Eingaberunden sind geschlossen; Ergebnisse und offene Lehrerprüfungen bleiben erhalten. Unmittelbar nach Hosting standen unverändert ein Providerstart und1056MikroEUR konservative Verbrauchsobergrenze. Nach dem menschlichen Automatiktest sind es genau zwei Providerstarts und2178MikroEUR bei weiterhin null offener Reservierung. Bestätigte Punkte änderten sich nur durch die menschlichen Entscheidungen. Der prüfende Lesecheck erzeugte keine weitere API-Anfrage oder Schreiboperation.

## Geld und Grenzen

Die gemeinsame Monatsgrenze beträgt 20EUR: Staging hält bereits 8,75EUR für Live zurück. Damit sind effektiv höchstens 11,25EUR auf Staging und 8,75EUR auf Live möglich. Es gibt keinen zweiten 20-Euro-Topf und keine gelöschte Verbrauchshistorie.

Vor einem API-Aufruf wird eine konservative Obergrenze reserviert. Vollständige Nutzungsdaten erlauben die Abrechnung; bei unbekanntem Verbrauch bleibt die Reserve erhalten. Private Fundusbelege gelten 90Tage und nur für denselben Eigentümer, Test, Aufgabenstand, Bewertungsmaßstab und dieselbe Antwort. Sie enthalten keine zusätzliche Rohtextkopie und dienen keinem Training über andere Tests.

Der automatische Start und die anschließenden gespeicherten Bestätigungen sind durch tatsächlichen menschlichen Gebrauch angenommen. Weiterführende Live-Korrektur/Undo/Reload-Schritte über die vorhandene Stage-Abnahme und automatisierten Verträge hinaus bleiben getrennte Nacharbeit. Die Browserkontrolle im Host war nicht verfügbar und wurde nicht umgangen. Es gibt keinen physischen iPad-Nachweis. Code-, CI- und Hostingnachweise sind keine pauschale Messung einer 99-Prozent-Bewertungsqualität.
