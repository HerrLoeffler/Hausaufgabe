# Dreisatz im Kreativlabor · erster KI-Lernfundus

Task GC-EXTENDED-QUESTION-TYPES-01, 18.11.2026. Abgeschlossener technischer Pilot im isolierten Testkanal.

## Was bedienbar ist

[Kreativlabor öffnen](https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/). Im Bereich **Mathematik · Dreisatz mit KI erproben** lässt sich ein freier Wunsch eingeben. Zwei getrennte Modellaufrufe erzeugen und prüfen den Auftrag, ein unabhängiges Programm berechnet die Zahlen. **60 KI-Erprobungen öffnen** führt zur gespeicherten Referenzserie. Sprungliste, Probeauswertung und Smileys verwenden den vorhandenen Ablauf. **Auswahlgrund und Lösung zeigen** öffnet bewusst einen Lehrkraftbericht, ohne Roh-JSON.

Die Serie besteht aus 20 direkten, 20 umgekehrten und zehn Prozentfällen sowie zehn Formatgegenfällen. Bei Grundgebühr, Mengenrabatt, quadratischer Beziehung, zwei aufeinanderfolgenden Rabatten, Sprach-/Quellenaufträgen und fehlenden/widersprüchlichen Angaben soll der einfache Dreisatz nicht erzwungen werden. In diesen Gegenfällen entsteht eine Auswahlaufgabe zur passenden Vorgehensweise. Andere neue Renderer erzeugt dieser Einstieg noch nicht.

## Wo genau der Fundus gespeichert wird

Bestehende Cloud Firestore Standard-Datenbank **(default)** im Firebase-Testprojekt **gradecrew-staging-2026**, Standort **eur3**. Instanz und Edition wurden vor dem Aufbau tatsächlich geprüft.

| Datenpfad | Inhalt und spätere Wiederverwendung |
| --- | --- |
| taskLearningRecipes/dreisatz-20261118-v1 | Versioniertes Rezept mit Voraussetzungen, Gegenfällen, Hilfestufen und Bewertungsvertrag |
| taskLearningRuns/dreisatz60-20261118-v1 | Manifestfingerabdruck, Eigentümer, Serienumfang, Budget und Kostenreservierungen |
| …/cases/Fall-ID | Wunsch, erwartete Familie der Referenzprüfung, KI-Entwurf, Aufgabe, aktuelle Prüfungen und Status |
| …/cases/Fall-ID/attempts/a1…a3 | Frühere Fassungen bleiben nachvollziehbar |
| …/cases/Fall-ID/checks/Schritt-ID | Versionierte technische und fachliche Prüfungen des neuen Prüfers |
| …/cases/Fall-ID/rechecks/Anfrage-ID | Begründete Neuprüfung nach korrigierter Prüferübergabe |
| …/providerCalls/Schritt-ID | Tatsächlicher Modellaufruf, genauer Prompt, Antwort, Modell-/Provider-ID, Tokens und Kostenbeleg |
| …/cases/Fall-ID/teacherReviews/Ereignis-ID | An die genaue Aufgabenfassung gebundene Lehrkrafturteile |
| taskLearningExamples/Beispiel-ID | Wiederverwendbarer Kandidat mit Systemurteil sowie separat erfasstem menschlichem Feedback |
| taskLearningQuotas/Quoten-ID | Begrenzung neuer eigener Wünsche pro Testkonto |

Bei eigenen Wünschen erhalten Serie und Beispiele die eigene Eigentümerbindung. Der feste synthetische 60er-Stapel ist nur für bereits freigegebene Testlehrkräfte sichtbar. Neue kostenpflichtige Schritte und Reparaturen bleiben seinem Eigentümer vorbehalten. Allgemeine Collections sind serverseitig, der Browser liest sie über den vorhandenen erlaubten Callable. Es wurden keine neuen direkten Clientrechte eingerichtet.

