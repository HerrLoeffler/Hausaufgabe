# GradeCrew Secure — App-Store-Vorbereitung

Stand21.10.2026. Eigenständige iPad-App `de.gradecrew.secure`; keine Umgestaltung der Lehrer-App. Dieses App-Store-Paket ist **nicht eingereicht**; kein neuer TestFlight-Upload oder App-Store-Release. Die zugehörigen öffentlichen Rechts-/Supportseiten sind am21.10.2026 ausschließlich perHosting auf der Schulwebsite veröffentlicht.

## Belegter Stand

- Richtiger Produktpfad: `GradeCrew Secure` → `SecureLive` → `SecureStagingRootView`; Live-Prüfungsserver `hausaufgabe-staging`, neue getrennte Tests `gradecrew-staging-2026`. Interne ältere Namen mit „Staging“ ändern diese explizite Bindung nicht.
- Letzter nachgewiesener signierter Upload:0.2.3(1131), Commitb43298b, [SecureCI39161910224](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39161910224),18.10.2026. AAC im signierten App-Paket und Distributionprofil geprüft; Apple bestätigte den Upload. Das ist keine App-Review-Freigabe, Installation oder physische Offline-Abnahme.
- iPad-Gerätefamilie2, Mindest-iPadOS17.0, kein iPhone/Catalyst/Mac-Angebot konfiguriert. Nicht jedes iPad der letzten zehn Jahre erfüllt diese Mindestversion; ein Absenken erfordert eigenen Portierungs-/Gerätetestauftrag.
- Original-GC-Asset aus `assets/gradecrew/brand-icon-v1.svg`; opakes1024px-AppIcon vorhanden. Neuer Markenkopf nur am Code-/Namenseinstieg: GC, GradeCrew, Secure; keine Tiere. Kein E-Mail-/Passwort-Login in Secure.
- Das lokale gebündelte WebKit-Fragenmodul ist Teil des nativen Prüfungsablaufs, kein kompletter Lehrer-Webseitenrahmen. Antworten, Start-/Abgabe- und AAC-Logik durch diesen UI-Auftrag unverändert.

## Konkrete Einreichungscheckliste

| Punkt | Status | Beleg / nächster Schritt |
|---|---|---|
| Bundle/Target/Version/Devices | vorhanden | sieheoben; fertiges neues Archiv nochmals gegenprüfen |
| AAC/Apple-Signierung | vorhandener signierter Nachweis |1131 bestätigt; neues Archiv muss denselben Distribution-Gate bestehen |
| AppStoreConnect-Eintrag | nur über erfolgreichen Upload belegt | aktuelle Metadaten, Verfügbarkeit, Mitgliedschaft, Gruppen und Verträge ohne ASC-Sitzung **nicht geprüft** |
| Neuer einfacher Einstieg | Quellkandidat | Vorher/Nachher und aktuelle Build-/Layoutnachweise in der Workstream-Übergabe; noch nicht in1131 enthalten |
| PrivacyManifest | im neuen Quellkandidaten | SystemBootTime35F9.1 für mitkompilierten lokalen Lab-Timer, im neuen Paket prüfen; keine Behauptung „keine Daten“ |
| Produkttexte | Entwurf vorhanden | `metadata.de-DE.json`; Name16, Untertitel22Zeichen, Zeichenlimits vor Eingabe nochmals prüfen |
| Support-/Datenschutz-URL | **öffentlich veröffentlicht und geprüft** | drei öffentliche Seiten im Web-Build; identische Texte lokal in Secure vor Namenseingabe, Betreiber/Kontakt/Anschrift/Telefon/USt-ID von Martin bestätigt |
| PrivacyLabels | technischer Entwurf | sieheInventar; Betreiber-/Partner-/Fristenentscheidung und reale Betriebsprüfung fehlen |
| Tracking/ATT | kein entsprechender SDK-/Werbepfad im untersuchten Secure-Code | kein pauschaler Laufzeit-/Dienstleisterbeweis; bei geänderter Nutzung neu prüfen |
| Altersfreigabe/KidsCategory | **von Martin nötig** | aktuellen Fragebogen sachlich beantworten; Lehrkraftinhalte variabel, keine automatische4+- oder Kids-Freigabe |
| ExportCompliance | bestehender PlistwertNO, nurOS-TLS/Keychain im untersuchten Code | tatsächliches Endpaket und Vertriebsentscheidung prüfen; keine Vertragserklärung abgegeben |
| Preis/Länder/EU-Händlerstatus | **von Martin nötig** | keine stillschweigende Preis-/Länderwahl oder neuen Verträge |
| Review-Code/-Kontakt | **fehlt** | stabiler veröffentlichter Live-Test mit ausschließlich fiktiven Inhalten; kein kurzlebiger Test- oder bereits beendeter Code |
| iPad-Screenshots | Vorschau vorbereitet, Store-Satz **fehlt** | echte finale13-Zoll-Aufnahmen; Komponentenfixtures nicht als fertig getestete Produktabläufe ausgeben |
| Physische Abnahme | **offen für neuen Kandidaten** | AAC, Timer, früheAbgabe, lokalesOfflineende, Neustart/Nachsynchronisierung, Medien, ältere unterstützteHardware |
| AppReview/Release | **nicht ausgeführt** | erst fertiges Paket und offene Angaben prüfen, dann konkrete letzte menschliche Freigabe |

