# GC-BRAIN-01: Bereichsfokus als Arbeitszentrale

Stand: 25. Oktober 2026. Ergänzung des bestehenden Firmenzentralenplans und PR295. Dieses Konzept konkretisiert die Navigation und Arbeitsübersicht; die übrigen Unternehmens-, Speicher-, Eingangs- und Automatisierungsanforderungen des Masterplans bleiben bestehen. Der direkte Auftrag umfasst Konzept und anschließende Umsetzung durch diesen Fachchat. Keine weitere Designfreigabeschleife, keine Delegation und keine zweite App.

## 1. Was die Oberfläche leisten muss

Martin soll eine Unternehmensfrage stellen können, indem er einen Bereich auswählt: Was gehört dazu? Was existiert bereits? Wo fehlt etwas? Was hält andere Arbeit auf? Welcher nächste Schritt ist sinnvoll? Wer muss daran arbeiten? Die Antwort darf nicht aus allgemeinen Schlagworten bestehen. Ein Unterpunkt benötigt mindestens einen begrenzten Ausgangsstand, eine offene Lücke, eine konkrete nächste Aktion und eine erkennbare Quelle.

Das Netz ist die räumliche Arbeitsnavigation. Auf der höchsten Ebene zeigt es elf große Bereiche und deren gerichtete Beziehungen. Nach Auswahl wird genau dieser Bereich zum Mittelpunkt. Seine Unterpunkte ersetzen das übrige Unternehmensnetz. Der Nutzer muss nicht zwischen einer linken und einer rechten Kopie derselben Bereichsliste wählen. Ein klarer Rückweg stellt das Gesamtnetz wieder her.

Ein Klick auf einen Unterpunkt öffnet dessen Arbeitsblatt im rechten Inspektor, auf schmalen Bildschirmen darunter. Der Bereich bleibt der Mittelpunkt und der ausgewählte Unterpunkt wird hervorgehoben. Jeder Unterpunkt ist auch per Tastatur erreichbar. Ein stabiler Link hält Bereich und Unterpunkt beim Neuladen fest. Der Zurück-Knopf des Browsers führt durch dieselben Ebenen.

## 2. Verbindliche Bedienfolge

1. Gesamtnetz öffnen: elf Bereiche, gerichtete Verbindungen, Engpassübersicht.
2. Bereich anklicken: seine Position wechselt in die Kartenmitte; direkte Unterpunkte erscheinen darum. Der Titel benennt jetzt den Bereich.
3. Bereichsübersicht lesen: Anzahl der erfassten Unterpunkte, gemeldete Engpässe, offene Abnahmen und offene Klärungen. Zahlen sind reine Bestandszählungen, keine Fortschrittsprozente.
4. Eine dringende Arbeit wählen: Das Arbeitsblatt zeigt denselben Unterpunkt wie das Netz, seine begrenzte Wirkung und die nächste Aktion.
5. Unterpunkt wählen: aktueller dokumentierter Stand, verbleibende Arbeit, Abnahmekriterien, Verantwortung, Quellenstand und Kontextbeziehungen erscheinen.
6. Arbeitsschritt vorbereiten: ein lokaler ungesendeter Entwurf enthält Bereich, stabilen Unterpunkt, Ausgangsstand, Lücke, nächste Aktion, Abnahmekriterien, Zuständigkeit und Quelle. Der Entwurf nutzt die bestehende Persistenz.
7. Zum Bereich zurück: Auswahl des Unterpunkts wird aufgehoben. Zum Gesamtnetz zurück: alle Unternehmensbereiche und ihre Beziehungen erscheinen wieder.

Das Layout kann ohne Übergangsanimation benutzt werden. Bei erlaubter Bewegung wird der ausgewählte Bereich aus seiner bisherigen Lage in die Mitte geführt; Unterpunkte erscheinen danach. Bei reduzierter Bewegung wird sofort auf den Endzustand umgeschaltet. Animation darf keine Aktion oder Information verzögern.

## 3. Informationsordnung und Umfang

