# GradeCrew Classroom – ASV-Import und Datenschutzarchitektur

Stand: 05.10.2026  
Task: `GC-CLASSROOM-01`  
Status: Rechts-/Architekturreview, keine Rechtsberatung, kein Produktcode, kein Deploy.

## Aktuelle Präzisierung für Schuljahreswechsel

Der neue [Identitäts-/ASV-Abgleichsentwurf](CLASSROOM_IDENTITY_ASV_ROLLOVER.md) präzisiert die frühere „lokale Mapping-Datei“: empfohlen werden ein schulisch verwalteter Schlüssel und lokal berechnete HMAC-Pseudonyme aus dem bestätigten ASV-Differenzierungsmerkmal. Ein verschlüsseltes schulisches Mapping bleibt Alternative. Die Rohdatei, Namen und rohe ASV-ID werden weiterhin nicht an GradeCrew übertragen.

Das neue Dokument ist ein Architekturvorschlag zur Prüfung. Es enthält Schlüsselverwaltung/Recovery, schulspezifische Identität, Jahresmitgliedschaften, Importumfang, Abgänge und getrennte Aufbewahrung. Die ältere Aussage „Referenz optional“ gilt nur für eine Erstanlage: zuverlässig automatischer Wiederimport erfordert eine bestätigte stabile Kennung. Name, Alias und Zugangscode sind keine Ersatzschlüssel. Historische Leistungsnachweise brauchen eine erforderliche schulische Zuordnung; dauerhaftes Mapping und Codeausgabe werden getrennt. Noch kein Produktcode und kein Deploy.

## 1. Ergebnis in einem Satz

Für GradeCrew V1 soll ein ASV-/CSV-Import **nur lokal im Browser** ausgewertet werden. Vorname, Nachname und eine etwaige ASV-Referenz werden ausschließlich zur lokalen Zuordnung verwendet und **nicht an GradeCrew-Server übertragen oder dort gespeichert**. GradeCrew erhält nur eine pseudonyme StudentIdentity, ein zufälliges klassenbezogenes Alias und die für Authentifizierung/Zuordnung nötigen technischen IDs. Die Lehrkraft erhält lokal eine Zuordnungsliste Name ↔ Alias ↔ persönlicher Zugangscode.

## 2. Rechtsrahmen Bayern / DSGVO

### Erforderlichkeit statt "ASV exportiert es, also dürfen wir es"

Art. 85 Abs. 1 Satz 1 BayEUG erlaubt Schulen die Verarbeitung der personenbezogenen Daten, die zur Erfüllung der gesetzlich zugewiesenen schulischen Aufgaben erforderlich sind. Daraus folgt nicht, dass jedes in ASV vorhandene oder exportierbare Feld an einen externen Dienst übertragen werden darf.

Quelle:
- https://www.gesetze-bayern.de/Content/Document/BayEUG/true

§ 46 BaySchO verlangt zusätzlich, dass Verarbeitungstätigkeiten sich in dem geregelten Rahmen bewegen. Anlage 1 enthält für digitale Anwendungen unter anderem Benutzerkennungen, lokale User-IDs, Gruppen-/Kursmitgliedschaften und Auswertungen absolvierter Tests als mögliche Datenkategorien.

Quellen:
- https://www.gesetze-bayern.de/Content/Document/BaySchO2016-46
- https://www.gesetze-bayern.de/Content/Document/BaySchO2016-ANL_1

Das Bayerische Kultusministerium erläutert für Lern-Apps aktuell: Bei verpflichtender Einführung kann Art. 85 Abs. 1 Satz 1 BayEUG die Rechtsgrundlage sein, wenn die Verarbeitung zur schulischen Aufgabe erforderlich ist; ansonsten kann eine Einwilligung erforderlich sein. Die Freiwilligkeit einer Einwilligung im schulischen Verhältnis ist kritisch zu prüfen.

Quelle:
- https://www.km.bayern.de/recht/datenschutz-an-schulen

### Datenminimierung und Privacy by Design

Art. 5 Abs. 1 Buchst. c DSGVO verlangt Datenminimierung. Art. 25 DSGVO verlangt Datenschutz durch Technikgestaltung und datenschutzfreundliche Voreinstellungen und nennt Pseudonymisierung ausdrücklich als mögliche Maßnahme.

Quelle:
- https://eur-lex.europa.eu/eli/reg/2016/679/oj

Für GradeCrew bedeutet das: Wenn Klarnamen für den laufenden Dienst nicht benötigt werden, sollen sie nicht nur "versteckt", sondern gar nicht erst serverseitig erhoben werden.

