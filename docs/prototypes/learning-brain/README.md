# Lerngehirn mit echter KI – lokale Vorschau

GC-ADAPTIVE-PRACTICE-01, autorisierter Webprototyp vom 20.10.2026. Keine Integration oder Veröffentlichung der Schulversion.

## Starten

Im vorliegenden Verzeichnis `python3 server.py` starten und http://127.0.0.1:8769/preview.html öffnen. `index.html` und `preview.html` verwenden dieselben editierbaren Module. Die KI benötigt den lokalen Proxy; direktes Öffnen als Datei oder ein einfacher statischer Server reicht dafür nicht.

Für diesen Arbeitsplatz wurde auf Martins ausdrücklichen Auftrag ein eigenes gewöhnliches Lehrkraftkonto im getrennten Projekt `gradecrew-staging-2026` angelegt. Keine Anmeldung durch Martin nötig. Die Einrichtung `python3 server.py --setup-account` legt nur bei fehlender lokaler Kontodatei ein Konto an und verwendet sonst dasselbe Konto weiter. Normale Firebase-Registrierung und eigenes Benutzerprofil, keine Adminberechtigung, Rollenlockerung oder Schulzugang.

Zufällige Zugangsdaten liegen mit Dateimodus600 außerhalb des Checkouts und Webroots unter dem Elternordner des Checkouts in `.private/learning-brain/account.json`. Nicht committen, weitergeben oder über HTTP ausliefern. Der Browser erhält nur ein HttpOnly/SameSite-Strict-Sitzungscookie. Der Proxy bindet ausschließlich127.0.0.1:8769 und prüft Host, Origin, Sitzungskennung, Anfragegröße und statische Dateiliste. Keine Provider-Schlüssel im Frontend. Vorhandene serverseitige Rollen und Quoten bleiben unverändert. Zusätzlich maximal80 lokale KI-Anfragen für diesen Prototyplauf; Zähler bleibt über Browserrefresh und Serverneustart erhalten. Ein Aufgabenaufruf kann im bestehenden Backend mehrere interne Modellversuche auslösen;80 Requests sind kein Token-/Eurobudget. Kein automatischer Reset.

## Kurzer KI-Lerndialog mit Antwortmöglichkeit

Jeder Hilfeschritt enthält jetzt eine echte, kurz formulierte KI-Erklärung und direkt eine beantwortbare kleine Frage. Erst die geprüfte Antwort gibt den nächsten Schritt frei. Zwei falsche Antworten im Hilfeschritt gehen samt konkreter Frage an die KI zurück. Es gibt keine zusätzliche unbeantwortbare Frage im Erklärungstext. Die KI entscheidet je Schritt, ob ein Bild hilft: kein Bild, Bruchstreifen oder bei passender Anteils-/Unterteilungsfrage eine veränderbare Pizza. Interaktion ist keine Pflicht. Rechenformeln bleiben unabhängig berechnet.

Neue Aufgaben und Erklärungen erhalten einen separaten KI-Prüfdurchlauf ohne vorherigen Gesprächskontext; ein abgewiesener Entwurf erscheint nicht als freigegebene Hilfe. Beide Aufrufe verwenden denselben vorhandenen GradeCrew-Dienst, keine behauptete unabhängige Modell- oder Lehrkraftfreigabe. Ein lokaler Endpunktaufruf kann dadurch mehrere kostenpflichtige Provideraufrufe auslösen. Der erhaltene80er-Endpunktrahmen ist kein Euro-/Tokenlimit.

[Konkrete Live-Testfälle und Grenzen](LIVE-TEST.md). Historische Abschnitte unten beschreiben frühere Versionen.

## Aktuelle KI-Auswahl

Die KI entscheidet jetzt nach jeder abgegebenen Antwort anhand von Rechnung, exakter Bewertung, Hilfenutzung, jüngsten Versuchen und Materialprofil über die nächste Aktivität. Selbstständig richtig führt zu einer anspruchsvolleren Probe ohne automatische Grundlagenlektion oder Lesesperre. Ein Treffer bleibt ein Zwischenstand. Fehler führen zu einer gezielten Probe oder Unterstützung; wiederholte Fehler verlangen Hilfe oder Pause. Ungültige KI-Entscheidungen werden sichtbar abgewiesen; kein heimlicher lokaler Ersatz.

Die gesamte Rechnung und abgegebene Antwort bleiben während der Hilfe sichtbar. Die KI wählt den Hilfefokus; die mathematischen Bilder und Rechenschritte werden unabhängig aus der tatsächlichen Aufgabe berechnet. Zehn Sekunden Lesepause gelten für Fehlerhilfe, nicht für eine freiwillige Nachbesprechung nach richtiger Antwort.

