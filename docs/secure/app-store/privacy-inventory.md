# GradeCrew Secure Datenschutzinventar für den App Store

Technischer Entwurf vom 16. Oktober 2026. Er beschreibt die eigenständige Schüler-App `de.gradecrew.secure`, nicht sämtliche Funktionen der Lehrer-Webseite. Vor der Einreichung ist der tatsächliche Release-Build einschließlich aktivierter Statistik und eingesetzter Dienste maßgeblich.

## Datengruppen

| Daten | Bestehender Zweck | Prüfung für Apples Angaben |
| --- | --- | --- |
| Eingegebener Name oder Kürzel | Abgabe der richtigen Teilnahme zuordnen | Name, soweit Namen eingegeben werden; Verknüpfung mit Antworten nicht als anonym bezeichnen |
| Versuch-ID, Test-ID, Rundenbezug | Authentifizierung und Zuordnung des Prüfungsversuchs | Identifikatoren; mit Versuch und eingegebenem Namen verknüpft |
| Antworten und Abgabe | Prüfung durchführen, auswerten und Lehrkraft anzeigen | Andere Nutzerinhalte; auch dann gesammelt, wenn die Sammlung nur der App-Funktion dient |
| Start, Serverempfang und Abschluss | Fristen, Abgabe und Betriebsnachweis | Nutzungsdaten; Serverlaufzeit ist keine nachgewiesene aktive Lernzeit |
| Aufgaben-IDs und Bearbeitungsstatus | Geplante Secure-Statistik | Produktinteraktion/Analyse, falls tatsächlich aktiviert; keine Antworttexte im Analyseereignis |
| Fehlerkategorien und Wiederherstellung | Zuverlässigkeit verbessern | Diagnosedaten, soweit übertragen und gespeichert; keine vollständigen privaten Fehlermeldungen oder Tokens |
| Prüfungszugangstoken | Technischer Zugriff auf einen konkreten Versuch | Geheime Berechtigung, niemals Store-Text, Screenshot, Analytics oder öffentlicher Bericht |

Die neue Statistikfunktion ist bereitgestellt, der Clientaufruf aber noch durch Cloud-IAM gesperrt. Das ist kein Nachweis, dass bereits vollständige Statistikdaten erfasst werden. Wird sie vor Veröffentlichung aktiviert, müssen Formulare und Erklärung diese Praxis enthalten. Ihre eigene Detail-/Aggregat-Aufbewahrung ersetzt nicht die Regeln für eigentliche Schülerabgaben.

## Abgrenzungen

- Kein eigenes Schülerkonto und kein E-Mail-Feld im bestehenden Secure-Prüfungseinstieg. Lehrer-Anmeldung und Remy-Sprachaufnahme gehören zu anderen Oberflächen.
- Der aktuelle Secure-Prüfungsablauf nimmt keine Schüler-Audioaufnahmen auf. Höraufgaben sind Medienwiedergabe. Keine unnötigen Mikrofon-/Kameraberechtigungen ergänzen.
- Im untersuchten nativen Secure-Quellstand keine Werbeintegration oder PostHog-Weiterleitung. Daraus folgt nicht „keine Datenerfassung“: Antworten werden vom Prüfungsserver gespeichert.
- Pseudonyme IDs sind nicht automatisch anonym, wenn sie mit Name/Kürzel, Test und Lehrkraft verbunden werden können.
- WebView-Fragenrenderer ist lokal gebündelt. Entfernte Bild-/Audioressourcen und der Prüfungsserver gehören trotzdem zur Dienstleister-/Netzwerkprüfung.

## Erforderliche API-Begründung

Im Secure-Projekt wurde keine `PrivacyInfo.xcprivacy` gefunden. Der mitkompilierte AAC-Lab-Code verwendet `ProcessInfo.processInfo.systemUptime`. Für die spätere Store-Konfiguration ist entweder der tatsächlich unnötige Lab-Code aus dem Produkt auszuschließen oder die erforderliche Nutzung korrekt im fertigen Privacy Manifest zu deklarieren. Apple nennt für appinterne Zeitmessung/Timer den Grund `35F9.1` in der Kategorie System Boot Time. Zulässigkeit und Paketinhalt müssen am endgültigen Binärpaket geprüft werden; dieser Bericht ist kein eingebautes Manifest und kein bestandenes Upload-Gate.

## Vor Veröffentlichung festzulegen

Verantwortlicher Betreiber und Kontakt, schulische Zuständigkeit, Dienstleister, öffentliche Datenschutz- und Support-URL, Aufbewahrung und Löschverfahren für eigentliche Abgaben, Statistik-Aufbewahrung, Umgang mit gemeinsam genutzten iPads und verlorenen Geräten. Aussagen über Einwilligung oder Rechtsgrundlage nicht aus einer technischen Gerätesperre ableiten. Diese Entscheidungen und Texte werden nicht stillschweigend in App Store Connect als rechtlich bestätigt hinterlegt.

Für spätere Offline-Abgaben muss klar erkennbar sein, ob eine Arbeit lediglich lokal gesichert, beim Server eingegangen oder von einer Lehrkraft geprüft wurde. Schulische Bewertung und technische Empfangsbestätigung sind unterschiedliche Vorgänge.

Quellen: [Apple App-Datenschutzangaben](https://developer.apple.com/app-store/app-privacy-details/), [erforderliche API-Begründungen](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api), [API-Kategorien und Gründe](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype).
