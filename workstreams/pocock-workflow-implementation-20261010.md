# GC-POCOCK-IMPLEMENT-01 — Arbeitsablauf-Integration

10.10.2026 UTC; Fachchat GC · Automatisierung & Integration 01a1089e-bbae-74c2-9a6a-6ce71fb3dba7. Originalfamilie GC-POCOCK-RESEARCH-01. Martins begrenzte Implementierungsfreigabe über Zentrale01a10df6-736b-7a62-bd38-2724cf254c2e; keine erneute Grundsatzfreigabe.
Branchfeat/gc-pocock-workflow-20261010, Basis/main91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9, isolierterCheckout /Users/martin/Documents/Codex/2026-10-04/weiter-mit-gradecrew-nach-einem-chat/work/gradecrew-pocock-implement-20261010. Zielmain; Produkt-/Release-Train unverändert.

## Autorisiertes Design
VorhandeneHandoffs erhalten opt-inJSONbrief, registry bleibtZuordnung. ReinlesenderPrüfer berechnet offene/unblocked/claimedFrontier; keinController/Lock/Agent-/Provider-/Statuswriter. FehlerhafteBriefs, unklareIDs/Graphen/Claims/Source/Abnahme und unbekannte/laufende externeErgebnisse nicht alsready ausgeben. EigenesPaket durchläuft Brief/Decision/Reviewachsen/PR/Retro; vierPiloten: hierTooling/Decision/PR/Retro plus separatROOTWeb/NativeQA. [Plan](../docs/superpowers/plans/2026-10-10-pocock-workflow-implementation.md).

```gradecrew-brief
{
  "schema_version": 1,
  "task_id": "GC-POCOCK-IMPLEMENT-01",
  "parent_task_id": "GC-POCOCK-RESEARCH-01",
  "goal": "Prüfbare Briefs/Frontier und angewandte Review-/PR-/Retroprozesse in vorhandenen Ablauf integrieren",
  "owner": "01a1089e-bbae-74c2-9a6a-6ce71fb3dba7",
  "source": {
    "branch": "main",
    "commit": "91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9"
  },
  "scope": {
    "allowed_paths": [
      "docs/workflow/",
      "tools/workstream_checks.py",
      "tools/test_workstream_checks.py",
      ".github/PULL_REQUEST_TEMPLATE.md",
      ".github/workflows/handoff-check.yml",
      "workstreams/pocock-workflow-implementation-20261010.md",
      "workstreams/TEMPLATE.md",
      "workstreams/registry.json",
      "START_HERE.md",
      "AGENTS.md",
      "docs/CHAT_CONTRACT.md",
      "TODO.md",
      "GRADECREW_STATE.json"
    ],
    "excluded_actions": [
      "deploy",
      "paid_calls",
      "security_scan_or_recovery",
      "npm_inventory_export",
      "product_refactor",
      "automatic_skill_rewrite",
      "other_owners_web_qa_workflow_or_sources"
    ]
  },
  "acceptance": [
    "Validiertes CLI meldet nur offene unblocked claimed Entscheidungen",
    "Unklare/laufende Vorgänge verhindern Resumptionsbereitschaft; History/Budget unverändert",
    "Verhaltenstests+vorhandeneHandoffCI+zweiunabhängigeReviewachsen am exakten Kandidaten",
    "Alle6+ zuordnen; externeQA/Skills nicht doppeln"
  ],
  "decisions": [
    {
      "id": "baseline",
      "status": "answered",
      "blocked_by": [],
      "claimed_owner": "01a1089e-bbae-74c2-9a6a-6ce71fb3dba7",
      "answer": "main91f52ec;114Automationtests mitbundledNode grün; ersterfehlenderNode separat erhalten"
    },
    {
      "id": "implement",
      "status": "open",
      "blocked_by": [
        "baseline"
      ],
      "claimed_owner": "01a1089e-bbae-74c2-9a6a-6ce71fb3dba7",
      "answer": null
    },
    {
      "id": "review",
      "status": "open",
      "blocked_by": [
        "implement"
      ],
      "claimed_owner": null,
      "answer": null
    },
    {
      "id": "integrate",
      "status": "open",
      "blocked_by": [
        "review"
      ],
      "claimed_owner": "01a1089e-bbae-74c2-9a6a-6ce71fb3dba7",
      "answer": null
    }
  ],
  "recovery": {
    "next_step": "Kontrakte und Prüfer umsetzen; exakten Review/CI prüfen",
    "operations": [],
    "budget": {
      "mode": "no_paid_calls",
      "reservation_ids": [],
      "attempt_history_ref": "workstreams/launch-controls-preservation-20261010.md"
    }
  },
  "review_axes": {
    "requirements": {
      "status": "pending",
      "reviewer": null,
      "evidence": []
    },
    "standards": {
      "status": "pending",
      "reviewer": null,
      "evidence": []
    }
  }
}
```