Die Struktur ist allgemein benannt. Weitere Familien können eigene Rezepte, unabhängige Fachprüfer, Aufgabenversionen und Beispiele unter denselben Konzepten hinzufügen. Der qualifizierte pädagogische Laufzeitpool und normale Tests erhalten daraus noch keinen automatischen Import. Geeignete bestätigte Regeln können später kontrolliert übernommen werden, statt Chatverläufe zu kopieren.

## Wie Rückmeldungen künftige Aufgaben beeinflussen

Menschliche Urteile bleiben vom automatischen Prüfstatus getrennt. Jeder Kommentar gehört zum tatsächlichen Reviewer. Bei einem neuen Wunsch ruft der Generator bis zu sechs zu seinem Rezept passenden eigenen Lehrkraftbeispiele ab. Negative Beispiele werden mitgeführt. Die Auswahl wird vor dem Suchlimit auf diesen Reviewer begrenzt, damit viele ungeprüfte Kandidaten bestätigte Hinweise nicht verdrängen.

Das Rezept enthält fachliche Eignungs- und Ausschlussregeln. Ein eigener Blindlösungsversuch beurteilt Auftrag, Angaben und Darstellungswahl. Bei falscher Wahl, widersprüchlichen Fakten, verratener Antwort oder abweichender Berechnung bleibt der Entwurf gesperrt. Wiederholte Modellaufrufe verändern keine Modellgewichte. Der Lernfortschritt liegt im belegten Fundus und in versionierten Änderungen an Regeln, Darstellung und Prüfung.

## Tatsächlich gefundene und behobene Fehler

Der unabhängige Code-Review fand Statusrennen bei parallelen Anfragen, ungenügende Trennung von gemeinsamen Leserechten und kostenpflichtigen Aktionen, vermischbare Feedbackzuordnung, eine leere Liste sowie falschen Abzug bei gleichwertigen freien Operationen. Diese Fehler wurden vor dem ersten KI-Start korrigiert und mit Regressionen geprüft.

Die echte Serie zeigte danach einen Fehler in der Prüfprojektion. Die rohe Tabellenbeschreibung bildete freie Pfeilfelder unvollständig ab. Dadurch vermisste der Prüfer Eingabefelder, die im Renderer korrekt vorhanden waren. Zusätzlich war das numerische Antwortformat nicht ausdrücklich ohne Einheit verlangt. Nach dem gezielten Anhalten neuer lokaler Starts wurde die Projektion an die tatsächlichen drei Datenzeilen und vier Pfeile angepasst. Die sichtbaren Aufgaben blieben erhalten. Alte Versuche und falsche Ablehnungen bleiben dokumentiert. Eine explizite Neuprüfung derselben Fassung nutzt einen neuen Prüfschlüssel und erzeugt den Inhalt nicht erneut.

## Verifikation und Grenzen

Vor korrigierter Bereitstellung 51 lokale Tests grün, inklusive alter Stapel, genauer Projektion, unabhängiger Arithmetik, Teilpunkten, Budget, Wiederaufnahme, privater Projektion und Feedbackzuordnung. Echte Erstellung, Serverauswertung, Dateiabgleich und Browserbeobachtung erhalten eigene Belege nach Abschluss.

Menschliche Unterrichtsfreigabe und Lernwirksamkeit sind offen. Die feste 60er-Serie ist eine Kalibrierung und kein unbekannter Abschlussbestand. Echte freie Wünsche werden zusätzlich über den freien Einstieg überprüft. Technische Volltreffer aus vorgegebenen Wunschdaten belegen keine universelle Formatauswahl. Die späteren 240/1.200er-Serien des Plans sind nicht gestartet.

## Konkrete Erweiterung aus dem freien Wunsch