### Pseudonym ist weiterhin personenbezogen

Ein Alias wie `M17` ist nicht anonym, wenn die Schule über eine Zuordnungsliste die Person bestimmen kann. Art. 4 Nr. 5 DSGVO definiert Pseudonymisierung gerade über diese getrennt gehaltene Zusatzinformation.

Quelle:
- https://eur-lex.europa.eu/legal-content/DE-EN/TXT/?uri=CELEX%3A02016R0679-20160504

Daher in Produktcopy niemals pauschal "anonym" schreiben, sondern "pseudonym", "Kürzel" oder "Alias".

### Schule bleibt verantwortlich, GradeCrew ist im Regelfall Auftragsverarbeiter

Wenn GradeCrew Schülerdaten ausschließlich im Auftrag der Schule und nach deren Weisung verarbeitet, ist die Schule Verantwortlicher und GradeCrew regelmäßig Auftragsverarbeiter. Dann braucht es die Anforderungen aus Art. 28 DSGVO, insbesondere eine Auftragsverarbeitungsvereinbarung und kontrollierte Unterauftragsverarbeiter.

Das Kultusministerium nennt externe Softwareanbieter und Rechenzentren ausdrücklich als typische Auftragsverarbeiter.

Quellen:
- https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/
- https://www.km.bayern.de/recht/datenschutz-an-schulen

GradeCrew darf Schülerdaten deshalb nicht für eigene Werbung, individuelles Profiling, Modelltraining oder sonstige eigene Zwecke verwenden. Für solche eigenen Zwecke könnte die datenschutzrechtliche Rollenverteilung anders ausfallen.

### Sicherheit

Art. 32 DSGVO verlangt ein risikoadäquates Schutzniveau und nennt unter anderem Pseudonymisierung und Verschlüsselung.

Quelle:
- https://eur-lex.europa.eu/legal-content/DE-EN/ALL/?from=DE&uri=CELEX%3A32016R0679

### Transparenz

Die Schule muss nach Art. 13 DSGVO über Zweck, Rechtsgrundlage, Empfänger, Speicherdauer, Betroffenenrechte und Datenschutzbeauftragten informieren. Das Kultusministerium stellt dafür Muster bereit und weist darauf hin, dass neue lokale Verfahren gegebenenfalls ergänzt werden müssen.

Quelle:
- https://www.km.bayern.de/recht/datenschutz-an-schulen

### Datenschutzbeauftragter / DSFA

Das Kultusministerium verlangt bei der Auswahl digitaler Werkzeuge die Einbeziehung des örtlichen Datenschutzbeauftragten. Für öffentliche Stellen ist außerdem zu prüfen, ob eine Datenschutz-Folgenabschätzung nach Art. 35 DSGVO erforderlich ist. Der BayLfD stellt dafür aktuelle Prüfhilfen und die Bayerische Blacklist bereit.

Quellen:
- https://www.km.bayern.de/recht/datenschutz-an-schulen
- https://www.datenschutz-bayern.de/nav/1801.html

## 3. ASV-Import – Zielarchitektur

### Importdatei

GradeCrew unterstützt zunächst eine minimale Schülerdatei:

```csv
Vorname;Nachname;Klasse;Referenz
Max;Mustermann;1a;ref1
Lisa;Straußenberg;3a;ref2
```

Davon werden benötigt:
- Vorname: nur lokal für die Zuordnungsliste;
- Nachname: nur lokal für die Zuordnungsliste;
- Klasse: darf als organisatorische Gruppenzuordnung an GradeCrew übertragen werden;
- Referenz: für eine reine Erstanlage optional; für zuverlässigen automatischen Wiederimport ist eine bestätigte stabile Kennung erforderlich. Nur lokal verwenden, niemals roh an GradeCrew übertragen.

Nicht importieren:
- Geburtsdatum;
- Geschlecht;
- Anschrift;
- Telefonnummer;
- E-Mail;
- Eltern-/Sorgeberechtigtendaten;
- Staatsangehörigkeit;
- Religion;
- Förder-/Gesundheitsdaten;
- sonstige ASV-Merkmale.

Wenn ASV eine größere CSV liefert, nimmt der GradeCrew-Parser nur die erlaubten Spalten entgegen und verwirft alle übrigen Felder sofort.

## 4. Wichtig: kein Akronym aus Vor- und Nachnamen

Nicht empfohlen:
- `MM` für Max Mustermann;
- `LiStr`;
- Geburtsjahr + Initialen;
- Name-Hash ohne geheimen Schlüssel.

