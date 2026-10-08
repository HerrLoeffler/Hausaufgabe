# Lerninsel – Messbecher, Fuchs und Steuerung

Task GC-GAMES-ESCAPE-VISUAL-01, vorhandener Branch feature/lerninsel-ego-v1 / PR175. Martin bestätigt die verbesserte frühe Aufgabenführung und das erste 3/10-Wasserrätsel. Der folgende gezeichnete Bruchast ist noch unverständlich. Explizit autorisiert: gleiche reale 1-Liter-Messkanne dort wieder benutzen, Wasser zu- und ablassen bis1Liter, präzise Aufgaben; Mausgeschwindigkeit einstellen und Figur schneller bewegen. Zusätzlich direkt umsetzen: versteinerter Fuchs neben Satzaufgabe wird lebendig und öffnet das Tor mit einer Seilschlaufe. Frühere autonome Ausführung gilt, keine neue Freigabeschleife.

## Steuerung

Laufgeschwindigkeit420cm/s statt230. Fußauswahl bleibt bewusster Kontakt für0,30s; keine Sprungfunktion. Maus-Empfindlichkeit0,25× bis3,00×, Standard1,00×. Ein nativer Slider im Pausenmenü plus langsamer/Standard/schneller erlauben Bedienung. Horizontal und vertikal werden gleich skaliert; Bewegung und Touch behalten ihre eigenen Regeln. Ungültige Werte werden normalisiert. Einstellung separat von Spielständen speichern; Slider speichert beim Loslassen, Tasten unmittelbar. UI darf beim Ziehen nicht neu aufgebaut werden.

## Zweite Wasserstation

Die 3/10-Probe bleibt erhalten. Spieler hebt dieselbe Kanne wieder von ihrer Druckplatte auf. Die Kanne trägt weiterhin1Liter, Skala1/10..10/10 und sichtbare Milliliter. Hinter dem nächsten Tor: zwei beschriftete Zuläufe +1/10L=100ml und +1/5L=200ml; ein Ablauf −1/10L=100ml. Jede bewusste Aktion braucht0,6s in Reichweite, doppelte Eingabe zählt nicht doppelt, Pause/Entfernung/Fokusverlust brechen unbestätigte Portionen ab. Zulauf200ml bei900ml wird vollständig abgelehnt statt still gekürzt. Überfüllen über1000ml nicht möglich. Die Anleitung sagt: Kanne wieder holen, bis1000ml/10/10füllen, am Zielbecken eingießen. Bei300ml Restwasser fehlen700ml; dieser Betrag wird live angezeigt.

Der bisherige gezeichnete Ast wird durch zwei sichtbare Zulaufäste am neuen Wasserplatz ersetzt. Keine Linienauswahl als Voraussetzung. Das Zielbecken hat1Liter. Eingießen gelingt nur mit getragener voller Kanne und nach den bisherigen Voraufgaben. Zu wenig Wasser lässt Becher und Becken unverändert, Hinweis nennt fehlende Milliliter. Bei Erfolg leert sich die Kanne und der Beckenfüllstand steigt binnen2s, danach darf das Küstentor1,4söffnen. Solange die Animation nicht abgeschlossen ist, hält der feste Torblocker. Alte gelöste Bruchwege bleiben gültiger Fortschritt. LI3 fügt einen Nachweis wholePoured an, LI1/LI2werden weiter gelesen. Snapshotvalidierung atomar; widersprüchlicher neuer Pournachweis wird abgelehnt.

## Fuchsszene

Ein eigener stilisierter vierbeiniger Fuchs sitzt sichtbar links bei der Satzstation. Er besitzt spitze Ohren, langen Schwanz mit heller Spitze, schnauzenförmigen Kopf, vier Pfoten, Augen und eigene Stein-/Lebendmaterialien. Warmer grauer Stein blendet nach gültigem Satz zu Kupferorange, Cremeweiß und dunklen Pfoten. Keine UI-Häkchen auf Wortsteinen. Falsche/unvollständige Sätze lassen Statue und Tor unverändert.

Zeitfolge ab Satzlösung:0–1,6sFarbverwandlung und Augen öffnen;1,6–2,4sAufstehen, Ohren/Schwanz;2,4–6,4sLauf zum Tor über einen linken freien Weg;6,4–7,4sSchlaufe am niedrigen Riegel greifen;7,4–8,4smit dem Maul rückwärtsziehen, Riegel gleitet heraus; ab8,4sToröffnung1,4s. Kein teleportierender Ortswechsel während Animation. Pfoten bewegen sich abwechselnd; Schwanz folgt Körper. Keine Hände, kein Sprechen nötig. Seil darf erst beim Freigeben verschwinden/lockerfallen; Tor bleibt bis Riegelfreigabe zu. Fuchs steht beim Türschwenk außerhalb der Türfläche und setzt sich danach neben den Durchgang.

Bei Erfolg schließt die Satzoberfläche und die Kamera zeigt zunächst auf den nahe sitzenden Fuchs; freie Steuerung bleibt erhalten. Pause friert die Szene vollständig ein. Reload eines bereits gelösten Satzes zeigt den lebenden Fuchs in Endpose; Fortschritt wird nicht zurückgesetzt. Native Geometrie ist zunächst ein beweglicher stilisierter Prototyp, kein behauptetes hochwertiges SkeletalMesh wie auf den Konzepttafeln.

## Vorlagen und Prüfung

Sechs Originaltafeln mit20Motiven=120Studien: Figur, Erwachen, Laufzyklus, Seil/Tor, Platzierung, Spielfolge. Prompts und Original-PNGs sichern. Generierte Figuren nicht automatisch als fertige3DAssets behaupten. Native Tests prüfen Steuerung, Einstellungen speichern/laden, gleiche Actoridentität der Kanne über beide Aufgaben, Mengen/Abbruch, Beckenanimation, gate sweeps und Foxzeiten/Bewegung/Seilpause. Reale Aufnahmen der Zustände und UI. Ein unabhängiger Schlussreview; wichtige Befunde ein Fixdurchgang mit Regressionen. Keine Production-, Browser- oder iPadfreigabe.


## Prüfung mit bereits gelöstem Satz

Bei vorhandenem Fortschritt startet der Fuchs nach Reload in der lebenden Endpose. Deshalb ergänzt das Pausenmenü nach gelöstem Satz „Fuchsaktion erneut ansehen“. Die Wiederholung versetzt den Spieler vor die Szene, setzt nur Fuchs-/Toranimation zurück und bewahrt alle Lernantworten, Mengen und Fortschrittsflags. Es wird kein zweiter Fuchs erzeugt. Nach der Toröffnung9,8ssetzt sich der Fuchs weich bis10,6s; im Lebendzustand bewegt er Schwanz/Ohren und atmet leicht.
