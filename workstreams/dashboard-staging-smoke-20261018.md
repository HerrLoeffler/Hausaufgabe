# Live-Prüfung der wichtigsten Staging-Funktionen — 18.10.2026

Task: GC-BRAND-HERO-MOTION-20261013. Quelle: gc41 / 7a18445f926a16b9a795c761f9863d7ecfb6b3b0. Verantwortlich: bestehender Design-Fachchat01a130fa-babb-7de3-bfeb-785499e7c061.

## Ergebnis

Die geprüften Kernabläufe funktionieren auf Staging. Eigener Test WX48ZVJC ist beendet, mit einer erhaltenen synthetischen Abgabe. Keine bestehenden Unterrichtstests, Produktquellen, Berechtigungen, Deployments oder Production geändert.

| Bereich | Tatsächlich beobachtet |
|---|---|
| Zugang und Übersicht | Vorhandene Sitzung wiederhergestellt; Suche und Statusfilter funktionieren. |
| Remy | Echter Hintergrundauftrag: genau drei Aufgaben, drei Punkte und eine Höraufgabe. |
| Editor und Emmi | Manuelles Speichern und echte Überarbeitung erfolgreich; Audio und Bewertung weiter nutzbar. |
| Schülerzugang | Getrennte anonyme Sitzung auf verifiziertem zweiten Staging-Host; Codeeingabe und Start erfolgreich. |
| Audio und Wiederaufnahme | Audio auf beiden Seiten abspielbar; Antworten nach Neuladen wieder vorhanden. |
| Abgabe und Bewertung | Eine absichtlich falsche Antwort: erwartete2/3 und67% auf beiden Seiten. |
| Manuelle Bewertung | Teilpunkt gespeichert:2.5/3 und83% auf beiden Seiten; anschließend2/3 wiederhergestellt. |
| Coco und Tutorial | Korrekte Antwort zum geöffneten Test; Settings-Button öffnet die Originaleinführung. |
| Abschluss | Eigener Test sicher beendet; Ergebnis bleibt nach Neuladen erhalten; keine erfassten Konsolenfehler. |

## Offene Beobachtungen und Grenzen

- Der Footer zeigt gc40, obwohl die tatsächliche Version gc41 ist. Die statische Stelle in index.html wurde identifiziert.
- Emmi bezeichnet geschütztes Audio als Bildaufgabe und meldet zwei Änderungen bei einem Wunsch zu Aufgabe1. Die zweite Zählung wurde nicht erklärt; keine weitergehende Modellqualitätsfreigabe behaupten.
- Nicht geprüft: neue Passwortanmeldung, Registrierung, Passwortreset/Mails, vollständiger Tutorialabschluss, sechs echte Anmeldungen, physische iPad-/iPhone-Safari-Geräte, sämtliche Aufgabentypen oder Last.
- Der Staging-Prüflauf ist ein Agententest; Stage bleibt staging_deployed, kein menschlicher Geräteabnahmenachweis.

Maschinenlesbare Belege: [dashboard-staging-smoke-results-20261018.json](dashboard-staging-smoke-results-20261018.json). Screenshots liegen lokal im eigenen Visualisierungsverzeichnis gradecrew-staging-smoke-20261018. Nächster Schritt: die kleinen Anzeige-/Meldungshinweise getrennt nachführen; Production unverändert lassen.

## Planung und Versuchshistorie

# Staging gc41 — beauftragter Kernfunktionstest

Task GC-BRAND-HERO-MOTION-20261013, bestehender Design-Fachchat. Nutzer18.10.2026: wichtigste Funktionen auf normalem Staging prüfen, Production unverändert.

Quelle canonical gc41/7a18445f. Vorhandene Sitzung wird über normale Browseroberfläche wiederhergestellt. Keine Credentials auslesen, keine Rollen-/Regeländerung, keine Deploys und keine bestehenden Unterrichtstests verändern. Eigener klar betitelter SYSTEMTEST und synthetischer Teilnehmer. Neue Testdaten bleiben nachvollziehbar separat.

