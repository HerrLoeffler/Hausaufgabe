# GC-WEB-REPAIR-20261007 / GC-AUDIO-01 — compact creation correction

**Current status: scoped Hosting production release cedbcef0; actual user/device acceptance pending. Historical failed/pending checkpoints below are superseded by the verified final record.**

User27Oct explicitly corrects previous vertical five-section release: one compact screen; four areas1Angaben2Material3Bilder4Audio read left→right, finalCreate bottomright; optional disclosures. Audio labels short, visualpreview onlyhover/tap/keyboard. This supersedes old vertical-form design decision. Existingfive audio/image limits,backend/sourcecontract and all data/guards retained. Hosting-only on authorized gradecrew.de/hausaufgabe-staging, no backend/Rules/40294/2026/Wilma.

Base freshsource/Live4b73e8b, main2c0f434; original WIP/commits retained. Use existing card/palette/Inter/44px targets; no redesign/newdependency. Desktopfourcolumns, compact settings and optionaladvanced details, finalrowrightbutton; narrower screens four selectable headings sharing one contentarea, persistentbottomaction. Panels may scroll internally only when content/zoom/keyboard cannot fit; never conceal requiredfields or errors. Header/footer measured tofit actualviewport, no overflow:hidden ondocument. Hover examples use nativepopover with focus/touch/Escape fallback and boundedposition.

Plan:1 regressionRED(no pageoverflow desktop1024×768/1366×768, finalbuttonvisible, hover/tap/Escape examples)→2 narrowHTML/CSS/controllers→3 fullWeb+responsiveChromium/WebKit+independentreview→4 exactCI/preview/lease/HostingLive/receipt. SameTask, nopaidproviders. First implementation inline using existingfrontend-design/brainstorming clear-request path; no new productdecision approval needed.

Checkpoint: compactpanels/audioinfo implemented, new2structuralregressionsRED→GREEN; realcontrollerfallback testfound stalehoverpin afterEscape, corrected.651fullWeb/UI tests pass. Browser41/42 currentlygreen; one transientChromium390×844 resize has15pxpageoverflow, explicitlynotreleasedyet. Bothdesktop1024×768/1366×768 corepanels/CTA nowfitwithoutinnerscroll, mobile42caseverification inprogress. Existingeditorfixturemovedfromcreationviewtoactualeditorviewsofixedcreationheightdoesnotartificiallyoverlapitsbuttons. No productbackendchanges. Newwork preservedbeforelongerdiagnosis; next resolveexactfitmeasurement thenindependentreview/CI/Hostingonly.

Final correction: viewport allocation now uses scoped CSSgrid instead of movingdocument-offset measurements, removing transient15pxChromiumoverflow. Fourpanels left→right at1024×768 and1366×768 includeallnormalfields withnositeorinitialpanelscroll. Narrowlayout usesfourselectableheadings andsharedcontentbody; footeractionalwaysvisible.44pxinfobuttons, nativepopover+fallback,hover/clickpin/touch/Enter/Escape/outsidefocusdismiss; valuesretained acrosssections. Uploadinput is accessible transparentoverlay inlabelleddropzone; filepipelineunchanged. Legal/feedbackfootercontrols retained incompactrow. Optionaladvanced/longuploadedfilelist or veryshortkeyboard/zoom mayneedinternalcontentscroll, notclippedfields.651Webtests pass;42Chromium/WebKit checks cover22viewports+150%text+touch/keyboard. Fullindependentreviewnext; stillnotdeployedthiscorrection. No backendchanges.

Independentimmutable review326998a2 found3P2: actualtwo-rowlanguage/accountheaderoverlap390px; ENlabelsoversizedbylateloadeddesign-system; realauthenticated320×568panelcollapsed24px. ReproducedREDwithactuali18n+syntheticauthDOM, fixed inonepass: rootgridheaderautoheight, strengthenednarrowtypography, >=120pxusablepanel andstickyCreate/outer-scrollfallbackonlyveryshortheights(<650px), includingvisualviewportflag. Allnormaldesktop/tablet/390×844staynositescroll. Userinstructiondoesnotjustifyunreachablefields; explicitveryshort/keyboard/zoomfallbackretainsaccess. Actualdefaultpointshintinitializedinbrowser; normalnonerrorpointstipcollapsed,errorremainsvisible. Authfixtureoriginallyretainedunrelated3studentcardsincreationarea; isolatedproperlyratherthanweakeningnormalviewportchecks.44actualChromium/WebKitchecksnowPASS,651Web/UI PASS; no paid/physicaltest. Nonblockingreviewobservation: validationmessageexplainsissueinfooterbutdoesnotautomaticallyswitchhiddennarrowpanels; existingmanualheadingsremainavailable, deferredwithincurrentlayoutscope. Nofurtherfeaturework. HostingonlynextafterexactCI.

ExactCI9aca6b05 run40563496072/browser122398475761 FAILED WebKitLinux afterresize (oldheight844/1133 retained whileactual768/820). Originalfailurepreserved; noblindretry, noLive. Newregression ordinarylayoutmustuse100dvh notcachedpixelheight RED→GREEN; defaultCSSviewport nowindependentoflateJSresizeevents. Onlyfocusededitablefield+largevisualviewportshrinkusesboundedkeyboardheightoverride. RerunfullWeb+44browser andnewimmutableCI required. Preview009182360790ce9f isoldcandidate, notLive.

