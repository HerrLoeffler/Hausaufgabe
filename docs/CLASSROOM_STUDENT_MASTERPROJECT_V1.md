# GradeCrew Classroom Masterprojekt V1

Stand: 05.10.2026  
Task: `GC-CLASSROOM-01`  
Workstream: `classroom-student-management-v1`  
Aufgabenbranch: `feature/classroom-student-management-v1`  
Integrationsziel: `feature/gradecrew-app-integration`  
Status: **Planung / branch_only – keine Produktimplementierung, kein Deploy**

## Aktueller Auftrag: Identität und ASV-Wiederimport präzisieren

Der [Schuljahreswechsel-Entwurf](privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md) konkretisiert die Identität über Jahre: ASV-Differenzierungsmerkmal, lokal berechnetes schulbezogenes HMAC-Pseudonym, stabile StudentIdentity, schulischer Schlüsseltresor, Recovery und kontrollierter Jahresabgleich. Es ist ein Architekturvorschlag zur Prüfung; Umsetzung ist nicht freigegeben.

Er präzisiert insbesondere die Abschnitte 3/5/13/21/26: „globale“ Identität bedeutet künftig innerhalb des Schulmandanten; `schoolId` und schulische Importadministration ergänzen das Einzel-Owner-Modell; Klassen/Memberships werden jährlich geführt; Mapping enthält keine dauerhaft gespeicherten Zugangscodes; individuelle Import-/Student-IDs sind auch keine Produkttelemetrie. HMAC ist empfohlener Abgleichmodus mit vollständigem Recovery-Konzept, verschlüsseltes schulisches Mapping bleibt Alternative. Alte allgemeine Schemata sind vor Implementierung an diesem Entwurf zu prüfen.

## 0. Verbindliche Ausgangslage

Dieses Masterprojekt baut **nicht** einen zweiten Prüfungsserver parallel zu GradeCrew.

Frisch geprüft:
- aktueller gemeinsamer Web-Integrationsstand: `feature/gradecrew-app-integration@bb91ce3590d773472ece60c4dd881da729bd32c1`;
- Secure-Assessment-Code ist bereits im aktuellen Integrationsstand vorhanden (`secure-student.*`, `secure-assessment-client.js`, `assessment-functions/`, Secure-Rules und Tests);
- der alte Primary Branch `feature/secure-assessment-v1@76417085...` ist laut Live Development Status weiterhin aktiv, aber gegenüber dem Integrationsziel stark divergiert (+15/-504); seine einzigartigen Änderungen betreffen überwiegend Build-/Preview-/Responsive-/Koordinationsdateien, nicht einen neuen unabhängigen Classroom-Kern;
- Production bleibt unverändert.

Konsequenz: Die Klassen-/Schülerfunktion wird als **Identitäts-, Organisations- und Freigabeschicht über dem bestehenden Secure-Assessment-Lifecycle** gebaut. Keine zweite Attempt-/Submission-Engine, keine doppelte Punkteberechnung, keine parallele Lösungsschlüssel-Logik.

---

# 1. Produktziel

GradeCrew bekommt zwei bewusst getrennte Schülerzugänge.

## A. Schnell beitreten

Für spontane Tests, Übungen, Vertretung und Klassen ohne dauerhaft angelegte Schülerprofile.

1. Testcode oder QR öffnen.
2. Kürzel eingeben.
3. Test beitreten.
4. Kein Schülerkonto, keine E-Mail, kein Passwort.
5. Secure Assessment übernimmt Attempt, Lösungsschutz, serverseitige Bewertung und Resume.

Das übernimmt die Stärke von paddy: minimale Hürde, Link/QR, temporärer Zugang.

## B. Meine Klassen

Für wiederkehrende Lerngruppen und Leistungsnachweise.

1. Lehrkraft legt eine Klasse an.
2. Sie legt Kürzel an oder erlaubt kontrollierten Selbstbeitritt.
3. Jede Schüleridentität erhält einen persönlichen Zugangscode – ohne E-Mail und klassisches Passwort.
4. Nach Anmeldung sieht die Schülerperson nur ihre freigegebenen Tests.
5. Ein Test kann an eine oder mehrere Klassen oder gezielt einzelne Mitglieder freigegeben werden.
6. Lehrkraft kann Beitritt, Start, Pause/Schließen, Nachschreiben und Ergebniszugriff steuern.

Das übernimmt die Stärke von ANTON: stabile Gruppen, individuelle Codes und wiederkehrende Zuordnung – aber datensparsamer, weil GradeCrew keine Klarnamen erzwingt.

---

# 2. Zentrale Architekturentscheidung

## Nicht machen

Für V1 **keine neue Top-Level-`examRuns`-Engine** parallel zum vorhandenen Secure Assessment einführen.

