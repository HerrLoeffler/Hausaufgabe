# Lehrplan-Vollauswertung – Arbeitsplan

> **Für die Ausführung:** Den vorhandenen Auftrag `GC-PEDAGOGY-KB-01` fortführen. Jeder unten genannte Schritt erhält einen belegten Status im Register und in der Übergabe. Die Medienauswertung ist eine spätere, getrennte Phase.

**Ziel:** Sämtliche geltenden Lehrplandokumente aller Fächer für Grundschule, Haupt-/Mittelschulbildungsgang, Realschulbildungsgang und Gymnasium in allen 16 Ländern auffinden, ihre Geltung sauber zuordnen, ihre Anforderungen fachweise auswerten und gegenprüfen.

**Struktur:** Ein Register enthält amtliche Dokumente und deren konkrete Geltung für Schulweg, Fach und Jahrgang. Fachpakete formulieren die inhaltliche Auswertung in eigenen Worten und verweisen auf Abschnitte der Originalquellen. Ein Prüflog hält eine unabhängige Zweitsichtung und Änderungen fest; der Fortschrittsindex wird aus Registerstatus abgeleitet.

**Arbeitsmittel:** Amtliche KMK- und Landesportale, Markdown für Fachauswertungen, portable TSV-Register für Quell- und Geltungsdaten. Keine Buch-, Regal- oder Download-Daten in dieser Phase.

**Konzept:** [Pädagogische Wissensbasis – aktuelle Lehrplanphase](../specs/2026-10-11-paedagogische-wissensbasis-konzept.md)

## Verbindlicher Umfang

- **16 Länder** und die vier vereinbarten Zielbereiche. Der Haupt-/Mittelschul- und der Realschulweg kann innerhalb einer anderen amtlichen Schulart liegen; Originalbezeichnung und Vergleichszuordnung werden getrennt gespeichert.
- **Gymnasium Sek I und Oberstufe** sind getrennte Geltungswege. Berlin und Brandenburg haben regulär Grundschule bis Jahrgang 6; zusätzliche Niveaustufen bleiben erhalten.
- **Alle Fächer/Lernbereiche**, die das jeweilige Land für den Zielweg führt. Es wird keine bundesweit starre Fächerliste vorausgesetzt. Integrierte Fächer und Querschnittsvorgaben werden als solche geführt.
- **Geltende Fassungen je Kohorte und Stichtag** einschließlich aufwachsender Einführung und auslaufender Vorgänger. Entwurf, Handreichung, Beispielaufgabe und verbindlicher Fachplan sind unterschiedliche Dokumentarten.
- **KMK-Standards** sind ein getrennter Bezugspunkt. Sie ersetzen keinen Landeslehrplan.
- **Aufgabenabgleich in dieser Phase** bedeutet: Welche Aufgabenanforderungen, Operatoren, Anforderungsbereiche und amtlichen Beispielaufgaben lassen sich auf welche Lehrplankompetenz beziehen? Lehrwerks- und Bildungslogin-Aufgaben folgen später.

## Ablage und eine Quelle je Aussage

