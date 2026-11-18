# GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01: geöffnete Wilma-Auswahl und KI-Erststart

18.11.2026, ausführender delegierter Web-Fachauftrag im bestehenden Branch `fix/wilma-normal-entry-20261118`, Basis `f723e71`. Scope ausschließlich `wilma-answer-review.mjs`, dessen CSS und eigene Regression/Browserfixtures. Parent besitzt Scheduler, app.js, Providerkontext, zentrale Aufgabenübergabe und Integration. Frisches main/Development-Status-Lesen und Abgleich der bestehenden PR438 durch Parent bestätigt; keine zweite Task-ID, keine Budget-/Versuchszähleränderung. Modell/Aufwand aus dem Parent geerbt; tatsächliche Laufzeitwerte nicht zusätzlich gemessen.

## Nachgewiesene Ursachen und Korrektur

Die absolute Auswahl lag innerhalb klebender/enthältender Eltern, hatte keine Begrenzung an der tatsächlich sichtbaren Bildschirmfläche und startete auch bei später aktiver Aufgabe mit scrollTop0. Reproduktion im echten lokalen Chromium320×360: Aufgabe12 lag bei348–392px, das112pxhohe Scrollraster endete bei313px. Screenshot `before-chromium-320.png`; der neue Browsertest schlug vor der Änderung genau an der vollständig sichtbaren aktiven Aufgabe fehl.

Die Auswahl bleibt semantisch im bestehenden Aufgabenbereich, öffnet aber als natives Top-Layer-Popover. Feste Koordinaten berücksichtigen die sichtbare Bildschirmfläche, Panelbreite, Platz ober-/unterhalb, Größen-/Scrolländerungen und Seitenzoom. Das Raster scrollt vertikal; beim Öffnen wird die aktive Aufgabe vollständig eingeblendet. Escape und Außenklick schließen; Tastaturöffnung fokussiert die aktive Aufgabe, Home/Ende/Links/Rechts bewegen den Fokus. Nummern, aktive Markierung, bestehende Antwort-/Aufgabentypografie bleiben erhalten. Älteres WebKit berichtet bei CSS-Seitenzoom vorvergrößerte Rechtecke; die Koordinaten werden vor der Platzberechnung auf sichtbare Pixel vereinheitlicht. Aufrunden der nötigen Scrollstrecke vermeidet abgeschnittene letzte Pixel bei200%Zoom.

Der vorhandene erlaubte Erststart lag weit rechts im Punktefeld. Er steht nun als primärer Knopf „KI-Vorschlag erstellen“ unmittelbar neben „Für diese Antwort fehlt noch der KI-Vorschlag.“ in der Antwortzelle; Hinweis auf erste Prüfung und Kontingent bleibt sichtbar. Bestehendes canResume/canRetry und Klickzeitprüfung bleiben erhalten. Ein fehlgeschlagener früherer Versuch behält seinen getrennten Wiederholungsknopf. Kein automatischer Erststart historischer Antworten, keine neue Sammelaktion, keine Bestätigung von Punkten.

## Tatsächliche Prüfung

- Neuer JSDOM-Verhaltenstest zuerst ROT (Erststart fehlte in Antwortzelle), danach GRÜN; expliziter Doppelklick löst genau einen Vorgang aus. Synthetischer erfolgreicher Vorgang zeigt1/2Punkte plus Begründung; keine Entscheidung gespeichert. Erneute Anfrage verschwindet hinter dem validierten Vorschlag. Stale Berechtigung und Fehlerwiederholung getrennt geprüft.
- `node --test wilma-*.test.mjs`:127Tests,127bestanden,0fehlgeschlagen. Vollständige Root/UI/Functions-Suiten des kombinierten Elternauftrags werden dort separat ausgeführt.
- `tools/browser-layout/wilma-picker.cjs`:72echte lokale Chromium-/WebKit-Szenarien:15/30/100Aufgaben, aktive12/1/letzte,320×360/390×480/820×360/1280×720, offene Auswahl vor und nach Seitenscroll, vollständige aktive Kachel und tatsächliche Treffbarkeit, kein horizontaler Rasterüberlauf, Escape/Fokus/Home/Ende/Enter/Touch. Zusätzlich je Engine200%CSSzoom mit explizit abgeschnittenem Elterncontainer und der synthetische Erststart bis zum sichtbaren Punktvorschlag. Alle bestanden. Keine externen Requests, keine Provideraufrufe, keine echten Daten-/Notenschreibvorgänge.
- Bestehende `tools/browser-layout/wilma-review.cjs`:72Szenarien bestanden.
- Bestehende `tools/browser-layout/wilma-first-answer.cjs`:8Szenarien bestanden.
- `git diff --check` ohne Befund.

Lokale Belege in `/tmp/gc-wilma-picker/`: `geometry.json`, `before-geometry.json`, `node-regressions.txt`, `before-chromium-320.png`, `open-{chromium,webkit}-{320,390,820,1280}.png`, `open-{chromium,webkit}-zoom2.png`, `first-start-{chromium,webkit}.png`, `proposal-{chromium,webkit}.png`. Öffnungs-/Zoom-/Vorschlagbilder visuell geprüft. Browser1.56.1 und installierte Chromium/WebKit-Binärdateien lokal wiederverwendet; keine Installation/kein bezahlter Start. Lokaler Serverzugriff brauchte die vorhandene automatische Ausführungsfreigabe.

## Stand / nächste Schritte

`branch_only`, lokal geprüft. Dieser Teilauftrag deployt und pusht nichts. Unabhängiger Review, kombinierte Suiten/CI, genauer Releasebezug und physische Geräteabnahme bleiben beim Parent. Native Popover-Unterstützung wird vorausgesetzt (in beiden geprüften Browser-Engines vorhanden); kein Nachweis für veraltete Browser oder echte iOS-Tastatur/Pincer-Gesten. Kein Production-/Staging-Deploy aus diesem Teilauftrag. Nächster Schritt: gesicherten UI-Commit dem Parent übergeben und zusammen mit dessen Scheduler-/Kontextänderungen unabhängig prüfen.
