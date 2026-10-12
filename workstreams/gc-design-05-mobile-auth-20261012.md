# GC-DESIGN-05 — direkter Auth-Einstieg und mobile Homepage, 12.10.2026

Bestehende Task GC-DESIGN-05, native Beziehung GC-IOS-02. Root hat den direkten Nutzerauftrag bestätigt: Anmeldung ohne Homepage-Zwischenschritt, Konto erstellen und Passwort vergessen, Crew-Bild und schöne mobile Homepage, alle bisherigen Funktionen und Animationen erhalten, anschließend normales Staging. Keine neue Task-ID, Kostenreservierung, bezahlte Generatorrunde oder Production-Freigabe.

## Zuständigkeit und frische Basis

Root koordiniert. mobile_auth_design ist einziger Web-Produktschreiber in /private/tmp/gc-design-05-mobile-auth-20261012, Branch fix/gc-design-05-mobile-auth-20261012; realer HEAD bei Vorprüfung d6cd4e733e1a3b8e8b63a14058a364389f3f4488. feedback_staging_release besitzt Integration, Release und gemeinsame Dokumente; student_regression_review prüft unveränderliche Kandidaten unabhängig. native_auth_header besitzt nur native Auth-Leiste/Welcome; eigener unsigned Xcodebuild und Draft-PR geplant, keine signierte TestFlight-Auslieferung behauptet.

Main d574d2384b7c85907ca7378aa7fa526c1ed82381, Integration und tatsächliche kanonische Stagingquelle d6cd4e733e1a3b8e8b63a14058a364389f3f4488 /2.3.1-gc36/164Dateien. Live Development Status38270796153 success, generiert12.10.15:31UTC. Relevante ältere offene Web-PRs186/191/218 sind separate Memory/Privacy/Functions-Arbeit, werden nicht still übernommen. Registry warnt über bestehende Brand/bootstrap-Überlappungen zu iOS/Games; neue Quelle bleibt auf exakt aktuellem Webhead. Native Primary9ec318d sendet intent=login bereits; Webroute muss reagieren. Native safeAreaInset/Doppelheader ist Binaryumfang, Hosting allein ersetzt ihn nicht.

FastQuiz eigener channel gradecrew-binomial-20261012, Source2e5f8b8e/fastQuizApi-Hash441ec039… und sein43Dateien-Build bleiben getrennt und unverändert. Kanonischer Release Train/gc36 bleibt als letzter tatsächlicher Stand, bis neue Receipts vorliegen.

## Beschlossener begrenzter Plan

1. Autor nutzt bestehende verschobene Login/Register-Formnodes, Rollen/Auth-Lifecycle und Firebase-Provider. Nur sichere intent-Werte login/register/reset; keine generische Return-URL, Credentials im Link oder neuer Authprovider. Schüler-/Saved-preview-/Querykontext, Gastguard und Restore bleiben erhalten.
2. Passwortvergessen erhält ein echtes Resetformular statt prompt, Aufruf weiterhin bestehender Firebase-Resetdienst. Regressionen in bestehender verpflichtender Bootstrap-Suite beobachten RED→GREEN. Erfolgstext darf keine Accounts aufzählen; Wiederholung/stale Recovery und Fokus/Scroll prüfen. Keine echten Resetmails/Registrierungen als CI-Mocknachweis ausgeben.
3. Existing Crew-/Klassenraumbilder und Tokens, mobile normale Fluss-/Scrollregeln, kurze/tall Fenster, Tastatur/Zoom/ReducedMotion/Pause. Alle vorhandenen CTAs, Touren, Features und Animationen erhalten; keine ganze Spenderdatei, neue Bild-/Fontproduktion oder Produkt-AI-Aufrufe.
4. Früher unveränderlicher Sourcecheckpoint mit genauem Diff/Tests; unabhängiger Scope-/Preservationreview. Danach Releaseowner frischer Zielhead-Abgleich, unterstützter Kandidatenbranch/PR, exakte normale Node22CI, Integration und MergeCI.
5. Bestehende WIF AI/Assessment +HostingPreview mit getrennten tatsächlichen Receipts, dann append-only CanonicalRequest auf hausaufgabe-staging.web.app. Native Draft/source/unsignedbuild separat; neuer TestFlight-Build nur nach konkreter beauftragter Bewertung. Rules nur bei tatsächlichem entsprechend reviewed Änderungsscope; aktueller195d40… Securehash wird erhalten.
6. Gezielter echter lesender Desktop/mobile-Viewport/Authrouting-Smoke und minimaler eigener lokal-vs-Staging-Abgleich. Keine physische Geräte-/native-Binary-/Nutzerabnahme aus Viewport oder Webdeploy ableiten.

