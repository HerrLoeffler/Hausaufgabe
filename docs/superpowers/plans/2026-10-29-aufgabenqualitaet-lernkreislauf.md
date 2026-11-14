# GradeCrew: Aus Feedback bessere Aufgaben entwickeln — Umsetzungsplan

> Für die Umsetzung: Aufgabe für Aufgabe mit `superpowers:executing-plans` im eigenen Checkout bearbeiten. Dieser Plan aktiviert keine Datenerhebung und erteilt keine Productionfreigabe.

**Ziel:** Nachweisen können, welche Aufgaben Lehrkräfte wie bewerten und verändern, welche Nacharbeit entsteht und welche geprüften Verbesserungen später bessere Ergebnisse liefern.

**Architektur:** Vorhandenes Aufgabenfeedback und persönlichen Lernkern erhalten. Den Analytics-Kandidaten aus PR263 gezielt weiterverwenden; keine zweite Ereignispipeline bauen. Private Aufgabenstände, datensparsame Ereignisse, fachliche Entscheidungen und Einsatznachweise über versionierte Referenzen verbinden.

**Technik:** Bestehende Web-Anwendung, Firebase Auth/Functions/Firestore, begrenzte Client-Outbox; PostHog nur als gesondert freigegebene, inhaltsfreie Auswertungsprojektion.

**Spezifikation:** Abschnitte 2–9 dieses Dokuments; ergänzend `docs/telemetry/MEASUREMENT_DESIGN.md` und `docs/learning/INTERACTIVE_TASK_PRINCIPLES.md`. Umsetzungsschritte in Abschnitt 10.

**Aufgaben:** GC-ANALYTICS-01, verbunden mit GC-WEB-REPAIR-20261007. Stand 29.10.2026. Dokumentationsstand, keine neue Implementierung.

## 1. Ausgangspunkt und Grenzen

Der letzte vollständige private Audit vom 28.10. umfasst 48 Meldungen, darunter 13 Aufgabenbewertungen: fünf positive, sieben negative und eine zurückgewiesene Prüferwarnung. Alle 13 hatten damals noch keine gemeinsame fachliche Freigabe. Daraus folgt weder, dass inzwischen nichts passiert ist, noch dass die Quote aller erzeugten Aufgaben bekannt wäre. Die 13 freiwilligen Bewertungen sind keine repräsentative Aufgabenstichprobe.

Der Readiness-Nachweis vom 29.10. beschreibt gespeichertes Aufgabenfeedback, begrenzte persönliche Anpassung und einen gemeinsamen Freigabeweg. Er belegt noch keinen vollständig durchlaufenen gemeinsamen Verbesserungsprozess. Ein Verwendungseintrag im KI-Auftrag beweist die Verwendung des Hinweises, noch keine Verbesserung der erzeugten Aufgabe.

PR263, Head `1b2fbdd14577e5646a1d57c1048623178ab1ff7a`, ist am 29.10. offen. Aktive Zeit, begrenzter Transport und serverbestätigte Abläufe sind als CI-geprüfter Kandidat dokumentiert, nicht als aktivierte neue Messung. Seine bestehenden Konfigurations-/Zweck-/Fristengates bleiben erhalten. Der bisherige Hosting-Nachweis `552b02be` ist kein Nachweis neuer Analytics- oder Lernfunktionen.

Historische Daten werden nur soweit ausgewertet, wie tatsächliche Belege vorliegen. Frühere aktive Bearbeitungszeiten, Löschgründe oder Aufgabenversionen werden nicht rückwirkend erfunden. Fehlende Informationen bleiben sichtbar als „nicht erfasst“ und werden für künftige Vorgänge verbindlich vorgesehen.

## 2. Was eine gute Aufgabe bedeutet

Wir benötigen eine gemeinsame Prüfrubrik. Jede geprüfte Aufgabenversion wird anhand derselben Kriterien bewertet:

1. **Fachlich richtig:** Sachverhalt, Lösung und Begründung stimmen; gleichwertige richtige Antworten werden berücksichtigt.
2. **Lernzielgerecht:** Aufgabe passt zu Fach, Jahrgang, Unterrichtsziel und gewünschtem Anspruch.
3. **Verständlich und vollständig:** Alle notwendigen Angaben stehen bereit; Formulierung und Antwortmöglichkeiten sind eindeutig.
4. **Angemessen anspruchsvoll:** Schwierigkeit entsteht durch die fachliche Leistung, nicht durch Missverständnisse oder Bedienhürden.
5. **Darstellung und Medien funktionieren:** Grafik, Skala, Audio und Beschriftungen passen zusammen und sind auf den Zielgeräten nutzbar.
6. **Bewertung stimmt:** Punkte, Teilpunkte, Toleranzen und manuell zu prüfende Antworten sind angemessen.
7. **Im Test sinnvoll:** Keine unbeabsichtigten Dopplungen, Lösungshinweise durch andere Aufgaben oder einseitige Verteilung der Lernziele.

