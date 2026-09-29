# GradeCrew Teacher · lokaler Test und TestFlight

Stand: 30. September 2026

## 1. Erster lokaler Test

Auf dem Mac:

```bash
cd ~/Hausaufgabe
git fetch origin
git switch feature/shared-gradecrew-design-system
git pull --ff-only
bash native/GradeCrewTeacher/verify-on-mac.sh
open native/GradeCrewTeacher/GradeCrewTeacher.xcodeproj
```

Danach in Xcode einen iPad- oder iPhone-Simulator wählen und `Run` drücken.

Der aktuelle MVP zeigt native GradeCrew-Oberflächen mit lokalen Beispieldaten. `Neuen Test erstellen` und `Im GradeCrew-Editor öffnen` laden ausschließlich die Staging-Webumgebung `https://hausaufgabe-staging.web.app/` in einem WKWebView.

## 2. Test auf dem eigenen iPhone/iPad

1. Gerät per Kabel oder drahtlos mit Xcode verbinden.
2. In Xcode unter `Signing & Capabilities` das eigene Team wählen.
3. Bundle ID vorerst `de.gradecrew.teacher` belassen, sofern sie im Developer-Account verfügbar ist.
4. Das echte Gerät als Run-Destination wählen.
5. `Run` drücken.

Für reine Tests auf dem eigenen Gerät reicht grundsätzlich ein persönliches Xcode-Team; für TestFlight und App-Store-Verteilung ist das Apple Developer Program erforderlich.

## 3. TestFlight vorbereiten

Vor dem ersten Upload:

- Apple-Developer-Mitgliedschaft aktiv.
- In App Store Connect einen App-Eintrag `GradeCrew` für iOS/iPadOS anlegen.
- Bundle ID muss exakt zum Xcode-Projekt passen.
- Version z. B. `0.1.0`, Build `1`.
- App-Datenschutz und erforderliche App-Informationen später vollständig pflegen.

## 4. Build hochladen

In Xcode:

1. `Any iOS Device (arm64)` bzw. ein geeignetes Generic Device wählen.
2. `Product > Archive`.
3. Organizer öffnet sich.
4. `Distribute App`.
5. `App Store Connect` wählen.
6. Upload abschließen.

Anschließend verarbeitet App Store Connect den Build. Danach erscheint er im Bereich TestFlight.

## 5. Interner Test

Für den schnellsten Testweg zuerst eine interne TestFlight-Gruppe anlegen. Interne Tester müssen App-Store-Connect-Nutzer des Accounts sein. Build der Gruppe zuweisen und auf iPhone/iPad über die TestFlight-App installieren.

## 6. Externer Test

Erst danach Kolleginnen/Kollegen als externe Tester einladen. Für externe Tests sind zusätzliche Beta-Testinformationen nötig und der erste Build einer Version wird typischerweise an TestFlight App Review geschickt. Externe Tester können anschließend per E-Mail oder öffentlichem Link eingeladen werden.

## Noch nicht für TestFlight freigeben

Der aktuelle MVP ist für Simulator-/Gerätetests gedacht. Vor einem breiteren externen Test fehlen mindestens:

- echtes Firebase Authentication in der nativen App,
- echte Firestore-Testliste statt Fixtures,
- sichere Übergabe der eingeloggten Sitzung an den eingebetteten Editor,
- App-Icon und finale Launch-Darstellung,
- Fehler-/Offlinezustände,
- Datenschutzhinweise und App-Store-Metadaten.
