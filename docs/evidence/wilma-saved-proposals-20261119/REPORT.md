# Wilma: gespeicherte Vorschläge und wirksamer erster Klick

GC-PEDAGOGY-KB-01 / GC-WEB-REPAIR-20261007 ·19.11.2026 · ausführender Webchat, bestehendePR438. Martins Teilabnahme: „Layout technisch ist es gut aktuell“. **Layout ausdrücklich angenommen; keine neue Gestaltung.** Die Funktionszuverlässigkeit war damit nicht abgenommen.

## Beobachtete Ursache statt Vermutung

Aktuellen main, Development Status44480076022, PR438 und tatsächliche Livequelle4fe3baf / revision00007-viz / Hosting7214fd4140dbc950 lesend abgeglichen. Die spätere CI ist gesondert in `ci.json` gebunden; die tatsächliche Veröffentlichungsstufe steht ausschließlich in `receipt.json` und den Hostingbelegen.

Im bereits gemeldeten Test zeigte die alte offene Ansicht drei Vorschläge und eine fehlende Bewertung. Die passende Serveroperation war inzwischen auch für diese fehlende Antwort completed, settled und Versuch1. Der normale kostenlose Statusabruf ließ sie sofort als0/1,5 erscheinen. Quelle/Antwort, Operation, Budget und Bewertung blieben exakt gleich; Zähler115, Usage129482MikroEUR, Reserve0. Kein neuer Providerstart und keine Notenänderung. Der zuvor automatisch abgelehnte reale Erststart wurde nicht wiederholt; die zwischenzeitlichen externen Aufrufe werden nicht unserem Test zugerechnet. Private IDs, Namen, Antworttexte und Rohbelege bleiben außerhalb des Repos. `comparison.json` enthält nur die begrenzte Einordnung.

Die vermutete Zwei-Identitäten-Grenze erklärt diesen Livefall nicht: Live verwendet serverBudgeted=true und das Servermonatsbudget. Stage behält sein Sitzungslimit. Im konkreten Vergleich kein Providerfehler und keine offene Reservierung; andere Fehlerursachen werden nicht pauschal ausgeschlossen.

Martins präziser Folgehinweis: „Für diese Antwort fehlt noch der KI Vorschlag“ und Klick auf „KI-Vorschlag erstellen“ tue nichts. Dafür wurden zwei konkrete Gegenfälle mit echten UI-/Scheduler-Modulen reproduziert: Der Klick zeigte zuerst weiterhin RowstatusOffen; bei einer anderen laufenden Antwort war der Knopf global deaktiviert.

## Enge Änderung

- Beim Zurückkehren zur sichtbaren geöffneten Aufgabe werden fehlende gespeicherte Belege kostenfrei aktualisiert. Focus/Visibility werden zusammengefasst, höchstens einmal pro30Sekunden. Keine Schleife und kein neuer Providerauftrag. Aktive Eingabe, gewechselte Aufgabe, versteckte Seite, Konto-/Test-/Quellenwechsel werden vor jedem neuen Read erneut geprüft, auch nach dem Warten.
- Der erste Knopf zeigt sofort Laden oder Warteschlange. Genau die angeforderte Antwort wird nach dem aktuellen Request bevorzugt. Derselbe Klick ist entprellt; andere alte Antworten werden dadurch nicht automatisch bezahlt nachbewertet.
- **Cache vor Kosten:** Ein erster Klick prüft immer zuerst mit allowPaid=false auf gespeicherte Belege. Nur ein sicherer never-started/cachemiss darf danach zum normalen einzelnen Erststart führen. Inflight, ungültige Belege und frühere Fehler werden nicht heimlich wiederholt. Bei voller Stage-Sitzungsgrenze bleiben kostenlose Belege verfügbar; ein neuer Start meldet sichtbar das Testkontingent.
- Beendete/abgebrochene alte Klickaufträge blockieren keine neue Ergebnisansicht. Ein generationsgebundener Marker setzt nur einen tatsächlich neu angeforderten Ergebniskontext nach Busy fort; ein gewöhnlicher Saved-only-Abruf startet keine kostenpflichtige Folgequeue.
- Eingabeschutz: Während Punkte/Text bearbeitet werden, startet der Hintergrundabgleich nicht. Ein bereits laufend ankommender Saved-only-Beleg darf den Zustand ergänzen, ohne die Eingabe neu zu zeichnen oder eine Note zu bestätigen. Bestehende Kostenstopps werden durch Cachehits nicht gelöscht.

Anordnung, CSS, Aufgabenschrift, native App und Serverfunktionen bleiben bytegleich zum angenommenen Stand. Keine neue Account-/Datenhaltung, keine Rules und keine Functions veröffentlicht. Drei Web-Runtimedateien und Release-Manifest bilden den Hostingumfang.

## Überprüfung und Historie

Quelle `0ad0e2f350ceb98c97c5d4f4362bf5b77db69de1`, Tree `6612b704e6989b9f844c0867036a2ac9edb22499`.52 gezielte Scheduler-/Host-/UI-Klicktests und867 Root-/UI-Prüfungen bestanden.16 Chromium-/WebKit-Fälle auf390/820/1280px führen Rückkehr und tatsächlichen Knopf – auch bei laufender anderer Antwort – bis zum gespeicherten Ergebnis. Kein Provider und keine Notenbestätigung.48 separate bestehende Media-Browserprüfungen nach korrekter Frame-Synchronisierung bestanden. `browser.json` enthält die einzelnen Fälle. Die fünf früheren bezahlten semantischen Stage-Proben wurden nicht wiederholt.

