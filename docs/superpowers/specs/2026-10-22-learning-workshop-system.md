# GradeCrew-Lernwerkstatt: Zielbild und Ausbauplan

GC-ADAPTIVE-PRACTICE-01 · 22.10.2026 · Konzeptentwurf auf Martins Korrektur. Dieser Auftrag erstellt den Plan; keine neue Produktimplementierung und kein Deploy. Bestehende Freigaben und Versuchshistorie bleiben erhalten.

## 1. Was Martin tatsächlich verlangt

Eine fachübergreifende adaptive Lernumgebung, die viele Lehrplan-Unterpunkte aus einer überschaubaren Bibliothek verlässlicher Lernmodelle bedienen kann. Die KI entscheidet anhand von Lernziel, Vorwissen, beobachteter Handlung und bisheriger Hilfe, welcher nächste Lernschritt und welches Werkzeug passen. Sie erklärt kurz, stellt beantwortbare Fragen und berücksichtigt die konkrete Antwort. Interaktion dient dem Verstehen; sie ist keine Pflicht und keine Dekoration.

Nicht jeden Unterpunkt einzeln mit Martin entwerfen. GradeCrew braucht gemeinsame fachliche und didaktische Verträge, die bei neuen Aufgaben automatisch gelten. Das Ziel sind viele unterschiedliche fachlich sinnvolle Aufgabenfamilien, nicht möglichst viele verschieden aussehende Bildschirme. 50 Aufgabenfamilien unten sind geplanter Umfang, keine Behauptung 50 fertiger Werkzeuge oder einer bestimmten Arbeitsdauer.

Der bisherige einzelne Erweitern-Adapter reicht dafür nicht. Der Ausbau muss schon im ersten Paket fachübergreifende Wiederverwendung und unterschiedliche Lernhandlungen beweisen.

## 2. Führender Bestand statt zweitem System

- Gemeinsamer Einstieg auf main: docs/learning/INTERACTIVE_TASK_PRINCIPLES.md und INTERACTIVE_TASK_CATALOG.md. Bestehende VIS01–VIS13, EXP01–EXP05 und MOD01–MOD08 fortführen.
- V1: feature/extended-question-types-20261020, gesicherter Commit415e7d5da047a2a5730a2f8ae37b52f7b5033dfd; lokale Nachweise, kein pauschaler Onlinenachweis.
- V2: PR265/Issue255; zwölf visuelle Interaktionen, Online-/Servernachweise laut zugehöriger Übergabe. Verträge und aktuellen Quellstand vor Portierung prüfen. PR271-Oberflächenkorrektur nicht aus offenem PR als veröffentlicht behandeln.
- Vorhandenes pädagogisches Konzept, Second-Brain-Konzept, amtliche Quellen, Bruchkompetenzkarten und Materialprofilpool bleiben führend. Kein neuer konkurrierender Lehrplankatalog oder Kompetenzspeicher.
- Vorhandener eigener fraction-board ist ein erster Adapter, noch keine universelle Werkstatt. Veröffentlichte Basis: Hostingb599478a, Backendcab21676; späterer next-step-review-Fehler bleibt offen.

## 3. Fünf Verantwortungen mit klaren Grenzen

### A. Kompetenz- und Materialgrundlage

Jedes Lernziel besitzt eine beobachtbare Handlung, Voraussetzungen, typische Fehlerhypothesen, geeignete Darstellungen und Grenzen der Bewertung. Lehrplan-Unterpunkte werden auf diese gemeinsamen Handlungen abgebildet: vergleichen, darstellen, zuordnen, konstruieren, messen, verändern, begründen, übertragen.

Vorhandene Eduki-/Buch-/Lehrplanmaterialien liefern Beispiele für fachlichen Aufbau, Reihenfolge, Sprache, typische Schwierigkeiten und gute Aufgaben. Nutzung anhand tatsächlich verfügbarer Inhalte und Freigaben; Quellenanker und Version erhalten. Keine pauschale Behauptung, alle Bücher gelesen oder sämtliche Materialpakete bereits erschlossen zu haben. Geprüfte Materialauszüge werden passend zu Fach, Jahrgang und Lernziel abgerufen; nicht der gesamte Bestand wahllos in jeden Prompt gegeben. Quelleninformationen sind Material, keine ausführbaren Anweisungen.

