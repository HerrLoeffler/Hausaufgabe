# Browserbeleg 852c45d83b7884b9f51fc45bfbdc4b936560ba34

2026-10-14, CUA IAB eigener Tab1, localhost8785/fixture, readonlySnapshot /private/tmp/gc-wissensreise-qa-852c45d. DOM/core/service echt; sources, ownerAuth, clockoffsetHelper und generateBatch ausschließlich synthetisch. Kein Firebase, Provider, SavedRealTeacherTest oder physisches Touchgerät geprüft. Scriptführung über unterstützte CUA/Playwright APIs. Kein Runtimecode verändert, keine eigene Generierung/Providerprobe.

## Beobachtungen

- Testwahl zuerst, Dropdown mitMATH2/WORD2/GENERIC2/GAP2. Kein festes Startthema; Remylink vorhanden (realRemyroute in dieserFixture nicht überprüft).
- MATH2: zweiQuellfragen2+3 und3*4,120s gewählt,12synthetischePreparedVarianten erzeugt und alle14Previewlösungen gesichtet. Rechte/Inhaltschecks, Freigabelink und sichtbarerQR, danach Runde.
- Reale120s ab Start2:00 bis0:00 ohne QA-Uhrbutton oder Clockmocknutzung. Vier korrekt beantwortete Aufgaben:11+12=23, parametrische8+2=10,5+6=11,8+9=17. Mehr als2Antworten; nichtbeiSourcecount beendet. Endekarte bei0:00, Antwort/Next/Hilfe disabled.
- Refresh bei1:00 führt zu derselben8+9-Aufgabe mitverbliebenerZeit. FixturePause führt zurTeacherseite, Freigabelink danach richtigeAufgabe/0:34. Wallclock läuft währendExit weiter. DieseFixtureonExit ist anders als productionbootstrap und deshalb kein Produktionsbeleg fürExit.
- Feedbackdialog fokussiertTextbox, Escape beendetDialog und fokussiertFeedbackbutton, Next/Antwortspielen danach möglich. KeinFeedbackversand/Export ausgelöst.
- HilfeersteKlick zeigte generischenHinweis und direktLösung17. NachRefresh wirdhelpTextnichtwiederangezeigt. Gestufte fachlicheHilfen dadurch noch nicht nachgewiesen.
- WORD2:12Mockvarianten erstellt, sourceMatching + neueWortarten/Satzglieder vorhanden. NeueWortartenApfel/Nomen, schreiben/Verb, laut/Adjektiv sowie SatzgliederDieKatze9/Subjekt, sitzt/Prädikat, aufdemStuhl/Adverbiale per nativeSelectbuchstaben+Enter korrektgelöst. KeineDragpflicht. NummerierteKatze ist ausdrücklichFixtureinhalt, keineProviderqualität.
- GENERIC2: eigenesAstronomiethema; sourceMarsfrage+MerkurVenusErde, MockvarianteVenusfrage+MarsJupiterSaturn. RadioVenus perSpace und OrderingPositionen per m/j/s+Enter korrektgelöst. Keine fachfremdeMathe/Deutschersetzung.
- GAP2: freiesLernen; neueLückeDerHund___vordemHaus mitbellt perKeyboard+Enter korrektgelöst. AutomatischerMockrefill durchvorhandeneOptinCheckbox beobachtet.
- 390x740Viewport: measuredinnerWidth390,bodyWidth390,scrollWidth390, Buttons46/70pxhigh,16pxfont, heading26/24px. Screenshotsgesichert; keinephysicaliPad/Touchbehauptung. ViewportresetnachPrüfung.
- TabDevLogs error/warn=[] nachMathrunde+Orderingprobe. KeineConsoleerror/warn inbeobachteterAbdeckung, keinallBrowser-/Netzwerkbeleg.

## Befunde/offen

1. Timerende: TextbehauptetNeueRunde/freiweiterlernen, UIbietetkeineentsprechendeAction, nurPause/Feedback. RefreshsameLinkbleibtexpired. Implementer+Rootinformiert; nextSHAfixprüfen.
2. Markierungenim852Picker/Fixturefehlen, keineBrowserabnahme. nextcandidateMARKfixture/conversionangefordert.
3. Guidedmodus/gestufteHilfen, Versionswechsel, doubleanswer, devreset und realSavedTeacherTest/Auth nichtabgenommen. SeparateCodeprüfung beiwissensreise_review; keineFullPASS.

## Screenshotdateien

- math2-real120-timeout-390.jpg
- word2-keyboard-390.jpg
- generic2-keyboard-ordering-390.jpg
- gap2-keyboard-390.jpg
- ordering-preanswer-852c45d.jpg (IABAX ersteZwischendarstellungzeigteleereMenüs; anschließendDOMSnapshot+AXvollständigbelegtenkorrektePositionen/Options, keinbestätigterProduktbefund)

Genau nächster Schritt: immutable nachgebesserterKandidat fürRestart/Guided/Outputconversion/MarkierungempfangenundgeändertenScopeprüfen. Bisherige120s/Cancel/Mobilebelege bleibenan852gebunden, nichtautomatischanneuenSHAübertragen.
