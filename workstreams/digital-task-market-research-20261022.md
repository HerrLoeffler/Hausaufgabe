# GC-EXTENDED-QUESTION-TYPES-01: Markt- und Fachdidaktikrecherche

## Auftrag und Scope

Nutzer beauftragt eine sehr breite Internetrecherche zu digitalen Aufgaben über Grundschule, Haupt-/Mittelschule, Realschule, Sek I/II, Gymnasium und berufliche Schulen, vorhandenen Lösungs-/Lernangeboten sowie daraus ableitbaren KI-Aufgabentypen für GradeCrew. Bestehende Task-ID und gemeinsamer Fundus wiederverwendet; keine zweite technische Implementierung begonnen.

## Gesicherter Stand

- Branch: `docs/digital-task-market-research-20261022`; Ziel `main`, isolierter Dokumentationskandidat.
- Ursprünglicher main: `2b3f2863d3dc2dc067340dbf61ecf70ce47c9094`; früher Zwischenstand: `ad62871971cf5a0cd4a2191ab83088368adec179`.
- Vor Abschluss aktuelles main `f1e030ca642942e3b42f75a3ff091240793549fd` sowie START_HERE, AGENTS, STATE, Workstreams-README, TODO, Registry und bestehender Aufgabenfundus abgeglichen. Abschlusssnapshot baut auf dessen vollständigem Baum auf; zwischenzeitliche Native-/TestFlight-Dokumentation bleibt erhalten.
- Basisfundus aus PR285 bereits gemergt; dessen 13 VIS-, 5 EXP- und 8 MOD-Familien sind Referenz, keine pauschale Live-Funktionsbehauptung. PR265/PR271 und weitere Implementierungsarbeit werden nicht ersetzt.
- Live Development Status zuletzt Run [39843476057](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39843476057), Job120050461501: success, Logs tatsächlich gelesen. Existing Primary `docs/visual-learning-principles-20261022` +0/-5 zu main; kein offener Primary-PR in diesem Audit. Registry ergänzt lediglich den eigenen Related Branch. Allgemeine Überschneidungen in TODO/Registry/Fundus bewusst additiv behandelt.

## Ergebnis

148 Angebots-/Fach-/Referenzprofile, 163 eigene Aufgabenentwürfe. Aufteilung: 28/44 MINT, 30/45 Sprache/Grundbildung, 35/50 Gesellschaft/Künste/Beruf, 30/10 fächerübergreifend, 10/14 fachliche Ergänzungen, 8/0 Lösungsdienste, 7/0 Qualitätsreferenzen (Quellen/Ideen). Einträge sind keine einzigartigen Anbieter; Ideen keine zusätzlichen technischen Fragetypen.

Kanonische Dateien:

- [Synthese](../docs/learning/DIGITAL_TASK_MARKET_RESEARCH_20261022.md): Marktgruppen, Fachmuster, Schulstufen, D/H/L, KI-Vertrag, Lösungshilfen, Prioritäten und Grenzen.
- [Strukturierter Katalog](../docs/learning/research/digital-task-market-20261022.json): vollständige Quellen und Aufgaben, stabile IDs, Original-URLs, Evidenz-/Rechtehinweise, Lernziele, Beispiele und Auswertung.
- [Prüfnotiz](../docs/learning/research/digital-task-market-20261022-review.md): konkret aufgelöste Fach-/Synthesebefunde und Datenvalidierung.
- Nutzerartefakte: filterbare XLSX-Ausgabe und PDF-Synthese; keine Medien-/Lehrwerkskopien in den Runtime-Pool aufgenommen.

## Tatsächliche Prüfungen und Grenzen

Öffentliche Originalseiten und ausdrücklich markierte offizielle Indexbelege recherchiert. Keine Konten angelegt, Abos gekauft oder kostenpflichtigen externen Produktläufe durchgeführt. Fachreview und unabhängiger Synthesereview mit konkreten Korrekturen abgeschlossen. JSON-Struktur, eindeutige IDs, Quellenverweise und vorhandene VIS/EXP/MOD-IDs geprüft. XLSX-Export/Wiederimport, native Tabellen/Filter/Fixierung, Formelzählung und visuelle Darstellung geprüft. Keine Laufzeit-, Generator-, Server-, Browserprodukt- oder Gerätetests dieses Projekts behauptet.

Drei fachliche Unteragenten beauftragt: Sprachen/Primarstufe, MINT/Informatik, Gesellschaft/Künste/Beruf; zusätzliche Cross-Recherche, Fachreview, Synthesereview und Artefaktaufbereitung. Angeforderte Agentkonfiguration `gpt-6.1-sol`, high; tatsächliche Provider-/Token-/Kostenwerte nicht separat ausgelesen. Keine separaten Task-IDs oder Ausführungsbudgets angelegt.

## Produkt- und Release-Status

Recherche und Dokumentation auf eigenem Branch. Kein Generator-/Poolimport, keine Änderung von Anwendungscode, API, Rules, Lösungsspeicherung oder Release-Manifest. `GRADECREW_STATE.json` bleibt unverändert, weil keine Release-/Deploy-Stufe geändert wird. Kein Staging-/Schul-Live-/Production-Deploy.

