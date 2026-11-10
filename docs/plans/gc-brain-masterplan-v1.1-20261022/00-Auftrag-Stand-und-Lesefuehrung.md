# GradeCrew Firmenzentrale: Gesamtplan und Betriebsbuch

Version 1.1 | 22. Oktober 2026 | Task GC-BRAIN-01 | Planung, keine Betriebsfreigabe

## 0.1 Zweck dieses Gesamtplans

Die Firmenzentrale soll Martins täglicher Führungs- und Arbeitsort werden. Er sieht, was das Unternehmen erreichen will, welche Vorhaben dazu beitragen, welche Probleme den Betrieb behindern, welche Entscheidungen anstehen und welche Arbeit gerade wirklich ausgeführt wird. Er kann an einem Bereich, Ziel oder Problem eine Aufgabe eingeben. Die Zentrale beschafft den nötigen Kontext, weist die passende Fachzuständigkeit zu und führt Rückfragen, Ergebnisse, Prüfungen und Fortschritt wieder in derselben Akte zusammen.

Die Firmenzentrale führt damit ein Arbeits- und Entscheidungsmodell. Ein Sprachmodell unterstützt das Verstehen, Recherchieren, Formulieren und Planen. Die verlässlichen Fakten, Rechte, Aufträge, Kostenstände und Zustandswechsel gehören in ein dauerhaftes System außerhalb eines einzelnen Chatkontexts. Geschäftsführung und rechtlich verantwortliche Menschen bleiben identifizierbar. Eine KI erhält weder durch eine Rollenbezeichnung noch durch eine freundliche Antwort neue Vollmachten.

Der vorliegende Plan beschreibt deshalb gleichzeitig das Betriebsmodell der Firma, die Bedienung, die Datenhaltung, die Nachrichtenwege, die technische Ausführung, die Automatisierung, die Nachweisführung und die Lieferung. Die Kapitel enthalten vorgeschlagene Produktverträge. Sie sind keine Behauptung, dass diese Komponenten bereits existieren.

## 0.2 Gesicherte Anforderungen Martins

- Eine zusammenhängende Sicht über alle wichtigen Firmenbereiche und ihre Beziehungen.
- Direkt am konkreten Thema arbeiten, Aufgaben geben, Ziele weiterverfolgen und neue Ziele setzen.
- Ziele mit Unterthemen, offenen Bausteinen, Restarbeit und nachvollziehbarem Fortschritt sehen.
- Ein Hauptkern, der bestätigte Entscheidungen, geltende Konzepte und nächste Schritte kennt.
- Bereits besprochene Dinge erhalten und berücksichtigen, damit Martin sie nicht dauernd wiederholen muss.
- Konzepte fortschreiben, statt alte Fassungen und neue Ideen ungeordnet zu vermischen.
- Kaufmännische, rechtliche, datenschutzbezogene, pädagogische, konzeptionelle und analytische Arbeit erfassen.
- Eine brauchbare, klare Oberfläche für Desktop, iPad und Mobil.
- Aufgaben aus der Übersicht zuerst zur bestehenden GradeCrew Zentrale; dahinter Fachbearbeitung und Rückmeldung zur ursprünglichen Akte.
- Keine erforderliche Auswahl eines Chats, Modells oder Anbieters durch Martin.
- Den vorhandenen unterstützten Desktop-/MCP-Anschluss ernsthaft prüfen; eine eigene Modell-API ist keine gesetzte Voraussetzung.
- Automatisierung erst auf eindeutig beschriebenen Prozessen aufbauen.
- Bestehende gute Lernaufgaben erhalten und technische Erneuerungen als eigenen Qualitätsblock steuern.
- Die drei relevanten Fachstränge mit ihren bestehenden Aufgaben und Nachweisen zusammenführen.
- Grün für genaue Fassungen und Einsatzbereiche belegen, Fehler gezielt beheben und Regressionen dauerhaft prüfen.
- Kundenanfragen, E-Mails und Probleme in einem gemeinsamen Eingang mit durchgehender Bearbeitung führen.
- Bestehende Aufgaben, Fachchats, Versuchshistorien, Budgetgrenzen und Releasebelege weiterverwenden.
- Production durch diese Planungsarbeit nicht verändern.

