# Gemeinsam leichter lernen
## GradeCrew Lernspiele · Produkt, Bedienung, Didaktik und Umsetzung

**Vocab Rush · Fast Quiz Mathematik · Fehlerjagd Deutsch · Wissensreise**

**GC-GAMES-LEARNING-UX-01 · 15. Oktober 2026 · Vollständiger Vorschlag zur Prüfung**

Dieses Planbuch ist der Entwurf für eine gemeinsame nächste Lernspielgeneration. Es beschreibt verständliche Bedienwege, Aufgabenprogression, technische Grenzen und konkrete Abnahmen. Es genehmigt keine Runtimeänderung, keinen kostenpflichtigen Modellaufruf, keinen Merge und kein Deployment. Die vorhandenen Spiele und Tests bleiben der Ausgangspunkt. Inhaltliche Vorschläge werden erst nach fachlicher Prüfung und ausdrücklich beauftragter Umsetzung Produktverhalten.

## 1. Auftrag, Leseweg und überprüfbarer Ausgangspunkt

### 1.1 Worum es Martin geht

Die vier Lernspiele sollen besser, intuitiver und einheitlicher werden. Mathematik und Deutsch sollen von einer nachvollziehbaren Schwierigkeitsreform profitieren. Die überarbeiteten Lehrpläne sollen eingebunden werden, ohne den einfachen Einstieg mit Fachverwaltung zu überladen. Remy soll auch für Mathematik helfen: Ein eigener oder mit Remy erstellter Test soll als Ausgangspunkt für eine fünfminütige Runde dienen, in der fortlaufend ähnliche passende Aufgaben erscheinen. Ein kleiner Ausgangstest darf die Runde nicht nach zwei Aufgaben beenden. Gemeint ist eine Übungsrunde mit Profil und optionaler Testquelle; der bewertete Leistungsnachweis selbst wird nicht in einen unbegrenzten Test umgebaut.

Der konkrete Nutzerbericht lautet: Die bisherigen Stufen 1 und 2 sind spielbar, Stufe 3 wird als zu schwer erlebt; die höheren Stufen 4 und 5 wurden nicht getestet. Das ist ein ernst zu nehmender Anlass zur Untersuchung. Es ist keine gemessene Aussage über alle Lernenden, alle Themen oder alle bestehenden Generatoren. Die gelesene Mathematikengine bildet aktuell vier interne Niveaus ab; die Produktbezeichnung höherer Stufen muss im jeweiligen tatsächlichen Einstieg abgeglichen werden. Aus der Erinnerung an fünf Stufen wird keine fünfte Enginefähigkeit erfunden.

Der gemeinsame Auftrag lautet deshalb: Weniger Entscheidungen vor dem ersten Erfolg, fachlich nachvollziehbare kleine Lernschritte, keine erzwungene Unterhaltung mit einer KI und ein erweiterter Weg für Menschen, die Schulart, Klasse und Kompetenzen bewusst festlegen möchten. Die direkte Bedienung bleibt vollständig. Remy ergänzt diese Bedienung.

### 1.2 Was dieses Buch liefert

Die Kapitel beschreiben einen gemeinsamen Rahmen und vier fachliche Ausprägungen. Konkrete Bildschirmtexte, Zustandsfolgen, Datenbeispiele, Aufgabenfamilien, Migrationsschritte und Abnahmefälle machen den Vorschlag entscheidbar. Der Designatlas ergänzt zwölf Konzeptansichten. Diese Bilder sind neue Entwürfe, keine Screenshots eines bereits umgesetzten Produkts.

Entscheidungen tragen drei unterschiedliche Bedeutungen: **Bestand** ist anhand einer benannten Quelle geprüft. **Vorschlag** ist die hier empfohlene nächste Gestaltung. **Offen** ist eine fachliche oder betriebliche Frage, deren Antwort vor dem betreffenden Implementierungsschritt erforderlich wird. Ein gut ausgearbeiteter Vorschlag wird nicht durch seine Ausführlichkeit automatisch beschlossen.

Für einen schnellen Leseweg eignen sich Kapitel 2 bis 6 sowie Kapitel 17 und 18. Fachliche Reviewer lesen zusätzlich Kapitel 7 bis 12 und den Forschungsanhang. Umsetzende Fachchats beginnen bei Kapitel 15 bis 18, prüfen dann ihre konkreten Quellverträge erneut. Eine Lehrkraft kann direkt die Beispiele und Schülertexte lesen; die technischen Modelle stehen getrennt.

### 1.3 Tatsächlich geprüfter Projektstand

Die aktuelle Koordinationsbasis ist main `8560992c072779814017ebac6e86b65e938bc951`. START_HERE, AGENTS, STATE, TODO, Registry, Chatvertrag, Gamesworkflow, Spielbriefing, Assetguide, Assurance-Einstieg und Skillzuordnung wurden frisch gelesen. Der jüngste gelesene Development-Status-Lauf `38809750925`, Job `116679689447`, war erfolgreich. Er meldet unter anderem 26 aktive Workstreams, 22 Überschneidungshinweise, 12 ältere kritische Branches und 147 unklassifizierte Branches. Das sind Koordinationshinweise; dieses Planbuch bereinigt keine fremden Branches.

| Bereich | Nachweisbarer Ausgang | Grenze für dieses Buch |
|---|---|---|
| Gemeinsame Webapp | STATE nennt GC39 auf `8f869790…`, gemeinsames Staging | Kein Nachweis vollständiger physischer Geräte- und Nutzerabnahme |
| Games Hub | Draft-PR 2, `lab/games-structure@55e58e4f…` | Alte Labarbeit wird nicht stillschweigend als aktueller Webrelease bezeichnet |
| Games Design | Draft-PR 28, `lab/games-design-system@766cb551…` | Konzept-/Komponentenbestand, kein Gesamtproduktfertigbeleg |
| Fast Quiz Binomik | Draft-PR 224, `2e5f8b8e…`, Ziel Gamesstruktur | Bestehende Änderung zuerst übernehmen oder bewusst verwerfen; nicht doppelt bauen |
| Wissensreise | Draft-PR 238, `ec751260…`, isolierte Vorschau | Unmerged; echte private Vorbereitung geprüft, vollständige Spiel-/Providerabnahme offen |
| Wissensreise Dokumentation | Draft-PR 237, `a66fb81b…` | Historie und offene Masterplanpunkte bleiben erhalten |
| Aufgabenpool | Draft-PR 218, `64d78d19…` | Code/CI belegen keine integrierte Lehrplanvollanalyse |
| Lehrplan-/Medienarbeit | Draft-PR 208 `60cfc7e2…`, PR 214 `8eacbf5b…` | Recherche-/Arbeitsstände nicht als fertig veröffentlichten Katalog ausgeben |

Die passende Bestandsbewertung ist bewusst eng: **Die Eignung eines gemeinsamen Rahmens wird mit 9/10 bewertet**, weil ähnliche Einstellungs- und Spielzustände tatsächlich vorhanden sind und Wissensreise bereits vertraute Spieleinstellungen aufgreift. **Die Fertigstellung der hier vorgeschlagenen Gesamtüberarbeitung lässt sich noch nicht belastbar benoten**: Es gibt weder eine freigegebene Gesamtspezifikation noch einen zusammengebauten, fachlich und auf Geräten geprüften Zielstand. Tests einzelner Branches beantworten diese Frage nicht.

### 1.4 Die Lehre aus dem 50-Fragen-Fall

Wissensreise wurde zunächst mit kleinen synthetischen Quellen geprüft. Im echten Workflow zeigte eine zulässige Quelle mit 50 Aufgaben eine unbegründete 40-Aufgaben-Grenze. Der Fix richtet sich nach dem bestehenden 100-Aufgaben-Testvertrag. Die frische Übergabe dokumentiert anschließend 46 vorbereitete spielbare Aufgaben und vier medienabhängige Ausschlüsse. Authentifizierung und private Vorbereitung waren damit im tatsächlichen Nutzerablauf geprüft. Die Quelle wurde nicht öffentlich freigegeben und kein realer kostenpflichtiger Variantenlauf als Abnahme behauptet.

Für dieses Buch folgt daraus ein verbindlicher Prüfgrundsatz: Testzahlen sind Hilfsmittel, keine Produktqualität. Geprüft werden die tatsächlichen zulässigen Quellen, ihre Größen, Typen, Revisionen und Grenzen. Im Abnahmeplan stehen deshalb 2-, 50- und 100-Aufgaben-Quellen, reine Textquellen, gemischte Medienquellen und ehrliche Ausschlüsse. Ein Erfolg mit zwei Aufgaben ersetzt diese Fälle nicht.

## 2. Produktbild und begründete Auswahl des Ansatzes

### 2.1 Das gemeinsame Versprechen

„Wähle, was du üben möchtest. Starte sofort. Stelle bei Bedarf genauer ein.“ Dieses Versprechen ist in allen vier Spielen gleich. Unterschiedlich bleiben die fachlichen Aufgaben, Antwortformen und das Feedback. Ein Mathefeld und eine Wortartenmarkierung müssen nicht identisch aussehen; Start, Hilfe, Pause, Weiter und Abschluss sollen sich vertraut anfühlen.

Der Rahmen trennt drei Dinge: **Lerninhalt** beschreibt, was geübt wird. **Spielregel** beschreibt, wie die Runde abläuft. **Antwortformat** beschreibt, wie eine konkrete Aufgabe beantwortet wird. „Brüche“, „fünf Minuten“ und „Zahl eingeben“ sind damit keine konkurrierenden Modi. Diese Trennung verhindert, dass neue Quellen jeweils ein eigenes Spielsystem erhalten.

### 2.2 Drei Ansätze im Vergleich

Die Bewertung verwendet dieselben Kriterien: Zeit bis zum ersten sinnvollen Start, Erhalt fachlicher Kontrolle, Wiederverwendung vorhandener Verträge, Aufwand und Risiko der Migration, Verständlichkeit für Lernende. Die Werte sind begründete Eignungseinschätzungen, keine Messwerte.

| Ansatz | Eignung | Stärke | Schwäche und entscheidende Abwägung |
|---|---:|---|---|
| Gemeinsamer Rahmen mit „Einfach starten“ und „Genau auswählen“ | 9/10 | Wenige Startangaben, Fachkontrolle bei Bedarf, schrittweise migrierbar | Gemeinsame Begriffe und Adapter müssen sorgfältig geklärt werden |
| Vier getrennte Neustarts mit je eigenem Assistenten | 4/10 | Große lokale Freiheit | Vier Bedienlogiken, doppelte Fehlerflächen, schwerere Pflege und uneinheitliche Klassenwege |
| Ein verpflichtender Lehrplan-/Remy-Wizard für jeden Start | 5/10 | Viel Kontext bereits vor der Runde | Hohe Einstiegslast, unnötige Wartezeit und Metadatenpflicht; passt schlecht zu fünf Minuten spontanem Üben |

Empfohlen wird der gemeinsame Rahmen. Er gibt Lernenden einen direkten Weg und Lehrkräften eine präzise Auswahl. Er vermeidet einen großen gleichzeitigen Neubau: Zunächst wird ein echter Referenzabschnitt mit einem vorhandenen Mathematiktest umgesetzt und geprüft. Erst bei überzeugendem Ergebnis werden weitere Fachadapter angeschlossen.

### 2.3 Was bewusst erhalten bleibt

Eigene Tests bleiben gültige Quellen. Keine feste Themenprobe ersetzt Martins tatsächlichen Test. Bestehende Klassenboards, Code-/QR-Wege, Rollen, Schlüsselgrenzen und Spielveröffentlichungen werden fachlich geprüft und wiederverwendet. Wissensreise bleibt ein Lernangebot ohne manuelle Antwortbewertung oder Strafsperren. Spielstand und Spielscore werden nicht zu Schulnoten umgedeutet.

Die tatsächlichen Runtime-/Enginevarianten werden vor einer späteren größeren Produktion anhand derselben Lern-, Eingabe-, Geräte- und Pflegeanforderungen verglichen. Für diese browserbasierten Lernschleifen ist das vorhandene Websystem der begründete erste Kandidat. Eine zusätzliche Godot- oder Unrealmigration hätte im aktuellen Plan keinen belegten Lernnutzen und wäre ein separater Auftrag. Dieses Urteil bewertet den Scope, nicht die allgemeine Qualität der Engines.

### 2.4 Erfolg aus Sicht der Menschen

Eine lernende Person kann ohne Schulverwaltungswissen starten, erkennt ihr Lernziel, versteht Hilfe und findet nach einer Unterbrechung zurück. Eine Lehrkraft kann genaue Kompetenzen und Voraussetzungen festlegen, ohne jede Runde von Hand zu kuratieren. Sie sieht, welche Quelle genutzt wird und welche Aufgaben ausgeschlossen wurden. Martin erkennt bei der Prüfung sofort, welche Bildschirmansichten real funktionieren und welche noch Entwürfe sind.

Als vorgeschlagene Produktziele gelten: Die Startseite bietet einen klaren Primärweg; die fünfminütige Runde endet am Zeitende statt an der Zahl der Quellaufgaben; jedes Niveau benennt verständlich, was sich ändert; Lehrplanwahl ist optional; kein Vorschlag versteckt Kosten, fehlende Quellen oder unpassende Aufgaben hinter einer Erfolgsmeldung. Konkrete Zeit- und Gerätezielwerte werden erst an einem benannten Referenzbuild gemessen.

## 3. Einfach starten: der primäre Einstieg

### 3.1 Drei Entscheidungen reichen im Normalfall

Der Einstieg fragt zuerst nach dem Inhalt: ein Thema eingeben oder einen bestehenden Test auswählen. Zweitens steht die Dauer bereit, mit gut sichtbaren **5 Minuten** sowie **Ohne Zeitlimit**. Drittens zeigt die Oberfläche eine verständliche Niveauempfehlung. „Empfohlen: Grundlagen festigen“ ist eine Erklärung, kein verpflichtender Filter. Ein kurzer Beispielsatz unter der Karte macht die Empfehlung anschaulich.

Der Fachkontext darf aus dem Spiel kommen. Wer Fast Quiz geöffnet hat, muss Mathematik nicht erneut auswählen. Wer vom eigenen Test kommt, übernimmt dessen Fach und Lernziele. Wer Vocab Rush nutzt, erhält die vorhandene Lernsprache und Richtung. Wo Angaben fehlen, ist eine verständliche Standardauswahl möglich. Keine neue Pflicht zu Schule, Jahrgang, Bundesland oder Diagnose entsteht.

**Konkrete Bildschirmtexte:** Titel „Was möchtest du üben?“; Eingabehilfe „Zum Beispiel Brüche addieren – oder wähle einen eigenen Test.“; Testschaltfläche „Eigenen Test wählen“; Dauer „Wie lange möchtest du üben?“; Niveau „So starten wir“; primärer Button „Übung starten“; sekundärer Link „Genau auswählen“; Remy-Einstieg „Mit Remy vorbereiten“.

„Übung starten“ darf nicht eine unbestimmte neue Generierung auslösen, ohne dies vorher zu zeigen. Sind geprüfte Aufgaben vorhanden, startet die Runde. Muss eine private Lernkopie vorbereitet werden, lautet der Button „Training vorbereiten“ und der nächste Schritt erklärt die Prüfung. Das vorhandene Wissensreiseverhalten wird dadurch verständlicher, ohne die Lehrerfreigabe zu überspringen.

### 3.2 Das Vorbereitungsblatt

Vor dem Start steht eine kompakte Zusammenfassung: „Brüche · 5 Minuten · Grundlagen festigen · aus deinem Test“. Sie enthält eine sichtbare Änderungsmöglichkeit. Bei Quellen mit Einschränkungen folgt beispielsweise: „46 von 50 Aufgaben passen zu dieser Übung. 4 benötigen Medien und sind hier nicht enthalten.“ Ein Aufklappbereich erklärt Gründe, ohne Rohdaten oder Lösungsschlüssel offenzulegen.

Bei einer Quelle ohne geeignete Aufgaben ist Start deaktiviert. Der Text lautet: „Für diese Quelle ist noch keine passende Übungsaufgabe verfügbar. Wähle ein anderes Format oder prüfe den Test.“ Ein leerer Pool wird nicht heimlich durch ein anderes Thema ersetzt. Ist nur eine geringere Anzahl verfügbar, wird transparent erklärt, ob Wiederholung möglich ist. Fehlende Neuvarianten sind kein Grund, einen zulässigen Timerlauf nach zwei Quellen zu beenden.

### 3.3 Einstieg von verschiedenen Orten