## Nächster ausführbarer Schritt

Die vorgeschlagenen 20 Referenzaufgaben pro Fachkontext ausarbeiten: MATH01, MATH04, LANG03, LANG06, MATH10, LANG13, SOC02, SOC11, MATH11, CHEM01, CS03, SOC39, SU01, BIO04, PHY05, SUP07, LANG21, LANG25, SOC21, SOC38. Jeweils Material, Lösung/Alternativen, Korrektor oder Rubrik, Hilfeverlauf und Lehrkraftvorschau prüfen. Das ist ein Vorschlag aus der Recherche, noch keine allgemeine Implementierungs- oder Deployfreigabe.

## Offene Grenzen

Kein flächendeckendes Mapping sämtlicher Bundesländer, Jahrgänge und Ausbildungsberufe. Kein vollständiger Preis-/API-/Rechte-/Accessibility-Audit fremder Produkte und kein empirischer Wirksamkeitsnachweis. Quellenzugang und Verfügbarkeit können sich ändern; scoyo, Duolingo for Schools und fobizz sind mit aktuellem differenziertem Status erfasst. Fachliche Eindeutigkeit, sinnvolle Alternativen und offene Beurteilung nicht durch einen allgemeinen freien KI-Korrektor ersetzen.

## Ergänzungsauftrag 25.10.2026 · abgeschlossen als Recherche

Martin fragt nach konkreten bisherigen Aufgaben und weiteren neuen nutzbaren Formaten. Fortsetzung unter derselben Task-ID und Draft-PR290; Recherche und Dokumentation. Der frühere Zwischenstand mit 13 Kandidaten ist durch den vollständig geprüften Katalog ersetzt.

### Ergebnis der Ergänzung

- 30 Vorschläge gesichtet; 27 aufgenommen: **7 neue Aufgabenfamilien, 17 fachliche Erweiterungen, 3 Lernabläufe**.
- 40 Quellenprofile, einschließlich Belegen für ausdrücklich nicht neu gezählte Verfahren; nicht 40 einzigartige Anbieter.
- NL08 und NS08 als vorhandene Varianten ausgeschlossen; NS09 mit NM09 fusioniert. NM04, NM06 und NS05 nach unabhängigem Review als Untertypen eingeordnet.
- [Vollständige Synthese](../docs/learning/DIGITAL_TASK_EXTENSION_20261025.md), [strukturierter Katalog](../docs/learning/research/digital-task-extension-20261025.json), [Prüfnotiz](../docs/learning/research/digital-task-extension-20261025-review.md).
- Nutzerartefakt: filterbare XLSX mit allen 27 Ideen und 40 Quellenprofilen; JSON zum Weiterarbeiten. Basiskatalog mit 163 Entwürfen bleibt erhalten. Aus den zusammen 190 Entwurfs-/Ergänzungseinträgen darf keine Zahl implementierter Fragetypen abgeleitet werden.

### Quellen, Reviews und konkrete Korrekturen

Drei getrennte Fachrecherchen (MINT, Gesellschaft/Künste/Beruf, Sprache/Methoden), ergänzende Root-Recherche, unabhängiger Neuheitsreview gegen den 163er-Katalog und VIS/EXP/MOD sowie unabhängiger Fachreview der Tabellen-, Beweis- und Würfelbeispiele. Angefordert jeweils `gpt-6.1-sol`/`medium`; tatsächliche Provider-/Nutzungswerte unbekannt. Verantwortlicher Chat bleibt der bestehende Forschungsfachchat; Chat-Link unbekannt. Keine fremde aktive Schreibzuständigkeit übernommen.

Korrekturen im kanonischen Stand: Zuschlagssatz und kopierbare Zellbezüge einschließlich zulässigem F$1; echte Neuberechnung statt Cachevergleich; mehrere Beweisreihenfolgen über logische Abhängigkeiten; keine falsche Positivitätsannahme; Würfelspiegelung über das gefaltete Modell prüfen; positive Merkmalsformulierung bei vier Außenseitern; Konsens nicht als Wahrheit und Zweitabstimmung nicht als stabilen Kompetenznachweis behandeln. KI-Bedarf und Autorenvoraussetzungen getrennt. Eigene Varianten ausdrücklich von belegten Produktfunktionen getrennt.

JSON-IDs, Referenzen und Zählung geprüft. Die Beispiele zu Formeln, Würfelgegenüberseiten, Ziffernkombinationen, Sortiernetz, Wahlverfahren und Mess-/Bestandsrechnung unabhängig nachvollzogen. XLSX: 712 Feldabgleiche, Zählformeln 27/7/17/3, keine Formelfehler; zwei native Tabellen mit Filter, fixierte Überschriften/IDs, beide Blätter in fünf Ausschnitten visuell geprüft. Kein Runtime-, Generator-, Import-, Browserprodukt-, Server- oder Gerätetest dieser neuen Entwürfe behauptet.

### Abgleich mit paralleler Arbeit

