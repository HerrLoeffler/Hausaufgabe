# Level 1 — ausführliche Abnahme- und Evidenzmatrix

Task GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011. Diese Matrix beschreibt **spätere** Prüfungen des freigegebenen Referenzkandidaten. **Heute sämtliche Runtimezeilen NICHTGEPRÜFT; keine Tests, Builds, Spielstarts oder OS-Captures ausgeführt.** A/B-Planreviews beurteilen nur, ob Kriterien und Quellen stimmig sind. Auswahlprofil D und Schrittprofil S werden separat nach [Variantenblatt](auswahlvarianten.md) beurteilt; T07/I10 bedeuten nur in D keine Fußauswahl, S benötigt alle zusätzlichen S-I01–09 samt wirklichem Steinkörperkontakt.

**PASS**: erwartete Wirkung am exakt gebundenen Kandidaten tatsächlich belegt. **FAIL**: beobachtete Abweichung mit reproduzierbaren Schritten. **NICHTGEPRÜFT**: kein tragfähiger Beleg, fehlende Session-/Inputbindung, Toolproblem oder nicht ausgeführt. Ein Erfolg der Toolanforderung ohne sichtbare Wirkung ist kein PASS. Keine stillen Ausnahmen: ein bewusst ausgenommener Scope erhält Grund, Owner und neuen Auslöser im Bericht.

Belegtypen: **F** = isolierte Automation/Fixture, ggf. kontrolliert positioniert; **N** = normale echte native/OS-Events, kein Teleport/ForceComplete/SetFlags; **V** = gespeicherte tatsächliche Spielansicht/Video; **D** = Dateihash/Manifest/Sourcevergleich; **M** = echte Messserie mit Gerät/Viewport/Verfahren. F/V allein ersetzen niemals N.

## Pflichtmanifest jedes späteren Prüflaufs

Task/Tester, UTC-Zeit, Commit und Source-Diff, Game-/Module-/Map-/Assethashes, konkreter Prozess/Projekt/Viewport, Gerätemodell/OS, Engineversion, Renderer, Auflösung/DPI, FOV/MouseSensitivity, Mode/Save-/Preferences-Slot, Startzustand und Herkunft des Snapshots, qualifizierter Inputweg, Reihenfolge Press/Release, Ergebnisse, Bild-/Log-/Videohashes. Recorder-Slot exklusiv. Keine anderen Fenster/Schülerdaten aufnehmen. Anonymes/synthetisches Testprofil. Keine fremden Spielprozesse beenden.

Bei Saveprüfungen: Normal-/Referenz-/Handoff-Dateihashes vor/nach, fehlgeschlagene Speichervorgänge getrennt. Bei Fixture-Recovery: bewusst injizierte ungültige Werte als F markieren, nicht als normal gespielter Ablauf. Keine nachträglich geänderte Quelle einer alten Binary zuordnen.

## A. Raum, Oberfläche und Bewegung