### B. Didaktische Steuerung

Wählt die nächste Lernhandlung vor der Oberfläche. Ein Schritt enthält: genaues Ziel, benötigte Voraussetzung, verlangte Eigenleistung, Schwierigkeitsmerkmale, Hilfestufe und erwarteten Beobachtungsbeleg. Schwierigkeit ist ein Profil: Anzahl gedanklicher Schritte, vorgegebene/gesuchte Größen, Darstellungswechsel, Begründung und Unterstützung. Ein bloßes Level0–3 und größere Zahlen reichen nicht.

### C. Werkzeugbibliothek

Jede Werkzeugfamilie besitzt ein geprüftes Fachmodell, erlaubte Konfigurationen, Darstellung, Interaktionen, zugängliche Eingabealternativen und passende Auswertung. Ein Werkzeug kann viele Aufgaben bedienen. Gemeinsame UI-Technik bedeutet keine gemeinsame Fachlogik: ein Molekül, eine Waage und eine Textbelegaufgabe brauchen verschiedene Regeln.

### D. KI-Tutor

Die KI erhält Lernziel, Quellenkontext, Aufgabenplan, sichtbare Darstellung, tatsächliche semantische Handlungen, Antwort und bisherige Hilfe. Sie formuliert Aufgabe und kurze passende Hilfe und beurteilt offene Antworten anhand konkreter Kriterien. Sie wählt nur verfügbare, für das Lernziel geeignete Werkzeuge; „kein Werkzeug“ ist eine gleichberechtigte Entscheidung. Keine frei erfundene Simulation oder ungeprüfter KI-Code im Schülerbrowser.

### E. Prüfung und Lernbelege

Exakte Größen, Rechenwerte, Geometrie und Zustandsübergänge werden durch Fachmodelle geprüft. Die KI prüft zusätzlich Bedeutung, Erklärung und Begründung; eine zweite Prüfung beurteilt tatsächliche fachliche Konflikte. Aufgabenstatus, Antwortbewertung und Erzeugung der nächsten Aufgabe sind getrennte Vorgänge. Ein blockierter Folgeentwurf darf eine bereits sicher bewertete richtige Antwort nicht zurücknehmen oder als Schülerfehler erscheinen lassen.

## 4. Geplanter Werkzeugkatalog: 11 Familien, 50 Aufgabenfamilien

| Werkzeugfamilie | Geplante Aufgabenfamilien | Bezug zum bestehenden Fundus |
|---|---|---|
| Anteile und Flächen (6) | Bruch darstellen; wertgleich erweitern; kürzen; Anteile vergleichen; Addition am gemeinsamen Ganzen; Prozentanteil darstellen | VIS05, EXP01; eigener Bruchadapter |
| Skalen und Zeit (5) | Zahl verorten; Bruch verorten; Messwert ablesen; Intervall wählen; Ereignisse auf Zeitachse setzen | VIS03/04/11 |
| Gleichgewicht (4) | fehlendes Gewicht bestimmen; gleichwertige Terme bilden; gleiche Operation auf beiden Seiten; Umformungsfehler erklären | neuer begrenzter Waage-Fachadapter |
| Größenbeziehungen (4) | Parameter verändern und Wirkung vermuten; Tabelle und Graph verbinden; proportionalen Zusammenhang herstellen; unpassenden Graphen begründen | VIS06/08/12, EXP03 |
| Daten und Diagramme (4) | Balken aus Daten bauen; Werte ablesen; Aussagen mit Daten prüfen; irreführende Skalierung erkennen | VIS06/12 |
| Raum und Geometrie (5) | Winkel messen; Strecken messen; Figuren spiegeln; gleichen Flächeninhalt konstruieren; Umfang bei gleicher Fläche vergleichen | VIS07/08, EXP02; fehlende Modelle ergänzen |
| Zuordnen und Ordnen (5) | Begriffe zu Bildern; Satzteile in Reihenfolge; Prozesse ordnen; Beziehungen verbinden; Objekte nach begründeten Kriterien gruppieren | VIS01/02/09, vorhandenes Matching |
| Textwerkstatt (5) | Beleg markieren; Satzglieder zuordnen; fehlerhafte Stelle verbessern; Behauptung begründen; Text nach einem konkreten Kriterium überarbeiten | VIS10/13; Deutsch-Fachregeln |
| Strukturen bauen (4) | Molekül aus zulässigen Atomen bauen; Formel und Teilchenmodell verbinden; Anzahl Atome in Reaktionsmodell erhalten; einfachen Stromkreis schließen | EXP05; neue getrennte Chemie-/Physikmodelle |
| Experimentieren (4) | eine Variable verändern; faire Vergleichsversuche planen; Messreihe sammeln; Vermutung mit Beobachtungen prüfen | EXP04, VIS12; fachlich begrenzte Modelle |
| Hören und Sprechen (4) | Hörinformation zuordnen; Hörfolge ordnen; Diktat mit gezielter Rückmeldung; kurze mündliche Erklärung anhand Kriterien | MOD01/04/07; bestehende Audiowege prüfen |