FurtherexactCIe418551 run40564066273/browser122400492844 stillFAILEDsameviewportcases; originalpreserved. Downloadedofficialartifact12762262928: atreported1366×768 CSSmainpaddingremainedmobile8px12px/body989px (prior1133height), provingtheheadlessdriverhadnotappliednewCSSviewportyet. TestreadinessnowwaitsforexactnativeCSSwidth+heightmediaqueriesandexpectedpaneldisplaymodebeforerunningunchangedoverflow/CTAassertions. Thiswaitdoesnotpollforpassingtestresults,noskip/noblindretry. Productsourcee418551 unchangedbythisfixturecorrection; newexactCI required.

ThirdCIc172187 run40564681311/browser122402660959 retainedsameLinuxWebKitfailuredespiteCSSviewportqueryack. Thusfixturewaitalonewasnotafix. Evidencepointsatstalerelationalbody:has viewportstyling (regularpaneldisplayupdates,body/shellheight/paddingstaysold). NewexplicitgcAiCompactrouteclass replacesallnewbody:hasrules, sets/removeswithactualviewvisibility; defaultheightCSS100dvhretained. RouteactivationregressionRED→GREEN plusdeparture-restorestest. NoPublicEntryhasselectorschanged. NewCIrequired, noLiveuntilgatesgreen.

CI678a0f8 run40565296627/browser122404810412 stillFAILEDtwoWebKitLinuxwarmresizecases. Explicitrouteclassaloneinsufficient; attemptpreserved. Finalfitnowusescurrentwindow.innerHeight directlyonnativeresizeandrootResizeObserver (visualheightonlyforfocusedkeyboard), sofrontenddoesnotdependoncachedWebKitviewportunits/compositorframes. Regressionlaggingvisualheight1133/currentwindow844→768 firstREDthenGREEN. CSS fallback100dvhremainsbeforeJS; rootCSSmediaackinfixturesretained. NewexactCI required. Noattemptskiporprovidercharge.

CI85e651f run40565986793/browser122407241042 retainedsameLinuxWebKitfailure. Productresizeobserveraloneinsufficientinthehot-resizefixture. FinalfixtureacknowledgesanactualrasterframeaftersetViewportSize: screenshotPNGwidth/heightmustmatchrequestedviewportBEFOREunchangednativeCSS/query/overflowassertions. Thisforcesobservingapaintedbrowserframe, notpollingforpassingapplicationconditions. Failurediagnosticsnowincludeactualbodyheight/variable/class. Productruntimeunchanged85e651f; finalexactCIwillqualifythisharnesscorrection. Allpriorattemptsretained,noautopaidretry.

SixthCI1f0b761 run40566522830/browser122409139261 FAILED; extendeddiagnosticshowedbodyvariable820px/768pxcorrectwhilecomputedbodyheight1133px. Thisnarrowsfailuretoboxsizing/minconstraintsratherthanmerelymissingresizeevent. Explicitnormalmin-height0/max-heightcurrentviewport plusstatecontrolledshortfallbackreplacesheightmedia-onlyminimum. Shortfallbackstate568→844regressionRED→GREEN. BrowserreadinessalsoacknowledgesprocessedcurrentheightCSSvariablebeforeunchangedlayoutassertions, bounded8seconds. Allsixfailedsourcesretained. NewexactCIrequired; stillnoLivecorrection.

## Final release evidence

{
  "commit": "cedbcef012404694f1f2cbd566680f8e928c8d71",
  "tree": "52d8c9a3c339b0e8a45113769cfc513b150686ec",
  "ci": {
    "run": 40567247184,
    "conclusion": "success",
    "local_web_checks": 654,
    "synthetic_browser_checks": 44,
    "engines": [
      "Chromium",
      "WebKit"
    ]
  },
  "hosting": {
    "project": "hausaufgabe-staging",
    "version": "ca7e0f2779f56617",
    "release_time": "2026-10-27T19:18:10.551Z",
    "origins": [
      {
        "origin": "https://gradecrew.de",
        "commit": "cedbcef012404694f1f2cbd566680f8e928c8d71",
        "files": 206,
        "verified": 206,
        "failed": []
      },
      {
        "origin": "https://hausaufgabe-staging.web.app",
        "commit": "cedbcef012404694f1f2cbd566680f8e928c8d71",
        "files": 206,
        "verified": 206,
        "failed": []
      }
    ]
  },
  "backend": {
    "changed": false,
    "before_after_metadata_equal": true,
    "functions_count": 61
  }
}

Existing5er/operatorlimits, accounts, savedtests, sourcecontracts, gradedattempts and backend retained. No40294/canonical2026/Wilma changes. Narrowshort-heightfallback may scroll while stickyCreate and usablefields remain; no promise of fitting every enlargedtext/keyboard combination. Nonblocking deferred issue: footer validation explains error but does not auto-switch hidden narrowpanels. Physicallaptop/iPad/phone and actualteacheracceptance pending; no paidprovider probe.

## Folgeidee 29.10.2026: Remy-Material und Lernziele

Task-ID bleibt GC-WEB-REPAIR-20261007. Martins neuer reiner Planungsauftrag betrifft zwei kurze Hilfetexte im vorhandenen Formular, damit Lehrkräfte Material und konkrete Lernziele als zusammengehörige Hilfen verstehen. [Konkreter Vergleich, empfohlener Wortlaut, Fälle und Umsetzungs-/Abnahmeplan](remy-test-creation-guidance-20261029.md). **Idee/Plan; keine UI-Implementierung, keine KI-Probe und kein Deploy.** Zuständig bleibt der Remy-Testerstellungs-/Präzise-Vorgaben-Fachchat; die vorhandene Editorarbeit und aktuellen Live-Änderungen sind vor späterer Umsetzung frisch abzugleichen. Nächster Schritt: Martin prüft den vorgeschlagenen Wortlaut und die Inline-Variante.
