# GC-WEB-REPAIR-20261007 — Coco Login-Vorlagen

Auftrag 09.10.2026: zuerst 20–30 Vorlagen. Coco soll sich sichtbar über die obere rechte Login-Kartenkante lehnen; roter Herzluftballon vollständig sichtbar, Schrift exakt „Schön, dass du da bist!“. Identität/Plüschoptik aus Nutzerreferenz erhalten. Keine neuen Figuren.

20 nummerierte Varianten in einer 5×4-Übersicht mit eingebauter Bildgenerierung erstellt und visuell geprüft: Ballons vollständig, Schrift vorhanden, Flügel überwiegend auf oberer Kante. Variante9 als ruhige freundliche Richtung empfohlen; 2/14 mit Zwinkern. Einige Varianten winken statt mit beiden Flügeln Kontakt zu halten; endgültige Pose ist noch zu wählen. Lokale Vorlagen: `output/coco-login-20261009/coco-kartenkante-20-vorlagen.png` im ChatGPT-Projektworkspace; Original unter Codex generated_images erhalten. Eine Übersicht/Bildaufruf, 20 Poseentwürfe; keine20fertigenEinzelassets/Animationsframes behauptet.

Status: Designentwürfe lokal gespeichert, Textübergabe auf main. Kein Produktcode geändert, keine Integration/CI/Deploy/Production. Aktuellen main START_HERE/AGENTS/State/TODO/Contract und DevelopmentStatus37949273802 gelesen; bestehende lokale Designarbeit bleibt erhalten. Nächster Schritt: eine Nummer wählen, daraus transparentes Einzelasset erzeugen und kontrolliert in rechter oberer Ecke platzieren, ohne Ballonbeschneidung.

Promptkern: gleicher navy/ivory Coco, orange Schnabel/Füße; echter Kontakt zur weißen abgerundeten oberen rechten Kartenkante, Körper hinter Karte und Kopf/Brust nach vorne; vollständig sichtbarer roter Herzballon mit exaktem deutschen Text, großzügige Ränder,20nummerierte unterschiedliche Posen.


Martin wählt17. TransparentesEinzelasset mitgeschlossenenAugen,rotemvollständigemHerzballon undexaktemText erzeugt (`assets/gradecrew/coco-login-heart-17.png`). Lokal in `gradecrew-web-repair-integration` eingebaut; alteOverlay-Schriftentfernt, Kantenkontaktz-index3/statischePose,150pxobererFreiraum stattnegativem190pxVersatz,kleineBildschirme ohneDeko/Reserve,Cacheversionenaktualisiert. JS-Syntax bestanden; lokaleDateien undAssetHTTP200. WiederaufnehmbareDateikopie unter `output/coco-login-20261009/selected-17`. Browser-LivebildnachReloadnichtbestätigt: InAppTimeout undneuerChrome-Tab wegeninaktiverExtensionverweigert; vorhandenesLoginformularenthältEingaben, nichtverworfen. NochkeinDeploy/CI/Integration. NächsterSchritt NutzerlädtlokaleSeite neu; Kartenkante/Ballonvisuellbestätigen undgegebenenfallsminimalnachjustieren. OriginalDesignarbeit erhalten.


Nutzer-Screenshot zeigt17seitlichzuweitüberKartenkante. EngbegrenzterlokalerCSS-Fix:right−100px→−32px,68pxnachlinks; KörperliegtinnerhalbKarte,nurBandendeübersteht. CacheCSSv3/startupgc28-coco17-left. StartupSyntaxbestanden; NutzerscreenshotalsAusgangsbeleg,erneutevisuelleAbnahmeoffen. KeineBildneugeneration/Deploy.


FolgefehlerDashboardscroll: html:has(#authView .gcEntryAuth:not(.hidden)) reagierteauchaufLogininnerhalbverstecktemauthView. AlleachtbetroffenenLogin-Layoutselektorenbeschränktauf #authView:not(.hidden). LokalCSSv4/startupgc28-coco17-scrollfix. EchterBrowsernachReload/Anmeldung:authHidden=true,dashboardVisible=true,htmlOverflowY=visible,Scrollhöhe3806/Viewport958; realerScroll vonobenauf958px. UrsachewarfehlendeÜberprüfungLogin→DashboardbeimLoginlayout. Syntaxbestanden,keinStagingdeploy. NächsterSchrittNutzerreloadimoffenenTab.