Unabhängige Source- und Hostinghelperreview ohne verbleibenden P0–P2. Die Historie bleibt erhalten: P2 zum Editing-/Visibilityguard nach Wait und P2 zur Queuefortsetzung nach clear zuerst reproduziert, gezielt rot/grün behoben. Frühere303/1d67/db744/626-Läufe bleiben ihren Quellen zugeordnet. **CI44518921131 auf626 war rot und wurde nicht veröffentlicht:** fehlende echte Importbindungen in einer Bootstrap-VM sowie WebKit-Viewportmessung vor dem fertigen Frame. Testbindungen ergänzt und Screenshot nach demselben Readinesswait statt davor; keine Assertion entfernt oder gelockert. Produktdateien des letzten Testfixturecommits sind bytegleich zum unabhängig geprüften626-Stand.

## Dateierhalt und Releasegrenzen

Die Stage-Baseline hat parallele Classroom-Änderungen (Hosting4916e09a92376424). Ein unveröffentlichter Fullpackage-Vorversuch konnte deren Python-gzip-Hash nicht identisch reproduzieren. Er wurde nicht veröffentlicht. Der sichere Patch klont daher die tatsächliche Firebase-Version und ändert nur die vier eigenen Blobhashes. Alle anderen Pfade/Blobhashes, Hostingheader und `/api/classroom/**`-Rewrite bleiben exakt erhalten. Snapshot: Stage667 Pfade, davon663 unverändert; Live219 Pfade, davon215 unverändert. Das schließt Hostinginitdateien ein; die separate öffentliche Manifestprüfung umfasst216 Dateien je Origin. Functions vor/nach werden frisch verglichen; Stage00012-pez und Live00007-viz bleiben bestehen.

Exakte erfolgreiche CI und unabhängige Freigabe sind vor Finalize/Release zwingend. Der CI-Beleg muss authentifiziert und endlich datiert sein, höchstens5Minuten alt und nicht mehr als5Sekunden in der Zukunft. Unklare Clone-/Release-Starts werden nicht blind wiederholt. Production verlangt zuerst eine erfolgreiche kostenfreie Stage-Abnahme derselben Quelle. Kanonischer Stage-Root und fremde Classroom-/Native-Arbeit erhalten; keine Runtime-main-Integration behauptet.

## Offene Grenzen

Kein allgemeiner Beweis für jede ausbleibende KI-Antwort und keine universelle Bewertungsquote. Weitere konkrete Provider-/Kontext-/Budgetfehler anhand ihres tatsächlichen Grunds prüfen. Martins Layoutabnahme gilt für die aktuelle Oberfläche; eine neue vollständige physische Handy-/iPad-/Secure-Abnahme ist hier nicht behauptet. Der frühere automatische Übermittlungsblock bleibt für neue echte Antworten bindend; diese Reparatur übermittelt keine neue Antwort an OpenAI.

Nächster Schritt nach belegter Veröffentlichung: Martin prüft den konkreten ersten Knopf im Alltag. Bei weiterhin fehlendem Ergebnis den tatsächlichen angezeigten Status und vorhandenen Job vergleichen, keine Klasse pauschal neu starten.


## Veröffentlichung der gespeicherten Vorschläge ·19.11.2026

Quelle `0ad0e2f350ceb98c97c5d4f4362bf5b77db69de1`, Tree `6612b704e6989b9f844c0867036a2ac9edb22499`, bestehendePR438. [ExakteCI44519867699](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/44519867699) vollständig erfolgreich einschließlich Browser-/Tutorialreisen. Enger Source-/HelperreviewPASS, ursprünglicheP2 und rote626-CI nicht umgedeutet. Die bereits angenommene Gestaltung/CSS undalleFunctions bleiben erhalten.

Stage `/wilma/`: `sites/gradecrew-staging-2026/versions/af43a68480f2363f`; Live: `sites/hausaufgabe-staging/versions/3b894c3e2bcba8b4`. Vorherige parallele Classroom-Dateien, alle anderen Blobhashes und Header/Rewriteconfig exakt erhalten. Alle101Stage-/62LiveFunctions vor/nach unverändert (tatsächliche Counts im jeweiligenProof maßgeblich), reviewWilmaAnswers bleibt00012-pez/00007-viz.216/216öffentliche Dateihashes auf jeder geprüftenAdresse, keineAbweichung. Bestehende fiktive Belege in der tatsächlichen Oberfläche kostenlos nachgeladen;0zusätzlicheProviderstarts/0Notenwrites. DreiRuntime-Dateien plusManifest, keine neueKI-Qualitätsprobe und kein weiterer nativerBuild. Main enthält Nachweise, keine behauptete Runtime-main-Integration.

[Abschlussbericht](REPORT.md) / [Receipt](receipt.json). Martins ausdrückliche Layoutabnahme ist gesichert. NächsterSchritt: konkretenKnopf imAlltag verifizieren; weitereFehler mit tatsächlichemGrund prüfen, keinealteKlasse pauschalneu starten. NeueechteSchülerübermittlungweiterohneUmgehung derfrüherenAblehnung. PhysischeGeräteabnahmegetrennt. AlleDeploymentaktionenabgeschlossen; keineoffeneProviderreservierungdiesesTests.
