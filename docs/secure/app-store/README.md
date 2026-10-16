# GradeCrew Secure App Store Vorbereitung

Stand 16. Oktober 2026. Dieses Paket bereitet die öffentliche iPad-App vor. Es ist keine Einreichung und verändert weder Firebase-Projekte noch Domains, Berechtigungen oder veröffentlichte Apps.

## Fertig vorbereitet

- Deutsche Store-Texte: `metadata.de-DE.json`.
- Englische Anleitung für Apple: `review-notes.en.txt`.
- Datenschutz-Datenübersicht mit offenen Nachweisen: `privacy-inventory.md`.
- Prüfung der beiden Firebase-Umgebungen: `environment-assessment.md`.
- Offline-Entwurf mit Abnahmeszenarien: `../../superpowers/specs/2026-10-16-secure-offline-release-design.md`.

Texte und Prüfhinweise sind Entwürfe für die zukünftige freigegebene Version. Sie werden erst nach Abgleich mit dem endgültigen App-Paket in App Store Connect übernommen. Fehlende Betreiberangaben stehen ausdrücklich auf offen, nicht als erfundene Kontaktadresse.

## Technische Freigabekriterien

1. Offline-Speicherung und nachgeholte Abgabe gemäß freigegebenem Entwurf implementiert und nachgewiesen. Kein verlorener Empfangsbeleg darf eine doppelte Abgabe erzeugen.
2. Neue App-Store-Konfiguration öffnet ausschließlich die echte Prüfungsoberfläche. Die normale aktuelle Release-Konfiguration öffnet `StartView`, also den Entwicklungsprototyp. Das Umstellen des Scheme-Namens allein genügt nicht.
3. Konfiguration bindet die endgültig freigegebene Umgebung. Aktuell ist `SecureAssessmentAPI` fest an `hausaufgabe-staging` gebunden; `verify_distribution.py` prüft ausdrücklich `staging-exam`. Eine künftige Production-Konfiguration braucht eigene, verpflichtende Paketprüfungen. Keine automatische Projektsuche und kein Fallback auf eine andere Datenbank.
4. `de.gradecrew.secure`, iPad-Gerätefamilie und Mindestversion iPadOS 17 im gebauten Paket nachweisen. Ein iPhone-Angebot ist nicht Teil dieser App.
5. AAC-Berechtigung in signierter App und Distribution-Profil weiterhin verpflichtend. Debuggable, Vorschau und AAC-Lab dürfen nicht als reguläre Schüler-App ausgeliefert werden.
6. Datenschutzmanifest für tatsächlich enthaltene erforderliche API-Nutzung prüfen und in das fertige Paket aufnehmen. Kein entsprechendes `.xcprivacy` liegt aktuell im Secure-Projekt. Im mitkompilierten Lab-Code wird `ProcessInfo.systemUptime` verwendet; das ist vor dem Store-Build zu bereinigen oder passend zu deklarieren.
7. Ein echter Durchlauf auf einem älteren unterstützten iPad und einem aktuellen iPad: Start, Antworten, Medien, WLAN-Unterbrechung, frühe Abgabe, Zeitablauf, Wiederaufnahme, Freigabe. Die erfolgreiche Prüfung des alten Builds ist kein Offline-Nachweis für den neuen Build.
8. Vollständige Layoutmatrix und bisherige Prüfungen grün, keine fehlenden Berichte, keine privaten echten Schülerdaten in Testbelegen.

## Noch benötigte Angaben und Artefakte

| Punkt | Stand | Vor Einreichung erforderlich |
| --- | --- | --- |
| Store-Name, Untertitel, Beschreibung, Suchwörter | Entwurf vorhanden | Final mit der ausgelieferten App abgleichen |
| Support | URL und Betreiberkontakt offen | Erreichbare öffentliche Supportseite mit aktuellen Kontaktdaten |
| Datenschutz | Dateninventar vorhanden | Verantwortliche Stelle, vollständige Erklärung, öffentliche URL, Lösch-/Aufbewahrungskonzept |
| App-Datenschutzangaben | Technischer Entwurf vorhanden | Tatsächliche App einschließlich aktivierter Statistik und Dienstleister korrekt angeben |
| Altersfreigabe | Fragebogen offen | Inhalte und Funktionen sachlich beantworten; Kategorie Bildung bedeutet nicht automatisch Kids Category |
| EU-Vertrieb | Noch nicht geprüft | Händlerstatus und gegebenenfalls die von Apple verlangten verifizierten Angaben |
| Vertrieb | Öffentlich empfohlen | Länder und Preis bewusst festlegen; keine stillschweigende Preisentscheidung |
| Review-Zugang | Ablauf vorbereitet | Stabiler veröffentlichter Test mit ausschließlich fiktiven Daten, Code und Ansprechpartner |
| Screenshots | Aufnahmereihenfolge definiert | Echte Screenshots der endgültigen Konfiguration; keine Layout-Testfixture als echtes Produktbild ausgeben |
| Veröffentlichung | Noch nicht eingereicht | Zunächst manuelle Veröffentlichung nach Apples Freigabe vorsehen |

## Screenshots

Für die iPad-App zunächst vier echte 13-Zoll-Aufnahmen erstellen: Einstieg mit Crew und Code/Name, laufende Prüfung mit Frage und Antworten, geöffnete Aufgabenübersicht, bestätigte Abgabe. Nur fiktive Inhalte verwenden. Personenname und Testcode dürfen keine echten Schülerdaten offenlegen. Timer und Aufgaben müssen echte Zustände des geprüften Builds zeigen.

Apple nennt für die 13-Zoll-iPad-Klasse unter anderem 2064 × 2752 bzw. 2048 × 2732 Pixel im Hochformat und die entsprechenden Querformate. Vor dem Upload die dann gültigen Vorgaben abgleichen. Die bestehenden CI-Bilder prüfen Komponenten und synthetische Größen; sie sind kein fertiger Satz App-Store-Screenshots.

## Reihenfolge bis zur Veröffentlichung

Zuerst Offline-Verhalten abstimmen, implementieren und prüfen. Danach die Umgebungsentscheidung mit Sicherung und Rückweg umsetzen. Anschließend App-Store-Build und endgültige Screenshots erstellen, Betreiberangaben ergänzen und die Datenschutzangaben abschließen. Erst dann die reguläre App-Prüfung einreichen. TestFlight bleibt für spätere Vorabtests erhalten; eine öffentliche Version ersetzt nicht die getrennte Entwicklungsumgebung.

## Apple Referenzen

- [Veröffentlichungsablauf](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-workflow)
- [Vollständige App-Prüfung](https://developer.apple.com/app-store/review/)
- [Datenschutzangaben](https://developer.apple.com/app-store/app-privacy-details/)
- [Screenshot-Vorgaben](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [Erforderliche API-Begründungen](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
- [Öffentliche und schulische Verteilung](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/set-distribution-methods)
- [EU-Händlerangaben](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements)
