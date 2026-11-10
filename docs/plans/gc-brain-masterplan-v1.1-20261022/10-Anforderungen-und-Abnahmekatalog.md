# Band 10 - Anforderungen und Abnahmekatalog

## 10.1 Verwendung dieses Katalogs

Die folgenden Fälle sind geplante Abnahmen. Sie wurden in dieser Dokumentationsarbeit nicht als Produktsoftware ausgeführt. Jeder spätere Lauf nennt Quellcommit, Buildhash, Host-/Runtimeversion, Datenprofil, tatsächlichen Prüfer und Ergebnis. Ein synthetischer Fall prüft seinen Ablauf, kein Produktionsdatenrecht.

Ein Fall endet mit PASS, FAIL, BLOCKED oder NOT_RUN. Blocker nennt die konkrete fehlende Voraussetzung. Es gibt kein pauschales „alles grün“, wenn benötigte Fälle nicht gelaufen sind. Ein notwendiger fehlender Hostport wird als BLOCKED geführt.

## 10.2 Anforderungszuordnung

| Anforderung | Inhalt | Primäres Paket / Abnahme |
| --- | --- | --- |
| FZ-REQ01 | neun Firmenzuständigkeiten und Projektachse | WP02/16, AT01-04 |
| FZ-REQ02 | Führungslage und nächste Schritte mit Quellen | WP08/16, AT05/47 |
| FZ-REQ03 | zugängliche Themen-/Chat-/Quelleninventur | WP02/08, AT04-06 |
| FZ-REQ04 | bestehende Original-IDs und Versuchshistorie | WP06/12, AT16/43/45 |
| FZ-REQ05 | Zielgraph, Kriterien und belegter Fortschritt | WP07, AT07-14 |
| FZ-REQ06 | persistenter Eingang und Fallakte | WP10, AT15-17/26 |
| FZ-REQ07 | Auftrag ohne Nutzer-Chatwahl zuerst zur Zentrale | WP11, AT20-22/30 |
| FZ-REQ08 | echtes begrenztes Fachhandeln | WP12, AT22-24 |
| FZ-REQ09 | gebundene Frage, Freigabe und Fortsetzung | WP13, AT25-27 |
| FZ-REQ10 | Ergebnishash, Review und Annahme | WP14, AT28/29/34 |
| FZ-REQ11 | unveränderlicher Brief und Revalidierung | WP09/12, AT18/19/28 |
| FZ-REQ12 | gemeinsamer Wissenskern ohne Neueinweisung | WP09, AT05/06/19 |
| FZ-REQ13 | vorhandene Hostanbindung zuerst, kein Loginzwang | WP03-05, AT20/21/31/32 |
| FZ-REQ14 | nachvollziehbare Automationsregeln | WP17/18, AT35-40 |
| FZ-REQ15 | Budget-/Versuchskontrolle ohne Reset | WP12, AT24/43 |
| FZ-REQ16 | Rollen und Datenzugriff vor Offenlegung | WP20, AT17/19/23/44 |
| FZ-REQ17 | Restore ohne Doppelstart oder Datenwiederbelebung | WP19, AT41/42/44 |
| FZ-REQ18 | verbundene verständliche UI auf Zielgeräten | WP15/16, AT31/33/47 |
| FZ-REQ19 | betriebliche Übergabe und Quellenstand | WP22, AT46 |
| FZ-REQ20 | getrennte Lieferstufen und Livegrenze | WP21/22, AT48 |
| FZ-REQ21 | Aufgabenentwicklung und bestehende Fachstränge | WP23/27, AT49/51/56/71 |
| FZ-REQ22 | belegtes Grün, Regression und Wiederfreigabe | WP24, AT49-60 |
| FZ-REQ23 | zentraler Eingang und Fallbearbeitung | WP25/27, AT61-65/69/70 |
| FZ-REQ24 | ein qualifizierter Kanal und sichere Kommunikation | WP26, AT61/62/66-70/72 |

