# GradeCrew adaptive Übungsbegleitung

Konzept und Realisierungsplan für Martin · 20. Oktober 2026 · GC-ADAPTIVE-PRACTICE-01 · Entscheidungsentwurf, `branch_only`

## Grobkonzept auf einer Seite

**Empfehlung: GradeCrew bekommt einen direkten Einstieg „Jetzt üben“.** Das Kind erhält eine kurze passende Aktivität, Hilfe und einen verständlichen nächsten Vorschlag. Es öffnet ein Fach im persönlichen Lerngehirn und wählt bei Bedarf einen großen freigegebenen Themenbereich; Mathematik 6 erhält die sieben Bereiche des verlinkten Lehrplans. Lehrkräfte legen Ziele und Grenzen fest. Ein Kurskatalog, tägliche Pflichtserie oder neues Kontosystem ist dafür nicht nötig.

Beispiel: „Heute üben wir Brüche vergleichen. Bei Aufgaben mit verschieden großen Teilen warst du zuletzt noch unsicher.“ Dann folgt eine Aufgabe, bei Bedarf eine Darstellung oder ein ausgearbeitetes Beispiel, anschließend eine neue Aufgabe ohne Hilfe. Nach etwa 5–8 Minuten: „Für heute fertig. Beim nächsten Mal schauen wir kurz nach, was geblieben ist.“ Die Dauer ist eine zu erprobende Produktannahme; jederzeit beenden und später fortsetzen bleibt möglich.

Der Kernablauf lautet: **Start → nächste Aufgabe → Antwort → hilfreiches Feedback → neue kurze Prüfung → Ende oder nächste Aktivität.** Hinter diesem einfachen Ablauf liegen fachliche Teilkompetenzen, Voraussetzungen, geprüfte Aufgaben, wiederholte Beobachtungen und eine vorsichtige Schätzung. Das System erklärt seine Wahl in einem Satz und lässt Lehrkräfte eingreifen.

„Die KI weiß am besten, was wir üben sollen“ ist eine gute Bedienidee, aber keine belastbare Diagnoseannahme. Ohne Daten weiß das System wenig. Eine falsche Antwort kann Rechenfehler, Missverständnis, Tippfehler, Raten, Lesebelastung oder Müdigkeit bedeuten. Deshalb startet GradeCrew mit wenigen Einstiegsaufgaben, trennt selbstständige von unterstützter Leistung und zeigt Unbekanntes als unbekannt. Eine Gesamtnote oder drei Aufgaben pro Kapitel reichen nicht zur Kompetenzfeststellung.

**Zuerst ein begrenzter Pilot:** Mathematik, ein Thema „Brüche vergleichen und gleichwertig darstellen“, vier bis sechs Teilkompetenzen, ungefähr 40–60 fachlich geprüfte Aufgabenkarten samt Hilfen und Transferreserve. Ein kleiner Regelkern entscheidet nachvollziehbar; kein LLM pro Klick. LLMs können später geprüfte Erklärungen umformulieren. Freie Generierung im Schülerlauf und automatische benotete Entscheidungen gehören nicht in den MVP.

| Ansatz | Einfachheit fürs Kind | Didaktische Steuerbarkeit | Nachvollziehbarkeit | Technische Beherrschbarkeit |
|---|---:|---:|---:|---:|
| A Lehrkraftzuweisung mit gleicher fester Übungsfolge | 9 | 7 | 10 | 9 |
| B Regelgestützte adaptive Begleitung mit geprüftem Pool | 9 | 9 | 9 | 7 |
| C LLM entscheidet frei über Aufgaben und Lernstand | 8 | 4 | 3 | 3 |

Skala 1 = kaum geeignet, 10 = sehr geeignet; begründete Entwurfseinschätzungen, keine Messwerte. A ist eine wertvolle Vergleichsbasis und der einfachste Einstieg, berücksichtigt individuelle Antwortmuster aber kaum. B verbindet geringe Bedienlast mit kontrollierten fachlichen Entscheidungen; dafür müssen Inhalt, Identität und Ereignisspeicherung zuverlässig werden. C wirkt flexibel, erschwert jedoch reproduzierbare Entscheidungen, Lösungsschutz, Kostenkontrolle und fachliche Prüfung. **B ist die klare Empfehlung.** Die Idee erhält als Produktansatz **9/10**, die heutige Basis erlaubt jedoch keine Bewertung ihrer tatsächlichen Lernwirksamkeit.

Der größte Aufwand steckt im guten Aufgaben- und Kompetenzmodell und in verlässlicher Rückmeldung, weniger im Startbutton. Lehrkraftkontrolle, freiwilliger Ausstieg, sichere Identität, getrennte Übungsdaten und Evaluation sind Voraussetzungen eines verantwortbaren Piloten.

## Lerngehirn als Einstieg und adaptive Standortbestimmung

Martins Bild und Konkretisierung vom 20.10.2026 legen die Richtung fest: Das persönliche Lernnetz ist eine funktionale Navigation. Auf der Startansicht erscheinen die großen Fächer um das eigene Profil. Kleine Themenzweige werden erst nach Fachwahl sichtbar. Der Standardweg ist **Lerngehirn → Mathe → Bruchzahlen → direkt üben**. Die Lehrkraft kann dieselbe fachliche Struktur für ein ausgewähltes Kind öffnen; die Rollenrechte bleiben verschieden. Dieser Architekturplan erweitert den bisherigen Entwurf, ohne eine Umsetzung zu starten.

### Erscheinungsbild und Bedienung

Die Referenz zeigt vier farbige Fachbereiche, ein Profil im Zentrum und viele leuchtende Verbindungen. Übernommen werden die zusammenhängende Gehirnsilhouette, große Fachknoten, klare Fachfarben und das persönliche Zentrum. Die im Bild sichtbaren kleinen Kreise „Brüche“, „Prozent“, „Geometrie“ usw. entfallen auf der ersten Ebene ausdrücklich. Labels aus dem Bild sind keine verbindliche Lehrplangliederung. Das Netz muss auch ohne Daueranimation verständlich bleiben; keine pulsierenden Punkte als Pflicht, kein Fadenkreuz aus winzigen Klickzielen.

Klick auf Mathe öffnet eine fokussierte Fachansicht: „Mathe · Klasse 6“ mit großen Themenknoten bzw. gut lesbaren Themenkarten und „Für mich weiterüben“. Der Rückweg „Mein Lernnetz“ bleibt sichtbar. Auswahl von Bruchzahlen startet die Übungsoberfläche mit einer kurzen Erklärung „Wir schauen, wo du gut weiterlernen kannst“. Das Kind muss nicht vorher Kürzen, Erweitern oder Rechenarten selbst diagnostizieren. Eine optionale Themenübersicht kann diese Unterziele erklären, ist aber kein zusätzlicher Pflichtschritt vor der ersten Aufgabe.

Das Gehirn ist Navigation und eine zurückhaltende Zusammenfassung. Fachfarbe bedeutet Fachzugehörigkeit, nicht Leistungsniveau. Datenzustände zusätzlich in Text: „noch nicht angesehen“, „gerade geübt“, „später wiederholen“. Keine dauerhafte rote Defizitregion und kein „Dein Gehirn ist zu 73 % entwickelt“. Netzdichte und Leuchtstärke dürfen keine Intelligenz oder vollständige Beherrschung vortäuschen. Untersuchte Teilkompetenzen sind nur ein Ausschnitt des Faches.

Empfohlene Darstellung: große anklickbare Fächer im Gehirnbild, danach übersichtliche Themenkarten. Vergleich auf 1–10, als Entwurfseinschätzung: Diese Kombination erhält für Wiedererkennung/Bedienklarheit/Barrierefreiheit 9/9/8; ein vollständig verzweigtes Gehirn auf jeder Ebene 9/5/4, weil Beschriftungen und Trefferflächen schnell zu klein werden; reine Listen 5/10/10. Die Kombination erhält den Charakter der Vorlage und bietet auf Handy, mit Tastatur und Screenreader eine gleichwertige strukturierte Liste. Keine technische 3D-Engine nötig. Kleine Bildlabels und Bearbeiten-/Teilen-Buttons werden nicht ungeprüft übernommen: Profilpflege später optional, Schülerlernstände standardmäßig nicht öffentlich teilbar.

### Die Themen in Mathematik 6

Der verlinkte offizielle Fachlehrplan für die Regelklasse der Mittelschule führt **sieben** Lernbereiche. Für die Oberfläche werden diese verständlich beschriftet; die vollständige Zuordnung bleibt hinterlegt:

| Anzeigevorschlag | Offizielle Zuordnung |
|---|---|
| Bruchzahlen | M6 1 |
| Rationale Zahlen | M6 2 |
| Figuren und Körper | M6 3 |
| Oberfläche | M6 4 |
| Volumen | M6 5 |
| Daten | M6 6 |
| Gleichungen und Formeln | M6 7 |

Bei Bruchzahlen trennt der Lehrplan Zahlbereichserweiterung und Rechnen. Er umfasst unter anderem Darstellungen, Erweitern/Kürzen, Vergleichen, Darstellungswechsel und Rechenanwendungen. Die Zahlbereichserweiterung bedeutet mehr als nur „einen Bruch erweitern“. Diese Unterscheidung ist für das Kompetenzmodell wichtig. [Originallehrplan, gelesen am 20.10.2026](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/6/mathematik/regelklasse).

