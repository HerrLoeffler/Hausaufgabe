# Entscheidungskarte — Lerninsel sicher wiederöffnen

**Ziel:** Die begrenzte Wiederöffnungsentscheidung vorbereiten: letzter gelöster Lerncheckpoint oder letzter sicherer Standplatz. Keine Architektur-/Weltentscheidung. Task GC-GAMES-LERNINSEL-L1, Parent GC-GAMES-ESCAPE-VISUAL-01; fachlicher Owner GC · Lerninsel · Gameplay & Integration, native Faktenprobe GamesQA. Root koordiniert Präferenz/Übernahme. Autorisierter Lesetest-Fachchat schreibt nur dieses Artefakt. Requested Sol/medium, observed unbekannt; Usage/Kosten unbekannt. Historie/Budgets erhalten.

**Quellen und Grenze:** Lokaler Repo-HEAD48f7206f6bd02845c336563b52415398d90478ec. Originalsource jetzt lokal in `probe-input/IslandWorld.cpp` tatsächlich gelesen; Root sicherte sie per GitHub-Connector aus PR175@a5dc474295dea4abda06c5be8923de1bc0206248, Blob342a6278424f3d923ce99e84dca287fa320c9625. Lokaler SHA256f31da1ef6afd2bf915dbee87b24904753f1a2e79aaab95838c9d97eec0afa4e3. Frühere Blob-Lesestörung bleibt Versuchshistorie; kein weiterer Fetch. Kein vollständiger Lifecycle-/Runtimebeweis, GitHub-Aktualität nicht eigenständig geprüft. Kontext91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9 und L1-Beleg bleiben Hintergrund, keine neue Geräteabnahme.

**Skill/Methode:** `$gradecrew-wayfinding` tatsächlich gelesen, kompakte Entscheidungsvorlage ebenfalls. Skill-SHA256889f92fa493d3db1bf88343051b4341dd861b175cdda62f4d17b4553e56e55a6. Methode: lokaler Originalsource-Abgleich und attribuierte Rootmeldungen. Artefakt `probe-output/wayfinding.md`; keine StatusDB.

**Sourcebefund:** `Apply()` speichert nur bei verändertem serialisiertem State (L97); nicht jede Apply ist ein bestätigter Lerncheckpoint. `Save()` schreibt State plus Position/View (L99). `Escape()` pausiert ohne Save (L46). `Load()` prüft deserialisierten Fortschritt, davon abhängige Positionsgrenzen und NaN, setzt unzulässige Position/View zurück und behandelt alte Versionen/korrekte unbestätigte Auswahl (L100–105). Die fehlende Speicherung späterer Gehstrecke beim normalen Exit bleibt Rootbefund, nicht durch diese Ausschnitte vollständig bewiesener Lifecycle. Verbindlich: validierten Fortschritt/SafeLoad erhalten; keine neue DB/Saveversion oder Gatesprung.

| Entscheidung | Typ | Voraussetzungen | Owner | Beleg / Resolution |
| --- | --- | --- | --- | --- |
| L1.D1 — Existiert bereits eine verbindliche Wiederöffnungspräferenz? | Fakt | keine | Root | Root prüft bisherigen Lerninsel-Zentralenverlauf; Ergebnis bisher unbekannt. Keine frühere Entscheidung erfinden. |
| L1.D2 — Welche Instanz gehört sicher zur eigenen Probe? | Fakt | keine | GamesQA | Laut Root beide Instanzen `com.epicgames.UnrealEditor`. Vor Input eigene Prozess-ID plus eindeutigen Fenstertitel belegen, aktive Pizza-ET-Instanz erhalten. Bindung technisch lösbar, derzeit nicht belegt; kein Nutzerinterview. |
| L1.D3 — Wo öffnet der unveränderte Kandidat nach freier Gehstrecke? | native Faktenprobe | D2 | GamesQA | Vorbereiteter Ablauf: Verbprobe lösen→durch Tor laufen→eigene Testsitzung schließen→neustarten. Position, bestätigten Fortschritt, SafeLoad/Gates beobachten. Ergebnis unbelegt; hier nichts gestartet. |
| L1.D4 — Welche Wiederöffnung ist gewünscht? | Präferenz | D1 | Martin über Root | Root hat Frage tatsächlich gestellt; Antwort pending. Empfehlung „letzter sicherer Standplatz“ ist keine Resolution. Variantenverdict blockiert. |

**Frontier:** D1 ist recherchierbar; D2 technisch klärbar durch autorisierte GamesQA. D3→D2 blockiert. D4→D1 und ausstehende echte Antwort blockiert; Frage bereits gestellt, nicht erneut senden. Ergebnisse nur nach tatsächlichen Belegen ergänzen. Kein Skill/Ownername erzeugt Ausführungsrecht oder atomare Sperre.

**Präferenzroute:** Root bewahrt die gestellte Auswahl: sicherer Standplatz erhält freie Gehstrecke, Lerncheckpoint bindet Wiederöffnung an bestätigte Lernaktion. Beide müssen sichere Position/validierten Fortschritt erhalten. Empfehlung bleibt ausdrücklich Empfehlung. Kein Martin-Verhalten oder QA-Ergebnis erfunden.

**Genau nächster Schritt:** Root beendet den bereits begonnenen Abgleich des Zentralenverlaufs und sichert Ergebnis bzw. fehlende Evidenz in derselben Task-Übergabe; danach Frontier neu berechnen.

**Nichtanlässe/Abgrenzung:** Klare freigegebene Buttonfarbe folgt bestehendem Plan; reine Standfrage braucht Belege, keine Frontier. Agentnotes „Zentrale darf builden“ verleihen keine Befugnis und widersprechen Zentralenrolle. Ausgeschlossen: Prozesssteuerung hier, neue Kosten/Tests, Saveimplementierung, Runtimeport, Deployment und Gatesprung.