Dieser Katalog ist ein Ausbauziel. Eine Funktion gilt erst als verfügbar, wenn Darstellung, echte Eingabe, fachliche Auswertung und KI-Hilfe verbunden und getestet sind. Nicht 50 isolierte Mini-Apps bauen. Vorhandene Renderer zuerst anschließen; Fachmodelle ergänzen, wo der Bestand nur Interaktion oder Darstellung abdeckt.

Chemie-Beispiel: Kugeln verschieben allein genügt nicht. Der begrenzte Adapter definiert zugelassene Atome, Bindungen, Teilchenzahl und ausdrücklich den Modellzweck. Eine ausgeglichene Formel, ein Molekül und räumliche Struktur sind unterschiedliche Lernziele. Keine beliebige Chemiesimulation oder Molekülgeometrie versprechen.

## 5. Wie GradeCrew sinnvoll auswählt

Verbindlicher Entscheidungsweg:

1. Was soll das Kind selbst zeigen: erkennen, rechnen, darstellen, erklären, konstruieren oder übertragen?
2. Welche Voraussetzung ist belegt, unklar oder aktuell widersprüchlich?
3. Welche konkrete Hürde soll der nächste Schritt klären?
4. Hilft eine Darstellung dabei fachlich? Falls ja: zuerst vorhandene passende Werkzeuge prüfen. Falls nein: kurze normale Aufgabe.
5. Passt die geplante Eigenleistung zum Antwortweg? Jede gestellte Frage muss beantwortbar sein. Keine zweite versteckte Textfrage bei rein grafischer Abgabe.
6. Aufgabe, Fachmodell, Werkzeugzustand, erwartete Lösung und Erklärung gemeinsam prüfen.
7. Erst danach anzeigen. Die tatsächliche Antwort und Veränderungen liefern die nächste Entscheidung.

Beispiele: Gleichheit eines Bruchanteils verstehen → gleich großes Flächenmodell. Größe von3/4verorten → Zahlenstrahl. Verfahren bereits sicher anwenden → selbstständige Rechnung ohne dauerhafte Bildhilfe. Gleichungsumformung verstehen → Waage, wenn das Fachmodell die gewählte Operation korrekt unterstützt. Textbehauptung belegen → Originaltext markieren und Begründung; keine zufällige Grafik. Atomzusammensetzung → Teilchenmodell, wenn genau diese Darstellung das Lernziel abbildet.

## 6. Ein gemeinsamer adaptiver Ablauf

