# GradeCrew: Messplan V1

Quelle: Nutzer-Dokument „WICHTIG GameCrew ChatGPT“, 01.10.2026. Produktanforderungen, keine bereits erhobenen Zahlen. Alle Zahlenbeispiele des Dokuments sind Beispiele.

## Prioritäten

1. Zuverlässiger Unterricht: Beitritt, Abgabe, Wiederverbindung, blockierende Fehler.
2. Lehreraufwand: aktive Vorbereitungszeit bis Veröffentlichung sowie gesondert bis zum tatsächlichen Einsatz.
3. KI-Qualität: akzeptiert, bearbeitet, neu erzeugt, gelöscht und tatsächlich genutzt; technisch bestandener Validator allein bedeutet keine fachliche Qualität.
4. Spiele: Abschluss, Fortschritt, Hilfen, aktive Zeit und Abbruch gemeinsam betrachten.
5. Erst später: Wiederverwendung/Kohorten, Kosten je Schule, Experimente und Anomalie-Erkennung.

Kein einzelner undurchsichtiger AI Quality Score. Zunächst die getrennten Raten samt Nenner, Stichprobengröße, Modell-/Promptversion und Erhebungszeitraum zeigen. Mehr richtige Antworten sind kein Nachweis eines kausalen Lernzuwachses.

## Vorhandenes weiterverwenden

Im App-Integrationsbranch vorhanden: diagnostics.mjs (begrenzte technische Breadcrumbs, kein DOM-Text/Input-Logging), admin-log-tools.mjs (Zeitraum, Status, Kategorie, Umgebung, Version, Aktion, Fehlergruppen und technische Exporte), serverseitige Diagnostics. Diese Funktionen nicht nochmals parallel bauen. Operative Supportberichte können Personen-/Inhaltsbezug enthalten und sind kein ungeprüfter Analytics-Datenbestand.

## Jetzt implementiert

shared/telemetry/events.mjs enthält sieben versionierte Eventtypen, strikte zulässige Felder, Wertebereiche, Umgebungs-/Commit-Zuordnung und einen begrenzten In-Memory-Puffer. Standardmäßig deaktiviert. Kein Netzwerk, keine dauerhafte Speicherung, keine DOM-Beobachtung und keine Einbindung in den Produkt-Build.

| Event | Zweck / zulässige Nutzdaten |
|---|---|
| teacher.preparation.completed | aktive Millisekunden, Bearbeitungs-/Regenerierungsanzahl |
| classroom.join.completed | Dauer, definierte Phase, Ergebnis |
| classroom.session.ended | explizites Ergebnis, erwartete Anzahl, binnen 60 s bereit |
| game.session.ended | aktive Zeit, Ergebnis, erledigte/gesamte Schritte, Hilfen |
| ai.generation.completed | Dauer, Tokenmengen, Cache, Wiederholungen, technisches Ergebnis |
| ai.question.reviewed | definierte Lehreraktion und tatsächliche Nutzung |
| system.error.occurred | begrenzter Fehlercode, Phase und Schwere |

Alle Event-Properties sind Pflichtfelder. Unbekannte Werte nicht als 0 erfinden: das Ereignis erst mit bekannten Werten erstellen oder Schema bewusst erweitern. Freitext, Antworten, Namen, E-Mails, URLs, Prompts, Rohfehler und beliebige zusätzliche Felder werden abgewiesen. Eine schemakonforme UUID kann dennoch rückverknüpfbar sein: **pseudonym bedeutet nicht anonym**.

## Kennzahlen eindeutig definieren

- Classroom Start Success: pro Runde mindestens 90 % der **vorab bekannten erwarteten Teilnehmer** binnen 60 Sekunden nach definiertem Beitrittsbeginn bereit. Erwartete Anzahl nicht nachträglich auf die tatsächlich Beigetretenen reduzieren. Unbekannter Nenner wird ausgeschlossen und separat ausgewiesen.
- metrics.mjs berechnet diese Rate aus bereits autorisierten, serverseitig ermittelten Rundenaggregaten; Duplikate zählen nicht doppelt, widersprüchliche Duplikate werden abgewiesen. Weniger als 20 Runden wird als kleine Stichprobe markiert, nicht als statistischer Signifikanztest.
- Aktive Vorbereitungs-/Spielzeit: Sichtbarkeit, Pausen und längere Untätigkeit berücksichtigen. Kalendardauer zusätzlich getrennt messen. Der Timer ist noch nicht implementiert.
- Erfolgreiche Unterrichtssession: definierter Abschluss ohne blockierenden Fehler; Abbruch, unbekanntes Ende und fehlende Events getrennt ausweisen. Fehlende Fehlermeldungen beweisen keinen Erfolg.
- Abschlussquote und Latenz immer mit Zeitraum, Umgebung, Version, Nenner und Datenabdeckung. Testdaten nicht in Unternehmenszahlen mischen.

## Vor Aktivierung erforderlich

- Zweck und Rechtsgrundlage je Datenkategorie prüfen; Aufbewahrung, Zugriffsrollen, Löschung und Auftragsverarbeiter festlegen. Noch keine rechtliche Freigabe behaupten.
- Session-IDs nur für den notwendigen Kontext verwenden, kein geräteübergreifendes Fingerprinting; Konto-/Schulwechsel muss Puffer und Kontext zurücksetzen.
- Authentifizierter Collector mit serverseitiger Validierung, Empfangszeit, Größen-/Ratenlimits und idempotenter event_id. Browserangaben sind keine vertrauenswürdige Quelle für Schulidentität, Abgaben oder Umsatz.
- KI-Modell, Prompt-/Generatorversion, Tokenverbrauch und Kosten aus vertrauenswürdigem Backend ergänzen. Kostenberechnung versionieren, keine Beträge aus Tokens schätzen ohne Preisgrundlage.
- Transportfehler dürfen Unterricht nie blockieren. Begrenzte Queue, definierte Verlust-/Retry-Strategie, Messung verworfener Events; keine unbeschränkte Offline-Sammlung.
- Datenqualität prüfen: erwartete Ereignisse, fehlende Abschlussmeldungen, Duplikate, Zeitabweichungen und unerwartete Versionswechsel.
- Erst nach instrumentiertem Testlauf Dashboard und Alarmgrenzen auf echten Daten aufbauen. Alarm-Mindeststichprobe und menschliche Prüfung statt automatischem Rollback aufgrund unsicherer Zahlen.

Kein Session Replay im MVP. Keine A/B-Tests der Bewertungslogik in laufenden Prüfungen. Feature-Konfiguration pro laufender Prüfung einfrieren. Keine Einführung mehrerer externer Analytics-Anbieter als Nebenwirkung dieses Auftrags.

## Nächste Umsetzung

GC-TELEMETRY-01: Backend-/Datenschutzvertrag und Collector.
GC-TELEMETRY-02: einen kompletten Beitritt-/Abgabeweg anbinden und Verlust/Deduplizierung testen.
GC-TELEMETRY-03: vorhandenen Adminbereich um belegbare Release-/Rundenübersicht erweitern.
Erst danach Spiele und KI systematisch anbinden. Dieses Fundament sammelt noch keine Nutzerdaten.
