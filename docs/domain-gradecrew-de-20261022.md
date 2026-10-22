# gradecrew.de — Einrichtung und nächster Cutover-Schritt

TaskGC-DOMAIN-01,22.10.2026. Ausführungsauftrag der Zentrale auf direkte Nutzerfreigabe geprüft. Bestehende Schulsite **projects/hausaufgabe-staging/sites/hausaufgabe-staging**, bisherige Adresse https://hausaufgabe-staging.web.app/. Keine Server-/Datenmigration.

## Tatsächlich vorbereitet

FirebaseCustomDomain-Ressourcen gradecrew.de und www.gradecrew.de wurden nach lesendem Vorabgleich und validateOnly jeweils genau einmal erstellt. WWWredirectTarget ist gradecrew.de. Die Site bleibt dieselbe; Hostingrelease/Functions/Rules/Auth und Konten wurden nicht verändert. Details/Operationnamen: analysis/domain-cutover-20261022/firebase-domain-setup.json.

Firebase bestätigt beide Ressourcen, aber derzeit **HOST_UNHOSTED / OWNERSHIP_MISSING / CERT_VALIDATING**. Die langlaufenden Createoperationen sind noch nicht als done bestätigt; Besitz-/Zertifikatsabschluss hängt von DNS ab. Nicht erneut create ausführen. Kein öffentlich funktionsfähiges HTTPS und kein abgeschlossener Cutover behauptet.

## Tatsächlich angeforderte DNSwerte

Aus dem Rückgabestatus dieser konkreten Site, keine geratenen Standardwerte:

| Netcup-Host | Typ | Wert |
|---|---|---|
| @ | A | 199.36.158.100 |
| @ | TXT | hosting-site=hausaufgabe-staging |
| www | CNAME | hausaufgabe-staging.web.app |

Zusätzlich enthalten die Certificate-Verifikationsobjekte aktuell _acme-challenge-TXT-Anforderungen in firebase-domain-setup.json/verification.json. Vor dem tatsächlichen DNSschreiben einmal frisch lesen, da Certificate-Challenges sich ändern können; keine alte Challenge blind übernehmen. BestehendeRecords zuerst sichern. Nur ausdrücklich widersprechende Webrecords bewusst ersetzen; niemals die gesamte Zone auf Standard zurücksetzen. Mail-MX/SPF/DKIM/DMARC, andere Dienste und Nameserver erhalten.

## Konkreter externer Blocker

Angemeldetes NetcupCCP zeigt gradecrew.de mit Uhrsymbol, Hosting„unknown“ und „as soon as active“, noch ohne Domain-/DNSbearbeitungslink. RootNS/SOA/A/AAAA/MX/TXT/CAA sowie WWWabfragen lieferten NXDOMAIN. Netcup nennt keinen präziseren Grund; die Kontoübersicht zeigt keine offenen Rechnungen. Allgemeiner NIS2-Verifizierungshinweis ist kein Beleg, dass dieses Konto eine Verifizierungssperre hat. Kein Zahlungsvorgang/Supportversand oder Zugriff auf private E-Mails.

**Nächster Auslöser:** Netcup meldet die Domain aktiv bzw. gibt die DNSverwaltung frei. Dann Zone lesen/sichern, aktuelle Firebaseanforderungen abgleichen und notwendige Einträge setzen. Keine ständige DNS-/TLSpollschleife und keine Ersatzdomain. Falls Netcup eine konkrete Inhaberbestätigung verlangt, führt Martin diesen normalen Bestätigungsschritt selbst durch; keine Zugangsdaten im Chat.

## Bereits geprüft und bewusst erhalten

- Schulrelease1792617896887000, Hostingversion4641f2c63bbbb2f3, Quellcommitab6fcc9d72aa9d401eba2ec4db31c01f7758c0f0. 173Dateien im öffentlichen Manifest; Hosting zählt176Dateien im Versionobjekt. Unterschied nicht verschweigen und nicht als Hashfehler interpretieren.
- Sieben öffentliche Dateien (index/app/config/secure-studentHTML+JS/Assessmentclient/legal-content) HTTP200 und exakt manifestgleich. Semantischer Manifestvergleich bestätigt identische Dateien und Metadaten. Der erste JSON.stringify-Vergleich meldete irrtümlich false aufgrund anderer Schlüsselreihenfolge; ursprüngliches Ergebnis und Korrektur im Verifikationsbeleg erhalten.
- Vier echte Linkbuilderprüfungen führen vorhandene Produktionsfunktionen aus: gradecrew.de, alteSchuladresse, getrennteTestadresse, localhost. Test-/Preview-/Vorlagencodes mit Sonderzeichen bleiben korrekt URLcodiert, alteTeacherquery/Hash werden nicht weitergegeben. Kein Firebasekonto/API-/Schülerdatensatz initialisiert.
- Mit bestehenden Umgebungs-/Buildverträgen **10/10 Tests PASS**; beideUmgebungsbuilds binden weiter exakt ihr bestehendes Projekt. Kein Produktcode wurde für die neueDomain verändert. Diese Tests sind keine Browser-/Login-/Geräteabnahme auf gradecrew.de.