## 10.3 Firmenmodell und Quellen

### FZ-AT01 - Unternehmensüberblick

Eingang: neun konfigurierte Verantwortungsbereiche, mehrere Ziele und mindestens ein unzugeordneter Owner. Aktion: Heute und Firmennetz öffnen.

Erwartung: alle Bereiche erreichbar, fehlende Zuständigkeit sichtbar, keine erfundenen aktiven Mitarbeiter/Chats. Dieselben Tasks erscheinen mehrfach als Sicht, bleiben aber dieselbe Identität. Beleg: Screenshot, Quell-/Projektionsrevision und Datensatzvergleich.

### FZ-AT02 - Bereichsübergreifender Fall

Eingang: konkrete Vertragsfrage mit Kunden-, Rechts-, Datenschutz- und Technikbeitrag. Aktion: Beiträge zuweisen und Status nacheinander aktualisieren.

Erwartung: eine führende Task, nachvollziehbare Beiträge, keine Kopien als konkurrierende Abschlusswahrheit. Finale Entscheidung nur durch berechtigte Rolle. Alle Ansichten zeigen denselben Zustand.

### FZ-AT03 - Projekt und Bereich

Eingang: Nativeprojekt mit Technik-, Produkt- und Kundenbeitrag. Aktion: nach Projekt und danach nach Bereich filtern.

Erwartung: dieselben IDs/Belege, unterschiedliche fachliche Sicht. Eine Projektänderung verschiebt keine Firmenabteilung und verändert keine Berechtigung allein durch Filterwahl.

### FZ-AT04 - Vier heutige Themen

Eingang: Internationalisierung, Klassen/ASV, adaptives Lernen und erweiterte Aufgabentypen mit Original-IDs und Quellen.

Erwartung: Unteraufgaben, Entscheidungen, offene Punkte, zurückgestellte Ideen und Beziehungen erscheinen. Eine lokale Implementation kann neben einem älteren Mainstatus dargestellt werden; kein unbelegter Gesamtfortschritt.

### FZ-AT05 - Veralteter Beleg

Eingang: alter Chat meldet „fertig“, aktuelle Git-/CIquelle zeigt fehlende Integration. Aktion: Chefbrief erstellen und Thema öffnen.

Erwartung: genaue Stufen, datierter alter Claim und konkrete fehlende Evidenz. Keine glattgebügelte Erfolgsmeldung.

### FZ-AT06 - Unzugänglicher Quellenbereich

Eingang: begrenzte Chatliste oder nicht abrufbarer großer Turn. Aktion: Inventur und Suchfrage.

Erwartung: Abdeckungslücke sichtbar, keine Vollständigkeitsbehauptung und kein erfundener Inhalt. Eine erfolgreiche Teilinventur bleibt als Teilinventur nützlich.

## 10.4 Zielnetz und Fortschritt

### FZ-AT07 - Parent50/0

Zwei gleich gewichtete direkte Teilziele zeigen belegte50Prozent und0Prozent. Erwartung: Parent25Prozent. Eine subjektive Einschätzung99Prozent eines Kindes ändert die Rechnung nicht.

### FZ-AT08 - Fehlende Grundlage

Ziel ohne gültige Gewichtsbasis oder mit notwendigem Child ohne Grundlage. Erwartung: derivedPercent=null, verständlicher fehlender Grund, kein leerer Erfolg und kein NaN.

### FZ-AT09 - Gewichtvalidierung

Null, negativ, unendlich, nichtnumerisch oder widersprüchlich doppelt gesetztes Gewicht. Erwartung: validierter Konflikt/Fehler vor Speicherung; bisherige gültige Basis erhalten.

### FZ-AT10 - Pflichtgate und Rundung

Ratio0,996 bei offenem menschlichem Gate. Erwartung: Anzeige höchstens99Prozent und Status nicht erreicht. Nach gültiger Annahme aller Pflichtkriterien kann erreicht gesetzt werden.

