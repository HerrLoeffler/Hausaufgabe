# Secure: Aufgaben links, Übersicht rechts, bewusste Abgabe

Owner GC-IOS-02 / GC-RELEASE-06. Authorisiert durch Martins gemeinsamen Browser-/Secure-Auftrag, zuletzt über Zentrale fortgesetzt. Basis Secure Live 3b537c8ccbbff113ee999524013a1d17d08f4c54 (TestFlight1272-Linie). App-Store1293 bleibt unverändert.

## Vertrag
Ab1024CSS-Pixel Breite und600 sichtbarer Höhe: Aufgaben links, kompakte Übersicht rechts, darunter großer Test-abgeben-Button. Große Schrift muss schmalere Darstellung erlauben. Schmale/niedrige Ansichten behalten native Abgabe und aufklappbare Navigation. Kein Neuaufbau der Antworten bei Resize, kein Verlust von Fokus/Audio/Entwurf. Grün heißt beantwortet, niemals bewertet.

Manuelle Abgabe: native Zusammenfassung beantwortet/offen; ABGEBEN bzw SUBMIT eingeben, erst dann verbindlich abgeben. Cancel/Swipe/Escape verwerfen Bestätigung. Native Versuch-/Phasen-/Speicherprüfung bleibt maßgeblich. Zeit- und Zwangsabgabe warten niemals auf Dialog oder Wort. Keine neue CAPTCHA-/Identitätsprüfung.

## Schritte und Nachweise
1. Navigation/Bridge RED→GREEN: breite rechte Übersicht, Höhenwechsel, Fokus/Antwortknoten unverändert, richtige Scroll-Abstände, Escape-Rückkehr, gesperrte Abgabe.
2. Native Wortbestätigung RED→GREEN: falsch/leer blockiert, korrekt nur aktueller Versuch, Cancel verwirft; bestehende Deadline-/Offline-/Neustarttests erhalten.
3. Reale iPhone/iPad WebKit-/SwiftUI-Matrix prüfen, große Schrift und Tastatur, 1/30/100 Aufgaben; Build für Live und separate Testidentität prüfen. Icon aus1293 gezielt übernehmen ohne neuere Variantenkonfiguration zu verlieren.
4. Review, begrenzte Fehlerbehebung, neuer gesonderter TestFlight-Build aus belegter Quelle. Keine stillschweigende Ersetzung des Apple-Review-Builds1293. Build/Upload/Processing/Verfügbarkeit getrennt dokumentieren.

## Arbeitsbereich
Nativer create_worktree-Aufruf g3:184 bleibt ohne Antwort; keine zweite Erzeugung. Unabhängige Quellkopie aus git archive, eigenes lokales Repository /private/tmp/gc-secure-sidebar-source-20261118. Basissnapshot ausdrücklich kein upstream Commit. Änderungen werden als Patch gegen obige echte Basis übertragen, nicht als neue fremde Historie gemergt. Bestehender Icon-Checkout unverändert.

## Review-Fokus
Höhenwechsel/Keyboard dürfen kein JS-Reload und keinen Snapshotwechsel erzeugen. JS-Abgabeknopf darf nur bestätigungsgeprüften nativen Request auslösen. HTML-Origin-/Mainframe-Guard unverändert. Automatische Abgabe während offenem Dialog, alte Bestätigung nach Cancel/Versuchswechsel, 100 Aufgaben und große Schrift, kein versteckter einziger Abgabeknopf.