- Einstieg prüft das Lernziel mit angemessener Eigenleistung. Jahrgang begrenzt nicht den Rückgriff auf frühere Voraussetzungen.
- Selbstständig richtig: neue Probe mit nachvollziehbar zusätzlicher Denkanforderung. Keine ungefragte Erklärung des gerade Gelösten. Ein Treffer erlaubt eine anspruchsvollere Probe, beweist noch keine Beherrschung.
- Falsch: zuerst Aufgabe, Darstellung und Eingabe prüfen. Dann konkrete Fehlerhypothese bilden und mit kleinerem Schritt klären; nicht aus einer Antwort sicher eine Fehlvorstellung ableiten.
- Hilfe: höchstens ein überschaubarer Gedanke, passende Darstellung soweit nützlich, genau eine beantwortbare Handlung oder Rückfrage. Erklärung und ursprüngliche Aufgabe bleiben zusammen sichtbar. Keine pauschale Lesesperre.
- Erneut falsch: tatsächlich eine Denkanforderung entfernen. Beispiel: ganzen Bruch erweitern → Zusammenhang der Teilanzahl erklären → nur die nötige Zählerrechnung → nötige Multiplikation klären. Nicht endlos denselben Auftrag umformulieren.
- Hilfe erfolgreich: fehlenden Schritt wieder zusammensetzen und mit neuer selbstständiger Aufgabe prüfen. Unterstützte Treffer bleiben unterstützt.
- Trotz abgestufter Hilfen unsicher: freundlich zur gemeinsamen Arbeit mit der Lehrkraft führen. Ein technischer Ausfall ist kein Grund, dem Kind mangelndes Verständnis zuzuschreiben.
- Später: neue zeitversetzte Probe. Mindestens10verschiedene unabhängige Aufgaben, davon8richtig, bleiben Martins vorläufige Mindestregel; angemessene Vielfalt und Transfer zusätzlich nötig. Diese Produktregel ist keine wissenschaftlich validierte Diagnose. Anspruchssteigerung und langfristiger Könnensnachweis sind getrennt.
- Lehrkraft gibt z.B.20Minuten vor; System wählt innerhalb dieser Einheit passende nächste Schritte, speichert Belege und ermöglicht späteres Fortsetzen.

## 7. Fachliche Darstellungsregeln sind Produktverträge

Der konkrete aktuelle Streifenfehler ist anhandCSS nachvollziehbar: Referenzstreifen in .workshop-reference mit17pxInnenabstand, Arbeitsstreifen außerhalb; dadurch verschiedene nutzbare Breite. Zusätzlich haben die Streifen42pxgegen100pxHöhe. In einer Flächenvergleichsaufgabe erzeugt das eine fachlich irreführende Darstellung. In diesem Plan noch nicht behoben.

Verbindlich für den Ausbau:

- Vergleich desselben Ganzen: identische linke/rechte Bezugskante, identische Breite; bei Flächenmodellen auch identische Höhe und Gesamtfläche. Gemeinsames geometrisches Koordinatensystem statt unabhängig gepolsterter Container.
- Unterteilung verändert die Grenzlinien, nicht die Größe des Ganzen. Bei wertgleicher Unterteilung bleibt die markierte Fläche exakt erhalten; Bruchsymbol und Teilanzahl werden synchron aus demselben Modell abgeleitet.
- Darstellung, Text, Farbe und Auswertung verwenden denselben Zustand. Keine Erklärung von6Teilen bei sichtbaren3Teilen. Fehlerzustand bleibt beim gezielten Hilfeschritt erhalten.
- Einheitsmaßstäbe, Achsen, Toleranzen und Bezugseinheit sichtbar und konsistent. Bei unterschiedlichen Einheiten oder Ganzen muss die Aufgabe genau das ausdrücklich zum Gegenstand machen.
- Gleichgewichtswirkung aus einem definierten Modell, nicht beliebiger Animation. Graph und Tabelle aus derselben Funktion. Textmarkierung bezieht sich auf eine stabile Textversion.
- Farbe unterstützt die Bedeutung; Beschriftung und Struktur müssen auch ohne Farbe verständlich sein.
- Drag mit Tipp-/Auswahl- und Tastaturalternative. Keine fachliche Schwierigkeit durch kleine Ziele oder fehleranfällige Eingabe erzeugen.

## 8. Verlässliche Bewertung und technische Fehler

Mathematik: exakte Bruch-/Zahlprüfung und aufgabenabhängige Formforderung.9/20und18/40sind bei einer reinen Wertfrage gleichwertig; eine ausdrücklich geforderte Erweiterung prüft zusätzlich Faktor/Zielnenner. Konstruktionen lassen mehrere fachlich gültige Anordnungen zu. Deutsch: passende Kriterien, sinnvolle Alternativen und Textbelege; Rechtschreibung nur dann eigenes Fehlerkriterium, wenn sie zum Lernziel gehört.

