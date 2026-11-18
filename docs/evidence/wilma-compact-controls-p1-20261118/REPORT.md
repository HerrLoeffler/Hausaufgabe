# Kompakte Bedienung bei unveränderter Aufgabengröße · 18.11.2026

GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01, bestehender Web-Fachchat. Quelle 9de201190cf5cac2c0c22d87a1824914d0b3f064, Tree 3f60ebed7f06569877b5e6e6cf57472254b0d9a2, PR438 weiterhin gestapelt/offen, kein Runtime-Zielbranch-Merge behauptet. Ausdrückliche bestehende Freigabe für Browser/Secure-Web-Hosting; native App bleibt separat.

## Tatsächlich veröffentlicht

Hosting/UI: kompakter Wilma-Kopf, Offene/Alle statt sechs Antwortfiltern, eine kurze Meldung je Antwort und explizite Einzelaktion für noch nicht gestartete Prüfung. Schüler: ursprünglicher Timer dauerhaft kompakt sichtbar, begrenztes 1..N-Nummernraster, Grün/Häkchen für beantwortet und unabhängige aktive Markierung. Aufgaben bleiben 860 px breit in der breiten Ansicht; Schrift unverändert. Rechte Übersicht erst ab 1180 CSS-Pixeln Breite und 600 Pixeln Höhe, sonst volle Aufgabenbreite. Eingabe-/Audioknoten, Deadline, Zwangsabgabe und ABGEBEN/SUBMIT erhalten. Assessmentclient, Deadlineguard, Bestätigungsmodul und Firebaseconfig sind bytegleich zum bisherigen Livebuild.

Stage: sites/gradecrew-staging-2026/versions/ba74f0b6666fd0e3, nur /wilma/, 216/216 öffentliche Manifestdateien geprüft und 447 andere Dateien unverändert. Live: sites/hausaufgabe-staging/versions/737c9ee7b5546025, beide Origins gradecrew.de und hausaufgabe-staging.web.app jeweils 216/216 Dateien, 0 Hashabweichungen, keine entfernten Pfade; 206 Assets unverändert. Bestehende Kontenanbindung und alte Links bleiben erhalten. Sämtliche 98 Stage- und 62 Live-Functions blieben unverändert; Reviewrevisionen reviewwilmaanswers-00010-zud / reviewwilmaanswers-00005-lax stammen weiter aus d67b0b5.

## Prüfung und Grenze

Exakte CI 44368770487 vollständig erfolgreich, Node 22 und vollständige Browserfreigabe. Unabhängiger Review PASS auf exaktem Tree, keine P0–P2; 58 gezielte Tests und 12 lokale Browserfälle. Lokale Gesamtsuiten mit 828 Root/UI- und 503 Functions-Tests grün. 24 Timer/Grid-, 36 Layout-, 18 Abgabe-, 72 Wilma- und 8 First-answer-Fälle in gezielten Läufen geprüft. CSS-Viewport-/Zoomsimulation ersetzt keinen physischen Handy-/iPad-/OS-Tastatur-/Pinchtest.

Historische reale Diagnose war ausschließlich lesend: alter unbekannter abgerechneter Job, dessen Belegobjekt fehlt (404), plus mehrere nie gestartete Antworten, die irrtümlich von einer kontoweiten Fehlerschranke betroffen waren. Rohe Echtantwort-Diagnose lokal gelöscht; nur inhaltsfreie Aggregate erhalten. Keine neuen Provideraufrufe, echte Schülernotenänderungen oder Reservierungsrücksetzungen in diesem P1-Schritt.

## Weiter offen: erweiterte Serverreparatur

Der zusätzliche Backendpatch für fehlende/beschädigte completed-Belege und failed/createdAt-Altzustände ist code-/test-/reviewseitig vorbereitet, jedoch NICHT deployed. Vorbereitete 146 Dateien, Archiv-SHA256 6f87bff5b8ff527babdc10653b907409b463c1ad517f37ff2bc12f4b39a4e840. Nach der Hostunterbrechung wurde die angemeldete Browserfähigkeit entfernt. Der ausdrücklich verlangte tatsächliche synthetische Altfall-E2E kann daher derzeit nicht durchgeführt werden; ein frischer Erfolgsfall wird nicht als Ersatz ausgegeben. Bestehender d67-Server erlaubt weiterhin nur seine bisherigen sicheren Wiederaufnahmen/settled-unknown-Retries. Hosting ist unabhängig als rückwärtskompatibel geprüft.

Nächster konkreter Schritt: vorhandene Stage-Anmeldung wieder über berechtigte Browserfähigkeit nutzen; den bestehenden rein fiktiven Systemtest mit gesichertem altem Beleg kontrolliert in einen historischen Fehlerzustand versetzen und denselben Fingerprint mit höchstens einem ausdrücklich gestarteten neuen Stageversuch reparieren. Vorher Beleg sichern und Zustand/Budget frisch lesen, nach unklarem Ergebnis nicht wiederholen. Keine neuen Liveproviderstarts, kein Klassen-Massenlauf, keine echte Notenänderung. Erst nach belegtem Altfall genaue Functionsquelle selektiv auf Stage/Live freigeben. Original-503-Ursache bleibt historisch unbekannt.

Native-Owner 01a10c75-8912-7a12-98f0-c9e78064aa2c hat den neuesten Größen-/Timer-/Nummernrastervertrag erhalten. Sein Appbuild/TestFlight und Martins physische Geräteabnahme sind eigenständige offene Nachweise; Hosting ersetzt sie nicht.
