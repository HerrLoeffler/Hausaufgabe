# GradeCrew Crew-Einblicke V3 — isoliertes Experiment

Task: GC-BRAND-HERO-MOTION-20261013. Stand: 14.10.2026. Keine Integration, kein CI-/Deploy-/physischer Gerätenachweis.

## Autorisierter Umfang

Der spätere direkte Humanauftrag in GradeCrew Zentrale ersetzt die V2-Homepageänderungen: Startbildschirm exakt wie kanonisches Staging gc39@8f8697901f8c1aea89897be855ca2872c82d0f2b, Emmi/Wilma unverändert. Nur Coco und Remy erhalten neue Einblicke. Dazu ein separater synthetischer Pilot für den Konto-Einstieg am Ende der ausführlichen Einführung. V2 und Source-Receipt 2c85c13320bf649f567eb9b8c731070b114d6c63 bleiben erhalten.

- Coco: originales Schnurtelefon, konkrete Frage „Wie erstelle ich einen Test?“, Antwort mit sichtbarem Hinweis auf „Neuer Test“.
- Remy: ursprüngliche Figur mit Tablet/Mikrofon; Englisch Klasse 5 „Colours & Animals“, ein vollständiger vorbereiteter Test mit zehn Aufgaben/14 Punkten, danach Bild- und Hörfrage aus genau diesem Test. Die Oberfläche hat DE/EN, der Englischtest bleibt englisch.
- Jeder neue Schritt wartet auf Weiter. Zurück und Nochmal ansehen sind bedienbar. Keine erneute KI-Anfrage, keine Bewertung echter Kinderantworten.
- Konto-Pilot: beide Gastaktionen (Einstellungen/eigener Test) öffnen das Gate; Tutorialname, Testentwurf und Ziel bleiben bei Moduswechsel, Schließen und Browser-Zurück erhalten. Bereits angemeldeter Demostatus überspringt das Gate. Neues Coco-Willkommenmotiv, E-Mail/Passwort nur synthetisch.

## Vorschau starten

`python3 -m http.server 8780 --bind 127.0.0.1` in diesem Ordner.

- http://127.0.0.1:8780/ — Startbildschirm mit neuen Coco/Remy-Einblicken.
- http://127.0.0.1:8780/baseline.html — eingefrorene lokale Staging-Referenz.
- http://127.0.0.1:8780/tutorial-finale.html — ausdrücklich nur der letzte Tutorialschritt/Konto-Pilot, mit vorbereiteten Demodaten (Mara und originalem Übungstest). Kein vollständiger Tutorialdurchlauf in dieser Vorschau. Der optisch originale „Crew kennenlernen“-Button verlinkt in diesem Experiment als Abkürzung auf diesen separaten Pilot; die echte Tutorialengine ist nicht eingebunden.

Der reale Tutorialablauf, reale Registrierung, Terms und Backend bleiben unverändert. Der Pilot beweist die eigene Vorschauzustandslogik, keine Integration in den echten Tourzustand. Eine spätere Übernahme muss den realen Name-/Draft-/Authzustand anschließen und die vorhandenen Signup-Pflichten erhalten.

## Belege

`node --test *.test.mjs`: 14/14 bestanden. Emmi/Wilma-Funktionen, Hero-Markup und Viewportplatzierung byte-identisch; Originaldateien gegen Release-SHA256 geprüft. Screenshotvergleich: Startbereich 1280×610 sowie Emmi/Wilma-Inhalt 985×450 exakt gleich nach JPEG-Dekodierung. Footeranimation und Dialoghintergrund aus dem Pixelvergleich ausgeschlossen (unterschiedliche Animationszeit).

Browserprüfung ausschließlich über Codex CUA: Desktop 1280×720, iPad-Abmessungen 820×1180, iPhone-Abmessungen 390×844 (jeweils tatsächliche DOM-Breite verifiziert); neue Dialoge ohne horizontalen Überhang. DE/EN, manuelle Leseschritte, Tastatureinstieg, Escape und Fokus auf neuen Schritt geprüft. Hördatei 5,470658 Sekunden: natives Play zeigt paused=false/currentTime>0; kein Autoplay. Kein sichtbar aufklappbares Hörtranskript. Konto-Tab zunächst ohne Warnungen/JS-Fehler. Ein späterer Header-Initialisierungsfehler (falscher translateTree-Import) erkannt und korrigiert; alte Meldungen bleiben eventuell über Reloads im Browserprotokoll.