Vom Games Hub aus wählt man das Spiel und gelangt zum gemeinsamen Startblatt. Vom Testeditor aus lautet die Aktion „Als Lernspiel üben“. Sie führt mit einer unveränderlich referenzierten Quelle zur Vorbereitung. Vom QR-Link aus erscheint zunächst der veröffentlichte Spielkontext mit Lehrerbezug, Dauer und Beitrittsaktion. Ein vorhandener aktiver Spielstand hat Vorrang vor einem neuen leeren Konfigurator: „Du hast hier schon begonnen. Fortsetzen“.

Der Rückweg erhält die Auswahl. „Zurück“ löscht keine Quelle und keine vorbereitete Lernkopie. Ein echter Neustart hat einen klaren eigenen Text. Bei einer veröffentlichten Klassenrunde darf ein Schüler die Lehrerregeln nicht über einen zurückgespeicherten lokalen Entwurf verändern.

### 3.4 Der fünfminütige Mathematikweg im Detail

Martin öffnet einen eigenen Remy-Test. Er wählt „Als Lernspiel üben“, bestätigt Mathematik und fünf Minuten. Die Oberfläche schlägt aus den geprüften Originalaufgaben passende Familien vor und zeigt ein Beispiel. Martin kann die Übungsart ansehen und vor der Freigabe die Aufgaben-/Schlüsselprüfung öffnen. Danach startet die Lernrunde mit vorhandenem Inhalt. Weitere geeignete Aufgaben werden aus einem geprüften Vorrat oder einem erlaubten parametrierbaren Generator bereitgestellt; generische Varianten bleiben an den vorhandenen freigegebenen Nachfüllweg gebunden.

Der Countdown zeigt die verbleibende Sitzungsdauer. Eine richtige Antwort führt zur nächsten Aufgabe. Eine falsche Antwort öffnet Hilfe und einen erneuten Versuch entsprechend dem Lernmodus. Die Runde endet nach fünf Minuten mit einem sachlichen Rückblick. Wenn kein neues zulässiges Material mehr verfügbar ist, erscheint „Du wiederholst jetzt bekannte Aufgaben“. Die UI behauptet keine unendlich neuen KIinhalte.

## 4. Genau auswählen: Lehrplan als erweiterte Option

### 4.1 Progressive Auswahl statt Pflichtformular

„Genau auswählen“ öffnet eine klar gruppierte Erweiterung. Die Gruppen heißen **Lernziel**, **Lehrplan**, **Aufgaben und Hilfen**, **Spielregeln**. Sie sind unabhängig aufklappbar. Wer nur den Zahlenraum ändern möchte, muss nicht zuerst Schulart und Jahrgang ausfüllen. Wer eine Kompetenz auswählt, sieht die daraus folgenden fachlichen Einschränkungen und kann den Übungsumfang bewusst bestätigen.

Die Lehrplanauswahl verwendet Bundesland beziehungsweise Geltungsbereich, Schulart, Fach, Jahrgang und Version. Erst anschließend werden passende Kompetenzbereiche und konkrete Kompetenzen angezeigt. Ein Suchfeld durchsucht die sichtbare Auswahl. Fachbegriffe erhalten kurze Erläuterungen. Keine lange Kompetenz-ID ist der einzige verständliche Titel.

### 4.2 Herkunft und Prüfstatus sichtbar halten

Jeder Lehrplaneintrag besitzt eine primäre Quelle, Versionsangabe, Abruf-/Prüfdatum und einen Status. **Quellengeprüft** bedeutet, dass die Zuordnung durch die benannte fachliche Prüfung getragen ist. **Entwurf** bedeutet, dass die Zuordnung noch nicht ausreichend geprüft wurde. Ein vorhandener PDFname oder ein erfolgreiches Importskript genügt nicht für „geprüft“. Der sichtbare Text darf nicht „Lehrplan vollständig“ heißen, solange die Vollauswertung offen ist.

Im Detailblatt steht beispielsweise: „Bayern · Mittelschule · Mathematik 5 · LehrplanPLUS · Quelle geprüft am …“. Darunter folgt die Kompetenz in lesbarer Sprache, dann ein kleiner Quellenlink. Die Aufgabe kann mehrere Kompetenzbezüge besitzen. Der Plan verlangt keine falsche Eins-zu-eins-Zuordnung, wenn eine Aufgabe mehrere Fähigkeiten verbindet.

### 4.3 Klasse ist kein Schwierigkeitsregler

Der Jahrgang dient der Inhaltsauswahl und Einordnung. Das Niveau steuert die konkrete Anforderung innerhalb des Lernziels. Eine Person kann in Klasse 7 Grundlagen der Brüche festigen; das ist weder eine Herabstufung der Person noch ein Diagnosebeleg. Die UI zeigt „Brüche: gleichnamig addieren“ statt „Du bist auf Klasse-5-Niveau“.

Wird die Lehrplanauswahl geändert, zeigt die Oberfläche die Auswirkungen vor dem Anwenden: „Diese Auswahl passt die Themenvorschläge an. Dein eigener Test bleibt unverändert.“ Eine benannte Quelle wird nicht automatisch durch einen Pool ersetzt. Eigene Lernziele haben bei der Arbeit mit einem eigenen Test Vorrang; ein unverträglicher Lehrplanfilter muss erklärt werden, nicht unsichtbar Quellaufgaben entfernen.

### 4.4 Defaults und offene Fachbindung

Martin hat die Zielgruppe während der Ausarbeitung ausdrücklich festgelegt: **Mittelschule Bayern, Klassen 5 bis 10**. Diese Bindung gilt für die Lehrplanmappings und Beispielmatrizen dieses Plans. Regelklassen, M-Zug und Quali-Bezüge werden dort getrennt geführt, wo die amtlichen Quellen sie unterscheiden; eine Klasse-10-Aufgabe wird nicht pauschal als Regelklasseninhalt ausgegeben. Die Beispiele verwenden die überprüften Quellen enger, als ein vollständiger landesweiter Katalog es müsste. Der Forschungsanhang beschreibt genau, welche Quellen und Lehrplanbereiche geprüft wurden.

Vor einer breiten Lehrplanfreigabe wird der vorhandene GC-PEDAGOGY-KB-01-Arbeitsstand mit den tatsächlichen offenen PRs und lokalen Sicherungen abgeglichen. Ein neuer UXauftrag darf nicht eine zweite konkurrierende Lehrplandatenbank beginnen. Die passende nächste Aufgabe ist ein sichtbarer Lesekontrakt für bereits geprüfte Zuordnungen, nicht eine neue pauschale Vollanalyse.

## 5. Quellen und Remy: ein Vertrag, mehrere Einstiege

### 5.1 Vier verständliche Quellenwege

Der gemeinsame Rahmen verwendet vier Quellkontexte: **Thema**, **Lehrplan**, **Remy-Test**, **eigener Test**. Für Lernende sind das unterschiedliche Ausgangspunkte; technisch sollen sie in denselben geprüften Aufgabenkontrakt münden. „Remy-Test“ beschreibt die Entstehung einer Quelle, nicht automatisch höhere Qualität oder besondere Rechte. Ein gespeicherter, manuell erstellter Test muss denselben Lernweg nutzen können.

| Weg | Eingabe | Ergebnis vor dem Spielen | Unverzichtbare Grenze |
|---|---|---|---|
| Thema | Kurze freie Themenangabe und vorhandener Fachkontext | Passende vorhandene Aufgaben oder sichtbar notwendige Vorbereitung | Kein Austausch des Themas bei leerem Pool |
| Lehrplan | Geprüfte Kompetenzzuordnung | Fachlich abgegrenzter Aufgabenvorrat | Quellen-/Versionsstatus bleibt sichtbar |
| Remy-Test | Gespeicherter Remy-Test mit Revision | Private Lernkopie mit Coverage und Prüfstatus | Originaltest und Lernziele bleiben erhalten |
| Eigener Test | Eigener zugänglicher Test mit Revision | Derselbe Lernkopie-/Adaptervertrag | Keine fremden/aktiven gesperrten Quellen verwenden |

### 5.2 Remy als verständlicher Helfer

Der Remy-Einstieg lautet: „Beschreibe kurz, was du üben möchtest.“ Darunter stehen auswählbare Beispiele für die Form der Anfrage, keine fest verdrahteten tatsächlichen Themen. Ein Mathematikbeispiel kann „Fünf Minuten Aufgaben wie in meinem Test“ heißen. Der Assistent fragt nur nach Angaben, die für die konkrete Quelle fehlen. Hat Martin bereits einen Test gewählt, soll Remy nicht erneut Thema, Fach und Klasse abfragen.

Vorhandene Texteingabe und gegebenenfalls vorhandene Voicefunktionen werden wiederverwendet. Dieser Plan beauftragt kein neues Voice-SDK. Sprache ist eine Eingabemöglichkeit; jede Auswahl bleibt auch ohne Mikrofon zugänglich. Eine erkannte Anfrage wird als bearbeitbare Zusammenfassung gezeigt: „Ich habe verstanden: dein gewählter Test, fünf Minuten, Grundlagen festigen.“ Erst eine bewusste Aktion übernimmt diese Einstellungen.

### 5.3 Unterschied zwischen Vorbereiten und Generieren

Vorbereitung bedeutet: Quelle lesen, Berechtigung und Revision prüfen, geeignete Formate übernehmen, Coverage bilden, Aufgabe und verifizierten Schlüssel in einen privaten Lernvertrag überführen. Generierung bedeutet: neue Varianten über einen bestehenden kosten-/quotagebundenen Weg erstellen. Veröffentlichung bedeutet: eine geprüfte Lernkopie für den vorgesehenen Lernendenkreis freigeben. Diese drei Schritte dürfen weder in Text noch Datenmodell verschwimmen.

Bei vorhandenen Aufgaben soll die Lernrunde nicht auf neue Modellinhalte warten müssen. Wo echte Vorbereitung Zeit benötigt, zeigt die Oberfläche konkrete Zustände: „Quelle prüfen“, „Geeignete Aufgaben übernehmen“, „Bereit zur Prüfung“. Prozentanzeigen werden nur mit tatsächlich messbarem Fortschritt benutzt. Ein Modellaufruf ohne verlässlichen Fortschritt erhält keine erfundene 87%-Anzeige.

### 5.4 Inhaltsprüfung und ehrliche Coverage

Die Lehrkraft prüft in einer privaten Vorschau Aufgaben, Lösungen und Hilfen. Die öffentliche Lernansicht enthält keine Schlüssel oder privaten Quelltexte. Die Coverage trennt Quellanzahl, übernommene Aufgaben, ausgeschlossene Aufgaben, erlaubte Übungsformate und verfügbare Varianten. „46 spielbare Quellaufgaben“ ist etwas anderes als „36 neue Varianten“. Jede Zahl bekommt ihren Zweck und Nenner.

Ein Medienausschluss lautet beispielsweise „Diese Aufgabe benötigt eine Abbildung, die in diesem Übungsformat nicht verfügbar ist.“ Ein unklarer Schlüssel lautet „Die Lösung ist für diese Übungsform nicht zuverlässig prüfbar.“ Die Oberfläche gibt keine Schuld an Lernende weiter. Für den eigenen Test gibt es einen kontrollierten Rückweg zum Editor; ein automatisches Umschreiben oder Veröffentlichen des Originals ist ausgeschlossen.

## 6. Gemeinsame Spieloberfläche und vollständige Zustandsfolge

### 6.1 Ein ruhiger Rahmen für alle vier Spiele

Der Spielkopf zeigt Spielname, Lernziel in einem kurzen Satz und verbleibende Sitzungszeit. Pause steht immer an derselben Stelle. Die Aufgabenfläche erhält die größte visuelle Aufmerksamkeit. Darunter folgt die jeweilige Antwortbedienung; Hilfe und Weiter erscheinen verlässlich in derselben Reihenfolge. Ein Spielscore darf bei geeigneten bestehenden Spielen vorhanden sein, erhält aber eine klare Bezeichnung wie „Spielpunkte“. Er wird nicht neben eine schulische Note gestellt, als wären beide gleichwertig.

In Wissensreise werden keine neuen Punkte aus der Vereinheitlichung eingeführt. Dort können „Heute geübt“ und ein sachlicher Sitzungsverlauf die Orientierung geben. Der gemeinsame Rahmen bedeutet gleiche Bedienbedeutung, nicht gleiche Belohnung für jedes Fach. Eine falsch beantwortete Wissensfrage führt nicht zu einer künstlichen Strafsperre, nur damit das Layout dem Quiz ähnelt.

### 6.2 Zustandsmodell für die Bedienung

| Zustand | Sichtbare Information | Primäre Aktion | Was dabei erhalten bleibt |
|---|---|---|---|
| Auswahl | Quelle, Dauer, empfohlener Einstieg | Übung starten / Training vorbereiten | Gewählte Werte |
| Vorbereitung | Tatsächlicher Prüfschritt und Grenzen | Nach Prüfung ansehen | Quellrevision und Entwurf |
| Bereit | Zusammenfassung, Coverage, Freigabestatus | Starten / Freigeben | Geprüfter Vorrat |
| Aufgabe offen | Lernauftrag, Antwortform, Hilfe | Antwort prüfen | Stabile Aufgaben-ID |
| Feedback | Ergebnis und fachlich passende Erklärung | Weiter / Noch einmal versuchen | Antwort und Hilfenutzung |
| Pause | „Deine Übung ist pausiert“ und Zeitregel | Fortsetzen | Sitzung und gleicher Aufgabenzustand |
| Unterbrochen | Ursache und sicherer Wiederaufnahmeweg | Verbindung prüfen / Fortsetzen | Letzter bestätigter Stand |
| Zeitende | Rückblick und nicht gewertete offene Aufgabe | Ergebnisse ansehen | Abgeschlossener Sitzungsdatensatz |
| Abschluss ohne Timer | Sachlicher Rückblick | Weiter üben / Beenden | Persönlicher Verlauf nach gültigem Vertrag |

**Bestand Wissensreise:** Die aktuelle absolute Serverdeadline läuft auch bei einer geöffneten Pause weiter; die dokumentierte QA beobachtete beispielsweise 1:54 → 0:57. **Vorschlag für einen späteren ausdrücklich beauftragten Lernmodus:** „Pause“ hält die aktive Sitzungszeit im Solotraining an. Das wäre eine bewusste Verhaltensänderung und ist noch nicht umgesetzt. Bei einer lehrkraftgesteuerten Klassenrunde gilt dagegen die veröffentlichte gemeinsame Zeitregel. Die Oberfläche sagt dies vor dem Start und im Pausenblatt. Eine lokale Pause darf eine serverseitige Klassenfrist nicht verändern. Die genaue bestehende Deadline-/Resume-Implementierung bleibt bis zur Adapterprüfung maßgeblich.

### 6.3 Neu starten, zurücksetzen und fortsetzen

„Neu starten“ erzeugt eine neue Runde mit denselben bestätigten Einstellungen. Es löscht weder den Ausgangstest noch einen früheren Lernverlauf. „Auswahl ändern“ führt zurück zum Startblatt. „Fortsetzen“ stellt dieselbe aktive Aufgaben-ID wieder her und setzt keine Antwort neu als offen, wenn sie serverseitig bereits bestätigt ist. Ein Reset zu Entwicklungszwecken gehört ausschließlich in den bestehenden berechtigten Entwicklerscope, nicht in die normale Schüleroberfläche.

Eine nach einem Refresh erneut sichtbare Aufgabe darf nicht doppelt Punkte oder Fortschritt erzeugen. Die UI kann einen bestätigten Antwortstatus erneut darstellen; serverseitige Idempotenz entscheidet über die Wirkung. Lokaler Speicher hilft bei der Wiederherstellung, darf aber keine Berechtigungen, Lösungsschlüssel oder verbindlichen Klassenfristen ersetzen.

### 6.4 Feedbacktexte als Teil der Fachlichkeit

Gute Rückmeldung nennt eine nützliche nächste Handlung. „Noch nicht. Erweitere zuerst beide Brüche auf denselben Nenner“ hilft mehr als ein rotes Kreuz allein. Bei einem Wahr/Falsch-Item kann eine kurze korrekte Erklärung erscheinen. Bei offenen Formaten, deren Schlüssel nicht zuverlässig überprüfbar ist, wird keine maschinelle Gewissheit vorgespielt.

„Fast richtig“ wird nur verwendet, wenn tatsächlich eine fachlich bedeutsame Teilrichtigkeit erkannt ist. Ein willkürlicher Stringvergleich erzeugt keine Teilleistung. „Du bist schlecht in Brüchen“ und ähnliche Personenurteile sind ausgeschlossen. Die UI spricht über die aktuelle Aufgabe: „Der gemeinsame Nenner fehlt noch.“

