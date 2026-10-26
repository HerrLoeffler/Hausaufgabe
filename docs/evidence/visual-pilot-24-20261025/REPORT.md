# 24 visuelle Probetests — Prüfbericht

25.10.2026 · GC-EXTENDED-QUESTION-TYPES-01 · ausschließlich getrennte Testvorschau visual255.

24 echte KI-Erstellungen mit192 Aufgaben, je8 Aufgaben und16 Punkten. Vier Tests je Mathematik, Deutsch, Englisch, Natur und Technik, Geschichte/Geografie sowie Wirtschaft; Klassen5–10 jeweils viermal. Alle Aufgaben nutzen den bestehenden visuellen Bewertungsweg, keine klassischen Ersatztypen.

## Umfang und Ergebnis

Alle192 Originale samt Hinweisen und Endfassungen gelesen; zusätzlich unabhängiger Schlussreview aller192 Endfassungen.1176 deterministische Aufgabenchecks,23 gezielte Regressionen,293 AI-Backendtests und97 Assessmenttests bestanden. Die lokalen Checks bestätigen technische Verträge, keine Lernwirksamkeit.

63 Aufgaben redaktionell korrigiert oder präzisiert. Das ist eine Mischung aus Fehlerbehebung und Qualitätsverbesserung, keine reine Fehlerquote. Originale unter *-quiz.json, Endfassungen unter *-reviewed.json, Begründungen unter corrections; Rücklesebelege unter *-correction-receipts.json.

| Test | Fach | Klasse | Thema | Testcode | Überarbeitete Aufgaben |
|---|---|---|---|---|---|
| P01 | Mathematik | 5 | Brüche und Anteile im Alltag | AUMC64Q4 | 0 |
| P02 | Mathematik | 6 | Winkel und Koordinaten | UXBCQ5FL | 0 |
| P03 | Mathematik | 8 | Prozentrechnung und lineare Zusammenhänge | KYZW8JL7 | 1 |
| P04 | Mathematik | 10 | Lineare Funktionen und Dateninterpretation | NLRVJTW8 | 4 |
| P05 | Deutsch | 5 | Wortarten und Satzglieder erkennen | W2QQ9K3A | 2 |
| P06 | Deutsch | 7 | Satzbau und Textbelege | TZ26WDJR | 3 |
| P07 | Deutsch | 9 | Argumente erkennen und sachlich formulieren | K9HEUB8X | 3 |
| P08 | Deutsch | 10 | Quellenkritik und Argumentationsanalyse | R8DKGGLD | 5 |
| P09 | Englisch | 5 | Everyday English: School and Daily Routines | NQS5LTM3 | 4 |
| P10 | Englisch | 6 | A day out: Uhrzeiten, Orte und Abläufe | 4Y3HHAM7 | 5 |
| P11 | Englisch | 8 | Travel and Communication | XH2JWU72 | 3 |
| P12 | Englisch | 9 | Media and opinions: Meldungen auswerten | R6D2JQKR | 4 |
| P13 | Natur und Technik | 6 | Pflanzen und Wachstumsdaten | 5TLF5WTY | 3 |
| P14 | Natur und Technik | 7 | Temperatur und Messreihen | ZADAHYZV | 1 |
| P15 | Natur und Technik | 8 | Kraft, Bewegung und Energie | 3XBSMR7M | 3 |
| P16 | Natur und Technik | 10 | Experimente und wissenschaftliche Aussagen | RW2NRJ5R | 2 |
| P17 | Geschichte und Geografie | 5 | Karten, Richtungen und Zeitabstände | KEVX5RVP | 4 |
| P18 | Geschichte und Geografie | 7 | Stadtentwicklung und Klimadaten in Fiktivstadt Nordtal | DPCQRGW9 | 2 |
| P19 | Geschichte und Geografie | 9 | Bevölkerung und Quellen vergleichen | 2EDP2TTW | 2 |
| P20 | Geschichte und Geografie | 10 | Raumentwicklung und begründete Standortentscheidungen | V5ABXKYP | 5 |
| P21 | Wirtschaft | 6 | Einkaufen und Kassenbons | HU2GJSBB | 1 |
| P22 | Wirtschaft | 7 | Budget und Sparen | E5TSGNGB | 1 |
| P23 | Wirtschaft | 8 | Angebote und Kosten vergleichen | G9L3D46T | 2 |
| P24 | Wirtschaft | 9 | Betriebliche Entscheidungen mit Deckungsbeiträgen | DGEA9BMU | 3 |

## Konkrete Erkenntnisse

