# GC-IOS-02 — Direkter Einstieg der Lehrkräfte-App, 22.10.2026

Ausführender Native-Fachchat dieses Gesprächs, Link unbekannt. Direkte autorisierte Delegation aus GradeCrew-Zentrale: App ohne vorgeschalteten Remy-Auswahlschirm und zusätzlichen Hausbutton. Homepage nicht betroffen. Abgemeldet vorhandene native Anmeldung mit Registrierung/Reset, angemeldet direkt eigene Tests. Remy-Code/Assets und normale Website-Navigation behalten. Kein Secure-/Web-/Backend-/Storewechsel aus diesem Teilauftrag.

Basis `1f206aed95ceccd22cd738ca67f68ae8ca857383`, Ziel `feature/native-live-staging-20261018`; eigener Branch `fix/teacher-direct-entry-20261022`, eigener Checkout `/private/tmp/gc-teacher-direct-entry-20261022`. Nativer create_worktree-Aufruf scheiterte an „Not a git repository“ im Chat-CWD; danach dokumentierter git-worktree-Fallback, keine fremden Checkouts umgeschaltet. Main-Einstieg/AGENTS/TODO/STATE/Registry/Assurance sowie tatsächliche Native-Übergaben gelesen, letzter Development Status39781211412success; SecurePR277 inzwischen integriert, eigene Teacher-Dateien ohne konkurrierenden offenen Code-PR. Paralleler Secure-TestFlightlauf39781850861 bleibt unangetastet.

## Änderung

- Bestehende native Anmeldung bleibt direkt sichtbar, solange abgemeldet. Nach bestätigter Anmeldung/Sitzungswiederherstellung ruft der App-Rahmen automatisch die vorhandene `openWorkspace`-Bridge auf. Erst deren Dashboard-Bereitschaft zeigt die Webansicht.
- Während Auth checking wird alter Webinhalt unsichtbar und nicht bedienbar; bestätigter Kontowechsel erzwingt erneut den bestehenden Dashboard-Einstieg. Login-/Logout-/Resetverfahren und Web-DOM bleiben unverändert.
- Zusätzliche untere native Hausleiste entfernt; Website-Navigation nicht verändert. Native Remy-Auswahl, QuickRemyView, Sprach-/Formularlogik und sämtliche Assets weiterhin im Code, aber nicht mehr vorgeschaltet.
- In-flight-Einstiegsbesitz ist an Authgeneration gebunden; eine alte Antwort/alte Cleanup-Routine kann einen neueren Konto-Einstieg nicht freigeben oder dessen Ladestatus zurücksetzen.

## Tatsächliche Prüfung / Grenzen

Neue Richtlinienassertionen zuerst rot wegen fehlender Workspace-Sichtbarkeits-/Automatikpolitik, danach grün: abgemeldet/prüfend keine eigene-Testansicht, bestätigte Anmeldung automatischer Workspacebedarf, nach Öffnen keine Wiederholung, checking versteckt alte Ansicht, Accountwechsel zurück in kontrollierten Einstieg, Remy/Logout-Invalidierung erhalten. Alle15Teacher-Python-Prüfskripte einschließlich vorhandener Swift-Kompilerprüfungen bestanden.62Node-Tests Auth/Bridge/Workspace/Remy bestanden; erster Nodeaufruf scheiterte nur an fehlendem jsdom-Suchpfad, danach bestehende Installation mit identischem Lockfile verwendet. Release-Simulatorbuild für generisches iPhone/iPad erfolgreich. Kein TestFlightupload/physischer Gerätetest oder vollständiger echter Lehrerlogin mit Kundenzugangsdaten behauptet. Echte Simulator-Einstiegsvorschau wird gesondert gespeichert; Layout-Fix ist nicht bloß eine HTML-Mockupansicht.

## Assurance