GradeCrew besitzt bereits:
- `sessionRunId`,
- serverseitige Attempts,
- Token-gebundenes Resume,
- private Grading-Daten,
- idempotente Submission,
- serverseitige Bewertung,
- Warteraum / Teacher Start,
- Deadline-/Retry-Schutz,
- kontrollierte Lösungsausgabe.

Eine zweite Run-Architektur würde aktuell mehr Risiken als Nutzen erzeugen.

## Stattdessen

Neue Ebene:

```
Klasse
  -> Mitgliedschaft
  -> StudentIdentity
  -> AssessmentAssignment
  -> bestehender Secure Assessment Run (quizId + sessionRunId)
  -> bestehender Attempt / Submission
```

Die neue `AssessmentAssignment` beantwortet nur:

> Wer darf an diesem konkreten sicheren Durchlauf teilnehmen?

Der sichere Prüfungsserver beantwortet weiterhin:

> Welche Aufgaben werden ausgeliefert, wann darf gestartet/abgegeben werden und wie wird bewertet?

---

# 3. Identitätsmodell

## 3.1 Keine Schüler-E-Mail und kein normales Passwort

Lehrkräfte bleiben bei Firebase Authentication.

Schüler:innen verwenden einen **persönlichen GradeCrew-Zugangscode**. Der Backend-Endpunkt prüft den Code und stellt anschließend ein Firebase **Custom Token** für eine pseudonyme StudentIdentity aus.

Warum das besser zum aktuellen Stack passt als ein neuer Cookie-Login:
- vorhandene Firebase-/Callable-Infrastruktur bleibt nutzbar;
- Functions sehen eine echte authentifizierte Schüleridentität in `request.auth`;
- keine Schüler-E-Mail und kein Schülerpasswort;
- Sessions können widerrufen werden;
- keine eigene parallele Session-Plattform nötig;
- Klasse und Alias müssen nicht in Custom Claims stehen und können serverseitig aktuell geprüft werden.

Custom Claims enthalten höchstens:

```js
{
  role: "student",
  studentIdentityId: "stu_..."
}
```

Keine:
- Klasse,
- Alias,
- Testcode,
- Note,
- personenbezogenen Details.

## 3.2 Alias ist klassenbezogen

Die globale StudentIdentity besitzt **keinen sichtbaren Namen**.

Das sichtbare Kürzel liegt ausschließlich in der Mitgliedschaft:

```
Klasse 9b -> Mitglied M17 -> studentIdentityId stu_xxx
Klasse Förderkurs -> Mitglied Tiger4 -> dieselbe stu_xxx
```

Vorteile:
- weniger unnötige Verkettung über Klassen hinweg;
- ein Zugang kann Mitglied in mehreren Klassen sein;
- Alias kann pro Lerngruppe passend gewählt werden;
- Ergebnis-Snapshots bleiben eindeutig.

## 3.3 Persönlicher Zugangscode

Beispiel:

`7KPM-W4TX-N8QR`

Regeln:
- mindestens ca. 60 Bit nutzbare Entropie;
- keine leicht verwechselbaren Zeichen;
- Groß-/Kleinschreibung tolerant;
- Bindestriche/Leerzeichen bei Eingabe tolerieren;
- niemals im Klartext dauerhaft speichern;
- Index über HMAC-SHA256 mit serverseitigem Secret;
- Code beim Erstellen/Zurücksetzen **einmal vollständig anzeigen**;
- verloren -> neu erzeugen, alten Code ungültig machen;
- bei Sicherheitsreset Refresh Tokens widerrufen.

ANTON erlaubt Lehrkräften das spätere Nachsehen eines Codes. GradeCrew macht bewusst die sicherere Variante: **nicht nachsehen, sondern neu erzeugen**.

---

# 4. Drei Code-Arten – nicht vermischen

## Testcode
Bestehender GradeCrew-Testcode / QR. Öffnet einen Test.

## Klassencode
Gemeinsamer Code zum Beitritt zu einer Klasse. Rotierbar. Standardpolicy: `approval`.

## Persönlicher Zugangscode
Geheimer Code einer StudentIdentity. Ersetzt Schüler-E-Mail/Passwort.

UI, Datenmodell und Hilfetexte müssen die drei Begriffe konsequent trennen.

---

# 5. Firestore-Zielmodell

## `classes/{classId}`

```js
{
  ownerId: "teacherUid",
  name: "9b",
  schoolYear: "2026/27",
  gradeLabel: "9",

  status: "active",              // active | archived

  joinEnabled: true,
  joinPolicy: "approval",        // closed | approval | open
  joinCodeVersion: 3,

  memberCount: 24,
  pendingCount: 1,

  createdAt: Timestamp,
  updatedAt: Timestamp,
  archivedAt: null
}
```

Der Klartext-Klassencode muss nicht als öffentlich clientlesbares Feld in diesem Dokument liegen. Bevorzugt serverseitiger Index analog zum persönlichen Code.

## `classes/{classId}/members/{membershipId}`