## URL-/Ownerinventar für den späteren Schritt

| Fundstelle / Owner | Behandlung nach funktionierendem TLS |
|---|---|
| app.js baseStudentUrl/baseTemplateUrl; Webowner | Bereits originrelativ: neueLinks entstehen auf gradecrew.de automatisch. AlteLinks bleiben originrelativ nutzbar. Keine pauschale Ersetzung von Test-/Vorlagenqueries. |
| tools/environments.mjs + environments.test.mjs; Releaseowner | ProduktionkanonischeOrigin gezielt umstellen, erst wenn neuerHost funktioniert. projectIdhausaufgabe-staging und Testorigingradecrew-staging-2026 bleiben unverändert. |
| FirebaseAuth AuthorizedDomains / Mailaction-Konfiguration; Authowner | gradecrew.de erst nach belegterKontrolle additiv autorisieren; vorhandeneDomains erhalten. Bestehender Authhosthausaufgabe-staging.firebaseapp.com bleibt gültig; eigenerAuthDomainwechsel ist kein nötigerDNSnebeneffekt. Passwortreset-/Registrierungsfluss mit synthetischem Konto und genauerActionURL testen. KeineMail an echteKonten aus dieser Vorprüfung. |
| FirebaseFunctions/Storage/CORS/CSP; Backendowner | Konkrete Nutzung vom neuenOrigin prüfen; nur tatsächlich erforderlicheAllowlisten anpassen. Keine API-/Serviceprojektadressen umbenennen; keineWildcardfreigabe oder RulesLockerung. |
| Teacher GradeCrewBetaEnvironment.swift / NavigationPolicy / Nativebridge; Nativeowner GC · iPhone & iPad | Native öffentlicheBaseURL/Hostfreigaben gezielt ergänzen, vorhandeneBinaries und Authcallbacks kompatibel halten. LäuftparallelTestFlightarbeit, daher keineNative-Dateien hier geändert. |
| Secure StagingWebView.swift/SecureReleaseEnvironment.swift; Nativeowner | Webhost wird aus projectID.web.app abgeleitet; spätere eigeneöffentlicheHostkonfiguration trennen, ProjektID/APIhosts unverändert. SecureLegalInformation.swift enthält altenRechtslink. KeinBinary-/TestFlightnachweis ausDNSableiten. |
| docs/secure/app-store/metadata.de-DE.json; Native-/Storeowner | Support-/Privacy-/MarketingURL auf neueDomain nach echterErreichbarkeit; native lokalgebündelteInformationen beachten. KeineStoreänderung hier durchgeführt. |
| Analyse/Umgebung; Analyticsowner | NeueOrigin muss derselbenSchul-Live-Umgebung zugeordnet sein. Keinen neuenTrackingumfang oder Consent durchDomainänderung hinzufügen. |

Danach: HTTPS-Zertifikat/Ownership real prüfen, wwwRedirect inklusive Pfad/Query messen, neueOriginLogin/Register/Reset und synthetischenSchülercode/QR/secureSeite/API/Audio prüfen. BestehendeSchuladresse nicht abschalten oder hart umleiten. NeueOrigin kann neueAnmeldung erfordern; das ist keine Konten-/Testmigration. GeprüfteAuth-/Origin-/Releaseänderungen brauchen unabhängigenReview und exakteCI; NativeMatrix/TestFlight/Geräte bleiben eigenerOwnernachweis.

Quellen: https://firebase.google.com/docs/hosting/custom-domain · https://firebase.google.com/docs/reference/hosting/rest/v1beta1/projects.sites.customDomains · https://www.netcup.com/de/helpcenter/dokumentation/domain/dns-einstellungen. Providerstatus über aktuelle eigeneCloud-/CCPlesezugriffe geprüft. HistorischeBelege und interne„staging“-IDs niemals global ersetzen.
