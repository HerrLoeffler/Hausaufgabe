# GradeCrew V5 — kompakte, animierte Crew-Einblicke

Task GC-BRAND-HERO-MOTION-20261013. Separates lokales Experiment, keine Produkt-/Staging-/Productionänderungen. V2–V4 erhalten.

## Auftrag und Zwischenstand

- Gemeinsamer Rahmen mit sichtbarer Navigation; begrenzte Einzelansichten statt vertikal aufklappender Aufgaben. Kein Abschneiden durch overflow:hidden. Kleine Desktopfenster sowie iPad/iPhone werden mit tatsächlichen DOM-Abmessungen geprüft.
- Coco: originales Schnurtelefon, persönliche Kurzvorstellung und visuelle Verortung unten rechts. Zwei kurze Ansichten.
- Coco, Emmi, Wilma: 5 Sekunden pro Ansicht, Pause/Weiter/Zurück/Wiederholen. Coco führt automatisch zu Remy; Emmi zu Wilma. Wilmas Ergebnis bleibt stehen. Remy manuell. Reduced Motion manuell, HiddenTab suspendiert, Schließen beendet Timer/Audio.
- Remy: hellblaue V4-Portraits; vollständige Zehn-Aufgaben-Übersicht, einzelne Aufgabenansicht statt expandierender Zeilen. Zusammenhängender Englischtest mit Illustrationen und nativer Hörfrage; keine echte Generierung.
- Kleine Homepage-Einladung zu den anklickbaren Namen; oben rechts Tutorial-CTA. Das vollständige Tutorial ist NICHT in diese lokale Vorschau eingebunden. CTA öffnet derzeit einen klaren lokalen Hinweis, keine angebliche komplette Tour oder Abkürzung zur Abschlussfixture. Menschliche Zielentscheidung offen.
- DE/EN-UI; Aufgabeninhalt Englisch. Baseline und ursprüngliche Emmi-/Wilma-Renderfunktionen unverändert, nur experimentelles Rahmen-CSS. Keine neuen Bild-/Audio-/Providerstarts.

## Lokal starten

`python3 -m http.server 8782 --bind 127.0.0.1` in diesem Ordner. http://127.0.0.1:8782/ . Baseline: baseline.html. Separater älterer Kontofinalepilot: tutorial-finale.html.

Eigener Server Session77698. Sandboxbindung zuerst verweigert, gereviewter ausschließlich lokaler Start erfolgreich. Keine Cloudveröffentlichung. V4/V3/V2-Server unberührt.

## Zwischenprüfung

23/23 lokale Node-Tests; fünf neue Autoplaytests zuerst gegen V4 rot, dann grün. 5s-Cadence, manueller Remy, Pause/Resume, Timerteardown, HiddenTab/Userpause, Reduced Motion, Reihenfolge und Originalerhalt. Tatsächliche Browserprüfung ist noch in Arbeit; bisher Wilma957×523 dialogclientHeight=scrollHeight=499, Footer sichtbar.

Keine CI-/Integrations-/Deploy-/Safari-/VoiceOver-/physische Geräte-/Nutzerabnahme behauptet. Stufe branch_only. Originalbaseline gc39@8f8697901f8c1aea89897be855ca2872c82d0f2b. Live Development Status38604889860success@d3dd36d5 gelesen, eigene art-Pfade ohne Produktüberschneidung. Main/aktueller Release-Train nicht verändert. Modell/Effort/Usage unknown, kein programmatischer Wechsel; Task/Versuche/Budgethistorie erhalten.

SEC15/18: lokale CSP connect-src none und kein App/Firebase/Provider. PRIV12–15/19: synthetische Beispiele, keine Daten-/Accountschreibvorgänge, Pause/Reduced Motion/lesbare Einzelschritte; Gerätegrenzen separat. Kein rechtlicher oder pauschaler Accessibilitynachweis.

Nächster Schritt: vollständige gezielte Browserprüfung einschließlich vertikaler Überläufe für jede Ansicht und Bedienelemente, danach Martin beurteilt diese V5.