Prüfergebnis pro Kriterium: bestanden / zu überarbeiten / nicht anwendbar / nicht geprüft. Schwere fachliche Fehler, falsche Bewertung oder fehlende notwendige Medien verhindern die Freigabe. Ein guter Durchschnitt darf solche Fehler nicht ausgleichen. Technische Validierung, Lehrkraftzufriedenheit und fachliche Freigabe bleiben getrennte Ergebnisse.

**„Aufgewertet“ wird konkret beschrieben:** beispielsweise verständlicher formuliert, fachlich korrigiert, didaktisch erweitert oder Darstellung repariert. Mehr Punkte, mehr Text und ein schwierigerer Aufgabentyp sind für sich keine Qualitätssteigerung.

## 3. Welche Daten wir sammeln

### 3.1 Verbindliche Zuordnung

Jede neue Aufgabe erhält eine dauerhafte `questionLineageId` und für jeden gespeicherten Inhaltsstand eine `questionRevisionId`. Die Revision umfasst Aufgabenstellung, Antworten, Lösungen, Medienreferenzen und Bewertungsregeln. Der Test hat eine eigene `testRevisionId`. Klonen und Ersetzen erzeugen neue Instanzen mit Herkunftsreferenz; die ursprüngliche Bewertung wandert nicht automatisch auf die Kopie.

Zum privaten fachlichen Kontext gehören Fach, Jahrgang, Aufgabentyp und ein kontrolliertes Lernzielkürzel, soweit vorhanden. Freie Themen, Diktate, Uploads, vollständige Prompts und Lösungen werden nicht in Analytics kopiert. Die berechtigte Detailprüfung lädt den vorhandenen privaten Aufgabenstand separat.

Die Lehrkraft wird intern über den authentifizierten Eigentümer zugeordnet. Die Analytics-Projektion verwendet einen zweckgebundenen pseudonymen Schlüssel sowie den berechtigten Schul-/Projektkontext. Namen und E-Mail-Adressen sind keine Analytics-Felder. Eine namentliche Zuordnung im Support erfolgt nur über die bestehende berechtigte Ansicht. Es gibt keine Rangliste der Lehrkräfte.

### 3.2 Datenvertrag und Quellen

| Signal | Erforderliche Angaben | Aussage und Grenze |
|---|---|---|
| Smiley | Bewertungs-ID, good/bad, Aufgabenversion, Testversion, Zeit, optional Grund | Persönliches Urteil zu genau diesem Stand; fehlender Smiley ist keine Zustimmung |
| Grund | Fachfehler, unklar, unpassendes Niveau/Lernziel, falsche Lösung/Bewertung, Medien-/Bedienfehler, Dopplung, persönliche Präferenz, sonstiges | Gründe sind freiwillig; „ohne Grund“ ist zulässig und sichtbar |
| Bearbeitung | Vorher-/Nachherrevision, Änderungsart, manuell/Emmi/Import, bestätigte Speicherung | Zeigt Nacharbeit, beweist allein weder Fehler noch Verbesserung |
| Entfernen/Ersetzen | Ursprungsrevision, Nachfolger soweit vorhanden, optional Grund | „Passt nicht in diesen Test“ von „fachlich falsch“ unterscheiden |
| Übernahme | Revision im bestätigten gespeicherten bzw. veröffentlichten Test | Verwendung ist ein Akzeptanzsignal; kein Richtigkeitsbeweis |
| Generierung | Auftrag, Zeitpunkte, Ergebnis, Modell-/Prompt-/Rezeptversion, Prüf-/Reparaturstufen | Nur tatsächlich aufgezeichnete Phasen ausweisen |
| Arbeitszeit | Test, Sitzungssegmente, geschätzte Aktivzeit, KI-Wartezeit, Abdeckungsstatus | Produktverbesserung und Nacharbeitsanalyse; keine Leistungsbewertung |
| Verbrauch | Auftrag, belegte Token-/Medienmengen, Wiederholungen, Preistabellenversion | Nur bei vollständigem Verbrauch und bekanntem Preis Kosten berechnen |
| Fachprüfung | Prüfkriterien, Befund, Prüferberechtigung, Entscheidung, Revision, Zeitpunkt | Beleg für eine konkrete fachliche Entscheidung |
| Lerneinsatz | freigegebene Regelversion, Auftrag, passender Kontext, Ergebnisreferenz | Belegt Einsatz; Ergebnis muss anschließend eigenständig geprüft werden |

