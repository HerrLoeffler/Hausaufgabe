# Bereichsstand und Weg nach Live — Implementation Plan

> Ausführung: superpowers:executing-plans, allein durch den bestehenden Fachchat gemäß Humanauftrag. Keine Delegation, kein Merge, kein Deployment.

**Goal:** Die Zentrale beantwortet mit datierten Belegen, was je Firmenbereich fertig, blockiert und als Nächstes zu tun ist; sie ordnet alle bekannten Seiten und verhindert, dass geprüfte Kandidaten zwischen Vorschau und Live verschwinden.
**Architecture:** Bestehende Koordinationsquellen bleiben führend. Eine nachvollziehbare redaktionelle Projektion verbindet Fachchats, Register, PRs und öffentliche Release-Manifeste. Ein eigener lesender Umgebungsabgleich und ein lokales Prüfjournal ergänzen die vorhandene Zentrale, ohne den Release-Controller oder seine Freigaberegeln zu ersetzen.
**Tech Stack:** Bestehendes Vanilla-JS/SVG/CSS, Python-HTTP-Dienst, SQLite und unterstützter Codex-App-Server; keine neuen Pakete, Konten oder Schlüssel.
**Spec:** Der folgende Fach- und Betriebsvertrag ist Bestandteil dieses Plans.

## 1. Ausgangslage und konkrete Fehler

Die gemeinsame blaue Oberfläche ist vorhanden. Ihre elf Bereiche und62 Unterthemen enthalten teilweise redaktionelle Aussagen vom23.10.; der Quellenimport wurde danach aktualisiert, ohne alle Aussagen fachlich abzugleichen. Beispiel: alte App-Builds und alte Classroom-Störungen stehen neueren Fachmeldungen gegenüber. Ein erfolgreicher Import belegt weder eine inhaltliche Vollprüfung noch fachliche Abnahme.

main41af350 enthält bereits gradecrew.de als Liveadresse derselben Schulsite hausaufgabe-staging. Der alte Projektname bedeutet heute nicht Testbetrieb. gradecrew-staging-2026 ist getrennt. Frühere Vorschauadressen und neue isolierte Piloten besitzen unterschiedliche Geltungsbereiche. Registereinträge und ältere Release-Train-Abschnitte können zeitlich widersprechen. Diese Konflikte sichtbar auflösen, niemals die höchste gefundene Versionsnummer ungeprüft gewinnen lassen.

Ein gefundener Importfehler betrifft bekannte Chats, die nicht mit updatedAt in der App-Server-Liste erscheinen: null darf kein dauerhafter Cachetreffer sein. Ohne Änderungsdatum erneut lesen und den Revisionsbezug aus tatsächlichem Inhalt ableiten. Neue Chatstände dürfen nicht stillschweigend alte rote/grüne Aussagen bestätigen.

## 2. Was „fertig“ bedeutet

Jede Aussage benennt ihren Umfang: Konzept, Code, automatische Prüfung, Integration, Testveröffentlichung, Nutzer-/Geräteabnahme oder Liveveröffentlichung. Ein fertiggestelltes Konzept kann dennoch offene Produktarbeit haben. Ein laufender Upload ist nicht installiert. Ein erreichbarer URL ist kein vollständiger Funktionstest. Ein Hostingmanifest belegt keine Backend-, Rules-, Datenmigrations- oder App-Store-Freigabe.

Bereichskarte: kurze Überschrift; belegter Bestand; konkrete Lücke; genau nächster ausführbarer Schritt; zuständiger Fachchat; Quellen-/Prüfzeit; erreichbare Belege. Keine pauschale Gesamtampel aus einer einzelnen gelungenen Teilaufgabe. Fehlende Belege heißen unbekannt, alte Fehler ohne neue Gegenprüfung heißen erneut prüfen. Der ursprüngliche Fachauftrag bleibt derselbe.

Keine erfundenen Prozente. Fortschritt nur bei vereinbartem Zielumfang und tatsächlich abgenommenen Meilensteinen. Diese Umsetzung zeigt reale Anzahl offener Punkte und erreichte Release-Stufen, keine gefühlte Firmenfertigstellung.

