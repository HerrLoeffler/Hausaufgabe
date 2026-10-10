# GC-LAUNCH-CONTROLS-01-PRIVACY — aktueller Prüf- und Fixdurchgang

Stand: 10.10.2026. Ausführender Fachagent privacy_fairness_role_setup. Dies ist ein Quellen-/DOM-Audit mit einem begrenzten UI-Kandidaten, keine Rechts- oder Barrierefreiheitszertifizierung.

## Umfang und aktuelle Quellen

- Frisches main: `59dd0a501a28c04c36ee877450239bf1d64a3187`; START_HERE, AGENTS, STATE, TODO, Registry und vorhandene Übergaben gelesen.
- Tatsächlicher Web-/Coco-Integrationsstand: `c3a5fdcfb949bc0de23295a549388c23cf7655e6`. Eigener isolierter Branch `fix/gc-privacy-controls-20261010`; Setup-PR188 und gemeinsame Koordinationsdateien werden nicht verändert.
- Development Status38062748956, Job114244166636 success, Audittext gelesen: PR186/187 bleiben offen, Rollen-/Games-PR184/185 separat; keine konkurrierende Privacy-UI-PR gefunden. Securitypeer besitzt Backend/Auth/Rules und bestätigt meine Pfade index.html, neues Modul und Tests. Main-/Setupintegration gehört dem bestehenden Integrationsowner.
- Canonical-Receipt11643860414 aus Run37986203915 vorhanden; AI-/Assessment-Jobs114007265716/114007265915 aus37985751577 success. Diese frischen Actions-Belege stützen den dokumentierten Stagingstand von c3a5fdcf, sind keine erneute Geräte-/Liveprüfung.
- Frisch bestätigte Games-Branchheads: Pizza Browser `bc92c38bfa35b7f5803fa0105bd98f13ca7fda62`, Pizza Unreal `c7d05339f48614c6cbe1f0f0a35801143b9f8d13`, Lerninsel `a5dc474295dea4abda06c5be8923de1bc0206248`, Expedition `a56b2a6bca8fab0a708dcb3d4e64a6a1d486949b`. Handoffs/README und ausgewählte Quellen per Connector frisch gelesen; keine Engine-/Geräteabnahme. Kein Gamecode verändert.
- iPad-Bridgebranch `4d778ef469b37729a4b1ea9c097a970a43da34c9` frisch bestätigt; Gerätezustand/Store-Veröffentlichung bleiben gesondert. Webinhalte in WKWebView erben die hier dokumentierten Datenflüsse, native SDKs brauchen eigene Binär-/Geräteprüfung.
- ET: lokale vorhandene Gameoberfläche ist kein Nachweis einer Web-/Productionintegration; ihre aktuellen Datenflüsse müssen vom Games-Owner konkret mit dem ausgeführten Build verbunden werden.

## Coco: konkrete Metadaten- und Datenflussmatrix

Runtime-Einstieg ist `functions/package.json -> main.js`, nicht nur das ältere große index.js. `functions/main.js:248–258` verlangt aktive KI-Nutzung, authentifiziertes UID und identisches accountId; `functions/lib/coco-support.js:23–38` implementiert read/reset transaktional. Kein Kontoinhalt wurde gelesen oder verändert.

