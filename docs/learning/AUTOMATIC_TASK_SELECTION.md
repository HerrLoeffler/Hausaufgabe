# Automatische Auswahl passender Aufgabenformen

Task GC-EXTENDED-QUESTION-TYPES-01. Nutzeranforderung vom26.10.2026. Die nachfolgenden Regeln gelten dauerhaft; den aktuellen Implementierungs- und Teststand nennt der Abschnitt „Umsetzung und belegabhängige Qualitätskontrolle“.

## Lehrkraft nennt das Ziel

Die normale Erstellung soll aus Fach, Klassenstufe, Thema, Lernziel und eventuellen Wünschen selbst passende bekannte Aufgabenformen verwenden. Die Lehrkraft muss nicht für jede Aufgabe ein interaktives Format anklicken. Der Formatwähler ist eine optionale Eingrenzung oder bewusste Übersteuerung. Explizite Ausschlüsse, Materialgrenzen, verfügbare Medien und Punkte bleiben bindend.

Im geprüften bisherigen Remy-Code sind Visuelle Interaktion und alle acht aktiven Unterformate standardmäßig erlaubt. Die allgemeine passende Auswahl ist bereits im Prompt verlangt. Dieser historische Ausgangsstand allein belegte noch kein systematisch geprüftes Auswahlregelwerk. Die unten dokumentierte neue Rezeptstrecke ist davon getrennt; automatisches Modelltraining wird nicht aktiviert.

## Aufgabenrezepte dauerhaft speichern

Ein Rezept beschreibt keine fertige wiederholte Musteraufgabe, sondern wann und wie eine Aufgabenform sinnvoll ist:

- Lernziel, Fachkontext, erforderliche Vorkenntnisse und bekannte Voraussetzungen.
- Geeignete Anlässe und ausdrückliche Gegenfälle.
- Benötigte Angaben, unterstützte Grafik/Motive, Daten- und Einheitenbedingungen.
- Passender vorhandener Builder und geschlossenes Antwort-/Bewertungsschema.
- Mögliche Vorgaben und Hilfestufen; mathematische beziehungsweise fachliche Bedingungen.
- Positive, negative und Bewertungsfälle sowie Version und Qualifikationsstand.

Das vorhandene Bauplan-/Methodenregister erweitern und mit geprüften Buildern verbinden. Keinen konkurrierenden pädagogischen Wissenspool eröffnen oder Prototypen stillschweigend als qualifiziert markieren. Technisch qualifiziertes Authoring-Rezept, pädagogische Poolzulassung und Lernwirksamkeitsnachweis bleiben verschiedene Dinge. Nur qualifizierte, zum Fall passende Rezepte werden automatisch angeboten. Neue Inhalte, Zahlen und Texte stammen weiterhin aus der KI; die Darstellung und Bewertung folgen dem geprüften Vertrag.

## Beispiele der Auswahl

| Lernhandlung | Passender Kandidat | Grenze oder Gegenbeispiel |
|---|---|---|
|Prozentwert, Grundwert oder Prozentsatz über einen proportionalen Rechenweg bestimmen|Dreisatz mit unabhängigen Pfeilen; VIS12|Bei einer reinen Begriffsfrage keinen Dreisatz erzwingen. Unterschiedliche zulässige Zwischenwege nur dann einschränken, wenn der Auftrag sie nennt.|
|Anteil eines gleichmäßig geteilten Ganzen verstehen|Flächenanteile markieren; VIS05|Alle Rasterwerte müssen erreichbar und sinnvoll repräsentiert sein; große Eurobeträge nicht als Hunderte einzelne Kästchen erzwingen.|
|Prozent-, Bruch- oder Messwert verorten|Skala; VIS03|Das Verorten ersetzt keine verlangte Begründung oder Rechnung.|
|Umgekehrt proportionale Größen untersuchen|Dreisatz mit gegenläufigen Operationen; VIS12|Konstantes Produkt und fachliche Annahmen prüfen; nicht aus zwei beliebigen Größen eine umgekehrte Proportionalität behaupten.|
|Fachbegriffe oder Satzglieder zuordnen|Verbindungen oder Mehrfeldtabelle; VIS09/VIS12, bei geeignetem Motiv VIS02|„Satzglieder“ oder „Satz des Pythagoras“ sind kein Anlass für einen Dreisatz.|
|Pflanzenteile erkennen und benennen|Bildbereiche/Beschriftung; VIS01/VIS02|Nur tatsächlich vorhandene Regionen und passende Bilder. Ein verfügbares Pflanzenbild darf kein unbekanntes Herz- oder Blattquerschnittsmotiv vortäuschen.|
|Winkel messen oder Punkte setzen|Winkelmesser/Koordinaten; VIS07/VIS08|Geometrie, Einheiten, notwendige Angaben und tolerierte Antworten müssen zum Lernziel passen.|
|Aussagen über Wahlanteile beurteilen|Inhaltlich passende Zuordnung/Tabelle oder erlaubte klassische Aufgabe|Das Wort „Prozent“ allein erzwingt keinen Dreisatz.|