```js
{
  studentIdentityId: "stu_xxx",

  alias: "M17",
  aliasKey: "m17",

  status: "active",              // pending | active | removed
  source: "teacher",             // teacher | self

  createdAt: Timestamp,
  approvedAt: Timestamp,
  approvedBy: "teacherUid",

  removedAt: null,
  lastSeenAt: Timestamp
}
```

Alias:
- Unicode NFKC normalisieren;
- 1–24 Zeichen;
- Leerraum normalisieren;
- innerhalb einer Klasse eindeutig;
- niemals als HTML einsetzen;
- alte Ergebniszeilen behalten `aliasSnapshot`.

## `studentIdentities/{studentIdentityId}` – serververwaltet

```js
{
  status: "active",
  accessCodeVersion: 2,
  createdAt: Timestamp,
  lastLoginAt: Timestamp,
  revokedAt: null
}
```

Kein:
- Name,
- E-Mail,
- Telefonnummer,
- Geburtsdatum,
- Klasse.

## `studentAccessIndex/{digest}` – server-only

```js
{
  studentIdentityId: "stu_xxx",
  codeVersion: 2,
  active: true,
  createdAt: Timestamp
}
```

`digest = HMAC(secretVersion, normalizedCode)`.

## `classJoinIndex/{digest}` – server-only

```js
{
  classId: "class_xxx",
  joinCodeVersion: 3,
  active: true,
  expiresAt: null
}
```

## `assessmentAssignments/{assignmentId}`

Ein Assignment ist die Zielgruppen-Snapshot-Schicht für **einen bestehenden Secure Run**.

```js
{
  ownerId: "teacherUid",

  quizId: "AB12CD",
  sessionRunId: "run_xxx",

  audienceType: "classes",       // public | classes | members
  classIds: ["class_9b"],

  guestPolicy: "disabled",       // disabled | allowed
  joinState: "open",             // open | locked | closed

  createdAt: Timestamp,
  updatedAt: Timestamp,
  closedAt: null
}
```

Wichtig:
- kein Array mit hunderten Schüler-IDs in einem Dokument;
- gezielte Einzelzuweisungen über Subcollection.

## `assessmentAssignments/{assignmentId}/memberGrants/{studentIdentityId}`

Für Nachschreiber, Einzelfreigaben und Differenzierung.

```js
{
  active: true,
  membershipId: "mem_xxx",
  classId: "class_9b",

  // Optional, ohne Grund/Diagnose zu speichern:
  timeAdjustmentMinutes: 10,

  createdAt: Timestamp
}
```

## Existing Attempts / Submissions

Bestehende Secure-Assessment-Struktur bleibt maßgeblich.

Beim Klassenmodus werden Attempt/Submission um serverseitig erzeugte Zuordnung ergänzt:

```js
{
  identityMode: "class",          // guest | class | teacher_preview
  studentIdentityId: "stu_xxx",
  membershipId: "mem_xxx",
  classId: "class_9b",
  assignmentId: "asg_xxx",
  aliasSnapshot: "M17"
}
```

Für Legacy-Kompatibilität kann `studentName` vorübergehend parallel als Alias-Snapshot geschrieben werden. Neue Logik darf sich aber nicht auf clientseitig gesendeten `studentName` verlassen.

---

# 6. Backend-Verträge

Neue Funktionen bevorzugt in eigener modularer Bibliothek; Callable-Exports dürfen später in eine eigene Functions-Codebase `classroom` ausgelagert werden, damit Assessment-Deploys kontrolliert bleiben.

## Lehrkraft

```ts
createClass(input)
updateClass(input)
archiveClass(input)

bulkCreateClassMembers(input)
updateClassMemberAlias(input)
removeClassMember(input)
approveClassMember(input)

rotateClassJoinCode(input)
regenerateStudentAccessCode(input)

createAssessmentAssignment(input)
updateAssessmentAssignmentAudience(input)
lockAssessmentAssignment(input)
closeAssessmentAssignment(input)

getClassDashboard(input)
getClassMembers(input)
getClassAssignments(input)
```

Jede Teacher-Function:
- `request.auth` erforderlich;
- Rolle teacher/admin;
- Ownership serverseitig prüfen;
- keine Owner-ID aus dem Client vertrauen.

## Schüler

```ts
exchangeStudentAccessCode(input)
getStudentHome()
joinClassWithCode(input)
getMyMembershipStatus(input)

resolveAssessmentEntry(input)
```

Secure Assessment wird erweitert, nicht ersetzt:

```ts
startAssessmentAttempt({
  quizId,
  // guest only:
  studentName?
})
```

Serverlogik:

```txt
wenn auth.role == student:
  Assignment für quizId + sessionRunId laden
  aktive StudentIdentity prüfen
  aktive Mitgliedschaft / memberGrant prüfen
  Alias serverseitig aus Membership lesen
  Attempt mit identityMode=class anlegen
sonst:
  nur wenn Assignment public/guest erlaubt
  studentName validieren
  bestehender Guest-Flow
```