Die sieben Hauptbereiche bilden die Navigation; fachliche Teilkompetenzen und Voraussetzungen liegen darunter. Der folgende Graph ist eine didaktische Produktzerlegung, keine wortgetreue amtliche Stufenfolge: Anteile verstehen → Brüche darstellen → Gleichwertigkeit erkennen → erweitern/kürzen → vergleichen und umwandeln → Rechenoperationen und Anwendungen. Mehrere Wege und Querverbindungen sind möglich. Schwierigkeit wird je Kompetenz/Familie modelliert, nicht als eine einzige Zahl für ganz Mathe. Ein Erfolg beim Addieren sagt noch nichts über räumliche Vorstellung.

### Einstiegsprobe mit gezielten Sprüngen

Der von Martin gewünschte schnelle Einstieg ist als begrenzte Suchphase vorgesehen. Ohne Daten beginnt eine repräsentative Aufgabe mittleren Anspruchs im gewählten Bereich; nach einem selbstständigen Erfolg darf eine deutlich anspruchsvollere Probe folgen. Bei belastbarem Vorwissen kann das zwei oder drei **intern definierte** Anspruchsstufen überspringen. Diese Stufen sind kein amtlicher Maßstab und zunächst nicht kalibriert. Jede Probe braucht eine fachlich beschriebene Anforderung.

Ein Sprung überspringt Übungsaufgaben, nicht automatisch den Nachweis aller Voraussetzungen. Nach einem Fehler werden die Anforderungen der Aufgabe zerlegt. Eine gezielte kleinere Probe prüft die wahrscheinlich fehlende Voraussetzung. Ein einzelner Fehler genügt nicht, um das Kind dauerhaft einzustufen. Ungeprüfte Fähigkeiten bleiben unbekannt, auch wenn die schwere Aufgabe richtig war. Hilfen, Wiederholungen und vermutetes Raten bleiben vom unabhängigen Erstversuch unterscheidbar.

Vorgeschlagene Produktregeln für den Pilot: zunächst 2–4, bei nötiger Klärung höchstens etwa 6 aussagekräftige Einstiegsantworten; spätestens nach ungefähr 5 Minuten in einen hilfreichen Übungsweg wechseln; weder harte Pflichtprüfung noch Diagnoseschleife. Nach zwei nicht gelungenen anspruchsvolleren Proben vorerst keine weiteren großen Sprünge. Bei Überforderung früher helfen oder beenden. Richtwerte müssen mit Lehrkräften und Kindern erprobt werden.

Konkrete synthetische Suchfolge, alle Vergleiche beziehen sich auf gleich große Ganze:

| Beobachtung | Folgerung und nächste Aktivität |
|---|---|
| A: `1/2 = ?/8` → `4`, ohne Hilfe | Gleichwertigkeit hier gezeigt. Sprung zur kombinierten Anwendung `3/4 + 1/6` |
| A: `3/4 + 1/6` → `4/10` | Möglicher komponentenweiser Additionsfehler; Ursache offen. Gegenprobe `1/4 + 2/4` |
| A: `1/4 + 2/4` → `3/4` | Gleichnamige Addition hier möglich. Prüfen, ob selbstständig auf gemeinsamen Nenner gebracht werden kann |
| A: `1/6 = ?/12` → `2`, `3/4 = ?/12` → `3` | Gleichwertigkeit nur teilweise sicher. Prüfen, ob der Faktor für beide Zahlen verstanden ist; passende Streifendarstellung statt weiterer Additionsserie |
| Nach Beispiel: `2/3 = ?/12` → `8` | Erfolg nach Unterstützung; später neue hilfefreie Probe. Nicht sofort als sicher speichern |

Zweiter Weg: B löst `1/2 = 4/8`, `3/4 + 1/6 = 11/12` und eine neue kontextuelle Anwendung ohne Hilfen. Dann keine lange Basisserie: schwierigere Anwendung, anderes freigegebenes Thema oder regulärer Abschluss; unabhängige spätere Probe folgt. Der Empfehlungskern muss auch die Alternative „wir wissen genug für die nächste Übung, aber noch nicht für ein festes Urteil“ zulassen.

Die Übungsphase setzt am gefundenen Anschluss an: Beispiel verstehen → geführten Teilschritt ergänzen → selbstständig neue Aufgabe → später erneut abrufen. Abwechslung betrifft Darstellung und Denkhandlung, nicht nur größere Zahlen. Die bereits beschriebenen zwei mehrsitzigen Lernverläufe gelten weiter.

### API und gemeinsam nutzbarer Aufgabenbestand

Martins Wunsch nach KI im Hintergrund wird als **API-gestützte Inhaltsversorgung und begrenzte Erklärhilfe** eingeplant. Das System beobachtet fortlaufend, muss aber nicht bei jeder Antwort einen Provider aufrufen. Auswahl aus geprüften Aufgaben, Bewertung und einfache Anpassung sind serverseitig schnell und reproduzierbar möglich. Ein LLM unterstützt neue Inhaltsentwürfe und, nach eigener Freigabe, alternative Erklärungen. API-Anbindung bedeutet keine Erlaubnis, jetzt einen bezahlten Lauf zu starten.

Vier getrennte Datenarten sind notwendig:

1. **Gemeinsame Aufgabe:** fachlicher Inhalt, Revision, Lehrplanzuordnung, Kompetenzen/Voraussetzungen, Anspruchsmerkmale, Format, Medien, plausible Fehler, geprüfte Hilfen und privater Schlüssel. Keine Schüleridentität oder echte Antwortgeschichte.
2. **Individuelles Ereignis:** welches Kind welche freigegebene Revision mit welcher Hilfe bearbeitet hat. Bleibt zugriffsgeschützt und getrennt vom gemeinsamen Pool.
3. **Lernstand und Entscheidung:** aus gültigen Ereignissen abgeleitet, einschließlich Unsicherheit und Auswahlbegründung.
4. **Qualitätsdaten der Aufgabe:** zunächst technische/fachliche Meldungen; spätere aggregierte Itemanalyse nur mit genehmigtem Zweck und Schutz gegen Rückschlüsse auf einzelne Kinder.

Inhaltsablauf: vorhandenen Pool prüfen → passende geprüfte Karte ausliefern. Fehlt Inhalt: Entwurfsauftrag an die serverseitige KI mit Fachziel, Kontext und erlaubtem Format, ohne Namen/Schülerhistorie → Schema-/Rechen-/Leakprüfung → fachliche Freigabe → versionierter gemeinsamer Pool. Identische Anfragen bündeln und bereits erzeugte Entwürfe erkennen. Ein validierter mathematischer Generator kann später Varianten erzeugen, braucht aber eine geprüfte Vorlage, Lösung und Grenzen. Neu generierte ungeprüfte Aufgaben werden nicht unmittelbar mehreren Kindern zugestellt.

Die Wiederverwendung spart wiederholte Generierung und Sucharbeit, erfordert aber differenzierte Sperren: aktive Prüfungsaufgaben/-familien, lizenzgebundene Lehrkraftmaterialien und personenbezogene Freitexte dürfen nicht pauschal in den gemeinsamen Pool. Die Wiederholung derselben Karte für dasselbe Kind ist kein neuer unabhängiger Lernstandsbeleg. Aufgaben für spätere Transferprüfung werden von den Übungsfamilien getrennt reserviert.

Providerstörung, fehlender Treffer oder Tageslimit: geprüfte Standardfolge im gewählten Thema; ohne passende Karte „Für dieses Ziel fehlt noch eine freigegebene Aufgabe“ an die Lehrkraft. Kein erfundener Inhalt und kein endloses Warten. Redaktionelle Queue gebündelt statt einer Nachricht pro Kind; die Lehrkraft arbeitet im Alltag mit Vorschlägen und Ausnahmen, nicht mit manueller Aufgabensuche vor jeder Einheit.

### Realisierung dieser Konkretisierung

Der Gesamtentwurf umfasst das Lerngehirn und die spätere Themenbreite. Der erste Entwicklungsauftrag bleibt enger, ohne das Zielbild umzudeuten:

1. **Fachliche Planung:** sieben Themenzuordnungen, begrenzter Bruchkompetenzgraph, Anspruchsmerkmale und zwei komplette Such-/Übungsfolgen prüfen. Diese Dokuarbeit ist autorisiert.
2. **Später beauftragte Bedienprobe:** Lerngehirn mit großen Fachknoten → Mathe mit Themen → Bruchübung an synthetischen Daten. Tastatur, kleines Display und Zurückweg testen. Keine neue eigenständige Plattform.
3. **Später beauftragter vertikaler Pilot:** pseudonyme Identität, geprüfter Bruchpool, Suchphase mit Sprüngen, gezielte Rückführung, Hilfen, Wiederholungsprüfung, Lehrerbegründung und gemeinsame Poolablage.
4. **API-Inhaltsversorgung ergänzen:** serverseitige Entwurfsqueue, Freigabe, Cache, Limits, Fehlerrückfall und Nachweis, dass keine Identitätsdaten in generischen Aufgaben landen.
5. **Breite ausbauen:** weitere Mathethemen und später Fächer erst mit ausreichendem geprüftem Inhalt. Sichtbarer Themenknoten zeigt ehrlich, ob Übungen verfügbar sind; kein leeres Versprechen „alles adaptiv“.

Die frühere Größenordnung von 40–75 Personentagen galt dem begrenzten Pilot, nicht einem vollständigen Lerngehirn für alle Fächer. Als vorläufige Zusatzplanung für einfache Gehirnnavigation mit Listenalternative etwa 4–8 Personentage, für API-Entwurfsqueue/Freigabe/Cache etwa 8–15; nur soweit diese Teile nicht bereits in MVP-Arbeitspaketen enthalten sind, nicht blind addieren. Keine neue Preis- oder Kalenderzusage. Contentabdeckung aller sieben Bereiche muss separat nach Aufgabenzahl, Familien, Medien und fachlicher Prüfung geschätzt werden.