Plan: Sitzungswiederherstellung/Dashboard, Suche/Filter, eigene kleine Remy-Generierung (ein Start, keinen unklaren Job wiederholen), Editor/Speichern/Preview, eigene Veröffentlichung, anonymer Schülercodezugang, synthetische Abgabe und automatische Punkte, Lehrkraft-Ergebnisansicht, eigene Veröffentlichung sicher beenden. Zusätzlich Settings/Tutorial, Coco/Emmi auf erlaubte kleine Funktionsproben sowie Bild-/Audiowiedergabe soweit im eigenen Test vorhanden. Registrierung/Passwortreset nicht auslösen, keine E-Mails oder echten Schülerdaten. Keine Kontologouts ohne gesicherten Wiedereinstieg erzwingen. Tatsächlich getestete Funktionen getrennt von offen/ungeprüft dokumentieren.

Angeforderte Arbeit komplexe reale UI/Backendgrenzen: Sol/medium sinnvoll; tatsächlich verwendetes Runtime-Modell/Effort/Usage unbekannt. Kein zusätzlicher Guardian-/Providerauftragsstart, nur normale begrenzte Produktbedienung auf vorhandener Stagingkonfiguration im aktuellen Nutzerauftrag. Keine Rücksetzung früherer Versuchshistorie.

Bereits beobachtet: canonical Release gc41/167Dateien bestätigt; reale vorhandene Anmeldung und48Tests korrekt geladen. UI-Footer nennt gc40, während Release und Meta gc41 ausweisen — zunächst kosmetische Versionsabweichung als Befund, keine Produktänderung im Prüfauftrag.

Zwischenstand: eine echte Remy-Generierung über Hintergrundauftrag gestartet, ohne Wiederholung. Eigenes Artefakt SYSTEMTEST gc41 – Addition und Subtraktion bis20, CodeWX48ZVJC. DreiAufgaben/3Punkte, genaueineHöraufgabe, TypenSingle/number/truefalse. Generierung/PrivateAudio laden erfolgreich; Browseraudio2.568s, readyState4, Wiedergabezeit>0, keinMedienfehler. Frage1 manuell geändert und Server-Speicherbestätigung erhalten. Emmi-Gesamttestüberarbeitung einmal gestartet mit eng begrenzter Formulierungsänderung anAufgabe1; Ergebnis noch ausstehend. Bestehende48Tests unverändert.

Emmi-Antwort erfolgreich: gewünschte Formulierung gespeichert, Lösungen/3Punkte undAudio erhalten. UI-Zusammenfassung nennt2überarbeitete Aufgaben und1geschützteBildaufgabe, obwohl nurAudio enthalten ist — nicht als fachlich korrekte Zähl-/Medienbeschreibung behaupten, separater Hinweistextbefund. Prüfung abgeschlossen, eigenerTest mitPunkte+Prozent und ausgeschalteterLösungsfreigabe erfolgreich gespeichert und veröffentlicht.

Schülerzugang wirklich getrennt: Standardauthdomain hausaufgabe-staging.firebaseapp.com aus vorhandener Stagingkonfiguration. Öffentlicher Releaseabgleich bestätigt denselben gc41/7a18445f vor Bedienung. AndereOrigin, normale anonymeSchülerauth, Lehrkraftsession aufweb.app erhalten. EchterCodeeingangWX48ZVJC routet korrekt secure-student.html; synthetischerNameGC41-Systemtest,3Aufgaben geladen. Audio imSchülerplayer2.568s/readyState4/Wiedergabezeit>0 ohneMedienfehler. FürBewertungsprobe absichtlich9richtig,12statt13falsch,Falschbei6+8=15richtig — Erwartung2/3Punkte. Abgabe/Auswertung noch ausstehend.

