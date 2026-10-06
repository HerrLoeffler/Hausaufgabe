# GC-DESIGN-05 — fehlgeschlagene Nutzerabnahme und Korrektur

Stand 2026-10-06T14:15:02.228Z. Quelle: Martins direkter Nutzerauftrag mit drei Screenshots.

Technisch deployed ist f97841b; grüne CI/Hashprüfung beweisen keinen funktionierenden Browserablauf. Nutzer sieht Ladefehler, Anmeldung nicht nutzbar. Höchste Priorität: Bootstrap-Ausnahme reproduzieren und Ursache beheben, echter DOM-/App-Boot-Regressionstest.

Autorisierte UI: oben nur Sprachwahl; Funktionen/Crew/Lehrkräfte/Hilfe samt Ringen und Pfeilen entfernen. Vier bisherige Nutzenpunkte kompakt erhalten. Schülercode und Label jederzeit deutlich. Startansicht auf üblichen Handy/iPad/Desktop-Größen ohne Seitenscroll; bei Zoom/Tastatur keine unzugänglichen abgeschnittenen Inhalte. Coco-Hinweis und sichtbare Klickziele auf Remy/Emmi/Wilma; schnellerer/manuell bedienbarer Demoablauf, Pause/Reduced Motion. Keine neuen Bilder/Audio/Provider.

Tutorial: direkt ursprüngliche echte UI mit Coco-Führung, keine Vorab-Namensfrage/separater Folienersatz. Name erst beim eigenen Schülerdurchlauf. Vorhandenes GRADECREW_TUTORIAL.md und gradecrew-tour/appfirstAiGuide verwenden. Accountlos nur isolierte Beispieldaten ohne Firebase-Auth-Imitation oder Serverwrites; keine geteilten Tutorialkonten. Falls bestehender Ablauf das nicht klein ermöglicht, konkret abgrenzen statt stiller Architekturänderung.

Autor: Analysiere Hero-Art-Directions01a10e98-1e57-7b40-af70-555fdfdae2e3, Sol/high, Turn01a1118e-5c9d-7a72-bb8f-cb4757a4f0c2. Einziger Produktschreiber, eigener Korrekturbranch auf aktuellem Integrationshead. Frühere Testkorrektur Versuch1 bleibt erhalten; weitere Reparatur zählen, max3 keinReset. Tutorial-Recherche Luna im01a10ac4-1557-7663-8cbf-8415c6cc0bca abgeschlossen, nur gelesen.

Zieladresse: Martin erwartet https://hausaufgabe-staging.web.app/. Vorhandene Automatikkette deployed ausschließlich Hosting-Channelgradecrew-app-integration, langePreviewURL. Main muss kurzeAdresse über kontrolliertes StagingHosting nach gleichen Nachweisen versorgen; keine Production. Aktueller Inhalt kurzerAdresse nicht geprüft: Browserzugriff durch unverfügbare administrativ vorgeschriebene Sicherheitsprüfung blockiert. KeinAlternativbrowser/HTTP-Umweg zur Umgehung.

Nächster Schritt: Autorbefund/Commit abholen, genaue Fehlerreproduktion und Testnachweise unabhängig prüfen, dann erlaubte Staging-Veröffentlichung mit eindeutiger URL. Nutzerabnahme offen/fehlgeschlagen, nicht auf grün setzen.