[Entscheidungsvertrag und Grenzen](DIDACTIC-CONTRACT.md). Ältere Durchlaufbeschreibungen unten sind historische Nachweise; die hier beschriebene Auswahl ersetzt ihre starre lokale Folge.

## Ausprobieren

- Lerngehirn: vier große Fächer, Profil in der Mitte. Mathe öffnet sieben LehrplanPLUS-Themen; Bruchzahlen ist der ausgearbeitete Übungsweg.
- Lehrkraft-Vorschau: Dauer1–90 Minuten, Standard20. Countdown beginnt mit der ersten gültigen Aufgabe. Zeitablauf beendet die Einheit ohne Bewertung des Könnens. Die Einstellung simuliert einen Auftrag; noch keine Klassenzuweisung oder Synchronisierung.
- Neue Aufgaben über den bestehenden GradeCrew-Callable `regenerateQuestion`. Geführte Rechenschritte und SVG-Bilder werden exakt aus dieser Aufgabe berechnet. Optionale kurze Rückfrage über `crewAssistant`/Emmi.
- KI-Zahlendaten werden begrenzt und unabhängig nachgerechnet. Brüche mit Zähler/Nenner eingeben; gleichwertige ungekürzte Antworten zählen. Optionale Erweiterungsschritte und freie Rückfrage an die KI.
- Fehler: sofortige schrittweise Material-/Rechenhilfe, danach Prüfung eines Teilschritts. Richtige selbstständige Antworten führen weiter. Unterstützte Antworten gelten nicht als selbstständiger Beleg. Die transparente lokale Lernlogik unterscheidet Anteilebild, gleichnamige Addition, Erweitern, gemeinsamen Nenner, Addition und eigene Rechenmauer. Nach Fehlern zuerst Regel/Bild und geführter Schritt, danach leichtere Probe. Noch keine validierte umfassende Diagnose.
- Lerngehirn zeigt Zwischenstände, Nachweise erst ab8/10 verschiedenen unabhängigen Aufgaben je Teilkompetenz, Übungsbedarf und Empfehlung; ein späterer Fehler nach Erfolg löst „erneut prüfen“ aus. Keine Beherrschungsquote. Lernbelege nur im Browser-Arbeitsspeicher; Refresh löscht sie. KI-Anfragen laufen über GradeCrew an dessen Provider und unterliegen dessen bestehender Verarbeitung. Nur synthetische Übungsangaben verwenden.

## Materialien und Grenzen

Der kanonische53er-Pool enthält noch kein Bruchzahlenprofil. Für diese Vorschau wurden jetzt drei tatsächlich vorhandene Bruchmaterialien fachlich und visuell gesichtet. Sechs eigene abstrakte Prototypprofile in `fraction-profiles.json` führen passende Lernziele, Muster, Qualitätsregeln und Inhalts-Hash/PDF-Seite. Der lokale Proxy reicht genau das passende Profil an Aufgaben- und Erklärungsgenerierung weiter. Eigene berechnete Streifen und Erweiterungsformeln ersetzen kopierte Quellgrafiken. Keine Original-PDFs oder Bilder hochgeladen, keine Bücher-Vollauswertung behauptet. [Materialbasis und Ausbauweg](MATERIAL-BASIS.md).

Ein richtiger Treffer ist nur ein Zwischenstand. Pro Teilkompetenz werden die letzten zehn verschiedenen Aufgaben ohne Hilfe ausgewertet; mindestens acht müssen richtig sein. Umgekehrte Addition und bloß geänderte Zähler bei gleichem Nennerpaar zählen nicht als neue Probe. Zwei verschiedene richtige Versuche erlauben eine nächste Probe, begründen jedoch keinen Kompetenznachweis. Ein neuer Fehler stoppt die grüne Anzeige bis zur Rückprüfung. Diese Mindestregel ist eine beauftragte Prototypheuristik, kein Nachweis langfristiger Beherrschung; Wiederholung mit echtem zeitlichen Abstand steht aus.

Nach Fehler: ausgearbeitete Regel/Bild → kleine geführte Frage → neue einfachere Aufgabe. Bleibt die geführte Frage nach zwei Versuchen unklar, kann ein einfacher Neueinstieg folgen; kein Unterstützungs-Erfolg wird dabei behauptet. Hilfen sind kein unabhängiger Beleg. Fachliche Qualität und Wirkung weiterhin durch Lehrkräfte/Kindertests zu prüfen. Lernbelege bleiben nur im Arbeitsspeicher.

## Nachweise

