# GradeCrew Secure AAC · Zielbild und Abnahme

Stand: 15.10.2026. Autorisierter Umfang dieses Schritts: ausführliche Planung, keine Implementierung oder Veröffentlichung.

## Auftrag

GradeCrew Secure (`de.gradecrew.secure`) soll auf einem unterstützten iPad einen ausdrücklich begonnenen Leistungsnachweis mit Apples Automatic Assessment Configuration durchführen. Während der bestätigten AAC-Sitzung bietet die App keinen normalen Weg zu anderen Apps, zur Startseite oder zu einem anderen Test. Normale Abgabe, autorisierte Lehrerfreigabe und betreute Fehlerbehandlung sind klar definierte Ausgänge. Production und die GradeCrew-Lehrkräfte-App bleiben unverändert.

Die AAC-Genehmigung und Portalaktivierung wurden vom Nutzer gemeldet. Signierte App, Provisioning-Profil und echte Gerätesperre sind damit noch nicht unabhängig nachgewiesen.

## Verbindliche Produktregeln

- Erste unterstützte Plattform: iPadOS, iPad; Mindestversion für den neuen Pilot: iPadOS 17.0. Das entspricht dem vorhandenen weiterentwickelten Playground-Pfad. Eine Erweiterung auf iPhones benötigt einen eigenen Hardware-Nachweis.
- Eine Xcode-App ist die ausführbare Quelle. Playground bleibt Referenz und darf keine zweite fortlaufend gepflegte Prüfungsimplementierung werden.
- Eine Prüfung zeigt Inhalte erst nach `assessmentSessionDidBegin`; in Secure-Builds kein stiller Rückfall auf eine ungesperrte Vorschau.
- Der Server entscheidet über Identität/Berechtigung, Versuch, Prüfungsfassung, Fristen, Bewertung und verbindliche Abgabe. Kein Lösungsschlüssel im Schülerclient.
- Keine reguläre Entsperrung durch JavaScript, lokales Häkchen, Netzwerkfehler, Zeitablauf allein oder frei aufrufbaren Abbruch.
- Antworten bleiben bei Retry, Unterbrechung und Wiederaufnahme demselben Versuch zugeordnet. Keine zweite Abgabe desselben Versuchs.
- Bei AAC-Systemunterbrechung: Inhalt sofort verbergen, Fortschritt bestmöglich sichern, Apple-Sitzung gemäß Framework-Vertrag beenden und Versuch als unterbrochen behandeln.
- Bei Ausfall: sichtbare Wiederholung und betreute Notfreigabe; keine unbegrenzte Sackgasse und keine Behauptung einer erfolgreichen Abgabe ohne Serverquittung.
- Lehrkraft kann einen eigenen Versuch autorisiert beenden. Schüler haben keine Lehrer-Zugangsdaten oder universelle Entsperr-PIN.
- Barrierefreiheit, Hoch-/Querformat, kleine/große iPads, Bildschirmtastatur und externe Tastatur gehören zur Abnahme.
- Status wird getrennt dokumentiert: Quellcode lokal, GitHub, CI, Staging-Deployment, TestFlight-Upload/Verarbeitung, physischer Gerätetest, schulischer Pilot.

## Abnahmebedingungen

1. Ein signierter Development-Build mit AAC im App-Entitlement und im Profil startet auf echter Hardware eine bestätigte AAC-Sitzung.
2. Tests belegen: kein Inhalt vor bestätigtem Start; kein normaler App-Ausgang während aktivem Modus; Inhalt sofort verdeckt bei Unterbrechung.
3. Abgabe ist idempotent; native Verifikation gehört zu genau diesem Versuch und seiner endgültigen Antwortrevision; Ende wird erst nach Apples End-Callback als abgeschlossen angezeigt.
4. Ein fremdes, veraltetes oder gefälschtes Web-Ereignis kann weder Test wechseln noch entsperren.
5. Offline, Serverfehler, WebView-Prozessverlust und Neustart haben einen protokollierten Wiederherstellungs-/Freigabeweg.
6. Ein realer iPad-Test dokumentiert konkrete OS-Version, Gerät, Build, Home-/App-Wechselversuche, Abgabe und Freigabe.
7. Keine Aussage „nicht verlassbar“ ohne Einschränkung auf eine aktive, vom OS bestätigte Sitzung. Neustart, OS-Störung, kompromittiertes Gerät und Zweitgeräte sind keine garantierte Sicherheitsgrenze der App.