| ID | Spätere konkrete Aktion | PASS-Kriterium / erwartete Wirkung | Späterer Beleg / Owner | Heute |
|---|---|---|---|---|
| T01 | W0 starten, zum Hügel und zur Probe gehen | Sichtbarer Weg deckt sich mit tatsächlich erreichbarer Route; keine Chatklärung nötig | N+V, A/B | NICHTGEPRÜFT |
| T02 | W bis Kuppe, dann zur Probe; kein Sprung | Normaler Aufstieg ohne Stopp/Schweben/Rutschen/Recovery | N+V+Floor/Pose, A | NICHTGEPRÜFT |
| T03 | S vom Scheitel bergab; anschließend drehen und W hinunter | Beide Laufrichtungen bleiben auf sichtbarer Oberfläche | N+V, A | NICHTGEPRÜFT |
| T04 | A/D quer am unteren, mittleren und höchsten Profil | Keine seitliche Unbegehbarkeit im erlaubten Hauptband | N+V+M Normale, A | NICHTGEPRÜFT |
| T05 | Profilgitter/Floortraces gegen Rendervertices prüfen | Abweichung≤2 cm, normale Flächennormale≤18° längs/8° quer | F+M, A; zusätzlich T02–04 erforderlich | NICHTGEPRÜFT |
| T06 | Übergang Terrain→Probe langsam/schnell/rückwärts gehen | Kein sichtbarer Spalt, Doppelboden, Z-Fighting oder unsichtbare Stufe | N+V+F, A/B | NICHTGEPRÜFT |
| T07 | Über Wortkörper/Bevels und Steinübergänge gehen | ≤10-cm-Platten/≤5-cm-Kanten verhindern keine normale Passage; kein Antworttoggle | N+V+State, A | NICHTGEPRÜFT |
| T08 | Torbogen/Pfosten in verschiedenen X/Y-Anfahrten | Capsule/Kopf passt bei geöffnetem Tor; keine unsichtbare Querbarriere | N+F Sweeps+V, A | NICHTGEPRÜFT |
| T09 | Baum/Fels/Küstenrand tangential und frontal anlaufen | Sichtbare feste Form blockiert, Laub blockiert nicht, keine unsichtbare Vorwand | N+F+V, A | NICHTGEPRÜFT |
| T10 | Erkennbare Randbegrenzung und breiten Vorplatz erkunden | Kein erreichbarer ungesicherter Fall-/Wasserrand; Weg erlaubt Rückkehr | N+V, A/B | NICHTGEPRÜFT |
| T11 | Eigene Fixtureposition unter Terrain/außerhalb Zone setzen | SafePose mit unveränderten validen Lernflags, Eingabe gestoppt, Rückmeldung | F+D+V, A; kein Playtest-PASS daraus | NICHTGEPRÜFT |
| T12 | Normalen Gesamtlauf beobachten | Recovery wird nie benötigt; sonst Gelände-FAIL trotz erfolgreichem Rücksetzen | N+Log+V, A | NICHTGEPRÜFT |
| T13 | Anstieg mit Blick auf Tor/Meer, FOV75 und85 | Kein erzwungenes Headbob/Blickschwenken, Neigung bleibt angenehm kontrollierbar | N+V, A/B | NICHTGEPRÜFT |
| T14 | Kandidaten-Properties auslesen | Capsule30/88, StepHeight30, Speed420; tatsächlicher FloorAngle/Z und Scale protokolliert | F+Source+D, A | NICHTGEPRÜFT |

## B. E/Klick, bewusste Auswahl und Fehler

| ID | Spätere konkrete Aktion | PASS-Kriterium / erwartete Wirkung | Späterer Beleg / Owner | Heute |
|---|---|---|---|---|
| I01 | Gleiches Intro-Wort ansehen; E und Klick in getrennten Versuchen | Exakt dasselbe sichtbare Target, gleicher einmaliger Toggle | N+V+State, A | NICHTGEPRÜFT |
| I02 | Auf benachbarten Rand zweier Worte zielen | Markierung/Hit eindeutig; nicht heimlich das nur nähere Wort wählen | N+F Hitlog+V, A | NICHTGEPRÜFT |
| I03 | Bei225 cm und knapp darüber anvisieren/aktivieren | Reichweitengrenze konsistent; außerhalb keine Stateänderung | F+N+M Distanz, A | NICHTGEPRÜFT |
| I04 | Wort hinter sichtbarer Wand/Stamm/geschlossenem Tor anvisieren | E und Klick durchdringen keine feste Verdeckung | F+N+V, A | NICHTGEPRÜFT |
| I05 | E halten, loslassen; erst danach erneut drücken | Ein Toggle pro vollständigem Pressintent, kein Repeat/Release-Toggle | N+Inputlog+State, A | NICHTGEPRÜFT |
| I06 | Linksklick halten/ziehen/loslassen | Genau eine Worldaktion, Drag/MouseUp keine weitere | N+Inputlog+V, A | NICHTGEPRÜFT |
| I07 | Zwei getrennte schnelle Klickzyklen auf ungelösten blauen Introstein | Erste Auswahl, bewusste Rücknahme erhalten; kein grober Debounce-Verlust | N+F+State, A | NICHTGEPRÜFT |
| I08 | Kontrollierte doppelte Dispatchs im selben Frame auf gleichesTarget | Nur ein Intent/Toggle; getrennte bewusste Zyklen werden nicht zusammengelegt | F+Inputlog, A; I07 bleibt eigener N-Beleg | NICHTGEPRÜFT |
| I09 | E und Klick gleichzeitig auf gleiches Target | Kein sofortiges Hin-/Hertoggle; konservativ ein Worldintent | N+F+State, A | NICHTGEPRÜFT |
| I10 | Über alle Platten gehen, 0,3/1/5 s stehen | Neue Referenz wählt ohne E/Klick nichts; Legacy-Dwell bleibt Kontrollfall | N+F+State, A | NICHTGEPRÜFT |
| I11 | Kamera auf Nicht-Target/zu fernes Wort | Keine Phantomwahl; Hinweis nur eindeutig/passend | N+V+State, A/B | NICHTGEPRÜFT |
| I12 | Wort aus Hügel-/Randhöhe ansehen | Actual Queryfläche/Erreichbarkeit passt zum sichtbaren Wort; keine Untergrundantwort | N+F+V, A | NICHTGEPRÜFT |
| I13 | Menü über Wort öffnen, dort klicken/Enter/MouseUp | Keine darunterliegende Worldaktion | N+F+State, A | NICHTGEPRÜFT |
| I14 | Nach offenem Wort-Hinweis Escape/Resume und neu aktivieren | Alte Pointer-/Tastenbesitze verworfen, neue bewusste Aktion funktioniert | N+F+V, A | NICHTGEPRÜFT |