## Einmaliger Iststand / Delta / Owner / Abnahme
| Cluster | Thema / Iststand | Deltaowner / konkreterTrigger | Abschlussbeleg |
|---|---|---|---|
| brief | Auftragsbrief, Prioritäten, abhängige Fragerunden: Handoff vorhanden, kein Briefvalidator | Hier: kanonischerBrief+Check; Fragen nur neue wesentliche ungeklärte Präferenzen | CLI negatives+Realpaket/PR |
| frontier | Decisionfrontier/Prototyp: Kein prüfbarer claim-/dependencyIndex; vorhandene Prototypen separat | HierGraphcheck; Pluginschat Wayfinder/Prototype. Ungelöste Darstellung/Enginefrage→Game/Webowner, Nutzerverdict | RealCLI frontier/blocked/unknown; Plugin-/QAoriginalbelege ausstehend |
| handoff | Handoff/Recovery/Context: CHAT_RECOVERY/Commits/Budgets vorhanden, Abbrüche mit unbestätigtenTests | HierSource/laufendeIDs/History/Budgetbrief+Checkpoint; keineMemoryDB | EigenerCommit/PR+read-onlyCLI;209Testbericht unbestätigt |
| runtime | Runtime, NativeQA, Lern-/Gerätequalität: CI/isolierteQuellen vorhanden; kein pauschalerLive-/Gerätetest | ROOTWebQA remotec3a5fdcf vsfremdaktiv e9cc5ae; ROOTnativeQA PR175a5dc474 vsaktiv2496a85; aktiveCheckouts unberührt, GameET01a12571/Pizza separat | SourcegebundeneQAartefakte ausstehend; hier keineNativeQA |
| review | Reviewachsen/PRerklärung: Reviews vorhanden, gemeinsamePRvorlage fehlt | HierTrigger/VorherNachher/Realbeleg/Scope/Rückrollfolge+Requirements/Standards; Pluginschat adaptedReview | EigenerPR+unabhängigeZweiAchsenbefunde |
| retro | Retro→deduplizierteChecks: KeinBrief/Graphcheck; bestehendeAutomation-/Release-/Telemetriechecks | HierrealeSessionRetro maximal3Befunde→einenCheckanschließen; Plugin adaptedRetro | RED→GREEN CLI +HandoffCIstep; keinSelfrewrite |
| domain | Domainbegriffe/ADR/Hotspots: BestehendeTask/Attempt-/Gameverträge; kein neu belegterHotspot | ZuständigerImplementer bei tatsächlichem Normal-/Randfall-Missverständnis oder überraschendemTradeoff; konkreteCaller/Testseams, keinePflichtADR/Großrefactor | Vertrags-/Caller-/Regressionsbeleg imbetroffenenFachauftrag; keineProduktlückeerfunden |
| learning | Teach/Onboarding/Handoff+Teach: Fachrollen/Skills vorhanden; keine gemessene konkreteWissenslücke | Pluginschat schlankeAnleitung für wiederkehrende konkreteUnreal/Firebasewissenslücke; Lernziel+Anwendungsaufgabe, keinCocoMemoryumbau | Anleitung/Trigger verfügbar; Lernerfolg erst in echterLernaufgabe |
| models | AdaptiveModel/Effort/Quellenkontrolle: AGENTS-Regel,28tatsächlicheSkillhashes; requested/observed getrennt | Hier Source/Review/Runtimeangaben; kleineresModel nur abgegrenzte risikoarmeAufgabe, keineToken-/Preisschwellen | NodePATHdiagnose; ReviewSolmedium requested/actualunknown; Einsparung unbekannt |
| docs | Doku-Duplikate/geeigneteBibliotheken: STATE/registry/Handoff getrennt; historischeQuellenbewusst erhalten | Hier einGuide+thinLinks+stdlib/alteChecks. Nur bei belegtemDrift betroffeneErklärkopie konsolidieren; Audit/Recoveryhistorie erhalten | CanonicalGuide+stdlibPrüfer+unveränderteHistorie/Sourcepins |

