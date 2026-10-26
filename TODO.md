# GradeCrew — Runtime-Unteraufträge

Zentrale Prioritäten und Releasezustände stehen auf aktuellem main.

- [ ] GC-TEST-CARDS-20261018 / Dashboard-Testkarten: Papierkorb oben rechts ohne Aufklappen; nach Martins Klarstellung entfällt die doppelte Beenden-Aktion, der Veröffentlichungsschalter übernimmt das bestätigte Schließen des Schülerzugangs. Entwurfs-PR #329 wird aktualisiert; GitHub-Mergestatus vor Integration klären. Preview/CI/Production offen. [Übergabe](workstreams/test-card-unification-20261018.md).


- [ ] GC-WEB-REPAIR-20261007 / mobile Schüler-Browseransicht: Abgabe nur am Testende, sticky Aufgabennavigation, echtes GC-Logo. Isolierter Branch fix/staging-feedback-mobile-student-20261019; lokale28/28 gezielte Tests und Chromium375/390/1280 grün. Review/CI/interne Testvorschau noch offen, kein Schul-/Live-Deploy. Übergabe: workstreams/mobile-student-chrome-20261019.md.

- [ ] GC-DESIGN-05 / Homepage25Oct: Nutzer hat gradecrew.de-Veröffentlichung beauftragt. Zehnteilige freigegebene Demo wird getrennt von der bestehenden Live-App auf9497e756 paketiert; Bestandslinks bleiben erhalten. Auth303/visuelle265/300 bleiben getrennt. Entstehungsweise und KI-Grenzen unter docs/learning/HOMEPAGE_QUESTION_CREATION.md; Blueprints und Originalpläne dauerhaft sichern. Übergabe workstreams/homepage-release-20261025.md. Veröffentlichung noch offen.


## 26.10.2026 · GC-DESIGN-02 / GC-CREW-AI-04 · Remy-Eingaben live
Explizit freigegeben: Eckdaten oben klar beschriftet und von inhaltlichem Wunschfeld direkt unter Thema getrennt, je eigenes Mikro; dauerhafte Vorlieben klar benannt. Hosting-only gradecrew.de/hausaufgabe-staging, Produkt5f61f723, Versionc7668d2a1d4493fc; alle192Dateien öffentlich geprüft, Livegastformular sichtbar. Backend/Rules/Daten unverändert.114gezielte+27unabhängigeTests, keinneuerGitHubCI-/Gerätenachweis. NächsterSchritt normalerKontonutzertest. DieseDokumentationvorerstnurauf lokalemAufgabenbranch; GitHubPush bleibt separatblockiert. [Übergabe](workstreams/design-dashboard-v1.md) · [Receipt](workstreams/remy-intake-live-receipt-20261026.json).


## 26.10.2026 · GC-DESIGN-05 · direkter Schülerzugang
SeparategeprüfteVorschau aufstudent-entry-20261026-rajfogts: Headerbutton→secure-student.html mitCodeundName/Kürzel, untererSchülerlinkentfernt; bestehende sichereStreckevonPR312/7cfweiterverwendet, keineLehrerAuth/Logout/Server-/Rulesänderung. Produktdda1ff92,105betroffeneTestsund31unabhängiggrün;NamevorÜbernahmefalstest-/ablauf-/vorhandenerAttemptgeschützt. 192DateienBuildund8geänderteHTTPassetsgeprüft, DE/EN/390/1024Browserabnahme; echteGeräteoffen. Livefreigabeausstehend;keinProductiondeploy. [Übergabe](workstreams/student-entry-header-20261026.md). GitHubKoordinationnochlokal,nichtgepusht.


## 26.10.2026 · GC-DESIGN-05 · Authdesign und Schülerzugang als getrennte Vorschauen
Schülerpreview1e434886 (192Build-Dateien/107relevanteTests) undAuthpreview77428290 (193Build-Dateien/final452RootUItests, unabhängigeAuthreviews35+14Checks)lokalgesichertundaufgetrenntenHostingchannelsüberprüfbar. Homepagebutton→Code+NameohneAlt-Homepage/Lehrerkonto; untenentfernt. Login/Register/Reset imaktuellenblauenHomepage-Stil mitbestehendenAccount-/Reset-/Autofill-/Routeverträgen, Inlinefehler/Pending/DEEN/KeyboardMobil. KeineNative-/Backend-/Rules-/Authdomainänderung; physischeGeräteabnahmeundGitHubCIoffen. NameURLfrei/einmaligerTabhandoff; UILocaleüberLinkserhalten, Testcontentlocaleunverändert. LivefreigabeundGitHub-Sicherungexplizitangefragt, nochkeineProductionänderung. [Schülerübergabe](workstreams/student-entry-header-20261026.md) / [Authübergabe](workstreams/auth-brand-alignment-20261026.md), getrenntePreviewreceipts. DiesesTODO/HDFCommitistnur lokal undnichtalsMain-Syncauszugeben.

26.10. Schüler-Vorschaukorrektur nach Martins Abnahmebild: Produkt d295f9a8, echtes Logo prominent zentriert, schmaleres Formular mit Testcode/Dein Name/Zum Test; keine Kürzel-/Konto-/Kleingedruckttexte und kein doppelter Rückweg. Nur Previewkanal aktualisiert, ausdrücklich vorerst keine Liveveröffentlichung. 107 relevante Tests + 27 abschließende Modus-/i18n-Tests grün, sechs HTTP-Dateien/Manifest mit Build identisch; Browser DE/EN/390x844/1024x768, Logo-Rückweg und Pflichtfeld geprüft. Geräteabnahme offen. Nachweis in workstreams/student-polish-preview-receipt-20261026.json, Code/GitHub-Koordination lokal gesichert, kein Push.

Schüler-Zentrierung auf Wunsch korrigiert: adfb3bed nur Preview; kurzer Hinweis, Logo/Form dynamisch gemeinsam mittig. 27Tests grün, HTTP-Hashes geprüft, 320/390/1024/1280 Browserkontrolle; bei zu kleiner Höhe scrollbar. Aktuelle Liveentscheidung Schüler bleibt ausdrücklich Vorschau. Nachweis workstreams/student-centering-preview-receipt-20261026.json.
