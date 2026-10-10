# GradeCrew Games: gemeinsame Grundlage und Entwicklermodus

Stand 10.10.2026 · bestehende Task-ID GC-GAMES-PIPELINE-01 · Dokumentations-Draft zur schriftlichen Prüfung. Nutzeranforderungen sind beauftragter Designumfang; technische Entscheidungen und MVP-Reihenfolge sind Vorschläge, noch kein Implementierungsauftrag. Kein Enginewechsel, kein Spielcode, kein Assetumbau und keine automatische Agentenbrücke werden durch diesen Entwurf behauptet oder gestartet.

## 1. Ziel und überprüfter Ausgangspunkt

Martin möchte eine wiederverwendbare Grundlage für alle GradeCrew-Spiele: vorhandenes Wissen und gute Bausteine sammeln; Mechanik, Gestaltung und Assets mit nachvollziehbarer Qualität wiederverwenden; einen einheitlichen Entwicklermodus für freies Erkunden, Karten-/Levelwahl, gezielten Rätseltest und Meldungen direkt im Spiel erhalten. Meldungen sollen per Text und optional Sprache erfasst, gesammelt und als klarer Auftrag an KI weitergegeben werden können. Lokale Entwicklung soll schnell prüfbar sein, ohne jede Korrektur zuerst zu veröffentlichen. Jeder Spiele-Hauptchat bleibt für sein Spiel verantwortlich.

Aktueller main: 59dd0a501a28c04c36ee877450239bf1d64a3187. START_HERE, AGENTS, GRADECREW_STATE, TODO, Workstreams und Registry frisch gelesen. Development Status [38029190041](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38029190041), Job 114146355743, success; Log tatsächlich gelesen. Er zeigt unter anderem fehlende Registry-Zuordnung für PR160/171/153 sowie Überlappungen der Lerninsel mit Layoutdokumenten und .gitignore anderer Workstreams. Erfolg dieses Audits ist kein nativer Build-/CI-/Gerätenachweis.

