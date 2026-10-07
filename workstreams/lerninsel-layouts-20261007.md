# GC-GAMES-ESCAPE-VISUAL-01 Lerninsel Gestaltung

- Aktualisiert UTC: 2026-10-07 22:10
- Verantwortlicher Chat: Ego-Lerninsel und Layoutauftrag vom 07.10.2026; Chat-Link unbekannt.
- Übergeordnete Task-ID: GC-GAMES-ESCAPE-VISUAL-01. Bestehende Amazonas- und Pizza-Versuchshistorie bleibt erhalten.
- Arbeitszustand: Gestaltungsblock gesichert; Bilder und Spielbuch zur Nutzerprüfung.
- Aufgabenbranch: docs/lerninsel-layouts-20261007
- Basiscommit: 12094d9b7ca28458f57605e67618624bc04a34d2
- Gesicherter Entwurfscommit: a87abfe4d11b1223630aa2c6ecf2fca2326e2db7
- Integrationsziel der Dokumentation: main
- Draft-PR: https://github.com/HerrLoeffler/Hausaufgabe/pull/173
- Produkt-Integrationsziel: vor Spielbau festlegen; bestehender Web-Release-Train unverändert.
- Betroffene Dateien: docs/games/witness-analysis-20261007.md und zehn Entwurfsdateien insgesamt in PR173; zentrale TODO/Registry/Übergabe in separatem Koordinationscommit.

## Auftrag

Eigene begehbare Ego-Insel nahe der Optik und dem Rätselgefühl von The Witness, acht Gebiete, vier erste Hauptmechaniken, Klasse5–6 mit Zusatzrätseln. Vor Spielbau ausdrücklich viele Layoutbilder und sehr ausführliche Verhaltensbeschreibung. Bodenwörter gezielt betreten/antippen, Verben markieren, Satzfolge aufbauen; alle Wörter gleichzeitig darf nicht als Lösung gelten. Kein angeforderter 1v1-Multiplayer. Sechs Nutzerbilder gelesen, vier davon als Bildgenerierungs-Stilreferenz verwendet.

## Gesicherte Ergebnisse

- Fünf PNG-Bildtafeln mit je vier nummerierten Motiven: 20 Ansichten, je Tafel1536×1024; zusätzlich Einzelmotiv21 (1536×1024) mit 1-Liter-Eimer und Zehntelskala.
- Spielbuch: 7929 Wörter; acht Gebiete, vier vollständige Beispiele,32Ideen,36Abnahmepunkte.
- Beispiele: Verbpfad, Satzweg, Bruchwasser, Felsfenster. Themen, exakte Inhalte, Abläufe, Fehler, Hilfen, Animationen, Touch, Auswahlbegrenzung, Abbruch und Save/Resume beschrieben.
- Art Bible aus sechs Vorlagen; Maßstab/Blickführung, Baum-/Stein-/Metall-/Wassermaterialien;20Motive zugeordnet.
- Recherche: Originalspiel, Entwicklerquellen, formale Rätseluntersuchung, Unreal/Browser/iPad. YouTube-Gameplayquelle gefunden, kein vollständiges Abspielen behauptet, keine Videoassets heruntergeladen.
- Sämtliche Generierungsprompts im Entwurfsbranch gespeichert.

## Tatsächlich geprüfte Grundlage

START_HERE/AGENTS/STATE/TODO/Workstreams/Registry/CHAT_CONTRACT frisch vonmain gelesen. Development Status37688513297, Job113022431455 erfolgreich und Branch-/PR-/Overlap-Warnungen gelesen. Draft171 gehört der vorhandenen Unreal-Expedition; Head333ab6ed lokalabweichend von95d920b, keine Übernahme fremder Quelle. Dort schräge Folgekamera, nicht neue Ego-Insel. PR171 und PR160 bleiben fremde bestehende Baustellen. Kein Witness-PR vor eigener Arbeit gefunden.

Der gelesene Auditstand meldet unter anderem unklassifizierte Branches, unregistrierten PR171 und Games/Web-Dateiüberschneidungen. Inseldateien sind neue Dokumentations-/Bildpfade. Keine bestehenden Produktdateien verändert. main änderte sich während Recherche; Entwurfsbranch frisch von12094d9 angelegt.

UE5.8 und PixelStreaming2 tatsächlich lokal vorhanden. Unreal-Browserweg vorgeschlagen: Pixel Streaming mit getrennten Sitzungen; kein normaler HTML-Spiel-Export zugesagt. PublicGPU-Betrieb, Budget und Ziel-iPad noch offen. Späterer nativer iPad-Build hat eigenes Rendering-/Signierungs-/Gerätegate.

## Prüfung und Grenzen

- Sechs PNG-Dateien lokal vorhanden; Größe1536×1024 undSHA256 protokolliert.
- Git-Blob-Identitäten aller fünf lokalen PNGs entsprechen den hochgeladenen GitHubBlobs.
- Spielbuch vom unveränderlichen Entwurfscommit zurückgelesen und bytegleich mitlokalerFassung.
- Exakte rationale Bruchsummen und alle vier Küsten-Dreierkombinationen geprüft.
- Sechs strukturelle V2-Satzgliedpermutationen geprüft; keine Softwareprüfung sprachlicher Angemessenheit behauptet.
- Bilder visuell gesehen. Hauptabweichungen: zusätzliche Wörter inMotiv10, bereits gelegter Satz in11, parallele statt alternativerLeitungsrouten13/14, schwebendeBogenteile15, falsche sichtbareTurmfenster/-lichter20. ImSpielbuch ausdrücklich alsBaukorrekturen dokumentiert.
- Die Bilder sind ArtEntwürfe. Kein3D-Mesh/Level/Unreal-Render-/Touch-/Spielspaßnachweis.
- Stufen: EntwurfsdokumenteaufBranchgesichert; neueSpielimplementierungnichtbegonnen. KeineCIgrün-/Integration-/Staging-/Functions-/Rules-/Nutzertest-/Productionbehauptung.
- Vorhandene Spiel-Release-Stufen und GRADECREW_STATE unverändert; neueSpielstufeerfordertneuenNachweis.