Der Browser darf im Klassenmodus **niemals** bestimmen:
- studentIdentityId,
- membershipId,
- classId,
- aliasSnapshot,
- Zeitbonus,
- Punkte.

---

# 7. Student-Login – Code Blueprint

```js
const HUMAN_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function normalizeHumanCode(raw) {
  return String(raw || "")
    .normalize("NFKC")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
}

function normalizeAlias(raw) {
  const alias = String(raw || "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ");

  if (alias.length < 1 || alias.length > 24) {
    throw new Error("INVALID_ALIAS_LENGTH");
  }

  return {
    alias,
    aliasKey: alias.toLocaleLowerCase("de-DE")
  };
}
```

Produktiv:
- CSPRNG;
- Rejection Sampling statt Modulo-Bias;
- HMAC mit versioniertem Secret;
- Rate-Limit vor teuren Reads;
- App Check erst nach echter Safari/iPad-Kompatibilitätsprüfung erzwingen.

---

# 8. Lehrer-UX

Neue Hauptnavigation:

`Tests | Klassen | ...`

## Klassenübersicht

Jede Klasse zeigt:
- Klassenname;
- Schuljahr;
- aktive Mitglieder;
- offene Tests;
- letzte sinnvolle Aktivität;
- Status aktiv/archiviert.

Direkt:
- `+ Neue Klasse`
- öffnen
- `•••` für seltene Aktionen.

## Klassendetail

Tabs:

`Übersicht | Schüler:innen | Tests | Ergebnisse | Einstellungen`

### Schüler:innen

Oben kompakte Zugangskarte:
- Klassencode;
- QR;
- Link kopieren;
- Beitritt ein/aus;
- `Bestätigung nötig` / `Direkt aufnehmen`;
- Code rotieren.

Darunter Mitgliederliste:
- Kürzel;
- Status;
- letzte Aktivität;
- offene Tests;
- Zugang;
- `•••`.

Aktionen:
- Kürzel ändern;
- Zugangscode neu erzeugen;
- entfernen;
- Ergebnisse ansehen.

Massenaktionen:
- mehrere Kürzel per Zeilenumbruch einfügen;
- optionale CSV später;
- neue persönliche Codes als Druckkarten ausgeben.

**Keine öffentliche Schülerliste im QR-/Join-Bereich.**

### Tests

Status:
- geplant;
- freigegeben;
- wartet;
- läuft;
- geschlossen.

Aktionen:
- öffnen;
- Beitritt sperren;
- starten;
- schließen;
- ausgewählte Nachschreiber freigeben;
- Ergebnisse.

---

# 9. Veröffentlichen / Freigeben

Im bestehenden Publish-Flow neue Sektion:

## Für wen ist dieser Test?

### Jede Person mit Code
- bestehender Gastmodus;
- Kürzel erforderlich;
- optional Teacher Start.

### Klasse(n)
Mehrfachauswahl aktiver Klassen.

### Einzelne Schüler:innen
Für Nachschreiben oder Differenzierung.

Beim Veröffentlichen:
1. Secure Assessment erzeugt/rotiert den bestehenden `sessionRunId`.
2. Classroom-Service erzeugt genau ein `assessmentAssignment` für diesen Run.
3. Audience wird als Snapshot gebunden.
4. Secure Start prüft dieses Assignment.
5. Nach Ende bleibt der historische Assignment-Snapshot für Ergebnisse bestehen.

Ein späteres Ändern der Klassenmitglieder darf historische Submissions nicht umetikettieren.

---

# 10. Schüler-UX

## Öffentliche Startseite

```txt
GradeCrew

[ Testcode eingeben                ]
[ Beitreten ]

[ Mit persönlichem Zugangscode anmelden ]
```

## Gast

```txt
Deutsch – Satzglieder

Wie sollen wir dich anzeigen?
[ Kürzel ]

[ Test beitreten ]
```

## Persönlicher Zugang

```txt
Dein GradeCrew-Zugang
[ 7KPM-W4TX-N8QR ]

[ Anmelden ]
```

Danach:

```txt
Hallo M17

Deine Tests
• Deutsch – Satzglieder      Bereit
• Mathe – Prozentrechnung    Morgen 09:00
```

Keine fremden Schüler, keine Rangliste, keine Klassenliste.

## Geteilte Geräte

Standard:
- Session-Persistenz;
- klarer Button `Abmelden`;
- persönliche Codes nicht im Browser anzeigen.

Optional später:
- `Auf diesem Gerät merken` bewusst aktivieren;
- Lehreroption für gemeinsam genutzte Geräte.

---

# 11. Selbstbeitritt

Default: `approval`.

1. Schüler:in gibt Klassencode ein.
2. Kürzel wählen.
3. System erzeugt pseudonyme StudentIdentity + persönlichen Zugangscode.
4. Membership = `pending`.
5. Lehrkraft sieht Anfrage.
6. Bei Freigabe -> `active`.
7. Bei Ablehnung -> kein Klassenzugriff; Identity kann nach TTL ohne relevante Daten bereinigt werden.

