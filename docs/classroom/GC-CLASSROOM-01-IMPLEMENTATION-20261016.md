# GC-CLASSROOM-01 Implementation Plan

> **For agentic workers:** Bei späterer Umsetzung `superpowers:executing-plans` verwenden. Ein Writer im bestehenden isolierten Checkout. Dieser Auftrag liefert zunächst den ausführlichen Plan; keine Produktimplementierung oder Veröffentlichung vor Martins Planprüfung. Bestehende Task-ID und Versuchshistorie erhalten.

**Goal:** Dauerhafte Schüler- und Klassenverwaltung mit manueller Pflege, ASV-/CSV-Abgleich und persönlichen Schülerzugängen in die vorhandene GradeCrew-Website integrieren; bestehende Lehreranmeldung, Tests und Testabläufe erhalten.

**Architecture:** Die bestehende App bleibt die Oberfläche und die einzige Test-/Bewertungsanwendung. Ein schulbezogener Classroom-Dienst ergänzt Identitäten, Mitgliedschaften, Fachzuständigkeiten und Testzuweisungen über serverseitig geprüfte APIs und Firestore. ASV-Dateien werden im Browser ausgewertet; stabile Quellkennungen werden mit einem schulischen Schlüssel pseudonymisiert. Personenidentität, Jahresmitgliedschaft, Anzeigename und Zugangscode bleiben getrennt.

**Tech Stack:** Vorhandenes HTML/CSS/Browser-ESM, bestehende Firebase-Auth-/Firestore-Konfiguration, Assessment-Functions in CommonJS auf Node 22, vorhandener Node-TestRunner und Browserprüfstand. Kein Frameworkwechsel; keine neue Prüfungsengine. Neue Abhängigkeiten nur bei konkret nachgewiesenem Bedarf und separater Prüfung.

**Spec:** [Teacher UX](../CLASSROOM_TEACHER_UX_V1.md), [Masterprojekt](../CLASSROOM_STUDENT_MASTERPROJECT_V1.md), [Identität und Jahreswechsel](../privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md), [ASV-Datenschutzkonzept](../privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md). Die aktuelle Nutzerpräzisierung vom 18.10.2026 und dieser aktuelle Planteil ersetzen widersprechende frühere Demo-/RAM-Anforderungen. Die am Ende erhaltene Historie ist keine aktuelle Implementierungsanweisung.

**Stand:** 18.10.2026; detaillierter Umsetzungsvorschlag zur Nutzerprüfung, nicht implementiert. Aufgabenbranch `feature/classroom-integrated-preview-20261016`; Integrationsziel weiterhin `feature/gradecrew-app-integration`. Ausgangscode lokal `60295f223cc9a1daf56dc0e22da87c48400b0d73`, remote `505d22c4243f5578b65eb66b033a1584e3987e9a`, identischer Tree `e40635b8a72fa670ff16983a6dd7a5cda3319d92`. Unterschiedliche Commit-SHAs entstehen durch die bereits dokumentierte Connector-Sicherung, nicht durch einen anderen Produktbaum.

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
