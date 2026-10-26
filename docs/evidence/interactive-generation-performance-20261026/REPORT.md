# Automatische Aufgabenrezepte: Umsetzung und echte Tests

**Stand: 26. Oktober 2026. Task GC-EXTENDED-QUESTION-TYPES-01.** Die technische Umsetzung ist auf der normalen Testseite bereitgestellt. Production wurde nicht verändert. Die Lehrkraft- und Geräteabnahme steht noch aus.

## Was jetzt funktioniert

Die normale Erstellung wählt passende Aufgabenrezepte aus Fach, Thema und Lernzielen. Einzelne Formate müssen dafür nicht pro Aufgabe angeklickt werden. Mehrere ausdrücklich genannte Lernziele behalten eigene passende Aufgabenplätze. Ausdrückliche Formateinschränkungen gelten weiterhin. Bei Medienaufträgen, reinen Materialaufträgen und bestehenden Varianten bleibt die bisherige Strecke erhalten.

Neun Rezeptprofile liegen im vorhandenen Aufgabenregister. Sie beschreiben passende Lernhandlungen, benötigte Angaben, Gegenfälle und unterstützte Bausteine. Die KI erzeugt neue Inhalte und Ausgangswerte. Beim Dreisatz berechnet der geprüfte gemeinsame Baustein daraus die Werte, vier unabhängige Rechenpfeile, Hilfen und Bewertung. Die KI muss keine vollständige Tabelle mit 30 Zellen mehr entwerfen. Direkte und umgekehrte Proportionalität sind getrennte Rezepte.

Neue oder unbekannte interaktive Aufgaben erhalten zusätzlich zur Struktur- und Fachprüfung einen unabhängigen Lösungsversuch. Dieser bekommt ausschließlich die öffentliche Aufgabe, keine Musterlösung. Die gespeicherte Bewertung muss seine fachlich richtige Antwort anerkennen. Ungelöste visuelle Fehler verhindern einen fertigen Test. Beide KI-Prüfungen verwenden getrennte Kontexte beim vorhandenen OpenAI-Anbieter; eine Claude-Anbindung wurde nicht eingerichtet oder behauptet.

## Tatsächlich gemessene Erstellung

| Test | Bisherige Messung | Neue Messung | Ergebnis |
|---|---:|---:|---|
| 6 fächerübergreifende Aufgaben, 15 Punkte | kein vergleichbarer Lauf | 1:14 Minuten | Fertig: F3FT79B2 |
| 20 Aufgaben, 60 Punkte | 6:18 Minuten | 3:46 Minuten | Fertig: 8TJ5PRHW, rund 40 % kürzer |
| 40 Aufgaben, 100 Punkte, Versuch A | 14:05 Minuten | etwa 6:17 Minuten | Fachlich gestoppt; kein erfolgreicher Zeitvergleich |
| 40 Aufgaben, 100 Punkte, Bestätigung B | 14:05 Minuten | 5:42 Minuten | Fertig: VBNYCHVQ, rund 60 % kürzer |

Der Sechsertest wurde ohne Einzel-Formatklick aus sechs Lernzielen erstellt: direkter Dreisatz, umgekehrter Dreisatz, Pflanzenbeschriftung, Koordinaten, Rasteranteil und Satzgliedverbindungen.

Die 20er-/40er-Aufträge verwenden dieselben fachlichen Eingaben und Punktesummen wie die gespeicherten Baselines. Die automatische Rezeptauswahl erzeugte hier ausschließlich Dreisatzvarianten; die alten Vergleichstests enthielten mehrere visuelle Formate. Es ist deshalb kein formatkonstantes Modellbenchmark und jeweils nur ein erfolgreicher Lauf. Die 20er-Messung gehört zum ersten bereitgestellten Stand, der 40er-Bestätigungslauf zum anschließenden Spaltenfix.

## Der gefundene Fehler wurde nicht versteckt

Im ersten 40er-Lauf hatte die KI bei einer Ersatzaufgabe die Spalten für Menge und Prozent vertauscht. Die Fachprüfung und der unabhängige Lösungsversuch erkannten den Widerspruch zwischen den Überschriften und den Zahlen 100/900. Der Test wurde korrekt blockiert; es entstand kein fertiger fehlerhafter Test.

