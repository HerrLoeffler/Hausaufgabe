# Band 02 - Führungsübersicht, Ziele und Entscheidungen

## 2.1 Die Fragen, die die Zentrale beantworten muss

Die Startansicht beantwortet in kurzer Form: Was ist unser wichtigstes Ziel? Was hat sich seit meinem letzten Besuch geändert? Wo braucht jemand meine Entscheidung? Welche Arbeit ist wirklich gestartet? Welche Aufgabe ist blockiert und warum? Welche Zusage oder Frist ist gefährdet? Welcher Schritt bringt uns dem nächsten bestätigten Ergebnis näher?

Jede Antwort enthält ihren betrachteten Umfang, den Quellenstand und den konkreten nächsten Schritt. Wenn keine belastbare Quelle vorliegt, wird das gesagt. Ein Chefbrief darf kurze Schlussfolgerungen formulieren, aber Fakten, Annahmen, Vorschläge und Entscheidungen nicht vermischen.

Ein Besuch zeigt zunächst den Gesamtüberblick. Ein Klick auf eine Aussage öffnet die zugrunde liegende Akte, danach deren Quellen. Die Geschäftsführung muss weder Protokolldateien durchsuchen noch aus mehreren Chatantworten einen Status zusammensetzen.

## 2.2 Drei Zeithorizonte

Heute: Entscheidungen, dringende Blocker, erwartete Ergebnisse, bestätigte Fristen und laufende Arbeit. Die Ansicht hebt nur echte Veränderungen und Handlungsbedarf hervor.

Nächster Meilenstein: vereinbarte Lieferziele, Abhängigkeiten, verantwortliche Beiträge und Kriterien bis zur nächsten prüfbaren Teilabnahme. Die Zentrale zeigt, welche nächste Aktion den kritischen Pfad verkürzt.

Strategie: längerfristige Ziele, bewusst zurückgestellte Optionen, wirtschaftliche/organisatorische Risiken und Voraussetzungen. Diese Sicht erzeugt keinen täglichen Alarm für jede offene Idee.

Alle Horizonte verwenden dieselben Objekt-IDs. Eine Aufgabe wandert zwischen Ansichten, wird aber nicht kopiert. Ein Monatsbericht ist ein datierter Snapshot der gemeinsamen Daten und kann später gegen Änderungen nachvollzogen werden.

## 2.3 Chefbrief-Vertrag FZ-LEAD-01

Der Brief enthält maximal sieben Hauptaussagen als vorgeschlagenes Standardformat. Bei außergewöhnlichen Vorfällen dürfen zusätzliche Punkte erscheinen; sie werden begründet priorisiert.

Jede Aussage enthält: kurze Lage, Zustand gegenüber dem letzten gelesenen Stand, betroffene Ziele/Tasks, Belegreferenzen und deren Frische, unmittelbare Auswirkung, zuständigen Owner, Vorschlag und benötigte Entscheidung. Reine Informationspunkte werden von Handlungsaufforderungen getrennt.

Die Erstellung liest zuerst die autorisierte Projektion. Ein Sprachmodell darf danach verdichten und begründen. Vor Anzeige wird jede faktische Aussage auf eine vorhandene Quellreferenz oder auf einen ausdrücklich markierten Unsicherheitsstatus geprüft. Ein unbelegter Schluss wird entfernt oder als Hypothese dargestellt. Ein fehlender Analyticsfeed führt nicht zu erfundenen Nutzungszahlen.

Der Brief speichert sourceRevisionSet, generatedAt, policyVersion, visibleTo, modelRequested, modelObserved und usageState. Ein Modellwechsel ändert keine Objektstände. Wenn die Quellen sich während der Erstellung ändern, bleibt der Brief ein datierter Snapshot und erhält einen Aktualisierungshinweis.

## 2.4 Zielstruktur FZ-GOAL-01

Ein Ziel beschreibt eine Wirkung, einen verantwortlichen Owner und überprüfbare Abschlusskriterien. Es enthält Titel, Nutzen, betrachteten Scope, Zielhorizont, Ausgangslage, Ergebnismaß, Pflichtkriterien, Abhängigkeiten, Beitrag zu übergeordneten Zielen und bestätigte Nichtziele.

Ein Meilenstein beschreibt einen prüfbaren Zwischenzustand. Ein Task beschreibt konkrete Arbeit. Eine Execution beschreibt einen Ausführungsversuch. Ein Artefakt ist ein Ergebnisobjekt. Ein Beleg zeigt, ob ein Kriterium erfüllt ist. Diese Begriffe bleiben im Datenmodell getrennt.

Beispiel: Ziel „Firmenzentrale-V1 im Alltag nutzbar“. Pflichtkriterien sind persistente Akten, echter Fachdispatch, Rückfrage/Fortsetzung, belegter Fortschritt, Wiederaufnahme und Martins Produktdurchlauf. Das Schreiben dieses Plans erfüllt einen Planungsmeilenstein. Es erfüllt nicht den Fachdispatch oder die Produktabnahme.

