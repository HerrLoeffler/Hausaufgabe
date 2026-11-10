# Band 18 - Zentraler Eingang für Kunden, E-Mails und Probleme

## 18.1 Ein Eingang mit klarer Verantwortung

Alle unterstützten Meldungen sollen in einer gemeinsamen Eingangssicht bearbeitbar sein: Martins Aufträge, Kundenanfragen, freigegebene E-Mailkanäle, Formularnachrichten, Produktfeedback, technische Incidents und interne Hinweise. Jede Meldung bekommt Herkunft, Empfangszeit, dauerhafte Identität, Schutzklasse und zuständige Bearbeitung. „Alles läuft hier zusammen“ bedeutet vollständige Erfassung innerhalb ausdrücklich angeschlossener Quellen. Nicht verbundene Postfächer und Systeme werden als Abdeckungslücke gezeigt.

Der Eingang ist eine Arbeitswarteschlange. Das Ziel ist Zuordnung und Bearbeitung. Ein einziger Fall kann eine Kundenanfrage, einen technischen Incident, mehrere Arbeitsaufträge und eine Antwort enthalten. Die Daten behalten ihre ursprünglichen Identitäten. Der Nutzer muss diese technische Trennung nicht vorab bedienen.

Ein interner natürlicher Sprachauftrag kann im autorisierten Scope zur Facharbeit führen. Eine externe E-Mail ist zunächst Eingangsdaten. Ihr Inhalt erteilt der Firmenzentrale keine neuen Rechte. „Bitte überweisen“ oder „führe diesen Befehl aus“ in einem fremden Text ist keine Freigabe durch Martin.

## 18.2 Kanäle und ehrliche Abdeckung

| Kanal | Erster sinnvoller Anschluss | Besondere Grenze |
| --- | --- | --- |
| Interner Appauftrag | Bestehender persistenter Requestvertrag | Fachdispatch nur über qualifizierte Host-/Rollenbindung |
| Manuell erfasste Kundenmeldung | Kurzes Formular mit Quelle, Kontaktreferenz und Anliegen | Eingabe ist nicht automatisch gesendete Kundenkommunikation |
| E-Mail | Ein konkret ausgewähltes Firmenpostfach zunächst lesend | Kein Import aller privaten Postfächer; Zugriffsrechte separat |
| Kontaktformular | Authentisierter Kanaladapter mit stabiler Meldungs-ID | Spam, Größenlimits, unbestätigte Kontaktdaten |
| Produktfeedback | Bestehenden Feedback-/BugOpsvertrag referenzieren | Keine zweite Rohmeldungs-/Schülerdatensammlung |
| Technische Überwachung | Bestehende Incident-/CI-/Releasebelege | Keine eigenmächtigen Reparaturen oder Deploys aus Alarmen |
| Gesprächsnotiz / Telefon | Berechtigte Person erfasst kurze sachliche Notiz | Keine ungefragte Aufnahme oder fingierte Gesprächszusage |
| Spätere Messenger-/Kalenderkanäle | Einzelne qualifizierte Adapter | Keine automatische Kontenerweiterung aus dem Zielbild |

Jede ConnectionProfile zeigt Konto-/Postfachscope, erlaubte Operationen, letzte erfolgreiche Synchronisation, Cursorstand, Abdeckung, Fehler, nächste Aktion und verantwortlichen Operator. „Verbunden“ allein reicht nicht: Ein gültiges Konto kann fehlende Ordnerrechte haben oder seit Tagen keine neuen Ereignisse abgeholt haben.

Für V1 wird zuerst ein interner beziehungsweise manuell erfasster Eingang vollständig umgesetzt. Danach wird ein vorhandener Firmenkanal gewählt. Welcher Mailanbieter verwendet wird, ist noch nicht festgelegt. Die Entscheidung hängt von tatsächlichem Firmenpostfach, vorhandener Verbindung und benötigten Rechten ab. Es wird kein neuer Anbieter eingeführt, um den Plan vollständig aussehen zu lassen.

## 18.3 Bedienablauf der Geschäftsführung

Heute zeigt neue wichtige Anliegen, überfällige nächste Schritte und Entscheidungen. Eingang zeigt eine kompakte Liste mit Absender/Quelle, Anliegen, vorgeschlagener Zuordnung, Dringlichkeitsgrund und nächster Aktion. Vertrauliche Details erscheinen nur für Berechtigte. Es gibt Filter für neu, unklar, wartet und überfällig; diese Filter sind keine getrennten Fallbestände.