### FZ-AT11 - Zyklen und aggregierende Parents

Versuch A→B→A oder zweiter aggregierender Parent desselben Childs. Erwartung: Reject mit verständlichem Grund. Nichtaggregierende Querverweise bleiben zulässig.

### FZ-AT12 - Doppelzählung

Dasselbe Artefakt/Kriterium wird auf zwei Pfaden desselben aggregierenden Ziels verknüpft. Erwartung: keine doppelte Anrechnung. Beteiligte Ansichten können denselben Beleg zeigen, ohne den Fortschritt zu verdoppeln.

### FZ-AT13 - Belegentzug

Ein angenommener Testbeleg wird durch eine konkrete Regression ungültig. Erwartung: Kind/Parent/Heute/Chefbrief invalidiert, Auswirkung und Grund sichtbar, Historie erhalten.

### FZ-AT14 - Scopeänderung

ZielrevisionR1 hat bestätigte Basis; R2 ergänzt Anforderungen. Erwartung: alte Basis historisch lesbar, neue Restarbeit und Revision sichtbar, keine rückwirkend umgeschriebene alte Abnahme.

## 10.5 Request, Routing und Runtime

### FZ-AT15 - Atomare Speicherung

Gezielter Fehler zwischen Message, Briefsnapshot und Outbox. Erwartung: vollständiger Rollback; kein halber Auftrag. Ein erneuter identischer Submit mit gleichem Key erzeugt maximal einen vollständigen Request.

### FZ-AT16 - Doppelklick und zwei Tabs

Gleicher Request zweimal, anschließend gleicher Key mit anderer Payload. Erwartung: zuerst identische Request-/Taskreferenz; danach Konflikt. Kein zweiter Worker oder Budgetreset.

### FZ-AT17 - Fremder Actor

Actor aus falschem Organisations-/Rolekontext versucht Request, Akte oder Artefakt zu lesen/ändern. Erwartung: Zugriff vor Datenweitergabe abgewiesen, keine Metadatenleckage und keine Teilmutation.

### FZ-AT18 - D1-Revisionsrennen

Request auf GoalR1/KonzeptC1 queued. Taskrevision bleibt gleich; Ziel oder Konzept wechselt. Erwartung: admitDispatch erkennt Unterschied im vollständigen Revisionsset, needs_revalidation, kein Start.

### FZ-AT19 - Rechteentzug und Kontext

ACL wird zwischen Briefbildung und Dispatch widerrufen. Erwartung: keine neue Offenlegung. Bereits laufende Arbeit behält historische Bindung, erhält echten Abbruch-/Revalidierungsprozess. Geschützte Quelle verschwindet aus künftiger Suche.

### FZ-AT20 - Auftrag aus anderem Hostchat

Firmenansicht im berechtigten Nichtzentralenchat öffnen und Auftrag absenden. Erwartung: ohne manuelle Chatwahl gespeicherter Request, tatsächliche Weiterleitung zur registrierten Hauptzentrale und gebundener Rückkanal. Falls Hostfähigkeit fehlt: BLOCKED, kein erfundener PASS.

### FZ-AT21 - Fehlende Capability

Host unterstützt UI, aber keinen qualifizierten Dispatch oder Rückkanal. Erwartung: kein Produktstart; gespeicherte Anfrage mit konkreter Fähigkeitslücke. Keine neue Login-/APIaktivierung als stiller Ersatz.

### FZ-AT22 - Tatsächlicher Fachstart

Zentralenroute und Fachowner bestätigt. Erwartung: reale Remoteidentität, zugelassener Toolschritt und Diagnoseartefakt. Hostnachrichten-ACK allein darf noch nicht running setzen.

### FZ-AT23 - Rollen-/Toolnegativfälle

