# Band 03 - Oberfläche und Bedienabläufe

## 3.1 Gestaltungsauftrag

Die Oberfläche führt über die konkrete Arbeit. Sie darf eine komplexe Firma abbilden, ohne Martin zunächst mit Modellen, technischen Chat-IDs und Logformaten zu konfrontieren. Detailtiefe ist aufklappbar; der Arbeitszustand bleibt sichtbar. Das bestehende V3-Layout und die GradeCrew-Gestaltungsquellen bilden den Ausgangspunkt. Bilder, Diagramme und Kennzahlen dürfen keine erfundene Ausführung suggerieren.

Visuelle Herkunft: Der Firmenordnungsentwurf ist eine eigene Gestaltung aus Martins Brief und vorhandenen GradeCrew-Arbeitsmustern. Er stammt nicht aus einem fremden „Jarvis“-Screenshot. Die aktuelle V3-Ansicht ist eine überprüfte lokale Designprobe mit echten Themen als statischem Snapshot. Sie ist keine Produktdatenbank und kein dauerhafter Chatanschluss.

Vorschlag für das Produkt: ruhige Flächen, gute Typografie, eindeutige Hierarchie, sparsame Statusfarben, ausreichender Kontrast, sichtbare Aktionen am Thema und klare Trennung zwischen erwarteter und nachgewiesener Wirkung. Figuren und Markenillustrationen können Orientierung schaffen, sollen aber keine fachlichen Statuswerte ersetzen. Systemschriften und bestehende Tokens bevorzugen; keine neuen Font-/Assetdownloads als versteckte Voraussetzung.

## 3.2 Navigation FZ-UI-NAV

Die vier Haupteinstiege lauten Heute, Eingang, Arbeit und Wissen. Unter Arbeit liegen Firmennetz, Bereiche, Projekte, Ziele, Themen und der anheftbare Block Aufgabenentwicklung und Qualität. Entscheidungen und Rückfragen erscheinen auf Heute und in ihrer Akte. Analysen werden im fachlichen Kontext geöffnet. Automatisierung, Verbindungen und Verwaltung liegen in der nachgeordneten Einrichtung. Ein Archiv bleibt über Suche erreichbar. Die folgenden Screens sind fachliche Ansichten, keine zusätzlichen gleichrangigen Menüpunkte.

Auf Desktop steht die Navigation links. Auf iPad kann sie eingeklappt werden. Mobil öffnet sie über einen klar bezeichneten Menüknopf; die aktuelle Themenakte bleibt fokussiert. Zwei konkurrierende Seitenleisten für Bereich und Projekt werden vermieden.

Der globale Eingabebereich lautet sinngemäß „Was soll als Nächstes passieren?“. Er übernimmt den aktuellen Kontext, zeigt ihn als veränderbare Chips und bietet Auftrag, Frage, Idee oder Notiz als verständliche Absicht. Eine automatische Klassifizierung darf vorauswählen, aber keine Notiz unbemerkt als Auftrag starten.

## 3.3 S01 - Heute und Geschäftsführung

Die erste Zeile zeigt den Betrachtungsstand: Firma/Projekt, letzte Aktualisierung, aktive Datenquellen und Quellenlücken. Darunter folgen die nächsten benötigten Entscheidungen, kritische Blocker, laufende Ausführungen und das nächste bestätigte Ziel.

Jede Karte enthält Titel, führenden Bereich, Owner, konkrete Lage, Alter, nächste Aktion und Belegstatus. Ein roter Punkt bedeutet beispielsweise „kritische Entscheidung erforderlich“ und hat zusätzlich einen Text. „Keine Daten“ wird optisch von „kein Problem bekannt“ unterschieden.

Eine priorisierte „Nächster sinnvoller Schritt“-Karte nennt Zielbeitrag und Voraussetzung. Der Nutzer kann sie öffnen, beauftragen, vertagen oder begründet anders priorisieren. Die Karte kann keinen unzulässigen Task starten. Nach einer Änderung aktualisieren sich Today-Projektion, Akte und Chefbrief aus demselben Eventstand.