## 3. Fachlicher Quellenabgleich

1. Alle erreichbaren bekannten Projektchats technisch erfassen; neueste relevante Abschlussmeldungen und laufende Arbeit lesen. Persönliche/Schülerdatenquellen bleiben ausgeschlossen.
2. Je Bereich passende Fachchats zuordnen, wichtige Aussagen am tatsächlichen PR/Commit/Run/Receipt prüfen. Chatmeldungen als solche kennzeichnen, wenn kein unabhängiger Nachweis vorliegt.
3. Keine Chatkopien, Finanzzahlen, Zugangsdaten oder private Kundeninhalte in GitHub. Versioniert werden nur bereinigte Arbeitsstände und öffentliche Nachweislinks.
4. Alle62 Unterthemen behalten IDs und Arbeitskontext. Aktuelle bestätigte Meldungen überschreiben gezielt ihre bisherige Projektion; bei unverändertem/nicht ausreichend belegtem Thema bleibt die Grenze ausdrücklich sichtbar.
5. Fachlich geprüfte Projektion bekommt eine Quelle/Prüfzeit und beobachtete Chatänderungszeitpunkte. Der automatische Import vergleicht diese Bindung mit neueren Nachrichten. Neue Meldung, Importfehler oder unbekannte Frische erzeugen einen sichtbaren Prüfhinweis; keine automatische semantische Freigabe.
6. GitHub main ist Koordinationsstand, nicht Livecode. Produktquelle, tatsächlich ausgelieferte Version und Teststand getrennt halten.

## 4. Seitenregister statt URL-Sammlung

Eine Umgebung besitzt stabile ID, verständlichen Namen, Zweck, Kategorie, Projekt/Hosting-Site soweit belegt, zuständigen Bereich, Basisadresse, Aliasadressen, öffentlichen Nachweispfad und Quelle. Klassen: Schul-Live, kanonisches Testsystem, isolierte Produktvorschau, lokaler Prototyp, historisch/abgelaufen, native Verteilung.

Aliasadressen desselben Systems werden nicht als zusätzliche Testumgebung gezählt. Pfade wie /pilot24/ gehören zu ihrer Basisvorschau. Lokale Entwicklung ist nur auf diesem Rechner erreichbar. Historische Vorschauen bleiben auffindbar, aber werden ohne aktuellen Nachweis nicht als aktiv gezählt. Keine erfundene runde Zahl von zehn Seiten.

Jede Zeile zeigt: Wo? Wofür? Welcher letzte belegte Stand? Gerade erreichbar/geprüft/unklar? Welche Kandidaten werden dort geprüft? Welcher nächste Schritt? Details enthalten genaue Quelle, Zeitpunkt, Komponenten und offene Grenzen.

Öffentliche Abfragen bleiben auf ein fest geprüftes Register von HTTPS-Adressen beschränkt. Keine beliebigen URLs aus Chattexten, keine privaten Netze, keine Anmeldedaten, keine schreibenden Webaufrufe. Nur kleine öffentliche Release-/Statusdokumente; Zeit-/Größenlimit, begrenzte Weiterleitungen und Fehlerstatus. Ein Fehler erhält den letzten Erfolg mit dessen Zeit, macht ihn aber nicht aktuell. Nachweis nur Hosting/benannte Komponente; keine Behauptung sämtlicher Backendstände.

## 5. Kandidaten und Weg nach Live

Ein Kandidat beschreibt ein konkretes Lieferstück, nicht einen ganzen Branch voller unbekannter Änderungen. Pflichtfelder: ID/Task, Bereich/Owner, Zweck, Quellcommit, PR/Branch, Testumgebung, vorgesehene Zielumgebung, benötigte Komponenten, belegte Tests, offene Gates, Abhängigkeiten und nächster Schritt.

