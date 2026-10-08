# Messbecher, Fuchs und Steuerung

Task GC-GAMES-ESCAPE-VISUAL-01, bestehender Unreal-Prototyp und Draft-PR175. Martins neue Nutzerrückmeldung bestätigt die frühe Aufgabenführung und die3/10-Probe. Darauf baut diese Erweiterung auf.

## Direkt testen

Alte Spielsitzung schließen und Lerninsel starten.command erneut öffnen. Im Pausenmenü (Esc) stehen Mausgeschwindigkeit und – nach gelöstem Satzrätsel – Fuchsaktion erneut ansehen. Die Wiederholung führt vor die Szene und bewahrt Antworten, Mengen und Fortschrittsflags. Erstmals erwacht der Fuchs, wenn der Satz aus den vier vorhandenen Teilen richtig gelegt und geprüft wird.

Die Figur im Spiel besteht aus beweglichen, prozeduralen3D-Teilen; sie ist einfacher als die Konzeptkunst. Es gibt jetzt eine echte Ereignisfolge und keine behauptete fertigeFilm-/SkeletalMesh-Qualität. Die Bilder unten sind Bauvorlagen, keine Spielscreenshots. Tatsächliche Spielaufnahmen stehen in games/lerninsel-unreal/Reports/Fox-*.png.

## Wasseraufgabe hinter der3/10-Probe

Erste Aufgabe unverändert:1-Liter-Messbecher auf3/10=300ml füllen und aufdiePlatte stellen. Danach denselben Becher vonderPlatte wiederaufnehmen. DieersteTür bleibt gelöst. An der nächsten Station füllen zwei Hähne100ml=1/10Loder200ml=1/5L; am Ablauf nimmt man100mlzurück. Die Kanne fasst1000ml. Ein200ml-Hubbei900mlwirdabgelehnt, nichtheimlichauf100mlgekürzt.

Der Auftrag nennt die Handlung und zeigt Restmenge/Milliliter. Aus300mlwerden1000ml:700mlergänzen, etwa3×200ml+100ml. Der volleBecher wird ins1-Liter-Zielbecken gegossen. Bei wenigerWasser bleibt alles unverändert und die Fehlmenge wird genannt. BeimErfolg wird dieselbeKanneleer, dasBeckenfülltsich2s und danachdarfdasTor1,4söffnen. Der alte gezeichnete Ast ist keine Pflichtbedienung mehr; zwei sichtbare Zulaufäste bilden den neuen Wasserplatz.

Hübe brauchen0,6s und räumlicheNähe. DoppelklickwährendHubzählteinmal. Pause, Fokusverlust oderWeggehenbrechennichtbestätigtePortionenab. LI3speichertdenneuenPournachweis;LI1/LI2werdenweitergelesen und altegelösteAstaufgabenbleibenFortschritt. Es wirdkeinweitererMessbechererzeugt.

## Fuchsablauf

0–1,6s: GraueSteinfarbeweichtwarmemFuchsorange/cremefarbenemMaul, Augengehenauf.1,6–2,4s:AufstehenundDrehen.2,4–6,4s:LaufaufeinemfestenlinkenWegzumTor, Pfotenbewegenabwechselnd.6,4–7,4s:SchlaufeamMaulgreifen.7,4–8,4s:Rückwärtsschritte,Riegel50cmherausziehen.8,4–9,8s:Toröffnet, FuchsweichtnebendenDurchgang.9,8–10,6s:WeichesHinsetzen. DanachSchwanz-/Ohrenbewegung,leichteAtmungundBlinzeln.

Der richtige Satz schließt die Aufgabenoberfläche; der Blick zeigt zunächst zumFuchs. FreieSteuerungbleibt. FalscherSatzlässtFuchs/Torunverändert. DerfesteTorblockerbleibtbiszurvollständigenÖffnung. PausefriertdieganzeFolgeein. ReplayversetztbewusstvorherzurSzene, setztderenTimer/Torwinkelzurück undbewahrtLernfortschritt. EinReloadnachgelöstemSatzzeigtlebendenFuchsinEndpose. DieBewegungistkeinNavMesh-/physikalischerSeilsimulator;esisteineimplementierteAnimatorkette.

## Steuerung

420cm/sstatt230cm/s. Mausslider25–300Prozent,Standard100Prozent;zusätzlichLangsamer/Standard/Schneller. BeideBlickachsenskalierengleich. EinstellungenliegengetrenntvomSpielstand. DerReglerspeichertbeimLoslassen;Tastensofort. Tastatur-/TouchbewegungbleibenvoneigenenEingaberegelngesteuert.

## Bildtafeln:120Studien

![Figur und Materialien](01-figur.png)
![Erwachen](02-erwachen.png)
![Laufzyklus](03-laufzyklus.png)
![Seilschlaufe und Tor](04-seil-und-tor.png)
![Platzierung im Satzgarten](05-satzgarten-layout.png)
![Spielfolge](06-spielfolge.png)

Sechseingebauteimage_gen-Aufrufe,jeder20nummerierteStudien. Bishergesamt26Aufrufe und385Konzeptmotive; keine120fertigen3DAssets. Original-PNGs undPrompts in generierung.json. Frühere280-Seiten-Bauatlasproduktionbleibterhalten;dieserNachtragistseparat. KeineCloudGPU/Assetsgekauft,keinexternesAPI-KeyVerfahren,keineWiederholungalterGenerierungen.

### Verbindliche Abweichungen der generierten Vorlagen

Tafel5zeigtteilsStein-undlebendenFuchsgleichzeitig;imSpielexistiertnurderselbeActor. Tafel6verändertdieSatzteilezuDer/Fuchs/öffnet/dasTor;imSpielbleibenheute/öffnet/derFuchs/denEingang undalle6gültigenV2-Satzfolgen. LeuchtendeRisse/PartikelsindkeinimplementierterEffekt. Farbübergang,beweglichePoseundRiegelursachesindgebaut. DergezeichneteRiegelinderTafelistnichtalsphysikalischsimulierterSeilzugimportiert. DieUI-AuswahlbleibteineganzegefärbteFlächeohneHäkchen.

## Prüfnachweis und nächsteAbnahme

ReineChecksundNativePlaytestsmitRegler/Capture/SaveLoad,gleicherBecheridentität,Aus-/Einfüllung,Kapasität,PauseundFuchsszene. DerersteoffeneGate-SweepstarteteimBoden:HitActor_0/Floor,NormalZ1,StartPenetrating. Gegenprobe90cmStandhöhewarfrei;Testposekorrigiert,Spieltorhattenichtblockiert. RoteBerichtebleibengesichert.

LetztergesamterLaufvorSchlussreview2026.10.08-16.38.52UTC:195portableChecks(64+88+7+24+12),4UE-Tests,0Fehler/6Epicidevice-Umgebungswarnungen. NativeWidget-EvidenzistkeineechteOS-/Kinder-/iPadabnahme. AbschließenderReviewundfinalerReportwerdeninProduction/WATER-FOX-REVIEW.mddokumentiert. NächsterSchritt:MartinprüfttatsächlicheAnimation unddie1000-ml-Aufgabe imaktualisiertenPrototypen. Browser/iPad/volleachtGebiete/Audio bleibengetrenntoffen.