## Preservation — verbindliches Releasegate

[Komplette Basis mit164 Pfaden/Hashes und29Crew-PNGs](gc-design-05-gc36-preservation-20261012.json). [Vollständige positive lokale Zuordnung gc35](feedback-full-local-inventory-20261011.json), SHA2563a02d62eb7eb166f15b375086a78f269f808d0edbcb7b4ad383f94429ada4fce.
Kein Basisruntime-/Assetpfad darf still verschwinden. Nur bewusst geprüfte owned Auth-/Layout-/Cachepfade dürfen andere Hashes erhalten; alle29Crew-PNGs unverändert. Coco phone, Remy/Button/Tablet, Recyclingbin, Wilma/Crew-Motive, Start-/Hero-/Paper/Footeranimation, Demos/Pause/ReducedMotion bleiben. Buildreferenzprüfung und alle aktuellen Manifesthashes erforderlich.
Bestehende sichere Audiofrage/private Hörtexte, Color-Markgroups/Gap-Strukturfixes, Saved-preview, QR, Ordering, Admin-Owner/Self/LastAdmin-Grenzen, Assessment-Privatschema, Crew-Memory-/ClearEpoch-/Review-Sync und ET signierter Admin/non-test/loopback-Vertrag erhalten. Kein privater q.text→öffentlicher Auftrag, keine alten LegacyRules. Fremde lokale8772-Arbeit nicht durch Wholefile/reset/force ersetzen.

## Anlassbezogene Assurance

Owner UI/mobile_auth_design, unabhängig student_regression_review, Release feedback_staging_release. SEC03/06/09/10/11: bestehende öffentliche Konfiguration, Auth/Rollen/Session/Passworddienst und Login-/Resetlimits erhalten; UI/Provideraufruf scope, keine neue Server-/Provider-/Ruleskonfiguration. PRIV06/07/09/13/14/15/19: vorhandene Registerfelder/Zustimmung, Datenminimierung, klare gleichwertige Login/Register/Resetwege, CrewALT, Kontrast, Tastatur/Fokus/Scroll und bestehende Assetprovenienz. Status im neuen Diff noch offen/nicht geprüft; alte bestandene Verträge nicht als global frisch auditiert ausgeben. Kein40-Kontrollen-Vollscan, keine rechtliche/schulische Zertifizierung.

## Checkpoint und nächster Schritt

Stand branch_only; noch kein neuer veröffentlichter Sourcekandidat/CI/Deploy. Vor Produktarbeit12/12 vorhandene Entry/Bootstraptests beim Autor PASS; bestehende JSDOM-Cleanup ReferenceError kann mit exit0 erscheinen, offen als Harnessgrenze vermerkt. Historische GC-DESIGN-05-Versuche1/2, frühere CI/Deploys und Reservierungen bleiben unverändert.
Angefordert: Sol6.1/medium Release, Sol6.1/high UI; tatsächliches Runtime-Modell/Usage unbekannt, keine Eskalation wegen Netz/Auth.
Nächster Schritt: unveränderlichen Autorcommit und fokussierte Regressionen abholen; keine frühere Releasekette oder bezahlte Controllerjobs wiederholen.

## Autorenplan vor Implementierung

# GC-DESIGN-05 mobile authentication implementation plan

Goal: existing iOS intent opens the real Firebase login directly; registration/reset reachable; coherent mobile start/auth scenes preserve current gc36 functionality.
Authorized design: Root relay of human approval 2026-10-12, existing GC-DESIGN-05 handoff and screenshots2488/2489. Requested Sol6.1/high; actual runtime model/effort unknown. Base d6cd4e7, main d574d238; fresh fetch successful; Development Status38270796153 success reported by release specialist. Existing repair attempts1/2 preserved, new bounded follow-up, no paid generation/no new budget.
Architecture: existing moved DOM login/register forms and Firebase provider/role lifecycle remain. Add reset DOM form, replace prompt-driven reset handler with real form submit. Initial entry only accepts known login/register/reset intents; no external-return redirect or credentials in URL. Keep existing query context, startup pupil/preview routing, native account restoration and guest cleanup. Native safeAreaInset and sparse native welcome are a separate owner/binary.
Files: gradecrew-entry-flow.js (initial state/reset scene/copy/crew artwork), app.js (reset submit only), gradecrew-auth-startscreen-polish.css (auth panel/mobile keyboard scroll), gradecrew-hero-scene.css (mobile spacing/content fit); startup.js/index.html/app.js cache literals coordinated with release. No whole-file donor snapshots/assets changes.
Brand: existing generated primary/text/muted/surface/border tokens and rounded system type. Keep classroom/Coco artwork as focal point. Mobile home compact normal flow replaces viewport-forced gaps; visible named crew/tutorial/test-code. Auth scene shared existing classroom art with login/register form card; reset plain form. No new fonts/images/animations. Existing motion/reduced-motion/pause controls retained.