Ein Aktivitätsstrom zeigt relevante Änderungen seit dem letzten Besuch. Neue Nachrichten ohne sachliche Änderung werden nicht als Fortschritt hochgezählt. Der Nutzer kann gesehen markieren, ohne den fachlichen Status zu verändern.

## 3.4 S02 - Firmennetz und Bereiche

Die Netzansicht zeigt die neun Verantwortungsbereiche mit Aufgaben, Zielen und typisierten Verbindungen. Das Netz ist eine Sicht auf dieselben Datensätze. Eine zweite Tabellen-/Listenansicht ist gleichwertig, damit Bedienung nicht vom räumlichen Diagramm abhängt.

Ein Knoten enthält Bereichsname, Auftrag, führenden Owner oder Zuordnungslücke, offene Entscheidungen, kritische Blocker und jüngsten Quellenstand. Ein Klick öffnet den Bereich mit Zielen, Themen, Konzepten und Ergebnissen.

Kanten werden auf Nachfrage erklärt: „Technik liefert Beitrag zu Klassenintegration“ oder „Datenschutzentscheidung blockiert Analyticsaktivierung“. Kanten dürfen kein Fortschrittsgewicht implizieren, sofern sie nicht ausdrücklich aggregierende Zielbeziehungen sind.

Bereichswechsel löscht keinen ungesendeten Text. Der Nutzer erhält entweder getrennte gespeicherte Entwürfe oder einen sichtbaren Wechselhinweis. Ein Entwurf ist noch kein Auftrag. Die UI darf niemals beim bloßen Öffnen eines Bereichs einen Agenten starten.

## 3.5 S03 - Projektübersicht

Ein Projekt zeigt Zweck, Hauptowner, beteiligte Bereiche, aktuelle Zielrevision, Lieferstufen, nächste Meilensteine, zentrale Dokumente und Risiken. Die vier heutigen Übernahmethemen sind erste echte Datensätze; ihre Snapshotgrenze und eventuelle Statuskonflikte bleiben sichtbar.

Eine Aufgabenliste gruppiert optional nach Status, Owner, Ziel oder Frist. Eine Aufgabe erscheint bei mehreren beteiligten Bereichen, führt aber immer dieselbe ID. Ein neuer Kommentar im Technikkontext ist anschließend auch in der gemeinsamen Fallakte vorhanden.

Releasebelege werden als eigene Zeile geführt: Code, CI, integriert, Staging, menschlich getestet, Production. Ein grünes Gesamtprojektlabel aus einem einzelnen Teilbeleg ist unzulässig.

## 3.6 S04 - Ziele und Restarbeit

Die Zielansicht zeigt Zieldefinition, Owner, Abnahmekriterien, gültige Grundlage, belegten Fortschritt, subjektive Einschätzung und Restarbeit. Die Detailansicht erklärt jede Zahl durch ihre Beiträge. Gewichte sind sichtbar und dürfen nur mit berechtigter Scopeentscheidung geändert werden.

Eine Aufklappstruktur zeigt Teilziel, Meilenstein, Aufgabe, Ausführung und Beleg. Unterschiedliche Symbole und Bezeichnungen verhindern Verwechslungen. Ein Task mit Ergebnis kann noch einen offenen Review haben. Sein Zielbeitrag bleibt dann entsprechend offen.

„Ziel ändern“ erzeugt eine neue Fassung. Die UI zeigt vorher die Auswirkung auf wartende und laufende Aufträge. Bereits laufende Vorgänge erhalten einen Revalidierungshinweis; sie werden nicht still neu instruiert. Ein Ziel zu archivieren löscht keine Ausführung oder Budgetgeschichte.

## 3.7 S05 - Themenakte

Die Kopfzeile enthält Titel, Originaltask, führenden Bereich, Owner, Status, Priorität mit Grund, betroffene Ziele und letzte relevante Änderung. Sie zeigt das tatsächliche Host-/Runtimeproblem in verständlicher Sprache, etwa „Versand unbestätigt; Status wird abgeglichen“.

