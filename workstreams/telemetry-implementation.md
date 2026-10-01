# GC-TELEMETRY-01–03: isolierter Implementierungsstand

Basis feature/gradecrew-app-integration@74eb2ec08e81315875abfc4b1ae052d9f78797eb. Eigener Branch feature/telemetry-implementation. Keine Integration/Deployment oder Aktivierung bisher.

Collector mit striktem Operationsvertrag, Owner-/Attempt-Token-Autorisierung, Transaktions-Deduplizierung, Konfliktprüfung, Tageslimit, 30-Tage-Expire-Feld und begrenztem Cleanup. Produktionsprojekt fail closed. Transport begrenzt, nur Speicher, Messfehler verändern Fachoperation nicht. Secure-Client opt-in: Beitritt nach autorisiertem Attempt und Submit; vor erfolgreichem Start fehlt bewusst anonyme Collectorberechtigung. Adminpanel zeigt eigene Clientoperations-Aggregate getrennt von tatsächlichen gespeicherten Rundenabgaben. Erwartete Teilnahmezahl bleibt null, keine erfundene Erfolgsquote.

Serverreferenzen existieren bereits in lib/observability.js am tatsächlich exportierten secure-lifecycle.js, nicht nur altem index.js. Früheres Inventar um diesen Nachweis ergänzen.

Bestehende KI-Daten sind jetzt zusätzlich read-only auswertbar: eigene `aiEvents` nach Art, Modell, Promptversion, Fehlerstatus, Tokenbelegen und Reparaturmetriken sowie eigene `ai_question`-Bewertungen. Historische Tokenwerte `0` werden ausdrücklich als mehrdeutig behandelt, weil ältere Logs fehlende Usage ebenfalls als 0 gespeichert haben können. Kosten bleiben ohne versioniertes Preismodell `null`; eine Akzeptanzquote bleibt ohne vollständigen Nenner Generierung → Bewertung → Veröffentlichung → Nutzung ebenfalls `null`. Die technische Staging-Adminansicht zeigt diese Bestandsdaten getrennt von Runden-/Clienttelemetrie.

Aktivierung erfordert GC_TELEMETRY_ENABLED=true auf Assessment-Functions im Projekt hausaufgabe-staging, Client telemetryEnabled und verifizierten releaseCommit. Aktuell default false. Kein Production-Tracking. Cleanup maximal 400 pro Sammlung/Tag: Pilotlimit, für höheres Volumen verbessern und Backlog überwachen.

Prüfung des rekonstruierten KI-Auswertungsblocks: 4 isolierte Node-Tests lokal grün (Summierung, historische Token-Semantik, Owner-Scope/Auth, Staging-Gate). Für den Branch-Commit liegt noch kein GitHub-Actions-/Deploy-Nachweis vor; die frühere Chatangabe zu 25 lokalen Prüfungen ist kein Ersatz für einen frischen CI-Nachweis.

Offen: tatsächliches Cloudinventar/Retention ohne Cloudzugriff; Endpoint-Emulator/Deployment; unbekannte Joinfehler vor Attempt; offizielle Rundenerwartungszahl; aktive Lehrerzeit und vollständige KI-Verknüpfung bis Veröffentlichung/Einsatz; Spielebranch-Adaption; Native Owner/Reset; vollständige UI statt technischer JSON-Ansicht. Schon existierende Legacy-Tutorial-Abgabe ist nicht Secure-Abgabe und wird nicht fälschlich als instrumentiert bezeichnet.
