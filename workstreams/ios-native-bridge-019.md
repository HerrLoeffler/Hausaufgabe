# GC-IOS-02: native Dateibrücke 0.1.9

Aktualisiert: 06.10.2026. Verantwortlicher Chat: Codex-Fortsetzung von L APP GC; aktueller Chat-Link unbekannt. Ursprünglicher Chat: chatgpt-conversation://6abc4182-bd00-83ed-8479-1f2cb78f552d.

Eigener Checkout/Branch: feature/ios-native-bridge-019-20261005. Basis: kanonischer App-Branch feature/shared-gradecrew-design-system @ 79598be8. Keine Produktänderungen vor diesem Checkpoint; lokale generierte Xcode-/Icon-Dateien sind uncommittiert.

Lokaler 0.1.8-Foundation-Test und regulärer unsigned Xcode-27-Build erfolgreich. Sandbox blockiert SwiftUI-Compiler; regulärer Build bestätigt Umgebungsursache. Letzter bestätigter TestFlight-Upload 0.1.8 (18), Run 37076301215; Gerätetest und Apple-Verarbeitung unbekannt. Aktuelles main 8360bc5f, Development Status 37358629953 erfolgreich; kein konkurrierender iOS-PR.

Scope und Plan: docs/superpowers/specs/2026-10-06-ios-native-bridge-design.md und docs/superpowers/plans/2026-10-06-ios-native-bridge.md. Nutzer hat nach dem beschriebenen Bridge-Vorhaben ausdrücklich „weiter arbeiten“ beauftragt; Umsetzung erfolgt in diesem Chat.

Production unverändert. Keine bezahlten Provider-Aufrufe, keine Deploys, keine laufenden externen Starts. Vorheriger Build wurde am 05.10. durch Nutzungsfehler der automatischen Approval-Prüfung abgelehnt und nicht ausgeführt; kein unbekannter Build/Upload daraus.

Nächster Schritt: Foundation-Dateivertrag mit zuerst fehlschlagenden Verhaltenstests implementieren.

## Umsetzung und lokale Nachweise

- 0.1.9 umgesetzt: Foundation-Dateivertrag, WKScriptMessageHandlerWithReply, Blob-Export-Adapter, native Teilen-Ansicht/Popover, Abbruch/Cleanup und tatsächlich geladene Domain/Web-Manifest-Diagnose.
- Keine Produktdependencies, kein Web-Code-Nachbau, keine Änderung der bestehenden TestFlight-Upload-Pipeline.
- 06.10.2026: Routing, Navigation/Download, Foundation-Datei-/Dokumentzustand und 12 JavaScript-Verhaltenstests lokal grün. Vollständiger unsigned Xcode-27-Build: BUILD SUCCEEDED.
- Review von 79598be8 bis 05c4c47 identifizierte zwei wichtige Befunde. Test-first korrigiert: unhandled ZIP/DOCX/MIME-Fallback mit originalen Blob-Bytes; wiederhergestellter alter Dokumentzustand nach abgebrochener/Download-Navigation. Verspätete Navigation-Callbacks werden gegen die aktuelle WKNavigation geprüft.
- Test-Umgebungsfehler: nicht normalisierte Cachepfade mit /../ ließen Swift denselben Foundation-Cache doppelt laden. Wiederholung mit identischem absoluten Cachepfad vollständig grün; kein Produktcode-Fix hierfür.
- Grafische Xcode-Steuerung meldete am 06.10. noWindowsAvailable. Projekt erzeugt und mit xcodebuild erfolgreich kompiliert; kein GUI-/Simulator-/Gerätenachweis daraus.
- Review ausgenommen: physische Präsentation, tatsächliche iPhone/iPad-Abnahme, Apple-Verarbeitung und TestFlight-Freigabe.
- GitHub-/CI-Sicherung ist der nächste Schritt; neuer 0.1.9-Upload noch nicht gestartet. Historischer 0.1.8-(18)-Nachweis bleibt separat.


## 12.10.2026 — GC-DESIGN-05 mobile auth / GC-IOS-02 Native-Anteil

Ausführender Owner: `/root/native_auth_header`, Zentrale koordiniert. Bestehende Tasks, Budget-/Versuchshistorie erhalten; keine zweite Task. Chat-Link unbekannt. Angefordert Sol6.1/medium für begrenzten Native-UI-Scope, tatsächliche Runtime/Usage unknown.

Sauberer eigener Checkout `/private/tmp/gc-native-auth12`, Branch `fix/gc-ios-02-auth12-native`, Basis frisch von `feature/shared-gradecrew-design-system` @ `9ec318da0955e059e33057bb61102729d36a2a57`. main-Regeln einschließlich START_HERE, AGENTS, STATE, TODO, Registry, CHAT_CONTRACT, CHAT_RECOVERY, Assurance/Skills gelesen. Development Status38270796153 / Job114884263777 erfolgreich und Log geprüft; offener PR145 betrifft historische Dokumentation, kein konkurrierender aktueller Native-Source-PR gefunden. Native Primary hat keine aktuelle ios-app-v2.md; historischer main-Handoff bleibt separate Quelle.

