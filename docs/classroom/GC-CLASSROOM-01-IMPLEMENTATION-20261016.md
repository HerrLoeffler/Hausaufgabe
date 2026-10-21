# GC-CLASSROOM-01 Implementation Plan

**Aktueller Stand 21.10.2026:** Schule und mehrere Verwalter sind jetzt lokal implementiert: explizite Übernahmevorschau, atomare Bestandsübernahme mit stabilen IDs/Quellbelegen, geschützte Einladungen mit Kontoannahme und Verwaltungsbestätigung sowie Rollenwechsel mit Letztverwalterschutz. Martins Nachtrag gilt: bestätigte Lehrkräfte wählen ihre Klassen selbst. Die bestehende Oberfläche/Anmeldung/Tests bleiben erhalten. 563 automatisierte Tests bestehen; unabhängiger Review nach zwei Korrekturen ohne offene P1/P2. Echte Bestandsübernahme und neue Abläufe mit Martins angemeldetem Konto noch nicht bestätigt. Importierte Personaleinträge mit Login verbinden, Fach-/Prüfungsrechte, persönliche Schülercodes/QR, Druck und gemeinsames Mehrgerätebackend bleiben offen. Derselbe lokale Stand, kein Deploy; Details siehe [Übergabe](../../workstreams/classroom-student-management-v1.md).

> **For agentic workers:** Bei späterer Umsetzung `superpowers:executing-plans` verwenden. Ein Writer im bestehenden isolierten Checkout. Dieser Auftrag liefert zunächst den ausführlichen Plan; keine Produktimplementierung oder Veröffentlichung vor Martins Planprüfung. Bestehende Task-ID und Versuchshistorie erhalten.

**Goal:** Dauerhafte Schüler- und Klassenverwaltung mit manueller Pflege, ASV-/CSV-Abgleich und persönlichen Schülerzugängen in die vorhandene GradeCrew-Website integrieren; bestehende Lehreranmeldung, Tests und Testabläufe erhalten.

**Architecture:** Die bestehende App bleibt die Oberfläche und die einzige Test-/Bewertungsanwendung. Ein schulbezogener Classroom-Dienst ergänzt Identitäten, Mitgliedschaften, Fachzuständigkeiten und Testzuweisungen über serverseitig geprüfte APIs und Firestore. ASV-Dateien werden im Browser ausgewertet; stabile Quellkennungen werden mit einem schulischen Schlüssel pseudonymisiert. Personenidentität, Jahresmitgliedschaft, Anzeigename und Zugangscode bleiben getrennt.

**Tech Stack:** Vorhandenes HTML/CSS/Browser-ESM, bestehende Firebase-Auth-/Firestore-Konfiguration, Assessment-Functions in CommonJS auf Node 22, vorhandener Node-TestRunner und Browserprüfstand. Kein Frameworkwechsel; keine neue Prüfungsengine. Neue Abhängigkeiten nur bei konkret nachgewiesenem Bedarf und separater Prüfung.

**Spec:** [Teacher UX](../CLASSROOM_TEACHER_UX_V1.md), [Masterprojekt](../CLASSROOM_STUDENT_MASTERPROJECT_V1.md), [Identität und Jahreswechsel](../privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md), [ASV-Datenschutzkonzept](../privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md). Die aktuelle Nutzerpräzisierung vom 18.10.2026 und dieser aktuelle Planteil ersetzen widersprechende frühere Demo-/RAM-Anforderungen. Die am Ende erhaltene Historie ist keine aktuelle Implementierungsanweisung.

**Historischer Ausgangsstand vor den lokalen Ausbauten:** 18.10.2026; damaliger Umsetzungsvorschlag zur Nutzerprüfung, seinerzeit noch nicht implementiert. Aufgabenbranch `feature/classroom-integrated-preview-20261016`; Integrationsziel weiterhin `feature/gradecrew-app-integration`. Ausgangscode lokal `60295f223cc9a1daf56dc0e22da87c48400b0d73`, remote `505d22c4243f5578b65eb66b033a1584e3987e9a`, identischer Tree `e40635b8a72fa670ff16983a6dd7a5cda3319d92`. Unterschiedliche Commit-SHAs entstehen durch die bereits dokumentierte Connector-Sicherung, nicht durch einen anderen Produktbaum.

## Autorisierte Präzisierung: erster lokaler Ausbau mit Vor-/Nachnamen — 18.10.2026

Martin hat die Umsetzung freigegeben, zuerst dauerhafte Klassen und manuelle Schüleraufnahme. Für diesen Lieferumfang werden Vor- und Nachnamen regulär eingegeben und angezeigt; keine Pseudonyme. Diese ausdrückliche Nutzervorgabe ersetzt die früheren namenlosen UI-/Speicheranforderungen für diesen lokalen Teil. Namen sind dennoch personenbezogene Daten; DSGVO Art4/5/6/32 bleibt relevant (Primärquelle: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679). Kein allgemeiner schulrechtlicher Freigabenachweis.

Der sofort nutzbare erste Ausbau speichert die Namen und Klassen im vorhandenen Loopbackserver auf diesem Mac in SQLite, außerhalb des statischen Webroots, mit Dateirechten0600 und pro geprüftem echtem Lehreraccount getrennt. Bestehende Lehreranmeldung/Tests bleiben im bisherigen Testbackend. Tokenprüfung erfolgt über den dokumentierten Firebase-Auth-endpunkt accounts:lookup; dabei werden keine Schülerdaten übertragen. Keine CSV-/ASV- oder schulweite Rollenfunktion in diesem ersten Lieferumfang; späterer Cloudadapter und Schulfreigaben bleiben erforderlich. Die neue lokale Speicherung ersetzt weder eine schulweite gemeinsame Cloudverwaltung noch deren Backendrelease. Kein Hosting-/Rules-/Functionsdeploy.

Dieser Teil ergänzt die im Folgenden beschriebene Zielarchitektur. Abweichende Aussagen „Namen nur im Browser-RAM“ gelten für diesen ausdrücklich autorisierten lokalen Namenbestand nicht. Keine Namen, lokale Datenbank oder Credentials im Gitbaum, in AI, Logs oder Telemetrie. Keine Bestands-Quizmutation durch die neue Verwaltung.

## Beauftragte Fortsetzung: lokaler ASV-/CSV-Listenimport mit Vorschaufenster — 18.10.2026

Nach manueller Persistenz beauftragt Martin den CSV-Import mit Vor-/Nachnamen und Klassenzuordnung. Die weitere Präzisierung verlangt eine ANTON-artige Übersicht vor der Zustimmung: neue/bestehende Personen, Namensänderungen, Klassen-/Schuljahreswechsel (8b2026/27→9b2027/28), unklare Zuordnungen. Dieser lokale Lieferblock bleibt beim bestehenden echten Lehrerlogin und SQLite-Backend auf demselben Mac; keine Hosting-/Cloud-/Quizänderung.

Ablauf: Datei lokal öffnen (CSV2MiB, max2000Zeilen) → Kopfzeile/Trennzeichen/Kodierung bestätigen → Vor-/Nachname/Klasse mappen, optional feste vorhandene Klasse und Zielschuljahr → optionale ausdrücklich gewählte Quellkennung/Importquelle → serverautorisierte read-only Vorschau → Konflikte einzeln oder eindeutige Namensvorschläge ausdrücklich zuordnen → neue Vorschau → Checkbox „Ich habe die Änderungen geprüft und möchte sie übernehmen.“ → atomare Übernahme. Neue Klassen entstehen erst mit Bestätigung. Fehlende bestehende Personen bleiben unverändert; kein automatisches Löschen/Archivieren oder pauschaler Promotionslauf.

Identitätsvertrag lokal: gleicher bestätigter Quellenbezug innerhalb desselben Accounts oder gleiche vorher ausdrücklich übernommene Importdatei führt zur stabilen vorhandenen Schüler-ID. Namen allein erzeugen keine automatische Zusammenführung. Manuell vorhandene Personen werden als Zuordnungsvorschlag gezeigt, ausdrücklich verknüpft oder als eigenständige neue Person angelegt/übersprungen. Optionaler Quellenindex speichert ausschließlich einen lokalen Digest und die interne Schüler-ID; dieser Digest wird nicht als kryptografische Anonymisierung oder verifiziertes ASV-Schema bezeichnet. Die konkrete ASV-ID-Spalte muss die Schule weiterhin sachlich bestätigen. Keine schulweite gemeinsame Auth-/Schlüssel-/Jahresmitgliedschaftsimplementierung aus dieser lokalen Listenfunktion ableiten.

Geplante/umgesetzte Dateien dieser Fortsetzung: classroom/named-import.mjs und roster-import-dialog.mjs mit Tests, local-roster-client/manual-roster/CSS/i18n; tools/classroom-preview/local-roster-import.mjs und validation.mjs, store/api und Tests. Vorschau/Bestätigung binden Daten, Entscheidungen und Bestandsrevision an einen serverberechneten Planhash. Veränderter Bestand verlangt eine neue Vorschau. Die SQL-Transaktion übernimmt alle Personen/Klassen/privaten Indizes oder nichts; idempotente Bestätigung erzeugt keine Doppelanlagen. Größengebundene API4MiB, Bestandsgrenzen200Klassen/5000Personen unverändert. Vorhandene app.js/Auth-/Quiz-/Assessmentpfade bleiben unverändert.

Prüfung: neue Parser-/Backend-/UI-Verträge zuerst rot, dann grün; breite Websuite357/357 inklusive bestehendem Login/Editor/Publish/Assessmentclient grün. Echte lokale Browserprobe und unabhängiger Review werden am gesicherten Kandidaten gesondert belegt. Alte jsdomTeardownwarnung bleibt bekannt. Keine eigenen realen Schülerdateien in Nachweis/Git; synthetische Testdateien und Metadaten genügen.

## Global Constraints

- Lokaler Einstieg bleibt `http://127.0.0.1:8782/`; originale Startseite, normaler Lehrerlogin, bestehende Tests, Erstellen, Editor, Auswertungen, Einstellungen, Coco und bestehender Gast-Testcode bleiben erhalten.
- Martin bestätigte ausdrücklich: „Ja, meine Tests sind da“. Dies belegt diesen Teilablauf, keine neue Classroom-Backendfunktion.
- Bestehende `quizId` und Besitzrechte erhalten. Keine automatische Kopie, Umbenennung, Neuveröffentlichung, Umschreibung oder Löschung bestehender Tests.
- Links additiv „Meine Tests“, „Klassen“, „Schüler:innen“; Schulverwaltung nur für berechtigte Personen. Keine zweite Startseite, keine Testkontoauswahl im normalen Login.
- Aktuelles lokales Frontend nutzt das vorhandene Testbackend `hausaufgabe-staging`. Die Hostingseite `hausaufgabe-staging.web.app` wird durch diesen Auftrag nicht verändert. Production `hausaufgabe-40294` bleibt ausgeschlossen.
- Dieser Planungsschritt verändert ausschließlich Dokumentation. Spätere Backendveröffentlichung ist ein gesonderter, konkret zu prüfender Schritt; kein impliziter Functions-/Rules-/Hostingdeploy.
- Klassenlabels aus bestehenden Tests sind keine verifizierten Klassen und gewähren keinerlei Mitgliedschaft oder Leserechte.
- CSV-Inhalt, Klarnamen, rohe ASV-Kennung und Schulschlüssel nicht an GradeCrew-Backend, AI, Telemetrie, Logs, URLs oder Browserpersistenz senden. Flüchtige Verarbeitung im Browser; schulisch geregelte Quell-/Zuordnungsablage außerhalb GradeCrew.
- Pseudonyme Daten bleiben schutzbedürftige personenbezogene Daten. Keine Behauptung einer anonymen oder pauschal rechtssicheren Lösung.
- Secure Assessment mit `quizId + sessionRunId` bleibt die alleinige Attempt-/Submission-/Grading-Engine; private Lösungen und bestehende Idempotenz erhalten.
- Vor späterer Codearbeit Live Development Status, Zielbranch, offene PRs und Dateiüberschneidungen frisch prüfen. Frühere Nachweise bleiben an ihre damaligen SHAs gebunden.

## Review Focus

1. Accountwechsel und zwei Schulen: kein alter Listeninhalt, keine fremden Schülerdaten und keine aus dem Client behaupteten Rollen. Tests in Arbeitspaketen 1, 2 und 13.
2. Falscher Schlüssel, unbekannte Quellkennung oder manuell schon vorhandene Person: keine automatische Doppelanlage oder Namenszusammenführung. Tests in 4 und 6.
3. Voll-/Teilimport, Wiederholung, Abbruch und konkurrierende Änderungen bei großen Schulen: kein stiller Teilbestand und keine automatische Massenlöschung. Tests in 5 und 6.
4. Lehrkraftwechsel, späterer Klassenzutritt und laufende Prüfung: historische Empfänger und Ergebnisse bleiben korrekt; neue Rechte gelten nur im genehmigten Scope. Tests in 7, 9 und 10.
5. Codeverlust/-rotation und veraltete Schülersitzung: alte Berechtigung wird serverseitig unwirksam; ursprünglicher Gast-Testcode funktioniert weiter nach seinem bisherigen Vertrag. Tests in 8 und 10.

## 1. Nachweislicher Ausgangspunkt und Umfang

Heute vorhanden: vollständige lokale App mit echtem Lehrerlogin und realem Testbestand, additive Sidebar in `classroom/account-workspace.mjs`, Klassenansicht als Gruppierung vorhandener Testmetadaten, ehrlicher Schüler-Leerzustand. Eine ausdrücklich getrennte synthetische RAM-Probe existiert unter `/classroom-demo.html`. Sie ist kein dauerhafter Datenbestand und kein Sicherheitsnachweis für die Schule.

Heute nicht vorhanden: produktiver schulischer Mandant, dauerhafte Schüleridentitäten, serverseitige Classroom-Rollen, echter ASV-Abgleich, persönliche Schüleranmeldung, persistente Zuweisungen und Recovery. In `firestore.secure-assessment.rules` fehlen diese Classroom-Sammlungen. Die tatsächlich exportierte Assessment-API kommt aus `assessment-functions/main.js` → `lib/secure-lifecycle.js`; `assessment-functions/index.js` ist nicht die maßgebliche neue Erweiterungsstelle.

V1 soll einen vollständigen Grundablauf liefern: Verwaltung richtet Schule und Rechte ein → Klasse anlegen → Schüler:innen manuell oder per bestätigtem Import aufnehmen → Fachlehrkräfte zuordnen → vorhandenen oder neuen Test ausdrücklich zuweisen → persönliche Schüleransicht → bestehende Prüfung → berechtigte Auswertung → kontrollierter Schuljahreswechsel. Jeder Schritt muss dauerhaft gespeichert, erneut geladen und gegen fremden Zugriff geprüft sein.

Nicht in V1: Stundenplan, Chat/Messenger, Elternkonten, Zeugnis- oder Notenbuchsystem, automatische Schulwechselverknüpfung, automatische Namenssuche/-zusammenführung, Cloud-Klarnamensdatenbank, eigener GradeCrew-Schlüsseltresor, flächendeckende Schulverwaltungssoftware. Fachgruppen über mehrere Klassen werden im Datenmodell unterstützt; die erste Oberfläche startet mit Klasse plus Fach, nicht mit einem überladenen Kursplaner.

## 2. Navigation und Alltag der Lehrkraft

| Bereich | Standardansicht | Hauptaktionen |
|---|---|---|
| Meine Tests | Bestehender Testbestand mit bisheriger Suche/Filtern; ergänzende Schuljahr-/Klassen-/Fachfilter nur optional | Erstellen, Bearbeiten, Auswerten wie bisher; zusätzlich „Zuweisen“ |
| Klassen | Nur berechtigte Klassen im aktuellen Schuljahr; Suche, Archivfilter | Klasse öffnen; je Recht Klasse anlegen, Import starten |
| Schüler:innen | Berechtigte Personen mit Alias, Klasse, Status und Zugangsstatus | Suchen/Filtern; manuell hinzufügen; Klassenzuordnung; Zugang verwalten |
| Schulverwaltung | Nur bei Verwaltungsrecht; keine zusätzliche Hauptnavigation für alle | Personen/Rollen, Importe, Schuljahre, Quellen, Schlüsselstatus, Verlauf |

Die Schulauswahl erscheint nur, wenn tatsächlich mehrere Schulzugehörigkeiten existieren. Ohne eingerichtete Schule bleiben die vorhandenen Tests vollständig nutzbar. Der Leerzustand erklärt die Einrichtung und erfindet keine Klassen aus den bisherigen Testlabels. Die bisherige Labelgruppierung wird eindeutig als Testgruppierung kenntlich gemacht, bis eine Verwaltung sie ausdrücklich einer echten Klasse zuordnet.

Eine Klasse öffnet eine verständliche Detailansicht mit Reitern **Tests**, **Schüler:innen**, **Fächer & Lehrkräfte**, **Einstellungen**. Fachlehrkräfte landen bei ihren Tests/Fächern. Verwaltung kann den Mitgliederbestand bearbeiten, erhält dadurch aber nicht pauschal Zugriff auf alle Prüfungsergebnisse.

Unter Tests einer Klasse stehen **geplant**, **verfügbar**, **abgeschlossen**; Entwürfe bleiben im persönlichen Testbestand, solange sie nicht zugewiesen wurden. Es wird stets zwischen „Testvorlage bearbeiten“ und „Zuweisung verwalten“ unterschieden. Derselbe Test kann mehrere Zuweisungen besitzen, ohne mehrfach im ursprünglichen Testbestand angelegt zu werden.

Leere Zustände enthalten genau den nächsten sinnvollen Schritt. Laden, keine Berechtigung, Fehler und tatsächlich leer sind verschiedene Zustände. Listen sind paginiert (Vorschlag: 50 Zeilen je Seite), Filter bleiben pro Ansicht erhalten, Account-/Schulwechsel löscht vorherige Daten und sensible flüchtige Zuordnungen. Auf Mobilgeräten klappt die bestehende Seitennavigation ein; Tastatur, Fokus, Dialogbeschriftung und deutsch/englische Texte gehören zur Abnahme.

## 3. Funktionsumfang für Schüler:innen

| Funktion | Verhalten in V1 | Berechtigung |
|---|---|---|
| Manuell hinzufügen | Einzelperson oder kleine Mehrfachanlage; Klasse/Fachgruppe wählen; serverseitig zufällige Identität und Alias erzeugen | Schulverwaltung oder ausdrücklich delegiertes Schülerverwaltungsrecht im Scope |
| Namen bei manueller Eingabe | Optional nur zur lokalen Zuordnung; kein verpflichtendes Klarnamensfeld im Cloudkonto | Nur im freigegebenen schulischen Verfahren |
| Alias ändern | Namensunabhängiger Alias, lokaler Eindeutigkeitscheck im sichtbaren Kontext; ID bleibt gleich | Berechtigter Verwaltungs-/Klassenpflegescope |
| Person bearbeiten | Status und zulässige Membership-/Zuordnungsdaten ändern; keine freie Cloud-Personenakte | Feld- und Scopeprüfung am Server |
| Klasse zuweisen/wechseln | Jahresmitgliedschaft mit Wirksamkeitsdatum, Vorschau zu betroffenen künftigen Tests | Berechtigte Verwaltung |
| Weitere Fachgruppe | Dieselbe Identität, weitere zulässige Gruppenmitgliedschaft; kein zweites Schülerkonto | Berechtigte Verwaltung |
| Zugang erstmals ausgeben | Persönlichen Code einmal anzeigen, drucken oder als QR verteilen | Berechtigte zuständige Person; keine Sammeloffenlegung vorhandener Codes |
| Zugang zurücksetzen | Warnung, neuer Code, alte Codeversion und zugehörige Sitzung unwirksam | Berechtigte Person; protokollierte Mutation |
| Sperren/entsperren | Zugang sperren ohne Ergebnisse zu löschen; Wirkung bei nächster geschützter Anfrage | Berechtigte Verwaltung |
| Abgang/Archiv | Ende der aktiven Zugehörigkeit mit Datum; keine automatische Löschung historischer Ergebnisse | Schulverwaltung |
| Wiederaufnahme | Bestehende schulische Identität reaktivieren, neue Jahresmitgliedschaft | Schulverwaltung mit geprüfter Identitätszuordnung |
| Löschen | Getrennter, erklärter Löschprozess mit Prüfung gebundener Nachweise und schulischer Fristen | Spezifisches Löschrecht, niemals normaler Importnebeneffekt |
| Später an ASV anbinden | Verwaltung bestätigt ausdrücklich den Link zum bestehenden manuellen Konto; ID/Code/Verlauf bleiben erhalten | Importverwaltung; konfliktfeste Transaktion |

Manuelle Anlage braucht keine ASV-Datei. Bei fehlender bestätigter Quellkennung kennzeichnet die Oberfläche „Manuell angelegt – noch nicht mit ASV verknüpft“. Ein späterer Import darf eine manuell angelegte Person nicht anhand ihres Namens automatisch erkennen. Die Vorschau bietet einen ausdrücklich zu bestätigenden Verknüpfungsschritt an; alternativ bleibt die Zeile bis zur Klärung blockiert. Ein vollautomatischer Import kann ohne solche Zuordnung nicht garantieren, manuelle Dubletten zu vermeiden.

Die Schülerdetailansicht zeigt berechtigten Personen Alias, aktive und vergangene Mitgliedschaften, Fachgruppen, aktuellen Zugangsstatus, zugewiesene Tests und sachlichen Änderungsverlauf. Keine unnötigen Felder wie Adresse, Geburtstag, Elternkontakte oder Gesundheitsdaten.

Massenaktionen sind zunächst Klassenzuweisung, Archivierung und Ausgabe neuer Zugangskarten. Immer erst Auswahl und Wirkungsübersicht, dann ausdrückliches Bestätigen. Fehlgeschlagene Zeilen erscheinen mit Grund; keine verdeckte Teilwirkung.

## 4. Klassen, Schuljahre und Fächer

Klassen werden mit stabiler interner ID, Schuljahr, Anzeigename und Status angelegt. Klassenname ist änderbar, ID nicht. Zwei verschiedene Schuljahre dürfen jeweils eine „9b“ besitzen. Aktive doppelte Namen innerhalb derselben Schule/Jahresgruppe werden bei Anlage als Konflikt geprüft, nicht still zusammengeführt.

