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


## Fortsetzung 22.10.2026, 18:49–18:54 UTC

Martin beauftragt direkt in diesem Fachchat: gradecrew.de jetzt mit bestehender Firebase-Seite verbinden, Anmeldung/Schülerzugang/QR prüfen; neue öffentliche Liveadresse. Keine pauschale Freigabe weiterer Produktänderungen. Bestehende Task GC-DOMAIN-01/PR282 und Mainstatus-PR283 fortgesetzt, keine Createoperation wiederholt. Schulhosting weiterhin Version4641f2c63bbbb2f3/ab6fcc9d, getrennteTest-/Legacyprojekte unangetastet. PR282 unverändert6057467d; PR283 weiteroffen31d2976a, inzwischen Konflikt mit aktuellem main, vor späterer Integration additive Daten bewusst neu abgleichen. DevelopmentStatus39788630833/Job119858386723 erfolgreich, Domainbranch nur eigene neue Beleg-/Testdateien, keine app.js-/Nativeüberschneidung übernommen.

Netcup jetzt aktiv mit CloudDNS. Originalzone sichtbar und gesichert in analysis/domain-cutover-20261022/netcup-zone-before.json: ein Parkplatz-A @46.38.243.234 TTL3600; keineMailrecords, keineAAAA. SOA/Nameserver unverändert. Firebaseanforderungen frisch18:49UTC gelesen: A199.36.158.100 + TXT hosting-site=hausaufgabe-staging; wwwCNAMEhausaufgabe-staging.web.app, beide aktuellen ACME-TXT. Genau diesen Satz in Netcup vorbereitet/geprüft und regulär Apply changes/Yes continue bestätigt. Netcup meldet Upload/Deployment läuft, letzteAnzeige50%/12.5%; keine erneuteSubmission. Vor unabhängigen Host-/TLS-/Authbelegen kein fertigerCutover.

NächsterSchritt: Netcup-Revision bis explizitem Deploymentabschluss beobachten, dann autoritativeDNS und FirebaseOwnership/TLS prüfen. Authdomains/KanonischeURLs erst nach Hostnachweis; Tests nur synthetisch. KeineAccounts aus echtenSchülerdaten, keine fremdenTestFlightänderungen. Modell angefragt nicht spezifiziert, actualunknown; kein Modellswitch oder bezahlterProviderstart.


## DNS-Deployment bestätigt, HTTPS wartet — 18:55 UTC

Netcup nach Neuladen: aktuelle Revision enthält exakt fünf neue/angepasste Records, keine offenen DesiredRevisionänderungen. Autoritative5/5Netcupnameserver liefern199.36.158.100; alle fünf konkretenRecords auf firstns korrekt. dns-published.json und cutover-progress.json sichernBelege. Screenshot lokal/private/tmp/gradecrew-domain-dns-20261022.png zeigt gespeicherteRevision, keineCredentials. DNS nicht erneut speichern.