Fortsetzung: vorAbgabeNeuladen stelltbeideerstenAntworten wiederher. DritteAntwort gesetzt, echte serverseitigeAbgabe:2/3Punkte67%, keineLösungenfreigegeben. Neuladen der abgegebenenSitzung zeigtweiterdenselbenBeleg; Lehrkraft siehtgenaueineAbgabe/2von3/Bewertet. ManuelleTeilpunkte0→0.5 gespeichert:beideAnsichten2.5/3und83%; danach0wiederhergestelltundLehrkraft2/3erneutbestätigt. KeineechtenSchülernoten. Belege lokal gradecrew-staging-smoke-20261018/student-result.jpg undteacher-result.jpg.

Coco zur Testkontextfrage einmal gestartet, Ergebnisoffen; keine Gesprächshistorie/anderen Testtitel im Prüfbericht speichern. EigenerSystemtest wird vorAbschluss sicherbeendet. Einstellungen→Tutorial-Einstieg und abschließendeBrowserfehlerkontrolle folgen.

## Abschluss des echten Staging-Durchlaufs

Coco antwortet korrekt mitTitel des eigenenSystemtests und3Aufgaben. Einstellungen→Tutorial starten lädtDashboard und originaleCoco/Crew-Einführung. Einstieg geprüft, den vollständigen6–7-Minuten-Lauf nicht wiederholt; Neuladen beendet die Introprobe ohne zweitenÜbungstest. Kein Neuerstellen/Registrierungs-/Passwortreset-/Logouttest und keine E-Mail ausgelöst.

EigenenTest über normalen Dashboard-Schalter mit Bestätigung sicherbeendet. Einmaliger Browsertransport-Timeout bei Return-Bestätigung; tatsächlichenStatus danach geprüft statt Aktion wiederholt: „Test beendet“, veröffentlichteAnzahl2→1, beendet15→16. EigenerCodeWX48ZVJCbeendet, bestehender veröffentlichterTest erhalten. Eigene synthetischeErgebnisse nachEnde undNeuladen weiter2/3,67%, genau1Abgabe. Keine Löschung nötig; eigenerSystemtest mitNachweisen bleibt alsBeendet erhalten. Suche undStatusfilterBeendet finden genau1von49.

Browserkonsole teacher/student abschließend0erfassteFehler. RealeBrowserbreite1280px, kein horizontalerÜberlauf, neuerTest160.55×52pxrechtsoben. AngeforderteViewportprobe1024x768 wurde vomBrowser nicht nachweislich angewendet (gemesseneBreite1280), daher keinen iPad-/Safari-Gerätenachweis daraus ableiten. TemporärenOverride zurücksetzen.

Ergebnis: geprüfteKernabläufe ohne Funktionsausfall. Zwei Anzeigeabweichungen offen: statischerFooterindex.htmlnochgc40 gegenübertatsächlichem Release/Appgc41; Emmi beschreibt geschützteMedien pauschal alsBildaufgabe obwohlAudio. Emmi meldet2überarbeiteteAufgaben, obwohl nurFormulierung1beauftragt; sichtbareFrage1korrektgeändert, Frage2/3, Antworten/Punkte/AudioinEditorundSchüleransichtkorrekt. DerGrundderzweitenÄnderungszählungistnichtbelegt; keinegenaueEin-Aufgaben-Beschränkungs-/ModellqualitätsfreigabeausdiesemEinzeltestableiten.

Production, Code, Regeln, Rollen, Konfiguration und Deployzustand in diesemPrüfauftrag unverändert. Ausschließlich eigenerStaging-Test, synthetischeAbgabe, normaleProduktaufrufe (Remy1, Emmi1, Coco1) und Dokumentationsnachweise. RealeKosten/Usage unbekannt; kein zusätzlicherGuardianstart/Retry. NächsterSchritt: kleineAnzeigefehler getrennt im bestehendenTask nachführen; weitere Sicherheits-/Last-/alleAufgabentypen-/echteGeräteabnahme bleibt separat. Keine pauschale Zusicherung aller ungetestetenFunktionen und kein user_tested-Gesamtstatus.