## Alle32Videoempfehlungen6+
Snapshot des integrierten40Video-Berichts, genau eine Zuordnung je6+-ID. Cluster oben enthält benanntenOwner/Trigger/Beleg; kein zweiterProjektstatusstore und keine pauschaleSpäterablage.
| Video-ID / Wert | Konkrete berichtete Anwendung | Delta/Trigger/Ownercluster |
|---|---|---|
| BsJGo1wFTvQ · 9/10 · jetzt | Vorhandene PR-/Reviewvorlage schärfen; keine automatische Umweltänderung. | review/retro |
| gaDdrDdczO4 · 8/10 · jetzt | Ein bestehendes Fachbriefing kürzen und echte Entscheidungen bündeln. | brief |
| F3lL98Pj90o · 8/10 · gezielt | Eine tatsächlich offene Gamesfrage bis zur kurzen Spec klären. | frontier |
| n0VhIVtviC0 · 9/10 · jetzt | Native Gameinteraktion oder 2–3 Webvarianten vergleichen; getrennt sichern. | frontier/runtime |
| M6mYodf0dJM · 7/10 · gezielt | Fach-Onboarding; Superpowers und vorhandene Gates weiterführen. | learning/brief/review |
| A8mokin_YOs · 8/10 · gezielt | Abhängigkeiten und zwei Reviewachsen im vorhandenen Auftrag sichtbar machen. | frontier/review |
| s5T5oQJcJ6U · 7/10 · später | Optionales Unreal-/Firebase-Onboarding; kein direkter Coco-Umbau. | learning |
| mh5XZ-L5SFQ · 7/10 · gezielt | Höchstens drei Kandidaten an aktivem Game-State-Hotspot mit Verhaltenstest. | domain |
| UzMNBN6xLLA · 9/10 · jetzt | Spielgefühl prototypisieren; Fakten recherchieren, Präferenzen Martin überlassen. | brief/frontier |
| dtAJ2dOd3ko · 8/10 · jetzt | Knappe Fachaufträge in dauerhafter bestehender Recoveryspur. | handoff |
| 6BB6exR8Zd8 · 8/10 · gezielt | Attempt/Ergebnis/Reset an Normal- und Randfall klären; keine pauschale DDDpflicht. | domain |
| DNqsMXH6Eog · 7/10 · gezielt | Knappe Übergabe mit Prototypverdict; dauerhafte Belege beibehalten. | handoff/frontier/review |
| MzWIIlx0Gpc · 8/10 · gezielt | Bestehende BugOpsmeldungen bündeln; Auftragsreife von Freigabe unterscheiden. | brief/domain |
| 3MP8D-mdheA · 8/10 · gezielt | Belegten häufig geänderten Hotspot vereinfachen; kein periodischer Großrefactor. | domain |
| MN9dGgmLyso · 9/10 · jetzt | Ein vorhandenes Runtimeprüfrezept reproduzierbar machen; mechanische Fehler abfangen. | runtime |
| zcLPGC-tvgk · 8/10 · gezielt | Eine echte Nutzersequenz; gegebenenfalls begrenzter Mutation-/Dependencycheck. | runtime/domain |
| 251hsWgoTPM · 8/10 · gezielt | Entscheidungspilot eng halten; vorhandene Engine/UI nutzen und Restarbeit sichtbar lassen. | frontier/runtime |
| K-mA3MZ_EzU · 7/10 · gezielt | Offene Begriffe mit zwei Fällen klären; Zeitgrenze vor weiterem Planpolieren. | domain/brief |
| LGj1oUidC7Q · 8/10 · jetzt | Ziel, Grenzen und beobachtbare Abnahme kurz im Fachauftrag. | brief |
| 0l7zOp260yc · 7/10 · gezielt | Neue Games an vorhandene Firebase-/Web-/Unrealverträge binden. | domain |
| sOd7svdu_1I · 7/10 · gezielt | Relevante Quellen und kurze Fachpakete statt universeller Tokenzahl. | handoff |
| Yn8h5Ip-L9c · 8/10 · jetzt | Bestehende unabhängige Gates erhalten, kleine Aufträge knapp halten. | review |
| tLyfDIt9wHg · 7/10 · gezielt | Wenige echte Produktfragen pro Runde; keine neue Interviewpflicht. | brief |
| 32LyZyFQhCQ · 8/10 · jetzt | Gezielte Fachskills auswählen; vorhandene Superpowers nicht doppeln. | docs |
| A0scuiiGBC4 · 8/10 · gezielt | Kontrollierte Projektquellen erhalten; Coco-Memory daraus nicht abschaffen. | docs/handoff |
| eEjBhVI9Qok · 8/10 · gezielt | Aktive Web-/Game-/Firebasegrenzen prüfen; kein Rewrite allein aus Prinzip. | domain |
| Fj8DKMbdIzU · 8/10 · gezielt | Überholte Erklärkopien bereinigen; Tasks/Release-/Recoverybelege behalten. | docs |
| e-pFrQ_Rh0s · 6/10 · gezielt | Martins Aufmerksamkeit auf wenige echte Entscheidungen bündeln. | brief |
| SF1Ab0Y-9BY · 7/10 · gezielt | Adaptive verfügbare Modelle/Effort mit festen Abnahmen beobachten. | models |
| H-JHumbpORI · 8/10 · jetzt | Zugriff/Fakten/Scope prüfen und Behauptungen an Originalbelege binden. | models |
| iQb3F9UzBR4 · 8/10 · jetzt | Bestehende Schwierigkeitsregel anwenden, höchstens zwei begründete Wechsel. | models |
| 8WLi98SEdeU · 6/10 · später | Unreal-/Firebase-Verständnis außerhalb aktiver Umsetzung lernen. | learning/handoff |