Ergänzende Akzeptanz: erste Ansicht ohne Themenzweige; Mathe zeigt sieben korrekt zugeordnete Bereiche; Brüche beginnt ohne Unterzielauswahl; größere Sprünge überspringen keine Beleganforderungen; `4/10` löst Ursachenprüfung aus; API-Ausfall lässt geprüfte Übungen weiterlaufen; Poolrevision kann mehreren Berechtigten dienen, ohne Antworten/Identitäten zu vermischen; veraltete/gesperrte Karten werden nicht erneut ausgeliefert; Tastatur-/Listenweg bietet dieselben Funktionen. Nächster Schritt bleibt die Prüfung zweier konkreter Bruchfolgen gegen den Kompetenzgraph.


## Schüler und Lehrkraft im Alltag

### Schülerablauf

1. Im bestehenden GradeCrew-Schülerbereich steht „Jetzt üben“. Darunter optional „Anderes Thema“. Die zum Fach gehörenden Themen erscheinen erst nach Fachwahl, nur soweit die Lehrkraft sie freigegeben hat. Keine leeren Themen mit vorgetäuschter Diagnose.
2. Die Startkarte nennt Ziel und knappe Begründung: „Brüche vergleichen · etwa 6 Minuten · wir prüfen zuerst zwei Beispiele“. Ohne Daten: „Wir schauen gemeinsam, was schon gut klappt.“ Bestehende benotete Tests behalten ihren eigenen Einstieg.
3. Eine Aufgabe je Ansicht. „Antwort prüfen“, „Hilfe“ und ein unaufdringliches Menü für „Anders erklären“, „Aufgabe überspringen“, „Aufgabe melden“ und „Beenden“. Keine Geschwindigkeitspunkte. Bei Audio bleibt die konkrete Arbeitsanweisung verständlich und nochmals abrufbar.
4. Nach einer Antwort gibt es eine kurze fachliche Rückmeldung. „Die Nenner sagen, wie groß die Teile sind. Vergleiche zuerst gleich große Ganze.“ Das Kind erhält Gelegenheit zur Korrektur, aber die Korrektur ersetzt nicht die Beobachtung der ersten Antwort.
5. Hilfen werden auf Wunsch konkreter: Denkhinweis → Darstellung/Teilschritt → vollständiges Beispiel. Nach Lösungseinsicht folgt eine andere Aufgabe. „Bitte anders erklären“ wählt zunächst eine kuratierte zweite Darstellung; ein freier Chat ist kein MVP-Erfordernis.
6. Nach einer kurzen Folge endet die Einheit regulär. Sichtbar: geübtes Ziel, gelungener Schritt, nächster Vorschlag. „Du hast heute Brüche mit gleichem Nenner selbstständig verglichen.“ Keine globale Prozentanzeige „Mathe beherrscht“.

„Das kann ich schon“ ist als zu testende Option sinnvoll: bietet eine anspruchsvollere kurze Probe an oder wechselt auf Wunsch weiter, markiert aber keine Kompetenz als gefestigt. Überspringen ist kein Fehler und darf keine Endlosschleife auslösen. Pause/Beenden ist jederzeit erreichbar; vor dem Verlassen zeigt GradeCrew den tatsächlichen Sicherungsstatus. Nach wiederholten Schwierigkeiten: andere Darstellung, Pause oder Lehrkrafthinweis, statt immer mehr gleicher Aufgaben. Prüfbare Pilotregel: spätestens nach zwei erfolglosen Unterstützungszyklen keine weitere identische Schleife.

### Lehrkraftablauf

Die Lehrkraft wählt Klasse/Gruppe, Lernziel, freigegebene Themen, Übungszeitrahmen und gegebenenfalls zugelassene Hilfen. Standard ist ein kleiner geprüfter Vorschlag; kein eigener Diagnosebogen pro Kind. Sie sieht anschließend eine kompakte Liste: Ziel, wenige tragfähige Beobachtungen, Unsicherheit, nächste Empfehlung und auffällige Aufgaben. Beispielsweise: „Zwei unabhängige Aufgaben nach Hilfe noch nicht sicher; Größenvergleich der Teile gemeinsam ansehen.“

Ein Klick zeigt die Begründung mit Aufgabenrevisionen und Antwort-/Hilfebelegen. Die Lehrkraft kann Thema priorisieren, eine Aufgabe sperren, ein anderes Ziel zuweisen oder eine fehlerhafte Schätzung korrigieren. Ein Override überschreibt die aktuelle Empfehlung, erhält die ursprünglichen Beobachtungen und läuft mit Ablaufdatum bzw. bis zur nächsten festgelegten Prüfung. Keine Rangliste der Klasse, keine dauerhaften Etiketten „schwach/stark“. Übungslernstand wird nicht automatisch als Note, Förderdiagnose oder Leistungsprognose exportiert.

## Leistungsstand vorsichtig erfassen

**Coldstart:** Lehrkraftziel und optional eine Selbsteinschätzung dienen zur Startwahl. Danach zwei bis vier kurze, unterschiedliche Einstiegsaufgaben im gewählten Teilgebiet; bei deutlicher Belastung direkt unterstützt beginnen. Das ist eine Orientierung, kein umfassender Einstufungstest über alle sieben Themen. Ein Kind darf ohne Lernstandsprofil üben; längsschnittliche Anpassung erfordert eine verlässliche pseudonyme Identität.

**Bestandsresultate:** Nur freigegebene, rechtmäßig für diesen Zweck nutzbare Resultate mit stabiler Aufgabenrevision, Teilkompetenzzuordnung und geklärtem Bewertungsstatus übernehmen. Kapitelpunkte allein nicht importieren. Manuell noch ungeprüfte Antworten bleiben offen. Alte Testresultate sind schwache, zeitgebundene Hinweise; aktuelle kurze Gegenproben verhindern, dass eine alte Note den Weg dauerhaft bestimmt. Bestehende Tests werden nicht nachträglich verändert.

**Beobachtungseinheit:** erster Versuch, Antwortformat, fachlich auswertbare Teilschritte, Hilfestufe vor der Antwort, Lösung bereits gesehen, erneute Antwort, Aufgabenfamilie, Revision und Sitzung. „Mit Hilfe gelöst“ ist ein Lernerfolg, aber kein Beleg selbstständiger Beherrschung. Mehrfaches Antworten auf dieselbe Karte zählt nicht als mehrere unabhängige Belege. Eine richtige Auswahl kann geraten sein; eine zusätzliche freie oder anders dargestellte Aufgabe erhöht die Aussagekraft.

Die Schätzung gilt je Teilkompetenz: `unbekannt`, `in Klärung`, `mit Unterstützung`, `selbstständig mehrfach gezeigt`, `zeitversetzt bestätigt`; daneben Datenumfang, letzte aussagekräftige Beobachtung, Widersprüche und Wiederholungsbedarf. Diese Zustände sind Produktregeln, keine validierten psychometrischen Stufen. Im MVP keine scheinpräzisen Wahrscheinlichkeiten wie „93 % beherrscht“.

Vorläufige Pilotregel für „selbstständig mehrfach gezeigt“: mindestens drei erste, hilfefreie erfolgreiche Antworten aus mindestens zwei Aufgabenfamilien über mindestens zwei Sitzungen, darunter eine neue Anwendung; keine ungeklärten aktuellen Gegenbelege. Eine spätere neue Aufgabe ohne Hilfe ist für „zeitversetzt bestätigt“ nötig. Drei Erfolge sind eine konservative Arbeitshypothese, keine wissenschaftlich garantierte Schwelle; im Pilot prüfen und bei widersprüchlichen Ergebnissen nicht hochstufen.

Nach längerer Pause wird die **Sicherheit der Schätzung** geringer; das Kind wird nicht automatisch als schlechter eingestuft. Startwert für den Pilot: nach 14 Tagen ohne aussagekräftigen Beleg kurze Wiederholungsprobe, abhängig vom Lernziel später anpassen. Mögliche Wiederholungsfenster nach 2, 7 und 21 Tagen sind ebenfalls zu prüfende Produktannahmen, keine universelle optimale Gedächtnisformel.

Bearbeitungszeit allein verändert keinen Kompetenzzustand. Lange Dauer kann durch Vorlesen, Eingabegerät oder Unterbrechung entstehen. Tipp-/Formatfehler zunächst von fachlichen Fehlern trennen: Dezimalkomma akzeptieren; unlesbare Eingabe verständlich nachfragen. Mathematische Freitextäquivalenzen nicht mit beliebiger Textnormalisierung verwechseln. Bei Sprache, Lesen oder Gerät als möglicher Ursache eine zugängliche Parallelaufgabe anbieten, ohne eine Behinderung oder Unaufmerksamkeit zu diagnostizieren. Müdigkeit nicht aus Klicks erschließen; eine freiwillige Aussage „Heute reicht es“ beendet die Einheit ohne Abwertung.

## Wie die nächste Aktivität gewählt wird

Der Regelkern arbeitet innerhalb der Lehrkraftfreigabe. Priorität: ungültige/gesperrte Aufgaben ausschließen → aktive Zuweisung beachten → Unsicherheit oder Widerspruch klären → nötige Voraussetzung unterstützen → fälliges Abrufen einplanen → passende neue Anwendung. Eine dringende Lehrkraftzuweisung darf fällige Wiederholung verschieben; das wird protokolliert. Themenwahl des Kindes wird berücksichtigt, ein begründeter anderer Vorschlag bleibt ablehnbar. Pro Einheit höchstens ein Hauptziel plus eine kurze fällige Wiederholung als Startannahme.

