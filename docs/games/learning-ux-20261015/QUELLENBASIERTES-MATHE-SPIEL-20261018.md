# Mathe spielen: vom eigenen Stoff zur laufenden Runde

GC-GAMES-LEARNING-UX-01 · 18.10.2026 · konkreter Konzeptvorschlag, ausschließlich Dokumentation in PR239.

Dieser Text hat für den neuen Matheentwurf Vorrang bei Einstieg, Quellenwahl, Dauer und fortlaufender Wertung. Die älteren Bücher und Prüfberichte bleiben historische Fassungen. Kopf/SB-Trennung, private Lösungsschlüssel, serverseitige Einmalwertung und die bestehende Releasegrenze gelten weiter. Der nachfolgend ausdrücklich erteilte Umsetzungs-/Stagingauftrag wird im Runtimeworkstream geführt; dieses Dokument allein ersetzt dessen Prüfungen nicht. Production bleibt gesperrt.

## 1. Ziel und Empfehlung

Eine Lehrkraft soll ihre echten Unterrichtsaufgaben so einfach wie einen GradeCrew-Test auswählen oder mit Remy erstellen und daraus sofort eine passende Mathe-Spielrunde vorbereiten können. Alternativ wählt sie Bayern → Mittelschule → Klasse5–10 → Thema/Kompetenzen. Die Runde liefert bis zum gewählten Zeitende neue fachlich passende Aufgaben; kurze Originaltests werden nicht bloß unsichtbar im Kreis abgespielt. Allein ausprobieren, als Klasse gegen Computer und Gruppen gegeneinander bleiben zugänglich.

**Empfehlung: ein gemeinsamer Quellenfluss mit geprüften Aufgabenfamilien und anschließend deterministisch erzeugten Varianten.** Die KI unterstützt die Vorbereitung, Zuordnung und verständliche Formulierung. Rechnen, Lösungsschlüssel, zulässige Parameter und laufende Ausgabe brauchen keinen neuen LLM-Aufruf je Kinderantwort.

Die Einschätzungen bewerten Zieleignung, keine gemessene Produktqualität. Gleiche Kriterien: Quellenbindung, fachliche Prüfbarkeit, laufende Versorgung, einfache Bedienung, Betriebsaufwand.

| Ansatz | Quellenbindung | Prüfbarkeit | Versorgung | Bedienung | Betrieb | Gesamt |
|---|---:|---:|---:|---:|---:|---:|
| Gemeinsamer Quellenfluss + freigegebene Familien |9|9|9|8|8|9/10|
| Jede neue Frage live durch KI erzeugen |7|5|6|7|3|5/10|
| Nur fertige Originalfragen wiederholen |10|9|3|9|10|6/10|

Der erste Ansatz benötigt zunächst Adapter und fachlich geprüfte Familien, bietet danach aber quellentreue Varianten ohne laufende KIwartezeit. Live-KI hat schwankende Latenz, Kosten und zusätzliche Lösungsprüfung. Originalwiederholung bleibt eine ehrliche Übungsoption für nicht variierbare Aufgaben, erfüllt allein aber nicht den gewünschten neuen Aufgabenstrom. Keine feste Themeninsel ersetzt den gesamten Quellenfluss; eine begrenzte Familie dient nur seiner ersten technischen Prüfung.

## 2. Belegter Iststand und fehlender Produktvertrag

