# GradeCrew Secure Offline Abgabe und Store Freigabe

Stand 16. Oktober 2026. **Entwurf zur Abstimmung, noch nicht implementiert.** Der Nutzer hat die Vorbereitung des App-Store-Starts und vorrangig den Schutz vor Antwortverlust bei WLAN-Ausfall beauftragt. Eine tatsächliche Production-Umschaltung oder Projektlöschung ist nicht Teil dieses Entwurfs.

## Ziel und Grenze

Ein laufender, zuvor online gestarteter Test darf bei einem WLAN-Ausfall seine bereits lokal gesicherten Antworten nicht verlieren. Bei manueller Abgabe oder Zeitende wird ein unveränderlicher Abgabestand gesichert. Die App überträgt genau diesen Stand nach Wiederkehr der Verbindung und überprüft den passenden Empfangsbeleg. Ein verlorenes Antwortpaket des Servers darf weder eine zweite Abgabe noch eine nachträgliche Änderung des ersten Standes erzeugen.

Das ist keine vollständig offline startbare Prüfung. Noch nicht geladene entfernte Bild-/Audiodateien können ohne Verbindung fehlen; Fehler müssen sichtbar sein und dürfen andere Antworten nicht löschen. Ein Werksreset, eine App-Löschung oder der Verlust des iPads kann ohne vorherige Serverübertragung nicht technisch durch lokale Speicherung ausgeglichen werden.

## Belegte Ausgangslage

Native Basis: TestFlight 0.2.2 (1101), Auslieferungsquellstand `663364987a944ddea9dd53595bf50334374ee622`. Backend-Quellstand laut kanonischem Staging-Release `8f8697901f8c1aea89897be855ca2872c82d0f2b`, Datei `assessment-functions/lib/secure-lifecycle.js`. Die aktuelle native Arbeitskopie enthält diesen separaten Assessment-Code noch nicht; ein alter Backend-Stand aus einem anderen Worktree darf ihn nicht überschreiben.

Bereits vorhanden:

- Native Antworten werden bei Snapshot-Nachrichten lokal atomar gespeichert; die Versuchszugangsdaten liegen im gerätegebundenen Keychain.
- Ein eingefrorener Stand wird vor dem Senden gespeichert und bei erneuten Übertragungen wiederverwendet.
- Die Abgabe ist serverseitig nach Versuch-ID idempotent. Ein unabhängiger Abruf prüft den passenden Beleg.
- Apple-AAC beginnt vor der Aufgabenfreigabe und endet nach bestätigter Abgabe.
- Der laufende Countdown verwendet eine monotone Uhr. Eine Änderung der Systemzeit verlängert die laufende Prüfung nicht.

Bestehende Grenzen und zu prüfende Fehlerpfade:

- `submitAssessmentAttempt` lehnt nach persönlicher Deadline plus 30 Sekunden ab; ein Lehrer-Ende hat eine separate 90-Sekunden-Frist. Ein späterer Wiederholungsversuch löst diese Sperre nicht.
- `scheduleRetry` behandelt nur bestimmte Fehlercodes als wiederholbar. Eine HTML-Fehlerseite oder ein Fehler beim JSON-Decoding kann den Wiederholungsablauf verlassen, obwohl die Ursache ein vorübergehendes Transportproblem ist.
- Bei einem fehlgeschlagenen WebView-Freeze kann der letzte dauerhaft gesicherte Stand vorhanden sein, ohne als Abgabe eingefroren worden zu sein. Dieser Fall braucht eine eindeutige Wiederherstellung statt einer erneuten Bearbeitungsfreigabe nach Zeitende.
- Identität und Antwortdatei sind getrennte Speicheroperationen. Ein Absturz zwischen Schreib-/Löschschritten darf keine falsche Zuordnung zu einem anderen Versuch und keinen Verlust des einzigen noch benötigten Zugangstokens erzeugen.
- Nach einem Prozess-/Geräteneustart darf die App die abgelaufene Frist nicht aus einer neuen lokalen Laufzeit verlängern. Ohne neue Serverbestätigung wird kein bearbeitbarer Test neu geöffnet.

## Empfohlener Ablauf

### Während der Bearbeitung

Jede bestätigte Antwortänderung erhält eine Revision. Die Native Bridge meldet erst nach erfolgreicher dauerhafter Speicherung „Auf diesem iPad gesichert“. Wenn das Speichern scheitert, zeigt die App den Fehler und behauptet weder Sicherung noch Abgabe. Die lokale Antwortdatei wird explizit an Test und Versuch gebunden; ein fremder oder beschädigter Stand wird nicht still übernommen.

WLAN-Verlust ändert den Prüfungsversuch und die Frist nicht. Bereits geladene Aufgaben bleiben bedienbar, soweit ihre Inhalte lokal vorhanden sind. Ein sichtbarer Hinweis unterscheidet fehlende Verbindung von fehlgeschlagener lokaler Speicherung. Kein automatischer Start eines Ersatzversuchs.

### Bei Abgabe oder Zeitende

