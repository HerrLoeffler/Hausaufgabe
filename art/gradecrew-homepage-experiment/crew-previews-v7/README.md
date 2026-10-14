# GradeCrew V7 — Coco lädt die Crew ein

Task GC-BRAND-HERO-MOTION-20261013. Separates lokales Experiment. Bestehende Homepage, Staging, Production und Vorversionen unverändert.

## Änderungen

- Generischer Hinweis unter der Headline entfernt. Sprechblase bei Coco: „Klick auf meinen Bauch – ich stelle dir die Crew kurz vor!“ / „Tap my belly – I’ll introduce you to the crew!“. Bauchregion anklickbar; Namensbutton für Tastatur erhalten. Mobile Blase flacher oberhalb der Gesichter.
- Erste Bildfrage: Bär mit rotem Regenmantel und gelben Gummistiefeln. „Which two things is the bear wearing?“ mit vier Kleidungspaaren. Zehn Aufgaben, 14 Punkte. Keine zweite Häschen-Schalfrage.
- Häschen-Hörfrage, Bilder und ElevenLabs-MP3 bytegleich zu V6. Keine neue Audiogenerierung.
- Homepage-, Header- und Einblick-Tutorialbutton starten direkt die lokale Original-Gasttour. Nach Wilma bleibt die freundliche Einladung, deren Tutorialbutton dasselbe Ziel öffnet.

## Originaltutorial als isolierte lokale Kopie

Route /tour-runtime/index.html. Originale App-Oberfläche und Tutorial aus gc39 / 8f8697901f8c1aea89897be855ca2872c82d0f2b. Vier Tour-/GuestRepository-Dateien bytegleich zur Baseline. Zusätzlich gelesene Originalmodule unter tour-reference/ unverändert; baseline/ unverändert.

Runtime-Fassade ersetzt ausschließlich Firebase-SDK-Importe und Konfiguration. Auth-, Datenbank-, Storage- und Callable-Aktionen werfen; kein SDK oder Anbieteraufruf. CSP connect-src self und form-action none. Original-InMemoryGuestRepository hält vorbereitete Übungsdaten nur im Arbeitsspeicher. Keine echte KI, Registrierung, Trial oder Cloudveröffentlichung. Gasttour-Exit führt zur eigenen Homepage. Die separate finale.html-Fixture wird nicht vom Tutorialstart benutzt.

## Prüfung

28/28 Node-Tests einschließlich Backendverbot, Originalerhalt und Unterschied der Bild-/Hörfrage. Original-Hero-Markup, Fitter, E/W-Renderer und geprüfte Assets unverändert. Take1-Gitblob weiterhin 20d155c9c20354dd84de08aa459e09714031f00e.

CUA: Bauchaktion funktioniert bei 390×667, 957×523 und 768×1024. Bärenfrage: iPhone Dialog 651/651, Paper 321/321; kleiner Desktop EN Dialog 499/499, Paper 244/244 (clientHeight/scrollHeight). Coco iPad 700/700. DE/EN-Hinweis geprüft. Vorhandene Häschen-MP3 korrekt eingebunden.

Original-Gasttutorial tatsächlich gestartet: Homepagebutton → Coco-Willkommen ohne Einladung → Neuer Test → Remy → Originalfelder automatisch ausgefüllt → lokaler Zehn-Aufgaben-Entwurf → Übergabe an Emmi. Wilma-Kurzeinblick beenden → Einladung → echter Coco-Tutorialstart geprüft. Keine Browser-Warn-/Fehlerlogs in diesen Abläufen.

Grenzen: kein erneuter kompletter Tourdurchlauf bis Schülerabgabe, Bewertung und Tutorialende; keine vollständige Tourabnahme. Keine physischen Geräte-, Safari-, VoiceOver-, CI- oder Deploymentprüfung.

## Start und Sicherung

python3 -m http.server 8784 --bind 127.0.0.1
Vorschau http://127.0.0.1:8784/ . Loopback-Server Session37581.

Codecheckpoint 3d76e3a0f647822bb7dc37617900d699dfac594a auf docs/gc-brand-hero-motion-20261013. Status branch_only. Kein PR, Merge oder Deploy. Ein imagegen-Aufruf; PROMPTS-V7.md. Keine weiteren ElevenLabs-Aufrufe. Task-, Versuchs- und Budgethistorie erhalten; keine Delegation oder Modellwechsel. Tatsächlicher Runtime-/Token-/Modellverbrauch unavailable.

Belege: previews/home-desktop.jpg, home-iphone.jpg, remy-bear-iphone.jpg, remy-bear-small-desktop.jpg, tutorial-created.jpg. Nächster Schritt: Martins visuelle Rückmeldung.

## V7b — Sprechblase bei Coco, 14.10.2026

Kleine autorisierte Korrektur im bestehenden Experiment auf 8784: weiche runde Blase, warmes Weiß, dezente Kontur und gut sichtbarer zweilagiger Zipfel zu Coco. Desktopposition an Originalbildkoordinaten gebunden, näher an Cocos Gesicht; mobile Blase über den Köpfen mit Zipfel nach links unten zu Coco. Kein neuer Text, keine zusätzlichen Animationen, keine Änderung am Tutorial oder an Originalbildern. Vorgänger-CSS/JS in previews/bubble-before* und Commit9e0f80b erhalten.

CUA bei 1280×720, 957×523 und 390×667 visuell geprüft; DE/EN lesbar, kein Gesicht vom Blasenkörper überdeckt. Mobile Bauchaktion öffnet Coco weiterhin. 28/28 bestehende Tests erneut grün; keine neuen Tests für den CSS-Eingriff. Browser keine Warn-/Fehlerlogs. Belege coco-bubble-desktop-v7b.jpg und coco-bubble-iphone-v7b.jpg. Keine physischen Geräte/Safari/VoiceOverprüfung. Kein Deploy; branch_only. Keine kostenpflichtige Generierung oder Delegation. Nutzerkorrektur direkt umgesetzt, keine vorformulierte nächste Nachricht oder erneute Freigabefrage.