| Bereich | Belegt | Noch zu bauen/prüfen |
|---|---|---|
| Mathe-Klassenruntime | PR240; veröffentlichte Quelle7abc866b; Kategorie/Level, Solo, Computer, vier feste Teams;300Sekunden, fünf60s-Fenster, M100 | Eigener Test, Remy-/Lehrplanwahl, variable Dauer, variable Teams und neue fortlaufende Wertung |
| Aufgabenerzeugung dort | classroom-math.js erzeugt deterministisch eigene Grundrechenartenprofile | Quellenrevision, Testaufgaben-/Kompetenzzuordnung, abgesicherte neue Familien statt immer derselben festen Mischung |
| GradeCrew-Testerstellung | app.js collectAiRequest; startAiTestJob, startAiTestVariantJob mit sourceQuizId; Thema, Fach, Jahrgang, Schulart, Region, Materialmodus und Formate | Abgesicherter Spieladapter; bestehende Variantenfunktion ist keine Endlosversorgung für Spiele |
| Pädagogischer Pool |53 Profile, davon5 Mathematik; Startbestand Mittelschule Bayern6/9, PR218 technisch auf Staging | Vollständiger Mathekompetenzkatalog5–10 und ausführbare Variantenfamilien. Poolprofile sind Promptorientierung, keine fertigen Spielgeneratoren |
| Lehrplanbestand in Games | vocab-rush/curriculum.js ist Englisch5–9 | Keine belegte vollständige Mathe-Lehrplananbindung daraus ableiten |