Beide Nutzerbilder IMG_2488/IMG_2489 betrachtet. Ursache: TeacherRootView fügt über dem bestehenden Webkopf eine zusätzliche Start/GradeCrew-Zeile ein. Begrenzte Änderung allein in TeacherRootView: Start als explizit zugänglichen Haus-Iconbutton in kompakte untere Safe-Area-Navigation verschoben (44×44pt Ziel); Web behält eine Kopfzeile. Signed-out-Einstieg nutzt vorhandene reviewed GradeCrewBrandSignature mit demselben Startzeitpunkt und Copy „Willkommen zurück in der Crew“. Sicherer signInURL, Auth-/Cookie-/Session-/Bridge-/Download-/Share-/Diagnose- und Remy-Dateien unverändert. Webauthor besitzt Authform/Register/Reset. Keine Assets neu erzeugt, keine neue Firebase-/SDKarchitektur.

Relevante Assurance: SEC04/06 Authgrenze durch unveränderten sicheren URL-/Bridgevertrag erhalten; SEC20 Regression mittels bestehenden Native-Suiten/unsigned Build zu prüfen. PRIV14/15 lesbare Bedienung/Bewegung: vorhandene Reduce-Motion-/Crew-A11ybehandlung wiederverwendet, Start explizit beschriftet; physische große-Schrift-/VoiceOverabnahme nicht geprüft. Andere Daten-/Kosten-/Retentionkontrollen nicht relevant für reines SwiftUI-Layout ohne Datenpfadänderung.

Checkpoint: Sourcefix implementiert; sieben bestehende Native-Suiten (BetaURL, Navigation, Bridge, Home, BrandMotion, Atlas, Layout) und regulärer unsigned Simulatorbuild erfolgreich. Physische Geräte-/CI-Abnahme offen. Status branch_only. Kein Upload/Signing/TestFlightstart, kein Webdeploy/Production. Nächster Schritt: vorhandene native Routing/Bridge/Brand-Suiten und regulären unsigned Simulatorbuild ausführen. Gemeinsame TODO/STATE-Aktualisierung durch releaseowner `/root/feedback_staging_release`.


Nachweisupdate12.10: regulärer unsigned Simulatorbuild nach kompakter 44×44pt-Iconnavigation erfolgreich (`/private/tmp/gc-native-auth12-xcode.log`).15native Bridge/Auth-JS-Verhaltenstests grün; completePNG-/truncatedUpload-Regression und80drawable transparente Crewframes grün. Bestehende TestFlightpipeline unverändert; VERSION0.1.18. Kein neuer Upload. HTTPSgitpush mangels CLI-Anmeldung nicht ausgeführt; legitime GitData-Connectoranmeldung hat bytegleichen Baum `dcedc4db6fe8c297c1d15ce40359549b2eaed5d3` unter Commit `de9cd198a8049f5da04ba14eb837e64d046f97f1` gesichert. Lokaler567e20d hat denselben Sourcebaum; unterschiedliche Commitmetadaten sind keine zweite Implementierung.

NativeSigned-outScreen im eigenen frischen iPhone18Pro-Simulator (402ptBreite/iOS27) tatsächlich gerendert und betrachtet: `/private/tmp/gc-native-auth12-fresh-welcome.png`. Crew/Copy/CTA innerhalb des sichtbaren Bereichs. CUA löst Simulator weder per Name noch vollständigem Apppfad auf (`Invalid app`); daher CTA/Keyboard/Webheader/Home-Tap bisher nicht interaktiv geprüft. Sourcebeleg: safeAreaInset reserviert44pt außerhalb des Webcontents, keine overlay-Verdeckung von Coco/Admin/Student; normale SwiftUI-Tastatur-SafeArea unverändert. Physische iPhone/iPad-/VoiceOver-/großeSchriftabnahme offen.

Neue direkte Nutzersteuerung durch Zentrale: NativeHome-Remykarte Titel „Keine Zeit?“, Unterzeile „Sag mir kurz, welchen Test du brauchst.“; `action: openRemy`, Aufnahme-/Formular-/Generierungslogik unverändert. Webauthor informiert, keine parallele Copyänderung. Nächster Schritt: Copycandidate unsigned kompilieren, draftPR gegen tatsächlicheIOSprimary und unabhängigenReview über bestehenden Reviewer abholen; Signing/TestFlightdistribution braucht gesonderte konkrete Freigabe.