Koordinator versucht Produkttool; Worker versucht fremdes Verzeichnis oder gesperrte Daten. Erwartung: Durchsetzung im Runtime-/Toolservice, nicht nur Modellversprechen. Keine Artefakt-/Datenweitergabe außerhalb des Scopes.

### FZ-AT24 - Unbekannter Start-ACK

Nach persistentem Intent bricht Verbindung vor eindeutigem ACK ab. Erwartung: unknown, Reservierung erhalten, kein Retry mit neuem Key. Erst Remoteabgleich kann den Zustand schließen.

### FZ-AT25 - Gebundene Approval

Approval für ExecutionA/AktionshashX wird für ExecutionB oder HashY eingereicht; zusätzlich verspäteter Doppelklick. Erwartung: fremde/geänderte/veraltete Freigabe abgewiesen. Genau eine gültige Auflösung.

### FZ-AT26 - Neustart bei Rückfrage

Eigene Runtime/Broker mit offener PendingQuestion kontrolliert stoppen und neu anbinden. Erwartung: gleicher Task/Request/Brief, tatsächliche offene Runtimefrage und Fortsetzung desselben Vorgangs. Kein neuer Ersatzturn als verschwiegene Wiederaufnahme.

### FZ-AT27 - Cancel unbekannt

Abbruchwunsch angenommen, tatsächlicher Remote-Stop nicht bestätigt. Erwartung: cancel_requested/unknown bleibt sichtbar. Keine falsche abgeschlossene Stoppmeldung und kein sofortiger Neuanlauf.

### FZ-AT28 - Altes Ergebnis an neuer Basis

R1-Ergebnis trifft nach Zielumzuordnung/R2 ein. Erwartung: CAS verhindert automatische Anrechnung. Explizite Übernahme gegen neue Kriterien nur mit neuem Mapping-/Entscheidungsbeleg; alte Execution unverändert.

### FZ-AT29 - Reviewkandidat ändert sich

Reviewer prüft KandidatK1, Implementierer liefertK2. Erwartung: alte Freigabe nicht als K2-Abnahme verwendet. Relevante erneute Prüfung und exakt gebundene Belege.

### FZ-AT30 - Zentralenwechsel

Zwei Koordinatoren wollen denselben Request claimen; danach bestätigter Rollenwechsel. Erwartung: ein gültiger Claim/Epoch, kein Doppelrouting; laufende Facharbeit und Budgetgeschichte bleiben identisch.

## 10.6 UI, Datenfeeds und Automation

### FZ-AT31 - Hostloser Browser

Lokale statische Vorschau ohne MCPbridge. Erwartung: sichtbarer Nichtverbundenstatus; keine Stubfunktion als Beleg. Entwurf möglich, Fachstart nicht simuliert.

### FZ-AT32 - iPad und Mac-off

iPadclient ohne erreichbaren Server oder ausgeschalteter Mac. Erwartung: ehrliche Verfügbarkeitsgrenze, kein vermeintlicher localhostzugriff auf den Mac. Alte Snapshotdaten mit Zeitpunkt, keine neue externe Wirkung.

### FZ-AT33 - Texte und Bedienung

HTML-/Scripttext, Unicode, sehr langer Titel, schmaler Dialog, Tastatur und Fokuswechsel. Erwartung: Text bleibt Text; kein Horizontalverlust wichtiger Aktionen; Fokus/Status verständlich. Reale Zielbrowser dokumentieren.

### FZ-AT34 - Artefaktpfad

Dateiname mit ../, fremdem Root, Symlink oder falschem Typ. Erwartung: ablehnen; keine Dateiüberschreibung oder fremde Leseoperation. Erlaubtes Artefakt bekommt Hash/Größe und berechtigten Download.

### FZ-AT35 - Unfreigegebene Analyticsquelle

Feed erreichbar, aber Zweck-/Opt-in-/Herkunftsprofil fehlt. Erwartung: Datenfeed nicht aktiviert; bestehender Analyticsowner wird mit konkretem Blocker geführt. Keine zweite Erfassung.

