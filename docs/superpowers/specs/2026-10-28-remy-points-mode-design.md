# Remy: Wahl zwischen fester und automatisch bestimmter Punktzahl

**Task:** GC-REMY-POINTS-20261028 · Produktentwurf; Umsetzung in PR #377 (Live-Basis) und PR #376 (Integration)  
**Stand:** 28.10.2026 · Grundlage: belegter Functions-Release `26ed109c`, öffentliches Hosting `89aaea9e`  
**Ziel:** Lehrkräfte können vor der KI-Erstellung entweder eine feste Gesamtpunktzahl eingeben oder Remy passende Punkte pro Aufgabe und daraus die Gesamtpunktzahl bestimmen lassen.

## Nutzerablauf

Im Formular „Test erstellen“ steht bei „Punkte“ ein kompakter **Auto**-Schalter direkt neben dem Punktefeld. Bei neuen Tests ist Auto standardmäßig aktiv und blau markiert; statt einer Zahl steht ein Strich im inaktiven Feld. Beim Ausschalten erscheint die feste Zahl (zunächst 20), die sich in 0,5er-Schritten ändern lässt. Ein zuvor eingegebener fester Wert bleibt beim erneuten Umschalten erhalten. Der fertige Entwurf zeigt die Summe und die Punkte jeder Aufgabe.

Die Wahl wird vor dem Start in der Anforderungszusammenfassung angezeigt. Beim Wechsel zwischen den Modi bleibt eine eingegebene feste Zahl im Formular erhalten. Die Lehrkraft sieht vor Veröffentlichung den vollständigen Entwurf und kann bestehende Punktefelder bearbeiten; die Summe aktualisiert sich dabei. Ein bereits vorhandener Test oder eine aus ihm erzeugte Variante behält seinen bisherigen Punktevertrag.

## Punktelogik

- **Fest:** Bestehende Eingabeprüfung, 0,5er-Schritte, Mindestwert 0,5 pro Aufgabe, Batchbudget, Ausgleich auf die Zielsumme und Schlussprüfung bleiben unverändert.
- **Automatisch:** Der Server kennt ausdrücklich `pointsMode: "auto"` und **keine** Zielsumme. Er fordert die KI auf, je Aufgabe einen positiven Punktwert in 0,5er-Schritten zu vergeben und die Gewichtung am erwarteten Arbeitsaufwand auszurichten: Zahl der unabhängig zu bewertenden Antworten, Lösungs- oder Denkschritte und mögliche Teilpunkte. Aufgabentyp, Bild oder Audio allein begründen keine höhere Punktzahl. Nach Strukturprüfung und etwaiger Aufgabenreparatur entsteht die Gesamtsumme als Summe der Einzelpunkte. Es gibt keinen nachträglichen Ausgleich auf 20, 35 oder einen anderen versteckten Standardwert.
- Der bestehende Validator prüft pro Aufgabe positive 0,5er-Schritte. Im Automodus prüft er keine vorgegebene Summe, aber der Speicherpfad berechnet und speichert die tatsächliche Summe. Ungültige Aufgaben bleiben ungültig; der Modus umgeht keine fachliche Prüfung.
- Die automatische Gewichtung ist ein Vorschlag. Die Lehrkraft bestätigt den Entwurf wie bisher vor Veröffentlichung. Ein mathematisch korrekter Gesamtwert ist kein Beleg für didaktisch faire Gewichtung.

## Grenzen und Schutz bestehender Daten

- Keine Änderung vorhandener Tests, Notenschlüssel, veröffentlichter Prüfungen oder Schülerabgaben. Keine Datenmigration.
- Keine neue KI-Runde nur für Punkte. Der Modus nutzt den bestehenden Generierungs- und Reparaturauftrag; Testbudget und Versuchsverlauf bleiben erhalten.
- Ähnliche Tests/Varianten übernehmen weiter die Punkte der Vorlage. `pointsMode: "auto"` ist nur bei einer neuen freien Testerstellung zulässig.
- Alte Clients und gespeicherte Jobs ohne `pointsMode` laufen wie bisher im festen Modus. Ein Automodus darf `points` nicht stillschweigend als 20 interpretieren. Widersprüchliche Eingaben (`auto` plus feste Zahl) werden eindeutig zurückgewiesen.
- Martin hat am 28.10.2026 die Veröffentlichung auf gradecrew.de ausdrücklich beauftragt. Isolierter Branch, Verhaltenstests, unabhängige Prüfung, Staging-Vorschau und gezielte Funktionsfreigabe gehen dem Hosting-Release voraus. Die drei KI-Funktionen müssen vor der neuen Oberfläche aktiv sein, damit ein alter Server Auto-Anfragen nicht als 20-Punkte-Auftrag deutet.

## Ansätze und Entscheidung

**Gewählt für den Plan:** ein sichtbarer Modusschalter mit einem gemeinsamen Generator und zwei klaren Punkteverträgen. Das ist die kleinste Änderung, die eine freie Gesamtsumme tatsächlich erlaubt.

Eine bloße Schaltfläche, die intern trotzdem 20 oder die zuvor eingegebene Summe an den Server schickt, erfüllt das Ziel nicht. Ein zweiter Generator oder eine neue Bewertungsengine würde Aufwand und Risiko ohne nötigen Nutzen erhöhen. Eine separate KI-Nachbewertung pro Aufgabe ist für diese erste Fassung ebenfalls nicht erforderlich: Lehrkräfte prüfen den editierbaren Entwurf. Bei später belegten Fairnessproblemen kann eine eigene Rubrikprüfung ergänzt werden.

## Fachliche Abnahme

Martin hat Blau, den kompakten Auto-Schalter und Auto als Standard bestätigt. Nach dem Livegang sollte eine Lehrkraft einen erzeugten Entwurf mit gemischten Aufgaben darauf prüfen, ob die Einzelpunkte didaktisch nachvollziehbar sind; das ist eine Nutzerabnahme und kein CI-Ergebnis.