Diese Anforderungen sind der Maßstab für Entscheidungen. Ein technischer Vorschlag, der Martin wieder zum Kopieren zwischen mehreren Chats zwingt, erfüllt die angestrebte V1 nicht. Eine vorübergehende manuelle Diagnose darf so bezeichnet werden; sie ersetzt keine Produktabnahme.

## 0.3 Stand und Beleggrenzen

Gesamtstand zur alltagstauglichen Firmenzentrale: 2/10 als begründete Einschätzung, kein gemessener Prozentwert. Ein geprüfter Plan und ein zunehmend brauchbarer lokaler Entwurf existieren. Der persistente und nachweisbare Kreislauf von Auftrag, Zuständigkeit, Fachausführung, Rückfrage, Ergebnis und Zielbeitrag fehlt noch.

Historische Ausgangspunkte der Fassung 1.0, am 22.10.2026 vor diesem Review erfasst. Sie bleiben als Quellenhistorie erhalten. Aktueller Abgleich dieser Revision: Band 16.9; insbesondere ist der alte Branchabstand keine aktuelle Zahl.

| Quelle | Gesicherter Stand | Bedeutung |
| --- | --- | --- |
| GitHub main | 970db464cc382ed13678d8913e999f6cf5c86c71 | Regeln und Projektregister für diesen Abgleich |
| Akzeptierter Plan | PR269 bei 7342609fb90bffeaecf6f07855173936ef1023bc | Drei gezielte Deltareviews PASS, jeweils 9/10 Planreife |
| Dokumentationsfolge | cf5b8c4e0029b9742b158d6d845aafbff7909097 | Planabnahme und bisherige Paketübergabe protokolliert |
| PR269 | offen, Draft; zuletzt dirty und nicht zusammenführbar | Nicht integriert; vor Integration neu abgleichen |
| Standvergleich | vier eigene Commits voraus, 19 Commits hinter main | Zeitpunktbezogener Vergleich, keine dauerhafte Kennzahl |
| Remote-Controlbasis | prototype/gradecrew-control-local-v1 bei 7ccf74ce94a81e5e6ef328475f381c04843b492c | Enthält bestehende App, JSON-Persistenz und MCP 0.2.2 |
| Lokale Controlbasis | b44189be4afdcf86b0e9624053391bd5d38d2a30 | Abweichende lokale Quelle; fremde untracked Berichte erhalten |
| Lokal installierte MCP-Quelle | gradecrew-project-mcp/plugin/mcp.mjs, meldet 0.5.0 | Zusätzliche Reader/Verbindungen; nicht automatisch remote gesichert |
| Designprobe V3 | lokaler Branch design/gc-brain-company-overview-20261022, zuletzt b912d03 | Vier echte Themen als Snapshot; kein automatischer Fachdispatch |
| P0 | Metadatenhandshake vorhanden; Exit-Receipt OPEN | Kein Worker oder Modellturn belegt |
| Separater Login | abgebrochen, eigenes Profil nicht angemeldet | Keine neue Loginaufforderung aus diesem Plan |

Die beiden erfolgreichen Dokumentationsläufe auf cf5b8c4 sind 39682327371 und 39682327270. Auf der akzeptierten Planquelle waren 39681027160 und 39681027252 erfolgreich. Diese Läufe bestätigen ihre jeweiligen Dokumentations-/Auditchecks. Sie bestätigen keine Runtime und keinen Firmenzentralenbetrieb.

Der lokale P0-Rahmen von einem Worker und höchstens zwei Modellturns mit synthetischen Daten ist laut Übergabe genehmigt und ungenutzt. Er ist keine allgemeine Cloud-, API-, Team- oder Dauerbetriebsfreigabe. Die spätere Korrektur priorisiert den bestehenden Desktop-/MCP-Weg und schließt eine erneute Anmeldeaufforderung als nächsten Schritt aus.

## 0.4 Wie dieser Plan gelesen und benutzt wird

Die Geschäftsführung beginnt mit Band 01 und 02: Firmenordnung und Führungsentscheidungen. Produkt und Design lesen zusätzlich Band 03. Der technische Owner benötigt Band 04 bis 08 sowie 10 und 11. Die Zentrale verwendet Band 09 für Paketzuweisung, Band 10 für Abnahme und Band 12 für die Wiederaufnahme. Band 13 enthält Fachobjekte, Band 14 Quellen und Entscheidungen, Band 15 technische Arbeitskarten. Für diese Revision zuerst Band 16 lesen: Befunde, Vereinfachung und Lieferfolge. Band 17 spezifiziert Aufgabenentwicklung und Qualität, Band 18 den gemeinsamen Eingang. Die Übersicht enthält 19 Kapitel, 28 Arbeitspakete, 72 geplante Abnahmefälle und 19 Automationsprofile.