Dreisatz-geeignete Rechenwege sind reguläre Kandidaten bei Prozent-/Zuordnungstests und keine versteckte Sonderfunktion. Es gibt keine starre fachfremde Formatquote. Sobald ein geplanter Aufgabenslot ausdrücklich einen proportionalen mehrstufigen Rechenweg prüfen soll, ist das passende qualifizierte Dreisatzrezept bevorzugt; eine Abweichung braucht einen sachlichen Grund wie Ausschluss, fehlende Voraussetzung oder ein anderes explizites Lernziel.

## Auswahl und Aufbau trennen

1. Fach, Klasse, Lernhandlung, Angaben und Vorgaben aus dem vorhandenen Auftrag bestimmen.
2. Passende qualifizierte Rezepte ermitteln; Schlüsselwörter dienen höchstens zur Kandidatensuche, nicht als alleinige Entscheidung.
3. Aufgaben im bestehenden Erzeugungsauftrag planen: Lernziel, Rezept, Schwierigkeit, Hilfen, Punkte und benötigte Daten. Dafür keine zusätzliche KI-Anfrage pro Aufgabe einführen.
4. Die KI erzeugt neue fachliche Inhalte. Der passende geprüfte Builder erzeugt die genaue Darstellung und privaten Antworten aus den validierten Daten.
5. Struktur, Mathematik, Punktverteilung, Lösungsfreiheit und globale Testbedingungen automatisch prüfen; gesonderte fachliche Prüfung erhalten.

Rezept-ID, Version und ein kurzer sachlicher Auswahlgrund gehören in private Authoring-Nachweise, nicht als technischer Text in die Schüleraufgabe. Standardmäßig keine weiteren Dialoge. Eine Lehrkraft kann ihre Auswahl begrenzen oder später ändern.

## Aus Rückmeldungen lernen

Bestätigte Verbesserungen werden in versionierte Rezepte, Anwendungsregeln und Regressionstests übernommen. Lehrkraftbewertungen können über die vorhandene Feedbackstrecke Fehlerkategorien und Kandidaten liefern. Eine einzelne positive Bewertung oder bloße Häufigkeit darf kein neues Rezept ungeprüft aktivieren oder eine Lösung verändern. Keine neue Verarbeitung von Schülerantworten oder personenbezogenen Daten und kein stillschweigendes Modelltraining.

Das ist dauerhaftes Produktwissen und überprüfbare Wiederverwendung, keine Abhängigkeit vom Gedächtnis dieses Chats. Fehler müssen zu einem reproduzierbaren Gegenfall und einer überprüften Korrektur führen.

## Abnahme

Ohne Formatklick muss die normale Remy-Erstellung die passenden Rezepte aus Fach-/Klassen-/Lernzielangaben nutzen. Positive und negative Fälle der Tabelle werden als automatisierte Auswahltests hinterlegt. Dazu jede Hilfestufe, direkter und umgekehrter Dreisatz, halbe Punkte, freie Operationen, vorhandene/fehlende Bilder und explizite Ausschlüsse prüfen.

Die Aufgabe muss ohne technische Einzelkontrolle der Lehrkraft bedienbar und korrekt bewertbar sein. Das verlangt belastbare Standardprüfungen und nachgewiesene Fehlerreduktion; eine Zusage fehlerfreier beliebiger KI-Inhalte wird daraus nicht abgeleitet. Nächster Schritt ist die qualifizierte Auswahlstrecke im [bestehenden Umsetzungsplan](../superpowers/plans/2026-10-26-interactive-generation-latency.md), gemeinsam mit der dort beschriebenen Messung und Kontextbegrenzung.

## Umsetzung und belegabhängige Qualitätskontrolle —26.10.2026

