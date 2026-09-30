# GradeCrew – gemeinsamer Stand der Arbeitsstränge

Stand: 30.09.2026. Aussagen aus Chats wurden soweit möglich mit Code/CI verglichen.

| Strang | Tatsächlicher Stand | Nächster Nachweis |
|---|---|---|
| Haupt-App de.gradecrew | 0.1.4 (7) Upload erfolgreich, Run 36723972615; echte WebView, Dialoge, Preview-Wahl | TestFlight aktualisieren, echter iPad-Test |
| Normales Staging | release.json gc21 / 4707c45, erneut öffentlich gelesen | konsolidierten Webstand bewusst deployen |
| Secure Assessment gc27 | Code 8fbc8cc, CI335 grün, Branch feature/secure-assessment-v1 | Preview laut Benutzerübergabe deployed; URL/Manifest und echter Ablauf noch verifizieren |
| Gemeinsame Webversion gc28 | feature/gradecrew-app-integration, Code 56737d4; CI #352 und Mobile-Check grün; 141 lokale Tests | Hosting-Preview deployen, URL in App-Beta einsetzen |
| 30-Teilnehmer-Test | integrierter Parallel-Smoke-Test, Receipts nun an Attempt gebunden | tatsächlicher Report aus Firebase fehlt hier |
| Mobile Layout | f90711b in gemeinsame gc28-Basis übernommen, Inline-Coach-Konflikt behoben | realer Tastatur-/Gerätetest |
| Secure-App de.gradecrew.secure | laut Nutzer bereits auf iPad; separater Branch/Bundle | Prüfungsablauf separat verifizieren |

## Warum die Stände auseinanderlaufen

Die native App lädt eine feste normale Staging-URL. Änderungen an einem anderen
Hosting-Channel erscheinen dort nicht. Außerdem stammen der mobile Layout-Branch
und der Security-/gc27-Branch von unterschiedlichen Webständen. Nur Dateien zu
kopieren oder den alten Mobile-Branch über gc27 zu deployen würde Neuerungen verlieren.
Die Zusammenführung erfolgte inzwischen auf feature/gradecrew-app-integration.
CI #352 und Mobile-Check sind erfolgreich. Gerätetest und normaler Hosting-Deploy
bleiben ausstehend; zuerst die separate gemeinsame Preview verwenden.

## Was der 30er-Test bedeutet

Ein Test, 30 simulierte Schüler. Prüft gleichzeitige Starts, Polls, Abgaben und
wiederholte Abgaben. Sinnvoll vor echtem Unterricht; keine Voraussetzung für eine
interne Lehrer-App-Navigationsbeta. Der vorhandene Test ist ein begrenzter
Paralleltest, kein vollständiger Beweis für Gate E oder sichere Prüfungen.
Nicht abgedeckt: reale iOS-Hintergrundzustände, WLAN-Ausfälle, Lehrer-Ende-Rennen,
maximale Datenmengen, länger anhaltende Last und Datenbankprüfung verlorener Abgaben.
Kein erfolgreicher echter 30er-Report in dieser Übernahme vorliegend.

## Reihenfolge ohne unnötige Wartezeit

1. Vorhandene App über TestFlight verbessern/testen; keine neue Apple-Einrichtung.
2. Native Dialoge und grundlegende iPad-Webfunktionen prüfen.
3. Aktuelle Preview-URL/Manifest sichern und gc27-Funktionsablauf testen.
4. Mobile Webänderungen mit gc27 konsolidieren und normalen Staging-Deploy vorbereiten.
5. Paralleltest als begrenzten Smoke-Test durchführen; offene Prüfungsgates getrennt dokumentieren.

Production bleibt unverändert. Keine vorzeitige Aussage „Security ready“.