Die vorhandenen Feedback- und Lifecycle-Ereignisse werden erweitert beziehungsweise normalisiert. Keine parallelen Ereignisse für denselben Speichervorgang einführen. Neue fachliche Ereignisnamen: `question_revision_saved`, `question_removed`, `question_replaced`, `quality_review_decided`, `learning_rule_released`, `learning_rule_applied`, `quality_evaluation_completed`. `learning_rule_applied` wird aus dem bestätigten serverseitigen Verwendungsnachweis projiziert, nicht vom Browser behauptet.

Gemeinsamer Ereignisumschlag: `eventId`, `schemaVersion`, `definitionVersion`, `sourceOperationId`, `occurredAt`, `receivedAt`, `sourceProject`, `environment`, `releaseCommit`, `trafficClass`, `testId`, `testRevisionId`, optional Aufgaben-/Generierungsreferenzen. Identität, Rollen, Projekt und Serverzeit bestätigt der Server. Eine private Inhaltsreferenz bedeutet keine Freigabe dieses Inhalts für PostHog.

Wiederholte Zustellung derselben ID wird einmal gezählt; abweichender Inhalt unter derselben ID wird abgelehnt. Begrenzte Aufbewahrung, Nutzlastgröße und Wiederholungen aus dem geprüften Transport übernehmen. Messfehler dürfen Speichern, Erstellung und Unterricht nicht blockieren.

## 4. Wie wir Zeit belastbar erfassen

Vier getrennte Größen anzeigen:

- **Erstellungsdauer:** Serverannahme bis fertiger Entwurf, einschließlich nachvollziehbar erfasster Warteschlange, Modell-, Medien- und Reparaturphasen. Parallele Phasen nicht zu einer falschen Gesamtdauer addieren.
- **Geschätzte aktive Lehrkraftzeit:** Editor ist sichtbar und im Vordergrund; es gab eine tatsächliche Interaktion innerhalb der letzten 60 Sekunden. Reine Aktivitätssignale ohne Inhalte oder Tastatureingaben übertragen. Der bestehende Tracker ist die Ausgangsbasis.
- **KI-Wartezeit im Vordergrund:** separat, nicht als aktive Nacharbeit zählen. Hintergrund und längere Untätigkeit sind keine Arbeitszeit.
- **Verstrichene Zeit bis Speichern/Veröffentlichen:** echte Zeitspanne inklusive Pausen, getrennt von aktiver Zeit. Ein über Nacht offener Test ergibt keine acht Arbeitsstunden.

Mehrere Tabs und Geräte dürfen dieselbe Lehrkraftzeit nicht vervielfachen. Der Kandidat verwendet bereits Tabführung und ein gemeinsames Serverbudget; für den Testbezug sind zusätzlich überlappende Segmente zu prüfen. Überlappende Intervalle derselben Person werden vereinigt. Wenn zwei Tests gleichzeitig offen sind und die Zuordnung nicht sicher ist, bleibt der betroffene Anteil nicht zugeordnet. Keine Verteilung nach Vermutung.

Neuladen, Offlinephasen, Absturz, Uhrsprung und fehlender Sitzungsabschluss erhalten explizite Abdeckungsmerkmale. Lokale Dauern nutzen eine monotone Uhr; Ordnung und Grenzen prüft der Server. Ein offenes oder verlorenes Segment wird nicht bis zum nächsten Login fortgeschrieben. Neue Zeitmessung beginnt erst nach Aktivierung; alte Testdaten bekommen keinen geschätzten Rückbau der Arbeitszeit.

## 5. Der persönliche und der gemeinsame Lernweg

### Persönlich sofort

Nach serverbestätigtem Smiley wird das passende persönliche Profil beim nächsten geeigneten Auftrag berücksichtigt. Beispiele: bevorzugter Schwierigkeitsgrad, verständlichere Formulierungen, zusätzliche Prüfung von Audio oder Antwortalternativen. Die Oberfläche zeigt „gespeichert“, „für nächsten passenden Auftrag vorgemerkt“ und später einen tatsächlichen Einsatznachweis.

Ein negativer Smiley allein bestimmt keine neue fachliche Wahrheit. „Lösung falsch“ löst einen Prüfbedarf aus; nur die verifizierte Korrektur darf als Fachregel übernommen werden. Lehrkräfte können persönliche Hinweise ansehen, zurücknehmen oder zurücksetzen. Eine Änderung der Bewertung erzeugt eine neue Revision und macht veraltete gemeinsame Freigaben ungültig.

### Gemeinsam fachlich geprüft

