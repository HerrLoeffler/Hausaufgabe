# Aufgabe: GC-TEACHER-INTRO-20261028

- Aktualisiert: 26.10.2026
- Auftrag: neue lokale PowerPoint für Martins Kollegium am 28.10.2026, ca. 8–10 Minuten, zehn Folien.
- Verantwortlich: ausführender Fachagent kollegium_deck unter Koordinator presentation_finish. Chat-Link unbekannt.
- Übernahme: vorheriger Autor vom Koordinator gestoppt, kein vorhandenes Buildskript/PPTX und kein laufender externer Job laut Übergabe. Bestehender Folienplan und Quellenbrief übernommen.
- Arbeitszustand: lokale Präsentation erstellt und geprüft, Dokumentation branch_only.
- Aufgabenbranch: docs/teacher-intro-20261028
- Basis: main 233656a6fb4c663134317bb138606942639920ec
- Integrationsziel: main (nur Dokumentation). Kein Merge/Deploy beauftragt oder ausgeführt.
- PR: keiner
- Abgrenzung: eigenständiger Kollegiumsauftrag, nicht GC-FINANCE-BAYSTARTUP-20261008.

## Ergebnis

Neue editierbare 16:9-PPTX mit Originalzeichen und proportionaler Originalcrew, zehn Folien und Referentennotizen für rund neun Minuten. Durchgehendes synthetisches Beispiel Wasserkreislauf/Klasse5. Website, Lehrkräfte-App und Secure nach Rolle und Zugangsstand getrennt. Materialdateien und KI-Bildauswahl getrennt, Hörtext/Antwortoptionen präzise, Speichern/Schüleransicht, Startmodi, Code/Link/QR, Abgabebestätigung, Auswertung und separate Lösungsfreigabe sowie exakte Feedbackklickwörter enthalten.

Lokaler Outputordner: /Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/outputs/gradecrew-kollegium-20261028
- files/GradeCrew_Kollegium_20261028_v3.pptx
- preview/kontaktbogen.png und slide-01.png bis slide-10.png
- folienplan-v2-umgesetzt.md
- build/build.mjs und build/validation-v3.json

PPTX SHA256: 91dcd7c0f8933beaa3a4fa95e8d3c2c4b5d3eee711cc2f26a4d61bccfabf5160, 2963512 Bytes.

## Quellen und Grenzen

Gezielter Quellenbrief vom26.10 auf1951f197 als Funktionsbasis. Frisch gelesener main233656a6 enthält inzwischen öffentlichen Rahmen f048ed1a und197hashverifizierteDateien jeOrigin. Keine Präsentationsaussage hängt von alter öffentlicher Layoutgeometrie ab. Keine Innenscreenshots vorhanden; native erläuternde Beispielabläufe eindeutig gekennzeichnet und keine Original-UI erfunden. Kein Screenshotexport, keine neuen KI-Medien, keine bezahlte Generierung, kein Versand von Feedback oder echten Schülerdaten. Keine Produktcodeänderung, keine GRADECREW_STATE- oder Releaseänderung, keine Integration/Deployment/Geräteabnahme. Interner TestFlightstand ist kein öffentlicher Installationslink. Neue Medienbudgetregel, Drei-Schritt-Dialog und echter Feedback-Screenshot bleiben erst beauftragte Arbeit.

## Prüfungen

@oai/artifact-tool via gebündelter Runtime genutzt, Präsentations-Skill26.1017.22136 samt Style/Implementation/Finalization gelesen. Buildskript früh gespeichert. Cover+2Folien zuerst PNG-exportiert und geprüft. Danach zehn Folien einzeln visuell geprüft und Kontaktbogen erstellt. Paket-, Folienanzahl-, 16:9-, Layout-/Textfit-/Fontprüfungen und erster ArtifactTool-Reimport PASS mit0Findings/0Warnings. Zehn Notizteile vorhanden. Native PowerPoint nicht geöffnet/geprüft. Keine QR-Grafik verwendet. Homepageadresse gradecrew.de auf Cover und Abschluss sichtbar und als externer https://gradecrew.de/-Hyperlink im Paket geprüft. Gezielt nach Rootreview Appzwecke, NeuerTest, optionaleKI-Bilder, Audioauswahl/Anzahl sowie Schülerklickwörter präzisiert.

## Versuchshistorie und Kosten

Sechs lokale Build-/Finalisierungsversuche: erst falsche API-Eigenschaft fontFamily führte zu Aptos statt gewähltemArial, mit dokumentiertem typeface behoben. Zweiter Versuch scheiterte am fehlenden RUNTIME_NODE_MODULES für Reimport-Unterprozess; dritter mit gebündeltem Pfad bestanden. Nach kleiner Inhaltsrunde v2 zuerst vorhandener Receiptpfad zurückgewiesen; danach eigener validation-v3.json und erfolgreiche Finalisierung. Keine bezahlten Jobs, keine Request-ID oder Reservierung neu erzeugt. Modell/Effort requested: vomKoordinator geerbt, actual/Usage/Kosten unknown. Keine Modellwechsel.

