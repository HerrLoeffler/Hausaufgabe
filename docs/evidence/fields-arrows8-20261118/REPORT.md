# Felder und Pfeile · acht echte KI-Wünsche

GC-EXTENDED-QUESTION-TYPES-01 · 18.11.2026 · bestehender Runtime-Draft-PR 419 und Dokumentations-Draft-PR 418. Nur der bestehende isolierte Testkanal und seine eine Testfunktion wurden aktualisiert.

[Testlabor öffnen](https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/). Das vorhandene freigeschaltete Testkonto verwenden. Vorschau bis 18.12.2026 verlängert.

## Bedienung

Ein sichtbarer KI-Eingang: „Was soll deine Klasse üben?“ Wunsch tippen oder über „Wunsch sprechen“ diktieren, danach „Mit KI erstellen“. „8 Beispiele ausprobieren“ öffnet die gemischte Serie. Frühere Versuche sind eingeklappt und weiterhin erreichbar; ihre Daten und laufenden gespeicherten Aufträge bleiben erhalten.

Unter einer Aufgabe gibt es Grün, Rot und eine freiwillige Notiz. „Notiz sprechen“ startet bewusst das Browserdiktat; Grün oder Rot beendet das Diktat, speichert Urteil und erkannten Text zur exakten Aufgabenfassung und wechselt weiter. Es muss kein Grundmenü ausgefüllt werden. Bei fehlender Browserunterstützung oder Mikrofonfreigabe bleibt Tippen möglich. Das Browserdiktat kann einen Sprachdienst des Browseranbieters verwenden. GradeCrew legt dafür keine Audioaufnahme ab.

## Tatsächliches Ergebnis

| Wunsch | Erzeugte Darstellung | Ergebnis |
| --- | --- | --- |
| 15 % von 240 € | Direkter Dreisatz, unabhängige Rechenpfeile | 36 €; passend nach technischer Korrektur |
| 3 Drucker, 24 Minuten; 8 gleich schnelle Drucker | Umgekehrter Dreisatz bei gleicher Arbeitsmenge | 9 Minuten |
| Taxi: 4 € Grundpreis, 2 €/km, 7 km | Zwei Felder als Rechenkette | 14 € variabler Preis, 18 € gesamt; kein Dreisatz |
| Englisch: play, go, see → Simple Past | Drei eigene Umformungswege | played, went, saw |
| Biologie: vereinfachter Reflexbogen | Gerichteter Ablauf mit zwei Auswahlfeldern | sensorischer und motorischer Nerv |
| Deutsch: drei Behauptungen mit Begründungen | Gerichtete Zuordnung zweier Gruppen | Drei unabhängig bestätigte Paare |
| Wunsch ohne beteiligte Inhalte oder Lernziel | Eine konkrete Rückfrage | Keine erfundene Schüleraufgabe, keine Punkte |
| Persönliche Erörterung mit individuellen Gründen | Begründete Empfehlung einer offenen Schreibaufgabe | Kein starrer Lösungsschlüssel, keine Punkte |

Alle acht gespeicherten Fälle sind am Ende ready. Das sind sechs benotbare Aufgaben und zwei richtige Reaktionen auf unpassende/unvollständige Wünsche. Die erste Serie hatte 4/8 erfolgreiche Erstversuche; alle vier waren Fachaufgaben. Die spätere Freigabe ist keine 100-%-Ersterfolgsquote. Acht Wünsche belegen keine allgemeine Zuverlässigkeitsrate oder Unterrichtsfreigabe.

Zusätzlich entstand über das wirkliche sichtbare Wunschfeld eine neue Englischaufgabe zu eat/write/run. Eigenständig geprüft, im Browser mit ate/wrote/ran beantwortet und mit 1,5/1,5 Punkten bewertet. Kein vorbereiteter Austausch dieser drei Inhalte.

## Aufbau und Prüfung

Ein versionierter Vertrag verwendet dieselben geprüften Bauteile für Dreisatz, Ketten, mehrere Umformungswege, Verzweigung und eindeutige Zuordnungen. Die KI liefert Fachinhalt und Beziehung. Das Programm baut Eingaben, Pfeile und Punkte. Unterstützter Pilotumfang: 1–4 Pfade, 1–8 offene Felder bzw. 2–3 gerichtete Zuordnungspaare. Ein manueller Verschiebeeditor ist nicht Bestandteil dieses Auftrags.

Dreisatz erfordert konstantes Verhältnis oder konstantes Produkt mit passenden Voraussetzungen. Grundgebühren, Verbformen und biologische Abläufe erhalten ihre eigene fachliche Beziehung. Neue Formen außerhalb des unterstützten Vertrags werden nicht als beliebiger ausführbarer KI-Code übernommen.