1. System bündelt ähnliche Hinweise nach Lernziel, Fehlerart, Typ und Generatorversion. Eine häufig bewertende Person erzeugt keine künstliche Mehrheit.
2. Schwere fachliche Fehler kommen schon als Einzelmeldung in die Prüfung. Wiederkehrende Präferenzen werden als Muster vorgeschlagen, nicht automatisch freigegeben.
3. Berechtigte fachliche Prüfung sieht Originalstand, spätere Änderung, Begründung und unabhängige Lösung. Mögliche Entscheidungen: fachlicher Fehler bestätigt, kontextabhängig, persönliche Präferenz, technischer Fehler, nicht belegt, belegte Testmeldung.
4. Aus einem bestätigten Befund entsteht eine begrenzte Regel mit Geltungsbereich, Belegen, Gegenbeispielen und maschinell prüfbarem Erwartungsverhalten. Keine pauschale Fachregel aus einer Einzelpräferenz.
5. Regel wird an zurückgehaltenen Beispielen und bisherigen Regressionen geprüft. Testfälle, aus denen die Regel entstanden ist, werden getrennt vom Wirksamkeitsvergleich ausgewiesen.
6. Fachliche Freigabe und technische Freigabe werden mit Regel-/Bewertungsrevision gespeichert. Bei Uneinigkeit bleibt die Regel zurückgestellt; kritische fachliche Regeln brauchen eine zweite fachliche Prüfung.
7. Eine freigegebene Regel wird nur in passenden neuen Aufträgen verwendet. Jeder Einsatz erhält einen Beleg; Safe-Fallbacks erscheinen ausdrücklich als „ohne Lernhinweis“ oder „Einsatznachweis fehlt“.
8. Wirkung prüfen, gegebenenfalls Regel enger fassen, zurücknehmen oder erneut freigeben. Alte Veröffentlichungen und Prüfungsbewertungen werden nicht rückwirkend verändert.

Nachvollziehbare Kette: **Bewertung → Befund → Regelversion → Freigabe → Erstellungsauftrag → geprüfte Ergebnisversion**. Die Anwendung geprüfter Regeln verbessert Generatoranweisungen, Auswahl und Prüfungen. Das ist kein automatisches Training des zugrunde liegenden KI-Modells.

## 6. Kennzahlen mit ehrlichen Prozentwerten

Jede Anzeige enthält Zeitraum, Zähler/Nenner, Definitionversion, Datenabdeckung und Kontext. Fehlende Werte sind unbekannt, nicht null. Tutorial, synthetische Tests und echte Nutzung werden getrennt.

| Kennzahl | Definition | Wofür sie geeignet ist |
|---|---|---|
| Bewertungsabdeckung | eindeutig bewertete Revisionen / bewertbare erzeugte Revisionen | Zeigt, wie aussagekräftig Smileys sein können |
| Positive Smileyquote | positive / (positive + negative) aktuelle Urteile | Zufriedenheit unter tatsächlich Bewertenden; Warnungswiderspruch separat |
| Unveränderte Übernahme | ursprüngliche Revisionen im finalen Test / erzeugte ursprüngliche Aufgaben | Praktische Akzeptanz, keine Richtigkeitsquote |
| Entfernungs-/Ersetzungsquote | entfernte bzw. ersetzte Ursprungsaufgaben / erzeugte Ursprungsaufgaben | Suchsignal für problematische Typen; Gründe daneben |
| Nacharbeitsquote | wesentlich überarbeitete Ursprungsaufgaben / erzeugte Ursprungsaufgaben | Korrekturaufwand; Darstellungs- und Fachkorrekturen getrennt |
| Fachlich bestandene Erstfassungen | in unabhängiger Stichprobe bestandene Erstfassungen / vollständig geprüfte Erstfassungen | Belastbarere Qualitätsquote innerhalb der ausgewiesenen Stichprobe |
| Fehlerfreiheit des fertigen Tests | Tests ohne kritischen Befund / vollständig geprüfte Tests | Gesamtprüfung von Abdeckung, Dopplungen, Bewertung und Medien |
| Aufwand | Median und Streuung geschätzter Aktivminuten pro Test bzw. pro 10 Aufgaben | Nacharbeit, getrennt nach Umfang/Typen und nur mit Zeitabdeckung |
| Geschlossener Verbesserungsprozess | freigegebene Regeln mit Einsatz- UND Ergebnisprüfung / freigegebene Regeln mit geeignetem Einsatz | Zeigt, ob Erkenntnisse tatsächlich ankommen |

Für die Übernahme zählt jede Ursprungsaufgabe einmal. Bei mehreren Bewertungen zählt das aktuelle Urteil pro berechtigter Person und Revision; die Historie bleibt für Audit erhalten. Zählen von Aufgaben und Zählen von Urteilen dürfen nicht vermischt werden. „Keine Änderung gespeichert“ bedeutet nicht „unverändert übernommen“. Unveröffentlichte oder abgebrochene Tests haben einen eigenen Status.