### FZ-AT36 - BugOps rote Klasse

Incident betrifft Auth, Datenverlust oder Prüfungsbewertung. Erwartung: keine automatische Guardianintegration. Diagnose innerhalb erlaubtem Lesescope und gezielte menschliche/fachliche Entscheidung.

### FZ-AT37 - Guardianlieferung

Neue Datei nicht im tatsächlichen Buildmanifest oder CI auf anderem SHA. Erwartung: kein Annahme-/Stagingclaim; bestehende Guardiangates bleiben vollständig.

### FZ-AT38 - Triggerdoppel und Schleife

Dasselbe externe Event zweimal plus eigenes Rückschreibevent. Erwartung: ein Run, keine kausale Endlosschleife, deduplizierter Notificationbedarf.

### FZ-AT39 - Zeitplan und Offline

Verpasster Slot, Zeitzonenwechsel und Wiederonline. Erwartung: definierte Nachhol-/Auslassregel; keine unerwartete Auftragsflut oder neue Budgetfamilie.

### FZ-AT40 - Ruhige Benachrichtigung

Unveränderter Zustand über mehrere Polls/Runs. Erwartung: kein wiederholter Nutzerping. Ein neuer kritischer Blocker oder benötigte Entscheidung erzeugt genau den passenden Hinweis.

## 10.7 Recovery, Kosten und Betrieb

### FZ-AT41 - Restore nach bereits abgeschlossenem Start

Snapshot zeigt queued/attempt0. Danach realer externer Start, Abschluss, Verbrauch, Approvalauflösung, Widerruf und Löschung. Altes Backup restaurieren.

Erwartung: vor Anzeige/Dispatch gilt Recoveryepoch; alle späteren Fakten werden abgeglichen. Keine Inhaltswiederbelebung, alte Approval, Budgetrücksetzung oder Doppelstart. Nur vollständig belegter Scope wird freigegeben.

### FZ-AT42 - Zurückgerolltes oder lückenhaftes Journal

Journal stammt aus demselben alten Backup oder aktuelle Sequenz ist nicht unabhängig nachweisbar. Erwartung: Recovery bleibt gesperrt. Abwesenheit einer Zeile wird nicht als Beweis für „nichts passiert“ verwendet.

### FZ-AT43 - Unknown-Verbrauch

Provider-/Kontingentdaten fehlen nach möglichem Start. Erwartung: unknown sichtbar, Reservierung bleibt, kein automatischer Provider-/Modellwechsel und kein Kostenreset im Ersatzchat.

### FZ-AT44 - Löschung/Widerruf in Suche und Backup

Objekt löschen/widerrufen, Suchcache und alten Snapshot testen. Erwartung: kein Retrieval/Brief/Download aus alter Projektion; notwendiger technischer Tombstone ohne verbotene Payload bleibt.

### FZ-AT45 - Migration und Rollback

Alte JSONdaten mit mehreren Draftzuständen zweimal importieren. Erwartung: identische IDs/Anzahlen, running nicht als echter Start übernommen, beschädigte Quelle nicht überschrieben, getesteter Rückweg.

### FZ-AT46 - Betriebsübergabe

Neuer berechtigter Operator liest Runbook und findet offenen unknown-Request, Quellenfehler und Backup. Erwartung: ohne private Chatgeschichte richtiger nächster Schritt, keine unkontrollierte Wiederholung.

### FZ-AT47 - Menschlicher Produktdurchlauf

Martin erfasst Lage, gibt Auftrag ohne Chatwahl, beantwortet Rückfrage, prüft Ergebnis, findet alte Entscheidung und setzt nach Neustart fort. Erwartung: tatsächliche erfolgreiche Bedienung oder konkrete offene UXmängel. Ergebnis stammt von Martin, nicht vom Modell.