| Speicher/Feld | Zweck und Grenze im Code | Zugriff / Empfänger | Tatsächliche Frist / Auskunft und Reset |
|---|---|---|---|
| Firestore cocoMemory/{uid}: preferences | Explizite persönliche Hinweise, bis2000 Zeichen | Aktuelles Konto über cocoSupport; bei crewAssistant als Kontext an OpenAI | Kein expiresAt/TTL oder Cleanup im geprüften Code. Dauerhafte Produktabsicht; Fristen-/Vertragsbegründung offen. Neues Settingsmodul zeigt bewusst abgerufene aktuelle Hinweise |
| history | Letzte40 user/assistant-Nachrichten, proText≤1400 Zeichen; neue Nachrichten verdrängen alte | read für dasselbe Konto; maximal12 letzte Nachrichten im Modellkontext | Mengenbegrenzung ist keine zeitliche Frist. Reset leert aktuelle Historie; Backups/Providerlogs getrennt und unbestätigt |
| version / generation | Schema und Schutz vor Wiederherstellung durch verspätete Gerätewrites | Server und Kontoclient; keine gemeinsame Knowledge | Reset erhöht generation und lässt das leere Kontodokument bestehen |
| turnIds / updatedAt | Bis80 IDs zur Deduplizierung, letzte Änderung | Server; read normalisiert diese Felder nicht in die Textauskunft | Bis Ersetzung/Reset, keine zeitliche Löschung gefunden; technische vollständige Kontoauskunft noch offen |
| lastSearch | Schemafeld≤500 Zeichen; aktuelle search-Aktion schreibt es nicht | read liefert vorhandenen Wert; Kontext übernimmt ihn | Kann in historischen Dokumenten existieren; Herkunft/Nötigkeit offen, Reset leert es |
| cocoImageIndex/{uid}/images | Kontogebundene einmalige Bildbeschreibungen für Suche; eigene Testbilder | Servercache; Bildbeschreibung über explizite index_images an OpenAI | Separater Speicher ohne im geprüften Code belegte Frist. Gesprächsreset entfernt diese Bilddaten nicht |
| Eigene Testmetadaten/Feedbackstatus | Aktueller Test und eigene Meldungsstatus, keine Schülerantworten im Coco-Kontext | Ownerprüfung; gefilterte Metadaten an KI bei passender Anfrage | Ursprungsspeicher getrennt; kein Gesprächsreset dieser Daten |
| Crew-Telemetrie/PostHog-Projektion | Erlaubte technische Nutzungs-/Korrektursignale, Tagespseudonym | Server→eu.i.posthog.com, kein Browser-PostHog-Init in untersuchter Stichprobe | Crew-Ereignisse30Tage, Unique-Marker90Tage im Code; Tagesaggregate ohne dortigen Ablauf. Tatsächliche Jobs/Projektretention separat prüfen |

Wichtiger Zweckbefund: `functions/main.js:305–307` lädt Coco-Memory vor der crewId-Verzweigung. Deshalb können auch Remy/Emmi persönliche Hinweise und12 Nachrichten erhalten. Das ist kein belegter fremder Kontozugriff. Die neue Information benennt den tatsächlichen Fluss; eine Änderung zur engeren Zwecktrennung braucht bewusste Produktentscheidung und Security-Abgleich. Allgemeine feste productGuide-Einträge sind davon getrennt; automatisches globales Lernen aus Coco-Rohgesprächen ist nicht implementiert.

## Browser-/SDK-/Speicherinventar

Reproduzierbarer [statischer Bericht](privacy-web-source-20261010.json), erzeugt mit tools/privacy-audit/static-web-audit.mjs. 48 Speicherzugriffsstellen in neun relevanten Webmodulen; kein Auslesen realen Browserstorage.

