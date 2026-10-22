# GC-ADAPTIVE-PRACTICE-01 – Mathe/Deutsch-Testausbau

Nutzerfreigabe21.10.: vereinbarter Umfang aus spec2026-10-21 auf getrennter Testseite umsetzen. Basis App4f8b792; keine Schul-/Productionfreigabe. Vorhandene Investorenvorschau auf8769 bleibt erhalten.

## Veröffentlichter Teststand

- 464aus18vorhandenenLehrplanquellen abgeleitete Lernziele; 284Textzugänge,180Medienpfade ausdrücklich noch offen. Keine didaktische Vollfreigabe.
- Private Eigenprofile über vorhandene verifizierte FirebaseAuthUID. Test-Lehrkraftkonto dient als eigenes Testlernprofil; kein vorgetäuschter Classroom-Schülercodeadapter, keine Namen-/Geräteverknüpfung.
- Echte bestehende OpenAI-Provideranbindung; native strukturierte Generation plus separate fachliche Prüfung. Antworten werden KI-geprüft, Zahlenformate zusätzlich exakt. Keine statischen Ersatzaufgaben bei Ausfall.
- Unterstützte Proben von unabhängigen getrennt; Mindestregel10verschiedene unabhängige Proben,8richtig, mindestens2Familien/2Einheiten und zwei richtige anspruchsvollere Proben (Level>=2), jüngsteunabhängigeProbe nichtfalsch. Behalten bleibt offen, zeitversetzteProbe empfohlen.
- Fehler→kleinereMikroschritte1/2/3→Lehrkraft. Hilfe→Originalaufgabe→neueleichteunabhängigeProbe. Keine Pflichtwartezeit.
- Ereignisreservierung vor Modellaufruf, Revision-/Eigentümerprüfung, wiederholbare EreignisID mit gespeicherter öffentlicher Antwort. KI-Abbruch verändert bestätigten Stand nicht.
- Ablage ausschließlich AdminSDK unter users/{uid}/aiRuntime/learningBrain; jeThema/Ereignis Unterdokument, maximal6Sessions. Bestehende Kontolöschung recursiveDelete(aiRuntime) schließt Lernprofil mit ein. Browserzugriff überCallables, keine privaten Schlüssel imClient.
- Unabhängige Review korrigierte sichereEinstufung nachunterstütztemTreffer/wiederholterFehlprobe, Endlosschleife amOriginalrückweg, großeFirestoreDokumente und Kontolöschanschluss.

## Nachweise

Node22.23.3: 313 Functions-Tests bestanden/0skip; 28 UI-Tests bestanden. ScopedESLint ohneBefund.18Quellenhashes/105Lernbereiche/132Unterbereiche geprüft. Die Cloud-Nachweise folgen unten.

## Echte Testnachweise und Veröffentlichung

Test-URL: https://gradecrew-staging-2026.web.app/lerngehirn/

- Alle 12 Fach/Jahrgang-Einstiege tatsächlich KI-generiert und separat KI-geprüft. Dies bestätigt die Erreichbarkeit der Einstiege, keine Vollvalidierung aller 464 Ziele.
- Mathe: richtige selbstständige Erweiterung führt zur Probe mit selbst zu erschließendem Faktor. Ereigniswiederholung liefert denselben gespeicherten Zustand; veraltete Revision wird abgelehnt.
- Wiederholte Fehler: ursprüngliche Bruchaufgabe → einzelne Multiplikation → einfachere Auswahl → Addition als kleinster Baustein → vollständiges Beispiel und freundlicher Lehrkrafthinweis. Tatsächliche falsche Auswahloptionen verwendet.
- Deutsch: eigene plausible Begründung akzeptiert. Ein dabei gefundener Schwierigkeitsrückgang wurde korrigiert; frischer KI-Test zeigt Erkennen einer Behauptung/Begründung → selbst einen passenden Begründungssatz schreiben.
- Zwei getrennte synthetische Auth-Konten: fremde Sitzung, direkte private Datenzugriffe und frei mitgelieferte Identität abgewiesen; ohne Anmeldung kein Zugriff.
- Chrome: Anmeldung des eigenen Testkontos, falsche Antwort, automatische Teilrechnungshilfe und Rückkehr zur sichtbaren Originalaufgabe tatsächlich bedient. Der eingebettete Browser hatte auch auf der unveränderten alten Vorschau keine Klickereignisse ausgelöst; daher dort keine erfolgreiche Bedienprüfung behauptet.
- Hosting: 167 bestehende Dateien erhalten; alle 174 veröffentlichten Dateien per HTTP gegen SHA geprüft. UI-Quellstand d8e1c2b77209fe14a4737c05fa11292f25c497a4 (lokales Äquivalent 099c494). Root-Releasequelle bleibt 0de530730b78c25115f937ad224aab88ee22b650, Erweiterung separat belegt.