## 7. Fast Quiz: Mathematik mit kleinen, sichtbaren Schritten

### 7.1 Die beobachtbare Ursache großer Sprünge

Die geprüften Labgeneratoren zeigen mehrere gleichzeitig steigende Anforderungen. Bei natürlicher Addition steigen die maximalen Operanden über vier interne Niveaus von 100 auf 1.000, 10.000 und 100.000; eine Summe kann größer sein als der angezeigte Operandenraum. Bei Dezimalaufgaben verändert sich zwischen zwei Stufen nicht nur eine Zahl: Stellenzahl, Zahlenraum und Divisorart können gleichzeitig anspruchsvoller werden. Zudem bedeuten niedrige interne Niveaus in einem Generator nicht automatisch nur anschauliche positive Aufgaben; die Familie ganzer Zahlen kann bereits vorzeichenbehaftete Faktoren oder Divisoren verwenden. Die genauen geprüften Pfade und Fassungen stehen im Forschungsanhang.

Damit ist der Nutzerbericht fachlich plausibel, aber noch nicht vollständig erklärt. Eine Person kann gerade die Dezimaldivision erleben, eine andere eine andere Familie. Der Plan ersetzt den pauschalen Regler durch ein Profil aus klaren Dimensionen. Der sichtbare Einstieg lautet etwa „Addition bis 100, mit Zehnerübergang“ statt nur „Level 2“.

### 7.2 Anforderungen getrennt führen

Ein Mathematikprofil beschreibt Voraussetzungen, Zahlenraum der Operanden und des Ergebnisses, Operationen, Schrittzahl, Darstellung, Antwortformat, erlaubte Hilfen, Transfer und Zeitregel. Bei Brüchen kommen Nennerbeziehungen, gemischte Zahlen, Kürzen und Vorzeichen hinzu. Bei Termen kommen Klammerstruktur, Rechenreihenfolge und Variablen hinzu. Die jeweilige Fachprüfung bestimmt, welche Kombinationen sinnvoll sind.

Der kleinste Schritt ändert vorzugsweise eine wesentliche Anforderungsdimension. Werden mehrere verändert, benennt die UI dies und die Aufgabenfamilie enthält ein passendes Vorbeispiel. Ein größerer Zahlenraum ist nicht automatisch fachlich tiefer. Eine einfache Summe mit fünfstelligen Zahlen und eine kleine anspruchsvolle Sachaufgabe dürfen deshalb nicht allein über die Stellenzahl auf einer universellen Leiter eingeordnet werden.

### 7.3 Beispielraster mehrerer Grundrechenfamilien

Die folgende Matrix stellt mehrere getrennte Aufgabenfamilien nebeneinander: A bis C betreffen additive Strategien, D die Multiplikation/Division und E bis F die Termstruktur. Sie ist ausdrücklich keine universelle lineare Freischaltleiter und keine Jahrgangszuordnung. Ergebnisse und Hilfen sind absichtlich konkret. Ein Implementierungsauftrag muss die gesamte Variantenfamilie einschließlich Randfällen prüfen.

| Schritt | Voraussetzung / Anforderung | Beispiel und erwartete Antwort | Hilfe | Nächster sinnvoller Übergang |
|---|---|---|---|---|
| A | Positive Zahlen, Addition ohne Übergang bis 20 | 12 + 5 = **17** | Punkte-/Zerlegungsbild optional | Ein Zehnerübergang |
| B | Addition mit Übergang bis 20 | 8 + 7 = **15** | „Ergänze 8 zuerst zur 10“ | Gleiche Strategie bis 100 |
| C | Addition/Subtraktion bis 100 mit einem Übergang | 47 + 8 = **55**; 52 − 7 = **45** | Zehnerzerlegung | Zwei bekannte Operationsarten mischen |
| D | Einmaleins und passende Umkehrung | 7 × 8 = **56**; 56 : 7 = **8** | Gruppendarstellung, Einmaleinshinweis | Zwei Rechenschritte ohne neue Zahlart |
| E | Rechenreihenfolge mit zwei Schritten | 6 + 3 × 4 = **18** | „Punktrechnung vor Strichrechnung“ | Klammerwirkung vergleichen |
| F | Klammer als eigene Anforderung | (6 + 3) × 4 = **36** | Klammer zuerst farblich markieren, zusätzlich Text | Transfer oder größere Zahlen gesondert wählen |

Die Beispiele C und D sind zwei Teilfamilien, keine zwingende lineare Reihenfolge für jede Person. Der Adapter verlangt passende Voraussetzungen. Ein zufällig richtig beantwortetes Einmaleinsitem schaltet nicht automatisch Klammerterme frei. Wird negatives Rechnen zum Lernziel, beginnt eine eigene kontrollierte Progression mit anschaulichen Zustandsänderungen, dann differenzierten Vorzeichenregeln. Positive Grundoperationen und negative Faktoren werden nicht ungesehen gemischt.

### 7.4 Beispielprogression Brüche und Klammern

| Schritt | Fachlicher Fokus | Aufgabe / Lösung | Unterstützung und Grenze |
|---|---|---|---|
| A | Bruch als Anteil und gleicher Nenner | 1/5 + 2/5 = **3/5** | Gleich große Teile zeigen; Nenner bleibt erhalten |
| B | Gleichnamige Subtraktion | 5/8 − 2/8 = **3/8** | Nur passende echte Brüche; keine negativen Ergebnisse im Startprofil |
| C | Ein Nenner ist Vielfaches des anderen | 1/2 + 1/4 = **3/4** | „1/2 = 2/4“ als aufklappbarer Hinweis |
| D | Zwei unterschiedliche Nenner mit kleinem kgV | 1/3 + 1/4 = **7/12** | Gemeinsamen Nenner finden; noch keine weitere Operation |
| E | Klammer mit bereits bekannter Subtraktion | 1/2 + (3/4 − 1/4) = **1** | Erst Klammer; zwei Schritte, gleiche Nenner darin |
| F | Zwei Operationen mit Ergebnisprüfung | (2/3 + 1/6) × 3/5 = **1/2** | Erst 5/6, dann 15/30; Kürzen oder gleichwertige Antwort akzeptieren |

„1/2“ und „2/4“ sind mathematisch gleichwertig. Ob vollständig gekürzt werden muss, ist Teil des sichtbaren Auftrags und des Schlüssels. Ein unsichtbares Kürzungsgebot wäre ein Bedienfehler. Bei Dezimaldarstellung muss die localegerechte Eingabe mit Komma und die zulässige alternative Punktnormalisierung vorab festgelegt sein. Rechenfehler, Eingabeformat und Genauigkeitsvorgabe werden als unterschiedliche Rückmeldungen behandelt.

### 7.5 Parametrik nur mit nachweisbarem Schlüssel

Geeignete Familien erhalten deterministische Parameter, Invarianten und einen überprüften Lösungsgenerator. Bei „a/b + c/b“ werden Nenner größer null, gewünschter Ergebnisraum, Kürzungsbedingungen und verbotene Sonderfälle explizit festgelegt. Für eine Division werden Null als Divisor und ungewollte periodische Ergebnisse ausgeschlossen oder bewusst zum Lernziel gemacht. Der Originalschlüssel wird vor der Familienzuordnung verifiziert.

Ein beliebiger Mathematiktext wird nicht allein wegen enthaltener Ziffern parametriert. Eine Sachaufgabe mit Preisen, Rundung und mehreren Randbedingungen braucht einen passenden geprüften Parser oder bleibt unverändert. Der Plan erlaubt keine stille Umdeutung von Martins eigenem Lernziel in eine bequemere Standardfamilie.

## 8. Fehlerjagd Deutsch: Lernziele sichtbar auseinanderhalten

### 8.1 Wortart und Satzglied sind verschiedene Fragen

Wortarten beschreiben Klassen von Wörtern; Satzglieder beschreiben Funktionen beziehungsweise zusammengehörige Einheiten im Satz. „Nomen“ und „Subjekt“ sind deshalb keine austauschbaren Antwortoptionen. Ein Artikel gehört mit einem Nomen zu einem Satzglied, ohne selbst ein Nomen zu sein. Die gemeinsame Schwierigkeitsskala darf diese Ebenen nicht vermischen.

Der Start zeigt zunächst eine passende Familie: „Wortarten erkennen“, „Satzglieder untersuchen“ oder „Rechtschreibung prüfen“. Die UI erklärt die Aufgabe mit einer kurzen Handlung. Beispiel: „Markiere alle Verben.“ Bei Satzgliedern lautet sie etwa: „Markiere das vollständige Subjekt.“ Eine vollständige Wortgruppe muss auswählbar sein. Das vorhandene Token-/Markierungsmodell wird gegen mehrteilige Einheiten geprüft.

### 8.2 Warum der bisherige Regler allein nicht genügt

Die geprüfte Deutschengine nutzt für die ersten beiden internen Niveaus dieselbe Schwierigkeitsauswahl `[1,2]`, danach überlappende Bereiche. Gleichzeitig kann ein engeres Jahrgangsfenster die verfügbaren Aufgaben verändern. Ein Fallback auf alle Aufgaben eines Skills verdeckt bei leeren Pools die tatsächliche Filterwirkung. Das heißt nicht, dass jedes bestehende Item ungeeignet ist; es heißt, dass der sichtbare Regler keine ausreichend präzise fachliche Zusicherung bietet.

Der neue Vertrag verwendet explizite Lernziele, belegte Voraussetzungen und transparente Poolabdeckung. Ist eine gewünschte Kombination leer, wird ein nahe liegender Alternativvorschlag angeboten: „Für diese Auswahl fehlen geprüfte Aufgaben. Du kannst den Themenfilter erweitern.“ Die Erweiterung erfolgt bewusst und sichtbar. Ein anderer Schwierigkeitsmix wird nicht als exakt gleiche Auswahl ausgegeben.

### 8.3 Beispielprogression Wortarten

| Schritt | Aufgabe | Erwartung | Hilfe / Voraussetzung |
|---|---|---|---|
| A | „Markiere das Nomen: Der Hund schläft.“ | **Hund** | Gegenständliches Nomen, eindeutiger Satz |
| B | „Markiere das Verb: Mia lacht.“ | **lacht** | „Was tut Mia?“ als begrenzte erste Hilfe |
| C | „Markiere das Adjektiv: Der kleine Hund schläft.“ | **kleine** | Eigenschaft zum Nomen, noch keine nominalisierte Form |
| D | „Ordne zu: Die Kinder spielen leise.“ | Die = Artikel; Kinder = Nomen; spielen = Verb; leise = hier adverbial verwendetes Adjektiv | Fachterminologie vorab festlegen; Verwendung nicht mit Wortart verwechseln |
| E | „Markiere die Personalpronomen: Sie hilft ihm.“ | **Sie**, **ihm** | Fälle müssen für die Erkennung nicht vollständig benannt werden |
| F | „Bestimme die Wortart von Lesen: Das Lesen macht Spaß.“ | **nominalisiertes Verb / Nomen im vereinbarten Modell** | Modell und zulässige Benennung explizit; Nominalisierung zuvor erarbeiten |

Das Beispiel D benötigt sorgfältige Fachprüfung des verwendeten schulischen Wortartenmodells. Wird „Adverb“ im Zielmaterial anders operationalisiert, muss der Aufgabentext dazu passen. Die prüfbare Anforderung ist nicht ein versteckter Streit über Begriffe, sondern ein offengelegtes Analysemodell. Mehrdeutige Fälle werden im Einstieg vermieden und später ausdrücklich als Reflexionsaufgaben behandelt.

### 8.4 Beispielprogression Satzglieder

| Schritt | Aufgabe | Erwartung | Hilfe / Voraussetzung |
|---|---|---|---|
| A | „Markiere das vollständige Subjekt: Der Hund schläft.“ | **Der Hund** | Wer oder was schläft? |
| B | „Markiere das Prädikat: Mia liest.“ | **liest** | Einteiliges Prädikat |
| C | „Markiere das Akkusativobjekt: Mia liest ein Buch.“ | **ein Buch** | Wen oder was liest Mia? |
| D | „Markiere die Ortsangabe: Die Kinder spielen im Garten.“ | **im Garten** | Wo?; Umstellprobe als Hilfe |
| E | „Markiere das vollständige Prädikat: Mia hat ein Buch gelesen.“ | **hat … gelesen** | Mehrteilige Markierung; Objekt bleibt unmarkiert |
| F | „Verschiebe ein Satzglied: Am Morgen liest Mia ein Buch.“ | Zum Beispiel **Mia liest am Morgen ein Buch.** | Umstellprobe, Großschreibung und Satzschluss beachten; mehrere gültige Ergebnisse |

Ein mehrteiliges Prädikat verlangt mehrere auswählbare Segmente. Eine Engine, die nur einen zusammenhängenden Bereich akzeptiert, darf Schritt E nicht durch ein falsches zusammenhängendes Goldlabel ersetzen. Für Schritt F genügt kein einzelner gespeicherter Satz als exklusiver Schlüssel. Entweder ein geprüfter Satzbauvertrag akzeptiert die zulässigen Varianten oder diese Aufgabe bleibt im erklärenden Training statt in automatischer Vollbewertung.

### 8.5 Feedback und sprachliche Last

Ein Wortartenfehler erhält eine passende begriffliche Hilfe; ein Satzgliedfehler eine passende Probe. „Das Subjekt enthält hier Artikel und Nomen“ ist eine sinnvolle Erklärung. „Das ist kein Nomen“ wäre bei derselben Auswahl nicht die richtige Ebene. Längere Sätze steigern die Leseanforderung, aber nicht zwangsläufig das Zielkonzept. Satzlänge, Neben-/Hauptsatzstruktur, Mehrdeutigkeit und Anzahl der gesuchten Elemente werden deshalb getrennt erfasst.

Rechtschreibübungen brauchen echte Kontexte und eindeutige Zielstellen. Die Fehlerjagd soll keine falschen Formen wiederholt als dekorativen Standard zeigen. Eine Korrekturansicht stellt die richtige Form deutlich dar und erklärt bei Bedarf die Regel. Für ungeprüfte offene Rechtschreibfälle wird keine pauschale KIgewissheit angeboten.

## 9. Vocab Rush: Wortschatz, Bedeutung und Schreibweise

### 9.1 Ein anderer fachlicher Schwerpunkt

Vocab Rush übt zunächst Bedeutung, Abruf und gegebenenfalls Schreibweise. Die vorhandene curriculare Auswahl arbeitet mit eingeführtem Wortschatz und Themen, nicht mit einem eigenständigen universellen Difficultyparameter. Eigene Sets besitzen eigene Richtungs-/Auswahlverträge. Ein neues gemeinsames Niveaulabel darf deshalb nicht behaupten, diese Dimension sei im Bestand bereits fachlich präzise umgesetzt.

Die neue Aufgabenfamilie benennt Abrufrichtung, Kontext, Antwortformat und Hilfen. „Wort erkennen“ ist ein anderer Lernschritt als „Wort ohne Auswahl schreiben“. Eine unbekannte Vokabel ist nicht allein durch einfachere Distraktoren gelernt. Die Oberfläche bietet zunächst ein transparentes Set mit Vorschau und Herkunft; ein Lehrplanfilter begrenzt das Thema, garantiert aber keine individuell bereits erlernten Wörter.

### 9.2 Beispielprogression mit eindeutigem Zielwort

| Schritt | Aufgabe | Erwartung | Fachlicher Zweck / Hilfe |
|---|---|---|---|
| A | Bild oder deutscher Begriff „Hund“; zwei englische Wörter | **dog** | Bedeutungszuordnung; alternative Option fachlich klar verschieden |
| B | „Hund“ mit vier Optionen: dog, chair, apple, window | **dog** | Variation der Antwortformatbelastung, kein höheres Wortwissen; keine künstlich ähnlichen Scheinwörter |
| C | „The dog is in the garden.“ – Was bedeutet dog? | **Hund** | Vertrauter Satzkontext, Zielwort sichtbar |
| D | „Hund → d_g“ | **dog** | Schreibstütze, nur ein fehlender Buchstabe |
| E | „Hund“ – englisches Wort ohne Auswahl eingeben | **dog** | Freier Abruf und Orthografie; Auftrag verlangt Singular |
| F | „Schreibe das fehlende Wort: I can see a ___ in the garden. (Hund)“ | **dog** | Abruf im vertrauten Satz, zusätzliche Leselast bewusst erfasst |

