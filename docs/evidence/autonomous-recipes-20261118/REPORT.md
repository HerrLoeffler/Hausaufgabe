# Autonomes Aufgabenlabor mit Codex · erster begrenzter Lauf

GC-EXTENDED-QUESTION-TYPES-01 · 18.11.2026 · bestehende Draft-PRs419/418. Martin wünscht viele selbstständige Versuche nach dem Rennspielprinzip, kleine aufeinander aufbauende Verbesserungen und erst am Ende wenig menschliches Feedback. Ausdrücklich freigegeben: insgesamt5USDModellbudget für diesen ersten Probelauf. Das ist keine Freigabe für einen unbegrenzten täglichen Dienst.

[Zehn ausgewählte Aufgaben öffnen](https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/?deck=training%3Aauto-recipes-20261118-v1-final). Mit dem vorhandenen freigegebenen Testkonto anmelden. Martin hat den Laborzugang inzwischen selbst mit „bin drin“ bestätigt; das ist keine fachliche Aufgabenabnahme.

## Was tatsächlich läuft

Codex implementiert und steuert hier einen wiederaufnehmbaren Versuchsleiter. Die bestehende API-KI erzeugt Aufgaben. Ein separates Modell löst anhand der öffentlichen Schüleransicht; ein weiterer unabhängiger Aufruf sucht gezielt Fehler und Gegenargumente. Zahlen prüft zusätzlich der unabhängige rationale Rechner, Punkte die vorhandenen Bauteile. Unbekannte Providerergebnisse behalten ihre Kostenreservierung und werden nicht blind neu gestartet.

Nach einer vollständig geprüften Entwicklungsserie analysiert ein Optimierer die konkreten früheren Fehler einschließlich erfolgreich reparierter Erstversuche. Er schlägt genau eine kleine zusätzliche Rezeptanweisung vor. Neue Fassungen bearbeiten dieselben eingefrorenen Wünsche. Ein Rezept darf nur bei besserer geprüfter Abdeckung oder mehr Ersttreffern bei gleicher Endabdeckung und ohne Regression gewinnen. Identische effektive Rezepte zählen nicht als Fortschritt; Gleichstände bleiben beim bisherigen Stand.

Der erste Lauf wurde in diesem Codex-Chat durch einen lokalen Controller ausgeführt. Zustand, bezahlte Aufrufe und Ergebnisse liegen dauerhaft in Firestore. Kein dauerhafter Tages-Scheduler wurde eingerichtet. Kein neues Grundmodell und keine Modellgewichte wurden trainiert. Dies ist eine reale automatische Rezeptsuche mit Prüfungen und Codeverbesserungen, kein behauptetes neuronales Selbsttraining.

## Umfang und Resultat

40 verschiedene Wünsche:20 zur Entwicklung,20 zunächst zurückgehaltene Transferwünsche. Drei Entwicklungsstände ergeben60Fallausführungen. Da kein verändertes Rezept gewann, wurde nur eine weitere20erBaseline-Prüfserie ausgeführt. Kein zweiter Baseline-Lauf wurde zur Auswahl einer günstigeren Stichprobe benutzt. Insgesamt80Fallausführungen und116erzeugte Fassungen einschließlich begrenzter Reparaturen.

| Stand | Im Erstversuch bestanden | Nach begrenzter Reparatur bestanden | Entscheidung |
| --- | --- | --- | --- |
| Basis,20Entwicklungswünsche | 16/20 | 20/20 | Behalten |
| Änderung1: vollständige Kurzlabels | 13/20 | 19/20 | Verworfen, Regression beim Grundwert |
| Änderung2: Auftrag auf tatsächlich offene Felder beziehen | 11/20 | 19/20 | Verworfen, Regression beim Grundwert |
| Zurückgehaltene Basiswünsche | 13/20 | 19/20 | Kontrollnachweis; ein Fall gesperrt |

„Bestanden“ erfordert hier Blindlösung, technische/rechnerische Prüfung und bestandenes Gegenspielerurteil. Die Rohstatusmarke ready allein genügt nicht. Die Zahlen sind Beobachtungen eines kleinen Pilotlaufs und kein kausaler oder allgemeiner99-Prozent-Nachweis. Die beiden Änderungen zeigten keinen verlässlichen Gewinn; sie wurden nicht als Erfolg übernommen.

