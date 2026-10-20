# GC-CHAPTER-TESTS-01 – Kapiteltests: Konzept

- Aktualisiert: 20.10.2026 (Europe/Berlin).
- Verantwortlicher Chat: GradeCrew Kapiteltests Konzept, 01a158cb-3f19-7821-a895-cf11290f8506; Chatlink unbekannt. Eigener ausführender Konzeptchat, keine Zentrale, keine Nachrichten an andere Chats.
- Auftrag: Brainstorming, pädagogische/technische Machbarkeit und Stufenplan; keine Implementierung/Deploys/echten Schülerdaten/bezahlten Generierungen.
- Arbeitszustand: konkreter Umsetzungsplan zur Durchsicht bereit; Implementierung nicht begonnen.
- Branch: docs/gc-chapter-tests-01; Basis main c14a8fdee852f6d5105c1b7e12701a0112272263; Ziel main. Draft-PR252 offen/unmerged.
- Dateien: docs/concepts/GC-CHAPTER-TESTS-01.md, docs/superpowers/plans/2026-10-20-gradecrew-chapters-foundation.md, diese Übergabe, nur eigene TODO-Ergänzung und Registry-Zuordnung. STATE unverändert.

## Ergebnis und Entscheidungen

Ursprünglicher Entwurf: B empfohlen: optionale Kapitel im vorhandenen Test, freie Navigation, eine Endabgabe, Punktegewichtung. Sechs-Kapitel-Beispiel 18 Aufgaben/48 Punkte ist frei gewählt, keine offizielle Lehrplanvorgabe. A/B/C mit gleichen vier Kriterien verglichen. Lehrkraft-/Schüler-/Ergebnisabläufe, Datenvertrag, Generation, Offline/Resume/Fristen, Native, CSV/Druckgrenzen und Akzeptanzfälle im Konzept.

## Belege und Grenzen

main-Regeln/STATE/TODO/Registry/CHAT_CONTRACT frisch gelesen; Remote-main vor Schreiben erneut gleich. Runtime-Ref und sauberer isolierter Leseklone HEAD beide 4f8b79222a35997852aad4673f8aaf338904f485. Native-Remote b43298b73d63707d2270ee4a3f4e49cf980dd606 separat geprüft. Gelesene Pfade und konkrete Ist-/Soll-Abgrenzung im Konzept. Keine Kapitelzuordnung in Register/TODO oder Branchnamen gefunden; frisches Ref-/Open-PR-Inventar, verwandte Lernspiel-PRs sind keine Kapiteltestlösung. Kein lückenloser Diff jedes historischen Branches. Development Status39372029039 erfolgreich, abgeschlossenen Fetch-/Auditjob geprüft; Gesamtartefakt nicht heruntergeladen. Bestehende P0/Security-/Geräte-/Restoreaufgaben nicht übernommen oder geschlossen.

Überschneidungen für spätere Entwicklung: app.js/Editor, Assessment-Core/Server/Rules, sichere Schülernavigation, native lokale Webassets; zuerst aktuellen Stand neu prüfen. Dokumentationsbranch berührt nur eigene Inhalte plus additive TODO/Registry. Fremde Einträge erhalten. Kein Runtime-Konfliktaudit oder Produktreife behauptet.

Prüfungen dieses Auftrags: lesende Codeinventur, Quellen-/Refabgleich, Dokumentstruktur und Beispielarithmetik; keine Produkt-, CI-, Build- oder Gerätetests. Der bisher belegte Live-Stand ist eine Repositoryaussage, kein neu erhobener Cloudnachweis. Keine Release-Stufenänderung, keine Integration, Hosting-/Functions-/Rules-/Native- oder Productiondeploys.

## Wiederaufnahme

Letzter gesicherter Inhalt: vollständiger Konzeptentwurf in eigenem outputs/ und diesem Docscommit. Keine ungesicherten Produktänderungen; isolierter Referenzklon work/repo sauber/detached Runtime-HEAD. Kein laufender externer Providerstart, keine Kostenreservierung; PR-/Commit-ID aus Gitgeschichte bzw. Chatresultat ermitteln, vor Wiederholung Remote prüfen.

Skills tatsächlich gelesen: using-superpowers, brainstorming; feasibility/Architekturentwurf ausschließlich lesend. Nutzerauftrag verlangt erst brauchbaren Entwurf und maximal drei Fragen danach, daher keine vorgeschaltete Fragen-/Freigabeschleife. verification-before-completion für Abschlussprüfung. Keine Implementierungsfreigabe aus dem Plan ableiten.

Modell: requested nicht explizit im Delegationsstart; nach Projektregel Architektur Sol/medium passend. Actual Modell/Effort über diese Werkzeuge nicht verifiziert: unknown. Usage/Preise unknown. Keine Modellwechsel oder zusätzlichen bezahlten KI-Aufrufe.