Der erste zusätzliche Wunsch verlangte vier freie Pfeile und ausdrücklich keine Hilfen. Der Prüfer erkannte korrekt, dass der fest vorgegebene Zwischenweg über eins trotzdem eine Hilfe war. Dieser fehlgeschlagene Versuch wurde erhalten. Der Builder bekam deshalb eine zweite Bewertungsvariante für einen selbst gewählten positiven Zwischenwert. Sie prüft die exakte Beziehung an dieser Zwischenzeile und die zugehörigen Pfeile; ein falscher Einzelwert entwertet keine unabhängigen richtigen Felder. Freie Wege sind aktuell auf endliche Dezimalzahlen beschränkt. Im Lehrkraftbericht steht ausdrücklich, dass der angezeigte Referenzweg nur ein möglicher Weg ist.

Der ursprünglich gespeicherte Wunsch wird weitergeführt, statt einen bequemeren Wunsch als Ersatz zu verwenden. Die freie Oberfläche kann bis zu zwei konkrete Nachbesserungen selbst fortsetzen. Eine bereits serverseitig angenommene Reparatur wird nach einer unterbrochenen Verbindung nicht doppelt ausgelöst.

## Bewusste Pilotentscheidungen

Die erste Etappe umfasst 60 Fälle, die größeren Serien bleiben weitere Etappen. Der vorhandene Fachbranch und Testkanal werden fortgeführt. Je Fall gibt es zwei gespeicherte Providerphasen statt einer neuen Queue. Ein abgebrochener lokaler Aufrufer lässt sich wiederaufnehmen, automatische unbeaufsichtigte Großserien sind damit noch nicht qualifiziert.

Ein fester Zwischenweg gehört ausdrücklich in den Auftrag. Die neue freie Variante erlaubt eigene Zwischenwerte und erfordert endliche Dezimalzahlen. Rundungs- oder Bruchantworten brauchen später einen eigenen Vertrag. Zehn Gegenfälle sind Eignungsproben, keine angeblich fertigen nichtnumerischen Fachaufgaben. Nach belegten technischen Prüferkorrekturen sind zwei zusätzliche, protokollierte Prüfungen derselben Fassung möglich; das ist keine beliebig oft wiederholte Abstimmung bis zur Zustimmung.

Für einen späteren allgemeinen Produktivfundus bleiben Auswahl gegen unbekannte Wünsche, qualifizierte Rezepte weiterer Fächer, Skalierung und das Aufbewahrungs-/Löschkonzept eigene Abnahmen. Die neuen Daten dieser Serie sind fiktiv. Menschliche Lehrerurteile wurden durch die automatisierten Browsertests nicht vorgetäuscht.

## Abschließende Messwerte

60 von 60 Referenzfällen bereit, davon 50 interaktive Dreisatzaufgaben und zehn Eignungsproben. Es gab 79 tatsächliche Erzeugungen und 86 unabhängige Modellprüfungen. 19 Erzeugungen waren Nachbesserungen. Zehn zusätzliche Prüfungen fanden nach dokumentierten Prüferkorrekturen statt. Drei Erzeugungen wurden bereits vor einem Modellprüfaufruf technisch gesperrt. Ein öffentlicher Lösungshinweis wurde redaktionell entfernt. Deshalb ist das Ergebnis ein gemeinsam verbesserter Pilot und keine Quote autonomer Erstversuchserfolge.

48 der 60 Fälle benötigten weder Neuerzeugung noch Neuprüfung. Diese Zahl entstand während mehrerer korrigierter Prüfversionen und ist keine belastbare Erfolgsquote einer einzelnen unveränderten Systemversion. 142.181 Inputtokens und 27.757 Outputtokens für den 60er-Lauf, rechnerisch 0,284971 USD. [Serienauswertung](audit.json)

Zwei zusätzliche echte freie Wünsche wurden durch die normale Testoberfläche erstellt und geprüft. Der ursprüngliche Pumpenwunsch wurde nach der Erweiterung in Versuch zwei angenommen. Ein selbst gewählter Zwischenwert von zwei mit passenden freien Pfeilen erhielt tatsächlich 3,5/3,5 Punkte. Der Lieferwunsch mit Grundpreis wurde im ersten Versuch als andere Darstellung eingeordnet, die Eignungsprobe erhielt 0,5/0,5 Punkte. [Pumpen](free-pumps.json), [Lieferpreis](free-delivery.json)