KI benötigt den tatsächlichen Werkzeugzustand und die semantische Handlung, nicht nur ein Bild oder pauschal„falsch“. Geprüfte Fakten und Schülertext getrennt behandeln. Keine KI-Anfrage pro Animationsbild, Mausbewegung oder Timer-Tick.

Bewertung zuerst unabhängig sichern. Folgeaufgabe danach erzeugen und prüfen. Bei abgelehntem Entwurf gezielt überarbeiten mit tatsächlichem Prüfgrund und begrenzten Versuchen. Keine Ablehnung in Zustimmung umdeuten. Bei anhaltendem technischem Problem richtige Antwort und Zustand erhalten, verständliche neutrale Meldung und sicheren Wiederaufnahmeweg anbieten. Geprüfte bereits KI-erstellte Poolaufgaben dürfen nur verwendet werden, wenn sie zum geplanten Lernschritt passen und dieser Modus transparent ist; keine erfundene Live-KI oder beliebige statische Ersatzaufgabe.

Offene aktuelle Baustelle: next-step-review blockiert vereinzelt spätere Folgeaufgaben; atomare Speicherung koppelt dies aktuell an den beantworteten Schritt. Ursache mit kontrollierter Kandidat-/Prüfgrunddiagnose im getrennten Testlauf untersuchen. Nicht durch endlose Promptänderungen ohne Diagnose ersetzen.

## 9. Umsetzungsreihenfolge mit sichtbaren Ergebnissen

### Paket1: Bestand verbinden und gemeinsame Verträge festlegen

Ergebnis: nachvollziehbare Matrix aller vorhandenen Werkzeugverträge und ihres tatsächlichen Nachweisstands; gemeinsame Schnittstelle für Konfiguration, Fachzustand, semantische Antwort und Beobachtung. Vorhandene VIS-Renderer zuerst zuordnen. Zuständigkeiten/PRs265/271/262 prüfen, keine fremden Dateien parallel bearbeiten. Bestehenden Lehrplan-/Profilkern behalten. Akzeptanz: mehrere Ziele und mindestensMathe/Deutschlassen sich mit derselben Auswahlregel planen; offene Adapter bleiben ehrlich offen.

### Paket2: Vier unterschiedliche Werkzeuge als zusammenhängende Werkstatt

Anteile, Zahlenstrahl/Skala, Waage und Textbeleg/Korrektur. Vorhandene Anteile/Skalen/Textinteraktionen zuerst anschließen; Waage als begrenztes neues Fachmodell. Gleiche KI-Steuerung und Ergebnisverträge für alle vier. Pro Familie drei unterschiedliche Lernziele und mindestens ein Übergang zwischen Darstellungen:12geplanteBeispielpfade. Ziel ist sichtbar verschiedene Lernhandlungen, nicht wochenlange Einzelpolitur nur eines Bruchschritts.

Darstellungsfehler und Blockade der Bewertungs-/Folgeaufgabenverarbeitung werden in diesem gemeinsamen Fundament behoben. Ein Abschluss kann an einem anderen Werkzeug scheitern, ohne dass funktionierende Nachbarwerkzeuge neu gebaut werden müssen.

### Paket3: Querprüfung des Systems

Pro Familie: selbstständig richtig; typischer Fehler; wiederholter Fehler; erfolgreiche Hilfe und Rückkehr; mehrere gültige Lösungen; leere/unklare Eingabe; technischer Fehler mit Erhalt der Antwort. Geometrie/Skalen und tatsächliche Darstellung separat prüfen, nicht nur Modellwerte. KI darf keine unpassende Interaktion erzwingen. Gleicher Mechanismus muss einen Mathe- und einen Deutschfall sinnvoll behandeln.

### Paket4: Weitere Familien und breite Lehrplanzuordnung

Diagramme, Geometrie, Ordnen/Zuordnen, Größenbeziehungen, begrenzter Modellbau und Experimentieren ausbauen; Audioverträge zuletzt nur dort anschließen, wo das tatsächliche Hören/Sprechen funktioniert. Pro Familie freigegebene Aufgabenprofile, typische Fehler, Materialquellen und Transferaufgaben ergänzen. So wachsen die50geplantenFamilien aus11Grundmodellen. Vorhandene Lehrplan-Unterpunkte anschließend regelgeleitet zuordnen; Lücken zeigen statt alles pauschal„vollständig“nennen.

