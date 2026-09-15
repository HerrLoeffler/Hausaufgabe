# Lernplattform V2 – Lehrer-Tests mit Firebase

Diese Version ist die skalierbare Weiterentwicklung des alten Wortarten-Prototyps.

## Enthalten

- Lehrer-Registrierung mit E-Mail + Passwort
- Lehrer-Login / Logout
- Passwort-Reset per E-Mail
- eigenes Lehrer-Dashboard
- mehrere Tests pro Lehrer
- 4 Aufgabentypen: Single Choice, Multiple Choice, Freitext, Dropdown
- frei definierbare Punkte pro Aufgabe
- Freitext wahlweise automatisch oder manuell bewerten
- Entwurf / Veröffentlichen
- eindeutiger 6-stelliger Testcode
- Schülerlink ohne Account
- QR-Code für den Testlink
- automatische Auswertung
- Teilpunkte bei Multiple Choice
- Ergebnisse je Test
- nachträgliche manuelle Punkteänderung je Aufgabe
- CSV-Export
- Firestore Security Rules mit Benutzertrennung
- temporärer Legacy-Regelblock, damit die alte V1 weiter funktioniert

## 1. In GitHub auf `dev` hochladen

Lege auf deinem `dev`-Branch diese Dateien im Repository-Stamm ab:

- `index.html`
- `styles.css`
- `app.js`
- `firebase-config.js`
- `firestore.rules` (nur als Vorlage; diese Datei wird nicht automatisch von GitHub Pages angewendet)

`main` und dein Tag `v1-stable` nicht verändern.

## 2. Firebase Authentication aktivieren

Firebase Console → dein Projekt `hausaufgabe-40294` → Authentication → Sign-in method / Anmeldemethode.

Aktiviere **E-Mail/Passwort**.

Danach Authentication → Settings / Einstellungen → Authorized domains / Autorisierte Domains.

Füge, falls noch nicht vorhanden, hinzu:

`herrloeffler.github.io`

Ohne autorisierte Domain kann der Login auf GitHub Pages blockiert werden.

## 3. Firestore-Regeln setzen

Firebase Console → Firestore Database → Rules / Regeln.

Den Inhalt aus `firestore.rules` einfügen und **Publish / Veröffentlichen**.

Wichtig: Der Legacy-Block am Ende hält die bisherige V1-Collection `/submissions` vorübergehend weiter offen, damit deine alte Live-Seite nicht sofort kaputtgeht.

Sobald V2 die alte V1 ersetzt, sollte dieser Legacy-Block entfernt werden.

## 4. `dev` separat testen

GitHub Pages veröffentlicht standardmäßig normalerweise nur einen Branch. Deshalb solltest du `main` nicht auf `dev` umstellen, solange V1 deine Live-Version bleiben soll.

Einfachste sichere Varianten:

1. **Lokaler Test** mit VS Code + Live Server, oder
2. ein zweites GitHub-Repository, z. B. `Hausaufgabe-dev`, oder
3. Firebase Hosting Preview Channels (später).

Für dich ist Variante 2 wahrscheinlich am unkompliziertesten: neues öffentliches Repo `Hausaufgabe-dev`, die fünf Web-Dateien hochladen und GitHub Pages für `main / root` aktivieren. Dann bleibt `Hausaufgabe` unverändert live.

## 5. Datenstruktur

### Firebase Authentication

Speichert und verwaltet Login, E-Mail und Passwort. Passwörter werden NICHT in Firestore abgelegt.

### Firestore

`users/{uid}` – Lehrerprofil

`quizzes/{CODE}` – Test-Metadaten; die Dokument-ID ist zugleich der Testcode

`quizzes/{CODE}/questions/{questionId}` – Aufgaben

`quizzes/{CODE}/submissions/{submissionId}` – Schülerabgaben

## 6. Typischer Ablauf

1. Lehrer registriert sich.
2. Firebase Authentication erzeugt eine eindeutige UID.
3. Ein Profil wird unter `users/{uid}` gespeichert.
4. Lehrer erstellt einen Test.
5. Der Test erhält z. B. den Code `AB12CD`.
6. Lehrer erstellt Fragen und vergibt Punkte.
7. Lehrer veröffentlicht den Test.
8. Schüler öffnet `...?test=AB12CD` oder scannt den QR-Code.
9. Schüler gibt Namen/Kürzel an und bearbeitet den Test.
10. Die Abgabe landet unter dem jeweiligen Test.
11. Lehrer öffnet Ergebnisse und kann Punkte nachträglich ändern.

## 7. Sicherheit / nächster Schritt

Die Regeln trennen die Testdaten nach Lehrer-UID. Schüler dürfen nur veröffentlichte Tests lesen und nur neue Abgaben schreiben.

Da Schüler ohne Account abgeben, kann ein öffentlicher Test theoretisch automatisiert zugespammt werden. Für eine spätere produktive Version sollte Firebase App Check ergänzt werden. Für den ersten Entwicklungsstand ist das noch nicht nötig.

## 8. Noch nicht enthalten

Bewusst nicht enthalten:

- KI-Anbindung
- Schüler-Accounts
- Klassenverwaltung
- Dateiuploads
- Audio/Bilder
- native iOS-/Android-App

Diese Bausteine können später ergänzt werden, ohne die Grundarchitektur zu ändern.
