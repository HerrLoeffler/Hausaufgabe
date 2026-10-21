# GC-IOS-02 / GC-RELEASE-06 — Secure Store-Einstieg 21.10.2026

Owner: ausführender Native-Fachchat (aktueller Chat, Link unbekannt). Zugeordneter Auftrag aus GradeCrew-Zentrale: vorhandenes Original-GC-Logo, GradeCrew/Secure und bestehender Code-/Namenseinstieg ohne Tiere; App-Store-Paket konkret vorbereiten. Keine Lehrer-App-Umgestaltung, keine App-Review-Einreichung, kein Upload/Live-Deploy/Vertrag/Berechtigungswechsel in diesem Teilauftrag.

## Tatsächlicher Ausgangspunkt
- Branch feature/secure-store-entry-20261021, isolierter vorhandener Worktree gradecrew-remy-screen; Start remote b43298b73d63707d2270ee4a3f4e49cf980dd606. Ursprünglicher lokaler2d995ef hat identischen Baum; keine Arbeit verworfen.
- Richtiger Target GradeCrewSecure, Bundle de.gradecrew.secure, Scheme GradeCrew Secure/Archive SecureLive, Gerätefamilie2, iPadOS17.0, Version0.2.3. Keine Lehrer-Authentifizierung in dieser App: Testcode + Name/Kürzel, dann bewusster Prüfungsstart.
- Bestehender TestFlight-Nachweis vom18.10.: Secure0.2.3(1131), Run39161910224 vollständig success; signierte App und Distributionprofil AAC-geprüft, UPLOAD SUCCEEDED. Teacher0.2.0(48), Run39161910081 success. Dies ersetzt weder Apple-Verarbeitung/Installierbarkeit noch physische Offline-Abnahme. Main hat diese beiden Uploads noch fälschlich als laufend erfasst; Nachtrag folgt separat unter Erhalt des gc45-Webstands.
- Aktueller main c14a8fd enthält separat freigegebenen Hosting-only gc45-rc1/4f8b7922; nicht durch älteren Native-Webbaum ersetzen. Development Status39599126188 success; offenePRs lesen, kein paralleler Secure-UI-Code-PR gefunden. PR145 historische iOS-Dokumentation nicht übernehmen.
- Originalasset assets/gradecrew/brand-icon-v1.svg wird bereits durch prepare_assets.swift zu GradeCrewLogo gerendert. Kein neues Logo/Maskottchen generieren.

## Begrenzter Plan
1. Unveränderten SecureLive-Build als echte iPad-Vorheransicht sichern.
2. Ausschließlich den Markenkopf des Code-/Namenseinstiegs ändern: Original-GC-Logo96pt, darunter GradeCrew und dezente Secure-Kennung. Bestehende Themefarben und Formularbreite560pt erhalten, keine Start-/Auth-/AAC-/Abgabelogik ändern. Andere Statusansichten behalten ihre bisherige Darstellung.
3. SecureLive neu bauen, echte iPad-mini-/große-iPad-Vorschau, große Schrift/kurze Ansicht über vorhandene Layoutprüfung prüfen. Kein künstliches HTML-Mockup als native App ausgeben.
4. Store-Dokumente/Metadaten und tatsächlichen Datenfluss aktualisieren; offizielle Apple-Quellen, fehlende Betreiber-/Support-/Datenschutz-/Reviewdaten und Paketgates klar kennzeichnen. Keine Secrets lesen. Vorhandene Signing-CI als Nachweis, ASC-Verträge/Verfügbarkeit ohne Sitzung unbekannt lassen.
5. Unabhängige Prüfung, Quellcommit/PR und Nachweise sichern. Keine endgültige Storeeinreichung/Veröffentlichung. Runtime-Modell/Usage nicht verlässlich abrufbar: unknown; keine Modellumschaltung behauptet.

## Diagnosegrenze
Der separat gemeldete zeitabhängige iPad-Anmelden-Button ist noch keinem installierten Build/Target zugeordnet. Lokale Teacher-Auth-Diagnose vom21.10. gelesen; Secure hat keinen entsprechenden E-Mail/Passwort-Login. Keine ungeprüfte Übertragung der Hypothese, kein Auth-Fix behauptet.