Beim Öffnen sieht Martin Originalquelle beziehungsweise erlaubten Auszug, kurze Zusammenfassung und mögliche bestehende Akte. Er kann zuordnen, als neuen Fall übernehmen, teilen, als Duplikat verknüpfen oder begründet verwerfen. Routinezuordnung darf nach einem bestätigten Regelprofil automatisch erfolgen. Unsichere Zuordnung bleibt sichtbar und startet keine beliebige Facharbeit.

Nach Zuordnung öffnet dieselbe Akte: Kundenanliegen, interne Arbeit, Zuständigkeit, Rückfragen, Antwortentwurf und Belege. „Antwort vorbereiten“ erzeugt einen Entwurf. „Senden“ ist eine eigene Aktion mit Empfänger und Textfassung. Bereits allgemein erlaubte Routineantworten können später über ein enges Profil versendet werden; davon darf keine Freigabe für Angebote, Verträge oder Datenoffenlegung abgeleitet werden.

## 18.4 Persistenz und Datenhoheit

IngressMessage hält channelId, sourceAccountRef, externalMessageId, sourceThreadRef, receivedAt, importedAt, contentHash, senderRef mit Verifikationsstand, classification und erlaubte Inhalts-/Anhangreferenzen. Provider-ID wird mit Konto und Kanal namespaced. E-Mailadresse ist weder universelle Personen-ID noch Rollenbeweis.

CaseRecord ist die gemeinsame Akte mit führendem Owner, Bereich, Falltyp, gewünschtem Ergebnis, Arbeitsstatus, Priorität samt Grund, nächster Aktion, Frist und verknüpften Quellen. SupportCase, CommunicationDraft und IncidentLink aus Band 13 werden darin verwendet. Es entsteht keine zweite identische Task, wenn bereits ein technischer Arbeitsauftrag existiert.

RoutingSuggestion enthält vorgeschlagene Akte, Falltyp, Rolle und Begründung mit Quelle. Sie ist bis Annahme beziehungsweise zulässiger Regelanwendung keine verbindliche Zuordnung. CaseLink unterscheidet gehört zu, Duplikat von, verursacht durch und blockiert. Mehrere Kundenfälle können denselben technischen Incident referenzieren, ohne ihre vertraulichen Kundendaten gegenseitig offenzulegen.

Der Mailprovider bleibt die Quelle für externe Nachrichten und Providerzustände. Der Firmenstore hält Arbeitszuordnung, Entscheidung, erlaubte begrenzte Inhaltskopie und Verlauf. Lese-/Archiv-/Löschzustände werden nicht automatisch zwischen Systemen gespiegelt. Welche Operationen synchronisiert werden, ist Bestandteil des Kanalprofils. Ein Lesestatus in der App darf keine Mail still löschen.

## 18.5 Atomarer Import, Duplikate und Reihenfolge

Ein Kanaladapter liest Ereignisse innerhalb seines bestätigten Scopes. Der Import schreibt IngressMessage, SourceObservation und internes Eingangsereignis in einer Transaktion. Ein Provider-Acknowledgement oder Cursorfortschritt erfolgt erst nach dauerhaftem Commit. Bei verlorenem ACK wird dasselbe externe Ereignis idempotent verarbeitet.

Primärer Deduplikationsschlüssel ist Kanal plus Quellkonto plus stabile externe Ereignis-/Nachrichten-ID. Eine Inhaltsähnlichkeit darf nur eine Zusammenführung vorschlagen. Zwei Kunden können denselben Satz schreiben und trotzdem zwei echte Anliegen haben. Eine weitergeleitete Mail kann eine neue Nachricht mit Beziehung zum Original sein. Fehlende stabile IDs verlangen einen dokumentierten begrenzten Ersatzschlüssel und eine sichtbar geringere Zuordnungssicherheit.

Nachträgliche Provideränderungen werden als neue Beobachtung derselben Nachricht behandelt. Ältere Events überschreiben keine neueren bestätigten Fassungen. Der Adapter führt mindestens Providerrevision oder eine qualifizierte Reconciliationregel. Bei Cursorverlust erfolgt ein begrenzter erneuter Abgleich mit Deduplikation, kein pauschaler Import des gesamten Postfachs.