V1 bietet: Klasse erstellen, umbenennen, Mitglieder pflegen, Fachunterricht zuordnen, Fachlehrkraft hinzufügen/ersetzen, archivieren und leere irrtümliche Klasse entfernen. Eine Klasse mit zugewiesenen Prüfungen wird archiviert statt über eine allgemeine Löschschaltfläche mitsamt Historie entfernt. Mitgliederaustritt löscht keine Schüleridentität.

Fächer sind schulische Katalogeinträge mit stabiler ID und änderbarem Namen; Freitext aus alten Tests erhält keine automatische Rechtewirkung. Beispiel: 9b hat Technik mit Lehrkraft A und Englisch mit Lehrkraft B. Beide nutzen dieselben Schülerkonten. A erhält ihren Unterrichts-/Prüfungsscope, nicht automatisch Bs Entwürfe oder Ergebnisse. Teamteaching ist eine zusätzliche explizite Zuständigkeit im betreffenden Unterricht. Vertretung bekommt Beginn/Ende und die konkret benötigten Rechte.

Klassenleitung ist eine eigene Rolle für vereinbarte organisatorische Pflege, keine pauschale Ergebnisfreigabe für alle Fächer. Klassen- und Fachsicht verwenden denselben Mitgliederbestand mit zulässigen Teilgruppen. Kursmitgliedschaft und Stammklasse sind getrennt; eine zusätzliche Gruppe erzeugt keinen zweiten Schüler.

## 5. Schule, Personal und Lehrerwechsel

Die Schule hat einen verifizierten Verwaltungsbereich. Mehrere benannte Personen können mit ihren jeweils eigenen normalen Konten die Verwaltung übernehmen. Mindestens Hauptzuständigkeit und Stellvertretung werden empfohlen. Eine Person darf sich weder durch freie Eingabe einer Schulnummer noch durch einen Personaleintrag aus ASV selbst zur offiziellen Verwaltung erklären. Bootstrap/Verifikation wird als Betreiber-/Schulprozess dokumentiert; lokaler Emulator nutzt ausdrücklich synthetische Schulen.

Rechte werden als serverseitige Mitgliedschaften und Scopes vergeben: Schulverwaltung, Importverwaltung, Lehrkraft mit Klasse/Fach, zeitlich begrenzte Vertretung und optional delegierte Schülerpflege. Der letzte aktive Schuladministrator darf sich nicht ohne bestätigte Nachfolge entfernen. Die Rolle „Verwaltung“ beinhaltet organisatorische Verwaltung; Zugriff auf Ergebnisse und Schulschlüssel sind zusätzliche getrennte Berechtigungen.

Lehrerimport darf Personalreferenzen und geplante Unterrichtszuordnungen vorbereiten. Eine ASV-Zeile ist kein Login und kein Beweis, dass ein bestehendes GradeCrew-Konto dieser Person gehört. Einladung/Bestätigung und schulische Verifikation verknüpfen das vorhandene Konto. Kein neuer Lehreraccount pro Schuljahr, kein Namens-/E-Mail-Matching mit automatischer Rechtevergabe, keine automatische Adminrolle aus CSV. Reale E-Mail-Versendungen werden nicht ohne passenden Auftrag ausgelöst; V1 kann bestätigte Einladungslinks verwenden.

**Lehrerwechsel:** Verwaltung wählt Unterricht, Nachfolge, Wirksamkeitsdatum und zulässige Übergabe. Schülerkonten und Mitgliedschaften bleiben bestehen. Endende Zuständigkeiten sperren neue Zugriffe; laufende Prüfungsaufsicht wird ausdrücklich übergeben. Persönliche Entwürfe bleiben beim bisherigen Autor. Ausgewählte Unterrichtszuweisungen und die benötigte Auswertung dürfen nach expliziter Freigabe an eine Nachfolge übergeben werden. Dafür werden Assignment-/Resultsrechte serverseitig geprüft; es gibt keine breite Lockerung des vorhandenen `quizzes.ownerUid`-Schutzes. Private Fragen/Lösungen werden nicht über eine Klassenleseberechtigung veröffentlicht.

## 6. ASV-/CSV-Import als verständlicher Ablauf

Der Import ist ein geführter Dialog im vorhandenen Arbeitsbereich:

1. **Ziel wählen:** Schule, Schuljahr, Schüler-/Personal-/Unterrichtsdatei und betroffene Klassen. „Teilbestand“ ist Standard; vollständiger Schulbestand muss ausdrücklich gewählt werden.
2. **Datei lokal öffnen:** Dateigröße/Zeilenlimit prüfen, Encoding auswählen/erkennen, Trennzeichen und Kopfzeile bestätigen. CSV und bestehendes zehnspaltiges Pipeprofil ohne Kopfzeile berücksichtigen. Keine erste Datenzeile verlieren.
3. **Spalten zuordnen:** stabile Schülerkennung, Klasse, optional Vor-/Nachname nur für lokale Anzeige. Weitere Felder ignorieren. Kennungen bleiben Text einschließlich führender Nullen. Ein unbekanntes Feld „ID“ wird nicht als bestätigtes ASV-Differenzierungsmerkmal akzeptiert.
4. **Quelle/Schlüssel prüfen:** registrierter schulischer Quell-Namensraum, Schlüsselversion und Prüftag müssen passen. Falscher Schlüssel stoppt, statt alle Schüler neu anzulegen.
5. **Lokal validieren:** fehlende IDs, leere Klasse, widersprüchliche Dubletten, mehrere Stammklassen, kaputte Quotes/Encoding und unbekannte Zuordnungen mit Zeilennummer erklären. Namensdaten verlassen den Dialog nicht.
6. **Pseudonymisierten Plan prüfen:** lokal HMAC-Abgleichwerte berechnen; Backend ermittelt nur daraus neue/bestehende Identitäten, Membershipänderungen und Konflikte. Namensdarstellung fügt ausschließlich der lokale Client hinzu.
7. **Änderungen ansehen:** getrennte Gruppen „unverändert“, „neu“, „Klassenwechsel“, „zu prüfen“, „im Vollbestand nicht mehr enthalten“. Manuell angelegte Konten ausdrücklich verknüpfen; keine unscharfe Namensautomatik.
8. **Bestätigen:** Anzahl und Wirkungsdatum sichtbar, Warnungen geklärt, aktuelle Bestandsrevision geprüft. Neuerliche Klicks verwenden dieselbe Idempotenzkennung.
9. **Übernehmen und Ergebnis anzeigen:** vollständiger Auftrag oder erklärter Abbruch; bei großen Importen sichtbarer Fortschritt und wiederaufnehmbarer Auftrag. Keine halbfertige aktive Klassenliste.
10. **Aufräumen:** transiente Datei-/Namensdaten und Schlüssel aus dem Anwendungszustand entfernen. Im Backend bleiben nur pseudonyme Änderungen und der minimale Vorgangsbeleg.

Das tatsächliche Exportprofil ist noch nicht fachlich bestätigt. Vorliegende Strukturhinweise (zehn Pipefelder, keine Kopfzeile) belegen die Bedeutung einer möglichen ID-Spalte nicht. Benötigt wird vor echtem ASV-Abgleich die Bestätigung des Exportprofils durch die Schule/ASV-Verantwortlichen, möglichst mit Feldbeschreibung und erfundenem Beispiel. Keine echten Schülerlisten im Repository oder Chat speichern.

**Abgleichregeln:** Gleiche Schule + Quelle + stabiler Personenbezug → gleiche Identität, unabhängig von Klassenname, Schuljahr, Namensänderung oder Lehrkraft. Unbekannter Bezug → erst prüfen/neue Identität. Fehlender Datensatz im Teilimport → keine Änderung. Fehlender Datensatz im bestätigten Vollbestand → Abgangskandidat, nicht sofort löschen. Rückkehr → dieselbe Identität, sofern der verifizierte Bezug vorliegt. Schulwechsel → V1 getrennte Schulidentität.

Manuelle Korrekturen tragen Herkunft, Feld, Wirksamkeitsdatum und Revision. Ein Folgeimport zeigt widersprechende Änderungen als Konflikt. Er überschreibt weder Verwaltungsentscheidungen noch Unterrichtsrechte still. Wiederholter identischer Import erzeugt keine neuen Personen, Codes oder Mitgliedschaften. Fehlerberichte enthalten Zeilen-/Fehlercodes; Exporte schützen gegen Tabellenformeln und enthalten standardmäßig keine Rohdaten.

## 7. Identität, Klarnamen und Schulschlüssel

Vier getrennte Elemente bleiben verbindlich:

| Element | Zweck | Ändert sich beim normalen Jahreswechsel? |
|---|---|---|
| Bestätigte ASV-Quellkennung | Wiedererkennung innerhalb der schulischen Quelle | Nein, sofern das bestätigte Quellenmerkmal diesen Vertrag erfüllt |
| Zufällige GradeCrew-Schüler-ID | Konto, Mitgliedschaften, Verlauf | Nein |
| Namensunabhängiger Alias | Verständliche pseudonyme Anzeige | Darf sich ändern |
| Geheimer persönlicher Code | Anmeldung | Nein; nur bei gezieltem Ersatz/Sperre |

Der Client verwendet das vorhandene Zielmodell: `HMAC-SHA256(Kschool, UTF8(JSON.stringify(["gradecrew-asv-match-v1", schoolId, sourceNamespace, stableSourceId])))`. Schlüsselprüfung nutzt getrennte Domain `gradecrew-asv-keycheck-v1` mit `schoolId` und `keyId`. Für Lehrkräfte eine getrennte Domain `gradecrew-asv-teacher-match-v1`; pupil/teacher-Domains niemals vermischen. Vollständigen Digest verwenden. Der Server erhält Digest, Namensraum und Schlüsselversion, niemals Roh-ID oder Schlüssel. Schuljahr/Klasse gehören nicht in den Identitäts-HMAC.

**V1-Schlüsselorganisation:** Eine benannte Verwaltung und Stellvertretung verwahren den zufälligen 256-Bit-Schulschlüssel in einem von der Schule freigegebenen externen verschlüsselten Tresor. Der Importclient bekommt entschlüsseltes Material ausschließlich für die Arbeitssitzung und hält es nur im RAM. Kein eingebauter gemeinsamer Schlüssel, kein Browser-`localStorage`, kein Schlüssel im Lehrerprofil. Rollenvergabe in GradeCrew ersetzt den Tresorzugang nicht. Der konkrete freigegebene Dienst, Entsperrweg und Backupverantwortliche werden für die Pilotschule vor Echtdatenimport dokumentiert; wir bauen in V1 keinen eigenen Passwortmanager.

**Wiederherstellung:** Backup enthält Schul-ID, Quellenregister, Schlüssel-ID/-version und den geschützt verwahrten Schlüssel. Entsperrgeheimnis getrennt sichern. Eine Stellvertretung muss auf einem zweiten zugelassenen Gerät den Schlüssel wiederherstellen und denselben pseudonymen Prüftag erzeugen können. Kein Schlüsselverlust-Button darf einen zweiten Schülerbestand erzeugen. Bei Verlust stoppen Quellimporte; vorhandene pseudonyme Konten bleiben bestehen. Rotation benötigt einen kontrollierten, verifizierten Alt-/Neu-Abgleich; kein automatisches Neuanlegen. Schlüsselinhabern kann man ein bekanntes Geheimnis nicht nachträglich „wegnehmen“: Personalabgang mit Schlüsselkenntnis verlangt eine dokumentierte Rotation/Migrationsentscheidung.

**Wie Lehrkräfte Namen sehen:** GradeCrew funktioniert immer mit Alias und interner ID. Benötigt eine berechtigte Lehrkraft Namen, öffnet sie eine schulisch bereitgestellte, auf ihre Klassen beschränkte Zuordnung lokal. Diese verknüpft `studentIdentityId → Name` im Browser und wird beim Sperren/Logout verworfen. Schulische Zuordnungsdateien und historische namentliche Nachweise werden außerhalb GradeCrew geschützt aufbewahrt. Ohne passende Datei zeigt die Oberfläche ehrlich Aliase; ein neues Gerät kann Namen nicht aus einem Serverbestand herbeizaubern. Namenslisten werden nicht ungeschützt als Standarddownload verteilt. Ein komfortabler schulischer Cloudtresor wäre ein späterer eigener Datenschutz-/Betriebsentscheid, keine stille Erweiterung dieses Plans.

Das ist der bewusste Bedienaufwand für die gewählte Minimierung. Die konkrete Schule muss dieses Verfahren tatsächlich betreiben können. Bis das bestätigt ist: vollständige Entwicklung mit synthetischen Daten und manuell pseudonymen Konten, kein freigeschalteter realer ASV-Abgleich.

## 8. Persönliche Schülerzugänge und Schüleransicht

Schüler:innen benötigen keine E-Mail und kein eigenes klassisches Passwort. Bei Kontoanlage oder gezielter Neuausgabe wird ein zufälliges Geheimnis mit mindestens 128 Bit Entropie erzeugt, als QR und lesbarer gruppierter Code dargestellt (z.B. 26 Zeichen aus einem eindeutigen Base32-Alphabet). Der endgültige Druck-/Eingabeentwurf muss auf iPad und Papier lesbar geprüft werden. Kein 4-stelliger Alias als Anmeldegeheimnis.

Der Server speichert nur einen nicht rückrechenbaren Credential-Prüfwert und die Version. Der Klartext wird ausschließlich bei Neuausgabe über eine geschützte Antwort zur Ausgabe angezeigt; vorhandene Codes können nicht später gesammelt ausgelesen werden. Verloren bedeutet gezielt neu erzeugen. Karten enthalten Alias/Klassenkontext und den geheimen Code/QR, keine rohe ASV-ID. Druck-/Downloadansicht verschwindet nach Abschluss; Drucker und schulische Ausgabe bleiben organisatorisch geschützt.

Codeeingabe tauscht das Geheimnis gegen eine Firebase-Schülersitzung in einer **separaten benannten Firebase-App**. Anmeldung als Schüler darf die normale Lehreranmeldung desselben Browsers nicht ersetzen. Server prüft bei jeder geschützten Aktion aktive Schulzugehörigkeit, Kontostatus und aktuelle Credentialversion; langlebige Tokenclaims allein genügen nicht für sofortigen Rechteentzug. Serverautorität und Credentialbindung ergänzen die vorhandene Attempttokenprüfung, sie ersetzen sie nicht. Rate Limits, einheitliche Fehlermeldungen ohne Kontoauskunft und Sperren gegen systematisches Ausprobieren gehören dazu.

Geheime Codes nicht in Queryparametern/Logs/Analytics führen. QR-Geheimnis gegebenenfalls im URL-Fragment verarbeiten und sofort aus der Adressleiste entfernen; zuvor darf kein Telemetriepfad den Code erfassen. V1 merkt Schülersitzungen auf gemeinsam genutzten Geräten nicht ungefragt dauerhaft; „Abmelden/Gerät freigeben“ ist sichtbar.

Die persönliche Startseite zeigt **Jetzt verfügbar**, **Demnächst**, **Erledigt**. Fachfilter entstehen aus Unterrichtszuordnungen, nicht aus dem Erstellen eines privaten Lehrkrafttests. Eine neue Klasse kann leer sein. Erst wenn eine berechtigte Techniklehrkraft einen Test ausdrücklich für Klasse/Fach oder einzelne Empfänger veröffentlicht und zuweist, erscheint er bei diesen Schüler:innen unter Technik. Entwürfe, fremde Fächer und nur für die Lehrkraft gedachte Vorlagen erscheinen nicht. Ein eingerichtetes Fach ohne Tests kann einen kleinen Leerhinweis haben; keine 20 leeren Fachkacheln.

Teststatus, Startzeit, Frist und Abgabezustand werden verständlich angezeigt. Ergebnisse und Lösungen sind getrennte serverseitige Freigaben. Schüler sehen nur ihre eigenen Daten; weder Klassenliste noch fremde Aliase, Empfängerlisten oder Ranglisten.

## 9. Tests zuweisen und bestehende Prüfung weiterverwenden

„Zuweisen“ ergänzt den bestehenden Ablauf: eigenen Test auswählen → Schule/Klasse/Fach → alle oder einzelne aktive Mitglieder → Start/Ende und Freigabeoptionen → Empfängerübersicht → bestätigen. Nicht veröffentlichte Tests werden über den bestehenden Veröffentlichungsvertrag bereitgestellt; private Fragen/Lösungen werden nicht aus dem Classroom-Modul veröffentlicht.

Die Zuweisung bindet feste `quizId`, `sessionRunId`, fachliche Zuständigkeit und einen Empfängersnapshot. Ein Quiz kann mehrere Zuweisungen besitzen. Nachträglicher Klassenzugang nimmt keine Person automatisch in ältere Snapshots auf; „Empfänger ergänzen“ ist eine ausdrückliche, protokollierte Aktion. Ende einer aktuellen Berechtigung verhindert neue Starts, löscht aber keine historische Abgabe. V1-Policy: Ein normaler Klassen-/Lehrkraftwechsel beendet einen bereits legitim gestarteten Versuch nicht; er darf innerhalb seines ursprünglichen Prüfungsfensters nach dem bestehenden Attemptvertrag beendet werden. Eine ausdrückliche Kontosperre oder Credentialrotation sperrt dagegen auch geschützte Fortsetzung/Abgabe über die alte Schülersitzung. Bereits serverseitig gespeicherte Daten bleiben erhalten; eine berechtigte Fortsetzung nach neuer Anmeldung bindet denselben Versuch ausdrücklich wieder an dieselbe Identität. Kein Umgehen der Sperre allein mit einem alten Attempttoken.

`startAssessmentAttempt`, `resumeAssessmentAttempt`, `submitAssessmentAttempt` und `getAssessmentReceipt` im bestehenden `secure-lifecycle.js` erhalten bei Classroomversuchen serverseitige Bindung an Schüleridentität, Zuweisung und Run. Der Server entnimmt die Identität dem geprüften Schülertoken, nicht einer frei übermittelten `studentIdentityId`. Auch fremde `assignmentId`, alte Runs, wiederverwendete Attempttokens und widerrufene Codes werden negativ geprüft. Bestehender Gast-/Testcodevertrag bleibt verfügbar; sein Zulässigkeitsmodell muss je Veröffentlichung eindeutig sein. Eine als ausschließlich zugewiesen markierte Prüfung darf nicht durch Weglassen der Assignment-ID zum Gastversuch werden. Bestehende Tests werden nicht still auf exklusiven Classroommodus umgestellt.

Bei Wiederveröffentlichung mit neuem Run wird eine neue/angepasste Zuweisung ausdrücklich bestätigt. Alte Zuordnungen werden nicht auf den neuen Run umgebogen. Ergebnisse bleiben derselben Schüleridentität und dem damaligen Unterrichtskontext zugeordnet. Nachfolge-/Vertretungszugriff erfolgt über einen neuen eingeschränkten serverseitigen Ergebnispfad, nicht über beliebiges Lesen privater Quizdokumente.

## 10. Schuljahreswechsel, Austritt und Fehlerkorrektur

Schulverwaltung eröffnet ein neues Schuljahr und lädt den bestätigten Bestand oder wählt einen kontrollierten manuellen Wechsel. Vorschau zeigt Fortführungen, neue Schüler:innen, Klassenwechsel, Wiederholer:innen, Rückkehr und Abgangskandidaten. Keine pauschale Annahme „9b wird 10b“; die tatsächliche Zuordnung ist maßgeblich.

Identität und persönlicher Code bleiben erhalten, neue Jahresmitgliedschaften entstehen. Vergangenes Jahr, Klassen, Prüfungssnapshots und Ergebnisse bleiben historisch lesbar nach Berechtigung. Noch fehlende neue Jahresmitgliedschaft bedeutet nicht automatisch, dass eine Person die Schule verlassen hat. Ein Jahreswechsel hat ein bestätigtes Wirksamkeitsdatum und kann vorab vorbereitet werden.

Fehlzuordnung wird durch eine neue, nachvollziehbare Korrektur mit Revision berichtigt. Automatisches Zusammenführen zweier Schüleridentitäten ist nicht Teil des Standardimports. Versehentliche Dubletten erhalten zunächst eine Prüfung/Sperre; bestätigte Zusammenführung ist ein eigener administrativer Vorgang mit Analyse von Codes, Attempts und Ergebnisverläufen, gegebenenfalls späterer Ausbau.

Ein Import erhält keinen pauschalen „Alles rückgängig“-Knopf, der spätere Prüfungsdaten zerstört. Vor Aktivierung kann ein Auftrag abgebrochen werden; nach Aktivierung werden unterstützte Mitgliedschaftsänderungen über eine neue Gegenbuchung korrigiert. Schon gestartete/abgegebene Prüfungen und ausgegebene Zugangscodes werden nicht rückdatiert oder wiederhergestellt.

## 11. Persistentes Datenmodell und Schnittstellen

Die folgenden Namen sind der geplante Vertrag; vor Implementierung mit aktuellen Zielbranch-Schemas abgleichen. Pseudonyme Verwaltungsdaten liegen unter einem Schulmandanten. Keine Klarnamenfelder in den Cloud-Dokumenten.

| Pfad | Inhalt / zentrale Grenze |
|---|---|
| `schools/{schoolId}` | Status, aktives Schuljahr, Bestandsrevision, aktiver Datensatzstand; keine Schulgeheimnisse |
| `schools/{schoolId}/staff/{uid}` | verifizierte Mitgliedschaft, organisatorische Rollen, Status/Revision; UID aus Auth |
| `schools/{schoolId}/years/{yearId}` | Zeitraum, Status, Wirksamkeit |
| `schools/{schoolId}/classes/{classId}` | yearId, Anzeigename, Status |
| `schools/{schoolId}/subjects/{subjectId}` | schulischer Fachkatalog |
| `schools/{schoolId}/courses/{courseId}` | yearId, subjectId, classIds; Unterricht/Fachgruppe |
| `schools/{schoolId}/teacherGrants/{grantId}` | UID, courseId, explizite Fähigkeiten und Gültigkeitszeitraum |
| `schools/{schoolId}/students/{studentId}` | zufällige schulische Identität, Status, Credentialversion; keine Roh-ASV-ID/Namen |
| `schools/{schoolId}/memberships/{membershipId}` | studentId, yearId, classId/courseId, Alias, Beginn/Ende, Herkunft/Revision |
| `schools/{schoolId}/identityMatches/{matchId}` | Quelle/keyId/HMAC → studentId; serverprivat und eindeutig |
| `schools/{schoolId}/credentialPrivate/{credentialId}` | Codeprüfwert/Version, Bindung, Rate-Limit-/Widerrufdaten; serverprivat |
| `schools/{schoolId}/imports/{importId}` | Vorschau-/Auftragsstatus, Revision, Planfingerprint, pseudonyme Zählwerte |
| `schools/{schoolId}/importChunks/{chunkId}` | begrenzte pseudonyme Stagingblöcke, nur serverseitig sichtbar, kurzlebig |
| `schools/{schoolId}/audit/{eventId}` | Akteur-ID, Aktion, betroffene IDs, Zeitpunkt, Revision; keine Rohdatei/Secrets |
| `assessmentAssignments/{assignmentId}` | schoolId, courseId, quizId, sessionRunId, Zeitraum/Policy; kein Lösungsschlüssel |
| `assessmentAssignments/{assignmentId}/recipients/{studentId}` | serverautorisierter Snapshot/Ergänzung; keine ganze Klasse im einzelnen übergroßen Dokument |