| ID | Fachlicher Ablauf | PASS-Kriterium | Späterer Beleg / Owner | Heute |
|---|---|---|---|---|
| P01 | `laufen` und `singen` wählen | introMask5, intro true; automatische Torfolge ohne Confirmbox | N+F+State+V, A/B | NICHTGEPRÜFT |
| P02 | Erst `Baum`, dann `blau` oder anderes falsches Paar | Beides sichtbar, Tor geschlossen; kurze konkrete Korrektur statt Strafverlust | N+F+V, A/B | NICHTGEPRÜFT |
| P03 | Drittes Wort bei2 falschen gewählten probieren | Maximal2, keine heimliche Ersetzung; Rücknahmehinweis | N+F+State, A | NICHTGEPRÜFT |
| P04 | Blaues ungelöstes Intro-Wort erneut wählen | Nur dieses Wort weg, Zähler/Material/Text konsistent | N+F+V, A/B | NICHTGEPRÜFT |
| P05 | Noch kein/ein Wort wählen, warten/Pause | Kein Autoerfolg, kein Timeout/Strafsignal, Zustand erhalten | N+F+State, A/B | NICHTGEPRÜFT |
| P06 | Richtige Folge `singt`→`sucht`→`öffnet` | Path0/4/8, Count3, verbs true, Auto-Tor | N+F+V, A | NICHTGEPRÜFT |
| P07 | Reihe2 oder3 vor aktueller erwarteter Reihe wählen | Count/alteAntwort unverändert, knapper Richtungs-/Reihenhinweis | N+F+V, A/B | NICHTGEPRÜFT |
| P08 | Falsches Wort in aktueller Reihe wählen | pathFailed true, genau diese Auswahl nachvollziehbar, nächste gesperrt | N+F+State+V, A | NICHTGEPRÜFT |
| P09 | Rücknahme22 bzw. letztes gewähltes Wort erneut wählen | Genau letzter Schritt entfernt; frühere richtige Reihen bleiben | N+F+State+V, A | NICHTGEPRÜFT |
| P10 | Früheres gewähltes Wort bei noch späterem Schritt aktivieren | Keine inkonsistente Arraylücke; klarer Verweis auf letzteRücknahme | N+F+State, A/B | NICHTGEPRÜFT |
| P11 | Fehler korrigieren, dann Restfolge lösen | Progression nicht dauerhaft blockiert; richtige Autoauswertung | N+F+V, A/B | NICHTGEPRÜFT |
| P12 | Wiederholte Eingabe auf bereits gelöster Probe/Route | Kein doppelter Fortschritt, kein unbeabsichtigter Neustart | N+F+D, A | NICHTGEPRÜFT |
| P13 | H/stufigeHilfe aufrufen, wiederholen, schließen | Verständlich, freiwillig, ohne Zeit-/Punkteverlust, keine Lösungspflicht | N+F+V, B | NICHTGEPRÜFT |
| P14 | Kontext zuBaum/Verb ansehen | Kontext gehört eindeutig zum Wort, erklärt Handlungsbegriff ohne falsche Farbbedeutung | N+V, B | NICHTGEPRÜFT |

