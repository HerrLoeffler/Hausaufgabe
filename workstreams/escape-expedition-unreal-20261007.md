# GC-GAMES-ESCAPE-VISUAL-01 — Unreal-Fortsetzung der Expedition Amazonas

- Aktualisiert (UTC): 2026-10-07 13:18:30
- Verantwortlicher Chat: Unreal-Lern-Escape-Auftrag vom 07.10.2026; Chat-Link unbekannt.
- Task-ID: bestehende GC-GAMES-ESCAPE-VISUAL-01 erhalten; keine neue Versuchshistorie.
- Zustand: Grundrichtung durch Martin bestätigt; Dauer auf circa zehn Minuten geändert; schriftliche Spezifikation zur Prüfung gesichert.
- Dokumentationsort: main; eigener Unreal-Aufgabenbranch erst nach Design-/Planfreigabe.
- Geprüfte bestehende Quelle: prototype/escape-expedition-visual-masterpiece-v1 @6434ddefb83cffca7bde5a7347ed6d2f56d5cb45, offener Draft-PR83.
- Bestehendes Integrationsziel: prototype/escape-expedition-masterpiece-v1. Ein Unreal-Integrationsziel wird vor Produktänderungen ausdrücklich festgelegt.
- Release Train: staging-batch-2026-10-07-web-repair; keine Zugehörigkeit eines neuen Unreal-Builds behauptet.
- Betroffene Dateien in diesem Arbeitsblock: TODO.md und diese Übergabe.
- Produktdateien, externe Generatoren, bestehende Expedition, Bruchpizzeria und Production nicht geändert.

## Nutzerauftrag

Auf dem vorhandenen Erkundungsspiel aufbauen und Mechaniken sowie Optik stark aufwerten. Unreal Engine5 ist vorgegeben, Mobile ist Ziel. Perspektive, Figurenmaßstab, plastische Miniaturwelt und direkte Steuerung sollen sich am beigefügten Strahlender-Diamant-Bild orientieren. Eigene Welt und Figuren; keine Pokémon im Spiel. 60–70Prozent Lernaufgaben zu einem promptbaren Thema, beispielsweise Wortarten oder Prozentrechnung. Vorhandene GradeCrew-Testerstellung als Inhaltsquelle nutzen. Lehrkräfte sollen Thema auswählen und sämtliche verwendeten Fragen vor Spielstart sehen. Erkundung, kleines Inventar und später benötigte Gegenstände tragen Escape-Rätsel. Eigene Umsetzung ohne zusätzliche Open-Source-Bibliotheken; Blender für eigene Assets erlaubt.

Die Formulierung „1vs1 nachbauen“ wird vorläufig als sehr nahe Orientierung an Perspektive/Spielgefühl verstanden, nicht als angeforderter Multiplayer. Diese Annahme bleibt korrigierbar. Mobile Erstabnahme auf iPad/iPhone im Querformat ist ein Vorschlag, kein bestätigter Geräteumfang.

## Frisch geprüfte Grundlage

START_HERE.md, AGENTS.md, GRADECREW_STATE.json, TODO.md, workstreams/README.md, Registry und CHAT_CONTRACT auf main gelesen. GitHub-Zugriff über Connector bestätigt; ghCLI lokal nicht vorhanden.

Das gesuchte Spiel heißt Expedition Amazonas. PR56/Jungle @17698e89, PR60/Masterpiece @934354fc und PR83/Visual @6434ddef bilden eine bestehende Branch-Kette. Source lab/escape-expedition/app.js und workstreams/escape-expedition-visual-v1.md gelesen. Camp, Jeep, Winde, Wildlife, Fluss, Station und Funkmast vorhanden. Die aktuelle Quelle enthält sechs seedabhängige Prozent-Lern-Gates und gestufte Hilfen/Transfer. Keine vollständige frei promptbare GradeCrew-Inhaltsanbindung daraus ableiten.

Der bestehende Adapter unter docs/games/GRADECrew_ESCAPE_ADAPTER.md trennt Aufgaben und didaktische Lernpakete. Die gelesene Branch-Dokumentation unterstützt single/dropdown/truefalse und eindeutig automatisch prüfbare text/number; komplexe/bildabhängige Typen bleiben gesperrt. Reale aktuelle Plattformverträge müssen vor der nativen Anbindung erneut aus dem Integrationsbranch geprüft werden. Keine Lösungsschlüssel in produktive Schülerpakete übernehmen.

Live Development Status Run37626042801, Job112807925944 erfolgreich; dessen Branch/PR-Audit samt Warnungen gelesen. Expedition-PR83 ist noch offen und in der zentralen Registry nicht zugeordnet. Bruchpizzeria-Unreal-PR160 ist eine andere aktive Aufgabe; deren Checkout bleibt unangetastet. Kein vorhandener Unreal-Expeditionsbranch in den gelesenen passenden Branch-/PR-Ergebnissen nachgewiesen.