Ein Ziel kann Unterziele haben, aber nur einen aggregierenden Parent. Zusätzliche Beziehungen wie unterstützt, blockiert, ersetzt oder verwendet sind typisierte Querverweise ohne automatisches Fortschrittsgewicht.

## 2.5 Nachgewiesener Fortschritt FZ-PROGRESS-01

Ein Ziel verwendet entweder eigene gewichtete Meilensteine oder gewichtete direkte Unterziele. Der Modus wird in der Zielrevision gespeichert. Beide Modi gleichzeitig werden abgewiesen.

Für Meilensteine gilt: angenommenes Kriterium = 1, nicht angenommen = 0. Fortschritt ist die gewichtete Summe angenommener Meilensteine geteilt durch die Summe gültiger Gewichte. Für Teilziele werden ausschließlich deren belegte Ratios auf ihrer jeweiligen gültigen Grundlage verwendet. Bei zwei gleich gewichteten Teilzielen mit 50 Prozent und 0 Prozent ergibt sich 25 Prozent.

Gewichte sind positiv, endlich und an die Parentrevision gebunden. Leere Basis, ungültige Gewichte oder ein erforderliches Unterziel ohne tragfähige Grundlage ergeben keinen Prozentwert. Die Oberfläche zeigt „Noch keine belastbare Basis“ und benennt das fehlende Element. Sie darf daraus weder null Prozent erledigt noch hundert Prozent Erfolg ableiten.

Rundung erfolgt ausschließlich für die Anzeige. Liegt die echte Ratio unter 1 oder ist ein Pflichtgate offen, zeigt eine ganzzahlige Anzeige höchstens 99 Prozent. „Erreicht“ braucht erfüllte Pflichtkriterien, gültige Belege und die erforderliche Ownerabnahme.

Eigene Fortschrittseinschätzung steht in einem separaten Feld mit Autor, Datum und Begründung. Sie dient der Orientierung bei unsicherer Arbeit und beeinflusst die belegte Berechnung nicht.

## 2.6 Scopeänderung und Belegentzug

Eine Scopeänderung schreibt eine neue Ziel-/Kriterienrevision mit Grund und Entscheidung. Die alte Basis bleibt historisch lesbar. Eine neue Funktion, die erst später zum Ziel hinzukommt, darf den früheren Stand erklären, aber nicht dessen ursprüngliche Abnahme rückwirkend verändern.

Wird ein Beleg widerrufen, technisch widerlegt oder durch eine Regression ungültig, werden alle abhängigen Zielprojektionen invalidiert. Die Nutzeransicht zeigt „Beleg zurückgezogen“ mit Auswirkung. Sie setzt nicht still einen niedrigeren Prozentstand, ohne den Grund sichtbar zu machen.

Ein Ergebnis gegen Revision R1 wird nicht automatisch auf Revision R2 angerechnet. Wiederverwendung ist nur nach expliziter Prüfung der neuen Kriterien und dokumentierter Zuordnung zulässig. Ausführungs-, Versuchs- und Budgetgeschichte des alten Ergebnisses bleibt unverändert.

## 2.7 Priorisierung FZ-PRIO-01

Vorschlag für die V1-Reihenfolge: zuerst konkrete Sicherheits-/Datenverlust-/Betriebsrisiken innerhalb ihres betroffenen Scopes; danach bestätigte Fristen und blockierende Abhängigkeiten; danach strategisch hochwirksame Arbeit; danach Optimierung und Ideen. Bestehende strengere Release-/Guardian-Gates gehen vor.

Eine Priorität besteht aus Klasse, Begründung, entscheidendem Beleg, Auswirkung, Frist, betroffenen Nutzern/Organisationen in zulässiger Aggregation, Abhängigkeit und verantwortlicher Entscheidung. Die Klasse allein genügt nicht.

Eine gewichtete Scorezahl kann später bei großen Portfolios helfen. In V1 wird keine Scheingenauigkeit aus frei geratenen „Impact 8, Effort 3“-Werten erzeugt. Bei Verwendung eines Scores werden Eingaben, Gewichte, Quelle und Regelversion sichtbar. Ein menschlicher Override braucht Grund und Gültigkeitszeitraum.

Aufgabenpriorität und Incident-Schweregrad werden nicht gleichgesetzt. Ein P0-Incident kann eine sofortige Diagnose priorisieren, aber er schaltet keine Production-Reparatur frei. Ein betriebswichtiger Vertrag kann hohe Priorität haben, obwohl er kein Softwarefehler ist.

## 2.8 Entscheidungsakte FZ-DEC-01

Jede wesentliche Entscheidung enthält: konkrete Frage; Entscheider; Frist und Folge des Nichtentscheidens; Optionen; gemeinsame Bewertungskriterien; bestätigte Fakten; Annahmen; Risiken; betroffene Ziele/Tasks; Empfehlung; Gültigkeits-/Wiedervorlagebedingung; tatsächliche Entscheidung und Grund.