Events können doppelt, verspätet oder in anderer Reihenfolge eintreffen. Antworten werden anhand bestätigter Referenzen zugeordnet. Ähnlicher Betreff oder gleicher Anzeigename genügt nicht für eine automatische vertrauliche Fallzusammenführung. Eine unbekannte Antwort wird im Eingang zur Zuordnung gehalten.

## 18.6 Ein Anliegen, mehrere Probleme

Eine E-Mail kann Rechnung, Produktfehler und Datenschutzfrage enthalten. Die ursprüngliche Nachricht bleibt einmal gespeichert. Der Owner legt verknüpfte Teilvorgänge mit getrennten Rechten und Zuständigkeiten an. Der Kunde behält eine erkennbare gemeinsame Kommunikation; intern bekommt jede Rolle nur den benötigten Teil.

Umgekehrt können viele Meldungen dieselbe technische Ursache beschreiben. Der vorhandene BugOpsincident bündelt die Diagnose. Kundenfälle verweisen darauf und behalten eigene Antwort-/Fristzustände. Ein Technikfix schließt nicht automatisch alle Kundenfälle, weil zusätzliche organisatorische oder kommunikative Punkte offen sein können.

Zusammenführen und Aufteilen sind nachvollziehbare Aktionen mit Revisionsprüfung. IDs und Historie bleiben auflösbar; es gibt keine stille Löschung des unterlegenen Falls. Berechtigungen werden bei einem Merge nicht großzügig vereinigt. Der Zielscope darf nur Inhalte aufnehmen, die dort zulässig sind; andernfalls bleiben getrennte Akten mit geschütztem Link.

## 18.7 Zustände, Zuständigkeit und Wartezeiten

Eingangsstatus: empfangen, technisch gespeichert, zugeordnet oder Zuordnung offen. Fallstatus: neu, in Klärung, in Arbeit, wartet auf Kunde, wartet intern, Lösung vorbereitet, Nachprüfung, gelöst, geschlossen. Kommunikationsstatus: kein Entwurf, Entwurf, zur Freigabe, Versand beauftragt, Versand bestätigt, Zustellung unbekannt oder fehlgeschlagen. Anzeigen können vereinfacht sein; die Datenachsen bleiben getrennt.

Jeder aktive Fall hat genau einen führenden Owner, mindestens eine nächste Aktion und entweder einen Fälligkeitstermin oder eine begründete Wiedervorlagebedingung. Ein Teamname ohne erreichbare Rolle genügt nicht. Bei Urlaub, Chatwechsel oder fehlender Kapazität wird Verantwortung explizit übertragen. Der Verlauf hält bisherige Zuständigkeit und offene Zusagen fest.

Priorität folgt Auswirkung, Dringlichkeit und vorhandenen Verpflichtungen. Ein Datenvorfall oder blockierte laufende Prüfung hat einen anderen Weg als ein Gestaltungswunsch. Die App zeigt den Grund und erlaubt begründete Korrektur. Sie verspricht keine pauschale Antwortzeit, solange keine tatsächliche Servicevereinbarung besteht.

Für einen bestätigten Servicevertrag speichert das Fristprofil Zeitzone, Geschäftszeiten, Feiertagsquelle, Beginn, erlaubte Pause und Eskalationsweg. Warten auf Kunden pausiert eine Frist nur, wenn das Profil dies vorsieht. Eine interner Chat ohne Antwort setzt die Kundenuhr nicht automatisch zurück. Neue Nachricht in geschlossenem Fall führt nach passender Regel zu Wiederöffnung oder verknüpftem Folgefall; sie darf nicht unsichtbar bleiben.

## 18.8 Automatische Zuordnung mit verständlicher Unsicherheit

Zuerst werden stabile Regeln verwendet: bekannter Produktkanal, vorhandene Case-ID, bestätigte Referenzen, ausdrücklich definierter Falltyp. Ein Sprachmodell darf zusammenfassen und Vorschläge machen. Es entscheidet nicht allein anhand eines selbst behaupteten Vertrauenswerts über sensible Weitergabe.

Der Vorschlag nennt seine Quellen und fehlende Informationen. Bei mehreren plausiblen Zielen fragt die App den zuständigen Eingangsbearbeiter mit wenigen sinnvollen Optionen. Bereits bekannte Firmenzuständigkeiten werden im Hintergrund genutzt. Martin soll keine Chat-ID auswählen müssen.