## Assurance-Scope
SEC01/03/15/16/18/20 und PRIV04/08/12–15/19: vorhandenes Originalasset, Paket-/Storemetadaten, zugängliches Layout und korrekte Datendeklaration. UI-Nachweise zunächst offen; bisherige Backend/AAC-/Antwortvertragsprüfungen gelten nur für unveränderten Ausgangscode. Betreiber-/Schul-/AVV-/Fristenentscheidungen bleiben menschlich offen; kein KI-Rechtszertifikat.

Nächster Schritt: Vorherbild prüfen, dann ausschließlich begrenzten Markenkopf implementieren.

## Lokaler Kandidat und Vorschau
- Nur Secure-Einstieg im Code-/Namenszustand geändert; andere Welcome-Statusansichten behalten den bisherigen Markenkopf. Formular/AAC/Abgabe/Antwortspeicher unverändert. Kein Teacher-Pfad im Diff.
- PrivacyInfo.xcprivacy als gebaute Ressource hinzugefügt: SystemBootTime35F9.1, passend zur rein lokalen Intervallmessung im mitkompilierten Lab-Code. Kein leerer Datenerfassungsclaim; ASC-Privacy-Labels eigener unbestätigter technischer Entwurf. Offizielle Apple-JSON-Referenz am21.10. gelesen.
- Beide SwiftUI-Komponentenmatrizen:40/40 Berichte, keine gemeldeten Geometrieprobleme. Vorherdarstellung über unveränderten alten Markenkopf, danach neue Entryvariante im bestehenden nativen Testhost; großer/kleiner Text und schmale Ansicht enthalten. Keine HTML-Mockups. Aktuelle Builds: SecureLive-Simulator erfolgreich, generisches iOS-Archiv0.2.3(1132) erfolgreich, ausdrücklich **unsigniert/nicht hochgeladen**. Bundle/Mode/iPadFamily/Privacyressource im fertigen Archiv geprüft.
-28/28 Swift- und20/20 Python-Paketprüfungen bestanden. Kein zusätzlicher Live-/KI-Aufruf. Letzte tatsächlich signierte TestFlightversion bleibt0.2.3(1131) ausb43298b; neue UI ist dort noch nicht enthalten.
- Unsigned Simulator konnte sicheren Speicher nicht öffnen; auch frisches Gerät zeigt diesen Zustand. Ein rein lokaler Ad-hoc-Signierungsversuch lieferte keinen startbaren Prozess. Diese Artefakte sind getrennte Diagnosen; keine Versand-/Speicherprüfung im Produkt deaktiviert. Layoutbilder belegen nur tatsächlich gerenderte native Komponenten, nicht einen funktionierenden Keychain-/AAC-/Serverablauf. Der gemeldete fremde iPad-Login ist damit ausdrücklich nicht behoben.
- Lokale Dateien: outputs/secure-app-store-20261021/entry-before-preview.png, entry-after-preview.png, entry-after-narrow-accessibility-preview.png und GradeCrewSecure-candidate.xcarchive. Der nicht signierte Vollapp-Speicherfehler liegt separat als unsigned-storage-diagnostic-*; nicht als Login- oder Storevorschau verwenden.
- Storepaket aktualisiert: konkrete vorhanden/fehlt/vonMartin-Tabelle, deutsche Metadaten innerhalb der Zeichenlimits, englische Reviewanleitung mit tatsächlicher lokaler Freigabe/Nachsynchronisierung, enges Dateninventar, offizielle Applelinks. Betreiber-/Support-/Datenschutzangaben inklusive erreichbarem In-App-Datenschutzlink, Preis/Länder/Alters-/EU-Händlerangaben, stabiler Live-Reviewcode und physischer neuerOffline-Gerätetest fehlen. Keine Verträge oder Apple-Metadaten geändert.

Nächster Schritt: unabhängige Prüfung des unveränderlichen Quellkandidaten; dann Draft-PR und zentrale Status-/TODO-Nachträge ohne Änderung des aktuellen gc45-Live-Webstands sichern.

## Unabhängige Prüfung und Betreiber-Rückfrage