| Quelle | Gespeicherte Funktion / Zeitraum | Offene Einordnung |
|---|---|---|
| app.js / Tourmodule / i18n-runtime | Kontogebundene Tour-/Previewmarker, Sprache, Timer, Vorlage in local/sessionStorage | Eigene gewünschte Funktionen; konkrete Zwecke/Laufzeiten öffentlich dokumentieren, nicht pauschal Banner einbauen |
| secure-assessment-client / secure-student | Attemptcredential lokal, Antworten im Sessionentwurf | Schutz-/Retentionprüfung zusammen mit Security; Browserprofil ist kein getrenntes Schülerkonto |
| secure-draft-persistence.js | Zusätzlich persistente Schülerantworten für Restart;12h Maximalalter, Abgabe entfernt aktuellen Entwurf; alte Entwürfe werden nur für aufgerufenen Test bereinigt | Nicht als garantiert12h weltweite Löschung bezeichnen. Geteilte Schulgeräte und nicht erneut aufgerufene Tests brauchen abgestimmten Cleanup-/Hinweisweg |
| editor-drafts.js | IndexedDB testify-editor-drafts, UID:Quiz-Key, Aufgaben/Bilder, keine zeitliche Bereinigung gefunden | Dauerhafte Entwurfsabsicht vs Löschweg/Shareddevice-Risiko konkret entscheiden, nicht ungefragt Inhalte löschen |
| review-store.mjs | Lokale Review-Notizen/Anhänge in IndexedDB | Eigene lokale Arbeitsdaten; Lösch-/Auskunftsumfang separat inventarisieren |
| Firebase CDN/Auth/Firestore/Functions | gstatic12.4.0-Module, Auth und projektspezifische Dienste | IPs/Identifikatoren, tatsächliche Regionen/Verträge und Kontoeinstellungen belegen; kein Deutschlandversprechen |
| Web Speech API | Spracheingabe im Browser, Browserimplementation kann extern verarbeiten | Hinweis vor Mikrofonnutzung und reale Plattform-/Sprachdatenprüfung fehlen; Browserpermission allein ist kein vollständiger Transparenztext |
| Pizza Browser src/main.mjs | gc-pizza-v1-Spielstand auf dem Gerät, kein Onlinekonto in aktuellem Pilot | Lokale Übung, keine aktive Schulabgabe. Frist/Löschen auf gemeinsamem Gerät offen |
| Native Games | SaveGame/Saved-Verzeichnis; Pizza/Expedition-Handoffs beschreiben lokale Fortschritte und separate Testslots | Kein nachgewiesener Online-Tutor-/Schülerbridgebetrieb. Engine-/Storetelemetrie und konkrete ausgelieferte Assets bleiben eigene Prüfschritte |

## Kontrollledger PRIV01–20

Status bezieht sich auf den genannten Quellumfang: **erfüllt** nur für konkret geprüfte Teilanforderung; **offen** für belegte Lücke; **nicht relevant** nur begrenzter aktueller Runtimefall; **nicht geprüft** für fehlende externe/Liveevidenz. Keine Zahl misst Konformität.