SEC07/14: Auth-/Kontowechsel und veraltete Async-Ergebnisse im betroffenen Routingpfad geprüft; keine neuen API- oder Datenrechte. PRIV07/13: keine neuen personenbezogenen Daten, bestehendes Formular/Reset und vertraute Navigation erhalten. Keine Aussage über Gesamt-AVV/Schulfreigabe. Requested Modell nicht zusätzlich gesetzt, Runtime unbekannt, kein Modellwechsel/Providerkostenstart.

Nächster Schritt: unabhängigen scoped Review des unveränderlichen Diffs und echte Einstiegsvorschau sichern, dann als separaten Review-PR anbieten; keine Secure-Dateien ändern.

## Unabhängiger Review / Vorschau

Prüfer review_secure_return22 hat read-only unveränderlich1f206ae..d9cbed5 gelesen: keine P0–P2-Befunde, Empfehlung scoped akzeptieren. Keine eigenen Tests behauptet. Echte App de.gradecrew im eigenen iPad13-Simulator gestartet: direkte vorhandene native E-Mail-/Passwortanmeldung mit Reset/Registrierung, Crew-Logo und ohne Hausleiste/Remy-Zwischenmenü sichtbar. Screenshot outputs/teacher-direct-entry-20261022/ipad-signed-out.png. Generischer Build enthält beide Gerätefamilien; eigene iPhone-Vorschau folgt. Kein echter authentifizierter Kundenlogin oder physischer Test.

EchteiPhone16-Vorschau ebenfallsgeprüft: outputs/teacher-direct-entry-20261022/iphone-signed-out.png; vorhandenesFormular mitRegistrierung/Reset/Logo vollständigohneHausbutton sichtbar. PR279integriert60927e0, autoTestFlight39783328084 läuft; neueDistributionundechterLogin-Logout-Gerätetestnoch nichtbestätigt.


## Verifizierte TestFlight-Auslieferung

Run39783328084 auf60927e062e2a4cd52493cfcbdd53603c1f5d1add abgeschlossen success: beide Geräte-Layoutgates und Build-/Uploadjob grün. Version0.2.0(50) bei Apple verarbeitet, BuildID eb0f8dab-57bc-4d74-bfdb-515e48a672ac. Bestehende interne Gruppe „Grade Crew TesterL“ mit1Tester automatisch zugeordnet; keine neue Einladung/Rechteausweitung. Deutsche Testhinweise gespeichert und nach Neuladen geprüft; sichtbarer Beleg outputs/teacher-direct-entry-20261022/testflight-50-notes.png. Releasearchiv und Export im Cloudlog erfolgreich. Reale authentifizierte iPhone-/iPad-Kaltstart-/Logout-/Kontowechselabnahme bleibt offen. Signed-out echte Appvorschauen auf eigenem iPhone16-/iPad13-Simulator bestanden. Keine öffentliche Website-/Backend-/Rulesbereitstellung aus diesem Auftrag.


## Abhängigkeit gradecrew.de (noch keine native Umstellung)

Martin hat gradecrew.de gekauft; Domain-Fachchat 01a15f06-837c-73b3-93fa-0d07a8104d3a liefert später den verifizierten HTTPS-/Firebase-Auth-/Cutover-Beleg. Bis dahin bleiben alte Links/Fallbacks und interne Projekt-IDs unverändert; dieser Hinweis startet keinen weiteren Release. Teacher: öffentliche Basis-URL in GradeCrewBetaEnvironment.swift vom projectID entkoppeln; TeacherWebPortalView.swift akzeptiert derzeit nur parent.url.host, daher neue Domain/Redirects erst nach überprüfter Origin-/Navigationsfreigabe. Secure: Functions-Projekt und persistierte Keychain-/WorkDirectory-Bezeichner in SecureReleaseEnvironment.swift erhalten (auch historisches „staging“ im Namen), sonst droht Verlust der Zuordnung ausstehender Abgaben. SecureLegalInformation.swift sowie Store-Support-/Datenschutz-/Reviewlinks erst nach überprüfter neuer Route anpassen. Bestehende Live-/separate Testumgebung nicht umbenennen oder vermischen.