## Wiederaufnahme

Kein laufender oder unklarer externer Vorgang. Artefakte lokal vorhanden, Quellen/Plan/Build und Dokumentationscheckpoint im Aufgabenbranch gesichert. Maßgeblich ist der ausgegebene PPTX-Hash. Nächster Schritt: Martin öffnet die PPTX auf dem Präsentationsgerät und geht den Vortrag einmal durch. Keine weitere Freigabeschleife als Voraussetzung für die lokale Lieferung.

Finaler Rootreview: alle zehn sichtbaren Folien und beide Hyperlinks bestätigt. Notiz5 präzisiert: Hörtext ist privat als Text, gesuchte Informationen dürfen im Audio vorkommen. Finaler v3-Export erneut vollständig geprüft. Vorheriger Dokumentationscheckpoint325a86c04d4a03851251ee5b28859b893acaa6e2; finale Sicherung folgt als Nachfolgecommit auf demselben Branch.


## 26.10.2026 — Nutzerüberarbeitung als Basis, Revision v4

Neuer ausdrücklicher Nutzerauftrag: Die von Martin bearbeitete Datei `/Users/martin/Downloads/GradeCrew_Kollegium_20261028_v3.pptx` als Basis verwenden, besonders Folie1 unverändert erhalten. Die übrigen Folien präziser, kürzer und mit tatsächlich neuen Erklärbildern statt Textspalten gestalten. Gleiche Task und gleicher Dokumentationsbranch, keine neue Produktfunktion.

### Quelle und Ausführung

Nutzerdatei: 2.984.620 Bytes, SHA256 `f88723f3e281afad0ec7c018c5e18d48579d6ee44beefb22573459024495e753`, zehnFolien,16:9,Arial. Datei gehasht/inventarisiert und alle zehnQuellfolien frisch gerendert. Nutzerfolie1 wurde zuerst an Root/Artfachagent übermittelt. Die Quelle blieb unverändert.

Ausführender Deckautor kollegium_deck, Artfachagent crew_animation_art, Root koordiniert und prüft. Früh wurden zwei neue Inhaltsfolien mit echten Bildassets gezeigt. Sechs einzelne imagegen-Aufrufe durch den Artfachagent, keine CLI/API-Fallbacks und keine Voice-/Videojobs. Originalcrew und Originalzeichen unverändert. Kosten/Request-IDs nicht ausgewiesen und daher unbekannt. Bestehende Historie und Budgetgrenzen unverändert.

### Konkrete Überarbeitung

Folien2–10 übernehmen dunkelvioletten Grund, Logo-/Titelposition und Bild/Text-Gewichtung der Nutzerfolie1. Je ein großes Erklärmotiv und zwei bis drei knappe Bedienblöcke. Keine Klickwort-Fußzeilen, Beispielablauf-Floskeln oder TestFlight-/Builddetails auf den Folien. Website, GradeCrew App und GradeCrew Secure werden namentlich und nach Rolle erklärt. Wünsche/Umfang stehen vor der Erstellung. Daten-/Zugangsgrenzen und fachliche Quellen bleiben in gut lesbaren Referentennotizen.

Die sechs neuen Motive erklären Gerätezugang, Wasserkreislaufmaterial, Höraufgaben, Schülerdurchführung, Feedback und Ergebnisse. Das Buchmotiv kehrt bewusst bei Erstellen/Material/Prüfen als derselbe Wasserkreislauftest wieder. Die Gerätefamilie zeigt zuerst den Zugang und später das Teilen an diese Geräte. Keine künstlichen Original-Screenshots oder erfundenen konkreten UI-Details. Illustrationen und Originalmedien bleiben eingebettet, Bedienungstext editierbar.

### Finale Dateien und Nachweise

Lokaler Unterordner: `/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/outputs/gradecrew-kollegium-20261028/revision-v4`
- `files/GradeCrew_Kollegium_20261028_v4_final.pptx`
- `preview/kontaktbogen-v4.png`, zehnFinal-PNGs
- `plan-v4.md`, `art/prompts-and-assets.md`
- `build/build-v4.mjs`, `build/graft-cover.py`, `build/finalize-v4.mjs`
- `build/validation-v4-final.json`, `build/cover-preservation.json`, `build/final-checks.json`

Finale PPTX:19.373.690Bytes, SHA256 `1dc4185caccbe9cb3031ce1c7abbf78edb39e33a404bb1146990397e695290c5`.