PR334, integrierte Quelleecb82da, setzt die Auswahlstrecke für die getrennte Testumgebung um. Die neun Rezeptprofile liegen im vorhandenen Bauplanregister; Backend und Dokumentationskopie bleiben gleich. Explizite einzelne Lernziele werden separat berücksichtigt. Medien- und reine Materialaufträge sowie bestehende Varianten behalten ihren bisherigen Vertrag. Alle bisherigen Formatausschlüsse gelten weiter.

Die KI liefert beim Dreisatz neue Kontexte, Ausgangsdaten, gesuchte Größe und Hilfestufe. Der gemeinsame geprüfte Baustein berechnet Werte und vier unabhängige Rechenpfeile und erzeugt das bestehende Tabellenformat. Feldvorgaben bleiben individuell editierbar. Zeichen vorgeben, Zeichen auswählen und Zahl eingeben oder ganze Rechnung eingeben sind getrennte Hilfen. Jedes offene Zeichen-/Zahlenfeld wird einzeln bewertet; ausdrücklich verlangte0,5Punkte proFeld müssen mit dem Gesamtbudget übereinstimmen. Widersprüche werden repariert oder abgelehnt.

Für alle neuen oder unbekannten visuellen Konstruktionen bleiben Struktur-/Punkteprüfung und unabhängige Fachprüfung aktiv. Zusätzlich löst ein eigener KI-Aufruf die öffentliche Aufgabe ohne Musterlösung. Seine Antwort muss mit der gespeicherten Bewertung vereinbar sein. Fehlende Angaben, ungelöste Bewertungswidersprüche oder konkrete fachliche Fehler verhindern einen fertigen Test. Dies ist ein unabhängiger Kontext beim bestehenden OpenAI-Anbieter, keine behauptete zweite Anbieterintegration.

Systemversuche und Ergebnisse werden ohne Schülerdaten versionsgebunden gespeichert, auch bei fehlgeschlagenen Jobs. Lehrerfeedback zählt nur über den bestehenden Bewertungs-/Freigabeweg und eine serverseitig bestätigte unveränderte Aufgabe. Freigegebenes negatives Feedback bleibt ein Veto. Unbekannte Konstruktionen können keine Erfolgsnachweise eines anderen Motivs übernehmen.

Erst nach mindestens400Versuchen einer unveränderten Rezept-/Builder-/Bewertungsversion, einer unteren95%-Wilson-Grenze von mindestens99%,20bestätigten unterschiedlichen Aufgaben von mindestens3Lehrkräften und ohne bestätigten Fehler wird der zusätzliche blinde Lösungsversuch auf eine deterministische10%-Stichprobe reduziert. Struktur- und Fachprüfung entfallen dabei nicht. Neue Versionen beginnen wieder streng. Das ist eine konservative Freigaberegel, keine bereits erreichte Erfolgsquote; Martins99%/20%bleiben persönliche Einschätzungen.

Geschwindigkeit entsteht vor allem durch kleinere Ausgabe, passende Regeln, weniger Reparaturen und maximalzweiunabhängigeBlöcke, nicht durch das Abschalten notwendiger Prüfungen. Reale Zeit-/Qualitätsbelege werden getrennt vom Implementierungsnachweis unterdocs/evidence/interactive-generation-performance-20261026gesichert.

## Anwendung, Hilfen und Bewertung je Rezept

