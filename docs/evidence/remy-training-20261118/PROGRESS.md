# GC-EXTENDED-QUESTION-TYPES-01 · Dreisatz-Erprobung

Auftrag 18.11.2026. Bestehender Fachchat und isolierter Checkout feature/remy-mehrfeld30-20261109. Grundlage 94935ae, letzter Runtime-Nachweis dfaf687/PR419. Dokumentations-PR418 auf 6a007b6. Development Status 44335140578 erfolgreich. Verantwortlicher Chat-Link unbekannt.

Scope. Unabhängiger Rechenprüfer, Dreisatz aus freiem Wunsch, erste 60 echte Aufgaben/Formatentscheidungen, vorhandene Testvorschau. Allgemeiner, versionierter Fundus in der bestehenden Test-Firestore-Datenbank. Vorschlag 5 USD Gesamtobergrenze für die 60er-Kalibrierung, inklusive KI-Prüfungen und Reparaturen. User hat den beschriebenen Pilot beauftragt. Keine aktiven Providerläufe aus diesem Auftrag vorgefunden.

Task 1 läuft. Fallmanifest und unabhängiger Rechenprüfer.
Task 2 offen. Serverseitige Ablage, Idempotenz und Budget.
Task 3 offen. Bedienbare freie Wünsche und Erprobungsstapel.
Task 4 offen. 60 echte Aufgaben, Reparaturen und Belege.

Ruling. Dieser Auftrag umfasst die ersten 60 und den Einstieg des gespeicherten Plans. Die 240/1.200er-Serien und Transferarme bleiben spätere Etappen, da Martin ausdrücklich die ersten 60 beauftragt hat.
Ruling. Bestehenden isolierten Checkout und PR419 weiterverwenden, ein schreibender Fachchat. Keine neue parallele Runtime.
Requested Modellwahl für komplexe Implementierung Sol/medium nach Projektregeln. Tatsächliche Runtime-Modellkennung und Aufwand unknown. Kein aktiver Modellwechsel vorgenommen.

Relevante Kontrollen. SEC Eigentumsprüfung, private Lösungsschlüssel und feste Kostenreservierung; PRIV fiktive Aufgaben und freiwillige Lehrkraftkommentare, kein Schülerimport. Nachweise folgen mit den tatsächlichen Tests.

Nächster Schritt. Tests für Direkt-/Umkehrbeziehung, freie Auswahl und Gegenfälle vor Implementierung anlegen.

Task 1 complete. 50 arithmetische Referenzen plus zehn Eignungsgegenfälle, unabhängiger rationaler Prüfer und vorhandener Dreisatz-Builder. Sechs erste Tests grün, Zwischenstand 8d8df11 lokal, 6b0cdd7 auf PR419.
Task 2/3 implementiert. Allgemeine Collections taskLearningRecipes, taskLearningRuns mit Fällen, Versuchen, Providerbelegen und Lehrkrafturteilen, taskLearningExamples für wiederverwendbare Kandidaten. Standard-Firestore (default) in eur3 am 18.11.2026 per CLI bestätigt. Daten ausschließlich über den vorhandenen erlaubten Testlehrkraft-Callable. Keine neuen Client-Firestore-Rechte.
16 neue Tests grün, einschließlich Budgetreservierung, unbekanntem Providerstatus, Wiederholung, Fremdzugriff und freiem Wunsch in der echten Oberflächenlogik. 30 bisherige Tests vor der letzten UI-Ergänzung grün, Gesamtlauf folgt.
Ruling. Erstserie synchron in zwei dauerhaft gespeicherten Providerphasen je Fall statt neuer Queue-Infrastruktur. Der Aufrufer verarbeitet höchstens zwei unabhängige Fälle gleichzeitig; eine abgebrochene Verbindung erzeugt keinen neuen bezahlten Dispatch. Damit bleibt der Pilot klein. Umfangreiche Hintergrundserien bleiben eine spätere Etappe.
Ruling. Der exakte Zwischenwert ist standardmäßig eins. Bei nicht endlicher Dezimalzahl sucht der Prüfer einen kleinen exakten Zwischenwert und macht ihn im Auftrag verbindlich. Fälle ohne unterstützten exakten Weg werden gesperrt, nicht still gerundet.
Nächster Schritt. Unabhängiger Review, exakter Testdeploy und erste zwei echte Erprobungen, dann dieselbe reservierte 60er-Serie fortsetzen.