Nicht jede Rolle darf diese Dokumente direkt lesen. V1 bevorzugt paginierte Callable-Projektionen für Classroomdaten; direkte Clientwrites sind verboten. Bestehende Regeln für eigene Lehrerprofile und Quizdokumente bleiben unverändert. Neue Privatpfade sind ausdrücklich gesperrt. Firestore Admin SDK umgeht Rules; deshalb muss jede Function vor Datenzugriff Identität, Schule, Scope und Feldrechte prüfen. Neue Queries/Indexes werden gemeinsam mit den Zugriffstests definiert.

Geplante Callable-Verträge (Version `1`, kleine Allowlist statt beliebigem Schreibpfad):

- `getClassroomWorkspace({schoolId, yearId, pageSize, cursor}) → {revision, capabilities, classes, nextCursor}`.
- `listClassroomStudents({schoolId, classId?, courseId?, yearId, status, cursor, pageSize}) → {revision, students, nextCursor}`; Filter können Rechte nicht erweitern, keine Namenssuche am Server.
- `mutateClassroom({schoolId, expectedRevision, operationId, command, payload}) → {revision, changedIds}`. Geschlossene Commands für Anlage/Pflege von Klasse, Schüler, Membership, Fach, Grant, Status; jede Operation eigene Validierung. UID/Adminrechte nie aus payload übernehmen.
- `previewClassroomImport({schoolId, sourceNamespace, keyId, keyCheck, yearId, mode, scopeIds, expectedRevision, operationId, pseudonymousRows}) → {importId, revision, planHash, counts, conflicts}`. Keine Rohfelder erlaubt; große Pläne gestückelt unter einem Importauftrag.
- `commitClassroomImport({schoolId, importId, expectedRevision, planHash, operationId}) → {status, revision}`; Statusabfrage über `getClassroomImport({schoolId, importId})`.
- `issueClassroomStudentCode({schoolId, studentId, expectedVersion, operationId}) → {code, credentialVersion}`; Antwort einmalig, Wiederholungen erzeugen nicht unbemerkt weitere Codes. Geht die Antwort verloren, Status prüfen und ausdrücklich neu ausgeben; Klartext nicht serverseitig für Retry speichern.
- `exchangeClassroomStudentCode({code}) → {customToken}`; generische Fehler, keine öffentlichen Personeninformationen.
- `listStudentAssignments({cursor, pageSize}) → {items, nextCursor}`; Identität kommt ausschließlich aus der Schülersitzung.
- `assignClassroomAssessment({schoolId, courseId, quizId, sessionRunId, recipientIds, startsAt, endsAt, accessMode, operationId}) → {assignmentId, revision}`.
- `getClassroomResults({schoolId, assignmentId, cursor, pageSize}) → eingeschränkte Ergebnisprojektion`; aktuelle und historische Ergebnisberechtigung ausdrücklich prüfen.

Clients behandeln `unauthenticated`, `permission-denied`, `failed-precondition`, `aborted` und wiederaufnehmbare Verbindungsfehler unterschiedlich. Mutationen haben Idempotenzkennung und Bestandsrevision. Serverantworten begrenzen Umfang und wiederholen keine privaten Eingabedaten im Fehlertext.

## 12. Importtransaktionen, Gleichzeitigkeit und Betrieb

Ein passender HMAC-Indexeintrag gehört atomar genau einer Identität. Zwei parallele Erstanlagen müssen dieselbe Identität zurückgeben oder einen Konflikt zeigen. Zwei Verwaltungsgeräte können nicht dieselbe alte Vorschau unabhängig aktivieren: Revision/Planfingerprint und ein begrenzter Importlease verhindern verlorene Änderungen.

Große Schulimporte werden nicht als vermeintlich unbegrenzt große Firestore-Transaktion geplant. Stagingchunks werden vollständig validiert und mit einem versionierten Bestand/Delta vorbereitet. Eine kleine finale Transaktion wechselt den aktiven Import-/Bestandsstand mit Revisionsvergleich. Alle zugehörigen Leseprojektionen und Autorisierungsprüfungen respektieren denselben Aktivierungsstand; ein Marker ohne diese konsequente Leselogik ist keine atomare Aktivierung. Historische Schüler- und Assignment-IDs bleiben dabei stabil.

Abbruch/Timeout lässt den bisher aktiven Bestand unverändert. Wiederholung verwendet denselben Auftrag; Server gibt bestehenden Status zurück. Verwaiste Stagingdaten werden nach definierter technischer Frist entfernt. Importfehler nach Aktivierung werden als gezielte neue Revision korrigiert; keine globale Datenbankwiederherstellung wegen einer einzelnen falschen Klassenliste.

Backend-Backup und schulischer Schlüssel-/Zuordnungsbackup sind zwei getrennte Wiederherstellungen. Vor Schuleinsatz beide praktisch prüfen. Monitoring zählt technische Fehler und Vorgangsstatus ohne CSV, Code, Namen oder Roh-ID. Logs-/Audit-/Importaufbewahrung wird zweckbezogen begrenzt. Konkrete schulrechtliche Aufbewahrungsfristen werden nach Schulart, Datenzweck und Verantwortlichen festgelegt; dieser technische Plan erfindet keine gesetzliche Frist.

## 13. Lokale Umsetzung und späteres dauerhaftes Testbackend

**Stufe A – Entwicklung:** Lokale vollständige Website behalten. Neue Classroom-Module, Functions und Rules zunächst in isolierten Emulatorprüfungen mit synthetischen Schulen/Personen testen. Bestehende normale Lehrerapp und deren vorhandener Testbestand bleiben im vorhandenen Backend. Emulatorauth ist ein eigener Testkontext; bestehende echte Lehrer-ID-Tokens werden nicht als Emulatoranmeldung ausgegeben und keine frei gesetzte UID als legitime Authentifizierung verwendet. Emulator-Export/-Import kann Testzustand über Neustarts erhalten, ist aber kein Nachweis dauerhaft veröffentlichter Schulverwaltung.

**Stufe B – derselbe echte Lehreraccount:** Nach fertiger Implementierung und Prüfungen wird eine genaue Backend-Änderungsliste für das vorhandene Testprojekt vorbereitet: neue Functions, additive Rules/Indexes, unveränderte vorhandene Quiz-/Authdaten, konkrete Code-SHA und Rücknahmeplan. Erst im dafür freigegebenen Backendrelease werden diese APIs veröffentlicht. Das Hosting bleibt unverändert; die Website zum Bedienen bleibt lokal auf Port8782. Diese Veröffentlichung ist noch nicht erfolgt und wird durch diesen Plan nicht ausgelöst.

**Stufe C – Nutzertest:** Derselbe normale Lehrerlogin ruft die neuen veröffentlichten Testbackend-APIs auf. Zunächst synthetische Schüler über tatsächliche Persistenz anlegen, neu laden, abmelden/anmelden und auf zweitem Browser prüfen. Dann CSV-Import, zweite Lehrkraft, Rechteentzug und Testzuweisung. Reale Schul-/ASV-Daten erst nach Quellen-, Rollen-, Schlüssel-/Recovery- und Datenschutzfreigabe der Schule. Keine automatische Productionübernahme.

Technisch wichtig: Eine reine zusätzliche lokale HTML-/JS-Seite kann keine neuen dauerhaften Cloudrechte und sicheren Serverfunktionen bereitstellen. Veröffentlicht werden später gegebenenfalls nur die konkret geprüften Backendteile; der Wunsch nach der lokalen Oberfläche wird dabei vollständig eingehalten.

## 14. Dateien und Zuständigkeiten der Umsetzung

| Datei / Modul | Geplante Änderung |
|---|---|
| `classroom/account-workspace.mjs` | vorhandene Sidebar/Views an paginierte Cloudprojektionen anschließen; Original-App-Port erhalten |
| `classroom/cloud-client.mjs` (neu) | authentifizierte Callables, Fehler-/Retryvertrag, keine eigene Rollenautorität |
| `classroom/contracts.mjs` (neu) | Versionen, command-Allowlist, DTO-Validierung ohne Firebase-Abhängigkeit |
| `classroom/identity.mjs` (neu) | flüchtiger HMAC-/Schlüsselcheck, keine Persistenz |
| `classroom/csv.mjs` | vorhandenen Parser erhalten, reale Profile/Validierung ergänzen |
| `classroom/import-controller.mjs` (neu) | Datei/Mapping/Vorschau/Bestätigung/Abbruch, lokale Datenlebensdauer |
| `classroom/student-management.mjs` (neu) | manuelle Anlage, Status, Memberships, Codes; bestehende Komponenten/Tokens |
| `classroom/class-management.mjs` (neu) | Klassen-/Fach-/Lehrkräfteansichten, Rechteprojektion |
| `classroom/student-session.mjs` (neu) | separater Firebase-App/Auth-Kontext, Codeexchange, Logout, Credentialversion |
| `classroom/student-workspace.mjs` (neu) | ausschließlich eigene Zuweisungsprojektion und bestehender Prüfungsstart |
| `classroom/i18n.mjs`, `classroom/classroom.css` | bestehende Sprachen/Tokens ergänzen; keine Umgestaltung der Hauptseite |
| `assessment-functions/lib/classroom-api.js` (neu) | Callablegrenze, DTO-/Authprüfung, geschlossene Commands, Projektionen |
| `assessment-functions/lib/classroom-access.js` (neu) | tenant-/scope-/zeitbezogene Autorisierung und Ergebnisscope |
| `assessment-functions/lib/classroom-store.js` (neu) | persistente Mutationen, Revisionen, eindeutige Indizes, aktive Importstände |
| `assessment-functions/lib/classroom-imports.js` (neu) | Vorschau, Lease, Chunkstaging, Aktivierung, Status/Abbruch |
| `assessment-functions/lib/classroom-credentials.js` (neu) | Codeausgabe/-prüfung/-widerruf, Studenttoken, Rate Limits |
| `assessment-functions/lib/classroom-assignments.js` (neu) | Audience/Runbindung, Ergebnisprojektion, Lifecycle-Autorisierung |
| `assessment-functions/main.js` | neue API explizit zusätzlich exportieren; `index.js` nicht als zweiten Kern nutzen |
| `assessment-functions/lib/secure-lifecycle.js` | bestehende Attempt-/Resume-/Submit-/Receiptpfade gezielt um Classroombindung erweitern |
| `firestore.secure-assessment.rules`, `firestore.indexes.json` | additive Sperren/qualifizierte Queries; bestehende Schutzregeln erhalten |
| `app.js`, `startup.js`, vorhandener Secure-Client | minimale Andockpunkte für Navigation/Zuweisung/Schülerstart, kein zweiter Editor |
| `classroom/*.test.mjs`, `assessment-functions/test/classroom-*.test.js` | gezielte Verhaltens-/Negativ-/Datenflusstests |
| `tools/classroom-preview/*` | lokale Seite erhalten, getrennte Testprofile/Browsernachweise statt heimlicher Demoauth |

Neue Module sind geplante Grenzen, keine Aufforderung zu leeren Gerüsten. Bestehende RAM-Repositories bleiben nur Demo-/Vertragsreferenz; ihre klientseitigen Rechteprüfungen werden nicht als Backend wiederverwendet. Dateiüberschneidungen mit Auth, Secure Assessment, i18n und Integrationsarbeit vor dem Codeabgleich koordinieren.

## 15. Ausführbare Arbeitspakete mit Prüfungen

Die Reihenfolge ist absichtlich: zuerst echte Persistenz und Rechte, dann komfortable Verwaltung, dann Import/Schülerprüfung. Jede Einheit endet mit nachvollziehbarem Checkpoint in derselben Übergabe. Neue Verhaltensprüfungen erst rot nachweisen, dann minimal umsetzen, dann gezielt grün prüfen. Keine Testsuite erneut starten, wenn nur diese Plandokumentation geändert wurde.

### Paket 1 – Bestehende App verbindlich schützen

**Dateien:** `classroom/account-workspace.test.mjs`, vorhandene Entry-/Auth-/Publishtests, `classroom/boundary.test.mjs` für den vorhandenen Serververtrag; Port in `app.js` nur bei notwendiger Erweiterung.
**Schnittstelle:** bestehender `GradeCrewAccountWorkspacePort` mit `getSession`, `listTests`, Originalnavigation; keine Authsubstitution.

- [ ] Regression für echte Rootauslieferung ohne Demo-SDK, gleiche Quiz-ID im Editor, Account-/Schulwechsel ohne fremde Restdaten schreiben.
- [ ] Fehlenden neuen Schulwechsel-/Capabilityfall rot nachweisen, vorhandene Erhaltungstests dürfen bereits grün sein.
- [ ] Nur erforderliche Port-/Testprofilergänzung umsetzen.
- [ ] `node --test classroom/*.test.mjs gradecrew-entry-bootstrap.test.mjs guest-tour-port.test.mjs practice-solution-publication.test.mjs secure-assessment-client.test.mjs`; alle Fälle müssen bestehen.
- [ ] Checkpoint mit Umfang und noch fehlendem Backend sichern.

### Paket 2 – Schulmandant, Rollen und sichere Datengrenze

**Dateien:** `classroom/contracts.mjs`, Backend `classroom-api.js`, `classroom-access.js`, `classroom-store.js`, `main.js`, Rules/Indexes, `assessment-functions/test/classroom-access.test.js`.
**Schnittstelle:** `getClassroomWorkspace` und `mutateClassroom`; Actor ausschließlich aus geprüfter Auth, Revision pro Schule.

- [ ] Tests `teacher_cannot_self_grant_admin`, `school_a_cannot_read_school_b`, `last_admin_requires_successor`, `unknown_command_and_fields_rejected`, `admin_cannot_read_all_results_implicitly` schreiben und rot ausführen.
- [ ] Verifizierte Membership-/Capabilityprüfung und serverprivate Collections implementieren.
- [ ] Bestehende Quizregeln unverändert gegen ihre vorhandenen Tests prüfen; neue Rules-negativfälle im qualifizierten Emulator ausführen.
- [ ] Backendtests über `node --test assessment-functions/test/classroom-access.test.js`; fehlende Emulatorruntime als tatsächlichen Blocker erfassen, nicht durch einen Mock als Rulesnachweis ersetzen.
- [ ] Isolierten Checkpoint sichern; kein Deploy.

### Paket 3 – Klassen und manuelle Schülerpflege dauerhaft

**Dateien:** Backend `classroom-store.js`, `classroom-api.js`; Frontend `cloud-client.mjs`, `student-management.mjs`, `class-management.mjs`, `account-workspace.mjs`; Tests `classroom-management.test.js` und `classroom/management.test.mjs`.
**Schnittstelle:** Commands `createClass`, `renameClass`, `archiveClass`, `createStudent`, `updateStudentStatus`, `setMembership`, `updateAlias`; alle mit `operationId/expectedRevision`.

- [ ] Tests für manuelle Person ohne Namen/ASV, Retry ohne Doppelanlage, Klassenwechsel mit gleicher studentId, leere/archivierte Klasse, gleiches Label in zwei Jahren schreiben und rot prüfen.
- [ ] Persistente Mutationen und paginierte Projektionen umsetzen; Alias und Account-ID trennen.
- [ ] UI mit verständlichen Leer-/Lade-/Fehlerzuständen anbinden; keine Schreibrechte aus ausgeblendeten Buttons ableiten.
- [ ] Beide genannten Tests ausführen; Neustart/Reload im Emulator mit exportiertem synthetischem Testbestand prüfen.
- [ ] Checkpoint; der echte Lehrerbackendanschluss folgt erst Paket12.

### Paket 4 – Identitätsabgleich und lokale Schlüsselgrenze

**Dateien:** `classroom/identity.mjs`, Backend `classroom-store.js`; `classroom/identity.test.mjs`, `assessment-functions/test/classroom-identity.test.js`.
**Schnittstelle:** `deriveMatchKey({key, schoolId, sourceNamespace, sourceId, domain})`, `deriveKeyCheck({key, schoolId, keyId})`; Backend eindeutiger Matchindex.

- [ ] Vektoren: führende Nullen bleiben; Klasse/Jahr haben keinen Einfluss; Schule/Quelle/Pupil-vs-Teacher-Domain ändern Digest; falscher keyCheck blockiert; zwei parallele Erstanlagen erzeugen eine Identität.
- [ ] Tests rot ausführen, standardisierte WebCrypto-HMAC-Verwendung und serverseitigen Index implementieren.
- [ ] Schlüssel im RAM halten und bei Dialogende/Logout Referenzen verwerfen; keine Garantie vollständiger physischer Speicherüberschreibung im Browser behaupten.
- [ ] Beide Testdateien grün prüfen; Requests/Storage/Logs mit synthetischem Canary auf Rohdaten prüfen.
- [ ] Checkpoint; operativen Tresor-/Recoverytest als separate Echtdatenvoraussetzung dokumentieren.

### Paket 5 – CSV-Dialog und verständliche Vorschau

**Dateien:** `classroom/csv.mjs`, `classroom/import-controller.mjs`, `classroom/i18n.mjs`, zugehörige Browser-/Parsertests.
**Schnittstelle:** Parser → lokale gemappte Zeilen → pseudonyme DTOs an `previewClassroomImport`; Namen bleiben lokale Projektion.

- [ ] Tests für UTF-8/BOM, gewähltes alternatives Encoding, Pipe ohne Header, leere Felder, Quotes, Mehrzeiler, Duplikate, fehlerhafte Zeilen, Grenzen und Abbruch schreiben.
- [ ] Neu fehlende Fälle rot zeigen; Parser/Profile/Mapping und Vorschau implementieren. Unbekannte ID-Semantik blockiert echtes ASV-Profil, nicht manuelle Pflege.
- [ ] Vor Upload Allowlist strikt prüfen; Dateiname/Namen/Roh-ID nicht mitsenden; Dateipickerabbruch und erneute Datei sauber behandeln.
- [ ] `node --test classroom/csv.test.mjs classroom/import-controller.test.mjs` und Browserfälle für Fehlerzeile/disabled Bestätigung/erneute Auswahl grün prüfen.
- [ ] Checkpoint ohne echte CSV-Dateien im Gitbaum.

### Paket 6 – Import übernehmen, wiederholen, abbrechen

**Dateien:** Backend `classroom-imports.js`, `classroom-store.js`, `classroom-api.js`; `assessment-functions/test/classroom-imports.test.js`.
**Schnittstelle:** Preview/Commit/Status gemäß Abschnitt11; `planHash`, Revision, Lease und aktive Generation sind serverautoritativ.

- [ ] Tests `same_import_is_idempotent`, `stale_preview_rejected`, `partial_missing_student_unchanged`, `full_missing_student_needs_review`, `manual_link_preserves_identity`, `conflicting_teacher_assignment_blocked`, `large_import_failure_keeps_old_active_view` schreiben.
- [ ] Zuerst rot, dann Chunk-/Aktivierungslogik sowie ausdrücklich bestätigte manuelle Identitätsverknüpfung umsetzen.
- [ ] Gleichzeitigkeits-/Prozessabbruchfälle an echten Emulatortransaktionen prüfen, nicht nur am RAM-Repository.
- [ ] `node --test assessment-functions/test/classroom-imports.test.js` plus Import-UI-Nachweis; Teilbestände dürfen zu keinem Zeitpunkt als aktiver Vollbestand erscheinen.
- [ ] Checkpoint und Wiederaufnahme-/Cleanupbeleg sichern.

### Paket 7 – Fachlehrkräfte, Vertretung und Personalwechsel

**Dateien:** Backend `classroom-access.js`, `classroom-store.js`; `classroom/class-management.mjs`; `assessment-functions/test/classroom-staff.test.js`.
**Schnittstelle:** Commands `createSubject`, `setCourse`, `inviteStaff`, `confirmStaffLink`, `setTeacherGrant`, `transferTeacherGrant`; feste Zeit-/Scopeprüfung.

- [ ] Zwei Fachlehrkräfte derselben Klasse, zusätzliche Teamlehrkraft, zukünftiger Wechsel, abgelaufene Vertretung, importiertes aber unbestätigtes Personal und letzte Adminperson negativ/positiv prüfen.
- [ ] Rot nachweisen, dann serverseitige Zuordnung und UI der Wirksamkeit/Übergabe implementieren.
- [ ] Private Entwürfe und Ergebnisrechte ausdrücklich getrennt halten; keine automatischen Account-/E-Mail-Abgleiche.
- [ ] Testdatei grün; Browser zeigt nur zulässige Fächer/Aktionen. Kein echter Mailversand.
- [ ] Checkpoint mit festgehaltener Übergabepolicy sichern.

### Paket 8 – Schülercodes und eigener Authkontext

**Dateien:** `classroom/student-session.mjs`, Backend `classroom-credentials.js`, `classroom-api.js`, Tests `classroom-credentials.test.js` und `classroom/student-session.test.mjs`.
**Schnittstelle:** Codeissue/exchange aus Abschnitt11; Student-Auth getrennt von bestehendem Lehrer-Auth.

