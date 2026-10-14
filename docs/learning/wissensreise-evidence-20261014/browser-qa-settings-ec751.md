# Gezielte Settings-/50-Aufgaben-QA

Task GC-LEARNING-WISSENSREISE-01. Unveränderlicher lokaler Kandidat b1a7571 im Snapshot /private/tmp/gc-wissensreise-qa-settings, Loopback8796/fixture. Stand14.10.2026. Rolle unabhängige Browserprüfung; keine Runtimekorrekturen. Quelle TEST50, Auth und Generator synthetisch, echter Inhaltskern/Service/DOM aus Kandidat. Keine Provider-/Firebaseaufrufe. Keine vollständige Wiederholung des früheren120s-Laufs.

## Beobachtete geänderte Bedienung

Einstieg Wissensreise einstellen mit Zurück zu meinen Tests, vier nummerierten Abschnitten: eigener Test, Übungsarten als Auswahlkarten, Lernmodus als Radiokarten und Dauer als Radiokarten. Eine Zusammenfassung Dein Training nennt Quelle, Aufgabenanzahl, Übungsartenzahl, Modus und Zeit. Primärer Einstieg Training vorbereiten, danach fachliche Prüfung/Freigabe und Training starten. Keine Noten, Punkte, Sperren oder feste Startthemen aus Referenzspielen übernommen.

## Konkrete Prüfungen

- TEST50 ausgewählt, Frei üben und2Minuten per Space gesetzt. Zusammenfassung zeigt50Aufgaben/11Übungsarten/Freiüben/2Minuten.
- Training vorbereiten erfolgreich:50von50Quellaufgaben geeignet,50spielbare Lernaufgaben vorbereitet. Kein alter40-Aufgabenfehler.
- Alle50 synthetischen Vorschauaufgaben/Antwortschlüssel über DOM geprüft:50arithmetisch korrekte Lösungen, keine fehlgeschlagenen Vorschauindizes.
- Entwurf nach Refresh wieder geöffnet; Quelle50, Modusfrei und120s bleiben sichtbar. Kein Generierungsneustart.
- Nur synthetische Lernkopie freigegeben, Nachfüllung deaktiviert. Trainingstart zeigte2:00, Zahlaufgabe und leere Guidedregion. Damit Keyboardwahl in echte Service-/Playerdarstellung serialisiert.
- FixturePause/Exit führte wieder zu Einstellungen und gespeichertem50Aufgabenentwurf mit Frei/120s. Dieser FixtureExit ist ausdrücklich kein neuer Produktionsbootstrap-Pausebeleg; den früheren echten Bootstrapbeleg unverändert getrennt erhalten.
- Desktop und390x740 geprüft. Mobil innerWidth390/scrollWidth390; Select44px hoch, Auswahlkarten90px hoch. Kein horizontaler Überlauf. Die Viewport-API lädt in diesem Chrome-Backend die Seite neu; vor der Vorbereitung musste die ungespeicherte Quellauswahl erneut gewählt werden, nach gespeichertem Entwurf wurde sie wiederhergestellt. Keine Produktorientierungsprüfung aus diesem Toolverhalten ableiten. Viewport abschließend zurückgesetzt.
- error/warn=[] in der beobachteten Fixture-Konsole. Kein physischer Touch-/iPadbeleg.

Screenshots settings-fix-test50-desktop.jpg und settings-fix-test50-390.jpg. Der erste große mobile Screenshot zeigte nach Toolreload noch keine Quellenauswahl und wurde durch einen korrekten390px-Beleg mit wiederhergestellterTEST50-Auswahl ersetzt.

## Grenzen

Hier keine echte Benutzertestkopie/Anmeldung, keine Generierung oder öffentliche Lernveröffentlichung. Der echte50-Aufgaben-Nutzerfehler wurde zuvor separat in QA_USER_FAILURE_20261014.md belegt. Sein tatsächlicher Fixnachweis braucht den deployten neuenSHA und dieselbe bestehende Nutzersitzung. Inputmedien/100Aufgabencap/Sicherheitsprojektion und allgemeine Regressionen prüft der separate Codeprüfer.

Nächster Schritt: exakten Remote-/Deployreceipt des Kandidaten erhalten und auf derselben Preview mit bestehenden Nutzerrechten die echte Auswahl → Trainingvorbereitung gezielt erneut prüfen.