Zehn Finalisten wurden nach öffentlichen Aufgabeninhalten dedupliziert, mit höchstens zwei je tatsächlicher Lernhandlung und mit Vorrang für Breite ausgewählt. Zehn unterschiedliche Familiennamen allein hätten nicht genügt. Auswahl: Blutkreislauf, englische Verbverzweigung, Simple Past, Leihrad-Grundpreis, Maßstab, Geschwindigkeit/Fahrzeit, Behauptung/Begründung, Mischungsverhältnis, Temperaturänderung und Ankunftszeit. Das sind zehn Anwendungen in sieben Gruppen von Lernhandlungen, keine zehn neu trainierten Sprachmodelle und keine repräsentative Qualitätsstichprobe.

Die Finalisten wurden im Browser vollständig beantwortet und bewertet. Leere Abgabe und eine falsche Antwort bzw. fehlende Verbindung ergaben ebenfalls die erwarteten Teilpunkte. Alle zehn bei1280/820/360Pixeln erreichbar, keine Seitenfehler. Echte Touchbedienung und menschliche fachliche Sichtung bleiben offen. Keine Lehrkrafturteile wurden simuliert oder als menschliche Freigabe gespeichert.

## Was Codex aus den Fehlern verbessert hat

Die erste automatische Änderung zielte nur auf abgeschnittene Rollenwörter. Die Ursache lag im festen Baustein, der Wörter nach8Zeichen abschnitt. Die zweite Analyse bekam deshalb die ursprünglichen Erstfehler und den verworfenen ersten Vorschlag; hierfür wurde einmal begründet von Luna/low auf Sol/medium gewechselt. Erzeuger, beide Prüfer, Referenzwünsche und Akzeptanzmaßstab blieben während der Studie unverändert. Deren tatsächliche Request-Verträge wurden nachträglich auf Gleichheit geprüft.

Nach Abschluss, ohne alte Ergebnisse umzuschreiben, wurden zwei Codefehler für künftige Aufgaben behoben:

- Ein pauschal angehängter Auftrag zur linken Spalte konnte Einträge in einer vollständig gegebenen Spalte verlangen. Die Bedienanweisung bezieht sich jetzt auf die tatsächlich offenen Zahlenfelder und Rechenpfeile; Frage und visueller Auftrag bleiben identisch.
- Kurzrollen verwenden ganze Wörter. „Behauptung“ und „Begründung“ bleiben vollständig; überlange Rollen fallen auf vollständige kurze Bezeichnungen zurück. Ein eigener Browser-Fixturetest prüft diese neuen Rollen in drei Breiten. Alte Final-Snapshots bleiben unverändert.

Außerdem wurde ein Falschpositiv des Gegenspielers beobachtet: Ein bewusst vorgegebener Parallelpfeil kann bei erlaubter Hilfestufe eine legitime Transferhilfe sein. Der Prüfer hatte das als Lösungsleck verworfen. Die Regel für künftige Prüfungen wurde am vorhandenen Differenzierungsvertrag ausgerichtet; verratene Endergebnisse und unerlaubte Hilfen bleiben verboten. Die Wirkung dieser neuen Prüferregel wurde noch nicht mit neuen bezahlten Durchläufen gemessen. Sie verbessert die berichteten alten Quoten nicht rückwirkend.

Diese Beobachtung ist gerade für späteres Modelltraining wichtig: KI-Urteile sind vorläufige Labels. Ein kritischer Prüfer kann ebenfalls falsch liegen. Solche Daten dürfen nicht ungeprüft zum Trainingsziel werden. Menschliches Feedback an der kleinen Endauswahl und gezielte Kalibrierungsfälle ergänzen die automatische Schleife.

## Prüfungen, Verlauf und Kosten

Frischer unabhängiger Review vor dem ersten Paid-Call: zweiP1- und fünfP2-Befundgruppen. Behoben: freie Rezept-Hinweise ohne Optimiererbindung, scheinbarer Fortschritt aus identischen Rezepten, verlorene Reparaturursachen, falsche Vielfalt, biologische Zielwörter im Prüferwunsch, öffentliche Zwischenstände/veränderliche Finalisten sowie konkurrierende/verlorene Zustände. [Befunde und Fixpass](REVIEW.md). Regressionen zunächst rot, am Ende77lokaleTestsgrün. Ein neuer Revieweraufruf wurde nicht als Ersatz für reproduzierende Tests benutzt.

