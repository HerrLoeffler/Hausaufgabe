# Secure: kompakter iPhone-Kopf

Task GC-IOS-02 / GC-RELEASE-06. Zuständig: GC · iPhone & iPad, Chat 01a10c75-8912-7a12-98f0-c9e78064aa2c.

Martin hat Secure 1.0 (1313) ausdrücklich als in TestFlight verfügbar bestätigt. Sein Folgeauftrag: Titel und Übersicht am Handy kompakter, Aufgaben gut lesbar lassen und Uhr immer sichtbar halten. Der Auftrag umfasst die Aktualisierung über TestFlight, keinen App-Store-Reviewversand.

PR443 ist normal in den bestehenden Releasebranch integriert, genaue Quelle: 1c061200b5b8330689ab483c9d465830a7d9dacb. Die kurze Titel-/Uhrzeile zeigt den vollständigen Titel und das Kürzel auf Nachfrage. Aufgabennummer und Vor/Zurück bleiben sichtbar; das Nummernraster öffnet sich über Übersicht. Fragen und Antworten behalten ihre Schriftgröße. Normale iPad-Kopfzeile,820px Aufgabenbreite und1180×600 Sidebar-Schwelle bleiben erhalten. Ohne Zeitlimit erscheint im kompakten Kopf∞, mit vollständiger gesprochener Bezeichnung.

Alle vier Servergates für den endgültigen Code sind erfolgreich:900 native iPad-Ansichten;540 native iPhone-Ansichten;216 iPhone-Webansichten,12 Interaktionen und6 zusammengesetzte Handyansichten; je360 Webansichten und12 Interaktionen auf kleinem und großem iPad. Lauf44404250305, Versuch1. Es wurde kein zusätzlicher Lauf gestartet und kein Gate abgeschwächt. Signierter Build/Upload135167380282 läuft noch; ein neuer Upload ist noch nicht bestätigt.

Vorher wurde der gemeldete Platzverbrauch mit echten SwiftUI-/WebKit-Tests reproduziert. Der erste vollständige iPad-Lauf fand zusätzlich einen Überlauf bei320pt, sehr großer Schrift und fehlendem Zeitlimit. Die∞-Korrektur wurde in12 gezielten Kombinationen und erneut allen900 nativen Ansichten geprüft. Die fehlgeschlagenen Belege bleiben erhalten. Zwei begrenzte unabhängige Reviews fanden keine blockierenden Fehler.38 Swift-,29 Python- und29 JavaScript-Tests bestanden.

Zusätzliche aktuelle Uhrprüfung mit echter SwiftUI-/WebKit-Komposition:1194×900,1024×900,320×667,390×844,844×390 und390×300. Beim Sprung zu Aufgabe70 bleibt die native Uhr an gleicher sichtbarer Position. Echter WebKit-Zoom1.5 ändert den Layoutviewport auf iPad1194→796 und iPhone390→260, die native Uhr bleibt unverändert. Antwortfeld und Inhalt bleiben erhalten;100 Nummern, Bearbeitet- und Leerzustand stimmen. Das temporäre Harness wurde gesichert und aus dem Produktcheckout entfernt. Kein weiterer Build dadurch.

Keine Functions, Rules, echten Schülerdaten oder Bewertungslogik geändert. AAC-, Offline- und automatische Abgabepfade bleiben im vorhandenen Umfang. Ausgewählte App-Store-Version1293 und separate Secure Test1241 unverändert. Die SDK90725-Mail ist laut Apple eine Vorankündigung für April2027, keine Ablehnung des1313-Uploads.

Die inzwischen auf main dokumentierte Wilma-Backendreparatur von PR445, Live-Revision00006-xub und deren Nachweise bei Aktualisierung von TODO/STATE ausdrücklich erhalten. Das ist ein anderer Webauftrag und löst keinen weiteren Appbuild aus.

Nächster Schritt: denselben Release44404250305 bis Signing/AAC/Upload verfolgen. Danach Apple-Verarbeitung, tatsächliche TestFlight-Verfügbarkeit und Martins physische Geräteabnahme getrennt bestätigen. Keine eigene native Lösungsfreigabeansicht behaupten; der Web-Abschlussfix ist davon unabhängig.