`open` ist möglich, aber nicht Standard.

`closed` deaktiviert Self-Join vollständig.

Pending Join Requests erhalten eine kurze TTL, z. B. sieben Tage. Konkrete Löschfristen werden vor produktiver Nutzung datenschutzfachlich festgelegt.

---

# 12. Prüfungssicherheit

Diese Funktion darf Secure Assessment nicht zurückbauen.

Pflicht:
- keine Antwortschlüssel im Browser;
- keine verbindlichen Client-Punkte;
- bestehende idempotente Submission;
- serverseitige Zeit;
- bestehender `paperSecret`/Grading-Key;
- Assignment-Autorisierung vor Attempt-Erzeugung;
- Schüler kann Alias im Klassenmodus nicht selbst als Identität vortäuschen;
- entfernte Mitgliedschaft verliert Zugang zu neuen Starts;
- vorhandene bereits abgeschlossene Ergebnisse bleiben historisch erhalten;
- Lehrer-Vorschau ist `teacher_preview` und erzeugt **keine echte Schülerabgabe**.

---

# 13. Datenschutz

Produktcopy darf nicht „anonym“ versprechen.

Korrekt:
- Kürzel;
- Alias;
- pseudonyme Schüleridentität;
- keine E-Mail erforderlich.

Grundsätze:
- kein Klarnamenzwang;
- kein Geburtsdatum;
- keine Telefonnummer;
- keine Schüler-E-Mail;
- Codes nicht in Telemetrie;
- Aliase nicht in PostHog;
- keine Antworten in Produkttelemetrie;
- keine vollständigen IP-Adressen dauerhaft speichern;
- Ergebnisse nicht pauschal automatisch löschen, bevor schulrechtliche Aufbewahrung geklärt ist.

Technische Events dürfen nur IDs/Status zählen, z. B.:
- `class_created`;
- `membership_approved`;
- `assignment_started`;
- `student_login_success`;
- `student_login_rate_limited`.

Keine Alias-/Code-Properties.

---

# 14. Internationalisierung

Von Tag 1 an über den bestehenden i18n-Core.

Trennung:
- `interfaceLocale`: UI der Person;
- `contentLocale`: Sprache des Testinhalts.

Keine neue Classroom-Datei soll sichtbare DE-Texte dauerhaft hardcoden.

Mindestens:
- DE/EN-Katalog;
- locale-aware Datum/Zeit;
- keine Textbestandteile in Bildern;
- QR hat textlichen Fallback;
- Statuschips nicht nur farblich;
- Alias/Klasse nicht „übersetzen“.

---

# 15. Accessibility / Geräte

Pflicht:
- Keyboard vollständig;
- sichtbarer Fokus;
- Touch Targets sinnvoll groß;
- Screenreader-Labels;
- QR immer zusätzlich als Code/Link;
- Reduced Motion;
- iPad Safari;
- iPhone Safari;
- Desktop Chrome;
- mindestens ein geteilter iPad-Workflow mit Abmelden/Neuanmelden.

---

# 16. Testseitenstrategie

## Phase T0 – Mock-Seite

Isolierte statische Testseite mit Fake-Daten:
- Klassenübersicht;
- Klassendetail;
- Codekarten;
- Publish-Zielgruppen;
- Schüler-Home;
- Lobby;
- kein Firebase-Schreiben.

Ziel: UX mit Martin testen, bevor Backend gebaut wird.

## Phase T1 – Emulator

Firebase Emulator:
- Custom-Token-Login;
- Klassen;
- Memberships;
- Assignment-Autorisierung;
- Secure Assessment Adapter;
- Rules;
- Revocation;
- Rate Limits.

## Phase T2 – isolierter Firebase Hosting Preview

Nur `hausaufgabe-staging`, eigener Preview-Channel.

Kein normales Staging-Cutover.

Assessment-/Classroom-Functions nur mit exakt dokumentiertem Scope deployen.

## Phase T3 – echter Staging-Pilot

Erst nach T0–T2 und Combined CI:
- 1 Testklasse;
- künstliche Kürzel;
- Desktop + iPad + iPhone;
- Gast und Klassenmodus;
- keine echten Schülernamen.

Production bleibt explizit gesperrt.

---

# 17. Testmatrix

## Klassen
- Klasse anlegen;
- fremde Lehrkraft DENY;
- archivieren;
- Join closed/approval/open;
- Alias eindeutig;
- Unicode/Whitespace;
- XSS-Text nur als Text;
- Mitglied entfernen;
- Mitglied in mehreren Klassen.

## Codes
- Leerzeichen/Bindestriche normalisiert;
- ungültig;
- rotierter Klassencode;
- alter persönlicher Code nach Reset ungültig;
- Rate Limit;
- Code Enumeration liefert keine internen Details.