| Datenlage | Vorsichtige Interpretation | Nächste Aktivität und Begründung |
|---|---|---|
| Einmal `1/3 < 1/5` | Möglicherweise Nenner als gewöhnliche Größe behandelt; auch Versehen möglich | Eine kontrastierende bildliche Aufgabe, bevor „Fehlvorstellung“ angenommen wird |
| Erneut `1/4 < 1/6`, Begründung „6 ist größer“ | Wiederholter Hinweis auf dieselbe Vorstellung | Gleich große Streifen teilen; ausgearbeitetes Beispiel, dann neuer Vergleich ohne Hilfe |
| Brüche auf gleich geteiltem Streifen nicht zuordnen | Voraussetzung „gleich große Teile“ unklar | Anteile darstellen und benennen; nicht sofort schwieriger rechnen |
| Nach Hinweis richtig | Unterstützte Leistung | Hilfestufe ausblenden und neue Parallelaufgabe; kein Meisterschaftseintrag |
| Zahleneingabe unverständlich, Darstellung korrekt | Eingabeproblem möglich | Eingabe klären, alternative zugängliche Antwort; keinen fachlichen Abstieg ableiten |
| Mehrere unabhängige Erfolge, neue Anwendung klappt | Ziel vorläufig sicherer | Schwierigen Kontrast oder nächstes freigegebenes Thema; Wiederholung vormerken |
| Erfolg nur bei derselben Karte/Antwortposition | Übungseffekt oder Muster möglich | Neue Familie/Format; Wiederholungen nicht als unabhängige Belege zählen |
| Wiederholung nach Zeitabstand gelingt nicht | Behalten noch unsicher oder Kontextwechsel schwierig | Kurzer Hinweis und neue Anwendung; alten Zustand mit Gegenbeleg relativieren |
| Unbekanntes Thema oder Pool erschöpft | Fehlende Evidenz/Inhalte | Bekannte freigegebene Folge oder Lehrkraftwahl; keine improvisierte Diagnose/Generierung |

**Abgrenzung:** Bewertung stellt fest, was an einer Antwort nach dem geprüften Schlüssel stimmt. Die Lernstandsschätzung interpretiert mehrere solche Beobachtungen. Die Empfehlung wählt eine Aktivität. Das LLM darf diese drei Rollen nicht stillschweigend vermischen.

Ein LLM kann später einen freigegebenen Hinweis sprachlich vereinfachen oder eine zweite Erklärung anbieten. Es erhält nur nötigen kuratierten Kontext, keine Identität oder gesamte Schülerhistorie. Der Server erlaubt ausschließlich freigegebene Aktivitäten und begrenzt Kosten. Fehlerhafte/zu langsame Antwort führt zum geprüften Hinweis zurück. LLM-Ausgaben verändern weder Noten noch Lernstand direkt. Offene mathematische Begründungen bleiben bei nicht sicherer Auswertung neutral bzw. zur Lehrkraftsicht vorgemerkt.

Statistische Lernstandmodelle wie Bayesian Knowledge Tracing können später Raten und versehentliche Fehler probabilistisch modellieren. Sie benötigen geeignete Kompetenzzerlegung, Daten und Kalibrierung; ein bekannter Algorithmus ersetzt diese Arbeit nicht. IRT wäre eher für einen kalibrierten Aufgabenpool geeignet und erklärt noch nicht den passenden didaktischen Hilfetyp. Komplexere Modelle erst aufnehmen, wenn sie bei neuen Schülern/Aufgaben besser vorhersagen **und** bessere Lernentscheidungen ermöglichen als die Regelbaseline. LLM-only ist keine empfohlene Referenzarchitektur.

## Lehrplanbezug und konkrete Lernverläufe

**Konkretisierter Kontext:** Mathematik 6, Mittelschule Bayern, Regelklasse gemäß Martins verlinktem LehrplanPLUS. Die frühere illustrative Sechserauswahl ist durch die sieben Lernbereiche in der neuen Lerngehirnplanung ersetzt. Bruchzahlen ist der erste vertiefte Planungsbereich.

Für „Brüche und Anteile“: gleich große Ganze/Teile erkennen → Zähler und Nenner deuten → gleichnamige bzw. gleichzählige Brüche vergleichen → Gleichwertigkeit/Erweitern nutzen → ungleichnamige Brüche vergleichen → in neuem Kontext anwenden. Voraussetzungen bilden einen kleinen fachlich geprüften Graphen; sie sind keine starren lebenslangen Sperren.

### Verlauf A mit wiederkehrendem Nennerfehler

| Sitzung | Tatsächliche Beispielbeobachtung | Schluss und nächster Schritt |
|---|---|---|
| Tag 1, Einstieg | A wählt bei `1/3 ? 1/5` das Zeichen `<` | Ein Gegenbeispiel ohne Hinweis statt sofortiger Einstufung |
| Tag 1, Gegenprobe | Bei `1/4 ? 1/6` wieder `<`, kurze Auswahlbegründung „6 ist größer als 4“ | Wiederholter konkreter Hinweis auf Nennervergleich. Gleich große Streifen zeigen, einmal drei und einmal fünf Teile; Beispiel `1/3 > 1/5` mit Erklärung der Teilgröße |
| Tag 1, gestützte Arbeit | Bei `1/2 ? 1/4` nach Streifenhinweis `>` | Nur mit Unterstützung gezeigt. Neue Aufgabe `1/5 ? 1/8` ohne Bild: `>` richtig; ein Beleg, nicht „Brüche sicher“. Einheit beenden |
| Tag 3 | Ohne Hilfen `1/6 > 1/9` und bei gleich großem Ganzem `3/8 > 2/8` richtig; `1/2 = 2/4` falsch als `<` | Gleichzählige Vergleiche werden sicherer; Gleichwertigkeit noch unklar. Viertelstreifen zu Halbstreifen zuordnen und Ergänzungsaufgabe `1/2 = ?/6`; nach Hilfe `3` |
| Tag 7 | `2/3 = ?/9` → `6`, selbstständig; `3/4 ? 2/3` → `>` mit Begründung „9/12 > 8/12“ | Neue Anwendung gelingt. Noch kein pauschales Urteil zu allen Brüchen. Kurze Wiederholungsprobe für gleichzählige Brüche, dann auf Wunsch Größen und Messen beginnen |
| Tag 14 | Neue Kontextaufgabe: zwei gleich lange Wege, `2/5 km` und `1/2 km`; A erkennt `1/2 km` als länger, erklärt mit Zehnteln | Zeitversetzter Transferbeleg. Bruchziel erhält bestätigteren Stand; nächstes Lehrkraftziel, spätere Wiederholung bleibt vorgesehen |

Falls A an Tag 3 auch die Gleichteilung nicht erkennt, geht die nächste Aktivität zur Darstellung der Teile zurück. Falls A nach zwei Hilfefolgen weiter nur rät, endet die Einheit mit einem konkreten Lehrkrafthinweis. Kein wochenlanges Festhalten im ersten Unterziel.

### Verlauf B mit guten Rechenleistungen und anderem Fehlerbild

| Sitzung | Tatsächliche Beispielbeobachtung | Schluss und nächster Schritt |
|---|---|---|
| Tag 1 | B antwortet `1/3 > 1/5`, `2/3 = 6/9` und `3/4 > 2/3` korrekt, erste Versuche ohne Hilfe | Vorkenntnis wahrscheinlich; zweites Sitzungs-/Transferkriterium fehlt. Sofort ein neues freigegebenes Thema statt vieler leichter Aufgaben; Bruchwiederholung vormerken |
| Tag 1, Dezimalzahlen | Bei `0,4 ? 0,35` wählt B `<`, bei Zahlengerade ordnet B `0,4` aber korrekt rechts von `0,35` ein | Widersprüchlich, mögliche Schreib-/Vergleichsverwechslung. Rückfrage „Welche Zahl ist größer?“ → `0,4`; bei `0,6 ? 0,52` wählt B `>` richtig. Noch kein belegter Stellenwertfehler |
| Tag 3 | `0,7 = ?/10` → `7`; `0,45 ? 0,5` → `<`, eigenständig. Bei Größen: `0,5 m = ? cm` → `5` | Dezimalvergleich sicherer; Einheitenumrechnung noch unklar. Tabelle mit Meter/Zentimeter und ausgearbeitetem Beispiel `1 m = 100 cm`, danach `0,3 m` ohne Hilfe → `30 cm` |
| Tag 7 | Neue Textaufgabe „Band ist 0,8 m lang, 25 cm abschneiden“: B wählt `55 cm`, nennt `80 − 25`. Bruchprobe `5/6 ? 3/4` → `>` mit Zwölfteln | Selbstständige Anwendung, mehrere Sitzungen. Bruchziel vorläufig gefestigt; Geometrie als nächstes Lehrkraftziel. Umrechnungswiederholung nach Zeitabstand bleibt offen |
| Tag 14 | `0,35 m = 35 cm` richtig, dann Rechteck `3 cm × 4 cm`: Umfangantwort `12 cm` | Umrechnung zeitversetzt bestätigt, neue Verwechslung Fläche/Umfang prüfen. Kontur nachfahren/Seitenlängen addieren, nicht pauschal „Geometrie schwach“ |

Beide Verläufe sind synthetische Designbeispiele mit transparenten Beobachtungen. Sie illustrieren Entscheidungen; sie simulieren keine validierte Diagnoseleistung.

## Didaktischer Formatmix mit Aufwand

Aufwand: klein = vorhandener Typ plus kuratierter Inhalt; mittel = zusätzlicher Hilfe-/Darstellungsablauf; groß = eigener geprüfter interaktiver Adapter. Angaben betreffen die Erweiterung, nicht die komplette redaktionelle Qualitätssicherung.

