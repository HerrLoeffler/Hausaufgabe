# Master V1 – unabhängiger Review und Korrekturen

08.10.2026, GC-GAMES-ESCAPE-VISUAL-01. Frischer read-only Reviewer, Bereich4ddb8a5..fc46997. Keine Critical-Befunde; fünf Important und ein Minor. Reviewer bestätigte80reineChecks, führte gemäß Zuständigkeit keine App-/Buildaktionen durch. Korrekturen durch Root, kein zweiter kostenpflichtiger Reviewdurchlauf.

- Rücksprungziele: Frage→Rucksack→Zurück→Zurück und Pause→Lehrkraft→Zurück→Fortsetzen nativ RED. DialogHistory-Stapel statt überschriebenem Einzelziel; GREEN.
- Gehaltene Tasten: UE rekonstruiert gedrückte Tasten nach Flush beim ersten Repeat. Eigene DirectionInput-Press/Release-Erfassung mit gesperrten gehaltenen Tasten, keine Flush-Auswertung. Neue reine Eingabeprüfungen RED→GREEN; native Slate-Ereignisprüfung bestätigt Neutralität nach Dialog.
- Pfeile: Slate-Navigation konsumierte Eingabe. Zentraler PreviewKeyDown/KeyUp-Pfad behandelt Pfeile in der Welt; native fokussierte Screen-Ereignisse prüfen alle vier Richtungen. Das ist synthetische native Eingabe, kein OS-Maustest.
- Transferfeedback: sechs Erklärungen/Hinweise passten zum Original statt Transfer. Native RED mit unabhängigen mathematischen Fakten; passende Transfertexte, GREEN.
- Kollision: Brunneninnenraum und Wasser neben dem Steg nativ RED. Begehbare Bereichsmaske plus Engine-Körperabfrage für Props, unsichtbare geöffnete Tore/aufgesammelte Muschel ohne Kollision. GREEN, inklusive sicherer Positionskorrektur und zusammenhängendem Rasterweg zu allen Pflichtzielen.
- Minor Hinweise: abgelaufene Toasts bleiben sichtbar. Dynamische Slate-Sichtbarkeit korrigiert; Hinweise erscheinen nur in der Welt. Kein aufgeschobener Code-Minor aus diesem Review.

Zusätzlich aus Screenshotprüfung: abgeschnittener Fragetext korrigiert mit explizitem WrapTextAt; Antwortfelder zweispaltig; Fehlerrückmeldung direkt unter Titel; redundante Missionsleiste während Dialog entfernt. Gerenderter Fragedialog mit vollständigem Text kontrolliert. Erster sofortiger Weltscreenshot zeigte noch nicht aufgebaute Materialien; Capture wartet deshalb vor dem Village-Bild.

Vom Reviewer bewusst nicht beurteilt und weiterhin separat offen: echte OS-Mausbedienung bei verschiedenen Fenstergrößen, physischer Touch-/Mobiletest und Mobileperformance, realer Erstspiel-Zeit-/Lernanteil, subjektive Grafik-/Rätselabnahme, GradeCrew-Live-Übungslifecycle. Root-CUA bei Fensterwahl in langen Werkzeugtimeout geraten; keine andere OS-Eingabeautomation als Umgehung verwendet. Nativer Automationstest und Screenshots ersetzen diese Abnahmen nicht.