| Datei/Ordner | Funktion |
|---|---|
| `analysis/GC-PEDAGOGY-KB-01/register/schulwege.tsv` | Amtliche Schularten/Bildungsgänge und ihre Zuordnung zu den vier Zielbereichen. |
| `analysis/GC-PEDAGOGY-KB-01/register/dokumente.tsv` | Ein Datensatz je amtlichem Dokument und Fassung; URL, Herausgeber, Dokumentart, Geltung und Zugriff. |
| `analysis/GC-PEDAGOGY-KB-01/register/zuordnungen.tsv` | Verknüpfung Dokument × Schulweg × Fach/Lernbereich × Jahrgang/Niveau/Kohorte. Mehrfachgeltung erzeugt mehrere Zuordnungen, keine fiktiven Dokumentkopien. |
| `analysis/GC-PEDAGOGY-KB-01/register/kompetenzen.tsv` | In eigenen Worten verdichtete amtliche Anforderungen mit Originalgliederung, Endpunkt und genauer Fundstelle. |
| `analysis/GC-PEDAGOGY-KB-01/register/aufgabenprofile.tsv` | Amtlich belegte Aufgabenanforderungen und Beispieltypen, jeweils mit Kompetenz- und Quellenverweis. Keine Lehrwerksaufgaben. |
| `analysis/GC-PEDAGOGY-KB-01/register/prueflog.tsv` | Zweitprüfung, Korrekturen, Versionwechsel und offener Zugang. |
| `analysis/GC-PEDAGOGY-KB-01/subjects/` | Lesbare Fachpakete je Zielweg und Fach; bestehendes Paket Mathematik Grundschule wird fortgeführt. |
| `analysis/GC-PEDAGOGY-KB-01/states/` | Amtliche Landesportale, Zuständigkeiten und Originalstruktur. |
| `analysis/GC-PEDAGOGY-KB-01/master/fortschritt-und-luecken.md` | Datiertes Lagebild aus den Registern; kein eigener Wahrheitsstand für Dokumentstatus. |
| `docs/superpowers/handoffs/GC-PEDAGOGY-KB-01.md` | Wiederaufnahme, letzter gesicherter Schritt, offene Zugänge und genau ein nächster Schritt. |

**Registerregeln:** IDs sind stabile interne Kürzel für *Lehrplandokumente* und Geltungszeilen. Amtliche Lehrplantitel sind erlaubt; das frühere Verbot von Buchtiteln betrifft Medien. TSV-Freitext enthält keine Tabulatoren oder Zeilenumbrüche. Ein fehlender Wert heißt `unbekannt`, nie stillschweigend leer. Die Definitionen und Statuswerte stehen in [`register/README.md`](../../../analysis/GC-PEDAGOGY-KB-01/register/README.md).

## Status und Abschlussregel

`entdeckt` → `metadaten_geprueft` → `inhalt_teilweise` → `inhalt_ausgewertet` → `zweitgeprueft`.

`zugriff_blockiert`, `version_unklar` und `nicht_anwendbar` sind gesonderte Zustände mit Grund und nächster Handlung. Ein Treffer in einer Portalübersicht reicht höchstens für `entdeckt`. Die Quelle muss für `inhalt_ausgewertet` im definierten Umfang tatsächlich gelesen sein; offizielle Volltext-Suchauszüge sind mit dieser Methode zu kennzeichnen. Eine **vollständige Land-/Fach-/Weg-Kombination** erfordert alle geltenden Dokumente und Geltungszeilen auf `zweitgeprueft` oder eine belegte amtliche Nichtanwendbarkeit. Ein blockierter Volltext verhindert den Abschluss dieser Kombination.

## Arbeitsschritte in Ausführungsreihenfolge

### 1. Arbeitsstand und Aufgabenkennung sichern

- [ ] Auf aktuellem GitHub-`main` Task-ID, TODO, Registry, vorhandene Übergaben und parallele Arbeit prüfen. Am 11.10.2026 ist `GC-PEDAGOGY-KB-01` in `TODO.md` nicht registriert.
- [ ] Die bisherigen lokalen Konzept-, Plan-, Landes- und Fachberichte über einen eigenen Aufgabenbranch mit Review in das Repository übernehmen; keine gemeinsame Datei unbesehen überschreiben.
- [ ] `TODO.md` und die dauerhafte Workstream-Übergabe mit Umfang, Owner, Branch, Belegstand, Blockern und nächstem Schritt ergänzen.

**Abnahme:** Branch/Commit und die Aufgabe sind auf GitHub auffindbar; lokale Dateien allein gelten nicht als gesichert. Kein Release-/Deploy-Status wird aus Dokumentation abgeleitet.

### 2. Mathematik Grundschule abschließen