Die vorhandenen Unterpunkte aus portfolio.mjs bleiben erhalten. Stabile IDs werden getrennt von sichtbaren Namen geführt. Eine spätere Umbenennung darf Links, Aufgaben oder Nachweise nicht brechen. Die erste Umsetzung erschließt alle elf Bereiche; sie baut nicht nur eine schöne Design-Beispielseite.

| Bereich | Unterpunkte |
|---|---|
| Web | Remy/Erstellung; Editor/Emmi; Formate/Audio; Wilma/Ergebnisse; Schülerprüfung/Lösungsfreigabe; Drucken/Arbeitsblätter |
| Klassen | Schüler/Klassen; ASV/Import; Lehrkräfte/Fächer; Zuweisungen/Freigaben; Lehrerübersicht/Monitoring |
| Native | Lehrer-App; Secure; Offline/Synchronisation; TestFlight/Store; Native/Web-Vertrag |
| Games | Bruchpizzeria; Lerninsel; Escape/Expedition; Mathe-Gruppen; Wissensreise/Test-Rallye; ET/Feedback/Live-Integration |
| Lernen | Adaptives Lernen; Kapiteltests; Lehrpläne/Kompetenzen; Material/Medien; Aufgabenqualität/Fundus; Internationalisierung; technische Erneuerungen der Aufgaben |
| Design | Marke/Logo; Crew; Startseite/Dashboard; Tutorial/Einstieg; Designsystem/Geräte |
| Betrieb | Domain/Hosting; Backend/Daten; Release; BugOps; Gateway/Kosten; Sicherung/Wiederherstellung |
| Kunden | Piloten/Onboarding; Support; Lehrkräftefeedback; Nutzungsanalyse; Evaluation |
| Firma | Unternehmensziele; Finanzierung; Angebot/Lizenzen; Marketing/Partner; Finanzen/Organisation; Geschäftsaufbau |
| Governance | Verträge/AVV; Datenflüsse; Anbieter/Regionen; Medien-/Markenrechte; Berechtigungen/Löschung; technische Sicherheit |
| Zentrale | Projektlandkarte; Ziele/Entscheidungen; Chat-Aufträge; Wissen; Eingang/Automatisierung |

Unterpunkte beschreiben einen steuerbaren Arbeitsumfang. Sie sind keine zusätzlichen Produkte, Chats oder automatisch gestarteten Aufträge. Ein Unterpunkt darf mehrere bestehende Tasks referenzieren; die ursprünglichen Task-IDs bleiben maßgeblich. Die Zuordnung von Quellen wird redaktionell geprüft, nicht aus einem unscharfen Treffer als Tatsachenbeweis übernommen.

## 4. Status und Dringlichkeit sauber trennen

Es gibt vier Arbeitslagen in dieser Ansicht:

- **Engpass gemeldet:** eine datierte Quelle berichtet ein konkretes Hindernis im benannten Teilumfang. Die Oberfläche darf damit nicht den gesamten Zielbereich rot sperren.
- **Abnahme offen:** ein Bestand oder Kandidat ist beschrieben, aber der gewünschte Nutzungsumfang ist noch nicht passend abgenommen.
- **Bestand dokumentiert:** ein konkreter Bestand ist nachgewiesen; das ist keine umfassende Produktfreigabe. Sein noch fehlender Nachweis bleibt daneben sichtbar.
- **Klärung offen:** eine Entscheidung oder ein belastbarer Nachweis fehlt. Fehlender Beleg ist weder Nullfortschritt noch Fehlfunktion.

Die Stufen branch_only, ci_green, integriert, Staging, Gerätetest und Production bleiben in den ursprünglichen Releasequellen. Der Arbeitsstatus fasst sie nicht zu einer künstlichen Ampel zusammen. Auch ein grün geprüftes Logo macht die gesamte Designarbeit nicht grün.