Unabhängiger Review des gesamten Implementierungsstands durch separaten Astra-Reviewer durchgeführt, ohne Providerstarts oder Schreibaktionen. Befunde behoben und Regressionen rot→grün geprüft. Parallele Anfragen verändern keinen fremden laufenden Status; finale Updates vergleichen Versuch und Ausgangsstatus transaktional. Kostenpflichtige Schritte und Reparaturen nur durch Eigentümer. Rückmeldungen je Reviewer speichern und ausschließlich dessen eigene bestätigte Präferenzen abrufen. Leere Serien liefern eine leere Ansicht. Regulär verworfene Fälle stoppen den übrigen Kalibrierlauf nicht. Freie Rechenpfeile akzeptieren gleichwertige Multiplikation/Division; Auswahl und Faktor behalten unabhängige Teilpunkte.

Finale lokale Suite 48/48 grün. Änderung der Bewertungslogik gilt ausschließlich für Aufgaben mit privater relation-v1-Policy, alte Aufgabenfingerabdrücke und alte Bewertung bleiben erhalten. Exakte Prompts, Providerantworten und Usage werden im privaten Aufrufbeleg gespeichert.

Nächster Schritt. Diese exakte Quelle ausschließlich als remyMehrfeld30Review im Testprojekt gradecrew-staging-2026 und Hostingkanal remy-mehrfeld30 veröffentlichen, dann zwei echte Fälle im bestehenden 5-USD-Limit prüfen.

Erster Testdeploy erfolgreich. Lokale Quelle 9a9c554, Remote da1d24d/PR419. Ausschließlich remyMehrfeld30Review im Testprojekt und bestehender Hostingkanal remy-mehrfeld30. Neue 60er-Serie wird mit fester ID dreisatz60-20261118-v1 angelegt, keine Wiederholung alter bezahlter Aufträge. Erste Ausführung direct-01/direct-02 gestartet; Belege werden fortlaufend in status.json und latest-<Fall>.json gesichert.

Zusätzliche Regression. Bei vielen ungeprüften Kandidaten dürfen bestätigte Lehrkraftbeispiele nicht hinter dem Suchlimit verschwinden. Fehler mit 40 Kandidaten reproduziert, Abfrage vor dem Limit auf den konkreten Reviewer eingeschränkt. Unbestätigte freie Wünsche bleiben auch im Browser zur Statusprüfung erhalten. Diese zwei Änderungen sind noch lokal und werden vor Abschluss im gleichen isolierten Kanal bereitgestellt.

Echter Lauf hat Prüferfehler offengelegt. direct-04/direct-05 und ähnliche freie Pfeile wurden wegen einer unvollständigen Tabellenprojektion abgelehnt. Zusätzlich lieferte der Prüfer vereinzelt einen numerischen Wert mit Einheit. Serienaufrufer gezielt angehalten, bereits gestartete Serveraufrufe durften abschließen. Versuchshistorie erhalten.
Ruling. Sichtbare Aufgabe bleibt unverändert. Der unabhängige Prüfer bekommt eine genaue Beschreibung der tatsächlich gerenderten drei Zahlenzeilen und vier Pfeile, einschließlich des gemeinsamen freien Rechenfelds. Antwortformat ausdrücklich numerisch ohne Einheit. Explizite, idempotente Neuprüfung derselben Fassung nach dokumentierter Prüferkorrektur, höchstens zwei zusätzliche Prüfungen, ohne erneute Inhaltserzeugung und weiterhin im bestehenden Budget. Alte Providerbelege und Urteile bleiben erhalten.
Projection-Regressionsfall rot→grün, zusätzliche Neuprüfungs-/Idempotenz-/Archivprüfung grün. Gesamtlauf 51 Tests folgt im jeweiligen Log. Nächster Schritt ist korrigierter Testdeploy und Fortsetzung derselben Serie.