| ID | Anwendbarkeit und heutiger Beleg | Tatsächlicher Befund / Maßnahme / nächste benötigte Tatsache |
|---|---|---|
| PRIV01 | Web/KI, native App und zukünftige Schüler-/Gamebridge; index.html Materialdetails, keine Rechtslinks im statischen Dokument | **offen**: vollständiger öffentlicher Informationsweg für Konto/Coco/Telemetrie nicht nachgewiesen. Kandidat ergänzt konkrete Memoryinformation; Betreiber/Rollen/Empfänger/Fristen bleiben für Gesamttext nötig |
| PRIV02 | Konten-/Vertragsnutzung; Authform in index.html, keine Nutzungsbedingungenlinks dort | **offen / extern nicht geprüft**: keine aktuellen Bedingungen gefunden. Betreiber muss tatsächliche Vertragspartner/Nutzungsarten liefern; keine erfundenen AGB hinzufügen |
| PRIV03 | Erstattungen bei Verkauf; kein Checkout/Bezahlflow in geprüften index/entry/Pilotquellen | **nicht relevant für diese Runtimeflows**, externes Angebot **nicht geprüft**. Verkauf/Vertrags-/Verbraucherumfang konkret bestätigen; bei Einführung neu prüfen |
| PRIV04 | localStorage/sessionStorage/IndexedDB plus Firebase;48 belegte Stellen | **offen**: Zwecke/Laufzeiten bisher nicht zusammen öffentlich beschrieben. Inventar oben liefert Grundlage, Runtimecookies/Netzwerk noch nicht gemessen |
| PRIV05 | Einwilligung nur passend zu Endgerätezugriff; kein Browser-PostHog/gtag in Stichprobe | **nicht geprüft**: kein Beleg für pauschale Bannerpflicht. Nach Runtimeinventar Erforderlichkeit je Zweck bewerten; serverseitige Analytics separat DSGVO prüfen |
| PRIV06 | Registrierung, Materialupload, Feedback, Mikrofon; index.html:345 Checkbox standardmäßig leer, Materialdetails vorhanden | **erfüllt für nicht vorangekreuzte Materialbestätigung im Quellcode**; Gesamtbereich **offen**: Formzwecke/Rechtsgrundlagen und Sprachverarbeitungshinweis prüfen. Nicht jedes Formular benötigt Einwilligung |
| PRIV07 | Schüler-/Kontodaten, Uploads, Coco, lokale Entwürfe und Telemetrie | **offen**: keineTTL für Memory/Entwürfe, der12h-Entwurfs-Cleanup ist zugriffsabhängig; Remy/Emmi erhalten Coco-Kontext. Matrix und Settingskandidat sichern Kontrolle; konkrete Zweck-/Fristenentscheidung nötig |
| PRIV08 | Firebase/Google, OpenAI, Server-PostHog, Phaser-Browserpilot, UE/native Shell | **offen**: Codeempfänger bekannt; AVVs/Unterauftragnehmer, reale Regionen/Transfers/Kontoeinstellungen fehlen. API store:false ist nicht Nullretention; keine Providerlaufkosten erzeugt |
| PRIV09 | Cancel/Reset/Registrierung/Tutor/Game-Pause; PR186 entfernt Chatverwaltung, alternative eigene Bedienung fehlte | **offen, Fixkandidat getestet**: eigener Settingsabruf mit Abbrechen und zweiter Resetbestätigung. Kein Chat-Editor, keine automatische Löschung. Weitere Signup-/Abo-/Gameflowprüfung nicht abgenommen |
| PRIV10 | Preise/KI-Kosten; index.html nennt mögliche Kosten; kein Kaufcheckout in Stichprobe | **nicht relevant für fehlenden Checkout**, kommerzieller Umfang **nicht geprüft**. APIbudget ist kein bestätigter Kundenpreis; echte Preismodelle vor Aussagen klären |
| PRIV11 | Reviews/Testimonials; keine in index/entry/hero-copy und Pizza-Pilot gefunden | **nicht relevant im untersuchten Copyumfang**, Stores/externe Seiten **nicht geprüft**. Bei Testimonial/Storeangebot Herkunft prüfen |
| PRIV12 | Freigabe-/Marketingcopy; app.js kopiert Fragen/Settings, keine submissions | **offen, enger Fixkandidat**: „keine Schülerdaten geteilt“ ersetzt durch „keine Schülerabgaben kopiert“ plus Prüfung von Personenangaben in Inhalten. Keine unbelegte Anonymitäts-/Fehlerfreiheits-/Deutschlandbehauptung ergänzen |
| PRIV13 | Bilder/Aufgaben/Canvas/3D; statisches index enthält keinen img ohnealt | **erfüllt nur für Attributvorhandensein**. Qualität/dynamische Aufgaben **offen**: generisches „Abbildung zur Aufgabe“ und bildbasierte Antworten können unzureichend sein. Suchbeschreibung≠Screenreaderalternative; keine Lösung vorwegnehmen |
| PRIV14 | Text/Controls/Fokus in Web/iPad/ET/Spielen; styles.css definiert klare Text-/Cardfarben | **nicht vollständig geprüft**: keine gemessenen tatsächlichen composited States/Geräteabnahme. NativeHandoffs nennen Kontrastkorrektur, kein vollständiger Nachweis. Normal-/Fokus-/Fehler-/Disabled-Zustände messen |
| PRIV15 | Vollständige Keyboard-/Fokusabläufe; statischeControls allebenannt; PizzaSVGstücke tabindex/Enter/Space, Winkelrange | **erfüllt nur für ausgewählte Quellpfade**; Gesamtprüfung **offen**. MobileCocolauncher blendet Textspan aus und Bildalt istleer, ohnearia-label droht namenloser Button; Chatdatei gehört anderemOwner. NativeKeyboardtests sind keine Screenreader-/Geräteabnahme |
| PRIV16 | Tatsächlicher Anbieter für Website/Stores; kein Impressumlink in geprüftem index | **offen**: Anbieteridentität und konkrete Informationspflichten ungeklärt. Keine Kontaktdaten aus Git-Commitmetadaten als Geschäftsangaben übernehmen |
| PRIV17 | Reale Schüler-/Schulnutzung; ASV-Architektur aufmain ist Zielbild, aktuell Schülerfeld Name oder Kürzel | **offen / extern nicht geprüft**: Schule/Bundesland, Verantwortlichkeit, Zweck/Rechtsgrundlage, AVV/DSB/DSFA-Erforderlichkeit konkret bestätigen. Kein pauschaler Elternconsent; Pseudonym weiterhin personenbezogen |
| PRIV18 | Marketing vs Kontomail; app.js sendet Firebase Passwortreset, keine Newsletterfunktion gefunden | **nicht relevant für untersuchte operative Passwortmail**; Marketingbetrieb **nicht geprüft**. Keine Werbeabmeldungspflicht aus Passwortreset ableiten; externe Kampagnen/Anbieter bestätigen |
| PRIV19 | Webcrew/Brand, Fonts/Bilder, Phaser, UE/3D/Sounds/PDF/Store | **offen**: Brandmanifest enthält Namen/Rollen, keine Lizenzmetadaten. BRAND_CORE nennt Martins Vektorzeichnung; eigene prozedurale Assets sind Herkunftsbelege, keine vollständige Rechteprüfung. Drittpakete/Referencebilder/Generatedassets und erforderliche Notices inventarisieren |
| PRIV20 | Kontodaten/Coco/Uploads/Tests/Logs/Backups; bestehender read/clear und servergeneration | **offen, begrenzter Fixkandidat getestet**: Settings zeigt aktuelleTexthistorie/Hinweise und bestätigtReset. Vollständige Kontoauskunft/-löschung, technischeMetadaten, Images/Feedback, Provider-/Backupfolgen und Schulfristen sind weiterhin getrennte offeneAufträge |