Gast-Ziel create/settings mit simulierter Registrierung durchgeklickt, bereits angemeldete create-Weiterleitung geprüft; beide Skip-Pfade zusätzlich Unit-Test. Moduswechsel leert das Passwortfeld, Name/Entwurf bleiben. Browser-Zurück und Escape führen zum Abschluss. Keine echten Konten, keine Terms angenommen.

Reduced-Motion-Verhalten der Coco/Remy-Phasen durch Flowtests mit true/false geprüft; keine reale OS-Präferenz-/Safari-/VoiceOver-Prüfung. Keine pauschale WCAG-Zertifizierung und kein echter iPad/iPhone-Gerätetest. Mobile Ansicht scrollt bei langem Test vertikal.

## Isolation und relevante Kontrollen

SEC15/18 und PRIV12/13/14/15/19 als begrenzte lokale Nachweisauswahl: Kein Firebase/app.js/startup.js/Tour-Engine gestartet. HTML-CSP `connect-src 'none'`, keine Credentialtransmission, keine Speicherung von E-Mail/Passwort im Zustandsmodell; Passwort wird bei Wechsel/Abbruch/Submit/pagehide geleert. Ausschließlich lokale Demowerte @example.test. Kopierte App-/Auth-/Tour-Quellen in baseline sind Referenzmaterial und werden nicht ausgeführt. Kein Serviceworker, Backend, Hosting-, Rules-, Billing-, Noten- oder Echtdatenzugriff. Keine globale Erfüllungsbehauptung zu den Kontrollkatalogen.

Der lokale Loopbackserver bleibt für Martins Vorschau offen (Port8780, Ausführungssession30466); V2-Server Port8779/Session36394 wird nicht angefasst. Zur Wiederaufnahme Port/Prozess erst prüfen, nicht blind einen zweiten Server starten.

## Offene nächste Schritte

Martin bewertet die konkrete Vorschau. Der externe Reviewer der Zentrale prüft die endgültige Quelle/Belege. Keine automatische Produktübernahme; die braucht einen neuen expliziten Auftrag. Physische Geräte, Safari, VoiceOver, reale Tutorial-/Authintegration und juristische Signup-Pflichten sind außerhalb dieses lokalen Experiments offen.

### Header-Abgleich der Schlussprüfung

Originale dynamische Startup-Stylesfunktion wie live nach i18nbootstrap ausgeführt. Header display:flex, originaler gradecrewPage-Kontext; Anmeldung zentriert und EN Sign in geprüft. Zentraler unabhängiger Vergleich im gleichen Chrome1200×773 bestätigt Headerposition x568.203/width104.546875 gegenüber tatsächlichem Staging. Originale DOM-Höhenmessung (interface.watchStickyHeight) übernommen. Nach Ende der originalen gcEntryIn-Einblendung wird der unveränderte Viewportfitter erneut ausgelöst; initiale8px-Transformverfälschung behoben. Finale IAB1280×720 Start642 =720-78, Stage546 =720-78-96. Lokaler gc39-Snapshot und V3 sind im verglichenen Startbereich pixelgleich. Einige ältere Dialogscreenshot-Hintergründe zeigen noch den früheren Header; Dialoginhalt unverändert. Die neuen Start-/Coco-/Remy-Desktopshots zeigen den korrigierten Stand.

Direkte Staging-Referenznavigation im IAB stellte automatisch eine bestehende Sitzung wieder her. Nur Styles/Pagekontext-Metadaten gelesen; keine private Test-/Profilaktion, Formübermittlung oder Abmeldung durchgeführt und Referenztab geschlossen. Die isolierte Vorschau selbst startet weiterhin keinerlei App/Firebase-/Backendcode.
