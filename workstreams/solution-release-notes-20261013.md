# GC-WEB-REPAIR-20261007 · Lösungsfreigabe für Übungen vormerken

Stand: 13.10.2026. Ausführender Fachchat text_leak_concept; Zentrale koordiniert, Chat-Link unbekannt. Bestehende Task GC-WEB-REPAIR-20261007, Securitygrenzen verknüpft mit GC-SECURITY-02. Kein neuer Task, kein Budget-/Versuchsreset. Angefordert Sol/medium, tatsächliche Runtime/Usage unbekannt.

## Nutzerwunsch und verbindliche Grenze
Das Foto zeigt die gespeicherte Abgabe mit „Lösungsfreigabe prüfen“. Martin möchte die Lösungen nach eigener Abgabe sehen können, wenn die Lehrkraft dies ausdrücklich für eine Übung freigibt, auch wenn keine Notenanzeige gewünscht ist. Vor Veröffentlichung einer so eingestellten Sichtbarkeit soll ein Hinweis die Bestätigung oder Änderung erlauben. Der Auftrag lautet ausschließlich **merken und im passenden Code vermerken**. Foto tatsächlich angesehen; keine Foto-/Konto-/Punkte-/Noten-/Attemptdaten ins Repo übernommen. Kein unbekannter Test wurde geöffnet oder geändert.

**Vorgemerkte Regel, noch nicht implementiert:** Eine ausdrücklich durch die berechtigte Lehrkraft gewählte Übungspolicy kann Lösungen unmittelbar nach der eigenen Abgabe, auch vor dem globalen Testende, zulassen. Ergebnis-/Notenanzeige und Lösungssichtbarkeit getrennt behandeln. Ein verborgener Ergebnisbericht, resultMode=none, showSolutions oder startMode=student allein ist keine ausdrückliche Übungserlaubnis. Keine automatische Umdeutung oder Abschaltung der Bewertung.

## Was aktuell tatsächlich gilt (Source44ab6540/gc38)
- secure-solution-release.js72–88 zeigt den Wartetext und Button. Der Button ruft refreshReceipt({force:true})/api.getReceipt auf; er schreibt keine Freigabe. Released-Daten werden aus dem Serverreceipt dargestellt. Kein Auftrag an Lernende, selbst Lösungen freizugeben.
- assessment-functions/lib/secure-lifecycle.js348ff makeReceipt verlangt das bei Start/Abgabe eingefrorene showSolutionsAfterEnd, Ergebnisanzeige ungleich none, globales Testende plus90Sekunden Nachfrist, keinen Lösch-/Rechtehalt und einen privaten solutionSnapshot.
- Start482/512 erzeugt showSolutionsAfterEnd/private Lösungssnapshot nur bei showSolutions=true und resultMode!=none. resultMode=none unterdrückt den Ergebnisbericht, ist kein bewiesener „unbewerteter Übungsmodus“. Die heutige Lösungssichtbarkeit ist damit an Ergebnisanzeige gekoppelt.
- getAssessmentReceipt706ff prüft gültigen Attempttoken und vorhandene eigene Abgabe. Das schützt den Schülerzugriff; es ersetzt keine Lehrkraftberechtigung für eine spätere Policyänderung. Die aktuellen Quizschreibwege sind durch Owner/Admin-Regeln kontrolliert, nicht durch diesen Schülerbutton.
- Eine spätere Lehrkraftfreigabe ist deshalb nicht allein durch Lesen des neuesten showSolutions-Quizflags gelöst: Der passende private, unveränderte Attempt-Lösungssnapshot muss existieren. Keine Lösungen aus nachträglich veränderten Fragen oder fremden Abgaben nachladen.
- app.js applyDashboardPublication1830ff und publishCurrentQuiz6219ff sind die zwei vorhandenen Publishwege. Sie erhalten in diesem Auftrag nur Kommentare, keine neue Bestätigung oder Policyfunktion.

