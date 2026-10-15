# GC-GAMES-LEARNING-UX-01 — Fachmemo Lehrplan, Lernschwierigkeit und Kalibrierung

Auftrag: 15.10.2026, Quellenabschluss nach lokalem Datumswechsel 16.10.2026. Recherchefachauftrag durch bestehende Games-Zentrale. Bestätigter Nutzerfokus: Mittelschule Bayern, Klassen5–10. Nur Quellenlektüre, Analyse und Planvorschläge. Keine Runtimeänderung, Testsuite, echte Aufgabengenerierung, Provideranforderung, Integration oder Veröffentlichung. Requested Sol/medium laut Auftrag; tatsächliches Modell, Aufwand und Verbrauch nicht beobachtbar. Die Zahl „Stufe 3 zu schwer“ ist Martins Erfahrungsbericht; weder eine gemessene Kohortenwirkung noch eine nachgewiesene Fehlzuordnung zu einer Schulklasse. Stufe3 ist keine Jahrgangsstufe3.

## 1. Entscheidungsrelevantes Ergebnis

Der Bestand begründet feinere Übergänge: Im Mathematikgenerator ändern sich bei Niveau 2→3 teilweise Zahlenraum, Dezimalstellen und Operandentyp gleichzeitig. In Deutsch ändern sich Aufgaben-Schwierigkeitsband und Jahrgangsfenster gleichzeitig. Englisch hat in der gelesenen Lehrplanengine gar keinen Niveauparameter. Eine einheitliche neue Oberfläche darf diese drei Mechanismen nicht als bereits gleichwertige fünfstufige Lernskala darstellen.

Empfehlung: Fünf benannte Lernschritte pro Kompetenzfamilie als neues Planungsmodell entwickeln. Zahlenraum, Operation, Anzahl nötiger Schritte, Vorzeichen, Darstellungsform, Antwortformat und Hilfen einzeln beschreiben. Zeit und Wettbewerb separat wählen. Schule/Jahrgang sind ein Filter und Gesprächskontext, keine automatische Aussage über das individuelle Können. Stufe 3 erhält kleine Brückenaufgaben; falsche Antworten führen zuerst zu passender Hilfe und einer ähnlichen Aufgabe.

Der einfachste Mathematikstart lautet als Zielbild: Remy fragt nach dem Übungswunsch bzw. übernimmt den bestätigten Kontext; eine sichtbare Zusammenfassung nennt „5 Minuten · passende Rechenaufgaben · Hilfe möglich“; Start führt direkt in eine fortlaufende Aufgabenfolge. Bestehender Lehrerauftrag, Lernziel und gültige Aufgaben-/Bewertungsverträge bleiben maßgeblich. Remy und ein neuer Generator sind nicht durch dieses Memo technisch verbunden.

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

## 6. Vorschlag: fünf Schritte mit Brücke um Stufe3

Alle Beispiele sind neue Illustrationen für den Plan, keine neue Runtime/Generatorausgabe und keine empirisch validierte Klassenstaffel. Hilfen bleiben in allen Stufen aufrufbar. Innerhalb einer Runde zunächst eine Familie; neue Voraussetzungen nicht unbemerkt einschalten.

### Grundrechnen — Addition mit natürlichen Zahlen

| Stufe | Beispiel und richtige Antwort | Voraussetzung / nötige Handlung | Hilfe |
|---|---|---|---|
|1 Ankommen|4+3=7|Mengen/Zahlen bis10; ein Additionsschritt|Punktebild/Zahlengerade, +3 einzeln zeigen|
|2 Sicher werden|12+5=17|Zehner/Einer; Addition ohne Zehnerübergang bis20|12 in10+2 zerlegen|
|3 Brücke|8+5=13|Neu nur ein Zehnerübergang; 8+2+3|Teilaufgabe8+2=10, dann Rest3. Unterstufen3a Ergänzung bis10,3b teilweise vorgegeben,3c frei|
|4 Anwenden|28+17=45|Zehnerübergang bekannt; zweistellige Zerlegung|28+10=38;38+7=45|
|5 Übertragen|39+26=65; erkläre einen Rechenvorteil|Alternative Strategie wählen und prüfen|40+26−1=65, Erklärung optional führen|

