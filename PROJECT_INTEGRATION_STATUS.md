# GradeCrew – gemeinsamer Stand der Arbeitsstränge

Stand: 30.09.2026. Aussagen aus Chats wurden soweit möglich mit Code/CI verglichen.

| Strang | Tatsächlicher Stand | Nächster Nachweis |
|---|---|---|
| Haupt-App de.gradecrew | 0.1.2 Upload erfolgreich, Lauf 36656798111; echte Staging-WebView | 0.1.3 Build und echter iPad-Test |
| Normales Staging | release.json gc21 / 4707c45, erneut öffentlich gelesen | konsolidierten Webstand bewusst deployen |
| Secure Assessment gc27 | Code 8fbc8cc, CI335 grün, Branch feature/secure-assessment-v1 | Preview laut Benutzerübergabe deployed; URL/Manifest und echter Ablauf noch verifizieren |
| 30-Teilnehmer-Test | Branch feature/gate-e-load-test, b9ba03b; CI grün | tatsächlicher Report aus Firebase fehlt hier |
| Mobile Layout | Branch fix/gradecrew-staging-polish, f90711b | noch nicht mit gc27 zusammengeführt |
| Secure-App de.gradecrew.secure | laut Nutzer bereits auf iPad; separater Branch/Bundle | Prüfungsablauf separat verifizieren |

## Warum die Stände auseinanderlaufen

Die native App lädt eine feste normale Staging-URL. Änderungen an einem anderen
Hosting-Channel erscheinen dort nicht. Außerdem stammen der mobile Layout-Branch
und der Security-/gc27-Branch von unterschiedlichen Webständen. Nur Dateien zu
kopieren oder den alten Mobile-Branch über gc27 zu deployen würde Neuerungen verlieren.
Vor dem nächsten normalen Hosting-Deploy daher auf einem Integrationsbranch
zusammenführen, Konflikte insbesondere an Tour/Buildskript prüfen, CI und Gerätetest.

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