Die unabhängige Stichprobe umfasst auch unbewertete Aufgaben und verteilt sich über relevante Fächer, Jahrgänge, Typen, Medien und Generatorversionen. Schätzungen über alle Aufgaben benötigen eine nachvollziehbare Stichprobenauswahl und Unsicherheitsangaben. Kleine Gruppen werden nicht als stabile Rangfolge ausgegeben. Ein Mittelwert über verschiedene Fächer darf einen Rückschritt in einem Fach nicht verdecken.

**Beispiel ausschließlich zur Erklärung:** Von 100 erzeugten Aufgaben bekommen 20 einen Smiley, davon 16 positiv. Das sind 80 % positive Bewertungen bei 20 % Bewertungsabdeckung, nicht 80 % nachgewiesen gute Aufgaben insgesamt.

Wir setzen keine unbelegte „99 % gut“-Zusage. Zuerst erfassen wir die Ausgangslage. Als Pilot-Abnahmekriterien schlagen wir vor: keine kritischen Fehler im freigegebenen Prüfbestand, vollständig nachvollziehbare Lernentscheidungen und ein besserer Erstfassungsanteil ohne Rückschritt bei Fachrichtigkeit oder nötiger Lehrkraftarbeit. Konkrete statistische Zielschwelle, Stichprobengröße und Pilotdauer werden anhand der Ausgangsrate vor dem Vergleich festgelegt.

## 7. Bessere Tests für das System

Jeder bestätigte Fehler soll einen gezielten Regressionstest erzeugen. Originale private Inhalte bleiben privat; öffentliche Tests verwenden eigenständige oder ausdrücklich freigegebene, anonymisierte Beispiele.

- **Fachtests:** Lösungen unabhängig berechnen; mehrere gültige Antworten, Toleranzgrenzen, Teilpunkte und unlösbare Aufgaben prüfen.
- **Didaktische Testfälle:** Lernziel, Alter, Sprache, Anspruch, vollständige Angaben und sinnvolle Medien prüfen. Qualitative Kriterien brauchen fachliche Menschenprüfung; ein zweites KI-Urteil allein ist kein Goldstandard.
- **Vollständiger Test:** Themenabdeckung, Schwierigkeitsmischung, Punkte, Bearbeitungsumfang, Dopplungen und gegenseitige Lösungshinweise prüfen.
- **Darstellung:** Schüleransicht auf Handy, Tablet und Desktop; Grafik, Hördateien, Auswahloptionen, Tastatur/Touch sowie private Medienautorisierung.
- **Lernregeln:** Passende Fälle werden verbessert; unpassende Fächer, Jahrgänge, Präferenzen und bereits richtige Lösungen bleiben unbeeinflusst. Freitext darf keine Systemanweisungen einschleusen.
- **Datenqualität:** Doppelte Events, geänderte Aufgabenversion, Konto-/Testwechsel, Offline-Wiederholung, mehrere Geräte, abgebrochene Sitzungen und Widerruf.

Referenzbestand aus Entwicklungsfällen und einen getrennten, versionierten Prüfbestand führen. Änderungen an Prompts, Modellen, Regeln, Rezepten und Bewertungsrubriken lassen dieselben Vergleichsfälle erneut durchlaufen. Wiederholungen und Reparaturversuche mitzählen. Kostenpflichtige Generierungsserien erst mit festem Umfang und Budget starten; zunächst gespeicherte und synthetische Beispiele nutzen.

## 8. Oberfläche und täglicher Verbesserungsprozess

Lehrkräfte behalten den einfachen Ablauf: Smiley, optional kurzer Grund/Kommentar, fertig. Keine Pflichtfragebögen bei jeder Aufgabe. Bei Entfernen/Ersetzen kann ein optionaler kurzer Grund helfen. Der Testeditor zeigt den Status des eigenen Feedbacks und eigene nachvollziehbare Anpassungen.

Die vorhandene Admin-Supportansicht bekommt eine vollständige Testvorschau mit Schülerdarstellung sowie einen kompakten Qualitätsbereich. Vorschauantworten bleiben lokal und werden beim Schließen verworfen; keine Attempts, Abgaben oder Noten. Keine privaten Transkripte, Quellenuploads oder Schülerantworten in dieser Vorschau.

Pro Test sichtbar: erzeugte/übernommene/überarbeitete/entfernte Aufgaben, Smileys samt Abdeckung, geschätzte Aktivzeit und KI-Wartezeit, geprüfte Befunde, Lernfreigaben und Einsätze. Zeitachse verbindet bestätigte Vorgänge. „Aufgabe entfernt – Grund nicht angegeben“ ist eine zulässige Aussage.

