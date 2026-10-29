# Band 07 - Automatisierungen und Verbindungen

## 7.1 Automatisierung als kontrollierter Geschäftsprozess

Jede Automation ist ein versionierter Prozess mit Owner, Trigger, Datenquellen, konkreter Wirkung, Berechtigung, Budget, Versuchslimit, Ergebnis, Abbruchbedingung und Wiederaufnahme. Eine bestehende Verbindung bedeutet nicht, dass ein wiederkehrender Auftrag eingerichtet wurde.

Vier Stufen werden getrennt: beobachten, empfehlen, vorbereiten und ausführen. Ein Beobachter kann einen Quellenkonflikt melden. Er darf nicht daraus eine Codeänderung, einen Kundentextversand oder einen neuen Providerstart ableiten. Ein Ausführungsprofil benötigt die passende Freigabe und unabhängige Kontrolle für seinen tatsächlichen Scope.

Die Automatisierungen dieses Bands sind Vorschläge für spätere Einbindung. Es werden in dieser Planungsarbeit keine Scheduler, Monitore, Benachrichtigungsregeln oder bezahlten Läufe aktiviert.

## 7.2 Einheitlicher AutomationDefinition-Vertrag

Eine Definition enthält automationId, Version, Zweck, Fachowner, genehmigenden Actor, Triggerart, Zeitzone, Datenquellen und erlaubte Quellenversionen, Voraussetzungen, Sichtbarkeitsklasse, Aktionsprofil, Kosten-/Versuchsgrenzen, Parallelität, Cooldown, NotificationPolicy, Stopregel und Ergebnisformat.

Ein Run enthält eventId oder geplanten Slot, deduplicationKey, beobachtete Triggerdaten, Requestbindung, Startintent, tatsächliche externe Run-ID, Status, Verbrauch/unknown, Resultat und nächste erlaubte Aktion. Definitionen und Runs sind keine neuen fachlichen Tasks; sie verlinken bestehende Ziele und Aufgaben.

Eine Änderung an Trigger, Scope oder Budget erzeugt eine neue Definitionsversion. Ein bereits laufender Run behält seinen alten Vertrag. Pausieren der Definition beendet keinen bereits gestarteten externen Vorgang; Abbruch und Beobachtung bleiben eigene Operationen.

## 7.3 Auslöser und Ausführungsort

Zeittrigger laufen mit expliziter Zeitzone und klarer Bedeutung bei Sommer-/Winterzeit. Ereignistrigger verwenden eine eindeutige Event-ID und geprüfte Herkunft. Manuelle Auslösung bleibt als eigener Ursprung sichtbar.

Für zeitliche Wiederholung wird definiert: verpassten Slot nachholen oder auslassen, genau eine Ausführung pro Slot, zulässiges Fenster, Verhalten bei Offline, Priorität und maximaler Rückstau. Ein Monatstermin „letzter Geschäftstag“ wird nicht unbemerkt als „alle 30 Tage“ umgesetzt.