Paketintegrität, zehnFolien,16:9,Arialfont und Textfit/Layout:PASS,0Findings/0Warnings. Exakte finalePPTX erneut viaArtifactTool importiert und alle zehnFolien gerendert. AlleFolien visuell gelesen. Die24rekursivenQuellabhängigkeiten der Nutzerfolie1 einschließlich Folien-XML, Beziehungen, Originalmedien, Notizen, Layouts, Master und Themes sind im finalen Paket bytegleich erhalten. GerenderteFolie1 ist pixelgleich zur Quelldatei (Diff=null). Die Downloadsdatei ist weiterhin hashgleich. Kein nativer PowerPointtest behauptet.

Lokale v4-Historie: zwei früheVorschaubuilds (ein Textumbruch korrigiert), zweiGesamtbuilds und zweiFinalisierungen. Rootpräzisierungen zu Appnamen und Schrittfolge in letzterRunde umgesetzt. KeineEndlosschleifen, keineBrowser-/CUA-/Screenshotexportdiagnose, keineProduktänderung oder Deploys. Früherev3 bleibt als Historie erhalten.

### Zustand und nächster Schritt

LokalesArtefakt vollständig, Repo-Dokumentation branch_only. Kein CI-/Merge-/Deploy-/Gerätetestwechsel. Keine laufenden oder unklaren Jobs. Nächster Schritt: Martin öffnet `v4_final.pptx` auf seinem Präsentationsgerät und geht den Vortrag einmal durch. Dokumentationsintegration ist keine Voraussetzung für die lokaleNutzung.


## 26.10.2026 — Revision v5 als echtes Screenshot-Tutorial

Nutzerauftrag: aktuelle echte Websitebilder statt dominanter Illustration, rote editierbare Fokusmarkierungen, schrittweise per Mausklick eingeblendete/vergrößerte echte Ausschnitte, echte Appicons und praktische Führung durch Erstellung, Material/Audio, Emmi/Aufgabenbuttons, Schülerbearbeitung und Feedback untenlinks. Gleiche Task/Branch. Keine weitere Bildgenerierung.

### Quellen und Datenschutz

Basis: v4_final, SHA2561dc4185caccbe9cb3031ce1c7abbf78edb39e33a404bb1146990397e695290c5. Öffentlicher Einstieg und leerer Schülerzugang direkt gradecrew.de. Angemeldete Innensichten stammen aus dem tatsächlich genutzten Schul-Live hausaufgabe-staging.web.app,26.10.2026. Separates gradecrew-staging-2026 wurde nicht als Live ausgegeben oder in die finale Anleitung eingebaut. Sichtbarer UI-Footer nennt v2.3.1-gc45-rc1, kein daraus erfundener Commitbeleg.

Capturefachagent tutorial_capture sicherte echte Aufnahmen ohne Testgenerierung/Veröffentlichung/Abgabe. Synthetische Formulare und eindeutig synthetischer beendeter SYSTEMTEST – Audiofreigabe. Die API-Clipannahme zur Headerentfernung erwies sich bei einigen Dateien als falsch. Deckautor/Root erkannten den weiterhin sichtbaren Kontokopf. Daraufhin wurden vor Einbettung die oberen78Pixel tatsächlich aus den Bitmaps entfernt. Vergrößerte Ausschnitte werden ebenfalls physisch als eigene sichere PNGs gespeichert. Private Bereiche nicht nur durch Shapes oder PPTX-Crop verdeckt. Keine Raw-Screenshotdatei im finalen ZIP. Screenshot09 war ungeeignet für Audio und wurde durch physisch headerfreie, tatsächlich geprüfte Aufnahme20 ersetzt. Feedback nutzt18/19 vom schwebenden Knopf, nicht die alternative Footerroute11.

Originalicons durch crew_animation_art aus iOS Asset-Catalog-Ausgaben, beide1024×1024; Secure mit tatsächlichem Schlossbadge. Herkunft/Prüfsummen gesichert. Geräteillustration nur klein bei Apps. Keine neue Bild-/Voice-/Videogenerierung oder bezahlte Jobs für v5.

### Ergebnis

Lokaler Ordner: `/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/outputs/gradecrew-kollegium-20261028/revision-v5`
- files/GradeCrew_Kollegium_20261028_v5_Tutorial.pptx
- preview/kontaktbogen-v5.png und zehnFinal-PNGs
- preview/slide-NN-step-N.png:28 einzelne Klickzustände
- preview/native-final-N-step-N.png:28 echte PowerPoint-Beweisbilder, plus native-frames und native-klicknachweis-v5.png
- build/build-v5.mjs, tutorial-config.json, prepare-captures.py, prepare-focus-crops.py, graft-cover.py, add-timing.py, finalize-v5.mjs
- build/native-appear-timing.xml, native-fade-timing.xml, native-zoom-timing.xml: in PowerPoint selbst erzeugte Timingvorlagen
- build/validation-v5.json, package-and-timing-checks.json, cover-preservation.json, native-powerpoint-qa.json, native-file-integrity.json
- captures/capture-manifest.json, build/safe-captures.json, focus-crops.json, assets/app-icons/source-manifest.md

