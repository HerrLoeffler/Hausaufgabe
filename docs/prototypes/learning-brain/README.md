# Lerngehirn mit echter KI – lokale Vorschau

GC-ADAPTIVE-PRACTICE-01, autorisierter Webprototyp vom 20.10.2026. Keine Integration oder Veröffentlichung der Schulversion.

## Starten

Im vorliegenden Verzeichnis `python3 server.py` starten und http://127.0.0.1:8769/preview.html öffnen. `index.html` und `preview.html` verwenden dieselben editierbaren Module. Die KI benötigt den lokalen Proxy; direktes Öffnen als Datei oder ein einfacher statischer Server reicht dafür nicht.

Für diesen Arbeitsplatz wurde auf Martins ausdrücklichen Auftrag ein eigenes gewöhnliches Lehrkraftkonto im getrennten Projekt `gradecrew-staging-2026` angelegt. Keine Anmeldung durch Martin nötig. Die Einrichtung `python3 server.py --setup-account` legt nur bei fehlender lokaler Kontodatei ein Konto an und verwendet sonst dasselbe Konto weiter. Normale Firebase-Registrierung und eigenes Benutzerprofil, keine Adminberechtigung, Rollenlockerung oder Schulzugang.

Zufällige Zugangsdaten liegen mit Dateimodus600 außerhalb des Checkouts und Webroots unter dem Elternordner des Checkouts in `.private/learning-brain/account.json`. Nicht committen, weitergeben oder über HTTP ausliefern. Der Browser erhält nur ein HttpOnly/SameSite-Strict-Sitzungscookie. Der Proxy bindet ausschließlich127.0.0.1:8769 und prüft Host, Origin, Sitzungskennung, Anfragegröße und statische Dateiliste. Keine Provider-Schlüssel im Frontend. Vorhandene serverseitige Rollen und Quoten bleiben unverändert. Zusätzlich maximal20 lokale KI-Anfragen für diesen Prototyplauf; Zähler bleibt über Browserrefresh und Serverneustart erhalten. Ein Aufgabenaufruf kann im bestehenden Backend mehrere interne Modellversuche auslösen;20 Requests sind kein Token-/Eurobudget. Kein automatischer Reset.

## Ausprobieren

- Lerngehirn: vier große Fächer, Profil in der Mitte. Mathe öffnet sieben LehrplanPLUS-Themen; Bruchzahlen ist der ausgearbeitete Übungsweg.
- Lehrkraft-Vorschau: Dauer1–90 Minuten, Standard20. Countdown beginnt mit der ersten gültigen Aufgabe. Zeitablauf beendet die Einheit ohne Bewertung des Könnens. Die Einstellung simuliert einen Auftrag; noch keine Klassenzuweisung oder Synchronisierung.
- Neue Aufgaben über den bestehenden GradeCrew-Callable `regenerateQuestion`; Erklärungen über `crewAssistant`/Emmi. Echte KI-Antworten, kein stiller Ersatz durch feste Aufgaben.
- KI-Zahlendaten werden begrenzt und unabhängig nachgerechnet. Brüche mit Zähler/Nenner eingeben; gleichwertige ungekürzte Antworten zählen. Optionale Erweiterungsschritte und freie Rückfrage an die KI.
- Fehler: konkrete KI-Erklärung, danach Prüfung eines Teilschritts. Richtige selbstständige Antworten führen weiter. Unterstützte Antworten gelten nicht als selbstständiger Beleg. Die transparente lokale Lernlogik wählt zwischen Erweitern, gemeinsamem Nenner, Addition und weiterer Addition; noch keine validierte umfassende Diagnose oder beliebige Schwierigkeitssteuerung.
- Lerngehirn zeigt selbstständige Belege, Übungsbedarf und Empfehlung; ein späterer Fehler nach Erfolg löst „erneut prüfen“ aus. Keine Beherrschungsquote. Lernbelege nur im Browser-Arbeitsspeicher; Refresh löscht sie. KI-Anfragen laufen über GradeCrew an dessen Provider und unterliegen dessen bestehender Verarbeitung. Nur synthetische Übungsangaben verwenden.

## Materialien und Grenzen

Der vorhandene didaktische Pool enthält fünf Mathematikprofile, aber kein eigenes Bruchzahlenprofil. Eduki-Pakete und Bücher werden hier noch nicht eingelesen oder als Quelle behauptet. Für den späteren Aufbau fehlen Bruchkompetenz-Zuordnung, fachliche Inhaltsprüfung und ein geklärter Materialimport. Fachliche Güte und Verständlichkeit der generierten Erklärungen sind weiterhin von Lehrkräften zu prüfen. Transfer ist derzeit eine weitere Additionsprobe; keine vollständige Sachaufgabenabdeckung. Die frühere feste Demo-Engine bleibt als historische Testgrundlage erhalten, ist nicht der reguläre Einstieg.

## Nachweise

`node --test *.test.mjs`:18/18 bestanden (10 historische Demo-,8 aktuelle Modelltests). Neue Fälle: exakte Rechnung1/2+4/8, gültige/ungültige KI-Aufgaben, äquivalente Brüche, Erweiterungsschritte, selbstständige/unterstützte Belege, erneute Unsicherheit, Empfehlungen und Zeitgrenze. JS-Syntax und Python-Quellsyntax geprüft.

Echter Browserdurchlauf am20.10.2026: KI erzeugt1/8+1/8; absichtliche Antwort2/16 löst reale Pizza-Erklärung aus; nächster KI-Teilschritt2/3 und1/6, Antwort6 selbstständig richtig. Anschließend zeigt das Lerngehirn „1 gezeigt ·1 in Übung“, den gemeinsamen Nenner als Beleg und Addition als Übungsbedarf. Countdown20Minuten sichtbar. Zwei frühere direkte Emmi-Requests belegen Erklärung, aber der erste Versuch konnte keine strukturierten Aufgabendaten liefern; danach den vorhandenen Aufgabengenerator verwendet. Insgesamt5 Provider-Endpunktaufrufe bis zu diesem Nachweis, tatsächliche Tokenkosten unbekannt. Kein pädagogischer Wirksamkeits- oder Productionnachweis.

Frühere Beispielversion desktop und390px geprüft; neue KI-Version desktop geprüft. Physischer iPad-/Handytest und vollständige Accessibility-Abnahme offen. Eigene SVG-Interpretation der Bildreferenz, Systemschrift und bestehende Design-Tokens als Grundlage; keine externen Bild-/Fontdienste. Lokaler Server bleibt für Martins Prüfung geöffnet.