Der Prozentadapter ordnet eine eindeutig erkannte Prozentspalte jetzt dem fest definierten Prozentweg zu und lehnt fehlende oder doppelte Prozentachsen ab. Er erfindet keine Mengeneinheit. Zwei Regressionen reproduzieren Vertauschung und Mehrdeutigkeit. Genau ein neuer 40er-Bestätigungslauf wurde nach diesem konkreten Codefix gestartet und bestanden. Der fehlgeschlagene Auftrag und seine Kosten bleiben dokumentiert.

| Lauf | Abgeschlossene Providerantworten | Ersatzversuche | Fachprüfungen | Blinde Lösungsprüfungen | Tokens insgesamt |
|---|---:|---:|---:|---:|---:|
| 6 Aufgaben | 9 | 4 | 2 | 2 | 63.576 |
| 20 Aufgaben | 26 | 17 | 4 | 4 | 330.506 |
| 40 Aufgaben, gestoppt | 47 | 35 | 4 | 4 | 712.221 |
| 40 Aufgaben, Bestätigung | 35 | 25 | 3 | 3 | 536.847 |
| **Gesamt** | **117** | **81** | **13** | **13** | **1.643.150** |

Vier logische Erstellungsaufträge, drei fertig und einer fachlich gestoppt. Keine zusätzlichen Einzelaufgaben-KI-Aufträge. Die früheren Baselines mit 62 Providerantworten und zwei UI-Typwechseln bleiben separate historische Belege. Providerantworten sind keine exakt gezählten HTTP-Versuche: interne Transportwiederholungen können darin enthalten sein. Preise sind unbekannt. Beim 20er liegen die Tokens trotz kürzerer Dauer über der bisherigen Baseline; eine allgemeine Kostenersparnis wird nicht behauptet.

## Aufgaben und Bewertung geprüft

Alle 66 fertigen Aufgaben wurden zusätzlich offline geprüft: 570 Kontrollen, darunter 62 Dreisatzaufgaben mit unabhängig nachgerechneten Verhältnissen, Produkten und Pfeilen. Richtige und leere Antworten sowie ausdrückliche Halbpunktangaben stimmen. Die 37 historischen Dreisatzaufgaben aus den früheren 60 Aufgaben behalten Aufbau und Bewertung; beim Vergleich werden neue Zellkennungen positionsbasiert zugeordnet. Gespeicherte Altaufgaben wurden nicht verändert.

Acht echte Prüfungsserverfälle sind bestanden:

| Fall | Sechsertest | Vierzigertest |
|---|---:|---:|
| Alles richtig | 15/15 | 100/100 |
| Ein falsches Rechenzeichen | 14,5/15 | 99,5/100 |
| Ein falsches Zahlenfeld | 14,5/15 | 99,5/100 |
| Leer | 0/15 | 0/100 |

Für jeden Fall: öffentliche Aufgaben ohne Lösungsschlüssel, unveränderte Wiederaufnahme und identischer Beleg bei doppelter Abgabe. Keine Abgaben realer Lernender wurden verändert.

Im Browser wurden beide Dreisätze bedient, die Antworten nach Neuladen wiederhergestellt und zwischen Aufgaben gewechselt. Die eigene Teilabgabe erreichte die native JavaScript-Bestätigung; die Browser-Steuerungsbrücke konnte diesen Dialog nicht auflösen. Dafür wird kein Browser-Abgabebeleg behauptet. Die acht separaten Serverbelege gelten unabhängig davon.

## Dauerhaftes Lernen mit belegten Erfolgen

Rezeptversionen umfassen Register, Konstruktion und Bewertungs-/Prüfvertrag. Auch beobachtete Fehlversuche werden gespeichert. Lehrerfeedback zählt nur über den vorhandenen fachlichen Freigabeweg und eine serverseitig bestätigte unveränderte Aufgabe. Freigegebenes negatives Feedback bleibt ein Veto; unbekannte Konstruktionen übernehmen keine Erfolgsnachweise anderer Motive.