`node --test *.test.mjs`:35/35 bestanden (10 historische Demo-,14 aktuelle Modell-,5 Visual- und6 Schrittfolgenfälle). `python3 -m unittest test_server.py`:4/4 ohne Netzwerk/echte Credentials bestanden. Fälle: exakte Rechnung1/2+4/8, gültige/ungültige KI-Aufgaben, äquivalente Brüche, Erweiterungsschritte, selbstständige/unterstützte Belege, erneute Unsicherheit, Empfehlungen und Zeitgrenze. JS-Syntax und Python-Quellsyntax geprüft.

Echter Browserdurchlauf am20.10.2026: KI erzeugt1/8+1/8; absichtliche Antwort2/16 löst reale Pizza-Erklärung aus; nächster KI-Teilschritt2/3 und1/6, Antwort6 selbstständig richtig. Anschließend zeigt das Lerngehirn „1 gezeigt ·1 in Übung“, den gemeinsamen Nenner als Beleg und Addition als Übungsbedarf. Countdown20Minuten sichtbar. Zwei frühere direkte Emmi-Requests belegen Erklärung, aber der erste Versuch konnte keine strukturierten Aufgabendaten liefern; danach den vorhandenen Aufgabengenerator verwendet. Insgesamt5 Provider-Endpunktaufrufe bis zu diesem Nachweis, tatsächliche Tokenkosten unbekannt. Kein pädagogischer Wirksamkeits- oder Productionnachweis.

Frühere Beispielversion desktop und390px geprüft; neue KI-Version desktop und390×844 geprüft, kein horizontaler Überlauf, Override zurückgesetzt. Physischer iPad-/Handytest und vollständige Accessibility-Abnahme offen. Eigene SVG-Interpretation der Bildreferenz, Systemschrift und bestehende Design-Tokens als Grundlage; keine externen Bild-/Fontdienste. Lokaler Server bleibt für Martins Prüfung geöffnet.

## Aktueller Fehler-/Materialdurchlauf

Am20.10.2026 neue KI-Aufgabe3/8+1/4, absichtliche Antwort4/12. Sofort eigene farbige Streifen/Erweiterung, geführte Frage und konkrete KI-Erklärung. Nach geführter Antwort2 neue einfachere KI-Aufgabe2/5+3/5; richtige Antwort5/5 ergibt nur „1/1 richtig, Ziel8/10“, ausdrücklich keinen grünen Nachweis. Der vorherige Browsernachweis mit grüner Einzelantwort ist historisch und wurde durch diese Änderung korrigiert. Erweitern zeigt denselben Faktor innerhalb von Zähler und Nenner; Roh-LaTex im KI-Text wird für die Anzeige lesbar umgewandelt.

Der bisherige Verbrauch von19Aufrufen aus Martins Test wurde erhalten. Für die ausdrücklich gewünschte längere Nachweislogik beträgt die neue lokale Obergrenze80Gesamtrequests, kein Reset und kein automatischer weiterer Ausbau. Server läuft als eigener Prozess weiter auf8769. Tatsächliche Providerkosten unbekannt.

## Schrittweise Lernhilfe statt Textwand

Die aktuelle Hilfe ersetzt die frühere gleichzeitige Darstellung aller Streifen, Rechenschritte und freien KI-Erklärung. Jede Ansicht enthält nur einen kurzen Lernschritt. Folge je nach Aufgabe: erster Anteil → zweiter Anteil → gleicher Faktor oben/unten → neue Unterteilung → Zusammenzählen → konkrete kleine Frage. Jede Vorwärtsaktion hat10Sekunden Lesepause; Back/Beenden möglich, kein automatischer Wechsel. Eine Pause beweist kein Lesen/Verstehen. Die geführte Frage bezieht sich auf die tatsächliche Rechnung; kein konstantes1+1 oder Faktor2.

Mathematische Regeln und genaue SVG-Bilder entstehen aus unabhängig validierten Aufgabenzahlen und Materialprofilen. Dicke Linien bewahren die alte Teilung, feine Linien zeigen neue Teile. Die Ganzengröße bleibt gleich. Neue Aufgaben weiter echte GradeCrew-KI; freie Zusatzfrage nur optional zum aktuellen Schritt, maximale Anzeige240Zeichen. Überlange Antworten werden nicht als Textwand gezeigt. Kein automatischer Provideraufruf nach falscher Antwort.

Expliziter Bruchvergleich bei1/4+1/5:9/20,18/40 und45/100 korrekt;4/40 und4/4 falsch. Der vorhandene exakte Grader akzeptiert gleichwertige Brüche bereits, keine Lösung auf einen einzelnen Nenner festgelegt.35/35JS-Tests einschließlich neuer Schritt-/Timer-/Gleichwertigkeitsfälle,4/4Proxytests.