Die Oberfläche wird unverzüglich für weitere Änderungen gesperrt. Der abschließende Snapshot wird dauerhaft gesichert und als unveränderlicher Abgabestand markiert. Wenn die WebView nicht mehr erreichbar ist, kann nur der letzte nachweislich dauerhaft gespeicherte Stand verwendet werden; der Wiederherstellungsgrund wird gekennzeichnet. Eine unbelegte leere Antwortmenge ersetzt niemals still vorhandene Antworten.

Danach gilt entweder „Abgabe wird übertragen“ oder „Antworten auf diesem iPad gesichert · Übertragung ausstehend“. Ein grüner Empfangshaken erscheint erst nach einem zum Versuch passenden Serverbeleg. Der lokale Zeitpunkt des Einfrierens ist eine Clientangabe, kein serverseitiger Beweis der fristgerechten Abgabe.

### Bei wiederkehrender Verbindung

Zuerst wird geprüft, ob der Server die Abgabe bereits besitzt. Wenn ja, genügt der überprüfte Beleg. Wenn nein, sendet die App den identischen eingefrorenen Stand. Wiederholungen erfolgen einzeln mit begrenztem Backoff, zusätzlich bei Rückkehr in den Vordergrund bzw. wieder verfügbarer Verbindung. Kein paralleler Sendesturm und kein Weiterreichen von Antwortinhalten an Analytics.

Nicht jeder Fehler ist vorübergehend: fehlende Berechtigung, gelöschter Test, beschädigte lokale Daten oder abgelaufene Wiederherstellungsfrist benötigen eine verständliche Lehrkraft-Meldung. Sie dürfen nicht durch endlos identische automatische Aufrufe verdeckt werden. Der lokale unbestätigte Stand wird dabei nicht gelöscht.

## Späte Übertragung ohne behauptete Fristtreue

Die bisherige normale Abgabe und ihre Fristen bleiben maßgeblich. Ein zusätzlicher, expliziter Wiederherstellungsweg im bestehenden Abgabe-Handler nimmt verspätete Arbeiten für bereits serverseitig gestartete, tokenauthentifizierte Versuche entgegen. Er öffnet keine Prüfung und verlängert keine Bearbeitungszeit. Normale Web-Clients erhalten ohne expliziten Wiederherstellungsaufruf keine geänderte Abgaberegel.

Vorgeschlagene Grenze für diesen Wiederherstellungsweg: höchstens sieben Tage nach dem serverseitig belegten Start. Diese Grenze umfasst typische Unterrichts- und Wochenendausfälle, ist aber keine Zusage für beliebig lange Offline-Zeiten. Jenseits dieser Grenze bleibt der unbestätigte Stand lokal erhalten; eine weitere Annahme erfordert eine ausdrücklich betreute Entscheidung.

Eine verspätet eingegangene Arbeit erhält eine klare Kennzeichnung zur Lehrkraft-Prüfung und keine ungeprüfte, endgültige Note. Serverseitiger Empfang, ursprüngliche Deadline, Rundenbezug, Verspätung und clientgemeldeter Freeze-/Wiederherstellungsgrund bleiben unterscheidbar. Ein Client kann seinen lokalen Zeitpunkt manipulieren; deshalb wird eine späte Arbeit nicht allein aufgrund dieser Angabe als pünktlich behandelt.

Token, Versuch, Aufgabenantworten und Größen werden unverändert streng geprüft. Nur der zu diesem Versuch gespeicherte private Aufgabenschlüssel darf verwendet werden. Ein zwischenzeitlicher neuer Durchlauf darf den alten Stand nicht dem neuen Durchlauf zuschreiben. Harte Löschung oder rechtlich gesperrte Daten werden durch den Wiederherstellungsweg nicht wieder angelegt. Ergebnis-/Lösungsfreigaben bleiben gesperrt, bis die dafür autorisierte Freigabe tatsächlich vorliegt.

Die Lehrkraft muss den Wiederherstellungsgrund in der normalen Abgabenoberfläche sehen können. Ihre Entscheidung über die Bewertung wird separat von der technischen Empfangsbestätigung dokumentiert. Der Schüler erhält auch bei einer nur zur Prüfung angenommenen Arbeit eine eindeutige Empfangsbestätigung, keine erfundene Note.

## Offene fachliche Entscheidung über die Gerätesperre

**Empfehlung für die erste Umsetzung:** AAC bleibt bis zum bestätigten Serverempfang aktiv. Damit bleibt die bisherige Sicherheitsregel erhalten. Der Nachteil ist ausdrücklich: Bei fehlendem WLAN kann das iPad länger gesperrt bleiben.

Die Alternative ist eine Freigabe nach nachgewiesener lokaler Speicherung und spätere Übertragung. Das wäre eine andere Sicherheitsregel und erfordert einen geschützten, mehrere Versuche tragenden Ausgangspuffer, klare Gerätezuordnung und zusätzliche Prüfungen für gemeinsam genutzte iPads. Ein Hinweis „lokal gesichert“ wäre dabei keine Bestätigung der Lehrkraft-Zustellung.