### Paket5: Lehrkraft- und Lernalltag

Lerngehirn zeigt unabhängig belegte, unterstützte und noch offene Kompetenzen;20MinutenindividuelleFörderung; fortsetzbareEinheiten und späteresWiederprüfen. Fachliche Stichproben über Jahrgänge/Fächer und echte Geräte. Erst dann breiterer Testrollout im bereits autorisierten Testumfang. Andere Fächer können Werkzeuge nutzen, ohne die aktuelle Mathe-/Deutsch-Startansicht ungefragt zu verändern. Schul-Live nur mit ausdrücklicher Freigabe.

Keine verbindlichen Zeit-/Mengenversprechen vor Bestandssichtung und erstem breiten Abnahmepaket. Fortschritt wird durch funktionsfähige Familien und Lernpfade gezeigt, nicht nur durch Zahl der Unit-Tests oder erzeugter HTML-Demos.

## 10. Abnahme, die Martin nicht selbst für jeden Unterpunkt leisten muss

Automatische Fach- und Darstellungstests übernehmen wiederkehrende Regeln. Für Vergleichsstreifen werden Pixelkanten/Gesamtfläche auf schmaler und breiter Ansicht geprüft, nicht nurCSS-Eigenschaften. Bei Unterteilung bleiben Ganzes und farbigeFlächegleich. Datenwerte, Zeichnung und Beschriftung stimmen überein. Jede öffentliche Aufgabe hat eine sinnvolle Abgabe; keine Lösung im unabhängigen Prüfmodus verraten.

RealeKI-SzenarienprüfenpädagogischeEntscheidungen:größererDenkanspruchnachErfolg;konkreteHilfezurtatsächlichenHandlung;wenigerDenkschrittenachwiederholtenFehlern;richtigerUmgangmitAlternativen;keinKönnensstatusauseinemZufallstreffer. Modell-/Renderer-/Geräte-/KI-Nachweise getrennt führen.

Ein Werkzeug wird erst als verfügbar geführt, wenn es die gemeinsame Abnahme besteht. Neue Varianten innerhalb freigegebener Parameter nutzen diesen Vertrag; außerhalb davon bleiben sie unfreigegeben. Lehrkraftstichproben und beobachtete Lernwirkung sind trotzdem nötig. Keine allgemeine100%-Didaktikgarantie durch eine zweiteKIbehaupten.

Martins Rolle: Grundrichtung und exemplarische Schülererfahrung beurteilen. Systematische Variantenprüfung, geometrische Genauigkeit, Fachprüfungen, sinnvolle Hilfen und technische Ausfallsicherheit sind unsere Entwicklungsaufgabe.

## 11. Quellen und Aussagegrenzen

Projektfundusmain: docs/learning/INTERACTIVE_TASK_PRINCIPLES.md und INTERACTIVE_TASK_CATALOG.md, am22.10.2026gelesen. Bestand und Nachweise oben unterscheiden Idee, lokale Umsetzung und tatsächlich veröffentlichte Funktion.

IES: [Teaching Fractions Toolkit](https://ies.ed.gov/ncee/rel/fractions-grade-6) und [Virtual manipulatives](https://nces.ed.gov/learn/blog/using-virtual-manipulatives-tool-support-students-learning-fractions): visuelle Modelle müssen Bruchgrößen korrekt abbilden und mit Zahlverständnis verbunden werden. EEF: [Teacher Feedback to Improve Pupil Learning](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback): Rückmeldung an Lernziel und Verständnis ausrichten. Diese Quellen stützen einzelne Entwurfsregeln; sie validieren weder unseren gesamten KI-Tutor noch eine universelle Werkzeugauswahl.

Selbstprüfung: Martin verlangt jetzt einen Plan, keine neue Umsetzung. Keine neue Runtimefreigabe, keinDeploy, keinAufhebenbestehenderPrüfungundkeinneuerChat. VorbestehendeFehlerbleibensichtbar. Der nächste Implementierungsplan wird auf den priorisierten Paketen und tatsächlich geprüften Schnittstellen aufbauen, statt50einzelneAppszuentwerfen.