Dringlichkeit ist ein gesondertes Feld mit Begründung. **Dringend** gilt zuerst für die drei bekannten begrenzten Blockaden: Classroom-Zugang/Zuweisung, adaptiver Pilot und automatischer Chat-Auftragsweg. **Als Nächstes** bezeichnet einen notwendigen Abnahme- oder Qualitätsbaustein. **Einplanen** bezeichnet geplante Klärungen. Diese Reihenfolge ist ein Vorschlag aus dem erfassten Stand; sie ist kein neuer Beschluss der Unternehmensführung. Die Anzeige erklärt jeweils, warum sie die Arbeit nach vorn stellt.

Die konkrete Frage „Wo müssen wir dringend ran?“ wird in jedem Bereich durch eine sortierte Liste beantwortet. Die Liste zeigt Titel, Priorität, Grund und nächste Aktion. Ohne gemeldeten Blocker heißt es ausdrücklich „Kein Engpass in dieser Erfassung gemeldet“; daraus folgt keine Aussage über störungsfreien Livebetrieb.

## 5. Arbeitsblatt pro Unterpunkt

Pflichtfelder: id, domainId, title, state, priority, why, current, gap, next, acceptance[], owner, source, sourceDate. current und gap stehen als getrennte Sätze. next beginnt mit einer ausführbaren Handlung. acceptance enthält überprüfbare Ergebnisse statt „alles testen“. Jede Quelle hat Datum und begrenzten Geltungsbereich. Nicht verfügbare Details bleiben ausdrücklich unbekannt.

Das Arbeitsblatt zeigt zuerst Status und nächste Aktion, danach Ausgangsstand, Lücke und Abnahme. Verantwortung ist die bestehende zuständige Rolle; eine Rollenbezeichnung ist keine Zusage, dass gerade ein Chat daran arbeitet. Ein vorbereiteter Entwurf wird nicht als angenommen oder versendet bezeichnet.

Die Bereichsbeziehungen bleiben im Bereichsblatt erreichbar: eingehende Voraussetzungen, ausgehende Wirkungen und deren Quellen. Die Unterpunkt-Speichen bedeuten ausschließlich „gehört zu diesem Bereich“. Sie erhalten keine Pfeilspitzen, damit sie nicht mit einer fachlichen Abhängigkeit verwechselt werden. Eine Abhängigkeit zwischen einzelnen Unterpunkten darf erst nach konkreter Modellierung und Beleg als gerichtete Verbindung erscheinen.

## 6. Technische Erneuerungen der Aufgaben

Dieser Block wird eigener Unterpunkt im Lernbereich. Bewährte Formate bleiben Bestandslinie, neue technisch anspruchsvolle Formate werden Kandidaten. Das Ziel „grün“ gilt immer für Formatversion, Renderer, Bewertungsvertrag und konkrete Einsatzumgebung. Keine Sammelfreigabe aus einer einzelnen gelungenen Aufgabe.

Der geplante Kandidatenprozess lautet: Vorschlag → ausführbarer lokaler Kandidat → fachlich und technisch geprüft → wiederholt stabil → begrenzter Einsatz freigegeben → im Betrieb beobachtet. Rückstufung ist ausdrücklich möglich. Fehlerfälle erhalten reproduzierbare Eingaben und erwartete Ergebnisse. Eine Regression sperrt den betroffenen Kandidaten; die bewährte Formatfamilie bleibt verfügbar, sofern ihre eigenen Prüfungen tragen.

Je Kandidat werden Beispieldatensatz, Medien-/Eingabezustände, Bewertung, Speichern/Neuladen, leere/ungültige Eingaben, Gerätebedienung und erreichbare Alternativen geprüft. Wiederholung wird nicht durch eine hohe Testzahl ersetzt: gleiche Eingabe muss konsistent sein, relevante Variation muss abgedeckt sein. Die drei bestehenden Aufgaben-Fachchats liefern ihre Nachweise zum vorhandenen Task zurück. Dieses UI startet sie nicht.

Die erste Umsetzung zeigt dafür den bestehenden Ausgangsstand, die offene Kandidaten-/Regressionsmatrix, die nächste Aktion und konkrete Abnahmekriterien. Ein ausführbarer Test-Runner, automatisches Grünschalten und Produktfreigaben sind spätere getrennte Implementierungsschritte; die jetzige Oberfläche darf diese nicht vortäuschen.