## Fixkandidat und tatsächlich ausgeführte Prüfungen

Neue coco-account-privacy.mjs + begrenzte index.html-Card/moduleScript, präzise Copy und Aufnahme in explizite tools/build-staging.mjs-Dateiliste. Keine Backend-/Rules-/Chat-/Auth-/Startupänderung; PR186 bleibt separat. Textanzeige über textContent, keine Export-/Editfunktion, kein Provideraufruf. Accountwechsel invalidiert PendingReads und vorbereitetenReset, auch A→B→A. UnknownResetOutcome verlangt frischenAbruf vorRetry; Reload nach bestätigtemReset bewusst und transparent, servergeneration verhindert alte Writes. NeueGespräche können danach weitergespeichert werden.

Sechs neue DOM-Verhaltenstests erst rot, dann grün: bewusstesRead/XSS-sichereTextanzeige; zweistufigReset/Cancel; lateRead A→B→A; Kontowechsel vorReset; lateResetantwort; unbekanntesResetresultat ohneBlindretry. Zehn vorhandene BackendMemorytests und drei Entrytests bestanden, zusammen19. Der bestehende Entryharness meldet einen MutationObserver-Teardown-ReferenceError trotz bestandener Assertions; kein Browserfehlerbeweis. Syntax/diffcheck bestanden. Statische Labels/alt/Buttons bestanden,48Speicherstellenund0Rechtslinks nachgewiesen. Browser/Geräte-/RuntimeNetworkprüfung ist gesondert, CUA-IAB nicht verfügbar; Webtool konnte Staging nicht abrufen.

