# Unabhängiger Review der Vier-Rätsel-Erweiterung

Geprüfter Bereich 76 b 336 e..570 fce 3, read-only durch einen frischen gpt-6-astra-Reviewer. Keine zweite Implementierung oder Reviewrunde. Unabhängig 59+87 portable Prüfungen bestanden; Enginebericht 2 erfolgreiche Tests, jeweils2bekannteARM/idevice-Umgebungswarnungen. Urteil vor Korrektur:7/10 für diese Erweiterung, nichtmergebereit, nach Korrekturen nächsterlokaler Spieltest. Keine Critical-Befunde.

## Angenommene wichtige Befunde

1. Ein ungelöster LI2-Spielstand mit Position1000/0/88 wird hinter dem ersten geschlossenen Tor geladen. Der erlaubte Bereich muss beim ersten ungelösten Gate beginnen, einschließlich Kapselabstand. Fortschritt erhalten, unsichere Pose sicherzurücksetzen.
2. Verlorener Slate-Capture lässt Pointer Owned bestehen. Späteres Hover setzt Antworten ohne gehaltenen Button. Capture-Verlust behandeln und neue Mausbewegung ohneursprünglichen Button verhindern.
3. BeschädigteVorwahlcoastMask15/coastReadyfalse nimmtvier Antworten an. Count Bits<=3 unabhängigvon Erfolgsflags prüfen; Ablehnung bleibtatomar.

Die drei vom Reviewer als Minor bezeichneten Bedienfälle werden nach Wirkung als Important eingeordnet: Ziehen außerhalbder Tafel und Loslassenderfalschen Taste verändern die Eingabebedeutung; nach Mengenprüfungverschwundene Blickhilfe fehltgenau beimnotwendigen Ausrichtungsschritt; synchrones Speichernbeiunverändertem Hover belastetdieselbe Eingabepro Frame. Diese Fälle gehörenzur zuverlässigen Haptik, daherimselben Fixdurchgang korrigieren.

## Reproduktionsnachweise vor Fix

Portable Regression lehntvier Küstenantworten ohnecoast Ready noch nichtab (FAILafter 82). Native Regression meldet zuerst 6 Fehler: einsperrende Pose, Captureownership, Hoverantwort, unnötiger Save, falsche Taste beendet Drag, Blickhilfeverschwindet. Außenbereich wird mit eigener neuer Dragsequenz geprüft, damit sein Ergebnis unabhängigvomvorherigenrechten Loslassen ist.

## Betrachtete Grenzen und Entscheidungen

- Regulärfrühe Hauptaktionen, Duplikate/Mittelentfernung/Rücknahme undimmutable Erfolg wurdenalskorrektbeurteilt. Keine zusätzliche Regressionsbehauptungaus Specstille.
- Weltmousedown→neue UI→mouseup: keinbelastbarer Doppelaktionsbefund. Nativer Button brauchteigenen Druck; neue Capture-Loss-Regression ergänztdenfehlenden Fall.
- Touch Capture in Cancel Pointer:UEHas Mouse Capturebeziehtbeliebige Pointerein. Keinzusätzlicher Befund; physischeni Padtestweiterhinnichtbehaupten.
- Projektion entsprichtdengebauten Formenden. Blickund Menge getrennt; E istbewusste Motorik-Alternative.
- Treppen statischzusammenhängend bei30cmStufen/30cmSchritthöhe. Teleportierende Fixturesbeweisen keinenvollständigen Gehdurchlauf; bleibt Nutzertest.
- FinaleGrafik,volleachtGebiete,Audio,Browserstreaming/iPad/ProductionbleibenaußerhalbKandidat. Funktionsprototypdeutlicheinfacherals Konzeptbilder.
- Vollständiger Zusatzsatzundpersistierte Hilfenhistorie sindreduziert: umgesetztzwei Zusatzfragen,weitere Variantenbleibengeplant. Beianderer Umfangserwartungweitere Lerninhaltebauen.
- Handbuch ist 280 seitigerillustrierter Atlasmit 28 Textseiten,12 Übersichten,240 Studien; keine 280 einzigartigen Drehbuchseiten.
- ZentraleStatus-/ÜbergabeaktualisierungerfolgtbeiderabschließendenSicherung; bis dahinbranch_only/keinMerge/Deploy.

## Fixdurchgang

Alle sechs angenommenen Fälle wurden zunächst reproduziert: portable FAILafter 82 fürvier Küstenantworten, Native 7 Assertions einschließlichseparatem Außenbereichsdrag. Korrekturen: ersterungelöster Gatebereichmit Kapselmarge; expliziter Native On Mouse Capture Lost samtgehaltenem Buttoncheck; Küstenauswahlmaximal 3 bits; korrektes Unterbrechenaußerhalbundnurbeim Loslassenderursprünglichen Taste; separate Blickhilfenpositionnach Mengenprüfungweiterhinerreichbar; Speichernnurbei tatsächlicher Zustandsänderung. Finale Regressionssuiteistvor Abschlusszuprüfen. Keinzweiter Reviewer.

Letzter vollständiger Korrekturlauf: 2026.10.08-09.54.06 UTC; 59+88=147 portable Checks,2/2 Engine-Tests erfolgreich,0 Fehler. Warnungen: 2 des Epicidevice-Hilfsprogramms; kein Gerätetest. Alle sechs Reviewfälle sind mitvorheriger Fehlprüfungundnachfolgendemerfolgreichem Gesamtlauf belegt.