Warum:
- in einer Klasse sehr leicht rückzuordnen;
- kollisionsanfällig;
- verrät Teile des Namens;
- bleibt ein schwächeres Pseudonym als nötig.

Empfohlen:
- zufälliges, klassenbezogenes Alias, z. B. `M7Q4`, `K2PX`, `S8N3`;
- alternativ für jüngere Klassen ein neutrales, von Namen unabhängiges Schema;
- Alias und Login-Code strikt trennen.

Das Alias ist sichtbar und darf nicht als Sicherheitsgeheimnis behandelt werden.

## 5. Persönlicher Zugangscode

Beispiel:
`7KPM-W4TX-N8QR`

Eigenschaften:
- zufällig / CSPRNG;
- ausreichend hohe Entropie;
- nicht aus Name, Alias, Klasse oder Geburtsdatum ableiten;
- serverseitig nicht als Klartext dauerhaft speichern;
- HMAC-/Credential-Index;
- bei Verlust neu erzeugen;
- alter Code sofort ungültig;
- Code nicht in Telemetrie oder Logs.

## 6. Lokal-Import-Ablauf

1. Lehrkraft wählt die ASV-/CSV-Datei im Browser.
2. Browser liest sie lokal via File API.
3. Kein Upload der Rohdatei.
4. UI zeigt lokal Namen/Klassen zur Prüfung.
5. Für jede Zeile erzeugt der Client:
   - `studentIdentityId` bzw. Create-Request,
   - zufälliges Alias,
   - persönlichen Zugangscode.
6. An GradeCrew gesendet werden nur:
   - technische StudentIdentity;
   - Klassenmitgliedschaft;
   - Alias;
   - Credential-Digest bzw. serverseitige Codeanlage;
   - keine Namen;
   - keine rohe ASV-Referenz.
7. Die Rohdatei und Namensdaten werden nach Abschluss aus dem UI-/JS-Zustand entfernt.
8. Lehrkraft erhält lokal eine Zuordnungsliste.

## 7. Schulische Zuordnung und separate Codeausgabe

Beispiel:

```csv
Vorname;Nachname;Klasse;GradeCrew-StudentIdentity;GradeCrew-Alias
Max;Mustermann;1a;stu_beispiel1;M7Q4
Lisa;Straußenberg;3a;stu_beispiel2;K2PX
```

Diese Datei wird **lokal erzeugt** und nicht zurück an GradeCrew hochgeladen.

Die dauerhafte Zuordnung ist personenbezogen und enthält keine Zugangscodes. Neue Codes werden separat einmalig als Karten oder kontrollierte Ausgabe bereitgestellt. Deshalb:
- deutlicher Sicherheitshinweis;
- nur auf schulisch freigegebenem Speicher ablegen;
- nicht über private Mail/Cloud versenden;
- Ausdruck sicher verwahren;
- nicht länger als nötig aufbewahren;
- bei Code-Neugenerierung alte Codeausgaben ungültig machen und nicht mehr erforderliche Kopien vernichten; die dauerhafte Identitätszuordnung bleibt bestehen.

V1 speichert die Zuordnung Name ↔ Alias bewusst nicht auf GradeCrew-Servern.

## 8. Wiederholter ASV-Import / Schuljahreswechsel (früherer Entwurf)

Die folgende Mapping-Variante bleibt als Alternative dokumentiert. Der aktuelle, vollständigere Architekturvorschlag und die empfohlenen HMAC-/Recovery-Regeln stehen im [Schuljahreswechsel-Entwurf](CLASSROOM_IDENTITY_ASV_ROLLOVER.md).

### Privacy-first V1

Beim ersten Import erzeugt GradeCrew zusätzlich eine lokale Mapping-Datei:

```
Schule + ASV-Quell-Namensraum + ASV-Referenz -> GradeCrew studentIdentityId
```

Die rohe ASV-Referenz bleibt ausschließlich in dieser lokalen Mapping-Datei.

Beim nächsten Import lädt die Lehrkraft:
- aktuelle ASV-CSV;
- vorhandene GradeCrew-Mapping-Datei.

Der Browser gleicht beide lokal ab und sendet nur Änderungen:
- neu;
- Klasse gewechselt;
- nicht mehr vorhanden.

GradeCrew erhält weiterhin niemals die ASV-Referenz.

### Spätere Komfortoption