|Rezept|Geeignet und benötigte Angaben|Mögliche Hilfe|Bewertungsvertrag|
|---|---|---|---|
|Dreisatz direkt|Prozentwert/Grundwert/Prozentsatz oder konstantes Verhältnis; zusammengehörige Ausgangswerte, Einheiten und Zwischenweg|Vier Pfeile unabhängig gegeben, Zeichen gegeben, Zeichen wählen oder Rechnung frei; sechs Zahlen einzeln vorgeben|Jedes offene Feld separat; feste Punktesumme; explizite Halbpunkte widerspruchsfrei; Prozentachse beim Prozentadapter links|
|Dreisatz umgekehrt|Konstantes Produkt, gleiche Leistung und eindeutig zugeordnete Größen|Gleiche Hilfen, gegenläufige Rechnungen links/rechts|Produkt und alle vier Rechnungen prüfen; Zeichen/Zahl getrennt bewerten|
|Flächenanteil|Gleich große Felder, Raster und darzustellender Bruch/Prozentsatz; Zielanzahl ganzzahlig erreichbar|Kleineres Raster und vertraute Brüche; keinen Zielzähler verraten|Gültige unterschiedliche Zellen und exakt passende Anzahl; keine behaupteten Zellteilpunkte|
|Position auf Skala|Eindeutiger Wert, Einheiten, Grenzen und erreichbarer Eingabeschritt|Übersichtliche Hauptmarken, einfachere Schrittweite|Zahl innerhalb des Bereichs und der ausdrücklich gespeicherten Toleranz|
|Pflanzenbeschriftung|Unterstützte unveränderte Pflanzengrafik, vier Fachbegriffe und vorhandene Regionen|Begriffe als Auswahl; keine frei erfundene Herz-/Blattquerschnittsgrafik|Eindeutige Zuordnung, Teilpunkte je korrekter Beschriftung|
|Beziehungen verbinden|Benannte eindeutige Begriffe/Aussagen, passende Gegenstücke und klare Pfeilrichtung|Weniger Beziehungen und kurze vollständige Beschriftungen|Gültige Knotenpaare; korrekte Verbindungen anteilig, falsche Zusatzverbindungen mindern den Anteil|
|Mehrfeldtabelle|Rechteckige Tabelle mit nötigen Bezugswerten, festen Eingabezellen, eindeutigen Lösungen|Werte gezielt vorgeben, einzelne statt aller Felder offen|Teilpunkte je Eingabezelle; Dezimal-/Bruch-/Textmodus passend zum Lernziel; keine offene Erklärung per starrem Textvergleich|
|Winkel messen|Lesbare Geometrie, Winkelmesser und zulässiger Winkelbereich|Direktes Drehen/Verschieben, einfachere Winkel; keine digitale Musterlösung|Gemessener Wert mit gespeicherter Toleranz, bei neuen Aufgaben3Grad|
|Punkte/Strecke im Koordinatensystem|Eindeutige Koordinaten/Endpunkte, Achsenbereiche, Labels und erreichbares Raster|Kleinere Bereiche/einfachere Punkte, alternative Zahleneingabe|Alle verlangten Punkte müssen passen; bei Strecke umgekehrte Endpunktreihenfolge erlaubt; keine behaupteten Punktteilpunkte|

Hotspot/Bildbereich bleibt als erlaubtes Standardformat verfügbar, hat in dieser ersten automatischen Auswahlstrecke noch kein eigenes zusätzlich qualifiziertes Rezeptprofil. Andere passende bekannte Formen bleiben über den bisherigen Generator und die strenge Prüfung nutzbar. Die Tabelle beschreibt tatsächliche vorhandene Hilfen und Bewertung, keine versprochenen neuen Widgets. Neue fachliche Rezepte zuerst mit positiven/negativen Lösungs- und Bewertungsfällen qualifizieren.


## 28.10.2026: fachübergreifende Rezepte und flexible Bildfolgen — Entwurf

Martin möchte die gezielte Auswahl über Prozentrechnung hinaus erweitern und weitere Aufgabenformen nutzen. Seine konkrete Idee: mehrere Schritte in einem KI-Gesamtbild erzeugen und als einzelne Bildkarten ausschneiden. Das ist eine Entwurfsanforderung; in dieser Runde wurden weder Bildaufträge gestartet noch Runtime, Limits oder Deployments geändert.

**Geprüfter Bestand:** Integrationsquelle5e45e9d. Die Auswahl verwendet neun Profile mit Fach-/Lernzielmustern und Gegenfällen; sie ist keine allgemeine fachliche Bedeutungsanalyse. Bilderzeugungsaufträge umgehen die neue Rezeptplanung derzeit noch. Bildfolgen können bereits geordnet, getauscht und serverseitig bewertet werden, aber nur mit genau vier vorhandenen Illustrationen aus Schmetterling, Wasserkreislauf oder Pflanzenwachstum. Das Format ist nicht in den acht aktiven Standardformaten. Freie KI-Bildfolgen benötigen eine Erweiterung des geschlossenen Datenvertrags, der Medienverwaltung und Prüfstrecke.

