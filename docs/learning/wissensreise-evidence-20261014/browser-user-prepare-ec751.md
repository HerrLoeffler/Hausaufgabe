# Echte Nutzerprüfung nach dem Wissensreise-Fix

Task GC-LEARNING-WISSENSREISE-01,14.10.2026. Ausführender unabhängiger QA-Chat wissensreise_play_qa; angefordert Sol/medium, actual/Usage unbekannt. Geprüft mit der bestehenden echten Chrome1-Nutzersitzung auf derselben Wissensreise-Preview. Kein neuer Login, Tokenzugriff, Credential, privater Rohinhalt oder Antwortschlüssel ausgegeben.

## Exakter Hostingbezug

Öffentliches release.json unabhängig per HTTP gelesen: commit **ec7512600bf6d48541cb304d746dca96b78358b5**, project hausaufgabe-staging, version2.3.1-gc39,171Dateien. Kopie live-release-ec751.json im selben QA-Ordner. Implementer-Deployreceipt meldet11aktiveLearningfunctions und unveränderte nicht ausgewählte Funktionen; dieser QA-Chat hat die Cloud-Administrationsmetadaten nicht zusätzlich geprüft. Browserverhalten stammt von der geladenen Preview, nicht von synthetischer Auth.

## Vorher → nachher

Vorherige konkrete Nutzermeldung war in QA_USER_FAILURE_20261014.md reproduziert: vorhandene Anmeldung und47eigene Testeinträge funktionierten, gewählter eigener Test hatte50Aufgaben, Prepare wurde mit einer allgemeinen40-Aufgaben/60000-Zeichen-Meldung abgelehnt. Die50 waren ausschließlich aus Dashboardmetadaten gelesen.

Nach dem Deploy:

1. Bestehenden Nutzer-Previewtab aktualisiert. Auth-/Listenreload funktioniert weiterhin:48Pickeroptionen inklusiveBitte-wählen. Vergleich in der Browserquery ergibt sameOwnSource=true; Source-ID/Titel nicht gespeichert.
2. Training vorbereiten mit genau derselben eigenen Quelle tatsächlich ausgeführt. Dies ist der vom Root unter dem Nutzer-Fixauftrag ausdrücklich autorisierte private Prepare-Schritt. Keine Generierung oder Veröffentlichung.
3. Sichtbarer Erfolg: „Deine Lernkopie ist erstellt. Prüfe die Aufgaben und Lösungsschlüssel.“
4. Metadatenergebnis: **50Quellaufgaben,46geeignet,46spielbareLernaufgaben,4ausgeschlossen**. DOM enthält46Vorschauartikel. Keine Inhalte oder Schlüssel aus diesen Artikeln gelesen oder gespeichert.
5. Aggregierte Ausschlussgründe, ohne Aufgaben-IDs: **„Medienabhängige Aufgaben brauchen einen geprüften Lernadapter.“ ×4**. Der alte40-Aufgabenfehler erschien nicht mehr.
6. Konsole error/warn=[] im beobachteten echten Prepare-Ablauf. HTTPstatus des Callables nicht direkt über die BrowserAPI ermittelt; erfolgreiche Rückgabe ist durch sichtbare private Lernkopie und Aufgabenanzahlen belegt. Keine erfundene Netzwerkstatuszahl.

## Tatsächliche Live-Einstellungen

Sichtbare Spielnavigation/Zurück, vier nummerierte Konfigurationsabschnitte eigenerTest/Übungsarten/Lernmodus/Dauer, große Auswahlkarten und eine Trainingzusammenfassung. Visuell mit den zuvor tatsächlich geprüften FastQuiz-, FehlerjagdDeutsch- und VocabRush-Einstellungen abgeglichen. Inhalte und Niveau werden weiterhin aus dem eigenen Test abgeleitet; keine feste Themenwahl oder Wettbewerbs-/Strafregeln übernommen.

Aktueller Modus guided/Geführtlernen, Dauer0/FreiesLernen,11Übungsarten. Anonymisierte Zusammenfassung: „[eigenerTest] ·50Aufgaben ·11Übungsarten ·Geführtlernen ·FreiesLernen“. Sichtbare CTAs Trainingvorbereiten und Trainingfreigeben; Trainingstart folgt nach bewusster Freigabe. Keine Freigabecheckbox gesetzt und keine neue öffentliche Lernkopie erzeugt.

Screenshot **real-settings-source50-fixed-ec751.jpg** zeigt nur Modus/Dauer und den anonymen46-von50-Vorbereitungsbeleg. Er wurde direkt über Browser-Screenshotclip aufgenommen, ohne DOMänderung und ohne Testtitel, IDs, Fragetext oder Lösungsschlüssel. Der zuvor erzeugte volle Screenshot wurde durch diesen sicheren Ausschnitt ersetzt.

## Abnahmeumfang und offene Punkte

Der konkrete Import-/Preparefehler des echten50-Aufgaben-Tests ist geschlossen; die Live-Spieleinstellungen sind belegt. Aufgerufen wurde ausschließlich die private Vorbereitung; keine Sourcebearbeitung, Abgabe, Note, bezahlte Variantengenerierung oder neue Veröffentlichung. Diese Prüfung belegt echte Auth+ownTest-Auswahl+Prepare, nicht vollständige menschliche Nutzerabnahme oder echten Generate/Publish/Play-Durchlauf. Medienadapter, reale Provider-/QCqualität und physisches iPad bleiben getrennte Belege.

Root, Implementer und unabhängiger Codeprüfer erhielten den exakten anonymisierten Erfolg sowie die4aggregiertenMediengründe. Bestehender Nutzer-Previewtab bleibt mit der privaten vorbereiteten Lernkopie offen; keine andere Sitzung übernommen oder geschlossen.

Nächster Schritt: Root meldet den behobenen50-Aufgabenfehler und die vier transparent ausgeschlossenen Medienaufgaben; echte kostenpflichtige Generierung bzw. weitere Veröffentlichung/Spielabnahme erst im konkret begrenzten Folgeauftrag prüfen.