Der zusätzliche blinde Lösungsversuch wird erst auf eine deterministische 10-%-Stichprobe reduziert, wenn dieselbe Version mindestens 400 Versuche, eine untere 95-%-Wilson-Grenze von mindestens 99 %, 20 bestätigte unterschiedliche Aufgaben von mindestens drei Lehrkräften und keinen bestätigten Fehler aufweist. Struktur- und Fachprüfung bleiben erhalten. Neue Versionen und unbekannte Konstruktionen starten streng. **Diese Freigaberegel ist keine bereits gemessene 99-%-Erfolgsquote.** Martins bisherige 99-/20-%-Angaben bleiben Einschätzungen.

## Bereitstellung und Nachweise

- [PR334](https://github.com/HerrLoeffler/Hausaufgabe/pull/334): automatische Rezepte, kompakter Baustein und zusätzliche Qualitätskontrolle; integriert als ecb82da.
- [PR336](https://github.com/HerrLoeffler/Hausaufgabe/pull/336): Prozentspaltenfix; integriert und bereitgestellt als 5e45e9df2449ca7e4c4b735ae754452a6f304ab7. Aktuelle Rezeptversion: b76dd6ea6094d0f0.
- 365 Backend-/UIprüfungen, 136 Assessmentprüfungen, ESLint und exakte GitHub-Prüfungen bestanden. Ein unabhängiger Schlussreview fand vier weitere konkrete Lücken, jeweils mit Regression behoben.
- Zuerst sechs normale KI-/Feedback-Funktionen, anschließend ausschließlich drei betroffene KI-Funktionen aktualisiert. Beim letzten Deploy: 80 Funktionen vorher/nachher, 77 andere Quellhashes unverändert, keine Anlage oder Löschung.
- Kein Hosting-, Rules-, Assessment- oder Productiondeploy. Der bestehende Klassenraumablauf blieb erhalten. Zwei zwischenzeitliche Lerngehirn-Updates anderer Arbeiten sind in der ersten Bestandsbilanz separat vermerkt.

[Rohbelege und Prüfskripte](https://github.com/HerrLoeffler/Hausaufgabe/tree/9ff13e40cb6ac7016a6b8ef61058d4ca947ba6bf/docs/evidence/interactive-generation-performance-20261026) enthalten sämtliche Aufträge einschließlich Fehlversuch, Nutzungsdaten, Deployvergleiche, Prüfungsserverfälle und Browserbild. Keine Zugangsdaten oder Attempttokens sind dort gespeichert.

## Was noch offen ist

Das Halbierungsziel ist im 40er-Bestätigungslauf erreicht, beim 20er nicht. Die geplanten höchstens 4/8 Ersatzversuche sind mit 17/25 weiterhin verfehlt. P1 bleibt deshalb: Fehlerursachen feiner zuordnen und gezielte Ersatzanfragen verringern, ohne die Prüfungen zu entfernen.

Diese neue Pilotserie prüft Klasse 7 und technische Erstellung/Bewertung. Vollständige Lehrplanabdeckung für Klassen 5–10, fachliche Lehrerabnahme und physische Touchgeräte sind damit nicht bestätigt. Freie Rechnungen akzeptieren hinterlegte Operationen mit Schreibvarianten; ein Nachweis sämtlicher denkbarer alternativer Rechenstrategien ist das nicht. Die größere frühere Pilotserie bleibt ein gesonderter Beleg.

Nächster Schritt: Martin prüft mit seinem Lehrkraftkonto einen eigenen fachlichen Durchlauf; für Mittwoch können die vorbereiteten Tests verwendet werden. Danach die verbleibenden Reparaturen und Kosten gezielt weiter reduzieren.

[Testseite zur KI-Erstellung](https://gradecrew-staging-2026.web.app/workspace.html?intent=login) · [Sechs fächerübergreifende Beispiele](https://gradecrew-staging-2026.web.app/secure-student.html?test=F3FT79B2) · [Vierzigertest](https://gradecrew-staging-2026.web.app/secure-student.html?test=VBNYCHVQ)