Diese sechs Schritte zeigen eine Familie. Sie sind kein geschlossenes Jahrescurriculum. Das Wort „Hund“ dient nur zur eindeutigen Demonstration des Formats; Martins echte Quellen werden nicht durch dieses Beispiel ersetzt. Ein noch unbekanntes Wort kann zuerst mit Bedeutung und Aussprache vorgestellt werden. Wenn Aussprache benutzt wird, wird vorhandenes freigegebenes Audio genutzt oder ein separater Erstellungsauftrag notwendig; dieses Buch erzeugt keine Audiodateien.

### 9.3 Mehrere richtige Übersetzungen

Bei „Fahrrad“ sind je nach Aufgabenvertrag „bike“ und „bicycle“ gültig. Ein Test, der nur eines verlangt, muss dies durch Kontext oder expliziten Wortschatzbezug begründen. Die Lösung enthält eine Menge zulässiger Varianten mit Sprache und gegebenenfalls regionalem Standard. Britische und amerikanische Varianten werden nicht zufällig gegeneinander als Fehler ausgespielt.

Groß-/Kleinschreibung, Leerraum, Apostrophe, Bindestriche und Diakritika werden fachlich normalisiert. „London“ ist als Eigenname ein anderer Fall als ein kleingeschriebenes gewöhnliches Nomen. „Ich wollte nur Bedeutung üben“ und „Ich übe exakt die Schreibweise“ sind unterschiedliche Profile. Ein toleranter Modus kann einen orthografischen Hinweis geben, ohne die Bedeutungsantwort als vollständig falsch auszugeben. Ein strenger Schreibmodus erklärt seine Erwartung vor dem Start.

### 9.4 Distraktoren und Wiederholung

Gute Distraktoren sind im jeweiligen Kontext eindeutig falsch und unterstützen die gewünschte Unterscheidung. Zwei Synonyme als konkurrierende Optionen erzeugen einen schlechten Schlüssel. Ein Wort, das im gegebenen Satz eine zweite richtige Lesart besitzt, wird nicht als Falle eingesetzt. Distraktoren werden als Teil der Aufgabenqualität geprüft, nicht als beliebiges Füllmaterial.

Wiederholung kann den Abruf über Sitzungen unterstützen. Für die erste Umsetzung genügt ein bescheidener privater Verlauf: zuletzt gesehen, richtig/falsch, mit Hilfe, nächste empfohlene Wiederholung. Eine einzelne richtige Multiple-Choiceantwort belegt noch keinen sicheren freien Abruf. Der Verlauf unterscheidet deshalb die Antwortform. Ein späterer adaptiver Scheduler ist ein eigener begrenzter Schritt und benötigt eine passende Lernprüfung.

## 10. Wissensreise: fortlaufend üben ohne falsches Unendlichversprechen

### 10.1 Die Quelle bestimmt das Lernziel, nicht das Rundenende

Eine Lernrunde kann mehr Aufgabenbearbeitungen enthalten als der Ausgangstest Quellaufgaben besitzt. Das bedeutet nicht, dass aus zwei Fakten beliebig viele neue Fakten entstehen. Ein sinnvoller Vorrat kann Originalaufgaben, fachlich ähnliche Varianten, verschiedene zulässige Abrufrichtungen, geeignete Formatwechsel und ehrliche Wiederholung kombinieren. Jede dieser Kategorien wird intern unterscheidbar gehalten und bei Bedarf verständlich erklärt.

Wissensreise kennt in der geprüften Fassung bereits einen begrenzten generischen Variantenweg: maximal drei Puffer mit jeweils zwölf Varianten pro Freigabe, Quoten-/Usagebindung, Deduplizierung und transparente Wiederholung bei Kappe oder Ausfall. Dieser Iststand wird durch den Plan nicht auf „unbegrenzt“ hochgeschrieben. Ein zukünftiges dauerabhängiges Budget wäre ein eigener zu prüfender Vertragswechsel.

### 10.2 Was fünf Minuten mengenmäßig bedeuten können

Für eine Planungsrechnung werden 300 Sekunden und angenommene 2 bis 6 Sekunden pro sehr kurzer Aufgabe verwendet. Daraus ergeben sich rechnerisch etwa 50 bis 150 Bearbeitungen. Dies ist **keine gemessene GradeCrew-Geschwindigkeit** und kein Solltempo für Lernende. Erklärungen, Hilfen, längere Texte und Pausen verringern die Zahl erheblich. Bei 10 bis 30 Sekunden pro Aufgabe wären es etwa 10 bis 30 Bearbeitungen.

Ein Vorrat mit 36 generischen Varianten kann deshalb nicht in jedem zulässigen fünfminütigen Kurzaufgabenszenario nur neue Aufgaben garantieren. Die Produktzusage lautet: „Du kannst bis zum Zeitende weiterüben. Bei Bedarf wiederholst du Aufgaben.“ Für geeignete Mathematikfamilien kann ein deterministisch geprüfter Generator viele passende Parameterkombinationen bereitstellen. Für zwei historische Fakten werden stattdessen begrenzte Abrufvarianten und Wiederholung angeboten; keine erfundenen Zusatzinformationen.

| Versorgungstyp | Was er leisten kann | Was er nicht verspricht |
|---|---|---|
| Originalvorrat | Verlässlicher Zugriff auf geeignete freigegebene Quellaufgaben | Neue Inhalte außerhalb der Quelle |
| Geprüfte Parametrik | Viele Aufgaben einer passenden mathematischen Familie | Beliebige Sachtexte oder alle Testformate automatisch variieren |
| Begrenzte generische Varianten | Fachlich geprüfte ähnliche Aufgaben im vorhandenen Budget | Unbegrenzte Neuheit oder garantierte Providerverfügbarkeit |
| Ehrliche Wiederholung | Fortlaufendes Üben bis zum Zeitende ohne zusätzliche Generierung | Jeder Durchgang sei neu oder belege neue Kompetenz |

Eine Reserve wird später anhand echter Antwortzeiten je Aufgabenfamilie dimensioniert. Ein Vorschlag für den Referenzabschnitt ist: Vor Start mindestens ein sicherer Original-/Parameterpfad, ein definierter niedriger Vorratsschwellwert und ein bereits funktionierender Wiederholungsfallback. Eine feste Reserve von beispielsweise 20% wäre nur eine zu prüfende Betriebsannahme; sie wird nicht als bestehende Implementierung oder wissenschaftliche Zahl ausgegeben.

### 10.3 Nachfüllen ohne Modellaufruf pro Antwort

Die Sitzung liest Aufgaben aus einem vorgeprüften Vorrat. Ein niedriger Vorrat kann genau einen idempotenten Nachfüllauftrag für dieselbe Quellrevision, Profilversion und Freigabe auslösen. Mehrere Browserantworten erzeugen keine mehrfachen parallelen Reservierungen. Bereits laufende Aufträge werden anhand ihrer Kennung weiterbeobachtet; ein unklarer Providerstatus wird nicht blind neu gestartet.

Eine neue Variante durchläuft Schlüsselprüfung, Formatprüfung, Quellen-/Lernzielbindung und Deduplizierung, bevor sie spielbar wird. Fällt eine Prüfung durch, bleibt der vorhandene Vorrat unverändert. Der Nutzertext lautet: „Neue Varianten sind gerade nicht verfügbar. Du kannst mit bekannten Aufgaben weiterüben.“ Die Fehlerursache wird intern begrenzt und datensparsam diagnostizierbar, ohne private Inhalte an einen öffentlichen Fehlerkanal zu senden.

### 10.4 Zeitende, Antwortabgabe und Wiederaufnahme

Die serverseitig maßgebliche Zeitregel entscheidet, welche Antwort noch zur Runde gehört. Eine nach Ablauf abgesendete Antwort erzeugt keine nachträglichen Spielpunkte. Die offene Aufgabe kann mit einem neutralen Hinweis beendet werden: „Die Zeit ist um. Diese Aufgabe zählt nicht mehr zur Runde.“ Ein Lernmodus kann anschließend eine unbewertete Erklärung anbieten, wenn der vorhandene Freigabevertrag dies zulässt.

Die Wiederaufnahme verwendet dieselbe Sitzung und denselben bestätigten Fortschritt. Ein Reload startet weder einen neuen Variantenpuffer noch eine neue Frist. Ein vorhandener Nachfüllauftrag bleibt an seine Kennung gebunden. Bereits bestätigte Antwortwirkungen treten genau einmal ein; Transportwiederholungen sind zulässig. „Genau einmal“ meint die fachliche Wirkung, nicht die unrealistische Behauptung, Netzwerkpakete würden niemals mehrfach gesendet.

## 11. Aufgabenprofile, Hilfen und Jahrgangsbezug

### 11.1 Ein Profil ist mehr als eine Schwierigkeitszahl

Jede freizugebende Aufgabenfamilie bekommt einen kurzen fachlichen Steckbrief. Er enthält Zielhandlung, Voraussetzungen, bekannte Fehlvorstellungen, zulässige Formate, Lösungskontrakt, Parametergrenzen, Hilfen, Quellen und Prüfstatus. Ein Profil kann mehrere kleine Lernschritte besitzen. Die sechs Demonstrationsschritte in diesem Buch sind keine neue globale Sechsstufenskala; das konkrete Profil darf fünf Schritte und eine zusätzliche Brücke besitzen, wenn dies fachlich besser passt.

Die sichtbaren Namen lauten beispielsweise „Ankommen“, „Sicher werden“, „Mit kleiner Brücke“, „Selbständig anwenden“, „Übertragen“. Namen dienen der Orientierung. Unter jedem steht eine konkrete Anforderung. Ein starres gleiches Etikett ohne Inhalt wäre genauso unklar wie das bisherige Level. Für ältere Jugendliche bleiben Themen und Gestaltung altersangemessen, auch wenn sie eine grundlegende Operation wiederholen.

### 11.2 Fachliche Hilfe als abgestufte Unterstützung

Die erste Hilfe erinnert an eine passende Strategie. Die zweite zeigt einen Teilschritt. Die dritte kann einen gerechneten beziehungsweise analysierten Lösungsweg zeigen, gefolgt von einer ähnlichen eigenen Aufgabe. Die Reihenfolge wird pro Familie geprüft. Nicht jedes Item braucht drei Hilfestufen. Ein schwierigerer Hinweistext darf das ursprüngliche Problem nicht durch zusätzliche Leselast vergrößern.

Bei 8 + 7 lautet eine erste Hilfe „Wie viel fehlt von 8 bis 10?“. Danach „Zerlege 7 in 2 und 5“. Erst dann folgt „8 + 2 + 5 = 15“. Bei einem Dativobjekt ist eine Frageprobe nützlicher als ein Rechenbeispiel. Bei einer Vokabel kann der Wortanfang helfen, während eine bloße Wiederholung der deutschen Frage keinen Mehrwert hat. Hilfen werden deshalb fachlich verfasst, nicht aus einem gemeinsamen generischen Lob-/Tipptext gezogen.

### 11.3 Mittelschule Bayern, Klassen 5 bis 10

Die folgende Matrix ist ein **Planungsraster für Quellen- und Profilprüfung**, keine vollständig ausgewertete amtliche Kompetenzliste. Sie beschreibt, welche Art von Einstieg der Rahmen über die sechs Jahrgänge unterstützen muss. Konkrete Lehrplananker und schulwegspezifische Zuordnungen werden im vorhandenen Lehrplanprojekt verifiziert. Gerade für Klasse 10 ist der Bildungsgang explizit zu führen.

| Jahrgang / Schulweg | Mathematik: Profilgruppen zur Prüfung | Deutsch: getrennte Profilgruppen | Englisch: getrennte Profilgruppen | Verbindliche Grenze |
|---|---|---|---|---|
| 5 | Natürliche Zahlen, anschauliche ganze Zahlen, Darstellungswechsel | Wortarten, Satzgliedproben, Rechtschreibstrategien | Vertraute Themen, Basiswortschatz, einfache Wendungen | Jahreserwartung ist kein Einstiegsniveau |
| 6 Regelklasse / vorhandene Wege | Rechenverfahren, Bruch-/Dezimalvoraussetzungen gezielt prüfen | Sprachuntersuchung und kontextgebundene Anwendung getrennt | Wortschatzabruf und einfache produktive Kontexte | Keine pauschale Freigabe aus einem Klasse-5-Anker |
| 7 Regelklasse / M-Zug getrennt | Zahlbereiche, Terme und angewandte Familien nach Originalquelle | Grammatik, Text-/Sprachreflexion nicht nur Fehlersuche | Wortschatz, Wendungen, Schreib-/Leselast getrennt | Schulweg als Originalangabe erhalten |
| 8 Regelklasse / M-Zug getrennt | Mehrschrittige Verfahren und Anwendungen mit Vorwissensbrücken | Komplexere Strukturen nur mit expliziten Voraussetzungen | Kontext- und Formanforderung einzeln staffeln | Größere Zahlen ersetzen keine neue Kompetenz |
| 9 Regelklasse / M-Zug / Quali-Bezug | Prüfungsnahe Familien nur bei passender Quellen-/Formatprüfung | Aufgabenauftrag und geforderte Analyse exakt erhalten | Sprachmittlung-/Textanforderungen nicht auf Vokabelwahl reduzieren | Quali-Bezug nicht mit M-Zug oder beliebigem Quiz gleichsetzen |
| 10 konkreter Bildungsgang, insbesondere M10 | Unter anderem Potenzen/Wurzeln, Funktionen, Ähnlichkeit/Trigonometrie nur mit verifiziertem Anker | Jahrgangs- und schulwegspezifische Kompetenzen separat prüfen | Quellengeprüfte produktive Sprachziele und Wortschatz | Kein allgemeiner „Klasse 10“-Vollkatalog aus bestehenden Themen 5–9 ableiten |

Die Klasse-10-Beispiele der aktuellen Quellenprüfung belegen, warum eine bloße Ausweitung der Grundrechenzahlen kein ausreichender höherer Lernbereich ist. Ein Binomikprofil ist eigenständig. Eine Potenzfamilie mit negativen Exponenten benötigt andere Voraussetzungen als Addition bis 100. Für noch nicht ausgewertete Bereiche zeigt Advanced „Zuordnung noch in Prüfung“ statt eine amtliche Sicherheit vorzutäuschen.

### 11.4 Kontexttreue und Transfer

Eine ähnliche Aufgabe soll dieselbe Zielhandlung üben und die ursprüngliche Stoffgrenze respektieren. Ein Transferbeispiel verändert bewusst Kontext oder Darstellung und wird als solcher Lernschritt markiert. Zufällige Textvariation ist kein Transferbeleg. Eine Rechenaufgabe wird nicht allein durch einen Tiernamen in eine pädagogisch neue Sachaufgabe verwandelt.

Die Fachprüfung vergleicht Original und Variante entlang derselben Merkmale. Bei Mengenaufgaben bleiben Einheiten, Rundung und Realitätsbedingungen erhalten. Bei Deutsch bleiben sprachliche Eindeutigkeit und analysierte Ebene erhalten. Bei Englisch bleiben Kontext und akzeptierte Bedeutungen erhalten. Ein Algorithmus darf nur die Familien automatisch freigeben, für die diese Prüfung tatsächlich operationalisiert wurde.

## 12. Anpassung, privater Fortschritt und faire Rückmeldung

### 12.1 Vorsichtige Anpassung statt Fähigkeitsetikett

Die Anpassung gilt pro geprüfter Kompetenzfamilie und ursprünglichem Lernziel. Heterogene Fragen eines Tests ergeben keine gemeinsame globale Auf-/Abstiegsleiter. Die empfohlene Startlogik ist transparent: Nach wiederholten Schwierigkeiten bietet das Spiel Hilfe oder eine leichtere Schwesteraufgabe an. Nach mehreren selbständig richtigen Antworten aus verschiedenen Varianten bietet es einen kleinen nächsten Schritt an. Die Person kann im Übungsmodus zurückkehren. Die Lehrkraft kann ein Profil bewusst festlegen. Im Klassenwettbewerb werden Anforderungen nicht mitten in einem Vergleich unbemerkt verändert.

Ein später zu prüfender Regelvorschlag lautet: Zwei aufeinanderfolgende Fehler derselben Familie lösen ein Hilfeangebot aus; acht von zehn selbständig richtigen Erstversuchen aus mindestens zwei passenden Variantenformen erlauben einen Vorschlag zum nächsten Schritt. Diese Zahlen sind **Planannahmen**, keine Forschungsbefunde und keine Kompetenzdiagnose. Drei Treffer ergeben weder „100% beherrscht“ noch eine pauschale Einstufung der Person.

### 12.2 Was gespeichert werden muss und was nicht