Andere Operationen besitzen eigene Sequenzen. Bruchaddition etwa gleiche Nenner → Nenner als Vielfaches → gemeinsamer Nenner mit Hilfstabelle → selbständig erweitern/kürzen → gemischte Anwendung. Dezimaldivision, negative Faktoren und Binomik sind separate Familien mit eigenem Vorwissen, keine automatische Stufe5 dieser Additionstabelle.

### Deutsch — getrennte Wortarten- und Satzgliederpfade

| Stufe | Wortarten: Aufgabe → Lösung | Satzglieder: Aufgabe → Lösung | Voraussetzung / Hilfe |
|---|---|---|---|
|1|„Der Hund schläft.“ Markiere das Nomen → Hund|Im selben Satz: Wer schläft? → der Hund (Subjekt)|Begriffe mit Beispielen einführen; Frage schon vorgeben|
|2|„Die kleine Katze schläft.“ Adjektiv → kleine|Was tut die Katze? → schläft (Prädikat)|Ein kurzer Hauptsatz, Zielkategorie klar; Eigenschafts-/Verbprobe|
|3|„Mia trägt eine rote Tasche.“ Ordne trägt/rote/Tasche → Verb/Adjektiv/Nomen|Wen oder was trägt Mia? → eine rote Tasche (Akkusativobjekt)|3a nur Zielwort/Frage,3b markierter Ausdruck,3c frei; Wort und Wortgruppe unterscheiden|
|4|„Er schenkt seiner Schwester ein Buch.“ er → Personalpronomen; schenkt → Verb|Wem schenkt er ein Buch? → seiner Schwester (Dativobjekt)|Objekte unterscheiden, Frageprobe bleibt abrufbar|
|5|„Am Morgen liest die neugierige Schülerin im Garten.“ neugierige → Adjektiv|Stelle den Satz um → „Im Garten liest die neugierige Schülerin am Morgen.“ Subjekt bleibt die neugierige Schülerin|Umstellprobe anwenden, Struktur trotz Reihenfolge erhalten; kein Kategorienwechsel im Antwortsatz|

Stufe3 führt nicht gleichzeitig lange Nebensätze, mehrdeutige Wörter und „alle falschen Zuordnungen“ ein. Genitivobjekt, Attribute und Subjektsätze erhalten eigene später kalibrierte Familien, statt nur die Antwortliste mit Fachbegriffen zu vergrößern.

### Englisch — ein bekanntes Wort produktiv machen

|Stufe|Beispiel → akzeptierte Lösung|Voraussetzung / Hilfe|
|---|---|---|
|1 Wiedererkennen|Bild Hund, Wahl cat/dog → dog|Wort vorher vorgestellt; Bild optional vorlesen|
|2 Richtung festigen|dog auf Deutsch → Hund|Bekanntes Wort wiedererkennen; begrenzte, klare Optionen|
|3 Abrufen|Hund auf Englisch → dog|Vorwissen aus1/2;3a Wortanfang d__,3b ohne Hinweis,3c nach kurzem Abstand. Zunächst keine Richtungswechsel|
|4 Kontext|„I have a ___.“ (Hund) → dog|Bekannte Satzschablone und Wort; Satz bei Bedarf vorlesen|
|5 Übertragen|„Schreibe: Mein Hund ist klein.“ → My dog is small.|Bekannte Wörter/my/is/small und Satzbau; Großschreibung/Punkt im Sprachlernfeedback gesondert bewerten|

Eine freie Antwort erfordert ein nachvollziehbares Akzeptanzschema: Schreibvarianten, Synonyme, Tippfehler und tatsächlich veränderte Bedeutung getrennt behandeln. Bei eigenen Listen nicht jeden anderen Seteintrag als sinnvollen Distraktor voraussetzen. Spätere falsche Freunde/Phrasal verbs erhalten eine eigene fachliche Progression.