### FZ-AT48 - Releasewahrheit und Livegrenze

Ein Teilmodul ist ci_green, anderes noch lokal. Erwartung: kein Gesamt-V1-/Productionlabel. Vor einer späteren Veröffentlichung exakter Commit, Umgebung, Umfang, Gates, menschliche Freigabe und tatsächliche Receipts.

## 10.8 Evidenzpaket

Jeder Testlauf erzeugt ein Manifest mit Fall-ID, Kandidat, Hostversion, Daten-/Policyprofil, Start/Ende, tatsächlichen Aktionen, erwarteten/erhaltenen Ereignissen und Artefaktreferenzen. Rohlogs werden sanitisiert, relevante Auszüge mit Quellenhash referenziert.

Der Bericht enthält außerdem nicht ausgeführte Fälle mit Grund. Zusammenfassungszahlen nennen den Nenner und unterscheiden bestanden, fehlgeschlagen, blockiert und nicht gelaufen. Ein hoher Prozentwert darf einen kritischen offenen Pflichtfall nicht verdecken.

## 10.9 Abnahmen für Aufgabenqualität und zentralen Eingang

AT49-60 und AT71 gehören zum Aufgabenqualitätsumfang, AT61-70 und AT72 zum Eingangs-/Kommunikationsumfang. Nicht vorhandene spätere Module werden als NOT_RUN ausgewiesen. Der vereinbarte Lieferumfang bestimmt die Pflichtfälle; ein enger Kernpilot darf nicht als vollständige Firmen-App ausgegeben werden. Diese Revision führt keinen der folgenden Produktfälle aus.

### FZ-AT49 - Scopegebundenes Grün

Eingang/Aktion: Ein Format hat erfolgreiche CI, aber keine fachliche Prüfung. Grünannahme versuchen.

Erwartung: Abgelehnt mit fehlendem Q1/Q7; nach tatsächlich vollständiger Prüfbasis nur der benannte Modus/Clientumfang grün. Lieferstufe unverändert.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT50 - Geänderte Bewertungsgrundlage

Eingang/Aktion: Zwischen Review und Annahme ändert sich der Graderhash. Zusätzlich bei identischer Basis B und unveränderten Abhängigkeiten zwei Konkurrenzfälle in beiden serialisierten Reihenfolgen prüfen: (a) AcceptQualityDecision parallel zur Annahme eines bestätigten blockierenden Fehlers; (b) RevalidateQualityDecision parallel zu neuer Regression oder angenommener Lehrkraftkorrektur. Annahmerequests enthalten alte PASSbelege und erwartete eligibility-/Finding-/Retest-/Entscheidungsrevisionen.

Erwartung: Bei geänderter Basis scheitert CAS; needs_revalidation und betroffene Kriterien sichtbar. In (a)/(b) ändern Annahme, Entzug und Wiederfreigabe denselben Eligibilitystand atomar: Entzug zuerst verwirft alte Requests; Annahme zuerst wird durch den folgenden Entzug ungültig. Keine Wiederbelebung von Grün aus alten Belegen, keine Löschung offener bestätigter Sperren. Rot/needs_revalidation bleibt auch bei verzögerten Grünprojektionen konsistent. Wiederfreigabe erst mit aktueller Befundauflösung und passenden Retests; IDs, Historie, Versuche und Budget bleiben erhalten.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT51 - Qualifiziertes Format, fehlerhaftes Item

Eingang/Aktion: Ein grüner Rasterrenderer erhält ein Item mit widersprüchlicher Lösung.

Erwartung: Item wird zurückgewiesen; Formatfreigabe legitimiert keine falsche Aufgabe. Gemeinsamer Defekt wird separat untersucht.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT52 - Äquivalente Antworten und Grenzwerte

Eingang/Aktion: Verschiedene gültige Rastermuster, Toleranzgrenze und knapp ungültiger Wert.