Die lokale unsignierte/Ad-hoc-Simulatorvorschau meldete einen sicheren Speicherfehler und ist kein Beleg eines Fehlers der Apple-signierten App. Keine Speicherprüfung wurde umgangen. Vorher-/Nachher-Komponentenbilder werden deshalb mit dem bestehenden nativen SwiftUI-Testhost und fiktiven Werten erzeugt; sie belegen das Layout, keine funktionierende Anmeldung, echte Sperre oder serverbestätigte Abgabe.

## Screenshots und Review

Apple verlangt für iPad-Apps mindestens ein13-Zoll-Bild; zulässige Hochformate sind2064×2752 oder2048×2732, Querformat entsprechend umgedreht. Keine Alphakanäle. Geplanter Satz: schlichter Einstieg, Frage mit Antworten, Aufgabenübersicht, bestätigter Empfang. Nur echte Zustände des finalen Builds und fiktive Personen/Inhalte. [Apple-Spezifikation](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).

AAC-Genehmigung ist eine Voraussetzung für diesen Systemmodus, keine pauschale App-Review-Freigabe. Drittanbieter-Tastaturen sind im Produkt gesperrt. Der neue Offlinepfad gibt erst nach überprüfter dauerhafter lokaler Sicherung frei; er bestätigt dabei ausdrücklich noch keinen Serverempfang. Zeitlich unklare Nachübertragungen benötigen Lehrkraftprüfung. Details in `review-notes.en.txt`. [Apple Assessment-Distribution](https://developer.apple.com/documentation/automaticassessmentconfiguration/preparing-an-educational-assessment-app-for-distribution).

## Verbindliche Primärquellen,21.10.2026

- [AppReview/Datenschutzlink/Demozugang](https://developer.apple.com/app-store/review/guidelines/)
- [Datenschutzangaben inkl.Dienstleister](https://developer.apple.com/app-store/app-privacy-details/)
- [RequiredReasonAPI-Kategorien](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype)
- [Verschlüsselungsunterlagen](https://developer.apple.com/help/app-store-connect/reference/export-compliance-documentation-for-encryption/)
- [Altersfreigabe](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)
- [EU-Händlerangaben](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)

Betreiberangaben sind jetzt bestätigt und Rechts-/Supportseiten samt nativer Offlineansicht implementiert. Die öffentliche Bereitstellung ist bestätigt; verbindliche Betriebs-/Vertragsnachweise und die physische Offline-Abnahme bleiben getrennte Gates; ein erfolgreicher Build oder TestFlight-Upload ersetzt sie nicht.

## Öffentliche Rechts- und Supportseiten

Auf Martins Rückfrage wurden [konkrete Textentwürfe](public-information-draft.de.md) und eine [Veröffentlichungscheckliste](privacy-publication-checklist.md) ergänzt. Eine eigene Domain ist nicht erforderlich: geplante `.html`-Seiten können auf der bestehenden Live-Adresse liegen. Diese URLs sind noch nicht veröffentlicht oder in ASC eingetragen. Aktueller Web-Quellstand4f8b7922 enthält KI-Uploadhinweise, aber diese ersetzen keine vollständige Secure-Erklärung. Martin wurde nach tatsächlichem Betreiber, öffentlicher Kontakt-E-Mail und Anschrift gefragt; keine Fakten erfinden. Schulische Rollen, Dienstleisterverträge und Serverfristen bleiben gesondert zu bestätigen.

## Rechtsseiten-Einbindung

Neue maßgebliche Quelle: `native/GradeCrewSecure/Resources/Legal/legal-content.de.json`, identisch zum Webbranch `feature/public-legal-pages-20261021`. Darin alle bestätigten Betreiberangaben und aktuelle Datenschutz-/Support-/Impressumstexte. Die früheren Arbeitsfassungen bleiben historische Dokumente. SwiftUI zeigt die lokalen Texte ausschließlich am Code-/Namenseinstieg; kein Netzwerkaufruf oder externer Link während AAC. Hostingseiten benötigen keine Anmeldung/JavaScript. Vertragliche Schulrollen, verbindliche Aufbewahrungs-/Transfernachweise und Händler-/ASC-Prüfung werden durch die Textveröffentlichung nicht ersetzt.

## Verifizierte Veröffentlichung21.10.2026

[Datenschutz](https://hausaufgabe-staging.web.app/datenschutz.html), [Impressum](https://hausaufgabe-staging.web.app/impressum.html), [Support](https://hausaufgabe-staging.web.app/support.html) ohne Anmeldung erreichbar. Websitequelle39e70b20/PR256 integriert; Hostingversion6e2c90f76d61ad36, alle173Manifest-Dateihashes perHTTPS geprüft.166bestehende Dateien unverändert, nur index/styles plus5Informationsdateien; kein Backend-/Rules-/Daten-/Appdeploy. Neue unabhängige Quellprüfung ohne blockierende Befunde; dedizierte Paket-CI39624491617 und39624481757 success, AdminCI39624491477success. NativeQuellkandidat593076f8/PR257 bleibt Draft, Archiv0.2.3(1132) lokal unsigniert, nicht hochgeladen. Die alten Arbeitsfassungen/Checklisten stellen nicht den aktuellen Veröffentlichungsstatus dar.
