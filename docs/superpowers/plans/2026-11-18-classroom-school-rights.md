# GC-CLASSROOM-01 – Schulanschluss und Klassenrechte

> **For agentic workers:** Use superpowers:executing-plans task-by-task. Existing Classroom task/worktree; no second license authority.

**Goal:** Canonical school memberships connect explicitly to the existing Classroom namespace, preserving pupil identities/codes/assignments; confirmed teachers select their classes and only those pupil lists/codes become available.

**Architecture:** New server-only school-access wrapper around the unchanged Classroom core. Resolve canonical membership using Billing's exact SHA256(JSON-array) member key, protected pilot config, verified active Auth identity and explicit school binding. Authorize every teacher mutation again inside its Firestore transaction. Pupil/Secure session paths remain unchanged. Existing unbound single-owner classrooms continue to work. No copying of local real ASV data or automatic name/email matching.

**Tech Stack:** Existing Node22 Functions/Firestore/Auth and existing2026 Web UI.

**Spec:**18Nov authorized continuation of pilot plan, owner-confirmed Billing contractd83f7868, existing self-service class choice decision21Oct. Martin explicitly chooses synthetic accounts for current acceptance; no second real teacher account available.

## Global Constraints

- Only2026. No Production, new Auth accounts/passwords, paid generation or IAM/Stripe changes.
- Billing membership is canonical; Classroom binding maps its schoolId to existing physical Classroom id, not a copied membership/seat ledger.
- School binding requires actual administrator roles in both existing namespace and selected canonical school, verified identity, closedpilot permission and explicit confirmation. New school namespace only if none exists. No silent merging of two existing namespaces.
- An active member chooses own classes. Before choice no pupil names/codes. Catalog names/year only. School administrators may administer all classes; private colleague tests stay owner-bound.
- Names, codes, pupil IDs, assignments, normal teacher auth and historical quizzes retain current values. Pupil submission/receipt/device protocols unchanged.

## Review Focus

- Revocation after a request begins must abort its transactional mutation; stale membership cannot survive via old classroomMembers fallback.
- Malicious physical school/class IDs, revoked/disabled/unverified accounts, closedpilot exclusions and another tenant deny access.
- Class selection does not grant quiz ownership; no access to colleague LIVE controls, results or private tests.
- Concurrent binding/selection/createClass operations preserve the unique binding and selected class set.
- Existing pupil login/receipts and unbound teacher workflows remain compatible.

### Task1: Canonical binding and authorization

- [x] Actual deployed classroomWeb source captured; existing3Classroom modules exactly match local baseline. Revisionclassroomweb-00007-ruf,39sourcefiles.
- [ ] RED/GREEN synthetic adapter tests: explicit binding, legacy preservation, chosen classes, empty initial access, wrong school/class, repeated binding, denied merge, admin roles, revoked/suspended/unverified/closedpilot, transaction revocation and ownership guards.
- [ ] Add assessment-functions/lib/classroom-school-access.js; minimal wrapper export in classroom-service.js and fresh Auth identity/transaction list support in classroom-functions.js. Do not duplicate Billing code/seat records.
- [ ] New commands connectSchool and setTeacherClasses with strict field allowlists; existing teacher commands accept explicit schoolId. Server chooses identity/role, never payload role.
- [ ] Add real local Firestore/Auth/Rules acceptance for two synthetic teachers and second school; existing pupil and device tests remain green.

### Task2: Existing interface

- [ ] Add small classroom/school-connection-panel.mjs using existing classes: explicit school binding, school switch where needed, searchable class choice, clear save/empty/error states. Legacy setup stays available.
- [ ] Add optional getSchoolId context to existing online client; reset selected school/classes on auth change. No change to pupil token or normal Firebase login.
- [ ] Preserve whole actual Hosting payload/config on publish. Add only owned assets; no222file Billing builder release onto canonical666file site.
- [ ] Browser acceptance phone/tablet/desktop using synthetic component data; no actual school binding or roster transfer without concrete teacher confirmation.

### Task3: Checkpoint and next slice

- [ ] Review scoped immutable source, save evidence/handoff, deploy only exact preserved2026Classroom candidate if checks pass; document actual backend/Hosting versions separately.
- [ ] Next authorized slice: normalized CSV preview+confirmed idempotent online import, after this school/class authorization exists. This task does not claim Onlineimport completion or physical Secure acceptance.

Fresh mainbedac7e5; latest DevelopmentStatus44411424208 success onc145af98; subsequentmain change onlySecure documentation. No overlap withBilling files (read-onlycontract). CurrentprimaryClassroombranch unchanged; existing node_modules link preserved. Runtime actualmodel/effortunknown; sameTask/attempt history and original budgets retained.

Execution checkpoint19Nov: Tasks1/2 implemented, scopedreviewP1fixed9ad18d39, finalsource2f662ee7 deployed2026. Actualreceipt includes144/97/3tests,41filesperfunctionverified,667Hostingfileswith662others/configpreserved,normalAdminbrowser19tests/2classesretained. Explicitreal-schoolbinding,onlineCSVandphysicalSecureacceptance remainopen.