Arbeitsrhythmus im Pilot: kritische Befunde zeitnah prüfen; wöchentlich Muster und offene Freigaben sichten; nach einem vereinbarten Beobachtungsfenster Wirkung auswerten. Für fachliche Freigaben muss eine konkret benannte verantwortliche Person zuständig sein. Ein Dashboard ohne diese Zuständigkeit schließt den Kreislauf nicht.

## 9. Zugang, Zweck und Aufbewahrung vor Aktivierung festlegen

Zweck: Aufgabenqualität verbessern, Fehler beheben und unnötige Nacharbeit reduzieren. Lehrkräfte sehen ihre eigenen Daten; fachliche Prüfer nur erlaubte Fälle; Produktanalysen verwenden beschränkte Aggregate. Zweckgebundene Adminzugriffe werden protokolliert. Neue persönliche Analytics bleiben bis zu gesonderter Aktivierungsentscheidung aus. Das bestehende freiwillige Opt-in des Kandidaten nicht stillschweigend entfernen.

**Konkreter Vorschlag zur Freigabe, noch keine geltende Einstellung:** detaillierte Arbeitszeit-/Lifecycle-Ereignisse 30 Tage; pseudonyme Zuordnung höchstens 90 Tage; geprüfte ausreichend zusammengefasste Monatsaggregate bis 13 Monate. Operative Aufgaben, Feedbackbilder und laufende Supportfälle behalten ihre gesonderten bestehenden Regeln. Persönliche Lernprofile sind bis Widerruf/Ersetzung zweckgebunden; die genaue Frist und Abwicklung bei Kontolöschung vor Aktivierung festlegen. Gemeinsame fachliche Regeln nur ohne identifizierbare Lehrkraft-/Schülerbezüge langfristig halten; notwendige persönliche Prüferprotokolle gesondert befristen.

Empfänger, Verantwortliche, Speicherorte, Löschpfade und verständliche Lehrkraftinformation müssen für die tatsächliche Umgebung dokumentiert und bestätigt werden. Löschung betrifft auch Projektionen/Exporte; Firestore-Cleanup beweist keine PostHog-Löschung. Kleine Aggregate sind nicht automatisch anonym. Keine Sitzungsaufzeichnung, Screenshots, Diktate, Tastaturinhalte oder individuellen Schülerprofile für diesen Zweck. Feedbackbilder bleiben ausdrücklich eingesandte Supportdaten, keine Hintergrundüberwachung.

Vor Productionaktivierung liegt ein konkretes Paket vor: Zweck-/Empfängermatrix, betroffene Felder, Fristen, Opt-in-/Informationstext, Rollen-/Löschtests, getrenntes Schulziel, exakter Release und Rückschalter. Bestehende Runtimekonfigurationssperren nicht umgehen und keine minimalen Umgebungsdateien über vorhandene Konfiguration schreiben.

## 10. Umsetzung in überprüfbaren Etappen

Die unten genannten neuen Dateinamen sind geplante Module. Bestehende Pfade sind vor Umsetzung gegen das aktuelle Integrationsziel zu prüfen. PR263 ist Wiederverwendungsquelle, kein pauschal zu übernehmender alter Gesamtbranch. Fremde Editor-/Wilma-/Tutorialänderungen erhalten; Überschneidungen an `app.js` vor Schreibarbeit abstimmen.

### Etappe A: Bestehende Aufgaben vollständig prüfen können

**Dateien:** `app.js`, `secure-student.js`, `secure-assessment-client.js` lesen; gemeinsame Darstellung über bestehende Schnittstelle verwenden. Neue Abnahme: `admin-test-preview.test.mjs`.

- [ ] Aktuellen Support-Lesevertrag, Schülerdarstellung und private Medienautorisierung abgleichen; engste gemeinsame Render-Schnittstelle festlegen.
- [ ] Negativtests für Nicht-Admin/Fremdschule, Abgabe-/Attempt-Schreibfreiheit und verworfene Vorschauantworten zuerst ergänzen.
- [ ] Bestehende Supportansicht um vollständige Vorschau, sichtbares Vorschaubanner und Medienwiedergabe ergänzen.
- [ ] Synthetischen Test mit allen unterstützten Typen, langen Inhalten, Grafik, Audio und Download in getrennter Testumgebung prüfen; keine Live-Daten kopieren.
- [ ] Quellenstand, passende CI, unabhängigen Review und Vorschau-Link sichern. Kein Productiondeploy aus diesem Plan.

**Ergebnis:** Fachprüfer können den konkreten Test tatsächlich sehen und prüfen. Neue Analytics sind dafür keine Voraussetzung.

### Etappe B: Versionen und Ereignisse zuverlässig verbinden

