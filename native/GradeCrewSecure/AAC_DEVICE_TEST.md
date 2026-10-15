# AAC-Gerätetest · 15.10.2026

Lokaler Dummy-Test, keine echte Prüfung und keine Production-Anbindung. Das Schema öffnet direkt den Lab-Bildschirm; die Webvorschau wird nicht geladen.

## Installation über TestFlight (ohne Kabel)

Die separate Secure-Pipeline `.github/workflows/gradecrew-secure-testflight.yml` baut **0.2.0** mit `AACLabDistribution`: optimiert, ohne Debugger, mit AAC-Entitlement und direktem Einstieg in den Dummy-Test. Sie verwendet die vorhandenen App-Store-Connect-Secrets. Vor dem Upload werden AAC in signierter App UND Distribution-Profil, Team und Bundle-ID geprüft.

Ein Kabel, eine lokale Entwicklersignatur und eine Geräte-Registrierung sind dafür nicht erforderlich. Nach Apples Verarbeitung in TestFlight die **GradeCrew Secure**-App aktualisieren. Sie bleibt getrennt von der Lehrkräfte-App. Upload, Apple-Verarbeitung/Testerfreigabe und der tatsächliche AAC-Gerätetest sind getrennte Nachweise.

Der normale Secure-Release bleibt ohne Lab-Einstieg. Ausschließlich das Lab-Schema archiviert `AACLabDistribution`.

## Alternative: direkte Installation aus Xcode

1. `GradeCrewSecure.xcodeproj` öffnen. Schema **GradeCrew AAC Lab** und das angeschlossene, entsperrte **echte iPad** wählen.
2. Target → Signing & Capabilities: passendes Developer-Team und Automatically manage signing. Bundle-ID **de.gradecrew.secure**. Die genehmigte Capability muss im Provisioning-Profil UND in der signierten App enthalten sein. Keine neue Bundle-ID als Umgehung verwenden.
3. Xcode → Settings → Accounts: Developer-Konto anmelden, falls noch nicht vorhanden. Vertrauen/Developer Mode auf dem iPad bestätigen, wenn Xcode dazu auffordert.
4. Run. Das Schema startet ohne angehängten Debugger. App-Name auf dem Gerät: **GradeCrew AAC Lab**. Da die genehmigte Bundle-ID verwendet wird, ersetzt die Installation eine vorhandene Secure-App mit derselben ID; die Lehrkräfte-App bleibt separat.
5. Der Start der App sperrt das Gerät noch nicht. Erst **60-Sekunden-Gerätetest starten** → Bestätigung startet AAC.

Alternativ signierter Build mit `./install-aac-lab.sh TEAM_ID DEVICE_ID`. Das Skript prüft Profil, App-Entitlement und Geräteeignung vor Installation. Es startet den Lab-Bildschirm, aber nicht automatisch die Sperre.

## Test 1: Manuelles Ende

- Start bestätigen, gegebenenfalls Apples Dialog bestätigen.
- Auf **Apple bestätigt: Prüfungsmodus aktiv** warten. Erst jetzt darf die Übungsfrage 7 × 8 sichtbar sein.
- Home-Geste und App-Wechsel versuchen. Tatsächliches Verhalten notieren, keine reine Simulatorprüfung als Nachweis werten.
- **Gerätetest beenden** antippen. Die Aufgabe muss sofort verschwinden.
- Erst **Apple bestätigt: Prüfungsmodus beendet** zählt als bestätigtes Ende; anschließend normalen App-Wechsel prüfen.

## Test 2: Automatisches Ende

- Erneut starten, keine Breakpoints setzen und Gerät/Prozess nicht über Xcode pausieren.
- Nach 60 Sekunden aktiver Sitzung wird `end()` angefordert. Der Timer funktioniert nur bei laufender App; er ist kein OS-unabhängiger Notausgang.
- Apple-Endbestätigung und anschließend normale Gerätebedienung prüfen.

## Fehlerfälle

- Bei Startfehler: keine Dummy-Aufgabe; Fehlerdomain/-code notieren und Signing prüfen.
- Bei Systemunterbrechung: Aufgabe sofort verborgen; Ergebnis darf nicht als erfolgreicher Test erscheinen.
- Bei ausbleibender Apple-Endbestätigung nicht „bestanden“ notieren. Betreut den vom Betriebssystem vorgesehenen Wiederherstellungsweg verwenden; nötigenfalls Gerät neu starten. Ein erzwungener Neustart ist kein Prüfungsabschluss.
- Simulator: Start absichtlich deaktiviert. Keine echte Sperre vorgetäuscht.

## Protokoll (auf dem echten iPad ausfüllen)

- Gerät / iPadOS:
- Git-SHA / Build: AACLab 0.1.0 (2)
- Bundle / Team / AAC im Profil geprüft:
- Apple DidBegin gesehen:
- Home-/App-Wechsel blockiert:
- Manuelles Ende / Apple DidEnd:
- Automatisches Ende / Apple DidEnd:
- Unterbrechung / Startfehler:
- Ergebnis: offen / bestanden / fehlgeschlagen

Erst nach diesem Test beginnt die Integration mit echten Staging-Versuchen. Die spätere Prüfungs-App darf die freie Lab-Endtaste und den 60-Sekunden-Timer nicht übernehmen.
