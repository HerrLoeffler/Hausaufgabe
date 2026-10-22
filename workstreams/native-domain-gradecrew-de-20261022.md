# GC-DOMAIN-01 / GC-IOS-02 — Native Apps auf gradecrew.de

Stand: 22.10.2026. Ausführender Native-Fachchat: 01a10c75-8912-7a12-98f0-c9e78064aa2c. Domain-Fachchat: 01a15f06-837c-73b3-93fa-0d07a8104d3a. Martins dortigen direkten Auftrag gelesen: gradecrew.de als neue Live-Adresse, Apps abstimmen, alte Links und Konten weiter nutzbar. Bestehende Task-, Versuchs- und Budgethistorie fortgeführt. Angefordertes bzw. tatsächliches Runtime-Modell unbekannt; kein Modellwechsel.

## Aktueller Stand

Produktänderung in PR289 normal integriert: **24c0f856384f037ebe156e20dc20a03ae10c4cf8** auf feature/native-live-staging-20261018. Geprüfter Kandidat c85deddc408382f5b72aafdce0f7c33e917a11c8, Baum fcece5158ec034edba5ea28134bcdcb2c0558096. Mergebaum exakt gleich. Basis b9edcd6e765b6fe5479e18a50ac4a23fd41793e8 erhält Secure1.0(1171) und Teacher0.2.0(50).

Die vorhandenen automatischen Releaseketten laufen auf genau diesem Merge:

- Secure: **39851773269**, beim Start pending.
- Teacher: **39851773260**, beim Start queued.

Noch kein neuer Upload, keine Appleverarbeitung und keine neue physische Geräteabnahme behauptet. Nächster Schritt: diese beiden Läufe beobachten; nach Erfolg Appleverarbeitung, bestehende Testergruppen und gespeicherte Testhinweise nach Neuladen prüfen. Keine parallelen Starts oder blinden Wiederholungen.

## Produktumfang und Grenzen

Teacher verwendet gradecrew.de als öffentliche Live-Standardadresse. Eine exakte zusätzliche Hostliste erhält www.gradecrew.de und hausaufgabe-staging.web.app für Navigation; keine Wildcards. Native Bridge bleibt auf Hauptframe und den ausgewählten HTTPS-Origin begrenzt. Navigationserlaubnis gewährt keine Berechtigung für eine Bridge auf einem anderen Origin.

Secure trennt öffentliche Webadresse von unveränderter Projekt-ID/API-Adresse. Die Vorschau erzeugt gradecrew.de-Links und akzeptiert die bisherigen Schuladressen. Nativer Prüfungsrenderer, API und Abgabeprotokoll bleiben unverändert. Der Rechtsleser-Fallback verwendet den öffentlichen Host seiner Buildumgebung. Support-, Datenschutz- und Marketinglinks der Store-Quelldatei zeigen auf gradecrew.de; deren übrige historische Metadaten sind kein aktueller Vollstatus.

Erhalten bleiben Firebase-Projekt, Functions- und Authhost, Preference-Keys, Keychain-Dienste, Queue-/Workdirectory-IDs, AAC, Zeitlimit, Antworten und Receipt-Bedingungen. Die Test-App bleibt ausschließlich auf gradecrew-staging-2026. Keine Web-, Functions-, Rules- oder Hostingdateien geändert. Keine Datenmigration, App-Review-Einreichung oder Vertragsänderung.

Alte installierte Apps und alte Links bleiben nutzbar. Konten und Tests bleiben dieselben; Browser-/WebView-Sitzungen sind je Origin getrennt. Auf der neuen Adresse kann eine erneute Anmeldung nötig sein. Das ist keine Kontenmigration und kein Verlust des alten Kontos.

## Tatsächliche Prüfungen

- Neuer Foundation-Routingtest scheiterte vor der Änderung am erwarteten gradecrew.de-Host; Rotbeleg /private/tmp/gc-native-domain-red.log. Danach beide kompilierten Live-/Stagingvarianten bestanden, einschließlich erlaubter Legacy-/WWW-Navigation und ablehnender Fremdprojekt-, Lookalike-, HTTP-, Port- und Credentialfälle. Bridge bleibt same-origin.
- 16 Python-Prüfskripte, 67 Node-Tests und 28 Swift-Tests bestanden. Teacher-Release- und SecureLive-Simulatorbuilds erfolgreich. Beide Gerätefamilien bleiben erhalten; Teacher ab iOS16, Secure ab iOS17.
- Layoutsource-Guard bestätigte 36/36 gepinnte Webdateien. Das ist kein physischer Login-/Gerätebeleg.
- Unabhängiger read-only Reviewer native_domain_review22 fand im Produktdiff f40db10 und in der separaten CI-Zeile 51be8d2 keine konkreten P0–P2-Probleme. Der Reviewer führte keine Vollbuilds, Signierung, Netzdienste oder Gerätetests aus.
- Exakter Premerge-CI-Lauf **39848507858** auf c85deddc: completed/success. Native-check erfolgreich. Phone und Tablet jeweils **114 native + 204 Webfälle, 0 issues, Xcode exit0**; je117 Fixture-/Detector-Tests bestanden.

