# Secure Datenschutzinventar — technischer Entwurf21.10.2026

Gilt nur für `de.gradecrew.secure` im untersuchten Native-Zweig, nicht für die gesamte Lehrerwebsite. App-Privacy-Antworten noch nicht in ASC eingetragen. Betreiber-/Schul-/Partnerfacts nicht durch diesen Bericht bestätigt.

## Tatsächliche Architektur

Native App verwendet URLSession gegen explizite Assessment-Functions und Keychain für einen versuchsgebundenen Berechtigungsnachweis. Kein FirebaseAuth-iOS-SDK, kein Schülerkonto und keine E-Mail/Passwort-Anmeldung. Backend nutzt Firebase/Google-Dienste; keine Aussage „ohne Firebase-Datenverarbeitung“. Das Fragenmodul ist lokal gebündelt, Bild-/Audioressourcen können entfernt geladen werden. Keine Kamera-/Mikrofonaufnahme und kein zugehöriger Berechtigungstext im untersuchten Schülerablauf. Systemframeworks statt eingebundener Werbe-/Analytics-SDKs; kein PostHog-Aufruf im untersuchten Secure-Client/TelemetryBackend.

## Vorschlag für AppPrivacy, endgültig zu bestätigen

| Tatsächliche Daten | Apple-Kategorie als Entwurf | Zweck / Verknüpfung |
|---|---|---|
| eingegebener Name oder Kürzel | Name, sofern ein Name eingegeben wird | AppFunktion; mit Abgabe verknüpft, nicht anonym |
| Versuch-/Test-/Runden-/ClientIDs | UserID/andere zugeordnete Identifikatoren | AppFunktion; pseudonym, zu Name/Test zuordenbar |
| Antworten | OtherUserContent | AppFunktion/Bewertung; mit Teilnahme verknüpft |
| Start/Abgabe, bearbeitete/berührte AufgabenIDs, Revision | ProductInteraction | AppFunktion und Statistik; versuchsbezogen, keine gemessene aktive Lernzeit aus Serverdauer ableiten |
| Fehlerkategorien/Wiederherstellung | OtherDiagnosticData, soweit tatsächlich empfangen/gespeichert | Zuverlässigkeit; keine Tokens/Antworttexte in Analyseereignisse |
| Netz-/Providerprotokolle, entfernte Medien | nach tatsächlicher Anbieterpraxis prüfen | Hosting-/Cloud-/Medienpartner und deren Logging nicht ungeprüft als leer erklären |

`SecureTelemetry` führt eine eigene gerätegebundene Keychain-Outbox; Ereignisse enthalten IDs/Bearbeitungsstatus statt Antworttexte und werden bei Warteschlangenverarbeitung anhand einer Grenze von30Tagen ausgesondert (kein garantierter Löschlauf bei beendeter App). Sie versucht `recordSecureExamTelemetry` aufzurufen. Ob diese Route im aktuellen Live-Betrieb wirklich annimmt und welche Server-/Aggregatfristen gelten, wurde hier nicht durch private Live-Ereignisse geprüft. Deshalb weder „vollständig aktiv“ noch „keine Analytics“ behaupten. Ursprüngliche Aussagen über einen alten IAM-Blocker sind kein aktueller Nachweis.

Antwortpuffer liegen im ApplicationSupport-Verzeichnis mit vollständigem Schutz bis zur ersten Benutzerentsperrung und sind vom Gerätebackup ausgeschlossen. Identität/Tokens liegen gerätegebunden in der Keychain. Nach Abgabe werden Antworten festgeschrieben; bei Netzfehler bleibt die lokale Arbeit bis zum passenden Receipt erhalten. Wiederöffnen mit Netz ermöglicht Nachübertragung, kein garantierter Hintergrundtransfer bei beendeter App. Server-Recovery ist begrenzt und markiert zeitlich unklare Arbeiten zur Prüfung. Speicherung eigentlicher Prüfungsabgaben und deren schulische Löschfristen gesondert festlegen.

## Tracking, Manifest, Plattform

Kein Werbe-/IDFA-/ATT-/Datenbrokerpfad in den untersuchten nativen Quellen. Das ist ein Quellbefund, kein vollständiger Laufzeit-/Partneraudit. Keine ATT-Abfrage ohne tatsächlichen Trackingzweck hinzufügen.

`Resources/PrivacyInfo.xcprivacy` erklärt SystemBootTime35F9.1: der mitkompilierte Lab-Code verwendet systemUptime ausschließlich für lokale Timerintervalle. Bootzeit wird dort nicht übertragen. Das Manifest macht keine leere „keine Datenerfassung“-Angabe und ersetzt keine AppPrivacyLabels. Ressourcenaufnahme und gebautes Paket müssen verifiziert werden.

## Von Martin/Betreiber offen

Rechtlicher Betreiber und Kontakt; Schul-/Dienstleisterzuständigkeit; öffentliche Datenschutz- und Support-URL; Fristen/Löschweg für Prüfungen und Statistik; endgültige Partner-/Logging- und Trackingerklärung. Keine Annahme einer rechtlichen Freigabe aus AAC oder TestFlight.

Quellen: [Apple-AppPrivacy](https://developer.apple.com/app-store/app-privacy-details/), [RequiredReasonAPIs](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype), [AppReview5.1](https://developer.apple.com/app-store/review/guidelines/). Labels sind ein konkreter technischer Entwurf, keine bereits bestätigten ASC-Angaben.
