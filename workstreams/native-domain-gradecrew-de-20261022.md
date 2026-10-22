# GC-DOMAIN-01 / GC-IOS-02 — Native Domainfortsetzung, 22.10.2026

Ausführender Nativefachchat 01a10c75-8912-7a12-98f0-c9e78064aa2c, beauftragt durch Domainfachchat 01a15f06-837c-73b3-93fa-0d07a8104d3a nach Martins dort direkt gelesener Autorisierung: gradecrew.de neue Liveadresse, Apps abstimmen, alte Links und Konten weiterhin nutzbar. Keine neue Task-/Budgethistorie. Angefordert/bisherige Runtime-Modellwerte unknown; begrenzte origin-/signierungsrelevante Änderung, kein Modellwechsel.

## Quelle, Scope und Umsetzung

Nativebasis b9edcd6e765b6fe5479e18a50ac4a23fd41793e8 (Secure1.0/1171, Teacher0.2.0/50). Eigener Branch feature/native-gradecrew-domain-20261022, eigener Checkout /private/tmp/gc-native-domain-20261022. Frischer origin/main f1e030ca; Development Status Run39843476057 success sowie lokaler lesender Status22.10.20:18UTC geprüft. Offene DomainPR282/283 beim Webowner; keine konkurrierenden Native-PRs in gelesener Liste. Bestehende unregistrierte/historische Branchwarnungen nicht als neue Implementation übernommen. Erster Statusversuch aus falschem /tmp-Skriptort fehlgeschlagen; zweiter im Checkout ausgeführt, Produkt unverändert.

Live-Teacher öffnet gradecrew.de statt projektID.web.app. Separate exakte Hostliste erhält hausaufgabe-staging.web.app und www.gradecrew.de für Navigation; kein Wildcardhost. Native Bridge bleibt main-frame und strikt auf den jeweils ausgewählten Origin begrenzt. Kein Cross-Origin-Bridging nur wegen gemeinsamer Firebase-Datenbank. Bestehende installierte Apps/Altlinks werden nicht umgeleitet oder abgeschaltet; Webkonten bleiben dieselben, Browser-/WebViewsitzungen sind originabhängig, neue Anmeldung kann nötig sein.

Secure trennt öffentliche Webadresse von unverändertem projectID/APIhost. Vorschau erzeugt gradecrew.de-Links und erlaubt alte Schuladresse; eigentlicher nativer Prüfungsrenderer/APIpfad unverändert. Rechtsleser-Fallback nutzt umgebungsrichtigen öffentlichen Host. AppStore-Quelldatei erhält neue Support-/Privacy-/Marketing-URLs, keine behauptete Speicherung bei Apple; übrige historische Metadaten sind kein aktueller Vollstatus.

Nicht geändert: Firebaseprojekt/Functions/Authhost, IDs/Keychain/Queue/Workdirectory, Prüfungssperre/AAC, Antwort-/Timer-/Receiptprotokoll, Schul-/Testdaten, Web-/Functions-/Rules-/Hostingdateien. Test-App weiter gradecrew-staging-2026. Keine AppRevieweinreichung oder Verträge.

## Prüfungen und Releasegrenzen

Rotbeleg: neuer echter Foundationroutingtest scheiterte vor Implementierung an erwartetem gradecrew.de-Host (/private/tmp/gc-native-domain-red.log). Danach beide kompilierten Live-/Stagingvarianten bestanden; zusätzliche positive Legacy-/WWWnavigation und strikt gleiche Bridgeorigins, negative Fremdprojekt-/Lookalike-/HTTP-/Port-/Credentialfälle. Bestehende Beta-,Navigation- und Bridge-/Lifecycleprüfungen bestanden. Layoutsourceguard:36/36 gepinnte Webdateien remote verifiziert; dieser Beleg ist kein Geräte-/Loginbeweis auf neuer Domain.

Ausgewählte Assurance: SEC04/06/07/14/17 (Host-/Bridge-/Auth-/Persistenzgrenzen), PRIV07/17/20 (unveränderter Datenpfad, transparente Kontensitzung). Implementierungsnachweise oben; unabhängiger Review, vollständige CI, Signierung/Upload und echte Gerätelogin-/AAC-/Offlineabnahme für diesen Kandidaten noch offen. Nicht relevante Kontrollen (neue Inhalte/Tracking/Bezahlung) außerhalb dieses engen URLdiffs; keine pauschale Sicherheits-/Rechtsfreigabe.

Nächster Schritt: unabhängige Prüfung des unveränderlichen Kandidaten, dann normaler PR gegen feature/native-live-staging-20261018 und beide vorhandenen TestFlightgates. Erst erfolgreiche Upload-/Appleverarbeitung separat verbuchen. Apple aktuell ausgeloggt; tatsächliche Store-UI-URLanpassung ggf. nach Anmeldung, ohne AppReview/Vertragsänderung. Webowner hält Domain/Auth- und Mainstatusdokumentation.