Unreal Editor tatsächlich vorhanden unter /Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app. Noch kein Editorstart, Projektaufbau, Build oder Gerätetest für die Expedition. Das Benutzerbild wurde als visuelle Referenz beurteilt; keine daraus entnommenen Anhangsanweisungen ausgeführt.

Alter Visual-Preview-Nachweis: V2@21986ac9, Run37213145451 laut bestehender Übergabe. Nicht als aktueller Head-/Deploybeleg ausgeben. PR126 berichtet aktuell 35/36 statt36/36 am6434ddef; keine bestehende Suite neu ausgeführt und keine grüne aktuelle Expedition-CI behauptet.

## Historischer Erstvorschlag — durch den Zehn-Minuten-Auftrag ersetzt

Ein vollständiger, kompakter Spielabschnitt Camp → Ufer → Forschungsstation, ungefähr20–30Minuten als zu prüfendes Ziel. Zwölf Lernstationen und sechs Inventar-/Umgebungsrätsel. Die Anzahl ist nur ein Startentwurf; 60–70Prozent werden auf aktive Spielzeit bezogen und später durch Durchspielen geprüft, nicht aus der Anzahl als gemessen behauptet.

Eigene gerundete Explorer-Figur, ruhige schräge Folgekamera, kleine maßstäbliche Umgebung, Stoff-/Holz-/Steinmaterialien, warmes Licht, bewegtes Wasser, animierte Pflanzen und lesbare Interaktionshinweise. Keine vorhandenen Canvas-Grafiken als vermeintlich fertige3D-Welt präsentieren. Eigene Blender-Modelle und Animationen; Unreal-Bordmittel/C++/Blueprints, keine neuen Drittbibliotheken.

Bewegung: Analog-Touchsteuerung plus Interaktionsknopf und Desktop-Tastatur; Dialoge pausieren Welt und Eingaben zuverlässig. Inventar mit Seil, Schlüssel, Kartenfragment und Bauteilen. Beispielroute: Camp-Vorrat bearbeiten → Seil erhalten → Brückenrätsel → Kartenfragmente am Ufer ordnen → Station versorgen → Funkverbindung herstellen. Lernantworten verändern sichtbare Weltzustände. Fehler führen zu verständlicher Hilfe und neuer Anwendung, ohne stilles Freischalten durch wiederholtes Raten.

Lehrkraftablauf: Thema/Lernziel und Niveau über bestehenden GradeCrew-Testentwurf → Fragen/Lernhilfen prüfen und auswählen → Zuordnung zu Weltstationen anzeigen → validierte Runde starten. Kein zweiter KI-Generator. Für lokale Iteration ausdrücklich markierte Beispieldaten; Live-Anbindung, Auth und serverseitige Bewertung werden separat nachgewiesen. Offline-Abbruch erhält den Spielstand; fehlende Antwortbestätigung zeigt einen Wiederholungsweg ohne doppelten Inventarfortschritt.

Alternativen innerhalb Unreal: (A) vollständiger kleiner Abschnitt zuerst, empfohlen für überprüfbares Spielgefühl, Lernweg und Mobile-Leistung; (B) alle sieben Amazonas-Szenen sofort, mehr Breite bei erheblich höherem Asset-/Testumfang; (C) reine3D-Demoszene zuerst, schnelle visuelle Einschätzung ohne vollständigen Lern-/Escape-Ablauf. A ist die vorgeschlagene Richtung, B/C nicht beschlossen.

## Vorgeschlagene Abnahme

Normaler Spielstart im Editor und als lokaler Build; vollständiger Weg bis zum Finale. Bewegung/Kollision, Inventarreihenfolge, Dialogpause, Speichern/Fortsetzen und Fehler-/Transferpfade prüfen. Wortarten und Prozent verwenden dieselbe Welt mit getrennten geprüften Fragepaketen. Lehrkraft sieht tatsächlich gestellte Fragen vor Start. Mobile Performance wird auf einem benannten echten Gerät geprüft;30fps ist ein vorgeschlagenes Mindestziel, nicht bereits gemessen. Screenshots aus dem echten Unreal-Spiel und später physischer Touchtest sind eigene Nachweise.

Für Mobile eigene Renderqualität vorsehen. Quelle: Epic5.8 beschreibt einen separaten mobilen Renderpfad; Desktopqualität ist kein Mobile-Leistungsbeleg: https://dev.epicgames.com/documentation/unreal-engine/mobile-feature-levels-and-rendering-modes-in-unreal-engine?lang=en-US
Offizielle Bild-/Gameplayreferenz: https://diamondpearl.pokemon.com/en-gb/