Backend-Quellstand: ecb87d77c66709679765606835439f779fc125a9, lokales Äquivalent 79253c75c369c2827ea4b27bf09b3a996cfcd7ea; gleicher Tree 7b2f217b57e9db4affe9b8548e55cddc0fffc614. PR262 bleibt Draft, Integration in Appbasis steht aus. Keine Schul- oder Productionveröffentlichung.

## Versuchshistorie und verbleibende Grenzen

Gezielte Testdeploys 1–6 korrigierten vorweggenommene Tipps, rückwirkende Aufgabenablehnung bei der Antwortbewertung, sichtbare alte Hilfebilder, Reparatur eines fachlich abgelehnten Entwurfs und tatsächlichen Schwierigkeitsanstieg. Die negative Prüfung wird niemals zur Freigabe umgedeutet. Maximal ein neuer überarbeiteter Entwurf; bleibt er unsicher, stoppt der Schritt ohne Fortschrittsverlust.

Beim vollständigen Rückweg scheiterte die Generierung einer neuen Aufgabe an nicht maschinenlesbaren numerischen KI-Schlüsseln. Deploy7 ergänzt sichere reine Darstellungsnormalisierung und konkretes privates Korrekturfeedback. Erste Sandboxveröffentlichung scheiterte am Netzwerkzugriff, anschließend gezielter autorisierter Testdeploy erfolgreich. Die unabhängige Review fand gemischte Unicode-Brüche als Wertänderungsrisiko. Deploy8 lehnt diese und zusammenklebende gemischte Zahlen gezielt ab; keine Auswertung freier Rechenausdrücke. Regressionen decken dies ab. Der neue echte Rückweg bestand: 2/3×2 falsch → 2·2 korrekt → Original4/6 korrekt → neue selbstständige Probe1/4 aufNenner12. Gespeicherter Stand: 3unabhängigeProben,1richtig,1unterstützt; keine sichereBeherrschung. Der Rückweg lief überDeploy7, die abschließende FormatabsicherungDeploy8 ist vollständig veröffentlicht. Reiner Diagramm-/Lernwirkungsnachweis daraus nicht ableitbar.

180 Medienziele (106 visuell, 18 Hören, 56 Sprechen) bleiben ausdrücklich gesperrt, bis geeignete Eingaben und Prüfungen vorhanden sind. Inhalte sind aus vorhandenen Quellen abgeleitet, die amtlichen Volltexte hatten selbst den Status inhaltliche Prüfung offen. Keine didaktische Vollfreigabe oder Wirksamkeitsbehauptung. Classroom-Schülercodeadapter bleibt offen; derzeit verifizierte eigene Auth-Profile. Keine fremden Buch-/EdukiOriginale kopiert. Bestehender pädagogischer Profilpool wird passend gefiltert als Leitlinie verwendet; fehlende Treffer werden nicht als Materialabdeckung ausgegeben. Schul-Live/Legacyprojekte unangetastet.

Abschlussbeleg: bestehende40Cloudfunktionen bytegleich imMetadatenvergleich; vier eigene neueLerngehirn-Funktionen. Weitere16neueFunktionen gehören zum parallel arbeitenden visual255-Vorhaben, nicht zu diesemAuftrag. Keine fremdenFunktionen gelöscht oder geändert. ScopedReview des letztenSchlüsselfixes ohne weitereP1; rational() entfernt beiSchülereingaben weiterLeerzeichen (bestehendeParsergrenze, separat nachzuarbeiten).
