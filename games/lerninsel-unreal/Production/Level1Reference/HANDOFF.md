# Level1: lokaler Vorab-Teststand — 11.10.2026

GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011; Parent GC-GAMES-ESCAPE-VISUAL-01; L1 history GC-GAMES-LERNINSEL-L1. Owner GC · Lerninsel · Gameplay & Integration, 01a12568-0502-7831-9451-a7f8d91ce950. Genehmigter Plan PR219@5315f67; eigene Implementierung PR220 auf feature/lerninsel-level1-reference-20261011. Originalcheckout und normale Spielstände unverändert. Kein Merge/Deploy.

## Spielstart

Lerninsel Level 1 spielen.command startet nach erfolgreichem aktuellen UE5.8-Build die eigene Map Lerninsel_Level1Ref. Der getrennte Neustarter beginnt nur diesen Versuch neu; Einstellungen bleiben erhalten. WASD bewegt, Maus schaut, E/Klick wählt, H gibt Hilfe, Esc pausiert. Im Verbweg zählt eine bewusste Mitte-Berührung ab0,30s; E/Klick bleibt Alternative. Ganze ausgewählte Steine bleiben blau; grün ist nur die getrennte Lösungsleitung.

## Verifikation und Grenzen

Aktueller Build erfolgreich. 495 portable Checks erfolgreich; sechs frische native Tests erfolgreich, null Testfehler,16 Warnungen (einschließlich fehlender normaler Saves im isolierten Checkout). Native Fixtures prüfen echte Terrain-/Wortstein-/Torkollisionen, einmalige Foot-Auswahl/Undo, stabile Menübuttons, falsches Introfeedback, eigene Saves/Preferences, reparierbaren Handoff und Fortschrittsgrenze. Die Fixtureposes und direkten Aktionen sind ausdrücklich kein normaler Durchlauf.

Realer Desktopbeleg: Enter startet unmittelbar; W bewegt tatsächlich über den geformten Hügel; Esc öffnet die Pause. Vollständige normale Route mit Maus/E/Klick und echter Satzgarten-Übergang **nicht bestanden/nicht nachgewiesen**: CUA-Mausbindung meldet teilweise noWindowsAvailable und erzeugt beim relativen Mausfang Blicksprünge. Keine Teleportfixture als Input-PASS umgedeutet. Lokaler Vorab-Teststand für menschliches Ausprobieren, keine vollständige Gameplay-/Kinder-/iPad-/Webabnahme. Art bleibt einfach; Wortkontrast und natürliche Szene brauchen menschliche Sichtprüfung.

A/B einmalig und read-only wiederverwendet. A: Menüfokusverlust, Continuation-Posegrenze und wiederverwendeter beschädigter Handoff korrigiert. B: falscher Intro-Korrekturhinweis korrigiert; Art-/Input-Abnahmegrenzen festgehalten. Kein weiterer Full-Audit oder Designzyklus.

source-manifest.json bindet geprüfte Quellen/Map/Materialien; native-regression-six.json ist der letzte vollständige Enginebericht. Reale lokale Frames und Fixturebilder liegen unter Reports/Level1Reference, werden nicht als vollständiger Durchlauf veröffentlicht. Externe GameET-Daten nicht gesendet; Plugin im Spiel fehlt. Requested Sol6.1/medium; tatsächlicher Runtime-/Kostenstand nicht verifiziert.
