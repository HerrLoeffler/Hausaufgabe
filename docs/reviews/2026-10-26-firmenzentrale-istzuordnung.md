# GC-BRAIN-01 — Bestandszuordnung für den Konzeptreview

26.10.2026. Ausführender Fachchat / alleiniger Produktwriter PR295. Ausgangscode lokal `5b218365242507f4308ada24891aa40361d2c26a`, remote `969e36c04f31d6ae6b4c128a34ad48dee1c70426`. Alle36Dateien aus dem App-Buildmanifest stimmen mit dem Checkout überein. Arbeitsscope: Bestand erklären und die UX-Probleme für den unabhängigen Designreview konkretisieren. Keine Umsetzung eines neuen Konzepts.

## Einordnung und Methode

**4/10 für Orientierung im untersuchten Aufbau**, als vorläufige Autoren-Selbstbewertung: Es gibt echte Bereichsdaten und einen funktionierenden Auftragsweg, aber der normale Arbeitsablauf zerfällt in mehrere Ansichten. Codeprüfung dieses Fachchats; aktueller nativer Weg Heute→Klassen & ASV→ASV & Import und dessen Sichtbefund wurden von der Hauptzentrale berichtet, hier nicht als eigene neue Bedienprüfung ausgegeben. Keine Nutzerstudie oder unabhängige UX-Abnahme. Die technische Abnahme der Mac-Hülle beantwortet diese Produktfrage nicht.

Aktueller Humanauftrag in „GradeCrew Zentrale“ gelesen: „es ist nicht übersichtlich und man kennt sich noch gar nicht so wirklich aus“; Konzept deutlich überdenken. Der unabhängige Designreview ist einem anderen bestehenden Fachchat zugeordnet. Dieser Bericht ist dessen Bestandsgrundlage, keine vorweggenommene Konzeptfreigabe.

## Welche Ansicht zeigt heute was?

| Einstieg | Vorhandener Inhalt | Grenze für den normalen Arbeitsweg |
|---|---|---|
| Heute / Unternehmensnetz | Elf Bereiche, gerichtete Beziehungen, Vorschläge für Engpässe/nächste Aufmerksamkeit | Netz ist die Startansicht; konkrete Entscheidungen für Martin sind keine eigene priorisierte Inbox. |
| Bereich / Unterpunkt | Bereich wird Mittelpunkt; gegliederte Kinder, Status, Lücke, nächster Schritt, Quellen und Abschlusskriterien | Erneut große räumliche Navigation. Beim Unterpunkt ist „Vorhanden“ eingeklappt; Lücke steht sofort sichtbar. |
| Bereichsstand | Redaktionell geprüfter Bestand, offene Arbeit, nächster Schritt und neuere Quellenhinweise | Zweiter Weg zur inhaltlich gleichen Kernfrage; die übrigen Ansichten werden dadurch nicht ersetzt. |
| Seiten & Releases | Umgebungen, Kandidaten, PR-Zuordnung, fehlende Test-/Freigabenachweise, privates Prüfjournal | Technische Detailtiefe sinnvoll für Releases; diese Sprache dringt jedoch auch auf die Chef-Startseite. |
| Quellenabdeckung / Detailakten / Ziele / Aufgabenqualität / Beziehungen | Herkunft, historische Aufgabenakten, Entscheidungs-/Zieltexte, Kriterien und Verknüpfungen | Zusammen mit Netz/Bereichsstand/Releases acht Arbeitsansichten ohne klaren normalen Hauptweg. |
| Eingang | Alle gespeicherten Aufträge, Rückfragen, Ergebnisse, lokale Entwürfe; Statusfilter | Kein fester Bereichsverlauf am Bereich selbst. E-Mail/Kundeneingänge sind noch nicht angeschlossen. |
| Wissen / Verbindungen | Wissens-/Quellenübersicht und tatsächlicher Verbindungsstand | Importierte Texte und frischer Abruf sind keine automatische fachliche Fortschreibung jedes Unterthemas. |