- Unabhängige Quellen-/Diffprüfung von b8b2e509 gegen b43298b: PASS, keine konkreten Befunde im begrenzten UI-/Projekt-/Manifestumfang; keine unabhängige Geräteprüfung behauptet.
- Martin fragte nach Betreibername und Datenschutz-URL und beauftragte die sachgerechte Vorbereitung. Offizielle Apple-, DDG-, Datenschutzaufsichts- und bayerische Schulquellen gelesen. GradeCrew ist Marke; Martin Löffler ist nur nach Bestätigung des tatsächlichen privaten Betriebs als Anbieter einzusetzen. Schule/Träger und Betreiber pro Verarbeitung unterscheiden.
- Textentwürfe für Datenschutz, Support und Impressum plus Veröffentlichungsschritte ergänzt. Aktuellen Web-Quellstand4f8b7922 nachgeladen: KI-Uploadhinweise vorhanden, kein Ersatz einer vollständigen Secure-Erklärung; historische Septemberberichte nicht als neue Sicherheitsbefunde übernommen. Keine privaten Schülerdaten/Secrets oder Verträge ausgelesen.
- Öffentliche Kontakt-E-Mail, Anbieteridentität/Anschrift als gebündelte Tatsachenfrage gestellt. Kein erfundener Kontakt, keine Veröffentlichung unfertiger Texte; öffentliche und In-App-Links, Serverfristen/Schulrollen und echte Dienstleister-/Betriebsnachweise offen.

- Martin bestätigt selbständigen gewerblichen Betrieb und öffentliche Kontakt-E-Mail; Entwurf entsprechend ergänzt. Wohnanschrift angesichts Datenschutzbedenken ausdrücklich nicht ins Repository übernommen. Öffentliche geeignete Anschrift weiter offen. Automatische Freigabeprüfung hat Git-Push wegen zuvor ungeprüfter Ziel-Ownership/Öffentlichkeit abgewiesen. Danach nur lesend bestätigt: HerrLoeffler/Hausaufgabe ist öffentlich und Connector hat Admin-/Pushrechte. Kein indirekter Schreibversuch/Bypass. Lokaler Kandidat bleibt gesichert, keine neue Store-/Liveaktion.

- Neueste direkte Entscheidung vom 21.10.2026: Martin wählt ausdrücklich seine zuvor angegebene Münchner Adresse als öffentliche Betreiberanschrift. Datenschutz-/Impressumsentwurf und Checkliste lokal aktualisiert; vorherige Zurückstellung aufgehoben. Keine Veröffentlichung oder GitHub-Übertragung ausgeführt. Andere offene Rechts-/Betriebsangaben bleiben offen.

## Nutzerauftrag Rechtsseiten umsetzen

- Direkter Auftrag: Datenschutz/Impressum fertigstellen, Website und Secure einbinden, App-Store-Paket vervollständigen und verbleibende Punkte nennen. Telefonnummer/USt-ID direkt bestätigt; in öffentlich vorgesehene Inhalte übernommen, keine amtliche Verifikation behauptet.
- Webbranch `feature/public-legal-pages-20261021` im wiederverwendeten isolierten Web-Worktree `/private/tmp/gc-school-web-release`, Basis aktuelles kanonisches4f8b7922; Native bleibt isoliert auf Secure-Store-Entrybranch. Kein alter Webbaum überschrieben.
- Drei Seiten aus strukturierter gemeinsamer JSONquelle erzeugt, keine App-/Trackinginitialisierung. Globale Footerlinks eingebaut, production/staging-Builds umfassen173Dateien. Echter Buildtest zunächst fehlgeschlagen (Seiten fehlten), dann beide Umgebungspakete vollständig bestanden. 320px-Brandumbruch gefunden und mit schmalem Header korrigiert; echte Browseransichten320/834px ohne horizontales Überlaufen.
- Native: gemeinsame JSONtexte als Legal-Ressource; Datenschutz/Impressum/Support als lokale SwiftUI-Sheets vor Teilnehmernamenseingabe erreichbar. Keine externen Aktionen, kein AAC-/Speicher-/Abgabeumbau. Simulatorbuild erfolgreich; weitere Kern-/Layoutprüfungen laufen.
- Gelesene Skills: executing-plans, firebase-hosting-basics samt Deployreferenz, using-git-worktrees (bestehende Isolation wiederverwendet), frontend-design, TDD, requesting-code-review. Ruling: keine spiegelnden Texttests; tatsächlichen gebauten Hostingbaum und vorhandene native Prüfungen nutzen.
- GitHub hat main c14a8fdee, Webintegration4f8b7922, Nativeb43298b bestätigt; offene PRs einschließlich254/Kapitel und191/Privacy gelesen, nicht ungeprüft übernommen. Runtimeprüfung umfasst aktuellen Hauptpfad; keine alten September-Sicherheitsbefunde als aktuell behauptet.