Ablauf:
1. **Entwickelt:** Quelle gesichert, Scope vollständig beschrieben; kein Releasebeleg.
2. **Automatisch geprüft:** passende CI am exakten Kandidaten. Unabhängiger Review separat.
3. **Auf Testseite:** Zieladresse und tatsächlich ausgelieferter Kandidat stimmen überein; Hosting und Backend/Rules ggf. eigene Belege.
4. **Fachlich/geprüft:** erforderliche Geräte, Aufgabenfälle, negative Tests, Bestandsschutz und Verantwortliche belegt. Keine Umdeutung einer Browser-Simulation zum physischen Gerätetest.
5. **Für Entscheidung vorbereitet:** alle für diesen Scope erforderlichen Nachweise am selben Stand, Konflikte/Abhängigkeiten geklärt, Rückfall-/Betriebsplan vorhanden. Dies ist eine Empfehlung, keine Veröffentlichungserlaubnis.
6. **Livefreigabe:** Martin genehmigt exakt Scope, Version, Ziel, Zeitpunkt und Grenzen. Keine Freigabe aus alten Chats übertragen.
7. **Veröffentlicht:** bestehender zuständiger Releaseweg liefert echte Receipts und anschließend öffentlichen Versions-/Funktionsnachweis. Fehlgeschlagener oder unbekannter Vorgang bleibt offen; keine Doppelstarts.
8. **Nachkontrolle:** vereinbarte Kernwege/Betrieb prüfen, Beobachtungszeit und Rückfallkriterien dokumentieren; erst dann Abschluss.

In dieser Umsetzung endet die ausführbare Bedienung bei Prüfung/Arbeitsvorbereitung. Es gibt keinen Deployknopf, keinen Guardianstart und kein Schreiben in produktive Systeme. „Freigabe vorbereiten“ erzeugt ein konkretes Briefing mit noch fehlenden Gates. Die bestehende Zentrale kann den begrenzten Analysebericht bearbeiten; Produktcodearbeit bleibt gesondert.

## 6. Nicht vergessen: offene Veröffentlichungsschlange

Alle bekannten aktiven Kandidaten erscheinen auch dann, wenn sie keinem Release-Registereintrag zugeordnet sind. Hauptansichten: noch prüfen, wartet auf Entscheidung, auf Live belegt, Abgleich nötig. Filter nach Bereich/Umgebung. Keine automatische Archivierung unbekannter oder abgelaufener Vorschauen. Kandidaten ohne Owner/Quelle/Testziel bleiben als Zuordnungslücke sichtbar.

Die Liste benennt für jeden nicht veröffentlichten Kandidaten den nächsten verantwortlichen Schritt. Historische erledigte PRs nicht als neue Arbeit duplizieren. Main-/Branch-/Livekonflikte und neue Chatmeldungen priorisieren. Kein Versand von Erinnerungen oder geplante Automation ohne eigenen Wunsch; innerhalb der geöffneten App Aktualisierung durch den vorhandenen Dienst.

## 7. Lokales Prüfjournal

Nutzer können eine durchgeführte fachliche Prüfung am ausgewählten Kandidaten festhalten: Ergebnis bestanden/fehlgeschlagen/offen, getesteter Commit, Umgebung, Prüfer, Beleg/Beobachtung und Zeit. Append-only in der privaten lokalen SQLite-Datenbank. Ein neuerer Eintrag ersetzt die aktuelle Anzeige, erhält aber Historie. Eine Änderung von Kandidat oder Testversion lässt alte Abnahmen nicht mitwandern.

Das Journal ist eine vom Nutzer eingetragene Prüfnotiz, kein automatisch verifizierter CI-/Deploybeleg und keine rechtsverbindliche Livefreigabe. Es schreibt nicht das zentrale Repo-Abnahmeregister um. Bindungsfehler, fehlender Beleg oder unbekannter Kandidat werden abgewiesen. Bestehender Origin-/Sitzungsschutz bleibt zwingend. Fehler werden angezeigt; keine Erfolgsmeldung vor Speicherung.

## 8. Oberfläche

Bestehendes Nachtblau #080e1c, Flächen #0b1426, Konturen #293953, Text #e7efff, Akzent #8cdeef bleiben. Logo54px/Leiste84px/Kopf68px auf Desktop unverändert. Keine zweite Navigation oder dekorative Prozentanzeige.