Ein minimaler Verlauf kann Profilversion, bearbeitete Aufgabenfamilie, Erstversuch, Hilfe, Wiederholung und aktiven Zeitraum erfassen. Rohgespräche mit Remy oder freie private Testtexte werden nicht in einen allgemeinen Lernpool übernommen. Ein Spielverlauf bleibt im bestehenden zulässigen Rollen-/Speichervertrag privat. Für Klassenauswertungen ist vor Umsetzung festzulegen, welche aggregierten Angaben für den pädagogischen Zweck tatsächlich erforderlich sind.

Langsam und richtig ist kein Wissensfehler. Ein Gerät mit unpassender Tastatur kann Eingabezeit verlängern. Lesen, motorische Bedienung, Hintergrundpause und Hilfe können die Zeit beeinflussen. Die Anpassung darf deshalb nicht allein aus Reaktionszeit auf fachliches Können schließen. Der Plan enthält keine Diagnosen zu Lernbehinderung, Intelligenz oder Gesundheit.

### 12.3 Rückblick ohne irreführende Kompetenzprozente

Der Abschluss nennt konkrete Aktivität: „Du hast heute gleichnamige Brüche und einen gemeinsamen Nenner geübt.“ Darunter können „12 Aufgaben bearbeitet“, „8 im ersten Versuch richtig“, „3 mit Hilfe gelöst“ stehen, wenn die Zählregeln eindeutig sind. Wiederholungen werden als solche gezählt. Ein einzelner großer Fortschrittskreis mit „Du kannst Brüche zu 93%“ ist nicht vorgesehen.

Ein nächster Schritt lautet „Noch einmal mit anderen Zahlen üben“ oder „Gemeinsamen Nenner ohne Hilfstabelle probieren“. Die Lernperson entscheidet im Solomodus. Für eine lehrkraftgesetzte Runde kann der Abschluss auf den vorgegebenen Folgeschritt verweisen. Schulnoten, Prüfungsergebnisse und Spielpunkte bleiben getrennte Verträge.

### 12.4 Lernen prüfen statt nur Nutzung zählen

Für einen späteren Lernnachweis braucht es neue Parallelaufgaben, einen zeitlichen Abstand und geeignete Transferaufgaben. Ein unmittelbarer Retry mit gleicher Optionsposition kann nur Wiedererkennen der Anzeige zeigen. Eine hohe Aufgabenanzahl kann mit oberflächlichem Klicken entstehen. Die formative Produktprüfung betrachtet deshalb Vorgehen, Erklärung, Hilfenutzung und neue passende Aufgaben.

Eine frühe Probe mit beispielsweise fünf bis acht Personen pro relevanter Zielgruppe kann grobe Bedienprobleme finden. Sie ist keine repräsentative Wirksamkeitsstudie und kein Beleg für die Eignung aller Klassen 5 bis 10. Der Plan schlägt einen kleinen Beginn und danach gezielte Erweiterung vor, statt aus einer Testperson eine ganze Population abzuleiten.

## 13. Klassenmodus, Board, Code und QR

### 13.1 Bestehende Verträge zuerst

Die vorhandenen Klassenwege sind wertvolle Produktverträge. Vor einer Umsetzung werden tatsächliche Sessionerzeugung, Codebeitritt, Boardprojektion, QRvorrang, Start-/Stoppzustände und Lehrer-/Schülerrechte auf dem gewählten Integrationsstand gelesen. Ein neues Startblatt baut keine zweite Plattform für dieselbe Klassenrunde. Die technische Quelle bleibt das jeweilige bestehende Spielbackend, bis ein bewusst geprüfter gemeinsamer Adapter freigegeben ist.

Die Lehrkraft sieht „Runde vorbereiten“, wählt Quelle und Regeln, prüft die Zusammenfassung und öffnet die Lobby. Lernende sehen einen Beitrittsweg mit Code oder QR. Ein QRlink enthält die nötige autorisierte Sessionreferenz, keine Lösung oder private Testquelle. Ein Code wird gut lesbar und kopierbar dargestellt. Der Code darf nicht durch dekorative CSS verborgen werden.

### 13.2 Lobby und Lehreraktionen

Die Lobby zeigt Titel, Fachkontext, Dauer, Teilnehmerzahl und den aktuellen Zustand. Die Lehrkraft kann die Runde nach bestehendem Vertrag starten und beenden. Ein leeres Board sagt „Noch niemand beigetreten“. Ein Verbindungsproblem unterscheidet sich sichtbar von einer leeren Gruppe. Ein gestoppter Einstieg sagt „Die Runde ist bereits beendet. Frage deine Lehrkraft nach einer neuen Runde.“

Eine Änderung der Regeln nach Veröffentlichung ist nur erlaubt, wenn der bestehende unveränderliche Sessionvertrag sie vorsieht. Andernfalls wird eine neue Runde erstellt. Ein lokaler Schülerparameter darf die veröffentlichte Dauer, Aufgabenfamilie oder Freigabe nicht überschreiben. Lehrkraftvorschau und Schülerprojektion werden getrennt geprüft.

### 13.3 Vergleich und Lernmodus

Ein gemeinsamer Wettbewerb setzt vergleichbare Aufgabenbedingungen voraus. Adaptive Erleichterung für einzelne Personen kann pädagogisch sinnvoll sein, macht aber einen Ranglistenvergleich erklärungsbedürftig. Für den ersten Referenzabschnitt empfiehlt der Plan deshalb Sololernen beziehungsweise einen gemeinsamen Lernmodus ohne versteckte adaptive Ranglistenlogik. Bestehende Spielboards dürfen in ihrem freigegebenen Umfang erhalten bleiben.

Die Wissensreise übernimmt keine Punkte oder manuelle Bewertung allein wegen eines gemeinsamen Boards. Dort kann die Lehrkraft den Durchführungsstatus sehen, sofern dies vom bestehenden Datenschutz-/Rollenkontrakt gedeckt ist. „Anwesend“, „begonnen“ und „beendet“ sind andere Informationen als vollständige einzelne Antwortdaten. Der notwendige pädagogische Zweck bestimmt den Umfang.

### 13.4 Wiederbeitritt und gemeinsame Geräte

Ein Wiederbeitritt findet dieselbe aktive Runde. Er erzeugt nicht unbemerkt zwei Teilnehmer oder zwei Antwortwirkungen. Ein ausgeloggtes oder gemeinsam genutztes Gerät zeigt keine private vorherige Lernquelle. „Dieses Gerät wechseln“ erklärt den vorgesehenen Weg. Der Plan fordert keine neue dauerhafte persönliche Kennung für einen einfachen anonymen Codebeitritt, wenn der bestehende Vertrag diese nicht benötigt.

Die spätere Geräteprüfung umfasst Kamera-/QRöffnung, manuelle Codeeingabe, Bildschirmwechsel zur Boardansicht, Hintergrund und Wiederaufnahme sowie einen realistischen Klassensatz. Ein simulierter Server und 30 künstliche Browserfenster ersetzen keine belegte Probe mit tatsächlichen Zielgeräten und dem vorgesehenen Backend.

## 14. Gestaltung, Layout und verbindliche Textbedeutungen

### 14.1 Die gemeinsame Bildsprache

Der Entwurf verwendet das vorhandene GradeCrew-Markenzeichen und die belegten Brandtokens. Ein neues Fantasielogo wäre für diesen Auftrag unnötig. Herkunft, Rechte und tatsächliche Quelldatei stehen im Designhandoff. Ein attraktives Buch und attraktive Oberflächen helfen beim Verstehen; sie ersetzen keine fachliche oder technische Abnahme.

Die Startseite zeigt vier klar erkennbare Spielkarten. Jede hat genau eine primäre Aktion „Spiel auswählen“. Die erweiterte Konfiguration erscheint erst im ausgewählten Spiel. Damit konkurrieren im Hub nicht acht gleichgewichtige Start-/Advancedbuttons. Fachfarbe und Icon erleichtern Orientierung, während Beschriftung und Struktur die Bedeutung auch ohne Farberkennung vermitteln.

Auf dem Startblatt stehen Inhalt, Dauer und empfohlener Einstieg in einer ruhigen vertikalen Reihenfolge. Die erweiterte Auswahl bleibt einklappbar. Das Spielbild nutzt große klare Aufgabenflächen und gut treffbare Antworten. Lehrplanherkunft, Diagnosewerte und Debugkennungen werden nicht als dekorative Schülertexte eingeblendet. Technische Details erscheinen dort, wo Lehrkräfte oder Reviewer sie tatsächlich benötigen.

### 14.2 Zwölf Konzeptansichten

| Ansicht | Zweck und zu prüfende Aussage |
|---|---|
| 1 Games Hub | Vier eigenständige Spiele, jeweils eine primäre Auswahlaktion |
| 2 Einfach starten | Wenige Angaben, fünf Minuten sichtbar, ein verständlicher Primärweg |
| 3 Remy und Testquelle | Bekannte Quelle übernehmen, keine erneute Pflichtbefragung |
| 4 Genau auswählen | Mittelschule Bayern, Klasse und Originalschulweg mit überprüfbarem Quellenstatus |
| 5 Schwierigkeit | Konkrete Anforderungen und Brücken, keine pauschale Klassenbewertung |
| 6 Klassenlobby / QR | Lesbarer Code, bestehendes Board, eindeutige Lehreraktion |
| 7 Mathematik auf schmalem Bildschirm | Aufgabe, Antwort, Hilfe und Pause bleiben bedienbar |
| 8 Rückblick | Konkrete Aktivität und nächster Schritt, keine erfundene Kompetenzprozentzahl |
| 9 Material-/Fehlerzustände | Ehrliche Grenzen, Wiederholen möglich, kein unpassender Themenwechsel |
| 10 Wissensreise | Fortlaufende Runde; keine manuelle Antwortbewertung |
| 11 Fehlerjagd Deutsch | Klare Wortmarkierung und fachlich passender Auftrag |
| 12 Vocab Rush | Freier Abruf, verständliche Hilfe und akzeptierte Sprachvarianten |

Die Bilder erläutern die Spezifikation. Sie sind keine Abnahme heutiger Runtimepixel und keine Garantie, dass alle dargestellten Bedienelemente bereits existieren. Jede spätere Umsetzung wird gegen tatsächliche Screens auf den festgelegten Zielgeräten verglichen. Der Designatlas darf bei einem Änderungswunsch überarbeitet werden, ohne dass daraus ein neuer Runtimeauftrag entsteht.

### 14.3 Wörter mit stabiler Bedeutung

| Begriff | Verbindliche Bedeutung im Vorschlag | Beispieltext |
|---|---|---|
| Lernmodus | Art der Begleitung und des Feedbacks | „Geführt lernen“ / „Selbständig üben“ |
| Dauer | Zeitregel der Sitzung | „5 Minuten“ / „Ohne Zeitlimit“ |
| Niveau | Fachlich beschriebenes Aufgabenprofil | „Gleiche Nenner“ |
| Quelle | Ausgangspunkt des Inhalts | „Aus deinem Test“ |
| Übungsart | Fachlich geeignete Handlung | „Brüche addieren“ |
| Antwortformat | Konkrete Eingabe | „Zahl eingeben“ / „Wörter markieren“ |
| Spielpunkte | Spielregel des jeweiligen Spiels | „120 Spielpunkte“; keine Schulnote |

„Frei“ wird nicht zugleich für einen Lernmodus und für Dauer null verwendet. Insbesondere lautet die Zusammenfassung von Dauer null „Ohne Zeitlimit“. Ein geführter Lernmodus kann sehr wohl ohne Zeitlimit stattfinden. Diese kleine Textregel verhindert eine bekannte Mehrdeutigkeit der heutigen Wissensreisezusammenfassung.

### 14.4 Bedienbarkeit und Wahrnehmbarkeit

Tastaturfokus bleibt sichtbar, die Reihenfolge entspricht der visuellen Reihenfolge und Modale geben den Fokus verlässlich zurück. Aufgabenaufträge und Fehlermeldungen werden textlich vermittelt. Touchziele werden im realen Layout auf Zielgeräten geprüft; eine SVGzeichnung beweist keine Zielgröße im Browser. Bewegung ist reduziert beziehungsweise abschaltbar, soweit sie nicht zur Aufgabe gehört. Audio ist ergänzend und darf keine stumme Nutzung ausschließen.

Zeitbegrenzungen benötigen einen bewusst geprüften Weg für Anpassung, Pause oder eine fachlich begründete Ausnahme im jeweiligen Modus. Fünf Minuten sind eine Sitzungsauswahl, keine versteckte Zwei-Sekunden-Frist je Aufgabe. Eine einfache Aufgabe mit sehr kurzer Deadline kann subjektiv und praktisch anspruchsvoller werden als eine komplexere Aufgabe mit Zeit und Hilfe. Zeitdruck wird deshalb weder als Kompetenz noch als Niveau verschleiert.

## 15. Datenmodelle, Adapter und öffentliche Projektion

### 15.1 Vorgeschlagene gemeinsame Grenzen

Das Datenmodell dieses Kapitels ist ein Entwurf für spätere Vertragsanpassung, kein behauptetes vorhandenes API. Bestehende Feldnamen und Endpunkte werden beim Implementierungsauftrag zuerst abgeglichen. Die fachliche Trennung ist dennoch verbindlich prüfbar: Quelle, Profil, Spielregel, Aufgabe, Sitzung, Versuch und Veröffentlichung besitzen unterschiedliche Verantwortung.

| Objekt | Wesentliche Felder im Vorschlag | Aufgabe |
|---|---|---|
| SourceRef | kind, sourceId, revision, ownerScope | Unveränderliche berechtigte Quelle referenzieren |
| CurriculumRef | region, originalSchoolTrack, grade, subject, version, competencyId, provenance, verificationStatus | Lehrplanbezug ohne falsche Vollständigkeit |
| TaskProfile | id, version, prerequisites, dimensions, parameterRules, helpSteps, allowedFormats | Fachliche Anforderungen beschreiben |
| RoundConfig | gameId, sourceRef, profileRef, durationSeconds, learningMode, classRuleRef | Bestätigte Sitzungseinstellungen |
| PublicTask | taskId, revision, prompt, publicMedia, responseSchema, allowedHelp | Nur für Lernende freigegebenen Auftrag zeigen |
| PrivateTaskKey | taskId, keyVersion, acceptedAnswers, validationPolicy | Serverseitige Prüfung, niemals öffentlich projizieren |
| Attempt | attemptId, sessionId, taskId, answer, idempotencyKey | Eine fachliche Antwortwirkung absichern |
| LearningSession | id, configRevision, state, currentTaskId, deadlinePolicy, confirmedSequence | Wiederaufnahme und Abschluss ermöglichen |
| VariantBatch | requestId, sourceRevision, profileVersion, budgetReservation, state, acceptedTaskIds | Begrenztes Nachfüllen nachvollziehen |

Die tatsächliche Speicherung kann vorhandene Collections und Services nutzen. Das Objektmodell verlangt keine neue Sammlung für jede Tabellenzeile. Es soll gerade verhindern, dass Quellenmetadaten und private Schlüssel in einem bequemen öffentlichen Gesamtobjekt landen.

### 15.2 Beispiel einer bestätigten Konfiguration

Ein lesbares fachliches Beispiel: Spiel `fastQuiz`; Quelle `ownTest` mit stabiler Revision; Profil `fraction-add-related-denominators` in Version 1; 300 Sekunden; Modus `guided`; keine Itemdeadline; Hilfen erlaubt; Lehrplanbezug optional. Diese Konfiguration erhält vor dem Start eine serverseitig oder im bestehenden sicheren Vertragsweg bestätigte Revision. Ein QRbeitritt verweist auf die freigegebene Konfiguration, statt alle privaten Daten in den Link zu schreiben.

Für die APIvorlage wäre ein JSONobjekt mit diesen Feldern geeignet. Vor einem Bauauftrag wird es mit den heutigen Services verglichen und entweder als Adapter gemappt oder bewusst als Versionserweiterung umgesetzt. Gleiche Semantik ist wichtiger als identische Schreibweise. Ein bereits existierender sauberer Vertrag wird nicht allein für eine neue Namenskonvention migriert.

### 15.3 Adapterausgänge und Fehlercodes

Jeder Quelladapter liefert geeignete Aufgabenreferenzen, Coverage, ausgeschlossene Gründe, unterstützte Formate und eine stabile Quellrevision. Ein Themenadapter darf nur aus tatsächlich passenden Profilen wählen. Ein Lehrplanadapter erhält den Quellenstatus. Ein Testadapter prüft Eigentum, Revision, aktive Prüfungsgrenzen und Medien. Ein Remyursprung wird nach dem Speichern wie jede andere berechtigte Quelle behandelt.