FinalePPTX:22.220.504Bytes, SHA256 `09e479c12d78d01e15e75bf482d2ab1d60db965a301f38d3ef561d53f4db7d89`.

Zehn Hauptfolien und zehn Notizteile. Folie1 unverändert, Folie2 mit Websiteadresse/Originalicons/Rollen. Folien3–10 enthalten28 native manuelle Klickphasen. Je Phase nur aktueller Fokus: rote editierbare Rahmen und kurze Callouts erscheinen, echter Ausschnitt zoomt ein, vorheriger Fokus verschwindet. Kein automatischer Screenshotfilm. Kleine Elemente maximal3,5fach, ganze Toolbar statt extrem vergrößerter Einzelicons. Emmi, Typ/Punkte, Smiley/Papierkorb, Überarbeiten/Variante und Speichern/Schüleransicht jeweils konkret fokussiert. Keine Modelltrainingszusage.

### Tatsächliche Prüfung

Paket/Layout/Arial/16:9/Folienzahl und ArtifactTool-Reimport PASS,0Findings/0Warnings. Acht animierte Folien,28 mainSeq-Klickphasen,28 Zoom-Effekte. Eindeutige Zeitknoten-IDs, sämtliche Shapeziele vorhanden, keine leere bldLst und keine automatische Folienzeit. Homepagehyperlink auf Folie2 vorhanden. Cover samt24 rekursiven XML-/Medien-/Notiz-/Masterabhängigkeiten bytegleich zur v4, PNGpixelgleich. Alle28 statischen Zustände visuell geprüft, die von Root konkret bemängelten Crops/Toolbarphasen gezielt korrigiert und akzeptiert.

**Echter Native-Test:** zunächst getrennte Probe in Microsoft PowerPoint für Mac. Native Erscheinen/Verblassen/Zoom-Effekte über die Oberfläche erzeugt und deren OOXML als Vorlage extrahiert. Erste zusammengesetzte Probe meldete Inhaltsreparatur wegen leerer optionaler bldLst. Element weggelassen, anschließend Probe ohne Reparatur geöffnet und drei Klickzustände visuell bestätigt. Danach vollständige finaleV5 als bytegleiche QA-Kopie geöffnet: keine Reparaturmeldung, Folien3–10 mit Animation erkannt. In der Referentenansicht alle28 manuellen Klickphasen durchlaufen und jede per echter Appaufnahme gesichert. Repräsentative Endzustände3/4,6/4,8/2,10/4 visuell gelesen. QA-Kopie und finalePPTX nach dem Lauf weiterhin hashgleich. Die unveränderte finale Datei wurde nicht in PowerPoint überschrieben. Native-Testnachweis ist konkret und wird nicht aus XML-Prüfungen allein abgeleitet.

### Grenzen und Versuchshistorie

Kein sicher personenbezugsfreier Ergebnislistenscreenshot verfügbar. Folie9 zeigt deshalb die echten getrennten Ergebnis-/Lösungseinstellungen, keine erfundenen Schülerleistungen. Der abgeschlossene Systemtest wurde nicht erneut veröffentlicht. Teilen mit Code/Link/QR und die Abgabe-/Speicherbestätigung werden knapp erläutert; es wurde keine echte Schülerabgabe erzeugt. Die gezeigte Schüleransicht ist eine echte nicht speichernde Vorschau. Der gezeigte Pfeil ist die Aufgabennavigation und kein Abgabeknopf.

V5-Versuche: erster generischer Bildcrop verzerrte den Detailausschnitt; vor finalem Build vollständig durch physische PNG-Crops ersetzt. Ein privater Kontokopf und falsche Audioaufnahme vor Einbettung erkannt/korrigiert. Erste isolierte Timingprobe reparaturbedürftig, deren Reparatur nicht als Endlösung übernommen; korrigierter Originalbaum und finaler Native-Lauf bestanden. Drei Gesamtbuildrunden für Inhalt/Croppräzisierungen, eine finaleV5-Validierung. Keine Wiederholung von Generierungs-/Deployjobs. Früherev3/v4-Historie, Task und Budget unverändert. Modell/Effort geerbt; tatsächlicheUsage/Kosten unknown, kein Modellwechsel.

### Zustand und nächster Schritt

LokalesArtefakt vollständig und nativ geprüft, Repo-Dokumentation branch_only auf bestehendem docs/teacher-intro-20261028. Kein Produktcode, keine CI-/Merge-/Deploy-/Releaseänderung. Keine laufenden oder unklaren Jobs. Nächster Schritt: Martin nutzt die finaleV5 im Vortrag und klickt die28 Fokusschritte im eigenen Tempo weiter.