## Geplanter Ablauf bei einem späteren Umsetzungsauftrag
1. Berechtigte Lehrkraft entscheidet ausdrücklich die Übungssichtbarkeit nach eigener Abgabe. Diese Policy und ihre Bestätigung werden an die veröffentlichte Revision und den Attempt gebunden. Eine relevante Einstellungsänderung verwirft die Bestätigung. Das konkrete Schema/Endpoint ist noch nicht umgesetzt; keine bestehende Feldkombination als fertigen Übungsmodus ausgeben.
2. Nur bei dieser gewählten Sichtbarkeit vor Veröffentlichung: **„Nach der Abgabe können Lernende die Lösungen anzeigen.“** Aktionen **„So veröffentlichen“** / **„Einstellung ändern“**. Derselbe Vertrag gilt für Dashboard und Editor, keine allgemeine Warnung bei jeder Veröffentlichung.
3. Schüleransicht: klare Zustände **„Warten auf Freigabe“** / **„Lösungen anzeigen“**. Nach Lehrkraftfreigabe kann der nächste zulässige Serverreceipt-Check den neuen Zustand darstellen. Kein neues aggressives Polling, keine KI-Abfrage und keine Freigabelogik im Browser.
4. Lehrerberechtigung und Schülerzugriff getrennt serverseitig prüfen. Gültiger eigener Attempttoken, vorhandene eigene Abgabe, Lösch-/Rechtehalt und private zur Attemptrevision passende Lösungen bleiben zwingend. Ein Browserflag erlaubt keine Freigabe.
5. Übung unmittelbar nach eigener Abgabe vor globalem Ende wäre die ausdrücklich bestätigte neue Policy. Der Prüfungsmodus behält unverändert sein Ende-/Nachfristgate. Spätere autorisierte Freigaben müssen mit der gespeicherten Policy/privaten Revision kompatibel sein; laufende Prüfungen nicht still zu Übungen umdeuten.

## Kleine spätere Abnahmefälle (Spezifikation)
| Fall | Erwartung |
|---|---|
| SR01 · ausdrücklich bestätigte Übung, eigene Abgabe vorhanden, andere Lernende noch aktiv | nur bei später implementierter autorisierter Übungspolicy eigene passende Lösungen sofort zulässig; keine fremden Antworten |
| SR02 · Prüfung/fehlende Übungserlaubnis oder nur resultMode=none | keine neue Frühfreigabe; Ergebnisanzeige nicht als Übung interpretieren, heutige Prüfungsgrenzen erhalten |
| SR03 · vor Publish Sichtbarkeit nach Abgabe gewählt/anschließend geändert | konkreter Hinweis mit Bestätigen/Ändern; relevante Änderung invalidiert bestätigte Policyrevision, beide Publishwege konsistent |
| SR04 · fehlender/falscher Token, noch keine Abgabe, Hold/Delete oder geänderte Quizfragen | Lösungen bleiben gesperrt; gültige spätere Freigabe nutzt privaten Attemptrevision-Snapshot und klaren Serverzustand |

