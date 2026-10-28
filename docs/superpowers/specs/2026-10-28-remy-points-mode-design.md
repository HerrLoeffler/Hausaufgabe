# Remy: Wahl zwischen fester und automatisch bestimmter Punktzahl

**Task:** GC-REMY-POINTS-20261028 · Produktentwurf, noch keine Implementierung  
**Stand:** 28.10.2026 · Grundlage: belegter Functions-Release `26ed109c`, öffentliches Hosting `89aaea9e`  
**Ziel:** Lehrkräfte können vor der KI-Erstellung entweder eine feste Gesamtpunktzahl eingeben oder Remy passende Punkte pro Aufgabe und daraus die Gesamtpunktzahl bestimmen lassen.

## Nutzerablauf

Im Formular „Test erstellen“ steht eine zweifache Wahl bei „Punkte“:

1. **Gesamtpunkte festlegen** (Standard für neue und bestehende Abläufe): Das bisherige Zahlenfeld ist aktiv, voreingestellt mit 20. Bei 20 Aufgaben und 35 Punkten muss der fertige Entwurf weiterhin genau 35 Punkte haben.
2. **Punkte automatisch bestimmen**: Das Zahlenfeld ist inaktiv und wird nicht an den Server gesendet. Ein kurzer Hinweis erklärt: „Remy vergibt Punkte passend zu den Aufgaben. Du kannst alle Punkte vor dem Veröffentlichen prüfen und ändern.“ Der fertige Entwurf zeigt die ermittelte Summe und die Punkte jeder Aufgabe.

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
- Produktionsveröffentlichung braucht eine eigene Freigabe. Vorher erfolgen isolierter Branch, Verhaltenstests, unabhängige Prüfung und Vorschau.

## Ansätze und Entscheidung

**Gewählt für den Plan:** ein sichtbarer Modusschalter mit einem gemeinsamen Generator und zwei klaren Punkteverträgen. Das ist die kleinste Änderung, die eine freie Gesamtsumme tatsächlich erlaubt.

Eine bloße Schaltfläche, die intern trotzdem 20 oder die zuvor eingegebene Summe an den Server schickt, erfüllt das Ziel nicht. Ein zweiter Generator oder eine neue Bewertungsengine würde Aufwand und Risiko ohne nötigen Nutzen erhöhen. Eine separate KI-Nachbewertung pro Aufgabe ist für diese erste Fassung ebenfalls nicht erforderlich: Lehrkräfte prüfen den editierbaren Entwurf. Bei später belegten Fairnessproblemen kann eine eigene Rubrikprüfung ergänzt werden.

## Offener fachlicher Rest

Die Bedienbezeichnung und der Standard sind hier als Vorschlag festgelegt, damit die Umsetzung planbar ist. Vor dem Coding kann Martin den Wortlaut ändern. Ein Pilot sollte prüfen, ob die automatisch vergebenen Punkte bei gemischten Aufgaben für Lehrkräfte nachvollziehbar sind; das ist eine Nutzerabnahme und kein CI-Ergebnis.
