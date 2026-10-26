# Automatische Aufgabenrezepte und Erstellungsdauer

Task GC-EXTENDED-QUESTION-TYPES-01 ·26.10.2026. Nurgradecrew-staging-2026, bestehende Anbindung. Benutzerfreigabe für neue Inhalte, automatische passende Auswahl, schnellere Erstellung und zusätzliche Prüfungen bei neuen/unsicheren Formaten. Production nicht verändert.

## Stand

Implementierung PR334→ecb82da0129f2e22dc2bd8d739b152d8704dd9e3.363Backend-/UIprüfungen,136Assessmentprüfungen,ESLint und drei GitHubprüfungen grün. Ein unabhängiger Schlussreview; vier konkrete Fehler mit Regressionen behoben. Alle37historischen Dreisatzaufgaben aus60Altaufgaben offline semantisch und bei der Bewertung erhalten. Neue Zell-IDs werden bei diesem Vergleich positionsbasiert zugeordnet; gespeicherte Altaufgaben bleiben unverändert.

Sechs normale KI-/Feedback-Funktionen selektiv bereitgestellt. Beide überprüften tatsächlichen Ausgangsquellen generateTest/reviewMode stimmten mit4fe überein.80Funktionen vorher/nachher, keine Anlage/Löschung;72Hashes unverändert,6eigene Änderungen und2gleichzeitig extern geänderte Lerngehirn-Funktionen. Letztere waren kein Deployziel dieses Auftrags. Kein Hosting-/Rules-/Assessment-/Productiondeploy. Beobachtetes Hosting5be513d6/230Dateien stammt aus einer anderen Arbeit; es wurde nicht überschrieben.

## Funktionsweise

Neun versionierte Rezeptprofile im bestehenden Register. Fach/Thema/Lernziel, ausdrückliche Ausschlüsse und unterstützte Darstellungen bestimmen die Kandidaten. Mehrere explizite Lernziele behalten eigene passende Slots. Klassische Aufgaben bleiben bei fehlendem Rezept auf der bisherigen Strecke. Der Dreisatz verwendet kleine semantische Daten statt30freier Tabellenzellen; das Programm berechnet Rechenweg, Vorgaben, Pfeile und Bewertung. Direkte und umgekehrte Proportionalität sind getrennte Rezepte. Die Rezeptversion umfasst Register, Konstruktion und Bewertungs-/Prüfvertrag.

Neue/unbekannte Konstruktionen erhalten eine zusätzliche unabhängige Lösung nur aus der öffentlichen Aufgabe. Die bestehende Fachprüfung sieht weiterhin den Lösungsschlüssel. Beide Prüfungen können nebeneinander laufen; unveränderte öffentliche/private Aufgaben werden im selben Job nicht erneut blind gelöst. Ein ungelöster visueller Mangel blockiert den fertigen Test. Gleicher konfigurierter OpenAI-Anbieter, getrennte Kontexte; keine behaupteteClaudeanbindung.

Erfolgsevidenz enthält auch beobachtete Fehlversuche, wird bei Jobende idempotent gespeichert und ist rezept-/versionsgebunden. Lehrerfeedback muss serverseitig zur unveränderten Aufgabe attestiert und im bestehenden Verfahren fachlich freigegeben sein. Freigegebenes schlechtes Feedback bleibt ein Veto. Weniger Zusatzprüfungen erst bei>=400Versuchen,unterer95%-Wilson-Grenze>=99%,20bestätigten unterschiedlichenAufgaben/3Lehrkräften,keinerbestätigtenFehlbewertungderselbenVersion. Ungeplante Konstruktionen bleiben streng. Diese Regel ist keine bereits gemessene Erfolgsquote.

## Echte KI-Läufe