## Abschlussbeleg Rechtsseiten und Storekandidat21.10.2026

- WebsitePR256 nach unabhängigem Review und exakter Paket-CI39624491617/39624481757 sowie AdminCI39624491477 integriert:39e70b20b304ded6db8c2a668f1622851b15fb32. Ausschließlich Hosting auf hausaufgabe-staging veröffentlicht, Version6e2c90f76d61ad36. Alle173Manifestassets perHTTPS hashgleich,0entfernt;166bestehende Dateien unverändert, nur index/styles-Footer geändert plus5Informationsdateien. Keine Functions/Rules/Konten/Prüfungsdaten/Legacy-/Nativeveröffentlichung. Vorherige GitPush-Autoreviewbedenken durch nachgewiesenes öffentliches Benutzerrepo/Adminrechte und erneuten konkreten direkten Nutzerauftrag geklärt; Shellpush scheiterte nur an fehlender Git-Anmeldung, Connector verwendet und exakte Baumgleichheit geprüft.
- Datenschutz/Impressum/Support öffentlich ohne Anmeldung; Footer im echten öffentlichen Browser sichtbar, Links44px. IAB320/834px ohne horizontales Überlaufen; Screenshot outputs/secure-app-store-20261021/imprint-live-ipad.png zeigt tatsächliche Livesite. Kein neuester physischer Gerätetest.
- NativePR257 nach b43298b:593076f8c2154760fecd966e80d89a216e0a1322, identischer Baum9a5edc4a zu lokal9f9885f. Schlichter Einstieg und offlineLegalReader in Secure eingebaut, zwei scoped unabhängige Quellreviews PASS. Simulatorbuild und generisches iOS-Archiv0.2.3(1132) erfolgreich; Legalquelle und gebauter Payload SHA2568a799779ec8532f9ed883bc6a8faac5c7c4f6c840902a2d51e197dff3832497b.28Swift20Python40nativeLayoutfälle grün. Draft bleibt offen: kein Merge in uploadendenNativebranch, kein neuer TestFlightupload/AppReview.
- Letzte signierte Versionen separat nachgewiesen: Teacher0.2.0(48), Secure0.2.3(1131), beideUploads vom18.10. erfolgreich. Apple-Verarbeitung/Installierbarkeit und physische neueOfflineabnahme werden dadurch nicht behauptet.
- Offen für tatsächliche Storeeinreichung: aktuelle ASC-Sitzung/Händlerverifikation/Verträge, endgültige Preis-/Länder-/Altersangaben, dauerhafter synthetischer Live-Reviewtest, signierter finaler Kandidat und13Zollproduktaufnahmen, physische Offline-/Neustart-/Sync-Abnahme. Schulische Rollen/AVV und konkrete Provider-/Server-/Backupfristen benötigen belastbare Betriebs-/Vertragsnachweise; veröffentlichte Informationen sind kein Rechtszertifikat.

## Direkter Fortsetzungsauftrag21.10.2026 — TestFlight

Martin autorisiert jetzt den signierten Build und TestFlightupload. Keine AppStore-Veröffentlichung oder Website-/Backendänderung. Secure bleibt Code+Name/Kürzel ohne Schülerkonto. Der bereits schlichte Einstieg bleibt; auch Statusköpfe verwenden nun dasselbe GC/GradeCrew/Secure ohne Figuren. Preis kostenlos/Deutschland und ASC-Entwürfe bereits gespeichert. Rechtlich verbindliche Erklärungen werden erst am konkreten letzten Schritt mit Martin bestätigt; TestFlightupload ist davon unabhängig vorzubereiten.

Prüfziel: tatsächlicher signierter1.0Build mit AAC-Profil und gebündelten Rechtsinformationen. Offlinefreigabe erst nach überprüfter lokaler Sicherung; ausstehender Empfang klar markiert und neuer Test bis zum passenden Serverbeleg gesperrt. Physischer Nachweis folgt durch Martins iPad-Test.

Lokale Abnahme des neuen Kopfs:40/40native Layoutberichte ohne Geometriefehler,28Swift-/20Python-/24Nodeprüfungen bestanden; unabhängige begrenzte Quellprüfung PASS. Initiale Simulator-/Swiftläufe scheiterten ausschließlich an Sandboxzugriff auf Xcode-Dienste/Compiler-Caches; mit freigegebenem normalen Xcodezugriff bestanden. Keine Sicherheitsfunktion im Produkt abgeschaltet.
