# GradeCrew Secure Geräteunterstützung und Statistiken

Stand 16.10.2026. Ergänzung zum ausdrücklich freigegebenen Layoutplan. Production bleibt unverändert.

## Geräteunterstützung

Der aktuelle Vertrag der Secure-App ist iPadOS 17 oder neuer, iPad-Gerätefamilie 2 und bestätigter Apple-AAC-Modus. Baujahr und Displayzoll allein entscheiden weder über Installation noch über Eignung. Geräte ohne iPadOS 17 können diesen Build nicht installieren. Beispiele unterstützter Modellreihen laut Apples iPadOS 17-Angaben: iPad ab 6. Generation, Air ab 3. Generation, mini ab 5. Generation, Pro 10,5 Zoll, Pro 12,9 Zoll ab 2. Generation und Pro 11 Zoll. Eine OS-Kompatibilitätsliste ersetzt keinen GradeCrew-Gerätetest.

Apple-Referenzen: [iPadOS 17 Geräteangaben](https://support.apple.com/en-ae/120949), [Prüfungsmodus](https://support.apple.com/de-de/101976), [AAC Framework](https://developer.apple.com/documentation/automaticassessmentconfiguration/).

Die Mindestversion wird in dieser Ausgabe nicht allein wegen des Alterswunschs abgesenkt. Für eine Erweiterung auf iPadOS 16 wäre zuerst eine Verfügbarkeitsprüfung aller verwendeten APIs, ein alter Systemruntime-Test und ein echter AAC-Lauf auf einem entsprechenden Gerät nötig. Wer nur maximal iPadOS 15 installieren kann, benötigt weitere Anpassungen. „Alle iPads der letzten zehn Jahre“ ist deshalb keine belastbare Zusage.

Die Abnahme unterscheidet künftig:

- Installierbar: unterstützte OS-Version und passendes App-Paket.
- Darstellung geprüft: reale SwiftUI-/WebKit-Prüfungen mit definierten Größen und Textskalierung.
- Prüfung auf Hardware bestanden: tatsächliches Gerät, OS, Build, Sperre, Medien, frühe Abgabe, Zeitablauf und Freigabe dokumentiert.
- Noch nicht qualifiziert: ältere CPU-/RAM-Klassen oder OS-Versionen ohne Hardware-/Runtime-Nachweis. Ein modernes Simulator-iPad emuliert deren Leistung nicht.

Ältere Geräte brauchen insbesondere begrenzte Medienabmessungen, stabile Antwortwiederherstellung nach WebView-Prozessverlust, geringe Listener-/Timerlast und Schutz vor unnötigen Neuladungen. AAC, Datum/Frist, lokale Sicherung und fertige Abgabe müssen nach Wiederaufnahme denselben Versuch betreffen.

## Grenzen und weitere Betriebspunkte

Vor einer Klassenprüfung gehören WLAN, genügend freier Speicher, Akku/Ladekabel, Lautstärke/Kopfhörer bei Hörfragen und ein aktueller, schulisch freigegebener App-Build zur Vorbereitung. Die App darf keine unnötigen Kamera-/Mikrofonrechte für eine reine Schülerprüfung verlangen. Bei geteilten iPads bleiben neue Teilnahmen getrennte Versuche; ein zurückgebliebener offener Versuch wird nicht still gelöscht.

Die bekannte Offline-Grenze bleibt: laufende Antworten können lokal gesichert werden, aber eine lange Störung ist wegen der serverseitigen 30-Sekunden-Nachfrist noch keine garantierte Offline-Abgabe. Eine betreute Lehrer-Notfreigabe und eine echte Offline-Strategie sind vor breitem unbeaufsichtigtem Schuleinsatz gesondert zu entwickeln. Ein schöneres Layout löst diese Fälle nicht.

## Verbindliche Metrikbedeutung

Prüfungsfakten kommen aus den bestehenden Serverversuchen und Abgaben; Bedienverhalten wird als vom Client berichtet gekennzeichnet. Es gibt keine Behauptung, dass ein Analytics-Ereignis die AAC-Sperre serverseitig beweist.

- Teilnahmen: eindeutig deduplizierte Versuche, keine Anzahl natürlicher Personen.
- Verwendete Tests: unterschiedliche Test-/Prüfungsrunden mit beobachteter Secure-Teilnahme.
- Beteiligte Lehrkräfte: unterschiedliche serverseitige Eigentümer dieser Tests; nicht aus Schülernamen abgeleitet.
- Dauer: serverseitige Start-/Abgabezeit. Aktive Bearbeitungszeit ist daraus nicht abzuleiten und wird in dieser ersten Ausgabe noch nicht getrennt gemessen.
- Abschlussart: manuell oder zeitgesteuert, mit bestätigter Serverabgabe gesondert ausgewiesen.
- Unterbrechung: beobachtetes AAC-/App-Ereignis, kein automatisch als absichtlicher Abbruch gedeuteter App-Hintergrundwechsel.
- Unvollständig: Versuch ohne bestätigte Abgabe; „nicht wieder gesehen“ ist ein unbekannter Ausgang, keine minutengenaue bekannte Abbruchzeit.
- Aufgabenbearbeitung: Aufgaben-ID, begonnen/bearbeitet aus regelmäßigem Formularstand. Besuche und aktive Betrachtungsdauer je Aufgabe sind eine spätere Erweiterung. Nie Antworttext, Lösung, Note oder Rohaufnahme im Analyseereignis.
- Zuverlässigkeit: Verbindungsfehler, Wiederherstellung, Abgabewiederholung, Quittungs-/Freigabezeiten und technische Fehlerkategorien; keine vollständigen privaten Fehlermeldungen oder Tokens.

Die Erfassung verwendet einen lokalen, geschützten und begrenzten Ausgangspuffer mit stabilen Ereignis-IDs. Wiederholte Zustellung zählt nicht mehrfach. Ein Statistikfehler darf niemals Abgabe oder Freigabe verzögern. Der Server validiert Versuch und Berechtigung, ordnet Lehrkraft/Prüfungsrunde selbst zu und übernimmt keine angebliche Lehrer-ID vom iPad.

## Datenhaltung und Auswertung

Firestore bleibt die kanonische Staging-Ablage. PostHog kann eine bereinigte optionale Projektion für Diagramme erhalten; die vorhandene Crew-Event-Allowlist wird nicht ungeprüft um Schülerdaten erweitert. Kein Browser-Autocapture, Session-Replay, Namens-/E-Mail-Export oder Gerätefingerprint.

Als anfängliche Begrenzung gelten 30 Tage für Detailereignisse und 13 Monate für tägliche Zähler. Dies betrifft nur neue Telemetrie, nicht die schon bestehenden Test-/Abgabedaten und ihre Regeln. Detailereignisse sind pseudonym, nicht automatisch anonym. Zugriff erfolgt nur über bestehende Rollen oder eigene serverseitig autorisierte Auswertung. Löschfrist und tatsächlich aktive Bereinigung werden bei der Bereitstellung getrennt nachgewiesen; ein Timestamp allein wird nicht als eingerichtete TTL-Bereinigung bezeichnet.

Einzelereignisse und aggregierte Kennzahlen erhalten eine Schemaversion. Berichte unterscheiden offene Versuche von bestätigten Abgaben, Teilnehmerzählung von Personenzählung und beobachtete Unterbrechungen von vermuteten Abbrüchen. Damit bleiben die Zahlen auch dann verständlich, wenn ein iPad längere Zeit keine Verbindung hatte.

## Tatsächlicher Umfang dieser ersten Ausgabe

Neue, ausschließlich serverseitig erreichbare Sammlungen: `secureTelemetryAttempts`, `secureTelemetryEvents` (30 Tage), `secureTelemetryDaily`, `secureTelemetryPresence` (397 Tage). Die bestehende Default-Deny-Regel erlaubt keinen direkten Clientzugriff. Der neue Callable nimmt ausschließlich ein durch den vorhandenen Versuchstoken authentifiziertes, streng begrenztes Schema an. Die Lehrkraft stammt vom Server-Test. Rohdaten bleiben pseudonym und sind nur für berechtigte Projektadministration über Firebase zugänglich. Ein neues Lehrkräfte-Statistikdashboard und PostHog-Weiterleitung sind noch nicht Teil dieses Builds.

Das iPad speichert den vollständigen Ausgangspuffer einschließlich separater Versuchszugangsdaten in einem eigenen gerätegebundenen Keychain-Eintrag. Er bleibt beim regulären Löschen des abgeschlossenen Prüfungsstands erhalten. Maximal 128 Ereignisse; Zwischenstände werden pro Versuch zusammengefasst, bei längerem Ausfall können ältere Details verdrängt werden. Zustellung ist daher bestmöglich, keine Vollständigkeitsgarantie. Annahme und bestätigte Abgabe werden auf dem Server zusätzlich aus dem echten Versuch/Abgabebeleg bestimmt und pro Versuch nur einmal gezählt. Ein Servertrigger erfasst Abgaben auch ohne abschließendes Clientereignis, sofern die Teilnahme zuvor erfasst wurde.

`automaticSubmissions` bedeutet Zeitablauf **oder serverseitiges Prüfungsende**. Es ist keine behauptete präzise Begründung für jeden Abbruch. Tatsächlich gelesene Aufgaben, Aufmerksamkeit oder eine natürliche Person können nicht aus Bearbeitungshaken bewiesen werden. Native Sperr-/Freigabeereignisse sind Clientbeobachtungen; die Apple-Sperre wird weiterhin am physischen Gerät geprüft.

Die geplante tägliche Bereinigung entfernt pro Sammlung höchstens 16.000 abgelaufene Datensätze pro Lauf; Rückstände werden am Folgetag weiterbearbeitet. Dies ist eine Löschzielgrenze mit täglicher Ausführung und kein minutengenaues TTL-Versprechen. Bei Klassenbetrieb sind Umfang und Rückstand zu überwachen. Rechtsgrundlage, schulische Information und Aufbewahrung sind vor einem Production-Rollout separat festzulegen; hier wird nur Staging genutzt.

## Schulbetrieb nach dem Pilot

TestFlight ist kein dauerhafter Auslieferungsweg: Ein Build ist laut Apple höchstens 90 Tage testbar ([Apple TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)). Vor regulären Klassenprüfungen brauchen wir eine stabile Version und einen passenden schulischen Verteilweg; ein unerwartet abgelaufener Beta-Build darf keine Prüfung verhindern. Außerdem muss klar sein, welche Umgebung ein Testcode anspricht: dieser Build verwendet fest Staging, keine automatische Suche nach einem gleichen Code in Production.

Zur nächsten Hardware-Qualifikation gehört mindestens ein Gerät nahe der Mindestversion mit wenig Arbeitsspeicher und ein aktuelles iPad. Beide brauchen einen langen Medien-Test, Softwaretastatur, große Schrift, Wiederaufnahme, frühe Abgabe und Zeitablauf. Unterschiedliche Bildschirmgrößen sind durch flexible Layouts abgedeckt; Betriebssystemfehler, Speicherdruck, Apple-AAC und tatsächliche Audiowiedergabe brauchen weiterhin Gerätetests. Eine garantierte universelle Fehlerfreiheit kann keine Screenshot-Matrix liefern.

Für die Auswertung ist ein Datenwörterbuch verbindlich: „aktiv“ darf nicht aus „App offen“ geraten werden, „Abbruch“ nicht aus einem fehlenden letzten Ereignis, und „Schülerzahl“ nicht aus Namen/Kürzeln. Datenqualität ist selbst eine Kennzahl: Anteil erfasster Starts mit Serverquittung, letzte Synchronisierung, noch offene Teilnahmen und Übertragungsfehler getrennt anzeigen. Die Rechtefreigabe und der echte Staging-Nachweis stehen im Auslieferungsprotokoll, nicht in einem pauschalen Fertig-Haken.

Die neue Secure-Kennzeichnung beginnt erst mit ihrer Aktivierung und einer App, die die Ereignisse sendet. Ältere Serverversuche können bereits Start-/Abgabezeiten enthalten, werden aber ohne belastbare Herkunftskennzeichnung nicht rückwirkend als native Secure-Teilnahmen gezählt. Tageswerte von „unterschiedliche Tests/Lehrkräfte“ dürfen nicht über mehrere Tage addiert und dann als insgesamt eindeutige Anzahl bezeichnet werden; dafür sind die Presence-Referenzen auszuwerten.