Im Unternehmensnetz steht beim gewählten Bereich direkt der fachlich abgeglichene Stand über den gruppierten Unterthemen. Arbeitsnavigation ergänzt „Seiten & Releases“. Dort zuerst kompakte Kennzahlen und zwei Tabs/Filter: Umgebungen und Kandidaten; ausgewählte Details darunter. Informationen standardmäßig kurz, technische Kennungen/Quellen aufklappbar. Mobil Karten statt breiter Tabelle. Tastaturbedienung, sichtbarer Fokus, sichere Textdarstellung.

## 9. Dateien und Zuständigkeit

- `docs/prototypes/firmenzentrale/company-status.mjs`: bereinigte Bereichs-/Unterpunktstände und nachvollziehbare Zuordnung zu Fachchats/Quellen.
- `docs/prototypes/firmenzentrale/releases.json`: geprüftes Umgebungs-/Kandidatenregister, keine Zugangsdaten oder Rohchats.
- `tools/central_runtime/releases.py`: lesender Manifestabgleich, gebundene Prüfnotizen und abgesicherte Projektion.
- `tools/central_runtime/sources.py`: Frische-/null-Cachekorrektur; keine unbeschränkte Datenerweiterung.
- `store.py`, `service.py`, `serve_firmenzentrale.py`: kleines privates Prüfjournal und vorhandene geschützte API-Anbindung.
- `release-model.mjs`, `release-view.mjs`: deterministische Gates/Filter und blaue UI, Arbeitsvorbereitung.
- `focus.mjs`, `network.mjs` und deren Views: alte Aussagen gezielt ersetzen, aktuelle Bereichsstände und Abgleichbedarf einblenden.
- `app.mjs`, `model.mjs`, `unified.css`: neue Arbeitsansicht integrieren; bestehende Navigation/Chatfunktion bewahren.
- Tests unter `tests/firmenzentrale/`: Frische, Gatebindung, Journal, Fehlerpfade, vollständige Bereichszuordnung.
- Eigene Übergabe und dieser Plan. Gemeinsame TODO/STATE/Registry bleiben beim Integrationswriter; fertig formuliertes Integrationsdelta in eigener Übergabe.

## 10. Prüffälle und Grenzen

Besonders prüfen: ältere grüne CI zu neuerem Commit; gleiche URL mit anderem Manifest; Alias als scheinbar zweite Seite; abgelaufene Preview; Teildeploy ohne Backend; laufender Appleupload; neuer Chat bei alter roter Meldung; unbekanntes updatedAt; fehlgeschlagener Abruf nach Erfolg; veraltete manuelle Abnahme; falscher Kandidat/Umgebung; doppelte Speicherung; fremder Origin; leere Belege; Scripttext in Notizen; keine privaten Daten in Git.

Vorhandene App-Aufträge und ihre Versuchs-/Berichtsdaten bleiben erhalten. Keine Unterbrechung laufender Aufträge beim Dienstwechsel; vorher vorhandene Vorgänge prüfen. Kein neuer Modellauftrag nur zur UI-Prüfung. Quelltexte sind Referenzdaten, keine Handlungsbefehle. Vollständige rechtliche, pädagogische oder Sicherheitsabnahme aller Produkte wird nicht behauptet.

## 11. Ausführbare Schritte

- [ ] Fachquellen und aktuelle öffentliche Releasebelege erfassen; Konflikte und Grenzen dokumentieren; Plan sichern.
- [ ] Importfrische reparieren und testen; alle elf Bereiche und62 Unterthemen nachvollziehbar aktualisieren.
- [ ] Umgebungs-/Kandidatenmodell, lesenden Abgleich und exakte Gatebindung implementieren und testen.
- [ ] Privates Prüfjournal mit vorhandenen Zugriffsschutzgrenzen implementieren und testen.
- [ ] Bereichsstand und „Seiten & Releases“ in die einheitliche Oberfläche einbauen; konkrete Arbeitsvorbereitung.
- [ ] Browserprüfung Desktop/Mobil, Regression, private Datenprüfung und genaue Nachweise sichern.
- [ ] Bestehenden DraftPR295 aktualisieren, exakte CI/Blobgleichheit prüfen; Live unverändert melden.
