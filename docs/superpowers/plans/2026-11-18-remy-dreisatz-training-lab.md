# Remy im Kreativlabor gezielt verbessern

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Dreisatz aus freien Wünschen zuverlässig erzeugen und bewerten, an unbekannten Themen den Transfer messen und menschlich bestätigte Verbesserungen dauerhaft als Rezepte sichern.

**Architecture:** Bestehendes isoliertes Remy-Labor und seine Anmeldung, Builder, Bewertung und Smileys weiterverwenden. Ein serverseitiger Versuchsleiter verwaltet Aufgabenserien, unabhängige Prüfungen, Versionsvergleiche und Budgets. Ein eingefrorener Prüfbestand entscheidet über Verbesserungen, getrennt von Übungsdaten.

**Tech Stack:** Bestehende Firebase-Testumgebung, Node.js und vorhandener Modellrouter. Datenhaltung serverseitig nach bestehenden Projektregeln. Hintergrundaufträge mit stabilen IDs statt einer langen Browseranfrage. Konkrete Modellverfügbarkeit und Preise vor dem ersten Lauf prüfen.

**Spec:** Martins Planungsauftrag vom 18.11.2026, Task GC-EXTENDED-QUESTION-TYPES-01. Aufbau auf dem [Kreativlabor-Nachweis](https://github.com/HerrLoeffler/Hausaufgabe/blob/dfaf6875b2f48386afdab6843f2e750df925befa/docs/evidence/remy-mehrfeld30-20261109/KREATIVLABOR.md), den [Aufgabenprinzipien](../../learning/INTERACTIVE_TASK_PRINCIPLES.md) und [automatischer Formatauswahl](../../learning/AUTOMATIC_TASK_SELECTION.md).

## Stand und Grenzen des Auftrags

Planungsstand 18.11.2026. Im bestehenden Preview sind 30 redaktionelle Mischaufgaben und frühere KI-Beispiele dokumentiert. Der lokale Generator in generate-three.cjs unterstützt derzeit Quellen, Labyrinth, Takt, Hörlücken und Tonhöhen. Die allgemeine Auswahl in mix.cjs prüft bereits strukturierte Absichten und ist noch keine freie Dreisatz-Wunschverarbeitung. Das neue Trainingslabor ist geplant. Dieser Plan startet keine kostenpflichtigen Aufträge.

PR419 ist offen auf dfaf6875b2f48386afdab6843f2e750df925befa, mit Ziel feature/sequence-sheet-pilot-20261028. PR418 hält die Dokumentation auf einem separaten Branch gegen main. Vor Umsetzung aktuelle Branches und Bereitstellung erneut abgleichen. Main wurde auf c79f25d108ae848dc98aac2b23a359385ee92c0e gelesen. Erfolgreicher Development Status 44335140578, Quelle abd74119da6657bf08841c38b26e9a23d0965136. Diese Prüfung belegt den Dokumentationsstand, keine neue Runtime.

## Global Constraints

- Umfang zunächst ausschließlich isolierte Testseite im bestehenden Testprojekt.
- Gleiche Task-ID, erhaltene Feedback-, Versuchskosten- und Versionshistorie.
- Neue Prompts, Rezepte und Modellkombinationen bekommen eigene Versionen.
- Strukturierter Aufgabenentwurf mit geprüften Darstellungsbausteinen.
- Private Lösungen und Prüfbestände serverseitig, Lehrkraftrechte separat.
- Aktive und bereits bewertete Aufgaben unveränderlich. Korrekturen erzeugen Nachfolger.
- Jeder tatsächliche Provideraufruf wird gezählt, inklusive Reparaturen und unklarer Ergebnisse.
- Budgetvorschläge sind Planwerte. Vor kostenpflichtiger Ausführung Grenzwert verbindlich festlegen.
- Kein automatischer Production-Rollout aus KI-Urteilen oder Smileys.

## Review Focus

- Grundgebühr, variable Stückpreise, fehlende Informationen und mehrstufige Prozente dürfen nicht ungeprüft als einfacher Dreisatz enden.
- Mehrere richtige Rechenwege, Dezimalkomma, Einheiten und getrennte Zeichenpunkte dürfen nicht zu Fehlbewertungen führen.
- Neue Begriffe bei gleicher Zahlenvorlage sind kein Nachweis eines neuen fachlichen Transfers.
- Zwei KI-Prüfer dürfen keinen gemeinsamen falschen Lösungsschlüssel als unabhängigen Beweis verwenden.
- Neuladen, Doppelklick, Zeitüberschreitung oder parallele Aufträge dürfen weder Kosten noch Ergebnisse unkontrolliert vervielfachen.

## 1. Was das System lernen soll

Der Lernkreislauf verbessert zuerst gespeicherte Beispiele, Auswahlregeln, Prompts, Rezepte und Prüfprogramme. Ein weiterer KI-Aufruf verändert die Gewichte eines Modells nicht. Modelltraining wäre später ein gesonderter Vergleich auf demselben unbekannten Prüfbestand. Dafür ausschließlich geprüfte Entwicklungsdaten verwenden und aktuelle Anbieterfähigkeit separat prüfen.

Drei Ziele getrennt messen.

| Ziel | Beispiel | Messung |
| --- | --- | --- |
| Inhalt und Rechnung | Drei Drucker brauchen 24 Minuten, acht brauchen neun | Unabhängige Lösung aus dem Sachverhalt, korrekte Einheiten und Annahmen |
| Darstellung und Bewertung | Links geteilt durch drei, rechts mal drei | Builder, Eingabe, alle Antwortvarianten und Teilpunkte |
| Eignung und Transfer | Taxitarif mit Grundgebühr | Passendes anderes Rezept oder begründete Rückfrage |

Das universelle Element ist eine beschriftete Struktur aus Werten, Feldern, Pfeilen, Hilfen und Punktregeln. Jede fachliche Beziehung braucht eigene überprüfbare Bedingungen. Das Produkt bleibt beim umgekehrten Dreisatz konstant, beim direkten das Verhältnis. Eine Satzgliederkette kann dieselben Felder nutzen und braucht sprachliche Regeln. Diese Fachprüfung lässt sich wiederverwenden, sobald sie für eine Aufgabenfamilie qualifiziert wurde.

Einschätzung nach Zuverlässigkeit, Übertragbarkeit und Betriebsaufwand auf 1–10, keine gemessenen Qualitätsquoten.

| Ansatz | Eignung jetzt | Begründung |
| --- | --- | --- |
| Gemeinsamer Baukasten mit qualifizierten Fachrezepten | 9/10 | Wiederverwendbare Darstellung, gezielt prüfbare Beziehungen und kontrollierte Erweiterungen |
| Jede kleine Variante separat anlernen | 6/10 | Gut kontrollierbar, hoher Pflegeaufwand und schwache Wiederverwendung |
| Beliebige Formate direkt von der KI bauen und freigeben lassen | 3/10 | Hoher Ideenraum, wechselnde Bedienung und schwer abzusichernde Bewertungen |

Empfehlung ist der erste Ansatz. Der freie Modus darf im Kreativlabor neue Rezepte vorschlagen. Ein unbekanntes Steuerelement oder eine neue Bewertungslogik erhält vor Einsatz eine eigene Implementierung und Prüfung.

## 2. Testseite aus Sicht der Lehrkraft

Einstieg bleibt **Kreativlabor**. Ergänzung **Dreisatz üben & weiterdenken**.

**Freier Wunsch.** Ein großes Textfeld und der Button **Aufgabe erzeugen**. Beispielsweise „Klasse 7, Prozentrechnung, wenig Hilfe, Zeichen getrennt bewerten“. Optional Fach, Klasse und Hilfestufe. Kein Pflichtklick auf ein Format. Die fertige Aufgabe erscheint zuerst ohne Lösung.

**Gezielte Übung.** Karten für direkten Dreisatz, umgekehrten Dreisatz, Prozentbezug, passende Form erkennen und Transfer auf ein neues Thema. Pro Pfeil wählbare Hilfen bleiben möglich. Eine Serienvorschau zeigt Verteilung, Anzahl, geschätzte Kosten und festes Höchstbudget.

**Automatische Serie.** Voreinstellungen 30, 100 und später 1.000 Aufgaben. Die Zahl bezeichnet gespeicherte Kandidaten, alle internen Erstellungs-, Prüf- und Reparaturaufrufe werden zusätzlich gezählt. Anzeige von Warteschlange, abgeschlossen, verworfen, ungeklärt und Kostenreservierung. Pausieren stoppt neue Aufrufe, laufende Aufrufe werden noch erfasst. Wiederaufnahme setzt dieselbe Serie fort.

**Deine Sichtung.** 🙂 passt, 😐 mit Änderung brauchbar, 🙁 unbrauchbar, Überspringen. Grundchips für Rechnung, unklaren Auftrag, unpassendes Format, Hilfen, Schwierigkeit, Punkte und Bedienung. Optionaler Kommentar oder eigene Lösung. Originalansicht und Vergleich A/B. Modellname und automatische Bewertungen erst nach dem Urteil einblenden.

**Auswertung.** Gute Beispiele, übersehene Fehler, Streitfälle, Zufallsstichprobe und neue Varianten getrennt abrufbar. Jede Aufgabe bleibt direkt anspringbar. „Lösung zeigen“ und „Prüfbericht“ sind bewusste Lehrkraftaktionen. Ein Smiley bestätigt die bewertete Dimension und ersetzt keine vollständige fachliche Prüfung.

## 3. Gezielter Übungsplan für Dreisatz

Jede Serie hat Sollverteilungen. Zufällige Generierung muss diese Felder tatsächlich abdecken.

| Übungsfamilie | Variation | Erwartete Erkenntnis |
| --- | --- | --- |
| Direkt | Menge/Preis, Rezeptmengen, konstante Geschwindigkeit | Verhältnis bleibt konstant |
| Umgekehrt | Drucker/Zeit, Arbeiter/Zeit bei gleicher Leistung | Produkt bleibt konstant, entgegengesetzte Pfeile |
| Prozent | Prozentwert, Grundwert, Prozentsatz | Richtige Bezugsgröße, Prozent und Euro trennen |
| Hilfestufen | Alles gegeben, Zeichen gegeben, Zeichenwahl, freie Operation | Anspruch verändern ohne fachliche Beziehung zu verlieren |
| Offene Felder | Links, rechts, beide Seiten, Zwischenwert, Zeichen und Faktor | Punkte und Aufgabe bleiben konsistent |
| Zahlen | Ganze Zahlen, 0,5, Dezimalkomma, ungünstige Brüche | Rundung und Eingabe ausdrücklich festlegen |
| Rechenweg | Weg über eins vorgegeben oder mehrere Wege erlaubt | Zulässige Alternativen werden korrekt bewertet |
| Gegenfälle | Taxigrundgebühr, Mengenrabatt, fehlende Menge, widersprüchliche Angaben | Anderes Rezept, Rückfrage oder begründeter Verzicht |
| Transfer | Kartenmaßstab, Mischung, Energie bei konstanter Leistung | Passende Fachannahmen ergänzen |
| Falscher Transfer | Grammatik, Ethikbegründung, Deutung einer Quelle | Darstellung wiederverwendbar, mathematisches Gesetz ungeeignet |

Zehn einfach kopierbare Erstwünsche.

1. „Klasse 6. Vier Hefte kosten sechs Euro. Was kosten zehn? Mit vollständigen Hilfen.“
2. „Gleicher Heftpreis. Lass diesmal den Preis einer Einheit und das Ergebnis offen.“
3. „25 Prozent von 400 Euro. Zeichen vorgeben, Faktoren selbst eintragen.“
4. „Welche Prozentzahl sind 30 Euro von 120 Euro? Möglichst wenig Hilfe.“
5. „Drei gleich schnelle Drucker brauchen 24 Minuten. Wie lange brauchen acht? Getrennte Pfeile.“
6. „Gleicher Druckauftrag. Rechenzeichen und Faktoren auf beiden Seiten selbst bestimmen.“
7. „Ein Taxi kostet vier Euro Grundgebühr und zwei Euro je Kilometer. Für sieben Kilometer. Wähle eine passende Darstellung.“
8. „Zwei aufeinanderfolgende Preisnachlässe um zehn Prozent. Prüfe, ob ein einzelner Dreisatz genügt.“
9. „Ein Kartenmaßstab, bei dem Zentimeter in Kilometer umgerechnet werden. Einheiten deutlich.“
10. „Verwende eine Pfeilkette für Satzglieder. Wende dabei die passenden sprachlichen Regeln an.“

Bei Wunsch 8 zwei Schritte oder geeignetes anderes Rezept zulassen. Kein pauschales Ablehnen von Prozentrechnung. Bei Wunsch 10 keinen Dreisatz erzwingen. Zahlenergebnisse in diesen Beispielen bleiben in der Lehrkraftreferenz, der Generator muss sie aus Angaben ableiten.

## 4. Prüfstrecke pro Aufgabe

**A. Formatauswahl.** Freitext in Lernziel, bekannte Daten, gesuchte Daten, nötige Annahmen und Hilfen überführen. Passendes Rezept samt Version auswählen. Fehlende entscheidende Angaben als Rückfrage ausgeben. Für Mess-, Proportionalitäts- und Sprachaufgaben eigene Eignungskriterien.

**B. Unabhängige Fachprüfung.** Ein zweiter Prüfer erhält den sichtbaren Auftrag und bei Bedarf die Grafik, zunächst ohne vorgeschlagenen Lösungsschlüssel und ohne Generatorurteil. Er gibt eigene Lösung, offene Annahmen und konkreten Fehlerbeleg aus. Für Zahlen ein getrennt implementierter Rechner mit exakten Brüchen oder Dezimalarithmetik. Er darf nicht die Lösungsfunktion des Builders als Wahrheitsquelle verwenden. Die Übereinstimmung eines Schlüssels mit sich selbst wäre wertlos. Ob der Text die berechneten Annahmen wirklich trägt, bleibt eine zusätzliche sprachlich-fachliche Prüfung.

**C. Bewertung.** Richtige, falsche, leere und teilweise richtige Antworten, zulässige Zeichenvarianten, Einheiten, Rundung und mehrere Rechenwege prüfen. Die 0,5 Punkte pro eigenständig bewertetem Feld bleiben Ausgangspunkt, die Gesamtpunkte werden abgeleitet. Eine falsche Zeichenauswahl darf korrekt gelöste unabhängige Zahlenfelder nicht pauschal entwerten. Regeln zur Bewertung von Folgefehlern ausdrücklich im Rezept hinterlegen.

**D. Darstellung.** Aufgaben im tatsächlichen Browser erzeugen. Zielgeräte im vereinbarten Scope abdecken. Keine verräterischen Titel, gequetschten Beschriftungen oder Eingaben außerhalb der Grafik. Geänderte Interaktionen ausführlich prüfen. Für unveränderte Bausteine reichen repräsentative Regressionen plus Prüfungen auf Überlauf und Erreichbarkeit bei neuen Inhalten.

**E. Zusätzliche Prüfung nach Reife.** Neue Rezepte und erste Kleinserie mit starkem unabhängigen Prüfer vollständig prüfen. Nach menschlicher Kalibrierung übernimmt ein günstiger Prüfer die Serie. Starker Prüfer erhält alle Widersprüche, neue Kombinationen und eine verdeckte Zufallsstichprobe aus automatisch akzeptierten und verworfenen Aufgaben. Er bekommt die früheren Urteile erst nach seiner Bewertung.

Harte Fehler sperren die Aufgabe unabhängig von einem guten Gesamtmittelwert. Unklare Fälle bleiben sichtbar ungeklärt. Kritische Defekte dürfen nicht durch Kreativitätspunkte ausgeglichen werden. Maximal zwei gezielte Reparaturen pro Kandidat. Danach Fehlergruppe speichern und andere Kandidaten erzeugen. Fehlerquote im Erstversuch und nach Reparatur getrennt berichten.

## 5. Wie tatsächlich gelernt wird

Ein Durchlauf erzeugt unveränderliche Rohdaten und einen Bericht nach Fehlergruppen. Der Verbesserer bekommt repräsentative Entwicklungsfälle mit Fehlerbelegen und bestätigtem Feedback. Er schlägt eine begrenzte Änderung vor, etwa eine präzisere Auswahlregel oder eine bessere Aufgabenanweisung. Exakte Änderung und betroffene Rezeptversion sichern.

Je Vergleich möglichst eine Ursache ändern. Aktuellen Beststand und Kandidaten mit denselben Wünschen, gleichem Modellbudget und vergleichbaren Einstellungen prüfen. Bei Zufallsmodellen ausgewählte Wünsche mehrfach erzeugen. Kosten der Wiederholungen zählen. Bessere Durchschnittsqualität genügt bei einer Verschlechterung kritischer Fälle nicht.

Automatisch erzeugte „gute“ Beispiele sind zunächst Kandidaten. Eine menschlich bestätigte Auswahl wird in den Lernfundus aufgenommen. Ungeprüfte Selbstbestätigung darf keine Musterlösung ersetzen. Schlechte Beispiele bleiben mit Fehlergrund erhalten.

Für neue Serien werden passende freigegebene Beispiele und Fachregeln abgerufen. So wirken Korrekturen dauerhaft. Ein bestätigter Fehler bekommt einen Regressionstest oder einen prüfbaren Gegenfall. Änderungen an Prüfern brauchen eigene Kalibrierung, damit der Generator nicht bloß lernt, einen schwachen Prüfer zu überzeugen.

## 6. Datenaufteilung und Transferexperiment

Entwicklungsdaten dürfen nach jedem Durchlauf genutzt werden. Vergleichsdaten dienen der begrenzten Wahl zwischen Kandidaten. Ein dritter, einmalig verwendeter Abschlussbestand bleibt bis zum eingefrorenen Kandidaten verborgen.

Ganze Kontextfamilien, Zahlenmuster und Paraphrasengruppen gemeinsam aufteilen. Derselbe Taxi- oder Druckerfall mit anderen Namen darf nicht zugleich als Übung und unbekannte Prüfung zählen. Prüfzugriff serverseitig begrenzen, Hinweise aus dem Abschlussbestand nicht in Prompts oder Beispielabruf übernehmen.

Vorgeschlagene Staffeln.

| Stufe | Umfang | Menschliche Beteiligung |
| --- | --- | --- |
| Kalibrierung | 60 Aufgaben, davon 20 direkt, 20 umgekehrt, 10 Prozent, 10 Gegenfälle | 20 gezielt ausgewählte Karten und alle kritischen Streitfälle |
| Verbesserung | 240 weitere Aufgaben, drei Runden zu 80 | Je Runde etwa 10 neue oder strittige Fälle, Regeln bestätigen |
| Größerer Vergleich | 1.200 Aufgaben, 600 Entwicklung, 300 Vergleich, 300 einmaliger Abschluss | 30 geschichtet zufällige Abschlussfälle, zusätzliche Streitfälle |
| Transfer | Optional 200 zusätzliche Aufgaben aus neuen Familien | Je neue Fachfamilie Beispiele und Grenzfälle sichten |

Die 1.500 Aufgaben sind ein vorgeschlagenes Versuchsprogramm. Erneute Erzeugung derselben Wünsche für Modellvergleiche und Reparaturen sind zusätzliche Aufrufe. Nach der Kalibrierung anhand der tatsächlichen Fehler und Kosten über die nächste Staffel entscheiden.

Transfer in drei Armen vergleichen. A kennt nur Dreisatzregeln und bestätigte Beispiele. B erhält zusätzlich eine allgemeine Beschreibung der Felder, Pfeile, Hilfen und Qualitätskriterien. C erhält außerdem wenige fachlich geprüfte Rezepte für die neuen Themen. Alle drei bearbeiten dieselben zurückgehaltenen Wünsche bei gleichem Budget. Zunächst 20 Wünsche je Arm, danach nur bei Aussagekraft erweitern. Themen erst nach Festlegung der Arme zuordnen.

Als Transfer werden neue Rechenbeziehungen, neue Lernhandlungen und neue Fachregeln getrennt gezählt. Prozent, Maßstab und Mengenpreis testen nahen Transfer. Grammatik oder Quellen testen den Transfer der Darstellung und brauchen eigene Lösungen. 200 Aufgaben aus neuen Themen beweisen keine universelle Eignung. Ein positives Ergebnis qualifiziert jeweils die beobachtete Familie.

## 7. Was Martin am Ende sehen soll

Ein kompakter Bericht enthält die Anzahl tatsächlicher Aufträge und Provideraufrufe, abgebrochene Fälle, Kosten und Laufzeit. Dazu Erstversuchsquote, nach Reparatur brauchbare Quote, Quote falscher Freigaben, übersehene und übervorsichtig verworfene Aufgaben, eindeutige Aufgabenfamilien und Ergebnisse je Familie.

Die Endsichtung enthält etwa 30 zufällig ausgewählte Karten aus unterschiedlichen Fällen, 10 besonders gute Entwürfe und bis zu 10 typische Fehler oder Streitfälle. Kategorien kennzeichnen und Überschneidungen vermeiden. Die Zufallsstichprobe darf nicht aus einer Bestenliste stammen. Martins Urteil wird vor dem automatischen Urteil erhoben.

Ein Bericht mit 98 Prozent Erfolg muss Nenner, Fehlerdefinition, Rezeptversion und Auswahl der Fälle nennen. 1.000 Varianten aus fünf Grundaufgaben tragen eine andere Aussage als 1.000 unabhängige Aufträge.

Geplante Freigabekriterien, keine erreichten Werte.

- Keine offenen kritischen Fehler in den Pflichtfällen und vollständige Punkte-/Zugriffs-/Wiederaufnahmetests.
- Mindestens 95 Prozent der ausgewerteten passenden freien Wünsche liefern im Erstversuch die beabsichtigte Form. Gegenfälle separat auf falsches Erzwingen prüfen.
- Keine vom unabhängigen Referenzverfahren festgestellten kritischen falschen Freigaben im eingefrorenen Abschlussbestand.
- Mindestens 27 von 30 zufälligen, nach Familien geschichteten Sichtungsfällen durch die Lehrkraft unmittelbar brauchbar. Jede kritische fachliche Fehlfreigabe stoppt die betroffene Familie.
- Vergleich je Familie gegen den Beststand, ohne kritische Verschlechterung und innerhalb des Budgets.

Das sind Pilotgates für eine begrenzte weitere Testfreigabe. 27 von 30 belegt keine 99-prozentige Unterrichtsqualität. Bei 300 unabhängigen repräsentativen Prüfungen ohne Fehler liegt die einseitige 95-Prozent-Obergrenze für die Fehlerwahrscheinlichkeit bei ungefähr einem Prozent. Das gilt nur für die getestete Fehlerdefinition und Verteilung. Fehlerhafte Prüfer oder eng verwandte Aufgaben verletzen diese Aussagegrundlage. Neue Familien brauchen zusätzliche Evidenz.

## 8. Modelle und Kosten begrenzen

Start mit zwei verfügbaren Kandidaten an denselben 30 Wünschen. Vergleich nach brauchbaren Aufgaben pro ausgegebenem Dollar und Laufzeit einschließlich Nachbesserungen. Für den großen Lauf das günstigste Modell wählen, das die Gates erfüllt. Ein guter Spezialprüfer kann günstiger sein als ein allgemeines starkes Modell.

Konkrete Kandidaten zum Zeitpunkt dieses Plans sind GPT-6 Luna für Entwürfe und kalibrierte Routineprüfungen sowie GPT-6.2 Sol für unabhängige schwierigere Prüfungen. Beides sind zu prüfende Kandidaten. Im vorhandenen Labcode stammt TEXT_MODEL derzeit aus einer gemeinsamen Konstante mit gpt-5.6-luna. Für das Experiment Modellwahl lokal konfigurieren, keine globale Produktionskonstante aus diesem Plan ändern. Die bestehende Produkt-Routinglogik berücksichtigen.

Für Aufträge ohne unmittelbare Antwort passt eine Hintergrundserie. Die offizielle Batch-Dokumentation nennt 50 Prozent niedrigere Kosten gegenüber synchroner Verarbeitung und ein Abschlussfenster von 24 Stunden. Unterstützte Modelle und regionale Anforderungen vor dem Start prüfen. Rabatte nicht mehrfach anrechnen.

Reines Rechenbeispiel auf Basis der am 18.11.2026 dokumentierten Batch-Preise pro Million Tokens. Kein gemessener Verbrauch und keine Vollkostenprognose.

| Vorgang | Angenommene Tokens insgesamt | Verwendeter Preis Input/Output | Rechenwert |
| --- | --- | --- | --- |
| 1.000 Entwürfe mit Luna | 3 Mio. Input, 1 Mio. Output | 0,05 / 0,25 USD | 0,40 USD |
| 1.000 Routineprüfungen mit Luna | 4 Mio. Input, 1 Mio. Output | 0,05 / 0,25 USD | 0,45 USD |
| 100 zusätzliche Prüfungen mit Sol | 0,4 Mio. Input, 0,1 Mio. Output | 1 / 5 USD | 0,90 USD |
| Summe dieser Annahmen | Nur genannte Modellaufrufe | | 1,75 USD |

Tatsächlich abgerechnete Outputtokens einschließlich eventuell abgerechneter Denk-Tokens erfassen. Größere Prompts, starke Prüfer für jede Aufgabe, Gegenprüfungen, Reparaturen, Wiederholungen, Steuern, Region, Datenhaltung und Browserbetrieb erhöhen die Kosten. Vor dem großen Lauf die tatsächlichen Werte aus 30–60 Aufgaben hochrechnen. Das Beispiel rechtfertigt kein Kostenversprechen.

Vorschlag für feste Grenzen pro auszuführender Staffel zunächst 5 USD für den Kalibrierungslauf und 20 USD für eine spätere Großserie. Vor Ausführung explizit als Grenzwerte aufnehmen. Serverseitiger Kostenwächter reserviert vor jedem Aufruf dessen konservative Obergrenze aus Preissnapshot, Tokenlimits und bekannten Nebenkosten. Budgetverbrauch plus alle offenen Reservierungen muss unter dem Limit bleiben. Bei fehlenden Preisen oder unklarem Providerstatus keine erneute kostenpflichtige Dispatch-Schleife starten.

## 9. Daten, die dauerhaft gespeichert werden

Ein Versuch referenziert Freitextwunsch, Lernziel, Familie, Datenaufteilung, Modell-/Prompt-/Rezeptversion, Kontext-Hash, Quellen und Abhängigkeiten. Die ausgegebene Version enthält sichtbaren Auftrag, Darstellung und privaten Schlüssel.

Jede Prüfung erhält Prüferart und Version, eigene Lösung oder Fehlerbeleg, Urteil je Dimension und Zeitpunkt. Feedback speichert genaue Aufgabenversion, bewertete Dimension, Urteil, Kommentar und gegebenenfalls korrigierte Lösung. Kein ungeprüftes Feedback überschreibt bestätigte Regeln.

Ein Lauf speichert Manifest, angeforderte Anzahl, tatsächlich ausgeführte Aufrufe, Tokenverbrauch, Kostenreservierungen und Istkosten, Status und stabile Provider-IDs. Bei Kommunikationsabbruch unbekannten Status erhalten und abgleichen. Verlorene Browserverbindungen sind kein Grund, Provideraufträge blind zu wiederholen.

Fiktive Aufgaben und eigene Muster verwenden. Schülereingaben sind für dieses Training nicht nötig. Vorhandene Rechte- und Feedbackwege nutzen, Aufbewahrung und Löschung im konkreten Datenschema festlegen. Der wissenschaftlich zurückgehaltene Bestand bleibt auch vor Generatorabruf geschützt.

## 10. Umsetzung in überprüfbaren Schritten

Vorgeschlagene neue Dateien liegen zunächst bei tools/remy-mehrfeld30/training/. Vor Beginn Pfade mit dem aktuellen Branch abgleichen. Bestehenden Code nur erweitern, wenn dieselbe Verantwortung bereits dort liegt. Die folgenden Verträge sind geplant.

### Aufgabe 1 · Fallmanifest und unabhängige Fachprüfung

Dateien neu training/cases.cjs, training/oracle.cjs und training/oracle.test.cjs. Bestehenden functions/lib/visual/dreisatz-builder.js wiederverwenden.

Schnittstellen planDreisatz(wishPlan) liefert Rezeptwahl oder Rückfrage. checkRelation(problem) liefert unabhängig berechnete Werte, Invarianten, Einheiten und konkrete Verletzungen. Der problem-Vertrag enthält Beziehung, bekannte Größen, gesuchte Größen, Modellannahmen und erlaubte Rundung.

- [ ] Pflichtfälle für direkte, umgekehrte und Prozentbeziehung sowie sechs fachliche Gegenfälle vor Implementierung festschreiben.
- [ ] Fehlerfälle für Grundgebühr, wechselnde Preise, widersprüchliche Angaben und mehrere erlaubte Rechenwege reproduzieren.
- [ ] Unabhängige Rechnung ohne Builder-Schlüssel implementieren, vorhandenen Builder für Darstellung nutzen.
- [ ] Tests für falsche Schlüssel, Dezimalkomma, getrennte Zeichenpunkte, nicht mit der Aufgabenstellung vereinbare Annahmen und zulässige Alternativen bestehen lassen.
- [ ] Gegen manipulierte Prüferantworten absichern und Zwischenstand mit Fallmanifest sichern.

Abnahme durch node --test tools/remy-mehrfeld30/training/oracle.test.cjs. Alle festgelegten Pflichtfälle müssen erwartete Fehler oder Lösungen melden.

### Aufgabe 2 · Wiederaufnehmbarer Serienlauf mit Budget

Neue Dateien training/runner.cjs, training/store.cjs, training/runner.test.cjs. server.cjs nur für erlaubte Lehrkraftaktionen ergänzen. Bestehendes Auftrags-/Routerverhalten wiederverwenden.

Verträge createRun(manifest, actor) und resumeRun(runId, actor) verwenden stabile Fall- und Versuchsschlüssel. runCase(caseId, version) erzeugt Kandidat und Prüfbelege. Keine vertraulichen Schlüssel im Browser.

- [ ] Tests für Doppelklick, Parallelstart, Abbruch nach Providerannahme, Batch-Teilfehler und verbrauchtes Budget schreiben.
- [ ] Zustand mit ausstehend, läuft, bereit, ungeklärt, verworfen und pausiert konsistent speichern.
- [ ] Reservierung vor kostenpflichtigem Aufruf transaktional durchführen, maximal zwei Reparaturen und keine neuen Starts nach Pause.
- [ ] Wiederaufnahme mit Testanbieter simulieren, alle bisherigen Versionsurteile erhalten.
- [ ] Erst nach diesen Checks genau einen festgelegten echten Kleinlauf zulassen, IDs und Usage zeitnah sichern.

Abnahme durch node --test tools/remy-mehrfeld30/training/runner.test.cjs und einen dokumentierten Durchlauf mit begrenzten echten Kosten. Derselbe runId muss nach Browserreload dieselben Ergebnisse anzeigen.

### Aufgabe 3 · Freier Wunsch und menschliche Kalibrierung

Bestehende index.html, pilot.mjs, pilot.css erweitern. Neues training-view.mjs und training-ui.test.cjs. Bewertungen an bestehende Versionsbindung anbinden.

Verträge startTraining(manifest) und reviewCase(caseVersion, dimension, verdict, reason) nutzen den bestehenden erlaubten Testlehrkraftzugang.

- [ ] Tests für direkten Wunsch, offene Rückfrage, unveränderten Originalentwurf und Versionsbindung schreiben.
- [ ] Serieneinstellungen, Fortschritt, Pause, direkte Navigation, blinde Sichtung und Grundchips umsetzen.
- [ ] Gegenüberstellung von Schüleransicht und bewusst angezeigtem Lehrkraftschlüssel prüfen.
- [ ] Desktop, Tablet und schmales Handy nach Designvorgaben prüfen, bestehende Stapel als Regression erhalten.
- [ ] Die 60er-Kalibrierung starten und 20 Fälle samt Streitfällen gemeinsam beurteilen, bevor große automatische Beurteilung gewertet wird.

Abnahme durch node --test tools/remy-mehrfeld30/training/training-ui.test.cjs, Browserbeleg und getrennten Nachweis menschlicher Sichtung.

### Aufgabe 4 · Versionsvergleich und zurückgehaltener Bestand

Neue Dateien training/compare.cjs, training/compare.test.cjs und manifests für Entwicklung, Vergleich, Abschluss.

compareRuns(bestId, candidateId, manifestId) liefert Quoten, Familienabdeckung, Gegenfälle und Gesamtkosten. createReviewPack(runId) liefert Bestenliste, Fehlerbeispiele und reproduzierbar zufällige Stichprobe.

- [ ] Familienweise Datenaufteilung, Duplikaterkennung und verborgenen Abschlussbestand prüfen.
- [ ] Eine konkrete Verbesserungsregel aus bestätigtem Feedback ableiten und neue Version anlegen.
- [ ] Drei Runden zu 80 Aufgaben innerhalb eines festgelegten Budgets vergleichen.
- [ ] Unberührten Abschlussbestand nur auf eingefrorener Version ausführen. Eine spätere neue Abschlussprüfung benötigt frische Fälle.
- [ ] Ergebnis und offene Fehler sichern, unabhängig von einem positiven Durchschnitt.

Abnahme durch node --test tools/remy-mehrfeld30/training/compare.test.cjs und Bericht mit Rohnennern, Erstversuch/Reparaturen, Familien, Kosten und Auswahlmanifest.

### Aufgabe 5 · Transfer und begrenzte Freigabe

Neue Datei training/transfer-manifest.json. Bericht unter docs/evidence/remy-training-20261118/. Zentrale TODO-/Workstream-Einträge ergänzen.

- [ ] Die Arme A/B/C mit gleicher Budgetgrenze und denselben unbekannten Wünschen anlegen.
- [ ] Zunächst 20 Wünsche je Arm, danach den optionalen 200er-Transfer nur bei klarer Fragestellung ausführen.
- [ ] Abnahme je Beziehung und Fachfamilie dokumentieren. Neue Renderer und Fachregeln erhalten eigene Prüfungen.
- [ ] Rezepte, bestätigte gute/schlechte Beispiele und Regressionen dauerhaft sichern.
- [ ] Nächste Testfreigabe anhand der Gates entscheiden, menschliche Stichproben bei künftigen Versionen fortführen.

## 11. Bewusste Entscheidungen und nächster Schritt

Dieser Plan wählt die Weiterentwicklung des vorhandenen Kreativlabors und einen gemeinsamen Baukasten mit Fachrezepten. Die Zahlen für Serien, Prüfdichte, Budget und Freigabegates sind begründete Startvorschläge. Ein eigener Modelltrainingslauf ist erst zu prüfen, wenn die Aufgabenrezepte stabil sind und auf unbekannten Fällen klar ist, welche Fehler durch Prompting und Beispiele nicht verschwinden. Fine-Tuning würde dann dieselben Prüfgates bekommen und seine Kosten amortisieren müssen.

Nächster ausführbarer Schritt ist Aufgabe 1 mit dem festen Fallmanifest und unabhängigem Rechenprüfer. Danach wird das erste sichtbare Ergebnis eine frei gewünschte Dreisatzaufgabe mit überprüfbarer Bewertung und wiederaufnehmbarem Kleinlauf.

## Quellen

- [OpenAI API-Preise](https://developers.openai.com/api/docs/pricing), am 18.11.2026 geprüft. Genannte Zahlen betreffen Batch-Tarife pro Million Tokens, kein belegter Kontozugang.
- [Batch API](https://developers.openai.com/api/docs/guides/batch), Preisvorteil und Abschlussfenster, am 18.11.2026 geprüft.
- [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices), Evaluierung früh beginnen, automatisierte Urteile mit menschlichem Feedback kalibrieren und unbekannte Fälle prüfen, am 18.11.2026 geprüft.