| Quelle, frisch geprüft | Belegter Zustand | Grenze |
| --- | --- | --- |
| [PR153](https://github.com/HerrLoeffler/Hausaufgabe/pull/153), f40401f3c8e66313fb0cb9d67a71229bcf56e1f5 | Offener Dokumentations-PR, bestehende GC-GAMES-PIPELINE-01, Produktionswissen und Teamregeln | Noch nicht auf main integriert; unverändert lassen und bewusst mit diesem Ergänzungs-Draft abstimmen |
| [PR160](https://github.com/HerrLoeffler/Hausaufgabe/pull/160), c7d05339f48614c6cbe1f0f0a35801143b9f8d13 | Offener Draft, native UE5.8 Bruchpizzeria; Übergabe nennt 890 Kernchecks und 11 native Tests | branch_only; keine daraus abgeleitete native GitHub-CI, Integration, Staging- oder iPad-Abnahme |
| [PR171](https://github.com/HerrLoeffler/Hausaufgabe/pull/171), a56b2a6bca8fab0a708dcb3d4e64a6a1d486949b | Offener Draft, native UE5.8 Küstenepisode; 25 frühere + 63 neue Regelprüfungen und MasterRoute laut Übergabe | Lokale Mathe-Demo; keine GradeCrew-Auth-/Prompt-/Serverbewertungsanbindung oder vollständige OS-/Mobileabnahme |
| [PR175](https://github.com/HerrLoeffler/Hausaufgabe/pull/175), 28a60a34695f6c147d9a3ee71633adb09414c32e | Offener Draft, UE5.8 Lerninsel; LI3-Migration und Fuchsablauf; 195 Checks/4 UE-Suites laut Übergabe | branch_only; Grafik/Fuchsreferenz und Fundbereich nicht akzeptiert; keine Browser-/iPad-Abnahme |
| [PR184](https://github.com/HerrLoeffler/Hausaufgabe/pull/184), be615a8f22db1dfc13e6a7a97faa04ae78b376cf | Offener Draft für GC-HOOKS-01 | Ausschließlich GC · Automatisierung & Integration; keine Hooks in diesem Scope |

Das sind vorhandene einzelne Bausteine, keine belegte gemeinsame Games-Runtime. Alte Browser-Labs bleiben als eigene Historie erhalten. „Bruchinsel“ ist aus den geprüften Quellen kein belegtes viertes Spiel; Begriff vor eigener Zuordnung klären. Expedition und Lerninsel verwenden historisch dieselbe GC-GAMES-ESCAPE-VISUAL-01. Diese Kollision bleibt sichtbar; keine Ersatz-ID erfinden. Aktuelle Lerninsel-Fachzuordnung laut Games-Koordination: GC-GAMES-LERNINSEL-L1 unter GC · Lerninsel · Gameplay & Integration, Chat 01a12568-0502-7831-9451-a7f8d91ce950; historischer Parent bleibt erhalten. Keine parallele Lerninsel-Umsetzung.

## 2. Drei Bibliothekslagen statt einer unsortierten Sammlung

### Quellen, Lehren und Gestaltung

Datierte Quellen, Video-/Projektbeobachtungen, Fehlerursachen, verworfene Ansätze und gelungene Lösungen erhalten Ursprung, Version, Geltungsbereich und konkrete Folge. Beobachtung, Autorenbehauptung und eigene Empfehlung unterscheiden. Ein Lesson-Eintrag beschreibt Problem, Ursache, Lösung, Gegenbeispiel und Prüfnachweis. Keine fremden Skills, Bibliotheken oder Binärdateien allein wegen einer Referenz übernehmen.

Gestaltungswissen umfasst lesbare Kamera, klare Interaktionsführung, Lernfeedback, Pausenverhalten, Farben, Kontrast, Audio und reduzierte Bewegung. Semantische Farbrollen sind gemeinsam: interaktiv, ausgewählt, erfolgreich, korrigierbar falsch, blockiert, Debug. Jedes Spiel darf eine eigene Palette und Materialwelt behalten. Bedeutung wird zusätzlich durch Text/Form/Symbol vermittelt; ein gemeinsames Grün beweist keine gemeinsame Gestaltung. Fortschritts-/Releasefarben bleiben von Gameplayfarben getrennt.

### Qualifizierte Codebausteine

Jeder Kandidat braucht Herkunftspfad und SHA, Owner, Lizenz-/Abhängigkeitsnachweis, Vertrag, bekannte Grenzen, Verhaltenstests und mindestens einen echten Verwendungsnachweis. Erst ein zweiter sinnvoller Nutzer qualifiziert eine Abstraktion für gemeinsame Nutzung. Modulversion je Spiel bewusst pinnen; Bibliotheksfix separat prüfen und gezielt übernehmen, keine stillen Updates oder Kopiendrift. Nicht ganze GameModes als vermeintlich universellen Kern kopieren.

| Kandidat | Konkreter Ausgangspunkt | Qualifizierung vor Wiederverwendung |
| --- | --- | --- |
| Exakte Brüche | Pizza FractionRules: Rational normalisiert, weite Zwischenrechnung, ungültige Werte; Schnittgeometrie gesondert | Zahlenvertrag und Grenzen erhalten; Darstellung/Bestellregeln nicht vermischen |
| Objekttransfer und aktive Zeit | PizzaKitchen/PizzaInventory: Pizza/Teller, stabile Gastplätze, Reinigungspflichten, Frozen-Pausen | Besitzübergänge und Pausenuhr explizit machen; Pizzaökonomie bleibt spielbezogen |
| Inventar-/Transferstatus | ExpeditionEpisode: absent/in bag/used, Voraussetzungen, Transferfragen, Validate | Lokal enthaltene Demoantworten nicht in geschützte Schülerpakete übernehmen |
| Eingabe nach Fokusverlust | ExpeditionInput: Held/Blocked, Suspend/LoseFocus | Einheitlicher Abbruchvertrag; echte OS-/Touchprüfung separat |
| Migration und Zustandsregeln | IslandRules: LI1/LI2/LI3, Validierung, idempotente Already-Ergebnisse | Migration und vollständige Abhängigkeiten erhalten; keine rohen Flagsetter |
| Präsentationsablauf | IslandFoxCue: deterministische Phasen aus Zeit und solved | Cue kann Kandidat sein; prozedurale Fuchsfigur ist kein visuell akzeptiertes Asset |

### Assets und Feedbackprofile

Assetregister: ID, Herkunft/Autor, Lizenz/Rechte, Quelldatei, Export/Importversion, Hash, Rig-/Animationsstatus, verwendete Spiele, Zielgerätebudget, technische und visuelle Abnahme. Status: Referenz → Prototyp → technisch geprüft → im Spiel visuell geprüft → freigegeben. Keine automatische Beförderung durch mehr Polygone, Installation oder schönen Einzelrender.

Fuchs aktuell als abgelehnter/ungeprüfter Runtime-Prototyp führen, nicht als freigegebenes Bibliotheksasset. Bibliothek darf mehr enthalten als ein Spielpaket: nur tatsächlich verwendete Assets und deren notwendige Abhängigkeiten ausliefern; tatsächliches Paketinventar als Nachweis sichern. Budgets für Download/Installation, Speicher, Startzeit und Frametimes pro verbindlichem Gerät vor Produktion numerisch festlegen und in echter Szene messen. Noch keine neuen gemessenen Grenzwerte behauptet. Die main-Regel [IMG2THREEJS_AND_ASSET_QUALITY](../../../docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md) bleibt maßgeblich; dieses UI-/Vertragsdesign benötigt keine 3D-Rekonstruktion.

## 3. Gemeinsamer Vertrag und kleine Unreal-Anbindung

Vorschlag: versioniertes engineunabhängiges Manifest mit gameId, buildSha, contentRevision, schemaVersion, Karten, Levels, sicheren Ankern, Rätseln, Testzuständen und Fähigkeiten. Kein Enginewechsel für die bestehenden UE5.8-Spiele. Ein Browseradapter kann später denselben Vertrag erfüllen, ohne native Actors nachzubauen.

Kernbefehle: ListTargets, CaptureCheckpoint, RestoreCheckpoint, Teleport, StartPuzzleFixture, ReplayPresentation, ResetDebugSession und CaptureFeedbackContext. requestId verhindert doppelte Mutationen. Antworten: applied/already, unsupported, blocked mit Grund oder failed; keine leeren Erfolgsantworten. Anker-IDs bleiben stabil, Weltkoordinaten sind Implementierungsdetail. Capabilities zeigen tatsächlich verfügbare Funktionen; ungebautes Gebiet wird sichtbar als nicht gebaut markiert.

Kleine gemeinsame UE-Anbindung: eigenes GradeCrew-Modul; GameInstance-Subsystem für Testsitzung/Ausgangsliste; pro Spiel Adapter für vorhandene Regeln und Wiederaufbau; gemeinsame Oberfläche über bestehende Slate-/UMG-Wege. Kein großflächiger Umbau auf zusätzliche Gameplaybibliotheken/CommonUI allein für Debug. Epic beschreibt Subsysteme als Erweiterungspunkte mit verwaltetem Lebenszyklus. [Epic: Subsystems](https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-subsystems-in-unreal-engine)

## 4. Einheitliche UI und sicherer Spielzustand

Einstieg im Menü: Entwicklermodus mit dauerhafter Kennzeichnung. Bereiche: Erkunden/Karte und Level, Rätsel testen, Checkpoints, Meldungen. Sichtbarer Button plus optionaler belegter/rebindbarer Desktopkurzbefehl; Touch erhält alle Funktionen direkt. Fokus, Tab, Enter und Esc sind konsistent. Keine Funktion nur per Konsole oder Hover. Spiele behalten ihre reguläre Steuerung und Perspektive.

Öffnen eines Dialogs beendet gehaltene Bewegung, Drag und Fingerbesitz. Esc schließt zuerst das oberste Fenster, danach das Menü. Fokusverlust, Fingerverlust, Fenstergröße, Safe Areas, Textskalierung und Softwaretastatur dürfen keine Phantomaktionen verursachen. Synthetische Widgets-/Inputtests ersetzen keinen echten OS-/Touchtest. Enhanced Input kann bei vorhandener Nutzung priorisierte Kontexte einsetzen, ist aber keine Pflichtmigration. [Epic: Enhanced Input](https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine)

Safe anchor: nur Ort wechseln, keine Lernflags/Gegenstände ändern. Gesperrter Abschnitt zeigt fehlende Voraussetzungen. Test fixture: benannter, validierter kompletter Ausgangszustand mit nötigem Inventar, offenen Wegen und noch ungelöstem Zielrätsel. Vor fixture automatisch Rückkehrcheckpoint sichern. Checkpoint/Restore ist reversibel; globale Normalspiel-Resets und beliebige Flag-/Actor-Manipulation sind getrennte, zunächst nicht angebotene destruktive Diagnosen.

Checkpoint enthält Build/Schema/Inhaltsrevision, Karte, sicheren Anker, logischen Zustand, Inventar, RNG-Seed sowie aktive Zeiten/Cuephase. Keine rohen Actor-Zeiger. Restore lädt Karte, wartet auf benötigte Objekte, validiert alle Voraussetzungen, baut Darstellung auf, prüft Spielerkapsel und gibt erst danach Eingaben frei. Fixture/Restore validiert atomar einschließlich Timer und noch laufender Aktionen. Fehler hinterlässt den alten Zustand oder eine eindeutig beendete Testsitzung; kein halb wiederhergestellter Spielstand. Veraltete Revision migrieren oder verständlich ablehnen.

„Zurück“ bedeutet zuerst Checkpoint-Restore, nicht unbegrenztes Physik-Rewind. Lerninsel: Präsentation wiederholen erhält Lernflags/Bechermenge; echter Rücksprung rekonstruiert Fuchs/Tor/Interaktionen. Pizza: Hände/Brett/Ofen/Gastplätze/Tellerpflichten/Kasse/aktive Uhren zusammen restaurieren. Expedition: Voraussetzungen, Rucksackzustände und Transferphase erhalten. Speichern mitten in nicht unterstützter Animation verständlich sperren oder stabilen Zustand wählen.

Debug save, scores, Freischaltungen und Analytics sind getrennt. Keine realen Attempts, Highscores, benoteten Abgaben oder normalen Rewards. Restore darf Onlineversuche, Scores, Belohnungen und KI-Aufrufe weder rückgängig machen noch erneut auslösen; externe Effekte gehören nicht in einen lokalen Rewind. Nach Debug bleibt Sitzung markiert; Normalspiel wird aus ursprünglichem Save gestartet. Server nimmt Client-Behauptungen über Debugrechte oder Score nicht als Autorität. Unreal unterstützt getrennte SaveGame-Dateien; der Adapter muss Isolation prüfen. [Epic: SaveGame](https://dev.epicgames.com/documentation/unreal-engine/saving-and-loading-your-game-in-unreal-engine?lang=en-US)

## 5. Zugangs- und Inhaltsgrenzen

MVP nur ausdrücklich aktivierter lokaler Entwicklungsbuild. Versteckter Kurzbefehl ist keine Berechtigung. Spätere verbundene Testbuilds brauchen geprüfte Rolle, Umgebung und getrennte Rechte für Zustandsänderung/Meldung/Agentauftrag. Normales Schülerpaket enthält keine geschützten Lösungen oder administrativen Schlüssel. Debugmutationen/Testfixtures aus normalen Shipping-Paketen ausschließen; Ausblenden genügt nicht. Entwicklungsrechte offline nur für klar markierte lokale synthetische Inhalte.

Shipping entfernt bestimmte Engine-Diagnosewerkzeuge; eigene GradeCrew-Funktionen brauchen trotzdem explizite Buildgates. [Epic: Build-Konfigurationen](https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configurations-reference-for-unreal-engine)

## 6. Meldungen direkt im Spiel

Bei Öffnen sofort Kontext einfrieren: gameId, Build/SHA, Inhaltsrevision, Karte/Level/Rätsel, Position/Anker, Fixture, Debugmarkierung und begrenzte letzte semantische Aktionen. Nicht erst nach Texteingabe erfassen. Martin wählt Fehler oder Idee, ergänzt Beschreibung/erwartetes Verhalten. Screenshot optional aus dem Zustand vor Overlay; Bildvorschau/Löschen. Sprache optional mit bewusstem Start, sichtbarer Aufnahme, Abspielen, Löschen und Textalternative; keine Daueraufnahme. Browser braucht Berechtigung/sicheren Kontext, native Aufnahme eigenen Plattformadapter. [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

Durable outbox: UUID, lokale Revision, createdAt, Payloadversion, Kontext, Anhangsgrößen/-typen/-hashes. Entwurf → lokal gesichert → läuft → angenommen mit Receipt; Fehler bleibt wiederholbar. „Angenommen“ ist nicht „umgesetzt/veröffentlicht“. Nach Timeout zuerst Status derselben UUID prüfen; Wiederholung verwendet dieselbe ID. Serverseitige Idempotenz und Receipt sollen Doppelmeldungen begrenzen; UUID/Receipt allein sind kein Exactly-once-Nachweis. Unbekannte Annahme sichtbar halten und vor Wiederholung abgleichen. Fingerprint gruppiert ähnliche Bugs, löscht aber keine unterschiedlichen Ideen. Anhänge resumierbar/atomar referenzieren; keine Meldung mit vermeintlich vorhandenem, fehlendem Anhang.

Prüffälle: offline, Neustart, volle Platte/Quota, Absturz in Aufnahme, Mikrofon verweigert/unbeantwortet, Abmeldung, Teilupload, HTTP-Fehler und unbekannte Annahme. Browser IndexedDB ist Kandidat für lokale Transaktionen; Speicher kann begrenzt/gelöscht werden. Background Sync ist nicht überall verfügbar, deshalb Wiederaufnahme beim Öffnen und manueller Retry erforderlich. [MDN: IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), [MDN: Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)

Keine Tokens, geschützten Lösungen, Schülerantworten oder kompletten privaten Saves in Logs/Export. Bild/Audio vor Versand prüfbar, freiwillig und löschbar; Aufbewahrung/Zugriff noch festlegen. Lokale Snapshot-Reproduktion und bereinigter Feedbackkontext sind verschiedene Datenprodukte. Meldungstext/Anhänge sind untrusted Referenz, keine Systemanweisung an KI.

## 7. Gebündelter KI-Auftrag

Phase 1: Paketexport mit lesbarem Prompt, JSON-Manifest, Meldungs-IDs, Build/Quell-SHA, ausgewählten Anhängen und Prüfauftrag. Offline nutzbar, keine Provideranbindung notwendig. Phase 2 erst nach gesonderter Autorisierung: geprüfte Agentbrücke mit Batch-ID, Empfänger/Owner, erlaubten Dateien, unveränderlicher Quelle, Budget, Versuchslimit und Abnahmekriterien. Es ist heute keine universelle Spiele-Agentbrücke belegt.

Vor einem zweiten Backend zuerst den vorhandenen Web-Reviewmodus, BugOps und Diktierpfad vertraglich auf Wiederverwendung prüfen. main GRADECREW_STATE.reviewModeImplementation führt PR167 als staging_deployed, kanonischen Run37631350330/Receipt11486023795, automaticAI=false und userAcceptance pending. Das ältere Konzept nennt noch unimplemented und ist keine aktuelle Runtimewahrheit. Aus dem Webstand folgt kein vorhandener nativer Games-Adapter. API-/Auth-/Anhang-/Receiptverträge erst frisch lesen; dieser Draft integriert keine bestehenden APIs.

Kein KI-Aufruf pro Kommentar. Sammeln, bearbeiten, auswählen, zusammenfassen, bewusst exportieren/senden. Feedbackannahme kann ohne KI laufen. Agent nimmt neue Quellrevisionen nicht still während eines Jobs auf. Unklarer Requestausgang bleibt mit ID, bisherigem Verbrauch und Versuchshistorie dokumentiert; kein blindes erneutes Bezahlen. Nur ein serieller Schreiber je Spiel/Dateibereich; vor Start aktive Editor-/Build-/Schreibprozesse und letzten Save/Commit abgleichen, fremde aktive Art-/Gameplayarbeit erhalten. Production braucht ausdrückliche Freigabe.

Bewertung 1–10 anhand derselben Kriterien; begründete Eignung, keine Messwerte:

| Ansatz | Bedienung | Kontrolle/Nachvollziehbarkeit | Zuordnung/Verlässlichkeit | Kosten/Risiko | Gesamt |
| --- | --- | --- | --- | --- | --- |
| Paketexport | 7 | 10 | 7 | 10 | 8/10 |
| Explizit ausgewählte Batchübermittlung | 9 | 9 | 9 | 9 | 9/10 |
| Sofortige autonome Bearbeitung jeder Meldung | 10 | 3 | 6 | 3 | 4/10 |

Export schafft schnelle sichere Grundlage, benötigt manuelle Übernahme. Expliziter Batch verbindet bequeme Bedienung mit begrenztem prüfbarem Auftrag. Sofortige Autonomie erhöht konkurrierende Änderungen, Doppelstarts und Kosten; aktuelle Web-Allowlist erlaubt keine pauschale Games-Übernahme. Empfehlung: Export zuerst, autorisierte Batchbrücke später; keine unmittelbare autonome Reparatur.

## 8. Lokale Iteration und Meilensteine

Lokale Entwicklung benötigt keinen Deploy pro Änderung. Browser-Lab: lokaler Entwicklungsserver/Reload und versionierte Beispieldaten. Unreal: Editor-/Standaloneprüfung, Asset-Reimport und kontrollierter Szenenwiederaufbau; nicht während aktiver Schreibarbeit dieselbe Map ändern. C++-Änderungen mit sicherem Build und erforderlichem Neustart prüfen, niemals alte Binaries nach fehlgeschlagenem Build als aktuellen Code vorführen.

Hot content reload ist nur für schema-kompatible Fragen/Hinweise/Fixturedaten an sicheren Grenzen denkbar; Code, Blueprintverhalten, Map-/Meshänderungen und package changes sind getrennt. Mac Live Coding ist in diesem Projekt/Host nicht bestätigt und wird nicht vorausgesetzt. Epic beschreibt Editor/PIE und angehängte Desktopbuilds und keine Mobile-/Consoleverfügbarkeit; das ersetzt keinen Mac-Fähigkeitsnachweis. [Epic: Live Coding](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-live-coding-to-recompile-unreal-engine-applications-at-runtime)

Manuelle Games-Preview-/Paketmeilensteine nach explizitem Testumfang, Build-SHA und Zielgerät. Native Paketierung ist kein Firebase-Webdeploy; Assetänderungen brauchen passende Cook-/Paketnachweise. [Epic: Packaging](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project) Bestehende main-Webdeploys werden hier nicht global abgeschaltet. Dauerhafte Rollen-/Modellregeln und deren Integration/Regelübernahme ausschließlich durch GC · Automatisierung & Integration/PR184; dieser Design-Draft aktiviert keine neue verbindliche Regel. Hooks/CI-/Deploypolitik ausschließlich mit diesem Owner abstimmen; keine .github-, Hook- oder Controlleränderung in diesem Entwurf.

## 9. MVP und Abnahme

Vorgeschlagener Pilot: Pizza level select plus drei Zustände: Portionierung direkt prüfen; Lieferung mit falscher Portion/Feedback; Level7-Schmutzteller mit pausierbarer Wasch-/Esszeit. Gemeinsames Menü, sichere Stationsanker, Rückkehrcheckpoint, isoliertes Debugsave, Text+optional Screenshot und Feedbackexport. Eigene normale Savehistorie/Kasse erhalten. Nicht sämtliche Pizzaobjekte in universelle Objekte umbenennen.

Zweiter Adapter Expedition qualifiziert Wiederverwendung: Inventarrätsel und Lern-/Transferphase zeigen andere Abhängigkeiten. Lerninsel folgt mit Ego-/Touch-/Cue-/Migrationsfällen, erst abgestimmt mit ihrem Fachowner. Keine Migration eines bereits beauftragten World-preview-Pakets. Stimme, Backendoutbox und Agentbrücke nach dem lokalen Nachweis. Vibration ausschließlich bei gemeldeter Capability und tatsächlich geprüfter Hardware anbieten, nicht aus Desktoptests ableiten. Beliebige Actor-Manipulation, voller Zeit-Rewind, Multiplayer, Engineport und pauschale Assetneuproduktion sind außerhalb MVP.

| Abnahmebereich | Nachweis für genau den Build |
| --- | --- |
| Zugang | Normalbuild ohne Mutationen, lokaler Testbuild gekennzeichnet; später Rolle serverseitig |
| Karte/Level | Jeder registrierte Anker erreichbar/kollisionssicher; ungebautes/fehlendes Gebiet verständlich |
| Rätsel | Jeder Fixturezustand validiert, prerequisites korrekt; Rätsel normal lösbar |
| Restore | Fixture → Aktion → Rückkehr; Inventar/Uhren/Cues/Freischaltungen konsistent |
| Isolation | Normalsave byte-/semantisch erhalten; keine echten Scores/Attempts/Rewards |
| Eingabe | Maus, Tastatur, Touch, Fokusverlust, Dragabbruch, Softwaretastatur, Esc |
| Feedback | Kontext vor Overlay, Export lesbar; offline/restart/dedupe/Anhangfehler/Receipt für spätere Netzanbindung |
| Revision | Alter/kaputter/anderer-Spiel-Checkpoint migriert oder unverändert abgewiesen; inkompatibler Restore erhält letzten guten Zustand |
| Wiederverwendung | Zweiter Adapter ohne Kopie der gemeinsamen Oberfläche; unsupported ausdrücklich; Doppelprozess/-auftrag erhält nur einen seriellen Owner |
| Qualität/Gerät | Tatsächlicher Paketstart und repräsentatives Gerät; synthetische Tests separat; letzter guter Build nach fehlgeschlagenem Build erhalten |

Technischer Erfolg ersetzt Martins Spiel-/Grafikabnahme nicht. Bewertung des gemeinsamen Ansatzes 9/10 wegen vorhandener Zustandskerne und kleiner Adapter, mit offenem Risiko vollständiger Restore-Abdeckung und unbekannter Geräte-/Feedbackinfrastruktur; keine Gesamtprojekt-Reifezahl ableiten.

## 10. Zuständigkeit, offene Entscheidungen und nächster Schritt

| Bereich | Eigentümer/Grenze |
| --- | --- |
| Gemeinsamer Vertrag/Bibliothek/Design | Games-Zentrale koordiniert; dieser Dokumentations-Fachauftrag sichert Reviewdraft |
| Pizza | Pizza Spiel Zentrale; nur sie vergibt/integratiert Umsetzung auf dem aktiven Spielebranch |
| Expedition | GC · Escape-Expedition-Zentrale |
| Lerninsel | GC · Lerninsel-Zentrale; aktueller Fachowner GC · Lerninsel · Gameplay & Integration, GC-GAMES-LERNINSEL-L1 |
| Hooks/Automatisierung/Integration | Exklusiv GC · Automatisierung & Integration, PR184 |
| Abnahme/Production | Martin; ausdrückliche Productionfreigabe getrennt |

Für den gemeinsamen Entwicklermodus ist noch kein Codeowner und kein Implementierungspaket beauftragt. Zu entscheiden: lokale Zugangsgates und spätere Rollen; Zielgeräte/Budgets; Umfang/Anzahl Checkpoints; Audio-/Anhanglimits und Aufbewahrung; Empfänger und Rechte der Batchbrücke; Speicher-/Exportformat; bewusstes Zusammenführen mit PR153. Entscheidungen im Design als pending schriftlicher Prüfung führen.

Genau nächster Schritt: Martin prüft diesen schriftlichen Entwurf, besonders Bibliotheksumfang, Entwicklermodus, Export-zuerst und Pizzeria-Pilot. Danach erst einen abgegrenzten Implementierungsplan und zuständigen seriellen Fachauftrag sichern. Keine neue Implementierung aus dem Dokumenten-PR ableiten.

## 11. Quellennachweise und Eigenprüfung

Unveränderliche Codegrundlagen:

- [Pizza FractionRules](https://github.com/HerrLoeffler/Hausaufgabe/blob/c7d05339f48614c6cbe1f0f0a35801143b9f8d13/games/bruchpizzeria-unreal/Source/Bruchpizzeria/FractionRules.h), [PizzaKitchen](https://github.com/HerrLoeffler/Hausaufgabe/blob/c7d05339f48614c6cbe1f0f0a35801143b9f8d13/games/bruchpizzeria-unreal/Source/Bruchpizzeria/PizzaKitchen.h), [Pizza Übergabe](https://github.com/HerrLoeffler/Hausaufgabe/blob/c7d05339f48614c6cbe1f0f0a35801143b9f8d13/workstreams/bruchpizzeria-unreal-20261007.md).
- [ExpeditionEpisode](https://github.com/HerrLoeffler/Hausaufgabe/blob/a56b2a6bca8fab0a708dcb3d4e64a6a1d486949b/games/escape-expedition-unreal/Source/Expedition/Core/ExpeditionEpisode.h), [ExpeditionInput](https://github.com/HerrLoeffler/Hausaufgabe/blob/a56b2a6bca8fab0a708dcb3d4e64a6a1d486949b/games/escape-expedition-unreal/Source/Expedition/Core/ExpeditionInput.h), [Expedition README](https://github.com/HerrLoeffler/Hausaufgabe/blob/a56b2a6bca8fab0a708dcb3d4e64a6a1d486949b/games/escape-expedition-unreal/README.md).
- [IslandRules](https://github.com/HerrLoeffler/Hausaufgabe/blob/28a60a34695f6c147d9a3ee71633adb09414c32e/games/lerninsel-unreal/Source/Lerninsel/Core/IslandRules.h), [IslandFoxCue](https://github.com/HerrLoeffler/Hausaufgabe/blob/28a60a34695f6c147d9a3ee71633adb09414c32e/games/lerninsel-unreal/Source/Lerninsel/Core/IslandFoxCue.h), [main Lerninsel Übergabe](https://github.com/HerrLoeffler/Hausaufgabe/blob/59dd0a501a28c04c36ee877450239bf1d64a3187/workstreams/lerninsel-layouts-20261007.md).
- [PR153 Workflowquelle](https://github.com/HerrLoeffler/Hausaufgabe/blob/f40401f3c8e66313fb0cb9d67a71229bcf56e1f5/docs/games/GREAT_GAMES_WORKFLOW.md), [Teamregeln](https://github.com/HerrLoeffler/Hausaufgabe/blob/f40401f3c8e66313fb0cb9d67a71229bcf56e1f5/docs/games/GAME_TEAM_WORKFLOW.md), [bestehende Taskübergabe](https://github.com/HerrLoeffler/Hausaufgabe/blob/f40401f3c8e66313fb0cb9d67a71229bcf56e1f5/workstreams/great-games-production-20261006.md).

Zusätzliche aktuelle Plattformquelle: [GRADECREW_STATE am geprüften main](https://github.com/HerrLoeffler/Hausaufgabe/blob/59dd0a501a28c04c36ee877450239bf1d64a3187/GRADECREW_STATE.json), reviewModeImplementation. Webpfade als Vertragsprüfkandidaten, nicht als fertige native Verbindung.

Eigenprüfung des Entwurfs: beauftragte Nutzeranforderungen versus technische Vorschläge getrennt; Architektur/Komponenten, Datenfluss, Fehlerbehandlung, Abnahmematrix, Kosten und Zuständigkeiten beschrieben; PR153 unverändert, vorhandene Task-ID fortgeführt; historische Taskkollision markiert; keine fertige gemeinsame Runtime/Bridge, native CI, iPadfreigabe, Mac Live Coding oder deployte Umsetzung behauptet. Reine Dokumentation: keine neuen Runtime-/Asset-/Build-/Test-/Provider-/Deployvorgänge. Öffentlich lesbare Quellen enthalten keine Zugangsdaten/Schülerdaten in diesem Entwurf.
