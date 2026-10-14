# GradeCrew V6 — ElevenLabs und freundliche Tutorial-Einladung

Task GC-BRAND-HERO-MOTION-20261013. Isoliertes lokales Experiment, keine Produkt-/Staging-/Productionänderung. V5Source1d7203ad/V5Server8782 und Vorversionen bleiben erhalten.

## Umsetzung

- Remys englische Hörfrage nutzt ElevenLabs eleven_v4 / Teddy Twinkle – Cute Cartoon Boy. Wärme, ruhige Aussprache und kleine Pausen per Audiotags; derselbe vorbereitete Text und dieselben Bildantworten. Take1 vorläufig ausgewählt. Keine Stimme geklont. Keine Schüler-/Konto-/Credentialdaten an den Anbieter übermittelt.
- Einmaliger Erstelllauf mit vier Tooldefault-Takes; alle completed,7.36/7.36/7.44/7.36Sekunden. Je132Credits/USD0.0132,gesamt528Credits/USD0.0528. Vollständige Receipt ohne Signed/OOBURLs in ELEVENLABS-V6.json. Vier MP3s gesichert, keine automatische Neugenerierung. Qualitäts-/Stimmurteil durch Martin offen.
- Nach Wilmas Einblickbeenden erscheint die Original-Crew: Coco mit Schnurtelefon, der bereits hellblaue Remy, Emmi und Wilma als vier unveränderte Portraitkopien. Kein neues Markenbild generiert. Bestehendes Gruppenbild wegen abweichender Remyfarbe nicht eingesetzt.
- „Willst du die Crew noch besser kennenlernen?“ / „Erstelle mit uns deinen ersten Test – Schritt für Schritt.“ mit blauem Tutorialstart und „Vielleicht später“. DE/EN, Schließen/Escape bleiben verfügbar. Bestehende Homepage-/Header-/Dialog-Tutorialbuttons öffnen dieselbe Einladung; ihre Akzentfarbe jetzt kräftig blau.
- Das vollständige bestehende Tutorial ist noch NICHT in die lokale Vorschau eingebunden. Der blaue Einladungsbutton zeigt danach den klaren lokalen Hinweis. Keine behauptete Fulltour-Ausführung, kein Sprung zur synthetischen Abschlussfixture und keine automatische Stagingnavigation.
- V5Layout/NoScroll/C/E/W5sAutoplay/RemyManual/hellblaue Assets erhalten. Neue Einladung suspendiert den Previewtimer und pausiert Audio. Später/Close setzt eine darunterliegende Vorschau fort; nach Wilmaabschluss geht es zur Homepage. Keine Trial-/Signup-/Auth-/Fulltourengineänderung.

## Start und Prüfung

`python3 -m http.server 8783 --bind 127.0.0.1` in diesem Ordner. http://127.0.0.1:8783/ . Eigener ServerSession95513, nur Loopback. Quelldateien/art und Original-Baseline separat; kein Clouddeploy.

23/23 bestehende Tests frischgrün. Testpfad für Hörfrage bewusst von alter System-WAV auf neue ElevenLabs-MP3 geändert; vorheriger22/23-Lauf scheiterte ausschließlich an diesem erwarteten Dateipfad. Keine neue Flow-/Enginefunktion außerhalb Einladung. OriginalheroMarkup/Fitter/Styles und E/WRenderer weiterbytegleich; V5komplette Höhenprobe bleibt als historische V5Evidenz erhalten, nicht als V6neu ausgegeben.

Tatsächliche CUA-Prüfung: Wilmafinal→Einladung; Später→Homepage; Header/Modal/Homepage-Tutorialbuttons→Einladung; Einladungstart→klarer Vorschauhinweis; Close funktioniert. Größen1280×720 (650×432),957×523 (650×345),390×667 DE/EN (352×482): DialogclientHeight=scrollHeight, alle vier Bilder geladen und beide46.5pxButtonssichtbar. BrowserohneWarn/Error. NativeAudio tatsächlich neue assets/remy-listening-take-1.mp3,duration7.36,playing=true,currentTime0.209546. Audio pausiert beim Einladungswechsel tatsächlich paused=true beobachtet. Hintergrundscroll bei Einladung gesperrt; finaleDesktopaufnahme enthält dieses letzte Verhalten. NativePlayer überAX bedient; DOM-Playwright kann dessen internePlaytaste nicht finden, kein Appfehler.

Belege in previews/verification-v6.json, invitation-desktop.jpg/invitation-small-desktop.jpg/invitation-iphone-de.jpg/invitation-iphone-en.jpg/remy-elevenlabs.jpg. Mobilebilder vorletzter Hintergrundscrollsperre; Dialoghöhen/Copys/layout unverändert, kein internerÜberlauf. Keine physischeGeräte-,Safari-,VoiceOver-,OSReducedMotion-,CI-,Integrations-,Nutzerstimmen- oder Deploymentabnahme. Stufe branch_only.

SEC15/18 und PRIV12–15/19 nurlokal: CSPconnect-srcnone/keineAppFirebase/keinRuntimeProvider; neueAudiogenerierung ausdrücklich vomHuman autorisiert, synthetischer Übungssatz. RemoteMedia einmal als lokale Einbauartefakte heruntergeladen; SandboxDNS zunächst blockiert, gereviewter Download vorhandenerArtefakte erfolgreich, kein erneuter Generationstart. Token-/CodexUsage/RuntimeModellEffortunknown, kein programmatischerWechsel/kein Budgetreset/keine Delegation.

Nächster Schritt: Martin hört die neue Remy-Stimme und beurteilt die Einladung. Echte Fulltour-Zielverknüpfung offen. Keine automatische Produktübernahme.