Aktuelle main-Basis für den Abschlusssnapshot: `41af350be3f99d7f6d6b2782ac56b3db2140171e`. Deren vollständiger Baum bildet die Grundlage; zwischenzeitliche Native-, Domain- und Pilotänderungen bleiben erhalten. Die aktuelle Registry weist `test/visual-24-pilot-20261025` als Primary und `feature/visual-prototype-ai-02-20261021` als Integration Target aus. Diese Zuständigkeit wird nicht geändert; nur der eigene Forschungsbranch wird als Related Branch ergänzt.

Development-Status Run40183534335, Job121139415611 erfolgreich, relevante Logs gelesen. Dessen damaliger Snapshot führte noch den Dokumentationsbranch als Primary; die neuere main-Registry ist für aktuelle Zuständigkeit maßgeblich. PR265/271/296 bearbeiten Prototypen und bleiben außerhalb dieser Recherche. Die neuen Erkenntnisse aus 24 Probetests in `INTERACTIVE_TASK_PRINCIPLES.md` gelesen und unverändert erhalten. Gemeinsame TODO-/Registry-/Katalogänderungen additiv abgeglichen.

### Frühere Priorisierung vor Nutzerkorrektur (überholt)

Sieben begrenzte Referenzaufgaben ausarbeiten: NM01 (vier Außenseiter), NM02 (alle Ziffernlösungen), NR02 (Beweisbausteine), NR03 (Körper und Netz), NL01 (vergleichendes Qualitätsurteil), NL03 (verteilte Hinweise), NR01 (funktionierende Tabelle). Je Lernziel, eigenes Material, zulässige Lösungen, Teilpunkte, Hilfen, zugängliche Bedienung und Lehrkraftvorschau festlegen. Strategisch später NL02 (lehrbarer Agent), NM05 (Trainingsdaten), NS03 (Georeferenzierung), NS06 (Musikcode). Das sind Priorisierungsvorschläge, keine allgemeine Implementierungs- oder Deployfreigabe.

Recherche und Quellenbelege sind gesichert; unabhängige GradeCrew-Lernwirksamkeit, Unterrichtserprobung und technische Produktintegration stehen für diese neuen Entwürfe aus. Keine Änderung von Anwendungscode, Rules, Releasezustand, Laufzeit-Pool oder Deployment.

## Nutzerkorrektur: kurze benotbare Leistungsnachweise · 25.10.2026

Martin begrenzt den Aufgabenfundus ausdrücklich: schnelle digitale Leistungsnachweise mit nachvollziehbaren Punkten und Noten, einfache Bedienung, keine Excel-Dateibearbeitung, kein Agentenbetrieb und keine komplexen Projekte. Die breite vorherige Empfehlung war zu weit. [Verbindliche Auswahlgrenze](../docs/learning/QUICK_ASSESSMENT_SCOPE_20261025.md) gilt für beide Recherchepakete. 27 neue Ideen gesondert geprüft: 12 eng begrenzt geeignet, 6 nur deutlich vereinfacht, 9 außerhalb. JSON-Feld quick_test_scope hat Vorrang vor historischen Rechercheprioritäten. Frühere XLSX bleibt breite Recherchefassung; kein aktueller Einbauplan.

Aktuelle Referenzkandidaten: NM01, NR02, NR03, NM03, NS02, NL04, NL05. Vorhandene kurze Fehlerkorrektur-, Beleg-, Diagramm-, Zuordnungs- und Rechenformate bleiben der Standard. Ausgeschlossene Agenten-, Exceldatei-, Modelltraining-, Georeferenzierungs-, Musikproduktions- und Gruppenworkflows nicht als automatische spätere Roadmap führen.

Prüfung: unabhängiger Read-only-Scope-Review angefordert als gpt-6.1-sol/medium (bereichsübergreifende Abgrenzung); actual/Usage unbekannt. Alle 27 IDs klassifiziert, Quellen und Forschungszählung unverändert, historische Prioritäten erkennbar erhalten. Kein Runtime-Test nötig: ausschließlich Markdown/Recherche-JSON. Assurance: reine Produkt-/Dokumentationskorrektur ohne neue Datenflüsse, Berechtigungen oder Bewertungsimplementierung; operative SEC-/PRIV-Releaseprüfungen für diesen Diff nicht relevant, bei Umsetzung neu auswählen. Keine bestehende Kontrolle als erfüllt behauptet.

Remote-main c963c330c9b71ffec794ee0c0e349744ea06b8fb geprüft; neue Pilot-/TODO-/Prinzipienänderungen erhalten. Development-Status Run40189467911 / Job121157180252 success, relevante Logs gelesen: Primary test/visual-24-pilot-20261025, Integration feature/visual-prototype-ai-02-20261021, PR296; eigener Draft-PR290 bleibt Dokumentationsarbeit. Kein Eingriff in andere Owner, keine neue Task-/Budgethistorie. Verantwortlicher Forschungsfachchat wie bisher; Chat-Link unbekannt.

Nächster Schritt: wenige kurze Einzelaufgaben mit vorgegebenem Material, zulässigen Antworten und Punkten ausarbeiten. Produktintegration/Import/Deploy nicht beauftragt. Releasezustand unverändert.
