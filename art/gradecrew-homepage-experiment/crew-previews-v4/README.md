# GradeCrew V4 — hellblauer Remy und gemeinsame Crew-Einblicke

Task GC-BRAND-HERO-MOTION-20261013, direkter Korrekturauftrag14.10.2026. Nur eigenes lokales Experiment. V2/V3 und ihre gesicherten Quellen bleiben erhalten. Aktuelle Homepage, Staging und Production werden nicht verändert.

## Änderung

- Drei Referenzedits mit builtin imagegen: Remy in Klassenzimmer, Tablet- und Mikrofonpose sichtbar hellblau wie remy-footer-letter-r-v4.png. Neue Dateien in assets/*lightblue-v4.png; Originale in baseline unverändert. PNG-Portraits haben echte Alpha(0–255), Szene1774×887.
- Alle vier Einblicke haben denselben1040px-Rahmen, Figur links, Beispielkarte rechts, Crew-Orientierung und gemeinsame Navigation. Rollenfarben bleiben erhalten.
- Manuelle Leseschritte für alle Figuren. Abschlussbutton führt Coco→Remy→Emmi→Wilma; bei Wilma schließt Einblick beenden den Dialog. Keine zeitgesteuerte Weiterleitung. Direktes Öffnen jeder Figur und Wiederholen/Zurück bleiben möglich.
- Cocos sichtbarer Neuer-Test-Button startet zusätzlich direkt Remys Einblick. Remys komplette10Aufgaben-Übersicht, Bild-/Hörfrage bleiben erhalten. Emmis/Wilmas bestehende Beispiele unverändert im neuen Rahmen; ihre Renderer sind bytegleich zu gc39. Verknüpfte Funktionsbeispiele, kein tatsächlicher gemeinsamer Testzustand/Backendworkflow.
- DE/EN, native Audio ohneAutoplay. Konto-Finalepilot ist unverändert aus V3 übernommen und weiterhin getrennte synthetische Fixture; keine echte FullTour/Authintegration. Originale Crew-kennenlernen-Aktion dient nur im Experiment als Abkürzung zu tutorial-finale.html.

## Start

`python3 -m http.server 8781 --bind 127.0.0.1` in diesem Ordner.
http://127.0.0.1:8781/ . Originalreferenz: baseline.html. Vorherigen Server zuerst prüfen. Tatsächlich gestarteter eigener ServerSession4878. Erste Sandboxbindung verweigert, autorisierter Loopbackstart per gereviewter Eskalation erfolgreich. V3Server8780/Session30466 undV2Server8779/Session36394 unverändert.

## Bisher geprüft

18/18Node-Tests bestanden. Vier neue Journeytests scheiterten zunächst amV3-Flow (4/4rot), nach Änderung4/4grün. Komplette Reihenfolge, manuelle Schritte, direkte Einstiege, Replay und ReducedMotiontrue/false. Bestehende Namens-/Entwurfs-/Konto-Tests erhalten. OriginalstartMarkup/Fitter/Styles und Emmi/WilmaRenderer unverändert.

Desktop1280×720 perCUA komplett Coco→Remy→Emmi→Wilma→Schließen durchgeklickt, AudioPlay playing=true/currentTime0.114343. Alle4Layoutansichten gesehen/gesichert; Dialog1040px ohnehorizontalenÜberhang. FrischerTab ohneWarnungen/Errors. iPad820×1180 und iPhone390×844 tatsächlich per DOM verifiziert. Neuer-Test-Klick startet Remy in beiden Ansichten. Alle4iPhoneDialoge clientWidth=scrollWidth=352, vertikales Stapeln visuell geprüft. DE/EN komplette Kette, Enter/Escape und Rückkehr geprüft. Kein physischerGeräte-/Safari-/VoiceOver-/WCAG-Zertifizierungs-/CI-/Deploynachweis.

Baseline gc39@8f8697901f8c1aea89897be855ca2872c82d0f2b. Mainregeln frisch, DevelopmentStatus38578255740success/18d6dd1, Job115900986834gelesen. KeineProduktdateiüberlappung mit Wissensreise/TestRallye/Games; eigenerartPfad. GleicheTask/Versuchshistorie;3builtinAssetcallsV4, keinAPIkey/CLIProvider/Budgetstart, ModellEffort/Usagekostenunbekannt.

SEC15/18 undPRIV12/13/14/15/19 weiterhin begrenzt auf lokalePrototype-Isolation/Bedienung: CSPconnect-srcnone, keineApp/Firebase/Tourengine, keineechtenKonten/Credentials/Schüler-/Bewertungs-/Providerdaten. RealeDienste/Rechtsgates unverändert. KleineReferenzedit-AbweichungenaußerhalbRemys könnenbeiAIRekonstruktion verbleiben; Szenenlayout und Identität allerFiguren visuellgeprüft, keinepixelidentischeGesamtszene behauptet.

NächsterSchritt: Martin prüft die konkrete V4-Vorschau; keine automatische Produktübernahme. Finale Quellen und neueScreenshots gesichert. MenschlichesV3Urteil grundsätzlichpositivmitklarerFarb-/Layoutkorrektur, V4Abnahmeausstehend. Keine automatische Produktübernahme.