## C. Tor, Abschluss, Folge und Zonenauftrag

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| G01 | Nach letzter richtiger Wahl direkt gegenTor gehen | Erfolg sichtbar, animierendesTor blockiert bisGateAngle≥89,9° | N+F+V+Anglelog, A | NICHTGEPRÜFT |
| G02 | Falsche/unvollständigeAntwort amTor | Geschlossen, keinColliderbypass; Fortschritt nichtfingiert | N+F+V, A | NICHTGEPRÜFT |
| G03 | Voll geöffnetesTor mittig/seitlich vorwärts/rückwärts passieren | TatsächlichefreiePassage fürCapsule/Kopf, nurpassendeBarriereentfernt | N+F+V, A | NICHTGEPRÜFT |
| G04 | Öffnung beiPause unterbrechen/resumen | EindeutigerstabilerCollider-/Animationszustand, keinTorclip | N+F+V, A | NICHTGEPRÜFT |
| G05 | BeideTore/Leitungen ausRätselvorplatz betrachten | Ursache/Wirkung klar, keinDekotor überlagert Route | N+V, B | NICHTGEPRÜFT |
| C01 | Route lösen und wirklichdurchAusgang gehen | Abschluss erstanrichtigemräumlichemPunkt, keinneuesPflichträtsel | N+F+V, A/B | NICHTGEPRÜFT |
| C02 | „Weiter zumSatzgarten“ normalaktivieren | BestehendeZielkarteerreichbar, validergetrennterHandoffsave, normalerSaveunverändert | N+D+V, A | NICHTGEPRÜFT |
| C03 | Übergang ohnegelösteRoute/injiziertungültigenState | KeinunberechtigterHandoff, sichereRückmeldung | F+D, A | NICHTGEPRÜFT |
| C04 | Übergangsschreib-/Mapfehler kontrolliertsimulieren | KeinErfolgsbanner, Referenzversuchbleibtwiederaufnehmbar | F+D+V, A | NICHTGEPRÜFT |
| C05 | Fixturekamera inVerbwegbeiungelöstemIntro | AuftragbleibtIntro; explizitFixturelage, nichtNormalflow alsbugbehaupten | F+V, A/B | NICHTGEPRÜFT |
| C06 | TatsächlichennormalenZonenwechsel spielen | KeinwidersprüchlicherPflichtauftrag/Ortsname, Gate erklärtGrenze | N+V, B | NICHTGEPRÜFT |