- [ ] Tests für Einmalausgabe, parallelen Reset, verlorene Antwort, Ratelimit, generischen Fehler, Credentialversion und Lehrerlogin bleibt erhalten schreiben/rot ausführen.
- [ ] CSPRNG, Hashprüfung, Customtoken und aktuelle serverseitige Versionprüfung implementieren; keine Secrets in Audit oder URLs.
- [ ] Druck-/QR-Fluss, ungültiger Code, Logout und gemeinsam genutztes Gerät umsetzen.
- [ ] Tests grün sowie Request-/Storageprüfung mit synthetischen Codes; alte Sitzung darf geschützte Classroomaktionen nicht mehr ausführen.
- [ ] Checkpoint, keine echte Codeausgabe an reale Schüler.

### Paket 9 – Testzuweisung und berechtigte Ergebnisse

**Dateien:** Backend `classroom-assignments.js`, `classroom-api.js`, Frontend Zuweisungsdialog bei `account-workspace.mjs`/eigenem kleinen Modul; `assessment-functions/test/classroom-assignments.test.js`.
**Schnittstelle:** `assignClassroomAssessment`, `getClassroomResults`; Snapshot an unveränderte quizId/runId binden.

- [ ] Tests für eigenen vorhandenen Test, fremden privaten Test, Einzelzuweisung, späteres Mitglied, ausdrückliche Ergänzung, falsches Fach, neuen Run und Ergebnisscope der Nachfolge schreiben/rot prüfen.
- [ ] Berechtigungs-/Audiencevertrag umsetzen; Originalquiz weder kopieren noch Besitzer ändern.
- [ ] Bestehenden Publish-/Ergebnisablauf erhalten; Zusatzprojektion enthält keine privaten Lösungen vor Freigabe.
- [ ] Testdatei und bestehende Publish-/Solution-Regressionen grün prüfen.
- [ ] Checkpoint mit Beleg gleicher quizId in Bestand, Editor, Assignment und Ergebnis sichern.

### Paket 10 – Persönlicher Schülerbereich und sichere Prüfung

**Dateien:** `classroom/student-workspace.mjs`, vorhandener Secure-Client; Backend `secure-lifecycle.js`, `classroom-assignments.js`; `assessment-functions/test/classroom-lifecycle.test.js`.
**Schnittstelle:** `listStudentAssignments`, bestehende vier Lifecycle-APIs plus servergeprüfte Assignment-/Studentbindung.

- [ ] Tests für leeren Bereich, Technik erst nach Zuweisung, fremde Empfänger/Schule, exklusiven Classroommodus ohne Guestbypass, alten Run, widerrufenen Code, Fortsetzung desselben Versuchs nach berechtigter Neuanmeldung und getrennte Ergebnis-/Lösungsfreigabe schreiben.
- [ ] Neue Fälle rot; minimale Lifecycle-Erweiterung implementieren, bestehende Token-/Run-/Idempotenzprüfungen erhalten.
- [ ] Anstehend/verfügbar/erledigt im bestehenden Seitenrahmen verdrahten; keine Klasse oder Empfängerliste im Studentpayload.
- [ ] Neue Lifecyclefälle und gesamte Assessment-Suite `node --test assessment-functions/test/*.test.js` grün prüfen; zusätzlich Gastpfad und doppelte Abgabe tatsächlich durchlaufen.
- [ ] Checkpoint, bestehende Securitygates nicht durch bloßen UI-Smoke ersetzen.

### Paket 11 – Jahreswechsel, Archivierung, Backup und Löschung

**Dateien:** Backend `classroom-store.js`, `classroom-imports.js`, Cleanup-Erweiterung im bestehenden Assessment-Cleanup nur falls erforderlich; Adminansichten; `classroom-rollover.test.js`.
**Schnittstelle:** Commands `prepareYear`, `activateYear`, `endMembership`, `reactivateStudent`, `requestDeletion`; kontrollierte Wirkungs-/Korrekturvorschau.

- [ ] Tests für Wiederholer, Rückkehr, mehrere Jahresmitgliedschaften, andere Schule unverändert, historischen Snapshot erhalten und Löschsperre bei gebundenen Nachweisen schreiben/rot prüfen.
- [ ] Jahres-/Archivlogik und begrenzte Gegenkorrekturen implementieren; kein pauschaler Undo über laufende Prüfungen.
- [ ] Synthetischen Backendbackup und schulischen Schlüssel-/Zuordnungsrestore getrennt prüfen; offene organisatorische Fristen nicht als erfüllt markieren.
- [ ] Testdatei grün und Neustart-/Wiederherstellungsbeleg sichern.
- [ ] Checkpoint mit Erfüllungsgrenzen.

### Paket 12 – Geprüfter Backendanschluss für den normalen Lehreraccount

**Dateien:** vorhandene lokale Serverkonfiguration, Deploymentmanifest/-nachweise nach bestehendem Projektverfahren; keine Hostingänderung.
**Schnittstelle:** lokales Frontend → ausdrücklich qualifizierte Classroom-Callables im bisherigen Testprojekt; bestehende Authsession bleibt unverändert.

- [ ] Aktuellen Integrationsstand und Überschneidungen prüfen; exakten Kandidaten/Sicherheitsnachweise fixieren.
- [ ] Konkretes Reviewpaket aus Functions-/Rules-/Indexesdiff, Zielprojekt und Rücknahmeplan vorbereiten. Bestehende Quiz-/Benutzerdaten nicht migrieren.
- [ ] Gesonderte Backendfreigabe am fertigen prüfbaren Ergebnis einholen; bis dahin Emulatornachweise sauber begrenzen. Dieser Plan erteilt keinen Deployauftrag.
- [ ] Nur danach autorisierte Backendteile veröffentlichen und tatsächliche Receipts prüfen; Hosting und Production bleiben unberührt.
- [ ] Mit Martins normalem Login synthetische Klasse/Person dauerhaft prüfen, Reload/Neuanmeldung und vorhandene Tests erhalten; keine Credentials durch den Agenten eingeben lassen.

### Paket 13 – Zusammenhängende Abnahme und Freigabegrenzen

**Dateien:** bestehende Browserprüfung gezielt erweitern; neue Belege in `docs/classroom/evidence/`; Plan/TODO/Handoff aktualisieren.
**Schnittstelle:** fixe Code-SHA, Umgebung und tatsächlich ausgeführte Prüfungen; keine alten grünen Berichte auf neuen Code umetikettieren.

- [ ] Desktop und iPad-/Touchgröße: Start → normaler Login → vorhandene Tests → manuelle Schüleranlage → Reload → Klasse/Fach → Testzuweisung → eigener Schülerzugang → Prüfung → eigene Ergebnisse prüfen.
- [ ] Zwei Lehrkräfte, zwei Schulen, Personalwechsel, falsche Codes, fremde IDs, abgebrochener Import, Wiederimport und Logout/Accountwechsel negativ testen.
- [ ] DE/EN, Tastatur/Fokus, langsame Verbindung, Doppelklick und Fehlerwiederaufnahme prüfen; Namen/ASV-/Credential-Canaries dürfen nicht in Requestlogs/Storage/AI auftauchen.
- [ ] Unabhängigen Review des fixierten produktiven Scopes nach Projektgates einholen; relevante SEC-/PRIV-Nachweise zuordnen. Keine neue paid Reviewaction automatisch starten.
- [ ] Martins Bedienabnahme dokumentieren. Releasezustand als branch_only/integriert/backend_deployed/lokal_nutzergeprüft getrennt mit Belegen angeben; offizielle GRADECREW_STATE-Stufen nicht eigenmächtig erweitern. Production bleibt eigener Auftrag.

## 16. Abnahmekriterien – wann dieser Umfang abgeschlossen ist

| Kriterium | Benötigter Nachweis |
|---|---|
| Vollständige ursprüngliche Website und normaler Login erhalten | reale lokale Browserbedienung; Bestandsvergleich ohne private Inhalte im Bericht |
| Vorhandene Tests funktionieren unverändert | gleiche Quiz-IDs; Originaleditor/Publish/Gastpfad/Auswertung und passende Regressionen |
| Manuelle Schüler-/Klassenpflege dauerhaft | nach Reload, Abmelden/Anmelden, zweitem autorisierten Gerät dieselben Daten |
| ASV-Wiedererkennung korrekt | bestätigtes Profil; synthetisch zwei Jahresstände, identische studentId und keine Doppelanlage |
| Große Importe konsistent | echter Emulatorabbruch-/Konkurrenztest; kein sichtbarer Teilbestand |
| Mehrere Lehrkräfte und Wechsel korrekt | Fachscope, zeitliche Übergabe, getrennte Entwurfs-/Ergebnisrechte positiv/negativ geprüft |
| Schülerzugang korrekt | echter Tokenexchange; persönliche Liste; Reset entzieht alte Rechte; Lehrer-Auth bleibt erhalten |
| Bestehende Secure-Assessment-Sicherheit erhalten | gesamte relevante Backendregression; Assignment-/Runbindung, Guestbypass verhindert, Submission idempotent |
| Klarnamen-/Schlüsselgrenze eingehalten | synthetische Canary-/Storage-/Requestprüfung und dokumentierte Datenflüsse |
| Schule betriebsfähig | verifizierte Administration/Vertretung, tatsächlich freigegebener Tresor, erfolgreich geprobter Restore, Zweck-/Fristenkonzept |
| Menschliche Bedienabnahme | Martin prüft die ergänzte bestehende Website; physisches Gerät gesondert belegen |

Technische Umsetzung kann mit synthetischen Daten abgeschlossen werden, während Echtdatenfreigabe noch offen ist. Dies wird getrennt benannt. Ein fertiger Plan, Browserbild oder Emulatorlauf ist kein Nachweis veröffentlichter, schulisch freigegebener Verwaltung.

## 17. Noch zu bestätigende Tatsachen und vorgeschlagene Entscheidungen

**Vorgeschlagene V1-Entscheidungen:** bestehende App/Firebasearchitektur erhalten; schulische Identität statt lehrkraftgebundener Personen; manuelle Anlage zuerst; vollständiger Import mit Vorschau und expliziter Übernahme; HMAC nur mit schulischem Tresor; keine Cloud-Klarnamen; persönliche Schülercodes; Fachzuständigkeit statt allmächtiger Klassenlehrkraft; bestehende Tests ausdrücklich verknüpfen, nicht automatisch umbauen; Gastweg erhalten mit klarer Zugangspolicy.

**Für die Umsetzung mit synthetischen Daten nicht blockierend:** genaue Schulart, reales ASV-Exportprofil, Name des Schultresordiensts, schulische Datenfristen. Diese Tatsachen blockieren jeweils die reale Quellen-/Echtdatenfreigabe, nicht den Bau von manueller Verwaltung und überprüfbaren technischen Verträgen.

**Vor realem Pilot zwingend:** tatsächliche ASV-ID-Feldbedeutung/Quellstabilität; legitimierte Schulverwaltung und Vertretung; freigegebener Tresor samt Restore; praktisch nutzbare lokale Namenszuordnung; Betreiber-/Schulrollen, Datenzwecke, Verträge und Aufbewahrung durch Zuständige geklärt; konkret freigegebenes Testbackendrelease. Bestehende Datenschutzkonzepte sind Grundlagen, kein aktuelles Rechtsgutachten. In diesem Plan wurden keine neuen Aussagen zu geltenden gesetzlichen Fristen recherchiert oder behauptet.

**Nächster ausführbarer Schritt nach Martins Planprüfung:** Paket1 und Paket2 im vorhandenen Aufgabenbranch beginnen; danach zuerst manuelle Klasse/Schülerpflege mit echter Persistenz und serverseitigen Rechten liefern. Keine weitere Demooberfläche vorziehen.

## 18. Selbstprüfung des Plans

Anforderungen manuelle Pflege/Klassen/Fächer → Pakete2/3/7; ASV/Identität/keine Rohdaten →4/5/6; Schülerzugang →8; vorhandene Tests/Prüfungen →1/9/10; Personal-/Jahreswechsel →7/11; dauerhafter echter Accountanschluss →12; Nutzer-/Geräte-/Negativabnahme →13. Jede Review-Focus-Bedingung besitzt explizite Testfälle. Payload-/Pfadnamen sind konsistent; Actor kommt nie aus Clientfeldern. Bestehende App und Grenzen sind durchgängig berücksichtigt. Offene organisatorische Punkte werden nicht als bereits implementiert oder freigegeben dargestellt.

---

# Historischer Plan und Versuchshistorie bis 18.10.2026

Die folgenden Abschnitte bleiben zur Nachvollziehbarkeit vollständig erhalten. Sie beschreiben frühere RAM-/Demoaufträge und Korrekturen. Bei Widerspruch gilt ausschließlich der aktuelle Planteil oberhalb dieser Trennlinie. Insbesondere gelten frühere Aussagen „nur RAM“, „keine echte Anmeldung“ oder „kein Remotezugriff im Testmodus“ nur für die ausdrücklich getrennte synthetische Demo, nicht für die normale lokale Lehrerwebsite oder das geplante dauerhafte Classroom-Backend.


## Präzisierung: echter Lehreraccount und vorhandene Tests — 18. Oktober 2026

Der normale lokale Einstieg muss den bestehenden Firebase-SDK, Login, Account, Testbestand und alle bisherigen Testaktionen verwenden. Eine lokale Beispielanmeldung erfüllt diesen Auftrag nicht.

- Der Server liefert unter `/` die vollständige App mit ihrer unveränderten bestehenden Testbackend-Konfiguration (`hausaufgabe-staging`). Er injiziert dort weder Demo-SDK noch Classroom-Previewflag. Die Webadresse bleibt lokal; kein Hosting-/Rules-/Functionsdeploy.
- Die bisherige synthetische Probe bleibt ausschließlich als ausdrücklich getrennte Datei `/classroom-demo.html` verfügbar. Ihre SDK-Sperre bleibt erhalten. Sie wird nicht als Anmeldung mit dem echten Lehreraccount dargestellt.
- Ein kleiner Account-Workspace-Port gibt ausschließlich angemeldete Accountmetadaten, vorhandene Testmetadaten und bestehende Navigationsaktionen an eine additive Seitennavigation weiter. Keine künstliche Sitzung, kein zweiter Testbestand, keine Interception von Erstellung, Speichern, Veröffentlichen oder Einstellungen.
- Die linke Navigation erscheint nur nach echter Anmeldung. „Meine Tests“ öffnet weiterhin den bisherigen Dashboardpfad. „Klassen“ gruppiert die vorhandenen Tests nach ihren bereits gespeicherten Klassenangaben und öffnet denselben Editor/dieselbe Auswertung. Diese Gruppierung ist noch kein verifizierter schulischer Mitgliederbestand.
- „Schüler:innen“ erhält einen ehrlichen Leerzustand, solange noch keine echte schulische Mitglieder-/Identitätsanbindung implementiert ist. Keine erfundenen Beispielpersonen im echten Account, keine Ableitung von Personen aus Leistungsdaten, keine improvisierte Speicherung in Userprofilen oder Testdokumenten.
- Beim Accountwechsel/Abmelden verschwinden Accountdaten aus den Zusatzansichten. Die Originalanmeldung wird im Browser mit echtem SDK geprüft; die erfolgreiche Anmeldung und tatsächliche vorhandene Tests müssen vom Nutzer selbst bestätigt werden, da der Agent keine Zugangsdaten benötigt.
- Prüfungen: Serverauslieferung trennt verbundenen Accountbetrieb von isolierter Probe; Authform/ursprüngliche Dashboardknoten bleiben unverändert; Sidebar erst nach echter Sitzung; Klassen aus echten Testmetadaten; Accountwechsel entfernt alte Daten; Original-Auth-/Publishregressionen bleiben grün.

## Verbindliche Bedienkorrektur vom 18. Oktober 2026

Martin lehnt die sofortige Classroom-Demoübersicht ab. Die vollständige Website ist der Einstieg, nicht ein hinter einem Testwerkzeug versteckter Zusatz.

1. Beim Öffnen der lokalen Adresse bleibt die originale GradeCrew-Startseite mit Crew, Animation, Testcode und Anmelden sichtbar. Keine automatische Lehrkraftauswahl oder Weiterleitung in Classroom.
2. Die originale Anmeldeseite bleibt erreichbar. Eine ausdrücklich lokale Testanmeldung öffnet eine RAM-Sitzung mit synthetischer Lehrkraft; echte Firebase-Anmeldung bleibt eine getrennte Backendaufgabe. Die Testanmeldung braucht keine echten Zugangsdaten.
3. Nach Anmeldung startet der originale Bereich „Meine Tests“ mit bestehender Suche, Filtern, Erstellen, Editor und Einstellungen. Die Benutzerleiste einschließlich Abmelden bleibt sichtbar.
4. Eine linke Navigation ergänzt „Meine Tests“, „Klassen“, „Schüler:innen“ und die optionale Übersicht. Klassen- und Schülerlisten nutzen dieselben vorhandenen Zuständigkeitsprüfungen. Editor und Erstellungsansicht bleiben innerhalb dieser Hülle.
5. Persönlicher Schülerzugang ist ein eigener Einstieg neben dem spontanen Testcode. Die lokale Probe erklärt ihre Beispielcodes; nach Anmeldung zeigt sie nur die persönlichen Zuweisungen.
6. Die große Rollen-Testleiste entfällt aus dem normalen Ablauf. Erweiterte Testoptionen sind eingeklappt in der Navigation erreichbar. Abmelden führt zur vollständigen ursprünglichen Startseite; Neuladen beginnt ebenfalls dort.
7. Neue Regressionen prüfen den öffentlichen Einstieg, lokale Anmeldung, originales Testdashboard, linke Navigation, Schülerliste und Abmelden. Die bestehende CSV-/Zuweisungslogik bleibt erhalten. Browserprüfung lokal auf Port 8782; kein Stagingaufruf oder Deployment.

Die früheren grünen Funktionsnachweise belegen diese Bedienanforderung nicht. Diese Korrektur erhält eigene Nachweise und bleibt bis dahin offen.

> For agentic workers: use superpowers:executing-plans. Ein Writer im isolierten Checkout; unabhängiger Review an fixiertem SHA. Dieser einzige Umsetzungsplan konkretisiert die 14 am16.10.2026 von der Zentrale veröffentlichten Schritte. Historische Implementierungsverbote im Konzept gelten für die damaligen Aufträge und sind für diesen ausdrücklich autorisierten lokalen Lieferblock abgelöst.

**Goal:** In der vollständigen aktuellen GradeCrew-App Klassen, lokale ASV-Beispielimporte und explizite Testzuweisungen mit persönlichen Schüleransichten erproben.

**Architecture:** Originale index.html/startup.js/app.js, bestehende Tokens, Assets, Editor und Übungsport bleiben maßgeblich. Ein ausschließlich expliziter lokaler Testserver setzt vor Modulinitialisierung eine Importmap auf einen blockierenden Demo-SDK-Adapter und eine restriktive CSP. Neue fachliche Daten leben nur im RAM; die bestehende App bekommt einen kleinen Port für Navigation und echte Editor-Test-IDs. Kein zweiter Editor oder Bewertungsserver.

**Tech Stack:** Vorhandenes Browser-ESM, CSS, Node24 TestRunner/HTTP, vorhandenes jsdom/Playwright; keine neuen Produktabhängigkeiten.

**Spec:** ../CLASSROOM_TEACHER_UX_V1.md hat Vorrang vor älteren Navigationsteilen in ../CLASSROOM_STUDENT_MASTERPROJECT_V1.md. Identität/ASV: ../privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md und CLASSROOM_ASV_IMPORT_PRIVACY.md, Quellstand 9b23052e7bb3a8e6009cca64a7498d942cd7bc1d. Nutzerauftrag16.10 ergänzt und autorisiert lokale Umsetzung, keinen Deploy.

## Global Constraints

- Base8f8697901f8c1aea89897be855ca2872c82d0f2b / gc39, Stage canonical hausaufgabe-staging.web.app. Alter Standalone-Mock17fc427 ist historische Evidenz, keine Codebasis.
- Eigener Branch feature/classroom-integrated-preview-20261016. Ports8779/8780/8781 fremd; eigener Port8782 nur127.0.0.1.
- Vollständige Original-App laden; bestehende Homepage, Animation,29CrewPNGs, Coco,Remy,Mülleimer,ET,Upload10,Audio,Lösungsfreigabe erhalten. Keine fremden Branches cherry-picken.
- Im Testmodus keine Remote-Authentifizierung,Firestore,Storage,Functions,AI,Analytics; keine echten Schülerdaten. Wechsel der UI-Testansicht ist Wechsel der Testansicht, keine Anmeldung/Autorisierung.
- CSV-Rohdateien, Namen und Rohkennungen nurBrowser-Arbeitsspeicher. Kein localStorage/IndexedDB/Log/URL/Server/AI/Analytics. Nur synthetische herunterladbare Beispiele; tatsächliches ASV-Schema unbekannt.
- schulbezogenes HMAC mit schulischem Schlüssel, Recovery und Codeexchange sind Zielarchitektur, nicht durch fest eingebauten Demoschlüssel simuliert.
- Kein Merge, Deployment oder Productionzugriff, kein echter Mail-/Provider-/Accountaufruf, keine JDK-Installation. Release bleibt branch_only.
- Task/Versuche/Budget/Historie erhalten. Codecheckpoint vor langen Tests, HDF/TODO im Aufgabenbranch, keine zentrale Main-Schreibarbeit.

## Review Focus

1. CSV mit führenden Nullen, BOM, Quotes/Zeilenumbrüchen, alternativen Separatoren, Encodingfehlern: Textidentität erhalten oder mit Zeile ablehnen; kein Namensfallback.
2. Zwei Lehrkräfte, zwei Schulen und fremde Klasse: keine unberechtigten Listen/Starts/Entwürfe; Testansicht darf Sicherheitsnachweis nicht vortäuschen.
3. Nachträgliches Mitglied und Lehrkraftwechsel während Sitzung: Snapshots unverändert, aktive Mitgliedschaft bei jedem Start, Rechte zum Stichtag neu prüfen.
4. Reload/Reset/Abbruch: CSV verschwindet ausRAM, keine Browserpersistenz oder Remoteübertragung, offener Dialog löscht transiente Rohdaten beim Zurücksetzen.
5. Tatsächlicher Editorfluss: dieselbe quizId wird bearbeitet, gespeichert, zugewiesen und angezeigt; private Lösung und Bewertungen werden nicht als SecureAssessment-E2E ausgegeben.

## Dateiverantwortung und Schnittstellen