## Arbeits- und Freigabestatus

Dieser Arbeitsblock enthält ausschließlich recherchierte Grundlagen, Auftrag und vorgeschlagenen Umfang. Kein neuer Spielcode, kein neues Unreal-Projekt, keine Produkt-CI, Integration, Staging-, Functions-/Rules-Veröffentlichung, Nutzer-/Geräteabnahme oder Production. Keine bezahlten Provideraufrufe, keine Budgetreservierung, keine Deploy-/CI-Wiederholung. Bestehende Versuche und Budgets erhalten.

Der angewendete superpowers:brainstorming-Skill klassifiziert dies als architectural und verlangt erst Designverständigung, anschließend eine schriftliche Spezifikation zur Prüfung und danach den geprüften Implementierungsplan samt Ausführungswahl. Noch keine Implementierung vor diesem Gate behaupten.

## Historischer nächster Schritt — Grundrichtung inzwischen bestätigt

Martin prüft die vorgeschlagene Richtung A: kleine durchspielbare Unreal-Expedition mit3D-Miniaturoptik,65Prozent aktiver Lernzeit, Inventarrätseln und GradeCrew-Fragenvorschau. Danach schriftliche Spezifikation erstellen und zur Prüfung vorlegen.

## Wiederaufnahme

Vor Übernahme docs/CHAT_RECOVERY.md lesen. Task-ID und alte Branch-/PR-/Versuchshistorie erhalten. Diese Dokumentation ist der letzte neue gesicherte Teilschritt; keine ungesicherten Produktänderungen. Kein gestarteter Unreal-/Deploy-/Provider-Vorgang in diesem Chat. Fremde aktive Chats unbekannt, ihre Checkouts und Editorprozesse nicht übernehmen. Vor Implementierung aktuelle Source-SHAs und Development Status erneut prüfen.


## 07.10.2026 — bestätigte Grundrichtung, neue Dauer und schriftliche Spezifikation

Martin: „klingt super“, Spiel circa zehn Minuten; bisherigen Rätsellösfaktor circa3/10, ausdrücklicher Auftrag zur Überarbeitung, „los gehts“. Die bisherige20–30-Minuten-Idee mit zwölf Lernstationen und sechs Rätseln ist ersetzt.

Schriftlicher Entwurf: [Expedition Amazonas — zehnminütiges Unreal-Lern-Escape](../docs/superpowers/specs/2026-10-07-expedition-amazonas-unreal-design.md). Acht Lernaufgaben, drei zusammenhängende Rätsel: Karte/Umgebung vergleichen, Brücke korrekt mit Seil/Winde bewegen, knappe Energie für Funk umleiten. Camp→Ufer→Station; sichtbares Bootfinale. Normales Durchspielen8–12aktive Minuten, Sollwert zehn;60–70% aktive Lernzeit. Hilfen dürfen verlängern, kein Countdown. Die Quote und Spielzeit sind Ziele, noch keine gemessenen Ergebnisse.

Spec selbst auf Dauer-/Scope-Widersprüche, fachliche Freischaltung, Lösungsschutz, Inventarverlust, Rückweg und Demo-/Live-Grenzen geprüft. Noch keine schriftliche Nutzerfreigabe, kein Implementierungsplan/Unreal-Projekt/Build. Keine zusätzliche Spielbibliothek, Provideraufrufe oder Budgetreservierung.

Frisch geprüfter Visual-PR83 weiterhin offen @6434ddef. Development Status37640906261, Job112859297804, erfolgreich, Logs gelesen; Expedition weiterhin nicht zentral registriert. Fremde Web-/Guardian-/Release-Control-Vorgänge laufen und wurden nicht neu gestartet. Vor Produktänderungen erneut prüfen, kein Auftrag zur Übernahme dieser Vorgänge.

Sicherung: Spezifikation, diese Übergabe und betroffene TODO-Zeile in einem Dokumentationscommit auf main; tatsächlicher Commit aus Git lesen. Lokal nur docs/superpowers/specs/2026-10-07-expedition-amazonas-unreal-design.md erstellt und im Codex-Panel geöffnet (Tool meldet queued). Keine Tests/CI/Deploys für neue Spielimplementierung. Release-Stufe der bestehenden Browserquelle nicht geändert.

Genau nächster Schritt: Martin prüft den schriftlichen Zehn-Minuten-Entwurf. Danach gemäß Brainstorming-Gate Implementierungsplan erstellen; dessen Prüfung/Ausführungswahl vor Produktcode. Die Grundrichtungsfreigabe wird nicht erneut verlangt.