Codeanker: `docs/prototypes/firmenzentrale/app.mjs:45` (Navigation), `:71` (Startnetz), `:151` (Eingang), `:214` (Routen); `focus-view.mjs:48` (Unterpunktdarstellung), `runtime-view.mjs:23` (Aufträge).

## Welche Daten müssen erhalten bleiben?

- **Redaktioneller Firmenbestand:** `portfolio.mjs`, `network.mjs`, `focus.mjs`, `company-status.mjs`, `hierarchy.mjs`, `data.mjs`. Elf Bereiche,62Unterpunkte/24Obergruppen und ältere Detailakten. Neue fachliche Einzelstände überlagern alte Texte; die Grundprojektion ist datiert23.–25.10., keine aktuelle Vollbewertung aller späteren Chats.
- **Quellen und Aktualisierung:** `inventory.json` als historische Inventur; im privaten Dienst gespeicherte Quellrevisionen und lesender Fünfminutenabgleich von Codex/GitHub. Cloudimporte weiterhin gesondert/manuell. Ein erfolgreicher Abruf schreibt nicht automatisch „gebaut / fehlt / nächste Entscheidung“ um.
- **Aufträge und Ergebnisse:** privates `runtime/central.sqlite` mit Requests, Events, Quellensnapshots, Wissensrevisionen sowie Releaseprüfjournal; Berichte unter `runtime/reports`. Nur lesend geprüft:3abgeschlossene Aufträge, alle mit1Versuch. Keine Migration, kein Reset, kein neu gestarteter Auftrag.
- **Releasebelege:** `releases.json`, `pr-audit.json` plus automatisch beobachtete Versionen und private Prüfnotizen. Produktfreigabe, technische Tests und noch fehlende Dokumentation bleiben unterschiedliche Aussagen.
- **Entwürfe:** browser-/appbezogener Webspeicher. Gespeicherte Aufträge sind gemeinsam; ungesendete Browserentwürfe sind nicht automatisch im App-Webspeicher vorhanden.

## So funktioniert der Chatweg tatsächlich

Bereich oder Unterpunkt → **Aufgabe vorbereiten** → allgemeiner Dialog **Neu erfassen** → Titel/Beschreibung/Bereich prüfen → **Bearbeitung starten** → dauerhafte Request-ID → Codex-App-Server erstellt einen neuen auftragsgebundenen Verlauf → Rückfrage/Bericht/Ergebnis → **allgemeiner Eingang**. Antwort auf eine offene Rückfrage bleibt beim selben Vorgang. Ein fertiger Auftrag ist derzeit kein fortlaufender Bereichschat und keine Übernahme eines vorhandenen Fachchats.

Es gibt kein dauerhaft sichtbares Chatfeld in Bereich/Unterpunkt. Die Auftragsschnittstelle speichert `title`, `body`, `area`; genaue Domain und Unterpunkt werden bisher in den vorbereiteten Text geschrieben. **Stabile `domainId`/`workItemId` und eine dauerhafte Bereichskonversation fehlen.** Deshalb genügt für das gewünschte Bereichschatten kein bloßes Verschieben des vorhandenen Eingabefeldes: alte Aufträge müssen erhalten und unklar zugeordnete Vorgänge ausdrücklich als solche behandelt werden. Keine automatische Zuordnung aus ähnlich klingenden Titeln als gesicherte Tatsache.

Codeanker: `app.mjs:168`, `:224`, `:231`; `tools/central_runtime/store.py:27`; `service.py:56` ff. Profil weiterhin Analyse/Konzept/Bericht. Kein beliebiger Code-/Fachchatdispatch, keine automatische Produktänderung.

## Fünf konkrete Hindernisse