Die Akte bietet fünf inhaltliche Flächen: Überblick, Arbeit/Unteraufgaben, Gespräch, Quellen/Konzepte und Verlauf/Belege. Mobil sind sie als einzelne gut erreichbare Abschnitte verwendbar. Die wichtigste offene Frage bleibt oben angeheftet.

Der Überblick nennt gewünschtes Ergebnis, Kriterien, letzten bestätigten Stand, offene Punkte, nächste Aktion und Nichtumfang. Unteraufgaben haben klare Ergebnisse und Abhängigkeiten. Der Gesprächsbereich zeigt Geschäftsnachrichten, nicht automatisch sämtliche Rohtexte eines fremden Chats. Eine Quellchatreferenz öffnet bei verfügbarer Hostnavigation den richtigen Chat.

Aktionsknöpfe hängen vom Zustand ab. Vor einem Auftrag gibt es keinen scheinbar fertigen Ergebnisbutton. Nach einem Ergebnis gibt es Prüfen, begründet zurückgeben oder annehmen innerhalb eigener Befugnis. Bei unklarem externem Start ist „Erneut starten“ gesperrt; stattdessen gibt es Statusabgleich und Eskalation.

## 3.8 S06 - Auftrag geben

Der Nutzer beginnt mit natürlicher Sprache. Die UI speichert einen Entwurf mit gewähltem Bereich/Projekt/Ziel. Das System extrahiert gewünschtes Ergebnis, Absicht und mögliche Zuständigkeit, ohne neue Fakten zu erfinden.

Vor dem Absenden sind Kontext, erwartete Wirkung und eventuell erforderliche Grenze sichtbar. Im Routinefall genügt eine ausdrückliche Senden-Aktion. Bereits autorisierte Arbeit wird nicht durch wiederholte allgemeine Bestätigungsfragen unterbrochen. Nur eine konkret fehlende Information oder neue Befugnis erzeugt eine gezielte Rückfrage.

Nach Senden zeigt die UI zuerst „Gespeichert“ mit Request-ID. Danach separat „Zur Koordination übergeben“, „Zuständigkeit bestätigt“ und „Facharbeit gestartet“, jeweils nur nach dem entsprechenden Beleg. Ein Host-Promise darf keinen dieser späteren Zustände ersetzen.

Eine Absichtskorrektur nach dem Speichern ändert dieselbe Anfrage nur solange noch kein externer Start möglich war und der Revisionsvertrag dies erlaubt. Sonst entsteht ein Änderungsauftrag mit Bezug auf die laufende Execution. Entwurf, Auftrag und Ergebnis bleiben unterscheidbar.

## 3.9 S07 - Rückfragen und konkrete Freigaben

Eine Rückfrage enthält die konkrete Frage, warum die Antwort gebraucht wird, verfügbare Optionen und die Konsequenz eines Vertagens. Sie gehört zu Task, Request, Execution und zugehöriger Revision. Eine freie Antwort ist möglich.

Eine Aktionsfreigabe zeigt ausführende Rolle, betroffene Quelle/Zielumgebung, exakte Wirkung, Datenklasse, Scope und eventuelle Budgetgrenze. Der Nutzer kann zustimmen, ablehnen oder eine Änderung verlangen. Die gespeicherte Entscheidung ist gegen Doppelklick und fremde/alte Execution geprüft.

Bei offenem Gespräch und gleichzeitig ablaufender Freigabe zählt die serverseitig gültige Version. Ein verspäteter Klick zeigt „Freigabe veraltet“ samt neuem Kontext, erzeugt aber keinen Start. Ein Widerruf zeigt, ob er vor externer Wirkung bestätigt wurde oder ob ein bereits gestarteter Vorgang zunächst abgeglichen werden muss.

## 3.10 S08 - Entscheidungen und Ideen

Die Entscheidungssicht zeigt offene Fragen nach tatsächlichem Handlungsbedarf. Jede Karte bietet die kurze Vorlage aus Band 02. Nach der Entscheidung bleibt sie im Themenverlauf auffindbar.

