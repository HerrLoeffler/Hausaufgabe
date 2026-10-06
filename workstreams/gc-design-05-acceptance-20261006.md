# GC-DESIGN-05 — fehlgeschlagene Nutzerabnahme und Korrektur

Stand 2026-10-06T14:15:02.228Z. Quelle: Martins direkter Nutzerauftrag mit drei Screenshots.

Technisch deployed ist f97841b; grüne CI/Hashprüfung beweisen keinen funktionierenden Browserablauf. Nutzer sieht Ladefehler, Anmeldung nicht nutzbar. Höchste Priorität: Bootstrap-Ausnahme reproduzieren und Ursache beheben, echter DOM-/App-Boot-Regressionstest.

Autorisierte UI: oben nur Sprachwahl; Funktionen/Crew/Lehrkräfte/Hilfe samt Ringen und Pfeilen entfernen. Vier bisherige Nutzenpunkte kompakt erhalten. Schülercode und Label jederzeit deutlich. Startansicht auf üblichen Handy/iPad/Desktop-Größen ohne Seitenscroll; bei Zoom/Tastatur keine unzugänglichen abgeschnittenen Inhalte. Coco-Hinweis und sichtbare Klickziele auf Remy/Emmi/Wilma; schnellerer/manuell bedienbarer Demoablauf, Pause/Reduced Motion. Keine neuen Bilder/Audio/Provider.

Tutorial: direkt ursprüngliche echte UI mit Coco-Führung, keine Vorab-Namensfrage/separater Folienersatz. Name erst beim eigenen Schülerdurchlauf. Vorhandenes GRADECREW_TUTORIAL.md und gradecrew-tour/appfirstAiGuide verwenden. Accountlos nur isolierte Beispieldaten ohne Firebase-Auth-Imitation oder Serverwrites; keine geteilten Tutorialkonten. Falls bestehender Ablauf das nicht klein ermöglicht, konkret abgrenzen statt stiller Architekturänderung.

Autor: Analysiere Hero-Art-Directions01a10e98-1e57-7b40-af70-555fdfdae2e3, Sol/high, Turn01a1118e-5c9d-7a72-bb8f-cb4757a4f0c2. Einziger Produktschreiber, eigener Korrekturbranch auf aktuellem Integrationshead. Frühere Testkorrektur Versuch1 bleibt erhalten; weitere Reparatur zählen, max3 keinReset. Tutorial-Recherche Luna im01a10ac4-1557-7663-8cbf-8415c6cc0bca abgeschlossen, nur gelesen.

Zieladresse: Martin erwartet https://hausaufgabe-staging.web.app/. Vorhandene Automatikkette deployed ausschließlich Hosting-Channelgradecrew-app-integration, langePreviewURL. Main muss kurzeAdresse über kontrolliertes StagingHosting nach gleichen Nachweisen versorgen; keine Production. Aktueller Inhalt kurzerAdresse nicht geprüft: Browserzugriff durch unverfügbare administrativ vorgeschriebene Sicherheitsprüfung blockiert. KeinAlternativbrowser/HTTP-Umweg zur Umgehung.

Nächster Schritt: Autorbefund/Commit abholen, genaue Fehlerreproduktion und Testnachweise unabhängig prüfen, dann erlaubte Staging-Veröffentlichung mit eindeutiger URL. Nutzerabnahme offen/fehlgeschlagen, nicht auf grün setzen.


## Gesicherter Stand 2026-10-06T14:51:01.084Z

PR151 exact4ab1b798 ist nach CI37480869311/Job112328325623 und unabhängiger Sol-Prüfung als77d9ee45fa0e3b8801e59fe7f2f5814557ec8849 integriert. Reproduzierter Fehler: wörtliche Backslash-n zwischen Arrayeinträgen in app.js verhinderten Browser-Modulsyntax. Echter HTML-Bootstrap und Login-Submit mit isolierten Stubs geprüft; neue ES-Modulprüfung im CI. Zusätzlich Registrierung sichtbar, obere Navigation entfernt, vier Vorteile/Schülercode/Crew-Hinweis und schnellere steuerbare Demos. Alle elf Remote-Dateiblobs gegen lokalen e4f3967 geprüft. Reparaturversuch2, Historie bleibt. Noch kein neuer Deploy und keine Browserabnahme.

PR150 Deploy-Steuerung wurde als6551091a2c2a6e9a46715fa243bc2af127100879 in main integriert: exakter geprüfter Head dc9b4c48, Handoff37481824301, StageGuardian37481824498, DevelopmentStatus37481824241 erfolgreich. Unabhängiges Sol-Review bestätigt behobene Hosting-Versionbindung/Live-Recheck/Self-Run-Filter; 10 Tests. Ein append-only JSON-Request kann die kurze Staging-Adresse mit genau geprüfter Hosting-Version versorgen. Erst neuen Preview-Receipt für77d9ee45 und getrennte Functionsbelege abholen; noch kein Request/Promotion. Keine neuen IAM-Rechte und keine Production.

Restpaket GC-DESIGN-05B läuft bereits im selben Autorchat, neuer Turn01a111a9-7973-7a61-ab75-7fdbcc302f46, letzter Cursor8d5807aa-2d11-4b24-9b07-48031c3cb5de:33. Eigener Checkout gradecrew-design-05b-guest-tour, Branch feature/gc-design-05b-guest-tour-20261006. PR151 bleibt unverändert. Dokumentierter minimaler Ansatz: TourDataPort/LocalTourRepository mit echter Tour und echten Renderern, lokalem Schüler-/Bewertungsdurchlauf und striktem Guestguard vor produktiven Writers/Gateways. Kein synthetischer Firebase-User. Martin hat diesen Zielablauf bereits autorisiert; begrenzte Umsetzung statt neuem Folienersatz. Normales Handyhochformat ebenfalls offen. Kein neuer paralleler Produktschreiber.