Ein unabhängiger rationaler Rechenprüfer berechnet numerische Antworten. Ein getrenntes Modell sieht ausschließlich den öffentlichen Auftrag und die tatsächlich gezeichneten Felder/Pfeile, löst selbst und prüft Lernziel, Eindeutigkeit und verratene Lösungen. Ein solcher Modellcheck ist keine mathematische Garantie für beliebige sprachliche oder fachliche Inhalte. Englische und biologische Aufgaben bleiben experimentell und brauchen menschliche Stichproben.

Neutrale öffentliche Feld-IDs verhindern, dass eine modellgewählte interne Kennung die Antwort verrät. Lösungsschlüssel bleiben serverseitig. Jede benotbare Aufgabe wird außerdem mit voller und leerer Abgabe geprüft. Gesperrte Fälle erscheinen nicht als freigegebene Aufgabe.

## Gefundene und behobene Fehler

Die unabhängige Codeprüfung meldete sechs wichtige Befunde. Behoben wurden Antwortlecks über Kennungen und vorweggenommene Auswahlklassen, Dezimalkomma-Bewertung, ein bei zweimaligem Stoppen wartender Diktatvorgang, die falsche Auswahl alter Lehrerhinweise, auseinanderlaufende Feedback-/Lernspeichertransaktionen und eine sachfremde Neuprüfungsbegründung. Die relevanten Laufzeitfehler wurden reproduziert und mit Regressionen behoben; die Quellenbegründung wurde ohne bezahlten Neuprüfungsaufruf gesichtet.

Die echten KI-Versuche fanden weitere Ursachen: Der Prozentwunsch wurde als unpassende serielle Zerlegung angeordnet; die vorgegebene Zwischenzahl 1 wurde zugleich als Antwort verlangt; eine Rückfrage enthielt mehrere Teilfragen; eine passende Empfehlung scheiterte technisch an einer leeren Überschrift. Die feste Zwischenzahl ist jetzt wirklich gegeben und zählt nicht als Antwortpunkt. Auswahlregeln und einzelne Rückfrage wurden präzisiert; Mitteilungen bekommen nötigenfalls eine neutrale Überschrift. Nachbesserungen erhalten die konkrete Prüferbegründung.

Vier gesperrte Fälle bekamen nach diesen Korrekturen je eine ausdrücklich commitgebundene Wiederherstellung. Das ist eine dokumentierte Ausnahme zur ursprünglichen Grenze von drei Versuchen, ausschließlich für diese synthetische Achterserie, maximal vier Versuche und innerhalb desselben 1-USD-Budgets. Private Lehrkraftwünsche behalten ihre bisherigen Grenzen. Bereits bestandene Fälle wurden nicht erneut erzeugt.

Der letzte Prozententwurf enthielt richtige Größen und Zahlen, aber nur zwei Pfeilmodi. Ein geprüfter Adapter erweitert diese kompakte direkte Zwei-Spalten-Angabe auf die vier tatsächlichen Pfeile und erzeugt die passende Bedienanweisung aus denselben Zahlen. Derselbe gespeicherte Inhalt wurde nochmals unabhängig geprüft; kein fünfter Generatorversuch. Alle ursprünglichen Entwürfe, Urteile und Kosten bleiben erhalten.

Offener kleiner Skriptbefund: Das manuelle Serienschript liefert nach endgültigen fachlichen Ablehnungen weiterhin Exitcode 0. Die Abnahme benutzt deshalb ausdrücklich den gespeicherten Fallstatus und prüft alle acht Fälle auf ready; es gibt keine automatische Freigabe aus diesem Exitcode.

## Speicher und Wiederverwendung

Firebase-Projekt gradecrew-staging-2026, Firestore (default), STANDARD, Region eur3. Keine eigene neue Datenbank und kein neues Modelltraining.

- taskLearningRecipes/fields-arrows-20261118-v1: Voraussetzungen, Grenzen, Hilfen und Bewertungsvertrag.
- taskLearningRuns/fields-arrows8-20261118-v1: acht Fälle mit allen Versuchen, Schlüsseln, Prüfungen, Neuprüfungen, commitgebundenen Wiederherstellungen und Providerbelegen.
- taskLearningExamples: geprüfte Beispiele und Lehrkrafturteile mit Wunsch, Beziehung, vollständiger Struktur und Aufgabenversionshash.
- taskLearningTeacherMemory/{uid}/examples: eigene aktuelle Rückmeldungen, nach Zeit begrenzt geladen und nach Wunschähnlichkeit priorisiert. Der nächste passende Auftrag nutzt bis zu sechs dieser Beispiele.
- taskLearningQuotas: bestehende begrenzte Erzeugungsbudgets. Eigene neue Wünsche bleiben privat; andere Lehrkräfte können für den gemeinsamen Stapel keine bezahlten Schritte auslösen.