- Ein falscher linearer Tabellenwert wurde von15 auf18 korrigiert. Aufgabenstellung, Grafik und Schlüssel müssen unabhängig nachgerechnet werden; ein grüner Selbsttest gegen denselben falschen Schlüssel erkennt das nicht.
- Bei Großschreibungsaufgaben muss die Schreibung relevant bleiben. Das neue optionale caseSensitive-Feld gilt nur für Fehlerkorrekturen; die Standardbewertung bleibt unverändert.
- Ganze Sätze, freie Begründungen und algebraische Ausdrücke sind nicht fair über wenige exakte Mustersätze bewertbar. Diese Aufgaben wurden auf klare Wortantworten, Koeffizienten, Belegauswahl oder begrenzte Kategorien umgestellt. Übliche gleichwertige Fachbegriffe werden akzeptiert.
- Ein Beschluss beweist keine Umsetzung; zwei Monate keinen durchgehenden Jahresverlauf; Nutzungszahlen keine Zustimmung. Die Quellen müssen die tatsächlich gefragte Aussage stützen. Fehlende Quellen wurden als eigene fiktive Daten ergänzt.
- Uhrzeitenskalen zeigen HH:MM statt Dezimalstunden. Lange Verbindungsbeschriftungen erhalten vollständige auswählbare Textlegenden. Der vorhandene JSON-Editor-Fix ausPR271 wurde wiederverwendet.
- Hinweise dürfen die gesuchte Antwort nicht durch direkte Übersetzung verraten. Zu einfache höhere Klassenaufgaben wurden teilweise durch Berechnung oder gewichtete Auswertung verbessert. Die gesamte Serie bleibt ein Formatpilot.

## Nachweise und Grenzen

Backend aus lokalem Codecommit a396feedccf0d41ecf48c0e23e3e99d53e1cbf3a, identischer Remote-Tree62f9997587e35eeb0d69eed6d60e4176445d5fe5, Remotecommit5302f8d8c5b4827355d40d12e9e568dcaf1d56ac. Nur codebases visual255-ai und visual255-assessment im Projekt gradecrew-staging-2026. Die erste Bereitstellung stoppte vor Updates wegen fehlendem Node-Suchpfad; derselbe unveränderte Stand wurde danach mit vorhandener Node-Laufzeit erfolgreich bereitgestellt. Kein blinder Provider-Retry, keine Regelnänderung.

Der echte120-Fall-Serverlauf ist vollständig bestanden: je Test16/8/0/0/16 Punkte für korrekt/gemischt/leer/falsch/gleichwertige Alternative. Alle120 öffentlichen Aufgabenpapiere lösungsfrei und nach Wiederaufnahme unverändert;24 doppelte Abgaben liefern unveränderte Belege. Zusätzlich bestätigt der normale Browserdurchlauf bei P05 nur korrekter Fehlerzeile, aber weiterhin falscher Kleinschreibung exakt1/16 Punkte und gespeicherte Abgabe ohne Lösungsfreigabe. Alle180 Hostingdateien stimmen mit dem Manifest überein;24 öffentliche Testlinks enthalten keine Aufgabenlösungen.46 übrige Backendfunktionen im Vorher-/Nachhervergleich unverändert. Ergebnisse stehen je Test in *-server-checks.json sowie server-summary.json, hosting-verification.json und deployment.json. Tokens liegen ausschließlich außerhalb des Repos in einem privaten temporären Verzeichnis; nur synthetische Daten.

24 KI-Ereignisse,161 interne Providerrequests,67 interne Aufgabenersetzungen,1042729 Input- und244582 Outputtokens. Geldbetrag unbekannt. Das sind24 logische Tests, keine Behauptung von nur24 Modellaufrufen. Usage enthält nur das eigene synthetische Testkonto im Zeitfenster dieser Serie.

Lokale Browserinteraktionen: beliebige richtige Rasterauswahl, Winkelmessung/Toleranz, Großschreibung, lange Verbindungen, Uhrzeit, Pflanzenbeschriftung und Bildbereich getestet; alle12 Formate mit Steuerelementen dargestellt. Kein physischer Touch- oder Screenreadernachweis.

## Offene Abnahme

Menschliche Lehrkraftprüfung, reale Klasse, physische Geräte und Unterrichtswirksamkeit stehen aus. Fiktive Geschichtsdaten prüfen Methoden statt historischer Tatsachen; Wirtschaftsdaten sind keine Marktinformationen. Keine amtliche Lehrplanvollständigkeit behauptet.

Kleine verschobene Punkte aus dem Review: β/γ-Auftrag bei festem α-Winkellabel; zusätzlicher vollständiger Vergleich jeder öffentlichen Aufgabenprojektion im Serverrunner (Entwurfkorrekturen werden bereits vollständig zurückgelesen); teilweise niedrige Anforderung höherer Klassen.

Normales Staging, Schuladresse und Production bleiben unverändert. Übernahme auf die aktuelle Seite erfordert einen gesonderten Integrationsauftrag nach fachlicher Erprobung.

Optionale Browser-Neuladeprobe durch automatische Freigabeprüfung wegen möglichem Antwortverlust abgelehnt; ausgelassen und nicht indirekt wiederholt. Der bereits gespeicherte120-fache API-Wiederaufnahmebeleg bleibt getrennt. Der erste Klick auf Abgeben meldete einen Browsersteuerungs-Timeout; kein zweiter Klick, unabhängiger Screenshot bestätigt erfolgreiche Abgabe1/16.