## D. Menü, Fokus, Kamera und Zugänglichkeit

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| F01 | AlleMenüs nurTab/ShiftTab/Enter/Space bedienen | LogischerumlaufenderFocus sichtbar; gleicheAktionen erreichbar | N+V, A/B | NICHTGEPRÜFT |
| F02 | Slider perPfeilen/Maus, FOV75/85 | Zahlen-/Blickwirkungkonsistent, Grenzen0,25–3; keinWorldclick | N+F+V, A | NICHTGEPRÜFT |
| F03 | AltTabwährendW/AoderMousepress | SofortPause/Inputcancel, keinBlindweiterlaufen | N+F+V, A | NICHTGEPRÜFT |
| F04 | MitweitergehaltenerTastezurückkehren undResume | AlteBewegungbleibtneutral, neuebewussteInputsgehen | N+Inputlog+V, A | NICHTGEPRÜFT |
| F05 | EscinPlaying/Help/Settings/Confirm/Pause | JeweilsnurdefinierteStufeschließen, keinDoppelsprung | N+F+V, A/B | NICHTGEPRÜFT |
| F06 | Pause überunpassenderWortwahl | Antwortenbleiben, Contact/Pendinginputneutral, keineWeltaktion | N+F+D, A | NICHTGEPRÜFT |
| F07 | ZehnSekunden/Mausstillstand/mehrminütigesZögern | KeinTimeout/Strafdruck; manuelleHilfezugänglich | N+V, B | NICHTGEPRÜFT |
| F08 | Kamera±Pitch/FOVdurchKuppe/Vorplatzdrehen | KeineZwangsblicke, Kopfgeometriekeinclipping, Zielebleibenfindbar | N+V, A/B | NICHTGEPRÜFT |
| U01 | Baseline/KandidatgleichePosenlesen | NeuerHUDkurz, keineTextwand, keinePflicht-/Menüüberschneidung | V+M Flächen, B | NICHTGEPRÜFT |
| U02 | AlleWörteraus2–3m/typischemBlickwinkellesen | ZielPixelgrößen/Neigungpassen, keinZoom/Raten nötig | N+V+M, B | NICHTGEPRÜFT |
| U03 | FOV75/85und1280×800/1440×900 | Text/Buttons/Targetmarken nichtabgeschnitten/verdeckt | N+V+M, A/B | NICHTGEPRÜFT |
| U04 | Auswahl/richtig/falsch/help/focus/disabled untersuchen | Text/Form zusätzlichzuFarbe, ganzePlatteblauohneHäkchen | N+V+M Kontrast, B | NICHTGEPRÜFT |
| U05 | Spielstummspielen, Schatten-/Farbvergleich | WichtigeWirkungvisuellverständlich, keineSoundpflicht | N+V, B | NICHTGEPRÜFT |
| U06 | Hügel/Probe/GartenohneChatbeschreibungfinden | EineerkennbareRoute, freieLernzone/klareLeitungswirkung | N+V+qualitativeNotiz, B | NICHTGEPRÜFT |
| U07 | Text-/UIKontrastmessen, helle/dunkleRenderzustände | Textziel4,5:1/Control3:1; kritischeZuständelesbar, keineRechtszertifizierung | V+M, B | NICHTGEPRÜFT |
| U08 | Natur-/Material-/LichtvergleichmitReferenzrollen | SonnigerHimmel, matteSteine, ruhigeVegetation, eigeneSilhouetten | V+Assetquellen, B | NICHTGEPRÜFT |
| U09 | Start/Restart/Endknöpfe prüfen | WenigeElemente, verständlicheBeschriftung, fairerAbbruch; keinFake-ET | N+V, B | NICHTGEPRÜFT |

## E. Speichern, Wiederaufnahme und Isolation

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| S01 | Leerer/valider eigenerSave Start/Weiter | NurvalidesReferenzsavebietetWeiter; keinnormalerSlot gelesen | N+F+D, A | NICHTGEPRÜFT |
| S02 | AufKuppepause/schließen/neuWeiter | Boden-/CapsulefreiepassendePosition/Blick, keinResetwegenalterXRange | N+F+D+V, A | NICHTGEPRÜFT |
| S03 | Nach1Introauswahl/Falschpaar/PathWrong speichern | ExakteAntwort/Rücknahmefähigkeitbleibt; keinPhantomgate | N+F+D, A | NICHTGEPRÜFT |
| S04 | NachrichtigerAntwort/amoffenenTor resumen | GelösteFlagserhalten, sicherePosition/Collider, keinClip | N+F+D+V, A | NICHTGEPRÜFT |
| S05 | NaN/View/falscheScenarioId/LayoutRevision/hinterTor injizieren | UngültigePoseabgewiesen; valideFlagsnichtverloren; keineFremdimports | F+D, A | NICHTGEPRÜFT |
| S06 | Neustartabbrechen/bestätigen | Abbruchunverändert; BestätigungnurReferenzversuchleer, Bedienpräferenzenbleiben | N+F+D, A/B | NICHTGEPRÜFT |
| S07 | NormaleSave-/Preferencesdateienvor/nachallenFällenhashen | Bytegleich; Handoffslotseparat | D+N/Fausgewiesen, A | NICHTGEPRÜFT |
| S08 | KontrolliertenSchreibfehler erzeugen | KurzeehrlicheMeldung, keinefalscheDauerhaftigkeitsbehauptung | F+D+V, A | NICHTGEPRÜFT |
| S09 | GültigealteunbestätigteIntroMask5/Path0,4,8 laden | VorhandeneAuto-Check-Regelkorrekt; ungültigeVariantenbleibengesperrt | F+D, A | NICHTGEPRÜFT |
| S10 | ReferenzmapdirektinEditor-PIEohneCLIFlag starten | ModeoverrideverhindertProduktionsslot; richtigerisolierterState | F+D, A | NICHTGEPRÜFT |

