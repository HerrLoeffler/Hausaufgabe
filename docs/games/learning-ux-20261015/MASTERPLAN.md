# Gemeinsam leichter lernen
## GradeCrew Lernspiele · Produkt, Bedienung, Didaktik und Umsetzung

**Vocab Rush · Fast Quiz Mathematik · Fehlerjagd Deutsch · Wissensreise**

**GC-GAMES-LEARNING-UX-01 · 15. Oktober 2026 · Vollständiger Vorschlag zur Prüfung**

Dieses Planbuch ist der Entwurf für eine gemeinsame nächste Lernspielgeneration. Es beschreibt verständliche Bedienwege, Aufgabenprogression, technische Grenzen und konkrete Abnahmen. Es genehmigt keine Runtimeänderung, keinen kostenpflichtigen Modellaufruf, keinen Merge und kein Deployment. Die vorhandenen Spiele und Tests bleiben der Ausgangspunkt. Inhaltliche Vorschläge werden erst nach fachlicher Prüfung und ausdrücklich beauftragter Umsetzung Produktverhalten.

## 1. Auftrag, Leseweg und überprüfbarer Ausgangspunkt

### 1.1 Worum es Martin geht

Die vier Lernspiele sollen besser, intuitiver und einheitlicher werden. Mathematik und Deutsch sollen von einer nachvollziehbaren Schwierigkeitsreform profitieren. Die überarbeiteten Lehrpläne sollen eingebunden werden, ohne den einfachen Einstieg mit Fachverwaltung zu überladen. Remy soll auch für Mathematik helfen: Ein eigener oder mit Remy erstellter Test soll als Ausgangspunkt für eine fünfminütige Runde dienen, in der fortlaufend ähnliche passende Aufgaben erscheinen. Ein kleiner Ausgangstest darf die Runde nicht nach zwei Aufgaben beenden.

Der konkrete Nutzerbericht lautet: Die bisherigen Stufen 1 und 2 sind spielbar, Stufe 3 wird als zu schwer erlebt; die höheren Stufen 4 und 5 wurden nicht getestet. Das ist ein ernst zu nehmender Anlass zur Untersuchung. Es ist keine gemessene Aussage über alle Lernenden, alle Themen oder alle bestehenden Generatoren. Die gelesene Mathematikengine bildet aktuell vier interne Niveaus ab; die Produktbezeichnung höherer Stufen muss im jeweiligen tatsächlichen Einstieg abgeglichen werden. Aus der Erinnerung an fünf Stufen wird keine fünfte Enginefähigkeit erfunden.

Der gemeinsame Auftrag lautet deshalb: Weniger Entscheidungen vor dem ersten Erfolg, fachlich nachvollziehbare kleine Lernschritte, keine erzwungene Unterhaltung mit einer KI und ein erweiterter Weg für Menschen, die Schulart, Klasse und Kompetenzen bewusst festlegen möchten. Die direkte Bedienung bleibt vollständig. Remy ergänzt diese Bedienung.

### 1.2 Was dieses Buch liefert

Die Kapitel beschreiben einen gemeinsamen Rahmen und vier fachliche Ausprägungen. Konkrete Bildschirmtexte, Zustandsfolgen, Datenbeispiele, Aufgabenfamilien, Migrationsschritte und Abnahmefälle machen den Vorschlag entscheidbar. Der Designatlas ergänzt zehn Konzeptansichten. Diese Bilder sind neue Entwürfe, keine Screenshots eines bereits umgesetzten Produkts.

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

„Pause“ hält im vorgeschlagenen Solotraining die aktive Sitzungszeit an. Bei einer lehrkraftgesteuerten Klassenrunde gilt dagegen die veröffentlichte gemeinsame Zeitregel. Die Oberfläche sagt dies vor dem Start und im Pausenblatt. Eine lokale Pause darf eine serverseitige Klassenfrist nicht verändern. Die genaue bestehende Deadline-/Resume-Implementierung bleibt bis zur Adapterprüfung maßgeblich.

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

### 7.3 Beispielprogression Grundrechenarten

Die folgende Matrix ist ein fachlich überprüfbarer Vorschlag für eine Familie, keine Aussage, dass jede Stufe zu einem festen Jahrgang gehört. Ergebnisse und Hilfen sind absichtlich konkret. Ein Implementierungsauftrag muss die gesamte Variantenfamilie einschließlich Randfällen prüfen.

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
| B | „Hund“ mit vier Optionen: dog, chair, apple, window | **dog** | Wiedererkennen bei mehr Auswahl; keine künstlich ähnlichen Scheinwörter |
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