- [ ] Saarland: die ab 01.08.2026 geltende Fassung im amtlichen Volltext lesen und nach 1/2 sowie 3/4 auswerten; der PDF-Endpunkt gab zuletzt 403 zurück.
- [ ] Thüringen: den laut amtlicher Gültigkeitsübersicht geltenden Fachplan 2010 im Haupttext nach Schuleingangsphase und 3/4 vollständig auswerten; der Portalzugang ist derzeit eingeschränkt.
- [ ] Die vorhandenen 14 Landesauswertungen auf Version, Stufen, Inhalt, Quellenstellen und Geltungsübergänge gegenprüfen.
- [ ] Für jede der 16 Geltungen passende Registerzeilen und Kompetenzanker erfassen; Status nur anhand tatsächlicher Prüfung anheben.

**Abnahme:** Mathematik Grundschule hat 16 belegte Landes-Geltungen und 16 zweitgeprüfte Fachauswertungen oder eine genau benannte, weiterhin offene Zugriffslücke. Die vorhandenen 14 inhaltlichen Auswertungen gelten bis zur Zweitprüfung nicht als endgültig abgeschlossen.

### 3. Vollständiges Dokumentinventar erstellen

- [ ] Für jedes Land alle amtlichen Zielwege/Originalschularten samt Jahrgängen und Abschlüssen in `schulwege.tsv` eintragen.
- [ ] Pro Zielweg amtliche Fach-/Lernbereichslisten und alle verbindlichen Fach-, Rahmen- und allgemeinen Pläne finden; jede Fassung in `dokumente.tsv` erfassen.
- [ ] Jede konkrete Geltung in `zuordnungen.tsv` eintragen: Fach, Stufen, Niveau, Kohorte, Beginn/Ende und Übergang.
- [ ] Alle 16 Länder gegen die offiziellen Landesportale und KMK-Einstiege auf fehlende Fächer, veraltete Links und Doppelerfassungen abgleichen.

**Abnahme:** Jede amtliche Land × Zielweg × Fach × Stufe-Kombination hat eine dokumentierte Quelle oder eine amtlich belegte Nichtanwendbarkeit. Erst hier wird die Gesamtzahl der auszuwertenden Geltungszeilen festgeschrieben und datiert. Die vier bisherigen Länderberichte sind Startmaterial, kein Vollständigkeitsnachweis.

### 4. Lehrpläne fachweise auswerten

- [ ] Bearbeitungsfolge: Mathematik Grundschule; Deutsch Grundschule; übrige Grundschulfächer; danach die inventarisierten Fächer der Haupt-/Mittelschul- und Realschulwege; Gymnasium Sek I; Oberstufe. Die genaue Fächerliste kommt aus Schritt 3.
- [ ] Pro Dokument Originalgliederung, Kompetenzmodell, verbindliche Inhalte, Lernprogression, Jahrgangs-/Niveauendpunkte, methodische und Leistungsanforderungen sowie Querschnittsvorgaben in eigenen Worten und mit Abschnitts-/Seitenverweis erfassen.
- [ ] Pro Fach und Zielweg alle 16 Länder abgleichen. Fehlt ein eigenständiger Landesplan, den integrierten Fachplan oder die amtliche Nichtanwendbarkeit belegen.
- [ ] Nach jedem abgeschlossenen Land-/Fachpaket Register, Fachbericht und Übergabe sichern; die Arbeit läuft an unabhängigen Fachpaketen weiter, auch wenn Saarland/Thüringen in Mathematik Grundschule noch gesperrt bleiben.

**Abnahme:** Keine Geltungszeile steht ohne Inhaltssichtung oder präzise Lücke. Ein Fachpaket ist erst geschlossen, wenn seine dokumentierten Geltungszeilen und fachlichen Zusammenfassungen deckungsgleich sind.

### 5. Fachpläne unabhängig gegenprüfen