Firebase18:55:54UTC prüftnochgecacheteParkadresse46.38.243.234, HOST_MISMATCH/OWNERSHIP_MISSING/CERT_VALIDATING. DirekterHTTPScheckscheitertNamensprüfung, keineUmgehung. Firebase nenntfürDNS/Zertifikatsverteilung bis24Stunden (https://firebase.google.com/docs/hosting/custom-domain). KeinnachgewiesenerKonfigurationsfehlernachheutigemNameserverabgleich; keinVersuchdurchNeuanlegen/Nameserverwechselzuumgehen.

10/10Domain-/Umgebungs-/Buildtests erneutausgeführtPASS, unveränderterProduktcode. API-/BrowserLogin, SchülerbeitrittundtatsächlicheQR-Erzeugung auf neuerOrigin ausdrücklichnochblockiertdurchTLS, physischerKamerascanungeprüft. KeineAuthallowlistoderkanonischeReleaseoriginvorTLSnachweisumgestellt. MainkoordinationPR283aufaktuellenmain970db464 unterErhaltungallerbisherigenWorkstream-/Release-/Nativebelegekonfliktbewusstabgeglichen, Remoteefc761a2992d1ac68a7f03ab974b6ff92aa24ae4. KeineMerge-/ProduktdeployfreigabeausDokumentationsCIableiten.

AktuellerexternerBlockerundgenaunächsterSchritt: FirebasebestätigtOwnershipundstelltgültigesZertifikataus, anschließendHTTPS/WWWquery/manifestgleicheApp/AdditiveAuthdomains/synthetischerLogin/Schüler-/QR-Prüfung. KeineBackgroundautomationangelegt, keinungeprüfterLiveabschluss. UrsprünglicheTask-/Budget-/Versuchshistorieerhalten.


## HTTPS und Schülerdurchlauf bestätigt — 22.10.2026, 22:09–22:12 MESZ

Beide CustomDomains HOST_ACTIVE/OWNERSHIP_ACTIVE; Zertifikat CERT_PROPAGATING. Reguläre TLSprüfung erfolgreich: gradecrew.de/release.json HTTP200, gleicher Commitab6fcc9d72aa9d401eba2ec4db31c01f7758c0f0 und gleiche Manifestdateien wie alte Schuladresse. WWW- und HTTP-Weiterleitung erhalten /index.html?test=DOMAINCHECK und enden HTTPSgradecrew.de. Datenschutz/Impressum/Support HTTP200. Frühere ACMEissue mit Park-IP bleibt inAPIhistorie sichtbar, ist kein Gegenbeleg zum erfolgreichen aktuellenTLSabruf; vollständige globale Zertifikatsverteilung noch nicht behauptet.

Echter Browser: Startseite und Anmeldung (?intent=login) ohneWarnung geladen. Vorhandener synthetischer AppReview-Democode3F2RH3PU öffnet sichereSchülerseite, Server Verbunden; fiktivesKürzel DomainQA, zweiAntworten eingegeben und abgegeben. Oberfläche bestätigt Abgabe gespeichert / serverseitig gespeichert. Kein Echtnutzer-/Schülerdatensatz verwendet; dieser eine synthetischeAttempt ist bewusst im bestehendenDemo. Screenshot /private/tmp/gradecrew-domain-student-success-20261022.png. Keine neueTestanlage/Provider-/KI-Kosten/Hostingdeploy.

Noch offen: FirebaseAuth AuthorizedDomains enthält weder gradecrew.de noch www.gradecrew.de. BestehendeDomains erhalten und neueDomain gezielt additiv autorisieren, dann tatsächlichenPasswortlogin/Logout/Reload und Reset-/Registrierungsrückwege mit eigenemTestkonto prüfen. Anmeldemaske ist kein echterLoginnachweis. QR-Linkbuilder10/10 bereitsbelegt; tatsächlicheQR-Erzeugung/Decodierung und physischerKamerascan auf neuerDomain offen. Keine vorschnelleNeuauflagealterCodes, alteOrigin bleibtfunktionsfähig. ReleasekanonischeOrigin und Native-/Storelinks beimzuständigenOwner gezielt nachführen; ProjektIDs/Authhost/APIhosts unverändert. NeueOrigin kann erneutenLogin verlangen, lokaleBrowserdaten/Sitzungen wandern nicht automatisch. Domainwechsel verändertDatenstandort/AVV-/Datenschutzstandnicht.

Nächster konkreterSchritt: unabhängigerReview der begrenztenadditivenAuthdomainänderung und Umsetzung, dann authentifizierteWeb-/QR-Abnahme. BestehendeNativeownerarbeit nichtübernehmen; keine neueTask/Versuchs-/Budgethistorie. Domainbetrieb funktioniert, vollständigeLogin-/QR-/Geräteabnahme bleibt offen.


## Live-Abschluss beauftragt — 22.10.2026 22:15 MESZ

Direkter Martin-Auftrag: offenePunkte erledigen, gradecrew.de neueLiveadresse, Nativeänderungen mitzuständigemChat abstimmen; alteLinks und Accounts müssen auf alterSeite weiterfunktionieren. Nativeowner01a10c75 direkt mitgenauemScopebeauftragt; keineNativeDateienhierverändert. BestehendeTask/PR282/283fortgeführt.

BegrenztesWebdelta: tools/environments.mjs kanonischeProduktionorigin gradecrew.de, Projekt/config/Authhost/stagingunverändert; erwarteterTest zuerstrot, anschließend10/10lokalgrün. UnabhängigerReviewer bestätigt Kompatibilität, P2nurMutationreceiptvorPostchecks imexternenAuthhelper; korrigiert undNachprüfungangefordert. AdditiveAuthdomainänderung bisreviewnochNICHTausgeführt. Geplant: bestehendeauthorizedDomains vollständigbehalten, nurgradecrew.de/wwwergänzen, updateMaskauthorizedDomains, vorherHOST/OWNERSHIP/HTTPSProjektprüfen, nachherConfig-/Domainserhaltbelegen. KeinRetry/kompletterConfigrollback. UrsprünglicheDomaincreate-/DNS-/Hostingoperationennichtwiederholen.

GeplanteAbnahme: eigenerneuerfiktiverQA-Authaccount ohneMails/Privilegien, gleicheCredentialsanbeidenOriginsinwirklicherAnmeldemaske, Logout/Reload, eigeneTests/QRerzeugenunddecodieren. FremdeKonteninhalte/Schülerdaten undPaid-KIaufrufe ausgeschlossen. VorhandeneDemo-Schülerabgabe bereitsserverbestätigt. PhysischerHandy-/App-GerätenachweisbleibtvomAgentbrowsergetrennt.


## Auth und Webabnahme — 22.10.2026 22:19–22:25 MESZ

UnabhängigeNachprüfungPASS ohneP0–P2, korrigierterAuthhelperSHA256d5decda9ae9883fb1113fb72338592cca7c21189726fe3d4e3a4e951ee6cabb0. LivePATCH genauaufauthorizedDomains ergänztgradecrew.de/www; alte8Domainsvollständigerhalten undübrigeKonfigurationexaktgleich. MutationreceiptvorDispatch/Antwort/Verifikationgesichert, keinRetry/keinRollback. auth-domain-change.json enthältkeineLoginsecrets.

FiktiverQA-AccountübernormaleAuthAPIangelegt, keineMails/Privilegien; CredentialsnurgeschütztaußerhalbRepo. GleicheCredentialsunterbeidenOriginconfigsRESTangemeldet, exaktgleicheUID; Browserloginaufgradecrew.deerfolgreich, Reload stelltSitzungundgespeichertenTestwiederher, LogoutführtAnmeldemaske. AlteOriginrestoretebereitsMartinsbestehendeSitzung; nichtausgeloggt/keineInhaltsdatenexportiert. VersuchmitinitialenAnmeldefeldindicesamaltenTabbrachvorEingabemangelsLayoutab; frischeOberflächezeigtebereitsangemeldet. KeinbehauptetergleicherUIloginbeiderOrigins, gleicheKontoidentitätüberAPIbelegt.

EigenernormalmanuellerEinfragen-TestSYSTEMTESTDomainwechsel22.10 unterneuemQAaccountgespeichert/veröffentlicht, Code7WGQTJ5S. TatsächlichesQRPNG190x190ausUIexportiert, AppleVisionCPUdekodiert exakt https://gradecrew.de/?test=7WGQTJ5S. ErsteSwiftcache-/Vision-PixelbufferläufeinderSandboxfehlgeschlagen; cache/tmpundbegrenztfreigegebenerCPUlaufPASS, keineInstallation. QRLinköffnetneueSecureSeiteVerbunden; gleicheCodeamaltenHostöffnetdieselbeSeiteohneOriginumleitung. PhysischeHandykameraungeprüft. ResetlinkgenerierungfürbeidecontinueURLsPASSmitreturnOobLinktrue, keineMail/Passwortänderung, keineOOBwerteimRepo. Neue/alteAccountsbleibenidentisch, BrowserSessionsseparat.

Nativeownerbeauftragtundbestätigt: eigenerPR289c85deddc, lokalerReview/16Python67Node28SwiftbeideSimulatorbuildsPASS, CI39848507858läuft; nochkeinUploadbehauptet. AppleUIderzeitausgeloggt, StoreURL-QuellenimPRvorbereitet; actualStoreupdateggfLoginblocker. NächsterSchrittWeb: KandidatenCIviaCIaliasfeature/live-staging-domain-20261022(exaktgleicherSHA,keinezweiteImplementierung), danachreviewtekanonischeOriginintegrieren; volleöffentlicheManifesthashesüberbeideHostsbelegen. NativeErgebnisabholen,keinefremdenNativeänderungen.


## Webintegration gesichert

Kandidat750212e7a38df4d0bbce833d2ae46b3f8f8b2b68 viaCIalias geprüft, AIStagingChecks39848742312success. ZielbranchvorSchrittfrischab6fcc9d; normalfastforwardmitexpectedSHAaufexaktgeprüftenKandidaten, Ergebnisrefverifiziert. KeinHostinginhalt-/Functions-/RulesdeployausdiesemSchritt. Alle173öffentlicheAssetsübergradecrew.degegenbestehendesManifestgeprüftPASS. MainmetadataaktualisiertnuraktuellekanonischeURL/IntegrationsheadundDomainworkstream, alteURLsindhistorischenBelegenbewussterhalten. NativePR289beimOwner, keinNativeUploadvorReceiptbehauptet.