|Umfang|Vorher|Neue Fassung|Status|
|---|---:|---:|---|
|6fächerübergreifende Aufgaben/15Punkte|kein vergleichbarer Lauf|74Sekunden|fertig,F3FT79B2|
|20Aufgaben/60Punkte|378Sekunden|226Sekunden|fertig,8TJ5PRHW;40%kürzer|
|40Aufgaben/100Punkte,VersuchA|845Sekunden|ca.377Sekunden|fachlichgestoppt,keinErfolg|

Die6erSerie wurde ohne Einzel-Formatklick aus6unterschiedlichen Lernzielen erzeugt: direkterDreisatz,umgekehrterDreisatz,Pflanzenteile,Koordinaten,Rasteranteil,Satzgliedverbindungen.9abgeschlosseneProviderantworten:1Erstellung,4gezielteErsetzungen,2Fachprüfungen,2blindeLösungsprüfungen.63.576Gesamttokens.10unterschiedlicheEntwürfe über6fertigeAufgaben. Keine Qualität durch Abschalten von Prüfungen erkauft. Die Aufgaben wurden zusätzlich auf korrekte Zahl-/Operationswerte und erreichbare öffentliche Darstellung geprüft.

Die20/40Aufträge verwenden dieselben fachlichen Eingaben und Punkte wie die gespeicherten Baselines. Automatische Rezepte können eine andere Formatverteilung liefern; es ist kein isoliertes Modellbenchmark und nur jeein Lauf. Providerantworten sind keine exakt gezähltenHTTPversuche; interneSDKtransportwiederholungen können darin enthalten sein. Neue Antworten werden mit Dauer und Phase protokolliert, ohne Anfragetexte in Telemetrie zu kopieren.

## Bewertung auf dem echten Prüfungsserver

Eigener6erTestF3FT79B2 veröffentlicht, Lösungen verborgen. Vier echte Fälle: korrekt15/15,ein falschesRechenzeichen14,5/15,ein falschesZahlenfeld14,5/15,leer0/15. Für jeden Fall Wiederaufnahme unverändert, öffentliches Papier lösungsfrei und doppelteAbgabe mit identischemBeleg bestätigt. Keine Bewertung fremder/realer Lernender verändert.

## Grenzen und nächster Schritt

20erVergleich abgeschlossen:40%kürzer,Halbierungsziel nicht erreicht.40erVersuchA wegen vertauschter Prozent-/Mengenspalte gestoppt. KonkreteBuilderkorrektur mitRegressionen(365Prüfungen)inPR336;genauein neuer40erBestätigungslaufB vorgesehen. Erster40erVersuch35Reparaturen/47Providerantworten/4Fach-und4Blindprüfungen/712.221Tokens bleibtFehlschlag.20er17Reparaturen/26Antworten/4Fach-und4Blindprüfungen/330.506Tokens. Trotz kürzerer Dauer bislang keineKostenersparnis:20erTokens liegen über der273.897-Token-Baseline. BrowserzeigtbeidebedienbarenDreisätze,2/6bearbeitetnachNeuladenunverändert,AufgabenwechselohneNeustart. EigeneBrowserteilabgabeliefinJavaScriptbestätigung;SteuerungsbrückekonnteDialognichtauflösen,keinUIabgabebelegbehauptet. DievierseparatenServerbelegegeltenunverändert. Keine gemessene99%-Zuverlässigkeit, keine fachübergreifendeLernwirksamkeit oder echteTouch-/Lehrerabnahme behauptet. Quellen mit unbekannten Grafiken werden nicht durch erfundene festePflanzenregionen ersetzt. Die strenge Prüfung kann weiterhin Nachbesserungen und Wartezeit verursachen. Budget:3ersteErstellungsaufträge(6/20/40)undgenauein40erBestätigungslaufBnacheinemkonkretenBuilderfix,zusätzlich höchstens2gezielteEinzelaufgabenanfragen bei konkretemFehler; bis hier keine zusätzlichenEinzelaufgabenanfragen. Bisherige62internenProviderantworten und2UItypwechsel bleiben historischeEvidenz und werden nicht erneut gezählt.