- [ ] Für jede Auswertung URL/Version/Geltung und die fachlichen Aussagen am amtlichen Volltext gegenlesen; bei Streit eine zweite fachkundige Person einbeziehen.
- [ ] Stichproben über alle Kompetenzbereiche und Jahrgangsendpunkte prüfen, nicht nur Einleitung und Inhaltsverzeichnis.
- [ ] Prüfdatum, Prüferrolle, Befund und Korrektur im `prueflog.tsv` dokumentieren; `zweitgeprueft` nur nach positivem Befund setzen.

**Abnahme:** Jeder abschließend gezählte Datensatz besitzt eine überprüfbare zweite Sichtung. Unsicherheit und Zugangsprobleme bleiben sichtbar.

### 6. Amtliche Aufgabenanforderungen abgleichen

- [ ] Aus den Fachplänen pro Kompetenz die geforderte Handlung, mögliche Aufgabenform, Anforderungsbereich, Operatoren und erwartete Darstellung ableiten; solche Ableitungen als Interpretation kennzeichnen.
- [ ] Wo KMK, IQB oder Land amtliche Beispielaufgaben veröffentlichen, deren Aufgabenart knapp paraphrasieren und mit Kompetenz/Fundstelle verbinden. Kein Volltext der Beispielaufgabe wird gespeichert.
- [ ] Pro Fachpaket prüfen, welche Anforderungen durch amtliche Beispiele illustriert sind, welche nur im Lehrplan formuliert sind und wo Beispiele fehlen.

**Abnahme:** Aufgabenprofile verweisen auf geprüfte Lehrplankompetenzen und amtliche Quelle; sie behaupten keine Sichtung der späteren Lehrwerke.

### 7. Gesamtabschluss prüfen

- [ ] Den Inventarnenner gegen die 16 Landesportale und die KMK-Linkübersicht erneut prüfen; Änderung seit erstem Abruf in Geltungszeilen übernehmen.
- [ ] Pro Land, Zielweg, Fach und Stufe `zweitgeprueft`, `zugriff_blockiert`, `version_unklar` und amtlich `nicht_anwendbar` zählen; fehlende oder doppelte Zeilen bereinigen.
- [ ] Fachberichte und Register gegeneinander prüfen; keine Gesamtvollständigkeit behaupten, solange verbindliche Geltungen blockiert sind.

**Abnahme:** Ein datierter Abschlussbericht nennt den tatsächlichen Nenner, alle geprüften Einheiten, offene amtliche Quellen und die Grenzen des Aufgabenabgleichs.

### 8. Pflege und Wiederaufnahme einrichten

- [ ] Verantwortliche Rolle, Prüfrhythmus und Auslöser (neue Fassung, Kohortenwechsel, geänderter Landeslink) je Registerfamilie festhalten.
- [ ] Frühere Fassungen historisieren, neue Versionen mit neuer Dokument-ID aufnehmen und betroffene Geltungs-/Kompetenzzeilen zur erneuten Prüfung markieren.
- [ ] Nach jedem Fachpaket TODO, Fachbericht, Register, Fortschrittsindex und Übergabe mit Commit/Prüfdatum/Blocker/nächstem Schritt sichern.

**Abnahme:** Eine andere Person kann den nächsten ungeprüften Datensatz finden und den Belegstand fortsetzen, ohne den Chatverlauf zu benötigen.

## Bekannte Blocker und Weiterarbeit

Saarlands neuer Mathematik-Grundschulplan liefert aktuell HTTP 403; der Thüringer Haupttext ist nur über das Schulportal für angemeldete Nutzer zugänglich. Falls die amtlichen Volltexte nicht erreichbar werden, bleiben genau diese Geltungen offen. Die Dokumentinventur und andere Fachpakete laufen weiter. Für die Medien gibt es einen separaten Zwischenstand; er wird erst in der späteren Medienphase mit den geprüften Kompetenzankern verbunden.
