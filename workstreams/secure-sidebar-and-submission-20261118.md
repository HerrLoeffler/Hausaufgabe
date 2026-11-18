# GC-IOS-02 / GC-RELEASE-06 — Secure Aufgabenübersicht und Abgabe

Owner: Native-Chat01a10c75-8912-7a12-98f0-c9e78064aa2c. Quelle Secure Live3b537c8ccbbff113ee999524013a1d17d08f4c54. Separater Arbeitsstand /private/tmp/gc-secure-sidebar-source-20261118, lokale Snapshot-Historie nicht als Upstreambasis verwenden. Übertragen wird nur der Patch gegen3b537c8. Native-Worktree-Erstellung g3:184 antwortet weiter nicht; keine zweite parallele Erstellung. Bestehender Icon-Checkout und App-Store1293 unverändert.

## Autorisierung/Vertrag
Martin beauftragt Browser und Secure fertig/live. Zentrale setzt nach erledigtem Apple-Mailauftrag den offenen nativen Teil ausdrücklich fort. Aufgaben LINKS, Übersicht RECHTS, großer Test-abgeben-Knopf unter Übersicht. Desktopmodus ab1024CSSbreite/600sichtbare Höhe; große Schrift kann kompakte Darstellung erzwingen. Webowner01a15f06 setzt Browser separat um; Handoff dort lesend abgeglichen. Secure lädt gebündeltes Exam/index.html, Hosting allein aktualisiert installierte App nicht.

## Aktueller konkreter Code
Ein Antwort-DOM; Gridanordnung ohne Neuaufbau. Navigationsoffset rechts=0, kompakt=gemessene Navigation, 100Aufgabenliste scrollbar, Escape schließt kompakte Übersicht mit Fokusrückkehr. Sidebar sendet ausschließlich requestSubmit an unverändert origin-/mainframegeschützte native Bridge, niemals direkte Abgabe. Native canSubmit und Freeze sperren Button. Breite native Footer-Abgabe ausgeblendet, Speicherstatus sichtbar; kompakter Footer behält Abgabe.

Native Sheet zeigt beantwortet/offen und verlangt ABGEBEN/SUBMIT. Coordinator prüft Wort, aktuellen Versuch, aktive Bestätigung und bisheriges canSubmit. Swipe/Cancel verwirft Bestätigung. Zeitablauf unverändert submit(auto:true), schließt Bestätigung bei Phasenwechsel. Kein Server-/Rules-/Analytics-/Antwortdatenmodell geändert. Gewähltes Secure-AppIcon aus1293 unverändert portiert, Test-App behält separate Identität und neues Live bleibt auf1272-Funktionsstand.

## Nachweise bis17:43CET
Rendererbaseline7PASS; drei neue Regressionen zunächst3FAIL, danach gesamte Renderer23PASS. SwiftPM38PASS (lokale Speicherung/Offline/Policies). Python29PASS. Echter iPad-Simulator1F605F51-D2D6-44D2-816F-690F3AE0F347, eigener leerer Testhost. Erster Testbuild scheiterte wegen noch nicht erzeugtem AppIcon; Ressourcen danach korrekt erzeugt, erneuter realer Lifecyclelauf läuft. Noch kein nativer Lauf als bestanden behauptet. WebKitmatrix erhält gezielte Rechts-/Abgabe-Clipping-Prüfung, bisherige Unter-Header-Annahme nur für echten Kompaktmodus.

DevelopmentStatus mit frischem main-Registry/State ausgeführt18Nov16:39UTC, lokale Root-Historie69f19d9 alt; meldet globale veraltete Branches/Handoffs und PR-Abgleich ohne Token übersprungen, kein Vollgrün behauptet. Neueste zentrale Live-Prüfung44346330053success lesend aus Webhandoff, globale Altlasten nicht Teil dieses Patches.

## Offen
Reale native Lifecycle- und WebKit-/iPhone-/iPad-Layoutabnahme fertigstellen; unabhängiger Review; Patch auf echten Upstreamzweig sichern/PR; alle Releasegates; getrennter neuer TestFlight-Build und tatsächliches Apple-Processing/Verfügbarkeit. Keine neue Store-Einreichung und kein erneutes Apple-Mail.
