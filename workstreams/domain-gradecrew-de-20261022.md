# GC-DOMAIN-01 — gradecrew.de an bestehendes Schul-Live anbinden

22.10.2026. Ausführender Fachchat GradeCrew-Workstreams nach Staging (01a15f06-837c-73b3-93fa-0d07a8104d3a); Zentrale01a10df6 koordiniert. Direkte Nutzeranweisung im Zentralenchat gelesen: neue öffentliche Schul-Live-Adresse, exakte Domain nach Rückfrage **gradecrew.de**. Keine IONOS-/Server-/Datenmigration, keine neuen Tarife/Konten/Domains kaufen. Eigene Schul-Live-Domainanbindung autorisiert; kein pauschaler weiterer Produktrelease.

Task nach main-TODO/Registry und PR-Suche neu einmalig GC-DOMAIN-01 zugeordnet; keine bestehende identische Domainarbeit gefunden. Eigener Checkout /private/tmp/gc-domain-cutover-20261022, Branch feature/domain-gradecrew-de-20261022, Basis aktueller Web-/Schulrelease ab6fcc9d72aa9d401eba2ec4db31c01f7758c0f0. Kein fremder Checkout verändert. Nativeowner GC · iPhone & iPad ist aktiv mit TestFlight-/Rückkehrfix; Native-Dateien gehören ihm, nur benötigte URLanpassung benennen.

## Aktueller Stand vor externer Einrichtung

- Main START_HERE/AGENTS/STATE/TODO/Registry/Workstreams/CHAT_CONTRACT/CHAT_RECOVERY/Assurance frisch gelesen. DevelopmentStatus39785320232, Job119846927110 success, Log gelesen:26aktive Workstreams/24Überschneidungen; kein Domainworkstream. Offene WebPR271/app.js und andere Featurearbeit nicht übernehmen.
- Netcup Chrome-ProfilMartin, vorhandene angemeldete Domains-Seite: gradecrew.de mit Uhrsymbol, „unknown“ Hosting, „as soon as active“. Zeile besitzt noch keinen Verwaltungs-/DNSlink. Keine Bestellung/Vertragsannahme oder DNSmutation ausgeführt. Nicht bewiesen, ob Registrierung noch provisioniert oder eine andere Freischaltung erforderlich ist; UI allein nennt keinen konkreteren Grund.
- Öffentliche DNSprobe22.10: gradecrew.de NS/SOA/A/AAAA/MX/TXT/CAA sowie www A/AAAA/CNAME/TXT und _dmarc TXT liefern NXDOMAIN. Das beweist keine verfügbaren oder leeren Netcup-Zonen, sondern fehlende öffentliche DNSauflösung am Beobachtungszeitpunkt.
- Firebase CLI15.33.0 mit bestehender Anmeldung zugänglich. hosting:sites:list bestätigt genau projects/hausaufgabe-staging/sites/hausaufgabe-staging, defaultURL https://hausaufgabe-staging.web.app. Getrennte Tests gradecrew-staging-2026 und Legacyhausaufgabe-40294 nicht verändern.
- Hosting-CustomDomains vor Einrichtung leer. Letzter Schulrelease projects/hausaufgabe-staging/sites/hausaufgabe-staging/releases/1792617896887000, Version4641f2c63bbbb2f3, releaseTime2026-10-21T21:24:56.887Z. Öffentliches release.json: commitab6fcc9d, v2.3.1-gc45-rc1, projecthausaufgabe-staging,173manifestierte Dateien. Ausgangsmanifest/Releasebeleg lokal gesichert; vor späterem Cutover neu abgleichen. Hostingrollback wäre nur Hostingrollback, keine Datenwiederherstellung.
- Auth erlaubte Domains enthalten bisher alte Web-/Firebase-/Previewhosts, kein gradecrew.de. E-Mail/Passwort aktiv. Keine Authänderung vor verifizierter Domainkontrolle und eigenem Review.
- app.js baseStudentUrl/baseTemplateUrl erzeugen Links aus tatsächlicher window.location; daher funktioniert neue Origin grundsätzlich ohne globalen Texttausch. tools/environments.mjs hat noch alte kanonische Produktionsorigin. AuthDomain ist weiter hausaufgabe-staging.firebaseapp.com; API-/Projektkennung sind keine umzubenennenden Marketingtexte.

## Begrenzter nächster externer Schritt

Nach gesichertem Preflight ausschließlich zwei FirebaseCustomDomain-Ressourcen der bestehenden Schulsite vorbereiten: gradecrew.de zum aktuellen öffentlichen Inhalt, www.gradecrew.de mit redirectTargetgradecrew.de. Erst GET/validateOnly, dann genau einmal create bei unverändert fehlendem Eintrag, Operationname/Ergebnis zeitnah sichern. BenötigteDNSwerte ausschließlich aus tatsächlichem Firebase-Ressourcenstatus übernehmen. Keine Authallowlist-, Release-, Rules-/Functionsänderung daraus ableiten.