Direkte Quellen: [Runtimevertrag an7abc866b](https://github.com/HerrLoeffler/Hausaufgabe/blob/7abc866b26b9bc0051667abc4ce700d681528b0e/lab/fast-quiz-functions/classroom.js), [Mathefamilien](https://github.com/HerrLoeffler/Hausaufgabe/blob/7abc866b26b9bc0051667abc4ce700d681528b0e/lab/fast-quiz-functions/classroom-math.js), [App-Testerstellung am Poolrelease](https://github.com/HerrLoeffler/Hausaufgabe/blob/a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d/app.js), [Poolmodul](https://github.com/HerrLoeffler/Hausaufgabe/blob/a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d/functions/lib/pedagogical-pool.js), [Poolnachweise](https://github.com/HerrLoeffler/Hausaufgabe/blob/a2db22f81127fc40ee43d1221d27b6af42ea8ae5/workstreams/pedagogical-pool-20261011.md). Der Pool ergänzt ausdrücklich weder material-only noch Ausgangstests. Diese Grenze wird nicht umgangen.

Martins anschließende Klärung: Das Spiel läuft; er war allein. Ein zusätzlich vorgeschlagener Testmodus mit Testspielern wurde ausdrücklich abgelehnt. Daraus entstehen weder Testspieler noch ein Beitrittsfixauftrag. Die zwölf separat vorhandenen Wissensreise-Funktionen werden weder als Matheadapter benutzt noch verändert.

## 3. Vier kurze Schritte statt einer Einstellungswand

Textwireframe; deutsche Produktoberfläche, touch- und tastaturbedienbar. Quelle → Aufgaben/Klasse → Spielweise → Start. Die Schritte bleiben kompakt aufeinander bezogen; Zurück erhält Eingaben.

```text
MATHE SPIELEN                                    [Mit Code beitreten]

1 Woher kommen die Aufgaben?
  [Eigenen Test wählen] [Neuen Test mit Remy erstellen]
  [Lehrplan Bayern Mittelschule]
  Ausgewählt: „Mein Bruchtest“ · 12 Aufgaben       [Ändern]

2 Welche Aufgaben üben wir?
  Klasse [7] · Thema/Kompetenzen [aus Quelle übernommen]
  [Kopfrechnen: nur im Kopf] [Stift und Block: 65/35-Mix]
  Passendes Fachlevel [Vorschlag]                  [Beispiele ansehen]
  ✓ 9 Aufgabenfamilien geeignet · 3 Originale nur wiederholbar
  [Aufgaben prüfen]

3 Wie spielen wir?
  [Allein üben] [Klasse gegen Computer] [Gruppen gegeneinander]
  Gruppen: [2] [3] [4]        Namen: [Füchse] [Eulen] [Biber]
  Dauer: [1] [3] [5] [10] Minuten [Eigene Dauer …]
  > Weitere Einstellungen

4 Bereit?
  „Mein Bruchtest · Klasse7 · Kopf · 3 Gruppen · 5 Minuten“
  „Fortlaufend neue geprüfte Varianten. Papier nicht erforderlich.“
  [Aufgaben ansehen]                             [Runde vorbereiten]

KLASSENLOBBY: Code + QR + klickbarer Beitrittslink, Teilnehmerzahl
  Gruppen prüfen · [Zuordnung ändern]              [Gemeinsam starten]
```

Bei Lehrplanwahl wird Schritt2 zur anklickbaren Auswahl: Klasse → gegebenenfalls Regelklasse/M-Zug → Lernbereich/Thema → konkrete Kompetenzen. Keine Freitextsuche als einzige Zugangsmöglichkeit. Klasse10 ist als Mittlere-Reife-Klasse gekennzeichnet; Regelklasse und M-Zug dürfen ab relevanter Jahrgangsstufe nicht vermischt werden. [LehrplanPLUS Mathematik5](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/5/mathematik) und [Profil Mathematik10/Mittlere-Reife-Klasse](https://www.lehrplanplus.bayern.de/jahrgangsstufenprofil/mittelschule/10/mathematik) sind Primärquellen. Die vollständige Zuordnung aller auswählbaren Kompetenzen bleibt eine Umsetzungs- und Fachprüfaufgabe.

Jeder Kompetenzknoten zeigt „Spielbereit“, „Vorbereitung nötig“ oder „Noch keine geeigneten Spielaufgaben“ anhand echter Abdeckung. Das ist keine pauschale Vollabdeckungsbehauptung. Nicht vorbereitete Kompetenzen bleiben sichtbar; ein Unterrichtsthema wird nicht heimlich durch Grundrechenarten ersetzt. Bei eigenem Test wird die Klasse übernommen, bei fehlenden Metadaten einmal abgefragt; seine Stoffgrenze bleibt maßgeblich.

Remy öffnet die vorhandene Testerstellung mit übernommenem Kontext. Der fertige Entwurf kommt zur Aufgabenprüfung zurück. Unterrichtsabsicht, Typen und Materialbindung bleiben erhalten. Das Spiel startet nicht automatisch aus ungeprüfter KIausgabe. Ein eigener Test benötigt ebenfalls nur diese eine gemeinsame Prüfansicht, keinen zweiten Editor.

In „Weitere Einstellungen“ liegen Hilfen, genauer Zielwert und technische Details. Quellenmängel, fehlende Spielbereitschaft, erlaubte Hilfsmittel und die tatsächlich gewählte Dauer werden dagegen unmittelbar gezeigt. Kategorienwechsel nach erfolgter Prüfung prüft die Eignung neu. Ein Wechsel in einer laufenden Runde ist ausgeschlossen.

## 4. Vom Test zur belastbaren Aufgabenversorgung

Folgende Begriffe beschreiben den **neuen Entwurfsvertrag**, keine bereits vorhandenen API-Namen oder Firestorepfade:

```text
Eigener Test / bestätigter Remyentwurf / Lehrplankompetenzen
 → Quellen-Snapshot mit Revision, Rechten, Klasse/Zug und Stoffgrenze
 → Eignungsprüfung pro Aufgabe: Original / variierbar / nicht spielgeeignet
 → bestätigte Familien: Parametergrenzen, H/P, Strategie, Hilfen, Antwortformat
 → serverseitiger Generator + unabhängiger mathematischer Prüfer
 → geprüfter Vorrat + Nachfüllplan + sichtbare Versorgungsgrenze
 → eingefrorener Rundenvertrag: Quelle/Kategorie/Level/Dauer/Mix/Gewichte
 → opake Aufgabeninstanz → Antwort → serverseitig einmalige Wertung/Feedback
```

Eine Aufgabe wird nur variierbar, wenn ihr Lernziel mit einer bestätigten Familie übereinstimmt. „Rechteckfläche bei gegebenen Seiten“ kann sichere Parameter und Einheiten besitzen; eine Textaufgabe über einen konkreten Originaltext oder ein Bild besitzt deshalb noch keinen passenden Generator. Solche Originale bleiben als endlich/wiederholbar gekennzeichnet. Nicht automatisch spielgeeignete Medien oder Begründungsformate werden erklärt ausgeschlossen; es gibt keine neue KIjury für freie Beweise.

Die Lehrkraft prüft eine begrenzte repräsentative Auswahl einschließlich leichtester/schwerster zulässiger Variante, Hilfe und Musterlösung. Diese Bestätigung ersetzt keine mathematische Validierung jeder späteren Instanz. Jede Familie braucht Fachreview, Parameterconstraints und verlässliche Lösungsermittlung: etwa exakte Ganzzahl-/Bruchrechnung, Einheitenkonversion und getrennte Kontrollrechnung. Nullnenner, mehrdeutige Aufgaben, unzulässige Werte, falsche Distraktoren oder widersprüchliche Einheiten werden verworfen. Ungeeignete Familien werden gesperrt, nicht nur mit Warntext ausgeliefert.

Eine Quellenänderung erzeugt eine neue Revision; laufende Runden behalten ihren Snapshot. Kategorie, Kompetenz, Rechenstrategie und Antwortformat begrenzen die Variationen. Große Zahlen allein definieren kein höheres Level. Seeds, Schlüssel, Generatorversion und kanonischer fachlicher Fingerprint bleiben privat. Andere Optionsreihenfolge oder neue ID machen dieselbe fachliche Aufgabe nicht neu. Wiederholte Instanzen erhalten keine zweite Wertung innerhalb derselben Runde.

**Versorgung:** Vor Start wird die gewählte Dauer gegen den tatsächlich validierten Familienraum, kürzeste zulässige Bearbeitungsfolge und geprüfte Generatorleistung geprüft. Eine 10-Minutenrunde mit einer angenommenen Mindestfolge von2Sekunden benötigt beispielsweise mindestens300 unterschiedliche passende Instanzen je individuellem Pfad plus Reserve; das ist ein ausdrücklich angenommener Lastfall, keine gemessene Kinderleistung. Der Freigabenachweis muss diesen Lastfall je Profil benennen. Für reine Zahlengeneratoren sind sichere Parameterfamilien aus Quellmustern vorzuziehen, für sprachliche Varianten ein begrenzter vorab geprüfter Stapel.

Startpuffer und Nachfüllschwelle werden aus Messwerten der Nachfülllatenz und dem Lastfall abgeleitet: Vorrat mindestens für Nachfüllzeit plus Sicherheitsreserve; Nachfüllen bevor diese Reserve angegriffen wird. Die Rundenfreigabe muss für1/3/5/10Minuten und gültige Sonderdauern ausreichende Versorgung belegen. Die Spielsession erzeugt keine unkontrollierte Folge bezahlter Anfragen; bestehende Teacher-/Tenantquoten und idempotente Vorbereitung bleiben maßgeblich.

Provider fällt aus: vorhandener geprüfter Vorrat und deterministische Familien bleiben nutzbar; ungeprüfte KItexte gelangen nicht ins Spiel. Vorrat reicht vorher nicht: Start der gewerteten Konfiguration wird mit konkreter Ursache blockiert, eine passende kürzere Dauer oder bewusst erweiterte Quelle angeboten. Keine stille Stoffausweitung oder Originalschleife. Unerwarteter tatsächlicher Leerlauf während einer Vergleichsrunde macht den Vergleich ungültig; das Board meldet dies und stoppt die gemeinsame Wertung. Ungewertetes Wiederholen wird ausdrücklich angeboten. Ein Neustart braucht erneute Versorgungsprüfung. „Fortlaufend für die gewählte Dauer vorbereitet“ ist zulässig; „unendlich immer neue Aufgaben garantiert“ nicht.

## 5. Kopf/SB, Dauer und kontinuierliche Wertung

Kopf bleibt100% kopfrechengeeignet. SB besitzt eigene Fachlevel und den geplanten65/35-Slotmix. Der bestehende Präfixvertrag bleibt: P-Anzahl nach n neuen Aufgaben = round_half_up(0,35×n), sonst H.20 Aufgaben ergeben13H/7P; fünf ergeben3H/2P, also60/40 als erkennbare kurze Näherung. Die Quote betrifft die geplante Aufgabenfolge, keine Zeit- oder persönlichen Lösungsanteile. Fehlende passende P-Familien blockieren SB; sie werden nicht durch fremden Stoff ersetzt.

**Neuer Standard ist fortlaufendes Spielen:** Nach Antwort, verständlichem Feedback und gegebenenfalls Korrektur folgt die nächste wertbare Aufgabe. Keine Wartepflicht bis zur nächsten Minute und kein ungewertetes Restfenster nach einer einzigen Aufgabe. Das frühere Modell5×60Sekunden/M100 ist der belegte Bestand, kein Zielvertrag für variable Dauer.

Dauerpresets sind1/3/5/10Minuten. „Eigene Dauer“ akzeptiert als Produktvorschlag ganze Sekunden60–1200 mit Minuten-/Sekundenfeldern; leer, nichtnumerisch, negativ, Dezimalsekunden oder außerhalb der Grenzen sind mit verständlichem Fehler gesperrt. Diese Grenzen werden serverseitig nochmals geprüft und vor Veröffentlichung als Profil-/Betriebsgrenze qualifiziert. Nicht jede gültige Dauer ist für jede Aufgabe geeignet: eine einminütige Runde mit langem schriftlichen Verfahren erhält eine klare Eignungsmeldung statt einer erzwungenen Minutenschranke.

Rundenzeit und Aufgabenorientierungszeit sind getrennt. Schriftaufgaben werden nicht nach60Sekunden falsch. Es gibt keinen Speedbonus, keine anwachsende Fehlerstrafe und keinen verdeckten Zeitmultiplikator. Jede bestätigte richtige Erstabgabe erhält das vorher veröffentlichte Familiengewicht; Hilfe reduziert es mit bekanntem Faktor wie bisher auf die Hälfte. Fehler bringt0, Feedback/Korrektur bleibt möglich, ohne weitere Punkte für dieselbe Instanz. Langsam richtig erhält dieselben Punkte wie schnell richtig. Mehr bearbeitete Aufgaben können weiterhin mehr Gesamtpunkte ergeben; der Modus behauptet deshalb keine Messung reiner Kompetenz oder vollständige Tempofairness.

**Einheitliches Ende ohne neuen Modusschalter:** Zum Serverzeitende werden keine neuen Aufgaben vergeben. Eine schon begonnene Aufgabe darf anschließend in Ruhe für das Lernfeedback beendet werden; diese nach Frist empfangene Antwort verändert den eingefrorenen Rundenscore nicht und wird nicht als Wissensfehler geführt. Während der Restzeit steht dies sichtbar in der Aufgabe. Serverempfang vor Frist ist wertbar; UI-Zeit oder eine wiederholte Anfrage verlängert die Frist nicht. Doppelrequests bleiben wirkungsgleich. Verbindungsabbruch ist technischer Status, keine falsche Antwort. Wiederbeitritt lädt dieselbe offene Instanz und ursprüngliche Frist.

Teacherstop beendet als „Abgebrochen“, kein Sieg/keine Niederlage. Reguläres Zeitende friert nach den fristgerecht bestätigten Antworten das Ergebnis ein. Nächste Runde ist ein bewusster Lehrerstart mit neuer Runden-ID und frischem Score; währenddessen wird kein laufender Papierweg plötzlich durch eine andere Aufgabe überschrieben. Die Lehrkraft bestätigt den Start trotz noch offener Lernnachbereitung sichtbar in der Lobby.

## 6. Gruppen und Computer ohne starre Viererwelt

Standardgruppenwahl2/3/4, Teamnamen editierbar (1–30 sichtbare Zeichen, keine leeren/doppelten Namen), automatisch größenbalanciert oder vor Start durch die Lehrkraft zugeordnet. Anzahl darf registrierte Personen nicht überschreiten; leere Teams sperren den Start. Namen werden als Text behandelt und sicher angezeigt. Das bestehende Alleinüben bleibt erhalten. Es werden keine simulierten Teilnehmer, Testspieler oder ein zusätzlicher Testmodus eingeführt. Die normale Aufgabenprüfung zeigt Beispiele, Hilfen und Lösungen vor dem Start.

Für Teams gilt ein vor Start fester Personenroster. Rohsumme wird zusätzlich gezeigt, Siegermaßstab ist der Durchschnitt bestätigter Lernpunkte pro festem Teammitglied: A = Summe(p_i)/N_fix.7Personen mit je60Punkten und6Personen mit je60Punkten stehen beide bei60, obwohl420 beziehungsweise360 gesammelt wurden. Gleicher Durchschnitt bedeutet Gleichstand; Dropouts werden nicht aus dem Nenner entfernt, spätere Joins üben ungewertet, ein zweites Gerät erhält keinen neuen Punktetopf. Ein gemeinsames Tablet mit mehreren Kindern braucht einen eigenen späteren Teilnahmevertrag.

Alle Teams erhalten denselben eingefrorenen Kategorie-/Familienmix, dieselben vorab geprüften Gewichte, Hilferegeln und Dauer. Parallele Aufgabenfolgen brauchen Nachweis vergleichbarer Anforderung; alternativ identische Reihenfolge mit privaten Lösungen. Unterschiedliche Materialien und stark abweichende Bearbeitungszeiten werden durch eine Normierung nach Teamgröße allein nicht fair. Gewichte müssen fachlich und anhand beobachteter Bearbeitungszeiten geprüft werden. Bis dahin wird keine profilübergreifende Rangliste oder Klassenvergleichbarkeit freigegeben. Kleine Teams haben weiterhin größere Streuung; Zusammensetzung und Lesetempo bleiben Grenzen.

Klasse gegen Computer bleibt kooperativ. Sein Ziel wird **vor Start aus Dauer und Aufgabenprofil** abgeleitet: Im freigegebenen Referenzmix steht pro Familie ein transparenter Richtwert für All-in-Bearbeitungszeit t_j und Lerngewicht w_j. Der daraus vorbereitete Referenzlauf für D Sekunden ergibt P_ref(D,Profil); gewünschte Zielstufe q multipliziert diesen Bezug. Klassenziel = N_fix × q × P_ref. Energiewert =1000×Summe(p_i)/(N_fix×P_ref), Zielbalken bei1000q. q/P_ref sind vorgeschlagene, zunächst unkalibrierte Planwerte, keine aus alten500/600-Zielen übernommene Konstante. Fehlender fachlich plausibler Bezug blockiert den gewerteten Computermodus, Solo bleibt möglich.

Beispiel nur zur Formelprüfung: hypothetischer5-Minuten-Referenzlauf100Punkte/Person und q0,6 ergeben60Punkte pro Person;18Kinder brauchen1080,30Kinder1800. Beide erreichen bei durchschnittlich60 dieselbe Energie600 und das Ziel. Eine1-Minutenrunde oder ein schriftliches Profil erhält einen eigenen aus seiner Folge abgeleiteten Bezug, keine pauschale lineare500-Punkteübernahme. Ziel erreicht gilt bei≥; endgültiger Sieg nur nach regulärem Ende. Zielstufe und Fachlevel bleiben getrennt; keine heimliche fachliche Verschärfung nach einem Sieg.

## 7. Priorisierte Umsetzung und messbare Abnahme

Diese Reihenfolge strukturiert den am18.10 anschließend ausdrücklich erteilten Umsetzungs-/Stagingauftrag. Der Runtimeowner führt Code, Prüfungen und Deploymentbelege separat in PR240. Das Produktziel bleibt der vollständige Quellenfluss; ein Referenztest reduziert nur das Risiko des ersten Schritts.

| Phase | Konkretes Ergebnis | Gate vor nächster Phase |
|---|---|---|
| P0 Einstieg und Vertrag | Test auswählen/Remy-Rückweg/Lehrplanstruktur, Aufgabenprüfung, Quellen-Snapshot, klare Eignungsgründe | Lehrkraft prüft echte Aufgaben samt Lösungen; keine Demoquelle ersetzt Auswahl |
| P1 Aufgabenversorgung | Adapter und validierte Familie aus eigenem Test durch vollständigen Fluss, Originale korrekt klassifiziert; Lehrplan-Mapping mit sichtbarer Abdeckung | Jede freigegebene Instanz hat Herkunft, Constraints und validierten Schlüssel; gewünschte Dauer besteht Lastfall ohne leeren Vorrat |
| P2 Rundenregeln | Variable Dauer, kontinuierliche Wertung,2/3/4Teams/Namen, feste Roster, profilbezogenes Computerziel | Gleicher Beitrag je Person ergibt bei ungleichen Teams gleichen Stand; Zeitende/Stop/Rejoin/Einmalwertung reproduzierbar |
| P3 Unterrichtsabnahme | Quellenwege und verfügbare Kompetenzen5–10 systematisch ergänzen; echte Desktop-/iPad-/Telefonabläufe | Reale Lehrkraft wählt Stoff, scannt/öffnet Beitritt, startet1/5/10Minuten, erhält Ergebnis; Grenzen/fehlende Kompetenzen dokumentiert |

Abnahmefälle, jeweils mit Commit/Build, Ablauf und tatsächlichem Ergebnis:

1. Vorhandener eigener Test und neuer Remyentwurf kommen mit unveränderter Stoffgrenze in dieselbe Prüfansicht zurück; Material-only erhält keinen fremden Poolstoff.
2. Klasse5 bis10 auswählbar; relevante Zweige Regelklasse/M-Zug korrekt, fehlende Spielabdeckung ehrlich sichtbar; mindestens ein belegter Kompetenzweg je veröffentlichter Klasse. Kein Vollabdeckungslabel ohne vollständiges Register.
3. Ein Test mit12Originalaufgaben liefert beim schnellen1/5/10-Minuten-Lastfall neue validierte Varianten bis zum Ende. Nicht variierbarer Text wird als endlich erkannt; Startblockade statt heimlicher Schleife.
4. Keine mathematisch fehlerhafte Instanz im geprüften Parameterraum; Grenzwerte/Nullnenner/Dezimalkomma/Einheiten/äquivalente Antworten und Deduplikation geprüft. Zufallsstichproben allein ersetzen bei großem Raum die Constraint-/Prüferbelege nicht.
5. Provider aus und Nachfüllen verzögert: Puffer/Deterministik trägt den freigegebenen Fall; echter Engpass wird sichtbar und macht den Vergleich ungültig.
6. Kopf enthält0P; SB20Slots13H/7P; Hilfe/Korrektur ändern den Slottyp nicht. Große Zahlen erhöhen nicht automatisch das Niveau.
7. Dauergrenzen60/1200Sekunden akzeptiert,59/1201/leer/NaN abgewiesen. Zwei schnelle Antworten in derselben Minute können beide korrekt gewertet werden; keine Fünffensterreste.
8. Gleiche richtige Aufgabe nach5oder45Sekunden erhält dieselben Punkte. Schriftaufgabe bleibt nach60Sekunden offen. Antwort nach Rundenende erhält Lernfeedback ohne Scoreänderung oder Wissensfehler.
9.2/3/4Teams, veränderliche Namen,25Kinder, leeres Team, Doppelgerät, Dropout und Latejoin geprüft;7×60/7=6×60/6. Kein Individualpranger auf dem Board.
10. Computerziel für1/3/5/10Minuten und beide Kategorien hergeleitet; Zielgleichstand ist Sieg, Teacherstop Abbruch, nächste Runde nur bewusst. Kein ungeprüfter Wert500für jede Konfiguration.
11. Bestehendes Alleinüben bleibt erhalten; kein zusätzlicher Testmodus, keine Testspieler und kein aus dem geklärten Nutzerbericht abgeleiteter Beitrittsfix. Echte Smartphone-/iPadprüfung bleibt ein eigener Laufzeitnachweis.

Offene Risiken vor Umsetzung: Zuordnung beliebiger eigener Tests ist anspruchsvoller als ein Zahlenfeldgenerator; viele Lehrplankompetenzen benötigen andere Darstellungen; Gewichte und Computerziele sind erst zu kalibrieren. Eine hohe Eignung des Architekturansatzes beseitigt diese Arbeit nicht. Nächster konkreter Schritt ist der bereits beauftragte Runtimeumbau anhand dieses Vertrags; danach passende Tests und der ausdrücklich beauftragte Stagingnachweis. Offene fachliche Abdeckung wird sichtbar begrenzt, nicht stillschweigend durch einen Themenpiloten ersetzt.
