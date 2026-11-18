# Wilma normaler Einstieg und offener Aufgabenwähler · 18.11.2026

Bestehende Tasks GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01; Webowner01a15f06. Fortsetzung auf isoliertem Checkout fix/wilma-normal-entry-20261118 ab tatsächlichem Livecodef723e71, gleicher PR438. Main9f50c06 und aktuelle Freigabe/Übergabe gelesen; kein doppelter nativer Auftrag. Native iPhonekopf separat.

## Auftrag und bestätigte Ursache

Martin meldet weiterhin fehlenden KI-Vorschlag für320€/leerezweiteLücke sowie fachliche Alternativantworten außerhalb einer Musterliste. Zusätzlich offener mobiler Aufgabenwähler abgeschnitten. Der genaue Livefall wurde ausschließlich lesend zugeordnet: review/needsReview, vorLegacycutoff, kein vorhandener KI-Job, keine expliziten Zusatzkriterien. Null Providerstarts/Notenschreibvorgänge bei Diagnose. Er ist nie gestartet; kein fehlgeschlagener Retry. Alte Abgaben dürfen deshalb nicht unbemerkt als ganze Klasse neu abgerechnet werden.

Korrektur: erster expliziter KI-Start in der Antwortzelle klar sichtbar; neuer automatischer Einstieg unverändert kostenbewusst. Selbständige fachliche Aufgabe ohne Zusatzraster erreicht semantische Prüfung mit Unsicherheit statt bloßer Sperre. Aufgabe, sämtliche Teilantworten, echte Kriterien, gesonderte Musterantworten und Punkterahmen gehen in den Providerkontext. Muster sind nicht abschließend. Legacy-Fingerprint/Cache bleibt absichtlich bytegleich; nur quotierter Providerinhalt wird ergänzt. Gültiger alter Beleg erhält Vorrang, fehlerhafter Lauf behält gesonderten bewussten Retry, keine Notenautomatik. Cached KI-Belege verbrauchen keine neuen Stage-Prüfslots.

## Belegstand, noch kein neuer Deploy

Neue Regressionen zuerst tatsächlich rot; anschließend grün. Sechs semantische Transport-/Guardtests, vollständigeWilmaFunctions130grün. Vollständige Functions509/509 und Root/UI853/853 grün. Der erste Root/UI-Aufruf benötigte noch den bestehenden --experimental-vm-modules-Schalter für zwei Tests; mit korrekter Laufzeitoption vollständig bestanden. Popupmatrix72offene Szenarien plus jeEngineZoom/Erststart, bestehende72Wilma/8Antwortlayoutfälle grün. SichtbarerScrollhinweis wird als letzte explizite Anforderung ergänzt und erneut geprüft. Popupagent arbeitet ausschließlich mjs/css + dedizierten Tests im selben isolierten Checkout, Parentnurapp/scheduler/core/system. Keine gemeinsame Datei gleichzeitig editiert. Unabhängiger Review folgt.

Staging vorab: Hosting335fff0a6316dcf7,101Functions, reviewWilmaAnswers00011-guf. Live73a1e618cab1a0ba,62Functions, reviewWilmaAnswers00006-xub. Neue parallele Stage-Änderungen erhalten, nur /wilma/-Kandidat und selektive WilmaFunction anfassen. Kein Source-only-/Hostingnachweis aus dem Vorgänger einem neuen Stand zuschreiben.

## Kontrollierte weitere Abnahme

Kleine synthetische Stagefälle: gültigesTier außerhalbHund-Beispiel, falscheAntwort, unklarerAbbruch;320€/leer=0nach expliziterRubrik und korrekteErhöhung/leererPreis=Teilpunkte. Ziel höchstens5neue einzelneStageproviderstarts insgesamt, konservativeUsageobergrenze20000MikroEUR; globale Monatsreservierung/History bleiben erhalten. Zwei neue automatischeIdentitäten proClient unverändert; vorhandene KI-Belege werden kostenlos genutzt. Keine ungeklärten Starts wiederholen. Neue UI-/Cache- und semantische Funktion müssen tatsächlich online vor Livepromotion belegt sein; keine gemockte KI als fachlichen Nachweis ausgeben.

Direkte Freigabe für den exakt gemeldeten Livepfad gilt. Nach bestandenen Gates eng veröffentlichen, konkrete beanstandete Antwort höchstens einmal bewusst als ersten KI-Lauf starten, keine echte Bewertung bestätigen/überschreiben, keine weitere Klasse massenweise starten. AktiveRevision, UI und persistiertenVorschlag belegen. OffeneGerätegrenzen nennen. NächsterSchritt: komplette Tests/Pickermatrix und unabhängigen Review sichern, genau diesen Kandidaten auf Stage prüfen, anschließend selektive Livepromotion mit Erhalt aller parallelen Änderungen.