Automatische Regeln werden versioniert. Vor Aktivierung werden falsche Zuordnungen und Berechtigungsgrenzen an synthetischen oder erlaubten bereinigten Beispielen geprüft. Ein neuer Klassifikationsprompt erhält nicht ungeprüft das Versandrecht des alten Profils. Unklare Finanz-, Rechts- oder Datenschutzanliegen gehen zur passenden menschlichen beziehungsweise fachlichen Entscheidung.

## 18.9 Externe Inhalte und Anhänge

E-Mailtexte, Formulare, Bilder und Dokumente sind untrusted Quellmaterial. Inhalte werden sicher dargestellt; aktive Inhalte werden nicht als Appcode ausgeführt. Externe Bilder, Links und Anhänge werden nicht beim bloßen Öffnen unkontrolliert geladen. Grenzen für Größe, Typ, Anzahl und Verarbeitung werden pro Kanalprofil gesetzt.

Anhangsmetadaten enthalten Hash, Typ, Scan-/Prüfstatus, Schutzklasse und erlaubte Referenz. Ungeprüfte Dateien können als vorhanden angezeigt werden, aber nicht automatisch in Fachtools gelangen. OCR-/Textextraktion erhält Herkunft und Unsicherheit. Ein Anhang kann eine Quelle für ein Anliegen sein; er kann keine Operatorrolle, neue Tools oder Freigabe erzeugen.

Besonders vertrauliche Inhalte bleiben im eingeschränkten Fall. Die Zentrale kann anzeigen, dass ein zuständiger Owner gebraucht wird, ohne den Inhalt für alle Rollen offenzulegen. Kundendaten, die irrtümlich Lernendenantworten oder Lösungsschlüssel enthalten, werden nicht in den allgemeinen Wissensbestand übernommen.

## 18.10 Antwortvorbereitung und tatsächlicher Versand

CommunicationDraft bindet Empfänger, erlaubte Kanalreferenz, Betreff, Textrevision, Anhänge, Quellen und vorbereitende Rolle. Ein Modell darf nur bestätigte Produktstände zusagen. „Behoben“, „verfügbar“ und zugesagte Termine brauchen ihre jeweiligen Belege. Offene Arbeit wird verständlich als offen beschrieben.

Versandzulassung prüft aktuelle Fassung, Empfänger, Berechtigung, Zweck, notwendige Approval und Idempotenz. Die genaue Aktion wird dauerhaft vor externem Start gespeichert. Eine Änderung am Empfänger oder Inhalt invalidiert eine gebundene Freigabe. Der tatsächliche Versandbeleg enthält Provider-ID und Ergebnis; Annahme durch den Provider ist nicht automatisch nachgewiesene Zustellung oder Kenntnisnahme.

Bei Timeout nach einem möglichen Versand bleibt der Vorgang unknown. Der Adapter gleicht anhand stabiler Idempotenz-/Nachrichtenreferenz mit dem Provider ab, bevor ein weiterer Versand möglich ist. Falls der Provider weder Idempotenz noch sichere Statusabfrage unterstützt, bleibt der konkrete Fall zur manuellen Klärung gesperrt. Die UI bietet keinen unbedachten Wiederholenknopf.

Fehlermeldungen und Rückläufer gehören wieder zur gleichen Kommunikationsakte. Eine zurückgewiesene Adresse wird nicht aus dem Modell heraus durch eine ähnlich klingende Adresse ersetzt. Eine bereits gesendete Nachricht lässt sich nicht durch lokale Textänderung zurückholen; Korrektur wird als neue gebundene Kommunikation behandelt.

## 18.11 Beispiel: Kundenmeldung über falsche Punkte

Eine Lehrkraft meldet, eine Bruchaufgabe werde falsch bewertet. Der Eingang bestätigt interne Erfassung, ordnet den Kundenfall anhand erlaubter Referenzen zu und verknüpft ihn mit dem betroffenen Aufgabenprofil. Fehlende Release-/Aufgabenfassung wird gezielt angefordert; echte Schülernamen sind dafür nicht erforderlich.

Der Supportowner hält Kundenkommunikation und nächste Aktion. Der Fachowner prüft eine bereinigte Reproduktion. Bestätigt sich eine falsche Bewertung, wird die Qualitätsentscheidung für den betroffenen Scope entzogen und der Fehlerweg aus Band 17 ausgelöst. Weitere Meldungen verweisen auf denselben technischen Befund. Historische Abgaben werden nicht still nachberechnet.