Erwartung: Fachlich definierte äquivalente Antworten identisch bewertet; Grenzfälle passend zum eingefrorenen Raster.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT53 - Bestand erhalten

Eingang/Aktion: Neues Format verändert eine gemeinsame Antwortfunktion; bewährtes Altformat wird mitgeprüft.

Erwartung: Bekannte Altverträge bleiben korrekt oder konkreter Regressionsbefund blockiert betroffenen Kandidaten; keine stille Altdatenmigration.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT54 - Prüfabbruch und Wiederholungs-PASS

Eingang/Aktion: Relevanter Lauf bricht ab; nach ungeklärtem Neustart erscheint ein PASS.

Erwartung: Historie bleibt; Ursache/Abdeckung und mögliches externes Ergebnis werden geklärt. Ein späterer PASS löscht keinen kritischen Befund.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT55 - Abhängigkeitsänderung

Eingang/Aktion: Gemeinsamer Validator betrifft drei Formate; ein viertes nutzt ihn nicht.

Erwartung: Drei abhängige Entscheidungen werden revalidiert, vierte bleibt bei unverändertem Scope gültig. Keine pauschale Vollprüfung.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT56 - Grün ohne Gerätebeleg

Eingang/Aktion: Desktopprüfung bestanden, beanspruchter physischer Touchclient ungeprüft.

Erwartung: Anzeige begrenzt den qualifizierten Scope; kein behaupteter Gerätetest. Nutzer findet offene Nachprüfung ohne Technikkenntnis.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT57 - Kompletter Fehlerweg

Eingang/Aktion: Reproduzierbarer Fehler, Regression gegen alten Stand, Fix, fokussierte Nachprüfung und unabhängiger Review.

Erwartung: Eine Akte und bestehende Task mit vollständiger Geschichte; neue Qualitätsentscheidung gebunden, Deployment separat.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT58 - Begrenzte generative Prüfung

Eingang/Aktion: Ein vorab genehmigtes Stichprobenprofil erreicht Budget oder wiederholt denselben Fehler.

Erwartung: Stop und Ursachenentscheidung; keine neuen verdeckten Modellaufrufe, kein Reset. Kleine Stichprobe wird nicht als allgemeine Fehlerfreiheit ausgegeben.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT59 - Freigabeentzug während Nutzung

Eingang/Aktion: (c) Entzug nach Planung, Queue oder Admission, aber vor tatsächlicher Auswahl-/Startgrenze bei unveränderter Basis B; jede Variante einschließlich Start-/Entzugskonkurrenz prüfen. (d) Dieselbe Entzugsentscheidung betrifft eine tatsächlich bereits gestartete Prüfung mit eingefrorenem Snapshot.

Erwartung: (c) Die bestehende Aufgabenplattform prüft den aktuellen Eligibilitystand an der tatsächlichen Startgrenze und ordnet Start und Entzug atomar. Alter Admissionbeleg genügt nicht; nach Entzug vor Start revalidieren oder sperren, kein Neustart trotz Entzug. Nicht frisch prüfbare Gültigkeit sperrt den neuen Start. (d) Ein vor Entzug tatsächlich gestarteter Snapshot bleibt unverändert; verantwortliche Incidententscheidung sichtbar, keine stille Umbewertung. Autoritative Historie und rot/needs_revalidation-Projektion stimmen überein; OriginalIDs, Versuche und Reservierungen erhalten.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT60 - Erkenntnis in Fundus

Eingang/Aktion: Eine falsche Antwort löst Hypothese aus, die fachlich anders erklärt wird.

Erwartung: Keine automatische Kompetenzdiagnose/globales Prompttraining. Nur angenommene Erkenntnis mit Quelle, Scope und Regression fließt in gültige Revision.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT61 - Doppelter Eingang

Eingang/Aktion: Dasselbe Providerereignis kommt zweimal und nach verlorenem Import-ACK erneut.