**Dateien:** bestehende `question-feedback-client.mjs`, `functions/lib/question-feedback.js`, `functions/lib/feedback-learning.js` am qualifizierten Feedbackstand; Analytics-Verträge aus PR263 in `functions/lib/teacher-analytics-core.js` und `functions/lib/teacher-server-events.js`. Neu: `functions/lib/question-quality-events.js`, `functions/test/question-quality-events.test.js`.

**Schnittstelle:** `projectQuestionQualityEvent(source, trustedContext)` liefert ein bereinigtes versioniertes Ereignis oder einen ausdrücklichen Ablehnungsgrund. Keine Inhalte oder unbestätigten Eigentümerangaben übernehmen.

- [ ] Tests für gleiche Event-ID, Payloadkonflikt, Revisionstausch, Klon, Fremdeigentümer und verbotene Inhaltsfelder zuerst schreiben und scheitern sehen.
- [ ] Stabile Revisionen sowie Save-/Remove-/Replace-Verkettung ergänzen; serverbestätigte Speicherung als Quelle verwenden.
- [ ] Bestandsimport nur vorhandener Belege mit `historical` und Feldabdeckung; keine aktiven Zeiten zurückrechnen.
- [ ] `node --test functions/test/question-quality-events.test.js` und betroffene bestehende Feedbacktests ausführen, Commit und Übergabe sichern.

**Ergebnis:** Ein Smiley ist exakt einem privaten Aufgabenstand zugeordnet; Änderungen und Nachfolger sind belegbar.

### Etappe C: Arbeitszeit und Erstellungsaufwand messen

**Dateien aus PR263:** `teacher-active-time.mjs`, `teacher-analytics-client.mjs`, `assessment-telemetry-transport.mjs`, zugehörige Tests und Serverbudget in `functions/lib/teacher-analytics-core.js`; gezielte Editoranbindung in `app.js`.

**Schnittstelle:** `summarizeTestWork(segments)` liefert `activeMs`, `foregroundAiWaitMs`, `unattributedMs`, `coverage` sowie beobachteten Anfang/Ende, jeweils je Test und Definitionsversion. Als kleines neues Modul `test-work-summary.mjs` mit `test-work-summary.test.mjs` ergänzen.

- [ ] Zwei überlappende Tabs/Geräte, Idle nach exakt 60 Sekunden, Hintergrund, KI-Warten, Offline-Wiederholung, Reload und unvollständiges Ende testen.
- [ ] Bestehenden Tracker gezielt verbinden; Testwechsel begrenzt Segment, keine Rohinteraktionen übertragen. Serverbudget und Intervallvereinigung zusammen prüfen.
- [ ] Erstellungs-/Verbrauchsdaten nur aus vorhandenen bestätigten Aufträgen projizieren; fehlende Phasen/Preise als unbekannt halten. Wilma-Korrekturbudget separat lassen.
- [ ] `node --test test-work-summary.test.mjs ai-teacher-active-time.test.js teacher-analytics-client.test.mjs assessment-telemetry-transport.test.mjs` sowie betroffene Functions-Tests ausführen; synthetische Zeitlinie manuell gegenrechnen.

**Ergebnis:** Ein Test zeigt nachvollziehbar geschätzte Nacharbeit, Wartezeit und Messlücken. Datenerhebung bleibt außerhalb der isolierten Abnahme deaktiviert.

### Etappe D: Qualitätsübersicht und tatsächliche Rückmeldungen einordnen

**Neu:** `question-quality-metrics.mjs`, `question-quality-metrics.test.mjs`; bestehende Adminansicht und autorisierten Feedback-Leseweg erweitern.

**Schnittstelle:** `computeQuestionQualityMetrics(events, definition)` liefert jede Kennzahl als `{numerator, denominator, value, coverage, definitionVersion}`; `value: null` bei fehlendem Nenner.

- [ ] Beispiel 16/20 bei 100 erzeugten Aufgaben, doppelte Urteile, geändertes Urteil, fehlendes Ende und Mischverkehr als exakte Testfälle festschreiben.
- [ ] Kennzahlen aus Abschnitt 6 und die Testzeitachse anzeigen; Namen nicht in allgemeine Auswertungen projizieren.
- [ ] Nach wieder verfügbarem autorisiertem Datenzugang die 13 alten Bewertungen einzeln auf Revision, Befund, persönliche Berücksichtigung und gemeinsame Freigabe prüfen. Fehlende Altbelege markieren, nicht überschreiben.
- [ ] Technische Rückmeldung getrennt klassifizieren: offen/reproduziert, Fix belegt aber Retest offen, nachweislich behoben, belegte Testmeldung. „Erledigt“ ohne Nachweis nicht als behoben zählen.
- [ ] `node --test question-quality-metrics.test.mjs` und Admin-Rollen-/Browserprüfungen ausführen; anonymisierte Nachweisübersicht sichern.