## F. Gesamtsequenz, Performance, Rechte und Reviewbelege

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| N01 | UnunterbrochenerkorrekterLaufW0→Exit→Anschluss | NurqualifizierteNormalinputs, echteAufgaben/Passagen, keineFixtures | N+Video+D, A/Bseparat | NICHTGEPRÜFT |
| N02 | NormalerFehler-/Hilfe-/Pause-/Korrekturlauf | OhneChatErklärunglösbar, keineblockierendeSackgasse | N+Video+D, A/B | NICHTGEPRÜFT |
| N03 | Bauteilerkennen/fachlichesErgebnisfesthalten | AufgabenlösungausInputsbelegt; Lernerfolgnichtverallgemeinert | N+anonymeNotiz, B | NICHTGEPRÜFT |
| M01 | Startwarm/kalt/erstmalsmitShaders getrenntmessen | Ziele10s/30sausBriefingmitbenanntemGerät/Buildausgewiesen | M+Log, A | NICHTGEPRÜFT |
| M02 | FramezeitanKuppe/Probe/Tor/Vegmindestens60sjeBereich | 60FPSZiel, p95≤20ms/p99≤33ms oderklarerBefund; keinVsyncfake | M+Trace, A | NICHTGEPRÜFT |
| M03 | Asset-/SpeicherdiffgleicherBasis/Referenzbuild | VorläufigeZiele≤100MiBAssets/≤500MiBMehrspeicherbelegtoderBefund | M+D, A | NICHTGEPRÜFT |
| M04 | Asset-/Font-/Audioregisterdurchsehen | KonkreteHerkunft/Lizenz/Quelle/Import; lokaleDateialleinkeineRechte | D+Review, B/Artowner | NICHTGEPRÜFT |
| M05 | PrüfreportstetsinfrischemVerzeichniserzeugen | ExakteSuiten/Success/0inProcess; fehlenderTestnichtaltergrünerReport | F+D, A | NICHTGEPRÜFT |
| M06 | UnverändertenNormalprototypkontrollieren | BestehendeCore/Saves/zweiterEimer/Fuchsbereichnichtbeschädigt | F+begrenzterNKontrolllauf, Owner | NICHTGEPRÜFT |
| R01 | AundBaufgleichemKandidatengetrenntprüfen | GleicheHashes, eigeneSlots, exklusiveTimeslots, unabhängigeErstberichte | D+Review, Koordinator | NICHTGEPRÜFT |
| R02 | NachBefundfixnurbetroffeneChecksplusnötigeRegression | NeueBelegeamneuenHash, keineEndlosrunde/FalschübernahmealterBilder | D+F/N, Owner | NICHTGEPRÜFT |

## Heutige Evidenz und explizite Grenzen

Historischer L1-Report10.10.2026 bindet231portableChecks/5UE-Suites/zehnPIE-Posebilder an a5dc474. Er ist **kein** Beleg irgendeiner obigen neuen Level1-Zeile. Die Kamera02 mit ungelöstemIntro demonstriert einen Fixturezustand, keinen heutigen normalen Durchlauf. Source-Lesen bestätigt Schnittstellen, nicht Realzeitverhalten. Im Planreview dürfen A/B die **Planabdeckung** mit PASS/FAIL/NICHTGEPRÜFT bewerten; jedes Label muss „PLAN“ und Dokumentcommit nennen.

Endabnahme priorisiert tatsächliche Blocker: sichere Bewegung/korrekterLernkern, Saveisolation, klareAktion, lesbarePflichtinfo, erreichbarerAbschluss. Ein kritischerFAILblockiertbetroffeneFreigabe; nichtgeprüfteiPad-/Webfunktionenwerden nichtalsMac-PASSausgegeben. B muss alle Annahmen zur lernschwachenZielgruppe nennen. Ein künstlicherKI-Durchlauf ist keine echteKinderstudie.