Ideen enthalten Nutzenhypothese, Quelle, betroffenen Bereich, Status, Grund der Zurückstellung und Wiedervorlagebedingung. Wiedervorlage bedeutet „neu prüfen“, nicht „automatisch umsetzen“. Die Ansicht zeigt verworfene/ersetzte Konzepte nur auf Wunsch, erhält aber die Beziehungen.

Eine neue Idee mit ähnlichem Titel führt zur Dublettenvorlage. Die UI schlägt vorhandene Akten vor und erklärt die Überschneidung. Sie führt Themen nicht ohne berechtigte Entscheidung zusammen.

## 3.11 S09 - Wissen und Quellen

Die Wissensansicht zeigt bestätigte Fakten, Konzepte, Entscheidungen, Quellen, Abdeckungslücken und Konflikte. Suchergebnisse enthalten Gültigkeitsstatus, Autor/Owner, Datum, Quelle und Zugangsklasse.

Eine Suchantwort darf nur berechtigte Inhalte zusammenfassen. Der Nutzer kann die Quelle öffnen, eine Korrektur vorschlagen oder eine Prüfung anfordern. Das Bearbeiten eines Konzepttexts legt eine neue Fassung an; abgeleitete Arbeitsbriefe behalten ihre bisherige Bindung.

Quellenlisten zeigen getrennt „erreichbar“, „gelesen“, „teilweise abgedeckt“, „unzugänglich“ und „veraltet“. Ein nicht abrufbarer großer Chatturn wird nicht als leere oder vollständig ausgewertete Quelle behandelt.

## 3.12 S10 - Analyse und Qualität

Diese Sicht konsumiert vorhandene, freigegebene Analytics-/BugOps-Verträge. Sie baut keinen zweiten Tracker. Kennzahlen zeigen Definition, Zeitraum, Umgebung, Abdeckung, letzte Aktualisierung und Messgrenzen.

Eine Kennzahl kann eine Untersuchung vorschlagen. Sie ändert keine Produktpriorität oder keinen Goalstatus allein. Ein fehlender Opt-in-/Zweck-/Datenvertragsbeleg bleibt ein Integrationsblocker des betreffenden Datenfeeds.

Qualitätskarten zeigen angenommene Ergebnisse, offene Reviews, Regressionen und Retestbedarf. Eine alte Abnahme wird bei relevantem Kandidatenwechsel nicht unverändert weiterverwendet.

## 3.13 S11 - Automatisierung und Verbindungen

Automatisierungen zeigen Zweck, Owner, Auslöser, zulässigen Scope, Datenquellen, Ausführungsort, letzte Runs, nächste geplante Prüfung, Budget, Stopregel und Benachrichtigung. Aktivieren, pausieren und laufende Ausführung abbrechen sind getrennte Aktionen.

Eine Verbindung zeigt tatsächlichen Status, angemeldete Rolle in datensparsamer Form, erlaubte Fähigkeiten, Ablauf/Widerruf und bekannte Hostgrenzen. Geheimnisse werden nicht angezeigt. Setup wird gesammelt dort erklärt, statt die alltägliche Auftragseingabe mit technischen Kontoentscheidungen zu überladen.

Die UI unterscheidet Browserprototyp, eingebettete MCP-App und Standalone-App. Ein Featuretest prüft vorhandene Hostfähigkeiten. Bei fehlendem Host sagt die Oberfläche „Hier noch nicht verbunden“ und speichert gegebenenfalls einen Entwurf; sie simuliert keinen Versand.

## 3.14 S12 - Verwaltung, Verlauf und Recovery

Die Verwaltung zeigt Routingkonfiguration, Rollenprofile, Datenquellen, Migrationen, Backups und Wiederherstellungsstatus nur für Berechtigte. Eine kritische Konfigurationsänderung enthält Auswirkung und Gültigkeitsbeginn.

Im Recoverymodus steht eine klare Sperrbotschaft: welche Scopes gesperrt sind, was bereits abgeglichen ist und welche Belege fehlen. Persönliche oder widerrufene Inhalte werden vor der Anzeige gefiltert. „Backup erfolgreich“ wird von „Wiederherstellung geprüft“ unterschieden.