## 7. Remy, Testvarianten und Advanced fachlich begrenzen

Remy übernimmt bestätigtes Thema, Aufgabentyp, Lernziel und Stoffgrenze; zusätzliche Angaben bleiben optional. „Ähnliche Aufgaben“ heißt: gleiche Zielhandlung und vergleichbare Anforderungen, aber variierte Zahlen/Kontexte/Darstellungen innerhalb eines validierten Aufgabenprofils. Ein Profil enthält Vorbedingungen, Zahlen-/Operandengrenzen, Schrittfolge, erlaubte Hilfen, Zielantworten, Distraktoren/typische Fehler, Quelle und Prüffassung. Beispiel38+7 wird zu46+8 nur wenn beide genau einen Einer-Zehnerübergang verlangen;38+2 wäre eine leichtere Zwischenform,376+287 eine zusätzliche Belastung.

Aus einem vorhandenen Test nicht blind einzelne Nomen/Zahlen austauschen. Lösung neu berechnen, Mehrdeutigkeit prüfen, Einheit/Notation erhalten, Schwierigkeitsmerkmale vergleichen und Herkunft/Version protokollieren. Bild-/Audioaufgaben brauchen echte unterstützte Medien oder bleiben ausgeschlossen; generierte Aufgabe wird nicht ungeprüft veröffentlicht. Bestehende Wissensreise-/Testadapter und serverseitige Lösungsschlüssel bleiben Verträge für einen späteren Fachauftrag. Keine eigene Questiongen-Implementation in diesem Plan.

Advanced bündelt Land, originale Schulart/Bildungsgang, Jahrgang, Fach, konkrete Kompetenz, Voraussetzungen, Aufgabenformat, Zahlendomäne, Hilfen, Dauer und Wettbewerb. Originalschulart und vergleichende Kategorie getrennt speichern. Quellenvertrauen wird angezeigt; „vorgeschlagen“ ist nicht „amtlich freigegeben“. Bei fehlender belegter Aufgabe klaren Leerlauf mit Alternativen zeigen, nie still auf ältere/höhere/alle Aufgaben ausweichen.

## 8. Kalibrierung und vorgeschlagene Gates

Zuerst Lehrkraftprüfung pro Familie: fachlich korrekte Antwort, eindeutiger Auftrag, Voraussetzungen, passende Hilfe, plausibler Distraktor, verlässliches Kompetenzmapping. Danach kleine formative Nutzungsprobe mit verschiedenem Vorwissen; beispielsweise5–8 Personen pro vorgesehener Zielgruppe und Gerät, keine repräsentative Wirksamkeitsstudie. Aufgaben erklären lassen, Irrwege beobachten, freiwillige Stopps ermöglichen. Persönliche Daten minimieren, vorhandene Einwilligungs-/Schulverträge verwenden; kein neues Schülerprofil aus diesem Memo.

Vorgeschlagene, noch nicht gemessene Produktgates:4 von5 Testpersonen starten die erste passende Aufgabe ohne fremde Erklärung; keine kritische fachlich falsche/missverständliche Aufgabe im freizugebenden Referenzsatz; Hilfe und Abbruch bei allen beobachteten Abläufen erreichbar. Diese kleinen Zahlen dienen nur einem frühen Usability-Check. Sie garantieren keine Eignung für die Population.

Je Aufgabe getrennt erfassen: erster Versuch richtig/falsch, Hilfe angefordert, Korrekturversuch, übersprungen, aktive Lösungszeit (ohne Hintergrund/Pause), Kompetenz-/Profilversion und Antwortformat. Langsame richtige Antwort ist kein Wissensfehler. Gleicher Wortlaut nach Retry kann Auswendiglernen der Option statt Kompetenz zeigen. Optionenraten, Leseaufwand, Gerät und Medien bleiben mögliche Störfaktoren.

