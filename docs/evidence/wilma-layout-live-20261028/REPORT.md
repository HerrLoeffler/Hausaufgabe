# GC-PEDAGOGY-KB-01 · Separater Wilma-Live-Layoutfix · 28.10.2026

Martin meldete erneut Aufgabenbuttons außerhalb der Korrekturkarte. Die vorherige semantische Vorschau war kein Live-Layoutfix. Der konkrete Auftrag erlaubte diese kleine Live-Reparatur separat von Assessment-/Automatikgates.

## Veröffentlicht
Source8188aa050d6bc7c398555f82583991ae1c69d97a, PR385→Integratione4d55fb79e0160580941e52d59b571f0121db194. Identischer geprüfter Baum:6e3a13deef5ce3fa0806803ff408f75d42c3bc65 (lokaler Checkpointf4dbc606 identisch).
Hostinghausaufgabe-staging/989462a70c8f1b03. gradecrew.de und hausaufgabe-staging.web.app je214/214Manifestdateien bytegleich.214andere Hostingdateien samtKonfiguration erhalten.
Geändert ausschließlich wilma-answer-review.css,wilma-answer-review.mjs undrelease.json. Runtimeänderung: Aufgabenleiste/Eltern können schrumpfen; überschüssige Buttons scrollen lokal; ausgewählteAufgabe bleibt nach Render sichtbar, Scrollgruppe ist perTastatur fokussierbar.
KeineScoring-/Speicher-/AI-/API-/Quota-/Functions-/Rules-/IAMänderung. Remy,Upload,Editor,Audiofrage,Tutorial undStagevorschau bleiben bytegleich zum tatsächlichen vorherigenLive. PR383/61a NICHTintegriert; sein spätererMerge muss diesenLayoutfix erhalten.

## Ursache und Reproduktion
TatsächlicheLiveCSS/MJS mitManifest469ec gelesen; alteFlexleiste erlaubte overflow:visible,Buttons hattenflex:1 ohne lokaleGrenze. Screenshot2390px zeigte den spezifischen Fall Panel schmaler alsViewport. KeineCacheursache behauptet.
Lokale echteLive-Komponente mit40fiktivenAufgaben:731pxViewport,4138pxDokument,PanelrechteKante707px. NachFixDokument731px,StriprechteKante695px,gewählteAufgabe40rechteKante693px. Klick sowie Enter aufAufgabe1 undNächsteoffeneAufgabe→40 geprüft. KeinePunkte gespeichert oderProvideranfrage.
NormaleLive-Route in zugänglichenIAB undChrome zeigteLogin; kein positiver authentifizierterLive-Schüler-/Gerätetest behauptet. Dies blockierte nicht den freigegebenenLayoutrelease mit exakten veröffentlichtenBytes und Browsernachweisen.

## Prüfungen
Unabhängiger engerReview:keineP0–P2,8bestehendeModultestsfrischgrün,diffcheckgrün. ExakteCI40781192342 Node22+WebKit/Chromium erfolgreich.
Artifact12857621795 enthält tatsächlich36Browserfälle:2Engines×2Aufgabenanzahlen×9Größen/Zoomfälle. Die frühere geplanteZahl72war einRechenfehler; nicht als ausgeführteTests zählen.
20/40Aufgaben bei320/390/768/1024/1280/1440/1920/2560px sowie200%Zoom;Touchziel≥44px;KlickaufletzteAufgabe sichtbar innerhalbStrip;EnterundNächsteoffeneAufgabe;keinePageerrors.
Besonders breiterDesktop40Aufgaben:1920Viewport,Panel364–1556,Strip377–1543;2560Viewport,Panel684–1876,Strip697–1863. DokumentbreitejeweilsViewport,Stripoverflowauto,alleTabszugänglich. BeideEngines identisch.
Build214Dateien ausunverändertemdetachedReleasecheckout8188;Manifestdeltaexaktnur2Runtime-Dateien. Hostingfrischgeklont undvorStart/Promotion gegenparallelenReleaseverglichen;keinblinderFullrestore.

## Grenzen und Fortsetzung
Physisches iPad und Martins konkreteangemeldeteKorrekturansicht bleiben menschlicheNachkontrolle;kein99%-Qualitätsversprechen. BreiteLayoutregressionisttechnischbelegtundaufbeidenLiveoriginsveröffentlicht.
SemantischeStagingvorschau61a,APIbudget6/7 undgetrennterOriginplanunverändert. KeineautomatischePrüfungechterAntwortenfreigeschaltet.
NächsterSchritt: Martin lädt die normaleKorrekturseiteeinmalneu;beiweitererAbweichungkonkreteOrigin/Viewportprüfen. SpäterePromoterbewahren2geänderteWilma-Dateien.