## Noch benötigte Fakten — nach maximalem Quellenabgleich

1. Betreiber: juristische Identität, ladungsfähige Kontaktangaben und tatsächliche Vertragspartner/öffentliche Zielmärkte. Gitmetadata genügt nicht.
2. Schule: konkrete Schule/Bundesland/Schulart, verpflichtende/freiwillige Nutzung und welche Daten/Leistungsnachweise tatsächlich verarbeitet werden; Verantwortlicher/DSB.
3. Verträge: AVV Schule–Betreiber, Google/OpenAI/PostHog-Vertrags-/Unterauftragnehmer-/Transfernachweise; reale FirebaseAuth/Firestore/Storage/Backup- und Providerkonfiguration ohne Zugangsdaten.
4. Retention: begründete Fristen und Lösch-/Exportzuständigkeit pro Kategorie, insbesondere Leistungsnachweise, Memory, lokale Shareddeviceentwürfe, Bildcache, Logs und Backups. Kein pauschales30Tage-Löschen.
5. Produktentscheidung: ist der tatsächliche gemeinsame private Memorykontext für Coco/Remy/Emmi gewollt oder soll er assistenzspezifisch begrenzt werden? Kein fremdes/globales Lernen implementieren.
6. Verkauf/Mails: vorhandene externe Angebote/Abos/Checkout/Stores und Werbemailanbieter, sonst begründete Nichtrelevanz eng auf bisherigen Flow belassen.
7. Rechte: Assetherkunft/Lizenzen einschließlich von Martin bereitgestellter Referenzen, KI-/Stockbilder, Schrift-/Engine-/Paketnotices sowie öffentliche Verwendungsrechte.
8. Geräte-/Accessibility: aktueller tatsächlich ausgelieferter iPad-/ET-/Gamebuild und Zielgeräte für vollständige Tastatur-/Screenreader-/Kontrastabnahme.

## Aktuelle Primärquellen und Schlussgrenzen

- [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679): Informations-/Rechte-/Zweck-/Vertrags-/Sicherheitsprüfung je Verarbeitung. Art8 nicht pauschal für alle Schulszenarien; Löschrechte können Aufbewahrungsanforderungen gegenüberstehen.
- [Schuldatenschutz Bayern](https://www.km.bayern.de/recht/datenschutz-an-schulen) und bestehende ASV-Dokumentation liefern schulische Rollen-/DSB-Prüfwege, keine bundesweite Freigabe.
- [§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html): notwendiger Endgerätezugriff kann ausgenommen sein; tatsächlich optionale Zwecke zuerst feststellen.
- [§7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html), [§5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html): Werbemails und Anbieterpflichten anhand des konkreten Betriebs prüfen.
- [WCAG2.2](https://www.w3.org/TR/WCAG22/), [BFSG-Anwendungsbereich](https://www.gesetze-im-internet.de/bfsg/__1.html): technische Tests und gesetzlicher Anwendungsfall getrennt; vier Screenshotkontrollen sind keine Vollzertifizierung.
- [FirebasePrivacy](https://firebase.google.com/support/privacy): AuthUS-only laut aktueller Dokumentation; Regionswahl ist dienstspezifisch. Reale Projektdaten/Verträge sind damit nicht ausgelesen.
- [OpenAIAPI-Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data): standardmäßig keinTraining ohneOpt-in, separateMissbrauchs-/Zustandsretention. store:false ersetzt wederProviderkontoprüfungnochDPA/Transferkonzept.

Nächster konkreter Schritt nach diesem Kandidaten: unabhängiger Securityreview des Settingsmoduls und exaktenBuilds; dann bestehenden Integrationsowner mit Diff/CI/Restfakten beauftragen, keinen parallelen Deploy starten.