**Ergebnis:** Qualität, Abdeckung und offene Prüfaufträge sind sichtbar; die bestehende private Auditliste wird nachvollziehbar fortgeschrieben.

### Etappe E: Gemeinsamen Lernkreislauf schließen

**Dateien:** vorhandenen Freigabe-/Memory-/Einsatzpfad in `functions/lib/feedback-learning.js` erweitern, keine zweite Memory bauen. Neu: `functions/lib/quality-rule-evaluation.js`, zugehörige Tests und `docs/learning/QUALITY_REVIEW_RUBRIC.md`; vorhandene Admin-Prüfoberfläche ergänzen.

**Schnittstelle:** `evaluateRuleCandidate(candidate, versionedCases)` liefert je Fall erwartetes/beobachtetes Ergebnis und Freigabeblocker. Die Entscheidung wird separat von der berechtigten Fachprüfung getroffen.

- [ ] Widerruf, geänderte Bewertungsrevision, falscher Geltungsbereich, widersprüchliche Regeln und fehlender Einsatznachweis als Negativfälle ergänzen.
- [ ] Fachliche Rubrik und Regelzustände aus Abschnitt 5 umsetzen; Prüfung/Freigabe/Einsatz/Ergebnisprüfung getrennt anzeigen.
- [ ] Einen realen geeigneten Befund fachlich prüfen; beim nächsten normalen, passenden Erstellungsauftrag den Einsatzbeleg und die neue Ergebnisversion prüfen. Keine zusätzliche bezahlte Generierung allein für einen Statusnachweis starten.
- [ ] Regressionen und unabhängige Ergebnisprüfung dokumentieren. Bei Rückschritt Regel deaktivieren; vorhandene Prüfungen nicht umbewerten.

**Ergebnis:** Mindestens eine tatsächlich durchlaufene Verbesserung mit vollständiger Belegkette, nicht nur ein befüllter Lernspeicher.

### Etappe F: Begrenzter Pilot und Wirkung vergleichen

- [ ] Zweck-/Empfänger-/Fristenpaket aus Abschnitt 9 vorlegen und konkrete Aktivierungsfreigabe einholen; technische Reviews/selektive Deploys getrennt nachweisen.
- [ ] Vorher den Vergleich festlegen: passendes Fach/Jahrgang/Typ, Ausgangsrate, Mindeststichprobe, Hauptmetrik, Nacharbeits- und Fehlerrisiken sowie Auswertungsende.
- [ ] Kleine, freiwillige Lehrkräftegruppe; unterschiedliche Ausgangsniveaus und Typen dokumentieren. Möglichst vergleichbare, getrennt geprüfte Aufgabensätze verwenden; reine Vorher-nachher-Korrelation nicht als sichere Ursache darstellen.
- [ ] Nach dem festgelegten Fenster Wirkung auf Erstfassungsqualität, negative Gründe, Ersetzungen und aktive Nacharbeit auswerten. Alle Erstellungsversuche und abgebrochene Tests berücksichtigen; keine Erfolgsfälle auswählen.
- [ ] Nur belegte Verbesserungen ausweiten; unklare Ergebnisse länger prüfen, schädliche Regeln zurückrollen. Fachliche Freigabe bleibt auch bei guter Quote nötig.

**Ergebnis:** Messbarer Nutzen innerhalb eines benannten Geltungsbereichs. Kein Versprechen perfekter Tests oder einer Qualität über alle Fächer aus einer kleinen Stichprobe.

## 11. Abschlusskriterien und Review-Fokus

Der Prozess ist erst vollständig nachgewiesen, wenn Versionierung, verlässliche Sammlung, ehrliche Kennzahlen, aktive fachliche Zuständigkeit, mindestens ein realer freigegebener Einsatz mit Ergebnisprüfung und sichere Aktivierungs-/Löschpfade belegt sind. Hosting, Functions/Regeln, CI, fachlicher Test und tatsächliche Nutzung erhalten jeweils eigene Nachweise.

Besonders prüfen: Bewertung während paralleler Überarbeitung (B/E), derselbe Test auf zwei Geräten (C), nicht veröffentlichte/abgebrochene Tests (D), fehlgeschlagener Lernnachweis bei erfolgreicher Erstellung (E), kleine oder verzerrte Fachstichproben (D/F). Diese fünf Fälle dürfen die Qualitätsquote nicht still verbessern.

**Nächster ausführbarer Schritt:** isolierte vollständige Adminvorschau aus Etappe A mit synthetischen Aufgaben bauen und prüfen; parallel benötigte Freigabeangaben vorbereiten. Danach den bestehenden Analytics-Kandidaten gezielt für B/C übernehmen. Dieser Plan hat weder Code integriert noch zusätzliche persönliche Datenerfassung aktiviert.