## 7. Visuelles und räumliches Konzept

Die vorhandene dunkelblaue neuronale Netzsprache bleibt erhalten. Farben: Grund #080e1c, Kartenfläche #0a1426, Beziehungen #52dcec, Abstimmung #a98aff, offene Abnahme #f6c56b, gemeldeter Engpass #ff7a91. Typografie bleibt Systemschrift mit klarer Größenhierarchie. Originalmarke unverändert aus dem vorhandenen Manifest.

Im Fokus ist der Bereich der einzige große zentrale Knoten. Unterpunkte liegen als beschriftete, gut anklickbare Satelliten mit Statuszeile ringsum. Die Verbindungslinien sind ruhig, der Schwerpunkt liegt auf den Texten. Rechts ist Platz für ein Arbeitsblatt, nicht für eine zweite Navigation. Auf Tablet/Handy folgt das Arbeitsblatt unter dem Netz; eine zugängliche kompakte Unterpunktliste bietet lesbare Auswahl, wenn die Übersicht stark verkleinert wird.

```
Gesamtnetz / Marke & Crew                  Quellenstand
Unterpunkte und nächste Arbeit            Suche

     Marke & Logo           Crew           Arbeitsblatt
             \             /              Status
          [ Marke & Crew ]                 Nächste Aktion
             /      \                     Stand / Lücke
      Tutorial      Designsystem           Abnahme / Owner
               Dashboard                  Quelle / Entwurf

Dringlichkeit mit Grund · alle Unterpunkte erreichbar
```

Verworfene Ansätze: das Gesamtnetz nur verschieben würde die Unterpunkte nicht erschließen. Eine zusätzliche Kachelübersicht würde die abgelehnte doppelte Navigation zurückbringen. Ein endlos frei wachsendes Netz aller Aufgaben würde Texte überlagern und die Entscheidung erschweren. Gewählt ist deshalb ein fokussiertes Nachbarschaftsnetz mit stabilem Rückweg. Diese Umsetzungsauswahl trifft der ausführende Chat auf Basis des direkten Auftrags.

## 8. Suche und Filter

Im Gesamtnetz bleibt die Suche bereichsübergreifend. Im Bereichsfokus durchsucht sie Titel, Stand, Lücke und nächste Arbeit der Unterpunkte. Der Suchstatus benennt die Anzahl passender Unterpunkte. Ein erfolgloser Suchbegriff zeigt einen klaren Leerzustand und einen Weg zum Zurücksetzen. Die Filter heißen im Fokus „Alle Unterpunkte“, „Dringend“ und „Abnahme offen“. Bereits geöffnete Arbeit bleibt im Inspektor mit ihrem Kontext sichtbar, auch wenn ein Filter andere Kandidaten hervorhebt.

Filter und Suchbegriffe werden beim Ebenenwechsel zurückgesetzt, damit Unterpunkte nicht unsichtbar aus einer vorherigen Ansicht heraus gefiltert werden. Zoom und Verschieben werden beim Wechsel zu einem anderen Bereich ebenfalls zurückgesetzt. Beim Öffnen eines Unterpunkts im selben Bereich bleibt die Kartenposition erhalten. „Einpassen“ stellt die gesamte fokussierte Nachbarschaft wieder her.

## 9. Persistenz, Adressierung und Fehlerfälle

Bestehende Route: #/arbeit/landkarte. Bereich: #/arbeit/landkarte/design. Unterpunkt: #/arbeit/landkarte/design/marke. Ungültiger Bereich zeigt eine verständliche Meldung und das Gesamtnetz. Ungültiger Unterpunkt zeigt den gültigen Bereich und eine Meldung; er darf keine leere Seite auslösen. Veraltete Links auf die vollständige Akte funktionieren weiterhin über #/arbeit/akte/ID.