Adaptive Startregel als später zu testender Vorschlag: nach zwei aufeinanderfolgenden Fehlern in derselben Familie Hilfe/leichtere Schwesteraufgabe anbieten; nach z.B.8 von10 selbständig korrekten Erstversuchen aus mindestens zwei variierenden Aufgabenformen einen kleinen nächsten Schritt anbieten, mit Rückkehrmöglichkeit. Ein10erFenster,80%-Grenze oder zweiFehlerTrigger sind keine Forschungsbefunde und keine automatische Kompetenzdiagnose. Zeit allein löst weder Auf- noch Abstieg aus. Nicht innerhalb eines Speedrankings unbemerkt die Anforderungen ändern.

Späterer Lernnachweis: lehrkraftgeprüfte neue Parallelaufgaben nach einer Verzögerung und Transferbeispiele; Vergleich mit Ausgangslage und Beobachtung der Hilfenutzung. Erst dann Lernwirkung vorsichtig beurteilen. Keine Wirkgarantie, kein Notenersatz, keine globale Fähigkeitszahl aus Spielscore. Nächster ausführbarer Schritt bleibt die fachliche und visuelle Prüfung eines kleinen echten Referenzabschnitts nach Freigabe des Planbuchs.

## 9. Reviewstand und Übergabe

Eigener Quellenbeitrag, keine unabhängige Freigabe des Gesamtplans. Keine neuen Vollkorpus-Lektüren; vorhandene Detailregister und lokale Umsetzungsaussagen nur mit ihrer Grenze übernommen. Quellensnapshots liegen neben diesem Memo, SourceLedger.json enthält die institutionellen Quellen und geprüften Codepfade. Zielkohorte inzwischen bestätigt: Mittelschule Bayern5–10. Offen: genaue Oberfläche von Martins Stufe3-Erfahrung, heutiger verifizierter Game-Release-/Gerätestand, Integration des lokalen Remy/Emmi-Kandidaten sowie tatsächliche Lernkalibrierung. Für den unabhängigen inhaltlichen Review des fertigen Gesamtplans verfügbar.

## Ergänzung: bestätigter Fokus Mittelschule Bayern5–10

Die drei Fünf-Schritte-Beispiele illustrieren Voraussetzungen einzelner Lernziele, nicht eine Abdeckung aller Jahreslehrpläne5–10. Auch Klasse9/10 darf grundlegende Addition nachholen, mit respektvollem altersangemessenem Kontext und neutralen Lernzielnamen. Keine Bezeichnung wie „Klasse1-Niveau“ oder global „schwacher Schüler“ aus einem Übungsbedarf ableiten.

Am16.10 zusätzlich gezielt geöffnete aktuelle LehrplanPLUS-Endpunkte: [D6 Regelklasse](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/6/deutsch/regelklasse), [M9 Regelklasse](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/9/mathematik/regelklasse), [Mathematik M10](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/10/mathematik/mittlere-reife-klasse), [Englisch M10](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/10/englisch/mittlere-reife-klasse). Das sind gezielte Weg-/Progressionsprüfungen, keine neue Vollanalyse.

M10 Mathematik hat u.a. Potenzen/Wurzeln, Exponentialfunktion, Ähnlichkeit und Trigonometrie. Die Potenzgesetze schließen negative Exponenten ein. Daraus folgt, dass reine größere Grundrechenzahlen keinen vollständigen höheren Lernbereich repräsentieren. Der UI-Filter muss Originalschulweg Regelklasse/M-Zweig erhalten; „Mittelschule10“ darf nicht ohne konkreten Bildungsgang pauschal auf jedes spätere10erAngebot abgebildet werden. Für nicht ausgewertete Kompetenzbereiche bleiben Quellenanker/inhaltliche Prüfung offen. Ebenso keine durchgängige Jahrgangsfreigabe aus den vorhandenen Vocab-Themen introduced5–9 behaupten. Datumsstempel einer Portalquelle, Covid-Priorisierungsdokumente und Suchcrawler-Daten ersetzen keine geprüfte aktuelle Fassung.
