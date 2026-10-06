# Aufgabe: GC-REMY-INTAKE-03

- Aktualisiert (UTC): 2026-10-06T23:01:00Z
- Verantwortlicher Chat / Auftrag: Remy-Intake Teilauftrag des gemeinsamen Web-Reparaturchats
- Chat-Bezeichnung / Link: unbekannt
- Arbeitszustand: zur Integration bereit (lokal geprüft)
- Aufgabenbranch: `feature/web-remy-intake-20261007`
- Basiscommit: `4d6ee69a7bf0ff51e037dc69f651ca6237f5106c`
- Integrationsziel: `feature/gradecrew-app-integration` über betreuenden Main-Chat
- PR: keiner
- Betroffene Dateien: `crew-assistant-core.mjs`, `crew-assistant-core.js` (Reexport prüfen), `remy-ai-help.js`, zugehörige Tests, diese Übergabe
- Überschneidungen: Audio-Team baut neues Feld `#aiAudioAnswerQuestionCount` / Patch `audioAnswerQuestionCount` in `app.js` und Functions. Remy-Dateien exklusiv in diesem Worktree.

## Ziel und gewünschtes Verhalten

Remy soll diktierte Mengen als Zahlwörter und Ziffern erkennen, Fach Deutsch nur bei expliziter Nennung setzen, Thema von Stil- und Medienwünschen trennen und Bild-, Hör- sowie Antwortoptionen-Audio-Mengen in die passenden Formularfelder schreiben. Vorgelesene Antwortoptionen sind von Höraufgaben und kontrolliert freigegebenen Lösungsaudios verschieden.

## Umfang / nicht verändern

Nur Parser, Remy-Formanbindung und gezielte Tests. Keine Änderungen an `app.js`, Functions, i18n, HTML oder CSS; kein Merge und kein Deploy.

## Akzeptanzkriterien

- Reproduktion des Nutzerbeispiels zeigt bislang ein verunreinigtes Thema und fehlende Mengen.
- Neue Tests belegen Deutsch-Fach ohne Ableitung aus UI-Sprache, Zahlwörter und getrennte Medienfelder.
- Vorhandene Parser- und Remy-Tests bleiben grün.

## Zwischenstand

- Lokal geändert: Parser, Remy-Formanbindung, Verhaltenstests und diese Übergabe.
- Lokal gesichert: Codecommit `ed55db7191a84c60f080e7407ec96ce2415ddbdb`. Auf GitHub nicht gepusht (Shell-DNS blockiert).
- Geprüft: `node --test crew-assistant-core.test.mjs remy-ai-help.test.mjs i18n-integration.test.mjs`: 54/54 bestanden. `git diff --check` und `node --check` für die geänderten JS-Module bestanden. Die anfängliche Reproduktion zeigte Thema einschließlich aller Wünsche; bei Ziffern zusätzlich falsches `count=2`. Unabhängige Review reproduzierte und die Folgekorrektur behebt drei False Positives: bloße Textantworten als Audioantworten, Audio-Teilmenge als Gesamtzahl und Audio-Antworten zugleich als Höraufgaben. Eine zweite begrenzte Nachprüfung zeigte `zwei Aufgaben, bei denen alle Antwortoptionen vorgelesen werden, insgesamt zwölf Aufgaben`: `count` wird nun ausdrücklich aus `insgesamt` gelesen, die Zweiergruppe bleibt nur Audio-Antworten-Teilmenge.
- Deployed: nein.
- Gerätetest: nein.

## Offene Probleme und Unsicherheiten

GitHub-Zugriff im Shell-Worktree scheitert an DNS. Der Main-Chat hat aktuelle main-Regeln, State und TODO über GitHub-Connector bereitgestellt; direkte PR-/Branch-Liveprüfung und Push hier noch offen. Die Form-ID `#aiAudioAnswerQuestionCount` wurde mit dem Audio-Team bestätigt. Der Main-Chat muss beim Zusammenführen die Cache-Versionen des Remy-Loaders und Core-Imports gemeinsam mit dem bestehenden i18n-Versionstest erhöhen; diese Dateien liegen außerhalb dieses Teilauftrags. Der AI-Fallback in Functions braucht ebenfalls die neuen Patchfelder, falls er sie setzen soll.

## Nächster konkreter Schritt

Main-Chat übernimmt den Branch-HEAD, integriert Audiofeld und erhöht dabei die Cache-Versionen konsistent; danach kombinierte CI.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt / Zeitpunkt (UTC): Codecommit `ed55db7`, Review-Folgekorrektur `fcf363e`, danach begrenzte Gesamtzahl-Korrektur im Branch-HEAD, lokale Tests 54/54 grün, 2026-10-06T23:01Z.
- Gepushter Codecommit / Remote-Branch: keiner; lokaler Branch `feature/web-remy-intake-20261007`.
- Ungesicherte Änderungen / Checkout-Pfad: keine nach abschließendem Übergabecommit in `gradecrew-web-remy-intake`.
- Laufende oder unklare Vorgänge: keine.
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: keine.
- Was darf noch nicht als erledigt gelten? CI, Integration, Staging und Nutzertest.
- Was muss vor Wiederholung geprüft werden? Branch-HEAD, Arbeitsbaum, Integrationsstand und eventuelle laufende Push-/PR-Vorgänge.
- Genau ein nächster ausführbarer Schritt: Main-Chat integriert den lokalen Branch-HEAD mit dem Audio-Workstream.