## Login
- Custom Token nur für aktive Identity;
- suspendierte/revoked Identity DENY;
- Refresh Token nach Security-Reset ungültig;
- shared-device logout.

## Assignment
- public guest erlaubt;
- guest verboten;
- Klassenmitglied aktiv;
- pending DENY;
- removed DENY;
- selected member ALLOW;
- nicht ausgewähltes Mitglied DENY;
- Klassenmitgliedschaft nach Assignment-Ende ändert historische Resultate nicht.

## Secure Assessment
- alle vorhandenen Secure-Assessment-Tests bleiben grün;
- Client kann identity fields nicht fälschen;
- Clientpunkte ignoriert;
- Lösungen nicht lesbar;
- Doppelabgabe idempotent;
- Run-Wechsel verwirft alten lokalen Attempt;
- Teacher Preview erzeugt keine echte Submission.

## Netzwerk
- Reload;
- kurz offline;
- Resume;
- Submit-Retry;
- Code-Login Retry;
- zwei Tabs;
- zwei Geräte mit gleichem persönlichen Zugang;
- Token-Revocation.

## UX
- QR + Tastatur;
- Druckansicht;
- iPad Hoch-/Querformat;
- iPhone;
- DE/EN;
- 200 Mitglieder UI/Performance.

---

# 18. Geplante Module – noch nicht implementieren

```txt
classroom/
  access-codes.js
  class-service.js
  membership-service.js
  student-identity-service.js
  assignment-service.js
  classroom-contract.js

assessment-functions/lib/
  classroom-authorization.js   # Adapter, kein zweiter Lifecycle

web/
  classroom-client.js
  classroom-view.js
  student-home.js
  classroom.css

test/
  classroom-access-codes.test.*
  classroom-memberships.test.*
  classroom-assignment.test.*
  classroom-secure-adapter.test.*
  classroom-rules.test.*
```

Die tatsächlichen Dateipfade werden vor Implementierung an die aktuelle Repo-Struktur angepasst. Keine neue Struktur erzwingen, wenn der Integrationsbranch inzwischen andere Konventionen hat.

---

# 19. Firestore Rules – Grundsatz

Sensible Schülerdaten bevorzugt Functions-only.

Zielrichtung:

```txt
studentIdentities/*        -> kein Client-List, minimale/keine direkte Reads
studentAccessIndex/*       -> komplett clientgesperrt
classJoinIndex/*           -> komplett clientgesperrt
classes/*                  -> Owner/Admin; Schüler nicht die ganze Klasse lesen lassen
members/*                  -> Owner/Admin; Schüler höchstens eigene Membership über API
assessmentAssignments/*    -> Owner/Admin; Student-Auflösung über API
assessmentPrivate/*        -> wie bisher vollständig clientgesperrt
```

Keine Rules-Änderung deployen, bevor Emulator + Client-Migration gemeinsam bereit sind.

---

# 20. Bewusste Nicht-Ziele V1

Nicht gleichzeitig bauen:
- Schulverzeichnis;
- Elternkonten;
- Chat zwischen Lehrkraft/Schüler;
- Avatare/Münzen/Gamification;
- komplexe Untergruppen;
- automatische ASV/BYCS-Synchronisation;
- SEB als Teil dieser Baustelle;
- neuer Assessment-Grader;
- neuer AI-Stack.

Erweiterungspunkte werden vorbereitet, aber V1 bleibt beherrschbar.

---

# 21. Ausbau V2/V3

Nach stabilem V1:
- Co-Teacher-Rollen;
- Untergruppen/Tags;
- Schuljahreswechsel;
- CSV-Roster-Import;
- differenzierte Zeit-/Terminfreigaben;
- optionaler first-class immutable AssessmentRun, **nur** wenn der bestehende `sessionRunId`-Lifecycle dafür nachweislich nicht reicht;
- BYCS-/Schulverzeichnis-Integration erst nach eigenem Datenschutz-/Berechtigungsprojekt.

---

# 22. Konflikt- und Integrationsregeln

Vor Code:
1. aktuellen Integrationshead erneut lesen;
2. aktuellen Secure-Assessment-Stand auf dem Integrationsbranch lesen;
3. laufende i18n-PRs berücksichtigen;
4. Telemetrie-Adapter nicht duplizieren;
5. aktuelle Development-Status-Overlaps prüfen.

Besonders konfliktanfällig:
- Assessment Callables;
- Firestore Rules;
- Student Entry;
- i18n bootstrap/catalogs;
- Publish UI;
- Results UI;
- Staging build/deploy scripts.

Diese Dateien erst nach aktuellem Abgleich verändern.

---

# 23. Definition of Done für V1

V1 darf erst als `user_tested` gelten, wenn:

- Lehrkraft eine Klasse mit pseudonymen Mitgliedern verwalten kann;
- persönliche Codes ohne E-Mail funktionieren;
- Code-Rotation funktioniert;
- Schüler:in mehrere Klassen besitzen kann;
- Klassenfreigabe eines Tests funktioniert;
- Guest-Flow weiter funktioniert;
- Secure Assessment serverautoritativ bleibt;
- Klassenmitglied kann keinen fremden Alias übernehmen;
- Lehrer-Vorschau speichert keine echte Schülerabgabe;
- Tests/Results korrekt Klassen-/Run-bezogen sind;
- keine andere Schülerliste sichtbar ist;
- Emulator-Security grün;
- Combined CI grün;
- isolierter Preview grün;
- Desktop/iPad/iPhone manuell geprüft;
- DE/EN geprüft;
- keine Production-Änderung erfolgt.

---

# 24. Entscheidung gegenüber dem ersten Entwurf

Der frühere Entwurf wollte sofort `quizVersions` + `examRuns` + eigene Session-Struktur einführen.

Nach Prüfung des heutigen Repositories wird das **nicht** V1.

Grund:
GradeCrew besitzt inzwischen bereits einen gehärteten Secure-Assessment-Lifecycle. Das Masterprojekt nutzt ihn als Fundament und ergänzt nur die fehlende Identitäts-/Klassen-/Audience-Schicht. Das reduziert Migration, Konflikte, Sicherheitsrisiko und doppelte Logik.

Immutable Run-Versionierung bleibt ein bewusstes späteres Architekturthema, nicht Voraussetzung für die erste professionelle Klassenverwaltung.

---

# 25. Nächster ausführbarer Schritt

Das konkrete ASV-Exportprofil mit Spaltenüberschriften und ausschließlich synthetischen Beispielen bestätigen: dokumentiertes lokales Differenzierungsmerkmal, Stabilität zwischen Exporten, Quell-Namensraum sowie Schulart/Trägerschaft. Danach den [Identitäts-/Schuljahreswechsel-Entwurf](privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md) fachlich prüfen.

**Aktueller Auftrag: keine Implementierung und kein Deploy.** Die zuvor geplante Firebase-freie Mock-Testseite bleibt ein späterer Schritt nach Architekturklärung und gesondertem Umsetzungsauftrag.

---

# 26. ASV-/CSV-Import und Privacy-by-Default

Die ausführliche Rechts-/Architekturprüfung liegt in [privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md](privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md).

Verbindliches V1-Zielbild:
- ASV-/CSV-Rohdatei wird ausschließlich lokal im Browser gelesen;
- Vorname, Nachname und rohe ASV-Referenz werden nicht an GradeCrew übertragen;
- keine aus Namen gebildeten Initialen/Akronyme als Standardalias;
- GradeCrew erzeugt ein zufälliges klassenbezogenes Alias und einen davon unabhängigen persönlichen Zugangscode;
- Server speichert nur pseudonyme StudentIdentity, Membership, Alias und technische Credential-/Assignment-Daten;
- Lehrkraft erhält eine schulisch kontrollierte, berechtigungsbegrenzte Zuordnung Name ↔ StudentIdentity/Alias; Zugangscodes werden separat einmalig ausgegeben und nicht im dauerhaften Mapping geführt;
- Wiederimport: empfohlen ist der lokal berechnete schulbezogene HMAC-Abgleich mit geregeltem Schlüsseltresor/Recovery; verschlüsseltes schulisches Mapping bleibt Alternative. Rohe ASV-Referenzen bleiben außerhalb von GradeCrew;
- formelle Leistungsnachweise verwenden von der Lehrkraft verifizierte/provisionierte Schüleridentitäten;
- Selbstbeitritt bleibt ein separater, schwächerer Vertrauensmodus;
- keine Schülernamen, ASV-Referenzen, Aliase oder Zugangscodes in Produkttelemetrie/AI-Prompts;
- vor echtem Schuleinsatz: AVV, TOMs, Unterauftragsverarbeiter, Art.-13-Baustein, Retention-/Löschkonzept und DSFA-Erforderlichkeitsprüfung.

Rechtlicher Kern:
- Art. 85 Abs. 1 BayEUG erlaubt nur erforderliche schulische Datenverarbeitung;
- § 46 i. V. m. Anlage 1 BaySchO begrenzt den zulässigen Verfahrensrahmen;
- Art. 5 und 25 DSGVO sprechen für Datenminimierung und Privacy by Design;
- Pseudonymisierung beseitigt den Personenbezug nicht;
- bei Auftragsverarbeitung bleibt die Schule verantwortlich und GradeCrew benötigt die Voraussetzungen des Art. 28 DSGVO;
- digital gespeicherte Leistungsnachweise können Schülerunterlagen im Sinn von § 37 BaySchO sein; § 40 BaySchO ist bei der Aufbewahrung zu berücksichtigen.


# 27. Lehrkraftwechsel / schulische Zuständigkeit – Entwurf

