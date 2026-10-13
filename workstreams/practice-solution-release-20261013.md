# GC-WEB-REPAIR-20261007 · Übungs-Lösungsfreigabe umsetzen

Verantwortlich practice_solution_release (Fachagent), Zentrale koordiniert. Related GC-SECURITY-02. Originaltask/Budget/Versuche erhalten; keine neue Reservierung. Angefordert Sol/high wegen serverseitiger Berechtigung und unveränderlicher Lösungssnapshots; tatsächliche Runtime/Usage unknown. Nutzer autorisierte Umsetzung und kanonisches Staging am 13.10.2026; dieser Autor merged/deployt nicht.

## Geprüfte Basis und Design
Source feature/gradecrew-app-integration@44ab6540a9ac0cd4a144dd25eb84a7198d22498b, main a0f16f9cf64c74dcdacefa489d2e7a1da1b58881; Development Status38366609502 success. Kanonisch gc38/164, kein neuer Deploy. Eigener Checkout /private/tmp/gc-practice-solution-release-20261013, Branch feature/practice-solution-release-20261013. PR229 ist nur Kommentararbeit, PR228 bleibt Generatorarbeit; keine Übernahme alter PR146-Startlogik.

Bestehende Notes SR01–04 bestimmen das Verhalten. Expliziter Modus practice_after_submit, unabhängig resultMode. Berechtigtes Owner/Admin-Callable bestätigt/ veröffentlicht eine serverberechnete Revision in privatem assessmentPolicies-Dokument. Draftflag allein reicht nicht. Zwei UI-Publishwege und Wiederöffnen nutzen denselben bestätigten Vertrag. Änderungen zwischen Hinweis und Veröffentlichung invalidieren die Revision. Examdefault bleibt der alte Ende-/90s-Gate.

Start friert Policy, Revision und private Lösungen samt passenden Audioassets ein, auch bei resultMode none. Nach Abgabe kann allein der eigene Token serverseitig Lösungen erhalten. Spätere Freigabe ist nur für bereits ausdrücklich als Übung veröffentlichte Revision möglich und nutzt deren gespeicherten Attempt-Snapshot; kein Umdeuten laufender Prüfungen und kein Nachladen neuer Schlüssel. Hold/Delete bleiben sperrend. Keine KI/Providercalls oder neue Pollingintervalle.

## Planung / Ausführung
- [x] RED: synthetische echte Handlerfälle für unmittelbare Übung/none, fehlende Bestätigung, falsche Rolle/Token, keine Abgabe, Hold/Delete, veraltete Revision, spätere Freigabe und Audio-/Keyänderung.
- [x] GREEN: enges Teacher-Callable und private Policy/Attemptrevision in secure-lifecycle; bisherige Prüfungsgrenzen unverändert.
- [x] RED/GREEN: beide UI-Publishpfade, Editorpolicy und klarer Schüler-Serverzustand; Buildmanifest neues UI-Modul erhalten.
- [ ] Ganze betroffene Testsuiten/Syntax/Build, unabhängiger exakter Kandidatenreview, DraftPR und Handoff sichern.

Skills using-superpowers(Subagent-Ausnahme), brainstorming, writing-plans, using-git-worktrees, TDD+writing-good-tests, systematic-debugging, executing-plans, verification-before-completion tatsächlich gelesen. Vollständiger autorisierter SR01–04-Auftrag legt Design und Ausführung fest; kein erneuter identischer Approvalflow. Erste30 vorhandene fokussierte Tests auf unveränderter Basis bestanden. NativeWorktree auf Projektmirror ohne .git ungeeignet; eigener getrennter Gitclone. Bootautor besitzt nur index authView-Hunk; app/settings/pub-Hunks abgestimmt. Main-Doku zunächst soleOwner Bootautor.

## Assurance im Scope
SEC04/06/07/08/14/17: private Policy, TeacherOwner/Admin und Attempttoken; synthetische negative Handlerfälle plus unabhängiger Review vorgesehen. SEC11: bestehende Startquota unverändert und Regressionen. PRIV07: nur private technische Revision+Solutiondaten, keine neuen Schüleridentitäten; PRIV13: zugänglicher Dialog/Buttons; PRIV17: keine neue Rechtsaussage, Schul-/Providerfragen nicht geprüft; PRIV20: bestehende Hold/Delete schützen Receipt, Cleanup gegen private Policy prüfen. Kein Vollscan/Gesamtfreigabenachweis.

## Stand und nächster Schritt
branch_only: Plan gesichert, produktiver Code unverändert. Keine CI/Integration/Deploy/Nutzerabnahme dieses Features. Nächster Schritt: fokussierte RED-Fälle schreiben und ausführen, dann enges serverseitiges Policygate implementieren.

## Checkpoint 1
28 tatsächliche Handler-/Securityverhaltenstests bestanden (8 neue Fälle zunächst rot: fehlender Callable). Neue private assessmentPolicies-Evidenz und configurePracticeSolutionRelease-Callable implementiert. Source-Policy allein gibt nichts frei; Token/ownsubmit/Delete/Hold und Prüfungsnachfrist bestehen. Staging-Functions müssen neues Callable mitdeployen und explizit verifizieren. UI noch offen; keine vollständige Fertigmeldung.

## Checkpoint 2 / vollständiger Implementierungskandidat
Private policy plus serverberechnete Inhalts-/Einstellungsrevision, bestätigter Practice-Publish, late release derselben veröffentlichten Runde, frozen Attempt/Submissionpolicy, Lösungssnapshot und separate hash-/revisiongebundene assessmentSolutionAssets implementiert. Keine aktuellen Audiofallbacks für alte Attempts ohne Bindungsbeweis. Große860KB-Audios vergrößern das private Attemptpayload nicht; Medien über950KB werden beim Snapshot ausgelassen, Textlösungen bleiben verfügbar. Quiz-Löschtrigger entfernt Policy+Assets auch ohne verbleibende Attempts. Alle Receiptwege sind bei late release konsistent; Submit-Transaktionsresultat stammt aus finalem Callback.

Editorpolicy, Drafts und Duplikate erhalten Auswahl. Dashboard+Editor+Wiederöffnen nutzen denselben Practicepublisher; DefaultExam behält bestehende Veröffentlichung. Neue Prüfungshinweise nur wenn Lösungen unmittelbar verfügbar werden. Schüler: Warten auf Freigabe / Lösungen anzeigen ausschließlich aus Serverreceipt, kein neues Polling. Optionale späte Teacherfreigabe im Publishview. Deutsche Copy und Englischquelle ergänzt; bestehende29CrewPNGs/164Assetpfade bleiben.

Fokussiert:33Backend/Security/Cleanup+24Frontend (inkl13neuer Behaviorcases) grün unter bundledNode24.19.0; Node22/exakteCI noch ausstehend. RED-Belege:8fehlendeBackendfunktionen,2realeAudiogrenzfälle,4realePublishwege,2Schülerzustände,3LateReceipt/Cleanupfälle. Vollsuiten/Syntax/Build unmittelbar als nächster Schritt, danach unabhängiger exakter Kandidatenreview. Kein CI-/Deploy-/Nutzertestbeleg dieses Standes.
