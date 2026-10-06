# GC-GAMES-PIZZA-01 Bruchpizzeria Browser Pilot

Ursprüngliche Task-ID fortgeführt. Briefing docs/bruchpizzeria-briefing-20261006@52f48f3e erhalten. Zuständig: Chat 01a111e6-c211-76a2-928e-8ed88a7b7bec. Nutzerauftrag 07.10.2026: Abfolge prüfen und Umsetzung starten.

Primary Branch feature/bruchpizzeria-browser-pilot-v1 von main@be2c22b7. Integrationsziel main für isoliertes Spielverzeichnis, kein Web-Release-Merge oder Deploy.

Plan, Bildstil, technische Entscheidungen und aktueller Fortschritt: [PLAN](../games/bruchpizzeria/production/PLAN.md), [ART_DIRECTION](../games/bruchpizzeria/production/ART_DIRECTION.md), [HANDOFF](../games/bruchpizzeria/production/HANDOFF.md). Nur games/bruchpizzeria und diese Aufgaben-/Registry-/TODO-Einträge ändern. Allgemeiner Games-Workflow weiterhin PR153@f40401f3, nicht auf main.

Nachweis: 14 lokale Node-Verhaltenstests für echte Schnittflächen, Ungleichheit, äquivalente Portionen, falschen Gast, Timerpause und Save-Restore grün; erster Rotlauf 9 fehlende Verhaltensfälle. Keine Remote-CI, Integration, Hosting, Functions/Rules, Geräte- oder Nutzerabnahme. Aktuelle Stufe branch_only. Keine bezahlten APIs oder Budgetreservierungen.

Nächster Schritt: spielbaren Browserablauf und Bildstil bauen, anschließend normalen gebauten Einstieg und Touch prüfen.


07.10.2026: erster vollständiger Browser-Pilot gebaut.17 lokale Verhaltenstests, automatischer Chrome-Ablauf an a5d78a1 und finaler kompletter In-App-Spielablauf nach Korrekturen bestätigt. Unabhängige Nachprüfung an1da7e37 ohne wichtige Befunde. Lokaler Server4187; kein Hostingdeploy, kein echter iPad-/Nutzertest. Isolierte Spiel-CI und Draft-PR folgen; Details in HANDOFF.

Abschluss: Draft-PR158, exakter Spielcode3e83a8e5bde4adcbe887939adfcadf85d10f30a8, isolierte CI37545574248 samt Build-/Browser-Artefakt11450736550 erfolgreich. Stufe ci_green, lokale Vorschauhttp://127.0.0.1:4187. Globaler Development-Status37545574184 meldet fehlende fremde Web-Übergabe; keine pauschale Gesamt-CI-Freigabe. Nutzer-/iPad-Abnahme und Remotehosting fehlen.