## Unmittelbare Skills-/Reel6+
| Empfehlung | Iststand/Grund | Owner/Trigger/Abnahme |
|---|---|---|
| RollenSkills9 undGesamtSkill6: historischeAlternativen | AktuelleProjektrollen+gezielteFachfähigkeit ersetzenAlternativen; SuitevermischungRechte | Pluginschat01a10e37 adaptiertFähigkeiten; konkreteRollen-/Triggerprobe, keineRuntimehookinstallation |
| GradeCrewDesign9 / frontend-design8 | PR193/195 integriert,28lokaleQuellhashesgleich, keineGrafikabnahme | Web/Designowner bei echterUIänderung: Tokens+Referenz, echteRender-/Nutzerbelege; hierkeinRewrite |
| Plan/Review9 | FreigegebeneraktuellerPlan+isolierterSourcecheckout | Hier konkreteTests/Review/PR; neueProduktpräferenz überROOT, keinRoutineinterview |
| SelektiveMatt7 | Komplettpaket3verworfenen; vierangepassteFähigkeiten beauftragt | Pluginschat exklusivWayfinder/Prototype/Review/Retro; tatsächlicheTrigger-/Verhaltensbelege, keinezweiteInstallation |
| ClaudeSecurityReviewer6 | Kandidat; zusätzlichesProviderbudget/Workflow-/Kommentarrechtfehlt; stopptesSecurityaudit erhalten | Security/Toolingowner erst bestätigteZusatzlücke+expliziteProvider-/Workflowfreigabe; keinCall/Scan/Einbau odernpmUmgehung |
| Firebaseofficial9 | SechsstandaloneSkills tatsächlichPR193/195, andereHosts/Cloudfunktionungeprüft | Auth/Rules/Firestore/Hostingfachchat beimkonkretenAnlass innerhalbGates; Source/Emulator/Zielbeleg |
| GeeigneteBibliotheken9 | stdlibgenügt, keinefehlendeBibliothek genannt | Implementer bei echtemBedarf Lizenz/Plattform/ACL/Größe qualifizieren; hierkeinInstall/Export |

## Ownership / reale Erkundung
SharedSTART/AGENTS/CONTRACT/TODO/STATE/registry exklusivhier. Pluginschat01a10e37 behältSkills; ROOTWebQA .github/workflows/ai-staging-check.yml, tools/ui/web-runtime-*, docs/qa/web-runtime-* reserviert. ROOTnativeQA nutztPR175remotea5dc474; aktivfremd2496a85/WorldArt nichtberühren. Webremote c3a5fdcf vsfremdaktive9cc5ae mitdirtyÄnderungen: keineLivegleichheitbehaupten. AktiverGameET01a12571/Pizza nichtdoppeln.
main91f52ec undLiveDevelopmentStatus38082459652/offenePRs gelesen; bekannteWarnungen bleiben. Kein konkurrierenderBriefvalidator/PRtemplate. NativeworktreeToolNotagitrepository; regulärbewilligtesNetworkpermission fürisoliertenpublicGitclone, keinResetfremderQuellen.
ErsterBaseline114Tests/2Fehler (test_invalid_changed_javascript_cannot_use_other_green_tests; test_real_git_candidate_and_physical_package_create_exact_bound_report): NodefehltimPATH. GleicherLaufmitbundledNode114/114grün, keineCodeänderung. Logs/private/tmp/gc-pocock-baseline.log undgc-pocock-baseline-node.log; vorherigeFehlernichtverschweigen.

## Wiederaufnahme / nächsterSchritt
CheckpointPlan/Registrierung, nochkeinValidator-/QAerfolg. Eigene externeOperationen keine; ROOTQAgetrenntIDsnochunbekannt nichtneustarten. Paidbudget0/keineReservierungen; Security/npmstopps erhalten. NächsterSchritt TestsRED→PrüferGREEN→bestehendeCI/exakterunabhängigerReview→autorisierterMainmerge.