Erwartung: Genau eine IngressMessage und passende Akte; Cursor erst nach dauerhaftem Commit, kein doppelter Fachstart.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT62 - Ähnlicher Inhalt verschiedener Kunden

Eingang/Aktion: Zwei Konten senden gleichen Betreff und Text; eine Weiterleitung enthält Originalzitat.

Erwartung: Keine automatische Verschmelzung allein nach Inhalt. Kanal-/Kontoscope und echte Referenzen bleiben erhalten.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT63 - Unsichere Zuordnung

Eingang/Aktion: Unbekannte Absenderidentität und zwei plausible Kundenfälle.

Erwartung: Zuordnung offen; keine Offenlegung fremder Akten und kein beliebiger Fachdispatch. Klärung mit wenigen verständlichen Optionen.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT64 - Mehrere Anliegen in einer Mail

Eingang/Aktion: Eine Nachricht betrifft Rechnung, Fehler und Datenfrage.

Erwartung: Original einmal; verknüpfte Teilvorgänge, begrenzte Rechte und ein führender Kommunikationsowner.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT65 - Externer Text als angeblicher Auftrag

Eingang/Aktion: Mail enthält Aufforderung zur Rechteänderung oder Ausführung; Anhang enthält aktiven Inhalt.

Erwartung: Quellmaterial bleibt Daten; kein Tool-/Rollen-/Versandgrant. Sichere Anzeige und begrenzte Anhangsverarbeitung.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT66 - Veraltete Versandfreigabe

Eingang/Aktion: Nach Freigabe werden Text, Anhang oder Empfänger geändert.

Erwartung: Senden mit alter Freigabe abgelehnt; aktuelle Aktion benötigt passende Bindung. Keine Nachricht versandt.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT67 - Unbekanntes Versandergebnis

Eingang/Aktion: Provider nimmt Nachricht möglicherweise an; Antwort geht verloren.

Erwartung: Unknown mit erhaltenem Startintent; Abgleich vor Wiederholung, keine zweite Sendung ohne Nachweis.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT68 - Kanalausfall und Cursorverlust

Eingang/Aktion: Verbindung verliert Rechte oder Importcursor; neuer Abgleich beginnt.

Erwartung: Letzter Stand und Abdeckungslücke sichtbar; begrenzter deduplizierter Import, kein privater Vollpostfachzugriff.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT69 - Warten, Frist und neue Nachricht

Eingang/Aktion: Fall wartet auf Kunden; im Fristprofil ist keine Pause erlaubt; später kommt neue Rückmeldung nach Abschluss.

Erwartung: Frist läuft entsprechend Profil; neue Meldung öffnet wieder oder erzeugt begründeten verknüpften Folgefall. Nichts verschwindet.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT70 - Geschlossener technischer Befund, offene Kommunikation

Eingang/Aktion: Fix ist qualifiziert, Antwort noch Entwurf; danach tatsächlicher Versand.

Erwartung: Interne Lösung, Versandbestätigung und Fallabschluss bleiben getrennt. Keine erfundene Zustellung/Kundenzufriedenheit.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT71 - Drei Fachstränge in einer Akte

Eingang/Aktion: Format-, Design- und Adaptivbeiträge treffen mit unterschiedlichen Quellenständen ein.

Erwartung: Originaltasks erhalten; ein führender Owner; widersprüchliche Fassungen nicht vermischt; nächste gemeinsame Prüfung eindeutig.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.

### FZ-AT72 - Restore nach externem Versand

Eingang/Aktion: Backup zeigt Entwurf; danach wurde gesendet und eine Nachricht gelöscht; altes Backup restaurieren.

Erwartung: D4-Sperre bis vollständigem Abgleich; keine Doppelmail und keine unberechtigte Datenwiederbelebung aus Import/Index.

Beleg: genaue Basis-/Kandidatrevision, tatsächliche Zustandsereignisse und relevante Artefakte; ausgelassene Schritte ausdrücklich offen.
