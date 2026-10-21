# GC-ADAPTIVE-PRACTICE-01 – Mathe/Deutsch-Testausbau

Nutzerfreigabe21.10.: vereinbarter Umfang aus spec2026-10-21 auf getrennter Testseite umsetzen. Basis App4f8b792; keine Schul-/Productionfreigabe. Vorhandene Investorenvorschau auf8769 bleibt erhalten.

## Stand vor echtem Cloudtest

- 464aus18vorhandenenLehrplanquellen abgeleitete Lernziele; 284Textzugänge,180Medienpfade ausdrücklich noch offen. Keine didaktische Vollfreigabe.
- Private Eigenprofile über vorhandene verifizierte FirebaseAuthUID. Test-Lehrkraftkonto dient als eigenes Testlernprofil; kein vorgetäuschter Classroom-Schülercodeadapter, keine Namen-/Geräteverknüpfung.
- Echte bestehende OpenAI-Provideranbindung; native strukturierte Generation plus separate fachliche Prüfung. Antworten werden KI-geprüft, Zahlenformate zusätzlich exakt. Keine statischen Ersatzaufgaben bei Ausfall.
- Unterstützte Proben von unabhängigen getrennt; Mindestregel10verschiedene unabhängige Proben,8richtig, mindestens2Familien/2Einheiten, jüngsteunabhängigeProbe nichtfalsch. Behalten bleibt offen, zeitversetzteProbe empfohlen.
- Fehler→kleinereMikroschritte1/2/3→Lehrkraft. Hilfe→Originalaufgabe→neueleichteunabhängigeProbe. Keine Pflichtwartezeit.
- Ereignisreservierung vor Modellaufruf, Revision-/Eigentümerprüfung, wiederholbare EreignisID mit gespeicherter öffentlicher Antwort. KI-Abbruch verändert bestätigten Stand nicht.
- Ablage ausschließlich AdminSDK unter users/{uid}/aiRuntime/learningBrain; jeThema/Ereignis Unterdokument, maximal6Sessions. Bestehende Kontolöschung recursiveDelete(aiRuntime) schließt Lernprofil mit ein. Browserzugriff überCallables, keine privaten Schlüssel imClient.
- Unabhängige Review korrigierte sichereEinstufung nachunterstütztemTreffer/wiederholterFehlprobe, Endlosschleife amOriginalrückweg, großeFirestoreDokumente und Kontolöschanschluss.

## Nachweise

Node22.23.3:305FunctionsTests bestanden/0skip;17UI-Modell-/RendererTests bestanden. ScopedESLint ohneBefund.18Quellenhashes/105Lernbereiche/132Unterbereiche geprüft. Weitere Cloud-/Browser-/Deploynachweise erst nach tatsächlicher Durchführung ergänzen.

## OffeneAbnahme

Echte12Fach-Jahrgang-Einstiege und zusammenhängende KI-Fehler-/Erfolgswege, zweiIdentitäten, Cloudzugriffsregeln, Browserbedienung und gezielter Testrollout stehen noch aus. Hör-/Sprech-/Handschrift-/Konstruktionswege dürfen nicht als vollständig umgesetzt gelten. Keine fremden Buch- oder EdukiOriginale übernommen; Rechte-/Materialfreigabe weiterhin getrennt.