## Genau ein nächster Schritt

Die vorhandene Testerstellung um optionale Kapitel konkretisieren; Übung und benoteter Test identisch, keine Bundeslandfestlegung als Voraussetzung. Optionales Gesamt-/Bereichszeitkonzept ausarbeiten. Keine Produktimplementierung ohne neuen Auftrag.

## Nutzerpräzisierung 20.10.2026

Martin: Übung/benoteter Test sollen sich bei dieser Erweiterung nicht unterscheiden; bundeslandunabhängig planen, vorhandene Lehrpläne im Hintergrund und bestehende Testerstellung verwenden. Kapitel sind eine Erweiterung, kein neues System. Gesamt-/Bereichstimer optional mitplanen. Entwurf entsprechend überarbeitet; frühere Zweck-/Bundeslandfragen entfallen. Freie Rückkehr gilt ohne Bereichsfrist bzw. bis zu deren Ablauf. Timerstart bei erstem ausdrücklichen Bereichsstart, durchlaufende Frist, Bereichssperre mit serverseitiger Antwortmomentaufnahme und zunächst alternative Gesamt-/Bereichszeit sind Vorschläge, keine beschlossenen Detailregeln. Noch keine Runtimeänderung oder Releasefreigabe. Draft-PR252 bleibt Dokumentation.

Prüfung: lokale Textaktualisierung auf überholte Zweckfrage und vorhandenen Timerabschnitt geprüft; keine Produkt-/Gerätetests. Nächster Schritt: konkreten bestehenden Erstellungsablauf mit Kapitelzuordnung und optionalen Zeiteinstellungen ausarbeiten.

## Konkreter Umsetzungsplan – Nutzerauftrag 20.10.2026

Martin beauftragt ausdrücklich den konkreten Plan für Kapitel in der bestehenden Testerstellung; Grundstruktur zuerst, optionale Timer danach genauer planen. [Vollständiger Plan](../docs/superpowers/plans/2026-10-20-gradecrew-chapters-foundation.md) auf bestehendem Docsbranch. Sieben überprüfbare Pakete: Vertrag/Legacy, Editor/Draft/Kopien, vorhandene Remy-/Emmiwege, sichere Publikation/Lifecycle, bestehende Schülernavigation, konsistente Kapitel-/Gesamtresultate/Nachkorrektur, Packaging/App/E2E. Keine Bereichstimerfelder oder neue Timerlogik im Grundumfang; heutiger Gesamttimer unverändert. Neue Serverendpunkte nur für sichere Kapitelpublikation und konsistente Nachkorrektur innerhalb vorhandener Engine vorgesehen, nicht implementiert.

Quellenkorrektur: package.json → assessment-functions/main.js exportiert lib/secure-lifecycle.js und cleanup. index.js und lib/secure-submit.js sind keine aktive Runtimequelle. Aktiver Lifecycle übernimmt Shuffleoptionen, speichert Decoder-/Lösungssnapshots und enthält die maßgeblichen Submit-/Receiptpfade. Frühere Konzeptaussagen zu dieser Quelle berichtigt; Änderungen an alten Handlern sind nicht geplant.

Frisch geprüft: main c14a8fdee, Runtime4f8b7922, Nativeb43298b7, Docshead8a807c37 und PR252 vor Schreiben; neuer DevelopmentStatus39463832193 und erfolgreicher Fetch-/Auditjob, aktuelle Branches/offene PRs. PR253 adaptive Übungsbegleitung angrenzend, nicht übernommen. Kein lückenloses Diffaudit aller Branches, kein neuer Cloud-/Deploynachweis.

Tatsächlich ausgeführte Prüfung: Plan-Selbstreview gegen Konzept und Nutzerpräzisierungen; sieben Aufgaben mit Dateien/Interfaces/Checks/Commitgrenzen, aktive Exportquelle, konkrete Build-/Emulatorargumente und Versionen per Textprüfung geprüft (PASS). Lokale Referenz nur gelesen, eigene Plandatei unter outputs/chapter-tests-01; keine Produktdatei verändert. Produkt-/CI-/Build-/Emulator-/Gerätetests dieses Plans sind zukünftige Aufgaben, hier nicht ausgeführt. Keine Integration/Deploys/STATE-Stufenänderung, keine Providerstarts/Reservierungen. Skill writing-plans tatsächlich gelesen; keine Subagenten oder anderen Chats gestartet. Actual Modell/Effort/Usage unknown.

Genau ein nächster Schritt: Martin prüft den Grundstrukturplan; erst nach Implementierungsauftrag Aufgabe1 im frisch isolierten Runtimecheckout beginnen. Kein Timerentwurf wird als beschlossene Ablaufregel behandelt.
