# Secure: einheitliches Logo im Einstieg

Task GC-IOS-02 / GC-RELEASE-06. Owner GC · iPhone & iPad, Chat01a10c75-8912-7a12-98f0-c9e78064aa2c.

Martin zeigt nach verfügbarem1321 einen anderen Schlossbadge über der Eingabe. Ursache: AppIcon verwendet bereits die freigegebene Datei Brand/SecureAppIcon.png; die In-App-Datei GradeCrewLogo wurde noch separat aus dem alten runden Badge erzeugt. Der kleine Fix verwendet für beide Live-Dateien dieselben unveränderten ausgewählten Bildbytes. Auch die vorhandenen Headerreferenzen verwenden diese Bildquelle. Test-App bleibt eindeutig separat. Kein neues Artwork und keine Änderung von Formular, Aufgaben, kompakter Uhr, AAC/Offline, Backend oder AppStore-Auswahl1293.

PR446 normal integriert als82dba253bd64b907c1977f500835173f17929102. Produktdiff: eine Bildquelle in prepare_assets.swift, zusätzlich realer Asset-Regressionscheck und Dokumentation. Vorher scheitert der tatsächliche Logo-Hashvergleich; nachher stimmen Quelle, LiveAppIcon und LiveLogo bytegenau mit SHA256fa341d56873fdec36b57a316da5a78577fcdb9d163eeca5774b103b250cc172d überein. TestLogo und TestIcon bleiben gleich untereinander und anders als Live.31Python- und29JS-Tests sowie40native Vorschaufälle/Lifecycle/Abgabe/Rückkehr erfolgreich. Native320pt-Ansicht tatsächlich gerendert und visuell geprüft. Unabhängiger enger Readonly-Review ohne P0–P2.

Genau ein automatischer Release läuft:44412446551,run33,attempt1, Quelle82dba253. Bestehende vier Matrixgates vor Signatur/AAC/Upload unverändert. Neuer Upload noch nicht bestätigt und neue Buildnummer nicht vorwegnehmen.1321 bleibt der bestätigte verfügbare vorherige Build. Keine zusätzliche Secure-Test-Auslieferung und kein AppStore-Reviewversand.

Ausführliche Übergabe im Native-Releasebranch: [Quellübergabe](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/secure-live-ready-20261026/workstreams/secure-entry-logo-20261118.md). Lokale Bildbelege unter outputs/secure-entry-logo-20261118. Kein physischer Gerätetest aus Simulatorbildern ableiten.

Nächster Schritt: denselben Lauf bis erfolgreichen Gates/Signatur/AAC/Upload begleiten und tatsächliche TestFlight-Verfügbarkeit separat bestätigen. Kein weiterer Build nur durch Dokumentation.

## Gesicherte Diagnose und begrenzte Wiederholung

Versuch1 hat alle iPadgates und native iPhone540, Interaktionen12 und Komposition6 bestanden. Genau ein Webfall `web-phone-small-landscape-large-media-closed` wurde nicht rechtzeitig bereit. Upload daher korrekt übersprungen. Originalartefakt14477958745 enthält Protokoll, JSON und Bild; Simulator meldet fehlenden BERenderingVisibilitySink-Prozess. Kein Logo-/Produktfehler daraus behauptet. HTML/JS/Swift-Prüfungsquellen unverändert gegenüber1321.

Lokaler frischer gleicher Weblauf216/216+12Interaktionen+6Kompositionen grün. Genau eine gezielte Wiederholung des Phonejobs angenommen: gleicher Run44412446551, Versuch2, echte neue Phonejob-ID135195505743, gleiche Quelle82dba253. Keine Code-/Timeout-/Assertionänderung und kein neuer Gesamt-Dispatch; iPadbelege bleiben erhalten. Bei erneutem Fehler erneut diagnostizieren statt blind weiterzustarten. Neuer Upload weiterhin offen.