1. **Wesentliche Information ist nachrangig:** `focus-view.mjs:50–53` zeigt Lücke/Aufgabe zuerst; bereits Gebautes liegt unter „Stand & Abschlusskriterien“. Für „Was funktioniert schon?“ muss man extra suchen.
2. **Zu viele gleichrangige Arbeitswege:** `app.mjs:51` führt acht Ansichten nebeneinander. „Wo arbeite ich normal?“ bleibt eine Entscheidung des Nutzers.
3. **Nachweislücke wirkt wie Produktlücke:** ASV in `focus.mjs:18`: „Konkreter Import-/Fehler-/Abnahmenachweis fehlt hier.“ Der Renderkopf „Hier fehlt noch“ erklärt nicht, ob Funktion, Test oder nur die Übernahme des Belegs fehlt. Daraus darf nicht „ASV wurde nicht gebaut“ folgen; der aktuelle Fachbeleg ist gesondert zu prüfen.
4. **Bereichskontext geht beim Handeln verloren:** globaler Dialog, anschließend Wechsel zum Eingang (`app.mjs:231`). Ergebnisse/Rückfragen werden nicht direkt beim gewählten Unterpunkt wiedergefunden.
5. **Technischer Bericht statt nächster Entscheidung:** Status-/PR-/Abnahmesprache ist auf der Hauptfläche schneller sichtbar als eine konkrete Frage mit Verantwortlichem und Termin. Ein allgemeines „Abnahme offen“ beantwortet weder „Muss ich jetzt etwas tun?“ noch „Wer macht es als Nächstes?“.

## Warum das Netz zur Startseite wurde

Der frühere Humanauftrag enthielt neuronale Bildreferenzen, den ausdrücklichen Wunsch nach Abhängigkeiten und die Interaktion „Bereich anklicken → in die Mitte → Unterpunkte“. Das Nachbarschaftsnetz in `docs/superpowers/specs/2026-10-25-bereichsfokus-design.md:9` setzt diesen Wunsch um. **Die Entscheidung, das Netz zur dominanten täglichen Start-/Arbeitsnavigation zu machen und acht ältere Arbeitsansichten daneben zu behalten, war die Umsetzungsauswahl dieses Fachchats.** Sie wurde nicht durch einen Nachweis gestützt, dass Martin dadurch seine täglichen Führungsfragen schneller beantwortet. Der Wunsch nach sichtbaren Zusammenhängen kann auch mit einer gezielt geöffneten Netzansicht erfüllt werden; dessen genaue Platzierung ist jetzt zu überprüfen.

## Vorgaben an den Konzeptvergleich

Der Designreview soll die normale Nutzung auf dieselben Fragen prüfen: **Was ist vorhanden? Was fehlt genau: Umsetzung, Test, Beleg oder Entscheidung? Wer macht als Nächstes was? Was braucht Martin? Wo frage/arbeite ich weiter und wo kommt die Antwort zurück?** Blau, Logo, bestehender Dienst, IDs, Ergebnisse, sichere Startmechanik und Quellen bleiben wiederverwendbar. Netz und technische Detailakten bleiben als gezielte Vertiefung erhalten. Keine pauschalen Fortschrittsprozente ohne abgenommene Meilensteine.

**Spec-Achse:** räumlicher Bereichsfokus vorhanden; unmittelbare Firmensteuerung und Bereichschatten nur teilweise erfüllt. Ob die neue Startstruktur die Fragen tatsächlich beantwortet, muss an den vom Designreview untersuchten Nutzerwegen gezeigt werden.

**Standards-Achse:** Stufen-/Quellenbegrenzung vorhanden; kein hier belegter Regelbruch durch fehlenden ASV-Nachweis. Größtes semantisches Risiko ist die missverständliche Darstellung von Beleglage als fehlender Umsetzung. Kein Security-/Legal-/Deployreview in diesem Bericht.

**Nächster Schritt / Owner:** Hauptzentrale führt diese Bestandszuordnung mit dem unabhängigen UXreview zusammen und zeigt Martin die kompakten Alternativen samt Empfehlung. Erst danach wird die beschlossene Struktur als begrenzter Folgeauftrag an den bestehenden Produktwriter umgesetzt. Hier wurden keine Produktdateien geändert, keine Tests/Builds oder Modellaufträge neu gestartet und keine andere App erzeugt.
