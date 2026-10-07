# GC-GAMES-ESCAPE-VISUAL-01 — lokale Testfassung

Auftrag: Nutzer bittet ausdrücklich um online oder lokal startbare Fassung zum Testen; Umsetzung selbst in diesem Chat. Spec/Bauplan bestätigt bzw. durch konkreten Testauftrag zur Ausführung übernommen. Aktueller Root: gradecrew-expedition-unreal, Branch feature/escape-expedition-unreal-v1; Basis main3e815e4. Kein fremder Checkout/Editor übernommen.

Status: lokaler nativer Demo-Build, branch_only. 25 pure Verhaltenschecks und zwei tatsächlich gerenderte Unreal-Tests (Smoke und FullRoute) bestanden, null Fehler; Audio-Samplerate-Gerätewarnung erhalten. FullRoute spielt Prozent und Wortarten durch echte Interact/Click/Answer-Methoden bis Signal, prüft Transfer/Save/Resume. Das ersetzt keinen vollständigen Test per Tastatur/Maus und keinen menschlichen Erstspieldauer-Nachweis.

Startdatei: ../Expedition starten.command. Nutzt installierten UnrealEditor als -game Standalonefenster; kein separat gepacktes Mac-/iOS-Appartefakt. Content/Map/Material lokal aus Tools/create_world.py erzeugt; eigene3D-Anordnung und Bewegungen im C++-Code. Quellen, Generator und Startdatei in Git; EngineCache/Binaries/Content nicht Quelle. SaveGame lokal im Unreal-Speicherpfad; Automation verwendet eigene Slots.

Vorhanden: Camp/Ufer/Station, Figur, Desktop-Steuerung, Touchentwurf, acht Auswahl-Lernaufgaben je Beispielthema, Lehrer-Fragenvorschau, Karte, Seil/Winde/Brücke, Sicherung/Strom/Funk, Inventar, Save/Resume. Bildschirmsteuerung korrigiert. Farben: früher Screenshot in geerbtem LightingOnly-Modus; Start setzt explizit lit. Früher Spawn vor Root war ungültig; Root-/Startposition korrigiert. Alte Fehlerbelege bleiben in Reports.

Independent review durchgeführt. Important: (1) Lernphase beim Schließen zurückgesetzt, reproduziert native RED und korrigiert mit perSlot-Persistenz; (2) nach Finale Stromänderung invalidiert Save, pure RED→GREEN, finale Aktionen eingefroren; (3) Automation überschreibt Spielersave, isolierte Slots; (4) ungültige physische Savezustände, pure RED→GREEN plus sichere Positionsprüfung. Map-180/270-Ambiguität als spielerischen Blocker eingeordnet und asymmetrische Landmarken ergänzt.

Deferred minors: Touch-Rucksackfläche kollidiert mit Touchstickzone; physische Mobile-Abnahme ohnehin offen. Neustart/Topicwechsel überschreibt lokalen aktuellen Stand ohne zusätzlichen Bestätigungsdialog; Button fordert bewusst neues Spiel an, im UI künftig bestätigen. Beides vor Mobile-/Produktabnahme beheben.

Ruling: Erste Testfassung nutzt eigene Unreal-Grundform-Anordnung statt importierter Blender-Meshes; BlenderExecutable nicht gefunden, keine unbewiesene Blender-Arbeit behauptet. Kosten falls falsch: spätere Assetüberarbeitung. Art ist Prototyp, kein bestätigter finaler Qualitätsstandard.
Ruling: Runtime/HUD/Art bleiben getrennt, einige geplante Dateiunterteilungen zunächst zusammengelegt; kompakte Demo vor Live-Subsystem. Kosten falls falsch: Refactoring vor Plattformanbindung.
Ruling: GradeCrew-Livebrücke bleibt eigener ungestarteter Plan; kein Anbieter-/API-Schlüssel-Aufruf, keine automatische Themen-/Serverbewertung. Permanent lokaleBeispieldaten-Badge. Kosten falls falsch: Demo könnte mit fertigem Produkt verwechselt werden; im Abschluss ausdrücklich erklären.

Offen: grafische Endqualität, echte Live-Themenwahl/Auth/serverseitige Slotbewertung, Zahl-/Freitextwidgets, echte10Minuten/60–70%-Lernzeit, reales Touchgerät/Performance, vollständiger vertrauenswürdiger UI-Durchlauf und gepackte App. Keine neue CI/Integration/Staging/Production aus lokalen Tests ableiten.

Nächster Schritt: Martin testet lokale Fassung und bewertet Steuerung, Rätsel und Optik; tatsächlichen Erstspielablauf/Zeit dokumentieren. Danach priorisierte Demo-UX/Art und Live-Brücke ausführen. Bestehende Task-ID, Budgets und Versuchshistorie erhalten. Vor Wiederholung Branch, lokale Prozesse und Reports prüfen.


## Finale Quellsicherung und normale Fensterprüfung

Lokaler Codecommit1be53c5d719d7889e6ff6380e11228fc2ddf46b5, RemoteSourceCommitcc725b2e8cc5cf37073bf7aedbb4d78776d00bdf, DraftPR171:https://github.com/HerrLoeffler/Hausaufgabe/pull/171. RemoteWorld.cpp/HUD.cpp/README/TODO perReadback bytegleich mitübergebenenQuelltexten. TerminalPush mangelsHTTPS-Anmeldungfehlgeschlagen; ConnectorTree/Commit/Branch/PR erfolgreich, keine Zugangsdaten angefordert. Lokal generierteBinary/Map/Material bleibenlokalreproduzierbar, Sourceonlinegesichert.

FinaleWindow-Kontrolle pernativeCUA: Themenstart perTab/Enter, Wortartenstart, InventarI, Esc-Menü, RückkehrThemenstart bestätigt. Gamewindow„Expedition (64-bit Development SF_METAL_SM5)“ amThemenstartoffengelassen. Starttasten1(Prozent)/2(Wortarten), Antworttasten1–4, Tab/EnterfüralleDialogbuttons. NativeCUA-Mausclicks ändertenDialognoch nichtzuverlässig; MausbedienungNICHTalsbehoben melden, Tastaturtest verwenden. ZweiRender-Tests stammenvorderfinalenPointer-/Keyboardänderung; nachfinalerUIänderung nurBuild/pureChecks/echteFensterprüfung bestätigt. GanzeersteSpielzeit undkompletterTrustedUI-Durchlauf bleibenoffen.

KeinCIgrün/Integration/OnlineSpieldeploy/Production/Mobilebeleg. NächsterSchrittbleibtMartinslokalerTastaturtest unddessenFeedback; maus/Touch-/Neustartbestätigung undArt weiterverbessern, danachLiveBrücke. BestehendeTask-ID, Budgets undAttemptgeschichte erhalten.