| Format und Zweck | Konkretes Beispiel | Wiederverwendung und Aufwand |
|---|---|---|
| Kurze Diagnoseprobe: Entscheidung zwischen zwei plausiblen Ursachen | `1/4 ? 1/6` plus alternative bildliche Probe | Single/Dropdown, klein; mehrere Aufgabenfamilien nötig |
| Worked Example: passenden Lösungsweg sichtbar machen | `1/2 = 3/6`, gleiche Länge mit anderer Teilung; „Warum ändert sich die Menge nicht?“ | Text/Bild, klein für Inhalt; Freigabe-/Hilfestufenablauf mittel |
| Geführte Hilfen und späteres Ausblenden | „Mache die Teile gleich groß“ → Nenner 12 anbieten → `3/4 = 9/12` zeigen | Vorhandene Aufgaben, neuer Übungsablauf mittel |
| Fehler finden und begründen: fachliches Modell prüfen | „Mia sagt: 1/8 ist größer als 1/6, weil 8 größer ist.“ Aussage korrigieren | Single plus Text/kuratierte Begründungswahl, klein; offener Text nicht blind automatisch diagnostizieren |
| Sortieren/Zuordnen: Beziehungen aufbauen | `1/2`, `2/4`, `3/6` gleichwertigen Streifen zuordnen | Matching/Grouping/Ordering, klein; eindeutige Paare und Lösungsschutz prüfen |
| Zahlengerade/Visualisierung: Größen und Symbol verknüpfen | `3/4` zwischen 0 und 1 verorten | Bildauswahl mit vorhandenem Typ klein; frei bedienbare Zahlengerade mittel bis groß, später |
| Transfer: Verfahren im anderen Kontext nutzen | Gleiche Gefäße mit `2/3 l` und `3/4 l`: welches enthält mehr? | Number/Single/Text, klein; nicht nur Zahlen umwürfeln |
| Zeitversetztes Abrufen: Behalten prüfen | In späterer Sitzung `5/6 ? 3/4` ohne alte Lösung | Bestehende Aufgaben plus neue Wiederholungsplanung mittel |
| Passendes kurzes Game: viele fachliche Entscheidungen anschaulich machen | Gleich lange Bruchstrecken auf einem Pfad wählen, danach neue ruhige Transferaufgabe | Vorhandene Games erst auf Adapter prüfen, groß. Fast Quiz Klasse 10 ist kein fertiger Bruchadapter |
| Audio als Zugangshilfe | Arbeitsanweisung vorlesen, mathematische Bedeutung bleibt eindeutig | Vorhandene Audioverträge, klein bis mittel; kein unnötiger Hörzwang in Mathematik |

Nicht jede Einheit braucht jeden Typ. Beispiel → eigene Erklärung → neue Aufgabe ist oft besser kontrollierbar als neun neue Interaktionen. Ein Spiel wird nur empfohlen, wenn es das konkrete Ziel trainiert und belastbare Antwortbeobachtungen liefert. Geschwindigkeit, Motorik und Spielscore sind keine Kompetenzbelege. Games bleiben eigene spätere Aufträge.

## Aufgabenqualität und Lösungsschutz

Der Pilotpool enthält veröffentlichte, versionierte Aufgaben mit privatem geprüftem Lösungsschlüssel, fachlichen Tags, bekannten plausiblen Fehlerantworten, Hilfen und alternativen neuen Anwendungen. Aufgabenfamilien erlauben verschiedene Zahlen, aber reine Varianten zählen nicht als vollständiger Transfer. Mindestens zwei fachkundige Prüfschritte: Autorprüfung mit Rechnung und Schüleransicht; unabhängige fachliche Gegenprüfung vor Pilotfreigabe. Eine technische Schemafreigabe ersetzt das nicht.

Qualitätsgate pro Karte und zusammenhängender Folge:

- Frage, Material und Audioanweisung eindeutig; Ganzes, Einheit und Antwortanforderung klar. Beispiel: Anteile nur bei gleich großen Ganzen direkt vergleichen.
- Lösungsschlüssel einschließlich zugelassener äquivalenter Antworten richtig und privat. Freie Bruchantworten benötigen einen geprüften Parser/Äquivalenzvertrag; für den MVP notfalls vorhandene Antworttypen verwenden, statt einen zweiten Grader zu improvisieren.
- Keine Antwort im Auftrag, Dateinamen, Alternativtext, Kapitelüberschrift, Beispiel derselben Prüfprobe oder Nachbaraufgabe. Lehrbeispiel und anschließende unabhängige Probe klar trennen.
- Richtig/Falsch-Verteilungen und Antwortpositionen auf vorhersagbare Muster prüfen. Kein starres 50:50-Schema; Zufall allein verhindert fachliche Hinweise nicht. Opaque IDs und stabile serverseitige Zuordnung bei Zufall erhalten.
- Matching eindeutig lösbar; keine mehreren identischen Zielkarten, die formal verschiedene Antworten verlangen. Farben kodieren keine Lösung.
- Fehlerhafte Karte melden, sperren und betroffene Evidenz als ungültig markieren. Schätzungen anhand gültiger Ereignisse neu aufbauen; Originalbeobachtung mit Sperrgrund zur Nachvollziehbarkeit erhalten, keine Schuldzuweisung ans Kind.

Übungsfeedback darf nach einer Antwort begründet eine Lösung zeigen. Der Server muss diese Freigabe auf genau diese Übungsaktivität begrenzen. Laufende benotete Aufgaben, ihre Variantenfamilien und vertrauliche Materialien werden aus Übungshinweisen ausgeschlossen, soweit die Lehrkraft sie gesperrt hat. Keine Umgehung der bestehenden Lösungsfreigabe über „Erklär mir die Aufgabe“. Neue Übungsereignisse verändern keinen Originaltest und keine Prüfungsnote.

Freie KI-Generierung bleibt zunächst im Lehrkraft-Entwurfsprozess: Generieren → fachlich prüfen → veröffentlichen. Eine automatische Freigabe neuer Aufgaben allein durch ein zweites LLM wäre kein ausreichendes Gate. Geprüfte Hinweise sind auch bei Ausfall des Providers verfügbar.

## Anschluss an die tatsächliche GradeCrew Architektur

### Belegter Stand und offene Integration

Koordinationsbasis ist main `c14a8fdee852f6d5105c1b7e12701a0112272263`; frisch abgefragter App-Integrationshead `4f8b79222a35997852aad4673f8aaf338904f485`. main ist Koordination. Die folgenden Runtimebelege beziehen sich ausdrücklich auf diesen Appcommit, nicht auf main oder fremde offene Checkouts.

| Baustein | Gelesener Beleg | Bedeutung für das Konzept |
|---|---|---|
| Öffentliche Aufgaben und private Bewertung | `assessment-functions/lib/assessment-core.js:146–270,366–408,414–520,570` | `buildPublicQuestion`, `buildGradingKey`, Fingerprints und Grader wiederverwenden; Metadaten werden heute nicht automatisch in die öffentliche Projektion übernommen |
| Attemptlebenszyklus | `assessment-functions/index.js:240,326,380–466` | Start/Resume, Transaktion und wiederholbare Endabgabe vorhanden. Der konkrete Submitpfad löscht danach Schlüssel/Secret im privaten Attempt. Kein vorhandener Dialog- oder Einzelaufgaben-Hilfevertrag daraus ableiten |
| Bisherige Schüleridentität | `app.js:7004` und Attempt-Submissionfelder | Name/Kürzel im bestehenden Ablauf; kein geprüfter dauerhafter schulweiter Kompetenzbezug. Stabile pseudonyme Identity bleibt eigene Abhängigkeit |
| Ergebnisse und Export | `app.js:7911`, `secure-result-policy.js`, `secure-solution-release.js` | Punkte/CSV und zurückgehaltene Ergebnisse/Lösungen erhalten; Lernstandsbericht als gesonderte, ausdrücklich bezeichnete Sicht |
| Aufgabenpool | `functions/lib/pedagogical-pool.js:1–109`, `functions/data/pedagogical-pool.json` | Geprüfte abstrakte Generierungsprofile, Fach/Jahrgang/Schulart/Region, max. 6 Profile/6000 Zeichen; kein kalibrierter fertiger Schüleraufgabenpool. Übergabe nennt 53 Profile, davon 5 Mathe |
| Offline | `assessment-functions/lib/offline-recovery-policy.js:1–16`, Schülerpersistenz | Späte Nachlieferung kann Reviewfall sein; lokale Uhrzeit beweist keine rechtzeitige Abgabe. Für adaptive Ereignisse eigener idempotenter Empfangsvertrag nötig |
| Kapitel | GC-CHAPTER-TESTS-01, Konzept und Draft PR252 | Optionale Kapitel im vorhandenen Test, eine Endabgabe; Kapitel-ID künftig referenzierbar, aber keine Kompetenz-ID. In gelesenem Runtimepfad kein fertiger Kapitel-/Lernmodellvertrag |
| Classroom/ASV | GC-CLASSROOM-01, Master-/Privacyplan auf main | Wiederverwenden: pseudonyme Identität, Klassenfreigabe, lokale Namenszuordnung. Register-/TODOstand teilweise historisch; aktuelle Implementierungs-/Geräteintegration vor Anschluss erneut prüfen |
| Games | Registry/Übergaben, FastQuiz PR224 `2e5f8b8…` offen/unmerged | Eigenständiger Lab-/Previewstand, Klasse 10 binomische Formeln; Preview laut Beleg am 19.10. abgelaufen. Kein kanonischer Lernstandsadapter. Lerninselgestaltung/Enginearbeit ebenfalls kein fertiger Dienst |
| Telemetrie | Registry: Remy-Struktur-/PostHog-/generische Telemetrie | Nutzungsdiagnose ist kein Schülerlernmodell. Kompetenzantworten und pseudonyme Schülerprofile gehören nicht ungeprüft in Produktanalytics |