Der Verlauf lässt sich nach Task/Request/Execution filtern. Er zeigt Geschäftsevents und technische Belege, aber keine privaten Modellgedanken, Credentialwerte oder unnötigen Rohdaten.

## 3.15 Gemeinsame Interaktionsregeln

Alle langen Listen sind paginiert. Filter sind als persönliche Präferenz speicherbar, verändern keine Geschäftsobjekte. Suche bleibt bei geöffneten Akten erhalten. Stabile Objektlinks benötigen keine Geheimnisse in URL-Parametern.

Formulare haben verständliche Fehlermeldungen am betroffenen Feld. Text wird als Text gerendert, nicht als ausführbares HTML. Lange Titel, Unicode, Leerwerte, mehrzeilige Inhalte und sehr schmale Displays gehören zur Abnahme.

Bei Verbindungsabbruch wird der noch nicht bestätigte Zustand sichtbar gehalten. Ein erneutes Laden fragt den vorhandenen Request ab. Die Request-ID bleibt gleich; ein neuer Browser-Tab erzeugt keinen neuen fachlichen Auftrag für denselben bewusst wiederaufgenommenen Request.

Tastaturfokus ist sichtbar, Dialoge geben Fokus korrekt zurück, Statuswechsel werden für assistive Technik angekündigt und Farbe ist nie der einzige Bedeutungsträger. Für V1 werden konkrete Tastatur-/Screenreaderabläufe geprüft; vorhandene Screenshots sind kein vollständiger Barrierefreiheitsnachweis.

## 3.16 Menschlicher Bediennachweis

Martin erhält zehn typische Aufgaben und arbeitet ohne technische Anleitung: Lage erfassen; blockiertes Ziel finden; Bereich öffnen; Auftrag formulieren; Rückfrage beantworten; Priorität begründen; Ergebnis prüfen; alte Entscheidung finden; veralteten Quellenstand erkennen; nach Neustart fortsetzen.

Für jeden Durchlauf werden Fehlverständnisse, benötigte Hilfen, tatsächliche Ergebnisse und offene Entscheidungen festgehalten. Eine hohe technische Testquote ersetzt diesen Nachweis nicht. Die Oberflächenabnahme bezieht sich auf den konkreten verbundenen Kandidaten, nicht nur auf die lokale V3-Probe.

## 3.17 S13 - Aufgabenentwicklung und Qualität

S13 zeigt Bestand, Kandidaten, bestätigte Fehler, fehlende Prüfungen und freigegebene Einsatzbereiche aus Band 17. Format, Item, Arbeitsauftrag und Prüffall sind verständlich benannt. Qualitätsfarbe wird immer mit Fassung, Modus und Begründung angezeigt. Test- und Lieferstufe bleiben getrennt; ein Klick öffnet die gemeinsame Akte mit nächster Aktion und Belegen. Manuelles Umschalten auf Grün ist nicht vorgesehen.

## 3.18 S14 - Zentraler Eingang

S14 zeigt die in Band 18 beschriebenen Meldungen aus tatsächlich angeschlossenen Kanälen. Neu/unzugeordnet, wartet und überfällig sind Filter. Zuordnung, Aufteilung und Dublettenverknüpfung erhalten die Originalnachricht. Ein führender Owner hält den Fall bis zur geprüften Lösung und Kommunikation zusammen. Ein ausgefallener Kanal zeigt eine Abdeckungslücke statt „keine neuen Anfragen“.

## 3.19 S15 - Antwort und Fallabschluss

Diese Ansicht liegt innerhalb der Akte. Sie verbindet Kundenanliegen, fachliche Beiträge, freigegebenen Antwortentwurf, tatsächlich bestätigten Versand und Abschlussregel. Interne Lösung, verschickte Antwort und bestätigte Zustellung werden getrennt benannt. Unklarer Versand sperrt eine Wiederholung bis zum Abgleich. Neue relevante Rückmeldung kann den Fall wieder öffnen.
