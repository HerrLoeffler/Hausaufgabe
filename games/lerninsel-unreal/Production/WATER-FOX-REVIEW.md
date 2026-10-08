# Wasser, Fuchs und Steuerung – Prüfnachweis

Task GC-GAMES-ESCAPE-VISUAL-01 · Branch feature/lerninsel-ego-v1 / Draft-PR175. Erster3/10-Versuch und frühe Bedienung wurden von Martin positiv getestet. Neue Funktionen sind lokal gebaut und technisch geprüft; eine neue Kinder-/Geräteabnahme liegt noch nicht vor.

## Ergebnis

Derselbe1-Liter-Messbecher lässt sich von der bereits gelösten3/10-Platte zurückholen. Der zweite Bereich bietet100ml/200ml-Zuläufe und100ml-Ablauf. Neue Aufgabe: auf1000mlfüllen und ins Zielbecken eingießen. Teilfüllungen ändern weder Becken noch Tor.200mlbei900mlwerden vollständig abgelehnt. Doppelinput zählt pro0,6sHub einmal. Erfolgreiches Eingießen leert die getragene Kanne, füllt das Becken2s und erlaubt erst danach die Toranimation. LI3 speichert den expliziten Pournachweis; LI1/LI2 bleiben lesbar und alte gelösteBruchwege gültig.

Der Fuchs ist ein echter, beweglicher prozeduralerActor mit26Körper-/Gesichtsteilen, eigenem Stein-/Lebendmaterial, Beinen, Pfoten, Ohren, Augen, Schwanz, Maul und zugehörigem Seilriegel. Richtige Satzlösung schließt die UI und zeigt zunächst zum Fuchs. Wachen, Aufstehen, Lauf, Greifen und Ziehen sind an feste Zeitphasen gebunden. Riegelfreigabe8,4s, Toröffnung1,4s, danach weiches Hinsetzen bis10,6s und leichte Lebendbewegung. Falsche Sätze wecken ihn nicht. Die Kette ist ein vereinfachter Animator, kein fertigerSkeletalMesh-/NavMesh-/Seilsimulator.

Nach gelöstem Satz bietet Esc→Fuchsaktion erneut ansehen die Wiederholung. Sie versetzt vor die Szene und setzt nur Animations-/Torpose zurück; alle Lernflags, Mengen und derselbeActor bleiben erhalten. NeueBenutzertests bleiben offen.

Mausregler25–300%, Standard100%; beide Blickachsen skalieren gleich. Einstellungen liegen in separatemSlot. Figur420cm/s statt230cm/s. Ein normaler Spielfokusverlust pausiert die Szene und cancelt ausstehende Eingaben; nach Rückkehr bleibt das Pausenmenü bisWeiter. UnattendedValidierung verwendet den echtenAdapter explizit, statt ihre Renderclock an OS-Fokus zu binden. Kein echter OS-/iPadfokustest behauptet.

## Frische gesamte Prüfung

**2026.10.08-16.56.16UTC:** DevelopmentEditor gebaut, **195portableChecks(64+88+7+24+12)**, **vierUE-Suites erfolgreich**, **0Fehler/8Warnungen**. Alle Warnungen sind der mitgelieferteEpicx86idevice_id-Helfer aufARM. NativeWidgetbedienung ist kein menschlicherDesktop-Hittest; Sliderdruck/Release werden nativ geprüft, gehaltenes Ziehen über mehrereTicks und echtesiPad bleiben offen.

Native Belege: normalerE-Rückholpfad von ersterPlatte, gleicheKannenidentität, Hubzeit/Doppeleingabe/Pause, Ablauf,900ml-Grenze, volleKanne/Leerung, Becken-/Torfolge; Materialverwandlung, Weltbewegung, gerenderterSeil-Endpunkt amMaul, Pause/Fokusadapter, Riegel8,4s, physischerCapsule-Sweep während und nachTürschwenk, Recheck/Load/Replay ohneRestart/Duplikat/Flagverlust.

20aktuelle Spiel-/UI-Aufnahmen. Fox-Stone/Waking/Walking/Grip/Pull/Open und New-WaterStation/Instructions wurden gesehen. Four-RouteUI.png ist historische Aufnahme des verworfenen Hauptdialogs. TatsächlicheFuchsgeometrie und Umgebungsart sind einfacher als die120Konzeptstudien. Quellen/Prompts/Originalbilder in docs/games/lerninsel/20261008-fox-water.

## Unabhängiger Schlussreview

Ein frischer read-only gpt-6-astra/high gegen211fc30..ffb4172 fand keineCritical, eineImportant/P2(Fokusverlust lief weiter) und eineMinor/P3(Pfosten im Laufweg). Pfosten nach Wirkung zuImportant hochgestuft: sichtbare Durchdringung widerspricht präziser Figurenaktion. Beide in genau einemFixpass: nativeRED16:52:30zwei Fehler; danach Fokusadapter pausiert, Pfosten−530→−700, kompletteSuitegrün. Kein zweiterReview. Keine ungeklärten wichtigen Befunde.

## Versuchshistorie

13Native-Testläufe in diesemBlock, zwei vorherigeCompilerfehler ohneEditorstart und ein direkter erfolgreicherFoxBuild. ReineRegler-/Wasser-/FoxCue-Regressionen jeweilsvor Implementierung rot. NativeControls zuerst4Fehler, zweiteStation zuerstfehlendeTargets, Fox zuerstfehlenderActor; roteBerichte erhalten. ErsterOpenGate-Sweep zeigte eine im Boden gestarteteTestkapsel(Actor_0,NormalZ1,StartPenetrating). Gegenprobe90cmfrei; Testpose korrigiert, kein Produkt-Torbug. Replay fehlte zunächst in3nativenAssertions, danachgrün. Schlussreview2Fehler rot→grün. Keine falsche rote oder alteReportfassung als neuer Erfolg verbucht.

Sechs eingebauteimage_gen-Aufrufe, alle erfolgreich:120Studien. Gesamt26Bildaufrufe/385Konzeptmotive, keine120fertigenAssets. Frühere280-Seiten-Buch-/Budgethistorie bewahrt. Kein Web-/Production-/CloudGPU-Vorgang.

## Entscheidungen während der Ausführung

- Beckensockelkorrektur in gemeinsamenTask3Artpass verschoben: FunktionsprüfungTask2wargrün, Aufnahme zeigte1,8mSichtblockade. Korrigiert auf90cmund realen Zielpunkt; im Gesamtlauf erneut geprüft. Kosten einer falschen Entscheidung wären unlesbaresZiel oder unpassendeReichweite; beide wurden geprüft.
- GlobalerSchlussreview folgt Task3Funktionsabnahme gemäßExecutingPlans. Kosten einer falschen Entscheidung wären verspäteteBefunde; genau dafür wurden beideBefunde vorAuslieferung reproduziert und korrigiert.

KeineDeferredMinors. Offen bleiben menschlicherDurchlauf, volleArtqualität, echteiPadabnahme, Browserstreaming und übrigeInselgebiete. NächsterSchritt:Martin startetvorhandenenStarter und prüftEsc→Fuchsaktion sowie die folgende1-Liter-Aufgabe. Statusbranch_only; keinMerge/Deployment.
