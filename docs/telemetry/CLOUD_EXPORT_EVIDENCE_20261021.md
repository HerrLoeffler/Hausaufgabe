# GC-ANALYTICS-01 — tatsächliche Functions-Herkunft

Read-only Cloudprüfung am 21.10.2026, vorhandene Firebase-CLI-Anmeldung. Keine Deployment-/Secretänderung. Quellarchive versionsgebunden ausschließlich im RAM heruntergeladen; ZIP-Einträge nur main.js, package.json, lib/crew-telemetry.js, lib/posthog-telemetry.js geöffnet. Keine .env, private Konten oder Payloads geöffnet. Hilfsscripts: metadata.cjs, source-proof.cjs. Firebase-CLI-APIbibliothek statt nicht installiertem gcloud verwendet.

## Frisches Inventar

hausaufgabe-staging:58; gradecrew-staging-2026:44; beide Ziel-Funktionen ACTIVE, gcfv2, nodejs22, europe-west1, codebase ai.

| Projekt/Funktion | updateTime UTC | Revision | source generation | Adapter-SHA256 | tatsächliches Projektgate |
|---|---|---|---|---|---|
| hausaufgabe-staging/crewAssistant | 2026-10-13T13:05:26.178934608Z | crewassistant-00071-ged | 1791896705173213 | 197bf2a1c5ab9736c7f34ffd26d21bdfbeb193e4b1a92783a1e52e673610c644 | hausaufgabe-staging |
| hausaufgabe-staging/recordCrewTelemetry | 2026-10-18T19:45:08.896045016Z | recordcrewtelemetry-00068-yey | 1792352696108723 | 49d6a3dcb28896830b96ddf197f765195773031093792ab0f51e5d458e19b347 | gradecrew-staging-2026 |
| gradecrew-staging-2026/crewAssistant | 2026-10-18T20:01:12.115143565Z | crewassistant-00002-nir | 1792353661239606 | 49d6a3dcb28896830b96ddf197f765195773031093792ab0f51e5d458e19b347 | gradecrew-staging-2026 |
| gradecrew-staging-2026/recordCrewTelemetry | 2026-10-18T20:01:02.254261645Z | recordcrewtelemetry-00002-qoh | 1792353647702349 | 49d6a3dcb28896830b96ddf197f765195773031093792ab0f51e5d458e19b347 | gradecrew-staging-2026 |

Beide Adapter haben environment="staging", kein source_project. Konfiguration/Existenz/Wert des PostHog-Tokens wurde NICHT geprüft. Somit Schul-crewAssistant exportfähig, erfolgreicher aktueller Export nicht allein hieraus bewiesen.

Alle vier Archive: main.js SHA256483b469a99dd55dd247c08cdb208c7492c3425b596d62838726fea3d4aae4cbf, crew-telemetry.js SHA25657d1620152cbe35a13c3ce78d5659a29f07862a4774e087269bf716e37fad2e3, package.json SHA2568393b837614e75cf18a0002a04f953f381d4c141ea90ff5b80722960968d5550.

SchulcrewAssistant Archiv-SHA25686b73d6433da75cf729c74f34ffafcdd954a0522bbacd7f96387e8560d89a557. Andere drei Archiv-SHA25651789bfa4630a065815940d16e162d7fbe3acd9229d40732b9a1de659e061b41.

Cloud source buckets: Schule gcf-v2-sources-950775032930-europe-west1; Test gcf-v2-sources-840345136563-europe-west1; object jeweils FUNCTION/function-source.zip, Generation wie oben.

## Vollständige Namenlisten (Nichtlösch-Vergleichsbasis)

Schule:
aggregateBugFeedback,analyzeMaterial,cancelLearningVariant,cleanupAssessmentPrivateOnQuizDelete,cleanupCrewTelemetry,cleanupLearningData,cleanupSecureTelemetry,cocoSupport,configurePracticeSolutionRelease,crewAssistant,developLearningSession,executeAdminAccountAction,expireAiTestJobs,fastQuizApi,fehlerjagdApi,generateEscapePreview,generateLearningBuffer,generateLearningVariant,generateQuestionAudio,generateQuestionMedia,generateQuestionSolutionAudio,generateTest,getAiStatus,getAssessmentInfo,getAssessmentReceipt,getBugOpsSummary,getCrewTelemetrySummary,getLearningDraft,getQuestionAudioDrafts,getQuickRemySubmission,prepareLearningDraft,prepareQuickRemy,previewAdminAccountAction,processAiTestJob,processLearningBuffer,publishLearningDraft,purgeAiUploads,purgeRightsReportRates,recordCrewTelemetry,recordSecureExamTelemetry,regenerateQuestion,reportRightsIssue,requestLearningRefill,resumeAssessmentAttempt,reviewMode,reviseWholeTest,secureTelemetrySubmission,startAiTestJob,startAiTestVariantJob,startAssessmentAttempt,startLearningSession,stepLearningSession,submitAssessmentAttempt,submitQuickRemy,syncQuestionAudioDrafts,testRallyeApi,testRallyeCleanup,vocabRushApi