## Versuche und Budget

Sieben neue autorisierte Aufrufe des eingebauten image_gen, alle erfolgreich; fünf Tafeln, ein ursprünglicher Eimerentwurf und eine autorisierte Bildkorrektur und kein alternativerCLI/API-Anbieter. Originalausgaben unterCodexgenerated_images erhalten, allefinalenPNGsinWorkspacekopiert undaufEntwurfsbranchgesichert. Keine CloudGPU, bezahlten Assets, eigenen API-Schlüssel-Aufrufe oder Deploymentkosten gestartet. Geldbetrag der eingebauten Bildgenerierung nicht geliefert; keine Kostenzahl erfinden. Bestehende Guardian-/Expeditionsbudgets und Versuchszähler nicht zurückgesetzt.

## Lokale Dateien

Arbeitsordner: analysis/GC-GAMES-ESCAPE-VISUAL-01/. Enthält lerninsel-spielbuch-20261007.md, witness-analysis-20261007.md, layout-a.png bislayout-e.png und layout-21-eimer.png, layout-prompts.md undverification.json. Nutzerreferenzen zusätzlich unterreferences/ lokal bewahrt; nicht als Spielassets verwendet und nicht inPR173hochgeladen.

## Genau nächster Schritt

Martin prüft Bildtafeln und Spielbuch hinsichtlich gewünschter Optik, räumlicher Lesbarkeit und Bodenwortmechaniken. Danach konkreten Implementierungsplan für denVier-Rätsel-Abschnitt erstellen; noch keinEngine-/Blender-SpielbauvorGestaltungsprüfung.

## Wiederaufnahme

NachChatabbruch docs/CHAT_RECOVERY.md lesen. Task-ID, PR173, Entwurfscommit und sieben Bildgenerierungsaufrufe erhalten. Keine Generation allein wegenChatwechsel wiederholen. Remotecommit, lokale Dateien, aktuellenmain/Registry und ggf. neueAnmerkungen prüfen. ZumSicherungszeitpunktkeineBildgenerierungmehrlaufend; keinUnreal-/Deploy-/Provider-Vorgang gestartet. Hauptspielcode,CI,Geräteabnahme undöffentlicheBereitstellungsindoffen.


## Ergänzung und Versuchshistorie 08.10.2026

Martin ergänzt Eimer, Wasser und Bodenplatte; danach verbindliche Korrektur auf 1 Liter und Zehntel. Ziel 3/10 = 300 ml, Skalenhilfe 1/10 bis 10/10, ein Hub 100 ml. 2/10 und 4/10 öffnen nicht. Aufnahme, Absetzen, Mengenänderung, Korrektur und Save/Resume beschrieben. Bildkorrektur visuell geprüft; ungleichmäßige generierte Skalenabstände müssen im Bau exakt kalibriert werden. Ursprünglicher 8-Liter-/Achtelentwurf verworfen, Originalausgabe als Versuchsnachweis erhalten.

Entwurfscommit a87abfe4d11b1223630aa2c6ecf2fca2326e2db7 remote zurückgelesen, Spielbuch bytegleich und Branchref geprüft. Erstcommit 2410359e97fcf7594a983aa5fd2eae9af0169b4f bleibt im Verlauf. Hauptbranch-Koordinationsversuch 0708d1844f9f3a0999f5fd4131023b60f94c104f mit erwarteter Basis12094d9 scheiterte unbekannt; Readback zeigte mainf598d126 ohne neue Übergabe/Registry/TODO. Kein blindes Retry; aktuelle main-Dateien erneut gelesen. Koordination wird über Contents API mit aktuellen Blob-SHAs nachgeführt. Kein Runtime- oder Deploy-Vorgang gestartet.

## Autorisierter Baubeginn 08.10.2026

Martin verlangt erneute ausführliche Selbstprüfung und autorisiert anschließend selbstständigen Levelbau während seiner Abwesenheit. Scope erster Abschnitt: Ankunft, Verbprobe/Hauptpfad, 1-Liter-Eimerterrasse. Planung8/10 bezogen auf ausgearbeiteten Entwurf, Art-/Spieltest noch offen. Dedizierter Branch feature/lerninsel-ego-v1; Remotecheckpoint1f6f97126b21052971123ac8d422a8b038fb1036 enthält Plan/Audit/Regeln. Lokal5753db9/ca09bda; 59 portable C++-Prüfungen grün. Terminal-Gitpush ohneCredentials, Sicherung überConnector; IDs lokal/remote getrennt. Runtime-Engine-Build in Arbeit, noch kein spielbarerBuild/CI-/Deploy-/Gerätenachweis. Keine erneute Designfreigabe erforderlich. Laufender Build ist lokaler UnrealBuildTool-Vorgang; Fehlstand und nächster Schritt in games/lerninsel-unreal/Production/HANDOFF.md. Ursprüngliche Task-ID/PR173 und sieben Bildaufrufe erhalten. Webrelease/Productionunverändert.