Ein Satz mit „soll“, „Vorschlag“, „Zielwert“ oder „Entwurf“ beschreibt gewünschtes Verhalten. „Belegt“ bezieht sich nur auf die direkt genannte Quelle und deren Umfang. Historische Behauptungen aus Chats werden nicht durch Wiederholung zu aktuellen Fakten.

Jeder technische Vertrag trägt eine Kennung. Anforderungen tragen FZ-REQ, Architekturentscheidungen FZ-ADR, Abnahmefälle FZ-AT und Arbeitspakete FZ-WP. Diese sind Unterkennungen innerhalb GC-BRAIN-01; sie erzeugen keine neue Projektfamilie, externe Issuehierarchie oder Budgetreservierung.

## 0.5 Vollständigkeitsmaßstab

Ein Thema gilt hier als ausreichend geplant, wenn Eingang, dauerhafter Ort, verantwortliche Rolle, Lese-/Schreibrechte, erlaubte Zustandswechsel, Ergebnis, Fehlerbehandlung, Abhängigkeit und Abnahme benannt sind. Bei einer noch unbekannten Hostfähigkeit muss zusätzlich stehen, wie sie geprüft wird und welche Entscheidung ein Scheitern auslöst.

Das Dokument kann betriebliche Details nicht erfinden. Unbekannt sind beispielsweise tatsächliche Mitarbeiterzahl, Rechtsform, Umsatz, Vertragsbestand, benötigte Länderabdeckung, alle Kontoberechtigungen und spätere Teamcloud-Anforderungen. Für solche Angaben ist festgelegt, wer sie erhebt und welche Folgeschritte davon abhängen. Es werden keine fiktiven Kunden, Termine, Umsätze oder Verträge vorgegeben.

## 0.6 Lieferstufen

V1 bedeutet: ein verlässlicher Arbeitsplatz für Martin mit Firmenübersicht, Zielen, Themenakten, quellengebundenem Wissen und echter begrenzter Fachbearbeitung. Die Verbindung muss im gewählten Host tatsächlich funktionieren.

Die Dokumentversion 1.1 ist keine Produktversion. Die vollständige Zielarchitektur wird in den nutzbaren Stufen L0-L6 aus Band 16 geliefert. Aufgabenqualitätsblock und ein externer Eingang folgen dem ersten vollständigen internen Vorgang. Eine spätere Produkterweiterung ergänzt Datenaktualisierung, Wiederholungsprozesse, Qualitätskennzahlen und kontrollierte Reader. V2 bringt nach separater Betriebsentscheidung Teamzugriff und gegebenenfalls Cloudausführung. Spätere kaufmännische Schreibaktionen, externe Kundenkommunikation, Zahlungen oder breite autonome Änderungen erhalten jeweils eigene Profile und Abnahme. Sie werden im Zielbild mitgeplant, aber nicht durch diesen Plan aktiviert.

Die alte Schätzung von 120-204 Stunden war auf den bisherigen V1-Umfang bezogen. Sie wird hier nicht als Restaufwand fortgeschrieben. Band 09 enthält ein Verfahren zur Neuplanung anhand messbarer Pakete, P0-Ergebnis und Inventurumfang.

## 0.7 Verbindliche Leitlinien

Das bestehende main-Register bleibt die Quelle für GradeCrew-Aufgaben und Releasebelege. Die Firmenzentrale wird eine ausführbare Projektion und Ergänzung für Ziele, Entscheidungen, Wissen und Requests; sie erfindet keine zweite widersprechende Releasewahrheit. Persistente Projektentscheidungen bekommen eine definierte kanonische Ablage und eine Projektion, keinen manuellen Doppelabgleich.

Zentralen koordinieren; Fachchats führen ihren autorisierten Scope aus. Der akzeptierte Planstand bleibt historisch unverändert. Neue Architekturverträge dieser Fassung werden vor produktiver Verwendung gezielt geprüft.

