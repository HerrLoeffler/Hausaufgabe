# Secure selected AppIcon Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the icon of submitted Secure1.0(1192) with Martin's exact selected GC/through-C-lock/Secure image and prepare the updated Apple build plus an unsent review reply.

**Architecture:** Start from exact submitted source24c0f856. Store the selected normalized opaque PNG in Secure/Brand and copy it unchanged into the generated AppIcon, while retaining the original in-app GradeCrewLogo rendering. No new runtime features.

**Tech Stack:** PNG, existing Swift/AppKit asset preparation, existing Python/Swift/Node gates and signed TestFlight workflow.

**Spec:** Martin's explicit attachment and implementation request18.11.2026; previous icon findings in design/secure-icon-20261118 docs/secure/icon-20261118/README.md.

## Global Constraints
- de.gradecrew.secure, marketingVersion1.0, iOS/iPadOS17, both1,2devicefamilies; AAC/signing/LiveAPI/offline logic unchanged.
- TeacherApp52 and SecureTest separate; no shared logo/teacher source edits, no Web/Rules/Functions deploy.
- Exact chosen image, including its through-C shackle, only resized to1024 and opaqueRGB. Do not replace it with the alternate closed-shackle draft.
- No Apple reply sent and no final AppReview submission authorized in this request; prepare both.

## Review Focus
- prepare_assets must not overwrite the new AppIcon with the shared Teacher logo.
- In-app36px GradeCrewLogo must retain old pixels rather than acquire a tinySecure caption.
- New PNG must be opaque1024RGB and distinct from TeacherAppIcon.
- Pipeline must keep complete native/phone/tablet/WebKit/AAC gates; no bypass after failures.
- Source must stay icon-only relative to1192; later personal-access/Test2026 features not silently included.

### Task1: deterministic selected-icon binding
**Files:** create native/GradeCrewSecure/Brand/SecureAppIcon.png; modify native/GradeCrewSecure/prepare_assets.swift; create ScriptTests/test_app_icon.py.
**Interfaces:** consumes selected opaquePNG; produces AppIcon bytes exactly equal to thatPNG and existing GradeCrewLogo bytes independently.
- [ ] Run old preparation and regression asserting generatedAppIcon==selectedPNG and generatedAppIcon!=GradeCrewLogo; observe failure.
- [ ] Change only AppIcon write to selectedPNG; retain originalpng forGradeCrewLogo; require selectedimage1024/noalpha.
- [ ] Rerun preparation and assetregression plus existing release/buildsource tests; inspect actualexport and diff.
- [ ] Commit bounded change and preserve native sourceidentity. Fresh independent final review before release.

### Task2: existing complete release gates and Apple preparation
**Interfaces:** consumes reviewed immutableTask1SHA; produces signednewBuild attached toSecureAppStoreversion and unsentreply.
- [ ] Secure fresh branch/commit onGitHub; exacttreecompare. Check no competingSecureworkflow and dispatch existingworkflow once for exactbranch/live.
- [ ] RecordrunID immediately, follow allgates; targetedinfra retryonlyafterdiagnosis, neverweaken gate. Verify signedAAC/app/profile/bundle/Liveproject and actualuploadnumber fromlogs.
- [ ] WaitAppleprocessing; inspect actualnewbuildicon, attach to rejectedversion1.0; preserveprice/countries/privacy/revieweraccess.
- [ ] Save unsentEnglishresponse referencing4.3(a), two distinctapps, samefamilybranding, addedlock/Secure. Do notclaim acceptance/live; state anyremainingactualblocker.