Aktivierungsblocker: Netcup muss die Domain/DNSzone verfügbar machen. Kein wiederholtes Polling; nächster Prüfauslöser ist Netcup-Aktivstatus bzw. dessen normale Bestätigung. Danach originale Zone inventarisieren/sichern, nur tatsächlich benötigte Records ergänzen; MX/SPF/DKIM/DMARC erhalten. Kein Namenserverwechsel oder geratenesA/AAAA. TLS/Ownership/HTTPS müssen real grün sein, bevor neue URL kanonisch propagiert wird. Alte Weblinks bleiben bedienbar, keine harten Originredirects.

## Gezielte spätere Abnahme

Firebasezuordnung/DNS/TLS getrennt von Hostingrelease/CI/Auth/Native/physicaldevice bewerten. NeueDomain: exakt gleicher Manifesthash/Hostinginhalt, Login/Register/Reset-Routing, QR/Test-/Vorlagenlinks mit Query, sichere Schülerseite, Audio/APIs/CORS. Nur synthetische Tests, keine echten Konten-/Schülerdaten als Testmaterial. Originwechsel kann neue Anmeldung verlangen; keine Konto-/Testmigration. wwwRedirect muss Pfad/Query erhalten. Offene Native-/Store-/Auth-ActionURL-/CSP-/Analyticsfundstellen an zuständige Owner zurückgeben, nicht fremdeNativebäume übernehmen.

Skills firebase-hosting-basics/firebase-auth-basics und begrenztes Brainstorming/TDD gelesen. Vorgegebener Aufbau: Domainalias derselben Site, vorhandene Auth-/Prüfungsengine erhalten; keine kreative Produktneuentwicklung. Quellen FirebaseCustomDomain-REST und NetcupDNSanleitung frisch geöffnet. Modell/Aufwand angefragt im Auftrag nicht spezifiziert; beobachteteRuntimewerte unknown. Keine Paid-KI-/Versuchs-/Budgetreservierung geändert.

## Zugangsdaten-Ausgabe begrenzen

Ein firebase login:list --json-Aufruf gab unerwartet Tokenwerte im privaten Toolverlauf dieses Chats aus. Keine erneute Tokenanzeige und keine Tokenwerte in dieser Übergabe, Git/PR, Zentrale oder eigener Evidenzdatei. Keine öffentliche Exposition nachgewiesen, keine pauschale Abmeldung/Rotation. Alle folgenden Cloudabfragen nutzen reguläre bestehende Authentifizierung nur intern und filtern Ausgabe auf freigegebene Metadaten. Kein Credential-Diagnoseauftrag. Das ungewollte Ausgabeereignis ist benannt; keine Behauptung, es sei aus dem Toolverlauf entfernt.

Aktuelle Release-/Produktstufe: Basis bleibt bestehendes Schul-Live; neuer Domainauftrag nicht umgestellt. Code-/Auth-/Hosting-/Functions-/Rules-/Nativezustände unverändert. Nächster Schritt exakt: einmalige FirebaseCustomDomain-Validierung/Einrichtung mit zurückgegebenenDNSanforderungen, während Netcupaktivierung aussteht.


## Einrichtungsergebnis und gesicherter nächster Schritt

FirebasepreflightRemotecheckpointa34a08df66701e6d1cb732ec30adca23ca0203f2 vor externerMutation gesichert. ZweiCreateoperationen nachvalidateOnly genaueinmal gestartet: gradecrew.de88430c73-26cf-4677-b8fa-7045544456a2 undwww e208d009-38ab-4f0f-8eea-bf546271db77 (vollständigeNamen imEvidenzJSON). Ressourcen real zurückgelesen; Ownershipfehlt/Hostunhosted/Zertifikatvalidierend, Operationsdone nochunbestätigt. KeineRetry-/Createwiederholung. Projekt950775032930 entspricht bestätigterSchulsitehausaufgabe-staging. DNSpendingNetcup, Ursache genauerunbekannt; keineoffenenRechnungen inÜbersicht, generischerVerifizierungshinweis keinbelegterKontohold.

Dokument docs/domain-gradecrew-de-20261022.md führt tatsächlicheDNSwerte, Aktivierungsauslöser undgezieltesWeb/Auth/Native/Storeinventar. DreiCloud-/DNSbelegdateien plusNetcupstatus unteranalysis/domain-cutover-20261022, nuröffentliche/erforderlicheMetadaten; keineLoginsecrets. LokaleAuthentifizierungshelfer liegenaußerhalbRepository undwerdennichtcommitted. InitialeManifestprüfung falsewarSchlüsselreihenfolge, tiefersemantischerFolgeabgleich gleicheMetadaten/Dateien bestätigt; Fehlerhistorieerhalten. SiebenHTTPdateien manifestgleich,10/10Domain/Umgebungs/BuildtestsPASS. KeinProduktcode-/Hostingrelease-/Auth-/Functions-/Rules-/Nativewechsel; keinefalscheHTTPS-/Login-/Geräteabnahme. AktuellerDomainzustand vorbereitet/blockiertdurchNetcup, keinabgeschlossenerCutover.

NächsterexternerSchritt: NetcupaktiviertDomain/DNSverwaltung; anschließendOriginalzone sichern undfrischabgeglicheneFirebaseRecords setzen. KeineDauerpollschleife. DanachTLS/Ownershipbelegen undseparatgezielteAuth-/kanonischeURL-/Nativeanpassungen mitOwner/Review/CI. Originaltask/Budgets/Versuche bleiben.