Abschnitt 10a des [Identitäts-/Schuljahreswechsel-Entwurfs](privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md) konkretisiert die Übernahme einer Klasse oder eines Fachkurses: persönliche Lehrkraftkonten, schulische Administration plus Stellvertretung, zeitlich/inhaltlich begrenzte Rechte und kontrollierte Übergabe der GradeCrew-Berechtigung sowie der schulischen Namenszuordnung.

`ownerId` in älteren Schemata darf künftig nicht die einzige dauerhafte Kontrolle über schulische Klassen/Nachweise darstellen. Schüleridentitäten, Codes und Ergebnis-Snapshots bleiben bei Personalwechsel erhalten. Historische Einsicht, private Testentwürfe, Vertretung und Admin-Recovery werden gesondert begrenzt. Nur Architekturentwurf; noch keine Implementierung.

Abschnitt 10b ergänzt den ASV-Lehrkräfte-/Unterrichtsimport und mehrere Fachlehrkräfte pro gemeinsamer Klasse. Personalimport, persönlicher Login und bestätigte Fach-/Klassenrechte sind getrennte Ebenen. Jede zugewiesene Lehrkraft kann in ihrem Bereich Prüfungen an denselben Schülerbestand freigeben; fremde Fachleistungen bleiben ohne zusätzliche Freigabe gesperrt. Ausdrückliches Co-Teaching und befristete Vertretung werden unterstützt. Keine Doppelklassen/-Schülerkonten pro Fach und keine automatische Adminvergabe aus ASV.


# 28. Lehrer- und Schülernavigation – V1-Konzept

Die Lehreransicht und Testgruppierung sind in [CLASSROOM_TEACHER_UX_V1.md](CLASSROOM_TEACHER_UX_V1.md) festgehalten. Die Startseite ist eine Aufgabenübersicht, Klassen sind der Hauptkontext und Tests lassen sich global sowie innerhalb einer Klasse nach Fach und Status finden. Schüler:innen sehen eine vereinfachte persönliche Testliste. Mehrere Fachlehrkräfte arbeiten mit demselben Klassenbestand und getrennten Rechten. Das Konzept dupliziert keine Prüfungen und ersetzt nicht die bestehende Secure-Assessment-Engine. Es ist noch nicht implementiert.


# 29. Eine Klassenprüfung wird für Schüler sichtbar

Die Lehrkraft erstellt oder bearbeitet zunächst einen privaten Quiz-Entwurf. Bei „Zuweisen und veröffentlichen“ wählt sie einen bestätigten Klassenkurs (z. B. 9b · Technik), Zeitraum und bei Bedarf gezielte Nachschreiber. Der Server prüft ihre aktuelle Fach-/Klassenzuständigkeit und legt eine Freigabe an, die auf Quiz und bestehenden Secure Run verweist. Es entsteht keine zweite Prüfungsengine.

Die Freigabe hält die Zielgruppe zum Veröffentlichungszeitpunkt fest. Wegen möglicher Klassengröße werden Schüler-Grant-Datensätze einzeln gespeichert, nicht als großes ID-Array in einem Dokument. Die Schüleransicht fragt serverseitig nur passende, aktuelle Freigaben für die angemeldete StudentIdentity ab. Ein neuer Import oder eine Klassenmitgliedschaft allein zeigt keine Prüfung; eine Freigabe allein reicht ebenfalls ohne aktive passende Mitgliedschaft nicht. Änderungen nach Freigabe benötigen eine nachvollziehbare Nachtragsaktion. Teilweise vorbereitete Freigaben bleiben unsichtbar.

Status im Schülerkonto: geplant → anstehend, geöffnet → jetzt verfügbar, abgegeben/geschlossen → eigener Status; Noten und Rückmeldungen werden erst durch eine separate Ergebnisfreigabe sichtbar. Der Server autorisiert sowohl die Liste als auch den Startversuch. Ein direkter Quiz-Link überspringt keine Klassen-, Zeit- oder Rechteprüfung. Details des Bedienablaufs stehen in [CLASSROOM_TEACHER_UX_V1.md](CLASSROOM_TEACHER_UX_V1.md).


# 30. UX-Prototyp als nächster Prüfschritt

Der statische, Firebase-freie Lehrer-/Schüler-Mock ist auf dem Classroom-Aufgabenbranch unter prototypes/classroom-student-management/index.html gesichert (Commit 17fc4278e2e58f124f0c5624d39513fdfa9833d2). Er prüft allein die Bedienfrage, wie ausdrückliche Zuweisung zu Klasse/Fach die Schüleransicht füllt. Keine CSV, echten Schülerdaten, Backend- oder Staging-Verbindung. Statische Syntax-/Netzwerk-/Speicherprüfung bestanden; visueller Klicktest und menschliche Beurteilung ausstehend. Siehe [Prüfstand und Grenzen](CLASSROOM_TEACHER_UX_V1.md#prototyp-prüfstand-11-10-2026).