Tasks:
- [ ] Add real DOM regressions for initial native intent, login/register/reset/back, query context retention, auth providers reset success/error, repeat guards and no prompt; observe RED.
- [ ] Implement direct entry and reset form with existing provider and guest guard; run bootstrap/entry/short-login/auth generation tests.
- [ ] Apply existing token-based auth/home layout; verify real browser phone/tablet/desktop, small viewport/keyboard scroll/reduced motion, existing CTA/demo/art.
- [ ] Commit/push immutable candidate and send independent reviewer/release owner exact source/tests. Normal Node22 CI/integration/deploy belongs release owner.
Review focus: stale account results and guest mode unchanged; repeat submits/stale recovery updates; reset status must not enumerate accounts; only explicit safe intent selection preserves pupil/preview/context; keyboard focus and scrolling on short/tall mobile and zoom.
Assurance selected with release: SEC03/06/09/10/11; PRIV06/07/09/13/14/15/19. Scope UI/provider invocation only, no server/rules/provider config changes; synthetic mocks not real accounts/resetmail or physical devices; broader controls unverified.


## Gebündelter Folgecheckpoint — Remy, frühe Veröffentlichung und native Grenze

Neue Nutzerlenkung im selben GC-DESIGN-05-Auftrag: „Remy fragen“ am Anfang ersetzen durch **„Keine Zeit? Sag mir kurz, welchen Test du brauchst.“**, kurze Fach/Klasse/Thema/Wünsche-Orientierung. Tatsächliche Platzierung prüft der Autor; keine neuen Remy-Functions oder Generierung. Review prüft Copy/Handler-/Configerhalt, mobile Lesbarkeit.
Früher Webcheckpoint e928156ca45f5683dbf12632e72be0d58bbaefd5/tree96aca52c2a2cc79fd51e42410b3fafd905ea9fb5 mit14/14Tests ist als2e94710f8349a7bb175d3d2f4527b7fd52413f37 veröffentlicht. Source noch ausdrücklich partial, weitere echte Signedout-/Recovery-/CSS-/Viewport-Prüfung beim Autor. Kein finaler Review/CI/Deployclaim. Packaging gc37 und begründete Entry/AuthCSS/HeroCSS-Cacheliterale vor immutablefinal abgestimmt, keine nachträgliche Runtimeänderung nachReview.
CommonDoc d0ae6053 Handoff/ReleaseControl erfolgreich. DevelopmentAudit38278754272 attempt1 scheiterte an meiner zu frühen aktivenPrimary-Umschaltung vor remoteRef; nach author2e947-Veröffentlichung einmal nur read-onlyAudit wiederholt, attempt2/job114913142261 success. Fehlerhistorie bleibt; kein Trigger-/Produkt-/Credentialproblem.
Native PR225 Draft/open Source38bb03b138a3e3284a5a66e4dd60c4d6529e9bbc, basefeature/shared-gradecrew-design-system9ec318da. NativeChecks38279296020/job114912359441 success und unabhängiger ReviewPASS3gezielteTests+iPhone/iPadScreens. VERSION0.1.18 unverändert/buildGITHUB_RUN_NUMBER. Nur Source/unsigned-Simbelege; InteractiveCUA InvalidApp, physisch nicht geprüft. NativePrimary push/merge startet automatische signierte TestFlight-Auslieferung. **Kein Merge vor tatsächlicher Human-NativeDistributionantwort**: Root-asyncJa/OnlyWeb-Frage pending; Vorbelegung ist keine Freigabe. WebStaging bleibt unabhängig bereits autorisiert; CI/Review sind kein Upload.