| Datei | Verantwortung |
|---|---|
| tools/classroom-preview/server.mjs | NurLoopback-HTTP,Originaldateien,vorInitImportmap,CSP,synthetischeDownloads,keine Uploadroute |
| classroom/demo-sdk.mjs | FirebaseSDK-Imports lokal abfangen; alle Auth/DB/Callable/Storageoperationen failclosed; keine Secrets/Claims |
| classroom/domain.mjs | pure TeacherGrant-,Membership-,Snapshot-,Zeitraum-,Transfer-,RollOver-Verträge |
| classroom/repository.mjs | synthetischer RAM-Zustand, Klassen/Kurse,Schulpersonal,Identities,Assignments,Importrevisionen |
| classroom/csv.mjs | Textdecoder,CSVParser,Mapping,Validierung,unveränderteTextIDs |
| classroom/controller.mjs | Original-App-Navigation,Klassenansichten,Importdialog,Zuweisungsdialog,MeineTests/Testwerkzeug |
| classroom/classroom.css | nur neue Klassenlayoutregeln auf bestehenden --gc-*Tokens/Komponenten |
| app.js | expliziter lokaler App-Port und Wiederverwendung bestehender Editor-/Publish-/Guestpfade |
| guest-tour-port.mjs | vorhandenen Memoryport zu mehreren QuizIDs erweiterbar halten, LegacyTourvertrag unverändert |
| startup.js | imLoopbackTestmodus DemoController nach echter Appinstallation laden |
| classroom/*.test.mjs | echte Domain/CSV/Repository-Verhaltenstests, keine bloßen Quelltextspiegel |
| tools/classroom-preview/browser-check.mjs | echte lokale Browserclicks,Request/Storagebelege,Desktop/MobileScreenshots |
| workstreams/classroom-student-management-v1.md | bestehende Übergabe,ein Ledger,Quellen,Nachweise,Grenzen |

App-Port: listQuizzes()->Quiz[]; openQuiz(quizId)->Promise<void>; createQuiz({title,subject,grade})->Promise<quizId>; getQuiz(quizId)->Quiz; publishQuiz(quizId)->void; showDashboard()->void. Alle basieren auf bestehendem Appzustand und guestTourRepo, kein Parallelquiz im Controller. Repository: getState(); listClasses(actor,year); listCourses(actor,classId); listStudentTests(studentId,now); assign(actor,{quizId,classId,courseId,startsAt,endsAt,recipientIds}); addRecipient(actor,assignmentId,studentId); canStart(studentId,assignmentId,now); applyImport({kind,headers,rows,mapping,full,schoolId,year}); transferTeachingGrant({grantId,toTeacherId,effectiveAt}); rollover({fromYear,toYear}). PseudonymeIDs sind zufällige interneDemoschlüssel; roheQuellkennungen bleiben ausschließlich imRAM-Abgleichindex.


## Verbindliche Präzisierungen nach Quellen- und Vertragsprüfung

Der am 16. Oktober beschriebene Schülerexport wird ausschließlich seiner Struktur nach berücksichtigt. Das synthetische Prüfprofil hat zehn durch Pipe-Zeichen getrennte Spalten und keine Kopfzeile. Die erste Datenzeile bleibt erhalten. Die Zuordnung lautet im Beispielprofil: Spalte 1 Schulkennung, Spalte 2 mögliche Personenkennung, Spalte 3 Nachname, Spalte 4 Vorname, Spalte 8 Klasse. Die übrigen Spalten bleiben unbekannt oder werden nicht benötigt und deshalb nicht übernommen. Aus der Form der zweiten Spalte folgt kein Beleg für ein stabiles ASV-Differenzierungsmerkmal. Namen und reale Kennungen werden weder in Plan, Repository noch Nachweis kopiert.

Die Importoberfläche bietet vor dem Parsen die Einstellung „Datei hat eine Kopfzeile“. Für das zehnspaltige Pipeprofil wird sie ausgeschaltet und das Trennzeichen ausdrücklich auf Pipe gesetzt. Jeder Datensatz muss seine eigenen Zeilenumbrüche besitzen. Zusammengefügte Chatzeilen werden nicht anhand von Leerzeichen rekonstruiert: Mehrwortnamen machen diese Methode unzuverlässig. Leere Felder und zusätzliche Spalten bleiben im Parser erhalten; nur ausdrücklich zugeordnete benötigte Felder gelangen in den lokalen Importplan. Die Beispiele sind vollständig erfunden und enthalten Umlaute, Mehrwortnamen und führende Nullen.

Alle administrativen Mutationen erhalten die aktuell gewählte Identität ausdrücklich als ersten Parameter. Die maßgeblichen Schnittstellen sind `applyImport(actorId, preview)`, `transferTeachingGrant(actorId, transfer)` und `rollover(actorId, schoolYear)`. Die Prüfung verlangt ein verifiziertes Verwaltungskonto derselben Schule. Verwaltungsrechte in Schule Nord erlauben keine Änderungen in Schule Süd. Eine fachliche Lehrkraftzuständigkeit allein genügt nicht. Diese Bedingungen sind lokale Vertragsprüfungen und werden nicht als nachgewiesene Serversicherheit bezeichnet.

Ein Importplan trägt die Revision, aus der seine Vorschau entstanden ist. Hat sich der Bestand danach verändert, wird die Übernahme abgewiesen und eine neue Vorschau verlangt. Die Übernahme ist eine atomare Transaktion im Arbeitsspeicher: scheitert beispielsweise die zweite Unterrichtszeile an einer fehlenden Lehrkraft, werden auch Änderungen aus der ersten Zeile zurückgenommen. Es gibt keine stille Teilübernahme. Ein abweichender Teilplan müsste zuerst ausdrücklich angezeigt und bestätigt werden.

Die Wiedererkennung einer Person ist schul- und quellbezogen. Der Jahreskontext gehört zusätzlich zur Mitgliedschaft. Derselbe synthetische Personenbezug und dasselbe Klassenlabel in einem neuen Schuljahr behalten deshalb dieselbe Identität, erzeugen aber eine neue Jahresmitgliedschaft. Ein Schuljahreswechsel der Verwaltung Nord verändert weder Klassen noch Mitgliedschaften der Schule Süd. Bereits veröffentlichte Empfängersnapshots und historische Testzuweisungen bleiben unverändert.

Die Schülerprojektion enthält ausschließlich die für „Meine Tests“ benötigten eigenen Felder: Zuweisungs-ID, Test-ID, Klassenkontext, Zeitraum, Status sowie getrennte Ergebnis- und Lösungsfreigaben. Testmetadaten beschränken sich auf Titel und Fach. Die vollständige Empfängerliste, fremde Schüler- und Mitgliedschaftskennungen, fremde Aliase und private Autorenfelder werden nicht ausgegeben.

Die Standard-Testansicht „Toni · Technik“ besitzt ausschließlich die Fachzuständigkeit 9b/Technik. „Kim · Englisch“ besitzt ausschließlich 9b/Englisch. Weitere Beispielklassen verwenden eine getrennte, ausdrücklich benannte Lehrkraft. So bleiben der positive Zuweisungsfall und der negative Fall zwischen zwei Fachlehrkräften für Martin leicht überprüfbar.

Der bestehende GradeCrew-Ablauf bleibt auch beim Erstellen neuer Tests erhalten: Klasse und Fach auswählen, die vorhandene Erstellungsansicht öffnen, „Manuell erstellen“ wählen, im vorhandenen Editor eine Aufgabe anlegen, speichern und anschließend ausdrücklich zuweisen. Die neu erzeugte Test-ID muss in Editor, Zuweisung und Schüleransicht identisch bleiben. KI-Schaltflächen erklären im lokalen Modus ihre Sperre und starten keinen Provideraufruf. Ein bereits vorhandenes QTECH-Beispiel allein genügt nicht als Nachweis dieses neuen Erstellungsablaufs.

Die lokale Vorschau enthält die bestehenden Startseiten-, Editor-, Navigations-, Crew- und Designquellen aus gc39. Ein Quellvergleich allein belegt keine identische Darstellung. Deshalb werden zusätzlich die tatsächlich geladene lokale Startseite und der tatsächliche Editor aufgenommen und mit einer anonymen, nur lesend geöffneten kanonischen Staging-Startseite verglichen. Eine durch Anmeldung bedingte Abwesenheit von Coco oder Administration wird als Grenze benannt; es werden keine echten Konten für diesen Vergleich verwendet.

Die UI-Sprachauswahl Deutsch/Englisch wird mit der vorhandenen GradeCrew-Übersetzungsinfrastruktur verwendet. Der neue Katalog deckt die Grundnavigation und zentrale Dialogtexte ab. Fachliche Testinhalte und synthetische Aliase werden nicht durch die UI-Sprache umgeschrieben. Ein begrenzter Englisch-Smoke ist kein Beleg für eine vollständige sprachliche Abnahme aller Fehler- und Sonderzustände.

## Task1: Quellen und Erhaltung (Root-Schritt 1)

- [x] frische mainRegeln, STATE/TODO/Registry, Live Development Status 38809750925 lesen; Primary+1/-134 undDraft141 abgleichen.
- [x] isolierten8fCheckout erstellen; fremde dirtyWorktrees,Audio/CrewV3 und Ports nicht verändern.
- [x] fünf bestehende Konzept/HDFDateien mit Quellstand  übernehmen, Historie unverändert erhalten;16OctÜbernahme ergänzen.
- [x] Baseline29Tests ausführen; jsdom-Abhängigkeit vorhandenenInstallationspfad nutzen. Existierende Teardown-Konsolenmeldung separat dokumentieren.
- [ ] Plan/HDF/TODO checkpointen und remote sichern. Bei DNSConnector verwenden; unklarer Schreibausgang zuerst abgleichen.

## Task2: Sichere vollständige lokale App (Root-Schritt 2)

Files: server.mjs,demo-sdk.mjs,startup.js,app.js.
- [ ] RED: Server aufLoopback, keineUploadroute; DemoSDKCallable/DB/Authoperationen werfen; fremderHost/Testflag verweigert. Original-index.html/startup/app müssen geliefert werden.
- [ ] GREEN: Server injiziert nur explizitem lokalenTeststart Importmap für exaktFirebase12.4.0-Module vor Modulscript. CSP connect-src self,keinRemote-SDK; AuthState initialnull,keineRemote-SDKinitialisierung.
- [ ] Originalstartup EntryFlow,Tokens,Brand,app undWorkspace laden; App-Port installieren. Keine globaleFetch-Sperre als einziger Schutz.
- [ ] Browseranfragen und CSP prüfen: kein fremderOrigin, keineSocket-/Firestore-/Functions-/Telemetryaufrufe. Testmodus sichtbarerHinweis mitReset/Testansicht.

## Task3: Navigation und Klassen (Root-Schritt e3/4)

- [ ] RED: Klassen/Kurse nur zu eigenen wirksamenGrants; Adminrolle allein keinFachgrant. EinQuiz mit mehrerenZuweisungen bleibt eineID.
- [ ] GREEN: Übersicht/Klassen/Tests in Originalshell; Klassenseite Übersicht/Schüler/Tests. BestehendeToolbar/Editor/Backnavigation weiterverwenden.
- [ ] Fixtures: SchulenNord/Süd,5a/9b/9c,Technik/Englisch/Deutsch,zweiFachlehrer derselben9b,Admin+Stellvertretung ohneAutomatikrechte.
- [ ] Trennung schoolTeacher record,verifiedLoginLink,teachingGrant undclassMembership inRepository sichtbarprüfen.
- [ ] Prüfung node --test classroom/*.test.mjs; BrowserDashboard/ClassTabs; kurzerCommit.

## Task4: DreiCodearten und Testansichten (Root-Schritt 5)

- [ ] UI erklärt persönlicherZugangscode/Klassencode/Testcode getrennt. Demoansichten enthalten nur markierteTestcodes; keineechtenLoginversprechen.
- [ ] SchülerIdentity ist klassenunabhängig,Alias proMembership; Alias nie HTMLinterpretieren. Testwerkzeug wählt Schüler ohne Authclaim.
- [ ] RED/GREEN: leererSchüler siehtkeinenDraft/keineAssignments; Schul-/Klassenfremder keinedeniedDaten inListen.

## Task5: BrowserCSVImport (Root-Schritt e6/8)

- [ ] RED: UTF8/BOM,Semikolon/Komma/Tab,quotedSeparator,escapedQuote,quotedNewline,CRLF/Umlaute,führendeNullen,fehlende/duplicateID,kaputteQuotes,ungültigesEncoding,übergroßeDatei mit klarerZeile.
- [ ] GREEN: echter input[type=file],TextDecoder UTF8 fatal,expliziteWindows1252Option,Delimiterwahl. KeineautoUmdeutungvonIDs zuNumber,keineNameFallbacks.
- [ ] Schüler/Teacher/UnterrichtDownloadCSV synthetisch über statischenDownload. Mapping wählt stabileID,Klasse/Jahr bzwTeacher/Fach; Pflichfelder validieren.
- [ ] Vorschau nennt neu/unverändert/Wechsel/Konflikt und relevanteFehlerzeilen; Apply erst explizitnachVorschau; Cancel/Reset verwirftRAM-Rohdaten.
- [ ] Keine Dateiinhalte inURL,Console,Serverrequest,Storage. Browserbeleg Network+Storage mitsynthetischemMarkereintrag undReset.

## Task6: Wiederimport und Jahreswechsel (Root-Schritt 7)

- [ ] RED: gleicherImport zweimal erzeugtkeineIdentities/Membershipsduplikate; andereSchule gleicherRohID bleibt getrennt; KonflikteblockierenbetroffeneApply.
- [ ] GREEN: matchIndex nurinRAM mitschool/source/kind/rawId-Domäne; vorApplyRevisionprüfen; RohIDsnieautomatischalsstabileASVIDbehaupten.
- [ ] Teilimportentferntniemand. VollimportzeigtfehlendealsPrüfkandidaten,keineMassenlöschung. Wechsel legtneueMembership/anundbeendetaltebewusst; AuditHistoryohneKlarnamen.
- [ ] RollOvervon2026/27nach2027/28 behältIdentityundhistorischeSnapshots,neueJahresklasse+Membership; alteKlasseArchivkontext.
- [ ] HMAC/TresorRecovery/offizielleASV-Exportspalten bleibenZiel/offen, kein eingebauterProduktionsschlüssel.

## Task7: EchterEditor und Zuweisung (Root-Schritt 9)

- [ ] RED: existingApp-Port erstelltQuizID undliefertdieselbeIDnachEdit/Save/Assign. Draft niemalsStudentList,unberechtigterTeacher/anderesFach/SchuleAssignverweigert.
- [ ] GREEN: OriginalopenCreate/openEditor/Save mitguestTourRepository nutzen; KontextKlasse/FachbeimCreate alsMetadatenübernehmen. KeinzweitesEditorformular.
- [ ] ZuweisenundVeröffentlichenDialog zeigtTitel,Klasse/Fach,Zeitraum,expliziteEmpfängerliste. Bestätigen speichertAudienceSnapshoterstvollständig,dannaktiv; AbortkeineZuweisung.
- [ ] ExistingpracticeSolutionPublication imnormalenModus unverändert; Demo assignment istUXVertrag,keinServerpublishnachweis. Testcode/VorlagenkodekeinepersönlicheCredential.

## Task8: Schüleransicht und Zugriff (Root-Schritt 10)

- [ ] RED: Anstehend vorStart,Jetzt imZeitfenster,Erledigt nachlokalerMarkierung; richtige9bTechnik siehtTest,9c/Südnicht. NeueMembershipnachSnapshotnichtautomatischberechtigt.
- [ ] GREEN: MeineTests mitErklärungbeiLeerzustand. StartprüftaktiveIdentity,Membership,School,Snapshot,ZeitraumundAssignmentzustandjedesMal.
- [ ] Nachzügler nurexplizitesNachtragen. EntfernteMembershipkeinNeustart; existierendeAttempt-/Historie nichtals gelöschtbehaupten.
- [ ] Ergebnisse/Lösungen getrennteFreigabeschalter; keine automatischeLösungsausgabe. KeinezweiteBewertungimplementieren.

## Task9: Lehrkraftwechsel (Root-Schritt 11)

- [ ] RED:9bEnglisch-TransferabStichtag nimmtaltemTeacherexactGrant,neuerbekommtihn; andereFächerbleiben; privateEntwürfe/HistoricalResultskeinPauschaltransfer.
- [ ] GREEN: ausgewählterGrant+Nachfolger+Stichtag+Vorschau,Bestätigung; lokaleEveryOperationRightsPrüfungbelegbar,keineServerbehauptung.
- [ ] SchülerIdentity/Memberships/Codeshistorie unverändert,Adminbenennung/RecoverybleibenorganisatorischeZielvoraussetzung.

## Task10: Getrennte echte Backendfolgephase — NICHT im ersten Lieferblock (Root-Schritt 12)

- [ ] offen: lokalesJDK/FirebaseAuth+Functions+Firestore-Emulatorqualifizieren; derzeitJavaStub,keinInstallationsauftrag.
- [ ] offen: neue serververwalteteSchools/Identities/CodeIndex/TeacherGrant/Assignments; deniesfürdirekteReadsWrites,serverseitigeCallablesundProjektionen.
- [ ] offen: assessment-functions/main.js→lib/secure-lifecycle.js bewahren. Info/Start/Resume/Submit/Receipt prüfen aktuelleIdentity,Membership,Snapshot,Grant,Run/Zeitraum. runId ausLiveQuiz,keinenblindClienttrustedRun.
- [ ] offen: persönlicherCodeexchange mitCSPRNG/HMACserversecret/versioniertemIndex,RateLimitvorReads,Revoke/RefreshTokenwiderruf,neutralemFehler. KeineClaimsmitKlasse/Noten.
- [ ] offen: secure-student benannteFirebaseApp erhältbewussteauthentifizierteSchülersitzung,Logout/Accountwechsel löscht inFlight/Quizcredential; gegenwärtigerquizIdlocalStorageKeykeinIdentitätsschutz.
- [ ] offen: Browser→Callable→Auth-Emulator→RulesE2E nebenvorhandenen Handler.runTests. ZweiAccounts/Schulen,manipulierteUID/Grant/Run/Score,expired/revokedCodes,parallel/idempotentSubmit,privateLösungen.
- [ ] ErstmitdiesenBelegenBackendintegration/Sicherheitbewerten. LokaleDemoTests ersetzenkeinedieserGates.

## Task11: Akzeptanzmatrix (Root-Schritt 13)

| Fall | Browseraktion | Erwartete Beobachtung |
|---|---|---|
| CSVApply | Beispieldownload,Dateiauswahl,Mapping,Vorschau,Bestätigen | neuepseudonymeMitglieder,Bestandszahlen,keinRemote |
| Reimport/Teilbestand | gleicheCSVzweimal,kleinereCSVteilimport | keineDuplikate/keineAbgänge |
| ZweiFächer | Technik-/Englischteacherwechseln | gleicheKlasse,erlaubteFächer/Tests,keinAdminAutogrant |
| Draft | echtesEditoröffnenändernspeichern | gleicheID,Schülerleer |
| Assign |9bTechnikAudience+Zeitenbestätigen | passendeSchülerAnstehend/Jetzt,9c/Südleer |
| LateJoin | MitgliednachAssignanlegen | keinAutozugriff,expliziterNachtragändertnurEmpfänger |
| Removed | Mitgliedschaftbeenden,Startwiederholen | abgewiesen |
| Transfer |9bEnglischStichtagwechsel | alterGrantende,anderesFach/Entwürfeerhalten |
| RollOver | neuesJahrerzeugen | gleicheIdentity,neueMembership,Archivunverändert |
| Reset | synthetischenCSVMarkerimportieren,Reset/Reload | RAMgelöscht,StoragekeinCSVMarker,keineNetzwerkübertragung |
| Darstellung | Desktop/Mobile,Keyboard,DE/EN | Originalassets/tokens,Focus/Dialogsbedienbar,keinefalschenAuthtexte |
| Erhaltung | gc39StagingScreenshot+lokalerOriginalstart | Logo,Crew,Startscreen/OriginalEditorerhalten,keinStandaloneMock |

Authorbrowser,unabhängigerReview,menschlicherNutzertestundphysischerGerätetestwerdengetrenntbelegt. Übersetzungsgrenzenoffennennen; keineautomatischevolleEN-Abnahme.

## Task12: Sicherung und Übergabe (Root-Schritt 14)

- [ ] SinnvolleZwischencommits nachBoundary/DomainCSV/UI. PushvorlangenTests; GitDNSFehlernichtmitSecretsprobesumgehen,ConnectorTrees/Commit/RefalsFallbackmitexakterParentprüfung.
- [ ] TODOfrischmainlesenundnurGC-CLASSROOM-ZeileimBranchfortführen. Statebleibtbranch_only; RegistrykeineSHA-Duplikation,Integrationszielunverändert.
- [ ] NachTestsfixiertenSHAanclassroom_contract_review/Rootübergeben; unabhängigeFindingsprüfen,gezielteRED→GREENFixes.
- [ ] FinaleURL127.0.0.1:8782,synthetischeCSVDownloads,kurzerKlickpfad,Code/CI/Deploy/Gerätetestgetrennt. KeinPRMerge/StagingDeploy.

## Planprüfung

Alle14Root-Schritt e sindobenTaskszugeordnet;EmulatoristbewusstoffeneFolgephase. GemeinsameSchnittstellen: App-PortliefertQuizID→AssignmentSnapshotreferenziertID→SchülerlisteprüftSnapshot+Membership; CSVliefertnormalisierteTextzeilen→Repositoryimportvergleichtschool/source/rawId→RollOverbehältIdentity. KeineNamezuIDFallbacks,keineProduktkeys,keineautorisierendenUIClaims. KleineImplementierungsdetailsentscheidetalleinigerWriter mitbegründetemEintraginderbestehendenÜbergabe.


## Ausführungsabschluss des ersten Lieferblocks

Am16.10.2026 wurde der lokale Lieferblock aus den Schritten1–11 und14 umgesetzt und geprüft; die ausdrücklich getrennte Backendfolgephase in Schritt12 bleibt offen. Der finale Produktkandidat ist0d99b33c7752563d7aa5e72768893c55ad4a464f. Die vorhandene App lädt tatsächlich ihre ursprünglichen Startup-, Editor-, Design- und Crew-Quellen. Der neue manuelle Testablauf erzeugt eine neue ID, die nach Speichern und ausdrücklicher Zuweisung unverändert in der persönlichen Testliste steht. Der Parser übernimmt ausschließlich lokal ausgewählte synthetische Dateien. Ein geänderter Unterrichtsbezug mit derselben Quellkennung ist ein sichtbarer, blockierender Konflikt.

Autorbelege:18Browserfälle,44gezielteRegressionsprüfungen,329Root-Prüfungen und erfolgreicher Build mit171Dateien. Unabhängiger Endreview PASS am Produktkandidaten, einschließlich44eigenenTests und vier gezielten Importfällen. Das sind Nachweise für diesen lokalen Lieferblock. Echte Authentifizierung, Serverrechte, reale ASV-Stabilität, schulischer Schlüsselbetrieb, physische Geräte, Deployment und Production wurden damit nicht bestätigt. Die vollständigen Belege, zeitliche Bindung und Grenzen stehen in der bestehenden Workstream-Übergabe und in evidence/20261016-browser-report.json sowie evidence/20261016-independent-review.json.


## 18.10.2026 — Bedienkorrektur Importsperre und nächster Lehrkräfteimport

Schülerimport: Die Zustimmung ersetzt keine Entscheidung bei ungeklärten Personen. Der Freigabebereich nennt den aktuellen Sperrgrund samt Anzahl offener Zuordnungen. „Offene Zuordnungen anzeigen“ springt zur ersten betroffenen Tabellenseite und fokussiert deren Entscheidung. Eine Änderung benötigt weiterhin eine neue Vorschau und erneute Zustimmung; keine automatische Zusammenführung oder Umgehung des serverseitigen Guards. Große vollständig geklärte Listen sind von jeder Tabellenseite bestätigbar, auch Seite6von7.

Zusätzlicher Nutzerwunsch ausdrücklich als nächster Ausbau: dauerhafter Lehrkräfte-CSV-Import in derselben Originaloberfläche. Vor-/Nachname, optional nachgewiesen stabile Personalreferenz und Kürzel importieren; Fächer/Unterrichtszuordnungen über explizites Mapping, keine erfundenen Exportspalten voraussetzen. Vorschau trennt neue/bestehende Lehrkraftdatensätze, Änderungen und unklare Zuordnungen; erst Zustimmung persistiert. Mehrere Lehrkräfte je Klasse und mehrere Fächer je Lehrkraft bleiben möglich. Ein Personalstammsatz ist kein Firebase-Login: Verbindung zum vorhandenen Lehreraccount nur ausdrücklich/verifiziert, keine automatischen Adminrechte, E-Mails oder Änderungen an bestehenden Tests. Aktuell weiterhin ausstehend; gemeinsames schulweites Backend/Rollenfreigaben sind davon getrennte Arbeitspakete.

## 18.10.2026 — Autorisierte Umsetzung: Lehrkräfteimport und direkte offene Entscheidungen

Der Nutzer beauftragt den dokumentierten Lehrkräfteimport jetzt ausdrücklich zur Umsetzung und vereinfacht die bestehende Schülerprüfung. Bestehender ausführlicher Plan/Originaloberfläche/Branch bleiben die Grundlage. Inlineausführung mit TDD und einem unabhängigen Abschlussreview; keine erneute Planfreigabe aus dem Skill ableiten, da dieser bestehende Ausbau bereits ausdrücklich umgesetzt werden soll.

1. Backend: `local-teacher-import.mjs` erstellt einen read-only Plan aus `{schoolYear,sourceNamespace,rows,decisions}`. Zeilen `{line,firstName,lastName,shortCode?,sourceId?,className?,subject?}`, maximal2000. Wiederholte stabile Quellkennung bündelt die Unterrichtspaare einer Person; widersprüchliche Namen/Kürzel unter derselben Kennung werden abgelehnt. Ohne Kennung keine automatische Zusammenführung durch Namen. Persistenter accountisolierter Lehrkräftebestand, atomare/hash-/revisionsgebundene Übernahme und separate Source-/Receiptindizes. Wenn Unterrichtspaare geliefert werden, werden die Paare des Zieljahres ausdrücklich durch die Vorschau ersetzt; frühere Jahre bleiben erhalten. Ein reiner Personalimport ohne Paarspalten erhält vorhandene Zuordnungen und nicht gemappte Kürzel. Max500 Lehrkräfte/200 Klassen/100Paare je Person+Jahr. Leeres Paar erlaubt reinen Personalimport, einseitiges Paar blockiert. Import wirkt nicht auf Firebaseaccounts, Rollen oder Quizdaten.
2. Mapping: `named-teacher-import.mjs`, beide Namen Pflicht, Kürzel/ID/Paar optional. Eine Zeile pro Paar; gleiche ausgewählte stabile Kennung für mehrere Klassen/Fächer. Keine automatische Auswahl einer IDspalte, keine unbewiesene CSVschulische Rolle. Mustercsv nur synthetisch.
3. Gemeinsamer Dialog: `openRosterImport(...,kind='students')`, Lehrkräfteadapter verwendet denselben Ablauf. Obere anklickbare Zähler filtern alle/neu/geändert/offen. Ungeklärte Entscheidungen werden gesammelt im selben Fenster bearbeitet; lokale Entscheidungsänderungen lassen übrige Zeilen stehen und ein kurzer gebündelter automatischer Previewaufruf hält den serververbindlichen Plan aktuell. Nie speichern mit laufender Prüfung/unaufgelöstem Zustand. Fokus/Scroll erhalten, finale Zustimmung wird bei Änderungen zurückgesetzt. Bestehendes Namensvorschlagsbutton ebenso automatisch prüfen, kein erzwungener erneuter Button-/Fensterwechsel.
4. Originalsidebar erweitert um Lehrkräfte, Bestandsliste mit Namen/Kürzel/Klasse-Fach-Jahr; Klassenkarten nennen zugeordnete Lehrkräfte/Fächer. `manual-roster`, `account-workspace`, CSS/i18n additiv. Suche, Update über Wiederimport, Daten nach Reload und Accountwechsel isoliert. Beispiel-CSV im Lehrkräftebereich. Kein behaupteter fremder Lehrerlogin aus dem Stammsatz.
5. Prüfungen: Backendtests zunächst rot→grün für Preview/read-only, wiederholte Quelle, Reimport/Jahreswechsel/Umbenennung, mehrere Lehrkräfte pro Klasse, fehlende Personen unverändert, Konflikte/ID-/Ownergrenzen, atomaren Rollback, Limits. Parser-/Dialog-/Navigationstests rot→grün: direkter Filter auf zwei späte offene Zeilen, mehrere Entscheidungen ohne manuelle Prüfung, Race/Fehler/Logout, Lehrerimport mit Paaren und erhaltener Originalseite. Bestehende gesamte Root-/Classroom-/HTTPsuite; echte Browserprobe nur synthetisch, kein Nutzerimport durch Agenten. Finaler unabhängiger Review am fixierten SHA.


Abnahme dieses lokalen Lieferblocks18.10.2026:375/375 Tests PASS, unabhängiger Gesamt- und gezielter Port-/Layout-/Katalog-Nachreview PASS. Echte Browserprobe im bestehenden normalen Account mit zwei künstlichen Lehrkräften/dreiPaaren, Persistenz nach Reload und direktem Zweientscheidungsfilter→automatisch gültiger Vorschau bestanden.49vorhandeneTests unverändert geladen, kein Testwrite. Namensstammsätze lokal, keine neuen Auth-/Adminrechte, kein Cloud-/Hostingdeploy. Details und Grenzen im [Nachweis](evidence/20261018-teacher-import.json).


<a id="schulverwaltung-accountverknuepfung-und-schuelerzugaenge"></a>
## Nächster Ausbau: Schulverwaltung, Accountverknüpfung, Schülerzugänge, Druck und Testzuweisung

**Auftrag:** Ausführlicher Plan, keine Produktumsetzung in diesem Turn. Martin möchte importierte Lehrkräfte mit ihren normalen Lehreraccounts verbinden, damit jede Person ihre Klassen/Fächer sieht und Schüler:innen Tests zuweisen kann. Eine Schule soll eine oder mehrere benannte Verwaltungslehrkräfte haben, typisch zwei oder drei. Ergänzung: persönliche Schülerkennung und QR-Zugang; kompakte Schülerlisten auf möglichst1–2Seiten sowie einzelne Blätter pro Person drucken. Weiter dieselbe vollständige lokale Website8782, normaler Login und vorhandene Tests erhalten.

**Planungsstand:** lokal40313fa4 / remote0d3b0525, identischer Treef5fb183e, Produkt zuletzt eed60c2.375Tests und echte lokale Lehrerimport-/49Quiz-Belege sind Nachweise der bisherigen Funktion, keine Abnahme dieses neuen Rollen-/Zugangsplans. Integration inzwischen5a248621 nach PR248 (Umgebungsisolation, Assessment-/Offline-Recoveryänderungen). Vor Umsetzung die betroffenen Auth-/Environment-/Assessmentverträge gegen diesen neuen Integrationsstand abgleichen; hier weder übernehmen noch deployen. Kein heimlicher Authprojektwechsel und keine Zuordnung über gleiche E-Mail über Projektgrenzen.

### A. Verbindliches Ziel und verständlicher Alltag

Nach Einrichtung gehört ein schulischer Klassen-/Personenbestand einer Schule. Die importierte Lehrkraft ist ein Personaleintrag, ihr Login ein eigenes bestehendes Konto. Eine überprüfte Verbindung schafft die Mitgliedschaft. Die Verwaltung weist den Personaleintrag Unterrichtsgruppen zu. Nach normaler Anmeldung erhält die Lehrkraft aus dieser Mitgliedschaft ihre Klassensicht; ihr privater Testbestand bleibt ihr eigener.

Beispiel mit erfundenen Personen: Ada ist Verwaltungslehrkraft und unterrichtet8bDeutsch; Mila und Leon sind ebenfalls Verwalter, Mila unterrichtet8bEnglisch, Leon9aTechnik. Alle nutzen ihre normalen persönlichen Logins. Die drei können Schulorganisation pflegen. Mila sieht nach Anmeldung8b/Englisch und ihre dortigen Schüler:innen; sie kann einen eigenen Test diesem Unterricht zuweisen. Sie erhält dadurch weder Adas private Entwürfe noch deren vollständige Deutsch-Auswertungen. Derselbe Schülerdatensatz hat je nach Unterricht mehrere zulässige Zuweisungen und einen persönlichen Zugang.

Einfacher Ablauf: Schule einrichten → eigenen Bestand geprüft übernehmen → Verwaltungsvertretung hinzufügen → importierte Lehrkräfte einladen/verknüpfen → Klassen/Fächer bestätigen → Schülerzugänge erstellen/drucken → vorhandenen Test mit Empfängervorschau zuweisen. Diese Aktionen verwenden die Originalnavigation und einheitliche Inlinevorschauen. Kein neuer Parallel-Login, keine neue Gesamtoberfläche und keine zweite Prüfungsengine.

### B. Was heute vorhanden ist und was wirklich fehlt

Vorhanden: normale Firebase-Lehreranmeldung; persönliche Tests mit gespeichertem `ownerId`; Schüler-/Klassen-/Lehrkräftebestand pro geprüftem Lehreraccount in lokaler SQLite; stabile interne IDs; CSVvorschau/Bestätigung; Lehrer-Unterrichtspaare als Daten; Schutz gegen unklare Zusammenführung.

Fehlt: schulische gemeinsame Datenhoheit, echte Rollen, Einladungen und bestätigte Accountverknüpfungen, serverseitige Unterrichtsrechte, persönliche Schülerauthentifizierung, ausgebbare/reproduzierbar druckbare Zugangscodes/QRs sowie freigegebene an Empfänger gebundene Testzuweisungen. Angelegte Schülerdatensätze sind noch keine angemeldeten Schülerkonten. Bestehende öffentliche Testcodes sind keine persönlichen Schülerkennungen.

Lokale Website und gemeinsames Backend sind zwei verschiedene Dinge. Unter127.0.0.1 bezeichnet jeder Rechner sich selbst. Mehrere normale Accounts lassen sich auf diesem Mac in getrennten Browserprofilen gegen dieselbe lokale SQLite prüfen; Kolleg:innen auf eigenen Geräten teilen diese Daten damit noch nicht. Eine lokal gespeicherte Rolle kann außerdem keine Cloud-Assessment-Function verlässlich autorisieren, die diesen Mac nicht als vertrauenswürdige Rollenquelle kennt.

Empfohlene Etappen: zuerst Schul-/Verknüpfungs-/Druckabläufe auf8782 mit lokalem Backend und abgesichertem Emulator prüfen. Danach dasselbe API-/Rollenmodell in einem qualifizierten gemeinsamen Testbackend bereitstellen, während die Bedienseite lokal bleiben darf. Echte mehrgerätefähige Schülerzuweisung setzt diese gemeinsame Rechte-/Assessmentquelle voraus. Ein späterer Functions-/Rules-/Indexesrelease und etwaige Cloud-Namensspeicherung bleiben ein ausdrücklich zu prüfender separater Schritt. Keine tatsächliche Veröffentlichung durch diesen Plan.

### C. Schule und ein bis mehrere Verwalter

Eine Schule erhält eine unveränderliche interne `schoolId`, Anzeigenamen, Betriebsstatus und das verbindliche Auth-/Backendprojekt. Die schoolId ist eine Referenz, kein geheimer Zugangsschlüssel. Eingegebene Schulnummer oder E-Mail-Domain allein begründet keine offizielle Schulhoheit.

Für den lokalen Pilot kann der aktuell verifizierte Bestandsinhaber einen ausdrücklich lokalen Schulentwurf erstellen und seinen eigenen Bestand dorthin übernehmen. Er verwaltet nur diesen lokalen Entwurf, keine dadurch als echt verifizierte andere Schule. Die erste Verwaltung einer tatsächlich gemeinsamen Schule wird über den Betreiber-/Schulverifikationsprozess mit benannter verantwortlicher Person freigeschaltet. Kein allgemeiner CSVwert `admin=true` und keine Selbsternennung für eine bestehende Schule.

Danach kann ein aktiver Schulverwalter eine bereits bestätigte Schulmitgliedschaft zur Verwaltung ernennen oder eine zusätzliche Person über denselben bestätigten Einladungsablauf aufnehmen. Sinnvoll sind zwei oder drei Verwalter; eine einzelne Person ist möglich, keine starre Dreiergrenze. Alle verwenden eigene Logins. Es gibt kein gemeinsam geteiltes Schulpasswort.

Die Ansicht **Schulverwaltung → Verwaltung & Zugänge** zeigt Name, eigenes bestätigtes Konto, Status und Verwaltungsrolle. Rollenänderungen bekommen eine klare Wirkungsvorschau. Die letzte aktive Verwaltung darf sich nicht selbst entfernen oder durch zwei konkurrierende Änderungen gleichzeitig verschwinden. Prüfung und Änderung laufen atomar. Weitere Verwalter erhalten die organisatorischen Rechte; persönliche Tests/alle Noten/Schlüsselverwahrung folgen daraus nicht automatisch.

Wenn ein Konto außerhalb dieses Schulmoduls gelöscht/gesperrt wird, kann tatsächlich die letzte Verwaltung ausfallen. Dann geht die Schule in einen Recoveryzustand; die Regel behauptet nicht, das Authsystem an jeder externen Sperre hindern zu können. Eine verbliebene Verwaltung kann eine andere Person verknüpfen. Bei Totalausfall gibt es einen dokumentierten Betreiber-/Schulnachweisprozess, keinen Hintertürcode oder eine bloße Namens-/Schulnummernabfrage. Rollenwiederherstellung und Wiederherstellung von Verschlüsselungsschlüsseln sind getrennte Aufgaben.

### D. Verknüpfung einer importierten Lehrkraft mit ihrem normalen Account

1. Verwaltung öffnet im vorhandenen Lehrkräftebereich die Zeile, Status **Noch nicht verbunden**, und wählt **Konto verbinden**.
2. Das System erstellt eine persönliche, widerrufbare Einladung für genau Schule+Personaleintrag. V1 bietet **Link kopieren**; keine automatische echte E-Mail oder weltweite Suche in allen Konten.
3. Die Person öffnet den Link auf derselben vorgesehenen Umgebung, meldet sich mit ihrem normalen Konto an und sieht Schule, eingeladenen Namen, vorgesehene Rolle und Unterricht. Kein fremder Schülerbestand ist vor Freigabe sichtbar.
4. **Mit meinem Konto verbinden** reicht die eigene, serverseitig verifizierte Kontoreferenz ein. Keine vom Client frei behauptete uid.
5. Die Verwaltung sieht die Anfrage in derselben Lehrkräftezeile, vergleicht die Kontodarstellung mit der tatsächlich bekannten Person und bestätigt einmal. Bei falschem Konto wird abgelehnt/Einladung erneuert. Erst diese Freigabe aktiviert Mitgliedschaft und Unterrichtsrechte.
6. Die Lehrkraft sieht anschließend nach normalem Login ihre Schule/Klassen/Fächer. Kein erneuter Import und kein neuer Account nötig. Ohne Schulzugehörigkeit funktionieren ihre bisherigen persönlichen Tests unverändert.

Zustände: unverbunden → eingeladen → Bestätigung ausstehend → verbunden; separat abgelaufen, widerrufen, gesperrt, ausgeschieden. Eine Einladung ist24Stunden gültig, enthält mindestens32zufälligeBytes und wird nur gehasht gespeichert. Der Link allein aktiviert keine Mitgliedschaft. Einmalverwendung, Widerruf, Rate-Limit und gebundene Schule/Umgebung verhindern beliebige Wiederverwendung. Fremde öffentliche Kontoprofile werden nicht als Suchdatenbank bereitgestellt. Einladungsgeheimnisse kommen nicht in Logs/Telemetrie/Referer; Hash-/Fragmentübergabe wird vor normalen Analytics entfernt.

Pro Schule höchstens eine aktive Verbindung Personaleintrag↔Kontoreferenz; ein Account kann Mitglied mehrerer Schulen sein, mit jeweils getrennten Rollen. Referenz ist `(authProjectId, uid)`, nicht der Name. Zwei gleichnamige Lehrkräfte bleiben getrennt. CSVänderungen können Namen, Kürzel und ausdrücklich bestätigte Unterrichtspaare ändern, niemals die verbundene uid oder Verwaltungsrolle. Ein Kontowechsel hat einen eigenen geprüften Übergabeablauf und verschiebt keine persönlichen Tests automatisch.

### E. Rollen und Sichtbarkeit

| Aktion | Schulverwaltung | Normale Lehrkraft |
|---|---|---|
| Schule, Schuljahre, Personalimporte organisieren | Ja, nur eigene Schule | Nein |
| Weitere Verwalter ernennen/entfernen | Ja, bestätigte Mitglieder, letzter Verwalter geschützt | Nein |
| Klassen/Fächer und Lehrkräftezuordnung pflegen | Ja, Änderungsvorschau | Eigene Zuordnungen sehen |
| Organisatorischen Schülerbestand sehen/pflegen | Eigene Schule | Nur eigene Unterrichtsgruppen; Pflege nur bei gesonderter Delegation |
| Schülerzugänge erstellen/zurücksetzen/drucken | Eigene Schule, ausdrücklich berechtigt | Eigene Gruppen bei explizitem Zugangsverwaltungsrecht |
| Eigenen privaten Testbestand nutzen | Wie bisher für eigenen Account | Wie bisher |
| Tests fremder Lehrkräfte bearbeiten | Kein pauschales Recht | Kein pauschales Recht |
| Eigenen Test zuweisen | Mit eigener aktiver Unterrichtszuständigkeit | Eigene aktive Unterrichtsgruppen |
| Ergebnisse anderer Fächer lesen | Kein pauschales Recht | Nur ausdrücklich berechtigte Zuweisung/Auswertung |

Die bestehende globale **Administration** ist nicht dieselbe Rolle wie **Schulverwaltung**. Es wird kein globales Firebase-/GradeCrewadminrecht gesetzt. UIausblenden genügt nie: Jede API prüft aktuellen Accountstatus, Schule, aktive Mitgliedschaft und Unterrichtsscope. Entzug wirkt bei der nächsten geschützten Anfrage, auch bei noch offenem Browser. Schulrollen liegen in aktueller serverseitiger Mitgliedschaft, nicht ausschließlich in möglicherweise alten IDtoken-Claims.

### F. Klassen und Fächer ohne tägliche Mehrarbeit

Aus einem importierten Paar8b/Deutsch entsteht eine Unterrichtsgruppe mit stabiler ID und Schuljahr. Zwei Lehrkräfte dürfen derselben Gruppe zugeordnet sein; eine Lehrkraft beliebig mehreren zulässigen Gruppen. Fächer bekommen schulbezogene stabile IDs. Bestehende Freitexte werden über eine Vorschau in diesen Katalog überführt; gleichnamige Testlabels werden nicht automatisch zu Rollen.

Die Verwaltung arbeitet möglichst in einer Tabelle: **Lehrkraft | Konto | Klassen/Fächer | Rolle | Status**. Ein Klick auf8b öffnet ihre Fächer-/Lehrkräftezuordnung. CSVimporte nutzen dieselbe direkte Offen-Prüfung, ergänzt um sichtbare Rechtewirkung, beispielsweise „Mila erhält8b/Englisch“. Fehlende Zeilen eines Teilimports entziehen keine Mitgliedschaften. Vollbestands-/Abgangsabgleich bleibt eine eigene ausdrücklich bestätigte Aktion.

Eine Lehreransicht zeigt nur ihre Gruppen im aktuellen Schuljahr; bei einer Schule keine dauernde Schulauswahl. Bei mehreren Schulen gibt es eine klare Schulauswahl. **Meine Tests** bleibt persönlich und vollständig. **Klassen → 8b → Englisch** zeigt Schüler:innen und Testzuweisungen dieses Unterrichts. Schuljahreswechsel ändert Gruppen-/Klassenmitgliedschaften, keine Lehrerlogin- oder Schüleridentität. Vertretung hat Beginn/Ende und konkreten Scope. Persönliche Entwürfe werden beim Lehrerwechsel nicht automatisch weitergegeben; laufende Prüfungen und benötigte Auswertungen benötigen eine ausdrückliche Übergabe.

### G. Persönliche Schülerkennung und QR-Zugang

Jede angelegte/importierte Person erhält eine stabile interne Schüler-ID. Ein persönlicher Zugang wird daraus getrennt erstellt: zufälliger nicht namensbasierter Code, QR-Link, Versionsnummer, Aktiv-/Sperrstatus. Als V1format20gut unterscheidbare Base32zeichen in fünf Vierergruppen; der Code wird kryptografisch zufällig erzeugt und niemals aus Name, Geburtstag oder ASV-ID berechnet. Schuljahr/Klassenwechsel oder Wiederimport lässt den gültigen Zugang unverändert.

Verwaltung/ausdrücklich berechtigte Klassenpflege wählt **Zugänge erstellen** für fehlende Zugänge. Vorschau nennt z.B.28fehlend/2bereits vorhanden. Ein erneuter Klick erzeugt keine neuen Codes für bestehende Personen. **Zurücksetzen** ist eine separate Aktion mit klarer Wirkung auf alten Code und Sitzungen. Abgang/Sperre beendet neue Zugriffe; historische Abgaben bleiben erhalten. Nur Besitz des Codes reicht nicht für jede beliebige Prüfung, sondern nur für aktuell berechtigte Zuweisungen dieser Identität.

QR öffnet den Schülerzugang im bestehenden GradeCrewprodukt. Er enthält eine richtige Zieladresse und den persönlichen Zugang, keine Bewertung/ASV-ID/Klassenliste. Lokale Test-QRs werden als nur auf diesem Mac nutzbar kenntlich gemacht. Ein Handy erreicht über127.0.0.1 nicht diesen Mac; mehrgerätefähige QRkarten dürfen erst die tatsächlich freigegebene gemeinsame HTTPSadresse verwenden. Keine scheinbar fertigen Karten mit einer für Schüler unerreichbaren Adresse drucken.

Schülerzugang und Lehreranmeldung haben getrennte Sitzungskontexte. Schülerlogin darf keinen Lehrkraftaccount abmelden oder ein Lehrertoken umdeuten. Lokal: eigene eng begrenzte serverseitige Schülersitzung, keine Lehrer-APIberechtigung. Gemeinsam: qualifizierter Student-Authadapter für dasselbe Secure-Assessmentbackend; keine ungeprüften localtokens an CloudFunctions. Der Zugriff prüft bei Start/Resume/Abgabe/Receipt Identität, Schule, Sitzungsversion und Zuweisung. Ungültig/gesperrt gibt eine verständliche Meldung, keine fremde Personensuche.

Wiederholbarer Druck: Lehrkräfte müssen Karten später erneut ausgeben können, ohne jedes Mal alle Codes zurückzusetzen. Daher Lookupdigest und verschlüsselt wiederlesbare Codeablage getrennt. Der Druckdienst darf Codes nur für aktuell erlaubte Personen entschlüsseln, nicht mit einer allgemeinen Schülerlistenabfrage ausgeben. Verschlüsselungsschlüssel liegt außerhalb SQLite/Git im qualifizierten Betriebsschlüsselspeicher; Backup/Restore vor Freigabe prüfen. Keine ungeprüfte Keychain-/Secret-Managerinstallation in diesem Planungsturn. Ohne verlässlich geschützten Schlüsselbetrieb darf die Funktion nicht als dauerhaft sicher wiederholbar freigegeben werden; einmalige Ausgabe ist ausdrücklich eine andere, eingeschränkte Zwischenstufe.

Technisch: zufälligeCodes mit Lookup-HMAC; Codeverschlüsselung AEAD mit AADschoolId/studentId/version, frischerNonce pro Datensatz und gesonderter Schlüsselrolle. Codes/Einladungen niemals plaintextloggen oder in allgemeinen Account-/Schullisten zurückgeben. Druck-/Zugriffsrechte und Rücksetzungen werden datenarm protokolliert. Eine Verwaltungsrolle ist nicht automatisch Besitz des Entschlüsselungsschlüssels.

### H. Schülerlisten und Einzelblätter drucken

Im Schülerbereich **Drucken** öffnet genau eine Vorschau mit Auswahlumfang (aktuelle Klasse, gefilterte Auswahl, einzelne Personen, ganze Schule nur mit Verwaltungsrecht) und zwei verständlichen Typen:

| Drucktyp | Zweck und Layout |
|---|---|
| Namensliste | Vorname/Nachname, Klasse, optional Fach; keine Zugangscodes standardmäßig. A4, ein- oder mehrspaltig, Ziel1oder2Seiten, tatsächliche Seitenzahl anzeigen. |
| Persönliche Blätter/Zugangskarten | Name, Klasse, persönlicher Code, QR und kurze Anmeldungshilfe; **eine Person pro A4-Seite** oder mehrere ausgeschnittene Karten pro Sammelbogen. |

Die Personenauswahl ist im Scope der angemeldeten Person serverseitig geprüft; Gesamtlisten sind keine Möglichkeit, fremde Schulen/Klassen zu exportieren. Layoutvorschau zeigt gesamte Personenzahl und erwartete Seitenzahl. Eine optionale Lehrkräftekarte ist nicht Bestandteil dieser Schülerzugangsfunktion.

1–2Seiten sind ein Ziel bei passender Auswahl, kein Grund zur unleserlichen Verkleinerung. Mindestschrift9pt für Listen, keine abgeschnittenen Namen und genügend QRgröße/Ruhezonen. Eine volle Schule mit Hunderten Zugangskarten passt nicht als lesbare QRsammlung auf zweiSeiten; dafür Sammelbogen oder Einzelblätter. Bei Überlauf Vorschau mit tatsächlicher Mehrseitenzahl und Klassenfilter anbieten; niemals heimlich Schüler weglassen. Exakte QRgröße mit echtem Handyscan prüfen, nicht nur mit einem Screenshot.

Drucken einzelner Blätter ist auch ohne Zugang möglich (nur Personendaten); mit Zugangscode/QR nur nach wirksamer Zugangserstellung und Druckberechtigung. Solange kein Code existiert, steht **Zugang noch nicht erstellt**, kein erfundener oder nicht gespeicherter QR. Wiederholter Druck benutzt denselben gültigen Code; verlorene Karte erfordert bewusste Rotation statt einfachem Reprint, wenn Missbrauch zu befürchten ist.

Vorschau ist einheitlich: Layoutwahl → gegebenenfalls fehlende Zugänge erzeugen → **„28 Einzelblätter drucken“** bzw. **„Klassenliste · 2Seiten drucken“**. Keine Kette zusätzlicher unklarer Bestätigungsdialoge. Abbruch des Systemdruckdialogs löscht oder rotiert keine schon erstellten Zugänge; verschlüsselte Ablage erlaubt späteren Reprint. Druckansicht ohne Seitennavigation, Coco, private Lösungen oder fremde Daten. PDF-/Browserdruck erzeugt keine automatische Cloudablage und kein Feedbackupload.

### I. Vorhandene Tests gezielt zuweisen

Lehrkraft öffnet einen vorhandenen eigenen Test und wählt **Zuweisen**. Dasselbe ist in ihrer Klasse/Fachgruppe möglich, mit vorausgewähltem Unterricht. Ein Dialog zeigt Schule, Klasse/Fach, Zeitpunkt/Modus, Teilnehmerzahl, einzelne Ausnahmen und aktuelle Empfängerliste. Nach Bestätigung entsteht eine Zuweisung zum bestehenden Test, keine automatisch duplizierte Testvorlage. `quizzes.ownerId` und vorhandene Test-IDs bleiben unverändert.

Server prüft: aktives berechtigtes Konto; bestätigte Schulmitgliedschaft; aktive Unterrichtszuordnung; Test gehört tatsächlich diesem Account oder hat ein ausdrücklich qualifiziertes Freigaberecht; Testversion und Sitzung stimmen; Empfänger gehören zur zulässigen Gruppe. Clientseitige `ownerId`/Klassenlabels sind kein Nachweis. Für die lokale Planung kann eine echte autorisierte lesende Firestoreabfrage mit Nutzer-IDtoken Eigentum prüfen; kein Admincredential aus Bequemlichkeit und keine komplette Lösungenkopie in der lokalen SchulDB.

Zuweisung speichert schoolId/groupId/quizId/sessionRunId, Vorlagenversion, Ersteller, Verfügbarkeit und Empfänger-IDs als nachvollziehbaren Snapshot. Änderungen an Gruppen vor Freigabe erfordern frische Empfängervorschau. Nach Prüfungsstart ist der Empfängerkontext unveränderlich; Nachzügler werden ausdrücklich gesondert ergänzt, nicht unbemerkt durch neue CSVzeilen. Änderungen während einer laufenden Prüfung öffnen keinen neuen Run und werten bestehende Abgaben nicht neu.

Bestehender Lifecycle führt aktuell den wirksamen `sessionRunId` am Quiz. V1 darf daher nicht für jede parallele Klassenzuweisung unbemerkt „reopen“ aufrufen. Gleiche Bedingungen können ausdrücklich denselben Run mit getrennten zulässigen Empfängergruppen verwenden; abweichende Termine/Modi werden als konfliktbehaftet erklärt und brauchen einen eigenen qualifizierten Run-/Snapshotvertrag. Dieser wird innerhalb derselben Assessmentengine umgesetzt, nicht mit einer zweiten Bewertung. Kein „Zugewiesen“-Erfolgsstatus, wenn lediglich eine lokale ungeschützte Liste existiert.

Persönlich zugewiesene Prüfungen brauchen einen ausgewiesenen Zugangsmodus: alle bestehenden start/resume/submit/receipt-Endpunkte prüfen die Schüler-/Assignmentbindung. Ein weiter gültiger allgemeiner Testcode darf diesen Modus nicht umgehen. Vorhandene alte Code-/Gasttests behalten ihren bisherigen Vertrag. Lösungen, private Kriterien und Auswertungen bleiben nach den bestehenden serverseitigen Freigaberegeln geschützt. Schulverwalter erhalten nicht automatisch Einsicht in alle Fächer.

In der persönlichen Schüleransicht erscheinen **Anstehend**, **Jetzt verfügbar**, **Erledigt**. Noch nichts zugewiesen ist ein ehrlicher Leerzustand. Dieselbe Schüleridentität empfängt Deutsch und Englisch verschiedener Lehrkräfte. Namensänderungen und Klassenwechsel ändern alte Empfänger/Ergebnisse nicht rückwirkend. Lehrerwechsel überträgt nur ausdrücklich freigegebene Unterrichts-/Prüfungszuständigkeit, keine privaten Vorlagen oder komplette Ergebnissammlungen.

### J. Datenmodell und serverseitige Verträge

Die vorgeschlagenen neuen Domänenmodelle werden von den vorhandenen SQLiteworkspaces getrennt, mit Migration statt stiller Umdeutung:

| Modell | Wesentliche Identität/Regeln |
|---|---|
| school | schoolId, name, authProjectId, draft/active/recovery, revision |
| schoolMember | schoolId, authProjectId+uid, active/pending/suspended/left, explizite organisatorische Rollen |
| staffAccountLink | schoolId, teacherPersonId, authProjectId+uid; beide Richtungen pro Schule aktiv eindeutig |
| schoolRoster | bisherige Schüler-/Lehrkraft-/Klassen-IDs im Schulsystem, keine Accountkopien |
| subject / teachingGroup | schoolId, stabile subjectId/groupId, classId, schoolYear; Anzeigename keine Berechtigung |
| teachingMember | groupId, teacherPersonId, gültigVon/Bis, fachlicher Scope; mehrere Lehrkräfte möglich |
| studentMembership | studentIdentityId, schoolId/classId, schoolYear, Zeitgrenzen |
| schoolInvitation / linkRequest | festes Ziel/Umgebung, Hash, Ablauf, Status, revisionsfeste Zustimmung |
| studentAccess | studentIdentityId, Codeversion, Lookupdigest, verschlüsselterCode, Status, Credentialschlüsselversion |
| studentSession | schoolId/studentIdentityId, Codeversion, Ablauf/Widerruf; keine Lehrerrechte |
| assessmentAssignment / recipient | Schule/Unterricht/quizId/runId/Version, feste Personenzuordnung und explizite Auswertungsrechte |
| schoolAuditEvent / migrationReceipt | minimale Akteur-/Aktion-/ID-/Zeit-/Revisionsmetadaten; keine Namen/Codes/Token-/Lösungspayloads |

Schreibvertrag: RequestActor ausschließlich aus verifiziertem Token (`authProjectId,uid`); jede Mutation `{command,payload,expectedRevision,operationId}` plus `previewHash` bei Bestands-/Rechte-/Migrations-/Empfängeränderungen. Fremde schoolId/groupId ist niemals ein akzeptierter Scopebeweis. Mutation liest Rollen und relevante Revision in derselben Transaktion; Idempotenz ist pro actor+school+operation gebunden. Rückgaben sind auf den aktuellen Akteur projiziert. Keine erst komplett geladene Schule, die nur im Browser nach Klassen gefiltert wird.

Vorgeschlagene Servicefunktionen (noch nicht vorhanden): `listMySchools(actor)`, `previewSchoolSetup(actor,input)`, `commitSchoolSetup(actor,input,previewHash)`, `createTeacherInvitation(actor,schoolId,teacherId)`, `claimTeacherInvitation(actor,secret)`, `approveTeacherLink(actor,requestId,expectedRevision)`, `changeSchoolRole(actor,input)`, `previewTeachingChanges(actor,input)`, `commitTeachingChanges(actor,input,previewHash)`, `previewStudentAccessIssue(actor,selection)`, `issueStudentAccess(actor,input,previewHash)`, `rotateStudentAccess(actor,studentId,expectedVersion)`, `createStudentSession(code)`, `preparePrintRoster(actor,selection,layout)`, `preparePrintAccess(actor,selection,layout)`, `previewAssignment(actor,input)`, `commitAssignment(actor,input,previewHash)`, `listStudentAssignments(studentSession)`.

Lokale Routefamilien `/api/classroom/schools`, `/api/classroom/invitations`, `/api/classroom/student-access`, `/api/classroom/print`, `/api/classroom/assignments`; Methoden und Payloadfelder pro Implementierungstest exakt festlegen. GET hat keine Seiteneffekte. Keine breite generische Updateobjekt-API für Rollen oder Codefelder. Serverseitiger Druck rendert nur erlaubte Projektionen; Namen/Geheimnisse nicht in URLparametern. Temporäre Druckdaten dürfen nicht unter statisch ausgelieferten Git-/Projektpfaden landen.

### K. Bestehenden persönlichen Bestand erhalten

Erste Migration hat eine eigene Vorschau: XKlassen, YSchüler, ZLehrkräfte, Unterrichtspaare, Quellenbelege und vorgeschlagene Verwalter. Nur der aktuelle autorisierte Bestandsinhaber darf seinen eigenen Bestand zur neu bestätigten Schule übernehmen. Initial kein Zusammenführen fremder persönlicher Bestände anhand gleicher Namen. Echte weitere Bestandszusammenführung ist ein gesonderter konfliktsicherer Vorgang.

Vor Commit konsistenten privaten Backupstand/Revision sichern. Die Übernahme läuft atomar; stabile IDs und vorhandene Quellbelege bleiben erhalten bzw. werden über einen expliziten mappingReceipt zu schoolId geführt. Rollen-/Freigabeänderungen tauchen in der Vorschau auf. Der alte Accountbestand wird nach erfolgreicher Aktivierung schreibgeschützt/migriert markiert; keine zwei konkurrierenden Wahrheiten. Alte Clientmutationen erhalten `workspace-migrated` und laden den neuen Kontext, statt weiter im alten privaten Bestand zu schreiben. Fehlgeschlagener Commit hinterlässt den alten Stand unverändert.

Neue Unterrichts-/Accountbindungen machen vorhandene Tests nicht zu Schuleigentum. Es werden weder49persönliche Quizvorlagen migriert noch deren `ownerId` geändert. Authprojektwechsel und die neuen Umgebungsregeln aus Integration5a248621 sind vor einer späteren Implementierung abzugleichen. Gleichlautende uid/email in verschiedenen Projekten ist kein Cross-Projekt-Identitätsbeweis.

### L. Umsetzung in überprüfbaren Paketen

Jedes Paket: zuerst scheiternde sinnvolle Verhaltenstests → kleinste Implementierung → gezielte Tests plus passende bestehende Regressionen → Code-/Handoffcheckpoint. Kein weiteres Produktpaket startet allein durch diesen Dokumentturn.

| Paket | Dateien/Verantwortung | Konkretes Ergebnis und Akzeptanz |
|---|---|---|
| 0 Basis/Umgebung abgleichen | bestehende firebase-config/app/startup/assessment-Portverträge, keine blinde Integration | Aktueller authProjectId/backend schriftlich fixiert; bisheriger Login/49Tests weiterhin sichtbar; originaler Owner-/Offlinevertrag erhalten. |
| 1 Schulen/Rollen/Migration | neu `tools/classroom-preview/local-school-store.mjs`, `local-school-policy.mjs`, `local-school-api.mjs` und Tests; bestehende store/api/server nur Adapter | Zweitkonto auf gleichem Mac hat nur erlaubte Schulprojektion; atomare Migration; Fremdschule abgewiesen; zwei parallele letzteAdminentfernungen können Schule nicht verwaltungslos machen. |
| 2 Einladungen/Verknüpfung | neu `school-invitations.mjs` plus UI `classroom/school-administration.mjs`; account-workspace/localclient additiv | Zwei echte normale Lehreraccounts können eine Einladung annehmen/bestätigen; falscher/abgelaufener/wiederverwendeter Link und ungeprüfte UID bleiben ohne Rechte; Mehrschule sauber getrennt. |
| 3 Unterrichtssicht | neu `classroom/school-context.mjs`, bestehende manual-roster/teacherimport um Schuladapter; group policy Tests | Admin pflegt8bDeutsch/Englisch mit unterschiedlichen Lehrkräften/Teamteaching; jeder sieht nur zugeordneten Bestand; Entzug greift bei nächster API; CSV kann keine uid/adminrechte setzen. |
| 4 Schülerzugänge | neu `student-access-service.mjs`, `student-session-api.mjs`, `classroom/student-access.mjs`, eigener Authadapter, Credentialstore/Restoretests | Jede ausgewählte Person erhält einen gespeicherten stabilen Zugang; gleiche CSV ändert ihn nicht; Rotation/Sperre macht alte Codes/Sitzungen unwirksam; Teacherlogin bleibt bestehen; Student hat nie Teacher-APIzugriff. |
| 5 Druck | neu `classroom/roster-print.mjs`, `roster-print.css`, Druckprojektion/QRgenerator über bestehende passende Bibliothek nach Bestandsprüfung | Klassenliste, lesbare große Gesamtliste,1Person/A4 und Sammelbogen; keine Kürzung langer Namen; richtige Person↔Code↔QR; wiederholter Druck ohne Codewechsel; fremde IDs/Rollenentzug während Druck werden abgewiesen. |
| 6 Zuweisung und Secure-Anbindung | neu `classroom/assignment-dialog.mjs`, Service `classroom-assignment-service`; bestehende Assessmentlifecycle/Rulestests nach freigegebenem gemeinsamen Backendplan | Nur eigener/belegbar freigegebener Test, richtige Gruppe/Empfängersnapshot, sichere Schülerbindung auf allen Lifecyclecalls; Parallelrun-Konflikt erklärt; keine neue Bewertungsengine, kein Gastcodebypass für assignedmode. |
| 7 Gesamtabnahme/Schreibfreigaben | bestehende Emulator-/Root-/HTTP-/Browserchecks, unabhängiger konkreter Kandidatenreview | Admin A/B/C, Lehrkraft D, zwei Schulen, zwei Schüler, Rechteentzug, Jahreswechsel, verlorenerQR, Reprint und bestehender Testbetrieb gemeinsam geprüft. Gemeinsamer Backend-/Rulesrelease braucht eigenen exakten Ziel-/SHA-/Daten-/Deployauftrag. |

Die Paketnummern sind Implementierungsreihenfolge, keine Zeit-/Budgetschätzung. Neue konkrete Fileschnittstellen im Startbrief des jeweiligen Pakets aus den oben benannten Services ableiten; keine noch nicht existierenden exports als vorhandene Fähigkeit ausgeben. Für den wiederholbaren Druck Schlüsselbetrieb/Restore zuerst qualifizieren, nicht erst nach Ausgabe echter Codes.

### M. Pflichtfälle für die Abnahme

- Eine, zwei und drei Verwaltungslehrkräfte; letzteSelbstentfernung, gleichzeitige Rollenänderung, extern gesperrtes letztes Konto und Recovery.
- Importierte Lehrkraft ohneLogin; vorhandenes Konto an richtiger/falscher Schule; Link weitergegeben/abgelaufen/widerrufen; zwei gleichnamige Personen; ein Account mit zwei Schulen; keine automatische E-Mail-/UIDfusion.
- Ein Lehrer zwei Fächer, zwei Lehrer ein Fach, befristete Vertretung, Wechsel mitten im Jahr, geänderter CSVname bei unveränderter Verbindung.
- Eigener und fremder Test; gleiches Quiz in zwei Klassen; neuerRun darf alteEmpfänger nicht invalidieren; private Lösungen/Ergebnisse und globales Adminrecht bleiben geschützt.
- Eine Schüleridentität in Deutsch/Englisch; Name/Klasse/Schuljahr ändern ohne neuesLogin; keineZuweisung→Leerzustand; fremder oder abgelaufener Zugang, Sperre/Rotation und alteSitzung.
- Print0/1/30/300Personen, sehrlange/mehrteilige/Umlautnamen, Auswahl über mehrereSeiten, doppelteKlicks, Druckdialogabbruch, keinQRohneCredential,1PersonproBlatt, lesbare1–2Seitenliste bzw. ehrlicherÜberlauf.
- QR auf echtem Handy zur richtigen tatsächlich erreichbaren Umgebung; loopbackkarte nicht als mehrgerätefähig ausgeben. Unautorisierter Reprint/Export scheitert serverseitig.
- Vor und nach Migration normaler Login, persönliche Tests/Editor/Ergebnisse/Coco und alte Gast-Testcodes unverändert; Fremdschool-Requests und manipulierterBrowserstatus bleiben wirkungslos.

### N. Grenzen, Nachweise und nächster Schritt

Diese Planung belegt keinen neuen implementierten Zugriff, keine Schüleranmeldung, keine Druckfunktion und keinen Deploy. Die vorhandenen375Tests bleiben beim bisherigen Produktstand. Neue Rollen-, Verknüpfungs-, Druck- und Assessmenttests werden erst mit tatsächlicher Umsetzung abgenommen. Zuständig bleibt der ausführende Classroom-Fachchat; für den späteren privilegierten Kandidaten ist ein unabhängiger Reviewer separat zu benennen. Relevante Kontrollen SEC04/06/07/08/11/14/17, PRIV01/07/08/17/20 sind für neue Fähigkeiten offen/nicht geprüft; keine pauschale Schul-/Rechtsfreigabe.

Produktentscheidungen dieses Vorschlags: gemeinsame Schulmitgliedschaft statt Kopien pro Lehrer; zwei oder drei persönliche Verwalter empfohlen; beiderseitig geprüfte Accountverknüpfung; aktuelle serverseitige Rollen statt reiner Tokenclaims; stabile Schülerkennung mit separater rotierbarer Zugangsversion; wiederholbarer geschützter Druck; dieselbe Secure-Assessmentengine; lokale Oberfläche bleibt, echter Mehrgerätebetrieb erfordert gemeinsame abgesicherte Daten-/Autorisierungsquelle. Fachliche Schulfreigaben, genaue ASV-ID und späterer Provider-/Schlüsselbetrieb bleiben Tatsachen, die vor dem jeweiligen Echtbetrieb belegt werden müssen.

Nächster ausführbarer Umsetzungsschritt nach Martins Planentscheidung: Paket0 und1, insbesondere vorhandenen persönlichen Bestand sicher einer lokalen Schule zuordnen und mehrere normale Accounts mit geprüften Schulrollen testen. Paket4/5 ergänzt die jetzt ausdrücklich gewünschten Schülercodes/QRs/Druckblätter, bevor Paket6 den vollständigen echten Schüler-Testablauf freigibt.

Technische Primärquellen geprüft18.10.2026: [Firebase-IDtokenprüfung](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [CustomClaims und deren Aktualisierung](https://firebase.google.com/docs/auth/admin/custom-claims), [Firestore REST-Authentifizierung und SecurityRules](https://firebase.google.com/docs/firestore/use-rest-api). Diese erklären Plattformverträge; Einladungsdauer, Rollenmatrix und Druckkonzept sind unsere Produktvorschläge, keine Firebase-Vorgaben. Kein neuer Authprovider oder Authdeploy aus dem gelesenen Firebase-Skill.


### N. Schnelle Schulorganisation und Schulwechsel — 21.10.2026

**Auftrag und Iststand:** Martin fragt nach dem noch fehlenden Verwalter sowie schneller Zuordnung bei vielen Klassen/Lehrkräften und späterem Schulwechsel. Dies präzisiert denselben Ausbauplan; keine Implementierungsfreigabe aus dieser Frage ableiten. Geprüft: lokal86a1951 nach4690172; letzter neuer Commit stellt nur die lokale Erreichbarkeit in der Übergabe dar. Die echte Persistenz in `local-roster-store.mjs` hat weiterhin Accountworkspaces und sechs bestehende Mutationsbefehle, keine Schulmitgliedschaften/Rollenprüfung. Ältere synthetische Schulrollen in `classroom/repository.mjs` sind ausschließlich Demo und zählen nicht als Umsetzung. Schulverwaltung/Accountverknüpfung/Zugriff bleiben offen.

#### N1. Ein Konto, getrennte Schulen und Unterrichtsrechte

Drei unterschiedliche Entscheidungen werden verständlich getrennt: **An welcher Schule bin ich? Was darf ich dort verwalten? Welchen Unterricht habe ich dort?** Der Name eines CSV-Personaleintrags entscheidet keine dieser Berechtigungen automatisch. Ein vorhandenes Konto bleibt unverändert; Schulmitgliedschaften verbinden es mit den jeweiligen schulischen Personaleinträgen. Mehrere gleichzeitige Schulen sind erlaubt.

Oben in der bestehenden angemeldeten Oberfläche steht die aktuelle Schule mit Schuljahr; bei mehreren Schulen ein Wechselmenü. Ohne verbundene Schule bleiben die bisherigen persönlichen Tests nutzbar. **Meine Tests** bleibt persönlich und wird beim Schulwechsel nicht in einen Schulbestand umgewandelt. Klassen/Schüler:innen/Lehrkräfte laden den ausdrücklich gewählten Schulkontext und erlaubten Unterricht. Persönliche Vorlagen und schulbezogene Zuweisungen sind in der Beschriftung erkennbar.

Ein normaler Lehrer sieht Klassen/Fächer seines aktiven Unterrichts; die Verwaltungsfunktion erscheint nur für die eigene aktive Verwaltungsrolle. Vorgeschlagene Ergänzung der vorhandenen Navigation: **Schulverwaltung** mit Unteransichten **Schule & Verwalter**, **Lehrkräfte**, **Unterrichtszuordnung**. Bestehende Lehrerlisten und Klassendetails werden wiederverwendet, kein zweiter paralleler Personalbestand und keine neue Gesamtoberfläche. Die abschließende Benennung wird am vorhandenen Menü geprüft, bevor weitere Navigation dupliziert wird.

#### N2. Verwalter einfach festlegen

Der erste lokale Schulentwurf und die verifizierte gemeinsame Schule bleiben wie inC unterschiedlich. In **Schule & Verwalter** werden bereits bestätigte Mitglieder ausgewählt und über **Als Verwalter einsetzen** ernannt. Üblich sind zwei oder drei Personen mit eigenen Konten; die Zahl ist nicht künstlich begrenzt. Vorschau nennt Person, Schule und organisatorische Befugnisse. Entziehen funktioniert am selben Ort; die letzte aktive Verwaltung bleibt geschützt.

Eine noch nicht verbundene Person kann als vorgesehener Verwalter eingeladen werden. Die Rolle bleibt bis zur geprüften Kontoannahme und ausdrücklichen Verwaltungsbestätigung inaktiv. Kein CSV-Import und kein gesetztes Kontrollkästchen im Browser erzeugt allein Schulhoheit. Eine Kontaktperson kann optional gekennzeichnet werden; dafür entsteht keine zweite mächtigere Adminrolle. Unterricht wird unabhängig zugeordnet: Ein Schulverwalter bekommt nicht pauschal jede Klasse, jedes Ergebnis oder fremde private Tests.

#### N3. Einrichtung für viele Klassen und Lehrkräfte

1. **Bestand übernehmen/importieren:** Klassen, Schüler:innen und Lehrkräfte einmal je Schule einrichten; vorhandene IDs und Quellenbelege erhalten. Unterrichtspaare aus CSV werden als Vorschläge übernommen. Ohne Unterrichtsdaten bleibt deren Zuordnung offen statt geraten.
2. **Konten verbinden:** Lehrkräfteliste zeigt **Nicht verbunden**, **Eingeladen**, **Bestätigung offen**, **Verbunden** sowie Klassen/Fächerzahl. Persönliche Links können gesammelt vorbereitet werden, bleiben aber individuell und widerrufbar. Keine automatische E-Mail. Ausstehende Verbindungen bleiben über einen oben anklickbaren Statusfilter auffindbar.
3. **Unterricht gesammelt zuordnen:** Zwei Ansichten arbeiten auf denselben Unterrichtsgruppen, beschrieben inN4. Unterricht darf vor der Kontoannahme vorbereitet werden; Zugriff entsteht erst aus bestätigter Mitgliedschaft und aktiver Zuordnung.
4. **Nur offene Stellen fertigstellen:** Oben anklickbare Zähler für fehlende Accountverbindung, Unterricht ohne Lehrkraft und unklare CSV-Zuordnung. Jeder Zähler öffnet direkt die passenden Zeilen und Entscheidungen, ohne manuelles Suchen über mehrere Seiten.
5. **Eine Änderungsvorschau bestätigen:** Neue/entfernte/befristete Zuordnungen mit betroffenen Personen, Klassen, Fächern und Wirksamkeitsdatum. Änderungen bleiben im selben Ablauf, offene Konflikte direkt dort bearbeiten. Nach Erfolg erscheinen dieselben Zuordnungen in Lehrer- und Klassenansicht.

Beispiel mit erfundenen Zahlen: Bei30Lehrkräften und20Klassen werden keine600einzelnen Freigaben angeklickt. Vorhandene CSV-Unterrichtspaare füllen den Plan; fehlende Fachzuordnungen werden gesammelt ergänzt. Die tatsächliche Zahl nötiger Entscheidungen hängt von der Exportqualität ab und wird nicht als feste Klickzahl versprochen.

#### N4. Zwei schnelle Wege zum gleichen Unterrichtsplan

**Von der Klasse aus:** Zeilen sind Klassen, Spalten die gewählten Fächer. Zellen zeigen zugeordnete Lehrkräfte als Namen/Kürzel. Suche, Schuljahr, Jahrgang, Fach und **Nur offene Zuordnungen** begrenzen die Ansicht. Eine Zelle darf mehrere Lehrkräfte enthalten. Leere Fächer, die an einer Klasse gar nicht unterrichtet werden, werden als **Nicht vorgesehen** vom tatsächlich fehlenden Lehrer unterschieden; keine unbelegten Warnungen in jeder leeren Matrixzelle. Der benötigte Fachumfang kommt aus bestätigtem Schulunterrichtsplan bzw. bewusster Auswahl, nicht aus erfundenen Pflichtfächern.

**Von der Lehrkraft aus:** In der vorhandenen Zeile **Unterricht bearbeiten** öffnen. Fach wählen, mehrere Klassen markieren, speichern. Beispiel: **Deutsch →8a,8b,9a** erzeugt drei konkrete Unterrichtszuordnungen; nicht einen pauschalen Zugriff auf alle Fächer dieser Klassen. Zweites Fach oder Teamteaching ergänzen dieselben Gruppen. Befristete Vertretung hat Beginn und Ende; sie ersetzt keine bestehende Lehrkraft unbeabsichtigt.

Verwaltung kann mehrere Zellen/Zeilen für dieselbe Aktion markieren, z.B. Lehrkraft hinzufügen, befristete Vertretung ergänzen oder eine bestimmte Person entfernen. Standardaktion **Hinzufügen** erhält die bisherigen Personen. **Ersetzen** ist gesondert beschriftet und zeigt ausdrücklich alle entzogenen Rechte. Kein pauschales **Alle Klassen freigeben** als Voreinstellung. Optionaler Klassenleitungseintrag ist organisatorisch und verleiht keine fremden Fachnotenrechte.

Die Lehreransicht und Klassenansicht sind zwei Darstellungen derselben Daten, keine getrennten Speichervorgänge. Eine riesige Lehrkräfte-mal-alle-Klassen-Matrix ist nicht die Standardansicht. Auf kleinen Bildschirmen erscheinen dieselben Klassen/Fächer als gefilterte Liste; Namen und Aktionen bleiben erreichbar.

#### N5. CSV und Schuljahreswechsel ohne Doppelpflege

Geeignetes Langformat: eine Zeile je **stabile Lehrerkennung + Klasse + Fach + Schuljahr**, optionale Gültigkeitsdaten. Wiederholte stabile Lehrerkennung bezeichnet dieselbe Person mit weiterem Unterricht. Unterschiedliche Exportspalten werden im vorhandenen Importablauf zugeordnet; kein bestimmter ASV-Spaltenname oder verfügbare Exportart wird ohne Beispielschema behauptet. Namen/Kürzel allein führen bei Mehrdeutigkeit zur Entscheidung.

Der schulbezogene neue Importvertrag unterscheidet **Ergänzen** (Standard) und **Vollständigen Unterrichtsbestand für ausgewählten Umfang ersetzen** (ausdrücklich gewählt). Eine fehlende Zeile in einer Teil-Datei entzieht standardmäßig keine Rechte. Leere Unterrichtsspalten bedeuten im Ergänzungsmodus **keine Änderung**. Bestehende Importsemantik der privaten lokalen Workspaces nicht stillschweigend umdeuten: Schuladapter und Vorschau zeigen die Unterschiede vor jeder Migration. CSV setzt niemals Konto-ID oder Verwalterrolle.

**Vorjahr übernehmen** erzeugt nur Vorschläge für das neue Jahr. Zielklassen werden über bestätigte Klassen-/Jahreszuordnungen bestimmt;8b→9b wird nicht allein aus Textarithmetik abgeleitet. Fach, Lehrkraft, Vertretungsende und Abgänge werden in der Änderungsvorschau sichtbar. Neue Klassen-/Jahresmitgliedschaft verändert alte Prüfungen oder deren Empfänger nicht rückwirkend.

Bei umfangreichen Listen bleiben Filter, Auswahl und Scrollposition erhalten. **Alle gefilterten auswählen** benennt Gesamtzahl und Auswahlumfang und meint nicht nur die aktuelle50erSeite. Serverseitige Auswahl wird an Schule, Filter, zulässige IDs und Bestandsrevision gebunden; geänderte Rechte/Revision erfordern eine neue Vorschau. Normale Lehrkräfte erhalten nur ihre erlaubte Datenprojektion; schulweite Listen werden paginiert statt alle Schülerdaten an jeden Browser zu senden.

#### N6. Schulwechsel und mehrere Einsatzschulen

Eine Lehrkraft zieht nicht mitsamt Datenbestand um. Sie erhält mit demselben Konto eine bestätigte Mitgliedschaft an der neuen Schule. Die bisherige Schule beendet ihre eigenen Unterrichtsrechte und ggf. die Mitgliedschaft zum vereinbarten Datum; die neue Schule bestätigt ihrerseits Aufnahme und Unterricht. Kein Verwalter vonSchuleA darf Rechte fürSchuleB erteilen. Gleichzeitige Beschäftigung an zwei Schulen bleibt möglich; ein bloßer Wechsel im Schulmenü kündigt keine Mitgliedschaft.

Ablauf in **Lehrkraft → Schulzugehörigkeit beenden**: Wirksamkeitsdatum wählen → betroffene Unterrichtsgruppen und laufende Prüfungen sehen → bei Bedarf Nachfolge zuordnen → Entzug bestätigen. Die neue Schule verwendet ihren gewöhnlichen Einladungsablauf. Beide Schritte sind unabhängig nachvollziehbar; kein unbelegtes globales Verschiebe-Recht zwischen Schulen.

Persönlicher Login und eigene Testvorlagen bleiben erhalten. Schüler:innen, schulische Zugehörigkeiten, alte Zuweisungen und Ergebnisse bleiben bei ihrer Schule. Ein früherer Lehrer behält nach Austritt nicht automatisch Zugriff auf Schulpersonen oder Schulresultate. Eventuelle weitergehende gesetzliche Aufbewahrungs-/Auskunftsanforderungen werden gesondert qualifiziert, nicht als pauschales technisches Dauerrecht vergeben. Bestehende private Testvorlagen dürfen keine Schulschülerlisten als unkontrollierte Kopie erhalten.

Bei laufenden Prüfungen endet die Lehrerberechtigung trotzdem zum bestätigten Datum. Vorher zeigt die Vorschau notwendige Betreuung/Nachfolge; Schülerabgabe/Synchronisation läuft im unveränderten Run weiter. Nur ausdrücklich qualifizierte Zuweisungsbetreuung geht an die Nachfolge, keine privaten Vorlagen und keine gesamten Ergebnisse aller Fächer. Ist keine erlaubte Übergabe möglich, wird der offene Fall klar angezeigt statt heimlich Eigentümerschaft zu überschreiben. Diese Fälle gehören zum späteren Assessmentpaket6; reine lokale Rollen dürfen keine echten Cloudrechte behaupten.

#### N7. Präzisierte Umsetzung und Abnahmekriterien

Die vorhandenen Pakete0–3 und6 bleiben die Reihenfolge. Paket1 baut Schulmitgliedschaft, mehrere Verwalter und sichere Bestandsübernahme; Paket2 verbindet echte Konten; Paket3 liefert beide Zuordnungsansichten, Bulk-Vorschau und zeitgebundene Rechte. Der Schulwechsel verwendet Mitgliedschafts-/Unterrichtsende plus separate Aufnahme; Paket6 ergänzt die echte Prüfungsübergabe. Keine dritte Rollen-/Importdatenbank.

| Zuständigkeit im bestehenden Plan | Zusätzlicher konkreter Abnahmetest |
|---|---|
| Paket1: `local-school-store.mjs`, `local-school-policy.mjs` | Ein Konto inA/B; AdminA kannB weder ernennen noch lesen; gleichzeitiges Entfernen der letzten beiden Verwalter lässt mindestens einen aktiv. |
| Paket2: `school-invitations.mjs` | Vorbereiteter Unterricht bleibt ohne bestätigten Account unwirksam; CSV-Kennung kann keine fremde Kontoverbindung übernehmen. |
| Paket3: bestehende `manual-roster.mjs`, neues `school-context.mjs`/Schulverwaltungsmodul | Deutsch für8a/8b/9a gesammelt hinzugefügt; Englischzugriff bleibt ausgeschlossen; Teamteaching erhalten; Klassen- und Lehreransicht zeigen identische Gruppen. |
| Paket3: Unterrichtsplanung und Schul-Importadapter | Teil-CSV entfernt keine Zuordnung; explizites Ersetzen benennt Entzüge; nicht vorgesehenes Fach meldet keinen fehlenden Lehrer; Vorjahresübernahme ändert keine historischen Gruppen. |
| Paket3: Bulk-/Lesepolicy | Auswahl über50/100Einträge und Seitenwechsel bleibt vollständig; zwischen Vorschau und Commit entzogene Rolle/Revision verwirft Commit; Client erhält keine Fremdgruppen. |
| Paket3/6: Mitgliedschaftsende und Assessmentadapter | Terminierter Austritt entzieht eigene Schulrechte, SchuleB/Konto/privaterTest unverändert; laufende Schülerabgabe bleibt idempotent; Betreuung nur explizit übergeben. |

Pro Paket erst diese Verhaltenstests reproduzierbar scheitern lassen, dann kleinste Umsetzung, gezielte Regression und Code-/Handoffcheckpoint. Prüfungen des aktuellen Dokumentturns sind nur Status-/Diff-/Planprüfungen und qualifizieren keine der noch fehlenden Produktfähigkeiten. Der erste nächste Umsetzungsschritt bleibt Paket0/1 nach Planentscheidung; normaler Login und bestehende Tests sind dabei verbindliche Regressionskriterien.


### Umsetzungsnachtrag 21.10.2026: lokale Schule und eigene Klassenwahl

Martins ausdrücklicher Umsetzungsauftrag umfasst Schule, mehrere Verwalter und die geprüfte Übernahme des vorhandenen Bestands. Sein anschließender Nachtrag ersetzt die frühere administrative Freigabe jeder Lehrerklasse: Sobald ein Mitglied durch eine Verwaltung bestätigt ist, wählt es seine Klassen selbst. Diese Mitgliedschaft gewährt keine Schulverwaltung oder privaten Tests anderer. Der lokale Schülerbestand für normale Mitglieder wird serverseitig auf die selbstgewählten Klassen projiziert. Prüfungs-/Ergebnisberechtigungen werden dadurch noch nicht implementiert.

Umgesetzt: neuer Schulbereich in Originalnavigation; lokale SQLite-Schulen/Mitglieder/Einladungen/Anfragen/Kontext/Revision; Namen/IDs/CSV-Belege unverändert übernehmen, logischen Originalsicherungsstand behalten, Altbestand nicht parallel beschreiben; bestehende normalen Lehreraccounts über einmalige24hEinladungscodes anfragen lassen, bestätigte Person als Lehrkraft oder Verwalter aufnehmen; widerrufen, ernennen/entziehen/entfernen und letzten aktiven Schulverwalter atomar schützen; eigene Klassenwahl/Suche; mehrere Schulen mit getrenntem Kontext. Einladungscode statt zusätzlicher URL-Fragmentverarbeitung in diesem lokalen Paket: persönlich kopieren/einfügen, keine E-Mail oder automatische Fremdkontensuche. Code wird nur einmal ausgegeben und nur gehasht gespeichert.

Konkrete Dateien: `tools/classroom-preview/local-school-store.mjs` ist Schul-/Mitgliedschafts-/Migrationsservice in derselben privaten DB; vorhandener Rosterstore dient weiter als interner Bestandsadapter. `local-roster-api.mjs` prüft den Actor weiter über den vorhandenen Firebaseaccounts:lookup-Aufruf, bindet ihn an das serverseitige Authprojekt und dispatcht die zusätzliche `/api/classroom/school`-Route. `classroom/local-school-client.mjs`/`school-administration.mjs` ergänzen die vorhandene Workspace-Navigation; einzig neue erlaubte Originalansicht inapp.js ist `accountSchoolView`. Authkonfiguration, SDK, Test-/Bewertungs- und Quiz-Ownerpfade bleiben unverändert.

Verifiziert am Produkt04409e9: 563Tests mit bestehendem UI-VMFlag und vorhandenen Firebase-Testabhängigkeiten; einschließlich Migrationrollback bei synthetischem DBfehler,3Verwalter, konkurrierendem Rollenentzug, Fremdschule, Kontext-/Revisionkonflikt, Einladung/Annahme/Bestätigung/Widerruf, selbstgewählter Klassenprojektion, ursprünglichem Login-DOM/Testbestand und Logout-/Refreshisolation. Unabhängiger Review meldete2P2 (Refreshcache, letzte verbleibende Schule nach Mitgliedschaftsentzug); beide RED→GREEN behoben und nachgeprüft. Browser auf8782 bestätigt bestehenden Startbildschirm und normales Anmeldeformular; angemeldete echte Übernahme und mehrgerätefähiger Betrieb nicht geprüft. Kleinere offene Bediengrenze: nach fehlgeschlagenen Formularaktionen müssen Eingaben teilweise erneut eingegeben werden.

Weiterhin außerhalb dieses Pakets: externe/offizielle Schulverifikation und Recovery ausgefallener letzter Authkonten, echte Geräte anderer Kolleg:innen, Fächer-/Prüfungsbetreuung, sichere Testzuweisung, Schülerzugänge/QR/Druck und explizite Verbindung importierter Lehrkräfte mit ihren Personaleinträgen. Bestätigung eines lokalen Mitglieds ist noch keine automatische Fusion mit einem CSV-Personaleintrag. Keine neuen Cloudrechte.