Nach geprüftem Fix zeigt die Firmenakte getrennt: Quelle korrigiert, qualifiziert, Testrelease vorhanden, Schulveröffentlichung offen oder tatsächlich erfolgt. Der Antwortentwurf übernimmt genau diese Aussage. Erst tatsächlicher Versandbeleg ändert den Kommunikationsstatus. Der Fall wird nach seiner bestätigten Abschlussregel geschlossen; eine neue gegenteilige Rückmeldung öffnet ihn erneut.

## 18.12 Beispiel: unklare kaufmännische Mail

Eine Nachricht enthält Interesse an GradeCrew und Fragen zu Preisen sowie Datenverarbeitung. Der Eingang erzeugt eine Akte mit Opportunity- und Rechts-/Datenschutzbezug. Vertrieb bekommt den zulässigen Bedarf, die Fachrolle den konkreten offenen Vertragsaspekt. Unbekannte Preise oder Rechtsfreigaben werden nicht erfunden.

Ein zusammengeführter Antwortentwurf benutzt gültige freigegebene Informationen. Ein Angebot oder verbindlicher Vertragsschritt braucht seine eigene zuständige Annahme. Der Kunde muss nicht drei widersprüchliche Antworten aus drei Fachchats erhalten. Ein führender Owner hält den Gesamtzusammenhang und stellt die fachlich bestätigten Beiträge zusammen.

## 18.13 Kennzahlen für den Betrieb

Die Führung sieht unbearbeitete Eingänge, Fälle ohne Owner/nächste Aktion, Alter bis Zuordnung, offene interne Wartezeit, bestätigte Reaktionszeiten, wiedergeöffnete Fälle und häufige Ursachen. Jede Kennzahl hat Zeitraum, Quelle, Nenner und bekannte Lücken. Null neue Nachrichten bei ausgefallenem Kanal ist kein ruhiger Betrieb.

E-Mailmenge misst nicht Kundenqualität. Viele geschlossene Fälle messen nicht automatisch Kundenzufriedenheit. Die wichtigsten Steuerungsfragen lauten: Bleibt etwas liegen? Fehlt eine Entscheidung? Welche Ursache erzeugt wiederholt Arbeit? Ist eine Zusage gefährdet? Der Chefbrief zeigt dazu konkrete Fälle und nächste Schritte.

## 18.14 Anschluss-, Ausfall- und Wiederherstellungsvertrag

Ein Kanal wird zunächst mit Testdaten, begrenztem Quellumfang und dokumentierten Rechten qualifiziert. Abnahme umfasst vollständige Pagination, Importwiederholung, Cursorverlust, Rechteentzug, Anhangsfehler, unklare Identität, falsche Zuordnung, Neuöffnung und verlorenen Versandbeleg. Ohne nachgewiesenen Connector wird keine automatische Mailverarbeitung als aktiv bezeichnet.

Bei Verbindungsfehler bleibt der letzte bestätigte Stand mit Alter sichtbar. Neu eingehende Meldungen können erst nach erneuter Synchronisation als vollständig gelten. Ein lokaler Mac, der ausgeschaltet ist, führt keinen lokalen Poller aus. Gewünschter Betrieb während Abwesenheit benötigt einen ausdrücklich gewählten und geprüften Ausführungsort.

Restore folgt D4: Imports, externe Sendungen, Widerrufe und Löschungen nach dem Backup müssen vor Wiederfreigabe abgeglichen werden. Ein restaurierter lokaler Status „Entwurf“ darf eine bereits gesendete Nachricht nicht erneut verschicken. Ein gelöschter Kundenfall darf nicht durch alten Suchindex oder Reimport unberechtigt wieder sichtbar werden. Notwendige Tombstones und externe Ereignisbelege werden im jeweiligen Datenvertrag festgelegt.

## 18.15 Abnahme und Einführung

Zuerst wird ein manuell erfasster synthetischer Kundenfall vollständig abgewickelt. Danach genau ein externer Eingang mit getesteter Abdeckung. Dann folgt die Antwortvorbereitung und bei konkreter Freigabe der Versand. Zusätzliche Kanäle kommen einzeln nach tatsächlichem Nutzen hinzu. Die App zeigt für jeden Kanal: geplant, eingerichtet, qualifiziert, aktiv, gestört oder stillgelegt.

Die Abnahmefälle FZ-AT61 bis FZ-AT70 und FZ-AT72 sichern diesen Weg. Ein erfolgreicher Eingangstest belegt keine automatische Reparatur und kein vollständiges CRM. Der durchgehende Fall mit nachvollziehbarem Ergebnis ist der Maßstab.