Ein stabiler Import-Schlüssel könnte lokal aus der ASV-Referenz mittels HMAC und einem schulischen Secret abgeleitet werden. Das darf erst eingeführt werden, wenn Secret-Verwaltung, Gerätewechsel und Recovery sauber gelöst sind. Kein ungesalzener Hash kurzer/strukturierter ASV-Kennungen.

## 9. Zwei Account-Stufen

### Verifiziert / für Leistungsnachweise

- von Lehrkraft per ASV/CSV oder manuell angelegt;
- Alias vorgegeben;
- persönlicher Zugangscode ausgegeben;
- Mitgliedschaft aktiv;
- geeignet für zuordenbare Leistungsnachweise.

### Selbstbeitritt / für Übungen

- Schüler:in gibt Klassencode ein;
- System erzeugt Alias automatisch;
- Status standardmäßig `pending`;
- Lehrkraft bestätigt;
- für formelle Prüfung erst nach bewusster Verifikation verwenden.

Wichtig: Ein selbst gewähltes Kürzel beweist keine Identität.

## 10. Keine Namen in Schüler-UI oder Telemetrie

GradeCrew-Server:
- kein Vorname/Nachname in StudentIdentity;
- kein Name in Membership;
- kein Name in Submission;
- nur `aliasSnapshot`.

PostHog/Produkttelemetrie:
- kein Alias;
- keine Klasse im Klartext, wenn für Metrik nicht nötig;
- keine Zugangscodes;
- keine ASV-Referenzen;
- keine Schülerantworten;
- keine Namen.

KI:
- Identitätsdaten und Zugangscodes nie an KI-Provider senden;
- Freitextantworten sind ein gesonderter Datenschutzpfad, da sie selbst personenbezogene Angaben enthalten können.

## 11. Löschung und Aufbewahrung

Klassen-/Accountdaten und Leistungsnachweise brauchen getrennte Retention-Regeln.

BaySchO § 37 zählt auch digital gespeicherte Leistungsnachweise zu den Schülerunterlagen. § 40 legt dafür grundsätzlich eine Aufbewahrungsfrist von zwei Jahren fest, beginnend mit Ablauf des Schuljahres, in dem der Leistungsnachweis angefertigt wurde.

Quellen:
- https://www.gesetze-bayern.de/Content/Document/BaySchO2016-37
- https://www.gesetze-bayern.de/Content/Document/BaySchO2016-40

Daraus folgt für GradeCrew:
- nicht pauschal alle Schülerdaten nach 30/90 Tagen löschen;
- unterscheiden zwischen technischer Account-/Login-Historie und dem eigentlichen Leistungsnachweis;
- Schule muss entscheiden können, ob GradeCrew die offizielle Aufbewahrungsstelle ist oder ob ein exportierter Nachweis anderweitig geführt wird;
- Löschkonzept pro Datenkategorie dokumentieren.

## 12. Vertrags-/Produktpflichten vor echtem Schuleinsatz

GradeCrew soll vor produktiver Nutzung mit echten Schülerdaten mindestens bereitstellen:

1. AVV nach Art. 28 DSGVO;
2. TOM-Dokument;
3. Liste der Unterauftragsverarbeiter;
4. Speicher-/Datenstandorte und Drittlandtransfer-Konzept;
5. Lösch- und Aufbewahrungskonzept;
6. Art.-13-Baustein für Schulen;
7. Verzeichnis-/Beschreibung der Verarbeitungstätigkeit als Hilfestellung;
8. Export-/Lösch-/Berichtigungsfunktionen;
9. Incident-/Datenschutzverletzungsprozess;
10. DSFA-Erforderlichkeits-Check bzw. Vorlage;
11. klare Zusage: keine Schülerdaten für Werbung/Training/eigene Profile.

## 13. Produktentscheidung für GradeCrew V1

**Beschlossenes Privacy-by-Default-Zielbild:**

- ASV-/CSV-Import ja.
- Rohdatei bleibt lokal.
- Namen dürfen für Importvorschau und lokale Zuordnung verarbeitet werden, verlassen aber nicht das Gerät.
- Keine Namen im GradeCrew-Schülerkonto.
- Kein aus Namen erzeugtes Akronym.
- Zufälliges Alias.
- Persönlicher Zugangscode bleibt separate geheime Credential.
- Verifizierte Accounts für Leistungsnachweise werden durch die Lehrkraft angelegt.
- Selbstbeitritt ist ein eigener, schwächerer Vertrauensmodus.
- Dauerhafte Zuordnung Name ↔ StudentIdentity/Alias wird schulisch verwahrt; einmalige Codeausgabe bleibt getrennt.
- Production erst nach separatem Datenschutz-/Vertragsreview.