## Codevermerk, Belege und Status
[DraftPR229](https://github.com/HerrLoeffler/Hausaufgabe/pull/229), Branch docs/gc-solution-release-notes-20261013 gegen feature/gradecrew-app-integration. Remotecommit [b0149fe3243bcf90357aa1a8d31b78dafdd8589b](https://github.com/HerrLoeffler/Hausaufgabe/commit/b0149fe3243bcf90357aa1a8d31b78dafdd8589b), echter Parent44ab6540. Lokaler Peer-Kandidat b409c84c19a3c1aa6ccc4fc674e5c72ea46363a1 hat denselben geprüften Tree09e415602f8a7c51ad619a96ec2f956317c2e259. Eigener sauberer Checkout /private/tmp/gc-solution-release-notes-20261013; Basisbdbf59b ist runtimebaumgleich44ab. PR am Task angehängt.

Exaktes Delta **24 TODO-Kommentarzeilen in drei Dateien**: app.js beide Publishwege; secure-solution-release.js Wartedarstellung; assessment-functions/lib/secure-lifecycle.js Receipt-Gate. Nach Entfernung ausschließlich dieser eingefügten Kommentarblöcke sind alle drei Dateien bytegleich zum Original. Drei Node-Syntaxchecks und diff-check bestanden. Unabhängiger Kommentar-/Semantikreview PASS für b409c84/Tree09e41560; Prüfer bestätigte ebenfalls3/3 ausführbare Bytegleichheit und Syntax. Keine neuen Produkt-/Modelltests, keine API-/Schema-/Guard-/UI-/Bewertungsänderung, keine neuen Datenfelder oder Rechte.

Frische main-Basis2bcae81/tree99b03; Live Development Status38364382337 auf dieser Basis success durch Koordination gelesen. Primaryhead44ab frisch bestätigt. Offene PR146 betrifft denselben Backendpfad mit älterer Startguardarbeit; diese Logik wird nicht übernommen/ersetzt. PR228 Generatorhinweise bleibt separater unveränderter Kandidat. Aktiver Source/PR-/Dateiüberlappungsstand vor späterer Integration neu prüfen.

Stage: isolierter Kommentare-Kandidat, nicht integriert/nicht deployed; vorhandener Runtime44ab/gc38 unverändert. Kein Merge, Deployment, neuer KI-/Provideraufruf, Installations-/Credential-/Ruleswechsel, keine Test-/Attemptlektüre oder Migration. SEC06/07: private revisionspassende Lösungen/Zugriffsgrenzen; PRIV13: klare Bedienung. Nur gezielter Vermerk, keine pauschale Sicherheits-/Geräteabnahme.

## Genau nächster Schritt
Dieser Merken-Auftrag endet nach Kommentar-/Dokumentationssicherung, Peerreview und frischem Readback. Erst bei ausdrücklich beauftragter Umsetzung dieselbe Task und diese Übergabe verwenden, Policy/Snapshot/Lehrkraftberechtigung vor UIänderung qualifizieren. Keine automatische Integration oder Deploymentkette aus dem Vermerk.

Dokumentationsdelta unabhängig PASS für437e0fc2b7baf9deb99b30c7621d48d290917038; alter Feedback-Handoff unverändert plus Anhang, nur bestehende WEB-TODO-Zeile ergänzt. Prüfer und Autor lasen alle drei PR229-Sourceblobs frisch identisch zum Kandidaten. Reviewreceipt: analysis/GC-WEB-REPAIR-20261007-SOLUTION-NOTES/review-b409c84.md. Atomare Mainpublikation und identischer frischer Readback sind das Abschlussgate.

## 13.10.2026 · Auftrag ausdrücklich zur Umsetzung erweitert
Die vorherige „nur merken“-Phase ist historisch abgeschlossen. Martin hat anschließend vollständige Übungs-Lösungsfreigabe mit Publishhinweis und Stagingdeployment ausdrücklich beauftragt, gemeinsam mit BootflashfixPR232 und GeneratorPR228. Ausführender Policyowner /root/practice_solution_release, Branch feature/practice-solution-release-20261013/[PR231](https://github.com/HerrLoeffler/Hausaufgabe/pull/231); zentrale Koordination organisiert unabhängigen Security-/Policyreview, Combined-Sourceautor text_leak_concept führt nach qualifizierten Gates zusammen. Main-Dokumentation bleibt beim Source-/Releaseautor.
Status **Umsetzung/Review läuft**, noch kein neuer Runtime-/Deploynachweis. InitialreviewSourcef2e56bf9175362483a666ff66df29774f5ca9866 ist keine finale Freigabe; ein begrenztes AggregateAudio-/Firestore-Transaktionsgrößenfinding wird durch den Policyowner reproduziert und korrigiert. Vorherige KommentarPR229 gilt nicht als implementierte Policy. SR01–04, Lehrkraft-/Tokenrollen, private immutableAttemptrevision und Prüfungsgrenzen behalten Gültigkeit. Vor Integration frische Source-/Peer-/CombinedCI-Pins prüfen; kein Deployment vor diesen Gates. Aktueller kanonischer44ab/gc38 bleibt belegt, Production/FastQuiz/native unverändert.