[Runtime-Grader](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/assessment-functions/lib/assessment-core.js), [Attemptserver](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/assessment-functions/index.js), [Poolselector](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/functions/lib/pedagogical-pool.js), [bestehender Ergebnisexport](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/app.js#L7911).

Die öffentlichen Release-Manifeste wurden lesend abgerufen. Schul-Live `hausaufgabe-staging` meldet Production/gc45-rc1/`4f8b792…`. Die getrennte Testumgebung `gradecrew-staging-2026` meldet Staging/gc44/`0de5307…`. Manifestprüfung ist kein aktueller Funktions-/Rules-/Gerätetest. STATE enthält daneben ältere gc44-/Integrationsfelder; der konkretere gc45-Nachweis und frischer Ref/Manifestabruf sind für den Webstand maßgeblich. Kein neuer Deploy in diesem Auftrag.

### Fachlicher Daten und Schnittstellenplan

Die folgenden Namen sind **Vorschläge für Verträge**, keine vorhandenen Collections oder APIs.

| Objekt | Minimaler Inhalt | Sichtbarkeit und Verantwortung |
|---|---|---|
| Themenplan | Fach, Kontext, freigegebene Ziele, versionierte Themen-/Kompetenz-IDs und Voraussetzungen | Lehrkraft legt fest; Schüler sieht kleine Auswahl |
| Aktivitätsrevision | ID/Revision, Kompetenz, vorausgesetzte Fertigkeiten, Format, Familie, Ziel, private Lösung/Hilfe, Medien, Qualität/Freigabe, Prüfungsfamilien-Sperren | Autor/Review; öffentliche Projektion enthält nur aktuell zulässige Felder |
| Zuweisung | Klasse/Identity, Ziele, Priorität, Zeitrahmen, gültiger Pool, Override und Ablauf | Lehrkraft mit Klassenrechten, Server prüft Zugriff |
| Übungssitzung | pseudonyme Identity oder ausdrücklich kurzlebige Gast-ID, Zuweisung, Pool-/Regelversion, Status, Revision, Start/Ende | Serverautorität; Client speichert begrenzten Resumeentwurf |
| Antwort-/Hilfeereignis | Event-ID, Sitzung, Aktivitätsrevision, Versuch, Antwort oder nötiges Bewertungsergebnis, zuvor freigegebene Hilfestufe, Serverreceipt | Lernzweckgebunden; begrenzte Rohantwortaufbewahrung |
| Lernstandsschätzung | Kompetenz, Zustand, Beleg-IDs, unabhängige Familien/Sitzungen, Unsicherheit, letzte Beobachtung, Widerspruch | serverseitig ableitbar, Version und Neuberechnung erhalten |
| Empfehlung | Kandidat, Regelversion, Reason-Code, knapper Begründungstext, Datenstand, Alternativ-/Fallbackpfad | Server beschränkt Auswahl; Lehrkraft kann nachvollziehen |
| Wiederholung | Kompetenz/Ziel, fällig ab/bis, letztes unabhängiges Abrufen, zurückgestellt durch Zuweisung | Keine tägliche Pflichtserie oder Benachrichtigungsmaschine |

Vorgesehener Ablauf: `startPractice(assignment, topic?)` → Server prüft Identität, Freigabe und Poolrevision → liefert eine sichere Aktivität plus Reason-Code. `recordPracticeEvent(session, eventId, revision, response/hintRequest)` → Server bewertet mit vorhandenen Graderbausteinen, speichert einmalig, gibt zulässiges Feedback frei und aktualisiert Schätzung/Empfehlung. `resumePractice` liefert bestätigten Stand und ausstehende Event-IDs; `finishPractice` bestätigt reguläres Ende. Diese Adapter benötigen einen neuen beauftragten Entwicklungsauftrag, aber keine zweite Bewertungsengine.

**Einzelaufgabenfeedback ist eine echte Ergänzung.** Das bestehende Prüfungs-Submit nicht nach jeder Schüleraktion auslösen und den ganzen Test öffnen. Vor Umsetzung entscheiden: kleine geschlossene Übungsblöcke mit vorhandenem Endabgabe-/Freigabevertrag oder ein enger Übungsadapter um denselben Grader mit Ereignisreceipts. Für den vorgeschlagenen Pilot mit Hilfen pro Aufgabe wird der enge Adapter empfohlen; Prüfungslebenszyklus bleibt abgegrenzt. Altbestände ohne Kompetenzmapping werden regulär dargestellt, fließen aber nicht automatisch ins Lernmodell.

Event-ID je Aktion, Transaktion und Sequenz-/Revisionsprüfung verhindern Doppelzählung durch Retry. Serverzustand und Empfehlung erhalten eine Version; zwei Tabs dürfen aus demselben Datenstand keine zwei unterschiedlichen bestätigten Fortsetzungen erzeugen. Alte Clientereignisse werden angenommen, abgewiesen oder als unbestätigt behandelt, niemals still umgedeutet. Nachträgliche Hilfen dürfen eine alte erste Antwort nicht als hilfefrei erscheinen lassen. Offlinefehlende Reihenfolge mindert die diagnostische Verwertbarkeit.

**Offline:** Bereits freigegebene Karte und lokale Antwort dürfen als Entwurf fortgesetzt werden. Kein Lösungsschlüssel im Offlinepaket; neue serverbewertete Rückmeldung und neue private Hinweise warten auf Verbindung. Anzeige „auf diesem Gerät gespeichert, noch nicht bestätigt“. Server bestätigt idempotent und berechnet danach neu. Gast-/Kontowechsel sperrt fremde Entwürfe, statt sie dem nächsten Kind zuzuordnen. Vollständig offline adaptives Feedback wäre ein zusätzlicher Umfang mit schwierigerem Lösungsschutz, kein MVP-Versprechen.

Kosten und Latenz: kuratierte Karten/Medien nach Revision cachen, Auswahl deterministisch und pro Sitzung begrenzt vorplanen; Antworten trotzdem serverseitig prüfen. Keine unbeschränkten Klassenlistener, kein LLM für Navigation, Punkte oder jede Antwort. Betriebsgrößen: Sitzungen × bewertete Aktionen × Reads/Writes; Audio-/Bildtraffic; Funktionslaufzeit; Review-/Supportaufwand. Optional KI: freigegebene Dialoge × begrenzte Turns × Tokenmenge, Cachequote und Fehlversuche. Vor Pilot ein konfiguriertes Klassen-/Tagesbudget, Timeout und harte Abschaltung; bei Erreichen weiter mit vorhandenen Hinweisen. Konkrete Eurobeträge erst nach Runtime-/Tarifwahl und Messung, keine fiktive Kostenersparnis.

## Identität und verantwortlicher Datengebrauch

Dauerhafter Lernstand knüpft an die bestehend geplante pseudonyme StudentIdentity und Klassenfreigabe an, nicht an Browserfingerprints, freie Namensfelder oder IP-Adressen. Kein zweites Schülerkonto. Auf Gemeinschaftsgeräten: explizit erkennbares Alias, „Person wechseln“, kurzer geregelter Wiedereinstieg, getrennte lokale Ablage und Entfernen/Zugriffssperre lokaler Daten beim Abmelden. Zugangscodes sind Geheimnisse und werden nicht in Logs oder Analytics geschrieben. Gastübungen bleiben möglich, aber ohne behauptete sitzungsübergreifende Personalisierung.

Erfasst werden nur für Rückmeldung/Empfehlung erforderliche Antworten, Hilfen und Ereignisse. Keine permanenten Klick-/Tastaturprotokolle, Audioaufnahmen der Kinder, Emotionserkennung oder verdeckte Verhaltensprofile. Keine ASV-Klarnamen-/Gesundheits-/Förderdaten an den Empfehlungskern. Pseudonyme Lernprofile bleiben schützenswerte personenbezogene Daten, sofern eine Zuordnung möglich ist; die konkrete Verarbeitung muss fachlich und rechtlich geprüft werden.

Lehrkräfte sehen nur ihre berechtigten Gruppen, Schüler nur den eigenen freigegebenen Stand. Adminsupport mit begrenztem Zugriff und Beleg, kein allgemeines Antwortleserecht. Zwecke und Auswertung werden kindgerecht erklärt: „Wir merken uns, welche Aufgaben du mit oder ohne Hilfe lösen konntest, damit wir dir etwas Passendes vorschlagen können.“

Vorgeschlagenes Pilotlöschkonzept zur Prüfung: rohe Antworten 30 Tage, reduzierte Kompetenzbelege bis Ende des vereinbarten Pilot-/Unterrichtszeitraums, danach löschen oder auf ausdrücklich zulässigen Minimalstand reduzieren; keine automatisch unbegrenzte Historie. Schule/Betreiber legen vor Start tatsächlich erforderliche Fristen, Lösch-/Auskunftsweg, Backupauslauf und Zuständigkeit fest. Löschung umfasst Rohereignisse, abgeleitete Schätzungen, Empfehlungen, Caches und lokale Geräteablagen; technische Löschbelege dürfen keine Antwortinhalte konservieren.

Keine Schülerantworten an kommerzielle Provider im MVP, kein Training mit Echtdaten. Für späteren Dialog sind Zweck, Empfänger, Region, Aufbewahrung und Vertragsgrundlage vorab zu entscheiden. Bezahlte Schülerangebote, Werbung oder kaufabhängige Noten-/Lernwege gehören nicht zum Pilotumfang. Üben, benotete Bewertung und kommerzielle Produktanalyse erhalten getrennte Zwecke und Freigaben.

Offene professionelle Zuständigkeiten: Schule/Betreiber klären Rechtsgrundlage, Rollen, AVV/Unterauftragnehmer, Informationen und gegebenenfalls Folgenabschätzung mit zuständigen Datenschutz-/Rechtsfachleuten. Fachliche Leitung verantwortet Kompetenz-/Inhaltsfreigabe, technische Owner Autorisierung/Löschung/Lösungsschutz. Diese Planung ist keine Rechtsprüfung oder Konformitätsgarantie und führt keine neue Gesamtprüfung aus.

## Realisierungsplan und Abhängigkeiten

### Stufe 0 zur konkreten Pilotentscheidung

Kompetenzgraph und zwei reale Aufgabensequenzen mit Lehrkraft prüfen; zulässige Identitäts-/Klassenanbindung am aktuellen Runtimebranch feststellen; Grader-/Hilfefreigabe-/Resumevertrag festlegen. Synthetische Daten genügen. Lieferbar: kleiner Inhaltsplan, Server-/Clientvertragsentwurf, Testfälle, Rollen-/Fristenentscheidungen und begrenzter Pilotauftrag. Aufwand etwa 5–10 Personentage inklusive fachlicher Arbeit, wenn bestehende Quellen verfügbar sind. Ein Tag entspricht hier ungefähr einem fokussierten Arbeitstag, keine Kalenderzusage.

### Stufe 1 als kleiner MVP

Ein Thema, vier bis sechs Teilkompetenzen, etwa 40–60 kuratierte Karten mit mehreren Familien, Hilfen und zurückgehaltenen neuen Transferkarten. Bestehende Typen und Grader; regelbasierte Auswahl; eine kurze Schülereinheit; Lehrkraftziel/Override und einfache Belegsicht; sichere Ereignisse, Resume und Kostenfallback. Keine sieben vollständig ausgebauten Themen, kein freier KI-Tutor, kein Gamesumbau.

| Arbeitspaket | Größenordnung | Annahme und wichtigste Unsicherheit |
|---|---:|---|
| Inhalte, Hilfen, Prüfung und Mapping | 10–20 Personentage | Fachperson und Gegenprüfung verfügbar; vorhandene Profile sind nur Ausgangsmaterial |
| Ereignisse, Identitätsadapter, sichere Bewertung/Freigabe | 10–18 Personentage | Stabile Classroom-Schnittstelle existiert oder gesondert freigegeben; sonst zusätzlicher Aufwand |
| Schülerablauf und Lehrkraftsicht | 8–14 Personentage | Bestehende Komponenten/Typen, keine neue native Oberfläche |
| Empfehlungskern und Wiederholung | 5–9 Personentage | Kleiner Graph, feste überprüfbare Regeln |
| Integration, negative Tests, Geräte und Pilotvorbereitung | 8–14 Personentage | Webpilot mit wenigen benannten Geräten; Rules/Offlinefehler können Spanne erhöhen |

Insgesamt grob **40–75 Personentage** für einen belastbaren kleinen MVP, zuzüglich Stufe 0, Wartezeiten und gegebenenfalls noch fehlender Identitätsgrundlage. Schätzung für ein kleines erfahrenes Team mit Fachreview, keine Zusage und kein Preis. Parallelisierung verkürzt nicht automatisch fachliche Abnahme oder Datenschutzklärung. Ein Wegwerfprototyp könnte deutlich kleiner sein, würde diese Betriebskriterien aber nicht erfüllen.

### Stufe 2 als erweiterter Pilot

Vorschlag: zwei Lehrkräfte und ein bis zwei Klassen, vier bis sechs Unterrichtswochen, danach verzögerte neue Prüfung. Teilnehmerzahl/Zeitraum sind Machbarkeitsannahmen, keine statistische Wirksamkeitsplanung. Zunächst nur autorisierte Testumgebung mit synthetischen Fällen, reale Pilotnutzung erst nach separatem Auftrag und Daten-/Zugangsfreigabe. Inhalte auf zwei bis drei Ziele erweitern, zugängliche Varianten und Lehrkraftaufwand verbessern. Etwa 15–30 zusätzliche Personentage für Ausbau/Betreuung/Auswertung; Unterrichts- und Wartezeit separat.

### Stufe 3 nur nach belegtem Nutzen

Alle sieben Mathethemen mit kuratierten Kompetenznetzen; nach Datenlage Vergleich statistischer Modelle gegen Baseline; begrenzte LLM-Erklärungen; einzelne passende Gamesadapter. Jeder Ausbau erhält eigene fachliche und technische Abnahme. Eine freie generative Lernplattform oder neuer 3D-Gamesbau ist kein notwendiger Folgeschritt. Aufwandszahl erst nach ausgewähltem Umfang; Contentabdeckung und Medien sind voraussichtlich große Treiber.

| Abhängigkeit | Was parallel möglich ist | Was vor Anschluss geklärt sein muss |
|---|---|---|
| Kapitel GC-CHAPTER-TESTS-01 | Kompetenz-/Aufgabenmodell, Pilot ohne Kapitel | Stabile optionale chapterId/Revision für Import; Kapitel allein keine Diagnose |
| Classroom/ASV GC-CLASSROOM-01 | Regeln/Inhalte und synthetische Sitzungen | Stabile Identität, Klassenrechte, Gerätewechsel; keine Ersatzkonten bauen |
| Pool GC-PEDAGOGY-KB-01 | Profile als Inhaltsanregung lesen | Schülerkarten, Lösungen, Hilfen und Mapping eigens prüfen; kein Nutzertest aus Poolintegration ableiten |
| Assessment | Format-/Schlüsselvertrag wiederverwenden | Neuer enger Übungsfeedbackadapter und Legacy-/Prüfungsregression |
| Games/FastQuiz/Lerninsel | Fachliche Aktivitätsbeschreibung | Tatsächlicher Adapter, vertrauenswürdige Ereignisse, Gerätebeleg; bestehende Spielarbeit nicht verändern |
| Native App | Webvertrag/UX planen | Paket-/API-Kompatibilität und physischer Resume-/Offline-Test vor Appfreigabe |

## Evaluation und Abbruchkriterien

Zuerst fachliche Replaytests: vordefinierte Antwortfolgen ergeben erwartete Empfehlungen; eine Lehrkraft beurteilt anhand der Belege, ob diese pädagogisch vertretbar sind. Dann kleiner Bedienpilot mit synthetischen Fällen. Erst danach Lernpilot mit genehmigten Zugängen und Datenwegen.

Für den Lernpilot A (gleiche kuratierte feste Folge) gegen B (gleicher Inhaltsbestand und vergleichbare Übungszeit, Regelanpassung) vergleichen. Gruppenzuordnung und Vorwissen ausbalancieren; bei kleiner Stichprobe Ergebnisse als Machbarkeits-/Richtungshinweis berichten. Eine zeitliche Einführung in verschiedenen Gruppen ist möglich, aber Unterrichts-/Lehrkraft-/Reihenfolgeeffekte bleiben zu berücksichtigen. Zur belastbaren Wirkungsbehauptung braucht es später eine gesonderte Studienskizze samt Stichprobenplanung.

Primär: neue, nicht zuvor eingeübte Transferaufgaben sowie zeitversetzte hilfefreie Aufgaben, möglichst mit unabhängiger Bewertung und vergleichbarer Schwierigkeit. Sofortiger Lernerfolg, Behalten und Transfer getrennt ausweisen. Wiederholtes Raten und Lernen derselben Antwortposition verbessern diese Maße nicht. Eine Evaluation enthält alle begonnenen Teilnehmenden, Abbrüche und fehlende Nachtests sichtbar; keine reine Auswertung der erfolgreichen Durchhalter.

Zusätzlich erfassen: unnötige/einseitige Wiederholungen, problematische Empfehlungen pro geprüftem Fall, unberechtigte Hochstufung, fehlerhafte Aufgaben, Motivation/Überforderung durch kurze Rückmeldung und Beobachtung, Abbrüche mit freiwilligem Grund, Lehrkraftminuten für Einrichtung/Review, Provider-/Backendkosten, Fehlerraten und Antwortlatenz. Klicks, Streaks und Sitzungszahl sind Betriebs-/Nutzungsdaten, kein Lernerfolgsbeleg. Unterschiede nach Zugang/Format zunächst durch manuelle Fallprüfung betrachten, ohne dafür unnötige sensible Merkmale zu erheben.

Pilot vorab stoppen oder betroffene Funktion zurücknehmen bei Lösungsoffenlegung/Identitätsvermischung, fachlich falschem Schlüssel, nicht löschbaren Profilen oder wiederholter Überforderung durch Schleifen. Ungeklärte oder gesperrte Aufgaben zählen nicht zur Schätzung. Produktvorgabe zur Prüfung: keine ungeklärte kritische Empfehlung in der fachlich geprüften Abnahmemenge; Kostenlimit nie überschreiten; alle Kernfälle unten bestehen. Bei unklarem Nutzen, unverhältnismäßiger Lehrkraftarbeit oder schlechterem verzögertem Transfer kein Ausbau, sondern Ursachenprüfung/Fallback auf feste Folge. Konkrete Nutzen-/Arbeitszeitgrenzen vor Echtdatenpilot gemeinsam festlegen.

## Akzeptanzkriterien und Teststrategie

Diese Matrix ist ein späterer Testplan; die beschriebenen Produkttests wurden im Konzeptauftrag nicht ausgeführt.

| Fall | Erwartetes Verhalten | Prüfart |
|---|---|---|
| Coldstart ohne Daten | Unbekannt anzeigen, kurze Einstiegsprobe, keine erfundene Stärke/Schwäche | Regeltest + Schülerdurchlauf |
| Import alter Note/Kapitelpunkte | Ohne Mapping/Revision keine Kompetenzbehauptung; ungeprüfte Bewertung offen | Import-/Legacyvertrag |
| Gleiche Karte mehrfach richtig | Kein Zählen als mehrere unabhängige Belege | Ereignisreplay |
| Raten und widersprüchliche Antworten | Neue kontrastierende Aufgabe, Unsicherheit erhalten | Fachreplay mit Auswahl/freier Antwort |
| Hilfen/Lösung vor Antwort | Unterstützte Leistung, neue hilfefreie Probe nötig | API-/UI-Sequenztest |
| Voraussetzung fehlt | Passende Darstellung/Teilkompetenz statt bloßer Schwierigkeitsabsenkung | Fachreplay Verlauf A |
| Tippfehler/Dezimalkomma/langsame Bedienung | Klärung/akzeptierte Normalisierung; Zeit allein bewirkt keine Abwertung | Grader-/Zugänglichkeitstest |
| Neue Themen und fehlender Pool | Nur freigegebene Inhalte; keine stille freie Generierung | Auswahl-/Fallbacktest |
| Drei Erfolge in einer Sitzung | Noch keine zeitversetzte Bestätigung | Regeltest mit Uhr/Belegfamilien |
| Lange Pause | Kurze Gegenprobe; alte Fähigkeit nicht automatisch gelöscht | Wiederholungsplanung |
| Überspringen/Beenden/„kann ich“ | Kein Fehler, keine falsche Meisterschaft, Ende ohne Sackgasse | Schülerdurchlauf |
| Zwei erfolglose Hilfefolgen | Alternative/Pause/Lehrkrafthinweis statt Endlosschleife | Zustandsreplay |
| Lehrkraftoverride | Beachtet, begründet und zeitlich begrenzt; Originalbelege erhalten | Rollen-/APItest |
| Gemeinschaftsgerät | Person B sieht weder Profil noch Antworten von A; kein Aliaswechsel ohne Zugriffsschutz | Negativer Mehrnutzer-/Gerätetest |
| Zwei Tabs/Retry/Offline | Ein Ereignis einmal zählen; Versionskonflikt sichtbar; quittierter Stand konsistent | Transaktions-/Reconnecttest |
| Resume nach Reload/Appneustart | Gleiche Revision, Hilfestufe und bestätigte Beobachtungen; lokale Sicherung kenntlich | Browser-/physischer Gerätetest |
| Falsche oder später gesperrte Karte | Kein weiterer Einsatz, Evidenz aus Schätzung entfernen, nachvollziehbar neu berechnen | Revision-/Rebuildtest |
| Benoteter Test läuft | Übung/LLM/Hilfe geben keine geschützten Lösungen oder Prüfungsfamilien frei | Projektion-/Freigabe-Negativtest |
| Rollen/Löschen/Export | Nur eigene berechtigte Daten, abgeleitete Daten mitlöschen, keine Lernstandsnote | Rules-/API-/Löschtest |
| Kostenlimit/Providerfehler | Harte Grenze und geprüfter Hinweisfallback; Übung bleibt benutzbar | Fehler-/Quota-Injektion |
| Geräte und Audio | Handy/iPad/Tastatur bedienbar, Fokus/Anweisung klar, nichts verdeckt | Echte Geräte und Assistenzbedienung |
| Neuer Algorithmus | Gleiche Belege, bessere unabhängige Vorhersage und verantwortbare Lernentscheidung gegenüber Baseline | Offlinevergleich, dann kontrollierter Pilot |

## Pädagogische Quellen und Reichweite

Die folgenden Primärarbeiten wurden aufgerufen und in den einschlägigen Ergebnis-/Methodenabschnitten gelesen; der IES-Guide und Shute sind ausdrücklich Synthesen. Entwurfsregeln wie Sitzungsdauer, Kartenanzahl und Schwellen stammen nicht unmittelbar aus diesen Studien.

- **Abrufübung:** Karpicke & Roediger (2008), *The Critical Importance of Retrieval for Learning*, Science. Experiment mit fremdsprachigen Wortpaaren: erneutes Abrufen nach erstem Erfolg verbesserte späteres Erinnern. Für GradeCrew begründet das eine spätere neue Abrufgelegenheit, aber keine Übertragung einer Effektgröße auf Mathematik oder einen Beweis für den gesamten adaptiven Modus. [Autorenfassung, Methoden/Ergebnisse S. 966–968](https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_Science.pdf).
- **Verteiltes Üben:** Cepeda et al. (2008), *Spacing Effects in Learning*. Faktlernen Erwachsener mit variierenden Abständen; günstige Abstände hängen vom späteren Behaltensintervall ab. Daraus folgt zeitversetzte Wiederholung, keine universelle 2/7/21-Tage-Optimierung und keine validierte kindliche Bruchdiagnose. [Autorenfassung, Methode und Ergebnisse](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf).
- **Beispiele, Scaffolding und adaptive Hilfen:** Salden et al. (2008), *Worked Examples and Tutored Problem Solving: Redundant or Synergistic Forms of Support?* Zwei Studien mit Geometrie-Cognitive-Tutor: ausgearbeitete Schritte schrittweise auszublenden ist vielversprechend; Klassenresultate replizierten nicht alle Laboreffekte, adaptiv war nicht durchgehend eindeutig besser als festes Ausblenden. Für GradeCrew: neue selbstständige Aufgaben nach Hilfe und Vergleich mit einfacher Baseline. [Autorenfassung, insbesondere Discussion S. 593–594](https://www.cs.cmu.edu/~aleven/Papers/2008/Salden_ea_CogSci2008.pdf).
- **Adaptives Lernmodell:** Koedinger & Corbett (2006), *Cognitive Tutors: Technology Bringing Learning Sciences to the Classroom*. Autorenkapitel beschreibt fachliches Modell, Model Tracing und Bayesian Knowledge Tracing; diese tutorbezogenen Verfahren setzen konkrete Wissenskomponenten voraus. Für GradeCrew ist das ein Architekturbeispiel, kein Nachweis, dass das eigene Mapping oder eine Schwelle kalibriert ist. [Autorenkapitel, Knowledge Tracing S. 143–144](https://pact.cs.cmu.edu/koedinger/pubs/koedingercorbett06.pdf).
- **Feedback:** Shute (2008), *Focus on Formative Feedback*. Gelesener zugänglicher Abstract der Originalpublikation empfiehlt unterstützende, spezifische und zeitlich passende Rückmeldung; Wirkung hängt von Lernenden und Aufgabe ab. Volltext war dort zugangsbeschränkt. Konkrete Feedbacktexte/Hilfestufen sind daher Designentscheidungen, nicht als aus einem ungelesenen Volltext bewiesen ausgeben. [Originalpublikation und Abstract](https://journals.sagepub.com/doi/10.3102/0034654307313795).
- **Praxisorientierte Evidenzsynthese:** Pashler et al. (2007), IES *Organizing Instruction and Study to Improve Student Learning*, Empfehlungen 1–7: Verteilung, Wechsel zwischen Beispiel und eigener Lösung, verbale/bildliche Verknüpfung und Abrufübung. Die Evidenzgrade unterscheiden sich je Empfehlung. Daraus folgt ein begründeter Formatmix, keine feste Bildschirmfolge und keine Wirksamkeitsgarantie. [Vollständiger Guide](https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf).

## Beschlossene Richtung und verbleibende Planung

Lerngehirn als anklickbarer Einstieg, große Themen nach Fachwahl, automatische Unterzielbestimmung, gezielte Schwierigkeitssprünge und gemeinsam wiederverwendbare KI-gestützte Aufgaben sind Martins konkretisierte Richtung. Schul-/Hausübungsbetrieb, genaue fachliche Regeln und Freigabeverantwortung werden vor einem Pilotauftrag festgelegt. Produktimplementierung benötigt einen Folgeauftrag.

## Prüfnachweis des Konzeptauftrags

Einstieg/Regeln und Release-Train auf aktuellem main gelesen; Remote-Refs frisch abgefragt. [Development Status 39372029039](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39372029039), Job 118461802742 erfolgreich; Fetch-/Audit-/Warnlogs gelesen. Warnungen betreffen unter anderem unregistrierte Branches/PRs und Überschneidungen; daraus folgt keine konfliktfreie Gesamtintegration. Aktuelle offene PRs über GitHub-Connector gesucht; verwandte Games-/Kapitelarbeit gelesen. Suche in TODO/Registry nach Adaptivität, Lernstand und Empfehlungen ergab keinen zugeordneten dedizierten Auftrag für diesen Umfang. Suchgrenze: kein vollständiger Inhaltsvergleich aller historischen Branches.

Aktueller Runtimecommit separat ausgepackt und die oben genannten Funktionen gelesen. Fremde offene Checkouts und synchronisierte sources unverändert. Quellenrecherche nur öffentliche Fachquellen; keine Schülerdaten, Klassenlisten oder Kontoinhalte. Produkttests, Geräteabnahme, Providerlauf und Deploy sind außerhalb dieses Konzeptauftrags. Technisch geprüft wurden die Dokumentationsdiffs und Registry-JSON; fachliche Abnahme der entworfenen Aufgaben und Produktwirksamkeit sind offen.