Offizielle ChatGPT-Scheduled-Dokumentation unterscheidet lokale Desktopaufgaben mit Rechner-/Appverfügbarkeit und Webaufgaben mit zugänglichem Cloudkontext. Team-/Eventfähigkeiten hängen vom tatsächlichen Plan und Workspace ab. Quelle: [Scheduled tasks](https://learn.chatgpt.com/docs/automations). Der Firmenservice speichert den tatsächlich angelegten Schedulerbeleg und behauptet keinen Cloudbetrieb aus einer lokalen Definition.

## 7.4 Automationskatalog

### AUT-01 - Quellen- und Statusabgleich

Trigger: bestätigter Aktualisierungsklick, später Ereignis oder begrenztes Intervall. Eingang: vorhandene Workstream-/GitHubquellen. Wirkung: SourceObservations und Projektionen aktualisieren. Keine Codeänderung und kein Deploy.

Voraussetzung: Readerberechtigung, Rate-Limitprofil, Quelle mit Version/ETag. Stop: Authfehler, unbekannte Umgebung oder widersprüchlicher Quellenstand. Ergebnis: aktualisierter/alter/unverfügbarer Stand mit Fehler. Benachrichtigung nur bei entscheidungsrelevanter Änderung oder neuem Blocker.

### AUT-02 - Chefbrief aktualisieren

Trigger: Nutzeraufruf oder später festgelegter Führungstermin. Eingang: autorisierter Firmenbestand und seit dem letzten Brief geänderte Events. Wirkung: datierter Briefentwurf mit Belegen.

Voraussetzung: klare Quellenabdeckung, Modellprofil, Kosten-/Kontingentgrenze. Stop: fehlender wesentlicher Quellenfeed oder widersprüchliche kritische Fakten. Ergebnis kann „Brief teilweise“ mit konkreter Lücke sein. Kein allgemeiner Statusbericht bei unverändertem, nicht handlungsrelevantem Stand.

### AUT-03 - Zielblocker erkennen

Trigger: DependencyEvent, Friständerung oder Belegentzug. Eingang: Zielgraph und Taskabhängigkeiten. Wirkung: betroffene Projektionen invalidieren und konkrete Blockerkarte erstellen.

Regel: nur echte Abhängigkeiten, keine bloßen thematischen Links. Ein bereits gemeldeter Blocker wird aktualisiert, nicht jedes Mal neu erzeugt. Ergebnis nennt Kette, führenden Owner und kleinsten möglichen nächsten Schritt. Prioritätsänderung bleibt Vorschlag, sofern keine bestätigte Regel sie eindeutig vorgibt.

### AUT-04 - Ausstehende Entscheidungen bündeln

Trigger: neue PendingQuestion/Approval oder Frist. Wirkung: eine deduplizierte Entscheidungssicht mit Ursache und Handlung. Keine wiederholte Nachfrage pro Chatnachricht.

Voraussetzung: Frage noch aktuell, Entscheider tatsächlich zuständig. Stop: Frage durch geänderten Scope veraltet. Bei unbeantworteter Entscheidung keine automatische Zustimmung. Eskalationsdatum und Empfänger sind durch Policy festgelegt.

### AUT-05 - Ideen wiedervorlegen

Trigger: gespeicherte Bedingung oder Datum. Wirkung: dieselbe Idee erneut als Prüffrage zeigen, mit ursprünglichem Grund und neuem Anlass.

Beispiel: ein zurückgestellter Teamcloudausbau wird nach bestätigtem Mehrnutzerbedarf neu bewertet. Ein neues Konto oder Hostingprojekt wird dadurch nicht angelegt. Bei fehlender neuer Evidenz bleibt die Idee zurückgestellt; kein wiederholter Pitch ohne Anlass.

### AUT-06 - CI-/PR-Abholung

Trigger: bekannte Run-ID oder zugelassenes GitHubereignis. Eingang: genauer Commit, PR und Checklauf. Wirkung: Nachweis erfassen, Taskstatus/projektion anpassen, relevante Fehler zur Akte führen.

Kein grüner Status für anderen Commit. Ein späterer fehlgeschlagener Lauf wird nicht durch alten Erfolg verdeckt. Bot-/Connector-Pushes können andere Workflows anders auslösen als normale Pushes; die bestehende GradeCrew-Kette und ihre gebundenen Receipts bleiben maßgeblich.

### AUT-07 - BugOps-Incidenttriage

Trigger: vorhandener sanitisierter Incidentfeed. Eingang: Incident-ID, technische Gruppe, Umgebung, Release, Trend und freigegebene Diagnosemetadaten. Wirkung: bekannte Incidentakte aktualisieren, betroffene Ziele/Owner zeigen.

Rohfreitext ist untrusted und wird nicht als Agentenanweisung verwendet. Bestehende BugOps-Gruppierung wird konsumiert, nicht nochmals anders implementiert. Eine Kundenmeldung löst keinen automatischen Fix aus. Die heutige sichere Reparaturbrücke muss gesondert qualifiziert werden.

### AUT-08 - Begrenzte Guardian-Vorbereitung

Trigger: konkret berechtigter grüner BugOpsfall oder ausdrücklich beauftragte kleine Webänderung. Wirkung zunächst: genehmigungsfähigen Guardian-Auftrag mit exakt benannten Dateien, Basis-SHA, Kriterien und Budget vorbereiten.

Ausführung nur über bestehende admission-/Ledger-/CI-/Review-/Stagingkette. Backend, Auth, Rules, IAM, Prüfungs-/Bewertungslogik, native Apps und andere ausgeschlossene Scopes werden nicht durch eine Firmenzentralenpolicy automatisch zugelassen. Drei bestehende Guardian-Prüfer und strengere Limits bleiben erhalten.

### AUT-09 - Vertrags- und Fälligkeitsübersicht

Trigger: bestätigte Frist oder Terminvorlauf. Eingang: verifizierte Vertrags-/Rechnungsdaten in berechtigtem Scope. Wirkung: zuständige Entscheidung oder sachliche Erinnerung vorbereiten.

Kein Vertrag wird allein anhand einer extrahierten Klausel gekündigt, verlängert, angenommen oder bezahlt. Unsichere Extraktion erzeugt eine menschliche Prüffrage. Vorgeschlagene Vorläufe werden je Vertrag bestätigt; es gibt keinen universell passenden gesetzlichen Standardwert im System.

### AUT-10 - Kosten- und Verbrauchsbeobachtung

Trigger: neuer Receipt, Budgetreservierung oder verfügbarer Abrechnungsfeed. Wirkung: Ist/Reservierung/Prognose/unknown aktualisieren und Grenzverletzung zeigen.

Ein unbekannter Providerverbrauch bleibt konservativ reserviert. Eine andere Task-ID oder ein neuer Chat setzt das Budget nicht zurück. Listenpreise und Verbrauchsschätzungen werden als solche benannt. Kein automatischer Kauf und kein Wechsel auf einen anderen kostenpflichtigen Provider bei Quota-/Authproblemen.

### AUT-11 - Pädagogische Abdeckungsprüfung

Trigger: neuer Inhalt, geänderte Konzeptfassung oder bestätigte neue Zielregion. Wirkung: betroffene Fach-/Stufen-/Kompetenzmatrix aktualisieren und Prüfbedarf zeigen.

Eine neue Sprache oder ein bestandener Syntaxcheck gilt nicht als pädagogische Freigabe. Inhalte erhalten konkrete Fach-/Lernzielkriterien. Unbelegte Zellen bleiben offen. Ein Modell kann Beispiele vorschlagen; die passende fachliche Abnahme bleibt zugewiesen.

### AUT-12 - Datenschutz-/Anbieteränderungen

Trigger: bekannte neue Verbindung, Datenklasse oder relevante Quellenänderung. Wirkung: betroffene Datenflüsse und Kontrollprofile zur Prüfung markieren.

Ein Verbindungsstatus „aktiv“ beweist keine Zweck-/Vertrags-/Löschfreigabe. Die Zentrale bündelt den Änderungsbedarf an die bestehenden Datenschutz-/Rechtsrollen. Keine pauschale Blockade aller Projekte wegen einer sachfremden offenen Katalogposition.

### AUT-13 - Backupprüfung

Trigger: bestätigter Betriebsplan. Wirkung: konsistentes Backup erstellen, Hash/Manifest und Revisions-/Journalpointer speichern. Ein späterer isolierter Restoretest ist eigener Run.

Die Prüfung meldet Backupfehler, fehlenden unabhängigen Journalhead oder nicht verifizierte Wiederherstellung. Ein Restore auf Production ist keine normale Hintergrundaktion. Band 08 definiert die Fail-closed-Grenze.

### AUT-14 - Review- und Ergebnisabholung

Trigger: bekannte Review-/Execution-ID. Wirkung: neue Resultate abholen, Kandidatenbindung prüfen und denselben Task aktualisieren.

Ein Prüfer bekommt den eingefrorenen Kandidaten samt Kriterien und eigenen Scope. Er erhält zunächst nicht das Urteil anderer Prüfer als Erfolgsvorgabe. Erhebliche Befunde werden untersucht, nicht durch Mehrheitszahl überstimmt. Nach Änderung gelten nur passende erneuerte Prüfungen für den neuen Stand.

### AUT-15 - Onboarding- und Supportvorbereitung

Trigger: autorisierter interner Auftrag oder freigegebener Fall. Wirkung: fehlende Einrichtung/Informationen sammeln und einen Antwort-/Arbeitsentwurf erstellen.

Tatsächlicher externer Versand braucht passende konkrete Autorisierung und Empfängerprüfung. Konto-/Passwortwiederherstellung bleibt im zugelassenen Verfahren. Es werden keine Kundendaten in ungeprüfte Modelle oder Codingaufträge kopiert.

### AUT-16 - Zentralenübergabe und Quellenfrische

Trigger: bestätigter Rollenwechsel, Kontextübergabe oder erkannte fehlende Zuständigkeit. Wirkung: gespeicherten Koordinationsstand, offene Requests, Budgets und nächste Schritte an die neue berechtigte Bindung übergeben.

Ein voller Chat wird nicht automatisch vorausgesagt. Regelmäßige Checkpoints und dauerhafte Akten sind die Vorsorge. Die neue Zentrale bestätigt den letzten belegten Schritt; alte und neue Koordination besitzen keine parallele unkontrollierte Schreibhoheit.

## 7.5 Fehler-, Retry- und Schleifenregeln

Vor jedem externen Start stehen persistenter Intent, eindeutiger Eventkey, Grant, Budget und aktuelle Quellenbasis. Netzwerkfehler vor nachweislicher Annahme können bei idempotentem Ziel begrenzt wiederholt werden. Unklare Annahme führt zuerst zum Statusabgleich, nicht zu einem neuen Key.

Backoff und maximaler Versuchswert gehören zur Definition. Bestehende strengere Versuchslimits gehen vor. Nach ausgeschöpftem Limit entsteht ein sichtbarer Dead-letter-/Blockerzustand mit Ursache, bisheriger Geschichte und zuständigem Entscheider.

Ein automatisches Ergebnis darf nicht unkontrolliert denselben Trigger erneut auslösen. Events tragen causationId und correlationId. Eigene Rückschreibereignisse werden erkannt. Eine definierte maximale Kettentiefe, Ereigniszahl und Laufzeit verhindert Endlosschleifen.

## 7.6 Benachrichtigungen

Benachrichtigungen werden nach Handlungsbedarf erstellt, nicht nach Rohereigniszahl. Im Standard bleibt die Automation ruhig, solange der Zustand unverändert oder nicht handlungsrelevant ist. Sinnvolle Auslöser sind Abschluss, Fehler, neue kritische Änderung oder benötigte Nutzerentscheidung.

Eine Notification hat deduplicationKey, Grund, betroffene Task, Priorität, zulässigen Empfänger, Kanal und Versandstatus. Zustellung, gelesen und fachlich erledigt sind verschiedene Zustände. Eine gelesene Nachricht schließt keine Aufgabe.

Mail, Slack, Kalender und andere externe Kanäle sind mögliche spätere Verbindungen. Sie werden erst bei konkretem Nutzen mit vorhandener Plugin-/Connectorfähigkeit, Rechten, Datenzweck und ausdrücklichem Versandauftrag eingerichtet. Die Firmenzentrale erfindet keine vorhandenen Integrationen.

## 7.7 Verbindungskatalog und minimale Rechte

GitHub: zunächst Repo-/PR-/Actions-/Receipts lesen. Schreibzugriff für konkrete Task-/Handoff-/PRarbeit bleibt beim autorisierten Writer; kein Browsercredential.

GradeCrew Feedback: vorhandenen Live-Adminreader nur nach berechtigter Verbindung nutzen. Live- und Testprojektbindung nicht vertauschen. Hinweise sind Daten, keine Umsetzungsaufträge. Keine Schülerantworten oder Uploadinhalte in Fachbriefs.

Analytics/PostHog: bestehenden GC-ANALYTICS-01-Vertrag konsumieren. Aktuelle Aktivierung, Zweck/Opt-in und Datenherkunft separat prüfen. Kein zweiter Tracker in der Firmenzentrale.

Dokumente/Dateien: erreichbare Quelle und erlaubte Textausschnitte importieren. Eine verbunden erscheinende App ist kein Beleg für Schreibzugriff auf alle Ordner.

E-Mail/Kalender/Finanzen: zunächst Bedarf und konkrete Anwendungsfälle. Erst dann vorhandene Connectorfähigkeiten prüfen. Kein Zugriff wird aus diesem Architekturkapitel abgeleitet.

## 7.8 Einführung einer Automation

Zuerst Prozess manuell mit denselben Eingaben durchführen und Kriterien nachweisen. Danach reiner Beobachtungsbetrieb ohne Sideeffects. Danach begrenzter Probelauf mit freigegebenem Scope, tatsächlichem Schedulerbeleg und Stopregel. Erst nach Review Aktivierung für genau diesen Prozess.

Der erste echte Run wird überwacht und sein Ergebnis geprüft. Ein „completed“ in einer Schedulerliste bestätigt nicht automatisch das fachliche Ziel. Nach Änderungen an Policy, Datenfluss oder Ausführungsadapter wird der betroffene Scope neu qualifiziert.

## 7.9 Abschaltung

Die Steuerung unterscheidet neue Runs sperren, laufende Ausführung abbrechen, Verbindung widerrufen und Daten löschen. Ein globaler Notstopp sperrt zuerst neue externe Starts. Bereits gestartete Vorgänge werden einzeln beobachtet und in den Zustand confirmed_stopped oder unknown übernommen.

Nach Wiederfreigabe werden alte wartende Aktionen nicht blind nachgeholt. Sie durchlaufen aktuelle Revisions-, Berechtigungs-, Budget- und Frischeprüfung. Eine abgelaufene Nutzerfreigabe wird nicht durch das Einschalten der Automation erneuert.

## 7.10 Zusätzliche Profile für Qualität und Eingang

### AUT-17 - Qualitätsbasis überwachen und Nachprüfung vorschlagen

Trigger: relevante Abhängigkeitsänderung, bestätigter Befund oder vereinbarte Gültigkeitsbedingung. Wirkung: betroffene Qualitätsentscheidung revalidierungspflichtig markieren und konkreten Prüfauftrag vorbereiten. Kein automatischer Produktschalter, Retest oder Providerstart ohne eigenes Ausführungsprofil. Deduplikation nach Qualitätsbasis und Auslöser; Quellenfehler bleibt unbekannter Prüfstand. Stop bei unklarer Basis/Ownerzuordnung; Ergebnis mit Umfang, fehlenden Gates und nächstem Schritt. Nachweisfälle AT50/55/59.

### AUT-18 - Freigegebenen Eingang abgleichen

Trigger: autorisiertes Kanalereignis oder konkret eingerichtetes Abholintervall. Wirkung: idempotenter Import, Routingvorschlag und sichtbarer Quellenstand. Cursor erst nach Commit; keine Mail-/Kontolöschung und kein Versand aus Leserecht. Scope, Pagination, Mengenlimit, Aufbewahrung und Ausführungsort pro Kanal. Bei Rechteentzug oder Cursorproblem stoppen beziehungsweise gezielt abgleichen, keine blinde Vollpostfachkopie. Unveränderte Lage ohne Benachrichtigung. Nachweisfälle AT61-65/68/72.

### AUT-19 - Offene Fälle und Zusagen nachhalten

Trigger: tatsächliche Frist, neue Rückmeldung, verlorener Owner oder veränderte Zusage. Wirkung: deduplizierter Hinweis an die zuständige Rolle mit konkreter nächster Aktion. Fristen nach bestätigtem Geschäftszeit-/Pausenprofil; keine erfundene Kundenzusage. Automatischer Versand ist nicht enthalten. Stop bei unklarer Verantwortlichkeit und gezielte Klärung statt Rundnachricht. Nachweisfälle AT69/70; Budgets und bereits laufende Vorgänge bleiben erhalten.