Vorgeschlagene fachliche Fehlerklassen sind `SOURCE_CHANGED`, `NO_COMPATIBLE_TASKS`, `MEDIA_UNSUPPORTED`, `KEY_UNRELIABLE`, `BUDGET_UNAVAILABLE`, `SESSION_CLOSED` und `RETRY_PENDING`. Der Nutzer sieht übersetzte natürliche Texte. Ein Fehlercode ist kein Schülerdialog. Der technische Code hilft, echte Fehlersituationen reproduzierbar zu prüfen, ohne sensible Inhalte in Logs zu speichern.

### 15.4 Öffentliche Aufgabe und private Lösung

Die öffentliche Projektion enthält den Auftrag und das zulässige Antwortschema. Schlüssel, nicht freigegebene Erläuterungen, private Originaltexte und Providerpromptdaten bleiben serverseitig beziehungsweise owner-only. Hilfen können ebenfalls eine Freigabestufe besitzen, wenn sie Teile der Lösung enthalten. Der bestehende Lösungsaudio-/Assessmentvertrag ist vor einer späteren Medienintegration gesondert zu prüfen.

Ein automatischer Clientvergleich mit vollständig ausgeliefertem Goldkey ist keine zulässige Abkürzung, wenn der vorhandene Spiel-/Assessmentvertrag serverseitige Schlüssel verlangt. Ebenso wenig darf eine neue Spieleinstellung die Sperre aktiver Prüfungsquellen umgehen. Die neue UX erhält Schutzgrenzen und erklärt sie verständlicher; sie nimmt sie nicht zurück.

### 15.5 Revision und Kompatibilität

Eine Änderung am Ausgangstest kann eine bestehende Lernkopie ungültig machen. Der Text lautet „Der Test wurde geändert. Bereite das Training erneut vor und prüfe es.“ Eine neue Sourceprojektion kann ebenfalls eine bewusste Neuvorbereitung benötigen, wie die Wissensreisehistorie zeigt. Das System regeneriert oder veröffentlicht nicht automatisch, nur damit der Einstieg kurz bleibt.

Gespeicherte Sessions verwenden eine Schema-/Profilversion. Eine Migration erhält ursprüngliche Quelle, Antwortstatus und Kostenhistorie. Kann eine alte Session nicht sicher fortgesetzt werden, wird sie kontrolliert abgeschlossen und ein neuer Start angeboten. Der Plan erlaubt kein lautloses Zurücksetzen von Versuchszählern oder Budgets.

## 16. Kosten, Inhaltsqualität, Fehler und Sicherung

### 16.1 Kosten sichtbar begrenzen

Die Versorgung verwendet den vorhandenen quotagebundenen Weg. Kosten werden vor einem zulässigen Auftrag reserviert und nach dem tatsächlichen Ergebnis abgerechnet beziehungsweise freigegeben. Eine Antwort auf „Weiter“ ist kein Auftrag für eine neue kostenpflichtige Modellgenerierung. Wiederholung und geeignete Parametrik bilden einen unabhängigen sicheren Fortsetzungsweg.

Ein Cache wird nach Quelle, Revision, Profil, Sprache, Freigabe und gegebenenfalls Besitzergrenze getrennt. Private Nutzerquellen wandern nicht in einen allgemeinen Cache. Eine neue dauerabhängige Budgetpolitik muss Kosten, maximale Varianten, Aufbewahrung und Abusegrenzen gemeinsam prüfen. Die heutige Grenze von drei mal zwölf Varianten wird nicht ohne gesonderte Entscheidung ausgeweitet.

### 16.2 Qualitätsgates für Aufgaben

Ein freizugebendes Item braucht einen eindeutigen Auftrag, einen zuverlässigen Schlüssel, passende Voraussetzungen, vertretbare sprachliche Last, zulässige Medien und eine nachvollziehbare Quelle. Ein Variantensatz braucht zusätzlich Deduplizierung und Abdeckung der tatsächlichen Ausgangslernziele. Ein bestandener Build belegt davon nur technische Auslieferbarkeit, nicht Fachqualität.

Fachliche Reviewer prüfen repräsentative Randfälle: Ergebnis null, Nennerbeziehungen, negative Werte, mehrteilige Satzglieder, mehrere gültige Übersetzungen und Medienabhängigkeit. Eine generierte Erklärung wird ebenso geprüft wie die Antwort. Falsche Hinweise können schlechter sein als ein klarer Hinweis „Für diese Aufgabe gibt es noch keine geprüfte Erklärung“.

### 16.3 Fehlertexte und Wiederherstellung

| Situation | Nutzertext | Sicherer nächster Zustand |
|---|---|---|
| Keine passende Quelle | „Für diese Auswahl fehlen passende Aufgaben.“ | Auswahl ändern oder bewusst erweitern |
| Neue Varianten gescheitert | „Du übst mit bekannten Aufgaben weiter.“ | Vorrat / Wiederholung, laufende Kennung erhalten |
| Quelle geändert | „Der Test wurde geändert. Prüfe das Training erneut.“ | Private Neuvorbereitung, keine automatische Veröffentlichung |
| Netzwerk unterbrochen | „Die Verbindung ist unterbrochen. Dein letzter bestätigter Stand bleibt erhalten.“ | Bestehende Sitzung wieder aufnehmen |
| Antwortstatus unklar | „Wir prüfen, ob deine Antwort angekommen ist.“ | Derselbe Idempotenzschlüssel, kein doppelter Versuch |
| Runde beendet | „Diese Runde ist beendet.“ | Rückblick, kontrollierter neuer Start |

### 16.4 Enger Assuranceumfang

Für die Dokumentation werden relevante Risiken beschrieben, keine Produktkontrollen pauschal auf erfüllt gesetzt. Technisch betroffen sind Rollen-/Quellzugriff, Schlüsselprojektion, Antwortidempotenz, Quoten und Fehlerdaten. Datenschutz und faire Bedienung betreffen private Quellen, minimale Verlaufsdaten, transparente KIrolle, Zeit- und Eingabezugang sowie nicht stigmatisierende Rückmeldung. Die vorhandenen SEC-/PRIVowner prüfen die konkreten Änderungen im späteren Diff.

Ungeklärte Betreiber-/Schul-/Providerverträge bleiben beim zuständigen fachlichen beziehungsweise qualifizierten Owner. Dieses Buch erteilt keine Rechts- oder Sicherheitszertifizierung. Es führt keinen Vollscan, keinen Kundendatenexport und keine kostenpflichtige Probe aus. Dokumentierte Kontrollen schaffen einen Prüfauftrag, keinen automatisch erfüllten Releasegate.

## 17. Umsetzungsphasen und begrenzte Arbeitspakete

### 17.1 Phase 0: Plan und Bestandsvertrag

Ergebnis ist ein geprüftes Planbuch, der Designatlas und eine kurze Liste bewusst gewählter Produktentscheidungen. Der Owner gleicht aktuelle Branches, PRs, Quellenverträge und offene Arbeiten ab. Ein unabhängiger Review betrachtet insbesondere die Behauptungen zum Bestand, Quellenstatus, fünfminütigen Versorgungspfad und die Trennung von Klasse und Niveau. Martin kann die sichtbaren Entwürfe beurteilen, bevor ein größerer Umbau beginnt.

Abnahme: Keine Runtime-/Deploybehauptung ohne Beleg; alle vier Spiele behandelt; Bayern Mittelschule 5–10 sichtbar; offene Lehrplanbereiche als offen; konkrete Beispiele fachlich konsistent; keine versteckten Provider-/Kostenaufträge. Das aktuelle Dokumentationspaket gehört ausschließlich zu dieser Phase.

### 17.2 Phase 1: Ein echter Referenzabschnitt

Der empfohlene erste Bauauftrag ist eng: Ein vorhandener eigener Mathematiktest wird über das neue Startblatt mit fünf Minuten geöffnet. Ein verifiziertes Profil unterstützt eine kleine geeignete Aufgabenfamilie, vorhandenen Vorrat, Hilfen, Pause, Fortsetzen und Zeitende. Direktbedienung funktioniert vollständig. Remy kann bestätigten Kontext übernehmen, ohne den Start von einem Gespräch abhängig zu machen.

Der Referenzabschnitt enthält eine reale passende Quelle aus Martins autorisiertem Bestand, aber keine gespeicherten privaten Inhalte im Repo. Ein synthetischer Vertragstest deckt die Grenzfälle ab. Der Quelleninhalt bleibt privat. Der Umfang ist kein neuer Themenpilot, der Martins gewählten Test ersetzt. Wenn dessen Inhalt nicht parametrierbar ist, nutzt der Abschnitt den geprüften Original-/Varianten-/Wiederholungsweg.

### 17.3 Phase 2: Gemeinsame Shell und vier Adapter

Nach der Referenzprüfung werden die gemeinsamen Start-, Spiel-, Pause-, Fehler- und Rückblickkomponenten extrahiert beziehungsweise angepasst. Fast Quiz, Fehlerjagd, Vocab Rush und Wissensreise erhalten passende Adapter. Bestehende lokale Funktionen und Spielregeln bleiben erhalten, soweit kein bewusst überprüfter Änderungsauftrag vorliegt.

Die Reihenfolge folgt Abhängigkeiten: Konfigurationssemantik vor allen Screens, Aufgabenprojektion vor neuen Antwortformen, Idempotenz/Resume vor breiter Nutzung, Lehrplanlesevertrag vor Advancedfreigabe. Jeder Adapter erhält einen kleinen vollständigen Flow mit richtigen/falschen Antworten, Hilfe, Unterbrechung und Abschluss. Ein großer gleichzeitiger Merge aller Labbranches ist kein empfohlener Umsetzungsschritt.

### 17.4 Phase 3: Schwierigkeit und Lehrplan gezielt erweitern

Fachowner erstellen geprüfte Profile und Brücken für tatsächlich nachgefragte Familien. Die aktuellen Mehrfachsprünge werden gezielt entkoppelt. Lehrplanzuordnungen kommen aus dem vorhandenen Projekt mit verifizierter Herkunft. Zunächst werden wenige repräsentative Profile pro Fach und schulischem Weg freigegeben, dann anhand der Ergebnisse erweitert. Ein Vollständigkeitsversprechen für Klassen 5–10 ist ein eigener Katalogabschluss mit eigenen Belegen.

Eine erste formative Nutzungsprobe beobachtet den Start und die Schwierigkeitssprünge. Danach wird nur das korrigiert, wofür ein konkreter Befund vorliegt. Größere adaptive Logik wird erst eingeführt, wenn stabile Profile und verständliche Rückmeldungen vorhanden sind. Sonst würde die Anpassung unklare Anforderungen lediglich automatisieren.

### 17.5 Phase 4: Klassenwege und Geräteabnahme

Der gemeinsame Klassenweg wird auf dem vorgesehenen Backend und realen Zielgeräten geprüft. Code, QR, Board, Rollen, Wiederbeitritt und Ende gehören zusammen. Ein Hostingpreview und eine simulierte Serverantwort ersetzen dies nicht. Anschließend erfolgen unabhängige technische und fachliche Deltareviews, exakte CI, bewusstes Integrationsziel und die separat genehmigte Stagingstufe. Production bleibt ausdrücklich freigabepflichtig.

### 17.6 Arbeitspakete für spätere Beauftragung

| Paket | Eindeutiger Owner | Ergebnis | Abhängigkeit / Abschlussbeleg |
|---|---|---|---|
| UX-01 Bestandsvertrag | Produkt-/Integrationsfachchat | Quell-/Rollen-/Sessionmapping | Aktuelle SHAs und bestehende Tests gelesen |
| UX-02 Referenzstart | Webfachchat | Eigener Test → 5-Minuten-Runde | Fachprofil und konkreter Scope genehmigt |
| UX-03 Aufgabenfamilien | Fachowner je Fach | Geprüfte Profile, Lösungen und Hilfen | Unabhängige Inhaltsprüfung |
| UX-04 Shelladapter | Web-/Gamesfachchat | Vier vollständige gleich verständliche Wege | API-/Resume-/Schlüsselvertrag erhalten |
| UX-05 Lehrplanansicht | Bestehender Lehrplanowner + UIowner | Advanced mit Herkunft/Status | Verifizierter Lesekontrakt, keine Doppeldatenbank |
| UX-06 Versorgung | Zuständiger Backendowner | Begrenzter Vorrat, Parametrik, Nachfüllung | Kosten-/Idempotenz-/Fallbacktests |
| UX-07 Klassenweg | Bestehender Klassen-/Gameowner | Lobby, QR, Board, Rejoin | Echte Backend-/Geräteprobe |
| UX-08 Abnahme | Unabhängige Reviewer und Martin | Klarer Befund je Scope | Exakter Commit, Gerät, Ablauf und Grenze |

Jeder spätere Auftrag nennt erlaubte Dateien, Basiscommit, Zielbranch, Budget, Versuche, unveränderte Verträge und ein klares Ende. Die Tabelle startet keine Agenten, baut nichts automatisch und schafft kein neues Kostenbudget. Vor längeren Arbeitsschritten werden Code und Handoff gesichert. Ein unterbrochener Auftrag wird an derselben Task-ID und Historie fortgesetzt.

## 18. Prüfbuch, Abnahmen und Entscheidungsvorlagen

### 18.1 Funktionsabnahme des Referenzabschnitts

| ID | Konkreter Ablauf | Erwarteter Nachweis |
|---|---|---|
| A01 | Ein Thema ohne Schulart-/Klassenpflicht eingeben | Passender Einstieg, verständliche Defaults, kein erzwungenes Remygespräch |
| A02 | Vorhandenen eigenen Test übernehmen | Originalrevision/Lernziel erhalten, private Vorbereitung klar |
| A03 | 5 Minuten mit zwei Quellaufgaben spielen | Runde läuft bis Zeitende weiter; Wiederholung ehrlich beschriftet |
| A04 | Sehr schnelle Kurzaufgabenfolge | Kein Aufruf pro Klick; Vorrat/Reserve/Fallback nachvollziehbar |
| A05 | 50-/100-/101-Aufgaben-Quellgrenzen | Bestehender Vertrag unterstützt; darüber klare Ablehnung, keine künstliche 40erKappe |
| A06 | Mediengemischte Quelle | Geeigneter Rest und genaue Coverage, keine verdeckte Medienlöschung |
| A07 | Richtige/falsche Antwort mit Hilfe | Fachlich richtige Rückmeldung, keine unpassende automatische Sperre |
| A08 | Pause, Hintergrund, Refresh, Rejoin | Stabile Aufgabe, Zeitregel und genau eine Antwortwirkung |
| A09 | Quelle nach Vorbereitung ändern | Bewusste Neuvorbereitung, keine stille Veröffentlichung |
| A10 | Nachfüllauftrag unklar oder budgetbegrenzt | Kennung erhalten, kein Blindretry, ehrliche Wiederholung |
| A11 | Zeitende während Antwort | Deterministischer Abschluss, keine späten Punkte |
| A12 | Ohne Zeitlimit und geführt wählen | Zusammenfassung trennt Dauer und Lernmodus klar |

### 18.2 Fachliche Abnahme

Mathematikprüfer kontrollieren je Familie Voraussetzungen, Randfälle, Einheiten, zulässige Zahlen und gleichwertige Antworten. Deutschprüfer kontrollieren Wortart/Funktion, vollständige Wortgruppen, mehrteilige Prädikate und Eindeutigkeit. Englischprüfer kontrollieren Bedeutungsvarianten, Sprachvarietät, Kontexte und Orthografieregeln. Kein Fachreview wird durch die Anzahl grüner Codetests ersetzt.

Für die Schwierigkeit werden Originalstufe, neue Brücke und nächster Schritt nebeneinander gespielt. Der Prüfer beschreibt konkret, welche Dimension steigt. Eine unerklärte Bündelung mehrerer Anforderungen ist ein Befund. Die neue Stufe 3 ist erst nach den tatsächlich geprüften Profilen eingeordnet, nicht pauschal für alle Spiele gelöst.

### 18.3 Bedien- und Geräteabnahme

Die spätere Zielgerätevereinbarung benennt mindestens Martins repräsentatives iPad und einen Desktopbrowser mit konkreter Version. Schmale Mobilansicht ist ein zusätzliches Layoutziel, kein Ersatz für physische Geräte. Geprüft werden Textlesbarkeit, Touch, Tastatur, Fokus, Bildschirmtastatur, Orientierung, Audiooptionen, QRöffnung, Unterbrechung und Wiederaufnahme. Ladezeit, Speicher oder Bildrate werden am tatsächlichen Build gemessen und mit Gerät/Verfahren dokumentiert.