Der bestehende Native-PR-Workflow hatte nur den historischen shared-design-Zielbranch. Der aktuelle Native-Releasebranch wurde additiv ergänzt; Jobs, Berechtigungen und Pfadfilter unverändert. So gelten die vorhandenen Prüfungen auch vor der aktuellen Native-Integration.

Erhaltene Diagnosehistorie: erster Development-Status-Aufruf aus falschem /tmp-Skriptort fehlgeschlagen, zweiter im Checkout erfolgreich. Zunächst fehlte lokales jsdom; vorhandene gepinnte Abhängigkeit nur im eigenen Checkout verknüpft, alle Tests erneut bestanden und Symlink anschließend entfernt. SwiftPM/Iconrasterisierung zuerst durch OS-Sandbox blockiert, regulär genehmigte Ausführung außerhalb der Sandbox erfolgreich. Keine Umgehung von Apple-Signierung/AAC. Shellpush mangels Git-Anmeldung nicht möglich; regulären GitHub-Connector verwendet und Baumgleichheit bestätigt.

Vor Umsetzung main-Einstieg/AGENTS/CHAT_CONTRACT und Assurance-Rollen gelesen. Frischer main f1e030ca, Development Status39843476057 success sowie lokaler Status22.10.20:18UTC geprüft. Keine konkurrierenden Native-PRs in der gelesenen Liste. Alte Registry-/Branchwarnungen nicht als neue Aufgaben übernommen.

## Apple-Links tatsächlich gespeichert

Nach Martins direkter Antwort „hab mich angemeldet“ bestehende Apple-Sitzung verwendet. In beiden vorhandenen App-Einträgen Secure6817526711 und Teacher6817547234 gespeichert und nach Neuladen bestätigt:

- Support: https://gradecrew.de/support.html
- Marketing: https://gradecrew.de/
- Datenschutz: https://gradecrew.de/datenschutz.html

Lokale Belege: outputs/native-domain-20261022/apple-privacy-domain.jpg und apple-teacher-privacy-domain.jpg. Keine Datentypkategorien, Altersangaben, Verträge, Buildzuordnung oder App-Review-Einreichung geändert. Teacher-Storeentwurf ansonsten noch weitgehend leer; keine vollständige Teacher-Storevorbereitung behauptet. Secure-Storeentwurf weiterhin mit1141, TestFlight1171 separat.

Apple-Developer-Supportportal zeigt die bestehende Anfrage als registriert, aber keine inhaltliche Antwort. E-Mail-Postfach nicht geprüft. Privaten Fallidentifikator nicht neu ins öffentliche Repo übernommen. Händlerhinweis wird weiterhin angezeigt; keine Händlerfreigabe aus Domainwechsel abgeleitet.

## Assurance und Webübergabe

Betroffener Umfang: SEC04/06/07/14/17 für Host-, Bridge-, Auth- und Persistenzgrenzen; PRIV07/17/20 für unveränderten Datenpfad und transparente Kontensitzungen. Begrenzte Code-/Review-/Testnachweise oben. Signierung/Upload und physische Geräteabnahme dieses neuen Kandidaten noch offen. Neue Inhalte, Tracking und Bezahlung außerhalb dieses URLdiffs; keine pauschale Sicherheits- oder Rechtsfreigabe.

Webowner: PR282 integriert als750212e7a38df4d0bbce833d2ae46b3f8f8b2b68 nach CI39848742312success und ReviewPASS. Mainstatus PR283 integriert alscb1b0e284e97f072db058b7705cdb70c45943a3a;42STATE-/61Registryeinträge erhalten. Main kanonisch gradecrew.de, alte Origin als alternate_url; gleicher Hostinginhalt ab6fcc9d mit173Assets. Beide Domains CERT_ACTIVE. Webowner bestätigt additive Authdomains, synthetischen Login/Reload/Logout, identische UID bei alter/neuer Origin und tatsächliches QR-Decoding. Das sind Webownerbelege, keine physischen Native-Gerätetests. Mainstatus nicht parallel überschrieben; Domainowner sammelt abschließende Nativebelege.