Die neue Ansicht speichert keinen Firmenstatus im Browser. Der Bestand ist ein versionierter redaktioneller Snapshot. Nur persönliche Entwürfe nutzen den vorhandenen lokalen Speicher und dessen Fehlerbehandlung. Keine automatische Übertragung, kein Konto, keine neuen Empfänger und keine externen Bilder/Fonts/SDKs. Browser-Neuladen rekonstruiert die Auswahl aus der URL.

Aktuelle historische Fachstände stammen aus der Inventur vom23.10.; die Umsetzung entsteht am25.10. Beide Daten dürfen nicht vermischt werden. Vor tatsächlicher Facharbeit müssen die aktuellen Task-/Branch-/CI-/Releasequellen erneut gelesen werden. Der heutige frische Development-Status ist ein Koordinationsnachweis, kein Beweis einer erneuten fachlichen Vollprüfung aller Produkte.

## 10. Spätere durchgängige Firmensteuerung

Die Fokusansicht ist die Navigations- und Leseschicht der vollständigen Zentrale. Nächste erforderliche Schichten bleiben: beständiger gemeinsamer Store mit Identität und Rollen; Aktualisierung aus erlaubten Quellen mit Version/Alter/Fehlerstatus; belegte Ziele und Entscheidungen; echter Auftrag/Annahme/Ausführung/Rückmeldung; Eingangsquellen für Kunden, Mail und Probleme; qualifizierte Automatisierung; Sicherung/Wiederherstellung; vollständige V1-Abnahme.

Spätere Statusaktualisierung muss Quelle, Zeit und Konflikt nennen. Widersprechen sich Chat und CI, bleiben beide Aussagen sichtbar, bis zuständiger Owner klärt. Die Quellenpriorität hängt von der Aussage ab: CI belegt Tests, Deploymentreceipt belegt Veröffentlichung, ein Fachbericht beschreibt offene Arbeit; keines ersetzt pauschal die anderen. Ein nicht erreichbarer Anschluss wird als veraltet/fehlgeschlagen angezeigt und nicht durch einen alten grünen Wert verdeckt.

Späterer Chatversand benötigt eine stabile Auftrags-ID und einen überprüfbaren Annahmebeleg. Unklare Versandresultate werden abgeglichen statt erneut gesendet. Fortschritt entsteht aus vereinbarten abgenommenen Meilensteinen, nicht aus Chataktivität. Kunden-/E-Mailinhalte benötigen erlaubten Zugriff, passende Rollen und zweckbezogene Datenhaltung. Diese Folgearbeiten werden nicht durch die erste Fokusoberfläche als erledigt markiert.

## 11. Abnahme dieses Umsetzungsschritts

Alle elf Bereiche müssen beim Anklicken mittig stehen und alle bisherigen Unterpunkte enthalten. Der zusätzliche Erneuerungsblock muss separat auswählbar sein. Jede Unterpunktakte muss Stand/Lücke/Aktion/Abnahme/Owner/Quelle enthalten. Keine Statusvererbung vom Elternbereich, keine erfundenen Prozente und keine globale Freigabe.

Automatische Modelltests prüfen stabile IDs, vollständige Zuordnung, endliche eindeutige Positionen, zentrale Lage, leere/ungültige Auswahl, Filter/Suche, begrenzte Priorisierung und Entwurfkontext. Browserprüfung umfasst Gesamtnetz→Design→Marke, Lernen→Erneuerungen, Classroom→Zuweisung, Rückwege, Neuladen, Filter-Leerzustand, Tastatur, verkleinerte Breite und Entwurf ohne Versand. Bestehende Tests müssen weiter bestehen.

Ergebnisstufen: lokal umgesetzt und geprüft; auf dem bestehenden Branch gesichert; CI des exakten Remotecommits; getrennt davon spätere Integration/Deployment/Nutzertest. Eine lokale Vorschau ist weder Production noch vollständige Firmen-V1. Unabhängiger Review wird ohne tatsächlichen Prüfer nicht behauptet. Der bestehende Wunsch „dieser Chat alleine“ bleibt maßgeblich.