Als frühes Usabilityziel kann „vier von fünf Testpersonen starten eine passende erste Aufgabe ohne fremde Erklärung“ dienen. Dies ist eine vorgeschlagene formative Schwelle, keine Populationsevidenz. Ein kritischer fachlicher Fehler oder ein nicht erreichbarer Abbruch wird nicht durch einen Durchschnittswert überstimmt. Befunde werden mit Ablauf und Auswirkung dokumentiert.

### 18.4 Abnahmen getrennt führen

Ein vollständiger Bericht nennt Quellcommit, Build, Umgebung, Datenart, tatsächliche Abläufe, Ergebnis und Grenzen. Codeprüfung, lokale Tests, CI, Integration, Hosting, Functions/Rules, Gerätetest und Nutzerabnahme erhalten getrennte Zeilen. Eine isolierte Vorschau wird nicht zum kanonischen Staging erklärt. Ein grün geprüftes PDF ist keine Produktabnahme.

Der unabhängige Review darf nicht nur die eigenen zuvor verfassten Forschungsabschnitte absegnen. Für das Gesamtbuch wird eine getrennte Person beziehungsweise ein unabhängiger Fachagent beauftragt. Findings werden konkret korrigiert und mit der überarbeiteten Fassung gebunden. Ein Reviewerbericht ohne geprüfte Dateiliste und Fassung ist kein Abschlussbeleg.

### 18.5 Entscheidungen, die Martin konkret prüfen kann

| Entscheidung | Empfohlener Vorschlag | Was ein Ja dazu erlaubt | Was weiter gesondert bleibt |
|---|---|---|---|
| Primärer Einstieg | Einfach starten; Advanced optional | Entsprechenden begrenzten UIbauauftrag vorbereiten | Kein pauschaler Gesamtumbau |
| Zielgruppe | Bestätigt: Bayern Mittelschule 5–10 | Quellen-/Profilplanung daran ausrichten | Keine vollständige Katalogfreigabe |
| Fünf Minuten | Fortlaufend bis Zeitende, ehrliche Wiederholung | Versorgung im Referenzabschnitt spezifizieren | Kein unbegrenztes Modellbudget |
| Schwierigkeit | Profilfamilien mit kleinen Brücken | Repräsentative Familien fachlich ausarbeiten | Keine Fähigkeitseinstufung aller Lernenden |
| Remy | Hilft optional und übernimmt Kontext | Bestehende Eingabewege adaptieren | Kein neues Voice-SDK oder Pflichtchat |
| Erster Bauabschnitt | Vorhandener eigener Mathetest → Runde | Separat konkreten Scope/Branch beauftragen | Kein Merge/Deploy/Production |

Die empfohlene nächste Entscheidung betrifft damit einen sichtbaren, begrenzten Referenzabschnitt. Das ganze Buch bleibt eine zusammenhängende Zielbeschreibung, während die tatsächliche Ausführung in kleinen überprüfbaren Schritten erfolgt. Ein bloßes „gefällt mir“ zur Gestaltung darf nicht als Productionfreigabe ausgelegt werden.

## 19. Quellen, Nachweisgrenzen und Glossar

### 19.1 Repoquellen und Prüfbasis