**Empfohlene Erweiterung:** Lernhandlung zuerst bestimmen (Rechnen/Umformen, Zuordnen, Verorten/Messen, Reihenfolge erkennen). Dann Fachrezept und Daten auswählen, anschließend nur passende geprüfte Darstellungs-/Bewertungsbausteine kombinieren. Ein Rechenweg in Physik oder Chemie braucht seine eigene mathematische Beziehung, Satzbau seine sprachlichen Regeln; eine ähnliche Darstellung ist kein Nachweis derselben Bewertungslogik. Neue Kombinationen zunächst als streng geprüfte Kandidaten behandeln, nicht selbstständig beliebigen Programmcode veröffentlichen.

**Bildfolge aus einem Gesamtbild:** zuerst vier fachlich eindeutige Szenen und private Reihenfolge planen; ein ausreichend großes Bild mit klar getrennten Feldern ohne Nummern/Pfeile erzeugen; Felder serverseitig vor der abschließenden Komprimierung ausschneiden; jedes Teilbild und die Gesamtfolge unabhängig prüfen; Karten mit neutralen Kennungen mischen. Das geordnete Original bleibt privat. Kein CSS-Ausschnitt aus einem öffentlich abrufbaren Gesamtbild und keine Reihenfolgehinweise in Dateinamen/Alternativtexten. Bei Kreisläufen einen Start vorgeben oder mehrere gültige Reihenfolgen ausdrücklich unterstützen. Fehlende/uneindeutige Bilder verhindern einen fertigen Test. Eine Bildbeschreibung allein ist kein Prüfnachweis: die Prüfung muss die tatsächlichen ausgeschnittenen Bilder sehen.

Die vorhandene Bildroute erzeugt1024×1024inlow und komprimiert auf etwa280KiB; das ist kein schon qualifizierter Mehrbildmaster. Für vier Karten wäre beispielsweise ein größeres2×2-Raster zu erproben. Vier getrennte Teilbilder nach einem Generierungsauftrag bedeuten vier Assets, nicht vier neue KI-Erzeugungsaufträge. Verbrauch und Erfolgsquote müssen Mastererzeugung, Teilbilder, Prüfungen, Cachetreffer und Nachbesserungen getrennt ausweisen. Ein einzelner größerer Auftrag ist nicht automatisch um denselben Faktor billiger oder schneller.

**Anwendungsbeispiele:** bekannte Fachgrafik→Bildbereich/Beschriftung; Werte/Einheiten→Skala/Koordinaten; mehrere eindeutige Eingaben→Tabelle; fachliche Beziehungen→Verbindungen; klarer Ablauf→Bildfolge. Freie Erklärungen nicht mit wenigen exakten Tabellen-Mustertexten benoten. Mathematisch exakte Raster, Achsen und Rechenschritte weiter programmatisch zeichnen; passende eigene/rechtlich nutzbare Bilder oder gespeicherte Illustrationen dürfen wiederverwendet werden.

**Erster Pilotvorschlag:** drei Bildfolgen mit je vier Karten aus Biologie, Deutsch und Physik; vorhandene Illustrationen als Vergleich, neue Inhalte zunächst als Gesamtbild. Nachweisen: fachlich eindeutige Folge, sichtbare Stadien, Zuschnitt, neutrale öffentliche Daten, richtige/falsche/leere/teilweise richtige Abgabe, Wiederaufnahme, Maus/Tastatur/Touch. Keine gemessene Erfolgsquote oder konkrete Kostenersparnis behauptet. Bewertung als Einschätzung nach Zuverlässigkeit, Aufwand und Erzeugungsbedarf: geprüfte Illustrationen9/10 für bekannte Abläufe; Gesamtbild plus Zuschnitt8/10 als bevorzugter Pilot für neue Folgen; Einzelbilder7/10 als gezielte Alternative bei hohen Detailanforderungen. Das sind keine Messwerte.

Im geprüften Anwendungscode gelten höchstens fünf Aufgaben mit generiertem Bild pro Test und80Bilderzeugungen pro Tag je Konto; Anbieter-/Projektlimits und tatsächlicher Verbrauch sind davon getrennt und wurden hier nicht kontoseitig geprüft. Nichts angehoben. [Aktuelle offizielle Bilddokumentation](https://developers.openai.com/api/docs/guides/image-generation) nennt Grenzen bei präzisem Layout und Konsistenz sowie qualitäts-/größenabhängigen Verbrauch; [Rate-Limit-Dokumentation](https://developers.openai.com/api/docs/guides/rate-limits) trennt Kontolimits. Keine Modellmigration aus dieser Analyse abgeleitet.