Test:
aggregateBugFeedback,analyzeMaterial,cleanupAssessmentPrivateOnQuizDelete,cleanupCrewTelemetry,cocoSupport,configurePracticeSolutionRelease,crewAssistant,executeAdminAccountAction,expireAiTestJobs,fastQuizApi,generateQuestionAudio,generateQuestionMedia,generateQuestionSolutionAudio,generateTest,getAiStatus,getAssessmentInfo,getAssessmentReceipt,getBugOpsSummary,getCrewTelemetrySummary,getQuestionAudioDrafts,getQuickRemySubmission,learningBrainCatalog,learningBrainProfile,learningBrainStart,learningBrainTurn,prepareQuickRemy,previewAdminAccountAction,processAiTestJob,publishChapterAssessment,purgeAiUploads,purgeRightsReportRates,recordCrewTelemetry,regenerateQuestion,reportRightsIssue,resumeAssessmentAttempt,reviewChapterAssessment,reviewMode,reviseWholeTest,startAiTestJob,startAiTestVariantJob,startAssessmentAttempt,submitAssessmentAttempt,submitQuickRemy,syncQuestionAudioDrafts

## Deploymentgrenzen

- tools/deploy-release.mjs erlaubt derzeit ausschließlich Zweierselector reviewMode+recordCrewTelemetry. Für crewAssistant ist gezielt geprüfte Erweiterung nötig; breites Schul-functions:ai bleibt gesperrt (alte Learningexports fehlen im Source).
- Main staging-functions.yml gated auf STAGING2026_FUNCTIONS_WIF_PROVIDER. Manueller dispatch nur Pool-Dreierumfang, kein Analytics-Scope.
- Vorhandener collect-ai-source.py wäre ohne Anpassung ungeeignet: fest processAiTestJob/Testprojekt; Root-Allowlist lässt main.js aus.

## Runtimekonfiguration und Erhalt bestehender Konfiguration

Prüfung der Boolean-Präsenz POSTHOG_PROJECT_TOKEN / POSTHOG_SCHOOL_PROJECT_TOKEN / POSTHOG_SCHOOL_ENABLED / GC_SOURCE_RELEASE / GC_TEACHER_ANALYTICS_ENABLED sowie Secret-Referenzen am 21.10 durch automatische Approval-Prüfung abgewiesen, bevor ausgeführt. Begründung: das Laden der Envwert-Map überschreite die bisherige Lesebegrenzung; wertfreier Metadatenpfad erforderlich. Kein Workaround oder indirekter Retry. Konfigurationspräsenz, Flags und gültiger Releasewert bleiben unbekannt. Die vorherige Code-/Provenanceprüfung gibt darüber keinen Beleg. Für diese Prüfung ist entweder ein tatsächlich wertfreier Anbieterpfad oder ausdrückliche Erweiterung der erlaubten Metadatenprüfung erforderlich; keine Secretwerte im Chat.

Unabhängige lokale Sourceanalyse Firebase-CLI (Version15.34.0, installierter pnpm-Cache):
- lib/deploy/functions/prepare.js:404–417 inferDetailsFromExisting: vorhandene Envwerte werden mit gewünschten Envwerten zusammengeführt, wenn usedDotenv false ist. Merge gilt pro bestehendem Endpoint.
- prepare.js:257 setzt codebaseUsesEnvs bei hasUserEnvs(userEnvOpt) ODER hasEnvsFromParams; prepare.js:324 übergibt diesen Wert an inferDetailsFromExisting.
- lib/functions/env.js:179ff findEnvfiles/hasUserEnvs bestimmt vorhandene passende Dateien; auch leere passende .env kann also das Erhaltungsbranch deaktivieren.
- lib/gcp/cloudfunctionsv2.js:127ff updateFunction erzeugt fieldMask inklusive serviceConfig.environmentVariables und serviceConfig.secretEnvironmentVariables: nicht auf partielles Cloudmap-Merge vertrauen.

Damit: selektiver Source-Neudeploy bestehender Endpoints OHNE passende dotenv und OHNE neu aufgelöste Envparams erhält die vorhandene Runtime-Envmap über CLI-Inferenz. Mit neuer .env (auch nur GC_SOURCE_RELEASE=<SHA> etc.) kann dagegen die bisherige Karte ersetzt und PostHogkonfiguration entfernt werden. Existing-Envmerger allein ist keine neue Analyticsaktivierung und kein Nachweis vorhandener Konfiguration. Keine Secretwerte extrahieren, zurückschreiben oder neue .env aus bestehenden Envwerten erzeugen.
