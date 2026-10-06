# GC-DESIGN-05 — Hero-Startbildschirm in Web-App

Stand: 2026-10-06. Verantwortlich: Hero-Designchat `01a10e98-1e57-7b40-af70-555fdfdae2e3`; zentraler Integrations-/Staging-Chat `01a10df6-736b-7a62-bd38-2724cf254c2e` übernimmt Merge und Deploy. Integrationsziel: `feature/gradecrew-app-integration`, Ausgangscommit `2d2a7766d86ecc24b10493b9c7fb7b26e70e3fea`. Eigener Branch/Checkout: `feature/gc-design-05-web-integration`. Quelle des freigegebenen Bild-/Interaktionsprototyps: Draft-PR #143, Revision 4 Commit `c7933c6e9b6e2e59fd2e82ba20d71e34480a3456`. PR #143 selbst ist ein historischer Design-/Blender-Zweig gegen main und wird nicht als App-Code gemergt.

## Umfang

Die öffentliche Startansicht in `gradecrew-entry-flow.js` nutzt das textfreie Klassenraummotiv V3, die drei anklickbaren Figuren, Crew-Rollen, Tutorial-CTA mit Nutzerwunsch „ca. 6–7 Minuten“, Lehrer-Login und Schülercode. Der vorhandene `joinForm` wird unverändert in die neue Bühne verschoben; `loginForm` und `registerForm` ebenfalls weiterhin verschoben statt dupliziert. Der CTA behält seinen vorhandenen Handler zum `tutorialName`-Zustand und dessen bestehender Einführung. Keine neuen Authentifizierungs-, Code-, Abgabe- oder KI-Anfragen. Eine neue, begrenzte Demo zeigt Remys Beispiel-Sprachnotiz, Mehrfachauswahl und weitere Aufgaben, Emmis Wortarten-/Bildverbesserung und Wilmas 0→1-Punkt-Korrektur; automatisch 2,6 Sekunden je Übergang, Pause/Replay/Escape/Reduced Motion. Die Sprachnotiz ist ein visuelles Transkriptbeispiel, kein gespeichertes oder abgespieltes Audio.

Alle neuen Hero- und Demo-Texte liegen in `gradecrew-hero-copy.mjs` und sind über den **bestehenden** DE/EN-UI-Laufzeitkatalog registriert. UI-Sprache bleibt getrennt von echten Testinhalten/Bewertungssprache. Die Bilder enthalten keine Schrift. Zwei WebP-Assets werden vom Staging-Build mit Prüfsummen übernommen; neue CSS-Regeln sind auf den öffentlichen `authView` begrenzt. Alte Login-, Registrierungs-, Schülercode-, Tutorial-, Secure-Assessment-, Audio- und Backend-Dateien bleiben funktional unangetastet.

## Prüfnachweise und Grenzen

- Finale gebündelte Prüfung `node --test ai-*.test.js i18n-integration.test.mjs secure-student-route.test.mjs shared/i18n/browser-runtime.test.mjs first-guide-responsive.test.mjs`: 62 bestanden, 0 fehlgeschlagen.
- `node tools/build-staging.mjs <leerer Build-Ordner>`: 119 Dateien, Staging-Konfiguration und Referenzen geprüft; SHA256-Release-Manifest erstellt.
- `first-guide-responsive.test.mjs` ohne npm-Abhängigkeiten 7 bestanden; zwei weitere lokale Tutorial-Tests benötigen das nicht installierte, im Repository gepinnte `tools/ui/node_modules/jsdom`. Kein Produktfehler aus diesem lokalen Importfehler abgeleitet. Die passende CI installiert die Abhängigkeit.
- Browsersteuerung zum lokalen Prototyp wurde durch eine nicht verfügbare Admin-Sicherheitsprüfung gesperrt. Keine Umgehung oder visuelle Abnahme der Revision 4 bzw. des App-Builds behauptet. Native Geräte-/Nutzerabnahme offen.

Stufe vor PR/CI: `branch_only`. Keine Integration oder Staging-Veröffentlichung durch diesen Chat. Production unverändert. Vier frühere native Bildgenerierungsaufrufe einschließlich Igel sind in PR #143 dokumentiert; in dieser Integration keine neue Bildgenerierung, kein Provider-Aufruf, keine Budgetrücksetzung.

Vor PR-Erstellung erneut geprüft: Zielbranch unverändert `2d2a7766d86ecc24b10493b9c7fb7b26e70e3fea`; jüngster Development-Status-Lauf `37461539524` erfolgreich (main-Head `8c18648a…`). Offene ältere Startscreen-Guardian-PR #118 liegt ebenfalls gegen den Web-Integrationsbranch, ist aber historisch; aktuelle v4-Basis ist bereits Teil des Zielheads. Keine Übernahme seiner Änderungen. Lokaler Umsetzungscommit `e94e3ee` im isolierten Checkout; der Remote-Commit/PR wird nach erfolgreichem Upload ergänzt.

Nächster Schritt: Integrations-PR gegen den **frisch geprüften** Web-Integrationshead eröffnen, exakte CI und unabhängiges Read-only-Review abwarten; zentraler Chat entscheidet danach über Merge/Hosting-Staging und kennzeichnet die noch offene Browser-/Geräteabnahme.