Die Koordinationsquellen stehen auf [main 8560992c](https://github.com/HerrLoeffler/Hausaufgabe/tree/8560992c072779814017ebac6e86b65e938bc951). Maßgeblich sind START_HERE.md, AGENTS.md, GRADECREW_STATE.json, TODO.md, workstreams/registry.json, docs/CHAT_CONTRACT.md und docs/games/GREAT_GAMES_WORKFLOW.md. Der aktuelle gelesene [Development-Status](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38809750925) belegt das Branch-/PRaudit; er genehmigt keine Integration.

Die fachlichen Bestandsaussagen beruhen auf fixierten Codefassungen, die im nachfolgenden Forschungsanhang mit Pfad und Zeile verlinkt sind. Dazu gehören Fast Quiz PR224, die gelesene Deutschengine und Vocab-Curriculumengine. Verifiedbranches wurden nicht vollständig baumgleich geprüft. Ein 404 eines Labpfads im Webintegrationsbaum beweist nicht, dass es live kein Spiel gibt; die Integrationsbäume unterscheiden sich.

Wissensreise wird anhand [PR238](https://github.com/HerrLoeffler/Hausaufgabe/pull/238) und der frischen [Dokumentationsübergabe in PR237](https://github.com/HerrLoeffler/Hausaufgabe/blob/a66fb81b590fe8780069c4898a7e0523476a57cf/workstreams/wissensreise-plan-20261014.md) eingeordnet. Die echte private 50-Fragen-Vorbereitung ist ein enger positiver Workflowbeleg. Sie beweist weder die Qualität aller Aufgaben noch die vollständige Veröffentlichung, Cloudspielbarkeit, Providersemantik oder Lernerwirkung.

### 19.2 Amtliche und institutionelle Quellen

Die geprüften Lehrplanquellen stammen aus dem amtlichen LehrplanPLUS. Die didaktischen Designregeln stützen sich ergänzend auf institutionelle Leitfäden von IES/WWC, EEF und NSW CESE. Diese Leitfäden synthetisieren Forschung in unterschiedlichen Alters-/Länderkontexten; sie beweisen keine GradeCrew-Wirkung und keine ideale fünfminütige Dauer. Die W3Cquelle beschreibt normative Zugänglichkeitskriterien, keine bereits erreichte Konformität der Entwürfe.

Konkrete URLs, Fundstellen, Alters-/Kontextgrenzen und abgeleitete Designregeln stehen im Forschungsanhang und im maschinenlesbaren SourceLedger. Die Paraphrasen bleiben bewusst kurz. Ein dynamisches Portal ohne ausgewiesenes Fassungsdatum wird mit Abrufstand und entsprechender Unsicherheit geführt, nicht mit einem erfundenen Veröffentlichungsdatum.

### 19.3 Begriffe

**Aufgabenfamilie:** Eine fachlich begrenzte Gruppe mit gemeinsamer Zielhandlung, Parametern und Prüflogik. **Brücke:** Ein kleiner Zwischenschritt, der vorzugsweise eine neue Anforderung einführt. **Coverage:** Sichtbarer Umfang geeigneter und ausgeschlossener Quellelemente. **Curriculum-Mapping:** Begründete Zuordnung zu einem konkreten Lehrplananker. **Idempotenz:** Wiederholtes Senden derselben Aktion erzeugt nur eine fachliche Wirkung. **Parametrik:** Regelgebundene Veränderung geeigneter Aufgabenwerte mit geprüftem Lösungsgenerator. **Provenienz:** Nachvollziehbare Herkunft und Prüfhistorie. **Revision:** Unveränderliche Fassung einer Quelle oder Konfiguration. **Transfer:** Bewusste Anwendung einer Fähigkeit in veränderter Darstellung oder verändertem Kontext.

### 19.4 Abschlussstatus dieses Artefakts

Das Buch ist ein Dokumentationsvorschlag für GC-GAMES-LEARNING-UX-01. Die beauftragte Arbeit umfasst Schreiben, Quellenabgleich, statische Ansichten, Layout und unabhängigen Dokumentationsreview. Sie umfasst keine Produktimplementation. Die tatsächlichen Datei-/Commit-/PR-/Prüfbelege und verbleibenden Befunde stehen in der Aufgabenübergabe. Der Originalauftrag, alte Tasks, Budgets und Versuchshistorien bleiben erhalten.

Der nächste ausführbare Schritt nach Prüfung des Planbuchs ist die begrenzte Beauftragung des Referenzabschnitts in Phase 1 mit konkreter Quelle, Aufgabenfamilie, Zielgeräten und Abnahmekriterien. Bis dahin dienen Datenmodelle, Screens und Beispiele der Entscheidung und Überprüfung.

## Anhang A. Konkrete Brücken am bisherigen Sprungpunkt

### A.1 Mathematik: dieselbe neue Anforderung mit abnehmender Hilfe

Die Bezeichnungen 3a, 3b und 3c sind ein neuer Planvorschlag innerhalb einer Aufgabenfamilie. Sie ersetzen nicht ungeprüft die heutigen internen Levels. Die Brücke wird gewählt, wenn genau ihre Voraussetzungen vorliegen. Bei Addition mit Zehnerübergang sieht sie so aus:

| Teil | Aufgabe | Erwartete Handlung | Was sich gegenüber dem vorherigen Teil ändert |
|---|---|---|---|
| 3a | 8 + 5 = 8 + 2 + __ = 13 | **3** ergänzen; danach vollständigen Zusammenhang ansehen | Der Zehnerübergang wird eingeführt, die Zerlegung vorgegeben |
| 3b | 8 + 5: Ergänze zuerst 8 bis 10, dann rechne weiter | **13**; die Zerlegung ist als Hilfe abrufbar | Ein Teilhinweis statt ausgeschriebener Zwischengleichung |
| 3c | 8 + 5 = __ | **13** selbständig; Hilfe bleibt erreichbar | Gleiche Anforderung, weniger vorausgefüllte Unterstützung |
| Parallelaufgabe | 7 + 6 = __ | **13** mit derselben Strategie | Neue Zahlen prüfen die Strategie, nicht nur den gemerkten Wortlaut |

Für Dezimaldivision darf die bisher beobachtete Mehrfachsteigerung nicht in einem einzigen Schritt wiederkehren. Ein überprüfbarer Vorschlag trennt zunächst 1,2 : 3 = 0,4 von 1,26 : 3 = 0,42 und erst später 1,2 : 0,3 = 4. Die drei Aufgaben verändern unterschiedliche Merkmale: mehr Nachkommastellen im Dividend beziehungsweise ein dezimaler Divisor. Die dritte wird mit „Erweitere beide Zahlen um denselben Faktor: 12 : 3“ unterstützt. Zahlenraum und Vorzeichen werden in dieser Brücke bewusst stabil gehalten. Welche konkrete Reihenfolge passt, wird mit Lehrplanbezug und Vorwissen geprüft.

### A.2 Deutsch: von der Frageprobe zur vollständigen Wortgruppe

Für das Akkusativobjekt bleibt der Satz zunächst kurz und eindeutig. 3a lautet: „Mia trägt eine rote Tasche. Wen oder was trägt Mia? Wähle: Mia / eine rote Tasche.“ Erwartet wird **eine rote Tasche**. 3b verwendet denselben Auftrag ohne Antwortoptionen: „Markiere die vollständige Antwort auf die Frage Wen oder was?“ Erwartet bleibt die vollständige Wortgruppe. 3c lautet nur „Markiere das Akkusativobjekt“; die Frageprobe ist auf Wunsch verfügbar.

Eine neue Parallelaufgabe „Leon öffnet die schwere Tür“ verlangt **die schwere Tür**. Der Wechsel prüft, ob die Person die Probe anwenden kann. Ein Wechsel zu langem Nebensatz, Kausalbestimmung und gleichzeitig negativer Fragestellung wäre kein kleiner Brückenschritt. Die Wortartenfamilie erhält eigene 3a/3b-Aufgaben und verwendet nicht dieselben Antwortlabels. Ein markiertes Adjektiv innerhalb einer Wortgruppe darf nicht als vollständiges Objekt gelten.

### A.3 Englisch: unterstützter Abruf wird selbständiger

Für ein bereits vorgestelltes Zielwort kann 3a den Anfang zeigen: „Hund auf Englisch: d__“. 3b verlangt das Wort ohne sichtbaren Anfang, bietet aber denselben Hinweis auf Wunsch. 3c verwendet nach anderen Aufgaben einen neuen passenden kurzen Kontext. Das Ergebnis **dog** bleibt gleich; Richtung und geforderte Sprachvariante werden während der Brücke nicht zusätzlich gewechselt. Mehr Optionen in einer Auswahlfrage sind nur eine veränderte Antwortbelastung und kein Nachweis höheren Wortwissens.

Die nächsten Schritte werden angeboten, nicht als Charakterurteil dargestellt. Die UI kann sagen „Möchtest du es ohne den ersten Hinweis versuchen?“. Bei zwei Fehlern lautet sie „Sollen wir den Zwischenschritt noch einmal ansehen?“. Die Lehrkraft kann die Hilfen festlegen; Zeitwettbewerb bleibt ein eigener Modus.


## Anhang B. Forschungsnachweise und Kalibrierung

Der folgende Auszug ist der ausgewiesene Beitrag des Recherchefachagenten. Er dokumentiert Quellen und Grenzen, keine unabhängige Freigabe des Gesamtbuchs. Die vollständige eigenständige Researchdatei und SourceLedger liegen dem Paket bei. Die Nummerierung der folgenden Abschnitte stammt aus diesem Fachmemo.

## 2. Quellen- und Revisionsbasis

Aktuelles main `8560992c072779814017ebac6e86b65e938bc951` vom Root per API bestätigt. START_HERE und Gamesworkflow/Briefing/Assetguide frisch per GitHub gelesen; AGENTS/STATE/TODO/CHAT_CONTRACT/Registry und Skillzuordnung über den aktuellen main-input des Planowners gelesen. Jüngster Development Status laut Root: Run 38809750925, Job 116679689447 success; Warnungen sind keine Integrationsfreigabe. Reine Fach-/Lernlogikrecherche braucht keinen img2threejs-Schritt. using-superpowers gelesen; dessen Subagent-Ausnahme gilt. Keine eigene neue Task-/Registry-Datenbank angelegt.

Frisch gelesen: `lab/fast-quiz` Head `a2ffe52cf0240fa35f192fb62d70161ee575ce53`, `lab/fehlerjagd-deutsch` Head `c7eb2709cbcaede44f1ce07fb5ff1d362a182000`, `lab/vocab-rush` Head `4e739100d8a0e8c9be08d11b7bc96ddf86f3b141`. Zusätzlicher FastQuiz Primary laut frischem Root/Planowner-Nachweis: PR224 `2e5f8b8e792da08a884dc9eb8f5bd2e9a0f087e5`, Branch feat/fastquiz-binomial-20261012; dessen Engine und App hier selbst frisch gelesen. GamesHub-Integration PR2 `55e58e4f6147d0d274d8e5f51578b5d60cb33b4e` liefert dieselbe Grundrechen-Engine wie lab/fast-quiz (Blob `78633efb2cfbe4c948b4fed6154b6452eb5fe1ed`), ohne den zusätzlichen Binomikpfad. Im Web-Integrations-SHA `8f8697901f8c1aea89897be855ca2872c82d0f2b` liefern die drei `lab/**`-Enginepfade 404: daraus keinen fehlenden Live-Gamebestand ableiten; Web und Games haben unterschiedliche Integrationsbäume. Verified-Branches existieren; deren vollständige Baumgleichheit wurde hier nicht geprüft.

Wissensreise PR238 `ec7512600bf6d48541cb304d746dca96b78358b5` sowie Dokumentation PR237 `a66fb81b590f…` laut frischem Planowner-Nachweis offen/unmerged; keine Runtimeabnahme aus dieser Quellenrecherche. Die älteren Settingsbilder wären nur historische Bildreferenz. Sie wurden hier nicht erneut live geprüft.



## 3. Belegte Sprünge im aktuellen Bestand

### Mathematik

Datei [math-engine-v4.js, PR224](https://github.com/HerrLoeffler/Hausaufgabe/blob/2e5f8b8e792da08a884dc9eb8f5bd2e9a0f087e5/lab/fast-quiz/math-engine-v4.js#L146), L146–237 sowie L261–279; Niveauetiketten L29–59.

| Familie | n1 | n2 | n3 | n4 | Konkreter Übergang / Grenze |
|---|---|---|---|---|---|
| Natürliche Zahlen | Add-Operand ≤100; Faktoren ≤10; Divisor/Quotient ≤10 | Add-Operand ≤1000; Faktoren 12×20; Quotient ≤25 | Add-Operand ≤10000; Faktoren 25×50; Quotient ≤50 | Add-Operand ≤100000; Faktoren 99×99; Quotient ≤100 | Additionsgrenzen betreffen Operanden, nicht Ergebnis: n3 kann Summe 20000 liefern. Divisionen sind konstruiert restfrei. |
| Ganze Zahlen | Add/Sub-Operanden −20…20, Faktoren bis ±10 | bis ±100, Faktoren ±12 | bis ±500, Faktoren ±20 | bis ±2000, Faktoren ±50 | Schon n1 zieht bei × und ÷ beliebige Nichtnull-Vorzeichen, bei +/− beide Operanden mit Vorzeichen. Der leichte Kontext „Temperatur sinkt um 3“ ist kein eigener Vorstufengenerator. |
| Dezimalzahlen | 1 Stelle, bis20; Divisor ganzzahlig | 1/2 Stellen bis100; Divisor ganzzahlig; negative Subtraktion möglich | 1/2/3 Stellen bis500; Divisor 1 Stelle | 2/3 Stellen bis1000; Divisor 2 Stellen | n2→n3 bündelt drei Änderungen. Multiplikation kann mehr Ergebnisstellen als Eingabestellen haben. Division generiert Dividend aus Divisor×Zielwert; Obergrenze gilt nicht pauschal für alle Operanden. |
| Brüche | +/− gleicher Nenner aus 2,3,4,5,6,8,10; keine negative Differenz | ungleiche Nenner bis12; Zähler bis floor(1,25×Nenner) | Nenner bis16 inkl7/14/15; Zähler bis2×Nenner | Nenner bis24; Zähler bis3×Nenner; gemischte Anzeige | n2 erlaubt bereits unechte Brüche. n1-Zähler kann gleich Nenner sein, also nicht ausschließlich echte Brüche trotz Etikett. Ungekürzte Ausgangsnenner werden durch Fraction-Normalisierung ggf. verändert. |

Alle gezeigten Grundaufgaben sind ein binärer Ausdruck, kein mehrgliedriger Termgenerator. Mehr Rechenschritte entstehen rechnerisch etwa durch Erweitern/Kürzen, nicht durch eine automatisch größere Zahl expliziter Operationen. Bruchdistraktoren L240–257 modellieren u.a. Zähler-und-Nenner-addieren und fehlenden Kehrwert. Numerische Distraktoren L122–129 sind überwiegend Abstände/Vorzeichen/Zehnerfaktoren. Die Standarderklärung L140 wiederholt die Rechnung mit Ergebnis, liefert noch keinen gestuften Lösungsweg.

Runden: [rounding-plus.js L39–85](https://github.com/HerrLoeffler/Hausaufgabe/blob/2e5f8b8e792da08a884dc9eb8f5bd2e9a0f087e5/lab/fast-quiz/rounding-plus.js#L39) steigert Zielformat n1[0,1], n2[1,2], n3[1,2,3], n4[0,1,2,3] und Zahlenobergrenzen20/100/1000/5000. n2→n3 verbindet Tausendstel mit zehnfachem Zahlenraum. Binomik L291–324 wählt drei Formeltypen mit b=1…5; Niveau wird dort nicht ausgewertet. `(x+3)²=x²+6x+9` ist daher eine separate Kompetenzfamilie und keine bereits vierfach kalibrierte Grundrechenaufgabe.

[app-v4.js L108–144](https://github.com/HerrLoeffler/Hausaufgabe/blob/2e5f8b8e792da08a884dc9eb8f5bd2e9a0f087e5/lab/fast-quiz/app-v4.js#L108): Dauer und scoring sind gesonderte Konfiguration. L327–330: Fehlersperre optional, sonst nächste Aufgabe nach380ms richtig/500ms falsch, Binomik2500ms. Das ist ein Lese-/Feedbackrisiko, kein Beleg einer getesteten Lernwirkung. Vorgeschlagen: Lernmodus lässt Erklärung nach Bedarf stehen; Wettbewerb darf anders takten.

### Deutsch

[deutsch-engine.js L29–31](https://github.com/HerrLoeffler/Hausaufgabe/blob/c7eb2709cbcaede44f1ce07fb5ff1d362a182000/lab/fehlerjagd-deutsch/deutsch-engine.js#L29) setzt n1 und n2 beide auf Schwierigkeit1–2, n3 auf2–3, n4 auf3–4. [L233–245](https://github.com/HerrLoeffler/Hausaufgabe/blob/c7eb2709cbcaede44f1ce07fb5ff1d362a182000/lab/fehlerjagd-deutsch/deutsch-engine.js#L233) macht zugleich das Wiederholungsfenster enger: Jahrgang minus4/3/2/1 (mindestens5). Leerer Pool fällt erst ohne Unterjahrgangsgrenze, schließlich auf alle Skillaufgaben zurück. Deshalb besteht keine harte fachliche Garantie, dass „Klasse+Niveau“ immer den sichtbaren Pool begrenzt. Die Engine ist ein kuratierter Aufgabenpool, kein offener Sprachgenerator.

Repräsentative Satzglieder L144–153: n1-Schwierigkeit Subjekt „Die neue Schülerin“ oder Akkusativobjekt „den Ball“; Schwierigkeit2 Dativ „seiner Schwester“, Temporal „morgen“, Lokal „im Park“; Schwierigkeit3 Kausal „wegen des Regens“/Final „zur Vorbereitung…“; Schwierigkeit4 Attribut als Satzgliedteil oder Subjektsatz. n3 kann zusätzlich Mehrfachmarkierung fehlerhafter Zuordnungen enthalten (L214–215). Satzlänge, Fachwortlast, Negation „Welche sind falsch?“ und Anzahl nötiger Entscheidungen sind eigenständige Belastungen. Wortarten und Satzglieder sind verschiedene Kompetenzfamilien. „Nomen“ und „Subjekt“ dürfen keine austauschbaren Antworten sein.

### Englisch / Vocab Rush

[curriculum.js L3–25](https://github.com/HerrLoeffler/Hausaufgabe/blob/4e739100d8a0e8c9be08d11b7bc96ddf86f3b141/lab/vocab-rush/curriculum.js#L3) ordnet Themen Einführungsjahrgängen5–9 zu; [L94–98](https://github.com/HerrLoeffler/Hausaufgabe/blob/4e739100d8a0e8c9be08d11b7bc96ddf86f3b141/lab/vocab-rush/curriculum.js#L94) bietet verfügbare/empfohlene Themen, einen Themenzyklus und feste Aufgabenfamilien. Kein Difficultyparameter. Explizit übergebene Themen werden nur gegen bekannte TOPICS geprüft, nicht erneut gegen den Jahrgang. Eigene Sets wechseln Richtung, ziehen bis3 Distraktoren aus dem Set, und können falsche Items zwei Plätze später wiederholen. Dieser kurzfristige Retry ist keine belegte verteilte Wiederholung über Tage. Irregular verbs, Satzbau und einfacher Wortabruf sind verschieden, obwohl sie dasselbe Spielgerüst nutzen.



## 4. Vorhandene Lehrplanarbeit nutzen, Grenzen sichtbar halten

Remote-PR208-Branch `docs/pedagogy-curricula-20261011` enthält weiterhin Stand11.10, Workstream-Sicherung `ab2a76bfa4f463c49946d5f68272fb81594d84d1`; dessen Bericht ist keine Vollanalyse. Auf main ist die Workstream-Datei laut Root404. Neuere lokale Arbeitsdokumente wurden ausdrücklich getrennt gelesen: `analysis/GC-PEDAGOGY-KB-01/master/fortschritt-und-luecken.md` L3–21, L25–37 und `umsetzung-remy-emmi-2026-10-14.md` L3–9, L25–35.

Der lokale Stand14.10 ersetzt die frühere Vollauswertung durch den beauftragten groben Überblick aller16 Länder; weitere Volltextdetailarbeit wurde eingestellt. Historisches Register:3642 Dokumentdatensätze,5535 Zuordnungen,9844 Anker,3611 Aufgabenprofile,3608 Protokolle;942 konkrete Anker zweitgeprüft. Das sind Registerobjekte mit Varianten und Vorgängern, kein Vollständigkeitsprozentsatz. Bayernzeile779/846/53/0 bedeutet gerade keine unabhängige Gesamtfreigabe. Die lokale Remy/Emmi-Erweiterung dokumentiert289 lokale Tests, Node24, ersetzte externe Modell-/Auth-/DB-Schnittstellen und vier korrigierte Reviewbefunde; ausdrücklich kein Commit/PR-Update/Deploy. Der Kandidat basiert auf lokalem Pool29bbf5a, nicht aktuellem Webstand. Keine Wiederholung der Vollanalyse und kein Ersetzen aktueller functions/index.js durch diesen älteren Checkout.

Vertrauensmodell für Advanced: „amtliche Quelle gefunden“ → „passender Fachabschnitt gelesen“ → „Aufgabe fachlich zugeordnet“ → „unabhängig geprüft“ → „in dieser Version technisch und praktisch erprobt“. Jede Stufe braucht Datum/Fundstelle/Reviewer/SHA; nichts davon bedeutet automatisch Lehrplanfreigabe für alle Jahrgänge. Fehlende Land-/Schulangaben nicht als Bayern/Mittelschule ergänzen. Region und Schulweg optional bestätigen. Bis die neue Orientierung tatsächlich integriert ist, Advanced als beabsichtigte spätere Funktion beschreiben.



## 5. Primärquellen und abgeleitete Designregeln

URLs am15./16.10.2026 geöffnet. Institutionelle Leitfäden synthetisieren Forschung; sie sind nicht jeweils eine einzelne Primärstudie. Keine Quelle beweist die Wirksamkeit von GradeCrew oder eine ideale Fünf-Minuten-Dauer. Pro Quelle bleibt die Paraphrase unter200 Wörtern.

| ID / Quelle / Datum | Unterstützter Befund | Ableitung für den Plan und Grenze |
|---|---|---|
| S1 [IES/WWC Organizing Instruction and Study](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), September2007, Empfehlungen1/2/5b/7 | Verteilte Wiederholung, Wechsel Lösungsbeispiel/eigene Aufgabe, aktiver Abruf und Erklärfragen; ausgewiesene Evidenzstärken unterscheiden sich. | Wiederholung auch in späteren Sitzungen planen; Beispiel→ähnliche Aufgabe→selbst lösen. Ein Retry innerhalb derselben Minute ist noch kein Spacing. Kein fester Intervallalgorithmus aus dem Leitfaden ableitbar. |
| S2 [IES/WWC Math Intervention](https://ies.ed.gov/ncee/wwc/practiceguide/26), März2021, Empfehlungen1–6 | Systematik, klare mathematische Sprache, konkrete/semikonkrete Modelle, Zahlengerade, Sachaufgaben und timed activities zur Flüssigkeit. Zielbereich Elementary Grades. | Hilfen fachlich passend aufbauen; Zeittraining erst als gesondertes Fluency-Angebot. Keine unmittelbare Übertragung sämtlicher Interventionsbefunde auf MS5–10; kein Beleg, Zeitdruck sei immer schädlich. |
| S3 [NSW CESE Cognitive load theory in practice](https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators/cognitive-load-theory-in-practice), November2018, Strategien1–7 | Vorwissen berücksichtigen, Beispiele nutzen, Selbständigkeit schrittweise erhöhen, irrelevante Information verringern, relevante Information zusammenführen. | Ein neuer Anspruch pro Brückenschritt; Aufgabe/Hilfe räumlich zusammen; HUD ruhig. Remy erklärt auf Wunsch, nicht als permanenter Zusatztext. Kontext NSW; keine numerische Schwierigkeitsgrenze. |
| S4 [EEF Maths KS2/3](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3),03.11.2017, Empfehlung1 | Diagnostik soll Unterricht und gezielte Unterstützung informieren; Feedback konkret und klar, Fehlvorstellungen verstehen. Zielalter etwa7–14. | Fehlerart und Hilfenutzung für Lehrkraft sichtbar; persönliche Ausgangslage statt starrer Klassenetiketten. Für ältere Sekundarstufe nur begrenzte Übertragbarkeit. |
| S5 [EEF Teacher Feedback](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback),11.06.2021 | Lehrerfeedback für5–18Jahre; Feedback kann unterstützen, schlecht gestaltet auch schaden; Prinzipien wichtiger als bloßer Kanal. | Feedback muss eine nächste Handlung ermöglichen, z.B. „Ergänze zuerst bis10“. Kein garantierter Nutzen einer animierten Richtig/Falsch-Anzeige. Leitfaden untersucht lehrkraftvermitteltes Feedback; Spielübertragung ist Designannahme. |
| S6 [LehrplanPLUS MS5 Mathematik](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/5/mathematik), dynamischer Fachplan, Fassungsdatum auf geöffneter Seite nicht ausgewiesen; M5 1.2/2 | Kopfrechnen, schriftliche Verfahren, Rechenvorteile und Darstellungswechsel; ganze Zahlen anschaulich mit Zustandsänderung a±b, a ganz/b natürlich. | Vorzeichenkompetenz zunächst modellieren, nicht sofort alle negativen Faktorkombinationen mischen. Dies ist ein belegtes Beispielcurriculum, kein beschlossener Standard für jedes Kind. |
| S7 [LehrplanPLUS MS5 Deutsch](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/5/deutsch), dynamisch, Datum nicht ausgewiesen; D5 4.2/4.3 | Wortarten und Satzglieder mit operationalen Proben; bekannte Rechtschreibstrategien und individuelle Fehlerschwerpunkte. | Kompetenzfamilien trennen; Probe als Hilfe anbieten und in neuen Kontexten anwenden. Jahreserwartung ist kein Einstiegsniveau. |
| S8 [LehrplanPLUS MS5 Englisch](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/5/englisch), dynamisch, Datum nicht ausgewiesen; E5 1.2/Wortschatz | Ca550 Wörter/Wendungen bis Jahresende, vertraute Themen, Kollokationen und einfache häufige Wendungen; produktive Verwendung. | Wiedererkennen→Abrufen→Kontext nutzen; lehrkraftgeprüfte Sets. Keine550erPflichtliste oder automatische Alterszuordnung aus einer Mengenangabe erzeugen. |
| S9 [W3C WCAG2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/), Recommendation12.12.2024;2.2.1/2.2.2/2.5.8/3.3.1 | Anpassbare Zeitlimits mit Ausnahmen; Bewegung steuerbar; Mindestzielgrößen mit Ausnahmen; Fehler textlich identifizieren. | Fünf-Minuten-Sitzung veränderbar/pausierbar; keine Itemdeadline im Einstieg. Lehrmodus ohne automatische Feedbackflucht; ausreichend große Touchziele. Normative Kriterien separat testen; dieses Memo behauptet keine WCAG-Konformität. |



## 8. Kalibrierung und vorgeschlagene Gates

Zuerst Lehrkraftprüfung pro Familie: fachlich korrekte Antwort, eindeutiger Auftrag, Voraussetzungen, passende Hilfe, plausibler Distraktor, verlässliches Kompetenzmapping. Danach kleine formative Nutzungsprobe mit verschiedenem Vorwissen; beispielsweise5–8 Personen pro vorgesehener Zielgruppe und Gerät, keine repräsentative Wirksamkeitsstudie. Aufgaben erklären lassen, Irrwege beobachten, freiwillige Stopps ermöglichen. Persönliche Daten minimieren, vorhandene Einwilligungs-/Schulverträge verwenden; kein neues Schülerprofil aus diesem Memo.

Vorgeschlagene, noch nicht gemessene Produktgates:4 von5 Testpersonen starten die erste passende Aufgabe ohne fremde Erklärung; keine kritische fachlich falsche/missverständliche Aufgabe im freizugebenden Referenzsatz; Hilfe und Abbruch bei allen beobachteten Abläufen erreichbar. Diese kleinen Zahlen dienen nur einem frühen Usability-Check. Sie garantieren keine Eignung für die Population.

Je Aufgabe getrennt erfassen: erster Versuch richtig/falsch, Hilfe angefordert, Korrekturversuch, übersprungen, aktive Lösungszeit (ohne Hintergrund/Pause), Kompetenz-/Profilversion und Antwortformat. Langsame richtige Antwort ist kein Wissensfehler. Gleicher Wortlaut nach Retry kann Auswendiglernen der Option statt Kompetenz zeigen. Optionenraten, Leseaufwand, Gerät und Medien bleiben mögliche Störfaktoren.

Adaptive Startregel als später zu testender Vorschlag: nach zwei aufeinanderfolgenden Fehlern in derselben Familie Hilfe/leichtere Schwesteraufgabe anbieten; nach z.B.8 von10 selbständig korrekten Erstversuchen aus mindestens zwei variierenden Aufgabenformen einen kleinen nächsten Schritt anbieten, mit Rückkehrmöglichkeit. Ein10erFenster,80%-Grenze oder zweiFehlerTrigger sind keine Forschungsbefunde und keine automatische Kompetenzdiagnose. Zeit allein löst weder Auf- noch Abstieg aus. Nicht innerhalb eines Speedrankings unbemerkt die Anforderungen ändern.

Späterer Lernnachweis: lehrkraftgeprüfte neue Parallelaufgaben nach einer Verzögerung und Transferbeispiele; Vergleich mit Ausgangslage und Beobachtung der Hilfenutzung. Erst dann Lernwirkung vorsichtig beurteilen. Keine Wirkgarantie, kein Notenersatz, keine globale Fähigkeitszahl aus Spielscore. Nächster ausführbarer Schritt bleibt die fachliche und visuelle Prüfung eines kleinen echten Referenzabschnitts nach Freigabe des Planbuchs.