Insgesamt 171 aufgezeichnete Provideraufrufe für Serie und freie Wünsche. Tatsächlich verwendete Modelle GPT-6 Luna und GPT-6.2 Sol, getrennte Kontexte bei demselben Anbieter OpenAI. Das ist kein Nachweis verschiedener Anbieter. Rechnerische Modellkosten insgesamt 0,296043 USD nach dem gespeicherten Tokenpreissnapshot, keine offenen Reservierungen. Cloudbetrieb, Steuern und eine tatsächliche Anbieterrechnung sind darin nicht enthalten. [Verbrauchsbelege](usage.json)

Auf der abschließend bereitgestellten Quelle 667047e bestanden 54 lokale Tests. Alle 60 Referenzkarten wurden am Server mit vollen, leeren und teilweise falschen Antworten geprüft, 180 Auswertungsaufrufe, 150 mögliche Punkte. Zusätzlich wurden alle 60 Karten in der tatsächlichen Oberfläche ausgefüllt und voll ausgewertet. Desktop 1280 px, Tablet 820 px und Handy 360 px ohne Seitenüberlauf, Eingabefelder erreichbar, Navigation und Wiederladen erhalten die Position. Der erste Wiederholungslauf traf eine Ladezeitüberschreitung; der gezielte zweite Lauf wartete auf DOM und Anmeldung und bestand vollständig. Das ist Browserbreitenprüfung und kein physischer Touchgerätetest. [Serverprüfung](server-verification.json), [Browserprüfung](browser-verification.json)

Alle 13 Hostingdateien stimmen bytegenau mit dem geprüften Paket überein. Functions-Inventar vor und nach dem Pilot jeweils 98 Einträge, davon 97 unverändert. Ausschließlich die vorhandene remyMehrfeld30Review wurde durch diesen Auftrag aktualisiert. Das bestehende Testhosting ist bis zum 18. Dezember 2026 bereitgestellt. Die Datenbankablage ist davon unabhängig. [Bereitstellung](deployment.json)

Das Öffnen des App-Browsers im Chat erreichte hier nur den Kopfbereich. Die vollständigen angemeldeten Bedien- und KI-Prüfungen erfolgten in einem separaten Chromium-Testbrowser gegen dieselbe tatsächliche Testseite.

Nächster Schritt ist Martins Sichtung einer gemischten Auswahl mit Smileys und konkreten Gründen. Erst danach Prüfer gegen bestätigte Lehrkrafturteile kalibrieren und die nächste Serie beschließen. Unbekannte Wünsche und neue Fachfamilien benötigen weiter ihre eigenen Nachweise.


## Präzisierung nach Martins Rückmeldung

Die drei KI-Eingänge wurden nach ihrem tatsächlichen Umfang benannt. Der neue Mathematik-Einstieg prüft Dreisatz. Der weitere Pilot erzeugt Quellen-/Labyrinth-/Musikaufgaben. Der frühere Versuch startet Tabellen-/Pfeilaufgaben. Die Änderung betrifft ausschließlich die HTML-Beschriftungen. Alle 13 Hostingdateien verifiziert, nur index.html verändert, sichtbare Eingänge auf 1280/820/360 geprüft. Keine neuen Provideraufträge. [Nachweis](entry-clarity.json)

Das nächste Entwicklungsziel ist ein gemeinsamer Baustein aus Feldern und Pfeilen mit variabler Anordnung und fachlich definierten Beziehungen. Dreisatz ist dessen mathematische Spezialanordnung. Der Zielvorschlag verwendet bestehende Ketten-, Verzweigungs- und Zuordnungsverträge und schlägt acht gemischte freie Wünsche als nächsten Nachweis vor. Diese gemeinsame KI-Erzeugung ist noch offen. [Zielstruktur](../../superpowers/plans/2026-11-18-fields-arrows-direction.md)