60er-Durchlauf vollständig, vor zweiter Fachkorrektur 57 ready und 3 rejected, 0 offene Reservierungen, 0,272191 USD nach Tokenpreissnapshot. Zwei nichtnumerische Gegenfälle wählten zutreffend other, wurden aber am falschen Ziel einer vollständig erzeugten Fachaufgabe geprüft. UI kennzeichnet sie jetzt ausdrücklich als Eignungsproben. Der Blindprüfer beurteilt dabei die Formatauswahl zum ursprünglichen Lernziel; es wird keine vollständig erzeugte Grammatik-/Quellenaufgabe behauptet.
Ein echter Programmfehler war die Voraussetzung beim Zusammenhang Druckrate/Zeit. Bei festem Dokument ist die Rate variabel, das Produkt bleibt konstant. Die frühere pauschale Forderung gleicher Rate war zu streng. Rechnerregression rot→grün, unterschiedliche Raten bei fester Gesamtmenge zulässig. Für Helfer-/Maschinenanzahl muss die gleiche Einzelleistung weiterhin im Sachverhalt belegt sein und wird im unabhängigen Textprüfer kontrolliert.
Ruling. Die zehn Gegenfälle werden als Eignungsproben sichtbar, 50 Fälle sind echte interaktive Dreisatzaufgaben. Das ist genau der im Pilot gewünschte Test von passend/nicht passend. Vollständige neue nichtnumerische Fachaufgaben sind ein anderer Erzeugungspfad. Bei technischer Reparatur darf ein vollständiger gespeicherter Generatorentwurf erneut aufgebaut werden, ohne bezahlte Neuerzeugung. Vorige Fehlurteile und Generatorantworten bleiben erhalten.
52 lokale Tests grün. Nächster Schritt ist korrigierter Testdeploy, drei Neuprüfungen derselben gespeicherten Entwürfe, echte Serverauswertung und Browserabnahme.

Die erste Serie steht auf 60 ready, keine offenen Reservierungen, rechnerisch 0,284971 USD. 165 tatsächliche Provideraufrufe, davon 79 Erzeugungen und 86 Prüfungen. Davon sind 19 Erzeugungen Nachbesserungen. Neun Fälle erhielten nach belegten Prüferkorrekturen eine zusätzliche Prüfung. Ein verräterischer Satz beim Quellengegenfall wurde ausdrücklich redaktionell gestrichen; Original und Änderung separat atomar gespeichert, danach erneute unabhängige Prüfung. Das ist kein rein autonomer Erzeugungsnachweis.
Echte Serverprüfung 60 Karten mit voller/leerer/teilweise falscher Antwort, insgesamt 180 Auswertungsaufrufe und 150 Punkte. Direkter Clientzugriff auf neue DB-Collections verweigert. Alle 60 Karten im echten Browser mit synthetischem Konto bedient und voll ausgewertet. Desktop 1280, Tablet 820 und Handy 360 ohne Seitenüberlauf, Felder erreichbar, Reload erhält Position. Keine manuellen Lehrerurteile durch Browserautomation erzeugt.

Zusätzlicher freier Wunsch über die reale Oberfläche meldete korrekt einen Konflikt mit „ohne Hilfen“, weil der Builder weiterhin den Zwischenweg über eins vorgab. Derselbe gespeicherte Wunsch bleibt erhalten. Korrektur bietet einen echten selbst gewählten positiven Zwischenwert mit exakter Bewertung; Zahlen und vier freie Rechenpfeile werden aus der gewählten Zwischenzeile unabhängig geprüft. Referenzweg bleibt nur als ausdrücklich möglicher Beispielweg im Lehrkraftbericht. Bestehende 60 Aufgaben bleiben unverändert.
Ruling. Der freie Zwischenweg verwendet endliche Dezimalzahlen. Brüche oder notwendige Rundungen benötigen später einen eigenen Bewertungsvertrag. Eine ungültige Zwischenzeile vergibt keine Punkte für diese Zeile, unabhängige korrekte Felder bleiben bewertbar. Automatische Korrekturen in der freien Oberfläche sind auf zwei begrenzt und werden stabil wiederaufgenommen.
54 lokale Tests grün. Nächster Schritt korrigierter Testdeploy und Wiederaufnahme desselben freien Wunsches, anschließend zweiter unbekannter Wunsch mit Grundpreis.
