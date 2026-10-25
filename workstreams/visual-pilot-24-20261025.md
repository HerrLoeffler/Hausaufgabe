# GC-EXTENDED-QUESTION-TYPES-01: Pilot24

Stand25.10.2026; aktiver Fachchat erweiterteAufgabentypen. Nutzerauftrag:24fächerübergreifendeProbetests Klassen5–10, nur neuevisuelleFormate, Fehlerdirektverbessern, allesdokumentieren, ausschließlichTestseite. Keyreuse ausdrücklichbestätigt.

Branch test/visual-24-pilot-20261025 auf feature/visual-prototype-ai-02-20261021; bisherigePR265/271/285 undVersuchshistoriebleibenerhalten. EigenerCheckoutwork/json-editor-clean, fremderIssue255Checkoutreadonly. Plan docs/superpowers/plans/2026-10-25-visual-pilot-24.md.

Status gestartet; 0/24neueGenerierungen. Keine neueProduktabnahme/CI-/Geräte-/Releasebehauptung. BekannteJSON-UI-FolgekorrekturPR271 separat. MainRegeln/STATE/TODO/READMEundRecoveryfrischgelesen. ShellDevelopmentauditaufFeaturebranchfehlteScript; RemotePRÜberschneidungsabgleichgelesen, keinezweitevisuelleImplementierung. Nutzungderbestehendenpräfigiertenvisual255Endpunkte imProjektgradecrew-staging-2026, eigenes synthetischesKonto. Keine unklarenPilotrequests bisher. Budget:24logischeErstellungen, interneProvider-/Reparaturaufrufe separatprotokollieren; Geldbetragunbekannt.

NächsterSchritt: sichereAnmeldungdesbestehendenTestkontosundwiederaufnehmbarenRunnerqualifizieren. Ergebnisse/Aktionen vorlängerenWartephasenindenBelegdateiensichern. Modell/Effortactualunknown, keinWechselbehauptet.

## Checkpoint 25.10.2026 — erste5Tests

5/24Erstellungenbereit (40Aufgaben), P06läuft; weitereAufträge sequenziell über tools/visual-pilot/run.cjs. FesteRequestIDs, atomareRunbelege, keinblindesWiederholen. EigenerlokalerServer8897 (Session64316), RunnerSession9514. Port8796fremdbelegtundnichtverändert. Serverzweck: LehrkraftPrüfansicht mit eingebautenLösungen, keine sichereSchülerabgabe.

97deterministischeChecksfürerste16Aufgaben, anschließend243für40Aufgaben, allebestanden. DieseprüfennichtdieFachrichtigkeitderKI-Schlüssel! EigenevollständigeLektüre P01–P05: P03Q4falsches y(5)=15 statt18, P04Q7LiniendiagrammauftragbeiSäulenrenderer, P05Q8Großschreibungsfehlerdurchcasefold; außerdemP05Q6alternativeBegriffeundP04Funktionsanforderungverbessert. Originaleunter*-quiz.jsonerhalten, Änderungenunter*-reviewed.jsonundcontent-corrections.cjs. Online-Rückschreibung/Backendbereitstellungnochoffen.

Casefix: optionalerBoolean spec.caseSensitive nurfürcorrection. Falschklein bekommt1/2 (richtigeZeile, falscheKorrektur), richtiggroß2/2. ZweiRegressionenzunächstrot (fehlenderVertrag), danach25/25relevanteTestsgrün mit vorhandenenAbhängigkeiten viaNODE_PATH. Browser P01beliebige4/10Felder2/2; P05Q8junge1/2,Junge2/2 tatsächlichbedient. Screenshot outputs/visual-pilot-case-fix-20261025.png. KeinphysischerTouchbeleg. Generatorprompthinweisergänzt, lokalerFixnichtalsdeployedbehaupten.

NächsterSchritt: restlicheAufträgebeobachten, eigeneEntwürfefachlichlesen/korrigieren; danach TestbackendundnurzugehörigeVorschaubereitstellungmitScopeprüfung, eigeneServerabgabenundabschließendenReviewbelegen. Kosten/UsageausserverseitigenEreignissenspätergezieltfürdieseseigenenRequestslesen.