Diese Entscheidung ist dem Nutzer als kurze Auswahlfrage vorgelegt und noch nicht beantwortet. Keine der beiden Regeln wird still umgestellt. Für dauerhafte Fehler oder nicht wiederherstellbare Verbindung braucht der reguläre Schulbetrieb außerdem einen ausdrücklich autorisierten betreuten Freigabeweg. Solange dessen Bedienung und Berechtigung nicht festgelegt und geprüft sind, wird keine unbeaufsichtigte breite Klassenverwendung als vollständig abgenommen bezeichnet.

## Statistiken

Unterscheiden: Dauer laut Server, clientgemeldete Bearbeitung/Freeze, Übertragungsverzögerung, Wiederholungen, Empfang, Prüfbedarf und spätere Lehrkraft-Entscheidung. Eine um 15 Minuten verspätete Übertragung bedeutet nicht automatisch 15 zusätzliche Minuten Bearbeitung. Aufgaben-IDs und Zustandskennzahlen können erfasst werden; Antworttext, Name und Token gehören nicht in Analyseereignisse.

Ein Statistikfehler darf weder lokales Speichern noch eigentliche Abgabe oder AAC-Freigabe verzögern. Die noch offene Cloud-IAM-Freigabe der neuen Statistikfunktion ist ein separater Vorgang.

## Verbindliche Abnahmeszenarien

| Fall | Erwartung |
| --- | --- |
| WLAN fällt während der Bearbeitung aus | Lokal bestätigte Antworten und Frist bleiben erhalten; kein Ersatzversuch |
| Früh abgeben ohne WLAN | Ein dauerhaft eingefrorener Stand; eindeutiger Hinweis auf ausstehende Übertragung |
| Zeitende ohne WLAN | Keine weitere Bearbeitung; letzter gesicherter Stand bleibt erhalten |
| WLAN erst nach 2, 10 oder 60 Minuten zurück | Gleicher Stand genau einmal angenommen; Fristüberschreitung korrekt zur Prüfung markiert |
| Server speichert, Antwortpaket geht verloren | Belegprüfung findet die bestehende Abgabe; keine Doppelzählung, kein Überschreiben |
| HTTP 503/HTML, 429 oder Timeout | Begrenzte Wiederholung, Antworten unverändert; kein roher Parserfehler als endgültiges Abgabeergebnis |
| Ungültiger Token oder HTTP 403 | Keine Freigabe aufgrund erfundener Bestätigung; verständlicher dauerhafter Fehler |
| App-/WebView-Abbruch vor oder nach Freeze | Gesicherte Revision/Zuordnung wiederhergestellt; keine neue Zeit, keine wieder editierbare eingefrorene Arbeit |
| Speicher voll oder Keychain nicht verfügbar | Kein falscher Sicherungshaken; Fehler erkennbar und keine stille Löschung |
| Prozess stirbt zwischen Dateischreib-/Löschschritten | Weder fremde Antworten noch Verlust des einzigen unbestätigten Versuchszugangs |
| Neue Runde wurde inzwischen gestartet | Alte Arbeit ausschließlich beim alten Versuch; kein Übertragen in die neue Runde |
| Test wurde hart gelöscht oder rechtlich gesperrt | Kein Wiederanlegen über Recovery; lokaler Stand bleibt für betreutes Vorgehen geschützt |
| Recovery nach sieben Tagen | Keine behauptete automatische Annahme; verständlicher Hinweis und kein Löschen des lokalen Stands |
| Wiederholte identische / geänderte Sendung | Erste akzeptierte Arbeit bleibt verbindlich; geänderte Nutzlast überschreibt sie nicht |

Prüfebenen: reine Zustandstests, echter Native-Store mit Fehler-/Abbruchfällen, native Coordinator-/WebKit-Integration mit unterbrochenem Transport, Assessment-Functions im Emulator samt Berechtigungen und zuletzt physischer AAC-Test auf iPad. Emulator-/Simulator-Erfolg beweist keine reale Apple-Sperre oder tatsächliche WLAN-Störung am Gerät.

## Reihenfolge nach Designfreigabe

1. Fehlerfälle als reproduzierbare Tests festhalten und das lokale Speicher-/Freeze-/Retry-Verhalten korrigieren.
2. Den kanonischen Backend-Stand isoliert integrieren; Wiederherstellungsannahme und Lehrkraft-Kennzeichnung gemeinsam implementieren. Keine alte Functions-Codebasis über gc39 bereitstellen.
3. Ganze Abgabekette im Emulator und in Staging mit ausschließlich fiktiven Daten prüfen. Production bleibt unverändert.
4. Neuen TestFlight-Build mit vollständigen bisherigen Gates liefern und die realen WLAN-/AAC-Tests protokollieren.
5. Erst danach Production-Umgebungsentscheidung, finaler Store-Build und Einreichung anhand des App-Store-Vorbereitungspakets.

Aktueller Stand: Ursachen und Bestand untersucht, App-Store-Unterlagen vorbereitet. Keine Offline-Produktänderung, keine Änderung an Abgabefristen, keine neue App-Veröffentlichung und keine Production-Umschaltung ausgeführt.