Urteil, sichtbarer Bewertungsstand und Lernbeispiel werden für Trainingsaufgaben atomar gespeichert. Wiederholung eines alten Ereignisses überschreibt kein neueres Urteil. Rückmeldungen sind an Eigentümer, Rezeptversion und genaue Aufgabenfassung gebunden. Die aktuelle Fassung ist ein experimenteller Pilot; seine Fehlversuche dürfen bei späteren Erfolgsraten nicht verschwinden.

Im echten Nachweis wurde ein ausdrücklich synthetischer grüner Englischhinweis samt Struktur beim darauffolgenden echten freien Englischwunsch wieder abgerufen. Ein roter Biologiehinweis wurde ebenfalls gespeichert. Das sind technische Feedbacktests, keine menschlichen Lehrkraftfreigaben. Direkter Clientzugriff auf Lauf, Rezept und Lehrkraftspeicher wurde jeweils mit 403 abgewiesen.

## Nachweise und Kosten

- 63/63 lokale Prüfungen bestanden, einschließlich bisheriger Aufgabensätze und Wiederaufnahmeverhalten.
- Sechs Fachaufgaben serverseitig und im Browser vollständig ausgewertet. Volllösung, leere Antwort und ein falsches Feld/fehlendes Paar ergaben die jeweils erwarteten Teilpunkte. Zwei Mitteilungen lehnen Benotung ab.
- Vorhandener 60er-Dreisatzstapel bleibt mit 60 Aufgaben lesbar. Die früheren Daten wurden nicht ersetzt.
- Angemeldeter Chromium-Browser bei 1280, 820 und 360 Pixeln: kein Seitenüberlauf, alle geprüften Eingaben erreichbar, ein sichtbarer KI-Eingang, Altbereiche eingeklappt.
- Grün/Rot und simulierte Spracheingaben zur richtigen Fassung gespeichert; späte Spracheingaben verändern die nächste Aufgabe nicht. Echtes Mikrofon/Browser-Sprachdienst und physisches Touchgerät noch nicht geprüft.
- 14 Hostingdateien bytegenau verifiziert. Eine eigene Testfunktion aktualisiert; 97 andere Funktionseinträge tiefenverglichen unverändert. Kein kanonischer Hosting-, Rules-, Assessment- oder Productiondeploy.
- Achterserie: 35 Provideraufrufe (20 Erzeugungen, 15 Prüfungen), berechnet 0,060509 USD. Zusätzlicher freier Englischwunsch: 2 Aufrufe, 0,004339 USD. Insgesamt 37, 48.591 Eingabetokens, 11.069 Ausgabetokens, 0,064848 USD, keine offene Kostenreservierung.
- Tatsächlich protokollierte Modelle: gpt-6-luna für Erzeugung, gpt-6.2-sol für unabhängige Prüfung. Kosten sind Tokenverbrauch mal gespeicherter Preisstand, ohne Infrastruktur und Steuern.

Backendquelle lokal 4e4fb18f512135dde993f435762197c112f5334c, entsprechender Remote-Quellencommit b586c4d1193598d6013019ebd5174a6347f0e64c. Veröffentlichte Funktionskennung b1d739bbe368d8c8e0bfd6645be1979d47d05d0a. Frontend aus 3ec48e2, danach nur Backend-/Prüfskriptänderungen; dieselben 14 Dateien stimmen mit dem abschließenden Build überein.

Belege: [Status](status.json), [unabhängige Urteile](audit.json), [Server](server-verification.json), [Browser](browser-verification.json), [Feedback und Abruf](feedback-verification.json), [freier Wunsch](free-english.json), [Kosten](usage.json), [Bereitstellung](deployment.json), [Entscheidungen und Historie](PROGRESS.md).

Nächster Schritt: Martin bewertet einige gemischte eigene Wünsche mit Grün/Rot und einer kurzen Notiz. Diese menschlichen Urteile werden gegen die bisherigen Prüfergebnisse ausgewertet. Eine normale Testintegration, breitere Formatfamilien und eine Unterrichtsfreigabe bleiben getrennte nächste Schritte. Dieser Auftrag schaltet nichts auf Production frei.