Der Controller wurde vor Optimierung2 gezielt pausiert, ohne serverseitige Aufrufe abzubrechen. Alle139damaligenProviderbelege waren vor Wiederaufnahme abgeschlossen, keine Reservierung offen. Der pausierte Client lief danach in einen Timeout; derselbe Lauf wurde aus seinen gespeicherten Phasen fortgesetzt. Keine Aufrufe doppelt bezahlt. Eine erneute Ausführung nach Abschluss gab sofort denselben vollständigen Abschluss zurück;319Aufrufe und Kosten blieben unverändert.

319Provideraufrufe:116Erzeugungen,109Blindprüfungen,92Gegenspielerprüfungen,2Optimierungen.401.882Eingabetokens,83.478Ausgabetokens. Berechnet nach gespeichertem Preisstand:0,723030USD,0offeneReservierungen, gemeinsames transaktionales5-USD-Limit. Das sind berechnete Modellkosten, keine vollständige Rechnung einschließlich Infrastruktur/Steuern/Codex-Abonnement. Tatsächliche Modelle:gpt-6-luna für Erzeugung und Optimierung1;gpt-6.2-sol für unabhängige Prüfungen sowie Optimierung2(medium).

14Hostingdateien bytegenau bestätigt; eine bestehende Testfunktion aktualisiert,97andereFunktionseinträge unverändert. Keine kanonische Hosting-, Rules-, Assessment- oder Productionbereitstellung. Vorschau bis18.12.2026. Laufender Controller und bezahlte Arbeit beendet.

## Speicher und Herkunft

Firestore gradecrew-staging-2026/(default), bestehendesSTANDARD/eur3:

- taskLearningAutoRuns/auto-recipes-20261118-v1: gemeinsames Budget, beide Strategievorschläge, Vergleiche, Abschluss und Herkunft.
- taskLearningRuns/auto-recipes-20261118-v1-dev0/dev1/dev2/test0: private eingefrorene Phasen mit Fällen, Versuchen, Prüfungen und Providerbelegen. test1 wurde bewusst nicht erzeugt.
- taskLearningRuns/auto-recipes-20261118-v1-final: zehn gemeinsam sichtbare, unveränderliche Testaufgaben mit Verweisen auf ihre ursprünglichen Fassungen.
- Vorhandene taskLearningRecipes/taskLearningExamples/Lehrkraftspeicher bleiben erhalten. Systemurteile sind keine menschlichen Freigaben. Automatische Entwicklungsserien lesen keine privaten Lehrkraftbeispiele.

Studienquelle zuerst lokal917b174/remote d16a82702ed132b438fb292bf6da9a59cc81906d; zweite Optimierungsanalyse lokaldf3cbee/remote a94481bb3ad1d465f95b383c11d2a9859814ddbf. Neuer Code nach Studienabschluss lokal708132b/remote cb2d72b60f9191220f14afcd4deda3da29e6d683, Funktionshash b9543410e392eb635ab3917a178e0e8bb64ceb50. Diese neuen Codekorrekturen sind nicht rückwirkend als besseres Rezept gemessen.

Belege: [Auswertung](audit.json), [unveränderte Verträge/Budget](contract-verification.json), [Vergleich](development.json), [Abschluss](outcome.json), [Browser](browser-verification.json), [Bereitstellung](deployment.json), [Änderung1](strategy-v1.json), [Änderung2](strategy-v2.json).

Nächster Schritt: Martin sieht nur die zehn Anwendungen und gibt bei Bedarf ein kurzes Urteil oder eine gemeinsame Notiz. Danach gezielte Kalibrierung strittiger Prüferurteile und eine weitere getrennte Erprobung der behobenen Bausteine. Erst belastbare, fachlich bestätigte Beispiele als mögliche Fine-Tuning-Daten verwenden; nach offengelegten Testbeispielen braucht ein späterer Generalisierungsnachweis neue zurückgehaltene Wünsche. Kein automatischer Production-Rollout oder unbegrenztes tägliches Nachtrainieren.