Der Brief zeigt die bevorzugte Option zuerst. Vergleichszahlen von 1 bis 10 werden nur bei tragfähiger Grundlage verwendet und mit Gründen belegt. Ein gutes technisches Eignungsrating bedeutet keine Rechte-, Kosten- oder Produktfreigabe.

Die Entscheidung kann bestätigt, abgelehnt, vertagt oder zur weiteren Untersuchung zurückgegeben werden. Vertagung braucht eine Wiedervorlagebedingung oder ein Datum. Eine nicht beantwortete Frage wird nicht nach einer Wartezeit als Zustimmung behandelt.

Ein Beispiel ist der Runtimeweg: vorhandener Host zuerst qualifizieren; falls ein konkreter benötigter Port fehlt, App Server oder ein anderer offizieller Weg mit denselben Kriterien vergleichen. Kosten, Datenfluss, Betrieb bei ausgeschaltetem Mac, Wiederaufnahme und vorhandene Rechte sind die Kriterien. Die Wahl wird erst nach P0-Fakten geschlossen.

## 2.9 Entscheidungsbefugnisse

Unverbindliche Einordnung, Recherche und die Vorbereitung eines Vorschlags können innerhalb eines bestehenden Auftrags delegiert werden. Routineausführung ist nur zulässig, wenn Scope, Budget, Datenzugriff und Entscheidungsspielraum bereits ausdrücklich geregelt sind.

Wirtschaftliche Verpflichtungen, neue Anbieter/Konten, Kundennachrichten, Vertragsannahmen, Änderungen von Zugriffsrechten und Production benötigen die tatsächlich zuständige Autorisierung. Diese Befugnisse werden als Policy/Grant gespeichert, nicht aus freiem Text durch das ausführende Modell abgeleitet.

Ein Grant enthält grantId, issuer, actorRole, taskId oder begrenzten Scope, erlaubte Aktionen, Datenklassen, Budgetobergrenze, Laufzeit, Widerrufsstand und Policyversion. Er ist keine Geheimnisablage. Bei einer konkreten Freigabe bindet zusätzlich ein Approval die exakten Aktionsargumente und deren Hash.

## 2.10 Rhythmus der Unternehmensführung

Tägliche Sicht auf eigene Entscheidungen und kritische Blocker; wöchentliche Sicht auf Zielbeiträge, kommende Fristen und Ressourcenkonflikte; monatliche Sicht auf bestätigte Kosten, Risiken und Zuständigkeiten; anlassbezogene Strategieprüfung bei wesentlichen Änderungen. Diese Kadenzen sind Planvorschläge und keine eingerichteten Termine.

Jede Besprechung erzeugt eine kurze Ergebnisakte mit entschiedenen Punkten, offenen Fragen, Ownern und nächsten Schritten. Das komplette Transkript wird nicht zur Pflichtlektüre jedes Fachauftrags. Relevante, bestätigte Beschlüsse werden in den Wissenskern überführt und mit dem Besprechungsbeleg verknüpft.

Eine Führungssitzung ist erfolgreich, wenn relevante Entscheidungen getroffen oder gezielte Informationsaufträge vergeben wurden. Die Zentrale zählt weder Nachrichten noch erledigte Kleinaufgaben als Unternehmensleistung.

## 2.11 Ressourcen und WIP

V1 startet konservativ mit begrenzter Parallelität und einem expliziten aktiven Writer pro gemeinsamem Dateiscope. Die P0-Grenze von einem Worker/höchstens zwei Modellturns ist ein einmaliger Testscope. Eine spätere produktive Parallelität wird separat festgelegt.

Die Ressourcenansicht zeigt laufende Arbeit, wartende Aufgaben, begrenzende Rechte/Budgets und gemeinsame Datei-/APIkonflikte. Ein zusätzlicher KI-Chat kann einen Engpass verstärken, wenn dieselbe Migration oder dieselbe Entscheidung benötigt wird.

Bei Überlast empfiehlt die Zentrale eine Reihenfolge und zeigt den Preis der Verschiebung. Eine Deadline wird nur mit bestätigtem Owner, verfügbarer Kapazität und erledigten Voraussetzungen als belastbar markiert. Sonst ist sie Wunsch oder Schätzung.

## 2.12 Abnahme dieses Führungsmodells

Ein Testnutzer erhält fünf Situationen: kritischer Fehler, unvollständige Vertragsprüfung, neues Produktkonzept, veralteter Releasebeleg und blockierte Abhängigkeit. Er muss erkennen, was Fakt ist, was er entscheiden soll, wer zuständig ist und welcher nächste Schritt folgt.

Der Test besteht nicht allein bei einer optisch guten Startseite. Jede Hauptaussage muss zur richtigen Akte und Quelle führen. Nach einer Zieländerung und einem Belegentzug müssen Chefbrief, Zielansicht und Heute dieselbe neue Grundlage zeigen. Diese Fälle sind Pflichtbestandteil der späteren Produktabnahme.

